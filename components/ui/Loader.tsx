interface LoaderProps {
  label?: string;
}

export default function Loader({ label = 'Loading' }: LoaderProps) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-sage border-t-transparent" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
