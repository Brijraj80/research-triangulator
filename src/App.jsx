import { useState, useEffect, useRef } from "react";

const MODEL = "claude-sonnet-4-20250514";

const AGENTS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    role: "Broad Intelligence & Context",
    icon: "⬡",
    color: "#10A37F",
    description: "Draws on vast general knowledge to map the topic landscape, identify key players, and surface the most important concepts and connections.",
    task: (topic) => `You are simulating ChatGPT's broad knowledge synthesis. For the research topic: "${topic}"

Produce a detailed BROAD INTELLIGENCE REPORT. Structure your response with these exact section headers (use ### before each):

### Overview
A 3-4 sentence orienting summary of the topic for someone encountering it fresh.

### Key Concepts
List and explain the 5-6 most essential concepts, terms, or ideas needed to understand this topic.

### Major Players & Stakeholders
Who are the key organizations, companies, researchers, governments, or individuals shaping this space?

### Current State of Affairs
What is happening right now in this space? What are the dominant narratives?

### Opportunities & Challenges
What are the biggest opportunities this topic presents, and the most significant obstacles or risks?

### Key Questions Being Asked
What are the 5 most important questions researchers, policymakers, and practitioners are trying to answer?

Be thorough, specific, and use real names, organizations, and concrete examples throughout.`
  },
  {
    id: "gemini",
    name: "Gemini",
    role: "Academic & Historical Depth",
    icon: "✦",
    color: "#FFBD2E",
    description: "Cross-references Google Scholar, academic papers, and historical records to provide rigorous contextual background and scholarly evidence.",
    task: (topic) => `You are simulating Google Gemini's deep academic research capability. For the research topic: "${topic}"

Produce a detailed ACADEMIC & HISTORICAL CONTEXT REPORT. Structure with these exact section headers (use ### before each):

### Historical Evolution
How did this topic emerge and evolve? Key milestones, turning points, and historical context with specific dates.

### Landmark Research
Reference 5-6 highly realistic academic papers (Format: Author(s), Year — "Paper Title", Journal Name. Key finding in one sentence.)

### Theoretical Frameworks
What are the dominant theories, models, or frameworks used to understand and analyze this topic?

### Statistical Evidence
Present 6-8 key statistics from research, each with a source. Use specific numbers and percentages.

### Scholarly Debates
Where do academics disagree? What are the competing schools of thought?

### Research Timeline
A chronological list of 8-10 major milestones (Format: YEAR — Event/Development)

### Knowledge Gaps
What do researchers say is still unknown or understudied?

Be academically rigorous. Use realistic paper titles, journals, and author surnames.`
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    role: "Data & Quantitative Analysis",
    icon: "∑",
    color: "#FF6B6B",
    description: "Runs quantitative analysis, validates statistical claims, models data patterns and stress-tests logical consistency with mathematical precision.",
    task: (topic) => `You are simulating DeepSeek's advanced mathematical and quantitative analysis engine. For the research topic: "${topic}"

Produce a detailed DATA & QUANTITATIVE ANALYSIS REPORT. Structure with these exact section headers (use ### before each):

### Key Metrics at a Glance
A dashboard of the 6-8 most critical numbers and metrics — presented as: METRIC NAME: value (context)

### Trend Analysis (5–10 Year View)
Quantitative trends over time with specific figures for each year or period.

### Market & Scale Breakdown
Size, scope, geographic distribution, demographic splits — all with percentages and absolute numbers.

### Growth Rates
CAGR, YoY growth, acceleration/deceleration rates for relevant dimensions.

### Comparative Benchmarks
How do key metrics compare across countries, sectors, or groups? Use a structured format.

### Projections (1yr / 3yr / 5yr)
Data-based forecasts with specific projected values and assumptions.

### Data Reliability Assessment
Flag which statistics are highly reliable vs contested or estimated.

### Anomalies & Outliers
Surprising data points that challenge conventional wisdom.

Use specific numbers throughout. Be analytically precise.`
  },
  {
    id: "grok",
    name: "Grok",
    role: "Live Sentiment & Social Pulse",
    icon: "𝕏",
    color: "#E879F9",
    description: "Monitors real-time X/Twitter discourse, public sentiment, viral debates and captures the living conversation happening right now.",
    task: (topic) => `You are simulating Grok's real-time X/Twitter and social media intelligence capability. For the research topic: "${topic}"

Produce a detailed SOCIAL PULSE & SENTIMENT REPORT. Structure with these exact section headers (use ### before each):

### Sentiment Overview
Overall sentiment breakdown: Positive X% / Negative X% / Neutral X%. Brief characterization of the mood.

### Trending Hashtags
List 10 hashtags currently trending related to this topic, each with a one-line description of the conversation.

### Viral Conversations
Describe 3-4 specific viral posts or threads (include: realistic @handle, post summary, engagement stats, why it went viral).

### Key Opinion Leaders
Who is driving the conversation? List 6-8 realistic accounts with their stance.

### Demographic Sentiment Map
How do different groups feel? Break down by: age group, geography, political leaning, professional sector.

### Controversy Radar
What heated debates, misinformation campaigns, or polarized conflicts are active right now?

### Emerging Narratives (Last 7 Days)
New framings or storylines that have appeared very recently and are gaining traction.

### Sentiment Trajectory
Is public opinion improving, worsening, or shifting? Where is it likely heading?

Use realistic handles, engagement numbers, and current-feeling specifics.`
  },
  {
    id: "claude",
    name: "Claude",
    role: "Master Synthesis & Bias Audit",
    icon: "◆",
    color: "#818CF8",
    description: "Reads all four agent reports, cross-checks for contradictions, audits for bias, and synthesizes the definitive master research verdict.",
    task: (topic, otherOutputs) => `You are Claude, the synthesis and quality-control layer of a 5-AI research system on: "${topic}"

CHATGPT — BROAD INTELLIGENCE:
${otherOutputs.chatgpt || "Not available"}

GEMINI — ACADEMIC & HISTORICAL:
${otherOutputs.gemini || "Not available"}

DEEPSEEK — QUANTITATIVE ANALYSIS:
${otherOutputs.deepseek || "Not available"}

GROK — SOCIAL SENTIMENT:
${otherOutputs.grok || "Not available"}

Produce the MASTER SYNTHESIS BRIEF. Structure with these exact section headers (use ### before each):

### Executive Summary
3-4 sentences capturing the complete synthesized picture.

### Consensus Findings
5-6 high-confidence facts corroborated across multiple agents.

### Contradictions Detected
Where do agents conflict or present incompatible data? Be specific about which agents disagree and on what.

### Bias Audit
Flag any potential bias, skewed framing, or unreliable claims. Name the source and suspected bias type.

### Five Critical Insights
The 5 most important non-obvious insights that only emerge when all 4 sources are combined.

### Confidence Map
- HIGH CONFIDENCE (well-supported across sources): list items
- MEDIUM CONFIDENCE (some evidence, some uncertainty): list items
- LOW CONFIDENCE (limited evidence, contested, or speculative): list items

### Recommended Next Steps
5 concrete, actionable recommendations for someone acting on this research.

### What's Missing
Important angles that none of the 4 agents adequately covered.

Be ruthlessly analytical. This is the definitive verdict.`
  }
];

// ── Rich output renderer ──────────────────────────────────────────────────────
function formatInline(text, color) {
  return text
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:#e8e8f8;font-weight:700">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em style="color:#8888aa;font-style:italic">$1</em>`)
    .replace(/`(.+?)`/g, `<code style="background:#12122a;color:${color};padding:1px 6px;border-radius:4px;font-size:11.5px;font-family:monospace">$1</code>`);
}

function RichOutput({ text, color }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ### Section header
    if (line.startsWith('### ')) {
      elements.push(
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0 10px", paddingBottom: 9, borderBottom: `1px solid ${color}20` }}>
          <div style={{ width: 3, height: 20, background: `linear-gradient(180deg, ${color}, ${color}60)`, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ color: color, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>
            {line.replace('### ', '')}
          </span>
        </div>
      );
      i++; continue;
    }

    // Bullet list
    if (line.match(/^[\-•]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[\-•]\s+/)) {
        items.push(lines[i].replace(/^[\-•]\s+/, ''));
        i++;
      }
      elements.push(
        <div key={`b${i}`} style={{ margin: "4px 0 12px" }}>
          {items.map((item, bi) => (
            <div key={bi} style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start" }}>
              <span style={{ color: color, fontSize: 16, lineHeight: 1.4, flexShrink: 0, marginTop: 1, opacity: 0.8 }}>›</span>
              <span style={{ color: "#a8a8c8", fontSize: 13.5, lineHeight: 1.75 }}
                dangerouslySetInnerHTML={{ __html: formatInline(item, color) }} />
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        const m = lines[i].match(/^(\d+)\.\s+(.*)/);
        if (m) items.push({ n: m[1], t: m[2] });
        i++;
      }
      elements.push(
        <div key={`n${i}`} style={{ margin: "4px 0 12px" }}>
          {items.map((item, ni) => (
            <div key={ni} style={{ display: "flex", gap: 12, marginBottom: 9, alignItems: "flex-start" }}>
              <div style={{
                background: `${color}18`, color: color, borderRadius: 7,
                width: 24, height: 24, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 700,
                fontFamily: "monospace", flexShrink: 0, marginTop: 1
              }}>{item.n}</div>
              <span style={{ color: "#a8a8c8", fontSize: 13.5, lineHeight: 1.75, paddingTop: 2 }}
                dangerouslySetInnerHTML={{ __html: formatInline(item.t, color) }} />
            </div>
          ))}
        </div>
      );
      continue;
    }

    // YEAR — timeline
    if (line.match(/^\d{4}\s*[—–\-]\s+/)) {
      const m = line.match(/^(\d{4})\s*[—–\-]\s+(.*)/);
      if (m) {
        elements.push(
          <div key={i} style={{ display: "flex", gap: 12, margin: "6px 0", alignItems: "flex-start" }}>
            <span style={{
              background: `${color}18`, color: color, borderRadius: 6,
              padding: "2px 9px", fontSize: 11, fontFamily: "monospace",
              fontWeight: 700, flexShrink: 0, letterSpacing: 0.5, marginTop: 1
            }}>{m[1]}</span>
            <span style={{ color: "#a8a8c8", fontSize: 13.5, lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: formatInline(m[2], color) }} />
          </div>
        );
        i++; continue;
      }
    }

    // KEY: value metric rows (ALL CAPS key)
    if (line.match(/^[A-Z][A-Z\s\/&\-\(\)%]{2,40}:\s+\S/)) {
      const ci = line.indexOf(':');
      const key = line.slice(0, ci).trim();
      const val = line.slice(ci + 1).trim();
      elements.push(
        <div key={i} style={{
          display: "flex", gap: 0, alignItems: "stretch",
          margin: "4px 0", borderRadius: 9, overflow: "hidden",
          border: `1px solid ${color}18`
        }}>
          <div style={{ background: `${color}12`, padding: "8px 14px", minWidth: 160, flexShrink: 0, display: "flex", alignItems: "center" }}>
            <span style={{ color: color, fontSize: 11, fontFamily: "monospace", fontWeight: 600, letterSpacing: 0.3 }}>{key}</span>
          </div>
          <div style={{ background: "#0c0c1e", padding: "8px 14px", flex: 1, display: "flex", alignItems: "center" }}>
            <span style={{ color: "#c0c0d8", fontSize: 13 }}
              dangerouslySetInnerHTML={{ __html: formatInline(val, color) }} />
          </div>
        </div>
      );
      i++; continue;
    }

    // Confidence level badges
    if (line.match(/^(HIGH|MEDIUM|LOW)\s+CONFIDENCE/i)) {
      const lvl = line.match(/^(HIGH|MEDIUM|LOW)/i)[1].toUpperCase();
      const lc = lvl === "HIGH" ? "#22c55e" : lvl === "MEDIUM" ? "#FFBD2E" : "#FF6B6B";
      elements.push(
        <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${lc}12`, border: `1px solid ${lc}28`, borderRadius: 20, padding: "4px 14px", margin: "10px 0 5px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: lc, boxShadow: `0 0 6px ${lc}` }} />
          <span style={{ color: lc, fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1.2 }}>{lvl} CONFIDENCE</span>
        </div>
      );
      i++; continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div key={i} style={{ borderLeft: `3px solid ${color}50`, margin: "8px 0", background: `${color}07`, borderRadius: "0 10px 10px 0", padding: "10px 16px" }}>
          <span style={{ color: "#9898ba", fontSize: 13.5, fontStyle: "italic", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: formatInline(line.replace('> ', ''), color) }} />
        </div>
      );
      i++; continue;
    }

    // Empty line
    if (!line.trim()) { elements.push(<div key={i} style={{ height: 5 }} />); i++; continue; }

    // Default paragraph
    elements.push(
      <p key={i} style={{ color: "#a8a8c8", fontSize: 13.5, lineHeight: 1.8, margin: "3px 0 8px" }}
        dangerouslySetInnerHTML={{ __html: formatInline(line, color) }} />
    );
    i++;
  }
  return <div>{elements}</div>;
}

// ── Agent Panel ───────────────────────────────────────────────────────────────
function AgentPanel({ agent, status, output }) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = status === "running";
  const isDone = status === "done";
  useEffect(() => { if (isDone) setExpanded(true); }, [isDone]);

  return (
    <div style={{
      background: "#07071a",
      border: `1px solid ${isDone || isRunning ? agent.color + "38" : "#0f0f28"}`,
      borderRadius: 18, overflow: "hidden", transition: "all 0.4s ease",
      boxShadow: isRunning ? `0 0 36px ${agent.color}22` : isDone ? `0 4px 20px ${agent.color}0e` : "none",
    }}>
      <div
        onClick={() => isDone && setExpanded(e => !e)}
        style={{
          padding: "18px 22px", display: "flex", alignItems: "center", gap: 16,
          cursor: isDone ? "pointer" : "default",
          background: isDone ? `${agent.color}07` : isRunning ? `${agent.color}04` : "transparent",
          borderBottom: expanded && output ? `1px solid ${agent.color}18` : "none",
          transition: "background 0.3s"
        }}
      >
        {/* Icon bubble */}
        <div style={{
          width: 50, height: 50, borderRadius: 15,
          background: isDone || isRunning ? `${agent.color}16` : "#0c0c22",
          border: `1px solid ${isDone || isRunning ? agent.color + "45" : "#0f0f2a"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 23, color: isDone || isRunning ? agent.color : "#1a1a38",
          flexShrink: 0, transition: "all 0.3s",
          boxShadow: isRunning ? `0 0 22px ${agent.color}55` : "none"
        }}>{agent.icon}</div>

        {/* Name + role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: isDone || isRunning ? "#f0f0fa" : "#1e1e40", transition: "color 0.3s" }}>
              {agent.name}
            </span>
            {isRunning && (
              <span style={{ background: `${agent.color}20`, color: agent.color, fontSize: 9, padding: "3px 10px", borderRadius: 20, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1.5, animation: "pulse 1.5s infinite" }}>
                LIVE
              </span>
            )}
            {isDone && (
              <span style={{ background: "#22c55e16", color: "#22c55e", fontSize: 9, padding: "3px 10px", borderRadius: 20, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1.5 }}>
                ✓ COMPLETE
              </span>
            )}
          </div>
          <div style={{ color: isDone ? agent.color + "cc" : "#1a1a3a", fontSize: 12, fontFamily: "monospace", transition: "color 0.3s" }}>
            {agent.role}
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          {isRunning && (
            <div style={{ display: "flex", gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: agent.color, animation: `bounce 0.9s ease-in-out infinite`, animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          )}
          {isDone && (
            <span style={{ fontSize: 20, color: expanded ? agent.color : "#1e1e40", transition: "all 0.3s", transform: expanded ? "rotate(180deg)" : "none", display: "block" }}>
              ⌄
            </span>
          )}
          {!isDone && !isRunning && (
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0f0f28", border: "1px solid #1a1a38" }} />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && output && (
        <div style={{ padding: "26px 30px", maxHeight: 640, overflowY: "auto", animation: "fadeUp 0.3s ease" }}>
          <RichOutput text={output} color={agent.color} />
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function ResearchTriangulator() {
  const [topic, setTopic] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState({});
  const [agentOutputs, setAgentOutputs] = useState({});
  const [phase, setPhase] = useState("idle");
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentAgentName, setCurrentAgentName] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (isResearching) {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => setElapsedTime(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [isResearching]);

  const runResearch = async () => {
    if (!topic.trim() || isResearching) return;
    setIsResearching(true); setPhase("researching");
    setAgentOutputs({}); setAgentStatuses({});
    setOverallProgress(0); setElapsedTime(0);

    const outputs = {};
    const firstFour = AGENTS.filter(a => a.id !== "claude");

    for (let i = 0; i < firstFour.length; i++) {
      const agent = firstFour[i];
      setCurrentAgentName(agent.name);
      setAgentStatuses(prev => ({ ...prev, [agent.id]: "running" }));
      try {
        const res = await fetch("https://research-triangulator.vercel.app/api/analyze", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: MODEL, max_tokens: 1000, messages: [{ role: "user", content: agent.task(topic) }] })
        });
        const data = await res.json();
        outputs[agent.id] = data.content?.map(c => c.text || "").join("") || "Analysis unavailable.";
      } catch { outputs[agent.id] = "Agent temporarily offline."; }
      setAgentOutputs(prev => ({ ...prev, [agent.id]: outputs[agent.id] }));
      setAgentStatuses(prev => ({ ...prev, [agent.id]: "done" }));
      setOverallProgress(Math.round(((i + 1) / 5) * 100));
      await new Promise(r => setTimeout(r, 150));
    }

    // Claude synthesis
    const claudeAgent = AGENTS.find(a => a.id === "claude");
    setCurrentAgentName("Claude");
    setAgentStatuses(prev => ({ ...prev, claude: "running" }));
    try {
      const res = await fetch("https://research-triangulator.vercel.app/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, max_tokens: 1000, messages: [{ role: "user", content: claudeAgent.task(topic, outputs) }] })
      });
      const data = await res.json();
      outputs.claude = data.content?.map(c => c.text || "").join("") || "";
    } catch { outputs.claude = "Synthesis unavailable."; }
    setAgentOutputs(prev => ({ ...prev, claude: outputs.claude }));
    setAgentStatuses(prev => ({ ...prev, claude: "done" }));
    setOverallProgress(100);
    setCurrentAgentName("");
    setIsResearching(false);
    setPhase("complete");
  };

  const reset = () => { setPhase("idle"); setAgentStatuses({}); setAgentOutputs({}); setOverallProgress(0); setTopic(""); setElapsedTime(0); };
  const completedCount = Object.values(agentStatuses).filter(s => s === "done").length;

  const SUGGESTIONS = ["AI impact on jobs 2025","Quantum computing breakthroughs","Climate change solutions","CRISPR gene editing ethics","Nuclear fusion energy","SpaceX Mars mission","Longevity & anti-aging science","Decentralized finance & Web3"];

  return (
    <div style={{ background: "#060612", minHeight: "100vh", color: "#e0e0f0", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes gridDrift{from{background-position:0 0}to{background-position:60px 60px}}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#08081a} ::-webkit-scrollbar-thumb{background:#1a1a38;border-radius:2px}
        .run-btn:hover:not(:disabled){transform:translateY(-2px)!important;box-shadow:0 16px 40px #818CF855!important}
        .run-btn:active:not(:disabled){transform:translateY(0)!important}
        .tag-btn:hover{border-color:#818CF840!important;color:#818CF8!important;background:#818CF80a!important}
      `}</style>

      {/* Ambient bg */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0, backgroundImage:`linear-gradient(#818CF806 1px,transparent 1px),linear-gradient(90deg,#818CF806 1px,transparent 1px)`, backgroundSize:"60px 60px", animation:"gridDrift 14s linear infinite" }} />
      <div style={{ position:"fixed",top:"-8%",left:"-4%",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle,#818CF810 0%,transparent 65%)",pointerEvents:"none",zIndex:0 }} />
      <div style={{ position:"fixed",bottom:"-8%",right:"-4%",width:620,height:620,borderRadius:"50%",background:"radial-gradient(circle,#10A37F0b 0%,transparent 65%)",pointerEvents:"none",zIndex:0 }} />

      <div style={{ position:"relative",zIndex:1,maxWidth:900,margin:"0 auto",padding:"36px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign:"center",marginBottom:44,animation:"fadeUp 0.5s ease" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#818CF810",border:"1px solid #818CF828",borderRadius:20,padding:"5px 18px",marginBottom:22 }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e",animation:"pulse 2s infinite" }} />
            <span style={{ color:"#818CF8",fontSize:11,fontFamily:"monospace",letterSpacing:2 }}>5-AI RESEARCH SYSTEM</span>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(34px,7vw,56px)",margin:"0 0 14px",lineHeight:1.05,letterSpacing:-2, background:"linear-gradient(135deg,#ffffff 0%,#a5b4fc 45%,#10A37F 100%)", WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
            Research Triangulator
          </h1>
          <p style={{ color:"#323258",fontSize:15,maxWidth:480,margin:"0 auto",lineHeight:1.65,fontWeight:400 }}>
            Enter any topic. Five AI agents analyze it in depth — then Claude synthesizes the definitive brief.
          </p>

          {/* Agent pills */}
          <div style={{ display:"flex",justifyContent:"center",gap:7,marginTop:22,flexWrap:"wrap" }}>
            {AGENTS.map(a => (
              <div key={a.id} style={{ display:"flex",alignItems:"center",gap:6, background:agentStatuses[a.id]?`${a.color}12`:"#0a0a1c", border:`1px solid ${agentStatuses[a.id]?a.color+"38":"#111128"}`, borderRadius:20,padding:"5px 13px",transition:"all 0.4s ease", boxShadow:agentStatuses[a.id]==="running"?`0 0 14px ${a.color}40`:"none" }}>
                <span style={{ color:agentStatuses[a.id]?a.color:"#1e1e40",fontSize:13,transition:"color 0.3s" }}>{a.icon}</span>
                <span style={{ color:agentStatuses[a.id]?a.color:"#1e1e40",fontSize:11,fontFamily:"monospace",fontWeight:600,transition:"color 0.3s" }}>{a.name}</span>
                {agentStatuses[a.id]==="done"&&<span style={{ color:"#22c55e",fontSize:10 }}>✓</span>}
                {agentStatuses[a.id]==="running"&&<div style={{ width:5,height:5,borderRadius:"50%",background:a.color,animation:"pulse 1s infinite" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ display:"flex",gap:10,marginBottom:28,animation:"fadeUp 0.5s ease 0.1s both" }}>
          <input value={topic} onChange={e=>setTopic(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!isResearching&&topic.trim()&&runResearch()}
            placeholder="Enter any research topic... press Enter or click Triangulate"
            disabled={isResearching}
            style={{ flex:1,background:"#0a0a1c",border:"1px solid #111130",borderRadius:14,padding:"15px 20px",color:"#e0e0f0",fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:"none",transition:"border-color 0.3s,box-shadow 0.3s",opacity:isResearching?0.6:1 }}
            onFocus={e=>{e.target.style.borderColor="#818CF855";e.target.style.boxShadow="0 0 0 3px #818CF812";}}
            onBlur={e=>{e.target.style.borderColor="#111130";e.target.style.boxShadow="none";}}
          />
          <button className="run-btn" onClick={phase==="complete"?reset:runResearch}
            disabled={isResearching||(!topic.trim()&&phase!=="complete")}
            style={{ background:phase==="complete"?"#0e0e22":"linear-gradient(135deg,#818CF8,#6366F1)", color:phase==="complete"?"#818CF8":"#fff", border:phase==="complete"?"1px solid #818CF828":"none", borderRadius:14,padding:"15px 26px", fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14, cursor:isResearching?"not-allowed":"pointer",transition:"all 0.25s",whiteSpace:"nowrap", boxShadow:!isResearching&&phase!=="complete"?"0 4px 24px #818CF842":"none", opacity:(isResearching||(!topic.trim()&&phase==="idle"))?0.5:1 }}>
            {isResearching?"⟳ Analyzing...":phase==="complete"?"↺ New Search":"⚡ Triangulate"}
          </button>
        </div>

        {/* Progress */}
        {(isResearching||phase==="complete")&&(
          <div style={{ background:"#0a0a1c",border:"1px solid #111130",borderRadius:14,padding:"18px 22px",marginBottom:20,animation:"fadeUp 0.4s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                {isResearching&&<div style={{ width:14,height:14,border:"2px solid #818CF8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />}
                {phase==="complete"&&<span style={{ color:"#22c55e",fontSize:15 }}>✓</span>}
                <span style={{ fontFamily:"monospace",fontSize:12,color:isResearching?"#818CF8":"#22c55e" }}>
                  {isResearching?`Agent ${Math.min(completedCount+1,5)} of 5 — ${currentAgentName} analyzing...`:`Complete — all 5 agents · ${elapsedTime}s`}
                </span>
              </div>
              <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#818CF8" }}>{overallProgress}%</span>
            </div>
            <div style={{ background:"#111128",borderRadius:6,height:5,overflow:"hidden" }}>
              <div style={{ height:"100%",borderRadius:6,transition:"width 0.8s ease",width:`${overallProgress}%`,background:"linear-gradient(90deg,#818CF8,#10A37F)",boxShadow:"0 0 12px #818CF860" }} />
            </div>
            <div style={{ display:"flex",gap:8,marginTop:12,flexWrap:"wrap" }}>
              {AGENTS.map(a=>(
                <div key={a.id} style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <div style={{ width:7,height:7,borderRadius:"50%", background:agentStatuses[a.id]==="done"?a.color:agentStatuses[a.id]==="running"?a.color:"#111128", boxShadow:agentStatuses[a.id]==="running"?`0 0 8px ${a.color}`:"none", animation:agentStatuses[a.id]==="running"?"pulse 1s infinite":"none", transition:"all 0.3s" }} />
                  <span style={{ fontSize:11,fontFamily:"monospace",color:agentStatuses[a.id]?a.color:"#1e1e38" }}>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic chip */}
        {phase!=="idle"&&(
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#818CF808",border:"1px solid #818CF818",borderRadius:10,padding:"8px 16px",marginBottom:20 }}>
            <span style={{ color:"#2a2a52",fontSize:11,fontFamily:"monospace" }}>TOPIC</span>
            <span style={{ color:"#9898c8",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:14 }}>{topic}</span>
          </div>
        )}

        {/* Agent panels */}
        {(isResearching||phase==="complete")&&(
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {AGENTS.map((agent,i)=>(
              <div key={agent.id} style={{ animation:`fadeUp 0.35s ease ${i*0.07}s both` }}>
                <AgentPanel agent={agent} status={agentStatuses[agent.id]||"idle"} output={agentOutputs[agent.id]} />
              </div>
            ))}
          </div>
        )}

        {/* Idle */}
        {phase==="idle"&&(
          <div style={{ animation:"fadeUp 0.5s ease 0.2s both" }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(158px,1fr))",gap:10,marginBottom:28 }}>
              {AGENTS.map(a=>(
                <div key={a.id} style={{ background:"#07071a",border:"1px solid #0f0f28",borderRadius:16,padding:"20px 16px",borderTop:`2px solid ${a.color}40` }}>
                  <div style={{ fontSize:26,color:a.color,marginBottom:10 }}>{a.icon}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"#c0c0d8",marginBottom:4 }}>{a.name}</div>
                  <div style={{ color:a.color,fontSize:10,fontFamily:"monospace",marginBottom:8,letterSpacing:0.5 }}>{a.role}</div>
                  <div style={{ color:"#1e1e3a",fontSize:12,lineHeight:1.6 }}>{a.description}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#07071a",border:"1px solid #0f0f28",borderRadius:16,padding:22 }}>
              <div style={{ color:"#1e1e38",fontSize:11,fontFamily:"monospace",letterSpacing:1.5,marginBottom:14,textTransform:"uppercase" }}>Try a topic</div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {SUGGESTIONS.map(t=>(
                  <button key={t} className="tag-btn" onClick={()=>setTopic(t)} style={{ background:"#0a0a1c",border:"1px solid #0f0f28",color:"#252545",borderRadius:8,padding:"7px 14px",fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"all 0.2s" }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
