import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  TicketIcon,
  PhoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState('knowledge-base');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch knowledge base articles
  const { data: articles, isLoading: articlesLoading } = useQuery(
    ['knowledgeBase', searchTerm, selectedCategory],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      
      const response = await api.get(`/api/support/knowledge-base?${params.toString()}`);
      return response.data;
    }
  );

  // Fetch support contacts
  const { data: contacts, isLoading: contactsLoading } = useQuery(
    'supportContacts',
    async () => {
      const response = await api.get('/api/support/contacts');
      return response.data;
    }
  );

  // Fetch support resources
  const { data: resources, isLoading: resourcesLoading } = useQuery(
    'supportResources',
    async () => {
      const response = await api.get('/api/support/resources');
      return response.data;
    }
  );

  // Get unique categories from articles
  const categories = articles 
    ? ['All', ...new Set(articles.map(article => article.category))]
    : ['All'];

  const getResourceIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <VideoCameraIcon className="h-6 w-6 text-red-500" />;
      case 'DOCUMENT':
        return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
      case 'LINK':
        return <BookOpenIcon className="h-6 w-6 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-gray-600">Find answers to your questions or get in touch with our support team</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Knowledge Base</h3>
          </div>
          <p className="text-gray-600 mb-4">Browse our articles and guides to find answers to common questions.</p>
          <button 
            onClick={() => setActiveTab('knowledge-base')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            Browse Articles <ArrowRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TicketIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Support Tickets</h3>
          </div>
          <p className="text-gray-600 mb-4">Can't find what you're looking for? Submit a support ticket.</p>
          <Link 
            to="/support/tickets"
            className="text-green-600 hover:text-green-800 font-medium flex items-center"
          >
            Create Ticket <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PhoneIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Contact Us</h3>
          </div>
          <p className="text-gray-600 mb-4">Get in touch with our support team directly for immediate assistance.</p>
          <button 
            onClick={() => setActiveTab('contact')}
            className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
          >
            Contact Support <ArrowRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('knowledge-base')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'knowledge-base'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Training Resources
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contact Support
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge-base' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">Knowledge Base</h2>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {articlesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{article.title}</h3>
                    <p className="text-gray-600 mb-4">{truncateText(article.content)}</p>
                    <Link 
                      to={`/support/knowledge-base/${article.id}`}
                      className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                    >
                      Read more
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Training Resources</h2>
            
            {resourcesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : resources && resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      {getResourceIcon(resource.resource_type)}
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {resource.resource_type}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {resource.category}
                      </span>
                      {resource.url && (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No resources available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for training materials.</p>
              </div>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Support</h2>
            
            {contactsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : contacts && contacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{contact.name}</h3>
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {contact.department}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <PhoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No contact information available</h3>
                <p className="mt-1 text-sm text-gray-500">Please check back later for support contacts.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSupport;