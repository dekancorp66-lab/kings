"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { branches, HQ_ID, type Place } from "@/config/branches";
import { useI18n } from "@/lib/i18n";

const copy = {
  en: {
    alt: "Realistic Earth that spins, turns to Africa and flies down to Tanzania, showing our branches. Tap a pin to open its location in Google Maps.",
    welcome: "Karibu kwenye familia ya magari bora",
    africa: "Africa",
    tanzania: "Tanzania",
    close: "Close",
  },
  sw: {
    alt: "Dunia halisi inayozunguka, kuelekea Afrika na kushuka hadi Tanzania ikionyesha matawi yetu. Gusa kialama kufungua eneo kwenye Google Maps.",
    welcome: "Karibu kwenye familia ya magari bora",
    africa: "Afrika",
    tanzania: "Tanzania",
    close: "Funga",
  },
} as const;

// Opens straight in Google Maps. If a place has its own Google Maps link (url), that exact link is used.
const placeUrl = (place: Place) =>
  place.url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query)}`;

const D = Math.PI / 180;
const ease = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Shortest turn from angle a to angle b, in degrees.
const turn = (a: number, b: number) => ((b - a + 540) % 360) - 180;

// The animation, in milliseconds: the world spins, turns to Africa, flies down to Tanzania, then the pins appear.
const T_SPIN = 1800;
const T_AFRICA = 3600;
const T_ZOOM = 6200;
const PIN = 6400;

// The 3D engine (three.js) and the Earth photos are downloaded from public CDNs when the map is about to be seen.
const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const NPM = "https://cdn.jsdelivr.net/npm/three-globe/example/img/";
const GH = "https://cdn.jsdelivr.net/gh/vasturiano/three-globe/example/img/";
const TB = "https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/";
const R128 = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/";

let threePromise: Promise<any> | null = null;
function loadThree(): Promise<any> {
  const w = window as any;
  if (w.THREE) return Promise.resolve(w.THREE);
  if (!threePromise) {
    threePromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = THREE_URL;
      s.async = true;
      s.onload = () => (w.THREE ? resolve(w.THREE) : reject(new Error("three.js missing")));
      s.onerror = () => {
        threePromise = null;
        reject(new Error("three.js failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return threePromise;
}

type Pin = {
  id: string;
  city: string;
  side: "left" | "right";
  hq: boolean;
  p: any;
  dot: any;
  ring: any;
  lab: HTMLDivElement;
  i: number;
  sx: number;
  sy: number;
  facing: boolean;
  k: number;
};

/** `bleed` = full-width, full-height map screen with no frame (used on the home page). */
export function GlobeMap({ bleed = false }: { bleed?: boolean }) {
  const { lang } = useI18n();
  const c = copy[lang];
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labelLayer = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  // Only used by cities with more than one office: a small list to pick which one to open.
  const [choice, setChoice] = useState<{ id: string; x: number; y: number } | null>(null);
  const hoverRef = useRef<string | null>(null);
  const langRef = useRef(lang);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    const el = canvas.current;
    const wrap = box.current;
    const layer = labelLayer.current;
    const capEl = caption.current;
    if (!el || !wrap || !layer || !capEl) return;

    let disposed = false;
    let visible = false;
    let onscreen = false;
    let beginFn: (() => void) | null = null;
    let teardown: (() => void) | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Gold pins use the site's accent colour.
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue("--color-accent").trim() || "#c9a227";

    function build(THREE: any) {
      let W = 640;
      let H = 400;
      let started = false;
      let ready = false;
      let t0 = 0;
      let raf = 0;
      let dLon = 0;
      let dLat = 0;
      let dragging = false;
      let moved = 0;
      let lastX = 0;
      let lastY = 0;
      let dist = 3.4;

      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const maxT = renderer.capabilities.maxTextureSize;
      const aniso = renderer.capabilities.getMaxAnisotropy();
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(36, 1.5, 0.01, 100);

      function resize() {
        W = Math.max(280, Math.round(wrap!.clientWidth));
        H =
          W < 520
            ? Math.round(W * 1.05)
            : bleed
              ? Math.min(900, Math.max(520, Math.round(window.innerHeight * 0.88)))
              : Math.min(Math.round(W * 0.62), 720);
        renderer.setSize(W, H, false);
        el!.style.height = `${H}px`;
        cam.aspect = W / H;
        cam.updateProjectionMatrix();
      }
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(wrap!);

      const ll = (lon: number, lat: number, r = 1) =>
        new THREE.Vector3(
          Math.cos(lat * D) * Math.cos(lon * D),
          Math.sin(lat * D),
          -Math.cos(lat * D) * Math.sin(lon * D),
        ).multiplyScalar(r);
      const sun = ll(50, 15, 1).normalize();

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      const loadFirst = (urls: string[], done: (t: any) => void) => {
        let i = 0;
        const next = () => {
          if (i >= urls.length) return done(null);
          loader.load(
            urls[i++],
            (t: any) => {
              t.anisotropy = aniso;
              done(t);
            },
            undefined,
            next,
          );
        };
        next();
      };

      const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
      blank.needsUpdate = true;
      let pending = 3;
      let gotDay = false;
      const one = () => {
        pending--;
        if (pending > 0 || disposed) return;
        if (!gotDay) {
          setFailed(true);
          return;
        }
        ready = true;
        beginFn?.();
      };

      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1, 160, 120),
        new THREE.ShaderMaterial({
          extensions: { derivatives: false },
          uniforms: {
            day: { value: blank },
            night: { value: blank },
            topo: { value: blank },
            sun: { value: sun },
            texel: { value: new THREE.Vector2(1 / 4096, 1 / 2048) },
            hasTopo: { value: 0 },
          },
          vertexShader:
            "varying vec2 vUv;varying vec3 vN;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
          fragmentShader:
            "uniform sampler2D day;uniform sampler2D night;uniform sampler2D topo;uniform vec3 sun;uniform vec2 texel;uniform float hasTopo;varying vec2 vUv;varying vec3 vN;void main(){float d=dot(normalize(vN),normalize(sun));vec3 dc=texture2D(day,vUv).rgb;vec3 nc=texture2D(night,vUv).rgb;float h=texture2D(topo,vUv).r;float hx=texture2D(topo,vUv+vec2(texel.x,0.0)).r;float hy=texture2D(topo,vUv+vec2(0.0,texel.y)).r;float relief=clamp(((h-hx)+(hy-h))*70.0,-0.4,0.4)*hasTopo;float k=smoothstep(-0.12,0.2,d);vec3 lit=dc*(0.42+0.72*max(d,0.0))*(1.0+relief);vec3 dark=nc*1.5+dc*0.04;gl_FragColor=vec4(mix(dark,lit,k),1.0);}",
        }),
      );
      scene.add(earth);

      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.006, 128, 96),
        new THREE.MeshLambertMaterial({ map: null, transparent: true, opacity: 0.55, depthWrite: false }),
      );
      scene.add(clouds);

      const atm = new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 96, 72),
        new THREE.ShaderMaterial({
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          depthWrite: false,
          vertexShader:
            "varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
          fragmentShader:
            "varying vec3 vN;void main(){float i=pow(max(0.72-dot(vN,vec3(0.0,0.0,1.0)),0.0),2.6);gl_FragColor=vec4(0.32,0.6,1.0,1.0)*i*1.6;}",
        }),
      );
      scene.add(atm);

      const light = new THREE.DirectionalLight(0xffffff, 1.15);
      light.position.copy(sun).multiplyScalar(6);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0x0a0f1a, 1));

      const starPos: number[] = [];
      for (let i = 0; i < 1800; i++) {
        const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
          .normalize()
          .multiplyScalar(40);
        starPos.push(v.x, v.y, v.z);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, sizeAttenuation: true })));

      // Sharpest free photo first (5400 px wide); phones that cannot hold that start at 4096.
      const big = maxT >= 5400;
      loadFirst(
        (big ? [NPM + "earth-blue-marble.jpg", GH + "earth-blue-marble.jpg"] : []).concat([
          TB + "2_no_clouds_4k.jpg",
          R128 + "earth_atmos_2048.jpg",
        ]),
        (t) => {
          if (t && !disposed) {
            earth.material.uniforms.day.value = t;
            gotDay = true;
          }
          one();
        },
      );
      loadFirst(
        (big ? [NPM + "earth-night.jpg", GH + "earth-night.jpg"] : []).concat([R128 + "earth_lights_2048.png"]),
        (t) => {
          if (t && !disposed) earth.material.uniforms.night.value = t;
          one();
        },
      );
      loadFirst([NPM + "earth-topology.png", GH + "earth-topology.png", TB + "elev_bump_4k.jpg"], (t) => {
        if (t && !disposed) {
          earth.material.uniforms.topo.value = t;
          earth.material.uniforms.texel.value.set(1 / t.image.width, 1 / t.image.height);
          earth.material.uniforms.hasTopo.value = 1;
        }
        one();
      });
      loadFirst([TB + "fair_clouds_4k.png", R128 + "earth_clouds_1024.png"], (t) => {
        if (t && !disposed) {
          clouds.material.map = t;
          clouds.material.needsUpdate = true;
        }
      });

      // ---- The branch pins (from src/config/branches.ts) ----
      const pins: Pin[] = branches.map((b, i) => {
        const hq = b.id === HQ_ID;
        const p = ll(b.coords[0], b.coords[1], 1.002);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.0032, 20, 20),
          new THREE.MeshBasicMaterial({ color: hq ? 0xffffff : new THREE.Color(accent) }),
        );
        dot.position.copy(p);
        scene.add(dot);
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.0045, 0.0055, 48),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(accent),
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        ring.position.copy(p);
        ring.lookAt(p.clone().multiplyScalar(2));
        scene.add(ring);
        const lab = document.createElement("div");
        lab.textContent = b.city.toUpperCase();
        lab.style.cssText =
          "position:absolute;color:#fff;font:600 11px sans-serif;letter-spacing:.14em;text-shadow:0 1px 3px rgba(0,0,0,.95);white-space:nowrap;opacity:0";
        layer!.appendChild(lab);
        return { id: b.id, city: b.city, side: b.side, hq, p, dot, ring, lab, i, sx: 0, sy: 0, facing: false, k: 0 };
      });

      beginFn = () => {
        if (started || !ready || !visible) return;
        started = true;
        // People who ask for less motion get the finished picture straight away.
        t0 = performance.now() - (reduced ? 20000 : 0);
      };
      beginFn();

      const camPos = new THREE.Vector3();
      const tmp = new THREE.Vector3();

      function frame(now: number) {
        if (disposed) return;
        raf = requestAnimationFrame(frame);
        if (!onscreen) return; // nothing to draw while the map is scrolled out of view
        const text = copy[langRef.current];
        const ms = started ? now - t0 : 0;
        // On narrow screens the camera finishes a little further back so all of Tanzania still fits.
        const dEnd = 1 + 0.36 * Math.max(1, 1.5 / (W / H));
        let lon: number;
        let lat: number;
        let cap: string;
        if (ms < T_SPIN) {
          lon = ms * 0.07;
          lat = 15;
          dist = 3.4;
          cap = text.welcome;
        } else if (ms < T_AFRICA) {
          const t = ease((ms - T_SPIN) / (T_AFRICA - T_SPIN));
          const s0 = T_SPIN * 0.07;
          lon = s0 + turn(s0, 20) * t;
          lat = lerp(15, 2, t);
          dist = lerp(3.4, 2.3, t);
          cap = text.africa;
        } else {
          const m = ease((ms - T_AFRICA) / 2000);
          const z = ease((ms - T_AFRICA) / (T_ZOOM - T_AFRICA));
          lon = lerp(20, 35.3, m);
          lat = lerp(2, -5.6, m);
          dist = lerp(2.3, dEnd, z);
          cap = text.tanzania;
        }
        // Dragging spins the globe; letting go eases it back to Tanzania.
        if (!dragging) {
          dLon *= 0.93;
          dLat *= 0.93;
        }
        lat = Math.max(-85, Math.min(85, lat + dLat));
        lon += dLon;
        camPos.copy(ll(lon, lat, dist));
        cam.position.copy(camPos);
        cam.up.set(0, 1, 0);
        cam.lookAt(0, 0, 0);
        clouds.rotation.y = now * 0.000004;

        pins.forEach((pn) => {
          const k = ease((ms - PIN - pn.i * 220) / 600);
          const hov = hoverRef.current === pn.id ? 1.6 : 1;
          pn.dot.scale.setScalar(Math.max(k * hov, 0.001));
          const ph = (now / 900 + pn.i * 0.3) % 1;
          pn.ring.scale.setScalar((1 + ph * 3.2) * Math.max(k, 0.001));
          pn.ring.material.opacity = (1 - ph) * 0.7 * k;
          tmp.copy(pn.p).project(cam);
          pn.facing = pn.p.clone().normalize().dot(camPos.clone().sub(pn.p).normalize()) > 0.05;
          pn.sx = (tmp.x * 0.5 + 0.5) * W;
          pn.sy = (-tmp.y * 0.5 + 0.5) * H;
          pn.k = k;
          const show = pn.facing ? k : 0;
          pn.lab.style.opacity = String(show);
          pn.lab.style.left = `${pn.side === "right" ? pn.sx + 12 : pn.sx - 12}px`;
          pn.lab.style.top = `${pn.sy - 7}px`;
          pn.lab.style.transform = pn.side === "right" ? "none" : "translateX(-100%)";
          pn.lab.style.fontWeight = pn.hq || hov > 1 ? "700" : "600";
        });

        // A small caption while the globe travels, which fades away once the map has settled.
        const capA = !started ? 0 : ms < PIN - 600 ? 1 : 1 - ease((ms - (PIN - 600)) / 800);
        if (capEl!.dataset.cap !== cap) {
          capEl!.dataset.cap = cap;
          capEl!.textContent = cap.toUpperCase();
        }
        capEl!.style.opacity = String(Math.max(0, capA) * 0.85);

        renderer.render(scene, cam);
      }
      raf = requestAnimationFrame(frame);

      // Which pin (if any) is under this point of the canvas?
      function pinAt(x: number, y: number) {
        if (!started || performance.now() - t0 <= PIN) return null;
        let best: { id: string; d: number } | null = null;
        for (const pn of pins) {
          if (!pn.facing || pn.k < 0.6) continue;
          const d = Math.hypot(pn.sx - x, pn.sy - y);
          if (d < 26 && (!best || d < best.d)) best = { id: pn.id, d };
        }
        return best ? best.id : null;
      }
      function openBranch(id: string, x: number, y: number) {
        const b = branches.find((item) => item.id === id);
        if (!b) return;
        if (b.places.length === 1) {
          setChoice(null);
          window.open(placeUrl(b.places[0]), "_blank", "noopener,noreferrer");
        } else {
          setChoice({ id, x, y });
        }
      }

      // Tapping a pin opens that place in Google Maps; dragging anywhere else spins the globe.
      function onDown(e: PointerEvent) {
        dragging = true;
        moved = 0;
        lastX = e.clientX;
        lastY = e.clientY;
        setChoice(null);
        el!.setPointerCapture(e.pointerId);
      }
      function onMove(e: PointerEvent) {
        if (!dragging) {
          const rect = el!.getBoundingClientRect();
          const id = pinAt(e.clientX - rect.left, e.clientY - rect.top);
          hoverRef.current = id;
          el!.style.cursor = id ? "pointer" : "grab";
          return;
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        // The closer the camera, the finer the drag.
        const sens = 0.2 * (dist - 1);
        dLon -= dx * sens;
        dLat = Math.max(-30, Math.min(30, dLat + dy * sens));
      }
      function onUp(e: PointerEvent) {
        dragging = false;
        if (moved < 6) {
          const rect = el!.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const id = pinAt(x, y);
          if (id) openBranch(id, x, y);
        }
      }
      function onLeave() {
        hoverRef.current = null;
      }
      el!.addEventListener("pointerdown", onDown);
      el!.addEventListener("pointermove", onMove);
      el!.addEventListener("pointerup", onUp);
      el!.addEventListener("pointercancel", onUp);
      el!.addEventListener("pointerleave", onLeave);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        el!.removeEventListener("pointerdown", onDown);
        el!.removeEventListener("pointermove", onMove);
        el!.removeEventListener("pointerup", onUp);
        el!.removeEventListener("pointercancel", onUp);
        el!.removeEventListener("pointerleave", onLeave);
        pins.forEach((pn) => pn.lab.remove());
        [earth, clouds, atm].forEach((m) => {
          m.geometry.dispose();
          m.material.dispose();
        });
        starGeo.dispose();
        ["day", "night", "topo"].forEach((key) => {
          const t = earth.material.uniforms[key].value;
          if (t && t !== blank) t.dispose();
        });
        renderer.dispose();
      };
    }

    function go() {
      loadThree()
        .then((THREE) => {
          if (disposed) return;
          teardown = build(THREE);
        })
        .catch(() => {
          if (!disposed) setFailed(true);
        });
    }

    // Download the 3D engine as soon as the page is idle, so it is ready before the visitor scrolls here.
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const timer = idle ? idle(go) : window.setTimeout(go, 150);

    // Start as soon as the visitor is about to reach the globe, and stop drawing when it is out of view.
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        onscreen = hit;
        if (hit && !visible) {
          visible = true;
          beginFn?.();
        }
      },
      { threshold: 0.05, rootMargin: "300px 0px" },
    );
    observer.observe(wrap);

    return () => {
      disposed = true;
      if (idle) (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(timer);
      else window.clearTimeout(timer);
      observer.disconnect();
      teardown?.();
    };
  }, [bleed]);

  const picked = choice ? branches.find((b) => b.id === choice.id) : undefined;

  return (
    <div
      className={
        failed
          ? bleed
            ? "bg-canvas px-5 py-10"
            : "overflow-hidden rounded-[24px] bg-canvas p-3 shadow-card ring-1 ring-line"
          : bleed
            ? "bg-black"
            : "overflow-hidden rounded-[24px] bg-black p-3 shadow-card ring-1 ring-line"
      }
    >
      <div ref={box} className={failed ? "hidden" : "relative w-full overflow-hidden"}>
        <canvas
          ref={canvas}
          role="img"
          aria-label={c.alt}
          className={`block w-full cursor-grab touch-pan-y ${bleed ? "" : "rounded-2xl"}`}
        />
        <div ref={labelLayer} className="pointer-events-none absolute inset-0" />
        <div
          ref={caption}
          aria-hidden="true"
          className="pointer-events-none absolute top-5 left-[18px] text-[11px] font-semibold tracking-[2px] text-white opacity-0"
        />
        {choice && picked ? (
          <div
            className="absolute z-10 w-56 rounded-xl bg-surface p-3 text-ink shadow-card ring-1 ring-line"
            style={{
              left: Math.max(8, Math.min(choice.x - 112, (box.current?.clientWidth ?? 400) - 232)),
              top: Math.max(8, Math.min(choice.y + 14, (box.current?.clientHeight ?? 400) - 150)),
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-accent uppercase">{picked.city}</p>
              <button
                type="button"
                aria-label={c.close}
                onClick={() => setChoice(null)}
                className="px-1 text-lg leading-none text-ink/60 hover:text-ink"
              >
                ×
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {picked.places.map((place) => (
                <li key={place.query}>
                  <a
                    href={placeUrl(place)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setChoice(null)}
                    className="block rounded-lg px-2 py-1.5 text-sm hover:bg-canvas"
                  >
                    {place.address[lang]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* The same links as the pins, for keyboards and screen readers (and if the map cannot load). */}
      <ul className={failed ? "grid gap-2 sm:grid-cols-2" : "sr-only"}>
        {branches.flatMap((b) =>
          b.places.map((place) => (
            <li key={`${b.id}-${place.query}`}>
              <a
                href={placeUrl(place)}
                target="_blank"
                rel="noreferrer"
                className={failed ? "block rounded-lg px-3 py-2 text-sm text-ink ring-1 ring-line hover:bg-surface" : ""}
              >
                {b.city}: {place.address[lang]}
              </a>
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
