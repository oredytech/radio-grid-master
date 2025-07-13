
import { Button } from '@/components/ui/button';
import { Share2, Radio } from 'lucide-react';

interface ProgramHeaderProps {
  radioName: string;
  director: string;
  onShare: () => void;
}

const ProgramHeader = ({ radioName, director, onShare }: ProgramHeaderProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <Radio className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {radioName}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Grille de programmation hebdomadaire - Dirigé par {director}
          </p>
        </div>
        <Button
          onClick={onShare}
          variant="outline"
          className="self-start sm:self-auto flex-shrink-0"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </div>
    </div>
  );
};

export default ProgramHeader;
