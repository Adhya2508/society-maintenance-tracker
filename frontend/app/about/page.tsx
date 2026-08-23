import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Waves, Dumbbell, Trophy, Trees, Car, ShieldCheck, Wifi, Coffee } from 'lucide-react';

export const metadata = {
  title: 'About Greenview Heights — Our Society & Amenities',
  description: 'Discover the world-class amenities, rich history, and vibrant community life at Greenview Heights, Gurgaon.',
};

const amenities = [
  {
    icon: Waves,
    name: 'Swimming Pool',
    category: 'Recreation',
    image: '/society_pool.jpg',
    description: 'Dive into luxury with our Olympic-size outdoor infinity pool. Featuring a separate toddler pool, jacuzzi, and poolside cabanas — your personal resort is just an elevator ride away.',
    highlights: ['Olympic-size infinity pool', 'Separate kids splash zone', 'Jacuzzi & hydrotherapy bay', 'Poolside snack bar', 'Certified lifeguards on duty'],
    color: 'from-blue-500 to-cyan-400',
    light: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    icon: Dumbbell,
    name: 'Fitness Centre',
    category: 'Health & Wellness',
    image: '/society_gym.jpg',
    description: 'A 5,000 sq. ft. state-of-the-art fitness centre equipped with premium machines, free weights, and dedicated studios for yoga, Zumba, and spinning classes.',
    highlights: ['Latest Technogym equipment', 'Yoga & meditation studio', 'Zumba & aerobics classes', 'Certified personal trainers', 'Open 5 AM to 11 PM'],
    color: 'from-orange-500 to-amber-400',
    light: 'bg-orange-50',
    text: 'text-orange-600',
  },
  {
    icon: Trophy,
    name: 'Sports Complex',
    category: 'Sports & Activity',
    image: '/society_sports.jpg',
    description: 'Stay active and competitive with our multi-sport complex featuring floodlit courts for tennis, basketball, badminton, and cricket nets for all age groups.',
    highlights: ['2 floodlit tennis courts', 'Full basketball court', 'Badminton hall (4 courts)', 'Cricket practice nets', 'Squash court'],
    color: 'from-green-500 to-emerald-400',
    light: 'bg-green-50',
    text: 'text-green-600',
  },
];

const moreAmenities = [
  { icon: Trees, name: 'Landscaped Gardens', desc: '3 acres of manicured lawns, walking trails & meditation gardens' },
  { icon: Car, name: 'Smart Parking', desc: 'RFID-enabled covered parking with 2 spots per flat + visitor parking' },
  { icon: ShieldCheck, name: '24×7 Security', desc: 'CCTV surveillance, boom barriers, biometric entry & patrol guards' },
  { icon: Wifi, name: 'High-Speed Internet', desc: 'Fibre-optic internet backbone with building-wide Wi-Fi coverage' },
  { icon: Coffee, name: 'Clubhouse & Café', desc: 'Premium clubhouse with party hall, library lounge & café' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center shadow">
              <span className="text-white font-black text-sm">GH</span>
            </div>
            <div>
              <span className="text-lg font-black text-gray-900">Greenview Heights</span>
              <span className="block text-[10px] text-teal-600 font-semibold tracking-widest uppercase -mt-0.5">Premium Residences</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/#mission" className="hover:text-teal-600 transition">Our Mission</Link>
            <Link href="/about" className="text-teal-600 font-bold">About Society</Link>
            <Link href="/#contact" className="hover:text-teal-600 transition">Contact</Link>
          </nav>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-teal-200"
          >
            Resident Login <ChevronRight size={15} />
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[420px] flex items-center pt-20">
        <div className="absolute inset-0">
          <Image src="/society_hero.jpg" alt="Greenview Heights" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block text-teal-300 text-xs font-bold tracking-widest uppercase mb-4 bg-teal-900/50 border border-teal-700/40 px-4 py-1.5 rounded-full">Est. 2008 · Sector 42, Gurugram</span>
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4">About <span className="text-teal-400">Greenview Heights</span></h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            A premium gated community home to 420+ families — designed for comfort, curated for community, and built to last.
          </p>
        </div>
      </section>

      {/* ── SOCIETY STORY ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-teal-600 text-xs font-bold tracking-widest uppercase mb-4 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">Our Story</span>
              <h2 className="text-4xl font-black text-gray-900 mb-6">16+ Years of Community Excellence</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Founded in 2008, Greenview Heights was born from a vision — to create not just a place to live, but a place to truly belong. Nestled across 15 lush acres in the heart of Sector 42, Gurugram, our society has grown from 120 founding families to a thriving community of over 420 households.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Over the years, we have earned multiple RWA awards for best maintenance, community engagement, and green initiatives. Our Resident Welfare Association (RWA) is elected democratically every 2 years, ensuring that every voice matters.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From our annual sports day to Diwali melas, children's art festivals to senior citizen welfare programs — Greenview Heights is a place where every age group finds joy, support, and belonging.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '420+', label: 'Resident Families' },
                { num: '15 ac', label: 'Landscaped Grounds' },
                { num: '16+', label: 'Years of Excellence' },
                { num: '50+', label: 'Annual Events' },
              ].map(({ num, label }) => (
                <div key={label} className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-6 text-center hover:shadow-md transition">
                  <p className="text-4xl font-black text-teal-700 mb-1">{num}</p>
                  <p className="text-gray-600 text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN AMENITIES ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-teal-600 text-xs font-bold tracking-widest uppercase mb-4 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">World-Class Facilities</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Amenities Built for Every Lifestyle</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Everything you need to live your best life — right within our gates.</p>
          </div>

          <div className="space-y-16">
            {amenities.map((amenity, index) => {
              const Icon = amenity.icon;
              const isEven = index % 2 === 0;
              return (
                <div key={amenity.name} className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Image */}
                  <div className={`relative h-80 rounded-3xl overflow-hidden shadow-2xl ${!isEven ? 'lg:order-2' : ''}`}>
                    <Image src={amenity.image} alt={amenity.name} fill className="object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${amenity.color} opacity-20`} />
                    <div className="absolute top-4 left-4">
                      <span className={`inline-block ${amenity.light} ${amenity.text} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>{amenity.category}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={!isEven ? 'lg:order-1' : ''}>
                    <div className={`w-12 h-12 ${amenity.light} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon size={24} className={amenity.text} />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-3">{amenity.name}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{amenity.description}</p>
                    <ul className="space-y-2">
                      {amenity.highlights.map(h => (
                        <li key={h} className="flex items-center gap-3 text-gray-700 text-sm">
                          <span className={`w-5 h-5 rounded-full ${amenity.light} ${amenity.text} flex items-center justify-center text-xs font-black`}>✓</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MORE AMENITIES GRID ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">And So Much More…</h2>
            <p className="text-gray-500">Every detail of Greenview Heights is designed to make your everyday extraordinary.</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {moreAmenities.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-100 rounded-2xl p-5 text-center transition group cursor-default">
                <div className="w-12 h-12 bg-white group-hover:bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm transition">
                  <Icon size={22} className="text-gray-500 group-hover:text-teal-600 transition" />
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{name}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-teal-700 to-emerald-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Proud to Call It Home?</h2>
          <p className="text-teal-100 text-lg mb-8">Login to your resident portal to raise complaints, read notices, and stay connected with your community.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-black px-8 py-4 rounded-xl hover:bg-teal-50 transition shadow-xl text-lg">
              Resident Login <ChevronRight size={20} />
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-teal-800/50 text-white border border-teal-400/30 font-semibold px-8 py-4 rounded-xl hover:bg-teal-800 transition text-lg">
              New Resident? Register
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-8 bg-gray-900 text-center">
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Greenview Heights RWA · Sector 42, Gurugram · office@greenviewheights.in</p>
      </footer>
    </div>
  );
}
