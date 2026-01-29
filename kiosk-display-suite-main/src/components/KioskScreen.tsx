import { Html } from "@react-three/drei";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

export const SCREEN_POS: [number, number, number] = [0, 2.8, 0.52];
export const SCREEN_ROT: [number, number, number] = [0, 0, 0];
export const SCREEN_SIZE: [number, number] = [1.6, 2.4];
export const HTML_SCALE = 1.9;
export const HTML_DISTANCE_FACTOR = 1.8;
export const HTML_SIZE: [number, number] = [520, 760];

export type ScreenState =
  | "welcome"
  | "options"
  | "payment"
  | "processing"
  | "success";

interface KioskScreenProps {
  screenState: ScreenState;
  onStateChange: (state: ScreenState) => void;
  screenPos?: [number, number, number];
  screenRot?: [number, number, number];
  screenSize?: [number, number];
  htmlScale?: number;
  htmlDistanceFactor?: number;
  htmlSize?: [number, number];
}

const KioskScreen = ({
  screenState,
  onStateChange,
  screenPos,
  screenRot,
  htmlScale,
  htmlDistanceFactor,
  htmlSize,
}: KioskScreenProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleStart = useCallback(() => onStateChange("options"), [onStateChange]);
  const handlePayment = useCallback(() => onStateChange("payment"), [onStateChange]);
  const handleBack = useCallback(() => onStateChange("welcome"), [onStateChange]);

  const renderContent = () => {
    switch (screenState) {
      case "welcome":
        return (
          <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
            <div className="text-4xl font-extrabold text-center">
              Toque para iniciar
            </div>
            <Button onClick={handleStart} size="lg" className="px-12 py-7 text-2xl rounded-xl">
              Iniciar
            </Button>
          </div>
        );

      case "options":
        return (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <div className="text-3xl font-extrabold text-center mb-4">
              Escolha uma opção
            </div>
            <Button onClick={handlePayment} size="lg" className="w-full py-7 text-2xl rounded-xl">
              💳 Pagamento
            </Button>
            <Button onClick={handleBack} size="lg" variant="secondary" className="w-full py-7 text-2xl rounded-xl">
              ← Voltar
            </Button>
          </div>
        );

      case "payment":
        return (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <div className="text-7xl mb-4">💳</div>
            <div className="text-3xl font-extrabold text-center">
              Aproxime o cartão no leitor
            </div>
            <div className="text-lg text-center text-muted-foreground mt-4">
              Arraste o cartão roxo até o leitor
            </div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mt-6" />
          </div>
        );

      case "processing":
        return (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-3xl font-extrabold text-center">
              Processando...
            </div>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <div className="text-8xl">✅</div>
            <div className="text-3xl font-extrabold text-center">
              Pagamento aprovado!
            </div>
            <Button onClick={handleBack} size="lg" className="mt-4 px-10 py-7 text-2xl rounded-xl">
              Voltar ao início
            </Button>
          </div>
        );
    }
  };

  return (
    <group position={screenPos ?? SCREEN_POS} rotation={screenRot ?? SCREEN_ROT}>
      <Html
        transform
        center
        distanceFactor={htmlDistanceFactor ?? HTML_DISTANCE_FACTOR}
        scale={htmlScale ?? HTML_SCALE}
        position={[0, 0, 0.01]} // 🔑 POSIÇÃO RESTAURADA
        className="select-none"
        style={{
          width: `${(htmlSize ?? HTML_SIZE)[0]}px`,
          height: `${(htmlSize ?? HTML_SIZE)[1]}px`,
          pointerEvents: "auto",
        }}
      >
        <div
          className="w-full h-full rounded-2xl overflow-hidden"
          style={{
            background: "#e6e6e6",
            boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
            cursor: isHovered ? "pointer" : "default",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {renderContent()}
        </div>
      </Html>
    </group>
  );
};

export default KioskScreen;
