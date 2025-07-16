
import { useState, useEffect } from 'react';
import ProgramCard from './ProgramCard';
import { Program } from '@/types/program';
import { programsService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';

interface ProgramGridViewProps {
  programs: Program[];
  animateurs: any[];
  onDelete: (programId: string) => Promise<void>;
}

export const ProgramGridView = ({ programs, animateurs, onDelete }: ProgramGridViewProps) => {
  const [localPrograms, setLocalPrograms] = useState<Program[]>(programs);
  const { user } = useAuth();

  useEffect(() => {
    setLocalPrograms(programs);
  }, [programs]);

  const handleDelete = async (programId: string) => {
    if (!user) return;
    
    try {
      await onDelete(programId);
      setLocalPrograms(prev => prev.filter(p => p.id !== programId));
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const refreshPrograms = async () => {
    if (!user) return;
    
    try {
      const updatedPrograms = await programsService.getAll(user.id);
      setLocalPrograms(updatedPrograms);
    } catch (error) {
      console.error('Error refreshing programs:', error);
    }
  };

  useEffect(() => {
    refreshPrograms();
  }, [user]);

  if (localPrograms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun programme trouvé. Commencez par ajouter votre premier programme.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {localPrograms.map((program) => (
        <ProgramCard
          key={program.id}
          program={program}
          onDelete={() => handleDelete(program.id)}
        />
      ))}
    </div>
  );
};
