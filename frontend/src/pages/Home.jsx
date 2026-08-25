import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { stationService } from '../services/api';
import { MapPin, Navigation, Compass, ShieldAlert, Award, Activity, HeartHandshake } from 'lucide-react';
import { STATIC_STATIONS } from '../utils/localRouting';

const Home = () => {
  const navigate = useNavigate();
  const {
    sourceStation,
    setSourceStation,
    destinationStation,
    setDestinationStation,
    setRouteDetails,
    resetBooking
  } = useBooking();

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search text filters
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Fetch stations on load
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await stationService.getStations();
        if (data.success && data.stations && data.stations.length > 0) {
          setStations(data.stations);
        } else {
          setStations(STATIC_STATIONS);
        }
      } catch (err) {
        console.error('Error fetching stations, loading fallback:', err);
        setStations(STATIC_STATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Filter stations based on queries
  const filteredFromStations = stations.filter(s =>
    s.stationName.toLowerCase().includes(fromQuery.toLowerCase())
  );
  
  const filteredToStations = stations.filter(s =>
    s.stationName.toLowerCase().includes(toQuery.toLowerCase())
  );

  // Geolocation detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Call backend nearby stations endpoint
          const data = await stationService.getNearbyStations(latitude, longitude, 20000); // 20km radius
          if (data.success && data.stations.length > 0) {
            const nearest = data.stations[0];
            setSourceStation(nearest);
            setFromQuery(nearest.stationName);
          } else {
            setErrorMsg('No nearby metro stations detected within 20km.');
          }
        } catch (err) {
          console.error('Error identifying nearby stations:', err);
          setErrorMsg('Unable to detect nearby stations. Please select manually.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setErrorMsg('Location access denied. Please search for a station manually.');
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFindRoute = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sourceStation || !destinationStation) {
      setErrorMsg('Please select both source and destination stations.');
      return;
    }

    if (sourceStation._id === destinationStation._id) {
      setErrorMsg('Source and Destination stations cannot be the same.');
      return;
    }

    // Reset old booking config to prevent leaks
    setRouteDetails(null);
    navigate('/book-ticket');
  };

  return (
    <div className="flex-grow">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-teal-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542640244-7e672d6cef21?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center mix-blend-overlay opacity-25"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Skip the Queues, Ride Smart
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-teal-100 max-w-2xl mx-auto">
            Book your single journey QR tickets in seconds. Explore schedules, routes, and transfer connections effortlessly.
          </p>
        </div>
      </div>

      {/* Main Booking Panel */}
      <div className="max-w-4xl mx-auto -mt-10 px-4 pb-12 relative z-20">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
            <Compass className="h-5.5 w-5.5 text-teal-650 text-teal-650" />
            Quick Ticket Booking
          </h3>

          {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFindRoute} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* FROM Picker */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">From Station</label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating || loading}
                    className="text-xs text-teal-600 hover:text-teal-500 flex items-center gap-1 font-bold disabled:opacity-50"
                  >
                    <MapPin className="h-3 w-3" />
                    {locating ? 'Locating...' : 'Use My Location'}
                  </button>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Navigation className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    value={fromQuery}
                    onChange={(e) => {
                      setFromQuery(e.target.value);
                      setShowFromDropdown(true);
                    }}
                    onFocus={() => setShowFromDropdown(true)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                    placeholder="Search source station..."
                    disabled={loading}
                  />
                </div>

                {/* Dropdown list */}
                {showFromDropdown && filteredFromStations.length > 0 && (
                  <div className="absolute z-30 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base border border-gray-200 overflow-auto focus:outline-none sm:text-sm">
                    {filteredFromStations.map((station) => (
                      <button
                        key={station._id}
                        type="button"
                        onClick={() => {
                          setSourceStation(station);
                          setFromQuery(station.stationName);
                          setShowFromDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-teal-50 font-medium text-gray-800 flex items-center justify-between"
                      >
                        <span>{station.stationName}</span>
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold uppercase">
                          {station.lineName.join('/')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TO Picker */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">To Station</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Navigation className="h-4.5 w-4.5 rotate-90" />
                  </div>
                  <input
                    type="text"
                    value={toQuery}
                    onChange={(e) => {
                      setToQuery(e.target.value);
                      setShowToDropdown(true);
                    }}
                    onFocus={() => setShowToDropdown(true)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium"
                    placeholder="Search destination station..."
                    disabled={loading}
                  />
                </div>

                {/* Dropdown list */}
                {showToDropdown && filteredToStations.length > 0 && (
                  <div className="absolute z-30 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base border border-gray-200 overflow-auto focus:outline-none sm:text-sm">
                    {filteredToStations.map((station) => (
                      <button
                        key={station._id}
                        type="button"
                        onClick={() => {
                          setDestinationStation(station);
                          setToQuery(station.stationName);
                          setShowToDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-teal-50 font-medium text-gray-800 flex items-center justify-between"
                      >
                        <span>{station.stationName}</span>
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold uppercase">
                          {station.lineName.join('/')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Click outside dropdown closer */}
            {(showFromDropdown || showToDropdown) && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  setShowFromDropdown(false);
                  setShowToDropdown(false);
                }}
              />
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-teal-650 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <span>Find Route & Calculate Fare</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feature section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-full mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-gray-800 text-lg mb-1">Fast & Reliable</h4>
            <p className="text-sm text-gray-500">Scan QR codes directly at automatic gates. No ticket vending machine lines.</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-full mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-gray-800 text-lg mb-1">Live Calculations</h4>
            <p className="text-sm text-gray-500">Dijkstra routing engines find short routes, transfer points, and exact fares.</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-full mb-4">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-gray-800 text-lg mb-1">Easy Cancellations</h4>
            <p className="text-sm text-gray-500">Change of plans? Cancel tickets from your dashboard for instantaneous gateway refunds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
