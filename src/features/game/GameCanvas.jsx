import { useEffect, useRef, useContext } from 'react';
import { GameContext } from '../../shared/GameContext';
import { audio } from '../../services/audioService';

const PERSONAL_BACKGROUND_URL = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80";

export function GameCanvas() {
  const {
    gameState, setGameState, currentLevel, setCurrentLevel,
    collectedEnvelopes, collectEnvelope, triggerDialogue, isPaused
  } = useContext(GameContext);

  const canvasRef = useRef(null);
  const portalLock = useRef(false);
  const danceTransitionScheduled = useRef(false);
  const gridMoveHeld = useRef(false);

  // Background Image Ref
  const bgImageRef = useRef(null);
  const bgLoaded = useRef(false);

  // Confetti & Petals for the celebration
  const confettiList = useRef([]);

  useEffect(() => {
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = PERSONAL_BACKGROUND_URL;
    bgImg.onload = () => { bgLoaded.current = true; };
    bgImageRef.current = bgImg;
  }, []);

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

  const princess = useRef({ x: 780, y: 450, width: 30, height: 46 });

  // Level 3 Enchanted Garden Flowers (Sunflower, Rose, Tulip)
  const flowers = useRef([
    { x: 250, y: 380, active: false, name: "Sunflower", petalColor: "#fbbf24", centerColor: "#78350f" },
    { x: 450, y: 300, active: false, name: "Rose", petalColor: "#f43f5e", centerColor: "#fda4af" },
    { x: 650, y: 380, active: false, name: "Tulip", petalColor: "#ec4899", centerColor: "#fef08a" }
  ]);

  const levels = useRef({
    1: {
      name: "The Sunlit Garden Meadow",
      skyTop: "#38bdf8",
      skyBottom: "#fef08a",
      platforms: [{ x: 0, y: 520, w: 900, h: 80 }],
      envelope: null,
      nextPortal: null
    },
    2: {
      name: "The Sunflower Memories Quiz",
      skyTop: "#60a5fa",
      skyBottom: "#fef3c7",
      platforms: [{ x: 0, y: 520, w: 900, h: 80 }],
      envelope: null,
      nextPortal: null
    },
    3: {
      name: "The Blooming Flower Garden",
      skyTop: "#38bdf8",
      skyBottom: "#ecfdf5",
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
      name: "The Sunlit Petal & Rainbow Bridge",
      skyTop: "#0ea5e9",
      skyBottom: "#fef9c3",
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
      name: "The Royal Rose Garden Maze",
      skyTop: "#38bdf8",
      skyBottom: "#fed7aa",
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
    } else if (currentLevel === 1 || currentLevel === 2) {
      player.current.x = 40;
      player.current.y = 472;
      player.current.vx = 0;
      player.current.vy = 0;
    } else if (currentLevel === 3) {
      player.current.x = 40;
      player.current.y = 472;
      player.current.vx = 0;
      player.current.vy = 0;
      if (collectedEnvelopes.includes(3)) {
        flowers.current.forEach(f => { f.active = true; });
      }
    }
    if (gameState !== 'DANCE') danceTransitionScheduled.current = false;
  }, [currentLevel, gameState, collectedEnvelopes]);

  useEffect(() => {
    if (gameState === 'DANCE') {
      const colors = ['#f472b6', '#fbbf24', '#38bdf8', '#f43f5e', '#4ade80', '#fb923c', '#ffffff'];
      confettiList.current = Array.from({ length: 90 }, () => ({
        x: Math.random() * 900,
        y: Math.random() * -300,
        w: Math.random() * 10 + 5,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 2.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        isPetal: Math.random() > 0.4
      }));
    }
  }, [gameState]);

  const handleInteract = () => {
    if (currentLevel === 3) {
      let updatedAny = false;
      flowers.current.forEach(f => {
        const dist = Math.hypot((player.current.x + 16) - f.x, (player.current.y + 24) - f.y);
        if (dist < 60) {
          f.active = !f.active;
          updatedAny = true;
          audio.playTone(f.active ? 660 : 330, 'sine', 0.25, 0.12);
        }
      });

      if (updatedAny) {
        if (flowers.current.every(f => f.active)) {
          audio.playGateSFX();
          triggerDialogue("✨ All three magical garden flowers have bloomed in radiant colors! The love letter is unlocked!");
        }
        return;
      }

      // Check if interacting near envelope
      if (!collectedEnvelopes.includes(3) && levels[3].envelope) {
        const envDist = Math.hypot((player.current.x + 16) - levels[3].envelope.x, (player.current.y + 24) - levels[3].envelope.y);
        if (envDist < 60) {
          if (flowers.current.every(f => f.active)) {
            collectEnvelope(3);
          } else {
            const activeCount = flowers.current.filter(f => f.active).length;
            audio.playTone(220, 'sine', 0.2, 0.08);
            triggerDialogue(`This memory envelope is sealed by morning dew! Stand near all 3 garden flowers and press E to bloom them (${activeCount}/3 bloomed). 🌸`);
          }
        }
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'PLAYING' || isPaused || currentLevel === 1 || currentLevel === 2) return;
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
            if (direction[0] < 0) {
              player.current.facing = 'left';
            } else if (direction[0] > 0) {
              player.current.facing = 'right';
            }
            audio.playJumpSFX();
            if (nextCol === 8 && nextRow === 0) {
              const earlierMemoriesCollected = [1, 2, 3, 4].every(id => collectedEnvelopes.includes(id));
              if (earlierMemoriesCollected) {
                if (!collectedEnvelopes.includes(5)) collectEnvelope(5);
                player.current.x = 100;
                player.current.y = 450;
                setGameState('DANCE');
              } else {
                triggerDialogue('The Princess is waiting at the sunlit rose pavilion, but the prince must gather the first four garden letters first! 🌸');
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

  const handleCanvasClick = (e) => {
    if (gameState !== 'PLAYING' || isPaused) return;
    if (currentLevel === 3) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = 900 / rect.width;
      const scaleY = 600 / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // Click on or near flower
      flowers.current.forEach(f => {
        const clickDist = Math.hypot(clickX - f.x, clickY - f.y);
        const playerDist = Math.hypot((player.current.x + 16) - f.x, (player.current.y + 24) - f.y);
        if (clickDist < 45 && playerDist < 95) {
          f.active = !f.active;
          audio.playTone(f.active ? 660 : 330, 'sine', 0.25, 0.12);
          if (flowers.current.every(fl => fl.active)) {
            audio.playGateSFX();
            triggerDialogue("✨ All three magical garden flowers have bloomed in radiant colors! The love letter is unlocked!");
          }
        }
      });

      // Click on or near envelope
      if (levels[3].envelope && !collectedEnvelopes.includes(3)) {
        const envClickDist = Math.hypot(clickX - levels[3].envelope.x, clickY - levels[3].envelope.y);
        const envPlayerDist = Math.hypot((player.current.x + 16) - levels[3].envelope.x, (player.current.y + 24) - levels[3].envelope.y);
        if (envClickDist < 45 && envPlayerDist < 95) {
          if (flowers.current.every(f => f.active)) {
            collectEnvelope(3);
          } else {
            const activeCount = flowers.current.filter(f => f.active).length;
            audio.playTone(220, 'sine', 0.2, 0.08);
            triggerDialogue(`This memory envelope is sealed! Stand near all 3 garden flowers and bloom them (${activeCount}/3 bloomed). 🌸`);
          }
        }
      }
    }
  };

  const drawPrince = (ctx, x, y, facing, frame, bounceY = 0) => {
    ctx.save();
    ctx.translate(x + 16, y + 24 + bounceY);
    if (facing === 'left') ctx.scale(-1, 1);

    // Cape (warm royal rose-gold)
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(-16 + (frame * 2), 12);
    ctx.lineTo(-6, 14);
    ctx.fill();

    // Body (royal blue tunic with gold trim)
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(-10, -10, 20, 24);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(-10, 2, 20, 3); // Gold belt

    // Crown (golden flower crown)
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(-7, -24, 14, 6);
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(0, -24, 3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#fed7aa";
    ctx.fillRect(-8, -18, 16, 10);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(2, -15, 3, 3);

    // Legs
    ctx.fillStyle = "#0f172a";
    const legOffset = Math.sin(frame * Math.PI / 2) * 4;
    ctx.fillRect(-8, 14, 6, 10 + legOffset);
    ctx.fillRect(2, 14, 6, 10 + legOffset);

    ctx.restore();
  };

  const drawPrincess = (ctx, x, y, bounceY = 0) => {
    ctx.save();
    ctx.translate(x + 15, y + 23 + bounceY);

    // Dress (flowing rose-pink blossom gown)
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-15, 22);
    ctx.lineTo(15, 22);
    ctx.closePath();
    ctx.fill();

    // Floral lace trim
    ctx.fillStyle = "#fbcfe8";
    ctx.beginPath();
    ctx.arc(-8, 22, 4, 0, Math.PI);
    ctx.arc(0, 22, 4, 0, Math.PI);
    ctx.arc(8, 22, 4, 0, Math.PI);
    ctx.fill();

    // Golden Hair
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(0, -14, 11, 0, Math.PI * 2);
    ctx.fill();

    // Flower Garland in Hair
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
    ctx.arc(0, -22, 3, 0, Math.PI * 2);
    ctx.arc(5, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = "#fed7aa";
    ctx.fillRect(-6, -16, 12, 10);
    ctx.fillStyle = "#831843";
    ctx.fillRect(-3, -13, 2, 3);

    ctx.restore();
  };

  const drawPersonalizedBackground = (ctx) => {
    if (bgLoaded.current && bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, 900, 600);
      ctx.fillStyle = "rgba(254, 240, 138, 0.15)";
      ctx.fillRect(0, 0, 900, 600);
    } else {
      // Warm sunlit garden backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, 600);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.6, '#fef08a');
      grad.addColorStop(1, '#22c55e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 900, 600);
    }

    // Lush garden grass floor
    ctx.fillStyle = "#15803d";
    ctx.fillRect(0, 500, 900, 100);

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(0, 496, 900, 8);

    // Wildflowers on grass
    const flowerCols = ['#f43f5e', '#fbbf24', '#ffffff', '#ec4899', '#38bdf8'];
    for (let i = 20; i < 900; i += 35) {
      ctx.fillStyle = flowerCols[(i * 7) % flowerCols.length];
      ctx.beginPath();
      ctx.arc(i, 498, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Draw radiant golden sun with warm rays
  const drawSun = (ctx, x, y, time) => {
    ctx.save();
    ctx.translate(x, y);

    // Sunrays
    ctx.save();
    ctx.rotate((time / 1000) * 0.15);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-18, 110);
      ctx.lineTo(18, 110);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Outer warm halo
    ctx.fillStyle = 'rgba(254, 240, 138, 0.38)';
    ctx.beginPath();
    ctx.arc(0, 0, 62 + Math.sin(time / 200) * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core golden sun
    ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();

    // Little sparkles around sun
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(12, -12, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Draw soft drifting white clouds
  const drawCloud = (ctx, cx, cy, scale) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.arc(24, -6, 20, 0, Math.PI * 2);
    ctx.arc(-22, -3, 18, 0, Math.PI * 2);
    ctx.arc(42, 5, 16, 0, Math.PI * 2);
    ctx.arc(-38, 6, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Draw rich garden earth platform topped with thick grass & blooming wildflowers
  const drawGardenPlatform = (ctx, plat) => {
    // Rich fertile soil
    ctx.fillStyle = "#78350f";
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

    // Soil texture / pebble specks
    ctx.fillStyle = "rgba(120, 53, 15, 0.5)";
    ctx.fillRect(plat.x, plat.y + 12, plat.w, plat.h - 12);

    // Thick vibrant green lawn grass
    ctx.fillStyle = "#15803d";
    ctx.fillRect(plat.x, plat.y, plat.w, 8);
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(plat.x, plat.y, plat.w, 5);

    // Blooming wildflowers sprouting along the platform grass
    const step = 28;
    const colors = ['#f43f5e', '#fbbf24', '#ffffff', '#ec4899', '#38bdf8'];
    for (let fx = plat.x + 8; fx < plat.x + plat.w - 6; fx += step) {
      const col = colors[Math.floor((fx * 13) % colors.length)];
      // Small green leaf
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(fx - 2, plat.y - 1, 3, 1.5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Flower blossom
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(fx, plat.y - 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(fx, plat.y - 3, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // Drifting flower petals & gentle butterflies
    const petals = Array.from({ length: 35 }, () => {
      const colors = ['#f472b6', '#fb7185', '#fbbf24', '#ffffff', '#f43f5e', '#c084fc'];
      return {
        x: Math.random() * 900,
        y: Math.random() * 600,
        size: Math.random() * 5 + 4,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: Math.random() * 0.5 - 0.25,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAmp: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2
      };
    });

    // 4 playful fluttering butterflies
    const butterflies = [
      { x: 120, y: 220, vx: 0.8, vy: 0.3, color: '#f472b6', flap: 0 },
      { x: 380, y: 160, vx: -0.6, vy: 0.4, color: '#38bdf8', flap: 1 },
      { x: 620, y: 260, vx: 0.7, vy: -0.3, color: '#fbbf24', flap: 2 },
      { x: 800, y: 190, vx: -0.5, vy: -0.4, color: '#c084fc', flap: 3 }
    ];

    const render = () => {
      const now = Date.now();
      const p = player.current;
      const lvl = levels[currentLevel];

      if (gameState === 'PLAYING' && currentLevel !== 1 && currentLevel !== 2 && currentLevel !== 5 && !isPaused) {
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
        const isLevel3Unlocked = currentLevel !== 3 || flowers.current.every(f => f.active);

        if (lvl.envelope && !isEnvelopeCollected && isLevel3Unlocked) {
          const dist = Math.hypot((p.x + 16) - lvl.envelope.x, (p.y + 24) - lvl.envelope.y);
          if (dist < 45) {
            collectEnvelope(currentLevel);
          }
        }

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
              triggerDialogue("You must collect the garden memory letter before moving to the next petal path! 🌸");
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

      // 1. Radiant Sunny Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 520);
      skyGrad.addColorStop(0, lvl.skyTop || '#38bdf8');
      skyGrad.addColorStop(1, lvl.skyBottom || '#fef08a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 900, 600);

      // 2. Radiant Golden Sun
      drawSun(ctx, 770, 90, now);

      // 3. Drifting Fluffy White Clouds
      const cloudTime = now / 40;
      drawCloud(ctx, (cloudTime * 0.4 + 60) % 1050 - 100, 75, 1.0);
      drawCloud(ctx, (cloudTime * 0.25 + 350) % 1050 - 100, 120, 0.75);
      drawCloud(ctx, (cloudTime * 0.35 + 720) % 1050 - 100, 65, 0.9);

      // 4. Distant Rolling Green Garden Hills
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(150, 650, 320, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(520, 680, 360, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(820, 690, 310, 0, Math.PI * 2);
      ctx.fill();

      // 5. Level Name Banner (Crisp Garden Banner)
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "900 28px serif";
      ctx.textAlign = "center";
      ctx.fillText(lvl.name.toUpperCase(), 450, 75);
      ctx.textAlign = "left";

      // 6. Floating Flower Petals
      petals.forEach(pt => {
        pt.phase += pt.swaySpeed;
        pt.y += pt.speedY;
        pt.x += pt.speedX + Math.sin(pt.phase) * pt.swayAmp;
        pt.rot += pt.rotSpeed;

        if (pt.y > 600) {
          pt.y = -20;
          pt.x = Math.random() * 900;
        }

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size, pt.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 7. Fluttering Butterflies
      butterflies.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.flap += 0.25;

        if (b.x < 30 || b.x > 870) b.vx *= -1;
        if (b.y < 100 || b.y > 380) b.vy *= -1;

        ctx.save();
        ctx.translate(b.x, b.y);
        if (b.vx < 0) ctx.scale(-1, 1);
        const wingScale = Math.sin(b.flap);

        ctx.fillStyle = b.color;
        // Upper wing
        ctx.beginPath();
        ctx.ellipse(3, -5, 8 * Math.abs(wingScale), 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // Lower wing
        ctx.beginPath();
        ctx.ellipse(3, 4, 6 * Math.abs(wingScale), 3.5, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Butterfly body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-1, -7, 2, 14);
        ctx.restore();
      });

      // 8. Level 5: The Royal Rose Garden Hedge Maze
      if (currentLevel === 5 && gameState === 'PLAYING') {
        const cell = 100;
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 9; col++) {
            const blocked = maze[row][col] === 1;
            const cx = col * cell + 2;
            const cy = row * cell + 2;
            const cw = cell - 4;
            const ch = cell - 4;

            if (blocked) {
              // Lush Green Rose Hedge
              ctx.fillStyle = "#15803d";
              ctx.fillRect(cx, cy, cw, ch);
              ctx.strokeStyle = "#166534";
              ctx.lineWidth = 3;
              ctx.strokeRect(cx, cy, cw, ch);

              // Roses blooming on the hedge
              const roseX = [cx + 25, cx + 70, cx + 45];
              const roseY = [cy + 25, cy + 35, cy + 70];
              const roseCols = ['#f43f5e', '#fb7185', '#e11d48'];
              roseX.forEach((rx, ri) => {
                ctx.fillStyle = roseCols[ri];
                ctx.beginPath();
                ctx.arc(rx, roseY[ri], 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fbcfe8';
                ctx.beginPath();
                ctx.arc(rx - 2, roseY[ri] - 2, 3, 0, Math.PI * 2);
                ctx.fill();
              });
            } else {
              // Sunny Cobblestone Garden Path
              ctx.fillStyle = "rgba(254, 243, 199, 0.65)";
              ctx.fillRect(cx, cy, cw, ch);
              ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
              ctx.lineWidth = 1;
              ctx.strokeRect(cx, cy, cw, ch);
            }
          }
        }

        // Start Banner
        ctx.fillStyle = "#b45309";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("START 🌸", 50, 575);

        // Destination Pavilion Banner
        ctx.fillText("FLOWER PAVILION 👑", 800, 25);
        ctx.textAlign = "left";

        // Love Letter at Pavilion
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(812, 38, 28, 20);
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2;
        ctx.strokeRect(812, 38, 28, 20);
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.arc(826, 48, 4, 0, Math.PI * 2);
        ctx.fill();

        // Princess waiting at Rose Pavilion
        drawPrincess(ctx, 830, 48);
      }

      // Dance Scene
      if (gameState === 'DANCE') {
        drawPersonalizedBackground(ctx);
      }

      // Platforms (Lush Garden Earth & Grass)
      if (currentLevel !== 5) {
        lvl.platforms.forEach(plat => {
          drawGardenPlatform(ctx, plat);
        });
      }

      // Level 3 Enchanted Blooming Flowers
      if (currentLevel === 3) {
        flowers.current.forEach(f => {
          const dist = Math.hypot((p.x + 16) - f.x, (p.y + 24) - f.y);
          const isNear = dist < 60;

          ctx.save();
          ctx.translate(f.x, f.y);

          // Green plant stem
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, 18);
          ctx.quadraticCurveTo(f.active ? -6 : 6, 8, 0, 0);
          ctx.stroke();

          // Green leaves
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.ellipse(-8, 10, 7, 3, -0.4, 0, Math.PI * 2);
          ctx.ellipse(8, 12, 7, 3, 0.4, 0, Math.PI * 2);
          ctx.fill();

          if (f.active) {
            // Blooming state: Glowing floral aura
            ctx.fillStyle = "rgba(254, 240, 138, 0.45)";
            ctx.beginPath();
            ctx.arc(0, 0, 22 + Math.sin(now / 150) * 4, 0, Math.PI * 2);
            ctx.fill();

            // Flower Petals
            ctx.fillStyle = f.petalColor;
            for (let petal = 0; petal < 8; petal++) {
              const angle = (petal * Math.PI) / 4;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * 12, Math.sin(angle) * 12, 7, 0, Math.PI * 2);
              ctx.fill();
            }

            // Flower Center
            ctx.fillStyle = f.centerColor;
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();

            // Sparkle pollen
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(Math.sin(now / 180) * 6, -14 - Math.abs(Math.sin(now / 200) * 8), 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Unbloomed bud state
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.arc(0, 4, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = f.petalColor;
            ctx.beginPath();
            ctx.arc(0, -2, 6, 0, Math.PI * 2);
            ctx.fill();
          }

          // Floating helper label when nearby
          if (isNear && !f.active) {
            ctx.fillStyle = "#92400e";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Press E to Bloom 🌸", 0, -26);
          } else if (isNear && f.active) {
            ctx.fillStyle = "#15803d";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Bloomed! ✨", 0, -26);
          }

          ctx.restore();
        });
      }

      // Garden Flower Arch / Portal
      if (lvl.nextPortal) {
        const canPass = collectedEnvelopes.includes(currentLevel);
        const port = lvl.nextPortal;

        ctx.save();
        ctx.translate(port.x, port.y);

        // Floral arch frame
        ctx.fillStyle = canPass ? "rgba(244, 114, 182, 0.35)" : "rgba(251, 191, 36, 0.2)";
        ctx.fillRect(0, 0, port.w, port.h);
        ctx.strokeStyle = canPass ? "#f43f5e" : "#d97706";
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, port.w, port.h);

        // Roses on portal top
        ctx.fillStyle = canPass ? "#f43f5e" : "#fbbf24";
        ctx.beginPath();
        ctx.arc(port.w / 2, -6, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(canPass ? "PORTAL 🌸" : "LOCKED", port.w / 2, -14);

        ctx.restore();
      }

      const isCollected = collectedEnvelopes.includes(currentLevel);
      const allFlowersActive = currentLevel !== 3 || flowers.current.every(f => f.active);
      const puzzleLockedDraw = currentLevel === 3 && !allFlowersActive;

      // Sealed / Blooming Love Letter Envelope
      if (currentLevel !== 5 && lvl.envelope && !isCollected) {
        ctx.save();
        ctx.translate(lvl.envelope.x, lvl.envelope.y + Math.sin(now / 200) * 4);

        // Soft halo
        ctx.fillStyle = puzzleLockedDraw ? "rgba(203, 213, 225, 0.5)" : "rgba(254, 240, 138, 0.6)";
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // Envelope Body
        ctx.fillStyle = puzzleLockedDraw ? "#e2e8f0" : "#fef08a";
        ctx.fillRect(-14, -10, 28, 20);
        ctx.strokeStyle = puzzleLockedDraw ? "#94a3b8" : "#d97706";
        ctx.lineWidth = 2;
        ctx.strokeRect(-14, -10, 28, 20);

        // Flap
        ctx.beginPath();
        ctx.moveTo(-14, -10);
        ctx.lineTo(0, 2);
        ctx.lineTo(14, -10);
        ctx.stroke();

        // Flower seal in center
        ctx.fillStyle = puzzleLockedDraw ? "#94a3b8" : "#f43f5e";
        ctx.beginPath();
        ctx.arc(0, 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label above envelope in Level 3
        if (currentLevel === 3) {
          ctx.textAlign = "center";
          if (puzzleLockedDraw) {
            const activeCount = flowers.current.filter(f => f.active).length;
            ctx.fillStyle = "#78350f";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(`🔒 Bloom Flowers (${activeCount}/3)`, 0, -22);
          } else {
            ctx.fillStyle = "#be185d";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText("🌸 Letter Unlocked!", 0, -22);
          }
        }

        ctx.restore();
      }

      if (gameState !== 'DANCE') {
        drawPrince(ctx, p.x, p.y, p.facing, p.animFrame);
      }

      // Joyful Garden Reunion Dance Scene
      if (gameState === 'DANCE') {
        const targetX = princess.current.x - 45;

        if (p.x < targetX) {
          p.x += 2.5;
          p.facing = 'right';
          p.animFrame = (p.animFrame + 1) % 4;
          drawPrince(ctx, p.x, 450, p.facing, p.animFrame);
          drawPrincess(ctx, princess.current.x, 450);
        } else {
          const bounceY = Math.abs(Math.sin(now / 150)) * -12;
          const princeBounce = Math.abs(Math.cos(now / 150)) * -12;

          drawPrince(ctx, p.x, 450, 'right', 1, princeBounce);
          drawPrincess(ctx, princess.current.x, 450, bounceY);

          // Glowing Hearts
          ctx.fillStyle = "#f43f5e";
          ctx.font = "24px sans-serif";
          ctx.fillText("♥", p.x + 20, 415 + Math.sin(now / 200) * 8);
          ctx.fillStyle = "#fbbf24";
          ctx.font = "18px sans-serif";
          ctx.fillText("🌸", p.x + 36, 400 + Math.cos(now / 200) * 6);

          if (!danceTransitionScheduled.current) {
            danceTransitionScheduled.current = true;
            setTimeout(() => {
              setGameState('REVEAL');
            }, 3000);
          }
        }

        // Celebration Petals & Floral Confetti Shower
        confettiList.current.forEach(c => {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rot);
          ctx.fillStyle = c.color;
          if (c.isPetal) {
            ctx.beginPath();
            ctx.ellipse(0, 0, c.w, c.h, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          }
          ctx.restore();

          c.y += c.speedY;
          c.x += c.speedX;
          c.rot += c.rotSpeed;

          if (c.y > 600) {
            c.y = -20;
            c.x = Math.random() * 900;
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [gameState, currentLevel, collectedEnvelopes, isPaused]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        onClick={handleCanvasClick}
        className="w-full h-full block"
      />
    </div>
  );
}
