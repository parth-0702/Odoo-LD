import { ArrowLeft, CalendarDays, Copy, MapPinned, Route, Users } from "lucide-react";
import { Link, useParams } from "wouter";
import "./localWorkspace.css";

const tripKey = "globetrotter-local-workspace-trips";

export default function LocalPublicTrip() {
  const params = useParams<{ tripId: string }>();
  const trips = JSON.parse(localStorage.getItem(tripKey) || "[]") as any[];
  const trip = trips.find(item => item.id === params.tripId);
  if (!trip) return <main className="local-public"><Link href="/local" className="text-link"><ArrowLeft size={16}/> Back to local desk</Link><div className="local-empty"><MapPinned size={44}/><h2>This local trip<br/><em>is not here.</em></h2><p>Public local links only work in the browser where the trip was created.</p></div></main>;
  const copy = () => { const clone = { ...trip, id: `${Date.now()}-copy`, name: `${trip.name} (copy)` }; localStorage.setItem(tripKey, JSON.stringify([clone, ...trips])); window.location.href = "/local"; };
  return <main className="local-public"><header><Link href="/local" className="text-link"><ArrowLeft size={16}/> Back to local desk</Link><span className="local-logo"><span>✦</span> globetrotter</span></header><section><p className="eyebrow">LOCAL SHARE VIEW · READ ONLY</p><h1>{trip.name}<br/><em>in a few good lines.</em></h1><div className="local-public-card"><div><Route size={28}/><p>{trip.stops.join(" → ")}</p><span><CalendarDays size={15}/>{trip.startDate} to {trip.endDate} · <Users size={15}/>{trip.travelers} travelers</span></div><button className="ink-button" onClick={copy}><Copy size={16}/> Copy trip to my desk</button></div><div className="local-public-grid"><article><p className="eyebrow">STOPS</p>{trip.stops.map((stop: string, index: number) => <span key={`${stop}-${index}`}><b>{index + 1}</b>{stop}</span>)}</article><article><p className="eyebrow">ITINERARY</p>{trip.items?.length ? trip.items.map((item: any) => <span key={item.id}>{item.time || "Any time"} · {item.title}</span>) : <span>The day remains open for a detour.</span>}</article><article><p className="eyebrow">WORKING BUDGET</p><strong>${Number(trip.budget).toLocaleString()}</strong><small>Costs stay private in local mode.</small></article></div></section></main>;
}
