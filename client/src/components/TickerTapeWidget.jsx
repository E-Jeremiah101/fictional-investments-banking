import React, { useEffect } from "react";

const DEFAULT_SYMBOLS = [
  "FOREXCOM:SPXUSD",
  "FOREXCOM:NSXUSD",
  "FOREXCOM:DJI",
  "FX:EURUSD",
  "BITSTAMP:BTCUSD",
  "BITSTAMP:ETHUSD",
  "CMCMARKETS:GOLD",
];

export default function TickerTapeWidget({
  symbols = DEFAULT_SYMBOLS,
  direction = "horizontal",
  hideChart = false,
  itemSize = "normal",
}) {
  useEffect(() => {
    const scriptId = "tv-ticker-tape-script";

    // Load the script only once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.src =
        "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Join array into a comma-separated string if an array is passed
  const symbolsAttr = Array.isArray(symbols) ? symbols.join(",") : symbols;

  return (
    <div style={{ width: "100%" }}>
      <tv-ticker-tape
        symbols={symbolsAttr}
        direction={direction}
        hide-chart={hideChart ? "" : undefined}
        item-size={itemSize}
      ></tv-ticker-tape>
    </div>
  );
}
