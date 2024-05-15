import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useToFilePlugin } from 'react-native-vision-camera-plugin-frame-to-file';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  runAtTargetFps,
} from 'react-native-vision-camera';

export default function App() {
  const device = useCameraDevice('back');

  const lol = useToFilePlugin();

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();

  // Triggers the opening of the device settings if the user denies the permission request.
  const handleCameraPermissionRequest = async () => {
    await requestCameraPermission();
  };

  const fakeFrameProcessor = useFrameProcessor((frame) => {
    'worklet';
    runAtTargetFps(1, () => {
      'worklet';
      const test = lol.toFile(frame);
      console.log('filepath', test);
    });
  }, []);

  if (!hasCameraPermission) {
    return (
      <View
        style={styles.container}
        onTouchStart={handleCameraPermissionRequest}
      >
        <Text>Missing permission! Press here</Text>
      </View>
    );
  }
  if (!device) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={styles.camera}
        isActive
        device={device}
        frameProcessor={fakeFrameProcessor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
});
