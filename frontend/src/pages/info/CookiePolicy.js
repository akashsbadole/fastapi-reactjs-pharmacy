import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Cookie Policy
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Learn how we use cookies and similar technologies on our website.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit our website.
          </p>
          
          <h2>How We Use Cookies</h2>
          <p>
            We use cookies to enhance your experience, analyze site traffic, and personalize content.
          </p>
          
          <h2>Types of Cookies We Use</h2>
          <p>
            We use essential cookies for basic site functionality, performance cookies to understand how you use our site, and marketing cookies to provide relevant advertisements.
          </p>
          
          <h2>Managing Your Preferences</h2>
          <p>
            You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
          </p>
          
          <h2>Third-Party Cookies</h2>
          <p>
            Some cookies are placed by third-party services that appear on our pages, such as analytics and advertising partners.
          </p>
          
          <h2>Updates to This Policy</h2>
          <p>
            We may update this cookie policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
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

export default CookiePolicy;