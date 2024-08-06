package com.visioncamerapluginframetofile;


import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.mrousavy.camera.frameprocessors.Frame;
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin;
import com.mrousavy.camera.frameprocessors.VisionCameraProxy;
import java.util.Map;

public class VisionCameraFrameToFilePlugin extends FrameProcessorPlugin {
  VisionCameraFrameToFilePlugin(@NonNull VisionCameraProxy proxy, @Nullable Map<String, Object> options) {}

  @Nullable
  @Override
  public Boolean callback(@NonNull Frame frame, @Nullable Map<String, Object> arguments) {
    return null;
  }
}
