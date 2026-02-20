import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { error, info } from "@tauri-apps/plugin-log";
import { AsyncGunzip, strFromU8, unzip } from "fflate";

export type ReplayData = { [filename: string]: string };

const FS_OPTIONS = { baseDir: BaseDirectory.AppData };

/** Create a directory in $APPDATA if it doesn't already exist.
  */
export async function createDirectory(path: string): Promise<void> {
  if (await pathExists(path)) {
    return;
  }

  return new Promise((resolve, reject) => {
    mkdir(path, { ...FS_OPTIONS, recursive: true })
      .then(() => {
        info(`Successfully created directory ${path}`);
        resolve();
      })
      .catch((err) => {
        error(JSON.stringify(err));
        reject(new Error(`Failed to create directory ${path}`));
      });
  });
}

/** Opens a text file in $APPDATA.
  */
export async function openFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    readTextFile(path, FS_OPTIONS)
      .then(resolve)
      .catch((err) => {
        error(JSON.stringify(err));
        reject(new Error(`Failed to open file ${path}`));
      });
  });
}

/** Checks if the path to the directory or file exists.
  */
export async function pathExists(path: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exists(path, FS_OPTIONS)
      .then((exists) => {
        if (exists) {
          info(`Path ${path} already exists`);
        } else {
          info(`Path ${path} does not exist`);
        }
        resolve(exists);
      })
      .catch((err) => {
        error(JSON.stringify(err));
        reject(new Error(`Failed to check if path ${path} exists`));
      });
  });
}

/** Saves the text file to $APPDATA.
  */
export async function saveFile(path: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    writeTextFile(path, data, FS_OPTIONS)
      .then(() => {
        info(`Successfully wrote text file ${path}`);
        resolve();
      })
      .catch((err) => {
        error(JSON.stringify(err));
        reject(new Error(`Failed to write text file ${path}`));
      });
  });
}

/** Unzips and decompresses its gzip contents.
  */
export async function unzipReplayFile(data: Uint8Array): Promise<ReplayData> {
  return new Promise((resolve, reject) => {
    unzip(data, (err, unzipped) => {
      if (err) {
        reject(err);
        return;
      }

      const replayData: ReplayData = {};

      Promise.all(
        Object.keys(unzipped).map(async (filename: string) => {
          const compressedData = unzipped[filename];
          const decompressedData = await decompressFile(compressedData);
          replayData[filename] = decompressedData;
        })
      ).then(() => resolve(replayData)).catch(reject);
    });
  });
}

/** Decompresses gzip data.
  */
async function decompressFile(data: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    const gunzip = new AsyncGunzip((err, chunk, final) => {
      if (err) {
        reject(err);
        return;
      }

      chunks.push(chunk);

      if (final) {
        const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
        const out = new Uint8Array(totalLength);
        let offset = 0;

        for (const c of chunks) {
          out.set(c, offset);
          offset += c.length;
        }

        resolve(strFromU8(out));
      }
    });

    // Push with final=false so Gunzip processes all concatenated gzip members;
    // only the last empty push signals end of stream.
    gunzip.push(data, false);
    gunzip.push(new Uint8Array(0), true);
  });
}
