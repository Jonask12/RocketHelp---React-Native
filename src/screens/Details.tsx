import { VStack, Text, HStack, useTheme, ScrollView } from 'native-base';
import { Header } from '../components/Header';
import { Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

import { useEffect, useState } from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';
import { OrderProps } from '../components/Order';
import { OrderFirestoreDTO } from '../../DTOs/OrderFireStoreDTO';
import { dateFormat } from '../../utils/firestoreDateFormat';
import { Loading } from '../components/Loading';
import { CircleWavyCheck, Hourglass, DesktopTower,  ClipboardText } from 'phosphor-react-native';
import { CardDetails } from '../components/CardDetails';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

type RouteParams = {
  orderId: string;
}

type OrderDetails = OrderProps & {
  description: string;
  solution: string;
  closed: string;
}

export function Details() {
  const [solution, setSolution] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails);

  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as RouteParams;

  const { colors } = useTheme();

  function handleOrderClose() {
    if (!solution) {
      return Alert.alert('Solicitação', 'Informe a solução para encerrar a solicitação')
    }

    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .update({
      status: 'closed',
      solution,
      closed_at: firestore.FieldValue.serverTimestamp()
    })

    .then(() => {
      Alert.alert('Solictação', 'Solicitação encerrada.');
      navigation.goBack()
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('Solictação', 'Não foi possível encerrar a solicitação.');
    })
  }

  useEffect(() => {
    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc()
    .get()
    .then((doc) => {
      const { patrimony, description, status, created_at, closed_at, solution} = doc.data();

      const closed = closed_at ? dateFormat(closed_at) : null;

      setOrder({
        id: doc.id,
        patrimony,
        description,
        status,
        solution,
        when: dateFormat(created_at),
        closed
      });
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <VStack flex={1} bg="gray.700">
      <Header title="Solicitação"/>
     <HStack>
      {
        order.status === 'closed'
        ? <CircleWavyCheck size={22} color={colors.green[300]} />
        : <Hourglass size={22} color={colors.secondary[700]} />
      }

      <Text
        fontSize="sm"
        color={order.status === 'closed' ? colors.green[300] : colors.secondary[700]}
        ml={2}
        textTransform="uppercase"
      >
        {order.status === 'closed' ? 'finalizado' : 'em andamento'}
      </Text>
     </HStack>

     <ScrollView mx={5} showsVerticalScrollIndicator={false}>
      <CardDetails
        title="equipamento"
        description={`Patrimônio ${order.patrimony}`}
        icon={DesktopTower}
       />

      <CardDetails
        title="descriçaõ do problema"
        description={order.description}
        icon={ClipboardText}
        footer={`Registrado em ${order.when}`}
       />

      <CardDetails
        title="solução"
        icon={CircleWavyCheck}
        description={order.solution}
        footer={order.closed && `Encerrado em ${order.closed}`}
       >
      {
        order.status === 'open' &&
        <Input
          placeholder="Descriçaõ da solução"
          onChangeText={setSolution}
          h={24}
          textAlignVertical="top"
          multiline
        />
      }
      </CardDetails>
     </ScrollView>

     {
      order.status === 'open' &&
      <Button
        title="Encerrar solicitação"
        mt={5}
        onPress={handleOrderClose}
      />
     }
    </VStack>
  );
}