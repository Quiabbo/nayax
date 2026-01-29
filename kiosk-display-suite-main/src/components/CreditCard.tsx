import { useEffect, useMemo, useRef, useState } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CreditCardProps {
  startPosition?: [number, number, number];
  onPositionChange: (position: THREE.Vector3) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  dragPlaneZ?: number;
}

const CreditCard = ({
  startPosition,
  onPositionChange,
  isDragging,
  setIsDragging,
  dragPlaneZ = 0,
}: CreditCardProps) => {
  const { camera, gl } = useThree();

  const CARD_W = 220;
  const CARD_H = 140;
  const MARGIN = 28;

  // ================= HUD POSITION =================
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ================= GHOST 3D =================
  const ghostRef = useRef<THREE.Group>(null);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), -dragPlaneZ),
    [dragPlaneZ]
  );
  const tmpV3 = useMemo(() => new THREE.Vector3(), []);

  // ======= POSIÇÃO INICIAL: CANTO INFERIOR DIREITO =======
  useEffect(() => {
    const rect = gl.domElement.getBoundingClientRect();

    const x = rect.width - CARD_W - MARGIN;
    const y = rect.height - CARD_H - MARGIN - 350; // 🔼 sobe o cartão

    setPos({ x, y });
  }, [gl.domElement]);
  // =====================================================

  // posiciona ghost no startPosition (estado inicial)
  useEffect(() => {
    if (!ghostRef.current || !startPosition) return;
    ghostRef.current.position.set(...startPosition);
    onPositionChange(ghostRef.current.position.clone());
  }, [startPosition]); // eslint-disable-line

  const setGhostFromClientXY = (clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

    raycaster.setFromCamera({ x, y }, camera);
    const hit = raycaster.ray.intersectPlane(plane, tmpV3);

    if (hit && ghostRef.current) {
      ghostRef.current.position.copy(tmpV3);
      onPositionChange(ghostRef.current.position.clone());
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    setGhostFromClientXY(e.clientX, e.clientY);
  };

  const onPointerMoveWindow = (e: PointerEvent) => {
    if (!isDragging) return;

    const x = e.clientX - dragOffset.current.x;
    const y = e.clientY - dragOffset.current.y;

    setPos({ x, y });
    setGhostFromClientXY(e.clientX, e.clientY);
  };

  const onPointerUpWindow = () => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener("pointermove", onPointerMoveWindow);
    window.addEventListener("pointerup", onPointerUpWindow);

    return () => {
      window.removeEventListener("pointermove", onPointerMoveWindow);
      window.removeEventListener("pointerup", onPointerUpWindow);
    };
  }, [isDragging]); // eslint-disable-line

  useEffect(() => {
    gl.domElement.style.cursor = isDragging ? "grabbing" : "auto";
    return () => {
      gl.domElement.style.cursor = "auto";
    };
  }, [isDragging, gl.domElement]);

  return (
    <>
      {/* Ghost 3D invisível (para detectar aproximação) */}
      <group ref={ghostRef}>
        <RoundedBox
          args={[0.85, 0.54, 0.02]}
          radius={0.06}
          smoothness={6}
          visible={false}
        />
      </group>

      {/* CARD HUD — sempre acima da tela */}
      <Html
        fullscreen
        zIndexRange={[200, 100]} // 🔥 Garante que o cartão fique acima de todos os Html do Drei
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${CARD_W}px`,
            height: `${CARD_H}px`,
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, #6B2CF5 0%, #7A21D6 55%, #5B1FB8 100%)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.25)",
            transform: isDragging ? "scale(1.02)" : "scale(1)",
            transition: "transform 120ms ease",
            pointerEvents: "auto",
            userSelect: "none",
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            color: "white",
          }}
          onPointerDown={onPointerDown}
        >
          <div
            style={{
              padding: 14,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: 44,
                height: 32,
                borderRadius: 10,
                background: "#FACA08",
              }}
            />

            <div style={{ fontSize: 14, letterSpacing: 2 }}>
              •••• •••• •••• 4242
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <div style={{ fontSize: 10, opacity: 0.65 }}>TITULAR</div>
                <div style={{ fontSize: 14 }}>GREG DOMINGUES</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, opacity: 0.65 }}>VALIDADE</div>
                <div style={{ fontSize: 14 }}>12/28</div>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </>
  );
};

export default CreditCard;
