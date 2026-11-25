import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Moon,
  Share2,
  Sun,
} from 'lucide-react';
import { BrandAssetImages } from './config/brandAssets';
import {
  FlyerState,
  FrameShape,
  buildSocialCaption,
  resolveSchoolLabel,
} from './constants/schools';
import { GeneratorForm } from './components/GeneratorForm';
import { FlyerPreview } from './components/FlyerPreview';
import { loadBrandAssets } from './utils/brandAssetLoader';
import { drawFlyer } from './utils/drawFlyer';

const SUPPORTED_IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp|avif|heic|heif)$/i;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Default to the flagship AMETTSA deep emerald & gold presentation theme
  const [isDark, setIsDark] = useState<boolean>(true);

  const [fontsReady, setFontsReady] = useState(false);
  const [brandAssets, setBrandAssets] = useState<BrandAssetImages>({});
  const [imageError, setImageError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>(
    'Photos stay on your device and are never uploaded.'
  );
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [state, setState] = useState<FlyerState>({
    fullName: '',
    selectedSchool: '',
    customSchool: '',
    shape: 'circle',
    image: null,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    let active = true;
    const loadFonts = async () => {
      try {
        if (document.fonts) {
          await Promise.all([
            document.fonts.load('900 40px Montserrat'),
            document.fonts.load('800 40px Montserrat'),
            document.fonts.load('700 26px Montserrat'),
            document.fonts.ready,
          ]);
        }
      } catch {
        // Proceed with fallback stack if font API rejects
      } finally {
        if (active) setFontsReady(true);
      }
    };
    loadFonts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let cleanupFn: (() => void) | undefined;

    loadBrandAssets().then((bundle) => {
      if (!mounted) {
        bundle.cleanup();
        return;
      }
      cleanupFn = bundle.cleanup;
      if (bundle.loadedKeys.length > 0) {
        setBrandAssets(bundle.images);
      }
    });

    return () => {
      mounted = false;
      cleanupFn?.();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const schoolLabel = useMemo(
    () => resolveSchoolLabel(state.selectedSchool, state.customSchool),
    [state.selectedSchool, state.customSchool]
  );

  const captionText = useMemo(
    () => buildSocialCaption(state.fullName, schoolLabel),
    [state.fullName, schoolLabel]
  );

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const looksLikeImage =
      file.type.startsWith('image/') ||
      (!file.type && SUPPORTED_IMAGE_EXTENSIONS.test(file.name));

    if (!looksLikeImage) {
      setImageError(
        'Unsupported file type. Please select a valid image (JPG, PNG, or WebP).'
      );
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        URL.revokeObjectURL(nextUrl);
        setImageError(
          'That image appears empty or corrupted. Please try another photo.'
        );
        return;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = nextUrl;

      setImageError(null);
      setState((prev) => ({
        ...prev,
        image: img,
      }));
      setFeedback('Photo added to your frame. Tap the frame anytime to replace it.');
    };

    img.onerror = () => {
      URL.revokeObjectURL(nextUrl);
      setImageError(
        'Could not load that image file. Try a standard JPG, PNG, or WebP photo.'
      );
    };

    img.src = nextUrl;
  };

  const handleRemovePhoto = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageError(null);
    setState((prev) => ({
      ...prev,
      image: null,
    }));
    setFeedback('Photos stay on your device and are never uploaded.');
  };

  const getCleanFilename = () => {
    const slug = (state.fullName.trim() || 'attendee')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `AMETTSA-5.0-${slug || 'attendee'}.png`;
  };

  const renderExportCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch {
      // Continue exporting even if font readiness check throws
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawFlyer(ctx, state, brandAssets);
    }
    return canvas;
  };

  const handleDownload = async () => {
    const canvas = await renderExportCanvas();
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) {
        setFeedback('Could not generate the PNG file. Please try again.');
        return;
      }
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getCleanFilename();
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);

      setDownloaded(true);
      setFeedback(
        'Downloaded 1080 × 1350 PNG! If blocked on mobile, press and hold the flyer to Save Image.'
      );
      setTimeout(() => setDownloaded(false), 2400);
    }, 'image/png');
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopied(true);
      setFeedback(
        'Caption copied! Ready to paste on WhatsApp, Instagram, or LinkedIn.'
      );
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setFeedback('Could not access clipboard. Select and copy the caption text.');
    }
  };

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const handleShareFlyer = async () => {
    const canvas = await renderExportCanvas();
    if (!canvas || !canShareFiles) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], getCleanFilename(), { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'I’ll be attending AMETTSA 5.0',
            text: captionText,
          });
        } catch {
          // User cancelled share sheet
        }
      } else {
        handleDownload();
      }
    }, 'image/png');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#f3f7f4] dark:bg-[#002a16] text-[#002a16] dark:text-white transition-colors duration-200 flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-0 dark:opacity-100 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,91,60,0.48),transparent_70%),radial-gradient(ellipse_55%_45%_at_85%_45%,rgba(253,200,15,0.07),transparent_65%)]"
      />

      <header className="relative border-b border-[#cde0d4] dark:border-[#fdc80f]/20 bg-white/90 dark:bg-[#013214]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-lg font-extrabold tracking-tight text-[#002a16] dark:text-white whitespace-nowrap shrink-0"
          >
            AMETTSA 5.0
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#426150] dark:text-[#b8d4c4]"
          >
            <a
              href="#studio"
              className="hover:text-[#002a16] dark:hover:text-[#fdc80f] transition-colors whitespace-nowrap shrink-0"
            >
              Frame Studio
            </a>
            <a
              href="#caption"
              className="hover:text-[#002a16] dark:hover:text-[#fdc80f] transition-colors whitespace-nowrap shrink-0"
            >
              Caption
            </a>
            <a
              href="#event-details"
              className="hover:text-[#002a16] dark:hover:text-[#fdc80f] transition-colors whitespace-nowrap shrink-0"
            >
              Event Details
            </a>
            <a
              href="https://www.amettsa.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#002a16] dark:hover:text-[#fdc80f] transition-colors whitespace-nowrap shrink-0"
            >
              <span>amettsa.com</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#105b3c] dark:bg-gradient-to-b dark:from-[#ffe26a] dark:to-[#fdc80f] text-white dark:text-[#002a16] text-xs font-extrabold hover:opacity-95 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm dark:shadow-[0_4px_16px_-2px_rgba(253,200,15,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#105b3c] dark:focus-visible:ring-[#fdc80f]"
            >
              {downloaded ? 'Downloaded!' : 'Download PNG'}
            </button>
          </div>
        </div>
      </header>

      <main
        id="top"
        className="relative flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 sm:mb-9 pb-6 border-b border-[#cde0d4] dark:border-[#fdc80f]/20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-wide uppercase text-[#105b3c] dark:text-[#fdc80f] mb-1.5">
              Annual Convention &amp; 5th Anniversary · 26–30 Nov 2026 · Summit University, Offa
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#002a16] dark:text-white text-balance">
              I’ll be attending AMETTSA 5.0
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-[#426150] dark:text-[#b8d4c4]">
              Enter your details, tap the flyer frame to add your photo, and download your high-resolution attendance flyer.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-end">
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#cde0d4] dark:border-[#fdc80f]/25 bg-white dark:bg-[#013214] text-xs font-semibold text-[#002a16] dark:text-white inline-flex items-center gap-2 hover:bg-[#eaf2ed] dark:hover:bg-[#003a12] transition-colors whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#105b3c] dark:focus-visible:ring-[#fdc80f]"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#fdc80f]" aria-hidden="true" />
                  <span>Light view</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#105b3c]" aria-hidden="true" />
                  <span>Emerald view</span>
                </>
              )}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
          aria-hidden="true"
        />

        <div
          id="studio"
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] gap-7 lg:gap-10 items-start"
        >
          <div className="space-y-5">
            <GeneratorForm
              state={state}
              imageError={imageError}
              onNameChange={(fullName) =>
                setState((prev) => ({ ...prev, fullName }))
              }
              onSchoolChange={(selectedSchool) =>
                setState((prev) => ({ ...prev, selectedSchool }))
              }
              onCustomSchoolChange={(customSchool) =>
                setState((prev) => ({ ...prev, customSchool }))
              }
              onShapeChange={(shape: FrameShape) =>
                setState((prev) => ({ ...prev, shape }))
              }
              onPickPhoto={triggerFilePicker}
              onRemovePhoto={handleRemovePhoto}
            />

            <div className="space-y-3">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 min-h-[50px] px-5 py-3 rounded-xl bg-[#105b3c] dark:bg-gradient-to-b dark:from-[#ffe26a] dark:via-[#fdc80f] dark:to-[#e6b200] text-white dark:text-[#002a16] text-sm sm:text-[15px] font-extrabold inline-flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer shadow-md dark:shadow-[0_10px_28px_-6px_rgba(253,200,15,0.4)] dark:ring-1 dark:ring-inset dark:ring-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#105b3c] dark:focus-visible:ring-[#fdc80f]"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Download Flyer (PNG)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="min-h-[50px] px-4 py-3 rounded-xl border border-[#cde0d4] dark:border-[#fdc80f]/35 bg-white dark:bg-[#003a12] text-[#002a16] dark:text-white text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-[#eaf2ed] dark:hover:bg-[#105b3c]/70 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer dark:ring-1 dark:ring-inset dark:ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#105b3c] dark:focus-visible:ring-[#fdc80f]"
                >
                  {copied ? (
                    <>
                      <Check
                        className="w-4 h-4 text-[#105b3c] dark:text-[#fdc80f]"
                        aria-hidden="true"
                      />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>

                {canShareFiles && (
                  <button
                    type="button"
                    onClick={handleShareFlyer}
                    aria-label="Share flyer"
                    className="min-h-[50px] min-w-[50px] px-3.5 py-3 rounded-xl border border-[#cde0d4] dark:border-[#fdc80f]/35 bg-white dark:bg-[#003a12] text-[#002a16] dark:text-white text-sm font-bold inline-flex items-center justify-center hover:bg-[#eaf2ed] dark:hover:bg-[#105b3c]/70 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#105b3c] dark:focus-visible:ring-[#fdc80f]"
                  >
                    <Share2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <p
                role="status"
                aria-live="polite"
                className="text-xs sm:text-[13px] text-[#426150] dark:text-[#b8d4c4] text-center sm:text-left px-1"
              >
                {feedback}
              </p>
            </div>

            <section
              id="caption"
              aria-label="Ready-to-share caption"
              className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-gradient-to-b dark:from-[#013214] dark:to-[#002a16] border border-[#cde0d4] dark:border-[#fdc80f]/20 shadow-sm dark:shadow-lg dark:ring-1 dark:ring-inset dark:ring-white/5"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#426150] dark:text-[#b8d4c4]">
                  Share Caption Preview
                </h2>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="text-xs font-semibold text-[#105b3c] dark:text-[#fdc80f] hover:underline cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy text'}
                </button>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line text-[#002a16]/90 dark:text-white/90">
                {captionText}
              </p>
            </section>
          </div>

          <div className="lg:sticky lg:top-20 max-w-[540px] mx-auto w-full lg:max-w-none">
            <FlyerPreview
              canvasRef={canvasRef}
              state={state}
              brandAssets={brandAssets}
              fontsReady={fontsReady}
              onPickPhoto={triggerFilePicker}
            />
          </div>
        </div>

        <section
          id="event-details"
          className="mt-12 pt-8 border-t border-[#cde0d4] dark:border-[#fdc80f]/20 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm"
        >
          <div>
            <h2 className="font-display font-bold text-[#002a16] dark:text-[#fdc80f] mb-1">
              Convention Dates
            </h2>
            <p className="text-[#426150] dark:text-[#b8d4c4]">
              26th–30th November, 2026 · 5-day Annual Convention &amp; 5th Anniversary celebration.
            </p>
          </div>
          <div>
            <h2 className="font-display font-bold text-[#002a16] dark:text-[#fdc80f] mb-1">
              Host Venue
            </h2>
            <p className="text-[#426150] dark:text-[#b8d4c4]">
              Summit University, Offa, Kwara State, Nigeria.
            </p>
          </div>
          <div>
            <h2 className="font-display font-bold text-[#002a16] dark:text-[#fdc80f] mb-1">
              Privacy Guarantee
            </h2>
            <p className="text-[#426150] dark:text-[#b8d4c4]">
              All image rendering happens locally in your browser. Your photos are never sent to any server.
            </p>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-[#cde0d4] dark:border-[#fdc80f]/20 py-5 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#426150] dark:text-[#b8d4c4]">
          <span>
            Association of Muslim Engineers, Technologists &amp; Technicians (AMETTSA)
          </span>
          <a
            href="https://www.amettsa.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#105b3c] dark:text-[#fdc80f] hover:underline transition-colors"
          >
            www.amettsa.com
          </a>
        </div>
      </footer>
    </div>
  );
}
