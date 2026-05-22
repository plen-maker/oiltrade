import { useState, useRef, useEffect } from "react";

const CAT_JOBS = [
  "Senior Nap Architect",
  "Chief Biscuit Officer",
  "Head of Zoomies Department",
  "Professional Box Inspector",
  "Lead Gravity Tester",
  "Director of 3AM Operations",
  "Senior Hairball Engineer",
  "VP of Lap Warming",
  "Chief Treat Negotiator",
  "Head of Window Surveillance",
  "Principal Bird Watcher",
  "Senior Cardboard Analyst",
  "Director of Chaos Management",
  "Chief Purring Officer",
  "Lead String Coordinator",
];

const CAT_NAMES = [
  "Whiskers McFluffington",
  "Sir Fluffybottom III",
  "Princess Mittens",
  "Lord Biscuitmaker",
  "Duchess Purrington",
  "Baron von Naps",
  "Captain Zoomy",
  "Professor Pawsworth",
  "Agent Fluffclaws",
  "Dr. Meowington",
  "Count Scratchy",
  "Lady Hairball",
  "General Chaos",
  "Admiral Napsworth",
  "Chef Biscuit",
];

const CAT_AGES = ["2 éves", "3 éves", "5 éves", "7 hónapos", "1 éves", "4 éves", "6 éves"];

function useCatImages() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCat = async (id) => {
    const r = await fetch(`https://api.thecatapi.com/v1/images/search?size=med`);
    const data = await r.json();
    return {
      id: id + Date.now(),
      url: data[0].url,
      name: CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)],
      job: CAT_JOBS[Math.floor(Math.random() * CAT_JOBS.length)],
      age: CAT_AGES[Math.floor(Math.random() * CAT_AGES.length)],
    };
  };

  const loadCats = async () => {
    setLoading(true);
    try {
      const results = await Promise.all([fetchCat(1), fetchCat(2), fetchCat(3)]);
      setCats(results);
    } catch {
      // fallback random cats
      setCats(Array.from({ length: 3 }, (_, i) => ({
        id: i,
        url: `https://placekitten.com/${200 + i * 10}/${200 + i * 10}`,
        name: CAT_NAMES[i],
        job: CAT_JOBS[i],
        age: CAT_AGES[i],
      })));
    }
    setLoading(false);
  };

  useEffect(() => { loadCats(); }, []);

  const addCat = async () => {
    try {
      const cat = await fetchCat(cats.length);
      setCats(prev => [cat, ...prev]);
    } catch {}
  };

  return { cats, setCats, loading, addCat };
}

export function CatTinderApp({ onClose }) {
  const { cats, setCats, loading, addCat } = useCatImages();
  const [swipeDir, setSwipeDir] = useState(null);
  const [likes, setLikes] = useState(0);
  const [nopes, setNopes] = useState(0);
  const [superlike, setSuperlike] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, x: 0, dragging: false });
  const cardRef = useRef(null);
  const [dragX, setDragX] = useState(0);

  const topCat = cats[cats.length - 1];

  const swipe = async (dir) => {
    setSwipeDir(dir);
    if (dir === "right") setLikes(l => l + 1);
    else if (dir === "left") setNopes(n => n + 1);
    else if (dir === "up") { setSuperlike(true); setTimeout(() => setSuperlike(false), 1500); setLikes(l => l + 1); }

    setTimeout(async () => {
      setCats(prev => prev.slice(0, -1));
      setSwipeDir(null);
      setDragX(0);
      await addCat();
    }, 350);
  };

  // Touch/drag handlers
  const onStart = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    dragRef.current = { startX: x, x: 0, dragging: true };
  };

  const onMove = (e) => {
    if (!dragRef.current.dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = x - dragRef.current.startX;
    dragRef.current.x = dx;
    setDragX(dx);
  };

  const onEnd = () => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const dx = dragRef.current.x;
    if (dx > 80) swipe("right");
    else if (dx < -80) swipe("left");
    else setDragX(0);
  };

  const rotation = dragX / 15;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 300);

  return (
    <div className="win" style={{ background: "linear-gradient(180deg,#0a0614,#120820,#0a0614)" }}>
      {/* Header */}
      <div className="hdr" style={{ background: "rgba(10,6,20,0.97)", borderBottom: "1px solid #2a1a3a" }}>
        <button className="bk" onClick={onClose} style={{ background: "#1a0a2a", borderColor: "#3a1a5a", color: "#c084fc" }}>←</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: ".05em" }}>🐱 Cat Tinder</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16 }}>❤️</div>
            <div style={{ fontSize: 10, color: "#f472b6", fontWeight: 700 }}>{likes}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16 }}>💔</div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>{nopes}</div>
          </div>
        </div>
      </div>

      {/* Superlike banner */}
      {superlike && (
        <div className="fi" style={{ position: "absolute", top: 70, left: 0, right: 0, zIndex: 100, textAlign: "center", padding: "10px", background: "linear-gradient(90deg,transparent,#3b82f6,transparent)", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: ".2em" }}>
          ⭐ SUPER LIKE!
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", height: "calc(100% - 66px)", overflow: "hidden" }}>

        {loading ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, animation: "float 2s ease-in-out infinite" }}>🐱</div>
            <div style={{ color: "#c084fc", fontSize: 13, marginTop: 12 }}>Macskák keresése...</div>
          </div>
        ) : cats.length === 0 ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>😿</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Elfogytak a macskák!</div>
            <button className="btn" onClick={() => window.location.reload()} style={{ background: "#c084fc", color: "#000" }}>Újratöltés</button>
          </div>
        ) : (
          <>
            {/* Card stack background cards */}
            {cats.slice(0, -1).slice(-2).map((cat, i) => (
              <div key={cat.id} style={{
                position: "absolute",
                width: "calc(100% - 40px)",
                maxWidth: 340,
                height: 460,
                borderRadius: 20,
                background: "#1a0a2a",
                transform: `scale(${0.92 + i * 0.04}) translateY(${(1 - i) * 10}px)`,
                zIndex: i,
              }} />
            ))}

            {/* Main card */}
            <div
              ref={cardRef}
              onMouseDown={onStart}
              onMouseMove={onMove}
              onMouseUp={onEnd}
              onMouseLeave={onEnd}
              onTouchStart={onStart}
              onTouchMove={onMove}
              onTouchEnd={onEnd}
              style={{
                position: "relative",
                width: "calc(100% - 32px)",
                maxWidth: 340,
                height: 460,
                borderRadius: 20,
                overflow: "hidden",
                cursor: "grab",
                zIndex: 10,
                transform: swipeDir === "right" ? "translateX(120%) rotate(20deg)" :
                           swipeDir === "left" ? "translateX(-120%) rotate(-20deg)" :
                           swipeDir === "up" ? "translateY(-120%)" :
                           `translateX(${dragX}px) rotate(${rotation}deg)`,
                transition: swipeDir ? "transform 0.35s cubic-bezier(.22,.68,0,1.2)" : "none",
                boxShadow: "0 20px 60px rgba(0,0,0,.6), 0 0 0 1px #2a1a3a",
                userSelect: "none",
              }}
            >
              {/* Cat image */}
              <img
                src={topCat.url}
                alt={topCat.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                draggable={false}
              />

              {/* Gradient overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,0) 50%)" }} />

              {/* Like/Nope indicators */}
              {dragX > 30 && (
                <div className="fi" style={{ position: "absolute", top: 30, left: 20, border: "3px solid #4ade80", borderRadius: 8, padding: "4px 14px", color: "#4ade80", fontWeight: 900, fontSize: 22, transform: "rotate(-20deg)", letterSpacing: ".1em" }}>
                  LIKE ❤️
                </div>
              )}
              {dragX < -30 && (
                <div className="fi" style={{ position: "absolute", top: 30, right: 20, border: "3px solid #f87171", borderRadius: 8, padding: "4px 14px", color: "#f87171", fontWeight: 900, fontSize: 22, transform: "rotate(20deg)", letterSpacing: ".1em" }}>
                  NOPE 💔
                </div>
              )}

              {/* Cat info */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 18px 16px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{topCat.name}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>{topCat.age}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(192,132,252,0.2)", border: "1px solid #c084fc44", borderRadius: 20, padding: "4px 12px" }}>
                  <span style={{ fontSize: 11 }}>💼</span>
                  <span style={{ fontSize: 11, color: "#c084fc", fontWeight: 600 }}>{topCat.job}</span>
                </div>
              </div>
            </div>

            {/* Swipe hint */}
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 12, textAlign: "center" }}>
              ← húzd balra / jobbra →
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "center" }}>
              <button onClick={() => swipe("left")} style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(248,113,113,0.15)", border: "2px solid #f87171",
                fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.3)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.15)"}
              >💔</button>

              <button onClick={() => swipe("up")} style={{
                width: 46, height: 46, borderRadius: "50%",
                background: "rgba(59,130,246,0.15)", border: "2px solid #3b82f6",
                fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>⭐</button>

              <button onClick={() => swipe("right")} style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(74,222,128,0.15)", border: "2px solid #4ade80",
                fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(74,222,128,0.3)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(74,222,128,0.15)"}
              >❤️</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
