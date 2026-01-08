import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../../../store/documentStore';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/forms/Button';
import { FiArrowLeft, FiDownload, FiCheckCircle, FiFileText } from 'react-icons/fi';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { documents, signDocument, updateDocumentStatus } = useDocumentStore();
  const [showSignConfirm, setShowSignConfirm] = useState(false);

  const document = documents.find((doc) => doc.id === id);

  useEffect(() => {
    if (document && document.status === 'pending') {
      updateDocumentStatus(document.id, 'viewed');
    }
  }, [document]);

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Document not found</p>
      </div>
    );
  }

  const handleSign = () => {
    signDocument(document.id);
    setShowSignConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/documents')}
            className="mr-4"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
            <p className="text-gray-600">
              Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <FiDownload className="mr-2" />
            Download
          </Button>
          {document.requiresSignature && document.status !== 'signed' && (
            <Button onClick={() => setShowSignConfirm(true)}>Sign Document</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">{document.status}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">File Size</p>
          <p className="text-lg font-semibold text-gray-900">
            {(document.size / 1024).toFixed(0)} KB
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Type</p>
          <p className="text-lg font-semibold text-gray-900">{document.type.toUpperCase()}</p>
        </Card>
      </div>

      {document.status === 'signed' && document.signedDate && (
        <Card>
          <div className="flex items-center text-green-600">
            <FiCheckCircle className="mr-2" size={24} />
            <div>
              <p className="font-medium">Document Signed</p>
              <p className="text-sm">
                Signed on {new Date(document.signedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Document Preview">
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <FiFileText size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Document preview would appear here</p>
          <p className="text-sm text-gray-500 mt-2">
            In a production environment, this would display a PDF viewer
          </p>
        </div>
      </Card>

      {showSignConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Document</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to digitally sign this document? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowSignConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSign}>Confirm Signature</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
