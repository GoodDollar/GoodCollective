export { useNavigate } from './routing';
import { useNavigate } from 'react-router-native';

const useCrossNavigate = () => {
  return {
    navigate: useNavigate(),
  };
};

export default useCrossNavigate;
