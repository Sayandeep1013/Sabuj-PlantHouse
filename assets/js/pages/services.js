(async function () {
  UI.init();
  const { $, $$, esc, icons, reveal } = UI;
  const S = window.SITE;
  const meta = await Api.meta();

  $("#waBtn").href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent("Hi Sabuj plant doctor! Here's a photo of my plant:")}`;
  $("#svcArt").innerHTML = [
    [{ type: "palm", leaf: "#5C9A43" }, "terracotta", "a"],
    [{ type: "bush", leaf: "#3C7A3E", flower: "#C83E8C", style: "bract" }, "white", "b"],
    [{ type: "snake", leaf: "#3E6E3F" }, "black", "c"]
  ].map(([a, pot, s], i) => `<div style="transform:scale(${i === 1 ? 1.15 : .95});transform-origin:bottom">${Art.render(a, { seed: "svc" + s, pot })}</div>`).join("");

  $("#svcAll").innerHTML = meta.services.map(s => `<div class="svc" id="svc-${s.id}"><span class="ic"><i data-lucide="${s.icon}"></i></span><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p><span class="pr">${esc(s.price)}</span><button class="link-arrow" style="align-self:flex-start;position:relative;z-index:1" data-book="${s.id}">Book this <i data-lucide="arrow-right"></i></button></div>`).join("");
  $("#b-svc").innerHTML = meta.services.map(s => `<option value="${s.id}">${esc(s.name)} — ${esc(s.price)}</option>`).join("");
  $("#areaList").innerHTML = meta.areas.map(([n]) => `<option value="${esc(n)}">`).join("");
  $("#b-date").min = new Date().toISOString().slice(0, 10);
  $("#contactList").innerHTML = `
    <a href="https://wa.me/${S.whatsapp}" target="_blank" rel="noopener"><span class="ic"><i data-lucide="message-circle"></i></span><span><b>WhatsApp</b><small>Fastest — send photos of your space</small></span></a>
    <a href="tel:${S.phone.replace(/\s/g, "")}"><span class="ic"><i data-lucide="phone"></i></span><span><b>${S.phone}</b><small>${S.hours}</small></span></a>
    <div><span class="ic"><i data-lucide="map-pin"></i></span><span><b>Visit the nursery</b><small>${S.address}</small></span></div>`;

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-book]"); if (!b) return;
    $("#b-svc").value = b.dataset.book;
    $("#book").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#b-name").focus({ preventScroll: true }), 600);
  });

  $("#bookForm").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target; let ok = true;
    $$("[required]", f).forEach(i => {
      const bad = !i.checkValidity(), fl = i.closest(".field");
      fl.classList.toggle("bad", bad);
      fl.querySelector(".err").textContent = bad ? (i.validity.valueMissing ? "Required" : "Enter a valid 10-digit mobile") : "";
      if (bad && ok) { i.focus(); ok = false; }
    });
    if (!ok) return;
    const btn = $("button", f); btn.disabled = true; btn.textContent = "Sending…";
    const res = await Api.bookService(Object.fromEntries(new FormData(f)));
    f.innerHTML = `<div class="success" style="padding:20px 0">${Art.render({ type: "monstera", leaf: "#2F7A45" }, { seed: "booked", pot: "sage" })}<h3 style="font-size:30px;margin:10px 0">Request received!</h3><p class="muted">Reference <b>${esc(res.ref)}</b>. Our garden team will call you within 2 hours.</p></div>`;
    icons();
  });

  $("#bookForm").addEventListener("input", e => { const f = e.target.closest(".field.bad"); if (f && e.target.checkValidity()) { f.classList.remove("bad"); f.querySelector(".err").textContent = ""; } });

  icons(); reveal();
})();
