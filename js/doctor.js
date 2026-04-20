
function loadDoctorHome(){var u=getCurrentUser();document.getElementById("doctor-greeting").textContent=(u?.name||"医师")+",您好";var r=getMedicalRecords(),pts=getPatients();document.getElementById("stat-today-patients").textContent=r.length||5;document.getElementById("stat-total-patients").textContent=pts.length||30;renderTodayTasks();renderPatientQueue()}
function loadPrescriptions(){
    var recs=getMedicalRecords();
    var wmC=document.getElementById("wm-prescription-list"),wmR=recs.filter(function(r){return r.wmPrescription&&r.wmPrescription.length;});
    wmC.innerHTML=wmR.length?wmR.map(function(r){
        return "<div class='emr-card'><div class='emr-header'><strong>"+(r.patientName||"")+"</strong><span style='font-size:12px;color:#888;margin-left:auto'>"+formatDate(r.date||0)+"</span></div><div class='emr-body'><div style='font-size:14px'><b>西医诊断：</b>"+(r.wmDiagnosis||"-")+"</div></div></div>";
    }).join(""):"<div class='empty-state'>暂无西药处方</div>";
    var tcmC=document.getElementById("tcm-prescription-list"),tcR=recs.filter(function(r){return r.tcmPrescription&&r.tcmPrescription.length;});
    tcmC.innerHTML=tcR.length?tcR.map(function(r){
        return "<div class='emr-card'><div class='emr-header'><strong>"+(r.patientName||"")+"</strong><span style='font-size:12px;color:#888;margin-left:auto'>"+formatDate(r.date||0)+"</span></div><div class='emr-body'><div style='color:#795548;font-size:14px'><b>中医证型：</b>"+(r.tcmPattern||"-")+"</div>"+(r.formulaName?"<div style='color:#c9941d;font-weight:bold;font-size:15px;margin-top:8px'>方名："+r.formulaName+"</div>":"")+"</div></div>";
    }).join(""):"<div class='empty-state'>暂无中药处方</div>";
}
function renderTodayTasks(){var c=document.getElementById("doctor-today-tasks");if(c)c.innerHTML='<div class=today-task><div class=task-icon>📋</div><div class=task-info><div class=task-title>待处理报告</div></div><div class=today-task><div class=task-icon>👥</div><div class=task-info><div class=task-title>随访提醒</div></div>'}
function renderPatientQueue(){var c=document.getElementById("patient-queue"),pts=getPatients().slice(0,5);if(!pts.length){c.innerHTML="<div class=empty-state>暂无等待</div>";return}c.innerHTML=pts.map(function(p,i){return'<div class=queue-item><div class="queue-num">'+(i+1)+'</div><div class="queue-name">'+p.name+'</div></div>'}).join('')}
var consultStep=1,currPatient=null;
window.goConsultStep=function(s){consultStep=s;document.querySelectorAll(".step-content").forEach(function(x){x.classList.remove("active")});document.querySelectorAll(".step").forEach(function(x,i){x.classList.remove("active","completed");if(i+1<s)x.classList.add("completed");else if(i+1===s)x.classList.add("active")});var el=document.getElementById("consult-step-"+s);if(el)el.classList.add("active")}
window.searchPatient=function(){var kw=document.getElementById("search-patient-input").value.trim();if(!kw)return;var res=getPatients().filter(function(p){return(p.name||"").indexOf(kw)>=0||(p.phone||"").indexOf(kw)>=0});document.getElementById("patient-search-results").innerHTML=res.length?res.map(function(p){return'<div class=search-result-item onclick="selectPt(\''+p.id+'\')">'+p.name+" "+p.phone+"</div>"}).join(""):"<div class=empty-state>未找到</div>"}
window.selectPt=function(id){var p=findPatientById(id);if(p){currPatient=p;document.getElementById("new-pt-name").value=p.name;document.getElementById("new-pt-phone").value=p.phone}}
window.openAITool=function(t){navigateTo(t==="tongue"?"tongue-diagnosis":t==="lab"?"lab-report":"imaging-upload")}
window.addWMDrug=function(){var c=document.getElementById("wm-prescription-items"),d=document.createElement("div");d.className="prescription-item";d.innerHTML='<input placeholder=药品名 class=form-input drug-name><input placeholder=规格 class=form-input drug-spec><input placeholder=用法 class=form-input drug-usage><button class="btn btn-sm btn-danger" onclick=this.parentElement.remove()>×</button>';c.appendChild(d)}
window.removeDrug=function(e){e.parentElement.remove()}
window.addTCMHerb=function(){var c=document.getElementById("tcm-prescription-items"),d=document.createElement("div");d.className="prescription-item tcm-item";d.innerHTML='<input placeholder=中药名 class=form-input herb-name><input placeholder=克数 class=form-input herb-weight><select class=form-select herb-method><option>煎服</option><option>后下</option><option>先煎</option><option>包煎</option></select><button class="btn btn-sm btn-danger" onclick=this.parentElement.remove()>×</button>';c.appendChild(d)}
window.removeHerb=function(e){e.parentElement.remove()}
window.saveMedicalRecord=function(){if(!currPatient&&!document.getElementById("new-pt-name").value){showToast("请填写患者信息","warning");return}saveMedicalRecord({patientId:currPatient?.id,patientName:document.getElementById("new-pt-name").value||currPatient?.name||"未知",doctorName:getCurrentUser()?.name||"医师",date:new Date().toISOString(),chiefComplaint:document.getElementById("cc-chief-complaint")?.value||"",presentIllness:document.getElementById("cc-present-illness")?.value||"",wmDiagnosis:document.getElementById("dx-wm-diagnosis")?.value||"",wmPrescription:[],tcmPattern:document.getElementById("dx-tcm-pattern")?.value||"",formulaName:document.getElementById("tcm-formula-name")?.value||"",tcmPrescription:[],decoctionMethod:document.getElementById("tcm-decoction")?.value||"",advice:document.getElementById("dx-advice")?.value||"",precautions:document.getElementById("dx-precautions")?.value||"",followupDate:document.getElementById("dx-followup-date")?.value||"",type:"integrated"});showToast("✅ 电子病历已保存！","success")}
window.generatePatientPlan=function(){if(!currPatient){showToast("请先选择患者","warning");return}setTimeout(function(){var pl=generatePersonalizedHealthPlan(getPatientProfile(currPatient.id),null);saveHealthPlan(pl);navigateTo("health-plan");displayHP(pl.sections);showToast("健康方案已生成","success")},800)}
window.openFormulaLibrary=function(){document.getElementById("formula-library-modal").style.display="flex";searchForm("")}
window.closeFormulaLibrary=function(){document.getElementById("formula-library-modal").style.display="none"}
function searchForm(kw){kw=(kw||"").toLowerCase();var f=FORMULA_LIBRARY.filter(function(x){if(!kw)return true;return x.name.indexOf(kw)>=0||x.indication.indexOf(kw)>=0});var safeName=function(n){return n.replace(/'/g,"\\'").replace(/"/g,'&quot;');};document.getElementById("formula-list").innerHTML=f.map(function(x){return"<div class=formula-select-item onclick=\"selFml('"+safeName(x.name)+"')\"><div class=fs-name>"+x.name+"</div><div class=fs-indic>"+x.indication+"</div></div>"}).join("")}
window.selFml=function(name){document.getElementById("tcm-formula-name").value=name;closeFormulaLibrary()}
function initKB(){
// 分类按钮点击已在 app.js 全局事件委托中通过 data-kb 属性处理
renderKB("formulas")
}
function renderKB(cat){var c=document.getElementById("kb-content");if(!c)return;var h="";switch(cat){case"formulas":h=FORMULA_LIBRARY.map(function(f){return"<div class=kb-formula-card><div class=formula-name>🌿 "+f.name+'</div><div style=color:#795548;margin-top:6px;font-size:13px>组成:'+f.components+"</div><div style='font-size:12px;color:#888;margin-top:4px'>适应："+f.indication+"</div></div>"}).join("");break;case"guidelines":h=WM_GUIDELINES.map(function(g){return'<div class=kb-guide-card><h4>📋 '+g.disease+"</h4>"+g.keyPoints.map(function(k){return"<p style=font-size:13px>"+k+"</p>"}).join("")+(g.redFlags?"<p style='font-size:13px;color:#d32f2f;font-weight:bold'>⚠️ "+g.redFlags+"</p>":"")+"</div>"}).join("");break;case"nutrition":if(typeof NUTRITION_DATABASE!=='undefined'){h=NUTRITION_DATABASE.map(function(n){return"<div class=kb-formula-card><div class=formula-name style=color:#2e7d32>🍎 "+n.nutrient+'</div><div style=font-size:13px;margin-top:6px><b>推荐量：</b>'+n.dose+"</div><div style=font-size:13px><b>作用：</b>"+n.function+"</div><div style='font-size:12px;color:#666;margin-top:4px'>来源："+n.sources+"</div></div>"}).join("")}else{h="<div class=empty-state>营养数据库加载中...</div>"}break;case"acupuncture":h="<div class='kb-guide-card'><h4>📍 常用穴位速查</h4><table class='kb-table' style='width:100%;border-collapse:collapse;font-size:13px'><tr style='background:#e8f5e9'><th>穴位</th><th>位置</th><th>功效</th></tr><tr><td>合谷</td><td>手背第一、二掌骨间</td><td>止痛、清热、调理肠胃</td></tr><tr><td>足三里</td><td>膝下3寸胫骨外侧</td><td>健脾和胃、补中益气</td></tr><tr><td>内关</td><td>腕横纹上2寸两筋间</td><td>宁心安神、宽胸理气</td></tr><tr><td>太冲</td><td>足背第一、二跖骨间</td><td>疏肝解郁、平肝熄风</td></tr><tr><td>三阴交</td><td>内踝尖上3寸</td><td>调经养血、健脾益肾</td></tr><tr><td>关元</td><td>脐下3寸</td><td>培元固本、温阳益气</td></tr><tr><td>涌泉</td><td>足底前1/3凹陷处</td><td>滋阴降火、引火归源</td></tr><tr><td>百会</td><td>头顶正中线与两耳尖交点</td><td>升阳举陷、安神醒脑</td></tr><tr><td>风池</td><td>后颈部枕骨下发际凹陷</td><td>祛风散寒、清头明目</td></tr><tr><td>神门</td><td>腕横纹尺侧端凹陷</td><td>安神定志、通经活络</td></tr></table></div>";break;case"drugs":h="<div class='kb-guide-card'><h4>💊 常用药物参考</h4><table class='kb-table' style='width:100%;border-collapse:collapse;font-size:13px'><tr style='background:#fff3e0'><th>药物名称</th><th>类别</th><th>适应症</th></tr><tr><td>阿莫西林</td><td>抗生素</td><td>呼吸道/泌尿系感染</td></tr><tr><td>布洛芬</td><td>NSAIDs</td><td>发热、疼痛、炎症</td></tr><tr><td>奥美拉唑</td><td>PPI抑酸药</td><td>胃溃疡、胃食管反流</td></tr><tr><td>氨氯地平</td><td>钙通道阻滞剂</td><td>高血压、心绞痛</td></tr><tr><td>二甲双胍</td><td>降糖药</td><td>2型糖尿病首选</td></tr><tr><td>阿托伐他汀</td><td>他汀类调脂药</td><td>高脂血症、动脉硬化</td></tr><tr><td>氯雷他定</td><td>抗组胺药</td><td>过敏性鼻炎、荨麻疹</td></tr><tr><td>蒙脱石散</td><td>止泻药</td><td>急慢性腹泻</td></tr><tr><td>复方甘草片</td><td>镇咳祛痰</td><td>咳嗽、痰多</td></tr><tr><td>六味地黄丸</td><td>中成药补肾</td><td>肾阴虚证</td></tr><tr><td>板蓝根颗粒</td><td>中成药清热解毒</td><td>风热感冒、咽喉肿痛</td></tr><tr><td>云南白药</td><td>中成药活血化瘀</td><td>跌打损伤、出血</td></tr></table></div>";break;default:h="<div class=empty-state>敬请期待</div>"}c.innerHTML=h}
window.searchKB=function(){
var kw=(document.getElementById("kb-search-input")?document.getElementById("kb-search-input").value:"").trim().toLowerCase();
if(!kw)return;
if(typeof FORMULA_LIBRARY!=="undefined"&&typeof WM_GUIDELINES!=="undefined"){
var results=[];
FORMULA_LIBRARY.forEach(function(f){
if((f.name+f.components+f.indication).toLowerCase().indexOf(kw)>=0)
results.push({type:"方剂",title:f.name,desc:"组成:"+f.components+" 适应:"+f.indication})
});
WM_GUIDELINES.forEach(function(g){
if((g.disease+g.category+" "+g.keyPoints.join(" ")).indexOf(kw)>=0)
results.push({type:"指南",title:g.disease,desc:g.keyPoints.slice(0,2).join("; ")})
});
if(typeof NUTRITION_DATABASE!=="undefined")
NUTRITION_DATABASE.forEach(function(n){
if((n.nutrient+n.function+n.sources).indexOf(kw)>=0)
results.push({type:"营养",title:n.nutrient,desc:n.function+" | 来源:"+n.sources})
});
var c=document.getElementById("kb-content");
if(!results.length){
c.innerHTML="<div class=empty-state>未找到相关内容</div>"
}else{
var _b=[];
for(var i=0;i<results.length;i++){
var r=results[i];
_b.push("<div class=kb-formula-card><div class=formula-name>\uD83D\uDD0D"+r.title+"<span style='font-size:11px;color:#888;margin-left:8px'>["+r.type+"]</span></div><div style='font-size:13px;margin-top:6px'>"+r.desc+"</div></div>")
}
c.innerHTML="<div class=search-results-header>找到"+results.length+"条结果:</div>"+_b.join("")
}
}

function loadDoctorPatientList(){var pts=getPatients(),c=document.getElementById("doctor-patient-list");var escId=function(id){return id.replace(/'/g,"\\'");};c.innerHTML=pts.length?pts.map(function(p){return"<div class=patient-card onclick=\"startConsultWithPatientId('"+escId(p.id)+"')\"><div class=patient-avatar-big>"+(p.avatar||"\uD83D\uDC64")+"</div><div class=pt-name>"+p.name+"</div></div>"}).join(""):"<div class=empty-state>\u6682\u65E0</div>"}
function loadDoctorPrescriptions(){loadPrescriptions&&loadPrescriptions()}
window.startConsultWithPatientId=function(id){var p=findPatientById(id);if(p){currPatient=p;navigateTo("new-consultation");goConsultStep(2);document.getElementById("new-pt-name").value=p.name;document.getElementById("new-pt-phone").value=p.phone}}}
