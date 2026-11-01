import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { GameContext } from '../../shared/GameContext';
import { audio } from '../../services/audioService';

const GARDEN_IMAGE_URL = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80";

// Procedural sunlit flower garden artwork
function createProceduralFallbackCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Bright sunny sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 420);
  skyGrad.addColorStop(0, '#38bdf8');
  skyGrad.addColorStop(0.55, '#bae6fd');
  skyGrad.addColorStop(1, '#fef08a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 600, 600);

  // Radiant Glowing Sun
  const sunX = 490, sunY = 110;
  // Sunbeams
  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-24, 180);
    ctx.lineTo(24, 180);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Sun outer glow
  ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 56, 0, Math.PI * 2);
  ctx.fill();

  // Sun core
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
  ctx.fill();

  // Cute fluffy white clouds
  const drawCloud = (cx, cy, scale) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.arc(28, -8, 26, 0, Math.PI * 2);
    ctx.arc(-26, -4, 22, 0, Math.PI * 2);
    ctx.arc(50, 6, 20, 0, Math.PI * 2);
    ctx.arc(-46, 8, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawCloud(130, 90, 1.1);
  drawCloud(340, 130, 0.85);

  // Distant rolling green hills
  ctx.fillStyle = '#86efac';
  ctx.beginPath();
  ctx.arc(140, 560, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.arc(460, 580, 290, 0, Math.PI * 2);
  ctx.fill();

  // Main lush flower meadow
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(290, 640, 350, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#16a34a';
  ctx.fillRect(0, 480, 600, 120);

  // Garden flower arbor / arch in center
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(300, 330, 85, Math.PI, 0);
  ctx.lineTo(385, 490);
  ctx.moveTo(215, 330);
  ctx.lineTo(215, 490);
  ctx.stroke();

  // Rose vines on the arch
  const vineColors = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48'];
  for (let i = 0; i < 28; i++) {
    const angle = Math.PI + (i / 28) * Math.PI;
    const vx = 300 + Math.cos(angle) * 85;
    const vy = 330 + Math.sin(angle) * 85;
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(vx + 4, vy - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = vineColors[i % vineColors.length];
    ctx.beginPath();
    ctx.arc(vx, vy, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blooming garden flowers in the foreground
  const flowerX = [40, 85, 130, 175, 230, 280, 330, 380, 425, 475, 520, 565, 70, 150, 220, 370, 450, 530];
  const flowerY = [470, 450, 465, 455, 475, 480, 475, 460, 450, 465, 455, 470, 520, 515, 530, 525, 515, 520];
  const petalCol = ['#fbbf24', '#f43f5e', '#ec4899', '#a855f7', '#ffffff', '#fb923c'];

  flowerX.forEach((fx, idx) => {
    const fy = flowerY[idx];
    const col = petalCol[idx % petalCol.length];

    // Flower stem
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 22);
    ctx.lineTo(fx, fy);
    ctx.stroke();

    // Petals
    ctx.fillStyle = col;
    for (let p = 0; p < 6; p++) {
      const pa = (p * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(pa) * 8, fy + Math.sin(pa) * 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = col === '#fbbf24' ? '#78350f' : '#fef08a';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Fluttering butterflies
  const drawButterfly = (bx, by, bColor) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.fillStyle = bColor;
    ctx.beginPath();
    ctx.ellipse(-7, -4, 7, 5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(7, -4, 7, 5, 0.3, 0, Math.PI * 2);
    ctx.ellipse(-5, 4, 5, 3.5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(5, 4, 5, 3.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-1, -7, 2, 14);
    ctx.restore();
  };

  drawButterfly(190, 240, '#f472b6');
  drawButterfly(420, 210, '#38bdf8');
  drawButterfly(290, 170, '#fbbf24');

  // Floating heart banner in the arch
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(190, 360, 220, 65, 16);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Romantic banner text
  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Ray of Love ☀️ 🌸', 300, 390);

  ctx.fillStyle = '#be185d';
  ctx.font = 'italic 14px serif';
  ctx.fillText('In Our Sunlit Garden of Love 💕', 300, 412);

  return canvas;
}

export function Level1Puzzle({ imageUrl = GARDEN_IMAGE_URL }) {
  const {
    collectedEnvelopes,
    collectEnvelope,
    setCurrentLevel,
    triggerDialogue
  } = useContext(GameContext);

  const canvasRef = useRef(null);
  const solvedCanvasRef = useRef(null);
  const imgRef = useRef(null);

  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isSolved, setIsSolved] = useState(() => collectedEnvelopes.includes(1));
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  const GRID_SIZE = 4; // 4x4 = 16 pieces
  const BOARD_SIZE = 320; // 320x320 px
  const PIECE_SIZE = BOARD_SIZE / GRID_SIZE;

  // Initialize puzzle pieces with a shuffled layout
  const initPuzzle = useCallback(() => {
    const total = GRID_SIZE * GRID_SIZE;
    const initialPositions = Array.from({ length: total }, (_, i) => i);

    // Shuffle tile positions using Fisher-Yates
    for (let i = initialPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialPositions[i], initialPositions[j]] = [initialPositions[j], initialPositions[i]];
    }

    // Ensure it is not accidentally already solved
    if (initialPositions.every((pos, i) => pos === i)) {
      [initialPositions[0], initialPositions[1]] = [initialPositions[1], initialPositions[0]];
    }

    const newPieces = Array.from({ length: total }, (_, i) => ({
      correctIndex: i,
      currentIndex: initialPositions[i]
    }));

    setPieces(newPieces);
    setSelectedPiece(null);
  }, [GRID_SIZE]);

  // Load the puzzle image (with network timeout & procedural fallback)
  useEffect(() => {
    let active = true;
    const fallbackCanvas = createProceduralFallbackCanvas();

    const img = new Image();
    img.crossOrigin = "anonymous";

    const timeout = setTimeout(() => {
      if (active && !imgRef.current) {
        imgRef.current = fallbackCanvas;
        setImgLoaded(true);
        initPuzzle();
      }
    }, 2500);

    img.onload = () => {
      if (!active) return;
      clearTimeout(timeout);
      imgRef.current = img;
      setImgLoaded(true);
      initPuzzle();
    };

    img.onerror = () => {
      if (!active) return;
      clearTimeout(timeout);
      imgRef.current = fallbackCanvas;
      setImgLoaded(true);
      initPuzzle();
    };

    img.src = imageUrl;

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [imageUrl, initPuzzle]);

  // Render puzzle board
  useEffect(() => {
    if (!imgLoaded || pieces.length === 0 || isSolved) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    pieces.forEach((piece) => {
      const correctRow = Math.floor(piece.correctIndex / GRID_SIZE);
      const correctCol = piece.correctIndex % GRID_SIZE;

      const currentPosition = piece.currentIndex;
      const currentGridRow = Math.floor(currentPosition / GRID_SIZE);
      const currentGridCol = currentPosition % GRID_SIZE;

      const destX = currentGridCol * PIECE_SIZE;
      const destY = currentGridRow * PIECE_SIZE;

      ctx.save();
      ctx.beginPath();
      ctx.rect(destX, destY, PIECE_SIZE, PIECE_SIZE);
      ctx.clip();

      // Draw piece portion from source image
      const srcW = imgRef.current.width / GRID_SIZE;
      const srcH = imgRef.current.height / GRID_SIZE;
      ctx.drawImage(
        imgRef.current,
        correctCol * srcW,
        correctRow * srcH,
        srcW,
        srcH,
        destX,
        destY,
        PIECE_SIZE,
        PIECE_SIZE
      );

      // Subtle jigsaw piece border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(destX, destY, PIECE_SIZE, PIECE_SIZE);

      // Flower indicator if this piece is in its correct place
      if (piece.correctIndex === piece.currentIndex) {
        ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
        ctx.beginPath();
        ctx.arc(destX + PIECE_SIZE - 8, destY + PIECE_SIZE - 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(destX + PIECE_SIZE - 8, destY + PIECE_SIZE - 8, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Numbers guide if enabled
      if (showNumbers) {
        ctx.fillStyle = "rgba(254, 240, 138, 0.9)";
        ctx.fillRect(destX + 3, destY + 3, 20, 16);
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 1;
        ctx.strokeRect(destX + 3, destY + 3, 20, 16);
        ctx.fillStyle = "#78350f";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(piece.correctIndex + 1), destX + 13, destY + 11);
      }

      // Selected piece highlight (warm sunny glow)
      if (selectedPiece === piece.currentIndex) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.35)";
        ctx.fillRect(destX, destY, PIECE_SIZE, PIECE_SIZE);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(destX, destY, PIECE_SIZE, PIECE_SIZE);
      }

      ctx.restore();
    });
  }, [pieces, selectedPiece, imgLoaded, isSolved, showNumbers, PIECE_SIZE, GRID_SIZE]);

  // Render completed image on solved canvas
  useEffect(() => {
    if (!isSolved || !imgLoaded || !imgRef.current) return;
    const canvas = solvedCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
  }, [isSolved, imgLoaded]);

  // Handle clicking or tapping tiles to swap
  const handleCanvasClick = (e) => {
    if (isSolved || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedCol = Math.floor((x / rect.width) * GRID_SIZE);
    const clickedRow = Math.floor((y / rect.height) * GRID_SIZE);
    const clickedIndex = clickedRow * GRID_SIZE + clickedCol;

    if (clickedIndex < 0 || clickedIndex >= GRID_SIZE * GRID_SIZE) return;

    if (selectedPiece === null) {
      setSelectedPiece(clickedIndex);
      audio.playTone(440, 'sine', 0.08, 0.05);
    } else if (selectedPiece === clickedIndex) {
      // Deselect if clicking the same piece
      setSelectedPiece(null);
    } else {
      // Swap selected piece and clicked piece
      const updatedPieces = pieces.map((p) => {
        if (p.currentIndex === selectedPiece) return { ...p, currentIndex: clickedIndex };
        if (p.currentIndex === clickedIndex) return { ...p, currentIndex: selectedPiece };
        return p;
      });

      setPieces(updatedPieces);
      setSelectedPiece(null);
      audio.playTone(520, 'sine', 0.1, 0.06);

      // Check win condition
      const checkSolved = updatedPieces.every((p) => p.correctIndex === p.currentIndex);
      if (checkSolved) {
        setIsSolved(true);
        audio.playGateSFX();
        if (!collectedEnvelopes.includes(1)) {
          collectEnvelope(1);
        }
      }
    }
  };

  // Instant solve helper
  const handleAutoSolve = () => {
    const solvedPieces = pieces.map((p) => ({ ...p, currentIndex: p.correctIndex }));
    setPieces(solvedPieces);
    setSelectedPiece(null);
    setIsSolved(true);
    audio.playGateSFX();
    if (!collectedEnvelopes.includes(1)) {
      collectEnvelope(1);
    }
  };

  const continueToLevelTwo = () => {
    setCurrentLevel(2);
    triggerDialogue("The first garden letter is yours! Now, let's see how well you remember our story in the Sunflower Quiz! 🌻✨");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-amber-950/25 backdrop-blur-sm p-4 pt-16 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border-2 border-amber-300/90 bg-[#fffef9]/95 backdrop-blur-md p-5 md:p-7 text-center shadow-2xl my-auto text-amber-950">
        <div className="mb-2 text-3xl">🌻 ☀️ 🌸</div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">Level 1 · The Sunlit Garden Meadow</p>

        {isSolved ? (
          <>
            <h2 className="mt-3 text-2xl md:text-3xl font-serif font-bold text-amber-900">Letter No. 1 Unlocked! 🌸</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-800">
              Wonderful! The garden memory puzzle is restored, and the first love letter blooms for you! 💗
            </p>

            {/* Restored Memory Artwork */}
            <div className="my-4 mx-auto w-[240px] h-[240px] rounded-2xl overflow-hidden border-4 border-amber-300 shadow-xl bg-amber-50">
              <canvas
                ref={solvedCanvasRef}
                width={240}
                height={240}
                className="w-full h-full object-cover block"
              />
            </div>

            <div className="my-3 rounded-2xl border border-amber-300/80 bg-amber-100/60 p-3 text-3xl">
              ✉️ 🌸 👑
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-5">
              <button
                onClick={() => {
                  setIsSolved(false);
                  initPuzzle();
                }}
                className="w-full sm:w-1/3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition shadow-sm"
              >
                Replay Puzzle
              </button>
              <button
                onClick={continueToLevelTwo}
                className="w-full sm:w-2/3 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:brightness-105 px-5 py-3 font-bold text-white transition shadow-lg shadow-pink-500/25"
              >
                Continue to Level 2 <span aria-hidden="true">→</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-xl md:text-2xl font-serif font-bold text-amber-900">Sunlit Garden Memory Puzzle</h2>
            <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
              Click or tap any piece to select it, then tap another piece to swap them and bloom the garden picture!
            </p>

            {/* Puzzle Canvas */}
            <div className="my-3 flex justify-center">
              <div className="relative border-4 border-amber-400 rounded-2xl overflow-hidden shadow-xl bg-amber-50">
                <canvas
                  ref={canvasRef}
                  width={BOARD_SIZE}
                  height={BOARD_SIZE}
                  onClick={handleCanvasClick}
                  className="cursor-pointer block touch-none"
                />
              </div>
            </div>

            {/* Tools & Toggles */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1.5 rounded-lg border font-medium transition shadow-sm ${
                  showPreview
                    ? 'border-pink-400 bg-pink-100 text-pink-900'
                    : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {showPreview ? "👁️ Hide Preview" : "👁️ Preview Target"}
              </button>

              <button
                type="button"
                onClick={() => setShowNumbers(!showNumbers)}
                className={`px-3 py-1.5 rounded-lg border font-medium transition shadow-sm ${
                  showNumbers
                    ? 'border-amber-400 bg-amber-200 text-amber-900 font-bold'
                    : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {showNumbers ? "🔢 Hide Numbers" : "🔢 Number Hints"}
              </button>

              <button
                type="button"
                onClick={initPuzzle}
                className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium transition shadow-sm"
              >
                🔀 Reshuffle
              </button>

              <button
                type="button"
                onClick={handleAutoSolve}
                className="px-3 py-1.5 rounded-lg border border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100 font-medium transition shadow-sm"
              >
                ✨ Auto-Solve
              </button>
            </div>

            {/* Preview Reference Modal / Card */}
            {showPreview && imgRef.current && (
              <div className="mt-3 p-3 bg-amber-50/95 rounded-xl border border-amber-300 flex flex-col items-center animate-fade-in shadow-sm">
                <p className="text-[11px] font-semibold text-amber-900 mb-2">🌸 Target Flower Garden:</p>
                <div className="w-36 h-36 rounded-lg overflow-hidden border-2 border-amber-400 shadow">
                  <img
                    src={imgRef.current.src || imgRef.current.toDataURL?.()}
                    alt="Target preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
