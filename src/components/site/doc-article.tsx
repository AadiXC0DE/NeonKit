import { Toc, type TocItem } from "./toc";

/** A guide page: the prose column, and its outline on wide screens. */
export function DocArticle({ toc, children }: { toc?: TocItem[]; children: React.ReactNode }) {
  return (
    <div className="flex gap-12 xl:gap-16">
      <article className="min-w-0 max-w-[50rem] flex-1">{children}</article>
      {toc && toc.length > 1 && (
        <aside className="sticky top-14 hidden h-fit max-h-[calc(100dvh-3.5rem)] w-48 shrink-0 overflow-y-auto pt-[7.5rem] xl:block">
          <Toc items={toc} />
        </aside>
      )}
    </div>
  );
}
