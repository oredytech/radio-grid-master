
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Calendar, Users, Trash2, Edit, Replace } from 'lucide-react';
import { Program } from '@/types/program';
import { ProgramConflict } from '@/utils/programConflicts';

interface ProgramConflictDialogProps {
  open: boolean;
  onClose: () => void;
  conflicts: ProgramConflict[];
  onReplace: (conflictingPrograms: Program[]) => void;
  onModify: (program: Program) => void;
  onDelete: (programs: Program[]) => void;
  onContinue: () => void;
}

export const ProgramConflictDialog = ({
  open,
  onClose,
  conflicts,
  onReplace,
  onModify,
  onDelete,
  onContinue
}: ProgramConflictDialogProps) => {
  const [selectedAction, setSelectedAction] = useState<'replace' | 'modify' | 'delete' | null>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);

  const handleAction = () => {
    if (!selectedAction) return;

    switch (selectedAction) {
      case 'replace':
        onReplace(selectedPrograms);
        break;
      case 'modify':
        if (selectedPrograms.length === 1) {
          onModify(selectedPrograms[0]);
        }
        break;
      case 'delete':
        onDelete(selectedPrograms);
        break;
    }
    onClose();
  };

  const allConflictingPrograms = conflicts.flatMap(conflict => conflict.existingPrograms);
  const uniquePrograms = allConflictingPrograms.filter((program, index, self) => 
    index === self.findIndex(p => p.id === program.id)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <span>Conflit de programmation détecté</span>
          </DialogTitle>
          <DialogDescription>
            Des programmes existent déjà aux horaires sélectionnés. Choisissez comment procéder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conflits détectés */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Conflits détectés :</h3>
            {conflicts.map((conflict, index) => (
              <Card key={index} className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{conflict.jour}</span>
                    <Clock className="h-4 w-4 ml-4" />
                    <span>{conflict.heure_debut} - {conflict.heure_fin}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conflict.existingPrograms.map((program) => (
                    <div key={program.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{program.nom}</h4>
                          <Badge variant="outline">{program.categorie}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {program.heure_debut} - {program.heure_fin}
                        </p>
                        {program.animateurs.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              {program.animateurs.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions disponibles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Que souhaitez-vous faire ?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedAction === 'replace' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  setSelectedAction('replace');
                  setSelectedPrograms(uniquePrograms);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Replace className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Remplacer</h4>
                      <p className="text-sm text-muted-foreground">
                        Supprimer les programmes existants et créer le nouveau
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedAction === 'modify' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  setSelectedAction('modify');
                  setSelectedPrograms(uniquePrograms.slice(0, 1));
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Edit className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Modifier</h4>
                      <p className="text-sm text-muted-foreground">
                        Éditer le programme existant pour éviter le conflit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedAction === 'delete' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  setSelectedAction('delete');
                  setSelectedPrograms(uniquePrograms);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Trash2 className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">Supprimer</h4>
                      <p className="text-sm text-muted-foreground">
                        Supprimer uniquement les programmes en conflit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-accent/50" onClick={onContinue}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium">Continuer quand même</h4>
                      <p className="text-sm text-muted-foreground">
                        Créer le programme malgré le conflit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            {selectedAction && selectedAction !== 'continue' && (
              <Button onClick={handleAction}>
                Confirmer {selectedAction === 'replace' ? 'le remplacement' : 
                         selectedAction === 'modify' ? 'la modification' : 
                         'la suppression'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
