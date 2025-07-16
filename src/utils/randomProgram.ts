
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const getRandomRadioSlug = async (): Promise<string> => {
  try {
    // Get all users who have a radioSlug
    const usersSnapshot = await getDocs(collection(db, 'utilisateurs'));
    const usersWithRadioSlug = usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.radioSlug && user.radioSlug.trim() !== '');

    if (usersWithRadioSlug.length === 0) {
      // Fallback to a default slug if no radios found
      return 'radio-exemple';
    }

    // Select a random radio
    const randomIndex = Math.floor(Math.random() * usersWithRadioSlug.length);
    const randomUser = usersWithRadioSlug[randomIndex];
    
    return randomUser.radioSlug;
  } catch (error) {
    console.error('Error getting random radio slug:', error);
    // Fallback to default
    return 'radio-exemple';
  }
};
