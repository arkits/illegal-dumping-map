import { CITIES } from "@/lib/utils";
import { CityCard } from "@/components/CityCard";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Illegal Dumping Map - Global Analytics",
  description: "Explore and analyze illegal dumping service request data across major US cities",
};

export default function HomePage() {
  const allCities = Object.values(CITIES);
  const featuredCities = allCities.filter(city => city.imagePath);
  const otherCities = allCities.filter(city => !city.imagePath);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Header/Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs group-hover:bg-blue-500 transition-colors">
              ID
            </div>
            <span className="font-black tracking-tighter text-xl text-white uppercase">
              Illegal Dumping Map
            </span>
          </Link>
          <div className="flex gap-8">
            <Link href="/weekly" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Trends
            </Link>
            <Link href="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-32 lg:pt-48 lg:pb-56">
        {/* Map Background - Beautiful and Elegant */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Subtle grid pattern with better spacing */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '120px 120px',
              backgroundPosition: '0 0',
              opacity: 0.4,
            }}
          />
          {/* Beautiful organic road network with smooth gradients */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6 }}>
            <defs>
              <linearGradient id="roadGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(96, 165, 250, 0.3)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.1)" />
              </linearGradient>
              <linearGradient id="roadGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(96, 165, 250, 0.22)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.15)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.08)" />
              </linearGradient>
              <linearGradient id="roadGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(96, 165, 250, 0.18)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.08)" />
              </linearGradient>
            </defs>
            {/* Main arterial roads - smooth curves */}
            <path d="M0,320 Q350,260 600,360 Q850,460 1200,400" stroke="url(#roadGradient1)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M200,0 Q300,180 500,300 Q700,420 900,480 Q1100,540 1200,560" stroke="url(#roadGradient1)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Secondary roads */}
            <path d="M0,500 Q280,440 520,540 Q760,640 980,660" stroke="url(#roadGradient2)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M420,0 Q520,240 720,350 Q920,460 1120,510" stroke="url(#roadGradient2)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Tertiary roads */}
            <path d="M750,0 Q830,170 1000,290 Q1170,410 1200,440" stroke="url(#roadGradient3)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0,650 Q220,600 460,690 Q700,780 880,820" stroke="url(#roadGradient3)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M280,0 Q380,140 580,240 Q780,340 960,390" stroke="url(#roadGradient3)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12 animate-fade-in shadow-2xl shadow-blue-500/10">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Real-time Analysis Node Active
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
              Mapping the <span className="text-blue-500">Impact</span> of Illegal Dumping.
            </h1>

            <p className="text-xl lg:text-2xl text-slate-400 font-medium leading-relaxed mb-12 max-w-2xl">
              Precision analytics for urban maintenance. We synchronize high-frequency service request data to visualize the pulse of city sanitation.
            </p>

            <div className="flex flex-wrap gap-6">
              <a href="#cities" className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black tracking-widest text-xs transition-all shadow-2xl shadow-blue-500/30 hover:-translate-y-1">
                Explore Cities
              </a>
              <Link href="/weekly" className="px-10 py-5 bg-slate-900 text-white border border-slate-700/50 rounded-2xl font-black tracking-widest text-xs hover:bg-slate-800 transition-all shadow-2xl">
                View Trends
              </Link>
              <Link href="/about" className="px-10 py-5 bg-slate-900 text-white border border-slate-700/50 rounded-2xl font-black tracking-widest text-xs hover:bg-slate-800 transition-all shadow-2xl">
                About
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -z-10 animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
      </section>

      {/* Featured Cities */}
      <section id="cities" className="max-w-7xl mx-auto px-6 py-32 border-t border-slate-800/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">
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

      {/* Other Cities */}
      {otherCities.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-32 bg-slate-900/30 backdrop-blur-3xl rounded-[4rem] border border-slate-800/50 mb-32">
          <div className="mb-16">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">
              Secondary Hubs
            </h2>
            <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
              Additional Access Points
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherCities.map((city) => (
              <CityCard
                key={city.id}
                name={city.name}
                state={city.state}
                route={city.route}
                description={city.shortDescription}
                color={city.color}
              />
            ))}
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 mb-32">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[4rem] p-10 md:p-24 text-white overflow-hidden relative shadow-[0_0_100px_rgba(37,99,235,0.2)]">
          <div className="relative z-10 max-w-4xl">
            <h3 className="text-5xl lg:text-7xl font-black mb-10 tracking-tighter leading-[0.9]">
              Decentralized <br />Data, Shared <span className="text-blue-300">Responsibility.</span>
            </h3>
            <p className="text-blue-100 text-xl lg:text-2xl font-medium leading-relaxed mb-16 max-w-3xl">
              Our infrastructure bridges the gap between city-scale 311 databases and public awareness. By surfacing architectural dump patterns, we empower evidence-based sanitation policy.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6">
              {[
                { label: "Oakland", url: "https://data.oaklandca.gov/" },
                { label: "SF Data", url: "https://data.sfgov.org/" },
                { label: "DataLA", url: "https://data.lacity.org/" },
                { label: "NYC Open", url: "https://opendata.cityofnewyork.us/" },
                { label: "Chicago", url: "https://data.cityofchicago.org/" },
                { label: "Seattle", url: "https://data.seattle.gov/" }
              ].map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-150 transition-transform" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Abstract visuals */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-white/10 blur-[120px] rounded-full" />
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} Illegal Dumping Map Infrastructure
            </p>
            <p className="text-slate-700 text-[8px] mt-2 font-bold uppercase tracking-widest">
              Secured Connection // All Rights Reserved
            </p>
          </div>
          <div className="flex gap-12">
            <a href="https://github.com/arkits/illegal-dumping-map" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-500 text-[10px] font-black tracking-widest transition-colors">
              Source Log
            </a>
            <Link href="/about" className="text-slate-500 hover:text-blue-500 text-[10px] font-black tracking-widest transition-colors">
              About
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

