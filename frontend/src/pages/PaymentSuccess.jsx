import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import BookingProgress from '../components/BookingProgress';
import { CheckCircle2, QrCode, Printer, Calendar, ListTodo, Train, CornerDownRight } from 'lucide-react';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetBooking } = useBooking();
  
  // Extract booking/ticket from router state
  const { booking, ticket } = location.state || {};

  useEffect(() => {
    if (!booking || !ticket) {
      navigate('/');
    }
  }, [booking, ticket, navigate]);

  if (!booking || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      {/* Stepper only visible on screen, hidden when printing */}
      <div className="print:hidden">
        <BookingProgress currentStep={4} />
      </div>

      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mt-6 print:border-none print:shadow-none">
        {/* Confirmed Banner (Screen only) */}
        <div className="bg-emerald-600 text-white p-6 text-center print:hidden">
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="h-12 w-12 text-emerald-100 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold">Booking Confirmed!</h2>
          <p className="text-xs text-emerald-100 mt-1">Your payment was processed successfully.</p>
        </div>

        {/* Print Layout Header (Print only) */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-1.5 text-teal-600 font-extrabold text-xl">
            <Train className="h-6 w-6" />
            <span>MetroGo Tickets</span>
          </div>
          <span className="text-sm font-semibold">Booking ID: {booking.bookingId}</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Body: Dashboard Layout */}
          <div className="flex flex-col items-center border-b border-gray-150 border-gray-100 pb-6 print:border-gray-300">
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm print:shadow-none print:border-gray-300">
              {/* Render the Base64 QR Code direct from Mongoose */}
              <img
                src={ticket.qrCodeData}
                alt={`QR Ticket ID: ${ticket.ticketId}`}
                className="w-48 h-48 sm:w-56 sm:h-56"
              />
            </div>
            <span className="text-xs text-gray-500 font-semibold tracking-wider mt-3">TICKET ID: {ticket.ticketId}</span>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
            <div>
              <span className="text-xs text-gray-450 block font-medium">Passenger Name</span>
              <span className="font-bold text-gray-850">{booking.passengerName}</span>
            </div>
            <div>
              <span className="text-xs text-gray-450 block font-medium">Booking ID</span>
              <span className="font-semibold text-gray-850">{booking.bookingId}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-gray-450 block font-medium">Journey Route</span>
              <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                {booking.sourceStation.stationName}
                <CornerDownRight className="h-3.5 w-3.5 text-teal-600 inline" />
                {booking.destinationStation.stationName}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-450 block font-medium">Journey Date</span>
              <span className="font-semibold text-gray-850 flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(booking.journeyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-450 block font-medium">Journey Time</span>
              <span className="font-semibold text-gray-850">{booking.journeyTime}</span>
            </div>
            <div>
              <span className="text-xs text-gray-450 block font-medium">Passengers Count</span>
              <span className="font-bold text-gray-850">{booking.passengerCount} {booking.passengerCount === 1 ? 'Person' : 'People'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-450 block font-medium">Total Price Paid</span>
              <span className="font-extrabold text-teal-600">₹{booking.totalAmount}</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-4 rounded-md text-[11px] text-gray-500 leading-relaxed text-center print:border-gray-300">
            <p className="font-bold mb-1 text-gray-700">TICKET CONDITIONS & INSTRUCTIONS</p>
            Please present this QR code at the automatic entry and exit gates. This ticket is valid for one-way travel only, on the selected date and route. Do not share the QR code image.
          </div>

          {/* Action buttons (Screen only) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Download</span>
            </button>
            <button
              onClick={() => {
                resetBooking();
                navigate('/booking-history');
              }}
              className="flex-1 py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <ListTodo className="h-4 w-4" />
              <span>Booking History</span>
            </button>
          </div>
          
          <div className="text-center print:hidden">
            <button
              onClick={() => {
                resetBooking();
                navigate('/');
              }}
              className="text-xs text-teal-650 hover:underline font-bold"
            >
              Book Another Ticket &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
