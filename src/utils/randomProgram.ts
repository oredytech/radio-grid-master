
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const getRandomRadioSlug = async (): Promise<string> => {
  try {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, limit(100));
    const snapshot = await getDocs(usersQuery);
    
    if (snapshot.empty) {
      return 'demo-radio';
    }
    
    const users = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    const usersWithRadioSlug = users.filter(user => user.radioSlug);
    
    if (usersWithRadioSlug.length === 0) {
      return 'demo-radio';
    }
    
    const randomIndex = Math.floor(Math.random() * usersWithRadioSlug.length);
    return usersWithRadioSlug[randomIndex].radioSlug;
  } catch (error) {
    console.error('Error fetching random radio slug:', error);
    return 'demo-radio';
  }
};
