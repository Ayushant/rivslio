import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Write. Share. Connect.
      </h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        A clean, secure blog platform. Publish your ideas, discover great
        writing, and interact with the community.
      </p>
      <div className="flex gap-4">
        <Link
          href="/feed"
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100"
        >
          Browse feed
        </Link>
        <Link
          href="/register"
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
        >
          Start writing
        </Link>
      </div>
    </div>
  );
}
