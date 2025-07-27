-- Define um tipo personalizado para os papéis de usuário, facilitando a consistência.
CREATE TYPE public.user_role AS ENUM ('photographer', 'client');

-- Tabela para armazenar os perfis dos fotógrafos.
CREATE TABLE public.photographers (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE,
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    username text NOT NULL UNIQUE,
    company_name text,
    whatsapp text,
    instagram text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT photographers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can view their own profile." ON public.photographers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Photographers can update their own profile." ON public.photographers FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela para armazenar os perfis dos clientes.
CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    photographer_id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT clients_photographer_id_fkey FOREIGN KEY (photographer_id) REFERENCES public.photographers(id) ON DELETE CASCADE
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can be viewed by their photographer." ON public.clients FOR SELECT USING (
    (SELECT auth.uid() FROM public.photographers p WHERE p.id = photographer_id) = auth.uid()
);

-- Tabela para os álbuns de fotos.
CREATE TABLE public.albums (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    photographer_id uuid NOT NULL,
    name text NOT NULL,
    client_name text,
    status text DEFAULT 'pending_upload' NOT NULL, -- Ex: pending_upload, selecting, completed, delivered
    password_hash text,
    expiration_date date,
    max_selections integer DEFAULT 50 NOT NULL,
    extra_photo_cost numeric(10, 2) DEFAULT 0.00,
    courtesy_photos integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT albums_photographer_id_fkey FOREIGN KEY (photographer_id) REFERENCES public.photographers(id) ON DELETE CASCADE
);
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can manage their own albums." ON public.albums FOR ALL USING (auth.uid() = (SELECT user_id FROM public.photographers WHERE id = photographer_id));
CREATE POLICY "Albums can be viewed by anyone with the correct password (app logic)." ON public.albums FOR SELECT USING (true); -- Acesso controlado por senha na aplicação


-- Tabela para armazenar as fotos de cada álbum.
CREATE TABLE public.photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    album_id uuid NOT NULL,
    file_path text NOT NULL, -- Caminho no Supabase Storage
    tags text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT photos_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE
);
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can manage photos in their albums." ON public.photos FOR ALL USING (
    auth.uid() = (SELECT p.user_id FROM public.photographers p JOIN public.albums a ON p.id = a.photographer_id WHERE a.id = album_id)
);
CREATE POLICY "Photos can be viewed by anyone with access to the album." ON public.photos FOR SELECT USING (true);


-- Tabela para registrar as seleções de fotos feitas pelos clientes.
CREATE TABLE public.selections (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    album_id uuid NOT NULL,
    client_id uuid, -- Pode ser nulo se o cliente não for cadastrado
    photo_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT selections_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE,
    CONSTRAINT selections_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
    CONSTRAINT selections_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id) ON DELETE CASCADE,
    UNIQUE (album_id, photo_id, client_id) -- Garante que um cliente não selecione a mesma foto duas vezes
);
ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can view selections for their albums." ON public.selections FOR SELECT USING (
    auth.uid() = (SELECT p.user_id FROM public.photographers p JOIN public.albums a ON p.id = a.photographer_id WHERE a.id = album_id)
);
CREATE POLICY "Clients can manage their own selections." ON public.selections FOR ALL USING (
    client_id IS NOT NULL AND auth.uid() = (SELECT user_id FROM public.clients c WHERE c.id = client_id)
);


-- Remove a lógica de gatilho, pois a criação será feita sequencialmente na Server Action.
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_photographer();

DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_client();
