
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Program } from '@/types/program';
import { Animateur } from '@/types/animateur';

// Collections
const PROGRAMS_COLLECTION = 'programmes';
const ANIMATEURS_COLLECTION = 'animateurs';
const USERS_COLLECTION = 'utilisateurs';

// Programs Service
export const programsService = {
  async create(program: Omit<Program, 'id'>) {
    const docRef = await addDoc(collection(db, PROGRAMS_COLLECTION), {
      ...program,
      date_creation: Timestamp.now(),
      date_modification: Timestamp.now()
    });
    return docRef.id;
  },

  async getAll() {
    const q = query(collection(db, PROGRAMS_COLLECTION), orderBy('date_creation', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date_creation: doc.data().date_creation?.toDate?.()?.toISOString() || doc.data().date_creation,
      date_modification: doc.data().date_modification?.toDate?.()?.toISOString() || doc.data().date_modification
    })) as Program[];
  },

  async update(id: string, program: Partial<Program>) {
    const docRef = doc(db, PROGRAMS_COLLECTION, id);
    await updateDoc(docRef, {
      ...program,
      date_modification: Timestamp.now()
    });
  },

  async delete(id: string) {
    const docRef = doc(db, PROGRAMS_COLLECTION, id);
    await deleteDoc(docRef);
  }
};

// Animateurs Service
export const animateursService = {
  async create(animateur: Omit<Animateur, 'id'>) {
    const docRef = await addDoc(collection(db, ANIMATEURS_COLLECTION), {
      ...animateur,
      date_creation: Timestamp.now(),
      date_modification: Timestamp.now()
    });
    return docRef.id;
  },

  async getAll() {
    const q = query(collection(db, ANIMATEURS_COLLECTION), orderBy('nom', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date_creation: doc.data().date_creation?.toDate?.()?.toISOString() || doc.data().date_creation,
      date_modification: doc.data().date_modification?.toDate?.()?.toISOString() || doc.data().date_modification
    })) as Animateur[];
  },

  async update(id: string, animateur: Partial<Animateur>) {
    const docRef = doc(db, ANIMATEURS_COLLECTION, id);
    await updateDoc(docRef, {
      ...animateur,
      date_modification: Timestamp.now()
    });
  },

  async delete(id: string) {
    const docRef = doc(db, ANIMATEURS_COLLECTION, id);
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
