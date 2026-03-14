# 🌌 OmniKnowledge Nexus (V6.6)
> **The Ultimate Local-First Knowledge Management System & Web Collector.**

OmniKnowledge Nexus is a powerful tool designed for researchers, OSINT analysts, and power users who need to capture knowledge from across the web into a organized, visual "Second Brain" without relying on cloud services.

## 🚀 Key Features
- **Smart Collector:** A persistent floating button on all websites (including YouTube & Facebook).
- **Anti-CSP Engine:** Custom-built to bypass modern security headers (Trusted Types) that block traditional scripts.
- **Persistence Core:** Atomic update logic ensures no data loss during imports or new entries.
- **Visual Dashboard:** An elegant, color-coded grid UI to manage your knowledge localy.
- **Privacy First:** All data is stored in your browser's local storage (Tampermonkey).

## 🛠️ Installation
1. Install **Tampermonkey** extension.
2. Enable **"Allow access to file URLs"** in Tampermonkey settings.
3. Create a new script and paste the `Pro_Knowledge_Grid.js` code.
4. Open your local `MyNetwork.html` file to access your dashboard.

## 🛡️ Technical Challenges Solved
This project successfully tackles the **Trusted Types violation** enforced by Google/YouTube, using a pure DOM-based injection method instead of `innerHTML`.

## 📄 License
This project is licensed under the MIT License.
