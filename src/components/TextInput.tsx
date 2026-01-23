'use client';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  return (
    <div className="mb-8">
      <label htmlFor="text-input" className="block mb-2.5 text-lg font-medium">
        Paste your text here:
      </label>
      <textarea
        id="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste an article or any text here to start speed reading..."
        className="w-full h-40 p-4 border-2 border-primary rounded-xl bg-white/5 text-white text-base resize-y placeholder:text-white/50 focus:outline-none focus:border-primary-light focus:shadow-[0_0_10px_rgba(233,69,96,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
