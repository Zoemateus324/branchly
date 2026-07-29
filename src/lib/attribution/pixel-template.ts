/**
 * Builds the tracking pixel script for a given site.
 * The script is injected with the pixelId and baseUrl at serve time.
 *
 * Design goals:
 *   - No external dependencies
 *   - First-party cookies (visitor_id) + sessionStorage (session_id)
 *   - UTM persistence across navigation
 *   - Tracks: pageview, scroll, whatsapp_click, phone_click, form_submit, session_end
 *   - Uses sendBeacon with fetch fallback
 *   - LGPD-safe: no PII stored, no fingerprinting
 */
export function buildPixelScript(pixelId: string, baseUrl: string): string {
  return `!function(w,d,pid,base){"use strict";
var P="_bly_",CD=365,SM=30;
function uid(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==="x"?r:(r&3|8)).toString(16)})}
function gc(n){var m=d.cookie.match("(^|;)\\s*"+n+"\\s*=\\s*([^;]+)");return m?decodeURIComponent(m.pop()):""}
function sc(n,v,days){var e=new Date;e.setTime(e.getTime()+days*864e5);d.cookie=n+"="+encodeURIComponent(v)+";expires="+e.toUTCString()+";path=/;SameSite=Lax"}
function ls(k){try{return localStorage.getItem(k)||""}catch(e){return""}}
function lss(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var vid=gc(P+"vid")||ls(P+"vid")||uid();
sc(P+"vid",vid,CD);lss(P+"vid",vid);
var now=Date.now(),lts=+(sessionStorage.getItem(P+"sts")||0),sid;
if(!lts||(now-lts)>SM*6e4){sid=uid();sessionStorage.setItem(P+"sid",sid)}
else sid=sessionStorage.getItem(P+"sid")||uid();
sessionStorage.setItem(P+"sts",""+now);
var sp=new URLSearchParams(w.location.search),uk=["utm_source","utm_medium","utm_campaign","utm_content","utm_term"],fu={};
uk.forEach(function(k){var v=sp.get(k);if(v)fu[k]=v});
var hasU=Object.keys(fu).length>0;
if(hasU)sc(P+"utm",JSON.stringify(fu),CD);
var su={};try{su=JSON.parse(gc(P+"utm")||"{}")||{}}catch(e){}
var utm=hasU?fu:su;
var ua=navigator.userAgent,dev=/Mobi|Android/i.test(ua)?"mobile":/Tablet|iPad/i.test(ua)?"tablet":"desktop";
function send(type,props){
  var p=Object.assign({pixel_id:pid,session_id:sid,visitor_id:vid,event_type:type,
    page_url:w.location.href,page_title:d.title,referrer:d.referrer||null,
    device_type:dev,browser:ua.substring(0,200)},utm,props||{});
  var url=base+"/api/collect";
  var blob=new Blob([JSON.stringify(p)],{type:"application/json"});
  if(navigator.sendBeacon)navigator.sendBeacon(url,blob);
  else try{fetch(url,{method:"POST",body:JSON.stringify(p),headers:{"Content-Type":"application/json"},keepalive:true})}catch(e){}
}
send("pageview");
var mx=0,st;
w.addEventListener("scroll",function(){
  clearTimeout(st);st=setTimeout(function(){
    var pct=Math.round((w.scrollY+w.innerHeight)/Math.max(d.body.scrollHeight,1)*100);
    if(pct>mx+10){mx=pct;send("scroll",{scroll_depth:pct})}
  },500);
},{passive:true});
d.addEventListener("click",function(e){
  var el=e.target&&e.target.closest?e.target.closest("a[href],button"):null;
  if(!el)return;
  var h=el.getAttribute("href")||"";
  if(h.indexOf("wa.me")>-1||h.toLowerCase().indexOf("whatsapp")>-1)
    send("whatsapp_click",{text:(el.textContent||"").trim().substring(0,100)});
  else if(h.startsWith("tel:"))
    send("phone_click",{phone:h.replace("tel:","")});
});
d.addEventListener("submit",function(e){
  var f=e.target;send("form_submit",{form_id:f.id||f.name||null,action:f.action||null});
});
d.addEventListener("visibilitychange",function(){
  if(d.visibilityState==="hidden")send("session_end",{max_scroll:mx});
});
}(window,document,${JSON.stringify(pixelId)},${JSON.stringify(baseUrl)});`;
}
