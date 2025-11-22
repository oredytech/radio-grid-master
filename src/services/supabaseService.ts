import { supabase } from '@/integrations/supabase/client';

export const programsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('programs')
      .select('*, radio:radios(*)')
      .eq('radio.owner_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(program: any, userId: string) {
    // Get user's radio
    const { data: radio } = await supabase
      .from('radios')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (!radio) throw new Error('Radio not found');

    const { data, error } = await supabase
      .from('programs')
      .insert({
        ...program,
        radio_id: radio.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const radioService = {
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('radios')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByOwnerId(ownerId: string) {
    const { data, error } = await supabase
      .from('radios')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    
    if (error) throw error;
    return data;
  },
};
