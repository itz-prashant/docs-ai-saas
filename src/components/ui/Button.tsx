type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Button({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-black text-white py-2 rounded-lg cursor-pointer"
    >
      {children}
    </button>
  );
}