
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Program } from '@/types/program';

interface ProgramActionsProps {
  program: Program;
  onEdit: (program: Program) => void;
  onDelete: (programId: string) => void;
  onViewFull: () => void;
}

const ProgramActions: React.FC<ProgramActionsProps> = ({
  program,
  onEdit,
  onDelete,
  onViewFull
}) => {
  return (
    <div className="flex space-x-2 flex-shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(program)}
        title="Modifier le programme"
      >
        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Modifier</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onViewFull}
        title="Voir le programme complet"
      >
        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Voir tout</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(program.id)}
        className="text-destructive hover:text-destructive"
        title="Supprimer le programme"
      >
        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="sr-only sm:not-sr-only sm:ml-1">Supprimer</span>
      </Button>
    </div>
  );
};

export default ProgramActions;
