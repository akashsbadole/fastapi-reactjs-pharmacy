import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  const slides = [
    {
      title: "Pharmacy Management Made Simple",
      description: "Complete pharmacy management solution with inventory tracking, point of sale, prescription management, and more. Streamline your pharmacy operations today.",
      ctaText: "Get started",
      ctaLink: "/auth/register",
      secondaryText: "Login",
      secondaryLink: "/auth/login"
    },
    {
      title: "Transform Your Pharmacy Business",
      description: "Increase efficiency with our comprehensive pharmacy management system. Track inventory, manage prescriptions, and grow your business.",
      ctaText: "Start Free Trial",
      ctaLink: "/auth/register",
      secondaryText: "Learn More",
      secondaryLink: "/features"
    },
    {
      title: "Trusted by Pharmacists Nationwide",
      description: "Join hundreds of pharmacies that have transformed their operations with our user-friendly management system.",
      ctaText: "View Demo",
      ctaLink: "/demo",
      secondaryText: "Contact Sales",
      secondaryLink: "/contact"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      if (heroRef.current && scrollPosition > heroRef.current.offsetTop + 100) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div ref={heroRef} className={`relative isolate overflow-hidden bg-gray-900 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="983e3e4c-d6d2-4181-8b06-1a6b1e9c9b8e"
            width={200}
            height={200}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill="url(#983e3e4c-d6d2-4181-8b06-1a6b1e9c9b8e)" />
      </svg>
      <div
        className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:bottom-0"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      
      {/* Slider Content */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-16 lg:px-8 lg:py-40">
        <div className={`mx-auto max-w-2xl lg:mx-0 lg:flex-auto transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20 animate-pulse">
              Version 2.0 is here{' '}
              <a href="#" className="font-semibold text-white">
                <span className="absolute inset-0" aria-hidden="true" />
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          
          {/* Slide Content */}
          <div className="relative overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute inset-0'}`}
              >
                <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  {slide.title}
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                  {slide.description}
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    to={slide.ctaLink}
                    className="group relative rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="relative z-10">{slide.ctaText}</span>
                    <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">{slide.ctaText}</span>
                  </Link>
                  <Link to={slide.secondaryLink} className="text-sm font-semibold leading-6 text-white hover:text-blue-300 transition-colors duration-300">
                    {slide.secondaryText} <span aria-hidden="true" className="transition-transform duration-300 inline-block group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Slider Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className={`mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          <svg
            viewBox="0 0 366 729"
            role="img"
            className="mx-auto w-[22.875rem] max-w-full drop-shadow-xl"
          >
            <title>App screenshot</title>
            <defs>
              <clipPath id="clip-983e3e4c-d6d2-4181-8b06-1a6b1e9c9b8e-a">
                <rect width={366} height={729} rx={36} />
              </clipPath>
            </defs>
            <path
              fill="#4B5563"
              d="M363.315 64.197c0 35.369-28.972 64.197-64.197 64.197-35.369 0-64.197-28.972-64.197-64.197 0-35.369 28.972-64.197 64.197-64.197 35.369 0 64.197 28.972 64.197 64.197Z"
            />
            <path
              fill="#9CA3AF"
              d="M142.321 128.394c0 35.369-28.972 64.197-64.197 64.197-35.369 0-64.197-28.972-64.197-64.197 0-35.369 28.972-64.197 64.197-64.197 35.369 0 64.197 28.972 64.197 64.197Z"
            />
            <path
              fill="#A5B4FC"
              d="M363.315 232.59c0 35.369-28.972 64.197-64.197 64.197-35.369 0-64.197-28.972-64.197-64.197 0-35.369 28.972-64.197 64.197-64.197 35.369 0 64.197 28.972 64.197 64.197Z"
            />
            <path
              fill="#C7D2FE"
              d="M142.321 296.787c0 35.369-28.972 64.197-64.197 64.197-35.369 0-64.197-28.972-64.197-64.197 0-35.369 28.972-64.197 64.197-64.197 35.369 0 64.197 28.972 64.197 64.197Z"
            />
            <path
              fill="#DDD6FE"
              d="M363.315 400.983c0 35.369-28.972 64.197-64.197 64.197-35.369 0-64.197-28.972-64.197-64.197 0-35.369 28.972-64.197 64.197-64.197 35.369 0 64.197 28.972 64.197 64.197Z"
            />
            <path
              fill="#EDE9FE"
              d="M142.321 465.18c0 35.369-28.972 64.197-64.197 64.197-35.369 0-64.197-28.972-64.197-64.197 0-35.369 28.972-64.197 64.197-64.197 35.369 0 64.197 28.972 64.197 64.197Z"
            />
            <path
              fill="#F3E8FF"
              d="M363.315 569.376c0 35.369-28.972 64.197-64.197 64.197-35.369 0-64.197-28.972-64.197-64.197 0-35.369 28.972-64.197 64.197-64.197 35.369 0 64.197 28.972 64.197 64.197Z"
            />
            <path
              fill="#FAF5FF"
              d="M142.321 633.573c0 35.369-28.972 64.197-64.197 64.197-35.369 0-64.197-28.972-64.197-64.197 0-35.369 28.972-64.197 64.197-64.197 35.369 0 64.197 28.972 64.197 64.197Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;