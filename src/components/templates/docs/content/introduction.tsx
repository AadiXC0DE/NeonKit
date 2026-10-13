import { docHref } from "../docs";
import { A, Callout, Code, CodeBlock, H2, LinkList, P, UL } from "../mdx";

const firstRun = `$ gantry up
  resolve  pnpm-lock.yaml · 412 packages           0.21s
  layers   9 cached · 1 rebuilt (src)              1.84s
  start    db   -> postgres://localhost:5432        41ms
  start    web  -> http://localhost:3000            38ms
  ready    2 services healthy in 2.13s · watching src/`;

const facts = [
  { value: "9.4 MB", label: "One static binary" },
  { value: "38 ms", label: "Median warm start" },
  { value: "0", label: "Daemons. No root." },
  { value: "OCI", label: "Images, any registry" },
];

const stages = [
  {
    name: "Resolve",
    time: "0.21 s",
    body: "Reads the lockfile and gantry.toml and works out which layers each service needs.",
  },
  {
    name: "Layer",
    time: "1.84 s",
    body: "Rebuilds only the layers whose inputs changed. Base and dependency layers come from the local cache.",
  },
  {
    name: "Start",
    time: "38 ms",
    body: "Starts each service in its own namespaces, in dependency order, and waits for its health check.",
  },
  {
    name: "Watch",
    time: "live",
    body: "Rebuilds the source layer on save and restarts just the services that use it.",
  },
];

function Facts() {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-white/[0.07] py-6 sm:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col-reverse gap-1">
          <dt className="text-[13px] text-white/60">{fact.label}</dt>
          <dd className="text-[1.6rem] font-semibold tabular-nums tracking-[-0.03em] text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The four stages as a 2×2 board. Finished stages hold a steady lamp; Watch keeps pulsing. */
function Pipeline() {
  return (
    <ol className="mt-8 grid list-none gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.07] p-0 sm:grid-cols-2">
      {stages.map((stage, index) => {
        const live = stage.time === "live";
        return (
          <li key={stage.name} className="relative bg-[#06070b] p-5 sm:p-6">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em]">
              <span className="text-white/55">0{index + 1}</span>
              <span className="flex items-center gap-2 text-[rgb(var(--neon))]">
                <span aria-hidden className="relative flex size-1.5">
                  {live && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon))] opacity-70 [animation-duration:1.8s] motion-reduce:animate-none" />
                  )}
                  <span className="relative size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.9)]" />
                </span>
                {stage.time}
              </span>
            </div>
            <p className="mt-6 text-[15px] font-medium text-white">{stage.name}</p>
            <p className="mt-1.5 text-[13.5px] leading-6 text-white/60">{stage.body}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function Introduction() {
  return (
    <>
      {/* The first run is the page's lit object: a hairline of light on top, a pool of it underneath. */}
      <div className="relative mt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-16 top-1/3 sm:-inset-x-10 bg-[radial-gradient(50%_50%_at_50%_45%,rgb(var(--neon)/0.08),transparent)]"
        />
        <CodeBlock
          title="~/code/acme-web"
          code={firstRun}
          highlight={[6]}
          className="mt-0 border-[rgb(var(--neon)/0.2)] shadow-[0_24px_60px_-28px_rgb(var(--neon)/0.35)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.8),transparent)]"
        />
      </div>

      <H2 id="what-gantry-does">What Gantry does</H2>
      <P>
        Gantry is a container CLI for the part of the job that happens on your laptop and the first server you ship to.
        It reads your lockfile, builds an OCI image in layers it can reuse, and starts your services directly, each in
        its own namespaces. There is no background service to install, keep running or restart.
      </P>
      <Facts />
      <P>
        If you already have Dockerfiles, keep them. Gantry builds them as they are and only falls back to the lockfile
        for services that don&apos;t have one.
      </P>

      <H2 id="how-a-run-works">How a run works</H2>
      <P>
        Every <Code>gantry up</Code> goes through the same four stages. Only the first always does work; the others are
        skipped when nothing they depend on changed, which is why a warm start takes milliseconds.
      </P>
      <Pipeline />

      <H2 id="when-not-to-use-gantry">When not to use Gantry</H2>
      <UL>
        <li>
          You run a fleet. Gantry ships to a registry or to single hosts; scheduling across many machines belongs to the
          orchestrator you already have.
        </li>
        <li>You need Windows containers. Gantry runs Linux images only, on macOS inside a small VM it manages for you.</li>
        <li>
          Your builds lean on a cache shared between machines. Gantry&apos;s cache is per machine; read{" "}
          <A href={docHref("cli/build", "layer-cache")}>the layer cache</A> before you decide.
        </li>
      </UL>
      <Callout type="note" title="Upgrading from 1.x">
        Config written for Gantry 1.x still loads. Run <Code>gantry doctor --migrate</Code> to rewrite the old keys in
        place and see a diff before anything is saved.
      </Callout>

      <H2 id="where-next">Where to go next</H2>
      <LinkList
        items={[
          {
            href: docHref("installation"),
            title: "Install Gantry",
            description: "One binary with npm, pnpm, bun, yarn or the install script.",
          },
          {
            href: docHref("quickstart"),
            title: "Run your first project",
            description: "A web service and a database, up and reloading in five minutes.",
          },
          {
            href: docHref("configuration"),
            title: "Write a gantry.toml",
            description: "Services, health checks, environment variables and CI profiles.",
          },
          {
            href: docHref("cli/up"),
            title: "gantry up",
            mono: true,
            description: "Every flag, with examples and exit codes.",
          },
        ]}
      />
    </>
  );
}
