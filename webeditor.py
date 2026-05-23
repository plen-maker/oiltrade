#!/usr/bin/env python3
"""
OilTrade WebEditor v3.0
- HTML kód szerkesztő
- 8 profi sablon
- Firebase Hosting deploy
- Drag & drop fájl megnyitás
python3 webeditor.py
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
try:
    from tkinterdnd2 import TkinterDnD, DND_FILES
    _DND_AVAILABLE = True
except ImportError:
    _DND_AVAILABLE = False
import json, webbrowser, threading, urllib.request, urllib.parse, urllib.error, hashlib, os, tempfile

FIREBASE_API_KEY    = "AIzaSyD4syP6lOeg5JZCnTct4X_NoAhZN4TiDH4"
FIREBASE_PROJECT_ID = "oiltrade-3"
CI_TOKEN            = "1//03KxLNC41JP6ACgYIARAAGAMSNwF-L9IrAfe01T5NPuiKrxpVJzlbJbVEzE7WhQe1s_OevdOADAsgM8wH_R-g1ssLPLoA2jXO6R0"
HOSTING_URL         = f"https://{FIREBASE_PROJECT_ID}.web.app"

BG="#0d1117"; BG2="#161b22"; BG3="#21262d"; BG4="#2d333b"
ACCENT="#58a6ff"; GREEN="#3fb950"; RED="#f85149"; ORANGE="#f0883e"
TEXT="#e6edf3"; TEXT2="#8b949e"; TEXT3="#52525b"; BORDER="#30363d"

# ── TEMPLATES ─────────────────────────────────────────────────────────────────
TEMPLATES = {
    "🛒 Webshop": """<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Webshop</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #111; }
nav { background: #111; padding: 0 40px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
nav .logo { color: #fff; font-size: 22px; font-weight: 900; letter-spacing: -.5px; }
nav .cart { background: #6366f1; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 14px; }
.hero { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 80px 40px; text-align: center; }
.hero h1 { color: #fff; font-size: 52px; font-weight: 900; margin-bottom: 16px; }
.hero p { color: rgba(255,255,255,0.8); font-size: 20px; margin-bottom: 32px; }
.hero button { background: #fff; color: #6366f1; border: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; }
.products { max-width: 1200px; margin: 60px auto; padding: 0 20px; }
.products h2 { font-size: 32px; font-weight: 900; margin-bottom: 32px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
.card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,.06); transition: transform .2s, box-shadow .2s; }
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,.12); }
.card-img { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); height: 200px; display: flex; align-items: center; justify-content: center; font-size: 64px; }
.card-body { padding: 20px; }
.card-name { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
.card-desc { color: #6b7280; font-size: 13px; margin-bottom: 16px; }
.card-footer { display: flex; align-items: center; justify-content: space-between; }
.price { font-size: 22px; font-weight: 900; color: #6366f1; }
.add-btn { background: #6366f1; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 700; transition: background .2s; }
.add-btn:hover { background: #4f46e5; }
.badge { background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
footer { background: #111; color: #6b7280; text-align: center; padding: 40px; margin-top: 80px; }
</style>
</head>
<body>
<nav>
  <div class="logo">⬡ ShopName</div>
  <button class="cart">🛒 Kosár (0)</button>
</nav>
<div class="hero">
  <h1>Üdvözlünk!</h1>
  <p>A legjobb termékek egy helyen</p>
  <button>Vásárolj most →</button>
</div>
<div class="products">
  <h2>Kiemelt termékek</h2>
  <div class="grid">
    <div class="card">
      <div class="card-img">📦</div>
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div class="card-name">Termék neve</div>
          <span class="badge">ÚJ</span>
        </div>
        <div class="card-desc">Rövid termék leírás ide kerül.</div>
        <div class="card-footer">
          <div class="price">4 990 Ft</div>
          <button class="add-btn">Kosárba</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-img">🎁</div>
      <div class="card-body">
        <div class="card-name" style="margin-bottom:8px">Másik termék</div>
        <div class="card-desc">Leírás a termékről pár sorban.</div>
        <div class="card-footer">
          <div class="price">8 990 Ft</div>
          <button class="add-btn">Kosárba</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-img">⭐</div>
      <div class="card-body">
        <div class="card-name" style="margin-bottom:8px">Prémium csomag</div>
        <div class="card-desc">A legjobb választás.</div>
        <div class="card-footer">
          <div class="price">24 990 Ft</div>
          <button class="add-btn">Kosárba</button>
        </div>
      </div>
    </div>
  </div>
</div>
<footer>© 2025 ShopName · Minden jog fenntartva</footer>
</body>
</html>""",

    "🏢 Cég oldal": """<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cég neve</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; color: #111; }
nav { padding: 0 60px; height: 70px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; background: #fff; position: sticky; top: 0; z-index: 100; }
.logo { font-size: 22px; font-weight: 900; color: #111; }
.nav-links { display: flex; gap: 32px; }
.nav-links a { color: #6b7280; text-decoration: none; font-size: 15px; font-weight: 500; }
.nav-links a:hover { color: #111; }
.cta-btn { background: #111; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.hero { background: #f9fafb; padding: 100px 60px; display: flex; align-items: center; gap: 60px; }
.hero-text { flex: 1; }
.hero-tag { background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 16px; }
.hero h1 { font-size: 56px; font-weight: 900; line-height: 1.1; margin-bottom: 20px; }
.hero p { color: #6b7280; font-size: 18px; line-height: 1.7; margin-bottom: 32px; }
.btn-group { display: flex; gap: 12px; }
.btn-primary { background: #111; color: #fff; border: none; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
.btn-secondary { background: transparent; color: #111; border: 2px solid #e5e7eb; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
.hero-img { flex: 1; background: linear-gradient(135deg, #dbeafe, #e0e7ff); height: 400px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 80px; }
.stats { padding: 60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; background: #111; }
.stat { text-align: center; }
.stat-num { font-size: 42px; font-weight: 900; color: #fff; }
.stat-label { color: #9ca3af; margin-top: 4px; }
.services { padding: 80px 60px; }
.services h2 { font-size: 40px; font-weight: 900; text-align: center; margin-bottom: 48px; }
.service-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.service-card { padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; }
.service-icon { font-size: 36px; margin-bottom: 16px; }
.service-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
.service-card p { color: #6b7280; line-height: 1.6; }
.contact { background: #f9fafb; padding: 80px 60px; text-align: center; }
.contact h2 { font-size: 40px; font-weight: 900; margin-bottom: 12px; }
.contact p { color: #6b7280; font-size: 18px; margin-bottom: 32px; }
footer { background: #111; color: #9ca3af; text-align: center; padding: 32px; }
</style>
</head>
<body>
<nav>
  <div class="logo">CégNév</div>
  <div class="nav-links">
    <a href="#">Főoldal</a>
    <a href="#">Szolgáltatások</a>
    <a href="#">Rólunk</a>
    <a href="#">Kapcsolat</a>
  </div>
  <button class="cta-btn">Ajánlatkérés</button>
</nav>
<div class="hero">
  <div class="hero-text">
    <span class="hero-tag">✦ Megbízható partner</span>
    <h1>Professzionális megoldások vállalkozásod számára</h1>
    <p>Több mint 10 éve segítjük ügyfeleinket sikerük elérésében innovatív és megbízható szolgáltatásainkkal.</p>
    <div class="btn-group">
      <button class="btn-primary">Kapcsolatfelvétel →</button>
      <button class="btn-secondary">Szolgáltatásaink</button>
    </div>
  </div>
  <div class="hero-img">🏢</div>
</div>
<div class="stats">
  <div class="stat"><div class="stat-num">500+</div><div class="stat-label">Elégedett ügyfél</div></div>
  <div class="stat"><div class="stat-num">10+</div><div class="stat-label">Év tapasztalat</div></div>
  <div class="stat"><div class="stat-num">99%</div><div class="stat-label">Elégedettség</div></div>
  <div class="stat"><div class="stat-num">24/7</div><div class="stat-label">Ügyfélszolgálat</div></div>
</div>
<div class="services">
  <h2>Szolgáltatásaink</h2>
  <div class="service-grid">
    <div class="service-card"><div class="service-icon">🚀</div><h3>Gyors kiszolgálás</h3><p>Rövid határidőkkel és profi csapattal teljesítjük megrendeléseit.</p></div>
    <div class="service-card"><div class="service-icon">🔒</div><h3>Megbízhatóság</h3><p>Hosszú évek tapasztalatával garantáljuk a minőséget.</p></div>
    <div class="service-card"><div class="service-icon">💡</div><h3>Innováció</h3><p>Modern megoldásokkal segítjük vállalkozása növekedését.</p></div>
  </div>
</div>
<div class="contact">
  <h2>Lépj velünk kapcsolatba!</h2>
  <p>Kérdésed van? Örömmel segítünk!</p>
  <button class="btn-primary" style="font-size:16px;padding:16px 40px">Kapcsolatfelvétel →</button>
</div>
<footer>© 2025 CégNév · Minden jog fenntartva</footer>
</body>
</html>""",

    "💼 Portfolio": """<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; }
nav { padding: 24px 60px; display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 20px; font-weight: 900; }
.nav-links a { color: #9ca3af; text-decoration: none; margin-left: 32px; font-size: 14px; }
.hero { padding: 120px 60px 80px; max-width: 900px; }
.hero-tag { color: #6366f1; font-size: 14px; font-weight: 700; margin-bottom: 20px; letter-spacing: .1em; }
.hero h1 { font-size: 72px; font-weight: 900; line-height: 1.05; margin-bottom: 24px; }
.hero h1 span { background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero p { color: #9ca3af; font-size: 20px; line-height: 1.6; margin-bottom: 40px; max-width: 600px; }
.btn-group { display: flex; gap: 16px; }
.btn-primary { background: #6366f1; color: #fff; border: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
.btn-ghost { background: transparent; color: #fff; border: 1px solid #333; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; }
.works { padding: 80px 60px; }
.works h2 { font-size: 36px; font-weight: 900; margin-bottom: 40px; color: #fff; }
.work-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.work-card { border-radius: 16px; overflow: hidden; background: #111; border: 1px solid #222; transition: transform .2s; cursor: pointer; }
.work-card:hover { transform: scale(1.02); }
.work-img { height: 220px; display: flex; align-items: center; justify-content: center; font-size: 60px; }
.work-img.c1 { background: linear-gradient(135deg, #1e1b4b, #312e81); }
.work-img.c2 { background: linear-gradient(135deg, #1a1a2e, #16213e); }
.work-img.c3 { background: linear-gradient(135deg, #0f0c29, #302b63); }
.work-body { padding: 20px; }
.work-tag { color: #6366f1; font-size: 11px; font-weight: 700; letter-spacing: .1em; margin-bottom: 8px; }
.work-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.work-desc { color: #9ca3af; font-size: 13px; }
.skills { padding: 60px; background: #111; }
.skills h2 { font-size: 32px; font-weight: 900; margin-bottom: 32px; }
.skill-tags { display: flex; flex-wrap: wrap; gap: 10px; }
.skill-tag { background: #1c1c1e; border: 1px solid #333; color: #e5e7eb; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; }
.contact { padding: 100px 60px; text-align: center; }
.contact h2 { font-size: 48px; font-weight: 900; margin-bottom: 16px; }
.contact p { color: #9ca3af; font-size: 18px; margin-bottom: 40px; }
footer { text-align: center; padding: 32px; color: #6b7280; border-top: 1px solid #1c1c1e; }
</style>
</head>
<body>
<nav>
  <div class="logo">◆ Név</div>
  <div><a href="#">Munkák</a><a href="#">Rólam</a><a href="#">Kapcsolat</a></div>
</nav>
<div class="hero">
  <div class="hero-tag">DESIGNER & FEJLESZTŐ</div>
  <h1>Szia, én vagyok<br><span>Neved</span></h1>
  <p>Digitális élményeket tervezek és fejlesztek. Szeretem a szép, funkcionális és felhasználóbarát megoldásokat.</p>
  <div class="btn-group">
    <button class="btn-primary">Munkáim →</button>
    <button class="btn-ghost">Kapcsolat</button>
  </div>
</div>
<div class="works">
  <h2>Munkáim</h2>
  <div class="work-grid">
    <div class="work-card"><div class="work-img c1">🚀</div><div class="work-body"><div class="work-tag">WEB DESIGN</div><div class="work-title">Projekt neve</div><div class="work-desc">Rövid leírás a projektről.</div></div></div>
    <div class="work-card"><div class="work-img c2">📱</div><div class="work-body"><div class="work-tag">MOBILE APP</div><div class="work-title">App neve</div><div class="work-desc">Mobil alkalmazás fejlesztés.</div></div></div>
    <div class="work-card"><div class="work-img c3">💡</div><div class="work-body"><div class="work-tag">BRANDING</div><div class="work-title">Brand projekt</div><div class="work-desc">Vizuális identitás tervezés.</div></div></div>
  </div>
</div>
<div class="skills">
  <h2>Skillsek</h2>
  <div class="skill-tags">
    <span class="skill-tag">HTML / CSS</span><span class="skill-tag">JavaScript</span><span class="skill-tag">React</span>
    <span class="skill-tag">Figma</span><span class="skill-tag">Node.js</span><span class="skill-tag">Python</span>
    <span class="skill-tag">UI/UX Design</span><span class="skill-tag">Firebase</span>
  </div>
</div>
<div class="contact">
  <h2>Dolgozzunk együtt!</h2>
  <p>Van egy ötleted? Vedd fel velem a kapcsolatot.</p>
  <button class="btn-primary" style="font-size:16px;padding:16px 40px">email@example.com →</button>
</div>
<footer>© 2025 Neved · Minden jog fenntartva</footer>
</body>
</html>""",

    "🚀 Landing Page": """<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Landing Page</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #050508; color: #fff; }
nav { padding: 20px 60px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,.08); }
.logo { font-size: 20px; font-weight: 900; }
.nav-cta { background: #7c3aed; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 700; }
.hero { padding: 120px 40px 80px; text-align: center; position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,.3), transparent 70%); }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(124,58,237,.2); border: 1px solid rgba(124,58,237,.4); color: #a78bfa; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
.hero h1 { font-size: 72px; font-weight: 900; line-height: 1.05; margin-bottom: 20px; letter-spacing: -2px; }
.hero h1 em { font-style: normal; background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero p { color: #9ca3af; font-size: 20px; max-width: 580px; margin: 0 auto 40px; line-height: 1.6; }
.hero-btns { display: flex; gap: 12px; justify-content: center; }
.btn-main { background: #7c3aed; color: #fff; border: none; padding: 16px 36px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; }
.btn-outline { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.2); padding: 16px 36px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
.features { padding: 80px 60px; }
.features h2 { text-align: center; font-size: 40px; font-weight: 900; margin-bottom: 48px; }
.feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.feat-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 28px; }
.feat-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(124,58,237,.2); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
.feat-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
.feat-card p { color: #9ca3af; font-size: 14px; line-height: 1.6; }
.pricing { padding: 80px 60px; text-align: center; }
.pricing h2 { font-size: 40px; font-weight: 900; margin-bottom: 48px; }
.price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }
.price-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 32px; }
.price-card.featured { background: #7c3aed; border-color: #7c3aed; }
.price-label { font-size: 12px; font-weight: 700; letter-spacing: .1em; color: #9ca3af; margin-bottom: 12px; }
.price-card.featured .price-label { color: rgba(255,255,255,.7); }
.price-amount { font-size: 48px; font-weight: 900; margin-bottom: 4px; }
.price-period { color: #9ca3af; font-size: 14px; margin-bottom: 24px; }
.price-btn { width: 100%; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; background: rgba(255,255,255,.1); color: #fff; }
.price-card.featured .price-btn { background: #fff; color: #7c3aed; }
.cta { padding: 100px 40px; text-align: center; background: linear-gradient(135deg, rgba(124,58,237,.2), rgba(236,72,153,.1)); }
.cta h2 { font-size: 48px; font-weight: 900; margin-bottom: 16px; }
.cta p { color: #9ca3af; font-size: 18px; margin-bottom: 36px; }
footer { text-align: center; padding: 32px; color: #6b7280; border-top: 1px solid rgba(255,255,255,.06); }
</style>
</head>
<body>
<nav>
  <div class="logo">◆ StartupNév</div>
  <button class="nav-cta">Kezdés — Ingyenes</button>
</nav>
<div class="hero">
  <div class="hero-badge">✦ Új verzió elérhető</div>
  <h1>A termék ami<br><em>megváltoztatja</em><br>az életedet</h1>
  <p>Egyszerű, gyors, hatékony. Több ezer felhasználó már próbálta és imádja.</p>
  <div class="hero-btns">
    <button class="btn-main">Kezdés ingyen →</button>
    <button class="btn-outline">▶ Demo megtekintése</button>
  </div>
</div>
<div class="features">
  <h2>Miért válassz minket?</h2>
  <div class="feat-grid">
    <div class="feat-card"><div class="feat-icon">⚡</div><h3>Villámgyors</h3><p>Másodpercek alatt eredményt kapsz, nem kell órákat várni.</p></div>
    <div class="feat-card"><div class="feat-icon">🔒</div><h3>Biztonságos</h3><p>Banki szintű titkosítás, adataid mindig védve vannak.</p></div>
    <div class="feat-card"><div class="feat-icon">🎯</div><h3>Pontos</h3><p>AI alapú technológia, ami tanul és fejlődik veled.</p></div>
  </div>
</div>
<div class="pricing">
  <h2>Áraink</h2>
  <div class="price-grid">
    <div class="price-card"><div class="price-label">ALAP</div><div class="price-amount">0 Ft</div><div class="price-period">örökre ingyenes</div><button class="price-btn">Kezdés →</button></div>
    <div class="price-card featured"><div class="price-label">PRO</div><div class="price-amount">4 990 Ft</div><div class="price-period">havonta</div><button class="price-btn">Kipróbálom →</button></div>
    <div class="price-card"><div class="price-label">VÁLLALATI</div><div class="price-amount">Egyedi</div><div class="price-period">ajánlat</div><button class="price-btn">Kapcsolat →</button></div>
  </div>
</div>
<div class="cta">
  <h2>Készen állsz?</h2>
  <p>Csatlakozz a több ezer elégedett felhasználóhoz még ma!</p>
  <button class="btn-main" style="font-size:17px;padding:18px 48px">Ingyenes regisztráció →</button>
</div>
<footer>© 2025 StartupNév · Adatvédelem · ÁSZF</footer>
</body>
</html>""",

    "📝 Blog": """<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #fff; color: #111; }
nav { padding: 0 60px; height: 64px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; }
.logo { font-size: 22px; font-weight: 900; font-family: 'Merriweather', serif; }
.nav-links a { color: #6b7280; text-decoration: none; margin-left: 28px; font-size: 14px; font-weight: 500; }
.hero { padding: 80px 60px 60px; border-bottom: 1px solid #e5e7eb; }
.hero-label { color: #6366f1; font-size: 12px; font-weight: 700; letter-spacing: .1em; margin-bottom: 16px; }
.hero h1 { font-size: 52px; font-weight: 900; font-family: 'Merriweather', serif; line-height: 1.15; max-width: 800px; margin-bottom: 20px; }
.hero-meta { color: #9ca3af; font-size: 14px; }
.hero-meta span { color: #6366f1; font-weight: 600; }
.content { max-width: 1100px; margin: 0 auto; padding: 60px 20px; display: grid; grid-template-columns: 2fr 1fr; gap: 60px; }
.posts h2 { font-size: 24px; font-weight: 900; margin-bottom: 32px; border-bottom: 2px solid #111; padding-bottom: 12px; }
.post { display: flex; gap: 20px; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb; }
.post-img { width: 120px; height: 90px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 32px; }
.post-img.c1 { background: #e0e7ff; }
.post-img.c2 { background: #fce7f3; }
.post-img.c3 { background: #d1fae5; }
.post-tag { color: #6366f1; font-size: 11px; font-weight: 700; letter-spacing: .08em; margin-bottom: 6px; }
.post-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; font-family: 'Merriweather', serif; line-height: 1.3; }
.post-title a { color: #111; text-decoration: none; }
.post-title a:hover { color: #6366f1; }
.post-meta { color: #9ca3af; font-size: 12px; }
.sidebar h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.sidebar-widget { margin-bottom: 40px; }
.topic-list { list-style: none; }
.topic-list li { padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
.topic-list a { color: #374151; text-decoration: none; font-size: 14px; font-weight: 500; }
.count { color: #9ca3af; font-size: 13px; }
.subscribe { background: #f9fafb; border-radius: 12px; padding: 24px; }
.subscribe h3 { margin-bottom: 8px; }
.subscribe p { color: #6b7280; font-size: 13px; margin-bottom: 16px; }
.subscribe input { width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; margin-bottom: 10px; }
.subscribe button { width: 100%; background: #111; color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; }
footer { background: #111; color: #9ca3af; text-align: center; padding: 40px; margin-top: 40px; }
</style>
</head>
<body>
<nav>
  <div class="logo">Blog neve</div>
  <div><a href="#">Főoldal</a><a href="#">Kategóriák</a><a href="#">Rólam</a><a href="#">Kapcsolat</a></div>
</nav>
<div class="hero">
  <div class="hero-label">KIEMELT CIKK</div>
  <h1>A legjobb módszerek a produktivitás növelésére 2025-ben</h1>
  <div class="hero-meta">Szerző: <span>Neved</span> · 2025. január 15. · 8 perc olvasás</div>
</div>
<div class="content">
  <div class="posts">
    <h2>Legújabb cikkek</h2>
    <div class="post">
      <div class="post-img c1">📚</div>
      <div><div class="post-tag">TECHNOLÓGIA</div><div class="post-title"><a href="#">Hogyan használd a mesterséges intelligenciát a munkában?</a></div><div class="post-meta">2025. jan. 20. · 6 perc</div></div>
    </div>
    <div class="post">
      <div class="post-img c2">💡</div>
      <div><div class="post-tag">ÉLETMÓD</div><div class="post-title"><a href="#">5 szokás, amivel megváltoztathatod az életedet</a></div><div class="post-meta">2025. jan. 18. · 4 perc</div></div>
    </div>
    <div class="post">
      <div class="post-img c3">🌍</div>
      <div><div class="post-tag">UTAZÁS</div><div class="post-title"><a href="#">A legjobb európai városok 2025-ben</a></div><div class="post-meta">2025. jan. 15. · 7 perc</div></div>
    </div>
  </div>
  <div class="sidebar">
    <div class="sidebar-widget">
      <h3>Kategóriák</h3>
      <ul class="topic-list">
        <li><a href="#">Technológia</a><span class="count">24</span></li>
        <li><a href="#">Életmód</a><span class="count">18</span></li>
        <li><a href="#">Utazás</a><span class="count">12</span></li>
        <li><a href="#">Pénzügy</a><span class="count">9</span></li>
      </ul>
    </div>
    <div class="subscribe">
      <h3>Feliratkozás</h3>
      <p>Értesülj elsőként az új cikkekről!</p>
      <input type="email" placeholder="Email cím...">
      <button>Feliratkozom →</button>
    </div>
  </div>
</div>
<footer>© 2025 Blog neve · Minden jog fenntartva</footer>
</body>
</html>""",

    "🍽️ Étterem": """<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Étterem</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #faf8f5; color: #1a0a00; }
nav { padding: 0 60px; height: 72px; display: flex; align-items: center; justify-content: space-between; background: #1a0a00; }
.logo { color: #f5deb3; font-family: 'Playfair Display', serif; font-size: 24px; }
.nav-links a { color: #a87c5a; text-decoration: none; margin-left: 32px; font-size: 14px; }
.nav-cta { background: #c8960c; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-weight: 700; }
.hero { height: 600px; background: linear-gradient(rgba(26,10,0,.6), rgba(26,10,0,.4)), linear-gradient(135deg, #7c2d12, #1a0a00); display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px; }
.hero-inner { max-width: 700px; }
.hero-tag { color: #f59e0b; font-size: 12px; font-weight: 700; letter-spacing: .15em; margin-bottom: 20px; }
.hero h1 { font-family: 'Playfair Display', serif; font-size: 72px; color: #faf8f5; line-height: 1.05; margin-bottom: 20px; }
.hero p { color: rgba(250,248,245,.7); font-size: 18px; margin-bottom: 36px; }
.hero-btns { display: flex; gap: 16px; justify-content: center; }
.btn-gold { background: #c8960c; color: #fff; border: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; }
.btn-outline { background: transparent; color: #faf8f5; border: 1px solid rgba(250,248,245,.4); padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
.menu { padding: 80px 60px; }
.section-tag { color: #c8960c; font-size: 12px; font-weight: 700; letter-spacing: .12em; margin-bottom: 8px; }
.menu h2 { font-family: 'Playfair Display', serif; font-size: 44px; margin-bottom: 48px; }
.menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
.menu-card { background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e7d5c0; }
.menu-img { height: 180px; display: flex; align-items: center; justify-content: center; font-size: 56px; }
.menu-img.m1 { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.menu-img.m2 { background: linear-gradient(135deg, #fee2e2, #fecaca); }
.menu-img.m3 { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
.menu-body { padding: 20px; }
.menu-name { font-size: 18px; font-weight: 700; font-family: 'Playfair Display', serif; margin-bottom: 6px; }
.menu-desc { color: #6b5a4e; font-size: 13px; margin-bottom: 14px; line-height: 1.5; }
.menu-footer { display: flex; justify-content: space-between; align-items: center; }
.menu-price { font-size: 20px; font-weight: 900; color: #c8960c; }
.menu-tag2 { background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
.reserve { background: #1a0a00; padding: 80px 60px; text-align: center; }
.reserve h2 { font-family: 'Playfair Display', serif; font-size: 44px; color: #faf8f5; margin-bottom: 12px; }
.reserve p { color: #a87c5a; font-size: 18px; margin-bottom: 36px; }
.reserve-form { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.reserve-form input { padding: 14px 20px; border: 1px solid #333; background: #111; color: #fff; border-radius: 8px; font-size: 14px; width: 200px; }
footer { background: #0a0500; color: #6b5a4e; text-align: center; padding: 40px; }
</style>
</head>
<body>
<nav>
  <div class="logo">La Bella</div>
  <div><a href="#">Menü</a><a href="#">Rólunk</a><a href="#">Foglalás</a></div>
  <button class="nav-cta">Asztalfoglalás</button>
</nav>
<div class="hero">
  <div class="hero-inner">
    <div class="hero-tag">FRISS ALAPANYAGOK · SZERETETTEL KÉSZÍTVE</div>
    <h1>Ízek, amelyek elkísérnek</h1>
    <p>Autentikus olasz konyha, modern értelmezésben. Minden nap friss, helyi alapanyagokból.</p>
    <div class="hero-btns">
      <button class="btn-gold">Menü megtekintése →</button>
      <button class="btn-outline">Asztalfoglalás</button>
    </div>
  </div>
</div>
<div class="menu">
  <div class="section-tag">KÜLÖNLEGESSÉGEINK</div>
  <h2>A séf ajánlata</h2>
  <div class="menu-grid">
    <div class="menu-card"><div class="menu-img m1">🍝</div><div class="menu-body"><div class="menu-name">Carbonara</div><div class="menu-desc">Házi tészta, pancetta, tojás, parmezán</div><div class="menu-footer"><div class="menu-price">3 200 Ft</div><span class="menu-tag2">SÉFAJÁNLÓ</span></div></div></div>
    <div class="menu-card"><div class="menu-img m2">🍕</div><div class="menu-body"><div class="menu-name">Margherita Pizza</div><div class="menu-desc">Paradicsom, mozzarella, bazsalikom</div><div class="menu-footer"><div class="menu-price">2 800 Ft</div></div></div></div>
    <div class="menu-card"><div class="menu-img m3">🥗</div><div class="menu-body"><div class="menu-name">Caprese saláta</div><div class="menu-desc">Bivaly mozzarella, paradicsom, pestó</div><div class="menu-footer"><div class="menu-price">1 900 Ft</div><span class="menu-tag2">VEGÁN</span></div></div></div>
  </div>
</div>
<div class="reserve">
  <h2>Foglalj asztalt</h2>
  <p>Online foglalás egyszerűen, percek alatt</p>
  <div class="reserve-form">
    <input type="text" placeholder="Neved">
    <input type="date">
    <input type="time">
    <button class="btn-gold" style="padding:14px 28px">Foglalás →</button>
  </div>
</div>
<footer>© 2025 La Bella · H-V: 12:00-22:00 · +36 1 234 5678</footer>
</body>
</html>""",

    "📧 Kapcsolat oldal": """<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kapcsolat</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #f9fafb; color: #111; min-height: 100vh; }
nav { background: #fff; padding: 0 60px; height: 64px; display: flex; align-items: center; border-bottom: 1px solid #e5e7eb; }
.logo { font-size: 20px; font-weight: 900; }
.main { max-width: 1100px; margin: 60px auto; padding: 0 20px; display: grid; grid-template-columns: 1fr 1.4fr; gap: 60px; align-items: start; }
.info h1 { font-size: 44px; font-weight: 900; margin-bottom: 16px; }
.info p { color: #6b7280; font-size: 17px; line-height: 1.7; margin-bottom: 40px; }
.contact-items { display: flex; flex-direction: column; gap: 20px; }
.contact-item { display: flex; gap: 16px; align-items: flex-start; }
.contact-icon { width: 48px; height: 48px; border-radius: 12px; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.contact-label { font-size: 12px; font-weight: 700; color: #9ca3af; letter-spacing: .08em; margin-bottom: 2px; }
.contact-value { font-size: 15px; font-weight: 600; color: #111; }
.form-card { background: #fff; border-radius: 20px; padding: 40px; box-shadow: 0 4px 40px rgba(0,0,0,.06); }
.form-card h2 { font-size: 26px; font-weight: 900; margin-bottom: 28px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-group { margin-bottom: 16px; }
label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
input, textarea, select { width: 100%; padding: 12px 16px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: border-color .2s; }
input:focus, textarea:focus { border-color: #6366f1; }
textarea { min-height: 120px; resize: vertical; }
.submit-btn { width: 100%; background: #111; color: #fff; border: none; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; }
.submit-btn:hover { background: #333; }
footer { text-align: center; padding: 40px; color: #9ca3af; margin-top: 60px; }
</style>
</head>
<body>
<nav><div class="logo">CégNév</div></nav>
<div class="main">
  <div class="info">
    <h1>Lépj velünk kapcsolatba!</h1>
    <p>Kérdésed van? Örömmel segítünk! Töltsd ki az űrlapot és 24 órán belül visszajelzünk.</p>
    <div class="contact-items">
      <div class="contact-item"><div class="contact-icon">📧</div><div><div class="contact-label">EMAIL</div><div class="contact-value">info@cegnev.hu</div></div></div>
      <div class="contact-item"><div class="contact-icon">📞</div><div><div class="contact-label">TELEFON</div><div class="contact-value">+36 1 234 5678</div></div></div>
      <div class="contact-item"><div class="contact-icon">📍</div><div><div class="contact-label">CÍM</div><div class="contact-value">1051 Budapest, Váci utca 1.</div></div></div>
      <div class="contact-item"><div class="contact-icon">🕐</div><div><div class="contact-label">NYITVATARTÁS</div><div class="contact-value">H-P: 9:00-17:00</div></div></div>
    </div>
  </div>
  <div class="form-card">
    <h2>Küldj üzenetet</h2>
    <div class="form-row">
      <div class="form-group"><label>Keresztnév</label><input type="text" placeholder="János"></div>
      <div class="form-group"><label>Vezetéknév</label><input type="text" placeholder="Kovács"></div>
    </div>
    <div class="form-group"><label>Email cím</label><input type="email" placeholder="janos@email.hu"></div>
    <div class="form-group"><label>Tárgy</label><select><option>Általános kérdés</option><option>Ajánlatkérés</option><option>Technikai segítség</option><option>Egyéb</option></select></div>
    <div class="form-group"><label>Üzenet</label><textarea placeholder="Írd le kérdésedet..."></textarea></div>
    <button class="submit-btn" onclick="alert('Köszönjük! Hamarosan visszajelzünk.')">Üzenet küldése →</button>
  </div>
</div>
<footer>© 2025 CégNév · Minden jog fenntartva</footer>
</body>
</html>""",

    "📊 Dashboard": """<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #0f0f12; color: #fff; display: flex; min-height: 100vh; }
.sidebar { width: 240px; background: #18181b; border-right: 1px solid #27272a; padding: 24px 16px; flex-shrink: 0; }
.sidebar-logo { font-size: 18px; font-weight: 900; padding: 8px 12px; margin-bottom: 32px; display: flex; align-items: center; gap: 8px; }
.sidebar-logo span { color: #6366f1; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #9ca3af; font-size: 14px; font-weight: 500; cursor: pointer; margin-bottom: 4px; }
.nav-item:hover { background: #27272a; color: #fff; }
.nav-item.active { background: #1e1b4b; color: #818cf8; }
.nav-section { font-size: 11px; font-weight: 700; color: #6b7280; letter-spacing: .08em; padding: 16px 12px 6px; }
.main { flex: 1; overflow: auto; }
.topbar { padding: 20px 32px; border-bottom: 1px solid #27272a; display: flex; justify-content: space-between; align-items: center; background: #18181b; }
.topbar h1 { font-size: 20px; font-weight: 700; }
.topbar-right { display: flex; align-items: center; gap: 16px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; cursor: pointer; }
.content { padding: 32px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.stat-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; }
.stat-label { font-size: 13px; color: #9ca3af; margin-bottom: 8px; }
.stat-value { font-size: 32px; font-weight: 900; margin-bottom: 4px; }
.stat-change { font-size: 13px; }
.stat-change.up { color: #22c55e; }
.stat-change.down { color: #ef4444; }
.grid-2 { display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px; margin-bottom: 16px; }
.card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; }
.card-title { font-size: 15px; font-weight: 700; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.chart { height: 160px; display: flex; align-items: flex-end; gap: 8px; padding-bottom: 8px; }
.bar { flex: 1; border-radius: 4px 4px 0 0; transition: opacity .2s; cursor: pointer; }
.bar:hover { opacity: .8; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; padding: 0 0 12px; letter-spacing: .05em; }
td { padding: 12px 0; border-top: 1px solid #27272a; font-size: 14px; vertical-align: middle; }
.status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status.paid { background: rgba(34,197,94,.15); color: #22c55e; }
.status.pending { background: rgba(234,179,8,.15); color: #eab308; }
.status.failed { background: rgba(239,68,68,.15); color: #ef4444; }
</style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-logo"><span>◆</span> Dashboard</div>
  <div class="nav-section">FŐMENÜ</div>
  <div class="nav-item active">📊 Áttekintés</div>
  <div class="nav-item">📦 Rendelések</div>
  <div class="nav-item">👥 Ügyfelek</div>
  <div class="nav-item">🛍️ Termékek</div>
  <div class="nav-section">ELEMZÉS</div>
  <div class="nav-item">📈 Statisztikák</div>
  <div class="nav-item">💰 Pénzügy</div>
  <div class="nav-section">EGYÉB</div>
  <div class="nav-item">⚙️ Beállítások</div>
  <div class="nav-item">🔔 Értesítések</div>
</div>
<div class="main">
  <div class="topbar">
    <h1>Áttekintés</h1>
    <div class="topbar-right">
      <span style="color:#9ca3af;font-size:14px">2025. január</span>
      <div class="avatar">A</div>
    </div>
  </div>
  <div class="content">
    <div class="stats">
      <div class="stat-card"><div class="stat-label">Bevétel</div><div class="stat-value" style="color:#22c55e">1,24M Ft</div><div class="stat-change up">↑ 23% múlt hónaphoz képest</div></div>
      <div class="stat-card"><div class="stat-label">Rendelések</div><div class="stat-value">847</div><div class="stat-change up">↑ 12% növekedés</div></div>
      <div class="stat-card"><div class="stat-label">Ügyfelek</div><div class="stat-value">2,841</div><div class="stat-change up">↑ 8% új regisztráció</div></div>
      <div class="stat-card"><div class="stat-label">Visszaküldés</div><div class="stat-value">2.4%</div><div class="stat-change down">↓ 0.3% csökkent</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title">Heti bevétel <span style="color:#6366f1;font-size:13px;cursor:pointer">Részletek →</span></div>
        <div class="chart">
          <div class="bar" style="height:40%;background:#1e1b4b"></div>
          <div class="bar" style="height:65%;background:#312e81"></div>
          <div class="bar" style="height:45%;background:#1e1b4b"></div>
          <div class="bar" style="height:90%;background:#6366f1"></div>
          <div class="bar" style="height:75%;background:#4f46e5"></div>
          <div class="bar" style="height:100%;background:#6366f1"></div>
          <div class="bar" style="height:82%;background:#4f46e5"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Legaktívabb termékek</div>
        <table>
          <tr><td><div style="font-weight:600">Termék A</div></td><td style="color:#9ca3af">148 db</td><td style="color:#22c55e;font-weight:700">+24%</td></tr>
          <tr><td><div style="font-weight:600">Termék B</div></td><td style="color:#9ca3af">97 db</td><td style="color:#22c55e;font-weight:700">+18%</td></tr>
          <tr><td><div style="font-weight:600">Termék C</div></td><td style="color:#9ca3af">64 db</td><td style="color:#ef4444;font-weight:700">-5%</td></tr>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Legutóbbi rendelések</div>
      <table>
        <thead><tr><th>RENDELÉS</th><th>ÜGYFÉL</th><th>TERMÉK</th><th>ÖSSZEG</th><th>STÁTUSZ</th></tr></thead>
        <tbody>
          <tr><td style="color:#6366f1;font-weight:600">#1842</td><td>Nagy Péter</td><td>Prémium csomag</td><td style="font-weight:700">24 990 Ft</td><td><span class="status paid">Fizetve</span></td></tr>
          <tr><td style="color:#6366f1;font-weight:600">#1841</td><td>Kiss Anna</td><td>Alap csomag</td><td style="font-weight:700">4 990 Ft</td><td><span class="status pending">Folyamatban</span></td></tr>
          <tr><td style="color:#6366f1;font-weight:600">#1840</td><td>Tóth Béla</td><td>Pro csomag</td><td style="font-weight:700">12 990 Ft</td><td><span class="status paid">Fizetve</span></td></tr>
          <tr><td style="color:#6366f1;font-weight:600">#1839</td><td>Szabó Éva</td><td>Alap csomag</td><td style="font-weight:700">4 990 Ft</td><td><span class="status failed">Sikertelen</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</body>
</html>""",
}

# ── FIREBASE ──────────────────────────────────────────────────────────────────
def firebase_login(email, password):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
    data = json.dumps({"email":email,"password":password,"returnSecureToken":True}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            resp = json.loads(r.read())
            return resp.get("idToken"), resp.get("email"), None
    except urllib.error.HTTPError as e:
        try: err = json.loads(e.read()).get("error",{}).get("message","Hiba")
        except: err = "Kapcsolati hiba"
        return None, None, err
    except Exception as e: return None, None, str(e)

def get_access_token():
    return CI_TOKEN  # Used directly with firebase-tools CLI

def hosting_deploy(html, progress_cb=None):
    import subprocess, tempfile
    try:
        if progress_cb: progress_cb("HTML fájl előkészítése...", 0.2)
        # Write HTML to oiltrade folder as index.html
        base = os.path.expanduser("~/oiltrade/deploy_tmp")
        os.makedirs(base, exist_ok=True)
        html_path = os.path.join(base, "index.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        # Write firebase.json
        fbjson = os.path.join(base, "firebase.json")
        with open(fbjson, "w") as f:
            f.write('{"hosting":{"public":".","ignore":["firebase.json","**/.gitignore"]}}')
        if progress_cb: progress_cb("Firebase deploy...", 0.5)
        result = subprocess.run(
            ["npx", "firebase-tools", "deploy", "--only", "hosting",
             "--token", CI_TOKEN, "--project", FIREBASE_PROJECT_ID, "--non-interactive"],
            cwd=base, capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            if progress_cb: progress_cb("Kész!", 1.0)
            return True, HOSTING_URL
        else:
            return False, result.stderr[-500:] if result.stderr else "Deploy hiba"
    except Exception as e:
        return False, str(e)

def hosting_deploy_OLD(html, progress_cb=None):
    import subprocess, tempfile
    try:
        if progress_cb: progress_cb("HTML fájl előkészítése...", 0.2)
        # Write HTML to oiltrade folder as index.html
        base = os.path.expanduser("~/oiltrade/deploy_tmp")
        os.makedirs(base, exist_ok=True)
        html_path = os.path.join(base, "index.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        # Write firebase.json
        fbjson = os.path.join(base, "firebase.json")
        with open(fbjson, "w") as f:
            f.write('{"hosting":{"public":".","ignore":["firebase.json","**/.gitignore"]}}')
        if progress_cb: progress_cb("Firebase deploy...", 0.5)
        result = subprocess.run(
            ["npx", "firebase-tools", "deploy", "--only", "hosting",
             "--token", CI_TOKEN, "--project", FIREBASE_PROJECT_ID, "--non-interactive"],
            cwd=base, capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            if progress_cb: progress_cb("Kész!", 1.0)
            return True, HOSTING_URL
        else:
            return False, result.stderr[-500:] if result.stderr else "Deploy hiba"
    except Exception as e:
        return False, str(e)

def hosting_deploy_OLD(html, progress_cb=None):
    try:
        if progress_cb: progress_cb("Token...", 0.1)
        token = get_access_token()
        if not token: return False, "Token hiba"
        hdrs = {"Authorization":f"Bearer {token}", "Content-Type":"application/json"}
        if progress_cb: progress_cb("Verzió létrehozása...", 0.3)
        url = f"https://firebasehosting.googleapis.com/v1beta1/sites/{FIREBASE_PROJECT_ID}/versions"
        req = urllib.request.Request(url,
            data=json.dumps({"config":{"headers":[{"glob":"**","headers":{"Cache-Control":"no-cache"}}]}}).encode(),
            headers=hdrs)
        with urllib.request.urlopen(req) as r: version = json.loads(r.read())
        vname = version["name"]
        html_bytes = html.encode("utf-8")
        sha = hashlib.sha256(html_bytes).hexdigest()
        req = urllib.request.Request(f"https://firebasehosting.googleapis.com/v1beta1/{vname}:populateFiles",
            data=json.dumps({"files":{"/index.html":sha}}).encode(), headers=hdrs)
        with urllib.request.urlopen(req) as r: pop = json.loads(r.read())
        upload_url = pop.get("uploadUrl","")
        if sha in pop.get("uploadRequiredHashes",[]) and upload_url:
            if progress_cb: progress_cb("Feltöltés...", 0.6)
            req = urllib.request.Request(f"{upload_url}/{sha}", data=html_bytes,
                headers={"Authorization":f"Bearer {token}","Content-Type":"application/octet-stream"}, method="POST")
            with urllib.request.urlopen(req): pass
        if progress_cb: progress_cb("Véglegesítés...", 0.85)
        fhdrs = dict(hdrs); fhdrs["X-HTTP-Method-Override"] = "PATCH"
        req = urllib.request.Request(f"https://firebasehosting.googleapis.com/v1beta1/{vname}?updateMask=status",
            data=json.dumps({"status":"FINALIZED"}).encode(), headers=fhdrs)
        with urllib.request.urlopen(req): pass
        req = urllib.request.Request(
            f"https://firebasehosting.googleapis.com/v1beta1/sites/{FIREBASE_PROJECT_ID}/releases?versionName={vname}",
            data=b"{}", headers=hdrs)
        with urllib.request.urlopen(req): pass
        if progress_cb: progress_cb("Kész!", 1.0)
        return True, HOSTING_URL
    except Exception as e: return False, str(e)

# ── LOGIN ─────────────────────────────────────────────────────────────────────
class LoginWindow:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("OilTrade WebEditor v3")
        self.root.geometry("420x520")
        self.root.configure(bg=BG)
        self.root.resizable(False, False)
        x = (self.root.winfo_screenwidth()-420)//2
        y = (self.root.winfo_screenheight()-520)//2
        self.root.geometry(f"420x520+{x}+{y}")
        self.result = None
        self._build()
        self.root.mainloop()

    def _build(self):
        tk.Frame(self.root, bg=ACCENT, height=4).pack(fill="x")
        tk.Frame(self.root, bg=BG, height=32).pack(fill="x")

        logo_f = tk.Frame(self.root, bg=BG)
        logo_f.pack()
        tk.Label(logo_f, text="⬡", bg=ACCENT, fg="#000",
                 font=("Helvetica", 28, "bold"), padx=14, pady=8).pack()
        tk.Label(self.root, text="OilTrade WebEditor", bg=BG, fg=TEXT,
                 font=("Helvetica", 18, "bold")).pack(pady=(12, 2))
        tk.Label(self.root, text="v3.0 — HTML Editor + Firebase", bg=BG, fg=ACCENT,
                 font=("Helvetica", 10)).pack()
        tk.Label(self.root, text="8 sablon · Kód szerkesztő · Deploy", bg=BG, fg=TEXT3,
                 font=("Helvetica", 9)).pack(pady=(3, 28))

        f = tk.Frame(self.root, bg=BG)
        f.pack(padx=40, fill="x")
        tk.Frame(f, bg=BORDER, height=1).pack(fill="x", pady=(0, 18))

        tk.Label(f, text="EMAIL", bg=BG, fg=TEXT3, font=("Helvetica", 9, "bold")).pack(anchor="w")
        self.ev = tk.StringVar(value="ddnemet@gmail.com")
        e1 = tk.Entry(f, textvariable=self.ev, bg=BG3, fg=TEXT, insertbackground=TEXT,
                      relief="flat", font=("Helvetica", 12))
        e1.pack(fill="x", ipady=9, pady=(4, 14))

        tk.Label(f, text="JELSZÓ", bg=BG, fg=TEXT3, font=("Helvetica", 9, "bold")).pack(anchor="w")
        self.pv = tk.StringVar()
        pe = tk.Entry(f, textvariable=self.pv, show="●", bg=BG3, fg=TEXT,
                      insertbackground=TEXT, relief="flat", font=("Helvetica", 12))
        pe.pack(fill="x", ipady=9, pady=(4, 18))
        pe.bind("<Return>", lambda e: self._login())
        pe.focus()

        self.err = tk.Label(f, text="", bg=BG, fg=RED, font=("Helvetica", 10), wraplength=320)
        self.err.pack()

        self.btn = tk.Button(f, text="Bejelentkezés  →", bg=ACCENT, fg="#000",
                             relief="flat", font=("Helvetica", 12, "bold"),
                             command=self._login, cursor="hand2", pady=12,
                             activebackground="#79c0ff")
        self.btn.pack(fill="x", pady=(6, 10))

        tk.Button(f, text="Vendégként folytatás", bg=BG3, fg=TEXT2,
                  relief="flat", font=("Helvetica", 10), cursor="hand2", pady=8,
                  command=lambda: [setattr(self, 'result', {"token":None,"email":"guest"}),
                                   self.root.destroy()]).pack(fill="x")

    def _login(self):
        email = self.ev.get().strip(); pw = self.pv.get()
        if not email or not pw: self.err.configure(text="Töltsd ki a mezőket!"); return
        self.btn.configure(text="Belépés...", state="disabled"); self.err.configure(text="")
        def run():
            token, uemail, err = firebase_login(email, pw)
            self.root.after(0, lambda: self._result(token, uemail, err))
        threading.Thread(target=run, daemon=True).start()

    def _result(self, token, email, err):
        if err:
            self.err.configure(text=f"❌ {err}")
            self.btn.configure(text="Bejelentkezés  →", state="normal")
        else:
            self.result = {"token":token, "email":email}
            self.root.destroy()

# ── MAIN EDITOR ───────────────────────────────────────────────────────────────
class WebEditor:
    def __init__(self, user):
        self.user = user
        if _DND_AVAILABLE:
            self.root = TkinterDnD.Tk()
        else:
            self.root = tk.Tk()
        self.root.title(f"OilTrade WebEditor v3  |  {user['email']}")
        self.root.geometry("1540x920")
        self.root.configure(bg=BG)
        self.root.minsize(1000, 660)
        self.html = ""
        self.project_path = None
        self.undo_stack = []
        self._build()
        self.root.mainloop()

    def _build(self):
        tk.Frame(self.root, bg=ACCENT, height=3).pack(fill="x")

        mb = tk.Menu(self.root, bg=BG2, fg=TEXT, activebackground=ACCENT, activeforeground="#000")
        self.root.config(menu=mb)
        fm = tk.Menu(mb, tearoff=0, bg=BG2, fg=TEXT, activebackground=ACCENT, activeforeground="#000")
        fm.add_command(label="Megnyitás    Ctrl+O", command=self.open_file)
        fm.add_command(label="Mentés       Ctrl+S", command=self.save_file)
        fm.add_separator()
        fm.add_command(label="Böngészőben  Ctrl+B", command=self.open_browser)
        fm.add_command(label="Firebase     F5", command=self.deploy)
        fm.add_separator()
        fm.add_command(label="Kilépés", command=self.root.quit)
        mb.add_cascade(label="Fájl", menu=fm)

        main = tk.Frame(self.root, bg=BG)
        main.pack(fill="both", expand=True)

        # Left sidebar
        left = tk.Frame(main, bg=BG2, width=260)
        left.pack(side="left", fill="y")
        left.pack_propagate(False)
        self._build_left(left)

        # Center editor
        center = tk.Frame(main, bg=BG)
        center.pack(side="left", fill="both", expand=True)
        self._build_center(center)

        # Shortcuts
        self.root.bind("<Control-o>", lambda e: self.open_file())
        self.root.bind("<Control-s>", lambda e: self.save_file())
        self.root.bind("<Control-b>", lambda e: self.open_browser())
        self.root.bind("<Control-z>", lambda e: self.undo())
        self.root.bind("<F5>", lambda e: self.deploy())

    def _build_left(self, parent):
        # Header
        hdr = tk.Frame(parent, bg=BG2, pady=14)
        hdr.pack(fill="x", padx=16)
        tk.Label(hdr, text="⬡ WebEditor v3", bg=BG2, fg=TEXT,
                 font=("Helvetica", 13, "bold")).pack(anchor="w")
        tk.Label(hdr, text=f"👤 {self.user['email']}", bg=BG2, fg=TEXT3,
                 font=("Helvetica", 9)).pack(anchor="w")

        tk.Frame(parent, bg=BORDER, height=1).pack(fill="x")

        # Templates section
        tpl_f = tk.Frame(parent, bg=BG2, pady=12)
        tpl_f.pack(fill="x", padx=16)
        tk.Label(tpl_f, text="📋 SABLONOK", bg=BG2, fg=TEXT3,
                 font=("Helvetica", 8, "bold")).pack(anchor="w", pady=(0, 8))

        for name in TEMPLATES:
            # Split emoji and text for macOS compatibility
            parts = name.split(" ", 1)
            emoji = parts[0] if len(parts) > 1 else ""
            label = parts[1] if len(parts) > 1 else name

            row = tk.Frame(tpl_f, bg=BG3, cursor="hand2")
            row.pack(fill="x", pady=2)

            em_lbl = tk.Label(row, text=emoji, bg=BG3, fg=TEXT,
                              font=("Helvetica", 13), width=3)
            em_lbl.pack(side="left", padx=(6,0), pady=6)

            tx_lbl = tk.Label(row, text=label, bg=BG3, fg=TEXT,
                              font=("Helvetica", 11), anchor="w")
            tx_lbl.pack(side="left", fill="x", expand=True, pady=6)

            def make_cmd(n=name, r=row, e=em_lbl, t=tx_lbl):
                def enter(ev): r.configure(bg=BG4); e.configure(bg=BG4); t.configure(bg=BG4)
                def leave(ev): r.configure(bg=BG3); e.configure(bg=BG3); t.configure(bg=BG3)
                def click(ev=None): self.load_template(n)
                for w in [r, e, t]:
                    w.bind("<Enter>", enter)
                    w.bind("<Leave>", leave)
                    w.bind("<Button-1>", click)
            make_cmd()

        tk.Frame(parent, bg=BORDER, height=1).pack(fill="x")

        # Actions
        act_f = tk.Frame(parent, bg=BG2, pady=12)
        act_f.pack(fill="x", padx=16)
        tk.Label(act_f, text="⚡ MŰVELETEK", bg=BG2, fg=TEXT3,
                 font=("Helvetica", 8, "bold")).pack(anchor="w", pady=(0, 8))

        actions = [
            ("📂  Megnyitás", self.open_file),
            ("💾  Mentés", self.save_file),
            ("🌐  Böngészőben", self.open_browser),
            ("↩  Visszavonás", self.undo),
        ]
        for text, cmd in actions:
            parts = text.strip().split("  ", 1)
            emoji = parts[0] if len(parts) > 1 else ""
            label = parts[1] if len(parts) > 1 else text

            row = tk.Frame(act_f, bg=BG3, cursor="hand2")
            row.pack(fill="x", pady=2)

            em_lbl = tk.Label(row, text=emoji, bg=BG3, fg=TEXT,
                              font=("Helvetica", 13), width=3)
            em_lbl.pack(side="left", padx=(6,0), pady=6)

            tx_lbl = tk.Label(row, text=label, bg=BG3, fg=TEXT,
                              font=("Helvetica", 11), anchor="w")
            tx_lbl.pack(side="left", fill="x", expand=True, pady=6)

            def make_action(c=cmd, r=row, e=em_lbl, t=tx_lbl):
                def enter(ev): r.configure(bg=BG4); e.configure(bg=BG4); t.configure(bg=BG4)
                def leave(ev): r.configure(bg=BG3); e.configure(bg=BG3); t.configure(bg=BG3)
                def click(ev=None): c()
                for w in [r, e, t]:
                    w.bind("<Enter>", enter)
                    w.bind("<Leave>", leave)
                    w.bind("<Button-1>", click)
            make_action()

        tk.Frame(parent, bg=BORDER, height=1).pack(fill="x")

        # Deploy button
        deploy_f = tk.Frame(parent, bg=BG2, pady=12)
        deploy_f.pack(fill="x", padx=16)

        self.deploy_btn = tk.Button(deploy_f, text="🚀 Firebase feltöltés  F5",
                                     bg="#1a3a1a", fg=GREEN, relief="flat",
                                     font=("Helvetica", 10, "bold"),
                                     command=self.deploy, cursor="hand2", pady=9)
        self.deploy_btn.pack(fill="x", pady=2)
        self.deploy_btn.bind("<Enter>", lambda e: self.deploy_btn.configure(bg="#1f4a1f"))
        self.deploy_btn.bind("<Leave>", lambda e: self.deploy_btn.configure(bg="#1a3a1a"))

        self.status_lbl = tk.Label(deploy_f, text="", bg=BG2, fg=TEXT2,
                                    font=("Helvetica", 9), wraplength=220)
        self.status_lbl.pack(pady=(6, 0))

        # Info
        tk.Frame(parent, bg=BORDER, height=1).pack(fill="x")
        info_f = tk.Frame(parent, bg=BG2, pady=10)
        info_f.pack(fill="x", padx=16)
        tk.Label(info_f, text="💡 Tipp: Illeszd be a ChatGPT\nvagy Claude által generált\nHTML kódot a szerkesztőbe!", bg=BG2, fg=TEXT3,
                 font=("Helvetica", 9), justify="left").pack(anchor="w")

    def _build_center(self, parent):
        # Toolbar
        tb = tk.Frame(parent, bg=BG3, pady=7)
        tb.pack(fill="x")
        tk.Label(tb, text="</> HTML SZERKESZTŐ", bg=BG3, fg=TEXT2,
                 font=("Helvetica", 9, "bold")).pack(side="left", padx=14)

        # Apply button
        apply_btn = tk.Button(tb, text="✓ Alkalmazás + Előnézet",
                               bg=GREEN, fg="#000", relief="flat",
                               font=("Helvetica", 9, "bold"),
                               command=self.apply_code, cursor="hand2",
                               padx=12, pady=4)
        apply_btn.pack(side="right", padx=8)

        self.lines_lbl = tk.Label(tb, text="", bg=BG3, fg=TEXT3, font=("Helvetica", 9))
        self.lines_lbl.pack(side="right", padx=8)

        # Editor + preview split
        paned = tk.PanedWindow(parent, orient="horizontal", bg=BG,
                                sashwidth=4, sashrelief="flat")
        paned.pack(fill="both", expand=True)

        # Code editor
        editor_f = tk.Frame(paned, bg=BG)
        paned.add(editor_f, minsize=400)

        ys = tk.Scrollbar(editor_f, bg=BG3)
        ys.pack(side="right", fill="y")
        xs = tk.Scrollbar(editor_f, orient="horizontal", bg=BG3)
        xs.pack(side="bottom", fill="x")

        self.editor = tk.Text(editor_f, bg="#0d1117", fg="#c9d1d9",
                               insertbackground="#c9d1d9", relief="flat",
                               font=("Menlo", 11), wrap="none",
                               yscrollcommand=ys.set, xscrollcommand=xs.set,
                               tabs=4, undo=True)
        self.editor.pack(fill="both", expand=True)
        ys.configure(command=self.editor.yview)
        xs.configure(command=self.editor.xview)

        # Syntax colors
        self.editor.tag_configure("tag", foreground="#7ee787")
        self.editor.tag_configure("attr", foreground="#79c0ff")
        self.editor.tag_configure("string", foreground="#a5d6ff")
        self.editor.tag_configure("comment", foreground="#8b949e", font=("Menlo", 11, "italic"))

        self.editor.bind("<KeyRelease>", self._on_key)

        # Drag & drop support
        try:
            self.editor.drop_target_register("DND_Files")
            self.editor.dnd_bind("<<Drop>>", self._on_drop)
        except Exception:
            pass
        try:
            self.root.drop_target_register("DND_Files")
            self.root.dnd_bind("<<Drop>>", self._on_drop)
        except Exception:
            pass

        # Preview panel
        prev_f = tk.Frame(paned, bg=BG2)
        paned.add(prev_f, minsize=300)

        tk.Frame(prev_f, bg=BORDER, height=1).pack(fill="x")
        prev_hdr = tk.Frame(prev_f, bg=BG2, pady=8)
        prev_hdr.pack(fill="x", padx=12)
        tk.Label(prev_hdr, text="🌐 ELŐNÉZET INFO", bg=BG2, fg=TEXT3,
                 font=("Helvetica", 8, "bold")).pack(anchor="w")

        self.prev_info = tk.Label(prev_f,
            text="Válassz egy sablont\nvagy illeszd be a HTML kódot\nés kattints az Alkalmazásra!",
            bg=BG2, fg=TEXT3, font=("Helvetica", 11), justify="center")
        self.prev_info.pack(expand=True)

        self.open_prev_btn = tk.Button(prev_f,
            text="🌐 Megnyitás böngészőben",
            bg=ACCENT, fg="#000", relief="flat",
            font=("Helvetica", 11, "bold"),
            command=self.open_browser, cursor="hand2",
            pady=10, state="disabled")
        self.open_prev_btn.pack(fill="x", padx=16, pady=8)

        tk.Frame(prev_f, bg=BORDER, height=1).pack(fill="x")

        # HTML info
        self.html_info = tk.Label(prev_f, text="", bg=BG2, fg=TEXT2,
                                   font=("Helvetica", 9), justify="left")
        self.html_info.pack(anchor="w", padx=12, pady=8)

        # Firebase URL
        url_f = tk.Frame(prev_f, bg=BG2)
        url_f.pack(fill="x", padx=12, pady=(0, 8))
        tk.Label(url_f, text="Firebase URL:", bg=BG2, fg=TEXT3,
                 font=("Helvetica", 9)).pack(anchor="w")
        url_btn = tk.Button(url_f, text=HOSTING_URL, bg=BG2, fg=ACCENT,
                             relief="flat", font=("Helvetica", 9),
                             cursor="hand2", anchor="w",
                             command=lambda: webbrowser.open(HOSTING_URL))
        url_btn.pack(anchor="w")

        # Placeholder welcome text
        welcome = f"""<!-- OilTrade WebEditor v3 -->
<!-- 
  Hogyan használd:
  1. Válassz egy sablont a bal panelről
  2. VAGY illeszd be a saját HTML kódodat
  3. Szerkeszd tetszés szerint
  4. Kattints az "Alkalmazás + Előnézet" gombra
  5. Nyisd meg böngészőben az előnézethez
  6. Töltsd fel Firebase-re az F5 gombbal

  Tipp: Használj ChatGPT-t vagy Claude-ot
  a HTML kód generálásához, majd illeszd
  be ide és szerkeszd!
-->

<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>Az én weboldalam</title>
</head>
<body>
  <h1>Üdvözlöm!</h1>
  <p>Cseréld ki ezt a kódot a sajátodra.</p>
</body>
</html>"""
        self.editor.insert("1.0", welcome)
        self._update_lines()

    def _on_drop(self, event):
        """Handle drag & drop of HTML files."""
        path = event.data
        # Clean up path (remove braces on macOS/Linux)
        path = path.strip().strip("{}")
        if path.endswith(".html") or path.endswith(".htm"):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                self.save_undo()
                self.html = content
                self.editor.delete("1.0", "end")
                self.editor.insert("1.0", content)
                self._update_lines()
                self.project_path = path
                self.apply_code()
                self.status_lbl.configure(text=f"✅ Bedobva!")
            except Exception as e:
                self.status_lbl.configure(text=f"❌ Hiba: {e}")
        else:
            self.status_lbl.configure(text="❌ Csak HTML fájlt lehet bedobni!")

    def _on_key(self, event=None):
        self._update_lines()
        self.html = self.editor.get("1.0", "end-1c")

    def _update_lines(self):
        content = self.editor.get("1.0", "end-1c")
        lines = len(content.split("\n"))
        size = len(content) // 1024
        self.lines_lbl.configure(text=f"{lines} sor · {size} KB")

    def load_template(self, name):
        if self.html and not messagebox.askyesno("Sablon betöltése",
            f"Betöltöd a '{name}' sablont?\nA jelenlegi tartalom elvész."):
            return
        self.save_undo()
        self.html = TEMPLATES[name]
        self.editor.delete("1.0", "end")
        self.editor.insert("1.0", self.html)
        self._update_lines()
        self.apply_code()
        self.status_lbl.configure(text=f"✅ {name} sablon betöltve!")

    def apply_code(self):
        self.save_undo()
        self.html = self.editor.get("1.0", "end-1c")
        lines = len(self.html.split("\n"))
        size = len(self.html) // 1024
        self.prev_info.configure(
            text=f"✅ HTML alkalmazva!\n\n{lines} sor · {size} KB\n\nNyisd meg böngészőben!",
            fg=GREEN)
        self.open_prev_btn.configure(state="normal")
        self.html_info.configure(
            text=f"📄 {lines} sor HTML\n💾 {size} KB méret\n🌐 Kész a feltöltésre")
        self.status_lbl.configure(text="✅ Alkalmazva!")

    def open_browser(self):
        if not self.html:
            messagebox.showwarning("Figyelem", "Nincs tartalom!"); return
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
            f.write(self.html); path = f.name
        webbrowser.open(f"file:///{path}")

    def open_file(self):
        path = filedialog.askopenfilename(filetypes=[("HTML fájl","*.html"),("Minden","*.*")])
        if not path: return
        with open(path, "r", encoding="utf-8") as f: content = f.read()
        self.save_undo()
        self.html = content
        self.editor.delete("1.0", "end")
        self.editor.insert("1.0", content)
        self._update_lines()
        self.project_path = path
        self.status_lbl.configure(text=f"✅ Megnyitva!")

    def save_file(self):
        if not self.project_path:
            self.project_path = filedialog.asksaveasfilename(
                defaultextension=".html", filetypes=[("HTML","*.html")])
        if self.project_path:
            content = self.editor.get("1.0", "end-1c")
            with open(self.project_path, "w", encoding="utf-8") as f: f.write(content)
            self.status_lbl.configure(text="✅ Mentve!")

    def save_undo(self):
        self.undo_stack.append(self.editor.get("1.0","end-1c"))
        if len(self.undo_stack) > 30: self.undo_stack.pop(0)

    def undo(self):
        if self.undo_stack:
            content = self.undo_stack.pop()
            self.editor.delete("1.0", "end")
            self.editor.insert("1.0", content)
            self._update_lines()

    def deploy(self, e=None):
        self.html = self.editor.get("1.0", "end-1c")
        if not self.html: messagebox.showwarning("Figyelem","Nincs tartalom!"); return

        win = tk.Toplevel(self.root)
        win.title("Firebase")
        win.geometry("420x300")
        win.configure(bg=BG)
        win.resizable(False, False)
        win.grab_set()

        tk.Frame(win, bg=ACCENT, height=3).pack(fill="x")
        tk.Label(win, text="🚀 Firebase Hosting", bg=BG, fg=TEXT,
                 font=("Helvetica", 14, "bold"), pady=14).pack()
        tk.Label(win, text=HOSTING_URL, bg=BG, fg=TEXT2, font=("Helvetica", 10)).pack()

        prog_lbl = tk.Label(win, text="Előkészítés...", bg=BG, fg=TEXT2,
                             font=("Helvetica", 11), pady=12)
        prog_lbl.pack()

        bar = ttk.Progressbar(win, mode="determinate", length=360, maximum=100)
        bar.pack(pady=4)

        status = tk.Label(win, text="", bg=BG, fg=GREEN,
                           font=("Helvetica", 10), wraplength=380)
        status.pack(pady=6)

        open_btn = tk.Button(win, text="🌐 Megnyitás böngészőben",
                              bg=GREEN, fg="#000", relief="flat",
                              font=("Helvetica", 11, "bold"), pady=9,
                              command=lambda: webbrowser.open(HOSTING_URL),
                              state="disabled", cursor="hand2")
        open_btn.pack(padx=24, fill="x")

        html = self.html

        def run():
            def cb(msg, pct):
                win.after(0, lambda: prog_lbl.configure(text=msg))
                win.after(0, lambda: bar.configure(value=pct*100))
            ok, result = hosting_deploy(html, cb)
            def done():
                if ok:
                    status.configure(text=f"✅ Feltöltve!\n{result}", fg=GREEN)
                    open_btn.configure(state="normal")
                    self.status_lbl.configure(text="✅ Firebase-re feltöltve!")
                else:
                    status.configure(text=f"❌ Hiba: {result}", fg=RED)
                    prog_lbl.configure(text="Sikertelen.")
            win.after(0, done)
        threading.Thread(target=run, daemon=True).start()

# ── ENTRY ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    login = LoginWindow()
    if login.result:
        WebEditor(login.result)
