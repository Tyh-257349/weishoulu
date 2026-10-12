/* 《未收录》三幕原型 v4 · 主脚本
   纯搜索驱动；逻辑门；渐进提示；名录多级响应 + 冰雕连致敬
   第一幕 离家 / 第二幕 异国 / 第三幕 归来 */

/* ---------- 线索与提示 ---------- */

const CLUES = [
  { id: "bang",    title: "光荣榜上的空白行",
    hint1: "村志网首页的光荣榜，有一行的名字被墨涂去。" },
  { id: "dashiji", title: "村志大事记：一九五一年的光荣牌",
    hint1: "村志大事记里，一九五一年春的那一行，只有一句话。",
    hint2: "检索「光荣牌」。" },
  { id: "lingqu",  title: "《革命牺牲军人家属光荣纪念证》领取记录",
    hint1: "有了名字，就搜名字。",
    hint2: "在村志网检索「林守拙」。" },
  { id: "zitiao",  title: "一九五〇年十月的字条",
    hint1: "大事记里有一条一九五〇年十月的记录，原件存村档案室。",
    hint2: "检索「字条」。" },
  { id: "jiapu",   title: "林氏族谱：守拙的注记",
    hint1: "他一九四七年参的军。那年的事，村里的老档案里该有。",
    hint2: "检索「族谱」（家谱）。" },
  { id: "heying",  title: "十三人欢送合影中的空位",
    hint1: "领取记录的备注栏里，藏着一条看似无关的记录。",
    hint2: "检索「欢送」。" },
  { id: "minglu",  title: "名录查询：未收录",
    hint1: "族谱拼好之后，该把他放进更大的名册里查了。",
    hint2: "检索「名录」。" },
  { id: "luxian",  title: "（新）把他的路走一遍",
    hint1: "在名录里见到他之后，打开你的寻访笔记。",
    hint2: "点这条记录，替他走一遍。",
    link: "luxian.html" },
  { id: "dangan",  title: "（新）木匣里的战地档案袋",
    hint1: "把他的路走完，笔记里会有新的记录。",
    hint2: "点这条记录，打开爷爷的木匣。",
    link: "dangan.html" },
  { id: "jia",     title: "三封家书",
    hint1: "档案袋里最上面是三封信。日期对不上邮戳，信就没法寄达。",
    hint2: "把三封信都读了，再把日期碎片对回三只信封。" },
  { id: "riji",    title: "战地日记",
    hint1: "信读完了，就剩那册日记。从第一页翻起。",
    hint2: "有一页上了锁——口令藏在「那天的冷」里。去查那天的气温。" },
  { id: "bdl",     title: "二四二团五连：未收录",
    hint1: "日记倒数几页，提到侧翼的一个兄弟连队。",
    hint2: "去名录系统，查这个连队的番号。" },
  { id: "gui",     title: "（新）第三幕 · 归来",
    hint1: "名录里补全他之后——日记的最后一页说过：带他回家。",
    hint2: "检索「归来」，或「回家」。",
    link: "jianbao.html" },
  { id: "jianbao", title: "爷爷的剪报本",
    hint1: "爷爷的剪报本里，每一批归国的名单旁，都有红笔。",
    hint2: "读完剪报，检索「遗物」。" },
  { id: "yiwu",    title: "遗物比对：疑似林守拙",
    hint1: "遗物清单里，能指向他的，只有三件。",
    hint2: "衣襟、印章、搪瓷缸——选中三件，提交。" },
  { id: "dna",     title: "亲缘确认：支持",
    hint1: "初步比对之后，还差最后一步科学的确认。",
    hint2: "检索「确认」，或「寻亲」。" },
  { id: "shoulu",  title: "收录。已收录。",
    hint1: "身份确认了。回名录，亲手把他补进去。",
    hint2: "检索「收录」，或「补录」。" },
  { id: "xie",     title: "还有一样东西：一双布鞋",
    hint1: "家里人只敢提过一次：太奶奶走前，留下过一双鞋。",
    hint2: "检索「鞋」。" },
];

function getFound() {
  try { return JSON.parse(localStorage.getItem("ws_found") || "[]"); }
  catch (e) { return []; }
}
function markClue(id) {
  const f = getFound();
  if (!f.includes(id)) {
    f.push(id);
    localStorage.setItem("ws_found", JSON.stringify(f));
    renderCount(); renderNote();
    // 分幕门控：本幕线索全部找到，5 秒后自动弹出下一幕开启卡
    maybeActCards(f, true);
  }
}
function renderCount() {
  const n = getFound().length;
  document.querySelectorAll(".js-count").forEach(el => { el.textContent = n; });
}

/* ---------- 寻访笔记（分幕 + 渐进提示） ---------- */

const ACTS = [
  { name: "第一幕 · 离家", ids: ["bang", "dashiji", "lingqu", "zitiao", "jiapu", "heying", "minglu"] },
  { name: "第二幕 · 异国", ids: ["luxian", "dangan", "jia", "riji", "bdl"] },
  { name: "第三幕 · 归来", ids: ["gui", "jianbao", "yiwu", "dna", "shoulu", "xie"] },
];

const hintLevel = {};

const ACT_PHOTOS = { "一": "assets/act1-lijia.jpg", "二": "assets/act2-yiguo.jpg", "三": "assets/act3-guilai.jpg" };
function showActCard(act, title, sub, link) {
  // 每幕只在第一次开启时弹一次
  try { if (localStorage.getItem("ws_actcard" + act)) return; localStorage.setItem("ws_actcard" + act, "1"); }
  catch (e) { return; }
  const photo = ACT_PHOTOS[act];
  const go = link
    ? `<a class="act-go" href="${link}">进 入</a>`
    : `<button class="act-go act-begin" type="button">开 始 寻 访</button>`;
  const stay = link ? `<button class="act-stay" type="button">稍后再说</button>` : "";
  const card = document.createElement("div");
  card.className = "act-card";
  card.innerHTML = `
    <div class="act-card-inner">
      ${photo ? `<div class="act-photo"><img src="${photo}" alt=""></div>` : ""}
      <div class="act-card-body">
        <div class="act-kicker">第${act}幕 · 开启</div>
        <h2 class="act-title">${title}</h2>
        <p class="act-sub">${sub}</p>
        <div class="act-btns">${go}${stay}</div>
      </div>
    </div>`;
  document.body.appendChild(card);
  const close = () => { card.classList.add("act-out"); setTimeout(() => card.remove(), 500); };
  const stayBtn = card.querySelector(".act-stay");
  if (stayBtn) stayBtn.addEventListener("click", close);
  const beginBtn = card.querySelector(".act-begin");
  if (beginBtn) beginBtn.addEventListener("click", close);
  card.addEventListener("click", e => { if (e.target === card) close(); });
}

function maybeActCards(f, delay) {
  const fire = (act, title, sub, link) => {
    if (delay) setTimeout(() => showActCard(act, title, sub, link), 5000);
    else showActCard(act, title, sub, link);
  };
  if (ACTS[0].ids.every(x => f.includes(x))) fire("二", "异国", "人找到了，路还没走完。<br>把他走过的那一千多公里，从头走一遍。", "luxian.html");
  if (ACTS[1].ids.every(x => f.includes(x))) fire("三", "归来", "名册上补全了他，可他的安葬地，至今仍未收录。<br>带他回家。", "jianbao.html");
}

function renderNote() {
  const box = document.getElementById("note-list");
  if (!box) return;
  const found = getFound();
  const clueRow = c => {
    const isFound = found.includes(c.id);
    const label = isFound ? c.title : "（待发现）";
    const inner = (isFound && c.link) ? `<a href="${c.link}" style="color:inherit">${label}</a>` : label;
    return `<li class="${isFound ? "found" : "todo"}" data-id="${c.id}">${inner}<div class="hint"></div></li>`;
  };
  box.innerHTML = ACTS.map((act, i) => {
    // 第18条（布鞋）在「收录」完成前隐藏——shoulu 页说的"多了一页"在此兑现
    const items = act.ids
      .filter(id => id !== "xie" || found.includes("shoulu"))
      .map(id => clueRow(CLUES.find(c => c.id === id))).join("");
    let head = `<li class="act-head">${act.name}</li>`;
    if (i === 0 && act.ids.every(x => found.includes(x)))
      head += `<li class="act-entry"><a href="luxian.html">▸ 进入第二幕 · 异国</a></li>`;
    if (i === 1 && act.ids.every(x => found.includes(x)))
      head += `<li class="act-entry"><a href="jianbao.html">▸ 进入第三幕 · 归来</a></li>`;
    return head + items;
  }).join("");
  maybeActCards(found);
  box.querySelectorAll("li.todo").forEach(li => {
    li.addEventListener("click", () => {
      const id = li.dataset.id;
      const c = CLUES.find(x => x.id === id);
      hintLevel[id] = Math.min((hintLevel[id] || 0) + 1, 2);
      const h = hintLevel[id] === 1 ? c.hint1 : (c.hint2 || c.hint1);
      li.querySelector(".hint").innerHTML = ("提示" + (hintLevel[id] === 1 ? "：" : "·再：") + h)
        .replace(/「([^」]+)」/g, '<span class="hl">「$1」</span>');
    });
  });
}
function initNote() {
  const btn = document.getElementById("note-btn");
  const panel = document.getElementById("note-panel");
  if (!btn || !panel) return;
  btn.addEventListener("click", () => { panel.classList.toggle("show"); renderNote(); });
}

/* 全局检索底栏：任何页面都能"亲手检索"（名录外部系统/出戏页/检索页自身除外） */
function initSearchBar() {
  if (typeof location === "undefined" || !document.body) return;
  const page = location.pathname.split("/").pop();
  if (["search.html", "minglu.html", "chuxi.html", "qixiang.html", "dna.html"].includes(page)) return;
  const bar = document.createElement("div");
  bar.id = "searchbar";
  bar.innerHTML =
    '<button id="searchbar-btn" type="button">站内检索</button>' +
    '<form id="searchbar-form" hidden>' +
    '<input id="searchbar-input" type="text" placeholder="输入关键词，回车检索" autocomplete="off">' +
    '<button type="submit">检 索</button></form>';
  document.body.appendChild(bar);
  const btn = document.getElementById("searchbar-btn");
  const form = document.getElementById("searchbar-form");
  const input = document.getElementById("searchbar-input");
  btn.addEventListener("click", () => {
    form.hidden = !form.hidden;
    if (!form.hidden) input.focus();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (q) location.href = "search.html?q=" + encodeURIComponent(q);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !form.hidden) { form.hidden = true; btn.focus(); }
  });
}

/* ---------- 站内搜索 ---------- */

const SEARCH_DB = [
  { keys: ["林守拙", "守拙", "大伯", "大爷"],
    title: "档案 ·《革命牺牲军人家属光荣纪念证》领取情况记录（1951年）",
    snap: "持证人：林王氏（按手印）。抚恤粮六百斤。备注栏里还有一行字。",
    url: "lingqu.html" },
  { keys: ["林家", "光荣牌", "烈士", "抚恤", "纪念证", "牺牲", "阵亡"],
    title: "村志 · 大事记（全）",
    snap: "一九四七年至一九五六年。其中一九五一年春的一条，只有一句话。",
    url: "dashiji.html" },
  { keys: ["族谱", "家谱", "林氏", "谱牒"],
    title: "谱牒室 · 林氏族谱（残页）",
    snap: "族谱有一页被撕成了六块。拼回去，看看缺了谁。",
    url: "jiapu.html" },
  { keys: ["合影", "欢送", "入伍", "参军", "新兵", "青年", "受花"],
    title: "影像 · 一九五〇年秋欢送参军青年合影",
    snap: "村里欢送十三名入伍青年。照片上的人，数一遍。",
    url: "heying.html" },
  { keys: ["档案", "档案室", "老档案"],
    title: "村档案室 · 村志大事记（手抄本）",
    snap: "据村档案室藏手抄本整理，个别字迹漫漶。",
    url: "dashiji.html" },
  { keys: ["档案", "档案室", "老档案"],
    title: "村档案室 · 一九五〇年字条（残）",
    snap: "守拙托支前民工带回。原件存档案室，残。",
    url: "zitiao.html" },
  { keys: ["档案", "档案室", "老档案"],
    title: "村档案室 · 光荣纪念证领取记录",
    snap: "一九五一年三月。抚恤粮六百斤，按手印领讫。",
    url: "lingqu.html" },
  { keys: ["档案袋"],
    title: "村档案室 · 朝鲜来信（档案袋）",
    snap: "部队来信与战斗记录。入朝之后的路，在这里。",
    url: "dangan.html",
    gate: "luxian" },
  { keys: ["字条", "勿念", "泰安", "支前", "整训", "纸条", "家书"],
    title: "档案 · 一九五〇年十月带回字条一张",
    snap: "守拙托赴泰安支前的乡亲带回。字条残破，只剩几条。",
    url: "zitiao.html" },
  { keys: ["名录", "查询", "收录", "名册", "英名录"],
    title: "系统 · 烈士名录查询",
    snap: "山东英烈数字名录（试用）。输入姓名，查询烈士信息。",
    url: "minglu.html" },
  { keys: ["守诚", "爷爷"],
    title: "村志 · 人口条",
    snap: "林守诚，一九二九年生，一九五〇年体检未过，留乡务农。二〇二六年正月病故。",
    url: null },
  { keys: ["朝鲜", "入朝", "行军", "路线", "鸭绿江", "长津湖", "过江"],
    title: "寻访笔记 · 行军路线",
    snap: "从掖县到长津湖。他走过的路，替他走一遍。",
    url: "luxian.html",
    gate: "luxian" },
  { keys: ["日记", "档案袋", "遗物", "新兴里", "战友", "木匣", "来信", "信"],
    title: "寻访笔记 · 木匣里的战地档案袋",
    snap: "一九五二年由部队战友捎回山东。家书三封，日记一册（残）。",
    url: "dangan.html",
    gate: "dangan" },
  { keys: ["气温", "天气", "冷", "零下", "温度", "寒潮"],
    title: "资料 · 长津湖地区气象记录（一九五〇年十一月）",
    snap: "五十年来最冷的冬天。那一天的冷，数字记得。",
    url: "qixiang.html",
    gate: "dangan" },
  { keys: ["归来", "归国", "回家", "迎回", "接他", "剪报", "遗骨", "回来了"],
    title: "寻访笔记 · 爷爷的剪报本",
    snap: "二〇一四年以来，每一批归国的名单旁，都有爷爷的红笔。",
    url: "jianbao.html",
    gate: "gui" },
  { keys: ["遗物清单", "清单", "比对", "认领", "等待认领"],
    title: "公告 · 归国烈士遗物数字化清单（公开比对）",
    snap: "一批批遗物摆在那里，等家人来认。",
    url: "yiwu.html",
    gate: "jianbao" },
  { keys: ["寻亲", "确认", "鉴定", "dna", "采样", "血样", "亲缘"],
    title: "通道 · 烈士亲属亲缘关系鉴定申请",
    snap: "最后一步。科学会替记忆作证。",
    url: "dna.html",
    gate: "yiwu" },
  { keys: ["补录", "录入", "填表"],
    title: "名录系统 · 烈士信息补录通道",
    snap: "把查到的，都填进去。",
    url: "shoulu.html",
    gate: "dna" },
  { keys: ["鞋", "布鞋", "东西"],
    title: "家里 · 太奶奶留下的东西",
    snap: "一双布鞋。一九五一年就纳好了底。",
    url: "xie.html",
    gate: "shoulu" },
];

function doSearch(q) {
  q = (q || "").trim();
  if (!q) return [];
  const found = getFound();
  const hits = [];
  for (const item of SEARCH_DB) {
    if (item.gate && !found.includes(item.gate)) continue;
    if (item.keys.some(k => q.includes(k))) hits.push(item);
  }
  return hits;
}

function renderSearchPage() {
  const box = document.getElementById("search-results");
  if (!box) return;
  const q = new URLSearchParams(location.search).get("q") || "";
  document.getElementById("search-q").textContent = q;
  const hits = doSearch(q);
  if (!hits.length) {
    box.innerHTML = `<div class="noresult">「${escapeHtml(q)}」—— 检索无结果。<br>
      <span style="font-size:.85rem; letter-spacing:.05em">人名、年份、一件事，都可以试试。</span></div>`;
    return;
  }
  box.innerHTML = hits.map(h => h.url
    ? `<a class="result-item" href="${h.url}"><div class="r-title">${h.title}</div><div class="r-snap">${h.snap}</div></a>`
    : `<div class="result-item"><div class="r-title">${h.title}</div><div class="r-snap">${h.snap}</div></div>`
  ).join("");
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- 谜题：字条拼合 ---------- */

function initZitiao() {
  const pool = document.getElementById("strips");
  if (!pool) return;
  const STRIPS = [
    { id: "爹娘", text: "爹，娘：" },
    { id: "路过", text: "部队路过泰安，不能回家。" },
    { id: "勿念", text: "勿念。" },
    { id: "署名", text: "儿　守拙" },
    { id: "日期", text: "一九五〇年十月" },
  ];
  const shuffled = [STRIPS[2], STRIPS[0], STRIPS[4], STRIPS[1], STRIPS[3]];
  const slotsBox = document.getElementById("slots");
  const fb = document.getElementById("zt-fb");
  let sel = null;

  shuffled.forEach(s => {
    const d = document.createElement("div");
    d.className = "strip"; d.textContent = s.text; d.dataset.id = s.id;
    d.addEventListener("click", () => {
      if (d.classList.contains("used")) return;
      if (sel === d) { d.classList.remove("sel"); sel = null; return; }
      if (sel) sel.classList.remove("sel");
      sel = d; d.classList.add("sel");
    });
    pool.appendChild(d);
  });

  slotsBox.querySelectorAll(".slot").forEach(slot => {
    slot.addEventListener("click", () => {
      // 已放入的格子：点击取回残句
      if (slot.classList.contains("filled")) {
        const id = slot.dataset.fill;
        slot.classList.remove("filled"); slot.dataset.fill = "";
        const t = slot.querySelector(".slot-text");
        if (t) t.remove();
        const strip = pool.querySelector(`.strip[data-id="${id}"]`);
        if (strip) strip.classList.remove("used");
        return;
      }
      if (!sel) {
        fb.style.color = "#8a744a";
        fb.textContent = "先在上方点选一条残句。";
        return;
      }
      slot.dataset.fill = sel.dataset.id;
      const span = document.createElement("span");
      span.className = "slot-text"; span.textContent = sel.textContent;
      slot.appendChild(span);
      slot.classList.add("filled");
      sel.classList.add("used"); sel.classList.remove("sel");
      sel = null;
      fb.textContent = "";
      check();
    });
  });

  function check() {
    const slots = Array.from(slotsBox.children);
    if (!slots.every(s => s.classList.contains("filled"))) return;
    if (slots.every(s => s.dataset.fill === s.dataset.want)) {
      fb.style.color = "#4a5d3a";
      fb.textContent = "字条各归其位。";
      document.getElementById("zt-done").classList.add("show");
      markClue("zitiao");
    } else {
      fb.style.color = "#9e2b25";
      fb.textContent = "放错了。想想每一句是干什么的。";
      slots.forEach(s => { if (s.dataset.fill !== s.dataset.want) s.classList.add("shake"); });
      setTimeout(() => {
        slots.forEach(s => {
          s.classList.remove("shake", "filled");
          if (s.dataset.fill) {
            const strip = pool.querySelector(`.strip[data-id="${s.dataset.fill}"]`);
            if (strip) strip.classList.remove("used");
          }
          s.dataset.fill = "";
          const t = s.querySelector(".slot-text"); if (t) t.remove();
        });
      }, 900);
    }
  }
}

/* ---------- 谜题：族谱拼页（滑块推移） ---------- */

function initJiapu() {
  const grid = document.getElementById("jiapu-grid");
  if (!grid) return;
  const TILES = [
    { t: "林氏族谱 · 三房", s: "世系表（残）" },
    { t: "十四世　林公", s: "（名讳漫漶）" },
    { t: "十五世　守礼", s: "配赵氏。早迁关外。" },
    { t: "十五世　守仁", s: "配孙氏。生子二。" },
    { t: "十六世　守拙", s: "一九二八年生。未娶。" },
    { t: "十六世　守诚", s: "配陈氏。一九二九年生。" },
    { t: "注：守拙 一九四七年参军", s: "华东野战军第九纵队。" },
    { t: "一九五〇年 随部队入朝", s: "后编 第二十七军。" },
  ];
  const SOLVED = [0, 1, 2, 3, 4, 5, 6, 7, null];
  // 从复原态随机走 60 步打乱，保证必有解且不落在复原态
  let state = SOLVED.slice();
  (function shuffle() {
    for (let n = 0; n < 60; n++) {
      const b = state.indexOf(null);
      const r = Math.floor(b / 3), c = b % 3;
      const cand = [];
      if (r > 0) cand.push(b - 3);
      if (r < 2) cand.push(b + 3);
      if (c > 0) cand.push(b - 1);
      if (c < 2) cand.push(b + 1);
      const t = cand[Math.floor(Math.random() * cand.length)];
      [state[b], state[t]] = [state[t], state[b]];
    }
    if (state.every((v, i) => v === SOLVED[i])) shuffle();
  })();

  function render() {
    grid.innerHTML = "";
    state.forEach((tileIdx, pos) => {
      const d = document.createElement("div");
      if (tileIdx === null) {
        d.className = "jiapu-tile blank";
      } else {
        d.className = "jiapu-tile";
        d.innerHTML = `<div class="gen">${TILES[tileIdx].t}</div>${TILES[tileIdx].s}`;
        d.addEventListener("click", () => {
          const b = state.indexOf(null);
          const r = Math.floor(pos / 3), c = pos % 3;
          const rb = Math.floor(b / 3), cb = b % 3;
          if (Math.abs(r - rb) + Math.abs(c - cb) !== 1) return; // 只能推入相邻空当
          [state[pos], state[b]] = [state[b], state[pos]];
          render();
          check();
        });
      }
      grid.appendChild(d);
    });
  }
  function check() {
    const fb = document.getElementById("jp-fb");
    if (state.every((v, i) => v === SOLVED[i])) {
      fb.style.color = "#4a5d3a";
      fb.textContent = "族谱复原。他的名字下面，有两行小字。";
      document.getElementById("jp-done").classList.add("show");
      markClue("jiapu");
    }
  }
  render();
}

/* ---------- 谜题：合影找缺席 ---------- */

function initHeying() {
  const spot = document.getElementById("hy-spot");
  const photo = document.getElementById("heying-photo");
  if (!spot || !photo) return;
  const fb = document.getElementById("hy-fb");
  // 点空着的长凳（二胡的位置）= 缺席者应在的位置
  spot.addEventListener("click", () => {
    fb.style.color = "#4a5d3a";
    fb.innerHTML = "你说对了。十三名参军，照片上十二个人。<br>缺席的人不在欢送的人群里——他三年前就走了。";
    document.getElementById("hy-done").classList.add("show");
    markClue("heying");
  });
  // 点在其他人身上：提示重新数
  photo.addEventListener("click", (e) => {
    if (e.target === spot) return;
    fb.style.color = "#9e2b25";
    fb.textContent = "他在照片里。数一遍：欢送的青年，一个都不少。";
  });
}

/* ---------- 谜题：档案袋 · 邮戳配对 ---------- */

function initDangan() {
  const row = document.getElementById("stamp-chips");
  if (!row) return;
  const CHIPS = [
    { id: "14", text: "十四日" },
    { id: "26", text: "廿六日" },
    { id: "5",  text: "五日" },
  ];
  const CORRECT = { env1: "5", env2: "14", env3: "26" };
  let selChip = null;
  const placed = {};

  CHIPS.forEach(c => {
    const b = document.createElement("button");
    b.className = "stamp-chip"; b.textContent = c.text; b.dataset.id = c.id;
    b.addEventListener("click", () => {
      if (b.classList.contains("used")) return;
      row.querySelectorAll(".stamp-chip").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
      selChip = b;
    });
    row.appendChild(b);
  });

  document.querySelectorAll(".env-face").forEach(env => {
    env.addEventListener("click", e => {
      if (e.target.closest("a")) return;
      if (!selChip) return;
      const slot = env.querySelector(".slot-date");
      slot.textContent = selChip.textContent;
      placed[env.dataset.env] = selChip.dataset.id;
      selChip.classList.add("used"); selChip.classList.remove("sel");
      selChip = null;
      if (Object.keys(placed).length === 3) verify();
    });
  });

  const fb = document.getElementById("dg-fb");
  function verify() {
    const ok = Object.keys(CORRECT).every(k => placed[k] === CORRECT[k]);
    if (ok) {
      fb.style.color = "#4a5d3a";
      fb.textContent = "三封信，从过江前写到战前夜。两封寄到了，一封没来得及。";
      markClue("jia");
    } else {
      fb.style.color = "#9e2b25";
      fb.textContent = "邮戳对不上。日期，在每封信的字里。";
      setTimeout(() => {
        Object.keys(placed).forEach(k => delete placed[k]);
        document.querySelectorAll(".slot-date").forEach(s => s.textContent = "");
        row.querySelectorAll(".stamp-chip").forEach(x => x.classList.remove("used"));
      }, 1200);
    }
  }
}

function markJiaRead(n) {
  let read = [];
  try { read = JSON.parse(localStorage.getItem("ws_jia") || "[]"); } catch (e) {}
  if (!read.includes(n)) {
    read.push(n);
    localStorage.setItem("ws_jia", JSON.stringify(read));
  }
}

function initEnvelopeFlip() {
  const btn = document.getElementById("flip-btn");
  const back = document.getElementById("env-back");
  if (!btn || !back) return;
  btn.addEventListener("click", () => {
    back.classList.toggle("show");
    btn.textContent = back.classList.contains("show") ? "翻回正面" : "翻到信封背面";
  });
}

/* ---------- 谜题：战地日记 ---------- */

const RIJI_PAGES = [
  { date: "一九五〇年十一月七日　夜", lock: false, body: `
    <p>夜里过的江。江上没有灯，人马踩着浮桥过去，不许出声。</p>
    <p>一过江，雪就下起来了。往北走，雪更深。</p>
    <p>班长说，从现在起，各人把名字写在衣襟里头。</p>` },
  { date: "十一月十四日　雪", lock: false, body: `
    <p>走了十几天，脚底全是泡。土豆冻得像石头蛋，在怀里捂化了，啃一层，再捂。</p>
    <p>夜里睡雪地，一床被十个人挤。班长的脚肿得鞋穿不上，还走。</p>
    <p>想家。想娘蒸的饽饽。</p>` },
  { date: "十一月廿六日　晴　极冷", lock: false, body: `
    <p>明天打新兴里。连长把班长们叫去说了半宿。回来，只说了一句：这一仗打好了，就把敌人撵到海里去。</p>
    <p>各班把鞋带绑了两道，手榴弹揭开盖。</p>
    <p style="color:#7a6a45">（下一页，上了锁。锁旁一行小字：<span class="hl">口令——那天的冷</span>。）</p>` },
  { date: "十一月廿七日", lock: true, body: "" },
  { date: "十一月三十日", lock: false, corner: true, body: `
    <p>新兴里的敌人昨天没全打下来，今天接着打。</p>
    <p>侧翼的兄弟连队，昨夜整连冻在了阵地上。枪，还指着前方。连长说，要记住他们。番号：<span class="hl">第八十师二四二团五连</span>。</p>
    <p>（这一页的下角，被撕去了一块。）</p>` },
  { date: "十二月一日　晨", lock: false, final: true, body: `
    <p>新兴里打下来了。敌人的汽车烧了一夜，天亮还冒烟。</p>
    <p>连长点名。点完，没说话。</p>
    <p>要把这一页写完的时候——</p>` },
];
const RIJI_LOCK_ANSWERS = ["27", "二十七", "-27", "零下27", "零下二十七", "零下二十七度"];

function initRiji() {
  const pageBox = document.getElementById("diary-page");
  if (!pageBox) return;
  let state;
  try { state = JSON.parse(localStorage.getItem("ws_riji") || "{}"); }
  catch (e) { state = {}; }
  if (typeof state.page !== "number") state = { page: 0, unlocked: false, corner: false };
  const prevBtn = document.getElementById("diary-prev");
  const nextBtn = document.getElementById("diary-next");

  function save() { localStorage.setItem("ws_riji", JSON.stringify(state)); }

  function render() {
    const p = RIJI_PAGES[state.page];
    prevBtn.disabled = state.page === 0;

    if (p.lock && !state.unlocked) {
      pageBox.innerHTML = `
        <div class="diary-lock">
          <div class="lock-mark">🔒</div>
          <p>这一页被一把小锁锁住了。</p>
          <p>锁旁一行小字：<strong>口令——那天的冷。</strong></p>
          <p style="font-size:.9rem">（去查一查：一九五〇年十一月二十七日，长津湖，有多冷。）</p>
          <input id="lock-input" type="text" placeholder="口令">
          <button id="lock-btn">开 锁</button>
          <div class="feedback" id="lock-fb"></div>
        </div>`;
      nextBtn.disabled = true;
      document.getElementById("lock-btn").addEventListener("click", tryUnlock);
      document.getElementById("lock-input").addEventListener("keydown", e => { if (e.key === "Enter") tryUnlock(); });
      return;
    }

    nextBtn.disabled = false;
    let inner = `<div class="d-date">${p.date}</div>${p.body}`;
    if (p.corner && !state.corner) {
      inner += `
        <div class="puzzle-note" style="margin-top:18px">撕去的角还在。拼回去。</div>
        <div class="corner-grid" id="corner-grid"></div>
        <div class="feedback" id="corner-fb"></div>`;
    }
    if (p.corner && state.corner) {
      inner += `
        <div class="done-panel show" style="margin-top:18px">
          <p style="font-family:'KaiTi','楷体',cursive">撕回的角上，是一张照抄的三班名册：</p>
          <p style="font-family:'KaiTi','楷体',cursive; text-align:center; margin-top:10px">
            王学文　李满仓　赵柱子　<span style="border-bottom:1px solid #333">林守拙</span></p>
          <p style="font-family:'KaiTi','楷体',cursive; margin-top:10px; color:#6b655a; font-size:.95rem">
            名册末尾一行小字：王学文，掖县人，廿六日夜，先走了。</p>
        </div>`;
    }
    if (p.final) {
      inner += `
        <p class="letter-unwritten" style="font-family:'FangSong','仿宋',serif">（以下无。）</p>
        <div style="text-align:center; margin-top:26px">
          <p style="font-family:'KaiTi','楷体',cursive">他的日记，到这里为止。</p>
          <p style="font-family:'FangSong','仿宋',serif; color:#6b655a; font-size:.92rem; margin-top:10px">
            一九五二年，这册日记由部队战友捎回山东。<br>
            名录里他的战斗履历，如今你能补全了——去名录里再看看他。<br>
            安葬地，仍未收录。第三幕 · 归来，带他回家。
          </p>
        </div>`;
      document.body.classList.add("quiet");
      startSnow();
    }
    pageBox.innerHTML = inner;

    if (p.corner && !state.corner) initCorner();
    if (p.final) markClue("riji");
  }

  function tryUnlock() {
    const v = document.getElementById("lock-input").value.trim();
    const fb = document.getElementById("lock-fb");
    if (RIJI_LOCK_ANSWERS.some(a => v === a)) {
      state.unlocked = true; save();
      render();
    } else {
      fb.style.color = "#9e2b25";
      fb.textContent = "锁没开。那天的冷，记录里写着。";
    }
  }

  function initCorner() {
    const grid = document.getElementById("corner-grid");
    const C = [
      { t: "王学文" }, { t: "李满仓" },
      { t: "三班名册" }, { t: "（照抄）" },
    ];
    // 正确摆位：左上/右上/左下/右下（与复原后的识读顺序一致）
    const WANTS = [0, 1, 2, 3];
    const trayOrder = [2, 0, 3, 1];
    let sel = null;

    grid.innerHTML = "";
    const board = document.createElement("div");
    board.className = "corner-board";
    const zones = [];
    WANTS.forEach(want => {
      const z = document.createElement("div");
      z.className = "corner-zone"; z.dataset.want = want;
      board.appendChild(z);
      zones.push(z);
      z.addEventListener("click", () => { if (sel !== null) place(sel, z); });
      z.addEventListener("dragover", e => { e.preventDefault(); z.classList.add("over"); });
      z.addEventListener("dragleave", () => z.classList.remove("over"));
      z.addEventListener("drop", e => {
        e.preventDefault(); z.classList.remove("over");
        const idx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (!isNaN(idx)) place(idx, z);
      });
    });
    grid.appendChild(board);

    const tray = document.createElement("div");
    tray.className = "corner-tray";
    const pieces = [];
    trayOrder.forEach(idx => {
      const p = document.createElement("div");
      p.className = "corner-piece"; p.textContent = C[idx].t; p.dataset.idx = idx;
      p.draggable = true;
      p.addEventListener("click", () => {
        if (p.classList.contains("placed")) return;
        if (sel === idx) { sel = null; p.classList.remove("sel"); return; }
        pieces.forEach(x => x.classList.remove("sel"));
        sel = idx; p.classList.add("sel");
      });
      p.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", idx); });
      tray.appendChild(p);
      pieces.push(p);
    });
    grid.appendChild(tray);

    function place(idx, zone) {
      if (zone.dataset.done) return;
      const piece = pieces.find(p => +p.dataset.idx === idx);
      if (!piece || piece.classList.contains("placed")) return;
      if (+zone.dataset.want !== idx) {
        zone.classList.add("shake");
        setTimeout(() => zone.classList.remove("shake"), 450);
        const fb0 = document.getElementById("corner-fb");
        fb0.style.color = "#9e2b25";
        fb0.textContent = "位置不对。";
        return;
      }
      zone.dataset.done = "1";
      piece.classList.remove("sel");
      piece.classList.add("placed");
      piece.draggable = false;
      zone.appendChild(piece);
      sel = null;
      check();
    }

    function check() {
      const fb = document.getElementById("corner-fb");
      if (zones.every(z => z.dataset.done)) {
        fb.style.color = "#4a5d3a";
        fb.textContent = "角拼回去了。";
        state.corner = true; save();
        setTimeout(render, 900);
      }
    }
  }

  prevBtn.addEventListener("click", () => { if (state.page > 0) { state.page--; save(); render(); } });
  nextBtn.addEventListener("click", () => { if (state.page < RIJI_PAGES.length - 1) { state.page++; save(); render(); } });

  render();
}

/* 雪 */
function startSnow() {
  if (document.getElementById("snow-layer")) return;
  const layer = document.createElement("div");
  layer.id = "snow-layer";
  document.body.appendChild(layer);
  for (let i = 0; i < 40; i++) {
    const f = document.createElement("div");
    f.className = "snowflake";
    f.textContent = "❄";
    f.style.left = Math.random() * 100 + "vw";
    f.style.fontSize = (8 + Math.random() * 10) + "px";
    f.style.animationDuration = (9 + Math.random() * 10) + "s";
    f.style.animationDelay = (-Math.random() * 14) + "s";
    layer.appendChild(f);
  }
}
function stopSnow() {
  const layer = document.getElementById("snow-layer");
  if (layer) layer.remove();
}

/* ---------- 谜题：遗物比对（选中三件指向他的遗物） ---------- */

const YIWU_ANSWER = ["y1", "y5", "y7"];

function initYiwu() {
  const table = document.getElementById("yiwu-table");
  if (!table) return;
  const fb = document.getElementById("yw-fb");
  table.querySelectorAll("tbody tr").forEach(tr => {
    tr.addEventListener("click", () => tr.classList.toggle("sel"));
  });
  document.getElementById("yw-submit").addEventListener("click", () => {
    const sel = [...table.querySelectorAll("tbody tr.sel")].map(tr => tr.dataset.id).sort();
    if (sel.length !== 3) {
      fb.style.color = "#9e2b25";
      fb.textContent = "选三件。不多，不少。";
      return;
    }
    if (sel.join() === YIWU_ANSWER.slice().sort().join()) {
      fb.style.color = "#4a5d3a";
      fb.textContent = "三件遗物，都指向他。";
      document.getElementById("yw-done").classList.add("show");
      markClue("yiwu");
    } else {
      fb.style.color = "#9e2b25";
      fb.textContent = "对不上。这些东西，可能是任何一个兄弟的。";
      setTimeout(() => table.querySelectorAll("tr.sel").forEach(tr => tr.classList.remove("sel")), 1200);
    }
  });
}

/* ---------- 流程：亲缘确认（申请 → 采样 → 比对 → 结果） ---------- */

function initDna() {
  const box = document.getElementById("dna-steps");
  if (!box) return;
  const steps = box.querySelectorAll(".dna-step");
  const fb = document.getElementById("dna-fb");

  function go(i) {
    steps.forEach((s, si) => s.classList.toggle("show", si === i));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  steps[0].querySelector(".dna-next").addEventListener("click", () => go(1));
  steps[1].querySelector(".dna-next").addEventListener("click", () => {
    go(2);
    runCompare();
  });

  function runCompare() {
    const lines = steps[2].querySelector(".dna-lines");
    const seq = [
      "提取 DNA 分型……",
      "录入志愿军烈士遗骸 DNA 数据库……",
      "比对直系亲属参考样本（林守诚一支）……",
      "等待人工复核……",
    ];
    const delays = [900, 1800, 3100, 4400];
    seq.forEach((t, i) => {
      setTimeout(() => {
        const p = document.createElement("p");
        p.textContent = t;
        lines.appendChild(p);
        if (i === seq.length - 1) {
          setTimeout(() => {
            const r = document.createElement("p");
            r.className = "ok";
            r.textContent = "出结果了。";
            lines.appendChild(r);
            steps[2].querySelector(".dna-next").style.display = "inline-block";
          }, 1400);
        }
      }, delays[i]);
    });
    steps[2].querySelector(".dna-next").addEventListener("click", () => go(3), { once: true });
  }

  steps[3].querySelector(".dna-next").addEventListener("click", () => {
    markClue("dna");
    fb.style.color = "#4a5d3a";
    fb.innerHTML = "确认了。他等这个确认，等了七十五年。<br>最后一步：回名录，亲手把他补进去——<span class=\"hl\">检索「收录」</span>。";
    steps[3].querySelector(".dna-next").style.display = "none";
  });

  go(0);
}

/* ---------- 仪式：收录 ---------- */

function initShoulu() {
  const form = document.getElementById("shoulu-form");
  if (!form) return;
  // 已完成收录的回访：直接呈现"已收录"（不然从出戏页回来会看到空表单）
  if (getFound().includes("shoulu")) {
    document.getElementById("shoulu-main").style.display = "none";
    document.getElementById("shoulu-done").classList.add("show");
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const need = ["s-name", "s-native", "s-army", "s-when", "s-battle", "s-rest"];
    const empty = need.some(id => !document.getElementById(id).value.trim());
    const fb = document.getElementById("sl-fb");
    if (empty) {
      fb.style.color = "#9e2b25";
      fb.textContent = "还有空着的。他的每一项，都不能再空着。";
      return;
    }
    document.getElementById("shoulu-main").style.display = "none";
    const done = document.getElementById("shoulu-done");
    done.classList.add("show");
    markClue("shoulu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- 隐藏终章：一双布鞋 ---------- */

function deliverXieGsap(btn) {
  const msg = document.getElementById("xie-msg");
  const stage = document.querySelector(".xie-stage");
  const note = document.querySelector(".wrap .puzzle-note");
  gsap.to(btn, { opacity: 0, y: 12, duration: .45, ease: "power2.in", onComplete: () => btn.style.visibility = "hidden" });
  // 雪渐渐停：在途的雪随机次序淡出
  gsap.to("#snow-layer .snowflake", { opacity: 0, duration: 2.2, delay: .7, stagger: { amount: 1.5, from: "random" },
    onComplete: () => stopSnow() });
  // 两只鞋在三维里飘远
  gsap.to("#shoe3d-inline", { y: -150, scale: .72, opacity: 0, delay: .5, duration: 2.4, ease: "power2.in" });
  if (note) gsap.to(note, { opacity: 0, duration: 1.1, delay: .8 });
  // 邮戳盖下 + 震屏
  const tl = gsap.timeline({ delay: 2.4 });
  tl.fromTo("#postmark", { opacity: 0, scale: 2.1, rotation: -18 },
            { opacity: 1, scale: 1, rotation: -12, duration: .5, ease: "power4.in" })
    .to(stage, { x: 3, duration: .05, yoyo: true, repeat: 3 }, "-=.1")
    .set(msg, { visibility: "visible" })
    .fromTo(msg, { opacity: 0, filter: "blur(4px)" },
                 { opacity: 1, filter: "blur(0px)", duration: 1.8, ease: "power2.out" })
    .call(() => markClue("xie"));
}

function initXie() {
  const btn = document.getElementById("xie-btn");
  if (!btn) return;
  startSnow();
  // 待机交给 3D 舞台的自动缓转
  btn.addEventListener("click", () => {
    if (deliveredXie) return;
    deliveredXie = true;
    if (typeof gsap !== "undefined" && document.getElementById("postmark")) {
      deliverXieGsap(btn);
      return;
    }
    document.querySelector(".xie-stage").classList.add("xie-delivered");
    btn.style.display = "none";
    setTimeout(() => {
      stopSnow();
      document.getElementById("xie-msg").innerHTML =
        "送到了。<br><span style='font-size:.95rem'>这一页，替他翻到最后一页。寻访笔记，全部记满了。</span>";
      markClue("xie");
    }, 2600);
  });
}
let deliveredXie = false;

/* ---------- 名录查询（多级响应 + 冰雕连致敬） ---------- */

function initMinglu() {
  const btn = document.getElementById("ml-btn");
  if (!btn) return;
  const input = document.getElementById("ml-input");
  const result = document.getElementById("ml-result");

  function card(rows) {
    return `<div class="minglu-card"><dl>${rows.map(r =>
      `<dt>${r[0]}</dt><dd class="${r[2] || ""}">${r[1]}</dd>`).join("")}</dl></div>`;
  }

  function query() {
    const q = input.value.trim();
    if (!q) return;

    if (q.includes("归来") || q.includes("回家") || q.includes("剪报")) {
      result.innerHTML =
        card([
          ["查阅结果", "爷爷的剪报本"],
          ["内　容", "二〇一四年以来，每一批归国的名单旁，都有红笔。"],
        ]) +
        `<p class="minglu-hint">纸都黄了，红笔还新。<br>
        <a href="jianbao.html" style="color:#9e2b25; text-decoration:underline; text-underline-offset:3px;">翻开剪报本</a>。</p>`;
      markClue("gui");
      return;
    }

    if (q.includes("收录") || q.includes("补录")) {
      if (!getFound().includes("dna")) {
        result.innerHTML =
          card([["补录通道", "亲缘鉴定未完成，通道未开启。", "missing"]]) +
          `<p class="minglu-hint">补录一名烈士，要先有科学的确认。<br>身份确认之后，再回到这里。</p>`;
        return;
      }
      result.innerHTML =
        card([
          ["补录通道", "烈士信息补录（家属）", ""],
          ["申请人", "林晴（林守拙之侄孙女）"],
        ]) +
        `<p class="minglu-hint">身份已确认。通道开启——<a href="shoulu.html" style="color:#9e2b25; text-decoration:underline; text-underline-offset:3px;">亲手把他补进去</a>。</p>`;
      return;
    }

    if (q.includes("冰雕连") || q.includes("二四二")) {
      result.innerHTML =
        card([
          ["部　队", "第二十七军 第八十师 第二四二团 第五连"],
          ["情　况", "长津湖战役中，该连官兵全体壮烈牺牲。牺牲时，仍保持战斗队形。"],
          ["其　余", "未收录", "missing"],
        ]) +
        `<p class="minglu-hint">该连更多信息，未收录。<br>
        但有人记得：他们来自胶东。</p>`;
      markClue("bdl");
      return;
    }

    if (!q.includes("守拙")) {
      result.innerHTML = card([[ "查询结果", `「${escapeHtml(q)}」——查无此人。` ]]);
      return;
    }

    const found = getFound();
    const lv = found.includes("riji") ? 3 : found.includes("jiapu") ? 2 : found.includes("lingqu") ? 1 : 0;

    if (lv === 3) {
      result.innerHTML =
        card([
          ["姓名", "林守拙"],
          ["籍贯", "山东省　掖县　林家村"],
          ["部队", "第二十七军（前身：华东野战军第九纵队）"],
          ["入朝时间", "一九五〇年十一月"],
          ["战斗履历", "长津湖战役新兴里战斗。一九五〇年十一月三十日至十二月一日。", ""],
          ["牺牲地", "朝鲜"],
          ["安葬地", "未收录", "missing"],
        ]) +
        `<p class="minglu-hint">战斗履历，补上了。安葬地——仍未收录。<br>
        带他回家。<span class="hl">检索「归来」，或「回家」</span>。</p>`;
      markClue("minglu");
      markClue("gui");
    } else if (lv === 2) {
      result.innerHTML =
        card([
          ["姓名", "林守拙"],
          ["籍贯", "山东省　掖县　林家村"],
          ["部队", "第二十七军（前身：华东野战军第九纵队）"],
          ["入朝时间", "一九五〇年十一月"],
          ["牺牲地", "朝鲜"],
          ["安葬地", "未收录", "missing"],
          ["战斗履历", "未收录", "missing"],
        ]) +
        `<p class="minglu-hint">他的部队已查明。但入朝之后的路，档案里还是空白。<br>
        打开你的<strong>寻访笔记</strong>——那里多了一条新的记录。</p>`;
      markClue("minglu");
      markClue("luxian");
    } else if (lv === 1) {
      result.innerHTML =
        card([
          ["姓名", "林守拙"],
          ["籍贯", "山东省　掖县　林家村"],
          ["部队", "未收录", "missing"],
          ["牺牲地", "朝鲜"],
          ["安葬地", "未收录", "missing"],
          ["战斗履历", "未收录", "missing"],
        ]) +
        `<p class="minglu-hint">连部队都未收录。他一九四七年参的军——那年的事，村里的<span class="hl">老档案</span>里该有。</p>`;
      markClue("minglu");
    } else {
      result.innerHTML =
        card([
          ["姓名", "林守拙"],
          ["籍贯", "未收录", "missing"],
          ["牺牲地", "未收录", "missing"],
          ["安葬地", "未收录", "missing"],
          ["战斗履历", "未收录", "missing"],
        ]) +
        `<p class="minglu-hint">只有一个名字。这个名字，家族的什么地方会记？</p>`;
      markClue("minglu");
    }
  }

  btn.addEventListener("click", query);
  input.addEventListener("keydown", e => { if (e.key === "Enter") query(); });
}

/* ---------- 行军地图 ---------- */

function initLuxian() {
  const cap = document.getElementById("map-caption");
  if (!cap) return;
  const STEPS = [
    { where: "山东 · 掖县 · 林家村", text: "一九二八年，他生在这里。十七岁，他在这里放牛。" },
    { where: "泰安 · 一九五〇年十月", text: "部队在山东整训。离家最近的一次，他只托人带回一张字条：勿念。" },
    { where: "辑安 · 鸭绿江 · 一九五〇年十一月", text: "夜里过江。不许问去哪里，不许给家里写信。" },
    { where: "朝鲜 · 长津湖 · 一九五〇年十一月二十七日", text: "后来发生的一切，档案里只有一句话：该烈士条目信息不全。" },
  ];
  let step = 0;
  const dots = document.querySelectorAll(".map-dot");
  const btn = document.getElementById("map-next");
  const done = document.getElementById("map-done");
  const lb = document.getElementById("map-lightbox");
  function show(i) {
    const s = STEPS[i];
    cap.innerHTML = `<span class="where">${s.where}</span>${s.text}`;
    dots.forEach((d, di) => d.classList.toggle("on", di <= i));
    if (i >= STEPS.length - 1) {
      btn.style.display = "none";
      done.classList.add("show");
      markClue("dangan");
    }
  }
  btn.addEventListener("click", () => { step = Math.min(step + 1, STEPS.length - 1); show(step); });

  // 缩略图点开大图浮层；ESC / 收起 / 点击遮罩关闭
  function openLb() { lb.classList.add("open"); }
  function closeLb() { lb.classList.remove("open"); }
  const thumb = document.getElementById("map-thumb");
  if (thumb) thumb.addEventListener("click", openLb);
  const closeBtn = document.getElementById("lb-close");
  if (closeBtn) closeBtn.addEventListener("click", closeLb);
  const backdrop = document.getElementById("lb-backdrop");
  if (backdrop) backdrop.addEventListener("click", closeLb);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });

  show(0);
  // 截图/调试参数：?open=1 直接铺开大图
  if (new URLSearchParams(location.search).get("open")) openLb();
}

/* ---------- 通用初始化 ---------- */

/* v5 全局入场动效：仅视觉，GSAP 缺席或静帧模式时静默跳过 */
function initEntrance() {
  if (typeof gsap === "undefined") return;
  if (typeof location !== "undefined" && new URLSearchParams(location.search).get("shot")) return;
  if (document.getElementById("envelope-overlay")) return; // 信封页由信封自己开场
  gsap.from(".site-banner h1", { opacity: 0, letterSpacing: ".6em", duration: 1.1, ease: "power3.out", clearProps: "all" });
  gsap.from(".site-nav a", { opacity: 0, duration: .5, stagger: .06, delay: .4, clearProps: "all" });
  gsap.from(".wrap .panel, .wrap .search-hero, .wrap .doc-title", { opacity: 0, y: 18, duration: .8, stagger: .13, delay: .45, ease: "power2.out", clearProps: "all" });
}

document.addEventListener("DOMContentLoaded", () => {
  // 截图模式：冻结 CSS 入场动画，定格最终态（仅供无头截图，不影响正常游玩）
  if (new URLSearchParams(location.search).get("shot")) {
    const st = document.createElement("style");
    st.textContent = "*{animation:none!important;transition:none!important}";
    document.head.appendChild(st);
  }
  renderCount(); initNote(); initEntrance(); initSearchBar();
  renderSearchPage();
  initZitiao(); initJiapu(); initHeying(); initMinglu(); initLuxian();
  initDangan(); initEnvelopeFlip(); initRiji();
  initYiwu(); initDna(); initShoulu(); initXie();

  const jiaPage = document.body.dataset.jia;
  if (jiaPage) markJiaRead(jiaPage);

  // 信封开场：默认隐藏，只有「存储可用 + 从未开始 + 首次直接打开」才自动展开。
  // 存储被浏览器禁用/清理的环境永远不自动弹（可用首页"重读"入口看信）。
  const overlay = document.getElementById("envelope-overlay");
  const enterBtn = document.getElementById("enter-village");
  const isShot = new URLSearchParams(location.search).get("shot");
  function storageOK() {
    try {
      localStorage.setItem("ws_probe", "1");
      const ok = localStorage.getItem("ws_probe") === "1";
      localStorage.removeItem("ws_probe");
      return ok;
    } catch (e) { return false; }
  }
  let started = null;
  try { started = localStorage.getItem("ws_started") || sessionStorage.getItem("ws_session"); } catch (e) {}
  let fromInside = false;
  try {
    const curDir = location.pathname.replace(/[^/]*$/, "");
    fromInside = new URL(document.referrer).pathname.replace(/[^/]*$/, "") === curDir;
  } catch (e) {}
  function closeEnv() {
    try {
      localStorage.setItem("ws_started", "1");
      sessionStorage.setItem("ws_session", "1");
    } catch (e) {}
    overlay.classList.add("hide");
    // 信合上下接第一幕开启卡（照片：家门口的告别）——ws_actcard一 保证只弹一次
    setTimeout(() => showActCard("一", "离家",
      "一九四七年，他从这扇门里走出去，再没回来。<br>从村志网的第一条线索开始，把他找回来。", ""), 600);
  }
  if (overlay && enterBtn) {
    overlay.classList.add("fx"); // 加载完成后才开过渡，防止首屏闪
    // 「进村志网」按钮始终绑定（首次自动弹信与手动重读都靠它关信）
    enterBtn.addEventListener("click", closeEnv);
    if (!isShot && storageOK() && !started && !fromInside) {
      overlay.classList.remove("hide");
    }
    // 重读入口（只展示，不改写"已读"状态）
    const reread = document.getElementById("reread-env");
    if (reread) reread.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.classList.remove("hide");
    });
  }

  // 站内搜索框
  const sInput = document.getElementById("home-search-input");
  const sBtn = document.getElementById("home-search-btn");
  if (sInput && sBtn) {
    const go = () => { if (sInput.value.trim()) location.href = "search.html?q=" + encodeURIComponent(sInput.value.trim()); };
    sBtn.addEventListener("click", go);
    sInput.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  }

  // 寻访笔记 · 重新开始
  const panel = document.getElementById("note-panel");
  if (panel && !document.getElementById("note-reset")) {
    const rb = document.createElement("button");
    rb.id = "note-reset";
    rb.textContent = "忘了吧，重新开始";
    rb.style.cssText = "margin-top:12px;background:none;border:1px solid #d8cfba;color:#6b655a;font-family:'KaiTi','楷体',cursive;font-size:.85rem;padding:5px 14px;cursor:pointer;width:100%";
    rb.addEventListener("click", () => {
      if (confirm("忘掉已找到的全部线索，从头开始？")) {
        localStorage.removeItem("ws_found");
        localStorage.removeItem("ws_started");
        localStorage.removeItem("ws_jia");
        localStorage.removeItem("ws_riji");
        location.href = "index.html";
      }
    });
    panel.appendChild(rb);
  }
});
