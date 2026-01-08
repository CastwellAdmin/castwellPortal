import { useEffect, useState } from 'react';
import { useDocumentStore } from '../../../store/documentStore';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import { Button } from '../../../components/forms/Button';
import { Modal } from '../../../components/modals/Modal';
import { Input } from '../../../components/forms/Input';
import type { Document } from '../../../types';
import { FiPlus, FiTrash2, FiFileText } from 'react-icons/fi';

export default function DocumentManagement() {
  const { documents, fetchDocuments, uploadDocument, deleteDocument } = useDocumentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'pdf' as 'pdf' | 'docx',
    size: 0,
    requiresSignature: false,
    assignedUsers: [] as string[],
    url: '#',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadDocument({
      ...formData,
      status: 'pending',
    });
    setIsModalOpen(false);
    setFormData({
      title: '',
      type: 'pdf',
      size: 0,
      requiresSignature: false,
      assignedUsers: [],
      url: '#',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(id);
    }
  };

  const columns = [
    {
      header: 'Document',
      accessor: (row: Document) => (
        <div className="flex items-center">
          <FiFileText className="text-gray-400 mr-3" size={20} />
          <div>
            <p className="font-medium text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-500">
              {new Date(row.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (row: Document) => row.type.toUpperCase(),
      className: 'text-gray-600',
    },
    {
      header: 'Size',
      accessor: (row: Document) => `${(row.size / 1024).toFixed(0)} KB`,
      className: 'text-gray-600',
    },
    {
      header: 'Assigned Users',
      accessor: (row: Document) => row.assignedUsers.length,
      className: 'text-gray-600',
    },
    {
      header: 'Signature Required',
      accessor: (row: Document) => (row.requiresSignature ? 'Yes' : 'No'),
      className: 'text-gray-600',
    },
    {
      header: 'Status',
      accessor: (row: Document) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.status === 'signed'
              ? 'bg-green-100 text-green-800'
              : row.status === 'viewed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Document) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.id);
          }}
          className="text-red-600 hover:text-red-700"
        >
          <FiTrash2 size={18} />
        </button>
      ),
    },
  ];

  const pendingDocs = documents.filter((d) => d.status === 'pending').length;
  const signedDocs = documents.filter((d) => d.status === 'signed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Documents</p>
          <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-orange-600">{pendingDocs}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Signed</p>
          <p className="text-3xl font-bold text-green-600">{signedDocs}</p>
        </Card>
      </div>

      <Card title="All Documents">
        <Table data={documents} columns={columns} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Document"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Document Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Investment Agreement 2025"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'pdf' | 'docx' })
              }
              className="input"
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
          </div>

          <Input
            label="File Size (KB)"
            type="number"
            value={formData.size || ''}
            onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
            placeholder="1024"
            required
          />

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requiresSignature}
                onChange={(e) =>
                  setFormData({ ...formData, requiresSignature: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Requires Signature
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Upload</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
