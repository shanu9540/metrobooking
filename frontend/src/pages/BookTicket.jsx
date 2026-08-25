import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { fareService } from '../services/api';
import BookingProgress from '../components/BookingProgress';
import MapContainer from '../components/MapContainer';
import { calculateLocalRoute } from '../utils/localRouting';
import { Clock, Navigation, AlertCircle, ArrowRight, ArrowLeft, Landmark, Milestone } from 'lucide-react';

const BookTicket = () => {
  const navigate = useNavigate();
  const {
    sourceStation,
    destinationStation,
    routeDetails,
    setRouteDetails,
    resetBooking
  } = useBooking();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sourceStation || !destinationStation) {
      navigate('/');
      return;
    }

    const calculateRoute = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fareService.calculate(sourceStation._id, destinationStation._id);
        if (data.success && data.path && data.path.length > 0) {
          setRouteDetails(data);
        } else {
          console.warn('Backend routing failed, executing local fallback...');
          const localData = calculateLocalRoute(sourceStation._id, destinationStation._id);
          if (localData.success) {
            setRouteDetails(localData);
          } else {
            setError(localData.message || 'Route calculation failed');
          }
        }
      } catch (err) {
        console.warn('Backend routing connection error, executing local fallback...', err);
        const localData = calculateLocalRoute(sourceStation._id, destinationStation._id);
        if (localData.success) {
          setRouteDetails(localData);
        } else {
          setError('Error communicating with routing engine and local fallback failed.');
        }
      } finally {
        setLoading(false);
      }
    };

    calculateRoute();
  }, [sourceStation, destinationStation, navigate, setRouteDetails]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        <p className="text-gray-500 font-medium animate-pulse">Running Dijkstra routing algorithms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-bold">Error finding route</span>
          </div>
          <p>{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-fit mt-2 px-4 py-2 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-xs transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { route, fare } = routeDetails;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <BookingProgress currentStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left pane: Route information summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-1.5">
              <Milestone className="h-5 w-5 text-teal-600" />
              Route Details
            </h2>

            {/* Path flow representation */}
            <div className="relative pl-6 border-l-2 border-dashed border-teal-500 space-y-8 py-2">
              <div className="relative">
                <div className="absolute -left-8.5 -left-[35px] top-1 h-4 w-4 rounded-full bg-teal-500 border-2 border-white ring-2 ring-teal-100 flex items-center justify-center"></div>
                <h4 className="font-bold text-gray-900 text-sm leading-tight">{sourceStation.stationName}</h4>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">{sourceStation.lineName.join('/')} Line</p>
              </div>

              {route.interchanges && route.interchanges.length > 0 && (
                <div className="relative text-xs bg-amber-50 text-amber-800 border border-amber-250 p-2.5 rounded-md">
                  <div className="absolute -left-9 -left-[37px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">⇄</div>
                  <h5 className="font-bold">Interchange Station</h5>
                  <p className="text-[11px] opacity-90">
                    Transfer at <b>{route.interchanges[0].station.stationName}</b> from <b>{route.interchanges[0].fromLine}</b> to <b>{route.interchanges[0].toLine} Line</b>.
                  </p>
                </div>
              )}

              <div className="relative">
                <div className="absolute -left-8.5 -left-[35px] top-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-100 flex items-center justify-center"></div>
                <h4 className="font-bold text-gray-900 text-sm leading-tight">{destinationStation.stationName}</h4>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">{destinationStation.lineName.join('/')} Line</p>
              </div>
            </div>

            {/* Metrics list */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-150 border-gray-100 mt-6 pt-6 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-xs text-gray-450 block mb-0.5">Distance</span>
                <span className="font-bold text-gray-800">{route.distance} km</span>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-xs text-gray-450 block mb-0.5">Est. Time</span>
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                  {route.duration} mins
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-xs text-gray-450 block mb-0.5">Total Stations</span>
                <span className="font-bold text-gray-800">{route.stationCount}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-xs text-gray-450 block mb-0.5">Interchanges</span>
                <span className="font-bold text-gray-800">{route.interchangeCount}</span>
              </div>
            </div>

            {/* Fare cost */}
            <div className="bg-teal-50 border border-teal-150 rounded p-4 mt-6 flex items-center justify-between text-teal-900">
              <div>
                <span className="text-xs text-teal-700 block font-medium">Single Journey Base Fare</span>
                <span className="text-sm font-semibold text-gray-500">(Per passenger)</span>
              </div>
              <div className="text-3xl font-extrabold flex items-baseline">
                <span className="text-lg">₹</span>
                <span>{fare}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                resetBooking();
                navigate('/');
              }}
              className="flex-1 py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Reset Search</span>
            </button>
            <button
              onClick={() => navigate('/passenger-details')}
              className="flex-[2] py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Passenger Info</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right pane: Interactive map layout */}
        <div className="lg:col-span-7">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
              <Navigation className="h-4 w-4 text-teal-650" />
              Route Geography Map
            </h3>
            <div className="flex-grow">
              <MapContainer source={sourceStation} destination={destinationStation} path={route.path} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTicket;
