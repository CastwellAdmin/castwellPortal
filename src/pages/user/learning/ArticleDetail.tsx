import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLearningStore } from '../../../store/learningStore';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/forms/Button';
import { FiArrowLeft, FiClock, FiTag, FiUser, FiCalendar } from 'react-icons/fi';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getArticleBySlug, fetchArticles } = useLearningStore();

  useEffect(() => {
    fetchArticles();
  }, []);

  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Article not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="outline"
        onClick={() => navigate('/dashboard/learning')}
        className="mb-4"
      >
        <FiArrowLeft className="mr-2" />
        Back to Learning Center
      </Button>

      <Card>
        <div className="space-y-6">
          {/* Category Badge */}
          <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
            {article.category}
          </span>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900">{article.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 pb-6 border-b">
            <div className="flex items-center">
              <FiUser className="mr-2" />
              {article.author}
            </div>
            <div className="flex items-center">
              <FiCalendar className="mr-2" />
              {new Date(article.publishDate).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <FiClock className="mr-2" />
              {article.readTime} min read
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {article.content}
            </p>

            {/* In a real app, this would render markdown or rich text */}
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Key Takeaways</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Understanding market fundamentals is crucial for long-term success</li>
                <li>Diversification helps manage risk across different sectors</li>
                <li>Regular portfolio review ensures alignment with investment goals</li>
                <li>Stay informed about market trends and economic indicators</li>
              </ul>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Next Steps</h2>
              <p className="text-gray-700">
                Continue your learning journey by exploring related articles in the
                {article.category} category.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="pt-6 border-t">
            <div className="flex items-start">
              <FiTag className="mr-2 mt-1 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
