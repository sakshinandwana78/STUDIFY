import { useWindowDimensions } from 'react-native';

export const useResponsiveColumns = () => {
  const { width } = useWindowDimensions();
  let columns = 2; // default for phones
  if (width >= 1200) columns = 4; // desktop / large tablet
  else if (width >= 900) columns = 3; // tablet / small desktop
  else if (width >= 640) columns = 2; // small tablet / landscape phones
  return columns;
};