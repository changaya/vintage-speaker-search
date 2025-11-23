import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Speaker Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The speaker you're looking for doesn't exist in our catalog.
        </p>
        <Link
          href="/"
          className="inline-block bg-amber-900 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors"
        >
          Back to Catalog
        </Link>
      </div>
    </div>
  );
}
