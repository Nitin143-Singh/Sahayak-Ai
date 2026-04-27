/* ═══════════════════════════════════════════════════
   SAHAYAK AI  —  app.js  v3.0  (Complete Fix)
   ═══════════════════════════════════════════════════ */

/* ─────────── GLOBAL STATE ─────────── */
const S = {
  user: null,
  dashSection: 'overview',
  map: null,
  mapReady: false,
  recording: false,
  urgency: 'high',
  chatOpen: false,
  /* per-user live requests stored in localStorage */
};

/* ─────────── REGISTERED USERS DB (localStorage-backed) ─────────── */
const SYSTEM_USERS = [
  { email:'admin@sahayak.ai',   password:'admin123', name:'Admin User',         role:'admin',      avatar:'A' },
  { email:'citizen@test.com',   password:'test123',  name:'Rahul Sharma',       role:'citizen',    avatar:'R' },
  { email:'ngo@test.com',       password:'test123',  name:'Priya Singh',        role:'ngo',        avatar:'P' },
  { email:'volunteer@test.com', password:'test123',  name:'Arjun Verma',        role:'volunteer',  avatar:'A' },
  { email:'donor@test.com',     password:'test123',  name:'Sneha Patel',        role:'donor',      avatar:'S' },
  { email:'govt@test.com',      password:'test123',  name:'Rajesh Kumar',       role:'government', avatar:'R' },
];

function getUsersDB() {
  return JSON.parse(localStorage.getItem('sahayak-users') || JSON.stringify(SYSTEM_USERS));
}
function saveUsersDB(arr) {
  localStorage.setItem('sahayak-users', JSON.stringify(arr));
}
// Seed once
if (!localStorage.getItem('sahayak-users')) saveUsersDB(SYSTEM_USERS);

/* ─────────── MAP REQUEST DATA ─────────── */
const MAP_PINS = [
  { id:1, lat:25.4358, lng:81.8463, type:'🍛 Food',      title:'Food Emergency',   urgency:'high',      loc:'Civil Lines, Prayagraj',  desc:'Family of 24 displaced after flood — need dry ration for 5 days.',    date:'Apr 17',people:24 },
  { id:2, lat:25.3176, lng:82.9739, type:'💊 Medical',   title:'Medical Aid',      urgency:'high',      loc:'Lanka, Varanasi',          desc:'3 elderly patients need insulin and BP medication urgently.',          date:'Apr 16',people:3  },
  { id:3, lat:26.8467, lng:80.9462, type:'🏠 Shelter',   title:'Shelter Needed',   urgency:'medium',    loc:'Hazratganj, Lucknow',      desc:'Family of 6 evicted — need temporary accommodation for 1 week.',      date:'Apr 15',people:6  },
  { id:4, lat:27.1767, lng:78.0081, type:'💧 Water',     title:'Water Disruption', urgency:'medium',    loc:'Tajganj, Agra',            desc:'Colony of ~50 people without piped water for 3 days.',                date:'Apr 13',people:50 },
  { id:5, lat:26.4499, lng:80.3319, type:'📚 Education', title:'School Kits',      urgency:'low',       loc:'Kanpur Nagar',             desc:'20 underprivileged children need school bags, books and stationery.', date:'Apr 14',people:20 },
  { id:6, lat:25.4484, lng:81.8322, type:'⚡ Emergency', title:'Rescue Needed',    urgency:'high',      loc:'George Town, Prayagraj',   desc:'Fire accident — 8 people displaced, need immediate shelter & food.',  date:'Apr 12',people:8  },
  { id:7, lat:25.4600, lng:81.8500, type:'🤝 Volunteer', title:'Volunteer: Anita', urgency:'volunteer', loc:'Prayagraj',                desc:'Trained first-aid volunteer — available all day.',                     date:'Today', people:0  },
  { id:8, lat:26.8600, lng:80.9200, type:'🤝 Volunteer', title:'Volunteer: Sanjay',urgency:'volunteer', loc:'Lucknow',                  desc:'Logistics volunteer with own vehicle.',                                date:'Today', people:0  },
];

const NOTIFS_BASE = [
  { icon:'🆘', title:'New Urgent Request',  text:'Emergency flood relief needed in Prayagraj.',   time:'2 min ago' },
  { icon:'✅', title:'Request Resolved',    text:'Food distribution in Varanasi completed.',       time:'1 hour ago' },
  { icon:'💰', title:'Donation Received',   text:'₹5,000 donated for Medical Aid.',               time:'3 hours ago' },
  { icon:'🤝', title:'Volunteer Matched',   text:'Arjun assigned to shelter request #3.',          time:'Yesterday' },
];

/* ─────────── BOOT ─────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadUserSession();
  initScrollProgress();
  initParticles();
  initScrollReveal();
  animateCounters();
  showPage('home');
});

/* ─────────── SCROLL PROGRESS ─────────── */
function initScrollProgress() {
  window.addEventListener('scroll', () => {
    const pct = document.body.scrollHeight - innerHeight > 0
      ? (scrollY / (document.body.scrollHeight - innerHeight)) * 100 : 0;
    document.getElementById('scrollProgress').style.width = pct + '%';
    document.getElementById('navbar').classList.toggle('scrolled', scrollY > 40);
  });
}

/* ─────────── PARTICLES ─────────── */
function initParticles() {
  const cv = document.getElementById('particles-canvas'); if (!cv) return;
  const cx = cv.getContext('2d');
  const ps = [];
  const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
  resize(); window.addEventListener('resize', resize);
  for (let i=0;i<55;i++) ps.push({ x:Math.random()*innerWidth, y:Math.random()*innerHeight, r:Math.random()*2+1, dx:(Math.random()-.5)*.4, dy:(Math.random()-.5)*.4, op:Math.random()*.35+.08 });
  const dark = () => document.documentElement.dataset.theme === 'dark';
  (function draw() {
    cx.clearRect(0,0,cv.width,cv.height);
    const c = dark() ? '130,100,240' : '79,70,229';
    ps.forEach(p => {
      cx.beginPath(); cx.arc(p.x,p.y,p.r,0,Math.PI*2);
      cx.fillStyle=`rgba(${c},${p.op})`; cx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0||p.x>cv.width) p.dx*=-1;
      if(p.y<0||p.y>cv.height) p.dy*=-1;
    });
    for(let i=0;i<ps.length;i++) for(let j=i+1;j<ps.length;j++) {
      const d=Math.hypot(ps[i].x-ps[j].x,ps[i].y-ps[j].y);
      if(d<110){ cx.beginPath(); cx.moveTo(ps[i].x,ps[i].y); cx.lineTo(ps[j].x,ps[j].y);
        cx.strokeStyle=`rgba(${c},${.09*(1-d/110)})`; cx.lineWidth=.6; cx.stroke(); }
    }
    requestAnimationFrame(draw);
  })();
}

/* ─────────── SCROLL REVEAL ─────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.feature-card,.step,.article-card,.about-block,.team-card');
  els.forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold:.08 });
  els.forEach(el => obs.observe(el));
}

/* ─────────── COUNTER ANIMATION ─────────── */
function animateCounters() {
  [{ id:'c1',end:12400,sfx:'+' },{ id:'c2',end:3200,sfx:'+' },{ id:'c3',end:180,sfx:'+' }].forEach(({id,end,sfx}) => {
    const el = document.getElementById(id); if(!el) return;
    let v=0; const step=end/60;
    const t = setInterval(() => { v+=step; if(v>=end){ el.textContent=end.toLocaleString()+sfx; clearInterval(t); } else el.textContent=Math.floor(v).toLocaleString()+sfx; }, 25);
  });
}

/* ─────────── THEME ─────────── */
function loadTheme() {
  const s = localStorage.getItem('sahayak-theme');
  if(s) { document.documentElement.dataset.theme = s; const ic=document.querySelector('.theme-icon'); if(ic) ic.textContent = s==='dark'?'☀️':'🌙'; }
}
function toggleTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'light' : 'dark';
  document.querySelector('.theme-icon').textContent = dark ? '🌙' : '☀️';
  localStorage.setItem('sahayak-theme', dark ? 'light' : 'dark');
}

/* ─────────── PAGE ROUTING ─────────── */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const t = document.getElementById('page-'+page);
  if(t){ t.classList.add('active'); window.scrollTo(0,0); }
  document.querySelectorAll('[data-page]').forEach(l => l.classList.toggle('active', l.dataset.page===page));
  if(page==='dashboard') initDashboard();
  if(page==='admin')     initAdmin();
  if(page==='map')       setTimeout(initMap, 250);
  document.getElementById('navLinks').classList.remove('open');
}
function toggleMenu() { document.getElementById('navLinks').classList.toggle('open'); }

/* ─────────── NAV STATE ─────────── */
function updateNav() {
  const u = S.user;
  const show = (id, v) => { const el=document.getElementById(id); if(el) el.style.display=v; };
  if(u){ show('loginNavLink','none'); show('registerNavLink','none'); show('dashboardNavLink','inline-flex'); show('logoutNavLink','inline-flex'); }
  else  { show('loginNavLink','inline-flex'); show('registerNavLink','inline-flex'); show('dashboardNavLink','none'); show('logoutNavLink','none'); }
}

/* ─────────── AUTH ─────────── */
function fillDemo(email, pass) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = pass;
  showToast('Demo credentials filled — click Sign In!', 'info');
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('loginPassword').value.trim();
  if(!email||!pass){ showToast('Please enter email and password.','error'); return; }
  const db   = getUsersDB();
  const user = db.find(u => u.email.toLowerCase()===email && u.password===pass);
  if(!user){ showToast('Invalid credentials. Use a demo account below!','error'); return; }
  doLogin(user);
}

function handleRegister() {
  const first = document.getElementById('regFirst').value.trim();
  const last  = document.getElementById('regLast').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const role  = document.getElementById('regRole').value;
  const pass  = document.getElementById('regPassword').value.trim();
  const terms = document.getElementById('regTerms').checked;

  if(!first||!last||!email||!role||!pass){ showToast('Please fill all required fields.','error'); return; }
  if(pass.length<6){ showToast('Password must be at least 6 characters.','error'); return; }
  if(!terms){ showToast('Please accept the Terms of Service.','warn'); return; }

  const db = getUsersDB();
  if(db.find(u => u.email.toLowerCase()===email)){
    document.getElementById('emailError').textContent = '⚠️ This email is already registered. Please login.';
    showToast('Email already registered — please sign in instead.','warn'); return;
  }
  document.getElementById('emailError').textContent = '';

  const user = { email, password:pass, name:`${first} ${last}`, role, avatar:first[0].toUpperCase() };
  db.push(user); saveUsersDB(db);
  doLogin(user);
}

function doLogin(user) {
  S.user = user;
  sessionStorage.setItem('sahayak-session', JSON.stringify(user));
  if(!localStorage.getItem(`sahayak-req-${user.email}`))
    localStorage.setItem(`sahayak-req-${user.email}`, JSON.stringify([]));
  if(!localStorage.getItem(`sahayak-hist-${user.email}`))
    localStorage.setItem(`sahayak-hist-${user.email}`, JSON.stringify([]));
  updateNav();
  showToast(`Welcome, ${user.name}! 👋`, 'success');
  if(user.role==='admin') showPage('admin');
  else showPage('dashboard');
}

function loadUserSession() {
  const s = sessionStorage.getItem('sahayak-session');
  if(s){ S.user=JSON.parse(s); updateNav(); }
}

function handleLogout() {
  S.user=null; S.dashSection='overview';
  sessionStorage.removeItem('sahayak-session');
  updateNav();
  showToast('Logged out successfully.','success');
  showPage('home');
  const le=document.getElementById('loginEmail'), lp=document.getElementById('loginPassword');
  if(le)le.value=''; if(lp)lp.value='';
}

/* password strength */
function checkPwStrength(v) {
  let s=0;
  if(v.length>5)s++; if(/[A-Z]/.test(v))s++; if(/[0-9]/.test(v))s++; if(/[^A-Za-z0-9]/.test(v))s++;
  const fill=document.getElementById('pwStrength'), lbl=document.getElementById('pwLabel');
  const colors=['','#ef4444','#f59e0b','#22c55e','#16a34a'];
  const labels=['','Weak','Fair','Good','Strong'];
  if(fill){ fill.style.width=['0%','25%','50%','75%','100%'][s]; fill.style.background=colors[s]; }
  if(lbl){ lbl.textContent=labels[s]||''; lbl.style.color=colors[s]; }
}

/* ─────────── USER DATA HELPERS ─────────── */
function getUserRequests() {
  if(!S.user) return [];
  return JSON.parse(localStorage.getItem(`sahayak-req-${S.user.email}`) || '[]');
}
function saveUserRequests(arr) {
  if(!S.user) return;
  localStorage.setItem(`sahayak-req-${S.user.email}`, JSON.stringify(arr));
}
function getUserHistory() {
  if(!S.user) return [];
  return JSON.parse(localStorage.getItem(`sahayak-hist-${S.user.email}`) || '[]');
}
function addHistory(entry) {
  if(!S.user) return;
  const hist = getUserHistory();
  hist.unshift({ ...entry, date: new Date().toLocaleDateString('en-IN'), id: Date.now() });
  localStorage.setItem(`sahayak-hist-${S.user.email}`, JSON.stringify(hist.slice(0,30)));
}
function getUserDonations() {
  if(!S.user) return [];
  return JSON.parse(localStorage.getItem(`sahayak-don-${S.user.email}`) || '[]');
}
function addDonation(entry) {
  if(!S.user) return;
  const d = getUserDonations();
  d.unshift(entry);
  localStorage.setItem(`sahayak-don-${S.user.email}`, JSON.stringify(d));
}

/* ─────────── HERO MODAL ─────────── */
const HERO_MODALS = {
  medical: {
    title:'🚨 Medical Help Needed — Prayagraj',
    body:`<div class="modal-detail-grid">
      <div class="modal-badge urgent">🔴 Urgent</div>
      <p><strong>Location:</strong> Civil Lines, Prayagraj, UP</p>
      <p><strong>Request:</strong> An elderly resident (72) needs urgent insulin and cardiac medication. No family nearby.</p>
      <p><strong>Reported by:</strong> Neighbour via Sahayak AI App</p>
      <p><strong>Status:</strong> <span class="status-badge pending">Awaiting Volunteer</span></p>
      <p><strong>Needed by:</strong> Within 4 hours</p>
      <div class="modal-actions">
        <button class="btn-primary" onclick="closeModal();showPage('register')">🤝 Volunteer to Help</button>
        <button class="btn-ghost" onclick="closeModal();showPage('donate')">💰 Donate for Medicine</button>
      </div>
    </div>`
  },
  food: {
    title:'✅ Food Distributed — Varanasi',
    body:`<div class="modal-detail-grid">
      <div class="modal-badge resolved">✅ Resolved</div>
      <p><strong>Location:</strong> Lanka Ghat, Varanasi, UP</p>
      <p><strong>Delivered:</strong> 85 food packets distributed to flood-affected families by 3 NGO volunteers.</p>
      <p><strong>Resolved by:</strong> Priya Singh (NGO Volunteer), Help India Foundation</p>
      <p><strong>Date:</strong> April 15, 2026</p>
      <p><strong>Impact:</strong> <span style="color:var(--accent);font-weight:600">42 people helped</span></p>
      <div class="modal-actions">
        <button class="btn-primary" onclick="closeModal();showPage('register')">🤝 Join as Volunteer</button>
        <button class="btn-ghost" onclick="closeModal();showPage('map')">🗺️ View Live Map</button>
      </div>
    </div>`
  },
  volunteer: {
    title:'🤝 Volunteer Matched — Lucknow',
    body:`<div class="modal-detail-grid">
      <div class="modal-badge active">🔵 Active</div>
      <p><strong>Volunteer:</strong> Arjun Verma (4.9 ⭐ rating, 34 hrs served)</p>
      <p><strong>Assigned to:</strong> Shelter request — displaced family, Hazratganj, Lucknow</p>
      <p><strong>Task:</strong> Coordinating with NGO for temporary housing and 2-day meal supply.</p>
      <p><strong>Matched at:</strong> 10:32 AM, April 16, 2026</p>
      <p><strong>Status:</strong> <span class="status-badge active">In Progress</span></p>
      <div class="modal-actions">
        <button class="btn-primary" onclick="closeModal();showPage('register')">🤝 Become a Volunteer</button>
        <button class="btn-ghost" onclick="closeModal();showPage('about')">Learn More</button>
      </div>
    </div>`
  }
};

function openHeroModal(key) {
  const m = HERO_MODALS[key]; if(!m) return;
  showModal(m.title, m.body);
}

/* ─────────── ARTICLE MODAL ─────────── */
const ARTICLES = {
  flood: {
    title:'Flood Relief in Eastern UP: 2,000 Families Reached',
    body:`<div class="article-modal-body">
      <div class="article-modal-img" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">🏘️</div>
      <div class="article-tag">Community · April 2026</div>
      <p>When devastating floods struck eastern Uttar Pradesh in April 2026, Sahayak AI's real-time coordination platform sprang into action. Within 6 hours of the first distress signal, <strong>300+ volunteers</strong> were deployed across 12 districts.</p>
      <p>The platform's AI matching engine connected NGOs, government responders, and independent volunteers — ensuring no duplication of effort and maximum coverage. <strong>2,000 families</strong> received dry rations, medical aid, and temporary shelter within 48 hours.</p>
      <p><strong>Key Impact:</strong></p>
      <ul style="margin:.5rem 0 .5rem 1.2rem;color:var(--text2);font-size:.9rem;line-height:1.7">
        <li>12 NGO partners coordinated via single platform</li>
        <li>8,400 food packets distributed</li>
        <li>240 medical consultations provided</li>
        <li>Response time reduced by 60% vs traditional methods</li>
      </ul>
      <button class="btn-primary" onclick="closeModal();showPage('register')" style="margin-top:1rem">Join the Mission</button>
    </div>`
  },
  medical: {
    title:'Mobile Medical Camps Enabled by NGO Network',
    body:`<div class="article-modal-body">
      <div class="article-modal-img" style="background:linear-gradient(135deg,#22c55e,#16a34a)">💊</div>
      <div class="article-tag">Health · March 2026</div>
      <p>Through Sahayak AI's NGO coordination module, <strong>5 health NGOs</strong> ran 30 mobile medical camps across rural Uttar Pradesh in March 2026.</p>
      <p>Each camp was scheduled and staffed using real-time volunteer availability data from the platform — eliminating last-minute cancellations that plagued earlier efforts.</p>
      <p><strong>Results:</strong> 4,200+ patients screened, 1,800 prescriptions fulfilled, 340 critical referrals made.</p>
      <button class="btn-primary" onclick="closeModal();showPage('donate')" style="margin-top:1rem">Support Health Camps</button>
    </div>`
  },
  education: {
    title:'1,500 Students Received School Kits via Donors',
    body:`<div class="article-modal-body">
      <div class="article-modal-img" style="background:linear-gradient(135deg,#f59e0b,#d97706)">📚</div>
      <div class="article-tag">Education · February 2026</div>
      <p>In February 2026, <strong>1,500 underprivileged students</strong> across 22 government schools in UP received complete school kits — bags, books, stationery, and uniforms — funded through Sahayak AI's transparent donor platform.</p>
      <p>Donors could track their contribution in real time — from pledge to delivery — which increased average donation size by <strong>40%</strong> compared to opaque traditional channels.</p>
      <button class="btn-primary" onclick="closeModal();showPage('donate')" style="margin-top:1rem">Donate to Education</button>
    </div>`
  }
};

function openArticle(key) {
  const a = ARTICLES[key]; if(!a) return;
  showModal(a.title, a.body);
}

/* ─────────── LEGAL MODALS ─────────── */
function openLegalModal(type) {
  if(type==='privacy') {
    showModal('🔒 Privacy Policy', `<div style="max-height:360px;overflow-y:auto;font-size:.875rem;color:var(--text2);line-height:1.7">
      <p><strong>Last updated:</strong> April 2026</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">1. Data We Collect</h4>
      <p>We collect only what is necessary: name, email, phone, role, and help request details. We do <strong>not</strong> sell your data to any third party.</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">2. How We Use It</h4>
      <p>Your data is used solely to match help requests with volunteers, process donations, and improve platform effectiveness.</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">3. Data Security</h4>
      <p>All data is encrypted in transit and at rest. Admin users cannot see personal user information — only anonymized request metadata.</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">4. Your Rights</h4>
      <p>You may request deletion of your account and all associated data at any time by contacting support@sahayakai.org.</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">5. Cookies</h4>
      <p>We use session cookies only for authentication. No advertising cookies are used.</p>
    </div>`);
  } else {
    showModal('📄 Terms of Service', `<div style="max-height:360px;overflow-y:auto;font-size:.875rem;color:var(--text2);line-height:1.7">
      <p><strong>Last updated:</strong> April 2026</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">1. Acceptance</h4>
      <p>By using Sahayak AI, you agree to these terms. This platform is provided for social welfare coordination in India.</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">2. User Responsibilities</h4>
      <p>You agree to provide accurate information in help requests and to use the platform only for legitimate social welfare purposes.</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">3. Volunteer Conduct</h4>
      <p>Volunteers must complete assigned tasks or notify the platform at least 2 hours in advance of cancellation.</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">4. Donations</h4>
      <p>All donations are processed by certified payment partners. 80G tax receipts are issued for eligible donations.</p>
      <h4 style="margin:.75rem 0 .3rem;color:var(--text)">5. Prohibited Use</h4>
      <p>You may not use this platform for fraudulent requests, spam, or any activity that endangers others.</p>
    </div>`);
  }
}

/* ─────────── DASHBOARD ─────────── */
function initDashboard() {
  const u = S.user; if(!u){ showPage('login'); return; }
  document.getElementById('dashTitle').textContent = DASH_TITLES[u.role] || 'Dashboard';
  document.getElementById('dashSub').textContent   = `Welcome back, ${u.name} 👋`;
  document.getElementById('sidebarName').textContent = u.name;
  document.getElementById('sidebarRole').textContent = cap(u.role);
  document.getElementById('sidebarAvatar').textContent = u.avatar;
  document.getElementById('sidebarNav').innerHTML = buildSidebarNav(u.role);
  buildNotifPanel();
  showDashSection('overview');
}

const DASH_TITLES = {
  citizen:'🏠 Citizen Dashboard', ngo:'🏢 NGO Dashboard', volunteer:'🤝 Volunteer Dashboard',
  donor:'💰 Donor Dashboard', government:'🏛️ Government Dashboard'
};

function cap(s){ return s?s[0].toUpperCase()+s.slice(1):''; }

/* ─────────── SIDEBAR NAV ─────────── */
function buildSidebarNav(role) {
  const navs = {
    citizen:[
      {i:'📊',l:'Overview',      s:'overview'},
      {i:'🆘',l:'Request Help',  s:'requesthelp',page:true},
      {i:'📋',l:'My Requests',   s:'myrequests'},
      {i:'🕑',l:'History',       s:'history'},
      {i:'🔔',l:'Alerts',        s:'alerts'},
    ],
    ngo:[
      {i:'📊',l:'Overview',          s:'overview'},
      {i:'📥',l:'Incoming Requests', s:'myrequests'},
      {i:'🤝',l:'Assign Resources',  s:'assign'},
      {i:'📈',l:'Impact Report',     s:'impact'},
      {i:'💰',l:'Fundraising',       s:'fundraising'},
    ],
    volunteer:[
      {i:'📊',l:'Overview',           s:'overview'},
      {i:'✅',l:'My Tasks',           s:'mytasks'},
      {i:'📋',l:'Available Requests', s:'myrequests'},
      {i:'🗺️',l:'Find on Map',        s:'map',page:true},
      {i:'🏆',l:'Achievements',       s:'achievements'},
    ],
    donor:[
      {i:'📊',l:'Overview',      s:'overview'},
      {i:'💰',l:'Make Donation', s:'makedonation',page:true},
      {i:'📈',l:'Impact Track',  s:'impacttrack'},
      {i:'🧾',l:'Tax Receipts',  s:'taxreceipts'},
      {i:'🕑',l:'History',       s:'history'},
    ],
    government:[
      {i:'📊',l:'Analytics',    s:'analytics'},
      {i:'✅',l:'Approvals',    s:'approvals'},
      {i:'🗺️',l:'District Map', s:'map',page:true},
      {i:'📋',l:'Reports',      s:'reports'},
      {i:'⚙️',l:'Policy Config',s:'policy'},
    ],
  };
  const items = navs[role] || navs.citizen;
  return items.map(it => {
    const fn = it.page ? (it.s==='map' ? "showPage('map')" : `showPage('${it.s}')`) : `showDashSection('${it.s}')`;
    return `<div class="sidebar-nav-item" data-section="${it.s}" onclick="${fn}">${it.i} ${it.l}</div>`;
  }).join('');
}

function showDashSection(s) {
  S.dashSection = s;
  document.querySelectorAll('#sidebarNav .sidebar-nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.section===s));
  const el = document.getElementById('dashboardContent');
  const u  = S.user;
  if(!el||!u) return;
  el.innerHTML = buildSection(u.role, s);
  // re-init search if needed
  const si = el.querySelector('.live-search');
  if(si) si.addEventListener('input', e => liveSearch(e.target.value, el));
}

function buildSection(role, s) {
  if(s==='overview')    return buildOverview(role);
  if(s==='history')     return buildHistory();
  if(s==='alerts')      return buildAlerts();
  if(s==='myrequests')  return buildMyRequests(role);
  if(s==='analytics')   return buildGovtAnalytics();
  if(s==='approvals')   return buildGovtApprovals();
  if(s==='reports')     return buildGovtReports();
  if(s==='policy')      return buildGovtPolicy();
  if(s==='mytasks')     return buildVolTasks();
  if(s==='achievements')return buildAchievements();
  if(s==='impacttrack') return buildImpactTrack();
  if(s==='taxreceipts') return buildTaxReceipts();
  if(s==='makedonation'){ showPage('donate'); return ''; }
  if(s==='assign')      return buildAssign();
  if(s==='impact')      return buildNGOImpact();
  if(s==='fundraising') return buildFundraising();
  return buildOverview(role);
}

/* ─────────── OVERVIEW ─────────── */
function buildOverview(role) {
  const sd = {
    citizen:    [{i:'🆘',n:'3',l:'My Requests',c:'↑ 1 this week',up:true},{i:'✅',n:'2',l:'Resolved',c:'Good progress',up:true},{i:'⏳',n:'1',l:'Pending',c:'In review',up:false},{i:'⭐',n:'4.8',l:'Satisfaction',c:'↑ High',up:true}],
    ngo:        [{i:'📥',n:'28',l:'Open Requests',c:'↑ 5 today',up:true},{i:'🤝',n:'14',l:'Volunteers Active',c:'↑ Great!',up:true},{i:'✅',n:'142',l:'Resolved This Month',c:'↑ 18%',up:true},{i:'💰',n:'₹2.4L',l:'Funds Received',c:'↑ 12%',up:true}],
    volunteer:  [{i:'✅',n:'8',l:'Tasks Completed',c:'This month',up:true},{i:'⏳',n:'2',l:'Active Tasks',c:'In progress',up:false},{i:'⭐',n:'4.9',l:'Rating',c:'Excellent',up:true},{i:'🕐',n:'34h',l:'Hours Served',c:'↑ Great work!',up:true}],
    donor:      [{i:'💰',n:'₹0',l:'Total Donated',c:'View history',up:true},{i:'❤️',n:'0',l:'Lives Impacted',c:'Make a donation!',up:true},{i:'📋',n:'0',l:'Projects Funded',c:'Donate to start',up:false},{i:'🧾',n:'80G',l:'Tax Benefit',c:'Eligible',up:true}],
    government: [{i:'📊',n:'1,240',l:'Total Requests',c:'↑ 8% MoM',up:true},{i:'✅',n:'89%',l:'Resolution Rate',c:'↑ Excellent',up:true},{i:'⚡',n:'4.2h',l:'Avg Response',c:'↓ Improved',up:true},{i:'🏘️',n:'18',l:'Districts Covered',c:'UP-wide',up:false}],
  };
  // For donor, compute from real data
  if(role==='donor') {
    const d = getUserDonations();
    const total = d.reduce((a,x)=>a+parseInt(x.amount||0),0);
    sd.donor[0].n = '₹'+total.toLocaleString('en-IN');
    sd.donor[1].n = String(d.length*35);
    sd.donor[2].n = String(d.length);
  }
  const st = sd[role]||sd.citizen;
  const stats = `<div class="stats-grid">${st.map(x=>`<div class="stat-card"><div class="stat-card-icon">${x.i}</div><div class="stat-card-num">${x.n}</div><div class="stat-card-label">${x.l}</div><div class="stat-card-change ${x.up?'up':''}">${x.c}</div></div>`).join('')}</div>`;
  const qa   = buildQA(role);
  const reqs = getUserRequests();
  const table= reqs.length ? buildReqTable(reqs) : `<div class="empty-state"><div class="empty-icon">📭</div><p>No requests yet.</p><button class="btn-primary" onclick="showPage('requesthelp')">+ Create Request</button></div>`;
  const panels=`<div class="dash-panels"><div class="dash-panel"><div class="dash-panel-header"><h3>Your Requests</h3><button class="btn-sm-primary" onclick="showPage('requesthelp')">+ New</button></div>${table}</div><div class="dash-panel"><div class="dash-panel-header"><h3>Live Activity Feed</h3></div><div class="activity-feed">${buildFeed()}</div></div></div>`;
  const hist = buildHistoryMini();
  return stats+qa+panels+hist;
}

/* ─────────── QUICK ACTIONS ─────────── */
function buildQA(role) {
  const m = {
    citizen:   [{l:'🆘 New Request',fn:"showPage('requesthelp')"},{l:'🗺️ Live Map',fn:"showPage('map')"},{l:'📞 Contact',fn:"showPage('contact')"}],
    ngo:       [{l:'📥 View Requests',fn:"showDashSection('myrequests')"},{l:'🗺️ Map',fn:"showPage('map')"},{l:'📈 Impact',fn:"showDashSection('impact')"}],
    volunteer: [{l:'✅ My Tasks',fn:"showDashSection('mytasks')"},{l:'🗺️ Find Tasks',fn:"showPage('map')"},{l:'🏆 Achievements',fn:"showDashSection('achievements')"}],
    donor:     [{l:'💰 Donate Now',fn:"showPage('donate')"},{l:'📈 Impact Track',fn:"showDashSection('impacttrack')"},{l:'🧾 Tax Receipts',fn:"showDashSection('taxreceipts')"}],
    government:[{l:'✅ Approvals',fn:"showDashSection('approvals')"},{l:'📋 Reports',fn:"showDashSection('reports')"},{l:'⚙️ Policy',fn:"showDashSection('policy')"}],
  };
  return `<div class="quick-actions-row">${(m[role]||m.citizen).map(a=>`<button class="quick-action-btn" onclick="${a.fn}">${a.l}</button>`).join('')}</div>`;
}

/* ─────────── REQUEST TABLE ─────────── */
function buildReqTable(rows) {
  if(!rows||!rows.length) return `<div class="empty-state"><div class="empty-icon">📭</div><p>No requests found.</p></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>#</th><th>Type</th><th>Location</th><th>Urgency</th><th>People</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${rows.map(r=>`<tr>
      <td style="font-size:.78rem;color:var(--text3)">#${r.id}</td>
      <td>${r.type}</td>
      <td>📍 ${r.location}</td>
      <td><span class="status-badge ${r.urgency==='high'?'urgent':r.urgency==='medium'?'pending':'active'}">${r.urgency}</span></td>
      <td>${r.people}</td>
      <td><span class="status-badge ${r.status}" id="rs-${r.id}">${r.status}</span></td>
      <td style="display:flex;gap:.4rem;flex-wrap:wrap">
        ${r.status!=='resolved'?`<button class="btn-sm-primary" style="font-size:.7rem" onclick="resolveRequest(${r.id})">✅ Resolve</button>`:''}
        <button class="btn-sm-outline" style="font-size:.7rem;color:var(--danger);border-color:var(--danger)" onclick="deleteRequest(${r.id})">🗑</button>
      </td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function resolveRequest(id) {
  const reqs = getUserRequests();
  const r = reqs.find(x=>x.id===id); if(!r) return;
  r.status = 'resolved';
  saveUserRequests(reqs);
  addHistory({ type:r.type, desc:`Request #${id} marked resolved`, status:'resolved' });
  showToast('Request marked as resolved! ✅','success');
  showDashSection(S.dashSection);
}
function deleteRequest(id) {
  const reqs = getUserRequests().filter(x=>x.id!==id);
  saveUserRequests(reqs);
  showToast('Request deleted.','info');
  showDashSection(S.dashSection);
}

/* ─────────── ACTIVITY FEED ─────────── */
function buildFeed() {
  const items=[
    {dot:'green', text:'Food distribution completed — Varanasi', time:'10 min ago'},
    {dot:'blue',  text:'Volunteer Arjun accepted shelter task',  time:'1 hr ago'},
    {dot:'red',   text:'Urgent request raised — Prayagraj',      time:'2 hr ago'},
    {dot:'yellow',text:'Donation ₹5,000 received',               time:'3 hr ago'},
    {dot:'green', text:'Medical camp completed — Kanpur',         time:'5 hr ago'},
  ];
  return items.map(i=>`<div class="activity-item"><div class="activity-dot ${i.dot}"></div><div><div class="activity-text">${i.text}</div><div class="activity-time">${i.time}</div></div></div>`).join('');
}

/* ─────────── MY REQUESTS ─────────── */
function buildMyRequests(role) {
  const isVol = role==='volunteer';
  const baseReqs = getUserRequests();
  // For volunteer/ngo show all MAP_PINS as community requests too
  const allReqs = isVol||role==='ngo'||role==='government'
    ? [...baseReqs, ...MAP_PINS.filter(p=>p.urgency!=='volunteer').map(p=>({id:p.id+1000,type:p.type,location:p.loc,urgency:p.urgency,status:'pending',people:p.people,date:p.date,desc:p.desc}))]
    : baseReqs;
  const btn = isVol ? `<button class="btn-sm-primary" onclick="showPage('map')">🗺️ Map</button>` : `<button class="btn-sm-primary" onclick="showPage('requesthelp')">+ New</button>`;
  const table = allReqs.length ? buildReqTable(allReqs) : `<div class="empty-state"><div class="empty-icon">📭</div><p>No requests yet.</p><button class="btn-primary" onclick="showPage('requesthelp')">+ Create Request</button></div>`;
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>${isVol?'Available Requests':'My Requests'}</h3>${btn}</div>
    <div class="dash-search-row"><div class="search-input-wrap"><span class="search-icon">🔍</span><input class="live-search" type="text" placeholder="Search by type, location, urgency..."></div>
    <select class="filter-select" onchange="filterReqByStatus(this.value)"><option value="">All Status</option><option>pending</option><option>active</option><option>resolved</option></select></div>
    <div id="reqTableHolder">${table}</div></div>`;
}

function filterReqByStatus(val) {
  const reqs = getUserRequests().filter(r=>!val||r.status===val);
  const el = document.getElementById('reqTableHolder');
  if(el) el.innerHTML = buildReqTable(reqs);
}

function liveSearch(q, container) {
  const rows = container.querySelectorAll('tbody tr');
  rows.forEach(row => row.style.display = row.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none');
}

/* ─────────── HISTORY ─────────── */
function buildHistory() {
  const h = getUserHistory();
  if(!h.length) return `<div class="dash-panel"><div class="dash-panel-header"><h3>🕑 Activity History</h3></div><div class="empty-state"><div class="empty-icon">📂</div><p>No history yet — submit a request or donate to get started!</p><button class="btn-primary" onclick="showPage('requesthelp')">Request Help</button></div></div>`;
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>🕑 Complete Activity History</h3><span style="font-size:.78rem;color:var(--text3)">${h.length} entries</span></div>
    ${h.map(x=>`<div class="history-item"><div><div class="history-type">${x.type||'Action'}</div><div class="history-desc">${x.desc||'—'}</div></div><div style="text-align:right"><span class="status-badge ${x.status||'active'}">${x.status||'active'}</span><div class="history-date">${x.date}</div></div></div>`).join('')}
  </div>`;
}
function buildHistoryMini() {
  const h = getUserHistory().slice(0,3);
  if(!h.length) return '';
  return `<div class="history-card" style="margin-top:1.5rem"><div class="dash-panel-header"><h3>📂 Recent History</h3><button class="btn-sm-outline" onclick="showDashSection('history')">View All</button></div>
    ${h.map(x=>`<div class="history-item"><div><strong>${x.type||'Action'}</strong><br><span style="font-size:.78rem;color:var(--text3)">${x.desc||''}</span></div><div style="text-align:right"><span class="status-badge ${x.status||'active'}">${x.status||'active'}</span><br><span style="font-size:.72rem;color:var(--text3)">${x.date}</span></div></div>`).join('')}
  </div>`;
}

/* ─────────── ALERTS ─────────── */
function buildAlerts() {
  const userReqs = getUserRequests();
  const dynamic  = userReqs.filter(r=>r.status==='pending').map(r=>({icon:'⏳',title:'Request Pending',text:`${r.type} — ${r.location} awaiting response.`,time:r.date}));
  const all = [...dynamic, ...NOTIFS_BASE];
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>🔔 Alerts & Notifications</h3><span class="status-badge urgent">${all.length} New</span></div>
    ${all.map(n=>`<div class="notif-item" style="border-bottom:1px solid var(--border);padding:.85rem 0"><div class="notif-item-title">${n.icon} ${n.title}</div><div class="notif-item-text">${n.text}</div><div class="notif-item-time">${n.time}</div></div>`).join('')}
  </div>`;
}

/* ─────────── VOLUNTEER SECTIONS ─────────── */
function buildVolTasks() {
  const reqs = getUserRequests().filter(r=>r.status!=='resolved');
  const mapTasks = MAP_PINS.filter(p=>p.urgency!=='volunteer').slice(0,4).map(p=>({id:p.id+2000,req:p.type+' — '+p.title,location:p.loc,urgency:p.urgency,status:'open',due:'Apr 25, 2026',isMap:true}));
  const myTasks = reqs.map(r=>({id:r.id,req:r.type,location:r.location,urgency:r.urgency,status:r.status,due:r.date,isMap:false}));
  const all = [...myTasks,...mapTasks];
  if(!all.length) return `<div class="dash-panel"><div class="dash-panel-header"><h3>✅ My Tasks</h3><button class="btn-sm-primary" onclick="showPage('map')">🗺️ Find Tasks</button></div><div class="empty-state"><div class="empty-icon">🎯</div><p>No tasks yet! Explore the map to find requests near you.</p><button class="btn-primary" onclick="showPage('map')">Open Live Map</button></div></div>`;
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>✅ My Tasks</h3><button class="btn-sm-primary" onclick="showPage('map')">🗺️ Find Tasks</button></div>
    <table><thead><tr><th>Task</th><th>Location</th><th>Urgency</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${all.map(t=>`<tr>
      <td>${t.req}</td><td>📍 ${t.location}</td>
      <td><span class="status-badge ${t.urgency==='high'?'urgent':t.urgency==='medium'?'pending':'active'}">${t.urgency}</span></td>
      <td>${t.due}</td>
      <td id="ts-${t.id}"><span class="status-badge ${t.status==='resolved'||t.status==='done'?'resolved':t.status==='active'?'active':'pending'}">${t.status}</span></td>
      <td>${t.status!=='resolved'&&t.status!=='done'?`<button class="btn-sm-primary" style="font-size:.7rem" onclick="markTaskDone(${t.id},${t.isMap},this)">✅ Done</button>`:'<span style="color:var(--accent);font-size:.8rem">✓ Done</span>'}</td>
    </tr>`).join('')}</tbody></table>
  </div>`;
}

function markTaskDone(id, isMap, btn) {
  if(!isMap) { resolveRequest(id); }
  const cell = document.getElementById('ts-'+id);
  if(cell) cell.innerHTML = '<span class="status-badge resolved">done</span>';
  btn.outerHTML = '<span style="color:var(--accent);font-size:.8rem">✓ Done</span>';
  addHistory({type:'Task Completed', desc:`Task #${id} marked done`, status:'resolved'});
  showToast('Task completed! Great work 🎉','success');
}

function buildAchievements() {
  const reqs = getUserRequests().length;
  const done = getUserHistory().filter(h=>h.status==='resolved').length;
  const badges = [
    {i:'🏅',n:'First Responder',   d:'Completed your first task',          e:done>=1,    prog:`${Math.min(done,1)}/1`},
    {i:'⭐',n:'5-Star Volunteer',  d:'Maintain 4.8+ rating for 30 days',   e:done>=5,    prog:`${Math.min(done,5)}/5 tasks`},
    {i:'🔥',n:'Week Warrior',      d:'Active 7 days in a row',             e:false,       prog:'Keep going!'},
    {i:'💯',n:'Century Club',      d:'Complete 100 tasks',                  e:done>=100,  prog:`${done}/100`},
    {i:'🌟',n:'Community Hero',    d:'Impact 500+ lives',                   e:false,       prog:'340/500'},
    {i:'🕐',n:'50 Hours',          d:'Serve 50 volunteer hours',            e:done>=50,   prog:`${done*4}/50h`},
  ];
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>🏆 Achievements & Badges</h3></div>
    <div class="achievements-grid">${badges.map(b=>`<div class="achievement-card ${b.e?'earned':'locked'}"><div class="achievement-icon">${b.i}</div><div class="achievement-name">${b.n}</div><div class="achievement-desc">${b.d}</div>${b.e?'<div class="achievement-earned">✅ Earned</div>':`<div class="achievement-progress">${b.prog}</div>`}</div>`).join('')}</div>
  </div>`;
}

/* ─────────── DONOR SECTIONS ─────────── */
function buildImpactTrack() {
  const d = getUserDonations();
  const total = d.reduce((a,x)=>a+parseInt(x.amount||0),0);
  const lives = d.length*35;
  const stats = `<div class="stats-grid">
    <div class="stat-card"><div class="stat-card-icon">💰</div><div class="stat-card-num">₹${total.toLocaleString('en-IN')}</div><div class="stat-card-label">Total Donated</div></div>
    <div class="stat-card"><div class="stat-card-icon">❤️</div><div class="stat-card-num">${lives}</div><div class="stat-card-label">Lives Impacted</div></div>
    <div class="stat-card"><div class="stat-card-icon">📋</div><div class="stat-card-num">${d.length}</div><div class="stat-card-label">Donations Made</div></div>
    <div class="stat-card"><div class="stat-card-icon">📈</div><div class="stat-card-num">85%</div><div class="stat-card-label">Direct to Beneficiaries</div></div>
  </div>`;
  const table = d.length ? `<table><thead><tr><th>Amount</th><th>Category</th><th>Date</th><th>Lives</th><th>Status</th><th>Txn ID</th></tr></thead><tbody>
    ${d.map(x=>`<tr><td><strong>₹${parseInt(x.amount).toLocaleString('en-IN')}</strong></td><td>${x.category}</td><td>${x.date}</td><td style="color:var(--accent)"><strong>${Math.round(parseInt(x.amount)/150)}</strong></td><td><span class="status-badge resolved">disbursed</span></td><td style="font-size:.75rem;color:var(--text3)">${x.txn}</td></tr>`).join('')}
    </tbody></table>` : `<div class="empty-state"><div class="empty-icon">💰</div><p>No donations yet. Make your first donation!</p><button class="btn-primary" onclick="showPage('donate')">Donate Now</button></div>`;
  const breakdown = d.length ? `<div class="fund-breakdown" style="margin-top:1.5rem"><h4 style="font-family:var(--font-head);margin-bottom:1rem">Fund Allocation</h4>
    <div class="fund-bar"><div class="fund-label">Beneficiaries</div><div class="fund-track"><div class="fund-fill green" style="width:85%"></div></div><span>85%</span></div>
    <div class="fund-bar"><div class="fund-label">Operations</div><div class="fund-track"><div class="fund-fill" style="width:10%"></div></div><span>10%</span></div>
    <div class="fund-bar"><div class="fund-label">Technology</div><div class="fund-track"><div class="fund-fill yellow" style="width:5%"></div></div><span>5%</span></div>
  </div>` : '';
  return stats + `<div class="dash-panel"><div class="dash-panel-header"><h3>📈 Your Donation Impact</h3><button class="btn-sm-primary" onclick="showPage('donate')">+ Donate</button></div>${table}${breakdown}</div>`;
}

function buildTaxReceipts() {
  const d = getUserDonations();
  if(!d.length) return `<div class="dash-panel"><div class="dash-panel-header"><h3>🧾 80G Tax Receipts</h3></div><div class="empty-state"><div class="empty-icon">🧾</div><p>No receipts yet. Make a donation to get your 80G receipt!</p><button class="btn-primary" onclick="showPage('donate')">Donate Now</button></div></div>`;
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>🧾 80G Tax Receipts</h3></div>
    <div style="background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1.25rem;font-size:.875rem">
      ✅ All donations qualify for <strong>Section 80G tax deduction</strong>. Download receipts for your ITR filing.
    </div>
    <table><thead><tr><th>Txn ID</th><th>Amount</th><th>Date</th><th>Category</th><th>FY</th><th>Download</th></tr></thead><tbody>
    ${d.map(x=>`<tr><td style="font-size:.75rem;color:var(--text3)">${x.txn}</td><td><strong>₹${parseInt(x.amount).toLocaleString('en-IN')}</strong></td><td>${x.date}</td><td>${x.category}</td><td>2025-26</td><td><button class="btn-sm-primary" style="font-size:.72rem" onclick="showToast('Receipt downloaded! 📄','success')">⬇ PDF</button></td></tr>`).join('')}
    </tbody></table>
    <div style="margin-top:1rem;font-size:.78rem;color:var(--text3)">Receipts are also emailed within 24 hours of each donation.</div>
  </div>`;
}

/* ─────────── NGO SECTIONS ─────────── */
function buildAssign() {
  const openReqs = MAP_PINS.filter(p=>p.urgency!=='volunteer');
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>🤝 Assign Resources to Requests</h3></div>
    ${openReqs.map(r=>`<div class="assign-row" id="ar-${r.id}">
      <div class="assign-info"><strong>${r.type} — ${r.title}</strong><div class="assign-meta">📍 ${r.loc} · ${r.people} people · <span class="status-badge ${r.urgency==='high'?'urgent':r.urgency==='medium'?'pending':'active'}">${r.urgency}</span></div><div class="assign-desc">${r.desc}</div></div>
      <div class="assign-actions">
        <select class="filter-select" id="vol-${r.id}" style="font-size:.8rem">
          <option value="">— Select Volunteer —</option>
          <option>Anita Rao (Prayagraj)</option>
          <option>Sanjay Patel (Lucknow)</option>
          <option>Meena Gupta (Varanasi)</option>
          <option>Ravi Tiwari (Agra)</option>
          <option>Sunita Devi (Kanpur)</option>
        </select>
        <button class="btn-sm-primary" style="font-size:.75rem" onclick="doAssign(${r.id})">✅ Assign</button>
      </div>
    </div>`).join('')}
  </div>`;
}

function doAssign(id) {
  const sel = document.getElementById('vol-'+id);
  if(!sel||!sel.value){ showToast('Please select a volunteer first.','warn'); return; }
  const row = document.getElementById('ar-'+id);
  if(row) { row.style.opacity='.5'; row.style.pointerEvents='none'; }
  addHistory({type:'Resource Assigned', desc:`Volunteer "${sel.value}" assigned to request #${id}`, status:'active'});
  showToast(`${sel.value} assigned successfully! ✅`,'success');
}

function buildNGOImpact() {
  return `<div class="stats-grid">
    <div class="stat-card"><div class="stat-card-icon">✅</div><div class="stat-card-num">142</div><div class="stat-card-label">Requests Resolved</div></div>
    <div class="stat-card"><div class="stat-card-icon">👥</div><div class="stat-card-num">2,400</div><div class="stat-card-label">Beneficiaries Reached</div></div>
    <div class="stat-card"><div class="stat-card-icon">🤝</div><div class="stat-card-num">14</div><div class="stat-card-label">Active Volunteers</div></div>
    <div class="stat-card"><div class="stat-card-icon">💰</div><div class="stat-card-num">₹2.4L</div><div class="stat-card-label">Funds Utilised</div></div>
  </div>
  <div class="dash-panel"><div class="dash-panel-header"><h3>📈 Monthly Impact Report — April 2026</h3></div>
    <div class="fund-breakdown">
      <div class="fund-bar"><div class="fund-label">🍛 Food</div><div class="fund-track"><div class="fund-fill" style="width:75%"></div></div><span>75% goal</span></div>
      <div class="fund-bar"><div class="fund-label">💊 Medical</div><div class="fund-track"><div class="fund-fill green" style="width:60%"></div></div><span>60% goal</span></div>
      <div class="fund-bar"><div class="fund-label">🏠 Shelter</div><div class="fund-track"><div class="fund-fill yellow" style="width:40%"></div></div><span>40% goal</span></div>
      <div class="fund-bar"><div class="fund-label">📚 Education</div><div class="fund-track"><div class="fund-fill" style="width:55%;background:var(--primary-light)"></div></div><span>55% goal</span></div>
    </div>
    <div style="margin-top:1.25rem;display:flex;gap:.75rem;flex-wrap:wrap">
      <button class="btn-primary" onclick="showToast('Report PDF downloaded! 📋','success')">⬇ Download Report</button>
      <button class="btn-ghost" onclick="showToast('Report shared with stakeholders! 📧','success')">📤 Share Report</button>
    </div>
  </div>`;
}

function buildFundraising() {
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>💰 Fundraising Dashboard</h3></div>
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card"><div class="stat-card-icon">🎯</div><div class="stat-card-num">₹5L</div><div class="stat-card-label">Campaign Goal</div></div>
      <div class="stat-card"><div class="stat-card-icon">📊</div><div class="stat-card-num">₹2.4L</div><div class="stat-card-label">Raised So Far</div></div>
      <div class="stat-card"><div class="stat-card-icon">👥</div><div class="stat-card-num">48%</div><div class="stat-card-label">Goal Completion</div></div>
      <div class="stat-card"><div class="stat-card-icon">📅</div><div class="stat-card-num">18</div><div class="stat-card-label">Days Remaining</div></div>
    </div>
    <div style="margin-bottom:1.25rem">
      <div style="display:flex;justify-content:space-between;font-size:.875rem;margin-bottom:.5rem"><span>Campaign Progress</span><strong style="color:var(--primary)">₹2.4L / ₹5L</strong></div>
      <div style="height:14px;background:var(--bg3);border-radius:7px;overflow:hidden"><div style="height:100%;width:48%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:7px;transition:width 1s"></div></div>
    </div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap">
      <button class="btn-primary" onclick="showToast('Campaign link copied to clipboard! 📋','success')">📢 Share Campaign</button>
      <button class="btn-ghost" onclick="showToast('Donor outreach email sent! 📧','success')">📧 Email Donors</button>
      <button class="btn-ghost" onclick="showToast('WhatsApp message sent! 💬','success')">💬 WhatsApp</button>
    </div>
    <div style="margin-top:1.5rem">
      <h4 style="font-family:var(--font-head);margin-bottom:.75rem">Recent Campaign Donations</h4>
      ${[{n:'Anonymous',a:'₹2,000',c:'Food Program'},{n:'Ravi K.',a:'₹500',c:'Medical Aid'},{n:'Priya S.',a:'₹5,000',c:'Education'},{n:'Mohan D.',a:'₹1,000',c:'Shelter'}].map(d=>`<div style="display:flex;justify-content:space-between;padding:.6rem 0;border-bottom:1px solid var(--border);font-size:.875rem"><span>${d.n} — <span style="color:var(--text3)">${d.c}</span></span><strong style="color:var(--accent)">${d.a}</strong></div>`).join('')}
    </div>
  </div>`;
}

/* ─────────── GOVT SECTIONS ─────────── */
function buildGovtAnalytics() {
  return `<div class="stats-grid">
    <div class="stat-card"><div class="stat-card-icon">📊</div><div class="stat-card-num">1,240</div><div class="stat-card-label">Total Requests</div><div class="stat-card-change up">↑ 8% MoM</div></div>
    <div class="stat-card"><div class="stat-card-icon">✅</div><div class="stat-card-num">89%</div><div class="stat-card-label">Resolution Rate</div><div class="stat-card-change up">Excellent</div></div>
    <div class="stat-card"><div class="stat-card-icon">⚡</div><div class="stat-card-num">4.2h</div><div class="stat-card-label">Avg Response</div><div class="stat-card-change up">↓ Improved</div></div>
    <div class="stat-card"><div class="stat-card-icon">💰</div><div class="stat-card-num">₹24L</div><div class="stat-card-label">Funds Allocated</div><div class="stat-card-change up">↑ 15%</div></div>
  </div>
  <div class="dash-panel"><div class="dash-panel-header"><h3>Request Distribution by Category</h3></div>
    <div class="fund-breakdown">
      <div class="fund-bar"><div class="fund-label">🍛 Food</div><div class="fund-track"><div class="fund-fill" style="width:35%"></div></div><span>35%</span></div>
      <div class="fund-bar"><div class="fund-label">💊 Medical</div><div class="fund-track"><div class="fund-fill green" style="width:25%"></div></div><span>25%</span></div>
      <div class="fund-bar"><div class="fund-label">🏠 Shelter</div><div class="fund-track"><div class="fund-fill yellow" style="width:20%"></div></div><span>20%</span></div>
      <div class="fund-bar"><div class="fund-label">📚 Education</div><div class="fund-track"><div class="fund-fill" style="width:12%;background:var(--primary-light)"></div></div><span>12%</span></div>
      <div class="fund-bar"><div class="fund-label">Others</div><div class="fund-track"><div class="fund-fill" style="width:8%;background:var(--text3)"></div></div><span>8%</span></div>
    </div>
  </div>`;
}

function buildGovtApprovals() {
  const pending = [
    {id:'AP-01', org:'Seva Foundation',  type:'Resource Allocation',  loc:'Prayagraj', date:'Apr 18'},
    {id:'AP-02', org:'Help India NGO',   type:'Emergency Camp Setup', loc:'Civil Lines',date:'Apr 17'},
    {id:'AP-03', org:'Care First',       type:'Medical Camp Permit',  loc:'Varanasi',  date:'Apr 16'},
    {id:'AP-04', org:'Asha Kiran Trust', type:'School Kit Distribution',loc:'Kanpur',   date:'Apr 15'},
  ];
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>✅ Pending Approvals</h3><span class="status-badge urgent">${pending.length} Pending</span></div>
    ${pending.map(a=>`<div class="approval-row" id="ap-${a.id}">
      <div>
        <strong>${a.id} — ${a.org}</strong> · ${a.type}
        <div style="font-size:.78rem;color:var(--text3)">📍 ${a.loc} · ${a.date}, 2026</div>
      </div>
      <div style="display:flex;gap:.5rem">
        <button class="btn-sm-primary" style="font-size:.75rem" onclick="approveItem('${a.id}','${a.org}')">✅ Approve</button>
        <button class="btn-sm-outline" style="font-size:.75rem;color:var(--danger);border-color:var(--danger)" onclick="rejectItem('${a.id}')">❌ Reject</button>
      </div>
    </div>`).join('')}
  </div>`;
}

function approveItem(id, org) {
  const row = document.getElementById('ap-'+id);
  if(row){ row.style.opacity='.4'; row.style.pointerEvents='none'; }
  addHistory({type:'Approval Granted',desc:`Approved: ${org} (${id})`,status:'resolved'});
  showToast(`${org} approved! ✅`,'success');
}
function rejectItem(id) {
  const row = document.getElementById('ap-'+id);
  if(row){ row.style.opacity='.4'; row.style.pointerEvents='none'; }
  showToast(`Request ${id} rejected.`,'warn');
}

function buildGovtReports() {
  const districts = [
    {d:'Prayagraj',t:320,r:285,v:42,c:'89%'},{d:'Varanasi',t:210,r:198,v:31,c:'94%'},
    {d:'Lucknow',t:280,r:240,v:55,c:'86%'},{d:'Agra',t:180,r:155,v:28,c:'86%'},
    {d:'Kanpur',t:250,r:211,v:37,c:'84%'},{d:'Gorakhpur',t:160,r:130,v:22,c:'81%'},
  ];
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>📋 District-wise Reports</h3><button class="btn-sm-primary" onclick="showToast('All reports exported! 📂','success')">⬇ Export All</button></div>
    <table><thead><tr><th>District</th><th>Requests</th><th>Resolved</th><th>Volunteers</th><th>Coverage</th><th>Report</th></tr></thead>
    <tbody>${districts.map(x=>`<tr><td><strong>${x.d}</strong></td><td>${x.t}</td><td style="color:var(--accent)">${x.r}</td><td>${x.v}</td><td><span class="status-badge resolved">${x.c}</span></td><td><button class="btn-sm-outline" style="font-size:.72rem" onclick="showToast('${x.d} report downloaded! 📋','success')">⬇ PDF</button></td></tr>`).join('')}
    </tbody></table>
  </div>`;
}

function buildGovtPolicy() {
  const policies = [
    {l:'Auto-escalate Urgent Requests after 2h',checked:true},
    {l:'Send SMS Alerts to Matched Volunteers',checked:true},
    {l:'Allow Public Request Visibility',checked:false},
    {l:'NGO Self-Allocation Enabled',checked:true},
    {l:'Anonymous Donations Allowed',checked:true},
    {l:'Government Data Access for NGOs',checked:false},
    {l:'Email Digest to Officials (Daily)',checked:true},
  ];
  return `<div class="dash-panel"><div class="dash-panel-header"><h3>⚙️ Policy Configuration</h3></div>
    <div class="policy-grid">${policies.map(p=>`<div class="policy-item"><div class="policy-name">${p.l}</div><label class="toggle-switch"><input type="checkbox" ${p.checked?'checked':''} onchange="showToast('Policy updated! ⚙️','success')"><span class="toggle-slider"></span></label></div>`).join('')}</div>
    <div style="display:flex;gap:.75rem;margin-top:1.5rem">
      <button class="btn-primary" onclick="showToast('Policy configuration saved! ⚙️','success')">💾 Save Changes</button>
      <button class="btn-ghost" onclick="showToast('Changes reverted.','info')">↩ Revert</button>
    </div>
  </div>`;
}

/* ─────────── ADMIN ─────────── */
function initAdmin() {
  showAdminSection('overview');
}
function showAdminSection(section) {
  document.querySelectorAll('.admin-sidebar .sidebar-nav-item').forEach(el =>
    el.classList.toggle('active', el.textContent.toLowerCase().replace(/[^\w]/g,'').includes(section.replace(/[^\w]/g,''))));
  const c = document.getElementById('adminContent'); if(!c) return;
  if(section==='overview'||section==='requests') {
    c.innerHTML = `<div class="stats-grid">
      <div class="stat-card"><div class="stat-card-icon">📋</div><div class="stat-card-num">1,240</div><div class="stat-card-label">Total Requests</div></div>
      <div class="stat-card"><div class="stat-card-icon">⏳</div><div class="stat-card-num">86</div><div class="stat-card-label">Pending Review</div></div>
      <div class="stat-card"><div class="stat-card-icon">✅</div><div class="stat-card-num">1,089</div><div class="stat-card-label">Resolved</div></div>
      <div class="stat-card"><div class="stat-card-icon">🔴</div><div class="stat-card-num">65</div><div class="stat-card-label">Urgent Active</div></div>
    </div>
    <div class="dash-panel">
      <div class="dash-panel-header"><h3>Community Requests (Type · Location · Urgency · Status — No Personal Data)</h3></div>
      <div class="dash-search-row"><div class="search-input-wrap"><span class="search-icon">🔍</span><input type="text" placeholder="Search..." oninput="adminFilter(this.value)"></div>
        <select class="filter-select" onchange="adminFilter(this.value)"><option value="">All Urgency</option><option>high</option><option>medium</option><option>low</option></select></div>
      <div class="table-wrap" id="adminReqTable">
        <table><thead><tr><th>#</th><th>Type</th><th>Location</th><th>Urgency</th><th>People</th><th>Status</th></tr></thead>
        <tbody>${MAP_PINS.filter(p=>p.urgency!=='volunteer').map(p=>`<tr><td>#${p.id}</td><td>${p.type}</td><td>📍 ${p.loc}</td><td><span class="status-badge ${p.urgency==='high'?'urgent':p.urgency==='medium'?'pending':'active'}">${p.urgency}</span></td><td>${p.people}</td><td><span class="status-badge pending">open</span></td></tr>`).join('')}</tbody></table>
      </div>
      <div style="padding:.75rem;font-size:.78rem;color:var(--text3);border-top:1px solid var(--border);margin-top:.5rem">🔒 Admin view: Request type, location, urgency & status only. All personal data is fully protected.</div>
    </div>`;
  } else if(section==='users') {
    c.innerHTML = `<div class="dash-panel"><div class="dash-panel-header"><h3>User Activity (Anonymized)</h3></div>
      <div style="background:rgba(79,70,229,.06);border:1px solid rgba(79,70,229,.18);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1rem;font-size:.875rem">
        🛡️ <strong>Privacy First:</strong> This panel shows only anonymized aggregate metrics. No names, emails, or personal data are accessible.
      </div>
      <table><thead><tr><th>Role</th><th>Registered</th><th>Active (30d)</th><th>Requests</th><th>Tasks Done</th><th>Donations</th></tr></thead><tbody>
        <tr><td>👤 Citizens</td><td>8,400</td><td>3,200</td><td>1,240</td><td>—</td><td>—</td></tr>
        <tr><td>🤝 Volunteers</td><td>3,200</td><td>1,100</td><td>—</td><td>4,800</td><td>—</td></tr>
        <tr><td>🏢 NGOs</td><td>180</td><td>142</td><td>—</td><td>12,000</td><td>—</td></tr>
        <tr><td>💰 Donors</td><td>960</td><td>340</td><td>—</td><td>—</td><td>2,400</td></tr>
        <tr><td>🏛️ Govt</td><td>24</td><td>18</td><td>—</td><td>—</td><td>—</td></tr>
      </tbody></table>
    </div>`;
  } else if(section==='analytics') {
    c.innerHTML = `<div class="stats-grid">
      <div class="stat-card"><div class="stat-card-icon">📈</div><div class="stat-card-num">+18%</div><div class="stat-card-label">MoM Growth</div></div>
      <div class="stat-card"><div class="stat-card-icon">⚡</div><div class="stat-card-num">4.2h</div><div class="stat-card-label">Avg Response</div></div>
      <div class="stat-card"><div class="stat-card-icon">🎯</div><div class="stat-card-num">89%</div><div class="stat-card-label">Resolution Rate</div></div>
      <div class="stat-card"><div class="stat-card-icon">💰</div><div class="stat-card-num">₹24L</div><div class="stat-card-label">Total Funds</div></div>
    </div>
    <div class="dash-panel"><div class="dash-panel-header"><h3>Platform Analytics</h3></div>
      <div class="fund-breakdown">
        <div class="fund-bar"><div class="fund-label">🍛 Food</div><div class="fund-track"><div class="fund-fill" style="width:35%"></div></div><span>35%</span></div>
        <div class="fund-bar"><div class="fund-label">💊 Medical</div><div class="fund-track"><div class="fund-fill green" style="width:25%"></div></div><span>25%</span></div>
        <div class="fund-bar"><div class="fund-label">🏠 Shelter</div><div class="fund-track"><div class="fund-fill yellow" style="width:20%"></div></div><span>20%</span></div>
        <div class="fund-bar"><div class="fund-label">📚 Education</div><div class="fund-track"><div class="fund-fill" style="width:12%;background:var(--primary-light)"></div></div><span>12%</span></div>
      </div>
    </div>`;
  }
}

function adminFilter(q) {
  const rows = document.querySelectorAll('#adminReqTable tbody tr');
  rows.forEach(r => r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none');
}

/* ─────────── LEAFLET MAP ─────────── */
function initMap() {
  populateMapList();
  if(S.mapReady || typeof L === 'undefined') return;
  const el = document.getElementById('leaflet-map'); if(!el) return;
  const map = L.map('leaflet-map').setView([26.2, 81.5], 7);
  S.map = map; S.mapReady = true;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  MAP_PINS.forEach(p => addMapMarker(map, p));
}

function addMapMarker(map, p) {
  const col = { high:'#ef4444', medium:'#f59e0b', low:'#22c55e', volunteer:'#22c55e' }[p.urgency] || '#4f46e5';
  const icon = L.divIcon({
    className:'',
    html:`<div style="background:${col};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.35);cursor:pointer"></div>`,
    iconSize:[16,16], iconAnchor:[8,8]
  });
  L.marker([p.lat,p.lng],{icon}).addTo(map).bindPopup(`
    <div style="font-family:DM Sans,sans-serif;min-width:200px;padding:.25rem">
      <strong style="font-size:.95rem">${p.title}</strong><br>
      <span style="color:#666;font-size:.8rem">${p.type}</span><br>
      <span style="color:#666;font-size:.8rem">📍 ${p.loc}</span><br>
      <p style="font-size:.8rem;color:#444;margin:.4rem 0">${p.desc}</p>
      ${p.urgency!=='volunteer'
        ? `<span style="background:${col}20;color:${col};padding:2px 10px;border-radius:99px;font-size:.72rem;font-weight:700">${p.urgency} urgency</span>
           ${p.people?`<span style="margin-left:.4rem;font-size:.78rem;color:#666">· ${p.people} people</span>`:''}
           <br><button onclick="alert('Volunteer request submitted! You will receive a confirmation shortly.')" style="margin-top:.5rem;padding:.3rem .75rem;background:#4f46e5;color:#fff;border:none;border-radius:99px;font-size:.75rem;cursor:pointer">🤝 Volunteer for This</button>`
        : `<span style="color:#22c55e;font-weight:700">✓ Volunteer Available</span>`
      }
    </div>`);
}

function populateMapList() {
  const el = document.getElementById('mapRequestsList'); if(!el) return;
  el.innerHTML = MAP_PINS.filter(p=>p.urgency!=='volunteer').map(p=>`
    <div class="map-req-item ${p.urgency==='high'?'urgent-req':p.urgency==='medium'?'medium-req':''}" onclick="focusMapPin(${p.id})">
      <div class="map-req-title">${p.type} · ${p.title}</div>
      <div class="map-req-loc">📍 ${p.loc}</div>
      <div style="font-size:.72rem;color:var(--text3);margin-top:.15rem">${p.people} people · ${p.date}</div>
    </div>`).join('');
}

function focusMapPin(id) {
  const p = MAP_PINS.find(x=>x.id===id); if(!p||!S.map) return;
  S.map.setView([p.lat,p.lng],13);
}

function filterMapType(val, el) {
  el.parentElement.querySelectorAll('.map-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  if(!S.map) return;
  populateMapList();
}
function filterMapUrgency(val, el) {
  el.parentElement.querySelectorAll('.map-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
}
function toggleMapFilter(el) {
  el.parentElement.querySelectorAll('.map-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
}

/* ─────────── REQUEST HELP ─────────── */
function selectUrgency(val) {
  S.urgency = val;
  document.querySelectorAll('.urgency-opt').forEach(el => el.classList.toggle('active', el.dataset.value===val));
}

function previewImages(e) {
  const c = document.getElementById('imagePreviewContainer'); if(!c) return;
  c.innerHTML = '';
  Array.from(e.target.files).forEach(f => {
    const r=new FileReader(); r.onload=ev=>{const img=document.createElement('img');img.src=ev.target.result;img.className='preview-img';c.appendChild(img);};
    r.readAsDataURL(f);
  });
}

function detectLocation() {
  showToast('Detecting location...','info');
  setTimeout(()=>{
    const ci=document.getElementById('reqCity'),ad=document.getElementById('reqAddress');
    if(ci)ci.value='Lucknow, UP'; if(ad)ad.value='Hazratganj (GPS auto-detected)';
    showToast('Location detected! ✅','success');
  },1000);
}

let recTimer;
function toggleRecording() {
  const btn=document.getElementById('voiceBtn'),st=document.getElementById('voiceStatus'),wv=document.getElementById('voiceWave');
  S.recording=!S.recording;
  btn.classList.toggle('recording',S.recording);
  btn.textContent = S.recording ? '⏹ Stop Recording' : '🎤 Record Voice Note';
  st.textContent  = S.recording ? '● Recording...' : 'Not recording';
  wv.innerHTML    = S.recording ? Array.from({length:8},(_,i)=>`<span style="animation-delay:${i*.1}s"></span>`).join('') : '';
  if(!S.recording) showToast('Voice note saved! 🎤','success');
}

function submitRequest() {
  const type    = document.getElementById('reqType').value;
  const desc    = document.getElementById('reqDesc').value.trim();
  const city    = document.getElementById('reqCity').value.trim();
  const addr    = document.getElementById('reqAddress').value.trim();
  const people  = document.getElementById('reqPeople').value || '1';

  if(!type||!desc||!city){ showToast('Please fill Type, Description & City.','error'); return; }

  if(!S.user){ showToast('Please login first to submit a request.','warn'); showPage('login'); return; }

  const reqs = getUserRequests();
  const newReq = {
    id: Date.now(), type, desc, location: addr?`${city} — ${addr}`:city,
    urgency: S.urgency, status:'pending', people: parseInt(people)||1,
    date: new Date().toLocaleDateString('en-IN'),
  };
  reqs.unshift(newReq); saveUserRequests(reqs);
  addHistory({ type, desc: desc.slice(0,60)+'…', status:'pending' });

  // Clear form
  ['reqType','reqDesc','reqCity','reqAddress','reqPeople'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('imagePreviewContainer').innerHTML='';
  selectUrgency('high');

  showModal('🎉 Request Submitted!',`
    <p style="color:var(--text2);margin:.75rem 0">Your <strong>${type}</strong> request in <strong>${city}</strong> has been submitted and is now visible to nearby volunteers and NGOs.</p>
    <div style="background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:var(--radius-sm);padding:.75rem;margin:.75rem 0;font-size:.85rem">
      <strong>⏱ Estimated Response:</strong> 2–4 hours<br>
      <strong>📋 Request ID:</strong> SAH-${String(newReq.id).slice(-8)}<br>
      <strong>👥 People affected:</strong> ${people}
    </div>
    <div style="display:flex;gap:.75rem;margin-top:1rem">
      <button class="btn-primary" onclick="closeModal();showPage('dashboard')">Go to Dashboard</button>
      <button class="btn-ghost"   onclick="closeModal()">Submit Another</button>
    </div>`);
  showToast('Help request submitted successfully!','success');
}

/* ─────────── DONATE ─────────── */
function setAmount(val, btn) {
  const el = document.getElementById('donationAmount'); if(el) el.value=val;
  document.querySelectorAll('.amount-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}
function selectPayment(el) {
  document.querySelectorAll('.payment-opt').forEach(o=>o.classList.remove('active'));
  el.classList.add('active');
}
function processDonation() {
  const amount = parseInt(document.getElementById('donationAmount').value)||0;
  const cat    = document.getElementById('donationCategory').value;
  if(amount<10){ showToast('Enter a valid amount (min ₹10).','error'); return; }
  if(!S.user){ showToast('Please login to donate.','warn'); showPage('login'); return; }
  const txn = 'SAH-'+String(Date.now()).slice(-8);
  const entry = { amount, category:cat, date:new Date().toLocaleDateString('en-IN'), txn };
  addDonation(entry);
  addHistory({ type:'Donation', desc:`₹${amount} to ${cat}`, status:'resolved' });
  const el = document.getElementById('totalDonated');
  if(el) el.textContent = `₹${amount.toLocaleString('en-IN')}`;
  showModal('💚 Thank You for Your Donation!',`
    <p style="color:var(--text2);margin:.75rem 0">Your donation of <strong>₹${amount.toLocaleString('en-IN')}</strong> to <strong>${cat}</strong> has been received.</p>
    <div style="background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:var(--radius-sm);padding:.75rem;font-size:.85rem;margin:.75rem 0">
      <strong>📋 Txn ID:</strong> ${txn}<br>
      <strong>🧾 80G Receipt:</strong> Will be emailed within 24 hours<br>
      <strong>❤️ Impact:</strong> ~${Math.round(amount/150)} lives positively affected
    </div>
    <div style="display:flex;gap:.75rem;margin-top:1rem">
      <button class="btn-primary" onclick="closeModal();showDashSection('impacttrack')">View Impact</button>
      <button class="btn-ghost"   onclick="closeModal()">Donate Again</button>
    </div>`);
  showToast(`₹${amount.toLocaleString('en-IN')} donated! Thank you 💚`,'success');
}

/* ─────────── NOTIFICATIONS ─────────── */
function buildNotifPanel() {
  const el = document.getElementById('notifList'); if(!el) return;
  const userReqs = getUserRequests().filter(r=>r.status==='pending');
  const dynamic  = userReqs.map(r=>({icon:'⏳',title:'Request Pending',text:`${r.type} — ${r.location}`,time:r.date}));
  const all = [...dynamic, ...NOTIFS_BASE];
  document.getElementById('notifBadge').textContent = all.length;
  el.innerHTML = all.map(n=>`<div class="notif-item"><div class="notif-item-title">${n.icon} ${n.title}</div><div class="notif-item-text">${n.text}</div><div class="notif-item-time">${n.time}</div></div>`).join('');
}
function toggleNotifications() {
  document.getElementById('notifPanel').classList.toggle('open');
}

/* ─────────── CONTACT ─────────── */
function sendMessage() {
  const n=document.getElementById('cName').value.trim(),e=document.getElementById('cEmail').value.trim(),m=document.getElementById('cMessage').value.trim();
  if(!n||!e||!m){ showToast('Please fill all fields.','error'); return; }
  showToast(`Message sent! We'll reply to ${e} within 24 hours. ✅`,'success');
  ['cName','cEmail','cMessage'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
}

/* ─────────── CHATBOT ─────────── */
const BOT = {
  'who are you':   "I'm Sahayak Bot 🤖 — your AI assistant on Sahayak AI. I help citizens find volunteers, donors track impact, and NGOs coordinate resources!",
  'how can i help':"You can help by:\n1️⃣ Registering as a Volunteer\n2️⃣ Making a Donation\n3️⃣ Sharing with NGOs near you\n4️⃣ Reporting community needs on the platform",
  'show requests': "Current open requests:\n🔴 Food Emergency — Prayagraj (24 people)\n🔴 Medical Aid — Varanasi (3 elderly)\n🟡 Shelter Needed — Lucknow\n🔴 Rescue Needed — Prayagraj\nClick 'Live Map' to explore all!",
  'how to donate': "Click 'Donate' in the sidebar (after login) or in the top nav. Choose amount (₹10 min), category & UPI/Card. All donations are 80G tax deductible! 💚",
  'logout':        "To logout:\n• Click the ⏏ icon next to your name in the sidebar\n• Or click '⏏ Logout' in the top navbar (shown when logged in)",
  'register':      "Click 'Register' in the top navbar to create your account. Choose your role (Citizen, Volunteer, Donor, NGO, Govt) and you're all set!",
  'default':       "I can help with:\n• Navigation & features\n• How to register or login\n• How to submit help requests\n• How to donate\n• Finding volunteers on the map\nWhat do you need help with?",
};
function toggleChatbot() {
  S.chatOpen=!S.chatOpen;
  document.getElementById('chatbotPanel').classList.toggle('open',S.chatOpen);
  document.querySelector('.chatbot-toggle-label').textContent=S.chatOpen?'Close':'Help';
}
function sendQuickReply(t){ document.getElementById('chatInput').value=t; sendChat(); }
function sendChat() {
  const inp=document.getElementById('chatInput'),text=inp.value.trim(); if(!text)return;
  inp.value=''; addChatMsg('user',text);
  const tid='t'+Date.now(), msgs=document.getElementById('chatMessages');
  const d=document.createElement('div'); d.className='chat-msg bot'; d.id=tid;
  d.innerHTML='<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
  setTimeout(()=>{
    document.getElementById(tid)?.remove();
    const k=text.toLowerCase().replace(/[?!,]/g,'');
    const match=Object.keys(BOT).find(key=>k.includes(key));
    addChatMsg('bot', BOT[match||'default']);
  }, 900+Math.random()*500);
}
function addChatMsg(role,text) {
  const msgs=document.getElementById('chatMessages');
  const d=document.createElement('div'); d.className=`chat-msg ${role}`;
  d.innerHTML=`<div class="chat-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
}

/* ─────────── TOAST ─────────── */
function showToast(msg,type='info') {
  const icons={success:'✅',error:'❌',warn:'⚠️',info:'ℹ️'};
  const t=document.createElement('div'); t.className=`toast ${type}`;
  t.innerHTML=`<span>${icons[type]}</span> <span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(()=>t.remove(),3400);
}

/* ─────────── MODAL ─────────── */
function showModal(title,body) {
  document.getElementById('modalContent').innerHTML=`<h2 style="font-family:var(--font-head);font-size:1.25rem;color:var(--text);margin-bottom:.5rem">${title}</h2>${body}`;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(){ document.getElementById('modalOverlay').classList.remove('open'); }

/* ─────────── UPLOAD DRAG & DROP ─────────── */
document.addEventListener('DOMContentLoaded',()=>{
  const ua=document.getElementById('uploadArea'); if(!ua)return;
  ua.addEventListener('dragover',e=>{e.preventDefault();ua.style.borderColor='var(--primary)';});
  ua.addEventListener('dragleave',()=>{ua.style.borderColor='var(--border)';});
  ua.addEventListener('drop',e=>{e.preventDefault();ua.style.borderColor='var(--border)';if(e.dataTransfer.files.length)previewImages({target:{files:e.dataTransfer.files}});});
});
