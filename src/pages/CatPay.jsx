import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, setDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export function CatPayApp({ onClose, profile }) {
  const [tab, setTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catpayProfile, setCatpayProfile] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Card form
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [savingCard, setSavingCard] = useState(false);

  // Pay form
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return; }

    // Load CatPay profile
    const profileUnsub = onSnapshot(doc(db, "catpay_profiles", profile.id), (snap) => {
      if (snap.exists()) {
        setCatpayProfile(snap.data());
      } else {
        setCatpayProfile(null);
      }
    });

    // Load transactions
    const txUnsub = onSnapshot(
      query(collection(db, "transactions"), where("userId","==",profile.id), orderBy("createdAt","desc"), limit(30)),
      snap => { setTransactions(snap.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false); },
      () => setLoading(false)
    );

    // Load pending payment requests (2FA)
    const reqUnsub = onSnapshot(
      query(collection(db, "catpay_requests"), where("userId","==",profile.id), where("status","==","pending")),
      snap => { setPendingRequests(snap.docs.map(d=>({id:d.id,...d.data()}))); }
    );

    return () => { profileUnsub(); txUnsub(); reqUnsub(); };
  }, [profile?.id]);

  const activateCatPay = async () => {
    if (!profile?.id) return;
    try {
      await setDoc(doc(db, "catpay_profiles", profile.id), {
        userId: profile.id,
        email: profile.email || "",
        name: profile.name || "",
        activated: true,
        activatedAt: serverTimestamp(),
        cards: [],
        balance: 0,
      });
      alert("✅ CatPay aktiválva!");
    } catch(e) { alert("❌ " + e.message); }
  };

  const saveCard = async () => {
    if (!cardNum || !cardExp || !cardCvv || !cardName) { alert("Töltsd ki az összes mezőt!"); return; }
    setSavingCard(true);
    try {
      const last4 = cardNum.replace(/\s/g,"").slice(-4);
      const brand = cardNum.startsWith("4") ? "Visa" : cardNum.startsWith("5") ? "Mastercard" : "Kártya";
      const newCard = { id: Date.now().toString(), last4, brand, exp: cardExp, name: cardName, addedAt: new Date() };
      const existing = catpayProfile?.cards || [];
      await updateDoc(doc(db, "catpay_profiles", profile.id), {
        cards: [...existing, newCard]
      });
      setCardNum(""); setCardExp(""); setCardCvv(""); setCardName("");
      setTab("cards");
      alert("✅ Kártya hozzáadva!");
    } catch(e) { alert("❌ " + e.message); }
    setSavingCard(false);
  };

  const removeCard = async (cardId) => {
    const updated = (catpayProfile?.cards||[]).filter(c=>c.id!==cardId);
    await updateDoc(doc(db, "catpay_profiles", profile.id), { cards: updated });
  };

  const confirmRequest = async (reqId, approved) => {
    try {
      await updateDoc(doc(db, "catpay_requests", reqId), {
        status: approved ? "approved" : "rejected",
        respondedAt: serverTimestamp(),
      });
      if (approved) {
        // Find the request and process payment
        const req = pendingRequests.find(r=>r.id===reqId);
        if (req) {
          const txId = "CATPAY-" + Date.now();
          await addDoc(collection(db, "transactions"), {
            txId, userId: profile.id,
            amount: req.amount, currency: "USD",
            note: req.note || req.siteName,
            method: "CatPay", status: "completed",
            ...(req.orderId ? {orderId: req.orderId} : {}),
            createdAt: serverTimestamp(),
          });
          // Notify the website via Firestore
          await updateDoc(doc(db, "catpay_requests", reqId), {
            txId, processed: true
          });
        }
      }
      alert(approved ? "✅ Fizetés jóváhagyva!" : "❌ Fizetés elutasítva.");
    } catch(e) { alert("❌ " + e.message); }
  };

  const fmt = n => parseFloat(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const totalSpent = transactions.reduce((s,t)=>s+(t.amount||0),0);
  const cards = catpayProfile?.cards || [];
  const isActivated = catpayProfile?.activated === true;

  return (
    <div className="win" style={{display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      <div className="hdr" style={{borderBottom:"1px solid var(--b)"}}>
        <button className="bk" onClick={onClose}>←</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:15}}>🐾 CatPay</div>
          <div style={{fontSize:10,color:"var(--t3)"}}>
            {isActivated ? "✅ Aktív" : "⚠️ Nem aktív"} · {cards.length} kártya
          </div>
        </div>
        {pendingRequests.length > 0 && (
          <div style={{background:"var(--red)",color:"#fff",borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:800}}>
            {pendingRequests.length} kérés
          </div>
        )}
      </div>

      {/* PENDING 2FA REQUESTS */}
      {pendingRequests.length > 0 && (
        <div style={{background:"rgba(239,68,68,.1)",border:"1px solid var(--red)",margin:12,borderRadius:12,padding:14}}>
          <div style={{fontSize:12,fontWeight:800,color:"var(--red)",marginBottom:10}}>
            🔔 Fizetési jóváhagyás szükséges!
          </div>
          {pendingRequests.map(req => (
            <div key={req.id} style={{background:"var(--bg2)",borderRadius:10,padding:12,marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:800,marginBottom:4}}>{req.siteName}</div>
              <div style={{fontSize:18,fontWeight:900,color:"var(--accent)",marginBottom:4}}>${fmt(req.amount)} USD</div>
              <div style={{fontSize:12,color:"var(--t3)",marginBottom:10}}>{req.note || "Vásárlás"}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>confirmRequest(req.id,true)} style={{
                  flex:1,padding:10,background:"var(--green)",color:"#000",
                  border:"none",borderRadius:9,fontWeight:800,fontSize:13,cursor:"pointer"
                }}>✓ Igen, én voltam</button>
                <button onClick={()=>confirmRequest(req.id,false)} style={{
                  flex:1,padding:10,background:"var(--bg3)",color:"var(--red)",
                  border:"1px solid var(--red)",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer"
                }}>✕ Nem én voltam</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs" style={{borderBottom:"1px solid var(--b)"}}>
        {[["overview","💰"],["cards","🃏"],["addcard","➕ Kártya"],["history","📋"]].map(([id,l])=>(
          <button key={id} className={"tab"+(tab===id?" on":"")} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>

      <div style={{flex:1,overflow:"auto"}}>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <div style={{padding:16}}>
            {!isActivated ? (
              <div style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:48,marginBottom:14}}>🐾</div>
                <div style={{fontSize:18,fontWeight:800,marginBottom:8}}>CatPay nincs aktiválva</div>
                <div style={{color:"var(--t3)",fontSize:13,marginBottom:24,lineHeight:1.6}}>
                  Aktiváld a CatPay-t hogy weboldalon is fizethess egy kattintással — kártya adatok begépelése nélkül.
                </div>
                <button onClick={activateCatPay} style={{
                  padding:"14px 32px",background:"var(--accent)",color:"#000",
                  border:"none",borderRadius:12,fontWeight:800,fontSize:15,cursor:"pointer"
                }}>🐾 CatPay aktiválása</button>
              </div>
            ) : (
              <div>
                {/* Balance card */}
                <div style={{background:"linear-gradient(135deg,#1a0a28,#0a0516)",border:"1px solid rgba(99,102,241,.3)",borderRadius:16,padding:22,marginBottom:14,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#6366f1,transparent)"}}/>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:700,letterSpacing:".1em",marginBottom:6}}>EGYENLEG</div>
                  <div style={{fontSize:34,fontWeight:900,color:"#fff"}}>${fmt(profile?.balance||catpayProfile?.balance||0)}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>USD</div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                  <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14}}>
                    <div style={{fontSize:11,color:"var(--t3)",marginBottom:4}}>💸 Elköltve</div>
                    <div style={{fontSize:18,fontWeight:800,color:"var(--red)"}}>${fmt(totalSpent)}</div>
                  </div>
                  <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14}}>
                    <div style={{fontSize:11,color:"var(--t3)",marginBottom:4}}>🃏 Kártyák</div>
                    <div style={{fontSize:18,fontWeight:800,color:"var(--blue)"}}>{cards.length} db</div>
                  </div>
                </div>

                {cards.length === 0 ? (
                  <div style={{background:"var(--bg2)",border:"1px dashed var(--b2)",borderRadius:12,padding:20,textAlign:"center",color:"var(--t3)"}}>
                    <div style={{fontSize:28,marginBottom:8}}>🃏</div>
                    <div style={{fontSize:13,marginBottom:12}}>Még nincs kártya hozzáadva</div>
                    <button onClick={()=>setTab("addcard")} style={{padding:"9px 20px",background:"var(--accent)",color:"#000",border:"none",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Kártya hozzáadása</button>
                  </div>
                ) : (
                  <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14}}>
                    <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:8}}>AKTÍV KÁRTYA</div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{fontSize:20}}>💳</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{cards[0].brand}</div>
                        <div style={{fontSize:12,color:"var(--t3)"}}>•••• {cards[0].last4} · {cards[0].exp}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* How it works */}
                <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14,marginTop:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",marginBottom:10}}>🐾 HOGYAN MŰKÖDIK</div>
                  {[
                    "Vásárolj bármely OilTrade oldalon",
                    "Válaszd a CatPay fizetést",
                    "Push értesítő érkezik ide",
                    "Jóváhagyod → levonás kártyáról",
                  ].map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:"var(--accent)",color:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</div>
                      <div style={{fontSize:13,color:"var(--t2)"}}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CARDS */}
        {tab==="cards" && (
          <div style={{padding:16}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>🃏 Mentett kártyák</div>
            {cards.length === 0 && (
              <div style={{textAlign:"center",color:"var(--t3)",padding:30,fontSize:13}}>Nincs kártya</div>
            )}
            {cards.map((card,i)=>(
              <div key={card.id} style={{
                background:`linear-gradient(135deg,${i%2===0?"#1a0a28,#312e81":"#0a1a28,#1a3a28"})`,
                borderRadius:14,padding:18,marginBottom:12,position:"relative"
              }}>
                <div style={{fontSize:11,color:"rgba(255,255,255,.5)",letterSpacing:".12em",marginBottom:12}}>{card.brand.toUpperCase()}</div>
                <div style={{fontSize:16,fontWeight:700,letterSpacing:".12em",color:"#fff",marginBottom:12}}>•••• •••• •••• {card.last4}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>NÉVJEGY</div>
                    <div style={{fontSize:12,color:"#fff",fontWeight:600}}>{card.name}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>LEJÁRAT</div>
                    <div style={{fontSize:12,color:"#fff",fontWeight:600}}>{card.exp}</div>
                  </div>
                  <button onClick={()=>removeCard(card.id)} style={{
                    background:"rgba(239,68,68,.2)",border:"1px solid rgba(239,68,68,.3)",
                    color:"#ef4444",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer"
                  }}>🗑</button>
                </div>
              </div>
            ))}
            <button onClick={()=>setTab("addcard")} style={{
              width:"100%",padding:12,background:"var(--bg2)",border:"2px dashed var(--b2)",
              borderRadius:12,color:"var(--t3)",fontSize:13,fontWeight:600,cursor:"pointer"
            }}>+ Új kártya hozzáadása</button>
          </div>
        )}

        {/* ADD CARD */}
        {tab==="addcard" && (
          <div style={{padding:16}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>➕ Kártya hozzáadása</div>
            {!isActivated && (
              <div style={{background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:"var(--accent)"}}>
                ⚠️ Előbb aktiváld a CatPay-t az Áttekintés fülön!
              </div>
            )}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:5}}>KÁRTYASZÁM</div>
              <input value={cardNum} onChange={e=>{let v=e.target.value.replace(/\D/g,"").substring(0,16);setCardNum(v.replace(/(.{4})/g,"$1 ").trim());}}
                placeholder="1234 5678 9012 3456" maxLength={19}
                style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"10px 12px",color:"var(--t)",fontSize:14,letterSpacing:".1em"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:5}}>LEJÁRAT</div>
                <input value={cardExp} onChange={e=>{let v=e.target.value.replace(/\D/g,"");if(v.length>2)v=v.substring(0,2)+"/"+v.substring(2,4);setCardExp(v);}}
                  placeholder="MM/YY" maxLength={5}
                  style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"10px 12px",color:"var(--t)",fontSize:14}}/>
              </div>
              <div>
                <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:5}}>CVV</div>
                <input value={cardCvv} onChange={e=>setCardCvv(e.target.value.replace(/\D/g,"").substring(0,4))}
                  placeholder="123" maxLength={4} type="password"
                  style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"10px 12px",color:"var(--t)",fontSize:14}}/>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:5}}>NÉVJEGY NEVE</div>
              <input value={cardName} onChange={e=>setCardName(e.target.value.toUpperCase())}
                placeholder="JOHN DOE"
                style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"10px 12px",color:"var(--t)",fontSize:14,textTransform:"uppercase"}}/>
            </div>
            <button onClick={saveCard} disabled={savingCard||!isActivated} style={{
              width:"100%",padding:14,background:isActivated?"var(--accent)":"var(--bg3)",
              color:isActivated?"#000":"var(--t3)",border:"none",borderRadius:10,
              fontWeight:800,fontSize:14,cursor:isActivated?"pointer":"not-allowed"
            }}>
              {savingCard?"Mentés...":"💾 Kártya mentése"}
            </button>
            <div style={{fontSize:11,color:"var(--t3)",textAlign:"center",marginTop:10}}>
              🔒 Kártyaadataid biztonságosan tárolódnak
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab==="history" && (
          <div style={{padding:16}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>📋 Tranzakciók</div>
            {loading && <div style={{textAlign:"center",color:"var(--t3)"}}>Betöltés...</div>}
            {!loading && transactions.length===0 && <div style={{textAlign:"center",color:"var(--t3)",padding:30}}>Nincs tranzakció</div>}
            {transactions.map(tx=>(
              <div key={tx.id} style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{fontSize:13,fontWeight:700}}>{tx.note||tx.method}</div>
                  <div style={{fontSize:14,fontWeight:900,color:"var(--red)"}}>-${fmt(tx.amount)}</div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{fontSize:11,color:"var(--t3)"}}>{tx.method}</div>
                  <div style={{fontSize:11,color:"var(--green)",fontWeight:600}}>✓ {tx.status}</div>
                </div>
                <div style={{fontSize:10,color:"var(--t3)",marginTop:4,fontFamily:"monospace"}}>{tx.txId}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
