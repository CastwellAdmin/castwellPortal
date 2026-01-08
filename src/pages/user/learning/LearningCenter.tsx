import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../../../store/learningStore';
import { Card } from '../../../components/Card';
import { FiClock, FiTag } from 'react-icons/fi';

export default function LearningCenter() {
  const navigate = useNavigate();
  const { articles, categories, fetchArticles, fetchCategories } = useLearningStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const filteredArticles =
    selectedCategory === 'all'
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Articles
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.name
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.articleCount})
          </button>
        ))}
      </div>

      {/* Category Description */}
      {selectedCategory !== 'all' && (
        <Card>
          <p className="text-gray-600">
            {categories.find((c) => c.name === selectedCategory)?.description}
          </p>
        </Card>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card
            key={article.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/dashboard/learning/${article.slug}`)}
          >
            <div className="space-y-3">
              <div className="flex items-center text-xs text-gray-500">
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                  {article.category}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {article.title}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-3">{article.content}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                <div className="flex items-center">
                  <FiClock className="mr-1" />
                  {article.readTime} min read
                </div>
                <div className="flex items-center">
                  <FiTag className="mr-1" />
                  {article.tags.length} tags
                </div>
              </div>

              <div className="text-xs text-gray-500">
                By {article.author} •{' '}
                {new Date(article.publishDate).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No articles found in this category
          </p>
        </Card>
      )}
    </div>
  );
}
