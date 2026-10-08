"use client";

import { useEffect, useRef, useState } from "react";

const CLIPS = ["/videos/hero-garage.mp4", "/videos/hero-showroom.mp4", "/videos/hero-handover.mp4"];

export function HeroReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Why: on "Data saver" or a slow 2G/3G connection, auto-downloading a video wastes the
  // visitor's data and slows the whole page. They get the still hero image instead.
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
      Boolean(connection?.saveData) || /^(slow-2g|2g|3g)$/.test(connection?.effectiveType ?? ""),
    );
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || reduceMotion || saveData) return;
    node.load();
    const play = node.play();
    if (play) play.catch(() => undefined);
  }, [index, reduceMotion, saveData]);

  if (reduceMotion || saveData) {
    return (
      <img src="/images/hero.jpg" alt="" className="absolute inset-0 size-full object-cover" />
    );
  }

  return (
    <video
      ref={videoRef}
      key={CLIPS[index]}
      className="absolute inset-0 size-full object-cover"
      autoPlay
      muted
      playsInline
      preload="auto"
      poster="/images/hero.jpg"
      onEnded={() => setIndex((current) => (current + 1) % CLIPS.length)}
      aria-hidden="true"
    >
      <source src={CLIPS[index]} type="video/mp4" />
    </video>
  );
}
