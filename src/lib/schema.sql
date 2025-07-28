-- Apaga todos os objetos antigos e novos para garantir um ambiente limpo.
-- Remove os gatilhos primeiro para evitar erros de dependência.
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove as funções.
DROP FUNCTION IF EXISTS public.handle_new_photographer();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove as tabelas, usando CASCADE para lidar com quaisquer dependências restantes.
DROP TABLE IF EXISTS public.photographers CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.albums CASCADE;
DROP TABLE IF EXISTS public.photos CASCADE;
DROP TABLE IF EXISTS public.album_access_logs CASCADE;
DROP TABLE IF EXISTS public.photo_selections CASCADE;
DROP TABLE IF EXISTS public.photographer_notifications CASCADE;

-- Remove o tipo customizado.
DROP TYPE IF EXISTS public.user_role;

-- Recriação da Estrutura

-- 1. Cria o tipo ENUM para papéis de usuário.
CREATE TYPE public.user_role AS ENUM ('photographer', 'client');

-- 2. Cria a tabela de fotógrafos.
-- A coluna de email foi removida para evitar conflito de UNIQUE com auth.users.
CREATE TABLE public.photographers (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    full_name text,
    company_name text,
    phone text
);

-- 3. Cria a tabela de clientes, associada a um fotógrafo.
CREATE TABLE public.clients (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    photographer_id uuid REFERENCES public.photographers(id) ON DELETE SET NULL,
    full_name text,
    phone text,
    email text UNIQUE
);

-- 4. Cria a tabela de álbuns, associada a um fotógrafo e um cliente.
CREATE TABLE public.albums (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id uuid NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
    name text NOT NULL,
    access_key text UNIQUE,
    password text,
    expiration_date timestamptz,
    max_selections integer,
    extra_photo_cost numeric(10, 2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
);

-- 5. Cria a tabela de fotos, associada a um álbum.
CREATE TABLE public.photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    url text NOT NULL,
    tags text[],
    order_index integer,
    created_at timestamptz DEFAULT now()
);

-- 6. Cria a tabela para logs de acesso ao álbum.
CREATE TABLE public.album_access_logs (
    id bigserial PRIMARY KEY,
    album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
    ip_address inet,
    user_agent text,
    accessed_at timestamptz DEFAULT now()
);

-- 7. Cria a tabela para seleções de fotos do cliente.
CREATE TABLE public.photo_selections (
    id bigserial PRIMARY KEY,
    album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    is_extra boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(album_id, photo_id, client_id)
);

-- 8. Cria a tabela de notificações para fotógrafos.
CREATE TABLE public.photographer_notifications (
    id bigserial PRIMARY KEY,
    photographer_id uuid NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    link text,
    created_at timestamptz DEFAULT now()
);


-- Lógica de Criação de Usuário

-- Cria a função para manipular a criação de novos usuários (fotógrafos ou clientes).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica o papel do usuário a partir dos metadados
  IF (new.raw_user_meta_data->>'role' = 'photographer') THEN
    -- Se for fotógrafo, insere na tabela 'photographers'
    INSERT INTO public.photographers (id, username, full_name, company_name, phone)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'fullName',
      new.raw_user_meta_data->>'companyName',
      new.raw_user_meta_data->>'phone'
    );
  ELSIF (new.raw_user_meta_data->>'role' = 'client') THEN
    -- Se for cliente, insere na tabela 'clients'
    INSERT INTO public.clients (id, photographer_id, full_name, phone, email)
    VALUES (
      new.id,
      (new.raw_user_meta_data->>'photographerId')::uuid, -- Assume que o ID do fotógrafo é passado nos metadados
      new.raw_user_meta_data->>'fullName',
      new.raw_user_meta_data->>'phone',
      new.email
    );
  END IF;
  RETURN new;
END;
$$;

-- Cria o gatilho que chama a função 'handle_new_user' após cada novo registro em 'auth.users'.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Políticas de Segurança (RLS)

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela 'photographers'
CREATE POLICY "Photographer can access only own profile" ON public.photographers
  FOR ALL
  USING (auth.uid() = id);

-- Políticas para a tabela 'clients'
CREATE POLICY "Photographers can view their clients" ON public.clients
  FOR SELECT
  USING (photographer_id = auth.uid());
  
CREATE POLICY "Photographers can add their clients" ON public.clients
  FOR INSERT
  WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "Photographers can update their own clients" ON public.clients
  FOR UPDATE
  USING (photographer_id = auth.uid());

CREATE POLICY "Photographers can delete their own clients" ON public.clients
  FOR DELETE
  USING (photographer_id = auth.uid());

-- Políticas para a tabela 'albums'
CREATE POLICY "Fotógrafos podem gerenciar seus próprios álbuns." ON public.albums
  FOR ALL
  USING (photographer_id = auth.uid());

-- Políticas para a tabela 'photos'
CREATE POLICY "Fotógrafos podem gerenciar fotos de seus próprios álbuns." ON public.photos
  FOR ALL
  USING (
    (
      SELECT photographer_id FROM public.albums WHERE id = album_id
    ) = auth.uid()
  );

-- Políticas para a tabela 'album_access_logs'
CREATE POLICY "Fotógrafos podem ver os logs de acesso de seus álbuns." ON public.album_access_logs
  FOR SELECT
  USING (
    (
      SELECT photographer_id FROM public.albums WHERE id = album_id
    ) = auth.uid()
  );

-- Políticas para a tabela 'photo_selections'
CREATE POLICY "Fotógrafos podem ver as seleções de seus clientes." ON public.photo_selections
  FOR SELECT
  USING (
    (
      SELECT photographer_id FROM public.albums WHERE id = album_id
    ) = auth.uid()
  );

-- Políticas para a tabela 'photographer_notifications'
CREATE POLICY "Fotógrafos podem ver suas próprias notificações." ON public.photographer_notifications
  FOR ALL
  USING (photographer_id = auth.uid());
