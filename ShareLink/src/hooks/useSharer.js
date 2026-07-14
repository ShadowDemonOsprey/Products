import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useSignaling } from './useSignaling';
import { collectStats } from '@/lib/stats';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

/**
 * Hook managing the sharer (broadcaster) side of a screen-sharing session.
 * @param {(message: string) => void} onLog
 */
export function useSharer(onLog) {
  const [status, setStatus] = useState('idle');
  const [stats, setStats] = useState({ fps: 0, bandwidth: 0 });
  const [roomCode, setRoomCode] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const codeRef = useRef(null);
  const statsTimerRef = useRef(null);
  const lastStatsRef = useRef(null);
  const onLogRef = useRef(onLog);
  onLogRef.current = onLog;

  const sendSignal = useCallback(async (type, payload) => {
    const code = codeRef.current;
    if (!code) return;
    await base44.entities.SignalMessage.create({
      room_code: code,
      sender: 'sharer',
      type,
      payload: JSON.stringify(payload),
    });
  }, []);

  const handleMessage = useCallback(
    async (msg) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        const payload = JSON.parse(msg.payload);
        if (msg.type === 'ready') {
          onLogRef.current('Viewer joined — sending offer…');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendSignal('offer', offer);
        } else if (msg.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          onLogRef.current('Answer received — connection established');
        } else if (msg.type === 'ice') {
          await pc.addIceCandidate(new RTCIceCandidate(payload));
        }
      } catch (err) {
        onLogRef.current(`Signal error: ${err.message}`);
      }
    },
    [sendSignal]
  );

  useSignaling(roomCode, 'sharer', handleMessage);

  const stopStats = useCallback(() => {
    if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    statsTimerRef.current = null;
    lastStatsRef.current = null;
  }, []);

  const monitorStats = useCallback(() => {
    stopStats();
    statsTimerRef.current = setInterval(async () => {
      if (!pcRef.current) return;
      const s = await collectStats(pcRef.current, 'outbound', lastStatsRef.current);
      lastStatsRef.current = s.last;
      setStats({ fps: s.fps, bandwidth: s.bandwidth });
    }, 1000);
  }, [stopStats]);

  const createRoom = useCallback(async (password) => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const enc = new TextEncoder().encode(password);
    const hashBuf = await crypto.subtle.digest('SHA-256', enc);
    const hash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    await base44.entities.Room.create({ code, password_hash: hash, status: 'active' });
    codeRef.current = code;
    setRoomCode(code);
    onLogRef.current(`Room created — code: ${code}`);
    return code;
  }, []);

  const startSharing = useCallback(
    async (settings) => {
      if (!codeRef.current) {
        onLogRef.current('Create a room first');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: settings.fps } },
          audio: false,
        });
        streamRef.current = stream;
        setLocalStream(stream);
        stream.getVideoTracks()[0].onended = () => stopSharing();

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        pc.onicecandidate = (e) => {
          if (e.candidate) sendSignal('ice', e.candidate);
        };
        pc.onconnectionstatechange = () => {
          const st = pc.connectionState;
          onLogRef.current(`Connection: ${st}`);
          if (st === 'connected') setStatus('connected');
          else if (st === 'disconnected' || st === 'failed') setStatus('waiting');
        };

        // Apply bitrate / quality cap
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          const params = sender.getParameters();
          if (!params.encodings) params.encodings = [{}];
          params.encodings[0].maxBitrate = settings.quality * 1000;
          await sender.setParameters(params);
        }

        setStatus('waiting');
        onLogRef.current('Screen capture started — waiting for viewer…');
        monitorStats();

        // Let any waiting viewer know we are ready to negotiate
        await sendSignal('sharer-ready', {});
      } catch (err) {
        onLogRef.current(`Capture error: ${err.message}`);
        setStatus('error');
      }
    },
    [sendSignal, monitorStats]
  );

  const stopSharing = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLocalStream(null);
    pcRef.current?.close();
    pcRef.current = null;
    stopStats();
    setStats({ fps: 0, bandwidth: 0 });
    setStatus('idle');
    onLogRef.current('Sharing stopped');
  }, [stopStats]);

  const disconnect = useCallback(async () => {
    stopSharing();
    const code = codeRef.current;
    if (code) {
      await base44.entities.Room.updateMany({ code }, { $set: { status: 'closed' } }).catch(() => {});
      await base44.entities.SignalMessage.deleteMany({ room_code: code }).catch(() => {});
    }
    codeRef.current = null;
    setRoomCode(null);
    onLogRef.current('Disconnected — room closed');
  }, [stopSharing]);

  useEffect(() => () => {
    stopSharing();
    stopStats();
  }, [stopSharing, stopStats]);

  return {
    status,
    stats,
    roomCode,
    localStream,
    createRoom,
    startSharing,
    stopSharing,
    disconnect,
  };
}