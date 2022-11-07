import { NativeBaseProvider, StatusBar } from 'native-base'
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto'
import { Loading } from './src/components/Loading';

import { THEME } from './src/styles/theme';
import { Routes } from './src/routes';

export default function App() {
  const [fontsLoad] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  return (
   <NativeBaseProvider theme={THEME}>
    <StatusBar 
      barStyle='light-content'
      backgroundColor='transparent'
      translucent
    />
     {fontsLoad ? <Routes/> : <Loading/>}
   </NativeBaseProvider>
  );
}