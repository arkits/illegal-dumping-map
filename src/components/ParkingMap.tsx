"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ParkingCitation } from "@/lib/parking-citations";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Use orange/yellow color scheme for parking citations (amber not available, using orange)
const defaultIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -40],
  shadowSize: [46, 46],
});

function MapController({ centerLat, centerLon, zoom }: { centerLat?: number; centerLon?: number; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (centerLat != null && centerLon != null) {
      map.flyTo([centerLat, centerLon], zoom);
    }
  }, [map, centerLat, centerLon, zoom]);

  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

function MarkerWithPopup({ citation, isSelected }: { citation: ParkingCitation; isSelected: boolean }) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      map.flyTo([citation.lat, citation.lon], 18);
      markerRef.current.openPopup();
    }
  }, [isSelected, map, citation.lat, citation.lon]);

  return (
    <Marker
      ref={markerRef}
      position={[citation.lat, citation.lon]}
      icon={isSelected ? selectedIcon : defaultIcon}
      eventHandlers={{
        click: () => {
          map.flyTo([citation.lat, citation.lon], 18);
        },
      }}
    >
      <Popup closeButton={true} closeOnClick={false}>
        <div className="p-3 bg-white text-slate-900 rounded-xl min-w-[200px]">
          <h3 className="font-black text-[10px] uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Citation {citation.id.slice(-8)}</h3>
          <p className="text-xs font-bold leading-relaxed mb-3 text-slate-600">{citation.violationDesc || citation.violation}</p>
          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-tighter">
              <span className="text-slate-400 font-bold mr-2">Fine:</span>
              <span className="text-amber-600 font-black">${citation.fineAmount.toFixed(2)}</span>
            </p>
            <p className="text-[9px] uppercase tracking-tighter">
              <span className="text-slate-400 font-bold mr-2">Issued:</span>
              <span className="text-slate-600 font-black">{new Date(citation.issueDate).toLocaleDateString()}</span>
            </p>
            {citation.location && (
              <p className="text-[9px] uppercase tracking-tighter">
                <span className="text-slate-400 font-bold mr-2">Location:</span>
                <span className="text-slate-600 font-black">{citation.location}</span>
              </p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

interface MapProps {
  citations: ParkingCitation[];
  centerLat?: number;
  centerLon?: number;
  selectedCitationId?: string | null;
}

export default function ParkingMap({ citations, centerLat, centerLon, selectedCitationId }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMapClick = useCallback(() => {
    setPopupClosed(true);
  }, []);

  useEffect(() => {
    if (selectedCitationId != null) {
      setPopupClosed(false);
    }
  }, [selectedCitationId]);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const defaultCenter: [number, number] = centerLat != null && centerLon != null
    ? [centerLat, centerLon]
    : [37.804747, -122.272];

  const selectedCitation = citations.find((c) => c.id === selectedCitationId);
  const targetLat = selectedCitation ? selectedCitation.lat : centerLat;
  const targetLon = selectedCitation ? selectedCitation.lon : centerLon;
  const targetZoom = selectedCitation ? 18 : 12;

  return (
    <div className="relative h-full w-full bg-slate-50">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%", background: "#f8fafc" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapController centerLat={targetLat} centerLon={targetLon} zoom={targetZoom} />
        <MapClickHandler onMapClick={handleMapClick} />
        {citations.map((citation) => (
          <MarkerWithPopup
            key={citation.id}
            citation={citation}
            isSelected={selectedCitationId === citation.id && !popupClosed}
          />
        ))}
      </MapContainer>
    </div>
  );
}
