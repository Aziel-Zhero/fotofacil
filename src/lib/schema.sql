
-- Drop and recreate user_role type
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('photographer', 'client');

-- Create photographers table
CREATE TABLE IF NOT EXISTS public.photographers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    company_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID REFERENCES public.photographers(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(photographer_id, email)
);

-- Create albums table
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID REFERENCES public.photographers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    access_code TEXT,
    access_deadline TIMESTAMP WITH TIME ZONE,
    selection_limit INTEGER
);

-- Function to handle new photographer creation
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (new.raw_user_meta_data ->> 'role') = 'photographer' THEN
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

-- Trigger for new photographer
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
CREATE TRIGGER on_auth_user_created_photographer
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_photographer();

-- Enable RLS for photographers and clients
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies for photographers table
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.photographers;
CREATE POLICY "Allow authenticated inserts" ON "public"."photographers" FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Photographers can access only their own data" ON public.photographers;
CREATE POLICY "Photographers can access only their own data"
ON public.photographers
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for clients table
DROP POLICY IF EXISTS "Photographers can manage only their clients" ON public.clients;
CREATE POLICY "Photographers can manage only their clients"
ON public.clients
FOR ALL
USING (auth.uid() = photographer_id)
WITH CHECK (auth.uid() = photographer_id);
