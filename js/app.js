// ========== 应用主入口 ==========

function init() {
    loadAllData();
    bindMenuEvents();
    bindButtons();
    renderTabs();
    renderBooks();
    switchToTab('home');
    loadSettings();
    initEditorToolbar();
}

function loadAllData() {
    var raw = localStorage.getItem('wps_data');
    if (!raw) {
        var sampleChapter = new Chapter(Date.now(), '第一章', '<p>这里是一个开始...</p>');
        var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
        var sampleBook = new Book(Date.now(), '我的作品', [sampleVolume]);
        books = [sampleBook];
        saveAllData();
    } else {
        try {
            var d = JSON.parse(raw);
            books = d.books || [];
            if (books.length === 0) {
                var sampleChapter = new Chapter(Date.now(), '第一章', '<p>开始写作...</p>');
                var sampleVolume = new Volume(Date.now(), '第一卷', [sampleChapter]);
                var sampleBook = new Book(Date.now(), '我的作品', [sampleVolume]);
                books = [sampleBook];
                saveAllData();
            }
        } catch(e) { console.error(e); }
    }
    loadGroups();
    loadTrash();
    var savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) applyTheme(savedTheme);
}

function bindMenuEvents() {
    var menuItems = document.querySelectorAll('.menu-item');
    for (var i = 0; i < menuItems.length; i++) {
        menuItems[i].onclick = (function(page) {
            return function() {
                if (page === 'books') {
                    switchToTab('home');
                } else {
                    switchPage(page);
                }
                var allItems = document.querySelectorAll('.menu-item');
                for (var j = 0; j < allItems.length; j++) {
                    allItems[j].classList.remove('active');
                }
                this.classList.add('active');
                updateSidebarVisibility();
            };
        })(menuItems[i].getAttribute('data-page'));
    }
}

function updateSidebarVisibility() {
    var sidebar = document.querySelector('.sidebar-menu');
    var isEditing = document.querySelector('.book-detail-page') !== null;
    if (isEditing) {
        sidebar.style.display = 'none';
    } else {
        sidebar.style.display = 'flex';
    }
}

function bindButtons() {
    var newBookBtn = document.getElementById('newBookBtn');
    var newGroupBtn = document.getElementById('newGroupBtn');
    var trashBtn = document.getElementById('trashBtn');
    var closeBookDrawer = document.getElementById('closeBookDrawer');
    var confirmNewBook = document.getElementById('confirmNewBookBtn');
    var closeGroupDrawer = document.getElementById('closeGroupDrawer');
    var confirmNewGroup = document.getElementById('confirmNewGroupBtn');
    if (newBookBtn) newBookBtn.onclick = function() { openDrawer('newBookDrawer'); };
    if (newGroupBtn) newGroupBtn.onclick = function() { openDrawer('newGroupDrawer'); };
    if (trashBtn) trashBtn.onclick = function() { openTrashTab(); };
    if (closeBookDrawer) closeBookDrawer.onclick = function() { closeDrawer('newBookDrawer'); };
    if (confirmNewBook) confirmNewBook.onclick = createNewBook;
    if (closeGroupDrawer) closeGroupDrawer.onclick = function() { closeDrawer('newGroupDrawer'); };
    if (confirmNewGroup) confirmNewGroup.onclick = createNewGroup;
}

function openDrawer(id) {
    var drawer = document.getElementById(id);
    if (drawer) drawer.classList.add('open');
}
function closeDrawer(id) {
    var drawer = document.getElementById(id);
    if (drawer) drawer.classList.remove('open');
}

function createNewBook() {
    var nameInput = document.getElementById('newBookName');
    var name = nameInput ? nameInput.value.trim() : '';
    if (!name) { alert('请输入书籍名称'); return; }
    var defaultGroup = groups.find(function(g) { return g.name === '默认分组'; });
    var groupId = defaultGroup ? defaultGroup.id : 'default';
    var newChapter = new Chapter(Date.now(), '第一章', '<p></p>');
    var newVolume = new Volume(Date.now(), '第一卷', [newChapter]);
    var newBook = new Book(Date.now(), name, [newVolume]);
    newBook.groupId = groupId;
    books.push(newBook);
    saveAllData();
    renderBooks();
    closeDrawer('newBookDrawer');
    openBookTab(newBook.id);
    nameInput.value = '';
}

function createNewGroup() {
    var nameInput = document.getElementById('newGroupName');
    var name = nameInput ? nameInput.value.trim() : '';
    if (!name) { alert('请输入分组名称'); return; }
    groups.push({ id: Date.now().toString(), name: name });
    saveGroups();
    renderBooks();
    closeDrawer('newGroupDrawer');
    nameInput.value = '';
    alert('分组创建成功');
}

function openTrashTab() {
    var tabId = 'trash';
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) { switchToTab(tabId); return; }
    }
    openTabs.push({ id: tabId, title: '回收站', type: 'trash' });
    renderTabs();
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.innerHTML = '<div style="padding:20px;"><h2>回收站</h2><div id="trashList"></div></div>';
    pagesContainer.appendChild(pageDiv);
    renderTrashList();
    switchToTab(tabId);
}

function renderTrashList() {
    var container = document.getElementById('trashList');
    if (!container) return;
    if (!trashBooks || trashBooks.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">回收站为空</div>';
        return;
    }
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">';
    for (var i = 0; i < trashBooks.length; i++) {
        var book = trashBooks[i];
        html += '<div style="background:#fff;border-radius:8px;padding:16px;text-align:center;"><div style="font-size:48px;"></div><div style="font-weight:bold;">' + escapeHtml(book.title) + '</div><div style="font-size:12px;color:#888;">' + new Date(book.deletedTime).toLocaleDateString() + '</div><div style="margin-top:12px;"><button class="restore-book" data-id="' + book.id + '" style="padding:4px 12px;background:#28a745;color:white;border:none;border-radius:4px;">恢复</button><button class="permanent-delete" data-id="' + book.id + '" style="padding:4px 12px;background:#dc3545;color:white;border:none;border-radius:4px;">永久删除</button></div></div>';
    }
    html += '</div>';
    container.innerHTML = html;
    var restoreBtns = document.querySelectorAll('.restore-book');
    for (var i = 0; i < restoreBtns.length; i++) {
        restoreBtns[i].onclick = function() {
            var id = parseInt(this.getAttribute('data-id'));
            var restored = restoreFromTrash(id);
            if (restored) { renderBooks(); renderTrashList(); alert('书籍已恢复'); }
        };
    }
    var deleteBtns = document.querySelectorAll('.permanent-delete');
    for (var i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].onclick = function() {
            if (confirm('确定永久删除吗？')) {
                var id = parseInt(this.getAttribute('data-id'));
                permanentDeleteBook(id);
                renderTrashList();
                alert('已永久删除');
            }
        };
    }
}

function updateStats() {
    var today = 0, week = 0, month = 0, total = 0;
    var now = new Date();
    var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var weekStart = todayStart - 6 * 86400000;
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    for (var i = 0; i < books.length; i++) {
        var book = books[i];
        if (book && book.volumes) {
            for (var j = 0; j < book.volumes.length; j++) {
                var vol = book.volumes[j];
                if (vol && vol.chapters) {
                    for (var k = 0; k < vol.chapters.length; k++) {
                        var ch = vol.chapters[k];
                        if (ch && ch.content) {
                            var words = ch.content.replace(/<[^>]*>/g, '').length;
                            var t = new Date(ch.updatedTime || ch.createdTime).getTime();
                            total += words;
                            if (t >= todayStart) today += words;
                            if (t >= weekStart) week += words;
                            if (t >= monthStart) month += words;
                        }
                    }
                }
            }
        }
    }
    var todayEl = document.getElementById('todayWords');
    var weekEl = document.getElementById('weekWords');
    var monthEl = document.getElementById('monthWords');
    var totalEl = document.getElementById('totalWords');
    if (todayEl) todayEl.innerText = today;
    if (weekEl) weekEl.innerText = week;
    if (monthEl) monthEl.innerText = month;
    if (totalEl) totalEl.innerText = total;
}

function initEditorToolbar() {}

window.openBookTab = openBookTab;
window.saveCurrentChapter = saveCurrentChapter;

// 江湖按钮加载
setTimeout(function() {
    var jianghuBtn = document.querySelector('.menu-item[data-page="jianghu"]');
    if (jianghuBtn) {
        jianghuBtn.onclick = function(e) {
            e.stopPropagation();
            var allPages = document.querySelectorAll('.page');
            for (var i = 0; i < allPages.length; i++) {
                allPages[i].classList.remove('active');
            }
            var jianghuPage = document.querySelector('.page[data-page="jianghu"]');
            if (jianghuPage) jianghuPage.classList.add('active');
            if (typeof loadJianghuPageContent === 'function') {
                loadJianghuPageContent();
            }
            var menuItems = document.querySelectorAll('.menu-item');
            for (var i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }
            this.classList.add('active');
        };
    }
}, 500);

init();

// 切换到数据页面（内部显示）
function switchToStatsPage() {
    // 创建或获取 stats 标签页
    var tabId = 'page_stats';
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) {
            switchToTab(tabId);
            return;
        }
    }
    
    // 创建新标签页
    openTabs.push({ id: tabId, title: '数据看板', type: 'page', pageId: 'stats' });
    renderTabs();
    
    // 创建页面容器
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.style.overflow = 'auto';
    pageDiv.style.padding = '0';
    pageDiv.style.background = '#e9e3d7';
    
    // 加载 stats.html 的内容
    fetch('stats.html')
        .then(function(res) { return res.text(); })
        .then(function(html) {
            // 提取 body 内的内容
            var match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (match) {
                pageDiv.innerHTML = match[1];
            } else {
                pageDiv.innerHTML = html;
            }
            // 重新执行脚本
            var scripts = pageDiv.querySelectorAll('script');
            for (var i = 0; i < scripts.length; i++) {
                var newScript = document.createElement('script');
                newScript.textContent = scripts[i].textContent;
                document.body.appendChild(newScript);
            }
        })
        .catch(function(err) {
            pageDiv.innerHTML = '<div style="padding:40px;text-align:center;">加载失败，请刷新重试</div>';
        });
    
    pagesContainer.appendChild(pageDiv);
    switchToTab(tabId);
}

// 切换到数据页面（内部显示 - 修复版）
function switchToStatsPage() {
    var tabId = 'page_stats';
    
    // 检查是否已经打开
    for (var i = 0; i < openTabs.length; i++) {
        if (openTabs[i].id === tabId) {
            switchToTab(tabId);
            // 刷新内容
            loadStatsContent();
            return;
        }
    }
    
    // 创建新标签页
    openTabs.push({ id: tabId, title: '数据看板', type: 'page', pageId: 'stats' });
    renderTabs();
    
    // 创建页面容器
    var pagesContainer = document.getElementById('pagesContainer');
    var pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.setAttribute('data-page', tabId);
    pageDiv.style.overflow = 'auto';
    pageDiv.style.padding = '0';
    pageDiv.style.background = '#e9e3d7';
    pageDiv.id = 'statsPageContent';
    pagesContainer.appendChild(pageDiv);
    
    // 加载内容
    loadStatsContentViaIframe(pageDiv);
    switchToTab(tabId);
}

function loadStatsContent() {
    var container = document.getElementById('statsPageContent');
    if (!container) {
        // 尝试找到 stats 页面
        var statsPage = document.querySelector('.page[data-page="page_stats"]');
        if (statsPage) {
            loadStatsContentViaIframe(statsPage);
        }
        return;
    }
    loadStatsContentViaIframe(container);
}

function loadStatsContentViaIframe(element) {
    element.innerHTML = '<div style="padding:40px;text-align:center;">加载中...</div>';
    
    fetch('stats.html')
        .then(function(res) { return res.text(); })
        .then(function(html) {
            // 提取 body 内的内容
            var match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (match) {
                element.innerHTML = match[1];
            } else {
                element.innerHTML = html;
            }
            // 重新执行脚本（用 eval 或创建新 script 标签）
            var scripts = element.querySelectorAll('script');
            for (var i = 0; i < scripts.length; i++) {
                var newScript = document.createElement('script');
                newScript.textContent = scripts[i].textContent;
                document.head.appendChild(newScript);
            }
        })
        .catch(function(err) {
            element.innerHTML = '<div style="padding:40px;text-align:center;">加载失败，请刷新重试<br>' + err.message + '</div>';
        });
}

// 在页面切换时也尝试加载
var originalSwitchToTab = window.switchToTab;
if (originalSwitchToTab) {
    window.switchToTab = function(tabId) {
        originalSwitchToTab(tabId);
        if (tabId === 'page_stats') {
            setTimeout(loadStatsContent, 100);
        }
    };
}

// 直接嵌入 stats 页面内容（不用 fetch）
function loadStatsContentDirect() {
    var container = document.getElementById('statsEmbedded');
    if (!container) {
        // 尝试找到 stats 页面容器
        var statsPage = document.querySelector('.page[data-page="page_stats"]');
        if (statsPage) {
            container = statsPage;
            container.id = 'statsEmbedded';
        } else {
            var statsDiv = document.querySelector('.page[data-page="stats"]');
            if (statsDiv) {
                container = statsDiv;
            }
        }
    }
    if (!container) return;
    
    // 直接显示 stats.html 内容（硬编码）
    container.innerHTML = '<iframe src="stats.html" style="width:100%; height:100%; border:none;"></iframe>';
}

function loadStatsContentViaIframe(element) {
    element.innerHTML = '<iframe src="stats.html" style="width:100%; height:100%; border:none; min-height:600px;"></iframe>';
}
