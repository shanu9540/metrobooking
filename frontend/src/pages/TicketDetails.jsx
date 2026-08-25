import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../services/api';
import { Calendar, Clock, Printer, ArrowLeft, ShieldAlert, Train, CornerDownRight } from 'lucide-react';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicketDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ticketService.getTicketById(id);
        if (data.success) {
          setTicket(data.ticket);
        }
      } catch (err) {
        console.error('Error fetching ticket details:', err);
        setError(err.response?.data?.message || 'Failed to retrieve ticket records.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        <p className="text-gray-500 font-semibold">Retrieving secure digital ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span className="font-bold">Error loading ticket</span>
          </div>
          <p>{error || 'Ticket details are empty.'}</p>
          <button
            onClick={() => navigate('/my-tickets')}
            className="w-fit mt-2 px-4 py-2 bg-red-600 hover:bg-red-750 text-white font-semibold rounded text-xs transition-colors"
          >
            My Tickets
          </button>
        </div>
      </div>
    );
  }

  const { booking } = ticket;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden print:border-none print:shadow-none">
        
        {/* Banner Header */}
        <div className="bg-gray-900 text-white p-6 text-center print:hidden">
          <h2 className="text-xl font-bold flex justify-center items-center gap-2 text-teal-400">
            <Train className="h-6 w-6 stroke-[2]" />
            <span>Digital Metro Ticket</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Scan QR code at the automated metro gate</p>
        </div>

        {/* Print Layout Header */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-1.5 text-teal-650 font-extrabold text-xl">
            <Train className="h-6 w-6" />
            <span>MetroGo Tickets</span>
          </div>
          <span className="text-sm font-semibold font-mono">Booking ID: {booking.bookingId}</span>
        </div>

        <div className="p-6 space-y-6">
          {/* QR View */}
          <div className="flex flex-col items-center border-b border-gray-100 pb-6 print:border-gray-300">
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm print:shadow-none print:border-gray-300">
              <img
                src={ticket.qrCodeData}
                alt="Metro Ticket QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56"
              />
            </div>
            <span className="text-xs text-gray-500 font-semibold tracking-wider mt-3">TICKET ID: {ticket.ticketId}</span>
            <div className="mt-1 flex gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ticket.isUsed ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {ticket.isUsed ? 'Scanned & Used' : 'Unused & Active'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ticket.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {ticket.isValid ? 'Valid' : 'Cancelled/Invalid'}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
            <div>
              <span className="text-xs text-gray-450 block font-medium">Passenger Name</span>
              <span className="font-bold text-gray-850">{booking.passengerName}</span>
            </div>
            <div>
              <span className="text-xs text-gray-450 block font-medium">Booking ID</span>
              <span className="font-semibold text-gray-850 font-mono">{booking.bookingId}</span>
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

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 print:hidden">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 px-4 border border-gray-300 hover:bg-gray-55 hover:bg-gray-50 text-gray-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
