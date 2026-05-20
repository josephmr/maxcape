import type { Handle } from "@sveltejs/kit";
import { countPlayers, countEvents } from "$lib/server/db";
import {
  httpRequestsTotal,
  httpRequestDuration,
  uniqueAccountsGauge,
  totalEventsGauge,
} from "$lib/server/metrics";

export const init = async () => {
  const [players, evts] = await Promise.all([countPlayers(), countEvents()]);
  uniqueAccountsGauge.set(players);
  totalEventsGauge.set(evts);
};

export const handle: Handle = async ({ event, resolve }) => {
  const start = performance.now();
  const response = await resolve(event);
  const durationMs = performance.now() - start;
  const route = event.route.id ?? event.url.pathname;

  if (route !== "/metrics") {
    const labels = {
      method: event.request.method,
      route,
      status: String(response.status),
    };
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationMs / 1000);
  }

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      method: event.request.method,
      route,
      path: event.url.pathname,
      status: response.status,
      ms: Math.round(durationMs),
      ...event.locals.logExtra,
    }),
  );

  return response;
};
