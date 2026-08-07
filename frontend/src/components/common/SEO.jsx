import React, { useEffect } from 'react';

const DEFAULT_TITLE = "Da' Corridor | Architecture & Spatial Design";
const DEFAULT_DESCRIPTION = "Da' Corridor is a premier minimalist architecture and spatial design practice crafting luxury residential, commercial, and interior spaces globally.";
const DEFAULT_KEYWORDS = "architecture firm, spatial design, minimalist architecture, luxury interior design, sustainable building, modern home design, New York architecture studio";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000";
const SITE_NAME = "Da' Corridor Architecture";
const SITE_URL = "https://dacorridor.com";

const setMetaTag = (selector, attribute, attributeValue, content) => {
  if (!content) return;
  let element = document.querySelector(`meta[${selector}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(selector, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setLinkTag = (rel, href) => {
  if (!href) return;
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const setJsonLd = (schemaData) => {
  let script = document.querySelector('script[data-seo-jsonld="true"]');
  if (!schemaData) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo-jsonld', 'true');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaData);
};

const SEO = ({
  title,
  description,
  keywords,
  image,
  path = '',
  type = 'website',
  author = "Da' Corridor Architecture Studio",
  robots = 'index, follow, max-image-preview:large',
  schema = null,
}) => {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDesc = description || DEFAULT_DESCRIPTION;
  const pageKeywords = keywords || DEFAULT_KEYWORDS;
  const pageImage = image || DEFAULT_IMAGE;
  const canonicalUrl = `${SITE_URL}${path}`;

  useEffect(() => {
    // 1. Page Title
    document.title = pageTitle;

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', pageDesc);
    setMetaTag('name', 'keywords', pageKeywords);
    setMetaTag('name', 'author', author);
    setMetaTag('name', 'robots', robots);

    // 3. Canonical Link
    setLinkTag('canonical', canonicalUrl);

    // 4. Open Graph Meta Tags
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDesc);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', pageImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', SITE_NAME);

    // 5. Twitter Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDesc);
    setMetaTag('name', 'twitter:image', pageImage);

    // 6. JSON-LD Structured Data
    setJsonLd(schema);
  }, [pageTitle, pageDesc, pageKeywords, pageImage, canonicalUrl, type, author, robots, schema]);

  return null;
};

export default SEO;
