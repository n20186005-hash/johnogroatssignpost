// ---------------------------------------------------------------------------
// Centralized SEO entity binding configuration for johnogroatssignpost.com
// ---------------------------------------------------------------------------

export const DOMAIN_NAME = 'johnogroatssignpost.com';
export const ORIGIN = `https://${DOMAIN_NAME}`;

// Entity variables (see single-attraction SEO binding spec)
export const ATTRACTION_FULL_NAME = "John o' Groats Signpost";
export const ATTRACTION_SHORT_NAME = "John o' Groats";
export const CITY_NAME = 'Wick';
export const STATE_PROVINCE = 'Highland';
export const COUNTRY_NAME = 'United Kingdom';
export const COUNTRY_CODE_2LETTER = 'GB';
export const POSTAL_CODE = 'KW1 4YR';
export const LATITUDE = 58.6440376;
export const LONGITUDE = -3.0700246;

// Official Google Maps listing facts (latest verified)
export const GOOGLE_RATING = 4.5;
export const GOOGLE_REVIEW_COUNT = 8228;
export const GOOGLE_PLUS_CODE = 'JWVH+JX Wick, United Kingdom';

// Google Maps
export const MAPS_SHARE_URL = 'https://maps.app.goo.gl/PvPKgVs1QyTnjNFu8';
export const MAPS_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3549.400895043979!2d-3.0700246000000004!3d58.6440376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x489adf02ce749647%3A0x576c07fbdb4d58f5!2sJohn%20o%E2%80%99%20Groats%20Signpost!5e1!3m2!1sen!2s!4v1788713935040!5m2!1sen!2s';

// Nearby landmarks (semantic cluster)
export const NEARBY_LANDMARK_1 = 'Duncansby Head';
export const NEARBY_LANDMARK_2 = 'Orkney Islands';

// Official / authoritative tourism links
export const GOVT_TOURISM_URL =
  'https://www.visitscotland.com/places-to-go/highlands/john-o-groats';

// Images
export const HERO_IMG_PATH = '/gallery/john-o-groats-signpost-21.jpg';
export const HERO_IMG_URL = `${ORIGIN}/gallery/john-o-groats-signpost-21.jpg`;

// GA4 measurement id
export const GA4_ID = 'G-HXM22WWPKP';

// Full address used in structured data
export const ATTRACTION_ADDRESS = `${ATTRACTION_FULL_NAME}, ${ATTRACTION_SHORT_NAME}, ${CITY_NAME} ${POSTAL_CODE}, ${COUNTRY_NAME}`;

/**
 * Schema.org TouristAttraction JSON-LD node. Rendered in <head> so Google can
 * anchor the geographic entity precisely in the Knowledge Graph.
 */
export function touristAttractionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    '@id': `${ORIGIN}/#attraction`,
    name: ATTRACTION_FULL_NAME,
    alternateName: [ATTRACTION_SHORT_NAME, `${CITY_NAME} ${ATTRACTION_FULL_NAME}`],
    description: `Comprehensive visitor guide to ${ATTRACTION_FULL_NAME} in ${CITY_NAME}, ${STATE_PROVINCE}, ${COUNTRY_NAME}.`,
    url: ORIGIN,
    image: [HERO_IMG_URL],
    isAccessibleForFree: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${ATTRACTION_FULL_NAME}, ${ATTRACTION_SHORT_NAME}`,
      addressLocality: CITY_NAME,
      addressRegion: STATE_PROVINCE,
      postalCode: POSTAL_CODE,
      addressCountry: COUNTRY_CODE_2LETTER,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: LATITUDE,
      longitude: LONGITUDE,
    },
    hasMap: MAPS_EMBED_SRC,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: GOOGLE_RATING,
      bestRating: 5,
      reviewCount: GOOGLE_REVIEW_COUNT,
    },
    sameAs: [MAPS_SHARE_URL, GOVT_TOURISM_URL],
  };
}

/**
 * FAQPage JSON-LD node. Must mirror the visible FAQ section content.
 */
export function faqPageSchema(faqItems: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}
