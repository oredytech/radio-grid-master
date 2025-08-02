
// Ancienne interface Animateur pour compatibilité Firebase
export interface Animateur {
  id: string;
  nom: string;
  postnom: string;
  fonction: string;
  photoUrl?: string;
  date_creation: string;
  date_modification: string;
  userId?: string;
}

// Nouvelles interfaces pour le système Supabase
export type AnimateurStatus = 'invite' | 'actif' | 'inactif';

export interface AnimateurSupabase {
  id: string;
  firebase_user_id: string;
  nom: string;
  prenom: string;
  email: string;
  slug: string;
  bio?: string;
  avatar_url?: string;
  status: AnimateurStatus;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  firebase_program_id: string;
  radio_slug: string;
  radio_nom: string;
  directeur_firebase_id: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface AnimateurProgram {
  id: string;
  animateur_id: string;
  firebase_program_id: string;
  can_edit: boolean;
  created_at: string;
}

export interface AnimateurWithPrograms extends AnimateurSupabase {
  programs: AnimateurProgram[];
}
