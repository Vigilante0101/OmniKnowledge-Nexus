// ==UserScript==
// @name         OmniKnowledge Nexus (Public Version)
// @namespace    http://tampermonkey.net/
// @version      6.6
// @description  Professional Knowledge Management System & Web Collector (Template Version)
// @author       You
// @match        *://*/*
// @match        file:///*MyNetwork.html*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Bypass YouTube Trusted Types
    if (window.trustedTypes && window.trustedTypes.createPolicy && !window.trustedTypes.defaultPolicy) {
        window.trustedTypes.createPolicy('default', { createHTML: (string) => string });
    }

    const DB_KEY = 'knowledge_base_nexus_public'; // اسم مختلف لقاعدة البيانات العامة

    const SECTION_TITLES = {
        'community': '🌐 Section 1',
        'expert_local': '📍 Section 2',
        'expert_intl': '🌍 Section 3',
        'hashtag': '#️⃣ Section 4'
    };

    // تصنيفات عامة جداً لا تكشف اهتماماتك
    const BASE_CATEGORIES = ["General", "Work", "Research", "Media", "Tools", "Unclassified"];

    function getFreshDB() {
        let db = GM_getValue(DB_KEY, { items: [], sectionCats: null, customPlatforms: [], categoryIcons: {}, settings: {} });
        if (!db.sectionCats) {
            db.sectionCats = { 'community': [...BASE_CATEGORIES], 'expert_local': [...BASE_CATEGORIES], 'expert_intl': [...BASE_CATEGORIES], 'hashtag': [...BASE_CATEGORIES] };
        }
        return db;
    }

    const getIcon = (catName, db) => db.categoryIcons[catName] || "🔖";

    if (window.location.href.includes('MyNetwork.html')) {
        setTimeout(initDashboard, 100);
    } else {
        initCollector();
    }

    // --- Collector Logic (Same logic, zero personal info) ---
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
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 2147483647; display: flex; justify-content: center; align-items: center; direction: ltr; font-family: sans-serif;`;

        const card = document.createElement('div');
        card.style.cssText = `background: #fff; padding: 25px; border-radius: 16px; width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);`;

        const h3 = document.createElement('h3'); h3.textContent = 'Add Source'; h3.style.cssText = 'text-align:center; color:#1877f2; margin-top:0;'; card.appendChild(h3);
        
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

        const saveBtn = document.createElement('button'); saveBtn.textContent='💾 Save Now'; saveBtn.style.cssText='width:100%; padding:12px; background:#1877f2; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;';
        saveBtn.onclick = () => {
            let latestDb = getFreshDB();
            latestDb.items.push({ id: Date.now(), title: currentTitle, url: currentUrl, category: catSelect.value, type: typeSelect.value, date: new Date().toISOString() });
            GM_setValue(DB_KEY, latestDb);
            saveBtn.textContent='✅ Saved!'; setTimeout(()=>overlay.remove(), 800);
        };

        card.appendChild(saveBtn); overlay.appendChild(card); document.body.appendChild(overlay);
    }

    function initDashboard() {
        document.body.innerHTML = '<h2 style="text-align:center; margin-top:50px;">Nexus Dashboard - Ready for Import</h2>';
        // Logic for drawing grid from DB...
    }
})();
