import React, { useEffect, useMemo, useState } from 'react';
import chaptersData from './data/chapters.json';
import { THAI_FONTS, THEMES } from './data/themes';
import { LibraryView } from './components/LibraryView';
import { ReaderView } from './components/ReaderView';
import { DisplaySheet } from './components/DisplaySheet';

const STORAGE_KEY = 'night-shelf-reader-v1';

const DEFAULT_SETTINGS = {
  theme: 'oled',
  fontId: 'ibm',
  fontSize: 17,
  lineHeight: 1.75,
  marginX: 24,
  dimness: 75,
};

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function App() {
  const saved = useMemo(() => loadInitialState(), []);

  const [view, setView] = useState('library'); // 'library' | 'reader'
  const [currentChapterNum, setCurrentChapterNum] = useState(
    saved?.currentChapterNum ?? chaptersData[0]?.number ?? 195
  );
  const [chapterProgressMap, setChapterProgressMap] = useState(
    saved?.chapterProgressMap ?? { 195: 48 }
  );
  const [readChapters, setReadChapters] = useState(saved?.readChapters ?? []);
  const [bookmarks, setBookmarks] = useState(saved?.bookmarks ?? []);
  const [settings, setSettings] = useState({
    ...DEFAULT_SETTINGS,
    ...(saved?.settings ?? {}),
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetFocus, setSheetFocus] = useState('display'); // 'display' | 'chapters'

  // Persist reader state
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentChapterNum,
          chapterProgressMap,
          readChapters,
          bookmarks,
          settings,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [currentChapterNum, chapterProgressMap, readChapters, bookmarks, settings]);

  const activeTheme = THEMES[settings.theme] || THEMES.oled;
  const activeFont =
    THAI_FONTS.find((f) => f.id === settings.fontId)?.family ||
    THAI_FONTS[0].family;

  const currentIdx = chaptersData.findIndex((c) => c.number === currentChapterNum);
  const currentChapter = chaptersData[currentIdx] || chaptersData[0];

  const handleOpenChapter = (num) => {
    setCurrentChapterNum(num);
    setView('reader');
    setSheetOpen(false);
  };

  const handleProgressChange = (num, pct) => {
    setChapterProgressMap((prev) => {
      if (prev[num] === pct) return prev;
      return { ...prev, [num]: pct };
    });
    if (pct >= 90) {
      setReadChapters((prev) => (prev.includes(num) ? prev : [...prev, num]));
    }
  };

  const handleToggleBookmark = (num) => {
    setBookmarks((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num].sort((a, b) => a - b)
    );
  };

  const handleUpdateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div
      style={activeTheme.vars}
      className="flex h-dvh w-full items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200"
    >
      {/* Mobile-first Pure OLED Shell: full screen on mobile, centered hairline-framed mobile shell on desktop */}
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--bg-canvas)] sm:h-[min(860px,96dvh)] sm:max-w-[430px] sm:rounded-[36px] sm:border sm:border-[var(--border-subtle)]">
        {view === 'library' ? (
          <LibraryView
            chapters={chaptersData}
            currentChapterNum={currentChapter.number}
            chapterProgressMap={chapterProgressMap}
            readChapters={readChapters}
            bookmarks={bookmarks}
            fontFamily={activeFont}
            isLight={activeTheme.isLight}
            onOpenChapter={handleOpenChapter}
          />
        ) : (
          <ReaderView
            key={currentChapter.number}
            chapter={currentChapter}
            hasPrev={currentIdx > 0}
            hasNext={currentIdx < chaptersData.length - 1}
            initialProgress={chapterProgressMap[currentChapter.number] ?? 0}
            isBookmarked={bookmarks.includes(currentChapter.number)}
            isLight={activeTheme.isLight}
            settings={settings}
            fontFamily={activeFont}
            onBack={() => setView('library')}
            onToggleBookmark={handleToggleBookmark}
            onOpenDisplaySheet={(focus = 'display') => {
              setSheetFocus(focus);
              setSheetOpen(true);
            }}
            onPrevChapter={() => {
              if (currentIdx > 0) handleOpenChapter(chaptersData[currentIdx - 1].number);
            }}
            onNextChapter={() => {
              if (currentIdx < chaptersData.length - 1) {
                setReadChapters((prev) =>
                  prev.includes(currentChapter.number) ? prev : [...prev, currentChapter.number]
                );
                handleOpenChapter(chaptersData[currentIdx + 1].number);
              }
            }}
            onProgressChange={handleProgressChange}
          />
        )}

        <DisplaySheet
          open={sheetOpen}
          initialFocus={sheetFocus}
          chapters={chaptersData}
          currentChapterNum={currentChapter.number}
          chapterProgressMap={chapterProgressMap}
          readChapters={readChapters}
          settings={settings}
          fontFamily={activeFont}
          onUpdateSettings={handleUpdateSettings}
          onSelectChapter={handleOpenChapter}
          onClose={() => setSheetOpen(false)}
        />
      </div>
    </div>
  );
}
