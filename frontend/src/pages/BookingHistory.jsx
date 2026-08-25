import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import { History, Calendar, HelpCircle, Eye, AlertCircle } from 'lucide-react';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await bookingService.getBookings();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.response?.data?.message || 'Failed to fetch transaction logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getFilteredBookings = () => {
    if (filterStatus === 'ALL') return bookings;
    if (filterStatus === 'SUCCESS') return bookings.filter(b => b.paymentStatus === 'SUCCESS' && b.bookingStatus === 'CONFIRMED');
    if (filterStatus === 'CANCELLED') return bookings.filter(b => b.bookingStatus === 'CANCELLED');
    if (filterStatus === 'FAILED') return bookings.filter(b => b.paymentStatus === 'FAILED' || b.bookingStatus === 'EXPIRED');
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>;
      case 'PENDING':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-105 bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Expired/Failed</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex-grow space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <History className="h-6 w-6 text-teal-655 text-teal-600" />
          <span>Booking History</span>
        </h2>

        {/* Status Filter buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold bg-gray-100 p-1 rounded">
          {['ALL', 'SUCCESS', 'CANCELLED', 'FAILED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded transition-all ${
                filterStatus === status ? 'bg-white text-gray-850 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center bg-white border border-gray-200 rounded-lg p-12 shadow-sm">
          <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-800 text-lg">No records found</h4>
          <p className="text-sm text-gray-500 mt-1">We couldn't find any transaction matching the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Journey Route</th>
                  <th className="px-6 py-4">Passengers</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-250 divide-gray-100 text-gray-700">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{b.bookingId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {b.sourceStation.stationName} &rarr; {b.destinationStation.stationName}
                    </td>
                    <td className="px-6 py-4 text-center">{b.passengerCount}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">₹{b.totalAmount}</td>
                    <td className="px-6 py-4">{getStatusBadge(b.bookingStatus)}</td>
                    <td className="px-6 py-4 text-center">
                      {b.bookingStatus === 'CONFIRMED' && b.ticket ? (
                        <Link
                          to={`/ticket/${b.ticket._id || b.ticket}`}
                          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-500 font-bold text-xs bg-teal-50 hover:bg-teal-100/60 px-2.5 py-1.5 rounded transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Ticket</span>
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs font-semibold">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
