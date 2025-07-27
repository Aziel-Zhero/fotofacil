-- Apaga tabelas antigas se existirem para uma instalação limpa.
DROP TABLE IF EXISTS "photographer_notifications" CASCADE;
DROP TABLE IF EXISTS "album_access_logs" CASCADE;
DROP TABLE IF EXISTS "photo_selections" CASCADE;
DROP TABLE IF EXISTS "photos" CASCADE;
DROP TABLE IF EXISTS "albums" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "photographers" CASCADE;
DROP TYPE IF EXISTS "album_status_type";
DROP TYPE IF EXISTS "plan_type";
DROP SEQUENCE IF EXISTS "photographer_id_seq";
DROP SEQUENCE IF EXISTS "client_id_seq";

-- Tipos Personalizados (ENUMs) para padronizar valores.
CREATE TYPE "album_status_type" AS ENUM ('aguardando_selecao', 'selecao_completa', 'entregue', 'expirado');
CREATE TYPE "plan_type" AS ENUM ('trial', 'essencial_mensal', 'essencial_semestral', 'estudio_anual');

-- Tabela para Fotógrafos
CREATE TABLE "photographers" (
  "id" uuid PRIMARY KEY DEFAULT auth.uid(),
  "custom_id" text UNIQUE NOT NULL,
  "full_name" text NOT NULL,
  "birth_date" date,
  "company_name" text,
  "email" text UNIQUE NOT NULL,
  "phone" text,
  "username" text UNIQUE NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Tabela para Clientes
CREATE TABLE "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "custom_id" text UNIQUE NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "unique_client_email" UNIQUE ("email")
);

-- Tabela para Álbuns
CREATE TABLE "albums" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL REFERENCES "photographers"(id) ON DELETE CASCADE,
  "client_id" uuid REFERENCES "clients"(id) ON DELETE SET NULL,
  "name" text NOT NULL,
  "password" text,
  "temporary_password" text,
  "max_selection" integer DEFAULT 0,
  "bonus_photos" integer DEFAULT 0,
  "extra_photo_price" numeric(10, 2) DEFAULT 0.00,
  "status" album_status_type DEFAULT 'aguardando_selecao',
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Tabela para Fotos
CREATE TABLE "photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES "albums"(id) ON DELETE CASCADE,
  "storage_path" text NOT NULL, -- Caminho no Supabase Storage: ex: /albums/photographer_id/album_id/image.jpg
  "tags" text[],
  "order_number" serial,
  "selected_by_client" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Tabela para Seleções de Fotos feitas pelo Cliente
CREATE TABLE "photo_selections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES "albums"(id) ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES "clients"(id) ON DELETE CASCADE,
  "photo_id" uuid NOT NULL REFERENCES "photos"(id) ON DELETE CASCADE,
  "is_bonus" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Tabela para Logs de Acesso ao Álbum
CREATE TABLE "album_access_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES "albums"(id) ON DELETE CASCADE,
  "client_id" uuid REFERENCES "clients"(id) ON DELETE SET NULL,
  "client_custom_id" text,
  "accessed_at" timestamp with time zone DEFAULT now()
);

-- Tabela para Notificações do Fotógrafo
CREATE TABLE "photographer_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL REFERENCES "photographers"(id) ON DELETE CASCADE,
  "type" text, -- ex: 'acesso_album'
  "message" text,
  "related_album_id" uuid,
  "read" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Sequência e Trigger para gerar custom_id para FOTÓGRAFOS (ex: AZ00000001)
CREATE SEQUENCE "photographer_id_seq" START 1;

CREATE OR REPLACE FUNCTION "generate_photographer_custom_id"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.custom_id := 'AZ' || LPAD(nextval('photographer_id_seq')::text, 8, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "set_photographer_custom_id"
BEFORE INSERT ON "photographers"
FOR EACH ROW
EXECUTE FUNCTION "generate_photographer_custom_id"();

-- Sequência e Trigger para gerar custom_id para CLIENTES (ex: ED00000001)
CREATE SEQUENCE "client_id_seq" START 1;

CREATE OR REPLACE FUNCTION "generate_client_custom_id"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.custom_id := 'ED' || LPAD(nextval('client_id_seq')::text, 8, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "set_client_custom_id"
BEFORE INSERT ON "clients"
FOR EACH ROW
EXECUTE FUNCTION "generate_client_custom_id"();


-- Função e Trigger para NOTIFICAR o fotógrafo no acesso ao álbum
CREATE OR REPLACE FUNCTION "notify_photographer_on_album_access"()
RETURNS TRIGGER AS $$
DECLARE
  album_name text;
  photographer_id uuid;
  client_name text;
BEGIN
  -- Obter nome do álbum e ID do fotógrafo
  SELECT a.name, a.photographer_id
  INTO album_name, photographer_id
  FROM albums a
  WHERE a.id = NEW.album_id;

  -- Obter nome do cliente
  SELECT c.full_name
  INTO client_name
  FROM clients c
  WHERE c.id = NEW.client_id;

  -- Inserir a notificação
  INSERT INTO photographer_notifications (photographer_id, type, message, related_album_id)
  VALUES (
    photographer_id,
    'acesso_album',
    FORMAT('O cliente %s (ID: %s) acessou o álbum "%s".',
           client_name,
           NEW.client_custom_id,
           album_name),
    NEW.album_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "album_access_notify_photographer"
AFTER INSERT ON "album_access_logs"
FOR EACH ROW
EXECUTE FUNCTION "notify_photographer_on_album_access"();


-- Políticas de Segurança (ROW LEVEL SECURITY - RLS)
-- Habilitar RLS em todas as tabelas relevantes
ALTER TABLE "photographers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "albums" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "photographer_notifications" ENABLE ROW LEVEL SECURITY;

-- Fotógrafo pode ver e editar seu próprio perfil
CREATE POLICY "Photographers can view and update their own profile"
ON "photographers" FOR ALL
USING (auth.uid() = id);

-- Fotógrafo pode ver e gerenciar seus próprios álbuns
CREATE POLICY "Photographers can access their own albums"
ON "albums" FOR ALL
USING (auth.uid() = photographer_id);

-- Fotógrafo pode ver e gerenciar as fotos de seus próprios álbuns
CREATE POLICY "Photographers can access photos in their own albums"
ON "photos" FOR ALL
USING (
  (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
);

-- Fotógrafo pode ver suas próprias notificações
CREATE POLICY "Photographers can view their own notifications"
ON "photographer_notifications" FOR SELECT
USING (auth.uid() = photographer_id);

-- Permitir que clientes (logados no futuro) ou via senha possam ver as fotos de um álbum
-- Esta política é mais complexa e pode ser refinada. Por enquanto, a lógica de acesso será via backend.
-- Acesso público de leitura para fotos (requer que os links sejam seguros ou ofuscados)
-- CUIDADO: Esta política permite que qualquer pessoa com o link da imagem a veja.
-- O acesso ao álbum em si deve ser controlado pela aplicação.
ALTER TABLE "photos" ALTER COLUMN "storage_path" SET NOT NULL;


-- Função para lidar com novos usuários do Supabase Auth e inserir na tabela `photographers`
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.photographers (id, full_name, email, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho para executar a função quando um novo usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
