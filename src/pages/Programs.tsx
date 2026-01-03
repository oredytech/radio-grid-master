import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Radio, Plus, Search, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Program } from '@/types/program';
import { Animateur } from '@/types/animateur';
import { programsService } from '@/services/firebaseService';
import { animateursService } from '@/services/firebaseService';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { ProgramGridView } from '@/components/ProgramGridView';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES_COLORS } from '@/types/program';
import { ProgramImport } from '@/components/ProgramImport';

const Programs = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [animateurs, setAnimateurs] = useState<Animateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [showImport, setShowImport] = useState(false);

  const loadPrograms = async () => {
    if (!user?.id) return;
    
    try {
      const programsData = await programsService.getAll(user.id);
      setPrograms(programsData);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      toast.error('Erreur lors du chargement des programmes');
    }
  };

  const loadAnimateurs = async () => {
    if (!user?.id) return;
    
    try {
      const animateursData = await animateursService.getAll(user.id);
      setAnimateurs(animateursData);
    } catch (error) {
      console.error('Erreur lors du chargement des animateurs:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadPrograms(), loadAnimateurs()]);
      setIsLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    
    try {
      await programsService.delete(id, user.id);
      await loadPrograms();
      toast.success('Programme supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleImportSuccess = () => {
    setShowImport(false);
    loadPrograms();
  };

  const filteredPrograms = programs.filter(program => {
    const searchTermLower = searchTerm.toLowerCase();
    const programNameLower = program.nom.toLowerCase();
    const programDescriptionLower = program.description.toLowerCase();
  
    const matchesSearchTerm =
      searchTerm === '' ||
      programNameLower.includes(searchTermLower) ||
      programDescriptionLower.includes(searchTermLower);
  
    const matchesCategory =
      filterCategory === 'all' || program.categorie === filterCategory;
  
    const matchesDay = filterDay === 'all' || program.jour === filterDay;
  
    return matchesSearchTerm && matchesCategory && matchesDay;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Programmes</h1>
            <p className="text-muted-foreground mt-1">
              Gérez votre grille de programmation radio
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowImport(!showImport)}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Importer</span>
            </Button>
            <Button asChild className="flex items-center space-x-2">
              <Link to="/programs/add">
                <Plus className="h-4 w-4" />
                <span>Nouveau programme</span>
              </Link>
            </Button>
          </div>
        </div>

        {showImport && (
          <div className="mb-6">
            <ProgramImport onImportComplete={handleImportSuccess} />
          </div>
        )}

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un programme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {Object.keys(CATEGORIES_COLORS).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterDay} onValueChange={setFilterDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les jours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les jours</SelectItem>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Programs Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des programmes...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Radio className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucun programme trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterCategory !== 'all' || filterDay !== 'all'
                  ? 'Aucun programme ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre premier programme.'}
              </p>
              <Button asChild>
                <Link to="/programs/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un programme
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ProgramGridView 
            programs={filteredPrograms} 
            animateurs={animateurs}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Programs;
