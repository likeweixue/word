// ========== 设置模块 ==========

var settingsData = {
    theme: 'default',
    bgImage: null,
    bgOpacity: 30,
    customCss: ''
};

function loadSettings() {
    var saved = localStorage.getItem('app_settings');
    if (saved) {
        try { var data = JSON.parse(saved); settingsData = data; } catch(e) {}
    }
    applyTheme(settingsData.theme);
    applyBackground();
    applyCustomCss();
}

function saveSettings() {
    localStorage.setItem('app_settings', JSON.stringify(settingsData));
}

function applyTheme(theme) {
    var link = document.getElementById('themeStyle');
    if (link) link.href = 'themes/' + theme + '.css';
    document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark');
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
        style.textContent = `
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url(${JSON.stringify(settingsData.bgImage)});
                background-size: cover;
                background-position: center;
                opacity: ${settingsData.bgOpacity / 100};
                z-index: -1;
                pointer-events: none;
            }
            .page, .sidebar-menu, .main-content {
                background: transparent !important;
            }
        `;
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

function loadSettingsPage() {
    var container = document.getElementById('settingsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="settings-card">
            <h3>预设主题</h3>
            <div class="theme-buttons">
                <button class="theme-btn" data-theme="default">默认白</button>
                <button class="theme-btn" data-theme="eye">护眼绿</button>
                <button class="theme-btn" data-theme="warm">经典黄</button>
                <button class="theme-btn" data-theme="dark">暗夜黑</button>
            </div>
        </div>
        <div class="settings-card">
            <h3>自定义背景</h3>
            <input type="file" id="bgUpload" accept="image/*">
            <div id="bgPreview" style="width:100%;height:100px;background:#ddd;border-radius:8px;margin-top:10px;background-size:cover;"></div>
            <div style="margin-top:10px;">
                <span>透明度: <span id="opacityVal">${settingsData.bgOpacity}</span>%</span>
                <input type="range" id="opacitySlider" min="0" max="100" value="${settingsData.bgOpacity}">
            </div>
            <button id="clearBgBtn" class="btn-danger" style="margin-top:10px;">清除背景</button>
        </div>
        <div class="settings-card">
            <h3>自定义CSS</h3>
            <textarea id="customCss" rows="6" style="width:100%;padding:8px;font-family:monospace;border-radius:6px;border:1px solid #ddd;">${settingsData.customCss.replace(/</g, '&lt;')}</textarea>
            <button id="saveCssBtn" class="btn-primary" style="margin-top:10px;">保存CSS</button>
        </div>
    `;
    var themeBtns = document.querySelectorAll('.theme-btn');
    for (var i = 0; i < themeBtns.length; i++) {
        themeBtns[i].onclick = function() { applyTheme(this.getAttribute('data-theme')); };
    }
    var upload = document.getElementById('bgUpload');
    var preview = document.getElementById('bgPreview');
    if (settingsData.bgImage) preview.style.backgroundImage = 'url(' + settingsData.bgImage + ')';
    if (upload) {
        upload.onchange = function(e) {
            var file = e.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(ev) {
                    settingsData.bgImage = ev.target.result;
                    preview.style.backgroundImage = 'url(' + settingsData.bgImage + ')';
                    applyBackground();
                    saveSettings();
                    alert('背景已应用');
                };
                reader.readAsDataURL(file);
            }
        };
    }
    var opacitySlider = document.getElementById('opacitySlider');
    var opacityVal = document.getElementById('opacityVal');
    if (opacitySlider) {
        opacitySlider.oninput = function() {
            opacityVal.textContent = this.value;
            settingsData.bgOpacity = parseInt(this.value);
            applyBackground();
            saveSettings();
        };
    }
    var clearBtn = document.getElementById('clearBgBtn');
    if (clearBtn) {
        clearBtn.onclick = function() {
            settingsData.bgImage = null;
            preview.style.backgroundImage = '';
            applyBackground();
            saveSettings();
            alert('背景已清除');
        };
    }
    var saveCssBtn = document.getElementById('saveCssBtn');
    var cssTextarea = document.getElementById('customCss');
    if (saveCssBtn && cssTextarea) {
        saveCssBtn.onclick = function() {
            settingsData.customCss = cssTextarea.value;
            applyCustomCss();
            saveSettings();
            alert('CSS已保存');
        };
    }
}

loadSettings();
