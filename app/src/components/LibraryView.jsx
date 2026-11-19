import React, { useMemo, useState } from 'react';
import { ThemedIcon } from './ThemedIcon';

export function LibraryView({
  chapters,
  currentChapterNum,
  chapterProgressMap,
  readChapters,
  bookmarks,
  fontFamily,
  isLight,
  onOpenChapter,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const currentChapter = useMemo(
    () => chapters.find((c) => c.number === currentChapterNum) || chapters[0],
    [chapters, currentChapterNum]
  );

  // Overall progress across the 26 translated chapters (195–220)
  const overallProgressPct = useMemo(() => {
    const idx = chapters.findIndex((c) => c.number === currentChapterNum);
    const safeIdx = idx >= 0 ? idx : 0;
    const chPct = chapterProgressMap[currentChapterNum] ?? 0;
    return Math.min(100, Math.max(1, Math.round(((safeIdx + chPct / 100) / chapters.length) * 100)));
  }, [chapters, currentChapterNum, chapterProgressMap]);

  const visibleChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.filter((c) => {
      if (q && !c.title.toLowerCase().includes(q) && !String(c.number).includes(q)) {
        return false;
      }
      const isRead = readChapters.includes(c.number);
      if (filter === 'read') return isRead;
      if (filter === 'unread') return !isRead;
      return true;
    });
  }, [chapters, query, filter, readChapters]);

  const unreadCount = chapters.length - readChapters.length;

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="oled-scroll flex-1 overflow-y-auto px-5 pt-5 pb-6">
        {/* Top Header */}
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-[3px]">
            <p className="text-[10px] font-semibold tracking-[1.4px] text-[var(--accent-primary)] uppercase">
              NIGHT SHELF · 0% GLOW
            </p>
            <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)]">
              My Novel
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchOpen((prev) => !prev);
              setQuery('');
            }}
            aria-label="Toggle chapter search"
            className={`flex size-[42px] items-center justify-center rounded-[12px] border bg-[var(--bg-surface)] transition-colors active:scale-95 ${
              searchOpen
                ? 'border-[var(--accent-primary)]'
                : 'border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50'
            }`}
          >
            <ThemedIcon name="search" alt="Search" isLight={isLight} />
          </button>
        </header>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="mt-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาเลขตอน หรือชื่อตอน (เช่น 198, มังกร)..."
              autoFocus
              className="w-full rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
              style={{ fontFamily }}
            />
          </div>
        )}

        {/* Active Novel & Chapter Hero Card */}
        <section className="mt-4 flex flex-col gap-3 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[1.2px] text-[var(--accent-primary)] uppercase">
              ACTIVE CHAPTER
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              Ch. {currentChapter.number} · {readChapters.length}/{chapters.length} read
            </span>
          </div>

          <h2 className="text-[17px] font-bold leading-[22px] text-[var(--text-primary)]">
            Barbarian’s Adventure In A Fantasy World
          </h2>

          <p
            className="text-[14px] font-medium text-[var(--text-secondary)]"
            style={{ fontFamily }}
          >
            {currentChapter.title}
          </p>

          <div className="h-[3px] w-full overflow-hidden rounded-[2px] bg-[var(--track-bg)]">
            <div
              className="h-full rounded-[2px] bg-[var(--accent-primary)] transition-all duration-300"
              style={{ width: `${overallProgressPct}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenChapter(currentChapter.number)}
            className="flex w-full items-center justify-center rounded-[10px] border border-[var(--accent-primary)] bg-[var(--accent-primary)]/14 py-[10px] text-[13px] font-semibold text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary)]/22 active:scale-[0.99]"
          >
            Resume Ch. {currentChapter.number}
          </button>
        </section>

        {/* Bookmarked Chapters Quick Pills (if any) */}
        {bookmarks.length > 0 && (
          <section className="mt-4">
            <p className="mb-2 text-[12px] font-semibold text-[var(--text-muted)]">
              Bookmarked
            </p>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onOpenChapter(num)}
                  className="rounded-full border border-[var(--accent-primary)]/60 bg-[var(--bg-pill)] px-3 py-1 text-[11px] font-semibold text-[var(--accent-primary)] transition-colors hover:border-[var(--accent-primary)]"
                >
                  Ch. {num}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Chapters List (195–220) */}
        <section className="mt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[var(--text-muted)]">
              Chapters ({chapters[0]?.number}–{chapters[chapters.length - 1]?.number})
            </h3>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `All (${chapters.length})` },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'read', label: `Read (${readChapters.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    filter === tab.id
                      ? 'border border-[var(--accent-primary)] bg-[var(--accent-primary)]/14 text-[var(--accent-primary)]'
                      : 'border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {visibleChapters.length === 0 ? (
            <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-6 text-center text-[13px] text-[var(--text-muted)]">
              No matching chapters
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleChapters.map((ch) => {
                const isCurrent = ch.number === currentChapterNum;
                const isRead = readChapters.includes(ch.number);
                return (
                  <button
                    key={ch.number}
                    type="button"
                    onClick={() => onOpenChapter(ch.number)}
                    className={`flex w-full items-center justify-between rounded-[14px] border px-3.5 py-3 text-left transition-colors ${
                      isCurrent
                        ? 'border-[var(--accent-primary)]/60 bg-[var(--bg-elevated)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/35'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <p
                        className="truncate text-[14px] font-semibold text-[var(--text-primary)]"
                        style={{ fontFamily }}
                      >
                        {ch.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                        {isCurrent
                          ? `${chapterProgressMap[ch.number] ?? 0}% · Active`
                          : isRead
                          ? `Read · ~${ch.readingMinutes} min`
                          : `Unread · ~${ch.readingMinutes} min`}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--accent-primary)] bg-[var(--bg-pill)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-primary)]">
                      {isCurrent ? 'Now' : ch.number}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
