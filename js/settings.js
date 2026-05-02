// 设置相关函数

// 获取某一天的写作数据
function getWritingDataForDate(date) {
  var dateStr = date.toISOString().slice(0, 10);
  var total = 0;
  var details = [];
  
  for (var i = 0; i < books.length; i++) {
    var book = books[i];
    if (book.volumes) {
      for (var j = 0; j < book.volumes.length; j++) {
        var vol = book.volumes[j];
        if (vol.chapters) {
          for (var k = 0; k < vol.chapters.length; k++) {
            var ch = vol.chapters[k];
            if (ch.content && ch.updatedTime) {
              var updateDate = new Date(ch.updatedTime).toISOString().slice(0, 10);
              if (updateDate === dateStr) {
                var words = ch.content.replace(/<[^>]*>/g, '').length;
                total += words;
                details.push({
                  bookTitle: book.title,
                  chapterTitle: ch.title,
                  words: words
                });
              }
            }
          }
        }
      }
    }
  }
  
  return { total: total, details: details };
}

// 获取日期范围的统计数据
function getStatsForRange(startDate, endDate) {
  var total = 0;
  var dailyData = {};
  
  for (var i = 0; i < books.length; i++) {
    var book = books[i];
    if (book.volumes) {
      for (var j = 0; j < book.volumes.length; j++) {
        var vol = book.volumes[j];
        if (vol.chapters) {
          for (var k = 0; k < vol.chapters.length; k++) {
            var ch = vol.chapters[k];
            if (ch.content && ch.updatedTime) {
              var updateDate = new Date(ch.updatedTime);
              if (updateDate >= startDate && updateDate <= endDate) {
                var dateStr = updateDate.toISOString().slice(0, 10);
                var words = ch.content.replace(/<[^>]*>/g, '').length;
                total += words;
                dailyData[dateStr] = (dailyData[dateStr] || 0) + words;
              }
            }
          }
        }
      }
    }
  }
  
  return { total: total, dailyData: dailyData };
}

function updateStats() {
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  var weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // 计算今日
  var todayStats = getStatsForRange(today, today);
  // 计算昨日
  var yesterdayStats = getStatsForRange(yesterday, yesterday);
  // 计算本周
  var weekStats = getStatsForRange(weekStart, today);
  // 计算本月
  var monthStats = getStatsForRange(monthStart, today);
  // 计算总字数
  var totalAll = 0;
  for (var i = 0; i < books.length; i++) {
    var book = books[i];
    if (book.volumes) {
      for (var j = 0; j < book.volumes.length; j++) {
        var vol = book.volumes[j];
        if (vol.chapters) {
          for (var k = 0; k < vol.chapters.length; k++) {
            var ch = vol.chapters[k];
            if (ch.content) {
              totalAll += ch.content.replace(/<[^>]*>/g, '').length;
            }
          }
        }
      }
    }
  }
  
  // 更新页面显示
  var todayEl = document.getElementById('todayWords');
  var yesterdayEl = document.getElementById('yesterdayWords');
  var weekEl = document.getElementById('weekWords');
  var monthEl = document.getElementById('monthWords');
  var totalEl = document.getElementById('totalWords');
  
  if (todayEl) todayEl.innerText = todayStats.total;
  if (yesterdayEl) yesterdayEl.innerText = yesterdayStats.total;
  if (weekEl) weekEl.innerText = weekStats.total;
  if (monthEl) monthEl.innerText = monthStats.total;
  if (totalEl) totalEl.innerText = totalAll;
  
  // 更新目标进度
  var goal = parseInt(localStorage.getItem('dailyGoal') || 0);
  if (goal > 0 && todayEl) {
    var percent = Math.min(100, (todayStats.total / goal) * 100);
    var fillBar = document.querySelector('.progress-fill');
    if (fillBar) fillBar.style.width = percent + '%';
    var msgEl = document.getElementById('goalMessage');
    if (msgEl) msgEl.innerText = '今日 ' + todayStats.total + '/' + goal + ' 字 (' + Math.floor(percent) + '%)';
  }
  
  // 更新日历
  renderCalendar();
}

// 日历相关变量
var currentCalendarDate = new Date();

function renderCalendar() {
  var year = currentCalendarDate.getFullYear();
  var month = currentCalendarDate.getMonth();
  
  var firstDay = new Date(year, month, 1);
  var lastDay = new Date(year, month + 1, 0);
  var startWeekday = firstDay.getDay();
  
  // 更新标题
  var monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  var titleEl = document.getElementById('calendarMonth');
  if (titleEl) titleEl.innerText = year + '年 ' + monthNames[month];
  
  // 获取本月所有日期的写作数据
  var daysInMonth = lastDay.getDate();
  var writingData = {};
  for (var d = 1; d <= daysInMonth; d++) {
    var date = new Date(year, month, d);
    var stats = getStatsForRange(date, date);
    if (stats.total > 0) {
      writingData[d] = stats.total;
    }
  }
  
  // 生成日历格子
  var container = document.getElementById('calendarDays');
  if (!container) return;
  container.innerHTML = '';
  
  // 填充空白
  for (var i = 0; i < startWeekday; i++) {
    var emptyDiv = document.createElement('div');
    emptyDiv.className = 'calendar-day';
    container.appendChild(emptyDiv);
  }
  
  // 填充日期
  var today = new Date();
  for (var d = 1; d <= daysInMonth; d++) {
    var dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === d) {
      dayDiv.classList.add('today');
    }
    if (writingData[d]) {
      dayDiv.classList.add('has-writing');
    }
    
    dayDiv.innerHTML = '<span>' + d + '</span>';
    if (writingData[d]) {
      dayDiv.innerHTML += '<span class="word-count-badge">' + writingData[d] + '</span>';
    }
    
    dayDiv.onclick = (function(y, m, day) {
      return function() { showWritingDetail(y, m, day); };
    })(year, month, d);
    
    container.appendChild(dayDiv);
  }
}

function showWritingDetail(year, month, day) {
  var date = new Date(year, month, day);
  var stats = getStatsForRange(date, date);
  var detailContainer = document.getElementById('writingDetailList');
  var dateTitle = document.getElementById('selectedDate');
  
  if (dateTitle) dateTitle.innerText = year + '年' + (month+1) + '月' + day + '日';
  
  if (detailContainer) {
    if (stats.details && stats.details.length > 0) {
      var html = '';
      for (var i = 0; i < stats.details.length; i++) {
        var d = stats.details[i];
        html += '<div class="detail-item">' +
          '<span class="book-name">《' + escapeHtml(d.bookTitle) + '》' + (d.chapterTitle ? ' - ' + escapeHtml(d.chapterTitle) : '') + '</span>' +
          '<span class="word-count">' + d.words + '字</span>' +
          '</div>';
      }
      if (stats.total > 0) {
        html += '<div class="detail-item" style="font-weight:600; border-top:1px solid #eee; margin-top:8px; padding-top:8px;">' +
          '<span>当日总计</span><span>' + stats.total + '字</span>' +
          '</div>';
      }
      detailContainer.innerHTML = html;
    } else {
      detailContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">当日无写作记录</div>';
    }
  }
}

function prevMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendar();
}

function applyTheme(theme) {
  var themeLink = document.getElementById('themeStyle');
  themeLink.href = 'themes/' + theme + '.css';
  var presets = document.querySelectorAll('.color-preset');
  for (var i = 0; i < presets.length; i++) {
    var btn = presets[i];
    if (btn.dataset.theme === theme) btn.classList.add('active');
    else btn.classList.remove('active');
  }
  settings.theme = theme;
  saveAllData();
}

function applyGridLine(show) {
  var editor = document.getElementById('editor');
  if (editor) {
    if (show) editor.classList.add('show-grid');
    else editor.classList.remove('show-grid');
  }
  var checkbox = document.getElementById('gridLinesCheckbox');
  if (checkbox) checkbox.checked = show;
  settings.showGrid = show;
  saveAllData();
}

function applyFontFamily(font) {
  var editor = document.getElementById('editor');
  if (editor) editor.style.fontFamily = font;
  var options = document.querySelectorAll('.font-option');
  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    if (opt.dataset.font === font) opt.classList.add('active');
    else opt.classList.remove('active');
  }
  settings.fontFamily = font;
  saveAllData();
}

function applyLineHeight(height) {
  var editor = document.getElementById('editor');
  if (editor) editor.style.lineHeight = height;
  var select = document.getElementById('lineHeightSelect');
  if (select) select.value = height;
  settings.lineHeight = height;
  saveAllData();
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

function saveAllData() { 
  localStorage.setItem('wps_data', JSON.stringify({ books: books, settings: settings })); 
}
// ========== 密码系统 ==========
var passwordConfig = {
  type: 'none', // 'none', 'digit', 'pattern', 'word'
  digit: '',
  pattern: [],
  word: '',
  questions: [
    { q: '', a: '' },
    { q: '', a: '' },
    { q: '', a: '' }
  ]
};

// 加载密码配置
function loadPasswordConfig() {
  var saved = localStorage.getItem('wps_password');
  if (saved) {
    try {
      passwordConfig = JSON.parse(saved);
    } catch(e) {}
  }
}

// 保存密码配置
function savePasswordConfig() {
  localStorage.setItem('wps_password', JSON.stringify(passwordConfig));
}

// 验证密码
function verifyPassword(type, value) {
  if (type === 'digit') {
    return value === passwordConfig.digit;
  } else if (type === 'pattern') {
    return JSON.stringify(value) === JSON.stringify(passwordConfig.pattern);
  } else if (type === 'word') {
    return value === passwordConfig.word;
  }
  return true;
}

// 显示密码验证界面
function showPasswordVerification(callback) {
  if (passwordConfig.type === 'none') {
    if (callback) callback(true);
    return;
  }
  
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:2000; display:flex; align-items:center; justify-content:center;';
  
  var panel = document.createElement('div');
  panel.style.cssText = 'background:white; border-radius:16px; padding:24px; width:320px; text-align:center;';
  
  if (passwordConfig.type === 'digit') {
    panel.innerHTML = '<h3>请输入6位数字密码</h3>' +
      '<input type="password" id="pwdInput" maxlength="6" style="width:100%; padding:12px; margin:16px 0; border:1px solid #ddd; border-radius:8px; font-size:18px; text-align:center;">' +
      '<div style="display:flex; gap:8px;"><button id="pwdConfirm" style="flex:1; padding:10px; background:#007aff; color:white; border:none; border-radius:8px;">确认</button><button id="pwdCancel" style="flex:1; padding:10px; background:#666; color:white; border:none; border-radius:8px;">取消</button></div>' +
      '<button id="forgotBtn" style="margin-top:16px; background:none; border:none; color:#007aff; cursor:pointer;">忘记密码？</button>';
  } else if (passwordConfig.type === 'pattern') {
    panel.innerHTML = '<h3>请绘制图案解锁</h3>' +
      '<div id="patternContainer" style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:200px; margin:20px auto;"></div>' +
      '<div style="display:flex; gap:8px;"><button id="pwdConfirm" style="flex:1; padding:10px; background:#007aff; color:white; border:none; border-radius:8px;">确认</button><button id="pwdCancel" style="flex:1; padding:10px; background:#666; color:white; border:none; border-radius:8px;">取消</button></div>' +
      '<button id="forgotBtn" style="margin-top:16px; background:none; border:none; color:#007aff; cursor:pointer;">忘记密码？</button>';
    
    // 创建9个点
    for (var i = 0; i < 9; i++) {
      var dot = document.createElement('div');
      dot.style.cssText = 'width:40px; height:40px; background:#ddd; border-radius:50%; cursor:pointer; transition:all 0.2s;';
      dot.dataset.index = i;
      dot.onclick = (function(idx) {
        return function() { selectPatternDot(idx); };
      })(i);
      document.getElementById('patternContainer').appendChild(dot);
    }
    var selectedPattern = [];
    function selectPatternDot(idx) {
      if (selectedPattern.indexOf(idx) === -1) {
        selectedPattern.push(idx);
        var dots = document.querySelectorAll('#patternContainer div');
        dots[idx].style.background = '#007aff';
      }
    }
  } else if (passwordConfig.type === 'word') {
    panel.innerHTML = '<h3>请输入密语解锁</h3>' +
      '<input type="text" id="pwdInput" placeholder="请输入自定义密语" style="width:100%; padding:12px; margin:16px 0; border:1px solid #ddd; border-radius:8px;">' +
      '<div style="display:flex; gap:8px;"><button id="pwdConfirm" style="flex:1; padding:10px; background:#007aff; color:white; border:none; border-radius:8px;">确认</button><button id="pwdCancel" style="flex:1; padding:10px; background:#666; color:white; border:none; border-radius:8px;">取消</button></div>' +
      '<button id="forgotBtn" style="margin-top:16px; background:none; border:none; color:#007aff; cursor:pointer;">忘记密码？</button>';
  }
  
  modal.appendChild(panel);
  document.body.appendChild(modal);
  
  document.getElementById('pwdConfirm').onclick = function() {
    var success = false;
    if (passwordConfig.type === 'digit') {
      var val = document.getElementById('pwdInput').value;
      success = (val === passwordConfig.digit);
    } else if (passwordConfig.type === 'pattern') {
      success = (JSON.stringify(selectedPattern) === JSON.stringify(passwordConfig.pattern));
    } else if (passwordConfig.type === 'word') {
      var val = document.getElementById('pwdInput').value;
      success = (val === passwordConfig.word);
    }
    
    if (success) {
      modal.remove();
      if (callback) callback(true);
    } else {
      alert('密码错误！');
    }
  };
  
  document.getElementById('pwdCancel').onclick = function() {
    modal.remove();
    if (callback) callback(false);
  };
  
  document.getElementById('forgotBtn').onclick = function() {
    showForgotPassword(modal);
  };
}

function showForgotPassword(parentModal) {
  parentModal.innerHTML = '';
  var panel = document.createElement('div');
  panel.style.cssText = 'background:white; border-radius:16px; padding:24px; width:360px; text-align:center; max-height:80vh; overflow-y:auto;';
  panel.innerHTML = '<h3>找回密码</h3>';
  
  for (var i = 0; i < 3; i++) {
    panel.innerHTML += '<div style="margin:16px 0; text-align:left;">' +
      '<p style="font-weight:500;">问题' + (i+1) + ': ' + (passwordConfig.questions[i].q || '未设置') + '</p>' +
      '<input type="text" id="answer' + i + '" placeholder="请输入答案" style="width:100%; padding:10px; margin-top:8px; border:1px solid #ddd; border-radius:8px;">' +
      '</div>';
  }
  panel.innerHTML += '<button id="verifyAnswers" style="width:100%; padding:10px; background:#007aff; color:white; border:none; border-radius:8px;">验证答案</button>' +
    '<button id="forgotCancel" style="width:100%; margin-top:12px; padding:10px; background:#666; color:white; border:none; border-radius:8px;">返回</button>';
  
  parentModal.appendChild(panel);
  
  document.getElementById('verifyAnswers').onclick = function() {
    var allCorrect = true;
    for (var i = 0; i < 3; i++) {
      var answer = document.getElementById('answer' + i).value;
      if (answer !== passwordConfig.questions[i].a) {
        allCorrect = false;
        break;
      }
    }
    if (allCorrect) {
      alert('验证成功！请重新设置密码');
      showResetPassword(parentModal);
    } else {
      alert('答案错误！');
    }
  };
  
  document.getElementById('forgotCancel').onclick = function() {
    parentModal.remove();
    location.reload();
  };
}

function showResetPassword(parentModal) {
  parentModal.innerHTML = '';
  var panel = document.createElement('div');
  panel.style.cssText = 'background:white; border-radius:16px; padding:24px; width:360px; text-align:center;';
  panel.innerHTML = '<h3>重置密码</h3>' +
    '<select id="pwdType" style="width:100%; padding:10px; margin:16px 0; border:1px solid #ddd; border-radius:8px;">' +
    '<option value="none">无密码</option>' +
    '<option value="digit">6位数字密码</option>' +
    '<option value="word">密语解锁</option>' +
    '</select>' +
    '<div id="pwdInputArea"></div>' +
    '<button id="saveNewPwd" style="width:100%; padding:10px; background:#007aff; color:white; border:none; border-radius:8px;">保存</button>';
  
  parentModal.appendChild(panel);
  
  function updateInputArea() {
    var type = document.getElementById('pwdType').value;
    var area = document.getElementById('pwdInputArea');
    if (type === 'digit') {
      area.innerHTML = '<input type="password" id="newPwd" maxlength="6" placeholder="6位数字密码" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px;">' +
        '<input type="password" id="confirmPwd" maxlength="6" placeholder="确认密码" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">';
    } else if (type === 'word') {
      area.innerHTML = '<input type="text" id="newPwd" placeholder="自定义密语" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px;">' +
        '<input type="text" id="confirmPwd" placeholder="确认密语" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">';
    } else {
      area.innerHTML = '<p style="color:#888;">无需密码保护</p>';
    }
  }
  
  document.getElementById('pwdType').onchange = updateInputArea;
  updateInputArea();
  
  document.getElementById('saveNewPwd').onclick = function() {
    var type = document.getElementById('pwdType').value;
    passwordConfig.type = type;
    if (type === 'digit') {
      var pwd = document.getElementById('newPwd').value;
      var confirm = document.getElementById('confirmPwd').value;
      if (pwd !== confirm) { alert('两次密码不一致'); return; }
      if (pwd.length !== 6) { alert('请输入6位数字密码'); return; }
      passwordConfig.digit = pwd;
      passwordConfig.pattern = [];
      passwordConfig.word = '';
    } else if (type === 'word') {
      var pwd = document.getElementById('newPwd').value;
      var confirm = document.getElementById('confirmPwd').value;
      if (pwd !== confirm) { alert('两次密语不一致'); return; }
      if (pwd.length === 0) { alert('请输入密语'); return; }
      passwordConfig.word = pwd;
      passwordConfig.digit = '';
      passwordConfig.pattern = [];
    } else {
      passwordConfig.digit = '';
      passwordConfig.pattern = [];
      passwordConfig.word = '';
    }
    savePasswordConfig();
    alert('密码设置成功！');
    parentModal.remove();
    location.reload();
  };
}

// 在页面加载时验证密码
function checkPasswordOnLoad() {
  loadPasswordConfig();
  showPasswordVerification(function(success) {
    if (!success) {
      document.body.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100vh; font-family:system-ui;"><p>验证失败，页面将关闭</p></div>';
    }
  });
}
function showPasswordSetupModal() {
  loadPasswordConfig();
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:2000; display:flex; align-items:center; justify-content:center;';
  
  var panel = document.createElement('div');
  panel.style.cssText = 'background:white; border-radius:16px; padding:24px; width:360px; text-align:center;';
  panel.innerHTML = '<h3>密码保护设置</h3>' +
    '<select id="pwdTypeSelect" style="width:100%; padding:10px; margin:16px 0; border:1px solid #ddd; border-radius:8px;">' +
    '<option value="none"' + (passwordConfig.type === 'none' ? ' selected' : '') + '>无密码</option>' +
    '<option value="digit"' + (passwordConfig.type === 'digit' ? ' selected' : '') + '>6位数字密码</option>' +
    '<option value="word"' + (passwordConfig.type === 'word' ? ' selected' : '') + '>密语解锁</option>' +
    '</select>' +
    '<div id="pwdSetupArea"></div>' +
    '<button id="savePwdSetup" style="width:100%; padding:10px; background:#007aff; color:white; border:none; border-radius:8px; margin-top:16px;">保存设置</button>' +
    '<button id="closePwdModal" style="width:100%; margin-top:12px; padding:10px; background:#666; color:white; border:none; border-radius:8px;">取消</button>';
  
  modal.appendChild(panel);
  document.body.appendChild(modal);
  
  function updatePwdSetupArea() {
    var type = document.getElementById('pwdTypeSelect').value;
    var area = document.getElementById('pwdSetupArea');
    if (type === 'digit') {
      area.innerHTML = '<input type="password" id="newPwd" maxlength="6" placeholder="6位数字密码" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px;">' +
        '<input type="password" id="confirmPwd" maxlength="6" placeholder="确认密码" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">';
    } else if (type === 'word') {
      area.innerHTML = '<input type="text" id="newPwd" placeholder="自定义密语" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px;">' +
        '<input type="text" id="confirmPwd" placeholder="确认密语" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">';
    } else {
      area.innerHTML = '<p style="color:#888; padding:10px;">无需密码保护</p>';
    }
  }
  
  document.getElementById('pwdTypeSelect').onchange = updatePwdSetupArea;
  updatePwdSetupArea();
  
  document.getElementById('savePwdSetup').onclick = function() {
    var type = document.getElementById('pwdTypeSelect').value;
    passwordConfig.type = type;
    if (type === 'digit') {
      var pwd = document.getElementById('newPwd').value;
      var confirm = document.getElementById('confirmPwd').value;
      if (pwd !== confirm) { alert('两次密码不一致'); return; }
      if (pwd.length !== 6) { alert('请输入6位数字密码'); return; }
      passwordConfig.digit = pwd;
      passwordConfig.word = '';
    } else if (type === 'word') {
      var pwd = document.getElementById('newPwd').value;
      var confirm = document.getElementById('confirmPwd').value;
      if (pwd !== confirm) { alert('两次密语不一致'); return; }
      if (pwd.length === 0) { alert('请输入密语'); return; }
      passwordConfig.word = pwd;
      passwordConfig.digit = '';
    } else {
      passwordConfig.digit = '';
      passwordConfig.word = '';
    }
    savePasswordConfig();
    alert('密码设置成功！下次启动软件将生效');
    modal.remove();
  };
  
  document.getElementById('closePwdModal').onclick = function() { modal.remove(); };
}

function showSecurityQuestionsModal() {
  loadPasswordConfig();
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:2000; display:flex; align-items:center; justify-content:center;';
  
  var panel = document.createElement('div');
  panel.style.cssText = 'background:white; border-radius:16px; padding:24px; width:400px; text-align:center; max-height:80vh; overflow-y:auto;';
  panel.innerHTML = '<h3>密保问题设置</h3><p style="font-size:12px; color:#888;">设置三个问题和答案，用于找回密码</p>';
  
  for (var i = 0; i < 3; i++) {
    panel.innerHTML += '<div style="margin:16px 0; text-align:left;">' +
      '<label>问题' + (i+1) + ':</label>' +
      '<input type="text" id="q' + i + '" value="' + escapeHtml(passwordConfig.questions[i].q || '') + '" placeholder="请输入问题" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px;">' +
      '<label>答案' + (i+1) + ':</label>' +
      '<input type="text" id="a' + i + '" value="' + escapeHtml(passwordConfig.questions[i].a || '') + '" placeholder="请输入答案" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ddd; border-radius:8px;">' +
      '</div>';
  }
  panel.innerHTML += '<button id="saveQuestions" style="width:100%; padding:10px; background:#007aff; color:white; border:none; border-radius:8px;">保存密保</button>' +
    '<button id="closeQuestionsModal" style="width:100%; margin-top:12px; padding:10px; background:#666; color:white; border:none; border-radius:8px;">取消</button>';
  
  modal.appendChild(panel);
  document.body.appendChild(modal);
  
  document.getElementById('saveQuestions').onclick = function() {
    for (var i = 0; i < 3; i++) {
      passwordConfig.questions[i] = {
        q: document.getElementById('q' + i).value,
        a: document.getElementById('a' + i).value
      };
    }
    savePasswordConfig();
    alert('密保问题已保存');
    modal.remove();
  };
  
  document.getElementById('closeQuestionsModal').onclick = function() { modal.remove(); };
}

// 页面启动时检查密码
// 注意：需要在 loadAllData 之后调用
// 备份路径设置
var backupPath = localStorage.getItem('backupPath') || '';

function getDefaultBackupPath() {
  // Mac 默认文稿路径
  if (navigator.platform.indexOf('Mac') !== -1) {
    return '/Users/' + (process.env.USER || 'user') + '/Documents';
  }
  // Windows 默认文档路径
  return 'C:\\Users\\' + (process.env.USERNAME || 'user') + '\\Documents';
}

function showBackupPathSettings() {
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:2000; display:flex; align-items:center; justify-content:center;';
  
  var panel = document.createElement('div');
  panel.style.cssText = 'background:white; border-radius:16px; padding:24px; width:400px; text-align:center;';
  panel.innerHTML = '<h3>备份文件位置</h3>' +
    '<p style="font-size:12px; color:#888; margin-bottom:16px;">设置自动备份文件保存的位置</p>' +
    '<input type="text" id="backupPathInput" value="' + (backupPath || getDefaultBackupPath()) + '" style="width:100%; padding:10px; margin-bottom:16px; border:1px solid #ddd; border-radius:8px;">' +
    '<div style="display:flex; gap:8px;">' +
    '<button id="saveBackupPath" style="flex:1; padding:10px; background:#007aff; color:white; border:none; border-radius:8px;">保存</button>' +
    '<button id="cancelBackupPath" style="flex:1; padding:10px; background:#666; color:white; border:none; border-radius:8px;">取消</button>' +
    '</div>';
  
  modal.appendChild(panel);
  document.body.appendChild(modal);
  
  document.getElementById('saveBackupPath').onclick = function() {
    var newPath = document.getElementById('backupPathInput').value;
    if (newPath) {
      localStorage.setItem('backupPath', newPath);
      backupPath = newPath;
      alert('备份路径已保存');
      modal.remove();
    }
  };
  
  document.getElementById('cancelBackupPath').onclick = function() {
    modal.remove();
  };
}

// 在设置页面添加备份路径设置按钮
// 修改 createPages 中的 settingsPageSource