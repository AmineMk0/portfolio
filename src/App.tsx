import { MotionConfig } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MiniGame } from './components/MiniGame';
import { Projects } from './components/Projects';
import { SystemLog } from './components/SystemLog';
import { TechStack } from './components/TechStack';
import { Footer } from './components/Footer';
import { DeveloperLab } from './components/DeveloperLab';

export default function App() {
  return <MotionConfig reducedMotion="user"><div className="site-shell" id="home">
    <Navbar />
    <main><Hero /><MiniGame /><Projects /><DeveloperLab /><div className="system-panel"><SystemLog /><TechStack /></div></main>
    <Footer />
  </div></MotionConfig>;
}

