import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarDays, Check, CircleDollarSign, LoaderCircle, MapPinned, Mic, MicOff, NotebookPen, RefreshCw, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { validateSmartDraftIntent, voiceIntentGuidance } from "@shared/smartDraft";
import "./smartDraft.css";
import "./smartDraftVoice.css";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  const browserWindow = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
}

export default function SmartDraftPane({ onCreated }: { onCreated: (tripId: number) => void }) {
  const [intent, setIntent] = useState("5 days in Southeast Asia, love food and beaches, moderate budget");
  const [draft, setDraft] = useState<any>(null);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(() => typeof window !== "undefined" && Boolean(getSpeechRecognitionConstructor()));
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const variationRef = useRef(0);

  const generate = trpc.smartDraft.generate.useMutation({
    onSuccess: next => { setDraft(next); setError(""); },
    onError: () => setError("The draft could not be created right now. Your existing itinerary is unchanged — try refining your intent."),
  });
  const createTrip = trpc.smartDraft.createTrip.useMutation({
    onSuccess: ({ tripId }) => onCreated(tripId),
    onError: () => setError("The itinerary could not be saved. Please try again."),
  });

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const submit = (variation = 0) => {
    const validationError = validateSmartDraftIntent(intent);
    if (validationError) { setError(validationError); return; }
    variationRef.current = variation;
    generate.mutate({ intent: intent.trim(), variation });
  };

  const refreshRoute = () => submit(variationRef.current + 1);

  const apply = () => {
    if (!draft) return;
    createTrip.mutate({
      intent: intent.trim(),
      days: draft.days,
      budget: draft.budget,
      destinationIds: draft.candidates.map((city: any) => city.id),
      schedule: draft.schedule.map((entry: any) => ({ day: entry.day, destinationId: entry.destinationId, activityId: entry.activityId })),
    });
  };

  const toggleVoice = () => {
    if (isListening) { recognitionRef.current?.stop(); return; }
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) { setError("Voice capture is unavailable in this browser. You can still type your trip idea below."); return; }
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = event => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) transcript += event.results[index][0]?.transcript ?? "";
      if (transcript.trim()) { setIntent(current => current.trim() ? `${current.trim()} ${transcript.trim()}` : transcript.trim()); setError(""); }
    };
    recognition.onerror = event => {
      if (event.error !== "aborted" && event.error !== "no-speech") setError("Voice capture could not start. Check microphone permission, then try again or type your idea.");
    };
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return <section className="smart-draft-pane">
    <header className="smart-draft-hero"><div><p className="eyebrow">SMART TRIP DRAFTING · MODULE 14</p><h1>Start with a <em>rough feeling.</em></h1><p>Describe the kind of trip you want. The planner dynamically interprets your intent but only uses cities and activities already in your GlobeTrotter catalog.</p></div><figure className="smart-draft-globe"><img src="/manus-storage/world-flags-globe_79a32a13.png" alt="World flags globe"/><figcaption>plan the<br/>whole world</figcaption></figure></header>
    <section className="smart-draft-intent">
      <label><span>What kind of trip are you imagining?</span><textarea value={intent} onChange={event => setIntent(event.target.value)} maxLength={800} placeholder="For example: 5 days in Southeast Asia, food and beaches, moderate budget"/></label>
      <div className="smart-draft-intent-actions">
        <button className="voice-intent-button" type="button" onClick={toggleVoice} disabled={!voiceSupported || generate.isPending} aria-pressed={isListening} aria-label={isListening ? "Stop listening to trip idea" : "Describe trip idea by voice"}>{isListening ? <MicOff size={16}/> : <Mic size={16}/>}{isListening ? "Listening… tap to stop" : "Speak your idea"}</button>
        <button className="ink-button" onClick={() => submit()} disabled={generate.isPending}>{generate.isPending ? <LoaderCircle className="spin" size={18}/> : <Sparkles size={18}/>} Draft my route</button>
      </div>
      <p className="voice-intent-hint">{voiceIntentGuidance(voiceSupported)}</p>
    </section>
    {error && <p className="smart-draft-error" role="alert">{error}</p>}
    {draft?.catalogStatus === "unavailable" && <section className="smart-draft-unavailable" role="status"><p className="eyebrow">CATALOG COVERAGE CHECK</p><h2>{draft.requestedLocation} is not in the <em>current catalog.</em></h2><p>{draft.catalogMessage}</p><div><span>Available now</span>{draft.availableLocations?.map((location: string) => <b key={location}>{location}</b>)}</div></section>}
    {draft?.catalogStatus !== "unavailable" && draft && <section className="smart-draft-results">
      <div className="smart-draft-result-head"><div><p className="eyebrow">YOUR GROUNDED STARTING POINT</p><h2>{draft.days} days, <em>{draft.budgetBand} rhythm.</em></h2><p>{draft.provider === "ai" ? "AI interpreted your rough intent; every city and activity below comes from your own catalog." : "A catalog-grounded fallback shaped this draft; every city and activity below is real project data."}</p></div><div className="smart-draft-result-head-actions"><button className="smart-draft-refresh" type="button" onClick={refreshRoute} disabled={generate.isPending || createTrip.isPending}>{generate.isPending ? <LoaderCircle className="spin" size={16}/> : <RefreshCw size={16}/>} Try another route</button><div className="smart-draft-budget"><CircleDollarSign size={19}/><span>Rough working budget</span><strong>${Number(draft.budget).toLocaleString()}</strong></div></div></div>
      <div className="smart-city-grid">{draft.candidates.map((city: any, index: number) => <article key={city.id}><span>0{index + 1}</span><MapPinned size={21}/><h3>{city.city}</h3><p>{city.country} · cost index {city.costIndex}/5</p><small>{city.reason}</small></article>)}</div>
      <div className="smart-schedule"><div className="smart-schedule-head"><div><p className="eyebrow">TRAVEL-READY DAY PLAN</p><h3>Practical details, <em>grounded activities.</em></h3></div><span><NotebookPen size={16}/> Fully editable after import</span></div>{draft.schedule.map((entry: any) => <article className="smart-day-plan" key={`${entry.day}-${entry.activityId}`}><div className="smart-day-plan-time"><span>DAY {String(entry.day).padStart(2, "0")}</span><strong>{entry.startTime}</strong><small>{entry.slot}</small></div><i><CalendarDays size={16}/></i><div className="smart-day-plan-copy"><strong>{entry.title}</strong><p>{entry.city} · {entry.category} · {entry.durationMinutes ? `${entry.durationMinutes} min` : "Flexible duration"}</p><p className="smart-practical-note">{entry.transferNote}</p><p className="smart-practical-note">{entry.practicalNote}</p><small>{entry.readinessNote}</small></div><b>${Number(entry.estimatedCost).toLocaleString()}</b></article>)}</div>
      <footer className="smart-draft-actions"><p><Check size={16}/> Importing creates a private trip with stops and scheduled itinerary activities. You can reorder or edit every detail in the itinerary next.</p><button className="ink-button large" onClick={apply} disabled={createTrip.isPending}>{createTrip.isPending ? <LoaderCircle className="spin" size={18}/> : <ArrowRight size={18}/>} Add draft to itinerary</button></footer>
    </section>}
  </section>;
}
