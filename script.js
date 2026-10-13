const $=s=>document.querySelector(s),sleep=t=>new Promise(r=>setTimeout(r,t)),rnd=n=>Math.floor(Math.random()*n),fmt=n=>'₹'+n.toLocaleString('en-IN');
const N=[['Auth API','🔐','Login'],['Catalog','📦','Browse'],['Cart','🛒','Add to cart'],['Payment','💳','Pay'],['Inventory','🗄️','Reserve stock']];
const SC={pay:[3,'crash'],inv:[4,'slow'],cat:[1,'crash']};
const PB={crash:['Cause found: the service stopped running (out of memory).','Restarting it automatically...','Waiting until it reports healthy...'],slow:['Cause found: the service is overloaded.','Adding extra capacity...','Clearing its cache...']};
const P=[{n:'Phone',i:'📱',p:20000,s:25,m:25},{n:'Laptop',i:'💻',p:55000,s:10,m:10},{n:'Headphones',i:'🎧',p:2000,s:50,m:50},{n:'Smartwatch',i:'⌚',p:8000,s:15,m:15}];
const st=N.map(()=>({f:null,rec:false,lat:0}));let busy=false,active=-1,healed=0,ok=0,rev=0,fixes=[],ph={ok:true},open=new Map();
function renderInv(){const box=$('#inv');
if(!box.children.length)box.innerHTML=P.map((p,k)=>`<div class="pc" id="pc${k}"><div class="pe">${p.i}</div><b>${p.n}</b><br><small>${fmt(p.p)}</small><div class="pn" id="pn${k}"></div><div class="pb"><i id="pi${k}"></i></div><span class="ps" id="pp${k}"></span></div>`).join('');
const pv=window.pv=window.pv||{};let tot=0,val=0,low=0;
P.forEach((p,k)=>{tot+=p.s;val+=p.s*p.p;const lw=Math.ceil(p.m*.3),c=p.s===0?'Out':p.s<=lw?'Low':'In';if(c!=='In')low++;
 $('#pn'+k).innerHTML=`${p.s}<small> / ${p.m} units</small>`;const b=$('#pi'+k);b.style.width=100*p.s/p.m+'%';b.style.background=c==='Out'?'var(--re)':c==='Low'?'var(--am)':'var(--gr)';
 const s=$('#pp'+k);s.className='ps '+c;s.textContent=c==='Out'?'OUT OF STOCK':c==='Low'?'LOW STOCK':'IN STOCK';
 if(pv[k]!==undefined&&pv[k]!==p.s){const e=$('#pc'+k);e.classList.remove('sold','rest');void e.offsetWidth;e.classList.add(p.s<pv[k]?'sold':'rest')}pv[k]=p.s});
$('#invtop').innerHTML=`<span>Units in stock: <b>${tot}</b></span><span>Inventory value: <b>${fmt(val)}</b></span><span>Needs reorder: <b>${low}</b></span><span>${window.lastSale?'Last sale: <b>'+window.lastSale+'</b>':'Waiting for the first sale...'}</span>`;
const dn=st[1].f==='crash';box.style.opacity=dn?.45:1;const lv=$('#lv');lv.className='live'+(dn?' off':'');lv.textContent=dn?'● STALE - catalog service down':'● LIVE'}
function say(h,c=''){const e=$('#say');e.className='say '+c;e.innerHTML=h}
function render(){
 $('#pipe').innerHTML=N.map((x,i)=>{const s=st[i],c=s.rec?'fixing':!s.f?'':s.f==='crash'?'down':'slow',t=s.rec?'FIXING':!s.f?'HEALTHY':s.f==='crash'?'DOWN':'SLOW';
  return `<div class="node ${c} ${active===i?'active':''}"><div class="i">${x[1]}</div><b>${x[0]}</b><small>${x[2]}</small><div class="st">${t}</div></div>`}).join('');
 const m=fixes.length?(fixes.reduce((a,b)=>a+b,0)/fixes.length).toFixed(1)+'s':'-';
 $('#kp').innerHTML=[['Orders completed',ok],['Incidents healed',healed],['Avg fix time',m],['Revenue secured',fmt(rev)]].map(k=>`<div><span>${k[0]}</span><b>${k[1]}</b></div>`).join('');
 renderInv();
 $('#phone').innerHTML=ph.ok?`<div class="big2">🎉</div><h4>Order confirmed</h4><small>${ph.t||'Everything is working'}</small><div class="pst">✅ Customer happy</div>`
  :`<div class="big2">😕</div><h4>Payment failed</h4><small>${ph.t}</small><div class="pst">${$('#auto').checked?'🛡️ Guardian is fixing this right now':'⚠ Waiting for a human...'}</div>`}
async function probe(){
 if(busy)return;busy=true;let fail=null,pick=null;
 for(let i=0;i<5;i++){active=i;render();await sleep(380);const s=st[i];
  if(s.f){fail=i;break}
  s.lat=40+rnd(90);
  if(i===1){const it=P.filter(p=>p.s>0);if(!it.length){P.forEach(p=>p.s=p.m)}pick=P.filter(p=>p.s>0)[rnd(P.filter(p=>p.s>0).length)];say(`🤖 Robot opened the catalog and picked <b>${pick.i} ${pick.n}</b> (${fmt(pick.p)}).`)}}
 active=-1;busy=false;
 if(fail===null){ok++;rev+=pick.p;pick.s--;window.lastSale=pick.i+' '+pick.n+' at '+new Date().toLocaleTimeString();ph={ok:true,t:`${pick.n} · ${fmt(pick.p)}`};say(`✅ Test order complete: <b>${pick.n}</b> sold, stock updated.`,'o')}
 else{ph={ok:false,t:fail===3?'Please try again later':'Something went wrong'};
  say(`🚨 The robot got stuck at <b>"${N[fail][2]}"</b> (${N[fail][0]}). <b>A real customer would have been blocked here.</b> ${fail===3?'The sale is on hold.':fail===4?'Payment was taken, so an automatic refund is issued.':''}`,'w');
  if(!open.has(fail)){open.set(fail,Date.now());if($('#auto').checked)recover(fail);else say(`🚨 ${N[fail][0]} is failing. Auto-heal is OFF. <button class="btn s" id="ap">Approve fix</button>`,'w'),$('#ap').onclick=()=>recover(fail)}}
 render()}
async function recover(i){const f=st[i].f;st[i].rec=true;render();
 for(const m of PB[f]){say('🛠️ '+m);render();await sleep(1000)}
 st[i].f=null;st[i].rec=false;const t=(Date.now()-open.get(i))/1000;open.delete(i);fixes.push(t);healed++;
 ph={ok:true,t:'Back to normal'};say(`✅ <b>${N[i][0]} healed in ${t.toFixed(1)} seconds.</b> A verification order passed. No customer had to complain.`,'o');render()}
document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const [i,f]=SC[b.dataset.s];if(st[i].f||st[i].rec)return;st[i].f=f;say(`💥 You just broke <b>${N[i][0]}</b>. Watch the robot's next order...`,'w');render();setTimeout(probe,700)});
$('#rs').onclick=()=>{P.forEach(p=>p.s=p.m);render()};setInterval(probe,3500);render();probe();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');const c=e.target.querySelector('[data-n]');if(c&&!c.d){c.d=1;let v=0,t=+c.dataset.n;const k=setInterval(()=>{v+=Math.ceil(t/30);if(v>=t){v=t;clearInterval(k)}c.textContent=v},35)}}}),{threshold:.2});
document.querySelectorAll('.rv').forEach(e=>io.observe(e));
