/* eslint-disable */
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { decode } from 'base64-arraybuffer';
import { supabase } from '~/utils/supabase';
import { useAuth } from './AuthProvider';
import mime from 'mime';

type MediaContextType = {
    assets: MediaLibrary.Asset[];
    loadLocalAssets: () => void;
    getAssetById: (id: string) => MediaLibrary.Asset | undefined;
    syncToCloud: (asset: MediaLibrary.Asset) => void;
}

const MediaContext = createContext<MediaContextType>({
    assets: [],
    loadLocalAssets: () => { },
    getAssetById: () => undefined,
    syncToCloud: () => { }
});

export function MediaContextProvider({ children }: PropsWithChildren) {
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

    const [hasNextPage, setHasNextPage] = useState(true);
    const [endCursor, setEndCursor] = useState<string>();
    const [loading, setLoading] = useState(false);

    const [localAssets, setLocalAssets] = useState<MediaLibrary.Asset[]>([]);
    const [remoteAssets, setRemoteAssets] = useState([]);

    const assets = [
        ...remoteAssets,
        ...localAssets.filter((assets => !assets.isBackedUp))
    ]

    const { user } = useAuth();

    useEffect(() => { loadRemoteAssets() }, [])

    useEffect(() => {
        if (permissionResponse?.status !== 'granted') {
            requestPermission();
        }
    }, []);

    useEffect(() => {
        if (permissionResponse?.status === 'granted') {
            loadLocalAssets();
        }
    }, [permissionResponse]);

    const loadRemoteAssets = async () => {
        const { data, error } = await supabase.from('assets').select('*');
        console.log(data, 'remote');
        setRemoteAssets(data)
    }

    const loadLocalAssets = async () => {
        if (loading || !hasNextPage) {
            return;
        }
        setLoading(true);
        const assetsPage = await MediaLibrary.getAssetsAsync({ after: endCursor });

        const newAssets = await Promise.all(

            assetsPage.assets.map(async (asset) => {
                // check if asset is already back up
                const { count } = await supabase
                    .from('assets')
                    .select('*', { count: 'exact', head: true })
                    .eq('id', asset.id)
                return {
                    ...asset,
                    isBackedUp: !!count && count > 0,
                    isLocalAsset: true,
                }
            })
        );

        console.log(JSON.stringify(newAssets, null, 2))


        setLocalAssets((existingItems) => [...existingItems, ...newAssets]);

        setHasNextPage(assetsPage.hasNextPage);
        setEndCursor(assetsPage.endCursor);
        setLoading(false);
    };

    const getAssetById = (id: string): MediaLibrary.Asset | undefined => {
        return assets.find(asset => asset.id === id);
    };

    const syncToCloud = async (asset: MediaLibrary.Asset) => {
        // upload to supabase storage

        const info = await MediaLibrary.getAssetInfoAsync(asset)
        if (!info.localUri || !user) {
            return;
        }
        const base64String = await FileSystem.readAsStringAsync(info.localUri, { encoding: 'base64' });
        const arrayBuffer = decode(base64String);

        const { data: storageFile, error: uploadError } = await supabase.storage.from('assets').upload(`${user?.id}/${asset.filename}`, arrayBuffer, {
            contentType: mime.getType(asset.filename) ?? 'image/jpg',
            upsert: true,
        });
        if (storageFile) {
            const { data, error } = await supabase.from('assets').upsert({
                id: asset.id,
                path: storageFile?.path,
                user_id: user.id,
                mediaType: asset.mediaType,
                object_id: storageFile?.id,
            }).select()
                .single();
        }
    };

    return (
        <MediaContext.Provider value={{ assets: assets, loadLocalAssets, getAssetById, syncToCloud }}>
            {children}
        </MediaContext.Provider>
    );
}

export const useMedia = () => useContext(MediaContext);