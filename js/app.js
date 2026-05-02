// 主应用逻辑

// 数字转中文
function numberToChinese(num) {
  var chineseNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 10) return chineseNum[num];
  if (num < 20) return '十' + (num === 10 ? '' : chineseNum[num - 10]);
  if (num < 100) {
    var tens = Math.floor(num / 10);
    var ones = num % 10;
    return chineseNum[tens] + '十' + (ones === 0 ? '' : chineseNum[ones]);
  }
  return num.toString();
}

function getBookById(bookId) { 
  for (var i = 0; i < books.length; i++) {
    if (books[i].id == bookId) return books[i];
  }
  return null;
}
function getCurrentBook() { 
  for (var i = 0; i < books.length; i++) {
    if (books[i].id === currentBookId) return books[i];
  }
  return null;
}
function getCurrentVolume() { 
  var book = getCurrentBook(); 
  if (!book || !book.volumes) return null;
  for (var i = 0; i < book.volumes.length; i++) {
    if (book.volumes[i].id === currentVolumeId) return book.volumes[i];
  }
  return null;
}
function getCurrentChapter() { 
  var vol = getCurrentVolume(); 
  if (!vol || !vol.chapters) return null;
  for (var i = 0; i < vol.chapters.length; i++) {
    if (vol.chapters[i].id === currentChapterId) return vol.chapters[i];
  }
  return null;
}

// 打开导出面板
function openExportPanel() {
  var panel = document.getElementById('exportPanel');
  if (panel) {
    panel.classList.add('open');
    // 确保 z-index 足够高
    panel.style.zIndex = '9999';
    // 添加遮罩层
    addOverlay(function() {
      closeExportPanel();
    });
    console.log('导出面板打开');
  }
}

function closeExportPanel() {
  var panel = document.getElementById('exportPanel');
  if (panel) {
    panel.classList.remove('open');
    removeOverlay();
  }
}

// 遮罩层管理
var overlay = null;

function addOverlay(onClick) {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = function() {
    if (onClick) onClick();
    removeOverlay();
  };
  document.body.appendChild(overlay);
  setTimeout(function() {
    overlay.classList.add('show');
  }, 10);
}

function removeOverlay() {
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(function() {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      overlay = null;
    }, 300);
  }
}

// 打开查找面板
function openFindPanel() {
  var panel = document.getElementById('findPanel');
  if (panel) panel.classList.add('open');
}

// 打开新建书籍抽屉
function openNewBookDrawer() {
  var drawer = document.getElementById('newBookDrawer');
  if (drawer) {
    drawer.classList.add('open');
    var input = document.getElementById('newBookName');
    if (input) input.value = '';
  }
}

function closeNewBookDrawer() {
  var drawer = document.getElementById('newBookDrawer');
  if (drawer) drawer.classList.remove('open');
}

function createNewBook() {
  var nameInput = document.getElementById('newBookName');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert('请输入书籍名称');
    return;
  }
  var newChapter = new Chapter(Date.now(), '第一章', '<p></p>');
  var newVolume = new Volume(Date.now(), '第一卷', [newChapter]);
  var newBook = new Book(Date.now(), name, [newVolume]); 
  books.push(newBook); 
  saveAllData(); 
  renderBooks(); 
  closeNewBookDrawer();
  openBookTab(newBook.id);
}

function openBookTab(bookId) {
  var book = getBookById(bookId);
  if (!book) return;
  var tabId = 'book_' + bookId;
  
  var alreadyOpen = false;
  for (var i = 0; i < openTabs.length; i++) {
    if (openTabs[i].id === tabId) {
      alreadyOpen = true;
      break;
    }
  }
  if (alreadyOpen) {
    switchToTab(tabId);
    return;
  }
  
  openTabs.push({ id: tabId, title: book.title, type: 'book', bookId: bookId });
  renderTabs();
  
  var pagesContainer = document.getElementById('pagesContainer');
  var pageDiv = document.createElement('div');
  pageDiv.className = 'book-page';
  pageDiv.setAttribute('data-page', tabId);
  pageDiv.innerHTML = '<div class="book-detail-page" data-book-id="' + bookId + '">' +
    '<div class="book-detail-header">' +
    '<div class="right-tools">' +
    '<button id="findReplaceBtn" class="tool-icon">🔍 查找替换</button>' +
    '<button id="fullscreenBtn" class="tool-icon">❐ 全屏</button>' +
    '<button id="formatBtn" class="tool-icon">↹ 排版</button>' +
    '<button id="focusBtn" class="tool-icon">⍁ 闭关</button>' +
    '<button id="importBtn" class="tool-icon">↙ 导入</button>' +
    '<button id="exportBtn" class="tool-icon">↗ 导出</button>' +
    '<button id="styleBtn" class="tool-icon">◑ 主题</button>' +
    '</div>' +
    '</div>' +
    '<div class="detail-main">' +
    '<div class="detail-chapters" id="chaptersPanel">' +
    '<div class="resize-handle" id="resizeHandle"></div>' +
    '<div class="chapters-header">' +
    '<span id="currentBookTitle">📘 ' + escapeHtml(book.title) + '</span>' +
    '</div>' +
    '<div class="chapters-header">' +
    '<button id="addVolumeBtn">+ 分卷</button>' +
    '<button id="addChapterBtn">+ 章节</button>' +
    '</div>' +
    '<div id="volumeList" class="volume-list"></div>' +
    '</div>' +
    '<div class="detail-editor">' +
    '<input type="text" id="chapterTitle" placeholder="章节标题" class="title-input">' +
    '<div id="editor" contenteditable="true" class="editor-content"><p>开始写作...</p></div>' +
    '<div class="status-bar-bottom">' +
    '<span><span id="wordCount">0</span> 字</span>' +
    '<span id="saveStatus">已保存</span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
  pagesContainer.appendChild(pageDiv);
  
  initBookPage(tabId, bookId);
  switchToTab(tabId);
  
  var appContainer = document.querySelector('.app-container');
  if (appContainer) {
    appContainer.classList.add('editing-mode');
  }
}

function initBookPage(tabId, bookId) {
  var pageDiv = document.querySelector('.book-page[data-page="' + tabId + '"]');
  if (!pageDiv) return;
  
  currentBookId = bookId;
  var book = getCurrentBook();
  if (book && book.volumes && book.volumes.length > 0) {
    currentVolumeId = book.volumes[0].id;
    if (book.volumes[0].chapters && book.volumes[0].chapters.length > 0) {
      currentChapterId = book.volumes[0].chapters[0].id;
    }
  }
  
  function renderVolumes() {
    var container = pageDiv.querySelector('#volumeList');
    var book = getCurrentBook();
    if (!container || !book) return;
    container.innerHTML = '';
    if (!book.volumes || book.volumes.length === 0) {
      container.innerHTML = '<div style="padding:20px;text-align:center;opacity:0.6;">暂无分卷，点击"分卷"创建</div>';
      return;
    }
    for (var v = 0; v < book.volumes.length; v++) {
      var vol = book.volumes[v];
      var chapterCount = (vol.chapters ? vol.chapters.length : 0);
      var volDiv = document.createElement('div');
      volDiv.className = 'volume-item';
      volDiv.innerHTML = '<div class="volume-title">' +
        '<div class="volume-title-left">' +
        '<span>📁 ' + escapeHtml(vol.name || '未命名') + '</span>' +
        '<span class="volume-count">(' + chapterCount + '章)</span>' +
        '</div>' +
        '<button class="volume-more" data-id="' + vol.id + '">⋯</button>' +
        '</div>' +
        '<div class="chapter-list-inner" data-volume="' + vol.id + '"></div>';
      var chapterContainer = volDiv.querySelector('.chapter-list-inner');
      if (vol.chapters && vol.chapters.length > 0) {
        for (var c = 0; c < vol.chapters.length; c++) {
          var ch = vol.chapters[c];
          var chDiv = document.createElement('div');
          var isActive = (ch.id === currentChapterId && vol.id === currentVolumeId);
          chDiv.className = 'chapter-list-item';
          if (isActive) chDiv.className += ' active';
          chDiv.innerHTML = '<span>📄 ' + escapeHtml(ch.title || '无标题') + '</span><button class="delete-chapter" data-id="' + ch.id + '">✖</button>';
          
          var titleSpan = chDiv.querySelector('span');
          titleSpan.onclick = (function(volId, chId) {
            return function() {
              currentVolumeId = volId;
              currentChapterId = chId;
              renderVolumes();
              renderCurrentChapter();
            };
          })(vol.id, ch.id);
          
          var delBtn = chDiv.querySelector('.delete-chapter');
          delBtn.onclick = (function(volId, chId, chArray) {
            return function(e) {
              e.stopPropagation();
              if (chArray.length === 1) { alert('每个分卷至少保留一个章节'); return; }
              var newChapters = [];
              for (var i = 0; i < chArray.length; i++) {
                if (chArray[i].id !== chId) newChapters.push(chArray[i]);
              }
              vol.chapters = newChapters;
              if (currentChapterId === chId && currentVolumeId === volId) {
                currentChapterId = vol.chapters[0] ? vol.chapters[0].id : null;
              }
              renderVolumes();
              renderCurrentChapter();
              saveAllData();
              renderBooks();
            };
          })(vol.id, ch.id, vol.chapters);
          
          chapterContainer.appendChild(chDiv);
        }
      } else {
        chapterContainer.innerHTML = '<div style="padding:8px;opacity:0.6;font-size:12px;">暂无章节</div>';
      }
      
      var titleDiv = volDiv.querySelector('.volume-title');
      titleDiv.onclick = function(volId) {
        return function(e) {
          if (e.target.classList && e.target.classList.contains('volume-more')) return;
          if (e.target.tagName === 'BUTTON') return;
          currentVolumeId = volId;
          renderVolumes();
        };
      }(vol.id);
      
      var moreBtn = volDiv.querySelector('.volume-more');
      moreBtn.onclick = function(volId, bookObj) {
        return function(e) {
          e.stopPropagation();
          showVolumeMenu(volId, bookObj, function() {
            renderVolumes();
            saveAllData();
            renderBooks();
          });
        };
      }(vol.id, book);
      
      container.appendChild(volDiv);
    }
  }
  
  function showVolumeMenu(volId, bookObj, onClose) {
    var existingMenu = document.querySelector('.volume-menu');
    if (existingMenu) existingMenu.remove();
    var menu = document.createElement('div');
    menu.className = 'volume-menu';
    menu.innerHTML = '<button class="rename-volume">重命名</button><button class="delete-volume">删除分卷</button>';
    var rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    document.body.appendChild(menu);
    
    var renameBtn = menu.querySelector('.rename-volume');
    renameBtn.onclick = function() {
      var vol = null;
      for (var i = 0; i < bookObj.volumes.length; i++) {
        if (bookObj.volumes[i].id === volId) { vol = bookObj.volumes[i]; break; }
      }
      if (vol) {
        var newName = prompt('请输入新名称', vol.name);
        if (newName) { vol.name = newName; saveAllData(); renderBooks(); if(onClose) onClose(); }
      }
      menu.remove();
    };
    
    var deleteBtn = menu.querySelector('.delete-volume');
    deleteBtn.onclick = function() {
      if (bookObj.volumes.length === 1) { alert('至少保留一个分卷'); menu.remove(); return; }
      var newVolumes = [];
      for (var i = 0; i < bookObj.volumes.length; i++) {
        if (bookObj.volumes[i].id !== volId) newVolumes.push(bookObj.volumes[i]);
      }
      bookObj.volumes = newVolumes;
      if (currentVolumeId === volId) {
        currentVolumeId = bookObj.volumes[0] ? bookObj.volumes[0].id : null;
        currentChapterId = (bookObj.volumes[0] && bookObj.volumes[0].chapters && bookObj.volumes[0].chapters[0]) ? bookObj.volumes[0].chapters[0].id : null;
      }
      saveAllData();
      renderBooks();
      if(onClose) onClose();
      menu.remove();
    };
    
    setTimeout(function() {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) { if(menu.parentNode) menu.remove(); document.removeEventListener('click', closeMenu); }
      });
    }, 100);
  }
  
  function renderCurrentChapter() {
    var ch = getCurrentChapter();
    var titleInput = pageDiv.querySelector('#chapterTitle');
    var editor = pageDiv.querySelector('#editor');
    if (!ch) {
      if (titleInput) titleInput.value = '';
      if (editor) editor.innerHTML = '<p>请选择一个章节</p>';
      updateWordCount();
      return;
    }
    if (titleInput) titleInput.value = ch.title || '';
    if (editor) editor.innerHTML = ch.content || '<p></p>';
    updateWordCount();
  }
  
  function updateWordCount() {
    var ch = getCurrentChapter();
    var text = ch ? (ch.content || '').replace(/<[^>]*>/g, '') : '';
    var wcSpan = pageDiv.querySelector('#wordCount');
    if (wcSpan) wcSpan.innerText = text.length;
  }
  
  function saveCurrentChapter() {
    var ch = getCurrentChapter();
    if (!ch) return;
    var titleInput = pageDiv.querySelector('#chapterTitle');
    var editor = pageDiv.querySelector('#editor');
    if (titleInput) ch.title = titleInput.value;
    if (editor) ch.content = editor.innerHTML;
    ch.updatedTime = new Date().toISOString();
    renderVolumes();
    updateWordCount();
    saveAllData();
    renderBooks();
    var statusSpan = pageDiv.querySelector('#saveStatus');
    if (statusSpan) {
      statusSpan.textContent = '已保存';
      setTimeout(function() { 
        if (statusSpan.textContent === '已保存') statusSpan.textContent = '已同步'; 
      }, 2000);
    }
  }
  
  var addVolumeBtn = pageDiv.querySelector('#addVolumeBtn');
  if (addVolumeBtn) {
    addVolumeBtn.onclick = function() {
      var book = getCurrentBook();
      var volumeCount = book.volumes ? book.volumes.length : 0;
      var newNumber = volumeCount + 1;
      var volumeName = '第' + numberToChinese(newNumber) + '卷';
      
      var newChapter = new Chapter(Date.now(), '第一章', '<p></p>');
      var newVol = new Volume(Date.now(), volumeName, [newChapter]);
      if (!book.volumes) book.volumes = [];
      book.volumes.push(newVol);
      currentVolumeId = newVol.id;
      currentChapterId = newChapter.id;
      saveAllData();
      renderVolumes();
      renderCurrentChapter();
      renderBooks();
    };
  }
  
  var addChapterBtn = pageDiv.querySelector('#addChapterBtn');
  if (addChapterBtn) {
    addChapterBtn.onclick = function() {
      var vol = getCurrentVolume();
      if (!vol) { alert('请先创建分卷'); return; }
      
      var chapterCount = vol.chapters ? vol.chapters.length : 0;
      var newNumber = chapterCount + 1;
      var chapterName = '第' + numberToChinese(newNumber) + '章';
      
      var newCh = new Chapter(Date.now(), chapterName, '<p></p>');
      if (!vol.chapters) vol.chapters = [];
      vol.chapters.push(newCh);
      currentChapterId = newCh.id;
      saveAllData();
      renderVolumes();
      renderCurrentChapter();
      renderBooks();
    };
  }
  
  var titleInput = pageDiv.querySelector('#chapterTitle');
  var editor = pageDiv.querySelector('#editor');
  if (titleInput) titleInput.oninput = function() { saveCurrentChapter(); };
  if (editor) {
    editor.oninput = function() {
      updateWordCount();
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(saveCurrentChapter, 1000);
    };
  }
  
  var findBtn = pageDiv.querySelector('#findReplaceBtn');
  if (findBtn) {
    findBtn.onclick = function() { 
      openFindPanel(); 
    };
  }
  var formatBtn = pageDiv.querySelector('#formatBtn');
  if (formatBtn) {
    formatBtn.onclick = function() {
      var html = editor.innerHTML;
      html = html.replace(/<p><br><\/p>/g, '<p></p>');
      html = html.replace(/([。！？；])([^"'])/g, '$1<br>$2');
      editor.innerHTML = html;
      saveCurrentChapter();
    };
  }
  var fullscreenBtn = pageDiv.querySelector('#fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.onclick = function() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    };
  }
  var focusMode = false;
  var focusBtn = pageDiv.querySelector('#focusBtn');
  if (focusBtn) {
    focusBtn.onclick = function() {
      focusMode = !focusMode;
      if (focusMode) {
        editor.style.fontSize = '20px';
        var chaptersPanel = pageDiv.querySelector('#chaptersPanel');
        if (chaptersPanel) chaptersPanel.style.opacity = '0.3';
      } else {
        editor.style.fontSize = '';
        var chaptersPanel = pageDiv.querySelector('#chaptersPanel');
        if (chaptersPanel) chaptersPanel.style.opacity = '';
      }
    };
  }
  var importBtn = pageDiv.querySelector('#importBtn');
  if (importBtn) {
    importBtn.onclick = function() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(event) {
          var ch = getCurrentChapter();
          if (ch) {
            ch.content = '<p>' + escapeHtml(event.target.result).replace(/\n/g, '<br>') + '</p>';
            saveCurrentChapter();
            alert('导入成功！');
          }
        };
        reader.readAsText(file, 'UTF-8');
      };
      input.click();
    };
  }
  var exportBtn = pageDiv.querySelector('#exportBtn');
if (exportBtn) {
  exportBtn.onclick = function(e) {
    e.stopPropagation();
    console.log('导出按钮被点击');
    var panel = document.getElementById('exportPanel');
    if (panel) {
      panel.classList.add('open');
      console.log('导出面板打开');
    } else {
      console.log('找不到导出面板，请检查 exportPanel 元素是否存在');
    }
  };
}
  var styleBtn = pageDiv.querySelector('#styleBtn');
  if (styleBtn) {
    styleBtn.onclick = function() {
      var menu = document.getElementById('slideMenu');
      if (menu) menu.classList.toggle('open');
    };
  }
  
  var handle = pageDiv.querySelector('#resizeHandle');
  var panel = pageDiv.querySelector('#chaptersPanel');
  if (handle && panel) {
    var isResizing = false;
    handle.addEventListener('mousedown', function(e) {
      isResizing = true;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', function() {
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
      });
    });
    function onMouseMove(e) {
      if (!isResizing) return;
      var newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 500) newWidth = 500;
      panel.style.width = newWidth + 'px';
    }
  }
  
  renderVolumes();
  renderCurrentChapter();
}

function newBook() { 
  openNewBookDrawer();
}

// 页面切换函数 - 用于左侧菜单（新开标签页）
function switchPage(pageId) {
  console.log('切换到页面:', pageId);
  
  var pageTitles = {
    'stats': '码字统计',
    'settings': '软件设置',
    'about': '关于'
  };
  var title = pageTitles[pageId] || pageId;
  var tabId = 'page_' + pageId;
  
  for (var i = 0; i < openTabs.length; i++) {
    if (openTabs[i].id === tabId) {
      switchToTab(tabId);
      return;
    }
  }
  
  openPageTab(pageId, title, tabId);
}

function openPageTab(pageId, title, tabId) {
  openTabs.push({ id: tabId, title: title, type: 'page', pageId: pageId });
  renderTabs();
  
  var pagesContainer = document.getElementById('pagesContainer');
  var pageDiv = document.createElement('div');
  pageDiv.className = 'book-page';
  pageDiv.setAttribute('data-page', tabId);
  
  var sourcePage = document.getElementById(pageId + 'PageSource');
  if (sourcePage) {
    var clonedContent = sourcePage.cloneNode(true);
    clonedContent.style.display = 'block';
    pageDiv.appendChild(clonedContent);
  } else {
    pageDiv.innerHTML = '<div style="padding:20px;">页面内容加载中...</div>';
  }
  
  pagesContainer.appendChild(pageDiv);
  switchToTab(tabId);
}

// 创建页面源
function createPages() {
  var pagesContainer = document.getElementById('pagesContainer');
  if (!pagesContainer) {
    console.error('找不到 pagesContainer');
    return;
  }
  
  var existingPages = document.querySelectorAll('#statsPageSource, #settingsPageSource, #aboutPageSource');
  for (var i = 0; i < existingPages.length; i++) {
    if (existingPages[i].parentNode) existingPages[i].parentNode.removeChild(existingPages[i]);
  }
  
  var statsPageSource = document.createElement('div');
  statsPageSource.id = 'statsPageSource';
  statsPageSource.style.display = 'none';
  statsPageSource.innerHTML = '<div style="max-width: 900px; margin: 0 auto;">' +
    '<div class="stats-cards">' +
    '<div class="stat-card"><h3>今日</h3><p class="stat-number" id="todayWords">0</p></div>' +
    '<div class="stat-card"><h3>昨天</h3><p class="stat-number" id="yesterdayWords">0</p></div>' +
    '<div class="stat-card"><h3>本周</h3><p class="stat-number" id="weekWords">0</p></div>' +
    '<div class="stat-card"><h3>本月</h3><p class="stat-number" id="monthWords">0</p></div>' +
    '<div class="stat-card"><h3>总计</h3><p class="stat-number" id="totalWords">0</p></div>' +
    '</div>' +
    '<div class="calendar-container">' +
    '<div class="calendar-header">' +
    '<button id="prevMonthBtn">‹</button>' +
    '<h3 id="calendarMonth"></h3>' +
    '<button id="nextMonthBtn">›</button>' +
    '</div>' +
    '<div class="calendar-weekdays">' +
    '<span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>' +
    '</div>' +
    '<div id="calendarDays" class="calendar-days"></div>' +
    '</div>' +
    '<div class="writing-detail">' +
    '<h4 id="selectedDate">点击日期查看详情</h4>' +
    '<div id="writingDetailList" class="detail-list">' +
    '<div style="text-align:center; padding:20px; color:#888;">请点击日历中的日期</div>' +
    '</div>' +
    '</div>' +
    '<div class="goal-setting">' +
    '<h3>写作目标</h3>' +
    '<div style="margin: 8px 0;">' +
    '<label>每日目标 (字)</label>' +
    '<input type="number" id="dailyGoal" placeholder="2000" style="margin-left: 12px; padding: 4px 8px; width: 100px;">' +
    '<button id="setDailyGoal" class="small-btn" style="margin-left: 12px;">设置</button>' +
    '</div>' +
    '<div class="progress-bar"><div class="progress-fill"></div></div>' +
    '<p id="goalMessage"></p>' +
    '</div>' +
    '</div>';
  
  var settingsPageSource = document.createElement('div');
  settingsPageSource.id = 'settingsPageSource';
  settingsPageSource.style.display = 'none';
  settingsPageSource.innerHTML = '<div class="settings-container">' +
    '<div class="settings-item">' +
    '<h4>🔐 密码保护</h4>' +
    '<p style="font-size:12px; color:#888; margin-bottom:12px;">设置启动密码，保护您的作品隐私</p>' +
    '<button id="passwordSettingsBtn" class="small-btn" style="width:100%;">设置密码保护</button>' +
    '</div>' +
    '<div class="settings-item">' +
    '<h4>💾 备份策略</h4>' +
    '<label style="margin-right: 16px;"><input type="radio" name="backupType" value="auto" checked> 定时自动备份</label>' +
    '<label><input type="radio" name="backupType" value="manual"> 仅手动备份</label>' +
    '<div style="margin-top:12px;">' +
    '<button id="manualBackupBtn" class="small-btn">立即备份</button>' +
    '<button id="restoreBackupBtn" class="small-btn" style="margin-left: 8px;">恢复备份</button>' +
    '</div>' +
    '</div>' +
    '<div class="settings-item">' +
    '<h4>📂 备份文件位置</h4>' +
    '<p style="font-size:12px; color:#888; margin-bottom:12px;">设置备份文件保存的文件夹</p>' +
    '<button id="backupPathBtn" class="small-btn" style="width:100%;">设置备份路径</button>' +
    '</div>' +
    '<div class="settings-item">' +
    '<h4>📋 密保问题</h4>' +
    '<p style="font-size:12px; color:#888; margin-bottom:12px;">设置密保问题，用于找回密码</p>' +
    '<button id="securityQuestionsBtn" class="small-btn" style="width:100%;">设置密保问题</button>' +
    '</div>' +
    '</div>';
  
  var aboutPageSource = document.createElement('div');
  aboutPageSource.id = 'aboutPageSource';
  aboutPageSource.style.display = 'none';
  aboutPageSource.innerHTML = '<div class="about-content">' +
    '<h2>写作帮手</h2>' +
    '<p><strong>自由的写作软件</strong></p>' +
    '<p>版本 0.0.1 Beta 测试版</p>' +
    '<p>GitHub: <a href="https://github.com/likeweixue/word" target="_blank">github.com/likeweixue/word</a></p>' +
    '</div>';
  
  pagesContainer.appendChild(statsPageSource);
  pagesContainer.appendChild(settingsPageSource);
  pagesContainer.appendChild(aboutPageSource);
  
  console.log('页面源创建完成');
}

function ensureHomePage() {
  var homePage = document.querySelector('.book-page[data-page="home"]');
  if (!homePage) {
    var pagesContainer = document.getElementById('pagesContainer');
    var homeDiv = document.createElement('div');
    homeDiv.className = 'book-page';
    homeDiv.setAttribute('data-page', 'home');
    homeDiv.innerHTML = '<div class="books-header" style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.1);">' +
      '<h2 style="margin:0;">我的书籍</h2>' +
      '<button id="newBookBtn" class="primary-btn">+ 新建书籍</button>' +
      '</div>' +
      '<div id="booksContainer" class="books-container"></div>';
    pagesContainer.appendChild(homeDiv);
  }
}

function loadAllData() {
  var raw = localStorage.getItem('wps_data');
  if (!raw) { 
    var sampleChapter = new Chapter(Date.now(), '第一章', '<p>这里是属于斗气的世界...</p>');
    var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
    var sampleBook = new Book(Date.now(), '斗破苍穹', [sampleVolume]);
    books = [sampleBook]; 
    saveAllData(); 
  } else { 
    try { 
      var d = JSON.parse(raw); 
      books = d.books || []; 
      settings = { theme: 'default', showGrid: false, fontFamily: 'system-ui', lineHeight: '1.8' };
      if (d.settings) {
        for (var key in d.settings) {
          if (d.settings.hasOwnProperty(key)) settings[key] = d.settings[key];
        }
      }
      if (books.length === 0) {
        var sampleChapter = new Chapter(Date.now(), '第一章', '<p>开始写作...</p>');
        var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
        var sampleBook = new Book(Date.now(), '我的作品', [sampleVolume]);
        books = [sampleBook];
      }
    } catch(e) { console.error(e); }
  }
  applyTheme(settings.theme);
  applyGridLine(settings.showGrid);
  applyFontFamily(settings.fontFamily);
  applyLineHeight(settings.lineHeight);
  renderBooks();
  
  setTimeout(function() {
    var prevBtn = document.getElementById('prevMonthBtn');
    var nextBtn = document.getElementById('nextMonthBtn');
    if (prevBtn) prevBtn.onclick = function() { prevMonth(); renderCalendar(); };
    if (nextBtn) nextBtn.onclick = function() { nextMonth(); renderCalendar(); };
  }, 100);
}

function bindEvents() {
  var menuItems = document.querySelectorAll('.menu-item');
  for (var i = 0; i < menuItems.length; i++) {
    menuItems[i].onclick = (function(page) {
      return function() { 
        if (page === 'books') {
          switchToTab('home');
        } else {
          switchPage(page);
        }
      };
    })(menuItems[i].getAttribute('data-page'));
  }
  
  var newBookBtn = document.getElementById('newBookBtn');
  if (newBookBtn) newBookBtn.onclick = function() { openNewBookDrawer(); };
  
  var closeDrawerBtn = document.getElementById('closeDrawerBtn');
  if (closeDrawerBtn) closeDrawerBtn.onclick = function() { closeNewBookDrawer(); };
  
  var confirmNewBookBtn = document.getElementById('confirmNewBookBtn');
  if (confirmNewBookBtn) confirmNewBookBtn.onclick = function() { createNewBook(); };
  
  var setDailyGoalBtn = document.getElementById('setDailyGoal');
  if (setDailyGoalBtn) {
    setDailyGoalBtn.onclick = function() { 
      var v = document.getElementById('dailyGoal').value; 
      if (v) localStorage.setItem('dailyGoal', v); 
      updateStats(); 
    };
  }
  
  var manualBackupBtn = document.getElementById('manualBackupBtn');
  if (manualBackupBtn) manualBackupBtn.onclick = manualBackup;
  var restoreBackupBtn = document.getElementById('restoreBackupBtn');
  if (restoreBackupBtn) restoreBackupBtn.onclick = restoreBackup;
  
  var closeSlideMenu = document.getElementById('closeSlideMenu');
  if (closeSlideMenu) closeSlideMenu.onclick = function() { 
    var menu = document.getElementById('slideMenu');
    if (menu) menu.classList.remove('open');
  };
  var closeExportPanel = document.getElementById('closeExportPanel');
  if (closeExportPanel) closeExportPanel.onclick = function() { 
    var panel = document.getElementById('exportPanel');
    if (panel) panel.classList.remove('open');
  };
  var closeFindPanel = document.getElementById('closeFindPanel');
  if (closeFindPanel) closeFindPanel.onclick = function() { 
    var panel = document.getElementById('findPanel');
    if (panel) panel.classList.remove('open');
  };
  
var exportChapterBtn = document.getElementById('exportChapterBtn');
if (exportChapterBtn) {
  exportChapterBtn.onclick = function() {
    console.log('导出章节按钮被点击');
    var ch = getCurrentChapter();
    if (ch) {
      var content = (ch.title || '无标题') + '\n\n' + (ch.content || '').replace(/<[^>]*>/g, '');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([content], {type: 'text/plain'}));
      a.download = (ch.title || '章节') + '.txt';
      a.click();
      console.log('章节导出成功');
    } else {
      alert('没有找到当前章节');
    }
    var panel = document.getElementById('exportPanel');
    if (panel) panel.classList.remove('open');
  };
}

var exportBookBtn = document.getElementById('exportBookBtn');
if (exportBookBtn) {
  exportBookBtn.onclick = function() {
    console.log('导出全书按钮被点击');
    var book = getCurrentBook();
    if (book) {
      var c = '【' + (book.title || '未命名') + '】\n\n';
      if (book.volumes) {
        for (var v = 0; v < book.volumes.length; v++) {
          var vol = book.volumes[v];
          if (vol) {
            c += '\n' + '='.repeat(40) + '\n【' + (vol.name || '未命名') + '】\n' + '='.repeat(40) + '\n';
            if (vol.chapters) {
              for (var ch = 0; ch < vol.chapters.length; ch++) {
                var chapter = vol.chapters[ch];
                if (chapter) c += '\n' + (chapter.title || '无标题') + '\n' + '-'.repeat(30) + '\n' + (chapter.content || '').replace(/<[^>]*>/g, '') + '\n';
              }
            }
          }
        }
      }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([c], {type: 'text/plain'}));
      a.download = (book.title || '书籍') + '.txt';
      a.click();
      console.log('全书导出成功');
    } else {
      alert('没有找到当前书籍');
    }
    var panel = document.getElementById('exportPanel');
    if (panel) panel.classList.remove('open');
  };
}
  
  var findNextBtn = document.getElementById('findNextBtn');
  if (findNextBtn) {
    findNextBtn.onclick = function() {
      var editor = document.getElementById('editor');
      if (!editor) return;
      var findText = document.getElementById('findText').value;
      if (!findText) return;
      var text = editor.innerText;
      var index = text.indexOf(findText);
      if (index !== -1) {
        alert('找到 "' + findText + '"');
      } else {
        alert('未找到');
      }
    };
  }
  var replaceBtn = document.getElementById('replaceBtn');
  if (replaceBtn) {
    replaceBtn.onclick = function() {
      var editor = document.getElementById('editor');
      if (!editor) return;
      var findText = document.getElementById('findText').value;
      var replaceText = document.getElementById('replaceText').value;
      if (!findText) return;
      var newContent = editor.innerHTML.replace(new RegExp(findText, 'g'), replaceText);
      editor.innerHTML = newContent;
      if (typeof window.saveCurrentChapter === 'function') window.saveCurrentChapter();
      alert('替换完成');
    };
  }
  var replaceAllBtn = document.getElementById('replaceAllBtn');
  if (replaceAllBtn) {
    replaceAllBtn.onclick = function() {
      var editor = document.getElementById('editor');
      if (!editor) return;
      var findText = document.getElementById('findText').value;
      var replaceText = document.getElementById('replaceText').value;
      if (!findText) return;
      var newContent = editor.innerHTML.replace(new RegExp(findText, 'g'), replaceText);
      editor.innerHTML = newContent;
      if (typeof window.saveCurrentChapter === 'function') window.saveCurrentChapter();
      alert('全部替换完成');
    };
  }
  
  var colorPresets = document.querySelectorAll('.color-preset');
  for (var i = 0; i < colorPresets.length; i++) {
    colorPresets[i].onclick = function() { applyTheme(this.dataset.theme); };
  }
  var fontOptions = document.querySelectorAll('.font-option');
  for (var i = 0; i < fontOptions.length; i++) {
    fontOptions[i].onclick = function() { applyFontFamily(this.dataset.font); };
  }
  
  var gridCheck = document.getElementById('gridLinesCheckbox');
  if (gridCheck) { 
    gridCheck.checked = settings.showGrid; 
    gridCheck.onchange = function(e) { applyGridLine(e.target.checked); };
  }
  
  var lineSelect = document.getElementById('lineHeightSelect');
  if (lineSelect) { 
    lineSelect.value = settings.lineHeight; 
    lineSelect.onchange = function(e) { applyLineHeight(e.target.value); };
  }
  
  var pwdCheck = document.getElementById('passwordProtect');
  if (pwdCheck) {
    pwdCheck.checked = false;
    pwdCheck.onchange = function(e) {
      var setupDiv = document.getElementById('passwordSetup');
      if (setupDiv) setupDiv.style.display = e.target.checked ? 'block' : 'none';
    };
  }
  var savePwdBtn = document.getElementById('savePasswordBtn');
  if (savePwdBtn) {
    savePwdBtn.onclick = function() {
      var pwd = document.getElementById('appPassword').value;
      if (pwd) {
        settings.appPassword = pwd;
        settings.passwordProtect = true;
        saveAllData();
        alert('密码已设置');
      }
    };
  }
  
  var autoRadio = document.querySelector('input[value="auto"]');
  var manualRadio = document.querySelector('input[value="manual"]');
  if (autoRadio && manualRadio) {
    if (settings.backupType === 'auto') autoRadio.checked = true;
    else manualRadio.checked = true;
    autoRadio.onchange = function() { settings.backupType = 'auto'; saveAllData(); };
    manualRadio.onchange = function() { settings.backupType = 'manual'; saveAllData(); };
  }
  
  var passwordSettingsBtn = document.getElementById('passwordSettingsBtn');
  if (passwordSettingsBtn) {
    passwordSettingsBtn.onclick = function() { showPasswordSetupModal(); };
  }
  var securityQuestionsBtn = document.getElementById('securityQuestionsBtn');
  if (securityQuestionsBtn) {
    securityQuestionsBtn.onclick = function() { showSecurityQuestionsModal(); };
  }
  var backupPathBtn = document.getElementById('backupPathBtn');
  if (backupPathBtn) {
    backupPathBtn.onclick = function() { showBackupPathSettings(); };
  }
  
  // 窗口控制
  var closeWinBtn = document.querySelector('.window-btn.close');
  if (closeWinBtn) {
    closeWinBtn.onclick = function() {
      if (confirm('确定要退出吗？')) {
        window.close();
      }
    };
  }
}

window.saveCurrentChapter = function() {
  var ch = getCurrentChapter();
  if (!ch) return;
  var titleInput = document.getElementById('chapterTitle');
  var editor = document.getElementById('editor');
  if (titleInput) ch.title = titleInput.value;
  if (editor) ch.content = editor.innerHTML;
  ch.updatedTime = new Date().toISOString();
  saveAllData();
  renderBooks();
};

// 初始化
ensureHomePage();
createPages();
loadAllData();
bindEvents();
renderTabs();
switchToTab('home');