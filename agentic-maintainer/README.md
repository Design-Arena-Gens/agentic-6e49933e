## Agentic Maintainer

Agentic Maintainer is a Next.js application that acts as an always-on website maintenance companion. Paste any public URL and the agent will run a live audit to surface issues across uptime, performance, accessibility, and SEO health signals. Each run produces prioritized tasks, actionable insights, and a lightweight local history of the five most recent scans.

### Features

- HTTP availability, latency, and content-depth checks in a single click
- Accessibility insights (missing alt text) and SEO recommendations (title/meta coverage)
- Sampled internal link validation with broken-link detection
- Auto-generated maintenance queue with priority levels and completion tracking
- Local audit history to compare site health across recent runs

### Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) and trigger an audit to explore the agent dashboard. The UI uses Tailwind CSS and Geist fonts for a dark, data-rich control center.

### Deployment

The project is ready for Vercel deployment. Build and deploy with:

```bash
npm run build
npm run start
```

Or deploy directly using the provided CLI command:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-6e49933e
```
