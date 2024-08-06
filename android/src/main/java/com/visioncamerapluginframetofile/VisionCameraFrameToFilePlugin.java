package com.visioncamerapluginframetofile;


import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.mrousavy.camera.core.FrameInvalidError;
import com.mrousavy.camera.frameprocessors.Frame;
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin;
import com.mrousavy.camera.frameprocessors.VisionCameraProxy;
import java.util.Map;

import androidx.camera.core.ImageProxy;

public class VisionCameraFrameToFilePlugin extends FrameProcessorPlugin {
  private final FrameToFileUtils frameToFile;


  VisionCameraFrameToFilePlugin(@NonNull VisionCameraProxy proxy, @Nullable Map<String, Object> options) {
    super();
    frameToFile = new FrameToFileUtils(proxy.getContext());
  }

  @Nullable
  @Override
  public String callback(@NonNull Frame frame, @Nullable Map<String, Object> arguments) {
    try {
      ImageProxy imgProxy = frame.getImageProxy();
      return frameToFile.toFile(imgProxy);
    } catch (Exception | FrameInvalidError e) {
        throw new Error("Something went wrong while processing the frame");
    }
  }
}
