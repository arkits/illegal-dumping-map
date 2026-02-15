# Oakland Illegal Dumping Map

An interactive web application for visualizing and analyzing illegal dumping service requests from Oakland's 311 service data. The application provides real-time maps, statistics, trends, and detailed request information.

## Features

- 🗺️ **Interactive Map**: Visualize illegal dumping requests on an interactive Leaflet map with clustering
- 📊 **Statistics Dashboard**: View total requests, weekly averages, and year-over-year comparisons
- 📈 **Trend Analysis**: Weekly trends chart comparing current year with previous year
- 📋 **Request Table**: Searchable and sortable table of all requests with virtual scrolling
- 🎨 **Dark Mode**: Full dark mode support with theme toggle
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Performance Optimized**: Virtual scrolling, data caching, and efficient rendering

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Drizzle ORM** - Database ORM

### Backend
- **SQLite** - Local database with better-sqlite3 (used for API caching)
- **Next.js API Routes** - Server endpoints

### Data Processing
- **Python 3.14+** - Data fetching and analysis scripts
- **pandas** - Data manipulation
- **sodapy** - Socrata API client

### Development Tools
- **Bun** - Package manager and runtime
- **Vitest** - Testing framework
- **Oxlint** - Fast linter
- **Drizzle Kit** - Database migrations

## Prerequisites

- **Bun** (latest version) - [Install Bun](https://bun.sh)
- **Python 3.14+** - [Install Python](https://www.python.org/)
- **UV** (Python package manager) - [Install UV](https://github.com/astral-sh/uv)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd illegal-dumping-map
   ```

2. **Install Node.js dependencies**
   ```bash
   bun install
   ```

3. **Install Python dependencies**
   ```bash
   uv sync
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your optional API token:
   ```env
   OAK311_API_TOKEN=your_token_here
   ```
   
   > Note: The API token is optional. The application will work without it, but authenticated requests have higher rate limits.

5. **Database setup**
   The SQLite database is created automatically on first run. You can override
   the default path by setting `DATABASE_PATH` in your `.env` file.

## Usage

### Development Server

Start the Next.js development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the application for production:

```bash
bun run build
```

Start the production server:

```bash
bun run start
```

### Python Data Script

Run the Python script to fetch and analyze data:

```bash
python get-data.py
```

Or using UV:

```bash
uv run get-data.py
```

## Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run linter (oxlint)
- `bun run test` - Run tests in watch mode
- `bun run test:run` - Run tests once

### Code Quality

Before committing, ensure:

```bash
bun run lint
bun run build
bun run test:run
```

All commands should pass without errors.

## Deployment (Dokku)

This app supports Dokku with a local SQLite database. Make sure you:

1. Mount persistent storage for the database (example path: `/app/data`).
2. Set `DATABASE_PATH=/app/data/illegal-dumping.db`.
3. Use the provided `Procfile` to start the app.

## Project Structure

```
illegal-dumping-map/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── requests/       # Request data endpoint
│   │   │   ├── stats/          # Statistics endpoint
│   │   │   ├── weekly/         # Weekly trends endpoint
│   │   │   └── years/          # Available years endpoint
│   │   ├── weekly/             # Weekly trends page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── RequestMap.tsx      # Interactive map
│   │   ├── RequestTable.tsx    # Data table
│   │   ├── Stats.tsx           # Statistics display
│   │   ├── WeeklyTrendsChart.tsx
│   │   ├── RequestDistribution.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/               # React contexts
│   │   └── ThemeContext.tsx    # Theme management
│   ├── db/                     # Database
│   │   ├── index.ts            # Database connection
│   │   └── schema.ts           # Drizzle schema
│   └── lib/                    # Utilities
│       ├── cache.ts            # SQLite cache helpers
│       ├── socrata.ts          # Socrata API client
│       └── utils.ts            # Helper functions
├── docs/                       # Documentation
│   └── OAKLAND_311_API.md      # API documentation
├── get-data.py                 # Python data script
├── package.json                # Node.js dependencies
├── pyproject.toml              # Python dependencies
└── README.md                   # This file
```

## API Endpoints

### `/api/requests`
Get illegal dumping requests with filtering.

**Query Parameters:**
- `year` (optional) - Filter by year
- `limit` (optional) - Maximum number of results (default: 5000)
- `offset` (optional) - Pagination offset

**Example:**
```
GET /api/requests?year=2024&limit=1000
```

### `/api/stats`
Get statistics for a given year with comparison.

**Query Parameters:**
- `year` (required) - Year to get stats for
- `compareYear` (optional) - Year to compare against

**Example:**
```
GET /api/stats?year=2024&compareYear=2023
```

### `/api/weekly`
Get weekly trends data for multiple years.

**Query Parameters:**
- `years` (required) - Comma-separated list of years

**Example:**
```
GET /api/weekly?years=2024,2023
```

### `/api/years`
Get list of available years in the database.

**Example:**
```
GET /api/years
```

## Data Source

The application uses data from the [Oakland Open Data Portal](https://data.oaklandca.gov/), specifically the [Service requests received by the Oakland Call Center (OAK 311)](https://data.oaklandca.gov/dataset/quth-gb8e) dataset.

- **Dataset ID**: `quth-gb8e`
- **API Base URL**: `https://data.oaklandca.gov/resource/quth-gb8e.json`
- **Request Category**: `ILLDUMP` (Illegal Dumping)

For detailed API documentation, see [docs/OAKLAND_311_API.md](docs/OAKLAND_311_API.md).

## Database

The application uses SQLite with the following tables:

- **requests**: Stores illegal dumping request data
- **cache_metadata**: Stores API response cache metadata

The database is automatically created on first run. Schema is defined in `src/db/schema.ts`.

## Testing

Tests are located in `src/lib/__tests__/`. Run tests with:

```bash
bun run test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure all tests pass and linting is clean
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Data provided by the [City of Oakland](https://www.oaklandca.gov/)
- Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), and [Leaflet](https://leafletjs.com/)
