"use client";

import React, { useEffect } from "react";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview,
  useSandpack 
} from "@codesandbox/sandpack-react";
import { 
  atomDark, 
  aquaBlue, 
  monokaiPro, 
  nightOwl,
  githubLight
} from "@codesandbox/sandpack-themes";

const themesMap = {
  atomDark,
  aquaBlue,
  monokaiPro,
  nightOwl,
  githubLight
};

interface SandpackEditorProps {
  files?: Record<string, string>;
  template?: "vanilla" | "react";
  height?: string | number;
  themeName?: keyof typeof themesMap;
}

function AutoSaver({ template }: { template: string }) {
  const { sandpack } = useSandpack();
  const { files } = sandpack;

  useEffect(() => {
    if (!files || Object.keys(files).length === 0) return;
    
    // Safety check: ensure the sandpack files actually belong to the current template
    const isReactFiles = "/src/App.js" in files;
    if (template === "react" && !isReactFiles) return; // Skip saving if React files aren't loaded yet
    if (template === "vanilla" && isReactFiles) return; // Skip saving if Vanilla still contains React files

    localStorage.setItem(`boxspox_playground_${template}`, JSON.stringify(files));
  }, [files, template]);

  return null;
}

export default function SandpackEditor({
  files,
  template = "vanilla",
  height = "600px",
  themeName = "atomDark"
}: SandpackEditorProps) {
  const selectedTheme = themesMap[themeName] || atomDark;

  return (
    <div className="sandpack-wrapper rounded-2xl overflow-hidden border border-border-primary shadow-2xl bg-bg-card flex flex-col h-full">
      <div className="bg-bg-secondary px-4 py-3 border-b border-border-primary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="text-xs font-mono text-text-tertiary ml-2 font-semibold tracking-wider uppercase">Interactive Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary uppercase tracking-wide">
            Auto-Saving Active
          </span>
        </div>
      </div>
      
      <SandpackProvider
        template={template}
        theme={selectedTheme}
        files={files}
        options={{
          recompileMode: "immediate",
          initMode: "immediate"
        }}
      >
        <SandpackLayout className="border-none">
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            showInlineErrors
            wrapContent
            style={{ height }}
          />
          <SandpackPreview
            showNavigator={false}
            showOpenInCodeSandbox={false}
            style={{ height, background: "var(--bg-card)" }}
          />
        </SandpackLayout>
        <AutoSaver template={template} />
      </SandpackProvider>
    </div>
  );
}
