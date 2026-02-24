interface Props {
  children?: React.ReactNode;
}

export default function LoadingSpinner({ children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      {children && <p className="text-sm">{children}</p>}
    </div>
  );
}
