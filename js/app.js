/**
 * 中西医结合 AI 智能诊疗网站 - 全局应用入口
 * 路由导航 / 页面切换 / 侧边栏 / Toast通知 / 免责声明
 */

// ============ 全局状态 ============
const AppState = {
    currentRole: null,       // 'patient' | 'doctor' | 'admin' | null
    currentPage: null,
    currentUser: null,
};

// ============ 页面路由映射 ============
const PAGE_ROUTES = {
    patient: {
        home: 'page-patient-home',
        tongue: 'page-tongue-diagnosis',
        report: 'page-lab-report',
        imaging: 'page-imaging-upload',
        consultation: 'page-online-consult',
        records: 'page-my-records',
        healthPlan: 'page-health-plan',
        appointment: 'page-appointment',
        medication: 'page-medication-reminder',
        profile: 'page-health-profile',
        articles: 'page-science-articles',
    },
    doctor: {
        dashboard: 'page-doctor-home',
        consultNew: 'page-new-consultation',
        prescriptions: 'page-prescription',
        patients: 'page-patient-mgmt',
        knowledgeBase: 'page-knowledge-base',
    },
    admin: {
        dashboard: 'page-admin-home',
        users: null,
        data: null,
        compliance: null,
        settings: null,
        stats: null,
        backup: null,
    }
};

// ============ 导航函数 ============
function navigateTo(pageKey) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });

    // 隐藏登录页
    const loginPage = document.getElementById('page-login');
    if (loginPage) loginPage.style.display = 'none';

    let targetId;
    if (PAGE_ROUTES.patient[pageKey]) {
        targetId = PAGE_ROUTES.patient[pageKey];
        AppState.currentRole = 'patient';
    } else if (PAGE_ROUTES.doctor[pageKey]) {
        targetId = PAGE_ROUTES.doctor[pageKey];
        AppState.currentRole = 'doctor';
    } else if (PAGE_ROUTES.admin && PAGE_ROUTES.admin[pageKey]) {
        targetId = PAGE_ROUTES.admin[pageKey];
        if (!targetId) {
            // 管理后台子页面 - 使用容器 + 内部切换
            targetId = 'page-admin-container';
            showAdminSubPage(pageKey);
        }
        AppState.currentRole = 'admin';
    } else {
        console.warn('未知的页面:', pageKey);
        return;
    }

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
        targetEl.classList.add('active');
        targetEl.style.display = '';
    }

    AppState.currentPage = pageKey;

    // 更新侧边栏高亮
    updateSidebarActive(pageKey);

    // 更新底部TabBar（患者端）
    updateTabBarActive(pageKey);

    // 触发页面初始化
    triggerPageInit(pageKey);

    // 移动端自动关闭侧边栏
    closeSidebarMobile();
}

// ============ 登录处理 ============
function handleLogin() {
    const phone = document.getElementById('login-phone')?.value?.trim();
    const code = document.getElementById('login-code')?.value?.trim();
    const roleSelect = document.querySelector('.role-tab.active');

    if (!phone || !code) {
        showToast('请输入手机号和验证码', 'warning');
        return;
    }

    const role = roleSelect ? roleSelect.dataset.role : 'patient';

    // 模拟登录验证（演示模式：任意4位验证码）
    if (code.length < 4) {
        showToast('请输入正确的验证码', 'error');
        return;
    }

    // 设置用户信息
    AppState.currentUser = {
        id: generateId(),
        phone: phone,
        name: role === 'doctor' ? '演示医师' : (role === 'admin' ? '管理员' : '演示患者'),
        role: role,
        loginTime: Date.now(),
        avatar: null,
    };
    DB.set('currentUser', AppState.currentUser);

    AppState.currentRole = role;

    showToast(`欢迎回来，${AppState.currentUser.name}！`, 'success');

    setTimeout(() => {
        enterApp(role);
    }, 500);
}

function enterApp(role) {
    // 隐藏加载遮罩
    const loadingEl = document.getElementById('app-loading');
    if (loadingEl) loadingEl.style.display = 'none';

    // 隐藏登录页面
    const loginPage = document.getElementById('page-login');
    if (loginPage) {
        loginPage.style.display = 'none';
        loginPage.classList.remove('active');
    }

    // 生成侧边栏导航菜单（按角色）
    buildSidebarMenu(role);

    // 显示顶部导航
    const header = document.getElementById('app-header');
    if (header) header.style.display = '';

    if (role === 'patient') {
        navigateTo('home');
        showTabBar();
    } else if (role === 'doctor') {
        navigateTo('dashboard');
        hideTabBar();
    } else if (role === 'admin') {
        navigateTo('dashboard');
        hideTabBar();
    }

    // 显示免责声明
    showDisclaimerOnce();
}

// ============ 侧边栏菜单生成 ============
const SIDEBAR_MENUS = {
    patient: [
        { key: 'home', icon: '🏠', label: '首页' },
        { key: 'tongue', icon: '👅', label: '中医舌诊' },
        { key: 'report', icon: '🔬', label: '报告解读' },
        { key: 'imaging', icon: '🖼️', label: '影像上传' },
        { key: 'consultation', icon: '💬', label: '在线问诊' },
        { key: 'records', icon: '📋', label: '我的病历' },
        { key: 'healthPlan', icon: '🍲', label: '健康方案' },
        { key: 'appointment', icon: '📅', label: '预约挂号' },
        { key: 'medication', icon: '💊', label: '用药提醒' },
        { key: 'profile', icon: '👤', label: '健康档案' },
        { key: 'articles', icon: '📖', label: '科普文章' },
    ],
    doctor: [
        { key: 'dashboard', icon: '🏥', label: '工作台' },
        { key: 'consultNew', icon: '🩺', label: '新问诊' },
        { key: 'prescriptions', icon: '💊', label: '处方管理' },
        { key: 'patients', icon: '👥', label: '患者管理' },
        { key: 'knowledgeBase', icon: '📚', label: '知识库' },
    ],
    admin: [
        { key: 'dashboard', icon: '📊', label: '总览' },
        { key: 'users', icon: '👤', label: '账号管理' },
        { key: 'data', icon: '🗄️', label: '数据管理' },
        { key: 'compliance', icon: '⚖️', label: '合规管控' },
        { key: 'settings', icon: '⚙️', label: '系统设置' },
        { key: 'stats', icon: '📈', label: '统计面板' },
        { key: 'backup', icon: '💾', label: '备份恢复' },
    ]
};

function buildSidebarMenu(role) {
    const navContainer = document.getElementById('sidebar-nav');
    if (!navContainer) return;

    const items = SIDEBAR_MENUS[role] || SIDEBAR_MENUS.patient;
    
    navContainer.innerHTML = items.map(function(item, idx) {
        var activeClass = idx === 0 ? ' active' : '';
        return '<div class="nav-item' + activeClass + '" data-page="' + item.key + '" onclick="navigateTo(\'' + item.key + '\')">' +
            '<span class="nav-icon">' + item.icon + '</span>' +
            '<span class="nav-label">' + item.label + '</span>' +
            '</div>';
    }).join('');
}

// ============ 底部TabBar控制 ============
function showTabBar() {
    var tb = document.getElementById('bottom-tabbar');
    if (tb) tb.style.display = '';
}
function hideTabBar() {
    var tb = document.getElementById('bottom-tabbar');
    if (tb) tb.style.display = 'none';
}

function logout() {
    if (!confirm('确定要退出登录吗？')) return;

    AppState.currentUser = null;
    AppState.currentRole = null;
    AppState.currentPage = null;
    DB.set('currentUser', null);

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });

    // 显示登录页
    const loginPage = document.getElementById('page-login');
    if (loginPage) {
        loginPage.style.display = '';
        loginPage.classList.add('active');
    }

    showToast('已安全退出', 'info');
}

// ============ Toast通知系统 ============
function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);

    // 触发动画
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============ 免责声明弹窗 ============
function showDisclaimerOnce() {
    const shown = DB.get('disclaimer_shown');
    if (shown) return;

    showModal('disclaimer-modal');
    DB.set('disclaimer_shown', true);
}

function acceptDisclaimer() {
    hideModal('disclaimer-modal');
}

// 免责声明弹窗事件绑定（确保 checkbox → 按钮 状态联动生效）
function bindDisclaimerEvents() {
    var cb = document.getElementById('agree-disclaimer');
    var btn = document.getElementById('btn-agree-disclaimer');
    if (cb && !cb._bound) {
        cb.addEventListener('change', function() {
            if (btn) btn.disabled = !this.checked;
        });
        cb._bound = true;
    }
    if (btn && !btn._bound) {
        btn.addEventListener('click', function() {
            if (!this.disabled) acceptDisclaimer();
        });
        btn._bound = true;
    }
}

// ============ 模态弹窗控制 ============
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        // 弹窗显示时自动绑定内部事件
        if (modalId === 'disclaimer-modal') bindDisclaimerEvents();
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// 点击遮罩关闭弹窗
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// ============ 侧边栏控制 ============
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
}

function closeSidebarMobile() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (window.innerWidth <= 768) {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    }
}

document.addEventListener('click', function(e) {
    const overlay = document.getElementById('sidebar-overlay');
    if (e.target === overlay) {
        closeSidebarMobile();
    }
});

// ============ 侧边栏高亮更新 ============
function updateSidebarActive(pageKey) {
    document.querySelectorAll('.sidebar-nav .nav-item, .sidebar-menu .menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageKey) {
            item.classList.add('active');
        }
    });
}

// ============ 底部TabBar（患者端） ============
function updateTabBarActive(pageKey) {
    const tabbar = document.getElementById('bottom-tabbar');
    if (!tabbar) return;

    // 映射：页面key → tabbar data-page
    const tabMap = {
        home: 'home',
        tongue: 'tongue',
        report: 'report',
        consultation: 'consultation',
        records: 'records',
        profile: 'profile',
    };

    const targetTab = tabMap[pageKey];
    tabbar.querySelectorAll('.tabbar-item').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.page === targetTab);
    });

    // 控制显示/隐藏（仅部分页面显示TabBar）
    const pagesWithTab = ['home', 'tongue', 'report', 'consultation', 'records', 'profile', 'articles'];
    tabbar.style.display = pagesWithTab.includes(pageKey) ? '' : 'none';
}

// TabBar点击事件委托
document.addEventListener('click', function(e) {
    const tabItem = e.target.closest('.tabbar-item');
    if (tabItem) {
        const page = tabItem.dataset.page;
        if (page) navigateTo(page);
    }
});

// ============ 管理后台子页面切换 ============
function showAdminSubPage(subPageKey) {
    const contentArea = document.getElementById('admin-sub-pages');
    if (!contentArea) { console.warn('admin sub-page container not found'); return; }

    // 更新管理后台菜单高亮
    document.querySelectorAll('.admin-sidebar .menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === subPageKey);
    });

    // 渲染对应内容
    switch(subPageKey) {
        case 'users': renderAdminUsers(); break;
        case 'data': renderAdminData(); break;
        case 'compliance': renderAdminCompliance(); break;
        case 'settings': renderAdminSettings(); break;
        case 'stats': renderAdminStats(); break;
        case 'backup': renderBackupPage(); break;
        default:
            contentArea.innerHTML = '<div class="empty-state"><p>页面开发中...</p></div>';
    }
}

function navigateAdmin(subPageKey) {
    navigateTo(subPageKey); // 通过主路由进入
}

// ============ 页面初始化触发器 ============
function triggerPageInit(pageKey) {
    // 延迟调用，确保DOM已显示
    setTimeout(() => {
        try {
            switch(pageKey) {
                // 患者端
                case 'home':
                    if (typeof initPatientHome === 'function') initPatientHome();
                    break;
                case 'tongue':
                    // 初始化上传区域
                    break;
                case 'report':
                    // 初始化报告上传
                    break;
                case 'imaging':
                    // 初始化影像上传
                    break;
                case 'consultation':
                    if (typeof loadAvailableDoctors === 'function') loadAvailableDoctors();
                    // 绑定问诊聊天交互（确保每次进入页面都绑定）
                    bindConsultChatEvents();
                    break;
                case 'records':
                    if (typeof loadPatientRecords === 'function') loadPatientRecords();
                    break;
                case 'healthPlan':
                    if (typeof loadPatientHealthPlans === 'function') loadPatientHealthPlans();
                    break;
                case 'appointment':
                    // 初始化预约日历
                    break;
                case 'medication':
                    if (typeof renderMeds === 'function') renderMeds();
                    break;
                case 'profile':
                    if (typeof loadProfileDisplay === 'function') loadProfileDisplay();
                    break;
                case 'articles':
                    if (typeof loadScienceArticles === 'function') loadScienceArticles();
                    break;
                // 医生端
                case 'dashboard':
                    if (typeof loadDoctorHome === 'function') loadDoctorHome();
                    break;
                case 'consultNew':
                    // 步骤式表单初始化
                    break;
                case 'prescriptions':
                    if (typeof loadDoctorPrescriptions === 'function') loadDoctorPrescriptions();
                    break;
                case 'patients':
                    if (typeof loadDoctorPatientList === 'function') loadDoctorPatientList();
                    break;
                case 'knowledgeBase':
                    if (typeof initKB === 'function') initKB();
                    break;
                // 管理端
                case 'dashboard':
                    if (typeof loadAdminHome === 'function') loadAdminHome();
                    break;
            }
        } catch(err) {
            console.warn('页面初始化失败:', pageKey, err);
        }
    }, 50);
}

// ============ 验证码发送模拟 ============
function sendVerifyCode() {
    const phoneInput = document.getElementById('login-phone');
    const btn = document.getElementById('send-code-btn');
    
    if (!phoneInput || !phoneInput.value.trim()) {
        showToast('请先输入手机号', 'warning');
        return;
    }

    if (phoneInput.value.trim().length !== 11) {
        showToast('请输入正确的11位手机号', 'warning');
        return;
    }

    // 模拟发送
    btn.disabled = true;
    let countdown = 60;
    btn.textContent = `${countdown}s后重发`;

    const timer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            btn.textContent = '获取验证码';
        } else {
            btn.textContent = `${countdown}s后重发`;
        }
    }, 1000);

    showToast('验证码已发送（演示模式：任意4位数字）', 'success');
}

// ============ 角色标签切换（登录页） ============
function initRoleTabs() {
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 更新隐藏字段
            const roleInput = document.getElementById('login-role');
            if (roleInput) roleInput.value = tab.dataset.role;

            // 切换表单显示：患者/医生显示验证码，管理端显示密码
            const codeGroup = document.getElementById('verify-code-group');
            const pwdGroup = document.getElementById('password-group');
            const sendCodeBtn = document.getElementById('btn-send-code');

            if (tab.dataset.role === 'admin') {
                if (codeGroup) codeGroup.style.display = 'none';
                if (pwdGroup) pwdGroup.style.display = '';
                if (sendCodeBtn) sendCodeBtn.style.display = 'none';
            } else {
                if (codeGroup) codeGroup.style.display = '';
                if (pwdGroup) pwdGroup.style.display = 'none';
                if (sendCodeBtn) sendCodeBtn.style.display = '';
            }
        });
    });
}

// ============ 图片预览 ============
function previewImage(file, targetImgId) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById(targetImgId);
        if (img) {
            img.src = e.target.result;
            img.style.display = '';
        }
    };
    reader.readAsDataURL(file);
}

// ============ 文件拖拽上传支持 ============
function setupDropZone(zoneId, onDropCallback) {
    const zone = document.getElementById(zoneId);
    if (!zone) return;

    ['dragenter', 'dragover'].forEach(evt => {
        zone.addEventListener(evt, e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        zone.addEventListener(evt, e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
        });
    });

    zone.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        if (files.length > 0 && onDropCallback) {
            onDropCallback(files[0]);
        }
    });
}

// ============ 加载遮罩 ============
function showLoading(text = '加载中...') {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'loading-overlay';
        loader.innerHTML = `<div class="spinner"></div><p>${text}</p>`;
        document.body.appendChild(loader);
    }
    loader.querySelector('p').textContent = text;
    loader.style.display = 'flex';
}

function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';
}

// ============ 格式化工具 ============
function formatDateTime(timestamp, fmt = 'YYYY-MM-DD HH:mm') {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    const map = {
        'YYYY': d.getFullYear(),
        'MM': String(d.getMonth()+1).padStart(2,'0'),
        'DD': String(d.getDate()).padStart(2,'0'),
        'HH': String(d.getHours()).padStart(2,'0'),
        'mm': String(d.getMinutes()).padStart(2,'0'),
        'ss': String(d.getSeconds()).padStart(2,'0'),
    };
    let result = fmt;
    for (const [k,v] of Object.entries(map)) {
        result = result.replace(k, v);
    }
    return result;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024*1024)).toFixed(1) + ' MB';
}

// ============ 敏感词过滤 ============
function filterSensitiveContent(text) {
    if (!text) return text;
    let filtered = text;
    SENSITIVE_WORDS.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '**');
    });
    return filtered;
}

// ============ 数据统计辅助 ============
function calcStats(dataList, field) {
    if (!dataList || !dataList.length) return { total: 0, values: [] };
    const values = dataList.map(item => item[field]).filter(v => v != null && !isNaN(v));
    const total = values.reduce((a,b) => a + Number(b), 0);
    return { total, values, count: values.length };
}

// ============ 导出数据为文件 ============
function exportToFile(data, filename, type = 'json') {
    let content, mimeType, ext;
    if (type === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        ext = '.json';
    } else if (type === 'csv') {
        if (!Array.isArray(data) || !data.length) { showToast('无数据可导出','warning'); return; }
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(h => `"${(row[h]+'').replace(/"/g,'\"')}"`).join(','));
        content = [headers.join(','), ...rows].join('\n');
        mimeType = 'text/csv';
        ext = '.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '_' + formatDateTime(Date.now(), 'YYYYMMDD_HHmmss') + ext;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${filename}导出成功`, 'success');
}

// ============ 应用初始化 ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 中西医结合 AI 智能诊疗系统 初始化中...');

    // 隐藏加载遮罩（无论登录状态如何都要隐藏）
    const appLoading = document.getElementById('app-loading');
    if (appLoading) {
        setTimeout(function() { appLoading.style.display = 'none'; }, 300);
    }

    // 初始化角色标签
    initRoleTabs();

    // 恢复登录态
    const savedUser = DB.get('currentUser');
    if (savedUser && savedUser.role) {
        AppState.currentUser = savedUser;
        AppState.currentRole = savedUser.role;
        enterApp(savedUser.role);
    }

    // 绑定登录表单提交（阻止默认提交，改用JS处理）
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleLogin();
        });
    }

    // 绑定登录按钮（备用：点击也触发）
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // 绑定验证码按钮
    const codeBtn = document.getElementById('btn-send-code');
    if (codeBtn) {
        codeBtn.addEventListener('click', sendVerifyCode);
    }

    // 绑定微信快捷登录
    const wechatBtn = document.getElementById('btn-wechat-login');
    if (wechatBtn) {
        wechatBtn.addEventListener('click', function() {
            showToast('微信快捷登录（演示模式）', 'info');
            var phoneInput = document.getElementById('login-phone');
            if (phoneInput && !phoneInput.value.trim()) phoneInput.value = '13800000000';
            var codeInput = document.getElementById('login-code');
            if (codeInput && !codeInput.value.trim()) codeInput.value = '123456';
            showToast('已自动填充演示账号，点击登录即可', 'success');
        });
    }

    // 免责声明弹窗事件预绑定（确保首次弹出时即可交互）
    bindDisclaimerEvents();

    // 一次性初始化患者端所有交互事件（patient.js 中的 initLoginPage）
    // 包含：发送按钮、Enter键、健康方案卡片切换、时段选择、症状标签、免责声明等
    if (typeof initLoginPage === 'function') {
        initLoginPage();
    }

    // 绑定退出按钮 — 全局点击委托（白名单模式：先放行交互元素，再处理导航功能）
    document.addEventListener('click', function(e) {
        // ========== 白名单：放行所有原生交互元素 ==========
        // 1. 有 onclick 内联事件的元素
        if (e.target.closest('[onclick]')) return;
        // 2. 上传区域
        if (e.target.closest('.upload-zone')) return;
        // 3. 表单控件（select/input/textarea/option）— 解决"选择医生下拉无法点击"问题
        if (e.target.closest('select, input, textarea, option, [contenteditable]')) return;
        // 4. 医生卡片、健康方案选项卡、时段选择、症状标签等 addEventListener 绑定的交互按钮
        if (e.target.closest('.doctor-card-small, .plan-type-card, .time-slot, .phrase-btn, .tag.selectable, .doctor-card, .patient-card')) return;
        // 5. 模态框内的操作按钮
        if (e.target.closest('.modal-content button, .modal-content a, .modal-content [data-action]')) return;

        // ========== 以下仅处理全局导航功能 ==========
        // 退出按钮
        if (e.target.closest('.logout-btn') || e.target.id === 'logout-btn') {
            logout();
            return;
        }

        // 顶部导航栏"首页"文字点击 → 返回当前角色的首页
        var headerTitle = e.target.closest('#header-title');
        if (headerTitle && AppState.currentRole) {
            e.preventDefault();
            e.stopPropagation();
            if (AppState.currentRole === 'doctor' || AppState.currentRole === 'admin') {
                navigateTo('dashboard');
            } else {
                navigateTo('home');
            }
            return;
        }

        // 侧边栏菜单点击（data-page） - 仅限 sidebar-nav 内的 nav-item
        var navItem = e.target.closest('#sidebar-nav .nav-item[data-page]');
        if (navItem) {
            var page = navItem.dataset.page;
            if (page) navigateTo(page);
            return;
        }

        // 全局 Tab 切换（data-tab 属性）
        var tabBtn = e.target.closest('[data-tab]');
        if (tabBtn) {
            var tabGroup = tabBtn.parentElement;
            if (!tabGroup) return;
            tabGroup.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
            tabBtn.classList.add('active');

            var targetTab = tabBtn.dataset.tab;
            var tabsWrapper = tabGroup.closest('.tabs');
            if (tabsWrapper) {
                var tabContentsParent = tabsWrapper.parentElement;
                if (tabContentsParent) {
                    tabContentsParent.querySelectorAll('.tab-content').forEach(function(tc) { tc.classList.remove('active'); });
                    var targetEl = document.getElementById('tab-' + targetTab);
                    if (targetEl) targetEl.classList.add('active');
                }
            }
            return;
        }

        // 患者管理 - 分类筛选 pill 按钮（data-cat）
        var catPill = e.target.closest('[data-cat]');
        if (catPill) {
            var cat = catPill.dataset.cat;
            var pillsContainer = catPill.closest('.category-pills');
            if (pillsContainer) {
                pillsContainer.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
                catPill.classList.add('active');
            }
            filterPatientListByCategory(cat);
            return;
        }

        // 知识库分类按钮（data-kb）
        var kbCatBtn = e.target.closest('[data-kb]');
        if (kbCatBtn) {
            var kbCat = kbCatBtn.dataset.kb;
            var kbCatsContainer = kbCatBtn.closest('.knowledge-categories');
            if (kbCatsContainer) {
                kbCatsContainer.querySelectorAll('.kb-cat').forEach(function(b) { b.classList.remove('active'); });
                kbCatBtn.classList.add('active');
            }
            if (typeof renderKB === 'function') renderKB(kbCat);
            return;
        }
    });

// ============ 问诊聊天事件绑定 ============
function bindConsultChatEvents() {
    var sendBtn = document.getElementById('btn-send-message');
    if (sendBtn && !sendBtn._bound) {
        sendBtn.addEventListener('click', function() {
            if (typeof sendMessage === 'function') sendMessage();
        });
        sendBtn._bound = true;
    }
    var chatInput = document.getElementById('chat-input');
    if (chatInput && !chatInput._bound) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (typeof sendMessage === 'function') sendMessage();
            }
        });
        chatInput._bound = true;
    }
    // 快捷短语按钮
    document.querySelectorAll('.phrase-btn').forEach(function(b) {
        if (!b._bound) {
            b.addEventListener('click', function() {
                var ci = document.getElementById('chat-input');
                if (ci) { ci.value = this.dataset.text; ci.focus(); }
            });
            b._bound = true;
        }
    });
}

    function filterPatientListByCategory(cat) {
    var container = document.getElementById('doctor-patient-list');
    if (!container) return;

    var allPatients = getPatients ? getPatients() : [];
    if (!allPatients.length) {
        container.innerHTML = '<div class="empty-state">暂无患者数据</div>';
        return;
    }

    var filtered = cat === 'all' ? allPatients : allPatients.filter(function(p) {
        return (p.category || '') === cat;
    });

    container.innerHTML = filtered.length ? filtered.map(function(p) {
        var catLabel = { chronic: '慢病', acute: '急性', followup: '随访中', recovery: '康复期' }[p.category] || '';
        return '<div class="patient-card" onclick="startConsultWithPatientId(\'' + p.id + '\')">' +
            '<div class="patient-avatar-big">' + (p.avatar || '👤') + '</div>' +
            '<div class="patient-card-info"><div class="pt-name">' + p.name + '</div>' +
            '<div class="pt-meta">' + (p.phone || '') + (catLabel ? ' · ' + catLabel : '') +
            '</div></div></div>';
    }).join('') : '<div class="empty-state">该分类下暂无患者</div>';
}

// ============ 知识库搜索（全局函数，供HTML调用） ============
window.searchKnowledgeBase = function() {
    if (typeof searchKB === 'function') searchKB();
};

console.log('✅ 系统初始化完成');
});
