import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileDropzone, FileList, formatBytes, type FileListItem } from "@/components/ui/file-dropzone";

const MB = 1024 * 1024;

function makeFile(name: string, type: string, size = 1024) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function setup(props: React.ComponentProps<typeof FileDropzone> = {}) {
  const onFilesChange = vi.fn();
  const onReject = vi.fn();
  const utils = render(<FileDropzone onFilesChange={onFilesChange} onReject={onReject} {...props} />);
  const zone = screen.getByRole("button");
  const input = utils.container.querySelector('input[type="file"]') as HTMLInputElement;
  return { ...utils, zone, input, onFilesChange, onReject };
}

const dataTransfer = (files: File[]) => ({
  files,
  types: ["Files"],
  items: files.map((file) => ({ kind: "file", type: file.type })),
  dropEffect: "none",
});

describe("FileDropzone", () => {
  it("is a button named by its label and described by its description", () => {
    const { zone } = setup({ description: "PNG or PDF · up to 10 MB" });
    expect(zone).toHaveAccessibleName("Drop files here or browse");
    expect(zone).toHaveAccessibleDescription("PNG or PDF · up to 10 MB");
    expect(zone).toHaveAttribute("tabindex", "0");
  });

  it("opens the picker on click, Enter and Space", () => {
    const { zone, input } = setup();
    const click = vi.spyOn(input, "click").mockImplementation(() => {});
    fireEvent.click(zone);
    fireEvent.keyDown(zone, { key: "Enter" });
    fireEvent.keyDown(zone, { key: " " });
    expect(click).toHaveBeenCalledTimes(2);
    fireEvent.keyUp(zone, { key: " " });
    expect(click).toHaveBeenCalledTimes(3);
  });

  it("passes the input's attributes through", () => {
    const { input } = setup({ accept: "image/*", multiple: false });
    expect(input).toHaveAttribute("accept", "image/*");
    expect(input.multiple).toBe(false);
  });

  it("accepts files from the picker and clears the input", () => {
    const { input, onFilesChange, onReject } = setup();
    const photo = makeFile("hero.png", "image/png");
    fireEvent.change(input, { target: { files: [photo] } });
    expect(onFilesChange).toHaveBeenCalledWith([photo]);
    expect(onReject).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("1 file added.");
  });

  it("rejects by type, size and count with reasons", () => {
    const { input, onFilesChange, onReject } = setup({ accept: "image/*,.pdf", maxSize: 2 * MB, maxFiles: 2 });
    const ok1 = makeFile("a.png", "image/png");
    const pdf = makeFile("brief.pdf", "");
    const zip = makeFile("kit.zip", "application/zip");
    const huge = makeFile("huge.jpg", "image/jpeg", 5 * MB);
    const extra = makeFile("extra.webp", "image/webp");
    fireEvent.change(input, { target: { files: [ok1, zip, pdf, huge, extra] } });

    expect(onFilesChange).toHaveBeenCalledWith([ok1, pdf]);
    const rejections = onReject.mock.calls[0][0];
    expect(rejections.map((r: { file: File; reason: string }) => [r.file.name, r.reason])).toEqual([
      ["kit.zip", "file-type"],
      ["huge.jpg", "file-size"],
      ["extra.webp", "file-count"],
    ]);
    expect(rejections[1].message).toBe("Larger than 2 MB");
    expect(screen.getByRole("status")).toHaveTextContent("2 files added. kit.zip: This file type isn't accepted.");
  });

  it("takes one file when multiple is off", () => {
    const { input, onFilesChange, onReject } = setup({ multiple: false });
    const a = makeFile("a.png", "image/png");
    const b = makeFile("b.png", "image/png");
    fireEvent.change(input, { target: { files: [a, b] } });
    expect(onFilesChange).toHaveBeenCalledWith([a]);
    expect(onReject.mock.calls[0][0][0]).toMatchObject({ file: b, reason: "file-count", message: "Only one file at a time" });
  });

  it("powers up while files are dragged over and accepts the drop", () => {
    const { zone, onFilesChange } = setup();
    const photo = makeFile("hero.png", "image/png");
    expect(zone).toHaveAttribute("data-state", "idle");
    fireEvent.dragEnter(zone, { dataTransfer: dataTransfer([photo]) });
    expect(zone).toHaveAttribute("data-state", "dragging");
    expect(zone).toHaveAccessibleName("Release to add files");
    fireEvent.dragOver(zone, { dataTransfer: dataTransfer([photo]) });
    fireEvent.drop(zone, { dataTransfer: dataTransfer([photo]) });
    expect(zone).toHaveAttribute("data-state", "idle");
    expect(onFilesChange).toHaveBeenCalledWith([photo]);
  });

  it("counts nested drag enter and leave", () => {
    const { zone } = setup();
    const photo = makeFile("hero.png", "image/png");
    const label = zone.querySelector("p") as HTMLElement;
    fireEvent.dragEnter(zone, { dataTransfer: dataTransfer([photo]) });
    fireEvent.dragEnter(label, { dataTransfer: dataTransfer([photo]) });
    fireEvent.dragLeave(zone, { dataTransfer: dataTransfer([photo]) });
    expect(zone).toHaveAttribute("data-state", "dragging");
    fireEvent.dragLeave(label, { dataTransfer: dataTransfer([photo]) });
    expect(zone).toHaveAttribute("data-state", "idle");
  });

  it("warns during the drag when no file type can match", () => {
    const { zone } = setup({ accept: "image/*" });
    fireEvent.dragEnter(zone, { dataTransfer: dataTransfer([makeFile("kit.zip", "application/zip")]) });
    expect(zone).toHaveAttribute("data-state", "rejecting");
    expect(zone.style.getPropertyValue("--neon")).toBe("255 77 94");
  });

  it("ignores drags that carry no files", () => {
    const { zone } = setup();
    fireEvent.dragEnter(zone, { dataTransfer: { types: ["text/plain"], items: [], files: [] } });
    expect(zone).toHaveAttribute("data-state", "idle");
  });

  it("accepts pasted files", () => {
    const { zone, onFilesChange } = setup();
    const shot = makeFile("screenshot.png", "image/png");
    fireEvent.paste(zone, { clipboardData: { files: [shot] } });
    expect(onFilesChange).toHaveBeenCalledWith([shot]);
  });

  it("ignores everything while disabled", () => {
    const { zone, input, onFilesChange } = setup({ disabled: true });
    const click = vi.spyOn(input, "click").mockImplementation(() => {});
    expect(zone).toHaveAttribute("aria-disabled", "true");
    expect(zone).toHaveAttribute("tabindex", "-1");
    fireEvent.click(zone);
    fireEvent.keyDown(zone, { key: "Enter" });
    const photo = makeFile("hero.png", "image/png");
    fireEvent.dragEnter(zone, { dataTransfer: dataTransfer([photo]) });
    expect(zone).toHaveAttribute("data-state", "idle");
    fireEvent.drop(zone, { dataTransfer: dataTransfer([photo]) });
    fireEvent.paste(zone, { clipboardData: { files: [photo] } });
    expect(click).not.toHaveBeenCalled();
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("renders custom children in place of the default content", () => {
    render(
      <FileDropzone>
        <span>Upload a photo</span>
      </FileDropzone>,
    );
    expect(screen.getByRole("button", { name: "Upload a photo" })).toBeInTheDocument();
  });
});

describe("FileList", () => {
  const files: FileListItem[] = [
    { id: "1", name: "q3-revenue.xlsx", size: 412_000, status: "done" },
    { id: "2", name: "deck.pdf", size: 6_300_000, status: "uploading", progress: 42 },
    { id: "3", name: "interview.m4a", size: 31_800_000, status: "error", progress: 18, error: "Storage quota reached" },
    { id: "4", name: "backup.tar.gz", size: 1_240_000_000, status: "queued" },
  ];

  it("shows status, size and a progress tube per file", () => {
    render(<FileList aria-label="Uploads" files={files} />);
    const list = screen.getByRole("list", { name: "Uploads" });
    expect(list.querySelectorAll("li")).toHaveLength(4);
    expect(screen.getByText("Uploaded")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("Storage quota reached")).toBeInTheDocument();
    expect(screen.getByText("Queued")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "deck.pdf upload" })).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByRole("progressbar", { name: "q3-revenue.xlsx upload" })).toHaveAttribute("aria-valuenow", "100");
  });

  it("offers retry on failed rows and remove on all", () => {
    const onRetry = vi.fn();
    const onRemove = vi.fn();
    render(<FileList files={files} onRetry={onRetry} onRemove={onRemove} />);
    expect(screen.getAllByRole("button", { name: /^Retry/ })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Retry interview.m4a" }));
    expect(onRetry).toHaveBeenCalledWith("3");
    fireEvent.click(screen.getByRole("button", { name: "Cancel deck.pdf" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove backup.tar.gz" }));
    expect(onRemove.mock.calls).toEqual([["2"], ["4"]]);
  });

  it("gives the name its own line, with status and size under the tube", () => {
    render(<FileList files={files} />);
    const name = screen.getByText("interview.m4a");
    const row = name.closest("li") as HTMLElement;
    expect(name).toHaveTextContent(/^interview\.m4a$/);
    const status = screen.getByText("Storage quota reached").closest("div") as HTMLElement;
    expect(status).toHaveTextContent("30 MB");
    expect(row).toContainElement(status);
  });

  it("reserves the retry slot on every row when retry is on, so the tubes line up", () => {
    render(<FileList files={files} onRetry={() => {}} />);
    const rows = screen.getAllByRole("listitem");
    rows.forEach((row) => {
      const actions = row.lastElementChild as HTMLElement;
      expect(actions.children).toHaveLength(1);
    });
  });

  it("has no action buttons without handlers", () => {
    render(<FileList files={files} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("announces finished and failed uploads", () => {
    const { rerender } = render(<FileList files={[{ id: "a", name: "a.png", size: 10, status: "uploading", progress: 90 }]} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    act(() => {
      rerender(<FileList files={[{ id: "a", name: "a.png", size: 10, status: "done" }]} />);
    });
    expect(screen.getByRole("status")).toHaveTextContent("a.png uploaded.");
  });
});

describe("formatBytes", () => {
  it("formats sizes for people", () => {
    expect(formatBytes(18)).toBe("18 B");
    expect(formatBytes(412_000)).toBe("402 KB");
    expect(formatBytes(2.4 * MB)).toBe("2.4 MB");
    expect(formatBytes(1_240_000_000)).toBe("1.2 GB");
  });
});
