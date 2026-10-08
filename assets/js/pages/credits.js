(function () {
  UI.init();
  const { $, esc, icons } = UI;
  $("#credits").innerHTML = Object.entries(window.IMAGE_CREDITS || {}).map(([id, c]) => {
    const p = MOCK.products.find(x => x.id === id);
    return `<div class="svc" style="padding:0;overflow:hidden;gap:0"><img src="${esc(c.src)}" alt="" loading="lazy" style="aspect-ratio:4/3;object-fit:cover;width:100%">
      <div style="padding:16px;display:grid;gap:4px;font-size:13.5px"><b style="font-size:15px">${esc(p ? p.name : id)}</b>
      <span class="muted">“${esc(c.title)}”</span><span>By ${esc(c.author)} · ${esc(c.license)}</span>
      <a class="link-arrow" style="justify-self:start;font-size:13px" href="${esc(c.page)}" target="_blank" rel="noopener">View on Wikimedia Commons <i data-lucide="external-link"></i></a></div></div>`;
  }).join("");
  icons();
})();
