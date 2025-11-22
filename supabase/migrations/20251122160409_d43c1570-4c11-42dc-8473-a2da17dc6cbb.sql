-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'directeur', 'animateur');
CREATE TYPE public.program_type AS ENUM ('music', 'talk', 'news', 'sport', 'culture', 'other');
CREATE TYPE public.conducteur_status AS ENUM ('draft', 'pending', 'approved', 'published');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  radio_name TEXT,
  radio_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create radios table
CREATE TABLE public.radios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.radios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view radios"
  ON public.radios FOR SELECT
  USING (true);

CREATE POLICY "Owners can update their radios"
  ON public.radios FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Directeurs can create radios"
  ON public.radios FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'directeur'));

-- Create programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_id TEXT,
  radio_id UUID REFERENCES public.radios(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  type program_type DEFAULT 'other',
  day_of_week INTEGER,
  start_time TIME,
  end_time TIME,
  description TEXT,
  animateur_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(radio_id, slug)
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view programs"
  ON public.programs FOR SELECT
  USING (true);

CREATE POLICY "Radio owners can manage programs"
  ON public.programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.radios
      WHERE radios.id = programs.radio_id
      AND radios.owner_id = auth.uid()
    )
  );

-- Create animateurs table
CREATE TABLE public.animateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  radio_id UUID REFERENCES public.radios(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.animateurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view animateurs"
  ON public.animateurs FOR SELECT
  USING (true);

CREATE POLICY "Animateurs can update their own profile"
  ON public.animateurs FOR UPDATE
  USING (auth.uid() = firebase_user_id);

CREATE POLICY "Radio owners can manage animateurs"
  ON public.animateurs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.radios
      WHERE radios.id = animateurs.radio_id
      AND radios.owner_id = auth.uid()
    )
  );

-- Create animateur_programs junction table
CREATE TABLE public.animateur_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animateur_id UUID REFERENCES public.animateurs(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  firebase_program_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(animateur_id, program_id)
);

ALTER TABLE public.animateur_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view animateur_programs"
  ON public.animateur_programs FOR SELECT
  USING (true);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  radio_id UUID REFERENCES public.radios(id) ON DELETE CASCADE NOT NULL,
  firebase_program_id TEXT,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  nom TEXT,
  prenom TEXT,
  accepted BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view invitations by token"
  ON public.invitations FOR SELECT
  USING (true);

CREATE POLICY "Radio owners can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.radios
      WHERE radios.id = invitations.radio_id
      AND radios.owner_id = auth.uid()
    )
  );

-- Create conducteurs table
CREATE TABLE public.conducteurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  firebase_program_id TEXT NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status conducteur_status DEFAULT 'draft',
  commentaires TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conducteurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conducteurs"
  ON public.conducteurs FOR SELECT
  USING (auth.uid() = firebase_user_id);

CREATE POLICY "Users can create their own conducteurs"
  ON public.conducteurs FOR INSERT
  WITH CHECK (auth.uid() = firebase_user_id);

CREATE POLICY "Users can update their own conducteurs"
  ON public.conducteurs FOR UPDATE
  USING (auth.uid() = firebase_user_id);

CREATE POLICY "Users can delete their own conducteurs"
  ON public.conducteurs FOR DELETE
  USING (auth.uid() = firebase_user_id);

-- Create conducteur_elements table
CREATE TABLE public.conducteur_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conducteur_id UUID REFERENCES public.conducteurs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  titre TEXT NOT NULL,
  artiste TEXT,
  duree TEXT,
  heure TIME,
  notes TEXT,
  ordre INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conducteur_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view elements of their conducteurs"
  ON public.conducteur_elements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conducteurs
      WHERE conducteurs.id = conducteur_elements.conducteur_id
      AND conducteurs.firebase_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create elements for their conducteurs"
  ON public.conducteur_elements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conducteurs
      WHERE conducteurs.id = conducteur_elements.conducteur_id
      AND conducteurs.firebase_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update elements of their conducteurs"
  ON public.conducteur_elements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conducteurs
      WHERE conducteurs.id = conducteur_elements.conducteur_id
      AND conducteurs.firebase_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete elements of their conducteurs"
  ON public.conducteur_elements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.conducteurs
      WHERE conducteurs.id = conducteur_elements.conducteur_id
      AND conducteurs.firebase_user_id = auth.uid()
    )
  );

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = firebase_user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = firebase_user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, radio_name, radio_slug)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'radio_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'radio_slug', '')
  );
  
  -- Insert user role if provided
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_radios_updated_at
  BEFORE UPDATE ON public.radios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_animateurs_updated_at
  BEFORE UPDATE ON public.animateurs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conducteurs_updated_at
  BEFORE UPDATE ON public.conducteurs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conducteur_elements_updated_at
  BEFORE UPDATE ON public.conducteur_elements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();