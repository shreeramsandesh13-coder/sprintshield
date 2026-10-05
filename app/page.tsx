"use client";
import { useState } from "react";
import { ShieldAlert, Zap, Lock, Code2, ArrowRight } from "lucide-react";

export default function Home() {
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copied, setCopied] = useState(false);

const handleCopy = () => {
  if (results?.patchedCode) {
    navigator.clipboard.writeText(results.patchedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
};

const handleAnalyze = async () => {
  if (!code) return;
  setIsAnalyzing(true);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    // Instead of throwing a blind error, we read exactly what the backend sent
    if (!response.ok) {
      alert("BACKEND ERROR: " + (data.error || "Unknown Error"));
      return;
    }

    setResults(data);
  } catch (error) {
    alert("Network Error: Could not reach the backend.");
  } finally {
    setIsAnalyzing(false);
  }
};
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      <header className="mb-8 border-b border-neutral-800 pb-4 flex items-center gap-3">
        <ShieldAlert className="text-emerald-500 w-8 h-8" />
        <h1 className="text-2xl font-bold text-white">SprintShield</h1>
        <span className="bg-neutral-800 text-neutral-400 px-3 py-1 rounded-full text-sm ml-auto">
          Automated PR Copilot
        </span>
      </header>

      <div className="grid grid-cols-2 gap-8 h-[80vh]">
        {/* LEFT PANE: Input */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Code2 className="w-5 h-5" /> Raw Code / PR Diff
            </h2>
            <button 
              onClick={handleAnalyze}
              disabled={!code || isAnalyzing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isAnalyzing ? "Analyzing..." : "Run Deep Review"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code snippet or git diff here..."
            className="w-full h-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 font-mono text-sm text-neutral-300 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* RIGHT PANE: Output */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold">Analysis Results</h2>
          
          {!results ? (
            <div className="flex-1 border border-neutral-800 border-dashed rounded-xl flex items-center justify-center text-neutral-500">
              Paste code and run analysis to see edge cases.
            </div>
          ) : (
            <div className="space-y-6">
  <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl">
    <h3 className="text-red-400 font-semibold flex items-center gap-2 mb-3">
      <Lock className="w-5 h-5" /> Security Vulnerabilities
    </h3>
    <ul className="list-disc list-inside space-y-1 text-neutral-300 text-sm">
      {results.security?.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
    </ul>
  </div>

  <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl">
    <h3 className="text-amber-400 font-semibold flex items-center gap-2 mb-3">
      <Zap className="w-5 h-5" /> Performance Traps
    </h3>
    <ul className="list-disc list-inside space-y-1 text-neutral-300 text-sm">
      {results.performance?.map((issue: string, i: number) => <li key={i}>{issue}</li>)}
    </ul>
  </div>

  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex-1">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-emerald-400 font-semibold">Verified Safe Code</h3>
      <button
        onClick={handleCopy}
        className="px-2.5 py-1 text-xs font-medium rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
      >
        {copied ? "Copied!" : "Copy Code"}
      </button>
    </div>
    <pre className="text-sm font-mono text-neutral-300 bg-black p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
      {results.patchedCode}
    </pre>
  </div>
</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
