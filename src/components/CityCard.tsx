import Link from "next/link";
import Image from "next/image";

interface CityCardProps {
    name: string;
    state: string;
    route: string;
    description?: string;
    imagePath?: string;
    color: string;
}

const colorMap: Record<string, { dot: string; gradient: string; text: string }> = {
    blue: { dot: "bg-blue-500", gradient: "from-blue-400 to-blue-600", text: "group-hover:text-blue-600 dark:group-hover:text-blue-400" },
    red: { dot: "bg-red-500", gradient: "from-red-400 to-red-600", text: "group-hover:text-red-600 dark:group-hover:text-red-400" },
    purple: { dot: "bg-purple-500", gradient: "from-purple-400 to-purple-600", text: "group-hover:text-purple-600 dark:group-hover:text-purple-400" },
    orange: { dot: "bg-orange-500", gradient: "from-orange-400 to-orange-600", text: "group-hover:text-orange-600 dark:group-hover:text-orange-400" },
    green: { dot: "bg-green-500", gradient: "from-green-400 to-green-600", text: "group-hover:text-green-600 dark:group-hover:text-green-400" },
    teal: { dot: "bg-teal-500", gradient: "from-teal-400 to-teal-600", text: "group-hover:text-teal-600 dark:group-hover:text-teal-400" },
    cyan: { dot: "bg-cyan-500", gradient: "from-cyan-400 to-cyan-600", text: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400" },
    fuchsia: { dot: "bg-fuchsia-500", gradient: "from-fuchsia-400 to-fuchsia-600", text: "group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400" },
    emerald: { dot: "bg-emerald-500", gradient: "from-emerald-400 to-emerald-600", text: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400" },
};

export function CityCard({ name, state, route, description, imagePath, color }: CityCardProps) {
    const styles = colorMap[color] || colorMap.blue;

    return (
        <Link href={route} className="group block h-full">
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {imagePath ? (
                        <Image
                            src={imagePath}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${styles.gradient} opacity-20`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="p-8 flex flex-col flex-grow">
                    <div className="mb-3">
                        <h3 className={`text-2xl font-bold text-gray-900 dark:text-white ${styles.text} transition-colors leading-tight`}>
                            {name}, <span className="opacity-60">{state}</span>
                        </h3>
                    </div>


                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                        {description}
                    </p>

                    <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group/link">
                        <span>Explore data</span>
                        <svg
                            className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/link:translate-x-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

