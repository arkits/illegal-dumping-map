"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
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

interface MapProps {
  requests: DumpingRequest[];
  centerLat?: number;
  centerLon?: number;
}

function MapController({
  centerLat,
  centerLon,
}: {
  centerLat?: number;
  centerLon?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (centerLat != null && centerLon != null) {
      map.setView([centerLat, centerLon], 12);
    }
  }, [map, centerLat, centerLon]);

  return null;
}

export default function RequestMap({ requests, centerLat, centerLon }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      <MapController centerLat={centerLat} centerLon={centerLon} />
      <MarkerClusterGroup chunkedLoading>
        {requests.map((request) => (
          <Marker
            key={request.id}
            position={[request.lat, request.lon]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Illegal Dumping Report</p>
                <p className="text-gray-600">{request.address || "No address available"}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(request.datetimeinit).toLocaleDateString()}
                </p>
                {request.description && (
                  <p className="mt-1 text-xs">{request.description.substring(0, 100)}...</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
