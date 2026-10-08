(function () {
  UI.init();
  const { $, $$, esc, icons, money, card, reveal } = UI;
  const S = window.SITE;
  const root = $("#acctRoot");
  let user = null;

  /* ---------------- sign in ---------------- */
  function signIn() {
    $("#acctTitle").innerHTML = "Hello, <em>plant parent.</em>";
    root.innerHTML = `<div class="auth-wrap">
      <div class="auth-art">${Art.render({ type: "monstera", leaf: "#2F7A45" }, { seed: "login", pot: "mustard" })}</div>
      <div class="auth-card">
        <span class="eyebrow"><i data-lucide="smartphone"></i>Sign in with your mobile</span>
        <div id="step"></div>
      </div>
    </div>`;
    phoneStep();
  }

  function phoneStep(prefill = "") {
    $("#step").innerHTML = `<h2>No passwords. Just your number.</h2>
      <p class="muted" style="margin-bottom:18px">We'll send a one-time code on SMS & WhatsApp. Same number you use for orders, so your history is waiting.</p>
      <form id="phoneForm" novalidate>
        <div class="field"><label for="a-phone">Mobile number</label>
          <div class="phone-field"><span>+91</span><input id="a-phone" inputmode="tel" maxlength="10" autocomplete="tel-national" placeholder="98300 12345" value="${esc(prefill)}"></div>
          <span class="err" id="phoneErr"></span></div>
        <button class="btn btn-primary btn-block" style="margin-top:16px;height:52px">Send code <i data-lucide="arrow-right"></i></button>
      </form>`;
    icons();
    $("#a-phone").focus();
    $("#phoneForm").addEventListener("submit", async e => {
      e.preventDefault();
      const phone = $("#a-phone").value.replace(/\D/g, "");
      const btn = $("button", e.target); btn.disabled = true;
      const r = await Api.auth.requestOtp(phone);
      btn.disabled = false;
      if (!r.ok) { $("#phoneErr").textContent = r.message; return; }
      otpStep(phone, r.devCode);
    });
  }

  function otpStep(phone, devCode) {
    $("#step").innerHTML = `<h2>Enter the 4-digit code</h2>
      <p class="muted" style="margin-bottom:18px">Sent to +91 ${esc(phone.replace(/(\d{5})(\d{5})/, "$1 $2"))} · <button class="link-arrow" id="changeNo" style="font-size:14px">Change</button></p>
      <form id="otpForm" novalidate>
        <div class="otp">${[0, 1, 2, 3].map(i => `<input inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" autocomplete="${i ? "off" : "one-time-code"}">`).join("")}</div>
        <span class="err" id="otpErr" style="color:var(--danger);font-size:13px"></span>
        ${devCode ? `<div class="dev-note">Demo mode: use code <b>${devCode}</b>. A real backend sends it by SMS.</div>` : ""}
        <button class="btn btn-primary btn-block" style="margin-top:16px;height:52px">Verify & sign in</button>
        <p class="muted" style="font-size:13.5px;margin-top:12px">Didn't get it? <button type="button" class="link-arrow" id="resend" style="font-size:13.5px" disabled>Resend in <span id="cd">30</span>s</button></p>
      </form>`;
    const boxes = $$(".otp input");
    boxes[0].focus();
    boxes.forEach((b, i) => {
      b.addEventListener("input", () => {
        b.value = b.value.replace(/\D/g, "").slice(-1);
        if (b.value && boxes[i + 1]) boxes[i + 1].focus();
        if (boxes.every(x => x.value)) $("#otpForm").requestSubmit();
      });
      b.addEventListener("keydown", e => { if (e.key === "Backspace" && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
      b.addEventListener("paste", e => {
        const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 4);
        if (!digits) return;
        e.preventDefault();
        digits.split("").forEach((d, k) => { if (boxes[k]) boxes[k].value = d; });
        if (digits.length === 4) $("#otpForm").requestSubmit(); else boxes[digits.length].focus();
      });
    });
    let left = 30;
    const tick = setInterval(() => {
      left--; const cd = $("#cd"); if (cd) cd.textContent = left;
      if (left <= 0) { clearInterval(tick); const r = $("#resend"); if (r) { r.disabled = false; r.textContent = "Resend code"; } }
    }, 1000);
    $("#resend").addEventListener("click", async () => { clearInterval(tick); const r = await Api.auth.requestOtp(phone); UI.toast("New code sent", "message-square"); otpStep(phone, r.devCode); });
    $("#changeNo").addEventListener("click", () => { clearInterval(tick); phoneStep(phone); });
    $("#otpForm").addEventListener("submit", async e => {
      e.preventDefault();
      const code = boxes.map(b => b.value).join("");
      if (code.length < 4) { $("#otpErr").textContent = "Enter all 4 digits"; return; }
      const r = await Api.auth.verifyOtp(phone, code);
      if (!r.ok) { $("#otpErr").textContent = r.message; boxes.forEach(b => b.value = ""); boxes[0].focus(); return; }
      clearInterval(tick);
      user = r.user;
      UI.toast("Signed in — welcome!", "leaf");
      dashboard(user.name ? "orders" : "profile");
    });
  }

  /* ---------------- dashboard ---------------- */
  const TABS = [["orders", "package", "Orders"], ["address", "map-pin", "Address"], ["profile", "user-round", "Profile"], ["saved", "heart", "Saved plants"]];
  const STATUS = { placed: "Order received", packed: "Potted & packed", out: "Out with our rider", delivered: "Delivered" };

  function dashboard(tab) {
    tab = TABS.some(t => t[0] === tab) ? tab : "orders";
    const first = (user.name || "").split(" ")[0];
    $("#acctTitle").innerHTML = first ? `Hi, <em>${esc(first)}.</em>` : "My account";
    root.innerHTML = `<div class="acct">
      <nav class="acct-side" role="tablist" aria-label="Account sections">
        <div class="who"><span class="av">${Art.render({ type: "succulent", leaf: "#8DB4A8", tip: "#D98C9A" }, { seed: user.phone, pot: "blush" })}</span><div><b>${esc(user.name || "Plant parent")}</b><br><small class="muted">+91 ${esc(user.phone)}</small></div></div>
        ${TABS.map(([id, ic, label]) => `<button role="tab" data-tab="${id}" aria-selected="${id === tab}"><i data-lucide="${ic}"></i>${label}</button>`).join("")}
        <button id="logout"><i data-lucide="log-out"></i>Sign out</button>
      </nav>
      <div id="panel"></div>
    </div>`;
    history.replaceState(null, "", "account.html#" + tab);
    icons();
    root.querySelector(".acct-side").addEventListener("click", async e => {
      const b = e.target.closest("[data-tab]");
      if (b) { $$(".acct-side [data-tab]").forEach(x => x.setAttribute("aria-selected", x === b)); history.replaceState(null, "", "account.html#" + b.dataset.tab); return panels[b.dataset.tab](); }
      if (e.target.closest("#logout")) { await Api.auth.logout(); user = null; UI.toast("Signed out", "log-out"); signIn(); }
    });
    panels[tab]();
  }

  const panels = {
    async orders() {
      const panel = $("#panel");
      panel.innerHTML = `<div class="skel" style="aspect-ratio:auto;height:140px"></div>`;
      const orders = await Api.listOrders();
      if (!orders.length) {
        panel.innerHTML = `<div class="empty">${Art.render({ type: "pothos", leaf: "#4F8F3A", variegate: "#D8D06A" }, { seed: "no-orders", pot: "terracotta" })}<h4>No orders yet</h4><p>Your first plant is a click away.</p><a class="btn btn-primary" style="margin-top:16px" href="shop.html">Browse plants</a></div>`;
        return icons();
      }
      panel.innerHTML = orders.map(o => `<div class="order-card">
        <div class="top"><div><b>${esc(o.id)}</b> <small class="muted">· ${new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</small></div><span class="status ${o.status}">${STATUS[o.status]}</span></div>
        <div class="thumbs">${o.items.map(it => { const p = MOCK.products.find(x => x.id === it.productId); return p ? `<span title="${esc(p.name)} × ${it.qty}">${Art.render(p.art, { seed: p.id, pot: it.pot })}</span>` : ""; }).join("")}</div>
        <div class="top"><span><b>${money(o.totals.total)}</b> <small class="muted">· ${o.items.reduce((s, i) => s + i.qty, 0)} items</small></span>
          <span style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" data-reorder="${esc(o.id)}"><i data-lucide="rotate-ccw"></i>Reorder</button><a class="btn btn-primary btn-sm" href="track.html?id=${esc(o.id)}"><i data-lucide="truck"></i>Track</a></span></div>
      </div>`).join("");
      icons();
      panel.onclick = e => {
        const b = e.target.closest("[data-reorder]"); if (!b) return;
        const o = orders.find(x => x.id === b.dataset.reorder);
        o.items.forEach(it => {
          const p = MOCK.products.find(x => x.id === it.productId); if (!p) return;
          const size = S.sizes.find(s => s.id === it.size);
          Store.add({ id: p.id, name: p.name, unit: it.unitPrice, qty: it.qty, size: it.size, sizeLabel: size && size.label, pot: it.pot, potLabel: it.pot && S.potColors[it.pot] ? S.potColors[it.pot].name + " pot" : null });
        });
        UI.toast("Added to your bag again", "rotate-ccw"); UI.openCart();
      };
    },
    address() {
      const a = user.address || {};
      $("#panel").innerHTML = `<form class="panel-card" id="addrForm" novalidate><h3>Delivery address</h3>
        <p class="muted" style="margin:-6px 0 16px;font-size:14px">Used to pre-fill checkout. We update it whenever you place an order.</p>
        <div class="form-grid">
          <div class="field"><label for="ad-name">Name</label><input class="input" id="ad-name" name="name" value="${esc(a.name || user.name || "")}"></div>
          <div class="field"><label for="ad-pin">Pincode</label><input class="input" id="ad-pin" name="pincode" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" value="${esc(a.pincode || "")}"></div>
          <div class="field full"><label for="ad-line">Flat, building & street</label><input class="input" id="ad-line" name="line1" value="${esc(a.line1 || "")}"></div>
          <div class="field full"><label for="ad-area">Area / landmark</label><input class="input" id="ad-area" name="area" value="${esc(a.area || "")}"></div>
          <button class="btn btn-primary full">Save address</button>
        </div></form>`;
      $("#addrForm").addEventListener("submit", async e => {
        e.preventDefault();
        const f = e.target;
        if (!f.pincode.checkValidity()) { UI.toast("Pincode should be 6 digits", "alert-circle"); return; }
        user = await Api.auth.updateProfile({ address: { ...Object.fromEntries(new FormData(f)), phone: user.phone } });
        UI.toast("Address saved", "map-pin");
      });
    },
    profile() {
      $("#panel").innerHTML = `<form class="panel-card" id="profForm" novalidate><h3>${user.name ? "Your details" : "Tell us your name"}</h3>
        <div class="form-grid">
          <div class="field"><label for="pf-name">Full name</label><input class="input" id="pf-name" name="name" required autocomplete="name" value="${esc(user.name || "")}"></div>
          <div class="field"><label for="pf-email">Email (optional)</label><input class="input" id="pf-email" name="email" type="email" autocomplete="email" value="${esc(user.email || "")}"></div>
          <div class="field full"><label>Mobile</label><input class="input" value="+91 ${esc(user.phone)}" disabled></div>
          <label class="gift full"><input type="checkbox" name="tips" ${user.tips !== false ? "checked" : ""} style="accent-color:var(--leaf);width:18px;height:18px;margin-top:3px"><span>Send me seasonal care reminders on WhatsApp</span></label>
          <button class="btn btn-primary full">Save</button>
        </div></form>`;
      $("#profForm").addEventListener("submit", async e => {
        e.preventDefault();
        const f = e.target;
        if (!f.name.value.trim()) { f.name.focus(); return; }
        if (f.email.value && !f.email.checkValidity()) { UI.toast("That email doesn't look right", "alert-circle"); return; }
        user = await Api.auth.updateProfile({ name: f.name.value.trim(), email: f.email.value.trim(), tips: f.tips.checked });
        UI.toast("Profile saved", "check-circle-2");
        dashboard("profile");
      });
    },
    async saved() {
      const ids = Store.wish();
      if (!ids.length) {
        $("#panel").innerHTML = `<div class="empty">${Art.render({ type: "cactus", leaf: "#5E9A5A", flower: "#E6789A" }, { seed: "nosaved", pot: "terracotta" })}<h4>Nothing saved yet</h4><p>Tap the heart on any plant to keep it here.</p></div>`;
        return;
      }
      const { items } = await Api.listProducts({ ids });
      $("#panel").innerHTML = `<div class="grid-products">${items.map(card).join("")}</div>`;
      icons(); reveal();
    }
  };

  document.addEventListener("store:change", () => {
    const tab = (location.hash || "").slice(1);
    if (user && tab === "saved") panels.saved();
  });

  Api.auth.me().then(u => { user = u; if (user) dashboard((location.hash || "").slice(1)); else signIn(); });
})();
