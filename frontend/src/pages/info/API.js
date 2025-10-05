import React from 'react';
import { Link } from 'react-router-dom';

const API = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              API Documentation
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Integrate PharmacyMS with your existing systems using our powerful API.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Getting Started</h2>
          <p>
            Our RESTful API allows you to integrate PharmacyMS with your existing systems and build custom applications on top of our platform.
          </p>
          
          <h2>Authentication</h2>
          <p>
            All API requests must be authenticated using an API key. You can generate an API key from your account settings.
          </p>
          
          <h2>Endpoints</h2>
          <p>
            Our API provides endpoints for managing inventory, processing sales, handling prescriptions, and more.
          </p>
          
          <h2>Rate Limits</h2>
          <p>
            API requests are rate limited to ensure fair usage for all customers. Enterprise plans have higher rate limits.
          </p>
          
          <h2>Support</h2>
          <p>
            If you have any questions about using our API, please contact our support team at api@pharmacyms.com.
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

export default API;