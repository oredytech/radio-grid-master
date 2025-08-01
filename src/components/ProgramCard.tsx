
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Calendar } from 'lucide-react';
import { Program, CATEGORIES_COLORS } from '@/types/program';
import { formatDuration, isCurrentProgram } from '@/utils/timeUtils';

interface ProgramCardProps {
  program: Program;
  showDay?: boolean;
  onDelete?: () => Promise<void>;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, showDay = false }) => {
  const isLive = isCurrentProgram(program.heure_debut, program.heure_fin, program.jour);
  const categoryGradient = CATEGORIES_COLORS[program.categorie];
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${
      isLive ? 'ring-2 ring-red-500 shadow-red-500/20' : ''
    }`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryGradient}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight">{program.nom}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{program.heure_debut} - {program.heure_fin}</span>
              </div>
              {showDay && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{program.jour}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {isLive && (
              <Badge variant="destructive" className="animate-pulse-live">
                🔴 EN DIRECT
              </Badge>
            )}
            <Badge variant="secondary">{program.categorie}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {program.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{program.animateurs.join(', ')}</span>
          </div>
          
          <Badge variant="outline">
            {formatDuration(program.heure_debut, program.heure_fin)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramCard;
