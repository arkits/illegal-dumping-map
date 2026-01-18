import Link from "next/link";
import { CITIES } from "@/lib/utils";

export default function HomePage() {
  const cities = Object.values(CITIES);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Illegal Dumping Map
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Explore illegal dumping service request data across California cities
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Select a City
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={city.route}
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className={`h-2 bg-${city.color}-500`} />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                    {city.id === "oakland"
                      ? "View illegal dumping service requests in Oakland. Data includes ~370,000+ records with detailed location information."
                      : city.id === "sanfrancisco"
                      ? "View illegal dumping service requests in San Francisco. Data includes 2,620+ records filtered by trash dumping incidents."
                      : "View illegal dumping service requests in Los Angeles. Data includes ~114K records in 2024 from MyLA311 service requests."}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <span>View Map & Statistics</span>
                    <svg
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            About This Project
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mt-2">
            This application visualizes illegal dumping service request data from
            city 311 open data portals. Data is fetched in real-time from each
            city&apos;s open data portal and displayed on an interactive map.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-600 dark:text-blue-400">
            <a
              href="https://data.oaklandca.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Oakland Open Data
            </a>
            <span className="text-blue-300 dark:text-blue-700">|</span>
            <a
              href="https://data.sfgov.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              DataSF
            </a>
            <span className="text-blue-300 dark:text-blue-700">|</span>
            <a
              href="https://data.lacity.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              DataLA
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
