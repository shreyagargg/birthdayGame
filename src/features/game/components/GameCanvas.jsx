import { useEffect, useRef, useContext } from 'react';
import { GameContext } from '../../../shared/GameContext';
import { audio } from '../../../services/audioService';

export function GameCanvas() {
  const {
    gameState, setGameState, currentLevel, setCurrentLevel,
    collectedEnvelopes, collectEnvelope, triggerDialogue, isPaused
  } = useContext(GameContext);

  const canvasRef = useRef(null);
  const portalLock = useRef(false);
  const danceTransitionScheduled = useRef(false);
  const gridMoveHeld = useRef(false);

  // Level 5 maze: 9 columns x 6 rows. 1 = blocked, 0 = walkable.
  const maze = [
    [0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  const keys = useRef({ left: false, right: false, jump: false, interact: false });
  const player = useRef({
    x: 80, y: 400, vx: 0, vy: 0, width: 32, height: 48,
    isGrounded: false, facing: 'right', animFrame: 0, animTimer: 0
  });

  const princess = useRef({ x: 830, y: 48, width: 30, height: 46 });

  const crystals = useRef([
    { x: 250, y: 380, active: false },
    { x: 450, y: 300, active: false },
    { x: 650, y: 380, active: false }
  ]);

  // Levels live in a ref so moving platforms keep their position between renders
  const levels = useRef({
    1: {
      name: "The Whispering Forest",
      bgColor: "#091124",
      platforms: [
        { x: 0, y: 520, w: 900, h: 80 },
        { x: 250, y: 430, w: 140, h: 20 },
        { x: 480, y: 350, w: 140, h: 20 },
        { x: 700, y: 280, w: 150, h: 20 }
      ],
      envelope: { x: 760, y: 235 },
      nextPortal: { x: 840, y: 450, w: 40, h: 70 }
    },
    2: {
      name: "The Moonlit Memories Quiz",
      bgColor: "#0a1733",
      platforms: [{ x: 0, y: 520, w: 900, h: 80 }],
      envelope: null,
      nextPortal: null
    },
    3: {
      name: "The Crystal Garden",
      bgColor: "#140e2b",
      platforms: [
        { x: 0, y: 520, w: 900, h: 80 },
        { x: 200, y: 410, w: 120, h: 20 },
        { x: 380, y: 330, w: 140, h: 20 },
        { x: 600, y: 410, w: 120, h: 20 }
      ],
      envelope: { x: 430, y: 470, lockedByPuzzle: true },
      nextPortal: { x: 840, y: 450, w: 40, h: 70 }
    },
    4: {
      name: "The Cloud Bridge",
      bgColor: "#161338",
      platforms: [
        { x: 0, y: 520, w: 180, h: 80 },
        { x: 220, y: 440, w: 110, h: 20, moving: true, range: 100, dir: 1, initialX: 220 },
        { x: 450, y: 380, w: 110, h: 20 },
        { x: 620, y: 300, w: 110, h: 20, moving: true, range: 80, dir: -1, initialX: 620 },
        { x: 760, y: 520, w: 200, h: 80 }
      ],
      envelope: { x: 660, y: 255 },
      nextPortal: { x: 860, y: 450, w: 40, h: 70 }
    },
    5: {
      name: "The Royal Castle Maze",
      bgColor: "#1c113b",
      platforms: [],
      envelope: { x: 850, y: 50 },
      gate: null
    }
  }).current;

  useEffect(() => {
    portalLock.current = false;
    if (currentLevel === 5) {
      player.current.x = 34;
      player.current.y = 526;
      player.current.vx = 0;
      player.current.vy = 0;
    } else if (currentLevel === 2) {
      player.current.x = 40;
      player.current.y = 400;
      player.current.vx = 0;
      player.current.vy = 0;
    }
    if (gameState !== 'DANCE') danceTransitionScheduled.current = false;
  }, [currentLevel, gameState]);

  const handleInteract = () => {
    if (currentLevel === 3) {
      let updatedAny = false;
      crystals.current.forEach(c => {
        const dist = Math.hypot((player.current.x + 16) - c.x, (player.current.y + 24) - c.y);
        if (dist < 45) {
          c.active = !c.active;
          updatedAny = true;
          audio.playTone(c.active ? 600 : 300, 'sine', 0.2, 0.1);
        }
      });

      if (updatedAny && crystals.current.every(c => c.active)) {
        audio.playGateSFX();
        triggerDialogue("The crystal flowers illuminate! The memory container has unlocked.");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'PLAYING' || isPaused) return;
      if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();

      if (currentLevel === 5) {
        const directions = {
          ArrowLeft: [-1, 0], KeyA: [-1, 0],
          ArrowRight: [1, 0], KeyD: [1, 0],
          ArrowUp: [0, -1], KeyW: [0, -1], Space: [0, -1],
          ArrowDown: [0, 1], KeyS: [0, 1]
        };
        const direction = directions[e.code];
        if (direction && !gridMoveHeld.current) {
          gridMoveHeld.current = true;
          const col = Math.max(0, Math.min(8, Math.floor((player.current.x + 16) / 100)));
          const row = Math.max(0, Math.min(5, Math.floor((player.current.y + 24) / 100)));
          const nextCol = col + direction[0];
          const nextRow = row + direction[1];
          if (nextCol >= 0 && nextCol < 9 && nextRow >= 0 && nextRow < 6 && maze[nextRow][nextCol] === 0) {
            player.current.x = nextCol * 100 + 34;
            player.current.y = nextRow * 100 + 26;
            player.current.vx = 0;
            player.current.vy = 0;
            player.current.facing = direction[0] < 0 ? 'left' : direction[0] > 0 ? 'right' : player.current.facing;
            audio.playJumpSFX();
            if (nextCol === 8 && nextRow === 0) {
              const earlierMemoriesCollected = [1, 2, 3, 4].every(id => collectedEnvelopes.includes(id));
              if (earlierMemoriesCollected) {
                if (!collectedEnvelopes.includes(5)) collectEnvelope(5);
                setGameState('DANCE');
              } else {
                triggerDialogue('The royal letter is waiting here, but the prince must collect the first four memories before the reunion can begin.');
              }
            }
          }
        }
        if (['KeyE', 'Enter'].includes(e.code)) handleInteract();
        return;
      }

      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        if (!keys.current.jump && player.current.isGrounded) {
          player.current.vy = -12;
          player.current.isGrounded = false;
          audio.playJumpSFX();
        }
        keys.current.jump = true;
      }
      if (['KeyE', 'Enter'].includes(e.code)) handleInteract();
    };

    const handleKeyUp = (e) => {
      gridMoveHeld.current = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.current.right = false;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keys.current.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, currentLevel, collectedEnvelopes, isPaused]);

  const drawPrince = (ctx, x, y, facing, frame) => {
    ctx.save();
    ctx.translate(x + 16, y + 24);
    if (facing === 'left') ctx.scale(-1, 1);
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(-10, -10, 20, 24);
    ctx.fillStyle = "#be123c";
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(-16 + (frame * 2), 12);
    ctx.lineTo(-6, 14);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.fillRect(-7, -24, 14, 6);
    ctx.fillStyle = "#fed7aa";
    ctx.fillRect(-8, -18, 16, 10);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(2, -15, 3, 3);
    ctx.fillStyle = "#0f172a";
    const legOffset = Math.sin(frame * Math.PI / 2) * 4;
    ctx.fillRect(-8, 14, 6, 10 + legOffset);
    ctx.fillRect(2, 14, 6, 10 + legOffset);
    ctx.restore();
  };

  const drawPrincess = (ctx, x, y) => {
    ctx.save();
    ctx.translate(x + 15, y + 23);
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-14, 22);
    ctx.lineTo(14, 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(0, -14, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fed7aa";
    ctx.fillRect(-6, -16, 12, 10);
    ctx.fillStyle = "#831843";
    ctx.fillRect(-3, -13, 2, 3);
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * 900,
      y: Math.random() * 600,
      size: Math.random() * 2.5 + 1,
      speedY: Math.random() * 0.3 + 0.1,
      alpha: Math.random()
    }));

    const render = () => {
      const p = player.current;
      const lvl = levels[currentLevel];

      if (gameState === 'PLAYING' && currentLevel !== 2 && currentLevel !== 5 && !isPaused) {
        const speed = 4;
        if (keys.current.left) {
          p.vx = -speed;
          p.facing = 'left';
        } else if (keys.current.right) {
          p.vx = speed;
          p.facing = 'right';
        } else {
          p.vx = 0;
        }

        p.vy += 0.55;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = 0;
        if (p.x + p.width > 900) p.x = 900 - p.width;

        p.isGrounded = false;

        lvl.platforms.forEach(plat => {
          if (plat.moving) {
            plat.x += plat.dir * 1.2;
            if (plat.x > plat.initialX + plat.range || plat.x < plat.initialX) {
              plat.dir *= -1;
            }
          }

          if (p.x + p.width > plat.x &&
              p.x < plat.x + plat.w &&
              p.y + p.height >= plat.y &&
              p.y + p.height <= plat.y + plat.h + p.vy) {
            if (p.vy >= 0) {
              p.y = plat.y - p.height;
              p.vy = 0;
              p.isGrounded = true;
              if (plat.moving) p.x += plat.dir * 1.2;
            }
          }
        });

        if (p.y > 650) {
          p.x = 50;
          p.y = 350;
          p.vy = 0;
        }

        const isEnvelopeCollected = collectedEnvelopes.includes(currentLevel);
        const puzzleLocked = currentLevel === 3 && !crystals.current.every(c => c.active);

        if (lvl.envelope && !isEnvelopeCollected && !puzzleLocked) {
          const dist = Math.hypot((p.x + 16) - lvl.envelope.x, (p.y + 24) - lvl.envelope.y);
          if (dist < 35) {
            collectEnvelope(currentLevel);
          }
        }

        // Check portal transition constraint
        if (lvl.nextPortal) {
          const port = lvl.nextPortal;
          const touchingPortal = p.x + p.width > port.x && p.x < port.x + port.w && p.y + p.height > port.y;

          if (!touchingPortal) {
            portalLock.current = false;
          } else if (touchingPortal && !portalLock.current && currentLevel < 5) {
            portalLock.current = true;
            if (isEnvelopeCollected) {
              setCurrentLevel(prev => Math.min(5, prev + 1));
              p.x = 40;
              p.y = 400;
              p.vx = 0;
              p.vy = 0;
            } else {
              triggerDialogue("You must collect the memory letter before advancing through the portal!");
            }
          }
        }

        if (Math.abs(p.vx) > 0.1) {
          p.animTimer++;
          if (p.animTimer % 8 === 0) p.animFrame = (p.animFrame + 1) % 4;
        } else {
          p.animFrame = 0;
        }
      }

      // ---------- DRAWING ----------
      ctx.fillStyle = lvl.bgColor;
      ctx.fillRect(0, 0, 900, 600);

      ctx.fillStyle = "#ffffff";
      particles.forEach(pt => {
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        pt.y -= pt.speedY;
        if (pt.y < 0) pt.y = 600;
      });
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = "rgba(254, 243, 199, 0.15)";
      ctx.beginPath();
      ctx.arc(780, 100, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.font = "900 32px serif";
      ctx.textAlign = "center";
      ctx.fillText(lvl.name.toUpperCase(), 450, 80);
      ctx.textAlign = "left";

      if (currentLevel === 5) {
        const cell = 100;
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 9; col++) {
            const blocked = maze[row][col] === 1;
            ctx.fillStyle = blocked ? "#31204f" : "rgba(196, 181, 253, 0.08)";
            ctx.fillRect(col * cell + 2, row * cell + 2, cell - 4, cell - 4);
            ctx.strokeStyle = blocked ? "#a855f7" : "rgba(251, 191, 36, 0.25)";
            ctx.strokeRect(col * cell + 2, row * cell + 2, cell - 4, cell - 4);
          }
        }
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("START", 50, 575);
        ctx.fillText("LETTER + PRINCESS", 800, 25);
        ctx.textAlign = "left";
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(812, 38, 28, 20);
        ctx.strokeStyle = "#92400e";
        ctx.strokeRect(812, 38, 28, 20);
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.arc(850, 75, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      if (currentLevel !== 5) lvl.platforms.forEach(plat => {
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.fillStyle = "#a855f7";
        ctx.fillRect(plat.x, plat.y, plat.w, 4);
      });

      if (currentLevel === 3) {
        crystals.current.forEach(c => {
          ctx.fillStyle = c.active ? "#38bdf8" : "#475569";
          ctx.beginPath();
          ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#e0f2fe";
          ctx.stroke();
        });
      }

      if (currentLevel === 5) {
        ctx.fillStyle = "rgba(251, 191, 36, 0.25)";
        ctx.fillRect(800, 0, 100, 100);
        ctx.strokeStyle = "#fbbf24";
        ctx.strokeRect(800, 0, 100, 100);
      }

      if (lvl.nextPortal) {
        const canPass = collectedEnvelopes.includes(currentLevel);
        ctx.fillStyle = canPass ? "rgba(244, 114, 182, 0.3)" : "rgba(100, 116, 139, 0.2)";
        ctx.fillRect(lvl.nextPortal.x, lvl.nextPortal.y, lvl.nextPortal.w, lvl.nextPortal.h);
        ctx.strokeStyle = canPass ? "#f472b6" : "#64748b";
        ctx.strokeRect(lvl.nextPortal.x, lvl.nextPortal.y, lvl.nextPortal.w, lvl.nextPortal.h);
      }

      const isCollected = collectedEnvelopes.includes(currentLevel);
      const puzzleLockedDraw = currentLevel === 3 && !crystals.current.every(c => c.active);

      if (currentLevel !== 5 && lvl.envelope && !isCollected) {
        ctx.save();
        ctx.translate(lvl.envelope.x, lvl.envelope.y + Math.sin(Date.now() / 200) * 4);
        ctx.fillStyle = puzzleLockedDraw ? "rgba(148, 163, 184, 0.3)" : "rgba(251, 191, 36, 0.4)";
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = puzzleLockedDraw ? "#94a3b8" : "#fbbf24";
        ctx.fillRect(-12, -8, 24, 16);
        ctx.strokeStyle = "#78350f";
        ctx.strokeRect(-12, -8, 24, 16);
        ctx.beginPath();
        ctx.moveTo(-12, -8);
        ctx.lineTo(0, 1);
        ctx.lineTo(12, -8);
        ctx.stroke();
        ctx.restore();
      }

      if (currentLevel === 5) {
        drawPrincess(ctx, 830, 48);
      }

      drawPrince(ctx, p.x, p.y, p.facing, p.animFrame);

      if (gameState === 'DANCE') {
        if (p.x < princess.current.x - 45) {
          p.x += 1.5;
          p.animFrame = (p.animFrame + 1) % 4;
        } else if (!danceTransitionScheduled.current) {
          danceTransitionScheduled.current = true;
          setTimeout(() => {
            setGameState('REVEAL');
          }, 1000);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [gameState, currentLevel, collectedEnvelopes, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={600}
      className="w-full h-full object-contain block bg-slate-950"
    />
  );
}