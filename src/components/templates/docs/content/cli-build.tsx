import { docHref } from "../docs";
import { A, Callout, Code, CodeBlock, FlagTable, H2, P, RefTable } from "../mdx";
import { LayerStack } from "./layer-stack";

const multi = `$ gantry build web --platform linux/amd64,linux/arm64 --push
  resolve  pnpm-lock.yaml · 412 packages           0.19s
  layers   linux/amd64 · 4 cached                  0.08s
  layers   linux/arm64 · 3 cached · 1 built        11.4s
  push     registry.example.com/acme/web:4f2a9c1    5.7s`;

export function CliBuild() {
  return (
    <>
      <H2 id="usage">Usage</H2>
      <CodeBlock code="$ gantry build [service...] [flags]" />

      <H2 id="description">Description</H2>
      <P>
        <Code>gantry build</Code> produces an OCI image for each named service, or for every service that builds when you
        name none. Services with a Dockerfile are built from it; services set to <Code>build = &quot;lockfile&quot;</Code>{" "}
        get a generated recipe based on the lockfile it finds.
      </P>
      <P>
        Images are tagged <Code>project-service:commit</Code> and stay on your machine unless you pass{" "}
        <Code>--push</Code>. <A href={docHref("cli/up")}>gantry up</A> runs the same build before starting anything.
      </P>

      <H2 id="options">Options</H2>
      <FlagTable
        label="gantry build flags"
        flags={[
          { flag: "-t, --tag", arg: "<name>", default: "<svc>:<sha>", description: "Tag to give the image. Repeatable." },
          { flag: "-f, --file", arg: "<path>", default: "Dockerfile", description: "Build from a different Dockerfile." },
          {
            flag: "--platform",
            arg: "<os/arch,...>",
            default: "host",
            description: "One or more target platforms. Non-native platforms build under emulation.",
          },
          { flag: "--target", arg: "<stage>", description: "Stop at a named stage of a multi-stage Dockerfile." },
          { flag: "--build-arg", arg: "<KEY=value>", description: "Set a build argument. Repeatable." },
          {
            flag: "--no-cache",
            arg: "[=layer]",
            description: (
              <>
                Rebuild without the cache, or only one layer: <Code>base</Code>, <Code>deps</Code> or <Code>src</Code>.
              </>
            ),
          },
          { flag: "--push", description: "Push to the registry in gantry.toml, or the one set with --registry." },
          {
            flag: "--output",
            arg: "<type>",
            default: "image",
            description: (
              <>
                <Code>image</Code>, <Code>tar</Code> for a portable archive, or <Code>dir</Code> to unpack the filesystem.
              </>
            ),
          },
          { flag: "--sbom", description: "Write a software bill of materials next to the image." },
        ]}
      />

      <H2 id="layer-cache">The layer cache</H2>
      <P>
        Every image Gantry builds is made of the same four layers, from slowest-changing at the bottom to fastest at
        the top. A change only rebuilds its own layer and the ones above it. Pick a change to see what it costs.
      </P>
      <LayerStack />
      <Callout type="note" title="The cache is per machine">
        Layers live in <Code>~/.gantry/layers</Code> and are never uploaded unless you push. In CI, cache that folder
        between runs; on a warm cache a typical build drops from minutes to seconds.
      </Callout>

      <H2 id="examples">Examples</H2>
      <P>Build every service for the host platform:</P>
      <CodeBlock code="$ gantry build" />
      <P>Build web for two platforms and push both to the registry:</P>
      <CodeBlock code={multi} />
      <P>Export the filesystem of a build stage to inspect it:</P>
      <CodeBlock code="$ gantry build web --target deps --output dir=./out" />

      <H2 id="exit-codes">Exit codes</H2>
      <RefTable
        label="gantry build exit codes"
        head={["Code", "Meaning"]}
        rows={[
          ["0", "Every image built, and pushed if --push was set."],
          ["1", "A build step failed. The failing step and its output are printed above."],
          ["2", "gantry.toml or the Dockerfile is invalid."],
          ["4", "Push was refused: not logged in, or no write access."],
          ["130", "Interrupted with Ctrl C."],
        ]}
      />
    </>
  );
}
