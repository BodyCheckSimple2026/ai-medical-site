/* ==========================================
   存储管理模块 - LocalStorage 数据持久化
   ========================================== */

const DB = {
    // 前缀，防止与其他应用冲突
    PREFIX: 'tcm_wm_med_',

    _key(name) { return this.PREFIX + name; },

    get(name, defaultValue = null) {
        try {
            const raw = localStorage.getItem(this._key(name));
            return raw ? JSON.parse(raw) : (defaultValue !== null ? defaultValue : null);
        } catch (e) {
            console.error('DB.get error:', name, e);
            return defaultValue;
        }
    },

    set(name, value) {
        try {
            localStorage.setItem(this._key(name), JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('DB.set error:', name, e);
            if (e.name === 'QuotaExceededError') {
                showToast('存储空间已满，请清理部分数据', 'error');
            }
            return false;
        }
    },

    remove(name) {
        localStorage.removeItem(this._key(name));
    },

    // 获取所有键名
    keys() {
        const result = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.PREFIX)) {
                result.push(key.substring(this.PREFIX.length));
            }
        }
        return result;
    },

    // 清除所有数据
    clearAll() {
        this.keys().forEach(key => this.remove(key));
    },

    // 导出所有数据为JSON
    exportData() {
        const data = {};
        this.keys().forEach(key => {
            data[key] = this.get(key);
        });
        data._exportTime = new Date().toISOString();
        data._version = '1.0';
        return JSON.stringify(data, null, 2);
    },

    // 从JSON导入数据
    importData(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            Object.keys(data).forEach(key => {
                if (!key.startsWith('_')) {
                    this.set(key, data[key]);
                }
            });
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
};

// ==================== 用户数据模型 ====================

// 当前登录用户
function getCurrentUser() {
    return DB.get('currentUser', null);
}

function setCurrentUser(user) {
    DB.set('currentUser', user);
}

// 患者列表
function getPatients() {
    return DB.get('patients', []);
}

function savePatient(patient) {
    const patients = getPatients();
    const idx = patients.findIndex(p => p.id === patient.id);
    if (idx >= 0) {
        patients[idx] = patient;
    } else {
        patient.id = patient.id || generateId();
        patient.createdAt = patient.createdAt || Date.now();
        patients.push(patient);
    }
    DB.set('patients', patients);
    return patient;
}

function deletePatient(patientId) {
    let patients = getPatients().filter(p => p.id !== patientId);
    DB.set('patients', patients);
}

function findPatientById(id) {
    return getPatients().find(p => p.id === id);
}

function findPatientByPhone(phone) {
    return getPatients().find(p => p.phone === phone);
}

// 医生列表
function getDoctors() {
    return DB.get('doctors', []);
}

function saveDoctor(doctor) {
    const doctors = getDoctors();
    const idx = doctors.findIndex(d => d.id === doctor.id);
    doctor.id = doctor.id || generateId();
    if (idx >= 0) {
        doctors[idx] = { ...doctors[idx], ...doctor };
    } else {
        doctor.createdAt = doctor.createdAt || Date.now();
        doctors.push(doctor);
    }
    DB.set('doctors', doctors);
    return doctor;
}

// 病历记录
function getMedicalRecords() {
    return DB.get('medicalRecords', []);
}

function saveMedicalRecord(record) {
    record.id = record.id || generateId();
    record.createdAt = record.createdAt || Date.now();
    const records = getMedicalRecords();
    records.unshift(record);  // 最新的在前面
    DB.set('medicalRecords', records);
    return record;
}

// 舌诊分析记录
function getTongueAnalyses() {
    return DB.get('tongueAnalyses', []);
}

function saveTongueAnalysis(data) {
    data.id = data.id || generateId();
    data.userId = getCurrentUser()?.id || '';
    data.analyzedAt = Date.now();
    const analyses = getTongueAnalyses();
    analyses.unshift(data);
    DB.set('tongueAnalyses', analyses);
    return data;
}

// 报告解读记录
function getReportAnalyses() {
    return DB.get('reportAnalyses', []);
}

function saveReportAnalysis(data) {
    data.id = data.id || generateId();
    data.userId = getCurrentUser()?.id || '';
    data.savedAt = Date.now();
    const analyses = getReportAnalyses();
    analyses.unshift(data);
    DB.set('reportAnalyses', analyses);
    return data;
}

// 影像记录
function getImagingRecords() {
    return DB.get('imagingRecords', []);
}

function saveImagingRecord(data) {
    data.id = data.id || generateId();
    data.userId = getCurrentUser()?.id || '';
    data.uploadedAt = Date.now();
    const records = getImagingRecords();
    records.unshift(data);
    DB.set('imagingRecords', records);
    return data;
}

// 健康方案
function getHealthPlans() {
    return DB.get('healthPlans', []);
}

function saveHealthPlan(plan) {
    plan.id = plan.id || generateId();
    plan.generatedAt = Date.now();
    const plans = getHealthPlans();
    plans.unshift(plan);
    DB.set('healthPlans', plans);
    return plan;
}

// 预约记录
function getAppointments() {
    return DB.get('appointments', []);
}

function saveAppointment(apt) {
    apt.id = apt.id || generateId();
    apt.createdAt = Date.now();
    const apts = getAppointments();
    apts.push(apt);
    DB.set('appointments', apts);
    return apt;
}

// 用药提醒
function getMedicationReminders() {
    return DB.get('medReminders', []);
}

function saveMedicationReminder(rem) {
    rem.id = rem.id || generateId();
    rem.userId = getCurrentUser()?.id || '';
    const reminders = getMedicationReminders();
    const idx = reminders.findIndex(r => r.id === rem.id);
    if (idx >= 0) {
        reminders[idx] = rem;
    } else {
        reminders.push(rem);
    }
    DB.set('medReminders', reminders);
    return rem;
}

function removeMedicationReminder(id) {
    const reminders = getMedicationReminders().filter(r => r.id !== id);
    DB.set('medReminders', reminders);
}

// 健康档案（患者端）
function getPatientProfile(userId) {
    return DB.get('profile_' + (userId || ''), {});
}

function savePatientProfile(profile) {
    profile.updatedAt = Date.now();
    DB.set('profile_' + profile.userId, profile);
    return profile;
}

// 系统设置
function getSystemSettings() {
    return DB.get('systemSettings', {
        siteName: '中西医结合AI智能诊疗平台',
        disclaimerAccepted: false,
        sensitiveWords: SENSITIVE_WORDS,
        autoBackup: true
    });
}

function saveSystemSettings(settings) {
    DB.set('systemSettings', settings);
}

// ==================== 工具函数 ====================
function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
}

function formatDate(timestamp, format = 'YYYY-MM-DD HH:mm') {
    const d = new Date(timestamp);
    const pad = n => String(n).padStart(2, '0');
    const map = {
        'YYYY': d.getFullYear(),
        'MM': pad(d.getMonth() + 1),
        'DD': pad(d.getDate()),
        'HH': pad(d.getHours()),
        'mm': pad(d.getMinutes()),
        'ss': pad(d.getSeconds())
    };
    let result = format;
    Object.keys(map).forEach(k => { result = result.replace(k, map[k]); });
    return result;
}

function calcAge(birthdate) {
    if (!birthdate) return '--';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? age + '岁' : '<1岁';
}