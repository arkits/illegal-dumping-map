import { PARKING_CITIES } from "@/lib/parking-citations";
import { CityCard } from "@/components/CityCard";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Parking Citations Map - Analytics",
  description: "Explore and analyze parking citations data across major US cities",
};

export default function ParkingPage() {
  const allCities = Object.values(PARKING_CITIES);
  const featuredCities = allCities.filter(city => city.imagePath);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Header/Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-black text-xs group-hover:bg-amber-500 transition-colors">
              PC
            </div>
            <span className="font-black tracking-tighter text-xl text-white uppercase">
              Parking Citations Map
            </span>
          </Link>
          <div className="flex gap-8">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Illegal Dumping
            </Link>
            <Link href="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-32 lg:pt-48 lg:pb-56">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(245, 158, 11, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(245, 158, 11, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '120px 120px',
              backgroundPosition: '0 0',
              opacity: 0.4,
            }}
          />
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-amber-600/10 via-transparent to-transparent z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12 animate-fade-in shadow-2xl shadow-amber-500/10">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Real-time Analysis Node Active
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
              Mapping <span className="text-amber-500">Parking</span> Enforcement.
            </h1>

            <p className="text-xl lg:text-2xl text-slate-400 font-medium leading-relaxed mb-12 max-w-2xl">
              Precision analytics for parking enforcement. We synchronize citation data to visualize patterns in urban parking violations.
            </p>

            <div className="flex flex-wrap gap-6">
              <a href="#cities" className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black tracking-widest text-xs transition-all shadow-2xl shadow-amber-500/30 hover:-translate-y-1">
                Explore Cities
              </a>
              <Link href="/" className="px-10 py-5 bg-slate-900 text-white border border-slate-700/50 rounded-2xl font-black tracking-widest text-xs hover:bg-slate-800 transition-all shadow-2xl">
                Illegal Dumping
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-amber-600/10 blur-[150px] rounded-full -z-10 animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-rose-600/10 blur-[120px] rounded-full -z-10" />
      </section>

      {/* Featured Cities */}
      <section id="cities" className="max-w-7xl mx-auto px-6 py-32 border-t border-slate-800/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">
              Regional Hubs
            </h2>
            <h3 className="text-5xl lg:text-6xl font-black text-white tracking-tighter">
              Featured Nodes
            </h3>
          </div>
          <div className="hidden md:block">
            <span className="text-[10px] font-black text-slate-500 border border-slate-800 px-6 py-3 rounded-2xl uppercase tracking-widest">
              {featuredCities.length} Core Data Streams
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredCities.map((city) => (
            <div key={city.id} className="group cursor-pointer">
              <CityCard
                name={city.name}
                state={city.state}
                route={city.route}
                description={city.shortDescription}
                imagePath={city.imagePath}
                color={city.color}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} Parking Citations Map Infrastructure
            </p>
            <p className="text-slate-700 text-[8px] mt-2 font-bold uppercase tracking-widest">
              Secured Connection // All Rights Reserved
            </p>
          </div>
          <div className="flex gap-12">
            <a href="https://github.com/arkits/illegal-dumping-map" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-500 text-[10px] font-black tracking-widest transition-colors">
              Source Log
            </a>
            <Link href="/about" className="text-slate-500 hover:text-amber-500 text-[10px] font-black tracking-widest transition-colors">
              About
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
