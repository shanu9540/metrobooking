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

  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showSimulatedGateway, setShowSimulatedGateway] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Trigger simulated payment flow
  const handleMockSimulation = async (status, providerName = 'Mock Sandbox') => {
    setLoading(true);
    setErrorMsg('');

    if (status === 'SUCCESS') {
      try {
        const mockVerifyPayload = {
          bookingId: activeBooking._id,
          razorpay_order_id: activeBooking.orderId,
          razorpay_payment_id: `pay_mock_${providerName.toLowerCase()}_${Date.now()}`,
          razorpay_signature: `sig_mock_${Date.now()}`,
          method: `${providerName} UPI/Checkout`
        };
        const result = await paymentService.verify(mockVerifyPayload);
        if (result.success) {
          navigate('/payment-success', { state: { booking: result.booking, ticket: result.ticket } });
        } else {
          navigate('/payment-failed', { state: { error: 'Simulation verification failed' } });
        }
      } catch (err) {
        console.error('Mock payment error:', err);
        navigate('/payment-failed', { state: { error: err.response?.data?.message || 'Simulation exception' } });
      } finally {
        setLoading(false);
      }
    } else {
      navigate('/payment-failed', { state: { error: `Transaction declined by ${providerName} handler.` } });
    }
  };

  const startRedirect = (provider) => {
    setSelectedProvider(provider);
    setRedirecting(true);
    setTimeout(() => {
      setRedirecting(false);
      setShowSimulatedGateway(true);
    }, 1500);
  };

  if (redirecting) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4 bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-gray-700 font-semibold animate-pulse">Redirecting to {selectedProvider} Payment Gateway...</p>
        <p className="text-xs text-gray-400">Securing environment connection...</p>
      </div>
    );
  }

  if (showSimulatedGateway) {
    // Beautiful mock Paytm / UPI Gateway Screen
    return (
      <div className="min-h-[90vh] bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-sky-600 text-white p-5 flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Secure Gateway</span>
              <h2 className="text-2xl font-black italic tracking-tighter">paytm</h2>
            </div>
            <div className="text-right">
              <span className="text-xs block opacity-75">Amount to Pay</span>
              <span className="text-lg font-extrabold">₹{activeBooking.totalAmount}</span>
            </div>
          </div>

          <div className="p-6 space-y-6 text-center">
            <div>
              <p className="text-xs text-gray-400">Order ID: {activeBooking.bookingId}</p>
              <h3 className="text-sm font-bold text-gray-800 mt-1">Paying to MetroGo Smart Transit Services</h3>
            </div>

            {/* QR Code Placeholder */}
            <div className="mx-auto w-48 h-48 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center shadow-inner relative">
              {/* Inline SVG QR Mock */}
              <svg className="w-40 h-40 text-gray-800" viewBox="0 0 100 100">
                <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="11" y="11" width="13" height="13" fill="currentColor" />
                <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="76" y="11" width="13" height="13" fill="currentColor" />
                <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="11" y="76" width="13" height="13" fill="currentColor" />
                {/* Random QR blocks */}
                <rect x="40" y="10" width="8" height="15" fill="currentColor" />
                <rect x="50" y="30" width="15" height="8" fill="currentColor" />
                <rect x="10" y="45" width="20" height="8" fill="currentColor" />
                <rect x="45" y="45" width="15" height="15" fill="currentColor" />
                <rect x="75" y="45" width="8" height="20" fill="currentColor" />
                <rect x="40" y="75" width="18" height="10" fill="currentColor" />
                <rect x="70" y="70" width="10" height="10" fill="currentColor" />
                <rect x="85" y="85" width="10" height="10" fill="currentColor" />
              </svg>
              <div className="absolute inset-0 bg-white/80 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                <span className="text-[10px] text-gray-500 font-bold">Paytm Sandbox Active</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 leading-normal max-w-xs mx-auto">
              Scan this QR code using your **Paytm App** to complete the transaction, or click the button below to authorize payment instantly.
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleMockSimulation('SUCCESS', selectedProvider)}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>🔒 Pay ₹{activeBooking.totalAmount} Securely</span>
              </button>
              <button
                onClick={() => handleMockSimulation('FAILURE', selectedProvider)}
                disabled={loading}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold text-xs transition-colors"
              >
                Decline Transaction
              </button>
            </div>

            <button
              onClick={() => setShowSimulatedGateway(false)}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold underline block mx-auto"
            >
              Cancel and Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <BookingProgress currentStep={3} />

      <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden mt-6">
        <div className="bg-teal-600 text-white p-6 text-center">
          <h3 className="text-xl font-bold">Secure Checkout</h3>
          <p className="text-xs text-teal-100 mt-1">Transaction ID: {activeBooking.bookingId}</p>
        </div>

        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-xs text-amber-800 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg} (Bypassing to local secure sandbox)</span>
            </div>
          )}

          <div className="border-b border-gray-150 pb-4">
            <span className="text-xs text-gray-500 font-semibold uppercase">Total Amount Due</span>
            <div className="text-3xl font-extrabold text-gray-800 mt-1 flex items-baseline">
              <span className="text-lg">₹</span>
              <span>{activeBooking.totalAmount}</span>
            </div>
          </div>

          {/* Integrated Local Payment Selector (Option B Mock Gateway) */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select Payment Method</div>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setSelectedMethod('UPI'); setSelectedProvider(''); }}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${selectedMethod === 'UPI' ? 'border-teal-600 bg-teal-50 text-teal-850' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                Smartphone UPI
              </button>
              <button
                type="button"
                onClick={() => { setSelectedMethod('CARD'); setSelectedProvider(''); }}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${selectedMethod === 'CARD' ? 'border-teal-600 bg-teal-50 text-teal-850' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                Debit/Credit Card
              </button>
              <button
                type="button"
                onClick={() => { setSelectedMethod('WALLET'); setSelectedProvider(''); }}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${selectedMethod === 'WALLET' ? 'border-teal-600 bg-teal-50 text-teal-850' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                E-Wallet
              </button>
            </div>

            {/* Sub Methods */}
            {selectedMethod === 'UPI' && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-150 animate-fadeIn">
                <button
                  onClick={() => setSelectedProvider('Paytm')}
                  className={`p-2.5 rounded border text-xs font-extrabold tracking-tighter flex flex-col items-center justify-center gap-1 transition-all ${selectedProvider === 'Paytm' ? 'bg-sky-600 border-sky-600 text-white shadow-sm' : 'bg-white border-gray-250 text-sky-700 hover:border-sky-500'}`}
                >
                  <span className="italic">paytm</span>
                </button>
                <button
                  onClick={() => setSelectedProvider('PhonePe')}
                  className={`p-2.5 rounded border text-xs font-black flex flex-col items-center justify-center gap-1 transition-all ${selectedProvider === 'PhonePe' ? 'bg-purple-700 border-purple-750 text-white shadow-sm' : 'bg-white border-gray-250 text-purple-750 hover:border-purple-550'}`}
                >
                  <span>PhonePe</span>
                </button>
                <button
                  onClick={() => setSelectedProvider('GPay')}
                  className={`p-2.5 rounded border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${selectedProvider === 'GPay' ? 'bg-gray-800 border-gray-850 text-white shadow-sm' : 'bg-white border-gray-250 text-gray-700 hover:border-gray-500'}`}
                >
                  <span>GPay</span>
                </button>
              </div>
            )}

            {selectedMethod === 'CARD' && (
              <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-150 space-y-3 animate-fadeIn text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">Card Number</label>
                  <input type="text" placeholder="4111 2222 3333 4444" disabled className="w-full p-2 border border-gray-250 rounded bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">Expiry (MM/YY)</label>
                    <input type="text" placeholder="12/29" disabled className="w-full p-2 border border-gray-250 rounded bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">CVV</label>
                    <input type="password" placeholder="***" disabled className="w-full p-2 border border-gray-250 rounded bg-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startRedirect('Card')}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded text-xs transition-colors"
                >
                  Proceed with Card payment
                </button>
              </div>
            )}

            {selectedMethod === 'WALLET' && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-150 animate-fadeIn">
                <button
                  onClick={() => startRedirect('Paytm Wallet')}
                  className="bg-white hover:bg-sky-50 border border-gray-200 p-3 rounded font-black italic tracking-tighter text-sky-700 text-sm flex items-center justify-center"
                >
                  paytm wallet
                </button>
                <button
                  onClick={() => startRedirect('MobiKwik')}
                  className="bg-white hover:bg-blue-50 border border-gray-200 p-3 rounded font-extrabold text-blue-700 text-sm flex items-center justify-center"
                >
                  MobiKwik
                </button>
              </div>
            )}

            {/* Launch Action */}
            {selectedMethod === 'UPI' && selectedProvider && (
              <button
                onClick={() => startRedirect(selectedProvider)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-all shadow flex items-center justify-center gap-2 animate-bounce"
              >
                <Smartphone className="h-5 w-5" />
                <span>Launch {selectedProvider} Payment Securely</span>
              </button>
            )}

            {!selectedMethod && (
              <div className="bg-teal-50/50 p-4 rounded-md border border-teal-100 text-xs text-teal-850 leading-relaxed flex gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <span>Please select a payment method above. Choose E-Wallet or Smartphone UPI (e.g. Paytm) to open the gateway simulator directly in your browser.</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 border-t border-gray-100 pt-4 text-gray-400 text-xs font-semibold">
            <span className="flex items-center gap-1"><Smartphone className="h-4 w-4" /> UPI</span>
            <span className="flex items-center gap-1"><CreditCard className="h-4 w-4" /> Card</span>
            <span className="flex items-center gap-1"><Wallet className="h-4 w-4" /> Wallet</span>
            <span className="flex items-center gap-1"><Wallet className="h-4 w-4" /> Net Banking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
