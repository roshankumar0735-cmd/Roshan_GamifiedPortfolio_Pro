import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ArrowMesh({ data }){
  const arrowGroup = useRef()
  const shaftRef = useRef()
  const tipRef = useRef()
  
  useEffect(() => {
    if (arrowGroup.current && data && data.pos) {
      arrowGroup.current.position.set(...data.pos)
      // Orient arrow in direction of velocity
      if (data.vel) {
        const direction = new THREE.Vector3(data.vel[0] || 0, data.vel[1] || 0, data.vel[2] || 0).normalize()
        if (direction.length() > 0.001) {
          arrowGroup.current.lookAt(
            arrowGroup.current.position.clone().add(direction)
          )
        }
      }
    }
  }, [data]);
  
  useFrame((state, dt) => {
    if (!arrowGroup.current || !data || !data.active || !data.vel) return
    
    // Move in full 3D direction (X, Y, Z) based on camera view direction
    if (data.vel && data.vel[0] !== undefined) {
      arrowGroup.current.position.x += data.vel[0] * dt
    }
    if (data.vel && data.vel[1] !== undefined) {
      arrowGroup.current.position.y += data.vel[1] * dt
    }
    if (data.vel && data.vel[2] !== undefined) {
      arrowGroup.current.position.z += data.vel[2] * dt
    }
    
    // Update rotation to match velocity direction (full 3D)
    if (data.vel && (data.vel[0] !== undefined || data.vel[1] !== undefined || data.vel[2] !== undefined)) {
      const vel = new THREE.Vector3(data.vel[0] || 0, data.vel[1] || 0, data.vel[2] || 0)
      if (vel.length() > 0.001) {
        vel.normalize()
        arrowGroup.current.lookAt(
          arrowGroup.current.position.clone().add(vel)
        )
      }
    }
  })
  
  if (!data.active) return null
  
  return (
    <group ref={arrowGroup}>
      {/* Arrow shaft - extends along negative Z (forward in default Three.js) */}
      <mesh ref={shaftRef} position={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
        <meshStandardMaterial 
          color="#8B4513" 
          emissive="#654321"
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      {/* Arrow tip - pointing forward along negative Z (toward target) */}
      <mesh ref={tipRef} position={[0, 0, -0.9]}>
        <coneGeometry args={[0.08, 0.4, 8]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFA500"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Glow effect around tip */}
      <mesh position={[0, 0, -0.9]}>
        <coneGeometry args={[0.1, 0.45, 8]} />
        <meshBasicMaterial 
          color="#FFD700" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
