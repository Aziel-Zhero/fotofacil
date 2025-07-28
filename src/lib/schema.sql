-- 1. Limpeza Completa na Ordem Correta para Evitar Erros de Dependência

-- Remove o gatilho que depende da função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove a função que o gatilho usava
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.handle_new_photographer;
DROP FUNCTION IF EXISTS public.handle_new_client;

-- Remove as tabelas (CASCADE remove objetos dependentes como chaves estrangeiras)
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.photographers CASCADE;

-- Remove tipos customizados
DROP TYPE IF EXISTS public.user_role;


-- 2. Recriação da Estrutura do Banco de Dados

-- Cria um tipo ENUM para definir os papéis de usuário
CREATE TYPE public.user_role AS ENUM ('photographer', 'client');

-- Cria a tabela de fotógrafos
CREATE TABLE public.photographers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photographer_id uuid REFERENCES public.photographers(user_id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at timestamptz DEFAULT now(),
  UNIQUE(photographer_id, email)
);

-- Comentários sobre as tabelas para clareza
COMMENT ON TABLE public.photographers IS 'Armazena os perfis dos fotógrafos.';
COMMENT ON TABLE public.clients IS 'Armazena os perfis dos clientes, vinculados aos fotógrafos.';


-- 3. Habilitação e Configuração do RLS (Row-Level Security)

ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança para Fotógrafos
CREATE POLICY "Photographers can see and manage their own profile"
  ON public.photographers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas de Segurança para Clientes
CREATE POLICY "Clients can see and manage their own profile"
  ON public.clients
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Photographers can view their own clients"
  ON public.clients
  FOR SELECT
  USING (auth.uid() = photographer_id);


-- 4. Lógica de Criação Automática de Usuário (Função e Gatilho)

-- Função unificada para criar perfil de fotógrafo ou cliente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica se o papel do novo usuário é 'photographer'
  IF (NEW.raw_user_meta_data ->> 'role') = 'photographer' THEN
    INSERT INTO public.photographers (user_id, full_name, email, username, company_name, phone)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'fullName',
      NEW.email,
      NEW.raw_user_meta_data ->> 'username',
      NEW.raw_user_meta_data ->> 'companyName',
      NEW.raw_user_meta_data ->> 'phone'
    );
  
  -- Verifica se o papel do novo usuário é 'client'
  ELSIF (NEW.raw_user_meta_data ->> 'role') = 'client' THEN
    INSERT INTO public.clients (user_id, full_name, email, phone, photographer_id)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'fullName',
      NEW.email,
      NEW.raw_user_meta_data ->> 'phone',
      (NEW.raw_user_meta_data ->> 'photographerId')::uuid
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Gatilho para executar a função sempre que um novo usuário for criado em auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Política para permitir que o gatilho insira dados
CREATE POLICY "Allow service_role to insert profiles"
  ON public.photographers FOR INSERT TO service_role WITH CHECK (true);
  
CREATE POLICY "Allow service_role to insert client profiles"
  ON public.clients FOR INSERT TO service_role WITH CHECK (true);
