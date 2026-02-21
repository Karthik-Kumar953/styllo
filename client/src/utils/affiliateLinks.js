const AFFILIATE_TAG = "stylo0fe-21";
const AMAZON_BASE = "https://www.amazon.in/s";

/**
 * Generate a single Amazon affiliate search link
 */
export function generateAffiliateLink(skinTone, gender, itemType) {
  const keywords = [skinTone, gender, itemType]
    .filter(Boolean)
    .map((s) => s.toLowerCase())
    .join(" ");

  const params = new URLSearchParams({ k: keywords, tag: AFFILIATE_TAG });
  return `${AMAZON_BASE}?${params.toString()}`;
}

/**
 * Add affiliate shopping links to outfit suggestions (ResultsView)
 */
export function generateShoppingLinks(skinTone, gender, outfitSuggestions = []) {
  return outfitSuggestions.map((outfit) => ({
    ...outfit,
    links: (outfit.items || []).map((item) => ({
      item,
      url: generateAffiliateLink(skinTone, gender, item),
    })),
  }));
}

/**
 * Generate affiliate link from a search query string (used by Decode Outfit)
 */
export function generateAffiliateLinkFromQuery(searchQuery) {
  if (!searchQuery) return null;
  const params = new URLSearchParams({ k: searchQuery, tag: AFFILIATE_TAG });
  return `${AMAZON_BASE}?${params.toString()}`;
}

/**
 * Generate affiliate links for trend example pieces (used by Trend Radar)
 */
export function generateTrendAffiliateLink(trendName, piece) {
  const keywords = [trendName, piece].filter(Boolean).join(" ");
  const params = new URLSearchParams({ k: keywords, tag: AFFILIATE_TAG });
  return `${AMAZON_BASE}?${params.toString()}`;
}
