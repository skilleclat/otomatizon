"use client";

import React, { useState } from "react";

interface BrandLogoProps {
  variant?: "full" | "mark";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  size = "md",
  className = ""
}) => {
  const [imageError, setImageError] = useState(false);

  const heightClass = {
    xs: "h-5",
    sm: "h-6",
    md: "h-7",
    lg: "h-8 sm:h-9"
  }[size];

  if (variant === "mark" || imageError) {
    if (imageError && variant === "full") {
      return (
        <div className={`inline-flex items-center gap-2 select-none shrink-0 notranslate ${className}`} translate="no">
          <div className="w-7 h-7 rounded-lg bg-[#002E25] flex items-center justify-center text-emerald-300 font-bold font-mono text-sm border border-[#15803D]/40 shadow-2xs shrink-0">
            O
          </div>
          <span className="font-extrabold text-[#121316] text-base tracking-tight font-sans whitespace-nowrap notranslate" translate="no">
            Otomatizon<span className="text-[#15803D]">.</span>
          </span>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center justify-center select-none shrink-0 notranslate ${className}`} translate="no">
        <img
          src="/logo-mark.png"
          alt="Otomatizon Emblem"
          onError={() => setImageError(true)}
          className={`${heightClass} w-auto object-contain shrink-0 notranslate`}
          translate="no"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none shrink-0 notranslate ${className}`} translate="no">
      <img
        src="/logo.png"
        alt="Otomatizon"
        onError={() => setImageError(true)}
        className={`${heightClass} w-auto object-contain shrink-0 notranslate`}
        translate="no"
      />
    </div>
  );
};
