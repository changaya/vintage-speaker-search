import { notFound } from 'next/navigation';
import Link from 'next/link';
import SpeakerDetail from '@/components/SpeakerDetail';
import { getAllSpeakers, getSpeakerById, getSpeakersByBrand } from '@/lib/actions/speakers';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const speakers = await getAllSpeakers();

  return speakers.map((speaker) => ({
    id: speaker.id,
  }));
}

export default async function SpeakerPage({ params }: PageProps) {
  const { id } = await params;
  const speaker = await getSpeakerById(id);

  if (!speaker) {
    notFound();
  }

  const relatedSpeakers = await getSpeakersByBrand(speaker.brand);
  const filteredRelated = relatedSpeakers.filter(s => s.id !== speaker.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-amber-900 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-amber-100 hover:text-white mb-2 inline-block">
            ← Back to all speakers
          </Link>
          <h1 className="text-3xl font-bold">Vintage Speaker Search</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SpeakerDetail speaker={speaker} />

        {/* Related Speakers Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            More from {speaker.brand}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredRelated.map((relatedSpeaker) => (
              <Link
                key={relatedSpeaker.id}
                href={`/speakers/${relatedSpeaker.id}`}
                className="border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-1">
                  {relatedSpeaker.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {relatedSpeaker.year} • {relatedSpeaker.type}
                </p>
              </Link>
            ))}
            {filteredRelated.length === 0 && (
              <p className="text-gray-500 col-span-3">
                No other speakers from this brand in the catalog.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Vintage Speaker Search - A catalog of classic audio equipment</p>
        </div>
      </footer>
    </div>
  );
}
