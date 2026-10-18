"use client";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  "aria-labelledby"?: string;
};

// Interruptor on/off accesible (role="switch")
export default function Switch({ checked, onChange, id, ...aria }: Props) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${
        checked ? "bg-orange-500" : "bg-stone-300"
      }`}
      {...aria}
    >
      <span
        aria-hidden
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
