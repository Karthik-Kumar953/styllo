const AFFILIATE_TAG = "stylo0fe-21";
const BASE_URL = "https://www.amazon.in/s";

export function generateAffiliateLink(skinTone, gender, itemType) {
  const keywords = [skinTone, gender, itemType]
    .filter(Boolean)
    .map((s) => s.toLowerCase())
    .join(" ");

  const params = new URLSearchParams({ k: keywords, tag: AFFILIATE_TAG });
  return `${BASE_URL}?${params.toString()}`;
}

export function generateShoppingLinks(skinTone, gender, outfitSuggestions = []) {
  return outfitSuggestions.map((outfit) => ({
    ...outfit,
    links: (outfit.items || []).map((item) => ({
      item,
      url: generateAffiliateLink(skinTone, gender, item),
    })),
  }));
}
