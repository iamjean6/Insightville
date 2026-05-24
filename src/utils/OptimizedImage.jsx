import React from 'react';

/**
 * OptimizedImage Component
 * 
 * @param {string} webpSrc - The URL to the WebP format image
 * @param {string} jpegSrc - The URL to the fallback JPEG format image
 * @param {string } avifSrc
 * @param {string} alt - Alternate text for accessibility 
 *  @param {string} className - Tailwind CSS classes for styling
 */
export default function OptimizedImage({ webpSrc, jpegSrc, avifSrc, alt, className }) {
    return (
        <picture>
            {/* The browser will try to load the webp first because of the type attribute */}
            {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
            
            {/* If webp isn't supported, or if webpSrc is missing, it falls back to the jpeg */}
            <img 
                src={jpegSrc || webpSrc || avifSrc} 
                alt={alt || "Image"} 
                className={className} 
                loading="lazy" 
            />
        </picture>
    );
}
