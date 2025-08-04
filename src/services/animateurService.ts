import { supabase } from '@/integrations/supabase/client';
import { AnimateurSupabase, Invitation, AnimateurProgram, AnimateurWithPrograms } from '@/types/animateur';

const castSupabase = supabase as any;

export const animateurService = {
  // Invitations
  async createInvitation(invitation: Omit<Invitation, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await castSupabase
      .from('invitations')
      .insert(invitation)
      .select('id')
      .single();
    
    if (error) throw error;
    return data?.id || '';
  },

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    const { data, error } = await castSupabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async acceptInvitation(token: string, animateurData: Omit<AnimateurSupabase, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    // Récupérer l'invitation
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) throw new Error('Invitation invalide ou expirée');

    // Créer l'animateur
    const { data: animateur, error: animateurError } = await castSupabase
      .from('animateurs')
      .insert({
        ...animateurData,
        status: 'actif'
      })
      .select('id')
      .single();
    
    if (animateurError) throw animateurError;

    // Assigner le programme
    await castSupabase
      .from('animateur_programs')
      .insert({
        animateur_id: animateur.id,
        firebase_program_id: invitation.firebase_program_id,
        can_edit: true
      });

    // Marquer l'invitation comme acceptée
    await castSupabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token);

    return animateur.id;
  },

  // Animateurs
  async getAnimateur(firebaseUserId: string): Promise<AnimateurSupabase | null> {
    const { data, error } = await castSupabase
      .from('animateurs')
      .select('*')
      .eq('firebase_user_id', firebaseUserId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAnimateurBySlug(slug: string): Promise<AnimateurSupabase | null> {
    const { data, error } = await castSupabase
      .from('animateurs')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAnimateurWithPrograms(firebaseUserId: string): Promise<AnimateurWithPrograms | null> {
    const animateur = await this.getAnimateur(firebaseUserId);
    if (!animateur) return null;

    const { data: programs, error } = await castSupabase
      .from('animateur_programs')
      .select('*')
      .eq('animateur_id', animateur.id);
    
    if (error) throw error;

    return {
      ...animateur,
      programs: programs || []
    };
  },

  async updateAnimateur(id: string, updates: Partial<AnimateurSupabase>): Promise<void> {
    const { error } = await castSupabase
      .from('animateurs')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAnimateurPrograms(animateurId: string): Promise<AnimateurProgram[]> {
    const { data, error } = await castSupabase
      .from('animateur_programs')
      .select('*')
      .eq('animateur_id', animateurId);
    
    if (error) throw error;
    return data || [];
  },

  // Générer un slug unique
  async generateUniqueSlug(nom: string, prenom: string): Promise<string> {
    const baseSlug = `${prenom.toLowerCase()}-${nom.toLowerCase()}`
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await this.getAnimateurBySlug(slug);
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }
};