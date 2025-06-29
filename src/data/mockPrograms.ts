
import { Program } from '@/types/program';

export const mockPrograms: Program[] = [
  {
    id: '1',
    nom: 'Matinale Express',
    animateurs: ['Jean-Pierre Martin', 'Amina Dubois'],
    jour: 'Lundi',
    heure_debut: '06:00',
    heure_fin: '09:00',
    description: 'Réveillez-vous en douceur avec les actualités du jour, la météo et les meilleurs hits',
    categorie: 'Magazine',
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    statut: 'À venir'
  },
  {
    id: '2',
    nom: 'Hits & Mix',
    animateurs: ['Sophie Laurent'],
    jour: 'Lundi',
    heure_debut: '09:00',
    heure_fin: '12:00',
    description: 'Les plus grands hits actuels et les classiques intemporels',
    categorie: 'Musique',
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    statut: 'À venir'
  },
  {
    id: '3',
    nom: 'Journal de Midi',
    animateurs: ['Marc Durand'],
    jour: 'Lundi',
    heure_debut: '12:00',
    heure_fin: '13:00',
    description: 'Toute l\'actualité nationale et internationale',
    categorie: 'Actualité',
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    statut: 'À venir'
  },
  {
    id: '4',
    nom: 'Sport Passion',
    animateurs: ['Thomas Blanc', 'Lisa Moreau'],
    jour: 'Lundi',
    heure_debut: '18:00',
    heure_fin: '19:00',
    description: 'Tous les résultats sportifs et analyses des matchs',
    categorie: 'Sport',
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    statut: 'À venir'
  },
  {
    id: '5',
    nom: 'Culture & Découverte',
    animateurs: ['Marie Rousseau'],
    jour: 'Mardi',
    heure_debut: '14:00',
    heure_fin: '16:00',
    description: 'Partez à la découverte des arts, de la littérature et du patrimoine',
    categorie: 'Culture',
    date_creation: new Date().toISOString(),
    date_modification: new Date().toISOString(),
    statut: 'À venir'
  }
];
