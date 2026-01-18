"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DumpingRequest } from "@/lib/utils";

interface RequestTableProps {
  requests: DumpingRequest[];
}

export default function RequestTable({ requests }: RequestTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: requests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No requests to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          All Requests ({requests.length.toLocaleString()})
        </h2>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 flex-1 min-h-0">
        <div className="grid grid-cols-[70px_1fr_90px_80px] gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0 z-10">
          <div className="flex-shrink-0">ID</div>
          <div className="flex-shrink-0">Location</div>
          <div className="flex-shrink-0">Date</div>
          <div className="flex-shrink-0">Status</div>
        </div>
        <div
          ref={parentRef}
          className="h-[calc(100%-32px)] overflow-auto"
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
              return (
                <div
                  key={request.id}
                  className="absolute top-0 left-0 w-full grid grid-cols-[70px_1fr_90px_80px] gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 items-center"
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="flex-shrink-0 text-xs text-gray-900 dark:text-white truncate" title={request.id}>
                    {request.id}
                  </div>
                  <div className="flex-shrink-0 min-w-0 text-xs text-gray-600 dark:text-gray-300 truncate" title={request.address || `${request.lat.toFixed(4)}, ${request.lon.toFixed(4)}`}>
                    {request.address || `${request.lat.toFixed(4)}, ${request.lon.toFixed(4)}`}
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(request.datetimeinit).toLocaleDateString()}
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        request.status === "OPEN"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : request.status === "CLOSED"
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
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
