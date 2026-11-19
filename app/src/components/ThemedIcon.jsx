import React from 'react';
import searchSvg from '../assets/icons/search.svg';
import chevronLeftSvg from '../assets/icons/chevron-left.svg';
import bookmarkSvg from '../assets/icons/bookmark.svg';
import listSvg from '../assets/icons/list.svg';
import sunSvg from '../assets/icons/sun.svg';

const ICONS = {
  search: searchSvg,
  'chevron-left': chevronLeftSvg,
  bookmark: bookmarkSvg,
  list: listSvg,
  sun: sunSvg,
};

export function ThemedIcon({ name, alt = '', isLight = false, className = '' }) {
  const src = ICONS[name];
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      width={20}
      height={20}
      className={`block size-[20px] shrink-0 select-none transition-[filter] duration-150 ${
        isLight ? 'brightness-[0.18] contrast-125' : ''
      } ${className}`}
      draggable={false}
    />
  );
}
