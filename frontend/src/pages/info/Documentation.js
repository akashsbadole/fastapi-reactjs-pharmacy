import React from 'react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Documentation
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Comprehensive guides to help you get the most out of PharmacyMS.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Getting Started</h2>
          <p>
            New to PharmacyMS? Our getting started guide will walk you through the basics of setting up your pharmacy management system.
          </p>
          
          <h2>User Guides</h2>
          <p>
            Detailed guides for all features including inventory management, point of sale, prescription handling, and more.
          </p>
          
          <h2>Video Tutorials</h2>
          <p>
            Watch our video tutorials to learn how to use specific features and workflows in PharmacyMS.
          </p>
          
          <h2>FAQ</h2>
          <p>
            Find answers to commonly asked questions about using PharmacyMS.
          </p>
          
          <h2>Best Practices</h2>
          <p>
            Learn best practices for managing your pharmacy efficiently with our system.
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

export default Documentation;