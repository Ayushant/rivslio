export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-5xl font-bold text-gray-200 mb-4">404</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist.</p>
      <a href="/" className="text-sm underline text-gray-700">
        Back to home
      </a>
    </div>
  );
}
