import React from 'react';
import { Link } from 'react-router-dom';

const Status = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              System Status
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Real-time status of PharmacyMS services and components.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="prose prose-lg prose-indigo mx-auto">
          <h2>Current Status</h2>
          <p>
            All systems are operational. We're constantly monitoring our services to ensure reliability and performance.
          </p>
          
          <h2>Service History</h2>
          <p>
            View the historical uptime and performance of our services over the past 30 days.
          </p>
          
          <h2>Incident Reports</h2>
          <p>
            Access detailed reports of any past incidents and our resolution process.
          </p>
          
          <h2>Subscribe to Updates</h2>
          <p>
            Subscribe to status updates to receive notifications about service maintenance and incidents.
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

export default Status;