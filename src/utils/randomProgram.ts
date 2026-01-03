import { radioService } from '@/services/supabaseService';

export const getRandomRadioSlug = async (): Promise<string> => {
  try {
    return await radioService.getRandomSlug();
  } catch (error) {
    console.error('Error fetching random radio slug:', error);
    return 'demo-radio';
  }
};
