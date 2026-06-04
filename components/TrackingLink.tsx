"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type TrackingLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  conversionType: "CV2" | "CV3";
  label: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  children: ReactNode;
};

export function TrackingLink({
  conversionType,
  label,
  metadata,
  onClick,
  children,
  ...props
}: TrackingLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const payload = JSON.stringify({
      eventType: conversionType,
      label,
      path: window.location.pathname,
      metadata,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/conversions",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }

    fetch("/api/conversions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  }

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
