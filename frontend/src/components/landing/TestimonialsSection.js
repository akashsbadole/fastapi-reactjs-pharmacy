import React, { useState, useEffect, useRef } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialsRef = useRef(null);

  const testimonials = [
    {
      name: 'Dr. Rajesh Sharma',
      role: 'Owner, City Pharmacy',
      content: 'This pharmacy management system has transformed our business. Inventory management is now effortless, and we can track everything in real-time.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Manager, MediCare Plus',
      content: 'The POS system is incredibly fast and user-friendly. Our billing time has reduced by 60%, and customers love the quick service.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 5
    },
    {
      name: 'Amit Kumar',
      role: 'Pharmacist, HealthFirst',
      content: 'The prescription management feature has helped us reduce errors significantly. It\'s intuitive and saves us hours of work every day.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 5
    },
    {
      name: 'Sneha Reddy',
      role: 'Director, Wellness Pharmacy',
      content: 'We\'ve tried multiple pharmacy management systems, but this one stands out. The customer support is exceptional, and the features are exactly what we needed.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 5
    },
    {
      name: 'Vikram Singh',
      role: 'Owner, Singh Medical Store',
      content: 'The reports and analytics have given us insights into our business that we never had before. It\'s helped us make better decisions and increase profitability.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 5
    },
    {
      name: 'Anjali Nair',
      role: 'Pharmacist, CureWell Pharmacy',
      content: 'The supplier management feature has streamlined our procurement process. We can now track orders and manage vendors efficiently.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      rating: 5
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      if (testimonialsRef.current && scrollPosition > testimonialsRef.current.offsetTop + 100) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div ref={testimonialsRef} className={`mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`mx-auto max-w-2xl text-center transition-all duration-700 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-blue-600">
          Trusted by pharmacy owners nationwide
        </h2>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          See what our customers have to say about our pharmacy management system.
        </p>
      </div>
      
      {/* Featured Testimonial */}
      <div className={`mt-16 transition-all duration-700 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 p-8 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <img 
              src={testimonials[currentTestimonial].image} 
              alt={testimonials[currentTestimonial].name} 
              className="h-20 w-20 rounded-full border-4 border-white shadow-lg mb-4"
            />
            <div className="flex mb-4">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <StarIcon key={i} className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="text-xl font-medium text-gray-900 mb-6">
              "{testimonials[currentTestimonial].content}"
            </blockquote>
            <cite className="text-base font-semibold text-gray-900 not-italic">
              {testimonials[currentTestimonial].name}
            </cite>
            <p className="text-sm text-gray-600 mt-1">
              {testimonials[currentTestimonial].role}
            </p>
          </div>
          
          {/* Testimonial Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-indigo-600 w-8' : 'bg-indigo-300'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-white/50 text-indigo-600 hover:bg-white transition-all duration-300"
                aria-label="Previous testimonial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-white/50 text-indigo-600 hover:bg-white transition-all duration-300"
                aria-label="Next testimonial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid of Testimonials */}
      <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
        <div className="-mt-8 sm:-mt-16 lg:-mt-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`flex flex-col justify-between rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 p-8 shadow-md hover:shadow-xl transition-all duration-700 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} 
                style={{transitionDelay: `${index * 100 + 700}ms`}}
              >
                <div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                  <img src={testimonial.image} alt="" className="h-12 w-12 rounded-full border-2 border-white shadow-md" />
                  <h3 className="mt-4 text-lg font-semibold leading-8 text-gray-900">{testimonial.name}</h3>
                  <p className="text-base leading-7 text-gray-600">{testimonial.role}</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm leading-6 text-gray-600 italic">"{testimonial.content}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;