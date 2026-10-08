/* ------------------------------------------------------------------
   Data layer. Every page talks to Api.* only.
   USE_MOCK = true  → answers come from mock-data.js (with a small delay)
   USE_MOCK = false → same calls hit REST endpoints under SITE.API_BASE
------------------------------------------------------------------- */
(function () {
  const cfg = window.SITE;
  const wait = (ms = 220) => new Promise(r => setTimeout(r, ms));

  async function http(path, opts = {}) {
    const res = await fetch(cfg.API_BASE + path, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
    return res.json();
  }

  function qs(params) {
    const s = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return;
      s.set(k, Array.isArray(v) ? v.join(",") : v);
    });
    const str = s.toString();
    return str ? "?" + str : "";
  }

  /* ---- mock implementations: mirror what the server should do ---- */
  function filterProducts(p) {
    let list = MOCK.products.slice();
    const has = (arr, v) => Array.isArray(arr) && arr.includes(v);
    if (p.q) {
      const q = p.q.toLowerCase();
      list = list.filter(x => (x.name + " " + x.local + " " + x.short + " " + x.categories.join(" ")).toLowerCase().includes(q));
    }
    if (p.category) list = list.filter(x => has(x.categories, p.category));
    if (p.space) list = list.filter(x => has(x.spaces, p.space));
    if (p.season) list = list.filter(x => has(x.seasons, p.season));
    if (p.light && p.light.length) list = list.filter(x => p.light.includes(x.light));
    if (p.care && p.care.length) list = list.filter(x => p.care.includes(x.care));
    if (p.pet) list = list.filter(x => x.pet === true);
    if (p.tag) list = list.filter(x => has(x.tags, p.tag));
    if (p.ids) list = list.filter(x => p.ids.includes(x.id));
    if (p.maxPrice) list = list.filter(x => x.price <= +p.maxPrice);
    const sorts = {
      popular: (a, b) => b.reviews - a.reviews,
      rating: (a, b) => b.rating - a.rating,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      discount: (a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp
    };
    list.sort(sorts[p.sort] || sorts.popular);
    const total = list.length;
    if (p.limit) list = list.slice(0, +p.limit);
    return { items: list, total };
  }

  function pincode(pin) {
    pin = String(pin || "").trim();
    if (!/^\d{6}$/.test(pin)) return { ok: false, message: "Enter a valid 6-digit pincode" };
    const area = MOCK.areas.find(a => a[1] === pin);
    const n = +pin;
    if (n >= 700001 && n <= 700160) return { ok: true, zone: "kolkata", eta: n <= 700099 ? "Today, if ordered by 1pm" : "Tomorrow", cod: true, area: area ? area[0] : "Kolkata" };
    if (pin.startsWith("711") || pin.startsWith("712") || pin.startsWith("743")) return { ok: true, zone: "metro", eta: "Tomorrow", cod: true, area: area ? area[0] : "Greater Kolkata" };
    if (pin.startsWith("7")) return { ok: true, zone: "bengal", eta: "2–3 days", cod: false, area: "West Bengal" };
    return { ok: true, zone: "india", eta: "4–6 days · hardy plants, seeds & pots only", cod: false, area: "Pan-India" };
  }

  window.Api = {
    async listProducts(params = {}) {
      if (!cfg.USE_MOCK) return http("/products" + qs(params));
      await wait(); return filterProducts(params);
    },
    async getProduct(slugOrId) {
      if (!cfg.USE_MOCK) return http("/products/" + encodeURIComponent(slugOrId));
      await wait(120);
      const p = MOCK.products.find(x => x.slug === slugOrId || x.id === slugOrId);
      if (!p) throw new Error("Not found");
      return p;
    },
    async listCategories() {
      if (!cfg.USE_MOCK) return http("/categories");
      return MOCK.categories;
    },
    async meta() {
      if (!cfg.USE_MOCK) return http("/meta");
      return { spaces: MOCK.spaces, seasons: MOCK.seasons, areas: MOCK.areas, services: MOCK.services, faqs: MOCK.faqs };
    },
    async testimonials() {
      if (!cfg.USE_MOCK) return http("/testimonials");
      return MOCK.testimonials;
    },
    async checkPincode(pin) {
      if (!cfg.USE_MOCK) return http("/delivery/check" + qs({ pin }));
      await wait(350); return pincode(pin);
    },
    async validateCoupon(code, subtotal) {
      if (!cfg.USE_MOCK) return http("/coupons/validate", { method: "POST", body: { code, subtotal } });
      await wait(300);
      const c = MOCK.coupons[String(code || "").trim().toUpperCase()];
      if (!c) return { ok: false, message: "That code isn't valid" };
      if (subtotal < c.min) return { ok: false, message: `Add ₹${c.min - subtotal} more to use this code` };
      const discount = c.type === "pct" ? Math.round(subtotal * c.value / 100) : c.value;
      return { ok: true, code: code.toUpperCase(), discount, label: c.label };
    },
    async placeOrder(order) {
      if (!cfg.USE_MOCK) return http("/orders", { method: "POST", body: order });
      await wait(900);
      const saved = { ...order, id: "SB" + Date.now().toString().slice(-7), createdAt: Date.now(), eta: pincode(order.address.pincode).eta };
      write(KEY_ORDERS, [saved, ...read(KEY_ORDERS, [])].slice(0, 30));
      const user = read(KEY_USER, null);
      if (user) write(KEY_USER, { ...user, address: order.address, name: user.name || order.address.name });
      return { ok: true, orderId: saved.id, eta: saved.eta };
    },
    /* Orders. Mock status advances with time since the order was placed, so the tracker has something to show. */
    async listOrders() {
      if (!cfg.USE_MOCK) return http("/orders");
      await wait(200);
      const user = read(KEY_USER, null);
      return read(KEY_ORDERS, []).filter(o => !user || o.address.phone === user.phone).map(withStatus);
    },
    async getOrder(id, phone) {
      if (!cfg.USE_MOCK) return http("/orders/" + encodeURIComponent(id) + qs({ phone }));
      await wait(300);
      const o = read(KEY_ORDERS, []).find(x => x.id.toUpperCase() === String(id).trim().toUpperCase() && (!phone || x.address.phone === phone));
      if (!o) throw new Error("We couldn't find an order with those details");
      return withStatus(o);
    },
    /* Auth: phone + one-time password. Mock accepts any 4-digit code shown in devCode. */
    auth: {
      me: async () => cfg.USE_MOCK ? read(KEY_USER, null) : http("/auth/me").catch(() => null),
      async requestOtp(phone) {
        if (!cfg.USE_MOCK) return http("/auth/otp", { method: "POST", body: { phone } });
        await wait(500);
        if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, message: "Enter a valid 10-digit mobile number" };
        return { ok: true, devCode: "1234" };
      },
      async verifyOtp(phone, code) {
        if (!cfg.USE_MOCK) return http("/auth/verify", { method: "POST", body: { phone, code } });
        await wait(500);
        if (code !== "1234") return { ok: false, message: "That code doesn't match. Try 1234 in this demo." };
        const existing = read(KEY_USER, null);
        const user = existing && existing.phone === phone ? existing : { id: "u" + phone.slice(-4), phone, name: "", email: "" };
        write(KEY_USER, user); emit();
        return { ok: true, user };
      },
      async updateProfile(patch) {
        if (!cfg.USE_MOCK) return http("/auth/me", { method: "PATCH", body: patch });
        await wait(300);
        const user = { ...read(KEY_USER, {}), ...patch };
        write(KEY_USER, user); emit();
        return user;
      },
      async logout() {
        if (!cfg.USE_MOCK) await http("/auth/logout", { method: "POST" });
        try { localStorage.removeItem(KEY_USER); } catch (e) {}
        emit();
      }
    },
    async listGuides(params = {}) {
      if (!cfg.USE_MOCK) return http("/guides" + qs(params));
      await wait(150);
      const list = MOCK.guides.filter(g => !params.topic || g.topic === params.topic).sort((a, b) => b.date.localeCompare(a.date));
      return params.limit ? list.slice(0, +params.limit) : list;
    },
    async getGuide(slug) {
      if (!cfg.USE_MOCK) return http("/guides/" + encodeURIComponent(slug));
      await wait(120);
      const g = MOCK.guides.find(x => x.slug === slug);
      if (!g) throw new Error("Not found");
      return g;
    },
    async bookService(payload) {
      if (!cfg.USE_MOCK) return http("/services/bookings", { method: "POST", body: payload });
      await wait(700); return { ok: true, ref: "SV" + Date.now().toString().slice(-6) };
    },
    async subscribe(email) {
      if (!cfg.USE_MOCK) return http("/newsletter", { method: "POST", body: { email } });
      await wait(400); return { ok: true };
    }
  };

  /* ---- client-side cart & wishlist (swap for server cart later) ---- */
  const KEY_CART = "sabuj.cart", KEY_WISH = "sabuj.wish", KEY_ORDERS = "sabuj.orders", KEY_USER = "sabuj.user";
  /* Order lifecycle: placed → packed → out → delivered. A real backend sends `status` and `timeline`. */
  const STEPS = [["placed", 0], ["packed", 2], ["out", 5], ["delivered", 12]];
  function withStatus(o) {
    const mins = (Date.now() - o.createdAt) / 60000;
    let idx = 0;
    STEPS.forEach(([, m], i) => { if (mins >= m) idx = i; });
    return { ...o, status: STEPS[idx][0], timeline: STEPS.map(([s, m], i) => ({ status: s, done: i <= idx, at: i <= idx ? o.createdAt + m * 60000 : null })) };
  }
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const emit = () => document.dispatchEvent(new CustomEvent("store:change"));
  let cart = read(KEY_CART, []), wish = read(KEY_WISH, []);

  window.Store = {
    cart: () => cart.slice(),
    lineKey: l => [l.id, l.size || "-", l.pot || "-"].join("|"),
    add(line) {
      const key = this.lineKey(line);
      const found = cart.find(l => this.lineKey(l) === key);
      if (found) found.qty = Math.min(20, found.qty + (line.qty || 1));
      else cart.push({ ...line, qty: line.qty || 1 });
      write(KEY_CART, cart); emit();
    },
    setQty(key, qty) {
      cart = cart.map(l => this.lineKey(l) === key ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l);
      write(KEY_CART, cart); emit();
    },
    remove(key) { cart = cart.filter(l => this.lineKey(l) !== key); write(KEY_CART, cart); emit(); },
    clear() { cart = []; write(KEY_CART, cart); emit(); },
    count: () => cart.reduce((s, l) => s + l.qty, 0),
    subtotal: () => cart.reduce((s, l) => s + l.unit * l.qty, 0),
    wish: () => wish.slice(),
    isWished: id => wish.includes(id),
    toggleWish(id) { wish = wish.includes(id) ? wish.filter(x => x !== id) : [...wish, id]; write(KEY_WISH, wish); emit(); return wish.includes(id); }
  };
})();
