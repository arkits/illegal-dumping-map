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
    estimateSize: () => 60,
    overscan: 10,
  });

  // Prevent rendering if no requests
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No requests to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          All Requests ({requests.length.toLocaleString()})
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Virtualized list for performance with large datasets
        </p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">Address</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Description</div>
        </div>
        <div
          ref={parentRef}
          className="h-[400px] overflow-auto"
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
                  className="absolute top-0 left-0 w-full grid grid-cols-6 gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 items-center"
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="col-span-1 text-sm text-gray-900 dark:text-white truncate">
                    {request.id}
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                    {request.address || "No address"}
                  </div>
                  <div className="col-span-1 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(request.datetimeinit).toLocaleDateString()}
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                  <div className="col-span-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                    {request.description || "-"}
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
