import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

export const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new Counter({
	name: 'http_requests_total',
	help: 'Total HTTP requests',
	labelNames: ['method', 'route', 'status'] as const,
	registers: [registry],
});

export const httpRequestDuration = new Histogram({
	name: 'http_request_duration_seconds',
	help: 'HTTP request duration in seconds',
	labelNames: ['method', 'route', 'status'] as const,
	buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
	registers: [registry],
});

export const eventsIngestedTotal = new Counter({
	name: 'events_ingested_total',
	help: 'Total game events ingested, by event type',
	labelNames: ['event_type'] as const,
	registers: [registry],
});

export const uniqueAccountsGauge = new Gauge({
	name: 'unique_accounts_total',
	help: 'Number of unique player accounts tracked',
	registers: [registry],
});
