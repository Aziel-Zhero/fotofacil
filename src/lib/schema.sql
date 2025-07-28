-- LIMPEZA COMPLETA (DEMOLITION)
-- Remove gatilhos (Triggers) primeiro, em ordem de dependência inversa.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;

-- Remove funções (Functions) que os gatilhos usam.
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_photographer();

-- Remove tabelas (Tables)
-- O CASCADE remove automaticamente as políticas, índices e chaves estrangeiras dependentes.
DROP TABLE IF EXISTS public.photo_selections CASCADE;
DROP TABLE IF EXISTS public.photos CASCADE;
DROP TABLE IF EXISTS public.album_access_logs CASCADE;
DROP TABLE IF EXISTS public.albums CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.photographer_notifications CASCADE;
DROP TABLE IF EXISTS public.photographers CASCADE;

-- Remove tipos (Types)
DROP TYPE IF EXISTS public.user_role;


-- CRIAÇÃO DA ESTRUTURA (RECONSTRUCTION)

-- Tabela de Fotógrafos
CREATE TABLE public.photographers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES public.photographers(id),
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Álbuns
CREATE TABLE public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, -- Cliente pode ser associado depois
    status TEXT DEFAULT 'Aguardando Fotos', -- Ex: Aguardando Fotos, Aguardando Seleção, Seleção Completa, Expirado, Entregue
    password TEXT, -- Senha para acesso do cliente
    expires_at TIMESTAMPTZ, -- Data de expiração para o cliente fazer a seleção
    max_photos_selection INT NOT NULL,
    extra_photo_cost NUMERIC(10, 2) DEFAULT 0,
    gift_photos INT DEFAULT 0,
    pix_key TEXT, -- Chave PIX aleatória para pagamento de fotos extras
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Fotos
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- Caminho no Supabase Storage
    url TEXT NOT NULL, -- URL pública da imagem
    tags TEXT[], -- Tags para busca (geradas por IA ou manualmente)
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Seleções de Fotos pelos Clientes
CREATE TABLE public.photo_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    selected_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(album_id, client_id, photo_id) -- Garante que a mesma foto não seja selecionada duas vezes pelo mesmo cliente no mesmo álbum
);

-- Tabela de Notificações para Fotógrafos
CREATE TABLE public.photographer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT, -- Link para a página relevante (ex: álbum, seleção)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Logs de Acesso a Álbuns
CREATE TABLE public.album_access_logs (
    id BIGSERIAL PRIMARY KEY,
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, -- pode ser um acesso anônimo inicial
    ip_address TEXT,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);


-- LÓGICA DE CRIAÇÃO AUTOMÁTICA DE PERFIS (FUNCTION & TRIGGER)
-- Esta função é acionada sempre que um novo usuário é criado no Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (new.raw_user_meta_data->>'role' = 'photographer') THEN
    INSERT INTO public.photographers (id, full_name, username, company_name, phone, email)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'fullName',
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'companyName',
      new.raw_user_meta_data->>'phone',
      new.email
    );
  ELSIF (new.raw_user_meta_data->>'role' = 'client') THEN
    INSERT INTO public.clients (id, photographer_id, full_name, phone, email)
    VALUES (
      new.id,
      (new.raw_user_meta_data->>'photographerId')::UUID,
      new.raw_user_meta_data->>'fullName',
      new.raw_user_meta_data->>'phone',
      new.email
    );
  END IF;
  RETURN new;
END;
$$;

-- O gatilho que executa a função acima após a criação de um usuário.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- POLÍTICAS DE SEGURANÇA (ROW-LEVEL SECURITY)

-- Tabela photographers
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographer can access only own profile"
  ON public.photographers FOR ALL
  USING (auth.uid() = id);
CREATE POLICY "Allow service_role to insert"
  ON public.photographers FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Tabela clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can view their clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = photographer_id);
CREATE POLICY "Photographers can add their clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = photographer_id);
CREATE POLICY "Photographers can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = photographer_id);
CREATE POLICY "Photographers can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = photographer_id);

-- Tabela albums
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem gerenciar seus próprios álbuns."
  ON public.albums FOR ALL
  USING (auth.uid() = photographer_id);
  
-- Tabela photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem gerenciar fotos de seus próprios álbuns."
  ON public.photos FOR ALL
  USING (auth.uid() = photographer_id);

-- Tabela photo_selections
ALTER TABLE public.photo_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver as seleções de seus clientes."
  ON public.photo_selections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM albums WHERE albums.id = photo_selections.album_id AND albums.photographer_id = auth.uid()
  ));
CREATE POLICY "Clientes podem gerenciar suas próprias seleções."
    ON public.photo_selections FOR ALL
    USING (auth.uid() = client_id);

-- Tabela photographer_notifications
ALTER TABLE public.photographer_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver suas próprias notificações."
  ON public.photographer_notifications FOR ALL
  USING (auth.uid() = photographer_id);

-- Tabela album_access_logs
ALTER TABLE public.album_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver os logs de acesso de seus álbuns."
  ON public.album_access_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM albums WHERE albums.id = album_access_logs.album_id AND albums.photographer_id = auth.uid()
  ));
```