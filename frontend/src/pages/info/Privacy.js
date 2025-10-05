import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
          </p>
          
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
          </p>
          
          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
          </p>
          
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <h2>Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. You can also opt out of certain communications from us.
          </p>
          
          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
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

export default Privacy;