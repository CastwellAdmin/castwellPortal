import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLearningStore } from '../../../store/learningStore';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/forms/Button';
import { FiArrowLeft } from 'react-icons/fi';

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, fetchArticles, updateArticle } = useLearningStore();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    tags: '',
    author: '',
    readTime: 5,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    const article = articles.find((a) => a.id === id);
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        category: article.category,
        tags: article.tags.join(', '),
        author: article.author,
        readTime: article.readTime,
      });
    }
  }, [articles, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const tagsArray = formData.tags.split(',').map((tag) => tag.trim());
    updateArticle(id, {
      ...formData,
      tags: tagsArray,
    });
    navigate('/admin/learning');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="outline" onClick={() => navigate('/admin/learning')}>
        <FiArrowLeft className="mr-2" />
        Back to Articles
      </Button>

      <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Slug (URL)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              <option value="">Select a category</option>
              <option value="Markets Basics">Markets Basics</option>
              <option value="Sector Insights">Sector Insights</option>
              <option value="Investment Tips">Investment Tips</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input min-h-[200px]"
              required
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            required
          />

          <Input
            label="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
          />

          <Input
            label="Read Time (minutes)"
            type="number"
            value={formData.readTime}
            onChange={(e) =>
              setFormData({ ...formData, readTime: parseInt(e.target.value) })
            }
            required
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit">Update Article</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/learning')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
