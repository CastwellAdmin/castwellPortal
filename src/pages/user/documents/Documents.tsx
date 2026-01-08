import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../../../store/documentStore';
import { useAuthStore } from '../../../store/authStore';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import type { Document } from '../../../types';
import { FiFileText, FiDownload } from 'react-icons/fi';

export default function Documents() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { documents, fetchDocuments } = useDocumentStore();

  useEffect(() => {
    if (user) {
      fetchDocuments(user.id);
    }
  }, [user]);

  const getStatusBadge = (status: Document['status']) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-800',
      viewed: 'bg-blue-100 text-blue-800',
      signed: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
      header: 'Status',
      accessor: (row: Document) => getStatusBadge(row.status),
    },
    {
      header: 'Signature',
      accessor: (row: Document) =>
        row.requiresSignature ? (
          row.status === 'signed' ? (
            <span className="text-green-600 text-sm">Signed</span>
          ) : (
            <span className="text-orange-600 text-sm">Required</span>
          )
        ) : (
          <span className="text-gray-400 text-sm">Not required</span>
        ),
    },
    {
      header: 'Actions',
      accessor: () => (
        <button className="text-primary-600 hover:text-primary-700">
          <FiDownload size={18} />
        </button>
      ),
    },
  ];

  const handleRowClick = (doc: Document) => {
    navigate(`/dashboard/documents/${doc.id}`);
  };

  const pendingDocs = documents.filter((d) => d.status === 'pending');
  const signedDocs = documents.filter((d) => d.status === 'signed');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Documents</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Documents</p>
          <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-orange-600">{pendingDocs.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Signed</p>
          <p className="text-2xl font-bold text-green-600">{signedDocs.length}</p>
        </Card>
      </div>

      <Card title="All Documents">
        <Table data={documents} columns={columns} onRowClick={handleRowClick} />
      </Card>
    </div>
  );
}
