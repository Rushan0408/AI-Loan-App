import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  ArrowLeft, AlertTriangle, CheckCircle, XCircle,
  User, Briefcase, CreditCard, FileText, Brain,
  ClipboardCheck, LogOut, ShieldCheck, Eye,
  TrendingUp, Activity, BadgeCheck, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { officerAPI } from '../services/api';

// ── FONT IMPORT (add to your index.html or global CSS) ─────────────────────
// <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">

function cn(...inputs) { return twMerge(clsx(inputs)); }

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────
const tokens = {
  navy: '#0B1F3A',
  navyMid: '#132D52',
  gold: '#C8963E',
  goldLight: '#F0C96B',
  surface: '#F6F7FA',
  card: '#FFFFFF',
  border: '#E4E7EE',
  muted: '#8A93A6',
  text: '#1A2332',
};

// ── ANIMATION ──────────────────────────────────────────────────────────────
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ── NAVBAR ─────────────────────────────────────────────────────────────────
const AppNavbar = ({ onLogout }) => (
  <nav
    style={{ background: tokens.navy, borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    className="h-14 px-8 flex items-center justify-between sticky top-0 z-30"
  >
    <div className="flex items-center gap-3">
      <img src="/src/assets/favicon.png" alt="Virtusa" className="h-7 brightness-0 invert opacity-90" />
      <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.18)' }} />
      <span
        style={{ fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}
        className="text-xs font-medium uppercase tracking-widest hidden md:block"
      >
        Loan Review Console
      </span>
    </div>

    <div
      className="hidden md:flex items-center gap-2 text-xs font-medium"
      style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif" }}
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      Application Review
    </div>

    <button
      onClick={onLogout}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        color: 'rgba(255,255,255,0.6)',
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        fontFamily: "'DM Sans', sans-serif",
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign out
    </button>
  </nav>
);

// ── FIELD ──────────────────────────────────────────────────────────────────
const Field = ({ label, value, mono = true }) => (
  <div className="flex flex-col gap-1">
    <span
      style={{ color: tokens.muted, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.09em' }}
      className="text-[10px] font-medium uppercase"
    >
      {label}
    </span>
    <span
      style={{
        color: value ? tokens.text : tokens.muted,
        fontFamily: mono ? "'IBM Plex Mono', monospace" : "'DM Sans', sans-serif",
      }}
      className="text-sm font-medium"
    >
      {value ?? '—'}
    </span>
  </div>
);

// ── SECTION CARD ───────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, accent = '#378ADD', children }) => (
  <motion.div
    variants={fadeUp}
    className="rounded-2xl overflow-hidden"
    style={{ background: tokens.card, border: `1px solid ${tokens.border}`, boxShadow: '0 1px 4px rgba(10,20,40,0.06)' }}
  >
    <div
      className="flex items-center gap-3 px-6 py-4"
      style={{ borderBottom: `1px solid ${tokens.border}`, background: '#FAFBFD' }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent + '18' }}
      >
        <Icon style={{ color: accent }} className="w-3.5 h-3.5" />
      </div>
      <h2
        style={{ fontFamily: "'Syne', sans-serif", color: tokens.text }}
        className="text-sm font-semibold"
      >
        {title}
      </h2>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

// ── DIVIDER ────────────────────────────────────────────────────────────────
const Divider = () => <div style={{ borderTop: `1px solid ${tokens.border}` }} className="my-5" />;

// ── RISK GAUGE ─────────────────────────────────────────────────────────────
const RiskGauge = ({ label, value }) => {
  const pct = Math.min(value * 100, 100);
  const stops = [
    { pct: 0, color: '#22C55E' },
    { pct: 50, color: '#F59E0B' },
    { pct: 100, color: '#EF4444' },
  ];
  const trackColor = pct < 33 ? '#22C55E' : pct < 66 ? '#F59E0B' : '#EF4444';

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span
          style={{ fontFamily: "'DM Sans', sans-serif", color: tokens.muted, letterSpacing: '0.08em' }}
          className="text-[10px] font-medium uppercase"
        >
          {label}
        </span>
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: trackColor, background: trackColor + '18', border: `1px solid ${trackColor}40` }}
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
        >
          {pct < 33 ? 'Low' : pct < 66 ? 'Moderate' : 'High'} risk
        </span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: tokens.border }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: pct + '%' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(to right, #22C55E, ${trackColor})` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {['Low', 'Medium', 'High'].map(l => (
          <span key={l} style={{ color: tokens.muted, fontFamily: "'DM Sans', sans-serif" }} className="text-[9px]">{l}</span>
        ))}
      </div>
    </div>
  );
};

// ── RISK BANNER ────────────────────────────────────────────────────────────
const riskConfig = {
  high: {
    Icon: XCircle,
    label: 'High Risk',
    rec: 'Recommended Decision: REJECT',
    bg: '#FEF2F2',
    border: '#FECACA',
    iconColor: '#DC2626',
    textColor: '#991B1B',
    dot: '#EF4444',
  },
  medium: {
    Icon: AlertTriangle,
    label: 'Medium Risk',
    rec: 'Recommended Decision: APPROVE with caution',
    bg: '#FFFBEB',
    border: '#FDE68A',
    iconColor: '#D97706',
    textColor: '#92400E',
    dot: '#F59E0B',
  },
  low: {
    Icon: CheckCircle,
    label: 'Low Risk',
    rec: 'Recommended Decision: APPROVE',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    iconColor: '#16A34A',
    textColor: '#14532D',
    dot: '#22C55E',
  },
};

// ── DOCUMENT BUTTON ────────────────────────────────────────────────────────
const DocButton = ({ label, url, onClick }) => (
  <motion.button
    whileHover={url ? { y: -1, boxShadow: '0 4px 12px rgba(10,30,60,0.12)' } : {}}
    whileTap={url ? { scale: 0.97 } : {}}
    onClick={() => onClick(url)}
    disabled={!url}
    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
    style={{
      fontFamily: "'DM Sans', sans-serif",
      ...(url
        ? {
          background: tokens.navy,
          color: '#fff',
          border: `1px solid ${tokens.navy}`,
          cursor: 'pointer',
        }
        : {
          background: '#F1F3F8',
          color: tokens.muted,
          border: `1px solid ${tokens.border}`,
          cursor: 'not-allowed',
        }),
    }}
  >
    <Eye className="w-3.5 h-3.5 flex-shrink-0" />
    {label}
    {url && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
  </motion.button>
);

// ── STAT PILL ──────────────────────────────────────────────────────────────
const StatPill = ({ label, value, color = tokens.navy }) => (
  <div
    className="flex flex-col gap-1 px-4 py-3 rounded-xl"
    style={{ background: color + '10', border: `1px solid ${color}25` }}
  >
    <span style={{ color: tokens.muted, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em' }} className="text-[10px] uppercase font-medium">
      {label}
    </span>
    <span style={{ color, fontFamily: "'IBM Plex Mono', monospace" }} className="text-sm font-semibold">
      {value ?? '—'}
    </span>
  </div>
);

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    officerAPI.getDetails(id).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [id]);

  const handleDecision = async (decision) => {
    setSubmitting(decision);
    await officerAPI.updateDecision({ application_id: id, decision, reason });
    setSubmitting(null);
    alert('Application ' + decision);
    navigate('/dashboard');
  };

  const openDocument = (url) => {
    if (!url) {
      alert('Document not ready yet');
      return;
    }

    window.open(url, '_blank');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading || !data) {
    return (
      <div className="min-h-screen" style={{ background: tokens.surface }}>
        <AppNavbar onLogout={handleLogout} />
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-6 h-6 rounded-full border-2"
            style={{ borderColor: tokens.border, borderTopColor: tokens.navy }}
          />
          <p style={{ color: tokens.muted, fontFamily: "'DM Sans', sans-serif" }} className="text-sm">
            Loading application…
          </p>
        </div>
      </div>
    );
  }

  const pd = Number(data.credit_pd_score ?? 0);
  const fraud = Number(data.fraud_probability ?? 0);
  const emp = data.employment_verified;

  let riskLevel = 'low';

  if (fraud > 0.7 || pd > 0.6) {
    riskLevel = 'high';
  } else if (!emp || (pd > 0.4 && pd <= 0.6)) {
    riskLevel = 'medium';
  }

  const risk = riskConfig[riskLevel];
  const initials = (data.name ?? 'NA').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: tokens.surface, fontFamily: "'DM Sans', sans-serif" }}>
      <AppNavbar onLogout={handleLogout} />

      {/* HERO BAND */}
      <div style={{ background: tokens.navyMid, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-medium mb-5 transition-all"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: tokens.gold + '22', color: tokens.goldLight, border: `1px solid ${tokens.gold}40`, fontFamily: "'Syne', sans-serif" }}
            >
              {initials}
            </div>
            <div>
              <h1 style={{ color: '#fff', fontFamily: "'Syne', sans-serif" }} className="text-lg font-semibold leading-tight">
                {data.name ?? 'Applicant'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px] mt-0.5">
                {id}
              </p>
            </div>

            {/* Risk badge in header */}
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: risk.dot + '20', border: `1px solid ${risk.dot}40` }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: risk.dot }} />
              <span style={{ color: risk.dot, fontFamily: "'DM Sans', sans-serif" }} className="text-xs font-medium">
                {risk.label}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-4"
      >

        {/* ── PERSONAL ─────────────────────────────────────────────── */}
        <Section icon={User} title="Personal Details" accent="#378ADD">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label="Full Name" value={data.name} />
            <Field
              label="Date of Birth"
              value={data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('en-GB') : null}
            />
            <Field label="Gender" value={data.gender} mono={false} />
            <Field label="Marital Status" value={data.marital_status} mono={false} />
            <Field label="PAN Number" value={data.pan_number} />
            <Field label="Aadhaar" value={data.aadhaar_number} />
            <Field label="City" value={data.city} mono={false} />
            <Field label="State" value={data.state} mono={false} />
            <Field label="Age" value={data.age} />
            <Field label="Address" value={data.address} mono={false} />
            <Field label="Pincode" value={data.pincode} />
            <Field label="KYC Status" value={data.kyc_status} mono={false} />
          </div>
        </Section>

        {/* ── EMPLOYMENT ───────────────────────────────────────────── */}
        <Section icon={Briefcase} title="Employment Details" accent="#8B5CF6">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label="Employment Type" value={data.employment_type} mono={false} />
            <Field label="Employer" value={data.employer_name} mono={false} />
            <Field label="Job Title" value={data.job_title} mono={false} />
            <Field label="Experience" value={data.total_work_experience} mono={false} />
            <Field label="Monthly Income" value={data.monthly_income != null ? 'Rs. ' + Number(data.monthly_income).toLocaleString('en-IN') : null} />
            <Field label="Salary Mode" value={data.salary_mode} mono={false} />
            <Field label="Industry" value={data.industry} mono={false} />
            <Field
              label="Years In Current Job"
              value={data.years_in_current_job + ' years'}
              mono={false}
            />
          </div>
        </Section>

        {/* ── FINANCIAL ────────────────────────────────────────────── */}
        <Section icon={CreditCard} title="Financial Details" accent="#0D9488">
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Field label="Loan Amount" value={'Rs. ' + Number(data.loan_amount).toLocaleString('en-IN')} />
            <Field label="Loan Tenure" value={data.loan_tenure + ' months'} />
            <Field label="Loan Purpose" value={data.loan_purpose} mono={false} />
            <Field label="Existing Loans" value={data.existing_loans} />
            <Field
              label="Existing EMI"
              value={data.existing_emi != null ? 'Rs. ' + Number(data.existing_emi).toLocaleString('en-IN') : null}
            />
            <Field
              label="Credit Card Limit"
              value={data.credit_card_limit ? 'Rs. ' + Number(data.credit_card_limit).toLocaleString('en-IN') : null}
            />
            <Field
              label="Credit Card Balance"
              value={data.credit_card_balance ? 'Rs. ' + Number(data.credit_card_balance).toLocaleString('en-IN') : null}
            />
            <Field label="Bank Name" value={data.bank_name} mono={false} />
            <Field label="Account Type" value={data.bank_account_type} mono={false} />
            <Field label="Account Number" value={data.bank_account_number} />
            <Field
              label="Collateral Value"
              value={data.collateral_value ? 'Rs. ' + Number(data.collateral_value).toLocaleString('en-IN') : null}
            />
            <Field
              label="Avg. Monthly Balance"
              value={data.average_monthly_balance != null ? 'Rs. ' + Number(data.average_monthly_balance).toLocaleString('en-IN') : null}
            />
          </div>
        </Section>

        {/* ── DOCUMENTS ────────────────────────────────────────────── */}
        <Section icon={FileText} title="Supporting Documents" accent={tokens.gold}>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Bank Statement', url: data.bank_statement_url },
              { label: 'Salary Slip', url: data.salary_slip_url },
              { label: 'ITR Document', url: data.itr_document_url },
              { label: 'Collateral Document', url: data.collateral_url },
            ].map(({ label, url }) => (
              <DocButton key={label} label={label} url={url} onClick={openDocument} />
            ))}
          </div>
        </Section>

        {/* ── AI RISK ───────────────────────────────────────────────── */}
        <Section icon={Brain} title="AI Risk Analysis" accent="#E85D04">

          {/* Stat pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatPill
              label="Credit PD"
              value={`${(pd * 100).toFixed(2)}%`}
              color="#E85D04"
            />

            <StatPill
              label="Fraud Prob."
              value={`${(fraud * 100).toFixed(2)}%`}
              color="#DC2626"
            />

            <StatPill
              label="Final Decision"
              value={data.final_decision}
              color={tokens.navy}
            />

            <StatPill
              label="Application Status"
              value={data.status}
              color="#7C3AED"
            />
          </div>

          <Divider />

          {/* Gauges */}
          <div className="mb-6">
            <RiskGauge label="Credit Risk Score" value={pd} />
            <RiskGauge label="Fraud Probability" value={fraud} />
          </div>



          <Divider />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatPill
              label="Collateral Type"
              value={data.collateral_type}
              color="#0D9488"
            />

            <StatPill
              label="Collateral Value"
              value={
                data.collateral_value
                  ? 'Rs. ' + Number(data.collateral_value).toLocaleString('en-IN')
                  : '—'
              }
              color="#059669"
            />
          </div>



          {/* Employment verification */}
          <div className="flex items-center gap-3 mb-5">
            <BadgeCheck className={cn('w-4 h-4', emp ? 'text-green-500' : 'text-slate-400')} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", color: tokens.text }} className="text-sm">
              Employment {emp ? 'verified successfully' : 'not verified'}
            </span>
          </div>

          {/* Risk banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: risk.bg, border: `1px solid ${risk.border}` }}
          >
            <risk.Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: risk.iconColor }} />
            <div>
              <p style={{ color: risk.textColor, fontFamily: "'Syne', sans-serif" }} className="text-sm font-semibold">
                {risk.label}
              </p>
              <p style={{ color: risk.textColor, fontFamily: "'DM Sans', sans-serif", opacity: 0.8 }} className="text-xs mt-0.5">
                {risk.rec}
              </p>
            </div>
          </motion.div>
          {data.reason && (
            <p
              style={{
                color: risk.textColor,
                fontFamily: "'DM Sans', sans-serif",
                opacity: 0.85
              }}
              className="text-xs mt-2"
            >
              {data.reason}
            </p>
          )}
        </Section>

        {/* ── DECISION ──────────────────────────────────────────────── */}
        <Section icon={ClipboardCheck} title="Officer Decision" accent="#1D4ED8">
          <p style={{ color: tokens.muted, fontFamily: "'DM Sans', sans-serif" }} className="text-xs mb-3">
            Reason is optional for approval, required for rejection.
          </p>
          <textarea
            rows={3}
            placeholder="Enter your rationale for this decision…"
            onChange={(e) => setReason(e.target.value)}
            className="w-full resize-none outline-none text-sm mb-5 px-4 py-3 rounded-xl transition-all"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: tokens.text,
              background: tokens.surface,
              border: `1px solid ${tokens.border}`,
            }}
            onFocus={e => { e.target.style.borderColor = '#1D4ED8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = tokens.border; e.target.style.boxShadow = 'none'; }}
          />

          <div className="flex gap-3">
            <motion.button
              whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(11,31,58,0.22)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleDecision('APPROVED')}
              disabled={!!submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                fontFamily: "'Syne', sans-serif",
                background: submitting ? '#6B7280' : tokens.navy,
                color: '#fff',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <CheckCircle className="w-4 h-4" />
              {submitting === 'APPROVED' ? 'Approving…' : 'Approve'}
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleDecision('REJECTED')}
              disabled={!!submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                fontFamily: "'Syne', sans-serif",
                background: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FECACA',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <XCircle className="w-4 h-4" />
              {submitting === 'REJECTED' ? 'Rejecting…' : 'Reject'}
            </motion.button>
          </div>
        </Section>

        {/* FOOTER */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between px-1 pb-4"
        >
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: '#16A34A', fontFamily: "'DM Sans', sans-serif" }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            TLS 1.3 encrypted
          </span>
          <span style={{ color: tokens.muted, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px]">
            v2.4.1 · Production
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};
