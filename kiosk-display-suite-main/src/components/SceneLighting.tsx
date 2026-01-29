/**
 * SCENE LIGHTING COMPONENT
 * 
 * Sets up ambient and directional lighting for the 3D scene.
 */

const SceneLighting = () => {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.6} />
      
      {/* Main directional light (sun-like) */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light from the opposite side */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.4}
      />
      
      {/* Accent light from below for dramatic effect */}
      <pointLight
        position={[0, -2, 2]}
        intensity={0.3}
        color="hsl(47 97% 50%)"
      />
    </>
  );
};

export default SceneLighting;
