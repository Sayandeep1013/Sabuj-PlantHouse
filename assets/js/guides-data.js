/* ------------------------------------------------------------------
   Plant care guides (mock CMS content). A backend/CMS should return
   the same shape from GET /guides and GET /guides/:slug.
   Body blocks: ["h", text] · ["p", text] · ["tip", text] · ["list", [items]]
------------------------------------------------------------------- */
MOCK.guideTopics = [
  { id: "seasonal", name: "Seasonal" },
  { id: "flowering", name: "Flowering" },
  { id: "puja", name: "Puja & herbal" },
  { id: "beginners", name: "Beginners" }
];

MOCK.guides = [
  { slug: "monsoon-proof-balcony", title: "Monsoon-proofing your balcony garden", kicker: "Borsha", topic: "seasonal", mins: 5, date: "2026-06-12",
    art: { type: "fern", leaf: "#6BA544", pot: "terracotta" }, products: ["p08", "p30", "p04"],
    excerpt: "Four months of rain is a gift — if your pots can drain. Here's how to keep roots breathing from June to September.",
    body: [
      ["p", "Kolkata gets most of its 1,600 mm of rain between June and September. Plants love the humidity, but waterlogged pots are the number one reason we get WhatsApp photos of yellowing leaves in July."],
      ["h", "Lift every pot off the floor"],
      ["p", "Balcony floors hold a film of water for hours after a shower. Put pots on pot feet, bricks or a simple wooden slat so water can escape from the drainage hole."],
      ["h", "Check the drainage hole — really check it"],
      ["p", "Soil and roots clog holes over time. Push a chopstick up through the hole before the rains start. If water still sits on top after watering, repot into a fresh, airy mix."],
      ["tip", "Skip your watering routine entirely during rainy weeks. Stick a finger 2 cm into the soil and only water if it's dry."],
      ["h", "Watch for the monsoon trio"],
      ["list", ["Fungus gnats — tiny flies around wet soil. Let the top layer dry and sprinkle neem cake.", "Root rot — sudden wilting in wet soil. Unpot, trim black roots, repot dry.", "Mealybugs — white cotton on stems. Wipe with neem-oil soap every three days."]],
      ["p", "Do this and monsoon becomes your best growing season — it's when cuttings root fastest and new leaves arrive every week."]
    ] },
  { slug: "joba-that-flowers-daily", title: "Growing a joba that flowers every morning", kicker: "Flowering", topic: "flowering", mins: 4, date: "2026-09-02",
    art: { type: "bush", leaf: "#3C7A3E", flower: "#D9342B", style: "five", pot: "terracotta" }, products: ["p10", "p31", "p30"],
    excerpt: "Sun, food and a hard prune — the three things standing between you and a red hibiscus for Ma Kali every day.",
    body: [
      ["p", "Hibiscus rosa-sinensis — our joba — is one of the easiest flowering shrubs in Bengal, yet many plants sulk with leaves and no buds. It almost always comes down to light and feeding."],
      ["h", "Give it the sunniest spot you have"],
      ["p", "Joba needs at least five hours of direct sun. A south or west balcony is ideal; an east window works but expect fewer flowers."],
      ["h", "Feed for flowers, not leaves"],
      ["p", "Top-dress a handful of vermicompost every month from February to October, and add a pinch of potash (or banana-peel water) every fortnight once buds appear."],
      ["tip", "Buds dropping before they open? That's usually a sudden dry-out. In summer, water deeply the moment the top soil is dry."],
      ["h", "Prune after the winter rest"],
      ["p", "In late February, cut every branch back by a third, just above a leaf. Flowers form on new growth, so a hard prune means a fuller bush and more blooms by Pujo."]
    ] },
  { slug: "tulsi-through-the-seasons", title: "Tulsi care through Kolkata's seasons", kicker: "Puja & herbal", topic: "puja", mins: 4, date: "2026-08-20",
    art: { type: "herb", leaf: "#4B4A3A", flower: "#7B5AA6", pot: "terracotta" }, products: ["p18", "p19", "p20"],
    excerpt: "Why the tulsi on the mancha dries up every December — and the small habits that keep it bushy all year.",
    body: [
      ["p", "Tulsi is a warm-season herb that grows like mad in summer and monsoon, then struggles through cold, dry winter mornings. A few seasonal adjustments make all the difference."],
      ["h", "Pinch the flowers"],
      ["p", "Once tulsi starts flowering (manjari), it puts its energy into seeds and the stems turn woody. Pinch flower spikes off every week to keep it leafy. Leave a couple to seed if you want new plants next monsoon."],
      ["h", "Winter: less water, more sun"],
      ["p", "From November to February, water only when the soil is dry an inch down, and move the pot to the sunniest spot. Cold, wet roots are what kill tulsi in winter."],
      ["tip", "Harvest from the top and never strip the lower leaves. Taking the tips makes the plant branch out."],
      ["h", "Summer: shade at noon"],
      ["p", "In April and May, a little afternoon shade stops the leaves scorching. Water in the morning, never at noon."]
    ] },
  { slug: "low-light-flat-plants", title: "Plants that survive a north-facing flat", kicker: "Beginners", topic: "beginners", mins: 3, date: "2026-07-08",
    art: { type: "zz", leaf: "#2F6B33", pot: "mustard" }, products: ["p06", "p02", "p01", "p05"],
    excerpt: "No direct sun? No problem. Five plants that cope with dim corners, AC rooms and forgetful owners.",
    body: [
      ["p", "Plenty of Kolkata flats — especially in older buildings in north and central Kolkata — get very little direct light. These plants are built for exactly that."],
      ["list", ["ZZ plant — stores water in its roots and shrugs off three weeks without water.", "Snake plant — happy in a corner, cleans the air at night.", "Money plant — trails from a shelf and roots in a bottle of water.", "Peace lily — flowers even in shade and droops to tell you it's thirsty.", "Lucky bamboo — grows in water, no soil required."]],
      ["h", "The one rule: water less"],
      ["p", "Low light means slow growth, and slow growth means the plant drinks less. Most low-light casualties are drowned, not starved of light."],
      ["tip", "Wipe the leaves with a damp cloth once a month. Dust blocks the little light they do get."]
    ] },
  { slug: "winter-flower-calendar", title: "Sow in October, bloom by Saraswati Puja", kicker: "Sheet", topic: "seasonal", mins: 5, date: "2026-10-01",
    art: { type: "bush", leaf: "#4C8A3B", flower: "#F08A1C", style: "pom", pot: "terracotta" }, products: ["p32", "p15", "p30"],
    excerpt: "A month-by-month calendar for Kolkata's winter flower season — marigold, petunia, dianthus and friends.",
    body: [
      ["p", "Bengal's winter is short but glorious for flowers. The trick is starting early, while October is still warm enough for seeds to germinate fast."],
      ["h", "October: sow"],
      ["p", "Sow marigold, cosmos and zinnia directly in pots; start petunia and dianthus in a seed tray of fine cocopeat mix. Keep them moist and in bright shade."],
      ["h", "November: transplant"],
      ["p", "When seedlings have four true leaves, move them into their final pots with a handful of vermicompost. Give them full sun from now on."],
      ["h", "December to February: feed and deadhead"],
      ["p", "Feed every two weeks and pinch off faded flowers so the plant keeps making new ones. You'll have colour from mid-December right through Saraswati Puja."],
      ["tip", "Short on time? Buy seedlings in November instead — you lose nothing but a little fun."]
    ] },
  { slug: "read-the-leaves", title: "Overwatering or underwatering? Read the leaves", kicker: "Plant doctor", topic: "beginners", mins: 3, date: "2026-05-15",
    art: { type: "pothos", leaf: "#4F8F3A", variegate: "#D8D06A", pot: "white" }, products: ["p30", "p01", "p09"],
    excerpt: "Yellow, brown, crispy or soft — what each symptom actually means, from the inbox of our WhatsApp plant doctor.",
    body: [
      ["p", "Both problems can look alike at first, which is why so many plants get more water when they actually need less. Here's how to tell them apart."],
      ["h", "Too much water"],
      ["list", ["Lower leaves turn yellow and soft", "Soil stays wet for days and may smell sour", "Stems feel mushy at the base", "Tiny flies hover over the soil"]],
      ["h", "Too little water"],
      ["list", ["Leaf edges turn brown and crispy", "The whole plant droops but perks up within hours of watering", "Soil pulls away from the sides of the pot", "The pot feels very light when lifted"]],
      ["tip", "The finger test beats any schedule: water when the top 2 cm of soil is dry, and always until water runs out of the bottom."],
      ["p", "Still unsure? Send a photo of the leaves and the soil to our plant doctor on WhatsApp. It's free."]
    ] }
];
