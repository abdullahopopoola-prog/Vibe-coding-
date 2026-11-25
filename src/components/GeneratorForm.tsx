import React from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, Trash2 } from 'lucide-react';
import {
  CUSTOM_SCHOOL_VALUE,
  FlyerState,
  FrameShape,
  SCHOOLS,
} from '../constants/schools';

interface GeneratorFormProps {
  state: FlyerState;
  imageError: string | null;
  onNameChange: (name: string) => void;
  onSchoolChange: (school: string) => void;
  onCustomSchoolChange: (school: string) => void;
  onShapeChange: (shape: FrameShape) => void;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  state,
  imageError,
  onNameChange,
  onSchoolChange,
  onCustomSchoolChange,
  onShapeChange,
  onPickPhoto,
  onRemovePhoto,
}) => {
  const isCustomSchool = state.selectedSchool === CUSTOM_SCHOOL_VALUE;

  return (
    <section
      aria-label="Flyer customization controls"
      className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-gradient-to-b dark:from-[#013214] dark:to-[#002a16] border border-[#cde0d4] dark:border-[#fdc80f]/25 shadow-md dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.65)] dark:ring-1 dark:ring-inset dark:ring-white/10"
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="attendee-name"
            className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#426150] dark:text-[#b8d4c4] mb-2"
          >
            <span className="text-[#105b3c] dark:text-[#fdc80f] tabular-nums">01</span>
            <span aria-hidden="true">·</span>
            <span>Your Full Name</span>
          </label>
          <input
            id="attendee-name"
            type="text"
            maxLength={42}
            value={state.fullName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Abdulrahman Yusuf"
            autoComplete="off"
            className="w-full min-h-[46px] px-3.5 py-2.5 text-[15px] font-semibold rounded-xl border border-[#cde0d4] dark:border-[#105b3c] bg-[#f7faf8] dark:bg-[#002a16]/90 text-[#002a16] dark:text-white placeholder:text-[#426150]/60 dark:placeholder:text-white/40 focus:outline-none focus-visible:border-[#105b3c] dark:focus-visible:border-[#fdc80f] focus-visible:ring-2 focus-visible:ring-[#105b3c]/30 dark:focus-visible:ring-[#fdc80f]/40 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="attendee-school"
            className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#426150] dark:text-[#b8d4c4] mb-2"
          >
            <span className="text-[#105b3c] dark:text-[#fdc80f] tabular-nums">02</span>
            <span aria-hidden="true">·</span>
            <span>Your School</span>
          </label>
          <select
            id="attendee-school"
            value={state.selectedSchool}
            onChange={(e) => onSchoolChange(e.target.value)}
            className="w-full min-h-[46px] px-3.5 py-2.5 text-[15px] font-semibold rounded-xl border border-[#cde0d4] dark:border-[#105b3c] bg-[#f7faf8] dark:bg-[#002a16]/90 text-[#002a16] dark:text-white focus:outline-none focus-visible:border-[#105b3c] dark:focus-visible:border-[#fdc80f] focus-visible:ring-2 focus-visible:ring-[#105b3c]/30 dark:focus-visible:ring-[#fdc80f]/40 transition-colors cursor-pointer"
          >
            <option value="">Select your school</option>
            {SCHOOLS.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
            <option value={CUSTOM_SCHOOL_VALUE}>
              My school is not listed (type it)
            </option>
          </select>

          {isCustomSchool && (
            <input
              id="custom-school"
              type="text"
              maxLength={45}
              value={state.customSchool}
              onChange={(e) => onCustomSchoolChange(e.target.value)}
              placeholder="Type your school name or abbreviation"
              autoComplete="off"
              autoFocus
              className="mt-2.5 w-full min-h-[46px] px-3.5 py-2.5 text-[15px] font-semibold rounded-xl border border-[#cde0d4] dark:border-[#105b3c] bg-[#f7faf8] dark:bg-[#002a16]/90 text-[#002a16] dark:text-white placeholder:text-[#426150]/60 dark:placeholder:text-white/40 focus:outline-none focus-visible:border-[#105b3c] dark:focus-visible:border-[#fdc80f] focus-visible:ring-2 focus-visible:ring-[#105b3c]/30 dark:focus-visible:ring-[#fdc80f]/40 transition-colors"
            />
          )}
        </div>

        <div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#426150] dark:text-[#b8d4c4] mb-2">
            <span className="text-[#105b3c] dark:text-[#fdc80f] tabular-nums">03</span>
            <span aria-hidden="true">·</span>
            <span>Photo Frame Shape</span>
          </span>
          <div
            role="group"
            aria-label="Photo frame shape"
            className="grid grid-cols-2 gap-2.5"
          >
            <button
              type="button"
              aria-pressed={state.shape === 'circle'}
              onClick={() => onShapeChange('circle')}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl text-sm font-bold border transition-all whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#105b3c] dark:focus-visible:ring-[#fdc80f] ${
                state.shape === 'circle'
                  ? 'bg-[#105b3c] dark:bg-gradient-to-b dark:from-[#ffe26a] dark:to-[#fdc80f] text-white dark:text-[#002a16] border-[#105b3c] dark:border-[#fdc80f] shadow-sm dark:shadow-[0_6px_18px_-4px_rgba(253,200,15,0.35)]'
                  : 'bg-[#f7faf8] dark:bg-[#002a16]/85 text-[#002a16] dark:text-white/90 border-[#cde0d4] dark:border-[#105b3c] hover:border-[#105b3c]/60 dark:hover:border-[#fdc80f]/50'
              }`}
            >
              Circle Frame
            </button>
            <button
              type="button"
              aria-pressed={state.shape === 'square'}
              onClick={() => onShapeChange('square')}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl text-sm font-bold border transition-all whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#105b3c] dark:focus-visible:ring-[#fdc80f] ${
                state.shape === 'square'
                  ? 'bg-[#105b3c] dark:bg-gradient-to-b dark:from-[#ffe26a] dark:to-[#fdc80f] text-white dark:text-[#002a16] border-[#105b3c] dark:border-[#fdc80f] shadow-sm dark:shadow-[0_6px_18px_-4px_rgba(253,200,15,0.35)]'
                  : 'bg-[#f7faf8] dark:bg-[#002a16]/85 text-[#002a16] dark:text-white/90 border-[#cde0d4] dark:border-[#105b3c] hover:border-[#105b3c]/60 dark:hover:border-[#fdc80f]/50'
              }`}
            >
              Rounded Square
            </button>
          </div>
        </div>

        <div>
          <span className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#426150] dark:text-[#b8d4c4] mb-2">
            <span className="text-[#105b3c] dark:text-[#fdc80f] tabular-nums">04</span>
            <span aria-hidden="true">·</span>
            <span>Your Photo</span>
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onPickPhoto}
              className={`flex-1 min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#105b3c] dark:focus-visible:ring-[#fdc80f] ${
                state.image
                  ? 'border-solid border-[#105b3c]/45 dark:border-[#fdc80f]/55 bg-[#eaf4ed] dark:bg-[#003a12] text-[#105b3c] dark:text-[#fdc80f] hover:bg-[#dfeee4] dark:hover:bg-[#105b3c]/60'
                  : 'border-dashed border-[#105b3c]/50 dark:border-[#fdc80f]/45 bg-[#f7faf8] dark:bg-[#002a16]/85 text-[#002a16] dark:text-white hover:bg-[#ebf3ed] dark:hover:bg-[#003a12]'
              }`}
            >
              {state.image ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Photo loaded · Tap to replace</span>
                </>
              ) : (
                <>
                  <ImagePlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Tap here or on the flyer frame</span>
                </>
              )}
            </button>

            {state.image && (
              <button
                type="button"
                onClick={onRemovePhoto}
                aria-label="Remove photo"
                title="Remove photo"
                className="min-h-[48px] min-w-[48px] px-3 rounded-xl border border-[#cde0d4] dark:border-[#105b3c] bg-[#f7faf8] dark:bg-[#002a16]/85 text-[#426150] dark:text-[#b8d4c4] hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {imageError && (
            <div
              role="alert"
              className="mt-2.5 flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{imageError}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
