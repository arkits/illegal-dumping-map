"use client";

import { useEffect, useState, useCallback } from "react";
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

const openIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const inProgressIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const completedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const otherIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
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

function getStatusCategory(status: string): "open" | "inProgress" | "completed" | "other" {
  const normalizedStatus = status.toLowerCase().trim();

  if (
    normalizedStatus.includes("open") ||
    normalizedStatus.includes("new") ||
    normalizedStatus.includes("pending") ||
    normalizedStatus === "" ||
    normalizedStatus === "0"
  ) {
    return "open";
  }

  if (
    normalizedStatus.includes("progress") ||
    normalizedStatus.includes("active") ||
    normalizedStatus.includes("working") ||
    normalizedStatus.includes("assigned") ||
    normalizedStatus.includes("review")
  ) {
    return "inProgress";
  }

  if (
    normalizedStatus.includes("close") ||
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("done") ||
    normalizedStatus.includes("resolved") ||
    normalizedStatus.includes("finished")
  ) {
    return "completed";
  }

  return "other";
}

function getStatusIcon(status: string): L.Icon {
  const category = getStatusCategory(status);
  switch (category) {
    case "open":
      return openIcon;
    case "inProgress":
      return inProgressIcon;
    case "completed":
      return completedIcon;
    default:
      return otherIcon;
  }
}

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

function MarkerWithPopup({ request, isSelected }: { request: DumpingRequest; isSelected: boolean }) {
  const icon = getStatusIcon(request.status);
  const selectedIconLocal = selectedIcon;
  const map = useMap();

  useEffect(() => {
    if (isSelected) {
      map.flyTo([request.lat, request.lon], 18);
    }
  }, [isSelected, map, request.lat, request.lon]);

  return (
    <Marker
      position={[request.lat, request.lon]}
      icon={isSelected ? selectedIconLocal : icon}
      eventHandlers={{
        click: () => {
          map.flyTo([request.lat, request.lon], 18);
        },
      }}
    >
      <Popup closeButton={true} closeOnClick={false}>
        <div className="p-1">
          <h3 className="font-semibold text-base mb-1">Request #{request.id}</h3>
          <p className="text-sm mb-1">{request.description}</p>
          <p className="text-xs text-gray-600 mb-1">
            <span className="font-medium">Status:</span>{" "}
            <span className={`font-medium ${
              request.status.toLowerCase().includes("open") || request.status.toLowerCase().includes("new") ? "text-red-600" :
              request.status.toLowerCase().includes("progress") || request.status.toLowerCase().includes("active") ? "text-orange-600" :
              request.status.toLowerCase().includes("close") || request.status.toLowerCase().includes("complete") ? "text-green-600" :
              "text-gray-600"
            }`}>{request.status}</span>
          </p>
          <p className="text-xs text-gray-600 mb-1">
            <span className="font-medium">Requested:</span> {new Date(request.datetimeinit).toLocaleDateString()}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

interface MapLegendProps {
  filters: Set<string>;
  toggleFilter: (category: string) => void;
  counts: Record<string, number>;
}

function MapLegend({ filters, toggleFilter, counts }: MapLegendProps) {
  const categories = [
    { id: "open", label: "Open / New", color: "bg-red-500", textColor: "text-red-600" },
    { id: "inProgress", label: "In Progress", color: "bg-orange-500", textColor: "text-orange-600" },
    { id: "completed", label: "Completed", color: "bg-green-500", textColor: "text-green-600" },
    { id: "other", label: "Other", color: "bg-gray-500", textColor: "text-gray-600" },
  ];

  const allSelected = categories.every((cat) => filters.has(cat.id));

  const toggleAll = () => {
    if (allSelected) {
      categories.forEach((cat) => filters.delete(cat.id));
    } else {
      categories.forEach((cat) => filters.add(cat.id));
    }
  };

  return (
    <div className="absolute bottom-6 left-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-[1000] text-xs min-w-[140px]">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-sm">Filter Markers</p>
        <button
          onClick={toggleAll}
          className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          {allSelected ? "Clear All" : "Show All"}
        </button>
      </div>
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleFilter(cat.id)}
            className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded transition-colors ${
              filters.has(cat.id)
                ? "bg-gray-100 dark:bg-gray-700"
                : "opacity-40 hover:opacity-70"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${cat.color} ${
                !filters.has(cat.id) ? "ring-1 ring-gray-300" : ""
              }`}
            />
            <span className="flex-1 text-left">{cat.label}</span>
            <span className={`font-medium ${cat.textColor}`}>{counts[cat.id] || 0}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-[10px] text-gray-500 text-center">
        {Array.from(filters).length} of {categories.length} shown
      </div>
    </div>
  );
}

interface MapProps {
  requests: DumpingRequest[];
  centerLat?: number;
  centerLon?: number;
  selectedRequestId?: string | null;
}

export default function RequestMap({ requests, centerLat, centerLon, selectedRequestId }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);
  const [filters, setFilters] = useState<Set<string>>(new Set(["open", "inProgress", "completed", "other"]));

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

  const toggleFilter = useCallback((category: string) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const counts = requests.reduce((acc, req) => {
    const category = getStatusCategory(req.status);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  const filteredRequests = requests.filter((req) => {
    const category = getStatusCategory(req.status);
    return filters.has(category);
  });

  return (
    <div className="relative h-full w-full">
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
        {filteredRequests.map((request) => (
          <MarkerWithPopup
            key={request.id}
            request={request}
            isSelected={selectedRequestId === request.id && !popupClosed}
          />
        ))}
      </MapContainer>
      <MapLegend filters={filters} toggleFilter={toggleFilter} counts={counts} />
    </div>
  );
}
