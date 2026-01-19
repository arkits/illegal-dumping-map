import { CITIES } from "@/lib/utils";
import { CityCard } from "@/components/CityCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Illegal Dumping Map - Home",
  description: "Explore and analyze illegal dumping service request data across major US cities",
};

export default function HomePage() {
  const allCities = Object.values(CITIES);
  const featuredCities = allCities.filter(city => city.imagePath);
  const otherCities = allCities.filter(city => !city.imagePath);

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Real-time 311 Transparency
            </div>

            <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]">
              Mapping the impact of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">illegal dumping.</span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl">
              Gain deep insights into urban maintenance across the US. We visualize service requests from open data portals to help communities and policy makers understand dumping patterns.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#cities" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                View Maps
              </a>
              <a href="https://github.com/arkits/illegal-dumping-map" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Project Specs
              </a>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-400/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 blur-[100px] rounded-full -z-10" />
      </section>

      {/* Featured Cities */}
      <section id="cities" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Featured Cities
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              High-fidelity data visualizations for major metropolitan areas.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
              {featuredCities.length} Core Datasets
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCities.map((city) => (
            <CityCard
              key={city.id}
              name={city.name}
              state={city.state}
              route={city.route}
              description={city.shortDescription}
              imagePath={city.imagePath}
              color={city.color}
            />
          ))}
        </div>
      </section>

      {/* Other Cities Section */}
      {otherCities.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] mb-24 mx-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Additional Locations
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Expanding our coverage to analyze dumping trends in more jurisdictions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="max-w-7xl mx-auto px-6 py-24 mb-12">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 md:p-16 text-white overflow-hidden relative shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <h3 className="text-4xl font-bold mb-6">Open Data for Public Good</h3>
            <p className="text-blue-100 text-lg leading-relaxed mb-10">
              This project transparently visualizes illegal dumping service request data from city 311 open data portals. By surfacing this information, we aim to provide clarity on where sanitation resources are most needed.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
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
                  className="text-white/80 hover:text-white font-medium hover:underline flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Abstract background blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 blur-[80px] rounded-full" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            © {new Date().getFullYear()} Illegal Dumping Map Project. Built with open data.
          </p>
          <div className="flex gap-8">
            <a href="https://github.com/arkits/illegal-dumping-map" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
              GitHub
            </a>
            <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

