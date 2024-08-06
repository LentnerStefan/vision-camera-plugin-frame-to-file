package com.visioncamerapluginframetofile;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.YuvImage;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.UUID;

public class FrameToFileUtils extends ReactContextBaseJavaModule {
  private static final String TAG = "FrameToFileUtils";
  private static final String SUBFOLDER_NAME = "frame_files";

  FrameToFileUtils(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return "FrameToFileUtils";
  }

  private static Bitmap imageProxyToBitmap(ImageProxy image) {
    ByteBuffer yBuffer = image.getPlanes()[0].getBuffer();
    ByteBuffer uBuffer = image.getPlanes()[1].getBuffer();
    ByteBuffer vBuffer = image.getPlanes()[2].getBuffer();

    int ySize = yBuffer.remaining();
    int uSize = uBuffer.remaining();
    int vSize = vBuffer.remaining();

    byte[] nv21 = new byte[ySize + uSize + vSize];

    yBuffer.get(nv21, 0, ySize);
    vBuffer.get(nv21, ySize, vSize);
    uBuffer.get(nv21, ySize + vSize, uSize);

    YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, image.getWidth(), image.getHeight(), null);
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    yuvImage.compressToJpeg(new android.graphics.Rect(0, 0, yuvImage.getWidth(), yuvImage.getHeight()), 100, out);
    byte[] imageBytes = out.toByteArray();
    return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
  }

  public String toFile(ImageProxy image) throws IOException {
    String uuidString = UUID.randomUUID().toString();
    String fileName = uuidString + ".png";

    File subfolder = new File(this.getReactApplicationContext().getCacheDir(), SUBFOLDER_NAME);

    // Create subfolder if it doesn't exist
    if (!subfolder.exists()) {
      boolean success = subfolder.mkdirs();
      if (!success) {
        throw new IOException("Error creating directory");
      }
    }

    File file = new File(subfolder, fileName);
    FileOutputStream fos = new FileOutputStream(file);

    Bitmap bitmap = imageProxyToBitmap(image);
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
    fos.close();

    return file.getAbsolutePath();
  }

  @ReactMethod
  public void clearTemporaryDirectory(Promise promise) {
    File subfolder = new File(this.getReactApplicationContext().getCacheDir(), SUBFOLDER_NAME);
    if (!subfolder.exists()) {
      Log.i(TAG, "Subfolder does not exist (yet?).");
      promise.resolve(0);
      return;
    }

    File[] files = subfolder.listFiles();
    if (files == null) {
      Log.e(TAG, "Failed to list contents of subfolder.");
      promise.reject("list_failure", "Failed to list contents of subfolder.");
      return;
    }

    Log.i(TAG, "Found " + files.length + " files in subfolder before cleaning.");

    int deletedCount = 0;
    for (File file : files) {
      boolean success = file.delete();
      if (!success) {
        Log.e(TAG, "Failed to delete file at URL " + file.getAbsolutePath());
        promise.reject("delete_failure", "Failed to delete file at URL " + file.getAbsolutePath());
        return;
      } else {
        Log.i(TAG, "Deleted file at URL " + file.getAbsolutePath());
        deletedCount++;
      }
    }
    Log.i(TAG, "Subfolder cleared.");
    promise.resolve(deletedCount);
  }
}
