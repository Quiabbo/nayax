/**
 * CARD READER HOTSPOT COMPONENT (AUTO-DETECTION + DEBUG)
 *
 * Invisible detection zone near the kiosk's card reader.
 * When the credit card *approaches* this zone, it triggers payment.
 * Press "D" to toggle debug visibility.
 */

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ======= PERFECTLY ALIGNED WITH SCREEN =======
export const HOTSPOT_POS: [number, number, number] = [-3.6, 4.1, 0.75]; // 🔥 Mais pra esquerda e pra cima
const HOTSPOT_SIZE = 0.5;
export const DETECTION_DISTANCE = 0.9;
// ============================================

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
  const hasTriggered = useRef(false);
  const [debug, setDebug] = useState(false);

  // Toggle modo debug com tecla D
  useEffect(() => {
    const toggleDebug = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d") setDebug((prev) => !prev);
    };
    window.addEventListener("keydown", toggleDebug);
    return () => window.removeEventListener("keydown", toggleDebug);
  }, []);

  // Reset do trigger quando o hotspot é desativado
  useEffect(() => {
    if (!isActive) hasTriggered.current = false;
  }, [isActive]);

  // Loop principal: detecção automática de proximidade
  useFrame(() => {
    if (!cardPosition || !isActive) return;

    const hotspotVec = new THREE.Vector3(...(hotspotPos ?? HOTSPOT_POS));
    const distance = cardPosition.distanceTo(hotspotVec);

    // 🔥 Agora detecta APENAS pela aproximação — sem precisar soltar
    if (distance < DETECTION_DISTANCE && !hasTriggered.current) {
      hasTriggered.current = true;
      onCardDetected();
    }

    // Atualiza posição do debug sphere
    if (meshRef.current) meshRef.current.position.copy(hotspotVec);
  });

  if (!isActive) return null;

  return (
    <group>
      {debug && (
        <mesh ref={meshRef}>
          <sphereGeometry args={[HOTSPOT_SIZE, 32, 32]} />
          <meshBasicMaterial
            color="yellow"
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

export default CardReaderHotspot;
