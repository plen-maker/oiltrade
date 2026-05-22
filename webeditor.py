#!/usr/bin/env python3
"""
OilTrade WebEditor v1.8
- Gemini AI website generálás
- Drag & drop szerkesztés
- Customizable templates
- Firebase Hosting deploy
EXE: pyinstaller --onefile --windowed webeditor.py
"""

import tkinter as tk
from tkinter import ttk, colorchooser, filedialog, messagebox
import json, base64, webbrowser, threading, copy, urllib.request, urllib.parse, urllib.error, re

# ── CONFIG ────────────────────────────────────────────────────────────────────
GEMINI_API_KEY      = "AIzaSyCibWEomPg12Nm_F4Vv-NhZtaWQPzk_O_k"
FIREBASE_API_KEY    = "AIzaSyD4syP6lOeg5JZCnTct4X_NoAhZN4TiDH4"
FIREBASE_PROJECT_ID = "oiltrade-3"
CI_TOKEN            = "1//03C5sWeP9Fi3iCgYIARAAGAMSNwF-L9IrsOuS-jfyK0yCkYHCzgunq6UAJJzGXTUbAmO6IILXxLF_rwoILaENZRENqrS19feMijA"
HOSTING_URL         = f"https://{FIREBASE_PROJECT_ID}.web.app"

# ── COLORS ────────────────────────────────────────────────────────────────────
BG="#0d1117"; BG2="#161b22"; BG3="#21262d"; BG4="#2d333b"
ACCENT="#58a6ff"; GREEN="#3fb950"; RED="#f85149"; ORANGE="#f0883e"; PURPLE="#bc8cff"
TEXT="#e6edf3"; TEXT2="#8b949e"; BORDER="#30363d"

# ── ELEMENT TYPES ─────────────────────────────────────────────────────────────
ELEM_TYPES = {
    "text":      {"icon":"T",   "label":"Szöveg",       "color":ACCENT,  "w":260,"h":50},
    "heading":   {"icon":"H1",  "label":"Fejléc",       "color":ORANGE,  "w":380,"h":72},
    "heading2":  {"icon":"H2",  "label":"Alfejléc",     "color":ORANGE,  "w":340,"h":54},
    "button":    {"icon":"BTN", "label":"Gomb",         "color":GREEN,   "w":160,"h":50},
    "image":     {"icon":"IMG", "label":"Kép",          "color":PURPLE,  "w":280,"h":200},
    "box":       {"icon":"[]",  "label":"Doboz",        "color":ACCENT,  "w":280,"h":160},
    "divider":   {"icon":"---", "label":"Vonal",        "color":TEXT2,   "w":380,"h":20},
    "spacer":    {"icon":"↕",   "label":"Térköz",       "color":TEXT2,   "w":380,"h":40},
    "hero":      {"icon":"HRO", "label":"Hero sáv",     "color":ORANGE,  "w":960,"h":360},
    "navbar":    {"icon":"NAV", "label":"Navigáció",    "color":TEXT2,   "w":960,"h":64},
    "footer":    {"icon":"FTR", "label":"Lábléc",       "color":TEXT2,   "w":960,"h":120},
    "product":   {"icon":"PRD", "label":"Termék kártya","color":GREEN,   "w":240,"h":320},
    "product_detail": {"icon":"DET","label":"Termék részletek","color":GREEN,"w":960,"h":500},
    "gallery":   {"icon":"GAL", "label":"Galéria",      "color":PURPLE,  "w":520,"h":240},
    "card":      {"icon":"CRD", "label":"Kártya",       "color":PURPLE,  "w":240,"h":300},
    "form":      {"icon":"FRM", "label":"Kapcsolat",    "color":ORANGE,  "w":420,"h":340},
    "subscribe": {"icon":"SUB", "label":"Feliratkozás", "color":ACCENT,  "w":420,"h":130},
    "testimonial":{"icon":"QT", "label":"Vélemény",     "color":ORANGE,  "w":340,"h":190},
    "counter":   {"icon":"123", "label":"Számláló",     "color":ACCENT,  "w":400,"h":110},
    "video":     {"icon":"VID", "label":"Videó",        "color":RED,     "w":520,"h":293},
    "map":       {"icon":"MAP", "label":"Térkép",       "color":GREEN,   "w":520,"h":320},
    "columns":   {"icon":"|||", "label":"Oszlopok",     "color":ACCENT,  "w":960,"h":200},
    "html":      {"icon":"</>", "label":"HTML kód",     "color":RED,     "w":400,"h":150},
}

ELEM_GROUPS = {
    "Alap":      ["text","heading","heading2","button","image","box","divider","spacer"],
    "Szekciók":  ["hero","navbar","footer","columns"],
    "Termékek":  ["product","product_detail","gallery","card"],
    "Interaktív":["form","subscribe","testimonial","counter"],
    "Media":     ["video","map","html"],
}

# ── AI TEMPLATES ──────────────────────────────────────────────────────────────
AI_EXAMPLES = [
    "Hozz létre egy modern olaj kereskedő cég weboldalt termékekkel és kapcsolati űrlappal",
    "Készíts egy étterem weboldalt menüvel és foglalási lehetőséggel",
    "Készíts egy startup landing page-t hero sávval és feature listával",
    "Készíts egy portfolio weboldalt projektekkel és rólam szekcióval",
    "Készíts egy webshopot termék kártyákkal és kosár gombokkal",
]

# ── GEMINI AI ─────────────────────────────────────────────────────────────────
def generate_website_with_ai(prompt, progress_cb=None):
    """Generate complete HTML website using Gemini AI."""
    if progress_cb: progress_cb("Gemini AI feldolgozza a kérést...")

    system_prompt = """Te egy profi webdesigner vagy. A felhasználó leírása alapján generálj egy teljes, modern, gyönyörű HTML weboldalt.

FONTOS SZABÁLYOK:
1. Teljes HTML oldalt generálj <!DOCTYPE html>-től </html>-ig
2. Minden CSS legyen inline a <style> tagben
3. Modern, professional design - gradient háttér, árnyékok, animációk
4. Reszponzív - mobilon is jól nézzen ki
5. Tartalmaz: navbar, hero szekció, tartalom szekciók, footer
6. Valósági tartalom - ne placeholder szöveget írj hanem valódi szöveget a témához
7. Ha termékek kellenek, csinálj szép termék kártyákat hover effekttel
8. Színek: modern, összehangolt paletta
9. Betűtípusok: Google Fonts importálj
10. Animációk: CSS animációk a megjelenéshez
11. Ha kell webshop funkció, JavaScript kosár rendszert is írj
12. Ha kell kapcsolati form, működő validációval
13. Legyen egy sticky navbar
14. Legyen smooth scroll
15. CSAK a HTML kódot add vissza, semmi más szöveget!"""

    full_prompt = f"{system_prompt}\n\nFelhasználó kérése: {prompt}\n\nGenerálj egy teljes weboldalt:"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
    data = json.dumps({
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 8192}
    }).encode()

    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        if progress_cb: progress_cb("Weboldal generálása...")
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
        html = resp["candidates"][0]["content"]["parts"][0]["text"]
        # Clean up markdown code blocks if present
        html = re.sub(r"```html\n?", "", html)
        html = re.sub(r"```\n?", "", html)
        html = html.strip()
        if progress_cb: progress_cb("Kész!")
        return html, None
    except Exception as e:
        return None, str(e)

def ai_edit_element(html_content, instruction, progress_cb=None):
    """Use AI to edit specific part of the website."""
    if progress_cb: progress_cb("AI szerkesztés...")
    prompt = f"""Az alábbi HTML weboldalt kell módosítani.

INSTRUKCIÓ: {instruction}

JELENLEGI HTML:
{html_content[:3000]}

Adj vissza CSAK módosított teljes HTML-t, semmi más szöveget!"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.5, "maxOutputTokens": 8192}
    }).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
        html = resp["candidates"][0]["content"]["parts"][0]["text"]
        html = re.sub(r"```html\n?", "", html)
        html = re.sub(r"```\n?", "", html)
        if progress_cb: progress_cb("Kész!")
        return html.strip(), None
    except Exception as e:
        return None, str(e)

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
    except Exception as e:
        return None, None, str(e)

def get_access_token():
    url = "https://oauth2.googleapis.com/token"
    data = urllib.parse.urlencode({
        "grant_type":"refresh_token","refresh_token":CI_TOKEN,
        "client_id":"563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
        "client_secret":"j9iVZfS8ggCpz5YCkFQkQBxd",
    }).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type":"application/x-www-form-urlencoded"})
    try:
        with urllib.request.urlopen(req) as r: return json.loads(r.read()).get("access_token")
    except: return None

def hosting_deploy(html_content, progress_cb=None):
    import hashlib
    try:
        if progress_cb: progress_cb("Token megszerzése...")
        token = get_access_token()
        if not token: return False, "Token hiba"
        hdrs = {"Authorization":f"Bearer {token}","Content-Type":"application/json"}

        if progress_cb: progress_cb("Verzió létrehozása...")
        url = f"https://firebasehosting.googleapis.com/v1beta1/sites/{FIREBASE_PROJECT_ID}/versions"
        req = urllib.request.Request(url,
            data=json.dumps({"config":{"headers":[{"glob":"**","headers":{"Cache-Control":"no-cache"}}]}}).encode(),
            headers=hdrs)
        with urllib.request.urlopen(req) as r: version = json.loads(r.read())
        vname = version["name"]

        if progress_cb: progress_cb("Fájlok feltöltése...")
        html_bytes = html_content.encode("utf-8")
        sha = hashlib.sha256(html_bytes).hexdigest()
        pop_data = json.dumps({"files":{"/index.html":sha}}).encode()
        req = urllib.request.Request(f"https://firebasehosting.googleapis.com/v1beta1/{vname}:populateFiles", data=pop_data, headers=hdrs)
        with urllib.request.urlopen(req) as r: pop = json.loads(r.read())

        upload_url = pop.get("uploadUrl","")
        if sha in pop.get("uploadRequiredHashes",[]) and upload_url:
            req = urllib.request.Request(f"{upload_url}/{sha}", data=html_bytes,
                headers={"Authorization":f"Bearer {token}","Content-Type":"application/octet-stream"}, method="POST")
            with urllib.request.urlopen(req): pass

        if progress_cb: progress_cb("Véglegesítés...")
        fhdrs = dict(hdrs); fhdrs["X-HTTP-Method-Override"]="PATCH"
        req = urllib.request.Request(f"https://firebasehosting.googleapis.com/v1beta1/{vname}?updateMask=status",
            data=json.dumps({"status":"FINALIZED"}).encode(), headers=fhdrs)
        with urllib.request.urlopen(req): pass

        req = urllib.request.Request(
            f"https://firebasehosting.googleapis.com/v1beta1/sites/{FIREBASE_PROJECT_ID}/releases?versionName={vname}",
            data=b"{}", headers=hdrs)
        with urllib.request.urlopen(req): pass

        if progress_cb: progress_cb("Kész!")
        return True, HOSTING_URL
    except Exception as e:
        return False, str(e)

# ── LOGIN ─────────────────────────────────────────────────────────────────────
class LoginWindow:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("OilTrade WebEditor v1.8")
        self.root.geometry("400x500")
        self.root.configure(bg=BG)
        self.root.resizable(False,False)
        x=(self.root.winfo_screenwidth()-400)//2
        y=(self.root.winfo_screenheight()-500)//2
        self.root.geometry(f"400x500+{x}+{y}")
        self.result = None
        self._build()
        self.root.mainloop()

    def _build(self):
        # Logo area
        logo_frame = tk.Frame(self.root, bg=BG)
        logo_frame.pack(pady=(40,0))
        tk.Label(logo_frame, text="⬡", bg=ACCENT, fg="#000", font=("Arial",32,"bold"),
                 width=3, pady=6).pack()
        tk.Label(self.root, text="OilTrade WebEditor", bg=BG, fg=TEXT,
                 font=("Arial",18,"bold")).pack(pady=(10,2))
        tk.Label(self.root, text="v1.8 — AI Powered", bg=BG, fg=ACCENT,
                 font=("Arial",11)).pack()
        tk.Label(self.root, text="✨ Gemini AI • Drag & Drop • Firebase", bg=BG, fg=TEXT2,
                 font=("Arial",9)).pack(pady=(4,28))

        f = tk.Frame(self.root, bg=BG)
        f.pack(padx=36, fill="x")
        tk.Label(f, text="Email", bg=BG, fg=TEXT2, font=("Arial",10)).pack(anchor="w")
        self.ev = tk.StringVar(value="ddnemet@gmail.com")
        tk.Entry(f, textvariable=self.ev, bg=BG3, fg=TEXT, insertbackground=TEXT,
                 relief="flat", font=("Arial",12)).pack(fill="x", ipady=8, pady=(2,12))
        tk.Label(f, text="Jelszó", bg=BG, fg=TEXT2, font=("Arial",10)).pack(anchor="w")
        self.pv = tk.StringVar()
        pe = tk.Entry(f, textvariable=self.pv, show="*", bg=BG3, fg=TEXT,
                      insertbackground=TEXT, relief="flat", font=("Arial",12))
        pe.pack(fill="x", ipady=8, pady=(2,18))
        pe.bind("<Return>", lambda e: self._login())
        pe.focus()
        self.err = tk.Label(f, text="", bg=BG, fg=RED, font=("Arial",10), wraplength=300)
        self.err.pack()
        self.btn = tk.Button(f, text="Bejelentkezés", bg=ACCENT, fg="#000",
                             relief="flat", font=("Arial",12,"bold"),
                             command=self._login, cursor="hand2", pady=11)
        self.btn.pack(fill="x", pady=(6,0))

        # Skip login button
        tk.Button(f, text="Folytatás bejelentkezés nélkül →", bg=BG, fg=TEXT2,
                  relief="flat", font=("Arial",10), cursor="hand2",
                  command=lambda: [setattr(self,'result',{"token":None,"email":"guest"}), self.root.destroy()]
                  ).pack(pady=(8,0))

    def _login(self):
        email = self.ev.get().strip()
        pw = self.pv.get()
        if not email or not pw:
            self.err.configure(text="Töltsd ki a mezőket!"); return
        self.btn.configure(text="Belépés...", state="disabled")
        self.err.configure(text="")
        def run():
            token, uemail, err = firebase_login(email, pw)
            self.root.after(0, lambda: self._result(token, uemail, err))
        threading.Thread(target=run, daemon=True).start()

    def _result(self, token, email, err):
        if err:
            self.err.configure(text=f"Hiba: {err}")
            self.btn.configure(text="Bejelentkezés", state="normal")
        else:
            self.result = {"token": token, "email": email}
            self.root.destroy()

# ── MAIN EDITOR ───────────────────────────────────────────────────────────────
class WebEditor:
    def __init__(self, user):
        self.user = user
        self.root = tk.Tk()
        self.root.title(f"OilTrade WebEditor v1.8  |  {user['email']}")
        self.root.geometry("1540x940")
        self.root.configure(bg=BG)
        self.root.minsize(1100,700)

        self.html_content = ""       # Current generated/edited HTML
        self.project_path = None
        self.undo_stack = []
        self.mode = "ai"             # "ai" or "edit"

        self._build_ui()
        self.root.mainloop()

    def _build_ui(self):
        # Menu
        mb = tk.Menu(self.root, bg=BG2, fg=TEXT, activebackground=ACCENT, activeforeground="#000")
        self.root.config(menu=mb)
        fm = tk.Menu(mb, tearoff=0, bg=BG2, fg=TEXT, activebackground=ACCENT, activeforeground="#000")
        fm.add_command(label="Új projekt     Ctrl+N", command=self.new_project)
        fm.add_command(label="Megnyitás      Ctrl+O", command=self.open_project)
        fm.add_command(label="Mentés         Ctrl+S", command=self.save_project)
        fm.add_separator()
        fm.add_command(label="HTML export", command=self.export_html)
        fm.add_command(label="Feltöltés Firebase-re  F5", command=self.deploy)
        fm.add_separator()
        fm.add_command(label="Kilépés", command=self.root.quit)
        mb.add_cascade(label="Fájl", menu=fm)

        # Main layout
        main = tk.Frame(self.root, bg=BG)
        main.pack(fill="both", expand=True)

        # Left panel - AI + Elements
        self.left = tk.Frame(main, bg=BG2, width=300)
        self.left.pack(side="left", fill="y")
        self.left.pack_propagate(False)
        self._build_left()

        # Center - Preview
        center = tk.Frame(main, bg=BG3)
        center.pack(side="left", fill="both", expand=True)
        self._build_center(center)

        # Right - Properties
        self.right = tk.Frame(main, bg=BG2, width=280)
        self.right.pack(side="right", fill="y")
        self.right.pack_propagate(False)
        self._build_right()

        # Shortcuts
        self.root.bind("<Control-s>", lambda e: self.save_project())
        self.root.bind("<Control-n>", lambda e: self.new_project())
        self.root.bind("<Control-o>", lambda e: self.open_project())
        self.root.bind("<Control-z>", lambda e: self.undo())
        self.root.bind("<F5>",        lambda e: self.deploy())

    def _build_left(self):
        # Mode tabs
        tab_frame = tk.Frame(self.left, bg=BG2)
        tab_frame.pack(fill="x", padx=8, pady=8)
        self.ai_tab_btn = tk.Button(tab_frame, text="✨ AI Generálás", bg=ACCENT, fg="#000",
                                     relief="flat", font=("Arial",10,"bold"), cursor="hand2",
                                     command=lambda: self._switch_mode("ai"), pady=7)
        self.ai_tab_btn.pack(side="left", fill="x", expand=True, padx=(0,2))
        self.edit_tab_btn = tk.Button(tab_frame, text="🎨 Szerkesztés", bg=BG3, fg=TEXT2,
                                       relief="flat", font=("Arial",10), cursor="hand2",
                                       command=lambda: self._switch_mode("edit"), pady=7)
        self.edit_tab_btn.pack(side="left", fill="x", expand=True)

        # Content frame
        self.left_content = tk.Frame(self.left, bg=BG2)
        self.left_content.pack(fill="both", expand=True)
        self._build_ai_panel()

    def _switch_mode(self, mode):
        self.mode = mode
        for w in self.left_content.winfo_children(): w.destroy()
        if mode == "ai":
            self.ai_tab_btn.configure(bg=ACCENT, fg="#000", font=("Arial",10,"bold"))
            self.edit_tab_btn.configure(bg=BG3, fg=TEXT2, font=("Arial",10))
            self._build_ai_panel()
        else:
            self.ai_tab_btn.configure(bg=BG3, fg=TEXT2, font=("Arial",10))
            self.edit_tab_btn.configure(bg=ACCENT, fg="#000", font=("Arial",10,"bold"))
            self._build_edit_panel()

    def _build_ai_panel(self):
        f = self.left_content

        # Title
        tk.Label(f, text="✨ AI WEBOLDAL GENERÁTOR", bg=BG2, fg=ACCENT,
                 font=("Arial",10,"bold"), pady=10).pack(fill="x", padx=12)

        # Prompt area
        tk.Label(f, text="Írd le milyen weboldalt szeretnél:", bg=BG2, fg=TEXT2,
                 font=("Arial",10)).pack(anchor="w", padx=12)
        self.prompt_text = tk.Text(f, height=8, bg=BG3, fg=TEXT, insertbackground=TEXT,
                                    relief="flat", font=("Arial",11), wrap="word",
                                    padx=10, pady=8)
        self.prompt_text.pack(fill="x", padx=8, pady=(4,8))
        self.prompt_text.insert("1.0", "Hozz létre egy modern olaj kereskedő cég weboldalt. Legyen hero szekció, termékek, rólunk szekció és kapcsolati form.")

        # Generate button
        self.gen_btn = tk.Button(f, text="✨ Weboldal generálása", bg=ACCENT, fg="#000",
                                  relief="flat", font=("Arial",11,"bold"), command=self._generate,
                                  cursor="hand2", pady=10)
        self.gen_btn.pack(fill="x", padx=8, pady=(0,4))

        # Progress
        self.gen_status = tk.Label(f, text="", bg=BG2, fg=TEXT2, font=("Arial",9), wraplength=260)
        self.gen_status.pack(padx=12)
        self.gen_bar = ttk.Progressbar(f, mode="indeterminate", length=260)
        self.gen_bar.pack(padx=12, pady=4)

        tk.Frame(f, bg=BORDER, height=1).pack(fill="x", padx=8, pady=8)

        # Examples
        tk.Label(f, text="PÉLDÁK — kattints a betöltéshez:", bg=BG2, fg=TEXT2,
                 font=("Arial",9,"bold")).pack(anchor="w", padx=12, pady=(0,4))
        for ex in AI_EXAMPLES:
            btn = tk.Button(f, text=ex, bg=BG3, fg=TEXT2, relief="flat",
                            font=("Arial",9), cursor="hand2", wraplength=260,
                            justify="left", padx=8, pady=5,
                            command=lambda e=ex: self._load_example(e))
            btn.pack(fill="x", padx=8, pady=1)
            btn.bind("<Enter>", lambda ev, b=btn: b.configure(bg=BG4))
            btn.bind("<Leave>", lambda ev, b=btn: b.configure(bg=BG3))

        tk.Frame(f, bg=BORDER, height=1).pack(fill="x", padx=8, pady=8)

        # AI Edit
        tk.Label(f, text="AI SZERKESZTÉS:", bg=BG2, fg=TEXT2, font=("Arial",9,"bold")).pack(anchor="w", padx=12)
        self.edit_prompt = tk.Text(f, height=3, bg=BG3, fg=TEXT, insertbackground=TEXT,
                                    relief="flat", font=("Arial",10), wrap="word", padx=8, pady=6)
        self.edit_prompt.pack(fill="x", padx=8, pady=(4,4))
        self.edit_prompt.insert("1.0", "Változtasd meg a háttér színét sötétkékre")
        tk.Button(f, text="✏️ AI Szerkesztés alkalmazása", bg=BG3, fg=TEXT,
                  relief="flat", font=("Arial",10), command=self._ai_edit,
                  cursor="hand2", pady=7).pack(fill="x", padx=8, pady=(0,8))

        # Bottom buttons
        tk.Frame(f, bg=BORDER, height=1).pack(fill="x", padx=8, pady=4)
        tk.Button(f, text="🚀 Feltöltés Firebase-re  F5", bg="#1a3a1a", fg=GREEN,
                  relief="flat", font=("Arial",10,"bold"), command=self.deploy,
                  cursor="hand2", pady=8).pack(fill="x", padx=8, pady=2)
        tk.Button(f, text="⬇ HTML Export", bg=BG3, fg=TEXT, relief="flat",
                  font=("Arial",10), command=self.export_html, cursor="hand2", pady=6).pack(fill="x", padx=8, pady=2)
        tk.Button(f, text="💾 Mentés", bg=BG3, fg=TEXT, relief="flat",
                  font=("Arial",10), command=self.save_project, cursor="hand2", pady=6).pack(fill="x", padx=8, pady=2)

    def _build_edit_panel(self):
        f = self.left_content

        tk.Label(f, text="ELEMEK HOZZÁADÁSA", bg=BG2, fg=TEXT2,
                 font=("Arial",9,"bold"), pady=8).pack(fill="x", padx=12)
        tk.Label(f, text="Húzd a vászonra vagy kattints", bg=BG2, fg=TEXT2,
                 font=("Arial",8)).pack(anchor="w", padx=12, pady=(0,6))

        # Scrollable element list
        canvas = tk.Canvas(f, bg=BG2, highlightthickness=0)
        sb = ttk.Scrollbar(f, orient="vertical", command=canvas.yview)
        canvas.configure(yscrollcommand=sb.set)
        sb.pack(side="right", fill="y")
        canvas.pack(fill="both", expand=True)
        inner = tk.Frame(canvas, bg=BG2)
        canvas.create_window((0,0), window=inner, anchor="nw")

        for group, types in ELEM_GROUPS.items():
            tk.Label(inner, text=group.upper(), bg=BG2, fg=TEXT2,
                     font=("Arial",8,"bold"), pady=4).pack(fill="x", padx=8)
            for etype in types:
                info = ELEM_TYPES[etype]
                fr = tk.Frame(inner, bg=BG3, cursor="hand2")
                fr.pack(fill="x", padx=6, pady=1)
                row = tk.Frame(fr, bg=BG3)
                row.pack(fill="x", padx=8, pady=5)
                ic = tk.Label(row, text=info["icon"], bg=BG3, fg=info["color"],
                              font=("Arial",9,"bold"), width=5, anchor="w")
                ic.pack(side="left")
                nm = tk.Label(row, text=info["label"], bg=BG3, fg=TEXT, font=("Arial",10))
                nm.pack(side="left", padx=2)

                def make(et, b, r, i, n):
                    hi = lambda e, b=b, r=r, i=i, n=n: (b.configure(bg=BG4), r.configure(bg=BG4), i.configure(bg=BG4), n.configure(bg=BG4))
                    ho = lambda e, b=b, r=r, i=i, n=n: (b.configure(bg=BG3), r.configure(bg=BG3), i.configure(bg=BG3), n.configure(bg=BG3))
                    fn = lambda e=None, t=et: self._insert_element_html(t)
                    for w in [b,r,i,n]:
                        w.bind("<Button-1>", fn)
                        w.bind("<Enter>", hi)
                        w.bind("<Leave>", ho)
                make(etype, fr, row, ic, nm)

        inner.update_idletasks()
        canvas.configure(scrollregion=canvas.bbox("all"))

        tk.Frame(f, bg=BORDER, height=1).pack(fill="x", padx=8, pady=6)
        tk.Button(f, text="🚀 Firebase feltöltés", bg="#1a3a1a", fg=GREEN,
                  relief="flat", font=("Arial",10,"bold"), command=self.deploy,
                  cursor="hand2", pady=7).pack(fill="x", padx=8, pady=2)
        tk.Button(f, text="⬇ HTML Export", bg=BG3, fg=TEXT, relief="flat",
                  font=("Arial",10), command=self.export_html, cursor="hand2", pady=5).pack(fill="x", padx=8, pady=2)

    def _build_center(self, parent):
        # Toolbar
        tb = tk.Frame(parent, bg=BG2, pady=6)
        tb.pack(fill="x")
        tk.Label(tb, text="ELŐNÉZET", bg=BG2, fg=TEXT2, font=("Arial",9,"bold")).pack(side="left", padx=12)
        self.preview_url_lbl = tk.Label(tb, text="", bg=BG2, fg=TEXT2, font=("Arial",9))
        self.preview_url_lbl.pack(side="left")
        tk.Button(tb, text="↻ Frissítés", bg=BG3, fg=TEXT, relief="flat",
                  font=("Arial",9), command=self._refresh_preview, cursor="hand2",
                  padx=10, pady=3).pack(side="right", padx=4)
        tk.Button(tb, text="🌐 Megnyitás böngészőben", bg=BG3, fg=TEXT, relief="flat",
                  font=("Arial",9), command=self._open_in_browser, cursor="hand2",
                  padx=10, pady=3).pack(side="right", padx=4)
        self.status_lbl = tk.Label(tb, text="Generálj egy weboldalt az AI-val!", bg=BG2, fg=TEXT2, font=("Arial",9))
        self.status_lbl.pack(side="right", padx=12)

        # HTML preview using tkinter Canvas (simple) + write to temp file
        preview_frame = tk.Frame(parent, bg=BG3)
        preview_frame.pack(fill="both", expand=True)

        # HTML source editor (for direct editing)
        self.html_editor_frame = tk.Frame(preview_frame, bg=BG)
        self.html_editor_frame.pack(fill="both", expand=True)

        # Notebook for preview/code tabs
        self.nb = ttk.Notebook(self.html_editor_frame)
        self.nb.pack(fill="both", expand=True)

        # Preview tab (using label to show HTML info)
        preview_tab = tk.Frame(self.nb, bg="#1a1a1a")
        self.nb.add(preview_tab, text=" 🌐 Előnézet ")

        self.preview_info = tk.Label(preview_tab, 
                                      text="✨ Generálj egy weboldalt az AI-val!\n\nVagy tölts be egy projektet.",
                                      bg="#1a1a1a", fg="#666", font=("Arial",14),
                                      justify="center")
        self.preview_info.pack(expand=True)

        self.open_browser_btn = tk.Button(preview_tab, text="🌐 Megnyitás böngészőben",
                                           bg=ACCENT, fg="#000", relief="flat",
                                           font=("Arial",12,"bold"), command=self._open_in_browser,
                                           cursor="hand2", pady=10, state="disabled")
        self.open_browser_btn.pack(pady=10)

        # Code tab
        code_tab = tk.Frame(self.nb, bg=BG)
        self.nb.add(code_tab, text=" </> HTML Kód ")

        code_scroll = tk.Scrollbar(code_tab)
        code_scroll.pack(side="right", fill="y")
        self.code_editor = tk.Text(code_tab, bg="#0d1117", fg="#e6edf3",
                                    insertbackground="#e6edf3", relief="flat",
                                    font=("Consolas",10), wrap="none",
                                    yscrollcommand=code_scroll.set,
                                    xscrollcommand=None)
        self.code_editor.pack(fill="both", expand=True)
        code_scroll.configure(command=self.code_editor.yview)

        hscroll = tk.Scrollbar(code_tab, orient="horizontal", command=self.code_editor.xview)
        hscroll.pack(side="bottom", fill="x")
        self.code_editor.configure(xscrollcommand=hscroll.set)

        # Apply code button
        apply_frame = tk.Frame(code_tab, bg=BG2)
        apply_frame.pack(fill="x")
        tk.Button(apply_frame, text="✓ Kód alkalmazása", bg=GREEN, fg="#000",
                  relief="flat", font=("Arial",10,"bold"), cursor="hand2",
                  command=self._apply_code, pady=6).pack(side="left", padx=8, pady=6)
        tk.Button(apply_frame, text="↩ Visszavonás", bg=BG3, fg=TEXT,
                  relief="flat", font=("Arial",10), cursor="hand2",
                  command=self.undo, pady=6).pack(side="left", padx=4, pady=6)

    def _build_right(self):
        tk.Label(self.right, text="GYORS SZERKESZTÉS", bg=BG2, fg=TEXT2,
                 font=("Arial",9,"bold"), pady=10).pack(fill="x", padx=12)
        tk.Frame(self.right, bg=BORDER, height=1).pack(fill="x")

        sf = tk.Frame(self.right, bg=BG2)
        sf.pack(fill="both", expand=True, padx=8, pady=8)

        # Quick AI edits
        tk.Label(sf, text="GYORS AI MÓDOSÍTÁSOK", bg=BG2, fg=TEXT2,
                 font=("Arial",8,"bold"), pady=4).pack(fill="x")

        quick_edits = [
            ("🎨 Sötét téma", "Változtasd az egész oldal témáját sötétre, fekete háttérrel"),
            ("☀️ Világos téma", "Változtasd az egész oldal témáját világosra, fehér háttérrel"),
            ("🔵 Kék téma", "Változtasd az oldal fő színét modern kékre (#2563eb)"),
            ("💚 Zöld téma", "Változtasd az oldal fő színét élénk zöldre"),
            ("📱 Mobilbarát", "Tedd teljesen reszponzívvá az oldalt mobilra"),
            ("✨ Animációk", "Adj CSS fade-in animációkat minden szekcióhoz"),
            ("🔤 Nagy betűk", "Növeld meg az összes szöveg méretét 20%-kal"),
            ("📦 Több termék", "Adj hozzá 3 új termék kártyát a meglévők mellé"),
            ("📞 Kapcsolat", "Adj hozzá egy szép kapcsolati form szekciót az oldalra"),
            ("⭐ Értékelések", "Adj hozzá vásárlói vélemény szekciókat 5 csillagos értékelésekkel"),
        ]

        for label, prompt in quick_edits:
            btn = tk.Button(sf, text=label, bg=BG3, fg=TEXT, relief="flat",
                            font=("Arial",10), cursor="hand2", anchor="w",
                            padx=10, pady=5,
                            command=lambda p=prompt: self._quick_edit(p))
            btn.pack(fill="x", pady=1)
            btn.bind("<Enter>", lambda e, b=btn: b.configure(bg=BG4))
            btn.bind("<Leave>", lambda e, b=btn: b.configure(bg=BG3))

        tk.Frame(sf, bg=BORDER, height=1).pack(fill="x", pady=8)

        # Page settings
        tk.Label(sf, text="OLDAL BEÁLLÍTÁSOK", bg=BG2, fg=TEXT2,
                 font=("Arial",8,"bold"), pady=2).pack(fill="x")

        # Page title
        tk.Label(sf, text="Oldal cím:", bg=BG2, fg=TEXT2, font=("Arial",10)).pack(anchor="w")
        self.page_title_var = tk.StringVar(value="OilTrade")
        tk.Entry(sf, textvariable=self.page_title_var, bg=BG3, fg=TEXT,
                 insertbackground=TEXT, relief="flat", font=("Arial",10)).pack(fill="x", pady=(2,8))

        # Background color
        bf = tk.Frame(sf, bg=BG2)
        bf.pack(fill="x", pady=2)
        tk.Label(bf, text="Háttér:", bg=BG2, fg=TEXT2, font=("Arial",10)).pack(side="left")
        self.bg_btn = tk.Button(bf, bg="#ffffff", width=3, relief="flat", cursor="hand2",
                                 command=self._pick_bg_color)
        self.bg_btn.pack(side="right")

        tk.Frame(sf, bg=BORDER, height=1).pack(fill="x", pady=8)
        tk.Label(sf, text=f"👤 {self.user['email']}", bg=BG2, fg=TEXT2,
                 font=("Arial",8), wraplength=240).pack()

    # ── CORE FUNCTIONS ────────────────────────────────────────────────────────
    def _load_example(self, text):
        self.prompt_text.delete("1.0", "end")
        self.prompt_text.insert("1.0", text)

    def _generate(self):
        prompt = self.prompt_text.get("1.0","end-1c").strip()
        if not prompt: return
        self.gen_btn.configure(state="disabled", text="Generálás...")
        self.gen_bar.start(12)
        self.gen_status.configure(text="")

        def run():
            def cb(msg): self.root.after(0, lambda: self.gen_status.configure(text=msg))
            html, err = generate_website_with_ai(prompt, cb)
            def done():
                self.gen_bar.stop()
                self.gen_btn.configure(state="normal", text="✨ Weboldal generálása")
                if html:
                    self.save_undo()
                    self.html_content = html
                    self._update_preview()
                    self.status_lbl.configure(text="✅ Weboldal generálva!")
                    self.gen_status.configure(text="Kész! Megnyithatod böngészőben.")
                else:
                    self.gen_status.configure(text=f"Hiba: {err}")
            self.root.after(0, done)
        threading.Thread(target=run, daemon=True).start()

    def _ai_edit(self):
        if not self.html_content:
            messagebox.showwarning("Figyelem", "Először generálj egy weboldalt!")
            return
        instruction = self.edit_prompt.get("1.0","end-1c").strip()
        if not instruction: return

        self.gen_bar.start(12)
        self.gen_status.configure(text="AI szerkesztés...")

        def run():
            html, err = ai_edit_element(self.html_content, instruction)
            def done():
                self.gen_bar.stop()
                if html:
                    self.save_undo()
                    self.html_content = html
                    self._update_preview()
                    self.gen_status.configure(text="✅ Szerkesztés alkalmazva!")
                else:
                    self.gen_status.configure(text=f"Hiba: {err}")
            self.root.after(0, done)
        threading.Thread(target=run, daemon=True).start()

    def _quick_edit(self, prompt):
        if not self.html_content:
            messagebox.showwarning("Figyelem", "Először generálj egy weboldalt!")
            return
        self.gen_bar.start(12)
        self.status_lbl.configure(text="AI módosítás...")

        def run():
            html, err = ai_edit_element(self.html_content, prompt)
            def done():
                self.gen_bar.stop()
                if html:
                    self.save_undo()
                    self.html_content = html
                    self._update_preview()
                    self.status_lbl.configure(text="✅ Módosítás kész!")
                else:
                    self.status_lbl.configure(text=f"Hiba: {err}")
            self.root.after(0, done)
        threading.Thread(target=run, daemon=True).start()

    def _insert_element_html(self, etype):
        """Insert a pre-made HTML element into the current page."""
        if not self.html_content:
            messagebox.showwarning("Figyelem", "Először generálj egy weboldalt!")
            return
        snippets = {
            "text": '<p style="font-size:16px;color:#333;line-height:1.6;margin:16px 0">Szöveg ide...</p>',
            "heading": '<h1 style="font-size:42px;font-weight:900;color:#111;margin:24px 0">Nagy Fejléc</h1>',
            "heading2": '<h2 style="font-size:28px;font-weight:700;color:#333;margin:20px 0">Alfejléc</h2>',
            "button": '<a href="#" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px">Gomb szöveg</a>',
            "divider": '<hr style="border:none;border-top:2px solid #e2e8f0;margin:32px 0"/>',
            "spacer": '<div style="height:60px"></div>',
            "product": '''<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
  <div style="background:#f1f5f9;height:200px;border-radius:10px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:48px">📦</div>
  <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">Termék neve</h3>
  <p style="color:#666;font-size:13px;margin-bottom:12px">Termék leírása ide...</p>
  <div style="display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:22px;font-weight:800;color:#2563eb">4 990 Ft</span>
    <button style="background:#2563eb;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-weight:600;cursor:pointer">Kosárba</button>
  </div>
</div>''',
            "subscribe": '''<div style="background:#eff6ff;border-radius:16px;padding:32px;text-align:center">
  <h3 style="font-size:22px;font-weight:700;margin-bottom:8px">Iratkozz fel!</h3>
  <p style="color:#666;margin-bottom:16px">Kapj értesítést az új ajánlatokról</p>
  <form style="display:flex;gap:8px;max-width:400px;margin:0 auto">
    <input type="email" placeholder="Email cím..." style="flex:1;padding:12px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px"/>
    <button type="submit" style="background:#2563eb;color:#fff;border:none;padding:12px 20px;border-radius:8px;font-weight:600;cursor:pointer">Feliratkozás</button>
  </form>
</div>''',
        }
        snippet = snippets.get(etype, f'<div style="padding:20px;background:#f8fafc;border-radius:8px;margin:16px 0">{ELEM_TYPES[etype]["label"]}</div>')
        instruction = f"Adj hozzá a következő HTML elemet a <body> végéhez, az utolsó szekció után, de a footer elé: {snippet}"
        self._quick_edit(instruction)

    def _update_preview(self):
        """Update the code editor and preview info."""
        if self.html_content:
            # Update code editor
            self.code_editor.delete("1.0", "end")
            self.code_editor.insert("1.0", self.html_content)

            # Update preview info
            lines = len(self.html_content.split('\n'))
            size = len(self.html_content) // 1024
            self.preview_info.configure(
                text=f"✅ Weboldal generálva!\n\n{lines} sor • ~{size} KB\n\nNyisd meg böngészőben az előnézethez.",
                fg=GREEN
            )
            self.open_browser_btn.configure(state="normal")
            self.status_lbl.configure(text=f"{lines} sor HTML")
        else:
            self.preview_info.configure(text="Nincs tartalom.", fg=TEXT2)

    def _refresh_preview(self):
        if self.html_content:
            self._open_in_browser()

    def _open_in_browser(self):
        if not self.html_content:
            messagebox.showwarning("Figyelem", "Nincs tartalom!")
            return
        import tempfile, os
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
            f.write(self.html_content)
            path = f.name
        webbrowser.open(f"file:///{path}")

    def _apply_code(self):
        """Apply changes from code editor."""
        self.save_undo()
        self.html_content = self.code_editor.get("1.0","end-1c")
        self._update_preview()
        self.status_lbl.configure(text="✅ Kód alkalmazva!")

    def _pick_bg_color(self):
        color = colorchooser.askcolor()[1]
        if color and self.html_content:
            self.bg_btn.configure(bg=color)
            self._quick_edit(f"Változtasd az oldal háttérszínét erre: {color}")

    def save_undo(self):
        self.undo_stack.append(self.html_content)
        if len(self.undo_stack) > 20: self.undo_stack.pop(0)

    def undo(self):
        if self.undo_stack:
            self.html_content = self.undo_stack.pop()
            self._update_preview()
            self.status_lbl.configure(text="↩ Visszavonva")

    def new_project(self):
        if messagebox.askyesno("Új projekt","Elvesznek a változtatások. Biztosan?"):
            self.html_content = ""
            self.undo_stack = []
            self.project_path = None
            self._update_preview()
            self.preview_info.configure(text="✨ Generálj egy weboldalt az AI-val!", fg=TEXT2)

    def save_project(self, e=None):
        if not self.project_path:
            self.project_path = filedialog.asksaveasfilename(
                defaultextension=".oilweb3",
                filetypes=[("OilTrade WebEditor","*.oilweb3"),("JSON","*.json")])
        if self.project_path:
            data = {"version":"1.8","html":self.html_content}
            with open(self.project_path,"w",encoding="utf-8") as f:
                json.dump(data,f,ensure_ascii=False)
            messagebox.showinfo("Mentés","✅ Mentve!")

    def open_project(self, e=None):
        path = filedialog.askopenfilename(
            filetypes=[("OilTrade projekt","*.oilweb3 *.oilweb *.json"),("HTML","*.html")])
        if not path: return
        if path.endswith(".html"):
            with open(path,"r",encoding="utf-8") as f:
                self.html_content = f.read()
        else:
            with open(path,"r",encoding="utf-8") as f:
                data = json.load(f)
            self.html_content = data.get("html","")
        self.project_path = path
        self._update_preview()

    def export_html(self):
        if not self.html_content:
            messagebox.showwarning("Figyelem","Nincs tartalom!"); return
        path = filedialog.asksaveasfilename(defaultextension=".html",
                                            filetypes=[("HTML","*.html")])
        if not path: return
        with open(path,"w",encoding="utf-8") as f:
            f.write(self.html_content)
        if messagebox.askyesno("Export kész!","Megnyitod böngészőben?"):
            webbrowser.open(f"file:///{path}")

    def deploy(self, e=None):
        if not self.html_content:
            messagebox.showwarning("Figyelem","Nincs tartalom!"); return
        win = tk.Toplevel(self.root)
        win.title("Firebase Hosting")
        win.geometry("440x300")
        win.configure(bg=BG)
        win.resizable(False,False)
        win.grab_set()
        tk.Label(win,text="🚀 Firebase Hosting feltöltés",bg=BG,fg=TEXT,
                 font=("Arial",14,"bold"),pady=14).pack()
        tk.Label(win,text=HOSTING_URL,bg=BG,fg=TEXT2,font=("Arial",10)).pack()
        prog = tk.Label(win,text="Előkészítés...",bg=BG,fg=TEXT2,font=("Arial",11),pady=14)
        prog.pack()
        bar = ttk.Progressbar(win,mode="indeterminate",length=380)
        bar.pack(pady=4)
        status = tk.Label(win,text="",bg=BG,fg=GREEN,font=("Arial",10),wraplength=400)
        status.pack(pady=8)
        open_btn = tk.Button(win,text="🌐 Megnyitás telefonon / böngészőben",
                             bg=GREEN,fg="#000",relief="flat",font=("Arial",11,"bold"),
                             pady=8,command=lambda:webbrowser.open(HOSTING_URL),
                             state="disabled",cursor="hand2")
        open_btn.pack(padx=20,fill="x")
        bar.start(12)
        html = self.html_content

        def run():
            def cb(msg): win.after(0, lambda: prog.configure(text=msg))
            ok, result = hosting_deploy(html, cb)
            def done():
                bar.stop()
                if ok:
                    status.configure(text=f"✅ Sikeresen feltöltve!\n{result}",fg=GREEN)
                    open_btn.configure(state="normal")
                    prog.configure(text="Kész!")
                else:
                    status.configure(text=f"❌ Hiba: {result}",fg=RED)
            win.after(0,done)
        threading.Thread(target=run,daemon=True).start()

# ── ENTRY ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    login = LoginWindow()
    if login.result:
        WebEditor(login.result)
