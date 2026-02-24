import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { Document } from '../types';

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  fetchDocuments: (userId?: string) => Promise<void>;
  uploadDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => Promise<void>;
  signDocument: (id: string) => Promise<void>;
  updateDocumentStatus: (id: string, status: Document['status']) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isLoading: false,

  fetchDocuments: async (userId?: string) => {
    set({ isLoading: true });

    try {
      const user = useAuthStore.getState().user;

      if (!user) {
        set({ documents: [], isLoading: false });
        return;
      }

      let query = supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false });

      if (userId) {
        query = query.contains('assigned_users', [userId]);
      }

      const { data: docs, error } = await query;

      if (error) throw error;

      const documents: Document[] = docs?.map((doc) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        uploadDate: doc.upload_date,
        size: doc.size,
        status: doc.status,
        requiresSignature: doc.requires_signature,
        signedDate: doc.signed_date,
        assignedUsers: doc.assigned_users,
        url: doc.url,
      })) || [];

      set({ documents, isLoading: false });
    } catch (error) {
      console.error('Fetch documents error:', error);
      set({ documents: [], isLoading: false });
    }
  },

  uploadDocument: async (doc: Omit<Document, 'id' | 'uploadDate'>) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: doc.title,
          type: doc.type,
          size: doc.size,
          status: doc.status,
          requires_signature: doc.requiresSignature,
          assigned_users: doc.assignedUsers,
          url: doc.url,
          upload_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newDoc: Document = {
          id: data.id,
          title: data.title,
          type: data.type,
          uploadDate: data.upload_date,
          size: data.size,
          status: data.status,
          requiresSignature: data.requires_signature,
          assignedUsers: data.assigned_users,
          url: data.url,
        };
        set((state) => ({ documents: [...state.documents, newDoc] }));
      }
    } catch (error) {
      console.error('Upload document error:', error);
    }
  },

  signDocument: async (id: string) => {
    const signedDate = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: 'signed',
          signed_date: signedDate,
        })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                status: 'signed' as const,
                signedDate,
              }
            : doc
        ),
      }));
    } catch (error) {
      console.error('Sign document error:', error);
    }
  },

  updateDocumentStatus: async (id: string, status: Document['status']) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, status } : doc
        ),
      }));
    } catch (error) {
      console.error('Update document status error:', error);
    }
  },

  deleteDocument: async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      }));
    } catch (error) {
      console.error('Delete document error:', error);
    }
  },
}));
