import { repoUrl } from "../config";
import { docHref } from "../docs";
import { A, Callout, Code, CodeBlock, H2, P } from "../mdx";

const doctor = `$ gantry doctor
  ok    gantry 2.8.1 (darwin-arm64)
  ok    vm running · 4 CPUs · 6 GB memory
  ok    layer cache · 3.1 GB · 214 layers
  warn  port 5432 is taken by pid 812 (postgres)
  ok    registry.example.com · logged in as ana`;

export function Troubleshooting() {
  return (
    <>
      <H2 id="run-gantry-doctor">Run gantry doctor first</H2>
      <P>
        Most problems show up in <Code>gantry doctor</Code>. It checks the install, kernel features, the VM, ports and
        the layer cache in about two seconds, and prints a fix next to anything that isn&apos;t <Code>ok</Code>.
      </P>
      <CodeBlock code={doctor} highlight={[5]} />

      <H2 id="port-already-in-use">Port already in use</H2>
      <CodeBlock lang="text" code="error[E0412]: can't publish db on :5432, the port is taken by pid 812 (postgres)" />
      <P>
        Something else already has the port, often a database installed with your system&apos;s package manager. Stop
        it, or publish on a different host port for this run:
      </P>
      <CodeBlock code="$ gantry up --port db=5433:5432" />
      <P>
        To make that permanent, change <Code>ports</Code> in gantry.toml. Other services still reach the database at{" "}
        <Code>db:5432</Code> on the project network, so only tools on your machine need the new port.
      </P>

      <H2 id="permission-denied">Permission denied on Linux</H2>
      <CodeBlock lang="text" code="error[E0107]: newuidmap: write to uid_map failed: Operation not permitted" />
      <P>
        Your user has no subordinate ID range, which rootless containers need. Add one, then log out and back in:
      </P>
      <CodeBlock code="$ sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER" />
      <Callout type="warning" title="Don't reach for sudo gantry">
        Files created in the layer cache would then belong to root, and every later run as your own user fails with a
        different permission error.
      </Callout>

      <H2 id="stale-layers">Builds ignore lockfile changes</H2>
      <P>
        Gantry keys the dependency layer on the lockfile&apos;s contents. If you edited package.json without running an
        install, the lockfile didn&apos;t change and neither does the build. Run your package manager&apos;s install, then
        build again.
      </P>
      <P>If a layer really is stale, rebuild just that layer and keep the rest of the cache:</P>
      <CodeBlock code="$ gantry build web --no-cache=deps" />

      <H2 id="slow-first-build">Slow first build on macOS</H2>
      <P>
        The first build pulls base images and fills the cache; two to four minutes is normal on a fresh machine. If later
        builds are slow too, the VM is probably short on memory:
      </P>
      <CodeBlock code="$ gantry vm set --memory 6GB --cpus 4" />
      <P>
        Projects with many small files, like a large node_modules, build faster with <Code>sync = &quot;fast&quot;</Code>{" "}
        in the <A href={docHref("configuration", "build-settings")}>build settings</A>.
      </P>

      <H2 id="getting-help">Getting help</H2>
      <P>
        Ask in <A href={`${repoUrl}/discussions`}>GitHub Discussions</A> and attach the output of{" "}
        <Code>gantry doctor --report</Code>, which leaves out tokens and hostnames. For bugs,{" "}
        <A href={`${repoUrl}/issues/new`}>open an issue</A> with the command you ran and its full output. Maintainers
        triage every weekday, and most issues get a first reply within a day.
      </P>
    </>
  );
}
