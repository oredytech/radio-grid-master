
import { Program } from '@/types/program';

export interface ProgramConflict {
  jour: Program['jour'];
  heure_debut: string;
  heure_fin: string;
  existingPrograms: Program[];
}

export const detectProgramConflicts = (
  programs: Program[],
  selectedDays: Program['jour'][],
  heureDebut: string,
  heureFin: string
): ProgramConflict[] => {
  const conflicts: ProgramConflict[] = [];

  selectedDays.forEach(jour => {
    const conflictingPrograms = programs.filter(program => {
      if (program.jour !== jour) return false;

      // Check for time overlap
      const existingStart = program.heure_debut;
      const existingEnd = program.heure_fin;
      
      // Convert times to minutes for easier comparison
      const toMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const newStart = toMinutes(heureDebut);
      const newEnd = toMinutes(heureFin);
      const progStart = toMinutes(existingStart);
      const progEnd = toMinutes(existingEnd);

      // Check if there's any overlap
      return (newStart < progEnd && newEnd > progStart);
    });

    if (conflictingPrograms.length > 0) {
      conflicts.push({
        jour,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        existingPrograms: conflictingPrograms
      });
    }
  });

  return conflicts;
};
