import React from 'react';
import { Link } from 'react-router-dom';

const Careers = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Careers
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Join our team and help us transform pharmacy management.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Why Work With Us</h2>
          <p>
            At PharmacyMS, we're passionate about improving pharmacy operations through technology. Join us in our mission to make pharmacy management simpler and more efficient.
          </p>
          
          <h2>Open Positions</h2>
          <p>
            We're always looking for talented individuals to join our team. Check out our current openings.
          </p>
          
          <h2>Benefits</h2>
          <p>
            We offer competitive compensation, comprehensive health benefits, flexible work arrangements, and opportunities for professional growth.
          </p>
          
          <h2>Company Culture</h2>
          <p>
            We foster a collaborative, inclusive environment where everyone's contributions are valued and recognized.
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

export default Careers;