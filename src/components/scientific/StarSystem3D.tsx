"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StarSystemData } from '@/types';
import type { SceneFocusTarget } from '@/context/AppContext';

interface StarSystem3DProps {
  systemData: StarSystemData;
  viewMode: 'orbital' | 'habitable' | 'composition';
  autoRotate: boolean;
  selectedPlanet?: string | null;
  onPlanetSelect?: (planetId: string | null) => void;
  cameraResetNonce?: number;
  cameraFocusTarget?: SceneFocusTarget;
  reducedMotion?: boolean;
}

// Visualization-only scaling (scientific AU values in systemData are preserved)
const DIST_SCALE = 4.5;
const PLANET_VISUAL: Record<string, number> = {
  mercury: 0.08,
  venus: 0.16,
  earth: 0.17,
  mars: 0.12,
};
// Habitable zone boundaries (AU) — Kopparapu et al. 2013, ApJ 765,131; erratum ApJ 770,82
const HZ_CONSERVATIVE = { inner: 0.99, outer: 1.67 };
const HZ_OPTIMISTIC = { inner: 0.75, outer: 1.77 };

const CAMERA_DEFAULT_POS = new THREE.Vector3(0, 8.5, 16);
const CAMERA_DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

function toVisualAu(au: number): number {
  return au * DIST_SCALE;
}

function createOrbitRing(radius: number, color: number, opacity: number): THREE.LineLoop {
  const segments = 128;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.LineLoop(geo, mat);
}

function createHzRing(innerAu: number, outerAu: number, color: number, opacity: number): THREE.Mesh {
  const inner = toVisualAu(innerAu);
  const outer = toVisualAu(outerAu);
  const geo = new THREE.RingGeometry(inner, outer, 128);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function createHzLabel(text: string, x: number, z: number, y = 0.15): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '28px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(232,236,241,0.92)';
    ctx.strokeStyle = 'rgba(5,6,10,0.75)';
    ctx.lineWidth = 4;
    ctx.strokeText(text, 12, 58);
    ctx.fillText(text, 12, 58);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x, y, z);
  sprite.scale.set(2.8, 0.52, 1);
  return sprite;
}

function createStarfield(count: number, spread: number): THREE.Points {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = spread * (0.4 + Math.random() * 0.6);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const b = 0.55 + Math.random() * 0.45;
    const tint = Math.random();
    colors[i * 3] = b * (0.9 + tint * 0.1);
    colors[i * 3 + 1] = b * (0.92 + tint * 0.08);
    colors[i * 3 + 2] = b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

export const StarSystem3D: React.FC<StarSystem3DProps> = ({
  systemData,
  viewMode,
  autoRotate,
  selectedPlanet,
  onPlanetSelect,
  cameraResetNonce = 0,
  cameraFocusTarget = null,
  reducedMotion = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneApiRef = useRef<{
    planetById: Map<string, THREE.Mesh>;
    star: THREE.Mesh;
    selectionRing: THREE.Mesh;
    pickables: THREE.Object3D[];
    setSelected: (id: string | null) => void;
  } | null>(null);
  const onPlanetSelectRef = useRef(onPlanetSelect);
  const cameraMotionRef = useRef<{
    active: boolean;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    start: number;
    duration: number;
  } | null>(null);

  useEffect(() => {
    onPlanetSelectRef.current = onPlanetSelect;
  }, [onPlanetSelect]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060a);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    camera.position.copy(CAMERA_DEFAULT_POS);
    camera.lookAt(CAMERA_DEFAULT_TARGET);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.touchAction = 'none'; // allow OrbitControls on touch

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !reducedMotion;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.target.copy(CAMERA_DEFAULT_TARGET);
    controls.minDistance = 6;
    controls.maxDistance = 48;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI - 0.15;
    controls.update();
    controlsRef.current = controls;

    const updateSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    updateSize();
    container.appendChild(renderer.domElement);

    const starfield = createStarfield(1800, 120);
    scene.add(starfield);

    const starRadius = 1.15;
    const starGeo = new THREE.SphereGeometry(starRadius, 48, 48);
    const starMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(systemData.star.color || '#FFD700'),
      emissive: new THREE.Color('#FFCC66'),
      emissiveIntensity: 1.15,
      roughness: 0.35,
      metalness: 0.0,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.userData = { kind: 'star', id: 'sol', name: systemData.star.name || 'Sol' };
    scene.add(star);

    const glowGeo = new THREE.SphereGeometry(starRadius * 1.6, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffd27a,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    scene.add(new THREE.AmbientLight(0x334455, 0.45));
    const sunLight = new THREE.PointLight(0xfff2d0, 2.2, 120, 1.5);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    const fill = new THREE.DirectionalLight(0x8899bb, 0.35);
    fill.position.set(8, 12, 6);
    scene.add(fill);

    // Habitable zone overlays + labels (same visual scale as planets)
    const hzGroup = new THREE.Group();
    const optimistic = createHzRing(HZ_OPTIMISTIC.inner, HZ_OPTIMISTIC.outer, 0x00ff88, 0.045);
    const conservative = createHzRing(HZ_CONSERVATIVE.inner, HZ_CONSERVATIVE.outer, 0x00ff88, 0.085);
    hzGroup.add(optimistic);
    hzGroup.add(conservative);
    [
      createOrbitRing(toVisualAu(HZ_OPTIMISTIC.inner), 0x00ff88, 0.18),
      createOrbitRing(toVisualAu(HZ_OPTIMISTIC.outer), 0x00ff88, 0.18),
      createOrbitRing(toVisualAu(HZ_CONSERVATIVE.inner), 0x00ff88, 0.28),
      createOrbitRing(toVisualAu(HZ_CONSERVATIVE.outer), 0x00ff88, 0.28),
    ].forEach((l) => hzGroup.add(l));
    hzGroup.add(createHzLabel(`Conservative HZ ${HZ_CONSERVATIVE.inner}–${HZ_CONSERVATIVE.outer} AU`, toVisualAu(HZ_CONSERVATIVE.outer) + 0.1, 0));
    hzGroup.add(createHzLabel(`Optimistic HZ ${HZ_OPTIMISTIC.inner}–${HZ_OPTIMISTIC.outer} AU`, toVisualAu(HZ_OPTIMISTIC.outer) + 0.1, 0.75));
    hzGroup.visible = viewMode === 'habitable';
    scene.add(hzGroup);

    // Planets + orbits
    type PlanetEntry = {
      id: string;
      mesh: THREE.Mesh;
      orbitRadius: number;
      orbitalPeriod: number;
      angle: number;
      baseR: number;
    };
    const planetEntries: PlanetEntry[] = [];
    const planetById = new Map<string, THREE.Mesh>();
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    systemData.planets.forEach((planet, idx) => {
      const orbitRadius = toVisualAu(planet.distance);
      const orbitLine = createOrbitRing(orbitRadius, 0x6b7f99, viewMode === 'habitable' ? 0.22 : 0.32);
      orbitGroup.add(orbitLine);

      const visualR = PLANET_VISUAL[planet.id] ?? Math.min(0.22, Math.max(0.08, planet.radius * 0.14));
      const geo = new THREE.SphereGeometry(visualR, 32, 32);
      const baseColor = new THREE.Color(planet.color || '#888888');
      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor.clone().multiplyScalar(0.06),
        roughness: 0.55 + (idx % 2) * 0.15,
        metalness: 0.08,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { kind: 'planet', id: planet.id, name: planet.name };
      const angle = (idx / Math.max(1, systemData.planets.length)) * Math.PI * 2 + 0.6;
      mesh.position.set(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius);
      scene.add(mesh);
      planetEntries.push({ id: planet.id, mesh, orbitRadius, orbitalPeriod: Math.max(0.05, planet.orbitalPeriod), angle, baseR: visualR });
      planetById.set(planet.id, mesh);
    });

    // Selection ring (restrained, follows selected object)
    const selectionRingGeo = new THREE.RingGeometry(1, 1.18, 48);
    const selectionRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const selectionRing = new THREE.Mesh(selectionRingGeo, selectionRingMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.visible = false;
    scene.add(selectionRing);

    const setSelected = (id: string | null) => {
      selectionRing.visible = !!id;
      if (!id) return;
      if (id === 'sol') {
        selectionRing.position.copy(star.position);
        selectionRing.scale.setScalar(starRadius * 1.55);
      } else {
        const e = planetEntries.find((p) => p.id === id);
        if (e) {
          selectionRing.position.copy(e.mesh.position);
          selectionRing.scale.setScalar(e.baseR * 2.4);
        }
      }
    };
    setSelected(selectedPlanet ?? null);

    sceneApiRef.current = { planetById, star, selectionRing, pickables: [star, ...planetEntries.map((p) => p.mesh)], setSelected };

    const applyViewMode = (mode: StarSystem3DProps['viewMode']) => {
      hzGroup.visible = mode === 'habitable';
      orbitGroup.children.forEach((c) => {
        const mat = (c as THREE.LineLoop).material as THREE.LineBasicMaterial;
        if (mat && 'opacity' in mat) mat.opacity = mode === 'habitable' ? 0.18 : 0.32;
      });
    };
    applyViewMode(viewMode);

    // Raycasting selection (planets + star); independent of camera controls
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    const onPointerDown = (ev: PointerEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
    };
    const onPointerUp = (ev: PointerEvent) => {
      if (ev.button !== 0) return;
      const dx = ev.clientX - downX;
      const dy = ev.clientY - downY;
      if (Math.hypot(dx, dy) > 6) return; // drag -> orbit, not select
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(sceneApiRef.current?.pickables ?? [], false);
      const hit = hits[0]?.object as THREE.Mesh | undefined;
      const id = hit?.userData?.id as string | undefined;
      onPlanetSelectRef.current?.(id ?? null);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    let lastT = performance.now();
    const animate = (now: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      // Planetary orbital movement (independent of camera/autoRotate)
      const allowOrbit = autoRotate && !reducedMotion;
      if (allowOrbit) {
        planetEntries.forEach((p) => {
          const speed = (Math.PI * 2) / (p.orbitalPeriod * 8);
          p.angle += speed * dt;
          p.mesh.position.x = Math.cos(p.angle) * p.orbitRadius;
          p.mesh.position.z = Math.sin(p.angle) * p.orbitRadius;
        });
      }

      // Keep selection ring on moving object
      const sel = sceneApiRef.current;
      if (sel && selectionRing.visible) {
        const currentId = (selectedPlanet ?? null);
        // selection may change via effect; infer from visible? store in closure below
      }

      // Smooth camera motion (focus/reset)
      const motion = cameraMotionRef.current;
      if (motion && motion.active) {
        const t = Math.min(1, (now - motion.start) / motion.duration);
        const k = reducedMotion ? 1 : t * t * (3 - 2 * t);
        camera.position.lerpVectors(motion.fromPos, motion.toPos, k);
        controls.target.lerpVectors(motion.fromTarget, motion.toTarget, k);
        controls.update();
        if (t >= 1) motion.active = false;
      } else {
        controls.update();
      }

      // Follow selected ring each frame (handles orbit)
      if (selectionRing.visible) {
        const sid = (selectionRing.userData.sid as string | undefined) ?? null;
        if (sid === 'sol') {
          selectionRing.position.copy(star.position);
        } else if (sid) {
          const e = planetEntries.find((p) => p.id === sid);
          if (e) selectionRing.position.copy(e.mesh.position);
        }
      }

      const pulse = 1 + Math.sin(now * 0.0012) * 0.015;
      star.scale.setScalar(pulse);
      glow.scale.setScalar(pulse);

      renderer.render(scene, camera);
    };

    // expose ring sid setter via scene api
    const _setSelected = (id: string | null) => {
      selectionRing.userData.sid = id ?? undefined;
      setSelected(id);
    };
    _setSelected(selectedPlanet ?? null);
    sceneApiRef.current.setSelected = _setSelected;

    animationFrameRef.current = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => updateSize());
    ro.observe(container);
    resizeObserverRef.current = ro;
    updateSize();

    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      controlsRef.current = null;
      cameraRef.current = null;
      sceneApiRef.current = null;
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if ((mesh as any).geometry) (mesh as any).geometry.dispose?.();
        const mat = (mesh as any).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
        else {
          if (mat?.map) mat.map.dispose?.();
          mat?.dispose?.();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [systemData, viewMode, autoRotate, reducedMotion]); // selection/camera handled via refs/effects

  // Selection highlight updates (persists across re-renders; ring follows in RAF)
  useEffect(() => {
    sceneApiRef.current?.setSelected(selectedPlanet ?? null);
  }, [selectedPlanet]);

  // Camera reset
  useEffect(() => {
    if (cameraResetNonce <= 0) return;
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    if (!cam || !controls) return;
    cameraMotionRef.current = {
      active: true,
      fromPos: cam.position.clone(),
      toPos: CAMERA_DEFAULT_POS.clone(),
      fromTarget: controls.target.clone(),
      toTarget: CAMERA_DEFAULT_TARGET.clone(),
      start: performance.now(),
      duration: 650,
    };
  }, [cameraResetNonce]);

  // Camera focus on selected object
  useEffect(() => {
    if (!cameraFocusTarget) return;
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    const api = sceneApiRef.current;
    if (!cam || !controls || !api) return;
    let targetPos: THREE.Vector3 | null = null;
    let offset = new THREE.Vector3(0, 2.2, 5.5);
    if (cameraFocusTarget.kind === 'star') {
      targetPos = api.star.position.clone();
      offset = new THREE.Vector3(0, 2.8, 7.2);
    } else {
      const mesh = api.planetById.get(cameraFocusTarget.id);
      if (mesh) targetPos = mesh.position.clone();
      offset = new THREE.Vector3(0, 1.2, 3.6);
    }
    if (!targetPos) return;
    cameraMotionRef.current = {
      active: true,
      fromPos: cam.position.clone(),
      toPos: targetPos.clone().add(offset),
      fromTarget: controls.target.clone(),
      toTarget: targetPos.clone(),
      start: performance.now(),
      duration: 700,
    };
  }, [cameraFocusTarget]);

  // Keep OrbitControls damping in sync (controls recreated on mount; handled by deps)

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      aria-label="Interactive 3D solar system visualization"
    />
  );
};

export { HZ_CONSERVATIVE, HZ_OPTIMISTIC, toVisualAu, DIST_SCALE };