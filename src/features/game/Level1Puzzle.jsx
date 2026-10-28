import React, { useState, useEffect, useRef } from 'react';

const RANDOM_IMAGE_URL = "https://picsum.photos/seed/romantic-couple/600/600";

export function Level1Puzzle({ onSolve, onClose, imageUrl = RANDOM_IMAGE_URL }) {
  const canvasRef = useRef(null);
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const imgRef = useRef(null);
  const GRID_SIZE = 4; // 4x4 = 16 jigsaw pieces
  const BOARD_SIZE = 320; // Canvas dimensions (320x320 px)
  const PIECE_SIZE = BOARD_SIZE / GRID_SIZE;

  // Preload puzzle image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      initPuzzle();
    };
  }, [imageUrl]);

  // Generate puzzle pieces with random position order
  const initPuzzle = () => {
    const total = GRID_SIZE * GRID_SIZE;
    const initialPositions = Array.from({ length: total }, (_, i) => i);

    // Shuffle tile current positions
    for (let i = initialPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialPositions[i], initialPositions[j]] = [initialPositions[j], initialPositions[i]];
    }

    const newPieces = Array.from({ length: total }, (_, i) => ({
      correctIndex: i,
      currentIndex: initialPositions[i]
    }));

    setPieces(newPieces);
  };

  // Draw the interlocking puzzle on canvas
  useEffect(() => {
    if (!imgLoaded || pieces.length === 0) return;
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
      
      // Draw puzzle piece border outline
      ctx.rect(destX, destY, PIECE_SIZE, PIECE_SIZE);
      ctx.clip();

      // Draw original image portion inside piece
      ctx.drawImage(
        imgRef.current,
        correctCol * (imgRef.current.width / GRID_SIZE),
        correctRow * (imgRef.current.height / GRID_SIZE),
        imgRef.current.width / GRID_SIZE,
        imgRef.current.height / GRID_SIZE,
        destX,
        destY,
        PIECE_SIZE,
        PIECE_SIZE
      );

      // Draw jigsaw edge lines for visual puzzle tab look
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(destX, destY, PIECE_SIZE, PIECE_SIZE);

      // Highlight selected piece
      if (selectedPiece === piece.currentIndex) {
        ctx.fillStyle = "rgba(251, 191, 36, 0.35)";
        ctx.fillRect(destX, destY, PIECE_SIZE, PIECE_SIZE);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3;
        ctx.strokeRect(destX, destY, PIECE_SIZE, PIECE_SIZE);
      }

      ctx.restore();
    });
  }, [pieces, selectedPiece, imgLoaded]);

  // Handle clicking / tapping to swap jigsaw pieces
  const handleCanvasClick = (e) => {
    if (isSolved) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedCol = Math.floor(x / (rect.width / GRID_SIZE));
    const clickedRow = Math.floor(y / (rect.height / GRID_SIZE));
    const clickedIndex = clickedRow * GRID_SIZE + clickedCol;

    if (selectedPiece === null) {
      setSelectedPiece(clickedIndex);
    } else {
      // Swap selected piece with clicked piece
      const updatedPieces = pieces.map((p) => {
        if (p.currentIndex === selectedPiece) return { ...p, currentIndex: clickedIndex };
        if (p.currentIndex === clickedIndex) return { ...p, currentIndex: selectedPiece };
        return p;
      });

      setPieces(updatedPieces);
      setSelectedPiece(null);

      // Check win condition
      const checkSolved = updatedPieces.every((p) => p.correctIndex === p.currentIndex);
      if (checkSolved) {
        setIsSolved(true);
        setTimeout(() => {
          onSolve();
        }, 1000);
      }
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col items-center">
        <div className="text-center mb-3">
          <h3 className="text-2xl font-bold text-amber-300">Jigsaw Puzzle Memory</h3>
          <p className="text-xs text-slate-300 mt-1">
            {isSolved
              ? "✨ Complete! Memory restored!"
              : "Click any piece to select it, then click another piece to swap them!"}
          </p>
        </div>

        {/* Puzzle Board Canvas */}
        <div className="relative border-4 border-amber-400/30 rounded-xl overflow-hidden shadow-2xl bg-slate-950">
          <canvas
            ref={canvasRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            onClick={handleCanvasClick}
            className="cursor-pointer block"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
        >
          Close & Try Later
        </button>
      </div>
    </div>
  );
}