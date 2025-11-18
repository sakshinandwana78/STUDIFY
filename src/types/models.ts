
import { Asset } from 'expo-asset';

/**
 * Interface for 3D model assets
 */
export interface Model3D {
  id: string;
  name: string;
  /** Asset resolved via Asset.fromModule(require('...glb')) */
  modelPath: Asset;
  /** Prefer this for Viro3DObject local GLB: require('...glb') */
  sourceModule?: number;
  /** Optional external texture resources for GLB (if any) */
  resources?: any[];
  thumbnailPath?: Asset;
  defaultScale: [number, number, number];
  defaultPosition: [number, number, number];
  defaultRotation: [number, number, number];
  /** Desired initial placement distance from camera in meters */
  defaultPlacementMeters?: number;
}

/**
 * Interface for AR scene state
 */
export interface ARSceneState {
  isTracking: boolean;
  planeDetected: boolean;
  anchorFound: boolean;
}

/**
 * Props for the AR Scene component
 */
export interface ARSceneProps {
  model?: Model3D;
  onClose: () => void;
  onShowModelPicker: () => void;
  onAnchorFound?: () => void;
  onTrackingUpdated?: (state: ARSceneState) => void;
  onError?: (error: string) => void;
}

/**
 * Props for the Model Picker Modal component
 */
export interface ModelPickerModalProps {
  isVisible: boolean;
  models: Model3D[];
  onSelectModel: (model: Model3D) => void;
  onClose: () => void;
}

// import { Asset } from 'expo-asset';

// /**
//  * Interface for 3D model assets
//  */
// export interface Model3D {
//   id: string;
//   name: string;
//   /** File format for Viro3DObject: GLB or GLTF */
//   format?: 'GLB' | 'GLTF';
//   /** Asset resolved via Asset.fromModule(require('...glb')) */
//   modelPath: Asset;
//   /** Prefer this for Viro3DObject local GLB: require('...glb') */
//   sourceModule?: number;
//   /** Optional external texture resources for GLB (if any) */
//   resources?: any[];
//   thumbnailPath?: Asset;
//   defaultScale: [number, number, number];
//   defaultPosition: [number, number, number];
//   defaultRotation: [number, number, number];
// }

// /**
//  * Interface for AR scene state
//  */
// export interface ARSceneState {
//   isTracking: boolean;
//   planeDetected: boolean;
//   anchorFound: boolean;
// }

// /**
//  * Props for the AR Scene component
//  */
// export interface ARSceneProps {
//   model?: Model3D;
//   onClose: () => void;
//   onShowModelPicker: () => void;
//   onAnchorFound?: () => void;
//   onTrackingUpdated?: (state: ARSceneState) => void;
//   onError?: (error: string) => void;
// }

// /**
//  * Props for the Model Picker Modal component
//  */
// export interface ModelPickerModalProps {
//   isVisible: boolean;
//   models: Model3D[];
//   onSelectModel: (model: Model3D) => void;
//   onClose: () => void;
// }