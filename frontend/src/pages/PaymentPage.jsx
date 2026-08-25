import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { paymentService } from '../services/api';
import BookingProgress from '../components/BookingProgress';
import { CreditCard, Wallet, Smartphone, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { activeBooking, resetBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMockCheckout, setIsMockCheckout] = useState(false);

  useEffect(() => {
    if (!activeBooking) {
      navigate('/');
      return;
    }
    
    const rzpKeyId = localStorage.getItem('rzpKeyId');
    if (rzpKeyId === 'mock') {
      setIsMockCheckout(true);
    }
  }, [activeBooking, navigate]);

  if (!activeBooking) return null;

  // Load Razorpay JS SDK Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setErrorMsg('');
    setLoading(true);

    const rzpKeyId = localStorage.getItem('rzpKeyId');

    if (isMockCheckout) {
      // Mock Sandbox Checkout handled via local UI selectors
      setLoading(false);
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setLoading(false);
        setErrorMsg('Failed to load Razorpay payment SDK. Check your internet connection.');
        return;
      }

      const options = {
        key: rzpKeyId,
        amount: Math.round(activeBooking.totalAmount * 100), // in paise
        currency: 'INR',
        name: 'MetroGo Transit',
        description: 'Single Journey Metro Ticket',
        order_id: activeBooking.orderId,
        handler: async function (response) {
          setLoading(true);
          try {
            const verifyPayload = {
              bookingId: activeBooking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              method: 'Gateway (Razorpay)'
            };
            const result = await paymentService.verify(verifyPayload);
            if (result.success) {
              navigate('/payment-success', { state: { booking: result.booking, ticket: result.ticket } });
            } else {
              navigate('/payment-failed', { state: { error: 'Verification failed' } });
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            navigate('/payment-failed', { state: { error: verifyErr.response?.data?.message || 'Signature check failed' } });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: activeBooking.passengerName,
          email: activeBooking.passengerEmail,
          contact: activeBooking.passengerPhone
        },
        theme: {
          color: '#0D9488'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (e) {
      console.error('Payment checkout exception:', e);
      setErrorMsg('An error occurred while launching payment gateway.');
      setLoading(false);
    }
  };

  // Simulated Payment handlers (Mock sandbox)
  const handleMockSimulation = async (status) => {
    setLoading(true);
    setErrorMsg('');

    if (status === 'SUCCESS') {
      try {
        const mockVerifyPayload = {
          bookingId: activeBooking._id,
          razorpay_order_id: activeBooking.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: `sig_mock_${Date.now()}`,
          method: 'Mock Sandbox UPI'
        };
        const result = await paymentService.verify(mockVerifyPayload);
        if (result.success) {
          navigate('/payment-success', { state: { booking: result.booking, ticket: result.ticket } });
        } else {
          navigate('/payment-failed', { state: { error: 'Simulation verify failed' } });
        }
      } catch (err) {
        console.error('Mock payment error:', err);
        navigate('/payment-failed', { state: { error: err.response?.data?.message || 'Simulation exception' } });
      } finally {
        setLoading(false);
      }
    } else {
      // Simulate failure state
      navigate('/payment-failed', { state: { error: 'Payment was declined by simulation handler.' } });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <BookingProgress currentStep={3} />

      <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden mt-6">
        <div className="bg-teal-600 text-white p-6 text-center">
          <h3 className="text-xl font-bold">Secure Checkout</h3>
          <p className="text-xs text-teal-100 mt-1">Transaction ID: {activeBooking.bookingId}</p>
        </div>

        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="border-b border-gray-100 pb-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Total Amount Due</span>
            <div className="text-3xl font-extrabold text-gray-800 mt-1 flex items-baseline">
              <span className="text-lg">₹</span>
              <span>{activeBooking.totalAmount}</span>
            </div>
          </div>

          {!isMockCheckout ? (
            // Real Payment Checkout Prompt
            <div className="space-y-4">
              <div className="bg-teal-50/50 p-4 rounded-md border border-teal-100 text-xs text-teal-850 leading-relaxed flex gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <span>By clicking the pay button, you will open the official payment interface. Test mode supports simulated payments via Cards, UPI, Netbanking.</span>
              </div>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold transition-colors shadow flex items-center justify-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>{loading ? 'Opening Gateway...' : 'Launch Payment Checkout'}</span>
              </button>
            </div>
          ) : (
            // Mock sandbox payment simulator
            <div className="space-y-5">
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <h4 className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  Developer Sandbox Active
                </h4>
                No Razorpay credentials detected in `.env`. Choose a payment scenario below to simulate verification and ticket generation flows.
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleMockSimulation('SUCCESS')}
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span>Simulate Payment SUCCESS</span>
                </button>
                <button
                  onClick={() => handleMockSimulation('FAILURE')}
                  disabled={loading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="h-5 w-5" />
                  <span>Simulate Payment FAILURE</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 border-t border-gray-100 pt-4 text-gray-400 text-xs font-semibold">
            <span className="flex items-center gap-1"><Smartphone className="h-4 w-4" /> UPI</span>
            <span className="flex items-center gap-1"><CreditCard className="h-4 w-4" /> Card</span>
            <span className="flex items-center gap-1"><Wallet className="h-4 w-4" /> Net Banking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
