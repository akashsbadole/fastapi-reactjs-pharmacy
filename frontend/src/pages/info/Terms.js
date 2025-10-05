import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Terms & Conditions
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Please read these terms carefully before using our service.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Introduction</h2>
          <p>
            These terms and conditions govern your use of PharmacyMS and the services provided by us.
          </p>
          
          <h2>Account Registration</h2>
          <p>
            To access certain features of our service, you must register for an account. You agree to provide accurate and complete information.
          </p>
          
          <h2>Acceptable Use</h2>
          <p>
            You agree to use our service only for lawful purposes and in accordance with these terms.
          </p>
          
          <h2>Payment Terms</h2>
          <p>
            Subscription fees are charged in advance on a monthly or annual basis. All fees are non-refundable.
          </p>
          
          <h2>Intellectual Property</h2>
          <p>
            All content and materials available through PharmacyMS are the property of PharmacyMS and are protected by intellectual property laws.
          </p>
          
          <h2>Limitation of Liability</h2>
          <p>
            In no event shall PharmacyMS be liable for any indirect, incidental, special, consequential, or punitive damages.
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

export default Terms;