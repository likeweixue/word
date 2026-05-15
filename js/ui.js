// ========== UI 渲染和页面切换 ==========

function renderTabs() {
    var container = document.getElementById('tabsContainer');
    if (!container) return;
    container.innerHTML = '';
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
    newBtn.id = 'newTabBtn';
    newBtn.innerHTML = '+';
    container.appendChild(newBtn);
    
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function(e) {
            if (e.target.classList && e.target.classList.contains('tab-close')) return;
            switchToTab(this.getAttribute('data-tab'));
        };
        var closeBtn = tabs[i].querySelector('.tab-close');
        if (closeBtn) {
            closeBtn.onclick = function(e) {
                e.stopPropagation();
                closeTab(this.getAttribute('data-id'));
            };
        }
    }
    document.getElementById('newTabBtn').onclick = function() { switchToTab('home'); };
}

function switchToTab(tabId) {
    activeTabId = tabId;
    renderTabs();
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    var targetPage = document.querySelector('.page[data-page="' + tabId + '"]');
    if (targetPage) {
        targetPage.classList.add('active');
    } else if (tabId.indexOf('book_') === 0) {
        var bookPage = document.querySelector('.page[data-page="' + tabId + '"]');
        if (bookPage) bookPage.classList.add('active');
    }
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) {
        sidebar.style.display = (tabId === 'home') ? 'flex' : 'none';
    }
    // 关闭所有右侧面板
    closeAllRightPanels();
}

function closeTab(tabId) {
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { openTabs.splice(i, 1); break; }
    }
    var page = document.querySelector('.page[data-page="' + tabId + '"]');
    if (page) page.remove();
    if (activeTabId === tabId) {
        activeTabId = openTabs.length > 0 ? openTabs[openTabs.length - 1].id : 'home';
    }
    renderTabs();
    var activePage = document.querySelector('.page[data-page="' + activeTabId + '"]');
    if (activePage) activePage.classList.add('active');
    var sidebar = document.querySelector('.sidebar-menu');
    if (sidebar) {
        sidebar.style.display = (activeTabId === 'home') ? 'flex' : 'none';
    }
    closeAllRightPanels();
}

function switchPage(pageId) {
    var titles = { stats: '数据', settings: '设置', about: '关于', jianghu: '江湖', xuefu: '学府' };
    var title = titles[pageId] || pageId;
    var tabId = 'page_' + pageId;
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { switchToTab(tabId); return; }
    }
    openTabs.push({ id: tabId, title: title, type: 'page', pageId: pageId });
    renderTabs();
    var pageDiv = document.querySelector('.page[data-page="' + pageId + '"]');
    if (pageDiv) {
        var clone = pageDiv.cloneNode(true);
        clone.setAttribute('data-page', tabId);
        clone.id = '';
        document.getElementById('pagesContainer').appendChild(clone);
        switchToTab(tabId);
        if (pageId === 'settings') loadSettingsPage();
        if (pageId === 'jianghu') renderJianghuContent();
        if (pageId === 'xuefu') renderXuefuContent();
        if (pageId === 'stats') updateStats();
    }
}

function closeAllRightPanels() {
    var panels = document.querySelectorAll('.right-slide-panel.open, .right-panel.open');
    for (var i = 0; i < panels.length; i++) {
        panels[i].classList.remove('open');
    }
    var rightSidebar = document.getElementById('rightSidebar');
    if (rightSidebar) {
        rightSidebar.classList.add('hidden');
    }
    var themePanel = document.getElementById('themeSlidePanel');
    if (themePanel) themePanel.classList.remove('open');
    var fontPanel = document.getElementById('fontSlidePanel');
    if (fontPanel) fontPanel.classList.remove('open');
    var findPanel = document.getElementById('findSlidePanel');
    if (findPanel) findPanel.classList.remove('open');
    var exportPanel = document.getElementById('exportSlidePanel');
    if (exportPanel) exportPanel.classList.remove('open');
    var seclusionPanel = document.getElementById('seclusionSlidePanel');
    if (seclusionPanel) seclusionPanel.classList.remove('open');
}

function loadSettingsPage() {
    if (typeof renderSettingsPage === 'function') renderSettingsPage();
}
