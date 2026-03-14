// ==UserScript==
// @name         OmniKnowledge Nexus (Stable V6.9 - Professional English)
// @namespace    http://tampermonkey.net/
// @version      6.9
// @description  The final professional edition: English UI, LTR direction, and Absolute YouTube Bypass.
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

    // [1] Absolute Bypass for Modern Browser Security (YouTube/GitHub)
    if (window.trustedTypes && window.trustedTypes.createPolicy && !window.trustedTypes.defaultPolicy) {
        window.trustedTypes.createPolicy('default', { createHTML: (s) => s });
    }

    const DB_KEY = 'knowledge_base_nexus_public'; 

    // Global Titles in English
    const SECTION_TITLES = {
        'community': '🌐 Community Hub',
        'expert_local': '📍 Local Experts',
        'expert_intl': '🌍 Global Analysis',
        'hashtag': '#️⃣ Trending Tags'
    };

    const BASE_CATEGORIES = ["General", "Work", "Research", "Media", "Tools", "Unclassified"];

    function getFreshDB() {
        let db = GM_getValue(DB_KEY, { items: [], sectionCats: null, customPlatforms: [], categoryIcons: {}, settings: {} });
        if (!db.sectionCats) {
            db.sectionCats = { 'community': [...BASE_CATEGORIES], 'expert_local': [...BASE_CATEGORIES], 'expert_intl': [...BASE_CATEGORIES], 'hashtag': [...BASE_CATEGORIES] };
        }
        return db;
    }

    const getIcon = (catName, db) => db.categoryIcons?.[catName] || "🔖";

    // Dashboard Recognition
    const isDashboard = window.location.href.includes('index.html') || 
                        window.location.href.includes('MyNetwork.html') || 
                        window.location.href.includes('vigilante0101.github.io/OmniKnowledge-Nexus');

    if (isDashboard) {
        setTimeout(renderNexusDashboard, 100);
    } else {
        initCollector();
    }

    // --- Core Safe Element Builder ---
    const create = (tag, style = {}, props = {}) => {
        const el = document.createElement(tag);
        Object.assign(el.style, style);
        Object.assign(el, props);
        return el;
    };

    // ==========================================
    // 1. Collector Logic (Capture Module)
    // ==========================================
    function initCollector() {
        if (document.getElementById('save-grid-btn')) return;
        const btn = create('button', {
            position: 'fixed', bottom: '30px', right: '30px', zIndex: '2147483647',
            width: '60px', height: '60px', borderRadius: '50%', background: '#1877f2',
            color: 'white', fontSize: '28px', border: '3px solid #fff', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'block'
        }, { id: 'save-grid-btn', textContent: '💾' });

        btn.onclick = (e) => { e.preventDefault(); openAddModal(); };
        document.body.appendChild(btn);
        new MutationObserver(() => { if (!document.getElementById('save-grid-btn')) document.body.appendChild(btn); }).observe(document.body, { childList: true });
    }

    function openAddModal() {
        if (document.getElementById('modal-overlay')) return;
        const currentTitle = document.title;
        const currentUrl = window.location.href;
        const overlay = create('div', { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: '2147483647', display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'ltr' }, { id: 'modal-overlay' });
        const card = create('div', { background: '#fff', padding: '25px', borderRadius: '16px', width: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontFamily: 'Segoe UI, sans-serif' });
        
        card.appendChild(create('h3', { textAlign: 'center', color: '#1877f2', marginTop: '0', marginBottom: '20px' }, { textContent: 'Add to Nexus' }));
        
        const typeSelect = create('select', { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' });
        Object.keys(SECTION_TITLES).forEach(k => typeSelect.add(new Option(SECTION_TITLES[k], k)));
        card.appendChild(typeSelect);

        const catSelect = create('select', { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' });
        card.appendChild(catSelect);

        const updateCats = () => {
            const db = getFreshDB(); catSelect.options.length = 0;
            (db.sectionCats[typeSelect.value] || BASE_CATEGORIES).forEach(c => catSelect.add(new Option(c, c)));
        };
        typeSelect.onchange = updateCats; updateCats();

        const saveBtn = create('button', { width: '100%', padding: '12px', background: '#1877f2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }, { textContent: '💾 Capture Now' });
        saveBtn.onclick = () => {
            let db = getFreshDB();
            db.items.push({ id: Date.now(), title: currentTitle, url: currentUrl, category: catSelect.value, type: typeSelect.value, date: new Date().toISOString() });
            GM_setValue(DB_KEY, db);
            saveBtn.textContent='✅ Saved!'; setTimeout(()=>overlay.remove(), 800);
        };
        card.appendChild(saveBtn); overlay.appendChild(card); document.body.appendChild(overlay);
        overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    }

    // ==========================================
    // 2. Dashboard Logic (The LTR Visualization)
    // ==========================================
    function renderNexusDashboard() {
        document.body.textContent = ''; // Deep clean for security bypass
        let db = getFreshDB();

        GM_addStyle(`
            body { background: #f0f2f5; font-family: 'Segoe UI', sans-serif; margin: 0; direction: ltr; height: 100vh; overflow: hidden; padding: 15px; }
            .main-grid-container { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 48vh 46vh; gap: 15px; height: 100%; width: 100%; }
            .section-box { background: rgba(255, 255, 255, 0.98); padding: 15px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
            .section-box.full-width { grid-column: span 2; }
            .section-header { margin-bottom: 12px; font-weight: 700; font-size: 18px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; color: #333; }
            .grid-scroll { overflow-y: auto; flex: 1; padding-right: 5px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
            .card { background: white; border: 1px solid #e1e4e8; border-radius: 12px; padding: 10px; height: 115px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; cursor: pointer; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .card:hover { transform: translateY(-5px); border-color: #1877f2; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
            .card-icon { font-size: 36px; margin-bottom: 8px; }
            .card-title { font-size: 12px; font-weight: 700; width: 95%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #444; }
            .badge { position: absolute; top: 8px; right: 8px; background: #e7f3ff; color: #1877f2; font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight:bold; }
            .tools-area { position: fixed; bottom: 25px; left: 25px; z-index: 1000; display: flex; gap: 10px; background: rgba(255, 255, 255, 0.95); padding: 10px; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #eee; }
            .tool-btn { background: #1a1a1a; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight:600; transition: 0.2s; }
            .tool-btn:hover { background: #1877f2; transform: translateY(-2px); }
            
            .nexus-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 5000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(3px); }
            .nexus-card { background: white; width: 580px; max-height: 80vh; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.4); border: 1px solid #eee; }
            .nexus-header { padding: 18px 25px; background: #fff; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: #1877f2; font-size: 18px; }
            .nexus-body { overflow-y: auto; flex: 1; padding: 15px; }
            .link-row { padding: 14px; border-radius: 10px; border-bottom: 1px solid #f8f8f8; display: flex; align-items: center; gap: 15px; transition: 0.2s; }
            .link-row:hover { background: #f0f7ff; }
            .link-text { flex: 1; text-decoration: none; color: #333; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .del-link { background: #fff1f0; border: 1px solid #ffccc7; color: #ff4d4f; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; }
        `);

        const container = create('div', {}, { className: 'main-grid-container' });

        function drawSection(type, title, color, isFull = false) {
            const sec = create('div', {}, { className: 'section-box' + (isFull ? ' full-width' : '') });
            sec.appendChild(create('div', { color: color, borderLeft: `4px solid ${color}`, paddingLeft: '10px' }, { className: 'section-header', textContent: title }));
            const scroll = create('div', {}, { className: 'grid-scroll' });
            const grid = create('div', {}, { className: 'grid' });

            (db.sectionCats[type] || BASE_CATEGORIES).forEach(cat => {
                const items = db.items.filter(i => i.type === type && i.category === cat);
                const card = create('div', { borderBottom: `3px solid ${color}` }, { className: 'card' });
                card.appendChild(create('span', {}, { className: 'badge', textContent: items.length }));
                card.appendChild(create('div', {}, { className: 'card-icon', textContent: getIcon(cat, db) }));
                card.appendChild(create('div', {}, { className: 'card-title', textContent: cat }));
                
                card.onclick = () => openFolder(cat, items);
                grid.appendChild(card);
            });
            scroll.appendChild(grid); sec.appendChild(scroll); return sec;
        }

        container.appendChild(drawSection('expert_local', SECTION_TITLES['expert_local'], "#00b894"));
        container.appendChild(drawSection('expert_intl', SECTION_TITLES['expert_intl'], "#6c5ce7"));
        container.appendChild(drawSection('community', SECTION_TITLES['community'], "#1877f2", true));
        document.body.appendChild(container);

        // Control Tools
        const tools = create('div', {}, { className: 'tools-area' });
        const imp = create('button', {}, { className: 'tool-btn', textContent: '⬆️ Import JSON' });
        const exp = create('button', {}, { className: 'tool-btn', textContent: '⬇️ Export Backup' });
        
        exp.onclick = () => { const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getFreshDB())); a.download = "nexus_vault.json"; a.click(); };
        imp.onclick = () => { const inp = document.createElement('input'); inp.type='file'; inp.onchange=(e)=>{ const r = new FileReader(); r.onload=(ev)=>{ GM_setValue(DB_KEY, JSON.parse(ev.target.result)); location.reload(); }; r.readAsText(e.target.files[0]); }; inp.click(); };
        
        tools.appendChild(imp); tools.appendChild(exp);
        document.body.appendChild(tools);
    }

    function openFolder(category, items) {
        const overlay = create('div', {}, { className: 'nexus-overlay' });
        const card = create('div', {}, { className: 'nexus-card' });
        const header = create('div', {}, { className: 'nexus-header' });
        header.appendChild(create('span', {}, { textContent: `📁 ${category} (${items.length} Entries)` }));
        const closeBtn = create('span', { cursor: 'pointer', fontSize: '24px', color: '#ccc' }, { textContent: '×' });
        closeBtn.onclick = () => overlay.remove();
        header.appendChild(closeBtn);
        
        const body = create('div', {}, { className: 'nexus-body' });
        if(items.length === 0) body.appendChild(create('div', { textAlign: 'center', padding: '40px', color: '#999' }, { textContent: 'Folder is empty' }));

        items.forEach(item => {
            const row = create('div', {}, { className: 'link-row' });
            row.appendChild(create('span', { fontSize: '18px' }, { textContent: '🔗' }));
            const link = create('a', {}, { className: 'link-text', href: item.url, target: '_blank', textContent: item.title || 'Untitled Source' });
            row.appendChild(link);
            const del = create('button', {}, { className: 'del-link', textContent: 'Delete' });
            del.onclick = () => {
                if(confirm('Delete this entry?')){
                    let db = getFreshDB(); db.items = db.items.filter(i => i.id !== item.id);
                    GM_setValue(DB_KEY, db); overlay.remove(); renderNexusDashboard();
                }
            };
            row.appendChild(del);
            body.appendChild(row);
        });

        card.appendChild(header); card.appendChild(body); overlay.appendChild(card);
        document.body.appendChild(overlay);
        overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    }
})();
