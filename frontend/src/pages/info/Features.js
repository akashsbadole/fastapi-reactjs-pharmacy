import React from 'react';
import { Link } from 'react-router-dom';

const Features = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Features
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Everything you need to manage your pharmacy efficiently in one comprehensive solution.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comprehensive Pharmacy Management</h2>
          <p className="text-lg text-gray-600 mb-8">
            Our pharmacy management system includes all the tools you need to run your pharmacy efficiently. From inventory management to billing and customer records, we've got you covered.
          </p>
          
          <div className="space-y-8">
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Inventory Management</h3>
              <p className="text-gray-600">
                Track medicines, manage stock levels, and get alerts for low stock and expiring items. Our inventory management system helps you maintain optimal stock levels and reduce waste.
              </p>
            </div>
            
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Point of Sale (POS)</h3>
              <p className="text-gray-600">
                Fast and efficient billing system with barcode scanning and multiple payment options. Process sales quickly and accurately with our intuitive POS system.
              </p>
            </div>
            
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Prescription Management</h3>
              <p className="text-gray-600">
                Digital prescription handling with validation and tracking capabilities. Store and manage prescriptions digitally while ensuring compliance with regulations.
              </p>
            </div>
            
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Records</h3>
              <p className="text-gray-600">
                Comprehensive patient management with medical history and treatment records. Keep detailed records of your customers' health information securely.
              </p>
            </div>
            
            <div className="border-b pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Supplier Management</h3>
              <p className="text-gray-600">
                Manage suppliers, purchase orders, and track deliveries efficiently. Streamline your procurement process with our supplier management tools.
              </p>
            </div>
            
            <div className="pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reports & Analytics</h3>
              <p className="text-gray-600">
                Detailed reports on sales, inventory, and business performance analytics. Make informed decisions with comprehensive data insights.
              </p>
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

export default Features;