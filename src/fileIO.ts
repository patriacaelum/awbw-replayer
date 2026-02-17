import { AsyncGunzip, strFromU8, unzip } from "fflate";

export type ReplayData = {
  turnData: string;
  actionData: string;
};

export function unzipReplayFile(data: Uint8Array): Promise<ReplayData> {
  return new Promise((resolve, reject) => {
    unzip(data, (err, unzipped) => {
      if (err) {
        reject(err);
        return;
      }

      let turnData: string = "";
      let actionData: string = "";

      Promise.all(
        Object.keys(unzipped).map(async (filename: string) => {
          const compressedData = unzipped[filename];
          const decompressedData = await decompressFile(compressedData);
          
          if (filename.startsWith("a")) {
            actionData = decompressedData;
          } else {
            turnData = decompressedData;
          }
        })
      ).then(() => resolve({ turnData, actionData })).catch(reject);
    });
  });
}

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
