"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";

interface SandpackEditorProps {
  files?: Record<string, string>;
  template?: "vanilla" | "react" | "nextjs" | "vue";
  height?: string | number;
}

const defaultFiles = {
  "/index.js": `// Welcome to the interactive coding tutorial!
// Try editing this code to see the results in real-time.

console.log("Hello, World!");

document.getElementById("app").innerHTML = \`
  <h1>Hello, Learner! 🚀</h1>
  <p>Edit this text in index.js to see it update immediately.</p>
\`;
`,
  "/index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>Parcel Sandbox</title>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: sans-serif;
        padding: 20px;
        background: #1e1e1e;
        color: white;
      }
      h1 { color: #6366f1; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script src="index.js"></script>
  </body>
</html>`,
};

export default function SandpackEditor({
  files = defaultFiles,
  template = "vanilla",
  height = "400px",
}: SandpackEditorProps) {
  return (
    <div className="sandpack-wrapper rounded-xl overflow-hidden border border-gray-800 shadow-2xl mt-6 mb-8">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs font-mono text-gray-400 ml-2">Try It Yourself</span>
      </div>
      <Sandpack
        template={template}
        theme={atomDark}
        files={files}
        options={{
          showNavigator: false,
          showLineNumbers: true,
          editorHeight: height,
          wrapContent: true,
          showTabs: true,
          editorWidthPercentage: 55,
        }}
      />
    </div>
  );
}
