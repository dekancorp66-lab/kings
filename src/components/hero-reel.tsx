"use client";

import { useEffect, useRef, useState } from "react";

const CLIPS = ["/videos/hero-garage.mp4", "/videos/hero-showroom.mp4", "/videos/hero-handover.mp4"];

export function HeroReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Why: on "Data saver" or a 2G connection, auto-downloading a video wastes the visitor's data.
  // They see the plain dark background instead. (The clips are small now, so 3G is fine.)
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    setSaveData(
      Boolean(connection?.saveData) || /^(slow-2g|2g)$/.test(connection?.effectiveType ?? ""),
    );
  }, []);

  useEffect(() => {
    if (reduceMotion || saveData) return;
    fetch(CLIPS[(index + 1) % CLIPS.length], { cache: "force-cache" }).catch(() => undefined);
  }, [index, reduceMotion, saveData]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || reduceMotion || saveData) return;
    node.load();
    const play = node.play();
    if (play) play.catch(() => undefined);
  }, [index, reduceMotion, saveData]);

  // Videos only: no still image anywhere. For people who turned motion off (or Data saver),
  // the section's dark navy background shows instead.
  if (reduceMotion || saveData) return null;

  return (
    <video
      ref={videoRef}
      key={CLIPS[index]}
      className="absolute inset-0 size-full object-cover brightness-[1.1] saturate-[1.08]"
      autoPlay
      muted
      playsInline
      preload="auto"
      onEnded={() => setIndex((current) => (current + 1) % CLIPS.length)}
      aria-hidden="true"
    >
      <source src={CLIPS[index]} type="video/mp4" />
    </video>
  );
}
