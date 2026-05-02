// UI 渲染函数
function escapeHtml(t) { 
  if (!t) return ''; 
  var d = document.createElement('div'); 
  d.textContent = t; 
  return d.innerHTML; 
}

function renderBooks() {
  var container = document.getElementById('booksContainer');
  if (!container) return;
  if (!books || books.length === 0) {
    container.innerHTML = '<div style="padding:40px;text-align:center;opacity:0.6;">暂无书籍，点击"新建书籍"开始创作</div>';
    return;
  }
  container.innerHTML = '<div class="books-grid" id="booksGridInner"></div>';
  var grid = document.getElementById('booksGridInner');
  for (var i = 0; i < books.length; i++) {
    var book = books[i];
    if (!book) continue;
    var totalWords = 0, totalChapters = 0;
    if (book.volumes) {
      for (var j = 0; j < book.volumes.length; j++) {
        var v = book.volumes[j];
        if (v && v.chapters) {
          totalChapters += v.chapters.length;
          for (var k = 0; k < v.chapters.length; k++) {
            var c = v.chapters[k];
            if (c && c.content) totalWords += c.content.replace(/<[^>]*>/g, '').length;
          }
        }
      }
    }
    var card = document.createElement('div');
    card.className = 'book-card';
    card.onclick = (function(id) { return function() { window.openBookTab(id); }; })(book.id);
    card.innerHTML = '<div class="book-cover-gray">' +
      '<div class="book-cover-icon">📖</div>' +
      '<div class="book-cover-title">' + escapeHtml(book.title || '未命名') + '</div>' +
      '<div class="book-stats-gray">' + (book.volumes ? book.volumes.length : 0) + '卷 · ' + totalChapters + '章 · ' + totalWords + '字</div>' +
      '</div>' +
      '<div class="book-info-gray">' +
      '<div class="book-title-gray">' + escapeHtml(book.title || '未命名') + '</div>' +
      '</div>';
    grid.appendChild(card);
  }
}

function renderTabs() {
  var container = document.getElementById('tabsContainer');
  if (!container) return;
  container.innerHTML = '';
  
  // 添加窗口控制按钮组
  var winControls = document.createElement('div');
  winControls.className = 'window-controls';
  winControls.innerHTML = '<div class="window-btn close" title="关闭"></div>' +
    '<div class="window-btn minimize" title="最小化"></div>' +
    '<div class="window-btn maximize" title="最大化"></div>';
  container.appendChild(winControls);
  
  for (var i = 0; i < openTabs.length; i++) {
    var tab = openTabs[i];
    var tabEl = document.createElement('div');
    tabEl.className = 'tab';
    if (tab.id === activeTabId) tabEl.classList.add('active');
    tabEl.setAttribute('data-tab', tab.id);
    
    tabEl.innerHTML = '<span class="tab-title">' + escapeHtml(tab.title) + '</span>';
    
    if (tab.type !== 'home') {
      var closeSpan = document.createElement('span');
      closeSpan.className = 'tab-close';
      closeSpan.setAttribute('data-id', tab.id);
      closeSpan.innerHTML = '×';
      tabEl.appendChild(closeSpan);
    }
    container.appendChild(tabEl);
  }
  
  var newBtn = document.createElement('button');
  newBtn.className = 'new-tab-btn';
  newBtn.innerHTML = '+';
  newBtn.id = 'newTabBtn';
  container.appendChild(newBtn);
  
  // 绑定标签事件
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) {
    var tab = tabs[i];
    tab.addEventListener('click', function(e) {
      if (e.target.classList.contains('tab-close')) return;
      var tabId = this.getAttribute('data-tab');
      window.switchToTab(tabId);
    });
    var closeBtn = tab.querySelector('.tab-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        window.closeTab(id);
      });
    }
  }
  
  var newTabBtn = document.getElementById('newTabBtn');
  if (newTabBtn) {
    newTabBtn.onclick = function() { 
      window.switchToTab('home'); 
    };
  }
  
  // 绑定窗口控制按钮事件
  var closeWinBtn = document.querySelector('.window-btn.close');
  if (closeWinBtn) {
    closeWinBtn.onclick = function() {
      if (confirm('确定要退出吗？')) {
        window.close();
      }
    };
  }
  
  var minimizeBtn = document.querySelector('.window-btn.minimize');
  if (minimizeBtn) {
    minimizeBtn.onclick = function() {
      console.log('最小化');
    };
  }
  
  var maximizeBtn = document.querySelector('.window-btn.maximize');
  if (maximizeBtn) {
    maximizeBtn.onclick = function() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };
  }
}

function switchToTab(tabId) {
  activeTabId = tabId;
  renderTabs();
  
  var bookPages = document.querySelectorAll('.book-page');
  for (var i = 0; i < bookPages.length; i++) {
    bookPages[i].classList.remove('active');
  }
  
  var targetPage = document.querySelector('.book-page[data-page="' + tabId + '"]');
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  var appContainer = document.querySelector('.app-container');
  if (tabId !== 'home' && tabId.indexOf('book_') === 0) {
    appContainer.classList.add('editing-mode');
  } else {
    appContainer.classList.remove('editing-mode');
  }
}

function closeTab(tabId) {
  var index = -1;
  for (var i = 0; i < openTabs.length; i++) {
    if (openTabs[i].id === tabId) {
      index = i;
      break;
    }
  }
  if (index !== -1) openTabs.splice(index, 1);
  
  var pageToRemove = document.querySelector('.book-page[data-page="' + tabId + '"]');
  if (pageToRemove) pageToRemove.remove();
  
  if (activeTabId === tabId) {
    var newActive = openTabs.length > 0 ? openTabs[openTabs.length - 1] : null;
    activeTabId = newActive ? newActive.id : 'home';
  }
  renderTabs();
  
  var activePage = document.querySelector('.book-page[data-page="' + activeTabId + '"]');
  if (activePage) activePage.classList.add('active');
  
  var appContainer = document.querySelector('.app-container');
  if (activeTabId === 'home' || (activeTabId && activeTabId.indexOf('page_') === 0)) {
    appContainer.classList.remove('editing-mode');
  } else {
    appContainer.classList.add('editing-mode');
  }
}