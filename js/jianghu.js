// ========== 江湖模块 ==========

var jianghuLinks = [
    { id: 1, title: 'QQ交流群', url: 'https://qm.qq.com/q/CRG0a4Vu7u', desc: '与作者们实时交流', icon: '💬' },
    { id: 2, title: 'GitHub', url: 'https://github.com/likeweixue/openwrite', desc: '查看源码与反馈', icon: '🐙' },
    { id: 3, title: '官方论坛', url: 'https://github.com/likeweixue/openwrite', desc: '分享作品与技巧', icon: '📚' },
    { id: 4, title: '使用教程', url: 'https://github.com/likeweixue/openwrite', desc: '快速上手写作帮手', icon: '📖' },
    { id: 5, title: '意见反馈', url: 'https://github.com/likeweixue/openwrite', desc: '告诉我们你的想法', icon: '💡' }
];

function loadJianghuLinks() {
    var saved = localStorage.getItem('jianghu_links');
    if (saved) { try { jianghuLinks = JSON.parse(saved); } catch(e) {} }
}

function saveJianghuLinks() {
    localStorage.setItem('jianghu_links', JSON.stringify(jianghuLinks));
}

function loadJianghuPage() {
    var container = document.getElementById('jianghuContainer');
    if (!container) {
        console.log('jianghuContainer not found');
        return;
    }
    loadJianghuLinks();
    var html = `
        <div style="padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2>江湖</h2>
                <button id="addLinkBtn" class="btn-primary" style="background:#007aff;">+ 添加链接</button>
            </div>
            <div class="jianghu-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
                ${jianghuLinks.map(function(link) {
                    return `
                        <div class="jianghu-card" data-id="${link.id}" style="background:#fff;border-radius:12px;padding:16px;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <div style="display:flex;align-items:center;gap:12px;">
                                <span style="font-size:32px;">${link.icon}</span>
                                <div style="flex:1;">
                                    <div style="font-weight:600;">${escapeHtml(link.title)}</div>
                                    <div style="font-size:12px;color:#888;">${escapeHtml(link.desc)}</div>
                                </div>
                                <button class="link-menu" data-id="${link.id}" style="background:none;border:none;font-size:16px;cursor:pointer;padding:4px 8px;">⋯</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    container.innerHTML = html;
    var cards = document.querySelectorAll('.jianghu-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].onclick = function(e) {
            if (e.target.classList && e.target.classList.contains('link-menu')) return;
            var id = parseInt(this.getAttribute('data-id'));
            var link = jianghuLinks.find(function(l) { return l.id === id; });
            if (link && link.url) window.open(link.url, '_blank');
        };
    }
    var menus = document.querySelectorAll('.link-menu');
    for (var i = 0; i < menus.length; i++) {
        menus[i].onclick = function(e) {
            e.stopPropagation();
            var id = parseInt(this.getAttribute('data-id'));
            showLinkMenu(id, this);
        };
    }
    var addBtn = document.getElementById('addLinkBtn');
    if (addBtn) addBtn.onclick = addNewLink;
}

function showLinkMenu(linkId, btn) {
    var link = jianghuLinks.find(function(l) { return l.id === linkId; });
    if (!link) return;
    var menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;background:#fff;border-radius:8px;padding:4px 0;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:1000;min-width:120px;';
    menu.innerHTML = `<button class="edit-link" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">编辑</button>
        <button class="delete-link" style="display:block;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;">删除</button>`;
    var rect = btn.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    document.body.appendChild(menu);
    menu.querySelector('.edit-link').onclick = function() {
        var newTitle = prompt('请输入链接名称', link.title);
        if (newTitle && newTitle.trim()) link.title = newTitle.trim();
        var newUrl = prompt('请输入链接地址', link.url);
        if (newUrl && newUrl.trim()) link.url = newUrl.trim();
        var newDesc = prompt('请输入链接描述', link.desc);
        if (newDesc !== null) link.desc = newDesc || '';
        saveJianghuLinks();
        loadJianghuPage();
        menu.remove();
    };
    menu.querySelector('.delete-link').onclick = function() {
        if (confirm('确定删除这个链接吗？')) {
            jianghuLinks = jianghuLinks.filter(function(l) { return l.id !== linkId; });
            saveJianghuLinks();
            loadJianghuPage();
        }
        menu.remove();
    };
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 100);
}

function addNewLink() {
    var title = prompt('请输入链接名称');
    if (!title || !title.trim()) return;
    var url = prompt('请输入链接地址');
    if (!url || !url.trim()) return;
    var desc = prompt('请输入链接描述', '点击打开链接');
    jianghuLinks.push({
        id: Date.now(),
        title: title.trim(),
        url: url.trim(),
        desc: desc || '点击打开链接',
        icon: '🔗'
    });
    saveJianghuLinks();
    loadJianghuPage();
}
