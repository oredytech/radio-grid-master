
export interface Animateur {
  id: string;
  nom: string;
  postnom: string;
  fonction: string;
  photoUrl?: string;
  date_creation: string;
  date_modification: string;
  userId?: string; // Ajout de l'ID utilisateur
}
