(async function () {
  UI.init();
  const { $, $$, esc, card, icons, reveal, money } = UI;
  const S = window.SITE;
  const slug = new URLSearchParams(location.search).get("p") || "money-plant-golden";

  let p;
  try { p = await Api.getProduct(slug); }
  catch (e) {
    $("#pd").innerHTML = `<div class="empty" style="grid-column:1/-1">${Art.render({ type: "succulent", leaf: "#8DB4A8", tip: "#D98C9A" }, { seed: "404", pot: "blush" })}<h4>We couldn't find that plant</h4><p>It may have sold out for the season.</p><a class="btn btn-primary" style="margin-top:16px" href="shop.html">Back to the shop</a></div>`;
    icons(); return;
  }

  const cats = await Api.listCategories();
  const cat = cats.find(c => c.id === p.categories[0]);
  document.title = `${p.name} · Sabuj`;
  $("#crumbNow").textContent = p.name;
  if (cat) { $("#crumbCat").textContent = cat.name; $("#crumbCat").href = "shop.html?category=" + cat.id; }

  const isPlant = !p.noVariants;
  const sel = { size: isPlant ? S.sizes[0] : null, pot: isPlant ? (p.art.pot || "terracotta") : null, qty: 1, view: p.image ? "photo" : "art" };
  const unit = () => p.price + (sel.size ? sel.size.add : 0) + (sel.pot ? S.potColors[sel.pot].add : 0);
  const unitMrp = () => p.mrp + (sel.size ? sel.size.add : 0) + (sel.pot ? S.potColors[sel.pot].add : 0);

  /* gallery */
  function stage() {
    const tags = `${UI.off(p) ? `<span class="tag tag-sale">${UI.off(p)}% off</span>` : ""}${p.tags.includes("bestseller") ? `<span class="tag tag-best">Bestseller</span>` : ""}`;
    const photo = sel.view === "photo" && p.image;
    $("#stage").innerHTML = (photo ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">` : Art.render(p.art, { seed: p.id, pot: sel.pot, label: p.name + " in " + (sel.pot ? S.potColors[sel.pot].name : "") + " pot" })) + `<div class="tags">${tags}</div>`;
    $("#stage").style.padding = photo ? "0" : "";
    const thumbs = [];
    if (p.image) thumbs.push(`<button class="${sel.view === "photo" ? "on" : ""}" data-view="photo" aria-label="Photo"><img src="${esc(p.image)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px"></button>`);
    thumbs.push(`<button class="${sel.view === "art" ? "on" : ""}" data-view="art" aria-label="Preview in your pot" title="Preview in your chosen pot">${Art.render(p.art, { seed: p.id, pot: sel.pot })}</button>`);
    $("#thumbs").innerHTML = thumbs.join("") + (isPlant ? `<span class="muted" style="font-size:12.5px;align-self:center;max-width:16ch;line-height:1.3">Tap a pot colour to preview it</span>` : "");
  }

  /* info */
  const meter = (n) => `<div class="meter">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
  const lv = { low: 1, medium: 2, bright: 3, high: 3, easy: 1, moderate: 2, expert: 3 };
  const careGrid = isPlant ? `<div class="care-grid">
      <div class="care-cell"><i class="ic" data-lucide="${UI.LIGHT[p.light][0]}"></i><small>Light</small><b>${UI.LIGHT[p.light][1]}</b>${meter(lv[p.light])}</div>
      <div class="care-cell"><i class="ic" data-lucide="${UI.WATER[p.water][0]}"></i><small>Water</small><b>${UI.WATER[p.water][1]}</b>${meter(lv[p.water])}</div>
      <div class="care-cell"><i class="ic" data-lucide="gauge"></i><small>Care</small><b>${p.care === "easy" ? "Beginner" : "Some care"}</b>${meter(lv[p.care])}</div>
      <div class="care-cell"><i class="ic" data-lucide="paw-print"></i><small>Pets</small><b>${p.pet ? "Pet safe" : "Keep away"}</b>${meter(p.pet ? 1 : 3)}</div>
    </div>` : "";

  function info() {
    const o = UI.off(p);
    $("#info").innerHTML = `
      <span class="local bn">${esc(p.local)}</span>
      <h1>${esc(p.name)}</h1>
      <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <span class="rating"><i data-lucide="star"></i><b>${p.rating.toFixed(1)}</b> · ${p.reviews.toLocaleString("en-IN")} reviews</span>
        ${p.tags.includes("pujo") ? `<span class="tag tag-pujo">Pujo pick</span>` : ""}
        ${p.categories.includes("air") ? `<span class="tag" style="background:var(--sage);color:var(--leaf)"><i data-lucide="wind" style="width:13px;height:13px"></i>Air purifying</span>` : ""}
      </div>
      <p style="margin-top:14px;font-size:17px;color:var(--ink-2)">${esc(p.short)}</p>
      <div class="pd-price"><b id="priceNow">${money(unit())}</b>${o ? `<s id="priceWas">${money(unitMrp())}</s><span class="off">Save ${o}%</span>` : ""}<span class="muted" style="font-size:13px;width:100%">Inclusive of all taxes · ${isPlant ? "pot & soil included" : "ships in 1 day"}</span></div>
      ${isPlant ? `<div class="opt-group"><h4>Plant size <span id="sizeNote">${sel.size.note}</span></h4>
        <div class="sizes">${S.sizes.map(s => `<button class="size ${s.id === sel.size.id ? "on" : ""}" data-size="${s.id}"><b>${s.label}</b><small>${s.note}</small><em>${s.add ? "+" + money(s.add) : "Base"}</em></button>`).join("")}</div></div>
      <div class="opt-group"><h4>Pot colour <span id="potName">${S.potColors[sel.pot].name}${S.potColors[sel.pot].add ? " · +" + money(S.potColors[sel.pot].add) : " · included"}</span></h4>
        <div class="swatches">${Object.entries(S.potColors).map(([k, v]) => `<button class="swatch ${k === sel.pot ? "on" : ""}" data-pot="${k}" style="background:${v.hex}" aria-label="${v.name} pot" title="${v.name}"></button>`).join("")}</div></div>` : ""}
      <div class="buy-row">
        <div class="qty lg"><button data-q="-1" aria-label="Decrease"><i data-lucide="minus"></i></button><span id="qtyN">1</span><button data-q="1" aria-label="Increase"><i data-lucide="plus"></i></button></div>
        <button class="btn btn-primary" id="addCart"><i data-lucide="shopping-bag"></i>Add to bag</button>
        <button class="icon-btn wish ${Store.isWished(p.id) ? "on" : ""}" data-wish="${p.id}" style="width:54px;height:54px;border:1.5px solid var(--line)" aria-label="Save"><i data-lucide="heart"></i></button>
      </div>
      <a class="btn btn-clay btn-block" id="buyNow" style="margin-top:10px;height:54px" href="cart.html">Buy now · Same-day in Kolkata</a>
      <div class="deliv-box">
        <h4><i data-lucide="map-pin"></i>Check delivery</h4>
        <form class="pin-form" data-pin-form><input class="input" inputmode="numeric" maxlength="6" placeholder="Pincode" value="${esc(UI.store.get("sabuj.pin") || "")}" aria-label="Pincode"><button class="btn btn-ghost">Check</button></form>
        <div class="pin-result"></div>
      </div>
      <div class="perks">
        <div><i data-lucide="shield-check"></i>30-day healthy plant promise — free replacement</div>
        <div><i data-lucide="package-check"></i>Shipped potted, staked and wrapped by hand</div>
        <div><i data-lucide="banknote"></i>Cash on delivery inside Kolkata</div>
      </div>
      ${careGrid}`;
  }

  function tabs() {
    const T = [
      ["About", `<p>${esc(p.short)} Grown by our partner farms around Kolkata and hardened for at least three weeks in our Garia nursery before it reaches you, so it's used to Bengal's heat and humidity.</p>
        ${isPlant ? `<ul><li>Arrives in a ${esc(S.potColors[sel.pot].name.toLowerCase())} pot with drainage, potted in Sabuj mix (garden soil, cocopeat, vermicompost, neem cake).</li><li>Best spots: ${p.spaces.map(s => MOCK.spaces.find(x => x.id === s).name.toLowerCase()).join(", ") || "anywhere bright"}.</li><li>Best seasons: ${p.seasons.map(s => MOCK.seasons.find(x => x.id === s).en).join(", ")}.</li></ul>` : ""}`],
      ["Care guide", isPlant ? `<ul>
        <li><b>Light:</b> ${UI.LIGHT[p.light][1]}. ${p.light === "low" ? "Happy a few metres from a window." : p.light === "bright" ? "4+ hours of direct sun keeps it flowering." : "Near an east or west window, out of harsh afternoon sun."}</li>
        <li><b>Water:</b> ${UI.WATER[p.water][1]}. Check the top 2 cm of soil — water only when dry. Cut back by half in winter.</li>
        <li><b>Monsoon tip:</b> lift the pot off the floor so it drains; humid weeks invite fungus gnats.</li>
        <li><b>Feeding:</b> a spoon of vermicompost every month from March to October.</li>
        <li><b>Stuck?</b> Send a photo to our plant doctor on WhatsApp — free, forever.</li></ul>` : `<p>Store in a cool, dry place. Use within 12 months for best results.</p>`],
      ["Delivery & returns", `<ul><li>Same-day across most of South & Central Kolkata for orders before 1pm; next day for Greater Kolkata.</li><li>Free delivery above ${money(S.freeDeliveryAbove)}, otherwise ${money(S.deliveryFee)}.</li><li>Damaged in transit? Send a photo within 48 hours — we replace it, no return needed.</li><li>30-day healthy plant promise on every plant.</li></ul>`],
      ["Reviews", `<div style="display:grid;gap:14px">${MOCK.testimonials.slice(0, 3).map(t => `<div class="panel-card"><div class="rating" style="margin-bottom:6px">${'<i data-lucide="star"></i>'.repeat(t.rating)}</div><p>“${esc(t.text)}”</p><small class="muted">${esc(t.name)} · ${esc(t.area)}</small></div>`).join("")}</div>`]
    ];
    $("#tabs").innerHTML = `<div class="tab-btns" role="tablist">${T.map(([n], i) => `<button role="tab" aria-selected="${i === 0}" data-tab="${i}">${n}</button>`).join("")}</div>` +
      T.map(([, h], i) => `<div class="tab-panel ${i === 0 ? "on" : ""}" role="tabpanel">${h}</div>`).join("");
  }

  function refreshPrice() {
    $("#priceNow").textContent = money(unit() * 1);
    const was = $("#priceWas"); if (was) was.textContent = money(unitMrp());
    if (sel.size) $("#sizeNote").textContent = sel.size.note;
    if (sel.pot) $("#potName").textContent = S.potColors[sel.pot].name + (S.potColors[sel.pot].add ? " · +" + money(S.potColors[sel.pot].add) : " · included");
    $("#stickyT").innerHTML = `${esc(p.name)}<small>${money(unit())}${sel.size ? " · " + sel.size.label : ""}</small>`;
  }

  function addToBag() {
    Store.add({
      id: p.id, name: p.name, unit: unit(), qty: sel.qty,
      size: sel.size && sel.size.id, sizeLabel: sel.size && sel.size.label,
      pot: sel.pot, potLabel: sel.pot && S.potColors[sel.pot].name + " pot"
    });
  }

  stage(); info(); tabs(); refreshPrice(); icons();

  document.addEventListener("click", e => {
    const t = e.target;
    const v = t.closest("[data-view]"); if (v) { sel.view = v.dataset.view; stage(); return; }
    const s = t.closest("[data-size]"); if (s) { sel.size = S.sizes.find(x => x.id === s.dataset.size); $$("[data-size]").forEach(b => b.classList.toggle("on", b === s)); refreshPrice(); return; }
    const pt = t.closest("[data-pot]");
    if (pt) { sel.pot = pt.dataset.pot; sel.view = "art"; $$("[data-pot]").forEach(b => b.classList.toggle("on", b === pt)); stage(); refreshPrice(); return; }
    const q = t.closest("[data-q]"); if (q) { sel.qty = Math.max(1, Math.min(20, sel.qty + +q.dataset.q)); $("#qtyN").textContent = sel.qty; return; }
    const tb = t.closest("[data-tab]");
    if (tb) { $$("[data-tab]").forEach(b => b.setAttribute("aria-selected", b === tb)); $$(".tab-panel").forEach((pn, i) => pn.classList.toggle("on", i === +tb.dataset.tab)); return; }
    if (t.closest("#addCart") || t.closest("#stickyAdd")) { addToBag(); UI.toast(`${esc(p.name)} added to your bag`); UI.openCart(); return; }
    if (t.closest("#buyNow")) { e.preventDefault(); addToBag(); location.href = "cart.html"; }
  });

  /* sticky buy bar on mobile once the main button scrolls away */
  new IntersectionObserver(([en]) => $("#stickyBuy").classList.toggle("show", !en.isIntersecting && en.boundingClientRect.top < 0)).observe($("#addCart"));

  /* related */
  const { items } = await Api.listProducts({ category: p.categories[0], limit: 5 });
  $("#related").innerHTML = items.filter(x => x.id !== p.id).slice(0, 4).map(card).join("");
  $("#related").classList.add("stagger");
  icons(); reveal();
})();
