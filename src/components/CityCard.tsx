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
            <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border border-slate-700/50 shadow-2xl transition-all duration-500 hover:shadow-blue-500/10 hover:-translate-y-2 hover:bg-slate-800/80">
                <div className="relative h-56 w-full overflow-hidden bg-slate-800">
                    {imagePath ? (
                        <Image
                            src={imagePath}
                            alt={name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${styles.gradient} opacity-30`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <div className="absolute top-6 left-6">
                        <div className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse`} />
                    </div>
                </div>

                <div className="p-10 flex flex-col flex-grow">
                    <div className="mb-4">
                        <h3 className={`text-3xl font-black text-white ${styles.text} transition-colors leading-none tracking-tighter uppercase`}>
                            {name}
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">
                            Sector {state}
                        </p>
                    </div>

                    <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8 flex-grow">
                        {description}
                    </p>

                    <div className="flex items-center text-[10px] font-black text-white uppercase tracking-widest group/link">
                        <span className="relative">
                            Analyze Node
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
                        </span>
                        <svg
                            className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-2 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

