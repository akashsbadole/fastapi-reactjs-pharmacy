import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              About Us
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Learn more about our mission to transform pharmacy management.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-lg text-gray-600 mb-8">
            PharmacyMS was founded with a simple mission: to make pharmacy management easier and more efficient for pharmacists everywhere. We understand the challenges of running a pharmacy, from managing inventory to serving customers, and we're dedicated to providing solutions that make a difference.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8">
            Our mission is to empower pharmacies with technology that simplifies operations, improves patient care, and drives business growth. We believe that every pharmacy, regardless of size, deserves access to tools that help them thrive in today's competitive healthcare landscape.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Our Values</h2>
          <div className="space-y-4 mb-8">
            <div className="border-l-4 border-indigo-600 pl-4">
              <h3 className="text-xl font-semibold text-gray-900">Customer-Centric</h3>
              <p className="text-gray-600">We put our customers at the center of everything we do.</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h3 className="text-xl font-semibold text-gray-900">Innovation</h3>
              <p className="text-gray-600">We constantly innovate to bring the latest technology to pharmacy management.</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h3 className="text-xl font-semibold text-gray-900">Reliability</h3>
              <p className="text-gray-600">Our system is built to be reliable, secure, and always available when you need it.</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h3 className="text-xl font-semibold text-gray-900">Integrity</h3>
              <p className="text-gray-600">We operate with transparency and integrity in all our business dealings.</p>
            </div>
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
    </div>
  );
};

export default About;