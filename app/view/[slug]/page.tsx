import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FrameControl } from "@/components/site/frame-control";
import { FrameHeight } from "@/components/site/frame-height";
import { blocks, getBlock } from "@/registry";
import { blockComponents } from "@/registry/blocks.generated";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${getBlock(slug)?.name ?? "Block"} preview`,
    robots: { index: false, follow: false },
  };
}

export default async function BlockViewPage({ params }: Props) {
  const { slug } = await params;
  const Block = blockComponents[slug];
  if (!Block) notFound();
  return (
    <>
      <FrameControl />
      <FrameHeight id={slug} />
      <Block />
    </>
  );
}
