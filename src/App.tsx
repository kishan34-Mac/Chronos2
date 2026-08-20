import { AnimatePresence } from 'framer-motion';
import { ChronosProvider, useChronos } from '@/context/ChronosContext';
import CursorDot from '@/components/CursorDot';
import GrainOverlay from '@/components/GrainOverlay';
import EntryScreen from '@/screens/EntryScreen';
import Dashboard from '@/screens/Dashboard';

function ChronosApp() {
  const { isLoaded, setUserDob } = useChronos();

  return (
    <>
      <CursorDot />
      <GrainOverlay />
      <AnimatePresence mode="wait">
        {!isLoaded ? (
          <EntryScreen key="entry" onBegin={setUserDob} />
        ) : (
          <Dashboard key="dashboard" />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ChronosProvider>
      <ChronosApp />
    </ChronosProvider>
  );
}
