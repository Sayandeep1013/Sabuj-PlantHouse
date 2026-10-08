(async function () {
  UI.init();
  const { $, esc, icons, reveal, card, guideCard } = UI;
  const S = window.SITE;
  const slug = new URLSearchParams(location.search).get("g") || "";
  const root = $("#articleRoot");

  let g;
  try { g = await Api.getGuide(slug); }
  catch (e) {
    root.innerHTML = `<div class="empty">${Art.render({ type: "succulent", leaf: "#8DB4A8", tip: "#D98C9A" }, { seed: "404g", pot: "blush" })}<h4>That guide has wandered off</h4><p>Try one of the others below.</p></div>`;
    $("#crumbNow").textContent = "Not found";
  }

  if (g) {
    document.title = g.title + " · Sabuj";
    $("#crumbNow").textContent = g.title;
    const date = new Date(g.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const block = ([type, val]) => {
      if (type === "h") return `<h2>${esc(val)}</h2>`;
      if (type === "list") return `<ul>${val.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
      if (type === "tip") return `<div class="tip"><span class="ic"><i data-lucide="lightbulb"></i></span><div><b>Grower's tip</b><br>${esc(val)}</div></div>`;
      return `<p>${esc(val)}</p>`;
    };
    const shareText = encodeURIComponent(`${g.title} — ${location.href}`);
    root.innerHTML = `
      <header class="article-hero">
        <div>
          <span class="tag tag-pujo">${esc(g.kicker)}</span>
          <h1>${esc(g.title)}</h1>
          <p style="color:var(--ink-2);font-size:17px">${esc(g.excerpt)}</p>
          <div class="meta"><span style="display:inline-flex;gap:6px;align-items:center"><i data-lucide="clock-3"></i>${g.mins} min read</span><span>${date}</span><span>By the Sabuj growers</span></div>
        </div>
        ${Art.render(g.art, { seed: g.slug, label: g.title })}
      </header>
      <div class="prose">${g.body.map(block).join("")}</div>
      <div class="share">
        <b style="margin-right:auto">Found this useful?</b>
        <a class="btn btn-ghost btn-sm" href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i>Share on WhatsApp</a>
        <button class="btn btn-ghost btn-sm" id="copyLink"><i data-lucide="link"></i>Copy link</button>
        <a class="btn btn-primary btn-sm" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent("Hi plant doctor! I read your guide and have a question:")}" target="_blank" rel="noopener"><i data-lucide="stethoscope"></i>Ask the plant doctor</a>
      </div>`;
    $("#copyLink").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(location.href); UI.toast("Link copied", "link"); }
      catch (e) { UI.toast("Couldn't copy — use your browser's share menu", "alert-circle"); }
    });

    if (g.products && g.products.length) {
      const { items } = await Api.listProducts({ ids: g.products });
      $("#guideProducts").innerHTML = items.map(card).join("");
      $("#guideProducts").classList.add("stagger");
      $("#shopGuide").hidden = false;
    }
  }

  const more = (await Api.listGuides()).filter(x => !g || x.slug !== g.slug).slice(0, 3);
  $("#moreGuides").innerHTML = more.map(guideCard).join("");
  $("#moreGuides").classList.add("stagger");
  icons(); reveal();
})();
