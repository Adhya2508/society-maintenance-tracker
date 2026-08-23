import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Shield, Zap, Users, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Greenview Heights — Premium Residential Society',
  description: 'Welcome to Greenview Heights — A premium residential community offering world-class amenities, transparent management, and a vibrant lifestyle.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
            <Link href="#mission" className="hover:text-teal-600 transition-colors">Our Mission</Link>
            <Link href="/about" className="hover:text-teal-600 transition-colors">About Society</Link>
            <Link href="#contact" className="hover:text-teal-600 transition-colors">Contact</Link>
          </nav>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md"
          >
            Resident Login <ChevronRight size={15} />
          </Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/society_hero.jpg"
            alt="Greenview Heights"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/75 to-gray-900/40" />
        </div>

        <div className="relative z-10 w-full px-16 lg:px-32 py-28">
          <div className="max-w-xl">
            <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-5">
              Sector 42 · Gurugram
            </p>

            <h1 className="text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Greenview<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
                Heights
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed mb-10 max-w-xl">
              A premier gated community where thoughtful design, world-class amenities, and a close-knit neighbourhood come together.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                id="hero-get-started"
                className="flex items-center gap-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold text-base px-8 py-4 rounded-xl transition-colors shadow-lg"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold text-base px-8 py-4 rounded-xl backdrop-blur-sm transition-colors"
              >
                Explore Society
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex gap-10 mt-14 pt-10 border-t border-white/10">
              {[['420+', 'Resident Families'], ['15 Acres', 'Green Grounds'], ['24 / 7', 'Security']].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{num}</p>
                  <p className="text-xs text-gray-400 mt-0.5 tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR MISSION ──────────────────────────────────────── */}
      <section id="mission" className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Text */}
            <div>
              <p className="text-teal-600 text-xs font-bold tracking-widest uppercase mb-4">Our Mission</p>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
                Building a Community,<br />
                <span className="text-teal-600">Not Just Homes</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                At Greenview Heights, we believe exceptional living goes beyond four walls. Our mission is to foster a vibrant, inclusive, and well-managed community where every resident feels heard, valued, and proud to call this home.
              </p>
              <p className="text-gray-500 leading-relaxed mb-10">
                We are committed to transparent governance, prompt issue resolution, and continuously upgrading our facilities — so that life here only gets better with each passing year.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: 'Transparent Governance', desc: 'Every decision, open and accountable' },
                  { icon: Zap, title: 'Fast Resolutions', desc: 'Avg. complaint resolved in under 72 hrs' },
                  { icon: Users, title: 'Vibrant Community', desc: 'Monthly events, clubs & gatherings' },
                  { icon: ChevronRight, title: 'Premium Standards', desc: 'World-class upkeep across all facilities' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center mb-3">
                      <Icon size={17} className="text-teal-600" />
                    </div>
                    <p className="text-gray-900 font-bold text-sm mb-1">{title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stacked images */}
            <div className="relative h-[480px]">
              <div className="absolute top-0 left-0 w-[72%] h-[68%] rounded-3xl overflow-hidden shadow-2xl">
                <Image src="/society_pool.jpg" alt="Swimming Pool" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="absolute bottom-0 right-0 w-[60%] h-[52%] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image src="/society_sports.jpg" alt="Sports Courts" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="absolute top-[36%] left-[38%] bg-teal-600 text-white rounded-2xl px-5 py-4 shadow-xl text-center z-10">
                <p className="font-black text-3xl">420+</p>
                <p className="text-teal-100 text-xs font-medium mt-0.5">Families</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AMENITIES PREVIEW ────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-teal-600 text-xs font-bold tracking-widest uppercase mb-4">World-Class Facilities</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Life at Greenview Heights</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every day feels exceptional with amenities designed for well-being, fitness, and recreation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: '/society_pool.jpg', label: 'Swimming Pool', desc: 'Olympic-size infinity pool with a separate kids zone and jacuzzi.' },
              { img: '/society_gym.jpg', label: 'Fitness Centre', desc: 'Premium gym with personal trainers, yoga & spinning studio.' },
              { img: '/society_sports.jpg', label: 'Sports Complex', desc: 'Floodlit tennis, basketball & badminton courts for all ages.' },
            ].map(({ img, label, desc }) => (
              <div key={label} className="group relative rounded-3xl overflow-hidden shadow-md h-72 cursor-default">
                <Image src={img} alt={label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-black text-xl">{label}</h3>
                  <p className="text-gray-300 text-sm mt-1.5 max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/about" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:gap-3 transition-all text-sm">
              View all amenities <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-4">Resident Portal</p>
          <h2 className="text-4xl font-black text-white mb-4">Already a Resident?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Login to raise complaints, read notices, pay dues, and stay connected with your community — all in one place.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold text-base px-10 py-4 rounded-xl transition-colors shadow-xl"
          >
            Login to Portal <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER / CONTACT ─────────────────────────────────── */}
      <section id="contact" className="py-16 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
                  <span className="font-black text-xs">GH</span>
                </div>
                <div>
                  <p className="font-black">Greenview Heights</p>
                  <p className="text-teal-400 text-[10px] tracking-widest uppercase">Premium Residences</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                A premier gated community redefining residential living in Gurugram.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xs tracking-widest uppercase text-teal-400 mb-5">Quick Links</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {[['About Society', '/about'], ['Our Mission', '/#mission'], ['Resident Portal', '/login'], ['New Registration', '/register']].map(([label, href]) => (
                  <li key={label}><Link href={href} className="hover:text-teal-400 transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs tracking-widest uppercase text-teal-400 mb-5">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3"><MapPin size={14} className="text-teal-500 mt-0.5 shrink-0" />Sector 42, Gurugram, Haryana — 122002</li>
                <li className="flex items-center gap-3"><Phone size={14} className="text-teal-500 shrink-0" />+91 98765 43210</li>
                <li className="flex items-center gap-3"><Mail size={14} className="text-teal-500 shrink-0" />office@greenviewheights.in</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Greenview Heights RWA. All rights reserved.</p>
            <p>Built with care for a better community experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
}