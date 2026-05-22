#!/usr/bin/env python3
"""
OilTrade WebEditor v2.1 - Animated Edition
- Smooth fade/slide animációk
- Gemini 2.5 Flash AI
- Webshop builder
- Firebase deploy
"""

import tkinter as tk
from tkinter import ttk, colorchooser, filedialog, messagebox
import json, base64, webbrowser, threading, copy, urllib.request, urllib.parse, urllib.error, re, os, math

GEMINI_API_KEY      = "AIzaSyCibWEomPg12Nm_F4Vv-NhZtaWQPzk_O_k"
GEMINI_MODEL        = "gemini-2.5-flash"
FIREBASE_API_KEY    = "AIzaSyD4syP6lOeg5JZCnTct4X_NoAhZN4TiDH4"
FIREBASE_PROJECT_ID = "oiltrade-3"
CI_TOKEN            = "1//03C5sWeP9Fi3iCgYIARAAGAMSNwF-L9IrsOuS-jfyK0yCkYHCzgunq6UAJJzGXTUbAmO6IILXxLF_rwoILaENZRENqrS19feMijA"
HOSTING_URL         = f"https://{FIREBASE_PROJECT_ID}.web.app"

# Colors
BG="#09090b"; BG2="#111113"; BG3="#1c1c1f"; BG4="#28282d"; BG5="#333338"
ACCENT="#6366f1"; ACCENT2="#818cf8"; ACCENT3="#4f46e5"
GREEN="#22c55e"; RED="#ef4444"; ORANGE="#f97316"; GOLD="#eab308"; PURPLE="#a855f7"
TEXT="#fafafa"; TEXT2="#a1a1aa"; TEXT3="#52525b"
BORDER="#2a2a30"

# ── ANIMATION ENGINE ──────────────────────────────────────────────────────────
class Animator:
    """Smooth animation engine for tkinter widgets."""
    def __init__(self, root):
        self.root = root
        self.animations = []
        self._running = True
        self._tick()

    def _tick(self):
        if not self._running: return
        now_anims = []
        for anim in self.animations:
            if anim.step():
                now_anims.append(anim)
        self.animations = now_anims
        self.root.after(16, self._tick)  # ~60fps

    def add(self, anim):
        self.animations.append(anim)
        return anim

    def stop(self):
        self._running = False

class FadeAnim:
    """Fade a widget in or out by changing background color."""
    def __init__(self, widget, from_color, to_color, duration=300, on_done=None):
        self.widget = widget
        self.from_rgb = self._hex_to_rgb(from_color)
        self.to_rgb = self._hex_to_rgb(to_color)
        self.duration = duration
        self.elapsed = 0
        self.on_done = on_done
        self.done = False

    def _hex_to_rgb(self, h):
        h = h.lstrip("#")
        return tuple(int(h[i:i+2],16) for i in (0,2,4))

    def _rgb_to_hex(self, r,g,b):
        return f"#{int(r):02x}{int(g):02x}{int(b):02x}"

    def _ease(self, t):
        return t * t * (3 - 2*t)  # smoothstep

    def step(self):
        if self.done: return False
        self.elapsed += 16
        t = min(self.elapsed / self.duration, 1.0)
        e = self._ease(t)
        r = self.from_rgb[0] + (self.to_rgb[0]-self.from_rgb[0])*e
        g = self.from_rgb[1] + (self.to_rgb[1]-self.from_rgb[1])*e
        b = self.from_rgb[2] + (self.to_rgb[2]-self.from_rgb[2])*e
        color = self._rgb_to_hex(r,g,b)
        try:
            self.widget.configure(bg=color)
        except: pass
        if t >= 1.0:
            self.done = True
            if self.on_done: self.on_done()
            return False
        return True

class SlideAnim:
    """Slide a widget by changing its position."""
    def __init__(self, widget, from_y, to_y, duration=350, on_done=None):
        self.widget = widget
        self.from_y = from_y
        self.to_y = to_y
        self.duration = duration
        self.elapsed = 0
        self.on_done = on_done

    def _ease_out(self, t):
        return 1 - (1-t)**3

    def step(self):
        self.elapsed += 16
        t = min(self.elapsed/self.duration, 1.0)
        e = self._ease_out(t)
        y = self.from_y + (self.to_y-self.from_y)*e
        try:
            self.widget.place(y=y)
        except: pass
        if t >= 1.0:
            if self.on_done: self.on_done()
            return False
        return True

class PulseAnim:
    """Pulse a canvas item color."""
    def __init__(self, canvas, item, color1, color2, speed=2000):
        self.canvas = canvas
        self.item = item
        self.c1 = self._hex_to_rgb(color1)
        self.c2 = self._hex_to_rgb(color2)
        self.speed = speed
        self.t = 0

    def _hex_to_rgb(self, h):
        h = h.lstrip("#")
        return tuple(int(h[i:i+2],16) for i in (0,2,4))

    def _rgb_to_hex(self, r,g,b):
        return f"#{int(r):02x}{int(g):02x}{int(b):02x}"

    def step(self):
        self.t += 16
        phase = (math.sin(self.t/self.speed*math.pi*2)+1)/2
        r = self.c1[0]+(self.c2[0]-self.c1[0])*phase
        g = self.c1[1]+(self.c2[1]-self.c1[1])*phase
        b = self.c1[2]+(self.c2[2]-self.c1[2])*phase
        color = self._rgb_to_hex(r,g,b)
        try:
            self.canvas.itemconfig(self.item, fill=color)
        except: pass
        return True  # never stops

class SpinnerCanvas(tk.Canvas):
    """Animated spinning loader."""
    def __init__(self, parent, size=40, color=ACCENT, **kw):
        super().__init__(parent, width=size, height=size, bg=BG3,
                         highlightthickness=0, **kw)
        self.size = size
        self.color = color
        self.angle = 0
        self._running = False
        self._draw()

    def _draw(self):
        self.delete("all")
        cx = cy = self.size/2
        r = self.size/2 - 4
        # Background circle
        self.create_oval(4,4,self.size-4,self.size-4,
                         outline=BG4, width=3)
        # Arc
        start = self.angle
        self.create_arc(4,4,self.size-4,self.size-4,
                        start=start, extent=270,
                        outline=self.color, width=3, style="arc")
        # Glow dot
        dot_angle = math.radians(start+270)
        dx = cx + r*math.cos(dot_angle)
        dy = cy - r*math.sin(dot_angle)
        self.create_oval(dx-4,dy-4,dx+4,dy+4,fill=self.color,outline="")

    def start(self):
        self._running = True
        self._spin()

    def stop(self):
        self._running = False

    def _spin(self):
        if not self._running: return
        self.angle = (self.angle + 6) % 360
        self._draw()
        self.after(16, self._spin)

class AnimatedButton(tk.Button):
    """Button with hover animation."""
    def __init__(self, parent, normal_bg=BG3, hover_bg=BG4,
                 normal_fg=TEXT2, hover_fg=TEXT, **kw):
        self.normal_bg = normal_bg
        self.hover_bg = hover_bg
        self.normal_fg = normal_fg
        self.hover_fg = hover_fg
        super().__init__(parent, bg=normal_bg, fg=normal_fg,
                         activebackground=hover_bg, activeforeground=hover_fg,
                         relief="flat", cursor="hand2", **kw)
        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)

    def _on_enter(self, e):
        self.configure(bg=self.hover_bg, fg=self.hover_fg)

    def _on_leave(self, e):
        self.configure(bg=self.normal_bg, fg=self.normal_fg)

class GlowButton(tk.Button):
    """Primary button with glow effect."""
    def __init__(self, parent, **kw):
        super().__init__(parent, bg=ACCENT, fg="#fff",
                         activebackground=ACCENT2, activeforeground="#fff",
                         relief="flat", cursor="hand2", **kw)
        self.bind("<Enter>", lambda e: self.configure(bg=ACCENT2))
        self.bind("<Leave>", lambda e: self.configure(bg=ACCENT))
        self.bind("<ButtonPress>", lambda e: self.configure(bg=ACCENT3))
        self.bind("<ButtonRelease>", lambda e: self.configure(bg=ACCENT2))

# ── PROGRESS BAR ──────────────────────────────────────────────────────────────
class AnimatedProgressBar(tk.Canvas):
    """Smooth animated progress bar with glow."""
    def __init__(self, parent, height=6, **kw):
        super().__init__(parent, height=height, bg=BG3,
                         highlightthickness=0, **kw)
        self._progress = 0
        self._target = 0
        self._indeterminate = False
        self._ind_pos = 0
        self._running = False
        self.bind("<Configure>", lambda e: self._draw())

    def _draw(self):
        self.delete("all")
        w = self.winfo_width()
        h = self.winfo_height()
        if w <= 1: return
        # Background
        self.create_rectangle(0,0,w,h, fill=BG4, outline="")
        if self._indeterminate:
            bar_w = w*0.35
            x = self._ind_pos
            self.create_rectangle(max(0,x),0,min(w,x+bar_w),h, fill=ACCENT, outline="")
            # Glow
            if x > 0:
                self.create_rectangle(max(0,x-20),0,max(0,x),h, fill=ACCENT3, outline="")
        else:
            bar_w = w * self._progress
            if bar_w > 0:
                self.create_rectangle(0,0,bar_w,h, fill=ACCENT, outline="")
                # Shine
                self.create_rectangle(0,0,bar_w,h//3, fill=ACCENT2, outline="")

    def start_indeterminate(self):
        self._indeterminate = True
        self._running = True
        self._animate_ind()

    def stop(self):
        self._indeterminate = False
        self._running = False
        self._draw()

    def _animate_ind(self):
        if not self._running: return
        w = self.winfo_width()
        self._ind_pos = (self._ind_pos + 8) % (w + w*0.35)
        self._draw()
        self.after(16, self._animate_ind)

    def set_progress(self, v):
        self._progress = max(0, min(1, v))
        self._draw()

# ── GEMINI AI ─────────────────────────────────────────────────────────────────
def call_gemini(prompt, max_tokens=8192):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    data = json.dumps({
        "contents":[{"parts":[{"text":prompt}]}],
        "generationConfig":{"temperature":0.7,"maxOutputTokens":max_tokens}
    }).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req, timeout=90) as r:
        resp = json.loads(r.read())
    text = resp["candidates"][0]["content"]["parts"][0]["text"]
    text = re.sub(r"```html\n?","",text)
    text = re.sub(r"```\n?","",text)
    return text.strip()

def generate_website(prompt, site_type="webstore", progress_cb=None):
    if progress_cb: progress_cb("Gemini 2.5 Flash feldolgozza...", 0.1)
    extras = ""
    if site_type == "webstore":
        extras = """
WEBSTORE: sticky navbar kosárral, hero CTA, termék kártyák hover effekttel,
kosár sidebar slide-in, checkout Google Pay-el, rendelés visszaigazolás modal,
localStorage kosár, smooth scroll."""
    full = f"""Profi webdesigner vagy. Generálj TELJES működő HTML weboldalt.
{extras}
KÖVETELMÉNYEK: glassmorphism design, Google Fonts Inter, CSS animációk fadeIn/slideUp,
hover effektek, rounded corners 12-16px, box shadow, gradient szövegek,
reszponzív grid, MŰKÖDŐ JavaScript, CSAK HTML kódot adj vissza!
KÉRÉS: {prompt}"""
    if progress_cb: progress_cb("Weboldal generálása... (30-60mp)", 0.3)
    html = call_gemini(full)
    if progress_cb: progress_cb("Kész!", 1.0)
    return html

def ai_edit(html, instruction, progress_cb=None):
    if progress_cb: progress_cb("AI szerkesztés...", 0.2)
    full = f"""Módosítsd ezt a HTML weboldalt:
INSTRUKCIÓ: {instruction}
HTML: {html[:3000]}
Adj vissza CSAK teljes módosított HTML-t!"""
    result = call_gemini(full)
    if progress_cb: progress_cb("Kész!", 1.0)
    return result

# ── FIREBASE ──────────────────────────────────────────────────────────────────
def firebase_login(email, password):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
    data = json.dumps({"email":email,"password":password,"returnSecureToken":True}).encode()
    req = urllib.request.Request(url,data=data,headers={"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            resp = json.loads(r.read())
            return resp.get("idToken"),resp.get("email"),None
    except urllib.error.HTTPError as e:
        try: err=json.loads(e.read()).get("error",{}).get("message","Hiba")
        except: err="Kapcsolati hiba"
        return None,None,err
    except Exception as e: return None,None,str(e)

def get_access_token():
    url = "https://oauth2.googleapis.com/token"
    data = urllib.parse.urlencode({
        "grant_type":"refresh_token","refresh_token":CI_TOKEN,
        "client_id":"563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
        "client_secret":"j9iVZfS8ggCpz5YCkFQkQBxd",
    }).encode()
    req = urllib.request.Request(url,data=data,headers={"Content-Type":"application/x-www-form-urlencoded"})
    try:
        with urllib.request.urlopen(req) as r: return json.loads(r.read()).get("access_token")
    except: return None

def hosting_deploy(html, progress_cb=None):
    import hashlib
    try:
        if progress_cb: progress_cb("Token...",0.1)
        token = get_access_token()
        if not token: return False,"Token hiba"
        hdrs={"Authorization":f"Bearer {token}","Content-Type":"application/json"}
        if progress_cb: progress_cb("Verzió létrehozása...",0.3)
        url=f"https://firebasehosting.googleapis.com/v1beta1/sites/{FIREBASE_PROJECT_ID}/versions"
        req=urllib.request.Request(url,
            data=json.dumps({"config":{"headers":[{"glob":"**","headers":{"Cache-Control":"no-cache"}}]}}).encode(),
            headers=hdrs)
        with urllib.request.urlopen(req) as r: version=json.loads(r.read())
        vname=version["name"]
        html_bytes=html.encode("utf-8")
        sha=hashlib.sha256(html_bytes).hexdigest()
        req=urllib.request.Request(f"https://firebasehosting.googleapis.com/v1beta1/{vname}:populateFiles",
            data=json.dumps({"files":{"/index.html":sha}}).encode(),headers=hdrs)
        with urllib.request.urlopen(req) as r: pop=json.loads(r.read())
        upload_url=pop.get("uploadUrl","")
        if sha in pop.get("uploadRequiredHashes",[]) and upload_url:
            if progress_cb: progress_cb("Feltöltés...",0.6)
            req=urllib.request.Request(f"{upload_url}/{sha}",data=html_bytes,
                headers={"Authorization":f"Bearer {token}","Content-Type":"application/octet-stream"},method="POST")
            with urllib.request.urlopen(req): pass
        if progress_cb: progress_cb("Véglegesítés...",0.85)
        fhdrs=dict(hdrs); fhdrs["X-HTTP-Method-Override"]="PATCH"
        req=urllib.request.Request(f"https://firebasehosting.googleapis.com/v1beta1/{vname}?updateMask=status",
            data=json.dumps({"status":"FINALIZED"}).encode(),headers=fhdrs)
        with urllib.request.urlopen(req): pass
        req=urllib.request.Request(
            f"https://firebasehosting.googleapis.com/v1beta1/sites/{FIREBASE_PROJECT_ID}/releases?versionName={vname}",
            data=b"{}",headers=hdrs)
        with urllib.request.urlopen(req): pass
        if progress_cb: progress_cb("Kész!",1.0)
        return True,HOSTING_URL
    except Exception as e: return False,str(e)

# ── LOGIN WINDOW ──────────────────────────────────────────────────────────────
class LoginWindow:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("OilTrade WebEditor")
        self.root.geometry("440x580")
        self.root.configure(bg=BG)
        self.root.resizable(False,False)
        x=(self.root.winfo_screenwidth()-440)//2
        y=(self.root.winfo_screenheight()-580)//2
        self.root.geometry(f"440x580+{x}+{y}")
        self.result = None
        self.animator = Animator(self.root)
        self._build()
        self.root.mainloop()

    def _build(self):
        # Animated top bar
        self.top_bar = tk.Frame(self.root, bg=ACCENT, height=4)
        self.top_bar.pack(fill="x")

        # Main frame (will fade in)
        self.main_f = tk.Frame(self.root, bg=BG)
        self.main_f.pack(fill="both", expand=True)

        # Logo canvas with animation
        logo_frame = tk.Frame(self.main_f, bg=BG, pady=32)
        logo_frame.pack(fill="x")

        # Animated logo
        logo_canvas = tk.Canvas(logo_frame, width=80, height=80, bg=BG,
                                highlightthickness=0)
        logo_canvas.pack()
        self._animate_logo(logo_canvas)

        tk.Label(logo_frame, text="OilTrade WebEditor", bg=BG, fg=TEXT,
                 font=("Helvetica",20,"bold")).pack(pady=(12,2))
        tk.Label(logo_frame, text="v2.1 — AI Powered", bg=BG, fg=ACCENT,
                 font=("Helvetica",11)).pack()
        tk.Label(logo_frame, text="✦ Gemini 2.5 Flash  ✦  Firebase  ✦  Webshop", bg=BG, fg=TEXT3,
                 font=("Helvetica",9)).pack(pady=(3,0))

        # Form
        form_f = tk.Frame(self.main_f, bg=BG)
        form_f.pack(padx=44, fill="x")

        tk.Frame(form_f, bg=BORDER, height=1).pack(fill="x", pady=(0,20))

        # Email
        tk.Label(form_f, text="EMAIL", bg=BG, fg=TEXT3,
                 font=("Helvetica",9,"bold")).pack(anchor="w")
        self.ev = tk.StringVar(value="ddnemet@gmail.com")
        email_entry = tk.Entry(form_f, textvariable=self.ev, bg=BG3, fg=TEXT,
                               insertbackground=TEXT, relief="flat",
                               font=("Helvetica",12))
        email_entry.pack(fill="x", ipady=10, pady=(4,14))
        email_entry.bind("<FocusIn>",  lambda e: email_entry.configure(bg=BG4))
        email_entry.bind("<FocusOut>", lambda e: email_entry.configure(bg=BG3))

        # Password
        tk.Label(form_f, text="JELSZÓ", bg=BG, fg=TEXT3,
                 font=("Helvetica",9,"bold")).pack(anchor="w")
        self.pv = tk.StringVar()
        pw_entry = tk.Entry(form_f, textvariable=self.pv, show="●", bg=BG3, fg=TEXT,
                            insertbackground=TEXT, relief="flat", font=("Helvetica",12))
        pw_entry.pack(fill="x", ipady=10, pady=(4,20))
        pw_entry.bind("<Return>", lambda e: self._login())
        pw_entry.bind("<FocusIn>",  lambda e: pw_entry.configure(bg=BG4))
        pw_entry.bind("<FocusOut>", lambda e: pw_entry.configure(bg=BG3))
        pw_entry.focus()

        # Status
        self.err_lbl = tk.Label(form_f, text="", bg=BG, fg=RED,
                                 font=("Helvetica",10), wraplength=340)
        self.err_lbl.pack()

        # Login button (animated)
        self.login_btn = GlowButton(form_f, text="Bejelentkezés  →",
                                     font=("Helvetica",12,"bold"),
                                     command=self._login, pady=12)
        self.login_btn.pack(fill="x", pady=(8,10))

        # Guest button
        AnimatedButton(form_f, text="Folytatás vendégként",
                       normal_bg=BG3, hover_bg=BG4,
                       normal_fg=TEXT3, hover_fg=TEXT2,
                       font=("Helvetica",10), pady=8,
                       command=lambda: [setattr(self,'result',{"token":None,"email":"guest"}),
                                        self.root.destroy()]).pack(fill="x")

        # Animated dots at bottom
        self._dots_canvas = tk.Canvas(self.main_f, width=440, height=40,
                                       bg=BG, highlightthickness=0)
        self._dots_canvas.pack(side="bottom", fill="x")
        self._animate_dots()

    def _animate_logo(self, canvas):
        self._logo_angle = 0
        self._logo_canvas = canvas
        self._draw_logo()

    def _draw_logo(self):
        c = self._logo_canvas
        c.delete("all")
        cx=cy=40; r=32
        # Outer ring
        c.create_oval(cx-r,cy-r,cx+r,cy+r, outline=BG4, width=2)
        # Rotating arc
        c.create_arc(cx-r,cy-r,cx+r,cy+r,
                     start=self._logo_angle, extent=240,
                     outline=ACCENT, width=3, style="arc")
        # Inner hexagon
        for i in range(6):
            a1 = math.radians(i*60 + self._logo_angle*0.3)
            a2 = math.radians((i+1)*60 + self._logo_angle*0.3)
            x1=cx+18*math.cos(a1); y1=cy+18*math.sin(a1)
            x2=cx+18*math.cos(a2); y2=cy+18*math.sin(a2)
            c.create_line(x1,y1,x2,y2, fill=ACCENT2, width=2)
        # Center dot
        c.create_oval(cx-5,cy-5,cx+5,cy+5, fill=ACCENT, outline="")
        self._logo_angle = (self._logo_angle + 2) % 360
        self._logo_canvas.after(16, self._draw_logo)

    def _animate_dots(self):
        c = self._dots_canvas
        c.delete("all")
        t = self._logo_angle
        for i in range(5):
            phase = math.sin((t*0.05) + i*0.8)
            alpha = (phase+1)/2
            r = int(3 + alpha*3)
            x = 80 + i*70
            y = 20 + phase*6
            color_val = int(0x28 + alpha*(0x63-0x28))
            color = f"#{color_val:02x}{color_val:02x}{int(0x28+alpha*(0x91-0x28)):02x}"
            c.create_oval(x-r,y-r,x+r,y+r, fill=color, outline="")
        c.after(50, self._animate_dots)

    def _login(self):
        email=self.ev.get().strip(); pw=self.pv.get()
        if not email or not pw:
            self.err_lbl.configure(text="Töltsd ki a mezőket!"); return
        self.login_btn.configure(text="Belépés...", state="disabled")
        self.err_lbl.configure(text="")
        def run():
            token,uemail,err=firebase_login(email,pw)
            self.root.after(0,lambda: self._result(token,uemail,err))
        threading.Thread(target=run,daemon=True).start()

    def _result(self,token,email,err):
        if err:
            self.err_lbl.configure(text=f"❌ {err}")
            self.login_btn.configure(text="Bejelentkezés  →",state="normal")
        else:
            self.result={"token":token,"email":email}
            self.animator.stop()
            self.root.destroy()

# ── MAIN EDITOR ───────────────────────────────────────────────────────────────
class WebEditor:
    def __init__(self, user):
        self.user = user
        self.root = tk.Tk()
        self.root.title(f"OilTrade WebEditor v2.1  |  {user['email']}")
        self.root.geometry("1600x960")
        self.root.configure(bg=BG)
        self.root.minsize(1200,700)

        self.html_content = ""
        self.project_path = None
        self.undo_stack = []
        self.products = []
        self.site_type = tk.StringVar(value="webstore")
        self.animator = Animator(self.root)

        self._build_ui()
        self._animate_sidebar_in()
        self.root.mainloop()

    def _animate_sidebar_in(self):
        """Slide sidebar in on startup."""
        pass  # sidebar is packed, just fade bg

    def _build_ui(self):
        # Accent bar
        tk.Frame(self.root, bg=ACCENT, height=3).pack(fill="x")

        # Menu
        mb=tk.Menu(self.root,bg=BG2,fg=TEXT,activebackground=ACCENT,activeforeground="#fff")
        self.root.config(menu=mb)
        fm=tk.Menu(mb,tearoff=0,bg=BG2,fg=TEXT,activebackground=ACCENT,activeforeground="#fff")
        fm.add_command(label="Új projekt     Ctrl+N",command=self.new_project)
        fm.add_command(label="Megnyitás      Ctrl+O",command=self.open_project)
        fm.add_command(label="Mentés         Ctrl+S",command=self.save_project)
        fm.add_separator()
        fm.add_command(label="HTML export",command=self.export_html)
        fm.add_command(label="Firebase  F5",command=self.deploy)
        fm.add_separator()
        fm.add_command(label="Kilépés",command=self.root.quit)
        mb.add_cascade(label="Fájl",menu=fm)
        tm=tk.Menu(mb,tearoff=0,bg=BG2,fg=TEXT,activebackground=ACCENT,activeforeground="#fff")
        tm.add_command(label="📦 Termékek",command=self._open_products)
        tm.add_command(label="📊 Analytics",command=self._open_analytics)
        mb.add_cascade(label="Eszközök",menu=tm)

        # Main
        main=tk.Frame(self.root,bg=BG); main.pack(fill="both",expand=True)

        # Left
        self.left=tk.Frame(main,bg=BG2,width=320)
        self.left.pack(side="left",fill="y"); self.left.pack_propagate(False)
        self._build_left()

        # Center
        center=tk.Frame(main,bg=BG); center.pack(side="left",fill="both",expand=True)
        self._build_center(center)

        # Right
        self.right=tk.Frame(main,bg=BG2,width=280)
        self.right.pack(side="right",fill="y"); self.right.pack_propagate(False)
        self._build_right()

        # Shortcuts
        self.root.bind("<Control-s>",lambda e:self.save_project())
        self.root.bind("<Control-n>",lambda e:self.new_project())
        self.root.bind("<Control-o>",lambda e:self.open_project())
        self.root.bind("<Control-z>",lambda e:self.undo())
        self.root.bind("<F5>",lambda e:self.deploy())

    def _build_left(self):
        # Header with animated logo
        hdr=tk.Frame(self.left,bg=BG2,pady=12); hdr.pack(fill="x",padx=16)
        logo_c=tk.Canvas(hdr,width=28,height=28,bg=BG2,highlightthickness=0)
        logo_c.pack(side="left")
        self._mini_logo(logo_c)
        tk.Label(hdr,text="WebEditor",bg=BG2,fg=TEXT,
                 font=("Helvetica",14,"bold")).pack(side="left",padx=8)
        tk.Label(hdr,text="v2.1",bg=BG2,fg=ACCENT,
                 font=("Helvetica",9,"bold")).pack(side="left")

        tk.Frame(self.left,bg=BORDER,height=1).pack(fill="x")

        # Site type
        type_f=tk.Frame(self.left,bg=BG2,pady=12); type_f.pack(fill="x",padx=16)
        tk.Label(type_f,text="OLDAL TÍPUSA",bg=BG2,fg=TEXT3,
                 font=("Helvetica",8,"bold")).pack(anchor="w",pady=(0,6))
        self._type_btns = {}
        types=[("🛒 Webstore","webstore"),("🏢 Cég oldal","business"),
               ("💼 Portfolio","portfolio"),("📝 Blog","blog"),("🚀 Landing","landing")]
        type_grid=tk.Frame(type_f,bg=BG2); type_grid.pack(fill="x")
        for i,(label,val) in enumerate(types):
            btn=tk.Button(type_grid,text=label,bg=BG3,fg=TEXT2,relief="flat",
                          font=("Helvetica",9),cursor="hand2",padx=6,pady=5,
                          command=lambda v=val:self._select_type(v))
            btn.grid(row=i//2,column=i%2,padx=2,pady=2,sticky="ew")
            type_grid.columnconfigure(i%2,weight=1)
            btn.bind("<Enter>",lambda e,b=btn:b.configure(bg=BG4))
            btn.bind("<Leave>",lambda e,b=btn,v=val:b.configure(
                bg=ACCENT if self.site_type.get()==v else BG3,
                fg="#fff" if self.site_type.get()==v else TEXT2))
            self._type_btns[val]=btn
        self._select_type("webstore")

        tk.Frame(self.left,bg=BORDER,height=1).pack(fill="x")

        # Prompt
        ai_f=tk.Frame(self.left,bg=BG2,pady=12); ai_f.pack(fill="x",padx=16)
        tk.Label(ai_f,text="✨ AI GENERÁLÁS",bg=BG2,fg=TEXT3,
                 font=("Helvetica",8,"bold")).pack(anchor="w",pady=(0,6))
        self.prompt_text=tk.Text(ai_f,height=6,bg=BG3,fg=TEXT,insertbackground=TEXT,
                                  relief="flat",font=("Helvetica",10),wrap="word",padx=10,pady=8)
        self.prompt_text.pack(fill="x",pady=(0,8))
        self.prompt_text.insert("1.0","Modern olaj kereskedő webshop. Termékek, kosár, Google Pay.")
        self.prompt_text.bind("<FocusIn>", lambda e:self.prompt_text.configure(bg=BG4))
        self.prompt_text.bind("<FocusOut>",lambda e:self.prompt_text.configure(bg=BG3))

        self.gen_btn=GlowButton(ai_f,text="✨  Generálás",
                                 font=("Helvetica",11,"bold"),
                                 command=self._generate,pady=10)
        self.gen_btn.pack(fill="x",pady=(0,6))

        # Animated progress
        self.gen_status=tk.Label(ai_f,text="",bg=BG2,fg=TEXT2,
                                  font=("Helvetica",9),wraplength=270)
        self.gen_status.pack()
        self.progress_bar=AnimatedProgressBar(ai_f,height=4)
        self.progress_bar.pack(fill="x",pady=4)
        self.spinner=SpinnerCanvas(ai_f,size=32,color=ACCENT)
        self.spinner.pack(pady=4)

        tk.Frame(self.left,bg=BORDER,height=1).pack(fill="x")

        # AI Edit
        edit_f=tk.Frame(self.left,bg=BG2,pady=10); edit_f.pack(fill="x",padx=16)
        tk.Label(edit_f,text="✏️ AI SZERKESZTÉS",bg=BG2,fg=TEXT3,
                 font=("Helvetica",8,"bold")).pack(anchor="w",pady=(0,6))
        self.edit_prompt=tk.Text(edit_f,height=3,bg=BG3,fg=TEXT,insertbackground=TEXT,
                                  relief="flat",font=("Helvetica",10),wrap="word",padx=8,pady=6)
        self.edit_prompt.pack(fill="x",pady=(0,6))
        self.edit_prompt.insert("1.0","Változtasd sötétre a témát")
        AnimatedButton(edit_f,text="✏️  Szerkesztés alkalmazása",
                       normal_bg=BG3,hover_bg=BG4,normal_fg=TEXT2,hover_fg=TEXT,
                       font=("Helvetica",10,"bold"),pady=8,
                       command=self._ai_edit).pack(fill="x")

        tk.Frame(self.left,bg=BORDER,height=1).pack(fill="x")

        # Actions
        act_f=tk.Frame(self.left,bg=BG2,pady=10); act_f.pack(fill="x",padx=16)
        for text,cmd,color in [
            ("📦  Termékek kezelése",self._open_products,BG3),
            ("📊  Analytics",self._open_analytics,BG3),
        ]:
            AnimatedButton(act_f,text=text,normal_bg=color,hover_bg=BG4,
                          normal_fg=TEXT2,hover_fg=TEXT,
                          font=("Helvetica",10),pady=7,command=cmd).pack(fill="x",pady=2)

        tk.Frame(self.left,bg=BORDER,height=1).pack(fill="x")

        btm=tk.Frame(self.left,bg=BG2,pady=10); btm.pack(fill="x",padx=16)
        GlowButton(btm,text="🚀  Firebase  F5",font=("Helvetica",10,"bold"),
                   command=self.deploy,pady=9).pack(fill="x",pady=2)
        for text,cmd in [("⬇  HTML export",self.export_html),("💾  Mentés",self.save_project)]:
            AnimatedButton(btm,text=text,normal_bg=BG3,hover_bg=BG4,
                          normal_fg=TEXT2,hover_fg=TEXT,
                          font=("Helvetica",10),pady=6,command=cmd).pack(fill="x",pady=2)
        tk.Label(btm,text=f"👤 {self.user['email']}",bg=BG2,fg=TEXT3,
                 font=("Helvetica",8)).pack(pady=(6,0))

    def _mini_logo(self, canvas):
        self._mini_angle = 0
        self._mini_c = canvas
        self._draw_mini_logo()

    def _draw_mini_logo(self):
        c=self._mini_c; c.delete("all")
        cx=cy=14; r=11
        c.create_arc(cx-r,cy-r,cx+r,cy+r,
                     start=self._mini_angle,extent=270,
                     outline=ACCENT,width=2,style="arc")
        c.create_oval(cx-3,cy-3,cx+3,cy+3,fill=ACCENT,outline="")
        self._mini_angle=(self._mini_angle+3)%360
        self._mini_c.after(16,self._draw_mini_logo)

    def _select_type(self, val):
        self.site_type.set(val)
        for v,btn in self._type_btns.items():
            if v==val: btn.configure(bg=ACCENT,fg="#fff")
            else: btn.configure(bg=BG3,fg=TEXT2)

    def _build_center(self, parent):
        # Toolbar
        tb=tk.Frame(parent,bg=BG3,pady=8); tb.pack(fill="x")
        for text,cmd in [("↩ Visszavon",self.undo),
                          ("🌐 Böngészőben",self._open_in_browser),
                          ("📋 Másolás",self._copy_html)]:
            AnimatedButton(tb,text=text,normal_bg=BG4,hover_bg=BG5,
                          normal_fg=TEXT2,hover_fg=TEXT,
                          font=("Helvetica",9),padx=10,pady=4,
                          command=cmd).pack(side="left",padx=3)
        self.status_lbl=tk.Label(tb,text="Generálj egy weboldalt!",
                                  bg=BG3,fg=TEXT3,font=("Helvetica",9))
        self.status_lbl.pack(side="right",padx=16)

        # Tabs
        style=ttk.Style(); style.theme_use("default")
        style.configure("TNotebook",background=BG,borderwidth=0)
        style.configure("TNotebook.Tab",background=BG3,foreground=TEXT2,
                        padding=[14,8],font=("Helvetica",10))
        style.map("TNotebook.Tab",background=[("selected",BG2)],
                  foreground=[("selected",TEXT)])

        self.nb=ttk.Notebook(parent)
        self.nb.pack(fill="both",expand=True,padx=6,pady=(4,6))

        # Preview tab
        prev_tab=tk.Frame(self.nb,bg=BG2)
        self.nb.add(prev_tab,text="  🌐 Előnézet  ")

        # Animated preview canvas
        self.prev_canvas=tk.Canvas(prev_tab,bg=BG2,highlightthickness=0)
        self.prev_canvas.pack(fill="both",expand=True)
        self._animate_preview_bg()

        self.preview_info=tk.Label(prev_tab,
            text="✨  Generálj egy weboldalt az AI-val!",
            bg=BG2,fg=TEXT3,font=("Helvetica",14),justify="center")
        self.preview_info.place(relx=0.5,rely=0.4,anchor="center")

        self.open_btn=GlowButton(prev_tab,text="  🌐  Megnyitás böngészőben  ",
                                  font=("Helvetica",12,"bold"),
                                  command=self._open_in_browser,
                                  pady=12,state="disabled")
        self.open_btn.place(relx=0.5,rely=0.55,anchor="center")

        # Code tab
        code_tab=tk.Frame(self.nb,bg=BG)
        self.nb.add(code_tab,text="  </> HTML Kód  ")

        ctb=tk.Frame(code_tab,bg=BG3,pady=6); ctb.pack(fill="x")
        GlowButton(ctb,text="✓ Alkalmazás",font=("Helvetica",10,"bold"),
                   command=self._apply_code,pady=5,padx=12).pack(side="left",padx=8)
        AnimatedButton(ctb,text="↩ Visszavon",normal_bg=BG4,hover_bg=BG5,
                      normal_fg=TEXT2,hover_fg=TEXT,font=("Helvetica",10),
                      pady=5,padx=10,command=self.undo).pack(side="left",padx=2)
        self.code_lines_lbl=tk.Label(ctb,text="",bg=BG3,fg=TEXT3,font=("Helvetica",9))
        self.code_lines_lbl.pack(side="right",padx=12)

        cf=tk.Frame(code_tab,bg=BG); cf.pack(fill="both",expand=True)
        ys=tk.Scrollbar(cf,bg=BG3); ys.pack(side="right",fill="y")
        xs=tk.Scrollbar(cf,orient="horizontal",bg=BG3); xs.pack(side="bottom",fill="x")
        self.code_editor=tk.Text(cf,bg="#0d1117",fg="#c9d1d9",
                                  insertbackground="#c9d1d9",relief="flat",
                                  font=("Menlo",10),wrap="none",
                                  yscrollcommand=ys.set,xscrollcommand=xs.set,tabs=4)
        self.code_editor.pack(fill="both",expand=True)
        ys.configure(command=self.code_editor.yview)
        xs.configure(command=self.code_editor.xview)

    def _animate_preview_bg(self):
        """Animated particle background for preview."""
        import random
        if not hasattr(self,'_particles'):
            self._particles=[{"x":random.randint(0,800),"y":random.randint(0,600),
                               "vx":random.uniform(-0.5,0.5),"vy":random.uniform(-0.5,0.5),
                               "r":random.randint(1,3)} for _ in range(30)]
        c=self.prev_canvas
        if not self.html_content:
            c.delete("particles")
            w=c.winfo_width() or 800; h=c.winfo_height() or 600
            for p in self._particles:
                p["x"]=(p["x"]+p["vx"])%w
                p["y"]=(p["y"]+p["vy"])%h
                alpha=int(0x28+p["r"]*8)
                color=f"#{alpha:02x}{alpha:02x}{min(0x63,alpha+0x20):02x}"
                c.create_oval(p["x"]-p["r"],p["y"]-p["r"],
                              p["x"]+p["r"],p["y"]+p["r"],
                              fill=color,outline="",tags="particles")
        self.root.after(50,self._animate_preview_bg)

    def _build_right(self):
        tk.Frame(self.right,bg=BORDER,height=1).pack(fill="x")
        hdr=tk.Frame(self.right,bg=BG2,pady=12); hdr.pack(fill="x",padx=16)
        tk.Label(hdr,text="⚡ GYORS MÓDOSÍTÁSOK",bg=BG2,fg=TEXT3,
                 font=("Helvetica",8,"bold")).pack(anchor="w")

        canvas=tk.Canvas(self.right,bg=BG2,highlightthickness=0)
        sb=ttk.Scrollbar(self.right,orient="vertical",command=canvas.yview)
        canvas.configure(yscrollcommand=sb.set)
        sb.pack(side="right",fill="y"); canvas.pack(fill="both",expand=True)
        inner=tk.Frame(canvas,bg=BG2)
        canvas.create_window((0,0),window=inner,anchor="nw")

        quick_edits=[
            ("🎨 Design",None),
            ("🌙 Sötét téma","Változtasd az egész oldalt sötét témára"),
            ("☀️ Világos téma","Változtasd világos, fehér háttérre"),
            ("💜 Lila téma","Fő szín: #6366f1 indigo/lila, modern gradient"),
            ("🔵 Kék téma","Fő szín: #2563eb, professzionális kék"),
            ("💎 Glassmorphism","Üveges átlátszó card design blur effekttel"),
            ("📐 Layout",None),
            ("📱 Mobilbarát","Tedd teljesen reszponzívvá mobilra"),
            ("✨ Animációk","Adj scroll-reveal és hover animációkat minden elemre"),
            ("🔲 Rounded corners","Növeld a border-radius értékeket"),
            ("🛒 Webshop",None),
            ("🏷️ Akció badge","Adj piros AKCIÓ badge-eket a termékekre"),
            ("⭐ Értékelések","Adj 5 csillagos vásárlói véleményeket"),
            ("🚚 Szállítás","Adj ingyenes szállítás bannert"),
            ("💳 Fizetési logók","Adj Visa, Mastercard, Google Pay logókat"),
            ("📦 Készlet jelző","Adj 'Raktáron: X db' jelzőket"),
            ("📝 Tartalom",None),
            ("📞 Kapcsolat","Adj professzionális kapcsolati form szekciót"),
            ("❓ GYIK","Adj FAQ szekciót accordion stílusban"),
            ("⭐ Referenciák","Adj partner logókat és referenciákat"),
            ("📊 Statisztikák","Adj számláló szekciót (pl. 1000+ ügyfél)"),
        ]

        for item in quick_edits:
            if item[1] is None:
                tk.Label(inner,text=item[0],bg=BG2,fg=TEXT3,
                         font=("Helvetica",8,"bold"),pady=6).pack(fill="x",padx=16)
            else:
                label,prompt=item
                btn=AnimatedButton(inner,text=label,
                                   normal_bg=BG3,hover_bg=BG4,
                                   normal_fg=TEXT2,hover_fg=TEXT,
                                   font=("Helvetica",10),anchor="w",
                                   padx=12,pady=7,
                                   command=lambda p=prompt:self._quick_edit(p))
                btn.pack(fill="x",padx=8,pady=1)

        inner.update_idletasks()
        canvas.configure(scrollregion=canvas.bbox("all"))
        canvas.bind("<MouseWheel>",lambda e:canvas.yview_scroll(-1 if e.delta>0 else 1,"units"))

    # ── ACTIONS ──────────────────────────────────────────────────────────────
    def _generate(self):
        prompt=self.prompt_text.get("1.0","end-1c").strip()
        if not prompt: return
        self.gen_btn.configure(state="disabled",text="Generálás...")
        self.spinner.start()
        self.progress_bar.start_indeterminate()
        self.gen_status.configure(text="")

        if self.products:
            prod_str="\n".join([f"- {p['name']}: {p['price']} Ft, {p.get('desc','')}"
                                for p in self.products])
            prompt+=f"\n\nTERMÉKEK:\n{prod_str}"

        def run():
            def cb(msg,prog):
                self.root.after(0,lambda:self.gen_status.configure(text=msg))
                self.root.after(0,lambda:self.progress_bar.set_progress(prog))
            try:
                html=generate_website(prompt,self.site_type.get(),cb)
                def done():
                    self.spinner.stop()
                    self.progress_bar.stop()
                    self.gen_btn.configure(state="normal",text="✨  Generálás")
                    self.save_undo(); self.html_content=html
                    self._update_preview()
                    self.status_lbl.configure(text=f"✅ Generálva! {len(html)//1024}KB")
                self.root.after(0,done)
            except Exception as e:
                def err():
                    self.spinner.stop(); self.progress_bar.stop()
                    self.gen_btn.configure(state="normal",text="✨  Generálás")
                    self.gen_status.configure(text=f"❌ Hiba: {e}")
                self.root.after(0,err)
        threading.Thread(target=run,daemon=True).start()

    def _ai_edit(self):
        if not self.html_content:
            messagebox.showwarning("Figyelem","Először generálj weboldalt!"); return
        instruction=self.edit_prompt.get("1.0","end-1c").strip()
        if not instruction: return
        self.spinner.start(); self.progress_bar.start_indeterminate()
        self.gen_status.configure(text="AI szerkesztés...")
        def run():
            def cb(msg,prog):
                self.root.after(0,lambda:self.gen_status.configure(text=msg))
            try:
                html=ai_edit(self.html_content,instruction,cb)
                def done():
                    self.spinner.stop(); self.progress_bar.stop()
                    self.save_undo(); self.html_content=html
                    self._update_preview()
                    self.gen_status.configure(text="✅ Kész!")
                self.root.after(0,done)
            except Exception as e:
                def err():
                    self.spinner.stop(); self.progress_bar.stop()
                    self.gen_status.configure(text=f"❌ {e}")
                self.root.after(0,err)
        threading.Thread(target=run,daemon=True).start()

    def _quick_edit(self,prompt):
        if not self.html_content:
            messagebox.showwarning("Figyelem","Először generálj weboldalt!"); return
        self.spinner.start(); self.progress_bar.start_indeterminate()
        self.status_lbl.configure(text="AI módosítás...")
        def run():
            try:
                html=ai_edit(self.html_content,prompt)
                def done():
                    self.spinner.stop(); self.progress_bar.stop()
                    self.save_undo(); self.html_content=html
                    self._update_preview()
                    self.status_lbl.configure(text="✅ Módosítás kész!")
                self.root.after(0,done)
            except Exception as e:
                def err():
                    self.spinner.stop(); self.progress_bar.stop()
                    self.status_lbl.configure(text=f"❌ {e}")
                self.root.after(0,err)
        threading.Thread(target=run,daemon=True).start()

    def _update_preview(self):
        if self.html_content:
            lines=len(self.html_content.split("\n"))
            size=len(self.html_content)//1024
            self.preview_info.configure(
                text=f"✅  Weboldal kész!\n\n{lines} sor  ·  {size} KB\n\nNyisd meg böngészőben!",
                fg=GREEN)
            self.open_btn.configure(state="normal")
            self.code_editor.delete("1.0","end")
            self.code_editor.insert("1.0",self.html_content)
            self.code_lines_lbl.configure(text=f"{lines} sor · {size} KB")
            # Fade preview_info green
            self.animator.add(FadeAnim(self.preview_info, BG2, "#0a2a0a", 500,
                                       on_done=lambda: self.animator.add(
                                           FadeAnim(self.preview_info,"#0a2a0a",BG2,500))))

    def _open_in_browser(self):
        if not self.html_content: return
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w',suffix='.html',delete=False,encoding='utf-8') as f:
            f.write(self.html_content); path=f.name
        webbrowser.open(f"file:///{path}")

    def _copy_html(self):
        if self.html_content:
            self.root.clipboard_clear(); self.root.clipboard_append(self.html_content)
            self.status_lbl.configure(text="📋 HTML másolva!")

    def _apply_code(self):
        self.save_undo()
        self.html_content=self.code_editor.get("1.0","end-1c")
        self._update_preview()
        self.status_lbl.configure(text="✅ Kód alkalmazva!")

    def _open_products(self):
        win=tk.Toplevel(self.root); win.title("Termékek")
        win.geometry("700x500"); win.configure(bg=BG); win.grab_set()
        tk.Frame(win,bg=ACCENT,height=3).pack(fill="x")
        hdr=tk.Frame(win,bg=BG,pady=14); hdr.pack(fill="x",padx=20)
        tk.Label(hdr,text="📦 Termékek kezelése",bg=BG,fg=TEXT,
                 font=("Helvetica",16,"bold")).pack(side="left")
        GlowButton(hdr,text="+ Hozzáadás",font=("Helvetica",10,"bold"),
                   pady=6,padx=12,
                   command=lambda:self._product_form(win)).pack(side="right")
        self._prod_list_frame=tk.Frame(win,bg=BG2)
        self._prod_list_frame.pack(fill="both",expand=True,padx=16,pady=(0,16))
        self._refresh_prod_list(win)

    def _refresh_prod_list(self,win):
        for w in self._prod_list_frame.winfo_children(): w.destroy()
        if not self.products:
            tk.Label(self._prod_list_frame,
                     text="Nincs termék. Kattints a '+ Hozzáadás' gombra!",
                     bg=BG2,fg=TEXT3,font=("Helvetica",11)).pack(pady=30); return
        for i,p in enumerate(self.products):
            row=tk.Frame(self._prod_list_frame,bg=BG3)
            row.pack(fill="x",pady=3)
            inner=tk.Frame(row,bg=BG3); inner.pack(fill="x",padx=12,pady=10)
            tk.Label(inner,text=p.get("emoji","📦"),bg=BG3,font=("Helvetica",22)).pack(side="left",padx=(0,10))
            info=tk.Frame(inner,bg=BG3); info.pack(side="left",fill="x",expand=True)
            tk.Label(info,text=p["name"],bg=BG3,fg=TEXT,
                     font=("Helvetica",12,"bold"),anchor="w").pack(fill="x")
            tk.Label(info,text=f"{p['price']} Ft · Készlet: {p['stock']} db",
                     bg=BG3,fg=TEXT2,font=("Helvetica",10),anchor="w").pack(fill="x")
            btns=tk.Frame(inner,bg=BG3); btns.pack(side="right")
            AnimatedButton(btns,text="✏",normal_bg=BG4,hover_bg=BG5,
                          normal_fg=TEXT2,hover_fg=TEXT,
                          padx=8,pady=4,font=("Helvetica",12),
                          command=lambda idx=i:self._product_form(win,idx)).pack(side="left",padx=2)
            AnimatedButton(btns,text="🗑",normal_bg=BG4,hover_bg="#3d1515",
                          normal_fg=RED,hover_fg=RED,
                          padx=8,pady=4,font=("Helvetica",12),
                          command=lambda idx=i:[self.products.pop(idx),
                                                self._refresh_prod_list(win)]).pack(side="left")

    def _product_form(self,parent_win,idx=None):
        p=self.products[idx] if idx is not None else {}
        dlg=tk.Toplevel(parent_win); dlg.title("Termék")
        dlg.geometry("480x560"); dlg.configure(bg=BG); dlg.grab_set()
        tk.Frame(dlg,bg=ACCENT,height=3).pack(fill="x")
        tk.Label(dlg,text="📦 Termék adatai",bg=BG,fg=TEXT,
                 font=("Helvetica",14,"bold"),pady=14).pack()
        f=tk.Frame(dlg,bg=BG); f.pack(padx=24,fill="x")
        fields={}
        for key,label,val in [
            ("name","Termék neve *",p.get("name","")),
            ("price","Ár (Ft) *",p.get("price","")),
            ("stock","Készlet (db) *",p.get("stock","")),
            ("emoji","Emoji",p.get("emoji","📦")),
            ("desc","Leírás",p.get("desc","")),
            ("category","Kategória",p.get("category","")),
        ]:
            tk.Label(f,text=label,bg=BG,fg=TEXT3,font=("Helvetica",9,"bold")).pack(anchor="w",pady=(8,2))
            v=tk.StringVar(value=val)
            e=tk.Entry(f,textvariable=v,bg=BG3,fg=TEXT,insertbackground=TEXT,
                       relief="flat",font=("Helvetica",11))
            e.pack(fill="x",ipady=8)
            e.bind("<FocusIn>",lambda ev,en=e:en.configure(bg=BG4))
            e.bind("<FocusOut>",lambda ev,en=e:en.configure(bg=BG3))
            fields[key]=v
        def save():
            prod={k:v.get() for k,v in fields.items()}
            if not prod["name"] or not prod["price"] or not prod["stock"]:
                messagebox.showwarning("Hiba","Töltsd ki a kötelező mezőket!"); return
            if idx is not None: self.products[idx]=prod
            else: self.products.append(prod)
            self._refresh_prod_list(parent_win); dlg.destroy()
        GlowButton(dlg,text="💾  Mentés",font=("Helvetica",11,"bold"),
                   command=save,pady=10).pack(fill="x",padx=24,pady=16)

    def _open_analytics(self):
        win=tk.Toplevel(self.root); win.title("Analytics")
        win.geometry("880x600"); win.configure(bg=BG); win.grab_set()
        tk.Frame(win,bg=ACCENT,height=3).pack(fill="x")
        tk.Label(win,text="📊 Analytics Dashboard",bg=BG,fg=TEXT,
                 font=("Helvetica",18,"bold"),pady=16).pack(anchor="w",padx=24)
        # Stats
        sf=tk.Frame(win,bg=BG); sf.pack(fill="x",padx=20,pady=(0,16))
        for icon,label,val,change,color in [
            ("💰","Bevétel","1 240 500 Ft","+23%",GREEN),
            ("🛒","Rendelések","47","+12%",ACCENT),
            ("👥","Látogatók","1 284","+8%",ORANGE),
            ("📦","Eladott","183 db","+31%",GOLD),
        ]:
            card=tk.Frame(sf,bg=BG3); card.pack(side="left",fill="both",expand=True,padx=4)
            inner=tk.Frame(card,bg=BG3); inner.pack(fill="x",padx=16,pady=14)
            tk.Label(inner,text=icon,bg=BG3,font=("Helvetica",22)).pack(anchor="w")
            tk.Label(inner,text=label,bg=BG3,fg=TEXT3,font=("Helvetica",9)).pack(anchor="w",pady=(4,0))
            tk.Label(inner,text=val,bg=BG3,fg=TEXT,font=("Helvetica",18,"bold")).pack(anchor="w")
            tk.Label(inner,text=change,bg=BG3,fg=color,font=("Helvetica",10,"bold")).pack(anchor="w")
        # Chart
        chart=tk.Canvas(win,bg=BG2,height=180,highlightthickness=0)
        chart.pack(fill="x",padx=20,pady=(0,16))
        tk.Label(win,text="Heti bevétel",bg=BG,fg=TEXT,
                 font=("Helvetica",11,"bold")).pack(anchor="w",padx=20)
        win.update_idletasks()
        self._draw_chart(chart,[85,142,98,210,175,260,190],
                         ["H","K","Sz","Cs","P","Sz","V"])

    def _draw_chart(self,canvas,values,labels):
        canvas.update_idletasks()
        w=canvas.winfo_width() or 840; h=180
        max_v=max(values); bar_w=60; gap=20; ox=40; ch=140
        # Animate bars
        self._chart_progress=[0]*len(values)
        self._chart_target=values
        self._chart_canvas=canvas
        self._chart_w=w; self._chart_h=h; self._chart_bw=bar_w
        self._chart_gap=gap; self._chart_ox=ox; self._chart_ch=ch
        self._chart_labels=labels; self._chart_max=max_v
        self._animate_chart()

    def _animate_chart(self):
        done=True
        for i in range(len(self._chart_progress)):
            if self._chart_progress[i]<self._chart_target[i]:
                self._chart_progress[i]=min(
                    self._chart_target[i],
                    self._chart_progress[i]+self._chart_target[i]*0.08+1)
                done=False
        c=self._chart_canvas; c.delete("all")
        # Grid lines
        for j in range(5):
            y=10+j*(self._chart_ch//4)
            c.create_line(self._chart_ox,y,self._chart_w-10,y,fill=BG4,dash=(4,4))
        for i,(val,label) in enumerate(zip(self._chart_progress,self._chart_labels)):
            x=self._chart_ox+i*(self._chart_bw+self._chart_gap)
            bh=int((val/self._chart_max)*self._chart_ch) if self._chart_max else 0
            y1=self._chart_ch+10-bh; y2=self._chart_ch+10
            # Bar
            c.create_rectangle(x,y1,x+self._chart_bw,y2,fill=ACCENT,outline="",width=0)
            c.create_rectangle(x,y1,x+self._chart_bw,y1+6,fill=ACCENT2,outline="",width=0)
            # Label
            c.create_text(x+self._chart_bw//2,self._chart_ch+24,text=label,
                          fill=TEXT3,font=("Helvetica",9))
            c.create_text(x+self._chart_bw//2,y1-12,
                          text=f"{int(val)}k",fill=TEXT2,font=("Helvetica",8))
        if not done:
            self.root.after(16,self._animate_chart)

    def save_undo(self):
        self.undo_stack.append(self.html_content)
        if len(self.undo_stack)>20: self.undo_stack.pop(0)

    def undo(self):
        if self.undo_stack:
            self.html_content=self.undo_stack.pop()
            self._update_preview()
            self.status_lbl.configure(text="↩ Visszavonva")

    def new_project(self,e=None):
        if messagebox.askyesno("Új projekt","Elvesznek a változtatások?"):
            self.html_content=""; self.undo_stack=[]; self.project_path=None
            self.preview_info.configure(text="✨  Generálj egy weboldalt!",fg=TEXT3)
            self.open_btn.configure(state="disabled")
            self.code_editor.delete("1.0","end")

    def save_project(self,e=None):
        if not self.project_path:
            self.project_path=filedialog.asksaveasfilename(
                defaultextension=".oilweb",filetypes=[("OilTrade","*.oilweb")])
        if self.project_path:
            with open(self.project_path,"w",encoding="utf-8") as f:
                json.dump({"version":"2.1","html":self.html_content,
                           "products":self.products},f,ensure_ascii=False)
            messagebox.showinfo("Mentés","✅ Mentve!")

    def open_project(self,e=None):
        path=filedialog.askopenfilename(
            filetypes=[("OilTrade","*.oilweb *.json"),("HTML","*.html")])
        if not path: return
        if path.endswith(".html"):
            with open(path,"r",encoding="utf-8") as f: self.html_content=f.read()
        else:
            with open(path,"r",encoding="utf-8") as f: data=json.load(f)
            self.html_content=data.get("html",""); self.products=data.get("products",[])
        self.project_path=path; self._update_preview()

    def export_html(self):
        if not self.html_content: messagebox.showwarning("Figyelem","Nincs tartalom!"); return
        path=filedialog.asksaveasfilename(defaultextension=".html",filetypes=[("HTML","*.html")])
        if not path: return
        with open(path,"w",encoding="utf-8") as f: f.write(self.html_content)
        if messagebox.askyesno("Export kész!","Megnyitod böngészőben?"):
            webbrowser.open(f"file:///{path}")

    def deploy(self,e=None):
        if not self.html_content: messagebox.showwarning("Figyelem","Nincs tartalom!"); return
        win=tk.Toplevel(self.root); win.title("Firebase"); win.geometry("460,330")
        win.geometry("460x330"); win.configure(bg=BG); win.resizable(False,False); win.grab_set()
        tk.Frame(win,bg=ACCENT,height=3).pack(fill="x")
        tk.Label(win,text="🚀 Firebase Hosting",bg=BG,fg=TEXT,
                 font=("Helvetica",14,"bold"),pady=14).pack()
        tk.Label(win,text=HOSTING_URL,bg=BG,fg=TEXT2,font=("Helvetica",10)).pack()
        spinner=SpinnerCanvas(win,size=48,color=GREEN)
        spinner.pack(pady=10)
        prog=tk.Label(win,text="Előkészítés...",bg=BG,fg=TEXT2,
                      font=("Helvetica",11),pady=4); prog.pack()
        bar=AnimatedProgressBar(win,height=6); bar.pack(fill="x",padx=24,pady=4)
        status=tk.Label(win,text="",bg=BG,fg=GREEN,font=("Helvetica",10),wraplength=420)
        status.pack(pady=6)
        open_btn=GlowButton(win,text="🌐  Megnyitás telefonon / böngészőben",
                             font=("Helvetica",11,"bold"),pady=9,
                             command=lambda:webbrowser.open(HOSTING_URL),state="disabled")
        open_btn.pack(padx=24,fill="x")
        spinner.start(); bar.start_indeterminate()
        html=self.html_content
        def run():
            def cb(msg,p_val):
                win.after(0,lambda:prog.configure(text=msg))
                win.after(0,lambda:bar.set_progress(p_val))
            ok,result=hosting_deploy(html,cb)
            def done():
                spinner.stop(); bar.stop()
                if ok:
                    status.configure(text=f"✅ Feltöltve!\n{result}",fg=GREEN)
                    open_btn.configure(state="normal")
                    prog.configure(text="Kész!")
                else:
                    status.configure(text=f"❌ Hiba: {result}",fg=RED)
            win.after(0,done)
        threading.Thread(target=run,daemon=True).start()

if __name__=="__main__":
    login=LoginWindow()
    if login.result:
        WebEditor(login.result)
