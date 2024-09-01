import { Link, Stack } from 'expo-router';
import { FlatList, Image, Pressable } from 'react-native';

import { useMedia } from '~/providers/MediaProviders';

export default function Home() {
  const { assets, loadLocalAssets } = useMedia();
  return (
    <>
      <Stack.Screen options={{ title: 'Photos' }} />

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
              <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: 1 }} />
            </Pressable>
          </Link>
        )}
      />
    </>
  );
}
