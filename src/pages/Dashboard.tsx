import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Clock, Calendar, Users, TrendingUp, Zap, Monitor } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ProgramCard from '@/components/ProgramCard';
import { Program } from '@/types/program';
import { programsService, animateursService } from '@/services/firebaseService';
import { getCurrentTime, getCurrentDay, isCurrentProgram } from '@/utils/timeUtils';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDay, setCurrentDay] = useState(getCurrentDay());
  const [programs, setPrograms] = useState<Program[]>([]);
  const [animateursCount, setAnimateursCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDay(getCurrentDay());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [programsData, animateursData] = await Promise.all([
        programsService.getAll(user.id),
        animateursService.getAll(user.id)
      ]);
      setPrograms(programsData);
      setAnimateursCount(animateursData.length);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const currentProgram = programs.find(program => 
    isCurrentProgram(program.heure_debut, program.heure_fin, program.jour)
  );

  const todayPrograms = programs.filter(program => program.jour === currentDay);
  const upcomingPrograms = programs.slice(0, 3);

  // Calcul des vraies statistiques
  const totalHours = programs.reduce((total, program) => {
    const [startHour, startMin] = program.heure_debut.split(':').map(Number);
    const [endHour, endMin] = program.heure_fin.split(':').map(Number);
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return total + duration;
  }, 0);

  const fillRate = Math.round((totalHours / (7 * 24 * 60)) * 100);

  const stats = [
    {
      title: "Programmes Actifs",
      value: programs.length,
      icon: Radio,
      color: "text-blue-500"
    },
    {
      title: "Heures de Diffusion",
      value: `${Math.round(totalHours / 60)}h`,
      icon: Clock,
      color: "text-green-500"
    },
    {
      title: "Animateurs",
      value: animateursCount,
      icon: Users,
      color: "text-purple-500"
    },
    {
      title: "Taux de Remplissage",
      value: `${fillRate}%`,
      icon: TrendingUp,
      color: "text-orange-500"
    }
  ];

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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Vue d'ensemble de votre programmation radio
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl font-mono font-bold text-primary">
                  {currentTime}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {currentDay}
                </div>
              </div>
              <Link to={`/${user.radioSlug}/studio-display`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">Studio Display</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Current Program */}
        {currentProgram && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <Badge variant="destructive" className="animate-pulse-live text-xs sm:text-sm">
                    EN DIRECT MAINTENANT
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 truncate">{currentProgram.nom}</h2>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base line-clamp-2">{currentProgram.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{currentProgram.heure_debut} - {currentProgram.heure_fin}</span>
                    </div>
                    <div className="flex items-center space-x-1 min-w-0">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{currentProgram.animateurs.join(', ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center lg:justify-end">
                  <div className="relative">
                    <Zap className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 animate-pulse" />
                    <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 bg-red-500/20 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="transition-all duration-300 hover:scale-105">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color} flex-shrink-0`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Programs & Upcoming */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">Programmes du {currentDay}</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Votre grille de programmation d'aujourd'hui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                {todayPrograms.length > 0 ? (
                  todayPrograms.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm sm:text-base">
                    Aucun programme prévu pour aujourd'hui
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Prochains Programmes</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Aperçu des émissions à venir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                {upcomingPrograms.map((program) => (
                  <ProgramCard key={program.id} program={program} showDay />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

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

export default Dashboard;
