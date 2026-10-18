import { docHref } from "../docs";
import { A, Callout, Code, CodeBlock, H2, H3, P, Strong, UL } from "../mdx";

const registry = `$ gantry login registry.example.com
$ gantry ship --registry registry.example.com/acme/web
  build    web @ 4f2a9c1 (cached)
  push     12 layers, 3 new · 41.8 MB               6.2s
  tagged   4f2a9c1, latest`;

const ssh = `$ gantry ship --host deploy@203.0.113.24
  upload   3 new layers · 41.8 MB                   4.9s
  start    web (blue) -> healthy                    2.4s
  switch   :443 -> web (blue)
  drain    web (green) · stopped after 30s`;

const target = `[deploy.production]
host = "deploy@203.0.113.24"
services = ["web", "worker"]
drain = "30s"
keep = 5`;

const rollback = `$ gantry releases --target production
  4f2a9c1  current   2 Oct 14:02   Ana Ruiz
  9b81e07            1 Oct 18:45   Tomás Lindqvist
  77c0d1a            1 Oct 11:20   Ana Ruiz
$ gantry ship --rollback --target production
  switch   :443 -> web @ 9b81e07                    0.3s`;

const ci = `deploy:
  when: branch == "main"
  steps:
    - run: npm install -g @gantry/cli
    - run: gantry ship --target production
      env:
        GANTRY_TOKEN: \${{ secrets.GANTRY_TOKEN }}`;

export function Deploying() {
  return (
    <>
      <H2 id="how-shipping-works">How shipping works</H2>
      <P>
        <Code>gantry ship</Code> takes the image <Code>gantry build</Code> produced, the same bytes you ran locally, and
        puts it somewhere a server can run it. It never rebuilds on the way out. If there is no image for the current
        commit yet, ship builds one first and says so.
      </P>
      <UL>
        <li>
          <Strong>Registry.</Strong> Push to any OCI registry and let your platform pull from there.
        </li>
        <li>
          <Strong>Host.</Strong> Copy the image to a server over SSH and run it there. No registry needed.
        </li>
      </UL>

      <H2 id="push-to-a-registry">Push to a registry</H2>
      <P>
        Log in once per registry, then ship. Gantry tags the image with the commit hash and, on your default branch, with{" "}
        <Code>latest</Code>. Only layers the registry doesn&apos;t have are uploaded.
      </P>
      <CodeBlock code={registry} />

      <H2 id="deploy-over-ssh">Deploy to a host over SSH</H2>
      <P>
        Any Linux host you can reach over SSH works. The first ship installs a 6 MB agent in the deploy user&apos;s home
        folder; nothing runs as root and nothing listens on a public port except your service.
      </P>
      <CodeBlock code={ssh} highlight={[4]} />
      <P>Name your targets in gantry.toml so everyone on the team ships to the same place with the same settings:</P>
      <CodeBlock title="gantry.toml" lang="toml" code={target} />

      <H3 id="zero-downtime">Zero-downtime swaps</H3>
      <P>
        Gantry starts the new version next to the old one, waits for its{" "}
        <A href={docHref("configuration", "health-checks")}>health check</A>, moves traffic across and then drains the old
        container. If the new version never gets healthy, the old one keeps serving and ship exits with code 3.
      </P>
      <Callout type="danger" title="--force skips the health check">
        <Code>gantry ship --force</Code> switches traffic as soon as the new container starts, healthy or not. Use it only
        to replace a release that is already down.
      </Callout>

      <H2 id="rolling-back">Rolling back</H2>
      <P>
        Each target keeps its last five releases, or as many as <Code>keep</Code> says. A rollback is a traffic switch,
        not a rebuild, so it takes about as long as one health check.
      </P>
      <CodeBlock code={rollback} highlight={[2]} />

      <H2 id="ship-from-ci">Ship from CI</H2>
      <P>
        In CI, authenticate with a deploy token instead of an SSH agent. Create one with{" "}
        <Code>gantry tokens create --target production</Code>; each token works for one target and can be revoked
        without touching the others.
      </P>
      <CodeBlock title=".ci/deploy.yml" lang="yaml" code={ci} />
      <Callout type="note">
        Ship from the same commit your tests ran on. Gantry refuses to ship a dirty working tree unless you pass{" "}
        <Code>--allow-dirty</Code>.
      </Callout>
    </>
  );
}
