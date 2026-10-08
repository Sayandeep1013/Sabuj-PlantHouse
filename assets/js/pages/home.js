(async function () {
  UI.init();
  const { $, $$, esc, card, icons, reveal, money } = UI;

  UI.leaves($("#leafFall"), 12);
  if (window.Hero3D) Hero3D.mount($("#heroStage"));

  const [cats, meta, testis] = await Promise.all([Api.listCategories(), Api.meta(), Api.testimonials()]);

  /* categories — illustrations as icons */
  $("#catGrid").innerHTML = cats.map(c => `<a class="tile" href="shop.html?category=${c.id}">
      <span class="go"><i data-lucide="arrow-right"></i></span>
      ${Art.render(c.art, { seed: c.id, pot: c.art.pot || "terracotta", label: c.name })}
      <h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p></a>`).join("");

  /* bestsellers */
  async function loadBest(cat) {
    const grid = $("#bestGrid");
    grid.innerHTML = UI.skeletons(8);
    const { items } = await Api.listProducts({ category: cat === "all" ? "" : cat, sort: "popular", limit: 8 });
    grid.innerHTML = items.map(card).join("");
    grid.classList.add("stagger"); grid.classList.remove("in");
    icons(); reveal(grid.parentElement);
  }
  $("#bestTabs").addEventListener("click", e => {
    const b = e.target.closest("[data-best]"); if (!b) return;
    $$("#bestTabs .chip").forEach(x => x.classList.toggle("on", x === b));
    loadBest(b.dataset.best);
  });
  loadBest("all");

  /* seasons */
  let petals = "";
  for (let i = 0; i < 16; i++) petals += `<path transform="rotate(${i * 22.5} 100 100)" d="M100 32Q108 50 100 70Q92 50 100 32Z"/>`;
  $("#petals").innerHTML = petals;
  const month = new Date().getMonth();
  const current = meta.seasons.find(s => s.months.includes(month)) || meta.seasons[2];
  $("#seasonTabs").innerHTML = meta.seasons.map(s => `<button role="tab" data-season="${s.id}" aria-selected="${s.id === current.id}">${s.name}<small>${s.en}${s.id === current.id ? " · now" : ""}</small></button>`).join("");
  async function loadSeason(id) {
    const s = meta.seasons.find(x => x.id === id);
    $("#seasonName").textContent = s.id === current.id ? "this " + s.en.toLowerCase() : "in " + s.en.toLowerCase();
    $("#seasonNote").textContent = s.note;
    $$("#seasonTabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.season === id));
    const { items } = await Api.listProducts({ season: id, sort: "rating", limit: 8 });
    $("#seasonGrid").innerHTML = items.map(card).join("");
    icons();
  }
  $("#seasonTabs").addEventListener("click", e => { const b = e.target.closest("[data-season]"); if (b) loadSeason(b.dataset.season); });
  loadSeason(current.id);

  /* spaces */
  const spaceStyle = {
    balcony: ["#C2653F", "#E8A06A", "p10"], living: ["#2F6B3F", "#5C9A5E", "p03"], bedroom: ["#3F5F86", "#7A95B8", "p02"],
    office: ["#4A4A3C", "#7E7C62", "p06"], puja: ["#B8752A", "#E5B054", "p18"], kitchen: ["#5E7F3A", "#9DBA62", "p19"]
  };
  $("#spaces").innerHTML = meta.spaces.map(s => {
    const [a, b, pid] = spaceStyle[s.id];
    const p = MOCK.products.find(x => x.id === pid);
    return `<a class="space" href="shop.html?space=${s.id}" style="background:linear-gradient(160deg,${b},${a})">
      <div class="scene"><svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M50 20h100v110H50z" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="3"/><path d="M100 20v110M50 75h100" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
        <rect x="0" y="190" width="200" height="60" fill="rgba(0,0,0,.18)"/>
        <g transform="translate(40 66) scale(.6)">${Art.render(p.art, { seed: p.id }).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>
        <rect x="0" y="0" width="200" height="250" fill="url(#fade${s.id})"/><defs><linearGradient id="fade${s.id}" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
      </svg></div>
      <h3>${esc(s.name)}</h3><small>${esc(s.note)}</small></a>`;
  }).join("");

  /* quiz */
  const Q = [
    { key: "light", q: "How much light does the spot get?", opts: [["low", "cloud-sun", "Not much", "North-facing, or away from windows"], ["medium", "sun-dim", "Bright, no direct sun", "Near a window with curtains"], ["bright", "sun", "Hours of sun", "Balcony, terrace or south window"]] },
    { key: "care", q: "How much attention can you give?", opts: [["easy", "coffee", "Water when I remember", "Busy, travel a lot"], ["moderate", "calendar-check", "A weekly routine", "I enjoy a little ritual"]] },
    { key: "pet", q: "Any cats, dogs or curious toddlers?", opts: [["yes", "paw-print", "Yes", "Show only pet-safe plants"], ["no", "ban", "No", "Anything goes"]] },
    { key: "want", q: "What would make you happiest?", opts: [["air", "wind", "Cleaner air", "Purifiers for AC rooms"], ["flowers", "flower-2", "Flowers", "Colour & fragrance"], ["puja", "flame", "Puja & kitchen", "Tulsi, curry patta, joba"], ["any", "sparkles", "Surprise me", "Just make it green"]] }
  ];
  const ans = {};
  $("#quizArt").innerHTML = Art.render({ type: "lily", leaf: "#2E6B3C" }, { seed: "quiz", pot: "mustard" });
  $("#quizSteps").innerHTML = Q.map((s, i) => `<div class="quiz-step ${i === 0 ? "on" : ""}" data-step="${i}"><h3>${s.q}</h3><div class="opts">${s.opts.map(([v, ic, t, d]) => `<button class="opt" data-k="${s.key}" data-v="${v}"><span class="ic"><i data-lucide="${ic}"></i></span><b>${t}</b><small>${d}</small></button>`).join("")}</div></div>`).join("") +
    `<div class="quiz-step" data-step="${Q.length}"><h3>Your matches 🌿</h3><div class="quiz-results" id="quizRes"></div><div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" id="quizShop" href="shop.html">See all matches <i data-lucide="arrow-right"></i></a><button class="btn btn-ghost btn-sm" id="quizRestart"><i data-lucide="rotate-ccw"></i>Start over</button></div></div>`;
  function step(n) {
    $$(".quiz-step").forEach(s => s.classList.toggle("on", +s.dataset.step === n));
    $$("#quizProg i").forEach((b, i) => b.classList.toggle("on", i <= n));
  }
  $("#quizSteps").addEventListener("click", async e => {
    if (e.target.closest("#quizRestart")) { step(0); return; }
    const o = e.target.closest(".opt"); if (!o) return;
    ans[o.dataset.k] = o.dataset.v;
    const n = +o.closest(".quiz-step").dataset.step + 1;
    if (n < Q.length) return step(n);
    const lights = ans.light === "low" ? ["low"] : ans.light === "medium" ? ["low", "medium"] : ["medium", "bright"];
    const params = { light: lights, pet: ans.pet === "yes" ? 1 : "", care: ans.care === "easy" ? ["easy"] : "" };
    let { items } = await Api.listProducts(params);
    const wantCat = { air: "air", flowers: "flowering", puja: "puja" }[ans.want];
    if (wantCat) items.sort((a, b) => b.categories.includes(wantCat) - a.categories.includes(wantCat));
    if (!items.length) items = (await Api.listProducts({ light: lights })).items;
    $("#quizRes").innerHTML = items.slice(0, 3).map(p => `<a class="mini" href="product.html?p=${p.slug}">${Art.render(p.art, { seed: p.id })}${esc(p.name)}<small>${money(p.price)}</small></a>`).join("") || `<p class="muted">Nothing matched — try other answers.</p>`;
    const qs = new URLSearchParams({ light: lights.join(",") });
    if (params.pet) qs.set("pet", 1);
    if (wantCat) qs.set("category", wantCat);
    $("#quizShop").href = "shop.html?" + qs;
    step(Q.length); icons();
  });

  /* services */
  $("#svcGrid").innerHTML = meta.services.slice(0, 3).map(s => `<a class="svc" href="services.html#book"><span class="ic"><i data-lucide="${s.icon}"></i></span><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p><span class="pr">${esc(s.price)}</span></a>`).join("");

  /* testimonials */
  const tc = ["#2F6B3F", "#C2653F", "#3F5F86", "#B8752A", "#7A4E8A"];
  $("#testis").innerHTML = testis.map((t, i) => `<figure class="testi reveal">
      <div class="stars">${'<i data-lucide="star"></i>'.repeat(t.rating)}</div>
      <p>“${esc(t.text)}”</p>
      <figcaption class="who"><span style="background:${tc[i % tc.length]}">${esc(t.name[0])}</span><div><b>${esc(t.name)}</b><small>${esc(t.area)}</small></div></figcaption></figure>`).join("");

  /* delivery map */
  const pts = { "Shyambazar": [148, 70], "Dum Dum": [196, 36], "Lake Town": [214, 78], "Salt Lake": [252, 112], "New Town": [318, 104], "Rajarhat": [300, 62], "Park Street": [156, 150], "Ballygunge": [190, 186], "Alipore": [134, 196], "Kasba": [232, 200], "Jadavpur": [206, 236], "Tollygunge": [158, 236], "Behala": [104, 250], "Howrah": [74, 116] };
  const hq = [214, 290];
  let routes = "", dots = "";
  Object.entries(pts).forEach(([n, [x, y]], i) => {
    routes += `<path d="M${hq[0]} ${hq[1]}Q${(hq[0] + x) / 2 + 30} ${(hq[1] + y) / 2} ${x} ${y}" stroke="var(--leaf-2)" stroke-width="1.4" fill="none" stroke-dasharray="4 5" opacity=".6"><animate attributeName="stroke-dashoffset" from="90" to="0" dur="${3 + i % 4}s" repeatCount="indefinite"/></path>`;
    dots += `<g><circle cx="${x}" cy="${y}" r="5" fill="var(--leaf)"/><circle class="pulse" cx="${x}" cy="${y}" r="5" fill="var(--leaf-2)" style="animation-delay:${(i * .3) % 2.4}s"/><text x="${x + 8}" y="${y + 4}" font-size="10.5" font-family="DM Sans" font-weight="600" fill="var(--ink)">${n}</text></g>`;
  });
  $("#mapCard").innerHTML = `<svg viewBox="0 0 400 320" role="img" aria-label="Delivery map of Kolkata">
    <rect width="400" height="320" rx="18" fill="var(--sage)"/>
    <g stroke="var(--sage-2)" stroke-width="1">${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${i * 40}H400M${i * 50} 0V320"/>`).join("")}</g>
    <path d="M60 -10C90 40 120 70 110 120S60 200 70 250 40 300 30 330" stroke="#8FC1D4" stroke-width="22" fill="none" stroke-linecap="round" opacity=".8"/>
    <text x="20" y="200" font-size="10" font-family="DM Sans" fill="#3F7891" transform="rotate(-70 20 200)" letter-spacing="3">HOOGHLY</text>
    <ellipse cx="262" cy="160" rx="34" ry="14" fill="#8FC1D4" opacity=".5"/>
    ${routes}${dots}
    <g transform="translate(${hq[0]} ${hq[1]})"><circle r="16" fill="var(--clay)" opacity=".18" class="pulse"/><circle r="10" fill="var(--clay)"/><path d="M0 5V-2M0 0C0-4-3-6-6-5C-6-1-3 1 0 0ZM0-2C0-6 3-8 6-7C6-3 3-1 0-2Z" fill="#fff"/><text x="16" y="4" font-size="11.5" font-family="DM Sans" font-weight="700" fill="var(--clay)">Sabuj nursery · Garia</text></g>
  </svg>`;
  $("#areas").innerHTML = meta.areas.map(([n]) => `<span class="chip">${esc(n)}</span>`).join("");

  /* care guides */
  $("#homeGuides").innerHTML = (await Api.listGuides({ limit: 3 })).map(UI.guideCard).join("");

  /* faq */
  $("#faqList").innerHTML = meta.faqs.map(([q, a], i) => `<details ${i === 0 ? "open" : ""}><summary>${esc(q)}<i data-lucide="plus"></i></summary><p>${esc(a)}</p></details>`).join("");

  /* newsletter */
  $("#newsDeco").innerHTML = Art.render({ type: "fern", leaf: "#FFFFFF" }, { seed: "news", pot: "white" });
  $("#newsForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = $("button", e.target); btn.disabled = true;
    await Api.subscribe($("input", e.target).value);
    btn.disabled = false; e.target.reset();
    UI.toast("Welcome to the garden! Check your inbox 🌱", "mail-check");
  });

  icons(); reveal();
})();
