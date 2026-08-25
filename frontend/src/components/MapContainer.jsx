import React, { useEffect, useRef } from 'react';
import { STATIC_STATIONS, connections } from '../utils/metroData';

const MapContainer = ({ source, destination, path, currentStationIndex }) => {
  const mapRef = useRef(null);

  // Line Colors Mapping
  const getLineColor = (lineName) => {
    if (!lineName) return '#6B7280';
    if (lineName.includes('Red')) return '#EF4444';
    if (lineName.includes('Yellow')) return '#F59E0B';
    if (lineName.includes('Blue')) return '#2563EB';
    if (lineName.includes('Green')) return '#10B981';
    if (lineName.includes('Violet')) return '#8B5CF6';
    if (lineName.includes('Magenta')) return '#EC4899';
    if (lineName.includes('Pink')) return '#F472B6';
    if (lineName.includes('Airport') || lineName.includes('Orange')) return '#F97316';
    if (lineName.includes('Aqua')) return '#06B6D4';
    if (lineName.includes('Rapid')) return '#0EA5E9';
    if (lineName.includes('Grey')) return '#6B7280';
    return '#4B5563';
  };

  useEffect(() => {
    if (typeof window.L === 'undefined') {
      console.error('Leaflet is not loaded on window');
      return;
    }

    const L = window.L;

    // Reset map container to prevent double render crashes
    const mapContainer = L.DomUtil.get('leaflet-map');
    if (mapContainer) {
      mapContainer._leaflet_id = null;
    }

    // Default center coords (Delhi Connaught Place: Rajiv Chowk)
    let centerLat = 28.6328;
    let centerLng = 77.2197;
    let zoomLevel = 11;

    if (source && source.location) {
      centerLng = source.location.coordinates[0];
      centerLat = source.location.coordinates[1];
    }

    // Initialize Leaflet map
    const map = L.map('leaflet-map', {
      center: [centerLat, centerLng],
      zoom: zoomLevel,
      zoomControl: true
    });

    mapRef.current = map;

    // Set OSM Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markerGroup = L.featureGroup();

    // 1. Draw Entire Metro Network in Background (semi-transparent)
    connections.forEach(c => {
      const fromSt = STATIC_STATIONS.find(s => s._id === c.from);
      const toSt = STATIC_STATIONS.find(s => s._id === c.to);
      if (fromSt && toSt) {
        const polyline = L.polyline([
          [fromSt.location.coordinates[1], fromSt.location.coordinates[0]],
          [toSt.location.coordinates[1], toSt.location.coordinates[0]]
        ], {
          color: getLineColor(c.line),
          weight: 2,
          opacity: 0.2,
          dashArray: c.line === 'Walkway' ? '4, 4' : null
        }).addTo(map);
        markerGroup.addLayer(polyline);
      }
    });

    STATIC_STATIONS.forEach(s => {
      const isInterchange = s.lineName && s.lineName.length > 1;
      const marker = L.circleMarker([s.location.coordinates[1], s.location.coordinates[0]], {
        radius: isInterchange ? 3 : 2,
        fillColor: isInterchange ? '#000000' : getLineColor(s.lineName?.[0]),
        color: '#ffffff',
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.3
      }).bindPopup(`<b>${s.stationName}</b><br/><span style="font-size:9px;color:gray">${s.lineName?.join(', ')}</span>`);
      marker.addTo(map);
      markerGroup.addLayer(marker);
    });

    // Custom helper for highlighting active path markers
    const createActiveMarker = (coords, color, label, isPulse = false) => {
      const marker = L.circleMarker([coords[1], coords[0]], {
        radius: isPulse ? 9 : 6,
        fillColor: color,
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.95
      }).bindPopup(`<b>${label}</b>`);
      marker.addTo(map);
      markerGroup.addLayer(marker);
      if (isPulse && marker._path) {
        marker._path.classList.add('map-pulse-marker');
      }
      return marker;
    };

    // 2. Draw Highlighted Selected Path
    if (path && path.length > 0) {
      const polylinePoints = [];
      
      path.forEach((station, index) => {
        const coords = station.location.coordinates;
        polylinePoints.push([coords[1], coords[0]]);

        const isSrc = index === 0;
        const isDest = index === path.length - 1;
        const isCurrent = currentStationIndex !== undefined && index === currentStationIndex;

        let label = station.stationName;

        if (isCurrent) {
          createActiveMarker(coords, '#0284C7', `🚆 Current Stop: ${label}`, true);
        } else if (isSrc) {
          createActiveMarker(coords, '#10B981', `🛫 Start: ${label}`, false);
        } else if (isDest) {
          createActiveMarker(coords, '#EF4444', `🏁 Destination: ${label}`, false);
        } else {
          // Highlighted intermediate station
          createActiveMarker(coords, '#D97706', label, false);
        }
      });

      // Selected Path Polyline
      if (polylinePoints.length > 1) {
        const highlightedLine = L.polyline(polylinePoints, {
          color: '#0F766E', // bold dark teal
          weight: 5,
          opacity: 0.95
        }).addTo(map);
        markerGroup.addLayer(highlightedLine);
      }
    } else {
      // Single source and destination fallback markers
      if (source && source.location) {
        createActiveMarker(source.location.coordinates, '#10B981', `Start: ${source.stationName}`);
      }
      if (destination && destination.location) {
        createActiveMarker(destination.location.coordinates, '#EF4444', `Destination: ${destination.stationName}`);
      }
    }

    // Auto-zoom map to fit highlighted path bounds
    if (path && path.length > 0) {
      try {
        const pathPoints = path.map(s => [s.location.coordinates[1], s.location.coordinates[0]]);
        const bounds = L.latLngBounds(pathPoints);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (e) {
        console.warn('Bounds zoom failed:', e);
      }
    }

    return () => {
      map.remove();
    };
  }, [source, destination, path, currentStationIndex]);

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div id="leaflet-map" className="h-[300px] md:h-[420px] w-full z-10" />
      
      {/* Legend overlays */}
      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-3 rounded-lg text-[9px] text-gray-700 font-medium z-20 shadow-md border border-gray-200 space-y-1">
        <div className="font-bold border-b border-gray-100 pb-1 mb-1 text-[10px] text-teal-800">Map Legend</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Start Station</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span> End Station</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span> Active Position</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Route Stations</div>
        <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-teal-700 inline-block"></span> Selected Path</div>
      </div>

      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-gray-500 font-semibold z-20 shadow-sm border border-gray-100">
        Live Network View
      </div>
    </div>
  );
};

export default MapContainer;
