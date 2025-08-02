import { supabase } from '@/integrations/supabase/client';
import { Conducteur, ConducteurElement, ConducteurWithElements, Notification } from '@/types/conducteur';

// Service temporaire avec casting complet pour éviter les erreurs TypeScript
const castSupabase = supabase as any;

export const conducteurService = {
  // Conducteurs
  async create(conducteur: any): Promise<string> {
    const { data, error } = await castSupabase
      .from('conducteurs')
      .insert(conducteur)
      .select('id')
      .single();
    
    if (error) throw error;
    return data?.id || '';
  },

  async getAll(firebaseUserId: string): Promise<any[]> {
    const { data, error } = await castSupabase
      .from('conducteurs')
      .select('*')
      .eq('firebase_user_id', firebaseUserId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByStatus(status: string): Promise<any[]> {
    const { data, error } = await castSupabase
      .from('conducteurs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getWithElements(conducteurId: string): Promise<ConducteurWithElements | null> {
    const { data: conducteur, error: conducteurError } = await castSupabase
      .from('conducteurs')
      .select('*')
      .eq('id', conducteurId)
      .single();
    
    if (conducteurError) throw conducteurError;
    if (!conducteur) return null;

    const { data: elements, error: elementsError } = await castSupabase
      .from('conducteur_elements')
      .select('*')
      .eq('conducteur_id', conducteurId)
      .order('ordre', { ascending: true });
    
    if (elementsError) throw elementsError;

    return {
      ...conducteur as Conducteur,
      elements: elements || []
    };
  },

  async update(id: string, conducteur: Partial<Conducteur>): Promise<void> {
    const { error } = await castSupabase
      .from('conducteurs')
      .update(conducteur)
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStatus(id: string, status: string, commentaires?: string): Promise<void> {
    const updateData: any = { status };
    if (commentaires) updateData.commentaires_directeur = commentaires;

    const { error } = await castSupabase
      .from('conducteurs')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await castSupabase
      .from('conducteurs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Éléments du conducteur
  async createElement(element: Omit<ConducteurElement, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await castSupabase
      .from('conducteur_elements')
      .insert(element)
      .select('id')
      .single();
    
    if (error) throw error;
    return data?.id || '';
  },

  async updateElement(id: string, element: Partial<ConducteurElement>): Promise<void> {
    const { error } = await castSupabase
      .from('conducteur_elements')
      .update(element)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteElement(id: string): Promise<void> {
    const { error } = await castSupabase
      .from('conducteur_elements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async reorderElements(elements: { id: string; ordre: number }[]): Promise<void> {
    const updates = elements.map(({ id, ordre }) => 
      castSupabase.from('conducteur_elements').update({ ordre }).eq('id', id)
    );
    
    const results = await Promise.all(updates);
    const errors = results.filter((result: any) => result.error);
    if (errors.length > 0) throw errors[0].error;
  },

  // Notifications
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    const { error } = await castSupabase
      .from('notifications')
      .insert(notification);
    
    if (error) throw error;
  },

  async getNotifications(firebaseUserId: string): Promise<Notification[]> {
    const { data, error } = await castSupabase
      .from('notifications')
      .select('*')
      .eq('firebase_user_id', firebaseUserId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await castSupabase
      .from('notifications')
      .update({ lu: true })
      .eq('id', id);
    
    if (error) throw error;
  }
};