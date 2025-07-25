import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Program, CATEGORIES_COLORS } from '@/types/program';
import { programsService } from '@/services/firebaseService';
import { getCurrentTime, getCurrentDay, timeToMinutes } from '@/utils/timeUtils';
import { toast } from 'sonner';

const Schedule = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadPrograms();
    }
  }, [user]);

  const loadPrograms = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const programsData = await programsService.getAll(user.id);
      setPrograms(programsData);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      toast.error('Erreur lors du chargement des programmes');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return (currentMinutes / (24 * 60)) * 100;
  };

  const getProgramsForDay = (day: string) => {
    return programs.filter(program => program.jour === day);
  };

  const getProgramPosition = (startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const top = (startMinutes / (24 * 60)) * 100;
    const height = ((endMinutes - startMinutes) / (24 * 60)) * 100;
    return { top: `${top}%`, height: `${height}%` };
  };

  const isCurrentProgram = (startTime: string, endTime: string, day: string) => {
    const now = new Date();
    const currentDay = getCurrentDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    if (currentDay !== day) return false;
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  const currentDayIndex = days.indexOf(selectedDay);
  const canGoPrevious = currentDayIndex > 0;
  const canGoNext = currentDayIndex < days.length - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Grille de Programmation</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Visualisez et gérez votre planning radio
              </p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xl sm:text-2xl font-mono font-bold text-primary">
                {currentTime}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {getCurrentDay()}
              </div>
            </div>
          </div>
        </div>

        {/* Day Navigation */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Navigation par jour</span>
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDay(days[currentDayIndex - 1])}
                  disabled={!canGoPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-base sm:text-lg font-semibold min-w-[100px] text-center">
                  {selectedDay}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDay(days[currentDayIndex + 1])}
                  disabled={!canGoNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {days.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className={`${selectedDay === day ? "bg-primary" : ""} flex-shrink-0`}
                >
                  {day}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Grid */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="truncate">Grille du {selectedDay}</span>
              {selectedDay === getCurrentDay() && (
                <Badge variant="secondary" className="ml-2 flex-shrink-0">Aujourd'hui</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="relative overflow-x-auto">
              {/* Hour markers */}
              <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 border-r border-border bg-background z-10">
                {hours.map((hour) => (
                  <div key={hour} className="relative h-12 sm:h-16 border-b border-border/50">
                    <span className="absolute -top-2 left-1 sm:left-2 text-xs text-muted-foreground font-mono">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Program area */}
              <div className="ml-12 sm:ml-16 relative min-w-0" style={{ height: `${hours.length * (window.innerWidth < 640 ? 48 : 64)}px` }}>
                {/* Current time indicator */}
                {selectedDay === getCurrentDay() && (
                  <div 
                    className="time-indicator"
                    style={{ top: `${getCurrentTimePosition()}%` }}
                  />
                )}

                {/* Programs */}
                {getProgramsForDay(selectedDay).map((program) => {
                  const position = getProgramPosition(program.heure_debut, program.heure_fin);
                  const isLive = isCurrentProgram(program.heure_debut, program.heure_fin, program.jour);
                  const categoryGradient = CATEGORIES_COLORS[program.categorie];

                  return (
                    <div
                      key={program.id}
                      className={`absolute left-2 sm:left-4 right-2 sm:right-4 rounded-lg border overflow-hidden transition-all duration-300 hover:scale-105 hover:z-20 ${
                        isLive ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' : 'hover:shadow-lg'
                      }`}
                      style={position}
                    >
                      <div className={`h-full bg-gradient-to-r ${categoryGradient} p-2 sm:p-4 text-white relative`}>
                        {isLive && (
                          <Badge variant="destructive" className="absolute top-1 sm:top-2 right-1 sm:right-2 animate-pulse-live text-xs">
                            🔴 LIVE
                          </Badge>
                        )}
                        
                        <div className="h-full flex flex-col justify-between">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm sm:text-lg mb-1 truncate">{program.nom}</h3>
                            <p className="text-xs sm:text-sm opacity-90 mb-2 line-clamp-2">
                              {program.description}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-xs opacity-75 truncate">
                              {program.animateurs.join(', ')}
                            </div>
                            <div className="text-xs font-mono">
                              {program.heure_debut} - {program.heure_fin}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty slots message */}
                {getProgramsForDay(selectedDay).length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-base sm:text-lg font-medium">Aucun programme prévu</p>
                      <p className="text-xs sm:text-sm">pour le {selectedDay}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
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
  );
};

export default Schedule;
