-- Limpa o estado anterior (caso esteja recriando)
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.photographers CASCADE;
DROP TYPE IF EXISTS public.user_role;

-- Cria enum para papel do usuário (opcional, se quiser usar no futuro)
CREATE TYPE public.user_role AS ENUM ('photographer', 'client');

-- Cria a tabela de fotógrafos
CREATE TABLE public.photographers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  company_name TEXT,
  phone TEXT,
  created_at timestamptz DEFAULT now()
);

-- Cria a tabela de clientes
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at timestamptz DEFAULT now(),
  UNIQUE(photographer_id, email)
);

-- Habilita Row-Level Security (RLS)
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para fotógrafos
CREATE POLICY "Photographer can access only own profile"
  ON public.photographers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Allow service_role to insert"
  ON public.photographers
  FOR INSERT
  TO service_role
  WITH CHECK (true);


-- Políticas de segurança para clientes
CREATE POLICY "Photographers can view their clients"
  ON public.clients
  FOR SELECT
  USING (auth.uid() = photographer_id);

CREATE POLICY "Photographers can add their clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (auth.uid() = photographer_id);
  
CREATE POLICY "Photographers can update their own clients"
    ON public.clients
    FOR UPDATE
    USING (auth.uid() = photographer_id)
    WITH CHECK (auth.uid() = photographer_id);

CREATE POLICY "Photographers can delete their own clients"
    ON public.clients
    FOR DELETE
    USING (auth.uid() = photographer_id);
