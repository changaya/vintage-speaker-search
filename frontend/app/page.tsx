export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vintage Audio Component Matcher
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find perfectly compatible vintage turntable components using advanced technical matching algorithms.
            Match tonearms to cartridges based on resonance frequency, impedance, and real-world usage data.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎚️ Technical Matching
            </h3>
            <p className="text-gray-600">
              Advanced algorithms calculate resonance frequency, impedance matching, and gain staging
              to ensure optimal compatibility between components.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📊 Comprehensive Database
            </h3>
            <p className="text-gray-600">
              Extensive collection of vintage turntables, tonearms, cartridges, SUTs, and phono preamps
              with detailed specifications from trusted sources.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💡 Smart Recommendations
            </h3>
            <p className="text-gray-600">
              Hybrid recommendation system combining technical compatibility (70%) and real-world
              usage patterns (30%) for the best suggestions.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600 text-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Find Your Perfect Match?</h2>
          <p className="text-primary-100 mb-6">
            Use our matching tool to find compatible components for your vintage turntable setup.
          </p>
          <div className="space-x-4">
            <a
              href="/matcher"
              className="inline-block bg-white text-primary-600 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition"
            >
              Start Matching
            </a>
            <a
              href="/turntables"
              className="inline-block bg-primary-700 text-white font-semibold px-6 py-3 rounded-md hover:bg-primary-800 transition"
            >
              Browse Components
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/turntables" className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary-600">20</div>
            <div className="text-sm text-gray-600">Turntables</div>
          </a>
          <a href="/tonearms" className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary-600">22</div>
            <div className="text-sm text-gray-600">Tonearms</div>
          </a>
          <a href="/cartridges" className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary-600">14</div>
            <div className="text-sm text-gray-600">Cartridges</div>
          </a>
          <a href="/suts" className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary-600">2</div>
            <div className="text-sm text-gray-600">SUTs</div>
          </a>
        </div>
      </div>
    </div>
  );
}
