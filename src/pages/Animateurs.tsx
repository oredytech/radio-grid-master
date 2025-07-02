
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Users, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import AnimateurForm from '@/components/AnimateurForm';
import { Animateur } from '@/types/animateur';
import { animateursService } from '@/services/firebaseService';
import { toast } from 'sonner';

const Animateurs = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [animateurs, setAnimateurs] = useState<Animateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnimateur, setEditingAnimateur] = useState<Animateur | null>(null);

  useEffect(() => {
    loadAnimateurs();
  }, []);

  const loadAnimateurs = async () => {
    try {
      setIsLoading(true);
      const animateursData = await animateursService.getAll();
      setAnimateurs(animateursData);
    } catch (error) {
      console.error('Erreur lors du chargement des animateurs:', error);
      toast.error('Erreur lors du chargement des animateurs');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const filteredAnimateurs = animateurs.filter(animateur => 
    animateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animateur.postnom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animateur.fonction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (animateur: Animateur) => {
    setEditingAnimateur(animateur);
    setShowForm(true);
  };

  const handleDelete = async (animateurId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet animateur ?')) {
      return;
    }

    try {
      await animateursService.delete(animateurId);
      setAnimateurs(prev => prev.filter(a => a.id !== animateurId));
      toast.success('Animateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'animateur');
    }
  };

  const handleAnimateurCreated = (animateur: Animateur) => {
    if (editingAnimateur) {
      setAnimateurs(prev => prev.map(a => a.id === animateur.id ? animateur : a));
    } else {
      setAnimateurs(prev => [...prev, animateur]);
    }
    setShowForm(false);
    setEditingAnimateur(null);
    loadAnimateurs();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAnimateur(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Gestion des Animateurs</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Gérez l'équipe d'animation de votre radio
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 self-start sm:self-auto flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvel Animateur</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Recherche</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, postnom ou fonction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Animateurs List */}
        <div className="space-y-4">
          {filteredAnimateurs.length === 0 ? (
            <Card>
              <CardContent className="py-8 sm:py-12">
                <div className="text-center text-muted-foreground">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base sm:text-lg font-medium">Aucun animateur trouvé</p>
                  <p className="text-xs sm:text-sm">
                    {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un animateur'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAnimateurs.map((animateur) => (
                <Card key={animateur.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        {animateur.photoUrl ? (
                          <img
                            src={animateur.photoUrl}
                            alt={`${animateur.nom} ${animateur.postnom}`}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                            <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 min-w-0 w-full">
                        <h3 className="text-lg sm:text-xl font-semibold truncate">
                          {animateur.nom} {animateur.postnom}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {animateur.fonction}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Ajouté le {new Date(animateur.date_creation).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(animateur)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Modifier</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(animateur.id)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <Card className="mt-6 sm:mt-8">
          <CardContent className="py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>{filteredAnimateurs.length} animateur{filteredAnimateurs.length > 1 ? 's' : ''} affiché{filteredAnimateurs.length > 1 ? 's' : ''}</span>
              <span>Total: {animateurs.length} animateurs</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
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

      {/* Animateur Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <AnimateurForm
              onAnimateurCreated={handleAnimateurCreated}
              onClose={handleCloseForm}
              animateur={editingAnimateur || undefined}
              isEditing={!!editingAnimateur}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Animateurs;
