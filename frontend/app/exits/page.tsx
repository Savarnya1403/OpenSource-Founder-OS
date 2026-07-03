"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  TrendingUp, DollarSign, Building2, ChevronDown, ChevronUp,
  Calendar, Users, Star, Award, Target, Filter
} from "lucide-react";

interface ExitStory {
  id: string;
  company: string;
  exit_type: "IPO" | "Acquisition" | "Merger" | "Secondary";
  exit_year: number;
  exit_valuation: string;
  exit_valuation_usd: number;
  acquirer_or_exchange?: string;
  sector: string;
  founded: number;
  founder_names: string[];
  founder_returns: string;
  early_investor_return: string;
  lead_investors: string[];
  what_made_them_exit_ready: string[];
  key_lesson: string;
  story: string;
  tags: string[];
  revenue_at_exit?: string;
  multiple?: string;
}

const EXIT_STORIES: ExitStory[] = [
  {
    id: "zomato-ipo",
    company: "Zomato",
    exit_type: "IPO",
    exit_year: 2021,
    exit_valuation: "₹64,365 Cr",
    exit_valuation_usd: 8.6,
    acquirer_or_exchange: "NSE/BSE",
    sector: "FoodTech",
    founded: 2008,
    founder_names: ["Deepinder Goyal", "Pankaj Chaddah"],
    founder_returns: "Deepinder's ~$660M stake at IPO",
    early_investor_return: "Info Edge: ₹4.27 Cr → ₹12,000+ Cr (2800x)",
    lead_investors: ["Info Edge", "Ant Financial", "Tiger Global", "Sequoia India"],
    what_made_them_exit_ready: [
      "Dominant market position with 45%+ food delivery market share",
      "Dual revenue streams: delivery + advertising/SaaS for restaurants",
      "Strong brand recall and Category creator in India food delivery",
      "Blinkit (then Grofers) acquisition path to quick commerce",
      "Post-COVID tailwind with at-home delivery adoption surge",
    ],
    key_lesson: "Persistence through pivots: Zomato started as a restaurant menu digitizer, pivoted to delivery, went through losses of ₹2,385 Cr the year before IPO — but the market bet on the category leadership.",
    story: "Zomato's IPO was India's landmark tech IPO of 2021, oversubscribed 38x and setting the template for Indian internet IPOs. Deepinder Goyal held onto the vision through existential moments: a leadership crisis, COVID shutting restaurants, and Swiggy gaining ground. The key was Info Edge's patient backing over 12+ years — a lesson for both founders and early-stage investors about long-horizon conviction.",
    tags: ["FoodTech", "IPO", "B2C", "Unicorn", "Delhi NCR"],
    revenue_at_exit: "₹1,994 Cr FY21",
    multiple: "38x oversubscribed IPO",
  },
  {
    id: "freshworks-ipo",
    company: "Freshworks",
    exit_type: "IPO",
    exit_year: 2021,
    exit_valuation: "₹25,000 Cr",
    exit_valuation_usd: 3.5,
    acquirer_or_exchange: "NASDAQ",
    sector: "SaaS",
    founded: 2010,
    founder_names: ["Girish Mathrubootham", "Shan Krishnasamy"],
    founder_returns: "Girish's stake worth ~$250M at IPO",
    early_investor_return: "Accel India: 500x+ return",
    lead_investors: ["Accel", "Tiger Global", "Sequoia", "Google Capital"],
    what_made_them_exit_ready: [
      "IPO-quality SaaS metrics: $371M ARR, 52,000+ customers",
      "Net dollar retention > 113% — proof of expansion revenue",
      "First Indian SaaS company to list on NASDAQ",
      "Product portfolio: 13 enterprise SaaS products across CRM, ITSM, CX",
      "Clear path to $1B ARR with healthy gross margins of 75%+",
    ],
    key_lesson: "Girish built global from Chennai. He rejected Silicon Valley's advice to relocate HQ to the US and proved world-class SaaS can be built from India. The Chennai → NASDAQ story reshaped how Indian SaaS founders think about geography.",
    story: "Freshworks' NASDAQ IPO was the moment Indian SaaS came of age. Founded in Chennai with zero pedigree (Girish wasn't ex-IIT, ex-FAANG, or ex-McKinsey), it was built through product obsession and customer success. Their early viral moment: customer NPS of 70+ while Salesforce was at 20. This became the template for India SaaS founders: compete on product delight, not just price.",
    tags: ["SaaS", "IPO", "NASDAQ", "B2B", "Chennai", "Bootstrapped early"],
    revenue_at_exit: "$371M ARR",
    multiple: "~12x ARR at IPO",
  },
  {
    id: "nykaa-ipo",
    company: "Nykaa",
    exit_type: "IPO",
    exit_year: 2021,
    exit_valuation: "₹52,574 Cr",
    exit_valuation_usd: 7.4,
    acquirer_or_exchange: "NSE/BSE",
    sector: "D2C / Beauty",
    founded: 2012,
    founder_names: ["Falguni Nayar"],
    founder_returns: "Falguni's ~$3.5B wealth at listing peak",
    early_investor_return: "TPG: 20x+ return on first investment",
    lead_investors: ["Lighthouse India", "TPG", "Steadview Capital", "Edelweiss"],
    what_made_them_exit_ready: [
      "Profitable at IPO — rare for consumer internet companies",
      "Omnichannel model: online + 80+ physical stores",
      "Nykaa Fashion diversification beyond beauty core",
      "High customer trust and loyalty in premium beauty category",
      "GMV of ₹3,320 Cr with consistent profitability",
    ],
    key_lesson: "Patience and profitability. Falguni founded Nykaa at 50 after 18 years at Kotak. She refused to chase GMV at the cost of margins. When most internet companies were burning, Nykaa was profitable. The IPO premium reflected this discipline.",
    story: "Nykaa's IPO rewrote India's startup narrative in two ways: a female founder reaching a $7B valuation, and a consumer internet company that was profitable. Falguni Nayar built a brand-led moat — customers trusted Nykaa's curation. The beauty category in India was being led by untrustworthy distributors; Nykaa's authenticity guarantee created a flywheel that's hard to replicate.",
    tags: ["D2C", "Beauty", "IPO", "Female Founder", "Omnichannel", "Mumbai"],
    revenue_at_exit: "₹2,454 Cr FY21",
    multiple: "21x revenue at peak",
  },
  {
    id: "freecharge-acquisition",
    company: "FreeCharge",
    exit_type: "Acquisition",
    exit_year: 2015,
    exit_valuation: "₹2,900 Cr",
    exit_valuation_usd: 0.45,
    acquirer_or_exchange: "Snapdeal",
    sector: "FinTech",
    founded: 2010,
    founder_names: ["Kunal Shah", "Sandeep Tandon"],
    founder_returns: "Kunal's ~$10M+ exit, enabling angel investing career",
    early_investor_return: "Sequoia India: 20x+ return",
    lead_investors: ["Sequoia India", "Ru-Net Holdings", "Tybourne Capital"],
    what_made_them_exit_ready: [
      "50M+ registered users with dominant position in mobile recharge",
      "One of India's first genuinely viral products (cashback model)",
      "Strategic acquirer need: Snapdeal needed payments to compete with Flipkart",
      "Acquisition happened before competitor Paytm dominated the space",
      "Revenue positive with strong GMV growth trajectory",
    ],
    key_lesson: "Kunal Shah's Delta-4 theory: FreeCharge created a 4-point improvement in convenience over existing phone recharge methods. The viral growth wasn't marketing — it was the product itself creating word-of-mouth. Exit timing was perfect — done before competition intensified.",
    story: "At ₹2,900 Cr ($400M+), FreeCharge was one of India's largest tech acquisitions in 2015. What made it work: Kunal understood that mobile recharge was a Trojan horse — get users doing small recharges daily, then upsell into payments. Snapdeal paid a premium because FreeCharge's distribution was something they couldn't build. Kunal then used his exit proceeds to become India's most active angel investor, funding CRED, BharatPe, Slice, and 200+ others.",
    tags: ["FinTech", "Acquisition", "Pre-Demonetisation", "Recharge", "Mumbai"],
    revenue_at_exit: "GMV of ₹3,000 Cr/year",
    multiple: "~25x revenue multiple",
  },
  {
    id: "inmobi-softbank-secondary",
    company: "InMobi",
    exit_type: "Secondary",
    exit_year: 2011,
    exit_valuation: "₹7,200 Cr",
    exit_valuation_usd: 1.0,
    acquirer_or_exchange: "SoftBank (secondary purchase)",
    sector: "AdTech",
    founded: 2007,
    founder_names: ["Naveen Tewari", "Abhay Singhal", "Amit Gupta", "Mohit Saxena"],
    founder_returns: "Early liquidity enabling founder freedom",
    early_investor_return: "Kleiner Perkins: 50x+ on early check",
    lead_investors: ["Kleiner Perkins", "Sherpalo Ventures", "SoftBank"],
    what_made_them_exit_ready: [
      "Largest mobile ad network outside Google with 1B+ device reach",
      "SoftBank strategic interest in mobile internet infrastructure",
      "First Indian startup to achieve $1B valuation (unicorn)",
      "Revenue of $150M+ with emerging markets leadership",
      "IIT Kanpur founding team with deep technical moat",
    ],
    key_lesson: "InMobi was India's first unicorn, built 4 years before the term existed. Naveen Tewari bet on mobile before smartphones. When iPhone launched in 2007, they pivoted from SMS to app-based mobile advertising. SoftBank's strategic investment gave InMobi resources to compete globally against Google AdMob.",
    story: "InMobi's $1B valuation in 2011 was a watershed moment for Indian startups — proof that India could produce globally-competitive technology companies, not just IT services firms. Founded as mKhoj (an SMS search service), they pivoted to mobile advertising just as the smartphone era began. The SoftBank deal gave them global expansion capital and credibility. Today, InMobi's Glance product reaches 400M devices.",
    tags: ["AdTech", "Global", "Unicorn Pioneer", "Bangalore", "Mobile"],
    revenue_at_exit: "$150M+ ARR",
    multiple: "~7x revenue",
  },
  {
    id: "flipkart-walmart",
    company: "Flipkart",
    exit_type: "Acquisition",
    exit_year: 2018,
    exit_valuation: "₹1,12,000 Cr",
    exit_valuation_usd: 16.0,
    acquirer_or_exchange: "Walmart",
    sector: "E-Commerce",
    founded: 2007,
    founder_names: ["Sachin Bansal", "Binny Bansal"],
    founder_returns: "Sachin: ~$700M; Binny: ~$550M",
    early_investor_return: "Accel India: ₹200 Cr → ₹6,000+ Cr (multiple >100x on initial)",
    lead_investors: ["Accel India", "Tiger Global", "Naspers", "Tencent", "SoftBank Vision Fund"],
    what_made_them_exit_ready: [
      "India's dominant e-commerce platform with 40%+ market share",
      "GMV of $7B+ and PhonePe as payment super-app",
      "Myntra and Jabong acquisitions creating fashion leadership",
      "Walmart's strategic need for India's 1.4B consumer market",
      "Amazon intensifying competition — optimal exit timing",
    ],
    key_lesson: "The Walmart-Flipkart deal created India's largest startup exit. Sachin and Binny sold their books out of IIT Delhi dorms and built India's Amazon. The lesson: never underestimate how long the game takes — 11 years from founding to exit. And the importance of strategic investors who can provide exit paths (Walmart vs. perpetual venture capital).",
    story: "India's largest acquisition remains Walmart's $16B buyout of Flipkart. Founded in 2007 as a book-selling website, Flipkart created India's e-commerce category, pioneered Cash on Delivery (essential for unbanked India), and built the supply chain infrastructure that still underpins Indian e-commerce. Accel's 2011 investment of $1M in Flipkart grew to hundreds of crores — the VC industry's return of the decade.",
    tags: ["E-Commerce", "Acquisition", "Bangalore", "IIT Alumni", "Category Creator"],
    revenue_at_exit: "$5.5B GMV",
    multiple: "$16B on $5.5B GMV (~3x GMV)",
  },
  {
    id: "delhivery-ipo",
    company: "Delhivery",
    exit_type: "IPO",
    exit_year: 2022,
    exit_valuation: "₹35,283 Cr",
    exit_valuation_usd: 4.5,
    acquirer_or_exchange: "NSE/BSE",
    sector: "Logistics",
    founded: 2011,
    founder_names: ["Sahil Barua", "Mohit Tandon", "Bhavesh Manglani", "Suraj Saharan", "Kapil Bharati"],
    founder_returns: "Sahil's ~₹100 Cr+ equity stake at IPO",
    early_investor_return: "Times Internet: 100x+ on early investment",
    lead_investors: ["Times Internet", "Nexus", "Tiger Global", "Softbank", "Fidelity"],
    what_made_them_exit_ready: [
      "India's largest fully-integrated logistics platform by revenue",
      "2M+ daily shipments with 23,000+ delivery locations",
      "Technology-first supply chain (real-time tracking, route optimization)",
      "Diversified: B2C parcels, B2B freight, warehousing, cross-border",
      "Blue Dart partnership — largest express logistics player acquisition",
    ],
    key_lesson: "Delhivery built the boring, hard infrastructure that everyone needed. No glamour — operations-heavy, asset-heavy, margin-thin at early stages. But the defensible moat of scale and route density made them irreplaceable. The IPO rewarded decade-long infrastructure building.",
    story: "From a food delivery startup to India's logistics backbone — Delhivery's story is about pivoting into the right adjacency and staying focused on operational excellence. The five co-founders from Boston Consulting Group had the management discipline to build India-wide logistics operations. Their IPO in 2022 (during a brutal market) showed the resilience of essential infrastructure businesses.",
    tags: ["Logistics", "IPO", "Operations", "B2B", "Delhi", "BCG Alumni"],
    revenue_at_exit: "₹6,882 Cr FY22",
    multiple: "~5x revenue",
  },
  {
    id: "redbus-ibibo",
    company: "redBus",
    exit_type: "Acquisition",
    exit_year: 2013,
    exit_valuation: "₹500 Cr",
    exit_valuation_usd: 0.083,
    acquirer_or_exchange: "Ibibo Group (Naspers)",
    sector: "Travel",
    founded: 2006,
    founder_names: ["Phanindra Sama", "Charan Padmaraju", "Sudhakar Pasupunuri"],
    founder_returns: "Phani's ~₹45 Cr personal exit — life-changing",
    early_investor_return: "Seedfund: 30x+ return on seed investment",
    lead_investors: ["Seedfund", "Inventus Capital", "Helion Venture Partners"],
    what_made_them_exit_ready: [
      "85% market share of online bus ticket booking in India",
      "6,000+ bus operators on platform with 2M+ monthly bookings",
      "Strong network effect: more operators → better routes → more customers",
      "Proven model: solved the fragmented offline bus booking pain point",
      "Ibibo's acquisition gave them pan-India bus network access",
    ],
    key_lesson: "Phani Sama missed a bus home for Diwali and decided to fix the bus booking system. Focus: redBus refused to expand into flights, trains, or hotels for years. That singular focus on one problem — bus booking — created an unassailable network effect in an overlooked segment.",
    story: "redBus is the cleanest example of founder-market fit and focus. Phanindra Sama wasn't a serial entrepreneur or IIT graduate — he was a Qualcomm engineer who missed a bus. The ₹500 Cr ($83M) exit to Naspers/Ibibo in 2013 was India's most celebrated acquisition at the time. It proved you don't need to build a unicorn to create meaningful founder returns. Phani went on to become one of India's most active angel investors.",
    tags: ["Travel", "Acquisition", "Network Effect", "Bangalore", "bootstrapped start"],
    revenue_at_exit: "2M+ monthly bookings",
    multiple: "~6x ARR",
  },
];

const EXIT_TYPE_COLORS: Record<string, string> = {
  "IPO": "bg-green-100 text-green-700 border-green-200",
  "Acquisition": "bg-peach-50/60 text-stone-700 border-peach-200/60",
  "Merger": "bg-peach-100/60 text-stone-700 border-peach-200/60",
  "Secondary": "bg-amber-100 text-amber-700 border-amber-200",
};

const SECTOR_COLORS: Record<string, string> = {
  "FoodTech": "text-orange-600 bg-orange-50",
  "SaaS": "text-peach-600 bg-peach-50/60",
  "D2C / Beauty": "text-peach-600 bg-peach-50/60",
  "FinTech": "text-green-600 bg-green-50",
  "AdTech": "text-peach-600 bg-peach-100/40",
  "E-Commerce": "text-peach-600 bg-peach-100/40",
  "Logistics": "text-stone-700 bg-peach-50/40",
  "Travel": "text-amber-600 bg-amber-50",
};

function ExitCard({ story }: { story: ExitStory }) {
  const [expanded, setExpanded] = useState(false);

  const years = story.exit_year - story.founded;

  return (
    <div className="glass rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-stone-900 text-lg">{story.company}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${EXIT_TYPE_COLORS[story.exit_type]}`}>
                {story.exit_type}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SECTOR_COLORS[story.sector] || "text-stone-600 bg-peach-50/40"}`}>
                {story.sector}
              </span>
              <span className="text-xs text-stone-400">{story.founded} → {story.exit_year} ({years} years)</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-stone-900">{story.exit_valuation}</p>
            <p className="text-xs text-stone-400">${story.exit_valuation_usd}B USD</p>
          </div>
        </div>

        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-peach-50/60 border border-peach-200/40 rounded-xl p-3">
            <p className="text-[10px] text-stone-400">Exit to</p>
            <p className="text-xs font-semibold text-stone-800 mt-0.5 truncate">{story.acquirer_or_exchange}</p>
          </div>
          <div className="bg-peach-50/60 border border-peach-200/40 rounded-xl p-3">
            <p className="text-[10px] text-stone-400">Investors</p>
            <p className="text-xs font-semibold text-stone-800 mt-0.5 truncate">{story.early_investor_return}</p>
          </div>
          <div className="bg-peach-50/60 border border-peach-200/40 rounded-xl p-3">
            <p className="text-[10px] text-stone-400">Founders</p>
            <p className="text-xs font-semibold text-stone-800 mt-0.5 truncate">{story.founder_names[0]}</p>
          </div>
        </div>

        {/* Story preview */}
        <p className="text-sm text-stone-600 leading-relaxed mb-3 line-clamp-2">{story.story}</p>

        {/* Key lesson */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
          <p className="text-[10px] font-semibold text-amber-700 mb-1 flex items-center gap-1">
            <Star className="w-3 h-3" /> Key Lesson
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">{story.key_lesson}</p>
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-stone-400 hover:text-stone-600 transition-colors pt-2 border-t border-peach-100/40">
          <span>{expanded ? "Show less" : "Full story & exit readiness factors"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-peach-100/40 pt-4">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Full Story</p>
              <p className="text-sm text-stone-600 leading-relaxed">{story.story}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">What Made Them Exit-Ready</p>
              <ul className="space-y-1.5">
                {story.what_made_them_exit_ready.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-peach-50/60 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-green-700 mb-1">Founder Returns</p>
                <p className="text-xs text-green-800">{story.founder_returns}</p>
              </div>
              {story.revenue_at_exit && (
                <div className="bg-peach-50/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-stone-700 mb-1">Revenue at Exit</p>
                  <p className="text-xs text-stone-800">{story.revenue_at_exit}</p>
                </div>
              )}
            </div>

            {story.multiple && (
              <div className="bg-peach-100/40 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-stone-700 mb-1">Multiple / Metric</p>
                <p className="text-xs text-stone-800">{story.multiple}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Lead Investors</p>
              <div className="flex flex-wrap gap-1">
                {story.lead_investors.map((inv) => (
                  <span key={inv} className="text-[10px] bg-peach-50/40 border border-peach-200/40 text-stone-600 px-2 py-0.5 rounded-full">{inv}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ExitsPage() {
  const [filter, setFilter] = useState<"All" | "IPO" | "Acquisition" | "Secondary">("All");
  const [sortBy, setSortBy] = useState<"valuation" | "year">("valuation");

  const filtered = EXIT_STORIES
    .filter(s => filter === "All" || s.exit_type === filter)
    .sort((a, b) => sortBy === "valuation" ? b.exit_valuation_usd - a.exit_valuation_usd : b.exit_year - a.exit_year);

  const totalValue = EXIT_STORIES.reduce((sum, s) => sum + s.exit_valuation_usd, 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
              <Award className="w-3.5 h-3.5" />
              Intelligence → Exit Stories
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Indian Startup Exit Stories</h1>
            <p className="text-stone-500 text-sm">
              8 landmark Indian startup exits — IPOs, acquisitions, and secondaries — with what made them exit-ready and what founders learned.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total exit value", value: `$${totalValue.toFixed(1)}B`, icon: DollarSign, color: "text-green-600 bg-green-50" },
              { label: "IPOs tracked", value: `${EXIT_STORIES.filter(s => s.exit_type === "IPO").length}`, icon: TrendingUp, color: "text-peach-600 bg-peach-50/60" },
              { label: "Acquisitions", value: `${EXIT_STORIES.filter(s => s.exit_type === "Acquisition").length}`, icon: Building2, color: "text-peach-600 bg-peach-100/60" },
              { label: "Avg years to exit", value: "11", icon: Calendar, color: "text-amber-600 bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 shadow-sm">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold text-stone-900">{s.value}</p>
                <p className="text-xs text-stone-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              {(["All", "IPO", "Acquisition", "Secondary"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-sm px-3 py-1.5 rounded-xl border transition-colors ${filter === f ? "btn-coral border-transparent" : "btn-ghost-peach"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-stone-400">Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-peach-200/60 rounded-xl px-3 py-1.5 focus:outline-none bg-white text-stone-700">
                <option value="valuation">By Valuation</option>
                <option value="year">By Year</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-stone-400 mb-4">Showing {filtered.length} exit stories</p>

          <div className="grid sm:grid-cols-2 gap-5">
            {filtered.map((s) => <ExitCard key={s.id} story={s} />)}
          </div>

          {/* Common patterns */}
          <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" /> Common patterns across all exits
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Avg time to exit: 8-12 years", desc: "None of these were overnight successes. Patient capital and founder persistence are common threads." },
                { title: "Category creation > category capture", desc: "Most created new categories rather than competing in existing ones (bus booking, food delivery, beauty ecommerce)." },
                { title: "India-first, not India-only", desc: "FreeCharge, Freshworks, InMobi all built for India's unique constraints first, then expanded." },
              ].map((p) => (
                <div key={p.title} className="glass rounded-xl p-4">
                  <p className="font-semibold text-stone-900 text-sm mb-1">{p.title}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
