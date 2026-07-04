import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, PortfolioState, VolatilityResult } from "../types";
import { Sparkles, Send, Bot, User, HelpCircle, Loader2, Play } from "lucide-react";
import { api } from "../lib/api";

interface CopilotWidgetProps {
  portfolio: PortfolioState;
}

export default function CopilotWidget({ portfolio }: CopilotWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: "Welcome to Aetheris Copilot (v4.12.0). I am connected to your paper trading portfolio. You can ask me to analyze asset exposures, simulate interest rate changes, or explain complex investment mechanics.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [volatilityResult, setVolatilityResult] = useState<VolatilityResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, volatilityResult]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue("");
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyFormatted = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));
      const data = await api.copilotChat(text, portfolio, historyFormatted);

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: data.text,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "System alert: AI Intelligence core is undergoing standard server-side cold boot or rate limiting. Continuing fallback simulator.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerVolatilitySimulation = async () => {
    setIsSimulating(true);
    setVolatilityResult(null);

    // Add immediate action context to message box
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        role: "user",
        content: "Run portfolio stress test simulation for upcoming earnings season",
        timestamp: new Date()
      }
    ]);

    try {
      const data: VolatilityResult = await api.simulateVolatility(portfolio);
      
      setVolatilityResult(data);
      
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: `**Stress Test Completed.** I've compiled the Aetheris Volatility Report below. It indicates high tech sector concentration sensitivity, with the **Tech Earnings Blowout** scenario offering the highest statistical probability (${data.scenarios[0]?.probability || "40%"}).`,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg flex flex-col h-[400px] glowing-shadow overflow-hidden" id="copilot-panel">
      {/* Copilot Header */}
      <div className="bg-[#07090e] border-b border-[#1e293b] px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-brand-cyan" />
          <span className="font-display font-semibold text-sm text-white tracking-wide">
            Aetheris Copilot
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-blue/15 text-brand-cyan border border-brand-cyan/20">
            v4.12
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-brand-cyan pulse-badge"></span>
          <span>Cognitive Node Online</span>
        </div>
      </div>

      {/* Suggestion Prompt Trigger (Matches Screenshot exactly) */}
      {!volatilityResult && !isSimulating && (
        <div className="bg-brand-blue/5 border-b border-brand-cyan/15 p-3 flex items-start gap-2.5 transition-all hover:bg-brand-blue/10">
          <HelpCircle className="h-4 w-4 text-brand-cyan shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              <span className="text-brand-cyan font-semibold">Aetheris Copilot:</span> Earnings season starts tomorrow. Would you like a volatility simulation for your holdings?
            </p>
            <button
              onClick={handleTriggerVolatilitySimulation}
              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono bg-brand-blue/20 hover:bg-brand-blue/35 text-white border border-brand-cyan/25 rounded transition-all duration-200 cursor-pointer"
            >
              <Play className="h-2.5 w-2.5 fill-current text-brand-cyan" />
              <span>Simulate Volatility Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === "user"
                  ? "bg-slate-800 border-slate-700"
                  : "bg-brand-blue/15 border-brand-cyan/20"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-3.5 w-3.5 text-slate-300" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-brand-cyan" />
              )}
            </div>

            <div
              className={`p-3 rounded-lg text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-slate-800 text-slate-100 rounded-tr-none font-sans"
                  : "bg-[#07090e] border border-[#1e293b] text-slate-300 rounded-tl-none font-sans"
              }`}
            >
              <div className="prose prose-invert max-w-none text-slate-300 space-y-1">
                {msg.content.split("\n").map((para, idx) => {
                  // Basic rendering helper to display markdown highlights without external md parser
                  const formatted = para
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                    .replace(/`(.*?)`/g, "<code class='font-mono bg-slate-900 px-1 py-0.5 rounded text-[10px] text-brand-cyan'>$1</code>");
                  return (
                    <p key={idx} dangerouslySetInnerHTML={{ __html: formatted }} />
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Dynamic Volatility Stress Test Output */}
        {volatilityResult && (
          <div className="bg-[#07090e] border border-[#1e293b] rounded-lg p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
              <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                Stress Test Scenario Matrix
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 font-sans italic leading-relaxed">
              {volatilityResult.summary}
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-1.5">
              {volatilityResult.scenarios.map((sc, index) => (
                <div
                  key={index}
                  className={`p-2.5 rounded border text-[11px] ${
                    sc.relevance === "high"
                      ? "bg-brand-blue/5 border-brand-cyan/20"
                      : "bg-[#0d111a]/50 border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-display font-semibold text-slate-200">
                      {sc.name}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700/50">
                        Prob: {sc.probability}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${
                        sc.impact.startsWith("+") ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        Impact: {sc.impact}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    {sc.outlook}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSimulating && (
          <div className="flex items-center gap-2.5 p-3.5 bg-slate-900/40 border border-dashed border-slate-800 rounded-lg text-slate-400 font-mono text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />
            <span>Calculating stress metrics across 1,000 market paths...</span>
          </div>
        )}

        {isLoading && (
          <div className="flex gap-2 items-center text-slate-500 font-mono text-[10px] pl-10">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-cyan" />
            <span>AETHERIS AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-[#07090e] border-t border-[#1e293b] p-3 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask Aetheris Copilot... (e.g. 'How does beta impact my risk?')"
          className="flex-1 bg-slate-950/70 border border-[#1e293b] text-slate-100 px-3.5 py-2 rounded-lg text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-brand-cyan/40"
          disabled={isLoading || isSimulating}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || isSimulating || !inputValue.trim()}
          className="bg-brand-blue/20 hover:bg-brand-blue/40 border border-brand-cyan/20 hover:border-brand-cyan/45 text-white h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-3.5 w-3.5 text-brand-cyan" />
        </button>
      </div>
    </div>
  );
}
