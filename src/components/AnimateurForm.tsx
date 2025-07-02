
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Upload, X } from 'lucide-react';
import { Animateur } from '@/types/animateur';
import { animateursService, uploadService } from '@/services/firebaseService';
import { toast } from 'sonner';

interface AnimateurFormProps {
  onAnimateurCreated: (animateur: Animateur) => void;
  onClose: () => void;
}

const AnimateurForm = ({ onAnimateurCreated, onClose }: AnimateurFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    postnom: '',
    fonction: '',
    photoUrl: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.postnom || !formData.fonction) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    
    try {
      let photoUrl = formData.photoUrl;
      
      if (imageFile) {
        photoUrl = await uploadService.uploadImage(imageFile, 'animateurs');
      }

      const animateurId = await animateursService.create({
        ...formData,
        photoUrl,
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString()
      });

      const newAnimateur: Animateur = {
        id: animateurId,
        ...formData,
        photoUrl,
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString()
      };

      onAnimateurCreated(newAnimateur);
      toast.success('Animateur créé avec succès !');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de l\'animateur:', error);
      toast.error('Erreur lors de la création de l\'animateur');
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
            <span>Nouvel Animateur</span>
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
            <Label htmlFor="photo">Photo de profil</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {imageFile && (
              <p className="text-xs text-muted-foreground">
                {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
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
                  <span>Création...</span>
                </div>
              ) : (
                'Créer'
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
