import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Program } from '@/types/program';
import ProgramCard from './ProgramCard';

interface ProgramGridViewProps {
  programs: Program[];
  animateurs: any[]; // Replace 'any' with the actual type of animateurs if available
  onDelete: (id: string) => Promise<void>;
}

const ProgramGridView = ({ programs, animateurs, onDelete }: ProgramGridViewProps) => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const getProgramsForDay = (day: string) => {
    return programs.filter(program => program.jour === day)
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
  };

  const handleDelete = async (programId: string) => {
    await onDelete(programId);
  };

  return (
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
                dayPrograms.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    animateurs={animateurs}
                    onDelete={() => handleDelete(program.id)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProgramGridView;
