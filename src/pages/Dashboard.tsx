
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Clock, Calendar, Users, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ProgramCard from '@/components/ProgramCard';
import { mockPrograms } from '@/data/mockPrograms';
import { getCurrentTime, getCurrentDay, isCurrentProgram } from '@/utils/timeUtils';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDay, setCurrentDay] = useState(getCurrentDay());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDay(getCurrentDay());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const currentProgram = mockPrograms.find(program => 
    isCurrentProgram(program.heure_debut, program.heure_fin, program.jour)
  );

  const todayPrograms = mockPrograms.filter(program => program.jour === currentDay);
  const upcomingPrograms = mockPrograms.slice(0, 3);

  const stats = [
    {
      title: "Programmes Actifs",
      value: mockPrograms.length,
      icon: Radio,
      color: "text-blue-500"
    },
    {
      title: "Heures de Diffusion",
      value: "168h",
      icon: Clock,
      color: "text-green-500"
    },
    {
      title: "Animateurs",
      value: "12",
      icon: Users,
      color: "text-purple-500"
    },
    {
      title: "Taux de Remplissage",
      value: "85%",
      icon: TrendingUp,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Vue d'ensemble de votre programmation radio
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-mono font-bold text-primary">
                {currentTime}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {currentDay}
              </div>
            </div>
          </div>
        </div>

        {/* Current Program */}
        {currentProgram && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                  <Badge variant="destructive" className="animate-pulse-live text-xs sm:text-sm">
                    EN DIRECT MAINTENANT
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">{currentProgram.nom}</h2>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">{currentProgram.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{currentProgram.heure_debut} - {currentProgram.heure_fin}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Programmes du {currentDay}</span>
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

          <Card>
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
          <p className="text-center text-sm text-muted-foreground">
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
