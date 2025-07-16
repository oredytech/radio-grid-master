
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import { Program, CATEGORIES_COLORS } from '@/types/program';
import { programsService } from '@/services/firebaseService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'sonner';
import ProgramHeader from '@/components/ProgramHeader';
import ProgramTable from '@/components/ProgramTable';
import ProgramStatistics from '@/components/ProgramStatistics';

const FullProgramView = () => {
  const { radioSlug } = useParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [radioInfo, setRadioInfo] = useState<{ name: string; director: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    if (radioSlug) {
      loadRadioPrograms();
    }
  }, [radioSlug]);

  const loadRadioPrograms = async () => {
    try {
      setIsLoading(true);
      console.log('Chargement des programmes pour radioSlug:', radioSlug);
      
      // Étape 1: Rechercher l'utilisateur par radioSlug
      let userDoc = null;
      let userId = null;
      let userData = null;
      
      try {
        const usersQuery = query(
          collection(db, 'utilisateurs'),
          where('radioSlug', '==', radioSlug)
        );
        const usersSnapshot = await getDocs(usersQuery);
        console.log('Utilisateurs trouvés par radioSlug:', usersSnapshot.size);
        
        if (!usersSnapshot.empty) {
          userDoc = usersSnapshot.docs[0];
          userId = userDoc.id;
          userData = userDoc.data();
          console.log('Utilisateur trouvé:', { userId, userData });
        } else {
          // Recherche alternative par nom de radio
          console.log('Recherche alternative par nom de radio...');
          const radioName = radioSlug.replace(/-/g, ' ').toLowerCase();
          
          const allUsersSnapshot = await getDocs(collection(db, 'utilisateurs'));
          for (const doc of allUsersSnapshot.docs) {
            const data = doc.data();
            const userRadioName = (data.radioName || '').toLowerCase();
            if (userRadioName.includes(radioName) || radioName.includes(userRadioName)) {
              userDoc = doc;
              userId = doc.id;
              userData = data;
              console.log('Utilisateur trouvé par nom de radio:', { userId, userData });
              break;
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateur:', error);
      }
      
      // Étape 2: Définir les informations de la radio
      const defaultRadioName = radioSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Radio';
      const radioName = userData?.radioName || defaultRadioName;
      const directorName = userData?.name || userData?.directeur || 'Directeur de programme non spécifié';
      
      setRadioInfo({
        name: radioName,
        director: directorName
      });
      
      // Étape 3: Récupérer les programmes
      let programsData: Program[] = [];
      
      if (userId) {
        console.log('Récupération des programmes pour userId:', userId);
        
        try {
          // Utiliser le service amélioré
          programsData = await programsService.getAll(userId);
          console.log('Programmes récupérés via service:', programsData.length);
        } catch (serviceError) {
          console.error('Erreur service programmes:', serviceError);
          
          // Recherche manuelle dans toutes les structures possibles
          console.log('Recherche manuelle des programmes...');
          
          // Recherche dans la sous-collection
          try {
            const subCollectionQuery = query(
              collection(db, `utilisateurs/${userId}/programmes`)
            );
            const subCollectionSnapshot = await getDocs(subCollectionQuery);
            
            if (!subCollectionSnapshot.empty) {
              programsData = subCollectionSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  userId: userId,
                  date_creation: data.date_creation?.toDate?.()?.toISOString() || data.date_creation,
                  date_modification: data.date_modification?.toDate?.()?.toISOString() || data.date_modification
                };
              }) as Program[];
              console.log('Programmes trouvés (sous-collection manuelle):', programsData.length);
            } else {
              // Recherche dans la collection principale
              const mainQuery = query(
                collection(db, 'programmes'),
                where('userId', '==', userId)
              );
              const mainSnapshot = await getDocs(mainQuery);
              
              programsData = mainSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  date_creation: data.date_creation?.toDate?.()?.toISOString() || data.date_creation,
                  date_modification: data.date_modification?.toDate?.()?.toISOString() || data.date_modification
                };
              }) as Program[];
              console.log('Programmes trouvés (collection principale):', programsData.length);
            }
          } catch (manualError) {
            console.error('Erreur recherche manuelle:', manualError);
          }
        }
      } else {
        console.log('Aucun utilisateur trouvé pour ce radioSlug');
      }
      
      // Trier les programmes par jour et heure
      programsData.sort((a, b) => {
        const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const dayDiff = dayOrder.indexOf(a.jour) - dayOrder.indexOf(b.jour);
        if (dayDiff !== 0) return dayDiff;
        return a.heure_debut.localeCompare(b.heure_debut);
      });
      
      setPrograms(programsData);
      console.log('Programmes finaux:', programsData.length);
      
    } catch (error) {
      console.error('Erreur générale lors du chargement des programmes:', error);
      // Définir des valeurs par défaut en cas d'erreur
      const defaultRadioName = radioSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Radio';
      setRadioInfo({
        name: defaultRadioName,
        director: 'Directeur de programme non spécifié'
      });
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgramsForDay = (day: string) => {
    return programs.filter(program => program.jour === day)
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
  };

  const shareProgram = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié dans le presse-papiers !');
    } catch (error) {
      try {
        // Fallback pour les navigateurs plus anciens
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Lien copié dans le presse-papiers !');
      } catch (fallbackError) {
        toast.error('Erreur lors de la copie du lien');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du programme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ProgramHeader 
          radioName={radioInfo?.name || radioSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Radio'}
          director={radioInfo?.director || 'Directeur de programme non spécifié'}
          onShare={shareProgram}
        />

        {/* Program Table */}
        <div className="mb-8">
          <ProgramTable programs={programs} radioName={radioInfo?.name || radioSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Radio'} />
        </div>

        {programs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Grille de programmation en préparation</h3>
              <p className="text-muted-foreground">
                La grille de programmation de cette radio sera bientôt disponible.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Weekly Schedule Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {days.map((day) => {
                const dayPrograms = getProgramsForDay(day);
                return (
                  <Card key={day} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5" />
                          <span>{day}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {dayPrograms.length} programmes
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dayPrograms.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Aucun programme</p>
                        </div>
                      ) : (
                        dayPrograms.map((program) => {
                          const categoryGradient = CATEGORIES_COLORS[program.categorie];
                          return (
                            <div
                              key={program.id}
                              className={`p-4 rounded-lg bg-gradient-to-r ${categoryGradient} text-white`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-sm sm:text-base truncate">
                                    {program.nom}
                                  </h3>
                                  <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                                    {program.categorie}
                                  </Badge>
                                </div>
                                
                                <p className="text-xs sm:text-sm opacity-90 line-clamp-2">
                                  {program.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-mono">
                                      {program.heure_debut} - {program.heure_fin}
                                    </span>
                                  </div>
                                  {program.animateurs.length > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-3 w-3" />
                                      <span className="truncate max-w-[100px]">
                                        {program.animateurs.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <ProgramStatistics programs={programs} days={days} />
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Grille de programmation générée avec Radio Programmer
            </p>
            <p className="text-xs text-muted-foreground">
              Fièrement conçu par{' '}
              <a 
                href="https://oredytech.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:text-accent transition-colors"
              >
                Oredy TECHNOLOGIES
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullProgramView;
