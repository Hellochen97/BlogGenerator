interface Step3RequestsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Step3Requests({ value, onChange }: Step3RequestsProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700" htmlFor="additional-requests">
        Writing brief
      </label>
      <textarea
        id="additional-requests"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Audience, tone, product context, claims to avoid, citation preferences, or GEO goals."
        rows={9}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
      <p className="mt-2 text-sm text-slate-500">No target-domain or custom-link module is included in this open-source build.</p>
    </div>
  );
}
