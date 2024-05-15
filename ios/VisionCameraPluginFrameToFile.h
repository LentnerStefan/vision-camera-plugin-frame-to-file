
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNVisionCameraPluginFrameToFileSpec.h"

@interface VisionCameraPluginFrameToFile : NSObject <NativeVisionCameraPluginFrameToFileSpec>
#else
#import <React/RCTBridgeModule.h>

@interface VisionCameraPluginFrameToFile : NSObject <RCTBridgeModule>
#endif

@end
