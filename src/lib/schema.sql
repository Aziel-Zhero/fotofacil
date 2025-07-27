-- 1. Tipos Enum para padronizar status
DROP TYPE IF EXISTS public.album_status;
CREATE TYPE public.album_status AS ENUM (
  'aguardando_selecao',
  'selecao_completa',
  'entregue',
  'expirado'
);

DROP TYPE IF EXISTS public.plan_type;
CREATE TYPE public.plan_type AS ENUM (
  'trial',
  'essencial_mensal',
  'essencial_semestral',
  'estudio_anual'
);

DROP TYPE IF EXISTS public.payment_status;
CREATE TYPE public.payment_status AS ENUM (
  'pendente',
  'pago',
  'falhou'
);

-- 2. Tabela de Fotógrafos (ligada ao Supabase Auth)
CREATE TABLE IF NOT EXISTS public.photographers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  birth_year INT,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  cpf TEXT UNIQUE,
  username TEXT NOT NULL UNIQUE,
  plan public.plan_type DEFAULT 'trial',
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '3 days',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.photographers IS 'Perfis dos usuários fotógrafos, vinculados ao sistema de autenticação.';

-- 3. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
  client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
  custom_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(photographer_id, email)
);
COMMENT ON TABLE public.clients IS 'Clientes associados a um fotógrafo específico.';

-- 4. Tabela de Álbuns
CREATE TABLE IF NOT EXISTS public.albums (
  album_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  password TEXT, -- Senha de acesso para o cliente
  storage_path TEXT, -- Caminho no Supabase Storage
  max_selection INT DEFAULT 0,
  bonus_photos INT DEFAULT 0,
  extra_photo_price NUMERIC(10, 2) DEFAULT 0,
  status public.album_status DEFAULT 'aguardando_selecao',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.albums IS 'Álbuns criados por fotógrafos para seus clientes.';

-- 5. Tabela de Fotos
CREATE TABLE IF NOT EXISTS public.photos (
  photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(album_id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tags TEXT[],
  order_number INT,
  selected_by_client BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.photos IS 'Cada foto dentro de um álbum.';

-- 6. Tabela de Seleção de Fotos
CREATE TABLE IF NOT EXISTS public.photo_selections (
  selection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(album_id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.photos(photo_id) ON DELETE CASCADE,
  is_bonus BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(album_id, photo_id)
);
COMMENT ON TABLE public.photo_selections IS 'Registra as fotos que o cliente selecionou.';

-- 7. Tabela de Logs de Acesso
CREATE TABLE IF NOT EXISTS public.album_access_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(album_id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(client_id) ON DELETE SET NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_ip TEXT,
  accessed_user_agent TEXT
);
COMMENT ON TABLE public.album_access_logs IS 'Logs de quando um cliente acessa um álbum.';

-- 8. Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.photographer_notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  related_album_id UUID REFERENCES public.albums(album_id) ON DELETE CASCADE,
  related_client_id UUID REFERENCES public.clients(client_id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.photographer_notifications IS 'Notificações para o fotógrafo.';

-- 9. Contadores automáticos para IDs personalizados
CREATE SEQUENCE IF NOT EXISTS photographer_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS client_id_seq START 1;

-- 10. Funções de Gatilho para criar perfis
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cria perfil apenas se o metadata indicar que é fotógrafo
  IF (new.raw_user_meta_data ->> 'role') = 'photographer' THEN
    INSERT INTO public.photographers (
      user_id,
      full_name,
      email,
      username,
      company_name
    )
    VALUES (
      new.id,
      new.raw_user_meta_data ->> 'fullName',
      new.email,
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'companyName'
    );
  END IF;

  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  photographer_user_id uuid;
BEGIN
  IF (new.raw_user_meta_data ->> 'role') = 'client' THEN
    SELECT user_id INTO photographer_user_id
    FROM public.photographers
    WHERE username = (new.raw_user_meta_data ->> 'photographer_username')
    LIMIT 1;

    IF photographer_user_id IS NULL THEN
      RAISE EXCEPTION 'Fotógrafo não encontrado para o cliente';
    END IF;

    INSERT INTO public.clients (
      photographer_id,
      full_name,
      email,
      phone
    ) VALUES (
      photographer_user_id,
      new.raw_user_meta_data ->> 'fullName',
      new.email,
      new.raw_user_meta_data ->> 'phone'
    );
  END IF;
  RETURN new;
END;
$$;

-- 11. Criação dos Gatilhos no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();

DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();


-- 12. Função e Gatilho para Notificações de Acesso
CREATE OR REPLACE FUNCTION public.notify_photographer_on_album_access()
RETURNS TRIGGER AS $$
DECLARE
  album_info RECORD;
  client_info RECORD;
BEGIN
  SELECT name, photographer_id INTO album_info FROM public.albums WHERE album_id = NEW.album_id;
  SELECT full_name INTO client_info FROM public.clients WHERE client_id = NEW.client_id;

  INSERT INTO public.photographer_notifications (
    photographer_id, type, message, related_album_id, related_client_id
  ) VALUES (
    album_info.photographer_id,
    'acesso_album',
    FORMAT(
      'Seu cliente %s acessou o álbum "%s".',
      COALESCE(client_info.full_name, 'ID: ' || NEW.client_id::text),
      album_info.name
    ),
    NEW.album_id,
    NEW.client_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_album_access ON public.album_access_logs;
CREATE TRIGGER on_album_access
  AFTER INSERT ON public.album_access_logs
  FOR EACH ROW EXECUTE FUNCTION public.notify_photographer_on_album_access();


-- 13. Segurança RLS (Row-Level Security)
-- Habilitar RLS em todas as tabelas relevantes
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para Fotógrafos
DROP POLICY IF EXISTS "Fotógrafos podem ver e editar seus próprios perfis" ON public.photographers;
CREATE POLICY "Fotógrafos podem ver e editar seus próprios perfis"
  ON public.photographers FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Fotógrafos podem gerenciar seus próprios clientes" ON public.clients;
CREATE POLICY "Fotógrafos podem gerenciar seus próprios clientes"
  ON public.clients FOR ALL
  USING (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Fotógrafos podem gerenciar seus próprios álbuns" ON public.albums;
CREATE POLICY "Fotógrafos podem gerenciar seus próprios álbuns"
  ON public.albums FOR ALL
  USING (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Fotógrafos podem gerenciar suas próprias fotos" ON public.photos;
CREATE POLICY "Fotógrafos podem gerenciar suas próprias fotos"
  ON public.photos FOR ALL
  USING (
    (SELECT photographer_id FROM public.albums WHERE album_id = photos.album_id) = auth.uid()
  );

DROP POLICY IF EXISTS "Fotógrafos podem ver as seleções de seus álbuns" ON public.photo_selections;
CREATE POLICY "Fotógrafos podem ver as seleções de seus álbuns"
  ON public.photo_selections FOR SELECT
  USING (
    (SELECT photographer_id FROM public.albums WHERE album_id = photo_selections.album_id) = auth.uid()
  );

DROP POLICY IF EXISTS "Fotógrafos podem ver os logs de seus álbuns" ON public.album_access_logs;
CREATE POLICY "Fotógrafos podem ver os logs de seus álbuns"
  ON public.album_access_logs FOR SELECT
  USING (
    (SELECT photographer_id FROM public.albums WHERE album_id = album_access_logs.album_id) = auth.uid()
  );

DROP POLICY IF EXISTS "Fotógrafos podem ver suas próprias notificações" ON public.photographer_notifications;
CREATE POLICY "Fotógrafos podem ver suas próprias notificações"
  ON public.photographer_notifications FOR ALL
  USING (auth.uid() = photographer_id);

-- Políticas para Clientes (Acesso de Leitura a Álbuns Compartilhados)
-- Aqui, a lógica de acesso do cliente seria controlada pela senha no nível do aplicativo.
-- A política RLS garante que, mesmo se autenticado, um cliente não pode ver álbuns que não são seus.
-- (Implementação de auth de cliente não está no escopo deste script inicial)
-- Por enquanto, vamos permitir leitura pública se o acesso for validado no backend.
DROP POLICY IF EXISTS "Clientes podem ver os álbuns aos quais têm acesso" ON public.albums;
CREATE POLICY "Clientes podem ver os álbuns aos quais têm acesso"
  ON public.albums FOR SELECT
  USING (true); -- Acesso controlado pela senha na API/backend

DROP POLICY IF EXISTS "Clientes podem ver as fotos de álbuns aos quais têm acesso" ON public.photos;
CREATE POLICY "Clientes podem ver as fotos de álbuns aos quais têm acesso"
  ON public.photos FOR SELECT
  USING (true); -- Acesso controlado pela senha do álbum na API/backend
