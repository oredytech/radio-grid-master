import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { animateurService } from '@/services/animateurService';
import { conducteurService } from '@/services/conducteurService';
import { AnimateurWithPrograms } from '@/types/animateur';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { Calendar, Clock, FileText, LogOut, User, Radio } from 'lucide-react';

export default function AnimateurDashboard() {
  const { radioSlug } = useParams<{ radioSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [animateur, setAnimateur] = useState<AnimateurWithPrograms | null>(null);
  const [conducteurs, setConducteurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate(`/${radioSlug}/animateur/login`);
      return;
    }

    const loadData = async () => {
      try {
        const animateurData = await animateurService.getAnimateurWithPrograms(user.id);
        if (!animateurData) {
          toast.error('Animateur non trouvé');
          navigate('/');
          return;
        }
        setAnimateur(animateurData);

        // Charger les conducteurs de l'animateur
        const conducteursData = await conducteurService.getAll(user.id);
        setConducteurs(conducteursData);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, radioSlug, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate(`/${radioSlug}/animateur/login`);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      brouillon: { label: 'Brouillon', variant: 'secondary' as const },
      en_attente: { label: 'En attente', variant: 'default' as const },
      valide: { label: 'Validé', variant: 'default' as const },
      rejete: { label: 'Rejeté', variant: 'destructive' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.brouillon;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!animateur) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={animateur.avatar_url} />
              <AvatarFallback>
                {animateur.prenom[0]}{animateur.nom[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {animateur.prenom} {animateur.nom}
              </h1>
              <p className="text-muted-foreground">Tableau de bord animateur</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="conducteurs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conducteurs">
              <FileText className="h-4 w-4 mr-2" />
              Conducteurs
            </TabsTrigger>
            <TabsTrigger value="programmes">
              <Radio className="h-4 w-4 mr-2" />
              Programmes
            </TabsTrigger>
            <TabsTrigger value="profil">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conducteurs">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Mes Conducteurs</h2>
                <Button onClick={() => navigate('/conducteurs/nouveau')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Nouveau Conducteur
                </Button>
              </div>

              <div className="grid gap-4">
                {conducteurs.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">Aucun conducteur trouvé</p>
                    </CardContent>
                  </Card>
                ) : (
                  conducteurs.map((conducteur) => (
                    <Card key={conducteur.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{conducteur.titre}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(conducteur.date_emission).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {conducteur.heure_debut} - {conducteur.heure_fin}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(conducteur.status)}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/conducteurs/${conducteur.id}`)}
                            >
                              Voir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="programmes">
            <div className="grid gap-6">
              <h2 className="text-xl font-semibold">Mes Programmes</h2>
              <div className="grid gap-4">
                {animateur.programs.map((program) => (
                  <Card key={program.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Programme {program.firebase_program_id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Accès en {program.can_edit ? 'lecture/écriture' : 'lecture seule'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Voir le programme
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profil">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Prénom</label>
                    <p className="text-sm text-muted-foreground">{animateur.prenom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nom</label>
                    <p className="text-sm text-muted-foreground">{animateur.nom}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{animateur.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <p className="text-sm text-muted-foreground">/{animateur.slug}</p>
                </div>
                {animateur.bio && (
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <p className="text-sm text-muted-foreground">{animateur.bio}</p>
                  </div>
                )}
                <Button variant="outline">
                  Modifier le profil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}