
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
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

const Programs = () => {
  const { user } = useAuth();
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
    // TODO: Implement edit functionality
  };

  const handleDelete = (programId: string) => {
    console.log('Delete program:', programId);
    // TODO: Implement delete functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des Programmes</h1>
              <p className="text-muted-foreground mt-1">
                Créez, modifiez et organisez vos émissions
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Programme
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtres et Recherche</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
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
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Aucun programme trouvé</p>
                  <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPrograms.map((program) => {
              const categoryGradient = CATEGORIES_COLORS[program.categorie];
              
              return (
                <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className={`h-1 bg-gradient-to-r ${categoryGradient}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold">{program.nom}</h3>
                          <Badge variant="secondary">{program.categorie}</Badge>
                          <Badge variant="outline">{program.jour}</Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {program.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{program.heure_debut} - {program.heure_fin}</span>
                            <Badge variant="outline" className="ml-2">
                              {formatDuration(program.heure_debut, program.heure_fin)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{program.animateurs.join(', ')}</span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Créé le {new Date(program.date_creation).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(program)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(program.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <Card className="mt-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{filteredPrograms.length} programme{filteredPrograms.length > 1 ? 's' : ''} affiché{filteredPrograms.length > 1 ? 's' : ''}</span>
              <span>Total: {programs.length} programmes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Programs;
