import { Globe, type GlobeMarker } from "@/components/ui/globe";

const airports: GlobeMarker[] = [
  { id: "DOH", label: "DOH", lat: 25.27, lng: 51.61 },
  { id: "LHR", label: "LHR", lat: 51.47, lng: -0.45 },
  { id: "JFK", label: "JFK", lat: 40.64, lng: -73.78 },
  { id: "JNB", label: "JNB", lat: -26.14, lng: 28.24 },
  { id: "SIN", label: "SIN", lat: 1.36, lng: 103.99 },
  { id: "NRT", label: "NRT", lat: 35.77, lng: 140.39 },
  { id: "SYD", label: "SYD", lat: -33.94, lng: 151.18 },
];

export default function GlobeRoutes() {
  return (
    <div className="grid w-full max-w-sm justify-items-center gap-4">
      <Globe
        color="amber"
        graticule
        markers={airports}
        arcs={airports.slice(1).map((a) => ({ from: "DOH", to: a.id as string }))}
        longitude={50}
        tilt={18}
        speed={4}
        arcDuration={3.2}
        aria-label="Six long-haul routes from Doha"
      />
      <p className="text-center text-[13px] text-white/55">Six long-haul routes out of Doha.</p>
    </div>
  );
}
