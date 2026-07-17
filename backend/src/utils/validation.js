/**
 * Validates whether a given URL is a valid image source.
 * Accepts direct image URLs, local uploaded assets, and trusted CDN resources.
 * Rejects search engine result redirects, invalid URLs, and normal HTML web pages.
 * 
 * @param {string} url - The URL or file path to validate.
 * @returns {object} - An object containing { isValid: boolean, reason?: string }
 */
const validateImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, reason: "Image URL cannot be empty." };
  }

  // 1. Accept relative local uploaded files / Media Library assets
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    return { isValid: true };
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();

    // 2. Reject search engines images viewer/redirect links
    if (
      (hostname.includes('bing.com') && pathname.includes('/images')) ||
      (hostname.includes('google.') && pathname.includes('/imgres')) ||
      (hostname.includes('google.') && pathname.includes('/images')) ||
      hostname.includes('images.google.')
    ) {
      return {
        isValid: false,
        reason: "Search engine redirect/preview links (like Google/Bing image search results) are not allowed. Please copy the direct image URL instead."
      };
    }

    // 3. Accept absolute local uploads (e.g. http://localhost:5000/uploads/...)
    if (pathname.startsWith('/uploads/')) {
      return { isValid: true };
    }

    // 4. Reject other search engine domains as direct image sources
    if (
      hostname === 'google.com' || hostname.endsWith('.google.com') ||
      hostname === 'bing.com' ||
      hostname === 'yahoo.com' ||
      hostname === 'baidu.com'
    ) {
      return {
        isValid: false,
        reason: "Search engine domains are not valid direct image sources. Please use a direct image file link."
      };
    }

    // 5. Accept common image formats (.jpg, .jpeg, .png, .webp, .gif, .svg, .bmp, .tiff, .avif)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.tiff', '.avif'];
    const cleanPathname = pathname.split(/[?#]/)[0];
    if (validExtensions.some(ext => cleanPathname.endsWith(ext))) {
      return { isValid: true };
    }

    // 6. Accept popular trusted CDNs / photo sources that don't always end with extension
    if (
      hostname.includes('unsplash.com') ||
      hostname.includes('pexels.com') ||
      hostname.includes('pixabay.com')
    ) {
      if (!pathname.includes('/search') && !pathname.includes('/images')) {
        return { isValid: true };
      }
    }

    // Default rejection for webpages/HTML pages
    return {
      isValid: false,
      reason: "The URL does not point to a direct image file. A valid direct image link must end with a standard extension (like .jpg, .png, .webp, .gif, .avif) or be from a trusted media source."
    };
  } catch (error) {
    return {
      isValid: false,
      reason: "Invalid URL format. Please enter a valid web URL (e.g., https://example.com/image.jpg) or a local uploaded file path (e.g., /uploads/image.jpg)."
    };
  }
};

module.exports = {
  validateImageUrl
};
