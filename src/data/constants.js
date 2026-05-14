export const ADMIN_EMAIL = "ddnemet@gmail.com";

export const LOCATIONS = [
  "Tarantula Fészek Szigete", "Nyauperth", "Catland",
];

export const OIL_TYPES = [
  "Olaj", "Kerozin", "Finomított olaj",
  "Kerozin motorolaj tartály", "Egyéb",
];

export const DELIVERY_STATES = [
  "csomagolás alatt",
  "összeszállítás alatt",
  "a levegőben úton",
  "a kapu előtt",
];

export const FLIGHT_DURATION = 300; // seconds (5 perc)

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600&family=Instrument+Serif:ital@0;1&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;overflow:hidden;background:#040b14}
body{font-family:'Syne',sans-serif;color:#e8eef5;-webkit-font-smoothing:antialiased}
button{cursor:pointer;font-family:'Syne',sans-serif}
input,select,textarea{outline:none;font-family:'Syne',sans-serif}
*{scrollbar-width:thin;scrollbar-color:#1a2a3a transparent}
*::-webkit-scrollbar{width:3px}
*::-webkit-scrollbar-thumb{background:#1a2a3a;border-radius:2px}

:root{
  --bg:#040b14;--bg2:#080f1c;--bg3:#0d1626;--bg4:#121e32;
  --b:#162030;--b2:#1e2e44;
  --t:#e8eef5;--t2:#7090b0;--t3:#3a5878;
  --blue:#4a9eff;--blue2:#6ab4ff;--blue-d:#4a9eff15;
  --green:#3ecf7a;--green-d:#3ecf7a15;
  --red:#e05555;--red-d:#e0555515;
  --gold:#f0b840;--gold-d:#f0b84015;
  --r:12px;--r2:16px;--r3:20px;
}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideLeft{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes glow{0%,100%{box-shadow:0 0 8px var(--blue)}50%{box-shadow:0 0 20px var(--blue),0 0 40px var(--blue)}}
@keyframes planefly{0%{left:-8%}100%{left:108%}}
@keyframes notifIn{from{transform:translateY(-120%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes loadBar{0%{left:-60%;width:60%}100%{left:100%;width:60%}}

.fu{animation:fadeUp .35s cubic-bezier(.22,.68,0,1.2) both}
.fi{animation:fadeIn .2s ease both}
.su{animation:slideUp .3s cubic-bezier(.22,.68,0,1.2) both}
.sd{animation:slideDown .3s cubic-bezier(.22,.68,0,1.2) both}
.sl{animation:slideLeft .3s cubic-bezier(.22,.68,0,1.2) both}
.si{animation:scaleIn .25s cubic-bezier(.22,.68,0,1.2) both}
.s1{animation-delay:.05s}.s2{animation-delay:.1s}.s3{animation-delay:.15s}
.s4{animation-delay:.2s}.s5{animation-delay:.25s}.s6{animation-delay:.3s}
.s7{animation-delay:.35s}.s8{animation-delay:.4s}

.wrap{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:#030810;position:relative;overflow:hidden}
.frame{width:390px;height:844px;background:var(--bg);border-radius:44px;border:1px solid #162030;box-shadow:0 0 0 1px #080f1c,0 40px 120px rgba(0,0,0,.9);position:relative;overflow:hidden}
.screen{position:absolute;inset:0;border-radius:44px;overflow:hidden}
@media(max-width:430px){
  .frame{width:100vw;height:100vh;border-radius:0;border:none;box-shadow:none}
  .wrap{background:#030810}
}

.win{position:absolute;inset:0;background:var(--bg);overflow:hidden;z-index:50;animation:slideUp .32s cubic-bezier(.16,.84,.44,1) forwards}
.hdr{background:rgba(4,11,20,.96);backdrop-filter:blur(24px);border-bottom:1px solid var(--b);padding:14px 18px;display:flex;align-items:center;gap:12px;padding-top:max(14px,env(safe-area-inset-top,14px))}
.bk{width:32px;height:32px;border-radius:50%;background:var(--bg3);border:1px solid var(--b2);display:flex;align-items:center;justify-content:center;color:var(--blue);font-size:15px;cursor:pointer;flex-shrink:0}
.bk:active{opacity:.6}
.sc{overflow-y:auto;padding:14px 16px 40px;height:calc(100% - 66px)}

.fl{display:block;font-size:10px;color:var(--t3);margin-bottom:4px;letter-spacing:.08em;text-transform:uppercase;font-weight:600}
.inp{width:100%;background:var(--bg2);border:1px solid var(--b2);border-radius:10px;padding:9px 12px;color:var(--t);font-size:13px;transition:border-color .2s}
.inp:focus{border-color:var(--blue)}
.inp::placeholder{color:var(--t3)}
select.inp option{background:var(--bg2)}

.btn{background:var(--blue);color:#000;border:none;border-radius:10px;padding:10px 20px;font-weight:700;font-size:13px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn.ghost{background:var(--bg3);color:var(--t2);border:1px solid var(--b2)}
.btn.ghost:active{opacity:.7}
.btn.danger{background:var(--red-d);color:var(--red);border:1px solid #e0555530}
.btn.success{background:var(--green-d);color:var(--green);border:1px solid #3ecf7a30}
.btn.sm{padding:6px 13px;font-size:12px;border-radius:8px}
.btn.full{width:100%;justify-content:center}

.card{background:var(--bg2);border:1px solid var(--b);border-radius:var(--r2);padding:15px;margin-bottom:10px;transition:border-color .2s,transform .15s}
.bdg{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
.bdg.blue{background:var(--blue-d);color:var(--blue)}
.bdg.green{background:var(--green-d);color:var(--green)}
.bdg.red{background:var(--red-d);color:var(--red)}
.bdg.gold{background:var(--gold-d);color:var(--gold)}
.bdg.dim{background:var(--bg3);color:var(--t3)}

.modal-bg{position:absolute;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:flex-end;animation:fadeIn .2s ease}
.modal{background:var(--bg2);border:1px solid var(--b2);border-radius:22px 22px 0 0;padding:22px 18px;width:100%;max-height:88%;overflow-y:auto;animation:slideUp .28s cubic-bezier(.22,.68,0,1.2)}
.mh{width:36px;height:4px;background:var(--b2);border-radius:2px;margin:0 auto 18px}

.pin-dot{width:11px;height:11px;border-radius:50%;border:1.5px solid var(--b2);transition:all .2s}
.pin-dot.on{background:var(--blue);border-color:var(--blue);transform:scale(1.2)}
.pkey{padding:14px;font-size:18px;font-weight:600;border-radius:10px;border:1px solid var(--b2);background:var(--bg3);color:var(--t);font-family:'JetBrains Mono',monospace;cursor:pointer;transition:all .12s}
.pkey:active{transform:scale(.92);background:var(--blue-d);border-color:var(--blue)}

.pt{height:3px;background:var(--b);border-radius:2px;overflow:hidden}
.pf{height:100%;background:linear-gradient(90deg,var(--blue),var(--blue2));border-radius:2px;transition:width .4s cubic-bezier(.22,.68,0,1.2)}
.pf.done{background:linear-gradient(90deg,var(--green),#6de89a)}
.rtdot{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;animation:pulse 2s infinite;box-shadow:0 0 4px var(--green)}
.photo{background:var(--bg2);border:1.5px dashed var(--b2);border-radius:10px;padding:14px;text-align:center;cursor:pointer;color:var(--t3);font-size:12px;transition:all .2s}
.photo:hover{border-color:var(--blue);color:var(--blue)}
.photo.done{border-color:var(--green);color:var(--green);background:var(--green-d);border-style:solid}
.spin{width:22px;height:22px;border:2px solid var(--b2);border-top-color:var(--blue);border-radius:50%;animation:spin .65s linear infinite}
.tabs{display:flex;gap:3px;padding:8px 14px 10px;border-bottom:1px solid var(--b)}
.tab{padding:6px 13px;border-radius:8px;border:none;background:transparent;color:var(--t3);font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s}
.tab.on{background:var(--blue-d);color:var(--blue);font-weight:600}
.notif{position:absolute;top:0;left:0;right:0;z-index:400;background:rgba(8,15,28,.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--b2);padding:12px 16px;display:flex;align-items:center;gap:10px;animation:notifIn .4s cubic-bezier(.22,.68,0,1.2)}
`;
