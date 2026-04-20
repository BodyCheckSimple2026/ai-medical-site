/* ==========================================
   数据层 - 中医知识库、西医参考值、方剂库、科普文章
   ========================================== */

// ==================== 中医体质库 ====================
const TCM_CONSTITUTIONS = {
    qixu: {
        name: '气虚质',
        desc: '元气不足，气息弱低、肌肉松软。平素语音低弱，气短懒言，容易疲乏，精神不振，易出汗，舌淡红，舌边有齿痕。',
        features: ['面色偏白', '语音低弱', '容易疲劳', '动则汗出', '易感冒', '舌淡有齿痕'],
        diet: {
            recommend: ['黄芪', '党参', '白术', '山药', '大枣', '桂圆', '鸡肉', '牛肉', '鲢鱼'],
            avoid: ['生冷苦寒食物', '破气耗气之物如山楂、大蒜'],
            moderate: ['辛辣刺激']
        },
        advice: '宜食补气健脾之品。起居宜规律，避免过度劳累。可练习八段锦、太极拳等温和运动。'
    },
    yangxu: {
        name: '阳虚质',
        desc: '阳气不足，以畏寒怕冷、手足不温等虚寒表现为主要特征。平素畏冷，手足不温，喜热饮食，精神不振，舌淡胖嫩。',
        features: ['怕冷', '手脚冰凉', '喜热饮', '面色苍白', '大便溏薄', '夜尿频多'],
        diet: {
            recommend: ['羊肉', '狗肉', '鹿肉', '韭菜', '生姜', '肉桂', '花椒', '核桃', '板栗'],
            avoid: ['生冷寒凉食物', '冰镇饮料', '苦瓜', '西瓜', '梨', '绿豆'],
            moderate: []
        },
        advice: '宜食温补阳气之品。注意保暖，尤其是腰背和下肢。可适当晒太阳。运动宜选温暖时段进行。'
    },
    yinxu: {
        name: '阴虚质',
        desc: '阴液亏少，以口燥咽干、手足心热等虚热表现为主要特征。体形多瘦长，易心烦失眠，舌红少津。',
        features: ['口干咽燥', '手足心热', '潮热盗汗', '心烦易怒', '便秘尿黄', '舌红少苔'],
        diet: {
            recommend: ['鸭肉', '猪肉', '鸡蛋', '银耳', '百合', '雪梨', '桑葚', '枸杞', '黑芝麻'],
            avoid: ['温燥辛辣食物', '羊肉', '狗肉', '辣椒', '生姜', '葱', '蒜'],
            moderate: ['油炸食品']
        },
        advice: '宜食滋阴润燥之品。生活规律，避免熬夜。保持心情舒畅，忌情绪激动。运动不宜过激。'
    },
    tanshi: {
        name: '痰湿质',
        desc: '痰湿凝聚，以形体肥胖、腹部肥满、口黏苔腻等为主要特征。面部皮肤油脂较多，多汗且黏，胸闷，痰多。',
        features: ['体型肥胖', '腹部肥满', '面部油光', '口黏痰多', '身重困倦', '舌苔厚腻'],
        diet: {
            recommend: ['冬瓜', '赤小豆', '薏米', '萝卜', '海带', '山楂', '陈皮', '茯苓', '荷叶'],
            avoid: ['油腻甜食', '肥肉', '甜点', '饮料', '酒精', '糯米', '糖果'],
            moderate: ['主食量应控制']
        },
        advice: '宜清淡利湿之品。坚持适度运动控制体重。居住环境宜干燥通风。'
    },
    shire: {
        name: '湿热质',
        desc: '湿热内蕴，以面垢油光、易生痤疮、口苦口干等为主要特征。容易长痘，面垢油光，口苦口干，身重困倦。',
        features: ['面部长痘', '皮肤油腻', '口苦口臭', '小便黄短', '大便黏滞', '带下色黄'],
        diet: {
            recommend: ['绿豆', '薏米', '苦瓜', '黄瓜', '莲藕', '芹菜', '冬瓜', '绿茶', '荸荠'],
            avoid: ['辛辣烧烤', '酒类', '肥甘厚味', '榴莲', '芒果', '荔枝'],
            moderate: []
        },
        advice: '宜清热祛湿之品。戒除烟酒，少熬夜。保持皮肤清洁。'
    },
    xueyu: {
        name: '血瘀质',
        desc: '血行不畅，以肤色晦暗、舌质紫暗等血瘀表现为主要特征。肤色晦黯，色素沉着，容易出现瘀斑，口唇黯淡。',
        features: ['肤色晦暗', '色素沉着', '容易淤青', '口唇紫暗', '舌质紫暗', '月经血块'],
        diet: {
            recommend: ['山楂', '玫瑰花', '黑豆', '黑木耳', '洋葱', '醋', '红糖', '桃仁', '红花'],
            avoid: ['生冷寒凉', '收敛涩滞之物', '乌梅', '石榴'],
            moderate: ['高脂食物']
        },
        advice: '宜活血化瘀之品。注意保暖，避免受寒。保持心情愉快，避免情志郁结。'
    },
    qiyu: {
        name: '气郁质',
        desc: '气机郁滞，以神情抑郁、忧虑脆弱等气郁表现为主要特征。性格内向不稳定，敏感多疑，忧郁脆弱。',
        features: ['情绪低落', '胸闷叹息', '胁肋胀痛', '咽喉异物感', '睡眠不佳', '食欲减退'],
        diet: {
            recommend: ['佛手', '陈皮', '金橘', '玫瑰花茶', '菊花', '茉莉花', '小麦', '百合', '黄花菜'],
            avoid: ['酸涩收敛之物', '乌梅', '柠檬', '李子'],
            moderate: ['咖啡因饮品']
        },
        advice: '宜疏肝理气之品。培养兴趣爱好，多参加社交活动。保证充足睡眠。'
    },
    tebing: {
        name: '特禀质',
        desc: '先天失常，以生理缺陷、过敏反应等为主要特征。常见过敏体质、先天性或遗传性疾病。',
        features: ['过敏体质', '打喷嚏流涕', '皮肤瘙痒', '哮喘发作', '药物过敏', '食物过敏'],
        diet: {
            recommend: ['灵芝', '蜂蜜', '红枣', '胡萝卜', '南瓜', '香菇', '银耳', '山药', '薏米'],
            avoid: ['致敏食物（根据个人情况）', '腥膻发物', '海鲜', '牛羊肉', '芒果', '菠萝'],
            moderate: ['新尝试的食物需小心']
        },
        advice: '宜益气固表、养血消风。避免接触过敏原。春季外出注意防护。'
    },
    pinghe: {
        name: '平和质',
        desc: '阴阳气血调和，体态适中，面色红润，精力充沛。是理想的健康体质状态。',
        features: ['体态适中', '面色润泽', '精力充沛', '睡眠良好', '食欲正常', '二便调畅'],
        diet: {
            recommend: ['均衡饮食', '五谷杂粮', '新鲜蔬果', '适量蛋白', '优质脂肪'],
            avoid: ['无特殊禁忌'],
            moderate: ['任何单一食物都不宜过量']
        },
        advice: '继续保持良好的生活习惯。饮食有节，劳逸结合。'
    }
};

// ==================== 舌诊知识库 ====================
const TONGUE_DIAGNOSIS_DATA = {
    tongueBodyColors: [
        { id: 'normal', label: '淡红舌', meaning: '正常舌色，气血调和', constitution: 'pinghe' },
        { id: 'pale', label: '淡白舌', meaning: '气血不足或阳虚', constitution: ['qixu', 'yangxu'] },
        { id: 'red', label: '红舌', meaning: '内有实热或阴虚火旺', constitution: ['yinxu', 'shire'] },
        { id: 'crimson', label: '绛舌', meaning: '邪热入营分，热盛伤津', constitution: ['yinxu', 'shire'] },
        { id: 'purple', label: '紫舌', meaning: '气血运行不畅，或有瘀滞', constitution: 'xueyu' }
    ],
    tongueBodyShapes: [
        { id: 'fat', label: '胖大舌', meaning: '水湿内停，脾肾阳虚', constitution: 'yangxu' },
        { id: 'thin', label: '瘦薄舌', meaning: '阴血不足，舌失濡养', constitution: 'yinxu' },
        { id: 'toothed', label: '齿痕舌', meaning: '脾虚湿盛，气虚', constitution: ['qixu', 'tanshi'] },
        { id: 'cracked', label: '裂纹舌', meaning: '阴液亏损或热盛伤津', constitution: 'yinxu' },
        { id: 'prickly', label: '芒刺舌', meaning: '脏腑热盛，尤以舌尖为心肺', constitution: 'shire' }
    ],
    tongueCoatColors: [
        { id: 'white-thin', label: '薄白苔', meaning: '正常舌苔，胃气充盛', status: 'normal' },
        { id: 'white-thick', label: '厚白苔', meaning: '寒湿内盛或食积', status: 'warning' },
        { id: 'yellow-thin', label: '薄黄苔', meaning: '里热初起', status: 'abnormal' },
        { id: 'yellow-thick', label: '厚黄苔', meaning: '肠胃实热，湿热内蕴', status: 'danger' },
        { id: 'gray-black', label: '灰黑苔', meaning: '里热极盛或寒湿重证', status: 'danger' },
        { id: 'no-coat', label: '剥落/光剥苔', meaning: '胃阴受损，胃气不足', status: 'warning' }
    ],
    tongueCoatTextures: [
        { id: 'greasy', label: '腻苔', meaning: '湿浊、痰饮、食积', related: 'tanshi' },
        { id: 'curd-like', label: '腐苔', meaning: '胃腑宿食积滞' },
        { id: 'dry', label: '燥苔', meaning: '津液受损，热盛伤津' },
        { id: 'slippery', label: '滑苔', meaning: '水湿内停，寒湿内阻' }
    ],
    // 常见证候组合
    syndromePatterns: [
        {
            name: '脾胃虚弱证',
            tongueDesc: '舌淡红或有齿痕，苔薄白',
            symptoms: ['纳呆腹胀', '便溏乏力', '面色萎黄', '四肢倦怠'],
            formula: '四君子汤 / 参苓白术散',
            advice: '健脾益胃，饮食宜温软易消化，忌生冷油腻'
        },
        {
            name: '肝肾阴虚证',
            tongueDesc: '舌红少苔或无苔',
            symptoms: ['头晕耳鸣', '腰膝酸软', '潮热盗汗', '五心烦热'],
            formula: '六味地黄丸 / 知柏地黄丸',
            advice: '滋补肝肾，忌辛辣燥热，宜静养，保证睡眠'
        },
        {
            name: '肝郁气滞证',
            tongueDesc: '舌淡红，苔薄白',
            symptoms: ['胸胁胀痛', '善太息', '情志抑郁', '月经不调'],
            formula: '逍遥散 / 柴胡疏肝散',
            advice: '疏肝理气解郁，保持心情舒畅，适度运动'
        },
        {
            name: '痰湿阻滞证',
            tongueDesc: '舌体胖大有齿痕，苔白腻',
            symptoms: ['形体肥胖', '头身困重', '胸闷恶心', '痰多咳嗽'],
            formula: '二陈汤 / 平胃散合用',
            answer: '化痰除湿，控制饮食，加强运动，减少肥甘厚味摄入'
        },
        {
            name: '湿热蕴结证',
            tongueDesc: '舌红，苔黄腻',
            symptoms: ['口苦口黏', '身热不扬', '小便短赤', '大便黏滞'],
            formula: '三仁汤 / 连朴饮 / 龙胆泻肝汤',
            advice: '清热利湿，饮食清淡，戒烟酒，忌肥甘辛辣'
        },
        {
            name: '气虚血瘀证',
            tongueDesc: '舌淡暗或有瘀点，苔薄白',
            symptoms: ['神疲乏力', '疼痛固定不移', '肌肤甲错', '舌质紫暗'],
            formula: '补阳还五汤 / 血府逐瘀汤',
            advice: '益气活血化瘀，适度活动，避免久坐久卧'
        }
    ]
};

// ==================== 检验报告参考范围 ====================
const LAB_REFERENCE_RANGES = {
    'blood-routine': {
        name: '血常规',
        items: [
            { code: 'WBC', name: '白细胞计数', unit: '×10⁹/L', refLow: 3.5, refHigh: 10.0, category: 'immune' },
            { code: 'RBC', name: '红细胞计数', unit: '×10¹²/L', refLow: 4.0, refHigh: 5.5, category: 'blood' },
            { code: 'HGB', name: '血红蛋白', unit: 'g/L', refLow: 115, refHigh: 160, category: 'blood' },
            { code: 'HCT', name: '红细胞压积', unit: '%', refLow: 35, refHigh: 50, category: 'blood' },
            { code: 'PLT', name: '血小板计数', unit: '×10⁹/L', refLow: 100, refHigh: 300, category: 'clotting' },
            { code: 'NEUT%', name: '中性粒细胞%', unit: '%', refLow: 40, refHigh: 75, category: 'immune' },
            { code: 'LYM%', name: '淋巴细胞%', unit: '%', refLow: 20, refHigh: 50, category: 'immune' },
            { code: 'MONO%', name: '单核细胞%', unit: '%', refLow: 3, refHigh: 12, category: 'immune' }
        ]
    },
    'biochemistry': {
        name: '生化全套',
        items: [
            { code: 'ALT', name: '谷丙转氨酶', unit: 'U/L', refLow: 0, refHigh: 40, category: 'liver' },
            { code: 'AST', name: '谷草转氨酶', unit: 'U/L', refLow: 0, refHigh: 40, category: 'liver' },
            { code: 'TBIL', name: '总胆红素', unit: 'μmol/L', refLow: 3.4, refHigh: 20.5, category: 'liver' },
            { code: 'ALB', name: '白蛋白', unit: 'g/L', refLow: 40, refHigh: 55, category: 'nutrition' },
            { code: 'BUN', name: '尿素氮', unit: 'mmol/L', refLow: 2.9, refHigh: 8.2, category: 'kidney' },
            { code: 'CREA', name: '肌酐', unit: 'μmol/L', refLow: 44, refHigh: 106, category: 'kidney' },
            { code: 'UA', name: '尿酸', unit: 'μmol/L', refLow: 150, refHigh: 420, category: 'metabolism' },
            { code: 'GLU', name: '空腹血糖', unit: 'mmol/L', refLow: 3.89, refHigh: 6.11, category: 'glucose' },
            { code: 'TC', name: '总胆固醇', unit: 'mmol/L', refLow: 2.8, refHigh: 5.72, category: 'lipid' },
            { code: 'TG', name: '甘油三酯', unit: 'mmol/L', refLow: 0.34, refHigh: 1.70, category: 'lipid' },
            { code: 'HDL-C', name: '高密度脂蛋白', unit: 'mmol/L', refLow: 1.04, refHigh: null, category: 'lipid' },
            { code: 'LDL-C', name: '低密度脂蛋白', unit: 'mmol/L', refLow: null, refHigh: 3.37, category: 'lipid' },
            { code: 'K+', name: '钾离子', unit: 'mmol/L', refLow: 3.5, refHigh: 5.3, category: 'electrolyte' },
            { code: 'Na+', name: '钠离子', unit: 'mmol/L', refLow: 136, refHigh: 146, category: 'electrolyte' }
        ]
    },
    'urine-routine': {
        name: '尿常规',
        items: [
            { code: 'pH', name: '尿酸碱度', unit: '', refLow: 4.6, refHigh: 8.0, category: 'general' },
            { code: 'SG', name: '尿比重', unit: '', refLow: 1.005, refHigh: 1.03, category: 'general' },
            { code: 'PRO', name: '尿蛋白', unit: '', refLow: '-', refHigh: '-', category: 'kidney' },
            { code: 'GLU', name: '尿糖', unit: '', refLow: '-', refHigh: '-', category: 'glucose' },
            { code: 'BLD', name: '尿隐血', unit: '', refLow: '-', refHigh: '-', category: 'blood' },
            { code: 'LEU', name: '白细胞', unit: '', refLow: '-', refHigh: '+-', category: 'infection' }
        ]
    },
    'thyroid': {
        name: '甲状腺功能',
        items: [
            { code: 'TSH', name: '促甲状腺激素', unit: 'mIU/L', refLow: 0.27, refHigh: 4.20, category: 'tsh' },
            { code: 'FT3', name: '游离T3', unit: 'pmol/L', refLow: 3.1, refHigh: 6.8, category: 'hormone' },
            { code: 'FT4', name: '游离T4', unit: 'pmol/L', refLow: 12.0, refHigh: 22.0, category: 'hormone' },
            { code: 'TPOAb', name: '抗甲状腺过氧化物酶抗体', unit: 'IU/mL', refLow: 0, refHigh: 34, category: 'antibody' },
            { code: 'TGAb', name: '抗甲状腺球蛋白抗体', unit: 'IU/mL', refLow: 0, refHigh: 115, category: 'antibody' }
        ]
    },
    'blood-lipid': {
        name: '血脂四项',
        items: [
            { code: 'TC', name: '总胆固醇', unit: 'mmol/L', refLow: 2.8, refHigh: 5.72, category: 'lipid' },
            { code: 'TG', name: '甘油三酯', unit: 'mmol/L', refLow: 0.34, refHigh: 1.70, category: 'lipid' },
            { code: 'HDL-C', name: '高密度脂蛋白', unit: 'mmol/L', refLow: 1.04, refHigh: null, category: 'lipid' },
            { code: 'LDL-C', name: '低密度脂蛋白', unit: 'mmol/L', refLow: null, refHigh: 3.37, category: 'lipid' }
        ]
    },
    'blood-sugar': {
        name: '血糖/糖化血红蛋白',
        items: [
            { code: 'FPG', name: '空腹血糖', unit: 'mmol/L', refLow: 3.89, refHigh: 6.11, category: 'glucose' },
            { code: '2hPG', name: '餐后2h血糖', unit: 'mmol/L', refLow: null, refHigh: 7.8, category: 'glucose' },
            { code: 'HbA1c', name: '糖化血红蛋白', unit: '%', refLow: 4.0, refHigh: 6.0, category: 'glucose' }
        ]
    }
};

// ==================== 指标解读规则 ====================
const ITEM_INTERPRETATIONS = {
    WBC: { high: '升高提示感染、炎症、应激状态等；常见于细菌感染、组织损伤等', low: '降低见于某些病毒感染、再生障碍性贫血、化疗后骨髓抑制等' },
    RBC: { high: '相对增多见于脱水；绝对增多见于红细胞增多症', low: '降低见于各类贫血、出血、溶血等' },
    HGB: { high: '同红细胞增多原因', low: '贫血的指标，男性<120g/L、女性<110g/L为贫血标准' },
    PLT: { high: '增多见于原发性血小板增多症、炎症反应等', low: '减少见于ITP、再障、化疗后、脾功能亢进等' },
    ALT: { high: '肝细胞损伤的主要指标，升高见于病毒性肝炎、酒精性肝病、脂肪肝、药物性肝损等', low: '一般无临床意义' },
    AST: { high: '升高可见于肝脏疾病、心肌损伤、骨骼肌损伤等', low: '一般无临床意义' },
    GLU: { high: '空腹≥7.0mmol/L提示糖尿病可能；6.1-7.0mmol/L为空腹血糖受损', low: '低于2.8mmol/L为低血糖，可出现头晕心慌等症状' },
    UA: { high: '升高即高尿酸血症，与痛风密切相关', low: '少见，偶见于Fanconi综合征' },
    TC: { high: '高胆固醇血症，增加动脉粥样硬化风险', low: '过低可能与营养不良、严重肝病有关' },
    TG: { high: '高甘油三酯血症，与心血管风险相关', low: '一般无需关注' },
    LDL_C: { high: '坏胆固醇，升高显著增加心脑血管疾病风险', low: '越低越好（在正常范围内）' },
    HDL_C: { high: '好胆固醇，越高越好', low: '降低增加心血管风险' },
    BUN: { high: '肾功能不全的重要指标之一', low: '较少见，可能与蛋白质摄入不足有关' },
    CREA: { high: '肾功能损害的关键标志物', low: '见于肌萎缩、营养不良等' },
    TSH: { high: '甲状腺功能减退（甲减）', low: '甲状腺功能亢进（甲亢）或亚临床甲亢' },
    HbA1c: { high: '反映近2-3月平均血糖水平，≥6.5%诊断糖尿病', low: '可能提示近期频繁低血糖' }
};

// ==================== 中医方剂库 ====================
const FORMULA_LIBRARY = [
    {
        name: '麻黄汤',
        source: '《伤寒论》',
        components: '麻黄(去节)9g、桂枝(去皮)6g、炙甘草3g、杏仁(去皮尖)9g',
        indication: '外感风寒表实证。症见恶寒发热、头痛身疼、无汗而喘、苔薄白、脉浮紧。',
        usage: '水煎服，覆被取微汗',
        category: '解表'
    },
    {
        name: '桂枝汤',
        source: '《伤寒论》',
        components: '桂枝(去皮)9g、芍药9g、炙甘草6g、生姜(切)9g、大枣(擘)3枚',
        indication: '外感风寒表虚证。头痛发热、汗出恶风、鼻鸣干呕、苔白不渴、脉浮缓或浮弱。',
        usage: '水煎取汁，趁热服，啜稀粥助药力',
        category: '解表'
    },
    {
        name: '小柴胡汤',
        source: '《伤寒论》',
        components: '柴胡24g、黄芩9g、人参9g、半夏(洗)9g、炙甘草9g、生姜(切)9g、大枣(擘)4枚',
        indication: '①少阳证：寒热往来、胸胁苦满、默默不欲饮食、心烦喜呕、口苦咽干目眩。②妇科热入血室证。③疟疾、黄疸等见少阳证者。',
        usage: '水煎服，每日一剂，早晚分服',
        category: '和解'
    },
    {
        name: '逍遥散',
        source: '《太平惠民和剂局方》',
        components: '柴胡15g、当归15g、白芍15g、白术15g、茯苓15g、炙甘草6g、煨姜少许、薄荷少许',
        indication: '肝郁血虚脾弱证。两胁作痛、头痛目眩、口燥咽干、神疲食少、月经不调、脉弦而虚。',
        usage: '水煎服，或做丸剂服用',
        category: '和解'
    },
    {
        name: '六味地黄丸',
        source: '《小儿药证直诀》',
        components: '熟地黄24g、山茱萸12g、干山药12g、泽泻9g、牡丹皮9g、茯苓(去皮)9g',
        indication: '肝肾阴虚证。腰膝酸软、头晕目眩、耳鸣耳聋、盗汗遗精、骨蒸潮热、手足心热、舌红少苔。',
        usage: '炼蜜为丸，每服6-9g；亦可水煎服',
        category: '补益'
    },
    {
        name: '四君子汤',
        source: '《太平惠民和剂局方》',
        components: '人参(或党参)9g、白术9g、茯苓(去皮)9g、甘草(炙)6g',
        indication: '脾胃气虚证。面色萎黄、语声低微、气短乏力、食少便溏、舌淡苔白、脉虚弱。',
        usage: '水煎服，日一剂',
        category: '补益'
    },
    {
        name: '参苓白术散',
        source: '《太平惠民和剂局方》',
        components: '莲子肉500g、薏苡仁500g、缩砂仁500g、桔梗500g、白扁豆750g、白茯苓1000g、人参1000g、甘草(炒)1000g、白术1000g、山药1000g',
        indication: '脾虚夹湿证。饮食不化、胸脘痞闷、肠鸣泄泻、四肢乏力、形体消瘦、面色萎黄。',
        usage: '研末，每服6g，枣汤送下',
        category: '补益'
    },
    {
        name: '归脾汤',
        source: '《济生方》',
        components: '白术3g、茯神3g、黄芪3g、龙眼肉3g、酸枣仁3g、人参3g、木香1.5g、甘草(炙)1g、当归3g、远志3g',
        indication: '①心脾气血两虚：心悸怔忡、健忘失眠、面色萎黄、头晕、肢倦乏力。②脾不统血：便血、崩漏等。',
        usage: '加生姜5片、大枣1枚，水煎服',
        category: '补益'
    },
    {
        name: '二陈汤',
        source: '《太平惠民和剂局方》',
        components: '半夏(汤洗七次)15g、橘红15g、白茯苓9g、甘草(炙)4.5g',
        indication: '湿痰证。咳嗽痰多、色白易咯、胸膈痞闷、恶心呕吐、肢体困倦、头眩心悸、舌苔白滑或腻。',
        usage: '加生姜7片、乌梅1个，水煎服',
        category: '祛痰'
    },
    {
        name: '平胃散',
        source: '《太平惠民惠民和剂局方》',
        components: '苍术(去粗皮，米泔浸)15g、厚朴(去粗皮，姜汁制)9g、陈皮(去白)9g、甘草(炙)4.5g',
        indication: '湿滞脾胃证。脘腹胀满、不思饮食、口淡无味、恶心呕哕、嗳气吞酸、肢体沉重、怠惰嗜睡。',
        usage: '加生姜2片、大枣2枚，水煎服',
        category: '燥湿'
    },
    {
        name: '龙胆泻肝汤',
        source: '《医方集解》',
        components: '龙胆草(酒炒)6g、黄芩(炒)9g、栀子(酒炒)9g、泽泻12g、木通6g、车前子9g、当归(酒炒)3g、柴胡6g、生甘草6g、生地黄(酒炒)9g',
        indication: '①肝胆实火上炎：头痛目赤、胁痛口苦、耳聋耳肿。②肝经湿热下注：阴肿阴痒、筋痿阴汗、妇女带下淋浊。',
        usage: '水煎服',
        category: '清热'
    },
    {
        name: '三仁汤',
        source: '《温病条辨》',
        components: '杏仁15g、飞滑石18g、白通草6g、白蔻仁6g、竹叶6g、厚朴6g、生薏苡仁18g、半夏15g',
        indication: '湿温初起及暑温夹湿之湿重于热证。头痛恶寒、身重疼痛、午后身热、胸脘痞闷、不饥不渴、面色淡黄。',
        usage: '甘澜水煮服',
        category: '祛湿'
    },
    {
        name: '血府逐瘀汤',
        source: '《医林改错》',
        components: '桃仁12g、红花9g、当归9g、生地黄9g、川芎4.5g、赤芍6g、牛膝9g、桔梗4.5g、柴胡3g、枳壳6g、甘草6g',
        indication: '胸中血瘀证。胸痛、头痛日久不愈、呃逆干呕、内热瞀闷、心悸怔忡、急躁易怒、入暮潮热。',
        usage: '水煎服',
        category: '理血'
    },
    {
        name: '补阳还五汤',
        source: '《医林改错》',
        components: '黄芪(生)120g、当归尾6g、赤芍5g、地龙(去土)3g、川芎3g、红花3g、桃仁3g',
        indication: '中风之气虚血瘀证。半身不遂、口眼歪斜、语言謇涩、口角流涎、小便频数或遗尿不禁、舌暗淡、苔白、脉缓无力。',
        usage: '水煎服',
        category: '理血'
    },
    {
        name: '知柏地黄丸',
        source: '《医宗金鉴》',
        components: '熟地黄24g、山茱萸12g、干山药12g、泽泻9g、牡丹皮9g、茯苓(去皮)9g、知母6g、黄柏6g',
        indication: '肝肾阴虚火旺证。骨蒸潮热、虚烦盗汗、遗精、腰酸腿软、舌红少苔、脉细数。',
        usage: '蜜丸或水煎服',
        category: '补益'
    },
    {
        name: '温胆汤',
        source: '《三因极一病证方论》',
        components: '半夏(汤洗7次)6g、竹茹6g、枳实(麸炒)6g、陈皮(去白)15g、炙甘草3g、茯苓4.5g',
        indication: '胆胃不和、痰热内扰证。胆怯易惊、虚烦不宁、失眠多梦、呕吐呃逆或癫痫等。',
        usage: '加生姜5片、大枣1个，水煎服',
        category: '祛痰'
    }
];

// ==================== 西医常见病指南 ====================
const WM_GUIDELINES = [
    {
        disease: '上呼吸道感染',
        category: '呼吸系统',
        keyPoints: [
            '90%以上由病毒引起，抗生素对病毒无效',
            '普通感冒病程约7-10天，对症治疗为主',
            '发热38.5℃以下物理降温即可',
            '警惕并发症：中耳炎、肺炎、心肌炎',
            '老年人及免疫功能低下者需密切观察'
        ],
        redFlags: '呼吸困难、持续高热超过3天、意识改变、剧烈头痛 → 立即就医'
    },
    {
        disease: '高血压',
        category: '循环系统',
        keyPoints: [
            '正常血压：<140/90 mmHg',
            '生活方式干预是基础治疗',
            '低盐(<5g/日)、减重、限酒、规律运动',
            '降压目标：一般<140/90，糖尿病/肾病<130/80',
            '长期规律服药不可自行停药'
        ],
        redFlags: '血压>180/120 mmHg伴头痛/胸痛 → 高血压急症立即就医'
    },
    {
        disease: '2型糖尿病',
        category: '内分泌代谢',
        keyPoints: [
            '空腹血糖≥7.0mmol/L 或 餐后2h≥11.1mmol/L 可诊断',
            'HbA1c 控制目标一般<7%',
            '饮食控制 + 运动为基础治疗',
            '定期监测血糖，预防低血糖',
            '筛查并发症：眼底、肾脏、神经、足部'
        ],
        redFlags: '血糖>16.7mmol/L伴酮症表现 → 酮症酸中毒立即就医'
    },
    {
        disease: '慢性胃炎',
        category: '消化系统',
        keyPoints: [
            '幽门螺杆菌感染是最常见病因之一',
            '建议C13/C14呼气试验检测Hp',
            '饮食规律，避免刺激性食物',
            '根除Hp方案：四联疗法14天',
            '必要时行胃镜检查排除其他病变'
        ],
        redFlags: '黑便/呕血、进行性消瘦、吞咽困难 → 尽快内镜检查'
    },
    {
        disease: '颈椎病',
        category: '骨科',
        keyPoints: [
            '长期低头工作为主要危险因素',
            '颈型最常见，神经根型次之',
            '保守治疗为主：牵引、理疗、药物治疗',
            '改善姿势，定时活动颈部',
            '脊髓型需谨慎，必要时手术'
        ],
        redFlags: '行走不稳/踩棉花感、大小便障碍 → 脊髓型，尽快专科就诊'
    },
    {
        disease: '功能性消化不良',
        category: '消化系统',
        keyPoints: [
            '排除器质性病变后的功能性诊断',
            '分为餐后不适综合征(PDS)和上腹痛综合征(EPS)',
            '促动力药+抑酸药为一线治疗',
            '心理因素常参与发病',
            '调整饮食习惯很重要'
        ],
        redFlags: '年龄>45岁、消瘦、贫血、消化道肿瘤家族史 → 必须内镜排查'
    }
];

// ==================== 营养膳食库 ====================
const NUTRITION_DATABASE = [
    { nutrient: '维生素D', dose: '800-2000 IU/日', function: '钙吸收调节、免疫调节、骨骼健康', sources: '阳光照射、深海鱼、蛋黄、强化食品' },
    { nutrient: '维生素B族', dose: '复合B族1片/日', function: '能量代谢、神经系统功能', sources: '全谷物、瘦肉、蛋类、绿叶蔬菜' },
    { nutrient: '镁', dose: '300-400 mg/日', function: '300+酶促反应、肌肉放松、睡眠质量', sources: '深绿色蔬菜、坚果、种子、黑巧克力' },
    { nutrient: '锌', dose: '15-25 mg/日', function: '免疫功能、伤口愈合、味觉嗅觉', sources: '牡蛎、牛肉、南瓜子、豆类' },
    { nutrient: 'Omega-3脂肪酸', dose: 'EPA+DHA 1-2g/日', function: '抗炎、心血管保护、脑功能', sources: '深海鱼、亚麻籽、核桃、藻油' },
    { nutrient: '益生菌', dose: '50-100亿CFU/日', function: '肠道菌群平衡、免疫支持', sources: '酸奶、发酵食品、补充剂' },
    { nutrient: '辅酶Q10', dose: '100-200 mg/日', function: '线粒体能量产生、心脏健康、抗氧化', sources: '内脏肉类、牛肉、沙丁鱼、补充剂' },
    { nutrient: 'α-硫辛酸', dose: '300-600 mg/日', function: '强效抗氧化、葡萄糖代谢、神经保护', sources: '菠菜、西兰花、补充剂' }
];

// ==================== 科普文章 ====================
const SCIENCE_ARTICLES = [
    { icon: '👅', title: '中医舌诊入门指南', summary: '学会看舌象，初步了解自身体质与健康状态', tag: '中医基础' },
    { icon: '💊', title: '常用中药煎服方法详解', summary: '正确煎煮才能发挥最大疗效', tag: '用药指导' },
    { icon: '🍲', title: '九种体质的食疗调理方案', summary: '不同体质需要不同的饮食策略', tag: '营养食疗' },
    { icon: '❤️', title: '如何正确解读体检报告', summary: '看懂关键指标，不再一头雾水', tag: '检验解读' },
    { icon: '😴', title: '中医养生：四季作息指南', summary: '顺应自然规律，提升整体健康水平', tag: '养生保健' },
    { icon: '🧘', title: '八段锦完整教学（图文版）', summary: '简单有效的传统健身功法', tag: '运动康复' }
];

// ==================== 敏感词库（医疗合规） ====================
const SENSITIVE_WORDS = [
    '包治', '根治', '治愈率100%', '绝对有效', '无效退款',
    '祖传秘方', '特效药', '神药', '医学奇迹', '彻底断根',
    '替代手术', '不用吃药', '一次见效', '永不复发',
    '纯天然无毒副作用', '世界领先', '国际第一', '唯一有效'
];