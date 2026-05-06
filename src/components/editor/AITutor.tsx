"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, Maximize2, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your Boxspox AI Tutor. Stuck on a coding problem? Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Mock AI Response
    setTimeout(() => {
      const assistantMessage = {
        role: "assistant",
        content: `That's a great question about "${input}"! In HTML/CSS, the best way to handle this is usually by using Flexbox or Grid. Would you like me to show you an example?`
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 2000 }}>
      <style>{`
        @media (max-width: 500px) {
          .ai-tutor-trigger { display: none !important; }
        }
      `}</style>
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            className="ai-tutor-trigger"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageSquare size={28} />
          </motion.button>
        ) : (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              width: "380px",
              height: isMinimized ? "60px" : "500px",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-primary)",
              boxShadow: "var(--shadow-2xl)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "height 0.3s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 20px",
                background: "linear-gradient(90deg, #6366f1, #06b6d4)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Bot size={20} />
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>AI Tutor</span>
                <Sparkles size={14} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "4px" }}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "4px" }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div
                  ref={scrollRef}
                  style={{
                    flex: 1,
                    padding: "20px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    background: "var(--bg-secondary)",
                  }}
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        padding: "12px 16px",
                        borderRadius: "var(--radius-lg)",
                        background: msg.role === "user" ? "var(--brand-primary)" : "var(--bg-card)",
                        color: msg.role === "user" ? "white" : "var(--text-primary)",
                        fontSize: "0.9rem",
                        lineHeight: 1.5,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        border: msg.role === "assistant" ? "1px solid var(--border-primary)" : "none",
                      }}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: "var(--radius-lg)", background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <div className="animate-bounce" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)" }} />
                        <div className="animate-bounce" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)", animationDelay: "0.2s" }} />
                        <div className="animate-bounce" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)", animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ padding: "16px", borderTop: "1px solid var(--border-primary)", background: "var(--bg-card)" }}>
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    style={{ display: "flex", gap: "10px" }}
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask a question..."
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--brand-primary)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "opacity 0.2s",
                        opacity: isLoading || !input.trim() ? 0.5 : 1,
                      }}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
