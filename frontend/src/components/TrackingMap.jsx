import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { calculateHaversineDistance, estimateETA } from '../utils/clientDistance';

const RequesterIcon = L.divIcon({
  className: 'requester-pin',
  html: `<div style="background-color: #e11d48; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(225,29,72,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">📍</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const HelperIcon = L.divIcon({
  className: 'helper-pin',
  html: `<div style="background-color: #10b981; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(16,185,129,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; animation: bounce 1s infinite alternate;">🚴</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

export default function TrackingMap({
  requesterLocation,
  helperLocation,
  helperName = 'Assigned Helper',
  height = '380px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const requesterMarkerRef = useRef(null);
  const helperMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!requesterLocation?.lat || !helperLocation?.lat) return;

    const rLat = requesterLocation.lat;
    const rLng = requesterLocation.lng;
    const hLat = helperLocation.lat;
    const hLng = helperLocation.lng;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [(rLat + hLat) / 2, (rLng + hLng) / 2],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Requester marker
      const rMarker = L.marker([rLat, rLng], { icon: RequesterIcon })
        .bindPopup('<strong>Your Location</strong>')
        .addTo(map);

      // Helper marker
      const hMarker = L.marker([hLat, hLng], { icon: HelperIcon })
        .bindPopup(`<strong>${helperName}</strong> (En Route)`)
        .addTo(map);

      // Route polyline connecting them
      const polyline = L.polyline([[rLat, rLng], [hLat, hLng]], {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);

      mapInstanceRef.current = map;
      requesterMarkerRef.current = rMarker;
      helperMarkerRef.current = hMarker;
      polylineRef.current = polyline;

      // Fit bounds to show both participants comfortably
      map.fitBounds([[rLat, rLng], [hLat, hLng]], { padding: [50, 50] });
    } else {
      // Update markers
      if (requesterMarkerRef.current) requesterMarkerRef.current.setLatLng([rLat, rLng]);
      if (helperMarkerRef.current) helperMarkerRef.current.setLatLng([hLat, hLng]);
      if (polylineRef.current) polylineRef.current.setLatLngs([[rLat, rLng], [hLat, hLng]]);
    }
  }, [requesterLocation, helperLocation, helperName]);

  const distance = (requesterLocation?.lat && helperLocation?.lat)
    ? calculateHaversineDistance(requesterLocation.lat, requesterLocation.lng, helperLocation.lat, helperLocation.lng)
    : 1.2;

  const eta = estimateETA(distance);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Live Tracking HUD */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-700/60 flex items-center gap-3 pointer-events-auto">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Live Assistance Tracking</span>
            <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>{helperName} is on the way</span>
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200 text-right pointer-events-auto">
          <span className="block text-[10px] uppercase font-bold text-slate-500">Distance & ETA</span>
          <div className="text-xs font-black text-slate-900">
            <span className="text-rose-600 font-extrabold text-sm">{distance} km</span> • ~{eta} mins
          </div>
        </div>
      </div>
    </div>
  );
}
