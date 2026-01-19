"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ParkingCitation } from "@/lib/parking-citations";

interface ParkingTableProps {
  citations: ParkingCitation[];
  onCitationClick?: (id: string) => void;
  selectedCitationId?: string | null;
}

export default function ParkingTable({ citations, onCitationClick, selectedCitationId }: ParkingTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: citations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  if (!citations || citations.length === 0) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-8 text-center border border-slate-700/50 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No citations found</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-slate-700/50 shadow-2xl flex flex-col h-[500px] transition-all">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-transparent">
        <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Citation Log
        </h2>
        <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg border border-amber-500/20 uppercase tracking-tighter">
          {citations.length.toLocaleString()} total
        </span>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-[70px_1fr_80px_100px] gap-3 px-4 py-3 bg-slate-800/30 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
        <div>ID</div>
        <div>Violation</div>
        <div className="text-center">Date</div>
        <div className="text-right">Fine</div>
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
              const citation = citations[virtualItem.index];
              const isSelected = selectedCitationId === citation.id;

              return (
                <div
                  key={citation.id}
                  className={`absolute top-0 left-0 w-full grid grid-cols-[70px_1fr_80px_100px] gap-3 px-4 py-3 border-b border-slate-800/50 items-center hover:bg-white/5 cursor-pointer transition-colors ${isSelected ? "bg-amber-500/10 border-l-4 border-l-amber-500" : ""
                    }`}
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  onClick={() => onCitationClick?.(citation.id)}
                >
                  <span className="text-[10px] font-black text-amber-400 truncate">
                    #{citation.id.slice(-6)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 truncate" title={citation.violationDesc || citation.violation}>
                    {citation.violationDesc || citation.violation || "Unknown"}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 text-center">
                    {new Date(citation.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-[10px] font-black text-amber-400 text-right">
                    ${citation.fineAmount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
