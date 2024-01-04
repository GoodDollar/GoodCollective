import { useMobileNavigate } from './routing.native';
import { useWebNavigate } from './routing.web';
import { Platform } from 'react-native';

const useCrossNavigate = () => {
  const web = useWebNavigate();
  const mobile = useMobileNavigate();
  return {
    navigate: Platform.OS === 'web' ? web : mobile,
  };
};

export default useCrossNavigate;
