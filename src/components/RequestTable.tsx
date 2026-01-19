"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DumpingRequest } from "@/lib/utils";

interface RequestTableProps {
  requests: DumpingRequest[];
  onRequestClick?: (id: string) => void;
  selectedRequestId?: string | null;
}

export default function RequestTable({ requests, onRequestClick, selectedRequestId }: RequestTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: requests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-8 text-center border border-slate-700/50 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No data nodes found</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-slate-700/50 shadow-2xl flex flex-col h-[500px] transition-all">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-transparent">
        <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Incident Log
        </h2>
        <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg border border-blue-500/20 uppercase tracking-tighter">
          {requests.length.toLocaleString()} total
        </span>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-[70px_1fr_45px_100px] gap-3 px-4 py-3 bg-slate-800/30 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
        <div>ID</div>
        <div>Location</div>
        <div className="text-center">Date</div>
        <div className="text-right">Status</div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <div
          ref={parentRef}
          className="h-full overflow-auto"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const request = requests[virtualItem.index];
              const isSelected = selectedRequestId === request.id;

              return (
                <div
                  key={request.id}
                  className={`absolute top-0 left-0 w-full grid grid-cols-[70px_1fr_45px_100px] gap-3 px-4 py-3 border-b border-slate-800/50 items-center hover:bg-white/5 cursor-pointer transition-colors ${isSelected ? "bg-blue-500/10 border-l-4 border-l-blue-500" : ""
                    }`}
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  onClick={() => onRequestClick?.(request.id)}
                >
                  <span className="text-[10px] font-black text-blue-400 truncate">
                    #{request.id.slice(-6)}
                  </span>

                  <p className="text-[11px] font-bold text-slate-200 truncate">
                    {request.address || "Point Alpha"}
                  </p>

                  <span className="text-[10px] font-bold text-slate-500 text-center">
                    {new Date(request.datetimeinit).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                  </span>

                  <div className="flex justify-end">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter border text-center w-full max-w-[80px] ${request.status === "OPEN"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
