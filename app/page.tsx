import SpeakerList from '@/components/SpeakerList';
import { getAllSpeakers } from '@/lib/actions/speakers';

export default async function Home() {
  const speakers = await getAllSpeakers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-amber-900 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">🎵 Vintage Speaker Search</h1>
          <p className="text-amber-100">
            Discover classic and legendary speakers from the golden age of audio
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SpeakerList speakers={speakers} />
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
