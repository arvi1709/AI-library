import React from "react";
import "./StoryThumbnail.css"; // the CSS below

/**
 * Props:
 * - src: image URL (string)
 * - alt: alt text
 * - className: optional additional class names for outer wrapper
 * - gradientClass: optional additional gradient class (default provided)
 */
export default function StoryThumbnail({ src, alt = "", className = "", gradientClass = "" }: { src?: string, alt?: string, className?: string, gradientClass?: string }) {
  // fallback image or empty string if none
  const safeSrc = src || "";

  return (
    <div className={`story-thumb ${className}`}>
      <div className={`story-thumb__frame ${gradientClass || "story-thumb__gradient"}`}>
        {safeSrc ? (
          <img
            className="story-thumb__img"
            src={safeSrc}
            alt={alt}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="story-thumb__placeholder" aria-hidden="true">
            {/* small decorative placeholder — optional */}
            <svg width="64" height="36" viewBox="0 0 64 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="36" rx="6" fill="rgba(255,255,255,0.06)"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
