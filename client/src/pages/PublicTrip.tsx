import { useAuth } from "@/_core/hooks/useAuth";
import "./publicTrip.css";
import { MapView } from "@/components/Map";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CalendarDays, Copy, LoaderCircle, MapPinned, Route, Sparkles, TrainFront, Users } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { useRef } from "react";

function SharedRouteMap({ stops }: { stops: any[] }) {
  const drawRoute = (map: google.maps.Map) => {
    if (!stops.length) return;
    const bounds = new google.maps.LatLngBounds();
    const points = stops.map((stop, index) => {
      const position = { lat: Number(stop.latitude), lng: Number(stop.longitude) };
      bounds.extend(position);
      new google.maps.Marker({ map, position, label: { text: String(index + 1), color: "#fffdf7", fontWeight: "700" }, title: stop.city });
      return position;
    });
    new google.maps.Polyline({ map, path: points, strokeColor: "#d9513d", strokeOpacity: 0.8, strokeWeight: 3, icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }] });
    if (points.length > 1) map.fitBounds(bounds, 52);
  };
  return <MapView className="public-map" initialCenter={{ lat: 40.4168, lng: -3.7038 }} initialZoom={4} onMapReady={drawRoute} />;
}

export default function PublicTrip() {
  const [, params] = useRoute("/share/:shareCode");
  const shareCode = params?.shareCode ?? "";
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const tripQuery = trpc.trip.publicTrip.useQuery({ shareCode }, { enabled: Boolean(shareCode) });
  const copyTrip = trpc.trip.copyPublic.useMutation({ onSuccess: ({ tripId }) => setLocation(`/app?trip=${tripId}`) });
  const copy = () => isAuthenticated ? copyTrip.mutate({ shareCode }) : startLogin();
  if (tripQuery.isLoading) return <main className="public-loading"><LoaderCircle className="spin" size={30}/><p>Unfolding this field note…</p></main>;
  if (!tripQuery.data) return <main className="public-missing"><Link href="/" className="text-link"><ArrowLeft size={16}/> Back to GlobeTrotter</Link><MapPinned size={38}/><h1>That field note<br/><em>got misplaced.</em></h1><p>This public trip is no longer available, but a whole world of routes is waiting.</p><Link href="/" className="ink-button">Find a new route</Link></main>;
  const { trip, stops, itinerary, expenses } = tripQuery.data;
  const total = expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount), 0);
  return <main className="public-page"><header className="public-header"><Link href="/" className="logo-mark"><span className="logo-orbit">✦</span><span>globetrotter</span></Link><button className="ink-button small" onClick={copy} disabled={copyTrip.isPending}>{copyTrip.isPending ? <LoaderCircle className="spin" size={16}/> : <Copy size={16}/>} {isAuthenticated ? "Copy this trip" : "Sign in to copy"}</button></header><section className="public-hero"><div className="public-kicker"><span>PUBLIC FIELD NOTE</span><i/> <span>{trip.startDate.toLocaleDateString("en", { month: "short", day: "numeric" })} — {trip.endDate.toLocaleDateString("en", { month: "short", day: "numeric" })}</span></div><h1>{trip.name}</h1><p>{trip.description || "A route of good stops, long meals, and small surprises."}</p><div className="public-stats"><span><Users size={15}/>{trip.travelers} travelers</span><span><Route size={15}/>{stops.length} places</span><span><CalendarDays size={15}/>{itinerary.length} pins</span></div></section><section className="public-route"><div className="route-copy"><p className="eyebrow">THE ROUGH LINE</p><h2>This is the <em>way through.</em></h2><div className="public-stop-list">{stops.map((stop: any, index: number) => <div key={stop.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{stop.city}</strong><small>{stop.country}</small></div>)}</div></div><div className="public-map-wrap"><SharedRouteMap stops={stops}/></div></section><section className="public-itinerary"><div><p className="eyebrow">THE TRIP NOTEBOOK</p><h2>Moments worth<br/><em>keeping close.</em></h2></div><div className="public-items">{itinerary.length ? itinerary.map((item: any) => <article key={item.id}><span>{item.startTime || "—"}</span><i>{item.type === "transport" ? <TrainFront size={16}/> : <Sparkles size={16}/>}</i><div><strong>{item.title}</strong><p>{item.notes || "A thoughtful stop on the route."}</p></div></article>) : <div className="public-empty"><Sparkles size={25}/><strong>The itinerary is still in soft pencil.</strong><p>The route is shared; the day-by-day details are still to come.</p></div>}</div></section><section className="public-callout"><div><p className="eyebrow">MAKE IT YOUR OWN</p><h2>Take the route.<br/><em>Leave your mark.</em></h2><p>Copy this field note into your own travel desk, then swap, stretch, and make it yours.</p></div><button className="ink-button large" onClick={copy} disabled={copyTrip.isPending}>{copyTrip.isPending ? <LoaderCircle className="spin" size={17}/> : <Copy size={17}/>} Copy this trip</button></section><footer className="public-footer"><Link href="/" className="logo-mark"><span className="logo-orbit">✦</span><span>globetrotter</span></Link><span>Travel planning for people who still like a little mystery.</span></footer></main>;
}
