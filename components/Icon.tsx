
import React from 'react';

interface IconProps {
  name: 'play' | 'pause' | 'plus' | 'trash' | 'reset' | 'settings' | 'chevron-down' | 'save' | 'folder';
  className?: string;
}

// FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const icons: { [key in IconProps['name']]: React.ReactElement } = {
  play: <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />,
  pause: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />,
  plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
  reset: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.695v-2.175A8.25 8.25 0 009.75 2.25a8.25 8.25 0 00-8.25 8.25" />,
  settings: <><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.003 1.11-1.226l.554-.225a2.25 2.25 0 012.387 0l.554.225c.55.223 1.02.684 1.11 1.226l.09.542a2.25 2.25 0 002.387 2.387l.542.09c.542.09.984.498 1.226 1.04l.225.554a2.25 2.25 0 010 2.387l-.225.554c-.242.542-.684 1.02-1.226 1.11l-.542.09a2.25 2.25 0 00-2.387 2.387l-.09.542c-.09.542-.56 1.004-1.11 1.226l-.554.225a2.25 2.25 0 01-2.387 0l-.554-.225c-.55-.223-1.02-.684-1.11-1.226l-.09-.542a2.25 2.25 0 00-2.387-2.387l-.542-.09c-.542-.09-.984-.498-1.226-1.04l-.225-.554a2.25 2.25 0 010-2.387l.225-.554c.242.542.684 1.02 1.226 1.11l.542-.09a2.25 2.25 0 002.387-2.387l.09-.542z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
  'chevron-down': <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
  save: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />,
  folder: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
};

const Icon = ({ name, className = 'h-6 w-6' }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    {icons[name]}
  </svg>
);

export default Icon;
