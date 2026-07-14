import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useSignaling } from './useSignaling';
import { collectStats } from '@/lib/stats';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

/**
 * Hook managing the viewer (receiver) side of a screen-sharing session.
 * @param {(message: string) => void} onLog
 */
export function useViewer(onLog) {
  const [status, setStatus] = useState('idle');
  const [stats, setStats] = useState({ fps: 0, bandwidth: 0 });
  const [roomCode, setRoomCode] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef = useRef(null);
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
      sender: 'viewer',
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
        if (msg.type === 'sharer-ready') {
          onLogRef.current('Sharer is ready — sending join request…');
          await sendSignal('ready', {});
        } else if (msg.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          onLogRef.current('Offer received — sending answer…');
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal('answer', answer);
        } else if (msg.type === 'ice') {
          await pc.addIceCandidate(new RTCIceCandidate(payload));
        }
      } catch (err) {
        onLogRef.current(`Signal error: ${err.message}`);
      }
    },
    [sendSignal]
  );

  useSignaling(roomCode, 'viewer', handleMessage);

  const stopStats = useCallback(() => {
    if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    statsTimerRef.current = null;
    lastStatsRef.current = null;
  }, []);

  const monitorStats = useCallback(() => {
    stopStats();
    statsTimerRef.current = setInterval(async () => {
      if (!pcRef.current) return;
      const s = await collectStats(pcRef.current, 'inbound', lastStatsRef.current);
      lastStatsRef.current = s.last;
      setStats({ fps: s.fps, bandwidth: s.bandwidth });
    }, 1000);
  }, [stopStats]);

  const connect = useCallback(
    async (code, password) => {
      try {
        const rooms = await base44.entities.Room.filter({ code, status: 'active' });
        if (!rooms.length) {
          onLogRef.current('Room not found or already closed');
          setStatus('error');
          return false;
        }
        const enc = new TextEncoder().encode(password);
        const hashBuf = await crypto.subtle.digest('SHA-256', enc);
        const hash = Array.from(new Uint8Array(hashBuf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        if (hash !== rooms[0].password_hash) {
          onLogRef.current('Authentication failed — wrong password');
          setStatus('error');
          return false;
        }

        codeRef.current = code;
        setRoomCode(code);
        onLogRef.current('Authenticated — joining room…');

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;
        pc.onicecandidate = (e) => {
          if (e.candidate) sendSignal('ice', e.candidate);
        };
        pc.ontrack = (e) => {
          setRemoteStream(e.streams[0]);
          onLogRef.current('Remote stream received');
          setStatus('connected');
        };
        pc.onconnectionstatechange = () => {
          onLogRef.current(`Connection: ${pc.connectionState}`);
        };

        setStatus('waiting');
        onLogRef.current('Waiting for sharer…');
        monitorStats();
        return true;
      } catch (err) {
        onLogRef.current(`Connection error: ${err.message}`);
        setStatus('error');
        return false;
      }
    },
    [sendSignal, monitorStats]
  );

  const disconnect = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    stopStats();
    setStats({ fps: 0, bandwidth: 0 });
    setRemoteStream(null);
    codeRef.current = null;
    setRoomCode(null);
    setStatus('idle');
    onLogRef.current('Disconnected');
  }, [stopStats]);

  useEffect(() => () => {
    pcRef.current?.close();
    stopStats();
  }, [stopStats]);

  return { status, stats, roomCode, remoteStream, connect, disconnect };
}