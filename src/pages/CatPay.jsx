import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

export function CatPayApp({ onClose, profile }) {
  const [tab, setTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);

  const CARDS = [
    { num:"•••• •••• •••• 4242", type:"VISA", exp:"12/27", color:"linear-gradient(135deg,#1a0a28,#312e81)" },
    { num:"•••• •••• •••• 8888", type:"Mastercard", exp:"09/26", color:"linear-gradient(135deg,#0a1a28,#1a3a28)" },
  ];

  useEffect(() => {
    if (!profile?.id) { setLoading(false); return; }
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", profile.id),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const unsub = onSnapshot(q, snap => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [profile?.id]);

  const pay = async (method) => {
    if (!payAmount || parseFloat(payAmount) <= 0) { alert("Add meg az összeget!"); return; }
    setProcessing(true);
    try {
      const txId = "TX-" + Date.now();
      await addDoc(collection(db, "transactions"), {
        txId, userId: profile?.id,
        amount: parseFloat(payAmount),
        currency: "USD",
        note: payNote || method,
        method,
        cardLast4: method === "Bankkártya" ? CARDS[selectedCard].num.slice(-4) : null,
        status: "completed",
        createdAt: serverTimestamp(),
      });
      // Send CatMail notification
      await addDoc(collection(db, "catmail"), {
        fromId: "system",
        fromName: "⬡ OilTrade",
        toId: profile?.id,
        toName: profile?.name || "User",
        subject: `💳 Fizetés visszaigazolás — $${payAmount}`,
        body: `Kedves ${profile?.name || "Felhasználó"}!\n\nSikeresen teljesítettél egy fizetést.\n\nRészletek:\n• Összeg: $${payAmount} USD\n• Fizetési mód: ${method}\n• Tranzakció ID: ${txId}\n• Megjegyzés: ${payNote || "-"}\n\nKöszönjük!\nOilTrade Team`,
        type: "payment",
        invoiceData: {
          "Tranzakció ID": txId,
          "Összeg": `$${payAmount} USD`,
          "Fizetési mód": method,
          "Dátum": new Date().toLocaleDateString("hu-HU"),
          "Státusz": "Teljesítve ✓",
        },
        read: false,
        createdAt: serverTimestamp(),
      });
      setPayAmount(""); setPayNote("");
      setTab("history");
      alert("✅ Fizetés sikeres!\n" + txId + "\n\nA visszaigazolás megérkezett a CatMail-be.");
    } catch(e) { alert("❌ " + e.message); }
    setProcessing(false);
  };

  const fmt = n => parseFloat(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const totalSpent = transactions.reduce((s,t)=>s+(t.amount||0),0);
  const methodIcon = m => ({"Google Pay":"G","Bankkártya":"💳","Banki utalás":"🏦","Escrow":"🔐","Akkreditív":"📜"})[m]||"💳";

  return (
    <div className="win" style={{display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      <div className="hdr" style={{borderBottom:"1px solid var(--b)"}}>
        <button className="bk" onClick={onClose}>←</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:15}}>🐾 CatPay</div>
          <div style={{fontSize:10,color:"var(--t3)"}}>Google Pay · Bankkártya · Utalás</div>
        </div>
      </div>

      <div className="tabs" style={{borderBottom:"1px solid var(--b)"}}>
        {[["overview","💰 Áttekintés"],["pay","💳 Fizetés"],["history","📋 Előzmények"],["cards","🃏 Kártyák"]].map(([id,l])=>(
          <button key={id} className={"tab"+(tab===id?" on":"")} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>

      <div style={{flex:1,overflow:"auto"}}>

        {tab==="overview" && (
          <div style={{padding:16}}>
            {/* Balance */}
            <div style={{background:"linear-gradient(135deg,#1a0a28,#0a0516)",border:"1px solid rgba(99,102,241,.3)",borderRadius:16,padding:24,marginBottom:14,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#6366f1,transparent)"}}/>
              <div style={{fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:700,letterSpacing:".1em",marginBottom:6}}>EGYENLEG</div>
              <div style={{fontSize:36,fontWeight:900,color:"#fff"}}>${fmt(profile?.balance||0)}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>USD · OilTrade fiók</div>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14}}>
                <div style={{fontSize:11,color:"var(--t3)",marginBottom:4}}>💸 Elköltve</div>
                <div style={{fontSize:20,fontWeight:800,color:"var(--red)"}}>${fmt(totalSpent)}</div>
              </div>
              <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14}}>
                <div style={{fontSize:11,color:"var(--t3)",marginBottom:4}}>📊 Tranzakciók</div>
                <div style={{fontSize:20,fontWeight:800,color:"var(--blue)"}}>{transactions.length} db</div>
              </div>
            </div>

            {/* Google Pay */}
            <button onClick={()=>setTab("pay")} style={{width:"100%",padding:14,background:"#000",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:14}}>
              <span style={{fontSize:18,fontWeight:900,fontFamily:"'Product Sans',sans-serif"}}>G</span> Google Pay-el fizetés
            </button>

            {/* Recent */}
            <div style={{fontSize:12,fontWeight:700,color:"var(--t3)",marginBottom:10,letterSpacing:".06em"}}>LEGUTÓBBI</div>
            {transactions.slice(0,5).map(tx=>(
              <div key={tx.id} style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:10,padding:12,marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{methodIcon(tx.method)}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{tx.note||tx.method}</div>
                  <div style={{fontSize:11,color:"var(--t3)"}}>{tx.txId}</div>
                </div>
                <div style={{fontSize:14,fontWeight:800,color:"var(--red)"}}>-${fmt(tx.amount)}</div>
              </div>
            ))}
            {!loading && transactions.length===0 && <div style={{textAlign:"center",color:"var(--t3)",fontSize:13,padding:20}}>Nincs tranzakció még</div>}
          </div>
        )}

        {tab==="pay" && (
          <div style={{padding:16}}>
            {/* Amount */}
            <div style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:14,padding:20,marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:12,color:"var(--t3)",marginBottom:8}}>ÖSSZEG (USD)</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                <span style={{fontSize:28,fontWeight:900,color:"var(--accent)"}}>$</span>
                <input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)}
                  placeholder="0.00" min="0" step="0.01"
                  style={{fontSize:36,fontWeight:900,background:"transparent",border:"none",color:"var(--t)",width:160,textAlign:"center",outline:"none"}}/>
              </div>
            </div>

            {/* Note */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:5}}>MEGJEGYZÉS</div>
              <input value={payNote} onChange={e=>setPayNote(e.target.value)} placeholder="pl. Rendelés #1234"
                style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--b2)",borderRadius:8,padding:"10px 12px",color:"var(--t)",fontSize:13}}/>
            </div>

            {/* Quick amounts */}
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {["10","50","100","500","1000","10000"].map(a=>(
                <button key={a} onClick={()=>setPayAmount(a)} style={{background:payAmount===a?"var(--accent)":"var(--bg2)",color:payAmount===a?"#000":"var(--t2)",border:"1px solid var(--b2)",borderRadius:8,padding:"7px 12px",fontSize:13,fontWeight:600,cursor:"pointer"}}>${a}</button>
              ))}
            </div>

            {/* Payment methods */}
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:8}}>FIZETÉSI MÓD</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {id:"gpay",icon:"G",label:"Google Pay",desc:"Gyors és biztonságos",bg:"#000",fg:"#fff"},
                {id:"card",icon:"💳",label:"Bankkártya",desc:`${CARDS[selectedCard].type} •••• ${CARDS[selectedCard].num.slice(-4)}`,bg:"var(--bg2)",fg:"var(--t)"},
                {id:"transfer",icon:"🏦",label:"Banki utalás",desc:"SWIFT / IBAN",bg:"var(--bg2)",fg:"var(--t)"},
                {id:"escrow",icon:"🔐",label:"Escrow",desc:"Nagy összegű tranzakciókhoz",bg:"var(--bg2)",fg:"var(--t)"},
                {id:"lc",icon:"📜",label:"Akkreditív",desc:"Letter of Credit",bg:"var(--bg2)",fg:"var(--t)"},
              ].map(m=>(
                <button key={m.id} onClick={()=>pay(m.label)} disabled={processing||!payAmount}
                  style={{padding:"14px 16px",background:m.bg,color:m.fg,border:"1px solid var(--b2)",borderRadius:12,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",gap:12,opacity:!payAmount?0.5:1,textAlign:"left"}}>
                  <span style={{fontSize:22,width:32,textAlign:"center"}}>{m.icon}</span>
                  <div>
                    <div style={{fontSize:14}}>{m.label}</div>
                    <div style={{fontSize:11,opacity:.6,fontWeight:400}}>{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            {processing && <div style={{textAlign:"center",padding:16,color:"var(--t2)"}}>⏳ Feldolgozás...</div>}
            <div style={{fontSize:11,color:"var(--t3)",textAlign:"center",marginTop:12}}>📧 Minden fizetésről visszaigazolás érkezik a CatMail-be</div>
          </div>
        )}

        {tab==="history" && (
          <div style={{padding:16}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>📋 Tranzakció előzmények</div>
            {loading && <div style={{textAlign:"center",color:"var(--t3)"}}>Betöltés...</div>}
            {!loading && transactions.length===0 && <div style={{textAlign:"center",color:"var(--t3)",padding:30}}>Nincs tranzakció</div>}
            {transactions.map(tx=>(
              <div key={tx.id} style={{background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{methodIcon(tx.method)}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700}}>{tx.note||tx.method}</div>
                      <div style={{fontSize:11,color:"var(--t3)"}}>{tx.method}{tx.cardLast4?" · ••••"+tx.cardLast4:""}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:15,fontWeight:900,color:"var(--red)"}}>-${fmt(tx.amount)}</div>
                    <div style={{fontSize:11,color:"var(--green)",fontWeight:600}}>✓ {tx.status}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"var(--t3)",fontFamily:"'JetBrains Mono',monospace"}}>{tx.txId}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="cards" && (
          <div style={{padding:16}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>🃏 Kártyák</div>
            {CARDS.map((card,i)=>(
              <div key={i} onClick={()=>setSelectedCard(i)} style={{
                background:card.color, borderRadius:16, padding:20, marginBottom:12,
                border:selectedCard===i?"2px solid var(--accent)":"2px solid transparent",
                cursor:"pointer", position:"relative", overflow:"hidden"
              }}>
                {selectedCard===i && <div style={{position:"absolute",top:10,right:10,background:"var(--accent)",color:"#000",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>Aktív</div>}
                <div style={{fontSize:11,color:"rgba(255,255,255,.5)",letterSpacing:".15em",marginBottom:14}}>{card.type}</div>
                <div style={{fontSize:18,fontWeight:700,letterSpacing:".12em",color:"#fff",marginBottom:16}}>{card.num}</div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div><div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>NÉVJEGY</div><div style={{fontSize:13,color:"#fff",fontWeight:600}}>{profile?.name||"OilTrade User"}</div></div>
                  <div><div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>LEJÁRAT</div><div style={{fontSize:13,color:"#fff",fontWeight:600}}>{card.exp}</div></div>
                </div>
              </div>
            ))}
            <button style={{width:"100%",padding:13,background:"var(--bg2)",border:"2px dashed var(--b2)",borderRadius:12,color:"var(--t3)",fontSize:13,fontWeight:600,cursor:"pointer"}}>+ Új kártya hozzáadása</button>
            <div style={{marginTop:16,padding:14,background:"var(--bg2)",border:"1px solid var(--b)",borderRadius:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:6}}>🔒 Biztonság</div>
              <div style={{fontSize:12,color:"var(--t3)",lineHeight:1.6}}>Kártyaadataid titkosítva tárolódnak. Google Pay esetén a tényleges kártyaszámot soha nem küldjük el harmadik félnek.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
