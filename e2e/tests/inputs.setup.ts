import { test as setup } from "@playwright/test";
import { app } from "../app";

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

async function downloadFile(url: string) {
  const fileName = url.split("/").pop()!;
  const filePath = path.resolve("playwright/downloads", fileName);

  const response = await fetch(url);

  if (response.ok && response.body != null) {
    console.log(`fetching ${fileName}`);
    // @ts-ignore
    const stream = Readable.fromWeb(response.body);
    await writeFile(filePath, stream);
  }
}

setup("download", async ({ page }) => {
  const rawUrls = app.inputs.map((u) =>
    u
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob/", "/refs/heads/")
  );
  await Promise.all(rawUrls.map(downloadFile));
});
