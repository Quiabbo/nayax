/**
 * NAYAX KIOSK DEMO - MAIN PAGE
 * 
 * Interactive 3D kiosk demonstration with:
 * - Rotatable 3D kiosk model (OrbitControls)
 * - Simulated touchscreen with multiple states
 * - Draggable credit card
 * - NFC payment simulation
 * 
 * For adjustments, see the following files:
 * - src/components/KioskModel.tsx: MODEL_SCALE, MODEL_POSITION
 * - src/components/KioskScreen.tsx: SCREEN_POS, SCREEN_ROT, SCREEN_SIZE
 * - src/components/CreditCard.tsx: CARD_POS
 * - src/components/CardReaderHotspot.tsx: HOTSPOT_POS, DETECTION_DISTANCE
 */

import Header from "@/components/Header";
import KioskScene from "@/components/KioskScene";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      {/* Main content area with 3D scene */}
      <main className="flex-1 relative mt-16 h-[calc(100vh-4rem)]">
        <KioskScene />
      </main>
    </div>
  );
};

export default Index;
