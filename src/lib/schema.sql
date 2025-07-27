
-- Drop existing tables and types for a clean slate
DROP TABLE IF EXISTS public.photographers CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TYPE IF EXISTS public.user_role;

-- Define custom types
CREATE TYPE public.user_role AS ENUM ('photographer', 'client');

-- Create photographers table
CREATE TABLE public.photographers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    company_name TEXT,
    phone TEXT,
    created_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    photographer_id uuid REFERENCES public.photographers(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    created_at timestamptz DEFAULT now()
);
