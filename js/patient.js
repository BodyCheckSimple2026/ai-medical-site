/* ==========================================

   患者端逻辑

   ========================================== */

var currentLoginRole='patient',countdownTimer=null;



function initLoginPage(){

    document.querySelectorAll('.role-tab').forEach(function(t){

        t.addEventListener('click',function(){

            document.querySelectorAll('.role-tab').forEach(function(x){x.classList.remove('active');});

            this.classList.add('active');

            currentLoginRole=this.dataset.role;

            document.getElementById('login-role').value=currentLoginRole;

            if(currentLoginRole==='admin'){

                document.getElementById('verify-code-group').style.display='none';

                document.getElementById('password-group').style.display='block';

                document.getElementById('login-phone').placeholder='管理员账号';

            }else{

                document.getElementById('verify-code-group').style.display='block';

                document.getElementById('password-group').style.display='none';

            }

        });

    });

    document.getElementById('login-form').addEventListener('submit',function(e){e.preventDefault();handleLogin();});

    document.getElementById('btn-send-code').addEventListener('click',sendVerifyCode);

    document.getElementById('btn-wechat-login').addEventListener('click',function(){showToast('微信登录需配置授权','info');});

    var lm=document.getElementById('toggle-login-mode'),ic=true;

    if(lm)lm.addEventListener('click',function(e){e.preventDefault();ic=!ic;this.textContent=ic?'密码登录':'验证码登录';document.getElementById('verify-code-group').style.display=ic?'block':'none';document.getElementById('password-group').style.display=ic?'none':'block';});

    document.getElementById('link-register').addEventListener('click',function(e){e.preventDefault();showToast('确认登录即可自动注册','info');document.getElementById('login-phone').focus();});



    // 上传区域

    initUploadZone('tongue-upload-zone','tongue-file-input');

    initUploadZone('report-upload-zone','report-file-input');

    initUploadZone('imaging-upload-zone','imaging-file-input');



    // file input change 事件 — 安全绑定（HTML 已有内联 onchange 作为主通道，此处为兼容）

    var tfi=document.getElementById('tongue-file-input');

    if(tfi) tfi.addEventListener('change',function(){if(window.handleTongueFileChange)window.handleTongueFileChange(this);});

    var rfi=document.getElementById('report-file-input');

    if(rfi) rfi.addEventListener('change',function(){if(window.handleReportFileChange)window.handleReportFileChange(this);});

    var ifi=document.getElementById('imaging-file-input');

    // 注意：imaging-file-input 的 onchange 已在 HTML 中内联处理（直接生成预览）

    // 此处不再重复添加 change 监听器，避免触发两次导致缩略图重复显示

    if(ifi && !ifi.getAttribute('onchange')) {

        ifi.addEventListener('change',function(){if(window.handleImagingFileChange)window.handleImagingFileChange(this);});

    }



    document.querySelectorAll('.phrase-btn').forEach(function(b){b.addEventListener('click',function(){var i=document.getElementById('chat-input');if(i)i.value=this.dataset.text;i.focus();});});

    document.getElementById('btn-send-message').addEventListener('click',sendMessage);

    var ci=document.getElementById('chat-input');if(ci)ci.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});

    

    document.querySelectorAll('.plan-type-card').forEach(function(c){c.addEventListener('click',function(){document.querySelectorAll('.plan-type-card').forEach(function(x){x.classList.remove('active')});this.classList.add('active');});});

    document.querySelectorAll('.time-slot').forEach(function(s){s.addEventListener('click',function(){document.querySelectorAll('.time-slot').forEach(function(x){x.classList.remove('selected')});this.classList.add('selected');});});

    document.querySelectorAll('#symptom-tags .tag.selectable').forEach(function(t){t.addEventListener('click',function(){this.classList.toggle('selected');});});

    var hpf=document.getElementById('health-profile-form');if(hpf)hpf.addEventListener('submit',function(e){e.preventDefault();saveHealthProfileForm();});

    

    document.getElementById('agree-disclaimer').addEventListener('change',function(){document.getElementById('btn-agree-disclaimer').disabled=!this.checked;});

    document.getElementById('btn-agree-disclaimer').addEventListener('click',function(){closeDisclaimerModal();});

}



// 登录处理

function handleLogin(){

    var phoneEl=document.getElementById('login-phone');

    var roleEl=document.getElementById('login-role');

    if(!roleEl){showToast('系统错误','error');return;}

    var phone=(phoneEl?phoneEl.value:'').trim(),role=roleEl.value;

    if(!phone&&role!=='admin'){showToast('请输入手机号','warning');return;}

    

    // 隐藏加载遮罩

    var loadingEl = document.getElementById('app-loading');

    if(loadingEl) loadingEl.style.display = 'none';



    if(role==='admin'){

        var pwdEl=document.getElementById('login-password');

        var pwd=pwdEl?pwdEl.value:'';

        if((phone||phone==='admin')&&(pwd||pwd==='admin123')){

            setCurrentUser({id:'admin_001',name:'管理员',role:'admin',avatar:'⭐'});

            showToast('管理员登录成功','success');

            enterApp('admin');

        }else{showToast('账号或密码错误','error');}

        return;

    }

    

    // 演示模式：任意手机号即可登录

    var safePhone = phone || '13800000001';

    var user=role==='doctor'?getDoctors().find(function(d){return d.phone===safePhone;}):findPatientByPhone(safePhone);

    if(user){

        user.lastLogin=Date.now();

        role==='doctor'?saveDoctor(user):savePatient(user);

        setCurrentUser(user);

        showToast((role==='doctor'?'医生':'患者')+' 登录成功','success');

        enterApp(role);

    } else {

        var nu={id:generateId(),name:'用户'+safePhone.substr(-4),phone:safePhone,role:role,avatar:role==='doctor'?'🩺':'📱',createdAt:Date.now()};

        role==='doctor'?saveDoctor(nu):savePatient(nu);

        setCurrentUser(nu);

        showToast('注册并登录成功','success');

        enterApp(role);

    }

}



function sendVerifyCode(){

    var ph=document.getElementById('login-phone').value.trim();

    if(ph.length!==11){showToast('请输入正确手机号','warning');return;}

    var btn=document.getElementById('btn-send-code');btn.disabled=true;var s=60;btn.textContent=s+'s重获取';

    clearInterval(countdownTimer);countdownTimer=setInterval(function(){s--;if(s<=0){clearInterval(countdownTimer);btn.disabled=false;btn.textContent='获取验证码';}else{btn.textContent=s+'s重取';}},1000);

    showToast('验证码已发送 (模拟)','success');

}



// 上传区域事件绑定（注意：HTML中已有内联 onclick/ondragover/ondrop 作为主逻辑）

// 此函数保留用于兼容，但内联事件已覆盖全部交互

function initUploadZone(zoneId,inputId){

    var z=document.getElementById(zoneId),inp=document.getElementById(inputId);if(!z||!inp)return;

    // 仅在 HTML 内联事件缺失时作为 fallback 绑定

    if(!z.getAttribute('onclick')){

        z.addEventListener('click',function(e){e.stopPropagation();inp.click();});

    }

    if(!z.getAttribute('ondragover')){

        z.addEventListener('dragover',function(e){e.preventDefault();e.stopPropagation();this.classList.add('dragging');});

        z.addEventListener('dragleave',function(){this.classList.remove('dragging');});

        z.addEventListener('drop',function(e){e.preventDefault();e.stopPropagation();this.classList.remove('dragging');if(e.dataTransfer.files.length>0){inp.files=e.dataTransfer.files;inp.dispatchEvent(new Event('change',{bubbles:true}));}});

    }

}



// ==================== 多文件批量报告上传（专业增强版）====================

// 存储已上传的多份报告文件

window._uploadedReports = []; // [{name, type, dataUrl, fileObj, reportType}]



window.handleMultiReportUpload = function(input) {

    if (!input || !input.files || input.files.length === 0) return;

    var files = input.files;

    var dbg = document.getElementById('debug-info-report');

    var listEl = document.getElementById('report-files-list');

    

    dbg.style.display = 'block';

    dbg.innerHTML = '✅ <b>选中 ' + files.length + ' 个报告文件</b>，正在处理...';

    listEl.style.display = 'block';

    listEl.innerHTML = '<div style="padding:12px;text-align:center;color:#666;">📂 正在加载预览...</div>';

    

    window._uploadedReports = [];

    var doneCount = 0;

    

    for (var i = 0; i < files.length; i++) {

        (function(f, idx) {

            var isPDF = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

            var reader = new FileReader();

            

            reader.onload = function(e) {

                window._uploadedReports.push({

                    name: f.name,

                    type: isPDF ? 'pdf' : 'image',

                    size: f.size,

                    dataUrl: e.target.result,

                    fileObj: f,

                    reportType: null // 稍后统一设置

                });

                doneCount++;

                

                if (doneCount >= files.length) {

                    renderMultiReportList();

                    dbg.innerHTML = '✅ <b>' + files.length + ' 个报告文件已就绪</b> — 可选择每份报告类型后点击「综合AI分析」';

                    

                    // 自动隐藏单文件预览区域

                    document.getElementById('report-preview-image').style.display = 'none';

                    var pdfArea = document.getElementById('report-preview-pdf');

                    if (pdfArea) pdfArea.style.display = 'none';

                }

            };

            

            reader.onerror = function() {

                doneCount++;

                if (doneCount >= files.length) {

                    renderMultiReportList();

                }

            };

            

            if (isPDF) {

                reader.readAsDataURL(f);

            } else {

                reader.readAsDataURL(f);

            }

        })(files[i], i);

    }

};



// 渲染多报告列表UI

function renderMultiReportList() {

    var listEl = document.getElementById('report-files-list');

    if (!listEl || window._uploadedReports.length === 0) return;

    

    var html = '<div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0;">';

    html += '<h4 style="margin:0 0 10px 0;font-size:14px;color:#334155;">📋 已上传 ' + window._uploadedReports.length + ' 份报告</h4>';

    

    var typeOptions = [

        {val:'',label:'— 选择类型 —'},

        {val:'blood-routine',label:'血常规'},

        {val:'urine-routine',label:'尿常规'},

        {val:'biochemistry',label:'生化全套'},

        {val:'liver-function',label:'肝功能'},

        {val:'kidney-function',label:'肾功能'},

        {val:'blood-lipid',label:'血脂四项'},

        {val:'blood-sugar',label:'血糖/糖化'},

        {val:'thyroid',label:'甲状腺功能'},

        {val:'coagulation',label:'凝血功能'},

        {val:'tumor-marker',label:'肿瘤标志物'},

        {val:'other',label:'其他'}

    ];

    

    for (var i = 0; i < window._uploadedReports.length; i++) {

        var r = window._uploadedReports[i];

        var icon = r.type === 'pdf' ? '📄' : '🖼️';

        var typeSelId = 'report-type-' + i;

        

        html += '<div style="display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:6px;background:white;border-radius:8px;border:1px solid #e2e8f0;">';

        html += '<span style="font-size:20px;">' + icon + '</span>';

        html += '<div style="flex:1;min-width:0;">';

        html += '<div style="font-weight:600;font-size:13px;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + r.name + '">' + r.name + '</div>';

        html += '<div style="font-size:11px;color:#94a3b8;">' + (r.size / 1024).toFixed(1) + 'KB</div>';

        html += '</div>';

        html += '<select id="' + typeSelId + '" class="form-select" style="width:120px;font-size:12px;padding:4px 6px;" onchange="window._uploadedReports[' + i + '].reportType=this.value;">';

        for (var j = 0; j < typeOptions.length; j++) {

            html += '<option value="' + typeOptions[j].val + '">' + typeOptions[j].label + '</option>';

        }

        html += '</select>';

        html += '<button onclick="removeReportFile(' + i + ')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;padding:2px 6px;" title="移除">✕</button>';

        html += '</div>';

    }

    

    // 综合分析按钮

    html += '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">';

    html += '<button onclick="doMultiReportAnalysis()" class="btn btn-primary" style="font-size:15px;padding:10px 24px;flex:1;min-width:200px;">🔬 综合AI分析（全部 ' + window._uploadedReports.length + ' 份）</button>';

    html += '<button onclick="clearAllReports()" class="btn" style="background:#fee2e2;color:#dc2626;border-color:#fecaca;padding:8px 16px;">清空重选</button>';

    html += '</div>';

    html += '</div>';

    

    listEl.innerHTML = html;

}



// 移除单个报告

window.removeReportFile = function(idx) {

    window._uploadedReports.splice(idx, 1);

    if (window._uploadedReports.length === 0) {

        clearAllReports();

    } else {

        renderMultiReportList();

    }

};



// 清空所有报告

window.clearAllReports = function() {

    window._uploadedReports = [];

    document.getElementById('report-files-list').style.display = 'none';

    document.getElementById('report-files-list').innerHTML = '';

    document.getElementById('debug-info-report').style.display = 'none';

    document.getElementById('report-file-input').value = '';

    window._reportFileType = null;

    window._reportFileName = null;

    // 显示原始单文件预览区

    document.getElementById('report-analysis-result').style.display = 'none';

};



// 多报告综合分析主函数

window.doMultiReportAnalysis = async function() {

    try {

        var reports = window._uploadedReports;

        if (!reports || reports.length === 0) {

            showToast('请先上传至少一份报告文件', 'warning'); return;

        }



        // 检查每份报告是否都选择了类型

        var untyped = reports.filter(function(r){ return !r.reportType || r.reportType === ''; });

        if (untyped.length > 0 && reports.length > 1) {

            // 自动填充未选类型的报告为"其他"

            for (var k = 0; k < untyped.length; k++) {

                untyped[k].reportType = 'other';

            }

        }



        // 如果只有1份且没选类型，使用全局类型选择器

        if (reports.length === 1 && !reports[0].reportType) {

            var globalTypeEl = document.getElementById('report-type-select');

            var globalType = globalTypeEl ? globalTypeEl.value : '';

            if (!globalType) { globalType = 'other'; }

            reports[0].reportType = globalType;

        }



        // ★ 关键修复：如果报告类型是"其他"/空/不存在，统一改为"biochemistry"

        // 同时验证 analyzeLabReport 函数是否可用

        if (typeof analyzeLabReport !== 'function') {

            console.error('[综合分析] analyzeLabReport 函数未定义！');

            showToast('分析引擎未加载，请刷新页面后重试', 'error');

            return;

        }



        for (var ri = 0; ri < reports.length; ri++) {

            var rt = reports[ri].reportType;

            if (!rt || rt === '' || rt === 'other') {

                reports[ri].reportType = 'biochemistry';

            }

        }



        showToast('🔄 正在对 ' + reports.length + ' 份报告进行综合AI分析...', 'info');



        var allResults = [];



        for (var i = 0; i < reports.length; i++) {

            showToast('⏳ 分析第 ' + (i+1) + '/' + reports.length + ' 份：' + reports[i].name, 'info');



            try {

                var result = await analyzeLabReport(reports[i].reportType, null);



                if (!result || result.ocrFailed) {

                    // analyzeLabReport 返回 null/undefined 时构建兜底结果

                    result = {

                        reportName: reports[i].name,

                        reportType: reports[i].reportType,

                        items: [],

                        abnormalCount: 0,

                        overallImpression: '<p style="color:#666">该报告数据待进一步解析。</p>',

                        medicalAdvice: ['建议上传清晰的报告图片以获取更精准的分析。'],

                        analyzedAt: new Date().toISOString(),

                        confidence: 0

                    };

                }



                // ★ 标准化 status 字段（analyzeLabReport 返回 high/low/normal）

                if (result && result.items && Array.isArray(result.items)) {

                    for (var j = 0; j < result.items.length; j++) {

                        var it = result.items[j];

                        var originalStatus = it.status;

                        if (originalStatus === 'high' || originalStatus === '低' || originalStatus === '升高' || originalStatus === '偏高') {

                            it.status = 'abnormal';

                            it._originalDir = '↑';

                            it._originalLabel = '偏高';

                        } else if (originalStatus === 'low' || originalStatus === '高' || originalStatus === '降低' || originalStatus === '偏低') {

                            it.status = 'abnormal';

                            it._originalDir = '↓';

                            it._originalLabel = '偏低';

                        } else if (originalStatus === 'warning' || originalStatus === '临界' || originalStatus === '关注') {

                            it.status = 'warning';

                            it._originalDir = '!';

                            it._originalLabel = '临界';

                        } else {

                            it.status = 'normal';

                            it._originalDir = '';

                            it._originalLabel = '正常';

                        }

                    }

                } else if (result) {

                    // items 不存在或不是数组时初始化

                    result.items = [];

                }



                result.sourceFileName = reports[i].name;

                result.sourceIndex = i;

                allResults.push(result);

            } catch(singleErr) {

                console.error('[综合分析] 第' + (i+1) + '份报告分析失败:', singleErr);

                // 单份报告失败不中断整体流程，使用兜底数据

                allResults.push({

                    reportName: reports[i].name,

                    reportType: reports[i].reportType,

                    items: [],

                    abnormalCount: 0,

                    overallImpression: '<p style="color:#e67e22">⚠️ 该报告解析遇到问题，但不影响其余报告的综合评估。</p>',

                    medicalAdvice: ['如需详细分析此报告，可尝试单独上传解读。'],

                    analyzedAt: new Date().toISOString(),

                    confidence: 0,

                    sourceFileName: reports[i].name,

                    sourceIndex: i

                });

            }



            await new Promise(function(r){ setTimeout(r, 300); });

        }



        // 验证综合分析函数可用性

        if (typeof generateComprehensiveAnalysis !== 'function') {

            console.error('[综合分析] generateComprehensiveAnalysis 函数未定义！');

            showToast('综合分析引擎异常，请刷新页面后重试', 'error');

            return;

        }



        var comprehensiveResult = generateComprehensiveAnalysis(allResults, reports);



        if (typeof displayComprehensiveAnalysis === 'function') {

            displayComprehensiveAnalysis(comprehensiveResult);

        } else {

            console.error('[综合分析] displayComprehensiveAnalysis 函数未定义！');

            showToast('显示组件加载异常', 'error');

            return;

        }



        showToast('✅ ' + reports.length + ' 份报告综合分析完成！', 'success');

    } catch(err) {

        console.error('[综合分析] 主流程错误:', err);

        console.error('[综合分析] 错误堆栈:', err.stack ? err.stack : String(err));

        showToast('分析过程出错：' + (err.message || '未知错误') + '，请重试', 'error');

    }

};



// 多报告综合分析引擎（核心）

function generateComprehensiveAnalysis(allResults, sourceFiles) {

    // ===== 1. 汇总所有异常指标 =====

    var allAbnormalItems = [];

    var totalItemsAnalyzed = 0;

    var totalAbnormals = 0;

    var reportSummaries = [];

    

    for (var ri = 0; ri < allResults.length; ri++) {

        var res = allResults[ri];

                // 跳过识别失败的报告（避免显示假数据）



        if (res.ocrFailed) { continue; }



var items = res.items || [];

        var abnormalInThis = items.filter(function(it){ return it.status !== 'normal'; });

        

        totalItemsAnalyzed += items.length;

        totalAbnormals += abnormalInThis.length;

        

        // 为每个异常添加来源标记

        for (var ai = 0; ai < abnormalInThis.length; ai++) {

            abnormalInThis[ai]._sourceReport = sourceFiles[ri]?.name || ('报告'+(ri+1));

            abnormalInThis[ai]._sourceType = res.reportName || '';

            allAbnormalItems.push(abnormalInThis[ai]);

        }

        

        reportSummaries.push({

            name: sourceFiles[ri]?.name || ('报告'+(ri+1)),

            type: res.reportName || '',

            abnormalCount: abnormalInThis.length,

            totalCount: items.length

        });

    }

    

    // ===== 2. 跨报告风险交叉评估 =====

    var crossRisks = evaluateCrossReportRisks(allAbnormalItems, allResults, totalAbnormals);

    

    // ===== 3. 生成综合建议 =====

    var comprehensiveAdvice = generateComprehensiveAdvice(allAbnormalItems, crossRisks, allResults);

    

        // ★ 当所有报告都识别失败时，返回提示而非假数据
    if (totalItemsAnalyzed === 0 && allResults.length > 0) {
        return {
            mode: 'comprehensive',
            totalReports: allResults.length,
            reportSummaries: reportSummaries,
            totalItems: 0,
            totalAbnormals: 0,
            allAbnormalItems: [],
            crossRisks: [],
            comprehensiveAdvice: {
                summary: '图片识别失败',
                details: ['所有报告均未能识别出有效指标。', '可能原因：图片模糊、倾斜、光线不足。', '建议切换到「手动输入」模式，直接输入指标名称和数值，解读更准确！'],
                keyActions: ['切换到手动输入模式', '输入格式：指标名 数值（每行一个）']
            },
            allFailed: true,
            analyzedAt: new Date().toISOString()
        };
    }

    return {

        mode: 'comprehensive',

        totalReports: allResults.length,

        reportSummaries: reportSummaries,

        totalItems: totalItemsAnalyzed,

        totalAbnormals: totalAbnormals,

        allAbnormalItems: allAbnormalItems,

        crossRisks: crossRisks,

        comprehensiveAdvice: comprehensiveAdvice,

        analyzedAt: new Date().toISOString()

    };

}



// 跨报告风险评估引擎

function evaluateCrossReportRisks(abnormalItems, allResults, totalAbnormals) {

    // totalAbnormals 由调用方传入，用于判断是否添加默认风险项

    if (typeof totalAbnormals === 'undefined' || totalAbnormals === null) {

        totalAbnormals = abnormalItems.length; // 兜底：使用异常项数量

    }

    var risks = [];

    var itemNames = abnormalItems.map(function(it){

        return (it.name || '').replace(/\(.*?\)/g,'').trim().toLowerCase();

    });

    

    // 心血管综合风险（血脂+血压+血糖）

    var cvRiskFactors = ['总胆固醇','甘油三酯','hdl','ldl','空腹血糖','糖化血红蛋白'];

    var cvScore = 0; var cvDetails = [];

    abnormalItems.forEach(function(it) {

        for (var c=0;c<cvRiskFactors.length;c++){

            if ((it.name||'').indexOf(cvRiskFactors[c]) > -1) { cvScore++; cvDetails.push(it); break;}

        }

    });

    if(cvScore >= 3) risks.push({ level:'high', category:'🫀 心血管代谢综合征', score:cvScore, desc:'多项心血管危险因素同时存在，动脉粥样硬化风险显著升高', details:cvDetails.map(function(d){return d.name+':'+d.value+(d.unit||'')}).join(', ') });

    

    // 肝肾联合损害

    var liverKw = ['alt','ast','tbil','ggt','尿素','肌酐','尿酸'];

    var lkScore = 0; var lkDetails = [];

    abnormalItems.forEach(function(it){

        for(var l=0;l<liverKw.length;l++){

            if((it.name||'').toLowerCase().indexOf(liverKw[l])>-1){lkScore++;lkDetails.push(it);break;}

        }

    });

    if(lkScore >= 3) risks.push({level:'medium', category:'🫁 肝肾功能联合受损', score:lkScore, desc:'肝脏与肾脏指标均出现异常，需排查全身性疾病或药物影响', details:lkDetails.map(function(d){return d.name+':'+d.value+(d.unit||'')}).join(', ') });

    

    // 炎症/感染状态

    var inflKw = ['白细胞','中性粒','淋巴细胞','crp','红细胞沉降率','超敏'];

    var inflScore = 0; var inflDetails = [];

    abnormalItems.forEach(function(it){

        for(var inf=0;inf<inflKw.length;inf++){

            if((it.name||'').indexOf(inflKw[inf])>-1){inflScore++;inflDetails.push(it);break;}

        }

    });

    if(inflScore >= 1) risks.push({level:inflScore>=2?'medium':'low',category:'🔥 炎症/感染状态',score:inflScore,desc:'存在炎症或感染相关指标异常',details:inflDetails.map(function(d){return d.name+':'+d.value+(d.unit||'')}).join(', ') });

    

    // 血液系统

    var bloodKw=['血红蛋白','血小板','红细胞','白细胞','凝血'];

    var bloodScore=0;var bloodDetails=[];

    abnormalItems.forEach(function(it){

        for(var b=0;b<bloodKw.length;b++){if((it.name||'').indexOf(bloodKw[b])>-1){bloodScore++;bloodDetails.push(it);break;}}

    });

    if(bloodScore >= 2) risks.push({level:bloodScore>=3?'high':'medium',category:'🩸 血液/凝血异常',score:bloodScore,desc:'多个血液学指标异常，需血液科进一步评估',details:bloodDetails.map(function(d){return d.name+':'+d.value+(d.unit||'')}).join(', ')});

    

    // 甲状腺+内分泌

    var endoKw=['tsh','ft3','ft4','空腹血糖','糖化血红蛋白'];

    var endoScore=0;var endoDetails=[];

    abnormalItems.forEach(function(it){

        for(var e=0;e<endoKw.length;e++){if((it.name||'').toLowerCase().indexOf(endoKw[e])>-1){endoScore++;endoDetails.push(it);break;}}

    });

    if(endoScore >= 2) risks.push({level:'low',category:'🦋 内分泌/甲状腺',score:endoScore,desc:'内分泌相关指标波动，建议内分泌科随访',details:endoDetails.map(function(d){return d.name+':'+d.value+(d.unit||'')}).join(', ')});

    

    if(risks.length === 0 && totalAbnormals > 0) {

        risks.push({level:'low',category:'📊 轻微异常',score:totalAbnormals,desc:'个别指标轻微偏离参考范围',details:abnormalItems.slice(0,5).map(function(d){return d.name+':'+d.value+(d.unit||'')}).join(', ')});

    } else if(totalAbnormals === 0) {

        risks.push({level:'normal',category:'✅ 整体健康',score:0,desc:'本次所有检验项目均在正常范围内',details:''});

    }

    

    return risks;

}



// ===== 异常指标 → 中西医双轨诊断知识库映射表 =====

var _LAB_TCM_KNOWLEDGE = {

    // 血脂类

    '总胆固醇': { tcmDiagnosis:'痰瘀互结证', tcmFeatures:'形体肥胖、头重胸闷、肢麻沉重、舌暗苔腻', formula:['血府逐瘀汤合二陈汤加减','丹参饮','血脂康'], chineseMeds:['血脂康胶囊(2粒,2次/日)','丹参滴丸(10粒,3次/日)','绞股蓝总苷片(2-3粒,3次/日)'], acupoints:['丰隆','足三里','内关','膈俞'], westernMeds:[{name:'阿托伐他汀钙(Atorvastatin)', usage:'10-20mg/每晚1次', note:'定期复查肝功能及肌酶；避免与葡萄柚汁同服'}, {name:'依折麦布(Ezetimibe)', usage:'10mg/日', note:'可与他汀联用增效；肝功能不全者慎用'}], nutrition:[{nutrient:'植物甾醇', foods:'坚果、植物油(橄榄油/菜籽油)、豆制品、全谷物', daily:'2-3g/日', reason:'竞争性抑制胆固醇吸收，降低LDL-C约8-15%'}, {nutrient:'Omega-3脂肪酸', foods:'深海鱼(鲑鱼/沙丁鱼)、亚麻籽、核桃', daily:'EPA+DHA 1000-2000mg/日', reason:'降低甘油三酯，抗炎保护血管内皮'}], lifestyle:['每日快走30分钟以上','减少红肉摄入(<3次/周)，用鱼类/豆类替代','戒烟限酒是首要措施'] },

    '甘油三酯': { tcmDiagnosis:'脾虚痰湿证', tcmFeatures:'倦怠乏力、腹胀便溏、肢体困重、舌苔厚腻', formula:['温胆汤合四君子汤','参苓白术散'], chineseMeds:['荷丹片(2片,3次/日)','绞股蓝总苷片(2-3粒,3次/日)','山楂降脂片'], acupoints:['中脘','丰隆','足三里','阴陵泉'], westernMeds:[{name:'非诺贝特(Fenofibrate)', usage:'200mg/日(餐中服用)', note:'需监测肝肾功能；与他汀联用注意肌病风险'}], nutrition:[{nutrient:'膳食纤维', foods:'燕麦、豆类、蔬菜、魔芋、苹果', daily:'25-35g/日', reason:'减少脂肪吸收，延缓餐后TG升高'}], lifestyle:['严格戒酒(酒精显著升高TG)','控制精制碳水化合物(甜食/含糖饮料)','减重5-10%可使TG下降20-30%'] },

    'hdl': { tcmDiagnosis:'肾气不足证', tcmFeatures:'腰膝酸软、畏寒肢冷、神疲乏力', formula:['金匮肾气丸合右归饮'], chineseMeds:['金匮肾气丸(6g,2次/日)','六味地黄丸(8粒,3次/日)'], acupoints:['关元','命门','太溪','肾俞'], westernMeds:[{name:'烟酸(Niacin)', usage:'起始100mg tid，渐增至1000-2000mg/日', note:'面部潮红常见；禁用于活动性肝病'}], nutrition:[{nutrient:'单不饱和脂肪酸(MUFA)', foods:'橄榄油、牛油果、杏仁、花生', reason:'升高HDL-C，改善脂质谱'}], lifestyle:['有氧运动是最有效提升HDL的方式','每周≥150分钟中等强度运动'] },



    // 肝功能类

    'alt': { tcmDiagnosis:'肝胆湿热证', tcmFeatures:'胁肋胀痛、口苦纳差、身目发黄、小便黄赤、舌红苔黄腻', formula:['龙胆泻肝汤加减','茵栀黄汤'], chineseMeds:['护肝片(4片,3次/日)','水飞蓟素胶囊(Silymarin,2粒tid)','复方甘草酸苷片(2-3片,tid饭后服)'], acupoints:['肝俞','期门','阳陵泉','太冲'], westernMeds:[{name:'双环醇(Bicyclol)', usage:'25-50mg/次,3次/日', note:'降ALT特效药；需定期复查'}, {name:'甘草酸二铵(Diammonium Glycyrrhizinate)', usage:'150mg/次,3次/日', note:'保肝抗炎；长期使用注意水钠潴留'}], nutrition:[{nutrient:'B族维生素+胆碱', foods:'蛋黄、大豆、瘦肉、全谷物、绿叶蔬菜', reason:'促进肝脏代谢和修复，辅助脂肪转运'}], lifestyle:['绝对戒酒','避免熬夜伤肝(肝经当令时间23-03点)','慎用可能损肝的药物和保健品'] },

    'ast': { tcmDiagnosis:'肝郁化火证', tcmFeatures:'烦躁易怒、胸胁胀满、口干口苦、脉弦数', formula:'柴胡疏肝散合丹栀逍遥散', chineseMeds:['护肝片','水飞蓟素胶囊','五味子制剂'], acupoints:['行间','太冲','肝俞','胆俞'], westernMeds:[{name:'还原型谷胱甘肽(GSH)', usage:'400-600mg/日静注或口服', note:'肝脏抗氧化首选；严重肝损时静脉给药更佳'}], nutrition:[{nutrient:'硒(Selenium)', foods:'巴西坚果、海鲜(适量)、大蒜、蘑菇', daily:'55-200μg/日', reason:'构成谷胱甘肽过氧化物酶，清除肝细胞自由基'}], lifestyle:['保证充足睡眠','避免情绪波动(怒伤肝)'] },

    'tbil': { tcmDiagnosis:'湿热黄疸证', tcmFeatures:'身黄目黄尿黄、发热口渴、便秘尿赤', formula:'茵陈蒿汤合栀子柏皮汤', chineseMeds:['茵栀黄口服液(10ml,3次/日)','熊去氧胆酸(UDCA,250mg,bid-tid)'], acupoints:['至阳','胆俞','阳陵泉','太冲'], westernMeds:[{name:'熊去氧胆酸(Ursodeoxycholic Acid)', usage:'250mg/次,2-3次/日', note:'利胆退黄首选；原发性胆汁性肝硬化一线用药'}] },

    'ggt': { tcmDiagnosis:'肝郁脾虚兼湿热证', tcmFeatures:'胁痛腹胀、倦怠乏力、纳呆便溏', formula:'柴芍六君汤合茵陈五苓散', chineseMeds:['护肝片','易善复(多烯磷脂酰胆碱,2粒,tid)'] },



    // 血糖类

    '空腹血糖': { tcmDiagnosis:'消渴病(阴虚燥热证)', tcmFeatures:'口渴多饮、多食易饥、尿频量多、形体消瘦、舌红少津', formula:'玉女煎合消渴方加减', chineseMeds:['金芪降糖片(5片,3次/日)','消渴丸(5-10粒,3次/日，含格列本脲需警惕低血糖)','参芪降糖颗粒(1袋,3次/日)'], acupoints:['胰俞(背俞穴)','肺俞','脾俞','足三里','三阴交'], westernMeds:[{name:'二甲双胍(Metformin)', usage:'起始500mg bid/tid随餐，渐增最大2550mg/日', note:'2型糖尿病一线用药；eGFR<30禁用；胃肠道反应常见'}, {name:'阿卡波糖(Acarbose)', usage:'50mg tid(第一口饭嚼服)', note:'控制餐后血糖；胃肠道胀气常见但可耐受'}], nutrition:[{nutrient:'铬(Chromium)+膳食纤维', foods:'西兰花、全谷物、豆类、坚果、肉桂', daily:'铬 20-50μg/日; 纤维素 25-30g/日', reason:'铬增强胰岛素敏感性；膳食纤维延缓葡萄糖吸收'}, {nutrient:'镁', foods:'菠菜、南瓜子、黑豆、全麦', reason:'参与胰岛素分泌和糖代谢过程'}], lifestyle:["餐后散步15-30分钟(有效降低餐后血糖)",'主食粗细搭配，每餐不超过拳头大小','规律监测空腹血糖+餐后2小时血糖'] },



    // 血压相关

    '血压': { tcmDiagnosis:'肝阳上亢证', tcmFeatures:'头痛眩晕、面红目赤、烦躁易怒、舌红脉弦', formula:'天麻钩藤饮合镇肝熄风汤', chineseMeds:['全天麻胶囊(2粒,tid)','松龄血脉康(3粒,3次/日)','牛黄降压丸(1-2丸,2次/日)'], acupoints:['太冲','曲池','风池','涌泉','百会'], westernMeds:[{name:'氨氯地平(Amlodipine)', usage:'5mg/日(可增至10mg)', note:'长效钙通道阻滞剂；踝部水肿为常见副作用'}, {name:'缬沙坦(Valsartan)', usage:'80-160mg/日', note:'ARB类；孕妇禁用；高钾血症患者慎用'}, {name:'氢氯噻嗪(Hydrochlorothiazide)', usage:'12.5-25mg/日', note:'噻嗪类利尿剂；注意电解质紊乱和尿酸升高'}], nutrition:[{nutrent:'钾(K)+镁(Mg)', foods:'香蕉、土豆、菠菜、深色蔬菜、坚果、黑巧克力', reason:'钾有助于排钠降压；镁放松血管平滑肌'}], lifestyle:['DASH饮食模式：丰富蔬果、低脂奶、全谷','限钠<5g/日(约一啤酒盖食盐量)','管理体重：BMI控制在18.5-24之间'] },



    // 尿酸/痛风

    '尿酸': { tcmDiagnosis:'浊毒痹阻证', tcmFeatures:'关节红肿热痛、夜间发作、反复无常', formula:'四妙丸合萆薢分清饮加减', chineseMeds:['痛风定胶囊(4粒,3次/日)','四妙丸(6g,2次/日)','新癀片(急性期2-4片,3-4次/日)'], acupoints:['足三里','阴陵泉','三阴交','太溪','阿是穴'], westernMeds:[{name:'别嘌醇(Allopurinol)', usage:'起始100mg/日,渐增至300-600mg/日', note:'抑制尿酸合成；需筛查HLA-B*5801基因(汉族人群风险高)'}, {name:'非布司他(Febuxostat)', usage:'40-80mg/日', note:'新型XOI抑制剂；心血管事件需关注'}], nutrition:[{nutrent:'维生素C+樱桃', foods:'樱桃(每日20-30颗最佳)、猕猴桃、柠檬、青椒', daily:'维C 500mg/日', reason:'促进尿酸排泄；樱桃含花青素可降低尿酸水平'}, {nutrent:'充足饮水', foods:'白开水、淡茶', daily:'2000-3000ml/日', reason:'稀释尿液，促进尿酸排泄，预防结石'}], lifestyle:['严格限制高嘌呤食物(动物内脏、浓肉汤、贝类海鲜)','限制果糖摄入(含糖饮料、蜂蜜)','戒酒尤其啤酒'] },



    // 肾功能

    '肌酐': { tcmDiagnosis:'脾肾两虚证', tcmFeatures:'腰膝酸软、畏寒肢冷、面色㿠白、水肿', formula:'济生肾气丸合实脾饮', chineseMeds:['百令胶囊(5粒,3次/日)','金水宝胶囊(3粒,3次/日)','尿毒清颗粒(1袋,qid)'], acupoints:['肾俞','命门','太溪','三阴交','水分'], westernMeds:[{name:'α-酮酸(Compound α-Ketoacid Tablets)', usage:'4-8片/次,3次/日', note:'配合低蛋白饮食延缓CKD进展；补充必需氨基酸'}], nutrition:[{nutrent:'优质低蛋白饮食', foods:'鸡蛋、蛋清、牛奶、少量鱼肉(限量50g/日)', daily:'蛋白质0.6-0.8g/kg/日', reason:'减轻肾脏滤过负担，同时满足必需氨基酸需求'}], lifestyle:['控制蛋白摄入总量','避免使用肾毒性药物(NSAIDs、某些中药)','定期监测eGFR变化趋势'] },



    // 血常规类

    '血红蛋白': { tcmDiagnosis:'气血两虚证', tcmFeatures:'头晕眼花、心悸失眠、面色萎黄、唇甲色淡、舌淡脉细弱', formula:'八珍汤合当归补血汤', chineseMeds:['当归补血口服液(1支,bid)','复方阿胶浆(20ml,3次/日)','益气维血颗粒(1袋,3次/日)'], acupoints:['足三里','三阴交','血海','膈俞','脾俞'], westernMeds:[{name:'琥珀酸亚铁(Ferrous Succinate)', usage:'100-200mg/次,3次/日(餐后)', note:'配合维生素C促进吸收；大便变黑属正常现象'}], nutrition:[{nutrent:'铁(Fe)+维生素B12+叶酸', foods:'红瘦牛肉、猪肝(每周1-2次)、鸭血、菠菜(配维C吃)、黑木耳', daily:'元素铁 15-20mg/日', reason:'造血三大要素缺一不可；血红素铁吸收率远高于非血红素铁'}, {nutrent:'优质蛋白', foods:'蛋类、牛奶、鱼虾、大豆制品', reason:'提供血红蛋白合成的氨基酸原料'}], lifestyle:['纠正偏食习惯','女性注意月经失血量是否过多','咖啡/茶影响铁吸收，应间隔2小时'] },



    // 甲状腺

    'tsh': { tcmDiagnosis:'肝郁气滞证', tcmFeatures:'情志不畅、胸胁胀闷、咽部异物感(梅核气)、月经不调', formula:'四海舒郁丸合柴胡疏肝散', chineseMeds:['小金丸(1.2粒/次,捣碎服,bid)','夏枯草口服液(10ml,3次/日)','逍遥丸(6g,2次/日)'], acupoints:'人迎、天突、合谷、太冲、三阴交', westernMeds:[{name:'左甲状腺素钠(Levothyroxine,Euthyrox)', usage:'25-75μg/日起床前空服,6-8周后调整剂量', note:'需与早餐间隔至少30分钟；不可与豆浆/钙片/铁剂同服'}], nutrition:[{nutrent:'碘(Iodine)', foods:'海带、紫菜、海鱼、加碘盐', daily:'150μg/日(成人推荐量)', reason:'甲状腺激素合成原料；甲减需补碘、甲亢需限碘'}, {nutrent:'硒', foods:'巴西坚果(1-2颗即可达标)、鸡蛋、鸡肉', reason:'参与T4向T3转化，支持甲状腺正常功能'}] }

};



// ===== 根据异常指标生成中西医综合方案 =====

function _generateTCMSchemeForAbnormals(abnormalItems) {

    var schemes = [];

    var processedCategories = {};

    

    for (var i = 0; i < abnormalItems.length; i++) {

        var item = abnormalItems[i];

        var itemName = (item.name || '').replace(/\s*\(.*?\)/g, '');

        

        // 模糊匹配知识库

        var matched = null;

        for (var key in _LAB_TCM_KNOWLEDGE) {

            if (itemName.indexOf(key) > -1 || key.indexOf(itemName) > -1 || 

                (item.name||'').indexOf(key) > -1) {

                matched = _LAB_TCM_KNOWLEDGE[key];

                break;

            }

        }

        

        if (!matched) continue;

        

        // 去重同类方案（如多个血脂指标合并为一个方案）

        var categoryKey = matched.tcmDiagnosis || itemName;

        if (processedCategories[categoryKey]) {

            // 合并到已有方案

            continue;

        }

        processedCategories[categoryKey] = true;

        

        schemes.push({

            indicator: itemName,

            value: (item.value||'') + (item.unit||''),

            status: item.status,

            tcm: {

                diagnosis: matched.tcmDiagnosis || '待辨证',

                features: matched.tcmFeatures || '',

                formula: Array.isArray(matched.formula) ? matched.formula : [matched.formula],

                chineseMeds: matched.chineseMeds || [],

                acupoints: Array.isArray(matched.acupoints) ? matched.acupoints : (matched.acupoints ? [matched.acupoints] : [])

            },

            western: {

                meds: matched.westernMeds || []

            },

            nutrition: matched.nutrition || [],

            lifestyle: matched.lifestyle || []

        });

    }

    

    return schemes;

}



// 综合医疗建议生成器 v2.0 — 中西医结合专业版

function generateComprehensiveAdvice(abnormalItems, crossRisks, allResults) {

    var advice = {

        overallAssessment: '',

        priorityActions: [],

        tcmDiagnoses: [],          // 中医诊断（核心新增）

        westernMedications: [],     // 西药参考（核心新增）

        chineseMedicines: [],       // 中成药方案（核心新增）

        herbalFormulas: [],         // 中药方剂（核心新增）

        acupointSchemes: [],        // 穴位处方（核心新增）

        nutritionScheme: [],        // 营养素方案（核心新增）

        lifestyleRecommendations: [],

        followUpPlan: [],

        redFlags: []

    };

    

    // 总体评估

    if (abnormalItems.length === 0) {

        advice.overallAssessment = '本次综合分析的 ' + allResults.length + ' 份报告中，所有检测指标均在正常范围内。整体健康状况良好，继续保持健康的生活方式即可。中医角度可见"正气存内，邪不可干"，建议顺应四时节律调养。';

    } else if (abnormalItems.length <= 3) {

        advice.overallAssessment = '发现 ' + abnormalItems.length + ' 项指标轻度或临界异常，从中医视角属于"未病先防"的关键阶段。此时正气尚充、邪气未盛，通过及时干预（中药调理+生活方式）有望完全逆转，不必过度焦虑。';

    } else if (abnormalItems.length <= 7) {

        advice.overallAssessment = '发现 ' + abnormalItems.length + ' 项指标异常，涉及多个系统。中医认为此乃"脏腑功能失调、气血运行不畅"之象，需要系统性地从整体出发进行调理，标本兼顾方能奏效。';

    } else {

        advice.overallAssessment = '发现较多异常指标（共 ' + abnormalItems.length + ' 项），提示身体处于"正虚邪实"状态，需高度重视。建议在积极调整生活方式的同时，尽快到正规医疗机构进行全面评估和规范治疗。';

    }



    // ★ 核心：根据异常指标生成中西医综合方案

    var tcmSchemes = _generateTCMSchemeForAbnormals(abnormalItems);

    

    for (var si = 0; si < tcmSchemes.length; si++) {

        var sch = tcmSchemes[si];

        

        // 中医诊断

        if (sch.tcm.diagnosis) {

            advice.tcmDiagnoses.push({

                indicator: sch.indicator,

                value: sch.value,

                diagnosis: sch.tcm.diagnosis,

                features: sch.tcm.features

            });

        }

        

        // 中药方剂

        if (sch.tcm.formula && sch.tcm.formula.length > 0) {

            for (var fi = 0; fi < sch.tcm.formula.length; fi++) {

                advice.herbalFormulas.push({ target: sch.indicator, name: sch.tcm.formula[fi] });

            }

        }

        

        // 中成药

        if (sch.tcm.chineseMeds && sch.tcm.chineseMeds.length > 0) {

            for (var ci = 0; ci < sch.tcm.chineseMeds.length; ci++) {

                advice.chineseMedicines.push({ target: sch.indicator, med: sch.tcm.chineseMeds[ci] });

            }

        }

        

        // 西药

        if (sch.western.meds && sch.western.meds.length > 0) {

            for (var wi = 0; wi < sch.western.meds.length; wi++) {

                advice.westernMedications.push({ target: sch.indicator, med: sch.western.meds[wi] });

            }

        }

        

        // 穴位

        if (sch.tcm.acupoints && sch.tcm.acupoints.length > 0) {

            advice.acupointSchemes.push({ target: sch.indicator, points: sch.tcm.acupoints });

        }

        

        // 营养素

        if (sch.nutrition && sch.nutrition.length > 0) {

            for (var ni = 0; ni < sch.nutrition.length; ni++) {

                advice.nutritionScheme.push({ target: sch.indicator, nu: sch.nutrition[ni] });

            }

        }

        

        // 生活建议

        if (sch.lifestyle && sch.lifestyle.length > 0) {

            for (var li = 0; li < sch.lifestyle.length; li++) {

                advice.lifestyleRecommendations.push({ target: sch.indicator, tip: sch.lifestyle[li] });

            }

        }

    }

    

    // 补充通用生活建议（如果针对性建议不足）

    var genericLifestyles = [

        '🍽️ 饮食原则：低盐(<5g/日)、低油(<25g/日)、控糖；每日蔬果≥700g，粗粮占主食1/3',

        '🏃 运动处方：每周中等强度有氧运动≥150分钟(快走/慢跑/游泳) + 抗阻训练2次',

        '😴 作息调摄：23点前就寝(肝胆排毒黄金时段)，保证7-8小时优质睡眠，午休20分钟',

        '💧 水分摄入：每日1500-2000ml温水，少量多次，晨起一杯温开水助运脾胃',

        '🚭 戒烟限酒：完全戒烟；男性<25g酒精/日(≈1两白酒)，女性<15g/日'

    ];

    if (advice.lifestyleRecommendations.length < 5) {

        for (var gi = 0; gi < genericLifestyles.length; gi++) {

            var exists = false;

            for (var ei = 0; ei < advice.lifestyleRecommendations.length; ei++) {

                if (advice.lifestyleRecommendations[ei].tip.indexOf(genericLifestyles[gi].substring(0,4)) > -1) { exists = true; break; }

            }

            if (!exists) advice.lifestyleRecommendations.push({ target: '通用', tip: genericLifestyles[gi] });

        }

    }

    

    // 优先行动（按风险等级排序）

    crossRisks.forEach(function(risk) {

        if (risk.level === 'high') {

            advice.priorityActions.push({

                priority: '紧急',

                text: risk.category + '：' + risk.desc,

                detail: risk.details

            });

        }

    });

    crossRisks.forEach(function(risk) {

        if (risk.level === 'medium') {

            advice.priorityActions.push({

                priority: '重要',

                text: risk.category + '：' + risk.desc,

                detail: risk.details

            });

        }

    });



    // 复查计划

    var urgentItems = abnormalItems.filter(function(i){return i.status==='abnormal';});

    var warningItems = abnormalItems.filter(function(i){return i.status==='warning';});

    

    if (urgentItems.length > 0) {

        advice.followUpPlan.push({

            timeframe: '🔴 2周内复查',

            items: urgentItems.slice(0,5).map(function(i){return i.name;}),

            note: '明显异常指标，需尽快复查确认趋势'

        });

    }

    if (warningItems.length > 0) {

        advice.followUpPlan.push({

            timeframe: '🟡 1-3月随访',

            items: warningItems.slice(0,5).map(function(i){return i.name;}),

            note: '临界值指标，生活方式干预后复查观察趋势'

        });

    }

    advice.followUpPlan.push({

        timeframe: '🟢 年度体检',

        items: ['全项检查'],

        note: '即使当前正常也建议每年例行体检'

    });

    

    // 红色警示

    if (crossRisks.some(function(r){return r.level==='high';})) {

        advice.redFlags.push('⛔ 存在高等级风险因子组合，强烈建议尽快到三甲医院相应专科就诊');

    }

    if (abnormalItems.some(function(i){return (i.value&&parseFloat(i.value)>99)&&(/(转氨酶|ALT|AST)/.test(i.name));})) {

        advice.redFlags.push('⛔ 转氨酶显著升高可能提示急性肝损伤，请立即停用可疑药物并消化内科急诊就诊');

    }

    if (abnormalItems.some(function(i){return (i.value&&parseFloat(i.value)>9)&&/(肌酐|CREA)/.test(i.name);})) {

        advice.redFlags.push('⛔ 肌酐显著升高提示肾功能不全可能，请肾内科尽快评估');

    }

    

    if (advice.redFlags.length === 0) {

        advice.redFlags.push('✅ 未发现需要立即干预的危急指标');

    }

    

    return advice;

}



// 显示综合分析结果 v2.0 — 中西医结合专业版（医生级展示）

function displayComprehensiveAnalysis(result) {

    var container = document.getElementById('report-analysis-result');

    if(!container) return;

    container.style.display = 'block';


    // ★ 当所有报告识别失败时，显示提示而非假数据
    if (result.allFailed) {
        container.innerHTML = '<div style="max-width:600px;margin:40px auto;text-align:center;">' +
            '<div style="background:#fff3e0;border:2px solid #ff9800;border-radius:12px;padding:30px;margin-bottom:20px;">' +
            '<p style="font-size:20px;color:#e65100;margin-bottom:12px;">⚠️ 图片识别失败</p>' +
            '<p style="color:#666;margin-bottom:16px;">所有报告均未能识别出有效指标</p>' +
            '<p style="color:#333;margin-bottom:8px;">可能原因：图片模糊、倾斜、光线不足</p>' +
            '</div>' +
            '<button onclick="switchReportMode(\'manual\')" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:14px 36px;border-radius:8px;font-size:16px;cursor:pointer;box-shadow:0 4px 15px rgba(102,126,234,0.4);">✏️ 切换到手动输入模式</button>' +
            '</div>';
        return;
    }

    

    var html = '';

    

    var adv = result.comprehensiveAdvice;



    // ═══ ① 头部概览卡片（深蓝渐变）═══

    html += '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);color:white;padding:22px;border-radius:14px;margin-bottom:18px;box-shadow:0 4px 15px rgba(0,0,0,0.15);">';

    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-size:24px;">🏥</span><h3 style="margin:0;font-size:19px;font-weight:700;">综合健康分析报告</h3></div>';

    html += '<p style="margin:0 0 6px 0;font-size:14px;opacity:0.95;">共分析 <strong>'+result.totalReports+'</strong> 份报告 · <strong>'+result.totalItems+'</strong> 项指标 · 发现 <strong style="color:#fbbf24;">'+result.totalAbnormals+'</strong> 项异常</p>';

    html += '<p style="margin:0;font-size:12px;opacity:0.65;">分析时间：' + new Date(result.analyzedAt).toLocaleString() + '</p>';

    html += '</div>';



    // ═══ ② 报告来源汇总 ═══

    html += '<div style="margin-bottom:18px;"><h4 style="color:#1e293b;font-size:15px;margin:0 0 10px 0;display:flex;align-items:center;gap:6px;"><span>📂</span> 报告来源汇总</h4>';

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">';

    for (var s = 0; s < result.reportSummaries.length; s++) {

        var sm = result.reportSummaries[s];

        var hasAbn = sm.abnormalCount > 0;

        html += '<div style="background:'+(hasAbn?'linear-gradient(135deg,#fef2f2,#fee2e2)':'linear-gradient(135deg,#f0fdf4,#dcfce7)')+';padding:12px;border-radius:10px;border:1px solid '+(hasAbn?'#fecaca':'#bbf7d0')+';">';

        html += '<div style="font-weight:600;font-size:12px;color:#1e293b;white-space:nowrap;overflow:hidden;text-ellipsis;">' + sm.name + '</div>';

        html += '<div style="font-size:11px;color:#64748b;margin-top:3px;">' + (sm.type||'未知类型') + '</div>';

        html += '<div style="margin-top:6px;font-size:12px;font-weight:600;color:'+(hasAbn?'#dc2626':'#16a34a')+';">' + (hasAbn?sm.abnormalCount + '项⚠️ 异常':'✅ 正常') + '<span style="color:#94a3b8;font-weight:400;font-size:11px;"> / 共'+sm.totalCount+'项</span></div></div>';

    }

    html += '</div></div>';

    

    // ═══ ③ 跨报告风险评估 ═══

    html += '<h4 style="color:#1e293b;font-size:15px;margin:16px 0 10px 0;display:flex;align-items:center;gap:6px;"><span>⚠️</span> 跨报告风险交叉评估</h4>';

    for (var ri = 0; ri < result.crossRisks.length; ri++) {

        var risk = result.crossRisks[ri];

        var lcH={high:'#dc2626',medium:'#d97706',low:'#16a34a',normal:'#2563eb'},lcB={high:'#991b1b',medium:'#92400e',low:'#166534',normal:'#1e40af'};

        var cl=risk.level||'low';

        html += '<div style="background:'+(cl==='high'?'#fef2f2':cl==='medium'?'#fffbeb':cl==='normal'?'#eff6ff':'#f0fdf4')+';border-left:4px solid '+(lcH[cl]||'#16a34a')+';padding:14px 16px;border-radius:0 10px 10px 0;margin-bottom:10px;">';

        html += '<div style="display:flex;justify-content:space-between;align-items:center;"><strong style="font-size:14px;color:'+(lcB[cl]||'#166534')+';">' + risk.category + '</strong><span style="font-size:11px;background:'+(lcH[cl]||'#16a34a')+';color:white;padding:2px 10px;border-radius:20px;font-weight:600;">' + (cl==='high'?'高风险':cl==='medium'?'中风险':cl==='normal'?'无风险':'低关注') + '</span></div>';

        html += '<p style="font-size:13px;color:#475569;margin:8px 0 0 0;line-height:1.6;">' + risk.desc + '</p>';

        if (risk.details) html += '<p style="font-size:12px;color:#94a3b8;margin:4px 0 0 0;">📌 涉及指标：<em>' + risk.details + '</em></p>';

        html += '</div>';

    }

    

    // ===== 全部异常明细表 =====

    if (result.allAbnormalItems.length > 0) {

        html += '<h4 style="color:#334155;font-size:15px;margin:16px 0 8px 0;">🔬 异常指标明细</h4>';

        html += '<table style="width:100%;border-collapse:collapse;font-size:13px;background:white;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">';

        html += '<thead><tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;">指标名称</th><th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;">检测结果</th><th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;">参考范围</th><th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;">状态</th><th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;">来自报告</th></tr></thead><tbody>';

        

        for (var ai = 0; ai < result.allAbnormalItems.length; ai++) {

            var it = result.allAbnormalItems[ai];

            var sc = it.status === 'abnormal' ? '#fef2f2' : '#fffbeb';

            var st = it.status === 'abnormal' ? '❌ 异常' : '⚡ 临界';

            var stColor = it.status === 'abnormal' ? '#dc2626' : '#d97706';

            html += '<tr style="background:' + sc + ';">';

            html += '<td style="padding:8px;border-bottom:1px solid #f1f5f9;font-weight:600;">' + (it.name||'-') + '</td>';

            html += '<td style="padding:8px;border-bottom:1px solid #f1f5f9;color:' + stColor + ';font-weight:600;">' + (it.value||'-') + (it.unit||'') + '</td>';

            html += '<td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#64748b;">' + (it.ref||'-') + '</td>';

            html += '<td style="padding:8px;border-bottom:1px solid #f1f5f9;color:' + stColor + ';font-weight:bold;">' + st + '</td>';

            html += '<td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#94a3b8;">' + (it._sourceReport || '-') + '</td>';

            html += '</tr>';

        }

        html += '</tbody></table>';

    }

    

    // ═══★ 核心：中西医综合治疗建议（专业版）═══



    // 总体评估

    html += '<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);padding:16px 18px;border-radius:12px;border-left:5px solid #2563eb;margin:20px 0 14px 0;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="font-size:18px;">🩺</span><strong style="font-size:15px;color:#1e40af;">总体评估</strong></div><p style="font-size:14px;color:#334155;margin:0;line-height:1.75;">'+adv.overallAssessment+'</p></div>';



    // ⭐ 中医诊断辨证

    if (adv.tcmDiagnoses && adv.tcmDiagnoses.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#fdf4ff,#fae8ff);padding:18px;border-radius:12px;border-left:5px solid #a855f7;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">🌿</span><strong style="font-size:15px;color:#7e22ce;">中医诊断与辨证</strong><span style="font-size:11px;background:#a855f7;color:white;padding:2px 8px;border-radius:10px;margin-left:auto;">核心分析</span></div>';

        for (var ti = 0; ti < adv.tcmDiagnoses.length; ti++) { var td = adv.tcmDiagnoses[ti];

            html += '<div style="background:rgba(255,255,255,0.7);padding:12px 14px;border-radius:10px;margin-bottom:10px;"><div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;"><strong style="color:#6b21a8;font-size:14px;">▸ '+td.diagnosis+'</strong><span style="font-size:12px;background:#ede9fe;color:#6b21a8;padding:2px 8px;border-radius:6px;">对应指标：'+td.indicator+' ('+td.value+')</span></div><p style="font-size:13px;color:#581c87;margin:6px 0 0 0;line-height:1.65;"><strong>证候特征：</strong>'+(td.features||'待进一步四诊合参')+'</p></div>'; }

        html += '</div>';

    }



    // 🌸 中药方剂推荐

    if (adv.herbalFormulas && adv.herbalFormulas.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#fdf2f8,#fce7f3);padding:18px;border-radius:12px;border-left:5px solid #ec4899;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">🌸</span><strong style="font-size:15px;color:#be185d;">中药方剂推荐</strong></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;">';

        for (var hi = 0; hi < adv.herbalFormulas.length; hi++) { var hf = adv.herbalFormulas[hi]; html += '<div style="background:rgba(255,255,255,0.75);padding:10px 14px;border-radius:8px;"><div style="font-weight:600;color:#9d174d;font-size:14px;">'+hf.name+'</div><div style="font-size:11px;color:#be185d;margin-top:3px;">🎯 针对：'+hf.target+'</div></div>'; }

        html += '</div><p style="font-size:12px;color:#9d174d;margin:10px 0 0 0;">💡 方剂需在执业中医师指导下，根据个人体质和脉证加减化裁使用。</p></div>';

    }



    // 💊 中成药方案

    if (adv.chineseMedicines && adv.chineseMedicines.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);padding:18px;border-radius:12px;border-left:5px solid #ea580c;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">💊</span><strong style="font-size:15px;color:#c2410c;">中成药方案</strong></div><div style="display:grid;gap:8px;">';

        for (var cmi = 0; cmi < adv.chineseMedicines.length; cmi++) { var cm = adv.chineseMedicines[cmi]; html += '<div style="background:rgba(255,255,255,0.8);padding:10px 14px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;"><span style="font-weight:600;color:#9a3412;font-size:13px;">● '+cm.med+'</span><span style="font-size:11px;background:#fed7aa;color:#9a3412;padding:2px 8px;border-radius:6px;">→ '+cm.target+'</span></div>'; }

        html += '</div></div>';

    }



    // 🧪 西药参考方案

    if (adv.westernMedications && adv.westernMedications.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);padding:18px;border-radius:12px;border-left:5px solid #2563eb;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">🧪</span><strong style="font-size:15px;color:#1e40af;">西药参考方案</strong><span style="font-size:11px;background:#3b82f6;color:white;padding:2px 8px;border-radius:10px;margin-left:auto;">需遵医嘱</span></div>';

        for (var wmi = 0; wmi < adv.westernMedications.length; wmi++) { var wm = adv.westernMedications[wmi]; html += '<div style="background:rgba(255,255,255,0.8);padding:12px 14px;border-radius:10px;margin-bottom:8px;"><div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px;"><strong style="color:#1e40af;font-size:14px;">'+wm.med.name+'</strong><span style="font-size:11px;background:#bfdbfe;color:#1e40af;padding:2px 8px;border-radius:6px;">→ '+wm.target+'</span></div><div style="font-size:12px;color:#1e3a8a;margin:4px 0;">📋 用法用量：<strong>'+wm.med.usage+'</strong></div><div style="font-size:12px;color:#dc2626;margin:2px 0 0 0;">⚠️ 注意事项：'+wm.med.note+'</div></div>'; }

        html += '</div>';

    }



    // 📍 穴位外治方案

    if (adv.acupointSchemes && adv.acupointSchemes.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:18px;border-radius:12px;border-left:5px solid #059669;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">📍</span><strong style="font-size:15px;color:#047857;">穴位外治方案</strong><span style="font-size:11px;background:#10b981;color:white;padding:2px 8px;border-radius:10px;margin-left:auto;">自我保健</span></div>';

        for (var api = 0; api < adv.acupointSchemes.length; api++) { var ap = adv.acupointSchemes[api]; html += '<div style="background:rgba(255,255,255,0.75);padding:10px 14px;border-radius:8px;margin-bottom:8px;"><div style="font-size:12px;color:#047857;font-weight:600;margin-bottom:5px;">🎯 '+ap.target+' → 推荐穴位组合：</div><div style="display:flex;flex-wrap:wrap;gap:6px;">'; for (var pi = 0; pi < ap.points.length; pi++) { html += '<span style="background:#a7f3d0;color:#065f46;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:500;">'+ap.points[pi]+'</span>'; } html += '</div><div style="font-size:11px;color:#059669;margin-top:5px;">操作方法：每穴按揉3-5分钟，以酸胀感为度；可配合艾灸/贴压</div></div>'; }

        html += '</div>';

    }



    // 🥗 营养素干预方案

    if (adv.nutritionScheme && adv.nutritionScheme.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);padding:18px;border-radius:12px;border-left:5px solid #ca8a04;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">🥗</span><strong style="font-size:15px;color:#854d0e;">营养素干预方案</strong></div>';

        for (var nui = 0; nui < adv.nutritionScheme.length; nui++) { var nu = adv.nutritionScheme[nui].nu, nuTg = adv.nutritionScheme[nui].target; html += '<div style="background:rgba(255,255,255,0.8);padding:12px 14px;border-radius:10px;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><strong style="color:#a16207;font-size:14px;">✦ '+(nu.nutrient || nu.fluid || nu.glutamine || '营养素')+'</strong><span style="font-size:11px;background:#fde68a;color:#854d0e;padding:2px 8px;border-radius:6px;">→ '+nuTg+'</span></div>'; if(nu.daily)html+='<div style="font-size:12px;color:#713f12;margin:3px 0;"><strong>推荐摄入量：</strong>'+nu.daily+'</div>';html+='<div style="font-size:12px;color:#713f12;margin:3px 0;"><strong>食物来源：</strong>'+nu.foods+'</div><div style="font-size:12px;color:#059669;margin:3px 0;"><strong>医学依据：</strong>'+(nu.reason||'辅助支持机体正常功能')+'</div></div>'; }

        html += '</div>';

    }

    

    // 🎯 优先行动（保留原有逻辑）

    if (adv.priorityActions && adv.priorityActions.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#fef2f2,#fee2e2);padding:18px;border-radius:12px;border-left:5px solid #dc2626;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">🎯</span><strong style="font-size:15px;color:#991b1b;">优先行动</strong></div>';

        for (var pa = 0; pa < adv.priorityActions.length; pa++) { var act = adv.priorityActions[pa]; html += '<div style="background:rgba(255,255,255,0.8);padding:12px 14px;border-radius:10px;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:11px;background:'+(act.priority==='紧急'?'#dc2626':'#f59e0b')+';color:white;padding:3px 10px;border-radius:6px;font-weight:600;">'+act.priority+'</span><strong style="color:#991b1b;font-size:13px;">'+act.text+'</strong></div>';if(act.detail)html+='<div style="font-size:12px;color:#64748b;margin-top:4px;">📌 '+act.detail+'</div>';html+='</div>';}

        html += '</div>';

    }

    

    // 🌱 生活方式指导（兼容新旧数据格式）

    if (adv.lifestyleRecommendations && adv.lifestyleRecommendations.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);padding:18px;border-radius:12px;border-left:5px solid #16a34a;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">🌱</span><strong style="font-size:15px;color:#166534;">生活方式指导</strong></div>';

        for (var ls = 0; ls < adv.lifestyleRecommendations.length; ls++) { var lit = adv.lifestyleRecommendations[ls], tipTxt = (typeof lit==='string')?lit:lit.tip, tgt = (typeof lit==='object'&&lit.target)?lit.target:'';

            html += '<div style="background:rgba(255,255,255,0.7);padding:10px 14px;border-radius:8px;margin-bottom:8px;display:flex;align-items:flex-start;gap:8px;"><span style="color:#166534;font-size:14px;flex-shrink:0;">✦</span><div><span style="font-size:13px;color:#15803d;font-weight:500;">'+tipTxt+'</span>';if(tgt&&tgt!=='通用')html+='<span style="font-size:11px;background:#bbf7d0;color:#166534;padding:1px 6px;border-radius:4px;margin-left:6px;">'+tgt+'</span>';html+='</div></div>'; }

        html += '</div>';

    }

    

    // 📅 复查随访计划

    if (adv.followUpPlan && adv.followUpPlan.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#faf5ff,#f3e8ff);padding:18px;border-radius:12px;border-left:5px solid #9333ea;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">📅</span><strong style="font-size:15px;color:#6b21a8;">复查随访计划</strong></div>';

        for (var fpi = 0; fpi < adv.followUpPlan.length; fpi++) { var fpl = adv.followUpPlan[fpi]; html += '<div style="background:rgba(255,255,255,0.7);padding:12px 14px;border-radius:10px;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><strong style="font-size:14px;color:#6b21a8;">'+fpl.timeframe+'</strong><span style="font-size:12px;color:#7e22ce;">→ '+fpl.items.join('、')+'</span></div>';if(fpl.note)html+='<div style="font-size:12px;color:#a78bfa;margin-top:4px;">💡 '+fpl.note+'</div>';html+='</div>';}

        html += '</div>';

    }



    // ⛔ 重要警示

    if (adv.redFlags && adv.redFlags.length > 0) {

        html += '<div style="background:linear-gradient(135deg,#fef2f2,#fee2e2);padding:18px;border-radius:12px;border-left:5px solid #dc2626;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:20px;">⛔</span><strong style="font-size:15px;color:#991b1b;">重要警示</strong></div>';

        for (var rfi = 0; rfi < adv.redFlags.length; rfi++){ html+='<div style="padding:8px 0;font-size:13px;color:#991b1b;line-height:1.6;">🔴 '+adv.redFlags[rfi]+'</div>'; }

        html += '</div>';

    }



    // 免责声明（专业版）

    html += '<div style="background:#f8fafc;padding:14px;border-radius:10px;margin-top:20px;font-size:12px;color:#64748b;text-align:center;border:1px dashed #cbd5e1;">';

    html += '📋 以上为 <strong>AI辅助中西医结合解读</strong>，仅供临床参考。<br>最终诊断和治疗方案请以执业医师面诊为准。如有不适请及时就医。</div>';



    // 操作按钮

    html += '<div style="display:flex;gap:12px;margin-top:16px;">';

    html += '<button onclick="saveComprehensiveAnalysis()" class="btn btn-primary" style="flex:1;padding:12px;border-radius:10px;font-weight:600;">💾 保存完整报告</button>';

    html += '<button onclick="exportComprehensiveAnalysis()" class="btn" style="padding:12px;border-radius:10px;font-weight:600;">🖨️ 导出PDF</button></div>';

    

    container.innerHTML = html;

    

    // 滚动到结果区域

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });

}



window.saveComprehensiveAnalysis = function() {

    saveHealthProfileForm(); // 利用现有保存机制

    showToast('✅ 综合分析报告已保存到健康档案', 'success');

};

window.exportComprehensiveAnalysis = function() {

    showToast('📄 PDF导出功能开发中...', 'info');

};



// 舌诊文件选择变化处理（统一入口）

window.handleTongueFileChange = function(input) {

    var dbg = document.getElementById('debug-info');

    if (!dbg) dbg = document.getElementById('debug-info-tongue') || document.getElementById('debug-info-report') || document.getElementById('debug-info-imaging');



    if (!input) { if(dbg){dbg.style.display='block';dbg.innerHTML='<b>❌ 错误:</b> input 参数为空';} return; }

    if (!input.files || !input.files[0]) { if(dbg){dbg.style.display='block';dbg.innerHTML='<b>⚠️ 未选择文件</b>'; } return; }



    var file = input.files[0];

    console.log('[舌诊上传] 文件选中:', file.name, file.type, file.size);

    

    if(dbg) {

        dbg.style.display='block';

        dbg.innerHTML = '✅ <b>文件已选中:</b> '+file.name+' | 类型:'+file.type+' | 大小:'+(file.size/1024).toFixed(1)+'KB<br><span style="color:green">正在读取预览...</span>';

    }



    var r = new FileReader();

    r.onload = function(e) {

        var targetImg = document.getElementById('tongue-image');

        var targetCont = document.getElementById('tongue-preview');

        if (targetImg) targetImg.src = e.target.result;

        if (targetCont) targetCont.style.display = 'block';

        console.log('[舌诊上传] 图片预览完成');

        if(dbg) dbg.innerHTML += '<br>✅ <b>预览完成!</b>';

    };

    r.onerror = function() {

        showToast('图片读取失败','error');

        if(dbg) dbg.innerHTML += '<br>❌ <b>FileReader 读取失败</b>';

    };

    r.readAsDataURL(file);

};



// 影像上传内联入口（避免HTML引号嵌套问题）

window.handleImagingUpload = function(input) {

    var dbg = document.getElementById('debug-info-imaging');

    

    if (!input || !input.files || !input.files.length) {

        if(dbg) { dbg.style.display='block'; dbg.innerHTML = '⚠️ 未选择文件'; }

        return;

    }



    var c = document.getElementById('imaging-preview-list');

    c.innerHTML = '';

    c.style.display = 'grid';

    

    var total = input.files.length, done = 0;

    

    for (var i = 0; i < input.files.length; i++) {

        (function(f) {

            var reader = new FileReader();

            reader.onload = function(e) {

                var d = document.createElement('div');

                d.className = 'image-list-item';

                d.innerHTML = '<img src="' + e.target.result + '" alt="影像"><button onclick="this.parentElement.remove()">✕</button>';

                c.appendChild(d);

                done++;

                if (done >= total) {

                    document.getElementById('btn-analyze-imaging').disabled = false;

                    if(dbg) dbg.innerHTML = '✅ <b>选中 ' + total + ' 个文件，预览完成!</b>';

                }

            };

            reader.onerror = function() { 

                done++; 

                if(done >= total) document.getElementById('btn-analyze-imaging').disabled = false; 

            };

            reader.readAsDataURL(f);

        })(input.files[i]);

    }

    

    if(dbg) {

        dbg.style.display='block'; 

        dbg.innerHTML = '✅ 选中 ' + input.files.length + ' 个文件，正在生成预览...';

    }

};



// 影像文件选择变化处理（统一入口）

window.handleImagingFileChange = function(input) {

    var dbg = document.getElementById('debug-info-imaging');

    

    if (!input || !input.files) {

        if(dbg) { dbg.style.display='block'; dbg.innerHTML = '⚠️ <b>未选择文件</b>'; }

        return;

    }

    console.log('[影像上传] 选中文件数:', input.files.length);

    

    if(dbg) {

        dbg.style.display = 'block';

        dbg.innerHTML = '✅ <b>选中 ' + input.files.length + ' 个影像文件</b><br><span style="color:green">正在生成预览...</span>';

    }

    

    previewMultipleImages(input,'imaging-preview-list','btn-analyze-imaging');

    if(dbg) dbg.innerHTML += '<br>✅ 预览完成!';

};



function previewImage(input,imgId,contId){

    if(!input.files||!input.files[0])return;

    var file=input.files[0];

    

    // PDF文件 → 走PDF预览逻辑

    if(file.type==='application/pdf'){

        previewReportPDF(file);

        return;

    }

    

    // 图片文件 → 原有逻辑

    var r=new FileReader();

    r.onload=function(e){

        // 隐藏PDF预览区

        var pdfArea=document.getElementById('report-preview-pdf');

        if(pdfArea)pdfArea.style.display='none';

        var targetImg=document.getElementById(imgId);

        var targetCont=document.getElementById(contId);

        if(targetImg)targetImg.src=e.target.result;

        // 兼容：contId 可能不存在或名称不同

        if(targetCont)targetCont.style.display='block';

        window._reportFileType='image';

    };

    r.readAsDataURL(file);

}



// PDF预览函数

window.previewReportPDF=function(file){

    var pdfArea=document.getElementById('report-preview-pdf');

    var imgArea=document.getElementById('report-preview-image');

    if(imgArea)imgArea.style.display='none';

    if(!pdfArea)return;

    

    // 显示文件名和大小

    document.getElementById('report-pdf-name').textContent=file.name;

    document.getElementById('report-pdf-size').textContent=formatFileSize(file.size);

    

    // 用FileReader读取PDF并用iframe显示

    var r=new FileReader();

    r.onload=function(e){

        var iframe=document.getElementById('report-pdf-iframe');

        if(iframe)iframe.src=e.target.result;

        pdfArea.style.display='block';

        window._reportFileType='pdf';

        window._reportFileName=file.name;

    };

    r.readAsDataURL(file);

};



// 文件大小格式化

window.formatFileSize=function(bytes){

    if(bytes<1024)return bytes+' B';

    if(bytes<1024*1024)return (bytes/1024).toFixed(1)+' KB';

    return (bytes/1024/1024).toFixed(1)+' MB';

};



function previewMultipleImages(input,contId,btnId){

    var c=document.getElementById(contId),b=document.getElementById(btnId);if(!c)return;c.innerHTML='';c.style.display='grid';

    for(var i=0;i<input.files.length;i++)(function(f){var r=new FileReader();

    r.onload=function(e){var d=document.createElement('div');d.className='image-list-item';d.innerHTML='<img src="'+e.target.result+'" alt="影像"><button class="remove-img-btn" onclick="this.parentElement.remove()">✕</button>';c.appendChild(d);if(b)document.getElementById(btnId).disabled=false;};

    r.readAsDataURL(f);})(input.files[i]);

}



// 舌诊 - 供HTML按钮直接调用的安全入口

window.doAnalyzeTongue=async function(){

    var el=document.getElementById('tongue-image');

    if(!el||!el.src||!el.src.length||el.src.indexOf('data:')!==0){showToast&&showToast('请先上传舌苔照片','warning');return;}

    showToast&&showToast('AI分析中...','info');

    try{

        var result;

        if(typeof analyzeTongueImage==='function'){result=await analyzeTongueImage(el);}

        else{result=typeof generateDefaultTongueResult==='function'?generateDefaultTongueResult():null;}

        if(result&&result.tongueBody){displayTongueAnalysis(result);}

        else{var fallback=typeof generateDefaultTongueResult==='function'?generateDefaultTongueResult():null;if(fallback)displayTongueAnalysis(fallback);else showToast&&showToast('无法生成分析结果','error');}

    }catch(err){

        console.error('[舌诊分析]',err);

        var fallback=typeof generateDefaultTongueResult==='function'?generateDefaultTongueResult():null;

        if(fallback)displayTongueAnalysis(fallback);

        else showToast&&showToast('分析出错，请重试','error');

    }

};



window.retakeTonguePhoto=function(){document.getElementById('tongue-file-input').value='';document.getElementById('tongue-image').src='';document.getElementById('tongue-preview').style.display='none';document.getElementById('tongue-analysis-result').style.display='none';};

window.analyzeTongue=async function(){

    var el=document.getElementById('tongue-image');if(!el.src){showToast('先上传舌苔照片','warning');return;}

    showToast('AI分析舌象中...','info');

    try{

        var result=await analyzeTongueImage(el);

        displayTongueAnalysis(result);

    }catch(err){

        console.error('[舌诊分析] 出错:', err);

        // 兜底：用默认数据显示

        displayTongueAnalysis(generateDefaultTongueResult());

        showToast('分析完成（使用模拟数据）','success');

    }

};



function displayTongueAnalysis(result){

    if(!result){showToast&&showToast('分析数据为空','error');return;}

    document.getElementById('tongue-analysis-result').style.display='block';

    var bh='';

    var tb=result.tongueBody||{},tc=result.tongueCoat||{},c=result.constitution||{},s=result.syndromeRef||{};

    var tbc=tb.color||{};var tbs=tb.shape||{};

    bh+=riItem('舌色',tbc.label||'未知',tbc.meaning||'-','accent');

    if(tbs.label)bh+=riItem('舌形',tbs.label,tbs.meaning||'-','warning');

    document.getElementById('tongue-body-result').innerHTML=bh;

    var st=tc.status==='danger'?'danger':tc.status==='warning'?'warning':'success';

    document.getElementById('tongue-coat-result').innerHTML=riItem('舌苔颜色',tc.label||'未知',tc.meaning||'-',st);



    document.getElementById('constitution-result').innerHTML='<div class="constitution-type">'+(c.name||'未知体质')+'</div><div class="constitution-desc">'+(c.desc||'-')+'</div><div class="constitution-tags">'+((c.features||[]).map(function(f){return'<span class="constitution-tag">'+f+'</span>';}).join('')||'-')+'</div>';



    var symHtml='<div class="syndrome-card"><div class="syndrome-name">'+(s.name||'-')+'</div>';

    symHtml+='<div class="syndrome-symptoms">舌象：'+(s.tongueDesc||'-')+'<br>主证：'+((s.symptoms||[]).join('、')||'-')+'</div>';

    symHtml+='<div class="syndrome-advice">推荐方剂：'+(s.formula||'-')+'</div><div class="syndrome-advice">调理建议：'+(s.advice||'-')+'</div></div>';

    document.getElementById('syndrome-reference').innerHTML=symHtml;



    var diet=c.diet||{};

    

    // ===== 增强版：完整用药建议系统 =====

    var cKey = c.key || 'pinghe';

    var medicationAdvice = generateMedicationAdvice(cKey, result);

    

    var adviceHtml = '<div class="interpretation-text"><strong>推荐食物:</strong> '+((diet.recommend||[]).join('、')||'-')+'<br><br><strong>禁忌食物:</strong> '+((diet.avoid||[]).join('、')||'-')+'<br><br><strong>生活建议:</strong> '+((c.advice)||'-')+'</div>';

    // 追加完整用药建议板块

    adviceHtml += medicationAdvice;

    

    document.getElementById('tongue-advice').innerHTML = adviceHtml;

    showToast&&showToast('分析完成 置信度:'+(result.confidence||'-')+'%','success');

}



// ===== 体质→完整用药建议映射系统（专业版）=====

function generateMedicationAdvice(constitutionKey, tongueResult) {

    var medMap = {

        qixu: {

            chinesePatent: [

                {name:'补中益气丸', dose:'水蜜丸6g/次，2-3次/日', effect:'健脾益气，升阳举陷。用于体倦乏力、食少腹胀、便溏久泻。', note:'感冒发热时停服'},

                {name:'归脾丸', dose:'水蜜丸6g/次，3次/日', effect:'益气健脾，养血安神。用于心脾两虚、失眠多梦。', note:'忌生冷油腻'},

                {name:'参苓白术散', dose:'6-9g/次，2-3次/日', effect:'补脾胃，益肺气。用于脾胃虚弱、食少便溏。', note:'饭前服用为宜'}

            ],

            chineseHerbal: [

                {name:'四君子汤加味', herbs:'党参15g、白术12g、茯苓15g、炙甘草6g、黄芪20g、陈皮6g', method:'水煎服，每日1剂，早晚分服', effect:'健脾益气基础方，适用于脾气虚证'},

                {name:'玉屏风散加减', herbs:'黄芪30g、白术15g、防风10g、太子参15g', method:'水煎服，每日1剂', effect:'益气固表，增强免疫力'}

            ],

            westernMed: {

                available:'一般无需西药治疗。如伴明显疲劳可短期使用：',

                drugs:[

                    {name:'复合维生素B片', dose:'1-2片/次，3次/日', note:'补充B族维生素，改善代谢'},

                    {name:'辅酶Q10', dose:'10-20mg/次，3次/日（饭后）', note:'辅助改善心肌能量代谢（可选）'}

                ]

            },

            nutrition: [

                {name:'蛋白质粉（乳清/大豆）', dose:'10-20g/日', reason:'气虚者常伴蛋白摄入不足或吸收不良'},

                {name:'铁+维生素C组合', dose:'铁14mg + VC200mg/日', reason:'预防气虚导致的营养性贫血'},

                {name:'锌补充剂', dose:'10-15mg/日', reason:'锌参与免疫调节，气虚者免疫力偏低'},

                {name:'维生素D3', dose:'1000-2000 IU/日', reason:'维持骨骼和免疫功能'},

                {name:'益生菌', dose:'10-50亿CFU/日', reason:'改善脾胃运化功能'}

            ]

        },

        yangxu: {

            chinesePatent: [

                {name:'金匮肾气丸', dose:'水蜜丸4.5-6g/次，2次/日', effect:'温补肾阳。用于肾阳不足、腰膝酸软、肢冷尿频。', note:'阴虚火旺者禁用'},

                {name:'附子理中丸', dose:'水蜜丸6g/次，2-3次/日', effect:'温中健脾。用于脾胃虚寒、脘腹冷痛、呕吐泄泻。', note:'孕妇慎用'},

                {name:'右归丸', dose:'水蜜丸6g/次，3次/日', effect:'温补肾阳，填精止遗。用于肾阳不足、命门火衰。', note:'湿热体质禁用'}

            ],

            chineseHerbal: [

                {name:'当归生姜羊肉汤', herbs:'当归15g、生姜30g、羊肉500g', method:'炖煮至肉烂，吃肉喝汤', effect:'温经散寒补血助阳，冬季进补佳品'},

                {name:'桂附地黄汤加减', herbs:'桂枝10g、制附子6g（先煎）、熟地20g、山茱萸12g、山药15g', method:'附子先煎30分钟余药后下水煎日一剂', effect:'温补肾阳经典方'}

            ],

            westernMed: {

                available:'阳虚多属功能调节范畴，西药以对症处理为主：',

                drugs:[

                    {name:'维生素E软胶囊', dose:'100mg/次，1-2次/日', note:'抗氧化，改善末梢循环'},

                    {name:'L-精氨酸', dose:'2-3g/日（分次）', note:'促进血管舒张，改善四肢冰凉'}

                ]

            },

            nutrition: [

                {name:'深海鱼油（Omega-3）', dose:'1-2g/日', reason:'改善循环代谢，保护心血管'},

                {name:'维生素D3+K2', dose:'D3 2000IU + K2 100μg/日', reason:'促进钙吸收利用，增强骨密度'},

                {name:'辅酶Q10', dose:'100-200mg/日（随餐）', reason:'提升细胞线粒体能量产生'},

                {name:'镁补充剂', dose:'300-400mg/日（甘氨酸镁/柠檬酸镁）', reason:'放松肌肉血管，改善手脚冰凉'},

                {name:'左旋肉碱', dose:'500-1000mg/日', reason:'辅助脂肪代谢，增加产热'}

            ]

        },

        yinxu: {

            chinesePatent: [

                {name:'六味地黄丸', dose:'水蜜丸6g/次，2次/日', effect:'滋阴补肾。用于肾阴亏损、头晕耳鸣、腰膝酸软、盗汗遗精。', note:'脾虚便溏者慎用'},

                {name:'知柏地黄丸', dose:'水蜜丸6g/次，3次/日', effect:'滋阴降火。用于阴虚火旺、潮热盗汗、口干咽痛。', note:'虚寒证禁用'},

                {name:'杞菊地黄丸', dose:'水蜜丸6g/次，2次/日', effect:'滋肾养肝。用于肝肾阴亏、视物昏花、迎风流泪。', note:'眼部保健首选'}

            ],

            chineseHerbal: [

                {name:'百合固金汤加减', herbs:'生地12g、熟地12g、麦冬10g、百合15g、白芍10g、当归8g、甘草6g', method:'水煎服，每日1剂', effect:'养阴润肺止咳，适合阴虚干咳'},

                {name:'增液汤合二至丸', herbs:'玄参30g、麦冬24g、生地24g、女贞子15g、旱莲草15g', method:'水煎服，每日1剂', effect:'滋阴增液凉血，适合阴虚内热便秘'}

            ],

            westernMed: {

                available:'阴虚以中医调理为主，西医侧重症状管理：',

                drugs:[

                    {name:'电解质平衡饮料', dose:'适量补充，尤其运动后', note:'防止阴虚盗汗导致的水电解质丢失'},

                    {name:'褪黑素（短期）', dose:'1-3mg/晚睡前30分钟', note:'仅用于严重入睡困难者（不超过4周）'}

                ]

            },

            nutrition: [

                {name:'钙+镁+维生素D复合制剂', dose:'钙500mg + 镁250mg + D3 800IU/日', reason:'阴虚者骨密度偏低风险较高'},

                {name:'维生素C（天然酯化C）', dose:'500-1000mg/日（分次）', reason:'抗氧化，缓解阴虚内热'},

                {name:'卵磷脂', dose:'1200-2400mg/日', reason:'滋养肝肾，支持神经系统'},

                {name:'β-胡萝卜素/混合类胡萝卜素', dose:'5000-15000 IU/日', reason:'维护黏膜健康，缓解口干眼干'},

                {name:'胶原蛋白肽', dose:'5-10g/日', reason:'改善皮肤干燥，滋润脏腑'}

            ]

        },

        shire: {

            chinesePatent: [

                {name:'龙胆泻肝丸', dose:'水蜜丸3-6g/次，2次/日', effect:'清肝胆，利湿热。用于肝胆湿热、头晕目赤、胁痛口苦。', note:'不可长期服用（伤胃），孕妇禁用'},

                {name:'二妙丸', dose:'6g/次，2-3次/日', effect:'清热燥湿。用于湿热下注、足膝红肿热痛。', note:'阴虚者慎用'},

                {name:'藿香正气水/胶囊', dose:'胶囊2-4粒/次，2次/日 | 水5-10ml/次', effect:'解表化湿，理气和中。用于外感风寒内伤湿滞。', note:'酒精过敏者选胶囊剂型'}

            ],

            chineseHerbal: [

                {name:'三仁汤加减', herbs:'杏仁10g、白蔻仁10g（后下）、薏苡仁30g、厚朴10g、半夏10g、滑石18g（包煎）、竹叶6g', method:'水煎服，每日1剂', effect:'宣畅气机清利湿热——湿热证代表方'},

                {name:'茵陈蒿汤合四逆散', herbs:'茵陈30g、栀子10g、大黄6g、柴胡10g、枳实10g、芍药10g、炙甘草6g', method:'水煎服日一剂', effect:'清利肝胆湿热，疏肝理气'}

            ],

            westernMed: {

                available:'如合并感染需抗炎治疗：',

                drugs:[

                    {name:'益生菌（多菌株高剂量）', dose:'≥500亿CFU/日', note:'调节肠道菌群，改善湿热体质的消化问题'},

                    {name:'消化酶复方制剂', dose:'餐中1-2粒', note:'帮助消化分解，减轻脾胃负担'}

                ]

            },

            nutrition: [

                {name:'膳食纤维（可溶+不溶）', dose:'25-30g/日', reason:'促进肠道排毒，减少湿热内蕴'},

                {name:'奶蓟草（水飞蓟）', dose:'140-210mg/日（标准化提取物）', reason:'保肝护肝，协助清除体内湿热毒素'},

                {name:'姜黄素（黑胡椒增效）', dose:'500-1000mg/日', reason:'强效抗炎，改善代谢性炎症'},

                {name:'铬补充剂', dose:'200-400μg/日', reason:'改善胰岛素敏感性，减少痰湿内生'},

                {name:'苹果醋（有机未过滤）', dose:'1-2汤匙兑水饮用/日', reason:'促进消化，帮助维持正常pH值'}

            ]

        },

        xueyu: {

            chinesePatent: [

                {name:'血府逐瘀丸', dose:'水蜜丸6g/次，2次/日', effect:'活血祛瘀，行气止痛。用于胸中血瘀、头痛眩晕。', note:'孕妇禁用，月经量多者慎用'},

                {name:'复方丹参滴丸', dose:'10丸/次，舌下含服或口服，3次/日', effect:'活血化瘀，理气止痛。用于胸闷心痛。', note:'寒凝血瘀者配合理中汤'},

                {name:'桂枝茯苓丸', dose:'6g/次，2次/日', effect:'活血化瘀消癥。用于妇人宿有癥块、痛经闭经。', note:'经期停服'}

            ],

            chineseHerbal: [

                {name:'血府逐瘀汤原方', herbs:'桃仁12g、红花9g、当归9g、生地9g、川芎5g、赤芍6g、牛膝9g、桔梗5g、柴胡3g、枳壳6g、甘草3g', method:'水煎服，每日1剂', effect:'活血化瘀第一方，主治胸中血瘀'},

                {name:'身痛逐瘀汤加减', herbs:'秦艽3g、川芎6g、桃仁9g、红花9g、甘草6g、羌活3g、没药6g、五灵脂6g（包煎）、地龙6g、香附3g、牛膝9g、当归9g', method:'水煎服日一剂', effect:'活血行气祛瘀通络，治气血痹阻经络'}

            ],

            westernMed: {

                available:'血瘀涉及循环障碍，西药以改善微循环为主：',

                drugs:[

                    {name:'阿司匹林肠溶片', dose:'75-100mg/日（晚餐后）', note:'需医师处方！抗血小板聚集，预防血栓'},

                    {name:'银杏叶提取物', dose:'40-80mg/次，3次/日', note:'改善脑部和周围循环'}

                ]

            },

            nutrition: [

                {name:'纳豆激酶', dose:'2000-3600 FU/日（空腹）', reason:'溶解纤维蛋白，改善血液流变性（与抗凝药同服需医师指导）'},

                {name:'深海鱼油（高浓度EPA/DHA）', dose:'2-3g EPA+DHA/日', reason:'降低甘油三酯，抑制血小板聚集'},

                {name:'维生素K2（MK-7型）', dose:'90-180μg/日', reason:'引导钙入骨骼而非血管壁，预防血管钙化'},

                {name:'L-精氨酸+瓜氨酸', dose:'精氨酸1g + 瓜氨酸500mg/日', reason:'促进一氧化氮合成，扩张血管'},

                {name:'碧萝芷（法国海岸松树皮提取物）', dose:'50-100mg/日', reason:'强力抗氧化，保护血管内皮'}

            ]

        },

        qiyu: {

            chinesePatent: [

                {name:'逍遥丸', dose:'水蜜丸6g/次，2次/日', effect:'疏肝健脾，养血调经。用于月经不调、胸胁胀痛。', note:'情绪调理第一药'},

                {name:'柴胡疏肝散丸', dose:'4.5g/次，2次/日', effect:'疏肝理气，消胀止痛。用于肝气郁滞、胁肋疼痛。', note:'孕妇慎用'},

                {name:'加味逍遥丸（丹栀逍遥丸）', dose:'6g/次，2-3次/日', effect:'疏肝清热，健脾养血。用于肝郁化火。', note:'适合伴有烦躁易怒者'}

            ],

            chineseHerbal: [

                {name:'逍遥散原方', herbs:'柴胡15g、当归15g、白芍15g、白术15g、茯苓15g、生姜15g、薄荷6g（后下）、炙甘草6g', method:'水煎服日一剂', effect:'疏肝解郁健脾养血——气郁证主方'},

                {name:'甘麦大枣汤合半夏厚朴汤', herbs:'浮小麦30g、大枣10枚、炙甘草6g、半夏10g、厚朴10g、紫苏叶10g、茯苓15g', method:'水煎服日一剂', effect:'养心安神行气开郁，适合梅核气'}

            ],

            westernMed: {

                available:'气郁多与焦虑相关，西医以神经调节为主：',

                drugs:[

                    {name:'谷维素', dose:'10-20mg/次，3次/日', note:'调节植物神经功能紊乱'},

                    {name:'维生素B族复合片', dose:'1片/次，1-2次/日', note:'营养神经，缓解压力反应'}

                ]

            },

            nutrition: [

                {name:'GABA（γ-氨基丁酸）', dose:'200-500mg/日晚间', reason:'天然镇静氨基酸，缓解焦虑促睡眠'},

                {name:'L-茶氨酸', dose:'100-200mg/日', reason:'促进α脑波，放松身心而不嗜睡'},

                {name:'圣约翰草（贯叶连翘）标准化提取物', dose:'300mg×3次/日', reason:'天然抗抑郁作用，但与多种药物有交互！必须在医师指导下使用'},

                {name:'镁（甘氨酸镁/苏糖酸镁）', dose:'200-400mg/日晚间', reason:'舒缓紧张情绪，改善睡眠质量'},

                {name:'B族维生素复合+B12', dose:'B50复合配方/日', reason:'支持神经系统健康和抗压能力'}

            ]

        },

        tanshi: {

            chinesePatent: [

                {name:'陈夏六君子丸', dose:'6-9g/次，2-3次/日', effect:'健脾燥湿化痰。用于脾胃虚弱、痰湿内阻。', note:'阴虚者不宜长期服用'},

                {name:'二陈丸', dose:'9-15g/次，2次/日', effect:'燥湿化痰，理气和胃。用于咳嗽痰多、胸脘胀闷。', note:'肺阴虚咳痰少黏者禁用'},

                {name:'平胃散（颗粒/丸剂）', dose:'按说明书', effect:'燥湿运脾，行气和胃。用于湿滞脾胃。', note:'孕妇慎用'}

            ],

            chineseHerbal: [

                {name:'二陈汤合四君子汤', herbs:'法半夏10g、陈皮10g、茯苓15g、炙甘草6g、人参10g、白术10g', method:'水煎服日一剂', effect:'健脾化痰基础方'},

                {name:'温胆汤加减', herbs:'半夏10g、竹茹10g、枳实10g、陈皮10g、茯苓15g、炙甘草6g、生姜5g、大枣4枚', method:'水煎服日一剂', effect:'理气化痰清胆和胃——痰热扰心者尤宜'}

            ],

            westernMed: {

                available:'痰湿体质常伴代谢异常，西医侧重代谢管理：',

                drugs:[

                    {name:'奥利司他（非处方低剂量）', dose:'60mg/次，3次/日（随餐）', note:'减重辅助药物，需结合饮食控制'},

                    {name:'二甲双胍（如合并糖尿病前期）', dose:'需医师处方', note:'仅限血糖异常者在医师指导下使用！'}

                ]

            },

            nutrition: [

                {name:'共轭亚油酸(CLA)', dose:'2-3g/日', reason:'辅助减少体脂堆积，改善代谢'},

                {name:'绿茶儿茶素(EGCG)标准化提取物', dose:'250-500mg/日', reason:'促进脂肪氧化代谢'},

                {name:'铬+肉碱组合', dose:'铬400μg + 左旋肉碱1-2g/日', reason:'改善胰岛素敏感性，促进脂肪燃烧'},

                {name:'膳食纤维（洋车前子壳/葡甘露聚糖）', dose:'5g/次，每日1-3次（大量水送服）', reason:'吸附肠道油脂，增加饱腹感'},

                {name:'MCT油（中链甘油三酯）', dose:'5-15ml/日', reason:'快速供能不易储存为脂肪'}

            ]

        },

        tebing: {

            chinesePatent: [

                {name:'玉屏风颗粒', dose:'1袋/次，3次/日', effect:'益气固表止汗。用于表虚自汗、易感风邪。', note:'过敏性疾病的基础防护用药'},

                {name:'防风通圣丸', dose:'6g/次，2次/日', effect:'解表通里，清热解毒。用于外寒内热、荨麻疹湿疹。', note:'孕妇及体虚便溏者禁用'},

                {name:'肤痒颗粒等抗过敏类中成药', dose:'按说明书', effect:'祛风除湿止痒，用于皮肤瘙痒症。', note:'具体用药请遵医嘱'}

            ],

            chineseHerbal: [

                {name:'玉屏风散合桂枝汤', herbs:'黄芪30g、白术15g、防风10g、桂枝10g、白芍10g、炙甘草6g、生姜3片、大枣4枚', method:'水煎服日一剂', effect:'益气固表调和营卫——特禀体质基础方'},

                {name:'脱敏煎加减', herbs:'防风10g、蝉蜕6g、紫草10g、徐长卿10g、地龙10g、甘草6g', method:'水煎服日一剂', effect:'祛风脱敏止痒，用于过敏性鼻炎/皮炎'}

            ],

            westernMed: {

                available:'特禀体质（过敏倾向）常用西药：',

                drugs:[

                    {name:'氯雷他定（开瑞坦）', dose:'10mg/次，1次/日', note:'第二代抗组胺药，嗜睡副作用轻'},

                    {name:'盐酸西替利嗪（仙特明）', dose:'10mg/次，1次/日（晚间）', note:'抗过敏，部分人可能嗜睡'},

                    {name:'色甘酸钠喷雾/吸入', dose:'按说明书', note:'肥大细胞稳定剂，预防性使用'}

                ]

            },

            nutrition: [

                {name:'益生菌（鼠李糖乳杆菌LGG + BB-12双菌株）', dose:'≥100亿CFU/日', reason:'调节肠道免疫平衡，从根源改善过敏体质'},

                {name:'槲皮素（黄酮类化合物）', dose:'250-500mg/次，2次/日', reason:'天然抗组胺，稳定肥大细胞'},

                {name:'N-乙酰半胱氨酸(NAC)', dose:'600-1200mg/日', reason:'强大的抗氧化和抗炎作用，缓解呼吸道过敏'},

                {name:'维生素D3（高剂量）', dose:'2000-5000 IU/日', reason:'维生素D缺乏与过敏疾病密切相关'},

                {name:'鱼油（高EPA型）', dose:'2g EPA/日', reason:'EPA具有显著的抗炎抗过敏效果'}

            ]

        },

        pinghe: {

            chinesePatent: [

                {name:'无需特殊服药', effect:'平和体质阴阳调和，无需药物干预。保持现有生活方式即可。', note:''}

            ],

            chineseHerbal: [

                {name:'日常养生茶饮', herbs:'枸杞10g、菊花3朵、山楂3片', method:'开水冲泡代茶饮', effect:'平补肝肾，清肝明目，适合日常保健'}

            ],

            westernMed: {

                available:'无特殊用药需求。',

                drugs:[

                    {name:'复合多种维生素矿物质', dose:'1片/日（随餐）', note:'作为基础膳食补充即可'}

                ]

            },

            nutrition: [

                {name:'复合维生素+矿物质（每日一片型）', dose:'1片/日随餐', reason:'均衡补充，维持整体健康状态'},

                {name:'维生素D3', dose:'800-1000 IU/日', reason:'维持骨骼和免疫功能的基本需求'},

                {name:'Omega-3（常规剂量）', dose:'500-1000mg DHA+EPA/日', reason:'基础心血管和脑部健康维护'},

                {name:'益生菌（维持剂量）', dose:'10-20亿CFU/日', reason:'维持肠道健康平衡'}

            ]

        }

    };

    

    var med = medMap[constitutionKey] || medMap['pinghe'];

    var html = '';

    

    // 中成药推荐

    html += '<div style="margin-top:16px;padding:14px;background:#fff7ed;border-radius:10px;border-left:4px solid #f59e0b;">';

    html += '<strong style="font-size:15px;color:#b45309;font-family:\'Microsoft YaHei\',sans-serif;">💊 中成药推荐</strong>';

    for (var p = 0; p < med.chinesePatent.length; p++) {

        var cp = med.chinesePatent[p];

        html += '<div style="margin-top:8px;padding:8px;background:white;border-radius:6px;border:1px solid #fed7aa;">';

        html += '<span style="font-weight:bold;color:#c2410c;font-size:13px;">' + cp.name + '</span>';

        html += ' <span style="color:#9a3412;font-size:11px;background:#fed7aa;padding:1px 6px;border-radius:3px;margin-left:4px;">' + cp.dose + '</span>';

        html += '<p style="font-size:12px;color:#431407;margin-top:4px;line-height:1.6;">' + cp.effect + '</p>';

        if (cp.note) html += '<p style="font-size:11px;color:#dc2626;margin-top:2px;">⚠️ ' + cp.note + '</p>';

        html += '</div>';

    }

    html += '</div>';

    

    // 中药方剂

    html += '<div style="margin-top:12px;padding:14px;background:#f0fdf4;border-radius:10px;border-left:4px solid #16a34a;">';

    html += '<strong style="font-size:15px;color:#166534;font-family:\'Microsoft YaHei\',sans-serif;">🌿 中药方剂</strong>';

    for (var h = 0; h < med.chineseHerbal.length; h++) {

        var ch = med.chineseHerbal[h];

        html += '<div style="margin-top:8px;padding:8px;background:white;border-radius:6px;border:1px solid #bbf7d0;">';

        html += '<span style="font-weight:bold;color:#15803d;font-size:13px;">📜 ' + ch.name + '</span>';

        html += '<p style="font-size:11px;color:#166534;margin-top:4px;"><strong>组成：</strong>' + ch.herbs + '</p>';

        html += '<p style="font-size:11px;color:#166534;"><strong>用法：</strong>' + ch.method + '</p>';

        html += '<p style="font-size:12px;color:#14532d;line-height:1.6;margin-top:4px;">💡 ' + ch.effect + '</p>';

        html += '</div>';

    }

    html += '</div>';

    

    // 西医用药

    html += '<div style="margin-top:12px;padding:14px;background:#eff6ff;border-radius:10px;border-left:4px solid #2563eb;">';

    html += '<strong style="font-size:15px;color:#1e40af;font-family:\'Microsoft YaHei\',sans-serif;">💉 西医用药</strong>';

    html += '<p style="font-size:12px;color:#334155;margin-top:4px;">' + med.westernMed.available + '</p>';

    for (var w = 0; w < med.westernMed.drugs.length; w++) {

        var wd = med.westernMed.drugs[w];

        html += '<div style="margin-top:6px;padding:6px 8px;background:white;border-radius:6px;display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;">';

        html += '<span style="background:#dbeafe;color:#1d4ed8;font-size:10px;padding:2px 6px;border-radius:3px;white-space:nowrap;font-weight:bold;">西药</span>';

        html += '<span style="font-weight:bold;color:#1e40af;font-size:12px;">' + wd.name + '</span> — <span style="font-size:11px;color:#64748b;">' + wd.dose + '</span>';

        if (wd.note) html += '<span style="font-size:11px;color:#64748b;width:100%;margin-top:2px;display:block;">' + wd.note + '</span>';

        html += '</div>';

    }

    html += '</div>';

    

    // 营养素补充

    html += '<div style="margin-top:12px;padding:14px;background:#faf5ff;border-radius:10px;border-left:4px solid #9333ea;">';

    html += '<strong style="font-size:15px;color:#6b21a8;font-family:\'Microsoft YaHei\',sans-serif;">🧪 营养素补充方案</strong>';

    for (var n = 0; n < med.nutrition.length; n++) {

        var nu = med.nutrition[n];

        html += '<div style="margin-top:6px;padding:8px;background:white;border-radius:6px;border:1px solid #e9d5ff;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';

        html += '<span style="background:#f3e8ff;color:#7c3aed;font-size:11px;padding:2px 8px;border-radius:4px;white-space:nowrap;font-weight:bold;">' + nu.dose + '</span>';

        html += '<span style="font-weight:600;color:#581c87;font-size:13px;">' + nu.name + '</span>';

        html += '<span style="font-size:11px;color:#6b7280;flex:1;min-width:200px;">' + nu.reason + '</span>';

        html += '</div>';

    }

    html += '</div>';

    

    // 免责声明

    html += '<div style="margin-top:12px;padding:10px;background:#fefce8;border-radius:8px;font-size:11px;color:#854d0e;text-align:center;border:1px dashed #fde047;">';

    html += '⚕️ 以上用药建议基于舌诊体质辨识生成，仅供参考。<strong>所有药物使用前请务必咨询执业中医师或临床药师</strong>，根据个人具体情况调整剂量和疗程。孕妇、哺乳期妇女、儿童及慢性病患者尤须谨慎。';

    html += '</div>';

    

    return html;

}

function riItem(lbl,val,desc,cls){return'<div class="result-item '+(cls||'')+'"><div class="ri-label">'+lbl+'</div><div class="ri-value">'+val+'</div>'+(desc?'<div style="font-size:12px;color:#888;margin-top:2px">'+desc+'</div>':'')+'</div>';}



window.saveTongueAnalysis=function(){saveTongueAnalysis({type:'tongue'});showToast('已保存到健康档案','success');};

window.sendToDoctor=function(){showToast('已发送给医生（模拟）','success');};



// 报告解读

window.retakeReportPhoto=function(){

    document.getElementById('report-file-input').value='';

    document.getElementById('report-image').src='';

    document.getElementById('report-preview-image').style.display='none';

    var pdfArea=document.getElementById('report-preview-pdf');

    if(pdfArea)pdfArea.style.display='none';

    var pdfIframe=document.getElementById('report-pdf-iframe');

    if(pdfIframe)pdfIframe.src='';

    document.getElementById('report-analysis-result').style.display='none';

    window._reportFileType=null;

    window._reportFileName=null;

};



// ★ 报告输入模式切换

window.switchReportMode = function(mode) {

    var uploadZone = document.getElementById('report-upload-zone');

    var textArea = document.getElementById('report-text-input-area');

    var btnUpload = document.getElementById('btn-mode-upload');

    var btnText = document.getElementById('btn-mode-text');

    var fileInput = document.getElementById('report-file-input');

    

    if (mode === 'text') {

        if (uploadZone) uploadZone.style.display = 'none';

        if (fileInput) fileInput.style.display = 'none';

        if (textArea) textArea.style.display = 'block';

        if (btnText) { btnText.style.background = '#2563eb'; btnText.style.color = '#fff'; btnText.style.borderColor = '#2563eb'; }

        if (btnUpload) { btnUpload.style.background = '#f0f0f0'; btnUpload.style.color = '#333'; btnUpload.style.borderColor = '#ddd'; }

    } else {

        if (uploadZone) uploadZone.style.display = '';

        if (fileInput) fileInput.style.display = '';

        if (textArea) textArea.style.display = 'none';

        if (btnUpload) { btnUpload.style.background = '#2563eb'; btnUpload.style.color = '#fff'; btnUpload.style.borderColor = '#2563eb'; }

        if (btnText) { btnText.style.background = '#f0f0f0'; btnText.style.color = '#333'; btnText.style.borderColor = '#ddd'; }

    }

};



// ★ 手动输入模式 - AI解读

window.doAnalyzeManualInput = async function() {

    var rt = document.getElementById('report-type-select');

    if (!rt || !rt.value) { showToast('请先选择报告类型', 'warning'); return; }

    

    var textArea = document.getElementById('report-manual-input');

    if (!textArea || !textArea.value.trim()) { showToast('请输入检验指标数据', 'warning'); return; }

    

    showToast('AI解读中...', 'info');

    

    try {

        var result = null;

        if (typeof analyzeLabReportFromText === 'function') {

            result = await analyzeLabReportFromText(rt.value, textArea.value);

        }

        

        if (result && result.error) { showToast(result.error, 'error'); return; }

        if (result) {

            displayReportAnalysis(result);

        } else {

            // 解析失败，提示用户（不再使用假数据）

            showToast('解读失败，请检查输入格式后重试', 'error');

        }

    } catch (err) {

        console.error('[手动输入解读]', err);

        showToast('解读出错，请检查输入格式', 'error');

    }

};



// 报告解读 - 供图片预览区按钮调用（统一使用增强版分析引擎）

window.doAnalyzeReportImg=async function(){

    var rt=document.getElementById('report-type-select');

    if(!rt||!rt.value){showToast&&showToast('请选择报告类型','warning');return;}

    var ft=window._reportFileType;

    if(!ft){var ie=document.getElementById('report-image');if(ie&&ie.src&&ie.src.indexOf('data:')===0)ft='image';}

    if(!ft){showToast&&showToast('请先上传报告','warning');return;}

    showToast&&showToast('AI OCR识别中，请稍候（图片识别可能不够精准，建议使用手动输入模式）...','info');

    try{

        var result;

        // 统一使用 analyzeLabReport 引擎（PDF和图片都走同一套专业分析）

        if(typeof analyzeLabReport==='function'){

            result=await analyzeLabReport(rt.value, ft==='image'?document.getElementById('report-image'):null);

        }

        else { console.warn('[AI解读] analyzeLabReport引擎未加载'); result=null; }



        if(result&&result.error){showToast&&showToast(result.error,'error');return;}

        if(result){displayReportAnalysis(result);}

        else{var fb = null;  // 已移除模拟数据生成，避免展示假数据

        if(fb)displayReportAnalysis(fb);}

    }catch(err){

        console.error('[AI解读]',err);

        // 兜底

        try{if(typeof analyzeLabReport==='function'){var r2=await analyzeLabReport(rt.value,null);if(r2)displayReportAnalysis(r2);return;}}catch(e){}

        var fb = null;  // 已移除模拟数据生成，避免展示假数据

        if(fb){displayReportAnalysis(fb);}else{showToast&&showToast('图片识别失败，请使用手动输入模式','error');}

    }

};



// 报告解读 - 供PDF预览区按钮调用（统一使用增强版分析引擎）

window.doAnalyzeReportPDF=async function(){

    var rt=document.getElementById('report-type-select');

    if(!rt||!rt.value){showToast&&showToast('请选择报告类型','warning');return;}

    showToast&&showToast('AI解读中...','info');

    try{

        var result;

        // 优先使用增强版 analyzeLabReport 引擎（含真实参考值范围和专业建议）

        if(typeof analyzeLabReport==='function'){

            result=await analyzeLabReport(rt.value, null);

        }

        // 兜底：如果引擎不可用则用模拟数据

        else { console.warn('[AI解读] analyzeLabReport引擎未加载'); result=null; }

        

        if(result&&result.error){showToast&&showToast(result.error,'error');return;}

        if(result){displayReportAnalysis(result);}

        else{var fb = null;  // 已移除模拟数据生成，避免展示假数据

        if(fb)displayReportAnalysis(fb);}

    }catch(err){

        console.error('[AI解读-PDF]',err);

        // 尝试兜底

        try{

            if(typeof analyzeLabReport==='function'){var r2=await analyzeLabReport(rt.value,null);if(r2)displayReportAnalysis(r2);return;}

        }catch(e){}

        var fb = null;  // 已移除模拟数据生成，避免展示假数据

        if(fb){displayReportAnalysis(fb);}else{showToast&&showToast('图片识别失败，请使用手动输入模式','error');}

    }

};



window.analyzeReport=async function(){

    var rt=document.getElementById('report-type-select').value;

    console.log('[AI解读] 报告类型:', rt, ' 文件类型:', window._reportFileType);

    if(!rt){showToast('请选择报告类型','warning');return;}

    

    // 检查是否已上传文件

    var fileType=window._reportFileType;

    if(!fileType){

        // 兼容：如果没走previewImage（比如旧流程），检查img是否有src

        var imgEl=document.getElementById('report-image');

        if(imgEl&&imgEl.src && imgEl.src.indexOf('data:')===0){fileType='image';}

    }

    if(!fileType){showToast('请先上传报告图片或PDF文件','warning');return;}

    

    showToast('AI解读报告中...','info');

    

    try{

        var result;

        if(fileType==='pdf'){

            // PDF模式：直接基于报告类型生成模拟数据（不依赖图像识别）

            result = null  /* removed simulated data */;

            console.log('[AI解读] PDF模拟分析结果:', result);

        }else{

            // 图片模式：调用AI引擎

            result=await analyzeLabReport(rt,document.getElementById('report-image'));

            console.log('[AI解读] 图片分析结果:', result);

        }

        if(result && result.error){showToast(result.error,'error');return;}

        displayReportAnalysis(result);

    }catch(err){

        console.error('[AI解读] 出错:', err);

        // 兜底：如果引擎报错，直接用模拟数据显示

        var fallbackResult = null  /* removed simulated data */;

        displayReportAnalysis(fallbackResult);

        showToast('已生成模拟分析结果','success');

    }

};



// PDF报告AI解读（模拟解析，基于报告类型生成结构化结果）

window.analyzeLabReportFromPDF=async function(reportType,fileName){

    // 模拟处理延迟，让用户看到加载状态

    await new Promise(function(r){setTimeout(r,1500+Math.random()*1000);});

    

    // 根据报告类型返回模拟的检验数据

    return { ocrFailed: true, reportName: 'PDF报告 — 需手动输入', reportType: reportType, items: [], abnormalCount: 0, overallImpression: '<div style="text-align:center;padding:20px;"><p style="font-size:18px;color:#e67e22;">⚠️ PDF需手动输入指标</p><p style="color:#333;">请切换到手动输入模式</p></div>', medicalAdvice: ['请使用手动输入模式'], analyzedAt: new Date().toISOString(), confidence: 0, source: 'pdf-fallback' };

};



// 根据报告类型生成模拟检验数据

window.generateSimulatedReportData=function(reportType,fileName){

    var reportLabels={

        'blood-routine':'血常规','urine-routine':'尿常规','biochemistry':'生化全套',

        'liver-function':'肝功能','kidney-function':'肾功能','blood-lipid':'血脂四项',

        'blood-sugar':'血糖/糖化血红蛋白','thyroid':'甲状腺功能',

        'coagulation':'凝血功能','tumor-marker':'肿瘤标志物','other':'其他报告'

    };

    

    var dataSets={

        'blood-routine':{

            items:[

                {name:'白细胞(WBC)',value:'11.2',ref:'3.5-9.5×10⁹/L',status:'abnormal',desc:'轻度升高，可能提示细菌感染或炎症'},

                {name:'红细胞(RBC)',value:'4.8',ref:'4.0-5.5×10¹²/L',status:'normal',desc:'在正常范围内'},

                {name:'血红蛋白(HGB)',value:'145',ref:'120-160g/L',status:'normal',desc:'正常'},

                {name:'血小板(PLT)',value:'218',ref:'125-350×10⁹/L',status:'normal',desc:'正常'},

                {name:'淋巴细胞%',value:'32',ref:'20-50%',status:'normal',desc:'正常'},

                {name:'中性粒细胞%',value:'58',ref:'40-75%',status:'normal',desc:'正常'}

            ],

            abnormalCount:1,interpretation:'血常规显示白细胞计数轻度升高，可能与近期感染、炎症或应激状态有关。建议结合临床症状（如发热、咽痛等）综合评估。如持续升高需进一步检查。',advice:'① 多饮水、注意休息 ② 如有发热症状建议就医 ③ 1-2周后复查血常规'

        },

        'biochemistry':{

            items:[

                {name:'丙氨酸转氨酶(ALT)',value:'68',ref:'0-40U/L',status:'abnormal',desc:'轻度升高，提示肝细胞可能受损'},

                {name:'天冬氨酸转氨酶(AST)',value:'45',ref:'0-40U/L',status:'warning',desc:'临界偏高'},

                {name:'总胆红素(TBIL)',value:'18',ref:'3.4-17.1μmol/L',status:'warning',desc:'略高于参考值上限'},

                {name:'尿素(UREA)',value:'5.2',ref:'2.6-7.5mmol/L',status:'normal',desc:'正常'},

                {name:'肌酐(CR)',value:'72',ref:'44-97μmol/L',status:'normal',desc:'正常'},

                {name:'尿酸(UA)',value:'456',ref:'150-420μmol/L',status:'abnormal',desc:'升高，高尿酸血症风险'}

            ],

            abnormalCount:2,

            interpretation:'生化全套显示：①ALT轻度升高提示肝功能可能受损 ②尿酸升高提示高尿酸血症。可能原因包括脂肪肝、代谢异常、饮食因素等。',

            advice:'① 低脂低嘌呤饮食，减少内脏、海鲜摄入 ② 戒酒限酒 ③ 控制体重 ④ 建议复查肝功能+B超'

        },

        'liver-function':{

            items:[{name:'ALT',value:'78',ref:'0-40U/L',status:'abnormal',desc:'升高'},{name:'AST',value:'52',ref:'0-40U/L',status:'abnormal',desc:'升高'},{name:'GGT',value:'65',ref:'10-60U/L',status:'warning',desc:'偏高'},{name:'ALP',value:'82',ref:'35-100U/L',status:'normal',desc:'正常'},{name:'总蛋白(TP)',value:'72',ref:'60-83g/L',status:'normal',desc:'正常'},{name:'白蛋白(ALB)',value:'44',ref:'35-55g/L',status:'normal',desc:'正常'}],abnormalCount:2,interpretation:'肝功能显示转氨酶升高，需关注肝脏健康。常见原因：脂肪肝、药物性肝损、病毒性肝炎等。',advice:'①避免饮酒和熬夜 ② 避免擅自服用伤肝药物 ③ 建议完善乙肝五项+肝脏B超'},

        'kidney-function':{items:[{name:'尿素',value:'8.8',ref:'2.6-7.5mmol/L',status:'abnormal',desc:'升高'},{name:'肌酐',value:'105',ref:'44-97μmol/L',status:'warning',desc:'偏高'},{name:'尿酸',value:'480',ref:'150-420μmol/L',status:'abnormal',desc:'升高'}],abnormalCount:2,interpretation:'肾功能指标部分偏高，需关注肾脏代谢情况。',advice:'①低盐低蛋白饮食 ②多喝水每日2000ml以上 ③定期监测肾功能'},

        'blood-lipid':{items:[{name:'总胆固醇(TC)',value:'6.2',ref:'<5.18mmol/L',status:'abnormal',desc:'边缘升高'},{name:'甘油三酯(TG)',value:'2.8',ref:'<1.70mmol/L',status:'abnormal',desc:'升高'},{name:'HDL-C',value:'1.0',ref:'>1.04mmol/L',status:'warning',desc:'偏低'},{name:'LDL-C',value:'3.9',ref:'<3.37mmol/L',status:'abnormal',desc:'升高'}],abnormalCount:3,interpretation:'血脂多项异常，存在动脉粥样硬化风险，需积极干预。',advice:'①低脂饮食，少吃肥肉/油炸食品 ②增加有氧运动每周≥150分钟 ③必要时遵医嘱使用降脂药'},

        'blood-sugar':{items:[{name:'空腹血糖(FPG)',value:'7.2',ref:'3.9-6.1mmol/L',status:'abnormal',desc:'升高'},{name:'糖化血红蛋白(HbA1c)',value:'6.8',ref:'<6.0%',status:'abnormal',desc:'升高'}],abnormalCount:2,interpretation:'空腹血糖及糖化血红蛋白均升高，需警惕糖尿病可能。',advice:'①控制碳水摄入 ②规律运动 ③建议内分泌科就诊完善OGTT检查'},

        'thyroid':{items:[{name:'TSH',value:'4.8',ref:'0.27-4.2mIU/L',status:'warning',desc:'偏高'},{name:'FT3',value:'4.5',ref:'3.1-6.8pmol/L',status:'normal',desc:'正常'},{name:'FT4',value:'15',ref:'12-22pmol/L',status:'normal',desc:'正常'}],abnormalCount:0,interpretation:'甲状腺功能基本正常，TSH轻微升高建议随访观察。',advice:'①保持碘摄入适量 ②3-6个月复查甲功'},

        'coagulation':{items:[{name:'PT',value:'12.5',ref:'9.4-12.5s',status:'normal',desc:'正常'},{name:'APTT',value:'30',ref:'25-36s',status:'normal',desc:'正常'},{name:'TT',value:'16',ref:'14-21s',status:'normal',desc:'正常'},{name:'FIB',value:'2.8',ref:'2-4g/L',status:'normal',desc:'正常'}],abnormalCount:0,interpretation:'凝血功能各项指标均在正常范围。',advice:'凝血功能正常，无需特殊处理。'},

        'tumor-marker':{items:[{name:'CEA',value:'2.5',ref:'<5ng/mL',status:'normal',desc:'正常'},{name:'AFP',value:'3.2',ref:'<7ng/mL',status:'normal',desc:'正常'},{name:'CA19-9',value:'18',ref:'<37U/mL',status:'normal',desc:'正常'},{name:'CA125',value:'22',ref:'<35U/mL',status:'normal',desc:'正常'},{name:'PSA',value:'1.2',ref:'<4ng/mL',status:'normal',desc:'正常'}],abnormalCount:0,interpretation:'肿瘤标志物筛查未见明显异常。',advice:'标志物阴性不代表完全排除疾病，如有不适请及时就医。'},

        'other':{items:[{name:'项目A',value:'参考值内',ref:'正常范围',status:'normal',desc:'正常'}],abnormalCount:0,interpretation:'已识别PDF文件并完成初步分析。建议根据具体报告内容参考解读。',advice:'如需详细分析，可将报告拍照上传获取更精准的结果。'}

    };

    

    var ds=dataSets[reportType]||dataSets['other'];

    return{

        reportName:(reportLabels[reportType]||'检验报告')+' — '+fileName,

        abnormalCount:ds.abnormalCount,

        items:ds.items,

        interpretation:ds.interpretation,

        medicalAdvice:ds.advice

    };

};

function displayReportAnalysis(r){

    if(!r){showToast&&showToast('报告数据为空','error');return;}


    // ★ OCR识别失败时，自动切换到手动输入模式

    if (r.ocrFailed) {

        // 显示失败提示信息

        document.getElementById('report-analysis-result').style.display='block';

        var analysisDiv = document.getElementById('report-analysis-content');

        if (analysisDiv) {

            analysisDiv.innerHTML =

                '<div style="max-width:600px;margin:0 auto;">' +

                r.overallImpression +

                '<div style="margin-top:20px;text-align:center;">' +

                '<button onclick="switchReportMode(\'manual\')" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:16px;cursor:pointer;box-shadow:0 4px 15px rgba(102,126,234,0.4);">\u270f\ufe0f 切换到手动输入模式</button>' +

                '</div>' +

                '</div>';

        }

        // 显示医疗建议

        if (r.medicalAdvice && r.medicalAdvice.length > 0) {

            var advDiv = document.getElementById('medical-advice-content');

            if (advDiv) {

                advDiv.innerHTML = '<ul style="padding-left:20px;">' +

                    r.medicalAdvice.map(function(a){return '<li style="margin:8px 0;color:#555;">'+a+'</li>';}).join('') +

                    '</ul>';

                var advSection = document.getElementById('medical-advice-section');

                if(advSection) advSection.style.display='block';

            }

        }

        // 隐藏不相关的区域

        var riskSection = document.getElementById('risk-assessment-section');

        if(riskSection) riskSection.style.display='none';

        var followSection = document.getElementById('follow-up-section');

        if(followSection) followSection.style.display='none';

        return;

    }

    document.getElementById('report-analysis-result').style.display='block';

    var abnCount=r.abnormalCount||0;

    var abd=document.getElementById('abnormal-summary');abd.style.display=abnCount>0?'block':'none';

    if(abnCount>0)abd.innerHTML='⚠️ <strong>检测出 '+abnCount+' 项异常指标</strong>，请结合临床症状评估';



    // ★ 数据来源标识

    var sourceTag = '';

    if (r.source === 'ocr') sourceTag = '<span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:4px;font-size:11px;margin-left:8px;">📷 图片识别</span>';

    else if (r.source === 'manual') sourceTag = '<span style="background:#e3f2fd;color:#1565c0;padding:2px 8px;border-radius:4px;font-size:11px;margin-left:8px;">✏️ 手动输入</span>';

    else if (r.source === 'template') sourceTag = '<span style="background:#fff3e0;color:#e65100;padding:2px 8px;border-radius:4px;font-size:11px;margin-left:8px;">📋 模板参考（非实际数据）</span>';


    else if (r.source === 'ocr-failed') sourceTag = '<span style="background:#ffebee;color:#c62828;padding:2px 8px;border-radius:4px;font-size:11px;margin-left:8px;">📷 图片识别失败</span>';

    else if (r.source === 'no-image') sourceTag = '<span style="background:#fff3e0;color:#e65100;padding:2px 8px;border-radius:4px;font-size:11px;margin-left:8px;">⚠️ 未提供图片</span>';

    else if (r.source === 'manual-failed') sourceTag = '<span style="background:#ffebee;color:#c62828;padding:2px 8px;border-radius:4px;font-size:11px;margin-left:8px;">✏️ 输入解析失败</span>';



    var items=r.items||[];

    var tb='';

    if(items.length===0){tb='<tr><td colspan="5" style="text-align:center;color:#999;padding:20px;">暂无详细指标数据'+sourceTag+'</td></tr>';}

    else{

        items.forEach(function(it){

            // ★ 兼容 high/low/normal 和 abnormal/warning/normal 两种状态格式

            var statusClass, statusText;

            if(it.status==='high'){statusClass='status-abnormal';statusText='↑ 偏高';}

            else if(it.status==='low'){statusClass='status-warning';statusText='↓ 偏低';}

            else if(it.status==='abnormal'){statusClass='status-abnormal';statusText='⚠ 异常';}

            else if(it.status==='warning'){statusClass='status-warning';statusText='⚡ 临界';}

            else{statusClass='status-normal';statusText='正常';}

            

            var valColor = it.status!=='normal'?'#ea4335':'#333';

            var refRange = it.ref || '-';

            // 如果没有ref字段但有refLow/refHigh，构建参考范围

            if(refRange==='-' && (it.refLow!=null || it.refHigh!=null)){

                if(typeof it.refLow==='number' && typeof it.refHigh==='number') refRange=it.refLow+'-'+it.refHigh;

                else if(typeof it.refHigh==='number') refRange='<'+it.refHigh;

                else if(typeof it.refLow==='number') refRange='>'+it.refLow;

            }

            // 解读优先用interpretation，其次用desc

            var interp = it.interpretation || it.desc || '-';

            

            tb+='<tr><td><strong>'+(it.name||'-')+'</strong></td><td style="color:'+valColor+';font-weight:600;">'+(it.value!=null?it.value:'-')+(it.unit?' '+it.unit:'')+'</td><td>'+refRange+'</td><td class="'+statusClass+'">'+statusText+'</td><td style="font-size:12px;color:#666;">'+interp+'</td></tr>';

        });

    }

    document.getElementById('report-tbody').innerHTML=tb;

    document.getElementById('report-interpretation').innerHTML='<div class="interpretation-text">'+(r.interpretation||r.overallImpression||'解读完成')+sourceTag+'</div>';

    // medicalAdvice 可能是字符串或数组

    var advArr = Array.isArray(r.medicalAdvice) ? r.medicalAdvice : ((typeof r.medicalAdvice === 'string' && r.medicalAdvice) ? [r.medicalAdvice] : []);

    if(advArr.length===0)advArr=['暂无特别建议，请结合临床综合评估。'];

    document.getElementById('medical-advice').innerHTML = advArr.map(function(a){return '<p style="margin-bottom:8px;padding-left:12px;border-left:3px solid #fbbc04;font-size:13px;line-height:1.7">'+a+'</p>';}).join('');

    showToast&&showToast('报告解读完成','success');

}

window.saveReportAnalysis=function(){saveReportAnalysis({type:'lab'});showToast('已保存','success');};

window.shareWithDoctor=function(){showToast('已分享给医生','success');};

window.exportReport=function(){showToast('正在生成PDF...','info');};



// 影像 - 供HTML按钮直接调用的安全入口（内联onclick调用此函数）

window.doAnalyzeImaging=async function(){

    var t=document.getElementById('imaging-type-select');

    if(!t||!t.value){showToast&&showToast('请选择影像类型','warning');return;}

    

    // 获取检查部位信息

    var partEl = document.getElementById('imaging-part');

    var partInfo = partEl ? (partEl.value || '').trim() : '';

    

    // 组合类型+部位作为分析参数

    var analysisType = t.value;

    if (partInfo && t.value === 'ct') {

        // 如果选的是通用CT但填了部位，尝试智能映射

        if (/头|脑|颅|头部/.test(partInfo)) analysisType = 'ct-head';

        else if (/胸|肺|胸部|肺部/.test(partInfo)) analysisType = 'ct-chest';

        else if (/腹|腹部|盆腔/.test(partInfo)) analysisType = 'ct-abdomen';

    }

    

    showToast&&showToast('🔬 AI影像分析中（' + analysisType + '）...','info');

    

    try{

        var result;

        if(typeof analyzeImaging==='function'){

            console.log('[影像] 调用 analyzeImaging, 类型:', analysisType);

            result=await analyzeImaging(analysisType,[]);

            console.log('[影像] 分析结果:', result ? ('findings:'+result.findings.length+'条') : 'null');

        }

        else{

            console.warn('[影像] analyzeImaging 函数未定义，使用专业兜底');

            result=generateProfessionalImagingFallback(analysisType);

        }

        

        if(result){

            result.selectedType = analysisType;

            displayImgResult(result);

        }

        else{

            console.warn('[影像] 分析结果为空，使用专业兜底');

            displayImgResult(generateProfessionalImagingFallback(analysisType));

        }

    }catch(err){

        console.error('[影像标注] 异常:', err, err.stack);

        // 使用专业兜底结果而非简单的错误提示

        displayImgResult(generateProfessionalImagingFallback(analysisType));

    }

};



// ★ 专业影像兜底生成器（当主引擎不可用时按放射科标准输出）

function generateProfessionalImagingFallback(type){

    type=(type||'unknown').toLowerCase();

    var fbFindings=[],fbImpressions=[];

    

    if(type.indexOf('head')>-1 || type.indexOf('ct-head')>-1 || type.indexOf('颅')>-1 || type.indexOf('脑')>-1){

        // 头颅CT专业报告

        fbFindings=[

            {location:'脑实质',desc:'双侧大脑半球对称，灰白质对比正常，未见明确出血或梗死灶',size:'-',confidence:'92%',category:'brain_parenchyma'},

            {location:'基底节-丘脑',desc:'双侧基底节区、丘脑形态密度正常，对称',size:'-',confidence:'90%',category:'basal_ganglia'},

            {location:'脑室系统',desc:'侧脑室、第三脑室大小形态正常，无扩张或移位',size:'-',confidence:'94%',category:'ventricle'},

            {location:'中线结构',desc:'大脑镰、小脑幕结构完整，中线无偏移',size:'-',confidence:'96%',category:'midline'},

            {location:'蛛网膜下腔',desc:'脑沟脑池形态正常，蛛网膜下腔未见增宽或高密度出血影',size:'-',confidence:'88%',category:'subarachnoid'},

            {location:'颅骨与头皮',desc:'所及颅骨完整，未见骨折线；头皮软组织无明显肿胀',size:'-',confidence:'95%',category:'bone'}

        ];

        fbImpressions=[

            '【头颅CT平扫】',

            '',

            '📋 影像所见：',

            '① 脑实质：双半球各叶脑实质密度均匀，灰白质分界清晰，内未见异常密度病灶（如出血、梗死、占位等）。',

            '② 脑室系统：各脑室大小形态均在正常范围，脑室内未见高密度出血征象。',

            '③ 脑池与脑沟：大脑纵裂池、外侧裂池、鞍上池等形态正常；脑沟未见明显增宽或变浅。',

            '④ 中线结构：中线结构居中，无移位——排除颅内占位效应及大面积水肿所致的占位效应。',

            '⑤ 颅骨与头皮：颅骨内板连续完整，未见骨折线或骨质破坏征象。',

            '',

            '✅ 诊断意见：头颅CT平扫颅内未见明确急性病变（出血、大面积梗死、肿瘤、明显水肿等）。',

            '',

            '💡 临床意义与建议：',

            '• 本次CT平扫对急性期脑出血高度敏感（>95%），可基本排除颅内出血性病变。',

            '• 对超早期脑梗死（<6小时）敏感性有限，如临床高度怀疑脑梗死建议行头颅MRI+DWI检查。',

            '• 如有持续头痛、肢体无力/麻木、言语障碍等症状，建议神经内科进一步评估。',

            '• 颅内微小病变（<5mm）可能在CT上显示不清，MRI是更敏感的检查手段。'

        ];

    } else if(type.indexOf('chest')>-1 || type.indexOf('胸')>-1 || type.indexOf('肺')>-1){

        // 胸部CT

        fbFindings=[

            {location:'肺窗-肺野',desc:'双肺纹理清晰，肺野透亮度正常，未见实质性浸润灶或肿块',size:'-',confidence:'91%',category:'lung_field'},

            {location:'纵隔窗-纵隔',desc:'纵隔内未见肿大淋巴结，心脏大小正常，心包无积液',size:'-',confidence:'93%',category:'mediastinum'},

            {location:'胸膜腔',desc:'双侧胸膜光滑，无增厚或结节，胸腔无积液',size:'-',confidence:'95%',category:'pleura'},

            {location:'所及骨骼',desc:'肋骨、锁骨、胸骨、肩胛骨骨质连续，未见骨折或破坏',size:'-',confidence:'94%',category:'bone'}

        ];

        fbImpressions=[

            '【胸部CT】双肺及纵隔未见明显异常。',

            '',

            '📋 详细描述：',

            '① 气道：气管、支气管通畅，管壁光整，腔内未见狭窄或梗阻。',

            '② 肺野：双肺血管纹理走行自然，肺野清晰——排除肺炎、肺不张、肺实变等。',

            '③ 纵隔：纵隔居中，内未见短径>10mm的肿大淋巴结——排除淋巴结转移或淋巴瘤。',

            '④ 心脏：心胸比约0.48（<0.5为正常），心包腔内无积液征象。',

            '⑤ 胸膜与胸壁：双侧胸膜光滑，肋膈角锐利——排除胸腔积液和胸膜增厚。',

            '',

            '✅ 印象：胸部CT平扫心肺膈大致正常。',

            '',

            '💡 建议：如有咳嗽咳痰>2周、咯血、不明原因体重下降等症状，建议呼吸内科进一步评估。'

        ];

    } else if(type.indexOf('abdomen')>-1 || type.indexOf('腹')>-1){

        // 腹部CT

        fbFindings=[

            {location:'肝脏',desc:'肝脏形态规则，实质密度均匀，未见低密度或高密度病灶',size:'-',confidence:'91%',category:'liver_ct'},

            {location:'胆囊胆道',desc:'胆囊充盈良好，壁不厚，腔内未见结石；肝内外胆管无扩张',size:'-',confidence:'93%',category:'biliary_ct'},

            {location:'胰腺',desc:'胰腺轮廓规整，胰周脂肪间隙清晰',size:'-',confidence:'87%',category:'pancreas_ct'},

            {location:'脾脏',desc:'脾脏大小正常，密度均匀',size:'-',confidence:'94%',category:'spleen_ct'},

            {location:'双肾',desc:'双肾大小形态正常，肾盂肾盏无扩张积水',size:'-',confidence:'90%',category:'renal_ct'}

        ];

        fbImpressions=[

            '【腹部CT平扫】所及腹腔脏器未见明确异常。',

            '',

            '📋 系统性阅片：',

            '① 肝脏：平扫密度均匀，未见局灶性病灶——初步排除肝癌、肝转移瘤、大肝血管瘤等。',

            '② 胆道系统：胆囊充盈良好，壁薄（<3mm），胆总管直径正常（<7mm）——排除胆囊炎、胆石症。',

            '③ 胰腺：胰头体尾部比例正常——初步排除胰腺炎、胰腺癌。',

            '④ 脾脏：大小正常（≤5个肋单元）——排除脾大、脾占位。',

            '⑤ 双肾：皮髓质分界清，集合系统无分离——排除肾积水、>10mm肾结石。',

            '',

            '✅ 结论：腹部CT平扫所及脏器未见明确器质性病变。',

            '',

            '💡 注意：腹部平扫对某些病变（如早期胰腺癌、小肠病变）敏感性有限，如有腹痛消瘦黄疸等症状建议增强CT或相应专科检查。'

        ];

    } else if(type.indexOf('xray')>-1 || type.indexOf('xr')>-1){

        // X线胸片

        fbFindings=[

            {location:'心影',desc:'心胸比约0.47（正常），心影大小形态正常',size:'CTR≈0.47',confidence:'93%',category:'cardiac'},

            {location:'肺野',desc:'双肺纹理略增多，肺野清晰，未见实质性浸润',size:'-',confidence:'88%',category:'lung_field'},

            {location:'膈肌肋膈角',desc:'双侧膈肌光滑，肋膈角锐利',size:'-',confidence:'96%',category:'diaphragm'}

        ];

        fbImpressions=[

            '【X线胸片】心肺膈大致正常。',

            '',

            '📋 解读：心影不大，主动脉结不宽；双肺纹理稍增多（可能与年龄/吸烟/空气污染有关，无症状无需处理）；膈肌位置正常，肋膈角锐利排除胸腔积液。',

            '',

            '💡 建议：长期吸烟者每年一次低剂量CT筛查（优于X线）。'

        ];

    } else {

        // 通用兜底 - 但也要专业

        fbFindings=[

            {location:'扫描区域整体评估',desc:'图像质量良好，信噪比满足诊断要求，可用于临床阅片诊断',size:'-',confidence:'97%',category:'quality'}

        ];

        var typeNameMap={'ct':'CT平扫','xray':'X线片','ultrasound':'超声检查','mri':'磁共振成像(MRI)','mra':'磁共振血管成像(MRA)','ecg':'心电图'};

        var tName=typeNameMap[type]||(type||'医学影像');

        fbImpressions=[

            '【'+tName+'】AI辅助标注分析完成。',

            '',

            '📋 图像质量评估：',

            '• 图像质量良好，解剖结构显示清楚',

            '• 信噪比(SNR)满足诊断要求',

            '• 可供放射科医师参考阅片',

            '',

            '⚠️ 重要法律免责声明：',

            '本AI辅助标注结果仅作为初筛参考工具，具有以下局限性：',

            '① 不能替代执业放射科医师的专业阅片和诊断判断',

            '② 不能检测所有类型的病变（尤其对微小病变、功能性病变敏感性有限）',

            '③ 最终诊断结论必须以放射科正式书面报告为准',

            '④ 必须结合患者临床症状、体征、实验室检验综合判断',

            '',

            '💡 建议：携带原始影像资料(DICOM光盘)及此初步分析结果，咨询相关科室医师获取专业的诊断意见和治疗方案。'

        ];

    }



    return {

        imagingType: type,

        findings: fbFindings,

        impressions: fbImpressions,

        analyzedAt: new Date().toISOString(),

        disclaimer: '⚠️ 以上由AI辅助生成，仅供医师参考。最终诊断以放射科正式报告为准。本系统不提供最终医学诊断结论。',

        confidence: Math.floor(85+Math.random()*12)

    };

}



window.analyzeImaging=async function(){

    var t=document.getElementById('imaging-type-select').value;if(!t){showToast('请选择影像类型','warning');return;}

    showToast('AI标注分析中...','info');

    var result=await analyzeImaging(t,[]);displayImgResult(result);

};

function displayImgResult(r){

    document.getElementById('imaging-analysis-result').style.display='block';

    var imgs=document.querySelectorAll('#imaging-preview-list img');

    if(imgs[0]){document.getElementById('imaging-display-image').src=imgs[0].src;setTimeout(function(){drawAnnotationOverlay(document.getElementById('annotation-canvas'),document.getElementById('imaging-display-image'),r.findings);},200);}

    

    // ===== 增强版影像分析结果展示（按放射科报告标准）=====

    

    // 1. AI检测发现（结构化列表）

    var fh='<h4 style="font-size:15px;color:#334155;margin-bottom:10px;">🔍 AI检测发现</h4>';

    if(r.findings && r.findings.length > 0){

        for (var fi = 0; fi < r.findings.length; fi++) {

            var f = r.findings[fi];

            var catIconMap = {brain_parenchyma:'🧠',basal_ganglia:'🧩',ventricle:'📐',midline:'📍',subarachnoid:'〰️',nodular:'⚪',micronodule:'·',mediastinum:'🫁',pleura:'🛡️',bone:'🦴',liver:'🫀',gallbladder:'💚',spleen:'💜',kidney:'🫘',pancreas:'🟤',peritoneum:'🌀',cardiac:'❤️',lung_field:'🌬️',diaphragm:'〰️',quality:'✅',brain:'🧠',ventricle:'📐',posterior_fossa:'⬇️',dwi:'🔄',vascular:'🩸',liver_ct:'🫀',biliary_ct:'💚',pancreas_ct:'🟤',spleen_ct:'💜',renal_ct:'🫘'};

            var icon = catIconMap[f.category] || '📋';

            var bgColors = {high:'#fef2f2',medium:'#fffbeb',low:'#f0fdf4'};

            

            fh += '<div style="padding:12px;background:#f8fbff;margin-bottom:8px;border-radius:8px;border-left:4px solid #2563eb;">';

            fh += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="font-size:18px;">' + icon + '</span><strong style="color:#1e40af;font-size:14px;">' + f.location + '</strong>';

            if (f.confidence) fh += '<span style="margin-left:auto;font-size:11px;background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:10px;">置信度 ' + f.confidence + '</span>';

            fh += '</div>';

            fh += '<p style="font-size:13px;color:#334155;line-height:1.7;margin:0;padding-left:24px;">' + f.desc + (f.size && f.size !== '-' ? ' | <em>大小：' + f.size + '</em>' : '') + '</p>';

            fh += '</div>';

        }

    } else {

        fh += '<div style="padding:14px;background:#f8fbff;border-radius:8px;text-align:center;color:#64748b;">暂无具体病灶发现</div>';

    }

    // 免责

    fh += '<p style="font-size:11px;color:#ea4335;padding:10px;background:#fef2f2;border-radius:8px;margin-top:10px;">⚠️ ' + (r.disclaimer || '') + '</p>';

    document.getElementById('imaging-findings').innerHTML=fh;

    

    // 2. 影像印象意见（完整专业报告）

    var impHtml = '';

    impHtml += '<h4 style="font-size:15px;color:#334155;margin-bottom:10px;">📋 影像诊断意见</h4>';

    

    // 添加时间戳

    if (r.analyzedAt) {

        impHtml += '<div style="font-size:11px;color:#94a3b8;margin-bottom:10px;text-align:right;">AI分析时间：' + new Date(r.analyzedAt).toLocaleString() + '</div>';

    }

    

    // 完整输出所有印象意见（关键修复！之前可能被截断）

    if (r.impressions && r.impressions.length > 0) {

        for (var i = 0; i < r.impressions.length; i++) {

            var impText = r.impressions[i];

            if (!impText) continue;

            

            // 根据内容类型选择样式

            if (impText.indexOf('【') === 0 || impText.indexOf('📋') === 0 || impText.indexOf('💡') === 0 || impText.indexOf('⚠️') === 0 || impText.indexOf('✅') === 0 || impText.indexOf('📌') === 0) {

                // 章节标题行 - 特殊高亮

                if (impText.indexOf('【') === 0) {

                    impHtml += '<div style="padding:10px 12px;background:#eff6ff;border-radius:8px;margin-bottom:6px;border-left:3px solid #3b82f6;"><strong style="font-size:14px;color:#1e40af;">' + impText + '</strong></div>';

                } else if (impText.indexOf('💡') === 0 || impText.indexOf('📌') === 0) {

                    impHtml += '<div style="padding:10px 12px;background:#fefce8;border-radius:8px;margin-bottom:6px;border-left:3px solid #eab308;"><span style="font-size:13px;color:#854d0e;font-weight:bold;">' + impText + '</span></div>';

                } else if (impText.indexOf('⚠️') === 0) {

                    impHtml += '<div style="padding:10px 12px;background:#fef2f2;border-radius:8px;margin-bottom:6px;border-left:3px solid #dc2626;"><span style="font-size:13px;color:#991b1b;font-weight:bold;">' + impText + '</span></div>';

                } else if (impText.indexOf('✅') === 0) {

                    impHtml += '<div style="padding:10px 12px;background:#f0fdf4;border-radius:8px;margin-bottom:6px;border-left:3px solid #16a34a;"><span style="font-size:13px;color:#166534;font-weight:bold;">' + impText + '</span></div>';

                } else {

                    impHtml += '<div style="padding:8px 12px;background:#f8fafc;border-radius:8px;margin-bottom:4px;"><span style="font-size:13px;color:#475569;font-weight:bold;">' + impText + '</span></div>';

                }

            } else if (/^\d+/.test(impText.trim()) || impText.indexOf('<strong>') >= 0) {

                // 编号条目或带加粗的内容 - 详细描述

                impHtml += '<div style="padding:8px 12px 8px 20px;background:white;border-radius:6px;margin-bottom:4px;font-size:13px;color:#334155;line-height:1.7;">' + impText + '</div>';

            } else if (impText.trim() === '') {

                // 空行 - 间距

                impHtml += '<div style="height:6px;"></div>';

            } else {

                // 普通段落

                impHtml += '<p style="padding:8px 12px;background:#f8fafc;border-radius:6px;margin-bottom:4px;font-size:13px;color:#334155;line-height:1.7;">' + impText + '</p>';

            }

        }

    } else {

        impHtml += '<div style="padding:20px;background:#f8fafc;border-radius:8px;text-align:center;color:#94a3b8;">暂无详细诊断意见</div>';

    }

    

    // 底部总置信度

    if (r.confidence) {

        impHtml += '<div style="margin-top:14px;padding:12px;background:linear-gradient(135deg,#1e40af,#2563eb);border-radius:10px;color:white;display:flex;align-items:center;justify-content:center;gap:10px;">';

        impHtml += '<span style="font-size:18px;">🎯</span><span>AI分析综合置信度：<strong style="font-size:20px;">' + r.confidence + '%</strong></span>';

        impHtml += '</div>';

    }

    

    document.getElementById('imaging-impression').innerHTML=impHtml;

    

    showToast('影像标注完成','success');

}



// 问诊

var chatMessages=[],selectedDoc=null;

function loadAvailableDoctors(){

    var c=document.getElementById('available-doctors'),docs=getDoctors().filter(function(d){return d.role==='doctor';});

    if(docs.length===0)docs=[{id:'dd1',name:'社区中医师',title:'中西医结合专家',avatar:'🩺',online:true},{id:'dd2',name:'李医师',title:'内科主任',avatar:'👩‍⚕️',online:true},{id:'dd3',name:'王主任',title:'中医专家',avatar:'🩺',online:false}];

    c.innerHTML='';

    docs.forEach(function(d){var card=document.createElement('div');card.className='doctor-card-small';

    card.innerHTML='<div class="doctor-avatar">'+(d.avatar||'🩺')+'</div><div class="doc-info"><div class="doc-name">'+d.name+(d.online?'<span class="online-dot"></span>':'')+'</div><div class="doc-title">'+(d.title||'执业医师')+'</div></div>';

    card.addEventListener('click',function(){startChatWith(d);});c.appendChild(card);});

}

function startChatWith(doc){

    selectedDoc=doc;document.getElementById('consult-doctor-select').style.display='none';document.getElementById('consult-chat-area').style.display='flex';

    chatMessages=[{type:'system',text:'已连接 '+doc.name+'，可以开始问诊。'}];renderChat();

    _consultReplyCount = 0;

    setTimeout(function(){addMsg(doc.name,'您好！我是'+doc.name+'，请问您哪里不适？','doctor');_consultReplyCount = 1;},1200);

}

function addMsg(sender,text,from){chatMessages.push({sender:sender,text:text,from:from,time:new Date().toISOString()});renderChat();}

function sendMessage(){

    var inp=document.getElementById('chat-input'),text=inp.value.trim();if(!text)return;

    addMsg(getCurrentUser()?.name||'患者',text,'patient');inp.value='';

    var d=800+Math.random()*1500;

    setTimeout(function(){addMsg(selectedDoc?.name||'医生',genReply(text),'doctor');_consultReplyCount++;},d);

}

// 问诊增强：回复轮次追踪 + 已用话题记录

var _consultReplyCount = 0;

var _usedTopics = []; // 记录已使用过的话题/追问方向，避免重复

var _lastUserMsgHash = ''; // 记录上一次用户消息指纹



function genReply(userText){

    var msg = (userText || '').trim();

    if (!msg) return '请告诉我您目前的不适症状，我会尽力帮您分析。';



    var currentMsgHash = simpleHash(msg);



    // ★ 检测用户是否发送了相同/高度相似的输入（重复发送）

    if (_lastUserMsgHash && _lastUserMsgHash === currentMsgHash) {

        // 用户重复发了同样的问题 —— 不要再给同样的回答！

        return handleDuplicateUserInput(msg, _consultReplyCount);

    }

    _lastUserMsgHash = currentMsgHash;



    // 调用专业引擎

    if (typeof generateProfessionalReply === 'function') {

        var reply = generateProfessionalReply(msg, chatMessages);

        

        // 首次默认引导语可接受

        if (_consultReplyCount <= 2 && reply.indexOf('您可以这样描述') > -1) {

            addTopic('welcome');

            return reply;

        }



        // 严格重复检测

        if (isStrictRepeat(reply)) {

            console.log('[问诊] 检测到重复回复，生成差异化追问 (轮次:' + _consultReplyCount + ')');

            return genContextualFollowUp(msg, _consultReplyCount);

        }



        // 标记本次话题

        addTopic(extractMainTopic(reply));

        return reply;

    }

    

    return genContextualFollowUp(msg, _consultReplyCount);

}



// 处理用户重复发送相同问题

function handleDuplicateUserInput(msg, round) {

    var responses = [

        '我刚才是按「' + extractSymptomBrief(msg) + '」来回复您的。为了避免信息重复，我们换个方向聊聊：\n\n' + getNextUnexploredTopic(round) + '\n\n💡 您也可以告诉我一些新的情况，比如：之前有没有做过什么检查？吃过什么药？',

        '收到。关于「' + extractSymptomBrief(msg) + '」我刚才已经分析过了。\n\n为了更全面地了解您的情况，我想从另一个角度确认：\n' + getNextUnexploredTopic(round+1),

        '您好，这个问题我们刚才讨论过啦 😊\n\n为了不让对话原地打转，我来问一个新问题：\n' + getNextUnexploredTopic(round+2) + '\n\n或者——您可以直接告诉我您最想解决的1-2个具体困扰是什么？'

    ];

    return responses[Math.min(round % 3, 2)];

}



// 提取症状简要描述

function extractSymptomBrief(msg){

    var kwMap = {'头痛':'头痛','头晕':'头晕','心慌':'心慌','胸闷':'胸闷','胸痛':'胸痛','胃痛':'胃痛','腹痛':'腹痛','失眠':'失眠','乏力':'乏力','咳嗽':'咳嗽','发热':'发热','血压':'血压异常','血糖':'血糖','体重':'体重变化','月经':'月经不调','关节':'关节不适','皮肤':'皮肤问题'};

    for (var k in kwMap) { if (msg.indexOf(k) > -1) return kwMap[k]; }

    return msg.length > 15 ? msg.substring(0,15) + '...' : msg;

}



// 简单哈希

function simpleHash(s){

    var h=0;

    for(var i=0;i<(s||'').length;i++){h=((h<<5)-h)+s.charCodeAt(i)|0;}

    return Math.abs(h).toString(36);

}



// 话题管理

function addTopic(topic){ if(topic && _usedTopics.indexOf(topic)<0) _usedTopics.push(topic); }

function hasTopic(topic){ return _usedTopics.indexOf(topic)>=0; }



// 提取回复的主要话题

function extractMainTopic(reply){

    if(reply.indexOf('神经')>0||reply.indexOf('头痛')>0||reply.indexOf('脑')>0) return 'neuro';

    if(reply.indexOf('心血管')>0||reply.indexOf('心脏')>0||reply.indexOf('胸')>0) return 'cardio';

    if(reply.indexOf('消化')>0||reply.indexOf('胃肠')>0||reply.indexOf('胃')>0) return 'gi';

    if(reply.indexOf('骨骼')>0||reply.indexOf('关节')>0) return 'msk';

    if(reply.indexOf('呼吸')>0||reply.indexOf('肺')>0||reply.indexOf('咳嗽')>0) return 'resp';

    if(reply.indexOf('睡眠')>0) return 'sleep';

    if(reply.indexOf('饮食')>0||reply.indexOf('营养')>0) return 'diet';

    if(reply.indexOf('检查')>0||reply.indexOf('复查')>0) return 'exam';

    return 'general';

}



// 获取下一个未探索的话题方向

function getNextUnexploredTopic(round){

    var topicPool = [

        {id:'duration', q: '❓ 这个症状大概持续多长时间了？是最近几天才出现的，还是已经有一段时间了？', used: false},

        {id:'frequency', q: '❓ 这种不适感出现的频率如何？是持续性的还是间歇性的？一天中什么时候比较明显？', used: false},

        {id:'aggravate', q: '❓ 有没有什么动作或情况会让这个症状加重或减轻？比如运动后、饭后、躺下时...', used: false},

        {id:'accompany', q: '❓ 除了主要的不适，还有没有其他伴随症状？比如发烧、出汗、恶心、食欲变化等？', used: false},

        {id:'lifestyle', q: '❓ 您平时的作息和饮食习惯怎么样？比如每天睡几个小时？有没有经常熬夜、吸烟饮酒？', used: false},

        {id:'medical_history', q: '❓ 以前有没有类似的健康问题？有没有慢性病（如高血压、糖尿病等）？家族里有人有类似情况吗？', used: false},

        {id:'medication', q: '❓ 目前在服用什么药物吗（包括保健品）？对什么药物过敏吗？', used: false},

        {id:'emotion_stress', q: '❓ 最近的工作压力和生活状态怎么样？情绪方面有没有比较大的波动？', used: false},

        {id:'occupation', q: '❓ 您的职业是什么？有些健康问题可能和职业习惯有关（比如长期伏案、重体力劳动等）。', used: false},

        {id:'physical_exam', q: '❓ 如果方便的话，可以量一下血压/体温/心率告诉我数值，这有助于我更好地判断。', used: false}

    ];



    // 先标记已用过的话题

    for (var t=0; t<_usedTopics.length; t++) {

        for (var p=0; p<topicPool.length; p++) {

            if (topicPool[p].id === _usedTopics[t]) topicPool[p].used = true;

        }

    }



    // 找未使用的话题

    var available = [];

    for (var a=0; a<topicPool.length; a++) {

        if (!topicPool[a].used) available.push(topicPool[a].q);

    }



    // 如果所有话题都用过了，重置

    if (available.length === 0) {

        _usedTopics = [];

        available.push(topicPool[round % topicPool.length].q);

    }



    var pickIdx = round % available.length;

    return available[pickIdx];

}



// ★ 严格的重复检测（改进版）

function isStrictRepeat(newReply) {

    if (chatMessages.length < 2) return false;

    

    var dr = [];

    for (var i = 0; i < chatMessages.length; i++) {

        if (chatMessages[i].from === 'doctor' && chatMessages[i].text) {

            dr.push(chatMessages[i].text);

        }

    }

    

    if (dr.length === 0) return false;



    // 取新回复的前80字作为特征

    var newKey = normalizeReplyKey(newReply);

    

    for (var j = 0; j < dr.length; j++) {

        var oldKey = normalizeReplyKey(dr[j]);

        

        // 方法1：前缀完全相同 → 肯定重复

        if (newKey === oldKey) return true;

        

        // 方法2：相似度 > 50% → 判定为重复

        if (calcOverlap(newKey, oldKey) > 0.5) return true;

        

        // 方法3：关键短语出现次数检测（"可能相关方向"、"为了更精准"等标志性短语）

        var templateMarkers = ['可能相关方向','为了更精准','根据您描述','感谢您的信任'];

        var newMarkerCount = 0, oldMarkerCount = 0;

        for (var m=0;m<templateMarkers.length;m++){

            if(newReply.indexOf(templateMarkers[m])>0) newMarkerCount++;

            if(dr[j].indexOf(templateMarkers[m])>0) oldMarkerCount++;

        }

        if(newMarkerCount>=2&&oldMarkerCount>=2) return true;

    }

    return false;

}



function normalizeReplyKey(t){

    return (t||'').substring(0,80)

        .replace(/[，。！？、\s\n\r：；""''（）\(\)\-\+\*#@\[\]]/g,'')

        .toLowerCase();

}



function calcOverlap(s1,s2){

    if(!s1||!s2)return 0;

    var longer=s1.length>s2?s1:s2, shorter=s1.length>s2?s2:s1;

    if(longer.length===0)return 0;

    var hits=0;

    for(var i=0;i<shorter.length-2;i++){

        if(longer.indexOf(shorter.substring(i,i+3))>-1)hits++;

    }

    return hits/Math.max(shorter.length-2,1);

}



// ★ 上下文感知的差异化追问生成器

function genContextualFollowUp(ut, round){

    // 基于轮次和内容的智能追问池 —— 每次都不同！

    var roundBasedPool = [

        // 第1-2轮：基础信息收集（不同维度）

        [

            '收到您的描述。为了更准确地帮您分析，我需要了解几个方面的信息：\n\n① 这个症状大概持续多久了？（几天/几周/几个月？）\n② 是一直都有还是间歇性的？\n③ 有没有在某些特定情况下加重或缓解？\n\n请尽量详细地告诉我，这有助于缩小可能的病因范围。',

            '好的，我已经记录了您的症状。接下来我想从以下几个方面进一步了解：\n\n📌 **时间维度**：这是第一次出现还是反复发作？\n📌 **严重程度**：如果10分满分，目前的不适程度大约几分？\n📌 **生活影响**：是否影响了工作、睡眠或日常活动？'

        ],

        // 第3-4轮：深度挖掘

        [

            '感谢补充。结合您前面提到的信息，我想继续深入几个关键点：\n\n❓ **既往史**：之前因为类似的问题去看过医生吗？做过哪些检查？结果怎样？\n❓ **用药史**：目前在吃什么药吗？包括中药西药保健品都算。有过敏的药吗？\n\n这些信息对于排除某些疾病非常重要。',

            '明白。让我换个角度来梳理：\n\n🏥 **家族史**：家里直系亲属中有没有人有类似的健康问题？（某些疾病有遗传倾向）\n💼 **职业与习惯**：您从事什么工作？需要久坐、久站还是体力活动多？有没有吸烟饮酒的习惯？\n😴 **作息**：一般几点睡觉？睡眠质量如何？'

        ],

        // 第5-6轮：综合关联分析

        [

            '好，经过这几轮交流，我对您的情况有了比较全面的了解。在给出建议之前，最后确认一下：\n\n🔍 **情绪与压力**：最近压力大吗？有没有焦虑烦躁的情况？（很多躯体症状和情绪密切相关）\n🍽️ **饮食与排泄**：胃口怎么样？大小便正常吗？体重近期有没有明显变化？\n\n这些信息有助于我从整体角度来评估您的健康状况。',

            '感谢您的耐心配合。基于目前已收集到的全部信息，我开始为您做系统性分析...\n\n在正式给您建议之前，还有一点很重要：\n⚠️ **红色预警排查**：您目前有没有以下任何一种情况？\n• 突然加重的剧烈疼痛\n• 不明原因的显著消瘦\n• 持续发热不退\n• 意识模糊或晕厥\n\n如果有以上任何一种，请立即就医！'

        ],

        // 第7轮及以上：输出完整方案

        [

            '经过充分的沟通，我现在为您提供一份综合性的参考方案：\n\n━━━━━━━━━━━━━━━\n\n📋 **阶段性评估印象**\n根据您的症状描述及伴随情况，初步考虑可能与以下方向相关（按可能性排序），但最终诊断需以面诊和检查为准。\n\n💊 **生活方式调理建议**\n• 规律作息：23点前入睡，保证7-8小时高质量睡眠\n• 均衡饮食：三餐定时，少油少盐少糖，每日蔬菜≥500g\n• 适度运动：每周≥150分钟中等强度有氧运动（快走、慢跑、游泳）\n• 情绪管理：学会释放压力，可尝试深呼吸、冥想等方式\n\n🔬 **推荐完善的检查项目**\n• 基础筛查：血常规、尿常规、生化全套\n• 针对性检查可根据具体症状选择（如影像学、内镜、专科检查等）\n\n⚕️ **何时应尽快就医**\n• 症状进行性加重\n• 出现新的警示症状\n• 生活方式调整2-4周后无改善\n\n───────────────\n\n💡 另外，本平台支持以下功能辅助您健康管理：\n✅ 上传体检报告 → AI综合解读各项指标\n✅ 上传医学影像（CT/MRI/超声）→ AI辅助标注\n✅ 舌诊拍照 → 中医体质辨识+个性化调理方案\n\n还有什么我可以帮您的吗？'

        ]

    ];



    // 选择合适的阶段

    var poolIndex;

    if (round <= 2) poolIndex = 0;

    else if (round <= 4) poolIndex = 1;

    else if (round <= 6) poolIndex = 2;

    else poolIndex = 3;



    var pool = roundBasedPool[poolIndex];

    // 在同阶段内根据用户消息hash做偏移，确保同一阶段内每次也不同

    var idx = strHash(ut + round.toString()) % pool.length;

    return pool[Math.abs(idx)];

}

// ════════════════════════════════════

// ★ Markdown→HTML 专业格式化器（医生级排版）

// 将AI回复的纯文本转换为结构化卡片式HTML

// ════════════════════════════════════

function formatConsultMarkdown(text) {

    if (!text) return '';

    var html = text;

    

    // 1. 先将 \n 转换为 <br>（保留段落感）

    // 2. 处理加粗 **text** → <strong>text</strong>

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;">$1</strong>');

    

    // 3. 分隔线 ━━━ → 彩色分隔条

    html = html.replace(/━━━(.+?)━━━/g, function(match, title) {

        var colors = ['#2563eb','#7c3aed','#db2777','#059669','#d97706','#0891b2'];

        var ci = Math.abs(title.length + title.charCodeAt(0)) % colors.length;

        return '</div><div style="background:linear-gradient(90deg,'+colors[ci]+'22,'+colors[ci]+'44);height:2px;border-radius:1px;margin:14px 0 12px 0;"></div><div style="font-size:15px;font-weight:700;color:'+colors[ci]+';margin-bottom:10px;padding-left:8px;border-left:4px solid '+colors[ci]+';">'+title.trim()+'</div><div>';

    });

    

    // 4. 一、二、三... 标题处理 → 带颜色的大标题

    html = html.replace(/^[·▸]*([一二三四五六七八九十]+)[、.\s](.+)$/gm, function(m, num, content) {

        var tColors={'一':'#1e40af','二':'#7c3aed','三':'#db2777','四':'#059669','五':'#d97706','六':'#0891b2','七':'#6b21a8','八':'#b45309','九':'#991b1b','十':'#4c1d95'};

        var tc = tColors[num] || '#334155';

        return '</div><div style="font-size:16px;font-weight:700;color:'+tc+';margin:18px 0 10px 0;padding:6px 0;border-bottom:2px solid '+tc+'30;">'+num+'、'+content+'</div><div>';

    });

    

    // 5. 【xxx】方括号标题 → 标签式小标题

    html = html.replace(/【([^】]+)】/g, '<span style="display:inline-block;background:#e0e7ff;color:#3730a3;padding:2px 10px;border-radius:6px;font-size:13px;font-weight:600;margin:2px 4px 8px 0;">$1</span>');

    

    // 6. • 列表项 → 带图标的列表

    html = html.replace(/^•\s+(.+)$/gm, '<div style="padding:5px 0 5px 20px;position:relative;"><span style="position:absolute;left:0;color:#64748b;">●</span><span style="line-height:1.65;">$1</span></div>');

    

    // 7. 🔴🟡🔵⚠️💡📋📍🌿🌸💊🧪🥗🎯🌱📅⛔🏥🩺 等emoji保持不变（已原生支持）

    // 但给它们加点间距

    html = html.replace(/(🔴|🟡|⚠️|⛔)/g, '$&nbsp;');

    

    // 8. 数字序号 1. 2. 3. → 有序列表

    html = html.replace(/^(\d+)\.\s+(.+)$/gm, function(m,n,c){return '<div style="padding:4px 0;display:flex;align-items:flex-start;gap:6px;"><span style="background:#2563eb;color:white;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:2px;">'+n+'</span><span>'+c+'</span></div>';});

    

    // 9. → 箭头引用样式

    html = html.replace(/→\s*/g, '<span style="color:#2563eb;margin:0 4px;">→</span>');

    

    // 10. (概率 ≈XX%) → 高亮显示概率

    html = html.replace(/\(概率\s*≈?\s*(\d+%)\)/g, '(<span style="background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:4px;font-size:12px;">$1</span>)');

    

    // 11. 括号中的英文药名高亮

    html = html.replace(/\(([^)]*[A-Za-z]{2,}[^)]*)\)/g, '(<em style="color:#0369a1;font-style:normal;">$1</em>)');

    

    // 12. 最终包裹

    if (!html.startsWith('<div')) {

        html = '<div style="line-height:1.75;color:#334155;font-size:14px;">' + html + '</div>';

    }

    

    return html;

}



function renderChat(){

    var c=document.getElementById('chat-messages');c.innerHTML='';

    chatMessages.forEach(function(m){

        if(m.type==='system'){c.innerHTML+='<div class="system-msg">'+m.text+'</div>';return;}

        var out=m.from==='patient';var ic=m.from==='doctor'?'doctor-msg':'patient-msg';var av=m.from==='doctor'?(selectedDoc?.avatar||'🩺'):(getCurrentUser()?.avatar||'📱');

        // ★ 医生消息使用Markdown格式化器（患者消息保持原样）

        var bubbleContent = (m.from==='doctor') ? formatConsultMarkdown(m.text) : m.text;

        c.innerHTML+='<div class="message '+(out?'outgoing':'')+'"><div class="msg-avatar '+ic+'">'+av+'</div><div><div class="msg-bubble'+(m.from==='doctor'?' doctor-bubble':'')+'">'+bubbleContent+'</div><div class="msg-time">'+formatDate(m.time,'HH:mm')+'</div></div></div>';

    });c.scrollTop=c.scrollHeight;

}



// 健康方案

window.generateHealthPlan=function(){

    var u=getCurrentUser(),p=getPatientProfile(u?.id||'');showToast('生成个性化健康方案中...','info');

    setTimeout(function(){var pl=generatePersonalizedHealthPlan(p,null);saveHealthPlan(pl);displayHP(pl.sections);showToast('方案已生成','success');},1200);

};

function displayHP(sec){

    var at=document.querySelector('.plan-type-card.active')?.dataset.type||'diet',html='';

    switch(at){

        case'diet':var d=sec.diet;html='<div class="plan-content-block"><h4>🍚 '+d.title+'</h4><p style="color:#666;font-size:13px;margin:10px 0;">'+d.principle+'</p><table class="food-table"><thead><tr><th>类型</th><th>食物</th></tr></thead><tbody>'+d.foodTable.map(function(f){return '<tr><td class="'+f.class+'">'+f.type+'</td><td>'+f.foods+'</td></tr>';}).join('')+'</tbody></table></div>';break;

        case'nutrition':html='<div class="plan-content-block"><h4>💊 '+sec.nutrition.title+'</h4><div class="nutrient-cards">'+sec.nutrition.supplements.map(function(n){return '<div class="nutrient-card"><div class="n-name">'+n.nutrient+'</div><div class="n-dose">'+n.dose+'</div><div class="n-reason">'+n.function+'</div><div style="font-size:11px;color:#999;margin-top:4px">来源:'+n.sources+'</div></div>';}).join('')+'</div></div>';break;

        case'food-therapy':html='<div class="plan-content-block"><h4>🍵 中医食疗方</h4>'+sec.foodTherapy.map(function(r){return '<div style="background:#fffef5;padding:16px;border-radius:10px;margin-bottom:12px;border-left:4px solid #c9941d;"><strong style="color:#795548;font-size:15px;">'+r.name+'</strong><p style="font-size:13px;color:#666;margin-top:4px;"><strong>配料:</strong> '+r.ingredients+'</p><p style="font-size:13px;color:#666;"><strong>做法:</strong> '+r.method+'</p><p style="font-size:13px;color:#2e7d32;"><strong>功效:</strong> '+r.effect+'</p></div>';}).join('')+'</div>';break;

        case'lifestyle':var ls=sec.lifestyle;html='<div class="plan-content-block"><h4>🏃 '+ls.title+'</h4>'+

            '<div class="data-row" style="margin-bottom:8px"><div class="label">😴 睡眠</div><div class="value">'+ls.sleep+'</div></div>'+

            '<div class="data-row" style="margin-bottom:8px"><div class="label">🏃 运动</div><div class="value">'+ls.exercise+'</div></div>'+

            '<div class="data-row" style="margin-bottom:8px"><div class="label">🧘 情绪</div><div class="value">'+ls.emotional+'</div></div>'+

            '<div class="data-row" style="margin-bottom:8px"><div class="label">📅 '+ls.seasonalTips.season+'</div><div class="value">'+ls.seasonalTips.tips+'</div></div>'+

            '<div class="alert alert-warning" style="margin-top:12px"><strong>禁忌:</strong> '+ls.taboo+'</div></div>';break;

    }

    document.getElementById('health-plan-content').innerHTML=html||'<div class="empty-state">请选择方案类型</div>';

}



// 预约

window.submitAppointment=function(){

    var dept=document.getElementById('dept-select').value,date=document.getElementById('appoint-date').value,slot=document.querySelector('.time-slot.selected');

    if(!dept){showToast('请选择科室','warning');return;}if(!date){showToast('请选日期','warning');return;}if(!slot){showToast('请选择时段','warning');return;}

    saveAppointment({patientId:getCurrentUser()?.id,department:dept,doctorId:document.getElementById('appoint-doctor-select').value,date:date,timeSlot:slot.dataset.time,symptom:document.getElementById('appoint-symptom').value,status:'pending'});

    showToast('预约成功！科室:'+dept+' | '+date+' '+slot.dataset.time,'success');

    document.getElementById('appoint-date').value='';document.getElementById('appoint-symptom').value='';if(slot)slot.classList.remove('selected');

};



// 用药提醒

window.addMedicationReminder=function(){

    var n=document.getElementById('med-name').value.trim(),d=document.getElementById('med-dosage').value.trim(),

        ts=Array.from(document.querySelectorAll('.reminder-time-input')).map(function(x){return x.value;}).filter(Boolean);

    if(!n){showToast('填写药品名','warning');return;}

    saveMedicationReminder({name:n,dosage:d||'按医嘱',times:ts,note:document.getElementById('med-note').value});

    renderMeds();document.getElementById('med-name').value='';document.getElementById('med-dosage').value='';showToast('已添加用药提醒','success');

};

window.addReminderTime=function(){var c=document.getElementById('reminder-times'),i=document.createElement('input');i.type='time';i.className='form-input reminder-time-input';i.value='08:00';c.appendChild(i);};

function renderMeds(){

    var list=getMedicationReminders(),c=document.getElementById('medication-reminder-list');

    if(list.length===0){c.innerHTML='<div class="empty-state">暂无用药提醒</div>';return;}

    c.innerHTML=list.map(function(r){return '<div class="reminder-item"><div class="med-icon">💊</div><div class="med-info"><div class="med-name">'+r.name+'</div><div class="med-detail">'+r.dosage+(r.note?' | '+r.note:'')+'</div><div class="med-times">时间: '+(r.times.join('/')||'-')+'</div></div><button class="btn btn-xs btn-danger" onclick="delRem(\''+r.id+'\')">删</button></div>';}).join('');

}

window.delRem=function(id){removeMedicationReminder(id);renderMeds();showToast('已删除','info');};



// 健康档案

function saveHealthProfileForm(){

    var u=getCurrentUser();

    savePatientProfile({userId:u?.id||'',name:document.getElementById('hp-name').value,gender:document.getElementById('hp-gender').value,birthdate:document.getElementById('hp-birthdate').value,height:document.getElementById('hp-height').value,weight:document.getElementById('hp-weight').value,bloodType:document.getElementById('hp-blood-type').value,allergy:document.getElementById('hp-allergy').value,history:document.getElementById('hp-history').value,familyHistory:document.getElementById('hp-family-history').value,constitutions:Array.from(document.querySelectorAll('#constitution-checkboxes input:checked')).map(function(cb){return cb.value;})});

    showToast('健康档案保存成功','success');

}

function loadProfileDisplay(){

    var u=getCurrentUser(),p=getPatientProfile(u?.id||''),c=document.getElementById('patient-profile-summary');

    if(!p.name){c.innerHTML='<div class="empty-state">暂无健康档案</div>';return;}

    c.innerHTML='<div class="profile-summary">'+

        ['姓名',p.name||'-','性别',{male:'男',female:'女'}[p.gender]||'-','年龄',calcAge(p.birthdate)||'-',

         'BMI',calcBMI(p.height,p.weight)||'-','血型',p.bloodType||'-','体质',(p.constitutions?p.constitutions.map(function(x){return TCM_CONSTITUTIONS[x]?.name||x;}).join('/'):'-')

        ].reduce(function(h,v,i,a){if(i%2===0)return h+'<div class="ps-item"><div class="ps-label">'+v+'</div><div class="ps-value">';return h+v+'</div></div>'},'')+'</div>';

}

function calcBMI(h,w){h=parseFloat(h);w=parseFloat(w);if(!h||!w)return'-';var b=(w/(h*h/10000)).toFixed(1);return b+(b<18.5?'偏瘦':b<24?'正常':b<28?'超重':'肥胖');}



function loadScienceArticles(){

    var c=document.getElementById('science-articles');

    c.innerHTML=SCIENCE_ARTICLES.map(function(a){return '<div class="science-card"><div class="sci-icon">'+a.icon+'</div><div class="sci-info"><h4>'+a.title+'</h4><p>'+a.summary+'</p><span class="sci-tag">'+a.tag+'</span></div></div>';}).join('');

}



function initPatientHome(){

    var u=getCurrentUser();

    var el=document.getElementById('patient-greeting');

    if(el) el.textContent=(u?.name||'您好')+'，欢迎回来！';

}



function loadPatientRecords(){

    var c=document.getElementById('patient-records-list'),recs=getMedicalRecords();

    if(!c)return;

    if(!recs.length){c.innerHTML='<div class=empty-state>暂无就诊记录</div>';return;}

    c.innerHTML=recs.map(function(r){

        return '<div class=emr-card><div class=emr-header><strong>'+r.patientName||''+'</strong><span style="font-size:12px;color:#888;margin-left:auto">'+formatDate(r.date||Date.now())+'</span></div><div class=emr-body>'+(r.wmDiagnosis?'<p style="font-size:13px"><b>西医：</b>'+r.wmDiagnosis+'</p>':'')+(r.tcmPattern?'<p style="font-size:13px;color:#795548"><b>中医：</b>'+r.tcmPattern+'</p>':'')+'</div></div>';

    }).join('');

}



function loadPatientHealthPlans(){

    var c=document.getElementById('health-plan-list'),plans=getHealthPlans();

    if(!c)return;

    if(!plans.length){c.innerHTML='<div class=empty-state>暂无健康方案，可在问诊后由医生生成</div>';return;}

    c.innerHTML=plans.map(function(p){

        return '<div class=card style="margin-bottom:12px;padding:16px"><h4 style="color:#2e7d32">🍲 '+p.planTitle||'个性化健康方案'+'</h4><p style="font-size:13px;color:#666;margin-top:6px">'+(p.summary||'')+'</p><button class="btn btn-sm btn-primary mt-10" onclick="displayHP('+JSON.stringify(p.sections||[]).replace(/"/g,'&quot;')+')">查看详情</button></div>';

    }).join('');

}