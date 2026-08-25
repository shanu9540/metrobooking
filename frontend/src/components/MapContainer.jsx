import React, { useEffect, useRef } from 'react';

const MapContainer = ({ source, destination, path = [] }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Leaflet global object is loaded via index.html CDN script
    if (typeof window.L === 'undefined') {
      console.error('Leaflet is not loaded');
      return;
    }

    const L = window.L;

    // Default center coords (Delhi Connaught Place: Rajiv Chowk)
    let centerLat = 28.6328;
    let centerLng = 77.2197;
    let zoomLevel = 12;

    if (source && source.location) {
      centerLng = source.location.coordinates[0];
      centerLat = source.location.coordinates[1];
    }

    // Reset container if already bound to avoid React 18 double-render crash
    const mapContainer = L.DomUtil.get('leaflet-map');
    if (mapContainer) {
      mapContainer._leaflet_id = null;
    }

    // Initialize map
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

    // Custom Icons helper
    const createCircleMarker = (coords, color, label, isBig = false) => {
      const radius = isBig ? 8 : 5;
      const marker = L.circleMarker([coords[1], coords[0]], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95
      }).bindPopup(`<b>${label}</b>`);
      marker.addTo(map);
      markerGroup.addLayer(marker);
      return marker;
    };

    // Draw intermediate path stations
    if (path && path.length > 0) {
      const polylinePoints = [];
      
      path.forEach((station, index) => {
        const coords = station.location.coordinates;
        polylinePoints.push([coords[1], coords[0]]);

        const isSrc = source && station._id === source._id;
        const isDest = destination && station._id === destination._id;

        let color = '#0D9488'; // Teal default
        let label = station.stationName;

        if (isSrc) {
          color = '#10B981'; // Green for start
          label = `Start: ${station.stationName}`;
          createCircleMarker(coords, color, label, true);
        } else if (isDest) {
          color = '#EF4444'; // Red for end
          label = `Destination: ${station.stationName}`;
          createCircleMarker(coords, color, label, true);
        } else {
          // Standard station dot
          createCircleMarker(coords, color, label, false);
        }
      });

      // Draw polyline
      if (polylinePoints.length > 1) {
        const polyline = L.polyline(polylinePoints, {
          color: '#0F766E', // dark teal line
          weight: 4,
          opacity: 0.85,
          dashArray: '5, 5'
        }).addTo(map);
        
        markerGroup.addLayer(polyline);
      }
    } else {
      // Draw single markers if no path is generated yet
      if (source && source.location) {
        createCircleMarker(
          source.location.coordinates,
          '#10B981',
          `Start: ${source.stationName}`,
          true
        );
      }
      if (destination && destination.location) {
        createCircleMarker(
          destination.location.coordinates,
          '#EF4444',
          `Destination: ${destination.stationName}`,
          true
        );
      }
    }

    // Auto-fit bounds if we have markers
    if (path.length > 0 || (source && destination)) {
      try {
        const bounds = markerGroup.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.warn('Could not auto-fit bounds:', e);
      }
    }

    // Clean up map instance on component unmount to prevent duplicate container bindings
    return () => {
      map.remove();
    };
  }, [source, destination, path]);

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div id="leaflet-map" className="h-[300px] md:h-[400px] w-full z-10" />
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-gray-500 font-medium z-20 shadow-sm border border-gray-100">
        Live Network View
      </div>
    </div>
  );
};

export default MapContainer;
