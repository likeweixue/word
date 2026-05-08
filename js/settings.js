// ========== 写作帮手 - 设置模块 ==========

// 全局颜色应用函数（强力版本）
function forceColorChange(color) {
    if (!color) color = '#333333';
    
    // 移除所有之前的颜色样式
    var allStyles = document.querySelectorAll('style');
    for (var i = 0; i < allStyles.length; i++) {
        var styleText = allStyles[i].textContent;
        if (styleText && styleText.indexOf('force-color-style') !== -1) {
            allStyles[i].remove();
        }
        if (styleText && styleText.indexOf('global-text-color') !== -1) {
            allStyles[i].remove();
        }
        if (styleText && styleText.indexOf('saved-color-style') !== -1) {
            allStyles[i].remove();
        }
    }
    
    // 创建新的强力样式
    var style = document.createElement('style');
    style.id = 'force-color-style';
    style.textContent = `
        * {
            color: ${color} !important;
        }
        input, textarea, select {
            color: ${color} !important;
        }
        input::placeholder, textarea::placeholder {
            color: ${color} !important;
            opacity: 0.6;
        }
        .editor-content, .editor-content * {
            color: ${color} !important;
        }
        .book-page, .sidebar-menu, .main-content, .title-input,
        .chapter-list-item, .volume-title, .books-container,
        .book-card, .stat-card, .settings-item, .about-content,
        .drawer-panel, .slide-menu, .outline-panel,
        .detail-sidebar, .sidebar-item, .menu-item,
        .logo-area h3, .slogan, .menu-footer,
        .jianghu-card, .jianghu-footer {
            color: ${color} !important;
        }
    `;
    document.head.appendChild(style);
    
    // 保存到设置
    if (typeof customSettings !== 'undefined') {
        customSettings.customTextColor = color;
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('wps_text_color', color);
    }
    
    console.log('颜色已应用:', color);
}

// 加载保存的颜色
function loadSavedColor() {
    var savedColor = localStorage.getItem('wps_text_color');
    if (!savedColor && typeof customSettings !== 'undefined' && customSettings.customTextColor) {
        savedColor = customSettings.customTextColor;
    }
    if (savedColor && savedColor !== '#333333') {
        forceColorChange(savedColor);
    }
}

// 主题设置界面
function renderThemeSettingsUI() {
    var savedColor = localStorage.getItem('wps_text_color') || '#333333';
    if (!savedColor || savedColor === 'undefined') savedColor = '#333333';
    
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">主题设置</h3>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">文字颜色</label>
                    <input type="color" id="themeColorPicker" value="${savedColor}" style="width: 100%; height: 50px; cursor: pointer; border-radius: 8px; border: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #888; margin-top: 8px;">选择颜色后点击下方保存按钮</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">字体</label>
                    <select id="themeFontSelect" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                        <option value="">系统默认</option>
                        <option value="Georgia, serif">宋体风格</option>
                        <option value="PingFang SC, Microsoft YaHei, sans-serif">苹方/雅黑</option>
                        <option value="KaiTi, serif">楷体风格</option>
                        <option value="Courier New, monospace">等宽字体</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button id="themeSaveBtn" style="flex: 1; padding: 12px; background: #007aff; color: white; border: none; border-radius: 8px; cursor: pointer;">保存设置</button>
                    <button id="themeResetBtn" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">重置</button>
                </div>
            </div>
        </div>
    `;
    
    // 绑定保存按钮
    var saveBtn = document.getElementById('themeSaveBtn');
    var colorPicker = document.getElementById('themeColorPicker');
    var fontSelect = document.getElementById('themeFontSelect');
    
    if (saveBtn && colorPicker) {
        saveBtn.onclick = function() {
            var color = colorPicker.value;
            forceColorChange(color);
            alert('文字颜色已保存');
        };
    }
    
    // 重置按钮
    var resetBtn = document.getElementById('themeResetBtn');
    if (resetBtn) {
        resetBtn.onclick = function() {
            if (colorPicker) colorPicker.value = '#333333';
            forceColorChange('#333333');
            if (fontSelect) fontSelect.value = '';
            document.body.style.fontFamily = '';
            localStorage.setItem('wps_text_color', '#333333');
            alert('已重置为默认颜色');
        };
    }
    
    // 字体选择
    if (fontSelect) {
        fontSelect.onchange = function() {
            var font = this.value;
            if (font) {
                document.body.style.fontFamily = font;
                if (typeof customSettings !== 'undefined') {
                    customSettings.customFontFamily = font;
                }
            }
        };
    }
}

// 安全设置界面
function renderSecuritySettingsUI() {
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">安全设置</h3>
                <div style="margin-bottom: 20px;">
                    <h4>密码保护</h4>
                    <p style="color: #888; margin-bottom: 12px;">设置启动密码，保护您的作品隐私</p>
                    <button id="pwdBtn" class="small-btn" style="width: 100%;">设置密码保护</button>
                </div>
                <div>
                    <h4>密保问题</h4>
                    <p style="color: #888; margin-bottom: 12px;">设置密保问题，用于找回密码</p>
                    <button id="secBtn" class="small-btn" style="width: 100%;">设置密保问题</button>
                </div>
            </div>
        </div>
    `;
    
    var pwdBtn = document.getElementById('pwdBtn');
    var secBtn = document.getElementById('secBtn');
    if (pwdBtn) pwdBtn.onclick = function() { alert('密码保护功能开发中'); };
    if (secBtn) secBtn.onclick = function() { alert('密保问题功能开发中'); };
}

// 备份设置界面
function renderBackupSettingsUI() {
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">备份设置</h3>
                <div>
                    <h4>备份策略</h4>
                    <label style="display: block; margin-bottom: 8px;">
                        <input type="radio" name="backupType" value="auto" checked> 定时自动备份
                    </label>
                    <label style="display: block; margin-bottom: 16px;">
                        <input type="radio" name="backupType" value="manual"> 仅手动备份
                    </label>
                    <div style="display: flex; gap: 12px;">
                        <button id="backupBtn" class="small-btn">立即备份</button>
                        <button id="restoreBtn" class="small-btn">恢复备份</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    var backupBtn = document.getElementById('backupBtn');
    var restoreBtn = document.getElementById('restoreBtn');
    if (backupBtn && typeof manualBackup === 'function') backupBtn.onclick = manualBackup;
    if (restoreBtn && typeof restoreBackup === 'function') restoreBtn.onclick = restoreBackup;
}

// 保存设置界面
function renderAutoSaveSettingsUI() {
    var enabled = true;
    var interval = 30;
    if (typeof autoSaveSettings !== 'undefined' && autoSaveSettings) {
        enabled = autoSaveSettings.enabled;
        interval = autoSaveSettings.interval;
    }
    
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">保存设置</h3>
                <div style="margin-bottom: 20px;">
                    <h4>自动保存</h4>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <input type="checkbox" id="autoSaveEnableChk" ${enabled ? 'checked' : ''}>
                        <span>启用自动保存</span>
                    </label>
                    <div id="autoSaveIntervalDiv" style="${enabled ? 'display: block;' : 'display: none;'}">
                        <label>保存间隔：</label>
                        <select id="autoSaveIntervalSelect" style="width: 100%; padding: 8px; margin-top: 8px;">
                            <option value="10" ${interval === 10 ? 'selected' : ''}>10秒</option>
                            <option value="30" ${interval === 30 ? 'selected' : ''}>30秒</option>
                            <option value="60" ${interval === 60 ? 'selected' : ''}>1分钟</option>
                            <option value="120" ${interval === 120 ? 'selected' : ''}>2分钟</option>
                            <option value="300" ${interval === 300 ? 'selected' : ''}>5分钟</option>
                        </select>
                    </div>
                    <button id="saveAutoSaveChkBtn" class="small-btn" style="margin-top: 16px;">保存设置</button>
                </div>
                <div>
                    <h4>手动保存</h4>
                    <button id="manualSaveChkBtn" class="primary-btn" style="width: 100%;">立即保存当前章节</button>
                </div>
            </div>
        </div>
    `;
    
    var enableChk = document.getElementById('autoSaveEnableChk');
    var intervalDiv = document.getElementById('autoSaveIntervalDiv');
    var intervalSelect = document.getElementById('autoSaveIntervalSelect');
    var saveChkBtn = document.getElementById('saveAutoSaveChkBtn');
    var manualChkBtn = document.getElementById('manualSaveChkBtn');
    
    if (enableChk) {
        enableChk.onchange = function() {
            intervalDiv.style.display = this.checked ? 'block' : 'none';
            if (typeof autoSaveSettings !== 'undefined' && autoSaveSettings) {
                autoSaveSettings.enabled = this.checked;
            }
        };
    }
    if (saveChkBtn && intervalSelect) {
        saveChkBtn.onclick = function() {
            if (typeof autoSaveSettings !== 'undefined' && autoSaveSettings) {
                autoSaveSettings.enabled = enableChk ? enableChk.checked : true;
                autoSaveSettings.interval = parseInt(intervalSelect.value);
            }
            if (typeof saveAutoSaveSettings === 'function') saveAutoSaveSettings();
            if (typeof applyAutoSaveSettings === 'function') applyAutoSaveSettings();
            alert('自动保存设置已保存');
        };
    }
    if (manualChkBtn && typeof saveCurrentChapter === 'function') {
        manualChkBtn.onclick = function() { saveCurrentChapter(); alert('已保存'); };
    }
}

// 主设置界面渲染
function renderSettingsPage() {
    var categories = [
        { id: 'theme', name: '主题', icon: '' },
        { id: 'security', name: '安全', icon: '' },
        { id: 'backup', name: '备份', icon: '' },
        { id: 'autosave', name: '保存', icon: '' }
    ];
    var activeCategory = localStorage.getItem('settings_active_category') || 'theme';
    
    var settingsContainer = document.getElementById('settingsPageSource');
    if (!settingsContainer) return;
    
    settingsContainer.innerHTML = `
        <div style="display: flex; height: 100%; min-height: 500px;">
            <div style="width: 160px; border-right: 1px solid rgba(0,0,0,0.1); padding: 16px 0;">
                ${categories.map(cat => `
                    <div class="settings-category-item" data-category="${cat.id}" style="padding: 12px 20px; cursor: pointer; ${activeCategory === cat.id ? 'background: rgba(0,122,255,0.1); border-right: 2px solid #007aff; font-weight: 600;' : 'color: #666;'}">
                        ${cat.icon} ${cat.name}
                    </div>
                `).join('')}
            </div>
            <div id="settingsRightContent" style="flex: 1; padding: 20px; overflow-y: auto;">
                加载中...
            </div>
        </div>
    `;
    
    // 绑定菜单事件
    var menuItems = document.querySelectorAll('.settings-category-item');
    for (var i = 0; i < menuItems.length; i++) {
        menuItems[i].onclick = function() {
            var category = this.getAttribute('data-category');
            localStorage.setItem('settings_active_category', category);
            
            // 更新样式
            var allItems = document.querySelectorAll('.settings-category-item');
            for (var j = 0; j < allItems.length; j++) {
                allItems[j].style.background = '';
                allItems[j].style.borderRight = '';
                allItems[j].style.fontWeight = 'normal';
                allItems[j].style.color = '#666';
            }
            this.style.background = 'rgba(0,122,255,0.1)';
            this.style.borderRight = '2px solid #007aff';
            this.style.fontWeight = '600';
            this.style.color = '#333';
            
            // 渲染对应内容
            if (category === 'theme') renderThemeSettingsUI();
            else if (category === 'security') renderSecuritySettingsUI();
            else if (category === 'backup') renderBackupSettingsUI();
            else if (category === 'autosave') renderAutoSaveSettingsUI();
        };
    }
    
    // 渲染默认内容
    if (activeCategory === 'theme') renderThemeSettingsUI();
    else if (activeCategory === 'security') renderSecuritySettingsUI();
    else if (activeCategory === 'backup') renderBackupSettingsUI();
    else if (activeCategory === 'autosave') renderAutoSaveSettingsUI();
}

// ========== 原有函数保留 ==========
function applyTheme(theme) {
    var themeLink = document.getElementById('themeStyle');
    if (themeLink) {
        themeLink.href = 'themes/' + theme + '.css';
    }
    var presets = document.querySelectorAll('.color-preset');
    for (var i = 0; i < presets.length; i++) {
        if (presets[i].dataset.theme === theme) {
            presets[i].classList.add('active');
        } else {
            presets[i].classList.remove('active');
        }
    }
    if (typeof settings !== 'undefined') {
        settings.theme = theme;
        if (typeof saveAllData === 'function') saveAllData();
    }
}

function applyGridLine(show) {
    var editor = document.getElementById('editor');
    if (editor) {
        if (show) editor.classList.add('show-grid');
        else editor.classList.remove('show-grid');
    }
    var checkbox = document.getElementById('gridLinesCheckbox');
    if (checkbox) checkbox.checked = show;
    if (typeof settings !== 'undefined') {
        settings.showGrid = show;
        if (typeof saveAllData === 'function') saveAllData();
    }
}

function applyFontFamily(font) {
    var editor = document.getElementById('editor');
    if (editor) editor.style.fontFamily = font;
    var options = document.querySelectorAll('.font-option');
    for (var i = 0; i < options.length; i++) {
        if (options[i].dataset.font === font) options[i].classList.add('active');
        else options[i].classList.remove('active');
    }
    if (typeof settings !== 'undefined') {
        settings.fontFamily = font;
        if (typeof saveAllData === 'function') saveAllData();
    }
}

function applyLineHeight(height) {
    var editor = document.getElementById('editor');
    if (editor) editor.style.lineHeight = height;
    var select = document.getElementById('lineHeightSelect');
    if (select) select.value = height;
    if (typeof settings !== 'undefined') {
        settings.lineHeight = height;
        if (typeof saveAllData === 'function') saveAllData();
    }
}

function manualBackup() {
    var backup = localStorage.getItem('wps_data');
    if (backup) {
        localStorage.setItem('wps_backup', backup);
        alert('已备份到浏览器');
    }
}

function restoreBackup() {
    var b = localStorage.getItem('wps_backup');
    if(b){
        localStorage.setItem('wps_data', b);
        location.reload();
    } else alert('无备份');
}

function updateStats() {
    var now = new Date(), todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var today = 0, week = 0, month = 0, total = 0;
    var weekStart = todayStart - 6 * 86400000;
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    if (typeof books !== 'undefined' && books) {
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
    }
    
    var todayEl = document.getElementById('todayWords');
    var weekEl = document.getElementById('weekWords');
    var monthEl = document.getElementById('monthWords');
    var totalEl = document.getElementById('totalWords');
    if (todayEl) todayEl.innerText = today;
    if (weekEl) weekEl.innerText = week;
    if (monthEl) monthEl.innerText = month;
    if (totalEl) totalEl.innerText = total;
    
    var goal = parseInt(localStorage.getItem('dailyGoal') || 0);
    if (goal > 0) {
        var percent = Math.min(100, (today / goal) * 100);
        var fillBar = document.querySelector('.progress-fill');
        if (fillBar) fillBar.style.width = percent + '%';
        var msgEl = document.getElementById('goalMessage');
        if (msgEl) msgEl.innerText = '今日 ' + today + '/' + goal + ' 字 (' + Math.floor(percent) + '%)';
    }
}

function prevMonth() {
    if (typeof window.currentCalendarDate !== 'undefined') {
        window.currentCalendarDate.setMonth(window.currentCalendarDate.getMonth() - 1);
        if (typeof renderCalendar === 'function') renderCalendar();
    }
}

function nextMonth() {
    if (typeof window.currentCalendarDate !== 'undefined') {
        window.currentCalendarDate.setMonth(window.currentCalendarDate.getMonth() + 1);
        if (typeof renderCalendar === 'function') renderCalendar();
    }
}

function renderCalendar() {
    if (!window.currentCalendarDate) return;
    var year = window.currentCalendarDate.getFullYear();
    var month = window.currentCalendarDate.getMonth();
    var monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    var titleEl = document.getElementById('calendarMonth');
    if (titleEl) titleEl.innerText = year + '年 ' + monthNames[month];
}

// 暴露全局函数
window.forceColorChange = forceColorChange;
window.applyTheme = applyTheme;
window.applyGridLine = applyGridLine;
window.applyFontFamily = applyFontFamily;
window.applyLineHeight = applyLineHeight;
window.manualBackup = manualBackup;
window.restoreBackup = restoreBackup;
window.updateStats = updateStats;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.renderCalendar = renderCalendar;
window.currentCalendarDate = new Date();

// 初始化设置页面
setTimeout(function() {
    var settingsSource = document.getElementById('settingsPageSource');
    if (settingsSource) {
        renderSettingsPage();
    }
    loadSavedColor();
}, 500);

// ========== 颜色选择器强力绑定（永久修复） ==========
function bindAllColorPickers() {
    var pickers = document.querySelectorAll('input[type="color"]');
    for (var i = 0; i < pickers.length; i++) {
        var p = pickers[i];
        if (p.hasAttribute('data-bound')) continue;
        
        p.setAttribute('data-bound', 'true');
        
        p.addEventListener('input', function(e) {
            var color = e.target.value;
            // 实时预览颜色
            var style = document.getElementById('dynamic-color-style');
            if (style) style.remove();
            var newStyle = document.createElement('style');
            newStyle.id = 'dynamic-color-style';
            newStyle.textContent = '* { color: ' + color + ' !important; } input, textarea, select { color: ' + color + ' !important; } input::placeholder, textarea::placeholder { color: ' + color + ' !important; opacity: 0.6; }';
            document.head.appendChild(newStyle);
        });
        
        p.addEventListener('change', function(e) {
            var color = e.target.value;
            // 保存颜色
            if (typeof forceColorChange === 'function') {
                forceColorChange(color);
            } else {
                // 保存到 localStorage
                localStorage.setItem('wps_text_color', color);
                var style = document.getElementById('dynamic-color-style');
                if (style) style.remove();
                var newStyle = document.createElement('style');
                newStyle.id = 'dynamic-color-style';
                newStyle.textContent = '* { color: ' + color + ' !important; }';
                document.head.appendChild(newStyle);
            }
        });
    }
}

// 初始化颜色选择器绑定
function initColorPickerBinding() {
    bindAllColorPickers();
    var observer = new MutationObserver(function() {
        bindAllColorPickers();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// 页面加载完成后启动
setTimeout(initColorPickerBinding, 500);

// ========== 颜色功能最终修复 ==========
function initColorFunction() {
    // 强制颜色变化函数
    window.forceColor = function(color) {
        var style = document.getElementById('master-color-style');
        if (style) style.remove();
        var newStyle = document.createElement('style');
        newStyle.id = 'master-color-style';
        newStyle.textContent = '* { color: ' + color + ' !important; } input, textarea, select { color: ' + color + ' !important; } input::placeholder, textarea::placeholder { color: ' + color + ' !important; opacity: 0.6; }';
        document.head.appendChild(newStyle);
        localStorage.setItem('wps_text_color', color);
        if (typeof customSettings !== 'undefined') {
            customSettings.customTextColor = color;
        }
        console.log('颜色已应用:', color);
    };
    
    // 绑定所有颜色选择器
    function bindPickers() {
        var pickers = document.querySelectorAll('input[type="color"]');
        for (var i = 0; i < pickers.length; i++) {
            var p = pickers[i];
            if (p.hasAttribute('data-color-bound')) continue;
            p.setAttribute('data-color-bound', 'true');
            
            p.oninput = function(e) {
                var color = e.target.value;
                var previewStyle = document.getElementById('preview-color-style');
                if (previewStyle) previewStyle.remove();
                var ps = document.createElement('style');
                ps.id = 'preview-color-style';
                ps.textContent = '* { color: ' + color + ' !important; }';
                document.head.appendChild(ps);
            };
            
            p.onchange = function(e) {
                window.forceColor(e.target.value);
            };
        }
    }
    
    // 恢复保存的颜色
    var savedColor = localStorage.getItem('wps_text_color');
    if (savedColor && savedColor !== '#333333') {
        window.forceColor(savedColor);
        var picker = document.querySelector('input[type="color"]');
        if (picker && picker.value !== savedColor) picker.value = savedColor;
    }
    
    bindPickers();
    
    // 监听新添加的颜色选择器
    var observer = new MutationObserver(function() { bindPickers(); });
    observer.observe(document.body, { childList: true, subtree: true });
}

// 页面加载完成后初始化
setTimeout(initColorFunction, 500);

// ========== 颜色功能最终修复版 ==========
function initGlobalColor() {
    // 移除所有冲突的颜色样式
    var allStyles = document.querySelectorAll('style');
    for (var i = 0; i < allStyles.length; i++) {
        var text = allStyles[i].textContent || '';
        if (text.indexOf('color') !== -1 && text.indexOf('!important') !== -1) {
            if (allStyles[i].id !== 'themeStyle' && allStyles[i].id !== 'global-color-style') {
                allStyles[i].remove();
            }
        }
    }
    
    // 全局颜色应用函数
    window.applyGlobalColor = function(color) {
        var style = document.getElementById('global-color-style');
        if (style) style.remove();
        var newStyle = document.createElement('style');
        newStyle.id = 'global-color-style';
        newStyle.textContent = '* { color: ' + color + ' !important; } input, textarea, select { color: ' + color + ' !important; }';
        document.head.appendChild(newStyle);
        localStorage.setItem('wps_text_color', color);
        if (typeof customSettings !== 'undefined') {
            customSettings.customTextColor = color;
        }
    };
    
    // 绑定颜色选择器
    function bindColorPicker() {
        var picker = document.getElementById('themeColorPicker');
        if (!picker) return;
        
        // 避免重复绑定
        if (picker.hasAttribute('data-bound')) return;
        picker.setAttribute('data-bound', 'true');
        
        picker.oninput = function(e) {
            var color = e.target.value;
            var preview = document.getElementById('preview-color-style');
            if (preview) preview.remove();
            var ps = document.createElement('style');
            ps.id = 'preview-color-style';
            ps.textContent = '* { color: ' + color + ' !important; }';
            document.head.appendChild(ps);
        };
        
        picker.onchange = function(e) {
            window.applyGlobalColor(e.target.value);
        };
    }
    
    // 恢复保存的颜色
    var savedColor = localStorage.getItem('wps_text_color');
    if (savedColor && savedColor !== '#333333') {
        window.applyGlobalColor(savedColor);
        var picker = document.getElementById('themeColorPicker');
        if (picker) picker.value = savedColor;
    } else {
        window.applyGlobalColor('#333333');
    }
    
    bindColorPicker();
    
    // 监听动态添加的颜色选择器
    var observer = new MutationObserver(function() {
        bindColorPicker();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// 延迟启动，确保DOM加载完成
setTimeout(initGlobalColor, 300);

// ========== 浮动颜色按钮（简单可靠） ==========
function addColorFloatingButton() {
    // 检查是否已存在
    if (document.getElementById('floating-color-btn')) return;
    
    var btn = document.createElement('button');
    btn.id = 'floating-color-btn';
    btn.textContent = ' 换颜色';
    btn.style.cssText = 'position: fixed; bottom: 20px; left: 20px; z-index: 99999; padding: 10px 16px; background: #007aff; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
    
    var colors = ['#333333', '#ff0000', '#00aa00', '#0066cc', '#ff8800', '#aa44aa'];
    var colorNames = ['默认', '红色', '绿色', '蓝色', '橙色', '紫色'];
    var colorIndex = 0;
    
    // 恢复保存的颜色索引
    var savedIndex = localStorage.getItem('color_index');
    if (savedIndex) {
        colorIndex = parseInt(savedIndex);
    }
    
    function applyColor(color, idx) {
        var style = document.getElementById('float-color-style');
        if (style) style.remove();
        var newStyle = document.createElement('style');
        newStyle.id = 'float-color-style';
        newStyle.textContent = '* { color: ' + color + ' !important; } input, textarea, select { color: ' + color + ' !important; }';
        document.head.appendChild(newStyle);
        btn.textContent = ' ' + colorNames[idx];
        localStorage.setItem('color_index', idx);
    }
    
    btn.onclick = function() {
        colorIndex = (colorIndex + 1) % colors.length;
        applyColor(colors[colorIndex], colorIndex);
    };
    
    document.body.appendChild(btn);
    applyColor(colors[colorIndex], colorIndex);
}

// 页面加载完成后添加按钮
setTimeout(addColorFloatingButton, 500);

// ========== 修复菜单栏颜色 + 移动按钮到设置界面 ==========

function fixMenuColor() {
    // 获取当前颜色
    var savedIndex = localStorage.getItem('color_index');
    var colors = ['#333333', '#ff0000', '#00aa00', '#0066cc', '#ff8800', '#aa44aa'];
    var colorIndex = savedIndex ? parseInt(savedIndex) : 0;
    var currentColor = colors[colorIndex];
    
    // 强制菜单栏应用当前颜色
    var menuItems = document.querySelectorAll('.sidebar-menu, .sidebar-menu *, .menu-item, .logo-area h3, .slogan, .menu-footer');
    for (var i = 0; i < menuItems.length; i++) {
        menuItems[i].style.setProperty('color', currentColor, 'important');
    }
}

// 在主题设置界面添加颜色选择器
function addColorPickerToThemePage() {
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    
    // 检查是否已添加
    if (document.getElementById('theme-color-panel')) return;
    
    var colors = ['#333333', '#ff0000', '#00aa00', '#0066cc', '#ff8800', '#aa44aa'];
    var colorNames = ['默认黑', '红色', '绿色', '蓝色', '橙色', '紫色'];
    var savedIndex = localStorage.getItem('color_index');
    var currentIndex = savedIndex ? parseInt(savedIndex) : 0;
    
    var colorPanel = document.createElement('div');
    colorPanel.id = 'theme-color-panel';
    colorPanel.style.cssText = 'margin-bottom: 20px; padding: 16px; background: rgba(0,0,0,0.05); border-radius: 12px;';
    colorPanel.innerHTML = `
        <h4 style="margin-bottom: 12px;">文字颜色设置</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${colors.map((color, idx) => `
                <button class="color-option-btn" data-color="${color}" data-index="${idx}" style="padding: 8px 16px; background: ${color}; color: ${color === '#333333' ? '#333' : 'white'}; border: 2px solid ${currentIndex === idx ? '#007aff' : 'transparent'}; border-radius: 8px; cursor: pointer; font-size: 13px;">${colorNames[idx]}</button>
            `).join('')}
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 12px;">点击按钮切换全局文字颜色</p>
    `;
    
    // 找到主题设置内容区域，添加到顶部
    var existingContent = container.firstChild;
    if (existingContent) {
        container.insertBefore(colorPanel, existingContent);
    } else {
        container.appendChild(colorPanel);
    }
    
    // 绑定按钮事件
    var btns = document.querySelectorAll('.color-option-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = function() {
            var color = this.getAttribute('data-color');
            var idx = parseInt(this.getAttribute('data-index'));
            
            // 应用颜色到所有元素
            var style = document.getElementById('global-menu-color-style');
            if (style) style.remove();
            var newStyle = document.createElement('style');
            newStyle.id = 'global-menu-color-style';
            newStyle.textContent = '* { color: ' + color + ' !important; } input, textarea, select { color: ' + color + ' !important; } .sidebar-menu, .sidebar-menu * { color: ' + color + ' !important; }';
            document.head.appendChild(newStyle);
            
            // 保存索引
            localStorage.setItem('color_index', idx);
            
            // 更新按钮边框样式
            var allBtns = document.querySelectorAll('.color-option-btn');
            for (var j = 0; j < allBtns.length; j++) {
                allBtns[j].style.borderColor = 'transparent';
            }
            this.style.borderColor = '#007aff';
            
            console.log('颜色已切换为:', colorNames[idx]);
        };
    }
}

// 修改颜色应用函数，确保菜单栏也被覆盖
function applyColorToAll(color, idx) {
    var style = document.getElementById('global-menu-color-style');
    if (style) style.remove();
    var newStyle = document.createElement('style');
    newStyle.id = 'global-menu-color-style';
    newStyle.textContent = '* { color: ' + color + ' !important; } input, textarea, select { color: ' + color + ' !important; } .sidebar-menu, .sidebar-menu * { color: ' + color + ' !important; } .editor-content * { color: ' + color + ' !important; }';
    document.head.appendChild(newStyle);
    localStorage.setItem('color_index', idx);
}

// 初始化时恢复颜色
function initMenuColor() {
    var savedIndex = localStorage.getItem('color_index');
    if (savedIndex) {
        var colors = ['#333333', '#ff0000', '#00aa00', '#0066cc', '#ff8800', '#aa44aa'];
        var idx = parseInt(savedIndex);
        applyColorToAll(colors[idx], idx);
    }
}

// 在主题设置渲染时添加颜色面板
var originalRenderThemeUI = renderThemeSettingsUI;
if (typeof renderThemeSettingsUI === 'function') {
    window.renderThemeSettingsUI = function() {
        originalRenderThemeUI();
        setTimeout(addColorPickerToThemePage, 100);
        setTimeout(fixMenuColor, 150);
    };
}

// 延迟执行
setTimeout(function() {
    initMenuColor();
    if (document.getElementById('settingsRightContent')) {
        addColorPickerToThemePage();
    }
}, 500);

// ========== 重新绑定设置菜单 ==========
function rebindSettingsMenu() {
    var menuItems = document.querySelectorAll('.settings-category-item');
    console.log('重新绑定设置菜单，找到数量:', menuItems.length);
    
    for (var i = 0; i < menuItems.length; i++) {
        var item = menuItems[i];
        // 移除旧事件
        item.onclick = null;
        // 绑定新事件
        item.onclick = function(e) {
            e.stopPropagation();
            var category = this.getAttribute('data-category');
            console.log('点击菜单:', category);
            
            // 保存当前分类
            localStorage.setItem('settings_active_category', category);
            
            // 更新样式
            var allItems = document.querySelectorAll('.settings-category-item');
            for (var j = 0; j < allItems.length; j++) {
                allItems[j].style.background = '';
                allItems[j].style.borderRight = '';
                allItems[j].style.fontWeight = 'normal';
                allItems[j].style.color = '#666';
            }
            this.style.background = 'rgba(0,122,255,0.1)';
            this.style.borderRight = '2px solid #007aff';
            this.style.fontWeight = '600';
            this.style.color = '#333';
            
            // 渲染对应内容
            if (category === 'theme') {
                renderThemeSettingsUI();
                setTimeout(addColorPickerToThemePage, 100);
            } else if (category === 'security') {
                renderSecuritySettingsUI();
            } else if (category === 'backup') {
                renderBackupSettingsUI();
            } else if (category === 'autosave') {
                renderAutoSaveSettingsUI();
            }
        };
    }
}

// 覆盖之前的渲染函数，确保菜单可点
var originalRenderSettingsPage = renderSettingsPage;
if (typeof renderSettingsPage === 'function') {
    window.renderSettingsPage = function() {
        originalRenderSettingsPage();
        setTimeout(rebindSettingsMenu, 100);
    };
}

// 确保颜色面板中的按钮也能正常工作
function fixColorButtons() {
    var colorBtns = document.querySelectorAll('.color-option-btn');
    for (var i = 0; i < colorBtns.length; i++) {
        var btn = colorBtns[i];
        btn.onclick = function(e) {
            e.stopPropagation();
            var color = this.getAttribute('data-color');
            var idx = parseInt(this.getAttribute('data-index'));
            
            // 应用颜色到所有元素
            var style = document.getElementById('global-menu-color-style');
            if (style) style.remove();
            var newStyle = document.createElement('style');
            newStyle.id = 'global-menu-color-style';
            newStyle.textContent = '* { color: ' + color + ' !important; } input, textarea, select { color: ' + color + ' !important; } .sidebar-menu, .sidebar-menu * { color: ' + color + ' !important; }';
            document.head.appendChild(newStyle);
            
            localStorage.setItem('color_index', idx);
            
            // 更新按钮边框
            var allBtns = document.querySelectorAll('.color-option-btn');
            for (var j = 0; j < allBtns.length; j++) {
                allBtns[j].style.borderColor = 'transparent';
            }
            this.style.borderColor = '#007aff';
            
            console.log('颜色已切换');
        };
    }
}

// 延迟执行，确保DOM加载完成
setTimeout(function() {
    rebindSettingsMenu();
    fixColorButtons();
}, 500);

// 监听动态变化
var observer = new MutationObserver(function() {
    rebindSettingsMenu();
    fixColorButtons();
});
observer.observe(document.body, { childList: true, subtree: true });

// ========== 移除浮动按钮 ==========
var floatBtn = document.getElementById('floating-color-btn');
if (floatBtn) {
    floatBtn.remove();
    console.log('浮动按钮已移除');
}

// ========== 修复安全设置按钮 ==========
function fixSecurityButtons() {
    var pwdBtn = document.getElementById('pwdBtn');
    var secBtn = document.getElementById('secBtn');
    
    if (pwdBtn) {
        pwdBtn.onclick = function(e) {
            e.stopPropagation();
            var password = prompt('请设置启动密码：');
            if (password && password.trim()) {
                localStorage.setItem('app_password', btoa(password));
                alert('密码已设置，下次启动需要输入密码');
            } else if (password === '') {
                alert('密码不能为空');
            }
        };
        console.log('密码保护按钮已绑定');
    }
    
    if (secBtn) {
        secBtn.onclick = function(e) {
            e.stopPropagation();
            var question = prompt('请输入密保问题：');
            if (question && question.trim()) {
                var answer = prompt('请输入密保答案：');
                if (answer && answer.trim()) {
                    var securityData = {
                        question: question,
                        answer: btoa(answer.trim())
                    };
                    localStorage.setItem('security_question', JSON.stringify(securityData));
                    alert('密保问题已设置');
                } else {
                    alert('答案不能为空');
                }
            } else if (question === '') {
                alert('问题不能为空');
            }
        };
        console.log('密保问题按钮已绑定');
    }
}

// ========== 修复备份设置按钮 ==========
function fixBackupButtons() {
    var backupBtn = document.getElementById('backupBtn');
    var restoreBtn = document.getElementById('restoreBtn');
    
    if (backupBtn) {
        backupBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof manualBackup === 'function') {
                manualBackup();
            } else {
                var backup = localStorage.getItem('wps_data');
                if (backup) {
                    localStorage.setItem('wps_backup', backup);
                    alert('已备份到浏览器');
                } else {
                    alert('没有数据可备份');
                }
            }
        };
    }
    
    if (restoreBtn) {
        restoreBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof restoreBackup === 'function') {
                restoreBackup();
            } else {
                var b = localStorage.getItem('wps_backup');
                if (b) {
                    localStorage.setItem('wps_data', b);
                    alert('备份已恢复，即将刷新页面');
                    setTimeout(function() { location.reload(); }, 500);
                } else {
                    alert('没有找到备份文件');
                }
            }
        };
    }
}

// ========== 修复保存设置按钮 ==========
function fixAutoSaveButtons() {
    var manualSaveBtn = document.getElementById('manualSaveChkBtn');
    var saveAutoBtn = document.getElementById('saveAutoSaveChkBtn');
    var autoSaveEnable = document.getElementById('autoSaveEnableChk');
    var autoSaveInterval = document.getElementById('autoSaveIntervalSelect');
    var intervalDiv = document.getElementById('autoSaveIntervalDiv');
    
    if (manualSaveBtn && typeof saveCurrentChapter === 'function') {
        manualSaveBtn.onclick = function(e) {
            e.stopPropagation();
            saveCurrentChapter();
            alert('已保存');
        };
    }
    
    if (saveAutoBtn && autoSaveEnable && autoSaveInterval) {
        saveAutoBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof autoSaveSettings !== 'undefined') {
                autoSaveSettings.enabled = autoSaveEnable.checked;
                autoSaveSettings.interval = parseInt(autoSaveInterval.value);
                if (typeof saveAutoSaveSettings === 'function') saveAutoSaveSettings();
                if (typeof applyAutoSaveSettings === 'function') applyAutoSaveSettings();
            }
            alert('自动保存设置已保存');
        };
    }
    
    if (autoSaveEnable && intervalDiv) {
        autoSaveEnable.onchange = function(e) {
            intervalDiv.style.display = e.target.checked ? 'block' : 'none';
        };
    }
}

// 重写安全设置渲染函数，确保按钮可点
window.renderSecuritySettingsUI = function() {
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">安全设置</h3>
                <div style="margin-bottom: 20px;">
                    <h4>密码保护</h4>
                    <p style="color: #888; margin-bottom: 12px;">设置启动密码，保护您的作品隐私</p>
                    <button id="pwdBtn" class="small-btn" style="width: 100%; background: #007aff; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">设置密码保护</button>
                </div>
                <div>
                    <h4>密保问题</h4>
                    <p style="color: #888; margin-bottom: 12px;">设置密保问题，用于找回密码</p>
                    <button id="secBtn" class="small-btn" style="width: 100%; background: #007aff; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">设置密保问题</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(fixSecurityButtons, 100);
};

// 重写备份设置渲染函数
window.renderBackupSettingsUI = function() {
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">备份设置</h3>
                <div>
                    <h4>备份策略</h4>
                    <label style="display: block; margin-bottom: 8px;">
                        <input type="radio" name="backupType" value="auto" checked> 定时自动备份
                    </label>
                    <label style="display: block; margin-bottom: 16px;">
                        <input type="radio" name="backupType" value="manual"> 仅手动备份
                    </label>
                    <div style="display: flex; gap: 12px;">
                        <button id="backupBtn" class="small-btn" style="background: #007aff; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">立即备份</button>
                        <button id="restoreBtn" class="small-btn" style="background: #6c757d; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">恢复备份</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(fixBackupButtons, 100);
};

// 重写自动保存设置渲染函数
window.renderAutoSaveSettingsUI = function() {
    var enabled = true;
    var interval = 30;
    if (typeof autoSaveSettings !== 'undefined' && autoSaveSettings) {
        enabled = autoSaveSettings.enabled;
        interval = autoSaveSettings.interval;
    }
    
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">保存设置</h3>
                <div style="margin-bottom: 20px;">
                    <h4>自动保存</h4>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <input type="checkbox" id="autoSaveEnableChk" ${enabled ? 'checked' : ''}>
                        <span>启用自动保存</span>
                    </label>
                    <div id="autoSaveIntervalDiv" style="${enabled ? 'display: block;' : 'display: none;'}">
                        <label>保存间隔：</label>
                        <select id="autoSaveIntervalSelect" style="width: 100%; padding: 8px; margin-top: 8px; border-radius: 6px; border: 1px solid #ddd;">
                            <option value="10" ${interval === 10 ? 'selected' : ''}>10秒</option>
                            <option value="30" ${interval === 30 ? 'selected' : ''}>30秒</option>
                            <option value="60" ${interval === 60 ? 'selected' : ''}>1分钟</option>
                            <option value="120" ${interval === 120 ? 'selected' : ''}>2分钟</option>
                            <option value="300" ${interval === 300 ? 'selected' : ''}>5分钟</option>
                        </select>
                    </div>
                    <button id="saveAutoSaveChkBtn" class="small-btn" style="margin-top: 16px; background: #007aff; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">保存设置</button>
                </div>
                <div>
                    <h4>手动保存</h4>
                    <button id="manualSaveChkBtn" class="primary-btn" style="width: 100%; background: #007aff; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer;">立即保存当前章节</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(fixAutoSaveButtons, 100);
};

// 重新初始化
setTimeout(function() {
    var floatBtn2 = document.getElementById('floating-color-btn');
    if (floatBtn2) floatBtn2.remove();
    
    // 如果当前在安全设置页面，重新渲染
    var activeCat = localStorage.getItem('settings_active_category');
    if (activeCat === 'security') {
        renderSecuritySettingsUI();
    } else if (activeCat === 'backup') {
        renderBackupSettingsUI();
    } else if (activeCat === 'autosave') {
        renderAutoSaveSettingsUI();
    }
}, 300);

// ========== 移除浮动按钮 ==========
var floatBtn = document.getElementById('floating-color-btn');
if (floatBtn) {
    floatBtn.remove();
    console.log('浮动按钮已移除');
}

// ========== 修复安全设置按钮 ==========
function fixSecurityButtons() {
    var pwdBtn = document.getElementById('pwdBtn');
    var secBtn = document.getElementById('secBtn');
    
    if (pwdBtn) {
        pwdBtn.onclick = function(e) {
            e.stopPropagation();
            var password = prompt('请设置启动密码：');
            if (password && password.trim()) {
                localStorage.setItem('app_password', btoa(password));
                alert('密码已设置，下次启动需要输入密码');
            } else if (password === '') {
                alert('密码不能为空');
            }
        };
        console.log('密码保护按钮已绑定');
    }
    
    if (secBtn) {
        secBtn.onclick = function(e) {
            e.stopPropagation();
            var question = prompt('请输入密保问题：');
            if (question && question.trim()) {
                var answer = prompt('请输入密保答案：');
                if (answer && answer.trim()) {
                    var securityData = {
                        question: question,
                        answer: btoa(answer.trim())
                    };
                    localStorage.setItem('security_question', JSON.stringify(securityData));
                    alert('密保问题已设置');
                } else {
                    alert('答案不能为空');
                }
            } else if (question === '') {
                alert('问题不能为空');
            }
        };
        console.log('密保问题按钮已绑定');
    }
}

// ========== 修复备份设置按钮 ==========
function fixBackupButtons() {
    var backupBtn = document.getElementById('backupBtn');
    var restoreBtn = document.getElementById('restoreBtn');
    
    if (backupBtn) {
        backupBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof manualBackup === 'function') {
                manualBackup();
            } else {
                var backup = localStorage.getItem('wps_data');
                if (backup) {
                    localStorage.setItem('wps_backup', backup);
                    alert('已备份到浏览器');
                } else {
                    alert('没有数据可备份');
                }
            }
        };
    }
    
    if (restoreBtn) {
        restoreBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof restoreBackup === 'function') {
                restoreBackup();
            } else {
                var b = localStorage.getItem('wps_backup');
                if (b) {
                    localStorage.setItem('wps_data', b);
                    alert('备份已恢复，即将刷新页面');
                    setTimeout(function() { location.reload(); }, 500);
                } else {
                    alert('没有找到备份文件');
                }
            }
        };
    }
}

// ========== 修复保存设置按钮 ==========
function fixAutoSaveButtons() {
    var manualSaveBtn = document.getElementById('manualSaveChkBtn');
    var saveAutoBtn = document.getElementById('saveAutoSaveChkBtn');
    var autoSaveEnable = document.getElementById('autoSaveEnableChk');
    var autoSaveInterval = document.getElementById('autoSaveIntervalSelect');
    var intervalDiv = document.getElementById('autoSaveIntervalDiv');
    
    if (manualSaveBtn && typeof saveCurrentChapter === 'function') {
        manualSaveBtn.onclick = function(e) {
            e.stopPropagation();
            saveCurrentChapter();
            alert('已保存');
        };
    }
    
    if (saveAutoBtn && autoSaveEnable && autoSaveInterval) {
        saveAutoBtn.onclick = function(e) {
            e.stopPropagation();
            if (typeof autoSaveSettings !== 'undefined') {
                autoSaveSettings.enabled = autoSaveEnable.checked;
                autoSaveSettings.interval = parseInt(autoSaveInterval.value);
                if (typeof saveAutoSaveSettings === 'function') saveAutoSaveSettings();
                if (typeof applyAutoSaveSettings === 'function') applyAutoSaveSettings();
            }
            alert('自动保存设置已保存');
        };
    }
    
    if (autoSaveEnable && intervalDiv) {
        autoSaveEnable.onchange = function(e) {
            intervalDiv.style.display = e.target.checked ? 'block' : 'none';
        };
    }
}

// 重写安全设置渲染函数，确保按钮可点
window.renderSecuritySettingsUI = function() {
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">安全设置</h3>
                <div style="margin-bottom: 20px;">
                    <h4>密码保护</h4>
                    <p style="color: #888; margin-bottom: 12px;">设置启动密码，保护您的作品隐私</p>
                    <button id="pwdBtn" class="small-btn" style="width: 100%; background: #007aff; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">设置密码保护</button>
                </div>
                <div>
                    <h4>密保问题</h4>
                    <p style="color: #888; margin-bottom: 12px;">设置密保问题，用于找回密码</p>
                    <button id="secBtn" class="small-btn" style="width: 100%; background: #007aff; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">设置密保问题</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(fixSecurityButtons, 100);
};

// 重写备份设置渲染函数
window.renderBackupSettingsUI = function() {
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">备份设置</h3>
                <div>
                    <h4>备份策略</h4>
                    <label style="display: block; margin-bottom: 8px;">
                        <input type="radio" name="backupType" value="auto" checked> 定时自动备份
                    </label>
                    <label style="display: block; margin-bottom: 16px;">
                        <input type="radio" name="backupType" value="manual"> 仅手动备份
                    </label>
                    <div style="display: flex; gap: 12px;">
                        <button id="backupBtn" class="small-btn" style="background: #007aff; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">立即备份</button>
                        <button id="restoreBtn" class="small-btn" style="background: #6c757d; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">恢复备份</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(fixBackupButtons, 100);
};

// 重写自动保存设置渲染函数
window.renderAutoSaveSettingsUI = function() {
    var enabled = true;
    var interval = 30;
    if (typeof autoSaveSettings !== 'undefined' && autoSaveSettings) {
        enabled = autoSaveSettings.enabled;
        interval = autoSaveSettings.interval;
    }
    
    var container = document.getElementById('settingsRightContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;">保存设置</h3>
                <div style="margin-bottom: 20px;">
                    <h4>自动保存</h4>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <input type="checkbox" id="autoSaveEnableChk" ${enabled ? 'checked' : ''}>
                        <span>启用自动保存</span>
                    </label>
                    <div id="autoSaveIntervalDiv" style="${enabled ? 'display: block;' : 'display: none;'}">
                        <label>保存间隔：</label>
                        <select id="autoSaveIntervalSelect" style="width: 100%; padding: 8px; margin-top: 8px; border-radius: 6px; border: 1px solid #ddd;">
                            <option value="10" ${interval === 10 ? 'selected' : ''}>10秒</option>
                            <option value="30" ${interval === 30 ? 'selected' : ''}>30秒</option>
                            <option value="60" ${interval === 60 ? 'selected' : ''}>1分钟</option>
                            <option value="120" ${interval === 120 ? 'selected' : ''}>2分钟</option>
                            <option value="300" ${interval === 300 ? 'selected' : ''}>5分钟</option>
                        </select>
                    </div>
                    <button id="saveAutoSaveChkBtn" class="small-btn" style="margin-top: 16px; background: #007aff; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer;">保存设置</button>
                </div>
                <div>
                    <h4>手动保存</h4>
                    <button id="manualSaveChkBtn" class="primary-btn" style="width: 100%; background: #007aff; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer;">立即保存当前章节</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(fixAutoSaveButtons, 100);
};

// 重新初始化
setTimeout(function() {
    var floatBtn2 = document.getElementById('floating-color-btn');
    if (floatBtn2) floatBtn2.remove();
    
    // 如果当前在安全设置页面，重新渲染
    var activeCat = localStorage.getItem('settings_active_category');
    if (activeCat === 'security') {
        renderSecuritySettingsUI();
    } else if (activeCat === 'backup') {
        renderBackupSettingsUI();
    } else if (activeCat === 'autosave') {
        renderAutoSaveSettingsUI();
    }
}, 300);

// 更新所有设置界面的卡片样式，添加主题适配class
function updateAllSettingsCards() {
    var cards = document.querySelectorAll('#settingsRightContent > div > div');
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.add('settings-card');
    }
}

// 在渲染完成后调用
var originalRenderTheme = renderThemeSettingsUI;
if (typeof renderThemeSettingsUI === 'function') {
    window.renderThemeSettingsUI = function() {
        originalRenderTheme();
        setTimeout(updateAllSettingsCards, 50);
    };
}

var originalRenderSecurity = renderSecuritySettingsUI;
if (typeof renderSecuritySettingsUI === 'function') {
    window.renderSecuritySettingsUI = function() {
        originalRenderSecurity();
        setTimeout(updateAllSettingsCards, 50);
    };
}

var originalRenderBackup = renderBackupSettingsUI;
if (typeof renderBackupSettingsUI === 'function') {
    window.renderBackupSettingsUI = function() {
        originalRenderBackup();
        setTimeout(updateAllSettingsCards, 50);
    };
}

var originalRenderAutoSave = renderAutoSaveSettingsUI;
if (typeof renderAutoSaveSettingsUI === 'function') {
    window.renderAutoSaveSettingsUI = function() {
        originalRenderAutoSave();
        setTimeout(updateAllSettingsCards, 50);
    };
}

// 立即执行一次
setTimeout(updateAllSettingsCards, 500);

// ========== 设置面板主题跟随 ==========
function updateSettingsPanelTheme() {
    var cards = document.querySelectorAll('#settingsRightContent .settings-card');
    if (cards.length === 0) return;
    
    // 检测当前主题
    var isEye = document.body.classList.contains('theme-eye');
    var isWarm = document.body.classList.contains('theme-warm');
    var isDark = document.body.classList.contains('theme-dark');
    
    var bgColor, textColor;
    if (isEye) {
        bgColor = '#b8caa8';
        textColor = '#2c3e2f';
    } else if (isWarm) {
        bgColor = '#c8bda0';
        textColor = '#4a3b2c';
    } else if (isDark) {
        bgColor = '#2a2a3e';
        textColor = '#e0e0e0';
    } else {
        bgColor = '#ffffff';
        textColor = '#333333';
    }
    
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.backgroundColor = bgColor;
        cards[i].style.color = textColor;
    }
    console.log('设置面板主题已更新:', isEye ? '护眼绿' : isWarm ? '经典黄' : isDark ? '暗夜黑' : '默认');
}

// 监听主题切换
var originalApplyTheme = window.applyTheme;
if (typeof originalApplyTheme === 'function') {
    window.applyTheme = function(theme) {
        originalApplyTheme(theme);
        setTimeout(updateSettingsPanelTheme, 100);
    };
}

// 每次切换设置页面时也更新
var originalRenderSettingsRightContent = window.renderSettingsRightContent;
if (typeof originalRenderSettingsRightContent === 'function') {
    window.renderSettingsRightContent = function(category) {
        originalRenderSettingsRightContent(category);
        setTimeout(updateSettingsPanelTheme, 150);
    };
}

// 初始化时执行一次
setTimeout(updateSettingsPanelTheme, 500);
