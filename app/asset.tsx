/* eslint-disable */
import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useMedia } from '~/providers/MediaProviders';

export default function AssetPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getAssetById, syncToCloud } = useMedia();
    const asset = getAssetById(id);

    if (!asset) {
        return <Text>Asset Not Found !</Text>
    }

    return (
        <>
            <Stack.Screen options={{
                title: 'Photo',
                headerRight: () => <AntDesign onPress={() => syncToCloud(asset)} name="cloudupload" size={24} color="black" />
            }}
            />
            <Image
                source={{ uri: asset.uri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
            />

        </>
    );
}


// Sdteletds13579@


