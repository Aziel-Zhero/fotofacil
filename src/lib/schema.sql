-- Apaga tabelas antigas se existirem para um recomeço limpo
DROP TABLE IF EXISTS "photographer_notifications" CASCADE;
DROP TABLE IF EXISTS "album_access_logs" CASCADE;
DROP TABLE IF EXISTS "photo_selections" CASCADE;
DROP TABLE IF EXISTS "photos" CASCADE;
DROP TABLE IF EXISTS "albums" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "photographers" CASCADE;

-- Apaga tipos e sequências antigas
DROP TYPE IF EXISTS "plan_type";
DROP TYPE IF EXISTS "album_status";
DROP TYPE IF EXISTS "payment_status";
DROP SEQUENCE IF EXISTS "photographer_id_seq";
DROP SEQUENCE IF EXISTS "client_id_seq";

-- 1. Tabela de Fotógrafos
CREATE TABLE photographers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  birth_date date,
  company_name text,
  email text UNIQUE NOT NULL,
  phone text,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Tabela de Clientes
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid REFERENCES photographers(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_client_email_per_photographer UNIQUE (photographer_id, email)
);

-- 3. Tabela de Álbuns
CREATE TYPE album_status AS ENUM ('draft', 'published', 'selection_done', 'expired', 'archived');
CREATE TABLE albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid REFERENCES photographers(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL, -- Garante que todo álbum tem um cliente
  name text NOT NULL,
  password text, -- Senha de acesso para o cliente
  status album_status DEFAULT 'draft',
  max_selection integer DEFAULT 0,
  bonus_photos integer DEFAULT 0,
  extra_photo_price numeric(10, 2) DEFAULT 0,
  storage_path text, -- Caminho para a pasta no Supabase Storage
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. Tabela de Fotos
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
  storage_path text NOT NULL, -- Caminho completo da imagem no Storage
  order_number integer,
  ai_tags text[],
  selected_by_client boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. Tabela de Seleções de Fotos (feitas pelo cliente)
CREATE TABLE photo_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
  photo_id uuid REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  is_bonus boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 6. Tabela de Logs de Acesso
CREATE TABLE album_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  accessed_at timestamptz DEFAULT now(),
  accessed_ip text,
  accessed_user_agent text
);

-- 7. Tabela de Notificações para o Fotógrafo
CREATE TABLE photographer_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid REFERENCES photographers(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  related_album_id uuid REFERENCES albums(id) ON DELETE SET NULL,
  related_client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 8. Gatilho para criar perfil de fotógrafo
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.photographers (user_id, full_name, email, username)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_photographer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (new.raw_user_meta_data->>'role' = 'photographer')
  EXECUTE FUNCTION public.handle_new_photographer();


-- 9. Segurança a Nível de Linha (RLS)
-- Habilita RLS para todas as tabelas
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
-- Fotógrafos podem ver/editar seu próprio perfil
CREATE POLICY "Photographers can see their own profile" ON photographers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Photographers can update their own profile" ON photographers FOR UPDATE USING (user_id = auth.uid());

-- Fotógrafos podem gerenciar seus próprios clientes
CREATE POLICY "Photographers can manage their own clients" ON clients FOR ALL USING (photographer_id = (SELECT id FROM photographers WHERE user_id = auth.uid()));

-- Fotógrafos podem gerenciar seus próprios álbuns
CREATE POLICY "Photographers can manage their own albums" ON albums FOR ALL USING (photographer_id = (SELECT id FROM photographers WHERE user_id = auth.uid()));

-- Fotógrafos podem gerenciar fotos em seus próprios álbuns
CREATE POLICY "Photographers can manage photos in their albums" ON photos FOR ALL USING (album_id IN (SELECT id FROM albums WHERE photographer_id = (SELECT id FROM photographers WHERE user_id = auth.uid())));

-- Fotógrafos podem ver as seleções de seus clientes
CREATE POLICY "Photographers can view selections in their albums" ON photo_selections FOR SELECT USING (album_id IN (SELECT id FROM albums WHERE photographer_id = (SELECT id FROM photographers WHERE user_id = auth.uid())));

-- Fotógrafos podem ver os logs de seus álbuns
CREATE POLICY "Photographers can view logs for their albums" ON album_access_logs FOR SELECT USING (album_id IN (SELECT id FROM albums WHERE photographer_id = (SELECT id FROM photographers WHERE user_id = auth.uid())));

-- Fotógrafos podem ver suas próprias notificações
CREATE POLICY "Photographers can view their own notifications" ON photographer_notifications FOR ALL USING (photographer_id = (SELECT id FROM photographers WHERE user_id = auth.uid()));
