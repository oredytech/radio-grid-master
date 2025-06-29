
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Vue d'ensemble de votre programmation radio
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-primary">
                {currentTime}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentDay}
              </div>
            </div>
          </div>
        </div>

        {/* Current Program */}
        {currentProgram && (
          <Card className="mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                  <Badge variant="destructive" className="animate-pulse-live">
                    EN DIRECT MAINTENANT
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-2">{currentProgram.nom}</h2>
                  <p className="text-muted-foreground mb-4">{currentProgram.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{currentProgram.heure_debut} - {currentProgram.heure_fin}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{currentProgram.animateurs.join(', ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <Zap className="h-16 w-16 text-red-500 animate-pulse" />
                    <div className="absolute inset-0 h-16 w-16 bg-red-500/20 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Programs & Upcoming */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Programmes du {currentDay}</span>
              </CardTitle>
              <CardDescription>
                Votre grille de programmation d'aujourd'hui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayPrograms.length > 0 ? (
                  todayPrograms.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun programme prévu pour aujourd'hui
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Prochains Programmes</span>
              </CardTitle>
              <CardDescription>
                Aperçu des émissions à venir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPrograms.map((program) => (
                  <ProgramCard key={program.id} program={program} showDay />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
