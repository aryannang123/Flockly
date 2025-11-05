import * as React from "react";

export function Button({ className = "", children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      disabled:opacity-50 disabled:pointer-events-none
      bg-black text-white hover:bg-gray-800 px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}