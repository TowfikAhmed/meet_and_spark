'use client';

import { useEffect, useRef, useState } from 'react';
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

export default function OpenAIRealtime() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<RealtimeSession | null>(null);

  const handleConnect = async () => {
    setError(null);
    setStatus('connecting');
    try {
      const resp = await fetch('/api/openai-token', { method: 'POST' });
      const json = await resp.json();
      const apiKey: string | undefined = json?.value;
      if (!apiKey) {
        throw new Error('Failed to mint ephemeral key');
      }

      const agent = new RealtimeAgent({
        name: 'Assistant',
        instructions: 'You are a helpful assistant.',
      });

      const session = new RealtimeSession(agent, { model: 'gpt-realtime' });

      await session.connect({ apiKey });

      sessionRef.current = session;
      setStatus('connected');
      console.log('You are connected!');
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
      setStatus('error');
      console.error(e);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    try {
      const s: any = sessionRef.current;
      if (s) {
        if (typeof s.disconnect === 'function') {
          await s.disconnect();
        } else if (typeof s.close === 'function') {
          // Some versions expose close() instead of disconnect()
          s.close();
        } else if (s.transport && typeof s.transport.close === 'function') {
          // Fallback to closing underlying transport
          s.transport.close();
        }
        sessionRef.current = null;
      }
      setStatus('idle');
      console.log('Disconnected.');
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
      setStatus('error');
      console.error(e);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount with robust fallbacks across SDK versions
      const s: any = sessionRef.current;
      try {
        if (typeof s?.disconnect === 'function') {
          s.disconnect().catch(() => {});
        } else if (typeof s?.close === 'function') {
          s.close();
        } else if (s?.transport && typeof s.transport.close === 'function') {
          s.transport.close();
        }
      } catch {}
      sessionRef.current = null;
    };
  }, []);

  return (
    <div style={{ padding: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={handleConnect} disabled={status === 'connecting' || status === 'connected'}>
        {status === 'connecting'
          ? 'Connecting...'
          : status === 'connected'
            ? 'Connected'
            : 'Connect Realtime Agent'}
      </button>
      <button onClick={handleDisconnect} disabled={status !== 'connected'}>
        Disconnect
      </button>
      <div style={{ marginLeft: 8 }}>Status: {status}</div>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
}
