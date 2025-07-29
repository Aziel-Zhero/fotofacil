-- 1. Limpeza Inicial (ordem de dependência reversa)
-- Remove gatilhos, funções e depois tabelas para evitar erros de dependência.

-- Remove o gatilho da tabela auth.users se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove a função se existir
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Remove tabelas na ordem de dependência (de quem tem chave estrangeira para quem é referenciada)
DROP TABLE IF EXISTS public.photo_selections;
DROP TABLE IF EXISTS public.album_access_logs;
DROP TABLE IF EXISTS public.photos;
DROP TABLE IF EXISTS public.albums;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.photographer_notifications;
DROP TABLE IF EXISTS public.photographers;

-- 2. Criação da Tabela de Fotógrafos
CREATE TABLE public.photographers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    company_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criação da Tabela de Clientes
-- Um cliente está sempre associado a um fotógrafo.
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criação da Tabela de Álbuns
-- Um álbum pertence a um fotógrafo e a um cliente.
CREATE TABLE public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- ID do cliente na auth.users
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente de Vínculo',
    selection_limit INTEGER NOT NULL DEFAULT 0,
    courtesy_photos INTEGER DEFAULT 0,
    extra_photo_cost NUMERIC(10, 2) DEFAULT 0.00,
    access_password TEXT,
    pix_key TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criação da Tabela de Fotos
-- Uma foto pertence a um álbum.
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    tags TEXT[],
    filename TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Criação da Tabela de Seleção de Fotos pelo Cliente
CREATE TABLE public.photo_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    selected_at TIMESTAMPTZ DEFAULT NOW(),
    is_extra BOOLEAN DEFAULT FALSE,
    UNIQUE (album_id, photo_id, client_id)
);

-- 7. Criação da Tabela de Notificações para Fotógrafos
CREATE TABLE public.photographer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type TEXT, -- 'selection_complete', 'extra_payment', etc.
    related_album_id UUID REFERENCES public.albums(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Criação da Tabela de Logs de Acesso ao Álbum
CREATE TABLE public.album_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    client_ip TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT
);

-- 9. Função para Inserir Novo Usuário (Fotógrafo ou Cliente)
-- Esta função é chamada por um gatilho quando um novo usuário é criado no Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica o 'role' definido nos metadados do usuário durante o cadastro
    IF new.raw_user_meta_data->>'role' = 'photographer' THEN
        INSERT INTO public.photographers (id, full_name, username, company_name, phone)
        VALUES (
            new.id,
            new.raw_user_meta_data->>'fullName',
            new.raw_user_meta_data->>'username',
            new.raw_user_meta_data->>'companyName',
            new.raw_user_meta_data->>'phone'
        );
    -- Se não for fotógrafo, pode ser um cliente, mas a tabela `clients` agora é gerenciada pelo fotógrafo.
    -- O vínculo do cliente ao álbum será feito através do `client_user_id`.
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 10. Gatilho (Trigger) para Chamar a Função
-- Este gatilho é acionado após a criação de um novo usuário na tabela auth.users.
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Habilitar RLS e Definir Políticas de Acesso
-- A segurança em nível de linha (RLS) garante que os usuários só possam acessar seus próprios dados.

-- Tabela photographers
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographer can access only own profile"
    ON public.photographers FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

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
    USING (auth.uid() = photographer_id)
    WITH CHECK (auth.uid() = photographer_id);

-- Tabela photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem gerenciar fotos de seus próprios álbuns."
    ON public.photos FOR ALL
    USING ((SELECT photographer_id FROM public.albums WHERE id = album_id) = auth.uid());

-- Tabela photo_selections
ALTER TABLE public.photo_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver as seleções de seus clientes."
    ON public.photo_selections FOR SELECT
    USING ((SELECT photographer_id FROM public.albums WHERE id = album_id) = auth.uid());

-- Tabela photographer_notifications
ALTER TABLE public.photographer_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver suas próprias notificações."
    ON public.photographer_notifications FOR ALL
    USING (auth.uid() = photographer_id);

-- Tabela album_access_logs
ALTER TABLE public.album_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotógrafos podem ver os logs de acesso de seus álbuns."
    ON public.album_access_logs FOR SELECT
    USING ((SELECT photographer_id FROM public.albums WHERE id = album_id) = auth.uid());

-- Definição final para garantir que o role 'anon' (usuário não logado) não possa fazer nada por padrão
-- e que o 'service_role' (usado por gatilhos e funções de servidor) tenha acesso total.
-- Essas são boas práticas, mas as políticas de RLS acima já são a principal camada de segurança.
-- Acesso para anon e authenticated roles é negado por padrão quando RLS está habilitado sem políticas permissivas.
