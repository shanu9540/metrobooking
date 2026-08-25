import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { ShieldAlert, RefreshCw, Home, ArrowLeft } from 'lucide-react';

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetBooking } = useBooking();
  const error = location.state?.error || 'Payment failed or signature validation declined.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center text-red-505 text-red-500 mb-4 animate-pulse">
          <ShieldAlert className="h-16 w-16" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          We encountered an issue while processing your checkout transaction. Any amount deducted will be auto-refunded to your bank account within 3-5 business days.
        </p>

        <div className="bg-red-50 border border-red-100 rounded-md p-4 text-xs text-red-700 text-left font-mono break-all mb-8">
          <b>Error Details:</b> {error}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/payment')}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Payment</span>
          </button>

          <button
            onClick={() => navigate('/passenger-details')}
            className="w-full py-2.5 border border-gray-300 hover:bg-gray-55 hover:bg-gray-50 text-gray-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Passenger Details</span>
          </button>
          
          <button
            onClick={() => {
              resetBooking();
              navigate('/');
            }}
            className="w-full py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
