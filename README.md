# Post-Deployment 404 & Link Validation Crawler

A post-deployment website validation tool built with:

- Node.js
- Crawlee
- Playwright
- PostgreSQL
- Fastify
- Docker

The crawler validates websites after deployment and detects:

- hard 404s
- soft 404s
- broken internal links
- failed crawl pages
- broken navigation references

It crawls entire sites, stores crawl data in PostgreSQL, and exposes results through a dashboard and API.

---

# Features

## Full-Site Crawling

- same-domain crawling
- JavaScript rendering with Playwright
- SSR + SPA compatible
- retry handling
- failed request tracking
- request deduplication
- crawl session tracking

---

## 404 Detection

### Hard 404 Detection

Detects:

- HTTP 404
- HTTP 410

---

### Soft 404 Detection

Detects:

- fake 404 pages returning 200
- "page not found" templates
- thin empty pages
- redirect-to-home fake pages

---

## Broken Link Tracing

Stores internal link relationships:

```text
Page A
   →
Broken Page B
````

Allows identifying:

* which pages contain broken links
* globally broken navigation links
* affected page counts

---

## Dashboard

Dashboard provides:

* latest crawl session
* total crawled URLs
* hard 404 count
* soft 404 count
* broken URL reporting
* affected page counts
* crawl failure visibility

---

## API

Endpoints:

```text
/results
/stats
/latest-session
/broken-links
/health
```

---

# Architecture

```text
PlaywrightCrawler
        ↓
Extract page data
        ↓
404 classification
        ↓
Store crawl results
        ↓
Store link graph
        ↓
Fastify API
        ↓
Dashboard
```

---

# Project Structure

```text
.
├── dashboard/
├── runtime_storage/
├── scripts/
├── src/
│   ├── api/
│   ├── classifiers/
│   ├── crawler/
│   ├── storage/
│   └── utils/
├── Dockerfile
├── docker-compose.yml
├── init.sql
├── package.json
└── README.md
```

---

# Requirements

* Docker
* Docker Compose

OR

* Node.js 22+
* PostgreSQL 16+

---

# Quick Start (Docker)

## 1. Clone

```bash
git clone <repo-url>

cd crawler
```

---

## 2. Configure Target Site

Inside:

```yaml
docker-compose.yml
```

update:

```yaml
SITE_URL: https://example.com
```

---

## 3. Start Everything

```bash
docker compose up --build
```

This starts:

* PostgreSQL
* crawler
* API server
* dashboard server

---

# Dashboard

```text
http://localhost:8080
```

---

# API

```text
http://localhost:3000/results
```

---

# Database Initialization

Database schema auto-creates using:

```text
init.sql
```

No manual SQL setup required.

---

# Reset Database

To completely reset:

```bash
docker compose down -v
```

Then:

```bash
docker compose up --build
```

---

# Local Development

## Install Dependencies

```bash
npm install
```

---

## Start API

```bash
node src/api/server.js
```

---

## Start Dashboard

```bash
cd dashboard

python3 -m http.server 8080
```

---

## Start Crawler

```bash
npm run dev
```

---

# Current Limitations

* single active crawl target
* no authentication
* no crawl scheduling
* no distributed workers
* limited URL normalization
* no dashboard pagination
* no resumable crawl state

---

# Future Improvements

* sitemap validation
* redirect chain detection
* canonical validation
* orphan page detection
* crawl depth tracking
* screenshot capture
* multi-site crawling
* Redis-backed queues
* crawl scheduling
* real-time crawl monitoring

---

# Why This Exists

After deployments, migrations, URL rewrites, CMS changes, or infrastructure updates, websites often end up with:

* broken internal links
* orphaned pages
* missing routes
* soft 404s
* failed navigations

This tool helps validate entire websites automatically after deployment instead of manually checking pages one by one.

It is designed as an internal operational validation tool for developers, DevOps engineers, and QA workflows.

---

# License

MIT


