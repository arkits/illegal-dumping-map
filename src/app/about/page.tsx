import Link from "next/link";
import { CITIES } from "@/lib/utils";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About the Data | Illegal Dumping Map",
    description: "Detailed overview of the 311 311 data APIs, Socrata integration, and the urban datasets powering our analytics.",
};

export default function AboutPage() {
    const cities = Object.values(CITIES);

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
                        <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/weekly" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
                            Trends
                        </Link>
                        <Link href="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                            About
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent -z-10" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3 animate-pulse" />
                            Technical Documentation v1.0
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
                            The 311 <span className="text-blue-500 text-glow">Data Protocol.</span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                            An in-depth exploration of the APIs, datasets, and architectural patterns that bridge municipal service requests with real-time geospatial intelligence.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    {/* Sidebar Navigation - Desktop */}
                    <aside className="hidden lg:block lg:col-span-3 sticky top-40 h-fit">
                        <div className="space-y-6">
                            {[
                                { id: "overview", label: "Infrastructure Overview" },
                                { id: "architecture", label: "System Architecture" },
                                { id: "socrata", label: "SODA Integration" },
                                { id: "transformation", label: "Data Transformation" },
                                { id: "datasets", label: "Urban Datasets" },
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400 transition-colors"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </aside>

                    {/* Content Sections */}
                    <div className="lg:col-span-9 space-y-32">
                        {/* Overview */}
                        <section id="overview" className="scroll-mt-40">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">
                                01 / Infrastructure Overview
                            </h2>
                            <h3 className="text-4xl font-black text-white tracking-tighter mb-8">
                                What is 311 Data?
                            </h3>
                            <div className="max-w-none text-slate-400 text-lg leading-relaxed">
                                <p className="mb-6">
                                    311 is a non-emergency telephone number that people can call in many cities to find information about services, make complaints, or report problems like graffiti or road damage.
                                    Modern cities have digitized these requests into massive repositories of urban activity.
                                </p>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-6">
                                    <h4 className="text-white font-bold mb-4">Core Principles</h4>
                                    <ul className="space-y-4">
                                        <li className="flex gap-4">
                                            <span className="text-blue-500 font-black">01</span>
                                            <span><strong>Transparency:</strong> Making government service performance visible to the public.</span>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="text-blue-500 font-black">02</span>
                                            <span><strong>Accountability:</strong> Tracking the lifecycle of a request from report to resolution.</span>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="text-blue-500 font-black">03</span>
                                            <span><strong>Efficiency:</strong> identifying high-density problem areas to optimize city resource allocation.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* System Architecture */}
                        <section id="architecture" className="scroll-mt-40">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">
                                02 / System Architecture
                            </h2>
                            <h3 className="text-4xl font-black text-white tracking-tighter mb-12">
                                Deployment Topology
                            </h3>

                            <div className="relative">
                                {/* CSS Architecture Diagram */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                    {/* Layer 1: Data Sources */}
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                        <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                                </svg>
                                            </div>
                                            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Data Sources</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SODA APIs / 311 Nodes</p>
                                        </div>
                                    </div>

                                    {/* Connection 1 */}
                                    <div className="hidden md:flex justify-center">
                                        <div className="w-full h-px bg-gradient-to-r from-blue-500/50 to-indigo-500/50 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse"></div>
                                        </div>
                                    </div>

                                    {/* Layer 2: Analysis Engine */}
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                        <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Analysis Hub</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Next.js / LRU Cache</p>
                                        </div>
                                    </div>

                                    {/* Connection 2 */}
                                    <div className="hidden md:flex justify-center md:col-start-2">
                                        <div className="w-px h-12 bg-gradient-to-b from-indigo-500/50 to-blue-500/50 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)] animate-ping"></div>
                                        </div>
                                    </div>

                                    {/* Layer 3: Presentation */}
                                    <div className="md:col-start-2 relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                        <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center">
                                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                            </div>
                                            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">Geospatial UI</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Leaflet / React Map</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-12 text-slate-400 text-lg leading-relaxed">
                                Our architecture follows a strictly decoupled approach. The <strong>Data Ingestion Layer</strong> handles multi-city API pooling, which feeds into our <strong>Normalization Engine</strong>.
                                Finalized records are cached and delivered through a high-performance React frontend for real-time visualization.
                            </p>
                        </section>

                        {/* SODA Integration */}
                        <section id="socrata" className="scroll-mt-40">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">
                                03 / SODA Integration
                            </h2>
                            <h3 className="text-4xl font-black text-white tracking-tighter mb-8">
                                The Socrata Open Data API
                            </h3>
                            <div className="max-w-none text-slate-400 text-lg leading-relaxed">
                                <p className="mb-8">
                                    The SODA API provides a RESTful interface for querying datasets using a SQL-like syntax called SoQL. This allows our infrastructure to perform complex filtering, aggregation, and geospatial queries directly on city servers.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-xl">
                                        <div className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Query Layer</div>
                                        <code className="text-blue-300 text-sm block bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 mb-4">
                                            $where=REQCATEGORY='ILLDUMP'
                                        </code>
                                        <p className="text-sm font-medium text-slate-500"> We utilize SoQL (Socrata Query Language) to filter massive datasets server-side, ensuring only relevant "Illegal Dumping" records are transmitted.</p>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-xl">
                                        <div className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Auth Protocol</div>
                                        <code className="text-indigo-300 text-sm block bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 mb-4">
                                            X-App-Token: [API_KEY]
                                        </code>
                                        <p className="text-sm font-medium text-slate-500">Standardized authentication headers allow for increased rate limits, facilitating the analysis of up to 50,000 requests per query.</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 mb-12">
                                    <h4 className="text-white font-bold mb-4">Sample Fetching Protocol</h4>
                                    <p className="text-sm text-slate-400 mb-6">To retrieve illegal dumping records from Oakland's 311 dataset for the year 2024, you can use the following `curl` command:</p>
                                    <div className="relative group">
                                        <pre className="bg-black/50 p-6 rounded-2xl border border-slate-800 font-mono text-sm text-blue-300 overflow-x-auto leading-relaxed">
                                            {`curl "https://data.oaklandca.gov/resource/quth-gb8e.json? \\
  $where=REQCATEGORY='ILLDUMP'%20AND%20date_extract_y(DATETIMEINIT)=2024 & \\
  $limit=100 & \\
  $order=DATETIMEINIT%20DESC" \\
  -H "X-App-Token: YOUR_APP_TOKEN"`}
                                        </pre>
                                        <div className="absolute top-4 right-4 text-[9px] font-black text-slate-700 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded border border-slate-800">CURL SAMPLE</div>
                                    </div>
                                </div>

                                <h4 className="text-white font-bold mb-4">Advanced Parameters</h4>
                                <div className="space-y-4 text-sm">
                                    <div className="flex gap-4 pb-4 border-b border-slate-900">
                                        <code className="text-blue-500 font-bold">$limit</code>
                                        <span className="text-slate-500">Controls number of records returned (max 50,000 per request).</span>
                                    </div>
                                    <div className="flex gap-4 pb-4 border-b border-slate-900">
                                        <code className="text-blue-500 font-bold">$offset</code>
                                        <span className="text-slate-500">Enables pagination through large datasets by skipping records.</span>
                                    </div>
                                    <div className="flex gap-4 pb-4 border-b border-slate-900">
                                        <code className="text-blue-500 font-bold">$order</code>
                                        <span className="text-slate-500">Sorts data by timestamp or ID for chronological analysis.</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Data Transformation */}
                        <section id="transformation" className="scroll-mt-40">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">
                                04 / Data Transformation
                            </h2>
                            <h3 className="text-4xl font-black text-white tracking-tighter mb-8">
                                The Unified Dumping Schema
                            </h3>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                                Every city structures their 311 data differently. Our backend normalizes these disparate JSON payloads into a unified object structure for consistent visualization and analysis.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800">
                                            <th className="text-left py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Standard Field</th>
                                            <th className="text-left py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Source Mapping (Examples)</th>
                                            <th className="text-left py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Data Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { field: "id", source: "request_id, sr_number, unique_key", type: "string" },
                                            { field: "lat / lon", source: "latitude, srx/sry, location.coordinates", type: "float64" },
                                            { field: "datetimeinit", source: "created_date, requested_datetime", type: "ISO-8601" },
                                            { field: "status", source: "status_description, case_status", type: "string" },
                                            { field: "description", source: "service_details, descriptor, type", type: "string" },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b border-slate-900 hover:bg-white/5 transition-colors">
                                                <td className="py-6 font-mono text-sm text-blue-400">{row.field}</td>
                                                <td className="py-6 text-sm text-slate-300">{row.source}</td>
                                                <td className="py-6 text-sm text-slate-500 font-black uppercase tracking-wider">{row.type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Urban Datasets */}
                        <section id="datasets" className="scroll-mt-40">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">
                                04 / Urban Datasets
                            </h2>
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                                <h3 className="text-4xl font-black text-white tracking-tighter">
                                    Supported Nodes
                                </h3>
                                <div className="text-[10px] font-black text-slate-500 border border-slate-800 px-6 py-3 rounded-2xl uppercase tracking-widest">
                                    {cities.length} Active Data Streams
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cities.map((city) => (
                                    <div key={city.id} className="group bg-slate-900/30 border border-slate-800/50 rounded-[2rem] p-8 hover:bg-slate-900/50 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-2xl font-black text-white mb-1">{city.name}</h4>
                                                <p className="text-xs font-black text-blue-500 uppercase tracking-widest">{city.state}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {city.id.slice(0, 2).toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="pb-4 border-b border-slate-800/50">
                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Endpoint</div>
                                                <div className="font-mono text-xs text-slate-400 break-all">{city.domain}</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Dataset ID</div>
                                                <div className="font-mono text-xs text-slate-400">{city.datasetId}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

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
                        <Link href="/" className="text-slate-500 hover:text-blue-500 text-[10px] font-black tracking-widest transition-colors">
                            Home
                        </Link>
                        <a href="https://github.com/arkits/illegal-dumping-map" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-500 text-[10px] font-black tracking-widest transition-colors">
                            Source Log
                        </a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
