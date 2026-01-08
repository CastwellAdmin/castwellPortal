import { create } from 'zustand';
import type { Document } from '../types';

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  fetchDocuments: (userId?: string) => Promise<void>;
  uploadDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => void;
  signDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: Document['status']) => void;
  deleteDocument: (id: string) => void;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Investment Agreement 2025',
    type: 'pdf',
    uploadDate: '2025-01-05',
    size: 1024567,
    status: 'pending',
    requiresSignature: true,
    assignedUsers: ['2'],
    url: '#',
  },
  {
    id: '2',
    title: 'Q4 2024 Performance Report',
    type: 'pdf',
    uploadDate: '2025-01-02',
    size: 2048123,
    status: 'viewed',
    requiresSignature: false,
    assignedUsers: ['2'],
    url: '#',
  },
  {
    id: '3',
    title: 'Tax Document 2024',
    type: 'pdf',
    uploadDate: '2024-12-28',
    size: 512456,
    status: 'signed',
    requiresSignature: true,
    signedDate: '2024-12-30',
    assignedUsers: ['2'],
    url: '#',
  },
];

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isLoading: false,

  fetchDocuments: async (userId?: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));

    let docs = MOCK_DOCUMENTS;
    if (userId) {
      docs = docs.filter((doc) => doc.assignedUsers.includes(userId));
    }

    set({ documents: docs, isLoading: false });
  },

  uploadDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ documents: [...state.documents, newDoc] }));
  },

  signDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              status: 'signed' as const,
              signedDate: new Date().toISOString().split('T')[0],
            }
          : doc
      ),
    }));
  },

  updateDocumentStatus: (id: string, status: Document['status']) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, status } : doc
      ),
    }));
  },

  deleteDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },
}));
