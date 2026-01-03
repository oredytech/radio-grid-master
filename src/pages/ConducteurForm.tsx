import { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Save, Send, Plus, Trash2, GripVertical, Calendar as CalendarIcon, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Navigation from '@/components/Navigation';
import { Conducteur, ConducteurElement, ElementType, ConducteurWithElements } from '@/types/conducteur';
import { conducteurService } from '@/services/conducteurService';
import { programsService } from '@/services/supabaseService';
import { Program } from '@/types/program';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const elementTypes: { value: ElementType; label: string }[] = [
  { value: 'introduction', label: 'Introduction' },
  { value: 'rubrique', label: 'Rubrique' },
  { value: 'intervenant', label: 'Intervenant' },
  { value: 'musique', label: 'Musique' },
  { value: 'pub', label: 'Publicité' },
  { value: 'meteo', label: 'Météo' },
  { value: 'flash', label: 'Flash Info' },
  { value: 'chronique', label: 'Chronique' },
  { value: 'conclusion', label: 'Conclusion' }
];

const ConducteurForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [conducteur, setConducteur] = useState<Partial<Conducteur>>({
    titre: '',
    date_emission: '',
    heure_debut: '',
    heure_fin: '',
    firebase_program_id: '',
    status: 'brouillon'
  });
  
  const [elements, setElements] = useState<Partial<ConducteurElement>[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrograms();
      if (isEdit && id) {
        loadConducteur(id);
      }
    }
  }, [user, isEdit, id]);

  const loadPrograms = async () => {
    if (!user) return;
    
    try {
      const data = await programsService.getAll(user.id);
      setPrograms(data);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      toast.error('Erreur lors du chargement des programmes');
    }
  };

  const loadConducteur = async (conducteurId: string) => {
    try {
      setIsLoading(true);
      const data = await conducteurService.getWithElements(conducteurId);
      if (data) {
        setConducteur(data);
        setElements(data.elements);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du conducteur:', error);
      toast.error('Erreur lors du chargement du conducteur');
      navigate('/conducteurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgramChange = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      setConducteur(prev => ({
        ...prev,
        firebase_program_id: programId,
        titre: program.nom,
        heure_debut: program.heure_debut,
        heure_fin: program.heure_fin
      }));
    }
  };

  const addElement = () => {
    const newElement: Partial<ConducteurElement> = {
      ordre: elements.length + 1,
      type: 'rubrique',
      titre: '',
      duree_minutes: 5
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (index: number, field: keyof ConducteurElement, value: any) => {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], [field]: value };
    setElements(newElements);
  };

  const removeElement = (index: number) => {
    const newElements = elements.filter((_, i) => i !== index);
    // Réorganiser les ordres
    newElements.forEach((element, i) => {
      element.ordre = i + 1;
    });
    setElements(newElements);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newElements = Array.from(elements);
    const [reorderedElement] = newElements.splice(result.source.index, 1);
    newElements.splice(result.destination.index, 0, reorderedElement);

    // Réorganiser les ordres
    newElements.forEach((element, index) => {
      element.ordre = index + 1;
    });

    setElements(newElements);
  };

  const validateForm = (): boolean => {
    if (!conducteur.titre || !conducteur.date_emission || !conducteur.firebase_program_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (elements.length === 0) {
      toast.error('Ajoutez au moins un élément au conducteur');
      return false;
    }

    const invalidElements = elements.some(element => !element.titre?.trim());
    if (invalidElements) {
      toast.error('Tous les éléments doivent avoir un titre');
      return false;
    }

    return true;
  };

  const handleSave = async (asDraft = true) => {
    if (!user || !validateForm()) return;

    try {
      setIsSaving(true);
      
      const conducteurData = {
        ...conducteur,
        firebase_user_id: user.id,
        status: asDraft ? 'brouillon' : 'en_attente'
      } as Omit<Conducteur, 'id' | 'created_at' | 'updated_at' | 'version'>;

      let conducteurId = id;

      if (isEdit && id) {
        await conducteurService.update(id, conducteurData);
      } else {
        conducteurId = await conducteurService.create(conducteurData);
      }

      // Sauvegarder les éléments
      if (conducteurId) {
        // Supprimer les anciens éléments si c'est une édition
        if (isEdit) {
          const existingConducteur = await conducteurService.getWithElements(conducteurId);
          if (existingConducteur) {
            for (const element of existingConducteur.elements) {
              await conducteurService.deleteElement(element.id);
            }
          }
        }

        // Créer les nouveaux éléments
        for (const element of elements) {
          if (element.titre?.trim()) {
            await conducteurService.createElement({
              ...element,
              conducteur_id: conducteurId
            } as Omit<ConducteurElement, 'id' | 'created_at' | 'updated_at'>);
          }
        }

        // Créer notification si envoyé pour validation
        if (!asDraft) {
          await conducteurService.createNotification({
            firebase_user_id: user.id,
            type: 'nouveau_conducteur',
            titre: 'Nouveau conducteur en attente',
            message: `Le conducteur "${conducteur.titre}" a été soumis pour validation`,
            conducteur_id: conducteurId,
            lu: false
          });
        }
      }

      toast.success(asDraft ? 'Conducteur sauvegardé' : 'Conducteur envoyé pour validation');
      navigate('/conducteurs');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isEdit ? 'Éditer le conducteur' : 'Nouveau conducteur'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Modifiez votre conducteur d\'émission' : 'Créez votre conducteur d\'émission'}
          </p>
        </div>

        {/* Informations générales */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Renseignez les informations de base du conducteur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Programme *</Label>
                <Select value={conducteur.firebase_program_id} onValueChange={handleProgramChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.nom} - {program.jour} {program.heure_debut}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={conducteur.titre}
                  onChange={(e) => setConducteur(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Titre du conducteur"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date d'émission *</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !conducteur.date_emission && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {conducteur.date_emission ? 
                        format(new Date(conducteur.date_emission), "dd MMMM yyyy", { locale: fr }) : 
                        "Sélectionner une date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={conducteur.date_emission ? new Date(conducteur.date_emission) : undefined}
                      onSelect={(date) => {
                        setConducteur(prev => ({ 
                          ...prev, 
                          date_emission: date ? format(date, 'yyyy-MM-dd') : '' 
                        }));
                        setShowCalendar(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="heure_debut">Heure début</Label>
                <Input
                  id="heure_debut"
                  type="time"
                  value={conducteur.heure_debut}
                  onChange={(e) => setConducteur(prev => ({ ...prev, heure_debut: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heure_fin">Heure fin</Label>
                <Input
                  id="heure_fin"
                  type="time"
                  value={conducteur.heure_fin}
                  onChange={(e) => setConducteur(prev => ({ ...prev, heure_fin: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Éléments du conducteur */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Éléments du conducteur</CardTitle>
                <CardDescription>
                  Organisez les différentes parties de votre émission
                </CardDescription>
              </div>
              <Button onClick={addElement} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="elements">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {elements.map((element, index) => (
                      <Draggable key={index} draggableId={index.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border rounded-lg p-4 bg-card"
                          >
                            <div className="flex items-start gap-4">
                              <div {...provided.dragHandleProps} className="mt-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              
                              <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                      value={element.type}
                                      onValueChange={(value) => updateElement(index, 'type', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {elementTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Titre *</Label>
                                    <Input
                                      value={element.titre}
                                      onChange={(e) => updateElement(index, 'titre', e.target.value)}
                                      placeholder="Titre de l'élément"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Durée (min)</Label>
                                    <Input
                                      type="number"
                                      value={element.duree_minutes || ''}
                                      onChange={(e) => updateElement(index, 'duree_minutes', parseInt(e.target.value) || undefined)}
                                      placeholder="5"
                                    />
                                  </div>
                                </div>

                                {element.type === 'musique' && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Titre musical</Label>
                                      <Input
                                        value={element.musique_titre || ''}
                                        onChange={(e) => updateElement(index, 'musique_titre', e.target.value)}
                                        placeholder="Titre de la chanson"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Artiste</Label>
                                      <Input
                                        value={element.musique_artiste || ''}
                                        onChange={(e) => updateElement(index, 'musique_artiste', e.target.value)}
                                        placeholder="Nom de l'artiste"
                                      />
                                    </div>
                                  </div>
                                )}

                                {element.type === 'intervenant' && (
                                  <div className="space-y-2">
                                    <Label>Intervenant</Label>
                                    <Input
                                      value={element.intervenant || ''}
                                      onChange={(e) => updateElement(index, 'intervenant', e.target.value)}
                                      placeholder="Nom de l'intervenant"
                                    />
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={element.description || ''}
                                    onChange={(e) => updateElement(index, 'description', e.target.value)}
                                    placeholder="Description de l'élément"
                                    rows={2}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Notes techniques</Label>
                                  <Textarea
                                    value={element.notes_techniques || ''}
                                    onChange={(e) => updateElement(index, 'notes_techniques', e.target.value)}
                                    placeholder="Notes pour les techniciens"
                                    rows={2}
                                  />
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeElement(index)}
                                className="text-red-600 hover:text-red-700 mt-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {elements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun élément ajouté</p>
                <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate('/conducteurs')}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSaving ? 'Envoi...' : 'Envoyer pour validation'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConducteurForm;