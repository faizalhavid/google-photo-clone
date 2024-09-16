/* eslint-disable */
import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useMedia } from '~/providers/MediaProviders';
import { getImagekitUrlFromPath } from 'utils/imageKit'
import { useAuth } from '~/providers/AuthProvider';
import { ResizeMode, Video } from 'expo-av';



export default function AssetPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getAssetById, syncToCloud } = useMedia();
    const asset = getAssetById(id);

    if (!asset) {
        return <Text>Asset Not Found !</Text>
    }
    let uri: string;

    if (asset.isLocalAsset) {
        uri = asset.uri;
    } else {
        uri = getImagekitUrlFromPath(asset.path, []);
    }

    return (
        <>
            <Stack.Screen options={{
                title: 'Photo',
                headerRight: () => <AntDesign onPress={() => syncToCloud(asset)} name="cloudupload" size={24} color="black" />
            }}
            />
            {asset.mediaType === 'photo' ? <Image
                source={{ uri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
            /> :
                <Video
                    style={{ width: '100%', height: '100%' }}
                    source={{ uri }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                // onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                />
            }
        </>
    );
}


// Sdteletds13579@


