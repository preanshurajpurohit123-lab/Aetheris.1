import React, { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we map any odd symbols if necessary
    let formattedSymbol = symbol;

    if (!symbol.includes(":")) {
      const symbolMap: Record<string, string> = {
        AAPL: "NASDAQ:AAPL",
        NVDA: "NASDAQ:NVDA",
        TSLA: "NASDAQ:TSLA",
        MSFT: "NASDAQ:MSFT",
        TSMC: "NYSE:TSM",
        ASML: "NASDAQ:ASML",
        AMD: "NASDAQ:AMD",
        ENPH: "NASDAQ:ENPH",
        FSLR: "NASDAQ:FSLR",
        NEE: "NYSE:NEE",
        GLD: "AMEX:GLD",
        TLT: "NASDAQ:TLT",
        SHY: "NASDAQ:SHY",
        VIX: "CBOE:VIX",
      };

      formattedSymbol = symbolMap[symbol] || `NASDAQ:${symbol}`;
    }

    // Create container ID dynamically to avoid widget conflicts
    const containerId = `tradingview_widget_${symbol.toLowerCase()}`;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: formattedSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0d111a",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId,
          studies: [
            "RSI@tv-basicstudies",
            "MASimple@tv-basicstudies"
          ],
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [symbol]);

  return (
    <div className="w-full h-[380px] bg-[#0d111a] border border-[#1e293b] rounded-lg overflow-hidden flex flex-col" id={`tv-container-${symbol}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#090d16] border-b border-[#1e293b]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-brand-cyan tracking-wider uppercase font-semibold">Live Analysis</span>
          <span className="text-[10px] font-mono text-slate-500">• TradingView Real-time Widget</span>
        </div>
      </div>
      <div id={`tradingview_widget_${symbol.toLowerCase()}`} ref={containerRef} className="flex-1 w-full h-full" />
    </div>
  );
}
