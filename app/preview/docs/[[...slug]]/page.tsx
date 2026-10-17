import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocPage } from "@/components/templates/docs/doc-page";
import { docs, findDoc } from "@/components/templates/docs/docs";

type Props = { params: Promise<{ slug?: string[] }> };

// Unknown pages hit notFound() below. No `dynamicParams = false`: apps with cacheComponents reject it.
export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug ? doc.slug.split("/") : [] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const doc = findDoc(slug.join("/"));
  if (!doc) return {};
  return {
    title: doc.slug ? doc.title : { absolute: "Gantry docs: containers from your lockfile" },
    description: doc.description,
  };
}

export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  const path = slug.join("/");
  if (!findDoc(path)) notFound();
  return <DocPage slug={path} />;
}
