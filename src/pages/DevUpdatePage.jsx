import { useState, useEffect } from "react";
import { TopBar, Btn } from "../components/UI";

const GITHUB_REPO = "ddnemet-star/oiltrade";
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases`;
const CURRENT_VERSION = "3.0.0";

function VersionBadge({ v }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 11,
      background: "var(--accent3)", color: "var(--accent)",
      border: "1px solid rgba(240,165,0,0.3)",
      padding: "2px 8px", borderRadius: 6,
    }}>v{v}</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    working: { label: "✓ Működik", bg: "rgba(46,204,138,0.12)", color: "var(--green)", border: "rgba(46,204,138,0.3)" },
    broken: { label: "✕ Nem működik", bg: "rgba(224,85,85,0.12)", color: "var(--red)", border: "rgba(224,85,85,0.3)" },
    unknown: { label: "? Ismeretlen", bg: "var(--bg3)", color: "var(--text3)", border: "var(--border)" },
  };
  const s = map[status] || map.unknown;
  return (
    <span style={{
      fontSize: 11, padding: "2px 9px", borderRadius: 6,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontFamily: "var(--font-mono)",
    }}>{s.label}</span>
  );
}

function ReleaseCard({ release, onMarkStatus, statuses }) {
  const isLatest = release.tag_name === `v${CURRENT_VERSION}`;
  const status = statuses[release.tag_name] || "unknown";
  const apkAsset = release.assets?.find(a => a.name.endsWith(".apk"));
  const date = new Date(release.published_at).toLocaleDateString("hu-HU");

  return (
    <div style={{
      background: "var(--bg2)", border: `1px solid ${isLatest ? "var(--accent)" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)", padding: 14, marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--text0)" }}>
          {release.tag_name}
        </span>
        {isLatest && <span style={{ fontSize: 10, background: "var(--accent)", color: "#000", padding: "1px 7px", borderRadius: 5, fontWeight: 700 }}>CURRENT</span>}
        <StatusBadge status={status} />
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{date}</span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 12, lineHeight: 1.6 }}>
        {release.body || "Nincs leírás."}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {apkAsset && (
          <a href={apkAsset.browser_download_url} target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 8,
            background: "var(--bg3)", border: "1px solid var(--border2)",
            color: "var(--text1)", fontSize: 12, textDecoration: "none",
          }}>
            📥 APK letöltés ({(apkAsset.size / 1024 / 1024).toFixed(1)} MB)
          </a>
        )}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onMarkStatus(release.tag_name, "working")} style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer",
            border: status === "working" ? "1px solid var(--green)" : "1px solid var(--border)",
            background: status === "working" ? "rgba(46,204,138,0.15)" : "var(--bg3)",
            color: status === "working" ? "var(--green)" : "var(--text2)",
          }}>✓ Működik</button>
          <button onClick={() => onMarkStatus(release.tag_name, "broken")} style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer",
            border: status === "broken" ? "1px solid var(--red)" : "1px solid var(--border)",
            background: status === "broken" ? "rgba(224,85,85,0.15)" : "var(--bg3)",
            color: status === "broken" ? "var(--red)" : "var(--text2)",
          }}>✕ Nem működik</button>
        </div>
        {release.zipball_url && (
          <a href={`https://github.com/${GITHUB_REPO}/releases/tag/${release.tag_name}`} target="_blank" rel="noreferrer" style={{
            fontSize: 11, color: "var(--text3)", textDecoration: "none", marginLeft: "auto",
          }}>GitHub →</a>
        )}
      </div>
    </div>
  );
}

export default function DevUpdatePage() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("oiltrade_build_statuses") || "{}"); } catch { return {}; }
  });
  const [lastChecked, setLastChecked] = useState(null);

  const fetchReleases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(GITHUB_API);
      if (!res.ok) throw new Error("GitHub API hiba");
      const data = await res.json();
      setReleases(data);
      setLastChecked(new Date().toLocaleTimeString("hu-HU"));
    } catch (e) {
      setError("Nem sikerült betölteni a release-eket. Ellenőrizd az internet kapcsolatot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReleases(); }, []);

  const markStatus = (tag, status) => {
    const updated = { ...statuses, [tag]: status };
    setStatuses(updated);
    localStorage.setItem("oiltrade_build_statuses", JSON.stringify(updated));
  };

  const workingCount = Object.values(statuses).filter(s => s === "working").length;
  const brokenCount = Object.values(statuses).filter(s => s === "broken").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar title="🛠 Developer Update Panel">
        <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
          {lastChecked ? `Frissítve: ${lastChecked}` : ""}
        </span>
        <Btn onClick={fetchReleases}>🔄 Frissítés</Btn>
        <a href={`https://github.com/${GITHUB_REPO}/releases/new`} target="_blank" rel="noreferrer"
          style={{ textDecoration: "none" }}>
          <Btn primary>+ Új release</Btn>
        </a>
      </TopBar>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: 6 }}>Jelenlegi</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>v{CURRENT_VERSION}</div>
          </div>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: 6 }}>Összes release</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text0)" }}>{releases.length}</div>
          </div>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: 6 }}>Működő</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--green)" }}>{workingCount}</div>
          </div>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: 6 }}>Hibás</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--red)" }}>{brokenCount}</div>
          </div>
        </div>

        {/* Repo info */}
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
        }}>
          <span style={{ fontSize: 18 }}>📦</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text0)" }}>ddnemet-star/oiltrade</div>
            <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>github.com/{GITHUB_REPO}</div>
          </div>
          <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noreferrer" style={{ marginLeft: "auto" }}>
            <Btn small>GitHub megnyitása →</Btn>
          </a>
        </div>

        {/* Release lista */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text3)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
            GitHub release-ek betöltése...
          </div>
        )}
        {error && (
          <div style={{
            background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.3)",
            borderRadius: "var(--radius)", padding: 14, color: "var(--red)", fontSize: 13, marginBottom: 14,
          }}>
            ⚠️ {error}
            <br />
            <span style={{ fontSize: 11, color: "var(--text3)" }}>
              Ha még nincs release a repóban, hozz létre egyet a GitHub-on: Releases → Create new release
            </span>
          </div>
        )}
        {!loading && !error && releases.length === 0 && (
          <div style={{
            textAlign: "center", padding: 40, color: "var(--text3)", fontSize: 13,
            border: "1px dashed var(--border2)", borderRadius: "var(--radius-lg)",
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🚀</div>
            Még nincs release a repóban.<br />
            <a href={`https://github.com/${GITHUB_REPO}/releases/new`} target="_blank" rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "none", fontSize: 12, marginTop: 8, display: "inline-block" }}>
              Első release létrehozása →
            </a>
          </div>
        )}
        {releases.map(r => (
          <ReleaseCard key={r.id} release={r} onMarkStatus={markStatus} statuses={statuses} />
        ))}

        {/* Hogyan kell release-t feltölteni */}
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 14, marginTop: 8,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text0)", marginBottom: 10 }}>
            📋 Hogyan tölts fel új verziót?
          </div>
          <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.8 }}>
            <div>1. Buildeld le az APK-t Android Studio-ban: <code style={{ background: "var(--bg3)", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 11 }}>Build → Build APK(s)</code></div>
            <div>2. Menj a GitHub repóba: <code style={{ background: "var(--bg3)", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 11 }}>Releases → Draft new release</code></div>
            <div>3. Tag: <code style={{ background: "var(--bg3)", padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 11 }}>v3.0.1</code> (verzió szám)</div>
            <div>4. Húzd rá az APK fájlt, írj leírást, publish</div>
            <div>5. Az app automatikusan látja az új verziót itt</div>
          </div>
        </div>
      </div>
    </div>
  );
}
