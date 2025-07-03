
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { userCollectionService } from '@/services/firebaseService';

interface User {
  id: string;
  email: string;
  name: string;
  fonction?: string;
  radioName?: string;
  role: 'admin' | 'animator' | 'guest';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, fonction?: string, radioName?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Récupérer les données utilisateur depuis la collection directeur
        const userDoc = await getDoc(doc(db, `utilisateurs/${firebaseUser.uid}/directeur`, 'info'));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || 'Utilisateur',
            fonction: userData.fonction,
            radioName: userData.radioName,
            role: userData.role || 'admin'
          });
        } else {
          // Fallback vers l'ancienne structure si elle existe
          const oldUserDoc = await getDoc(doc(db, 'utilisateurs', firebaseUser.uid));
          if (oldUserDoc.exists()) {
            const userData = oldUserDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || 'Utilisateur',
              fonction: userData.fonction,
              radioName: userData.radioName,
              role: userData.role || 'admin'
            });
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Tentative de connexion pour:', email);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Connexion réussie');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, fonction?: string, radioName?: string) => {
    console.log('Tentative d\'inscription pour:', email);
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Utilisateur Firebase créé:', user.uid);
      
      // Créer la collection utilisateur avec le document directeur/admin
      const userData = {
        name,
        email,
        fonction: fonction || '',
        radioName: radioName || '',
        role: 'admin'
      };
      
      await userCollectionService.createUserCollection(user.uid, userData);
      console.log('Collection utilisateur créée avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log('Déconnexion');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
