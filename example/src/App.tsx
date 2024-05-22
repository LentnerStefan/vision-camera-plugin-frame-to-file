import {
  StyleSheet,
  View,
  Switch,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
} from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import React, { useEffect, useState } from 'react';
import { useClearTmpFiles } from './useClearTmpFiles';
import { useFrameToFileProcessor } from './useFrameToFileProcessor';
import { useResizedFrameToFileProcessor } from './useResizedFrameToFileProcessor';
import { useCroppedFrameToFileProcessor } from './useCroppedFrameToFileProcessor';
import { useAppState } from '@react-native-community/hooks';

const { height } = Dimensions.get('window');

export default function App() {
  const appState = useAppState();
  const permission = useCameraPermission();

  useEffect(() => {
    permission.requestPermission();
  }, [permission]);

  // Vision camera hooks
  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    {
      videoResolution: 'max',
    },
    { fps: 'max' },
  ]);

  // Custom hook to clear tmp files
  const isClearingFiles = useClearTmpFiles();

  // The path of the saved file
  const [path, setPath] = useState<string | null>(null);

  const updatePathFromFrameProcessor = useRunOnJS((newPath: string) => {
    setPath(newPath);
  }, []);

  const [mode, setMode] = useState<'full' | 'resize' | 'crop'>('full');

  const frameToFileProcessor = useFrameToFileProcessor(
    updatePathFromFrameProcessor
  );

  const resizedFrameProcessor = useResizedFrameToFileProcessor(
    updatePathFromFrameProcessor
  );

  const croppedFrameProcessor = useCroppedFrameToFileProcessor(
    updatePathFromFrameProcessor
  );

  const frameProcessor =
    mode === 'full'
      ? frameToFileProcessor
      : mode === 'resize'
        ? resizedFrameProcessor
        : croppedFrameProcessor;

  return (
    <View style={StyleSheet.absoluteFill}>
      {permission.hasPermission && !!device && !!format && (
        <Camera
          style={styles.camera}
          enableFpsGraph
          isActive={!isClearingFiles && appState === 'active'}
          device={device}
          format={format}
          frameProcessor={frameProcessor}
          resizeMode="contain"
        />
      )}
      <View style={styles.filePreviewContainer}>
        {path !== null && (
          <Image
            source={{ uri: `file://${path}` }}
            style={styles.filePreview}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.toggleContainer}>
        <View style={styles.toggleWithLabel}>
          <Text style={styles.toggleLabel}>Full frame</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setMode('full')}
            value={mode === 'full'}
          />
        </View>
        <View style={styles.toggleWithLabel}>
          <Text style={styles.toggleLabel}>Resize frame</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setMode('resize')}
            value={mode === 'resize'}
          />
        </View>
        <View style={styles.toggleWithLabel}>
          <Text style={styles.toggleLabel}>Crop frame</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setMode('crop')}
            value={mode === 'crop'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    backgroundColor: 'black',
  },
  toggleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 96,
  },
  toggleWithLabel: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    color: 'white',
  },
  filePreviewContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 24,
  },
  filePreview: {
    height: height / 3.5,
    borderWidth: 2,
    borderColor: '#CECFD1',
    borderRadius: 8,
    aspectRatio: 1,
  },
});
