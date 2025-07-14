import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet, Grid3X3 } from 'lucide-react';
import { Program, CATEGORIES_COLORS } from '@/types/program';
import { toast } from 'sonner';
import ProgramGridView from './ProgramGridView';

interface ProgramTableProps {
  programs: Program[];
  radioName: string;
}

const ProgramTable = ({ programs, radioName }: ProgramTableProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const sortedPrograms = [...programs].sort((a, b) => {
    const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const dayDiff = dayOrder.indexOf(a.jour) - dayOrder.indexOf(b.jour);
    if (dayDiff !== 0) return dayDiff;
    return a.heure_debut.localeCompare(b.heure_debut);
  });

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['Jour', 'Heure Début', 'Heure Fin', 'Programme', 'Animateurs', 'Catégorie', 'Description'];
      const csvContent = [
        headers.join(','),
        ...sortedPrograms.map(program => [
          program.jour,
          program.heure_debut,
          program.heure_fin,
          `"${program.nom.replace(/"/g, '""')}"`,
          `"${program.animateurs.join(', ').replace(/"/g, '""')}"`,
          program.categorie,
          `"${program.description.replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `grille-${radioName.toLowerCase().replace(/\s+/g, '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Tableau exporté avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Grid3X3 className="h-5 w-5" />
                <span>Grille complète des programmes</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setViewMode('table')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Vue tableau
                </Button>
                <Button 
                  onClick={exportToCSV} 
                  disabled={isExporting}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Export...' : 'Télécharger CSV'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <ProgramGridView programs={programs} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Grille complète des programmes</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setViewMode('grid')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Vue grille
            </Button>
            <Button 
              onClick={exportToCSV} 
              disabled={isExporting}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Export...' : 'Télécharger CSV'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Jour</TableHead>
                <TableHead className="w-[120px]">Horaire</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Animateurs</TableHead>
                <TableHead className="w-[120px]">Catégorie</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun programme disponible
                  </TableCell>
                </TableRow>
              ) : (
                sortedPrograms.map((program) => {
                  const categoryGradient = CATEGORIES_COLORS[program.categorie];
                  return (
                    <TableRow key={program.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{program.jour}</TableCell>
                      <TableCell className="font-mono text-sm">
                        <div className="space-y-1">
                          <div>{program.heure_debut}</div>
                          <div className="text-muted-foreground">{program.heure_fin}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{program.nom}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {program.animateurs.length > 0 ? (
                            program.animateurs.map((animateur, index) => (
                              <Badge key={index} variant="secondary" className="text-xs mr-1">
                                {animateur}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`bg-gradient-to-r ${categoryGradient} text-white border-0`}
                        >
                          {program.categorie}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[300px]">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {program.description}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramTable;
