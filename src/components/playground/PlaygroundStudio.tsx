"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Code2, 
  Terminal, 
  Sparkles, 
  Layout, 
  Settings, 
  Share2, 
  Download, 
  Play, 
  Loader2,
  ChevronRight,
  Maximize2,
  Minimize2,
  Cpu,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";

// Dynamically import Sandpack to avoid SSR issues
const SandpackEditor = dynamic(() => import("@/components/editor/SandpackEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center border border-slate-800">
      <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
      <div className="text-slate-400 font-medium tracking-wide">Initializing Studio Environment...</div>
    </div>
  ),
});

const TEMPLATES = {
  vanilla: {
    label: "HTML/JS",
    icon: <Layout size={18} />,
    files: {
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pandaschool Studio</title>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #0f172a;
      color: white;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      padding: 40px;
      border-radius: 24px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      transition: transform 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
    }
    h1 {
      margin: 0 0 16px 0;
      background: linear-gradient(135deg, #10b981, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    button {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
      transition: background 0.2s;
    }
    button:hover { background: #059669; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Welcome to Studio</h1>
    <p>Edit this code to see changes instantly.</p>
    <button id="btn">Click Me</button>
  </div>
  <script src="/index.js"></script>
</body>
</html>`,
      "/index.js": `document.getElementById('btn').addEventListener('click', () => {
  alert('Welcome to the Pandaschool Interactive Playground! 🎉');
});`
    }
  },
  react: {
    label: "React",
    icon: <Cpu size={18} />,
    files: {
      "/public/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>React App</title>
</head>
<body style="margin: 0; background: #0f172a;">
  <div id="root"></div>
</body>
</html>`,
      "/src/index.js": `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      "/src/App.js": `import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app-container">
      <div className="glass-card">
        <h1>⚛️ React Studio</h1>
        <p>Interactive playground for modern web development.</p>
        
        <div className="counter-widget">
          <h2>Counter: {count}</h2>
          <div className="button-group">
            <button onClick={() => setCount(c => c - 1)} className="btn-secondary">-</button>
            <button onClick={() => setCount(c => c + 1)} className="btn-primary">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
      "/src/styles.css": `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #0f172a;
  color: white;
  min-height: 100vh;
}
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 40px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}
h1 {
  margin-top: 0;
  background: linear-gradient(135deg, #61dafb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.counter-widget {
  margin-top: 32px;
  background: rgba(0, 0, 0, 0.2);
  padding: 24px;
  border-radius: 16px;
}
.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}
button {
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: #475569; color: white; }
.btn-secondary:hover { background: #334155; }`
    }
  }
};

export function PlaygroundStudio() {
  const [activeTemplate, setActiveTemplate] = useState<"vanilla" | "react">("vanilla");
  const [initialFiles, setInitialFiles] = useState<any>(null);
  const [themeName, setThemeName] = useState<"atomDark" | "monokaiPro" | "nightOwl" | "githubLight" | "aquaBlue">("atomDark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [resetCounter, setResetCounter] = useState(0);
  
  const { showToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Load custom drafts from localStorage with automatic self-healing sanitization
  useEffect(() => {
    setInitialFiles(null); // Triggers smooth pulse visual transition
    const saved = localStorage.getItem(`pandaschool_playground_${activeTemplate}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Strict Validation: Ensure saved cache exactly matches the template structure
        const hasAppJs = "/src/App.js" in parsed;
        const hasIndexHtml = "/index.html" in parsed;
        const hasIndexJs = "/index.js" in parsed;

        let isValid = false;
        if (activeTemplate === "react") {
          isValid = hasAppJs && !hasIndexHtml;
        } else {
          isValid = hasIndexHtml && hasIndexJs && !hasAppJs;
        }

        if (isValid) {
          setInitialFiles(parsed);
          return;
        }
      } catch (e) {
        // Fallback below
      }
    }
    setInitialFiles(TEMPLATES[activeTemplate].files);
  }, [activeTemplate, resetCounter]);

  // Gamification: Award XP for exploring the playground
  useEffect(() => {
    const checkAndAwardXP = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      setUser({
        ...session.user,
        role: profile?.role || "user"
      });

      // Award after 1 minute of usage
      setTimeout(async () => {
        try {
          await supabase.rpc('award_xp_if_eligible', { 
            p_user_id: session.user.id,
            p_amount: 10,
            p_action_type: 'playground_exploration'
          });
        } catch (e) {
          // Ignore RPC errors if it doesn't exist yet
        }
      }, 60000);
    };

    checkAndAwardXP();
  }, [supabase]);

  const hasAiAccess = user?.role === "admin" || user?.role === "instructor";

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to use the AI Co-Pilot.", "error");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: aiQuery,
          template: activeTemplate
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.response) setAiResponse(data.response);
    } catch (err: any) {
      console.warn("AI Co-Pilot Error:", err);
      showToast(err.message || "Failed to get AI assistance", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleResetWorkspace = () => {
    if (window.confirm("Are you sure you want to reset the current workspace? All your local unsaved modifications for this template will be cleared.")) {
      localStorage.removeItem(`pandaschool_playground_${activeTemplate}`);
      setResetCounter(c => c + 1);
      showToast("Workspace successfully reset to template defaults!", "success");
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary text-text-primary">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border border-border-primary bg-bg-card rounded-2xl mb-6 flex-wrap gap-4 shadow-sm">
        {/* Left Side: Templates & Custom Options */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Templates selector */}
          <div className="flex items-center gap-1.5 bg-bg-secondary p-1 rounded-xl border border-border-primary">
            {Object.keys(TEMPLATES).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTemplate(key as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  activeTemplate === key 
                    ? "bg-bg-card text-brand-primary shadow-sm border border-border-primary" 
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {TEMPLATES[key as keyof typeof TEMPLATES].icon}
                {TEMPLATES[key as keyof typeof TEMPLATES].label}
              </button>
            ))}
          </div>

          {/* Editor Theme Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Theme:</span>
            <select
              value={themeName}
              onChange={(e) => setThemeName(e.target.value as any)}
              className="bg-bg-secondary border border-border-primary rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            >
              <option value="atomDark">Atom Dark (Slate)</option>
              <option value="nightOwl">Night Owl (Indigo)</option>
              <option value="monokaiPro">Monokai Pro (Vibrant)</option>
              <option value="aquaBlue">Aqua Blue (Light)</option>
              <option value="githubLight">GitHub Light (Light)</option>
            </select>
          </div>

          {/* Reset Workspace button */}
          <button 
            onClick={handleResetWorkspace} 
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-xs transition-colors border border-red-500/10"
            title="Reset Workspace to Defaults"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
          {hasAiAccess && (
            <button 
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                aiPanelOpen 
                  ? "bg-brand-primary text-white" 
                  : "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20"
              }`}
            >
              <Sparkles size={16} />
              AI Co-Pilot
            </button>
          )}
          
          {hasAiAccess && <div className="h-6 w-px bg-border-primary mx-1"></div>}
          
          <button onClick={() => showToast("Downloading workspace files...", "info")} className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors" title="Download">
            <Download size={20} />
          </button>
          <button onClick={() => showToast("Sandbox share link copied to clipboard!", "success")} className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors" title="Share">
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className={`flex gap-6 ${isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-[650px]'}`}>
        
        {/* Editor Area */}
        <div className={`flex-1 transition-all duration-300 ${aiPanelOpen ? 'w-2/3' : 'w-full'}`}>
          {initialFiles ? (
            <SandpackEditor 
              key={`${activeTemplate}_reset_${resetCounter}`}
              template={activeTemplate}
              files={initialFiles}
              themeName={themeName}
              height={isFullscreen ? "calc(100vh - 250px)" : "550px"}
            />
          ) : (
            <div className="w-full h-[550px] bg-bg-card animate-pulse rounded-2xl flex flex-col items-center justify-center border border-border-primary">
              <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
              <div className="text-text-tertiary font-bold tracking-wide text-sm">Loading custom workspace...</div>
            </div>
          )}
        </div>

        {/* AI Co-Pilot Panel */}
        <AnimatePresence>
          {aiPanelOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "33.333333%" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="flex-shrink-0 bg-bg-card border border-border-primary rounded-2xl overflow-hidden shadow-lg flex flex-col"
            >
              <div className="p-4 border-b border-border-primary bg-bg-secondary flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-brand-primary">
                  <Sparkles size={18} />
                  Pandaschool AI
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                <div className="bg-bg-secondary p-4 rounded-xl text-sm leading-relaxed border border-border-primary">
                  <p className="font-semibold mb-2">👋 Hi there!</p>
                  <p className="text-text-secondary">I'm your AI Co-Pilot. I can help you explain code, debug errors, or generate new snippets for the {TEMPLATES[activeTemplate].label} environment.</p>
                </div>

                {aiResponse && (
                  <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl text-sm leading-relaxed text-text-primary">
                    <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br/>') }} />
                  </div>
                )}

                {aiLoading && (
                  <div className="flex items-center gap-3 text-text-tertiary p-4">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm font-medium">Thinking...</span>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border-primary bg-bg-secondary">
                <form onSubmit={handleAskAI} className="relative">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask AI to generate code..."
                    disabled={aiLoading}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiQuery.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-primary text-white rounded-lg disabled:opacity-50 hover:bg-brand-secondary transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
