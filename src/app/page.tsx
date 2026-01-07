import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Distil" width={20} height={20} className="rounded-lg" />
            <span className="text-lg font-bold text-gray-900">Distil</span>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/auth/login"
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center md:justify-start">
            <Image src="/distil_log.jpg" alt="Distil Hero" width={640} height={640} className="rounded-xl object-contain w-full max-w-sm md:max-w-md" />
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern Distillery Management
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track barrels, manage inventory, monitor production, and ensure compliance 
              with a comprehensive system built for craft distilleries.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/auth/signup"
                className="px-8 py-3 bg-brand text-white rounded-lg hover:bg-brand font-medium text-lg"
              >
                Start Free Trial
              </Link>
              <Link 
                href="#features"
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 font-medium text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Run Your Distillery
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-beige rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Barrel Tracking</h3>
              <p className="text-gray-600">
                Monitor every barrel from filling to bottling. Track aging, sampling, 
                and movements with complete traceability.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-beige rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventory Management</h3>
              <p className="text-gray-600">
                Real-time tracking of raw materials, spirits in production, 
                and finished goods. Never lose track of your stock.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-beige rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-3.87a3 3 0 01-1.8-5.36 8.032 8.032 0 01-12.4 0 3 3 0 01-1.8 5.36" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Production Orders</h3>
              <p className="text-gray-600">
                Schedule and track fermentation, distillation runs, and bottling. 
                Maintain consistency with recipe management.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-beige rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Control</h3>
              <p className="text-gray-600">
                Lab results, tasting notes, and quality metrics all in one place. 
                Ensure consistency across batches.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-beige rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compliance & TTB</h3>
              <p className="text-gray-600">
                Generate reports for TTB compliance, track gauging, 
                and maintain audit trails automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-beige rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
              <p className="text-gray-600">
                Visualize production trends, costs, and yields. 
                Make data-driven decisions to optimize operations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center bg-beige rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Modernize Your Distillery?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join craft distilleries using Distil to streamline their operations.
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-brand text-white rounded-lg hover:bg-brand font-medium text-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-20 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-gray-600">
            © 2025 Distil. Built for craft distilleries.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Terms</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
