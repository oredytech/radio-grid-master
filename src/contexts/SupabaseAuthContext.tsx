import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'directeur' | 'animateur', radioName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Connexion réussie!');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast.error(error.message || 'Email ou mot de passe incorrect');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'directeur' | 'animateur', radioName: string) => {
    try {
      const radioSlug = radioName.toLowerCase().replace(/\s+/g, '-');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            role,
            radio_name: radioName,
            radio_slug: radioSlug,
          },
        },
      });

      if (error) throw error;

      // Create radio if user is a directeur
      if (data.user && role === 'directeur') {
        const { error: radioError } = await supabase
          .from('radios')
          .insert({
            name: radioName,
            slug: radioSlug,
            owner_id: data.user.id,
          });

        if (radioError) {
          console.error('Error creating radio:', radioError);
        }
      }

      toast.success('Compte créé avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      if (error.message?.includes('already registered')) {
        toast.error('Cet email est déjà utilisé');
      } else {
        toast.error(error.message || 'Erreur lors de l\'inscription');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
