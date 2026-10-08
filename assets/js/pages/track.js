(function () {
  UI.init();
  const { $, esc, icons, money } = UI;
  const S = window.SITE;
  const root = $("#trackRoot");
  const params = new URLSearchParams(location.search);

  const STEP = {
    placed: ["clipboard-check", "Order received", "We've got it — your plants are being picked at the nursery."],
    packed: ["package", "Potted & packed", "Watered, staked and wrapped by hand."],
    out: ["bike", "Out with our rider", "On the way in a Sabuj delivery bag."],
    delivered: ["house", "Delivered", "Say hello to your new roommates!"]
  };
  const POS = { placed: 14, packed: 38, out: 64, delivered: 86 };
  const fmtTime = (t) => new Date(t).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" });
  let timer;

  function lookupForm(msg) {
    root.innerHTML = `<div class="track-hero">
      <form class="panel-card" id="lookup" novalidate style="max-width:520px">
        <h3>Find your order</h3>
        <p class="muted" style="margin:-6px 0 16px;font-size:14.5px">Your order ID is in the WhatsApp message we sent, and looks like SB1234567.</p>
        <div class="form-grid">
          <div class="field full"><label for="t-id">Order ID</label><input class="input" id="t-id" name="id" required placeholder="SB1234567" style="text-transform:uppercase" value="${esc(params.get("id") || "")}"></div>
          <div class="field full"><label for="t-phone">Mobile used for the order</label><input class="input" id="t-phone" name="phone" inputmode="tel" required pattern="[6-9][0-9]{9}" placeholder="10-digit number"></div>
          <div class="err full" id="lookupErr" style="color:var(--danger);font-size:14px">${msg ? esc(msg) : ""}</div>
          <button class="btn btn-primary btn-block full">Track order</button>
        </div>
        <p class="muted" style="font-size:13px;margin-top:14px">Signed in? Your orders are all in <a class="link-arrow" href="account.html">My account</a>.</p>
      </form>
      <div class="auth-art">${Art.render({ type: "bush", leaf: "#3C7A3E", flower: "#C83E8C", style: "bract" }, { seed: "track", pot: "white" })}</div>
    </div>`;
    icons();
    $("#lookup").addEventListener("submit", async e => {
      e.preventDefault();
      const f = e.target;
      if (!f.checkValidity()) { $("#lookupErr").textContent = "Enter your order ID and a valid 10-digit mobile."; return; }
      await show(f.id.value.trim(), f.phone.value.trim());
    });
  }

  async function show(id, phone) {
    let o;
    try { o = await Api.getOrder(id, phone); }
    catch (e) { return lookupForm(e.message); }
    history.replaceState(null, "", "track.html?id=" + o.id);
    const first = MOCK.products.find(p => p.id === (o.items[0] || {}).productId) || MOCK.products[0];
    const now = o.timeline.filter(t => t.done).pop();
    const delivered = o.status === "delivered";
    root.innerHTML = `<div class="track-hero">
      <div>
        <div class="road ${delivered ? "done" : ""}" aria-hidden="true">
          <span class="end a"><i data-lucide="store"></i>Nursery</span>
          <span class="end b"><i data-lucide="house"></i>You</span>
          <div class="walker" id="walker" style="left:8%">${Art.render(first.art, { seed: first.id, pot: (o.items[0] || {}).pot })}</div>
        </div>
        <div class="panel-card">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:18px">
            <div><small class="muted">Order</small><h3 style="margin:0">${esc(o.id)}</h3></div>
            <span class="status ${o.status}">${STEP[o.status][1]}</span>
          </div>
          <ol class="timeline">${o.timeline.map(t => `<li class="${t.done ? "done" : ""} ${t === now ? "now" : ""}">
            <span class="dot"><i data-lucide="${STEP[t.status][0]}"></i></span>
            <div><b>${STEP[t.status][1]}</b><small>${t.done ? fmtTime(t.at) + " · " : ""}${STEP[t.status][2]}</small></div></li>`).join("")}</ol>
          ${delivered ? "" : `<p class="muted" style="font-size:13.5px">Expected: <b style="color:var(--ink)">${esc(o.eta)}</b> · this page refreshes by itself.</p>`}
        </div>
      </div>
      <aside class="panel-card">
        <h3>Order details</h3>
        <div>${o.items.map(it => { const p = MOCK.products.find(x => x.id === it.productId); return p ? `<div class="line" style="grid-template-columns:60px 1fr auto"><div class="thumb" style="width:60px;height:60px">${Art.render(p.art, { seed: p.id, pot: it.pot })}</div><div><h4>${esc(p.name)}</h4><div class="meta">Qty ${it.qty}</div></div><div class="price">${money(it.unitPrice * it.qty)}</div></div>` : ""; }).join("")}</div>
        <div class="sum-row total"><span>Paid${o.payment === "cod" ? " on delivery" : ""}</span><span>${money(o.totals.total)}</span></div>
        <div style="margin-top:14px;font-size:14px;display:grid;gap:4px">
          <b>Delivering to</b><span class="muted">${esc(o.address.name)} · ${esc(o.address.line1)}${o.address.area ? ", " + esc(o.address.area) : ""} · ${esc(o.address.pincode)}</span>
        </div>
        <a class="btn btn-ghost btn-block" style="margin-top:18px" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent("Hi! Question about order " + o.id)}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i>Message us about this order</a>
      </aside>
    </div>`;
    icons();
    setTimeout(() => { const w = $("#walker"); if (w) w.style.left = POS[o.status] + "%"; }, 60);
    clearTimeout(timer);
    if (!delivered) timer = setTimeout(() => show(o.id, phone), 30000);
  }

  const id = params.get("id");
  if (id) show(id); else lookupForm();
})();
