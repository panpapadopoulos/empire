
function setActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a=>{
    const href = a.getAttribute("href");
    if(href === path) a.classList.add("active");
  });
}

function byId(id){ return document.getElementById(id); }

async function loadJSON(url){
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (e) {
    // ignore and fallback
  }

  // Fallback for file:// mode
  const id = url.includes("posts") ? "postsData" : "regionsData";
  const el = document.getElementById(id);
  if (el) return JSON.parse(el.textContent);

  throw new Error("JSON load failed");
}


function el(tag, cls, html){
  const node = document.createElement(tag);
  if(cls) node.className = cls;
  if(html !== undefined) node.innerHTML = html;
  return node;
}

function renderTags(tags){
  const wrap = el("div","row");
  (tags || []).forEach(t=>{
    wrap.appendChild(el("span","tag", t));
  });
  return wrap;
}

// Decrees/Chronicles page
async function initDecrees(){
  const root = byId("postsRoot");
  if(!root) return;
  const data = await loadJSON("data/posts.json");

  const streamSel = byId("stream");
  const q = byId("q");
  const tagSel = byId("tag");

  // Populate tags
  const tags = Array.from(new Set(data.posts.flatMap(p=>p.tags || []))).sort();
  tags.forEach(t=>{
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t;
    tagSel.appendChild(opt);
  });

  function matches(p){
    const s = streamSel.value;
    if(s !== "all" && p.stream !== s) return false;
    const needle = q.value.trim().toLowerCase();
    if(needle){
      const hay = (p.title + " " + (p.summary||"") + " " + (p.body||"")).toLowerCase();
      if(!hay.includes(needle)) return false;
    }
    const tag = tagSel.value;
    if(tag !== "all" && !(p.tags||[]).includes(tag)) return false;
    return true;
  }

  function render(){
    root.innerHTML = "";
    const items = data.posts.filter(matches).sort((a,b)=> (b.date||"").localeCompare(a.date||""));
    if(items.length === 0){
      root.appendChild(el("div","notice","No posts match your filters yet."));
      return;
    }
    items.forEach(p=>{
      const card = el("div","post");
      card.appendChild(el("h4", null, p.title));
      card.appendChild(el("div","meta", `${p.date} • ${p.author} • <span class="badge">${p.streamLabel}</span>`));
      card.appendChild(el("p", null, p.summary || ""));
      card.appendChild(renderTags(p.tags));
      const btnRow = el("div","row");
      const btn = el("a","btn secondary","Read");
      btn.href = `post.html#${encodeURIComponent(p.id)}`;
      btnRow.appendChild(btn);
      card.appendChild(btnRow);
      root.appendChild(card);
    });
  }

  [streamSel,q,tagSel].forEach(x=> x.addEventListener("input", render));
  render();
}

// Post detail page
async function initPost(){
  const body = byId("postBody");
  if(!body) return;   // correct guard

  const data = await loadJSON("data/posts.json");

  const idFromHash = decodeURIComponent(location.hash.replace("#",""));
  const post =
    data.posts.find(p => p.id === idFromHash) ||
    data.posts[0];

  if(!post){
    body.innerHTML = "<div class='notice'>No post found.</div>";
    return;
  }

  byId("postTitle").textContent = post.title;
  byId("postMeta").innerHTML =
    `${post.date} • ${post.author} • <span class="badge">${post.streamLabel}</span>`;

  const tags = byId("postTags");
  tags.innerHTML = "";
  (post.tags || []).forEach(t =>
    tags.appendChild(el("span","tag", t))
  );

  body.innerHTML = post.body;
}


// Regions page
async function initRegions(){
  const root = byId("regionsRoot");
  if(!root) return;
  const data = await loadJSON("data/regions.json");

  const biomeSel = byId("biome");
  const typeSel = byId("type");
  const focusSel = byId("focus");
  const q = byId("rq");

  function getSet(key){
    return Array.from(new Set(data.regions.map(r=>r[key]).filter(Boolean))).sort();
  }
  getSet("biome").forEach(v=>{
    const o = document.createElement("option"); o.value=v; o.textContent=v; biomeSel.appendChild(o);
  });
  getSet("type").forEach(v=>{
    const o = document.createElement("option"); o.value=v; o.textContent=v; typeSel.appendChild(o);
  });
  Array.from(new Set(data.regions.flatMap(r=>r.focus||[]))).sort().forEach(v=>{
    const o = document.createElement("option"); o.value=v; o.textContent=v; focusSel.appendChild(o);
  });

  function matches(r){
    if(biomeSel.value !== "all" && r.biome !== biomeSel.value) return false;
    if(typeSel.value !== "all" && r.type !== typeSel.value) return false;
    if(focusSel.value !== "all" && !(r.focus||[]).includes(focusSel.value)) return false;
    const needle = q.value.trim().toLowerCase();
    if(needle){
      const hay = (r.name + " " + r.duke + " " + (r.specialty||"") + " " + (r.lore||"")).toLowerCase();
      if(!hay.includes(needle)) return false;
    }
    return true;
  }

  function render(){
    root.innerHTML = "";
    const items = data.regions.filter(matches);
    if(items.length === 0){
      root.appendChild(el("div","notice","No regions match your filters yet."));
      return;
    }
    items.forEach(r=>{
      const card = el("div","card pad");
      card.appendChild(el("div","h3", r.name));
      card.appendChild(el("div","meta", `${r.type} • Duke: ${r.duke}`));
      const kv = el("div","kv");
      kv.innerHTML = `
        <b>Biome</b><div>${r.biome || "—"}</div>
        <b>Specialty</b><div>${r.specialty || "—"}</div>
        <b>Founded</b><div>${r.founded || "—"}</div>
      `;
      card.appendChild(el("div","hr"));
      card.appendChild(kv);
      const focus = el("div","row");
      (r.focus||[]).forEach(f=> focus.appendChild(el("span","tag", f)));
      card.appendChild(focus);

      const row = el("div","row");
      const btn = el("a","btn secondary","Open Region Page");
      btn.href = `region.html#${encodeURIComponent(r.id)}`;
      row.appendChild(btn);
      card.appendChild(row);
      root.appendChild(card);
    });
  }

  [biomeSel,typeSel,focusSel,q].forEach(x=> x.addEventListener("input", render));
  render();
}

async function initRegion(){
  const kv = byId("regionKV");
  if(!kv) return;   // correct guard

  const data = await loadJSON("data/regions.json");

  const idFromHash = decodeURIComponent(location.hash.replace("#",""));
  const region =
    data.regions.find(r => r.id === idFromHash) ||
    data.regions[0];

  if(!region){
    kv.innerHTML = "<div class='notice'>Region not found.</div>";
    return;
  }

  byId("regionName").textContent = region.name;
  byId("regionMeta").textContent = `${region.type} • Duke: ${region.duke}`;
  byId("regionLore").textContent = region.lore || "";

  byId("regionKV").innerHTML = `
    <b>Biome</b><div>${region.biome || "—"}</div>
    <b>Founded</b><div>${region.founded || "—"}</div>
    <b>Specialty</b><div>${region.specialty || "—"}</div>
    <b>Contribution</b><div>${region.contribution || "—"}</div>
    <b>Key Locations</b><div>${(region.locations||[]).join("<br>") || "—"}</div>
    <b>Coordinates</b><div>${(region.coordinates||[]).join("<br>") || "—"}</div>
    <b>Relations</b><div>${region.relations || "—"}</div>
  `;

  const tags = byId("regionTags");
  tags.innerHTML = "";
  (region.focus || []).forEach(f =>
    tags.appendChild(el("span","tag", f))
  );

  const gallery = byId("regionGallery");
  gallery.innerHTML = "";
  const n = Math.max(4, region.galleryPlaceholders || 6);
  for(let i = 1; i <= n; i++){
    gallery.appendChild(el("div","ph", `Screenshot ${i}`));
  }
}


// Codex search + article switching
function initCodex(){
  const list = document.querySelectorAll("[data-article]");
  if(list.length === 0) return;
  const q = byId("cq");
  const items = Array.from(list).map(a=>({
    id: a.getAttribute("data-article"),
    title: a.textContent.trim(),
    node: a
  }));

  function activate(id){
    // sidebar state
    document.querySelectorAll("[data-article]").forEach(a=> a.classList.toggle("active", a.getAttribute("data-article")===id));
    // show section
    document.querySelectorAll("section[data-article-section]").forEach(s=>{
      s.style.display = (s.getAttribute("data-article-section")===id) ? "block" : "none";
    });
    // hash
    location.hash = encodeURIComponent(id);
  }

  function filter(){
    const needle = (q?.value || "").trim().toLowerCase();
    items.forEach(it=>{
      it.node.style.display = (!needle || it.title.toLowerCase().includes(needle)) ? "block" : "none";
    });
  }

  items.forEach(it=>{
    it.node.addEventListener("click", (e)=>{
      e.preventDefault();
      activate(it.id);
    });
  });

  q?.addEventListener("input", filter);

  const fromHash = decodeURIComponent(location.hash.replace("#",""));
  activate(fromHash || items[0].id);
  filter();
}

document.addEventListener("DOMContentLoaded", ()=>{
  setActiveNav();
  initDecrees();
  initPost();
  initRegions();
  initRegion();
  initCodex();
});
