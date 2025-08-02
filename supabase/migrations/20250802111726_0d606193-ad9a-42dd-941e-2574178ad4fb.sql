-- Create enum for animateur status
CREATE TYPE public.animateur_status AS ENUM ('invite', 'actif', 'inactif');

-- Create table for animateurs
CREATE TABLE public.animateurs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_user_id text NOT NULL UNIQUE,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  bio text,
  avatar_url text,
  status animateur_status NOT NULL DEFAULT 'invite',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for invitations
CREATE TABLE public.invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  firebase_program_id text NOT NULL,
  radio_slug text NOT NULL,
  radio_nom text NOT NULL,
  directeur_firebase_id text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for animateur programs assignments
CREATE TABLE public.animateur_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animateur_id uuid NOT NULL REFERENCES public.animateurs(id) ON DELETE CASCADE,
  firebase_program_id text NOT NULL,
  can_edit boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(animateur_id, firebase_program_id)
);

-- Enable RLS
ALTER TABLE public.animateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animateur_programs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for animateurs
CREATE POLICY "animateurs_select_policy" 
ON public.animateurs 
FOR SELECT 
USING (true);

CREATE POLICY "animateurs_insert_policy" 
ON public.animateurs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "animateurs_update_policy" 
ON public.animateurs 
FOR UPDATE 
USING (true);

-- Create RLS policies for invitations
CREATE POLICY "invitations_policy" 
ON public.invitations 
FOR ALL 
USING (true);

-- Create RLS policies for animateur_programs
CREATE POLICY "animateur_programs_policy" 
ON public.animateur_programs 
FOR ALL 
USING (true);

-- Create trigger for updated_at on animateurs
CREATE TRIGGER update_animateurs_updated_at
  BEFORE UPDATE ON public.animateurs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();