export type ToastTone = 'success' | 'error';

type ToastProps = {
  message: string;
  tone: ToastTone;
  onDismiss: () => void;
};

const toneStyles: Record<ToastTone, string> = {
  success:
    'bg-white text-gray-900 ring-gray-200 [&_.toast-icon]:text-emerald-600',
  error: 'bg-white text-gray-900 ring-red-200 [&_.toast-icon]:text-red-600',
};

export function Toast({ message, tone, onDismiss }: ToastProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg p-4 shadow-lg ring-1 ring-inset ${toneStyles[tone]}`}
        role="status"
      >
        <span className="toast-icon shrink-0 text-sm font-bold leading-none" aria-hidden>
          {tone === 'success' ? '✓' : '!'}
        </span>
        <p className="min-w-0 flex-1 self-center text-xs leading-snug">{message}</p>
        <button
          type="button"
          className="shrink-0 self-center rounded-md px-1.5 py-0.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
