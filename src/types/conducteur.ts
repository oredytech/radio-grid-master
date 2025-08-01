export type ConducteurStatus = 'brouillon' | 'en_attente' | 'valide' | 'rejete';

export type ElementType = 
  | 'introduction' 
  | 'rubrique' 
  | 'intervenant' 
  | 'musique' 
  | 'pub' 
  | 'meteo' 
  | 'flash' 
  | 'chronique' 
  | 'conclusion';

export interface Conducteur {
  id: string;
  firebase_user_id: string;
  firebase_program_id: string;
  titre: string;
  date_emission: string;
  heure_debut: string;
  heure_fin: string;
  status: ConducteurStatus;
  commentaires_directeur?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ConducteurElement {
  id: string;
  conducteur_id: string;
  ordre: number;
  type: ElementType;
  titre: string;
  description?: string;
  duree_minutes?: number;
  heure_prevue?: string;
  notes_techniques?: string;
  intervenant?: string;
  musique_titre?: string;
  musique_artiste?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  firebase_user_id: string;
  type: string;
  titre: string;
  message: string;
  conducteur_id?: string;
  lu: boolean;
  created_at: string;
}

export interface ConducteurWithElements extends Conducteur {
  elements: ConducteurElement[];
}