import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Edit, CheckCircle, XCircle, Download, Clock, Calendar, User, FileText, Music, Mic, Tv, Radio, Megaphone, Cloud, Zap, MessageSquare, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { ConducteurWithElements, ElementType } from '@/types/conducteur';
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

const elementIcons: Record<ElementType, React.ComponentType<any>> = {
  introduction: FileText,
  rubrique: BookOpen,
  intervenant: User,
  musique: Music,
  pub: Megaphone,
  meteo: Cloud,
  flash: Zap,
  chronique: MessageSquare,
  conclusion: CheckCircle
};

const ConducteurView = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [conducteur, setConducteur] = useState<ConducteurWithElements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComments, setValidationComments] = useState('');
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationType, setValidationType] = useState<'valide' | 'rejete'>('valide');

  useEffect(() => {
    if (user && id) {
      loadConducteur(id);
    }
  }, [user, id]);

  const loadConducteur = async (conducteurId: string) => {
    try {
      setIsLoading(true);
      const data = await conducteurService.getWithElements(conducteurId);
      if (data) {
        setConducteur(data);
      } else {
        toast.error('Conducteur non trouvé');
        navigate('/conducteurs');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du conducteur:', error);
      toast.error('Erreur lors du chargement du conducteur');
      navigate('/conducteurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidation = async (status: 'valide' | 'rejete') => {
    if (!conducteur || !user) return;

    try {
      setIsValidating(true);
      await conducteurService.updateStatus(conducteur.id, status, validationComments);
      
      // Créer notification
      await conducteurService.createNotification({
        firebase_user_id: conducteur.firebase_user_id,
        type: status === 'valide' ? 'conducteur_valide' : 'conducteur_rejete',
        titre: status === 'valide' ? 'Conducteur validé' : 'Conducteur rejeté',
        message: status === 'valide' 
          ? `Votre conducteur "${conducteur.titre}" a été validé`
          : `Votre conducteur "${conducteur.titre}" a été rejeté. ${validationComments}`,
        conducteur_id: conducteur.id,
        lu: false
      });

      toast.success(status === 'valide' ? 'Conducteur validé' : 'Conducteur rejeté');
      setShowValidationDialog(false);
      setValidationComments('');
      loadConducteur(conducteur.id);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const calculateTotalDuration = () => {
    if (!conducteur) return 0;
    return conducteur.elements.reduce((total, element) => total + (element.duree_minutes || 0), 0);
  };

  const canEdit = conducteur && (conducteur.status === 'brouillon' || conducteur.status === 'rejete');
  const canValidate = user?.role === 'directeur' && conducteur?.status === 'en_attente';
  const isDirector = user?.role === 'directeur';

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

  if (!conducteur) {
    return <Navigate to="/conducteurs" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/conducteurs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{conducteur.titre}</h1>
                <Badge className={`${statusColors[conducteur.status]} text-white`}>
                  {statusLabels[conducteur.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground">Version {conducteur.version}</p>
            </div>
            
            <div className="flex gap-2">
              {canEdit && (
                <Link to={`/conducteurs/${conducteur.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Éditer
                  </Button>
                </Link>
              )}
              
              {canValidate && (
                <>
                  <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setValidationType('rejete')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
                  <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
                    <DialogTrigger asChild>
                      <Button
                        className="text-green-600 hover:text-green-700"
                        onClick={() => setValidationType('valide')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {validationType === 'valide' ? 'Valider le conducteur' : 'Rejeter le conducteur'}
                        </DialogTitle>
                        <DialogDescription>
                          {validationType === 'valide' 
                            ? 'Confirmez-vous la validation de ce conducteur ?'
                            : 'Veuillez indiquer les raisons du rejet.'
                          }
                        </DialogDescription>
                      </DialogHeader>
                      
                      {validationType === 'rejete' && (
                        <div className="space-y-2">
                          <Label htmlFor="comments">Commentaires *</Label>
                          <Textarea
                            id="comments"
                            value={validationComments}
                            onChange={(e) => setValidationComments(e.target.value)}
                            placeholder="Expliquez les raisons du rejet..."
                            rows={4}
                          />
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowValidationDialog(false);
                            setValidationComments('');
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={() => handleValidation(validationType)}
                          disabled={isValidating || (validationType === 'rejete' && !validationComments.trim())}
                          className={validationType === 'valide' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                          {isValidating ? 'En cours...' : (validationType === 'valide' ? 'Valider' : 'Rejeter')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date d'émission</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(conducteur.date_emission), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Horaires</p>
                  <p className="text-sm text-muted-foreground">
                    {conducteur.heure_debut} - {conducteur.heure_fin}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Durée totale</p>
                  <p className="text-sm text-muted-foreground">
                    {calculateTotalDuration()} minutes
                  </p>
                </div>
              </div>
            </div>
            
            {conducteur.status === 'rejete' && conducteur.commentaires_directeur && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Commentaires du directeur</h4>
                <p className="text-sm text-red-700">{conducteur.commentaires_directeur}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Éléments du conducteur */}
        <Card>
          <CardHeader>
            <CardTitle>Éléments du conducteur</CardTitle>
            <CardDescription>
              {conducteur.elements.length} élément{conducteur.elements.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conducteur.elements.map((element, index) => {
                const IconComponent = elementIcons[element.type];
                return (
                  <div key={element.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-semibold">{element.titre}</h4>
                          {element.duree_minutes && (
                            <Badge variant="outline" className="text-xs">
                              {element.duree_minutes} min
                            </Badge>
                          )}
                        </div>
                        
                        {element.description && (
                          <p className="text-sm text-muted-foreground mb-3">{element.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {element.type === 'musique' && (
                            <>
                              {element.musique_titre && (
                                <div>
                                  <span className="font-medium">Titre: </span>
                                  <span className="text-muted-foreground">{element.musique_titre}</span>
                                </div>
                              )}
                              {element.musique_artiste && (
                                <div>
                                  <span className="font-medium">Artiste: </span>
                                  <span className="text-muted-foreground">{element.musique_artiste}</span>
                                </div>
                              )}
                            </>
                          )}
                          
                          {element.type === 'intervenant' && element.intervenant && (
                            <div>
                              <span className="font-medium">Intervenant: </span>
                              <span className="text-muted-foreground">{element.intervenant}</span>
                            </div>
                          )}
                          
                          {element.heure_prevue && (
                            <div>
                              <span className="font-medium">Heure prévue: </span>
                              <span className="text-muted-foreground">{element.heure_prevue}</span>
                            </div>
                          )}
                        </div>
                        
                        {element.notes_techniques && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <h5 className="font-medium text-blue-800 mb-1">Notes techniques</h5>
                            <p className="text-sm text-blue-700">{element.notes_techniques}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {conducteur.elements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun élément dans ce conducteur</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConducteurView;