
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit, Trash2, Users, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { mockPrograms } from '@/data/mockPrograms';
import { Program, CATEGORIES_COLORS } from '@/types/program';
import { formatDuration } from '@/utils/timeUtils';
import { toast } from 'sonner';

const Programs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [programs] = useState<Program[]>(mockPrograms);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const categories = Array.from(new Set(programs.map(p => p.categorie)));

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.animateurs.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || program.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (program: Program) => {
    console.log('Edit program:', program);
    toast.info('Fonctionnalité d\'édition en cours de développement');
  };

  const handleDelete = (programId: string) => {
    console.log('Delete program:', programId);
    toast.info('Fonctionnalité de suppression en cours de développement');
  };

  const handleAddProgram = () => {
    navigate('/programs/add');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestion des Programmes</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Créez, modifiez et organisez vos émissions
              </p>
            </div>
            <Button 
              onClick={handleAddProgram}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouveau Programme</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filtres et Recherche</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom d'émission ou animateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                >
                  Toutes
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs sm:text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs List */}
        <div className="space-y-4">
          {filteredPrograms.length === 0 ? (
            <Card>
              <CardContent className="py-8 sm:py-12">
                <div className="text-center text-muted-foreground">
                  <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base sm:text-lg font-medium">Aucun programme trouvé</p>
                  <p className="text-xs sm:text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPrograms.map((program) => {
              const categoryGradient = CATEGORIES_COLORS[program.categorie];
              
              return (
                <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className={`h-1 bg-gradient-to-r ${categoryGradient}`} />
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="text-lg sm:text-xl font-semibold truncate">{program.nom}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">{program.categorie}</Badge>
                            <Badge variant="outline" className="text-xs">{program.jour}</Badge>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4 text-sm sm:text-base line-clamp-2">
                          {program.description}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 min-w-0">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{program.heure_debut} - {program.heure_fin}</span>
                            <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">
                              {formatDuration(program.heure_debut, program.heure_fin)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2 min-w-0">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{program.animateurs.join(', ')}</span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Créé le {new Date(program.date_creation).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 flex-shrink-0 self-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(program)}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">Modifier</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(program.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Stats Footer */}
        <Card className="mt-6 sm:mt-8">
          <CardContent className="py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>{filteredPrograms.length} programme{filteredPrograms.length > 1 ? 's' : ''} affiché{filteredPrograms.length > 1 ? 's' : ''}</span>
              <span>Total: {programs.length} programmes</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            Fièrement conçu par{' '}
            <a 
              href="https://oredytech.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-accent transition-colors"
            >
              Oredy TECHNOLOGIES
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Programs;
