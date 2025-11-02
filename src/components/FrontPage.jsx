import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function FallingAstronaut() {
  const { scene } = useGLTF("/models/astronaut.glb");
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      // Slow floating downward and rotating
      ref.current.position.y = Math.sin(t / 2) * -2 - (t % 10) * 0.05; // continuous fall effect
      ref.current.rotation.y += 0.002;
      ref.current.rotation.x = Math.sin(t / 3) * 0.2;
    }
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={1.4}
      position={[0, 3, 0]}
    />
  );
}

export default function FrontPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Static Background Layers */}
      <img
        src="/assets/sky.png"
        alt="sky"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <img
        src="/assets/planets.png"
        alt="planets"
        className="absolute inset-0 w-full h-full object-cover z-10 opacity-80"
      />
      <img
        src="/assets/mountain-1.png"
        alt="mountain1"
        className="absolute bottom-0 w-full object-cover z-20"
      />
      <img
        src="/assets/mountain-2.png"
        alt="mountain2"
        className="absolute bottom-0 w-full object-cover z-30 opacity-90"
      />
      <img
        src="/assets/mountain-3.png"
        alt="mountain3"
        className="absolute bottom-0 w-full object-cover z-40 opacity-100"
      />

      {/* Astronaut 3D Scene */}
      <div className="absolute inset-0 z-50">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <FallingAstronaut />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Optional Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-left justify-top text-white z-[60] pointer-events-none">
        <h1 className="text-4xl font-bold tracking-wider">Hi I'm Roshan </h1>
        <p className="mt-2 text-lg text-white/80">
          3D Gamified Portfolio
        </p>
      </div>
    </div>
  );
}
