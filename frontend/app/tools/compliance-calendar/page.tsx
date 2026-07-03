"use client";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { CalendarCheck, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Info } from "lucide-react";

type Category = "GST" | "Income Tax" | "Companies Act" | "TDS" | "Labour" | "ESOP";
type Severity = "Critical" | "Important" | "Advisory";

interface Deadline {
  id: string;
  title: string;
  category: Category;
  frequency: string;
  due_date: string;
  penalty: string;
  severity: Severity;
  description: string;
  who_files: string;
  applicable_if: string;
  tips: string;
}

const DEADLINES: Deadline[] = [
  { id: "gstr1-q1", title: "GSTR-1 (Sales) — Q1 FY26", category: "GST", frequency: "Quarterly", due_date: "2025-07-13", penalty: "₹200/day (max ₹10,000)", severity: "Critical", description: "Outward supply return for April–June 2025 (QRMP scheme, turnover < ₹5 Cr).", who_files: "CA handles", applicable_if: "All GST-registered businesses", tips: "Keep your invoices reconciled with GSTIN of customers. Ensure all B2B invoices have correct GSTIN to allow customer ITC claims." },
  { id: "gstr3b-july", title: "GSTR-3B Tax Payment — July 2025", category: "GST", frequency: "Monthly", due_date: "2025-07-20", penalty: "18% p.a. interest on unpaid amount", severity: "Critical", description: "Monthly summary return and tax payment for June 2025.", who_files: "CA handles", applicable_if: "GST-registered with monthly turnover", tips: "Never delay GSTR-3B — the 18% interest accrues daily. Even if you can't file the full return, pay the estimated tax by the 20th." },
  { id: "gstr1-q2", title: "GSTR-1 (Sales) — Q2 FY26", category: "GST", frequency: "Quarterly", due_date: "2025-10-13", penalty: "₹200/day (max ₹10,000)", severity: "Critical", description: "Outward supply return for July–September 2025.", who_files: "CA handles", applicable_if: "All GST-registered businesses (QRMP scheme)", tips: "Use the GSTN portal's 'GSTR-1A amendment' to fix any invoice errors from the previous quarter before this filing." },
  { id: "gstr3b-oct", title: "GSTR-3B Tax Payment — October 2025", category: "GST", frequency: "Monthly", due_date: "2025-10-20", penalty: "18% p.a. interest on unpaid amount", severity: "Critical", description: "Monthly summary return and tax payment for September 2025.", who_files: "CA handles", applicable_if: "All GST-registered businesses", tips: "Q2 close — review your ITC (Input Tax Credit) reconciliation. Unclaimed ITC from prior months must be claimed before annual return." },
  { id: "gstr1-q3", title: "GSTR-1 (Sales) — Q3 FY26", category: "GST", frequency: "Quarterly", due_date: "2026-01-13", penalty: "₹200/day (max ₹10,000)", severity: "Critical", description: "Outward supply return for October–December 2025.", who_files: "CA handles", applicable_if: "All GST-registered businesses (QRMP scheme)", tips: "December quarter typically has year-end sales activity. Ensure all invoices raised in December are captured before filing." },
  { id: "gstr3b-jan", title: "GSTR-3B Tax Payment — January 2026", category: "GST", frequency: "Monthly", due_date: "2026-01-20", penalty: "18% p.a. interest", severity: "Critical", description: "Monthly summary return and tax payment for December 2025.", who_files: "CA handles", applicable_if: "All GST-registered businesses", tips: "Post-December close. Ensure all vendor invoices from December are reconciled with your 2B credit before filing." },
  { id: "gstr1-q4", title: "GSTR-1 (Sales) — Q4 FY26", category: "GST", frequency: "Quarterly", due_date: "2026-04-13", penalty: "₹200/day (max ₹10,000)", severity: "Critical", description: "Outward supply return for January–March 2026.", who_files: "CA handles", applicable_if: "All GST-registered businesses (QRMP scheme)", tips: "This is your year-end GST filing — review all debit/credit notes, advances, and ensure books are clean before filing." },
  { id: "gstr9-annual", title: "GSTR-9 Annual Return FY 2024-25", category: "GST", frequency: "Annual", due_date: "2025-12-31", penalty: "₹200/day (max 0.25% of turnover)", severity: "Important", description: "Annual consolidated return for FY 2024-25. Summary of all monthly/quarterly returns filed during the year.", who_files: "CA handles", applicable_if: "All GST-registered businesses", tips: "Start reconciling your annual books in October itself. Last-minute GSTR-9 preparation leads to errors and penalties." },
  { id: "advance-tax-q1", title: "Advance Tax — Q1 (15% of liability)", category: "Income Tax", frequency: "Quarterly", due_date: "2025-06-15", penalty: "1% per month interest u/s 234C", severity: "Critical", description: "First installment of advance tax for FY 2025-26. Pay at least 15% of your estimated total tax liability.", who_files: "CA handles", applicable_if: "If total tax liability exceeds ₹10,000 for the year", tips: "Estimate your annual revenue and apply 25.17% corporate tax rate (for companies < ₹400 Cr turnover) to get your total liability. Pay 15% of that by June 15." },
  { id: "advance-tax-q2", title: "Advance Tax — Q2 (45% cumulative)", category: "Income Tax", frequency: "Quarterly", due_date: "2025-09-15", penalty: "1% per month interest u/s 234C", severity: "Critical", description: "Second installment of advance tax. Cumulative payments should reach 45% of estimated annual tax liability.", who_files: "CA handles", applicable_if: "All companies with tax liability > ₹10,000", tips: "If your first half was better than expected, increase Q2 payment accordingly. Underpayment carries 1% monthly interest." },
  { id: "advance-tax-q3", title: "Advance Tax — Q3 (75% cumulative)", category: "Income Tax", frequency: "Quarterly", due_date: "2025-12-15", penalty: "1% per month interest u/s 234C", severity: "Critical", description: "Third installment of advance tax. Cumulative payments should reach 75% of estimated annual tax liability.", who_files: "CA handles", applicable_if: "All companies with tax liability > ₹10,000", tips: "By Q3 you should have a clear picture of your full-year revenue. Recalibrate your advance tax calculation before this payment." },
  { id: "advance-tax-q4", title: "Advance Tax — Q4 (100% cumulative)", category: "Income Tax", frequency: "Quarterly", due_date: "2026-03-15", penalty: "1% per month interest u/s 234B", severity: "Critical", description: "Final advance tax installment for FY 2025-26. Pay 100% of estimated annual tax liability by March 15.", who_files: "CA handles", applicable_if: "All companies with tax liability > ₹10,000", tips: "This is the most important advance tax payment. Pay the full estimated balance here to avoid Section 234B interest when filing ITR in October." },
  { id: "itr-company", title: "Income Tax Return — Company FY 2024-25", category: "Income Tax", frequency: "Annual", due_date: "2025-10-31", penalty: "₹5,000-₹10,000 late filing fee; no carry-forward of business losses", severity: "Critical", description: "Annual income tax return for FY 2024-25 for private limited companies. Must be filed by the due date even if there's no taxable income.", who_files: "CA handles", applicable_if: "All private limited companies in India", tips: "Loss-making startups MUST file ITR to carry forward business losses to future profitable years. Missing this deadline means those losses are forfeited — a real tax cost." },
  { id: "tax-audit", title: "Tax Audit Report (Form 3CA/3CB)", category: "Income Tax", frequency: "Annual", due_date: "2025-09-30", penalty: "0.5% of turnover or ₹1.5L whichever is lower", severity: "Important", description: "Tax audit required if turnover exceeds ₹1 Cr (business) or ₹50L (professional services). Must be signed by a CA before the ITR is filed.", who_files: "CA handles", applicable_if: "If turnover > ₹1 Cr (₹10 Cr for cash transactions < 5%)", tips: "Engage your tax auditor by August to ensure the audit is completed before the September 30 deadline. Last-minute CA availability is a problem in Q2." },
  { id: "tds-q1", title: "TDS Return Q1 (Apr-Jun 2025)", category: "TDS", frequency: "Quarterly", due_date: "2025-07-31", penalty: "₹200/day (max equal to TDS amount)", severity: "Important", description: "File Form 24Q (salary TDS) and Form 26Q (non-salary TDS) for April-June 2025.", who_files: "CA handles", applicable_if: "If you have employees or pay vendors above TDS threshold", tips: "Ensure all TDS deducted during the quarter is deposited by the 7th of the following month. Late deposit attracts 1.5% per month interest." },
  { id: "tds-q2", title: "TDS Return Q2 (Jul-Sep 2025)", category: "TDS", frequency: "Quarterly", due_date: "2025-10-31", penalty: "₹200/day", severity: "Important", description: "File Form 24Q and 26Q for July-September 2025.", who_files: "CA handles", applicable_if: "All TDS deductors", tips: "Review your vendor contracts — TDS rates differ by payment type (10% for professional fees, 1-2% for contractors, 30% for certain payments to NRIs)." },
  { id: "tds-q3", title: "TDS Return Q3 (Oct-Dec 2025)", category: "TDS", frequency: "Quarterly", due_date: "2026-01-31", penalty: "₹200/day", severity: "Important", description: "File Form 24Q and 26Q for October-December 2025.", who_files: "CA handles", applicable_if: "All TDS deductors", tips: "Check whether your startup's gross turnover has crossed the threshold requiring TCS (Tax Collected at Source) on certain receipts." },
  { id: "tds-q4", title: "TDS Return Q4 (Jan-Mar 2026)", category: "TDS", frequency: "Quarterly", due_date: "2026-05-31", penalty: "₹200/day", severity: "Important", description: "File Form 24Q and 26Q for January-March 2026. Also includes annual TDS certificate (Form 16) issuance.", who_files: "CA handles", applicable_if: "All TDS deductors", tips: "Q4 TDS return has an extended deadline (May 31 vs July 31 for other quarters). But Form 16 to employees must be issued by June 15." },
  { id: "agm", title: "Annual General Meeting (AGM)", category: "Companies Act", frequency: "Annual", due_date: "2025-09-30", penalty: "₹100,000-₹500,000 for company; ₹50,000-₹100,000 for every officer in default per day", severity: "Important", description: "Annual General Meeting must be held within 6 months of close of financial year (March 31). Approve annual accounts, declare dividends, appoint directors.", who_files: "Company Secretary / CS handles", applicable_if: "All Private Limited Companies", tips: "Hold a board meeting to adopt accounts at least 30 days before AGM. The AGM can be held via video conference — no physical location required for private companies." },
  { id: "aoc4", title: "Financial Statements Filing (AOC-4)", category: "Companies Act", frequency: "Annual", due_date: "2025-10-29", penalty: "₹200/day + ₹1,000-₹10,000 per day for responsible officers", severity: "Critical", description: "File annual financial statements (balance sheet, P&L, cash flow, notes) with the Registrar of Companies (ROC) within 30 days of AGM.", who_files: "Company Secretary / CS handles", applicable_if: "All Private Limited Companies", tips: "The audited financial statements must be ready before you can file AOC-4. Ensure your statutory auditor is finalized by August to complete the audit in time." },
  { id: "mgt7", title: "Annual Return Filing (MGT-7)", category: "Companies Act", frequency: "Annual", due_date: "2025-11-28", penalty: "₹200/day", severity: "Critical", description: "File the Annual Return with ROC within 60 days of AGM. Contains details of shareholders, directors, capital structure, and MGT-7A attachment.", who_files: "Company Secretary / CS handles", applicable_if: "All Private Limited Companies", tips: "Ensure your cap table is accurate before filing MGT-7 — any discrepancy between MGT-7 and your SHA/SSA will flag during due diligence at fundraise." },
  { id: "dir3-kyc", title: "Director KYC (DIR-3 KYC)", category: "Companies Act", frequency: "Annual", due_date: "2025-09-30", penalty: "₹5,000 per director with deactivated DIN", severity: "Important", description: "Annual KYC for all directors holding a DIN (Director Identification Number). Submit mobile OTP and email OTP verification.", who_files: "Founder can file / CA handles", applicable_if: "All directors of Indian companies", tips: "This is simple to do yourself on the MCA21 portal. Missing this deactivates the director's DIN which blocks any future company filings." },
  { id: "pf-monthly", title: "PF Challan Payment (Monthly)", category: "Labour", frequency: "Monthly", due_date: "2025-09-15", penalty: "Damages 5-25% p.a. + penal interest 12% p.a.", severity: "Critical", description: "Monthly EPFO (Employees' Provident Fund Organisation) contribution. Both employee (12%) and employer (12%) PF contributions must be deposited by 15th of following month.", who_files: "Founder can file / Payroll provider handles", applicable_if: "Companies with 20+ employees; voluntary for smaller companies", tips: "Use a payroll software (Razorpay Payroll, Keka, GreytHR) that auto-generates PF challans. Manual PF computation is error-prone and attracts scrutiny." },
  { id: "pf-annual", title: "PF Annual Return (Form 3A / 6A)", category: "Labour", frequency: "Annual", due_date: "2026-04-25", penalty: "₹5,000-₹15,000", severity: "Important", description: "Annual EPFO return showing member-wise contribution details for the full financial year.", who_files: "CA / Payroll provider handles", applicable_if: "All EPFO-registered establishments", tips: "If you use a payroll software, this is auto-generated. Reconcile your monthly PF challans before the annual return — even one month's discrepancy triggers notices." },
  { id: "esi-monthly", title: "ESI Monthly Challan", category: "Labour", frequency: "Monthly", due_date: "2025-09-15", penalty: "Interest at 12% p.a. + damages up to 25%", severity: "Important", description: "Employee State Insurance Corporation (ESIC) contribution. Employee 0.75% + Employer 3.25% of gross salary. Required if >10 employees with salary < ₹21,000/month.", who_files: "Payroll provider handles", applicable_if: "Companies with 10+ employees; employees earning < ₹21,000/month", tips: "Many early-stage startups overpay senior employees to avoid ESI applicability. For employees above ₹21,000/month gross salary, ESI does not apply." },
  { id: "professional-tax", title: "Professional Tax Monthly (Karnataka)", category: "Labour", frequency: "Monthly", due_date: "2025-09-20", penalty: "10-50% of tax due as penalty", severity: "Important", description: "Professional Tax is a state tax on employment. Karnataka requires monthly payment and annual return. Slab: ₹200/month for salary ₹15,001-₹20,000; ₹300/month for above ₹20,000.", who_files: "CA handles", applicable_if: "Bengaluru-based companies with salaried employees", tips: "Check the specific PT slab for your state. Maharashtra, Telangana, and Karnataka have different slabs. Get PT registration within 30 days of starting operations." },
  { id: "dpt3", title: "DPT-3 (Deposits Return)", category: "Companies Act", frequency: "Annual", due_date: "2025-06-30", penalty: "₹5,000-₹25,000 + continuing fine", severity: "Important", description: "Annual return of deposits and outstanding receipts of money or loan not considered as public deposits. Covers loans from founders, directors, and shareholders.", who_files: "CS handles", applicable_if: "Companies that have received loans from founders or directors", tips: "This is commonly missed. If founders have put personal money into the company as unsecured loans (not equity), it must be reported in DPT-3 annually." },
  { id: "msme-form-i", title: "MSME Form-I (MSME Buyer Report)", category: "Companies Act", frequency: "Half-yearly", due_date: "2025-10-31", penalty: "Significant — Ministry of Corporate Affairs scrutiny", severity: "Advisory", description: "Half-yearly return for companies that buy goods/services from MSME vendors and have outstanding payment > 45 days. Reports MSME creditors with overdue amounts.", who_files: "CS handles", applicable_if: "Companies with MSME vendors and >45 day outstanding payments", tips: "If you owe money to any vendor registered as MSME, pay within 45 days or you must report it here. Government is actively enforcing MSME payment norms." },
  { id: "esop-valuation", title: "ESOP Valuation (Rule 11UA)", category: "ESOP", frequency: "One-time", due_date: "2025-12-31", penalty: "Tax liability on incorrect valuation + interest", severity: "Advisory", description: "Each time you issue ESOP grants, a SEBI-registered valuer must value the fair market value (FMV) of shares using Rule 11UA. The FMV determines the perquisite value taxable in employee hands at exercise.", who_files: "SEBI-registered valuer", applicable_if: "Every time you issue new ESOP grants", tips: "Budget ₹25,000-₹75,000 per ESOP valuation exercise. Get a valuation done before your next grant date — a 3-4 week lead time is needed." },
  { id: "esop-trust", title: "ESOP Trust Annual Filing", category: "ESOP", frequency: "Annual", due_date: "2025-11-30", penalty: "Compliance penalties vary", severity: "Advisory", description: "If you've set up an ESOP trust (common for startups with 15+ employees on the option scheme), the trust must file an annual return and accounts.", who_files: "CS and CA handle jointly", applicable_if: "Companies with an ESOP trust structure", tips: "Many early-stage startups skip setting up an ESOP trust and issue options directly. A trust structure is recommended once you have 20+ option holders." },
  { id: "posh-return", title: "POSH Annual Report", category: "Labour", frequency: "Annual", due_date: "2026-01-31", penalty: "₹50,000 first offence; ₹100,000 + cancellation of licence for repeat", severity: "Advisory", description: "Prevention of Sexual Harassment at Workplace Act — if you have 10+ employees, you must have an Internal Complaints Committee (ICC) and file an annual report with the district officer.", who_files: "HR head or Company Secretary", applicable_if: "All companies with 10+ employees", tips: "Set up a POSH policy, ICC, and file the annual report before January 31. It's a 1-page filing but non-compliance attracts significant penalties and reputational risk." },
];

const CATEGORY_COLORS: Record<Category, string> = {
  "GST": "bg-amber-100 text-amber-700 border-amber-200",
  "Income Tax": "bg-peach-100/60 text-peach-700 border-peach-200/60",
  "Companies Act": "bg-stone-100 text-stone-600 border-stone-200",
  "TDS": "bg-orange-100 text-orange-700 border-orange-200",
  "Labour": "bg-green-100 text-green-700 border-green-200",
  "ESOP": "bg-peach-50/60 text-peach-600 border-peach-200/40",
};

const SEVERITY_COLORS: Record<Severity, string> = {
  "Critical": "bg-red-100 text-red-700 border-red-200",
  "Important": "bg-amber-100 text-amber-700 border-amber-200",
  "Advisory": "bg-stone-100 text-stone-600 border-stone-200",
};

function getDaysLeft(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getUrgencyBorder(days: number) {
  if (days < 0) return "border-l-4 border-l-stone-300";
  if (days <= 30) return "border-l-4 border-l-red-500";
  if (days <= 60) return "border-l-4 border-l-amber-500";
  return "border-l-4 border-l-green-400";
}

export default function ComplianceCalendarPage() {
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterSeverity, setFilterSeverity] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);

  const sorted = useMemo(() => {
    const today = new Date();
    return [...DEADLINES]
      .filter((d) => {
        if (filterCategory && d.category !== filterCategory) return false;
        if (filterSeverity && d.severity !== filterSeverity) return false;
        if (showUpcoming && getDaysLeft(d.due_date) > 30) return false;
        return true;
      })
      .sort((a, b) => {
        const da = getDaysLeft(a.due_date);
        const db = getDaysLeft(b.due_date);
        if (da < 0 && db >= 0) return 1;
        if (db < 0 && da >= 0) return -1;
        return da - db;
      });
  }, [filterCategory, filterSeverity, showUpcoming]);

  const urgentCount = DEADLINES.filter((d) => getDaysLeft(d.due_date) <= 30 && getDaysLeft(d.due_date) >= 0).length;
  const overdueCount = DEADLINES.filter((d) => getDaysLeft(d.due_date) < 0).length;
  const next7Days = DEADLINES.filter((d) => { const d2 = getDaysLeft(d.due_date); return d2 >= 0 && d2 <= 7; });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-strong border-b border-peach-200/30 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-peach-500" />
            <span className="text-sm font-semibold text-stone-700">Compliance Calendar</span>
            {urgentCount > 0 && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{urgentCount} urgent</span>}
          </div>
        </div>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Compliance Calendar — FY 2025-26</h1>
            <p className="text-stone-400 text-sm">India startup compliance deadlines with countdowns, penalties, and founder tips.</p>
          </div>

          {/* Alert banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Always verify with your CA.</strong> Dates shown are for FY 2025-26. Some deadlines vary based on your registration date, turnover, state, and whether you've opted for composition scheme. This is reference information, not professional advice.
            </p>
          </div>

          {/* Next 7 days strip */}
          {next7Days.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-xs font-bold text-red-700 uppercase mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Due in the next 7 days
              </p>
              <div className="space-y-2">
                {next7Days.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-800">{d.title}</span>
                    <span className="text-red-600 font-bold">{getDaysLeft(d.due_date) === 0 ? "TODAY" : `in ${getDaysLeft(d.due_date)} days`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Deadlines", value: DEADLINES.length, color: "text-stone-900" },
              { label: "Overdue", value: overdueCount, color: "text-stone-400" },
              { label: "Due < 30 days", value: urgentCount, color: "text-red-600" },
              { label: "Due 30-60 days", value: DEADLINES.filter((d) => { const d2 = getDaysLeft(d.due_date); return d2 > 30 && d2 <= 60; }).length, color: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center shadow-sm">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {(["", "GST", "Income Tax", "Companies Act", "TDS", "Labour", "ESOP"] as const).map((c) => (
                <button key={c} onClick={() => setFilterCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${filterCategory === c ? "btn-coral" : "btn-ghost-peach"}`}>
                  {c || "All Categories"}
                </button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto flex-wrap">
              {(["", "Critical", "Important", "Advisory"] as const).map((s) => (
                <button key={s} onClick={() => setFilterSeverity(s)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${filterSeverity === s ? "btn-coral" : "btn-ghost-peach"}`}>
                  {s || "All Severity"}
                </button>
              ))}
              <button onClick={() => setShowUpcoming((p) => !p)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${showUpcoming ? "btn-coral" : "btn-ghost-peach"}`}>
                Due in 30 days only
              </button>
            </div>
          </div>

          {/* Deadline list */}
          <div className="space-y-3">
            {sorted.map((deadline) => {
              const days = getDaysLeft(deadline.due_date);
              const isExpanded = expandedId === deadline.id;
              const isOverdue = days < 0;
              return (
                <div key={deadline.id} className={`glass rounded-2xl shadow-sm overflow-hidden ${getUrgencyBorder(days)}`}>
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : deadline.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[deadline.category]}`}>{deadline.category}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[deadline.severity]}`}>{deadline.severity}</span>
                          <span className="text-[10px] text-stone-400 bg-peach-50/60 px-2 py-0.5 rounded-full">{deadline.who_files}</span>
                        </div>
                        <h3 className="font-semibold text-stone-900 text-sm">{deadline.title}</h3>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Due: {new Date(deadline.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {deadline.frequency}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`text-xs font-bold px-3 py-1.5 rounded-xl ${isOverdue ? "bg-stone-100 text-stone-400" : days <= 30 ? "bg-red-100 text-red-700" : days <= 60 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          {isOverdue ? `${Math.abs(days)}d ago` : days === 0 ? "TODAY" : `in ${days}d`}
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-peach-100/40 space-y-3">
                      <p className="text-xs text-stone-600 leading-relaxed pt-3">{deadline.description}</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-red-50/60 rounded-xl p-3">
                          <p className="text-[10px] font-semibold text-red-700 uppercase mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Penalty</p>
                          <p className="text-xs text-stone-700">{deadline.penalty}</p>
                        </div>
                        <div className="bg-peach-50/60 rounded-xl p-3">
                          <p className="text-[10px] font-semibold text-stone-500 uppercase mb-1">Applicable if</p>
                          <p className="text-xs text-stone-700">{deadline.applicable_if}</p>
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-amber-700 uppercase mb-1 flex items-center gap-1">💡 Founder Tip</p>
                        <p className="text-xs text-amber-800 leading-relaxed">{deadline.tips}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
