
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileText, Check, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { programsService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';

interface ImportedProgram {
  titre: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  type: string;
  animateur: string;
  description?: string;
  valid: boolean;
  errors: string[];
}

const validDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const validTypes = ['Musique', 'Divertissement', 'Sport', 'Culture', 'Magazine', 'Actualité', 'Religion'];

export const ProgramImport = ({ onImportComplete }: { onImportComplete?: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedProgram[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useAuth();

  const validateProgram = (program: any): ImportedProgram => {
    const errors: string[] = [];
    
    if (!program.titre || typeof program.titre !== 'string') {
      errors.push('Titre manquant ou invalide');
    }
    
    if (!program.jour || !validDays.includes(program.jour)) {
      errors.push(`Jour invalide. Doit être: ${validDays.join(', ')}`);
    }
    
    if (!program.heureDebut || !program.heureFin) {
      errors.push('Heures de début et fin requises');
    }
    
    if (!program.type || !validTypes.includes(program.type)) {
      errors.push(`Type invalide. Doit être: ${validTypes.join(', ')}`);
    }
    
    if (!program.animateur || typeof program.animateur !== 'string') {
      errors.push('Animateur requis');
    }

    return {
      titre: program.titre || '',
      jour: program.jour || '',
      heureDebut: program.heureDebut || '',
      heureFin: program.heureFin || '',
      type: program.type || '',
      animateur: program.animateur || '',
      description: program.description || '',
      valid: errors.length === 0,
      errors
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const validatedData = jsonData.map(validateProgram);
        setImportedData(validatedData);
        
        const validCount = validatedData.filter(p => p.valid).length;
        const totalCount = validatedData.length;
        
        toast.success(`${validCount}/${totalCount} programmes valides trouvés`);
      } catch (error) {
        toast.error('Erreur lors de la lecture du fichier');
        console.error('File reading error:', error);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    if (!user) {
      toast.error('Utilisateur non connecté');
      return;
    }

    const validPrograms = importedData.filter(p => p.valid);
    if (validPrograms.length === 0) {
      toast.error('Aucun programme valide à importer');
      return;
    }

    setIsImporting(true);
    
    try {
      for (const program of validPrograms) {
        const programData = {
          nom: program.titre,
          jour: program.jour as "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche",
          heure_debut: program.heureDebut,
          heure_fin: program.heureFin,
          categorie: program.type as "Musique" | "Divertissement" | "Sport" | "Culture" | "Magazine" | "Actualité" | "Religion",
          animateurs: [program.animateur],
          description: program.description || '',
          date_creation: new Date().toISOString(),
          date_modification: new Date().toISOString(),
          statut: 'En cours' as const
        };
        
        await programsService.create(programData, user.id);
      }
      
      toast.success(`${validPrograms.length} programmes importés avec succès`);
      setImportedData([]);
      setFile(null);
      onImportComplete?.();
    } catch (error) {
      toast.error('Erreur lors de l\'importation');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importer des programmes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Fichier Excel/CSV (colonnes: titre, jour, heureDebut, heureFin, type, animateur, description)
          </label>
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
        </div>

        {importedData.length > 0 && (
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
              <h3 className="font-medium mb-2">Aperçu des données ({importedData.length} programmes)</h3>
              <div className="space-y-2">
                {importedData.map((program, index) => (
                  <div key={index} className={`p-2 rounded text-sm ${program.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                    <div className="flex items-center gap-2">
                      {program.valid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{program.titre}</span>
                      <span className="text-muted-foreground">
                        {program.jour} {program.heureDebut}-{program.heureFin}
                      </span>
                    </div>
                    {!program.valid && (
                      <ul className="mt-1 text-red-600 text-xs">
                        {program.errors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {importedData.filter(p => p.valid).length} programmes valides sur {importedData.length}
              </div>
              <Button
                onClick={handleImport}
                disabled={isImporting || importedData.filter(p => p.valid).length === 0}
                className="flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importation...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Importer les programmes valides
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
