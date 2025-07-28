-- Limpa o estado anterior (caso esteja recriando)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_photographer();
DROP FUNCTION IF EXISTS public.handle_new_client();

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
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  photographer_id uuid REFERENCES public.photographers(user_id) ON DELETE CASCADE,
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
CREATE POLICY "Photographer can access own profile"
  ON public.photographers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Allow service_role to insert photographers"
  ON public.photographers
  FOR INSERT
  TO service_role
  WITH CHECK (true);


-- Políticas de segurança para clientes
CREATE POLICY "Photographers can manage their own clients"
  ON public.clients
  FOR ALL
  USING (
    (SELECT user_id FROM photographers WHERE user_id = auth.uid()) = photographer_id
  )
  WITH CHECK (
    (SELECT user_id FROM photographers WHERE user_id = auth.uid()) = photographer_id
  );

CREATE POLICY "Allow service_role to insert clients"
  ON public.clients
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Função para criar perfil (fotógrafo ou cliente) automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho para executar a função ao criar novo usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
