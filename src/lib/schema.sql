-- 1. Tipos personalizados (ENUMs) para padronizar valores
CREATE TYPE public.album_status AS ENUM ('aguardando', 'entregue', 'expirado', 'selecao_completa');
CREATE TYPE public.plan_type AS ENUM ('trial', 'essencial_mensal', 'essencial_semestral', 'estudio_anual');
CREATE TYPE public.payment_status AS ENUM ('pendente', 'pago', 'falhou');

-- 2. Tabela de Fotógrafos (ligada à autenticação do Supabase)
CREATE TABLE public.photographers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  phone TEXT,
  cpf TEXT UNIQUE,
  birth_date DATE,
  pix_key TEXT,
  plan plan_type DEFAULT 'trial',
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.photographers IS 'Perfis dos usuários fotógrafos, vinculados ao auth.users.';

-- 3. Tabela de Clientes
CREATE TABLE public.clients (
  client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_client_email_per_photographer UNIQUE (photographer_id, email)
);
COMMENT ON TABLE public.clients IS 'Clientes pertencentes a um fotógrafo.';

-- 4. Tabela de Álbuns
CREATE TABLE public.albums (
  album_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  password TEXT, -- Senha para acesso do cliente
  storage_path TEXT, -- Caminho no Supabase Storage
  max_selection INT DEFAULT 0,
  bonus_photos INT DEFAULT 0,
  extra_photo_price NUMERIC(10, 2) DEFAULT 0,
  status album_status DEFAULT 'aguardando',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ
);
COMMENT ON TABLE public.albums IS 'Álbuns de fotos criados por fotógrafos para seus clientes.';

-- 5. Tabela de Fotos
CREATE TABLE public.photos (
  photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(album_id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tags TEXT[],
  order_number INT,
  selected_by_client BOOLEAN DEFAULT false,
  is_bonus BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.photos IS 'Cada foto dentro de um álbum.';

-- 6. Tabela de Seleções de Fotos (opcional, mas bom para histórico)
CREATE TABLE public.photo_selections (
  selection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES public.photos(photo_id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(album_id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  selected_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.photo_selections IS 'Registra o momento exato em que um cliente seleciona uma foto.';

-- 7. Tabela de Logs de Acesso
CREATE TABLE public.album_access_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(album_id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);
COMMENT ON TABLE public.album_access_logs IS 'Logs de acesso dos clientes aos álbuns.';

-- 8. Tabela de Notificações para Fotógrafos
CREATE TABLE public.photographer_notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- Ex: 'acesso_album', 'selecao_finalizada'
  message TEXT NOT NULL,
  related_album_id UUID REFERENCES public.albums(album_id),
  related_client_id UUID REFERENCES public.clients(client_id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE public.photographer_notifications IS 'Notificações para os fotógrafos.';

-- 9. GATILHOS E FUNÇÕES PARA AUTOMATIZAÇÃO

-- Função para criar perfil de FOTÓGRAFO
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (new.raw_user_meta_data ->> 'role') = 'photographer' THEN
    INSERT INTO public.photographers (
      user_id,
      full_name,
      email,
      username,
      company_name,
      phone
    ) VALUES (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.email,
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'company_name',
      new.raw_user_meta_data ->> 'phone'
    );
  END IF;
  RETURN new;
END;
$$;

-- Função para criar perfil de CLIENTE
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
      new.raw_user_meta_data ->> 'full_name',
      new.email,
      new.raw_user_meta_data ->> 'phone'
    );
  END IF;
  RETURN new;
END;
$$;

-- Recriar os gatilhos para garantir a ordem e a lógica corretas
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
CREATE TRIGGER on_auth_user_created_photographer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();

DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();

-- Função de gatilho para notificar fotógrafo no acesso ao álbum
CREATE OR REPLACE FUNCTION public.notify_on_album_access()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  photographer_user_id UUID;
  client_name TEXT;
  album_name_text TEXT;
BEGIN
  -- Obter IDs e nomes necessários
  SELECT a.photographer_id, c.full_name, a.name
  INTO photographer_user_id, client_name, album_name_text
  FROM public.albums a
  JOIN public.clients c ON a.client_id = c.client_id
  WHERE a.album_id = NEW.album_id;

  -- Inserir a notificação
  INSERT INTO public.photographer_notifications (photographer_id, type, message, related_album_id, related_client_id)
  VALUES (
    photographer_user_id,
    'acesso_album',
    'O cliente ' || client_name || ' acessou o álbum "' || album_name_text || '".',
    NEW.album_id,
    NEW.client_id
  );
  RETURN NEW;
END;
$$;

-- Gatilho na tabela de logs
CREATE TRIGGER on_album_access_trigger
AFTER INSERT ON public.album_access_logs
FOR EACH ROW EXECUTE FUNCTION public.notify_on_album_access();


-- 10. POLÍTICAS DE SEGURANÇA (ROW-LEVEL SECURITY)
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para Fotógrafos
CREATE POLICY "Fotógrafos podem ver e editar seus próprios perfis" ON public.photographers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Fotógrafos podem gerenciar seus próprios clientes" ON public.clients
  FOR ALL USING (auth.uid() = photographer_id);

CREATE POLICY "Fotógrafos podem gerenciar seus próprios álbuns" ON public.albums
  FOR ALL USING (auth.uid() = photographer_id);

CREATE POLICY "Fotógrafos podem gerenciar fotos de seus próprios álbuns" ON public.photos
  FOR ALL USING (album_id IN (SELECT album_id FROM public.albums WHERE photographer_id = auth.uid()));

CREATE POLICY "Fotógrafos podem ver as seleções de seus álbuns" ON public.photo_selections
  FOR ALL USING (album_id IN (SELECT album_id FROM public.albums WHERE photographer_id = auth.uid()));

CREATE POLICY "Fotógrafos podem ver os logs de seus álbuns" ON public.album_access_logs
  FOR ALL USING (album_id IN (SELECT album_id FROM public.albums WHERE photographer_id = auth.uid()));

CREATE POLICY "Fotógrafos podem ver suas próprias notificações" ON public.photographer_notifications
  FOR ALL USING (auth.uid() = photographer_id);

-- Políticas para Clientes (Exemplo - Acesso de leitura a álbuns permitidos)
-- Aqui, a lógica de acesso do cliente seria mais complexa, geralmente validada por uma função
-- que verifica a senha do álbum. O acesso direto via RLS para clientes é mais complexo.
-- Por enquanto, vamos focar no acesso do fotógrafo.
-- Exemplo de política de leitura para um cliente em um álbum específico:
-- CREATE POLICY "Clientes podem ver fotos dos álbuns aos quais têm acesso" ON public.photos
--  FOR SELECT USING (is_client_allowed_in_album(album_id)); -- Onde is_client_allowed_in_album é uma custom function
