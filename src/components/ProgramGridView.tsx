
import { Program, CATEGORIES_COLORS } from '@/types/program';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, FileText } from 'lucide-react';

interface ProgramGridViewProps {
  programs: Program[];
}

const ProgramGridView = ({ programs }: ProgramGridViewProps) => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  // Générer les créneaux horaires de 06:00 à 23:00
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Fonction pour trouver le programme à un créneau donné
  const getProgramAtSlot = (day: string, time: string) => {
    return programs.find(program => {
      if (program.jour !== day) return false;
      
      const startTime = program.heure_debut;
      const endTime = program.heure_fin;
      
      return time >= startTime && time < endTime;
    });
  };
  
  // Fonction pour calculer la durée d'un programme en créneaux
  const getProgramDuration = (program: Program) => {
    const [startHour] = program.heure_debut.split(':').map(Number);
    const [endHour] = program.heure_fin.split(':').map(Number);
    return endHour - startHour;
  };
  
  // Fonction pour vérifier si c'est le début d'un programme
  const isProgramStart = (day: string, time: string) => {
    const program = getProgramAtSlot(day, time);
    return program && program.heure_debut === time;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Grille de programmation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* En-tête des jours */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 font-semibold text-center text-sm">Horaire</div>
              {days.map((day) => (
                <div key={day} className="p-2 font-semibold text-center text-sm bg-muted/30 rounded">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grille des programmes */}
            <div className="space-y-1">
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-8 gap-1 min-h-[50px]">
                  {/* Colonne des heures */}
                  <div className="p-2 text-sm font-mono bg-muted/20 rounded flex items-center justify-center">
                    {timeSlot}
                  </div>
                  
                  {/* Colonnes des jours */}
                  {days.map((day) => {
                    const program = getProgramAtSlot(day, timeSlot);
                    const isStart = isProgramStart(day, timeSlot);
                    
                    if (!program) {
                      return (
                        <div key={`${day}-${timeSlot}`} className="border border-gray-200 rounded min-h-[48px]">
                        </div>
                      );
                    }
                    
                    if (!isStart) {
                      return (
                        <div key={`${day}-${timeSlot}`} className="hidden">
                        </div>
                      );
                    }
                    
                    const duration = getProgramDuration(program);
                    const categoryGradient = CATEGORIES_COLORS[program.categorie];
                    
                    return (
                      <HoverCard key={`${day}-${timeSlot}`}>
                        <HoverCardTrigger asChild>
                          <div
                            className={`bg-gradient-to-r ${categoryGradient} text-white rounded p-2 cursor-pointer transition-all hover:shadow-md`}
                            style={{
                              gridRow: `span ${duration}`,
                              minHeight: `${duration * 48 + (duration - 1) * 4}px`
                            }}
                          >
                            <div className="text-xs font-semibold truncate">
                              {program.nom}
                            </div>
                            <div className="text-xs opacity-90 mt-1">
                              {program.heure_debut} - {program.heure_fin}
                            </div>
                          </div>
                        </HoverCardTrigger>
                        
                        <HoverCardContent className="w-80">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-lg font-semibold">{program.nom}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-mono">
                                  {program.heure_debut} - {program.heure_fin}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={`bg-gradient-to-r ${categoryGradient} text-white border-0`}>
                                {program.categorie}
                              </Badge>
                            </div>
                            
                            {program.animateurs.length > 0 && (
                              <div className="flex items-start space-x-2">
                                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="space-y-1">
                                  {program.animateurs.map((animateur, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs mr-1">
                                      {animateur}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {program.description && (
                              <div className="flex items-start space-x-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-sm text-muted-foreground">
                                  {program.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramGridView;
