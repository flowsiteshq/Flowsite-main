import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  MousePointer2, RefreshCw, Loader2, Monitor, Smartphone, Tablet,
  Copy, Check, Code2, Info, ChevronDown, Globe,
} from "lucide-react";

// ─── Canvas heatmap renderer ──────────────────────────────────────────────────
function renderHeatmap(
  canvas: HTMLCanvasElement,
  clicks: { xPct: number; yPct: number }[],
  radius = 40
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (clicks.length === 0) return;

  // Draw each click as a radial gradient blob on an offscreen canvas
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const off = offscreen.getContext("2d")!;
  off.globalCompositeOperation = "source-over";

  for (const c of clicks) {
    const x = c.xPct * w;
    const y = c.yPct * h;
    const grad = off.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, "rgba(255,255,255,0.25)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    off.fillStyle = grad;
    off.beginPath();
    off.arc(x, y, radius, 0, Math.PI * 2);
    off.fill();
  }

  // Map greyscale intensity to a heat color palette
  const imageData = off.getImageData(0, 0, w, h);
  const output = ctx.createImageData(w, h);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3];
    if (alpha === 0) continue;
    const t = alpha / 255; // 0 = cold, 1 = hot
    let r = 0, g = 0, b = 0, a = 0;
    if (t < 0.25) {
      // blue → cyan
      const s = t / 0.25;
      r = 0; g = Math.round(s * 255); b = 255; a = Math.round(t * 4 * 180);
    } else if (t < 0.5) {
      // cyan → green
      const s = (t - 0.25) / 0.25;
      r = 0; g = 255; b = Math.round((1 - s) * 255); a = Math.round(180 + s * 30);
    } else if (t < 0.75) {
      // green → yellow
      const s = (t - 0.5) / 0.25;
      r = Math.round(s * 255); g = 255; b = 0; a = Math.round(210 + s * 20);
    } else {
      // yellow → red
      const s = (t - 0.75) / 0.25;
      r = 255; g = Math.round((1 - s) * 255); b = 0; a = Math.round(230 + s * 25);
    }
    output.data[i]     = r;
    output.data[i + 1] = g;
    output.data[i + 2] = b;
    output.data[i + 3] = Math.min(a, 255);
  }
  ctx.putImageData(output, 0, 0);
}

// ─── HeatmapTab ──────────────────────────────────────────────────────────────
interface HeatmapTabProps {
  projectId: number;
}

export function HeatmapTab({ projectId }: HeatmapTabProps) {
  const [selectedPage, setSelectedPage] = useState("/");
  const [days, setDays] = useState(30);
  const [deviceFilter, setDeviceFilter] = useState<"all" | "desktop" | "mobile" | "tablet">("all");
  const [copied, setCopied] = useState(false);
  const [showSnippet, setShowSnippet] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data, isLoading, refetch, isFetching } = trpc.clientPortal.getHeatmapData.useQuery(
    { projectId, pagePath: selectedPage, days },
    { refetchOnWindowFocus: false }
  );

  // Filter clicks by device
  const filteredClicks = (data?.clicks ?? []).filter((c) =>
    deviceFilter === "all" ? true : c.deviceType === deviceFilter
  );

  // Render heatmap whenever data or canvas changes
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderHeatmap(canvas, filteredClicks, 45);
  }, [filteredClicks]);

  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      drawHeatmap();
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [drawHeatmap]);

  const trackingSnippet = `<!-- FlowSites Click Heatmap Tracker -->
<script>
(function() {
  var PROJECT_ID = ${projectId};
  var API = "${window.location.origin}/api/trpc/clientPortal.recordHeatmapClick";
  var sid = sessionStorage.getItem("fs_sid") || Math.random().toString(36).slice(2);
  sessionStorage.setItem("fs_sid", sid);
  var dt = /Mobi|Android/i.test(navigator.userAgent) ? "mobile"
         : /iPad|Tablet/i.test(navigator.userAgent) ? "tablet" : "desktop";
  document.addEventListener("click", function(e) {
    var xPct = e.clientX / window.innerWidth;
    var yPct = (e.clientY + window.scrollY) / document.documentElement.scrollHeight;
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "0": { json: {
        projectId: PROJECT_ID,
        pagePath: window.location.pathname,
        xPct: Math.min(1, Math.max(0, xPct)),
        yPct: Math.min(1, Math.max(0, yPct)),
        sessionId: sid,
        deviceType: dt
      }}})
    });
  });
})();
</script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(trackingSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pages = data?.pages ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Click Heatmap</h2>
          <p className="text-xs text-gray-400 mt-0.5">See exactly where visitors click on your website</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {isFetching ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Refresh
        </button>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Page selector */}
        <div className="relative">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {pages.length === 0 ? (
              <option value="/">/</option>
            ) : (
              pages.map((p) => (
                <option key={p.pagePath} value={p.pagePath}>
                  {p.pagePath} ({p.count} clicks)
                </option>
              ))
            )}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Days filter */}
        <div className="relative">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Device filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {([
            { id: "all",     label: "All",     Icon: Globe },
            { id: "desktop", label: "Desktop", Icon: Monitor },
            { id: "mobile",  label: "Mobile",  Icon: Smartphone },
            { id: "tablet",  label: "Tablet",  Icon: Tablet },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setDeviceFilter(id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceFilter === id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs text-gray-400 font-medium">
          {filteredClicks.length.toLocaleString()} clicks
        </div>
      </div>

      {/* Heatmap canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50" style={{ height: 480 }}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="text-blue-400 animate-spin" />
            <p className="text-sm text-gray-500">Loading heatmap data…</p>
          </div>
        ) : filteredClicks.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
              <MousePointer2 size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">No click data yet</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Install the tracking snippet on your website to start collecting click data. Once visitors start clicking, their activity will appear here.
              </p>
            </div>
            <button
              onClick={() => setShowSnippet(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Code2 size={13} /> Get Tracking Snippet
            </button>
          </div>
        ) : (
          <>
            {/* Placeholder website wireframe background */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-12 bg-gray-400 mx-4 mt-4 rounded-lg" />
              <div className="grid grid-cols-3 gap-4 mx-4 mt-4">
                <div className="h-32 bg-gray-400 rounded-lg col-span-2" />
                <div className="h-32 bg-gray-400 rounded-lg" />
              </div>
              <div className="grid grid-cols-4 gap-3 mx-4 mt-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-400 rounded-lg" />)}
              </div>
              <div className="h-24 bg-gray-400 mx-4 mt-4 rounded-lg" />
            </div>
            {/* Heatmap canvas overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ mixBlendMode: "normal" }}
            />
            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Click Intensity</p>
              <div className="flex items-center gap-1">
                <div className="w-24 h-3 rounded-full" style={{
                  background: "linear-gradient(to right, #3b82f6, #06b6d4, #22c55e, #eab308, #ef4444)"
                }} />
                <div className="flex justify-between w-24 text-[9px] text-gray-400 mt-0.5 absolute bottom-2.5 right-3">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stats row */}
      {data && data.totalClicks > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Clicks", value: data.totalClicks.toLocaleString(), icon: MousePointer2, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Pages Tracked", value: data.pages.length.toString(), icon: Globe, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Time Range", value: `${days}d`, icon: RefreshCw, color: "text-green-600", bg: "bg-green-50" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-[11px] text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking snippet section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowSnippet(!showSnippet)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Code2 size={14} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Install Tracking Snippet</p>
              <p className="text-xs text-gray-400">Add this code to your website to enable heatmap tracking</p>
            </div>
          </div>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSnippet ? "rotate-180" : ""}`} />
        </button>

        {showSnippet && (
          <div className="border-t border-gray-100 px-5 pb-5">
            <div className="flex items-start gap-2 mt-4 mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Paste this snippet just before the <code className="font-mono bg-amber-100 px-1 rounded">&lt;/body&gt;</code> tag on every page of your website.
              </p>
            </div>
            <div className="relative">
              <pre className="bg-gray-950 text-green-400 text-[11px] font-mono p-4 rounded-xl overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {trackingSnippet}
              </pre>
              <button
                onClick={copySnippet}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
