import React, { useState, useEffect } from 'react';
import { adminService, stationService, bookingService, ticketService } from '../services/api';
import { 
  ShieldAlert, LayoutDashboard, MapPin, BadgePercent, ListOrdered, 
  Users, QrCode, DollarSign, Train, CheckCircle2, XCircle, Plus, 
  Trash2, Edit3, Save, RefreshCw, Smartphone, Search, AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  
  // Dashboard Analytics states
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Stations states
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [editingStation, setEditingStation] = useState(null); // Station model instance
  const [showAddStation, setShowAddStation] = useState(false);
  const [newStation, setNewStation] = useState({
    stationId: '', stationName: '', lineName: '', latitude: '', longitude: '', address: ''
  });

  // Fares states
  const [fares, setFares] = useState([
    { minDistance: 0, maxDistance: 2, fare: 10 },
    { minDistance: 2, maxDistance: 5, fare: 20 },
    { minDistance: 5, maxDistance: 12, fare: 30 },
    { minDistance: 12, maxDistance: 21, fare: 40 },
    { minDistance: 21, maxDistance: 32, fare: 50 },
    { minDistance: 32, maxDistance: 9999, fare: 60 }
  ]);
  const [faresSaving, setFaresSaving] = useState(false);

  // Bookings states
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Users states
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Scanner Simulator states
  const [scanQuery, setScanQuery] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);

  const [globalError, setGlobalError] = useState('');

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    setGlobalError('');
    try {
      const res = await adminService.getDashboard();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (e) {
      console.error('Stats error:', e);
      setGlobalError('Failed to retrieve analytics.');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Stations
  const fetchStations = async () => {
    setStationsLoading(true);
    try {
      const res = await stationService.getStations();
      if (res.success) {
        setStations(res.stations);
      }
    } catch (e) {
      console.error('Stations error:', e);
    } finally {
      setStationsLoading(false);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      // Direct call retrieves all bookings for admin
      const res = await bookingService.getBookings();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (e) {
      console.error('Bookings error:', e);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminService.getUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (e) {
      console.error('Users error:', e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'overview') fetchDashboardStats();
    if (activeSection === 'stations') fetchStations();
    if (activeSection === 'bookings') fetchBookings();
    if (activeSection === 'users') fetchUsers();
  }, [activeSection]);

  // Create Station
  const handleAddStationSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.addStation(newStation);
      if (res.success) {
        alert('Station added successfully');
        setShowAddStation(false);
        setNewStation({ stationId: '', stationName: '', lineName: '', latitude: '', longitude: '', address: '' });
        fetchStations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add station');
    }
  };

  // Edit/Update Station
  const handleEditStationSubmit = async (e) => {
    e.preventDefault();
    try {
      const coords = editingStation.location.coordinates;
      const payload = {
        stationName: editingStation.stationName,
        lineName: editingStation.lineName,
        latitude: coords[1],
        longitude: coords[0],
        address: editingStation.address,
        isActive: editingStation.isActive
      };

      const res = await adminService.editStation(editingStation._id, payload);
      if (res.success) {
        alert('Station updated successfully');
        setEditingStation(null);
        fetchStations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update station');
    }
  };

  // Toggle active status
  const handleToggleStationStatus = async (station) => {
    try {
      const coords = station.location.coordinates;
      const payload = {
        stationName: station.stationName,
        isActive: !station.isActive,
        latitude: coords[1],
        longitude: coords[0]
      };
      const res = await adminService.editStation(station._id, payload);
      if (res.success) {
        fetchStations();
      }
    } catch (err) {
      alert('Failed to modify status');
    }
  };

  // Update Fares
  const handleSaveFares = async (e) => {
    e.preventDefault();
    setFaresSaving(true);
    try {
      const res = await adminService.updateFares(fares);
      if (res.success) {
        alert('Fare bracket configurations saved to database!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update fares');
    } finally {
      setFaresSaving(false);
    }
  };

  const handleFareFieldChange = (index, field, value) => {
    const updated = [...fares];
    updated[index][field] = parseFloat(value) || 0;
    setFares(updated);
  };

  // Scanner Simulator validate
  const handleScanValidate = async (e) => {
    e.preventDefault();
    setScanResult(null);
    if (!scanQuery.trim()) return;

    setScanLoading(true);
    try {
      // Validate ticket
      const res = await ticketService.validateTicket(null, scanQuery);
      setScanResult(res);
    } catch (err) {
      console.error(err);
      setScanResult({
        success: false,
        valid: false,
        message: err.response?.data?.message || 'Validation rejected. Invalid QR token format.'
      });
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-[85vh]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-gray-900 text-gray-400 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800 flex items-center gap-2 text-teal-400 font-extrabold text-sm uppercase tracking-wider">
          <ShieldAlert className="h-5 w-5" />
          <span>Management Portal</span>
        </div>

        <nav className="flex-grow p-4 space-y-1 text-sm font-semibold">
          {[
            { id: 'overview', label: 'Analytics Dashboard', icon: LayoutDashboard },
            { id: 'stations', label: 'Stations CRUD', icon: MapPin },
            { id: 'fares', label: 'Fare Configuration', icon: BadgePercent },
            { id: 'bookings', label: 'Bookings & Refunds', icon: ListOrdered },
            { id: 'users', label: 'Commuter Directory', icon: Users },
            { id: 'scanner', label: 'Ticket Gate Scanner', icon: QrCode }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setScanResult(null);
                  setScanQuery('');
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded transition-all ${
                  active ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Administrative viewport */}
      <div className="flex-grow bg-gray-50 p-6 md:p-8 overflow-auto">
        {globalError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-750 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{globalError}</span>
          </div>
        )}

        {/* 1. OVERVIEW SECTION */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-850">Dashboard Metrics</h2>
              <button onClick={fetchDashboardStats} className="p-2 bg-white rounded border hover:bg-gray-55"><RefreshCw className="h-4 w-4" /></button>
            </div>

            {statsLoading ? (
              <div className="py-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div></div>
            ) : stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-teal-55 bg-teal-50 text-teal-600 rounded-lg"><DollarSign className="h-6 w-6" /></div>
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Total Revenue</span>
                    <span className="font-extrabold text-2xl text-gray-800">₹{stats.totalRevenue}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-teal-50 text-teal-650 text-teal-600 rounded-lg"><Users className="h-6 w-6" /></div>
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Total Users</span>
                    <span className="font-extrabold text-2xl text-gray-800">{stats.totalUsers}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-teal-50 text-teal-650 text-teal-600 rounded-lg"><ListOrdered className="h-6 w-6" /></div>
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Total Bookings</span>
                    <span className="font-extrabold text-2xl text-gray-800">{stats.totalBookings}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-teal-50 text-teal-655 text-teal-600 rounded-lg"><Train className="h-6 w-6" /></div>
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Today's Bookings</span>
                    <span className="font-extrabold text-2xl text-gray-800">{stats.todaysBookings}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 2. STATIONS CRUD SECTION */}
        {activeSection === 'stations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-800">Stations Management</h2>
              <button
                onClick={() => setShowAddStation(!showAddStation)}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold text-xs shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Station</span>
              </button>
            </div>

            {/* Add station form */}
            {showAddStation && (
              <form onSubmit={handleAddStationSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-3 font-bold text-sm text-gray-800 border-b pb-2">New Station Fields</div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Station ID (Code)</label>
                  <input
                    type="text" required value={newStation.stationId}
                    onChange={(e) => setNewStation({...newStation, stationId: e.target.value.toUpperCase()})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                    placeholder="e.g. RC"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Station Name</label>
                  <input
                    type="text" required value={newStation.stationName}
                    onChange={(e) => setNewStation({...newStation, stationName: e.target.value})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                    placeholder="e.g. Rajiv Chowk"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Line Name(s) (comma separated)</label>
                  <input
                    type="text" required value={newStation.lineName}
                    onChange={(e) => setNewStation({...newStation, lineName: e.target.value})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                    placeholder="e.g. Yellow, Blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Latitude</label>
                  <input
                    type="number" step="any" required value={newStation.latitude}
                    onChange={(e) => setNewStation({...newStation, latitude: e.target.value})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                    placeholder="e.g. 28.6328"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Longitude</label>
                  <input
                    type="number" step="any" required value={newStation.longitude}
                    onChange={(e) => setNewStation({...newStation, longitude: e.target.value})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                    placeholder="e.g. 77.2197"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Formatted Address</label>
                  <input
                    type="text" value={newStation.address}
                    onChange={(e) => setNewStation({...newStation, address: e.target.value})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                    placeholder="Connaught Place, New Delhi"
                  />
                </div>
                <div className="col-span-3 flex justify-end gap-2 pt-2 border-t mt-2">
                  <button type="button" onClick={() => setShowAddStation(false)} className="px-4 py-1.5 border rounded text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-teal-600 text-white rounded text-xs font-bold shadow-sm">Save Station</button>
                </div>
              </form>
            )}

            {/* Editing Station popup overlay */}
            {editingStation && (
              <form onSubmit={handleEditStationSubmit} className="bg-white p-6 rounded-lg border border-teal-200 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 font-bold text-sm text-teal-800 border-b pb-2 flex justify-between">
                  <span>Edit Station: {editingStation.stationName}</span>
                  <span className="font-mono text-xs text-gray-400">ID: {editingStation.stationId}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Station Name</label>
                  <input
                    type="text" required value={editingStation.stationName}
                    onChange={(e) => setEditingStation({...editingStation, stationName: e.target.value})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Line Name(s) (comma separated)</label>
                  <input
                    type="text" required value={Array.isArray(editingStation.lineName) ? editingStation.lineName.join(', ') : editingStation.lineName}
                    onChange={(e) => setEditingStation({...editingStation, lineName: e.target.value})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Latitude</label>
                  <input
                    type="number" step="any" required value={editingStation.location.coordinates[1]}
                    onChange={(e) => {
                      const updated = {...editingStation};
                      updated.location.coordinates[1] = parseFloat(e.target.value) || 0;
                      setEditingStation(updated);
                    }}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Longitude</label>
                  <input
                    type="number" step="any" required value={editingStation.location.coordinates[0]}
                    onChange={(e) => {
                      const updated = {...editingStation};
                      updated.location.coordinates[0] = parseFloat(e.target.value) || 0;
                      setEditingStation(updated);
                    }}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                  <input
                    type="text" value={editingStation.address}
                    onChange={(e) => setEditingStation({...editingStation, address: e.target.value})}
                    className="block w-full border border-gray-300 rounded p-1.5 text-xs font-semibold"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2 pt-2 border-t mt-2">
                  <button type="button" onClick={() => setEditingStation(null)} className="px-4 py-1.5 border rounded text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-teal-650 bg-teal-600 text-white rounded text-xs font-bold shadow-sm">Update</button>
                </div>
              </form>
            )}

            {/* List Stations */}
            {stationsLoading ? (
              <div className="py-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div></div>
            ) : (
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="px-6 py-3">Code</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Line(s)</th>
                      <th className="px-6 py-3">Coordinates (Lng, Lat)</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {stations.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 font-mono font-bold text-gray-800">{s.stationId}</td>
                        <td className="px-6 py-3 font-semibold">{s.stationName}</td>
                        <td className="px-6 py-3">
                          <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-850 font-bold text-[9px] uppercase">{s.lineName.join(', ')}</span>
                        </td>
                        <td className="px-6 py-3 font-mono text-[10px] text-gray-400">{s.location.coordinates.join(', ')}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {s.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingStation(s)}
                            className="p-1.5 text-teal-650 hover:bg-teal-50 rounded"
                            title="Edit Station"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStationStatus(s)}
                            className={`p-1.5 rounded ${s.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-605 text-green-600 hover:bg-green-50'}`}
                            title={s.isActive ? 'Disable Station' : 'Enable Station'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. FARE CONFIGURATION SECTION */}
        {activeSection === 'fares' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-800">Fare Configuration</h2>
            
            <form onSubmit={handleSaveFares} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-2xl space-y-6">
              <div className="bg-teal-50/50 p-4 rounded text-xs text-teal-800 leading-relaxed border border-teal-100">
                Configure distance brackets (in km) and the ticket price (in INR) charged for each range. Prices must be saved using the button below.
              </div>

              <div className="space-y-3">
                {fares.map((bracket, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center border-b border-gray-50 pb-2">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase mb-0.5">Min Distance (km)</span>
                      <input
                        type="number" step="0.1" required
                        value={bracket.minDistance}
                        onChange={(e) => handleFareFieldChange(index, 'minDistance', e.target.value)}
                        className="block w-full border border-gray-200 rounded p-1.5 text-xs font-semibold font-mono"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase mb-0.5">Max Distance (km)</span>
                      <input
                        type="number" step="0.1" required
                        value={bracket.maxDistance}
                        onChange={(e) => handleFareFieldChange(index, 'maxDistance', e.target.value)}
                        className="block w-full border border-gray-200 rounded p-1.5 text-xs font-semibold font-mono"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase mb-0.5">Ticket Fare (₹)</span>
                      <input
                        type="number" required
                        value={bracket.fare}
                        onChange={(e) => handleFareFieldChange(index, 'fare', e.target.value)}
                        className="block w-full border border-gray-200 rounded p-1.5 text-xs font-semibold font-mono text-teal-650"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={faresSaving}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold text-xs shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{faresSaving ? 'Saving Configurations...' : 'Save Brackets'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. BOOKINGS AUDIT SECTION */}
        {activeSection === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-850">Bookings Ledger</h2>

            {bookingsLoading ? (
              <div className="py-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div></div>
            ) : (
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                      <tr>
                        <th className="px-6 py-3.5">Booking ID</th>
                        <th className="px-6 py-3.5">Commuter Name</th>
                        <th className="px-6 py-3.5">Journey Details</th>
                        <th className="px-6 py-3.5 text-center">Qty</th>
                        <th className="px-6 py-3.5">Fare</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Payment Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-3.5 font-mono text-gray-500">{b.bookingId}</td>
                          <td className="px-6 py-3.5 font-semibold text-gray-800">
                            <div>{b.passengerName}</div>
                            <div className="text-[10px] text-gray-400 font-normal mt-0.5">{b.passengerEmail}</div>
                          </td>
                          <td className="px-6 py-3.5 font-medium">
                            <div>{b.sourceStation?.stationName} &rarr; {b.destinationStation?.stationName}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5 font-normal">Travel: {new Date(b.journeyDate).toLocaleDateString('en-IN')} / {b.journeyTime}</div>
                          </td>
                          <td className="px-6 py-3.5 text-center font-bold text-gray-800">{b.passengerCount}</td>
                          <td className="px-6 py-3.5 font-bold text-gray-800">₹{b.totalAmount}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              b.bookingStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              b.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-105 bg-yellow-100 text-yellow-800'
                            }`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-mono text-[10px] text-gray-400">
                            <div>Pay ID: {b.paymentId || '-'}</div>
                            <div className="text-[9px] mt-0.5">Order: {b.orderId || '-'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. USERS DIRECTORY SECTION */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-gray-850">Commuter Directory</h2>

            {usersLoading ? (
              <div className="py-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div></div>
            ) : (
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="px-6 py-3.5">User Name</th>
                      <th className="px-6 py-3.5">Email address</th>
                      <th className="px-6 py-3.5">Mobile Number</th>
                      <th className="px-6 py-3.5">Registration Date</th>
                      <th className="px-6 py-3.5">System Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3.5 font-semibold text-gray-800">{u.name}</td>
                        <td className="px-6 py-3.5 font-mono text-gray-500">{u.email}</td>
                        <td className="px-6 py-3.5 font-mono text-gray-500">{u.phone}</td>
                        <td className="px-6 py-3.5 whitespace-nowrap">{new Date(u.createdAt).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded font-bold text-[9px] uppercase ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-150 bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. TICKET SCANNER SIMULATOR SECTION */}
        {activeSection === 'scanner' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <h2 className="text-xl font-extrabold text-gray-850 flex items-center gap-2">
              <QrCode className="h-5.5 w-5.5 text-teal-650" />
              <span>Gate Entry Ticket Scanner</span>
            </h2>

            <form onSubmit={handleScanValidate} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <div className="text-xs text-gray-500 leading-relaxed border-b border-gray-50 pb-3 mb-2">
                Simulate scanning an AFC ticket turnstile barcode. Copy and paste the <b>QR payload token string</b> or <b>Ticket ID</b> below.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">QR Payload Data Token / Ticket ID</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Smartphone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text" required value={scanQuery}
                    onChange={(e) => setScanQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-mono"
                    placeholder='{"t":"TKT123456",...} or TKT123456'
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={scanLoading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                  <span>{scanLoading ? 'Checking Ticket...' : 'Process Gate Scan'}</span>
                </button>
              </div>
            </form>

            {/* Validation Display results */}
            {scanResult && (
              <div className={`p-6 rounded-lg border shadow-md text-center space-y-4 transition-all ${
                scanResult.valid ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex justify-center">
                  {scanResult.valid ? <CheckCircle2 className="h-16 w-16 text-green-600" /> : <XCircle className="h-16 w-16 text-red-550 text-red-500" />}
                </div>
                
                <h3 className="text-lg font-extrabold">{scanResult.valid ? 'Access Approved' : 'Access Denied'}</h3>
                <p className="text-xs font-medium leading-relaxed max-w-sm mx-auto">{scanResult.message}</p>

                {scanResult.ticket && (
                  <div className="border-t border-dashed border-gray-300/60 pt-4 text-xs text-left max-w-xs mx-auto space-y-1.5 text-gray-700 font-medium">
                    <div><b>Ticket ID:</b> {scanResult.ticket.ticketId}</div>
                    <div><b>Passenger Name:</b> {scanResult.ticket.booking.passengerName}</div>
                    <div><b>Route:</b> {scanResult.ticket.booking.sourceStation?.stationName} &rarr; {scanResult.ticket.booking.destinationStation?.stationName}</div>
                    <div><b>Passengers Count:</b> {scanResult.ticket.booking.passengerCount}</div>
                    <div><b>Travel Date:</b> {new Date(scanResult.ticket.booking.journeyDate).toLocaleDateString('en-IN')}</div>
                    {scanResult.ticket.usedAt && (
                      <div className="text-amber-850 font-bold text-[11px] text-amber-700"><b>Scanned At:</b> {new Date(scanResult.ticket.usedAt).toLocaleString()}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
