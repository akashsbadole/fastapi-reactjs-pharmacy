import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const KnowledgeBaseArticleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [relatedArticles, setRelatedArticles] = useState([]);

  // Fetch article details
  const { data: article, isLoading, error } = useQuery(
    ['knowledgeBaseArticle', id],
    async () => {
      const response = await api.get(`/api/support/knowledge-base/${id}`);
      return response.data;
    }
  );

  // Fetch related articles by category
  const { data: categoryArticles } = useQuery(
    ['knowledgeBaseByCategory', article?.category],
    async () => {
      if (!article?.category) return [];
      const response = await api.get(`/api/support/knowledge-base?category=${article.category}`);
      return response.data;
    },
    {
      enabled: !!article?.category,
    }
  );

  useEffect(() => {
    if (categoryArticles && article) {
      // Filter out the current article and limit to 3 related articles
      const related = categoryArticles
        .filter(a => a.id !== article.id)
        .slice(0, 3);
      setRelatedArticles(related);
    }
  }, [categoryArticles, article]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const renderContent = (content) => {
    // Simple markdown-like rendering for basic formatting
    let htmlContent = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-4">');
    
    return `<p class="mb-4">${htmlContent}</p>`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/support')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Help & Support
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading article: {error.message}
              </p>
            </div>
          </div>
        </div>
      ) : article ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {article.category}
                    </span>
                    <h1 className="mt-3 text-2xl font-bold text-gray-900">
                      {article.title}
                    </h1>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="flex items-center mr-6">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>By {article.author_name}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-5">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
                />
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="px-6 py-5 border-t border-gray-200">
                  <div className="flex items-center">
                    <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Related Articles</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id} className="px-4 py-4 hover:bg-gray-50">
                      <Link
                        to={`/app/support/knowledge-base/${relatedArticle.id}`}
                        className="block"
                      >
                        <h4 className="text-sm font-medium text-primary-600 hover:text-primary-800">
                          {relatedArticle.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {relatedArticle.content.substring(0, 100)}...
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Need More Help */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Need More Help?</h3>
              </div>
              <div className="px-4 py-5">
                <p className="text-sm text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is ready to help.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/app/support/tickets"
                    className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Create Support Ticket
                  </Link>
                  <button
                    onClick={() => navigate('/app/support')}
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Browse All Articles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Article not found
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseArticleDetails;