import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Subscribes to signaling messages from the other peer for a given room.
 * Calls onMessage for both existing messages (fetched on mount) and new ones.
 *
 * @param {string|null} roomCode
 * @param {'sharer'|'viewer'} role
 * @param {(msg: object) => void} onMessage
 */
export function useSignaling(roomCode, role, onMessage) {
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  useEffect(() => {
    if (!roomCode) return;
    const otherRole = role === 'sharer' ? 'viewer' : 'sharer';

    // Fetch any messages that arrived before we subscribed
    base44.entities.SignalMessage
      .filter({ room_code: roomCode, sender: otherRole }, '-created_date', 200)
      .then((existing) => {
        existing.reverse().forEach((m) => cbRef.current?.(m));
      })
      .catch(() => {});

    // Listen for new messages in real time
    const unsubscribe = base44.entities.SignalMessage.subscribe((event) => {
      if (
        event.type === 'create' &&
        event.data.room_code === roomCode &&
        event.data.sender === otherRole
      ) {
        cbRef.current?.(event.data);
      }
    });

    return unsubscribe;
  }, [roomCode, role]);
}