"use client";

import { useConfig } from "@/hooks/useConfig";
import {
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useRoomContext,
  useTracks,
  useVoiceAssistant,
  useParticipantAttributes,
} from "@livekit/components-react";
import { ConnectionState, LocalParticipant, Track } from "livekit-client";
import { useCallback, useEffect, useState } from "react";

export default function Playground() {
  const { config, setUserSettings } = useConfig();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const roomState = useConnectionState();
  const tracks = useTracks();
  const voiceAssistant = useVoiceAssistant();

  const [transcripts, setTranscripts] = useState<{ text: string; timestamp: number }[]>([]);
  const [rpcMethod, setRpcMethod] = useState("");
  const [rpcPayload, setRpcPayload] = useState("");

  // Enable camera/mic on connection
  useEffect(() => {
    if (roomState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(config.settings.inputs.camera);
      localParticipant.setMicrophoneEnabled(config.settings.inputs.mic);
    }
  }, [config, localParticipant, roomState]);

  // Find tracks
  const agentVideoTrack = tracks.find(
    (t) => t.publication.kind === Track.Kind.Video && t.participant.isAgent
  );

  const localTracks = tracks.filter((t) => t.participant instanceof LocalParticipant);
  const localCameraTrack = localTracks.find((t) => t.source === Track.Source.Camera);
  const localMicTrack = localTracks.find((t) => t.source === Track.Source.Microphone);

  // Handle data channel messages
  const onDataReceived = useCallback((msg: any) => {
    if (msg.topic === "transcription") {
      const decoded = JSON.parse(new TextDecoder("utf-8").decode(msg.payload));
      let timestamp = new Date().getTime();
      if ("timestamp" in decoded && decoded.timestamp > 0) timestamp = decoded.timestamp;
      setTranscripts((prev) => [...prev, { text: decoded.text, timestamp }]);
    }
  }, []);

  useDataChannel(onDataReceived);

  // RPC call helper
  const handleRpcCall = useCallback(async () => {
    if (!voiceAssistant.agent || !room) throw new Error("No agent or room available");
    return await room.localParticipant.performRpc({
      destinationIdentity: voiceAssistant.agent.identity,
      method: rpcMethod,
      payload: rpcPayload,
    });
  }, [room, rpcMethod, rpcPayload, voiceAssistant.agent]);

  // Agent attributes
  const agentAttributes = useParticipantAttributes({ participant: voiceAssistant.agent });

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>Room State: {roomState}</h2>
      <p>Agent Video Track: {agentVideoTrack ? "Connected" : "Not connected"}</p>
      <p>Local Camera Track: {localCameraTrack ? "Available" : "Not available"}</p>
      <p>Local Mic Track: {localMicTrack ? "Available" : "Not available"}</p>

      <div>
        <h3>Transcripts:</h3>
        <ul>
          {transcripts.map((t, i) => (
            <li key={i}>
              [{new Date(t.timestamp).toLocaleTimeString()}] {t.text}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>RPC Call</h3>
        <input
          type="text"
          placeholder="Method"
          value={rpcMethod}
          onChange={(e) => setRpcMethod(e.target.value)}
        />
        <input
          type="text"
          placeholder="Payload"
          value={rpcPayload}
          onChange={(e) => setRpcPayload(e.target.value)}
        />
        <button onClick={handleRpcCall}>Call RPC</button>
      </div>

      <div>
        <h3>Agent Attributes:</h3>
        <pre>{JSON.stringify(agentAttributes.attributes || {}, null, 2)}</pre>
      </div>
    </div>
  );
}
