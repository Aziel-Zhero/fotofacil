-- 1. Habilitar a extensão pgcrypto para usar gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Drop do tipo ENUM se ele já existir, para evitar erros em re-execuções
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 3. Criar o tipo ENUM para os papéis de usuário
CREATE TYPE public.user_role AS ENUM ('photographer', 'client');

-- 4. Criar a tabela de fotógrafos
CREATE TABLE IF NOT EXISTS public.photographers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    username text UNIQUE NOT NULL,
    company_name text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Criar a tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    photographer_id uuid REFERENCES public.photographers(id) ON DELETE CASCADE NOT NULL,
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 6. Função para criar um perfil de fotógrafo quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se o papel do novo usuário é 'photographer'
  IF (new.raw_user_meta_data ->> 'role') = 'photographer' THEN
    -- Insere os dados na tabela de fotógrafos
    INSERT INTO public.photographers (user_id, full_name, email, username, company_name, phone)
    VALUES (
      new.id,
      new.raw_user_meta_data ->> 'fullName',
      new.email,
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'companyName',
      new.raw_user_meta_data ->> 'phone'
    );
  END IF;
  RETURN new;
END;
$$;

-- 7. Gatilho (Trigger) que executa a função acima após a criação de um novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
CREATE TRIGGER on_auth_user_created_photographer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();

-- 8. Habilitar RLS (Row-Level Security) na tabela de fotógrafos
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;

-- 9. Política de RLS para permitir que o sistema (service_role) insira novos fotógrafos
-- Esta é a correção crucial para permitir que o gatilho funcione.
DROP POLICY IF EXISTS "Allow service_role to insert photographers" ON public.photographers;
CREATE POLICY "Allow service_role to insert photographers"
  ON public.photographers FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Política para permitir que fotógrafos leiam seus próprios perfis
DROP POLICY IF EXISTS "Photographers can view their own data" ON public.photographers;
CREATE POLICY "Photographers can view their own data"
  ON public.photographers FOR SELECT
  USING (auth.uid() = user_id);

-- Política para permitir que fotógrafos atualizem seus próprios perfis
DROP POLICY IF EXISTS "Photographers can update their own data" ON public.photographers;
CREATE POLICY "Photographers can update their own data"
  ON public.photographers FOR UPDATE
  USING (auth.uid() = user_id);
