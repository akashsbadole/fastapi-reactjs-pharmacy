import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600">PharmacyMS</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium flex items-center">
                <HomeIcon className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link to="/features" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                Features
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Pricing
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1" />
                Contact
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">PharmacyMS</h3>
              <p className="text-gray-300 mb-4">
                Making pharmacy management simple and efficient for pharmacies of all sizes.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-gray-300 hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
                <li><Link to="/api" className="text-gray-300 hover:text-white">API</Link></li>
                <li><Link to="/documentation" className="text-gray-300 hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white">About</Link></li>
                <li><Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
                <li><Link to="/press" className="text-gray-300 hover:text-white">Press</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2023 PharmacyMS. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;