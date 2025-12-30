import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import { EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Navbar from './components/Navbar';
import ScrollyExperience from './components/ScrollyExperience';
// import { VideoBackground, VideoBackgroundController } from './components/VideoBackground';
import HeroSection, { HeroAnimationController } from './sections/HeroSection';
import ProblemSection from './sections/ProblemSection';
import SolutionSection from './sections/SolutionSection';
import ImpactSection from './sections/ImpactSection';
import GrowthSection from './sections/GrowthSection';
import CTASection from './sections/CTASection';

/**
 * HHeuristics - Extreme Quality Scrollytelling
 * 
 * Now uses Veo3-generated video background synced to scroll.
 * Video plays forward/backward as user scrolls.
 */
function App() {
  return (
    <>
      <Navbar />

      {/* NEW: 60FPS Video-to-Canvas Scrollytelling Experience */}
      <ScrollyExperience />

      {/* 
        LEGACY R3F SETUP - Commented out for now
        <VideoBackground />
        <div style={{...}}>
          <Canvas ...>
            ...
          </Canvas>
        </div>
      */}
    </>
  );
}

export default App;
