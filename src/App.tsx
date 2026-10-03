import React, { useEffect } from 'react';
import { CricketProvider, useCricket } from './context/CricketContext';
import { ViewerDashboard } from './components/viewer/ViewerDashboard';
import { AdminControlRoom } from './components/admin/AdminControlRoom';
import { TvDisplayMode } from './components/tv/TvDisplayMode';
import { MobileCameraBroadcaster } from './components/camera/MobileCameraBroadcaster';

const AppContent: React.FC = () => {
  const { viewMode, setViewMode, broadcasterCameraId, setBroadcasterCameraId } = useCricket();

  // Listen to browser hash or pathname for deep-linking:
  // e.g. /admin/control-room, #tv, or #camera/cam-2
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const path = window.location.pathname || '';
        const hash = window.location.hash || '';

        if (path.includes('admin') || hash.includes('admin') || hash.includes('control-room')) {
          setViewMode('ADMIN');
        } else if (path.includes('tv') || hash.includes('tv')) {
          setViewMode('TV');
        } else if (path.includes('camera') || hash.includes('camera')) {
          // extract camera id if specified (e.g. cam-1, cam-2, etc)
          const match = (path + hash).match(/cam-[1-6]/i);
          if (match) {
            setBroadcasterCameraId(match[0].toLowerCase());
          }
          setViewMode('CAMERA');
        }
      } catch {
        // Fallback for sandboxed frames
      }
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [setViewMode, setBroadcasterCameraId]);

  // Sync back to hash when viewMode changes
  useEffect(() => {
    try {
      if (viewMode === 'ADMIN') {
        window.location.hash = 'admin/control-room';
      } else if (viewMode === 'TV') {
        window.location.hash = 'tv';
      } else if (viewMode === 'CAMERA') {
        window.location.hash = `camera/${broadcasterCameraId}`;
      } else {
        if (
          window.location.hash.includes('admin') ||
          window.location.hash.includes('tv') ||
          window.location.hash.includes('camera')
        ) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    } catch {
      // In sandboxed iframes or cross-origin environments, window.location/history modification can throw
    }
  }, [viewMode, broadcasterCameraId]);

  if (viewMode === 'ADMIN') {
    return <AdminControlRoom />;
  }

  if (viewMode === 'TV') {
    return <TvDisplayMode onExit={() => setViewMode('VIEWER')} />;
  }

  if (viewMode === 'CAMERA') {
    return (
      <MobileCameraBroadcaster
        initialCameraId={broadcasterCameraId}
        onExit={() => setViewMode('VIEWER')}
      />
    );
  }

  return <ViewerDashboard />;
};

export default function App() {
  return (
    <CricketProvider>
      <AppContent />
    </CricketProvider>
  );
}
