package com.visioncamerapluginframetofile;


import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.mrousavy.camera.core.FrameInvalidError;
import com.mrousavy.camera.frameprocessors.Frame;
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin;
import com.mrousavy.camera.frameprocessors.SharedArray;
import com.mrousavy.camera.frameprocessors.VisionCameraProxy;

import java.nio.ByteBuffer;
import java.util.Map;

import androidx.camera.core.ImageProxy;

public class VisionCameraFrameToFilePlugin extends FrameProcessorPlugin {
  private final FrameToFileUtils frameToFileUtils;


  VisionCameraFrameToFilePlugin(@NonNull VisionCameraProxy proxy, @Nullable Map<String, Object> options) {
    super();
    frameToFileUtils = new FrameToFileUtils(proxy.getContext());
  }

  @Nullable
  @Override
  public String callback(@NonNull Frame frame, @Nullable Map<String, Object> arguments) {
    try {
      if (arguments == null || arguments.isEmpty()) {
        ImageProxy imgProxy = frame.getImageProxy();
        return frameToFileUtils.imageProxyTofile(imgProxy);
      }

      if (!arguments.containsKey("resizedFrameBuffer") || !arguments.containsKey("resizedFrameProperties")) {
        throw new Error("You need to provide the resizedFrameBuffer and the resizedFrameProperties configuration!");
      }

      Map<String, Object> resizedFrameProperties = (Map<String, Object>) arguments.get("resizedFrameProperties");
      SharedArray resizedFrameBuffer = (SharedArray) arguments.get("resizedFrameBuffer");
      // Retrieve height and width as Numbers and convert them to Integers
      Number heightNumber = (Number) resizedFrameProperties.get("height");
      Number widthNumber = (Number) resizedFrameProperties.get("width");

      int height = heightNumber.intValue();
      int width = widthNumber.intValue();

      ByteBuffer buffer = resizedFrameBuffer.getByteBuffer();

      return frameToFileUtils.byteBufferToFile(buffer, width, height);
    } catch (Exception | FrameInvalidError e) {
      throw new Error("Something went wrong while processing the frame" + e.getMessage() + e.getStackTrace());
    }
  }
}
