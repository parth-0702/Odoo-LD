import { ArrowLeft, ArrowRight, Check, Compass, MapPinned, Plus, Route, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import "./localPlan.css";

type LocalDraft = {
  name: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  stops: string;
};

const initialDraft: LocalDraft = {
  name: "A small grand tour",
  startDate: "2026-05-10",
  endDate: "2026-05-16",
  travelers: 2,
  budget: 2200,
  stops: "Lisbon, Porto, Madrid",
};

export default function LocalPlan() {
  const [, setLocation] = useLocation();
  const [draft, setDraft] = useState<LocalDraft>(initialDraft);
  const [saved, setSaved] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const stops = draft.stops.split(",").map(stop => stop.trim()).filter(Boolean);
    localStorage.setItem("globetrotter-local-plan", JSON.stringify({ ...draft, stops, createdAt: new Date().toISOString() }));
    setSaved(true);
  };
  return <main className="local-plan"><header className="local-plan-head"><Link href="/" className="text-link"><ArrowLeft size={16}/> Back to inspiration</Link><span className="logo-mark"><span className="logo-orbit">✦</span><span>globetrotter</span></span></header><section className="local-plan-inner"><div className="local-plan-intro"><p className="eyebrow">LOCAL PLANNING MODE</p><h1>Sketch the first<br/><em>rough line.</em></h1><p>This local version saves a lightweight plan only in this browser. Connect the supplied OAuth and database variables to unlock accounts, shared plans, Maps search, and cloud persistence.</p><div className="local-route-scribble"><MapPinned size={28}/><i/><Route size={35}/><i/><Compass size={29}/></div></div><form className="local-plan-form" onSubmit={submit}><div className="local-form-heading"><span className="number-stamp dark">01</span><div><p className="eyebrow">YOUR TRIP NOTE</p><h2>Where to <em>first?</em></h2></div></div><label>Trip name<input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} required /></label><div className="local-two-col"><label>Leave on<input type="date" value={draft.startDate} onChange={event => setDraft({ ...draft, startDate: event.target.value })} required /></label><label>Return on<input type="date" min={draft.startDate} value={draft.endDate} onChange={event => setDraft({ ...draft, endDate: event.target.value })} required /></label></div><div className="local-two-col"><label><Users size={14}/> Travelers<input type="number" min="1" value={draft.travelers} onChange={event => setDraft({ ...draft, travelers: Number(event.target.value) })} required /></label><label>Working budget<input type="number" min="0" value={draft.budget} onChange={event => setDraft({ ...draft, budget: Number(event.target.value) })} required /></label></div><label>Route stops, separated by commas<textarea value={draft.stops} onChange={event => setDraft({ ...draft, stops: event.target.value })} placeholder="Lisbon, Porto, Madrid" required /></label>{saved && <div className="local-saved"><Check size={17}/><span>Saved locally. You can keep shaping this plan in this browser.</span></div>}<div className="local-form-actions"><button type="submit" className="ink-button"><Plus size={17}/> Save this local plan</button><button type="button" className="outline-button" onClick={() => setLocation("/")}>Keep exploring <ArrowRight size={16}/></button></div></form></section></main>;
}
