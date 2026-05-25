import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, onSnapshot, addDoc } from "firebase/firestore";


const GOOGLE_PAY_CONFIG = {
  environment: "TEST",
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [{
    type: "CARD",
    parameters: {
      allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
      allowedCardNetworks: ["MASTERCARD", "VISA", "AMEX"],
    },
    tokenizationSpecification: {
      type: "PAYMENT_GATEWAY",
      parameters: { gateway: "example", gatewayMerchantId: "oiltrade" },
    },
  }],
  merchantInfo: { merchantId: "BCR2DN4T27ZPJGCJ", merchantName: "OilTrade" },
};

export function CatPayApp({ onClose, profile }) {
  const [tab, setTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [payTo, setPayTo] = useState("");
  const [payNote, setPayNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [gpayReady, setGpayReady] = useState(false);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (!profile?.id) return;
    const unsub = collection(db, "transactions")
      .where("userId", "==", profile.id)
      .orderBy("createdAt", "desc")
      .limit(20)
      .onSnapshot(snap => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => setLoading(false));

    // Load saved cards
    collection(db, "cards").where("userId", "==", profile.id).get().then(snap => {
      setCards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Check Google Pay availability
    checkGooglePay();
    return () => unsub();
  }, [profile?.id]);

  const checkGooglePay = () => {
    if (window.google?.payments?.api) {
      const client = new window.google.payments.api.PaymentsClient({ environment: "TEST" });
      client.isReadyToPay({
        ...GOOGLE_PAY_CONFIG,
        allowedPaymentMethods: GOOGLE_PAY_CONFIG.allowedPaymentMethods,
      }).then(res => setGpayReady(res.result)).catch(() => setGpayReady(false));
    }
  };

  const processGooglePay = async (amount, note) => {
    if (!window.google?.payments?.api) {
      // Simulate for demo
      return simulatePayment(amount, note, "Google Pay");
    }
    const client = new window.google.payments.api.PaymentsClient({ environment: "TEST" });
    try {
      const data = await client.loadPaymentData({
        ...GOOGLE_PAY_CONFIG,
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: parseFloat(amount).toFixed(2),
          currencyCode: "USD",
          countryCode: "HU",
        },
      });
      await saveTransaction(amount, note, "Google Pay", data.paymentMethodData?.description);
      return true;
    } catch(e) {
      if (e.statusCode !== "CANCELED") alert("❌ Google Pay hiba: " + e.message);
      return false;
    }
  };

  const simulatePayment = async (amount, note, method) => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    await saveTransaction(amount, note, method, "•••• 4242");
    setProcessing(false);
    return true;
  };

  const saveTransaction = async (amount, note, method, cardInfo) => {
    const txId = "TX-" + Date.now();
    await collection(db, "transactions").add({
      txId, userId: profile?.id,
      amount: parseFloat(amount),
      note, method, cardInfo,
      status: "completed",
      createdAt: new Date(),
    });
    // Add to emailQueue
    await collection(db, "emailQueue").add({
      to: profile?.email || "",
      subject: `CatPay tranzakció: $${amount}`,
      orderId: txId,
      html: `<h2>Tranzakció visszaigazolás</h2><p>Összeg: $${amount}</p><p>Megjegyzés: ${note}</p><p>Fizetési mód: ${method}</p>`,
      createdAt: new Date(), sent: false,
    });
    setPayAmount(""); setPayTo(""); setPayNote("");
    setTab("history");
    alert("✅ Fizetés sikeres! " + txId);
  };

  const handlePay = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) { alert("Add meg az összeget!"); return; }
    setProcessing(true);
    await processGooglePay(payAmount, payNote || payTo);
    setProcessing(false);
  };

  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalSpent = transactions.reduce((s, t) => s + (t.amount || 0), 0);

  const methodIcon = (m) => ({ "Google Pay":"G", "Bankkártya":"💳", "Utalás":"🏦", "Escrow":"🔐" })[m] || "💳";

  return (
    <div className="win" style={{ display:"flex", flexDirection:"column" }}>
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:900, fontSize:15 }}>🐾 CatPay</div>
          <div style={{ fontSize:10, color:"var(--t3)" }}>Google Pay · Bankkártya · Utalás</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ borderBottom:"1px solid var(--b)" }}>
        {[["overview","💰 Áttekintés"],["pay","💳 Fizetés"],["history","📋 Előzmények"],["cards","🃏 Kártyák"]].map(([id,l])=>(
          <button key={id} className={`tab${tab===id?" on":""}`} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>

      <div style={{ flex:1, overflow:"auto" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ padding:16 }}>
            {/* Balance card */}
            <div style={{
              background:"linear-gradient(135deg,#1a0a28,#0a0516)",
              border:"1px solid rgba(99,102,241,.3)",
              borderRadius:16, padding:24, marginBottom:16, position:"relative", overflow:"hidden"
            }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,#6366f1,transparent)" }} />
              <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", fontWeight:700, letterSpacing:".1em", marginBottom:8 }}>EGYENLEG</div>
              <div style={{ fontSize:36, fontWeight:900, color:"#fff" }}>${fmt(profile?.balance || 0)}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:4 }}>USD · OilTrade fiók</div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                ["💸 Elköltve", "$"+fmt(totalSpent), "var(--red)"],
                ["📊 Tranzakciók", transactions.length+" db", "var(--blue)"],
              ].map(([l,v,c])=>(
                <div key={l} style={{ background:"var(--bg2)", border:"1px solid var(--b)", borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:11, color:"var(--t3)", marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:c }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Google Pay button */}
            <div style={{ background:"var(--bg2)", border:"1px solid var(--b)", borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--t2)", marginBottom:10 }}>GYORS FIZETÉS</div>
              <button onClick={()=>setTab("pay")} style={{
                width:"100%", padding:14, background:"#000", color:"#fff",
                border:"none", borderRadius:10, fontWeight:700, fontSize:14,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8
              }}>
                <span style={{ fontSize:16, fontWeight:900, fontFamily:"'Product Sans',sans-serif" }}>G</span>
                Google Pay
              </button>
            </div>

            {/* Recent */}
            <div style={{ fontSize:12, fontWeight:700, color:"var(--t3)", marginBottom:10, letterSpacing:".06em" }}>LEGUTÓBBI</div>
            {transactions.slice(0,3).map(tx => (
              <div key={tx.id} style={{
                background:"var(--bg2)", border:"1px solid var(--b)",
                borderRadius:10, padding:12, marginBottom:8,
                display:"flex", alignItems:"center", gap:12
              }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"var(--bg3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                  {methodIcon(tx.method)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{tx.note || tx.method}</div>
                  <div style={{ fontSize:11, color:"var(--t3)" }}>{tx.method} · {tx.txId}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:800, color:"var(--red)" }}>-${fmt(tx.amount)}</div>
              </div>
            ))}
            {transactions.length === 0 && !loading && (
              <div style={{ textAlign:"center", color:"var(--t3)", fontSize:13, padding:20 }}>Nincs tranzakció még</div>
            )}
          </div>
        )}

        {/* PAY */}
        {tab === "pay" && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>💳 Fizetés</div>

            {/* Amount */}
            <div style={{ background:"var(--bg2)", border:"1px solid var(--b)", borderRadius:14, padding:20, marginBottom:14, textAlign:"center" }}>
              <div style={{ fontSize:12, color:"var(--t3)", marginBottom:8 }}>ÖSSZEG (USD)</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                <span style={{ fontSize:28, fontWeight:900, color:"var(--accent)" }}>$</span>
                <input
                  type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)}
                  placeholder="0.00" min="0" step="0.01"
                  style={{ fontSize:36, fontWeight:900, background:"transparent", border:"none",
                    color:"var(--t)", width:160, textAlign:"center", outline:"none" }}
                />
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, marginBottom:5 }}>MEGJEGYZÉS</div>
              <input value={payNote} onChange={e=>setPayNote(e.target.value)} placeholder="pl. Rendelés #1234"
                style={{ width:"100%", background:"var(--bg2)", border:"1px solid var(--b2)",
                  borderRadius:8, padding:"10px 12px", color:"var(--t)", fontSize:13 }} />
            </div>

            {/* Payment methods */}
            <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, marginBottom:8 }}>FIZETÉSI MÓD</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {[
                { id:"gpay", icon:"G", label:"Google Pay", color:"#000" },
                { id:"card", icon:"💳", label:"Bankkártya", color:"var(--bg3)" },
                { id:"transfer", icon:"🏦", label:"Utalás", color:"var(--bg3)" },
                { id:"escrow", icon:"🔐", label:"Escrow", color:"var(--bg3)" },
              ].map(m => (
                <button key={m.id} onClick={()=>simulatePayment(payAmount||"0", payNote||m.label, m.label)}
                  disabled={processing || !payAmount}
                  style={{
                    padding:"12px 8px", background:m.color, color:m.id==="gpay"?"#fff":"var(--t)",
                    border:"1px solid var(--b2)", borderRadius:10, cursor:"pointer",
                    fontWeight:700, fontSize:13, display:"flex", flexDirection:"column",
                    alignItems:"center", gap:5, opacity:!payAmount?0.5:1
                  }}>
                  <span style={{ fontSize:20 }}>{m.icon}</span>
                  <span style={{ fontSize:11 }}>{m.label}</span>
                </button>
              ))}
            </div>

            {processing && (
              <div style={{ textAlign:"center", padding:16, color:"var(--t2)" }}>
                <div className="spin" style={{ margin:"0 auto 8px" }} />
                Feldolgozás...
              </div>
            )}

            {/* Quick amounts */}
            <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, marginBottom:8 }}>GYORS ÖSSZEG</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["10","50","100","500","1000"].map(a => (
                <button key={a} onClick={()=>setPayAmount(a)} style={{
                  background:"var(--bg2)", border:"1px solid var(--b2)",
                  borderRadius:8, padding:"7px 14px", color:"var(--t2)",
                  fontSize:13, fontWeight:600, cursor:"pointer"
                }}>${a}</button>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>📋 Tranzakciók</div>
            {loading && <div style={{ textAlign:"center", color:"var(--t3)" }}>Betöltés...</div>}
            {!loading && transactions.length === 0 && (
              <div style={{ textAlign:"center", color:"var(--t3)", padding:30 }}>Nincs tranzakció</div>
            )}
            {transactions.map(tx => (
              <div key={tx.id} style={{
                background:"var(--bg2)", border:"1px solid var(--b)",
                borderRadius:12, padding:14, marginBottom:10
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{tx.note || tx.method}</div>
                  <div style={{ fontSize:15, fontWeight:900, color:"var(--red)" }}>-${fmt(tx.amount)}</div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div style={{ fontSize:11, color:"var(--t3)" }}>{methodIcon(tx.method)} {tx.method} · {tx.cardInfo||""}</div>
                  <div style={{ fontSize:11, color:"var(--green)", fontWeight:600 }}>✓ {tx.status}</div>
                </div>
                <div style={{ fontSize:11, color:"var(--t3)", marginTop:4 }}>{tx.txId}</div>
              </div>
            ))}
          </div>
        )}

        {/* CARDS */}
        {tab === "cards" && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>🃏 Mentett kártyák</div>

            {/* Demo card */}
            <div style={{
              background:"linear-gradient(135deg,#1a0a28,#312e81)",
              borderRadius:16, padding:20, marginBottom:14, position:"relative", overflow:"hidden"
            }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", letterSpacing:".15em", marginBottom:16 }}>VISA</div>
              <div style={{ fontSize:18, fontWeight:700, letterSpacing:".15em", color:"#fff", marginBottom:16 }}>
                •••• •••• •••• 4242
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div><div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>NÉVJEGY</div><div style={{ fontSize:13, color:"#fff", fontWeight:600 }}>{profile?.name||"OilTrade User"}</div></div>
                <div><div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>LEJÁRAT</div><div style={{ fontSize:13, color:"#fff", fontWeight:600 }}>12/27</div></div>
              </div>
            </div>

            <button style={{
              width:"100%", padding:13, background:"var(--bg2)",
              border:"2px dashed var(--b2)", borderRadius:12,
              color:"var(--t3)", fontSize:13, fontWeight:600, cursor:"pointer"
            }}>+ Új kártya hozzáadása</button>

            <div style={{ marginTop:20, padding:14, background:"var(--bg2)", border:"1px solid var(--b)", borderRadius:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--t2)", marginBottom:8 }}>🔒 Biztonság</div>
              <div style={{ fontSize:12, color:"var(--t3)", lineHeight:1.6 }}>
                Kártyaadataid titkosítva tárolódnak. Google Pay esetén a tényleges kártyaszámot soha nem küldjük el.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
