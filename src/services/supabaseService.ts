import { supabase } from '@/integrations/supabase/client';
import { Program } from '@/types/program';
import { Animateur } from '@/types/animateur';

// Cast supabase to any to avoid type issues with tables not in types.ts
const castSupabase = supabase as any;

// Helper to map Supabase program to app Program format
const mapSupabaseProgramToProgram = (data: any): Program => ({
  id: data.id,
  nom: data.title,
  animateurs: data.animateur_id ? [data.animateur_id] : [],
  jour: getDayFromNumber(data.day_of_week),
  heure_debut: data.start_time || '00:00',
  heure_fin: data.end_time || '00:00',
  description: data.description || '',
  categorie: mapTypeToCategorie(data.type),
  imageUrl: data.image_url,
  date_creation: data.created_at,
  date_modification: data.updated_at,
  statut: 'En cours',
  userId: data.radio?.owner_id,
});

// Helper to map app Program to Supabase format
const mapProgramToSupabase = (program: Partial<Program>) => ({
  title: program.nom,
  description: program.description,
  day_of_week: getDayNumber(program.jour),
  start_time: program.heure_debut,
  end_time: program.heure_fin,
  type: mapCategorieToType(program.categorie),
  slug: program.nom?.toLowerCase().replace(/\s+/g, '-') || 'program',
});

const getDayNumber = (jour: string | undefined): number => {
  const days: Record<string, number> = {
    'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4,
    'Vendredi': 5, 'Samedi': 6, 'Dimanche': 0
  };
  return days[jour || 'Lundi'] || 1;
};

const getDayFromNumber = (num: number): Program['jour'] => {
  const days: Record<number, Program['jour']> = {
    0: 'Dimanche', 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi',
    4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi'
  };
  return days[num] || 'Lundi';
};

const mapCategorieToType = (categorie: string | undefined): string => {
  const map: Record<string, string> = {
    'Magazine': 'magazine', 'Musique': 'music', 'Sport': 'sport',
    'Actualité': 'news', 'Culture': 'culture', 'Religion': 'religious',
    'Divertissement': 'entertainment'
  };
  return map[categorie || 'Magazine'] || 'other';
};

const mapTypeToCategorie = (type: string | undefined): Program['categorie'] => {
  const map: Record<string, Program['categorie']> = {
    'magazine': 'Magazine', 'music': 'Musique', 'sport': 'Sport',
    'news': 'Actualité', 'culture': 'Culture', 'religious': 'Religion',
    'entertainment': 'Divertissement', 'other': 'Magazine'
  };
  return map[type || 'other'] || 'Magazine';
};

export const programsService = {
  async getAll(userId: string): Promise<Program[]> {
    // Get user's radio first
    const { data: radio } = await castSupabase
      .from('radios')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
    
    if (!radio) return [];

    const { data, error } = await castSupabase
      .from('programs')
      .select('*, radio:radios(*)')
      .eq('radio_id', radio.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(mapSupabaseProgramToProgram);
  },

  async getById(id: string): Promise<Program | null> {
    const { data, error } = await castSupabase
      .from('programs')
      .select('*, radio:radios(*)')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? mapSupabaseProgramToProgram(data) : null;
  },

  async create(program: Omit<Program, 'id'>, userId: string): Promise<string> {
    // Get user's radio
    const { data: radio } = await castSupabase
      .from('radios')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();

    if (!radio) throw new Error('Radio not found');

    const { data, error } = await castSupabase
      .from('programs')
      .insert({
        ...mapProgramToSupabase(program),
        radio_id: radio.id,
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  },

  async update(id: string, program: Partial<Program>, userId?: string): Promise<void> {
    const { error } = await castSupabase
      .from('programs')
      .update(mapProgramToSupabase(program))
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string, userId?: string): Promise<void> {
    const { error } = await castSupabase
      .from('programs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getByRadioSlug(radioSlug: string): Promise<Program[]> {
    const { data: radio } = await castSupabase
      .from('radios')
      .select('id')
      .eq('slug', radioSlug)
      .maybeSingle();
    
    if (!radio) return [];

    const { data, error } = await castSupabase
      .from('programs')
      .select('*, radio:radios(*)')
      .eq('radio_id', radio.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(mapSupabaseProgramToProgram);
  }
};

export const animateursService = {
  async create(animateur: Omit<Animateur, 'id'>, userId: string): Promise<string> {
    // Get user's radio
    const { data: radio } = await castSupabase
      .from('radios')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();

    if (!radio) throw new Error('Radio not found');

    const { data, error } = await castSupabase
      .from('animateurs')
      .insert({
        nom: animateur.nom,
        prenom: animateur.postnom || '',
        email: `${animateur.nom.toLowerCase().replace(/\s+/g, '')}@placeholder.com`,
        slug: `${animateur.nom}-${animateur.postnom}`.toLowerCase().replace(/\s+/g, '-'),
        bio: animateur.fonction,
        photo_url: animateur.photoUrl,
        radio_id: radio.id,
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  },

  async getAll(userId: string): Promise<Animateur[]> {
    // Get user's radio
    const { data: radio } = await castSupabase
      .from('radios')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
    
    if (!radio) return [];

    const { data, error } = await castSupabase
      .from('animateurs')
      .select('*')
      .eq('radio_id', radio.id)
      .order('nom', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map((a: any) => ({
      id: a.id,
      nom: a.nom,
      postnom: a.prenom || '',
      fonction: a.bio || '',
      photoUrl: a.photo_url,
      date_creation: a.created_at,
      date_modification: a.updated_at,
      userId: userId,
    }));
  },

  async update(id: string, animateur: Partial<Animateur>, userId: string): Promise<void> {
    const { error } = await castSupabase
      .from('animateurs')
      .update({
        nom: animateur.nom,
        prenom: animateur.postnom,
        bio: animateur.fonction,
        photo_url: animateur.photoUrl,
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await castSupabase
      .from('animateurs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const radioService = {
  async getBySlug(slug: string) {
    const { data, error } = await castSupabase
      .from('radios')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByOwnerId(ownerId: string) {
    const { data, error } = await castSupabase
      .from('radios')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getRandomSlug(): Promise<string> {
    const { data, error } = await castSupabase
      .from('radios')
      .select('slug')
      .limit(10);
    
    if (error || !data || data.length === 0) return 'demo-radio';
    
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex].slug || 'demo-radio';
  }
};

export const userCollectionService = {
  async createUserCollection(userId: string, userData: any) {
    // This is now handled by the auth trigger in Supabase
    console.log('User collection creation is handled by Supabase triggers');
  }
};

export const firebaseService = {
  async getPrograms(): Promise<Program[]> {
    const { data, error } = await castSupabase
      .from('programs')
      .select('*, radio:radios(*)')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(mapSupabaseProgramToProgram);
  },

  async getUserById(userId: string) {
    const { data, error } = await castSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

export const uploadService = {
  async uploadImage(file: File, folder: string = 'images'): Promise<string> {
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    
    const { data, error } = await castSupabase.storage
      .from('uploads')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: urlData } = castSupabase.storage
      .from('uploads')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  }
};
