"use client";

import * as React from "react";
import { PlaneTakeoff } from "lucide-react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

const airports = [
  { code: "LIS", city: "Lisbon", name: "Humberto Delgado" },
  { code: "OPO", city: "Porto", name: "Francisco Sá Carneiro" },
  { code: "MAD", city: "Madrid", name: "Adolfo Suárez Madrid–Barajas" },
  { code: "BCN", city: "Barcelona", name: "Josep Tarradellas El Prat" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { code: "ORY", city: "Paris", name: "Orly" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol" },
  { code: "BER", city: "Berlin", name: "Brandenburg" },
  { code: "MUC", city: "Munich", name: "Franz Josef Strauss" },
  { code: "ZRH", city: "Zurich", name: "Kloten" },
  { code: "CPH", city: "Copenhagen", name: "Kastrup" },
  { code: "ARN", city: "Stockholm", name: "Arlanda" },
  { code: "HEL", city: "Helsinki", name: "Vantaa" },
  { code: "LHR", city: "London", name: "Heathrow" },
  { code: "LGW", city: "London", name: "Gatwick" },
  { code: "DUB", city: "Dublin", name: "Dublin" },
  { code: "JFK", city: "New York", name: "John F. Kennedy" },
  { code: "SFO", city: "San Francisco", name: "San Francisco International" },
  { code: "YVR", city: "Vancouver", name: "Vancouver International" },
  { code: "HND", city: "Tokyo", name: "Haneda" },
  { code: "SIN", city: "Singapore", name: "Changi" },
  { code: "SYD", city: "Sydney", name: "Kingsford Smith" },
];

const toOption = (airport: (typeof airports)[number]): ComboboxOption => ({
  value: airport.code,
  label: `${airport.city} (${airport.code})`,
  description: `${airport.name} Airport`,
  icon: <PlaneTakeoff />,
});

// Stands in for a request to your API.
function searchAirports(query: string) {
  const q = query.trim().toLowerCase();
  const matches = q
    ? airports.filter((airport) =>
        [airport.code, airport.city, airport.name].some((field) => field.toLowerCase().includes(q)),
      )
    : airports.slice(0, 6);
  return matches.map(toOption);
}

export default function ComboboxAsync() {
  const [options, setOptions] = React.useState(() => searchAirports(""));
  const [loading, setLoading] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    const pending = timer;
    return () => window.clearTimeout(pending.current);
  }, []);

  function handleSearch(query: string) {
    setLoading(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setOptions(searchAirports(query));
      setLoading(false);
    }, 450);
  }

  return (
    <Combobox
      label="Departing from"
      placeholder="City or airport code"
      containerClassName="max-w-xs"
      options={options}
      loading={loading}
      onSearchChange={handleSearch}
      emptyText="No airports match that."
    />
  );
}
