-- 1. Tipos Enum para padronização de status
DROP TYPE IF EXISTS public.album_status;
CREATE TYPE public.album_status AS ENUM ('aguardando_selecao', 'selecao_completa', 'entregue', 'expirado');

DROP TYPE IF EXISTS public.plan_type;
CREATE TYPE public.plan_type AS ENUM ('trial', 'essencial_mensal', 'essencial_semestral', 'estudio_anual');

DROP TYPE IF EXISTS public.payment_status;
CREATE TYPE public.payment_status AS ENUM ('pendente', 'pago', 'falhou');

-- 2. Tabela de Fotógrafos
DROP TABLE IF EXISTS public.photographers CASCADE;
CREATE TABLE public.photographers (
    user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    birth_year integer,
    company_name text,
    email text UNIQUE NOT NULL,
    phone text,
    cpf text UNIQUE,
    username text UNIQUE NOT NULL,
    pix_key text,
    plan plan_type DEFAULT 'trial',
    plan_started_at timestamptz,
    plan_expires_at timestamptz,
    trial_ends_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.photographers IS 'Perfis dos usuários fotógrafos.';

-- 3. Tabela de Clientes
DROP TABLE IF EXISTS public.clients CASCADE;
CREATE TABLE public.clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id uuid NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(photographer_id, email)
);
COMMENT ON TABLE public.clients IS 'Clientes associados a um fotógrafo.';


-- 4. Tabela de Álbuns
DROP TABLE IF EXISTS public.albums CASCADE;
CREATE TABLE public.albums (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id uuid NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name text NOT NULL,
    password text,
    max_selection integer DEFAULT 0,
    bonus_photos integer DEFAULT 0,
    extra_photo_price numeric(10, 2) DEFAULT 0,
    status album_status DEFAULT 'aguardando_selecao',
    expires_at timestamptz,
    storage_path text,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.albums IS 'Álbuns de fotos criados pelos fotógrafos.';

-- 5. Tabela de Fotos
DROP TABLE IF EXISTS public.photos CASCADE;
CREATE TABLE public.photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    photographer_id uuid NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
    url text NOT NULL,
    tags text[],
    order_number integer,
    selected_by_client boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.photos IS 'Imagens individuais de cada álbum.';

-- 6. Tabela de Seleções de Fotos
DROP TABLE IF EXISTS public.photo_selections CASCADE;
CREATE TABLE public.photo_selections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    is_bonus boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(album_id, photo_id)
);
COMMENT ON TABLE public.photo_selections IS 'Registra as fotos selecionadas pelos clientes.';

-- 7. Tabela de Logs de Acesso
DROP TABLE IF EXISTS public.album_access_logs CASCADE;
CREATE TABLE public.album_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  accessed_at timestamptz DEFAULT now() NOT NULL,
  accessed_ip text,
  accessed_user_agent text
);
COMMENT ON TABLE public.album_access_logs IS 'Logs de acesso dos clientes aos álbuns.';


-- 8. Tabela de Notificações para Fotógrafos
DROP TABLE IF EXISTS public.photographer_notifications CASCADE;
CREATE TABLE public.photographer_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES public.photographers(user_id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  related_album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  related_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.photographer_notifications IS 'Notificações para os fotógrafos (ex: acesso ao álbum).';


-- 9. Funções e Gatilhos (Triggers)
-- Função para criar perfil de FOTÓGRAFO a partir do Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (new.raw_user_meta_data ->> 'role') = 'photographer' THEN
    INSERT INTO public.photographers (user_id, full_name, email, username, company_name)
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

-- Gatilho para FOTÓGRAFOS
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
CREATE TRIGGER on_auth_user_created_photographer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();


-- Função para criar perfil de CLIENTE a partir do Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  photographer_user_id uuid;
BEGIN
  IF (new.raw_user_meta_data ->> 'role') = 'client' THEN
    -- Encontra o fotógrafo responsável pelo username fornecido no cadastro
    SELECT user_id INTO photographer_user_id
    FROM public.photographers
    WHERE username = (new.raw_user_meta_data ->> 'photographer_username')
    LIMIT 1;

    -- Se não encontrar o fotógrafo, gera um erro.
    IF photographer_user_id IS NULL THEN
      RAISE EXCEPTION 'Fotógrafo com o username especificado não foi encontrado.';
    END IF;

    -- Cria o perfil do cliente, vinculando ao fotógrafo
    INSERT INTO public.clients (photographer_id, full_name, email, phone)
    VALUES (
      photographer_user_id,
      new.raw_user_meta_data ->> 'fullName',
      new.email,
      new.raw_user_meta_data ->> 'phone'
    );
  END IF;
  RETURN new;
END;
$$;

-- Gatilho para CLIENTES
DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();


-- 10. Políticas de Segurança (Row-Level Security)
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver e editar seu próprio perfil."
    ON public.photographers FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem gerenciar seus próprios clientes."
    ON public.clients FOR ALL
    USING (auth.uid() = photographer_id)
    WITH CHECK (auth.uid() = photographer_id);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem gerenciar seus próprios álbuns."
    ON public.albums FOR ALL
    USING (auth.uid() = photographer_id)
    WITH CHECK (auth.uid() = photographer_id);
CREATE POLICY "Clientes podem ver álbuns aos quais têm acesso (futura implementação)."
    ON public.albums FOR SELECT
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = albums.client_id AND clients.email = auth.email()));


ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem gerenciar fotos de seus próprios álbuns."
    ON public.photos FOR ALL
    USING (auth.uid() = photographer_id)
    WITH CHECK (auth.uid() = photographer_id);

ALTER TABLE public.photo_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver as seleções de seus clientes."
    ON public.photo_selections FOR SELECT
    USING (EXISTS (SELECT 1 FROM albums WHERE albums.id = photo_selections.album_id AND albums.photographer_id = auth.uid()));
CREATE POLICY "Clientes podem gerenciar suas próprias seleções."
    ON public.photo_selections FOR ALL
    USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = photo_selections.client_id AND clients.email = auth.email()));

ALTER TABLE public.album_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver os logs de acesso de seus álbuns."
    ON public.album_access_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM albums WHERE albums.id = album_access_logs.album_id AND albums.photographer_id = auth.uid()));

ALTER TABLE public.photographer_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver suas próprias notificações."
    ON public.photographer_notifications FOR ALL
    USING (auth.uid() = photographer_id)
    WITH CHECK (auth.uid() = photographer_id);
