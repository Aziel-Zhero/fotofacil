-- Apaga tabelas existentes na ordem correta para evitar erros de dependência
DROP TABLE IF EXISTS "photographer_notifications" CASCADE;
DROP TABLE IF EXISTS "album_access_logs" CASCADE;
DROP TABLE IF EXISTS "photo_selections" CASCADE;
DROP TABLE IF EXISTS "photos" CASCADE;
DROP TABLE IF EXISTS "albums" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "photographers" CASCADE;

-- Apaga tipos ENUM existentes
DROP TYPE IF EXISTS "album_status_enum";
DROP TYPE IF EXISTS "plan_type_enum";

-- Cria tipos ENUM para status
CREATE TYPE "album_status_enum" AS ENUM (
  'awaiting_selection',
  'selection_complete',
  'delivered',
  'expired'
);

CREATE TYPE "plan_type_enum" AS ENUM (
  'trial',
  'essential_monthly',
  'essential_biannual',
  'studio_annual'
);


-- Tabela de Fotógrafos (ligada ao auth.users)
CREATE TABLE "photographers" (
  "user_id" uuid NOT NULL,
  "full_name" text NOT NULL,
  "birth_date" date,
  "company_name" text,
  "email" text NOT NULL UNIQUE,
  "phone" text,
  "username" text NOT NULL UNIQUE,
  "plan" plan_type_enum DEFAULT 'trial',
  "plan_expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("user_id"),
  CONSTRAINT "photographers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

-- Tabela de Clientes (vinculados a um fotógrafo)
CREATE TABLE "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL,
  "custom_id" text UNIQUE,
  "full_name" text NOT NULL,
  "email" text,
  "phone" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "clients_photographer_id_fkey" FOREIGN KEY ("photographer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  CONSTRAINT "clients_photographer_id_email_key" UNIQUE ("photographer_id", "email")
);

-- Tabela de Álbuns
CREATE TABLE "albums" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL,
  "client_id" uuid NOT NULL,
  "name" text NOT NULL,
  "password" text,
  "max_photos" integer DEFAULT 0,
  "extra_photo_cost" numeric(10, 2) DEFAULT 0,
  "gift_photos" integer DEFAULT 0,
  "status" album_status_enum DEFAULT 'awaiting_selection',
  "expiration_date" date,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "albums_photographer_id_fkey" FOREIGN KEY ("photographer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  CONSTRAINT "albums_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
);

-- Tabela de Fotos
CREATE TABLE "photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL,
  "storage_path" text NOT NULL,
  "tags" text[],
  "order_number" integer,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE
);

-- Tabela de Seleção de Fotos pelo Cliente
CREATE TABLE "photo_selections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL,
  "photo_id" uuid NOT NULL,
  "is_gift" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "photo_selections_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE,
  CONSTRAINT "photo_selections_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE,
  CONSTRAINT "photo_selections_album_id_photo_id_key" UNIQUE ("album_id", "photo_id")
);

-- Tabela de Logs de Acesso ao Álbum
CREATE TABLE "album_access_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL,
  "client_id" uuid NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "accessed_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "album_access_logs_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE,
  CONSTRAINT "album_access_logs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
);

-- Tabela de Notificações para o Fotógrafo
CREATE TABLE "photographer_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL,
  "message" text NOT NULL,
  "related_album_id" uuid,
  "related_client_id" uuid,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "photographer_notifications_photographer_id_fkey" FOREIGN KEY ("photographer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  CONSTRAINT "photographer_notifications_related_album_id_fkey" FOREIGN KEY ("related_album_id") REFERENCES "albums"("id") ON DELETE SET NULL,
  CONSTRAINT "photographer_notifications_related_client_id_fkey" FOREIGN KEY ("related_client_id") REFERENCES "clients"("id") ON DELETE SET NULL
);

-- Contadores para IDs personalizados
CREATE SEQUENCE IF NOT EXISTS photographer_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS client_id_seq START 1;

-- Função do Gatilho para Fotógrafos
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cria perfil apenas se o metadata indicar que é fotógrafo
  IF (new.raw_user_meta_data ->> 'role') = 'photographer' THEN
    INSERT INTO public.photographers (user_id, full_name, email, username, company_name)
    VALUES (
      new.id,
      new.raw_user_meta_data ->> 'fullName',
      new.email,
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'companyName'
    );
  END IF;
  RETURN new;
END;
$$;

-- Função do Gatilho para Clientes
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  photographer_user_id uuid;
BEGIN
  -- Cria perfil apenas se o metadata indicar que é cliente
  IF (new.raw_user_meta_data ->> 'role') = 'client' THEN
    -- Encontra o fotógrafo responsável
    SELECT id INTO photographer_user_id
    FROM public.photographers
    WHERE username = (new.raw_user_meta_data ->> 'photographer_username')
    LIMIT 1;

    -- Cria cliente vinculado ao fotógrafo
    INSERT INTO public.clients (photographer_id, full_name, email, phone)
    VALUES (
      photographer_user_id,
      new.raw_user_meta_data ->> 'fullName',
      new.email,
      new.raw_user_meta_data ->> 'phone'
    );
  END IF;
  RETURN new;
END;
$$;

-- Gatilho para novos usuários Fotógrafos
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
CREATE TRIGGER on_auth_user_created_photographer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();

-- Gatilho para novos usuários Clientes
DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();

-- RLS Policies
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographer can see own profile" ON photographers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Photographer can update own profile" ON photographers FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can manage their own clients" ON clients FOR ALL USING (auth.uid() = photographer_id);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can manage their own albums" ON albums FOR ALL USING (auth.uid() = photographer_id);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can manage photos in their own albums" ON photos FOR ALL USING (
  (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
);

ALTER TABLE photo_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can see selections for their own albums" ON photo_selections FOR SELECT USING (
  (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
);

ALTER TABLE album_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers can see logs for their own albums" ON album_access_logs FOR SELECT USING (
  (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
);

ALTER TABLE photographer_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographer can see their own notifications" ON photographer_notifications FOR ALL USING (auth.uid() = photographer_id);
