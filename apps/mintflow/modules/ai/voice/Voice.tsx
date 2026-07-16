"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { MicrophoneIcon } from "@phosphor-icons/react/dist/csr/Microphone";
import { MicrophoneSlashIcon } from "@phosphor-icons/react/dist/csr/MicrophoneSlash";
import { PhoneDisconnectIcon } from "@phosphor-icons/react/dist/csr/PhoneDisconnect";

import { Box, UnstyledButton } from "@peppermint/ui";

import { MonoText } from "@/components";

import { VOICE_BARS } from "./Voice.data";
import classes from "./Voice.module.css";

const ACCENT = "rgb(238, 87, 41)";
const ACCENT_MID = "rgba(238, 87, 41, 0.55)";
const EDGE_BLUE = "rgba(44, 110, 202, 0.5)";
const PAPER = "rgb(252, 251, 249)";

function barColor(edge: number): string {
  if (edge < 0.33) return ACCENT;
  if (edge < 0.66) return ACCENT_MID;
  return EDGE_BLUE;
}

/**
 * Immersive AI voice-mode screen. Purely animated UI — no real speech capture
 * and no backend, so all async/loading/empty/error states are N/A (static mock
 * interaction). The orb, rings, and voice meter animate only while `listening`.
 */
export function ModuleVoice() {
  const router = useRouter();
  const [listening, setListening] = useState(true);

  return (
    <Box
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: PAPER,
        overflow: "hidden",
      }}
    >
      {/* Top row: label + close */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <MonoText label fz={11} c="rgba(0,0,0,0.42)">
          KAMBAN AI · VOICE
        </MonoText>
        <UnstyledButton
          className={classes.control}
          aria-label="Close voice mode"
          onClick={() => router.push("/ai")}
          style={{
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.05)",
            borderRadius: 11,
          }}
        >
          <XIcon size={17} color="rgb(10,12,14)" />
        </UnstyledButton>
      </Box>

      {/* Center orb */}
      <Box
        style={{
          position: "absolute",
          top: "34%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <UnstyledButton
          onClick={() => setListening((v) => !v)}
          aria-label={listening ? "Pause listening" : "Resume listening"}
          style={{
            position: "relative",
            width: 220,
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {/* Pulsing rings (accent + blue) */}
          <Box
            className={listening ? classes.ringPulse : undefined}
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: "1.5px solid rgba(238,87,41,0.5)",
            }}
          />
          <Box
            className={listening ? classes.ringPulse : undefined}
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: "1.5px solid rgba(44,110,202,0.4)",
              animationDelay: "1.6s",
            }}
          />
          {/* Orb */}
          <Box
            className={listening ? classes.orbBreathing : undefined}
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 34% 30%, rgb(255,138,102), rgb(238,87,41) 62%, rgb(205,66,26))",
              boxShadow:
                "0 24px 60px rgba(238,87,41,0.4), inset 0 -14px 34px rgba(0,0,0,0.16), inset 0 10px 24px rgba(255,255,255,0.35)",
            }}
          />
        </UnstyledButton>

        {/* Status */}
        <Box
          style={{
            marginTop: 30,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Box
            component="span"
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.6px",
              color: "rgb(10,12,14)",
            }}
          >
            {listening ? "Listening" : "Paused"}
          </Box>
          <MonoText label fz={11} c="rgba(0,0,0,0.42)">
            {listening ? "TAP THE ORB TO PAUSE" : "TAP TO RESUME"}
          </MonoText>
        </Box>
      </Box>

      {/* Voice meter */}
      <Box
        style={{
          position: "absolute",
          bottom: 130,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          height: 66,
        }}
      >
        {VOICE_BARS.map((bar, i) => (
          <Box
            key={i}
            className={listening ? classes.barActive : undefined}
            style={{
              width: 3,
              height: listening ? bar.height : 6,
              borderRadius: 2,
              background: barColor(bar.edge),
              animationDuration: listening ? `${bar.duration}s` : undefined,
              animationDelay: listening ? `${bar.delay}s` : undefined,
            }}
          />
        ))}
      </Box>

      {/* Controls */}
      <Box
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
        }}
      >
        <UnstyledButton
          className={classes.control}
          aria-label={listening ? "Mute microphone" : "Unmute microphone"}
          onClick={() => setListening((v) => !v)}
          style={{
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: listening ? "#fff" : "rgba(0,0,0,0.06)",
            boxShadow: "0 8px 20px rgba(20,30,40,0.14)",
          }}
        >
          {listening ? (
            <MicrophoneIcon size={22} color="rgb(10,12,14)" />
          ) : (
            <MicrophoneSlashIcon size={22} color="rgb(10,12,14)" />
          )}
        </UnstyledButton>

        <UnstyledButton
          className={classes.control}
          aria-label="End voice session"
          onClick={() => router.push("/ai")}
          style={{
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: ACCENT,
            boxShadow: "0 10px 24px rgba(238,87,41,0.4)",
          }}
        >
          <PhoneDisconnectIcon size={24} color="#fff" weight="fill" />
        </UnstyledButton>
      </Box>
    </Box>
  );
}
