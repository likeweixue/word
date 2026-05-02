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