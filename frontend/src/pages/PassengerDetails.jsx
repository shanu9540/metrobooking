import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import BookingProgress from '../components/BookingProgress';
import { User, Mail, Phone, Calendar, Clock, ArrowLeft, CreditCard, ShieldAlert } from 'lucide-react';

const PassengerDetails = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    sourceStation,
    destinationStation,
    routeDetails,
    passengerDetails,
    setPassengerDetails,
    setActiveBooking
  } = useBooking();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Protect route manually: if no route exists, boot to home
  useEffect(() => {
    if (!sourceStation || !destinationStation || !routeDetails) {
      navigate('/');
    }
  }, [sourceStation, destinationStation, routeDetails, navigate]);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setPassengerDetails(prev => ({
        ...prev,
        passengerName: prev.passengerName || user.name,
        passengerEmail: prev.passengerEmail || user.email,
        passengerPhone: prev.passengerPhone || user.phone
      }));
    }
  }, [isAuthenticated, user, setPassengerDetails]);

  if (!routeDetails) return null;

  const { fare } = routeDetails;
  const totalFare = fare * passengerDetails.passengerCount;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassengerDetails(prev => ({
      ...prev,
      [name]: name === 'passengerCount' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // If not authenticated, force login first, preserving context
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/passenger-details' } } });
      return;
    }

    const { passengerName, passengerEmail, passengerPhone, passengerCount, journeyDate, journeyTime } = passengerDetails;

    // Client-side validations
    if (!passengerName.trim()) return setErrorMsg('Passenger name is required');
    if (!passengerEmail.trim() || !/\S+@\S+\.\S+/.test(passengerEmail)) return setErrorMsg('Please enter a valid email address');
    if (!passengerPhone.trim() || passengerPhone.length < 10) return setErrorMsg('Please enter a valid 10-digit mobile number');
    if (passengerCount < 1 || passengerCount > 10) return setErrorMsg('You can book tickets for 1 to 10 passengers only.');
    if (!journeyDate) return setErrorMsg('Please select a journey date');
    if (!journeyTime) return setErrorMsg('Please select a travel time');

    setLoading(true);
    try {
      const payload = {
        sourceStationId: sourceStation._id,
        destinationStationId: destinationStation._id,
        passengerName,
        passengerEmail,
        passengerPhone,
        journeyDate,
        journeyTime,
        passengerCount
      };

      const response = await bookingService.create(payload);
      if (response.success) {
        setActiveBooking(response.booking);
        // Save Razorpay keys configuration globally if needed
        localStorage.setItem('rzpKeyId', response.razorpayKeyId);
        navigate('/payment');
      } else {
        setErrorMsg(response.message || 'Failed to create booking order');
      }
    } catch (err) {
      console.error('Booking creation error:', err);
      setErrorMsg(err.response?.data?.message || 'Error processing request with payment gateway');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <BookingProgress currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 max-w-5xl mx-auto">
        {/* Left pane: Passenger information form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-1.5">
              <User className="h-5 w-5 text-teal-650" />
              Contact & Passenger Info
            </h2>

            {errorMsg && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Passenger Name</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    name="passengerName"
                    required
                    value={passengerDetails.passengerName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email ID</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="email"
                      name="passengerEmail"
                      required
                      value={passengerDetails.passengerEmail}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="tel"
                      name="passengerPhone"
                      required
                      value={passengerDetails.passengerPhone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Travel Date</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="date"
                      name="journeyDate"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={passengerDetails.journeyDate}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Journey Time</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="time"
                      name="journeyTime"
                      required
                      value={passengerDetails.journeyTime}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Passengers Count</label>
                  <select
                    name="passengerCount"
                    value={passengerDetails.passengerCount}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                  >
                    {[...Array(10).keys()].map(i => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/book-ticket')}
                  className="flex-1 py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Route Map</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2.5 px-4 bg-teal-650 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isAuthenticated ? 'Proceed to Payment' : 'Login & Book Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right pane: Invoice breakdown box */}
        <div className="lg:col-span-5">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md border border-gray-800 sticky top-24">
            <h3 className="text-lg font-bold border-b border-gray-800 pb-3 mb-4 text-teal-400">Booking Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Journey</span>
                <span className="font-semibold text-right max-w-[200px] truncate">{sourceStation.stationName} &rarr; {destinationStation.stationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Distance</span>
                <span className="font-semibold">{routeDetails.route.distance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Journey Date</span>
                <span className="font-semibold">{passengerDetails.journeyDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Travel Time</span>
                <span className="font-semibold">{passengerDetails.journeyTime}</span>
              </div>
            </div>

            <div className="border-t border-gray-800 my-4 pt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Base ticket fare (x1)</span>
                <span className="font-semibold">₹{fare}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">No. of Passengers</span>
                <span className="font-semibold">x {passengerDetails.passengerCount}</span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-800 my-4 pt-4 flex justify-between items-center text-teal-300">
              <span className="font-bold text-base">Total Amount Payable</span>
              <span className="text-2xl font-extrabold">₹{totalFare}</span>
            </div>

            <div className="text-[10px] text-gray-500 text-center leading-relaxed mt-6">
              Prices are inclusive of standard municipal transit cess. Tickets are valid for 180 minutes after QR code activation at the entry turnstile.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
