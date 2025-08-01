import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, FileText, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Conducteur } from '@/types/conducteur';
import { conducteurService } from '@/services/conducteurService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors = {
  brouillon: 'bg-gray-500',
  en_attente: 'bg-yellow-500',
  valide: 'bg-green-500',
  rejete: 'bg-red-500'
};

const statusLabels = {
  brouillon: 'Brouillon',
  en_attente: 'En attente',
  valide: 'Validé',
  rejete: 'Rejeté'
};

const Conducteurs = () => {
  const { user } = useAuth();
  const [conducteurs, setConducteurs] = useState<Conducteur[]>([]);
  const [filteredConducteurs, setFilteredConducteurs] = useState<Conducteur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadConducteurs();
    }
  }, [user]);

  useEffect(() => {
    filterConducteurs();
  }, [conducteurs, searchTerm, statusFilter]);

  const loadConducteurs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await conducteurService.getAll(user.id);
      setConducteurs(data);
    } catch (error) {
      console.error('Erreur lors du chargement des conducteurs:', error);
      toast.error('Erreur lors du chargement des conducteurs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterConducteurs = () => {
    let filtered = conducteurs;

    if (searchTerm) {
      filtered = filtered.filter(conducteur =>
        conducteur.titre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(conducteur => conducteur.status === statusFilter);
    }

    setFilteredConducteurs(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce conducteur ?')) return;

    try {
      await conducteurService.delete(id);
      toast.success('Conducteur supprimé');
      loadConducteurs();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Conducteurs</h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos conducteurs d'émission
              </p>
            </div>
            <Link to="/conducteurs/nouveau">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Conducteur
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="valide">Validé</SelectItem>
                  <SelectItem value="rejete">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des conducteurs */}
        {filteredConducteurs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun conducteur trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucun conducteur ne correspond à vos critères de recherche.'
                    : 'Commencez par créer votre premier conducteur.'
                  }
                </p>
                {(!searchTerm && statusFilter === 'all') && (
                  <Link to="/conducteurs/nouveau">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un conducteur
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConducteurs.map((conducteur) => (
              <Card key={conducteur.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{conducteur.titre}</CardTitle>
                      <CardDescription className="mt-1">
                        Version {conducteur.version}
                      </CardDescription>
                    </div>
                    <Badge className={`ml-2 ${statusColors[conducteur.status]} text-white`}>
                      {statusLabels[conducteur.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {format(new Date(conducteur.date_emission), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{conducteur.heure_debut} - {conducteur.heure_fin}</span>
                    </div>
                    
                    {conducteur.status === 'rejete' && conducteur.commentaires_directeur && (
                      <div className="flex items-start text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-xs">{conducteur.commentaires_directeur}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Link to={`/conducteurs/${conducteur.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Voir
                        </Button>
                      </Link>
                      {(conducteur.status === 'brouillon' || conducteur.status === 'rejete') && (
                        <Link to={`/conducteurs/${conducteur.id}/edit`} className="flex-1">
                          <Button size="sm" className="w-full">
                            Éditer
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conducteurs;