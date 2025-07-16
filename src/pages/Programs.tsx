
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, Upload } from 'lucide-react';
import { Program, CATEGORIES, CATEGORIES_COLORS } from '@/types/program';
import { programsService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProgramCard from '@/components/ProgramCard';
import ProgramImport from '@/components/ProgramImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    if (user?.uid) {
      loadPrograms();
    }
  }, [user]);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchTerm, selectedCategory, selectedDay]);

  const loadPrograms = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      const programsData = await programsService.getAll(user.uid);
      setPrograms(programsData);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      toast.error('Erreur lors du chargement des programmes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = programs;

    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.animateurs.some(animateur => 
          animateur.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(program => program.categorie === selectedCategory);
    }

    if (selectedDay !== 'all') {
      filtered = filtered.filter(program => program.jour === selectedDay);
    }

    setFilteredPrograms(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      await programsService.delete(id, user.uid);
      await loadPrograms();
      toast.success('Programme supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du programme');
    }
  };

  const getProgramsByDay = (day: string) => {
    return filteredPrograms
      .filter(program => program.jour === day)
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Programmes</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Programmes</h1>
        <Link to="/add-program">
          <Button className="flex items-center space-x-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span>Nouveau programme</span>
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Liste des programmes</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Importer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un programme..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Jour</label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les jours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les jours</SelectItem>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(searchTerm || selectedCategory !== 'all' || selectedDay !== 'all') && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {filteredPrograms.length} programme(s) trouvé(s)
                    </span>
                    {searchTerm && (
                      <Badge variant="secondary">"{searchTerm}"</Badge>
                    )}
                    {selectedCategory !== 'all' && (
                      <Badge variant="secondary">{selectedCategory}</Badge>
                    )}
                    {selectedDay !== 'all' && (
                      <Badge variant="secondary">{selectedDay}</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedDay('all');
                    }}
                  >
                    Effacer les filtres
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Liste des programmes */}
          {filteredPrograms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {programs.length === 0 ? 'Aucun programme créé' : 'Aucun programme trouvé'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {programs.length === 0 
                    ? 'Commencez par créer votre premier programme' 
                    : 'Essayez de modifier vos critères de recherche'
                  }
                </p>
                {programs.length === 0 && (
                  <Link to="/add-program">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un programme
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onDelete={() => handleDelete(program.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="import">
          <ProgramImport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Programs;
