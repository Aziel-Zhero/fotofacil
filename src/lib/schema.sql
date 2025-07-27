-- Limpa o estado anterior (garantindo a ordem correta de exclusão)
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_photographer;
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
CREATE POLICY "Photographers can access their own profile" ON public.photographers
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow service_role to insert photographers" ON public.photographers
  FOR INSERT TO service_role WITH CHECK (true);

-- Políticas de segurança para clientes (separadas para mais segurança)
CREATE POLICY "Photographers can view their own clients" ON public.clients
  FOR SELECT USING (auth.uid() = photographer_id);

CREATE POLICY "Photographers can add their own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = photographer_id);

CREATE POLICY "Photographers can update their own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = photographer_id)
    WITH CHECK (auth.uid() = photographer_id);

CREATE POLICY "Photographers can delete their own clients" ON public.clients
    FOR DELETE USING (auth.uid() = photographer_id);


-- Função para criar fotógrafo automaticamente ao registrar no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  END IF;
  RETURN NEW;
END;
$$;

-- Gatilho para executar a função ao criar novo usuário
CREATE TRIGGER on_auth_user_created_photographer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_photographer();
