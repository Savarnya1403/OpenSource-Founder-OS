"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Presentation, ChevronRight, ChevronLeft, CheckCircle2, Circle,
  Lightbulb, Target, BarChart3, DollarSign, Users, Zap, Globe,
  TrendingUp, Shield, ArrowRight, Edit3, Eye
} from "lucide-react";

interface Slide {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  what_to_include: string[];
  what_to_avoid: string[];
  time_to_spend: string;
  vc_perspective: string;
  india_specific: string;
  questions_it_must_answer: string[];
  benchmark: string;
}

const SLIDES: Slide[] = [
  {
    id: "title",
    number: 1,
    title: "Title Slide",
    subtitle: "First impression — make it count",
    icon: Presentation,
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    what_to_include: [
      "Company name and logo (high resolution)",
      "One-line tagline that captures your value proposition",
      "Founder names and LinkedIn/contact",
      "City, month, and year",
      "Round size and type (optional, can be in appendix)",
    ],
    what_to_avoid: [
      "Long paragraph descriptions",
      "Complex logos or low-res graphics",
      "Too many founders listed (keep to 2-3 core team)",
      "Generic taglines like 'We are the Uber of X'",
    ],
    time_to_spend: "30 seconds in the room; 5 seconds in an email",
    vc_perspective: "We see 100 decks a week. The title slide tells us your design taste and how clearly you think. A cluttered title slide = cluttered thinking.",
    india_specific: "Add 'DPIIT Recognised Startup' badge if applicable. This instantly signals credibility for Indian VCs.",
    questions_it_must_answer: ["What does this company do?", "Who built it?"],
    benchmark: "Best: Zepto, CRED early decks — simple, bold, memorable taglines",
  },
  {
    id: "problem",
    number: 2,
    title: "Problem",
    subtitle: "Make the VC feel the pain",
    icon: Target,
    color: "bg-red-50 text-red-600 border-red-200",
    what_to_include: [
      "Specific, vivid description of the pain — ideally a story",
      "Who experiences this problem (your customer persona)",
      "Current alternatives and why they fail",
      "How widespread the problem is (# people affected)",
      "Quantify the pain: time wasted, money lost, efficiency gap",
    ],
    what_to_avoid: [
      "Vague statements like 'market is fragmented'",
      "Industry jargon that obscures the real problem",
      "Making the problem sound solved (undermines your pitch)",
      "Listing 5+ problems — pick ONE compelling pain point",
    ],
    time_to_spend: "60–90 seconds; this is your hook",
    vc_perspective: "If I don't feel the problem viscerally by the end of slide 2, I've mentally moved on. Make me feel the pain, not just understand it.",
    india_specific: "India-specific pain is compelling: payment failures, GST complexity, vernacular customer reach, cash-based supply chains. Don't map a Silicon Valley problem onto India.",
    questions_it_must_answer: [
      "Is this a REAL, urgent problem?",
      "How many people have this problem?",
      "Why is the current solution broken?",
    ],
    benchmark: "The best problems make VCs say 'yes, I've experienced this' or 'yes, I know 5 people who face this daily'",
  },
  {
    id: "solution",
    number: 3,
    title: "Solution",
    subtitle: "The 'Aha!' moment",
    icon: Lightbulb,
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    what_to_include: [
      "Crisp description of what you built (not how)",
      "Product screenshots or short demo GIF/video",
      "How you solve the problem differently/better",
      "The 'magic' — what's unique about your approach",
      "User journey: before vs. after using your product",
    ],
    what_to_avoid: [
      "Technical architecture diagrams (save for DD)",
      "Feature laundry lists — show impact, not features",
      "Too many product screenshots (1-3 max)",
      "Claiming to be the 'only' solution without backing it up",
    ],
    time_to_spend: "60–90 seconds",
    vc_perspective: "The solution slide should make me think 'of course, why didn't someone build this already?' — not 'ok, that's one way to do it I guess.'",
    india_specific: "Localisation is a moat in India. If your solution works in vernacular languages, offline, or with feature phones — show that explicitly. It's often underrated.",
    questions_it_must_answer: [
      "What exactly did you build?",
      "Why is this approach better?",
      "Can I see it in action?",
    ],
    benchmark: "Less text, more showing. If possible, embed a 30-second Loom or product GIF",
  },
  {
    id: "market",
    number: 4,
    title: "Market Size",
    subtitle: "TAM / SAM / SOM",
    icon: Globe,
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    what_to_include: [
      "TAM: Total Addressable Market (global or India)",
      "SAM: Serviceable Addressable Market (your geography + segment)",
      "SOM: Serviceable Obtainable Market (realistic 5-year target)",
      "Source your numbers (IBEF, NASSCOM, Bain, Morgan Stanley)",
      "Show bottom-up calculation, not just top-down",
    ],
    what_to_avoid: [
      "Wildly inflated TAMs ('$500B global market')",
      "Unsourced numbers — VCs will fact-check",
      "Only top-down numbers without bottom-up validation",
      "Claiming 1% of a massive market as your target (lazy math)",
    ],
    time_to_spend: "45 seconds — VCs have seen many market slides",
    vc_perspective: "We don't fund small markets. But we also can't fund implausible market claims. Show me a $1B+ SAM with a believable path. The SOM tells me you understand your GTM.",
    india_specific: "India market sizing: use ₹ crores, not USD, for India-specific markets. IBEF, NASSCOM, DPIIT reports, Redseer, and Bain India are credible sources.",
    questions_it_must_answer: [
      "Is this market big enough to build a ₹1000 Cr business?",
      "How did you calculate these numbers?",
      "What % of the market are you realistically targeting?",
    ],
    benchmark: "Best practice: show the bottom-up calculation. '10M SMBs × ₹10K/year = ₹1000 Cr SAM' is more credible than citing a report.",
  },
  {
    id: "traction",
    number: 5,
    title: "Traction",
    subtitle: "Proof that people want what you built",
    icon: TrendingUp,
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    what_to_include: [
      "Revenue / MRR with month-over-month growth chart",
      "Key metrics relevant to your model (DAU, GMV, GTV, ARR)",
      "Customer count and growth rate",
      "Cohort retention or NRR if available",
      "Notable customers (with permission) or testimonials",
      "Logos of key clients (B2B) or press mentions (B2C)",
    ],
    what_to_avoid: [
      "Vanity metrics: app downloads, social followers, 'registrations'",
      "Cherry-picked time windows that hide a slowdown",
      "Metrics without context (MoM growth matters more than absolute)",
      "Non-revenue traction for Series A+ without revenue",
    ],
    time_to_spend: "90 seconds — this is often the most scrutinised slide",
    vc_perspective: "Traction is truth. Every other slide is a claim. Traction is evidence. Show me the hockey stick, but don't hide the flat part before it.",
    india_specific: "India SaaS Seed benchmark: ₹5-25L MRR. Series A benchmark: ₹50L-₹2 Cr MRR. Consumer: 50K-500K MAU for Seed. These are rough guides — context matters.",
    questions_it_must_answer: [
      "Are real people paying for this?",
      "Is it growing? How fast?",
      "What's the retention signal?",
    ],
    benchmark: "Show a clean MoM growth chart with absolute numbers. CAGR over 12 months. If pre-revenue, show LOIs, pilots, or waitlist with engagement data.",
  },
  {
    id: "business-model",
    number: 6,
    title: "Business Model",
    subtitle: "How you make (and will make) money",
    icon: DollarSign,
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    what_to_include: [
      "Revenue streams and pricing model",
      "Unit economics: CAC, LTV, LTV:CAC ratio",
      "Gross margin % and path to improvement",
      "Average contract value (B2B) or ARPU (B2C/SaaS)",
      "Payback period on customer acquisition",
    ],
    what_to_avoid: [
      "Listing 5 different revenue models (pick 1-2 primary ones)",
      "Missing gross margin — it's non-negotiable to include",
      "Ignoring CAC if you spend on acquisition",
      "Projecting without explaining assumptions",
    ],
    time_to_spend: "60 seconds",
    vc_perspective: "I want to know: can this be a high-margin business? Is CAC recoverable in a reasonable time? Are unit economics pointing in the right direction even if not great today?",
    india_specific: "India B2B SaaS ACV tends to be 3-5x lower than US equivalents. That's okay — compensate with lower CAC (often 5-10x lower). Show the math works in India's unit economics.",
    questions_it_must_answer: [
      "How do you make money?",
      "What are your unit economics?",
      "Can this be a margin-expanding business?",
    ],
    benchmark: "Rule of thumb: LTV:CAC > 3:1. Gross margins: SaaS >70%, Marketplace >60%, D2C >50%, Logistics >30% at scale.",
  },
  {
    id: "competition",
    number: 7,
    title: "Competition & Moat",
    subtitle: "Why you win — and keep winning",
    icon: Shield,
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    what_to_include: [
      "Honest competitive landscape (don't say 'no competitors')",
      "Positioning map with 2 differentiating axes",
      "Your unfair advantages / moat",
      "Why incumbents can't copy you easily",
      "Network effects, data moats, or switching costs if applicable",
    ],
    what_to_avoid: [
      "Saying 'we have no competition' — red flag",
      "Only listing small startups and ignoring BigCo's",
      "Overstating how different you are from clearly similar products",
      "Copying the 2x2 matrix template without thinking about axes",
    ],
    time_to_spend: "45 seconds",
    vc_perspective: "The worst answer is 'we have no competition.' That tells me either the market doesn't exist, or you haven't done research. The right answer shows self-awareness and a clear wedge.",
    india_specific: "In India, regional incumbents, offline players, and jugaad solutions are often your real competition. Show you understand the 'good enough' alternatives your customer currently uses.",
    questions_it_must_answer: [
      "Who are the alternatives?",
      "Why do customers choose you over them?",
      "What prevents someone from copying you?",
    ],
    benchmark: "The best moats: proprietary data, network effects, regulatory advantage, or switching costs. Pick the axis on your 2x2 where you're genuinely dominant.",
  },
  {
    id: "team",
    number: 8,
    title: "Team",
    subtitle: "Why YOU are the team to build this",
    icon: Users,
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    what_to_include: [
      "Founder photos and 2-line bios",
      "Relevant prior experience (exits, domain expertise, operator roles)",
      "Why this team? The 'founder-market fit' story",
      "Key advisors and their specific value-add (if credible)",
      "Hiring plan for key roles (shows self-awareness of gaps)",
    ],
    what_to_avoid: [
      "Listing 8+ team members on one slide (only show core founders)",
      "Long LinkedIn-style CVs — pick 1-2 credibility signals per person",
      "Irrelevant logos (e.g., college attended 10 years ago if not domain-relevant)",
      "Advisor names without explaining what they actually do",
    ],
    time_to_spend: "60 seconds",
    vc_perspective: "At early stage, I'm betting on the team more than the idea. I want to see domain expertise + execution track record + coachability. The best teams make hard things look obvious.",
    india_specific: "IIT/IIM backgrounds carry credibility in India VCs minds — include them if relevant. Ex-Flipkart, Zomato, Razorpay operators also signal pedigree. Be honest about gaps.",
    questions_it_must_answer: [
      "Why are you uniquely positioned to solve this?",
      "Have you built teams / products / businesses before?",
      "Do you have the grit to go 7+ years?",
    ],
    benchmark: "Ideal team: 1 technical founder (builds), 1 business/domain founder (sells/knows market). Both have skin in the game — full-time, equity-holding.",
  },
  {
    id: "financials",
    number: 9,
    title: "Financials & Use of Funds",
    subtitle: "How you'll deploy capital",
    icon: BarChart3,
    color: "bg-peach-100/60 text-peach-600 border-peach-300/40",
    what_to_include: [
      "3-year revenue projections (conservative + upside scenarios)",
      "Key assumptions driving projections",
      "Current monthly burn rate",
      "Use of funds breakdown (what you'll spend on, in %)",
      "Runway post-raise (should be 18-24 months)",
      "Key milestones the raise unlocks",
    ],
    what_to_avoid: [
      "Fantasy hockey-stick with no basis in assumptions",
      "Not disclosing burn rate (investors will ask anyway)",
      "'40% product, 40% sales, 20% ops' — too vague",
      "Projections that don't show path to profitability eventually",
    ],
    time_to_spend: "60 seconds",
    vc_perspective: "I know your 3-year numbers are made up. I'm looking at your assumptions and logical thinking. Show me you understand what drives your business. The use of funds tells me your priorities.",
    india_specific: "State in ₹ crores, not millions of dollars. Show India-specific burn benchmarks. Typical India seed burn: ₹20-80L/month. Series A: ₹50L-₹2 Cr/month.",
    questions_it_must_answer: [
      "What will you achieve with this money?",
      "What milestones does this round unlock?",
      "How long does the runway last?",
    ],
    benchmark: "Use of funds: Product/Eng (30-50%), Sales/Marketing (20-40%), Operations (10-20%), G&A (5-10%). Post-raise runway: minimum 18 months.",
  },
  {
    id: "ask",
    number: 10,
    title: "The Ask",
    subtitle: "Close the room",
    icon: Zap,
    color: "bg-orange-50 text-orange-600 border-orange-200",
    what_to_include: [
      "Round size and type (Seed, Series A, etc.)",
      "Target raise and minimum viable raise",
      "Current valuation (pre-money) or SAFE cap",
      "Lead investor status (if any lead secured)",
      "Round closing timeline",
      "What you're looking for beyond capital (network, expertise)",
    ],
    what_to_avoid: [
      "Vague 'raising between X and Y' — be direct",
      "Skipping valuation — just say it (investors will ask)",
      "Raising way too much or way too little for your stage",
      "Not having a 'why now' urgency driver",
    ],
    time_to_spend: "30-45 seconds — then go to Q&A",
    vc_perspective: "I need to know: what round, how much, at what valuation. If you're wishy-washy on the ask, it tells me you haven't done the work. Be direct. Confidence is attractive.",
    india_specific: "India Seed: ₹2-15 Cr, 10-20% dilution. Series A: ₹20-100 Cr, 15-25% dilution. Angel rounds: ₹50L-₹2 Cr, on SAFEs or CCDs. State the instrument too.",
    questions_it_must_answer: [
      "Exactly how much are you raising?",
      "At what valuation?",
      "What will I own if I invest?",
    ],
    benchmark: "End with your contact, next steps, and a memorable closing line. The last impression is as important as the first.",
  },
];

const COMPLETION_TIPS = [
  "Keep total slides to 10-12 maximum",
  "Each slide should have ONE key message",
  "Design: simple, clean, no clip art",
  "Font size minimum 18pt for presenting",
  "Backup slides / appendix for financials, team deep-dives, product screenshots",
  "Test at 2x speed — if message is lost, it's too complex",
  "Send as PDF (never editable formats) to investors",
  "Tailor the deck for each VC's thesis — small adjustments matter",
];

export default function PitchDeckPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"guide" | "checklist">("guide");

  const toggleItem = (key: string) => {
    setCheckedItems(prev => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  const slide = SLIDES[activeSlide];
  const SlideIcon = slide.icon;

  const totalCheckboxes = SLIDES.reduce((acc, s) => acc + s.what_to_include.length, 0);
  const completionPct = Math.round((checkedItems.size / totalCheckboxes) * 100);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
              <Presentation className="w-3.5 h-3.5" />
              Founder Tools → Pitch Deck Builder
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-stone-900 mb-1">Pitch Deck Builder</h1>
                <p className="text-stone-500 text-sm">
                  10-slide framework for Indian startup fundraising — with VC perspectives, India-specific tips, and content checklists.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setView("guide")}
                  className={`text-sm px-4 py-2 rounded-xl border transition-colors flex items-center gap-1.5 ${view === "guide" ? "btn-coral border-transparent" : "btn-ghost-peach"}`}>
                  <Eye className="w-3.5 h-3.5" /> Slide Guide
                </button>
                <button onClick={() => setView("checklist")}
                  className={`text-sm px-4 py-2 rounded-xl border transition-colors flex items-center gap-1.5 ${view === "checklist" ? "btn-coral border-transparent" : "btn-ghost-peach"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Checklist ({completionPct}%)
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="glass rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-stone-700">Deck completion checklist</p>
              <span className="text-xs text-stone-400">{checkedItems.size} / {totalCheckboxes} items</span>
            </div>
            <div className="w-full bg-peach-200/50 rounded-full h-2">
              <div className="bg-coral h-2 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Slide list */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl shadow-sm p-3">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide px-2 mb-2">Slides</p>
                <div className="space-y-1">
                  {SLIDES.map((s, idx) => {
                    const SIcon = s.icon;
                    const slideChecked = s.what_to_include.filter((_, i) => checkedItems.has(`${s.id}-${i}`)).length;
                    const slideTotal = s.what_to_include.length;
                    return (
                      <button key={s.id} onClick={() => setActiveSlide(idx)}
                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${activeSlide === idx ? "bg-peach-100/60 text-peach-700" : "text-stone-600 hover:bg-peach-50/60"}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeSlide === idx ? "bg-peach-200/60" : "bg-peach-100/60"}`}>
                          <SIcon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{s.number}. {s.title}</p>
                          {slideChecked > 0 && (
                            <p className="text-[9px] text-stone-400">{slideChecked}/{slideTotal} done</p>
                          )}
                        </div>
                        {slideChecked === slideTotal && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3 space-y-4">
              {view === "guide" ? (
                <>
                  {/* Slide header */}
                  <div className="glass rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${slide.color}`}>
                        <SlideIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400">Slide {slide.number} of {SLIDES.length}</p>
                        <h2 className="font-bold text-stone-900 text-lg">{slide.title}</h2>
                      </div>
                    </div>
                    <p className="text-sm text-stone-500">{slide.subtitle}</p>
                    <div className="mt-3 bg-peach-50/50 rounded-xl px-3 py-2">
                      <p className="text-xs text-stone-600"><span className="font-semibold">Time to spend:</span> {slide.time_to_spend}</p>
                    </div>
                  </div>

                  {/* Questions it must answer */}
                  <div className="glass rounded-2xl border-peach-200/40 p-5">
                    <h3 className="font-semibold text-stone-800 text-sm mb-3 flex items-center gap-1.5">
                      <Target className="w-4 h-4" /> Questions this slide must answer
                    </h3>
                    <ul className="space-y-2">
                      {slide.questions_it_must_answer.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                          <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" /> {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What to include / avoid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl border-peach-200/40 p-5">
                      <h3 className="font-semibold text-stone-800 text-sm mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Include
                      </h3>
                      <ul className="space-y-2">
                        {slide.what_to_include.map((item, i) => (
                          <li key={i}
                            onClick={() => toggleItem(`${slide.id}-${i}`)}
                            className="flex items-start gap-2 text-xs text-stone-700 cursor-pointer hover:opacity-80">
                            {checkedItems.has(`${slide.id}-${i}`)
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                              : <Circle className="w-3.5 h-3.5 text-green-300 shrink-0 mt-0.5" />}
                            <span className={checkedItems.has(`${slide.id}-${i}`) ? "line-through opacity-60" : ""}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                      <h3 className="font-semibold text-red-800 text-sm mb-3">✗ Avoid</h3>
                      <ul className="space-y-2">
                        {slide.what_to_avoid.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                            <span className="text-red-400 shrink-0 mt-0.5">×</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* VC perspective */}
                  <div className="bg-gray-900 rounded-2xl p-5">
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">VC Perspective</p>
                    <p className="text-sm text-gray-200 leading-relaxed italic">"{slide.vc_perspective}"</p>
                  </div>

                  {/* India specific */}
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                    <h3 className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-1.5">
                      🇮🇳 India-Specific Tips
                    </h3>
                    <p className="text-sm text-orange-800">{slide.india_specific}</p>
                  </div>

                  {/* Benchmark */}
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> Benchmark
                    </p>
                    <p className="text-xs text-amber-800">{slide.benchmark}</p>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-2">
                    <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                      disabled={activeSlide === 0}
                      className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed border border-peach-200/60 rounded-xl px-4 py-2 bg-white">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button onClick={() => setActiveSlide(Math.min(SLIDES.length - 1, activeSlide + 1))}
                      disabled={activeSlide === SLIDES.length - 1}
                      className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed border border-peach-200/60 rounded-xl px-4 py-2 bg-white">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* Checklist view */
                <div className="space-y-4">
                  {SLIDES.map((s) => {
                    const SIcon = s.icon;
                    const doneCount = s.what_to_include.filter((_, i) => checkedItems.has(`${s.id}-${i}`)).length;
                    return (
                      <div key={s.id} className="glass rounded-2xl shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${s.color}`}>
                            <SIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-stone-900 text-sm">{s.number}. {s.title}</h3>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doneCount === s.what_to_include.length ? "bg-green-100 text-green-700" : "bg-peach-100/60 text-stone-600"}`}>
                            {doneCount}/{s.what_to_include.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {s.what_to_include.map((item, i) => (
                            <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                              <input type="checkbox"
                                checked={checkedItems.has(`${s.id}-${i}`)}
                                onChange={() => toggleItem(`${s.id}-${i}`)}
                                className="mt-0.5 rounded border-peach-300/60 text-peach-600 focus:ring-peach-400" />
                              <span className={`text-xs leading-relaxed ${checkedItems.has(`${s.id}-${i}`) ? "line-through text-stone-400" : "text-stone-600"} group-hover:text-stone-900`}>
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* General tips */}
                  <div className="glass rounded-2xl border-peach-200/40 p-5">
                    <h3 className="font-semibold text-stone-800 text-sm mb-3">General Deck Tips</h3>
                    <ul className="space-y-2">
                      {COMPLETION_TIPS.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-peach-400" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
