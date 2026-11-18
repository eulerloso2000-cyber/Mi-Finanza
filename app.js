const KEY = "mi_finanza_v1";
const $ = (id) => document.getElementById(id);
const today = new Date().toISOString().slice(0,10);
let state = loadState();
let deferredInstall = null;

function defaultState(){
  return {
    goal:35000,
    transactions:[],
    budget:{monthlyIncome:1550,firstPercent:40,rent:null,study:null,food:200,transport:100,family:null,debt:180,other:null}
  };
}
function loadState(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw) return defaultState();
    const parsed=JSON.parse(raw);
    return {...defaultState(),...parsed,budget:{...defaultState().budget,...(parsed.budget||{})},transactions:Array.isArray(parsed.transactions)?parsed.transactions:[]};
  }catch(e){return defaultState();}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render();}
function money(n){return "S/ "+Number(n||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2});}
function monthKey(d){return String(d||"").slice(0,7);}
function monthTransactions(){const m=today.slice(0,7);return state.transactions.filter(t=>monthKey(t.date)===m);}
function totals(items){return items.reduce((a,t)=>{a[t.type]=(a[t.type]||0)+Number(t.amount);return a;},{income:0,expense:0,saving:0});}
function render(){
  const sums=totals(monthTransactions()), all=totals(state.transactions);
  const saved=all.saving||0, goal=Number(state.goal)||1, pct=Math.min(100,saved/goal*100);
  $("goalAmount").value=state.goal;
  $("savedTotal").textContent=money(saved);
  $("progressPercent").textContent=pct.toFixed(1)+"%";
  $("progressBar").style.width=pct+"%";
  $("remaining").textContent=saved>=goal?"¡Meta alcanzada!":`Te faltan ${money(goal-saved)}`;
  $("monthIncome").textContent=money(sums.income);
  $("monthExpense").textContent=money(sums.expense);
  $("totalSavings").textContent=money(saved);
  $("monthBalance").textContent=money(sums.income-sums.expense-sums.saving);
  renderList("recentList",state.transactions.slice().sort(sortNewest).slice(0,5));
  renderList("allList",state.transactions.slice().sort(sortNewest),true);
  $("movementCount").textContent=state.transactions.length+" registros";
  renderBudget();
}
function sortNewest(a,b){return (b.date||"").localeCompare(a.date||"")||(b.created||0)-(a.created||0);}
function renderList(id,items,allowDelete=false){
  const el=$(id);
  if(!items.length){el.className="movement-list empty";el.textContent="Todavía no hay movimientos registrados.";return;}
  el.className="movement-list";
  el.innerHTML=items.map(t=>{
    const sign=t.type==="income"?"+":t.type==="expense"?"−":"+";
    const cls=t.type==="income"||t.type==="saving"?"positive":"negative";
    const type=t.type==="income"?"Ingreso":t.type==="expense"?"Gasto":"Ahorro";
    return `<div class="movement"><div><div class="movement-title">${escapeHtml(t.category||type)} · ${type}</div><div class="movement-meta">${escapeHtml(t.date||"")} ${t.description?"· "+escapeHtml(t.description):""}</div></div><div class="movement-right ${cls}">${sign}${money(t.amount)} ${allowDelete?`<button class="delete" data-delete="${t.id}" aria-label="Eliminar movimiento">×</button>`:""}</div></div>`;
  }).join("");
  if(allowDelete) el.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{if(confirm("¿Eliminar este movimiento?")){state.transactions=state.transactions.filter(t=>t.id!==b.dataset.delete);save();}}));
}
function renderBudget(){
  const b=state.budget;
  ["monthlyIncome","firstPercent","rent","study","food","transport","family","debt","other"].forEach(k=>{$(k).value=b[k]??"";});
  const keys=["rent","study","food","transport","family","debt","other"];
  const known=keys.reduce((s,k)=>s+(Number(b[k])||0),0);
  $("knownExpenses").textContent=money(known);
  $("available").textContent=money(Number(b.monthlyIncome||0)-known);
  const missing=keys.filter(k=>b[k]===null||b[k]==="");
  $("budgetWarning").textContent=missing.length?`Faltan por completar: ${missing.map(k=>({rent:"alquiler",study:"estudios",family:"apoyo familiar",other:"otros gastos"}[k]||k)).join(", ")}. El disponible todavía no es tu ahorro definitivo.`:"Presupuesto completo. Revisa que estos importes representen todos tus gastos habituales.";
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===btn));
  document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id===btn.dataset.tab));
}));
$("date").value=today;
$("transactionForm").addEventListener("submit",e=>{
  e.preventDefault();
  const amount=Number($("amount").value);
  if(!Number.isFinite(amount)||amount<=0){$("formMessage").textContent="Ingresa un importe mayor que cero.";return;}
  state.transactions.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),type:$("type").value,amount,date:$("date").value,category:$("category").value,description:$("description").value.trim(),created:Date.now()});
  save();$("transactionForm").reset();$("date").value=today;$("formMessage").textContent="Movimiento guardado en este dispositivo.";
});
$("saveGoal").addEventListener("click",()=>{const v=Number($("goalAmount").value);if(v>0){state.goal=v;save();}});
$("budgetForm").addEventListener("submit",e=>{
  e.preventDefault();
  const keys=["monthlyIncome","firstPercent","rent","study","food","transport","family","debt","other"];
  keys.forEach(k=>{const v=$(k).value;state.budget[k]=v===""?null:Number(v);});
  if(state.budget.firstPercent<0||state.budget.firstPercent>100){alert("El porcentaje de quincena debe estar entre 0 y 100.");return;}
  save();alert("Presupuesto guardado.");
});
$("quickAdd").addEventListener("click",()=>{document.querySelector('[data-tab="transactions"]').click();$("amount").focus();});
$("exportBtn").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify({app:"MI FINANZA",version:1,exportedAt:new Date().toISOString(),data:state},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="mi-finanza-respaldo-"+today+".json";a.click();URL.revokeObjectURL(a.href);
});
$("importFile").addEventListener("change",async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const obj=JSON.parse(await f.text()), data=obj.data||obj;
    if(!data||!Array.isArray(data.transactions)||!data.budget)throw new Error("Formato no reconocido");
    if(confirm("Importar reemplazará los datos guardados en este dispositivo. ¿Continuar?")){state={...defaultState(),...data};save();alert("Copia importada correctamente.");}
  }catch(err){alert("No se pudo importar: "+err.message);}finally{e.target.value="";}
});
$("clearBtn").addEventListener("click",()=>{if(confirm("Esto borrará permanentemente los datos guardados en este navegador. ¿Has descargado una copia?")){state=defaultState();save();}});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("installBtn").hidden=false;});
$("installBtn").addEventListener("click",async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("installBtn").hidden=true;});
if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();
