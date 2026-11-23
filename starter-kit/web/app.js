// Northpine Outfitters shop website.
// You do not need to edit this file in the course. The Python backend unlocks each feature.

const main = document.getElementById("main");
const state = { products: [], features: [], terrain: null, category: null, sort: "name", conversationId: null, bag: [] };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (n) => new Intl.NumberFormat("nb-NO").format(n);
const kr = (n) => `${num(n)} kr`;
const feature = (id) => state.features.find((f) => f.id === id) || { enabled: false, module: "?" };
const pad = (n) => String(n).padStart(2, "0");
const lockTag = (id) => `<span class="locked">Opens in Module ${pad(feature(id).module)}</span>`;
const shortName = (p) => p.name.replace(p.brand + " ", "");
const bySku = (sku) => state.products.find((p) => p.sku.toLowerCase() === String(sku).toLowerCase());

async function api(path, options) {
  const res = await fetch(path, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || `The server answered with status ${res.status}.`);
  return body;
}

// ---------- Day and night ----------
const themeBtn = document.getElementById("theme-toggle");
function showTheme() {
  const night = document.documentElement.dataset.theme === "night";
  themeBtn.setAttribute("aria-pressed", night);
  document.getElementById("theme-label").textContent = night ? "Switch to day" : "Switch to night";
  themeBtn.title = night ? "Switch to day" : "Switch to night";
}
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "night" ? "day" : "night";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("northpine-theme", next); } catch { /* the choice just lasts until reload */ }
  showTheme();
});
showTheme();

// ---------- The hero photo: a lit tent under the Milky Way ----------
const heroPhoto = () => `<img class="hero-photo" src="/assets/photos/hero-night-2400.webp" srcset="/assets/photos/hero-night-1200.webp 1200w, /assets/photos/hero-night-2400.webp 2400w" sizes="100vw" alt="A lit tent under a sky full of stars" width="2400" height="1600">`;

// ---------- Terrain kits: which gear belongs at which height ----------
const TERRAIN = [
  { id: "winter", name: "Winter summit", alt: "above 1,800 m", y: [18, 92], skus: ["TNT-201", "TNT-202", "SLB-102", "SLB-103", "MAT-102", "MAT-201", "STV-201", "SKI-101", "SKI-102", "SKI-103", "BPK-301", "JKT-201", "HDL-201", "BOT-301"] },
  { id: "glacier", name: "Glacier", alt: "1,100 to 1,800 m", y: [92, 160], skus: ["BOT-202", "BOT-301", "CRP-101", "CRP-102", "CRP-103", "JKT-101", "JKT-201", "HDL-201", "BPK-201"] },
  { id: "treeline", name: "Tree line", alt: "600 to 1,100 m", y: [160, 226], skus: ["TNT-101", "TNT-102", "TNT-301", "SLB-101", "SLB-201", "MAT-101", "MAT-201", "BPK-201", "BPK-202", "BOT-201", "STV-102", "HDL-102", "JKT-202", "ACC-101"] },
  { id: "trail", name: "Trail", alt: "below 600 m", y: [226, 292], skus: ["BOT-101", "BOT-102", "BPK-101", "BPK-102", "JKT-102", "JKT-101", "HDL-101", "ACC-102", "STV-101", "SKI-103"] },
];
const RIDGE = "M0 292 60 252 130 216 190 172 240 182 300 112 345 132 400 40 440 86 480 70 540 152 600 192 660 240 720 264";

function terrainSvg() {
  const bands = TERRAIN.map((t) => {
    const on = state.terrain === t.id;
    const mid = (t.y[0] + t.y[1]) / 2;
    return `<rect class="band" x="0" y="${t.y[0]}" width="720" height="${t.y[1] - t.y[0]}" clip-path="url(#mountain)" role="button" tabindex="0" aria-pressed="${on}" aria-label="Show gear for ${t.name}, ${t.alt}" data-terrain="${t.id}"/>
      <line class="tick" x1="0" x2="930" y1="${t.y[0]}" y2="${t.y[0]}"/>
      <text class="pick ${on ? "on" : ""}" x="736" y="${mid - 2}" data-terrain="${t.id}">${t.name}</text><text class="alt" x="736" y="${mid + 18}">${t.alt}</text>`;
  }).join("");
  return `<svg class="terrain" viewBox="0 0 930 300" role="group" aria-label="Choose your terrain">
    <defs><clipPath id="mountain"><path d="${RIDGE} 720 292Z"/></clipPath></defs>
    ${bands}
    <g clip-path="url(#mountain)"><path class="contour" d="M150 292c60-50 120-58 190-40s150 10 240-34"/><path class="contour" d="M250 232c40-36 80-44 130-30s90 0 130-30"/><path class="contour" d="M330 160c24-22 50-28 78-18s46-4 66-22"/><path class="contour" d="M378 96c12-10 24-13 38-8"/></g>
    <path class="ridge" d="${RIDGE}"/>
  </svg>`;
}

// ---------- Category pictograms ----------
const ICONS = {
  "Tents": "M4 36 22 8l18 28zM22 8v28M16 36l6-10 6 10",
  "Sleeping bags": "M10 38V16a12 12 0 0 1 24 0v22zM10 20h24M17 12a6 4 0 0 0 10 0",
  "Sleeping mats": "M5 30h34v6H5zM5 30l6-14h22l6 14M14 23h16",
  "Backpacks": "M12 38V18a10 10 0 0 1 20 0v20zM17 10V7h10v3M16 26h12v8H16zM12 22h20",
  "Boots": "M12 6h10v14l14 6v10H8V10zM8 32h28M22 20h-6M22 14h-5",
  "Crampons": "M6 14h32v8H6zM10 22l-2 12M18 22l-1 12M27 22l1 12M35 22l2 12M6 14l-2-7M38 14l2-7",
  "Jackets": "M15 6l7 5 7-5 9 8-5 6-3-3v21H14V17l-3 3-5-6zM22 11v27",
  "Stoves": "M10 38h24M14 38l2-8h12l2 8M12 30h20M22 26c-6-4-5-9 0-14 5 5 6 10 0 14zM22 24c-2-2-2-4 0-6",
  "Headlamps": "M6 16h16a8 8 0 0 1 0 16H6zM30 18l10-4M32 24h10M30 30l10 4M12 16v16",
  "Ski touring": "M12 40 16 6M26 40 30 6M8 26h12M22 26h12M36 40V12M33 34h6",
  "Accessories": "M8 34 24 18M24 18a8 8 0 1 1 6 6M8 34l4 4 6-6M28 10l6 6",
};
const icon = (cat) => `<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="${ICONS[cat] || ICONS["Accessories"]}"/></svg>`;

// ---------- Shop ----------
function visibleProducts() {
  let list = state.products;
  if (state.terrain) { const kit = TERRAIN.find((t) => t.id === state.terrain).skus; list = list.filter((p) => kit.includes(p.sku)); }
  if (state.category) list = list.filter((p) => p.category === state.category);
  const by = { name: (a, b) => a.name.localeCompare(b.name), weight: (a, b) => a.weight_g - b.weight_g, price: (a, b) => a.price_nok - b.price_nok };
  return [...list].sort(by[state.sort]);
}

function photo(p, big) {
  return p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" ${big ? "" : 'loading="lazy"'} width="960" height="720">`
    : `<div class="no-photo">${icon(p.category)}<span>Photo coming</span></div>`;
}

function card(p) {
  return `<li class="item">
    <a class="item-link" href="#/product/${esc(p.sku)}">
      <div class="shot">${photo(p)}<span class="badge">${esc(p.season)}</span>${p.stock <= 3 ? `<span class="badge low">Only ${p.stock} left</span>` : ""}</div>
      <p class="brand-name">${esc(p.brand)}</p><h3>${esc(shortName(p))}</h3><p class="meta">${num(p.weight_g)} g</p>
    </a>
    <div class="item-foot"><span class="price">${kr(p.price_nok)}</span><button class="add" type="button" data-add="${esc(p.sku)}" aria-label="Add ${esc(p.name)} to your bag">Add to bag</button></div>
  </li>`;
}

const COUNT_ON = [
  ["M4 12a8 8 0 1 0 3-6.2M4 4v5h5", "30 days to return", "Changed your mind? Send it back unused within 30 days of delivery."],
  ["M7 8h10M7 8l3-3M7 8l3 3M17 16H7M17 16l-3-3M17 16l-3 3", "First size exchange is free", "Boots too tight? Swap them for another size within 30 days."],
  ["M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM9 12l2 2 4-4", "1 to 5 years of warranty", "Every product has a warranty. We repair first, and replace when we cannot."],
];

function renderShop() {
  const cats = [...new Set(state.products.map((p) => p.category))];
  const list = visibleProducts();
  const t = TERRAIN.find((x) => x.id === state.terrain);
  main.innerHTML = `
    <section class="hero">
      ${heroPhoto()}
      <div class="hero-copy">
        <h1>Gear for the height you are going to.</h1>
        <p>Tents, boots and shells for Norwegian mountains, from the trail to the winter summit.</p>
        <div class="hero-actions"><a class="primary" href="#gear" data-scroll="gear">Shop all gear</a><button class="ghost" type="button" data-ask="">Ask the Gear Guide</button></div>
      </div>
    </section>

    <section aria-labelledby="cats-h">
      <div class="section-head"><h2 id="cats-h">Shop by category</h2></div>
      <ul class="cats">${cats.map((c) => { const all = state.products.filter((p) => p.category === c); const first = all.find((p) => p.image); return `<li><button class="cat" type="button" data-cat="${esc(c)}" data-scroll="gear" aria-pressed="${state.category === c}">${first ? `<img src="${esc(first.image)}" alt="" loading="lazy" width="960" height="720">` : ""}<span>${esc(c)} <small>${all.length}</small></span></button></li>`; }).join("")}<li><button class="cat all" type="button" data-terrain-clear data-scroll="gear">All gear <small>${state.products.length} products</small></button></li></ul>
    </section>

    <section class="height" aria-labelledby="height-h">
      <div>
        <h2 id="height-h">Or shop by height</h2>
        <p>Pick a part of the mountain. We show the kit that belongs there.</p>
        <p class="kit-now">${t ? `${esc(t.name)}, ${esc(t.alt)}: ${t.skus.length} products` : "No height chosen yet"}</p>
      </div>
      ${terrainSvg()}
    </section>

    <section aria-label="Products">
      <div class="controls" id="gear">
        <h2>${t ? `${esc(t.name)} kit` : esc(state.category || "All gear")} <span>${list.length}</span></h2>
        <div class="search"><label class="visually-hidden" for="q">Search</label><input id="q" type="search" placeholder="Search the shop" ${feature("search").enabled ? "" : "disabled"}>${feature("search").enabled ? "" : lockTag("search")}</div>
        <label>Sort <select id="sort"><option value="name">Name</option><option value="weight">Lightest first</option><option value="price">Lowest price</option></select></label>
      </div>
      <div class="chips" role="group" aria-label="Filter by category">
        <button class="chip" type="button" data-terrain-clear aria-pressed="${!state.terrain && !state.category}">Everything</button>
        ${cats.map((c) => `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${state.category === c}">${esc(c)}</button>`).join("")}
      </div>
      ${list.length ? `<ul class="grid">${list.map(card).join("")}</ul>` : `<p class="empty">No ${esc(state.category || "gear")} in this kit. Choose "Everything" to see the whole shop.</p>`}
    </section>

    <ul class="count-on" aria-label="What you can count on">${COUNT_ON.map(([d, h, p]) => `<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg><h3>${h}</h3><p>${p}</p></li>`).join("")}</ul>
    <section class="ask"><div><h2>Not sure what to pack?</h2><p>Tell the Gear Guide where you are going and when. It helps you choose.</p></div><button class="primary" type="button" data-ask="">Ask the Gear Guide</button></section>`;
  document.getElementById("sort").value = state.sort;
}

function rerenderShop(scrollTo) {
  const y = window.scrollY;
  renderShop();
  // Keep the page where it was, so a filter click does not replay the hero or jump to the top.
  main.querySelectorAll(".hero-photo, .hero-copy > *").forEach((el) => (el.style.animation = "none"));
  const ridge = main.querySelector(".terrain .ridge"); if (ridge) { ridge.style.animation = "none"; ridge.style.strokeDashoffset = 0; }
  window.scrollTo({ top: y, behavior: "instant" });
  if (scrollTo) document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

main.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) return addToBag(add.dataset.add, null, 1);
  const band = e.target.closest("[data-terrain]");
  if (band) { state.terrain = state.terrain === band.dataset.terrain ? null : band.dataset.terrain; return rerenderShop(); }
  const cat = e.target.closest("[data-cat]");
  if (cat) { state.category = state.category === cat.dataset.cat ? null : cat.dataset.cat; return rerenderShop(cat.dataset.scroll); }
  const clear = e.target.closest("[data-terrain-clear]");
  if (clear) { state.terrain = null; state.category = null; return rerenderShop(clear.dataset.scroll); }
  const scroll = e.target.closest("a[data-scroll]");
  if (scroll) { e.preventDefault(); document.getElementById(scroll.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
  const ask = e.target.closest("[data-ask]");
  if (ask) { openChat(ask.dataset.ask); }
});
main.addEventListener("keydown", (e) => {
  const band = e.target.closest?.("[data-terrain]");
  if (band && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); band.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});
main.addEventListener("change", (e) => { if (e.target.id === "sort") { state.sort = e.target.value; rerenderShop(); } });

// ---------- Product page ----------
const label = (k) => { const s = k.replace(/_/g, " ").replace(/\b(cm|mm|kg|eu|nok|c|l|h|w|g)$/i, (u) => `(${u.toLowerCase() === "c" ? "°C" : u})`); return s.charAt(0).toUpperCase() + s.slice(1); };
const value = (v) => (Array.isArray(v) ? v.join(", ") : v === true ? "Yes" : v === false ? "No" : v);

// Turn "37-48", "XS-XXL" or "S/M, M/L" into a list of sizes to choose from.
function sizesOf(p) {
  const raw = Object.entries(p.specs).find(([k]) => /^(sizes|sizes_eu|torso_sizes)$/.test(k))?.[1];
  if (!raw || /one size/i.test(raw)) return [];
  const range = String(raw).match(/^(\d+)-(\d+)$/);
  if (range) return Array.from({ length: range[2] - range[1] + 1 }, (_, i) => String(+range[1] + i));
  const letters = ["XS", "S", "M", "L", "XL", "XXL"], span = String(raw).match(/^([A-Z]+)-([A-Z]+)$/);
  if (span && letters.includes(span[1]) && letters.includes(span[2])) return letters.slice(letters.indexOf(span[1]), letters.indexOf(span[2]) + 1);
  return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
}

function renderProduct(sku) {
  const p = bySku(sku);
  if (!p) { main.innerHTML = `<div class="page-head"><h1>We could not find that product.</h1><p><a href="#/">Go back to the shop</a></p></div>`; return; }
  const rows = [["Weight", `${num(p.weight_g)} g`], ["Season", p.season], ["Warranty", `${p.warranty_years} years`], ...Object.entries(p.specs).map(([k, v]) => [label(k), value(v)])];
  const sizes = sizesOf(p);
  const kit = TERRAIN.find((t) => t.skus.includes(p.sku));
  const mates = (kit ? kit.skus.map(bySku) : state.products).filter((x) => x && x.sku !== p.sku && x.category !== p.category).slice(0, 4);
  main.innerHTML = `
    <nav class="crumbs" aria-label="You are here"><a href="#/">Shop</a><span aria-hidden="true">/</span><span>${esc(p.category)}</span><span aria-hidden="true">/</span><span>${esc(shortName(p))}</span></nav>
    <article class="product">
      <div>
        <div class="product-photo" id="zoom">${photo(p, true)}</div>
        <section class="panel"><h2>Details</h2>
          <table class="specs"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
        </section>
        <section class="panel"><h2>Reviews</h2>${feature("reviews").enabled ? `<div id="reviews"></div>` : `<p>A summary of what customers say, in your language.</p>${lockTag("reviews")}`}</section>
      </div>
      <aside class="buy">
        <div><p class="brand-name">${esc(p.category)} by ${esc(p.brand)}</p><h1>${esc(shortName(p))}</h1></div>
        <p class="lede">${esc(p.description)}</p>
        <p class="price">${kr(p.price_nok)}</p>
        <p class="stock ${p.stock > 3 ? "" : "few"}">${p.stock > 3 ? `In stock: ${p.stock}` : `Only ${p.stock} left`}</p>
        ${sizes.length ? `<fieldset class="sizes"><legend>Size</legend><div>${sizes.map((s) => `<button class="size" type="button" data-size="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join("")}</div></fieldset>` : ""}
        <div class="buy-row">
          <div class="qty"><button type="button" data-qty="-1" aria-label="One less">−</button><output id="qty" aria-label="Quantity">1</output><button type="button" data-qty="1" aria-label="One more">+</button></div>
          <button class="primary" type="button" id="buy">Add to bag</button>
        </div>
        <p class="size-hint" id="size-hint" role="status"></p>
        <button class="ghost" type="button" data-ask="Tell me about the ${esc(p.name)}. Who is it for?">Ask the Gear Guide about this</button>
        <ul class="facts">
          <li>30 days to return, unused and in its packaging</li>
          <li>${p.warranty_years} years of warranty</li>
          <li>SKU ${esc(p.sku)}</li>
          ${p.manual ? `<li><a href="${esc(p.manual.url)}" target="_blank" rel="noopener">Read the manual (PDF)</a></li>` : ""}
        </ul>
      </aside>
    </article>
    ${mates.length ? `<section class="goes-with"><h2>${kit ? `Also in the ${esc(kit.name.toLowerCase())} kit` : "More gear"}</h2><ul class="grid">${mates.map(card).join("")}</ul></section>` : ""}`;

  let size = null, qty = 1;
  const hint = document.getElementById("size-hint");
  main.querySelectorAll(".size").forEach((b) => b.addEventListener("click", () => {
    size = b.dataset.size; hint.textContent = "";
    main.querySelectorAll(".size").forEach((x) => x.setAttribute("aria-pressed", x === b));
  }));
  main.querySelectorAll("[data-qty]").forEach((b) => b.addEventListener("click", () => {
    qty = Math.min(Math.max(1, qty + Number(b.dataset.qty)), p.stock);
    document.getElementById("qty").textContent = qty;
  }));
  document.getElementById("buy").addEventListener("click", () => {
    if (sizes.length && !size) { hint.textContent = "Choose a size first."; return; }
    addToBag(p.sku, size, qty);
  });
  // Move the mouse over the photo to look closer.
  const zoom = document.getElementById("zoom"), img = zoom.querySelector("img");
  if (img) {
    zoom.addEventListener("mousemove", (e) => { const r = zoom.getBoundingClientRect(); img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; zoom.classList.add("zoom"); });
    zoom.addEventListener("mouseleave", () => zoom.classList.remove("zoom"));
  }
}

// ---------- Your bag ----------
// The bag lives in the browser only. This is a course shop: nothing is ordered and nothing is paid.
const cart = document.getElementById("cart"), cartBody = document.getElementById("cart-body"), scrim = document.getElementById("scrim"), toast = document.getElementById("toast");
function loadBag() { try { const saved = JSON.parse(localStorage.getItem("northpine-bag") || "[]"); state.bag = Array.isArray(saved) ? saved.filter((l) => bySku(l.sku) && l.qty > 0) : []; } catch { state.bag = []; } }
function saveBag() { try { localStorage.setItem("northpine-bag", JSON.stringify(state.bag)); } catch { /* the bag just lasts until reload */ } }
let toastTimer;
function say(text) { toast.textContent = text; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toast.hidden = true), 2600); }

function addToBag(sku, size, qty) {
  const p = bySku(sku); if (!p) return;
  if (!size && sizesOf(p).length) { location.hash = `#/product/${p.sku}`; say("Choose a size on the product page."); return; }
  const line = state.bag.find((l) => l.sku === p.sku && l.size === size);
  const have = state.bag.filter((l) => l.sku === p.sku).reduce((n, l) => n + l.qty, 0);
  if (have + qty > p.stock) { say(`We only have ${p.stock} of the ${shortName(p)} in stock.`); return; }
  if (line) line.qty += qty; else state.bag.push({ sku: p.sku, size, qty });
  saveBag(); showBag();
  say(`${shortName(p)} is in your bag.`);
  const count = document.getElementById("cart-count"); count.classList.remove("bump"); void count.offsetWidth; count.classList.add("bump");
}

function showBag() {
  const count = document.getElementById("cart-count"), n = state.bag.reduce((s, l) => s + l.qty, 0);
  count.textContent = n; count.hidden = n === 0;
  if (!state.bag.length) { cartBody.innerHTML = `<div class="cart-empty"><p>Your bag is empty.</p><button class="secondary" type="button" data-close-cart>Look at the gear</button></div>`; return; }
  const total = state.bag.reduce((s, l) => s + bySku(l.sku).price_nok * l.qty, 0);
  cartBody.innerHTML = `<ul class="cart-lines">${state.bag.map((l, i) => { const p = bySku(l.sku); return `<li class="cart-line">
      ${p.image ? `<img src="${esc(p.image)}" alt="">` : `<span></span>`}
      <div><h3>${esc(shortName(p))}</h3><p>${esc(p.brand)}${l.size ? `, size ${esc(l.size)}` : ""}</p>
        <div class="qty"><button type="button" data-line="${i}" data-step="-1" aria-label="One less ${esc(shortName(p))}">−</button><output>${l.qty}</output><button type="button" data-line="${i}" data-step="1" aria-label="One more ${esc(shortName(p))}">+</button></div></div>
      <div><p class="line-total">${kr(p.price_nok * l.qty)}</p><button class="remove" type="button" data-line="${i}" data-step="-999">Remove</button></div></li>`; }).join("")}</ul>
    <div class="cart-sum"><div class="row"><span>Total</span><span>${kr(total)}</span></div>
      <p>This is a course shop. Checkout is closed, so nothing is ordered and nothing is paid.</p>
      <button class="secondary" type="button" data-close-cart>Keep looking</button></div>`;
}

function openCart() { chat.hidden = true; showBag(); cart.hidden = false; scrim.hidden = false; document.getElementById("close-cart").focus(); }
function closeCart() { if (cart.hidden) return; cart.hidden = true; scrim.hidden = true; }
document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", () => { closeCart(); document.getElementById("open-cart").focus(); });
scrim.addEventListener("click", closeCart);
cartBody.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-cart]")) return closeCart();
  const b = e.target.closest("[data-line]"); if (!b) return;
  const line = state.bag[Number(b.dataset.line)], p = bySku(line.sku), step = Number(b.dataset.step);
  const have = state.bag.filter((l) => l.sku === line.sku).reduce((n, l) => n + l.qty, 0);
  if (step > 0 && have + step > p.stock) return say(`We only have ${p.stock} of the ${shortName(p)} in stock.`);
  line.qty += step;
  if (line.qty <= 0) state.bag.splice(Number(b.dataset.line), 1);
  saveBag(); showBag();
});
document.addEventListener("keydown", (e) => { if (e.key !== "Escape") return; if (!cart.hidden) closeCart(); else if (!chat.hidden) chat.hidden = true; });

// ---------- Returns ----------
function renderReturns() {
  const on = feature("returns").enabled;
  main.innerHTML = `
    <div class="page-head"><h1>Return or repair</h1><p>Find your order, then send us the receipt and photos of the problem.</p></div>
    <form id="order-form" class="form-row">
      <label for="order-id">Order number<input id="order-id" type="text" placeholder="NP-2026-00105" autocomplete="off"></label>
      <button class="secondary" type="submit">Find my order</button>
    </form>
    <div id="order-result"></div>
    <section class="panel"><h2>Start a return</h2>
      <p>Upload your receipt and a photo or short video. Refunds of 1,500 kr or less are approved at once. Larger refunds are checked by our staff.</p>
      ${on ? `<div id="return-form"></div>` : lockTag("returns")}
    </section>`;
  document.getElementById("order-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const box = document.getElementById("order-result");
    const id = document.getElementById("order-id").value.trim();
    if (!id) { box.innerHTML = `<div class="result error">Type your order number first. It starts with NP-2026.</div>`; return; }
    try {
      const o = await api(`/api/orders/${encodeURIComponent(id)}`);
      box.innerHTML = `<div class="result"><h3>Order ${esc(o.order_id)}</h3><p>Ordered ${esc(o.order_date)}. Status: ${esc(o.status)}.</p>
        <ul>${o.items.map((i) => `<li>${i.quantity} × ${esc(i.name)}, ${kr(i.line_total_nok)}</li>`).join("")}</ul><p><strong>Total ${kr(o.total_nok)}</strong></p></div>`;
    } catch (err) { box.innerHTML = `<div class="result error">${esc(err.message)} Check the number on your receipt.</div>`; }
  });
}

// ---------- Staff and course map ----------
function renderStaff() {
  const items = state.features.filter((f) => f.area === "staff");
  main.innerHTML = `
    <div class="page-head"><h1>Staff workspace</h1><p>Tools for the people who run the shop: the catalog, customer reviews, refunds and quality.</p></div>
    <div class="steps">${items.map((f) => `<div class="card"><h3>${esc(f.title)}</h3><p>${esc(f.summary)}</p>${f.enabled ? `<span class="open">Open</span>` : lockTag(f.id)}</div>`).join("")}
      <div class="card"><h3>Refund approvals</h3><p>Refunds above 1,500 kr wait here for a yes or no.</p>${feature("returns").enabled ? `<span class="open">Open</span>` : lockTag("returns")}</div></div>`;
}

function renderCourse() {
  const open = state.features.filter((f) => f.enabled).length;
  main.innerHTML = `
    <div class="page-head"><h1>Course map</h1><p>${open} of ${state.features.length} features are open. Each module of the AI-103 course opens one more.</p></div>
    <table class="map"><thead><tr><th scope="col">Module</th><th scope="col">Feature</th><th scope="col">What it does</th><th scope="col">Status</th></tr></thead>
    <tbody>${state.features.map((f) => `<tr><td>${pad(f.module)}</td><td><strong>${esc(f.title)}</strong></td><td>${esc(f.summary)}</td><td>${f.enabled ? `<span class="open">Open</span>` : `<span class="locked">Locked</span>`}</td></tr>`).join("")}</tbody></table>`;
}

// ---------- Gear Guide chat ----------
const chat = document.getElementById("chat"), log = document.getElementById("chat-log"), input = document.getElementById("chat-input");
const note = document.getElementById("chat-note"), send = document.getElementById("chat-send");

function addMessage(kind, text, sources) {
  const div = document.createElement("div");
  div.className = `msg ${kind}`;
  div.textContent = text;
  if (sources?.length) {
    const ul = document.createElement("ul"); ul.className = "sources";
    for (const s of sources) { const li = document.createElement("li"); if (s.url) { const a = document.createElement("a"); a.href = s.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = s.title; li.append(a); } else li.textContent = s.title; ul.append(li); }
    div.append(ul);
  }
  log.append(div); log.scrollTop = log.scrollHeight;
}

function openChat(prefill) {
  closeCart();
  chat.hidden = false;
  const on = feature("chat").enabled;
  input.disabled = !on; send.disabled = !on;
  document.getElementById("chat-photo").disabled = !feature("vision").enabled;
  document.getElementById("chat-voice").disabled = !feature("voice").enabled;
  note.textContent = on ? "" : "";
  if (!log.children.length) {
    if (on) addMessage("guide", "Hi! I am the Northpine Gear Guide. Ask me about gear for your next trip.");
    else addMessage("system", `The Gear Guide is not connected to a model yet. You connect it in Module ${pad(feature("chat").module)} of the course.`);
  }
  if (!feature("vision").enabled || !feature("voice").enabled) note.textContent = `Photos open in Module ${pad(feature("vision").module)}. Voice opens in Module ${pad(feature("voice").module)}.`;
  if (prefill && on) input.value = prefill;
  (on ? input : document.getElementById("close-chat")).focus();
}

document.getElementById("open-chat").addEventListener("click", () => openChat());
document.getElementById("close-chat").addEventListener("click", () => { chat.hidden = true; document.getElementById("open-chat").focus(); });
input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); document.getElementById("chat-form").requestSubmit(); } });
document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message || !feature("chat").enabled) return;
  addMessage("user", message); input.value = ""; send.disabled = true; send.textContent = "Thinking";
  try {
    const r = await api("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, conversation_id: state.conversationId }) });
    state.conversationId = r.conversation_id ?? state.conversationId;
    addMessage("guide", r.reply, r.citations);
  } catch (err) { addMessage("system", `The Gear Guide could not answer. ${err.message}`); }
  send.disabled = false; send.textContent = "Send"; input.focus();
});

// ---------- Router ----------
function route() {
  const [, page, arg] = location.hash.replace(/^#/, "").split("/");
  const nav = { "": "shop", product: "shop", returns: "returns", staff: "staff", course: "course" }[page || ""];
  document.querySelectorAll("[data-nav]").forEach((a) => (a.dataset.nav === nav ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  if (page === "product") renderProduct(arg || "");
  else if (page === "returns") renderReturns();
  else if (page === "staff") renderStaff();
  else if (page === "course") renderCourse();
  else renderShop();
  window.scrollTo({ top: 0, behavior: "instant" });
}

async function start() {
  try {
    [state.features, state.products] = await Promise.all([api("/api/features"), api("/api/products")]);
  } catch (err) {
    main.innerHTML = `<div class="page-head"><h1>The shop cannot reach its backend.</h1><p>Start it with <code>uvicorn app.main:app --reload --port 8000</code> in the starter-kit folder, then reload this page. (${esc(err.message)})</p></div>`;
    return;
  }
  loadBag(); showBag();
  const cats = [...new Set(state.products.map((p) => p.category))];
  document.getElementById("foot-cats").innerHTML = cats.map((c) => `<li><a href="#/" data-foot-cat="${esc(c)}">${esc(c)}</a></li>`).join("");
  document.getElementById("foot-cats").addEventListener("click", (e) => {
    const a = e.target.closest("[data-foot-cat]"); if (!a) return;
    e.preventDefault(); state.category = a.dataset.footCat; state.terrain = null;
    if (location.hash && location.hash !== "#/") location.hash = "#/"; else renderShop();
    requestAnimationFrame(() => document.getElementById("gear")?.scrollIntoView({ block: "start" }));
  });
  window.addEventListener("hashchange", route);
  route();
}
start();
