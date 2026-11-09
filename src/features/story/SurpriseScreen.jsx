import { useState, useEffect, useRef, useContext } from 'react';
import { Sparkles, Camera, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { GameContext } from '../../shared/GameContext';
import { DEFAULT_GIFTS } from '../../shared/gameConfig';
import { audio } from '../../services/audioService';

export function SurpriseScreen() {
  const { config, resetProgress } = useContext(GameContext);
  const canvasRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [activeModalGift, setActiveModalGift] = useState(null);
  const [showDedication, setShowDedication] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [setShowBanner] = useState(false);

  const gifts = (typeof DEFAULT_GIFTS !== 'undefined' && Array.isArray(DEFAULT_GIFTS) && DEFAULT_GIFTS.length === 9)
    ? DEFAULT_GIFTS
    : FALLBACK_GIFTS;
  const MAX_PICKS = 3;

  // Fireworks & Crackers Engine
  const fireworksRef = useRef({
    particles: [],
    rockets: [],
    burstsPending: []
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let autoLaunchTimer;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const colors = [
      '#fbbf24', '#f59e0b', '#f43f5e', '#ec4899',
      '#38bdf8', '#60a5fa', '#4ade80', '#c084fc', '#ffffff'
    ];

    // Create explosion at (x, y)
    const createBurst = (x, y, particleCount = 55, customColors = null) => {
      const palette = customColors || colors;
      const baseColor = palette[Math.floor(Math.random() * palette.length)];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        fireworksRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.3 ? baseColor : palette[Math.floor(Math.random() * palette.length)],
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          size: Math.random() * 3 + 1.8,
          gravity: 0.08,
          friction: 0.96,
          sparkle: Math.random() > 0.4
        });
      }
    };

    // Launch rocket from bottom to target
    const launchRocket = (targetX = null, targetY = null) => {
      const x = targetX || Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
      const startY = canvas.height;
      const targetYCoord = targetY || Math.random() * (canvas.height * 0.45) + canvas.height * 0.15;
      const speed = Math.random() * 3 + 10;

      fireworksRef.current.rockets.push({
        x,
        y: startY,
        vx: (Math.random() - 0.5) * 2,
        vy: -speed,
        targetY: targetYCoord,
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: []
      });
    };

    // Initial celebratory barrage
    setTimeout(() => {
      launchRocket(canvas.width * 0.3, canvas.height * 0.3);
      launchRocket(canvas.width * 0.7, canvas.height * 0.28);
      launchRocket(canvas.width * 0.5, canvas.height * 0.22);
      audio.playCrackerSFX();
    }, 400);

    // Continuous ambient fireworks
    autoLaunchTimer = setInterval(() => {
      if (document.hidden) return;
      launchRocket();
      if (Math.random() > 0.6) {
        setTimeout(() => launchRocket(), 250);
      }
    }, 1100);

    // Animation Loop
    const loop = () => {
      // Soft fade trail for glowing cracker streaks
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fw = fireworksRef.current;

      // Handle pending interactive bursts
      while (fw.burstsPending.length > 0) {
        const b = fw.burstsPending.pop();
        createBurst(b.x, b.y, b.count || 70, b.colors);
      }

      // Update rockets
      for (let i = fw.rockets.length - 1; i >= 0; i--) {
        const r = fw.rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.05; 

        // Rocket sparkle trail
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (r.vy >= 0 || r.y <= r.targetY) {
          createBurst(r.x, r.y, Math.floor(Math.random() * 25) + 45);
          fw.rockets.splice(i, 1);
        }
      }

      // Update particles
      for (let i = fw.particles.length - 1; i >= 0; i--) {
        const p = fw.particles[i];
        p.vx *= p.friction;
        p.vy = p.vy * p.friction + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          fw.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.sparkle && Math.random() > 0.3) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(autoLaunchTimer);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Handle card click
  const handleCardClick = (gift, e) => {
    const isSelected = selectedIds.includes(gift.id);

    if (isSelected) {
      setActiveModalGift(gift);
      return;
    }

    if (selectedIds.length >= MAX_PICKS) {
      setShowBanner(true);
      return;
    }

    // Trigger local cracker explosion at card position
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const burstX = rect.left + rect.width / 2;
      const burstY = rect.top + rect.height / 2;
      fireworksRef.current.burstsPending.push({
        x: burstX,
        y: burstY,
        count: 75,
        colors: ['#fbbf24', '#f43f5e', '#ec4899', '#ffffff']
      });
    }

    audio.playCardFlipSFX();
    audio.playCrackerSFX();

    const nextSelected = [...selectedIds, gift.id];
    setSelectedIds(nextSelected);

    if (nextSelected.length === MAX_PICKS) {
      setShowBanner(true);
      setTimeout(() => {
        audio.playGrandFanfareSFX();
        // Grand celebration blast
        const w = window.innerWidth;
        const h = window.innerHeight;
        fireworksRef.current.burstsPending.push({ x: w * 0.25, y: h * 0.3, count: 90 });
        fireworksRef.current.burstsPending.push({ x: w * 0.75, y: h * 0.3, count: 90 });
        fireworksRef.current.burstsPending.push({ x: w * 0.5, y: h * 0.2, count: 120 });
      }, 300);
    }
  };

  const resetSelection = () => {
    setSelectedIds([]);
    setShowBanner(false);
    audio.playTone(400, 'sine', 0.15, 0.1);
  };

  const copySelectedSummary = () => {
    const chosenGifts = gifts.filter(g => selectedIds.includes(g.id));
    const text = `🎁 My 3 Unlocked Surprises from ${config.gameTitle}:\n` +
      chosenGifts.map((g, i) => `${i + 1}. ${g.icon} ${g.title}: ${g.desc}`).join('\n') +
      `\n\nClaimed for ${config.recipientNickname}! 💖`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  const selectedCount = selectedIds.length;
  const isComplete = selectedCount >= MAX_PICKS;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden font-sans select-none animate-fade-in">
      {/* Background Fireworks / Crackers Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Main Foreground Container */}
      <div className="relative z-10 w-full max-w-4xl px-4 py-6 md:py-8 flex flex-col items-center text-center">

        {/* Celebratory Heading */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-2 shadow-lg backdrop-blur-md animate-pulse">
          <span>✨</span>
          <span>THE GRAND FINALE</span>
          <span>✨</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-rose-300 to-pink-400 drop-shadow-[0_4px_24px_rgba(251,191,36,0.5)]">
          SURPRISE SURPRISE! 💝
        </h1>

        <p className="mt-2 text-sm sm:text-base md:text-lg font-medium text-amber-100/90 max-w-xl leading-relaxed">
          Select any 3 to unlock your surprises! 🎁
        </p>

        {/* Prominent Screenshot Instruction Callout */}
        <div className="mt-3.5 px-4 py-2.5 rounded-2xl bg-slate-900/80 border-2 border-pink-500/50 backdrop-blur-md shadow-xl flex items-center gap-2.5 text-xs sm:text-sm text-pink-200">
          <Camera className="w-4 h-4 text-pink-400 shrink-0 animate-bounce" />
          <span>
            <b>Don't forget:</b> Take a screenshot of your 3 unlocked cards & send it to me to claim them! 📸💌
          </span>
        </div>

        {/* Selection Counter Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(slot => (
              <span
                key={slot}
                className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs transition-all ${
                  slot <= selectedCount
                    ? 'bg-amber-400 border-amber-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.7)] scale-110'
                    : 'bg-white/5 border-white/20 text-slate-500'
                }`}
              >
                {slot <= selectedCount ? '✓' : slot}
              </span>
            ))}
          </div>
          <span className="text-amber-200 ml-1">
            {selectedCount} of {MAX_PICKS} Surprises Unlocked
          </span>
          {selectedCount > 0 && (
            <button
              onClick={resetSelection}
              className="ml-3 text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 underline transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset & Pick Again
            </button>
          )}
        </div>

        {/* 3x3 Grid of 9 Cards */}
        <div className="mt-6 w-full grid grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4.5 max-w-3xl">
          {gifts.map((gift, idx) => {
            const isUnlocked = selectedIds.includes(gift.id);
            const isLockedOut = !isUnlocked && isComplete;
            let cardStateClass;

            if (isUnlocked) {
              cardStateClass = 'bg-gradient-to-br from-amber-950/90 via-slate-900/95 to-rose-950/90 border-2 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.35)] scale-[1.02]';
            } else if (isLockedOut) {
              cardStateClass = 'bg-slate-950/50 border border-white/10 opacity-40 cursor-not-allowed';
            } else {
              cardStateClass = 'bg-slate-900/70 border-2 border-amber-400/40 hover:border-amber-400 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(251,191,36,0.25)] hover:scale-105 active:scale-95';
            }

            return (
              <button
                type="button"
                key={gift.id}
                disabled={isLockedOut}
                onClick={(e) => handleCardClick(gift, e)}
                className={`relative group rounded-2xl p-2.5 sm:p-3.5 md:p-4 text-center transition-all duration-300 flex flex-col items-center justify-between min-h-[145px] sm:min-h-[175px] md:min-h-[200px] select-none cursor-pointer ${cardStateClass}`}
              >
                {/* UNLOCKED CARD STATE */}
                {isUnlocked ? (
                  <>
                    <div className="w-full flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider border border-amber-400/30">
                        {gift.tag}
                      </span>
                      <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">CLAIMED</span>
                      </span>
                    </div>

                    <div className="my-1 sm:my-2 text-3xl sm:text-4xl md:text-5xl filter drop-shadow-md animate-bounce">
                      {gift.icon}
                    </div>

                    <div className="w-full">
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-amber-200 line-clamp-1 font-serif">
                        {gift.title}
                      </h3>
                      <p className="mt-1 text-[10px] sm:text-xs text-pink-100/90 leading-tight line-clamp-2 md:line-clamp-3">
                        {gift.desc}
                      </p>
                    </div>
                  </>
                ) : (
                  /* LOCKED MYSTERY GIFT STATE */
                  <>
                    <div className="w-full flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-amber-400/70">CARD #{idx + 1}</span>
                      <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    </div>

                    <div className="my-auto flex flex-col items-center">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-400/40 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-inner group-hover:scale-110 transition-transform">
                        🎁
                      </div>
                      <span className="mt-2 text-xs sm:text-sm font-bold text-amber-200/90 tracking-wide font-serif">
                        Mystery Surprise
                      </span>
                    </div>

                    <div className="w-full py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-semibold text-amber-300/80 group-hover:bg-amber-400 group-hover:text-black transition">
                      {isLockedOut ? 'Locked (3/3 Picked)' : 'Tap to Unwrap ✨'}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Congratulations & Screenshot Banner (when 3 are chosen) */}
        {isComplete && (
          <div className="mt-6 w-full max-w-2xl rounded-3xl bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-purple-950/90 border-2 border-amber-300 p-5 md:p-6 text-center shadow-2xl backdrop-blur-md animate-fade-in">
            <div className="text-3xl mb-1">🎉 📸 💖</div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-200">
              Your 3 Surprises Are Unlocked!
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-pink-100 max-w-md mx-auto leading-relaxed">
              Take a screenshot right now and send it to me so I can make all 3 of your chosen surprises happen!
            </p>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={copySelectedSummary}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{copiedNotification ? "Copied to Clipboard! ✓" : "Copy Surprises Summary 📋"}</span>
              </button>

              <button
                onClick={resetSelection}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pick Different Cards</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setShowDedication(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/30 transition flex items-center gap-1.5"
          >
          </button>

          <button
            onClick={() => {
              if (window.confirm("Would you like to restart the garden adventure from Level 1?")) {
                resetProgress();
              }
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition"
          >
            Play Game Again 🌻
          </button>
        </div>
      </div>

      {/* MODAL: Large Card Detail View */}
      {activeModalGift && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-amber-950 border-2 border-amber-400 p-6 text-center shadow-2xl">
            <button
              onClick={() => setActiveModalGift(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-400/30">
              {activeModalGift.tag}
            </span>

            <div className="my-4 text-6xl">
              {activeModalGift.icon}
            </div>

            <h3 className="text-2xl font-bold font-serif text-amber-200">
              {activeModalGift.title}
            </h3>

            <p className="mt-3 text-sm text-pink-100 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/10">
              "{activeModalGift.desc}"
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => setActiveModalGift(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 font-bold text-slate-950 text-sm transition hover:brightness-110 shadow-lg"
              >
                Keep Card ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Fairytale Dedication Note */}
      {showDedication && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#fffef8] text-[#4a3525] border-2 border-amber-400 p-6 md:p-8 text-center shadow-2xl">
            <button
              onClick={() => setShowDedication(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
