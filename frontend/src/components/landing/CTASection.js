import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ctaRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      if (ctaRef.current && scrollPosition > ctaRef.current.offsetTop + 100) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={ctaRef} className={`bg-gradient-to-br from-indigo-600 to-blue-700 py-24 sm:py-32 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mx-auto max-w-2xl text-center transition-all duration-700 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your pharmacy?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
            Join hundreds of pharmacies that have streamlined their operations with our comprehensive management system.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/auth/register"
              className="group relative rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10">Start Free Trial</span>
              <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Start Free Trial</span>
            </Link>
            <Link to="/contact" className="text-sm font-semibold leading-6 text-white hover:text-indigo-200 transition-colors duration-300">
              Contact Sales <span aria-hidden="true" className="transition-transform duration-300 inline-block group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className={`mt-12 flex items-center justify-center space-x-8 transition-all duration-700 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center">
              <ArrowPathIcon className="h-5 w-5 text-indigo-200" aria-hidden="true" />
              <span className="ml-2 text-sm text-indigo-200">No credit card required</span>
            </div>
            <div className="flex items-center">
              <ArrowPathIcon className="h-5 w-5 text-indigo-200" aria-hidden="true" />
              <span className="ml-2 text-sm text-indigo-200">14-day free trial</span>
            </div>
            <div className="flex items-center">
              <ArrowPathIcon className="h-5 w-5 text-indigo-200" aria-hidden="true" />
              <span className="ml-2 text-sm text-indigo-200">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;