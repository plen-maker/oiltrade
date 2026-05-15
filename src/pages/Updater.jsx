import { useState, useEffect } from "react";

const GITHUB_REPO = "plen-maker/oiltrade";
const CURRENT_VERSION = "__APP_VERSION__";

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0, nb = pb[i] || 0;
    if (nb > na) return true;
    if (nb < na) return false;
  }
  return false;
}

export function UpdaterApp({ onClose }) {
  const [status, setStatus] = useState("checking"); // checking | uptodate | available | error
  const [release, setRelease] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        if (!r.ok) throw new Error("GitHub hiba");
        const data = await r.json();
        const latest = data.tag_name?.replace(/^v/, "");
        const apk = data.assets?.find(a => a.name.endsWith(".apk"));
        setRelease({ version: latest, url: apk?.browser_download_url || data.html_url, name: data.name, size: apk ? Math.round(apk.size / 1024 / 1024 * 10) / 10 : null });

        // Fetch notes from Firestore
        try {
          const { getDoc, doc } = await import("firebase/firestore");
          const { db } = await import("../firebase");
          const d = await getDoc(doc(db, "app_config", "release_notes"));
          if (d.exists()) setNotes(d.data().notes || "");
        } catch {}

        if (compareVersions(CURRENT_VERSION, latest)) {
          setStatus("available");
        } else {
          setStatus("uptodate");
        }
      } catch {
        setStatus("error");
      }
    };
    check();
  }, []);

  return (
    <div className="win" style={{ background:"linear-gradient(180deg,#040b14,#060f1a)" }}>
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <b>⬆️ Frissítések</b>
      </div>

      <div className="sc" style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:40 }}>

        {/* App info */}
        <div style={{ width:80, height:80, borderRadius:20, background:"linear-gradient(135deg,#0a2a1a,#3ecf7a20)", border:"1px solid #3ecf7a30", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, marginBottom:16 }}>
          ⬡
        </div>
        <div style={{ fontSize:18, fontWeight:900, color:"var(--t)", marginBottom:4 }}>OilTrade</div>
        <div style={{ fontSize:12, color:"var(--t3)", fontFamily:"'JetBrains Mono',monospace", marginBottom:32 }}>
          Jelenlegi verzió: v{CURRENT_VERSION}
        </div>

        {/* Status */}
        {status === "checking" && (
          <div style={{ textAlign:"center" }}>
            <div className="spin" style={{ margin:"0 auto 16px" }} />
            <div style={{ color:"var(--t3)", fontSize:13 }}>Frissítések keresése...</div>
          </div>
        )}

        {status === "uptodate" && (
          <div className="card si" style={{ width:"100%", textAlign:"center", padding:24, border:"1px solid var(--green)", background:"var(--green-d)" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:16, fontWeight:800, color:"var(--green)", marginBottom:6 }}>Naprakész vagy!</div>
            <div style={{ fontSize:12, color:"var(--t3)" }}>v{CURRENT_VERSION} — ez a legújabb verzió</div>
          </div>
        )}

        {status === "available" && release && (
          <div className="card si" style={{ width:"100%", border:"1px solid var(--blue)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div style={{ fontSize:32 }}>🚀</div>
              <div>
                <div style={{ fontSize:11, color:"var(--blue)", fontWeight:700, letterSpacing:".08em" }}>ÚJ VERZIÓ ELÉRHETŐ</div>
                <div style={{ fontSize:20, fontWeight:900, color:"var(--t)" }}>v{release.version}</div>
                {release.size && <div style={{ fontSize:11, color:"var(--t3)" }}>{release.size} MB</div>}
              </div>
            </div>

            {notes && (
              <div style={{ background:"var(--bg)", borderRadius:10, padding:12, marginBottom:14 }}>
                <div style={{ fontSize:10, color:"var(--t3)", fontWeight:700, letterSpacing:".08em", marginBottom:8 }}>MI VÁLTOZOTT</div>
                {notes.split("\n").filter(l=>l.trim()).map((line,i)=>(
                  <div key={i} style={{ fontSize:12, color:"var(--t2)", marginBottom:5, lineHeight:1.5 }}>{line}</div>
                ))}
              </div>
            )}

            <a href={release.url} target="_blank" rel="noreferrer" style={{
              display:"block", textAlign:"center",
              background:"var(--blue)", color:"#000", borderRadius:12,
              padding:"14px", fontSize:14, fontWeight:800, textDecoration:"none",
              marginBottom:8
            }}>
              ⬇ Letöltés — v{release.version}
            </a>
            <div style={{ fontSize:11, color:"var(--t3)", textAlign:"center", lineHeight:1.5 }}>
              Letöltés után telepítsd az APK-t a Fájlkezelőből.{"\n"}
              Engedélyezd az "Ismeretlen forrásból" telepítést.
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="card si" style={{ width:"100%", textAlign:"center", padding:24 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>❌</div>
            <div style={{ fontSize:14, color:"var(--red)", marginBottom:8 }}>Nem sikerült ellenőrizni</div>
            <div style={{ fontSize:12, color:"var(--t3)", marginBottom:16 }}>Ellenőrizd az internet kapcsolatot!</div>
            <button className="btn ghost full" onClick={() => { setStatus("checking"); window.location.reload(); }}>
              Újrapróbálkozás
            </button>
          </div>
        )}

        {/* Manual check */}
        {status !== "checking" && (
          <div style={{ marginTop:24, width:"100%" }}>
            <div style={{ fontSize:10, color:"var(--t3)", textAlign:"center", marginBottom:8, letterSpacing:".06em" }}>
              GITHUB RELEASES
            </div>
            <a href={`https://github.com/${GITHUB_REPO}/releases`} target="_blank" rel="noreferrer"
              style={{ display:"block", textAlign:"center", color:"var(--blue)", fontSize:12, textDecoration:"none" }}>
              github.com/{GITHUB_REPO}/releases →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
