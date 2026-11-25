import React, { useEffect } from 'react';
import { Camera, CheckCircle2, ImagePlus } from 'lucide-react';
import { BrandAssetImages } from '../config/brandAssets';
import { FlyerState } from '../constants/schools';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FRAME_SIZE,
  FRAME_X,
  FRAME_Y,
  drawFlyer,
} from '../utils/drawFlyer';

interface FlyerPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  state: FlyerState;
  brandAssets: BrandAssetImages;
  fontsReady: boolean;
  onPickPhoto: () => void;
}

export const FlyerPreview: React.FC<FlyerPreviewProps> = ({
  canvasRef,
  state,
  brandAssets,
  fontsReady,
  onPickPhoto,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFlyer(ctx, state, brandAssets);
  }, [canvasRef, state, brandAssets, fontsReady]);

  const frameLeftPct = ((FRAME_X - FRAME_SIZE / 2) / CANVAS_WIDTH) * 100;
  const frameTopPct = ((FRAME_Y - FRAME_SIZE / 2) / CANVAS_HEIGHT) * 100;
  const frameWidthPct = (FRAME_SIZE / CANVAS_WIDTH) * 100;
  const frameHeightPct = (FRAME_SIZE / CANVAS_HEIGHT) * 100;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-[36px] bg-[radial-gradient(circle_at_50%_40%,rgba(16,91,60,0.35),rgba(253,200,15,0.08)_45%,transparent_72%)] blur-xl"
      />

      <div className="relative rounded-3xl p-2 sm:p-2.5 bg-gradient-to-b from-[#013214] to-[#002a16] border border-[#fdc80f]/35 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/10">
        <div className="relative rounded-2xl overflow-hidden bg-[#002a16] border border-white/10">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            aria-label="Your AMETTSA 5.0 attendance flyer preview"
            className="w-full h-auto block select-none"
          />

          <button
            type="button"
            onClick={onPickPhoto}
            aria-label={
              state.image
                ? 'Photo loaded — tap frame to replace your photo'
                : 'Tap frame to upload your photo'
            }
            style={{
              left: `${frameLeftPct}%`,
              top: `${frameTopPct}%`,
              width: `${frameWidthPct}%`,
              height: `${frameHeightPct}%`,
            }}
            className={`group absolute cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#fdc80f] transition-all ${
              state.shape === 'circle' ? 'rounded-full' : 'rounded-[11%]'
            }`}
          >
            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${
                state.shape === 'circle' ? 'rounded-full' : 'rounded-[11%]'
              } ${
                state.image
                  ? 'bg-[#002a16]/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  : 'bg-[#fdc80f]/12 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
              }`}
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002a16]/95 border border-[#fdc80f]/80 text-[#fdc80f] text-xs font-bold shadow-lg">
                <Camera className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{state.image ? 'Replace photo' : 'Choose photo'}</span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-xs px-1">
        {state.image ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#105b3c] dark:text-[#fdc80f]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Photo ready · Tap the frame to replace</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[#426150] dark:text-[#b8d4c4]">
            <ImagePlus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Tap the photo frame on the flyer to upload</span>
          </span>
        )}
        <span className="tabular-nums text-[#426150] dark:text-[#b8d4c4] shrink-0">
          1080 × 1350 PNG
        </span>
      </div>
    </div>
  );
};
