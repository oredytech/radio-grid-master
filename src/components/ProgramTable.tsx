import { useState, useEffect } from 'react';
import { Program } from '@/types/program';
import { Button } from '@/components/ui/button';
import { CalendarDays, Copy, Edit, Trash2, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';
import { programsService } from '@/services/firebaseService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ProgramGridView } from './ProgramGridView';
import { useAuth } from '@/contexts/AuthContext';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const ProgramTable = ({ programs }: { programs: Program[] }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'jour', direction: 'asc' });
  const [filterDay, setFilterDay] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [animateurs, setAnimateurs] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnimateurs = async () => {
      // try {
      //   const fetchedAnimateurs = await animateursService.getAll(user?.uid || '');
      //   setAnimateurs(fetchedAnimateurs);
      // } catch (error) {
      //   console.error('Error fetching animateurs:', error);
      // }
    };

    if (user) {
      fetchAnimateurs();
    }
  }, [user]);

  const sortedPrograms = [...programs].sort((a, b) => {
    const key = sortConfig.key as keyof Program;

    if (a[key] < b[key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredPrograms = sortedPrograms.filter(program => {
    const dayMatch = filterDay === 'all' || program.jour === filterDay;
    const typeMatch = filterType === 'all' || program.genre === filterType;
    return dayMatch && typeMatch;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredPrograms = filteredPrograms;

  const handleDelete = async (programId: string) => {
    if (!user) return;
    
    try {
      await programsService.delete(user.id, programId);
      toast.success('Programme supprimé avec succès');
      window.location.reload();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting program:', error);
    }
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const types = ['Musique', 'Divertissement', 'Sport', 'Culture', 'Magazine', 'Actualité', 'Religion'];

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div>
            <Label htmlFor="day-filter">Filtrer par jour</Label>
            <select
              id="day-filter"
              className="border rounded px-2 py-1 text-sm"
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
            >
              <option value="all">Tous les jours</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="type-filter">Filtrer par type</Label>
            <select
              id="type-filter"
              className="border rounded px-2 py-1 text-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <RadioGroup defaultValue={viewMode} className="space-x-2" onValueChange={value => setViewMode(value as 'table' | 'grid')}>
            <RadioGroupItem value="table" id="table" />
            <Label htmlFor="table">Table</Label>
            <RadioGroupItem value="grid" id="grid" />
            <Label htmlFor="grid">Grille</Label>
          </RadioGroup>
        </div>
        <ProgramGridView 
          programs={sortedAndFilteredPrograms} 
          animateurs={animateurs}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div>
          <Label htmlFor="day-filter">Filtrer par jour</Label>
          <select
            id="day-filter"
            className="border rounded px-2 py-1 text-sm"
            value={filterDay}
            onChange={e => setFilterDay(e.target.value)}
          >
            <option value="all">Tous les jours</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="type-filter">Filtrer par type</Label>
          <select
            id="type-filter"
            className="border rounded px-2 py-1 text-sm"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">Tous les types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <RadioGroup defaultValue={viewMode} className="space-x-2" onValueChange={value => setViewMode(value as 'table' | 'grid')}>
          <RadioGroupItem value="table" id="table" />
          <Label htmlFor="table">Table</Label>
          <RadioGroupItem value="grid" id="grid" />
          <Label htmlFor="grid">Grille</Label>
        </RadioGroup>
      </div>
      <ScrollArea>
        <Table>
          <TableCaption>Liste de tous vos programmes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('titre')} className="cursor-pointer">
                Titre
                {sortConfig.key === 'titre' && (
                  <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('jour')} className="cursor-pointer">
                Jour
                {sortConfig.key === 'jour' && (
                  <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('heure_debut')} className="cursor-pointer">
                Début
                {sortConfig.key === 'heure_debut' && (
                  <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('heure_fin')} className="cursor-pointer">
                Fin
                {sortConfig.key === 'heure_fin' && (
                  <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('genre')} className="cursor-pointer">
                Type
                {sortConfig.key === 'genre' && (
                  <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('animateurs')} className="cursor-pointer">
                Animateur
                {sortConfig.key === 'animateurs' && (
                  <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredPrograms.map((program) => (
              <TableRow key={program.id}>
                <TableCell>{program.titre}</TableCell>
                <TableCell>{program.jour}</TableCell>
                <TableCell>{program.heure_debut}</TableCell>
                <TableCell>{program.heure_fin}</TableCell>
                <TableCell>{program.genre}</TableCell>
                <TableCell>{Array.isArray(program.animateurs) ? program.animateurs.join(', ') : program.animateurs}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(program))}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={`/programs/edit/${program.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(program.id)} className="text-destructive focus:bg-destructive/20">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
