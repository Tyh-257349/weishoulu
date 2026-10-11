/* 木匣 3D 舞台：由通用查看器驱动；点击匣内进入匣中视角页 */
(function () {
  if (!window.CHEST_GLB_BASE64) return;
  window.initViewer3d("chest3d-inline", "chest3d-loading", window.CHEST_GLB_BASE64, {
    onPick: () => { location.href = "xiazang.html"; }
  });
})();
