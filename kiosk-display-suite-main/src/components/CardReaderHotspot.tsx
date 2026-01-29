/**
 * CARD READER HOTSPOT COMPONENT
 *
 * Invisible detection zone near the kiosk's card reader.
 * When the credit card enters this zone, it triggers the payment flow.
 *
 * ADJUSTABLE VARIABLES:
 * - HOTSPOT_POS: [x, y, z] position of the hotspot
 * - HOTSPOT_SIZE: Size of the detection sphere
 * - DETECTION_DISTANCE: How close the card needs to be to trigger
 */

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ============ ADJUSTED VARIABLES ============
export const HOTSPOT_POS: [number, number, number] = [-2.8, 2.5, 1.0];
const HOTSPOT_SIZE = 0.8;
export const DETECTION_DISTANCE = 2.0;
// ===========================================

interface CardReaderHotspotProps {
  cardPosition: THREE.Vector3 | null;
  isCardDragging: boolean;
  onCardDetected: () => void;
  isActive: boolean;
  hotspotPos?: [number, number, number];
}

const CardReaderHotspot = ({
  cardPosition,
  isCardDragging,
  onCardDetected,
  isActive,
  hotspotPos,
}: CardReaderHotspotProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isNear, setIsNear] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const hasTriggered = useRef(false);

  // Reset trigger when hotspot is disabled
  useEffect(() => {
    if (!isActive) {
      hasTriggered.current = false;
      setIsNear(false);
      setGlowIntensity(0);
    }
  }, [isActive]);

  useFrame(() => {
    if (!cardPosition || !meshRef.current || !isActive) return;

    const hotspotVec = new THREE.Vector3(...(hotspotPos ?? HOTSPOT_POS));
    const distance = cardPosition.distanceTo(hotspotVec);

    const near = distance < DETECTION_DISTANCE;
    setIsNear(near);

    // Smooth glow based on distance
    const intensity = THREE.MathUtils.clamp(
      1 - distance / DETECTION_DISTANCE,
      0,
      1
    );
    setGlowIntensity(intensity);

    // Trigger payment when card is released inside hotspot
    if (near && !isCardDragging && !hasTriggered.current) {
      hasTriggered.current = true;
      onCardDetected();
    }
  });

  if (!isActive) return null;

  return (
    <group position={hotspotPos ?? HOTSPOT_POS}>
      {/* Invisible detection sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[HOTSPOT_SIZE, 24, 24]} />
        <meshBasicMaterial
          color="hsl(47 97% 50%)"
          transparent
          opacity={isNear ? 0.25 : 0.12}
          depthWrite={false}
        />
      </mesh>

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[HOTSPOT_SIZE * 0.8, HOTSPOT_SIZE, 32]} />
        <meshBasicMaterial
          color="hsl(47 97% 50%)"
          transparent
          opacity={glowIntensity * 0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Pulsing outer ring when near */}
      {isNear && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[HOTSPOT_SIZE, HOTSPOT_SIZE * 1.6, 32]} />
          <meshBasicMaterial
            color="hsl(47 97% 50%)"
            transparent
            opacity={0.25 + Math.sin(Date.now() * 0.008) * 0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

export default CardReaderHotspot;
