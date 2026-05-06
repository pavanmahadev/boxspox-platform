"use client";

import dynamic from "next/dynamic";

const SandpackEditor = dynamic(() => import("@/components/editor/SandpackEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-900 animate-pulse rounded-xl flex items-center justify-center border border-gray-800">
      <div className="text-gray-500 font-medium">Loading interactive editor...</div>
    </div>
  ),
});

const defaultHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 400px;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 12px;
      color: #333;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    button {
      padding: 14px 32px;
      font-size: 1rem;
      border: none;
      border-radius: 50px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102,126,234,0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Hello World!</h1>
    <p>Welcome to Boxspox Playground. Edit this code and click Run to see your changes!</p>
    <button onclick="alert('You clicked! 🎉')">Click Me</button>
  </div>
</body>
</html>`;

export default function PlaygroundPage() {
  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + 40px)", paddingBottom: "40px", maxWidth: "1200px", margin: "0 auto", paddingLeft: "20px", paddingRight: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "16px" }}>Code Playground</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Experiment with code in a fully featured environment.</p>
      </div>
      <SandpackEditor height="600px" />
    </div>
  );
}
