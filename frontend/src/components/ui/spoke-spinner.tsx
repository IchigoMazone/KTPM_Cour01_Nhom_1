import React from "react";

export function SpokeSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 mx-auto text-current"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="1" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.875" transform="rotate(45 12 12)" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" transform="rotate(90 12 12)" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.625" transform="rotate(135 12 12)" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" transform="rotate(180 12 12)" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.375" transform="rotate(225 12 12)" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" transform="rotate(270 12 12)" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.125" transform="rotate(315 12 12)" />
    </svg>
  );
}
