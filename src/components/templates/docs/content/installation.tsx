import { installCommands } from "../config";
import { docHref } from "../docs";
import { A, Callout, Code, CodeBlock, CodeTabs, H2, H3, Kbd, P, PackageTabs, RefTable } from "../mdx";

const completions = {
  zsh: `$ gantry completion zsh > "\${fpath[1]}/_gantry"`,
  bash: "$ gantry completion bash > ~/.local/share/bash-completion/completions/gantry",
  fish: "$ gantry completion fish > ~/.config/fish/completions/gantry.fish",
};

export function Installation() {
  return (
    <>
      <H2 id="install-the-cli">Install the CLI</H2>
      <P>
        Gantry ships as a single binary. Install it globally with the package manager you already use; the package only
        downloads the build for your platform, so it stays under 10 MB.
      </P>
      <PackageTabs commands={installCommands} />
      <P>
        Rather not go through a JavaScript package manager? The install script puts the binary in{" "}
        <Code>~/.gantry/bin</Code> and adds that folder to your PATH.
      </P>
      <CodeBlock code="$ curl -fsSL https://gantry.sh/install | sh" />
      <Callout type="tip" title="Pin the version in CI">
        Set <Code>GANTRY_VERSION=2.8.1</Code> before the script runs. Unpinned installs always fetch the latest release,
        which is rarely what a reproducible build wants.
      </Callout>

      <H2 id="verify">Verify the install</H2>
      <CodeBlock code={"$ gantry --version\ngantry 2.8.1 (darwin-arm64, built 2026-09-30)"} />
      <P>
        If your shell answers <Code>command not found</Code>, open a new terminal so it picks up the updated PATH. Still
        nothing? Run <Code>~/.gantry/bin/gantry doctor</Code>, which checks the install and tells you what to add to your
        shell profile.
      </P>

      <H2 id="requirements">System requirements</H2>
      <RefTable
        label="Supported platforms"
        head={["Platform", "Minimum", "Notes"]}
        rows={[
          ["macOS", "13 Ventura", "Apple silicon and Intel. Linux images run in a 30 MB VM that Gantry starts and stops for you."],
          ["Linux", "Kernel 5.11", "x86_64 and arm64. Rootless mode needs unprivileged user namespaces."],
          ["Windows", "WSL 2", "Install inside your WSL distribution, not in PowerShell."],
        ]}
      />
      <P>Plan for about 4 GB of free disk for the layer cache on a typical web project.</P>

      <H3 id="linux-rootless">Rootless mode on Linux</H3>
      <P>
        Gantry never asks for root. On Linux it maps your user to root inside the container with user namespaces, which a
        few distributions ship switched off. Check, and turn them on if the value is <Code>0</Code>:
      </P>
      <CodeBlock
        code={
          "$ sysctl kernel.unprivileged_userns_clone\nkernel.unprivileged_userns_clone = 0\n$ sudo sysctl -w kernel.unprivileged_userns_clone=1"
        }
      />
      <Callout type="warning" title="This is a system-wide setting">
        On shared machines and CI runners, check with whoever owns the host before changing it. Gantry falls back to
        running builds only, without starting containers, when namespaces are off.
      </Callout>

      <H2 id="shell-completion">Shell completion</H2>
      <P>
        Completion covers commands, flags, profile names and the service names in the nearest gantry.toml. Write the
        script for your shell, then open a new terminal.
      </P>
      <CodeTabs tabs={completions} group="shell" label="Shell" />
      <P>
        Try it: type <Code>gantry up --</Code> and press <Kbd size="sm">Tab</Kbd> to list every flag.
      </P>

      <H2 id="updating">Updating and uninstalling</H2>
      <P>
        Gantry updates itself in place, whichever way you installed it. It checks for a new release once a day and
        mentions it after a command finishes; it never updates on its own.
      </P>
      <CodeBlock code={"$ gantry self update\n$ gantry self uninstall --purge"} />
      <P>
        <Code>--purge</Code> also deletes the layer cache in <Code>~/.gantry</Code>. Without it, a reinstall picks up where
        you left off. Next, <A href={docHref("quickstart")}>run your first project</A>.
      </P>
    </>
  );
}
