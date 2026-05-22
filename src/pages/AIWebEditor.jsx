import { useState, useRef } from "react";

const GEMINI_API_KEY = "AIzaSyCibWEomPg12Nm_F4Vv-NhZtaWQPzk_O_k";
const GEMINI_MODEL   = "gemini-2.5-flash";
const FIREBASE_PROJECT_ID = "oiltrade-3";
const HOSTING_URL = `https://${FIREBASE_PROJECT_ID}.web.app`;

const QUICK_EDITS = [
  { icon:"🌙", label:"Sötét téma",    prompt:"Változtasd az egész oldalt sötét témára, fekete háttérrel, fehér szövegekkel" },
  { icon:"☀️", label:"Világos téma",  prompt:"Változtasd világos, fehér/szürke háttérre, sötét szövegekkel" },
  { icon:"💜", label:"Lila téma",     prompt:"Fő szín: #6366f1 indigo/lila, modern gradient háttér" },
  { icon:"✨", label:"Animációk",     prompt:"Adj CSS scroll-reveal és hover animációkat minden elemre" },
  { icon:"📱", label:"Mobilbarát",    prompt:"Tedd teljesen reszponzívvá mobilra, CSS grid/flexbox" },
  { icon:"💎", label:"Glassmorphism", prompt:"Üveges átlátszó card design backdrop-filter blur effekttel" },
  { icon:"🏷️", label:"Akció badge",   prompt:"Adj piros AKCIÓ badge-eket a termék kártyákra" },
  { icon:"⭐", label:"Értékelések",   prompt:"Adj 5 csillagos vásárlói véleményeket az oldalra" },
  { icon:"🚚", label:"Szállítás",     prompt:"Adj ingyenes szállítás bannert és szállítási info szekciót" },
  { icon:"📞", label:"Kapcsolat",     prompt:"Adj professzionális kapcsolati form szekciót telefon, email, térkép mezőkkel" },
];

const EXAMPLES = [
  "Modern olaj kereskedő webshop termékekkel, kosárral és Google Pay fizetéssel",
  "Étterem weboldal menüvel, online foglalással és képgalériával",
  "Startup landing page hero sávval, feature listával és árazással",
  "Portfolio weboldal projektekkel, skillekkel és kapcsolattal",
  "Blog oldal cikkekkel, kategóriákkal és feliratkozással",
];

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
    })
  });
  if (!res.ok) throw new Error(`Gemini hiba: ${res.status}`);
  const data = await res.json();
  let text = data.candidates[0].content.parts[0].text;
  text = text.replace(/```html\n?/g,"").replace(/```\n?/g,"").trim();
  return text;
}

async function generateWebsite(prompt) {
  const full = `Te egy profi webdesigner vagy. Generálj TELJES működő HTML weboldalt.

KÖVETELMÉNYEK:
- Modern glassmorphism design, gradient háttér
- Google Fonts (Inter), CSS változók
- Smooth CSS animációk: fadeIn, slideUp
- Hover effektek, rounded corners (12-16px)
- Reszponzív grid layout
- Sticky navbar, smooth scroll
- MŰKÖDŐ JavaScript (kosár, form, stb)
- CSAK HTML kódot adj vissza!

KÉRÉS: ${prompt}`;
  return callGemini(full);
}

async function editWebsite(html, instruction) {
  const full = `Módosítsd ezt a HTML weboldalt:
INSTRUKCIÓ: ${instruction}
HTML (részlet): ${html.slice(0,3000)}
Adj vissza CSAK teljes módosított HTML-t!`;
  return callGemini(full);
}

export function AIWebEditorApp({ onClose }) {
  const [tab, setTab] = useState("ai"); // ai | preview | code
  const [prompt, setPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [status, setStatus] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setLoadMsg("Gemini 2.5 Flash generál... (30-60mp)");
    try {
      const result = await generateWebsite(prompt);
      setHtml(result);
      setStatus(`✅ ${result.split("\n").length} sor HTML generálva!`);
      setTab("preview");
    } catch(e) {
      setStatus(`❌ Hiba: ${e.message}`);
    }
    setLoading(false);
  };

  const edit = async (instruction) => {
    if (!html) { setStatus("❌ Először generálj weboldalt!"); return; }
    setLoading(true); setLoadMsg("AI szerkesztés...");
    try {
      const result = await editWebsite(html, instruction);
      setHtml(result);
      setStatus("✅ Szerkesztés kész!");
    } catch(e) {
      setStatus(`❌ ${e.message}`);
    }
    setLoading(false);
  };

  const openPreview = () => {
    if (!html) return;
    const blob = new Blob([html], {type:"text/html"});
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="win" style={{ display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:15, color:"var(--t)" }}>⬡ AI WebEditor</div>
          <div style={{ fontSize:10, color:"var(--blue)" }}>Gemini 2.5 Flash</div>
        </div>
        {html && (
          <button onClick={openPreview} style={{
            background:"var(--blue-d)", border:"1px solid var(--blue)",
            borderRadius:8, color:"var(--blue)", fontSize:11, fontWeight:700,
            padding:"4px 10px", cursor:"pointer"
          }}>🌐 Előnézet</button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ borderBottom:"1px solid var(--b)", overflowX:"auto" }}>
        {[["ai","✨ AI"],["preview","🌐 Preview"],["code","</> Kód"],["deploy","🚀 Deploy"]].map(([id,l])=>(
          <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{ position:"absolute", inset:0, zIndex:200, background:"rgba(4,11,20,.9)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div className="spin" style={{ width:36, height:36, marginBottom:16 }} />
          <div style={{ color:"var(--t)", fontWeight:700, fontSize:14, marginBottom:6 }}>AI feldolgoz...</div>
          <div style={{ color:"var(--t3)", fontSize:12, textAlign:"center", maxWidth:280, lineHeight:1.6 }}>{loadMsg}</div>
        </div>
      )}

      {/* Status bar */}
      {status && (
        <div style={{ background:"var(--bg2)", padding:"6px 14px", fontSize:11,
                      color:status.startsWith("✅")?"var(--green)":"var(--red)",
                      borderBottom:"1px solid var(--b)" }}>
          {status}
        </div>
      )}

      <div style={{ flex:1, overflow:"auto" }}>

        {/* AI TAB */}
        {tab==="ai" && (
          <div style={{ padding:14 }}>
            <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, letterSpacing:".08em", marginBottom:8 }}>
              OLDAL LEÍRÁSA
            </div>
            <textarea
              value={prompt}
              onChange={e=>setPrompt(e.target.value)}
              placeholder="Pl: Modern olaj kereskedő webshop termékekkel, kosárral és Google Pay fizetéssel..."
              style={{
                width:"100%", minHeight:100, background:"var(--bg2)",
                border:"1px solid var(--b2)", borderRadius:10, padding:10,
                color:"var(--t)", fontSize:13, resize:"vertical",
                fontFamily:"'Syne',sans-serif", lineHeight:1.6
              }}
            />

            <button onClick={generate} disabled={loading || !prompt.trim()} style={{
              width:"100%", marginTop:10, padding:14,
              background:"var(--blue)", color:"#000", border:"none",
              borderRadius:10, fontWeight:900, fontSize:14, cursor:"pointer"
            }}>
              ✨ Weboldal generálása
            </button>

            {/* Examples */}
            <div style={{ marginTop:16 }}>
              <button onClick={()=>setShowExamples(!showExamples)} style={{
                width:"100%", background:"var(--bg2)", border:"1px solid var(--b2)",
                borderRadius:8, padding:"8px 12px", color:"var(--t2)",
                fontSize:12, cursor:"pointer", textAlign:"left"
              }}>
                {showExamples?"▲":"▼"} Példák ({EXAMPLES.length})
              </button>
              {showExamples && EXAMPLES.map((ex,i)=>(
                <div key={i} onClick={()=>{setPrompt(ex);setShowExamples(false)}}
                  style={{ padding:"10px 12px", background:"var(--bg2)", borderBottom:"1px solid var(--b)",
                            cursor:"pointer", fontSize:12, color:"var(--t2)", lineHeight:1.5 }}>
                  {ex}
                </div>
              ))}
            </div>

            {/* AI Edit */}
            {html && (
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, letterSpacing:".08em", marginBottom:8 }}>
                  AI SZERKESZTÉS
                </div>
                <textarea
                  value={editPrompt}
                  onChange={e=>setEditPrompt(e.target.value)}
                  placeholder="Pl: Változtasd sötétre a témát..."
                  style={{
                    width:"100%", minHeight:70, background:"var(--bg2)",
                    border:"1px solid var(--b2)", borderRadius:10, padding:10,
                    color:"var(--t)", fontSize:13, resize:"vertical",
                    fontFamily:"'Syne',sans-serif"
                  }}
                />
                <button onClick={()=>edit(editPrompt)} disabled={loading} style={{
                  width:"100%", marginTop:8, padding:11,
                  background:"var(--bg3)", border:"1px solid var(--b2)",
                  color:"var(--t)", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer"
                }}>✏️ Szerkesztés alkalmazása</button>

                {/* Quick edits */}
                <div style={{ marginTop:12 }}>
                  <button onClick={()=>setShowQuick(!showQuick)} style={{
                    width:"100%", background:"var(--bg2)", border:"1px solid var(--b2)",
                    borderRadius:8, padding:"8px 12px", color:"var(--t2)",
                    fontSize:12, cursor:"pointer", textAlign:"left"
                  }}>
                    {showQuick?"▲":"▼"} Gyors módosítások
                  </button>
                  {showQuick && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:6 }}>
                      {QUICK_EDITS.map((qe,i)=>(
                        <button key={i} onClick={()=>edit(qe.prompt)} disabled={loading} style={{
                          padding:"10px 8px", background:"var(--bg2)",
                          border:"1px solid var(--b2)", borderRadius:10,
                          color:"var(--t2)", fontSize:11, cursor:"pointer",
                          textAlign:"center", lineHeight:1.4
                        }}>
                          <div style={{ fontSize:18 }}>{qe.icon}</div>
                          <div style={{ marginTop:4 }}>{qe.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW TAB */}
        {tab==="preview" && (
          <div style={{ padding:14 }}>
            {html ? (
              <>
                <div style={{ background:"var(--bg2)", border:"1px solid var(--green)",
                              borderRadius:12, padding:16, marginBottom:12, textAlign:"center" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                  <div style={{ fontWeight:800, fontSize:16, color:"var(--green)", marginBottom:4 }}>
                    Weboldal kész!
                  </div>
                  <div style={{ fontSize:12, color:"var(--t3)" }}>
                    {html.split("\n").length} sor · {Math.round(html.length/1024)} KB
                  </div>
                </div>
                <button onClick={openPreview} style={{
                  width:"100%", padding:14, background:"var(--blue)", color:"#000",
                  border:"none", borderRadius:10, fontWeight:900, fontSize:14,
                  cursor:"pointer", marginBottom:8
                }}>🌐 Megnyitás böngészőben</button>
                <button onClick={()=>setTab("deploy")} style={{
                  width:"100%", padding:12, background:"var(--green-d)",
                  border:"1px solid var(--green)", borderRadius:10,
                  color:"var(--green)", fontWeight:700, fontSize:13, cursor:"pointer"
                }}>🚀 Feltöltés Firebase-re →</button>
              </>
            ) : (
              <div style={{ textAlign:"center", paddingTop:60 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✨</div>
                <div style={{ color:"var(--t3)", fontSize:13 }}>Generálj egy weboldalt az AI tabban!</div>
              </div>
            )}
          </div>
        )}

        {/* CODE TAB */}
        {tab==="code" && (
          <div style={{ padding:14 }}>
            {html ? (
              <>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <button onClick={()=>{
                    const code = document.getElementById("code-area").value;
                    setHtml(code);
                    setStatus("✅ Kód alkalmazva!");
                  }} style={{
                    flex:1, padding:10, background:"var(--green)", color:"#fff",
                    border:"none", borderRadius:8, fontWeight:700, cursor:"pointer"
                  }}>✓ Alkalmazás</button>
                  <button onClick={()=>{
                    navigator.clipboard?.writeText(html);
                    setStatus("📋 Másolva!");
                  }} style={{
                    flex:1, padding:10, background:"var(--bg3)",
                    border:"1px solid var(--b2)", borderRadius:8,
                    color:"var(--t2)", fontWeight:700, cursor:"pointer"
                  }}>📋 Másolás</button>
                </div>
                <textarea
                  id="code-area"
                  defaultValue={html}
                  style={{
                    width:"100%", minHeight:400, background:"#0d1117",
                    border:"1px solid var(--b)", borderRadius:10, padding:12,
                    color:"#c9d1d9", fontSize:10, fontFamily:"'JetBrains Mono',monospace",
                    lineHeight:1.6, resize:"vertical"
                  }}
                />
              </>
            ) : (
              <div style={{ textAlign:"center", paddingTop:60, color:"var(--t3)", fontSize:13 }}>
                Nincs HTML tartalom még.
              </div>
            )}
          </div>
        )}

        {/* DEPLOY TAB */}
        {tab==="deploy" && (
          <div style={{ padding:14 }}>
            <div style={{ background:"var(--bg2)", border:"1px solid var(--b)",
                          borderRadius:12, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--t2)", marginBottom:8 }}>
                🔥 Firebase Hosting
              </div>
              <div style={{ fontSize:12, color:"var(--t3)", marginBottom:4 }}>Cél:</div>
              <div style={{ fontSize:12, color:"var(--blue)", fontFamily:"'JetBrains Mono',monospace" }}>
                {HOSTING_URL}
              </div>
            </div>

            {!html ? (
              <div style={{ textAlign:"center", color:"var(--t3)", fontSize:13, paddingTop:20 }}>
                Először generálj egy weboldalt!
              </div>
            ) : (
              <button onClick={async()=>{
                setDeploying(true);
                setStatus("Feltöltés...");
                try {
                  // Get token
                  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
                    method:"POST",
                    headers:{"Content-Type":"application/x-www-form-urlencoded"},
                    body: new URLSearchParams({
                      grant_type:"refresh_token",
                      refresh_token:"1//03C5sWeP9Fi3iCgYIARAAGAMSNwF-L9IrsOuS-jfyK0yCkYHCzgunq6UAJJzGXTUbAmO6IILXxLF_rwoILaENZRENqrS19feMijA",
                      client_id:"563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
                      client_secret:"j9iVZfS8ggCpz5YCkFQkQBxd",
                    })
                  });
                  const tokenData = await tokenRes.json();
                  const token = tokenData.access_token;
                  if (!token) throw new Error("Token hiba");

                  // Create version
                  setStatus("Verzió létrehozása...");
                  const vRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${FIREBASE_PROJECT_ID}/versions`,{
                    method:"POST",
                    headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
                    body: JSON.stringify({config:{headers:[{glob:"**",headers:{"Cache-Control":"no-cache"}}]}})
                  });
                  const vData = await vRes.json();
                  const vname = vData.name;

                  // SHA256
                  const enc = new TextEncoder();
                  const htmlBytes = enc.encode(html);
                  const hashBuffer = await crypto.subtle.digest("SHA-256", htmlBytes);
                  const sha = Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,"0")).join("");

                  // Populate
                  setStatus("Fájlok regisztrálása...");
                  const popRes = await fetch(`https://firebasehosting.googleapis.com/v1beta1/${vname}:populateFiles`,{
                    method:"POST",
                    headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
                    body: JSON.stringify({files:{"/index.html":sha}})
                  });
                  const popData = await popRes.json();
                  const uploadUrl = popData.uploadUrl;
                  const required = popData.uploadRequiredHashes || [];

                  // Upload
                  if (required.includes(sha) && uploadUrl) {
                    setStatus("Feltöltés...");
                    await fetch(`${uploadUrl}/${sha}`,{
                      method:"POST",
                      headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/octet-stream"},
                      body: htmlBytes
                    });
                  }

                  // Finalize
                  setStatus("Véglegesítés...");
                  await fetch(`https://firebasehosting.googleapis.com/v1beta1/${vname}?updateMask=status`,{
                    method:"PATCH",
                    headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json","X-HTTP-Method-Override":"PATCH"},
                    body: JSON.stringify({status:"FINALIZED"})
                  });

                  // Release
                  await fetch(`https://firebasehosting.googleapis.com/v1beta1/sites/${FIREBASE_PROJECT_ID}/releases?versionName=${vname}`,{
                    method:"POST",
                    headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
                    body: "{}"
                  });

                  setStatus("✅ Feltöltve!");
                } catch(e) {
                  setStatus(`❌ Hiba: ${e.message}`);
                }
                setDeploying(false);
              }} disabled={deploying} style={{
                width:"100%", padding:16, background:"var(--green)",
                color:"#000", border:"none", borderRadius:12,
                fontWeight:900, fontSize:15, cursor:"pointer", marginBottom:10
              }}>
                {deploying ? "Feltöltés..." : "🚀 Feltöltés Firebase-re"}
              </button>
            )}

            {status.startsWith("✅") && (
              <button onClick={()=>window.open(HOSTING_URL,"_blank")} style={{
                width:"100%", padding:12, background:"var(--blue-d)",
                border:"1px solid var(--blue)", borderRadius:10,
                color:"var(--blue)", fontWeight:700, fontSize:13, cursor:"pointer"
              }}>🌐 {HOSTING_URL} megnyitása →</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
