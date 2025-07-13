
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Program } from '@/types/program';

interface ProgramStatisticsProps {
  programs: Program[];
  days: string[];
}

const ProgramStatistics = ({ programs, days }: ProgramStatisticsProps) => {
  const getProgramsForDay = (day: string) => {
    return programs.filter(program => program.jour === day);
  };

  return (
    <Card>
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
  );
};

export default ProgramStatistics;
