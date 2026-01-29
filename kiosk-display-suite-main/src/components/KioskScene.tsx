import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useState, useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import KioskModel, { ModelBounds } from "./KioskModel";
import KioskScreen, { ScreenState } from "./KioskScreen";
import CreditCard from "./CreditCard";
import CardReaderHotspot from "./CardReaderHotspot";
import SceneLighting from "./SceneLighting";
import { useBeepSound } from "@/hooks/useBeepSound";

const CAMERA_FOV = 42;

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#FACA08" />
  </mesh>
);

const SceneContent = ({
  screenState,
  onStateChange,
  cardPosition,
  setCardPosition,
  isCardDragging,
  setIsCardDragging,
  onCardDetected,
}: any) => {
  const controlsRef = useRef<any>(null);
  const [layout, setLayout] = useState<any>(null);
  const { camera } = useThree();

  const handleModelLoad = useCallback(
    (bounds: ModelBounds) => {
      const maxDim = Math.max(bounds.size.x, bounds.size.y, bounds.size.z);

      /* ================= CAMERA (ABERTA E ESTÁVEL) ================= */
      const target: [number, number, number] = [
        0,
        bounds.size.y * 0.75,
        0,
      ];

      const cameraPos: [number, number, number] = [
        0,
        bounds.size.y * 0.50,
        maxDim * 2.0, // 🔥 bem mais distante (resolve o zoom)
      ];
      /* ============================================================= */

      /* ================= TELA (ALTURA CORRETA DO TOTEM) ================= */
      const screenPos: [number, number, number] = [
        -bounds.size.x * 0.18,
        bounds.size.y * 0.70, // alinhada com a tela real
        maxDim * 0.14,
      ];

      const screenSize: [number, number] = [
        bounds.size.x * 0.18,
        bounds.size.y * 0.26,
      ];
      /* ================================================================= */

      /* ================= CARTÃO (HUD – CANTO INFERIOR DIREITO) ================= */
      const cardStartPos: [number, number, number] = [
        bounds.size.x * 0.70, // bem à direita
        bounds.size.y * 0.15, // bem embaixo
        maxDim * 0.65,
      ];
      /* ========================================================================= */

      const hotspotPos: [number, number, number] = [
        bounds.size.x * 0.22,
        bounds.size.y * 0.48,
        bounds.size.z * 0.32,
      ];

      camera.position.set(...cameraPos);
      camera.lookAt(...target);

      if (controlsRef.current) {
        controlsRef.current.target.set(...target);
        controlsRef.current.update();
      }

      setLayout({
        cameraPos,
        target,
        screenPos,
        screenSize,
        cardStartPos,
        hotspotPos,
      });
    },
    [camera]
  );

  return (
    <>
      <SceneLighting />
      <Environment preset="city" />

      <KioskModel onLoad={handleModelLoad}>
        <KioskScreen
          screenState={screenState}
          onStateChange={onStateChange}
          screenPos={layout?.screenPos}
          screenSize={layout?.screenSize}
          htmlScale={0.3}
          htmlDistanceFactor={1.0}
          htmlSize={[520, 760]}
        />

        <CardReaderHotspot
          cardPosition={cardPosition}
          isCardDragging={isCardDragging}
          onCardDetected={onCardDetected}
          isActive={screenState === "payment"}
          hotspotPos={layout?.hotspotPos}
        />
      </KioskModel>

      <CreditCard
        startPosition={layout?.cardStartPos}
        onPositionChange={setCardPosition}
        isDragging={isCardDragging}
        setIsDragging={setIsCardDragging}
        dragPlaneZ={layout?.hotspotPos?.[2] ?? 0}
      />

      {/* CHÃO */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#ededed" roughness={0.85} />
      </mesh>

<OrbitControls
  ref={controlsRef}
  enablePan={false}
  enableZoom
  enableRotate
  minDistance={2.5}   // ✅ permite aproximar bem mais
  maxDistance={10}
  minPolarAngle={0.45}
  maxPolarAngle={Math.PI / 2 - 0.2}
  enabled={!isCardDragging}
/>

    </>
  );
};

const KioskScene = () => {
  const [screenState, setScreenState] = useState<ScreenState>("welcome");
  const [cardPosition, setCardPosition] = useState<THREE.Vector3 | null>(null);
  const [isCardDragging, setIsCardDragging] = useState(false);
  const { playBeep } = useBeepSound();
  const processingTimeoutRef = useRef<any>(null);

  const handleCardDetected = useCallback(() => {
    if (screenState !== "payment") return;
    playBeep();
    setScreenState("processing");

    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    processingTimeoutRef.current = setTimeout(() => {
      setScreenState("success");
    }, 1500);
  }, [screenState, playBeep]);

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <Canvas
        shadows
        camera={{
          position: [0, 3, 5],
          fov: CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
      >
        <color attach="background" args={["#ededed"]} />

        <Suspense fallback={<LoadingFallback />}>
          <SceneContent
            screenState={screenState}
            onStateChange={setScreenState}
            cardPosition={cardPosition}
            setCardPosition={setCardPosition}
            isCardDragging={isCardDragging}
            setIsCardDragging={setIsCardDragging}
            onCardDetected={handleCardDetected}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default KioskScene;