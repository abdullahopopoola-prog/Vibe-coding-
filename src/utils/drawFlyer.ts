import { AMETTSA_PALETTE, BrandAssetImages } from '../config/brandAssets';
import { FlyerState, FrameShape, resolveSchoolLabel } from '../constants/schools';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1350;

// Centered hero photo frame geometry on the 1080x1350 canvas
export const FRAME_X = 540;
export const FRAME_Y = 562;
export const FRAME_SIZE = 412;

const FONT_STACK = "'Montserrat', 'Outfit', 'Arial Black', Arial, sans-serif";
const GOLD = AMETTSA_PALETTE.goldPrimary;
const GOLD_LIGHT = AMETTSA_PALETTE.goldLight;
const GOLD_DEEP = AMETTSA_PALETTE.goldDeep;
const DARK_INK = AMETTSA_PALETTE.deepForest;

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  verticalBiasRatio = 0.5
) {
  const scale = Math.max(boxW / img.width, boxH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const drawX = boxX + (boxW - drawW) / 2;
  const drawY = boxY + (boxH - drawH) * verticalBiasRatio;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
) {
  const scale = Math.min(boxW / img.width, boxH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const drawX = boxX + (boxW - drawW) / 2;
  const drawY = boxY + (boxH - drawH) / 2;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxPx: number,
  minPx: number,
  maxWidth: number,
  weight: number
): number {
  let size = maxPx;
  while (size > minPx) {
    ctx.font = `${weight} ${size}px ${FONT_STACK}`;
    if (ctx.measureText(text).width <= maxWidth) {
      break;
    }
    size -= 1;
  }
  return size;
}

function breakLongToken(
  ctx: CanvasRenderingContext2D,
  token: string,
  fontSize: number,
  maxWidth: number,
  weight: number
): string[] {
  ctx.font = `${weight} ${fontSize}px ${FONT_STACK}`;
  if (ctx.measureText(token).width <= maxWidth) {
    return [token];
  }

  if (token.includes('-')) {
    const parts = token.split('-');
    const out: string[] = [];
    let current = '';
    parts.forEach((part, idx) => {
      const piece = idx < parts.length - 1 ? `${part}-` : part;
      const candidate = current ? `${current}${piece}` : piece;
      if (current && ctx.measureText(candidate).width > maxWidth) {
        out.push(current);
        current = piece;
      } else {
        current = candidate;
      }
    });
    if (current) out.push(current);
    if (out.every((line) => ctx.measureText(line).width <= maxWidth)) {
      return out;
    }
  }

  const lines: string[] = [];
  let current = '';
  for (const char of token) {
    const candidate = current + char;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrapTextBalanced(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  startFontSize: number,
  minFontSize: number,
  weight: number
): { lines: string[]; fontSize: number } {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return { lines: [''], fontSize: startFontSize };
  }

  const singleLineSize = fitFontSize(
    ctx,
    cleaned,
    startFontSize,
    minFontSize,
    maxWidth,
    weight
  );
  if (singleLineSize >= startFontSize - 10 || !cleaned.includes(' ')) {
    ctx.font = `${weight} ${singleLineSize}px ${FONT_STACK}`;
    if (ctx.measureText(cleaned).width <= maxWidth) {
      return { lines: [cleaned], fontSize: singleLineSize };
    }
  }

  const words = cleaned.split(' ');

  if (words.length >= 2 && maxLines >= 2) {
    let bestSplit: { diff: number; line1: string; line2: string } | null = null;
    for (let i = 1; i < words.length; i++) {
      const l1 = words.slice(0, i).join(' ');
      const l2 = words.slice(i).join(' ');
      const diff = Math.abs(l1.length - l2.length);
      if (!bestSplit || diff < bestSplit.diff) {
        bestSplit = { diff, line1: l1, line2: l2 };
      }
    }

    if (bestSplit) {
      const targetMax = Math.max(startFontSize - 4, minFontSize);
      const size1 = fitFontSize(ctx, bestSplit.line1, targetMax, minFontSize, maxWidth, weight);
      const size2 = fitFontSize(ctx, bestSplit.line2, targetMax, minFontSize, maxWidth, weight);
      const pairSize = Math.min(size1, size2);
      ctx.font = `${weight} ${pairSize}px ${FONT_STACK}`;
      if (
        pairSize >= minFontSize + 4 &&
        ctx.measureText(bestSplit.line1).width <= maxWidth &&
        ctx.measureText(bestSplit.line2).width <= maxWidth
      ) {
        return { lines: [bestSplit.line1, bestSplit.line2], fontSize: pairSize };
      }
    }
  }

  for (let size = startFontSize - 4; size >= minFontSize; size -= 2) {
    ctx.font = `${weight} ${size}px ${FONT_STACK}`;
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
          current = '';
        }
        if (ctx.measureText(word).width <= maxWidth) {
          current = word;
        } else {
          const splitToken = breakLongToken(ctx, word, size, maxWidth, weight);
          for (let k = 0; k < splitToken.length - 1; k++) {
            lines.push(splitToken[k]);
          }
          current = splitToken[splitToken.length - 1] ?? '';
        }
      }
    }
    if (current) lines.push(current);

    if (lines.length <= maxLines) {
      return { lines, fontSize: size };
    }
  }

  ctx.font = `${weight} ${minFontSize}px ${FONT_STACK}`;
  const fallbackLines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) fallbackLines.push(current);
      current = word;
    }
  }
  if (current) fallbackLines.push(current);
  return {
    lines: fallbackLines.slice(0, maxLines),
    fontSize: minFontSize,
  };
}

function clipFrameShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  shape: FrameShape
) {
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  } else {
    roundedRectPath(ctx, cx - size / 2, cy - size / 2, size, size, 48);
  }
  ctx.closePath();
}

function drawBackgroundLayer(
  ctx: CanvasRenderingContext2D,
  brandAssets: BrandAssetImages
) {
  const W = CANVAS_WIDTH;
  const H = CANVAS_HEIGHT;

  if (brandAssets.background) {
    drawImageCover(ctx, brandAssets.background, 0, 0, W, H, 0.5);
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, AMETTSA_PALETTE.emeraldBrand);
    bgGrad.addColorStop(0.42, AMETTSA_PALETTE.emeraldMid);
    bgGrad.addColorStop(0.76, AMETTSA_PALETTE.emeraldDark);
    bgGrad.addColorStop(1, AMETTSA_PALETTE.deepForest);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // Glossy emerald ambient studio spotlight behind centered hero composition
  const centerGlow = ctx.createRadialGradient(W / 2, 520, 40, W / 2, 520, 560);
  centerGlow.addColorStop(0, 'rgba(16, 91, 60, 0.30)');
  centerGlow.addColorStop(0.55, 'rgba(0, 58, 18, 0.12)');
  centerGlow.addColorStop(1, 'rgba(0, 42, 22, 0)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, W, H);

  if (brandAssets.pattern) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    drawImageCover(ctx, brandAssets.pattern, 0, 0, W, H, 0.5);
    ctx.restore();
  }

  // Top & bottom metallic gold trim lines
  const trimGrad = ctx.createLinearGradient(0, 0, W, 0);
  trimGrad.addColorStop(0, GOLD_DEEP);
  trimGrad.addColorStop(0.35, GOLD);
  trimGrad.addColorStop(0.5, GOLD_LIGHT);
  trimGrad.addColorStop(0.65, GOLD);
  trimGrad.addColorStop(1, GOLD_DEEP);
  ctx.fillStyle = trimGrad;
  ctx.fillRect(0, 0, W, 10);
  ctx.fillRect(0, H - 10, W, 10);
}

function drawHeaderAndHeroBrandLayer(
  ctx: CanvasRenderingContext2D,
  brandAssets: BrandAssetImages
) {
  const W = CANVAS_WIDTH;

  if (brandAssets.alMusaahamahHeader) {
    drawImageContain(ctx, brandAssets.alMusaahamahHeader, 44, 30, W - 88, 82);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 22px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(
      'ASSOCIATION OF MUSLIM ENGINEERS, TECHNOLOGISTS & TECHNICIANS',
      W / 2,
      78
    );
  }

  const headerRule = ctx.createLinearGradient(80, 0, W - 80, 0);
  headerRule.addColorStop(0, 'rgba(253, 200, 15, 0)');
  headerRule.addColorStop(0.5, 'rgba(253, 200, 15, 0.52)');
  headerRule.addColorStop(1, 'rgba(253, 200, 15, 0)');
  ctx.strokeStyle = headerRule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 126);
  ctx.lineTo(W - 80, 126);
  ctx.stroke();

  if (brandAssets.amettsa50Mark) {
    drawImageContain(ctx, brandAssets.amettsa50Mark, 195, 148, 690, 134);
  } else if (brandAssets.amettsaAnd50Logo) {
    drawImageContain(ctx, brandAssets.amettsaAnd50Logo, 195, 148, 690, 134);
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 68px ${FONT_STACK}`;
    ctx.fillText('AMETTSA 5.0', W / 2, 224);
    ctx.fillStyle = GOLD;
    ctx.font = `800 26px ${FONT_STACK}`;
    ctx.fillText('ANNUAL CONVENTION & 5TH ANNIVERSARY', W / 2, 266);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = GOLD;
  ctx.font = `800 30px ${FONT_STACK}`;
  const label = 'I WILL BE ATTENDING';
  const labelW = ctx.measureText(label).width;
  ctx.fillText(label, W / 2, 326);

  ctx.strokeStyle = 'rgba(253, 200, 15, 0.52)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(190, 316);
  ctx.lineTo(W / 2 - labelW / 2 - 20, 316);
  ctx.moveTo(W / 2 + labelW / 2 + 20, 316);
  ctx.lineTo(W - 190, 316);
  ctx.stroke();
}

function drawPhotoFrameLayer(
  ctx: CanvasRenderingContext2D,
  state: FlyerState
) {
  const frameGlow = ctx.createRadialGradient(
    FRAME_X,
    FRAME_Y,
    70,
    FRAME_X,
    FRAME_Y,
    320
  );
  frameGlow.addColorStop(0, 'rgba(253, 200, 15, 0.28)');
  frameGlow.addColorStop(0.55, 'rgba(16, 91, 60, 0.22)');
  frameGlow.addColorStop(1, 'rgba(253, 200, 15, 0)');
  ctx.fillStyle = frameGlow;
  ctx.fillRect(FRAME_X - 325, FRAME_Y - 325, 650, 650);

  // Subtle outer halo ring
  ctx.save();
  ctx.strokeStyle = 'rgba(253, 200, 15, 0.26)';
  ctx.lineWidth = 2;
  clipFrameShape(ctx, FRAME_X, FRAME_Y, FRAME_SIZE + 30, state.shape);
  ctx.stroke();
  ctx.restore();

  // Deep studio drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = AMETTSA_PALETTE.emeraldDark;
  clipFrameShape(ctx, FRAME_X, FRAME_Y, FRAME_SIZE, state.shape);
  ctx.fill();
  ctx.restore();

  ctx.save();
  clipFrameShape(ctx, FRAME_X, FRAME_Y, FRAME_SIZE, state.shape);
  ctx.clip();

  if (state.image) {
    drawImageCover(
      ctx,
      state.image,
      FRAME_X - FRAME_SIZE / 2,
      FRAME_Y - FRAME_SIZE / 2,
      FRAME_SIZE,
      FRAME_SIZE,
      0.34
    );

    const innerEdge = ctx.createRadialGradient(
      FRAME_X,
      FRAME_Y,
      FRAME_SIZE * 0.34,
      FRAME_X,
      FRAME_Y,
      FRAME_SIZE * 0.56
    );
    innerEdge.addColorStop(0, 'rgba(0, 0, 0, 0)');
    innerEdge.addColorStop(1, 'rgba(0, 42, 22, 0.26)');
    ctx.fillStyle = innerEdge;
    ctx.fillRect(
      FRAME_X - FRAME_SIZE / 2,
      FRAME_Y - FRAME_SIZE / 2,
      FRAME_SIZE,
      FRAME_SIZE
    );
  } else {
    const emptyBg = ctx.createRadialGradient(
      FRAME_X,
      FRAME_Y - 30,
      30,
      FRAME_X,
      FRAME_Y,
      FRAME_SIZE * 0.68
    );
    emptyBg.addColorStop(0, AMETTSA_PALETTE.emeraldBrand);
    emptyBg.addColorStop(1, AMETTSA_PALETTE.deepForest);
    ctx.fillStyle = emptyBg;
    ctx.fillRect(
      FRAME_X - FRAME_SIZE / 2,
      FRAME_Y - FRAME_SIZE / 2,
      FRAME_SIZE,
      FRAME_SIZE
    );

    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.arc(FRAME_X, FRAME_Y - 44, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(FRAME_X, FRAME_Y + 126, 118, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = GOLD;
    ctx.font = `800 22px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.fillText('TAP FRAME TO UPLOAD', FRAME_X, FRAME_Y + 138);
  }
  ctx.restore();

  // Glossy beveled metallic gold double-ring border
  ctx.save();
  const ringGrad = ctx.createLinearGradient(
    FRAME_X - FRAME_SIZE / 2,
    FRAME_Y - FRAME_SIZE / 2,
    FRAME_X + FRAME_SIZE / 2,
    FRAME_Y + FRAME_SIZE / 2
  );
  ringGrad.addColorStop(0, GOLD_LIGHT);
  ringGrad.addColorStop(0.5, GOLD);
  ringGrad.addColorStop(1, GOLD_DEEP);

  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 10;
  clipFrameShape(ctx, FRAME_X, FRAME_Y, FRAME_SIZE, state.shape);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 42, 22, 0.78)';
  ctx.lineWidth = 4;
  clipFrameShape(ctx, FRAME_X, FRAME_Y, FRAME_SIZE - 14, state.shape);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2;
  clipFrameShape(ctx, FRAME_X, FRAME_Y, FRAME_SIZE - 22, state.shape);
  ctx.stroke();
  ctx.restore();
}

function drawAttendeeAndEventDetailsLayer(
  ctx: CanvasRenderingContext2D,
  state: FlyerState
) {
  const W = CANVAS_WIDTH;
  const nameText = (state.fullName.trim() || 'YOUR NAME').toUpperCase();
  const schoolRaw = resolveSchoolLabel(state.selectedSchool, state.customSchool);
  const schoolText = (schoolRaw || 'YOUR SCHOOL').toUpperCase();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const { lines: nameLines, fontSize: nameFontSize } = wrapTextBalanced(
    ctx,
    nameText,
    820,
    2,
    52,
    28,
    900
  );

  const lineHeight = nameFontSize * 1.18;
  const nameStartY = nameLines.length === 1 ? 834 : 816;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${nameFontSize}px ${FONT_STACK}`;
  nameLines.forEach((line, idx) => {
    ctx.fillText(line, W / 2, nameStartY + idx * lineHeight);
  });
  ctx.restore();

  const lastNameBaseline = nameStartY + (nameLines.length - 1) * lineHeight;
  const badgeY = lastNameBaseline + 28;

  const schoolLabel = `FROM ${schoolText}`;
  const { lines: schoolLines, fontSize: schoolFontSize } = wrapTextBalanced(
    ctx,
    schoolLabel,
    720,
    2,
    25,
    17,
    800
  );

  ctx.font = `800 ${schoolFontSize}px ${FONT_STACK}`;
  const widestSchoolLine = Math.max(
    ...schoolLines.map((line) => ctx.measureText(line).width)
  );
  const badgeW = Math.min(780, Math.max(280, widestSchoolLine + 64));
  const badgeH = schoolLines.length > 1 ? 74 : 52;
  const badgeRadius = schoolLines.length > 1 ? 22 : 26;

  ctx.fillStyle = 'rgba(16, 91, 60, 0.45)';
  roundedRectPath(ctx, W / 2 - badgeW / 2, badgeY, badgeW, badgeH, badgeRadius);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = GOLD_LIGHT;
  if (schoolLines.length === 1) {
    ctx.fillText(
      schoolLines[0],
      W / 2,
      badgeY + badgeH / 2 + schoolFontSize * 0.35
    );
  } else {
    const sLineH = schoolFontSize * 1.25;
    const firstY = badgeY + badgeH / 2 - sLineH * 0.15;
    schoolLines.forEach((line, idx) => {
      ctx.fillText(line, W / 2, firstY + idx * sLineH);
    });
  }

  // Glossy gold Date & Venue card
  const cardW = 680;
  const cardH = 104;
  const cardX = (W - cardW) / 2;
  const cardY = Math.max(1012, badgeY + badgeH + 34);

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, GOLD_LIGHT);
  cardGrad.addColorStop(0.45, GOLD);
  cardGrad.addColorStop(1, '#efb800');
  ctx.fillStyle = cardGrad;
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  roundedRectPath(ctx, cardX + 2, cardY + 2, cardW - 4, cardH - 4, 16);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = DARK_INK;
  const dateSize = fitFontSize(ctx, '26–30 NOV 2026', 38, 26, cardW - 64, 900);
  ctx.font = `900 ${dateSize}px ${FONT_STACK}`;
  ctx.fillText('26–30 NOV 2026', W / 2, cardY + 48);

  ctx.strokeStyle = 'rgba(0, 42, 22, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 90, cardY + 60);
  ctx.lineTo(cardX + cardW - 90, cardY + 60);
  ctx.stroke();

  const venueSize = fitFontSize(
    ctx,
    'SUMMIT UNIVERSITY, OFFA',
    22,
    16,
    cardW - 64,
    800
  );
  ctx.font = `800 ${venueSize}px ${FONT_STACK}`;
  ctx.fillText('SUMMIT UNIVERSITY, OFFA', W / 2, cardY + 86);
}

function drawFooterLayer(
  ctx: CanvasRenderingContext2D,
  brandAssets: BrandAssetImages
) {
  const W = CANVAS_WIDTH;

  if (brandAssets.amettsaFooter) {
    drawImageContain(ctx, brandAssets.amettsaFooter, 56, 1234, W - 112, 52);
    return;
  }

  const footerDivGrad = ctx.createLinearGradient(220, 0, W - 220, 0);
  footerDivGrad.addColorStop(0, 'rgba(253, 200, 15, 0)');
  footerDivGrad.addColorStop(0.5, 'rgba(253, 200, 15, 0.48)');
  footerDivGrad.addColorStop(1, 'rgba(253, 200, 15, 0)');
  ctx.strokeStyle = footerDivGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(220, 1218);
  ctx.lineTo(W - 220, 1218);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 28px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.fillText('www.amettsa.com', W / 2, 1272);
}

export function drawFlyer(
  ctx: CanvasRenderingContext2D,
  state: FlyerState,
  brandAssets: BrandAssetImages = {}
): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBackgroundLayer(ctx, brandAssets);
  drawHeaderAndHeroBrandLayer(ctx, brandAssets);
  drawPhotoFrameLayer(ctx, state);
  drawAttendeeAndEventDetailsLayer(ctx, state);
  drawFooterLayer(ctx, brandAssets);
}
