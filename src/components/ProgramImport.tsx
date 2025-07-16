
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { programsService } from '@/services/firebaseService';
import { Program } from '@/types/program';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ImportedProgram {
  nom: string;
  description: string;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  categorie: string;
  animateurs: string[];
  status: 'valid' | 'invalid' | 'duplicate';
  error?: string;
}

const ProgramImport = ({ onImportSuccess }: { onImportSuccess: () => void }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importedPrograms, setImportedPrograms] = useState<ImportedProgram[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const validateProgram = (program: any): { isValid: boolean; error?: string } => {
    const requiredFields = ['nom', 'description', 'jour', 'heure_debut', 'heure_fin', 'categorie'];
    const validDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const validCategories = ['Informations', 'Musique', 'Divertissement', 'Sport', 'Culture', 'Éducation', 'Religieux'];

    for (const field of requiredFields) {
      if (!program[field] || program[field].toString().trim() === '') {
        return { isValid: false, error: `Champ manquant: ${field}` };
      }
    }

    if (!validDays.includes(program.jour)) {
      return { isValid: false, error: 'Jour invalide' };
    }

    if (!validCategories.includes(program.categorie)) {
      return { isValid: false, error: 'Catégorie invalide' };
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(program.heure_debut) || !timeRegex.test(program.heure_fin)) {
      return { isValid: false, error: 'Format d\'heure invalide (HH:MM)' };
    }

    return { isValid: true };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedPrograms: ImportedProgram[] = jsonData.map((row: any) => {
        const program = {
          nom: row.nom || row.Nom || row.name || row.Name || '',
          description: row.description || row.Description || '',
          jour: row.jour || row.Jour || row.day || row.Day || '',
          heure_debut: row.heure_debut || row['Heure début'] || row.start_time || row['Start Time'] || '',
          heure_fin: row.heure_fin || row['Heure fin'] || row.end_time || row['End Time'] || '',
          categorie: row.categorie || row.Catégorie || row.category || row.Category || '',
          animateurs: typeof row.animateurs === 'string' 
            ? row.animateurs.split(',').map((a: string) => a.trim())
            : row.animateurs || []
        };

        const validation = validateProgram(program);
        return {
          ...program,
          status: validation.isValid ? 'valid' as const : 'invalid' as const,
          error: validation.error
        };
      });

      setImportedPrograms(processedPrograms);
      setShowPreview(true);
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      toast.error('Erreur lors du traitement du fichier');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!user?.id) {
      toast.error('Utilisateur non connecté');
      return;
    }

    const validPrograms = importedPrograms.filter(p => p.status === 'valid');
    if (validPrograms.length === 0) {
      toast.error('Aucun programme valide à importer');
      return;
    }

    setIsProcessing(true);
    try {
      let successCount = 0;
      for (const program of validPrograms) {
        const programData: Omit<Program, 'id'> = {
          nom: program.nom,
          description: program.description,
          jour: program.jour,
          heure_debut: program.heure_debut,
          heure_fin: program.heure_fin,
          categorie: program.categorie,
          animateurs: program.animateurs,
          userId: user.id,
          date_creation: new Date().toISOString(),
          date_modification: new Date().toISOString()
        };

        await programsService.create(programData, user.id);
        successCount++;
      }

      toast.success(`${successCount} programmes importés avec succès`);
      onImportSuccess();
      setFile(null);
      setImportedPrograms([]);
      setShowPreview(false);
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      toast.error('Erreur lors de l\'importation');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <Check className="h-4 w-4 text-green-500" />;
      case 'invalid': return <X className="h-4 w-4 text-red-500" />;
      case 'duplicate': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'invalid': return 'bg-red-100 text-red-800';
      case 'duplicate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Importer des programmes</span>
        </CardTitle>
        <CardDescription>
          Importez vos programmes depuis un fichier CSV ou Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
          <p className="text-sm text-muted-foreground">
            Formats acceptés: CSV, Excel (.xlsx, .xls)
          </p>
        </div>

        {file && (
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{file.name}</span>
            <Badge variant="outline">{file.size} bytes</Badge>
          </div>
        )}

        {showPreview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Aperçu des programmes</h3>
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {importedPrograms.filter(p => p.status === 'valid').length} valides
                </Badge>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  {importedPrograms.filter(p => p.status === 'invalid').length} invalides
                </Badge>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {importedPrograms.map((program, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    program.status === 'valid' ? 'border-green-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(program.status)}
                      <span className="font-medium">{program.nom}</span>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {program.jour} {program.heure_debut}-{program.heure_fin}
                    </div>
                  </div>
                  {program.error && (
                    <p className="text-sm text-red-500 mt-1">{program.error}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setFile(null);
                  setImportedPrograms([]);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing || importedPrograms.filter(p => p.status === 'valid').length === 0}
              >
                {isProcessing ? 'Importation...' : 'Importer'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgramImport;
