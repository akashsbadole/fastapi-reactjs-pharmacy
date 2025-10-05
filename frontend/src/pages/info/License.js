import React from 'react';
import { Link } from 'react-router-dom';

const License = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              License
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              License terms for using PharmacyMS.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Software License Agreement</h2>
          <p>
            This Software License Agreement ("Agreement") is a legal agreement between you and PharmacyMS.
          </p>
          
          <h2>Grant of License</h2>
          <p>
            PharmacyMS grants you a non-exclusive, non-transferable license to use the software in accordance with the terms of this Agreement.
          </p>
          
          <h2>Restrictions</h2>
          <p>
            You may not reverse engineer, decompile, or disassemble the software, except and only to the extent that such activity is expressly permitted by applicable law notwithstanding this limitation.
          </p>
          
          <h2>Termination</h2>
          <p>
            This Agreement is effective until terminated. Your rights under this Agreement will terminate automatically without notice if you fail to comply with any term(s) of this Agreement.
          </p>
          
          <h2>Copyright</h2>
          <p>
            All title, including but not limited to copyrights, in and to the software and any copies thereof are owned by PharmacyMS.
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

export default License;