// ========== 设置界面 - 左右布局 ==========

var settingsData = {
    theme: 'default',
    bgImage: null,
    bgOpacity: 30,
    customCss: '',
    globalTextColor: '#333333'
};

function loadSettings() {
    var saved = localStorage.getItem('app_settings');
    if (saved) {
        try { var data = JSON.parse(saved); settingsData = data; } catch(e) {}
    }
    applyTheme(settingsData.theme);
    applyBackground();
    applyCustomCss();
    applyGlobalTextColor();
}

function saveSettings() {
    localStorage.setItem('app_settings', JSON.stringify(settingsData));
}

function applyTheme(theme) {
    var link = document.getElementById('themeStyle');
    if (link) link.href = 'themes/' + theme + '.css';
    document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark', 'theme-open');
    document.body.classList.add('theme-' + theme);
    settingsData.theme = theme;
    saveSettings();
}

function applyBackground() {
    var oldStyle = document.getElementById('user-bg-style');
    if (oldStyle) oldStyle.remove();
    if (settingsData.bgImage) {
        var style = document.createElement('style');
        style.id = 'user-bg-style';
        style.textContent = 'body::before { content: ""; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: url(' + JSON.stringify(settingsData.bgImage) + '); background-size: cover; background-position: center; opacity: ' + (settingsData.bgOpacity / 100) + '; z-index: -1; pointer-events: none; } .page, .sidebar-menu, .main-content, .book-detail-page { background: transparent !important; }';
        document.head.appendChild(style);
    }
}

function applyCustomCss() {
    var oldStyle = document.getElementById('user-css-style');
    if (oldStyle) oldStyle.remove();
    if (settingsData.customCss && settingsData.customCss.trim()) {
        var style = document.createElement('style');
        style.id = 'user-css-style';
        style.textContent = settingsData.customCss;
        document.head.appendChild(style);
    }
}

function applyGlobalTextColor() {
    var oldStyle = document.getElementById('global-text-style');
    if (oldStyle) oldStyle.remove();
    if (settingsData.globalTextColor) {
        var style = document.createElement('style');
        style.id = 'global-text-style';
        style.textContent = '* { color: ' + settingsData.globalTextColor + ' !important; }';
        document.head.appendChild(style);
    }
}

function bindThemeButtons() {
    var themeBtns = document.querySelectorAll('#settingsTabContent .theme-preset-btn');
    for (var i = 0; i < themeBtns.length; i++) {
        themeBtns[i].onclick = function() {
            var theme = this.getAttribute('data-theme');
            applyTheme(theme);
            if (theme === 'open') {
                var style = document.getElementById('open-theme-style');
                if (style) style.remove();
                var newStyle = document.createElement('style');
                newStyle.id = 'open-theme-style';
                newStyle.textContent = '.book-card, .card, .btn, button, .tab, .sidebar-menu, .right-sidebar { border-radius: 20px !important; } .main-toolbar .toolbar-btn { border-radius: 30px !important; }';
                document.head.appendChild(newStyle);
            } else {
                var oldStyle = document.getElementById('open-theme-style');
                if (oldStyle) oldStyle.remove();
            }
        };
    }
    
    var colorPicker = document.getElementById('globalTextColor');
    if (colorPicker) {
        colorPicker.onchange = function() {
            var color = this.value;
            settingsData.globalTextColor = color;
            applyGlobalTextColor();
            saveSettings();
        };
    }
}

function bindBackgroundEvents() {
    var bgUpload = document.getElementById('bgUploadSetting');
    var bgPreview = document.getElementById('bgPreviewSetting');
    var opacitySlider = document.getElementById('opacitySliderSetting');
    var opacityVal = document.getElementById('opacityValSetting');
    var clearBtn = document.getElementById('clearBgSettingBtn');
    
    if (bgUpload) {
        bgUpload.onchange = function(e) {
            var file = e.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(ev) {
                    settingsData.bgImage = ev.target.result;
                    if (bgPreview) bgPreview.style.backgroundImage = 'url(' + settingsData.bgImage + ')';
                    applyBackground();
                    saveSettings();
                };
                reader.readAsDataURL(file);
            }
        };
    }
    
    if (opacitySlider) {
        opacitySlider.oninput = function() {
            var val = parseInt(this.value);
            if (opacityVal) opacityVal.innerText = val;
            settingsData.bgOpacity = val;
            applyBackground();
            saveSettings();
        };
    }
    
    if (clearBtn) {
        clearBtn.onclick = function() {
            settingsData.bgImage = null;
            if (bgPreview) bgPreview.style.backgroundImage = '';
            applyBackground();
            saveSettings();
        };
    }
}

function bindCssEvents() {
    var saveBtn = document.getElementById('saveCssSettingBtn');
    var cssTextarea = document.getElementById('customCssSetting');
    if (saveBtn && cssTextarea) {
        saveBtn.onclick = function() {
            settingsData.customCss = cssTextarea.value;
            applyCustomCss();
            saveSettings();
            alert('CSS已保存');
        };
    }
}

function renderTabContent(tab) {
    var container = document.getElementById('settingsTabContent');
    if (!container) return;
    
    if (tab === 'theme') {
        container.innerHTML = `
            <h3 style="margin-bottom: 20px;">预设主题</h3>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
                <button class="theme-preset-btn" data-theme="default" style="padding: 10px 20px; border-radius: 12px; background: #f0f0f0; border: none; cursor: pointer;">默认白</button>
                <button class="theme-preset-btn" data-theme="eye" style="padding: 10px 20px; border-radius: 12px; background: #C8DBC5; border: none; cursor: pointer;">护眼绿</button>
                <button class="theme-preset-btn" data-theme="warm" style="padding: 10px 20px; border-radius: 12px; background: #DFD5BD; border: none; cursor: pointer;">经典黄</button>
                <button class="theme-preset-btn" data-theme="dark" style="padding: 10px 20px; border-radius: 12px; background: #1e1e2e; color: white; border: none; cursor: pointer;">暗夜黑</button>
                
                
            </div>
            <h3 style="margin-bottom: 20px;">全局文字颜色</h3>
            <input type="color" id="globalTextColor" value="${settingsData.globalTextColor}" style="width: 60px; height: 40px; cursor: pointer;">
        `;
        bindThemeButtons();
    } else if (tab === 'background') {
        container.innerHTML = `
            <h3 style="margin-bottom: 20px;">自定义背景图片</h3>
            <input type="file" id="bgUploadSetting" accept="image/*" style="margin-bottom: 16px;">
            <div id="bgPreviewSetting" style="width:100%; height:150px; background:#ddd; border-radius:12px; margin-bottom:16px; background-size:cover; background-position:center;"></div>
            <div style="margin-bottom: 16px;">
                <span>透明度: <span id="opacityValSetting">${settingsData.bgOpacity}</span>%</span>
                <input type="range" id="opacitySliderSetting" min="0" max="100" value="${settingsData.bgOpacity}" style="width:100%; margin-top:8px;">
            </div>
            <button id="clearBgSettingBtn" class="btn-danger" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">清除背景</button>
        `;
        if (settingsData.bgImage) {
            document.getElementById('bgPreviewSetting').style.backgroundImage = 'url(' + settingsData.bgImage + ')';
        }
        bindBackgroundEvents();
    } else if (tab === 'css') {
        container.innerHTML = `
            <h3 style="margin-bottom: 20px;">自定义CSS</h3>
            <textarea id="customCssSetting" rows="12" style="width:100%; padding:16px; font-family: monospace; border-radius: 12px; border: 1px solid #ddd; resize: vertical;">${settingsData.customCss.replace(/</g, '&lt;')}</textarea>
            <button id="saveCssSettingBtn" class="btn-primary" style="margin-top: 16px; padding: 10px 20px; background: #007aff; color: white; border: none; border-radius: 8px; cursor: pointer;">保存CSS</button>
        `;
        bindCssEvents();
    }
}

function renderSettingsPage() {
    var container = document.getElementById('settingsContainer');
    if (!container) return;
    
    var categories = [
        { id: 'theme', name: '主题外观', icon: '🎨' },
        { id: 'background', name: '背景设置', icon: '🖼️' },
        { id: 'css', name: '自定义CSS', icon: '📝' }
    ];
    var activeCategory = localStorage.getItem('settings_active_tab') || 'theme';
    
    container.innerHTML = `
        <div style="display: flex; height: 100%; min-height: 500px; background: #fff; border-radius: 16px; overflow: hidden;">
            <div style="width: 180px; background: #f8f6f2; border-right: 1px solid #eee; padding: 20px 0;">
                ${categories.map(cat => `
                    <div class="settings-tab" data-tab="${cat.id}" style="padding: 12px 20px; cursor: pointer; ${activeCategory === cat.id ? 'background: #e8e0d4; font-weight: 600; border-left: 3px solid #ceb087;' : 'color: #666;'}">
                        ${cat.icon} ${cat.name}
                    </div>
                `).join('')}
            </div>
            <div id="settingsTabContent" style="flex: 1; padding: 24px; overflow-y: auto;">
                加载中...
            </div>
        </div>
    `;
    
    var tabs = document.querySelectorAll('.settings-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            var tab = this.getAttribute('data-tab');
            localStorage.setItem('settings_active_tab', tab);
            renderTabContent(tab);
            var allTabs = document.querySelectorAll('.settings-tab');
            for (var j = 0; j < allTabs.length; j++) {
                allTabs[j].style.background = '';
                allTabs[j].style.borderLeft = '';
                allTabs[j].style.fontWeight = 'normal';
                allTabs[j].style.color = '#666';
            }
            this.style.background = '#e8e0d4';
            this.style.borderLeft = '3px solid #ceb087';
            this.style.fontWeight = '600';
            this.style.color = '#333';
        };
    }
    
    renderTabContent(activeCategory);
}

// 初始化
setTimeout(function() {
    loadSettings();
    renderSettingsPage();
}, 500);
