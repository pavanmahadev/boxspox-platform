export async function executeCodeInPiston(language: string, code: string) {
  try {
    // Map common languages to Piston identifiers
    const languageMap: Record<string, { lang: string; version: string }> = {
      javascript: { lang: "javascript", version: "18.15.0" },
      js: { lang: "javascript", version: "18.15.0" },
      python: { lang: "python", version: "3.10.0" },
      java: { lang: "java", version: "15.0.2" },
      c: { lang: "c", version: "10.2.0" },
      cpp: { lang: "c++", version: "10.2.0" },
      html: { lang: "html", version: "1.0.0" }, // Piston doesn't strictly execute HTML, but we can try or fallback
    };

    const targetLang = languageMap[language.toLowerCase()] || { lang: language, version: "*" };

    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: targetLang.lang,
        version: targetLang.version,
        files: [
          {
            content: code,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Piston API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.run?.output || "";
  } catch (err) {
    console.error("Code Execution Error:", err);
    return null;
  }
}
