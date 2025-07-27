-- Apagar tabelas existentes (cuidado: apaga todos os dados)
DROP TABLE IF EXISTS "photographer_notifications" CASCADE;
DROP TABLE IF EXISTS "album_access_logs" CASCADE;
DROP TABLE IF EXISTS "photo_selections" CASCADE;
DROP TABLE IF EXISTS "photos" CASCADE;
DROP TABLE IF EXISTS "albums" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "photographers" CASCADE;

-- Criar ENUMs para status
CREATE TYPE album_status AS ENUM ('aguardando', 'entregue', 'expirado', 'arquivado');
CREATE TYPE plan_status AS ENUM ('trial', 'ativo', 'expirado', 'cancelado');
CREATE TYPE payment_status AS ENUM ('pendente', 'pago', 'falhou');


-- Tabela de Fotógrafos (ligada ao auth.users)
CREATE TABLE "photographers" (
  "user_id" uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "full_name" text,
  "email" text UNIQUE,
  "username" text UNIQUE,
  "company_name" text,
  "phone" text,
  "birth_year" integer,
  "cpf" text UNIQUE,
  "pix_key" text,
  "plan" plan_status DEFAULT 'trial',
  "plan_expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Tabela de Clientes (vinculada a um fotógrafo)
CREATE TABLE "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL REFERENCES photographers(user_id) ON DELETE CASCADE,
  "full_name" text NOT NULL,
  "email" text,
  "phone" text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_client_email_per_photographer UNIQUE (photographer_id, email)
);

-- Tabela de Álbuns
CREATE TABLE "albums" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL REFERENCES photographers(user_id) ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "name" text NOT NULL,
  "password" text NOT NULL,
  "max_selection" integer DEFAULT 0,
  "bonus_photos" integer DEFAULT 0,
  "extra_photo_price" numeric(10, 2) DEFAULT 0,
  "status" album_status DEFAULT 'aguardando',
  "expires_at" timestamp with time zone,
  "storage_path" text,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Tabela de Fotos
CREATE TABLE "photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  "url" text NOT NULL,
  "tags" text[],
  "order_number" integer,
  "selected_by_client" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Tabela de Seleções de Fotos
CREATE TABLE "photo_selections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "photo_id" uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  "is_bonus" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Tabela de Logs de Acesso ao Álbum
CREATE TABLE "album_access_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  "client_id" uuid REFERENCES clients(id) ON DELETE SET NULL,
  "accessed_at" timestamp with time zone DEFAULT now(),
  "ip_address" text,
  "user_agent" text
);

-- Tabela de Notificações para o Fotógrafo
CREATE TABLE "photographer_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL REFERENCES photographers(user_id) ON DELETE CASCADE,
  "message" text NOT NULL,
  "related_album_id" uuid REFERENCES albums(id) ON DELETE SET NULL,
  "related_client_id" uuid REFERENCES clients(id) ON DELETE SET NULL,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now()
);

-- Habilitar RLS para todas as tabelas
ALTER TABLE "photographers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "albums" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "photo_selections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "album_access_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "photographer_notifications" ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)
CREATE POLICY "Fotógrafos podem ver e editar seus próprios perfis" ON "photographers"
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Fotógrafos podem gerenciar seus próprios clientes" ON "clients"
  FOR ALL USING (auth.uid() = photographer_id);

CREATE POLICY "Fotógrafos podem gerenciar seus próprios álbuns" ON "albums"
  FOR ALL USING (auth.uid() = photographer_id);
  
CREATE POLICY "Fotógrafos podem gerenciar fotos de seus álbuns" ON "photos"
  FOR ALL USING (
    (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
  );

CREATE POLICY "Fotógrafos podem ver seleções de seus álbuns" ON "photo_selections"
  FOR ALL USING (
    (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
  );

CREATE POLICY "Fotógrafos podem ver logs de seus álbuns" ON "album_access_logs"
  FOR ALL USING (
    (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
  );

CREATE POLICY "Fotógrafos podem ver suas próprias notificações" ON "photographer_notifications"
  FOR ALL USING (auth.uid() = photographer_id);


-- Função para criar perfil de fotógrafo automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (new.raw_user_meta_data ->> 'role') = 'photographer' THEN
    INSERT INTO public.photographers (
      user_id,
      full_name,
      email,
      username,
      company_name
    ) VALUES (
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

-- Função para criar perfil de cliente automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  photographer_user_id uuid;
BEGIN
  IF (new.raw_user_meta_data ->> 'role') = 'client' THEN
    SELECT user_id INTO photographer_user_id
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

-- Gatilho para novos fotógrafos
DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
CREATE TRIGGER on_auth_user_created_photographer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();

-- Gatilho para novos clientes
DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();
