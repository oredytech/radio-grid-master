
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { userCollectionService } from '@/services/firebaseService';
import { generateSlug } from '@/utils/slugUtils';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  radioName: string;
  radioSlug?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string, radioName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'utilisateurs', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || '',
              role: userData.role || '',
              radioName: userData.radioName || '',
              radioSlug: userData.radioSlug || ''
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string, radioName: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Générer le slug de la radio
      const radioSlug = generateSlug(radioName);
      
      const userData = {
        name,
        email,
        role,
        radioName,
        radioSlug,
        date_creation: Timestamp.now(),
        date_modification: Timestamp.now()
      };

      // Sauvegarder dans la collection utilisateurs principale pour les requêtes par slug
      await setDoc(doc(db, 'utilisateurs', firebaseUser.uid), userData);
      
      // Créer la structure de données personnelle de l'utilisateur
      await userCollectionService.createUserCollection(firebaseUser.uid, userData);
      
      console.log('Utilisateur créé avec succès:', firebaseUser.uid);
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      default:
        return 'Une erreur est survenue';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
