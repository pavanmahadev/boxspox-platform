import { Metadata } from "next";
import { PlaygroundStudio } from "@/components/playground/PlaygroundStudio";

export const metadata: Metadata = {
  title: "Online Code Playground & Editor | Boxspox",
  description: "Experiment with HTML, CSS, JavaScript, and React right in your browser with our fast, interactive code playground.",
  alternates: {
    canonical: 'https://boxspox.in/playground',
  }
};

export default function PlaygroundPage() {
  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + 40px)", paddingBottom: "40px", maxWidth: "1600px", margin: "0 auto", paddingLeft: "20px", paddingRight: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "12px", color: "var(--text-primary)" }}>Studio <span style={{ color: "var(--brand-primary)" }}>Playground</span></h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
          Build, test, and share your code instantly. Experiment with React or Vanilla JS in a fully configured environment, complete with an AI Co-Pilot.
        </p>
      </div>
      
      <PlaygroundStudio />
    </div>
  );
}
