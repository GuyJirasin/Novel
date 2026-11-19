import React, { useEffect, useRef } from 'react';
import { THAI_FONTS, THEMES, THEME_ORDER } from '../data/themes';

function SliderControl({ label, valueLabel, min, max, step = 1, value, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="font-semibold text-[var(--text-primary)]">{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="oled-slider"
        style={{
          background: `linear-gradient(to right, var(--accent-primary) ${pct}%, var(--track-bg) ${pct}%)`,
          height: '4px',
          borderRadius: '9999px',
        }}
      />
    </div>
  );
}

export function DisplaySheet({
  open,
  initialFocus,
  chapters,
  currentChapterNum,
  chapterProgressMap,
  readChapters,
  settings,
  fontFamily,
  onUpdateSettings,
  onSelectChapter,
  onClose,
}) {
  const chaptersRef = useRef(null);

  useEffect(() => {
    if (open && initialFocus === 'chapters' && chaptersRef.current) {
      chaptersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [open, initialFocus]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      {/* Dimmed Backdrop over Reader Peek */}
      <button
        type="button"
        aria-label="Close display sheet"
        onClick={onClose}
        className="flex-1 bg-black/65 backdrop-blur-[1px]"
      />

      {/* Rounded 26px Sheet matching Concept 4 */}
      <div className="oled-scroll flex max-h-[82%] flex-col gap-[13px] overflow-y-auto rounded-t-[26px] border border-b-0 border-[var(--border-subtle)] bg-[var(--bg-sheet)] px-5 pt-3 pb-5 shadow-2xl">
        {/* Grabber */}
        <div className="flex w-full justify-center">
          <div className="h-[4px] w-[38px] rounded-[2px] bg-[var(--border-subtle)]" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
            Night Display &amp; TOC
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] font-semibold text-[var(--accent-primary)] hover:opacity-80"
          >
            Close
          </button>
        </div>

        {/* 4 Theme Swatches */}
        <div className="grid grid-cols-4 gap-2">
          {THEME_ORDER.map((id) => {
            const t = THEMES[id];
            const active = settings.theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onUpdateSettings({ theme: id })}
                className={`flex h-[60px] flex-col items-center justify-center gap-1 rounded-[12px] py-2.5 transition-all ${
                  active
                    ? 'border-2 border-[var(--accent-primary)]'
                    : 'border border-[var(--border-subtle)] opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.swatchBg, color: t.swatchText }}
              >
                <span className="text-[16px] font-semibold leading-none">กข</span>
                <span className="text-[11px] font-medium leading-none">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3 Thai Font Chips */}
        <div className="grid grid-cols-3 gap-2">
          {THAI_FONTS.map((f) => {
            const active = settings.fontId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onUpdateSettings({ fontId: f.id })}
                className={`rounded-[10px] py-2 text-[12px] font-semibold transition-colors ${
                  active
                    ? 'border border-[var(--accent-primary)] bg-[var(--accent-primary)]/14 text-[var(--accent-primary)]'
                    : 'border border-transparent bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                style={{ fontFamily: f.family }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Balanced Essentials Sliders */}
        <div className="flex flex-col gap-3 pt-0.5">
          <SliderControl
            label="Anti-Glare Dimness"
            valueLabel={`${settings.dimness}% · ${settings.dimness <= 45 ? 'Midnight' : settings.dimness <= 75 ? 'Soft' : 'Crisp'}`}
            min={10}
            max={100}
            step={5}
            value={settings.dimness}
            onChange={(dimness) => onUpdateSettings({ dimness })}
          />
          <SliderControl
            label="Font Size"
            valueLabel={`${settings.fontSize} px`}
            min={14}
            max={24}
            step={0.5}
            value={settings.fontSize}
            onChange={(fontSize) => onUpdateSettings({ fontSize })}
          />
          <div className="grid grid-cols-2 gap-3">
            <SliderControl
              label="Line Height"
              valueLabel={`${settings.lineHeight.toFixed(2)}×`}
              min={1.45}
              max={2.15}
              step={0.05}
              value={settings.lineHeight}
              onChange={(lineHeight) => onUpdateSettings({ lineHeight })}
            />
            <SliderControl
              label="Margins"
              valueLabel={`${settings.marginX} px`}
              min={14}
              max={38}
              step={2}
              value={settings.marginX}
              onChange={(marginX) => onUpdateSettings({ marginX })}
            />
          </div>
        </div>

        {/* Chapters Jump List */}
        <div ref={chaptersRef} className="mt-1 flex flex-col gap-2.5">
          <p className="text-[12px] font-semibold text-[var(--text-secondary)]">
            Chapters
          </p>
          <div className="flex flex-col gap-2.5">
            {chapters.map((ch) => {
              const isCurrent = ch.number === currentChapterNum;
              const isRead = readChapters.includes(ch.number);
              const pct = chapterProgressMap[ch.number];
              const metaText = isCurrent
                ? `${pct ?? 0}% · Active`
                : isRead
                ? `Read · ~${ch.readingMinutes} min`
                : `Unread · ~${ch.readingMinutes} min`;

              return (
                <button
                  key={ch.number}
                  type="button"
                  onClick={() => {
                    onSelectChapter(ch.number);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between rounded-[12px] px-[14px] py-[12px] text-left transition-colors ${
                    isCurrent
                      ? 'border border-[var(--accent-primary)]/50 bg-[var(--bg-elevated)]'
                      : 'border border-transparent bg-[var(--bg-elevated)] hover:border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-3">
                    <span
                      className="truncate text-[14px] font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily }}
                    >
                      {ch.title}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                      {metaText}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full border border-[var(--accent-primary)] bg-[var(--bg-pill)] px-2 py-1 text-[11px] font-semibold text-[var(--accent-primary)]">
                    {isCurrent ? 'Now' : ch.number}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
