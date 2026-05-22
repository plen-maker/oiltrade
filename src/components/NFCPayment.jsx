import { useState, useEffect, useRef } from "react";

// NFC Payment via Web NFC API (Android Chrome 89+, Capacitor WebView)
// Flow: Vevő generál kódot → mutatja az eladónak → eladó beírja → megerősítés
// PLUS: Real NFC via Web NFC API ha elérhető

function useWebNFC() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported("NDEFReader" in window);
  }, []);

  const write = async (data) => {
    const ndef = new window.NDEFReader();
    await ndef.write({
      records: [{ recordType: "text", data: JSON.stringify(data) }]
    });
  };

  const read = (onRead) => {
    const ndef = new window.NDEFReader();
    let controller = new AbortController();
    ndef.scan({ signal: controller.signal }).then(() => {
      ndef.addEventListener("reading", ({ message }) => {
        for (const record of message.records) {
          if (record.recordType === "text") {
            const decoder = new TextDecoder();
            try {
              onRead(JSON.parse(decoder.decode(record.data)));
            } catch {}
          }
        }
      });
    });
    return () => controller.abort();
  };

  return { supported, write, read };
}

export function NFCPayment({ offer, profile, onSuccess, onCancel }) {
  const [step, setStep] = useState("ready");
  const [payCode] = useState(() => Math.random().toString(36).slice(2,8).toUpperCase());
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [nfcStep, setNfcStep] = useState("idle"); // idle | writing | waiting
  const { supported, write, read } = useWebNFC();
  const stopNFC = useRef(null);

  const startNFC = async () => {
    setNfcStep("writing");
    try {
      await write({
        type: "oiltrade_payment",
        offerId: offer.id,
        amount: offer.price,
        code: payCode,
        ts: Date.now(),
      });
      setNfcStep("waiting");
      // Start reading confirmation
      stopNFC.current = read((data) => {
        if (data.type === "oiltrade_confirm" && data.code === payCode) {
          if (stopNFC.current) stopNFC.current();
          onSuccess(`NFC-${payCode}`);
        }
      });
    } catch {
      setNfcStep("idle");
      setError("NFC írás sikertelen. Használd a kód alapú módot.");
    }
  };

  useEffect(() => () => { if (stopNFC.current) stopNFC.current(); }, []);

  const confirm = () => {
    if (inputCode.toUpperCase() === payCode) {
      onSuccess(`NFC-${payCode}`);
    } else {
      setError("Hibás kód! Ellenőrizd újra.");
      setInputCode("");
    }
  };

  if (step === "ready") return (
    <div style={{ textAlign:"center",padding:"4px 0" }}>
      <div style={{ fontSize:52,marginBottom:14,animation:"float 2s ease-in-out infinite" }}>📱</div>
      <div style={{ fontSize:15,fontWeight:800,marginBottom:6 }}>NFC Fizetés</div>
      <div style={{ fontSize:12,color:"var(--t3)",marginBottom:16,lineHeight:1.7 }}>
        Tartsd össze a két telefont.<br/>Az NFC elvégzi a fizetést automatikusan.
      </div>
      <div style={{ background:"var(--bg3)",borderRadius:12,padding:"12px 16px",marginBottom:18 }}>
        <div style={{ fontSize:10,color:"var(--t3)",marginBottom:4,textTransform:"uppercase",letterSpacing:".08em" }}>Fizetés összege</div>
        <div style={{ fontSize:30,fontWeight:900,color:"var(--blue)",fontFamily:"'JetBrains Mono',monospace" }}>${offer.price}</div>
        <div style={{ fontSize:11,color:"var(--t3)",marginTop:4 }}>{offer.fromName} → {profile.name}</div>
      </div>
      {supported && (
        <button className="btn full" onClick={startNFC} style={{ marginBottom:10 }}>
          📱 NFC indítása
        </button>
      )}
      <button className="btn ghost full" onClick={() => setStep("code")} style={{ marginBottom:8 }}>
        🔢 Kód alapú fizetés
      </button>
      <button className="btn ghost full" onClick={onCancel} style={{ fontSize:11 }}>Mégsem</button>
    </div>
  );

  if (step === "nfc" || nfcStep !== "idle") return (
    <div style={{ textAlign:"center",padding:"4px 0" }}>
      <div style={{ position:"relative",width:110,height:110,margin:"0 auto 18px" }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            position:"absolute",inset:0,borderRadius:"50%",
            border:"2px solid var(--blue)",opacity:0,
            animation:`nfcRing 2s ease-out ${i*0.6}s infinite`,
          }}/>
        ))}
        <style>{`@keyframes nfcRing{0%{transform:scale(.7);opacity:.9}100%{transform:scale(1.9);opacity:0}}`}</style>
        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46 }}>📱</div>
      </div>
      <div style={{ fontSize:15,fontWeight:800,marginBottom:6,color:"var(--blue)" }}>
        {nfcStep==="writing"?"NFC előkészítés...":"Tartsd oda a másik telefont!"}
      </div>
      <div style={{ fontSize:12,color:"var(--t3)",marginBottom:16,lineHeight:1.6 }}>
        {nfcStep==="waiting"?"Hátlapot háttlaphoz — az NFC chip a telefon tetején van.":"Kis türelmet..."}
      </div>
      <div style={{ fontSize:28,fontWeight:900,color:"var(--blue)",fontFamily:"'JetBrains Mono',monospace",marginBottom:18 }}>${offer.price}</div>
      <button className="btn ghost full" onClick={()=>{if(stopNFC.current)stopNFC.current();setNfcStep("idle");setStep("code");}}>
        Váltás kód alapú módra
      </button>
    </div>
  );

  // CODE BASED
  return (
    <div style={{ padding:"4px 0" }}>
      <div style={{ textAlign:"center",marginBottom:16 }}>
        <div style={{ fontSize:30,marginBottom:8 }}>🔢</div>
        <div style={{ fontSize:14,fontWeight:700,marginBottom:4 }}>Kód alapú NFC fizetés</div>
        <div style={{ fontSize:12,color:"var(--t3)",lineHeight:1.6 }}>
          1. Mutasd ezt a kódot a másik félnek<br/>2. Ő írja be a saját appjába<br/>3. Te írd be az ő kódját
        </div>
      </div>

      {/* Your code */}
      <div style={{ background:"linear-gradient(135deg,#0a1a3a,#060d1e)",border:"1px solid var(--blue)",borderRadius:14,padding:"14px 18px",marginBottom:14,textAlign:"center" }}>
        <div style={{ fontSize:10,color:"var(--blue)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6 }}>A te kódod — mutasd meg a másik félnek</div>
        <div style={{ fontSize:34,fontWeight:900,color:"#fff",fontFamily:"'JetBrains Mono',monospace",letterSpacing:8 }}>{payCode}</div>
        <div style={{ fontSize:11,color:"var(--t3)",marginTop:6 }}>Összeg: <strong style={{ color:"var(--blue)" }}>${offer.price}</strong></div>
      </div>

      {/* Their code */}
      <div style={{ marginBottom:10 }}>
        <label className="fl">A másik fél kódja</label>
        <input className="inp" value={inputCode} onChange={e=>setInputCode(e.target.value.toUpperCase())}
          placeholder="pl. X7K3MP" maxLength={6}
          style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:22,textAlign:"center",letterSpacing:8 }} />
      </div>
      {error&&<div style={{ color:"var(--red)",fontSize:12,marginBottom:10,textAlign:"center" }}>{error}</div>}
      <button className="btn full" onClick={confirm} disabled={inputCode.length<6} style={{ marginBottom:8 }}>
        Fizetés megerősítése ✓
      </button>
      <button className="btn ghost full" onClick={onCancel} style={{ fontSize:11 }}>Mégsem</button>
    </div>
  );
}
