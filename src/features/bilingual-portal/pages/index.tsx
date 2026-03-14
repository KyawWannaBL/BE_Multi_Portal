import { screens } from '../config/screens';
import PortalScreen from '../components/PortalScreen';

export function BilingualPortalRoutes() {
  return (
    <>
      {screens.map((screen) => (
        <div key={screen.key} id={screen.key} style={{ marginBottom: '24px' }}>
          <PortalScreen screen={screen} />
        </div>
      ))}
    </>
  );
}
