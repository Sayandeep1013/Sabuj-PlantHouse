/* ------------------------------------------------------------------
   Mock catalogue. Shapes here are the contract the backend should
   return (see README.md). `image` is optional: when a product has an
   image URL it is shown; otherwise the illustrated `art` spec is drawn.
------------------------------------------------------------------- */
window.MOCK = {};

MOCK.categories = [
  { id: "indoor",     name: "Indoor Plants",     blurb: "Low-fuss greens for flats",      art: { type: "monstera", leaf: "#2F7A45" } },
  { id: "flowering",  name: "Flowering",         blurb: "Joba, beli, rajnigandha & more",  art: { type: "bush", leaf: "#3C7A3E", flower: "#D9342B", style: "five" } },
  { id: "succulents", name: "Succulents & Cacti", blurb: "Thrive on a sunny sill",         art: { type: "cactus", leaf: "#5E9A5A", flower: "#E6789A" } },
  { id: "air",        name: "Air Purifiers",     blurb: "NASA-listed cleaners",            art: { type: "snake", leaf: "#3E6E3F" } },
  { id: "puja",       name: "Puja & Herbal",     blurb: "Tulsi, curry patta, aloe",        art: { type: "herb", leaf: "#3F7B3A", flower: "#7B5AA6" } },
  { id: "bonsai",     name: "Bonsai",            blurb: "Living sculpture",                art: { type: "bonsai", leaf: "#4C8A45" } },
  { id: "balcony",    name: "Balcony & Outdoor", blurb: "Sun-lovers for the barandah",     art: { type: "bush", leaf: "#3C7A3E", flower: "#C83E8C", style: "bract" } },
  { id: "planters",   name: "Pots & Planters",   blurb: "Terracotta to glazed ceramic",    art: { type: "planter", pot: "mustard" } },
  { id: "care",       name: "Soil & Care",       blurb: "Mixes, manure, food",             art: { type: "bag" } },
  { id: "seeds",      name: "Seeds & Bulbs",     blurb: "Grow from scratch",               art: { type: "packet", flower: "#E8A33A" } }
];

MOCK.spaces = [
  { id: "balcony",  name: "Balcony",      note: "4–6 hrs of sun" },
  { id: "living",   name: "Living room",  note: "Bright, indirect" },
  { id: "bedroom",  name: "Bedroom",      note: "Calm, air-cleaning" },
  { id: "office",   name: "Work desk",    note: "Low light, low water" },
  { id: "puja",     name: "Thakur ghar",  note: "Sacred & fragrant" },
  { id: "kitchen",  name: "Kitchen sill", note: "Herbs you'll use" }
];

MOCK.seasons = [
  { id: "grishma", name: "Grishma", en: "Summer",  months: [2, 3, 4],  note: "Heat-proof plants that shrug off 40°C afternoons." },
  { id: "borsha",  name: "Borsha",  en: "Monsoon", months: [5, 6, 7],  note: "Planting season — everything roots fast in the rain." },
  { id: "sharat",  name: "Sharat",  en: "Pujo season", months: [8, 9], note: "Joba for Ma Kali, shiuli for the mornings, colour for the pandal." },
  { id: "sheet",   name: "Sheet",   en: "Winter",  months: [10, 11, 0, 1], note: "Kolkata's flower season — marigold, dahlia, petunia." }
];

MOCK.products = [
  { id: "p01", slug: "money-plant-golden", name: "Golden Money Plant", local: "মানি প্ল্যান্ট", categories: ["indoor", "air"], price: 249, mrp: 349, rating: 4.7, reviews: 2140,
    light: "low", water: "medium", care: "easy", pet: false, spaces: ["living", "bedroom", "office"], seasons: ["borsha", "sharat", "sheet", "grishma"], tags: ["bestseller"],
    short: "The plant every Kolkata flat starts with. Trails beautifully, roots in water.", art: { type: "pothos", leaf: "#4F8F3A", variegate: "#D8D06A", pot: "white" } },
  { id: "p02", slug: "snake-plant-laurentii", name: "Snake Plant Laurentii", local: "স্নেক প্ল্যান্ট", categories: ["indoor", "air"], price: 399, mrp: 549, rating: 4.8, reviews: 1630,
    light: "low", water: "low", care: "easy", pet: false, spaces: ["bedroom", "office", "living"], seasons: ["grishma", "borsha", "sharat", "sheet"], tags: ["bestseller"],
    short: "Releases oxygen at night. Forgives a forgotten fortnight of watering.", art: { type: "snake", leaf: "#3E6E3F", pot: "black" } },
  { id: "p03", slug: "monstera-deliciosa", name: "Monstera Deliciosa", local: "মনস্টেরা", categories: ["indoor"], price: 899, mrp: 1199, rating: 4.6, reviews: 712,
    light: "medium", water: "medium", care: "moderate", pet: false, spaces: ["living"], seasons: ["borsha", "sharat"], tags: ["new"],
    short: "Big split leaves, big personality. Loves Kolkata humidity.", art: { type: "monstera", leaf: "#2F7A45", pot: "white" } },
  { id: "p04", slug: "areca-palm", name: "Areca Palm", local: "সুপারি পাম", categories: ["indoor", "air"], price: 549, mrp: 799, rating: 4.5, reviews: 980,
    light: "medium", water: "medium", care: "easy", pet: true, spaces: ["living", "office"], seasons: ["borsha", "sharat", "grishma"], tags: ["bestseller"],
    short: "Feathery fronds and a natural humidifier for AC rooms.", art: { type: "palm", leaf: "#5C9A43", pot: "terracotta" } },
  { id: "p05", slug: "peace-lily", name: "Peace Lily", local: "পিস লিলি", categories: ["indoor", "air", "flowering"], price: 449, mrp: 599, rating: 4.6, reviews: 860,
    light: "low", water: "high", care: "easy", pet: false, spaces: ["bedroom", "living", "office"], seasons: ["borsha", "sharat", "sheet"], tags: [],
    short: "White blooms in low light. Droops dramatically when thirsty — then bounces back.", art: { type: "lily", leaf: "#2E6B3C", pot: "sage" } },
  { id: "p06", slug: "zz-plant", name: "ZZ Plant", local: "জেডজেড প্ল্যান্ট", categories: ["indoor", "air"], price: 499, mrp: 699, rating: 4.7, reviews: 1104,
    light: "low", water: "low", care: "easy", pet: false, spaces: ["office", "bedroom"], seasons: ["grishma", "borsha", "sharat", "sheet"], tags: ["bestseller"],
    short: "Glossy, almost-unkillable. The desk plant for people who travel.", art: { type: "zz", leaf: "#2F6B33", pot: "mustard" } },
  { id: "p07", slug: "rubber-plant-burgundy", name: "Rubber Plant Burgundy", local: "রাবার গাছ", categories: ["indoor", "air"], price: 599, mrp: 799, rating: 4.5, reviews: 433,
    light: "medium", water: "medium", care: "easy", pet: false, spaces: ["living"], seasons: ["borsha", "sharat"], tags: [],
    short: "Deep wine-green leaves that shine like lacquer.", art: { type: "rubber", leaf: "#3A2F33", pot: "white" } },
  { id: "p08", slug: "boston-fern", name: "Boston Fern", local: "ফার্ন", categories: ["indoor", "balcony"], price: 349, mrp: 449, rating: 4.3, reviews: 389,
    light: "medium", water: "high", care: "moderate", pet: true, spaces: ["balcony", "living"], seasons: ["borsha", "sharat"], tags: [],
    short: "Lush, feathery and pet-safe. Born for a shaded verandah.", art: { type: "fern", leaf: "#6BA544", pot: "terracotta" } },
  { id: "p09", slug: "spider-plant", name: "Spider Plant", local: "স্পাইডার প্ল্যান্ট", categories: ["indoor", "air"], price: 299, mrp: 399, rating: 4.6, reviews: 744,
    light: "medium", water: "medium", care: "easy", pet: true, spaces: ["kitchen", "bedroom", "office"], seasons: ["grishma", "borsha", "sharat", "sheet"], tags: [],
    short: "Arching striped leaves and baby plantlets to share with neighbours.", art: { type: "grass", leaf: "#5A9A45", pot: "indigo" } },

  { id: "p10", slug: "hibiscus-red-joba", name: "Red Joba (Hibiscus)", local: "লাল জবা", categories: ["flowering", "balcony", "puja"], price: 299, mrp: 449, rating: 4.7, reviews: 1890,
    light: "bright", water: "high", care: "easy", pet: true, spaces: ["balcony", "puja"], seasons: ["sharat", "grishma", "borsha"], tags: ["bestseller", "pujo"],
    short: "Ma Kali's flower. Blooms almost every morning in full sun.", art: { type: "bush", leaf: "#3C7A3E", flower: "#D9342B", style: "five", pot: "terracotta" } },
  { id: "p11", slug: "arabian-jasmine-beli", name: "Arabian Jasmine (Beli)", local: "বেলি ফুল", categories: ["flowering", "balcony", "puja"], price: 299, mrp: 399, rating: 4.6, reviews: 1240,
    light: "bright", water: "medium", care: "easy", pet: true, spaces: ["balcony", "puja"], seasons: ["grishma", "borsha"], tags: ["bestseller"],
    short: "The evening scent of a north Kolkata courtyard.", art: { type: "bush", leaf: "#3F8040", flower: "#FBFAF3", style: "star", pot: "terracotta" } },
  { id: "p12", slug: "rajnigandha-tuberose", name: "Rajnigandha (Tuberose)", local: "রজনীগন্ধা", categories: ["flowering", "balcony"], price: 249, mrp: 349, rating: 4.4, reviews: 512,
    light: "bright", water: "medium", care: "moderate", pet: true, spaces: ["balcony"], seasons: ["borsha", "sharat"], tags: [],
    short: "Tall stems of night-scented white flowers — wedding and puja favourite.", art: { type: "spike", leaf: "#4A8A3E", flower: "#FFFDF4", pot: "white" } },
  { id: "p13", slug: "aparajita-butterfly-pea", name: "Aparajita (Butterfly Pea)", local: "অপরাজিতা", categories: ["flowering", "puja", "balcony"], price: 199, mrp: 299, rating: 4.5, reviews: 680,
    light: "bright", water: "medium", care: "easy", pet: true, spaces: ["balcony", "puja"], seasons: ["borsha", "sharat"], tags: ["pujo"],
    short: "Electric-blue flowers for Durga puja and a stunning blue tea.", art: { type: "bush", leaf: "#3E7F3C", flower: "#2F4FC9", style: "pea", pot: "sage" } },
  { id: "p14", slug: "damascus-rose", name: "Damascus Rose", local: "গোলাপ", categories: ["flowering", "balcony"], price: 299, mrp: 399, rating: 4.3, reviews: 970,
    light: "bright", water: "medium", care: "moderate", pet: true, spaces: ["balcony"], seasons: ["sheet"], tags: [],
    short: "Old-world fragrance. Prune hard after each flush.", art: { type: "bush", leaf: "#2F6B37", flower: "#D2416A", style: "rose", pot: "terracotta" } },
  { id: "p15", slug: "marigold-genda", name: "Marigold (Genda)", local: "গাঁদা ফুল", categories: ["flowering", "balcony", "puja"], price: 149, mrp: 199, rating: 4.5, reviews: 820,
    light: "bright", water: "medium", care: "easy", pet: true, spaces: ["balcony", "puja"], seasons: ["sheet", "sharat"], tags: ["pujo"],
    short: "Pandal-orange pompoms from Pujo to Saraswati Puja.", art: { type: "bush", leaf: "#4C8A3B", flower: "#F08A1C", style: "pom", pot: "terracotta" } },
  { id: "p16", slug: "bougainvillea-magenta", name: "Bougainvillea Magenta", local: "বাগানবিলাস", categories: ["flowering", "balcony"], price: 349, mrp: 499, rating: 4.6, reviews: 455,
    light: "bright", water: "low", care: "easy", pet: true, spaces: ["balcony"], seasons: ["grishma", "sheet"], tags: [],
    short: "A riot of colour that loves heat and a little neglect.", art: { type: "bush", leaf: "#3C7A3E", flower: "#C83E8C", style: "bract", pot: "white" } },
  { id: "p17", slug: "shiuli-night-jasmine", name: "Shiuli (Night Jasmine)", local: "শিউলি", categories: ["flowering", "balcony", "puja"], price: 349, mrp: 449, rating: 4.8, reviews: 390,
    light: "bright", water: "medium", care: "easy", pet: true, spaces: ["balcony"], seasons: ["sharat"], tags: ["new", "pujo"],
    short: "Orange-stemmed stars that fall at dawn — the smell of Pujo arriving.", art: { type: "bush", leaf: "#3F7B3A", flower: "#FFFFFF", style: "shiuli", pot: "terracotta" } },

  { id: "p18", slug: "tulsi-krishna", name: "Krishna Tulsi", local: "কৃষ্ণ তুলসী", categories: ["puja", "air"], price: 149, mrp: 199, rating: 4.8, reviews: 2310,
    light: "bright", water: "medium", care: "easy", pet: true, spaces: ["puja", "balcony", "kitchen"], seasons: ["grishma", "borsha", "sharat", "sheet"], tags: ["bestseller"],
    short: "Purple-leafed holy basil for the tulsi mancha.", art: { type: "herb", leaf: "#4B4A3A", flower: "#7B5AA6", pot: "terracotta" } },
  { id: "p19", slug: "curry-leaf", name: "Curry Patta", local: "কারি পাতা", categories: ["puja"], price: 199, mrp: 249, rating: 4.4, reviews: 610,
    light: "bright", water: "medium", care: "easy", pet: true, spaces: ["kitchen", "balcony"], seasons: ["grishma", "borsha"], tags: [],
    short: "Fresh tadka leaves at arm's reach.", art: { type: "herb", leaf: "#3E7A35", flower: null, pot: "sage" } },
  { id: "p20", slug: "aloe-vera", name: "Aloe Vera", local: "ঘৃতকুমারী", categories: ["puja", "succulents", "air"], price: 199, mrp: 299, rating: 4.6, reviews: 1430,
    light: "bright", water: "low", care: "easy", pet: false, spaces: ["kitchen", "balcony"], seasons: ["grishma", "sheet"], tags: [],
    short: "Gel for sunburn, juice for the morning, zero fuss.", art: { type: "aloe", leaf: "#6F9E69", pot: "white" } },

  { id: "p21", slug: "echeveria-elegans", name: "Echeveria Elegans", local: "সাকুলেন্ট", categories: ["succulents"], price: 179, mrp: 249, rating: 4.4, reviews: 520,
    light: "bright", water: "low", care: "easy", pet: true, spaces: ["office", "kitchen"], seasons: ["sheet", "grishma"], tags: [],
    short: "A frosted-blue rosette that fits on any sill.", art: { type: "succulent", leaf: "#8DB4A8", tip: "#D98C9A", pot: "blush" } },
  { id: "p22", slug: "jade-plant", name: "Jade Plant", local: "জেড প্ল্যান্ট", categories: ["succulents", "bonsai"], price: 299, mrp: 399, rating: 4.7, reviews: 880,
    light: "bright", water: "low", care: "easy", pet: false, spaces: ["office", "living"], seasons: ["grishma", "sheet"], tags: ["bestseller"],
    short: "Said to bring prosperity — and it really is hard to kill.", art: { type: "jade", leaf: "#5E9A4D", pot: "indigo" } },
  { id: "p23", slug: "golden-barrel-cactus", name: "Golden Barrel Cactus", local: "ক্যাকটাস", categories: ["succulents"], price: 249, mrp: 349, rating: 4.5, reviews: 301,
    light: "bright", water: "low", care: "easy", pet: false, spaces: ["office", "balcony"], seasons: ["grishma"], tags: [],
    short: "A sun-loving globe with golden spines.", art: { type: "barrel", leaf: "#5E9A5A", pot: "mustard" } },
  { id: "p24", slug: "column-cactus-flowering", name: "Flowering Column Cactus", local: "ক্যাকটাস", categories: ["succulents"], price: 279, mrp: 399, rating: 4.4, reviews: 266,
    light: "bright", water: "low", care: "easy", pet: false, spaces: ["office", "balcony"], seasons: ["grishma", "sheet"], tags: ["new"],
    short: "Cartoon-perfect cactus with a pink crown in spring.", art: { type: "cactus", leaf: "#5E9A5A", flower: "#E6789A", pot: "terracotta" } },

  { id: "p25", slug: "ficus-bonsai-s-shape", name: "Ficus Bonsai · S-shape", local: "বনসাই", categories: ["bonsai", "indoor"], price: 1299, mrp: 1799, rating: 4.6, reviews: 214,
    light: "medium", water: "medium", care: "moderate", pet: false, spaces: ["living", "office"], seasons: ["borsha", "sharat", "sheet"], tags: [],
    short: "6-year-old ficus trained by our Garia growers.", art: { type: "bonsai", leaf: "#4C8A45", pot: "black" } },
  { id: "p26", slug: "lucky-bamboo-3-layer", name: "Lucky Bamboo · 3 Layer", local: "লাকি ব্যাম্বু", categories: ["indoor", "bonsai"], price: 399, mrp: 549, rating: 4.5, reviews: 1010,
    light: "low", water: "high", care: "easy", pet: false, spaces: ["office", "living"], seasons: ["grishma", "borsha", "sharat", "sheet"], tags: ["bestseller"],
    short: "Grows in water. A classic Vastu gift for new homes.", art: { type: "bamboo", leaf: "#5FA54A" } },
  { id: "p27", slug: "croton-petra", name: "Croton Petra", local: "পাতাবাহার", categories: ["balcony", "indoor"], price: 249, mrp: 349, rating: 4.4, reviews: 488,
    light: "bright", water: "medium", care: "easy", pet: false, spaces: ["balcony", "living"], seasons: ["grishma", "borsha", "sharat"], tags: [],
    short: "Patabahar — leaves painted in yellow, red and green.", art: { type: "croton", leaf: "#2F6B37", pot: "white" } },

  { id: "p28", slug: "terracotta-classic-pot-set", name: "Classic Terracotta Set of 3", local: "মাটির টব", categories: ["planters"], price: 449, mrp: 649, rating: 4.6, reviews: 370,
    light: null, water: null, care: null, pet: null, spaces: ["balcony"], seasons: [], tags: [], noVariants: true,
    short: "Hand-thrown in Krishnanagar. Breathable, honest clay.", art: { type: "planter", pot: "terracotta" } },
  { id: "p29", slug: "glazed-ceramic-planter", name: "Glazed Ceramic Planter", local: "সিরামিক টব", categories: ["planters"], price: 599, mrp: 799, rating: 4.5, reviews: 210,
    light: null, water: null, care: null, pet: null, spaces: ["living"], seasons: [], tags: ["new"], noVariants: true,
    short: "Indigo glaze with a drainage hole and saucer.", art: { type: "planter", pot: "indigo", pattern: "dots" } },
  { id: "p30", slug: "sabuj-potting-mix", name: "Sabuj Potting Mix · 5 kg", local: "মাটি", categories: ["care"], price: 299, mrp: 399, rating: 4.7, reviews: 905,
    light: null, water: null, care: null, pet: null, spaces: [], seasons: ["borsha"], tags: ["bestseller"], noVariants: true,
    short: "Garden soil, cocopeat, vermicompost and neem cake — mixed for Bengal.", art: { type: "bag", label: "MIX" } },
  { id: "p31", slug: "vermicompost", name: "Vermicompost · 2 kg", local: "কেঁচো সার", categories: ["care"], price: 149, mrp: 199, rating: 4.6, reviews: 640,
    light: null, water: null, care: null, pet: null, spaces: [], seasons: [], tags: [], noVariants: true,
    short: "Slow, gentle food. Top-dress monthly.", art: { type: "bag", label: "FOOD", tint: "#7A5A3C" } },
  { id: "p32", slug: "winter-flower-seed-kit", name: "Winter Flower Seed Kit", local: "বীজ", categories: ["seeds"], price: 199, mrp: 299, rating: 4.3, reviews: 330,
    light: null, water: null, care: null, pet: null, spaces: ["balcony"], seasons: ["sheet", "sharat"], tags: ["new"], noVariants: true,
    short: "Marigold, petunia, dianthus, cosmos & zinnia. Sow in October.", art: { type: "packet", flower: "#E8A33A" } },
  { id: "p33", slug: "microgreens-seed-kit", name: "Microgreens Kit", local: "বীজ", categories: ["seeds"], price: 249, mrp: 349, rating: 4.4, reviews: 188,
    light: null, water: null, care: null, pet: null, spaces: ["kitchen"], seasons: [], tags: [], noVariants: true,
    short: "Mustard, radish, methi and sunflower greens in 10 days.", art: { type: "packet", flower: "#7DB34A" } }
];

MOCK.testimonials = [
  { name: "Ritwika S.", area: "Salt Lake", rating: 5, text: "The joba plant came with two buds and flowered the next morning. Packed better than my phone was." },
  { name: "Arnab M.", area: "Behala", rating: 5, text: "Their gardener redid our 4×10 balcony in a Sunday afternoon. My mother now spends her evenings out there." },
  { name: "Farheen K.", area: "Park Circus", rating: 4, text: "My monstera was looking sad — the WhatsApp plant doctor diagnosed overwatering from one photo." },
  { name: "Debanjan R.", area: "New Town", rating: 5, text: "Ordered 40 snake plants for office Diwali gifting. Delivered in branded kraft sleeves, on time." },
  { name: "Sudeshna P.", area: "Howrah", rating: 5, text: "Prices beat Gariahat haat and the plants are actually bigger. Shiuli is in full bloom for Pujo." }
];

MOCK.areas = [
  ["Salt Lake", "700091"], ["New Town", "700156"], ["Behala", "700034"], ["Garia", "700084"], ["Jadavpur", "700032"],
  ["Ballygunge", "700019"], ["Park Street", "700016"], ["Dum Dum", "700028"], ["Shyambazar", "700004"], ["Tollygunge", "700033"],
  ["Lake Town", "700089"], ["Howrah", "711101"], ["Barasat", "700124"], ["Rajarhat", "700135"], ["Alipore", "700027"], ["Kasba", "700042"]
];

MOCK.coupons = {
  SABUJ10: { type: "pct", value: 10, min: 0, label: "10% off your order" },
  PUJO150: { type: "flat", value: 150, min: 999, label: "₹150 off above ₹999" },
  FIRSTLEAF: { type: "pct", value: 15, min: 499, label: "15% off your first order" }
};

MOCK.services = [
  { id: "balcony", name: "Balcony makeover", price: "from ₹2,499", icon: "sun", text: "Design, plants, pots and install in one visit. You choose a mood board, we bring the garden." },
  { id: "maintenance", name: "Monthly care visits", price: "₹699 / visit", icon: "scissors", text: "Pruning, feeding, repotting and pest checks by a trained mali, every month." },
  { id: "doctor", name: "Plant doctor", price: "Free on WhatsApp", icon: "stethoscope", text: "Send a photo, get a diagnosis and a care plan within a couple of hours." },
  { id: "corporate", name: "Corporate & gifting", price: "Custom quote", icon: "gift", text: "Office greening, Diwali & Pujo hampers, GST invoices and branded sleeves." },
  { id: "terrace", name: "Terrace kitchen garden", price: "from ₹5,999", icon: "carrot", text: "Raised beds, drip lines and seasonal veg — lau, begun, lonka, and more." },
  { id: "holiday", name: "Holiday plant-sitting", price: "₹149 / day", icon: "plane", text: "Going home for Pujo? We water and check in while you're away." }
];

MOCK.faqs = [
  ["Do you deliver across Kolkata?", "Yes — all 7000xx pincodes plus Howrah, Barasat and Rajarhat. Most South & Central Kolkata orders placed before 1pm arrive the same day; everything else arrives next day."],
  ["What if my plant arrives damaged?", "Send us a photo within 48 hours and we replace it free — no return needed. Every plant also carries a 30-day healthy-plant promise."],
  ["Are the plants in plastic nursery bags?", "No. Every plant ships in the pot you choose (terracotta by default), already potted in our Bengal-tuned soil mix."],
  ["Can I pay cash on delivery?", "Yes, COD is available inside Kolkata. UPI, cards and netbanking work everywhere."],
  ["Do you ship outside West Bengal?", "Seeds, pots, soil and hardy plants ship pan-India in 4–6 days. Large and flowering plants are Kolkata-only so they arrive in good shape."],
  ["Which plants are safe for cats and dogs?", "Use the pet-friendly filter in the shop. Areca palm, Boston fern, spider plant, tulsi and most flowering shrubs are safe."]
];

/* Attach downloaded photos (see image-credits.js). A backend would send `image` directly. */
MOCK.products.forEach(p => { const c = window.IMAGE_CREDITS && window.IMAGE_CREDITS[p.id]; if (c) p.image = c.src; });
