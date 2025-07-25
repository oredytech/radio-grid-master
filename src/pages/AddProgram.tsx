import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Image, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Program, CATEGORIES } from '@/types/program';
import { Animateur } from '@/types/animateur';
import { programsService, animateursService } from '@/services/firebaseService';
import { toast } from 'sonner';
import { ProgramConflictDialog } from '@/components/ProgramConflictDialog';
import { detectProgramConflicts, ProgramConflict } from '@/utils/programConflicts';

const AddProgram = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [animateurs, setAnimateurs] = useState<Animateur[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflicts, setConflicts] = useState<ProgramConflict[]>([]);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    jours: [] as Program['jour'][],
    heure_debut: '',
    heure_fin: '',
    categorie: '' as Program['categorie'] | '',
    animateurs: [] as string[],
    imageUrl: ''
  });

  const jours: Program['jour'][] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    if (user) {
      loadAnimateurs();
      loadPrograms();
    }
  }, [user]);

  const loadAnimateurs = async () => {
    if (!user) return;
    
    try {
      const animateursData = await animateursService.getAll(user.id);
      setAnimateurs(animateursData);
    } catch (error) {
      console.error('Erreur lors du chargement des animateurs:', error);
    }
  };

  const loadPrograms = async () => {
    if (!user) return;
    
    try {
      const programsData = await programsService.getAll(user.id);
      setPrograms(programsData);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleJourToggle = (jour: Program['jour']) => {
    setFormData(prev => ({
      ...prev,
      jours: prev.jours.includes(jour)
        ? prev.jours.filter(j => j !== jour)
        : [...prev.jours, jour]
    }));
  };

  const handleAnimateurToggle = (animateurName: string) => {
    setFormData(prev => ({
      ...prev,
      animateurs: prev.animateurs.includes(animateurName)
        ? prev.animateurs.filter(name => name !== animateurName)
        : [...prev.animateurs, animateurName]
    }));
  };

  const createPrograms = async () => {
    setIsLoading(true);
    
    try {
      console.log('Création programmes:', { formData, userId: user.id });
      
      // Créer un programme pour chaque jour sélectionné
      const programPromises = formData.jours.map(jour => 
        programsService.create({
          nom: formData.nom,
          description: formData.description,
          jour: jour,
          heure_debut: formData.heure_debut,
          heure_fin: formData.heure_fin,
          categorie: formData.categorie as Program['categorie'],
          animateurs: formData.animateurs,
          imageUrl: formData.imageUrl,
          statut: 'En cours',
          date_creation: new Date().toISOString(),
          date_modification: new Date().toISOString()
        }, user.id)
      );

      await Promise.all(programPromises);

      toast.success(`Programme${formData.jours.length > 1 ? 's' : ''} créé${formData.jours.length > 1 ? 's' : ''} avec succès !`);
      navigate('/programs');
    } catch (error) {
      console.error('Erreur lors de la création du programme:', error);
      toast.error('Erreur lors de la création du programme');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.description || formData.jours.length === 0 || !formData.heure_debut || !formData.heure_fin || !formData.categorie) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.heure_debut >= formData.heure_fin) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    // Détecter les conflits
    const detectedConflicts = detectProgramConflicts(
      programs,
      formData.jours,
      formData.heure_debut,
      formData.heure_fin
    );

    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      setShowConflictDialog(true);
      return;
    }

    // Aucun conflit, créer directement
    await createPrograms();
  };

  const handleConflictReplace = async (conflictingPrograms: Program[]) => {
    setIsLoading(true);
    try {
      // Supprimer les programmes en conflit
      await Promise.all(
        conflictingPrograms.map(program => 
          programsService.delete(program.id, user.id)
        )
      );
      
      // Créer les nouveaux programmes
      await createPrograms();
      
      setShowConflictDialog(false);
    } catch (error) {
      console.error('Erreur lors du remplacement:', error);
      toast.error('Erreur lors du remplacement des programmes');
      setIsLoading(false);
    }
  };

  const handleConflictModify = (program: Program) => {
    navigate(`/programs/edit/${program.id}`);
  };

  const handleConflictDelete = async (programsToDelete: Program[]) => {
    setIsLoading(true);
    try {
      await Promise.all(
        programsToDelete.map(program => 
          programsService.delete(program.id, user.id)
        )
      );
      
      // Recharger les programmes et créer le nouveau
      await loadPrograms();
      await createPrograms();
      
      setShowConflictDialog(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression des programmes');
      setIsLoading(false);
    }
  };

  const handleConflictContinue = async () => {
    setShowConflictDialog(false);
    await createPrograms();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/programs')}
              className="self-start sm:self-auto flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Nouveau Programme</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Créez une nouvelle émission pour votre grille
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Informations du programme</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select value={formData.categorie} onValueChange={(value) => setFormData(prev => ({ ...prev, categorie: value as Program['categorie'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre émission..."
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="space-y-4">
                <Label className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Jours de diffusion * (Sélectionnez un ou plusieurs jours)</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {jours.map((jour) => (
                    <div key={jour} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <Checkbox
                        id={jour}
                        checked={formData.jours.includes(jour)}
                        onCheckedChange={() => handleJourToggle(jour)}
                      />
                      <Label htmlFor={jour} className="text-sm font-medium cursor-pointer flex-1">
                        {jour}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.jours.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Jours sélectionnés: {formData.jours.join(', ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="heure_debut">Heure de début *</Label>
                  <Input
                    id="heure_debut"
                    type="time"
                    value={formData.heure_debut}
                    onChange={(e) => setFormData(prev => ({ ...prev, heure_debut: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heure_fin">Heure de fin *</Label>
                  <Input
                    id="heure_fin"
                    type="time"
                    value={formData.heure_fin}
                    onChange={(e) => setFormData(prev => ({ ...prev, heure_fin: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
                <div className="flex items-center space-x-2">
                  <Image className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                </div>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="w-24 h-24 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        toast.error('URL de l\'image invalide');
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label>Animateurs (optionnel)</Label>
                {animateurs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Aucun animateur disponible</p>
                    <p className="text-xs">Ajoutez des animateurs depuis la page Animateurs</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {animateurs.map((animateur) => (
                      <div key={animateur.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <Checkbox
                          id={animateur.id}
                          checked={formData.animateurs.includes(`${animateur.nom} ${animateur.postnom}`)}
                          onCheckedChange={() => handleAnimateurToggle(`${animateur.nom} ${animateur.postnom}`)}
                        />
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {animateur.photoUrl ? (
                            <img
                              src={animateur.photoUrl}
                              alt={animateur.nom}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {animateur.nom.charAt(0)}{animateur.postnom.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <Label 
                              htmlFor={animateur.id} 
                              className="text-sm font-medium cursor-pointer truncate block"
                            >
                              {animateur.nom} {animateur.postnom}
                            </Label>
                            <p className="text-xs text-muted-foreground truncate">{animateur.fonction}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {formData.animateurs.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Animateurs sélectionnés: {formData.animateurs.join(', ')}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex-1 sm:flex-none sm:min-w-[200px]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Création...</span>
                    </div>
                  ) : (
                    'Créer le programme'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/programs')}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none"
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

      {/* Conflict Dialog */}
      <ProgramConflictDialog
        open={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        conflicts={conflicts}
        onReplace={handleConflictReplace}
        onModify={handleConflictModify}
        onDelete={handleConflictDelete}
        onContinue={handleConflictContinue}
      />
    </div>
  );
};

export default AddProgram;
