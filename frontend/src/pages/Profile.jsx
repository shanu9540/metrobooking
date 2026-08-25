import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/api';
import { User, Phone, Mail, Lock, ShieldCheck, Milestone, Compass, AlertCircle, Award } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  
  // Form fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const data = await bookingService.getBookings();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (e) {
        console.error('Error loading profile stats:', e);
      }
    };
    fetchUserStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, phone };
      if (password) {
        payload.password = password;
      }

      await updateProfile(payload);
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const completedTrips = bookings.filter(b => b.bookingStatus === 'CONFIRMED');
  const totalTripsCount = completedTrips.length;
  
  const totalDistance = completedTrips.reduce((acc, curr) => acc + (curr.distance || 0), 0);
  const carbonSaved = (totalDistance * 0.15).toFixed(1); // 150g CO2 saved per km compared to car

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Profile update form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-1.5">
            <User className="h-5.5 w-5.5 text-teal-605 text-teal-650" />
            Account Information
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded text-xs text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email ID</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-6 pt-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Change Password (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">New Password</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Confirm New Password</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-450">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Stat metrics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-teal-400 mb-4 flex items-center gap-1">
              <Award className="h-5 w-5" />
              <span>Eco Dashboard</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 p-3 rounded">
                <Compass className="h-5 w-5 mx-auto mb-1 text-teal-300" />
                <span className="block font-extrabold text-lg leading-tight">{totalTripsCount}</span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Trips</span>
              </div>

              <div className="bg-white/10 p-3 rounded">
                <Milestone className="h-5 w-5 mx-auto mb-1 text-teal-300" />
                <span className="block font-extrabold text-lg leading-tight">{totalDistance.toFixed(1)} <span className="text-[10px] font-normal">km</span></span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Distance</span>
              </div>

              <div className="bg-white/10 p-3 rounded">
                <Award className="h-5 w-5 mx-auto mb-1 text-teal-300" />
                <span className="block font-extrabold text-lg leading-tight">{carbonSaved} <span className="text-[10px] font-normal">kg</span></span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">CO₂ Saved</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-md text-xs leading-relaxed text-gray-300 mt-6">
              🚇 Riding the metro is one of the most effective ways to lower your carbon footprint. By traveling <b>{totalDistance.toFixed(1)} km</b>, you prevented approximately <b>{carbonSaved} kg</b> of greenhouse gas emissions compared to driving a private petrol car. Keep riding smart!
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;
