(function () {
  UI.init();
  const { $, $$, esc, icons, money } = UI;
  const S = window.SITE;
  const root = $("#cartRoot");
  let coupon = null, slot = "today-eve", pinInfo = null;

  const today = new Date();
  const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const tomorrow = new Date(today.getTime() + 864e5);
  const SLOTS = [
    ["today-eve", "Today", "4pm – 8pm", "Order before 1pm"],
    ["tmr-morn", fmt(tomorrow), "8am – 12pm", ""],
    ["tmr-eve", fmt(tomorrow), "4pm – 8pm", ""]
  ];

  function totals() {
    const sub = Store.subtotal();
    const mrp = Store.cart().reduce((s, l) => { const p = MOCK.products.find(x => x.id === l.id); return s + (p ? (l.unit + (p.mrp - p.price)) * l.qty : l.unit * l.qty); }, 0);
    const disc = coupon ? coupon.discount : 0;
    const ship = sub - disc >= S.freeDeliveryAbove || !sub ? 0 : S.deliveryFee;
    return { sub, mrp, disc, ship, total: Math.max(0, sub - disc + ship), saved: mrp - sub + disc };
  }

  function render() {
    const lines = Store.cart();
    if (!lines.length) {
      $("#cartTitle").textContent = "Your bag";
      root.innerHTML = `<div class="empty" style="padding:30px 0 60px">${Art.render({ type: "pothos", leaf: "#4F8F3A", variegate: "#D8D06A" }, { seed: "empty-cart", pot: "sage" })}<h4>Your bag is empty</h4><p>Pick a plant or two — they're happier in pairs.</p><a class="btn btn-primary" style="margin-top:18px" href="shop.html">Browse plants</a></div>`;
      icons(); return;
    }
    $("#cartTitle").textContent = `Your bag · ${Store.count()} ${Store.count() === 1 ? "item" : "items"}`;
    const savedPin = UI.store.get("sabuj.pin") || "";
    root.innerHTML = `<div class="checkout">
      <div>
        <div class="panel-card"><h3><span class="n">1</span>Plants</h3><div id="cartLines">${lines.map(UI.lineHTML).join("")}</div></div>
        <form id="checkoutForm" novalidate>
          <div class="panel-card"><h3><span class="n">2</span>Delivery address</h3>
            <div class="form-grid">
              <div class="field"><label for="f-name">Full name</label><input class="input" id="f-name" name="name" autocomplete="name" required><span class="err"></span></div>
              <div class="field"><label for="f-phone">Mobile</label><input class="input" id="f-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="10-digit number" required pattern="[6-9][0-9]{9}"><span class="err"></span></div>
              <div class="field full"><label for="f-line">Flat, building & street</label><input class="input" id="f-line" name="line1" autocomplete="address-line1" required><span class="err"></span></div>
              <div class="field"><label for="f-area">Area / landmark</label><input class="input" id="f-area" name="area" placeholder="e.g. Near Gariahat crossing"></div>
              <div class="field"><label for="f-pin">Pincode</label><input class="input" id="f-pin" name="pincode" inputmode="numeric" maxlength="6" required pattern="[0-9]{6}" value="${esc(savedPin)}"><span class="err" id="pinMsg"></span></div>
              <label class="gift full"><input type="checkbox" name="gift" style="accent-color:var(--leaf);width:18px;height:18px;margin-top:3px"><span>This is a gift — add a handwritten note card and hide prices</span></label>
              <div class="field full" id="noteField" hidden><label for="f-note">Gift note</label><textarea class="input" id="f-note" name="note" maxlength="200" placeholder="Shubho Bijoya! 🌿"></textarea></div>
            </div>
          </div>
          <div class="panel-card"><h3><span class="n">3</span>Delivery slot</h3>
            <div class="slots">${SLOTS.map(([id, d, t, n]) => `<button type="button" class="slot ${id === slot ? "on" : ""}" data-slot="${id}"><b>${d}</b>${t}${n ? `<br><small class="muted">${n}</small>` : ""}</button>`).join("")}</div>
          </div>
          <div class="panel-card"><h3><span class="n">4</span>Payment</h3>
            <div class="pay-opts">
              <label class="pay-opt"><input type="radio" name="pay" value="upi" checked><i data-lucide="smartphone"></i><span><b>UPI</b><small>GPay, PhonePe, Paytm, BHIM</small></span></label>
              <label class="pay-opt"><input type="radio" name="pay" value="card"><i data-lucide="credit-card"></i><span><b>Card / Netbanking</b><small>Secured by your payment gateway</small></span></label>
              <label class="pay-opt"><input type="radio" name="pay" value="cod"><i data-lucide="banknote"></i><span><b>Cash on delivery</b><small>Kolkata pincodes only</small></span></label>
            </div>
          </div>
        </form>
      </div>
      <aside class="summary"><div class="panel-card" id="summary"></div></aside>
    </div>`;
    renderSummary(); icons();
    if (savedPin) checkPin(savedPin);
    prefillFromAccount();
  }

  /* Signed-in customers get their details filled in; guests get a gentle nudge to sign in. */
  async function prefillFromAccount() {
    const u = await Api.auth.me();
    const card = $("#checkoutForm .panel-card h3");
    if (!card) return;
    if (!u) {
      card.insertAdjacentHTML("afterend", `<p class="muted" style="font-size:14px;margin:-6px 0 14px">Ordered before? <a class="link-arrow" href="account.html">Sign in</a> to fill this in automatically.</p>`);
      return;
    }
    const a = u.address || {};
    const fill = (id, v) => { const el = $("#" + id); if (el && !el.value && v) el.value = v; };
    fill("f-name", a.name || u.name); fill("f-phone", u.phone); fill("f-line", a.line1); fill("f-area", a.area); fill("f-pin", a.pincode);
    card.insertAdjacentHTML("afterend", `<p class="muted" style="font-size:14px;margin:-6px 0 14px">Signed in as +91 ${esc(u.phone)}. We've filled in your saved address.</p>`);
    if (a.pincode) checkPin(a.pincode);
  }

  function renderSummary() {
    const t = totals();
    const left = Math.max(0, S.freeDeliveryAbove - (t.sub - t.disc));
    $("#summary").innerHTML = `<h3>Order summary</h3>
      <div class="ship-meter">${left ? `Add <b>${money(left)}</b> more for free delivery` : `<b>Free delivery unlocked</b> 🎉`}<div class="bar"><i style="width:${Math.min(100, (t.sub - t.disc) / S.freeDeliveryAbove * 100)}%"></i></div></div>
      <form class="coupon" id="couponForm"><input class="input" placeholder="Coupon code" aria-label="Coupon code" value="${coupon ? coupon.code : ""}"><button class="btn btn-ghost btn-sm" style="height:44px">${coupon ? "Change" : "Apply"}</button></form>
      <div class="coupon-hint" id="couponMsg">${coupon ? `<span style="color:var(--leaf);font-weight:600">✓ ${esc(coupon.label)}</span>` : `Try <button type="button" data-code="SABUJ10">SABUJ10</button> or <button type="button" data-code="PUJO150">PUJO150</button>`}</div>
      <div style="margin-top:14px">
        <div class="sum-row"><span>Subtotal (MRP ${money(t.mrp)})</span><span>${money(t.sub)}</span></div>
        ${t.disc ? `<div class="sum-row"><span>Coupon ${esc(coupon.code)}</span><span class="save">− ${money(t.disc)}</span></div>` : ""}
        <div class="sum-row"><span>Delivery</span><span>${t.ship ? money(t.ship) : `<span class="save">Free</span>`}</span></div>
        <div class="sum-row total"><span>Total</span><span>${money(t.total)}</span></div>
        ${t.saved > 0 ? `<p class="save" style="font-size:13.5px;color:var(--leaf);font-weight:600">You save ${money(t.saved)} on this order 🌱</p>` : ""}
      </div>
      <button class="btn btn-primary btn-block" id="placeOrder" style="margin-top:16px;height:54px"><i data-lucide="lock"></i>Place order · ${money(t.total)}</button>
      <p class="muted" style="font-size:12.5px;margin-top:10px;text-align:center">By placing the order you agree to our terms. Plants are covered by our 30-day promise.</p>`;
    icons();
  }

  async function checkPin(v) {
    const msg = $("#pinMsg"); if (!msg) return;
    if (!/^\d{6}$/.test(v)) { msg.textContent = ""; pinInfo = null; return; }
    pinInfo = await Api.checkPincode(v);
    msg.style.color = "var(--leaf)";
    msg.textContent = pinInfo.ok ? `${pinInfo.area} · ${pinInfo.eta}${pinInfo.cod ? "" : " · prepaid only"}` : pinInfo.message;
    const cod = $('input[value="cod"]');
    if (cod) { cod.disabled = !pinInfo.cod; if (!pinInfo.cod && cod.checked) $('input[value="upi"]').checked = true; }
  }

  function validate(form) {
    let ok = true;
    $$("[required]", form).forEach(i => {
      const f = i.closest(".field"), bad = !i.checkValidity();
      f.classList.toggle("bad", bad);
      if (i.id !== "f-pin" || bad) f.querySelector(".err").textContent = bad ? (i.validity.valueMissing ? "Required" : i.name === "phone" ? "Enter a valid 10-digit mobile" : "Check this field") : "";
      if (bad && ok) { i.focus(); ok = false; }
    });
    return ok;
  }

  function confetti() {
    const c = document.createElement("div"); c.className = "confetti";
    const cols = ["#2F6B3F", "#4E9A5B", "#C2653F", "#E8B546", "#8DBF6A"];
    c.innerHTML = Array.from({ length: 40 }, (_, i) => `<i style="left:${Math.random() * 100}%;--dx:${(Math.random() - .5) * 300}px;animation-delay:${Math.random() * .6}s"><svg viewBox="0 0 24 24"><path d="M12 22C12 22 3 16 3 9C3 5 7 2 12 2C17 2 21 5 21 9C21 16 12 22 12 22Z" fill="${cols[i % 5]}"/></svg></i>`).join("");
    document.body.appendChild(c); setTimeout(() => c.remove(), 4200);
  }

  async function placeOrder() {
    const form = $("#checkoutForm");
    if (!validate(form)) { UI.toast("Please complete your delivery details", "alert-circle"); return; }
    const fd = new FormData(form);
    const order = {
      items: Store.cart().map(l => ({ productId: l.id, size: l.size, pot: l.pot, qty: l.qty, unitPrice: l.unit })),
      address: { name: fd.get("name"), phone: fd.get("phone"), line1: fd.get("line1"), area: fd.get("area"), pincode: fd.get("pincode") },
      gift: fd.get("gift") ? { note: fd.get("note") || "" } : null,
      slot, payment: fd.get("pay"), coupon: coupon ? coupon.code : null, totals: totals()
    };
    const btn = $("#placeOrder"); btn.disabled = true; btn.innerHTML = "Placing order…";
    try {
      const res = await Api.placeOrder(order);
      Store.clear();
      $("#cartTitle").textContent = "Order placed";
      root.innerHTML = `<div class="success">${Art.render({ type: "bush", leaf: "#3C7A3E", flower: "#D9342B", style: "five" }, { seed: "ok", pot: "terracotta" })}
        <span class="eyebrow"><i data-lucide="party-popper"></i>Order ${esc(res.orderId)}</span>
        <h1>Your plants are <em>on their way.</em></h1>
        <p class="muted">We've sent the details to ${esc(order.address.phone)} on WhatsApp. Expected: <b>${esc(res.eta)}</b>.</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap"><a class="btn btn-primary" href="shop.html">Keep browsing</a><a class="btn btn-ghost" href="track.html?id=${encodeURIComponent(res.orderId)}"><i data-lucide="truck"></i>Track this order</a></div></div>`;
      confetti(); icons(); scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      btn.disabled = false; renderSummary(); UI.toast("Couldn't place the order — please try again", "alert-circle");
    }
  }

  root.addEventListener("click", async e => {
    const t = e.target;
    const s = t.closest("[data-slot]"); if (s) { slot = s.dataset.slot; $$("[data-slot]").forEach(b => b.classList.toggle("on", b === s)); return; }
    const c = t.closest("[data-code]"); if (c) { $("#couponForm input").value = c.dataset.code; $("#couponForm").requestSubmit(); return; }
    if (t.closest("#placeOrder")) placeOrder();
  });
  root.addEventListener("submit", async e => {
    if (e.target.id === "couponForm") {
      e.preventDefault();
      const code = $("input", e.target).value.trim();
      if (!code) { coupon = null; renderSummary(); return; }
      const r = await Api.validateCoupon(code, Store.subtotal());
      if (r.ok) { coupon = r; renderSummary(); UI.toast(`${r.code} applied — you save ${money(r.discount)}`, "badge-percent"); }
      else { coupon = null; renderSummary(); $("#couponMsg").innerHTML = `<span style="color:var(--danger)">${esc(r.message)}</span>`; }
    } else e.preventDefault();
  });
  root.addEventListener("input", e => {
    if (e.target.name === "pincode") checkPin(e.target.value);
    const f = e.target.closest(".field.bad"); if (f && e.target.checkValidity()) { f.classList.remove("bad"); if (e.target.name !== "pincode") f.querySelector(".err").textContent = ""; }
  });
  root.addEventListener("change", e => { if (e.target.name === "gift") $("#noteField").hidden = !e.target.checked; });

  document.addEventListener("store:change", () => {
    if (!Store.cart().length) return render();
    const lines = $("#cartLines"); if (!lines) return;
    if (coupon) Api.validateCoupon(coupon.code, Store.subtotal()).then(r => { coupon = r.ok ? r : null; renderSummary(); });
    lines.innerHTML = Store.cart().map(UI.lineHTML).join(""); renderSummary();
    $("#cartTitle").textContent = `Your bag · ${Store.count()} ${Store.count() === 1 ? "item" : "items"}`;
    icons();
  });

  render();
})();
