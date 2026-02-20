import { invoke } from "@tauri-apps/api/core";
import { Menu, MenuItem, Submenu, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";

import { createDirectory, saveFile, unzipReplayFile } from "./fileIO";

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", setup);
} else {
  setup();
}

async function setup() {
  setupMenubar();

  const btnImportNew = document.querySelector("#btn-import-new");
  const btnOpenRecent = document.querySelector("#btn-open-recent");

  btnImportNew?.addEventListener("click", async () => {
    info("Import new button pressed");
    await importNewReplay();
  });
  btnOpenRecent?.addEventListener("click", () => {
    info("Open recent button pressed");
    location.assign(`/replay.html?id=${encodeURIComponent("test")}`);
  });
}

async function setupMenubar(): Promise<void> {
  const fileSubmenu = await Submenu.new({
    text: "File",
    items: [
      await MenuItem.new({
        id: "import_new",
        text: "Import New",
        action: async (id: string) => {
          info(`${id} menu item pressed`);
          await importNewReplay();
        },
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await MenuItem.new({
        id: "quit",
        text: "Quit",
        action: async (id: string) => {
          info(`${id} menu item pressed`);
          await invoke("quit_app");
        },
      }),
    ],
  });

  const menu = await Menu.new({
    items: [
      fileSubmenu,
      // MacOS only supports submenus, so this might not show
      await MenuItem.new({ id: "status", text: "Status: Processing...", enabled: false }),
    ],
  });

  menu.setAsAppMenu().then(async (result) => {
    console.log("Successfully set menu", result);
    info("Successfully set menu");

    const statusItem = await menu.get("status");
    if (statusItem) {
      await statusItem.setText("Status: Ready");
    }
  });
}

/** Open a file dialog to select a replay zip file and save it to $APPDATA.
  */
async function importNewReplay(): Promise<void> {
  const filepath = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "Zipfile", extensions: ["zip"] }],
  });

  if (filepath === null) {
    info("No file selected");
    return;
  } else {
    info(`Selected ${filepath}`);
  }

  const fileData = await readFile(filepath);
  const replayData = await unzipReplayFile(fileData);
  await createDirectory("replays");

  let replayId: string = "";

  await Promise.all(Object.keys(replayData).map(async (filename: string) => {
    await saveFile("replays/" + filename, replayData[filename]);

    if (!filename.startsWith("a")) {
      replayId = filename;
    }
  }));

  location.assign(`/replay.html?id=${encodeURIComponent(replayId)}`);
}
