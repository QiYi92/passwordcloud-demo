/* ------------------------------------------------------------------ *
 *  src/utils/drawio.ts   — refactor 2025-05-XX (支持 XML/PNG/SVG 三格式上传)
 * ------------------------------------------------------------------ */

console.log("[drawio] file loaded 👉", import.meta.url);

import drawioEmbed from "drawio-embed";
import axios from "axios";
import { ElMessage } from "element-plus";

const ROOT = import.meta.env.VITE_DRAWIO_URL as string;
if (!ROOT) throw new Error("[drawio] 缺少 VITE_DRAWIO_URL");
const DRAWIO_URL = ROOT.endsWith("/") ? ROOT : ROOT + "/";

export type OpenDrawioFn = (xml?: string) => Promise<void>;

// @ts-expect-error
export const openDrawio = drawioEmbed(DRAWIO_URL, {
  urlParams: { lang: "zh", proto: "json" }
}) as unknown as OpenDrawioFn;

let drawioWin: Window | null = null;
let pendingXml = "";

export const loadXmlIntoDrawio = (xml?: string) => {
  if (!xml) return;
  if (!drawioWin) {
    pendingXml = xml;
    return;
  }
  console.log("[drawio] [load] xml length", xml.length);
  drawioWin.postMessage(
    JSON.stringify({ action: "load", xml, title: "diagram", autosave: 1 }),
    "*"
  );
};

declare global {
  interface Window {
    __DRAWIO_ROW_ID__?: number | null;
  }
}
if (!("__DRAWIO_ROW_ID__" in window)) window.__DRAWIO_ROW_ID__ = null;

export const setCurrentRowId = (id: number | null) => {
  window.__DRAWIO_ROW_ID__ = id;
  console.log("[drawio] setCurrentRowId =", id);
};

export function initDrawioSaveListener(
  onComplete: (
    rowId: number,
    xmlUrl: string,
    pngUrl: string,
    svgUrl: string
  ) => void
) {
  const cache = new Map<
    number,
    { xml?: string; png?: string; svg?: string; done?: boolean }
  >();

  window.addEventListener("message", async ev => {
    let msg: any;
    try {
      msg = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
    } catch {
      return;
    }

    if (!drawioWin && msg.event === "init") {
      drawioWin = ev.source as Window;
      console.log("[drawio] [msg] init — win stored");
      if (pendingXml) loadXmlIntoDrawio(pendingXml);
      pendingXml = "";
      return;
    }
    if (ev.source !== drawioWin) return;
    if (msg.event !== "save" && msg.event !== "export") return;

    const rowId = window.__DRAWIO_ROW_ID__;
    if (rowId == null) return;
    const item = cache.get(rowId) ?? {};

    // 收 XML 并触发 PNG+SVG 导出
    if (msg.event === "save" && typeof msg.xml === "string") {
      item.xml = msg.xml;
      console.log("[drawio] XML 收到, size=", item.xml.length);
      drawioWin?.postMessage(
        JSON.stringify({ action: "export", format: "png", zoom: 1200 }),
        "*"
      );
      drawioWin?.postMessage(
        JSON.stringify({ action: "export", format: "svg" }),
        "*"
      );
    }

    // 收 PNG
    if (
      msg.event === "export" &&
      msg.format === "png" &&
      typeof msg.data === "string"
    ) {
      item.png = msg.data;
      console.log("[drawio] PNG 收到, size=", item.png.length);
    }

    // —— 修改后的 SVG 处理逻辑 ——
    if (
      msg.event === "export" &&
      msg.format === "svg" &&
      typeof msg.data === "string"
    ) {
      const [, payload] = msg.data.split(/,(.+)/); // 拆掉 dataURL 头

      let svgText: string;
      if (msg.data.startsWith("data:image/svg+xml;base64,")) {
        // ① Base64 ➜ 二进制字节串
        const binary = atob(payload);
        // ② binary ➜ Uint8Array
        const u8 = Uint8Array.from(binary, ch => ch.charCodeAt(0));
        // ③ 按 UTF-8 正确解码
        svgText = new TextDecoder("utf-8").decode(u8); // ← 关键！
      } else {
        // draw.io 还支持 “;utf8,<svg…>” 形式，这里不需要再做 URI 解码
        svgText = payload;
      }
      item.svg = svgText;
      console.log("[drawio] SVG 收到, length=", svgText.length);
    }

    cache.set(rowId, item);

    // 三者齐，则上传
    if (item.xml && item.png && item.svg && !item.done) {
      item.done = true;
      try {
        console.log("[drawio] 三格式齐, 开始上传…");
        // PNG
        const pngUrl = await uploadBlob(dataUrlToBlob(item.png), rowId, "png");
        // XML
        const xmlBlob = new Blob([item.xml], { type: "application/xml" });
        const xmlUrl = await uploadBlob(xmlBlob, rowId, "xml");
        // SVG
        const svgBlob = new Blob([item.svg], {
          type: "image/svg+xml;charset=utf-8"
        });
        const svgUrl = await uploadBlob(svgBlob, rowId, "svg");
        console.log("[drawio] 上传成功 :", { xmlUrl, pngUrl, svgUrl });
        onComplete(rowId, xmlUrl, pngUrl, svgUrl);
      } catch (e) {
        console.error(e);
        ElMessage.error("流程图上传失败");
      } finally {
        cache.delete(rowId);
        window.__DRAWIO_ROW_ID__ = null;
      }
    }
  });
}

function dataUrlToBlob(dataUrl: string) {
  const [, b64] = dataUrl.split(",");
  return new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], {
    type: "image/png"
  });
}

async function uploadBlob(
  blob: Blob,
  rowId: number,
  ext: "png" | "xml" | "svg"
): Promise<string> {
  const fd = new FormData();
  fd.append("file", blob, `workflow.${ext}`);
  fd.append("ext", ext);
  const { data } = await axios.put(
    `${import.meta.env.VITE_APP_SERVER}/api/workflows/${rowId}/uploadImage`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.path as string;
}
