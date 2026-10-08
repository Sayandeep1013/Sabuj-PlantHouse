(async function () {
  UI.init();
  const { $, $$, esc, card, icons, reveal, money } = UI;
  const [cats, meta] = await Promise.all([Api.listCategories(), Api.meta()]);

  const url = new URLSearchParams(location.search);
  const listParam = (k) => (url.get(k) || "").split(",").filter(Boolean);
  const state = {
    q: url.get("q") || "",
    category: url.get("category") || "",
    tag: url.get("tag") || "",
    space: url.get("space") || "",
    season: url.get("season") || "",
    light: listParam("light"),
    care: listParam("care"),
    pet: url.get("pet") ? 1 : "",
    maxPrice: url.get("maxPrice") || "",
    sort: url.get("sort") || "popular",
    wish: url.get("wish") ? 1 : ""
  };

  /* category chips */
  $("#catScroller").innerHTML = `<button class="chip" data-cat="">All plants</button>` + cats.map(c => `<button class="chip" data-cat="${c.id}">${esc(c.name)}</button>`).join("");
  $("#spaceChips").innerHTML = meta.spaces.map(s => `<button class="chip" data-space="${s.id}">${esc(s.name)}</button>`).join("");
  $("#seasonChips").innerHTML = meta.seasons.map(s => `<button class="chip" data-season="${s.id}">${esc(s.name)} · ${esc(s.en)}</button>`).join("");

  /* facet counts (from the whole catalogue) */
  const all = (await Api.listProducts({})).items;
  $$("[data-n]").forEach(el => { const [k, v] = el.dataset.n.split(":"); el.textContent = all.filter(p => p[k] === v).length; });

  function syncControls() {
    $$("#catScroller .chip").forEach(c => c.classList.toggle("on", c.dataset.cat === state.category));
    $$("#spaceChips .chip").forEach(c => c.classList.toggle("on", c.dataset.space === state.space));
    $$("#seasonChips .chip").forEach(c => c.classList.toggle("on", c.dataset.season === state.season));
    $$('input[name="light"]').forEach(i => i.checked = state.light.includes(i.value));
    $$('input[name="care"]').forEach(i => i.checked = state.care.includes(i.value));
    $('input[name="pet"]').checked = !!state.pet;
    const r = $('input[name="maxPrice"]'); r.value = state.maxPrice || r.max; UI.paintRange(r);
    $("#priceOut").textContent = state.maxPrice ? money(state.maxPrice) : "Any";
    $("#sort").value = state.sort;
  }

  function title() {
    const cat = cats.find(c => c.id === state.category);
    const space = meta.spaces.find(s => s.id === state.space);
    const season = meta.seasons.find(s => s.id === state.season);
    let t = "All plants", sub = "Nursery-fresh, ready-potted and delivered by our own riders.";
    if (state.wish) { t = "Saved plants"; sub = "Your wishlist — stored on this device."; }
    else if (state.tag === "pujo") { t = "Pujo picks"; sub = "Joba, aparajita, shiuli and genda — for the pandal, the thakur ghar and the balcony."; }
    else if (state.q) { t = `“${state.q}”`; sub = "Search results"; }
    else if (cat) { t = cat.name; sub = cat.blurb; }
    else if (space) { t = "For your " + space.name.toLowerCase(); sub = space.note; }
    else if (season) { t = season.name + " · " + season.en; sub = season.note; }
    $("#shopTitle").textContent = t; $("#shopSub").textContent = sub; $("#crumbNow").textContent = t.replace(/[“”]/g, "");
    document.title = t.replace(/[“”]/g, "") + " · Sabuj";
  }

  function chipsActive() {
    const out = [];
    const add = (label, clear) => out.push(`<button class="chip" data-clear="${clear}">${esc(label)} <i data-lucide="x"></i></button>`);
    if (state.q) add("Search: " + state.q, "q");
    if (state.tag) add("Pujo picks", "tag");
    state.light.forEach(l => add(UI.LIGHT[l][1], "light:" + l));
    state.care.forEach(c => add(c === "easy" ? "Beginner friendly" : "Needs a routine", "care:" + c));
    if (state.pet) add("Pet friendly", "pet");
    if (state.maxPrice) add("Under " + money(state.maxPrice), "maxPrice");
    if (state.space) add(meta.spaces.find(s => s.id === state.space).name, "space");
    if (state.season) add(meta.seasons.find(s => s.id === state.season).en, "season");
    $("#activeF").innerHTML = out.join("");
  }

  function pushUrl() {
    const p = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => { if (Array.isArray(v) ? v.length : v) p.set(k, Array.isArray(v) ? v.join(",") : v); });
    if (p.get("sort") === "popular") p.delete("sort");
    history.replaceState(null, "", "shop.html" + (p.toString() ? "?" + p : ""));
  }

  let reqId = 0;
  async function load() {
    const my = ++reqId;
    syncControls(); title(); chipsActive(); pushUrl();
    const grid = $("#grid");
    grid.innerHTML = UI.skeletons(6);
    const params = { ...state };
    if (state.wish) { params.ids = Store.wish(); delete params.wish; }
    const { items, total } = state.wish && !Store.wish().length ? { items: [], total: 0 } : await Api.listProducts(params);
    if (my !== reqId) return;
    $("#count").textContent = `${total} ${total === 1 ? "plant" : "plants"}`;
    grid.classList.remove("in"); grid.classList.add("stagger");
    grid.innerHTML = items.length ? items.map(card).join("") : `<div class="empty no-results">${Art.render({ type: "cactus", leaf: "#5E9A5A", flower: "#E6789A" }, { seed: "none", pot: "terracotta" })}<h4>${state.wish ? "No saved plants yet" : "Nothing matches — yet"}</h4><p>${state.wish ? "Tap the heart on any plant to save it here." : "Try removing a filter or two."}</p><a class="btn btn-primary" style="margin-top:16px" href="shop.html">See all plants</a></div>`;
    icons(); reveal();
  }

  /* events */
  document.addEventListener("click", e => {
    const t = e.target;
    const cat = t.closest("[data-cat]"); if (cat) { state.category = cat.dataset.cat; state.tag = ""; state.wish = ""; state.q = ""; return load(); }
    const sp = t.closest("[data-space]"); if (sp) { state.space = state.space === sp.dataset.space ? "" : sp.dataset.space; return load(); }
    const se = t.closest("[data-season]"); if (se) { state.season = state.season === se.dataset.season ? "" : se.dataset.season; return load(); }
    const cl = t.closest("[data-clear]");
    if (cl) {
      const [k, v] = cl.dataset.clear.split(":");
      if (v) state[k] = state[k].filter(x => x !== v); else state[k] = "";
      return load();
    }
  });
  $("#filters").addEventListener("change", e => {
    const i = e.target;
    if (i.name === "light" || i.name === "care") state[i.name] = $$(`input[name="${i.name}"]:checked`).map(x => x.value);
    if (i.name === "pet") state.pet = i.checked ? 1 : "";
    if (i.name === "maxPrice") state.maxPrice = +i.value >= +i.max ? "" : i.value;
    load();
  });
  $('input[name="maxPrice"]').addEventListener("input", e => { $("#priceOut").textContent = +e.target.value >= +e.target.max ? "Any" : money(e.target.value); UI.paintRange(e.target); });
  UI.fadeEdges();
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; load(); });
  $("#clearF").addEventListener("click", () => { Object.assign(state, { light: [], care: [], pet: "", maxPrice: "", space: "", season: "", q: "", tag: "" }); load(); });
  const f = $("#filters");
  $("#openF").addEventListener("click", () => f.classList.add("open"));
  $$(".close-f").forEach(b => b.addEventListener("click", () => f.classList.remove("open")));
  document.addEventListener("store:change", () => { if (state.wish) load(); });

  load();
})();
