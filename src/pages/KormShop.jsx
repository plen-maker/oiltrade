import { useRef } from "react";

export function KormShopApp({ onClose }) {
  const iframeRef = useRef(null);
  return (
    <div className="win" style={{ display:"flex", flexDirection:"column", background:"#0c0802" }}>
      <div style={{ padding:"14px 16px", background:"#0c0802", borderBottom:"1px solid #1c1710", display:"flex", alignItems:"center", gap:12, paddingTop:"max(14px,env(safe-area-inset-top,14px))" }}>
        <button onClick={onClose} style={{ width:34,height:34,borderRadius:10,background:"#1c1710",border:"1px solid #2a2015",color:"#a8a29e",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>←</button>
        <div style={{ display:"flex",alignItems:"center",gap:10,flex:1 }}>
          <div style={{ width:30,height:30,borderRadius:8,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#fff" }}>K</div>
          <div>
            <div style={{ fontSize:14,fontWeight:800,color:"#fff" }}>KormShop</div>
            <div style={{ fontSize:10,color:"#57534e" }}>oiltrade-korm.web.app</div>
          </div>
        </div>
        <button onClick={()=>{ if(iframeRef.current) iframeRef.current.src=iframeRef.current.src; }} style={{ width:34,height:34,borderRadius:10,background:"#1c1710",border:"1px solid #2a2015",color:"#a8a29e",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>↻</button>
      </div>
      <div style={{ flex:1,position:"relative" }}>
        <iframe ref={iframeRef} src="https://oiltrade-korm.web.app" style={{ width:"100%",height:"100%",border:"none",display:"block" }} allow="payment; camera" title="KormShop" />
      </div>
    </div>
  );
}
