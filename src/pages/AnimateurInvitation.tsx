import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { animateurService } from '@/services/animateurService';
import { Invitation } from '@/types/animateur';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';

const invitationSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type InvitationForm = z.infer<typeof invitationSchema>;

export default function AnimateurInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<InvitationForm>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      password: '',
      confirmPassword: '',
      bio: '',
    },
  });

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        toast.error('Token d\'invitation manquant');
        navigate('/');
        return;
      }

      try {
        const invitationData = await animateurService.getInvitationByToken(token);
        if (!invitationData) {
          toast.error('Invitation invalide ou expirée');
          navigate('/');
          return;
        }
        setInvitation(invitationData);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'invitation:', error);
        toast.error('Erreur lors du chargement de l\'invitation');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token, navigate]);

  const onSubmit = async (data: InvitationForm) => {
    if (!invitation) return;

    setSubmitting(true);
    try {
      // Créer le compte Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        invitation.email,
        data.password
      );

      // Générer un slug unique
      const slug = await animateurService.generateUniqueSlug(data.nom, data.prenom);

      // Accepter l'invitation et créer l'animateur
      await animateurService.acceptInvitation(token!, {
        firebase_user_id: userCredential.user.uid,
        nom: data.nom,
        prenom: data.prenom,
        email: invitation.email,
        slug,
        bio: data.bio,
        status: 'actif'
      });

      toast.success('Compte créé avec succès!');
      navigate(`/${invitation.radio_slug}/animateur`);
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      toast.error(error.message || 'Erreur lors de la création du compte');
    } finally {
      setSubmitting(false);
    }
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

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Invitation à rejoindre</CardTitle>
          <CardDescription className="text-lg font-medium text-primary">
            {invitation.radio_nom}
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            Vous avez été invité(e) à rejoindre cette radio en tant qu'animateur(trice)
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={invitation.email} disabled />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Parlez-nous de vous..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
              >
                {submitting ? 'Création en cours...' : 'Créer mon compte'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}