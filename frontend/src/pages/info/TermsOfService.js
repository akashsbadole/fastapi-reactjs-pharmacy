import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Terms of Service
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
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using PharmacyMS, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials on PharmacyMS for personal, non-commercial transitory viewing only.
          </p>
          
          <h2>3. Disclaimer</h2>
          <p>
            The materials on PharmacyMS are provided on an 'as is' basis. PharmacyMS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2>4. Limitations</h2>
          <p>
            In no event shall PharmacyMS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PharmacyMS, even if PharmacyMS or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h2>5. Privacy Policy</h2>
          <p>
            Your Privacy is important to us. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
          </p>
          
          <h2>6. Revisions and Errata</h2>
          <p>
            The materials appearing on PharmacyMS could include technical, typographical, or photographic errors. PharmacyMS does not warrant that any of the materials on its website are accurate, complete, or current.
          </p>
          
          <h2>7. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of United States and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
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

export default TermsOfService;