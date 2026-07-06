interface IconProps {
  size?: number;
}

const base = (size = 22) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const HomeIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V21h13V9.5" />
  </svg>
);

export const HistoryIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const PlusIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const DumbbellIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M6.5 6.5v11M3.5 8.5v7M17.5 6.5v11M20.5 8.5v7M6.5 12h11" />
  </svg>
);

export const ChartIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8 15l3.5-4 3 2.5L19 8" />
  </svg>
);

export const CheckIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 12.5 10 17.5 19 7" />
  </svg>
);

export const XIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ChevronRightIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const ChevronLeftIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const TrophyIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 5H4.5a3.5 3.5 0 0 0 3.6 3.5M16 5h3.5a3.5 3.5 0 0 1-3.6 3.5" />
    <path d="M12 13v4M8.5 20h7M10 17h4" />
  </svg>
);

export const TimerIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9.5V13M10 2.5h4" />
  </svg>
);

export const TrashIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4.5 6.5h15M9.5 6V4.5h5V6M6.5 6.5l1 13h9l1-13M10 10.5v5M14 10.5v5" />
  </svg>
);

export const ScaleIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
    <path d="M8.5 9.5a5 5 0 0 1 7 0M12 12.5l2-2.5" />
  </svg>
);

export const SearchIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);

export const DownloadIcon = ({ size }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 4v11M7.5 11 12 15.5 16.5 11M4.5 19.5h15" />
  </svg>
);
