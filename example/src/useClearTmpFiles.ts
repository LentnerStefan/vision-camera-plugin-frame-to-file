import { useState, useEffect } from 'react';
import { clearTemporaryDirectory } from 'react-native-vision-camera-plugin-frame-to-file';
import { AppState } from 'react-native';

/** Removes the created temporary files when on first app load and when app goes to the background */
export const useClearTmpFiles = () => {
  const [clearingFiles, setIsClearingFiles] = useState(true);

  const clearTemporaryFiles = async () => {
    setIsClearingFiles(true);
    try {
      const startTime = performance.now();
      const deletedFileCount = await clearTemporaryDirectory();
      console.log(
        `Took ${Math.round(performance.now() - startTime)}ms to delete ${deletedFileCount} files`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearingFiles(false);
    }
  };

  useEffect(() => {
    clearTemporaryFiles();
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (nextAppState === 'background') {
          clearTemporaryFiles();
        }
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);
  return clearingFiles;
};
