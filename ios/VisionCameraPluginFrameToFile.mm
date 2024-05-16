#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>
#import <VisionCamera/SharedArray.h>
#import "ToFileHelper.h"

@interface ToFileFrameProcessorPlugin : FrameProcessorPlugin
@end

@implementation ToFileFrameProcessorPlugin {
    VisionCameraProxyHolder* _proxy;
}

- (instancetype)initWithProxy:(VisionCameraProxyHolder*)proxy withOptions:(NSDictionary*)options {
    if (self = [super initWithProxy:proxy withOptions:options]) {
        _proxy = proxy;
    }
    return self;
}

- (id)callback:(Frame*)frame withArguments:(NSDictionary*)arguments {
    // Extract `resizedFrame` from arguments and cast it to SharedArray
    SharedArray *resizedFrame = [arguments objectForKey:@"resizedFrame"];

    // If no resizedFrame is given, save the main frame to Disk
    if (![resizedFrame isKindOfClass:[SharedArray class]]) {
        CMSampleBufferRef buffer = frame.buffer;
        UIImageOrientation orientation = frame.orientation;

        // Convert CMSampleBufferRef to UIImage
        CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(buffer);
        CIImage *ciImage = [CIImage imageWithCVImageBuffer:imageBuffer];
        UIImage *image = [UIImage imageWithCIImage:ciImage scale:1.0 orientation:orientation];

        // Call toFile method from ToFileHelper
        NSString *savedImagePath = [ToFileHelper toFile:image];

        // Return the saved image path or handle the result as needed
        if (savedImagePath) {
            return savedImagePath;
        } else {
            // Handle the error case, e.g., return nil or an error message
            return @"Error saving image";
        }
    }

    // Extract the `resizedFrameProperties` from arguments and cast it to NSDictionary
    NSDictionary* resizedFrameProperties = arguments[@"resizedFrameProperties"];

    // Extract the data from the frame
    uint8_t *data = (uint8_t *)resizedFrame.data;
    size_t dataLength = resizedFrame.size;

    // Log data information
    if (data && dataLength > 0) {
        NSLog(@"Data length: %zu", dataLength);
        // Log the first few bytes of the data
        size_t logBytes = MIN(dataLength, 10);
        NSMutableString *dataPreview = [NSMutableString stringWithString:@"Data preview: "];
        for (size_t i = 0; i < logBytes; i++) {
            [dataPreview appendFormat:@"%02x ", data[i]];
        }
        NSLog(@"%@", dataPreview);
    } else {
        NSLog(@"Error: Data is empty or null.");
        return @"Error: Data is empty or null.";
    }

    if (data) {
        NSNumber *widthNumber = resizedFrameProperties[@"width"];
        NSNumber *heightNumber = resizedFrameProperties[@"height"];

        size_t width = widthNumber.unsignedLongValue;
        size_t height = heightNumber.unsignedLongValue;

        // Number of bits per component (RGBA = 4 components, 8 bits each = 32 bits total)
        size_t bitsPerComponent = 8;
        // Number of bytes per pixel (RGBA = 4 bytes per pixel)
        size_t bytesPerPixel = 4;
        // Number of bytes per row (width * bytes per pixel)
        size_t bytesPerRow = width * bytesPerPixel;

        // Log the parameters being passed to CGContextCreate
        NSLog(@"Creating context with width: %zu, height: %zu, bitsPerComponent: %zu, bytesPerRow: %zu, colorSpace: DeviceRGB", width, height, bitsPerComponent, bytesPerRow);

        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        CGContextRef context = CGBitmapContextCreate(data, width, height, bitsPerComponent, bytesPerRow, colorSpace, kCGImageAlphaPremultipliedFirst);
        
        if (!context) {
            CGColorSpaceRelease(colorSpace);
            return @"Error: Could not create context.";
        }
        
        CGImageRef imageRef = CGBitmapContextCreateImage(context);
        if (!imageRef) {
            CGContextRelease(context);
            CGColorSpaceRelease(colorSpace);
            return @"Error: Could not create image.";
        }
        
        UIImage *image = [UIImage imageWithCGImage:imageRef];
        CGColorSpaceRelease(colorSpace);
        CGContextRelease(context);
        CGImageRelease(imageRef);

        // Call toFile method from ToFileHelper
        NSString *savedImagePath = [ToFileHelper toFile:image];

        // Return the saved image path or handle the result as needed
        if (savedImagePath) {
            return savedImagePath;
        } else {
            // Handle the error case, e.g., return nil or an error message
            return @"Error saving image";
        }
    } else {
        // Handle the case where data is not available
        return @"Error: No valid image data available.";
    }
}

VISION_EXPORT_FRAME_PROCESSOR(ToFileFrameProcessorPlugin, toFile)

@end
