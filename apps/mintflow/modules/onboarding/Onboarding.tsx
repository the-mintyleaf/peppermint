"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Group, Text, UnstyledButton } from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import { StepDetails, StepGuidance, StepPreferences } from "./components";
import type {
  Department,
  FontKey,
  OnboardingStep,
  ThemeKey,
} from "./Onboarding.types";

const TOTAL_STEPS = 3;

// Local wizard state only — no backend / framework form helpers.
// Async output states (loading / error / empty / permission) are N/A here.
export function ModuleOnboarding() {
  const router = useRouter();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState<Department>("Home");
  const [theme, setTheme] = useState<ThemeKey>("Light");
  const [font, setFont] = useState<FontKey>("Grotesk");
  const [sizeIdx, setSizeIdx] = useState(1);

  const back = () => setStep((prev) => Math.max(1, prev - 1) as OnboardingStep);

  const next = () => {
    if (step === TOTAL_STEPS) {
      router.push("/home");
      return;
    }
    setStep((prev) => (prev + 1) as OnboardingStep);
  };

  const isLast = step === TOTAL_STEPS;

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        background: tokens.paper,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        style={{
          width: "100%",
          maxWidth: 460,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Fixed top: brand + progress */}
        <Box component="header" style={{ padding: "20px 22px 14px" }}>
          <Group justify="space-between" align="center" mb={16}>
            <Group gap={9} align="center">
              <Box
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  border: `1.5px solid ${tokens.ink}`,
                }}
              />
              <Text component="span" fz={15}>
                <Text component="span" fw={700} inherit>
                  kam
                </Text>
                ban.
              </Text>
            </Group>
            <MonoText label fz={11} c={tokens.muted}>
              STEP {step} / {TOTAL_STEPS}
            </MonoText>
          </Group>
          <Group gap={6} align="center">
            {Array.from({ length: TOTAL_STEPS }, (_, index) => {
              const filled = step >= index + 1;
              return (
                <Box
                  key={index}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 3,
                    background: filled ? tokens.accent : "rgba(0, 0, 0, 0.1)",
                  }}
                />
              );
            })}
          </Group>
        </Box>

        {/* Scrollable middle */}
        <Box
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 22px 120px",
          }}
        >
          {step === 1 ? (
            <StepDetails
              fullName={fullName}
              onFullName={setFullName}
              email={email}
              onEmail={setEmail}
              dept={dept}
              onDept={setDept}
            />
          ) : null}
          {step === 2 ? (
            <StepPreferences
              theme={theme}
              onTheme={setTheme}
              font={font}
              onFont={setFont}
              sizeIdx={sizeIdx}
              onSizeIdx={setSizeIdx}
            />
          ) : null}
          {step === 3 ? <StepGuidance /> : null}
        </Box>

        {/* Fixed footer */}
        <Box
          component="footer"
          style={{
            padding: "24px 22px",
            background:
              "linear-gradient(to top, rgb(252,251,249) 60%, rgba(252,251,249,0))",
          }}
        >
          <Group gap={12} align="center" wrap="nowrap">
            {step > 1 ? (
              <UnstyledButton
                onClick={back}
                aria-label="Back"
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  border: `1px solid ${tokens.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: tokens.paper,
                }}
              >
                <CaretLeftIcon size={20} color={tokens.ink} />
              </UnstyledButton>
            ) : null}
            <UnstyledButton
              onClick={next}
              style={{
                flex: 1,
                height: 54,
                borderRadius: 16,
                background: tokens.ink,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text component="span" fw={600} fz={15} c="#fff">
                {isLast ? "Enter workspace" : "Continue"}
              </Text>
              <ArrowRightIcon size={18} color="#fff" weight="bold" />
            </UnstyledButton>
          </Group>
        </Box>
      </Box>
    </Box>
  );
}
