"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Code2 } from "lucide-react";

const languageSections = [
  {
    title: "HTML",
    subtitle: "The language for building web pages",
    slug: "html",
    bg: "#D9EEE1",
    text: "#212931",
    btnBg: "#04AA6D",
    preview: `<!DOCTYPE html>
<html>
<title>HTML Tutorial</title>
<body>
<h1>This is a heading</h1>
<p>This is a paragraph.</p>
</body>
</html>`
  },
  {
    title: "CSS",
    subtitle: "The language for styling web pages",
    slug: "css",
    bg: "#FFF4A3",
    text: "#212931",
    btnBg: "#212931",
    preview: `body {
  background-color: lightblue;
}
h1 {
  color: white;
  text-align: center;
}
p {
  font-family: verdana;
}`
  },
  {
    title: "JavaScript",
    subtitle: "The language for programming web pages",
    slug: "javascript",
    bg: "#212931",
    text: "white",
    btnBg: "#04AA6D",
    preview: `<button onclick="myFunction()">Click Me!</button>

<script>
function myFunction() {
  let x = document.getElementById("demo");
  x.style.fontSize = "25px";
  x.style.color = "red";
}
</script>`
  },
  {
    title: "Python",
    subtitle: "A popular programming language",
    slug: "python",
    bg: "#F3ECEA",
    text: "#212931",
    btnBg: "#212931",
    preview: `if 5 > 2:
  print("Five is greater than two!")`
  },
  {
    title: "SQL",
    subtitle: "A language for accessing databases",
    slug: "sql",
    bg: "#96D4D4",
    text: "#212931",
    btnBg: "#212931",
    preview: `SELECT * FROM Customers
WHERE Country='Mexico';`
  },
  {
    title: "React",
    subtitle: "A JavaScript library for building user interfaces",
    slug: "react",
    bg: "#282a35",
    text: "white",
    btnBg: "#04AA6D",
    preview: `import React from 'react';
import ReactDOM from 'react-dom/client';

function Hello(props) {
  return <h1>Hello World!</h1>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Hello />);`
  }
];

export function TutorialsGrid({ initialCourses }: { initialCourses: any[] }) {
  return (
    <section>
      {languageSections.map((section, i) => (
        <div 
          key={section.title}
          style={{
            background: section.bg,
            color: section.text,
            padding: "80px 24px",
            textAlign: "center"
          }}
        >
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h2 style={{ fontSize: "clamp(3rem, 10vw, 6rem)", fontWeight: 900, marginBottom: "8px" }}>
                {section.title}
              </h2>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "32px" }}>
                {section.subtitle}
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", marginBottom: "40px" }}>
                <Link 
                  href={`/learn/technology/${section.slug}`} 
                  className="btn-primary" 
                  style={{ 
                    background: section.btnBg, 
                    color: "white", 
                    width: "220px", 
                    justifyContent: "center",
                    padding: "16px",
                    fontSize: "1.1rem",
                    boxShadow: "none"
                  }}
                >
                  Learn {section.title}
                </Link>
                <Link 
                  href="/playground" 
                  style={{ 
                    background: section.title === "JavaScript" ? "#fff4a3" : "#212931",
                    color: section.title === "JavaScript" ? "#212931" : "white",
                    padding: "16px 32px",
                    borderRadius: "25px",
                    textDecoration: "none",
                    fontWeight: 700,
                    width: "220px",
                    fontSize: "1.1rem"
                  }}
                >
                  {section.title} Reference
                </Link>
              </div>

              {/* Code Preview Card */}
              <div
                style={{
                  maxWidth: "500px",
                  margin: "0 auto",
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "left",
                  backdropFilter: "blur(4px)"
                }}
              >
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px" }}>
                  {section.title} Example:
                </h3>
                <pre style={{ 
                  background: "var(--bg-card)", 
                  padding: "16px", 
                  borderRadius: "4px", 
                  fontSize: "0.95rem",
                  color: "#212931",
                  borderLeft: `4px solid ${section.btnBg}`,
                  overflowX: "auto"
                }}>
                  {section.preview}
                </pre>
                <Link 
                  href="/playground" 
                  style={{ 
                    display: "inline-block", 
                    marginTop: "16px", 
                    background: section.btnBg, 
                    color: "white", 
                    padding: "8px 20px", 
                    borderRadius: "20px", 
                    textDecoration: "none",
                    fontWeight: 600
                  }}
                >
                  Try it Yourself
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      ))}
    </section>
  );
}
