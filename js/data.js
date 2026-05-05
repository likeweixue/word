// 数据模型
function Volume(id, name, chapters) {
  this.id = id;
  this.name = name;
  this.chapters = chapters || [];
}

function Chapter(id, title, content) { 
  this.id = id; 
  this.title = title; 
  this.content = content; 
  this.createdTime = new Date().toISOString(); 
  this.updatedTime = new Date().toISOString(); 
}

function Book(id, title, volumes) { 
  this.id = id; 
  this.title = title; 
  this.volumes = volumes || [];
  this.createdAt = new Date().toISOString(); 
}

// 全局变量
var books = [];
var settings = { theme: 'default', showGrid: false, fontFamily: 'system-ui', lineHeight: '1.8' };
var openTabs = [{ id: 'home', title: '首页', type: 'home' }];
var activeTabId = 'home';
var currentBookId = null, currentVolumeId = null, currentChapterId = null;
var autoSaveTimer = null;

// 分组
var groups = [{ id: 'default', name: '默认分组', books: [] }];
function loadGroups() {
  var saved = localStorage.getItem('wps_groups');
  if (saved) {
    try { groups = JSON.parse(saved); } catch(e) {}
  }
  if (!groups || groups.length === 0) { groups = [{ id: 'default', name: '默认分组', books: [] }]; }
}
function saveGroups() { localStorage.setItem('wps_groups', JSON.stringify(groups)); }

// 回收站
var trashBooks = [];
function loadTrash() {
  var saved = localStorage.getItem('wps_trash');
  if (saved) {
    try { trashBooks = JSON.parse(saved); } catch(e) {}
  }
  if (!trashBooks) trashBooks = [];
}
function saveTrash() { localStorage.setItem('wps_trash', JSON.stringify(trashBooks)); }
function moveToTrash(book) { book.deletedTime = new Date().toISOString(); trashBooks.push(book); saveTrash(); }
function restoreFromTrash(bookId) {
  for (var i = 0; i < trashBooks.length; i++) {
    if (trashBooks[i].id == bookId) {
      var book = trashBooks[i];
      trashBooks.splice(i, 1);
      books.push(book);
      saveTrash();
      saveAllData();
      return book;
    }
  }
  return null;
}
function permanentDeleteBook(bookId) {
  trashBooks = trashBooks.filter(function(b) { return b.id != bookId; });
  saveTrash();
}

function saveAllData() { 
  localStorage.setItem('wps_data', JSON.stringify({ books: books, settings: settings })); 
}

// 加载示例数据
function loadSampleData() {
  if (books.length === 0) {
    var sampleChapter = new Chapter(Date.now(), '第一章', '<p>这里是属于斗气的世界...</p>');
    var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
    var sampleBook = new Book(Date.now(), '斗破苍穹', [sampleVolume]);
    books.push(sampleBook);
    saveAllData();
  }
}

// ========== 名字库（本地预设，不需要联网）==========
var nameDatabase = {
  // 人物名（姓 + 名 组合）
  person: {
    surnames: ['林', '陈', '李', '张', '王', '刘', '赵', '周', '吴', '郑', '萧', '叶', '楚', '慕容', '欧阳', '独孤', '令狐', '东方', '南宫', '上官'],
    givenNames: ['轩', '宇', '辰', '逸', '风', '云', '龙', '凤', '月', '雪', '烟', '尘', '凡', '羽', '天', '玄', '灵', '梦', '瑶', '曦', '宁', '静', '安', '然'],
    middleNames: ['一', '子', '小', '晓', '明', '文', '武', '志', '远', '宏', '伟', '俊', '杰', '雅', '慧', '淑', '婉', '芳', '英', '华']
  },
  // 地名
  place: {
    prefixes: ['苍', '玄', '天', '云', '风', '雷', '星', '月', '日', '海', '山', '江', '河', '雪', '冰', '火', '灵', '仙', '神', '圣'],
    suffixes: ['山', '峰', '岭', '谷', '崖', '渊', '城', '都', '镇', '村', '寨', '堡', '关', '州', '郡', '府', '宫', '殿', '阁', '楼', '塔', '坛', '洞', '海', '湖', '河', '江']
  },
  // 实力等级
  power: {
    levels: ['凡人', '炼气期', '筑基期', '金丹期', '元婴期', '化神期', '炼虚期', '合体期', '大乘期', '渡劫期'],
    advanced: ['初级', '中级', '高级', '巅峰', '圆满', '大圆满'],
    special: ['一星', '二星', '三星', '四星', '五星', '六星', '七星', '八星', '九星', '十星']
  },
  // 招式/功法
  skill: {
    prefixes: ['天', '地', '玄', '黄', '宇', '宙', '洪', '荒', '太', '虚', '乾', '坤', '阴', '阳', '五', '行', '八', '卦'],
    bodies: ['龙', '凤', '虎', '龟', '麒麟', '朱雀', '玄武', '青龙', '白虎', '鲲鹏', '饕餮', '混沌'],
    actions: ['拳', '掌', '指', '剑', '刀', '枪', '棍', '锤', '鞭', '爪', '腿', '身法', '心法', '剑法', '刀法', '掌法'],
    suffixes: ['诀', '典', '经', '录', '谱', '图', '卷', '篇', '章', '式', '技', '术', '法', '功', '典']
  },
  // 装备/武器
  equipment: {
    types: ['剑', '刀', '枪', '棍', '锤', '鞭', '弓', '弩', '盾', '甲', '袍', '靴', '冠', '戒', '链', '佩', '令', '印'],
    qualities: ['凡铁', '精钢', '玄铁', '灵器', '法宝', '灵宝', '道器', '仙器', '神器', '圣器'],
    prefixes: ['破', '斩', '灭', '碎', '裂', '震', '封', '镇', '锁', '困', '幻', '隐', '速', '力', '护']
  },
  // 怪物/妖兽
  monster: {
    types: ['狼', '虎', '狮', '豹', '蛇', '蛟', '龙', '凤', '龟', '蝎', '蛛', '蚁', '蜂', '蝶', '鹰', '雕', '鲲', '鹏'],
    prefixes: ['赤', '橙', '黄', '绿', '青', '蓝', '紫', '黑', '白', '金', '银', '铁', '铜', '木', '水', '火', '土', '风', '雷', '电', '冰', '雪', '毒', '魔', '妖', '灵', '圣', '神'],
    suffixes: ['兽', '王', '皇', '尊', '圣', '帝', '妖', '魔', '灵', '怪']
  },
  // 道具/物品
  item: {
    prefixes: ['回', '疗', '复', '增', '强', '固', '护', '防', '攻', '速', '敏', '智', '力', '体'],
    types: ['丹', '药', '丸', '散', '膏', '液', '露', '浆', '果', '草', '花', '叶', '根', '茎', '石', '矿', '珠', '玉', '晶'],
    suffixes: ['丸', '丹', '散', '膏', '液', '露', '浆', '果', '草', '花']
  }
};

// 随机取元素
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 生成人物名
function generatePersonName() {
  var useMiddle = Math.random() > 0.7;
  if (useMiddle) {
    return randomItem(nameDatabase.person.surnames) + 
           randomItem(nameDatabase.person.middleNames) + 
           randomItem(nameDatabase.person.givenNames);
  } else {
    return randomItem(nameDatabase.person.surnames) + randomItem(nameDatabase.person.givenNames);
  }
}

// 生成地名
function generatePlaceName() {
  var useCompound = Math.random() > 0.5;
  if (useCompound) {
    return randomItem(nameDatabase.place.prefixes) + randomItem(nameDatabase.place.prefixes) + randomItem(nameDatabase.place.suffixes);
  } else {
    return randomItem(nameDatabase.place.prefixes) + randomItem(nameDatabase.place.suffixes);
  }
}

// 生成实力等级
function generatePowerLevel() {
  var type = Math.random();
  if (type < 0.6) {
    return randomItem(nameDatabase.power.levels);
  } else if (type < 0.8) {
    return randomItem(nameDatabase.power.advanced) + randomItem(nameDatabase.power.levels);
  } else {
    return randomItem(nameDatabase.power.special) + randomItem(nameDatabase.power.levels[Math.floor(Math.random() * 5) + 1]);
  }
}

// 生成招式名
function generateSkillName() {
  var formats = [
    function() { return randomItem(nameDatabase.skill.prefixes) + randomItem(nameDatabase.skill.bodies) + randomItem(nameDatabase.skill.actions); },
    function() { return randomItem(nameDatabase.skill.prefixes) + randomItem(nameDatabase.skill.actions) + randomItem(nameDatabase.skill.suffixes); },
    function() { return randomItem(nameDatabase.skill.bodies) + randomItem(nameDatabase.skill.actions) + randomItem(nameDatabase.skill.suffixes); },
    function() { return randomItem(nameDatabase.skill.prefixes) + randomItem(nameDatabase.skill.prefixes) + randomItem(nameDatabase.skill.actions); }
  ];
  return randomItem(formats)();
}

// 生成装备名
function generateEquipmentName() {
  var formats = [
    function() { return randomItem(nameDatabase.equipment.qualities) + randomItem(nameDatabase.equipment.types); },
    function() { return randomItem(nameDatabase.equipment.prefixes) + randomItem(nameDatabase.equipment.qualities) + randomItem(nameDatabase.equipment.types); },
    function() { return randomItem(nameDatabase.equipment.prefixes) + randomItem(nameDatabase.equipment.types); }
  ];
  return randomItem(formats)();
}

// 生成怪物名
function generateMonsterName() {
  var formats = [
    function() { return randomItem(nameDatabase.monster.prefixes) + randomItem(nameDatabase.monster.types) + randomItem(nameDatabase.monster.suffixes); },
    function() { return randomItem(nameDatabase.monster.prefixes) + randomItem(nameDatabase.monster.types); },
    function() { return randomItem(nameDatabase.monster.types) + randomItem(nameDatabase.monster.suffixes); }
  ];
  return randomItem(formats)();
}

// 生成道具名
function generateItemName() {
  var formats = [
    function() { return randomItem(nameDatabase.item.prefixes) + '命' + randomItem(nameDatabase.item.types) + randomItem(nameDatabase.item.suffixes); },
    function() { return randomItem(nameDatabase.item.prefixes) + randomItem(nameDatabase.item.types); },
    function() { return randomItem(nameDatabase.item.types) + randomItem(nameDatabase.item.suffixes); }
  ];
  return randomItem(formats)();
}

// 主生成函数
function generateName(category) {
  switch(category) {
    case 'person': return generatePersonName();
    case 'place': return generatePlaceName();
    case 'power': return generatePowerLevel();
    case 'skill': return generateSkillName();
    case 'equipment': return generateEquipmentName();
    case 'monster': return generateMonsterName();
    case 'item': return generateItemName();
    default: return generatePersonName();
  }
}
