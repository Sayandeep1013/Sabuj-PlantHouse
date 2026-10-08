/* ------------------------------------------------------------------
   Shared UI: header, footer, cart drawer, search, pincode, toasts,
   product cards, reveal-on-scroll. Pages call UI.init() first.
------------------------------------------------------------------- */
(function () {
  const S = window.SITE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => S.currency + Number(n).toLocaleString("en-IN");
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  const LIGHT = { low: ["cloud-sun", "Low light"], medium: ["sun-dim", "Bright, indirect"], bright: ["sun", "Full sun"] };
  const WATER = { low: ["droplet", "Water fortnightly"], medium: ["droplets", "Water weekly"], high: ["waves", "Keep moist"] };

  const logoMark = `<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="var(--leaf)"/><path d="M20 31V18" stroke="var(--on-leaf)" stroke-width="2.2" stroke-linecap="round"/><path d="M20 21C20 14 14 11 9 12C9 18 13 22 20 21Z" fill="var(--on-leaf)"/><path d="M20 18C20 11 26 8 31 9C31 15 27 19 20 18Z" fill="var(--sun)"/></svg>`;
  const leafSvg = (c) => `<svg viewBox="0 0 24 24"><path d="M12 22C12 22 3 16 3 9C3 5 7 2 12 2C17 2 21 5 21 9C21 16 12 22 12 22Z" fill="${c}"/><path d="M12 22V6" stroke="rgba(0,0,0,.25)" stroke-width="1"/></svg>`;

  /* ---------- product media: photo when available, illustration otherwise ---------- */
  function media(p, opts = {}) {
    if (p.image && !opts.illustration) {
      return `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="this.outerHTML=Art.render(${esc(JSON.stringify(p.art))},{seed:'${p.id}'})">`;
    }
    return Art.render(p.art, { seed: p.id, pot: opts.pot, label: p.name });
  }
  const icon = (p) => Art.render(p.art, { seed: p.id, label: p.name });

  function stars(n) { return `<span class="rating"><i data-lucide="star"></i><b>${n.toFixed(1)}</b>`; }
  function off(p) { return p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0; }

  function card(p) {
    const o = off(p);
    const tags = [];
    if (p.tags.includes("bestseller")) tags.push(`<span class="tag tag-best">Bestseller</span>`);
    if (p.tags.includes("new")) tags.push(`<span class="tag tag-new">New</span>`);
    if (p.tags.includes("pujo")) tags.push(`<span class="tag tag-pujo">Pujo pick</span>`);
    const care = p.light ? `<div class="care-icons">
        <span title="${LIGHT[p.light][1]}"><i data-lucide="${LIGHT[p.light][0]}"></i></span>
        <span title="${WATER[p.water][1]}"><i data-lucide="${WATER[p.water][0]}"></i></span>
        ${p.pet ? `<span title="Pet friendly"><i data-lucide="paw-print"></i></span>` : ""}
        ${p.care === "easy" ? `<span title="Beginner friendly"><i data-lucide="smile"></i></span>` : ""}
      </div>` : "";
    return `<article class="pcard" data-id="${p.id}">
      <div class="media ${p.image ? "photo" : ""}">
        <div class="tags">${tags.join("")}</div>
        ${media(p)}
      </div>
      <button class="icon-btn wish ${Store.isWished(p.id) ? "on" : ""}" data-wish="${p.id}" aria-label="Save ${esc(p.name)}"><i data-lucide="heart"></i></button>
      <div class="body">
        <span class="local bn">${esc(p.local)}</span>
        <h3><a href="product.html?p=${encodeURIComponent(p.slug)}">${esc(p.name)}</a></h3>
        ${stars(p.rating)}<span>(${p.reviews.toLocaleString("en-IN")})</span></span>
        ${care}
        <div class="price-row">
          <span class="price">${money(p.price)}${o ? `<s>${money(p.mrp)}</s><span class="off">${o}% off</span>` : ""}</span>
          <button class="add-btn" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart"><i data-lucide="plus"></i></button>
        </div>
      </div>
    </article>`;
  }

  function guideCard(g) {
    const d = new Date(g.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `<article class="gcard">
      <div class="cover"><span class="tag tag-pujo">${esc(g.kicker)}</span>${Art.render(g.art, { seed: g.slug, label: g.title })}</div>
      <div class="body"><h3><a href="guide.html?g=${encodeURIComponent(g.slug)}">${esc(g.title)}</a></h3><p>${esc(g.excerpt)}</p>
        <div class="meta"><span><i data-lucide="clock-3"></i> ${g.mins} min read</span><span>${d}</span></div></div>
    </article>`;
  }

  /* Horizontal chip rows fade at the right edge until scrolled to the end (or when they fit). */
  function fadeEdges(root = document) {
    $$(".cat-scroller", root).forEach(el => {
      const check = () => el.classList.toggle("at-end", el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
      if (!el.dataset.fade) { el.dataset.fade = 1; el.addEventListener("scroll", check, { passive: true }); addEventListener("resize", check); }
      check();
    });
  }
  /* Range inputs: paint the filled part of the track up to the thumb. */
  function paintRange(r) {
    const pct = (r.value - r.min) / (r.max - r.min) * 100;
    r.style.background = `linear-gradient(90deg, var(--leaf) ${pct}%, var(--sage-2) ${pct}%)`;
  }

  function skeletons(n) { return Array.from({ length: n }, () => `<div class="skel"></div>`).join(""); }

  /* ---------- header & footer ---------- */
  function header() {
    const page = document.body.dataset.page;
    const msgs = [
      ["truck", "Same-day delivery across South & Central Kolkata"],
      ["badge-percent", "Free delivery above " + money(S.freeDeliveryAbove)],
      ["sparkles", "Pujo season: use PUJO150 for ₹150 off"],
      ["shield-check", "30-day healthy-plant promise"],
      ["message-circle", "Free plant doctor on WhatsApp"]
    ];
    const strip = msgs.map(([i, t]) => `<span><i data-lucide="${i}"></i>${t}</span>`).join("");
    const link = (href, label, key) => `<a href="${href}" class="${page === key ? "active" : ""}">${label}</a>`;
    const pin = store.get("sabuj.pin");
    return `<div class="announce" role="region" aria-label="Offers"><div class="announce-track">${strip}${strip}</div></div>
    <header class="site-header" id="siteHeader">
      <div class="wrap nav">
        <button class="icon-btn burger" id="burger" aria-label="Open menu"><i data-lucide="menu"></i></button>
        <a class="logo" href="index.html" aria-label="${S.brand} home">${logoMark}<span class="lt">${S.brand}<small>${S.brandSub} · Kolkata</small></span></a>
        <nav class="nav-links" aria-label="Main">
          <div class="nav-drop">
            <a href="shop.html" class="${["shop", "indoor", "flowering"].includes(page) ? "active" : ""}" aria-haspopup="true">Shop <i data-lucide="chevron-down"></i></a>
            <div class="drop-panel" role="menu">
              ${MOCK.categories.map(c => `<a role="menuitem" href="shop.html?category=${c.id}"><span class="di">${Art.render(c.art, { seed: c.id, pot: c.art.pot || "terracotta", label: "" })}</span><span><b>${c.name}</b><small>${c.blurb}</small></span></a>`).join("")}
              <a role="menuitem" class="drop-all" href="shop.html">Browse all plants <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
          ${link("shop.html?tag=pujo", "Pujo picks", "pujo")}
          ${link("services.html", "Garden services", "services")}
          ${link("guides.html", "Care guides", "guides")}
        </nav>
        <div class="nav-tools">
          <button class="pin-btn" id="pinBtn"><i data-lucide="map-pin"></i><span><span class="pin-pre">Deliver to </span><b id="pinLabel">${pin ? esc(pin) : "Kolkata"}</b></span></button>
          <button class="icon-btn" id="searchBtn" aria-label="Search"><i data-lucide="search"></i></button>
          <button class="icon-btn" id="themeBtn" aria-label="Toggle dark mode"><i data-lucide="moon"></i></button>
          <a class="icon-btn" href="shop.html?wish=1" aria-label="Saved plants"><i data-lucide="heart"></i><span class="badge" id="wishCount">0</span></a>
          <a class="icon-btn acct-btn" href="account.html" aria-label="My account" id="acctBtn"><i data-lucide="user-round"></i></a>
          <button class="icon-btn" id="cartBtn" aria-label="Open cart"><i data-lucide="shopping-bag"></i><span class="badge" id="cartCount">0</span></button>
        </div>
      </div>
    </header>
    <div class="mobile-nav" id="mobileNav" aria-hidden="true"><div class="scrim" data-close></div>
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><a class="logo" href="index.html">${logoMark}<span class="lt">${S.brand}</span></a><button class="icon-btn" data-close aria-label="Close menu"><i data-lucide="x"></i></button></div>
        <a href="shop.html"><i data-lucide="store"></i>Shop all plants</a>
        <a href="shop.html?tag=pujo"><i data-lucide="sparkles"></i>Pujo picks</a>
        <a href="services.html"><i data-lucide="shovel"></i>Garden services</a>
        <a href="cart.html"><i data-lucide="shopping-bag"></i>Cart & checkout</a>
        <a href="shop.html?wish=1"><i data-lucide="heart"></i>Saved plants</a>
        <a href="account.html"><i data-lucide="user-round"></i>My account</a>
        <a href="track.html"><i data-lucide="truck"></i>Track an order</a>
        <a href="guides.html"><i data-lucide="book-open"></i>Plant care guides</a>
        <h4>Categories</h4>
        ${MOCK.categories.map(c => `<a href="shop.html?category=${c.id}"><i data-lucide="leaf"></i>${c.name}</a>`).join("")}
        <h4>Help</h4>
        <a href="https://wa.me/${S.whatsapp}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i>WhatsApp us</a>
        <a href="tel:${S.phone.replace(/\s/g, "")}"><i data-lucide="phone"></i>${S.phone}</a>
      </div>
    </div>`;
  }

  function footer() {
    const cats = MOCK.categories.slice(0, 6).map(c => `<li><a href="shop.html?category=${c.id}">${c.name}</a></li>`).join("");
    return `<footer class="footer">
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <a class="logo" href="index.html">${logoMark}<span class="lt">${S.brand}<small>${S.brandSub} · Kolkata</small></span></a>
            <p style="max-width:38ch;font-size:14.5px">${S.tagline}. Grown with our partner growers in Garia, Sonarpur and Krishnanagar, potted in Bengal-tuned soil and delivered by our own riders.</p>
            <div class="socials">
              <a href="${S.social.instagram}" aria-label="Instagram"><i data-lucide="instagram"></i></a>
              <a href="${S.social.facebook}" aria-label="Facebook"><i data-lucide="facebook"></i></a>
              <a href="${S.social.youtube}" aria-label="YouTube"><i data-lucide="youtube"></i></a>
              <a href="https://wa.me/${S.whatsapp}" aria-label="WhatsApp"><i data-lucide="message-circle"></i></a>
            </div>
          </div>
          <div><h4>Shop</h4><ul>${cats}</ul></div>
          <div><h4>Help</h4><ul>
            <li><a href="services.html">Garden services</a></li>
            <li><a href="services.html#book">Plant doctor</a></li>
            <li><a href="guides.html">Plant care guides</a></li>
            <li><a href="index.html#faq">Delivery & returns</a></li>
            <li><a href="track.html">Track order</a></li>
            <li><a href="account.html">My account</a></li>
            <li><a href="credits.html">Photo credits</a></li>
            <li><a href="illustrations.html">Illustration library</a></li>
          </ul></div>
          <div><h4>Visit the nursery</h4><ul class="contact">
            <li><i data-lucide="map-pin"></i><span>${S.address}</span></li>
            <li><i data-lucide="clock"></i><span>${S.hours}</span></li>
            <li><i data-lucide="phone"></i><a href="tel:${S.phone.replace(/\s/g, "")}">${S.phone}</a></li>
            <li><i data-lucide="mail"></i><a href="mailto:${S.email}">${S.email}</a></li>
          </ul></div>
        </div>
        <div class="foot-bottom">
          <span>© ${new Date().getFullYear()} ${S.brand} ${S.brandSub}. Made with soil & love in Kolkata.</span>
          <div class="pay"><span>UPI</span><span>RuPay</span><span>Visa</span><span>Mastercard</span><span>COD</span></div>
        </div>
      </div>
    </footer>
    <a class="wa-float" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent("Hi Sabuj! I need help with a plant 🌿")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><i data-lucide="message-circle"></i></a>
    <div class="drawer" id="cartDrawer" aria-hidden="true"><div class="scrim" data-close></div>
      <aside class="panel" role="dialog" aria-label="Cart">
        <div class="drawer-head"><h3>Your plants</h3><button class="icon-btn" data-close aria-label="Close cart"><i data-lucide="x"></i></button></div>
        <div class="drawer-body" id="drawerBody"></div>
        <div class="drawer-foot" id="drawerFoot"></div>
      </aside>
    </div>
    <div class="search-ov" id="searchOv" role="dialog" aria-label="Search">
      <div class="wrap" style="max-width:820px">
        <div class="search-box"><i data-lucide="search" style="width:28px;height:28px"></i><input id="searchInput" placeholder="Search joba, tulsi, snake plant…" autocomplete="off"><button class="icon-btn" data-close aria-label="Close search"><i data-lucide="x"></i></button></div>
        <div class="search-sugg">${["Money plant", "Tulsi", "Joba", "Low light", "Pet friendly", "Succulent", "Bonsai"].map(s => `<button class="chip" data-sugg="${s}">${s}</button>`).join("")}</div>
        <div class="search-res" id="searchRes"></div>
      </div>
    </div>
    <div class="modal" id="pinModal" role="dialog" aria-label="Check delivery"><div class="scrim" data-close></div>
      <div class="card">
        <button class="icon-btn x" data-close aria-label="Close"><i data-lucide="x"></i></button>
        <span class="eyebrow"><i data-lucide="map-pin"></i>Delivery check</span>
        <h3 style="font-size:28px;margin:8px 0 6px">Where should we send your plants?</h3>
        <p class="muted" style="font-size:14px;margin-bottom:16px">Same-day in most of Kolkata. Enter your pincode for exact timing.</p>
        <form class="pin-form" data-pin-form><input class="input" inputmode="numeric" maxlength="6" placeholder="e.g. 700091" aria-label="Pincode"><button class="btn btn-primary">Check</button></form>
        <div class="pin-result"></div>
      </div>
    </div>
    <div class="toast-wrap" id="toasts" aria-live="polite"></div>`;
  }

  /* ---------- toasts ---------- */
  function toast(msg, ic = "check-circle-2") {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<i data-lucide="${ic}"></i><span>${msg}</span>`;
    $("#toasts").appendChild(t);
    icons();
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 2600);
  }

  /* ---------- overlays ---------- */
  function openLayer(el) { el.classList.add("open"); el.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closeLayer(el) { el.classList.remove("open"); el.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }

  function renderDrawer() {
    const body = $("#drawerBody"), foot = $("#drawerFoot");
    if (!body) return;
    const lines = Store.cart();
    if (!lines.length) {
      body.innerHTML = `<div class="empty">${Art.render({ type: "pothos", leaf: "#4F8F3A", variegate: "#D8D06A" }, { seed: "empty", pot: "terracotta" })}<h4>Your bag is empty</h4><p>Let's find you a green roommate.</p><a class="btn btn-primary" style="margin-top:18px" href="shop.html">Browse plants</a></div>`;
      foot.innerHTML = "";
    } else {
      body.innerHTML = lines.map(lineHTML).join("");
      const sub = Store.subtotal(), left = Math.max(0, S.freeDeliveryAbove - sub);
      foot.innerHTML = `<div class="ship-meter">${left ? `Add <b>${money(left)}</b> more for free delivery 🌱` : `<b>You've unlocked free delivery!</b> 🎉`}<div class="bar"><i style="width:${Math.min(100, sub / S.freeDeliveryAbove * 100)}%"></i></div></div>
        <div class="sum-row total" style="margin:0;border:0;padding:0"><span>Subtotal</span><span>${money(sub)}</span></div>
        <a class="btn btn-primary btn-block" href="cart.html">Checkout <i data-lucide="arrow-right"></i></a>`;
    }
    icons();
  }
  function lineHTML(l) {
    const p = MOCK.products.find(x => x.id === l.id) || l;
    const key = Store.lineKey(l);
    const meta = [l.sizeLabel, l.potLabel].filter(Boolean).join(" · ");
    return `<div class="line" data-key="${esc(key)}">
      <div class="thumb">${Art.render(p.art, { seed: p.id, pot: l.pot })}</div>
      <div><h4>${esc(l.name)}</h4><div class="meta">${esc(meta)}</div>
        <div class="qty"><button data-dec aria-label="Decrease"><i data-lucide="minus"></i></button><span>${l.qty}</span><button data-inc aria-label="Increase"><i data-lucide="plus"></i></button></div>
      </div>
      <div><div class="price">${money(l.unit * l.qty)}</div><button class="rm" data-rm>Remove</button></div>
    </div>`;
  }

  async function updateAccount() {
    const b = $("#acctBtn"); if (!b) return;
    const u = await Api.auth.me();
    b.classList.toggle("signed-in", !!u);
    b.setAttribute("aria-label", u ? "My account (signed in)" : "Sign in");
  }

  function updateCounts() {
    const c = Store.count(), w = Store.wish().length;
    const cc = $("#cartCount"), wc = $("#wishCount");
    if (cc) { cc.textContent = c; cc.classList.toggle("on", c > 0); }
    if (wc) { wc.textContent = w; wc.classList.toggle("on", w > 0); }
  }

  function quickAdd(id, btn) {
    const p = MOCK.products.find(x => x.id === id);
    if (!p) return;
    const size = p.noVariants ? null : S.sizes[0];
    const potKey = p.noVariants ? null : (p.art.pot || "terracotta");
    Store.add({
      id: p.id, name: p.name, unit: p.price + (size ? size.add : 0),
      size: size && size.id, sizeLabel: size && size.label, pot: potKey, potLabel: potKey && S.potColors[potKey].name + " pot"
    });
    if (btn) { btn.classList.add("done"); btn.innerHTML = `<i data-lucide="check"></i>`; icons(); setTimeout(() => { btn.classList.remove("done"); btn.innerHTML = `<i data-lucide="plus"></i>`; icons(); }, 1400); }
    toast(`${esc(p.name)} added to your bag`);
  }

  /* ---------- search ---------- */
  let searchTimer;
  async function runSearch(q) {
    const res = $("#searchRes");
    if (!q.trim()) { res.innerHTML = ""; return; }
    const map = { "low light": { light: ["low"] }, "pet friendly": { pet: 1 } };
    const params = map[q.toLowerCase()] || { q };
    const { items } = await Api.listProducts({ ...params, limit: 8 });
    res.innerHTML = items.length ? items.map(p => `<a href="product.html?p=${p.slug}"><div class="thumb">${icon(p)}</div><div><b>${esc(p.name)}</b><div class="muted" style="font-size:13px">${esc(p.short)}</div></div><span style="margin-left:auto;font-weight:700">${money(p.price)}</span></a>`).join("")
      : `<p class="muted" style="padding:10px">No plants match "${esc(q)}" — try <a class="link-arrow" href="shop.html">the full shop</a>.</p>`;
  }

  /* ---------- pincode ---------- */
  async function checkPin(form) {
    const input = $("input", form), out = form.parentElement.querySelector(".pin-result");
    const btn = $("button", form);
    btn.disabled = true;
    const r = await Api.checkPincode(input.value);
    btn.disabled = false;
    out.classList.add("show");
    out.classList.toggle("bad", !r.ok);
    if (!r.ok) { out.innerHTML = `<i data-lucide="alert-circle"></i><span>${r.message}</span>`; icons(); return; }
    out.innerHTML = `<i data-lucide="truck"></i><span><b>${esc(r.area)} · ${esc(r.eta)}</b><br><small>${r.cod ? "Cash on delivery available" : "Prepaid orders only"}${r.zone === "kolkata" ? " · Free delivery above " + money(S.freeDeliveryAbove) : ""}</small></span>`;
    store.set("sabuj.pin", input.value);
    const lbl = $("#pinLabel"); if (lbl) lbl.textContent = input.value;
    document.dispatchEvent(new CustomEvent("pin:change", { detail: r }));
    icons();
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    const dark = document.documentElement.getAttribute("data-theme") === "dark" || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    const b = $("#themeBtn"); if (b) { b.innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}"></i>`; icons(); }
    return dark;
  }

  /* ---------- reveal ---------- */
  let io;
  function reveal(root = document) {
    if (!("IntersectionObserver" in window)) { $$(".reveal,.stagger", root).forEach(e => e.classList.add("in")); return; }
    io = io || new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px" });
    $$(".reveal:not(.in),.stagger:not(.in)", root).forEach(e => {
      // anything already on screen animates in right away instead of waiting on the observer
      const r = e.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(() => e.classList.add("in"));
      else io.observe(e);
    });
  }

  function icons() { if (window.lucide) lucide.createIcons({ attrs: { "aria-hidden": "true" } }); }

  /* ---------- falling leaves ---------- */
  function leaves(container, n = 10) {
    const cols = ["#4E9A5B", "#8DBF6A", "#C2653F", "#E8B546", "#2F6B3F"];
    let h = "";
    for (let i = 0; i < n; i++) {
      const s = 14 + Math.random() * 16;
      h += `<i style="left:${Math.random() * 100}%;width:${s}px;height:${s}px;animation-duration:${10 + Math.random() * 12}s;animation-delay:-${Math.random() * 20}s;--dx:${(Math.random() - .5) * 200}px">${leafSvg(cols[i % cols.length])}</i>`;
    }
    container.innerHTML = h;
  }

  function init() {
    const saved = store.get("sabuj.theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    const h = $("#site-header"), f = $("#site-footer");
    if (h) h.outerHTML = header();
    if (f) f.outerHTML = footer();

    const hdr = $("#siteHeader");
    const onScroll = () => hdr && hdr.classList.toggle("scrolled", scrollY > 10);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    const drawer = $("#cartDrawer"), mnav = $("#mobileNav"), sov = $("#searchOv"), pinM = $("#pinModal");
    $("#cartBtn").onclick = () => { renderDrawer(); openLayer(drawer); };
    $("#burger").onclick = () => openLayer(mnav);
    $("#searchBtn").onclick = () => { openLayer(sov); setTimeout(() => $("#searchInput").focus(), 50); };
    $("#pinBtn").onclick = () => { openLayer(pinM); setTimeout(() => $("#pinModal input").focus(), 50); };
    $("#themeBtn").onclick = () => { const next = applyTheme() ? "light" : "dark"; applyTheme(next); store.set("sabuj.theme", next); };
    applyTheme();

    document.addEventListener("click", (e) => {
      const t = e.target;
      const close = t.closest("[data-close]");
      if (close) { const layer = close.closest(".drawer,.mobile-nav,.search-ov,.modal"); if (layer) closeLayer(layer); return; }
      const add = t.closest("[data-add]");
      if (add) { e.preventDefault(); quickAdd(add.dataset.add, add); return; }
      const wish = t.closest("[data-wish]");
      if (wish) { e.preventDefault(); const on = Store.toggleWish(wish.dataset.wish); wish.classList.toggle("on", on); toast(on ? "Saved to your wishlist" : "Removed from wishlist", "heart"); return; }
      const sugg = t.closest("[data-sugg]");
      if (sugg) { $("#searchInput").value = sugg.dataset.sugg; runSearch(sugg.dataset.sugg); return; }
      const line = t.closest(".line");
      if (line && line.closest("#drawerBody, #cartLines")) {
        const key = line.dataset.key, l = Store.cart().find(x => Store.lineKey(x) === key);
        if (!l) return;
        if (t.closest("[data-inc]")) Store.setQty(key, l.qty + 1);
        else if (t.closest("[data-dec]")) Store.setQty(key, l.qty - 1);
        else if (t.closest("[data-rm]")) Store.remove(key);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") $$(".drawer.open,.mobile-nav.open,.search-ov.open,.modal.open").forEach(closeLayer);
      if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#searchBtn").click(); }
    });
    document.addEventListener("submit", (e) => { const f = e.target.closest("[data-pin-form]"); if (f) { e.preventDefault(); checkPin(f); } });
    $("#searchInput").addEventListener("input", (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => runSearch(e.target.value), 180); });
    $("#searchInput").addEventListener("keydown", (e) => { if (e.key === "Enter") location.href = "shop.html?q=" + encodeURIComponent(e.target.value); });

    document.addEventListener("store:change", () => { updateCounts(); updateAccount(); if (drawer.classList.contains("open")) renderDrawer(); });
    updateCounts(); updateAccount();
    icons();
    reveal();
  }

  window.UI = { init, card, guideCard, fadeEdges, paintRange, media, icon, money, esc, toast, icons, reveal, skeletons, leaves, off, LIGHT, WATER, renderDrawer, openCart: () => { renderDrawer(); openLayer($("#cartDrawer")); }, lineHTML, $, $$, store };
})();
