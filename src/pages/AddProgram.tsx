
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Program } from '@/types/program';
import { toast } from 'sonner';

const AddProgram = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const [newAnimateur, setNewAnimateur] = useState('');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const categories = ['Magazine', 'Musique', 'Sport', 'Actualité', 'Culture', 'Religion', 'Divertissement'];

  const handleAddAnimateur = () => {
    if (newAnimateur.trim() && !formData.animateurs.includes(newAnimateur.trim())) {
      setFormData(prev => ({
        ...prev,
        animateurs: [...prev.animateurs, newAnimateur.trim()]
      }));
      setNewAnimateur('');
    }
  };

  const handleRemoveAnimateur = (animateur: string) => {
    setFormData(prev => ({
      ...prev,
      animateurs: prev.animateurs.filter(a => a !== animateur)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.jour || !formData.heure_debut || !formData.heure_fin || !formData.categorie) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.animateurs.length === 0) {
      toast.error('Veuillez ajouter au moins un animateur');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newProgram: Program = {
        id: Date.now().toString(),
        ...formData,
        jour: formData.jour as Program['jour'],
        categorie: formData.categorie as Program['categorie'],
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString(),
        statut: 'À venir'
      };

      console.log('Nouveau programme créé:', newProgram);
      toast.success('Programme créé avec succès !');
      navigate('/programs');
    } catch (error) {
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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Nouveau Programme</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Créez une nouvelle émission pour votre grille
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/programs')}
              className="self-start sm:self-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Informations du Programme</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <Label>Animateurs *</Label>
                
                {/* Liste des animateurs */}
                {formData.animateurs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.animateurs.map((animateur, index) => (
                      <Badge key={index} variant="secondary" className="pr-1">
                        {animateur}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRemoveAnimateur(animateur)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Ajouter un animateur */}
                <div className="flex gap-2">
                  <Input
                    value={newAnimateur}
                    onChange={(e) => setNewAnimateur(e.target.value)}
                    placeholder="Nom de l'animateur"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAnimateur())}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAnimateur}
                    disabled={!newAnimateur.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
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

export default AddProgram;
