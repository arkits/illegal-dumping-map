"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DumpingRequest } from "@/lib/utils";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -40],
  shadowSize: [46, 46],
});

interface MapProps {
  requests: DumpingRequest[];
  centerLat?: number;
  centerLon?: number;
  selectedRequestId?: string | null;
}

function MapController({
  centerLat,
  centerLon,
  zoom = 12,
}: {
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (centerLat != null && centerLon != null) {
      map.flyTo([centerLat, centerLon], zoom, { duration: 1.5 });
    }
  }, [map, centerLat, centerLon, zoom]);

  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

function MarkerWithPopup({ request, isSelected }: { request: DumpingRequest; isSelected: boolean }) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[request.lat, request.lon]}
      icon={isSelected ? selectedIcon : customIcon}
      zIndexOffset={isSelected ? 1000 : 0}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">Illegal Dumping Report</p>
          <p className="text-gray-600">{request.address || "No address available"}</p>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(request.datetimeinit).toLocaleDateString()}
          </p>
          {request.description && (
            <p className="mt-1 text-xs">
              {request.description.length > 100
                ? `${request.description.substring(0, 100)}...`
                : request.description}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export default function RequestMap({ requests, centerLat, centerLon, selectedRequestId }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMapClick = useCallback(() => {
    setPopupClosed(true);
  }, []);

  useEffect(() => {
    if (selectedRequestId != null) {
      setPopupClosed(false);
    }
  }, [selectedRequestId]);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    );
  }

  const defaultCenter: [number, number] = centerLat != null && centerLon != null
    ? [centerLat, centerLon]
    : [37.804747, -122.272];

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);
  const targetLat = selectedRequest ? selectedRequest.lat : centerLat;
  const targetLon = selectedRequest ? selectedRequest.lon : centerLon;
  const targetZoom = selectedRequest ? 18 : 12;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController centerLat={targetLat} centerLon={targetLon} zoom={targetZoom} />
      <MapClickHandler onMapClick={handleMapClick} />
      {requests.map((request) => (
        <MarkerWithPopup
          key={request.id}
          request={request}
          isSelected={selectedRequestId === request.id && !popupClosed}
        />
      ))}
    </MapContainer>
  );
}
