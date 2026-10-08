/* ------------------------------------------------------------------
   Site configuration.
   To connect a backend: set USE_MOCK = false and point API_BASE at it.
   Every data call goes through assets/js/api.js — see README.md for
   the endpoint contract.
------------------------------------------------------------------- */
window.SITE = {
  brand: "Sabuj",
  brandSub: "Plant House",
  tagline: "Kolkata's neighbourhood plant house",
  USE_MOCK: true,
  API_BASE: "/api",
  currency: "₹",
  freeDeliveryAbove: 499,
  deliveryFee: 49,
  phone: "+91 90000 00000",
  whatsapp: "919000000000",
  email: "hello@sabuj.example",
  address: "Plot 12, Nursery Lane, Garia, Kolkata 700084",
  hours: "Open daily · 7am – 8pm",
  social: { instagram: "#", facebook: "#", youtube: "#" },

  potColors: {
    terracotta: { name: "Terracotta", hex: "#C2653F", add: 0 },
    white:      { name: "Chalk white", hex: "#ECE8DF", add: 149 },
    black:      { name: "Charcoal",    hex: "#2E2F2C", add: 149 },
    sage:       { name: "Sage",        hex: "#9DB8A0", add: 149 },
    mustard:    { name: "Mustard",     hex: "#D6A13F", add: 149 },
    indigo:     { name: "Indigo",      hex: "#3F5F86", add: 179 },
    blush:      { name: "Blush",       hex: "#E2B4A6", add: 179 }
  },

  sizes: [
    { id: "s", label: "Small",  note: "4\" pot · 20–30 cm", add: 0 },
    { id: "m", label: "Medium", note: "6\" pot · 35–50 cm", add: 180 },
    { id: "l", label: "Large",  note: "8\" pot · 60–80 cm", add: 450 }
  ]
};
