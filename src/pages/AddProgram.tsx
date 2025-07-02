
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, X, ArrowLeft, Save, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import AnimateurForm from '@/components/AnimateurForm';
import { Program } from '@/types/program';
import { Animateur } from '@/types/animateur';
import { programsService, animateursService } from '@/services/firebaseService';
import { toast } from 'sonner';

const AddProgram = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimateurForm, setShowAnimateurForm] = useState(false);
  const [animateurs, setAnimateurs] = useState<Animateur[]>([]);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    jour: '',
    heure_debut: '',
    heure_fin: '',
    categorie: '',
    animateurs: [] as string[],
    imageUrl: ''
  });

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const categories = ['Magazine', 'Musique', 'Sport', 'Actualité', 'Culture', 'Religion', 'Divertissement'];

  useEffect(() => {
    loadAnimateurs();
  }, []);

  const loadAnimateurs = async () => {
    try {
      const animateursData = await animateursService.getAll();
      setAnimateurs(animateursData);
    } catch (error) {
      console.error('Erreur lors du chargement des animateurs:', error);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleAnimateurSelect = (animateurId: string) => {
    const animateur = animateurs.find(a => a.id === animateurId);
    if (animateur && !formData.animateurs.includes(animateur.id)) {
      setFormData(prev => ({
        ...prev,
        animateurs: [...prev.animateurs, animateur.id]
      }));
    }
  };

  const handleRemoveAnimateur = (animateurId: string) => {
    setFormData(prev => ({
      ...prev,
      animateurs: prev.animateurs.filter(id => id !== animateurId)
    }));
  };

  const handleAnimateurCreated = (newAnimateur: Animateur) => {
    setAnimateurs(prev => [...prev, newAnimateur]);
    setFormData(prev => ({
      ...prev,
      animateurs: [...prev.animateurs, newAnimateur.id]
    }));
  };

  const getAnimateurName = (id: string) => {
    const animateur = animateurs.find(a => a.id === id);
    return animateur ? `${animateur.nom} ${animateur.postnom}` : id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.jour || !formData.heure_debut || !formData.heure_fin || !formData.categorie) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.animateurs.length === 0) {
      toast.error('Veuillez sélectionner au moins un animateur');
      return;
    }

    setIsLoading(true);
    
    try {
      const programData: Omit<Program, 'id'> = {
        ...formData,
        jour: formData.jour as Program['jour'],
        categorie: formData.categorie as Program['categorie'],
        animateurs: formData.animateurs.map(id => getAnimateurName(id)),
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString(),
        statut: 'À venir'
      };

      await programsService.create(programData);
      toast.success('Programme créé avec succès !');
      navigate('/programs');
    } catch (error) {
      console.error('Erreur lors de la création du programme:', error);
      toast.error('Erreur lors de la création du programme');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Nouveau Programme</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Créez une nouvelle émission pour votre grille
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/programs')}
              className="self-start sm:self-auto flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        {/* Form */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Informations du Programme</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom du programme */}
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du programme *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: Matinale Express"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre émission..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Jour et horaires */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Jour *</Label>
                  <Select
                    value={formData.jour}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, jour: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {jours.map((jour) => (
                        <SelectItem key={jour} value={jour}>{jour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heure_debut">Heure début *</Label>
                  <Input
                    id="heure_debut"
                    type="time"
                    value={formData.heure_debut}
                    onChange={(e) => setFormData(prev => ({ ...prev, heure_debut: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heure_fin">Heure fin *</Label>
                  <Input
                    id="heure_fin"
                    type="time"
                    value={formData.heure_fin}
                    onChange={(e) => setFormData(prev => ({ ...prev, heure_fin: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={formData.categorie}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categorie: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((categorie) => (
                      <SelectItem key={categorie} value={categorie}>{categorie}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Animateurs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Animateurs *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnimateurForm(true)}
                    className="text-xs"
                  >
                    <User className="h-3 w-3 mr-1" />
                    Nouveau
                  </Button>
                </div>
                
                {/* Liste des animateurs sélectionnés */}
                {formData.animateurs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.animateurs.map((animateurId) => (
                      <Badge key={animateurId} variant="secondary" className="pr-1">
                        {getAnimateurName(animateurId)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRemoveAnimateur(animateurId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Sélection d'animateur */}
                <Select onValueChange={handleAnimateurSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un animateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {animateurs
                      .filter(animateur => !formData.animateurs.includes(animateur.id))
                      .map((animateur) => (
                      <SelectItem key={animateur.id} value={animateur.id}>
                        {animateur.nom} {animateur.postnom} - {animateur.fonction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 order-2 sm:order-1"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Création...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Créer le programme
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/programs')}
                  disabled={isLoading}
                  className="order-1 sm:order-2"
                >
                  Annuler
                </Button>
              </div>
            </form>
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

      {/* Dialog pour créer un animateur */}
      <Dialog open={showAnimateurForm} onOpenChange={setShowAnimateurForm}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <AnimateurForm
            onAnimateurCreated={handleAnimateurCreated}
            onClose={() => setShowAnimateurForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProgram;
