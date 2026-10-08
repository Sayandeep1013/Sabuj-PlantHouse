(function () {
  UI.init();
  const { $, $$, esc, icons } = UI;
  let pot = null;
  function draw() {
    $("#lib").innerHTML = MOCK.products.map(p => `<a class="tile" href="product.html?p=${p.slug}">${Art.render(p.art, { seed: p.id, pot: p.noVariants ? null : pot, label: p.name })}<h3>${esc(p.name)}</h3><p>type: ${esc(p.art.type)}</p></a>`).join("");
  }
  $("#potPick").innerHTML = `<button class="chip on" data-pot="">Original</button>` + Object.entries(SITE.potColors).map(([k, v]) => `<button class="swatch" data-pot="${k}" style="background:${v.hex}" title="${v.name}" aria-label="${v.name}"></button>`).join("");
  $("#potPick").addEventListener("click", e => {
    const b = e.target.closest("[data-pot]"); if (!b) return;
    pot = b.dataset.pot || null;
    $$("#potPick [data-pot]").forEach(x => x.classList.toggle("on", x === b));
    draw();
  });
  draw(); icons();
})();
