export const products = [
  {
    id: 1,
    name: "Radiant Glow Serum",
    price: "$48",
    priceValue: 48,
    category: "Skincare",
    image: "/organic-vitamin-c-serum-bottle-with-dropper.jpg",
    description: "Vitamin C brightening serum with organic botanicals for radiant skin",
    longDescription:
      "Our signature Radiant Glow Serum is formulated with 20% Vitamin C, organic rosehip oil, and botanical hyaluronic acid. This powerful yet gentle serum helps brighten skin tone, reduce dark spots, and promote a healthy, radiant complexion. Perfect for daily use on all skin types.",
    ingredients: [
      "Vitamin C (20%)",
      "Organic Rosehip Oil",
      "Botanical Hyaluronic Acid",
      "Aloe Vera Extract",
      "Green Tea Extract",
    ],
    benefits: [
      "Brightens skin tone",
      "Reduces dark spots",
      "Boosts collagen production",
      "Provides antioxidant protection",
    ],
    howToUse: "Apply 2-3 drops to clean skin morning and evening. Follow with moisturizer and SPF during the day.",
  },
  {
    id: 2,
    name: "Nourishing Face Cream",
    price: "$36",
    priceValue: 36,
    category: "Skincare",
    image: "/organic-face-moisturizer-jar-with-natural-ingredie.jpg",
    description: "Rich moisturizer with shea butter and botanical oils for deep hydration",
    longDescription:
      "This luxurious face cream combines organic shea butter with nourishing botanical oils to provide intense hydration and restore skin's natural barrier. Enriched with ceramides and peptides for anti-aging benefits.",
    ingredients: ["Organic Shea Butter", "Jojoba Oil", "Ceramides", "Peptides", "Vitamin E"],
    benefits: ["Deep hydration", "Restores skin barrier", "Anti-aging properties", "Suitable for sensitive skin"],
    howToUse: "Apply to clean face and neck morning and evening. Massage gently until absorbed.",
  },
  {
    id: 3,
    name: "Gentle Cleansing Oil",
    price: "$32",
    priceValue: 32,
    category: "Skincare",
    image: "/organic-cleansing-oil-bottle-with-pump-dispenser.jpg",
    description: "Deep cleansing oil with organic jojoba and rosehip for makeup removal",
    longDescription:
      "A gentle yet effective cleansing oil that melts away makeup, sunscreen, and impurities without stripping the skin. Formulated with organic jojoba and rosehip oils to nourish while cleansing.",
    ingredients: ["Organic Jojoba Oil", "Rosehip Oil", "Sunflower Oil", "Vitamin E", "Chamomile Extract"],
    benefits: [
      "Removes makeup and impurities",
      "Nourishes while cleansing",
      "Suitable for all skin types",
      "Non-comedogenic",
    ],
    howToUse: "Apply to dry skin, massage gently, then rinse with warm water or remove with a damp cloth.",
  },
  {
    id: 4,
    name: "Revitalizing Hair Mask",
    price: "$42",
    priceValue: 42,
    category: "Haircare",
    image: "/organic-hair-mask-jar-with-natural-ingredients.jpg",
    description: "Intensive treatment mask with argan oil and botanical extracts",
    longDescription:
      "Transform dry, damaged hair with this intensive treatment mask. Enriched with organic argan oil, keratin proteins, and botanical extracts to restore shine, strength, and manageability.",
    ingredients: ["Organic Argan Oil", "Keratin Proteins", "Coconut Oil", "Shea Butter", "Botanical Extracts"],
    benefits: ["Repairs damaged hair", "Adds shine and softness", "Strengthens hair fibers", "Reduces frizz"],
    howToUse: "Apply to damp hair from mid-length to ends. Leave for 10-15 minutes, then rinse thoroughly.",
  },
  {
    id: 5,
    name: "Hydrating Body Lotion",
    price: "$28",
    priceValue: 28,
    category: "Body Care",
    image: "/organic-body-lotion-bottle-with-pump.jpg",
    description: "Lightweight lotion with organic aloe vera and coconut oil",
    longDescription:
      "A fast-absorbing body lotion that provides long-lasting hydration without feeling greasy. Formulated with organic aloe vera and coconut oil to soothe and nourish all skin types.",
    ingredients: ["Organic Aloe Vera", "Coconut Oil", "Shea Butter", "Vitamin E", "Lavender Extract"],
    benefits: ["Long-lasting hydration", "Fast absorption", "Soothes irritated skin", "Natural fragrance"],
    howToUse: "Apply to clean, dry skin all over the body. Use daily for best results.",
  },
  {
    id: 6,
    name: "Exfoliating Body Scrub",
    price: "$34",
    priceValue: 34,
    category: "Body Care",
    image: "/organic-body-scrub-jar-with-natural-exfoliants.jpg",
    description: "Gentle scrub with organic sugar and essential oils for smooth skin",
    longDescription:
      "Reveal silky smooth skin with this gentle exfoliating scrub. Made with organic sugar crystals and nourishing oils to remove dead skin cells while moisturizing.",
    ingredients: ["Organic Sugar", "Coconut Oil", "Sweet Almond Oil", "Essential Oils", "Vitamin E"],
    benefits: ["Gentle exfoliation", "Removes dead skin cells", "Moisturizes while scrubbing", "Improves skin texture"],
    howToUse:
      "Apply to damp skin in circular motions, focusing on rough areas. Rinse with warm water. Use 2-3 times per week.",
  },
]

export function getProductById(id: number) {
  return products.find((product) => product.id === id)
}
