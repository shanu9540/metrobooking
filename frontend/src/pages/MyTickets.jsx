import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import { Ticket, Calendar, Clock, MapPin, CornerDownRight, QrCode, AlertCircle, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';

const MyTickets = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingService.getBookings();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCancelTicket = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this ticket? You will receive a full refund.')) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await bookingService.cancel(id);
      if (res.success) {
        alert(res.message);
        // Refresh list
        await fetchTickets();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      alert(err.response?.data?.message || 'Failed to cancel ticket');
    } finally {
      setCancellingId(null);
    }
  };

  // Helper filters
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTickets = bookings.filter(b => {
    const journeyDate = new Date(b.journeyDate);
    journeyDate.setHours(0, 0, 0, 0);
    return b.bookingStatus === 'CONFIRMED' && journeyDate >= today;
  });

  const pastTickets = bookings.filter(b => {
    const journeyDate = new Date(b.journeyDate);
    journeyDate.setHours(0, 0, 0, 0);
    return b.bookingStatus === 'CONFIRMED' && journeyDate < today;
  });

  const cancelledTickets = bookings.filter(b => b.bookingStatus === 'CANCELLED');

  const renderTicketCard = (b) => {
    const isUpcoming = b.bookingStatus === 'CONFIRMED' && new Date(b.journeyDate).setHours(0, 0, 0, 0) >= today.getTime();
    
    return (
      <div key={b._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Ticket Left section: Info */}
        <div className="flex-1 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-teal-55 bg-teal-50 text-teal-850 flex items-center gap-1 font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              {b.bookingStatus}
            </span>
            <span className="text-xs text-gray-500 font-medium">ID: {b.bookingId}</span>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
              {b.sourceStation.stationName}
              <CornerDownRight className="h-4 w-4 text-teal-600 shrink-0" />
              {b.destinationStation.stationName}
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(b.journeyDate).toLocaleDateString('en-IN')}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.journeyTime}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-gray-500">
            <span>{b.passengerCount} {b.passengerCount === 1 ? 'Passenger' : 'Passengers'}</span>
            <span className="text-sm font-bold text-gray-800">Total: ₹{b.totalAmount}</span>
          </div>

          {/* Cancel button under conditions */}
          {isUpcoming && (
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => handleCancelTicket(b._id)}
                disabled={cancellingId === b._id}
                className="px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold rounded transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{cancellingId === b._id ? 'Cancelling...' : 'Cancel Ticket'}</span>
              </button>
              <Link
                to={`/ticket/${b.ticket?._id || b._id}`}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded transition-colors"
              >
                View / Print Ticket
              </Link>
            </div>
          )}
        </div>

        {/* Ticket Right section: QR preview (only for confirmed) */}
        {b.bookingStatus === 'CONFIRMED' && b.ticket && (
          <div className="bg-gray-50 border-t md:border-t-0 md:border-l border-gray-150 p-6 flex flex-col items-center justify-center min-w-[200px]">
            <img
              src={b.ticket.qrCodeData}
              alt="QR Ticket Code"
              className="w-28 h-28 border border-gray-200 rounded p-1 bg-white"
            />
            <span className="text-[10px] text-gray-400 font-bold tracking-wider mt-2">SECURE METRO QR</span>
          </div>
        )}
      </div>
    );
  };

  const getActiveList = () => {
    if (activeTab === 'upcoming') return upcomingTickets;
    if (activeTab === 'past') return pastTickets;
    return cancelledTickets;
  };

  const activeList = getActiveList();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex-grow space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
        <Ticket className="h-6 w-6 text-teal-600" />
        <span>My Tickets</span>
      </h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'upcoming' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming ({upcomingTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'past' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Past ({pastTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'cancelled' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cancelled ({cancelledTickets.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-750 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        </div>
      ) : activeList.length === 0 ? (
        <div className="text-center bg-white border border-gray-200 rounded-lg p-12 shadow-sm">
          <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-800 text-lg">No tickets found</h4>
          <p className="text-sm text-gray-500 mt-1">You do not have any tickets in this category.</p>
          {activeTab === 'upcoming' && (
            <Link
              to="/"
              className="mt-4 inline-block bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm px-4 py-2 rounded transition-colors shadow"
            >
              Book ticket now
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map(renderTicketCard)}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
