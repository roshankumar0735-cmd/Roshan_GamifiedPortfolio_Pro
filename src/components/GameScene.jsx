import React, { useRef, useMemo, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import ArrowMesh from "./ArrowMesh";

function generatePositions(count, radius = 6, spread = 2.5) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    const r = radius + (Math.random() - 0.5) * spread;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) + (Math.random() - 0.5) * 1.5;
    const z = r * Math.sin(phi) * Math.sin(theta);
    arr.push([x, y, z]);
  }
  return arr;
}

// 🌠 Shooting Stars background
function ShootingStars() {
  const group = useRef();
  const stars = useMemo(
    () =>
      new Array(20).fill().map(() => ({
        position: new THREE.Vector3(
          Math.random() * 200 - 100,
          Math.random() * 100 - 50,
          Math.random() * -50
        ),
        speed: 0.6 + Math.random() * 0.4,
      })),
    []
  );

  useFrame(() => {
    if (group.current) {
      group.current.children.forEach((star, i) => {
        const s = stars[i];
        star.position.x -= s.speed;
        star.position.y -= s.speed * 0.3;

        if (star.position.x < -100 || star.position.y < -50) {
          star.position.x = 100;
          star.position.y = 50;
        }
      });
    }
  });

  return (
    <group ref={group}>
      {stars.map((s, i) => (
        <mesh key={i} position={s.position}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

function IconSphere({ texture, pos, color, idx, iconId, isHit, onHit, sphereRefCallback }) {
  const sphereRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sphereRef.current && pos && Array.isArray(pos)) {
      sphereRef.current.position.y = pos[1] + Math.sin(t + pos[0] + idx) * 0.45;
      sphereRef.current.position.x = pos[0];
      sphereRef.current.position.z = pos[2];
    }
  });

  // Expose sphere ref for collision detection
  useEffect(() => {
    if (sphereRef.current && sphereRefCallback) {
      sphereRefCallback(idx, sphereRef);
    }
  }, [idx, sphereRefCallback]);

  return (
    <mesh
      ref={sphereRef}
      position={pos}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial
        map={texture || null}
        emissive={new THREE.Color(isHit ? "#00ff00" : color || "#60a5fa")}
        emissiveIntensity={isHit ? 1.2 : 0.7}
        metalness={0.6}
        roughness={0.3}
      />
      {/* Visual indicator for hit sphere */}
      {isHit && (
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </mesh>
  );
}

/** Futuristic glowing info box */
function InfoBillboard({ position, label, onClose, content }) {
  return (
    <Html position={position} center>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(17, 24, 39, 0.75)",
          backdropFilter: "blur(14px)",
          color: "#e0f2fe",
          padding: "22px 28px",
          borderRadius: "16px",
          border: "1px solid rgba(96,165,250,0.4)",
          boxShadow:
            "0 0 30px rgba(96,165,250,0.6), inset 0 0 12px rgba(96,165,250,0.3)",
          minWidth: 420,
          maxWidth: 520,
          fontFamily: "Poppins, sans-serif",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 10,
            background:
              "linear-gradient(90deg, #60a5fa, #38bdf8, #818cf8, #60a5fa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            letterSpacing: "1px",
          }}
        >
          {label}
        </h2>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            textAlign: "left",
            color: "#f3f4f6",
          }}
        >
          {content}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            marginTop: 15,
            padding: "7px 14px",
            fontSize: 13,
            background:
              "linear-gradient(90deg, #1e3a8a, #3b82f6, #2563eb, #1e3a8a)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 0 10px rgba(59,130,246,0.7)",
            transition: "all 0.3s ease",
          }}
        >
          Close
        </button>
      </div>
    </Html>
  );
}

// Internal game logic component that can access Three.js state
function GameLogic({ 
  iconMeta, 
  positions, 
  textures, 
  onHit, 
  onMiss, 
  hitSpheres, 
  arrowsRemaining,
  gameOver = false,
  fireArrowCallback
}) {
  const { camera, size, viewport } = useThree();
  const [arrows, setArrows] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const sphereRefs = useRef({});
  const controlsRef = useRef();

  // Register sphere refs
  const setSphereRef = (idx, ref) => {
    sphereRefs.current[idx] = ref;
  };

  // Fire arrow function exposed to parent
  useEffect(() => {
    if (fireArrowCallback) {
      fireArrowCallback.current = () => {
        if (arrowsRemaining <= 0) {
          return;
        }
        
        try {
          // Get camera forward direction (where camera is looking)
          const cameraForward = new THREE.Vector3(0, 0, -1);
          cameraForward.applyQuaternion(camera.quaternion);
          cameraForward.normalize();
          
          // Use full camera direction (X, Y, Z) - arrow moves in exact direction camera is viewing
          const direction = cameraForward.clone();
          
          const speed = 25;
          
          // Start arrow from camera position (slightly in front)
          const startOffset = direction.clone().multiplyScalar(1.5); // 1.5 units in front of camera
          const startPos = camera.position.clone().add(startOffset);
          
          // Velocity in camera's viewing direction (full 3D movement)
          const velocity = direction.multiplyScalar(speed);
          
          const arrowId = Date.now();
          const newArrow = {
            id: arrowId,
            pos: [startPos.x, startPos.y, startPos.z],
            vel: [velocity.x, velocity.y, velocity.z], // Full 3D movement in camera direction
            active: true,
            lifetime: 0,
            maxLifetime: 3 // 3 seconds max (reduced for faster testing)
          };
          console.log(`🏹 Fired arrow ${arrowId} - will expire in ${newArrow.maxLifetime}s if no hit`);
          
          setArrows(prev => [...prev, newArrow]);
        } catch (error) {
          console.error("Error firing arrow:", error);
        }
      };
    }
    return () => {
      if (fireArrowCallback) {
        fireArrowCallback.current = null;
      }
    };
  }, [arrowsRemaining, fireArrowCallback]);

  // Track arrows that have already triggered onMiss to avoid duplicate calls
  const processedMissedArrows = useRef(new Set());
  const [missTrigger, setMissTrigger] = useState(0); // State to trigger miss processing
  const processedTriggerRef = useRef(0); // Track the last processed trigger value
  const gameOverRef = useRef(gameOver); // Ref to track gameOver without causing re-renders
  const arrowsRemainingRef = useRef(arrowsRemaining); // Ref to track arrowsRemaining without causing re-renders
  
  // Update refs when values change
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);
  
  useEffect(() => {
    arrowsRemainingRef.current = arrowsRemaining;
  }, [arrowsRemaining]);
  
  // Track previous arrowsRemaining to detect resets
  const prevArrowsRemaining = useRef(arrowsRemaining);
  
  // Reset tracking when game resets (when arrowsRemaining resets to 5 or gameOver changes)
  useEffect(() => {
    // Detect when game just reset: arrowsRemaining changed from non-5 to 5, and gameOver is false
    const justReset = arrowsRemaining === 5 && !gameOver && prevArrowsRemaining.current !== 5;
    
    if (justReset) {
      // CRITICAL: Mark the CURRENT missTrigger value as processed, then reset everything
      // This prevents the stale trigger value from being processed after reset
      const oldTriggerValue = missTrigger;
      processedTriggerRef.current = oldTriggerValue; // Mark current trigger as processed
      processedMissedArrows.current.clear();
      setMissTrigger(0); // Reset miss trigger when game resets (async, happens later)
      setArrows([]); // Clear all arrows when game resets
      console.log(`Reset: Marked trigger ${oldTriggerValue} as processed, then resetting to 0`);
      
      // Reset processedTriggerRef to 0 after a short delay to ensure clean slate for new game
      // This delay ensures any pending effects with old trigger values won't process
      // Use refs to check current values without stale closures
      setTimeout(() => {
        if (arrowsRemainingRef.current === 5) {
          processedTriggerRef.current = 0;
          console.log('Reset processedTriggerRef to 0 after reset delay');
        }
      }, 100);
    }
    
    prevArrowsRemaining.current = arrowsRemaining;
  }, [arrowsRemaining, gameOver, missTrigger]);
  
  // Process misses when trigger changes (only process if > 0 and only call once per increment)
  useEffect(() => {
    // Skip if trigger is 0
    if (missTrigger === 0) {
      return;
    }
    
    // Only process if this is a NEW trigger value we haven't processed yet
    // Use refs to get current values without triggering re-runs
    const currentGameOver = gameOverRef.current;
    const currentArrowsRemaining = arrowsRemainingRef.current;
    
    // CRITICAL: If we're in a fresh game (arrowsRemaining === 5) and missTrigger is low (1-5),
    // reset processedTriggerRef to 0 to ensure new triggers are processed correctly.
    // This handles the case where processedTriggerRef still has the old value from previous game.
    if (currentArrowsRemaining === 5 && missTrigger <= 5 && processedTriggerRef.current > 5) {
      console.log(`Resetting processedTriggerRef from ${processedTriggerRef.current} to 0 (fresh game, trigger ${missTrigger})`);
      processedTriggerRef.current = 0;
    }
    
    if (missTrigger > processedTriggerRef.current && onMiss && !currentGameOver && currentArrowsRemaining > 0) {
      console.log(`🔥 Processing NEW miss trigger ${missTrigger} (last processed: ${processedTriggerRef.current}) - calling onMiss()`);
      console.log(`Current arrowsRemaining: ${currentArrowsRemaining}, gameOver: ${currentGameOver}`);
      
      // Mark this trigger as processed BEFORE calling onMiss
      // This prevents the effect from running again when arrowsRemaining changes
      processedTriggerRef.current = missTrigger;
      
      // Call onMiss only once per trigger increment
      onMiss(); // This should call handleArrowMiss and decrease count
    } else if (missTrigger > 0 && missTrigger <= processedTriggerRef.current) {
      console.log(`⚠️ Skipping already processed miss trigger ${missTrigger} (last processed: ${processedTriggerRef.current})`);
    } else if (missTrigger > 0) {
      console.log(`⚠️ Skipping miss trigger ${missTrigger} - arrowsRemaining: ${currentArrowsRemaining}, gameOver: ${currentGameOver}, onMiss: ${!!onMiss}`);
    }
  }, [missTrigger, onMiss]); // Only depend on missTrigger and onMiss - use refs for other values
  
  // Arrow collision detection and movement
  useFrame((state, delta) => {
    setArrows(prevArrows => {
      const updatedArrows = [];
      
      prevArrows.forEach(arrow => {
        // Skip arrows that are already inactive and processed
        if (!arrow.active && processedMissedArrows.current.has(arrow.id)) {
          return; // Already processed as miss, skip
        }
        
        if (!arrow.active) {
          // Keep recently inactive arrows briefly for cleanup
          if (arrow.lifetime < arrow.maxLifetime + 0.5) {
            updatedArrows.push(arrow);
          }
          return;
        }
        
        // Update arrow lifetime
        arrow.lifetime += delta;
        
        // Update arrow position (full 3D movement in camera direction)
        arrow.pos[0] += arrow.vel[0] * delta;
        arrow.pos[1] += arrow.vel[1] * delta;
        arrow.pos[2] += arrow.vel[2] * delta;
        
        const arrowPos = new THREE.Vector3(arrow.pos[0], arrow.pos[1], arrow.pos[2]);
        
        // Check collision with spheres FIRST (before checking expiration)
        let hitDetected = false;
        
        for (let i = 0; i < iconMeta.length; i++) {
          if (hitSpheres.includes(iconMeta[i].id)) continue; // Already hit
          
          const sphereRef = sphereRefs.current[i]?.current;
          if (!sphereRef) continue;
          
          const spherePos = new THREE.Vector3().setFromMatrixPosition(sphereRef.matrixWorld);
          const distance = arrowPos.distanceTo(spherePos);
          
          if (distance < 1.2) { // Hit detected (sphere radius + margin)
            arrow.active = false;
            hitDetected = true;
            // Arrow HIT - remove from missed tracking, don't count as miss
            processedMissedArrows.current.delete(arrow.id);
            if (onHit) {
              console.log(`✅ Arrow ${arrow.id} HIT sphere ${iconMeta[i].id} - count will NOT decrease`);
              onHit(iconMeta[i].id, i);
              setActiveIndex(i);
            }
            // Arrow hit, so count doesn't decrease - don't call onMiss
            return; // Don't add to updatedArrows, arrow hit a sphere
          }
        }
        
        // Check if arrow went too far away (count as miss)
        const distanceFromOrigin = arrowPos.length();
        const maxDistance = 50;
        
        if (distanceFromOrigin > maxDistance && !hitDetected) {
          arrow.active = false;
          if (!processedMissedArrows.current.has(arrow.id)) {
            processedMissedArrows.current.add(arrow.id);
            setMissTrigger(prev => prev + 1); // Trigger miss processing
            console.log(`❌ Arrow ${arrow.id} went too far (${distanceFromOrigin.toFixed(2)} units) - MISS (triggered)`);
          }
          // Keep briefly for cleanup
          updatedArrows.push(arrow);
          return;
        }
        
        // Check if arrow expired by time (missed) AFTER checking for hits
        if (arrow.lifetime >= arrow.maxLifetime && !hitDetected) {
          arrow.active = false;
          if (!processedMissedArrows.current.has(arrow.id)) {
            processedMissedArrows.current.add(arrow.id);
            setMissTrigger(prev => prev + 1); // Trigger miss processing
            console.log(`❌ Arrow ${arrow.id} expired after ${arrow.lifetime.toFixed(2)}s (max: ${arrow.maxLifetime}s) - MISS (triggered)`);
          }
          // Keep briefly for cleanup
          updatedArrows.push(arrow);
          return;
        }
        
        // Arrow is still active and didn't hit - continue tracking
        updatedArrows.push(arrow);
      });
      
      // Filter out very old inactive arrows (cleanup)
      return updatedArrows.filter(arrow => arrow.active || arrow.lifetime < arrow.maxLifetime + 1.0);
    });
  });

  const infoContents = {
    About: (
      <>
        <strong>Name:</strong> Roshan Sah <br />
        <strong>Title:</strong> M.Sc. Information & Communication (Pursuing) ||
        B.Sc. Electronics (2023) || Web Development & Machine Learning Enthusiast ||
        Exploring Software Development || Tech Learner
      </>
    ),
    Projects: (
      <>
        <strong>My First Project:</strong> This 3D gamified portfolio built using React + Three.js + Vite.
      </>
    ),
    Skills: (
      <>
        <ul>
          <li>Web Development (HTML, CSS, JavaScript)</li>
          <li>Python Programming</li>
          <li>C / C++ Programming</li>
          <li>MySQL Database</li>
        </ul>
      </>
    ),
    Experience: <>Fresher — Actively working on personal projects.</>,
    Qualification: (
      <>
        <ul>
          <li>M.Sc. in Informatics & Communication (2026)</li>
          <li>B.Sc. in Electronics (2023)</li>
        </ul>
      </>
    ),
    Contact: (
      <>
        <strong>Email:</strong> roshankumar0735@gmail.com
      </>
    ),
    LinkedIn: (
      <>
        <a
          href="https://www.linkedin.com/in/roshan-sah-0b1371219"
          target="_blank"
          rel="noopener noreferrer"
        >
          👉 Visit My LinkedIn Profile
        </a>
      </>
    ),
    GitHub: (
      <>
        <a
          href="https://github.com/roshankumar0735-cmd"
          target="_blank"
          rel="noopener noreferrer"
        >
          👉 Visit My GitHub Profile
        </a>
      </>
    ),
  };

  return (
    <>
      {/* Render spheres */}
      {iconMeta.map((meta, i) => (
        <IconSphere
          key={i}
          texture={textures[i]}
          pos={positions[i]}
          color={meta.color}
          idx={i}
          iconId={meta.id}
          isHit={hitSpheres.includes(meta.id)}
          onHit={onHit}
          sphereRefCallback={setSphereRef}
        />
      ))}

      {/* Render arrows */}
      {arrows.map((arrow) => (
        arrow.active && (
          <ArrowMesh key={arrow.id} data={arrow} />
        )
      ))}

      {/* Info billboard - show when sphere is hit */}
      {activeIndex !== null && (
        <InfoBillboard
          position={[
            positions[activeIndex][0] * 0.9,
            positions[activeIndex][1] + 1.7,
            positions[activeIndex][2] * 0.9,
          ]}
          label={iconMeta[activeIndex].label}
          content={infoContents[iconMeta[activeIndex].label]}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}

const NebulaShader = () => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={ref} position={[0, 0, -50]}>
      <sphereGeometry args={[90, 64, 64]} />
      <shaderMaterial
        attach="material"
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#6EE7B7") },
        }}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.x += sin(uTime * 0.2 + position.y * 4.0) * 0.02;
            pos.y += cos(uTime * 0.15 + position.x * 3.0) * 0.02;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform vec3 uColor;
          void main() {
            float glow = 0.25 + 0.75 * smoothstep(0.2, 1.0, sin(vUv.x * 50.0 + vUv.y * 40.0));
            gl_FragColor = vec4(uColor * glow, 0.15);
          }
        `}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

const GameScene = forwardRef(({ onHit, onMiss, arrowsRemaining, hitSpheres = [], gameOver = false }, ref) => {
  const iconMeta = useMemo(
    () => [
      { file: "/icons/about.svg", label: "About", color: "#60a5fa", id: "about" },
      { file: "/icons/projects.svg", label: "Projects", color: "#34d399", id: "projects" },
      { file: "/icons/skills.svg", label: "Skills", color: "#fbbf24", id: "skills" },
      { file: "/icons/experience.svg", label: "Experience", color: "#f87171", id: "experience" },
      { file: "/icons/qualification.svg", label: "Qualification", color: "#a78bfa", id: "qualification" },
      { file: "/icons/contact.svg", label: "Contact", color: "#38bdf8", id: "contact" },
      { file: "/icons/linkedin.svg", label: "LinkedIn", color: "#2563eb", id: "linkedin" },
      { file: "/icons/github.svg", label: "GitHub", color: "#9ca3af", id: "github" },
    ],
    []
  );

  const positions = useMemo(() => generatePositions(iconMeta.length, 7, 3), [iconMeta.length]);
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return iconMeta.map((m) => {
      try {
        const texture = loader.load(m.file);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      } catch (error) {
        console.warn(`Failed to load texture: ${m.file}`, error);
        return null;
      }
    });
  }, [iconMeta]);
  const fireArrowRef = useRef();

  useImperativeHandle(ref, () => ({
    fireArrow: () => {
      if (fireArrowRef.current) {
        fireArrowRef.current();
      }
    }
  }), []);

  return (
    <div className="w-full h-full bg-black">
      <Canvas
        shadows
        camera={{ position: [0, 0, 14], fov: 60 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.4;
        }}
      >
        <color attach="background" args={["#030014"]} />
        <fog attach="fog" args={["#030014", 15, 90]} />

        <ShootingStars />
        <Stars radius={200} depth={80} count={5000} factor={4} fade speed={1} />
        <NebulaShader />

        <mesh position={[0, 0, -20]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-8, -4, -6]} intensity={0.5} />

        <GameLogic
          iconMeta={iconMeta}
          positions={positions}
          textures={textures}
          onHit={onHit}
          onMiss={onMiss}
          hitSpheres={hitSpheres}
          arrowsRemaining={arrowsRemaining}
          gameOver={gameOver}
          fireArrowCallback={fireArrowRef}
        />

        <OrbitControls enableZoom={true} zoomSpeed={0.6} maxDistance={30} minDistance={6} />
      </Canvas>
    </div>
  );
});

GameScene.displayName = "GameScene";

export default GameScene;
