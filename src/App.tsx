import QRCode from 'qrcode'
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Activity, AlertCircle, ArrowDownLeft, ArrowRight, ArrowUpRight, BadgeCheck, Banknote, BarChart3, Bell, Building, Camera, Check, CheckCircle2, ChevronDown, Coins, Copy, CreditCard, Download, Eye, EyeOff, FileText, Fingerprint, Globe2, GraduationCap, Hash, HelpCircle, History, KeyRound, Landmark, LayoutDashboard, LockKeyhole, LogOut, Mail, MapPin, Menu, Moon, Phone, PieChart, Plus, Printer, QrCode, RefreshCw, ScanLine, Search, Send, Settings, Shield, ShieldCheck, Store, Sun, TrendingUp, Upload, UserRound, Users, WalletCards, X, Zap } from 'lucide-react'
import { createPortal } from 'react-dom'
import { api, apiBlob, ApiError } from './lib/api'
import './index.css'

type Role='Student'|'Merchant'|'Admin'|'SchoolAdmin'
type User={firstname:string;lastname:string;email:string;walletNumber:string;schoolCode:string;role:Role;profilePicture?:string;matricNumber?:string;businessName?:string;shopLocation?:string;schoolName?:string;accountNumber?:string;bankName?:string}
type Note={text:string;bad?:boolean}
const tx=[{name:'Green Bowl Café',desc:'Lunch order',ref:'CP-8K31M2',date:'Today, 12:42 PM',amount:-2450},{name:'Wallet top up',desc:'Paystack deposit',ref:'CP-4H77Q9',date:'Yesterday, 9:08 AM',amount:20000},{name:'Campus Print Hub',desc:'Design materials',ref:'CP-2P18J4',date:'May 18, 4:31 PM',amount:-5200},{name:'The Study Café',desc:'Coffee & pastry',ref:'CP-7B62L1',date:'May 17, 10:15 AM',amount:-1800}]
const schools0=[['University of Lagos','UNILAG','12,480'],['University of Ibadan','UI','8,934'],['Covenant University','CU','6,721']]
const merchant0=[['MER-1072','Campus Print Hub','Tobi Martins','New Hall Complex'],['MER-1091','Green Bowl Café','Amara Okeke','Faculty of Arts'],['MER-1104','QuickFix Gadgets','Seyi Cole','Tech Road']]
const toTransactionEndpoint=(kind:string)=>{switch(kind){case 'deposit':return 'Deposit';case 'withdraw':return 'Withdrawal';case 'transfer':return 'Transfer';default:return kind}}

export default function App(){const[splash,setSplash]=useState(()=>!sessionStorage.getItem('cp-seen'));const[user,setUser]=useState<User|null>(null);const[authReady,setAuthReady]=useState(false);const[note,setNote]=useState<Note|null>(null);useEffect(()=>{if(!splash)return;const timer=setTimeout(()=>{setSplash(false);sessionStorage.setItem('cp-seen','1')},1500);return()=>clearTimeout(timer)},[splash]);useEffect(()=>{let cancelled=false;const restore=async()=>{const token=sessionStorage.getItem('cp-token');if(!token){if(!cancelled){setUser(null);setAuthReady(true)}}else{try{const studentProfile=await api<{firstname:string;lastname:string;email:string;walletNumber:string;schoolCode:string;matricNumber?:string}>('/Student/profile',{method:'GET'}).catch(()=>null);const merchantProfile=studentProfile?null:await api<{firstname:string;lastname:string;email:string;walletNumber:string;schoolCode:string;businessName?:string;shopLocation?:string;isApproved?:boolean}>('/Merchant/merchant/profile',{method:'GET'}).catch(()=>null);if(cancelled)return;const profile=studentProfile||merchantProfile;if(!profile){sessionStorage.removeItem('cp-token');sessionStorage.removeItem('cp-user');setUser(null);}else{const resolvedRole:Role=studentProfile?.matricNumber!==undefined?'Student':'Merchant';const savedAvatar = localStorage.getItem('cp-avatar-' + profile.walletNumber) || (profile as any).profilePicture;
const nextUser: User = {
  firstname: profile.firstname,
  lastname: profile.lastname,
  email: profile.email,
  walletNumber: profile.walletNumber,
  schoolCode: profile.schoolCode,
  role: resolvedRole,
  profilePicture: savedAvatar,
  matricNumber: (profile as any).matricNumber,
  businessName: (profile as any).businessName,
  shopLocation: (profile as any).shopLocation,
  schoolName: (profile as any).schoolName,
  accountNumber: (profile as any).accountNumber,
  bankName: (profile as any).bankName
};setUser(nextUser);sessionStorage.setItem('cp-user',JSON.stringify(nextUser));}}catch{if(!cancelled){sessionStorage.removeItem('cp-token');sessionStorage.removeItem('cp-user');setUser(null)}}finally{if(!cancelled){setAuthReady(true)}}}};void restore();return()=>{cancelled=true};},[]);const notify=(text:string,bad=false)=>{setNote({text,bad});setTimeout(()=>setNote(null),3500)};const save=(u:User|null)=>{setUser(u);if(u){sessionStorage.setItem('cp-user',JSON.stringify(u))}else{sessionStorage.removeItem('cp-user');sessionStorage.removeItem('cp-token')}};if(splash||!authReady)return <Splash/>;return <BrowserRouter>{note&&<div className={'toast '+(note.bad?'bad':'')}><BadgeCheck/>{note.text}</div>}<Routes><Route path="/" element={<Landing/>}/><Route path="/privacy" element={<Legal type="privacy"/>}/><Route path="/terms" element={<Legal type="terms"/>}/><Route path="/cookies" element={<Legal type="cookies"/>}/><Route path="/login" element={<Login save={save} notify={notify}/>}/><Route path="/staff-login" element={<StaffLogin save={save} notify={notify}/>}/><Route path="/register/:kind" element={<Register notify={notify}/>}/><Route path="/forgot" element={<Forgot notify={notify}/>}/><Route path="/reset-password" element={<ResetPassword notify={notify}/>}/><Route path="/app/*" element={user?<Shell user={user} save={save} notify={notify}/>:<Navigate to="/login"/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></BrowserRouter>}
function BrandIcon(){return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 14.5A6.5 6.5 0 0 1 14.5 8H34a6 6 0 0 1 6 6v4H17a5 5 0 0 0 0 10h23v6a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill="currentColor" opacity=".3"/><path d="M8 15h28a6 6 0 0 1 6 6v9a6 6 0 0 1-6 6H8V15Z" fill="currentColor"/><path d="M27 23v-2a5 5 0 0 1 10 0v2m-10 0h10v9H27z" fill="#143b35"/><circle cx="32" cy="27" r="1.5" fill="#dfffbb"/></svg>}
function Logo(){return <><div className="logo"><i><BrandIcon/></i>CampusPay</div>{location.pathname==='/'&&<CampusPortal/>}</>}
function CampusPortal(){const[target,setTarget]=useState<HTMLElement|null>(null);useEffect(()=>{const landing=document.querySelector('.landing');if(!landing)return;let host=document.getElementById('campus-security-root');if(!host){host=document.createElement('div');host.id='campus-security-root';const footer=landing.querySelector('.landing-footer');landing.insertBefore(host,footer)}if(host.dataset.claimed)return;host.dataset.claimed='true';setTarget(host);return()=>{delete host.dataset.claimed}},[]);return target?createPortal(<CampusInfo/>,target):null}
function CampusInfo(){const[open,setOpen]=useState(0);const faqs=[['How does CampusPay work for a university?','CampusPay gives each verified student and approved merchant a secure account connected to their school. Administrators can manage access, approve merchants, and oversee platform activity from one role-based workspace.'],['How are students and merchants verified?','Students register with their school code and matriculation details. Merchant accounts are reviewed and approved by an authorized school administrator before they can accept payments.'],['Is CampusPay secure?','Yes. Secure sessions, transaction PINs, account controls, role-based permissions, and monitored payment activity protect every interaction on the platform.'],['Can schools manage multiple campuses?','The administration tools are structured around school codes and permissions, making it possible to organize users and merchants across approved campus communities.'],['What support is available during onboarding?','Our team supports school setup, administrator access, merchant onboarding, and launch communication so each campus can adopt the platform confidently.']];return <><section className="campus-info" id="campuses"><div className="campus-info-head"><span>BUILT FOR UNIVERSITIES</span><h2>A better payment experience<br/>for the whole campus.</h2><p>Bring students, businesses, and administrators together with secure infrastructure designed specifically for university communities.</p></div><div className="campus-info-grid"><article><i><GraduationCap/></i><div><small>FOR STUDENTS</small><h3>Simple from day one</h3><p>Register with school details, fund an account, and pay across campus without relying on cash.</p></div></article><article><i><Store/></i><div><small>FOR MERCHANTS</small><h3>Built for campus business</h3><p>Accept verified payments, review transaction records, and withdraw earnings directly to a bank account.</p></div></article><article><i><ShieldCheck/></i><div><small>FOR ADMINISTRATORS</small><h3>Clarity and control</h3><p>Approve merchants, manage school access, and keep every role organized from one dashboard.</p></div></article></div><div className="campus-proof">
  <div><b><Counter end={14} /></b><span>Partner institutions</span></div>
  <div><b><Counter end={12000} suffix="+" /></b><span>Active students</span></div>
  <div><b><Counter end={1200} suffix="+" /></b><span>Campus businesses</span></div>
  <div><b><Counter end={99.9} decimals={1} suffix="%" /></b><span>Platform availability</span></div>
</div></section><section className="faq-section" id="security"><div className="faq-intro"><span>FREQUENTLY ASKED QUESTIONS</span><h2>Everything you need<br/>to know.</h2><p>Clear answers for students, campus businesses, and university teams considering CampusPay.</p><div className="faq-support"><i><HelpCircle/></i><div><b>Still have a question?</b><small>Our campus support team is ready to help.</small></div><a href="mailto:support@campuspay.ng">Contact support <ArrowRight/></a></div></div><div className="faq-list">{faqs.map(([question,answer],i)=><article className={open===i?'open':''} key={question}><button onClick={()=>setOpen(open===i?-1:i)} aria-expanded={open===i}><span>{String(i+1).padStart(2,'0')}</span><b>{question}</b><Plus/></button><div><p>{answer}</p></div></article>)}</div></section></>}
function Splash(){return <main className="splash-screen"><div className="splash-glow"/><div className="splash-brand"><i><BrandIcon/></i><h1>CampusPay</h1><p>Secure payments for campus life.</p><div className="splash-loader"><span/></div></div><small>FAST · SIMPLE · SECURE</small></main>}

function Counter({ end, duration = 1600, prefix = '', suffix = '', decimals = 0 }: { end: number; duration?: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let animId: number;
    const start = performance.now();

    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(ease * end);

      if (progress < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        setVal(end);
      }
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [started, end, duration]);

  const displayStr = decimals > 0
    ? val.toFixed(decimals)
    : Math.floor(val).toLocaleString();

  return (
    <span ref={ref} className="counter-val">
      {prefix}{displayStr}{suffix}
    </span>
  );
}

function Landing(){
  const n=useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'merchants'>('all');
  return (
    <main className="landing">
      <nav>
        <Logo/>
        <div>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#campuses">For Campuses</a>
          <a href="#security">Security</a>
        </div>
        <span>
          <button onClick={()=>n('/login')} className="landing-nav-signin">Sign in</button>
          <button className="dark" onClick={()=>n('/register/student')}>Get Started <ArrowRight/></button>
        </span>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <small><i/> THE CAMPUS FINANCIAL NETWORK</small>
          <h1>Money moves<br/><em>faster</em> on campus.</h1>
          <p>
            The dedicated digital wallet built for university ecosystems. Instantly pay cafeteria vendors, split hostel costs, settle course fees, and withdraw directly to any Nigerian bank.
          </p>
          <div className="hero-cta-group">
            <button className="dark big" onClick={()=>n('/register/student')}>
              Open Student Wallet <ArrowRight/>
            </button>
            <button className="outline big" onClick={()=>n('/register/merchant')}>
              <Store style={{ width: 17, height: 17 }} /> Register as Vendor
            </button>
          </div>
          <div className="hero-trust-bar">
            <div className="trust-item">
              <ShieldCheck style={{ width: 16, height: 16, color: '#179668' }} />
              <span>CBN-Grade Security</span>
            </div>
            <div className="trust-item">
              <Zap style={{ width: 16, height: 16, color: '#179668' }} />
              <span>Instant NIP Settlement</span>
            </div>
            <div className="trust-item">
              <GraduationCap style={{ width: 16, height: 16, color: '#179668' }} />
              <span>Matric Verified</span>
            </div>
          </div>
          <footer>
            <b><Counter end={14} suffix="+" /> Institutions</b> &bull; <b><Counter end={12000} suffix="+" /> Students</b> transacting safely every semester
          </footer>
        </div>

        <div className="phone-wrap">
          <div className="float received">
            <ArrowDownLeft/>
            <span><small>Direct transfer received</small><b>₦15,000.00</b></span>
            <BadgeCheck/>
          </div>
          <div className="phone">
            <header>
              <span><small>Good afternoon,</small><b>Amara Okonkwo 👋</b></span>
              <Bell/>
            </header>
            <div className="balance">
              <small>AVAILABLE BALANCE <Eye/></small>
              <h3>₦124,850<span>.00</span></h3>
              <p>CP-UNILAG-2048 <Copy/></p>
            </div>
            <div className="quick">
              <span><i><Plus/></i>Add money</span>
              <span><i><Send/></i>Transfer</span>
              <span><i><ScanLine/></i>Scan & pay</span>
            </div>
            <b>Recent Campus Activity</b>
            {tx.slice(0,3).map(t=><div className="mini" key={t.ref}><i>{t.amount>0?<ArrowDownLeft/>:<ArrowUpRight/>}</i><span><b>{t.name}</b><small>{t.date}</small></span><b className={t.amount>0?'green':''}>{t.amount>0?'+':''}₦{Math.abs(t.amount).toLocaleString()}</b></div>)}
          </div>
          <div className="float qrfloat">
            <QrCode/>
            <span><small>Scan to pay cafeteria</small><b>Instant &bull; 0% Fee</b></span>
          </div>
        </div>
      </section>

      {/* Institutional Network Strip */}
      <section className="campus-strip" id="campuses">
        <p>TRUSTED ACROSS LEADING TERTIARY INSTITUTIONS</p>
        <div className="campus-tags-slider">
          {['UNILAG • University of Lagos', 'UI • University of Ibadan', 'CU • Covenant University', 'OAU • Obafemi Awolowo Univ.', 'UNN • University of Nigeria', 'FUTA • Federal Univ. of Tech'].map(c => (
            <span key={c} className="campus-pill">{c}</span>
          ))}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="feature" id="features">
        <div className="feature-section-header">
          <small>CORE CAPABILITIES</small>
          <h2>Engineered specifically for how universities work.</h2>
          <p>Everything students, vendors, and bursary staff need without bank branch queues.</p>
        </div>
        <div className="feature-grid-cards">
          {[
            {
              num: '01',
              title: 'Instant Peer & Vendor Transfers',
              desc: 'Send money instantly using just a wallet ID or QR code. Zero transaction delays inside campus gates.',
              icon: Zap,
              cls: 'c0'
            },
            {
              num: '02',
              title: 'Student ID & Matric Integration',
              desc: 'Every wallet is verified against your university matric number, keeping fraudulent accounts out.',
              icon: GraduationCap,
              cls: 'c1'
            },
            {
              num: '03',
              title: 'Offline-Ready Merchant QR',
              desc: 'Bookshops, food kiosks, and printing hubs can receive instant payments even during poor campus cell service.',
              icon: Store,
              cls: 'c2'
            },
            {
              num: '04',
              title: 'Daily Auto-Settlement to Bank',
              desc: 'Campus businesses can automatically sweep their daily revenue into any commercial bank account in Nigeria.',
              icon: Landmark,
              cls: 'c3'
            }
          ].map((x) => (
            <article className={x.cls} key={x.num}>
              <div className="card-top-tag">
                <small>{x.num}</small>
                <x.icon style={{ width: 22, height: 22 }} />
              </div>
              <h2>{x.title}</h2>
              <p>{x.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works workflow */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="how-intro">
          <small>THREE SIMPLE STEPS</small>
          <h2>Start transacting in under 2 minutes.</h2>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <span className="step-num">1</span>
            <h3>Select Your University</h3>
            <p>Choose your campus and enter your student matric or staff credentials for instant verification.</p>
          </div>
          <div className="step-card">
            <span className="step-num">2</span>
            <h3>Fund Your Wallet</h3>
            <p>Top up securely via Paystack, bank transfer, or debit card in seconds with zero hidden charges.</p>
          </div>
          <div className="step-card">
            <span className="step-num">3</span>
            <h3>Scan & Pay Anywhere</h3>
            <p>Pay campus dining, printing, departmental dues, or send funds to fellow students seamlessly.</p>
          </div>
        </div>
      </section>

      {/* Role-based tabs showcase */}
      <section className="roles-showcase-section">
        <div className="roles-header">
          <small>BUILT FOR EVERY STAKEHOLDER</small>
          <h2>Tailored workspaces for students, vendors, and bursaries.</h2>
          <div className="role-switch-pills">
            <button className={activeTab==='all'?'active':''} onClick={()=>setActiveTab('all')}>Full Campus View</button>
            <button className={activeTab==='students'?'active':''} onClick={()=>setActiveTab('students')}>Students</button>
            <button className={activeTab==='merchants'?'active':''} onClick={()=>setActiveTab('merchants')}>Merchants</button>
          </div>
        </div>
        <div className="roles-grid">
          {(activeTab==='all' || activeTab==='students') && (
            <div className="role-box student-box">
              <div className="role-box-icon"><GraduationCap/></div>
              <small>FOR STUDENTS</small>
              <h3>Fast, Cashless Campus Life</h3>
              <p>Forget cash changes and network failures at the cafeteria. Pay with a single scan and keep tracked statements.</p>
              <ul>
                <li><Check style={{ width: 14, height: 14, color: '#10b981' }} /> Split project & hostel bills with friends</li>
                <li><Check style={{ width: 14, height: 14, color: '#10b981' }} /> Real-time instant transaction receipts</li>
                <li><Check style={{ width: 14, height: 14, color: '#10b981' }} /> Lock wallet immediately if device is misplaced</li>
              </ul>
              <button className="primary" onClick={()=>n('/register/student')}>Open Student Account →</button>
            </div>
          )}
          {(activeTab==='all' || activeTab==='merchants') && (
            <div className="role-box merchant-box">
              <div className="role-box-icon"><Store/></div>
              <small>FOR MERCHANTS & VENDORS</small>
              <h3>Automated Sales & Settlement</h3>
              <p>Accept verified student transfers with terminal security, display printed QR codes, and withdraw to bank anytime.</p>
              <ul>
                <li><Check style={{ width: 14, height: 14, color: '#10b981' }} /> Eliminates fake payment alert scams</li>
                <li><Check style={{ width: 14, height: 14, color: '#10b981' }} /> Instant payment audio/visual notification</li>
                <li><Check style={{ width: 14, height: 14, color: '#10b981' }} /> Direct settlements into GTB, Access, Zenith & more</li>
              </ul>
              <button className="dark" onClick={()=>n('/register/merchant')}>Register Merchant Account →</button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to experience a smarter campus?</h2>
          <p>Join thousands of students and approved businesses transacting securely with CampusPay today.</p>
          <div className="cta-buttons">
            <button className="cta-light-btn" onClick={()=>n('/register/student')}>
              Create Free Account <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <button className="cta-ghost-btn" onClick={()=>n('/login')}>
              Sign In to Wallet
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <Logo/>
          <p>Secure, transparent digital payments made for university communities across Nigeria.</p>
        </div>
        <div>
          <b>Product</b>
          <a href="#features">Features</a>
          <button onClick={()=>n('/register/student')}>Student account</button>
          <button onClick={()=>n('/register/merchant')}>Merchant account</button>
          <button onClick={()=>n('/staff-login')}>Institutional portal</button>
        </div>
        <div>
          <b>Support & Contact</b>
          <a href="mailto:support@campuspay.ng">support@campuspay.ng</a>
          <button onClick={()=>n('/login')}>Wallet sign in</button>
          <a href="#campuses">Partner schools</a>
        </div>
        <div>
          <b>Legal & Compliance</b>
          <button onClick={()=>n('/privacy')}>Privacy policy</button>
          <button onClick={()=>n('/terms')}>Terms of service</button>
          <button onClick={()=>n('/cookies')}>Cookie policy</button>
        </div>
        <small>&copy; {new Date().getFullYear()} CampusPay Financial Technologies. All rights reserved.</small>
      </footer>
    </main>
  );
}
function Legal({type}:{type:'privacy'|'terms'|'cookies'}){const n=useNavigate();const data={privacy:['Privacy Policy','We respect your privacy and protect the personal information needed to provide CampusPay services.','We collect account, school, profile, and transaction information to operate the platform, prevent fraud, provide support, and meet legal obligations. We do not sell your personal information. You may contact support to request access, correction, or deletion where applicable.'],terms:['Terms of Service','These terms govern your use of CampusPay.','You agree to provide accurate account details, protect your password and PIN, and use CampusPay only for lawful campus payments. Transactions may be subject to verification, limits, and partner processing requirements. Contact support if you believe your account has been used without permission.'],cookies:['Cookie Policy','CampusPay uses essential cookies to keep your account secure.','Authentication cookies maintain your signed-in session and help protect the platform from unauthorized access. We may also use limited preference and performance cookies to improve reliability. Essential cookies cannot be disabled while using authenticated services.']}[type];return <main className="legal-page"><nav><button onClick={()=>n('/')}><ArrowRight/> Back to CampusPay</button><Logo/></nav><article><span>LEGAL</span><h1>{data[0]}</h1><p className="lead">{data[1]}</p><h2>Our approach</h2><p>{data[2]}</p><h2>Questions</h2><p>For questions about this policy, email <a href="mailto:support@campuspay.ng">support@campuspay.ng</a>.</p><small>Last updated: May 2025</small></article></main>}
function Auth({children,title,copy}:{children:ReactNode;title:string;copy:string}){const n=useNavigate();return <main className="auth"><aside><button onClick={()=>n('/')} className="back">← Back home</button><Logo/><div><div className="coin">₦</div><h2>Your campus.<br/>Your money.<br/><em>Your way.</em></h2><p>One secure wallet for every payment, every day.</p></div><small>Secure • Fast • Campus-wide</small></aside><section><div className="authbox"><h1>{title}</h1><p>{copy}</p>{children}</div></section></main>}
function Login({save,notify}:{save:(u:User|null)=>void;notify:(s:string,bad?:boolean)=>void}){
  const [role,setRole]=useState<'Student'|'Merchant'>('Student');
  const [busy,setBusy]=useState(false);
  const n=useNavigate();

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setBusy(true);
    const d=new FormData(e.currentTarget);
    const walletNumber=String(d.get('walletNumber')||'').trim();
    const password=String(d.get('password')||'');
    try{
      const loginResponse=await api<{token:string;firstname:string;lastname:string;email:string;walletNumber:string;schoolCode:string;userId:string;profilePicture?:string}>('/Account/login',{method:'POST',body:JSON.stringify({walletNumber,password})});
      sessionStorage.setItem('cp-token',loginResponse.token);
      
      // Strict role verification based on selected tab
      if (role === 'Student') {
        const studentProfile = await api<{firstname:string;lastname:string;email:string;walletNumber:string;schoolCode:string;schoolName?:string;matricNumber?:string}>('/Student/profile',{method:'GET'}).catch(()=>null);
        if (!studentProfile) {
          throw new Error('Access denied. This wallet account does not have student access.');
        }
        const savedAvatar = localStorage.getItem('cp-avatar-' + (studentProfile.walletNumber || loginResponse.walletNumber)) || (studentProfile as any).profilePicture || loginResponse.profilePicture;
        save({
          firstname: studentProfile.firstname || loginResponse.firstname || '',
          lastname: studentProfile.lastname || loginResponse.lastname || '',
          email: studentProfile.email || loginResponse.email || '',
          walletNumber: studentProfile.walletNumber || loginResponse.walletNumber || '',
          schoolCode: studentProfile.schoolCode || loginResponse.schoolCode || '',
          role: 'Student',
          profilePicture: savedAvatar,
          matricNumber: studentProfile.matricNumber,
          schoolName: (studentProfile as any).schoolName,
        });
      } else {
        const merchantProfile = await api<{firstname:string;lastname:string;email:string;walletNumber:string;schoolCode:string;schoolName?:string;businessName?:string;shopLocation?:string;isApproved?:boolean;accountNumber?:string;bankName?:string}>('/Merchant/merchant/profile',{method:'GET'}).catch(()=>null);
        if (!merchantProfile) {
          throw new Error('Access denied. This wallet account does not have merchant access.');
        }
        const savedAvatar = localStorage.getItem('cp-avatar-' + (merchantProfile.walletNumber || loginResponse.walletNumber)) || (merchantProfile as any).profilePicture || loginResponse.profilePicture;
        save({
          firstname: merchantProfile.firstname || loginResponse.firstname || '',
          lastname: merchantProfile.lastname || loginResponse.lastname || '',
          email: merchantProfile.email || loginResponse.email || '',
          walletNumber: merchantProfile.walletNumber || loginResponse.walletNumber || '',
          schoolCode: merchantProfile.schoolCode || loginResponse.schoolCode || '',
          role: 'Merchant',
          profilePicture: savedAvatar,
          businessName: merchantProfile.businessName,
          shopLocation: merchantProfile.shopLocation,
          schoolName: merchantProfile.schoolName,
          accountNumber: merchantProfile.accountNumber,
          bankName: merchantProfile.bankName
        });
      }
      notify(`Signed in successfully as ${role}`);
      n('/app');
    }catch(err){
      sessionStorage.removeItem('cp-token');
      const message=err instanceof Error?err.message:err instanceof ApiError?err.message:'Unable to sign in. Please check your credentials and try again.';
      notify(message, true);
    }finally{
      setBusy(false);
    }
  };

  return (
    <Auth title="Welcome back" copy="Choose your account type and sign in securely to CampusPay.">
      <div className="login-role-grid">
        <button type="button" className={role==='Student'?'selected':''} onClick={()=>setRole('Student')}>
          <i><GraduationCap/></i>
          <span><b>Student</b><small>Pay, transfer and manage campus funds</small></span>
          <Check/>
        </button>
        <button type="button" className={role==='Merchant'?'selected':''} onClick={()=>setRole('Merchant')}>
          <i><Store/></i>
          <span><b>Merchant</b><small>Accept student payments and withdraw</small></span>
          <Check/>
        </button>
      </div>
      <form onSubmit={submit} className="form">
        <Field name="walletNumber" label="Wallet number" icon={WalletCards} placeholder="Enter your wallet number (e.g. WAL-10294)" />
        <Field name="password" label="Password" type="password" icon={LockKeyhole} placeholder="Enter your password" />
        <div className="meta">
          <label><input type="checkbox"/> Remember me</label>
          <button type="button" onClick={()=>n('/forgot')}>Forgot password?</button>
        </div>
        <button className="primary auth-submit" disabled={busy}>
          {busy ? <><i className="spinner light"/>Signing you in…</> : <>Sign in as {role} <ArrowRight/></>}
        </button>
      </form>
      <p className="switch">New to CampusPay? <button type="button" onClick={()=>n(`/register/${role.toLowerCase()}`)}>Create an account</button></p>
      <p className="staff-entry">School staff? <button type="button" onClick={()=>n('/staff-login')}>Go to administration sign in</button></p>
    </Auth>
  );
}

function StaffLogin({save,notify}:{save:(u:User)=>void;notify:(s:string)=>void}){
  const [role,setRole]=useState<'Admin'|'SchoolAdmin'>('SchoolAdmin');
  const [busy,setBusy]=useState(false);
  const n=useNavigate();

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setBusy(true);
    const d=new FormData(e.currentTarget);
    try{
      await api(`/${role}/login`,{method:'POST',body:JSON.stringify({Email:d.get('Email'),Password:d.get('Password')})});
      // fetch profile after successful login
      const profile = await api<any>(`/${role}/profile`,{method:'GET'});
      const user:User = {
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        walletNumber: profile.walletNumber,
        schoolCode: profile.schoolCode,
        role: role,
        profilePicture: profile.profilePicture,
        matricNumber: profile.matricNumber,
        businessName: profile.businessName,
        shopLocation: profile.shopLocation,
        schoolName: profile.schoolName,
        accountNumber: profile.accountNumber,
        bankName: profile.bankName
      };
      save(user);
      n('/app');
    }catch(err){
      if(err instanceof Error){
        notify(err.message);
      }else{
        notify('Login failed');
      }
    }finally{
      setBusy(false);
    }
  };

  return (
    <Auth title="Administration access" copy="Secure sign in for authorized school administrators and platform staff.">
      <div className="tabs">
        <button className={role==='SchoolAdmin'?'on':''} onClick={()=>setRole('SchoolAdmin')}>School admin</button>
        <button className={role==='Admin'?'on':''} onClick={()=>setRole('Admin')}>Platform admin</button>
      </div>
      <form className="form" onSubmit={submit}>
        <Field name="Email" label="Work email" type="email" icon={Mail} placeholder="name@school.edu.ng" />
        <Field name="Password" label="Password" type="password" icon={LockKeyhole} placeholder="Enter your staff password" />
        <button className="primary auth-submit" disabled={busy}>
          {busy ? <><i className="spinner light"/>Verifying access…</> : <>Continue to administration <ArrowRight/></>}
        </button>
      </form>
      <p className="switch"><button type="button" onClick={()=>n('/login')}>← Back to student and merchant sign in</button></p>
    </Auth>
  );
}

function Field({name,label,type='text',icon:Icon,placeholder,value,onChange,required=true,autoComplete,className}:{name:string;label:string;type?:string;icon?:any;placeholder?:string;value?:string;onChange?:(e:any)=>void;required?:boolean;autoComplete?:string;className?:string}){
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type;
  return (
    <label className={className}>
      <span>{label}</span>
      <div className="form-input-box">
        {Icon && <Icon className="field-icon" />}
        <input
          name={name}
          type={resolvedType}
          required={required}
          placeholder={placeholder || label}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          style={Icon ? undefined : { paddingLeft: '14px' }}
        />
        {isPassword && (
          <button
            type="button"
            className="action-toggle"
            onClick={() => setShow(!show)}
            title={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
    </label>
  );
}

function Register({notify}:{notify:(s:string,bad?:boolean)=>void}){
  const l=useLocation(),n=useNavigate(),m=l.pathname.endsWith('merchant')
  const [showPin,setShowPin]=useState(false)
  const [showPassword,setShowPassword]=useState(false)
  const [showConfirmPassword,setShowConfirmPassword]=useState(false)
  const [statusMessage,setStatusMessage]=useState('')
  const [busy,setBusy]=useState(false)

  // Form states for real-time validation feedback
  const [password,setPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [pin,setPin]=useState('')

  // Password criteria
  const reqLength = password.length >= 8
  const reqUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password)
  const reqNumber = /\d/.test(password)
  const reqSpecial = /[^A-Za-z0-9]/.test(password)
  const score = [reqLength, reqUpperLower, reqNumber, reqSpecial].filter(Boolean).length
  const isPasswordStrong = score === 4

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    const d=new FormData(e.currentTarget)
    const cleanPin=pin.trim()

    if(!/^\d{4}$/.test(cleanPin)){
      notify('PIN must contain exactly 4 numeric digits.', true)
      return
    }
    if(!isPasswordStrong){
      notify('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.', true)
      return
    }
    if(password!==confirmPassword){
      notify('Passwords do not match.', true)
      return
    }

    setBusy(true)
    try{
      if(m){
        const payload={
          email:String(d.get('email')||'').trim(),
          password,
          businessName:String(d.get('businessName')||'').trim(),
          shopLocation:String(d.get('shopLocation')||'').trim(),
          schoolCode:String(d.get('schoolCode')||'').trim(),
          pin:cleanPin,
          bankCode:String(d.get('bankCode')||'').trim(),
          accountNumber:String(d.get('accountNumber')||'').trim()
        }
        await api('/Merchant/register',{method:'POST',body:JSON.stringify(payload)})
        setStatusMessage('Registration submitted successfully! Please check your email to verify your account and await school admin approval. Redirecting to login…')
        notify('Merchant registration submitted! Please check your email.')
        setTimeout(()=>n('/login'),2200)
      }else{
        const payload={
          firstname:String(d.get('firstname')||'').trim(),
          lastname:String(d.get('lastname')||'').trim(),
          matricNumber:String(d.get('matricNumber')||'').trim(),
          schoolCode:String(d.get('schoolCode')||'').trim(),
          email:String(d.get('email')||'').trim(),
          pin:cleanPin,
          password
        }
        await api('/Student/register',{method:'POST',body:JSON.stringify(payload)})
        setStatusMessage('Registration successful! Please check your email to verify your account before logging in. Redirecting to login…')
        notify('Registration successful! Please check your email to verify.')
        setTimeout(()=>n('/login'),2200)
      }
    }catch(err){
      setStatusMessage('')
      notify(err instanceof ApiError?err.message:'Registration could not be completed. Please review your details and try again.', true)
    }finally{
      setBusy(false)
    }
  }

  return (
    <Auth title={m?'Grow your campus business':'Create your wallet'} copy={m?'Accept fast cashless payments from students across campus.':'Join thousands of students paying smarter across campus.'}>
      <div className="tabs">
        <button type="button" className={!m?'on':''} onClick={()=>n('/register/student')}>Student</button>
        <button type="button" className={m?'on':''} onClick={()=>n('/register/merchant')}>Merchant</button>
      </div>

      <form className="form cols" onSubmit={submit}>
        {statusMessage&&<div className="form-status success full">{statusMessage}</div>}

        {m?(
          <>
            <label>
              <span>Business name</span>
              <div className="form-input-box">
                <Store className="field-icon" />
                <input name="businessName" required placeholder="e.g. QuickPrint Hub" />
              </div>
            </label>

            <label>
              <span>Shop location</span>
              <div className="form-input-box">
                <MapPin className="field-icon" />
                <input name="shopLocation" required placeholder="e.g. Block C, Student Complex" />
              </div>
            </label>

            <label>
              <span>Bank code</span>
              <div className="form-input-box">
                <Landmark className="field-icon" />
                <input name="bankCode" required placeholder="e.g. 058 (GTBank)" />
              </div>
            </label>

            <label>
              <span>Settlement account number</span>
              <div className="form-input-box">
                <WalletCards className="field-icon" />
                <input name="accountNumber" required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit NUBAN" />
              </div>
            </label>
          </>
        ):(
          <>
            <label>
              <span>First name</span>
              <div className="form-input-box">
                <UserRound className="field-icon" />
                <input name="firstname" required placeholder="First name" />
              </div>
            </label>

            <label>
              <span>Last name</span>
              <div className="form-input-box">
                <UserRound className="field-icon" />
                <input name="lastname" required placeholder="Last name" />
              </div>
            </label>

            <label>
              <span>Matric number</span>
              <div className="form-input-box">
                <Hash className="field-icon" />
                <input name="matricNumber" required placeholder="e.g. 190404012" />
              </div>
            </label>
          </>
        )}

        <label>
          <span>School code</span>
          <div className="form-input-box">
            <GraduationCap className="field-icon" />
            <input name="schoolCode" required placeholder="e.g. UNILAG, MTU2015" autoCapitalize="characters" />
          </div>
        </label>

        <label className={m?'':'full'}>
          <span>Email address</span>
          <div className="form-input-box">
            <Mail className="field-icon" />
            <input name="email" type="email" required placeholder="name@university.edu.ng" />
          </div>
        </label>

        {/* 4-digit PIN */}
        <label className="full">
          <span>4-digit Transaction PIN</span>
          <div className="form-input-box">
            <KeyRound className="field-icon" />
            <input
              name="pin"
              type={showPin?'text':'password'}
              required
              inputMode="numeric"
              pattern="[0-9]{4}"
              minLength={4}
              maxLength={4}
              value={pin}
              autoComplete="new-password"
              placeholder="Enter 4-digit PIN"
              onChange={e=>setPin(e.target.value.replace(/\D/g,'').slice(0,4))}
            />
            <button
              type="button"
              className="action-toggle"
              onClick={()=>setShowPin(!showPin)}
              title={showPin?'Hide PIN':'Show PIN'}
            >
              {showPin?<EyeOff/>:<Eye/>}
            </button>
          </div>
        </label>

        {/* Password */}
        <label className="full">
          <span>Password</span>
          <div className="form-input-box">
            <LockKeyhole className="field-icon" />
            <input
              name="password"
              type={showPassword?'text':'password'}
              required
              placeholder="Create a strong password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="action-toggle"
              onClick={()=>setShowPassword(!showPassword)}
              title={showPassword?'Hide password':'Show password'}
            >
              {showPassword?<EyeOff/>:<Eye/>}
            </button>
          </div>

          {/* Password criteria checklist & strength meter */}
          <div className="password-ux">
            {password.length>0&&(
              <div className="password-meter-track">
                <span className={score>=1?(score===1?'meter-weak':score<=3?'meter-fair':'meter-strong'):''} />
                <span className={score>=2?(score<=3?'meter-fair':'meter-strong'):''} />
                <span className={score>=3?(score<=3?'meter-fair':'meter-strong'):''} />
                <span className={score>=4?'meter-strong':''} />
              </div>
            )}

            <div className="password-checklist">
              <span className={`checklist-item ${reqLength?'met':''}`}>
                {reqLength?<Check/>:<span className="checklist-bullet">•</span>} 8+ characters
              </span>
              <span className={`checklist-item ${reqUpperLower?'met':''}`}>
                {reqUpperLower?<Check/>:<span className="checklist-bullet">•</span>} Uppercase & lowercase
              </span>
              <span className={`checklist-item ${reqNumber?'met':''}`}>
                {reqNumber?<Check/>:<span className="checklist-bullet">•</span>} At least one number
              </span>
              <span className={`checklist-item ${reqSpecial?'met':''}`}>
                {reqSpecial?<Check/>:<span className="checklist-bullet">•</span>} Special character (!@#$)
              </span>
            </div>
          </div>
        </label>

        {/* Confirm Password */}
        <label className="full">
          <span>Confirm password</span>
          <div className="form-input-box">
            <LockKeyhole className="field-icon" />
            <input
              name="confirmPassword"
              type={showConfirmPassword?'text':'password'}
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={e=>setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="action-toggle"
              onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
              title={showConfirmPassword?'Hide password':'Show password'}
            >
              {showConfirmPassword?<EyeOff/>:<Eye/>}
            </button>
          </div>
          {confirmPassword.length>0&&(
            <div className={`password-match-hint ${password===confirmPassword?'match':'no-match'}`}>
              {password===confirmPassword?<><Check style={{width:'14px',height:'14px',display:'inline'}}/> Passwords match</>:<>• Passwords do not match yet</>}
            </div>
          )}
        </label>

        <button className="primary full" disabled={busy}>
          {busy?<><i className="spinner light"/> Creating your account…</>:<>Create my account <ArrowRight/></>}
        </button>
      </form>

      <p className="switch">Already have an account? <button type="button" onClick={()=>n('/login')}>Sign in</button></p>
    </Auth>
  )
}
function Forgot({notify}:{notify:(s:string)=>void}){
  const [busy,setBusy]=useState(false);
  const [statusMessage,setStatusMessage]=useState('');
  const n = useNavigate();

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const d=new FormData(e.currentTarget);
    const email=String(d.get('email')||'').trim();
    if(!email){notify('Please enter your email address.');return;}
    setBusy(true);
    try{
      await api('/Account/forgot_password',{method:'POST',body:JSON.stringify({email})});
      setStatusMessage('If an account is associated with this email, a reset link has been sent.');
      notify('Password reset instructions sent if the account exists.');
    }catch(err){
      setStatusMessage('');
      notify(err instanceof ApiError?err.message:'We could not send the reset email. Please try again.');
    }finally{
      setBusy(false);
    }
  };

  return (
    <Auth title="Reset password" copy="Enter your email address and we’ll send you recovery instructions.">
      <form className="form" onSubmit={submit}>
        {statusMessage && <div className="form-status success">{statusMessage}</div>}
        <Field name="email" label="Email address" type="email" icon={Mail} placeholder="name@university.edu.ng" />
        <button className="primary" disabled={busy}>
          {busy ? <><i className="spinner light"/>Sending reset instructions…</> : <>Send reset link <ArrowRight/></>}
        </button>
      </form>
      <p className="switch"><button type="button" onClick={()=>n('/login')}>← Back to sign in</button></p>
    </Auth>
  );
}

function ResetPassword({notify}:{notify:(s:string)=>void}){
  const [searchParams]=useSearchParams();
  const n=useNavigate();
  const [busy,setBusy]=useState(false);
  const [statusMessage,setStatusMessage]=useState('');
  const [password,setPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);

  const email=searchParams.get('email')||'';
  const token=searchParams.get('token')||'';

  const reqLength = password.length >= 8;
  const reqUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const reqNumber = /\d/.test(password);
  const reqSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordStrong = reqLength && reqUpperLower && reqNumber && reqSpecial;

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!email||!token){
      notify('The reset link is missing its email or token. Please request a new one.');
      return;
    }
    if(!isPasswordStrong){
      notify('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.');
      return;
    }
    if(password!==confirmPassword){
      notify('Passwords do not match.');
      return;
    }

    setBusy(true);
    try{
      await api(`/Account/reset_password?${new URLSearchParams({email,token})}`,{method:'POST',body:JSON.stringify({password})});
      setStatusMessage('Password reset successfully! You can now sign in with your new password.');
      notify('Password reset completed successfully.');
      setTimeout(()=>n('/login'),1500);
    }catch(err){
      setStatusMessage('');
      notify(err instanceof ApiError?err.message:'We could not reset your password. Please try again.');
    }finally{
      setBusy(false);
    }
  };

  return (
    <Auth title="Set a new password" copy="Choose a strong password for your CampusPay account.">
      <form className="form" onSubmit={submit}>
        {statusMessage && <div className="form-status success">{statusMessage}</div>}

        <label className="full">
          <span>New password</span>
          <div className="form-input-box">
            <LockKeyhole className="field-icon" />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter new strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="action-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="password-checklist" style={{ marginTop: '8px' }}>
              <span className={`checklist-item ${reqLength ? 'met' : ''}`}>
                {reqLength ? <Check /> : <span className="checklist-bullet">•</span>} 8+ characters
              </span>
              <span className={`checklist-item ${reqUpperLower ? 'met' : ''}`}>
                {reqUpperLower ? <Check /> : <span className="checklist-bullet">•</span>} Upper & lowercase
              </span>
              <span className={`checklist-item ${reqNumber ? 'met' : ''}`}>
                {reqNumber ? <Check /> : <span className="checklist-bullet">•</span>} At least one number
              </span>
              <span className={`checklist-item ${reqSpecial ? 'met' : ''}`}>
                {reqSpecial ? <Check /> : <span className="checklist-bullet">•</span>} Special character
              </span>
            </div>
          )}
        </label>

        <label className="full">
          <span>Confirm new password</span>
          <div className="form-input-box">
            <LockKeyhole className="field-icon" />
            <input
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="action-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <div className={`password-match-hint ${password === confirmPassword ? 'match' : 'no-match'}`}>
              {password === confirmPassword ? <><Check style={{ width: 14, height: 14, display: 'inline' }} /> Passwords match</> : <>• Passwords do not match yet</>}
            </div>
          )}
        </label>

        <button className="primary" disabled={busy}>
          {busy ? <><i className="spinner light"/>Updating password…</> : <>Save new password <ArrowRight/></>}
        </button>
      </form>
    </Auth>
  );
}

type NavItem=[string,any,string]
type NavGroup={label:string;icon:any;items:NavItem[]}
const navGroups:Record<Role,NavGroup[]>={Student:[{label:'Payments',icon:Send,items:[['Transfer',ArrowUpRight,'transfer'],['Add money',Plus,'deposit'],['Find a wallet',Search,'search']]},{label:'Account',icon:WalletCards,items:[['Wallet details',WalletCards,'wallet'],['Transactions',History,'transactions']]}],Merchant:[{label:'Get paid',icon:ScanLine,items:[['Scan to charge',ScanLine,'scan'],['My QR code',QrCode,'qr']]},{label:'Finances',icon:Banknote,items:[['Wallet details',WalletCards,'wallet'],['Withdraw',ArrowDownLeft,'withdraw'],['Transactions',History,'transactions']]}],Admin:[{label:'Organization',icon:GraduationCap,items:[['Schools',GraduationCap,'schools'],['School admins',ShieldCheck,'admins'],['Platform users',Users,'school-users']]},{label:'Operations',icon:Landmark,items:[['Bank directory',Landmark,'banks'],['Delete user',UserRound,'users']]}],SchoolAdmin:[{label:'School management',icon:GraduationCap,items:[['Merchant approvals',Store,'approvals'],['School users',Users,'school-users']]},{label:'Access',icon:ShieldCheck,items:[['Create admin',ShieldCheck,'admins']]}]}
function Shell({user,save,notify}:{user:User;save:(u:User|null)=>void;notify:(s:string,bad?:boolean)=>void}){const[open,setOpen]=useState(false);const[groups,setGroups]=useState<Record<string,boolean>>({Payments:true,'Get paid':true,Organization:true,'School management':true});const[dark,setDark]=useState(()=>localStorage.getItem('cp-theme')==='dark');const[alerts,setAlerts]=useState(false);const[query,setQuery]=useState('');const l=useLocation(),n=useNavigate();const go=(path:string)=>{n('/app'+(path?'/'+path:''));setOpen(false)};const theme=(value:boolean)=>{setDark(value);localStorage.setItem('cp-theme',value?'dark':'light')};return <div className={'shell '+(dark?'dark-mode':'')}><aside className={open?'open':''}><div className="side-logo"><Logo/><button onClick={()=>setOpen(false)}><X/></button></div><div className="person">
  {user.profilePicture ? (
    <img src={user.profilePicture} alt="Avatar" className="user-nav-avatar" />
  ) : (
    <b>{user.firstname[0]}{user.lastname[0]}</b>
  )}
  <span><strong>{user.firstname} {user.lastname}</strong><small>{user.role} • {user.schoolCode}</small></span>
</div><nav className="grouped-nav"><button className={l.pathname==='/app'?'on top-link':''} onClick={()=>go('')}><LayoutDashboard/>Overview</button>{navGroups[user.role].map(group=><div className={'nav-group '+(groups[group.label]?'expanded':'')} key={group.label}><button className="group-trigger" onClick={()=>setGroups({...groups,[group.label]:!groups[group.label]})}><group.icon/><span>{group.label}</span><ChevronDown/></button><div className="group-items">{group.items.map(([label,I,path])=><button key={path} className={l.pathname===`/app/${path}`?'on':''} onClick={()=>go(path)}><I/>{label}</button>)}</div></div>)}</nav><footer><button onClick={()=>go('profile')}><UserRound/>Profile</button><button onClick={()=>go('settings')}><Settings/>Settings</button><button onClick={()=>{api('/Account/logout',{method:'POST'}).catch(()=>{});save(null);n('/login')}}><LogOut/>Sign out</button></footer></aside><main className="workspace"><header className="app-topbar"><button className="mobile-menu" onClick={()=>setOpen(true)}><Menu/></button><nav><button className={l.pathname==='/app'?'active':''} onClick={()=>go('')}>Overview</button><button className={l.pathname.includes('transactions')?'active':''} onClick={()=>go('transactions')}>Activity</button><button onClick={()=>go('settings')}>Security</button></nav><form className="top-search" onSubmit={e=>{e.preventDefault();if(query.trim()){go('transactions');notify(`Showing results for “${query}”`)}}}><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search transactions"/><kbd>Enter</kbd></form><div className="top-actions"><button title="Help" onClick={()=>notify('Support is available at support@campuspay.ng')}><HelpCircle/></button><button title="Notifications" className="bell-button" onClick={()=>setAlerts(!alerts)}><Bell/><i/></button><button className="top-profile" onClick={()=>go('profile')}>
  {user.profilePicture ? (
    <img src={user.profilePicture} alt="Avatar" className="user-top-avatar" />
  ) : (
    <b>{user.firstname[0]}{user.lastname[0]}</b>
  )}
  <span>{user.firstname}<small>{user.role}</small></span>
</button>{alerts&&<div className="notification-pop"><strong>Notifications</strong><p><BadgeCheck/> Your account is verified.</p><p><ArrowDownLeft/> Deposit completed successfully.</p><button onClick={()=>{setAlerts(false);go('transactions')}}>View activity</button></div>}</div></header><div className="route-stage" key={l.pathname}><Routes><Route index element={<Dashboard user={user} go={n} notify={notify}/>}/><Route path="transactions" element={<Transactions/>}/><Route path="wallet" element={<Wallet user={user} notify={notify}/>}/><Route path="transfer" element={<Money kind="Transfer" notify={notify}/>}/><Route path="deposit" element={<Money kind="Deposit" notify={notify}/>}/><Route path="withdraw" element={<Money kind="Withdrawal" notify={notify}/>}/><Route path="scan" element={<Money kind="scan_to_charge" notify={notify}/>}/><Route path="search" element={<Lookup notify={notify}/>}/><Route path="qr" element={<QR user={user} notify={notify}/>}/><Route path="schools" element={<Schools notify={notify}/>}/><Route path="approvals" element={<Approvals notify={notify}/>}/><Route path="admins" element={<SimpleForm title="Create school admin" path="/Admin/Create-SchoolAdmin" fields={['Firstname','Lastname','Email','SchoolCode','Password']} notify={notify}/>}/><Route path="banks" element={<Banks/>}/><Route path="users" element={<SimpleForm title="Delete user" path="/Admin/delete/" fields={['UserId']} notify={notify} danger/>}/><Route path="school-users" element={<UsersPage/>}/><Route path="profile" element={<ProfilePage user={user} save={save} notify={notify}/>}/><Route path="settings" element={<SettingsPanel dark={dark} setDark={theme} notify={notify}/>}/></Routes></div></main>{open&&<div className="scrim" onClick={()=>setOpen(false)}/>}</div>}
function Head({over,title,children}:{over:string;title:string;children?:ReactNode}){return <div className="head"><div><small>{over}</small><h1>{title}</h1></div>{children}</div>}
function Dashboard({user,go,notify}:{user:User;go:(s:string)=>void;notify:(s:string)=>void}){
  const [downloading,setDownloading]=useState(false);
  const [showBalance,setShowBalance]=useState(true);
  const [wallet,setWallet]=useState<{walletNumber?:string;balance?:number;isLocked?:boolean}|null>(null);
  const [rows,setRows]=useState<Array<Record<string, any>>>([]);
  const [txFilter, setTxFilter]=useState<'all'|'in'|'out'>('all');
  const [loading, setLoading]=useState(true);

  const loadData = async () => {
    try {
      const [walletData, historyData] = await Promise.all([
        api<any>('/Wallet/Wallet').catch(() => api<any>('/Wallet/wallet').catch(() => null)),
        api<any>('/Transaction/history').catch(() => api<any>('/Wallet/transactions').catch(() => null))
      ]);
      setWallet(walletData?.data ?? walletData);
      const payload = Array.isArray(historyData?.data) ? historyData.data : Array.isArray(historyData) ? historyData : [];
      setRows(payload);
    } catch {
      setWallet(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const statement = () => {
    if (!rows.length) {
      notify('No transactions to export yet.');
      return;
    }
    setDownloading(true);
    notify('Preparing your account statement…');
    window.setTimeout(() => {
      const csvLines = [
        'Reference,Description,Date,Status,Amount',
        ...rows.map((t: any) => `${t.reference || t.ref || 'CP-TX'},"${t.description || t.desc || 'Transaction'}","${t.createdAt || t.date || 'Recent'}",Successful,${t.amount || t.Amount || 0}`)
      ];
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CampusPay-statement-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloading(false);
      notify('Statement downloaded successfully');
    }, 700);
  };

  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [adminSchoolCount, setAdminSchoolCount] = useState<number | null>(null);
  const [adminMerchantCount, setAdminMerchantCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user.role.includes('Admin')) return;
    const path = user.role === 'SchoolAdmin' ? '/analytics/school/dashboard' : '/analytics/system/dashboard';
    api<any>(path, { method: 'GET' })
      .then((res: any) => setAdminAnalytics(res?.data ?? res))
      .catch(() => {});
    api<any>('/School', { method: 'GET' })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setAdminSchoolCount(list.length);
      })
      .catch(() => {});
    api<any>('/SchoolAdmin/merchants', { method: 'GET' })
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setAdminMerchantCount(list.length);
      })
      .catch(() => {});
  }, [user.role]);

  const admin = user.role.includes('Admin');
  if (admin) {
    const totalUsers = adminAnalytics?.totalUsers ?? adminAnalytics?.totalWallets ?? '—';
    const activeMerchants = adminMerchantCount !== null ? adminMerchantCount : (adminAnalytics?.totalMerchants ?? '—');
    const schoolsOnboarded = adminSchoolCount !== null ? adminSchoolCount : (adminAnalytics?.totalSchools ?? '—');
    const rawVol = Number(adminAnalytics?.totalVolume ?? adminAnalytics?.volume ?? 0);
    const volumeDisplay = rawVol > 0 ? `₦${rawVol.toLocaleString()}` : (adminAnalytics?.totalVolume ? `₦${adminAnalytics.totalVolume}` : '₦0.00');

    const activityBars: number[] = (() => {
      const breakdown = adminAnalytics?.dailyVolume || adminAnalytics?.weeklyVolume || adminAnalytics?.volumeByDay;
      if (Array.isArray(breakdown) && breakdown.length > 0) {
        const max = Math.max(...breakdown.map((b: any) => Number(b.value || b.amount || 1)), 1);
        return breakdown.map((b: any) => Math.max(12, Math.round((Number(b.value || b.amount || 0) / max) * 100)));
      }
      return [35, 55, 45, 70, 60, 85, 65, 90, 75, 80, 95, 85];
    })();

    return (
      <Page>
        <Head over="CONTROL CENTER" title={`Good morning, ${user.firstname}`} />
        <div className="stats action-stats">
          <button onClick={() => go('school-users')}><Stat i={Users} a="Total campus users" v={typeof totalUsers === 'number' ? totalUsers.toLocaleString() : String(totalUsers)} /></button>
          <button onClick={() => go('approvals')}><Stat i={Store} a="Active merchants" v={typeof activeMerchants === 'number' ? activeMerchants.toLocaleString() : String(activeMerchants)} /></button>
          <button onClick={() => go('schools')}><Stat i={GraduationCap} a="Schools onboarded" v={typeof schoolsOnboarded === 'number' ? schoolsOnboarded.toLocaleString() : String(schoolsOnboarded)} /></button>
          <button onClick={() => go('transactions')}><Stat i={Banknote} a="Platform volume" v={volumeDisplay} /></button>
        </div>
        <div className="panel">
          <h2>Platform activity</h2>
          <div className="chart">{activityBars.map((x, i) => <i key={i} style={{ height: x + '%' }} />)}</div>
        </div>
      </Page>
    );
  }

  // 100% Real dynamic data from backend (no fake fallback numbers)
  const rawBalance = typeof wallet?.balance === 'number' ? wallet.balance : 0;
  const balanceDisplay = showBalance ? `₦${rawBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₦ ••••••••';
  const displayWalletNumber = wallet?.walletNumber || user.walletNumber || '—';

  // Dynamic monthly totals from actual transactions
  const moneyInThisMonth = rows
    .filter((r: any) => {
      const amt = typeof r.amount === 'number' ? r.amount : typeof r.Amount === 'number' ? r.Amount : 0;
      const type = r.type ?? r.Type;
      return amt > 0 || type === 0;
    })
    .reduce((sum: number, r: any) => {
      const amt = typeof r.amount === 'number' ? r.amount : typeof r.Amount === 'number' ? r.Amount : 0;
      return sum + Math.abs(amt);
    }, 0);

  const moneyOutThisMonth = rows
    .filter((r: any) => {
      const amt = typeof r.amount === 'number' ? r.amount : typeof r.Amount === 'number' ? r.Amount : 0;
      const type = r.type ?? r.Type;
      return amt < 0 || type === 1 || type === 2;
    })
    .reduce((sum: number, r: any) => {
      const amt = typeof r.amount === 'number' ? r.amount : typeof r.Amount === 'number' ? r.Amount : 0;
      return sum + Math.abs(amt);
    }, 0);

  const completedCount = rows.filter((r: any) => r.status === 1 || r.Status === 1 || r.status === undefined).length;

  const filteredRows = rows.filter((r: any) => {
    const amt = typeof r.amount === 'number' ? r.amount : typeof r.Amount === 'number' ? r.Amount : 0;
    if (txFilter === 'in') return amt > 0;
    if (txFilter === 'out') return amt < 0;
    return true;
  });

  return (
    <Page>
      <Head over="CAMPUS DASHBOARD" title={`Hello, ${user.firstname} 👋`}>
        <div className="head-actions">
          <button className="outline download-action" disabled={downloading || !rows.length} onClick={statement}>
            {downloading ? <><i className="spinner" />Preparing…</> : <><Download />Download statement</>}
          </button>
        </div>
      </Head>

      {/* Main Virtual Wallet Card */}
      <div className="wallet-card-pro">
        <div className="card-top-row">
          <div className="card-chip" />
          <span className="card-brand-badge">
            <GraduationCap style={{ width: 14, height: 14 }} /> {user.schoolCode || 'CampusPay'} • {user.role} Verified
          </span>
        </div>

        <div className="balance-section">
          <div className="balance-label-row">
            <small>Available Balance</small>
            <button
              type="button"
              className="balance-privacy-btn"
              onClick={() => setShowBalance(!showBalance)}
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <EyeOff /> : <Eye />} {showBalance ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="main-balance-val">{balanceDisplay}</div>
          <div className="card-wallet-id">
            <span>{displayWalletNumber}</span>
            <button
              type="button"
              aria-label="Copy wallet number"
              onClick={() => {
                navigator.clipboard.writeText(displayWalletNumber);
                notify('Wallet number copied to clipboard');
              }}
              title="Copy wallet number"
            >
              <Copy style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        <div className="quick-actions-bar">
          {user.role === 'Student' ? (
            <>
              <button className="action-pill highlight" onClick={() => go('deposit')}>
                <Plus /> Add money (Paystack)
              </button>
              <button className="action-pill" onClick={() => go('transfer')}>
                <Send /> Transfer
              </button>
              <button className="action-pill" onClick={() => go('search')}>
                <Search /> Find wallet
              </button>
              <button className="action-pill" onClick={() => go('transactions')}>
                <History /> Transactions
              </button>
            </>
          ) : (
            <>
              <button className="action-pill highlight" onClick={() => go('withdraw')}>
                <ArrowDownLeft /> Withdraw to Bank
              </button>
              <button className="action-pill" onClick={() => go('scan')}>
                <ScanLine /> Scan to charge
              </button>
              <button className="action-pill" onClick={() => go('qr')}>
                <QrCode /> My Store QR
              </button>
              <button className="action-pill" onClick={() => go('transactions')}>
                <History /> Transactions
              </button>
            </>
          )}
        </div>
      </div>

      {/* Direct Bank Transfer Funding Info */}
      <div className="bank-transfer-banner">
        <div>
          <i><Landmark /></i>
          <span>
            <b>Fund via Instant Bank Transfer</b>
            <small>Transfer directly to your dedicated virtual account ({displayWalletNumber}) from any Nigerian banking app.</small>
          </span>
        </div>
        <button
          className="outline"
          onClick={() => {
            navigator.clipboard.writeText(displayWalletNumber);
            notify(`Account number ${displayWalletNumber} copied!`);
          }}
        >
          <Copy style={{ width: 14, height: 14 }} /> Copy Account No
        </button>
      </div>

      {/* Campus Quick Services */}
      <div className="quick-services-grid">
        <div className="service-card-item" onClick={() => go('transfer')}>
          <span className="service-icon"><Store /></span>
          <b>Campus Cafeteria</b>
          <small>Fast meal checkout</small>
        </div>
        <div className="service-card-item" onClick={() => go('transfer')}>
          <span className="service-icon"><GraduationCap /></span>
          <b>Print & Stationery</b>
          <small>Instant bookshop payment</small>
        </div>
        <div className="service-card-item" onClick={() => go('deposit')}>
          <span className="service-icon"><Plus /></span>
          <b>Paystack Top-up</b>
          <small>Debit card, USSD & Bank</small>
        </div>
        <div className="service-card-item" onClick={() => go('search')}>
          <span className="service-icon"><Search /></span>
          <b>Student Directory</b>
          <small>Find peer wallet</small>
        </div>
      </div>

      {/* Dynamic Monthly Stats */}
      <div className="stats action-stats">
        <button onClick={() => go('transactions')}>
          <Stat i={ArrowDownLeft} a="Total money in" v={`₦${moneyInThisMonth.toLocaleString()}.00`} />
        </button>
        <button onClick={() => go('transactions')}>
          <Stat i={ArrowUpRight} a="Total money out" v={`₦${moneyOutThisMonth.toLocaleString()}.00`} />
        </button>
        <button onClick={() => go('transactions')}>
          <Stat i={BadgeCheck} a="Completed payments" v={String(completedCount)} />
        </button>
      </div>

      {/* Recent Activity with filter tabs */}
      <div className="panel recent-panel">
        <div className="panel-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2>Recent transactions</h2>
            {rows.length > 0 && (
              <div className="tabs" style={{ margin: 0, padding: '3px' }}>
                <button className={txFilter === 'all' ? 'on' : ''} onClick={() => setTxFilter('all')}>All</button>
                <button className={txFilter === 'in' ? 'on' : ''} onClick={() => setTxFilter('in')}>Inflow</button>
                <button className={txFilter === 'out' ? 'on' : ''} onClick={() => setTxFilter('out')}>Outflow</button>
              </div>
            )}
          </div>
          {rows.length > 0 && (
            <button onClick={() => go('transactions')}>View full history <ArrowRight /></button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#68807a' }}>
            <i className="spinner" /> Loading transactions…
          </div>
        ) : rows.length === 0 ? (
          <div className="empty-tx-state">
            <div className="empty-tx-icon"><WalletCards /></div>
            <h3>No transactions recorded yet</h3>
            <p>Your recent deposits via Paystack, peer transfers, and campus payments will show up right here.</p>
            <button className="primary" onClick={() => go('deposit')}>
              <Plus /> Add funds via Paystack
            </button>
          </div>
        ) : (
          <Tx rows={filteredRows.slice(0, 6)} />
        )}
      </div>
    </Page>
  );
}

function Page({children}:{children:ReactNode}){return <div className="page">{children}</div>}

function Stat({i:I,a,v}:{i:any;a:string;v:string}){
  return (
    <div className="stat">
      <span>
        <small>{a}</small>
        <b>{v}</b>
        <em>Live account data</em>
      </span>
      <i><I/></i>
    </div>
  );
}

function ReceiptModal({ tx, onClose }: { tx: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!tx) return null;

  const copyRef = () => {
    navigator.clipboard?.writeText(tx.reference || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-modal-close" onClick={onClose} aria-label="Close modal">
          <X style={{ width: 16, height: 16 }} />
        </button>

        <div className="receipt-thermal-header">
          <div className="receipt-modal-brand">
            <i><BrandIcon /></i>
            <span>CampusPay Official Receipt</span>
          </div>
          <div className={tx.isInflow ? 'inflow-badge' : 'outflow-badge'}>
            <CheckCircle2 style={{ width: 14, height: 14 }} />
            {tx.isInflow ? 'Funds Received' : 'Payment Completed'}
          </div>
        </div>

        <div className="receipt-modal-amount">
          <small>Transaction Amount</small>
          <h2>{tx.isInflow ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        <div className="receipt-card modal-receipt-body">
          <div>
            <span>Description</span>
            <b>{tx.name}</b>
          </div>
          <div>
            <span>Detail</span>
            <b>{tx.description}</b>
          </div>
          <div>
            <span>Date & Time</span>
            <b>{tx.createdAt}</b>
          </div>
          <div className="receipt-ref-row">
            <span>Reference</span>
            <div className="receipt-ref-copy">
              <code>{tx.reference}</code>
              <button type="button" className="icon-copy-btn" onClick={copyRef} title="Copy reference">
                {copied ? <Check style={{ width: 12, height: 12, color: '#1a7768' }} /> : <Copy style={{ width: 12, height: 12 }} />}
              </button>
            </div>
          </div>
          <div>
            <span>Status</span>
            <em><i /> Settled & Verified</em>
          </div>
        </div>

        <div className="receipt-modal-actions">
          <button type="button" className="outline" onClick={() => window.print()}>
            <Printer style={{ width: 15, height: 15 }} /> Print Receipt
          </button>
          <button type="button" className="primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Tx({rows}:{rows?:Array<Record<string, any>>}){
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  if (!rows || rows.length === 0) {
    return (
      <div className="empty-tx-state">
        <div className="empty-tx-icon"><WalletCards /></div>
        <h3>No transactions found</h3>
        <p>There are no transactions matching this view.</p>
      </div>
    );
  }

  const normalized = rows.map((item: any, index: number) => {
    const amount = typeof item.amount === 'number' ? item.amount : typeof item.Amount === 'number' ? item.Amount : typeof item.amountInNaira === 'number' ? item.amountInNaira : 0;
    const reference = item.reference || item.Reference || item.ref || `TX-${index + 1}`;
    const description = item.description || item.Description || item.desc || 'Transaction';
    const createdAt = item.createdAt || item.CreatedAt || item.date || '—';
    const name = item.name || item.senderWalletName || item.receiverWalletName || 'CampusPay transaction';
    const isInflow = amount > 0;
    return { name, description, reference, createdAt, amount, isInflow };
  });

  return (
    <>
      <div className="tx-list-modern">
        {normalized.map((t, index) => (
          <div
            className="tx-row-item clickable-row"
            key={t.reference + '-' + index}
            onClick={() => setSelectedTx(t)}
            title="Click to view full receipt"
          >
            <div className={`tx-avatar ${t.isInflow ? 'inflow' : 'outflow'}`}>
              {t.isInflow ? <ArrowDownLeft /> : <ArrowUpRight />}
            </div>
            <div className="tx-details">
              <b>{t.name}</b>
              <small>{t.description} • {t.createdAt}</small>
            </div>
            <div className="tx-meta-right">
              <span className={`tx-amount ${t.isInflow ? 'positive' : 'negative'}`}>
                {t.isInflow ? '+' : '-'}₦{Math.abs(t.amount).toLocaleString()}.00
              </span>
              <span className="tx-receipt-badge">
                <FileText style={{ width: 11, height: 11 }} /> Receipt
              </span>
            </div>
          </div>
        ))}
      </div>
      {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </>
  );
}

function Transactions(){
  const [q,setQ]=useState('');
  const [rows,setRows]=useState<Array<Record<string, any>>>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{
      try{
        const historyData=await api<any>('/Transaction/history').catch(()=>api<any>('/Wallet/transactions').catch(()=>null));
        if(!cancelled){
          const payload=Array.isArray(historyData?.data)?historyData.data:Array.isArray(historyData)?historyData:[];
          setRows(payload);
        }
      }catch{
        if(!cancelled){setRows([]);}
      }finally{
        if(!cancelled)setLoading(false);
      }
    };
    void load();
    return ()=>{cancelled=true};
  },[]);

  return (
    <Page>
      <Head over="ACTIVITY" title="Transaction history"/>
      <div className="panel">
        <div className="filter">
          <Search/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search transactions by reference, name, or description…"/>
        </div>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#68807a' }}>
            <i className="spinner" /> Loading transactions…
          </div>
        ) : (
          <Tx rows={rows.filter(item=>JSON.stringify(item).toLowerCase().includes(q.toLowerCase()))}/>
        )}
      </div>
    </Page>
  );
}

function Wallet({user,notify}:{user:User;notify:(s:string,bad?:boolean)=>void}){
  const [walletView, setWalletView] = useState<'card' | 'qr'>('card');
  const [showBalance, setShowBalance] = useState(true);
  const [wallet, setWallet] = useState<{walletNumber?:string;balance?:number;isLocked?:boolean}|null>(null);
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(true);
  const [lockBusy, setLockBusy] = useState(false);

  // QR state
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Direct recipient verify tool
  const [searchWalletVal, setSearchWalletVal] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchBusy, setSearchBusy] = useState(false);

  const displayWalletNumber = wallet?.walletNumber || user.walletNumber || '—';

  // Load Wallet Summary and Transactions (from Swagger routes)
  const loadWalletData = async () => {
    try {
      const [walletData, historyData, walletTxData] = await Promise.all([
        api<any>('/Wallet/Wallet').catch(() => null),
        api<any>('/Transaction/history').catch(() => null),
        api<any>('/Wallet/Transactions').catch(() => null)
      ]);

      if (walletData) {
        setWallet(walletData?.data ?? walletData);
      }

      // Combine transactions from /Transaction/history or /Wallet/Transactions
      const historyList = Array.isArray(historyData?.data) ? historyData.data : Array.isArray(historyData) ? historyData : [];
      const walletSent = Array.isArray(walletTxData?.data?.sent) ? walletTxData.data.sent : [];
      const walletReceived = Array.isArray(walletTxData?.data?.received) ? walletTxData.data.received : [];
      
      const combined = historyList.length > 0 
        ? historyList 
        : [...walletSent, ...walletReceived];
      
      setRows(combined);
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadWalletData();
    return () => { cancelled = true; };
  }, []);

  // Fetch or Generate QR Code properly
  useEffect(() => {
    let cancelled = false;
    const fetchQr = async () => {
      setQrLoading(true);
      try {
        // According to Swagger: GET /api/v1.0/Merchant/View/qrcode returns raw PNG image bytes
        if (user.role === 'Merchant') {
          const blob = await apiBlob('/Merchant/View/qrcode').catch(() => null);
          if (!cancelled && blob && blob.size > 0) {
            setQrUrl(URL.createObjectURL(blob));
            setQrLoading(false);
            return;
          }
        }

        // For Students or fallback: Generate standard high-contrast QR code for the wallet number
        const encodedData = 'campuspay:wallet:' + displayWalletNumber;
        const generated = await QRCode.toDataURL(encodedData, {
          width: 320,
          margin: 2,
          color: { dark: '#123b36', light: '#ffffff' }
        });
        if (!cancelled) {
          setQrUrl(generated);
        }
      } catch {
        // Fallback generator
        try {
          const generated = await QRCode.toDataURL(displayWalletNumber);
          if (!cancelled) setQrUrl(generated);
        } catch {
          // ignore
        }
      } finally {
        if (!cancelled) setQrLoading(false);
      }
    };
    fetchQr();
    return () => { cancelled = true; };
  }, [displayWalletNumber, user.role]);

  // Lock / Unlock Wallet via POST /api/v1.0/Wallet/lockOrUnlock
  const toggleLockWallet = async () => {
    setLockBusy(true);
    try {
      await api('/Wallet/lockOrUnlock', {
        method: 'POST',
        body: JSON.stringify({ walletNumber: displayWalletNumber })
      }).catch(async () => {
        // Try query string fallback if endpoint expects query parameter
        return api('/Wallet/lockOrUnlock?walletNumber=' + encodeURIComponent(displayWalletNumber), {
          method: 'POST',
          body: JSON.stringify(displayWalletNumber)
        });
      });

      const nextLockedState = !wallet?.isLocked;
      setWallet(prev => prev ? { ...prev, isLocked: nextLockedState } : null);
      notify(nextLockedState ? 'Wallet locked successfully. Transfers are restricted.' : 'Wallet unlocked successfully.');
    } catch (err: any) {
      notify(err?.message || 'Failed to toggle wallet lock status', true);
    } finally {
      setLockBusy(false);
    }
  };

  // Download QR Code (GET /api/v1.0/Merchant/qrcode or generated blob)
  const downloadQrCode = async () => {
    try {
      if (user.role === 'Merchant') {
        const blob = await apiBlob('/Merchant/qrcode').catch(() => null);
        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'CampusPay-QRCode.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          notify('Merchant QR Code downloaded');
          return;
        }
      }

      // Download from generated QR URL
      if (qrUrl) {
        const a = document.createElement('a');
        a.href = qrUrl;
        a.download = `CampusPay-${displayWalletNumber}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        notify('Wallet QR Code downloaded');
      }
    } catch {
      notify('Download failed', true);
    }
  };

  // Recipient search via POST /api/v1.0/Wallet/Search/WalletNumber
  const handleVerifyRecipient = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchWalletVal.trim()) return;
    setSearchBusy(true);
    try {
      const res = await api<any>('/Wallet/Search/WalletNumber', {
        method: 'POST',
        body: JSON.stringify(searchWalletVal.trim())
      }).catch(async () => {
        return api<any>('/Wallet/Search/WalletNumber', {
          method: 'POST',
          body: JSON.stringify({ walletNumber: searchWalletVal.trim() })
        });
      });

      const data = res?.data ?? res;
      setSearchResult(data || null);
      notify(data ? 'Recipient verified!' : 'Wallet not found', !data);
    } catch (err: any) {
      setSearchResult(null);
      notify(err?.message || 'Wallet not found', true);
    } finally {
      setSearchBusy(false);
    }
  };

  const isLocked = wallet?.isLocked === true;
  const rawBalance = typeof wallet?.balance === 'number' ? wallet.balance : 0;
  const balanceDisplay = showBalance ? `₦${rawBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₦ ••••••••';

  // Real-time daily spending calculation
  const today = new Date().toDateString();
  const spentToday = rows
    .filter((t: any) => {
      const dateVal = t.createdAt || t.CreatedAt || t.date || '';
      const d = new Date(dateVal);
      const isToday = d.toDateString() === today || String(dateVal).toLowerCase().includes('today');
      const amt = typeof t.amount === 'number' ? t.amount : typeof t.Amount === 'number' ? t.Amount : 0;
      const type = t.type ?? t.Type;
      return isToday && (amt < 0 || type === 1 || type === 2);
    })
    .reduce((acc: number, t: any) => {
      const amt = typeof t.amount === 'number' ? t.amount : typeof t.Amount === 'number' ? t.Amount : 0;
      return acc + Math.abs(amt);
    }, 0);

  const dailyLimit = 100000;
  const remainingToday = Math.max(0, dailyLimit - spentToday);
  const limitPercent = Math.min(100, Math.round((spentToday / dailyLimit) * 100));

  return (
    <Page>
      <Head over="ACCOUNT & CARD" title="Wallet Management" />

      {/* Warning banner if wallet is locked */}
      {isLocked && (
        <div className="wallet-locked-banner">
          <LockKeyhole style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span>This wallet is currently locked. Outgoing transfers and withdrawals are frozen until you unlock it below.</span>
        </div>
      )}

      {/* Tabs between Card and QR Code */}
      <div className="wallet-tabs-bar">
        <button
          type="button"
          className={`wallet-tab-pill ${walletView === 'card' ? 'active' : ''}`}
          onClick={() => setWalletView('card')}
        >
          <CreditCard style={{ width: 14, height: 14 }} /> Wallet Card
        </button>
        <button
          type="button"
          className={`wallet-tab-pill ${walletView === 'qr' ? 'active' : ''}`}
          onClick={() => setWalletView('qr')}
        >
          <QrCode style={{ width: 14, height: 14 }} /> Payment QR
        </button>
      </div>

      <div className="ops-grid">
        <div>
          {walletView === 'card' ? (
            <div className="wallet-card-pro">
              <div className="card-top-row">
                <div className="card-chip" />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="card-brand-badge">
                    <GraduationCap style={{ width: 14, height: 14 }} /> {user.schoolCode || 'CampusPay'}
                  </span>
                  {isLocked ? (
                    <span className="wallet-locked-badge"><LockKeyhole style={{ width: 10, height: 10 }} /> Locked</span>
                  ) : (
                    <span className="wallet-active-badge"><CheckCircle2 style={{ width: 10, height: 10 }} /> Active</span>
                  )}
                </div>
              </div>

              <div className="balance-section">
                <div className="balance-label-row">
                  <small>Available Balance</small>
                  <button
                    type="button"
                    className="balance-privacy-btn"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <EyeOff /> : <Eye />} {showBalance ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="main-balance-val">{balanceDisplay}</div>
                <div className="card-wallet-id">
                  <span>{displayWalletNumber}</span>
                  <button
                    type="button"
                    title="Copy wallet number"
                    onClick={() => {
                      navigator.clipboard.writeText(displayWalletNumber);
                      notify('Wallet number copied to clipboard');
                    }}
                  >
                    <Copy style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>

              <div className="quick-actions-bar">
                <button
                  type="button"
                  className="action-pill"
                  disabled={lockBusy}
                  onClick={toggleLockWallet}
                >
                  {lockBusy ? (
                    <><i className="spinner light" style={{ width: 12, height: 12 }} /> Updating…</>
                  ) : (
                    <><LockKeyhole style={{ width: 14, height: 14 }} /> {isLocked ? 'Unlock wallet' : 'Lock wallet'}</>
                  )}
                </button>
                <button
                  type="button"
                  className="action-pill"
                  onClick={() => setWalletView('qr')}
                >
                  <QrCode style={{ width: 14, height: 14 }} /> Receive with QR
                </button>
              </div>
            </div>
          ) : (
            <div className="wallet-qr-display">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="paystack-trust-pill">
                  {user.role === 'Merchant' ? 'Merchant Payment QR' : 'Peer-to-Peer Receive QR'}
                </span>
                <span style={{ fontSize: '12px', color: '#68807a', fontWeight: 600 }}>{user.schoolCode}</span>
              </div>

              <div className="wallet-qr-frame">
                {qrLoading ? (
                  <div style={{ color: '#627974', fontSize: '13px' }}><i className="spinner" /> Loading QR…</div>
                ) : qrUrl ? (
                  <img src={qrUrl} alt="CampusPay QR Code" className="wallet-qr-img" />
                ) : (
                  <QrCode style={{ width: 90, height: 90, color: '#133a35' }} />
                )}
              </div>

              <h3 style={{ margin: '8px 0 2px', font: '800 18px Manrope, sans-serif' }}>{user.firstname} {user.lastname}</h3>
              <p style={{ margin: 0, color: '#627974', fontSize: '13px' }}>Scan with CampusPay to transfer directly to this wallet</p>

              <div className="wallet-qr-actions">
                <button type="button" className="primary" onClick={downloadQrCode}>
                  <Download style={{ width: 15, height: 15 }} /> Download QR PNG
                </button>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(displayWalletNumber);
                    notify('Wallet number copied to clipboard');
                  }}
                >
                  <Copy style={{ width: 14, height: 14 }} /> Copy Wallet ID
                </button>
              </div>
            </div>
          )}

          <div className="panel" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ margin: 0 }}>Wallet Transactions</h2>
              <button
                type="button"
                className="outline"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={loadWalletData}
                title="Refresh transaction history"
              >
                <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
              </button>
            </div>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#627974' }}>
                <i className="spinner" /> Loading transactions…
              </div>
            ) : (
              <Tx rows={rows} />
            )}
          </div>
        </div>

        {/* Side Info Column */}
        <div className="side-info-card">
          <div className="side-card-section">
            <span className="side-card-title">Account verification</span>
            <b style={{ color: '#143b35', fontSize: '14px' }}>
              {user.role === 'Merchant' ? 'Approved Campus Merchant' : 'Tier 2 Campus Student Wallet'}
            </b>
            <small style={{ color: '#5f756f' }}>
              Verified with Matric/Account details at {user.schoolCode}.
            </small>
          </div>

          <div className="side-card-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span className="side-card-title">Daily spending limit</span>
              <b>₦{spentToday.toLocaleString()} / ₦{dailyLimit.toLocaleString()}</b>
            </div>
            <div className="limit-progress-bar">
              <div className="limit-progress-fill" style={{ width: `${limitPercent}%` }} />
            </div>
            <small style={{ color: '#68807a' }}>₦{remainingToday.toLocaleString()} remaining for today.</small>
          </div>

          {/* Connected Swagger POST /api/v1.0/Wallet/Search/WalletNumber Widget */}
          <div className="wallet-lookup-card">
            <h3><Search style={{ width: 15, height: 15 }} /> Verify Recipient Wallet</h3>
            <p style={{ fontSize: '12px', color: '#627974', margin: '0 0 10px' }}>
              Verify any classmate or campus merchant wallet ID before sending funds.
            </p>
            <form onSubmit={handleVerifyRecipient} className="wallet-lookup-form">
              <input
                value={searchWalletVal}
                onChange={(e) => setSearchWalletVal(e.target.value)}
                placeholder="Wallet ID (e.g. WAL-...)"
              />
              <button type="submit" className="primary" disabled={searchBusy} style={{ padding: '8px 14px' }}>
                {searchBusy ? <i className="spinner light" /> : 'Verify'}
              </button>
            </form>

            {searchResult && (
              <div className="lookup-result">
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#dfffbb', color: '#143b35', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '13px' }}>
                  {(searchResult.firstName || 'W')[0]}{(searchResult.lastName || 'U')[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: '13px', color: '#123732', display: 'block' }}>
                    {[searchResult.firstName, searchResult.lastName].filter(Boolean).join(' ') || 'Campus User'}
                  </b>
                  <small style={{ color: '#627974', fontSize: '11px' }}>
                    {searchResult.walletNumber} • {searchResult.schoolCode}
                  </small>
                </div>
                <span className="paystack-trust-pill" style={{ fontSize: '10px' }}>Verified</span>
              </div>
            )}
          </div>

          <div className="side-card-section" style={{ marginTop: '16px' }}>
            <span className="side-card-title">Security controls</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span>2-Factor PIN for transfers</span>
              <span className="paystack-trust-pill">Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span>Encrypted Session Storage</span>
              <span className="paystack-trust-pill">Active</span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function Money({kind,notify}:{kind:string;notify:(s:string,bad?:boolean)=>void}){
  const isDeposit = kind === 'Deposit';
  const isWithdrawal = kind === 'Withdrawal';
  const isTransfer = kind === 'Transfer';
  const title = kind === 'scan_to_charge' ? 'Scan to charge' : kind;

  const [phase, setPhase] = useState<'form'|'paystack_waiting'|'loading'|'success'|'failed'>('form');
  const [details, setDetails] = useState({ amount: '0', wallet: '', paymentUrl: '', reference: '' });
  const [amountValue, setAmountValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [wallet, setWallet] = useState<{ balance?: number; walletNumber?: string } | null>(null);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const n = useNavigate();

  // Load live wallet and transactions for dynamic balance and daily limit calculations
  const loadAccountData = async () => {
    try {
      const [wData, hData] = await Promise.all([
        api<any>('/Wallet/Wallet').catch(() => api<any>('/Wallet/wallet').catch(() => null)),
        api<any>('/Transaction/history').catch(() => api<any>('/Wallet/transactions').catch(() => null))
      ]);
      setWallet(wData?.data ?? wData);
      const list = Array.isArray(hData?.data) ? hData.data : Array.isArray(hData) ? hData : [];
      setUserTransactions(list);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void loadAccountData();
  }, [phase]);

  // Compute live daily spending from backend transactions
  const today = new Date().toDateString();
  const spentToday = userTransactions
    .filter((t: any) => {
      const dateVal = t.createdAt || t.CreatedAt || t.date || '';
      const d = new Date(dateVal);
      const isToday = d.toDateString() === today || String(dateVal).toLowerCase().includes('today');
      const amt = typeof t.amount === 'number' ? t.amount : typeof t.Amount === 'number' ? t.Amount : 0;
      const type = t.type ?? t.Type;
      return isToday && (amt < 0 || type === 1 || type === 2);
    })
    .reduce((acc: number, t: any) => {
      const amt = typeof t.amount === 'number' ? t.amount : typeof t.Amount === 'number' ? t.Amount : 0;
      return acc + Math.abs(amt);
    }, 0);

  const dailyLimit = 100000;
  const remainingToday = Math.max(0, dailyLimit - spentToday);
  const limitProgressPercent = Math.min(100, Math.round((spentToday / dailyLimit) * 100));

  const handleBeneficiaryClick = (walletNum: string) => {
    const input = document.querySelector('input[name="ReceiverWalletNumber"]') as HTMLInputElement;
    if (input) input.value = walletNum;
    notify(`Selected beneficiary: ${walletNum}`);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const enteredAmount = String(f.get('Amount') || amountValue || '0').trim();
    const numAmount = Number(enteredAmount);

    if (numAmount <= 0) {
      notify('Please enter a valid amount greater than ₦0.', true);
      return;
    }

    setDetails(prev => ({
      ...prev,
      amount: enteredAmount,
      wallet: String(f.get('ReceiverWalletNumber') || f.get('WalletNumber') || 'Your account')
    }));

    if (isDeposit) {
      setPhase('loading');
      try {
        const res = await api<any>('/Transaction/Deposit', {
          method: 'POST',
          body: JSON.stringify({ amount: numAmount })
        });
        const data = res?.data ?? res;
        const payUrl = data?.paymentUrl || data?.authorizationUrl || '';
        const payRef = data?.paymentReference || data?.reference || '';

        setDetails(prev => ({ ...prev, paymentUrl: payUrl, reference: payRef }));

        if (payUrl) {
          window.open(payUrl, '_blank');
          setPhase('paystack_waiting');
        } else {
          // If no paymentUrl returned from backend, check if response indicates failure
          if (res?.succeeded === false || res?.status === 2) {
            setErrorMessage(res?.message || 'Deposit could not be initiated.');
            setPhase('failed');
          } else {
            setPhase('success');
            void loadAccountData();
          }
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to initialize Paystack deposit.');
        setPhase('failed');
      }
      return;
    }

    if (isWithdrawal) {
      setPhase('loading');
      try {
        const res = await api<any>('/Transaction/Withdrawal', {
          method: 'POST',
          body: JSON.stringify({
            amount: numAmount,
            pin: String(f.get('Pin') || '').trim()
          })
        });
        if (res?.succeeded === false) {
          throw new Error(res?.message || 'Withdrawal declined by server.');
        }
        const ref = res?.data?.reference || res?.reference || `CP-WTH-${Date.now()}`;
        setDetails(prev => ({ ...prev, reference: ref }));
        setPhase('success');
        void loadAccountData();
      } catch (err: any) {
        setErrorMessage(err?.message || 'Withdrawal failed. Please verify your PIN and balance.');
        setPhase('failed');
      }
      return;
    }

    // Default transfer / scan
    setPhase('loading');
    try {
      const res = await api<any>('/Transaction/' + kind, {
        method: 'POST',
        body: kind === 'scan_to_charge' ? f : JSON.stringify(Object.fromEntries(f))
      });
      if (res?.succeeded === false) {
        throw new Error(res?.message || 'Transaction could not be processed.');
      }
      setPhase('success');
      void loadAccountData();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Transaction could not be completed.');
      setPhase('failed');
    }
  };

  // Strictly verify with Paystack endpoint; DO NOT mark success on failure
  const verifyDepositPayment = async () => {
    if (!details.reference) {
      setErrorMessage('No payment reference found to verify. Please initiate a new deposit.');
      setPhase('failed');
      return;
    }
    setVerifying(true);
    notify('Checking payment confirmation with Paystack…');
    try {
      const res = await api<any>(`/Transaction/verify/Deposit/${encodeURIComponent(details.reference)}`, { method: 'GET' });
      const data = res?.data ?? res;
      
      // Strict check on verification response
      const isSuccess = res?.succeeded === true ||
                        data?.status === 1 ||
                        data?.status === 'success' ||
                        data?.status === 'Successful' ||
                        data?.isSuccessful === true;

      const isPending = data?.status === 0 || data?.status === 'pending' || data?.status === 'Pending';

      if (isSuccess) {
        notify('Paystack payment verified! Wallet credited.');
        setPhase('success');
        void loadAccountData();
      } else if (isPending) {
        setErrorMessage('Payment is still pending on Paystack. If you recently paid, please give it a few seconds and check again.');
        setPhase('failed');
      } else {
        const failureReason = res?.message || data?.message || data?.gatewayResponse || 'Paystack reported that the transaction was not successful or was cancelled.';
        setErrorMessage(failureReason);
        setPhase('failed');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Unable to confirm payment with Paystack. Please ensure you completed the transaction.';
      setErrorMessage(errMsg);
      setPhase('failed');
    } finally {
      setVerifying(false);
    }
  };

  // Failed UI State
  if (phase === 'failed') {
    return (
      <Page>
        <div className="transaction-state failed-state">
          <div className="failed-ring">
            <X style={{ width: 34, height: 34, color: '#c83e32' }} />
          </div>
          <span className="failed-tag">TRANSACTION NOT COMPLETED</span>
          <h2>Payment Verification Unsuccessful</h2>
          <p style={{ maxWidth: '460px', margin: '8px auto 20px', color: '#617570', fontSize: '14px', lineHeight: 1.6 }}>
            {errorMessage || 'Paystack could not confirm this transaction. If you did not finish payment or your bank declined it, no wallet funds were credited.'}
          </p>

          <div className="receipt-card failed-card">
            <div className="receipt-head-row">
              <span className="receipt-badge-failed">
                <AlertCircle style={{ width: 13, height: 13 }} /> Transaction Failed
              </span>
              <span className="receipt-date">{new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <div className="receipt-amount-row">
              <span>Attempted Amount</span>
              <b className="receipt-big-amount">₦{Number(details.amount).toLocaleString()}.00</b>
            </div>
            {details.reference && (
              <div className="receipt-ref-row">
                <span>Reference</span>
                <div className="receipt-ref-copy">
                  <code>{details.reference}</code>
                  <button
                    type="button"
                    className="icon-copy-btn"
                    title="Copy reference"
                    onClick={() => {
                      navigator.clipboard?.writeText(details.reference || '');
                      notify('Reference copied to clipboard');
                    }}
                  >
                    <Copy style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            )}
            <div><span>Status</span><em className="failed-status"><i /> Not completed</em></div>
          </div>

          <div className="success-actions">
            <button
              className="primary"
              onClick={() => {
                setPhase('form');
                setErrorMessage('');
              }}
            >
              Try deposit again
            </button>
            {isDeposit && details.reference && (
              <button
                className="outline"
                disabled={verifying}
                onClick={verifyDepositPayment}
              >
                {verifying ? <><i className="spinner" /> Checking…</> : <>Check Paystack again <RefreshCw style={{ width: 14, height: 14 }} /></>}
              </button>
            )}
            <button
              className="outline"
              onClick={() => n('/app')}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </Page>
    );
  }

  // Paystack Waiting Modal / Screen
  if (phase === 'paystack_waiting') {
    return (
      <Page>
        <Head over="PAYSTACK CHECKOUT" title="Awaiting payment confirmation" />
        <div className="formcard" style={{ maxWidth: '640px', margin: 'auto', textAlign: 'center', padding: '36px 24px' }}>
          <div className="paystack-badge-icon" style={{ width: '54px', height: '54px', fontSize: '26px', margin: '0 auto 18px', borderRadius: '14px' }}>
            P
          </div>
          <span className="paystack-trust-pill">Paystack Checkout Active</span>
          <h2 style={{ fontSize: '24px', margin: '14px 0 8px' }}>Amount: ₦{Number(details.amount).toLocaleString()}.00</h2>
          <p style={{ color: '#5f756f', maxWidth: '440px', margin: '0 auto 24px' }}>
            A secure Paystack checkout tab has been opened. Complete your card or bank payment, then click the confirmation button below.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px', margin: 'auto' }}>
            <button
              type="button"
              className="primary"
              disabled={verifying}
              onClick={verifyDepositPayment}
            >
              {verifying ? <><i className="spinner light" /> Confirming with Paystack…</> : <>I have completed payment <Check /></>}
            </button>
            {details.paymentUrl && (
              <button
                type="button"
                className="outline"
                onClick={() => window.open(details.paymentUrl, '_blank')}
              >
                Re-open Paystack checkout <ArrowRight />
              </button>
            )}
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#68807a', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
              onClick={() => setPhase('form')}
            >
              Cancel deposit
            </button>
          </div>
        </div>
      </Page>
    );
  }

  if (phase === 'loading') {
    return (
      <Page>
        <div className="transaction-state">
          <div className="payment-loader"><i/><i/><i/><WalletCards/></div>
          <span>PROCESSING SECURELY</span>
          <h2>Connecting to payment network…</h2>
          <p>Please keep this page open while we communicate with the payment gateway.</p>
          <div className="loading-steps">
            <b className="done"><Check/>Details prepared</b>
            <b className="active"><i/>Connecting to Paystack</b>
            <b>Verifying authorization</b>
          </div>
        </div>
      </Page>
    );
  }

  if (phase === 'success') {
    return (
      <Page>
        <div className="transaction-state success-state">
          <div className="success-ring"><Check/></div>
          <span>TRANSACTION SUCCESSFUL</span>
          <h2>{isDeposit ? 'Deposit confirmed' : isWithdrawal ? 'Withdrawal processed' : isTransfer ? 'Transfer complete' : `${title} complete`}</h2>
          <p>{isDeposit ? 'Funds have been added to your CampusPay wallet via Paystack.' : 'Your transaction was completed successfully.'}</p>
          <div className="receipt-card">
            <div className="receipt-head-row">
              <span className="receipt-badge-status">
                <Check style={{ width: 13, height: 13 }} /> Verified Transaction
              </span>
              <span className="receipt-date">{new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <div className="receipt-amount-row">
              <span>Amount Paid</span>
              <b className="receipt-big-amount">₦{Number(details.amount).toLocaleString()}.00</b>
            </div>
            <div>
              <span>{isTransfer ? 'Recipient' : isDeposit ? 'Channel' : 'Settlement Destination'}</span>
              <b>{isDeposit ? 'Paystack Gateway' : details.wallet}</b>
            </div>
            <div className="receipt-ref-row">
              <span>Reference</span>
              <div className="receipt-ref-copy">
                <code>{details.reference || `CP-${Math.random().toString(36).slice(2,8).toUpperCase()}`}</code>
                <button
                  type="button"
                  className="icon-copy-btn"
                  title="Copy reference"
                  onClick={() => {
                    navigator.clipboard?.writeText(details.reference || '');
                    notify('Reference copied to clipboard');
                  }}
                >
                  <Copy style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>
            <div><span>Status</span><em><i /> Successful</em></div>
          </div>
          <div className="success-actions">
            <button className="primary" onClick={() => { setPhase('form'); setAmountValue(''); notify('Ready for another transaction'); }}>
              Make another transaction
            </button>
            <button className="outline" onClick={() => window.print()} title="Print or save receipt">
              <Printer style={{ width: 15, height: 15 }} /> Print Receipt
            </button>
            <button className="outline" onClick={() => n('/app/transactions')}>
              Activity <ArrowRight/>
            </button>
          </div>
        </div>
      </Page>
    );
  }

  const currentAvailableBalance = typeof wallet?.balance === 'number' ? wallet.balance : 0;

  return (
    <Page>
      <Head over={isDeposit ? 'PAYSTACK DEPOSIT' : isWithdrawal ? 'PAYSTACK PAYOUT' : 'SECURE TRANSFER'} title={isDeposit ? 'Add money to wallet' : isWithdrawal ? 'Withdraw to bank' : title} />

      <div className="ops-grid">
        {/* Main Action Form Card */}
        <div className="formcard transaction-form" style={{ marginTop: 0 }}>
          {isDeposit && (
            <div className="paystack-card-banner">
              <div>
                <span className="paystack-badge-icon">P</span>
                <span className="paystack-banner-text">
                  <b>Powered by Paystack</b>
                  <small>Cards, Bank Transfer, USSD & Apple Pay</small>
                </span>
              </div>
              <span className="paystack-trust-pill">Level 1 PCI-DSS</span>
            </div>
          )}

          {isWithdrawal && (
            <div className="paystack-card-banner">
              <div>
                <i><Landmark style={{ width: 22, height: 22, color: '#143b35' }} /></i>
                <span className="paystack-banner-text">
                  <b>Instant Paystack Bank Settlement</b>
                  <small>Funds transferred directly to your registered bank account</small>
                </span>
              </div>
              <span className="paystack-trust-pill">Fast Payout</span>
            </div>
          )}

          {/* Transfer Beneficiaries Shortcut */}
          {isTransfer && (
            <div className="beneficiary-section">
              <span>Quick send to campus peers:</span>
              <div className="beneficiary-row">
                {[
                  { name: 'Tobi M.', wallet: 'WAL-10724' },
                  { name: 'Amara O.', wallet: 'WAL-10918' },
                  { name: 'Seyi C.', wallet: 'WAL-11042' },
                  { name: 'Campus Print', wallet: 'MER-1072' }
                ].map(b => (
                  <button
                    type="button"
                    key={b.wallet}
                    className="beneficiary-btn"
                    onClick={() => handleBeneficiaryClick(b.wallet)}
                  >
                    <span className="beneficiary-avatar">{b.name.charAt(0)}</span>
                    <span className="beneficiary-name">{b.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="form" onSubmit={submit}>
            {(isTransfer || kind === 'scan_to_charge') && (
              <Field
                name={isTransfer ? 'ReceiverWalletNumber' : 'WalletNumber'}
                label="Recipient wallet number"
                icon={WalletCards}
                placeholder="e.g. WAL-82914 or merchant code"
              />
            )}

            {/* Quick Amount Presets */}
            <div className="preset-section">
              <span>Select quick amount:</span>
              <div className="amount-preset-row">
                {(isWithdrawal ? ['2000','5000','10000','25000','50000'] : ['1000','2500','5000','10000','20000']).map(val => (
                  <button
                    type="button"
                    key={val}
                    className="amount-preset-btn"
                    onClick={() => setAmountValue(val)}
                  >
                    ₦{Number(val).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <Field
              name="Amount"
              label={isDeposit ? 'Deposit amount (₦)' : 'Amount (₦)'}
              type="number"
              icon={Banknote}
              value={amountValue || undefined}
              onChange={(e: any) => setAmountValue(e.target.value)}
              placeholder="0.00"
            />

            {isTransfer && (
              <Field name="Description" label="Payment note (optional)" icon={Mail} placeholder="What is this payment for?" />
            )}

            {!isDeposit && (
              <Field name="Pin" label="4-digit Transaction PIN" type="password" icon={KeyRound} placeholder="••••" />
            )}

            <button className="primary" style={{ marginTop: '8px' }}>
              {isDeposit ? <>Continue to Paystack <ArrowRight/></> : isWithdrawal ? <>Confirm withdrawal <ArrowRight/></> : <>Review and send <ArrowRight/></>}
            </button>
          </form>

          <small className="secure-form-note">
            <ShieldCheck/> {isDeposit ? 'Paystack encrypted payment checkout' : 'Protected by encrypted session and transaction PIN'}
          </small>
        </div>

        {/* Right Information & Real Daily Limits Panel */}
        <div className="side-info-card">
          <div className="side-card-section">
            <span className="side-card-title">Live balance</span>
            <b style={{ color: '#133b35', fontSize: '20px', fontFamily: 'Manrope, sans-serif' }}>
              ₦{currentAvailableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </b>
            <small style={{ color: '#5e756f' }}>
              {isDeposit ? 'Funds will be immediately credited here upon Paystack verification.' : 'Available funds for transfer or withdrawal.'}
            </small>
          </div>

          <div className="side-card-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span className="side-card-title">Daily spending limit</span>
              <b>₦{spentToday.toLocaleString()} / ₦{dailyLimit.toLocaleString()}</b>
            </div>
            <div className="limit-progress-bar">
              <div className="limit-progress-fill" style={{ width: `${limitProgressPercent}%` }} />
            </div>
            <small style={{ color: '#68807a' }}>
              ₦{remainingToday.toLocaleString()} available of today's limit.
            </small>
          </div>

          <div className="side-card-section">
            <span className="side-card-title">{isDeposit ? 'Deposit info' : isWithdrawal ? 'Settlement details' : 'Transfer details'}</span>
            <b style={{ color: '#133b35', fontSize: '14px' }}>
              {isDeposit ? '₦0 Processing Fee for Students' : isWithdrawal ? 'Instant Settlement to Bank' : 'Free Campus Peer Transfers'}
            </b>
            <small style={{ color: '#5e756f' }}>
              {isDeposit
                ? 'Pay with Debit Card, USSD, Apple Pay, or direct Bank Transfer through Paystack.'
                : isWithdrawal
                ? 'Earnings are paid out via Paystack Transfers directly into your verified bank account.'
                : 'Zero transaction charges between registered students and merchants on campus.'}
            </small>
          </div>

          <div className="side-card-section">
            <span className="side-card-title">Security & trust</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#19423c' }}>
              <BadgeCheck style={{ width: 16, height: 16, color: '#16855e' }} />
              <span>CBN Licensed Processing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#19423c', marginTop: '4px' }}>
              <ShieldCheck style={{ width: 16, height: 16, color: '#16855e' }} />
              <span>Paystack 256-Bit SSL Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function Lookup({notify}:{notify:(s:string)=>void}){
  const [result,setResult]=useState<{walletNumber?:string;firstName?:string;lastName?:string;schoolCode?:string}|null>(null);
  const [loading,setLoading]=useState(false);
  const n = useNavigate();

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const d=new FormData(e.currentTarget);
    const wallet=String(d.get('wallet')||'').trim();
    if(!wallet){notify('Please enter a wallet number.');return;}
    setLoading(true);
    try{
      const response=await api<any>('/Wallet/lookup',{method:'POST',body:JSON.stringify({walletNumber:wallet})}).catch(()=>api<any>(`/Wallet/lookup?walletNumber=${encodeURIComponent(wallet)}`).catch(()=>api<any>('/Wallet/Search/WalletNumber',{method:'POST',body:JSON.stringify(wallet)}).catch(()=>null)));
      const payload=response?.data??response;
      setResult(payload||null);
      notify(payload?'Wallet found':'Wallet not found');
    }catch(err){
      setResult(null);
      notify(err instanceof ApiError?err.message:'Wallet lookup failed.');
    }finally{
      setLoading(false);
    }
  };

  return (
    <Page>
      <Head over="DIRECTORY LOOKUP" title="Find a campus wallet"/>
      <div className="ops-grid">
        <div className="formcard" style={{ marginTop: 0 }}>
          <form className="form" onSubmit={submit}>
            <Field name="wallet" label="Wallet number" icon={Search} placeholder="Enter recipient wallet number (e.g. WAL-10294 or MER-1072)" />
            <button className="primary" disabled={loading}>
              {loading ? <><i className="spinner light"/>Searching…</> : <><Search/>Search wallet</>}
            </button>
          </form>

          {result && (
            <div className="lookup-result-card">
              <div className="lookup-avatar">
                {(result.firstName||'U').charAt(0)}{(result.lastName||'W').charAt(0)}
              </div>
              <div className="lookup-info">
                <h3>{[result.firstName, result.lastName].filter(Boolean).join(' ') || 'Wallet Owner'}</h3>
                <p>{result.walletNumber || '—'} • {result.schoolCode || 'Campus Verified'}</p>
              </div>
              <button
                type="button"
                className="lookup-action-btn"
                onClick={() => n('/app/transfer')}
              >
                <Send style={{ width: 14, height: 14 }} /> Send money
              </button>
            </div>
          )}
        </div>

        <div className="side-info-card">
          <div className="side-card-section">
            <span className="side-card-title">Directory tips</span>
            <b style={{ color: '#133b35', fontSize: '14px' }}>Peer & Merchant Verification</b>
            <small style={{ color: '#5e756f' }}>
              Search for any classmate by wallet ID, or find on-campus shops like Cafeteria, Tech Hub, and Campus Print.
            </small>
          </div>
          <div className="side-card-section">
            <span className="side-card-title">Popular campus shops</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <b>Green Bowl Café</b>
                <code style={{ color: '#167a5b' }}>MER-1091</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <b>Campus Print Hub</b>
                <code style={{ color: '#167a5b' }}>MER-1072</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <b>QuickFix Gadgets</b>
                <code style={{ color: '#167a5b' }}>MER-1104</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function QR({user, notify}:{user:User; notify:(s:string, bad?:boolean)=>void}){
  const [qrUrl, setQrUrl] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallbackGenerated, setFallbackGenerated] = useState(false);

  // Generate QR code instantly upon render or amount change
  useEffect(() => {
    let cancelled = false;

    const generateLocalQr = async () => {
      try {
        const payload = customAmount && Number(customAmount) > 0
          ? `campuspay:pay?wallet=${user.walletNumber}&amount=${customAmount}`
          : `campuspay:wallet:${user.walletNumber}`;

        const dataUrl = await QRCode.toDataURL(payload, {
          width: 400,
          margin: 2,
          color: { dark: '#123b36', light: '#ffffff' }
        });

        if (!cancelled) {
          setQrUrl(dataUrl);
          setFallbackGenerated(true);
        }
      } catch (err) {
        console.error('Failed to generate local QR:', err);
      }
    };

    const loadOfficialOrLocal = async () => {
      // First, immediately show the local high-contrast QR code (0ms delay, no broken image!)
      await generateLocalQr();

      // If no custom amount and is merchant, attempt official Swagger GET /api/v1.0/Merchant/View/qrcode
      if (!customAmount && user.role === 'Merchant') {
        try {
          const blob = await apiBlob('/Merchant/View/qrcode').catch(() => null);
          if (!cancelled && blob && blob.type && blob.type.startsWith('image/') && blob.size > 500) {
            setQrUrl(URL.createObjectURL(blob));
          }
        } catch {
          // Already using local high-res QR code
        }
      }
    };

    loadOfficialOrLocal();
    return () => { cancelled = true; };
  }, [user.walletNumber, user.role, customAmount]);

  // Image error handler to ensure a broken image icon is NEVER displayed
  const handleImageError = async () => {
    try {
      const payload = customAmount && Number(customAmount) > 0
        ? `campuspay:pay?wallet=${user.walletNumber}&amount=${customAmount}`
        : `campuspay:wallet:${user.walletNumber}`;

      const dataUrl = await QRCode.toDataURL(payload, {
        width: 400,
        margin: 2,
        color: { dark: '#123b36', light: '#ffffff' }
      });
      setQrUrl(dataUrl);
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (!customAmount && user.role === 'Merchant') {
        const blob = await apiBlob('/Merchant/qrcode').catch(() => null);
        if (blob && blob.type && blob.type.startsWith('image/') && blob.size > 500) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'CampusPay-Official-QRCode.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          notify('Official Merchant QR Code downloaded');
          return;
        }
      }

      // Download from live QR data URL
      if (qrUrl) {
        const a = document.createElement('a');
        a.href = qrUrl;
        a.download = `CampusPay-Standee-${user.walletNumber}${customAmount ? `-${customAmount}NGN` : ''}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        notify('Payment QR Code downloaded');
      }
    } catch {
      notify('Download failed', true);
    } finally {
      setDownloading(false);
    }
  };

  const copyWallet = () => {
    navigator.clipboard?.writeText(user.walletNumber);
    setCopied(true);
    notify('Wallet ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPayLink = () => {
    const link = `https://campuspay.ng/pay/${user.walletNumber}${customAmount ? `?amt=${customAmount}` : ''}`;
    navigator.clipboard?.writeText(link);
    notify('Payment link copied to clipboard');
  };

  return (
    <Page>
      <Head over="MERCHANT COUNTER TERMINAL" title="Counter Payment Standee" />

      <div className="qr-terminal-grid">
        {/* Left Column: Physical Counter Standee Card */}
        <div className="standee-card-pro">
          <div className="standee-brand-badge">
            <BrandIcon />
            <span>CampusPay Official Terminal</span>
          </div>

          <h2 style={{ font: '800 24px Manrope, sans-serif', margin: '4px 0 2px', color: '#123732' }}>
            {user.businessName || `${user.firstname} ${user.lastname}`}
          </h2>
          <p style={{ color: '#657e78', fontSize: '13px', margin: '0 0 10px' }}>
            {user.shopLocation ? `${user.shopLocation} • ${user.schoolCode}` : `School: ${user.schoolCode}`}
          </p>

          {customAmount && Number(customAmount) > 0 && (
            <div className="standee-amount-tag">
              Amount to Pay: ₦{Number(customAmount).toLocaleString()}.00
            </div>
          )}

          <div className="standee-qr-frame-pro">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="CampusPay QR Code"
                className="standee-qr-img-pro"
                onError={handleImageError}
              />
            ) : (
              <div style={{ color: '#627974', fontSize: '13px' }}><i className="spinner" /> Generating QR…</div>
            )}
            <span className="standee-scan-badge">Scan with CampusPay</span>
          </div>

          <div>
            <div className="standee-wallet-pill">
              <span>{user.walletNumber}</span>
              <button
                type="button"
                className="icon-copy-btn"
                title="Copy wallet number"
                onClick={copyWallet}
              >
                {copied ? <Check style={{ width: 13, height: 13, color: '#1a7768' }} /> : <Copy style={{ width: 13, height: 13 }} />}
              </button>
            </div>
          </div>

          <div className="standee-actions-grid">
            <button type="button" className="primary" disabled={downloading} onClick={handleDownload}>
              {downloading ? <><i className="spinner light" /> Downloading…</> : <><Download style={{ width: 15, height: 15 }} /> Download PNG</>}
            </button>
            <button type="button" className="outline" onClick={() => window.print()} title="Print acrylic counter standee">
              <Printer style={{ width: 15, height: 15 }} /> Print Standee
            </button>
            <button type="button" className="outline full" onClick={copyPayLink}>
              <Send style={{ width: 14, height: 14 }} /> Copy Direct Payment Link
            </button>
          </div>
        </div>

        {/* Right Column: Customer Guidance & Invoice Tools */}
        <div>
          {/* Customer How to Pay Guide */}
          <div className="qr-guide-card">
            <h3><CheckCircle2 style={{ width: 18, height: 18, color: '#1b7768' }} /> How Customers Pay at Counter</h3>
            <div className="qr-steps-list">
              <div className="qr-step-item">
                <span className="qr-step-num">1</span>
                <div className="qr-step-copy">
                  <b>Open CampusPay App</b>
                  <p>Students tap the "Scan & Pay" button on their home dashboard or open their device camera.</p>
                </div>
              </div>
              <div className="qr-step-item">
                <span className="qr-step-num">2</span>
                <div className="qr-step-copy">
                  <b>Scan Counter Standee</b>
                  <p>Point camera at this standee. Your store name and wallet ID will be automatically recognized.</p>
                </div>
              </div>
              <div className="qr-step-item">
                <span className="qr-step-num">3</span>
                <div className="qr-step-copy">
                  <b>Authorize with 4-Digit PIN</b>
                  <p>Customer enters transaction amount and their secret PIN to instantly transfer funds with 0% fee.</p>
                </div>
              </div>
              <div className="qr-step-item">
                <span className="qr-step-num">4</span>
                <div className="qr-step-copy">
                  <b>Instant Credit & Receipt</b>
                  <p>Payment settles to your merchant wallet within 1 second. Both parties receive official digital receipts.</p>
                </div>
              </div>
            </div>

            {/* Custom Amount QR Generator */}
            <div className="qr-custom-amount-box">
              <b style={{ fontSize: '13px', color: '#143b35', display: 'block' }}>Generate Specific Amount Invoice</b>
              <small style={{ color: '#68807a', display: 'block', marginBottom: '8px' }}>
                Preset an amount so the customer doesn't have to type it:
              </small>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter exact bill amount (₦)"
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '9px', border: '1px solid #c9d8d1', fontSize: '13px' }}
                />
                {customAmount && (
                  <button
                    type="button"
                    className="outline"
                    onClick={() => setCustomAmount('')}
                    style={{ padding: '8px 12px', fontSize: '12px' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="qr-amount-chips">
                {['500', '1000', '2500', '5000', '10000'].map(val => (
                  <button
                    type="button"
                    key={val}
                    className={`qr-chip-btn ${customAmount === val ? 'active' : ''}`}
                    onClick={() => setCustomAmount(customAmount === val ? '' : val)}
                  >
                    ₦{Number(val).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Counter Terminal Security & Benefits */}
          <div className="qr-guide-card">
            <h3><ShieldCheck style={{ width: 18, height: 18, color: '#1b7768' }} /> CampusPay Terminal Security</h3>
            <div className="qr-perks-grid">
              <div className="qr-perk-item">
                <i><Zap style={{ width: 18, height: 18 }} /></i>
                <b>Zero Cash Hassle</b>
                <small>No change shortages or cash counterfeit risks on campus.</small>
              </div>
              <div className="qr-perk-item">
                <i><BadgeCheck style={{ width: 18, height: 18 }} /></i>
                <b>Bank Settlement</b>
                <small>Withdraw earnings directly to your commercial bank account anytime.</small>
              </div>
              <div className="qr-perk-item">
                <i><LockKeyhole style={{ width: 18, height: 18 }} /></i>
                <b>PIN Protected</b>
                <small>Every student transfer is verified by device PIN encryption.</small>
              </div>
              <div className="qr-perk-item">
                <i><FileText style={{ width: 18, height: 18 }} /></i>
                <b>Automatic Bookkeeping</b>
                <small>Every scan is logged in your Activity dashboard with references.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function Schools({notify}:{notify:(s:string)=>void}){
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchSchools = () => {
    setLoading(true);
    api<any>('/School', { method: 'GET' })
      .then((res: any) => {
        const payload = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setList(payload);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setBusy(true);
    try {
      await api('/School/Add', { method: 'POST', body: JSON.stringify({ name: name.trim(), code: code.trim().toUpperCase() }) });
      notify('School added successfully');
      setName('');
      setCode('');
      setShowAdd(false);
      fetchSchools();
    } catch (err: any) {
      notify(err?.message || 'Failed to add school');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api(`/School/Delete/${id}`, { method: 'DELETE' });
      notify('School removed');
      fetchSchools();
    } catch (err: any) {
      notify(err?.message || 'Failed to delete school');
    }
  };

  return (
    <Page>
      <Head over="ADMINISTRATION" title="Schools" />
      <div className="panel list">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}><i className="spinner" /> Loading schools…</div>
        ) : list.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No partner schools registered yet.</div>
        ) : (
          list.map((s) => (
            <div key={s.id || s.schoolId || s.code}>
              <i><GraduationCap /></i>
              <span><b>{s.name}</b><small>{s.code}</small></span>
              <em>Active</em>
              <button onClick={() => handleRemove(s.id || s.schoolId)}>Remove</button>
            </div>
          ))
        )}
        {showAdd ? (
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', padding: '12px 0', flexWrap: 'wrap' }}>
            <input placeholder="School Name (e.g. University of Ibadan)" value={name} onChange={e => setName(e.target.value)} required style={{ flex: 2, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input placeholder="Code (e.g. UI)" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <button type="submit" className="primary" disabled={busy}>{busy ? 'Adding…' : 'Save'}</button>
            <button type="button" onClick={() => setShowAdd(false)}>Cancel</button>
          </form>
        ) : (
          <button className="primary" onClick={() => setShowAdd(true)}><Plus />Add school</button>
        )}
      </div>
    </Page>
  );
}

function Approvals({notify}:{notify:(s:string)=>void}){
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMerchants = () => {
    setLoading(true);
    api<any>('/SchoolAdmin/merchants', { method: 'GET' })
      .then((res: any) => {
        const payload = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setList(payload);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api(`/SchoolAdmin/ApproveMerchant?merchantId=${id}`, { method: 'POST' });
      notify('Merchant approved successfully');
      fetchMerchants();
    } catch (err: any) {
      notify(err?.message || 'Failed to approve merchant');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api(`/SchoolAdmin/RejectMerchant?merchantId=${id}`, { method: 'POST' });
      notify('Merchant rejected');
      fetchMerchants();
    } catch (err: any) {
      notify(err?.message || 'Failed to reject merchant');
    }
  };

  return (
    <Page>
      <Head over="SCHOOL ADMIN" title="Merchant approvals" />
      <div className="panel list">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}><i className="spinner" /> Loading merchants…</div>
        ) : list.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No merchants found.</div>
        ) : (
          list.map((m) => {
            const mId = m.id || m.merchantId;
            return (
              <div key={mId || m.email}>
                <i><Store /></i>
                <span><b>{m.businessName}</b><small>{m.email} • {m.shopLocation || 'Campus Store'}</small></span>
                <em>{m.isApproved ? 'Approved' : 'Pending'}</em>
                {!m.isApproved ? (
                  <button className="primary" onClick={() => handleApprove(mId)}>Approve</button>
                ) : (
                  <button onClick={() => handleReject(mId)}>Reject</button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Page>
  );
}

function ProfilePage({ user, save, notify }: { user: User; save: (u: User | null) => void; notify: (s: string, bad?: boolean) => void }) {
  const [tab, setTab] = useState<'details' | 'bank' | 'security'>('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.profilePicture || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Form editable states
  const [firstname, setFirstname] = useState(user.firstname);
  const [lastname, setLastname] = useState(user.lastname);
  const [businessName, setBusinessName] = useState(user.businessName || '');
  const [shopLocation, setShopLocation] = useState(user.shopLocation || '');
  const [profileData, setProfileData] = useState<any>(null);

  // Security Form states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinBusy, setPinBusy] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passBusy, setPassBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const path = user.role === 'Merchant' ? '/Merchant/merchant/profile' : '/Student/profile';
        const res = await api<any>(path, { method: 'GET' }).catch(() => null);
        if (!cancelled && res) {
          const d = res?.data ?? res;
          setProfileData(d);
          if (d.firstname) setFirstname(d.firstname);
          if (d.lastname) setLastname(d.lastname);
          if (d.businessName) setBusinessName(d.businessName);
          if (d.shopLocation) setShopLocation(d.shopLocation);
          const savedPic = localStorage.getItem('cp-avatar-' + user.walletNumber) || d.profilePicture || user.profilePicture;
          if (savedPic) {
            setAvatarPreview(savedPic);
            save({
              ...user,
              firstname: d.firstname || user.firstname,
              lastname: d.lastname || user.lastname,
              profilePicture: savedPic,
              matricNumber: d.matricNumber || user.matricNumber,
              businessName: d.businessName || user.businessName,
              shopLocation: d.shopLocation || user.shopLocation,
              schoolName: d.schoolName || user.schoolName,
              accountNumber: d.accountNumber || user.accountNumber,
              bankName: d.bankName || user.bankName
            });
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify('Image size must be under 5MB', true);
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setAvatarPreview(dataUrl);
      localStorage.setItem('cp-avatar-' + user.walletNumber, dataUrl);
      save({ ...user, profilePicture: dataUrl });
      notify('Photo selected! Click "Save changes" to submit.');
    };
    reader.readAsDataURL(file);
  };

  const handlePresetGradient = (gradient: string) => {
    const initials = `${firstname[0] || 'C'}${lastname[0] || 'P'}`.toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">${gradient}</linearGradient></defs><rect width="128" height="128" rx="64" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="46" font-family="sans-serif" font-weight="bold">${initials}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatarPreview(dataUrl);
    setAvatarFile(null);
    localStorage.setItem('cp-avatar-' + user.walletNumber, dataUrl);
    save({ ...user, profilePicture: dataUrl });
    notify('Avatar style updated!');
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    localStorage.removeItem('cp-avatar-' + user.walletNumber);
    save({ ...user, profilePicture: undefined });
    notify('Profile photo removed');
  };

  const handleCopyWallet = () => {
    navigator.clipboard?.writeText(user.walletNumber);
    setCopied(true);
    notify('Wallet Number copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatePath = user.role === 'Merchant' ? '/Merchant/update_merchant_profile' : '/Student/update_profile';
      const fd = new FormData();
      fd.append('Firstname', firstname);
      fd.append('Lastname', lastname);
      if (avatarFile) {
        fd.append('ProfilePicture', avatarFile);
      }
      if (user.role === 'Merchant') {
        if (businessName) fd.append('BusinessName', businessName);
        if (shopLocation) fd.append('ShopLocation', shopLocation);
      }

      await api(updatePath, { method: 'POST', body: fd }).catch(async () => {
        const payload: any = { firstname, lastname };
        if (user.role === 'Merchant') {
          payload.businessName = businessName;
          payload.shopLocation = shopLocation;
        }
        return api(updatePath, { method: 'POST', body: JSON.stringify(payload) });
      });

      if (avatarPreview) {
        localStorage.setItem('cp-avatar-' + user.walletNumber, avatarPreview);
      }

      const updatedUser: User = {
        ...user,
        firstname,
        lastname,
        businessName,
        shopLocation,
        profilePicture: avatarPreview || user.profilePicture
      };
      save(updatedUser);
      notify('Profile updated successfully!');
    } catch (err: any) {
      notify(err?.message || 'Failed to update profile', true);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      notify('PIN must be exactly 4 digits', true);
      return;
    }
    setPinBusy(true);
    try {
      await api('/Account/change_pin', {
        method: 'POST',
        body: JSON.stringify({ currentPin, newPin })
      }).catch(async () => {
        return api('/Account/ChangePin', {
          method: 'POST',
          body: JSON.stringify({ currentPin, newPin })
        });
      });
      notify('Transaction PIN changed successfully!');
      setCurrentPin('');
      setNewPin('');
    } catch (err: any) {
      notify(err?.message || 'Failed to change PIN. Verify current PIN.', true);
    } finally {
      setPinBusy(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      notify('Please enter both current and new password', true);
      return;
    }
    if (newPass !== confirmPass) {
      notify('New passwords do not match', true);
      return;
    }
    if (newPass.length < 6) {
      notify('Password must be at least 6 characters', true);
      return;
    }
    setPassBusy(true);
    try {
      await api('/Account/change_password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
      });
      notify('Password updated successfully!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      notify(err?.message || 'Failed to update password', true);
    } finally {
      setPassBusy(false);
    }
  };

  return (
    <Page>
      <Head over="ACCOUNT MANAGEMENT" title="My Profile" />

      <div className="profile-grid">
        {/* Left Hero Card */}
        <div className="profile-hero-card">
          <div className="avatar-upload-container">
            {avatarPreview ? (
              <img src={avatarPreview} alt="User avatar" className="avatar-large-img" />
            ) : (
              <div className="avatar-large-placeholder">
                {firstname[0] || user.firstname[0] || 'U'}{lastname[0] || user.lastname[0] || ''}
              </div>
            )}
            <label className="avatar-upload-badge" title="Upload profile photo">
              <Camera style={{ width: 17, height: 17 }} />
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} hidden />
            </label>
          </div>

          <h2 className="profile-hero-name">{firstname} {lastname}</h2>
          <span className="profile-hero-role">
            <BadgeCheck style={{ width: 14, height: 14 }} />
            {user.role === 'Student' ? 'Verified Student' : user.role === 'Merchant' ? 'Approved Merchant' : 'CampusPay Admin'}
          </span>
          <p className="profile-hero-email">
            <Mail style={{ width: 14, height: 14 }} /> {user.email}
          </p>

          {avatarPreview && (
            <button
              type="button"
              onClick={removeAvatar}
              style={{ background: 'none', border: 'none', color: '#c83e32', fontSize: '12px', cursor: 'pointer', marginBottom: '14px' }}
            >
              Remove photo
            </button>
          )}

          {/* Quick Wallet Box */}
          <div className="profile-id-box">
            <span>CampusPay Wallet ID</span>
            <div>
              <strong>{user.walletNumber}</strong>
              <button type="button" className="icon-copy-btn" onClick={handleCopyWallet} title="Copy wallet number">
                {copied ? <Check style={{ width: 13, height: 13, color: '#1a7768' }} /> : <Copy style={{ width: 13, height: 13 }} />}
              </button>
            </div>
          </div>

          {/* Account Tier Box */}
          <div className="profile-limits-box">
            <div className="profile-limits-head">
              <span>Account Status</span>
              <span style={{ color: '#177562', fontWeight: 700 }}>Tier 2 Verified</span>
            </div>
            <small style={{ color: '#748b85', fontSize: '11px', display: 'block', lineHeight: 1.4 }}>
              Daily transaction allowance of up to ₦100,000 enabled for student and campus merchant accounts.
            </small>
          </div>
        </div>

        {/* Right Main Tabs Panel */}
        <div className="profile-main-panel">
          <div className="profile-tab-header">
            <button
              className={`profile-tab-btn ${tab === 'details' ? 'active' : ''}`}
              onClick={() => setTab('details')}
            >
              <UserRound style={{ width: 15, height: 15 }} /> Personal Info
            </button>
            <button
              className={`profile-tab-btn ${tab === 'bank' ? 'active' : ''}`}
              onClick={() => setTab('bank')}
            >
              <Building style={{ width: 15, height: 15 }} /> Bank & Payouts
            </button>
            <button
              className={`profile-tab-btn ${tab === 'security' ? 'active' : ''}`}
              onClick={() => setTab('security')}
            >
              <ShieldCheck style={{ width: 15, height: 15 }} /> Security & PIN
            </button>
          </div>

          {/* Tab 1: Personal Details */}
          {tab === 'details' && (
            <form onSubmit={handleSaveDetails}>
              {/* Preset Avatar Selection */}
              <div className="avatar-preset-section">
                <small>Or choose a stylized gradient avatar:</small>
                <div className="avatar-preset-grid">
                  {[
                    ['#123b36, #1c7768', '<stop offset="0%" stop-color="#123b36"/><stop offset="100%" stop-color="#1c7768"/>'],
                    ['#0f4c81, #2086e9', '<stop offset="0%" stop-color="#0f4c81"/><stop offset="100%" stop-color="#2086e9"/>'],
                    ['#572078, #9b51e0', '<stop offset="0%" stop-color="#572078"/><stop offset="100%" stop-color="#9b51e0"/>'],
                    ['#b45309, #f59e0b', '<stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#f59e0b"/>'],
                    ['#047857, #10b981', '<stop offset="0%" stop-color="#047857"/><stop offset="100%" stop-color="#10b981"/>']
                  ].map(([bg, stops], i) => (
                    <div
                      key={i}
                      className="avatar-preset-item"
                      style={{ background: `linear-gradient(135deg, ${bg})` }}
                      onClick={() => handlePresetGradient(stops)}
                      title="Select avatar gradient"
                    >
                      {firstname[0] || 'U'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-form-grid">
                <div className="profile-field">
                  <label>First Name</label>
                  <input
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <input
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="profile-field">
                  <label>Email Address</label>
                  <input value={user.email} disabled title="Contact support to change email" />
                </div>
                <div className="profile-field">
                  <label>School Affiliation</label>
                  <input value={profileData?.schoolName || user.schoolCode} disabled />
                </div>

                {user.role === 'Student' && (
                  <div className="profile-field">
                    <label>Matriculation Number</label>
                    <input value={profileData?.matricNumber || user.matricNumber || 'Verified'} disabled />
                  </div>
                )}

                {user.role === 'Merchant' && (
                  <>
                    <div className="profile-field">
                      <label>Business Name</label>
                      <input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Registered business name"
                      />
                    </div>
                    <div className="profile-field">
                      <label>Shop Location</label>
                      <input
                        value={shopLocation}
                        onChange={(e) => setShopLocation(e.target.value)}
                        placeholder="Campus stall or shop location"
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? <><i className="spinner light" /> Saving…</> : <><Check style={{ width: 16, height: 16 }} /> Save changes</>}
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Bank & Settlement */}
          {tab === 'bank' && (
            <div>
              <div className="bank-card-preview">
                <small>Linked Settlement Account</small>
                <h3>{profileData?.bankName || user.bankName || 'Access Bank Nigeria'}</h3>
                <footer>
                  <span>Account: {profileData?.accountNumber || user.accountNumber || '•••• •••• 8492'}</span>
                  <span>{user.firstname} {user.lastname}</span>
                </footer>
              </div>

              <div className="profile-limits-box">
                <div className="profile-limits-head">
                  <span>Paystack Gateway Status</span>
                  <span style={{ color: '#167760', fontWeight: 700 }}>Connected & Active</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#627974', lineHeight: 1.5 }}>
                  Withdrawals and settlements are securely processed directly to your verified commercial bank account.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Security & Credentials */}
          {tab === 'security' && (
            <div>
              <h3 style={{ fontSize: '17px', margin: '0 0 14px', color: '#143b35' }}>Change 4-digit Transaction PIN</h3>
              <form onSubmit={handleChangePin} style={{ maxWidth: '420px', display: 'grid', gap: '14px', marginBottom: '32px' }}>
                <div className="profile-field">
                  <label>Current 4-digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    required
                  />
                </div>
                <div className="profile-field">
                  <label>New 4-digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    required
                  />
                </div>
                <button type="submit" className="primary" disabled={pinBusy} style={{ width: 'max-content' }}>
                  {pinBusy ? <><i className="spinner light" /> Updating…</> : 'Update Transaction PIN'}
                </button>
              </form>

              <hr style={{ border: 'none', borderTop: '1px solid #e5ece9', margin: '24px 0' }} />

              <h3 style={{ fontSize: '17px', margin: '0 0 14px', color: '#143b35' }}>Change Account Password</h3>
              <form onSubmit={handleChangePassword} style={{ maxWidth: '420px', display: 'grid', gap: '14px' }}>
                <div className="profile-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Current password"
                    required
                  />
                </div>
                <div className="profile-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
                <div className="profile-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button type="submit" className="primary" disabled={passBusy} style={{ width: 'max-content' }}>
                  {passBusy ? <><i className="spinner light" /> Saving…</> : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

function SimpleForm({title,path,fields,notify,danger}:{title:string;path:string;fields:string[];notify:(s:string)=>void;danger?:boolean}){
  const submit = async (e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const payload:any = {};
    try{
      for(const f of fields){
        if(f==='ProfilePicture'){
          const file = d.get('ProfilePicture');
          if(file instanceof File && file.size>0){
            payload.profilePictureBase64 = await new Promise<string>((res,rej)=>{
              const r = new FileReader(); r.onload=()=>res(String(r.result)); r.onerror=()=>rej(new Error('Failed to read profile picture')); r.readAsDataURL(file);
            });
          }
        }else{
          const key = f.charAt(0).toLowerCase()+f.slice(1);
          payload[key] = String(d.get(f)||'').trim();
        }
      }
      if(path) await api(path,{method:'POST',body:JSON.stringify(payload)});
      notify(title+' successful');
      form.reset();
    }catch(err:any){
      notify(err?.message||'Failed to update');
    }
  };
  return <Page><Head over="ACCOUNT MANAGEMENT" title={title}/><div className="formcard"><form className="form" onSubmit={submit}>{fields.map(f=><Field name={f} label={f.replace(/([A-Z])/g,' $1')} type={f.includes('Password')?'password':f==='ProfilePicture'?'file':'text'}/>) }<button className={danger?'danger':'primary'}>{title}</button></form></div></Page>
}
function SettingsPanel({dark,setDark,notify}:{dark:boolean;setDark:(v:boolean)=>void;notify:(s:string)=>void}){const[biometric,setBiometric]=useState(true),[alerts,setAlerts]=useState(true),[marketing,setMarketing]=useState(false);const toggle=(setter:(v:boolean)=>void,value:boolean,label:string)=>{setter(!value);notify(`${label} ${!value?'enabled':'disabled'}`)};const submitPassword=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const d=new FormData(e.currentTarget);const currentPassword=String(d.get('CurrentPassword')||'').trim();const newPassword=String(d.get('NewPassword')||'').trim();if(!currentPassword||!newPassword){notify('Please enter both your current and new password.');return;}try{await api('/Account/change_password',{method:'POST',body:JSON.stringify({currentPassword,newPassword})});notify('Password updated successfully');e.currentTarget.reset()}catch(err){notify(err instanceof ApiError?err.message:'We could not update your password. Please try again.')}};return <Page><Head over="PREFERENCES" title="Settings"/><div className="settings-layout"><section className="settings-panel"><div className="settings-title"><i><Eye/></i><div><h2>Appearance</h2><p>Personalize how CampusPay looks on this device.</p></div></div><SettingRow icon={dark?Moon:Sun} title="Dark mode" copy="Use a low-light theme throughout your dashboard"><Toggle checked={dark} onChange={()=>setDark(!dark)}/></SettingRow><SettingRow icon={Globe2} title="Language" copy="English (Nigeria)"><button className="setting-select">English <ChevronDown/></button></SettingRow></section><section className="settings-panel"><div className="settings-title"><i><ShieldCheck/></i><div><h2>Security & privacy</h2><p>Control how your account is protected.</p></div></div><SettingRow icon={Fingerprint} title="Biometric approval" copy="Confirm supported payments with your device"><Toggle checked={biometric} onChange={()=>toggle(setBiometric,biometric,'Biometric approval')}/></SettingRow><SettingRow icon={LockKeyhole} title="Change password" copy="Last changed 3 months ago"><button className="setting-link" onClick={()=>notify('Password form ready below')}>Update <ArrowRight/></button></SettingRow><form className="settings-password" onSubmit={submitPassword}><Field name="CurrentPassword" label="Current password" type="password"/><Field name="NewPassword" label="New password" type="password"/><button className="primary">Save new password</button></form></section><section className="settings-panel"><div className="settings-title"><i><Bell/></i><div><h2>Notifications</h2><p>Choose which updates you want to receive.</p></div></div><SettingRow icon={BadgeCheck} title="Transaction alerts" copy="Deposits, transfers, withdrawals and charges"><Toggle checked={alerts} onChange={()=>toggle(setAlerts,alerts,'Transaction alerts')}/></SettingRow><SettingRow icon={Bell} title="Product updates" copy="Occasional news and feature announcements"><Toggle checked={marketing} onChange={()=>toggle(setMarketing,marketing,'Product updates')}/></SettingRow></section></div></Page>}
function SettingRow({icon:I,title,copy,children}:{icon:any;title:string;copy:string;children:ReactNode}){return <div className="setting-row"><I/><div><b>{title}</b><small>{copy}</small></div>{children}</div>}
function Toggle({checked,onChange}:{checked:boolean;onChange:()=>void}){return <button type="button" role="switch" aria-checked={checked} className={'toggle '+(checked?'checked':'')} onClick={onChange}><i/></button>}
function Banks(){return <Page><Head over="PAYMENT NETWORK" title="Bank directory"/><div className="panel bankgrid">{['Access Bank • 044','Guaranty Trust Bank • 058','United Bank for Africa • 033','Zenith Bank • 057','Kuda Microfinance Bank • 50211'].map(x=><div><Landmark/><b>{x}</b><BadgeCheck/></div>)}</div></Page>}
function UsersPage(){return <Page><Head over="SCHOOL DIRECTORY" title="School users"/><div className="panel"><Tx/></div></Page>}
