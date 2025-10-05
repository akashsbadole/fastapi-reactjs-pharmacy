import React from 'react';
import HeroSlider from '../components/landing/HeroSlider';
import FeaturesSection from '../components/landing/FeaturesSection';
import CTASection from '../components/landing/CTASection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Hero section with slider */}
      <HeroSlider />
      
      {/* Features section */}
      <FeaturesSection />
      
      {/* CTA section */}
      <CTASection />
      
      {/* Pricing section */}
      <PricingSection />
      
      {/* Testimonials section */}
      <TestimonialsSection />
      
      {/* CTA section */}
      <CTASection />
    </div>
  );
};

export default Landing;