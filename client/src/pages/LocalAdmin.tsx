import { BarChart3, Compass, MapPinned, Users } from "lucide-react";
import { Link } from "wouter";
import "./localWorkspace.css";

const tripKey = "globetrotter-local-workspace-trips";
export default function LocalAdmin() {
  const trips = JSON.parse(localStorage.getItem(tripKey) || "[]") as any[];
  const stops = trips.flatMap(trip => trip.stops || []);
  const cityCount = stops.reduce<Record<string, number>>((total, city) => ({ ...total, [city]: (total[city] || 0) + 1 }), {});
  const leaders = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const activities = trips.reduce((sum, trip) => sum + (trip.items?.length || 0), 0);
  return <main className="local-admin"><header><Link href="/local" className="text-link">← Back to local desk</Link><span className="local-logo"><span>✦</span> globetrotter</span></header><section><p className="eyebrow">LOCAL ADMIN · BROWSER DATA ONLY</p><h1>See what the<br/><em>notebook holds.</em></h1><div className="local-stat-row"><article><Users size={20}/><strong>{trips.length}</strong><span>trips created</span></article><article><MapPinned size={20}/><strong>{stops.length}</strong><span>stops mapped</span></article><article><Compass size={20}/><strong>{activities}</strong><span>activities planned</span></article></div><div className="local-admin-grid"><article><p className="eyebrow">POPULAR STOPS</p>{leaders.length ? leaders.map(([city, count]) => <div key={city}><span>{city}</span><b style={{ width: `${Math.max(18, count / leaders[0][1] * 100)}%` }}/><small>{count}</small></div>) : <p>Add a trip to begin the local analytics story.</p>}</article><article><p className="eyebrow">ENGAGEMENT SIGNAL</p><BarChart3 size={36}/><h2>{trips.length ? "Planning is moving." : "A clear desk awaits."}</h2><p>This browser-only analytics view updates from local trips, stops, and activities. The authenticated admin dashboard aggregates platform data.</p></article></div></section></main>;
}
