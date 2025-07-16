
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  Timestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Program } from '@/types/program';
import { Animateur } from '@/types/animateur';

// Service pour créer la collection utilisateur avec ses sous-collections
export const userCollectionService = {
  async createUserCollection(userId: string, userData: any) {
    // Créer le document directeur/admin dans la collection utilisateur
    await setDoc(doc(db, `utilisateurs/${userId}/directeur`, 'info'), {
      ...userData,
      date_creation: Timestamp.now(),
      date_modification: Timestamp.now()
    });
    
    console.log(`Collection utilisateur créée pour ${userId}`);
  }
};

// Programs Service avec collections utilisateur
export const programsService = {
  async create(program: Omit<Program, 'id'>, userId: string) {
    console.log('Création programme pour utilisateur:', userId);
    const docRef = await addDoc(collection(db, `utilisateurs/${userId}/programmes`), {
      ...program,
      userId: userId,
      date_creation: Timestamp.now(),
      date_modification: Timestamp.now()
    });
    console.log('Programme créé avec ID:', docRef.id);
    return docRef.id;
  },

  async getAll(userId: string) {
    console.log('Récupération programmes pour utilisateur:', userId);
    
    try {
      // Méthode 1: Nouvelle structure (sous-collection utilisateurs/{userId}/programmes)
      console.log('Tentative 1: Sous-collection programmes');
      const subCollectionQuery = query(
        collection(db, `utilisateurs/${userId}/programmes`)
      );
      const subCollectionSnapshot = await getDocs(subCollectionQuery);
      
      if (!subCollectionSnapshot.empty) {
        const programs = subCollectionSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            userId: userId,
            date_creation: data.date_creation?.toDate?.()?.toISOString() || data.date_creation,
            date_modification: data.date_modification?.toDate?.()?.toISOString() || data.date_modification
          };
        }) as Program[];
        
        console.log('Programmes trouvés (sous-collection):', programs.length);
        return programs.sort((a, b) => {
          const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
          const dayDiff = dayOrder.indexOf(a.jour) - dayOrder.indexOf(b.jour);
          if (dayDiff !== 0) return dayDiff;
          return a.heure_debut.localeCompare(b.heure_debut);
        });
      }
      
      console.log('Sous-collection vide, tentative 2: Collection principale avec userId');
      
      // Méthode 2: Ancienne structure (collection programmes avec userId)
      const mainCollectionQuery = query(
        collection(db, 'programmes'),
        where('userId', '==', userId)
      );
      const mainCollectionSnapshot = await getDocs(mainCollectionQuery);
      
      if (!mainCollectionSnapshot.empty) {
        const programs = mainCollectionSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date_creation: data.date_creation?.toDate?.()?.toISOString() || data.date_creation,
            date_modification: data.date_modification?.toDate?.()?.toISOString() || data.date_modification
          };
        }) as Program[];
        
        console.log('Programmes trouvés (collection principale):', programs.length);
        return programs.sort((a, b) => {
          const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
          const dayDiff = dayOrder.indexOf(a.jour) - dayOrder.indexOf(b.jour);
          if (dayDiff !== 0) return dayDiff;
          return a.heure_debut.localeCompare(b.heure_debut);
        });
      }
      
      console.log('Collection principale vide, tentative 3: Recherche dans toutes les collections programmes');
      
      // Méthode 3: Recherche dans toutes les sous-collections utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'utilisateurs'));
      
      for (const userDoc of usersSnapshot.docs) {
        if (userDoc.id === userId) {
          try {
            const userProgramsQuery = query(
              collection(db, `utilisateurs/${userDoc.id}/programmes`)
            );
            const userProgramsSnapshot = await getDocs(userProgramsQuery);
            
            if (!userProgramsSnapshot.empty) {
              const programs = userProgramsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  userId: userId,
                  date_creation: data.date_creation?.toDate?.()?.toISOString() || data.date_creation,
                  date_modification: data.date_modification?.toDate?.()?.toISOString() || data.date_modification
                };
              }) as Program[];
              
              console.log('Programmes trouvés (recherche exhaustive):', programs.length);
              return programs.sort((a, b) => {
                const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                const dayDiff = dayOrder.indexOf(a.jour) - dayOrder.indexOf(b.jour);
                if (dayDiff !== 0) return dayDiff;
                return a.heure_debut.localeCompare(b.heure_debut);
              });
            }
          } catch (error) {
            console.log(`Erreur lors de la recherche dans utilisateurs/${userDoc.id}/programmes:`, error);
          }
        }
      }
      
      console.log('Aucun programme trouvé avec toutes les méthodes');
      return [];
      
    } catch (error) {
      console.error('Erreur lors de la récupération des programmes:', error);
      return [];
    }
  },

  async update(id: string, program: Partial<Program>, userId: string) {
    try {
      // Essayer d'abord avec la nouvelle structure
      const docRef = doc(db, `utilisateurs/${userId}/programmes`, id);
      await updateDoc(docRef, {
        ...program,
        date_modification: Timestamp.now()
      });
    } catch (error) {
      // Fallback vers l'ancienne structure
      const docRef = doc(db, 'programmes', id);
      await updateDoc(docRef, {
        ...program,
        date_modification: Timestamp.now()
      });
    }
  },

  async delete(id: string, userId: string) {
    try {
      // Essayer d'abord avec la nouvelle structure
      const docRef = doc(db, `utilisateurs/${userId}/programmes`, id);
      await deleteDoc(docRef);
    } catch (error) {
      // Fallback vers l'ancienne structure
      const docRef = doc(db, 'programmes', id);
      await deleteDoc(docRef);
    }
  }
};

// Animateurs Service avec collections utilisateur
export const animateursService = {
  async create(animateur: Omit<Animateur, 'id'>, userId: string) {
    console.log('Création animateur pour utilisateur:', userId);
    const docRef = await addDoc(collection(db, `utilisateurs/${userId}/animateurs`), {
      ...animateur,
      date_creation: Timestamp.now(),
      date_modification: Timestamp.now()
    });
    console.log('Animateur créé avec ID:', docRef.id);
    return docRef.id;
  },

  async getAll(userId: string) {
    console.log('Récupération animateurs pour utilisateur:', userId);
    const q = query(
      collection(db, `utilisateurs/${userId}/animateurs`), 
      orderBy('nom', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const animateurs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date_creation: doc.data().date_creation?.toDate?.()?.toISOString() || doc.data().date_creation,
      date_modification: doc.data().date_modification?.toDate?.()?.toISOString() || doc.data().date_modification
    })) as Animateur[];
    console.log('Animateurs récupérés:', animateurs.length);
    return animateurs;
  },

  async update(id: string, animateur: Partial<Animateur>, userId: string) {
    const docRef = doc(db, `utilisateurs/${userId}/animateurs`, id);
    await updateDoc(docRef, {
      ...animateur,
      date_modification: Timestamp.now()
    });
  },

  async delete(id: string, userId: string) {
    const docRef = doc(db, `utilisateurs/${userId}/animateurs`, id);
    await deleteDoc(docRef);
  }
};

// File Upload Service
export const uploadService = {
  async uploadImage(file: File, folder: string = 'images') {
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  }
};
