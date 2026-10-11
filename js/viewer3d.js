/* 《未收录》通用 3D 端详查看器（经典脚本，file:// 可玩）
   用法：initViewer3d(容器id, 加载提示id, base64字符串, 可选{onPick})
   自动缓转 + 拖动端详，缩放禁用（不劫持页面滚动）。
   opts.onPick：点击（非拖动）命中模型时回调，如跳转匣内页。 */
window.initViewer3d = function (boxId, loadingId, b64, opts) {
  opts = opts || {};
  if (typeof THREE === "undefined" || !b64) return;
  const box = document.getElementById(boxId);
  if (!box) return;
  const loading = document.getElementById(loadingId);

  function decodeGLB() {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);

  scene.add(new THREE.HemisphereLight(0xfff6e6, 0x4a3b28, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(2.5, 3.5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd8e2f4, 0.25);
  fill.position.set(-3, 1.5, -2.5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffe8c4, 0.35);
  rim.position.set(0, 2.5, -4);
  scene.add(rim);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;
  controls.addEventListener("start", () => { controls.autoRotate = false; });
  controls.addEventListener("end", () => {
    clearTimeout(controls._resume);
    controls._resume = setTimeout(() => { controls.autoRotate = true; }, 2500);
  });

  function resize() {
    const w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  function loop() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  new THREE.GLTFLoader().parse(decodeGLB(), "", (gltf) => {
    scene.add(gltf.scene);
    const bb = new THREE.Box3().setFromObject(gltf.scene);
    const size = bb.getSize(new THREE.Vector3());
    const center = bb.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    camera.position.set(center.x + radius * 1.9, center.y + radius * 0.9, center.z + radius * 2.3);
    camera.near = radius / 50; camera.far = radius * 20;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    box.appendChild(renderer.domElement);
    resize();
    if (loading) loading.style.display = "none";
    box.classList.add("ready");

    // 点击拾取（与拖动端详区分：位移小、时长短才算点）
    if (opts.onPick) {
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let downX = 0, downY = 0, downT = 0;
      renderer.domElement.addEventListener("pointerdown", (e) => {
        downX = e.clientX; downY = e.clientY; downT = Date.now();
      });
      renderer.domElement.addEventListener("pointerup", (e) => {
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
        if (Date.now() - downT > 500) return;
        const r = renderer.domElement.getBoundingClientRect();
        ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        if (ray.intersectObject(gltf.scene, true).length) opts.onPick();
      });
      box.classList.add("pickable");
    }

    // 截图模式只渲单帧（软件光栅下持续 rAF 会拖死虚拟时钟），正常游玩持续渲染
    if (new URLSearchParams(location.search).get("shot")) {
      controls.update(); renderer.render(scene, camera);
    } else {
      loop();
    }
  }, () => {
    if (loading) loading.textContent = "没能取出来。换个浏览器试试。";
  });
};
