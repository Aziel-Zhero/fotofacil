
-- Drop existing types and tables if they exist to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_photographer();
DROP FUNCTION IF EXISTS public.handle_new_client();
DROP TABLE IF EXISTS public.photos;
DROP TABLE IF EXISTS public.clients;
DROP TABLE IF EXISTS public.albums;
DROP TABLE IF EXISTS public.photographers;
DROP TYPE IF EXISTS public.user_role CASCADE;


-- Tabela de Fotógrafos
CREATE TABLE public.photographers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    username text UNIQUE NOT NULL,
    company_name text,
    phone text,
    created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.photographers IS 'Perfis dos fotógrafos usuários do sistema.';

-- Tabela de Clientes
CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    photographer_id uuid REFERENCES public.photographers(id) ON DELETE CASCADE NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(photographer_id, email)
);
COMMENT ON TABLE public.clients IS 'Clientes associados a um fotógrafo.';

-- Função para criar automaticamente perfil de fotógrafo
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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


-- Gatilho para novos usuários Fotógrafos
CREATE TRIGGER on_auth_user_created_photographer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();


-- Função para criar automaticamente perfil de cliente
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  photographer_user_id uuid;
BEGIN
  IF (new.raw_user_meta_data ->> 'role') = 'client' THEN
    SELECT id INTO photographer_user_id
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
      new.raw_user_meta_data ->> 'fullName',
      new.email,
      new.raw_user_meta_data ->> 'phone'
    );
  END IF;
  RETURN new;
END;
$$;


-- Gatilho para novos usuários Clientes
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();
