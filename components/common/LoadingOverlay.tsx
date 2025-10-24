// components/common/LoadingOverlay.tsx
"use client";

type Props = {
  show: boolean;
  text?: string;
};

export default function LoadingOverlay({ show, text = "Procesando..." }: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="rounded-xl bg-white dark:bg-neutral-900 px-5 py-4 shadow-xl flex items-center gap-3">
        <svg
          className="h-5 w-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  );
}
