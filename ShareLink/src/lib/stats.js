/**
 * Collects WebRTC stats for FPS and bandwidth from an RTCPeerConnection.
 * @param {RTCPeerConnection} pc
 * @param {'outbound'|'inbound'} direction
 * @param {{bytes:number,ts:number}|null} last - previous snapshot for delta calc
 */
export async function collectStats(pc, direction, last) {
  const reports = await pc.getStats();
  let fps = 0;
  let bytes = 0;
  let ts = 0;
  const reportType = direction === 'outbound' ? 'outbound-rtp' : 'inbound-rtp';

  reports.forEach((r) => {
    if (r.type === reportType && r.kind === 'video') {
      fps = r.framesPerSecond || fps;
      bytes = direction === 'outbound' ? r.bytesSent || 0 : r.bytesReceived || 0;
      ts = r.timestamp;
    }
  });

  let bandwidth = 0;
  if (last && ts && last.ts && bytes) {
    const delta = bytes - last.bytes;
    if (delta > 0) {
      bandwidth = Math.round((delta * 8) / (ts - last.ts) / 1000); // kbps
    }
  }

  return { fps: Math.round(fps), bandwidth, last: { bytes, ts } };
}