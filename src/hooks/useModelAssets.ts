
import { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';
import { Model3D } from '../types/models';

/**
 * Hook to load and manage 3D model assets from the assets/models directory
 * @returns Object containing models array and loading state
 */
const useModelAssets = () => {
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);

        // Resolve local GLB assets via require + Asset.fromModule
        const volcanoRequire = require('../../assets/models/free__volcano_low_poly.glb');
        const heartRequire = require('../../assets/models/human_heart_3d_model.glb');
        const orreryRequire = require('../../assets/models/solar_system_model_orrery.glb');
        const sunRequire = require('../../assets/models/sun.glb');
        const moonRequire = require('../../assets/models/the_moon (1).glb');

        const volcanoAsset = Asset.fromModule(volcanoRequire);
        const heartAsset = Asset.fromModule(heartRequire);
        const orreryAsset = Asset.fromModule(orreryRequire);
        const sunAsset = Asset.fromModule(sunRequire);
        const moonAsset = Asset.fromModule(moonRequire);

        // Ensure local assets have a stable localUri by preloading them.
        // This avoids cases where Viro cannot load HTTP asset URLs during dev.
        console.log('[Assets] Preloading GLB assets...');
        await Asset.loadAsync([
          volcanoRequire,
          heartRequire,
          orreryRequire,
          sunRequire,
          moonRequire,
        ]);
        console.log('[Assets] Preload complete');

        const modelsList: Model3D[] = [
          {
            id: 'volcano',
            name: 'Volcano (Low Poly)',
            modelPath: volcanoAsset,
            sourceModule: volcanoRequire,
            defaultScale: [0.25, 0.25, 0.25],
            defaultPosition: [0, 0, -1],
            defaultRotation: [0, 0, 0],
            defaultPlacementMeters: 1.2,
            footprintMeters: 0.6,
            // Helps keep the base flush on horizontal planes if pivot is centered
            baseYOffsetMeters: -0.03,
          },
          {
            id: 'heart',
            name: 'Human Heart',
            modelPath: heartAsset,
            sourceModule: heartRequire,
            defaultScale: [0.12, 0.12, 0.12],
            defaultPosition: [0, 0, -1],
            defaultRotation: [0, 0, 0],
            defaultPlacementMeters: 0.8,
            footprintMeters: 0.25,
            baseYOffsetMeters: -0.02,
          },
          {
            id: 'orrery',
            name: 'Solar System Orrery',
            modelPath: orreryAsset,
            sourceModule: orreryRequire,
            defaultScale: [0.05, 0.05, 0.05],
            defaultPosition: [0, 0, -1],
            defaultRotation: [0, 0, 0],
            defaultPlacementMeters: 1.9,
            footprintMeters: 1.0,
          },
          {
            id: 'sun',
            name: 'Sun',
            modelPath: sunAsset,
            sourceModule: sunRequire,
            defaultScale: [0.1, 0.1, 0.1],
            defaultPosition: [0, 0, -1],
            defaultRotation: [0, 0, 0],
            defaultPlacementMeters: 1.8,
            footprintMeters: 0.5,
          },
          {
            id: 'moon',
            name: 'Moon',
            modelPath: moonAsset,
            sourceModule: moonRequire,
            defaultScale: [0.18, 0.18, 0.18],
            defaultPosition: [0, 0, -1],
            defaultRotation: [0, 0, 0],
            defaultPlacementMeters: 1.0,
            footprintMeters: 0.5,
          },
        ];

        // Load the app icon for thumbnails
        const iconAsset = Asset.fromModule(require('../../assets/icon.png'));
        
        // Generate thumbnails using the loaded icon asset
        const modelsWithThumbnails = modelsList.map(model => ({
          ...model,
          thumbnailPath: iconAsset, // Using app icon as placeholder thumbnail
        }));

        setModels(modelsWithThumbnails);
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Swallow AbortError commonly thrown during dev refreshes; assets are local and still usable.
        if (message.toLowerCase().includes('aborted')) {
          setError(null);
          setLoading(false);
          return;
        }
        setError(err instanceof Error ? err : new Error('Failed to load models'));
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  return { models, loading, error };
};

export default useModelAssets;
// import { useState, useEffect } from 'react';
// import { Asset } from 'expo-asset';
// import { Model3D } from '../types/models';

// /**
//  * Hook to load and manage 3D model assets from the assets/models directory
//  * @returns Object containing models array and loading state
//  */
// const useModelAssets = () => {
//   const [models, setModels] = useState<Model3D[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     const loadModels = async () => {
//       try {
//         setLoading(true);

//         // Resolve local 3D assets via require + Asset.fromModule
//         const volcanoRequire = require('../../assets/models/free__volcano_low_poly.glb');
//         const heartRequire = require('../../assets/models/human_heart_3d_model.glb');
//         const volcanoAsset = Asset.fromModule(volcanoRequire);
//         const heartAsset = Asset.fromModule(heartRequire);

//         const modelsList: Model3D[] = [
//           {
//             id: 'volcano',
//             name: 'Volcano (Low Poly)',
//             modelPath: volcanoAsset,
//             sourceModule: volcanoRequire,
//             defaultScale: [0.3, 0.3, 0.3],
//             defaultPosition: [0, 0, -0.5],
//             defaultRotation: [0, 0, 0],
//           },
//           {
//             id: 'heart',
//             name: 'Human Heart',
//             modelPath: heartAsset,
//             sourceModule: heartRequire,
//             defaultScale: [0.3, 0.3, 0.3],
//             defaultPosition: [0, 0, -0.5],
//             defaultRotation: [0, 0, 0],
//           },
//         ];

//         // Load the app icon for thumbnails
//         const iconAsset = Asset.fromModule(require('../../assets/icon.png'));
        
//         // Generate thumbnails using the loaded icon asset
//         const modelsWithThumbnails = modelsList.map(model => ({
//           ...model,
//           thumbnailPath: iconAsset, // Using app icon as placeholder thumbnail
//         }));

//         setModels(modelsWithThumbnails);
//         setLoading(false);
//       } catch (err) {
//         const message = err instanceof Error ? err.message : String(err);
//         // Swallow AbortError commonly thrown during dev refreshes; assets are local and still usable.
//         if (message.toLowerCase().includes('aborted')) {
//           setError(null);
//           setLoading(false);
//           return;
//         }
//         setError(err instanceof Error ? err : new Error('Failed to load models'));
//         setLoading(false);
//       }
//     };

//     loadModels();
//   }, []);

//   return { models, loading, error };
// };

// export default useModelAssets;
