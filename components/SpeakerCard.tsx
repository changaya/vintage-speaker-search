import Link from 'next/link';
import { Speaker } from '@/types/speaker';

interface SpeakerCardProps {
  speaker: Speaker;
}

export default function SpeakerCard({ speaker }: SpeakerCardProps) {
  return (
    <Link href={`/speakers/${speaker.id}`}>
      <div className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col">
        {/* Image placeholder */}
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 h-48 flex items-center justify-center">
          <div className="text-6xl">🔊</div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {speaker.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {speaker.brand} • {speaker.year}
          </p>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">
            {speaker.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
              {speaker.type}
            </span>
            <span className="text-xs text-gray-500">{speaker.country}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
