import React, { useState, useEffect, useRef } from 'react';
import {
  ServerIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  TruckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const featuresRef = useRef(null);

  const features = [
    {
      name: 'Inventory Management',
      description: 'Track medicines, manage stock levels, and get alerts for low stock and expiring items.',
      icon: ServerIcon,
    },
    {
      name: 'Point of Sale (POS)',
      description: 'Fast and efficient billing system with barcode scanning and multiple payment options.',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Prescription Management',
      description: 'Digital prescription handling with validation and tracking capabilities.',
      icon: DocumentTextIcon,
    },
    {
      name: 'Patient Records',
      description: 'Comprehensive patient management with medical history and treatment records.',
      icon: UserGroupIcon,
    },
    {
      name: 'Supplier Management',
      description: 'Manage suppliers, purchase orders, and track deliveries efficiently.',
      icon: TruckIcon,
    },
    {
      name: 'Reports & Analytics',
      description: 'Detailed reports on sales, inventory, and business performance analytics.',
      icon: ChartBarIcon,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      if (featuresRef.current && scrollPosition > featuresRef.current.offsetTop + 100) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={featuresRef} className={`mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className={`mx-auto max-w-2xl text-center transition-all duration-700 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h2 className="text-base font-semibold leading-7 text-indigo-600">Features</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-blue-600">
          Everything you need to manage your pharmacy
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Our comprehensive pharmacy management system includes all the tools you need to run your pharmacy efficiently.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={feature.name} 
              className={`flex flex-col transition-all duration-700 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{transitionDelay: `${index * 100 + 500}ms`}}
            >
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                {feature.name}
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">{feature.description}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default FeaturesSection;