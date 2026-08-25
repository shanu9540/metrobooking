import React from 'react';
import { Route, User, CreditCard, Ticket } from 'lucide-react';

const BookingProgress = ({ currentStep }) => {
  const steps = [
    { label: 'Select Route', icon: Route, stepNum: 1 },
    { label: 'Passenger Info', icon: User, stepNum: 2 },
    { label: 'Payment', icon: CreditCard, stepNum: 3 },
    { label: 'Get Ticket', icon: Ticket, stepNum: 4 }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-250 bg-gray-200 -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((s) => {
          const Icon = s.icon;
          const isCompleted = currentStep > s.stepNum;
          const isActive = currentStep === s.stepNum;

          return (
            <div key={s.label} className="flex flex-col items-center z-10 relative">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-teal-500 border-teal-500 text-white'
                    : isActive
                    ? 'bg-white border-teal-500 text-teal-600 shadow-sm'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-xs mt-2 font-medium hidden sm:inline whitespace-nowrap ${
                  isActive ? 'text-teal-650 font-bold text-teal-650' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingProgress;
