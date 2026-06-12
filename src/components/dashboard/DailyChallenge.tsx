"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Code2, Play, CheckCircle2, XCircle, Flame, Trophy, Coins, RotateCcw, AlertTriangle } from "lucide-react";

// List of high-fidelity daily coding challenges (rotated daily)
const DAILY_CHALLENGES = [
  {
    id: "sum-array",
    title: "Sum of Array Elements",
    difficulty: "Easy",
    xpReward: 50,
    coinReward: 10,
    description: "Write a function `sumArray(arr)` that accepts an array of numbers `arr` and returns the sum of all elements. If the array is empty, return 0.",
    starterCode: `function sumArray(arr) {\n  // Write your code here\n  return arr.reduce((acc, curr) => acc + curr, 0);\n}`,
    testCases: [
      { input: [[1, 2, 3]], expected: 6, label: "sumArray([1, 2, 3])" },
      { input: [[-1, 5, 10]], expected: 14, label: "sumArray([-1, 5, 10])" },
      { input: [[]], expected: 0, label: "sumArray([])" }
    ],
    functionName: "sumArray"
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    xpReward: 50,
    coinReward: 10,
    description: "Write a function `reverseString(str)` that accepts a string `str` and returns it reversed. Example: `reverseString('hello')` should return `'olleh'`.",
    starterCode: `function reverseString(str) {\n  // Write your code here\n  \n}`,
    testCases: [
      { input: ["hello"], expected: "olleh", label: "reverseString('hello')" },
      { input: ["Pandaschool"], expected: "xopxsoB", label: "reverseString('Pandaschool')" },
      { input: ["a"], expected: "a", label: "reverseString('a')" }
    ],
    functionName: "reverseString"
  },
  {
    id: "is-palindrome",
    title: "Verify Palindrome",
    difficulty: "Medium",
    xpReward: 50,
    coinReward: 10,
    description: "Write a function `isPalindrome(str)` that returns `true` if the string `str` is a palindrome, and `false` otherwise. Ignore casing, spaces, and special characters.",
    starterCode: `function isPalindrome(str) {\n  // Clean string helper\n  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  // Write your logic below\n  \n}`,
    testCases: [
      { input: ["racecar"], expected: true, label: "isPalindrome('racecar')" },
      { input: ["hello"], expected: false, label: "isPalindrome('hello')" },
      { input: ["A man, a plan, a canal: Panama"], expected: true, label: "isPalindrome('A man, a plan, a canal: Panama')" }
    ],
    functionName: "isPalindrome"
  },
  {
    id: "find-max",
    title: "Find Maximum Number",
    difficulty: "Easy",
    xpReward: 50,
    coinReward: 10,
    description: "Write a function `findMax(arr)` that takes an array of numbers `arr` and returns the largest number. If the array is empty, return `null`.",
    starterCode: `function findMax(arr) {\n  // Write your code here\n  \n}`,
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expected: 9, label: "findMax([1, 5, 3, 9, 2])" },
      { input: [[-10, -5, -20]], expected: -5, label: "findMax([-10, -5, -20])" },
      { input: [[]], expected: null, label: "findMax([])" }
    ],
    functionName: "findMax"
  }
];

interface DailyChallengeProps {
  profile: any;
  user: any;
  onRewardClaimed: () => void;
}

export default function DailyChallenge({ profile, user, onRewardClaimed }: DailyChallengeProps) {
  const supabase = createClient();

  // Pick challenge of the day based on date
  const todayStr = new Date().toDateString();
  const dayIndex = new Date().getDate() % DAILY_CHALLENGES.length;
  const challenge = DAILY_CHALLENGES[dayIndex];

  // States
  const [code, setCode] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [particles, setParticles] = useState<any[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize starter code or solved state from localStorage
  useEffect(() => {
    const isCompletedToday = localStorage.getItem(`pandaschool_challenge_solved_${challenge.id}_${todayStr}`) === "true";
    setIsSolved(isCompletedToday);

    const savedCode = localStorage.getItem(`pandaschool_challenge_code_${challenge.id}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(challenge.starterCode);
    }
  }, [challenge, todayStr]);

  // Handle Code Saving
  const handleCodeChange = (val: string) => {
    setCode(val);
    localStorage.setItem(`pandaschool_challenge_code_${challenge.id}`, val);
  };

  // Reset to starter template
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the editor to the starter template?")) {
      setCode(challenge.starterCode);
      localStorage.setItem(`pandaschool_challenge_code_${challenge.id}`, challenge.starterCode);
      setConsoleLogs(["Editor reset successfully."]);
      setTestResults([]);
    }
  };

  // Intercept TAB key inside textarea to write spaces instead of losing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      
      // Reset cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Safe Javascript Evaluation Sandbox
  const runCode = async (submit = false) => {
    setIsRunning(true);
    setConsoleLogs(["Compiling JS Sandbox...", "Executing test cases..."]);
    
    setTimeout(() => {
      try {
        // Parse and create the user's function
        // eslint-disable-next-line no-new-func
        const userFuncCreator = new Function(`
          ${code}
          return ${challenge.functionName};
        `);
        
        const userFunc = userFuncCreator();

        if (typeof userFunc !== "function") {
          throw new Error(`Function '${challenge.functionName}' was not defined properly inside your solution.`);
        }

        const results: any[] = [];
        let allPassed = true;

        challenge.testCases.forEach((tc, idx) => {
          // Deep clone the input to protect against mutation during execution
          const inputClone = JSON.parse(JSON.stringify(tc.input));
          const result = userFunc(...inputClone);
          
          const isPassed = JSON.stringify(result) === JSON.stringify(tc.expected);
          if (!isPassed) allPassed = false;

          results.push({
            label: tc.label,
            expected: JSON.stringify(tc.expected),
            received: JSON.stringify(result),
            passed: isPassed
          });
        });

        setTestResults(results);
        setIsRunning(false);

        if (allPassed) {
          setConsoleLogs([
            "✨ CONGRATULATIONS! ALL TEST CASES PASSED!",
            `✓ Test 1: Passed`,
            `✓ Test 2: Passed`,
            `✓ Test 3: Passed`,
            submit ? "🎉 Saving progress & claiming rewards..." : "Click 'Submit & Claim Rewards' to secure your XP!"
          ]);

          if (submit) {
            handleClaimRewards();
          }
        } else {
          const failCount = results.filter(r => !r.passed).length;
          setConsoleLogs([
            `❌ COMPILE ERROR / FAILURE: ${failCount} test case(s) failed.`,
            ...results.map(r => 
              r.passed 
                ? `  ✓ ${r.label} returned ${r.received} (PASSED)` 
                : `  ✗ ${r.label} expected ${r.expected}, but received ${r.received} (FAILED)`
            ),
            "Hint: Read the description closely and double-check your edge cases!"
          ]);
        }

      } catch (err: any) {
        setIsRunning(false);
        setConsoleLogs([
          "🚨 SYNTAX / EXECUTION ERROR:",
          `  ${err.message || err}`,
          "Please verify your bracket matching and variables scope."
        ]);
      }
    }, 800);
  };

  // Claim XP & Coins inside Supabase profile
  const handleClaimRewards = async () => {
    try {
      if (isSolved) return; // Prevent double claims

      // 1. Update Profile database record
      const currentXP = profile?.xp || 0;
      const currentCoins = profile?.coins || 0;
      const currentStreak = profile?.streak || 0;

      // Extend streak logic: increment streak if not completed today
      const newStreak = currentStreak + 1;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          xp: currentXP + challenge.xpReward,
          coins: currentCoins + challenge.coinReward,
          streak: newStreak
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 2. Log Activity - Store in JSONB metadata to avoid UUID target_id cast errors
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "daily_challenge_solved",
        target_type: "daily_challenge",
        target_id: null,
        metadata: { challenge_id: challenge.id }
      });

      // 3. Update Local Storage & state
      localStorage.setItem(`pandaschool_challenge_solved_${challenge.id}_${todayStr}`, "true");
      setIsSolved(true);
      
      // Trigger particles celebration
      triggerConfetti();
      setShowCelebration(true);

      // Re-fetch parent data
      onRewardClaimed();

    } catch (err: any) {
      console.error("Failed to claim daily challenge rewards:", err);
      setConsoleLogs([
        "⚠️ Error saving rewards to database:",
        `  ${err.message || err}`,
        "Please check your internet connection or try again."
      ]);
    }
  };

  // Clean CSS Confetti Particle Burst Generator
  const triggerConfetti = () => {
    const tempParticles = [];
    const colors = ["#ff4d4d", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"];
    
    for (let i = 0; i < 60; i++) {
      tempParticles.push({
        id: i,
        x: Math.random() * 100, // percentage x
        y: -10, // start above editor
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 2,
        rotation: Math.random() * 360,
        drift: Math.random() * 40 - 20 // drift left/right
      });
    }
    setParticles(tempParticles);
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: "var(--radius-xl)",
      border: "1px solid var(--border-primary)",
      boxShadow: "var(--shadow-lg)",
      padding: "28px",
      marginBottom: "32px",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Stylesheet for floating animations and code workspace */}
      <style dangerouslySetInnerHTML={{ __html: `
        .code-textarea {
          font-family: 'Fira Code', 'Courier New', Courier, monospace;
          background: #0f172a;
          color: #e2e8f0;
          border: 1px solid #334155;
          padding: 16px;
          border-radius: 12px;
          resize: vertical;
          width: 100%;
          line-height: 1.5;
          font-size: 14px;
          outline: none;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);
          transition: border-color 0.2s ease;
        }
        .code-textarea:focus {
          border-color: var(--brand-primary, #0f6e56);
        }
        .console-panel {
          font-family: 'Fira Code', 'Courier New', Courier, monospace;
          background: #020617;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 12px;
          color: #94a3b8;
          border: 1px solid #1e293b;
          min-height: 100px;
          max-height: 160px;
          overflow-y: auto;
        }
        .particle {
          position: absolute;
          border-radius: 4px;
          pointer-events: none;
          z-index: 100;
          animation: fall linear forwards;
        }
        @keyframes fall {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(600px) rotate(720deg);
            opacity: 0;
          }
        }
        .claim-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(8px);
        }
        .claim-modal {
          background: var(--bg-card);
          border: 2px solid var(--brand-primary);
          border-radius: 24px;
          padding: 40px;
          width: 90%;
          max-width: 460px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          transform: scale(0.9);
          animation: popUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes popUp {
          100% { transform: scale(1); }
        }
        .coin-spin {
          animation: spin3D 2s linear infinite;
        }
        @keyframes spin3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}} />

      {/* Particle Burst Overlay */}
      {particles.map(p => (
        <div 
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            marginLeft: `${p.drift}px`
          }}
        />
      ))}

      {/* Success Celebration Popup Modal */}
      {showCelebration && (
        <div className="claim-modal-overlay">
          <div className="claim-modal">
            <div style={{
              width: "80px",
              height: "80px",
              background: "rgba(245, 158, 11, 0.1)",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px"
            }}>
              <Coins className="coin-spin" size={48} color="#f59e0b" />
            </div>
            
            <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>
              Challenge Mastered! 🎉
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "28px" }}>
              Your solution successfully passed all automated evaluation criteria!
            </p>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "32px"
            }}>
              <div style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                padding: "12px 24px",
                borderRadius: "14px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#6366f1" }}>+{challenge.xpReward}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600 }}>XP gained</div>
              </div>
              <div style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                padding: "12px 24px",
                borderRadius: "14px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f59e0b" }}>+{challenge.coinReward}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600 }}>Coins gained</div>
              </div>
            </div>

            <button 
              className="btn-primary"
              style={{ width: "100%", padding: "14px 20px" }}
              onClick={() => setShowCelebration(false)}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Header and Challenge Details */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: isSolved ? "rgba(16, 185, 129, 0.1)" : "rgba(15, 110, 86, 0.08)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isSolved ? "#10b981" : "var(--brand-primary)",
            flexShrink: 0
          }}>
            <Code2 size={24} />
          </div>
          <div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "2px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                Daily Coding Challenge
              </span>
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "10px",
                background: challenge.difficulty === "Easy" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                color: challenge.difficulty === "Easy" ? "#10b981" : "#f59e0b"
              }}>
                {challenge.difficulty}
              </span>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Reward Badges indicator */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.8rem",
            fontWeight: 800,
            background: "rgba(99, 102, 241, 0.08)",
            color: "#6366f1",
            padding: "6px 12px",
            borderRadius: "10px"
          }}>
            <Trophy size={14} /> +{challenge.xpReward} XP
          </span>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.8rem",
            fontWeight: 800,
            background: "rgba(245, 158, 11, 0.08)",
            color: "#f59e0b",
            padding: "6px 12px",
            borderRadius: "10px"
          }}>
            <Coins size={14} /> +{challenge.coinReward} Coins
          </span>
        </div>
      </div>

      {isSolved ? (
        /* SOLVED STATE PANEL */
        <div style={{
          padding: "32px",
          borderRadius: "16px",
          background: "rgba(16, 185, 129, 0.03)",
          border: "1px dashed rgba(16, 185, 129, 0.3)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "12px 0"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.1)",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}>
            <CheckCircle2 size={36} />
          </div>
          <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
            Daily Challenge Complete! 
          </h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "420px", lineHeight: "1.5", marginBottom: "20px" }}>
            You solved the <strong>{challenge.title}</strong> challenge today and collected your rewards! Come back tomorrow for a new puzzle and extend your learning streak.
          </p>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#ff4d4d",
            background: "rgba(255, 77, 77, 0.08)",
            padding: "6px 16px",
            borderRadius: "12px"
          }}>
            <Flame size={16} /> Streak Extended! Keep it burning!
          </div>
        </div>
      ) : (
        /* ACTIVE CODING WORKSPACE */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Challenge Description */}
          <div style={{
            background: "var(--bg-secondary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--border-primary)",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6
          }}>
            <strong>Problem:</strong> {challenge.description}
          </div>

          {/* Interactive Code Editor */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>
                Javascript Sandbox
              </span>
              <button 
                onClick={handleReset}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-tertiary)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  transition: "color 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseOut={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
              >
                <RotateCcw size={12} /> Reset starter code
              </button>
            </div>
            <textarea
              ref={textareaRef}
              className="code-textarea"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={8}
              placeholder="// Write your code here..."
              spellCheck="false"
            />
          </div>

          {/* Live Debug Console Output Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>
              Terminal & Test Logs
            </span>
            <div className="console-panel">
              {consoleLogs.map((log, idx) => {
                let color = "#94a3b8"; // default slate
                if (log.startsWith("✨") || log.startsWith("✓")) color = "#10b981"; // success green
                if (log.startsWith("❌") || log.startsWith("✗") || log.startsWith("🚨")) color = "#f87171"; // fail red
                if (log.startsWith("⚠️")) color = "#fbbf24"; // warning gold
                
                return (
                  <div key={idx} style={{ color, marginBottom: "4px", lineHeight: "1.4" }}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Action Buttons Controls */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button 
              onClick={() => runCode(false)}
              className="btn-primary"
              disabled={isRunning}
              style={{
                flex: "1 1 120px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                fontSize: "0.9rem",
                borderRadius: "12px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-primary)",
                cursor: "pointer"
              }}
            >
              <Play size={16} /> Run Local Tests
            </button>
            <button 
              onClick={() => runCode(true)}
              className="btn-primary"
              disabled={isRunning}
              style={{
                flex: "1 1 180px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                fontSize: "0.9rem",
                borderRadius: "12px",
                background: "linear-gradient(135deg, var(--brand-primary), #0f6e56)",
                color: "white",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 16px -4px rgba(15, 110, 86, 0.25)"
              }}
            >
              <Trophy size={16} /> Submit & Claim Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
