-- Tipos personalizados para status (ENUMs)
CREATE TYPE public.album_status AS ENUM ('aguardando_selecao', 'selecao_completa', 'entregue', 'expirado', 'arquivado');
CREATE TYPE public.plan_type AS ENUM ('trial', 'essencial_mensal', 'essencial_semestral', 'estudio_anual');
CREATE TYPE public.payment_status AS ENUM ('pendente', 'pago', 'falhou', 'reembolsado');
CREATE TYPE public.notification_type AS ENUM ('acesso_album', 'selecao_finalizada', 'pagamento_recebido');

-- Tabela de Usuários (sincronizada com auth.users)
CREATE TABLE public.photographers (
    id UUID PRIMARY KEY, -- Chave primária referenciando auth.users.id
    custom_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    birth_year INTEGER,
    company_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    cpf TEXT UNIQUE,
    username TEXT UNIQUE,
    pix_key TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_auth_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela de Clientes (vinculados a um fotógrafo)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    custom_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_client_email_per_photographer UNIQUE (photographer_id, email)
);

-- Tabela de Álbuns
CREATE TABLE public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    password TEXT,
    storage_path TEXT,
    max_selection INTEGER DEFAULT 0,
    bonus_photos INTEGER DEFAULT 0,
    extra_photo_price NUMERIC(10, 2) DEFAULT 0,
    status public.album_status DEFAULT 'aguardando_selecao',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Fotos
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    tags TEXT[],
    order_number INTEGER,
    selected_by_client BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Seleções de Fotos (feitas pelo cliente)
CREATE TABLE public.photo_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    is_bonus BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(album_id, photo_id)
);

-- Tabela de Assinaturas dos Fotógrafos
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    plan public.plan_type NOT NULL,
    status public.payment_status DEFAULT 'pendente',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Logs de Acesso ao Álbum
CREATE TABLE public.album_access_logs (
    id BIGSERIAL PRIMARY KEY,
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Tabela de Notificações para o Fotógrafo
CREATE TABLE public.photographer_notifications (
    id BIGSERIAL PRIMARY KEY,
    photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    message TEXT NOT NULL,
    related_album_id UUID REFERENCES public.albums(id),
    related_client_id UUID REFERENCES public.clients(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

---
--- SEQUENCES E TRIGGERS PARA IDS PERSONALIZADOS
---

-- Sequência para fotógrafos (AZ...)
CREATE SEQUENCE public.photographer_custom_id_seq START 1;
CREATE OR REPLACE FUNCTION public.generate_photographer_custom_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.custom_id := 'AZ' || LPAD(nextval('photographer_custom_id_seq')::TEXT, 8, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_photographer_custom_id
BEFORE INSERT ON public.photographers
FOR EACH ROW EXECUTE FUNCTION public.generate_photographer_custom_id();

-- Sequência para clientes (ED...)
CREATE SEQUENCE public.client_custom_id_seq START 1;
CREATE OR REPLACE FUNCTION public.generate_client_custom_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.custom_id := 'ED' || LPAD(nextval('client_custom_id_seq')::TEXT, 8, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_client_custom_id
BEFORE INSERT ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.generate_client_custom_id();


---
--- FUNÇÕES E TRIGGERS DE AUTOMAÇÃO
---

-- Gatilho para criar perfil de FOTÓGRAFO
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.raw_user_meta_data ->> 'role') = 'photographer' THEN
    INSERT INTO public.photographers (id, full_name, email, username, company_name)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'fullName',
      NEW.email,
      NEW.raw_user_meta_data ->> 'username',
      NEW.raw_user_meta_data ->> 'companyName'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_photographer
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();

-- Gatilho para criar perfil de CLIENTE
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  photographer_uuid UUID;
BEGIN
  IF (NEW.raw_user_meta_data ->> 'role') = 'client' THEN
    -- Encontra o fotógrafo responsável pelo username. Em um app real, isso poderia ser um ID.
    SELECT id INTO photographer_uuid
    FROM public.photographers
    WHERE username = (NEW.raw_user_meta_data ->> 'photographer_username')
    LIMIT 1;

    -- Se não encontrar o fotógrafo, pode lançar um erro ou lidar de outra forma.
    IF photographer_uuid IS NULL THEN
      RAISE EXCEPTION 'Fotógrafo de referência não encontrado para o cliente.';
    END IF;

    INSERT INTO public.clients (photographer_id, full_name, email, phone)
    VALUES (
      photographer_uuid,
      NEW.raw_user_meta_data ->> 'fullName',
      NEW.email,
      NEW.raw_user_meta_data ->> 'whatsapp'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_client
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();


-- Gatilho para notificar fotógrafo no acesso ao álbum
CREATE OR REPLACE FUNCTION public.notify_on_album_access()
RETURNS TRIGGER AS $$
DECLARE
  photog_id UUID;
  client_name TEXT;
  album_name TEXT;
BEGIN
  SELECT a.photographer_id, a.name, c.full_name
  INTO photog_id, album_name, client_name
  FROM public.albums a
  JOIN public.clients c ON a.client_id = c.id
  WHERE a.id = NEW.album_id;

  INSERT INTO public.photographer_notifications (photographer_id, type, message, related_album_id, related_client_id)
  VALUES (
    photog_id,
    'acesso_album',
    'O cliente ' || client_name || ' acessou o álbum "' || album_name || '".',
    NEW.album_id,
    NEW.client_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_album_access
AFTER INSERT ON public.album_access_logs
FOR EACH ROW EXECUTE FUNCTION public.notify_on_album_access();

---
--- POLÍTICAS DE SEGURANÇA (RLS - Row-Level Security)
---

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para PHOTOGRAPHERS
CREATE POLICY "Fotógrafos podem ver e editar seu próprio perfil"
ON public.photographers FOR ALL
USING (auth.uid() = id);

-- Políticas para CLIENTS
CREATE POLICY "Fotógrafos podem gerenciar seus próprios clientes"
ON public.clients FOR ALL
USING (auth.uid() = photographer_id);

-- Políticas para ALBUMS
CREATE POLICY "Fotógrafos podem gerenciar seus próprios álbuns"
ON public.albums FOR ALL
USING (auth.uid() = photographer_id);

-- Políticas para PHOTOS
CREATE POLICY "Fotógrafos podem gerenciar fotos de seus próprios álbuns"
ON public.photos FOR ALL
USING (
  (SELECT photographer_id FROM public.albums WHERE id = album_id) = auth.uid()
);

-- Políticas para NOTIFICATIONS
CREATE POLICY "Fotógrafos podem ver suas próprias notificações"
ON public.photographer_notifications FOR ALL
USING (auth.uid() = photographer_id);

-- ... Adicionar mais políticas conforme necessário para outras tabelas ...
-- (Ex: Clientes podem ver os álbuns/fotos compartilhados com eles)
