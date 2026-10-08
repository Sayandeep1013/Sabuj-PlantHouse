(async function () {
  UI.init();
  const { $, $$, esc, icons, reveal, guideCard } = UI;
  let topic = new URLSearchParams(location.search).get("topic") || "";

  $("#topicChips").innerHTML = `<button class="chip" data-topic="">All guides</button>` +
    MOCK.guideTopics.map(t => `<button class="chip" data-topic="${t.id}">${esc(t.name)}</button>`).join("");

  UI.fadeEdges();

  async function load() {
    $$("#topicChips .chip").forEach(c => c.classList.toggle("on", c.dataset.topic === topic));
    history.replaceState(null, "", "guides.html" + (topic ? "?topic=" + topic : ""));
    const grid = $("#guideGrid");
    grid.innerHTML = UI.skeletons(3);
    const list = await Api.listGuides({ topic });
    grid.classList.remove("in"); grid.classList.add("stagger");
    grid.innerHTML = list.map(guideCard).join("");
    icons(); reveal();
  }
  $("#topicChips").addEventListener("click", e => { const b = e.target.closest("[data-topic]"); if (b) { topic = b.dataset.topic; load(); } });
  load();
})();
