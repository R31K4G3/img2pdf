import init, { img2pdf } from "./img2pdf.js";

let flagAsReady;
const promiseWaitingForReady = new Promise(r => { flagAsReady = r; });

self.addEventListener("message", async e => {
  await promiseWaitingForReady;
  const { msgId, fileBytes } = e.data;
  const allBytes = new Uint8Array(await new Blob(fileBytes).arrayBuffer());
  const sizes = Uint32Array.from(fileBytes.map(file => file.byteLength));
  try {
    const pdf = img2pdf(allBytes, sizes);
    self.postMessage({ msgId, pdf, error: null }, { transfer: [pdf.buffer] });
  } catch(e) {
    self.postMessage({ msgId, pdf: null, error: `${e}` });
  }
});

init({ module_or_path: await WebAssembly.compile(await (await fetch("./img2pdf.wasm")).arrayBuffer()) });

flagAsReady();
