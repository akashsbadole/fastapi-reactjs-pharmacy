import React from 'react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Help Center
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Find answers to your questions and get the support you need.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Frequently Asked Questions</h2>
          <p>
            Find answers to commonly asked questions about using PharmacyMS.
          </p>
          
          <h2>Getting Started</h2>
          <p>
            New to PharmacyMS? Our getting started guide will help you set up your account and start using our system.
          </p>
          
          <h2>Troubleshooting</h2>
          <p>
            Having issues? Our troubleshooting guide can help you resolve common problems.
          </p>
          
          <h2>Contact Support</h2>
          <p>
            Can't find what you're looking for? Our support team is here to help. Contact us at support@pharmacyms.com.
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

export default HelpCenter;