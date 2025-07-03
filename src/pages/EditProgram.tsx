
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Program, CATEGORIES } from '@/types/program';
import { programsService } from '@/services/firebaseService';
import { toast } from 'sonner';

const EditProgram = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    if (user && id) {
      loadProgram();
    }
  }, [user, id]);

  const loadProgram = async () => {
    if (!user || !id) return;
    
    try {
      setIsLoading(true);
      const programs = await programsService.getAll(user.id);
      const foundProgram = programs.find(p => p.id === id);
      if (foundProgram) {
        setProgram(foundProgram);
      } else {
        toast.error('Programme non trouvé');
        navigate('/programs');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du programme:', error);
      toast.error('Erreur lors du chargement du programme');
      navigate('/programs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !program) return;

    try {
      setIsSaving(true);
      await programsService.update(program.id, program, user.id);
      toast.success('Programme modifié avec succès');
      navigate('/programs');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification du programme');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProgram = (field: keyof Program, value: any) => {
    if (program) {
      setProgram({ ...program, [field]: value });
    }
  };

  if (!user) {
    return <div>Accès non autorisé</div>;
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

  if (!program) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/programs')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux programmes
          </Button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Modifier le Programme
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifiez les informations de votre émission
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du Programme</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du programme</label>
                  <Input
                    value={program.nom}
                    onChange={(e) => updateProgram('nom', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select
                    value={program.categorie}
                    onValueChange={(value) => updateProgram('categorie', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Jour</label>
                  <Select
                    value={program.jour}
                    onValueChange={(value) => updateProgram('jour', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Animateurs</label>
                  <Input
                    value={program.animateurs.join(', ')}
                    onChange={(e) => updateProgram('animateurs', e.target.value.split(', ').filter(a => a.trim()))}
                    placeholder="Séparez par des virgules"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Heure de début</label>
                  <Input
                    type="time"
                    value={program.heure_debut}
                    onChange={(e) => updateProgram('heure_debut', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Heure de fin</label>
                  <Input
                    type="time"
                    value={program.heure_fin}
                    onChange={(e) => updateProgram('heure_fin', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={program.description}
                  onChange={(e) => updateProgram('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/programs')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProgram;
