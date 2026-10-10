"use client";
import { useEffect, useRef, useState } from "react";

const W = 320, H = 180, FLOOR = 166, ROUND = 30, HS_KEY = "valo_instant_aim_best";
const EYE = [
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0],[0,0,1,1,2,2,2,2,2,2,1,1,0,0],[0,1,2,2,3,3,3,3,3,3,2,2,1,0],[1,2,2,3,3,4,4,4,4,3,3,2,2,1],
  [1,2,3,3,4,0,0,0,0,4,3,3,2,1],[1,2,3,4,0,0,0,0,0,0,4,3,2,1],[1,2,3,4,0,0,0,0,0,0,4,3,2,1],[1,2,3,4,0,0,0,0,0,0,4,3,2,1],
  [1,2,3,4,0,0,0,0,0,0,4,3,2,1],[1,2,3,3,4,0,0,0,0,4,3,3,2,1],[1,2,2,3,3,4,4,4,4,3,3,2,2,1],[0,1,2,2,3,3,3,3,3,3,2,2,1,0],
  [0,0,1,1,2,2,2,2,2,2,1,1,0,0],[0,0,0,0,1,1,1,1,1,1,0,0,0,0]];
const PALETTE = [null, "#3f1b4f", "#9c27b0", "#e1bee7", "#111111"];
const ROASTS = ["PATHETIC", "MISSED AGAIN?", "ARE YOU BLIND?", "TRY HARDER", "MY GRANDMA AIMS BETTER", "DISAPPOINTING"];
const verdict = (acc: number, hits: number) => hits === 0 ? "DID YOU EVEN SHOOT?" : acc >= 85 && hits >= 25 ? "NOT BAD. FOR A MORTAL." : acc >= 70 ? "ACCEPTABLE. BARELY." : acc >= 50 ? "MY GRANDMA AIMS BETTER" : "PATHETIC";

type T = { x: number; y: number; vx: number; vy: number; r: number; wob: number };
type P = { x: number; y: number; vx: number; vy: number; t: number; c: string };
type Pop = { x: number; y: number; text: string; t: number; c: string };

export function AimTrainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [hud, setHud] = useState({ time: ROUND, hits: 0, streak: 0, best: 0 });
  const [result, setResult] = useState({ hits: 0, shots: 0, acc: 0, best: 0, newBest: false, verdict: "" });
  const st = useRef({ running: false, raf: 0, last: 0, timeLeft: ROUND, hits: 0, misses: 0, shots: 0, streak: 0, bestStreak: 0, targets: [] as T[], particles: [] as P[], popups: [] as Pop[], flash: 0, spawnT: 0, chat: { text: "", t: 0 }, mouse: { x: W / 2, y: H / 2 }, scale: 1 });

  useEffect(() => { setHud((h) => ({ ...h, best: parseInt(localStorage.getItem(HS_KEY) || "0", 10) || 0 })); }, []);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const fit = () => { const dpr = Math.min(window.devicePixelRatio || 1, 3); const w = c.clientWidth; const s = w / W; st.current.scale = s; c.width = W * s * dpr; c.height = H * s * dpr; ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0); ctx.imageSmoothingEnabled = false; };
    fit(); window.addEventListener("resize", fit);
    draw(ctx);
    const state = st.current;
    return () => { window.removeEventListener("resize", fit); cancelAnimationFrame(state.raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sprite = (ctx: CanvasRenderingContext2D, grid: number[][], x: number, y: number, px: number) => {
    for (let r = 0; r < grid.length; r++) for (let col = 0; col < grid[r].length; col++) { const v = grid[r][col]; if (!v) continue; ctx.fillStyle = PALETTE[v]!; ctx.fillRect(Math.round(x + col * px), Math.round(y + r * px), px, px); }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const s = st.current;
    ctx.fillStyle = "#0b0612"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#1a0b2a"); g.addColorStop(1, "#0b0612"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR);
    ctx.fillStyle = "#3f1b4f"; for (let i = 0; i < 12; i++) ctx.fillRect(i * 28, 120 + (i % 3) * 8, 18, FLOOR - 120 - (i % 3) * 8);
    ctx.fillStyle = "#2a1538"; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = "#ff4655"; ctx.fillRect(0, FLOOR, W, 1);
    if (s.flash > 0) { ctx.fillStyle = `rgba(255,70,85,${s.flash})`; ctx.fillRect(0, 0, W, H); }
    s.targets.forEach((t) => { const px = t.r / 7; sprite(ctx, EYE, t.x - t.r, t.y - t.r + Math.sin(t.wob) * 2, px); });
    s.particles.forEach((p) => { ctx.globalAlpha = Math.max(0, p.t / 30); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 2, 2); });
    ctx.globalAlpha = 1;
    s.popups.forEach((p) => { ctx.globalAlpha = Math.min(1, p.t / 20); ctx.fillStyle = p.c; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText(p.text, p.x, p.y - (40 - p.t) * 0.4); });
    ctx.globalAlpha = 1;
    if (s.chat.t > 0) { ctx.fillStyle = "#e1bee7"; ctx.font = "bold 10px monospace"; ctx.textAlign = "left"; ctx.fillText("REYNA: " + s.chat.text, 6, 14); }
    // crosshair
    const m = s.mouse; ctx.strokeStyle = "#3df5c8"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(m.x - 8, m.y); ctx.lineTo(m.x - 3, m.y); ctx.moveTo(m.x + 3, m.y); ctx.lineTo(m.x + 8, m.y); ctx.moveTo(m.x, m.y - 8); ctx.lineTo(m.x, m.y - 3); ctx.moveTo(m.x, m.y + 3); ctx.lineTo(m.x, m.y + 8); ctx.stroke();
  };

  const spawn = () => {
    const s = st.current; const elapsed = ROUND - s.timeLeft;
    const left = Math.random() < 0.5; const r = 7 + Math.floor(Math.random() * 6);
    const speed = (Math.random() * 0.9 + 0.55) * (1 + elapsed / 40);
    s.targets.push({ x: left ? -r : W + r, y: 30 + Math.random() * (FLOOR - 60), vx: (left ? 1 : -1) * speed, vy: (Math.random() - 0.5) * 0.4, r, wob: Math.random() * 6 });
  };

  const loop = (now: number) => {
    const s = st.current; if (!s.running) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const dt = Math.min(2, (now - s.last) / 16.67); s.last = now;
    s.timeLeft -= dt / 60;
    s.spawnT += dt; const interval = Math.max(18, 48 - (ROUND - s.timeLeft) * 1.1);
    if (s.spawnT > interval) { spawn(); s.spawnT = 0; }
    s.targets.forEach((t) => { t.x += t.vx * dt; t.y += t.vy * dt; t.wob += 0.1 * dt; });
    const escaped = s.targets.filter((t) => t.x < -20 || t.x > W + 20).length;
    if (escaped) { s.streak = 0; if (Math.random() < 0.5) s.chat = { text: ROASTS[Math.floor(Math.random() * ROASTS.length)], t: 90 }; }
    s.targets = s.targets.filter((t) => t.x >= -20 && t.x <= W + 20);
    s.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.1 * dt; p.t -= dt; }); s.particles = s.particles.filter((p) => p.t > 0);
    s.popups.forEach((p) => (p.t -= dt)); s.popups = s.popups.filter((p) => p.t > 0);
    s.flash = Math.max(0, s.flash - 0.05 * dt); s.chat.t -= dt;
    draw(ctx);
    setHud((h) => ({ ...h, time: Math.max(0, Math.ceil(s.timeLeft)), hits: s.hits, streak: s.streak }));
    if (s.timeLeft <= 0) return end();
    s.raf = requestAnimationFrame(loop);
  };

  const start = () => {
    const s = st.current;
    Object.assign(s, { running: true, timeLeft: ROUND, hits: 0, misses: 0, shots: 0, streak: 0, bestStreak: 0, targets: [], particles: [], popups: [], flash: 0, spawnT: 0, chat: { text: "SHOW ME.", t: 90 } });
    setPhase("play"); s.last = performance.now(); s.raf = requestAnimationFrame(loop);
  };

  const end = () => {
    const s = st.current; s.running = false; cancelAnimationFrame(s.raf);
    const acc = s.shots ? Math.round((s.hits / s.shots) * 100) : 0;
    const prev = parseInt(localStorage.getItem(HS_KEY) || "0", 10) || 0;
    const newBest = s.hits > prev; const best = Math.max(prev, s.hits);
    try { localStorage.setItem(HS_KEY, String(best)); } catch {}
    setResult({ hits: s.hits, shots: s.shots, acc, best, newBest, verdict: verdict(acc, s.hits) });
    setHud((h) => ({ ...h, best })); setPhase("over");
  };

  const pos = (e: React.PointerEvent) => { const r = canvasRef.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  const fire = (e: React.PointerEvent) => {
    const s = st.current; const p = pos(e); s.mouse = p;
    if (!s.running) return;
    s.shots++;
    const i = s.targets.findIndex((t) => Math.hypot(t.x - p.x, t.y - p.y) <= t.r + 2);
    if (i >= 0) {
      const t = s.targets[i]; s.targets.splice(i, 1); s.hits++; s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak);
      for (let k = 0; k < 14; k++) s.particles.push({ x: t.x, y: t.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.8) * 3, t: 30, c: ["#9c27b0", "#e1bee7", "#ff4655"][k % 3] });
      s.popups.push({ x: t.x, y: t.y, text: s.streak >= 3 ? `+1 x${s.streak}` : "+1", t: 40, c: "#3df5c8" });
    } else {
      s.misses++; s.streak = 0; s.flash = 0.25;
      s.popups.push({ x: p.x, y: p.y, text: "MISS", t: 30, c: "#ff4655" });
      if (s.misses % 3 === 0) s.chat = { text: ROASTS[Math.floor(Math.random() * ROASTS.length)], t: 90 };
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-4 border-b border-line text-center">
        {[["TIME", hud.time], ["HITS", hud.hits], ["STREAK", hud.streak], ["BEST", hud.best]].map(([l, v]) => (
          <div key={l as string} className="py-2"><p className="font-mono text-[10px] text-fg-3">{l}</p><p className={`font-display text-xl ${l === "BEST" ? "text-teal" : ""}`}>{v}</p></div>
        ))}
      </div>
      <div className="relative select-none touch-none" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas ref={canvasRef} className="block h-full w-full cursor-crosshair" style={{ imageRendering: "pixelated" }} onPointerDown={fire} onPointerMove={(e) => { st.current.mouse = pos(e); if (!st.current.running) draw(canvasRef.current!.getContext("2d")!); }} aria-label="Aim trainer range" role="img" />
        {phase !== "play" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/85 p-4 text-center backdrop-blur-sm">
            {phase === "idle" ? (
              <>
                <p className="kicker">SHOOT THE BLIND</p>
                <p className="max-w-xs text-sm text-fg-2">Destroy the Leers before they cross the range. {ROUND} seconds. Every miss, she notices.</p>
                <button type="button" onClick={start} className="btn-primary">Start round</button>
              </>
            ) : (
              <>
                {result.newBest && <p className="kicker text-teal">NEW PERSONAL BEST</p>}
                <p className="h2">Round over</p>
                <p className="text-sm text-fg-2">{result.hits} hits · {result.shots} shots · {result.acc}% accuracy</p>
                <p className="font-mono text-xs text-val">REYNA: {result.verdict}</p>
                <button type="button" onClick={start} className="btn-primary">Play again</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
