import { AntDesign } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { FlatList, Image, Pressable, Text } from 'react-native';
import { Container } from '~/components/Container';
import { useAuth } from '~/providers/AuthProvider';

import { useMedia } from '~/providers/MediaProviders';
import { getImagekitUrlFromPath } from '~/utils/imageKit';

export default function Home() {
  const { assets, loadLocalAssets } = useMedia();

  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />
      <Container>

        <FlatList
          data={assets}
          numColumns={4}
          contentContainerClassName="gap-[2px]"
          columnWrapperClassName="gap-[2px]"
          // infinite scroll load data
          onEndReached={loadLocalAssets}
          onEndReachedThreshold={0.2}
          renderItem={({ item }) => (
            <Link href={`/asset?id=${item.id}`} asChild>
              <Pressable style={{ width: '25%' }}>
                <Image source={{ uri: item.isLocalAsset ? item.uri : getImagekitUrlFromPath(`${item.path}`, []) }} style={{ width: '100%', aspectRatio: 1 }} />
                {
                  !item.isBackedUp && item.isLocalAsset && (
                    <AntDesign name="cloudupload" size={18} color="white" className='right-1 bottom-1 absolute' />
                  )
                }
              </Pressable>
            </Link>
          )}
        />
      </Container>
    </>
  );
}
