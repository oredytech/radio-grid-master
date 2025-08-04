import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { animateurService } from '@/services/animateurService';
import { firebaseService } from '@/services/firebaseService';

const signupSchema = z.object({
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  radioId: z.string().min(1, 'Veuillez sélectionner une radio'),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

interface RadioProgram {
  id: string;
  nom: string;
  directeurNom: string;
}

export default function AnimateurSignup() {
  const { radioSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [radioPrograms, setRadioPrograms] = useState<RadioProgram[]>([]);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      prenom: '',
      nom: '',
      email: '',
      password: '',
      confirmPassword: '',
      radioId: '',
      bio: '',
    },
  });

  useEffect(() => {
    const loadRadioPrograms = async () => {
      try {
        setLoading(true);
        const programs = await firebaseService.getPrograms();
        
        const radioData: RadioProgram[] = await Promise.all(
          programs.map(async (program) => {
            try {
              const directeur = await firebaseService.getUserById(program.userId);
              return {
                id: program.id,
                nom: program.nom,
                directeurNom: directeur?.name || 'Directeur inconnu'
              };
            } catch (error) {
              return {
                id: program.id,
                nom: program.nom,
                directeurNom: 'Directeur inconnu'
              };
            }
          })
        );
        
        setRadioPrograms(radioData);
      } catch (error) {
        console.error('Erreur lors du chargement des radios:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la liste des radios',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadRadioPrograms();
  }, [toast]);

  const onSubmit = async (data: SignupForm) => {
    try {
      setSubmitting(true);

      // Créer le compte Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Générer un slug unique
      const slug = await animateurService.generateUniqueSlug(data.nom, data.prenom);

      // Créer l'animateur dans Supabase
      const animateurData = {
        firebase_user_id: userCredential.user.uid,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        slug,
        bio: data.bio || '',
        status: 'actif' as const,
      };

      const animateurId = await animateurService.createAnimateur(animateurData);

      // Associer l'animateur au programme
      await animateurService.assignAnimateurToProgram(animateurId, data.radioId);

      toast({
        title: 'Compte créé avec succès',
        description: 'Vous pouvez maintenant vous connecter à votre tableau de bord',
      });

      navigate(`/${radioSlug}/animateur/login`);
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création du compte',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des radios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inscription Animateur</CardTitle>
          <CardDescription>
            Créez votre compte pour accéder au tableau de bord animateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre prénom" {...field} />
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
                      <Input placeholder="Votre nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="radioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Radio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre radio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {radioPrograms.map((radio) => (
                          <SelectItem key={radio.id} value={radio.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{radio.nom}</span>
                              <span className="text-sm text-muted-foreground">
                                Directeur: {radio.directeurNom}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
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
                        placeholder="Parlez-nous de vous..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Création en cours...' : 'Créer le compte'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}