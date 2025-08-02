import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { animateurService } from '@/services/animateurService';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus } from 'lucide-react';

const invitationSchema = z.object({
  email: z.string().email('Email invalide'),
  firebase_program_id: z.string().min(1, 'Programme requis'),
});

type InvitationForm = z.infer<typeof invitationSchema>;

interface InviteAnimateurDialogProps {
  radioSlug: string;
  radioNom: string;
  onInvitationSent?: () => void;
}

export default function InviteAnimateurDialog({ 
  radioSlug, 
  radioNom, 
  onInvitationSent 
}: InviteAnimateurDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<InvitationForm>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      firebase_program_id: '',
    },
  });

  const generateInvitationToken = () => {
    return crypto.randomUUID() + '-' + Date.now().toString(36);
  };

  const onSubmit = async (data: InvitationForm) => {
    if (!user) return;

    setLoading(true);
    try {
      const token = generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      await animateurService.createInvitation({
        email: data.email,
        token,
        firebase_program_id: data.firebase_program_id,
        radio_slug: radioSlug,
        radio_nom: radioNom,
        directeur_firebase_id: user.id,
        expires_at: expiresAt.toISOString(),
      });

      // Générer le lien d'invitation
      const invitationLink = `${window.location.origin}/invitation/${token}`;
      
      // Copier le lien dans le presse-papiers
      await navigator.clipboard.writeText(invitationLink);

      toast.success('Invitation créée! Le lien a été copié dans le presse-papiers');
      form.reset();
      setOpen(false);
      onInvitationSent?.();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'invitation:', error);
      toast.error('Erreur lors de la création de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Inviter un animateur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un animateur</DialogTitle>
          <DialogDescription>
            Envoyez une invitation à un animateur pour rejoindre {radioNom}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de l'animateur</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="animateur@example.com"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firebase_program_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID du programme</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ID du programme Firebase"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer l\'invitation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}