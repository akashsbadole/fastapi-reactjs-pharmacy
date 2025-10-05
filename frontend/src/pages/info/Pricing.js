import React from 'react';
import { Link } from 'react-router-dom';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';

const Pricing = () => {
  const pricingPlans = [
    {
      name: 'Basic',
      price: '₹999',
      frequency: '/month',
      description: 'Perfect for small pharmacies',
      features: [
        'Up to 3 users',
        'Basic inventory management',
        'POS functionality',
        'Email support',
        'Basic reports',
      ],
      cta: 'Start Free Trial',
      mostPopular: false,
    },
    {
      name: 'Professional',
      price: '₹1,999',
      frequency: '/month',
      description: 'Ideal for growing pharmacies',
      features: [
        'Up to 10 users',
        'Advanced inventory management',
        'POS with barcode scanning',
        'Priority email & phone support',
        'Advanced reports & analytics',
        'Prescription management',
        'Supplier management',
      ],
      cta: 'Start Free Trial',
      mostPopular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      frequency: '',
      description: 'For large pharmacy chains',
      features: [
        'Unlimited users',
        'Complete feature set',
        'Custom integrations',
        'Dedicated support manager',
        'Custom reports',
        'API access',
        'On-premise deployment option',
      ],
      cta: 'Contact Sales',
      mostPopular: false,
    },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Choose an affordable plan that's packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing Plans</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the right plan for your pharmacy
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            Whether you're a small pharmacy or a large chain, we have a plan that fits your needs.
          </p>
          <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 ${
                  plan.mostPopular ? 'ring-2 ring-indigo-600 shadow-lg' : ''
                }`}
              >
                <div>
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
                  <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">{plan.frequency}</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckBadgeIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  {plan.name === 'Enterprise' ? (
                    <Link
                      to="/contact"
                      className="block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <Link
                      to="/auth/register"
                      className="block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <dl className="mt-16 space-y-8">
            <div>
              <dt className="text-base font-semibold leading-7 text-gray-900">
                Can I change my plan later?
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </dd>
            </div>
            <div>
              <dt className="text-base font-semibold leading-7 text-gray-900">
                Is there a free trial?
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Yes, we offer a 14-day free trial for all new customers. No credit card required.
              </dd>
            </div>
            <div>
              <dt className="text-base font-semibold leading-7 text-gray-900">
                What payment methods do you accept?
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                We accept all major credit cards, debit cards, and online payment methods including Razorpay and PayPal.
              </dd>
            </div>
            <div>
              <dt className="text-base font-semibold leading-7 text-gray-900">
                Is my data secure?
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Absolutely. We use industry-standard encryption and security measures to protect your data. We are also compliant with healthcare data regulations.
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
              Join hundreds of pharmacies that have transformed their operations with our comprehensive management system.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/auth/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start Free Trial
              </Link>
              <Link to="/contact" className="text-sm font-semibold leading-6 text-white">
                Contact Sales <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;