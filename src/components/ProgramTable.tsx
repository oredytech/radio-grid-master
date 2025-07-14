
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
      <div className="space-y-4 w-full">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">Grille complète des programmes</span>
              </CardTitle>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                <Button 
                  onClick={() => setViewMode('table')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Vue tableau</span>
                </Button>
                <Button 
                  onClick={exportToCSV} 
                  disabled={isExporting}
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{isExporting ? 'Export...' : 'Télécharger CSV'}</span>
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
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Grille complète des programmes</span>
          </CardTitle>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={() => setViewMode('grid')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Grid3X3 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Vue grille</span>
            </Button>
            <Button 
              onClick={exportToCSV} 
              disabled={isExporting}
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{isExporting ? 'Export...' : 'Télécharger CSV'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] sm:w-[100px] text-xs sm:text-sm">Jour</TableHead>
                  <TableHead className="w-[100px] sm:w-[120px] text-xs sm:text-sm">Horaire</TableHead>
                  <TableHead className="min-w-[150px] text-xs sm:text-sm">Programme</TableHead>
                  <TableHead className="min-w-[120px] text-xs sm:text-sm">Animateurs</TableHead>
                  <TableHead className="w-[100px] sm:w-[120px] text-xs sm:text-sm">Catégorie</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[200px] text-xs sm:text-sm">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      Aucun programme disponible
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedPrograms.map((program) => {
                    const categoryGradient = CATEGORIES_COLORS[program.categorie];
                    return (
                      <TableRow key={program.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-xs sm:text-sm p-2 sm:p-4">
                          <span className="hidden sm:inline">{program.jour}</span>
                          <span className="sm:hidden">{program.jour.slice(0, 3)}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs p-2 sm:p-4">
                          <div className="space-y-1">
                            <div>{program.heure_debut}</div>
                            <div className="text-muted-foreground text-xs">{program.heure_fin}</div>
                          </div>
                        </TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <div className="font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                            {program.nom}
                          </div>
                        </TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <div className="space-y-1">
                            {program.animateurs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {program.animateurs.map((animateur, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-1 py-0.5">
                                    <span className="truncate max-w-[60px] sm:max-w-none">
                                      {animateur}
                                    </span>
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-2 sm:p-4">
                          <Badge 
                            className={`bg-gradient-to-r ${categoryGradient} text-white border-0 text-xs px-2 py-1`}
                          >
                            <span className="truncate max-w-[60px] sm:max-w-none">
                              {program.categorie}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[250px] p-2 sm:p-4">
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramTable;
