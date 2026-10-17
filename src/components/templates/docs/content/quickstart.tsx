import { docHref } from "../docs";
import { A, Callout, Code, CodeBlock, H2, KbdCombo, LinkList, P, Step, Steps, UL } from "../mdx";

const init = `$ cd ~/code/acme-web
$ gantry init
  found    pnpm-lock.yaml · 412 packages
  found    Dockerfile.db
  wrote    gantry.toml · 2 services
  wrote    .gitignore · added .env.local`;

const config = `[project]
name = "acme-web"

[service.web]
build = "lockfile"
command = ["pnpm", "dev"]
ports = ["3000"]
depends_on = ["db"]

[service.db]
build = "Dockerfile.db"
ports = ["5432"]
volumes = ["db-data:/var/lib/postgresql/data"]`;

const up = `$ gantry up
  resolve  pnpm-lock.yaml · 412 packages           0.21s
  layers   base, deps pulled · src built           48.6s
  start    db   -> postgres://localhost:5432        41ms
  start    web  -> http://localhost:3000            38ms
  ready    2 services healthy · watching src/`;

const reload = `  change   src/app/page.tsx
  layers   1 rebuilt (src)                         0.42s
  restart  web -> healthy                          0.31s`;

export function Quickstart() {
  return (
    <>
      <H2 id="before-you-start">Before you start</H2>
      <UL>
        <li>
          Gantry 2.8 or later. <A href={docHref("installation")}>Install it</A> if <Code>gantry --version</Code> comes
          back empty.
        </li>
        <li>A project with a lockfile. Any of npm, pnpm, bun, yarn, Cargo, Go modules or Poetry will do.</li>
        <li>Ports 3000 and 5432 free on your machine.</li>
      </UL>

      <Steps>
        <Step level={2} id="create-a-project" title="Create a project">
          <P>
            Run <Code>gantry init</Code> in the project root. It finds your lockfile, guesses the services and writes a
            gantry.toml short enough to read top to bottom.
          </P>
          <CodeBlock code={init} />
          <CodeBlock title="gantry.toml" lang="toml" code={config} highlight={[5, 8]} />
          <P>
            The two lit lines are the ones that matter most: <Code>build = &quot;lockfile&quot;</Code> tells Gantry to
            build web without a Dockerfile, and <Code>depends_on</Code> holds web back until the database is healthy.
          </P>
        </Step>

        <Step level={2} id="start-your-services" title="Start your services">
          <CodeBlock code={up} highlight={[6]} />
          <P>
            Open <Code>http://localhost:3000</Code>. The first run pulls base layers, about 180 MB for this project, which
            is most of those 48 seconds. Every run after that reuses them.
          </P>
          <Callout type="tip" title="Get your terminal back">
            Add <Code>-d</Code> to start in the background, then follow one service with <Code>gantry logs -f web</Code>.
          </Callout>
        </Step>

        <Step level={2} id="edit-and-reload" title="Edit and reload">
          <P>
            Change any file under <Code>src/</Code> and save. Gantry rebuilds only the source layer and restarts web; the
            database keeps running and keeps its data.
          </P>
          <CodeBlock lang="text" code={reload} />
          <P>
            Editing the lockfile rebuilds the dependency layer as well, which takes longer the first time and is cached
            from then on.
          </P>
        </Step>

        <Step level={2} id="shut-it-down" title="Shut it down">
          <P>
            Press <KbdCombo keys={["Ctrl", "C"]} size="sm" /> in the terminal running <Code>gantry up</Code>. Services
            stop in reverse dependency order and named volumes are kept, so your data is there next time.
          </P>
          <CodeBlock code={"# remove containers and named volumes\n$ gantry down --volumes"} />
          <Callout type="danger" title="--volumes deletes your local database">
            It removes every named volume in the project, including db-data. Dump anything you want to keep first with{" "}
            <Code>gantry exec db pg_dump app</Code>.
          </Callout>
        </Step>
      </Steps>

      <H2 id="next-steps">Next steps</H2>
      <LinkList
        items={[
          {
            href: docHref("configuration"),
            title: "Configure services",
            description: "Health checks, environment variables and profiles for CI.",
          },
          {
            href: docHref("deploying"),
            title: "Ship it",
            description: "Push the image you just ran to a registry or a server over SSH.",
          },
          {
            href: docHref("cli/up"),
            title: "gantry up",
            mono: true,
            description: "Start only some services, change ports, turn off watching.",
          },
        ]}
      />
    </>
  );
}
