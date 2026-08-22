import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Activity, ArrowLeft, BarChart3, Check, Compass, LoaderCircle, MapPinned, Plus, Route, Users } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import "./adminDashboard.css";

function DestinationManager() {
  const utils = trpc.useUtils();
  const [expanded, setExpanded] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("culture");
  const destinations = trpc.admin.destinations.useQuery();
  const addDestination = trpc.admin.createDestination.useMutation({ onSuccess: () => { utils.admin.destinations.invalidate(); utils.admin.metrics.invalidate(); setCity(""); setCountry(""); } });
  const addActivity = trpc.admin.createActivity.useMutation({ onSuccess: () => utils.admin.metrics.invalidate() });
  const firstDestination = destinations.data?.[0];
  return <section className="admin-manager"><button className="ink-button" onClick={() => setExpanded(!expanded)}><Plus size={16}/>{expanded ? "Close content desk" : "Manage destinations"}</button>{expanded && <div className="admin-manager-body"><div className="admin-form"><p className="eyebrow">ADD A DESTINATION</p><label>City<input value={city} onChange={event => setCity(event.target.value)} placeholder="e.g. Valparaíso" /></label><label>Country<input value={country} onChange={event => setCountry(event.target.value)} placeholder="e.g. Chile" /></label><div className="admin-form-grid"><label>Latitude<input type="number" value={latitude} onChange={event => setLatitude(Number(event.target.value))} /></label><label>Longitude<input type="number" value={longitude} onChange={event => setLongitude(Number(event.target.value))} /></label></div><button className="outline-button" disabled={!city || !country || addDestination.isPending} onClick={() => addDestination.mutate({ city, country, latitude, longitude })}>{addDestination.isPending ? <LoaderCircle className="spin" size={15}/> : <Check size={15}/>} Save destination</button></div><div className="admin-form"><p className="eyebrow">ADD AN ACTIVITY</p><label>For {firstDestination ? `${firstDestination.city}, ${firstDestination.country}` : "a destination"}<input value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Street food crawl" /></label><label>Category<select value={category} onChange={event => setCategory(event.target.value)}><option value="culture">Culture</option><option value="food">Food</option><option value="outdoors">Outdoors</option><option value="wellness">Wellness</option></select></label><button className="outline-button" disabled={!firstDestination || !title || addActivity.isPending} onClick={() => firstDestination && addActivity.mutate({ destinationId: firstDestination.id, title, category, estimatedCost: 0 })}>{addActivity.isPending ? <LoaderCircle className="spin" size={15}/> : <Check size={15}/>} Save activity</button></div><div className="admin-destination-list">{destinations.data?.length ? destinations.data.map(destination => <span key={destination.id}><MapPinned size={13}/>{destination.city}, {destination.country}</span>) : <p>No destinations yet. Add the first field note above.</p>}</div></div>}</section>;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const metrics = trpc.admin.metrics.useQuery(undefined, { enabled: user?.role === "admin" });
  if (loading) return <main className="admin-loading"><LoaderCircle className="spin"/><p>Opening the operations desk…</p></main>;
  if (user?.role !== "admin") return <main className="admin-locked"><Link href="/app" className="text-link"><ArrowLeft size={16}/> Travel desk</Link><MapPinned size={39}/><h1>This desk is<br/><em>for map keepers.</em></h1><p>Only GlobeTrotter administrators can manage destination content and platform signals.</p></main>;
  return <DashboardLayout><section className="admin-desk"><div className="admin-heading"><div><p className="eyebrow">GLOBETROTTER OPERATIONS</p><h1>Keep the world<br/><em>well mapped.</em></h1></div><Link href="/app" className="outline-button">Traveler view <ArrowLeft size={15}/></Link></div>{metrics.isLoading ? <div className="admin-metrics-loading"><LoaderCircle className="spin"/> Gathering platform signals…</div> : <><div className="admin-metric-grid">{[{ label: "Travelers", value: metrics.data?.users ?? 0, icon: Users, color: "sun" }, { label: "Trips", value: metrics.data?.trips ?? 0, icon: Route, color: "sea" }, { label: "Destinations", value: metrics.data?.destinations ?? 0, icon: MapPinned, color: "red" }, { label: "Activities", value: metrics.data?.activities ?? 0, icon: Activity, color: "ink" }].map(metric => { const Icon = metric.icon; return <article key={metric.label} className={`admin-metric ${metric.color}`}><Icon size={21}/><span>{metric.label}</span><strong>{metric.value.toLocaleString()}</strong><small>Current platform total</small></article>; })}</div><div className="admin-bottom-grid"><section className="admin-panel"><div><p className="eyebrow">TRIP PULSE</p><h2>More routes, <em>more stories.</em></h2></div><div className="admin-pulse"><span>Public trips</span><b>{metrics.data?.publicTrips ?? 0}</b><i style={{ width: `${Math.min(100, (metrics.data?.publicTrips ?? 0) * 12 + 10)}%` }} /></div><div className="admin-pulse"><span>Average working budget</span><b>${Math.round(metrics.data?.averageBudget ?? 0).toLocaleString()}</b><i className="sea" style={{ width: `${Math.min(100, (metrics.data?.averageBudget ?? 0) / 35)}%` }} /></div></section><section className="admin-note"><BarChart3 size={25}/><p className="eyebrow">CONTENT NOTE</p><h3>Shape the next<br/><em>good detour.</em></h3><p>Use the operations tools to keep destination entries and activity ideas fresh for travelers.</p><DestinationManager /></section></div></>}</section></DashboardLayout>;
}
