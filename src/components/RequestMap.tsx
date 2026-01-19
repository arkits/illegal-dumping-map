"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      map.flyTo([request.lat, request.lon], 18);
      markerRef.current.openPopup();
    }
  }, [isSelected, map, request.lat, request.lon]);

  return (
    <Marker
      ref={markerRef}
      position={[request.lat, request.lon]}
      icon={isSelected ? selectedIconLocal : icon}
      eventHandlers={{
        click: () => {
          map.flyTo([request.lat, request.lon], 18);
        },
      }}
    >
      <Popup closeButton={true} closeOnClick={false}>
        <div className="p-3 bg-white text-slate-900 rounded-xl min-w-[200px]">
          <h3 className="font-black text-[10px] uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Request {request.id.slice(-8)}</h3>
          <p className="text-xs font-bold leading-relaxed mb-3 text-slate-600">{request.description}</p>
          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-tighter">
              <span className="text-slate-400 font-bold mr-2">Status:</span>
              <span className={`px-2 py-0.5 rounded-md font-black border ${request.status.toLowerCase().includes("open") || request.status.toLowerCase().includes("new") ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                request.status.toLowerCase().includes("progress") || request.status.toLowerCase().includes("active") ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }`}>{request.status}</span>
            </p>
            <p className="text-[9px] uppercase tracking-tighter">
              <span className="text-slate-400 font-bold mr-2">Synchronized:</span>
              <span className="text-slate-600 font-black">{new Date(request.datetimeinit).toLocaleDateString()}</span>
            </p>
          </div>
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
    { id: "open", label: "Open / New", color: "bg-rose-500", textColor: "text-rose-400" },
    { id: "inProgress", label: "In Progress", color: "bg-amber-500", textColor: "text-amber-400" },
    { id: "completed", label: "Completed", color: "bg-emerald-500", textColor: "text-emerald-400" },
    { id: "other", label: "Other", color: "bg-slate-500", textColor: "text-slate-400" },
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
    <div className="absolute bottom-10 right-10 bg-slate-900/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[1000] min-w-[200px]">
      <div className="flex items-center justify-between mb-6">
        <p className="font-black text-[9px] uppercase tracking-[0.3em] text-slate-500">Node Overlays</p>
        <button
          onClick={toggleAll}
          className="text-[8px] font-black uppercase tracking-tighter px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
        >
          {allSelected ? "Purge" : "Sync All"}
        </button>
      </div>
      <div className="space-y-2.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleFilter(cat.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all border ${filters.has(cat.id)
              ? "bg-slate-800/50 border-slate-700/50 shadow-inner"
              : "opacity-30 grayscale border-transparent"
              } hover:bg-slate-800/80`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${cat.color} ${!filters.has(cat.id) ? "ring-2 ring-slate-800" : "shadow-[0_0_10px_rgba(255,255,255,0.2)] animate-pulse"
                }`}
            />
            <span className="flex-1 text-left text-[11px] font-black uppercase tracking-wider text-slate-300">{cat.label}</span>
            <span className={`text-[10px] font-black ${cat.textColor}`}>[{counts[cat.id] || 0}]</span>
          </button>
        ))}
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
      <div className="h-full w-full bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin" />
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
