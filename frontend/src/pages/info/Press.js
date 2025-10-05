import React from 'react';
import { Link } from 'react-router-dom';

const Press = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Press
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Latest news, press releases, and media resources.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Latest News</h2>
          <p>
            Stay updated with the latest announcements and developments from PharmacyMS.
          </p>
          
          <h2>Press Releases</h2>
          <p>
            Access our official press releases and company announcements.
          </p>
          
          <h2>Media Kit</h2>
          <p>
            Download our media kit including logos, product images, and company information.
          </p>
          
          <h2>Contact</h2>
          <p>
            For media inquiries, please contact our PR team at press@pharmacyms.com.
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

export default Press;