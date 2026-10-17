import { docHref } from "../docs";
import { A, Callout, Code, CodeBlock, H2, H3, OL, P, RefTable } from "../mdx";

const full = `[project]
name = "acme-web"
pass_env = ["PAYMENTS_API_KEY"]   # read from your shell, never stored

[build]
platforms = ["linux/amd64", "linux/arm64"]

[service.web]
build = "lockfile"
command = ["pnpm", "dev"]
ports = ["3000"]
depends_on = ["db"]
watch = ["src/**", "public/**"]

[service.web.env]
DATABASE_URL = "postgres://app:\${DB_PASSWORD}@db:5432/app"

[service.worker]
build = "lockfile"
command = ["pnpm", "worker"]
depends_on = ["db"]

[service.db]
image = "postgres:17"
ports = ["5432"]
volumes = ["db-data:/var/lib/postgresql/data"]`;

export function Configuration() {
  return (
    <>
      <H2 id="gantry-toml">The gantry.toml file</H2>
      <P>
        Gantry looks for gantry.toml in the current folder, then in each parent up to the repository root, so commands
        work from anywhere in the project. One file describes every service. Here is a complete one for a web app with a
        background worker and a database.
      </P>
      <CodeBlock title="gantry.toml" lang="toml" code={full} />

      <H2 id="services">Services</H2>
      <P>
        Each <Code>[service.name]</Code> table is one container. The name is what you pass to <Code>--service</Code>, and
        what other services use to reach it on the project network: web connects to the database at{" "}
        <Code>db:5432</Code>.
      </P>
      <RefTable
        label="Service keys"
        head={["Key", "Type", "Description"]}
        rows={[
          ["build", "string", <>A Dockerfile path, or <Code>&quot;lockfile&quot;</Code> to build from the nearest lockfile.</>],
          ["image", "string", <>Run a prebuilt image instead. Can&apos;t be combined with <Code>build</Code>.</>],
          ["command", "string[]", "Replaces the image's default command."],
          ["ports", "string[]", <>Published ports as <Code>host:container</Code>. A bare number uses the same port on both sides.</>],
          ["depends_on", "string[]", "Services that must be healthy before this one starts."],
          ["volumes", "string[]", <><Code>name:/path</Code> for named volumes, <Code>./dir:/path</Code> to mount a project folder.</>],
          ["watch", "string[]", "Globs that trigger a rebuild on save. Defaults to the whole build context."],
        ]}
      />

      <H3 id="health-checks">Health checks</H3>
      <P>
        A service counts as started when its health check passes, not when its process launches. Without one, Gantry
        waits for the first published port to accept a connection, which is usually close enough for databases and
        rarely for web apps.
      </P>
      <CodeBlock
        title="gantry.toml"
        lang="toml"
        code={'[service.web.health]\nhttp = "/api/health"   # any 2xx counts\ninterval = "2s"\ntimeout = "60s"'}
      />

      <H2 id="build-settings">Build settings</H2>
      <P>
        The <Code>[build]</Code> table applies to every service that builds. Anything set under{" "}
        <Code>[service.name.build]</Code> wins for that service.
      </P>
      <RefTable
        label="Build keys"
        head={["Key", "Default", "Description"]}
        rows={[
          ["platforms", "host", <>Targets for <Code>gantry build</Code>, e.g. <Code>linux/arm64</Code>.</>],
          ["cache", "~/.gantry/layers", "Where layers are kept between builds."],
          ["args", "{}", <>Build arguments, available as <Code>ARG</Code> in Dockerfiles.</>],
          ["sync", "\"safe\"", <><Code>&quot;fast&quot;</Code> keeps the project on the VM&apos;s disk on macOS. Faster for node_modules.</>],
        ]}
      />

      <H2 id="environment-variables">Environment variables</H2>
      <P>
        Set variables per service in an <Code>env</Code> table, or load them from files. Values can use{" "}
        <Code>{"${NAME}"}</Code> to reference other variables, including ones from your shell listed in{" "}
        <Code>pass_env</Code>.
      </P>
      <CodeBlock
        title="gantry.toml"
        lang="toml"
        code={'[service.web.env]\nDATABASE_URL = "postgres://app:${DB_PASSWORD}@db:5432/app"\nNODE_ENV = "development"'}
      />

      <H3 id="precedence">Precedence</H3>
      <P>When the same variable is set in more than one place, the first match in this list wins:</P>
      <OL>
        <li>
          <Code>--env KEY=value</Code> on the command line.
        </li>
        <li>
          Your shell&apos;s environment, for names listed in <Code>pass_env</Code>.
        </li>
        <li>
          <Code>.env.local</Code>, then <Code>.env</Code>, in the project root.
        </li>
        <li>
          The <Code>env</Code> table in gantry.toml.
        </li>
      </OL>
      <Callout type="warning" title="Keep secrets out of gantry.toml">
        gantry.toml is meant to be committed. Put secrets in <Code>.env.local</Code>, which <Code>gantry init</Code> adds
        to your .gitignore, or pass them through from your shell with <Code>pass_env</Code>.
      </Callout>

      <H2 id="profiles">Profiles</H2>
      <P>
        A profile overrides parts of the file for one context. CI usually wants no file watching and a database that
        trades durability for speed.
      </P>
      <CodeBlock
        title="gantry.toml"
        lang="toml"
        code={'[profile.ci]\nwatch = false\n\n[profile.ci.service.db]\nimage = "postgres:17-alpine"\ncommand = ["postgres", "-c", "fsync=off"]'}
      />
      <CodeBlock code="$ gantry up --profile ci -d" />
      <P>
        Profiles also choose where <A href={docHref("deploying")}>gantry ship</A> sends a release, so one file can
        describe local, CI and production.
      </P>
    </>
  );
}
