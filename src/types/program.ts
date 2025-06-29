
export interface Program {
  id: string;
  nom: string;
  animateurs: string[];
  jour: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
  heure_debut: string;
  heure_fin: string;
  description: string;
  categorie: 'Magazine' | 'Musique' | 'Sport' | 'Actualité' | 'Culture' | 'Religion' | 'Divertissement';
  imageUrl?: string;
  date_creation: string;
  date_modification: string;
  statut: 'En cours' | 'Terminé' | 'À venir';
}

export const CATEGORIES_COLORS = {
  'Magazine': 'from-blue-500 to-blue-600',
  'Musique': 'from-purple-500 to-purple-600',
  'Sport': 'from-green-500 to-green-600',
  'Actualité': 'from-red-500 to-red-600',
  'Culture': 'from-amber-500 to-amber-600',
  'Religion': 'from-indigo-500 to-indigo-600',
  'Divertissement': 'from-pink-500 to-pink-600'
};
