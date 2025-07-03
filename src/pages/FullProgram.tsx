
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Share2, Users, Radio, Copy } from 'lucide-react';
import { Program, CATEGORIES_COLORS } from '@/types/program';
import { programsService } from '@/services/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'sonner';

const FullProgram = () => {
  const { radioSlug } = useParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [radioInfo, setRadioInfo] = useState<{ name: string; director: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    if (radioSlug) {
      loadRadioPrograms();
    }
  }, [radioSlug]);

  const loadRadioPrograms = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer l'ID utilisateur à partir du slug de la radio
      // Pour simplifier, on va chercher dans tous les utilisateurs
      // En production, il faudrait indexer les radios par slug
      
      // Pour le moment, on va utiliser un système simple basé sur le slug
      const userId = radioSlug; // Temporaire - à améliorer
      
      if (userId) {
        // Récupérer les infos de la radio
        const userDoc = await getDoc(doc(db, 'utilisateurs', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRadioInfo({
            name: userData.radioName || 'Radio',
            director: userData.name || 'Directeur'
          });
        }
        
        // Récupérer les programmes
        const programsData = await programsService.getAll(userId);
        setPrograms(programsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      toast.error('Erreur lors du chargement des programmes');
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
      toast.error('Erreur lors de la copie du lien');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!radioInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Radio non trouvée</h2>
            <p className="text-muted-foreground">
              Cette radio n'existe pas ou n'a pas encore publié sa grille de programmation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <Radio className="h-8 w-8 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {radioInfo.name}
                </h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Grille de programmation hebdomadaire - Dirigé par {radioInfo.director}
              </p>
            </div>
            <Button
              onClick={shareProgram}
              variant="outline"
              className="self-start sm:self-auto flex-shrink-0"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

        {/* Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Statistiques de la grille</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {programs.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Programmes total
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {[...new Set(programs.map(p => p.categorie))].length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Catégories
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {[...new Set(programs.flatMap(p => p.animateurs))].length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Animateurs
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {days.filter(day => getProgramsForDay(day).length > 0).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Jours actifs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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

export default FullProgram;
