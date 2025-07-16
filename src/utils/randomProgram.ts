
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserData {
  id: string;
  radioSlug?: string;
  radioName?: string;
}

export const getRandomRadioSlug = async (): Promise<string> => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    if (usersSnapshot.empty) {
      return 'demo-radio';
    }
    
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserData[];
    
    const usersWithSlug = users.filter(user => user.radioSlug);
    
    if (usersWithSlug.length === 0) {
      return 'demo-radio';
    }
    
    const randomUser = usersWithSlug[Math.floor(Math.random() * usersWithSlug.length)];
    return randomUser.radioSlug || 'demo-radio';
  } catch (error) {
    console.error('Error fetching random radio slug:', error);
    return 'demo-radio';
  }
};
