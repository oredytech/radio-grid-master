
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
  setDoc
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
      date_creation: Timestamp.now(),
      date_modification: Timestamp.now()
    });
    console.log('Programme créé avec ID:', docRef.id);
    return docRef.id;
  },

  async getAll(userId: string) {
    console.log('Récupération programmes pour utilisateur:', userId);
    const q = query(
      collection(db, `utilisateurs/${userId}/programmes`), 
      orderBy('date_creation', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const programs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date_creation: doc.data().date_creation?.toDate?.()?.toISOString() || doc.data().date_creation,
      date_modification: doc.data().date_modification?.toDate?.()?.toISOString() || doc.data().date_modification
    })) as Program[];
    console.log('Programmes récupérés:', programs.length);
    return programs;
  },

  async update(id: string, program: Partial<Program>, userId: string) {
    const docRef = doc(db, `utilisateurs/${userId}/programmes`, id);
    await updateDoc(docRef, {
      ...program,
      date_modification: Timestamp.now()
    });
  },

  async delete(id: string, userId: string) {
    const docRef = doc(db, `utilisateurs/${userId}/programmes`, id);
    await deleteDoc(docRef);
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
