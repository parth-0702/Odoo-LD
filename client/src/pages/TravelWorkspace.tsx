import { useAuth } from "@/_core/hooks/useAuth";
import { MapView } from "@/components/Map";
import "./workspaceExtra.css";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { calculateBudget, expenseCategories, isValidTripDates, type ExpenseCategory } from "@shared/tripMath";
import { handoffSmartDraft, smartDraftTripIdFromSearch } from "@shared/smartDraft";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Compass,
  Copy,
  Dices,
  GripVertical,
  Heart,
  LayoutDashboard,
  LoaderCircle,
  MapPinned,
  MoreHorizontal,
  Navigation,
  NotebookPen,
  Pencil,
  Plus,
  Route,
  Search,
  Send,
  Settings,
  Share2,
  Sparkles,
  Ticket,
  TrainFront,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import SmartDraftPane from "./SmartDraftPane";
import "./darkTravelConsole.css";

const inspirations = [
  { city: "Lisbon", country: "Portugal", detail: "Sun-baked tiles + night trains", image: "/manus-storage/lisbon_38ffc496.jpg", color: "#f4b63f", latitude: 38.7223, longitude: -9.1393 },
  { city: "Kyoto", country: "Japan", detail: "Lantern streets + slow mornings", image: "/manus-storage/kyoto_a219d2f0.jpg", color: "#78af9a", latitude: 35.0116, longitude: 135.7681 },
  { city: "Marrakech", country: "Morocco", detail: "Courtyards + spice markets", image: "/manus-storage/marrakech_1249b016.jpeg", color: "#d96744", latitude: 31.6295, longitude: -7.9811 },
];

const sampleStops = [
  { city: "Lisbon", country: "Portugal", latitude: 38.7223, longitude: -9.1393 },
  { city: "Porto", country: "Portugal", latitude: 41.1579, longitude: -8.6291 },
  { city: "Madrid", country: "Spain", latitude: 40.4168, longitude: -3.7038 },
];

function formatTripDate(value: unknown) {
  if (!value) return "Dates to be decided";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

type View = "overview" | "itinerary" | "budget" | "map" | "discover" | "smart" | "share" | "settings" | "profile";

function PaperLogo() {
  return (
    <Link href="/" className="logo-mark" aria-label="GlobeTrotter home">
      <span className="logo-orbit">✦</span>
      <span>globetrotter</span>
    </Link>
  );
}

function WorkspaceNav({ view, setView, compact = false }: { view: View; setView: (view: View) => void; compact?: boolean }) {
  const items: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "My desk", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: Users },
    { id: "discover", label: "Discover", icon: Compass },
    { id: "smart", label: "Smart draft", icon: Dices },
    { id: "itinerary", label: "Itinerary", icon: NotebookPen },
    { id: "map", label: "Route map", icon: MapPinned },
    { id: "budget", label: "Budget", icon: CircleDollarSign },
    { id: "share", label: "Share", icon: Share2 },
    { id: "settings", label: "Preferences", icon: Settings },
  ];
  return (
    <nav className={compact ? "mobile-desk-nav" : "desk-nav"} aria-label="Planning workspace navigation">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <button className={view === item.id ? "nav-item is-active" : "nav-item"} key={item.id} onClick={() => setView(item.id)}>
            <Icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

type StopDraft = { city: string; country: string; latitude: number; longitude: number };

function MapStopFinder({ stops, setStops }: { stops: StopDraft[]; setStops: (stops: StopDraft[]) => void }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Search for a city, neighbourhood, or landmark to add a stop.");
  const [error, setError] = useState(false);
  const locate = () => {
    if (!query.trim()) return;
    if (!mapRef.current || !window.google) { setStatus("The map is still loading. Please try again in a moment."); setError(true); return; }
    setStatus("Finding a pin for your route…");
    setError(false);
    new google.maps.Geocoder().geocode({ address: query }, (results, resultStatus) => {
      const result = results?.[0];
      if (resultStatus !== "OK" || !result) { setStatus("No matching place yet. Try a city and country together."); setError(true); return; }
      const location = result.geometry.location;
      const component = (kind: string) => result.address_components.find(part => part.types.includes(kind))?.long_name;
      const city = component("locality") || component("postal_town") || component("administrative_area_level_1") || result.formatted_address.split(",")[0];
      const country = component("country") || "Selected destination";
      const candidate = { city, country, latitude: location.lat(), longitude: location.lng() };
      mapRef.current?.setCenter(location);
      mapRef.current?.setZoom(10);
      new google.maps.Marker({ map: mapRef.current!, position: location, title: `${city}, ${country}` });
      if (stops.some(stop => stop.city.toLowerCase() === city.toLowerCase() && stop.country.toLowerCase() === country.toLowerCase())) { setStatus(`${city} is already on this route.`); return; }
      setStops([...stops, candidate]);
      setStatus(`${city} is now penciled into your route.`);
      setQuery("");
    });
  };
  return <div className="map-stop-finder"><p className="picker-caption">Search the map to choose a place, then remove or reorder it later from your itinerary desk.</p><div className="map-search-row"><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); locate(); } }} placeholder="e.g. Porto, Portugal" aria-label="Search for a travel destination"/><button type="button" onClick={locate}><Search size={14}/> Find place</button></div><MapView className="picker-map" initialCenter={{ lat: 39.3999, lng: -8.2245 }} initialZoom={5} onMapReady={map => { mapRef.current = map; }} /><p className={error ? "map-picker-status error" : "map-picker-status"}>{status}</p><div className="selected-stop-list">{stops.map((stop, index) => <div key={`${stop.city}-${stop.longitude}`} className="stop-choice"><span>{String(index + 1).padStart(2, "0")}</span><MapPinned size={18}/><div><strong>{stop.city}</strong><small>{stop.country}</small></div><button type="button" onClick={() => setStops(stops.filter((_, stopIndex) => stopIndex !== index))} aria-label={`Remove ${stop.city}`}><X size={15}/></button></div>)}</div></div>;
}

function NewTripSheet({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const createTrip = trpc.trip.create.useMutation({ onSuccess: () => { utils.trip.list.invalidate(); onClose(); } });
  const [step, setStep] = useState(1);
  const [stops, setStops] = useState<StopDraft[]>(sampleStops);
  const [form, setForm] = useState({ name: "A small grand tour", startDate: "2026-05-10", endDate: "2026-05-16", travelers: 2, budget: 2200, preferences: "Culture, slow food, scenic train rides", visibility: "private" as "private" | "friends" | "public" });
  const validDates = isValidTripDates(form.startDate, form.endDate);
  const steps = ["The spark", "Dates", "Travel style", "Stops"];
  const finish = () => createTrip.mutate({ ...form, stops, description: "A travel sketch in progress", currency: "USD" });
  return (
    <div className="modal-wash" role="dialog" aria-modal="true" aria-label="Start a new trip">
      <section className="trip-sheet">
        <header className="sheet-head">
          <div><p className="eyebrow">NEW FIELD NOTE</p><h2>Start with a <em>spark.</em></h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </header>
        <div className="wizard-progress" aria-label={`Step ${step} of 4`}>
          {steps.map((label, i) => <div key={label} className={i + 1 <= step ? "wizard-step is-done" : "wizard-step"}><span>{i + 1}</span><small>{label}</small></div>)}
        </div>
        <div className="sheet-body">
          {step === 1 && <div className="form-stage"><div className="scribble-label">01 — Give this adventure a name</div><label>Trip name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus /></label><label>Note to your future self<textarea value={"A loose collection of places, tastes, and beautiful detours."} readOnly /></label></div>}
          {step === 2 && <div className="form-stage form-grid"><label>Leave on<input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></label><label>Return on<input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></label><label>Travelers<input type="number" min="1" value={form.travelers} onChange={e => setForm({ ...form, travelers: Number(e.target.value) })} /></label><label>Working budget (USD)<input type="number" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} /></label>{!validDates && <p className="field-error">Your return date needs to follow your departure.</p>}</div>}
          {step === 3 && <div className="form-stage"><div className="scribble-label">03 — What kind of wandering sounds right?</div><div className="preference-cloud">{["Slow mornings", "Food trails", "Museums", "Local design", "Outdoors", "Night trains"].map(tag => <button type="button" className={form.preferences.includes(tag) ? "preference-chip selected" : "preference-chip"} key={tag} onClick={() => setForm({ ...form, preferences: form.preferences.includes(tag) ? form.preferences.replace(`${tag}, `, "").replace(tag, "") : `${form.preferences}, ${tag}` })}>{tag}</button>)}</div><label>Travel notes<textarea value={form.preferences} onChange={e => setForm({ ...form, preferences: e.target.value })} /></label></div>}
          {step === 4 && <div className="form-stage"><div className="scribble-label">04 — Draft the route</div><MapStopFinder stops={stops} setStops={setStops}/><p className="helper-note">Your first blank itinerary will include these edit-ready stops. Add or remove places from the trip workspace later.</p></div>}
        </div>
        <footer className="sheet-footer"><button className="text-button" onClick={() => step === 1 ? onClose() : setStep(step - 1)}>{step === 1 ? "Save for later" : "Back"}</button>{step < 4 ? <button className="ink-button" disabled={(step === 1 && !form.name.trim()) || (step === 2 && !validDates)} onClick={() => setStep(step + 1)}>Keep going <ArrowRight size={17}/></button> : <button className="ink-button" onClick={finish} disabled={createTrip.isPending || stops.length === 0}>{createTrip.isPending ? <LoaderCircle className="spin" size={17}/> : <Sparkles size={17}/>} Create my trip</button>}</footer>
      </section>
    </div>
  );
}

function RouteSketch({ stops = sampleStops }: { stops?: { city: string; latitude: number | string; longitude: number | string }[] }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const renderRoute = (map: google.maps.Map) => {
    mapRef.current = map;
    const bounds = new google.maps.LatLngBounds();
    const route = stops.map((stop, index) => {
      const point = { lat: Number(stop.latitude), lng: Number(stop.longitude) };
      bounds.extend(point);
      new google.maps.Marker({ map, position: point, label: { text: String(index + 1), color: "#fffdf7", fontWeight: "700" }, title: stop.city });
      return point;
    });
    new google.maps.Polyline({ map, path: route, strokeColor: "#20211e", strokeOpacity: 0.78, strokeWeight: 3, icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }] });
    if (stops.length > 1) map.fitBounds(bounds, 56);
  };
  return <MapView className="travel-map" initialCenter={{ lat: 40.4168, lng: -3.7038 }} initialZoom={4} onMapReady={renderRoute} />;
}

function EmptyTripState({ onPlan }: { onPlan: () => void }) {
  return <section className="empty-trip"><div className="empty-orbit"><MapPinned size={42}/><span>✦</span></div><p className="eyebrow">YOUR DESK IS CLEAR</p><h2>A blank page is <em>an invitation.</em></h2><p>Choose a few places, a rhythm, and a rough budget. We will help you turn it into a route.</p><button className="ink-button" onClick={onPlan}><Plus size={18}/> Sketch a new trip</button></section>;
}

function ItineraryPane({ tripId, workspace }: { tripId: number; workspace: any }) {
  const utils = trpc.useUtils();
  const [activeDay, setActiveDay] = useState("Day 01");
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newType, setNewType] = useState<"activity" | "transport" | "stay">("activity");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [timelineNotice, setTimelineNotice] = useState("");
  const addItem = trpc.trip.addItinerary.useMutation({ onSuccess: () => utils.trip.workspace.invalidate({ tripId }) });
  const deleteItem = trpc.trip.deleteItinerary.useMutation({ onSuccess: () => utils.trip.workspace.invalidate({ tripId }) });
  const updateItem = trpc.trip.updateItinerary.useMutation({ onSuccess: () => utils.trip.workspace.invalidate({ tripId }) });
  const reorderItems = trpc.trip.reorderItinerary.useMutation({ onSuccess: () => utils.trip.workspace.invalidate({ tripId }) });
  const items = workspace?.itinerary ?? [];
  const days = ["Day 01", "Day 02", "Day 03", "Day 04"];
  const editItem = (item: any) => {
    const title = window.prompt("Rename this itinerary entry", item.title);
    if (title?.trim() && title.trim() !== item.title) updateItem.mutate({ tripId, itemId: item.id, title: title.trim() });
  };
  const reorderTo = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) return;
    const next = [...items];
    const from = next.findIndex((item: any) => item.id === draggingId);
    const to = next.findIndex((item: any) => item.id === targetId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    reorderItems.mutate({ tripId, orderedItemIds: next.map((item: any) => item.id) }, { onSuccess: () => setTimelineNotice("Timeline order saved."), onError: () => setTimelineNotice("The timeline order could not be saved. Please try again.") });
    setDraggingId(null);
  };
  const timelinePending = addItem.isPending || updateItem.isPending || deleteItem.isPending || reorderItems.isPending;
  return <><div className={timelinePending ? "timeline-interactions-locked" : ""} aria-busy={timelinePending}><TimelineBoard tripId={tripId} workspace={workspace} items={items} onAdd={(input) => addItem.mutate(input, { onSuccess: () => setTimelineNotice("Added to your day timeline."), onError: () => setTimelineNotice("That entry could not be added. Please try again.") })} onUpdate={(input) => updateItem.mutate(input, { onSuccess: () => setTimelineNotice("Timeline entry updated."), onError: () => setTimelineNotice("That change could not be saved. Please try again.") })} onDelete={(itemId) => deleteItem.mutate({ tripId, itemId }, { onSuccess: () => setTimelineNotice("Entry removed from your timeline."), onError: () => setTimelineNotice("That entry could not be removed. Please try again.") })} onReorder={reorderTo} /></div><TimelineEntryEditor tripId={tripId} items={items} pending={timelinePending} notice={timelineNotice} onUpdate={(input) => updateItem.mutate(input, { onSuccess: () => setTimelineNotice("Timeline entry updated."), onError: () => setTimelineNotice("That change could not be saved. Please try again.") })} /></>;
  return <div className="panel-grid itinerary-layout"><section className="paper-panel itinerary-panel"><div className="panel-heading"><div><p className="eyebrow">THE DAILY EDIT</p><h2>Give each day a <em>little rhythm.</em></h2></div><button className="outline-button"><CalendarDays size={16}/> Timeline view</button></div><div className="day-tabs">{days.map((day, index) => <button key={day} onClick={() => setActiveDay(day)} className={activeDay === day ? "day-tab active" : "day-tab"}><span>{day}</span><small>{index === 0 ? "Lisbon" : index === 1 ? "Porto" : "Open"}</small></button>)}</div><div className="timeline" aria-label="Day itinerary timeline">{items.length ? items.map((item: any, index: number) => <article className={draggingId === item.id ? "itinerary-entry is-dragging" : "itinerary-entry"} key={item.id} draggable onDragStart={() => setDraggingId(item.id)} onDragOver={event => event.preventDefault()} onDrop={() => reorderTo(item.id)} onDragEnd={() => setDraggingId(null)}><div className="timeline-time">{item.startTime || "Anytime"}</div><span className={`entry-type ${item.type}`}>{item.type === "transport" ? <TrainFront size={16}/> : item.type === "stay" ? <Ticket size={16}/> : <Sparkles size={16}/>}</span><div className="entry-copy"><strong>{item.title}</strong><p>{item.notes || "Add a note, reservation, or meeting point."}</p></div><button className="quiet-icon" type="button" onClick={() => editItem(item)} aria-label="Edit itinerary item"><Pencil size={15}/></button><button className="drag-handle" type="button" aria-label="Drag to reorder item"><GripVertical size={18}/></button><button className="quiet-icon" onClick={() => deleteItem.mutate({ tripId, itemId: item.id })} aria-label="Delete item"><Trash2 size={16}/></button>{index !== items.length - 1 && <i className="timeline-line" />}</article>) : <div className="timeline-empty"><NotebookPen size={26}/><strong>The day is beautifully open.</strong><p>Add a first pin to start shaping the story.</p></div>}</div><form className="quick-add" onSubmit={e => { e.preventDefault(); if (newTitle.trim()) { addItem.mutate({ tripId, title: newTitle, startTime: newTime, type: newType, notes: "" }); setNewTitle(""); } }}><input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Add an activity, train, stay…" aria-label="New itinerary item"/><select value={newType} onChange={event => setNewType(event.target.value as "activity" | "transport" | "stay")} aria-label="Entry type"><option value="activity">Activity</option><option value="transport">Transport</option><option value="stay">Stay</option></select><input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} aria-label="Time"/><button className="round-add" aria-label="Add itinerary entry" disabled={addItem.isPending}><Plus size={19}/></button></form></section><aside className="itinerary-aside"><section className="torn-note"><span className="pin-dot"/><p className="eyebrow">THE FLOW</p><h3>Less checking boxes.<br/><em>More room to wander.</em></h3><p>Drag the grip to rethink the order, or use the menu to duplicate a moment.</p></section><section className="paper-panel mini-stops"><p className="eyebrow">ROUTE AT A GLANCE</p>{(workspace?.stops?.length ? workspace.stops : sampleStops).map((stop: any, i: number) => <div className="mini-stop" key={`${stop.city}-${i}`}><span>{i + 1}</span><div><strong>{stop.city}</strong><small>{stop.country || "Portugal"}</small></div><MoreHorizontal size={17}/></div>)}</section></aside></div>;
}

type TimelineChange = { tripId: number; itemId: number; title?: string; startTime?: string; itineraryDate?: string; type?: "activity" | "transport" | "stay"; notes?: string };
type TimelineCreate = { tripId: number; title: string; startTime?: string; itineraryDate?: string; type: "activity" | "transport" | "stay"; notes?: string };

function TimelineBoard({ tripId, workspace, items, onAdd, onUpdate, onDelete, onReorder }: { tripId: number; workspace: any; items: any[]; onAdd: (input: TimelineCreate) => void; onUpdate: (input: TimelineChange) => void; onDelete: (itemId: number) => void; onReorder: (itemId: number) => void }) {
  const formatDateKey = (value: unknown) => { const date = value instanceof Date ? value : new Date(String(value)); return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
  const timelineDates = useMemo(() => { const start = new Date(workspace?.trip?.startDate ?? Date.now()); const end = new Date(workspace?.trip?.endDate ?? start); const days: string[] = []; const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate()); const last = new Date(end.getFullYear(), end.getMonth(), end.getDate()); while (cursor <= last && days.length < 21) { days.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`); cursor.setDate(cursor.getDate() + 1); } return days.length ? days : [formatDateKey(new Date())]; }, [workspace?.trip?.startDate, workspace?.trip?.endDate]);
  const [activeDate, setActiveDate] = useState("");
  const [mode, setMode] = useState<"timeline" | "agenda">(() => new URLSearchParams(window.location.search).get("mode") === "agenda" ? "agenda" : "timeline");
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newType, setNewType] = useState<"activity" | "transport" | "stay">("activity");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  useEffect(() => { if (!activeDate || !timelineDates.includes(activeDate)) setActiveDate(timelineDates[0]); }, [activeDate, timelineDates]);
  const formattedDay = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
  const scheduledItems = items.filter(item => formatDateKey(item.itineraryDate) === activeDate || (!item.itineraryDate && activeDate === timelineDates[0])).sort((a, b) => String(a.startTime || "99:99").localeCompare(String(b.startTime || "99:99")));
  const saveItem = (item: any) => { const title = window.prompt("Edit timeline entry", item.title); if (title?.trim()) onUpdate({ tripId, itemId: item.id, title: title.trim() }); };
  return <section className="itinerary-timeline-board"><header className="timeline-board-head"><div><p className="eyebrow">THE DAILY EDIT</p><h2>Give each day a <em>little rhythm.</em></h2><p>Drag entries to reorder a day, or move a moment to another date.</p></div><div className="timeline-mode-switch"><button className={mode === "timeline" ? "is-active" : ""} onClick={() => setMode("timeline")}><CalendarDays size={15}/> Timeline</button><button className={mode === "agenda" ? "is-active" : ""} onClick={() => setMode("agenda")}><NotebookPen size={15}/> Agenda</button></div></header><div className="timeline-day-rail" role="tablist" aria-label="Itinerary days">{timelineDates.map((date, index) => <button key={date} role="tab" aria-selected={activeDate === date} className={activeDate === date ? "is-active" : ""} onClick={() => setActiveDate(date)}><span>DAY {String(index + 1).padStart(2, "0")}</span><strong>{formattedDay(date)}</strong><small>{workspace?.stops?.[index]?.city || "Open day"}</small></button>)}</div><div className={mode === "timeline" ? "timeline-stage" : "agenda-stage"}>{scheduledItems.length ? scheduledItems.map((item, index) => <article key={item.id} draggable onDragStart={() => setDraggingId(item.id)} onDragOver={event => event.preventDefault()} onDrop={() => { if (draggingId !== null && draggingId !== item.id) onReorder(item.id); setDraggingId(null); }} onDragEnd={() => setDraggingId(null)} className={draggingId === item.id ? "timeline-card is-dragging" : "timeline-card"}><time>{item.startTime || "Anytime"}</time><i>{item.type === "transport" ? <TrainFront size={16}/> : item.type === "stay" ? <Ticket size={16}/> : <Sparkles size={16}/>}</i><div><span>{item.type}</span><strong>{item.title}</strong><p>{item.notes || "Add a note, reservation, or meeting point."}</p></div><div className="timeline-card-actions"><select aria-label={`Move ${item.title} to another day`} value={formatDateKey(item.itineraryDate) || activeDate} onChange={event => onUpdate({ tripId, itemId: item.id, itineraryDate: event.target.value })}>{timelineDates.map((date, dayIndex) => <option key={date} value={date}>Day {dayIndex + 1} · {formattedDay(date)}</option>)}</select><button onClick={() => saveItem(item)} aria-label={`Edit ${item.title}`}><Pencil size={15}/></button><button onClick={() => onDelete(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={15}/></button></div>{index !== scheduledItems.length - 1 && <b className="timeline-spine"/>}</article>) : <div className="timeline-empty-state"><CalendarDays size={28}/><strong>This day is still open.</strong><p>Set a time, add a place, or leave a little room for a detour.</p></div>}</div><form className="timeline-composer" onSubmit={event => { event.preventDefault(); if (!newTitle.trim()) return; onAdd({ tripId, title: newTitle.trim(), startTime: newTime, itineraryDate: activeDate, type: newType, notes: "" }); setNewTitle(""); }}><label><span>What happens?</span><input value={newTitle} onChange={event => setNewTitle(event.target.value)} placeholder="Add a meal, train, stay, or activity…" /></label><label><span>Time</span><input type="time" value={newTime} onChange={event => setNewTime(event.target.value)} /></label><label><span>Kind</span><select value={newType} onChange={event => setNewType(event.target.value as "activity" | "transport" | "stay")}><option value="activity">Activity</option><option value="transport">Transport</option><option value="stay">Stay</option></select></label><button className="ink-button" type="submit"><Plus size={17}/> Add to Day {timelineDates.indexOf(activeDate) + 1}</button></form></section>;
}

function TimelineEntryEditor({ tripId, items, pending, notice, onUpdate }: { tripId: number; items: any[]; pending: boolean; notice: string; onUpdate: (input: TimelineChange) => void }) {
  const [selectedId, setSelectedId] = useState<number>(items[0]?.id ?? 0);
  const selected = items.find(item => item.id === selectedId) ?? items[0];
  const [draft, setDraft] = useState({ title: "", startTime: "", type: "activity" as "activity" | "transport" | "stay", notes: "" });
  useEffect(() => { if (!selected) return; setSelectedId(selected.id); setDraft({ title: selected.title || "", startTime: selected.startTime || "", type: selected.type || "activity", notes: selected.notes || "" }); }, [selected?.id]);
  if (!items.length) return <div className="timeline-feedback">Add a timeline entry to edit its details here.</div>;
  return <section className="timeline-entry-editor"><div><p className="eyebrow">ENTRY DETAILS</p><h3>Make the moment <em>specific.</em></h3><p>Adjust the time, kind, and notes without losing your place in the day.</p></div><form onSubmit={event => { event.preventDefault(); if (!selected) return; onUpdate({ tripId, itemId: selected.id, ...draft }); }}><label>Entry<select value={selected?.id ?? ""} onChange={event => setSelectedId(Number(event.target.value))}>{items.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>Title<input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })}/></label><label>Time<input type="time" value={draft.startTime} onChange={event => setDraft({ ...draft, startTime: event.target.value })}/></label><label>Kind<select value={draft.type} onChange={event => setDraft({ ...draft, type: event.target.value as "activity" | "transport" | "stay" })}><option value="activity">Activity</option><option value="transport">Transport</option><option value="stay">Stay</option></select></label><label className="entry-notes">Notes<textarea value={draft.notes} onChange={event => setDraft({ ...draft, notes: event.target.value })} placeholder="Reservation, meeting point, or a little reminder…"/></label><button className="ink-button" type="submit" disabled={pending}>{pending ? <LoaderCircle className="spin" size={17}/> : <Check size={17}/>} Save entry</button></form>{notice && <p className="timeline-feedback" role="status">{notice}</p>}</section>;
}

function BudgetPane({ tripId, workspace }: { tripId: number; workspace: any }) {
  const utils = trpc.useUtils();
  const [amount, setAmount] = useState(42);
  const [title, setTitle] = useState("Coffee + pastry stop");
  const [category, setCategory] = useState<ExpenseCategory>("meals");
  const [expenseError, setExpenseError] = useState("");
  const addExpense = trpc.trip.addExpense.useMutation({ onSuccess: () => { setExpenseError(""); utils.trip.workspace.invalidate({ tripId }); }, onError: () => setExpenseError("That cost could not be saved. Please try again.") });
  const numbers = calculateBudget(workspace?.expenses ?? [], workspace?.trip?.budget ?? 0);
  const submitExpense = () => {
    if (!title.trim() || !Number.isFinite(amount) || amount <= 0) { setExpenseError("Add a short description and an amount greater than zero."); return; }
    addExpense.mutate({ tripId, title: title.trim(), category, amount });
  };
  return <div className="panel-grid budget-layout"><section className="paper-panel budget-main"><div className="panel-heading"><div><p className="eyebrow">THE MONEY NOTE</p><h2>A plan with <em>breathing room.</em></h2></div><button className="outline-button"><Pencil size={16}/> Edit budget</button></div><div className="budget-hero"><div><small>Working budget</small><strong>${numbers.planned.toLocaleString()}</strong><span>{numbers.remaining >= 0 ? `$${numbers.remaining.toLocaleString()} still free for detours` : `$${Math.abs(numbers.remaining).toLocaleString()} past the plan`}</span></div><div className={numbers.isOverBudget ? "budget-ring over" : "budget-ring"}><b>{Math.min(100, Math.round((numbers.total / Math.max(numbers.planned, 1)) * 100))}%</b><small>mapped</small></div></div>{numbers.isOverBudget && <div className="budget-warning"><span>!</span><p><strong>Small nudge:</strong> you are above the working budget. Rework a stay or make room by shifting the meal plan.</p></div>}{numbers.total === 0 && <div className="budget-empty"><CircleDollarSign size={18}/><span>No costs captured yet — begin with a stay, a train, or the first coffee stop.</span></div>}<div className="category-bars">{expenseCategories.map((item, i) => { const value = numbers.byCategory[item.key]; const width = Math.min(100, (value / Math.max(numbers.planned, 1)) * 100); return <div className="category-row" key={item.key}><span>{String(i + 1).padStart(2, "0")}</span><strong>{item.label}</strong><div className="bar-track"><i style={{ width: `${width}%` }} /></div><b>${value.toLocaleString()}</b></div>; })}</div></section><aside className="expense-card"><div><p className="eyebrow">CAPTURE A COST</p><h3>One small <em>note at a time.</em></h3></div><label>What was it?<input value={title} onChange={e => setTitle(e.target.value)} /></label><label>Category<select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>{expenseCategories.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label><label>Amount<input type="number" min="0" value={amount} onChange={e => setAmount(Number(e.target.value))} /></label>{expenseError && <p className="expense-error">{expenseError}</p>}<button className="ink-button" onClick={submitExpense} disabled={addExpense.isPending}>{addExpense.isPending ? <LoaderCircle className="spin" size={17}/> : <Plus size={17}/>} Add expense</button><p className="helper-note">Expenses appear in the summary the moment you add them.</p></aside></div>;
}

function DiscoverPane({ onPlan }: { onPlan: () => void }) {
  const [query, setQuery] = useState("");
  const utils = trpc.useUtils();
  const favorites = trpc.favorite.list.useQuery();
  const toggleFavorite = trpc.favorite.toggle.useMutation({ onSuccess: () => utils.favorite.list.invalidate() });
  const matches = inspirations.filter(place => `${place.city} ${place.country}`.toLowerCase().includes(query.toLowerCase()));
  const isSaved = (place: typeof inspirations[number]) => favorites.data?.some(item => item.city === place.city && item.country === place.country);
  return <section className="discover-pane"><div className="discover-heading"><div><p className="eyebrow">OPEN THE ATLAS</p><h2>Follow a feeling, <em>not a formula.</em></h2></div><label className="search-field"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a city or kind of day" /></label></div>{favorites.data?.length ? <div className="saved-destination-strip"><span><Heart size={14} fill="currentColor"/> Your saved pins</span>{favorites.data.map(item => <button key={item.id} onClick={() => toggleFavorite.mutate({ city: item.city, country: item.country, latitude: Number(item.latitude), longitude: Number(item.longitude), coverImage: item.coverImage || undefined })}>{item.city} <X size={13}/></button>)}</div> : null}<div className="inspiration-grid">{matches.map((place, index) => <article className="inspiration-card" key={place.city} style={{ "--card-accent": place.color } as React.CSSProperties}><div className="image-wrap"><img src={place.image} alt={`${place.city}, ${place.country}`} /><span className="number-stamp">0{index + 1}</span><button onClick={() => toggleFavorite.mutate(place)} className={isSaved(place) ? "heart-pin saved" : "heart-pin"} aria-label={`${isSaved(place) ? "Remove" : "Save"} ${place.city}`}><Heart size={17} fill={isSaved(place) ? "currentColor" : "none"}/></button></div><div className="inspiration-info"><span>{place.country}</span><h3>{place.city}</h3><p>{place.detail}</p><button onClick={onPlan}>Put on my route <ArrowRight size={16}/></button></div></article>)}</div>{matches.length === 0 && <div className="search-empty"><Search size={28}/><strong>No place yet — try a broader sketch.</strong><p>Search by a city, country, or simply clear the field to browse.</p></div>}</section>;
}

function SharePane({ tripId, trip }: { tripId: number; trip: any }) {
  const [copied, setCopied] = useState(false);
  const share = trpc.trip.createShare.useMutation();
  const publicUrl = share.data?.shareCode ? `${window.location.origin}/share/${share.data.shareCode}` : "";
  const copy = async () => { if (!share.data) { await share.mutateAsync({ tripId }); } else { await navigator.clipboard.writeText(publicUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1400); } };
  return <div className="share-layout"><section className="share-preview"><div className="postage-stamp"><span>GT</span><small>FIELD POST</small></div><p className="eyebrow">A TRIP, SENT OUT</p><h2>{trip?.name || "Your small grand tour"}</h2><p>{trip?.description || "A thoughtful route, ready to be shared with a favorite travel companion."}</p><div className="share-route"><span>Lisbon</span><i/><span>Porto</span><i/><span>Madrid</span></div><div className="share-signature"><span>Made with GlobeTrotter</span><em>✦</em></div></section><aside className="paper-panel share-controls"><p className="eyebrow">SHARE THE MAP</p><h3>Bring someone <em>along.</em></h3><p>Turn this travel sketch into a shareable summary. You can refresh the link anytime.</p><button className="ink-button" onClick={copy} disabled={share.isPending}>{share.isPending ? <LoaderCircle className="spin" size={17}/> : copied ? <Check size={17}/> : <Copy size={17}/>} {share.data ? copied ? "Copied to clipboard" : "Copy public link" : "Create public link"}</button>{publicUrl && <input className="share-url" value={publicUrl} readOnly />}<div className="privacy-note"><Users size={17}/><span>Public views include your route, itinerary, and the details you choose to keep.</span></div></aside></div>;
}

function ProfilePane({ onBack, onPreferences }: { onBack: () => void; onPreferences: () => void }) {
  const { user } = useAuth();
  const trips = trpc.trip.list.useQuery();
  return <main className="workspace-main preferences-main"><header className="workspace-header"><button className="crumb" onClick={onBack}><ArrowLeft size={17}/> <span>Back to my travel desk</span></button></header><section className="profile-pane"><p className="eyebrow">TRAVELER PROFILE</p><div className="profile-card"><span className="profile-avatar">{user?.name?.slice(0, 1) || "T"}</span><div><h2>{user?.name || "Traveler"}</h2><p>{user?.email || "A thoughtful route-maker"}</p></div><button className="outline-button" onClick={onPreferences}>Travel preferences <ArrowRight size={15}/></button></div><div className="profile-stat-grid"><article><span>Trips in the notebook</span><strong>{trips.data?.length || 0}</strong></article><article><span>Favorite kinds of days</span><strong>Yours</strong><small>Set these in preferences</small></article><article><span>Account role</span><strong>{user?.role || "traveler"}</strong></article></div><div className="profile-note"><MapPinned size={20}/><div><p className="eyebrow">YOUR TRAVEL DESK</p><h3>Every good route starts<br/><em>with a small hunch.</em></h3></div></div></section></main>;
}

function PreferencesPane({ onBack }: { onBack: () => void }) {
  const utils = trpc.useUtils();
  const preferences = trpc.preferences.me.useQuery();
  const save = trpc.preferences.save.useMutation({ onSuccess: () => utils.preferences.me.invalidate() });
  const [travelStyle, setTravelStyle] = useState("");
  const [budgetStyle, setBudgetStyle] = useState("balanced");
  const [favoriteCategories, setFavoriteCategories] = useState("");
  useEffect(() => {
    if (!preferences.data) return;
    setTravelStyle(preferences.data.travelStyle || "");
    setBudgetStyle(preferences.data.budgetStyle || "balanced");
    setFavoriteCategories(preferences.data.favoriteCategories || "");
  }, [preferences.data]);
  return <main className="workspace-main preferences-main"><header className="workspace-header"><button className="crumb" onClick={onBack}><ArrowLeft size={17}/> <span>Back to my travel desk</span></button></header><section className="preferences-pane"><div><p className="eyebrow">TRAVELER PROFILE</p><h2>Set a few <em>good defaults.</em></h2><p className="profile-copy">These notes keep your desk feeling personal and provide the right context as you build new journeys.</p></div><div className="preferences-grid"><label>Travel rhythm<textarea value={travelStyle} onChange={event => setTravelStyle(event.target.value)} placeholder="Slow mornings, long walks, a museum after lunch…" /></label><label>Budget approach<select value={budgetStyle} onChange={event => setBudgetStyle(event.target.value)}><option value="mindful">Mindful</option><option value="balanced">Balanced</option><option value="generous">Generous</option></select></label><label>Things you are drawn to<input value={favoriteCategories} onChange={event => setFavoriteCategories(event.target.value)} placeholder="Food trails, design, hiking, local music…" /></label><button className="ink-button" onClick={() => save.mutate({ travelStyle, budgetStyle, favoriteCategories })} disabled={save.isPending}>{save.isPending ? <LoaderCircle className="spin" size={17}/> : <Check size={17}/>} {save.isSuccess ? "Saved to your desk" : "Save preferences"}</button></div></section></main>;
}

export default function TravelWorkspace() {
  const { user, loading, isAuthenticated } = useAuth();
  const [view, setView] = useState<View>("overview");
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [location, setLocation] = useLocation();
  const rawTripsQuery = trpc.trip.list.useQuery(undefined, { enabled: isAuthenticated });
  const tripsQuery = { ...rawTripsQuery, data: rawTripsQuery.data?.map((trip: any) => ({ ...trip, startDate: formatTripDate(trip.startDate), endDate: formatTripDate(trip.endDate) })) };
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  useEffect(() => {
    const search = window.location.search;
    const requestedView = new URLSearchParams(search).get("view");
    const requestedTripId = smartDraftTripIdFromSearch(search);
    if (["overview", "itinerary", "budget", "map", "discover", "smart", "share", "settings", "profile"].includes(requestedView || "")) setView(requestedView as View);
    if (requestedTripId) setSelectedTripId(requestedTripId);
  }, [location]);
  const currentTrip = tripsQuery.data?.find((trip: any) => trip.id === selectedTripId) ?? tripsQuery.data?.[0];
  const workspace = trpc.trip.workspace.useQuery({ tripId: currentTrip?.id ?? 0 }, { enabled: Boolean(currentTrip?.id) });
  const routeStops = useMemo(() => workspace.data?.stops?.length ? workspace.data.stops : sampleStops, [workspace.data]);
  const openPlanner = () => { if (!isAuthenticated) startLogin(); else setShowNewTrip(true); };
  if (view === "settings" && isAuthenticated) return <div className="workspace-shell"><aside className="workspace-sidebar"><PaperLogo/><WorkspaceNav view={view} setView={setView}/></aside><PreferencesPane onBack={() => setView("overview")} /></div>;
  if (view === "profile" && isAuthenticated) return <div className="workspace-shell"><aside className="workspace-sidebar"><PaperLogo/><WorkspaceNav view={view} setView={setView}/></aside><ProfilePane onBack={() => setView("overview")} onPreferences={() => setView("settings")} /></div>;
  if (loading) return <div className="loading-page"><PaperLogo/><LoaderCircle className="spin" size={30}/><p>Opening your travel desk…</p></div>;
  if (!isAuthenticated) return <main className="guest-gate"><header className="simple-header"><PaperLogo/><Link href="/" className="text-link"><ArrowLeft size={16}/> Back to inspiration</Link></header><section><div className="gate-sketch"><Route size={42}/><i/><MapPinned size={31}/></div><p className="eyebrow">YOUR PRIVATE TRAVEL DESK</p><h1>Save the <em>good ideas.</em></h1><p>Sign in to create a personal trip book, shape each day, track costs, and send a route to your people.</p><button className="ink-button" onClick={startLogin}>Sign in to plan <ArrowRight size={17}/></button></section></main>;
  return <div className="workspace-shell"><aside className="workspace-sidebar"><PaperLogo/><div className="profile-scribble"><span>{user?.name?.slice(0, 1) || "T"}</span><div><strong>{user?.name || "Traveler"}</strong><small>Travel notebook</small></div><ChevronDown size={16}/></div><WorkspaceNav view={view} setView={setView}/><div className="sidebar-bottom"><button className="nav-item" onClick={() => setLocation("/")}><Compass size={18}/><span>Inspiration wall</span></button><button className="nav-item"><Settings size={18}/><span>Settings</span></button></div></aside><main className="workspace-main"><header className="workspace-header"><button className="crumb" onClick={() => setView("overview")}><Dices size={17}/> <span>My travel desk</span></button><div className="header-actions"><button className="text-button header-discover" onClick={() => setView("discover")}><Search size={17}/> Find a place</button><button className="ink-button small" onClick={openPlanner}><Plus size={17}/> New trip</button></div></header><WorkspaceNav compact view={view} setView={setView}/>{view === "overview" && <section className="workspace-overview"><div className="workspace-intro"><div><p className="eyebrow">GOOD TO SEE YOU, {user?.name?.split(" ")[0]?.toUpperCase() || "TRAVELER"}</p><h1>Where does your<br/><em>curiosity point?</em></h1></div><div className="intro-doodle"><Navigation size={33}/><span>pick a direction</span></div></div>{tripsQuery.isLoading ? <div className="loading-card"><LoaderCircle className="spin"/> Gathering your field notes…</div> : !tripsQuery.data?.length ? <EmptyTripState onPlan={openPlanner}/> : <><div className="trip-section-head"><div><p className="eyebrow">IN PROGRESS</p><h2>Your next <em>little expedition.</em></h2></div><button className="text-button" onClick={() => setView("discover")}>See all plans <ArrowRight size={16}/></button></div><div className="trip-cards">{tripsQuery.data.map((trip: any, index: number) => <article className={trip.id === currentTrip?.id ? "trip-card active" : "trip-card"} key={trip.id} onClick={() => { setSelectedTripId(trip.id); setView("itinerary"); }}><span className="trip-index">0{index + 1}</span><div className="trip-card-map"><Route size={29}/><i/><MapPinned size={23}/></div><div><p>{trip.startDate} → {trip.endDate}</p><h3>{trip.name}</h3><span>{trip.travelers} travelers · ${Number(trip.budget).toLocaleString()} plan</span></div><ArrowRight className="go-arrow" size={20}/></article>)}</div><section className="desk-memo"><div><span className="number-stamp dark">!</span><p className="eyebrow">A NUDGE FROM YOUR NOTEBOOK</p><h3>A route is just a rough line<br/>until you leave room for <em>surprises.</em></h3></div><button className="outline-button" onClick={() => setView("discover")}>Find a new place <Compass size={16}/></button></section></>}</section>}{view === "discover" && <DiscoverPane onPlan={openPlanner}/>} {view === "smart" && <SmartDraftPane onCreated={tripId => handoffSmartDraft(tripId, { selectTrip: setSelectedTripId, showItinerary: () => setView("itinerary"), navigate: setLocation })} />} {view === "itinerary" && (currentTrip ? <ItineraryPane tripId={currentTrip.id} workspace={workspace.data}/> : <EmptyTripState onPlan={openPlanner}/>)} {view === "budget" && (currentTrip ? <BudgetPane tripId={currentTrip.id} workspace={workspace.data}/> : <EmptyTripState onPlan={openPlanner}/>)} {view === "map" && <section className="map-pane"><div className="map-heading"><div><p className="eyebrow">ROUTE, ROUGHLY DRAWN</p><h2>Every stop tells <em>the next story.</em></h2></div><button className="outline-button"><Send size={16}/> Share route</button></div><div className="map-card"><RouteSketch stops={routeStops}/><div className="map-legend">{routeStops.map((stop: any, index: number) => <span key={`${stop.city}-${index}`}><b>{index + 1}</b>{stop.city}</span>)}</div></div></section>}{view === "share" && (currentTrip ? <SharePane tripId={currentTrip.id} trip={currentTrip}/> : <EmptyTripState onPlan={openPlanner}/>)}</main>{showNewTrip && <NewTripSheet onClose={() => setShowNewTrip(false)}/>}</div>;
}
