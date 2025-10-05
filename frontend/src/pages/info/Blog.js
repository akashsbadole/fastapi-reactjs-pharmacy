import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Blog
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Stay updated with the latest news, tips, and insights from the pharmacy industry.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Latest Posts</h2>
          <p>
            Our blog features articles on pharmacy management, industry trends, best practices, and product updates.
          </p>
          
          <h2>Categories</h2>
          <p>
            Browse our posts by category including inventory management, customer service, regulatory compliance, and technology.
          </p>
          
          <h2>Guest Contributors</h2>
          <p>
            We feature insights from industry experts, pharmacists, and healthcare professionals.
          </p>
          
          <h2>Subscribe</h2>
          <p>
            Subscribe to our newsletter to get the latest posts delivered directly to your inbox.
          </p>
        </div>
        
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;