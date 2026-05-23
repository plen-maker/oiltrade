import { useState } from "react";
import { updateOffer, createDelivery, updateDelivery, sendMsg, processPayment } from "../hooks/useFirestore";
import { DELIVERY_STATES } from "../data/constants";
import { Modal } from "../components/UI";
import { NFCPayment } from "../components/NFCPayment";
import { sendPushToUser } from "../hooks/usePush";

// ─── OFFERS ───────────────────────────────────────────────────────────────────
export function OffersApp({ profile, offers, onClose }) {
  const [sel, setSel] = useState(null);
  const [pay, setPay] = useState(null);
  const [card, setCard] = useState({num:"",cvv:"",exp:""});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const mine = offers.filter(o=>o.toId===profile?.id&&o.status==="pending");

  const accept = async (method) => {
    setBusy(true);
    try {
      // 1. Process payment - deduct/add balance + create invoice
      await processPayment({
        offerId: sel.id,
        fromId: sel.toId,      // buyer = receiver of offer
        fromName: profile.name,
        toId: sel.fromId,      // seller = sender of offer
        toName: sel.fromName,
        amount: sel.price,
        payMethod: method,
        product: sel.productName,
        oilType: sel.oilType,
      });
      // 2. Update offer status
      await updateOffer(sel.id, { status: "accepted", payMethod: method });
      // 3. Create delivery
      await createDelivery({
        offerId: sel.id, fromId: sel.fromId, fromName: sel.fromName,
        fromLocation: sel.fromLocation, toId: sel.toId, toName: sel.toName,
        product: sel.productName, oilType: sel.oilType,
        price: sel.price, payMethod: method,
        state: DELIVERY_STATES[0], verifyCode: null, verified: false,
      });
      // 4. Notify seller
      await sendMsg(sel.fromId, profile.id, profile.name,
        `✅ ${profile.name} elfogadta az ajánlatodat! ${sel.productName} — $${sel.price} — Szállítás folyamatban.`,
        "offer_accepted"
      );
      setDone(true);
    } catch(e) {
      console.error("accept error:", e);
      alert("Hiba: " + (e.message || "Ismeretlen hiba"));
    } finally {
      setBusy(false);
    }
  };

  const decline = async () => {
    await updateOffer(sel.id,{status:"declined"});
    await sendMsg(sel.fromId, profile.id, profile.name,
      `❌ ${profile.name} elutasította az ajánlatodat: ${sel.productName}`,
      "offer_declined"
    );
    setSel(null); setPay(null);
  };

  if (done) return (
    <div className="win">
      <div className="hdr"><button className="bk" onClick={onClose}>←</button></div>
      <div className="sc" style={{ textAlign:"center",paddingTop:60 }}>
        <div style={{ fontSize:56,marginBottom:16 }}>🎉</div>
        <div style={{ fontSize:20,fontWeight:800,marginBottom:8 }}>Fizetés sikeres!</div>
        <div style={{ fontSize:13,color:"var(--t3)",marginBottom:24 }}>A szállítás megkezdődött.</div>
        <button className="btn" onClick={()=>{setDone(false);setSel(null);setPay(null);onClose();}}>Szállítás követése →</button>
      </div>
    </div>
  );

  return (
    <div className="win">
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700,fontSize:15 }}>📨 Ajánlatok</div>
          <div style={{ fontSize:11,display:"flex",alignItems:"center",gap:5,color:"var(--green)" }}><span className="rtdot"/>élő</div>
        </div>
      </div>
      <div className="sc">
        {mine.length===0?(
          <div style={{ textAlign:"center",paddingTop:60 }}>
            <div style={{ fontSize:48,marginBottom:12 }}>📭</div>
            <div style={{ color:"var(--t3)",fontSize:13 }}>Nincs új ajánlat.</div>
          </div>
        ):mine.map((o,i)=>(
          <div key={o.id} className={`card fu s${Math.min(i+1,5)}`} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700,fontSize:14,marginBottom:3 }}>{o.fromName}</div>
              <div style={{ fontSize:12,color:"var(--t3)" }}>
                <span style={{ color:"var(--blue)",fontWeight:700 }}>${o.price}</span> — {o.productName}
              </div>
              <span className="bdg blue" style={{ marginTop:4,display:"inline-block" }}>{o.oilType}</span>
            </div>
            <button className="btn sm" onClick={()=>{setSel(o);setPay(null);}}>Megnyit</button>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {sel&&!pay&&(
        <Modal onClose={()=>setSel(null)} title="Ajánlat részletei">
          <span className="bdg blue">{sel.oilType}</span>
          <div style={{ fontSize:18,fontWeight:800,marginTop:10,marginBottom:4 }}>{sel.productName}</div>
          <div style={{ color:"var(--blue)",fontSize:36,fontWeight:900,fontFamily:"'JetBrains Mono',monospace" }}>${sel.price}</div>
          {sel.serialNumber&&<div style={{ fontSize:12,color:"var(--t3)",marginTop:6,fontFamily:"'JetBrains Mono',monospace" }}>Serial: {sel.serialNumber} {sel.serialValid!==undefined&&<span style={{ color:sel.serialValid?"var(--green)":"var(--red)" }}>{sel.serialValid?"✓":"✗"}</span>}</div>}
          <div style={{ fontSize:11,color:"var(--t3)",marginTop:4 }}>📍 {sel.fromLocation} → {sel.toName}</div>
          <div style={{ display:"flex",gap:10,marginTop:18 }}>
            <button className="btn success" style={{ flex:1 }} onClick={()=>setPay("choose")}>✓ Elfogad</button>
            <button className="btn danger" style={{ flex:1 }} onClick={decline}>✗ Elutasít</button>
          </div>
        </Modal>
      )}

      {/* Payment method */}
      {pay==="choose"&&(
        <Modal onClose={()=>setPay(null)} title="Fizetési mód">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            {[{id:"card",e:"💳",l:"Bankkártya"},{id:"nfc",e:"📱",l:"NFC — Kapunál"}].map(m=>(
              <div key={m.id} className="card" style={{ textAlign:"center",padding:20,cursor:"pointer",opacity:(m.id==="nfc"&&!sel?.nfcEnabled)?0.4:1,position:"relative" }}
                onClick={()=>{
                  if(m.id==="nfc" && !sel?.nfcEnabled) {
                    alert("NFC fizetés csak a kapunál elérhető - futár aktiválja!");

                    return;
                  }
                  m.id==="nfc" ? setPay("nfc") : setPay("card");
                }}>
                <div style={{ fontSize:32,marginBottom:8 }}>{m.e}</div>
                <div style={{ fontWeight:600,fontSize:13 }}>{m.l}</div>
              </div>
            ))}
          </div>
          <button className="btn ghost sm" style={{ width:"100%",marginTop:10 }} onClick={()=>setPay(null)}>Vissza</button>
        </Modal>
      )}

      {/* Card */}
      {pay==="nfc"&&(
        <Modal onClose={()=>setPay(null)} title="📱 NFC Fizetés">
          <NFCPayment
            offer={sel}
            profile={profile}
            onSuccess={(method)=>accept(method)}
            onCancel={()=>setPay(null)}
          />
        </Modal>
      )}

      {pay==="card"&&(
        <Modal onClose={()=>setPay(null)} title="💳 Kártya adatok">
          <div style={{ marginBottom:10 }}>
            <label className="fl">Kártyaszám</label>
            <input className="inp" value={card.num} onChange={e=>setCard(c=>({...c,num:e.target.value}))} placeholder="1234 5678 9012 3456" maxLength={19} style={{ fontFamily:"'JetBrains Mono',monospace",letterSpacing:2 }} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
            <div><label className="fl">CVV</label><input className="inp" value={card.cvv} onChange={e=>setCard(c=>({...c,cvv:e.target.value}))} placeholder="123" maxLength={3} style={{ fontFamily:"'JetBrains Mono',monospace" }} /></div>
            <div><label className="fl">Lejárat</label><input className="inp" value={card.exp} onChange={e=>setCard(c=>({...c,exp:e.target.value}))} placeholder="MM/YY" maxLength={5} /></div>
          </div>
          <button className="btn full" disabled={!card.num||!card.cvv||!card.exp||busy} onClick={()=>accept(`****${card.num.slice(-4)}`)}>
            {busy?"Feldolgozás...":` Fizetés — $${sel?.price}`}
          </button>
          <button className="btn ghost sm" style={{ width:"100%",marginTop:8 }} onClick={()=>setPay("choose")}>Vissza</button>
        </Modal>
      )}
    </div>
  );
}

// ─── DELIVERY ─────────────────────────────────────────────────────────────────
export function DeliveryApp({ profile, deliveries, onClose }) {
  const [inputs, setInputs] = useState({});
  const [codes, setCodes] = useState({});

  const mine = deliveries.filter(d=>d.fromId===profile?.id||d.toId===profile?.id);
  const SI = ["📦","🔄","✈","🚪","✅"];
  const ALL = [...DELIVERY_STATES,"kézbesítve"];

  const nextState = async (d) => {
    const i = DELIVERY_STATES.indexOf(d.state);
    if (i<DELIVERY_STATES.length-1) {
      const ns = DELIVERY_STATES[i+1];
      // Auto-enable NFC when arriving at gate
      const extra = ns==="a kapu előtt" ? {nfcEnabled:true} : {};
      await updateDelivery(d.id,{state:ns,...extra});
      // Push notification for state change
      
      const pushMessages = {
        "összeszállítás alatt": { title:"🔄 Csomag összeszállítás alatt", body:`"${d.product}" — hamarosan indul!` },
        "a levegőben úton":     { title:"✈️ Csomag úton van!", body:`"${d.product}" — a levegőben, közeleg!` },
        "a kapu előtt":         { title:"📦 Csomag a kapu előtt!", body:`"${d.product}" — a futár a kapudnál vár!` },
        "kézbesítve":           { title:"✅ Csomag megérkezett!", body:`"${d.product}" — sikeresen átvéve!` },
      };
      if (pushMessages[ns]) {
        await sendPushToUser(d.toId, pushMessages[ns].title, pushMessages[ns].body);
        await sendMsg(d.toId,"system","OilTrade 📦",
          `${pushMessages[ns].title} — ${pushMessages[ns].body}`,
          "delivery_update"
        );
      }
      if (ns==="a kapu előtt") {
        // Seller also gets notified
        await sendPushToUser(d.fromId, "📦 Csomag kézbesítés alatt", `"${d.product}" — a vevő kapujánál!`);
      }
    }
  };

  const genCode = async (d) => {
    const code = String(Math.floor(1000+Math.random()*9000));
    setCodes(c=>({...c,[d.id]:code}));
    await updateDelivery(d.id,{verifyCode:code});
  };

  const verify = async (d) => {
    if (inputs[d.id]===d.verifyCode) {
      await updateDelivery(d.id,{verified:true,state:"kézbesítve"});
      await sendMsg(d.fromId,profile.id,profile.name,
        `🎉 Sikeres kézbesítés! "${d.product}" átvette ${profile.name}. Tranzakció lezárva.`,
        "delivery_confirmed"
      );
    }
  };

  return (
    <div className="win">
      <div className="hdr">
        <button className="bk" onClick={onClose}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700,fontSize:15 }}>🚚 Szállítások</div>
          <div style={{ fontSize:11,display:"flex",alignItems:"center",gap:5,color:"var(--green)" }}><span className="rtdot"/>élő</div>
        </div>
      </div>
      <div className="sc">
        {mine.length===0?(
          <div style={{ textAlign:"center",paddingTop:60 }}>
            <div style={{ fontSize:48,marginBottom:12 }}>📦</div>
            <div style={{ color:"var(--t3)",fontSize:13 }}>Nincs aktív szállítás.</div>
          </div>
        ):mine.map((d,i)=>{
          const isSender=d.fromId===profile?.id;
          const isRecv=d.toId===profile?.id;
          const si=d.verified?4:DELIVERY_STATES.indexOf(d.state);
          const prog=((si+1)/5)*100;

          return (
            <div key={d.id} className={`card fu s${Math.min(i+1,5)}`}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:14,marginBottom:2 }}>{d.product}</div>
                  <div style={{ fontSize:11,color:"var(--t3)" }}>{d.fromName} → {d.toName}</div>
                </div>
                <span className={`bdg ${d.verified?"green":si===3?"gold":"dim"}`}>{d.verified?"✅ Kézbesítve":d.state}</span>
              </div>

              {/* Progress */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-around",marginBottom:8 }}>
                  {SI.map((ic,x)=>(
                    <span key={x} style={{ fontSize:16,color:x<=si?(x===si?"var(--blue)":"var(--green)"):"var(--t3)",filter:x===si?"drop-shadow(0 0 6px var(--blue))":"none" }}>{ic}</span>
                  ))}
                </div>
                <div className="pt" style={{ height:5,borderRadius:4 }}>
                  <div className={`pf${d.verified?" done":""}`} style={{ width:`${prog}%`,height:"100%",borderRadius:4 }} />
                </div>
                <div style={{ fontSize:10,color:"var(--t3)",textAlign:"center",marginTop:5 }}>{d.verified?"Kézbesítve ✅":ALL[si]}</div>
              </div>

              {/* Info */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,background:"var(--bg)",borderRadius:9,padding:"9px 10px",marginBottom:10 }}>
                <div><div style={{ fontSize:9,color:"var(--t3)",textTransform:"uppercase",marginBottom:2 }}>ÖSSZEG</div><div style={{ color:"var(--blue)",fontWeight:800,fontFamily:"'JetBrains Mono',monospace",fontSize:13 }}>${d.price}</div></div>
                <div><div style={{ fontSize:9,color:"var(--t3)",textTransform:"uppercase",marginBottom:2 }}>FIZETÉS</div><div style={{ fontSize:11 }}>{d.payMethod}</div></div>
                <div><div style={{ fontSize:9,color:"var(--t3)",textTransform:"uppercase",marginBottom:2 }}>TÍPUS</div><div style={{ fontSize:11 }}>{d.oilType}</div></div>
              </div>

              {d.state==="a kapu előtt"&&!d.verified&&(
                <div className="fi" style={{ background:"var(--gold-d)",border:"1px solid #f0b84030",borderRadius:9,padding:"9px 12px",marginBottom:10,fontSize:12,color:"var(--gold)" }}>
                  📦 A csomag a kapu előtt van! Vedd át!
                </div>
              )}

              {isSender&&!d.verified&&d.state!=="a kapu előtt"&&(
                <button className="btn ghost sm" onClick={()=>nextState(d)}>Következő állapot →</button>
              )}

              {isRecv&&d.state==="a kapu előtt"&&!d.verified&&!codes[d.id]&&(
                <button className="btn sm" onClick={()=>genCode(d)}>Átvételi kód kérése</button>
              )}
              {isRecv&&d.state==="a kapu előtt"&&!d.verified&&codes[d.id]&&(
                <div className="fi">
                  <div style={{ fontSize:12,marginBottom:6 }}>Add meg ezt a kódot a futárnak:</div>
                  <div style={{ fontSize:32,fontWeight:900,color:"var(--blue)",fontFamily:"'JetBrains Mono',monospace",marginBottom:8 }}>{codes[d.id]}</div>
                </div>
              )}

              {isSender&&d.state==="a kapu előtt"&&!d.verified&&d.verifyCode&&(
                <div className="fi" style={{ marginTop:8 }}>
                  <div style={{ fontSize:11,color:"var(--t3)",marginBottom:6 }}>Add meg az átvételi kódot:</div>
                  <div style={{ display:"flex",gap:8 }}>
                    <input className="inp" style={{ width:90,fontFamily:"'JetBrains Mono',monospace",fontSize:20,textAlign:"center",letterSpacing:4 }}
                      value={inputs[d.id]||""} onChange={e=>setInputs(v=>({...v,[d.id]:e.target.value}))}
                      placeholder="----" maxLength={4} />
                    <button className="btn success sm" onClick={()=>verify(d)}>Igazolás ✓</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
