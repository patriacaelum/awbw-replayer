import { invoke } from "@tauri-apps/api/core";
import { Menu, MenuItem, Submenu, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { open } from "@tauri-apps/plugin-dialog";
import { info } from "@tauri-apps/plugin-log";

import { loadReplayFile } from "./replay/loader";

const fileSubmenu = await Submenu.new({
  text: "File",
  items: [
    await MenuItem.new({
      id: "new",
      text: "New",
      action: (id: string) => { info(`${id} button pressed`) },
    }),
    await MenuItem.new({
      id: "open_replay",
      text: "Open Replay",
      action: async (id: string) => {
        info(`${id} button pressed`);
        const filepath = await open({
          multiple: false,
          directory: false,
          filters: [{ name: "Zipfile", extensions: ["zip"], }],
        });

        if (filepath === null) {
          return;
        }

        info(`selected ${filepath}`);
        loadReplayFile(filepath);
      },
    }),
    await MenuItem.new({
      id: "save_as",
      text: "Save As...",
      action: (id: string) => { info(`${id} button pressed`) },
    }),
    await PredefinedMenuItem.new({
      item: "Separator",
    }),
    await MenuItem.new({
      id: "quit",
      text: "Quit",
      action: (id: string) => { info(`${id} button pressed`) },
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

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
