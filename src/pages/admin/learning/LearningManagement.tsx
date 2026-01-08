import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../../../store/learningStore';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import { Button } from '../../../components/forms/Button';
import type { Article } from '../../../types';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function LearningManagement() {
  const navigate = useNavigate();
  const { articles, categories, fetchArticles, fetchCategories, deleteArticle } =
    useLearningStore();

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      deleteArticle(id);
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof Article,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Category',
      accessor: (row: Article) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Author',
      accessor: 'author' as keyof Article,
      className: 'text-gray-600',
    },
    {
      header: 'Published',
      accessor: (row: Article) => new Date(row.publishDate).toLocaleDateString(),
      className: 'text-gray-600',
    },
    {
      header: 'Read Time',
      accessor: (row: Article) => `${row.readTime} min`,
      className: 'text-gray-600',
    },
    {
      header: 'Tags',
      accessor: (row: Article) => row.tags.length,
      className: 'text-gray-600',
    },
    {
      header: 'Actions',
      accessor: (row: Article) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/learning/edit/${row.id}`);
            }}
            className="text-primary-600 hover:text-primary-700"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Learning Center Management</h1>
        <Button onClick={() => navigate('/admin/learning/create')}>
          <FiPlus className="mr-2" />
          Create Article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Articles</p>
          <p className="text-3xl font-bold text-gray-900">{articles.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Categories</p>
          <p className="text-3xl font-bold text-primary-600">{categories.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">This Month</p>
          <p className="text-3xl font-bold text-green-600">
            {
              articles.filter((a) => {
                const date = new Date(a.publishDate);
                const now = new Date();
                return (
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Avg Read Time</p>
          <p className="text-3xl font-bold text-gray-900">
            {articles.length > 0
              ? (
                  articles.reduce((sum, a) => sum + a.readTime, 0) / articles.length
                ).toFixed(0)
              : 0}{' '}
            min
          </p>
        </Card>
      </div>

      <Card title="All Articles">
        <Table data={articles} columns={columns} />
      </Card>
    </div>
  );
}
