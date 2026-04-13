// ==========================================
// 🚀 1. การตั้งค่าและเชื่อมต่อ Firebase
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBxXwdC_A9ihTpceNPbjExdDvR8aAr-L3A",
  authDomain: "examhub-c93c7.firebaseapp.com",
  projectId: "examhub-c93c7",
  storageBucket: "examhub-c93c7.firebasestorage.app",
  messagingSenderId: "510617378114",
  appId: "1:510617378114:web:82e5b129cfcf79fb36bcdb",
  measurementId: "G-CXNZ1E3JYF"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// 📦 2. ตัวแปรและสถานะระบบ
// ==========================================
let currentQIndex = 0;
let userAnswers = [];
let allData = [], contentData = [], currentQuiz = [], currentTopicQuestions = [], currentUsername = '', completedQuizzes = [], completedScores = {}, currentQuizIdentifier = '', selectedExamTopic = '', timerInterval, timeRemaining = 0, currentActionMode = '';
let startTime = null;
let lastActivityTime = Date.now();
let idleCheckInterval;
const IDLE_LIMIT = 30 * 60 * 1000; 

const topics = ["การใช้โปรแกรมในการปฏิบัติงาน", "ความรู้เกี่ยวกับคอมพิวเตอร์","พ.ร.บ. ข้อมูลข่าวสารของราชการ", "พ.ร.บ. ข้าราชการพลเรือน", "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล", "พ.ร.บ. ระเบียบข้าราชการฝ่ายอัยการ","พ.ร.บ. องค์กรอัยการพนักงานอัยการ", "ระเบียบงานสารบรรณ", "สำนักงานอัยการสูงสุด" , "ข้อเสมือนจริงปี 2567"];

window.onerror = function(msg, url, lineNo, columnNo, error) {
  let loader = document.getElementById('loading-overlay');
  if(loader) loader.style.display = 'none';
  console.warn('Caught Exception:', msg);
  return false;
};
// ==========================================
// 📚 ข้อมูลหมวดหมู่วิชา
// ==========================================

// 1. หมวดหมู่วิชาสำหรับ "ทำข้อสอบ" (เฉพาะที่มีข้อสอบในระบบ)
const examTopics = [
    "พ.ร.บ. ระเบียบข้าราชการฝ่ายอัยการ",
    "พ.ร.บ. องค์กรอัยการและพนักงานอัยการ",
    "สำนักงานอัยการสูงสุด",
    "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล",
    "พ.ร.บ. ข้อมูลข่าวสารของราชการ",
    "ระเบียบงานสารบรรณ",
    "พ.ร.บ. ระเบียบข้าราชการพลเรือน",
    "ความรู้เกี่ยวกับคอมพิวเตอร์",
    "การใช้โปรแกรมในการปฏิบัติงาน",  // <--- เติมลูกน้ำ (,) ตรงนี้ครับ
    "ข้อเสมือนจริงปี 2567" 
];

// 2. หมวดหมู่วิชาสำหรับ "เนื้อหาบทเรียน" (ที่มีชีทสรุปหรือคลิป)
const contentTopics = [
    "พ.ร.บ. ระเบียบข้าราชการฝ่ายอัยการ",
    "พ.ร.บ. องค์กรอัยการและพนักงานอัยการ",
    "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล",
    "พ.ร.บ. ข้อมูลข่าวสารของราชการ",
    "ระเบียบงานสารบรรณ",
    "พ.ร.บ. ระเบียบข้าราชการพลเรือน",
    "ความรู้เกี่ยวกับคอมพิวเตอร์",
    "Microsoft Word",      // อันนี้อาจจะมีเฉพาะในเนื้อหา
    "Microsoft Excel",     // อันนี้อาจจะมีเฉพาะในเนื้อหา
    "Microsoft PowerPoint",// อันนี้อาจจะมีเฉพาะในเนื้อหา
    "ยุทธศาสตร์การพัฒนาองค์กรอัยการ",
    "แผนปฏิบัติราชการ"
];

// 2. คลังลิงก์เนื้อหา (ชื่อวิชาต้องตรงกับข้างบนเป๊ะๆ)
const contentLinks = {
    "พ.ร.บ. ระเบียบข้าราชการฝ่ายอัยการ": {
        pdf: "https://drive.google.com/file/d/1MF6MZ2hjsO6nRnzo-8pUy79auTdEDsbQ/view?usp=sharing",
       
    },
    "พ.ร.บ. องค์กรอัยการและพนักงานอัยการ": {
        pdf: "https://drive.google.com/file/d/1lnf1nm1s_m8BIe3KVGdJ8uQUruZylLtr/view?usp=sharing",
        
    },
    "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล": {
        pdf: "https://drive.google.com/file/d/1BrK4_o4wZsDcJGKwpsKri1FdKTs7z0Yc/view?usp=sharing",
        
    },
    "พ.ร.บ. ข้อมูลข่าวสารของราชการ": {
        pdf: "https://drive.google.com/file/d/1D9Or5kN4nogDN-r0_Rih3mjr4d1WDMK3/view?usp=sharing",
        
    },
    "ระเบียบงานสารบรรณ": {
        pdf: "https://drive.google.com/file/d/1D4w6riD5-Wjv2btLCXsWxFMKKruwnX6b/view?usp=sharing",
        
    },
    "พ.ร.บ. ระเบียบข้าราชการพลเรือน": {
        pdf: "https://drive.google.com/file/d/1LchSEAg5zWxGEoQJXttykPXrQ-OB1oE2/view?usp=sharing",
        
    },
    "ความรู้เกี่ยวกับคอมพิวเตอร์": {
        pdf: "https://drive.google.com/file/d/1_zUi62g6HpzLjs74u9YfrN1cN3DL0DRt/view?usp=sharing",
        
    },
    "Microsoft Word": {
        pdf: "https://drive.google.com/file/d/1hrprnYgCHP2rgv8VpOMXoshQlUjtHeKh/view?usp=sharing",
       
    },
    "Microsoft Excel": {
        pdf: "https://drive.google.com/file/d/1k0ZrxheTh3agj8UPufEn6t8GekQPQsjP/view?usp=sharing",
      
    },
    "Microsoft PowerPoint": {
        pdf: "https://drive.google.com/file/d/1GM9MNAZBXidQYeofrcogLAlzAx70V7yW/view?usp=sharing",
       
    },
    "ยุทธศาสตร์การพัฒนาองค์กรอัยการ": {
        pdf: "https://drive.google.com/file/d/182LvEN86oGdjszbkeP2rbX8LVXdj_ITi/view?usp=drive_link",
      
    },
    "แผนปฏิบัติราชการ": {
        pdf: "https://drive.google.com/file/d/1GMd2eehGstNeBJ2fafUl6Wpsecdv411y/view?usp=sharing",
      
    }
};
// ==========================================
// ⚙️ 3. ฟังก์ชันพื้นฐาน (Navigation, UI, Timer)
// ==========================================
document.addEventListener('DOMContentLoaded', () => { 
  try {
    loadData(); // โหลดข้อมูล Firebase + Cache
    let savedTheme = 'light';
    try { savedTheme = localStorage.getItem('appTheme') || 'light'; } catch(e) {}
    setTheme(savedTheme);
    setupIdleTimer();
    updateCountdown();
  } catch(e) { console.error("Init Error:", e); }
});

function navigate(id) { 
  document.querySelectorAll('.app-section').forEach(s => s.style.display = 'none'); 
  document.getElementById(id).style.display = 'block'; 
  setTimeout(() => { window.scrollTo(0, 0); }, 50); 
}

function showLoader(t) { document.getElementById('loading-text').innerText = t; document.getElementById('loading-overlay').style.display = 'flex'; }
function hideLoader() { document.getElementById('loading-overlay').style.display = 'none'; }
function showToast() { let toast = document.getElementById("toast-notification"); toast.className = "show"; setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3500); }
function setTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('appTheme', t); } catch(e) {} }

function toggleTheme() {
  let themeList = document.getElementById('theme-list');
  themeList.style.display = (themeList.style.display === 'none' || themeList.style.display === '') ? 'flex' : 'none';
}

function updateCountdown() {
  const diff = new Date("2026-05-03T00:00:00").getTime() - new Date().getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const display = document.getElementById('days-count');
  if (display) {
    if (days > 0) display.innerText = days;
    else if (days === 0) display.innerText = "วันสอบ!";
    else display.innerText = "ผ่านวันสอบแล้ว";
  }
}

function setupIdleTimer() {
  const updateActivity = () => { lastActivityTime = Date.now(); };
  document.addEventListener('pointerdown', updateActivity, { passive: true });
  document.addEventListener('keydown', updateActivity, { passive: true });

  if(idleCheckInterval) clearInterval(idleCheckInterval);
  idleCheckInterval = setInterval(() => {
    if (currentUsername && (Date.now() - lastActivityTime > IDLE_LIMIT)) {
      alert('ระบบได้ทำการออกจากระบบอัตโนมัติ เนื่องจากคุณไม่ได้ใช้งานนานเกินไป'); 
      logout();
    }
  }, 10000);
}

let logoutClickCount = 0;
function logout(btnElement) { 
  let btn = btnElement || document.getElementById('logout-btn');
  if (logoutClickCount === 0) {
    btn.innerHTML = '<span class="material-symbols-rounded" style="color:white; font-size:1.2rem;">warning</span> ยืนยันอีกครั้ง';
    btn.style.backgroundColor = 'var(--danger-text)';
    logoutClickCount = 1;
    setTimeout(() => {
      logoutClickCount = 0;
      if(btn) { btn.innerHTML = 'ออกจากระบบ'; btn.style.backgroundColor = 'var(--text-muted)'; }
    }, 3000);
  } else {
    logoutClickCount = 0;
    if(btn) { btn.innerHTML = 'ออกจากระบบ'; btn.style.backgroundColor = 'var(--text-muted)'; }
    showLoader('กำลังออกจากระบบ...');
    currentUsername = '';
    document.getElementById('login-email') ? document.getElementById('login-email').value = '' : null;
    document.getElementById('username') ? document.getElementById('username').value = '' : null;
    document.getElementById('password').value = '';
    auth.signOut().then(() => {
        hideLoader();
        navigate('login-section');
    });
  }
}

function getDeviceId() { 
  let id = localStorage.getItem('my_app_device_id'); 
  if(!id) { id = 'dev_' + Math.random().toString(36).substr(2, 9); localStorage.setItem('my_app_device_id', id); } 
  return id; 
}

// ==========================================
// 📥 4. ระบบโหลดข้อมูล (Firebase + Cache)
// ==========================================
function loadData() {
  const CACHE_KEY = 'examhub_exams_cache';
  const CACHE_TIME_KEY = 'examhub_exams_cache_time';
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

  if (cachedData && cachedTime && (now - parseInt(cachedTime) < ONE_DAY)) {
      allData = JSON.parse(cachedData);
      console.log("🚀 Load from Cache สำเร็จ (" + allData.length + " ข้อ)");
      if(currentUsername) updateOverallProgress();
      return;
  }

  db.collection("exams").get().then((querySnapshot) => {
    allData = [];
    querySnapshot.forEach((doc) => {
      let r = doc.data();
      allData.push([
        r.question || "", 
        r.options && r.options[0] ? r.options[0] : "", 
        r.options && r.options[1] ? r.options[1] : "", 
        r.options && r.options[2] ? r.options[2] : "", 
        r.options && r.options[3] ? r.options[3] : "",
        (r.answer || "1").toString() + (r.explanation ? " " + r.explanation : ""),
        r.category || ""
      ]);
    });
    localStorage.setItem(CACHE_KEY, JSON.stringify(allData));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());
    console.log("✅ ดึงข้อมูลจาก Firebase สำเร็จ (" + allData.length + " ข้อ)");
    if(currentUsername) updateOverallProgress();
  }).catch(e => console.error("Firebase Load Error:", e));
}

// ==========================================
// 🔑 5. ระบบเข้าสู่ระบบ & สมัครสมาชิก (ใช้อีเมลจริง)
// ==========================================
function doLogin() {
  let emailInput = document.getElementById('login-email') || document.getElementById('username');
  let em = emailInput.value.trim();
  let p = document.getElementById('password').value;
  
  if(!em || !p) return alert('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
  
  showLoader('กำลังเข้าสู่ระบบ...');
  auth.signInWithEmailAndPassword(em, p)
    .then((userCredential) => db.collection("users").doc(userCredential.user.uid).get())
    .then((doc) => {
      hideLoader();
      if (doc.exists) {
        const userData = doc.data();
        currentUsername = userData.name || em;
        
        if (userData.role === 'admin') {
            document.getElementById('user-greeting').innerText = 'สวัสดีคุณแอดมิน';
            navigate('admin-section');
            loadAdminDashboard();
        } else {
            if(userData.status !== 'อนุมัติ') {
                alert('⏳ บัญชีของคุณอยู่ระหว่างรอการตรวจสอบสลิปโอนเงินครับ');
                auth.signOut();
                return;
            }
            document.getElementById('user-greeting').innerText = 'สวัสดีคุณ ' + currentUsername;
            completedQuizzes = userData.completedQuizzes || [];
            completedScores = userData.completedScores || {};
            updateOverallProgress();
            navigate('main-menu-section'); 
        }
      }
    })
    .catch((error) => {
      hideLoader();
      alert('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    });
}

function doRegister() {
  let n = document.getElementById('reg-name').value;
  let ph = document.getElementById('reg-phone').value;
  let em = document.getElementById('reg-email').value.trim(); 
  let p = document.getElementById('reg-password').value;

  if(!n || !ph || !em || !p) return alert('กรุณากรอกข้อมูลให้ครบถ้วนครับ');

  showLoader('กำลังสร้างบัญชี...');
  auth.createUserWithEmailAndPassword(em, p)
    .then((userCredential) => {
      let user = userCredential.user;
      return db.collection("users").doc(user.uid).set({
        name: n, phone: ph, email: em, role: "student", status: "รอตรวจสอบ",
        completedQuizzes: [], completedScores: {}, createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      hideLoader();
      alert('🎉 สมัครสมาชิกสำเร็จ! ระบบจะพาคุณไปหน้าขั้นตอนการโอนเงินครับ');
      document.getElementById('reg-name').value = '';
      document.getElementById('reg-phone').value = '';
      document.getElementById('reg-email').value = '';
      document.getElementById('reg-password').value = '';
      auth.signOut(); 
      navigate('payment-section');
    })
    .catch((error) => {
      hideLoader();
      if (error.code === 'auth/email-already-in-use') alert('❌ อีเมลนี้มีคนใช้งานแล้ว');
      else if (error.code === 'auth/weak-password') alert('❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      else alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    });
}

function resetPassword() {
  let emailInput = document.getElementById('login-email') || document.getElementById('username');
  let em = emailInput.value.trim();
  if(!em) return alert('กรุณาพิมพ์ "อีเมล" ของคุณในช่องด้านบนก่อน แล้วกดปุ่มลืมรหัสผ่านอีกครั้งครับ');
  
  showLoader('กำลังส่งลิงก์...');
  auth.sendPasswordResetEmail(em)
    .then(() => { hideLoader(); alert('✅ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมล\n' + em + '\nเรียบร้อยแล้วครับ!'); })
    .catch((error) => { hideLoader(); alert('❌ ไม่พบบัญชีที่ใช้อีเมลนี้ หรือเกิดข้อผิดพลาด'); });
}

// ==========================================
// 📊 6. ระบบแสดงผล (Progress, History, Analytics)
// ==========================================
function isQuizCompleted(idToCheck) {
  if (!completedQuizzes || !idToCheck) return false;
  return completedQuizzes.some(q => q && q.trim() === idToCheck.trim());
}

function updateOverallProgress() {
  if (!allData || !allData.length) return;
  let totalQuestionsCount = allData.length, totalDoneCount = 0;
  topics.forEach(t => {
    let tQs = allData.filter(r => r && r.length > 6 && r[6] != null && r[6].toString().trim() === t.trim()), sets = Math.ceil(tQs.length / 25);
    for(let i=0; i<sets; i++) {
      let setId = t + '_ชุดที่_' + (i+1);
      if(isQuizCompleted(setId)) totalDoneCount += (i === sets-1 && tQs.length % 25 !== 0) ? (tQs.length % 25) : 25;
    }
  });
  let overallPercent = Math.round((totalDoneCount / totalQuestionsCount) * 100) || 0;
  document.getElementById('overall-progress-bar').style.width = overallPercent + '%';
  document.getElementById('overall-progress-text').innerText = overallPercent + '%';
}

function showHistory() {
  let h = ''; let hasHistory = false;
  for (let id in completedScores) {
    hasHistory = true; let s = completedScores[id];
    let p = s.percent !== undefined ? s.percent : (Math.round((s.score/s.total)*100) || 0);
    h += `<div class="question-card" style="padding:15px; margin-bottom:15px; background:rgba(255,255,255,0.6); border-radius:15px; border:1px solid var(--border-color);">
            <div style="font-weight:700; color:var(--text-main); margin-bottom:8px;">${id.replace(/_/g, ' ')}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.9rem; color:var(--text-muted);">คะแนน: ${s.score}/${s.total}</span>
              <span style="font-size:1.1rem; font-weight:700; color:${p >= 60 ? 'var(--success-text)' : 'var(--danger-text)'};">${p}%</span>
            </div></div>`;
  }
  if (!hasHistory) h = '<div style="text-align:center; padding:40px;"><span class="material-symbols-rounded" style="font-size:3rem; color:var(--text-muted);">history_toggle_off</span><p style="margin-top:10px; color:var(--text-muted);">ยังไม่มีประวัติการทำข้อสอบ</p></div>';
  document.getElementById('history-content').innerHTML = h; navigate('history-section');
}

function showAnalytics() {
  let h = '<p style="margin-bottom:20px; font-weight:600; text-align:center;">วิเคราะห์คะแนนเฉลี่ยแต่ละบทเรียน</p>'; let topicAverages = [];
  topics.forEach(t => {
      let totalScore = 0, count = 0;
      for (let id in completedScores) {
        let topicInId = id ? id.split('_ชุดที่_')[0] : "";
        if (topicInId && topicInId.trim() === t.trim()) { 
            let s = completedScores[id];
            let p = s.percent !== undefined ? s.percent : (Math.round((s.score/s.total)*100) || 0);
            totalScore += p; count++; 
        }
      }
      if (count > 0) topicAverages.push({ topic: t, avg: Math.round(totalScore / count) });
  });
  if (topicAverages.length === 0) h = '<div style="text-align:center; padding:40px;"><span class="material-symbols-rounded" style="font-size:3rem; color:var(--text-muted);">history</span><p>ยังไม่มีประวัติการทำข้อสอบ</p></div>';
  else {
      topicAverages.sort((a, b) => a.avg - b.avg).forEach(item => {
          h += `<div class="breakdown-item"><div class="breakdown-label"><span>${item.topic}</span><span>${item.avg}%</span></div>
                <div class="breakdown-bar-bg"><div class="breakdown-bar-fill" style="width:${item.avg}%; background:${item.avg < 50 ? 'var(--danger-text)' : 'var(--primary)'};"></div></div></div>`;
      });
      let weakest = topicAverages[0];
      h += `<div style="margin-top:30px; padding:20px; background:rgba(255, 59, 48, 0.1); border-radius:20px; border:1px solid var(--danger-text); text-align:center;"><p style="color:var(--danger-text); font-weight:700; margin:0;">💡 บทที่ควรเน้นเป็นพิเศษ</p><p style="font-size:1.1rem; font-weight:700; margin:10px 0;">"${weakest.topic}"</p><p style="font-size:0.9rem; margin:0;">คะแนนเฉลี่ยของคุณต่ำที่สุด แนะนำให้ทบทวนบทนี้ครับ</p></div>`;
  }
  document.getElementById('analytics-content').innerHTML = h; navigate('analytics-section');
}

// ==========================================
// 📚 7. ระบบเลือกข้อสอบและทำข้อสอบ
// ==========================================
// ==========================================
// 📖 ฟังก์ชันแสดงเนื้อหาบทเรียน (เวอร์ชันแก้บัคกดลิงก์ไม่ไป)
// ==========================================
function showContentDetail(topic) {
    // 1. เปลี่ยนชื่อหัวข้อบนหน้าจอ
    document.getElementById('content-topic-title').innerText = topic;
    const container = document.getElementById('content-detail-container');

    // 2. ตรวจสอบเฉพาะลิงก์ PDF
    const pdfLink = (contentLinks[topic] && contentLinks[topic].pdf) ? contentLinks[topic].pdf : "#";

    // 3. 🟢 เปลี่ยนวิธีสั่งเปิดลิงก์เป็น JavaScript (window.open)
    const clickAction = pdfLink === "#" 
        ? `onclick="alert('กำลังจัดทำเอกสารวิชานี้ครับ รอก่อนน้า ⏳');"` 
        : `onclick="window.open('${pdfLink}', '_blank');"`;

    // 4. สร้างหน้าตา HTML ของปุ่มเนื้อหา
    container.innerHTML = `
        <div style="padding: 15px; border-left: 4px solid var(--primary); background: rgba(132, 182, 244, 0.1); border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 5px 0; color: var(--primary);">📚 เอกสารประกอบการเรียน</h4>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">คลิกที่กล่องด้านล่างเพื่อเปิดอ่านเนื้อหา</p>
        </div>

        <div style="display: flex; justify-content: center; margin-top: 20px;">
            <div ${clickAction} class="card" style="cursor: pointer; text-align: center; padding: 30px 20px; border: 1px solid var(--border-color); border-radius: 15px; background: white; box-shadow: var(--shadow); width: 100%; max-width: 350px;">
                <span class="material-symbols-rounded" style="font-size: 4rem; color: ${pdfLink === "#" ? '#ccc' : '#e53935'};">picture_as_pdf</span>
                
                <div style="font-weight: 700; margin-top: 15px; color: ${pdfLink === "#" ? '#999' : 'var(--text-main)'}; font-size: 1.1rem; line-height: 1.4;">
                    ${topic}
                </div>
            </div>
        </div>
    `;
    
    // 5. สั่งให้แอปเปลี่ยนหน้า
    navigate('content-view-section');
}
function selectTopic(t) { selectedExamTopic = t; document.getElementById('topic-action-title').innerText = t; navigate('topic-action-section'); }

function showExamSets(mode) {
  currentActionMode = mode; currentTopicQuestions = allData.filter(r => r && r.length > 6 && r[6] != null && r[6].toString().trim() === selectedExamTopic.trim());
  let totalQ = currentTopicQuestions.length, doneQ = 0, h = '', sets = Math.ceil(totalQ/25);
  for(let i=0; i<sets; i++) {
    let id = selectedExamTopic + '_ชุดที่_' + (i+1); let isDone = isQuizCompleted(id); 
    if (isDone) doneQ += (i === sets-1 && totalQ % 25 !== 0) ? (totalQ % 25) : 25;
    h += `<div class="menu-btn" style="${isDone?'background:rgba(52, 199, 89, 0.1); border-color:#28a745;':''}" onclick="startQuizBySet(${i*25}, ${(i+1)*25}, ${i+1})">ชุดที่ ${i+1} ${isDone?'✅':''}</div>`;
  }
  let p = totalQ > 0 ? Math.round((doneQ/totalQ)*100) : 0;
  document.getElementById('topic-progress-bar').style.width = p + '%';
  document.getElementById('topic-progress-text').innerText = `ทำหมวดนี้ไปแล้ว ${p}%`;
  document.getElementById('exam-set-title').innerText = (mode === 'drill' ? 'ตะลุยข้อสอบ: ' : '') + selectedExamTopic;
  document.getElementById('set-buttons-container').innerHTML = h; navigate('exam-set-section');
}

function startQuizBySet(s, e, n) { 
  currentQuiz = currentTopicQuestions.slice(s, e); currentQuizIdentifier = selectedExamTopic + '_ชุดที่_' + n; 
  startQuizUI(selectedExamTopic + (currentActionMode === 'drill' ? ' (โหมดตะลุยชุดที่ ' + n + ')' : ' ชุดที่ ' + n), false); 
}

function startMockExam() { 
  showLoader('กำลังเตรียมข้อสอบ 40 ข้อ...');
  setTimeout(() => {
    let validData = allData.filter(r => r && r[0]); 
    currentQuiz = [...validData].sort(() => 0.5 - Math.random()).slice(0, 40); 
    currentQuizIdentifier = 'mock'; 
    startQuizUI('จำลองสอบเสมือนจริง (40 ข้อ)', true); 
  }, 50);
} 

function startFreeTrial() {
  if(!allData || !allData.length) return alert('กำลังโหลดข้อมูล... หรือ ไม่พบฐานข้อมูลข้อสอบ');
  
  // กรองเอาเฉพาะข้อที่มีคำถาม
  let validData = allData.filter(r => r && r[0]); 
  
  if (validData.length < 10) return alert('ข้อสอบในระบบมีไม่ถึง 10 ข้อ');

  // 🎯 ดึง 10 ข้อแรกจากฐานข้อมูลเสมอ (ตัดระบบสุ่มออก ทุกคนจะได้ 10 ข้อชุดเดียวกัน 100%)
  currentQuiz = validData.slice(0, 10);
  
  currentQuizIdentifier = 'trial'; 
  startQuizUI('ทดลองทำฟรี (10 ข้อ)', false); 
}


function startMiniTest() { 
  let amt = parseInt(document.getElementById('random-amount').value) || 22; 
  let validData = allData.filter(r => r && r[0]); 
  currentQuiz = [...validData].sort(() => 0.5 - Math.random()).slice(0, amt); 
  currentQuizIdentifier = 'mini'; startQuizUI('ทดสอบความรู้รวม', false); 
}

async function startQuizUI(title, useTimer) {
  showLoader('กำลังจัดเตรียมหน้าจอ...');
  await new Promise(r => setTimeout(r, 100));
  startTime = new Date(); currentQIndex = 0;
  userAnswers = new Array(currentQuiz.length).fill(null);
  document.getElementById('quiz-title').innerText = title;
  const container = document.getElementById('quiz-container');
  container.innerHTML = ''; 

  if (currentQuizIdentifier === 'mock') { showMockQuestion(); } 
  else {
    const chunkSize = 10;
    for (let i = 0; i < currentQuiz.length; i += chunkSize) {
      let htmlChunk = '';
      const end = Math.min(i + chunkSize, currentQuiz.length);
      for (let j = i; j < end; j++) {
        const r = currentQuiz[j];
        htmlChunk += `
          <div class="question-card" id="q-card-${j}">
            <p style="font-size:1.1rem; line-height:1.5;"><b>${j+1}. ${r[0]}</b> <br><small style="color:var(--primary); font-weight:600;">(หมวด: ${r[6] || 'ทั่วไป'})</small></p>
            <div class="option" id="opt-${j}-1" onclick="handleSel(${j},1)">${r[1]}</div>
            <div class="option" id="opt-${j}-2" onclick="handleSel(${j},2)">${r[2]}</div>
            <div class="option" id="opt-${j}-3" onclick="handleSel(${j},3)">${r[3]}</div>
            <div class="option" id="opt-${j}-4" onclick="handleSel(${j},4)">${r[4]}</div>
            <input type="hidden" id="ans-${j}">
            <div id="fb-${j}" style="margin-top:15px; display:none; font-weight:700; padding:10px; border-radius:10px;"></div>
          </div>`;
      }
      container.insertAdjacentHTML('beforeend', htmlChunk);
    }
    document.getElementById('submit-btn').style.display = 'block';
  }

  if(useTimer) {
    timeRemaining = currentQuiz.length * 60; 
    document.getElementById('timer-bar').style.display = 'block';
    updateTime(); 
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => { 
      timeRemaining--; updateTime(); 
      if(timeRemaining <= 0) { clearInterval(timerInterval); alert('หมดเวลาทำข้อสอบ!'); submitQuiz(); } 
    }, 1000);
  } else {
    document.getElementById('timer-bar').style.display = 'none';
    if(timerInterval) clearInterval(timerInterval);
  }
  navigate('quiz-section'); hideLoader();
}

function showMockQuestion() {
  const i = currentQIndex; const r = currentQuiz[i]; if(!r) return;
  const container = document.getElementById('quiz-container');
  const savedAns = userAnswers[i];
  container.innerHTML = `
    <div class="question-card" id="q-card-${i}">
      <p style="font-size:1.15rem; line-height:1.5;"><b>ข้อที่ ${i+1}/${currentQuiz.length}</b><br>${r[0]}</p>
      <div class="option" id="opt-${i}-1" onclick="handleSel(${i},1)" style="${savedAns == 1 ? 'border:2px solid var(--primary); font-weight:700;' : ''}">${r[1]}</div>
      <div class="option" id="opt-${i}-2" onclick="handleSel(${i},2)" style="${savedAns == 2 ? 'border:2px solid var(--primary); font-weight:700;' : ''}">${r[2]}</div>
      <div class="option" id="opt-${i}-3" onclick="handleSel(${i},3)" style="${savedAns == 3 ? 'border:2px solid var(--primary); font-weight:700;' : ''}">${r[3]}</div>
      <div class="option" id="opt-${i}-4" onclick="handleSel(${i},4)" style="${savedAns == 4 ? 'border:2px solid var(--primary); font-weight:700;' : ''}">${r[4]}</div>
      <input type="hidden" id="ans-${i}" value="${savedAns || ''}">
    </div>
    <div style="display:flex; gap:10px; margin-top:20px;">
      ${i > 0 ? `<button class="back-btn" onclick="changeMockQuestion(-1)" style="flex:1; margin:0; background:#ccc; color:#333;">ย้อนกลับ</button>` : `<div style="flex:1;"></div>`}
      ${i < currentQuiz.length - 1 ? `<button class="primary-btn" onclick="changeMockQuestion(1)" style="flex:1; margin:0;">ถัดไป</button>` : `<button class="primary-btn" onclick="submitQuiz()" style="flex:1; margin:0; background:#ff9500;">ส่งข้อสอบ</button>`}
    </div>`;
  document.getElementById('submit-btn').style.display = 'none'; window.scrollTo(0, 0);
}

function changeMockQuestion(step) { currentQIndex += step; showMockQuestion(); }

function handleSel(i, v) {
  let card = document.getElementById('q-card-' + i);
  if (card && card.classList.contains('disabled')) return;

  userAnswers[i] = v;
  let hiddenInput = document.getElementById('ans-' + i);
  if (hiddenInput) hiddenInput.value = v;

  for (let j = 1; j <= 4; j++) {
    let opt = document.getElementById(`opt-${i}-${j}`);
    if (opt) { opt.style.border = ''; opt.style.fontWeight = '400'; }
  }
  let selOpt = document.getElementById(`opt-${i}-${v}`);
  if (selOpt) { selOpt.style.border = '2px solid var(--primary)'; selOpt.style.fontWeight = '700'; }

  if (currentQuizIdentifier === 'mock' && currentQIndex < currentQuiz.length - 1) {
      if (window.mockNextTimeout) clearTimeout(window.mockNextTimeout);
      window.mockNextTimeout = setTimeout(() => { changeMockQuestion(1); }, 400);
  } else if (currentQuizIdentifier === 'trial' || currentActionMode === 'drill') {
    let ansMap = {'ก':1,'ข':2,'ค':3,'ง':4};
    let rawCorrect = currentQuiz[i][5] ? currentQuiz[i][5].toString().trim() : "1"; 
    let firstChar = rawCorrect.charAt(0); 
    let correct = ansMap[firstChar] || parseInt(firstChar); 
    let explanation = rawCorrect.length > 1 ? rawCorrect.substring(1).trim() : "";
    let fb = document.getElementById('fb-' + i);
    if (fb) {
      fb.style.display = 'block';
      let expHtml = explanation ? `<div style="margin-top: 8px; font-size: 0.95rem; font-weight: 400; border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 8px;"><b>💡 คำอธิบาย:</b> ${explanation}</div>` : '';
      if (v === correct) { fb.innerHTML = `✅ ถูกต้อง! ${expHtml}`; fb.style.background = 'var(--success-bg)'; fb.style.color = 'var(--success-text)'; } 
      else { fb.innerHTML = `❌ ผิด! เฉลยคือ: ${currentQuiz[i][correct]} ${expHtml}`; fb.style.background = 'var(--danger-bg)'; fb.style.color = 'var(--danger-text)'; }
    }
    if (card) card.classList.add('disabled');
  }
}

// ==========================================
// 📊 8. ตรวจคำตอบและบันทึกประวัติ
// ==========================================
function submitQuiz() {
  if(timerInterval) clearInterval(timerInterval); 
  showLoader('กำลังประมวลผลคะแนน...');
  
  let endTime = new Date(), timeUsedSeconds = Math.round((endTime - startTime) / 1000);
  let score = 0; let b = {}; let reviewHTML = '<h3 style="text-align:center; color:var(--text-main);"><span class="material-symbols-rounded" style="vertical-align:middle; color:var(--primary);">fact_check</span> เฉลยและคำอธิบาย</h3>';
  
  currentQuiz.forEach((r, i) => {
    let sel = userAnswers[i] || (document.getElementById(`ans-${i}`) ? document.getElementById(`ans-${i}`).value : null);
    let rawCorrect = r[5] ? r[5].toString().trim() : "1";
    let firstChar = rawCorrect.charAt(0);
    let ansMap = {'ก':1,'ข':2,'ค':3,'ง':4};
    let correct = ansMap[firstChar] || parseInt(firstChar);
    let explanationText = rawCorrect.length > 1 ? rawCorrect.substring(1).trim() : '';

    let isCorrect = (parseInt(sel) === correct), t = r[6] || 'ทั่วไป';
    if(!b[t]) b[t] = {c:0, tot:0}; b[t].tot++; if(isCorrect) { score++; b[t].c++; }

    reviewHTML += `
      <div class="review-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--border-color); border-radius: 10px;">
        <p style="margin-top: 0;"><b>ข้อที่ ${i+1}:</b> ${r[0]}</p>
        <p style="color:var(--success-text); margin-bottom: 0;">✅ คำตอบที่ถูก: ${r[correct]}</p>
        ${explanationText ? `<div style="background:var(--pastel-bg); padding:10px; border-radius:10px; margin-top:10px; font-size:0.9rem; border-left:4px solid var(--primary);"><b>💡 คำอธิบาย:</b> ${explanationText}</div>` : ''}
      </div>`;
  });

  document.getElementById('review-container').innerHTML = reviewHTML;
  document.getElementById('review-container').style.display = 'none'; 

  let percentScore = currentQuiz.length > 0 ? Math.round((score/currentQuiz.length)*100) : 0;
  document.getElementById('percent-display').innerText = percentScore + '%';
  document.getElementById('score-display').innerHTML = `คะแนนที่ทำได้: ${score} / ${currentQuiz.length} ข้อ<br><span style="font-size:0.95rem; color:var(--text-muted); font-weight:500; display:block; margin-top:10px;">เวลาที่ใช้: ${Math.floor(timeUsedSeconds/60)} นาที ${timeUsedSeconds%60} วินาที</span>`;

  let bh = '<h4 style="margin-bottom:15px; color:var(--text-main);"><span class="material-symbols-rounded" style="font-size:1.2rem; vertical-align:middle;">analytics</span> วิเคราะห์ผลรายบท</h4>';
  for(let k in b) { let per = Math.round((b[k].c/b[k].tot)*100); bh += `<div class="breakdown-item"><div class="breakdown-label"><span>${k}</span><span>${per}%</span></div><div class="breakdown-bar-bg"><div class="breakdown-bar-fill" style="width:${per}%"></div></div></div>`; }
  document.getElementById('category-breakdown').innerHTML = bh;

  let currentId = currentQuizIdentifier;
  if(currentUsername && currentId !== 'trial' && currentId !== 'mock' && currentId !== 'mini') {
      if (!isQuizCompleted(currentId)) completedQuizzes.push(currentId);
      completedScores[currentId] = { score: score, total: currentQuiz.length, percent: percentScore };
      updateOverallProgress();
      
      auth.onAuthStateChanged((user) => {
          if (user) { db.collection("users").doc(user.uid).update({ completedQuizzes: completedQuizzes, completedScores: completedScores }); }
      });
  }
  hideLoader(); navigate('result-section');
}

function toggleReview() {
  let container = document.getElementById('review-container');
  if (container.style.display === 'none') { container.style.display = 'block'; setTimeout(() => { window.scrollBy({ top: 300, behavior: 'smooth' }); }, 100); } 
  else { container.style.display = 'none'; }
}

function updateTime() { let m = Math.floor(timeRemaining/60), s = timeRemaining%60; document.getElementById('time-display').innerText = `${m}:${s<10?'0'+s:s}`; }
function goHome() { 
  if(currentUsername) navigate('main-menu-section'); 
  else navigate('login-section'); 
}
let quitClickCount = 0; // ตัวแปรนี้ต้องอยู่นอกฟังก์ชัน



function quitQuiz() { 
  let btn = document.getElementById('quit-btn');
  
  if (quitClickCount === 0) {
    // 🚩 กดครั้งที่ 1: เปลี่ยนแค่ข้อความข้างใน (หน้าตาปุ่มยังเหมือนเดิมตาม CSS)
    if(btn) {
      btn.innerHTML = '<span class="material-symbols-rounded">warning</span> ยืนยันเพื่อออก';
    }
    
    quitClickCount = 1;
    
    // ถ้าไม่กดย้ำภายใน 3 วินาที ให้คืนค่าข้อความเดิม
    setTimeout(() => {
      quitClickCount = 0;
      if(btn) {
        btn.innerHTML = '<span class="material-symbols-rounded">cancel</span> ยกเลิกการทำสอบ';
      }
    }, 3000);
    
  } else {
    // ✅ กดครั้งที่ 2: ออกทันที
    quitClickCount = 0;
    if(timerInterval) clearInterval(timerInterval); 
    document.getElementById('review-container').style.display = 'none';
    goHome(); 
  }
}

// ==========================================
// 🛡️ 9. ระบบแอดมิน (จัดการผู้ใช้ และข้อสอบ)
// ==========================================
let adminUsersData = [];

function loadAdminDashboard() {
  document.getElementById('admin-users-list').innerHTML = '<p style="text-align:center;">กำลังโหลดข้อมูล...</p>';
  db.collection("users").orderBy("createdAt", "desc").get().then((querySnapshot) => {
      let total = 0, pending = 0, revenue = 0; adminUsersData = [];
      querySnapshot.forEach((doc) => {
        let u = doc.data();
        if(u.role !== 'admin') { 
          u.id = doc.id; adminUsersData.push(u); total++;
          if(u.status === 'รอตรวจสอบ') pending++;
          if(u.status === 'อนุมัติ') revenue += 250;
        }
      });
      document.getElementById('stat-total').innerText = total;
      document.getElementById('stat-pending').innerText = pending;
      document.getElementById('stat-revenue').innerText = revenue.toLocaleString() + ' ฿';
      renderAdminUsers(); renderAdminQuestions(); 
    }).catch((error) => { document.getElementById('admin-users-list').innerHTML = '<p style="text-align:center; color:red;">โหลดข้อมูลล้มเหลว</p>'; });
}

function renderAdminUsers() {
  let filter = document.getElementById('admin-filter').value;
  let container = document.getElementById('admin-users-list');
  let html = ''; 
  
  let filteredUsers = adminUsersData.filter(u => filter === 'all' || u.status === filter);
  
  if(filteredUsers.length === 0) { 
    container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">ไม่พบข้อมูลในหมวดนี้</div>'; 
    return; 
  }

  filteredUsers.forEach(u => {
    let statusColor = u.status === 'อนุมัติ' ? 'var(--success-text)' : (u.status === 'ระงับการใช้งาน' ? 'var(--danger-text)' : '#ff9500');
    
    // ดึงข้อมูล Username และ Email มาแสดงผล (ถ้าไม่มีจะขึ้นว่า ไม่มีข้อมูล)
    let displayUsername = u.username || '<span style="color:#ccc; font-weight:400;">ไม่มีข้อมูล</span>';
    let displayEmail = u.email || u.realEmail || 'ไม่มีข้อมูล';

    html += `
      <div style="background:#fff; border: 1px solid var(--border-color); padding: 15px; margin-bottom: 10px; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <b style="font-size:1.1rem; color:var(--text-main);">${u.name}</b><br>
            
            <div style="margin-top: 8px; margin-bottom: 8px;">
                <span style="font-size:0.9rem; background:rgba(132, 182, 244, 0.15); color:var(--primary); padding: 4px 10px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(132, 182, 244, 0.3); display:inline-flex; align-items:center; gap:5px;">
                    <span class="material-symbols-rounded" style="font-size: 1.1rem;">person</span> 
                    User: ${displayUsername}
                </span>
            </div>

            <span style="font-size:0.85rem; color:var(--text-muted);">Email: <b style="color:var(--text-main);">${displayEmail}</b></span><br>
            <span style="font-size:0.85rem; color:var(--text-muted);">โทร: ${u.phone}</span><br>
            <span style="font-size:0.85rem; font-weight:700; color:${statusColor}; margin-top:3px; display:inline-block;">สถานะ: ${u.status}</span>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${u.status !== 'อนุมัติ' ? `<button class="primary-btn" style="margin:0; padding:6px 12px; font-size:0.85rem;" onclick="adminAction('${u.id}', 'approve')">อนุมัติ</button>` : ''}
            ${u.status === 'รอตรวจสอบ' ? `<button class="danger-btn" style="margin:0; padding:6px 12px; font-size:0.85rem; background:var(--danger-text);" onclick="adminAction('${u.id}', 'delete')">ลบทิ้ง</button>` : ''}
            ${u.status === 'อนุมัติ' ? `<button class="danger-btn" style="margin:0; padding:6px 12px; font-size:0.85rem; background:var(--danger-text);" onclick="adminAction('${u.id}', 'ban')">แบน</button>` : ''}
          </div>
        </div>
      </div>`;
  });
  container.innerHTML = html;
}

function adminAction(userId, action) {
  let msg = ''; let newStatus = '';
  if (action === 'approve') { msg = 'ยืนยันอนุมัติผู้ใช้นี้?'; newStatus = 'อนุมัติ'; }
  else if (action === 'ban') { msg = 'ต้องการแบนผู้ใช้นี้จริงหรือ?'; newStatus = 'ระงับการใช้งาน'; }
  else if (action === 'delete') { msg = '⚠️ ลบข้อมูลผู้ใช้นี้ทิ้ง ใช่หรือไม่?'; }

  if(confirm(msg)) {
    showLoader('กำลังอัปเดตฐานข้อมูล...');
    if (action === 'delete') { db.collection("users").doc(userId).delete().then(() => { hideLoader(); alert('ลบข้อมูลสำเร็จ'); loadAdminDashboard(); }); } 
    else { db.collection("users").doc(userId).update({ status: newStatus }).then(() => { hideLoader(); alert('อัปเดตสถานะสำเร็จ'); loadAdminDashboard(); }); }
  }
}

function renderAdminQuestions() {
  let filter = document.getElementById('admin-exam-filter').value;
  let container = document.getElementById('admin-question-list');
  container.innerHTML = '<p style="text-align:center;">กำลังดึงข้อมูลข้อสอบ...</p>';

  const examFilter = document.getElementById('admin-exam-filter');
  const formCat = document.getElementById('q-form-cat');
  if(examFilter && examFilter.options.length <= 1) {
    topics.forEach(t => { examFilter.add(new Option(t, t)); if(formCat) formCat.add(new Option(t, t)); });
  }

  db.collection("exams").orderBy("createdAt", "desc").get().then((querySnapshot) => {
      let html = ''; let count = 0;
      querySnapshot.forEach((doc) => {
        let r = doc.data(); let docId = doc.id;
        if (filter === 'all' || (r.category && r.category.trim() === filter.trim())) {
          count++;
          html += `
            <div style="background:#fff; border: 1px solid var(--border-color); padding: 15px; margin-bottom: 12px; border-radius: 12px;">
              <div style="font-size:0.85rem; color:var(--primary); font-weight:700; margin-bottom:5px;">หมวด: ${r.category || 'ไม่ได้ระบุ'}</div>
              <div style="font-weight:600; margin-bottom:8px;">คำถาม: ${r.question}</div>
              <ul style="margin:0; padding-left:20px; font-size:0.9rem; color:var(--text-muted);">
                <li style="${r.answer == 1 ? 'color:var(--success-text); font-weight:bold;' : ''}">ก. ${r.options ? r.options[0] : ''}</li>
                <li style="${r.answer == 2 ? 'color:var(--success-text); font-weight:bold;' : ''}">ข. ${r.options ? r.options[1] : ''}</li>
                <li style="${r.answer == 3 ? 'color:var(--success-text); font-weight:bold;' : ''}">ค. ${r.options ? r.options[2] : ''}</li>
                <li style="${r.answer == 4 ? 'color:var(--success-text); font-weight:bold;' : ''}">ง. ${r.options ? r.options[3] : ''}</li>
              </ul>
              <div style="display:flex; gap:10px; margin-top:15px;">
                <button class="primary-btn" style="margin:0; padding:8px; flex:1;" onclick="editQuestionModal('${docId}')">แก้ไข</button>
                <button class="danger-btn" style="margin:0; padding:8px; flex:1; background:var(--danger-text);" onclick="deleteQuestion('${docId}')">ลบ</button>
              </div>
            </div>`;
        }
      });
      container.innerHTML = count === 0 ? '<p style="text-align:center; color:var(--text-muted);">ไม่พบข้อสอบในหมวดนี้</p>' : html;
    });
}

function showAddQuestionModal() {
  document.getElementById('q-form-title').innerText = 'เพิ่มข้อสอบใหม่';
  document.getElementById('q-form-index').value = '-1';
  document.getElementById('q-form-q').value = '';
  document.getElementById('q-form-a1').value = '';
  document.getElementById('q-form-a2').value = '';
  document.getElementById('q-form-a3').value = '';
  document.getElementById('q-form-a4').value = '';
  document.getElementById('q-form-ans').value = '';
  document.getElementById('q-form-explain').value = '';
  document.getElementById('question-form-modal').style.display = 'flex';
}

function editQuestionModal(docId) {
  showLoader('กำลังดึงข้อมูล...');
  db.collection("exams").doc(docId).get().then((doc) => {
      hideLoader();
      if (doc.exists) {
        const r = doc.data();
        document.getElementById('q-form-title').innerText = 'แก้ไขข้อสอบ';
        document.getElementById('q-form-index').value = docId; 
        document.getElementById('q-form-q').value = r.question;
        document.getElementById('q-form-a1').value = r.options[0];
        document.getElementById('q-form-a2').value = r.options[1];
        document.getElementById('q-form-a3').value = r.options[2];
        document.getElementById('q-form-a4').value = r.options[3];
        document.getElementById('q-form-ans').value = r.answer;
        document.getElementById('q-form-cat').value = r.category;
        document.getElementById('q-form-explain').value = r.explanation || "";
        document.getElementById('question-form-modal').style.display = 'flex';
      }
  });
}

function saveQuestionToFirebase() {
  let docId = document.getElementById('q-form-index').value;
  let qData = {
    category: document.getElementById('q-form-cat').value,
    question: document.getElementById('q-form-q').value,
    options: [ document.getElementById('q-form-a1').value, document.getElementById('q-form-a2').value, document.getElementById('q-form-a3').value, document.getElementById('q-form-a4').value ],
    answer: parseInt(document.getElementById('q-form-ans').value),
    explanation: document.getElementById('q-form-explain').value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  if(!qData.category || !qData.question || !qData.options[0] || !qData.answer) return alert('กรุณากรอกข้อมูลหลักให้ครบ');
  showLoader('กำลังบันทึก...');
  let task = (docId !== "-1") ? db.collection("exams").doc(docId).update(qData) : db.collection("exams").add({...qData, createdAt: qData.updatedAt});
  
  task.then(() => {
    hideLoader(); alert('บันทึกสำเร็จ!');
    document.getElementById('question-form-modal').style.display='none';
    localStorage.removeItem('examhub_exams_cache'); renderAdminQuestions(); loadData();
  }).catch(e => { hideLoader(); alert('เกิดข้อผิดพลาด: ' + e.message); });
}

function deleteQuestion(docId) {
  if (confirm("⚠️ ยืนยันที่จะลบข้อสอบข้อนี้ออกจากระบบถาวร?")) {
    showLoader('กำลังลบข้อมูล...');
    db.collection("exams").doc(docId).delete().then(() => {
        hideLoader(); alert('ลบสำเร็จ'); localStorage.removeItem('examhub_exams_cache'); renderAdminQuestions(); loadData();
      }).catch((e) => { hideLoader(); alert('ลบไม่สำเร็จ: ' + e.message); });
  }
}

function adminClearCache() {
  if(confirm('ระบบจะเคลียร์แคช ยืนยันไหม?')) {
    localStorage.removeItem('examhub_exams_cache'); loadData(); alert("เคลียร์แคชสำเร็จ ระบบโหลดข้อมูลใหม่แล้ว");
  }
}

async function bulkUploadExams() {
  const response = await fetch('questions.json');
  const data = await response.json();
  
  if (!data || data.length === 0) return alert("ไม่พบข้อมูลในไฟล์ questions.json");

  showLoader(`กำลังตรวจสอบและอัปโหลด ${data.length} ข้อ...`);
  
  let addedCount = 0;
  let skippedCount = 0;

  // 1. ดึงข้อสอบที่มีอยู่แล้วใน Firebase มาเช็คก่อน (เพื่อป้องกันข้อซ้ำ)
  const existingExams = await db.collection("exams").get();
  const existingQuestions = new Set();
  existingExams.forEach(doc => {
    existingQuestions.add(doc.data().question); // เก็บเฉพาะหัวข้อคำถามไว้เช็ค
  });

  // 2. เริ่มลูปอัปโหลด
  for (const item of data) {
    if (existingQuestions.has(item.question)) {
      // ถ้ามีโจทย์นี้ใน Firebase แล้ว ให้ข้ามไป
      skippedCount++;
      continue;
    }

    // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
    await db.collection("exams").add({
      category: item.category,
      question: item.question,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // บันทึกไว้ใน Set ด้วย เผื่อในไฟล์ JSON เองมีข้อซ้ำกัน
    existingQuestions.add(item.question);
    addedCount++;
  }

  hideLoader();
  alert(`✅ ดำเนินการเสร็จสิ้น!\n- เพิ่มข้อใหม่: ${addedCount} ข้อ\n- ข้ามข้อที่เคยมีแล้ว: ${skippedCount} ข้อ`);
  
  // ล้าง Cache เพื่อให้เครื่องดึงข้อมูลใหม่
  localStorage.removeItem('examhub_exams_cache');
  location.reload(); 
}
// ==========================================
// 📖 ฟังก์ชันแสดงเนื้อหาบทเรียน (โชว์ลิงก์ PDF/VDO)
// ==========================================
function showContentDetail(topic) {
    // 1. เปลี่ยนชื่อหัวข้อบนหน้าจอ
    document.getElementById('content-topic-title').innerText = topic;
    const container = document.getElementById('content-detail-container');

    // 2. ตรวจสอบลิงก์จากตัวแปร contentLinks (ที่เราเพิ่งวางไว้ด้านบน)
    const pdfLink = (contentLinks[topic] && contentLinks[topic].pdf) ? contentLinks[topic].pdf : "#";
    const vdoLink = (contentLinks[topic] && contentLinks[topic].vdo) ? contentLinks[topic].vdo : "#";

    // 3. เตรียมคำสั่งเมื่อกดปุ่ม (ถ้าไม่มีลิงก์ให้ขึ้น Alert)
    const pdfAction = pdfLink === "#" ? `onclick="alert('กำลังจัดทำเอกสารวิชานี้ครับ รอก่อนน้า ⏳'); return false;"` : `href="${pdfLink}" target="_blank"`;
    const vdoAction = vdoLink === "#" ? `onclick="alert('กำลังจัดทำคลิปติววิชานี้ครับ รอก่อนน้า ⏳'); return false;"` : `href="${vdoLink}" target="_blank"`;

    // 4. สร้างหน้าตา HTML ของปุ่มเนื้อหา
    container.innerHTML = `
        <div style="padding: 15px; border-left: 4px solid var(--primary); background: rgba(132, 182, 244, 0.1); border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 5px 0; color: var(--primary);">📚 เอกสารประกอบการเรียน</h4>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">คลิกเพื่อดาวน์โหลดไฟล์ PDF </p>
        </div>

        <div class="menu-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <a ${pdfAction} style="text-decoration: none;">
                <div class="card" style="text-align: center; padding: 20px 10px; border: 1px solid #eee; border-radius: 15px; background: white;">
                    <span class="material-symbols-rounded" style="font-size: 3rem; color: ${pdfLink === "#" ? '#ccc' : '#e53935'};">picture_as_pdf</span>
                    <div style="font-weight: 600; margin-top: 10px; color: ${pdfLink === "#" ? '#999' : '#333'}; font-size: 0.95rem;">คลิกอ่านเนื้อหา</div>
                </div>
            </a>

            
        </div>
    `;
    
    // 5. สั่งให้แอปเปลี่ยนหน้าไปที่ content-view-section
    navigate('content-view-section');
}

// ==========================================
// 🗂️ ฟังก์ชันเปิดหน้าเลือกหมวดหมู่วิชา (ข้อสอบ/เนื้อหา)
// ==========================================
function openTopicList(type) {
    currentActionMode = type; // เก็บค่าว่ากด 'exam' หรือ 'content'
    
    // เปลี่ยนชื่อหัวข้อ
    const listTitle = document.getElementById('topic-list-title');
    if (listTitle) {
        listTitle.innerText = type === 'exam' ? 'เลือกหมวดหมู่ข้อสอบ' : 'เลือกหมวดหมู่เนื้อหา';
    }

    const container = document.getElementById('topic-container');
    if (!container) return;
    container.innerHTML = '';

    // เลือกว่าจะดึงรายวิชาจากตัวแปรไหนมาโชว์
    const listToDisplay = (type === 'exam') 
        ? (typeof examTopics !== 'undefined' ? examTopics : topics) 
        : (typeof contentTopics !== 'undefined' ? contentTopics : topics);

    // สร้างปุ่มวิชา
    listToDisplay.forEach(t => {
        let btn = document.createElement('div');
        btn.className = 'menu-btn';
        const icon = type === 'exam' ? 'edit_document' : 'menu_book';
        btn.innerHTML = `<span class="material-symbols-rounded">${icon}</span> ${t}`;
        
        btn.onclick = () => {
            selectedExamTopic = t;
            if (type === 'exam') {
                const actionTitle = document.getElementById('topic-action-title');
                if (actionTitle) actionTitle.innerText = t;
                navigate('topic-action-section');
            } else if (type === 'content') {
                if (typeof showContentDetail === 'function') {
                    showContentDetail(t);
                } else {
                    alert("แจ้งเตือน: หาฟังก์ชันโชว์เนื้อหาไม่เจอครับ");
                }
            }
        };
        container.appendChild(btn);
    });

    // สลับหน้าจอ
    navigate('topic-list-section');
}

