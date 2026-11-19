import React, { useEffect, useRef, useState } from 'react';
import { ThemedIcon } from './ThemedIcon';

function renderFormattedParagraph(text) {
  // Support subtle *italic* inner thoughts from markdown chapters
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic opacity-90">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function ReaderView({
  chapter,
  hasPrev,
  hasNext,
  initialProgress,
  isBookmarked,
  isLight,
  settings,
  fontFamily,
  onBack,
  onToggleBookmark,
  onOpenDisplaySheet,
  onPrevChapter,
  onNextChapter,
  onProgressChange,
}) {
  const scrollRef = useRef(null);
  const [showHud, setShowHud] = useState(true);
  const [scrollPct, setScrollPct] = useState(initialProgress ?? 0);

  // Restore scroll position on chapter mount (keyed by chapter.number in App.jsx)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const saved = initialProgress ?? 0;
    requestAnimationFrame(() => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0 && saved > 0) {
        el.scrollTop = Math.round((saved / 100) * maxScroll);
      } else {
        el.scrollTop = 0;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const pct = maxScroll <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((el.scrollTop / maxScroll) * 100)));
    setScrollPct(pct);
    onProgressChange(chapter.number, pct);
  };

  // Map Anti-Glare Dimness (35%–100%) to comfortable OLED text/content opacity (0.62–1.0)
  const contentOpacity = 0.62 + (settings.dimness / 100) * 0.38;

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[var(--bg-canvas)]">
      {/* Top Minimal Header */}
      <header
        className={`flex items-center justify-between px-5 pt-3 pb-2 transition-opacity duration-200 ${
          showHud ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to library"
          className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-surface)] active:scale-95"
        >
          <ThemedIcon name="chevron-left" alt="Back" isLight={isLight} />
        </button>

        <p className="text-[12px] font-medium text-[var(--text-muted)]">
          Ch. {chapter.number} · {scrollPct}%
        </p>

        <button
          type="button"
          onClick={() => onToggleBookmark(chapter.number)}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark chapter'}
          className={`relative flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-surface)] active:scale-95 ${
            isBookmarked ? 'ring-1 ring-[var(--accent-primary)]/70 bg-[var(--accent-primary)]/12' : ''
          }`}
        >
          <ThemedIcon name="bookmark" alt="Bookmark" isLight={isLight} />
          {isBookmarked && (
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[var(--accent-primary)]" />
          )}
        </button>
      </header>

      {/* Scrollable Reading Viewport */}
      <main
        ref={scrollRef}
        onScroll={handleScroll}
        onClick={() => setShowHud((prev) => !prev)}
        className="oled-scroll flex-1 cursor-pointer overflow-y-auto pt-2.5 pb-12 select-text"
        style={{
          paddingLeft: `${settings.marginX}px`,
          paddingRight: `${settings.marginX}px`,
          opacity: contentOpacity,
        }}
      >
        <article className="mx-auto flex max-w-[65ch] flex-col gap-4">
          <div className="mb-1 flex flex-col gap-1">
            <h1
              className="text-[20px] font-bold leading-[28px] text-[var(--text-primary)]"
              style={{ fontFamily }}
            >
              {chapter.title}
            </h1>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">
              Barbarian’s Adventure · ~{chapter.readingMinutes} min read
            </p>
          </div>

          {chapter.paragraphs.map((para, idx) =>
            para === '✦' ? (
              <div
                key={idx}
                className="py-2 text-center text-[13px] tracking-[0.4em] text-[var(--accent-primary)] opacity-70"
              >
                — ✦ —
              </div>
            ) : (
              <p
                key={idx}
                className="text-[var(--text-primary)]"
                style={{
                  fontFamily,
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineHeight,
                }}
              >
                {renderFormattedParagraph(para)}
              </p>
            )
          )}

          {/* End-of-chapter Navigation */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-6 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-6"
          >
            <button
              type="button"
              disabled={!hasPrev}
              onClick={onPrevChapter}
              className="flex-1 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 text-[13px] font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)]/50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              ← Ch. {chapter.number - 1}
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={onNextChapter}
              className="flex-1 rounded-[12px] border border-[var(--accent-primary)] bg-[var(--accent-primary)]/14 py-3 text-[13px] font-semibold text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary)]/22 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {hasNext ? `Next · Ch. ${chapter.number + 1} →` : 'Latest Chapter'}
            </button>
          </div>
        </article>
      </main>

      {/* Bottom Floating Pill HUD + 2px Edge Progress Track */}
      <footer
        className={`flex flex-col gap-2 px-5 pt-1 pb-3 transition-all duration-200 ${
          showHud ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-[18px] py-[10px]">
          <button
            type="button"
            onClick={() => onOpenDisplaySheet('chapters')}
            aria-label="Open chapter list"
            className="flex size-7 items-center justify-center rounded-md transition-opacity hover:opacity-80 active:scale-95"
          >
            <ThemedIcon name="list" alt="Chapters" isLight={isLight} />
          </button>

          <button
            type="button"
            onClick={() => onOpenDisplaySheet('display')}
            aria-label="Open display settings"
            className="px-2 py-0.5 text-[14px] font-bold text-[var(--accent-primary)] transition-opacity hover:opacity-80 active:scale-95"
          >
            Aa
          </button>

          <button
            type="button"
            onClick={() => onOpenDisplaySheet('display')}
            aria-label="Adjust anti-glare dimness"
            className="flex size-7 items-center justify-center rounded-md transition-opacity hover:opacity-80 active:scale-95"
          >
            <ThemedIcon name="sun" alt="Dimness" isLight={isLight} />
          </button>

          <button
            type="button"
            disabled={!hasNext}
            onClick={onNextChapter}
            className="text-[12px] font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-primary)] disabled:opacity-35"
          >
            Next →
          </button>
        </div>

        {/* 2px Edge Progress Bar */}
        <div className="h-[2px] w-full overflow-hidden bg-[var(--track-bg)]">
          <div
            className="h-full bg-[var(--accent-primary)] transition-all duration-150"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
      </footer>
    </div>
  );
}
