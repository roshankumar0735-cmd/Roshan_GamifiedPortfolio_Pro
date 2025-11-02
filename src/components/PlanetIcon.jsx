import React, { useRef, useFrame } from 'react'
import { Html, Float } from '@react-three/drei'

export default function PlanetIcon({ item, onClick }){
  const ref = useRef()
  useFrame((state, dt)=>{
    if(ref.current){
      ref.current.rotation.y += dt*0.2
      ref.current.position.y += Math.sin(state.clock.elapsedTime + item.pos[0])*0.002
    }
  })
  return (
    <Float floatIntensity={0.6} speed={1} rotationIntensity={0.5}>
      <mesh ref={ref} position={item.pos} onClick={(e)=>{ e.stopPropagation(); onClick(item.id) }} castShadow>
        <icosahedronGeometry args={[item.size, 4]} />
        <meshStandardMaterial metalness={0.4} roughness={0.45} color={item.color} />
        <Html center distanceFactor={8} position={[0, -item.size - 0.2, 0]}>
          <div style={{ fontSize: 14, textAlign: 'center', pointerEvents: 'none', color: '#fff' }}>{item.label}</div>
        </Html>
      </mesh>
    </Float>
  )
}
