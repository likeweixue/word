// ========== 一级菜单栏功能 ==========

window.importFile = importFile;
window.toggleFullscreen = toggleFullscreen;
window.openThemePanel = openThemePanel;
window.openFontPanel = openFontPanel;
window.autoFormat = autoFormat;
window.openFindReplacePanel = openFindReplacePanel;
window.openNamegenWindow = openNamegenWindow;
window.toggleDualMode = toggleDualMode;
window.openSeclusionPanel = openSeclusionPanel;
window.openNotesWindow = openNotesWindow;
window.exportChapter = exportChapter;
window.toggleRightSidebar = toggleRightSidebar;
window.openSeclusionPanel = openSeclusionPanel;
window.openExportPanel = openExportPanel;
window.exportBook = exportBook;
function initToolbar() {
    var btns = document.querySelectorAll('.toolbar-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = function() {
            var action = this.getAttribute('data-action');
            handleToolbarAction(action);
        };
    }
}

function handleToolbarAction(action) {
    switch(action) {
        case 'import': importFile(); break;
        case 'fullscreen': toggleFullscreen(); break;
        case 'theme': openThemePanel(); break;
        case 'font': openFontPanel(); break;
        case 'format': autoFormat(); break;
        case 'find': openFindReplacePanel(); break;
        case 'proofread': alert('校对功能开发中'); break;
        case 'namegen': openNamegenWindow(); break;
        case 'dual': toggleDualMode(); break;
        case 'seclusion': openSeclusionPanel(); break;
        case 'notes': openNotesWindow(); break;
        case 'save': if (typeof saveCurrentChapter === 'function') { saveCurrentChapter(); alert('已保存'); } break;
        case 'export': openExportPanel(); break;
        case 'sidebar': toggleRightSidebar(); break;
    }
}

// 主题面板（右侧滑出）
function openThemePanel() {
    var panel = document.getElementById('themeSlidePanel');
    if (panel) {
        panel.classList.toggle('open');
        return;
    }
    var html = `
        <div id="themeSlidePanel" class="right-slide-panel">
            <div class="right-slide-panel-header">
                <h3>主题设置</h3>
                <button class="right-slide-panel-close" onclick="document.getElementById('themeSlidePanel').classList.remove('open')">✕</button>
            </div>
            <div class="right-slide-panel-content">
                <h5>预设主题</h5>
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
                    <button data-theme="default" class="theme-preset-btn" style="padding:6px 12px;cursor:pointer;">默认白</button>
                    <button data-theme="eye" class="theme-preset-btn" style="padding:6px 12px;cursor:pointer;">护眼绿</button>
                    <button data-theme="warm" class="theme-preset-btn" style="padding:6px 12px;cursor:pointer;">经典黄</button>
                    <button data-theme="dark" class="theme-preset-btn" style="padding:6px 12px;cursor:pointer;">暗夜黑</button>
                </div>
                <h5>网格线</h5>
                <label style="display:block; margin-bottom:20px;"><input type="checkbox" id="gridLinesCheckboxSlide"> 显示网格线</label>
                <h5>背景图片</h5>
                <input type="file" id="themeBgUploadSlide" accept="image/*" style="margin-bottom:8px; width:100%;">
                <div id="themeBgPreviewSlide" style="width:100%; height:80px; background:#ddd; border-radius:6px; margin-bottom:12px; background-size:cover;"></div>
                <div style="margin-bottom:20px;">
                    <span>透明度: <span id="themeOpacityValSlide">30</span>%</span>
                    <input type="range" id="themeOpacitySliderSlide" min="0" max="100" value="30" style="width:100%;">
                </div>
                <h5>全局文字颜色</h5>
                <input type="color" id="globalTextColorSlide" value="#333333" style="width:100%;">
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 预设主题按钮
    var presetBtns = document.querySelectorAll('.theme-preset-btn');
    for (var i = 0; i < presetBtns.length; i++) {
        presetBtns[i].onclick = function() {
            var theme = this.getAttribute('data-theme');
            var link = document.getElementById('themeStyle');
            if (link) link.href = 'themes/' + theme + '.css';
            document.body.classList.remove('theme-default', 'theme-eye', 'theme-warm', 'theme-dark');
            document.body.classList.add('theme-' + theme);
            localStorage.setItem('app_theme', theme);
        };
    }
    
    // 网格线
    var gridCheck = document.getElementById('gridLinesCheckboxSlide');
    if (gridCheck) {
        gridCheck.onchange = function() {
            var editor = document.getElementById('editor');
            if (editor) {
                if (this.checked) editor.classList.add('show-grid');
                else editor.classList.remove('show-grid');
            }
        };
    }
    
    // 背景上传
    var bgUpload = document.getElementById('themeBgUploadSlide');
    var bgPreview = document.getElementById('themeBgPreviewSlide');
    var opacitySlider = document.getElementById('themeOpacitySliderSlide');
    var opacityVal = document.getElementById('themeOpacityValSlide');
    
    if (bgUpload) {
        bgUpload.onchange = function(e) {
            var file = e.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(ev) {
                    var img = ev.target.result;
                    bgPreview.style.backgroundImage = 'url(' + img + ')';
                    applyGlobalBg(img, opacitySlider ? parseInt(opacitySlider.value) : 30);
            document.body.classList.add('has-custom-bg');
                };
                reader.readAsDataURL(file);
            }
        };
    }
    if (opacitySlider) {
        opacitySlider.oninput = function() {
            opacityVal.textContent = this.value;
            var img = bgPreview.style.backgroundImage.slice(5, -2);
            if (img && img !== 'null') applyGlobalBg(img, parseInt(this.value));
        };
    }
    
    var colorPicker = document.getElementById('globalTextColorSlide');
    if (colorPicker) {
        colorPicker.onchange = function() {
            var color = this.value;
            var style = document.getElementById('global-color-style');
            if (style) style.remove();
            var newStyle = document.createElement('style');
            newStyle.id = 'global-color-style';
            newStyle.textContent = '* { color: ' + color + ' !important; }';
            document.head.appendChild(newStyle);
            localStorage.setItem('global_text_color', color);
        };
        var savedColor = localStorage.getItem('global_text_color');
        if (savedColor) colorPicker.value = savedColor;
    }
}

// 字体面板（右侧滑出）
function openFontPanel() {
    var panel = document.getElementById('fontSlidePanel');
    if (panel) {
        panel.classList.toggle('open');
        return;
    }
    var html = `
        <div id="fontSlidePanel" class="right-slide-panel">
            <div class="right-slide-panel-header">
                <h3>字体设置</h3>
                <button class="right-slide-panel-close" onclick="document.getElementById('fontSlidePanel').classList.remove('open')">✕</button>
            </div>
            <div class="right-slide-panel-content">
                <label>字体：</label>
                <select id="fontFamilySlide" style="width:100%; margin:8px 0 16px; padding:8px;">
                    <option value="system-ui">系统默认</option>
                    <option value="Georgia, serif">宋体风格</option>
                    <option value="PingFang SC, Microsoft YaHei">苹方/雅黑</option>
                    <option value="KaiTi, serif">楷体</option>
                    <option value="Courier New, monospace">等宽字体</option>
                </select>
                <label>字号：</label>
                <select id="fontSizeSlide" style="width:100%; margin:8px 0 16px; padding:8px;">
                    <option value="12">12px</option>
                    <option value="14" selected>14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                    <option value="20">20px</option>
                    <option value="24">24px</option>
                </select>
                <label>行高：</label>
                <select id="lineHeightSlide" style="width:100%; margin:8px 0 16px; padding:8px;">
                    <option value="1.5">1.5</option>
                    <option value="1.8" selected>1.8</option>
                    <option value="2.0">2.0</option>
                    <option value="2.5">2.5</option>
                </select>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    var fontFamily = document.getElementById('fontFamilySlide');
    var fontSize = document.getElementById('fontSizeSlide');
    var lineHeight = document.getElementById('lineHeightSlide');
    var editor = document.getElementById('editor');
    
    if (fontFamily) {
        fontFamily.onchange = function() {
            if (editor) editor.style.fontFamily = this.value;
            localStorage.setItem('editor_font_family', this.value);
        };
        var savedFont = localStorage.getItem('editor_font_family');
        if (savedFont) fontFamily.value = savedFont;
        if (editor && savedFont) editor.style.fontFamily = savedFont;
    }
    if (fontSize) {
        fontSize.onchange = function() {
            if (editor) editor.style.fontSize = this.value + 'px';
            localStorage.setItem('editor_font_size', this.value);
        };
        var savedSize = localStorage.getItem('editor_font_size');
        if (savedSize) fontSize.value = savedSize;
        if (editor && savedSize) editor.style.fontSize = savedSize + 'px';
    }
    if (lineHeight) {
        lineHeight.onchange = function() {
            if (editor) editor.style.lineHeight = this.value;
            localStorage.setItem('editor_line_height', this.value);
        };
        var savedLine = localStorage.getItem('editor_line_height');
        if (savedLine) lineHeight.value = savedLine;
        if (editor && savedLine) editor.style.lineHeight = savedLine;
    }
}

// 查找替换面板（右侧滑出）
function openFindReplacePanel() {
    var panel = document.getElementById('findSlidePanel');
    if (panel) {
        panel.classList.toggle('open');
        return;
    }
    var html = `
        <div id="findSlidePanel" class="right-slide-panel">
            <div class="right-slide-panel-header">
                <h3>查找替换</h3>
                <button class="right-slide-panel-close" onclick="document.getElementById('findSlidePanel').classList.remove('open')">✕</button>
            </div>
            <div class="right-slide-panel-content">
                <input type="text" id="findTextSlide" placeholder="查找内容" style="width:100%; padding:10px; margin-bottom:16px; border:1px solid #ddd; border-radius:6px;">
                <input type="text" id="replaceTextSlide" placeholder="替换为" style="width:100%; padding:10px; margin-bottom:16px; border:1px solid #ddd; border-radius:6px;">
                <div style="display:flex; gap:12px;">
                    <button id="findNextBtnSlide" class="btn-primary" style="flex:1; padding:8px;">查找下一个</button>
                    <button id="replaceBtnSlide" class="btn-primary" style="flex:1; padding:8px;">替换</button>
                    <button id="replaceAllBtnSlide" class="btn-primary" style="flex:1; padding:8px;">全部替换</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    document.getElementById('findNextBtnSlide').onclick = function() {
        var findText = document.getElementById('findTextSlide').value;
        if (!findText) return;
        var editor = document.getElementById('editor');
        if (editor) {
            var content = editor.innerText;
            if (content.indexOf(findText) !== -1) alert('找到匹配内容');
            else alert('没有找到');
        }
    };
    document.getElementById('replaceBtnSlide').onclick = function() {
        var findText = document.getElementById('findTextSlide').value;
        var replaceText = document.getElementById('replaceTextSlide').value;
        var editor = document.getElementById('editor');
        if (editor && findText) {
            editor.innerHTML = editor.innerHTML.replace(new RegExp(findText, 'g'), replaceText);
            if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
        }
    };
    document.getElementById('replaceAllBtnSlide').onclick = function() {
        var findText = document.getElementById('findTextSlide').value;
        var replaceText = document.getElementById('replaceTextSlide').value;
        var editor = document.getElementById('editor');
        if (editor && findText) {
            var regex = new RegExp(findText, 'g');
            editor.innerHTML = editor.innerHTML.replace(regex, replaceText);
            if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
            alert('替换完成');
        }
    };
}

function importFile() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(ev) {
                var ch = typeof getCurrentChapter === 'function' ? getCurrentChapter() : null;
                if (ch) {
                    ch.content = '<p>' + escapeHtml(ev.target.result).replace(/\n/g, '<br>') + '</p>';
                    if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
                    if (typeof renderCurrentChapter === 'function') renderCurrentChapter();
                    alert('导入成功');
                }
            };
            reader.readAsText(file, 'UTF-8');
        }
    };
    input.click();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function autoFormat() {
    var editor = document.getElementById('editor');
    if (!editor) return;
    var html = editor.innerHTML;
    html = html.replace(/<p><br><\/p>/g, '<p></p>');
    html = html.replace(/([。！？；])([^"'])/g, '$1<br>$2');
    editor.innerHTML = html;
    if (typeof saveCurrentChapter === 'function') saveCurrentChapter();
    alert('排版完成');
}

function openNamegenWindow() {
    var win = window.open('', 'namegen', 'width=600,height=500,left=200,top=100');
    win.document.write('<!DOCTYPE html><html><head><title>起名助手</title><style>body{font-family:system-ui;padding:20px;background:#f5f5f5;}.container{max-width:500px;margin:0 auto;}select,button{padding:8px 16px;margin:8px 0;}.result{font-size:24px;font-weight:bold;text-align:center;padding:30px;background:white;border-radius:12px;margin:20px 0;}</style></head><body><div class="container"><h2>起名助手</h2><select id="nameType"><option value="person">人物名</option><option value="place">地名</option></select><button id="generateBtn">随机生成</button><div class="result" id="result">点击生成</div><button id="copyBtn">复制</button></div><script>var surnames=["林","陈","李","张","王"];var givenNames=["轩","宇","辰","逸"];var prefixes=["苍","玄","天","云"];var suffixes=["山","峰","岭","谷"];function generateName(type){if(type==="person"){return surnames[Math.floor(Math.random()*surnames.length)]+givenNames[Math.floor(Math.random()*givenNames.length)];}return prefixes[Math.floor(Math.random()*prefixes.length)]+suffixes[Math.floor(Math.random()*suffixes.length)];}document.getElementById("generateBtn").onclick=function(){var type=document.getElementById("nameType").value;var name=generateName(type);document.getElementById("result").innerText=name;};document.getElementById("copyBtn").onclick=function(){var name=document.getElementById("result").innerText;if(name&&name!=="点击生成"){navigator.clipboard.writeText(name);alert("已复制");}};<\/script></body></html>');
}

function toggleDualMode() {
    var editor = document.getElementById('editor');
    if (!editor) return;
    var editorContainer = editor.parentElement;
    var existingDual = document.getElementById('dualEditor');
    if (existingDual) {
        existingDual.remove();
        editor.style.display = 'block';
        alert('已退出双栏模式');
    } else {
        var originalContent = editor.innerHTML;
        editor.style.display = 'none';
        var dualHtml = '<div id="dualEditor" style="display:flex; flex:1; gap:16px; padding:0 16px 16px 16px;">';
        dualHtml += '<div style="flex:1; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #ddd;"><div style="padding:8px; background:#f0f0f0; border-bottom:1px solid #ddd;">原模式</div><div id="dualLeft" contenteditable="true" style="flex:1; padding:16px; overflow-y:auto; outline:none;">' + originalContent + '</div></div>';
        dualHtml += '<div style="flex:1; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #ddd;"><div style="padding:8px; background:#f0f0f0; border-bottom:1px solid #ddd;">精简模式</div><div id="dualRight" contenteditable="true" style="flex:1; padding:16px; overflow-y:auto; outline:none;">' + originalContent + '</div></div>';
        dualHtml += '</div><button id="closeDualMode" style="position:fixed; bottom:20px; right:20px; padding:8px 16px; background:#dc3545; color:white; border:none; border-radius:6px; cursor:pointer;">退出双栏</button>';
        editorContainer.insertAdjacentHTML('beforeend', dualHtml);
        var leftEditor = document.getElementById('dualLeft');
        var rightEditor = document.getElementById('dualRight');
        var closeBtn = document.getElementById('closeDualMode');
        if (leftEditor && rightEditor) {
            leftEditor.addEventListener('input', function() { rightEditor.innerHTML = this.innerHTML; editor.innerHTML = this.innerHTML; if (typeof saveCurrentChapter === 'function') saveCurrentChapter(); });
            rightEditor.addEventListener('input', function() { leftEditor.innerHTML = this.innerHTML; editor.innerHTML = this.innerHTML; if (typeof saveCurrentChapter === 'function') saveCurrentChapter(); });
        }
        if (closeBtn) closeBtn.onclick = function() { document.getElementById('dualEditor').remove(); closeBtn.remove(); editor.style.display = 'block'; };
    }
}

var seclusionActive = false, seclusionTimer = null, seclusionCheckInterval = null;

function openSeclusionPanel() {
    var panel = document.getElementById('seclusionPanel');
    if (panel) panel.style.display = 'block';
}

function startSeclusion() {
    var goal = parseInt(document.getElementById('seclusionGoal').value);
    var timeout = parseInt(document.getElementById('seclusionTimeout').value);
    if (isNaN(goal) || goal <= 0) { alert('请输入有效的目标字数'); return; }
    seclusionActive = true;
    var startWords = getCurrentWordCount();
    document.getElementById('seclusionProgress').style.display = 'block';
    document.getElementById('seclusionGoalDisplay').innerText = goal;
    document.getElementById('startSeclusionBtn').style.display = 'none';
    document.getElementById('stopSeclusionBtn').style.display = 'block';
    if (timeout > 0) seclusionTimer = setTimeout(function() { if (seclusionActive) { endSeclusion(false); alert('时间到，自动出关！'); } }, timeout * 3600000);
    if (seclusionCheckInterval) clearInterval(seclusionCheckInterval);
    seclusionCheckInterval = setInterval(function() {
        if (!seclusionActive) { clearInterval(seclusionCheckInterval); return; }
        var current = getCurrentWordCount();
        var progress = Math.min(100, (current - startWords) / goal * 100);
        document.getElementById('seclusionCurrent').innerText = current - startWords;
        document.getElementById('seclusionProgressFill').style.width = progress + '%';
        if (current - startWords >= goal) { endSeclusion(true); alert('恭喜！完成闭关目标！'); clearInterval(seclusionCheckInterval); }
    }, 1000);
    document.getElementById('seclusionPanel').style.display = 'none';
}

function endSeclusion(success) {
    seclusionActive = false;
    if (seclusionTimer) clearTimeout(seclusionTimer);
    var startBtn = document.getElementById('startSeclusionBtn');
    var stopBtn = document.getElementById('stopSeclusionBtn');
    var progressDiv = document.getElementById('seclusionProgress');
    if (startBtn) startBtn.style.display = 'block';
    if (stopBtn) stopBtn.style.display = 'none';
    if (progressDiv) progressDiv.style.display = 'none';
}

function getCurrentWordCount() {
    if (typeof getCurrentChapter === 'function') {
        var ch = getCurrentChapter();
        if (ch && ch.content) return ch.content.replace(/<[^>]*>/g, '').length;
    }
    var editor = document.getElementById('editor');
    if (editor) return editor.innerText.length;
    return 0;
}

function openNotesWindow() {
    window.open('', 'notes', 'width=800,height=600,left=100,top=50').document.write('<!DOCTYPE html><html><head><title>笔记</title><style>body{font-family:system-ui;margin:0;display:flex;height:100vh;}.sidebar{width:200px;border-right:1px solid #ddd;padding:16px;}.editor{flex:1;display:flex;flex-direction:column;padding:16px;}.editor textarea{flex:1;padding:12px;border:1px solid #ddd;border-radius:8px;}</style></head><body><div class="sidebar"><h3>我的笔记</h3><button id="newNoteBtn">+ 新建</button><div id="noteList"></div></div><div class="editor"><textarea id="noteContent" placeholder="笔记内容..."></textarea><button id="saveNoteBtn" style="margin-top:12px;">保存</button></div><script>var notes=JSON.parse(localStorage.getItem("user_notes")||\'[{"id":1,"content":"在这里记录写作灵感"}]\');var currentId=notes[0]?notes[0].id:null;function render(){var html=\'<ul style="list-style:none;padding:0;">\'+notes.map(function(n){return\'<li style="padding:8px;cursor:pointer;" onclick="loadNote(\'+n.id+\')">\'+escapeHtml(n.content.substring(0,30))+"</li>"}).join("")+"</ul>";document.getElementById("noteList").innerHTML=html;}function loadNote(id){var note=notes.find(function(n){return n.id===id;});if(note){currentId=note.id;document.getElementById("noteContent").value=note.content;}}function saveNote(){var content=document.getElementById("noteContent").value;if(!content)return;var note=notes.find(function(n){return n.id===currentId;});if(note){note.content=content;}else{notes.push({id:Date.now(),content:content});currentId=notes[notes.length-1].id;}localStorage.setItem("user_notes",JSON.stringify(notes));render();alert("已保存");}function newNote(){notes.push({id:Date.now(),content:"新笔记"});currentId=notes[notes.length-1].id;render();loadNote(currentId);}function escapeHtml(str){if(!str)return"";return str.replace(/[&<>]/g,function(m){if(m==="&")return"&amp;";if(m==="<")return"&lt;";if(m===">")return"&gt;";return m;});}document.getElementById("newNoteBtn").onclick=newNote;document.getElementById("saveNoteBtn").onclick=saveNote;render();if(notes.length>0)loadNote(notes[0].id);<\/script></body></html>');
}

function exportChapter() {
    if (typeof getCurrentChapter === 'function') {
        var ch = getCurrentChapter();
        if (ch) {
            var content = ch.content.replace(/<[^>]*>/g, '');
            var blob = new Blob([content], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = (ch.title || '章节') + '.txt';
            a.click();
            URL.revokeObjectURL(url);
            alert('导出成功');
        }
    }
}

function toggleRightSidebar() {
    var sidebar = document.getElementById('rightSidebar');
    if (sidebar) sidebar.classList.toggle('hidden');
}

function clearCustomBg() {
    document.body.classList.remove('has-custom-bg');
}

function applyGlobalBg(imageUrl, opacity) {
    var oldStyle = document.getElementById('global-bg-style');
    if (oldStyle) oldStyle.remove();
    if (imageUrl) {
        var style = document.createElement('style');
        style.id = 'global-bg-style';
        style.textContent = 'body::before { content: ""; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: url(' + JSON.stringify(imageUrl) + '); background-size: cover; background-position: center; opacity: ' + (opacity / 100) + '; z-index: -1; pointer-events: none; } .page, .sidebar-menu, .main-content, .book-detail-page { background: transparent !important; }';
        document.head.appendChild(style);
    }
}

setTimeout(function() {
    initToolbar();
    var startBtn = document.getElementById('startSeclusionBtn');
    var stopBtn = document.getElementById('stopSeclusionBtn');
    var closePanel = document.getElementById('closeSeclusionPanel');
    if (startBtn) startBtn.onclick = startSeclusion;
    if (stopBtn) stopBtn.onclick = function() { endSeclusion(false); alert('闭关已结束'); };
    if (closePanel) closePanel.onclick = function() { document.getElementById('seclusionPanel').style.display = 'none'; };
    var savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) {
        var link = document.getElementById('themeStyle');
        if (link) link.href = 'themes/' + savedTheme + '.css';
        document.body.classList.add('theme-' + savedTheme);
    }
}, 500);

// 闭关面板（右侧滑出）
function openSeclusionPanel() {
    var panel = document.getElementById('seclusionSlidePanel');
    if (panel) {
        panel.classList.toggle('open');
        return;
    }
    var html = `
        <div id="seclusionSlidePanel" class="right-slide-panel">
            <div class="right-slide-panel-header">
                <h3>闭关修炼</h3>
                <button class="right-slide-panel-close" onclick="document.getElementById('seclusionSlidePanel').classList.remove('open')">✕</button>
            </div>
            <div class="right-slide-panel-content">
                <label>目标字数：</label>
                <input type="number" id="seclusionGoal" value="3000" style="width:100%; padding:8px; margin:8px 0; border:1px solid #ddd; border-radius:6px;">
                <label>自动出关时间（小时，0表示不限制）：</label>
                <input type="number" id="seclusionTimeout" value="0" style="width:100%; padding:8px; margin:8px 0; border:1px solid #ddd; border-radius:6px;">
                <div id="seclusionProgress" style="margin:16px 0; display:none;">
                    <div>当前进度：<span id="seclusionCurrent">0</span> / <span id="seclusionGoalDisplay">3000</span> 字</div>
                    <div style="height:8px; background:#e0e0e0; border-radius:4px; margin-top:8px; overflow:hidden;">
                        <div id="seclusionProgressFill" style="height:100%; background:#007aff; width:0%; transition:width 0.3s;"></div>
                    </div>
                </div>
                <button id="startSeclusionBtn" class="btn-primary" style="width:100%; padding:10px; margin-top:8px;">开始闭关</button>
                <button id="stopSeclusionBtn" class="btn-danger" style="width:100%; padding:10px; margin-top:8px; display:none;">结束闭关</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    document.getElementById('startSeclusionBtn').onclick = startSeclusion;
    document.getElementById('stopSeclusionBtn').onclick = function() { endSeclusion(false); alert('闭关已结束'); };
    document.getElementById('seclusionSlidePanel').classList.add('open');
}

// 导出面板（右侧滑出）
function openExportPanel() {
    var panel = document.getElementById('exportSlidePanel');
    if (panel) {
        panel.classList.toggle('open');
        return;
    }
    var html = `
        <div id="exportSlidePanel" class="right-slide-panel">
            <div class="right-slide-panel-header">
                <h3>导出</h3>
                <button class="right-slide-panel-close" onclick="document.getElementById('exportSlidePanel').classList.remove('open')">✕</button>
            </div>
            <div class="right-slide-panel-content">
                <button id="exportChapterBtn" class="btn-primary" style="width:100%; padding:12px; margin-bottom:12px;">导出本章</button>
                <button id="exportBookBtn" class="btn-secondary" style="width:100%; padding:12px;">导出全书</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    document.getElementById('exportChapterBtn').onclick = function() {
        exportChapter();
        document.getElementById('exportSlidePanel').classList.remove('open');
    };
    document.getElementById('exportBookBtn').onclick = function() {
        exportBook();
        document.getElementById('exportSlidePanel').classList.remove('open');
    };
    document.getElementById('exportSlidePanel').classList.add('open');
}

// 导出全书功能
function exportBook() {
    if (typeof getCurrentBook !== 'function') {
        alert('请先打开一本书籍');
        return;
    }
    var book = getCurrentBook();
    if (!book) {
        alert('请先打开一本书籍');
        return;
    }
    var content = '';
    if (book.volumes) {
        for (var v = 0; v < book.volumes.length; v++) {
            var vol = book.volumes[v];
            content += '【' + vol.name + '】\n\n';
            if (vol.chapters) {
                for (var c = 0; c < vol.chapters.length; c++) {
                    var ch = vol.chapters[c];
                    content += ch.title + '\n';
                    content += ch.content.replace(/<[^>]*>/g, '') + '\n\n';
                }
            }
        }
    }
    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (book.title || '全书') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    alert('全书导出成功');
}

// 修改导出按钮的 action
function updateExportAction() {
    var exportBtn = document.querySelector('.toolbar-btn[data-action="export"]');
    if (exportBtn) {
        exportBtn.onclick = function() {
            openExportPanel();
        };
    }
}

setTimeout(updateExportAction, 500);

// 透明背景模式
function setTransparentMode(enable) {
    var elements = document.querySelectorAll('.tabs-container, .main-toolbar, .detail-editor, .editor-content, .title-input, .status-bar, .chapters-header, .volume-list, .volume-title, .chapter-list, .chapter-item, .right-sidebar, .right-slide-panel');
    for (var i = 0; i < elements.length; i++) {
        if (enable) {
            elements[i].style.setProperty('background', 'transparent', 'important');
            elements[i].style.setProperty('backdrop-filter', 'none', 'important');
        } else {
            elements[i].style.removeProperty('background');
            elements[i].style.removeProperty('backdrop-filter');
        }
    }
    
    var btns = document.querySelectorAll('#addVolumeBtn, #addChapterBtn');
    for (var i = 0; i < btns.length; i++) {
        if (enable) {
            btns[i].style.setProperty('background', 'rgba(184, 202, 181, 0.5)', 'important');
        } else {
            btns[i].style.removeProperty('background');
        }
    }
    
    var trashBtn = document.getElementById('trashBtnHeader');
    if (trashBtn) {
        if (enable) {
            trashBtn.style.setProperty('background', 'rgba(220, 53, 69, 0.7)', 'important');
        } else {
            trashBtn.style.removeProperty('background');
        }
    }
}

// 修改应用背景的函数
var originalApplyGlobalBg = applyGlobalBg;
window.applyGlobalBg = function(imageUrl, opacity) {
    originalApplyGlobalBg(imageUrl, opacity);
    setTransparentMode(true);
    document.body.classList.add('has-custom-bg');
};

// 修改清除背景的函数
var originalClearBg = function() {
    var oldStyle = document.getElementById('global-bg-style');
    if (oldStyle) oldStyle.remove();
    setTransparentMode(false);
    document.body.classList.remove('has-custom-bg');
};

// 替换清除按钮的功能
setTimeout(function() {
    var clearBtn = document.getElementById('themeClearBg');
    if (clearBtn) {
        clearBtn.onclick = function() {
            originalClearBg();
            var preview = document.getElementById('themeBgPreview');
            if (preview) preview.style.backgroundImage = '';
            alert('背景已清除');
        };
    }
}, 500);
