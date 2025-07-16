
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Program } from '@/types/program';
import { programsService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';

interface ImportedProgram {
  nom: string;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  animateurs: string;
  categorie: string;
  description: string;
}

const ProgramImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importedData, setImportedData] = useState<ImportedProgram[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateDay = (day: string): boolean => {
    const validDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return validDays.includes(day);
  };

  const validateCategory = (category: string): boolean => {
    const validCategories = ['Magazine', 'Musique', 'Sport', 'Actualité', 'Culture', 'Religion', 'Divertissement'];
    return validCategories.includes(category);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const programs: ImportedProgram[] = jsonData.map((row: any) => ({
          nom: row['Programme'] || row['Nom'] || row['programme'] || row['nom'] || '',
          jour: row['Jour'] || row['jour'] || '',
          heure_debut: row['Heure Début'] || row['Heure_Debut'] || row['heure_debut'] || row['Début'] || '',
          heure_fin: row['Heure Fin'] || row['Heure_Fin'] || row['heure_fin'] || row['Fin'] || '',
          animateurs: row['Animateurs'] || row['animateurs'] || row['Animateur'] || row['animateur'] || '',
          categorie: row['Catégorie'] || row['Categorie'] || row['categorie'] || row['Category'] || '',
          description: row['Description'] || row['description'] || ''
        }));

        // Validation des données
        const validPrograms = programs.filter(program => {
          return program.nom && 
                 validateDay(program.jour) && 
                 validateTimeFormat(program.heure_debut) && 
                 validateTimeFormat(program.heure_fin) &&
                 validateCategory(program.categorie);
        });

        if (validPrograms.length === 0) {
          toast.error('Aucune donnée valide trouvée dans le fichier');
          return;
        }

        if (validPrograms.length < programs.length) {
          toast.warning(`${programs.length - validPrograms.length} lignes ignorées (données invalides)`);
        }

        setImportedData(validPrograms);
        setShowPreview(true);
        toast.success(`${validPrograms.length} programmes trouvés dans le fichier`);

      } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error);
        toast.error('Erreur lors de la lecture du fichier');
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const handleImport = async () => {
    if (!user?.uid || importedData.length === 0) return;

    setIsImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const programData of importedData) {
        try {
          const program: Omit<Program, 'id'> = {
            nom: programData.nom,
            jour: programData.jour as any,
            heure_debut: programData.heure_debut,
            heure_fin: programData.heure_fin,
            animateurs: programData.animateurs ? programData.animateurs.split(',').map(a => a.trim()) : [],
            categorie: programData.categorie as any,
            description: programData.description,
            statut: 'En cours',
            date_creation: new Date().toISOString(),
            date_modification: new Date().toISOString(),
            userId: user.uid
          };

          await programsService.create(program, user.uid);
          successCount++;
        } catch (error) {
          console.error('Erreur lors de la création du programme:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} programmes importés avec succès`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} programmes n'ont pas pu être importés`);
      }

      setShowPreview(false);
      setImportedData([]);
      
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      toast.error('Erreur lors de l\'importation des programmes');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Programme': 'Exemple Programme',
        'Jour': 'Lundi',
        'Heure Début': '08:00',
        'Heure Fin': '10:00',
        'Animateurs': 'Animateur 1, Animateur 2',
        'Catégorie': 'Magazine',
        'Description': 'Description du programme'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_programmes.xlsx');
    toast.success('Modèle téléchargé avec succès');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Importer des programmes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Fichier CSV ou Excel</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Formats acceptés: CSV, Excel (.xlsx, .xls)
            </p>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Télécharger le modèle</span>
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Format attendu :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Programme</strong> : Nom du programme</li>
              <li>• <strong>Jour</strong> : Lundi, Mardi, etc.</li>
              <li>• <strong>Heure Début</strong> : Format HH:MM (ex: 08:30)</li>
              <li>• <strong>Heure Fin</strong> : Format HH:MM (ex: 10:00)</li>
              <li>• <strong>Animateurs</strong> : Séparés par des virgules</li>
              <li>• <strong>Catégorie</strong> : Magazine, Musique, Sport, etc.</li>
              <li>• <strong>Description</strong> : Description du programme</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Aperçu des programmes à importer ({importedData.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                {importedData.slice(0, 10).map((program, index) => (
                  <div key={index} className="bg-muted/30 p-3 rounded text-sm">
                    <div className="font-semibold">{program.nom}</div>
                    <div className="text-muted-foreground">
                      {program.jour} • {program.heure_debut}-{program.heure_fin}
                    </div>
                    <div className="text-xs text-muted-foreground">{program.categorie}</div>
                  </div>
                ))}
              </div>
              {importedData.length > 10 && (
                <div className="text-center p-2 text-sm text-muted-foreground border-t">
                  ... et {importedData.length - 10} autres programmes
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="flex items-center space-x-2"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Importation...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Importer {importedData.length} programmes</span>
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  setImportedData([]);
                }}
                variant="outline"
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgramImport;
