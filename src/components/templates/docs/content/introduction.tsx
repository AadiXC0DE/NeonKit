import { CopyButton } from "@/components/ui/copy-button";

import { installCommands } from "../config";
import { docHref } from "../docs";
import { copyText } from "../highlight";
import { A, Callout, Code, CodeBlock, H2, LinkList, P, UL } from "../mdx";
import { RunDiagram } from "./run-diagram";

const firstRun = `$ gantry up
  resolve  pnpm-lock.yaml · 412 packages           0.21s
  layers   9 cached · 1 rebuilt (src)              1.84s
  start    db   -> postgres://localhost:5432        41ms
  start    web  -> http://localhost:3000            38ms
  ready    2 services healthy in 2.13s · watching src/`;

const specs = [
  { label: "Binary", value: "9.4 MB, static" },
  { label: "Warm start", value: "82 ms for two services" },
  { label: "Daemons", value: "None. It runs as you, no root" },
  { label: "Images", value: "OCI, push to any registry" },
];

function Specs() {
  return (
    <dl className="mt-8 grid border-t border-white/[0.07] sm:grid-cols-2 sm:gap-x-10">
      {specs.map((spec) => (
        <div key={spec.label} className="flex items-baseline justify-between gap-6 border-b border-white/[0.07] py-3.5">
          <dt className="text-[14px] text-white/55">{spec.label}</dt>
          <dd className="text-right text-[14px] tabular-nums text-white/90">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The one command a new reader needs, before anything else. */
function InstallLine() {
  const command = installCommands.npm;
  return (
    <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex h-11 min-w-0 max-w-full items-center gap-3 rounded-lg border border-white/10 bg-[#0a0b11] pl-4 pr-1.5">
        <code className="min-w-0 truncate font-mono text-[13.5px] text-white/90">
          <span aria-hidden className="select-none text-[rgb(var(--neon))]">
            ${" "}
          </span>
          {copyText(command, "sh")}
        </code>
        <CopyButton size="sm" value={copyText(command, "sh")} aria-label="Copy the install command" />
      </div>
      <A href={docHref("installation")}>Other ways to install</A>
    </div>
  );
}

export function Introduction() {
  return (
    <>
      <InstallLine />

      {/* The first run is the page's one lit object: a hairline of light along its top edge. */}
      <div className="relative mt-12">
        <CodeBlock title="~/code/acme-web" code={firstRun} highlight={[6]} className="mt-0" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.7),transparent)]"
        />
      </div>

      <H2 id="what-gantry-does">What Gantry does</H2>
      <P>
        Gantry is a container CLI for the part of the job that happens on your laptop and the first server you ship to.
        It reads your lockfile, builds an OCI image in layers it can reuse, and starts your services directly, each in
        its own namespaces. There is no background service to install, keep running or restart.
      </P>
      <Specs />
      <P>
        If you already have Dockerfiles, keep them. Gantry builds them as they are and only falls back to the lockfile
        for services that don&apos;t have one.
      </P>

      <H2 id="how-a-run-works">How a run works</H2>
      <P>
        Every <Code>gantry up</Code> goes through the same stages. Resolve always runs, but when the lockfile hasn&apos;t
        changed it only checks a hash. Layer is skipped outright when its inputs are the same, which is why a warm start
        takes milliseconds. Switch between the two below; the bar is to scale.
      </P>
      <RunDiagram />

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
