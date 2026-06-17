import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { BlochCoords } from '../../types/quantum';
import { radToDeg } from '../../utils/format';

interface BlochSphereInnerProps {
  coords: BlochCoords;
  showTooltip?: boolean;
  autoRotate?: boolean;
}

function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const dot = Math.max(-1, Math.min(1, a.dot(b)));
  if (dot > 0.9995) return a.clone().lerp(b, t).normalize();
  const theta = Math.acos(dot) * t;
  const rel = b.clone().sub(a.clone().multiplyScalar(dot)).normalize();
  return a.clone().multiplyScalar(Math.cos(theta)).add(rel.multiplyScalar(Math.sin(theta)));
}

function BlochArrow({ target }: { target: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null);
  const current = useRef(new THREE.Vector3(0, 0, 1));
  const tipRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const t = Math.min(1, delta * 4);
    const next = slerp(current.current, target, t);
    current.current.copy(next);
    const len = next.length();
    ref.current.scale.set(1, len, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), next.clone().normalize());
    ref.current.quaternion.copy(q);
    if (tipRef.current) {
      tipRef.current.position.copy(next);
    }
  });

  const dir = current.current.clone().normalize();
  return (
    <group>
      <group ref={ref}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <mesh ref={tipRef}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.2} />
      </mesh>
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(dir.x * 0.3, dir.y * 0.3, dir.z * 0.3)]}
        color="#f97316"
        lineWidth={3}
        transparent
        opacity={0.3}
      />
    </group>
  );
}

function Axis({ dir, color, label, labelPos }: { dir: [number, number, number]; color: string; label: string; labelPos: [number, number, number] }) {
  return (
    <>
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(...dir)]}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={0.75}
      />
      <Html position={labelPos} center distanceFactor={6} zIndexRange={[10, 0]}>
        <span
          className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded pointer-events-none"
          style={{ color, background: 'rgba(15,23,42,0.65)', border: `1px solid ${color}66` }}
        >
          {label}
        </span>
      </Html>
    </>
  );
}

function EquatorRing() {
  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      arr.push(new THREE.Vector3(Math.cos(t), 0, Math.sin(t)));
    }
    return arr;
  }, []);
  return <Line points={points} color="rgba(148,163,184,0.25)" lineWidth={1} />;
}

function MeridianRings() {
  const ring1 = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      arr.push(new THREE.Vector3(0, Math.sin(t), Math.cos(t)));
    }
    return arr;
  }, []);
  const ring2 = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      arr.push(new THREE.Vector3(Math.sin(t), Math.cos(t), 0));
    }
    return arr;
  }, []);
  return (
    <>
      <Line points={ring1} color="rgba(148,163,184,0.15)" lineWidth={1} />
      <Line points={ring2} color="rgba(148,163,184,0.15)" lineWidth={1} />
    </>
  );
}

function BlochScene({ coords, showTooltip = true, autoRotate = true }: BlochSphereInnerProps) {
  const controlsRef = useRef<any>(null);
  const target = useMemo(
    () => new THREE.Vector3(coords.x, coords.z, coords.y),
    [coords.x, coords.y, coords.z]
  );

  useFrame(() => {
    if (autoRotate && controlsRef.current && !controlsRef.current?.isDragging) {
      controlsRef.current.autoRotateSpeed = 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2]} intensity={0.6} color="#67e8f9" />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#a855f7" distance={2} />
      <directionalLight position={[-2, -3, -1]} intensity={0.3} color="#475569" />

      <Sphere args={[0.97, 32, 32]}>
        <meshStandardMaterial
          color="#0ea5e9"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          roughness={0.2}
          metalness={0.1}
        />
      </Sphere>

      <Sphere args={[0.97, 32, 32]}>
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.06} />
      </Sphere>

      <EquatorRing />
      <MeridianRings />

      <Axis dir={[1.05, 0, 0]} color="#ef4444" label="x" labelPos={[1.2, 0, 0]} />
      <Axis dir={[0, 0, 1.05]} color="#10b981" label="y" labelPos={[0, 0, 1.22]} />
      <Axis dir={[0, 1.05, 0]} color="#3b82f6" label="z |0⟩" labelPos={[0, 1.2, 0]} />
      <Axis dir={[0, -1.05, 0]} color="#6366f1" label="|1⟩" labelPos={[0, -1.22, 0]} />

      <BlochArrow target={target} />

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {showTooltip && (
        <Html position={[target.x * 1.18, target.z * 1.18 + 0.1, target.y * 1.18]} center distanceFactor={5}>
          <div
            className="text-[9px] font-mono px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap"
            style={{
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(249,115,22,0.5)',
              color: '#fdba74',
              boxShadow: '0 0 16px rgba(249,115,22,0.2)',
            }}
          >
            θ={radToDeg(coords.theta).toFixed(0)}° φ={radToDeg(coords.phi).toFixed(0)}°
          </div>
        </Html>
      )}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        rotateSpeed={0.6}
      />
    </>
  );
}

export interface BlochSphereProps {
  coords: BlochCoords;
  label?: string;
  index?: number;
  autoRotate?: boolean;
  showTooltip?: boolean;
}

export function BlochSphere({ coords, label, index, autoRotate = true, showTooltip = true }: BlochSphereProps) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/5" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.1) 0%, rgba(2,6,23,0.98) 70%)' }}>
      {label && (
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
          <span className="text-[11px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-slate-900/70 border border-cyan-400/30">
            {label}
          </span>
          {index !== undefined && (
            <span className="text-[9px] text-slate-500 font-mono">q{index}</span>
          )}
        </div>
      )}
      <Canvas
        camera={{ position: [1.9, 1.5, 1.9], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <BlochScene coords={coords} autoRotate={autoRotate} showTooltip={showTooltip} />
      </Canvas>
    </div>
  );
}
