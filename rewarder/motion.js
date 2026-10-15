/** FMV-inspired semantic motion: single-object coin flight, odometer digits, shared nav selection. */
const reduce=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const easeOut=t=>1-Math.pow(1-t,3);
const pos=(a,b,c,d,t)=>Math.pow(1-t,3)*a+3*Math.pow(1-t,2)*t*b+3*(1-t)*t*t*c+t*t*t*d;

export function rollAmount(node,cents,{animated=true}={}) {
 if(!node)return;
 const next=(cents/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 if(node.dataset.amount===next)return;
 const prev=node.dataset.amount ?? next;
 node.dataset.amount=next;
 node.setAttribute('aria-label',`累计奖励 ${next} 元`);
 // Preserve place identity (ones, tens, fraction), re-use columns by right alignment.
 const valueChars=[...next].reverse(),oldChars=[...prev].reverse();
 const out=document.createDocumentFragment();
 for(let i=valueChars.length-1;i>=0;i--){
  const ch=valueChars[i], old=oldChars[i]??'0';
  if(!/\d/.test(ch)) {const punct=document.createElement('span');punct.className='odometer-punct';punct.textContent=ch;out.append(punct);continue}
  const win=document.createElement('span');win.className='digit-window';win.setAttribute('aria-hidden','true');
  const belt=document.createElement('span');belt.className='digit-belt';
  const oldNum=/\d/.test(old)?Number(old):0,target=Number(ch);
  // Use 2 cycles to provide a rolling direction without a large visual jump.
  const frames=[];
  for(let n=0;n<30;n++)frames.push(n%10);
  belt.innerHTML=frames.map(n=>`<span>${n}</span>`).join('');
  win.append(belt);out.append(win);
  const start=10+oldNum;let end=10+target;
  if(end<start)end+=10;
  const from=-start*1.12,to=-end*1.12;
  belt.style.transform=`translateY(${(animated&&!reduce())?from:to}%)`;
  if(animated&&!reduce()){
   // Run after fragment inserted via two frames; different spring-ish durations by place.
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    belt.animate([{transform:`translateY(${from}em)`},{transform:`translateY(${to-0.08}em)`,offset:.76},{transform:`translateY(${to}em)`}],{duration:690+Math.min(5,i)*38,easing:'cubic-bezier(.19,.76,.24,1)',fill:'forwards'});
    belt.style.transform=`translateY(${to}em)`;
   }));
  }
 }
 node.replaceChildren(out);
}
export async function flyReward(origin,target,amountCents){
 if(!origin||!target||reduce())return;
 const src=origin.getBoundingClientRect(),dst=target.getBoundingClientRect();
 const a={x:src.left+src.width*.5,y:src.top+src.height*.5};
 const b={x:dst.left+dst.width*.38,y:dst.top+dst.height*.48};
 const root=document.getElementById('flight-root');
 const coin=document.createElement('div');coin.className='flying-coin';coin.textContent='✦';
 const label=document.createElement('div');label.className='flying-label';label.textContent=`+¥${(amountCents/100).toFixed(2)}`;
 root.append(coin,label);
 const x1=a.x-50,y1=a.y-130,x2=b.x+85,y2=b.y+95;
 const duration=800;
 const vibrate=()=>{try{navigator.vibrate?.(18)}catch{}};
 vibrate();
 await new Promise(resolve=>{
  let prev=0,start=null,done=false;
  function frame(stamp){
   if(start===null)start=stamp;
   const t=Math.min(1,(stamp-start)/duration),p=easeOut(t);
   const x=pos(a.x,x1,x2,b.x,p),y=pos(a.y,y1,y2,b.y,p);
   const s=1+.23*Math.sin(Math.PI*p)-.38*p;
   coin.style.transform=`translate3d(${x-24}px,${y-24}px,0) rotate(${p*520}deg) scale(${s})`;
   coin.style.opacity=String(p>.9?(1-p)/.1:1);
   label.style.transform=`translate3d(${x+9}px,${y-32}px,0) scale(${1-.15*p})`;
   label.style.opacity=String(Math.min(1,t*7)*(t>.74? (1-t)/.26:1));
   if(t-prev>.13&&t<.76){prev=t;const trace=document.createElement('i');trace.className='flight-trail';trace.style.left=`${x-5}px`;trace.style.top=`${y+3}px`;root.append(trace);trace.addEventListener('animationend',()=>trace.remove(),{once:true})}
   if(t<1)requestAnimationFrame(frame);else if(!done){done=true;coin.remove();label.remove();resolve()}
  }
  requestAnimationFrame(frame);
 });
 const r=target.getBoundingClientRect();const ring=document.createElement('span');ring.className='land-ring';ring.style.left=`${r.left+r.width*.45}px`;ring.style.top=`${r.top+r.height*.5}px`;root.append(ring);
 ring.addEventListener('animationend',()=>ring.remove(),{once:true});
 try{navigator.vibrate?.([10,25,16])}catch{}
}
export function animateNavigation(index){
 const thumb=document.getElementById('nav-thumb');if(!thumb)return;
 thumb.style.setProperty('--i',index);thumb.classList.remove('spring');void thumb.offsetWidth; if(!reduce())thumb.classList.add('spring');
}
export function pageTransition(update){
 if(!reduce()&&document.startViewTransition){const tx=document.startViewTransition(update);return tx.finished.catch(()=>{})}
 update();return Promise.resolve();
}
