
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Radio, User } from 'lucide-react';
import { Program } from '@/types/program';
import { Animateur } from '@/types/animateur';
import { programsService, animateursService, radioService } from '@/services/supabaseService';
import { getCurrentTime, getCurrentDay, isCurrentProgram } from '@/utils/timeUtils';

const StudioDisplay = () => {
  const { radioSlug } = useParams();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  const [radioName, setRadioName] = useState('');
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [nextProgram, setNextProgram] = useState<Program | null>(null);
  const [animateurs, setAnimateurs] = useState<Animateur[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(new Date().toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (radioSlug) {
      loadRadioData();
    }
  }, [radioSlug]);

  useEffect(() => {
    if (userId) {
      loadPrograms();
      loadAnimateurs();
    }
  }, [userId]);

  const loadRadioData = async () => {
    try {
      const radio = await radioService.getBySlug(radioSlug || '');
      if (radio) {
        setRadioName(radio.name);
        setUserId(radio.owner_id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données radio:', error);
    }
  };

  const loadPrograms = async () => {
    if (!userId) return;
    
    try {
      const programs = await programsService.getAll(userId);
      const currentDay = getCurrentDay();
      const todayPrograms = programs.filter(p => p.jour === currentDay);
      
      // Trouver le programme en cours
      const current = todayPrograms.find(p => 
        isCurrentProgram(p.heure_debut, p.heure_fin, p.jour)
      );
      
      // Trouver le prochain programme
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const upcoming = todayPrograms
        .filter(p => {
          const startMinutes = parseInt(p.heure_debut.split(':')[0]) * 60 + parseInt(p.heure_debut.split(':')[1]);
          return startMinutes > currentMinutes;
        })
        .sort((a, b) => {
          const aStart = parseInt(a.heure_debut.split(':')[0]) * 60 + parseInt(a.heure_debut.split(':')[1]);
          const bStart = parseInt(b.heure_debut.split(':')[0]) * 60 + parseInt(b.heure_debut.split(':')[1]);
          return aStart - bStart;
        })[0];
      
      setCurrentProgram(current || null);
      setNextProgram(upcoming || null);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
    }
  };

  const loadAnimateurs = async () => {
    if (!userId) return;
    
    try {
      const animateursData = await animateursService.getAll(userId);
      setAnimateurs(animateursData);
    } catch (error) {
      console.error('Erreur lors du chargement des animateurs:', error);
    }
  };

  const getAnimateurInfo = (animateurName: string) => {
    return animateurs.find(a => `${a.nom} ${a.postnom}`.trim() === animateurName.trim());
  };

  const ProgramCard = ({ program, title, isLive = false }: { program: Program | null, title: string, isLive?: boolean }) => {
    if (!program) {
      return (
        <Card className="h-full bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
            <div className="text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun programme</p>
              <p className="text-sm">{title.toLowerCase()}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`h-full ${isLive ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                🔴 EN DIRECT
              </Badge>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-bold text-foreground mb-2">{program.nom}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{program.heure_debut} - {program.heure_fin}</span>
            </div>
            
            <div className="space-y-3">
              {program.animateurs.map((animateurName, index) => {
                const animateur = getAnimateurInfo(animateurName);
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {animateur?.photoUrl ? (
                        <img 
                          src={animateur.photoUrl} 
                          alt={animateurName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{animateurName}</p>
                      {animateur && (
                        <p className="text-xs text-muted-foreground truncate">{animateur.fonction}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec heure et date */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-mono font-bold text-primary mb-2">
            {currentTime}
          </div>
          <div className="flex items-center justify-center space-x-2 text-xl sm:text-2xl lg:text-3xl text-muted-foreground">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="capitalize">{currentDate}</span>
          </div>
        </div>

        {/* Programmes en cours et à venir */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
          <ProgramCard 
            program={currentProgram} 
            title="ÉMISSION EN COURS" 
            isLive={true}
          />
          <ProgramCard 
            program={nextProgram} 
            title="PROCHAINE ÉMISSION" 
          />
        </div>

        {/* Nom de la radio */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-lg">
            <div className="relative">
              <Radio className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {radioName || 'RADIO'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioDisplay;
