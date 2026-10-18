"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Parámetros de URL que no deben llegar a las estadísticas (el código de invitación)
const PRIVATE_PARAMS = ["codigo", "code"];

function scrub(url: string): string {
  const u = new URL(url);
  PRIVATE_PARAMS.forEach((p) => u.searchParams.delete(p));
  return u.toString();
}

// Estadísticas de Vercel (Web Analytics + Speed Insights). Sin cookies.
// Solo envían datos cuando la web está desplegada en Vercel con ellas activadas en el panel.
export default function Telemetry() {
  return (
    <>
      <Analytics beforeSend={(event) => ({ ...event, url: scrub(event.url) })} />
      <SpeedInsights beforeSend={(data) => ({ ...data, url: scrub(data.url) })} />
    </>
  );
}
