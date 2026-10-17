import { docHref } from "../docs";
import { A, Code, CodeBlock, FlagTable, H2, KbdCombo, P, RefTable } from "../mdx";

const exitCodes: [string, string][] = [
  ["0", "Success: everything started and is healthy (with -d), or stopped cleanly."],
  ["1", "A build failed. The build log is printed above the error."],
  ["2", "gantry.toml is invalid. The message points at the file and line."],
  ["3", "A health check didn't pass within --timeout."],
  ["130", "Interrupted with Ctrl C."],
];

export function CliUp() {
  return (
    <>
      <H2 id="usage">Usage</H2>
      <CodeBlock code="$ gantry up [service...] [flags]" />

      <H2 id="description">Description</H2>
      <P>
        <Code>gantry up</Code> builds every service whose inputs changed, starts services in dependency order, and waits
        for each one&apos;s health check before starting anything that depends on it. Name services to start just those
        and whatever they depend on.
      </P>
      <P>
        In the foreground it streams logs from every service, prefixed with the service name, and rebuilds on save. Press{" "}
        <KbdCombo keys={["Ctrl", "C"]} size="sm" /> once to stop gracefully and twice to stop immediately.
      </P>

      <H2 id="options">Options</H2>
      <FlagTable
        label="gantry up flags"
        flags={[
          { flag: "-d, --detach", description: "Start in the background and return once everything is healthy." },
          { flag: "-p, --profile", arg: "<name>", default: "default", description: "Apply a profile from gantry.toml." },
          {
            flag: "--port",
            arg: "<svc=host:ctr>",
            description: "Publish a service on a different host port for this run. Repeatable.",
          },
          {
            flag: "-e, --env",
            arg: "<KEY=value>",
            description: "Set an environment variable for every service. Wins over all other sources.",
          },
          { flag: "--env-file", arg: "<path>", default: ".env", description: "Load variables from another file." },
          { flag: "--no-watch", description: "Don't rebuild on file changes. Implied by -d." },
          { flag: "--rebuild", description: "Ignore cached layers for the services being started." },
          {
            flag: "--pull",
            arg: "<when>",
            default: "missing",
            description: (
              <>
                When to pull base images: <Code>missing</Code>, <Code>always</Code> or <Code>never</Code>.
              </>
            ),
          },
          { flag: "--timeout", arg: "<duration>", default: "60s", description: "How long to wait for each health check." },
          { flag: "-q, --quiet", description: "Only print errors and the final status line." },
        ]}
      />

      <H2 id="examples">Examples</H2>
      <P>Start everything in the background:</P>
      <CodeBlock code="$ gantry up -d" />
      <P>Start only the API and the database it depends on, without watching files:</P>
      <CodeBlock code="$ gantry up api --no-watch" />
      <P>Use the CI profile and fail fast when a service takes more than 30 seconds to get healthy:</P>
      <CodeBlock code="$ gantry up --profile ci --timeout 30s -d" />

      <H2 id="exit-codes">Exit codes</H2>
      <RefTable label="gantry up exit codes" head={["Code", "Meaning"]} rows={exitCodes} />
      <P>
        Building without starting anything? See <A href={docHref("cli/build")}>gantry build</A>.
      </P>
    </>
  );
}
