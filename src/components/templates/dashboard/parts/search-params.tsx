"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

function Reader({ onChange }: { onChange: (params: URLSearchParams) => void }) {
  const params = useSearchParams();
  const latest = React.useRef(onChange);
  React.useEffect(() => {
    latest.current = onChange;
  });
  React.useEffect(() => {
    latest.current(new URLSearchParams(params.toString()));
  }, [params]);
  return null;
}

/**
 * Reports the query string (?q=, ?new=1, ?tab=) to the page. It sits in its own Suspense boundary,
 * so the page around it still renders on the server.
 */
export function SearchParams({ onChange }: { onChange: (params: URLSearchParams) => void }) {
  return (
    <React.Suspense fallback={null}>
      <Reader onChange={onChange} />
    </React.Suspense>
  );
}
