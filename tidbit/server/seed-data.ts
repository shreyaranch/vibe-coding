// Fictional demo content. Every publisher, town, person and event below is invented
// and is shown in the app with a "Demo" label. Nothing here describes real news.

import type { ClaimType, ContentType, PostMedia, Tone, TrendScope } from "../shared/types.ts";

export const CATEGORIES = [
  { slug: "world", name: "World News", icon: "globe", description: "Stories from around the globe." },
  { slug: "politics", name: "Politics", icon: "landmark", description: "Government, policy and civic life." },
  { slug: "business", name: "Business", icon: "briefcase", description: "Companies, work and the economy." },
  { slug: "finance", name: "Finance", icon: "trending-up", description: "Markets, rates and money." },
  { slug: "technology", name: "Technology", icon: "cpu", description: "Devices, software and the internet." },
  { slug: "ai", name: "Artificial Intelligence", icon: "sparkles", description: "AI research, products and policy." },
  { slug: "healthcare", name: "Healthcare", icon: "heart-pulse", description: "Health systems, care and wellbeing." },
  { slug: "science", name: "Science", icon: "flask-conical", description: "Research and discovery." },
  { slug: "startups", name: "Startups", icon: "rocket", description: "New companies and founders." },
  { slug: "sports", name: "Sports", icon: "trophy", description: "Games, teams and athletes." },
  { slug: "entertainment", name: "Entertainment", icon: "clapperboard", description: "Film, music and culture." },
  { slug: "environment", name: "Environment", icon: "trees", description: "Nature, conservation and cities." },
  { slug: "climate", name: "Climate", icon: "thermometer-sun", description: "Climate change and adaptation." },
  { slug: "lifestyle", name: "Lifestyle", icon: "coffee", description: "Everyday living and wellbeing." },
  { slug: "education", name: "Education", icon: "graduation-cap", description: "Schools, learning and skills." },
  { slug: "local", name: "Local News", icon: "map-pin", description: "What is happening near you." },
];

export const PUBLISHERS = [
  { handle: "dailybrief", name: "The Daily Brief", logoText: "DB", color: "#35D5B1", location: "Port Avalon, Ontario", followers: 48200,
    description: "Independent reporting on global events, business, and technology.", ownership: "Fictional reader-funded cooperative (demo)" },
  { handle: "northline", name: "Northline News", logoText: "NL", color: "#4F8CFF", location: "Maple Crossing, Ontario", followers: 31800,
    description: "Local and national stories from across the North, told plainly.", ownership: "Fictional independent newsroom (demo)" },
  { handle: "meridian", name: "Meridian Report", logoText: "MR", color: "#A78BFA", location: "Saint-Lumière, Quebec", followers: 27400,
    description: "Politics, policy and world affairs, with analysis kept separate from reporting.", ownership: "Fictional nonprofit foundation (demo)" },
  { handle: "circuitcode", name: "Circuit & Code", logoText: "C&", color: "#22D3EE", location: "Lumen City", followers: 39600,
    description: "Technology, AI and startups, explained without the hype.", ownership: "Fictional employee-owned media company (demo)" },
  { handle: "pulsehealth", name: "Pulse Health Desk", logoText: "PH", color: "#F472B6", location: "Ashford Vale, England", followers: 22100,
    description: "Health and science reporting reviewed by our fictional medical editors.", ownership: "Fictional public-interest trust (demo)" },
  { handle: "greenwire", name: "Greenwire", logoText: "GW", color: "#34D399", location: "Cedarbrook, British Columbia", followers: 19700,
    description: "Climate, environment and the places we live.", ownership: "Fictional nonprofit newsroom (demo)" },
  { handle: "markethour", name: "Market Hour", logoText: "MH", color: "#FBBF24", location: "Harbor Point, California", followers: 25300,
    description: "Business and markets in plain language. Not financial advice.", ownership: "Fictional privately held publisher (demo)" },
  { handle: "fieldhouse", name: "Fieldhouse", logoText: "FH", color: "#FF786B", location: "Glenmoray, Scotland", followers: 16900,
    description: "Sports from community pitches to cup finals.", ownership: "Fictional independent sports desk (demo)" },
];

export const DEMO_READERS = [
  { username: "avareads", name: "Ava Lin", bio: "Curious about tech, healthcare, and everything shaping tomorrow.", city: "Port Avalon", region: "Ontario", country: "Canada", interests: ["technology", "ai", "healthcare"] },
  { username: "marcusb", name: "Marcus Bell", bio: "Transit nerd. Will talk about bus frequency for hours.", city: "Port Avalon", region: "Ontario", country: "Canada", interests: ["local", "politics", "business"] },
  { username: "priyanair", name: "Priya Nair", bio: "Climate and cities. Reading everything twice.", city: "Silverline City", region: "Karnataka", country: "India", interests: ["climate", "environment", "startups"] },
  { username: "leo.ok", name: "Leo Okafor", bio: "Markets by day, football by night.", city: "Harbor Point", region: "California", country: "United States", interests: ["finance", "business", "sports"] },
  { username: "sofiaruiz", name: "Sofia Ruiz", bio: "Nurse. Here for the health explainers.", city: "Maple Crossing", region: "Ontario", country: "Canada", interests: ["healthcare", "science", "lifestyle"] },
  { username: "dankim", name: "Daniel Kim", bio: "Product designer. Likes good charts.", city: "Cedarbrook", region: "British Columbia", country: "Canada", interests: ["technology", "climate", "entertainment"] },
];

export const STORY_GROUPS = {
  transit: { headline: "Port Avalon weighs a 12-route transit expansion", category: "local", region: "Ontario",
    summary: "Port Avalon's council is debating a plan to add routes and raise service frequency.",
    background: "Port Avalon (a fictional city) has grown quickly, and its bus network has not kept up. The plan under debate would add routes, increase frequency on busy corridors and change fares. Coverage below shows how three demo publishers reported and interpreted it." },
  rates: { headline: "Understanding interest-rate changes", category: "finance", region: "Global",
    summary: "Explainers and data on why rates move and what changes mean for borrowers.",
    background: "Central banks raise or lower their policy rates to steer inflation and employment. These demo posts explain the mechanics with illustrative numbers rather than any specific real-world decision." },
  helix: { headline: "Quanta Labs releases its Helix-7 open model", category: "ai", region: "Global",
    summary: "A fictional AI lab says its new model is openly available; regulators and researchers are responding.",
    background: "Quanta Labs is a fictional AI company in the fictional Lumen City. The story shows how a fast-moving technology announcement develops: an initial claim, early unconfirmed details, explainers and regulatory follow-up." },
  wildfire: { headline: "Cedarbrook prepares for an early wildfire season", category: "climate", region: "British Columbia",
    summary: "Advisories, air-quality guidance and preparation work in the fictional town of Cedarbrook.",
    background: "Cedarbrook is a fictional town. This cluster pairs an advisory with practical guidance, so readers get context and useful steps rather than alarm alone." },
  clinic: { headline: "Maple Crossing tests same-day clinic booking", category: "healthcare", region: "Ontario",
    summary: "A fictional clinic network's booking pilot and its first month of results.",
    background: "The pilot in the fictional town of Maple Crossing lets patients book same-day appointments online. Early numbers are illustrative demo data." },
  rovers: { headline: "Glenmoray Rovers reach the Highland Cup final", category: "sports", region: "Scotland",
    summary: "A fictional small-town football club's cup run.",
    background: "Glenmoray Rovers are a fictional club. Coverage spans match reporting, a feature on their youth programme and a by-the-numbers look at the final." },
  port: { headline: "Harbor Point port: record volumes, then a terminal pause", category: "business", region: "California",
    summary: "The fictional port's busy quarter and a precautionary inspection.",
    background: "Harbor Point is a fictional port city. The cluster shows how a business story can change as new information arrives." },
} as const;

export type GroupKey = keyof typeof STORY_GROUPS;

export interface SeedPoll {
  question: string;
  context?: string;
  type: "single" | "multiple" | "yes_no" | "scale";
  placement: "embedded" | "end_of_video" | "after_slides" | "action_bar";
  options: [string, number][];
  verifiedOnly?: boolean;
}

export interface SeedPost {
  pub: string;
  type: ContentType;
  cat: string;
  headline: string;
  summary: string;
  tags: string[];
  place: [city: string, region: string, country: string];
  scope: TrendScope;
  claim?: ClaimType;
  tone?: Tone;
  hoursAgo: number;
  pop: number;
  group?: GroupKey;
  media?: PostMedia;
  sources: string[];
  poll?: SeedPoll;
  correction?: string;
}

const PA: SeedPost["place"] = ["Port Avalon", "Ontario", "Canada"];
const MC: SeedPost["place"] = ["Maple Crossing", "Ontario", "Canada"];
const CB: SeedPost["place"] = ["Cedarbrook", "British Columbia", "Canada"];
const SL: SeedPost["place"] = ["Saint-Lumière", "Quebec", "Canada"];
const HP: SeedPost["place"] = ["Harbor Point", "California", "United States"];
const BW: SeedPost["place"] = ["Brightwater", "New York", "United States"];
const RM: SeedPost["place"] = ["Red Mesa", "Texas", "United States"];
const AV: SeedPost["place"] = ["Ashford Vale", "England", "United Kingdom"];
const GM: SeedPost["place"] = ["Glenmoray", "Scotland", "United Kingdom"];
const SC: SeedPost["place"] = ["Silverline City", "Karnataka", "India"];
const LC: SeedPost["place"] = ["Lumen City", "", ""];
const GLOBAL: SeedPost["place"] = ["", "", ""];

export const POSTS: SeedPost[] = [
  // 1
  { pub: "northline", type: "video", cat: "local", group: "transit", place: PA, scope: "local", hoursAgo: 3, pop: 2140,
    headline: "Port Avalon council to vote on a 12-route transit expansion",
    summary: "Councillors will vote next week on a plan to add 12 bus routes and run the busiest lines every 8 minutes. Here is what is in it.",
    tags: ["transit", "city council", "port avalon"],
    sources: ["Port Avalon council meeting agenda (fictional)", "Northline interview with the transit planning office (fictional)"],
    media: { scenes: [
      { kicker: "PORT AVALON", text: "Council votes next week on the biggest transit change in a decade.", duration: 4 },
      { kicker: "THE PLAN", text: "12 new bus routes, mostly in fast-growing east-end neighbourhoods.", stat: "12 routes", duration: 4 },
      { kicker: "FREQUENCY", text: "The four busiest corridors would run every 8 minutes at peak times.", stat: "8 min", duration: 4 },
      { kicker: "THE COST", text: "Staff estimate the first phase would cost about $46 million over three years.", stat: "$46M", duration: 4 },
      { kicker: "WHAT'S NEXT", text: "Residents can comment until Friday. The vote is scheduled for Tuesday.", duration: 4 },
    ] },
    poll: { question: "What should be the top priority?", context: "Asked alongside Port Avalon's transit vote.", type: "single", placement: "end_of_video",
      options: [["More frequent service", 412], ["Lower ticket prices", 298], ["Expanded routes", 231], ["Better accessibility", 187]] } },
  // 2
  { pub: "dailybrief", type: "quick_read", cat: "local", group: "transit", place: PA, scope: "local", claim: "analysis", hoursAgo: 6, pop: 980,
    headline: "What a transit expansion could mean for Port Avalon commuters",
    summary: "If the plan passes, a typical east-end commute could get 10 to 15 minutes shorter, mostly from less waiting rather than faster buses. The trade-off is cost: the city would need to hire about 120 more operators, and a proposed fare change would raise single tickets by 25 cents while capping monthly passes. Analysts we spoke to say frequency matters more than coverage for most riders, but the east end has had no direct routes at all, so both arguments have a point.",
    tags: ["transit", "commuting", "analysis"],
    sources: ["Daily Brief analysis of the city staff report (fictional)"] },
  // 3
  { pub: "meridian", type: "quick_read", cat: "politics", group: "transit", place: PA, scope: "local", claim: "opinion", hoursAgo: 9, pop: 640,
    headline: "Opinion: Port Avalon should fix reliability before adding routes",
    summary: "This is an opinion column. Our columnist argues that one in five Port Avalon buses already arrives more than five minutes late, and that new routes will repeat the problem unless the city first adds bus lanes and signal priority. The column supports the frequency upgrades but asks council to phase the new routes in after a reliability review. Readers who disagree argue that waiting leaves the east end without service for years.",
    tags: ["transit", "opinion", "city council"],
    sources: ["Meridian Report opinion section (fictional)", "City on-time performance report (fictional)"] },
  // 4
  { pub: "markethour", type: "explainer", cat: "finance", group: "rates", place: GLOBAL, scope: "global", hoursAgo: 20, pop: 1730,
    headline: "Why are interest rates changing?",
    summary: "Five slides on how central banks use interest rates, and why a change shows up in your loan payments months later.",
    tags: ["interest rates", "explainer", "inflation"],
    sources: ["Market Hour explainer desk (fictional)"],
    media: { slides: [
      { title: "The short version", body: "Central banks raise rates to cool spending when prices rise too fast, and cut rates to encourage spending when the economy slows." },
      { title: "How it reaches you", body: "Banks pass the policy rate on to variable-rate loans, credit lines and savings accounts, usually within weeks." },
      { title: "Fixed vs. variable", body: "Fixed-rate loans do not change until renewal, which is why the effect of a rate change can take years to reach some households.", stat: "2–5 yrs" },
      { title: "Why it is slow", body: "Spending, hiring and prices respond gradually. Economists often say rate changes take 12 to 18 months to have their full effect.", stat: "12–18 mo" },
      { title: "What to watch", body: "Inflation reports, job numbers and wage growth are the main signals central banks look at before deciding." },
    ] },
    poll: { question: "How well do you understand how rates affect your money?", type: "scale", placement: "after_slides",
      options: [["1 · Not at all", 64], ["2", 121], ["3", 310], ["4", 288], ["5 · Very well", 140]] } },
  // 5
  { pub: "dailybrief", type: "infographic", cat: "finance", group: "rates", place: GLOBAL, scope: "global", claim: "analysis", hoursAgo: 22, pop: 1210,
    headline: "How a 1-point rate rise changes a sample loan payment",
    summary: "Illustrative monthly payments on a $300,000, 25-year loan at different rates. These are sample calculations, not quotes.",
    tags: ["interest rates", "mortgages", "data"],
    sources: ["Standard amortization formula; Daily Brief calculations"],
    media: { chart: { kind: "bar", title: "Monthly payment on a $300k, 25-year loan", unit: "$", note: "Illustrative calculation, rounded.",
      points: [{ label: "3%", value: 1423 }, { label: "4%", value: 1584 }, { label: "5%", value: 1754 }, { label: "6%", value: 1933 }] } } },
  // 6
  { pub: "circuitcode", type: "breaking", cat: "ai", group: "helix", place: LC, scope: "global", claim: "unconfirmed", hoursAgo: 1, pop: 3320,
    headline: "Developing: Quanta Labs announces its Helix-7 open model",
    summary: "Fictional AI company Quanta Labs says it has released Helix-7 with openly downloadable weights. Some details below have not been independently confirmed.",
    tags: ["ai", "open models", "quanta labs"],
    sources: ["Quanta Labs announcement (fictional)", "Circuit & Code reporting"],
    media: { updates: [
      { minutesAgo: 55, text: "Quanta Labs publishes a release post and a download page for Helix-7.", confirmed: true },
      { minutesAgo: 40, text: "The company says the model matches its previous flagship on reasoning tests. Independent results are not yet available.", confirmed: false },
      { minutesAgo: 20, text: "A license file allows commercial use with an acceptable-use policy. We are reviewing the terms.", confirmed: true },
      { minutesAgo: 8, text: "Unverified posts claim the release was moved up by a month. Quanta Labs has not commented.", confirmed: false },
    ] } },
  // 7
  { pub: "circuitcode", type: "video", cat: "ai", group: "helix", place: LC, scope: "global", hoursAgo: 2, pop: 2870,
    headline: "Helix-7 in 60 seconds: what Quanta Labs says it can do",
    summary: "A quick look at the fictional Helix-7 release: what is open, what is claimed, and what still needs independent testing.",
    tags: ["ai", "open models", "explainer"],
    sources: ["Quanta Labs model card (fictional)"],
    media: { scenes: [
      { kicker: "HELIX-7", text: "Quanta Labs says anyone can now download and run its newest model.", duration: 4 },
      { kicker: "WHAT'S OPEN", text: "The model weights and a technical report. The training data is not public.", duration: 4 },
      { kicker: "THE CLAIM", text: "Quanta says it matches its previous flagship on reasoning benchmarks.", stat: "Claimed", duration: 4 },
      { kicker: "THE CAVEAT", text: "Those results are self-reported. Independent testers are running their own evaluations.", duration: 4 },
      { kicker: "WHY IT MATTERS", text: "Open models can be studied and adapted by anyone, which cuts both ways for safety.", duration: 4 },
    ] } },
  // 8
  { pub: "meridian", type: "quick_read", cat: "politics", group: "helix", place: LC, scope: "national", hoursAgo: 4, pop: 1120,
    headline: "Lumen City regulators ask Quanta Labs for Helix-7 safety documents",
    summary: "The fictional Lumen City Digital Office has asked Quanta Labs to share the safety testing it ran before releasing Helix-7. The request is not an investigation and carries no penalty, an official said, but the office wants to know how the company tested for misuse in areas such as cyberattacks. Quanta Labs said it would cooperate and that a summary of its testing is already in the model's technical report. Researchers note that open release makes post-launch restrictions hard to enforce.",
    tags: ["ai", "regulation", "quanta labs"],
    sources: ["Lumen City Digital Office statement (fictional)", "Quanta Labs statement (fictional)"] },
  // 9
  { pub: "dailybrief", type: "explainer", cat: "ai", group: "helix", place: GLOBAL, scope: "global", hoursAgo: 5, pop: 1640,
    headline: "Open vs. closed AI models, explained",
    summary: "What it means when an AI model is open, the arguments on each side, and the questions worth asking.",
    tags: ["ai", "open models", "explainer"],
    sources: ["Daily Brief explainer desk (fictional)"],
    media: { slides: [
      { title: "What 'open' usually means", body: "The model's weights can be downloaded and run on your own hardware. It does not always mean the training data or code are public." },
      { title: "The case for open", body: "Researchers can inspect and test the model, smaller companies can build on it, and no single firm controls access." },
      { title: "The case for closed", body: "The developer can monitor use, block misuse and patch problems. Once weights are public, changes cannot be pulled back." },
      { title: "The middle ground", body: "Many labs release some models openly and keep their most capable ones behind an API, with staged access for researchers." },
      { title: "Questions to ask", body: "What was released? What testing was done? Who can use it, and under what license?" },
    ] },
    poll: { question: "Should AI labs publish safety test results before a release?", type: "yes_no", placement: "after_slides",
      options: [["Yes", 812], ["No", 143]] } },
  // 10
  { pub: "northline", type: "breaking", cat: "climate", group: "wildfire", place: CB, scope: "local", claim: "reporting", tone: "distressing", hoursAgo: 2, pop: 1890,
    headline: "Cedarbrook issues an early wildfire-season advisory",
    summary: "The fictional town of Cedarbrook has issued an advisory after a dry spring. There is no evacuation order. Here is what officials have confirmed.",
    tags: ["wildfire", "advisory", "cedarbrook"],
    sources: ["Cedarbrook emergency management office (fictional)"],
    media: { updates: [
      { minutesAgo: 110, text: "Cedarbrook declares an early fire-season advisory, citing low rainfall since March.", confirmed: true },
      { minutesAgo: 75, text: "Open burning is banned within town limits until further notice.", confirmed: true },
      { minutesAgo: 30, text: "Officials say there are no active fires near town and no evacuation orders.", confirmed: true },
      { minutesAgo: 12, text: "Social posts mention smoke near the north trail. Fire crews are checking; this is unconfirmed.", confirmed: false },
    ] } },
  // 11
  { pub: "greenwire", type: "infographic", cat: "climate", group: "wildfire", place: CB, scope: "national", hoursAgo: 7, pop: 1320,
    headline: "Reading the air quality index: what each level means",
    summary: "A quick guide to air-quality index bands and when to change your plans. Thresholds shown are a simplified, illustrative scale.",
    tags: ["air quality", "smoke", "guide"],
    sources: ["Simplified from common public air-quality scales"],
    media: { chart: { kind: "bar", title: "Index level and suggested action (simplified)", note: "Upper bound of each band on a simplified 0–300 scale.",
      points: [{ label: "Good", value: 50 }, { label: "Moderate", value: 100 }, { label: "Sensitive groups", value: 150 }, { label: "Unhealthy", value: 200 }, { label: "Very unhealthy", value: 300 }] },
      keyPoints: ["Good: no changes needed", "Moderate: unusually sensitive people may limit long outdoor exertion", "Sensitive groups: people with heart or lung conditions should reduce outdoor activity", "Unhealthy and above: everyone should limit time outdoors"] } },
  // 12
  { pub: "pulsehealth", type: "quick_read", cat: "healthcare", group: "wildfire", place: CB, scope: "national", hoursAgo: 8, pop: 1460,
    headline: "Five ways to limit smoke exposure indoors",
    summary: "With an early fire season forecast in parts of the fictional Cedarbrook region, our health desk pulled together practical steps. Keep windows and doors closed on smoky days and run air conditioning on recirculate. A portable air cleaner with a HEPA filter, sized for the room, makes a measurable difference in a bedroom. Avoid frying food and burning candles, which add particles. If you have asthma or a heart condition, talk to your care provider about a plan before smoke arrives.",
    tags: ["health", "smoke", "air quality"],
    sources: ["Pulse Health Desk medical editors (fictional)"] },
  // 13
  { pub: "greenwire", type: "video", cat: "climate", group: "wildfire", place: CB, scope: "local", tone: "positive", hoursAgo: 12, pop: 1180,
    headline: "How Cedarbrook's fire crews prepare before the season starts",
    summary: "Fuel breaks, equipment checks and community drills: a look at the preparation work in the fictional town of Cedarbrook.",
    tags: ["wildfire", "preparedness", "community"],
    sources: ["Greenwire field reporting (fictional)"],
    media: { scenes: [
      { kicker: "CEDARBROOK", text: "Before the first fire of the season, crews spend weeks getting ready.", duration: 4 },
      { kicker: "FUEL BREAKS", text: "Clearing dry brush creates gaps that slow a fire's spread.", stat: "14 km", duration: 4 },
      { kicker: "DRILLS", text: "Neighbourhoods practise evacuation routes so there are no surprises.", duration: 4 },
      { kicker: "YOU CAN HELP", text: "Clear gutters, move firewood away from the house and sign up for local alerts.", duration: 4 },
    ] } },
  // 14
  { pub: "northline", type: "quick_read", cat: "healthcare", group: "clinic", place: MC, scope: "local", tone: "positive", hoursAgo: 10, pop: 870,
    headline: "Maple Crossing pilots same-day clinic booking",
    summary: "Patients at three clinics in the fictional town of Maple Crossing can now book same-day appointments online from 7 a.m. The six-month pilot holds back a third of each day's slots for same-day booking, instead of first-come phone lines that often filled within minutes. Clinic staff say early feedback is positive, though some older patients have asked for a phone option to stay, and it will. The health authority will publish wait-time results at the end of the pilot.",
    tags: ["healthcare", "clinics", "maple crossing"],
    sources: ["Maple Crossing community health network (fictional)"],
    poll: { question: "How do you usually book a clinic visit?", type: "single", placement: "embedded",
      options: [["Phone", 201], ["Online", 176], ["Walk in", 88], ["I rarely need to", 64]] } },
  // 15
  { pub: "pulsehealth", type: "infographic", cat: "healthcare", group: "clinic", place: MC, scope: "local", hoursAgo: 14, pop: 760,
    headline: "Clinic wait times in the booking pilot's first month",
    summary: "Average days to see a clinician at the three pilot clinics, before and during the pilot. Illustrative demo data.",
    tags: ["healthcare", "data", "wait times"],
    sources: ["Pilot dashboard (fictional demo data)"],
    media: { chart: { kind: "bar", title: "Average wait to see a clinician", unit: "days", note: "Fictional demo data for illustration.",
      points: [{ label: "Before", value: 6.4 }, { label: "Week 1", value: 4.9 }, { label: "Week 2", value: 3.8 }, { label: "Week 4", value: 2.7 }] } } },
  // 16
  { pub: "fieldhouse", type: "video", cat: "sports", group: "rovers", place: GM, scope: "national", tone: "positive", hoursAgo: 5, pop: 2310,
    headline: "Glenmoray Rovers book a place in the Highland Cup final",
    summary: "The fictional Rovers came from behind to win 2–1 and reach their first cup final in 40 years.",
    tags: ["football", "highland cup", "glenmoray rovers"],
    sources: ["Fieldhouse match report (fictional)"],
    media: { scenes: [
      { kicker: "SEMI-FINAL", text: "Glenmoray Rovers were a goal down at half-time.", stat: "0–1", duration: 4 },
      { kicker: "62'", text: "An 18-year-old academy graduate levels it with her first senior goal.", stat: "1–1", duration: 4 },
      { kicker: "88'", text: "A late header from a corner sends the away end into chaos.", stat: "2–1", duration: 4 },
      { kicker: "THE FINAL", text: "Their first Highland Cup final in 40 years is three weeks away.", stat: "40 yrs", duration: 4 },
    ] },
    poll: { question: "Will you watch the Highland Cup final?", type: "yes_no", placement: "action_bar", options: [["Yes", 538], ["No", 121]] } },
  // 17
  { pub: "dailybrief", type: "quick_read", cat: "sports", group: "rovers", place: GM, scope: "national", tone: "positive", hoursAgo: 11, pop: 690,
    headline: "How a small-town club built a cup run on youth players",
    summary: "Six of the fictional Glenmoray Rovers' starting eleven came through the club's own academy, which runs free sessions for local children three evenings a week. The club rebuilt the programme a decade ago after nearly folding, relying on volunteer coaches and a shared pitch with the local school. Players and coaches told us the cup run matters less than what it shows the town's kids. The academy says sign-ups have doubled since the quarter-final.",
    tags: ["football", "youth sport", "community"],
    sources: ["Daily Brief feature interviews (fictional)"] },
  // 18
  { pub: "markethour", type: "quick_read", cat: "business", group: "port", place: HP, scope: "national", hoursAgo: 13, pop: 820,
    headline: "Harbor Point port reports record container volumes",
    summary: "The fictional Port of Harbor Point handled its highest-ever quarterly container volume, up 9% on last year, according to figures the port authority released this morning. Officials credited a new automated crane line and longer gate hours. Trucking groups say congestion on the access road has worsened, with average turnaround times up about 20 minutes. The port says a second access ramp is due to open next year.",
    tags: ["shipping", "ports", "trade"],
    sources: ["Port of Harbor Point quarterly report (fictional)"] },
  // 19
  { pub: "circuitcode", type: "explainer", cat: "technology", place: GLOBAL, scope: "global", hoursAgo: 30, pop: 1520,
    headline: "How your phone's battery actually ages",
    summary: "Why batteries lose capacity, which habits matter, and which common tips are myths.",
    tags: ["batteries", "phones", "explainer"],
    sources: ["Circuit & Code explainer desk (fictional)"],
    media: { slides: [
      { title: "It is chemistry", body: "Lithium-ion batteries lose capacity slowly as the materials inside wear with each charge cycle." },
      { title: "Heat is the big one", body: "High temperatures speed up wear more than anything else. Avoid leaving phones in hot cars or charging under pillows." },
      { title: "Full and empty are stressful", body: "Sitting at 100% or near 0% for long periods adds wear. Many phones now offer an optimized charging setting.", stat: "20–80%" },
      { title: "Myth: overnight charging ruins it", body: "Modern phones stop charging when full. Heat matters more than the hours plugged in." },
      { title: "What to expect", body: "Many batteries keep around 80% of their original capacity after two to three years of normal use.", stat: "~80%" },
    ] } },
  // 20
  { pub: "circuitcode", type: "quick_read", cat: "startups", place: SC, scope: "national", tone: "positive", hoursAgo: 16, pop: 940,
    headline: "Silverline City startup turns farm waste into packaging",
    summary: "A fictional startup in Silverline City is pressing leftover rice straw into food containers that break down in home compost within about 90 days. The founders, two former agricultural engineers, say farmers often burn the straw after harvest, which adds to seasonal air pollution. The company buys straw directly from 300 farms and has raised early funding to open a second production line. It still costs more than plastic, which the founders say is the main hurdle.",
    tags: ["startups", "packaging", "agriculture"],
    sources: ["Circuit & Code interview with the founders (fictional)"] },
  // 21
  { pub: "markethour", type: "video", cat: "finance", place: GLOBAL, scope: "global", hoursAgo: 4, pop: 1670,
    headline: "Three numbers to know before markets open",
    summary: "A 40-second briefing on the fictional Northland 100 index, oil and the dollar, using illustrative demo figures.",
    tags: ["markets", "briefing", "demo index"],
    sources: ["Market Hour desk (fictional demo figures)"],
    media: { scenes: [
      { kicker: "MORNING BRIEF", text: "Three numbers to know today. All figures are fictional demo data.", duration: 4 },
      { kicker: "NORTHLAND 100", text: "The fictional index closed slightly higher, led by energy companies.", stat: "+0.4%", duration: 4 },
      { kicker: "OIL", text: "Prices eased after a week of gains.", stat: "−1.2%", duration: 4 },
      { kicker: "WHAT TO WATCH", text: "An inflation report later this week could move rate expectations.", duration: 4 },
    ] } },
  // 22
  { pub: "markethour", type: "infographic", cat: "finance", place: GLOBAL, scope: "global", hoursAgo: 26, pop: 1050,
    headline: "Where a typical household budget goes",
    summary: "An illustrative split of monthly spending for a sample household. Use it as a starting point for your own budget, not a benchmark.",
    tags: ["budgeting", "personal finance", "data"],
    sources: ["Market Hour sample budget (illustrative)"],
    media: { chart: { kind: "donut", title: "Sample monthly budget", unit: "%", note: "Illustrative sample, not survey data.",
      points: [{ label: "Housing", value: 33 }, { label: "Food", value: 14 }, { label: "Transport", value: 13 }, { label: "Savings", value: 10 }, { label: "Health", value: 8 }, { label: "Other", value: 22 }] } } },
  // 23
  { pub: "greenwire", type: "quick_read", cat: "environment", place: BW, scope: "national", tone: "positive", hoursAgo: 18, pop: 1390,
    headline: "Brightwater river restoration brings back spawning salmon",
    summary: "Volunteers counted 214 salmon spawning in the fictional Brightwater River this autumn, the first confirmed run in more than 30 years. The return follows the removal of two disused mill dams and five years of replanting along the banks. Ecologists caution that one season is not a trend and say monitoring will continue for at least a decade. Local schools have adopted sections of the river to help with counts.",
    tags: ["rivers", "wildlife", "restoration"],
    sources: ["Brightwater watershed council (fictional)"] },
  // 24
  { pub: "greenwire", type: "explainer", cat: "climate", place: GLOBAL, scope: "global", hoursAgo: 34, pop: 1100,
    headline: "Heat pumps, explained in five slides",
    summary: "How a heat pump moves heat instead of making it, and what to check before getting one.",
    tags: ["heat pumps", "energy", "explainer"],
    sources: ["Greenwire explainer desk (fictional)"],
    media: { slides: [
      { title: "Moving heat, not making it", body: "A heat pump works like a fridge in reverse, pulling heat from outside air or the ground and moving it indoors." },
      { title: "Why that is efficient", body: "Because it moves heat rather than burning fuel, a heat pump can deliver several units of heat per unit of electricity.", stat: "2–4×" },
      { title: "Cold climates", body: "Newer models keep working well below freezing, though efficiency drops as temperatures fall." },
      { title: "It cools too", body: "The same unit can run in reverse in summer, replacing a separate air conditioner." },
      { title: "Before you buy", body: "Check insulation, get a proper sizing assessment and look for local rebates." },
    ] },
    poll: { question: "What is your home's main source of heat?", type: "single", placement: "action_bar",
      options: [["Gas furnace", 244], ["Electric baseboard", 119], ["Heat pump", 98], ["Something else", 61]] } },
  // 25
  { pub: "pulsehealth", type: "quick_read", cat: "science", place: AV, scope: "global", hoursAgo: 19, pop: 1010,
    headline: "Researchers map how sleep helps the brain file memories",
    summary: "A team at the fictional Ashford Vale Institute tracked brain activity in 60 volunteers and found that bursts of activity during deep sleep lined up with better recall of words learned the evening before. The study is small and has not yet been replicated, the authors note, but it adds to evidence that deep sleep plays an active role in memory. The researchers next plan to test whether gentle sound cues during sleep can strengthen the effect.",
    tags: ["sleep", "memory", "research"],
    sources: ["Ashford Vale Institute study summary (fictional)"] },
  // 26
  { pub: "pulsehealth", type: "explainer", cat: "healthcare", place: GLOBAL, scope: "global", hoursAgo: 40, pop: 890,
    headline: "What each phase of a clinical trial actually tests",
    summary: "From a few volunteers to thousands: how new treatments are tested step by step.",
    tags: ["clinical trials", "medicine", "explainer"],
    sources: ["Pulse Health Desk medical editors (fictional)"],
    media: { slides: [
      { title: "Phase 1: is it safe?", body: "A small group, often 20 to 80 people, tests safety and dosage.", stat: "20–80" },
      { title: "Phase 2: does it work?", body: "Several hundred people help show whether the treatment has the intended effect and what side effects appear.", stat: "100s" },
      { title: "Phase 3: is it better?", body: "Thousands of people compare the treatment with existing options or a placebo.", stat: "1,000s" },
      { title: "Approval and beyond", body: "Regulators review the evidence. Monitoring continues after approval to catch rare side effects." },
    ] },
    poll: { question: "Which health topics should we explain next?", type: "multiple", placement: "after_slides",
      options: [["Mental health", 301], ["Nutrition science", 244], ["How hospitals work", 160], ["Medication costs", 212]] } },
  // 27
  { pub: "meridian", type: "video", cat: "politics", place: GLOBAL, scope: "global", hoursAgo: 15, pop: 1250,
    headline: "How a bill becomes law, in 60 seconds",
    summary: "The basic steps most parliaments and legislatures follow, from first reading to final approval.",
    tags: ["civics", "government", "explainer"],
    sources: ["Meridian Report civics desk (fictional)"],
    media: { scenes: [
      { kicker: "STEP 1", text: "A bill is introduced and read for the first time. Usually no debate yet.", duration: 4 },
      { kicker: "STEP 2", text: "Members debate the general idea, then vote on whether to continue.", duration: 4 },
      { kicker: "STEP 3", text: "A committee studies it line by line and can propose changes.", duration: 4 },
      { kicker: "STEP 4", text: "A final vote, then the same process in the other chamber, if there is one.", duration: 4 },
      { kicker: "STEP 5", text: "Formal approval makes it law. Details vary by country.", duration: 4 },
    ] } },
  // 28
  { pub: "meridian", type: "quick_read", cat: "politics", place: SL, scope: "local", hoursAgo: 15, pop: 720,
    headline: "Saint-Lumière holds its first citizens' assembly on housing",
    summary: "Forty randomly selected residents of the fictional city of Saint-Lumière met for the first of six weekends to draft housing recommendations for council. Members were chosen by lottery to match the city's age, income and neighbourhood mix. They will hear from builders, tenants' groups and planners before voting on proposals. Council has promised a formal response to every recommendation, though it is not bound to adopt them.",
    tags: ["housing", "democracy", "saint-lumière"],
    sources: ["Saint-Lumière city clerk (fictional)"] },
  // 29
  { pub: "fieldhouse", type: "breaking", cat: "sports", place: RM, scope: "local", claim: "unconfirmed", hoursAgo: 1, pop: 640,
    headline: "Red Mesa marathon start delayed by thunderstorms",
    summary: "The start of the fictional Red Mesa marathon has been pushed back because of lightning in the area. A new start time has not been confirmed.",
    tags: ["running", "marathon", "weather"],
    sources: ["Red Mesa race organizers (fictional)"],
    media: { updates: [
      { minutesAgo: 50, text: "Organizers hold runners in the start corrals as lightning is detected nearby.", confirmed: true },
      { minutesAgo: 25, text: "The race is officially delayed. Runners are asked to shelter in the convention hall.", confirmed: true },
      { minutesAgo: 6, text: "Reports suggest a 9:30 a.m. start. Organizers have not confirmed this.", confirmed: false },
    ] } },
  // 30
  { pub: "meridian", type: "explainer", cat: "world", place: GLOBAL, scope: "global", hoursAgo: 50, pop: 830,
    headline: "How international aid gets from pledge to people",
    summary: "Why it can take months for pledged aid to arrive, and who actually delivers it.",
    tags: ["aid", "world", "explainer"],
    sources: ["Meridian Report world desk (fictional)"],
    media: { slides: [
      { title: "Pledges are promises", body: "When governments pledge aid, the money is usually released in stages, sometimes over years." },
      { title: "Who delivers it", body: "Most aid flows through agencies and local organizations who already work in the area." },
      { title: "The slow part", body: "Logistics, approvals and security can delay delivery long after funding is agreed." },
      { title: "Local first", body: "Aid groups increasingly fund local responders directly, who often reach people fastest." },
    ] } },
  // 31
  { pub: "dailybrief", type: "explainer", cat: "education", place: GLOBAL, scope: "global", hoursAgo: 28, pop: 760,
    headline: "What a four-year degree costs, beyond tuition",
    summary: "Tuition is only part of it. A sample breakdown of the other costs students plan for, with illustrative figures.",
    tags: ["education", "university", "costs"],
    sources: ["Daily Brief sample budget (illustrative)"],
    media: { slides: [
      { title: "Tuition", body: "Often the biggest single line, but it varies widely by country, program and residency status." },
      { title: "Housing", body: "In many cities, rent costs more than tuition over four years.", stat: "Often #1" },
      { title: "Books and tech", body: "A laptop, software and course materials add up, though used and digital options help." },
      { title: "The hidden costs", body: "Transport, food, application fees and time not spent working all count." },
      { title: "Ways to reduce it", body: "Scholarships, co-op programs, living at home and starting at a community college." },
    ] } },
  // 32
  { pub: "dailybrief", type: "quick_read", cat: "entertainment", place: GM, scope: "national", tone: "positive", hoursAgo: 21, pop: 610,
    headline: "Glenmoray film festival opens with a record 31 local premieres",
    summary: "The fictional Glenmoray Film Festival opened last night with 31 premieres by filmmakers from the region, its most ever. Organizers say a new grant for first-time directors and free equipment loans from the town library made the difference. The opening film, a documentary about the town's last working woollen mill, sold out both screenings. The festival runs for nine days, with free outdoor screenings in the square each evening.",
    tags: ["film", "festival", "culture"],
    sources: ["Glenmoray Film Festival (fictional)"] },
  // 33
  { pub: "fieldhouse", type: "explainer", cat: "sports", place: GLOBAL, scope: "global", hoursAgo: 36, pop: 540,
    headline: "How marathon pacers work",
    summary: "The runners with the balloons and the time on their backs: what they do and how to use them.",
    tags: ["running", "marathon", "explainer"],
    sources: ["Fieldhouse explainer (fictional)"],
    media: { slides: [
      { title: "Who they are", body: "Experienced runners who agree to run an exact, even pace for a target finish time." },
      { title: "Even splits", body: "Most pacers aim for the same time every kilometre, which is the most efficient way to race for most people." },
      { title: "How to use them", body: "Start behind your target group, stay relaxed in the pack, and decide in the last 10 km whether to push on." },
      { title: "Don't chase early", body: "Going out faster than your pacer in the first half is the most common way to fade late." },
    ] } },
  // 34
  { pub: "pulsehealth", type: "video", cat: "lifestyle", place: GLOBAL, scope: "global", tone: "positive", hoursAgo: 24, pop: 1980,
    headline: "A two-minute desk stretch routine",
    summary: "Four simple stretches for long days at a desk. Stop if anything hurts.",
    tags: ["wellbeing", "stretching", "work"],
    sources: ["Pulse Health Desk physiotherapy contributor (fictional)"],
    media: { scenes: [
      { kicker: "30 SECONDS", text: "Neck: slowly tilt one ear toward your shoulder, then switch.", duration: 4 },
      { kicker: "30 SECONDS", text: "Shoulders: roll them back ten times, then forward ten times.", duration: 4 },
      { kicker: "30 SECONDS", text: "Back: sit tall, cross arms over your chest and gently twist each way.", duration: 4 },
      { kicker: "30 SECONDS", text: "Wrists: extend one arm and gently pull your fingers back. Switch.", duration: 4 },
      { kicker: "DONE", text: "Two minutes. Try it once an hour.", duration: 3 },
    ] } },
  // 35
  { pub: "greenwire", type: "infographic", cat: "environment", place: CB, scope: "national", hoursAgo: 44, pop: 580,
    headline: "How much household waste gets recycled in three demo towns",
    summary: "Share of household waste diverted from landfill in three fictional towns. Demo data for illustration.",
    tags: ["recycling", "waste", "data"],
    sources: ["Municipal waste reports (fictional demo data)"],
    media: { chart: { kind: "bar", title: "Household waste diverted from landfill", unit: "%", note: "Fictional demo data.",
      points: [{ label: "Cedarbrook", value: 61 }, { label: "Port Avalon", value: 47 }, { label: "Maple Crossing", value: 39 }] } } },
  // 36
  { pub: "circuitcode", type: "video", cat: "technology", place: PA, scope: "local", tone: "positive", hoursAgo: 27, pop: 730,
    headline: "Port Avalon library adds free device repair nights",
    summary: "Volunteers at the fictional Port Avalon library now fix phones, laptops and toasters for free every second Thursday.",
    tags: ["repair", "libraries", "port avalon"],
    sources: ["Port Avalon Public Library (fictional)"],
    media: { scenes: [
      { kicker: "PORT AVALON", text: "Broken phone? The library might fix it for free.", duration: 4 },
      { kicker: "REPAIR NIGHTS", text: "Volunteers repaired 84 devices at the first two sessions.", stat: "84", duration: 4 },
      { kicker: "MOST COMMON", text: "Cracked screens, worn batteries and loose charging ports.", duration: 4 },
      { kicker: "NEXT SESSION", text: "Every second Thursday, 6 to 9 p.m. Bring the charger too.", duration: 4 },
    ] } },
  // 37
  { pub: "markethour", type: "breaking", cat: "business", group: "port", place: HP, scope: "national", claim: "reporting", hoursAgo: 3, pop: 980,
    headline: "Update: Harbor Point port pauses one terminal for a safety inspection",
    summary: "One of the fictional port's five terminals has paused operations for an inspection of its new crane line. How long the pause will last is not yet confirmed.",
    tags: ["ports", "shipping", "safety"],
    sources: ["Port of Harbor Point statement (fictional)"],
    media: { updates: [
      { minutesAgo: 160, text: "Terminal 3 pauses operations. The port says the move is precautionary.", confirmed: true },
      { minutesAgo: 95, text: "No injuries reported. Inspectors are reviewing the automated crane line.", confirmed: true },
      { minutesAgo: 40, text: "Shipping agents say some vessels may be redirected to other terminals. The port has not confirmed timing.", confirmed: false },
    ] },
    correction: "An earlier version of this update said two terminals were paused. Only Terminal 3 is affected." },
  // 38
  { pub: "northline", type: "explainer", cat: "education", place: PA, scope: "local", hoursAgo: 48, pop: 510,
    headline: "How to read your property tax bill",
    summary: "The numbers on a typical municipal tax bill, explained line by line, using a fictional Port Avalon example.",
    tags: ["property tax", "local government", "explainer"],
    sources: ["Northline explainer (fictional example bill)"],
    media: { slides: [
      { title: "Assessed value", body: "The value your municipality assigns to your property for tax purposes. It is not the same as market price." },
      { title: "The tax rate", body: "Set each year by council and applied to the assessed value. It often combines municipal and school portions." },
      { title: "Where it goes", body: "Roads, transit, parks, libraries and emergency services are typical big items." },
      { title: "If you disagree", body: "Most places let you appeal your assessment within a set window. Check the deadline on the bill." },
    ] } },
  // 39
  { pub: "fieldhouse", type: "infographic", cat: "sports", group: "rovers", place: GM, scope: "national", tone: "positive", hoursAgo: 6, pop: 870,
    headline: "Glenmoray Rovers' cup run, by the numbers",
    summary: "Goals scored in each round of the fictional Rovers' Highland Cup run.",
    tags: ["football", "highland cup", "data"],
    sources: ["Fieldhouse match records (fictional)"],
    media: { chart: { kind: "bar", title: "Goals scored per round", note: "Fictional demo data.",
      points: [{ label: "R1", value: 3 }, { label: "R2", value: 1 }, { label: "R3", value: 2 }, { label: "QF", value: 4 }, { label: "SF", value: 2 }] },
      keyPoints: ["12 goals in 5 games", "7 scored by academy graduates", "First final since 1986"] } },
  // 40
  { pub: "circuitcode", type: "explainer", cat: "ai", place: GLOBAL, scope: "global", hoursAgo: 60, pop: 1380,
    headline: "How recommendation feeds work, including this one",
    summary: "What feeds like Tidbit's look at when choosing your next story, and the controls you have.",
    tags: ["algorithms", "feeds", "explainer"],
    sources: ["Tidbit ranking documentation"],
    media: { slides: [
      { title: "It is a score", body: "Each story gets a score from several signals. The highest-scoring stories go first, with rules to keep things varied." },
      { title: "Tidbit's starting weights", body: "Interests 25%, recent engagement 15%, freshness 15%, credibility 15%, follows 10%, location 10%, variety 10%." },
      { title: "What is not a signal", body: "Outrage, repeated replays and heated comment threads are not used to push stories higher." },
      { title: "Variety rules", body: "Back-to-back posts from one publisher, repeat coverage and long runs of distressing news are spread out." },
      { title: "Your controls", body: "Use the ••• menu on any post: Not interested, Show more, Show less, Hide publisher, or Why am I seeing this?" },
    ] },
    poll: { question: "How much control do you want over your feed?", type: "scale", placement: "after_slides", verifiedOnly: false,
      options: [["1 · Let it pick", 52], ["2", 88], ["3", 240], ["4", 301], ["5 · Full control", 266]] } },
];

export const DEMO_COMMENTS: { post: number; user: string; text: string; replies?: { user: string; text: string }[] }[] = [
  { post: 1, user: "marcusb", text: "Every 8 minutes on the east-west line would genuinely change my commute.", replies: [
    { user: "@northline", text: "Thanks Marcus. The staff report says the 8-minute frequency would start on the four busiest corridors first." },
    { user: "avareads", text: "Same. The 40-minute waits after 7 p.m. are the real problem." }] },
  { post: 1, user: "sofiaruiz", text: "Hoping the accessibility upgrades don't get cut to pay for the new routes." },
  { post: 3, user: "marcusb", text: "Fair point about reliability, but the east end has waited long enough." },
  { post: 6, user: "dankim", text: "Appreciate the clear confirmed / unconfirmed labels on these updates." },
  { post: 6, user: "avareads", text: "Waiting for independent benchmarks before getting excited.", replies: [{ user: "leo.ok", text: "Same. Self-reported numbers are marketing until tested." }] },
  { post: 9, user: "priyanair", text: "The middle-ground slide is the part most coverage skips." },
  { post: 10, user: "dankim", text: "Good to see 'no evacuation orders' right up front." },
  { post: 12, user: "sofiaruiz", text: "Adding: check your air cleaner's filter before the season, not during it." },
  { post: 14, user: "sofiaruiz", text: "As a nurse, holding back same-day slots makes a big difference." },
  { post: 16, user: "leo.ok", text: "That 88th-minute header. What a night." },
  { post: 19, user: "dankim", text: "I had no idea heat mattered more than overnight charging." },
  { post: 23, user: "priyanair", text: "Dam removal stories are my favourite kind of good news." },
  { post: 40, user: "avareads", text: "Love that the feed explains itself." },
];
