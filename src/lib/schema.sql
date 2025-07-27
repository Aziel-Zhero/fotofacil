-- Apaga tabelas antigas se existirem, para um ambiente limpo.
DROP TABLE IF EXISTS "photographer_notifications" CASCADE;
DROP TABLE IF EXISTS "album_access_logs" CASCADE;
DROP TABLE IF EXISTS "photo_selections" CASCADE;
DROP TABLE IF EXISTS "photos" CASCADE;
DROP TABLE IF EXISTS "albums" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "photographers" CASCADE;

-- Apaga tipos personalizados antigos se existirem.
DROP TYPE IF EXISTS "album_status";
DROP TYPE IF EXISTS "plan_type";
DROP TYPE IF EXISTS "payment_status";

-- Tipos Personalizados (ENUMs) para padronizar valores.
CREATE TYPE "album_status" AS ENUM ('aguardando_selecao', 'selecao_completa', 'entregue', 'expirado');
CREATE TYPE "plan_type" AS ENUM ('trial', 'essencial_mensal', 'essencial_semestral', 'estudio_anual');
CREATE TYPE "payment_status" AS ENUM ('pendente', 'pago', 'falhou');

-- Tabela para os usuários fotógrafos.
CREATE TABLE "photographers" (
  "id" uuid NOT NULL PRIMARY KEY, -- Chave primária vinculada ao auth.users.id
  "custom_id" text UNIQUE,
  "full_name" text,
  "birth_date" date,
  "company_name" text,
  "email" text UNIQUE,
  "phone" text,
  "username" text UNIQUE,
  "pix_key" text,
  "plan" plan_type DEFAULT 'trial',
  "plan_started_at" timestamptz,
  "plan_expires_at" timestamptz,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz DEFAULT now()
);

-- Tabela para os clientes dos fotógrafos.
CREATE TABLE "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL REFERENCES "photographers"(id) ON DELETE CASCADE,
  "custom_id" text UNIQUE,
  "full_name" text NOT NULL,
  "email" text,
  "phone" text,
  "created_at" timestamptz DEFAULT now(),
  UNIQUE(photographer_id, email) -- Garante que o email de um cliente é único por fotógrafo.
);

-- Tabela para os álbuns.
CREATE TABLE "albums" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL REFERENCES "photographers"(id) ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES "clients"(id) ON DELETE CASCADE,
  "name" text NOT NULL,
  "password" text NOT NULL,
  "max_selection" integer DEFAULT 0,
  "bonus_photos" integer DEFAULT 0,
  "extra_photo_price" numeric(10, 2) DEFAULT 0.00,
  "status" album_status DEFAULT 'aguardando_selecao',
  "storage_path" text,
  "expires_at" timestamptz,
  "created_at" timestamptz DEFAULT now()
);

-- Tabela para as fotos de cada álbum.
CREATE TABLE "photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES "albums"(id) ON DELETE CASCADE,
  "url" text NOT NULL,
  "tags" text[],
  "order_number" integer,
  "selected_by_client" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now()
);

-- Tabela para registrar as seleções de fotos dos clientes.
CREATE TABLE "photo_selections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES "albums"(id) ON DELETE CASCADE,
  "client_id" uuid NOT NULL REFERENCES "clients"(id) ON DELETE CASCADE,
  "photo_id" uuid NOT NULL REFERENCES "photos"(id) ON DELETE CASCADE,
  "is_bonus" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now()
);

-- Tabela de logs de acesso aos álbuns.
CREATE TABLE "album_access_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "album_id" uuid NOT NULL REFERENCES "albums"(id) ON DELETE CASCADE,
  "client_id" uuid REFERENCES "clients"(id) ON DELETE SET NULL,
  "accessed_at" timestamptz DEFAULT now(),
  "ip_address" text,
  "user_agent" text
);

-- Tabela de notificações para fotógrafos.
CREATE TABLE "photographer_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "photographer_id" uuid NOT NULL REFERENCES "photographers"(id) ON DELETE CASCADE,
  "message" text NOT NULL,
  "related_album_id" uuid REFERENCES "albums"(id),
  "related_client_id" uuid REFERENCES "clients"(id),
  "is_read" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now()
);

--- SEQUENCES PARA IDs PERSONALIZADOS ---
CREATE SEQUENCE IF NOT EXISTS photographer_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS client_id_seq START 1;

--- FUNÇÕES E GATILHOS (TRIGGERS) ---

-- Função para criar um perfil de fotógrafo ao criar um usuário no Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.photographers (id, email, full_name, username, company_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'company_name'
  );
  UPDATE public.photographers
  SET custom_id = 'AZ' || LPAD(nextval('photographer_id_seq')::text, 8, '0')
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho que executa a função acima após a criação de um novo usuário.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Função para gerar o custom_id do cliente.
CREATE OR REPLACE FUNCTION public.generate_client_custom_id()
RETURNS TRIGGER AS $$
BEGIN
  new.custom_id := 'ED' || lpad(nextval('client_id_seq')::text, 8, '0');
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Gatilho para gerar o custom_id do cliente.
CREATE TRIGGER set_client_custom_id
  BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE PROCEDURE public.generate_client_custom_id();


-- Função para criar notificação de acesso ao álbum.
CREATE OR REPLACE FUNCTION public.notify_on_album_access()
RETURNS TRIGGER AS $$
DECLARE
  photographer_id_val uuid;
  client_name text;
  album_name text;
BEGIN
  -- Obter dados do álbum e cliente
  SELECT a.photographer_id, a.name, c.full_name
  INTO photographer_id_val, album_name, client_name
  FROM albums a
  JOIN clients c ON a.client_id = c.id
  WHERE a.id = new.album_id;

  -- Inserir notificação
  INSERT INTO public.photographer_notifications (photographer_id, related_album_id, related_client_id, message)
  VALUES (
    photographer_id_val,
    new.album_id,
    new.client_id,
    'O cliente ' || COALESCE(client_name, 'desconhecido') || ' acessou o álbum "' || album_name || '".'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho para notificar sobre acesso ao álbum.
CREATE TRIGGER on_album_access
  AFTER INSERT ON public.album_access_logs
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_album_access();


--- POLÍTICAS DE SEGURANÇA (ROW-LEVEL SECURITY) ---

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para 'photographers'
CREATE POLICY "Fotógrafos podem ver e editar seus próprios perfis."
  ON public.photographers FOR ALL
  USING (auth.uid() = id);

-- Políticas para 'clients'
CREATE POLICY "Fotógrafos podem gerenciar seus próprios clientes."
  ON public.clients FOR ALL
  USING (auth.uid() = photographer_id);

-- Políticas para 'albums'
CREATE POLICY "Fotógrafos podem gerenciar seus próprios álbuns."
  ON public.albums FOR ALL
  USING (auth.uid() = photographer_id);

-- Políticas para 'photos'
CREATE POLICY "Fotógrafos podem gerenciar fotos de seus próprios álbuns."
  ON public.photos FOR ALL
  USING (
    (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
  );

-- Políticas para 'photo_selections'
CREATE POLICY "Fotógrafos podem ver seleções de seus próprios álbuns."
  ON public.photo_selections FOR ALL
  USING (
    (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
  );

-- Políticas para 'album_access_logs'
CREATE POLICY "Fotógrafos podem ver os logs de acesso de seus próprios álbuns."
  ON public.album_access_logs FOR ALL
  USING (
    (SELECT photographer_id FROM albums WHERE id = album_id) = auth.uid()
  );

-- Políticas para 'photographer_notifications'
CREATE POLICY "Fotógrafos podem ver suas próprias notificações."
  ON public.photographer_notifications FOR ALL
  USING (auth.uid() = photographer_id);
