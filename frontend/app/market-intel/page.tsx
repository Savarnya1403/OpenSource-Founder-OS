"use client";
import { useState } from "react";
import { Search, TrendingUp, BarChart3, Globe, Users, DollarSign, Building2, Lightbulb, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

interface SectorData {
  id: string;
  name: string;
  emoji: string;
  tam_global: string;
  tam_india: string;
  sam_india: string;
  som_india: string;
  cagr: string;
  market_size_2030: string;
  key_drivers: string[];
  key_challenges: string[];
  top_players: string[];
  top_funded_startups: string[];
  investor_interest: "Very High" | "High" | "Moderate" | "Emerging";
  regulatory_complexity: "Low" | "Moderate" | "High" | "Very High";
  avg_arpu: string;
  avg_cac: string;
  avg_ltv: string;
  ideal_gtm: string;
  key_metrics_to_track: string[];
  recent_trend: string;
  white_spaces: string[];
}

const SECTORS: SectorData[] = [
  {
    id: "fintech",
    name: "FinTech",
    emoji: "💰",
    tam_global: "$310B (2024)",
    tam_india: "₹24 lakh Cr ($291B)",
    sam_india: "₹6 lakh Cr ($72B)",
    som_india: "₹60,000 Cr ($7.2B)",
    cagr: "18% CAGR",
    market_size_2030: "$350B (India FinTech)",
    key_drivers: ["UPI adoption (14B+ transactions/month)", "Financial inclusion push", "India Stack (AA, OCEN, ONDC)", "Rising smartphone penetration", "Jan Dhan accounts reach"],
    key_challenges: ["RBI regulatory changes", "High customer acquisition cost", "Credit risk for new-to-credit users", "Trust building in tier 2/3"],
    top_players: ["Paytm", "PhonePe", "Google Pay", "Razorpay", "CRED", "Zerodha", "Groww"],
    top_funded_startups: ["Slice", "KreditBee", "Open", "Jar", "Fisdom", "INDmoney", "smallcase"],
    investor_interest: "Very High",
    regulatory_complexity: "High",
    avg_arpu: "₹2,000–₹20,000/year (varies by segment)",
    avg_cac: "₹500–₹5,000 (consumer); ₹5,000–₹50,000 (SMB)",
    avg_ltv: "₹5,000–₹200,000+ (based on credit product)",
    ideal_gtm: "Freemium → paid conversion; distribution via UPI apps; B2B via banks/NBFCs",
    key_metrics_to_track: ["TPV (Total Payment Volume)", "Revenue Take Rate", "Credit NIM", "Gross NPAs", "Customer LTV", "CAC Payback Period"],
    recent_trend: "Account Aggregator ecosystem enabling open finance; embedded finance booming; RBI sandbox enables new experiments",
    white_spaces: ["MSME credit gap ($380B)", "Insurance for gig workers", "Cross-border payments for SMEs", "Rural wealth management", "Invoice financing for D2C brands"],
  },
  {
    id: "edtech",
    name: "EdTech",
    emoji: "📚",
    tam_global: "$400B (2024)",
    tam_india: "₹2.5 lakh Cr ($30B)",
    sam_india: "₹60,000 Cr ($7.2B)",
    som_india: "₹6,000 Cr ($720M)",
    cagr: "16% CAGR",
    market_size_2030: "$10B (India EdTech)",
    key_drivers: ["70M engineering/MBA aspirants", "Skill gap in workforce", "NEP 2020 digital push", "Rising disposable income for education", "Rise of vernacular learning"],
    key_challenges: ["Post-COVID demand correction", "High refund rates", "Content quality vs quantity", "Outcome accountability", "Teacher discovery"],
    top_players: ["BYJU'S", "Unacademy", "Vedantu", "upGrad", "Simplilearn"],
    top_funded_startups: ["Classplus", "LeapScholar", "Eruditus", "Masai School", "Physics Wallah"],
    investor_interest: "Moderate",
    regulatory_complexity: "Low",
    avg_arpu: "₹15,000–₹2,00,000/year (test prep to upskilling)",
    avg_cac: "₹1,500–₹20,000 (B2C); ₹20,000–₹1,00,000 (B2B)",
    avg_ltv: "₹30,000–₹5,00,000 (lifetime)",
    ideal_gtm: "YouTube-first content → paid conversion; teacher branding; regional language expansion",
    key_metrics_to_track: ["Course Completion Rate", "Outcome Metrics (placement %)", "Refund Rate", "MoM Enrollments", "Teacher NPS", "B2B DRHP"],
    recent_trend: "Post-BYJU's correction — investors want outcome-based, capital-efficient models. Skill-based EdTech for workforce is hot.",
    white_spaces: ["Vocational training at scale", "AI tutors for vernacular learners", "Corporate L&D SaaS", "Coding schools for non-engineers", "Study abroad prep + financing"],
  },
  {
    id: "healthtech",
    name: "HealthTech",
    emoji: "🏥",
    tam_global: "$660B (2024)",
    tam_india: "₹4.5 lakh Cr ($54B)",
    sam_india: "₹90,000 Cr ($10.8B)",
    som_india: "₹9,000 Cr ($1.08B)",
    cagr: "22% CAGR",
    market_size_2030: "$18B (India HealthTech)",
    key_drivers: ["Post-COVID digital health adoption", "Doctor shortage (India has 1:1456 vs WHO recommendation 1:1000)", "Ayushman Bharat digital mission", "ABHA health IDs", "Rising chronic disease burden"],
    key_challenges: ["Doctor adoption is slow", "Trust in digital health", "HIPAA/data privacy", "Unit economics in diagnostics", "Insurance penetration is low"],
    top_players: ["1mg", "Practo", "Netmeds", "Apollo 24/7", "Pristyn Care"],
    top_funded_startups: ["MFine", "Cure.fit", "HealthifyMe", "Pristyn Care", "Innovaccer"],
    investor_interest: "High",
    regulatory_complexity: "Very High",
    avg_arpu: "₹5,000–₹50,000/year (consumer health to chronic care)",
    avg_cac: "₹1,000–₹5,000 (consumer); ₹20,000–₹1,00,000 (hospital SaaS)",
    avg_ltv: "₹20,000–₹3,00,000 (chronic conditions have highest LTV)",
    ideal_gtm: "B2B via hospital EMR systems; B2B2C via corporate health benefits; D2C via preventive health",
    key_metrics_to_track: ["Consultation Volume", "Repeat Rate", "Patient Outcomes", "Bed Utilization (for ops)", "NPS", "CAC Payback"],
    recent_trend: "AI diagnostics, preventive health monitoring, home diagnostics. ABDM ecosystem enabling health data portability.",
    white_spaces: ["Mental health access gap", "Elderly care tech", "Home ICU / HDU", "Fertility tech", "AI radiology for tier 2 hospitals"],
  },
  {
    id: "agritech",
    name: "AgriTech",
    emoji: "🌾",
    tam_global: "$22B (2024)",
    tam_india: "₹1.5 lakh Cr ($18B)",
    sam_india: "₹30,000 Cr ($3.6B)",
    som_india: "₹3,000 Cr ($360M)",
    cagr: "25% CAGR",
    market_size_2030: "$24B (India AgriTech)",
    key_drivers: ["150M+ farmer base", "Government push (PM-KISAN, AgriStack)", "Cold chain infrastructure investment", "FPO formation", "Agri credit gap"],
    key_challenges: ["Last-mile connectivity in rural India", "Farmer digital literacy", "Crop price volatility", "High working capital needs", "Monsoon dependency"],
    top_players: ["BigHaat", "Ninjacart", "AgroStar", "DeHaat", "Waycool"],
    top_funded_startups: ["Stellapps", "CropIn", "Fasal", "Otipy", "Kheyti"],
    investor_interest: "High",
    regulatory_complexity: "Moderate",
    avg_arpu: "₹2,000–₹20,000/farmer/year",
    avg_cac: "₹500–₹3,000/farmer (on-ground)",
    avg_ltv: "₹10,000–₹50,000 (input + output + credit)",
    ideal_gtm: "Field agent model; FPO partnerships; kisan credit card integration",
    key_metrics_to_track: ["Active Farmers", "GMV per Farmer", "Input + Output Market Share", "Credit Disbursed", "Yield Improvement %"],
    recent_trend: "AgriStack enabling farmer identity and land records. Drone agri services scaling. Precision farming with IoT sensors.",
    white_spaces: ["Post-harvest loss reduction (40% of produce wasted)", "Agri insurance tech", "Drone-as-a-service", "FPO fintech", "B2B fresh produce supply chain"],
  },
  {
    id: "saas-b2b",
    name: "B2B SaaS",
    emoji: "💻",
    tam_global: "$300B+ (2024)",
    tam_india: "₹40,000 Cr ($48B) — India-built SaaS serving global markets",
    sam_india: "₹10,000 Cr ($12B)",
    som_india: "₹1,000 Cr ($1.2B)",
    cagr: "20% CAGR",
    market_size_2030: "$50B (India-built global SaaS)",
    key_drivers: ["Strong engineering talent at low cost", "India Stack enabling new verticals", "Global SaaS demand from SMBs", "India as growth market", "Dollar revenue advantage"],
    key_challenges: ["Sales cycle in India is long", "Dollar pricing sensitivity", "Customer success at scale", "Security compliance (SOC2, ISO)"],
    top_players: ["Freshworks", "Zoho", "Chargebee", "Postman", "BrowserStack"],
    top_funded_startups: ["Darwinbox", "Whatfix", "Exotel", "Skit.ai", "Nanonets"],
    investor_interest: "Very High",
    regulatory_complexity: "Low",
    avg_arpu: "$500–$50,000 ACV (SMB to Enterprise)",
    avg_cac: "$200–$2,000 (PLG); $5,000–$50,000 (Enterprise sales)",
    avg_ltv: "$2,000–$200,000+ (5-year LTV)",
    ideal_gtm: "Product-led growth → inside sales → field sales; start global from day one",
    key_metrics_to_track: ["MRR/ARR", "Net Revenue Retention (NRR)", "CAC Payback", "Rule of 40", "Churn Rate", "Magic Number"],
    recent_trend: "AI-native SaaS replacing legacy tools. Vertical SaaS (logistics, healthcare, construction) gaining traction. India SaaS going upmarket.",
    white_spaces: ["Legal tech for Indian SMBs", "Construction ERP", "School management SaaS", "Pharma sales automation", "Logistics TMS for D2C"],
  },
  {
    id: "d2c",
    name: "D2C / Consumer Brands",
    emoji: "🛒",
    tam_global: "$400B (D2C globally)",
    tam_india: "₹1.5 lakh Cr ($18B) — Indian D2C brands",
    sam_india: "₹30,000 Cr ($3.6B) — digitally native",
    som_india: "₹3,000 Cr ($360M)",
    cagr: "38% CAGR",
    market_size_2030: "$100B (India D2C)",
    key_drivers: ["300M+ online shoppers", "Instagram/YouTube discovery", "Affordable packaging", "Brand awareness vs price", "Millennial/Gen-Z spending power"],
    key_challenges: ["Customer acquisition costs rising 3x in 5 years", "Return rates on Flipkart/Amazon (20-30%)", "Working capital for inventory", "Brand differentiation", "Offline distribution costs"],
    top_players: ["Mamaearth", "Sugar Cosmetics", "Boat", "MCaffeine", "Licious"],
    top_funded_startups: ["WOW Skin Science", "The Whole Truth", "Minimalist", "Pilgrim", "Neemans"],
    investor_interest: "Moderate",
    regulatory_complexity: "Low",
    avg_arpu: "₹1,000–₹10,000 per order",
    avg_cac: "₹300–₹3,000 (online D2C)",
    avg_ltv: "₹3,000–₹30,000 (2-3 year LTV)",
    ideal_gtm: "DTC website first → Amazon/Flipkart → Offline retail; content-first brand building",
    key_metrics_to_track: ["Repeat Purchase Rate", "CAC", "LTV/CAC", "Gross Margin", "Return Rate", "ROAS"],
    recent_trend: "Offline expansion is the moat. Pure D2C is getting harder; brands with omnichannel win. Quick commerce (Zepto/Blinkit) is new distribution.",
    white_spaces: ["Sustainable D2C packaging", "Men's personal care", "Pet care premium", "Ayurveda + science fusion", "Vernacular FMCG"],
  },
  {
    id: "quickcommerce",
    name: "Quick Commerce",
    emoji: "⚡",
    tam_global: "$40B (2024)",
    tam_india: "₹90,000 Cr ($10.8B)",
    sam_india: "₹20,000 Cr ($2.4B) — top 10 cities",
    som_india: "₹5,000 Cr ($600M)",
    cagr: "45% CAGR",
    market_size_2030: "$25B (India quick commerce)",
    key_drivers: ["Urban convenience premium", "Dense city infrastructure", "Dark store economics improving", "Millennial impulse buying", "Phone-first grocery shopping"],
    key_challenges: ["Profitability at scale is hard", "Last-mile delivery costs", "Dark store rent", "Limited to top 15 cities currently", "Competitive intensity (Zepto, Blinkit, Swiggy Instamart)"],
    top_players: ["Blinkit (Zomato)", "Zepto", "Swiggy Instamart"],
    top_funded_startups: ["Zepto", "Fraazo", "Dunzo"],
    investor_interest: "High",
    regulatory_complexity: "Low",
    avg_arpu: "₹350–₹700 per order; 3-5 orders/month active users",
    avg_cac: "₹200–₹500 (consumer acquisition)",
    avg_ltv: "₹5,000–₹20,000 (2-year LTV if retained)",
    ideal_gtm: "Dark store density → geographic expansion → private label for margin",
    key_metrics_to_track: ["Average Order Value (AOV)", "Orders per Dark Store/Day", "Delivery Time p50/p99", "Contribution Margin per Order", "Customer Retention (30-day)"],
    recent_trend: "Moving from groceries to electronics, pharmacy, fashion. Dark stores approaching retail-level SKU density.",
    white_spaces: ["Tier 2 quick commerce (Jaipur, Surat, Coimbatore)", "B2B quick commerce for restaurants", "Pet food & specialty D2C via Q-commerce"],
  },
  {
    id: "cleantech",
    name: "CleanTech / Climate",
    emoji: "🌿",
    tam_global: "$2.5T (2024)",
    tam_india: "₹2 lakh Cr ($24B)",
    sam_india: "₹40,000 Cr ($4.8B) — EV, solar, energy efficiency",
    som_india: "₹4,000 Cr ($480M)",
    cagr: "30% CAGR",
    market_size_2030: "$100B (India CleanTech)",
    key_drivers: ["India's 500GW solar target", "EV policy push (FAME II/III)", "CCUS mandates", "Corporate ESG commitments", "Carbon credit market growth"],
    key_challenges: ["High CapEx requirements", "Grid stability challenges", "Subsidy dependency", "Long sales cycles for B2B energy", "Regulatory uncertainty"],
    top_players: ["Ola Electric", "Ather Energy", "Tata EV", "Greenko", "ReNew Power"],
    top_funded_startups: ["Yulu", "BattRE", "Log9 Materials", "Zypp Electric", "Euler Motors"],
    investor_interest: "Very High",
    regulatory_complexity: "High",
    avg_arpu: "Varies widely — fleet EV (₹50K+/vehicle/year) to consumer solar (₹20K/year savings)",
    avg_cac: "₹5,000–₹50,000 (B2B); ₹1,000–₹10,000 (consumer EV)",
    avg_ltv: "₹50,000–₹5,00,000 (fleet/commercial)",
    ideal_gtm: "B2B fleet operators → large commercial customers → consumer; government tenders for renewable infra",
    key_metrics_to_track: ["GW capacity installed", "CO2e reduced per ₹1 invested", "EV fleet uptime %", "Levelized Cost of Electricity (LCOE)", "Battery cycle life"],
    recent_trend: "EV charging infrastructure race. Battery recycling becoming critical. India's carbon market (CCTS) launching.",
    white_spaces: ["Green hydrogen for heavy industry", "EV charging for highways", "Industrial decarbonization SaaS", "Carbon accounting for Indian SMEs", "Clean cooling tech"],
  },
  {
    id: "deeptech-ai",
    name: "Deep Tech / AI",
    emoji: "🤖",
    tam_global: "$1.3T (AI, 2024)",
    tam_india: "₹2.5 lakh Cr ($30B) — India AI market",
    sam_india: "₹50,000 Cr ($6B) — enterprise AI",
    som_india: "₹5,000 Cr ($600M)",
    cagr: "35% CAGR",
    market_size_2030: "$17B (India AI opportunity)",
    key_drivers: ["Cheapest AI engineers globally", "India Stack providing data moats", "MeitY AI push", "Enterprise digitization backlog", "India as AI product builder"],
    key_challenges: ["GPU access and cost", "Data quality for Indian languages", "Talent war vs global tech", "Copyright and IP clarity", "Enterprise procurement cycles"],
    top_players: ["TCS", "Infosys", "Wipro (AI divisions)", "Krutrim", "Sarvam AI"],
    top_funded_startups: ["Sarvam AI", "Portkey.ai", "Mihup", "Yellow.ai", "Gnani.ai"],
    investor_interest: "Very High",
    regulatory_complexity: "Moderate",
    avg_arpu: "$10K–$500K ACV (enterprise AI contracts)",
    avg_cac: "$5,000–$100,000 (enterprise sales cycles)",
    avg_ltv: "$50,000–$5M+ (multi-year enterprise deals)",
    ideal_gtm: "Developer-first → bottom-up enterprise adoption; build vertical AI for specific industries",
    key_metrics_to_track: ["Model accuracy/BLEU scores", "Inference latency", "GPU utilization", "Enterprise ACV", "API calls/day", "Model drift metrics"],
    recent_trend: "India-specific LLMs (Sarvam, Krutrim) gaining traction. Agentic AI for enterprise workflows. GenAI for Indian languages.",
    white_spaces: ["Vernacular AI (22 Indian languages)", "AI for judicial system", "Agriculture AI for crop diseases", "Healthcare diagnosis AI for tier 2", "Manufacturing defect detection AI"],
  },
  {
    id: "hrtech",
    name: "HR Tech",
    emoji: "👥",
    tam_global: "$40B (2024)",
    tam_india: "₹15,000 Cr ($1.8B)",
    sam_india: "₹5,000 Cr ($600M) — mid-market and enterprise",
    som_india: "₹500 Cr ($60M)",
    cagr: "15% CAGR",
    market_size_2030: "$5B (India HR Tech)",
    key_drivers: ["Indian workforce formalization", "PF/ESI digitization", "Remote work tooling needs", "Hire-to-retire digitization", "Gig economy growth"],
    key_challenges: ["India has thousands of labor laws", "State-level compliance complexity", "SMB willingness to pay", "Integration with payroll systems", "Data sensitivity"],
    top_players: ["Darwinbox", "Keka", "greytHR", "Zoho People", "HROne"],
    top_funded_startups: ["Workex", "SpringVerify", "Leena AI", "Beehive HR", "Superbeings"],
    investor_interest: "High",
    regulatory_complexity: "High",
    avg_arpu: "₹300–₹1,500 per employee per month",
    avg_cac: "₹5,000–₹50,000 (per company)",
    avg_ltv: "₹1,00,000–₹20,00,000 (5-year enterprise contract)",
    ideal_gtm: "SMB land-and-expand; self-serve for <50 employees; sales-led for enterprise",
    key_metrics_to_track: ["Seat/Employee count", "NRR (Net Revenue Retention)", "Payroll processed", "Compliance accuracy", "Time-to-hire"],
    recent_trend: "AI-powered recruiting (screening, JD generation). HRMS with embedded finance (salary advance). Gig worker management.",
    white_spaces: ["Blue-collar HR tech", "Gig worker HRMS", "AI background verification", "Employee mental health platform", "Contractor management for Indian companies"],
  },
];

const INVESTOR_INTEREST_COLORS: Record<string, string> = {
  "Very High": "bg-green-100 text-green-700",
  "High": "bg-peach-50/60 text-stone-700",
  "Moderate": "bg-yellow-100 text-yellow-700",
  "Emerging": "bg-peach-100/60 text-stone-600",
};

const REGULATORY_COLORS: Record<string, string> = {
  "Low": "bg-green-100 text-green-700",
  "Moderate": "bg-yellow-100 text-yellow-700",
  "High": "bg-orange-100 text-orange-700",
  "Very High": "bg-red-100 text-red-700",
};

function SectorCard({ sector }: { sector: SectorData }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{sector.emoji}</span>
              <h3 className="font-bold text-stone-900 text-lg">{sector.name}</h3>
            </div>
            <p className="text-xs text-stone-500">{sector.cagr} · Target {sector.market_size_2030}</p>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${INVESTOR_INTEREST_COLORS[sector.investor_interest]}`}>
              {sector.investor_interest} investor interest
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${REGULATORY_COLORS[sector.regulatory_complexity]}`}>
              {sector.regulatory_complexity} regulatory complexity
            </span>
          </div>
        </div>

        {/* Market sizes */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "TAM India", value: sector.tam_india, color: "bg-peach-50/60 text-stone-707" },
            { label: "SAM India", value: sector.sam_india, color: "bg-peach-100/40 text-stone-700" },
            { label: "SOM India", value: sector.som_india, color: "bg-green-50 text-green-700" },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl p-3 ${m.color}`}>
              <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.label}</p>
              <p className="text-xs font-bold">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Unit economics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-[10px] text-stone-400 font-medium">Avg ARPU</p>
            <p className="text-xs font-semibold text-stone-700 mt-0.5">{sector.avg_arpu}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-stone-400 font-medium">Avg CAC</p>
            <p className="text-xs font-semibold text-stone-700 mt-0.5">{sector.avg_cac}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-stone-400 font-medium">Avg LTV</p>
            <p className="text-xs font-semibold text-stone-700 mt-0.5">{sector.avg_ltv}</p>
          </div>
        </div>

        {/* Trend */}
        <div className="bg-peach-50/60 rounded-xl px-3 py-2 mb-4">
          <div className="flex items-start gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-peach-500 mt-0.5 shrink-0" />
            <p className="text-xs text-stone-800">{sector.recent_trend}</p>
          </div>
        </div>

        {/* White spaces */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> White Space Opportunities
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sector.white_spaces.slice(0, 3).map((w) => (
              <span key={w} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{w}</span>
            ))}
            {sector.white_spaces.length > 3 && (
              <span className="text-[10px] text-stone-400">+{sector.white_spaces.length - 3} more</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Hide" : "Show"} full intelligence report
        </button>

        {expanded && (
          <div className="mt-4 border-t border-peach-100/40 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Key Drivers</p>
                <ul className="space-y-1">
                  {sector.key_drivers.map((d) => (
                    <li key={d} className="flex items-start gap-1.5 text-xs text-stone-600">
                      <span className="text-green-500 mt-0.5">✓</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Key Challenges</p>
                <ul className="space-y-1">
                  {sector.key_challenges.map((c) => (
                    <li key={c} className="flex items-start gap-1.5 text-xs text-stone-600">
                      <span className="text-red-400 mt-0.5">⚠</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Ideal GTM Strategy</p>
              <p className="text-xs text-stone-600">{sector.ideal_gtm}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Key Metrics to Track</p>
              <div className="flex flex-wrap gap-1.5">
                {sector.key_metrics_to_track.map((m) => (
                  <span key={m} className="text-[10px] bg-peach-50/40 text-stone-600 border border-peach-200/40 px-2 py-0.5 rounded-full">{m}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Incumbents</p>
                <div className="flex flex-wrap gap-1">
                  {sector.top_players.map((p) => (
                    <span key={p} className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Funded Challengers</p>
                <div className="flex flex-wrap gap-1">
                  {sector.top_funded_startups.map((s) => (
                    <span key={s} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">All White Spaces</p>
              <div className="flex flex-wrap gap-1.5">
                {sector.white_spaces.map((w) => (
                  <span key={w} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{w}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketIntelPage() {
  const [search, setSearch] = useState("");
  const [interestFilter, setInterestFilter] = useState("");

  const filtered = SECTORS.filter((s) => {
    const q = search.toLowerCase();
    return (
      (!q || s.name.toLowerCase().includes(q) || s.white_spaces.some((w) => w.toLowerCase().includes(q))) &&
      (!interestFilter || s.investor_interest === interestFilter)
    );
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Market Intelligence</h1>
            <p className="text-stone-500 text-sm">
              TAM/SAM/SOM, unit economics benchmarks, white spaces, and competitive landscapes for {SECTORS.length} major Indian startup sectors.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Sectors Covered", value: `${SECTORS.length}`, color: "text-peach-600" },
              { label: "White Space Opportunities", value: `${SECTORS.reduce((a, s) => a + s.white_spaces.length, 0)}+`, color: "text-amber-600" },
              { label: "India TAM (est.)", value: "$400B+", color: "text-green-600" },
              { label: "India Startup Funding (2024)", value: "$10B+", color: "text-peach-600" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center shadow-sm">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sectors or white space opportunities..."
                className="w-full pl-9 pr-4 py-2.5 border border-peach-200/60 glass rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400" />
            </div>
            <select value={interestFilter} onChange={(e) => setInterestFilter(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-peach-200/60 glass rounded-lg text-sm focus:outline-none focus:outline-none focus:border-peach-400">
              <option value="">All investor interest</option>
              <option value="Very High">Very High</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Emerging">Emerging</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {filtered.map((sector) => <SectorCard key={sector.id} sector={sector} />)}
          </div>
        </div>
      </main>
    </div>
  );
}
