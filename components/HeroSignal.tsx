import { FoxMark } from "./FoxMark";

export function HeroSignal() {
  return (
    <div className="hero-signal" aria-hidden="true">
      <div className="hero-signal-grid" />
      <div className="hero-signal-ring ring-a" />
      <div className="hero-signal-ring ring-b" />
      <div className="hero-fox-core"><FoxMark size={94} /></div>
      <div className="hero-node node-ai"><span>AI</span></div>
      <div className="hero-node node-tech"><span>TECH</span></div>
      <div className="hero-node node-code"><span>CODE</span></div>
      <div className="hero-node node-market"><span>MARKETS</span></div>
      <div className="hero-wire wire-1" />
      <div className="hero-wire wire-2" />
      <div className="hero-wire wire-3" />
      <div className="hero-wire wire-4" />
      <div className="signal-chip">LIVE / 04 DESKS</div>
    </div>
  );
}
