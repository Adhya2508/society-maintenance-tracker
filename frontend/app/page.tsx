import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Shield, Zap, Users, Phone, Mail, MapPin, Star } from 'lucide-react';

export const metadata = {
  title: 'Greenview Heights — Premium Residential Society',
  description: 'Welcome to Greenview Heights — A premium residential community offering world-class amenities, transparent management, and a vibrant lifestyle.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center shadow">
              <span className="text-white font-black text-sm tracking-tight">GH</span>
            </div>
            <div>
              <span className="text-lg font-black text-gray-900 tracking-tight">Greenview Heights</span>
              <span className="block text-[10px] text-teal-600 font-semibold tracking-widest uppercase -mt-0.5">Premium Residences</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#mission" className="hover:text-teal-600 transition">Our Mission</Link>
            <Link href="/about" className="hover:text-teal-600 transition">About Society</Link>
            <Link href="#contact" className="hover:text-teal-600 transition">Contact</Link>
          </nav>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-teal-200"
          >
            Resident Login <ChevronRight size={15} />
          </Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/society_hero.jpg"
            alt="Greenview Heights Building"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-900/70 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-semibold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Est. 2008 · Sector 42, Gurgaon
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-6">
              Greenview
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
                Heights
              </span>
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed mb-10 max-w-lg">
              Where luxury meets community. Experience premium residential living with world-class amenities, transparent governance, and a vibrant neighbourhood that feels like home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                id="hero-get-started"
                className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg px-8 py-4 rounded-xl transition shadow-xl shadow-teal-500/30"
              >
                Get Started <ChevronRight size={20} />
              </Link>
              <Link
                href="/about"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-lg px-8 py-4 rounded-xl backdrop-blur-sm transition"
              >
                Explore Society
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              {[['420+', 'Happy Families'], ['15+', 'Acres of Green'], ['24/7', 'Security']].map(([num, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{num}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-72 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-500/30 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-teal-300" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Complaint Resolved</p>
                  <p className="text-gray-400 text-xs">Block C — Electrical Issue</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-teal-400 h-1.5 rounded-full w-4/5" />
              </div>
              <p className="text-gray-400 text-xs mt-2">Resolved in 2 days</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-64 shadow-xl ml-8">
              <div className="flex items-center gap-2 mb-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-white text-sm font-medium">"Best society I've lived in!"</p>
              <p className="text-gray-400 text-xs mt-1">— Priya S., Block A Resident</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-xs">
          <div className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-1.5 bg-white/60 rounded-full animate-bounce" />
          </div>
          Scroll to explore
        </div>
      </section>

      {/* ── OUR MISSION ──────────────────────────────────────── */}
      <section id="mission" className="py-24 bg-gradient-to-br from-gray-50 to-teal-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: mission text */}
            <div>
              <span className="inline-block text-teal-600 text-xs font-bold tracking-widest uppercase mb-4 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">Our Mission</span>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
                Building a Community,
                <span className="text-teal-600"> Not Just Homes</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                At Greenview Heights, we believe that great living goes beyond four walls. Our mission is to foster a vibrant, inclusive, and well-managed community where every resident feels heard, valued, and proud to call this home.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                We are committed to transparent governance, prompt issue resolution, and continuously upgrading our facilities — so that life here only gets better with each passing year.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: 'Transparent Management', desc: 'Every decision, open and accountable' },
                  { icon: Zap, title: 'Fast Issue Resolution', desc: 'Average complaint resolved in under 72 hrs' },
                  { icon: Users, title: 'Vibrant Community', desc: 'Monthly events, clubs, and gatherings' },
                  { icon: Star, title: 'Premium Standards', desc: 'World-class upkeep across all facilities' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center mb-3">
                      <Icon size={18} className="text-teal-600" />
                    </div>
                    <p className="text-gray-900 font-bold text-sm">{title}</p>
                    <p className="text-gray-500 text-xs mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: stacked images */}
            <div className="relative h-[500px]">
              <div className="absolute top-0 left-0 w-3/4 h-72 rounded-3xl overflow-hidden shadow-2xl">
                <Image src="/society_pool.jpg" alt="Swimming Pool" fill className="object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-2/3 h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image src="/society_sports.jpg" alt="Sports Courts" fill className="object-cover" />
              </div>
              {/* Floating badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-600 text-white rounded-2xl px-5 py-3 shadow-xl text-center z-10">
                <p className="font-black text-2xl">420+</p>
                <p className="text-teal-100 text-xs font-medium">Families</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AMENITIES PREVIEW ────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-teal-600 text-xs font-bold tracking-widest uppercase mb-4 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">World-Class Facilities</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Life at Greenview Heights</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Every day feels like a holiday with amenities designed for your well-being, fitness, and recreation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: '/society_pool.jpg', label: 'Swimming Pool', desc: 'Olympic-size infinity pool with separate kids section and jacuzzi.' },
              { img: '/society_gym.jpg', label: 'Fitness Centre', desc: 'State-of-the-art gym with personal trainers, yoga & Zumba studio.' },
              { img: '/society_sports.jpg', label: 'Sports Complex', desc: 'Tennis, basketball, badminton courts — floodlit for evening play.' },
            ].map(({ img, label, desc }) => (
              <div key={label} className="group relative rounded-3xl overflow-hidden shadow-lg h-72 cursor-pointer">
                <Image src={img} alt={label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-black text-xl">{label}</h3>
                  <p className="text-gray-300 text-sm mt-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/about" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:gap-3 transition-all">
              See all amenities <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-teal-700 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Already a Resident?</h2>
          <p className="text-teal-100 text-lg mb-8">Login to raise complaints, view notices, and manage your account — all in one place.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-black text-lg px-10 py-4 rounded-xl hover:bg-teal-50 transition shadow-xl"
          >
            Login to Portal <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
                  <span className="font-black text-sm">GH</span>
                </div>
                <div>
                  <p className="font-black text-lg">Greenview Heights</p>
                  <p className="text-teal-400 text-xs tracking-widest uppercase">Premium Residences</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">A premier gated community redefining residential living in Gurgaon since 2008.</p>
            </div>

            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase text-teal-400 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-teal-400 transition">About Society</Link></li>
                <li><Link href="#mission" className="hover:text-teal-400 transition">Our Mission</Link></li>
                <li><Link href="/login" className="hover:text-teal-400 transition">Resident Portal</Link></li>
                <li><Link href="/register" className="hover:text-teal-400 transition">New Registration</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase text-teal-400 mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3"><MapPin size={15} className="text-teal-400 mt-0.5 shrink-0" /> Sector 42, Gurugram, Haryana — 122002</li>
                <li className="flex items-center gap-3"><Phone size={15} className="text-teal-400 shrink-0" /> +91 98765 43210</li>
                <li className="flex items-center gap-3"><Mail size={15} className="text-teal-400 shrink-0" /> office@greenviewheights.in</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Greenview Heights RWA. All rights reserved.</p>
            <p>Built with ❤️ for a better community experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
}