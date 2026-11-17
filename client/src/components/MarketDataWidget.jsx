import React, { useEffect } from "react";

const DEFAULT_SECTORS = [
  {
    sectionName: "Indices",
    symbols: [
      "FOREXCOM:SPXUSD",
      "FOREXCOM:NSXUSD",
      "FOREXCOM:DJI",
      "INDEX:NKY",
      "INDEX:DEU40",
      "FOREXCOM:UKXGBP",
    ],
  },
  {
    sectionName: "Futures",
    symbols: [
      "BMFBOVESPA:ISP1!",
      "BMFBOVESPA:EUR1!",
      "CMCMARKETS:GOLD",
      "TVC:USOIL",
      "BMFBOVESPA:CCM1!",
    ],
  },
  {
    sectionName: "Bonds",
    symbols: ["EUREX:FGBL1!", "EUREX:FBTP1!", "EUREX:FGBM1!"],
  },
  {
    sectionName: "Forex",
    symbols: [
      "FX:EURUSD",
      "FX:GBPUSD",
      "FX:USDJPY",
      "FX:USDCHF",
      "FX:AUDUSD",
      "FX:USDCAD",
    ],
  },
];

export default function MarketDataWidget({ sectors = DEFAULT_SECTORS }) {
  useEffect(() => {
    const scriptId = "tv-market-data-script";

    // Prevent loading the script multiple times if the component re-renders
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.src =
        "https://widgets.tradingview-widget.com/w/en/tv-market-data.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <tv-market-data symbol-sectors={JSON.stringify(sectors)}></tv-market-data>
    </div>
  );
}
