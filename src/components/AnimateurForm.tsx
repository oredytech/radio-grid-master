
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, X, Image } from 'lucide-react';
import { Animateur } from '@/types/animateur';
import { animateursService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface AnimateurFormProps {
  onAnimateurCreated: (animateur: Animateur) => void;
  onClose: () => void;
  animateur?: Animateur;
  isEditing?: boolean;
}

const AnimateurForm = ({ onAnimateurCreated, onClose, animateur, isEditing = false }: AnimateurFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: animateur?.nom || '',
    postnom: animateur?.postnom || '',
    fonction: animateur?.fonction || '',
    photoUrl: animateur?.photoUrl || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.postnom || !formData.fonction) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Soumission formulaire animateur:', { formData, userId: user.id, isEditing });
      
      if (isEditing && animateur) {
        await animateursService.update(animateur.id, {
          ...formData,
          date_modification: new Date().toISOString()
        }, user.id);
        toast.success('Animateur modifié avec succès !');
      } else {
        const animateurId = await animateursService.create({
          ...formData,
          date_creation: new Date().toISOString(),
          date_modification: new Date().toISOString()
        }, user.id);

        console.log('Animateur créé avec ID:', animateurId);

        const newAnimateur: Animateur = {
          id: animateurId,
          ...formData,
          date_creation: new Date().toISOString(),
          date_modification: new Date().toISOString()
        };

        onAnimateurCreated(newAnimateur);
        toast.success('Animateur créé avec succès !');
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'opération:', error);
      toast.error('Erreur lors de l\'opération');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{isEditing ? 'Modifier Animateur' : 'Nouvel Animateur'}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-auto p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              placeholder="Nom"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postnom">Postnom *</Label>
            <Input
              id="postnom"
              value={formData.postnom}
              onChange={(e) => setFormData(prev => ({ ...prev, postnom: e.target.value }))}
              placeholder="Postnom"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fonction">Fonction *</Label>
            <Input
              id="fonction"
              value={formData.fonction}
              onChange={(e) => setFormData(prev => ({ ...prev, fonction: e.target.value }))}
              placeholder="Ex: Animateur principal, Journaliste..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">URL de la photo (optionnel)</Label>
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                id="photoUrl"
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
                className="flex-1"
              />
            </div>
            {formData.photoUrl && (
              <div className="mt-2">
                <img
                  src={formData.photoUrl}
                  alt="Aperçu"
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    toast.error('URL de l\'image invalide');
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditing ? 'Modification...' : 'Création...'}</span>
                </div>
              ) : (
                isEditing ? 'Modifier' : 'Créer'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnimateurForm;
