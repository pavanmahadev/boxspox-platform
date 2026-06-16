"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

export function AITutor({ contextTopic }: { contextTopic: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([
    { role: "assistant", content: `Hi! I'm your AI Tutor. Need help understanding ${contextTopic}?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: contextTopic,
          messages: [...messages, { role: "user", content: userMessage }]
        })
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (above notes button) */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "96px", // Above the notes button (24 + 56 + 16 gap)
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          color: "white",
          border: "none",
          boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 40,
          transition: "transform 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        title="AI Tutor"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "96px",
          right: "96px",
          width: "360px",
          height: "500px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "scaleIn 0.2s ease-out"
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={20} />
              AI Tutor
            </h3>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", opacity: 0.8 }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg-primary)" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                {m.role === "assistant" && (
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={14} />
                  </div>
                )}
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "16px",
                  background: m.role === "user" ? "var(--brand-primary)" : "var(--bg-secondary)",
                  color: m.role === "user" ? "white" : "var(--text-primary)",
                  border: m.role === "assistant" ? "1px solid var(--border-primary)" : "none",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  borderTopRightRadius: m.role === "user" ? "4px" : "16px",
                  borderTopLeftRadius: m.role === "assistant" ? "4px" : "16px"
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", gap: "12px", alignSelf: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={14} />
                </div>
                <div style={{ padding: "12px 16px", borderRadius: "16px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="dot-typing">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ padding: "16px", borderTop: "1px solid var(--border-primary)", background: "var(--bg-card)", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none", fontSize: "14px" }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{ width: "42px", height: "42px", borderRadius: "50%", background: input.trim() && !isLoading ? "var(--brand-primary)" : "var(--bg-secondary)", color: input.trim() && !isLoading ? "white" : "var(--text-tertiary)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !isLoading ? "pointer" : "not-allowed", transition: "all 0.2s" }}
            >
              <Send size={18} />
            </button>
          </form>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}} />
        </div>
      )}
    </>
  );
}
