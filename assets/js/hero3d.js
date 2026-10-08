/* ------------------------------------------------------------------
   Procedural 3D monstera for the hero (Three.js r128, no external
   models). Drag to spin. Falls back to the SVG illustration when
   WebGL is unavailable.
------------------------------------------------------------------- */
window.Hero3D = {
  mount(stage) {
    const fallback = () => stage.insertAdjacentHTML("beforeend", `<div class="fallback">${Art.render({ type: "monstera", leaf: "#2F7A45" }, { seed: "hero", pot: "terracotta" })}</div>`);
    if (!window.THREE) return fallback();
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return fallback(); }
    if (!renderer.getContext()) return fallback();

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    stage.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", "3D monstera plant — drag to rotate");
    renderer.domElement.style.cursor = "grab";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, 2.6, 9.2);
    camera.lookAt(0, 1.75, 0);

    scene.add(new THREE.HemisphereLight(0xfff4dc, 0x2f6b3f, .95));
    const key = new THREE.DirectionalLight(0xffffff, .95); key.position.set(3, 6, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd59a, .45); rim.position.set(-5, 3, -3); scene.add(rim);

    const world = new THREE.Group(); scene.add(world);
    const plant = new THREE.Group(); world.add(plant);

    /* pot */
    const prof = [[0, 0], [.74, 0], [.8, .05], [.98, 1.0], [1.12, 1.03], [1.15, 1.1], [1.15, 1.3], [1.11, 1.34], [1.0, 1.34], [.97, 1.18], [0, 1.18]]
      .map(([x, y]) => new THREE.Vector2(x, y));
    const potMat = new THREE.MeshStandardMaterial({ color: 0xc2653f, roughness: .82 });
    const pot = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), potMat);
    world.add(pot);
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.02, .025, 8, 64), new THREE.MeshStandardMaterial({ color: 0x8e4127, roughness: .9 }));
    band.rotation.x = Math.PI / 2; band.position.y = .16; band.scale.set(.92, .92, 1); world.add(band);
    const soil = new THREE.Mesh(new THREE.CircleGeometry(.98, 48), new THREE.MeshStandardMaterial({ color: 0x3e2a1e, roughness: 1 }));
    soil.rotation.x = -Math.PI / 2; soil.position.y = 1.2; world.add(soil);
    /* goofy face on the pot: canvas texture on a curved patch hugging the pot wall */
    const fc = document.createElement("canvas"); fc.width = 512; fc.height = 256;
    const fx = fc.getContext("2d");
    const faceTex = new THREE.CanvasTexture(fc); faceTex.encoding = THREE.sRGBEncoding; faceTex.anisotropy = 4;
    function drawFace(closed, grin) {
      fx.clearRect(0, 0, 512, 256);
      fx.fillStyle = "rgba(242,125,134,.55)";
      [[150, 150], [362, 150]].forEach(([x, y]) => { fx.beginPath(); fx.ellipse(x, y, 34, 20, 0, 0, 7); fx.fill(); });
      fx.fillStyle = fx.strokeStyle = "#1E2B22"; fx.lineCap = "round"; fx.lineWidth = 14;
      [196, 316].forEach(x => {
        if (closed) { fx.beginPath(); fx.moveTo(x - 22, 112); fx.quadraticCurveTo(x, 124, x + 22, 112); fx.stroke(); return; }
        fx.beginPath(); fx.ellipse(x, 108, 20, 27, 0, 0, 7); fx.fill();
        fx.fillStyle = "#fff"; fx.beginPath(); fx.arc(x + 7, 98, 7, 0, 7); fx.fill(); fx.fillStyle = "#1E2B22";
      });
      fx.beginPath();
      if (grin) { fx.moveTo(220, 150); fx.quadraticCurveTo(256, 215, 292, 150); fx.closePath(); fx.fill(); fx.fillStyle = "#E8707A"; fx.beginPath(); fx.ellipse(256, 182, 16, 9, 0, 0, 7); fx.fill(); }
      else { fx.moveTo(224, 152); fx.quadraticCurveTo(256, 190, 288, 152); fx.stroke(); }
      faceTex.needsUpdate = true;
    }
    drawFace(false, false);
    const facePatch = new THREE.Mesh(
      new THREE.CylinderGeometry(.985, .855, .66, 32, 1, true, -.75, 1.5),
      new THREE.MeshStandardMaterial({ map: faceTex, transparent: true, roughness: .8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
    );
    facePatch.position.y = .6; world.add(facePatch);
    let grinning = false;
    (function blink() { drawFace(true, grinning); setTimeout(() => drawFace(false, grinning), 140); setTimeout(blink, 2800 + Math.random() * 3000); })();

    for (let i = 0; i < 14; i++) {
      const peb = new THREE.Mesh(new THREE.SphereGeometry(.05 + Math.random() * .04, 8, 6), new THREE.MeshStandardMaterial({ color: [0xe9e4da, 0xc9c2b6, 0xa39c90][i % 3], roughness: .7 }));
      const a = Math.random() * Math.PI * 2, r = .3 + Math.random() * .6;
      peb.position.set(Math.cos(a) * r, 1.22, Math.sin(a) * r); peb.scale.y = .6; world.add(peb);
    }

    /* shadow */
    const cv = document.createElement("canvas"); cv.width = cv.height = 128;
    const g = cv.getContext("2d"), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(20,40,28,.35)"); grd.addColorStop(1, "rgba(20,40,28,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .01; scene.add(shadow);

    /* monstera leaf geometry with fenestrations */
    function leafGeo(L, W, holes) {
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.bezierCurveTo(W * .5, -.06, W * 1.05, L * .25, W * .9, L * .55);
      s.bezierCurveTo(W * .75, L * .86, W * .25, L, 0, L);
      s.bezierCurveTo(-W * .25, L, -W * .75, L * .86, -W * .9, L * .55);
      s.bezierCurveTo(-W * 1.05, L * .25, -W * .5, -.06, 0, 0);
      if (holes) [.3, .5, .68].forEach((k, i) => [-1, 1].forEach(sd => {
        const h = new THREE.Path();
        h.absellipse(sd * W * (.5 + i * .02), L * k, W * .17, L * .035, 0, Math.PI * 2, false, sd * .45);
        s.holes.push(h);
      }));
      const geo = new THREE.ShapeGeometry(s, 28);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, -.32 * Math.pow(y / L, 2) + .2 * Math.pow(x / W, 2));
      }
      geo.computeVertexNormals();
      return geo;
    }

    const leafCols = [0x2f7a45, 0x3a8a4f, 0x276b3b, 0x34804a];
    const sways = [];
    const N = 7;
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2 + (Math.random() - .5) * .4;
      const elev = .35 + Math.random() * .5;
      const reach = .7 + Math.random() * .55;
      const height = 2.1 + Math.random() * 1.3 - (i % 2) * .3;
      const u = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      const tip = u.clone().multiplyScalar(reach).setY(height);

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(u.x * .08, 1.15, u.z * .08),
        new THREE.Vector3(u.x * reach * .25, 1.15 + (height - 1.15) * .55, u.z * reach * .25),
        tip
      ]);
      const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, .038, 6), new THREE.MeshStandardMaterial({ color: 0x4f8a3e, roughness: .6 }));
      plant.add(stem);

      const f = u.clone().multiplyScalar(Math.cos(elev)).add(new THREE.Vector3(0, Math.sin(elev), 0)).normalize();
      let sAx = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
      let n = new THREE.Vector3().crossVectors(sAx, f).normalize();
      if (n.y < 0) { sAx.negate(); n.negate(); }
      const pivot = new THREE.Object3D();
      pivot.position.copy(tip);
      pivot.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(sAx, f, n));
      const L = 1.15 + Math.random() * .45;
      const leaf = new THREE.Mesh(leafGeo(L, L * .66, i % 3 !== 2), new THREE.MeshStandardMaterial({ color: leafCols[i % 4], roughness: .45, metalness: .02, side: THREE.DoubleSide }));
      leaf.position.y = -.05;
      pivot.add(leaf); plant.add(pivot);
      sways.push({ leaf, ph: Math.random() * 6, sp: .8 + Math.random() * .6 });
    }
    // a young unfurling leaf
    const bud = new THREE.Mesh(new THREE.ConeGeometry(.07, .7, 10), new THREE.MeshStandardMaterial({ color: 0x8cc06a, roughness: .5 }));
    bud.position.set(.05, 1.6, .05); bud.rotation.z = -.15; plant.add(bud);

    /* floating leaves */
    const floatGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(.12, .14, 0, .32); s.quadraticCurveTo(-.12, .14, 0, 0); return new THREE.ShapeGeometry(s, 8); })();
    const floaters = [];
    [0x8dbf6a, 0x4e9a5b, 0xe8b546, 0xc2653f, 0x6fb07a].forEach((c, i) => {
      for (let k = 0; k < 3; k++) {
        const m = new THREE.Mesh(floatGeo, new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide, roughness: .6 }));
        const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 1.4;
        m.position.set(Math.cos(a) * r, .6 + Math.random() * 3.4, Math.sin(a) * r * .6);
        m.userData = { a, r, y: m.position.y, sp: .2 + Math.random() * .3, ph: Math.random() * 6 };
        m.scale.setScalar(.8 + Math.random() * .8);
        scene.add(m); floaters.push(m);
      }
    });

    scene.traverse(o => { if (o.material && o.material.color && !o.material.map) o.material.color.convertSRGBToLinear(); });

    /* interaction */
    let rotV = reduce ? 0 : .004, dragging = false, lastX = 0, tiltX = 0, tiltTarget = 0;
    const el = renderer.domElement;
    el.addEventListener("pointerdown", e => { grinning = true; drawFace(false, true); dragging = true; lastX = e.clientX; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; });
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      tiltTarget = ((e.clientY - r.top) / r.height - .5) * .25;
      if (!dragging) return;
      rotV = (e.clientX - lastX) * .006; lastX = e.clientX;
    });
    const up = () => { dragging = false; grinning = false; drawFace(false, false); el.style.cursor = "grab"; };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", () => { tiltTarget = 0; });
    el.style.touchAction = "pan-y";

    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage); resize();

    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);

    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      const t = clock.getElapsedTime();
      world.rotation.y += rotV;
      shadow.rotation.z = world.rotation.y;
      if (!dragging) rotV += ((reduce ? 0 : .004) - rotV) * .03;
      tiltX += (tiltTarget - tiltX) * .05;
      world.rotation.x = tiltX * .5;
      if (!reduce) {
        sways.forEach(s => { s.leaf.rotation.x = Math.sin(t * s.sp + s.ph) * .07; s.leaf.rotation.y = Math.cos(t * s.sp * .7 + s.ph) * .05; });
        floaters.forEach(m => {
          const d = m.userData;
          m.position.y = d.y + Math.sin(t * d.sp + d.ph) * .25;
          m.position.x = Math.cos(d.a + t * .05) * d.r;
          m.rotation.set(t * d.sp, t * d.sp * .7, Math.sin(t + d.ph));
        });
      }
      renderer.render(scene, camera);
    })();
  }
};
