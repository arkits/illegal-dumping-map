"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Map, { Marker, Popup, MapRef, ViewState } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ParkingCitation } from "@/lib/parking-citations";

// Marker component styles
const markerStyle = (isSelected: boolean) => ({
  width: isSelected ? "36px" : "30px",
  height: isSelected ? "36px" : "30px",
  borderRadius: "50% 50% 50% 0",
  background: isSelected ? "#eab308" : "#f97316", // Gold or Orange
  border: "2px solid #ffffff",
  transform: "rotate(-45deg)",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  position: "relative" as const,
});

interface MapControllerProps {
  centerLat?: number;
  centerLon?: number;
  zoom: number;
  mapRef: React.RefObject<MapRef | null>;
}

function MapController({ centerLat, centerLon, zoom, mapRef }: MapControllerProps) {
  useEffect(() => {
    if (centerLat != null && centerLon != null && mapRef.current) {
      mapRef.current.flyTo({
        center: [centerLon, centerLat],
        zoom,
        duration: 1000,
      });
    }
  }, [centerLat, centerLon, zoom, mapRef]);

  return null;
}

interface MarkerWithPopupProps {
  citation: ParkingCitation;
  isSelected: boolean;
  onMarkerClick: () => void;
}

function MarkerWithPopup({ citation, isSelected, onMarkerClick }: MarkerWithPopupProps) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isSelected) {
      setShowPopup(true);
    }
  }, [isSelected]);

  const handleMarkerClick = useCallback(() => {
    setShowPopup(true);
    onMarkerClick();
  }, [onMarkerClick]);

  return (
    <>
      <Marker
        longitude={citation.lon}
        latitude={citation.lat}
        anchor="bottom"
        onClick={handleMarkerClick}
      >
        <div style={markerStyle(isSelected)}>
          <div
            style={{
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background: "#ffffff",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </Marker>
      {showPopup && (
        <Popup
          longitude={citation.lon}
          latitude={citation.lat}
          anchor="bottom"
          onClose={() => setShowPopup(false)}
          closeButton={true}
          closeOnClick={false}
        >
          <div className="p-3 bg-white text-slate-900 rounded-xl min-w-[200px]">
            <h3 className="font-black text-[10px] uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">
              Citation {citation.id.slice(-8)}
            </h3>
            <p className="text-xs font-bold leading-relaxed mb-3 text-slate-600">
              {citation.violationDesc || citation.violation}
            </p>
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-tighter">
                <span className="text-slate-400 font-bold mr-2">Fine:</span>
                <span className="text-amber-600 font-black">${citation.fineAmount.toFixed(2)}</span>
              </p>
              <p className="text-[9px] uppercase tracking-tighter">
                <span className="text-slate-400 font-bold mr-2">Issued:</span>
                <span className="text-slate-600 font-black">
                  {new Date(citation.issueDate).toLocaleDateString()}
                </span>
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
      )}
    </>
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
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>({
    longitude: centerLon ?? -122.272,
    latitude: centerLat ?? 37.804747,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

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

  // Update viewState when center changes (but not when selected citation changes)
  useEffect(() => {
    if (centerLat != null && centerLon != null && !selectedCitationId) {
      setViewState((prev) => ({
        ...prev,
        longitude: centerLon,
        latitude: centerLat,
      }));
    }
  }, [centerLat, centerLon, selectedCitationId]);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const selectedCitation = citations.find((c) => c.id === selectedCitationId);
  const targetLat = selectedCitation ? selectedCitation.lat : centerLat;
  const targetLon = selectedCitation ? selectedCitation.lon : centerLon;
  const targetZoom = selectedCitation ? 18 : 12;

  return (
    <div className="relative h-full w-full bg-slate-50">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
        mapLib={maplibregl}
      >
        <MapController
          centerLat={targetLat}
          centerLon={targetLon}
          zoom={targetZoom}
          mapRef={mapRef}
        />
        {citations.map((citation) => (
          <MarkerWithPopup
            key={citation.id}
            citation={citation}
            isSelected={selectedCitationId === citation.id && !popupClosed}
            onMarkerClick={() => {
              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: [citation.lon, citation.lat],
                  zoom: 18,
                  duration: 1000,
                });
              }
            }}
          />
        ))}
      </Map>
    </div>
  );
}
