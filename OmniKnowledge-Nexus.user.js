// ==UserScript==
// @name         OmniKnowledge Nexus (Stable Core V6.6)
// @namespace    http://tampermonkey.net/
// @version      6.6
// @description  Professional Knowledge Management System & Web Collector (Template Version)
// @author       Vigilante0101
// @match        *://*/*
// @match        file:///*index.html*
// @match        file:///*MyNetwork.html*
// @match        https://vigilante0101.github.io/OmniKnowledge-Nexus/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // [1] Bypass YouTube Trusted Types
    if (window.trustedTypes && window.trustedTypes.createPolicy && !window.trustedTypes.defaultPolicy) {
        window.trustedTypes.createPolicy('default', { createHTML: (string) => string });
    }

    const DB_KEY = 'knowledge_base_nexus_public'; 

    const SECTION_TITLES = {
        'community': '🌐 مجتمع (Community)',
        'expert_local': '📍 خبير (محلي)',
        'expert_intl': '🌍 خبير (دولي)',
        'hashtag': '#️⃣ هاشتاج'
    };

    const BASE_CATEGORIES = ["General", "Work", "Research", "Media", "Tools", "Unclassified"];

    function getFreshDB() {
        let db = GM_getValue(DB_KEY, { items: [], sectionCats: null, customPlatforms: [], categoryIcons: {}, settings: {} });
        if (!db.sectionCats) {
            db.sectionCats = { 'community': [...BASE_CATEGORIES], 'expert_local': [...BASE_CATEGORIES], 'expert_intl': [...BASE_CATEGORIES], 'hashtag': [...BASE_CATEGORIES] };
        }
        return db;
    }

    const getIcon = (catName, db) => db.categoryIcons[catName] || "🔖";

    // التوجيه: لو الرابط فيه ملف الواجهة أو رابط جيت هاب، شغل اللوحة. لو موقع عادي، شغل الزر.
    const isDashboard = window.location.href.includes('index.html') || 
                        window.location.href.includes('MyNetwork.html') || 
                        window.location.href.includes('vigilante0101.github.io/OmniKnowledge-Nexus');

    if (isDashboard) {
        setTimeout(initDashboard, 100);
    } else {
        initCollector();
    }

    // ==========================================
    // 1. Collector Logic (Safe & Persistent)
    // ==========================================
    function initCollector() {
        if (document.getElementById('floating-grid-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'floating-grid-btn';
        btn.textContent = '💾';
        btn.style.cssText = `position: fixed; bottom: 30px; right: 30px; z-index: 2147483647; width: 60px; height: 60px; border-radius: 50%; background: #1877f2; color: white; font-size: 28px; border: 3px solid #fff; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3);`;
        btn.onclick = (e) => { e.preventDefault(); openAddModal(); };
        document.body.appendChild(btn);
        new MutationObserver(() => { if (!document.getElementById('floating-grid-btn')) document.body.appendChild(btn); }).observe(document.body, { childList: true });
    }

    function openAddModal() {
        if (document.getElementById('modal-overlay')) return;
        const currentTitle = document.title;
        const currentUrl = window.location.href;
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 2147483647; display: flex; justify-content: center; align-items: center; direction: rtl; font-family: sans-serif;`;

        const card = document.createElement('div');
        card.style.cssText = `background: #fff; padding: 25px; border-radius: 16px; width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);`;

        const h3 = document.createElement('h3'); h3.textContent = 'إضافة مصدر للشبكة'; h3.style.cssText = 'text-align:center; color:#1877f2; margin-top:0;'; card.appendChild(h3);
        
        const typeSelect = document.createElement('select'); typeSelect.style.cssText = 'width:100%; padding:10px; margin-bottom:15px; border:1px solid #ddd; border-radius:8px;';
        Object.keys(SECTION_TITLES).forEach(k => typeSelect.add(new Option(SECTION_TITLES[k], k)));
        card.appendChild(typeSelect);

        const catSelect = document.createElement('select'); catSelect.style.cssText = 'width:100%; padding:10px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;';
        card.appendChild(catSelect);

        const updateCats = () => {
            const tempDb = getFreshDB();
            catSelect.options.length = 0;
            (tempDb.sectionCats[typeSelect.value] || BASE_CATEGORIES).forEach(c => catSelect.add(new Option(c, c)));
        };
        typeSelect.onchange = updateCats; updateCats();

        const saveBtn = document.createElement('button'); saveBtn.textContent='💾 حفظ الآن'; saveBtn.style.cssText='width:100%; padding:12px; background:#1877f2; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;';
        saveBtn.onclick = () => {
            let latestDb = getFreshDB();
            latestDb.items.push({ id: Date.now(), title: currentTitle, url: currentUrl, category: catSelect.value, type: typeSelect.value, date: new Date().toISOString() });
            GM_setValue(DB_KEY, latestDb);
            saveBtn.textContent='✅ تم الحفظ!'; setTimeout(()=>overlay.remove(), 800);
        };

        card.appendChild(saveBtn); overlay.appendChild(card); document.body.appendChild(overlay);
        overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    }

    // ==========================================
    // 2. Dashboard Logic (The Grid System)
    // ==========================================
    function initDashboard() {
        document.body.innerHTML = '';
        let db = getFreshDB();

        GM_addStyle(`
            body { background: #f0f2f5; font-family: 'Segoe UI', sans-serif; margin: 0; direction: rtl; height: 100vh; overflow: hidden; padding: 15px; }
            .main-grid-container { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 48vh 46vh; gap: 15px; height: 100%; width: 100%; }
            .section-box { background: rgba(255, 255, 255, 0.95); padding: 15px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
            .section-box.full-width { grid-column: span 2; }
            .section-header { margin-bottom: 10px; font-weight: 800; font-size: 16px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; display:flex; justify-content:space-between; }
            .grid-scroll { overflow-y: auto; flex: 1; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
            .card { background: white; border: 1px solid #e1e4e8; border-radius: 10px; padding: 10px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; cursor: pointer; transition: 0.2s; }
            .card:hover { transform: translateY(-3px); border-color: #1877f2; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .card-icon { font-size: 32px; margin-bottom: 5px; }
            .card-title { font-size: 11px; font-weight: bold; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #444; }
            .badge { position: absolute; top: 4px; right: 4px; background: #f0f2f5; color: #1877f2; font-size: 9px; padding: 2px 5px; border-radius: 8px; font-weight:bold; }
            .tools-area { position: fixed; bottom: 20px; left: 20px; z-index: 1000; display: flex; gap: 8px; background: rgba(255, 255, 255, 0.85); padding: 8px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .tool-btn { background: #333; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
        `);

        const container = document.createElement('div');
        container.className = 'main-grid-container';

        function drawSection(type, title, color, isFullWidth = false) {
            const sec = document.createElement('div');
            sec.className = `section-box ${isFullWidth ? 'full-width' : ''}`;
            sec.innerHTML = `<div class="section-header" style="color:${color}"><span>${title}</span></div>`;
            const scroll = document.createElement('div'); scroll.className = 'grid-scroll';
            const grid = document.createElement('div'); grid.className = 'grid';

            const cats = db.sectionCats[type] || BASE_CATEGORIES;
            cats.forEach(cat => {
                const items = db.items.filter(i => i.type === type && i.category === cat);
                const card = document.createElement('div');
                card.className = 'card'; card.style.borderBottom = `3px solid ${color}`;
                card.innerHTML = `${items.length ? `<span class="badge">${items.length}</span>` : ''}<div class="card-icon">${getIcon(cat, db)}</div><div class="card-title">${cat}</div>`;
                card.onclick = () => alert(`تحتوي هذه الفئة على ${items.length} روابط مخزنة في متصفحك.`);
                grid.appendChild(card);
            });
            scroll.appendChild(grid); sec.appendChild(scroll); return sec;
        }

        container.appendChild(drawSection('expert_local', SECTION_TITLES['expert_local'], "#00b894"));
        container.appendChild(drawSection('expert_intl', SECTION_TITLES['expert_intl'], "#6c5ce7"));
        container.appendChild(drawSection('community', SECTION_TITLES['community'], "#1877f2", true));
        document.body.appendChild(container);

        // Tools
        const tools = document.createElement('div'); tools.className = 'tools-area';
        tools.innerHTML = `<button class="tool-btn" id="impBtn">⬆️ استيراد JSON</button><button class="tool-btn" id="expBtn">⬇️ تصدير JSON</button><button class="tool-btn" onclick="location.reload()">🔄 تحديث</button>`;
        document.body.appendChild(tools);

        document.getElementById('expBtn').onclick = () => {
            const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getFreshDB())); a.download = "nexus_backup.json"; a.click();
        };
        document.getElementById('impBtn').onclick = () => {
            const inp = document.createElement('input'); inp.type='file'; inp.onchange=(e)=>{
                const reader = new FileReader(); reader.onload=(ev)=>{ GM_setValue(DB_KEY, JSON.parse(ev.target.result)); location.reload(); };
                reader.readAsText(e.target.files[0]);
            }; inp.click();
        };
    }
})();
