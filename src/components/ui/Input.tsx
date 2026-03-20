type Props = {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
};

export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border text-black rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-black"
    />
  );
}