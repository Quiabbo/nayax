/**
 * KIOSK 3D MODEL COMPONENT
 * 
 * Loads and displays the kiosk GLB model with proper scaling and positioning.
 * Calculates bounding box and centers the model automatically.
 * 
 * ADJUSTABLE VARIABLES:
 * - MODEL_SCALE: Overall scale of the kiosk model
 */

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ReactNode } from "react";

// ============ ADJUSTABLE VARIABLES ============
const MODEL_SCALE = 1.5;
// ==============================================

export interface ModelBounds {
  center: THREE.Vector3;
  size: THREE.Vector3;
  box: THREE.Box3;
}

interface KioskModelProps {
  onLoad?: (bounds: ModelBounds) => void;
  children?: ReactNode;
}

const KioskModel = ({ onLoad, children }: KioskModelProps) => {
  const { scene } = useGLTF("/models/kiosk.glb");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene && groupRef.current) {
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());

      // Center the model in world (requested: subtract center)
      scene.position.sub(center);

      // Put the model "on the floor" (y=0)
      const centeredBox = new THREE.Box3().setFromObject(scene);
      scene.position.y -= centeredBox.min.y;
      
      // Apply materials for better look
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Enhance metallic look
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = 1;
            child.material.needsUpdate = true;
          }
        }
      });

      // Recalculate bounds after centering
      const newBox = new THREE.Box3().setFromObject(groupRef.current);
      const newCenter = newBox.getCenter(new THREE.Vector3());
      const newSize = newBox.getSize(new THREE.Vector3());

      if (onLoad) {
        onLoad({ center: newCenter, size: newSize, box: newBox });
      }
    }
  }, [scene, onLoad]);

  return (
    <group ref={groupRef} scale={MODEL_SCALE}>
      <primitive object={scene} />
      {children}
    </group>
  );
};

// Preload the model
useGLTF.preload("/models/kiosk.glb");

export default KioskModel;
