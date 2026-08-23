import Link from 'next/link';
import { ShieldCheck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
              SC
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">SocietyConnect</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login" className="text-gray-600 hover:text-brand font-medium px-4 py-2 transition">
              Log In
            </Link>
            <Link href="/register" className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-2 rounded-lg transition shadow-sm">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-brand text-sm font-semibold mb-8 border border-teal-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              Modernizing Society Management
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
              Maintenance Tracking, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-teal-400">Simplified.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Empower your residential community with a seamless digital platform. Raise complaints, track resolutions in real-time, and stay informed with instant notices.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="bg-brand hover:bg-brand-dark text-white font-bold text-lg px-8 py-4 rounded-xl transition shadow-lg shadow-brand/30 flex items-center justify-center gap-2">
                Get Started
                <ChevronRight size={20} />
              </Link>
              <Link href="/login" className="bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg px-8 py-4 rounded-xl transition border border-gray-200 shadow-sm">
                Resident Login
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Why choose SocietyConnect?</h2>
              <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">Designed for transparency, built for speed.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                  <Clock size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
                <p className="text-gray-600 leading-relaxed">Watch your complaint move from Open to Resolved with detailed timeline updates and SLAs.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Transparent</h3>
                <p className="text-gray-600 leading-relaxed">Immutable history logs ensure that every status change is recorded and tied to the responsible actor.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Resolution</h3>
                <p className="text-gray-600 leading-relaxed">Admins get powerful dashboards to visualize workload, prioritize issues, and identify overdue tasks instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-6 opacity-80">
            <div className="w-8 h-8 bg-white text-gray-900 rounded-lg flex items-center justify-center font-bold text-sm">SC</div>
            <span className="text-xl font-bold tracking-tight">SocietyConnect</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SocietyConnect Inc. All rights reserved. Built with Next.js & FastAPI.
          </p>
        </div>
      </footer>
    </div>
  );
}