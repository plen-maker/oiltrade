import { useState } from "react";
import Sidebar from "./components/Sidebar";
import FeedPage from "./pages/FeedPage";
import AdminPage from "./pages/AdminPage";
import EditorPage from "./pages/EditorPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import DevUpdatePage from "./pages/DevUpdatePage";
import { usePosts, useOils, useTags, useCards } from "./hooks/useFirestore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg0: #0a0d12; --bg1: #0f1319; --bg2: #151b24; --bg3: #1c2330; --bg4: #232c3d; --bg5: #2a3347;
    --accent: #f0a500; --accent2: #ffd166; --accent3: rgba(240,165,0,0.12);
    --text0: #f0f2f5; --text1: #c8cdd8; --text2: #8892a4; --text3: #50596a;
    --green: #2ecc8a; --red: #e05555; --blue: #4a9eff; --purple: #a78bfa;
    --border: rgba(255,255,255,0.06); --border2: rgba(255,255,255,0.11);
    --radius: 10px; --radius-lg: 14px; --radius-xl: 18px;
    --font-display: 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif; --font-mono: 'DM Mono', monospace;
  }
  body { background: var(--bg0); color: var(--text0); font-family: var(--font-body); font-size: 14px; line-height: 1.55; -webkit-font-smoothing: antialiased; }
  button { cursor: pointer; font-family: inherit; }
  input, textarea, select { font-family: inherit; }
  input:focus, textarea:focus, select:focus { outline: none; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--bg5); border-radius: 4px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-in { animation: fadeUp 0.25s ease both; }
`;

function LoadingScreen() {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg0)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🛢</div>
        <div style={{ fontSize: 13, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>Betöltés...</div>
      </div>
    </div>
  );
}

function AppInner() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState("feed");
  const { posts, addPost, toggleLike } = usePosts();
  const { oils, addOil, removeOil } = useOils();
  const { tags, addTag, removeTag } = useTags();
  const { cards, addCard, toggleCard, removeCard } = useCards();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  const firebaseUser = {
    name: user.displayName || "Felhasználó",
    initials: (user.displayName || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    role: user.role || "member",
    photo: user.photoURL,
    uid: user.uid,
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg0)" }}>
      <Sidebar page={page} setPage={setPage} user={firebaseUser} onLogout={logout} />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {page === "feed" && (
          <FeedPage
            posts={posts} oils={oils} tags={tags} user={firebaseUser}
            onAddPost={(post) => addPost({ ...post, authorId: user.uid, authorName: firebaseUser.name, authorInitials: firebaseUser.initials, authorPhoto: user.photoURL })}
            onToggleLike={(id) => { const p = posts.find(x => x.id === id); toggleLike(id, user.uid, p?.likedBy?.includes(user.uid)); }}
          />
        )}
        {page === "admin" && (
          <AdminPage oils={oils} tags={tags} cards={cards} posts={posts}
            onAddOil={addOil} onRemoveOil={removeOil}
            onAddTag={addTag} onRemoveTag={removeTag}
            onToggleCard={(id) => { const c = cards.find(x => x.id === id); toggleCard(id, c?.status); }}
            onRemoveCard={removeCard}
          />
        )}
        {page === "editor" && <EditorPage oils={oils} />}
        {page === "devupdate" && <DevUpdatePage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{styles}</style>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </>
  );
}
