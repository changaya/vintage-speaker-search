import { Speaker } from '@/types/speaker';

interface SpeakerDetailProps {
  speaker: Speaker;
}

export default function SpeakerDetail({ speaker }: SpeakerDetailProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-12 flex items-center justify-center">
          <div className="text-9xl">🔊</div>
        </div>

        {/* Info Section */}
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
                {speaker.type}
              </span>
              <span className="text-gray-500">{speaker.country}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {speaker.name}
            </h1>
            <p className="text-xl text-gray-600">
              {speaker.brand} • {speaker.year}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {speaker.description}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
            <dl className="grid grid-cols-1 gap-3">
              <div className="border-b border-gray-200 pb-2">
                <dt className="text-sm font-medium text-gray-500">Driver Configuration</dt>
                <dd className="text-gray-900">{speaker.specs.driver}</dd>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <dt className="text-sm font-medium text-gray-500">Frequency Response</dt>
                <dd className="text-gray-900">{speaker.specs.frequency}</dd>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <dt className="text-sm font-medium text-gray-500">Impedance</dt>
                <dd className="text-gray-900">{speaker.specs.impedance}</dd>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <dt className="text-sm font-medium text-gray-500">Sensitivity</dt>
                <dd className="text-gray-900">{speaker.specs.sensitivity}</dd>
              </div>
              {speaker.specs.dimensions && (
                <div className="border-b border-gray-200 pb-2">
                  <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                  <dd className="text-gray-900">{speaker.specs.dimensions}</dd>
                </div>
              )}
              {speaker.specs.weight && (
                <div className="border-b border-gray-200 pb-2">
                  <dt className="text-sm font-medium text-gray-500">Weight</dt>
                  <dd className="text-gray-900">{speaker.specs.weight}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
