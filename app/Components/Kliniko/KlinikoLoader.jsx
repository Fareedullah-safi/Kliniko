"use client"
import React, { useEffect, useRef, useState } from "react";

/* ============================================================================
   5D & 7D CONFIGURATION: QUANTUM PARTICLES, DNA HELIX NODES & TELEMETRY
   ============================================================================ */
const BURST_PARTICLES = [
  { x: "-68px", y: "-52px", z: "40px", color: "#00F5D4", size: "8px", delay: "0s" },
  { x: "-24px", y: "-74px", z: "-30px", color: "#7567EB", size: "6px", delay: "0.03s" },
  { x: "28px", y: "-70px", z: "45px", color: "#00E5FF", size: "9px", delay: "0.06s" },
  { x: "72px", y: "-46px", z: "-20px", color: "#9080F6", size: "6px", delay: "0.02s" },
  { x: "84px", y: "6px", z: "35px", color: "#2DE2E6", size: "7px", delay: "0.05s" },
  { x: "66px", y: "54px", z: "-35px", color: "#A799FF", size: "8px", delay: "0.08s" },
  { x: "20px", y: "72px", z: "40px", color: "#00F5D4", size: "6px", delay: "0.04s" },
  { x: "-26px", y: "70px", z: "-25px", color: "#7768E8", size: "9px", delay: "0.07s" },
  { x: "-70px", y: "48px", z: "30px", color: "#38F9D7", size: "7px", delay: "0.01s" },
  { x: "-86px", y: "-4px", z: "-40px", color: "#8779F2", size: "6px", delay: "0.09s" },
  { x: "-44px", y: "-32px", z: "55px", color: "#E0FFFF", size: "5px", delay: "0.02s" },
  { x: "46px", y: "32px", z: "55px", color: "#E0FFFF", size: "5px", delay: "0.06s" },
  { x: "0px", y: "-58px", z: "60px", color: "#5FFBF1", size: "6px", delay: "0.04s" },
  { x: "0px", y: "58px", z: "-55px", color: "#B8ADFF", size: "6px", delay: "0.08s" },
];

const DNA_RUNGS = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  offset: (i - 4) * 8,
  phase: `${i * -0.18}s`,
}));

const styles = `
  .kl-11d-loader {
    --kl-bg-deep: #021014;
    --kl-bg-mid: #05222b;
    --kl-bg-surface: #08323f;
    --kl-text: #ecfeff;
    --kl-muted: #84b5c4;
    --kl-accent: #00f5d4;
    --kl-cyan: #00e5ff;
    --kl-teal: #18aabc;
    --kl-violet: #8a7aff;
    --kl-cycle: 3.2s;
    --rx: 0deg;
    --ry: 0deg;

    box-sizing: border-box;
    display: grid;
    place-items: center;
    isolation: isolate;
    color: var(--kl-text);
    text-align: center;
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    user-select: none;
    -webkit-font-smoothing: antialiased;
  }

  .kl-11d-loader *,
  .kl-11d-loader *::before,
  .kl-11d-loader *::after {
    box-sizing: border-box;
  }

  /* ==========================================================================
     11D: DARK TEAL ABYSSAL AURORA & CLINICAL HYPERSPACE BACKGROUND
     ========================================================================== */
  .kl-11d-loader[data-mode="page"],
  .kl-11d-loader[data-mode="overlay"] {
    position: fixed;
    inset: 0;
    z-index: 10000;
    overflow: hidden;
    padding: 24px;
    background-color: var(--kl-bg-deep);
    background-image:
      radial-gradient(circle at 50% 45%, rgb(11 66 82 / 70%) 0%, rgb(4 28 36 / 85%) 52%, #021014 100%),
      radial-gradient(ellipse at 18% 20%, rgb(0 245 212 / 16%), transparent 52%),
      radial-gradient(ellipse at 84% 80%, rgb(117 103 235 / 18%), transparent 54%),
      radial-gradient(ellipse at 80% 18%, rgb(24 170 188 / 16%), transparent 46%),
      radial-gradient(ellipse at 20% 82%, rgb(0 229 255 / 12%), transparent 46%),
      linear-gradient(135deg, #020e12 0%, #052029 50%, #03131a 100%);
  }

  .kl-11d-loader[data-mode="overlay"] {
    background-color: rgb(2 16 20 / 88%);
    backdrop-filter: blur(22px) saturate(180%);
  }

  /* 2D Bioluminescent Teal Perspective Grid Matrix */
  .kl-11d-loader[data-mode="page"]::before,
  .kl-11d-loader[data-mode="overlay"]::before {
    content: "";
    position: absolute;
    z-index: -3;
    inset: -60px;
    pointer-events: none;
    opacity: 0.48;
    background-image:
      radial-gradient(circle, rgb(0 245 212 / 55%) 1.25px, transparent 1.25px),
      linear-gradient(to right, rgb(24 170 188 / 12%) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(24 170 188 / 12%) 1px, transparent 1px);
    background-size: 28px 28px, 56px 56px, 56px 56px;
    mask-image: radial-gradient(ellipse at center, black 18%, transparent 74%);
    animation: klGridDrift11D 20s linear infinite;
  }

  /* 11D Volumetric Dark Teal & Quantum Violet Aurora Membrane */
  .kl-11d-loader[data-mode="page"]::after,
  .kl-11d-loader[data-mode="overlay"]::after {
    content: "";
    position: absolute;
    z-index: -2;
    width: 680px;
    height: 680px;
    border-radius: 50%;
    pointer-events: none;
    background: conic-gradient(
      from 0deg,
      rgb(0 245 212 / 18%),
      rgb(24 170 188 / 22%),
      rgb(117 103 235 / 20%),
      rgb(0 229 255 / 18%),
      rgb(0 245 212 / 18%)
    );
    filter: blur(90px);
    animation: klAuroraSpin11D 14s linear infinite;
  }

  .kl-11d-loader[data-mode="inline"] {
    position: relative;
    width: 100%;
    min-height: 320px;
    padding: 24px;
    border-radius: 20px;
    background: radial-gradient(circle at center, #072c38 0%, #03151b 100%);
  }

  /* 5D Real-Time Quantum Canvas Layer */
  .kl-11d-canvas {
    position: absolute;
    inset: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .kl-11d-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ==========================================================================
     9D & 6D: SPATIAL PARALLAX STAGE & CALABI-YAU GYROSCOPIC RINGS
     ========================================================================== */
  .kl-11d-stage {
    position: relative;
    display: grid;
    width: 280px;
    height: 250px;
    place-items: center;
    perspective: 1100px;
  }

  .kl-11d-parallax {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    transform-style: preserve-3d;
    transform: rotateX(var(--rx)) rotateY(var(--ry));
    transition: transform 0.15s ease-out;
  }

  /* Obsidian Dark-Teal Glassmorphic Pedestal Halo */
  .kl-11d-halo {
    position: absolute;
    width: 218px;
    height: 218px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 32% 28%,
      rgb(16 86 104 / 65%) 0%,
      rgb(6 40 50 / 78%) 52%,
      rgb(3 20 26 / 92%) 100%
    );
    border: 1.5px solid rgb(0 245 212 / 32%);
    box-shadow:
      0 28px 65px rgb(0 0 0 / 75%),
      0 0 38px rgb(0 245 212 / 14%),
      inset 0 2px 24px rgb(0 229 255 / 22%),
      inset 0 -12px 28px rgb(2 12 16 / 90%);
    animation: klHaloPulse11D var(--kl-cycle) ease-in-out infinite;
  }

  /* Precision HUD Degree Ticks Ring */
  .kl-11d-halo::before {
    content: "";
    position: absolute;
    inset: 9px;
    border-radius: 50%;
    border: 1.5px dashed rgb(0 245 212 / 38%);
    animation: klSpinReverse11D 24s linear infinite;
  }

  /* 8D Deep Abyssal Teal Optical Portal */
  .kl-11d-portal {
    position: absolute;
    width: 158px;
    height: 158px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 50% 50%,
      #01090d 0%,
      #041f29 56%,
      rgb(0 245 212 / 24%) 88%,
      transparent 100%
    );
    box-shadow:
      inset 0 0 36px #000508,
      0 0 30px rgb(0 245 212 / 28%),
      0 0 55px rgb(117 103 235 / 22%);
    border: 1px solid rgb(0 245 212 / 42%);
    animation: klPortalBreath11D var(--kl-cycle) ease-in-out infinite;
  }

  /* 4D Sonic Shockwave Ripple Ring (fires when capsule snaps shut!) */
  .kl-11d-shockwave {
    position: absolute;
    width: 92px;
    height: 92px;
    border-radius: 50%;
    border: 2.5px solid #00f5d4;
    box-shadow:
      0 0 24px #00f5d4,
      inset 0 0 18px #7567eb;
    opacity: 0;
    pointer-events: none;
    animation: klShockwave11D var(--kl-cycle) ease-out infinite;
  }

  /* 6D Interlocking 3D Gyroscopic Rings */
  .kl-11d-gyro {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    transform-style: preserve-3d;
  }

  .kl-11d-gyro--1 {
    width: 198px;
    height: 198px;
    border: 2px solid rgb(0 245 212 / 18%);
    border-top-color: #00f5d4;
    border-bottom-color: #00e5ff;
    box-shadow: 0 0 18px rgb(0 245 212 / 38%);
    animation: klGyroOrbit1 3.6s linear infinite;
  }

  .kl-11d-gyro--2 {
    width: 178px;
    height: 178px;
    border: 2px solid rgb(138 122 255 / 18%);
    border-left-color: #a799ff;
    border-right-color: #7567eb;
    box-shadow: 0 0 18px rgb(117 103 235 / 38%);
    animation: klGyroOrbit2 4.4s linear infinite;
  }

  .kl-11d-gyro--3 {
    width: 154px;
    height: 154px;
    border: 1.5px dotted rgb(162 255 245 / 45%);
    border-top: 2px solid #e0ffff;
    animation: klGyroOrbit3 5.2s linear infinite;
  }

  /* Bioluminescent Floor Caustic Glow Shadow */
  .kl-11d-shadow {
    position: absolute;
    bottom: 4px;
    width: 122px;
    height: 18px;
    border-radius: 50%;
    background: radial-gradient(
      ellipse at center,
      rgb(0 245 212 / 48%) 0%,
      rgb(24 170 188 / 28%) 52%,
      transparent 82%
    );
    filter: blur(8px);
    animation: klShadowPulse11D var(--kl-cycle) ease-in-out infinite;
  }

  /* ==========================================================================
     3D, 4D & 7D: VOLUMETRIC CAPSULE, HOLLOW CAVITY, DNA & SINGULARITY CORE
     ========================================================================== */
  /* Master Capsule Rig: Spins 720°, levels out, opens wide, snaps shut */
  .kl-11d-capsule-rig {
    position: relative;
    z-index: 5;
    width: 136px;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: klCapsuleMasterChoreography var(--kl-cycle) cubic-bezier(0.34, 1.25, 0.64, 1) infinite;
  }

  /* 1D Zero-Point Laser Axis Beam */
  .kl-11d-laser-axis {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 122px;
    height: 3px;
    transform: translate(-50%, -50%);
    background: linear-gradient(90deg, transparent, #00f5d4, #ffffff, #9080f6, transparent);
    box-shadow: 0 0 16px #00f5d4, 0 0 28px #7567eb;
    opacity: 0;
    animation: klCoreVisibility var(--kl-cycle) ease-in-out infinite;
  }

  /* 1D Quantum Singularity Core (Blazes in the center when capsule opens) */
  .kl-11d-singularity {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      circle,
      #ffffff 0%,
      #7cf5f0 35%,
      #00f5d4 62%,
      #7567eb 88%,
      transparent 100%
    );
    box-shadow:
      0 0 26px 8px rgb(0 245 212 / 95%),
      0 0 54px 16px rgb(117 103 235 / 80%);
    opacity: 0;
    animation: klSingularityPulse var(--kl-cycle) ease-in-out infinite;
  }

  /* 7D Spinning DNA Double-Helix Bridge Inside Open Capsule */
  .kl-11d-dna {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 4;
    width: 78px;
    height: 34px;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px;
    opacity: 0;
    animation: klCoreVisibility var(--kl-cycle) ease-in-out infinite;
  }

  .kl-11d-dna-rung {
    position: relative;
    width: 3px;
    height: 26px;
    background: linear-gradient(180deg, #00f5d4, rgb(255 255 255 / 55%), #a799ff);
    border-radius: 999px;
    animation: klDnaWave 0.9s ease-in-out infinite alternate;
    animation-delay: var(--phase);
  }

  .kl-11d-dna-rung::before,
  .kl-11d-dna-rung::after {
    content: "";
    position: absolute;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    transform: translateX(-50%);
  }

  .kl-11d-dna-rung::before {
    top: -2px;
    background: #00f5d4;
    box-shadow: 0 0 10px #00f5d4;
  }

  .kl-11d-dna-rung::after {
    bottom: -2px;
    background: #b8adff;
    box-shadow: 0 0 10px #b8adff;
  }

  /* Bursting Medicine Nano-Particles */
  .kl-11d-particle {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ffffff, var(--color) 70%);
    box-shadow: 0 0 14px var(--color), 0 0 28px var(--color);
    opacity: 0;
    pointer-events: none;
    animation: klParticleBurst11D var(--kl-cycle) cubic-bezier(0.16, 1, 0.3, 1) infinite;
    animation-delay: var(--delay);
  }

  /* ==========================================================================
     3D VOLUMETRIC CAPSULE HALVES WITH INNER LOCKING SLEEVE & HOLLOW CAVITY
     ========================================================================== */
  .kl-11d-half {
    position: absolute;
    top: 0;
    width: 68px;
    height: 54px;
    z-index: 6;
    pointer-events: none;
  }

  .kl-11d-half--left {
    left: 0;
    animation: klSlideLeftHalf var(--kl-cycle) cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .kl-11d-half--right {
    right: 0;
    animation: klSlideRightHalf var(--kl-cycle) cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  /* Outer Glossy 3D Pill Shell */
  .kl-11d-shell {
    position: relative;
    width: 100%;
    height: 100%;
    box-shadow:
      inset 0 4px 6px rgb(255 255 255 / 90%),
      inset 0 -10px 14px rgb(2 14 20 / 62%),
      0 14px 30px rgb(0 0 0 / 65%);
  }

  .kl-11d-half--left .kl-11d-shell {
    border-radius: 30px 4px 4px 30px;
    background:
      radial-gradient(circle at 88% 35%, rgb(178 255 248 / 78%), transparent 58%),
      linear-gradient(180deg, #7efcf1 0%, #16c8c8 32%, #0c8599 72%, #043e4b 100%);
    border-left: 1px solid rgb(224 255 255 / 90%);
  }

  .kl-11d-half--right .kl-11d-shell {
    border-radius: 4px 30px 30px 4px;
    background:
      radial-gradient(circle at 12% 35%, rgb(224 216 255 / 78%), transparent 58%),
      linear-gradient(180deg, #d5ccff 0%, #8b7bf5 32%, #523ec4 72%, #22156e 100%);
    border-right: 1px solid rgb(235 230 255 / 90%);
  }

  /* Top Cylindrical Specular Glass Reflection Tube */
  .kl-11d-shell::before {
    content: "";
    position: absolute;
    top: 7px;
    left: 11px;
    right: 11px;
    height: 9px;
    border-radius: 999px;
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 96%) 0%,
      rgb(255 255 255 / 22%) 100%
    );
  }

  /* Bottom Rim Subsurface Scattering Highlight */
  .kl-11d-shell::after {
    content: "";
    position: absolute;
    bottom: 5px;
    left: 14px;
    right: 10px;
    height: 3px;
    border-radius: 999px;
    background: rgb(0 245 212 / 48%);
    filter: blur(0.5px);
  }

  /* 3D Inner Metallic Locking Sleeve (Visible when open!) */
  .kl-11d-sleeve {
    position: absolute;
    top: 3px;
    bottom: 3px;
    right: -10px;
    width: 14px;
    border-radius: 2px 7px 7px 2px;
    background: linear-gradient(
      180deg,
      #ffffff 0%,
      #b5fff8 26%,
      #16a5b8 65%,
      #053542 100%
    );
    box-shadow:
      inset -2px 0 5px rgb(2 16 24 / 75%),
      0 0 14px rgb(0 245 212 / 80%);
    z-index: -1;
  }

  /* Dark 3D Hollow Cavity inside the right capsule cap */
  .kl-11d-cavity {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: -6px;
    width: 12px;
    border-radius: 50%;
    background: radial-gradient(
      ellipse at center,
      #020714 30%,
      #1c125c 75%,
      #a99bff 100%
    );
    border: 1.5px solid rgb(255 255 255 / 90%);
    box-shadow:
      0 0 16px rgb(144 128 246 / 90%),
      inset 0 0 8px #00f5d4;
  }

  /* Glowing Seam Ring when closed/snapping */
  .kl-11d-seam-flash {
    position: absolute;
    top: -4px;
    bottom: -4px;
    left: 50%;
    width: 6px;
    transform: translateX(-50%);
    border-radius: 999px;
    background: #ffffff;
    box-shadow:
      0 0 18px 5px #00f5d4,
      0 0 36px 10px #7567eb;
    z-index: 9;
    opacity: 0;
    animation: klSeamFlash11D var(--kl-cycle) ease-out infinite;
  }

  /* ==========================================================================
     10D: BRANDING, ECG BIOMETRIC WAVE & TELEMETRY HUD (DARK TEAL EDITION)
     ========================================================================== */
  .kl-11d-brand {
    margin: 8px 0 0;
    color: var(--kl-text);
    font-family: "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif;
    font-size: clamp(34px, 5vw, 46px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.05em;
    text-shadow:
      0 4px 24px rgb(0 0 0 / 65%),
      0 0 28px rgb(0 245 212 / 18%);
  }

  .kl-11d-brand span {
    background: linear-gradient(135deg, #00f5d4 0%, #00e5ff 48%, #9d8df8 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 14px rgb(0 245 212 / 45%));
  }

  /* 2D Live Animated Medical ECG Pulse SVG */
  .kl-11d-ecg {
    margin-top: 8px;
    width: 170px;
    height: 26px;
    overflow: visible;
  }

  .kl-11d-ecg-track {
    fill: none;
    stroke: rgb(0 245 212 / 18%);
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .kl-11d-ecg-pulse {
    fill: none;
    stroke: url(#klEcgGradientDarkTeal);
    stroke-width: 2.25;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 220;
    stroke-dashoffset: 220;
    filter: drop-shadow(0 0 8px rgb(0 245 212 / 75%));
    animation: klEcgSweep 2.2s linear infinite;
  }

  .kl-11d-label {
    margin: 4px 0 0;
    color: var(--kl-muted);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.03em;
    line-height: 1.4;
  }

  .kl-11d-telemetry {
    margin: 4px 0 0;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    background: linear-gradient(90deg, #00f5d4, #00e5ff, #a799ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    opacity: 0.92;
  }

  /* ==========================================================================
     MASTER 1D–11D KEYFRAME CHOREOGRAPHY (UNCONDITIONAL, NEVER FROZEN)
     ========================================================================== */
  /* 1. Capsule Spins 2 Full Turns (720deg), Levels Out, Opens Wide, Snaps Shut */
  @keyframes klCapsuleMasterChoreography {
    0% {
      transform: translateY(2px) rotate(0deg) scale(0.96);
    }
    34% {
      transform: translateY(-10px) rotate(720deg) scale(1.05);
    }
    38%, 74% {
      transform: translateY(-8px) rotate(720deg) scale(1.06);
    }
    82% {
      transform: translateY(3px) rotate(720deg) scale(0.94);
    }
    90%, 100% {
      transform: translateY(2px) rotate(720deg) scale(0.96);
    }
  }

  /* 2. Left Capsule Half Mechanical Uncoupling (-38px separation!) */
  @keyframes klSlideLeftHalf {
    0%, 30%, 82%, 100% {
      transform: translateX(0px) rotate(0deg);
    }
    35% {
      transform: translateX(-6px) rotate(-3deg);
    }
    45%, 70% {
      transform: translateX(-38px) rotate(-5deg);
    }
    79% {
      transform: translateX(2px) rotate(0deg);
    }
  }

  /* 3. Right Capsule Half Mechanical Uncoupling (+38px separation!) */
  @keyframes klSlideRightHalf {
    0%, 30%, 82%, 100% {
      transform: translateX(0px) rotate(0deg);
    }
    35% {
      transform: translateX(6px) rotate(3deg);
    }
    45%, 70% {
      transform: translateX(38px) rotate(5deg);
    }
    79% {
      transform: translateX(-2px) rotate(0deg);
    }
  }

  /* 4. Quantum Core & DNA Visibility Window */
  @keyframes klCoreVisibility {
    0%, 33%, 78%, 100% {
      opacity: 0;
      transform: translate(-50%, -50%) scaleX(0.2);
    }
    44%, 69% {
      opacity: 1;
      transform: translate(-50%, -50%) scaleX(1);
    }
  }

  @keyframes klSingularityPulse {
    0%, 32%, 78%, 100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.1);
    }
    45% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.3);
    }
    58% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(0.95);
    }
    70% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  /* 5. DNA Base-Pair Wave Oscillation */
  @keyframes klDnaWave {
    0% {
      transform: scaleY(0.25);
      opacity: 0.55;
    }
    100% {
      transform: scaleY(1.15);
      opacity: 1;
    }
  }

  /* 6. 3D Quantum Particle Eruption */
  @keyframes klParticleBurst11D {
    0%, 35% {
      opacity: 0;
      transform: translate3d(-50%, -50%, 0px) scale(0.1);
    }
    46% {
      opacity: 1;
    }
    76%, 100% {
      opacity: 0;
      transform: translate3d(var(--x), var(--y), var(--z)) scale(1);
    }
  }

  /* 7. Seam Impact Flash & Sonic Shockwave Ring on Snap-Shut (at ~79%) */
  @keyframes klSeamFlash11D {
    0%, 75%, 88%, 100% {
      opacity: 0;
      transform: translateX(-50%) scaleY(0.3);
    }
    79% {
      opacity: 1;
      transform: translateX(-50%) scaleY(1.35);
    }
  }

  @keyframes klShockwave11D {
    0%, 76% {
      opacity: 0;
      transform: scale(0.5);
    }
    79% {
      opacity: 0.95;
      transform: scale(0.85);
    }
    98%, 100% {
      opacity: 0;
      transform: scale(2.35);
    }
  }

  /* 8. 6D Interlocking Gyroscope Orbits */
  @keyframes klGyroOrbit1 {
    0% { transform: rotateX(66deg) rotateY(22deg) rotateZ(0deg); }
    100% { transform: rotateX(66deg) rotateY(22deg) rotateZ(360deg); }
  }

  @keyframes klGyroOrbit2 {
    0% { transform: rotateX(-62deg) rotateY(28deg) rotateZ(360deg); }
    100% { transform: rotateX(-62deg) rotateY(28deg) rotateZ(0deg); }
  }

  @keyframes klGyroOrbit3 {
    0% { transform: rotateX(18deg) rotateY(-68deg) rotateZ(0deg); }
    100% { transform: rotateX(18deg) rotateY(-68deg) rotateZ(360deg); }
  }

  /* 9. Stage, Portal, ECG & Environment Animations */
  @keyframes klHaloPulse11D {
    0%, 100% { transform: scale(0.98); }
    50% { transform: scale(1.03); }
  }

  @keyframes klPortalBreath11D {
    0%, 30%, 82%, 100% {
      transform: scale(0.95);
      box-shadow:
        inset 0 0 34px #000508,
        0 0 26px rgb(0 245 212 / 25%);
    }
    46%, 68% {
      transform: scale(1.06);
      box-shadow:
        inset 0 0 42px #000508,
        0 0 48px rgb(0 245 212 / 65%),
        0 0 72px rgb(117 103 235 / 50%);
    }
  }

  @keyframes klShadowPulse11D {
    0%, 100% {
      opacity: 0.45;
      transform: scaleX(1.05);
    }
    45%, 70% {
      opacity: 0.24;
      transform: scaleX(1.42);
    }
  }

  @keyframes klEcgSweep {
    0% { stroke-dashoffset: 220; }
    100% { stroke-dashoffset: -220; }
  }

  @keyframes klSpinReverse11D {
    0% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes klAuroraSpin11D {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.14); }
    100% { transform: rotate(360deg) scale(1); }
  }

  @keyframes klGridDrift11D {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(28px, 28px, 0); }
  }
`;

const TELEMETRY_STEPS = [
  "Quantum Bio-Core Active",
  "Synthesizing Clinical Mesh",
  "Synchronizing Telemetry",
];

export default function KlinikoLoader({
  mode = "page",
  label = "Loading…",
  showBrand = mode === "page",
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [telemetryIndex, setTelemetryIndex] = useState(0);

  // 10D Telemetry Status Cycler
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % TELEMETRY_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // 5D Real-Time HTML5 Canvas Molecular Field & 9D Spatial Mouse Parallax
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = container.offsetWidth || window.innerWidth);
    let height = (canvas.height = container.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!container) return;
      width = canvas.width = container.offsetWidth || window.innerWidth;
      height = canvas.height = container.offsetHeight || window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Create 5D Bioluminescent Dark-Teal Molecular Nodes
    const nodeCount = mode === "inline" ? 18 : 40;
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      radius: Math.random() * 2.2 + 1.1,
      color:
        i % 3 === 0
          ? "rgba(0, 245, 212, 0.65)"
          : i % 3 === 1
          ? "rgba(0, 229, 255, 0.55)"
          : "rgba(138, 122, 255, 0.55)",
    }));

    const renderCanvas = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        // Draw glowing molecular node
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.fill();

        // Draw bioluminescent teal entanglement bonds between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 245, 212, ${(1 - dist / 120) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    // 9D Interactive Spatial Tilt on Mouse Move
    const handleMouseMove = (e) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / (rect.height / 2)) * -10;
      const ry = ((e.clientX - cx) / (rect.width / 2)) * 10;
      container.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      container.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mode]);

  return (
    <div
      ref={containerRef}
      role="status"
      aria-atomic="true"
      data-mode={mode}
      className={`kl-11d-loader ${className}`}
    >
      <style>{styles}</style>

      {/* 5D Quantum Molecular Field Canvas */}
      <canvas ref={canvasRef} className="kl-11d-canvas" aria-hidden="true" />

      <div className="kl-11d-content">
        {/* 9D Interactive 3D Stage */}
        <div className="kl-11d-stage" aria-hidden="true">
          <div className="kl-11d-parallax">
            {/* Obsidian Dark-Teal Glass Pedestal & 8D Optical Portal */}
            <span className="kl-11d-halo" />
            <span className="kl-11d-portal" />
            <span className="kl-11d-shockwave" />

            {/* 6D Calabi-Yau Interlocking Gyroscopic Orbits */}
            <span className="kl-11d-gyro kl-11d-gyro--1" />
            <span className="kl-11d-gyro kl-11d-gyro--2" />
            <span className="kl-11d-gyro kl-11d-gyro--3" />

            {/* Bioluminescent Floor Caustic Shadow */}
            <span className="kl-11d-shadow" />

            {/* 3D & 4D Master Capsule Rig */}
            <div className="kl-11d-capsule-rig">
              {/* 1D Zero-Point Laser Axis & Quantum Singularity */}
              <span className="kl-11d-laser-axis" />
              <span className="kl-11d-singularity" />

              {/* 7D Spinning DNA Double-Helix Bridge */}
              <div className="kl-11d-dna">
                {DNA_RUNGS.map((rung) => (
                  <span
                    key={rung.id}
                    className="kl-11d-dna-rung"
                    style={{ "--phase": rung.phase }}
                  />
                ))}
              </div>

              {/* 5D Bursting Medicine Nano-Spheres */}
              {BURST_PARTICLES.map((p, idx) => (
                <span
                  key={idx}
                  className="kl-11d-particle"
                  style={{
                    "--x": p.x,
                    "--y": p.y,
                    "--z": p.z,
                    "--size": p.size,
                    "--color": p.color,
                    "--delay": p.delay,
                  }}
                />
              ))}

              {/* Left Capsule Half (Cyan-Teal Bio-Shell + Inner Metallic Locking Sleeve) */}
              <div className="kl-11d-half kl-11d-half--left">
                <div className="kl-11d-shell">
                  <span className="kl-11d-sleeve" />
                </div>
              </div>

              {/* Right Capsule Half (Violet Quantum-Shell + 3D Hollow Interior Cavity) */}
              <div className="kl-11d-half kl-11d-half--right">
                <div className="kl-11d-shell">
                  <span className="kl-11d-cavity" />
                </div>
              </div>

              {/* Sonic Snap-Shut Seam Flash */}
              <span className="kl-11d-seam-flash" />
            </div>
          </div>
        </div>

        {/* Kliniko Brand Typography */}
        {showBrand && (
          <p className="kl-11d-brand" aria-hidden="true">
            Klini<span>k</span>o
          </p>
        )}

        {/* 2D Live Biometric ECG Pulse Wave */}
        <svg
          className="kl-11d-ecg"
          viewBox="0 0 180 28"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="klEcgGradientDarkTeal"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.05" />
              <stop offset="45%" stopColor="#00F5D4" />
              <stop offset="75%" stopColor="#8A7AFF" />
              <stop offset="100%" stopColor="#8A7AFF" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            className="kl-11d-ecg-track"
            d="M 4 15 L 54 15 L 63 8 L 71 22 L 80 3 L 89 25 L 97 11 L 104 15 L 176 15"
          />
          <path
            className="kl-11d-ecg-pulse"
            d="M 4 15 L 54 15 L 63 8 L 71 22 L 80 3 L 89 25 L 97 11 L 104 15 L 176 15"
          />
        </svg>

        {/* Primary Label & 10D Live Telemetry Sub-Readout */}
        <p className="kl-11d-label">{label}</p>
        <p className="kl-11d-telemetry" aria-hidden="true">
          {TELEMETRY_STEPS[telemetryIndex]}
        </p>
      </div>
    </div>
  );
}