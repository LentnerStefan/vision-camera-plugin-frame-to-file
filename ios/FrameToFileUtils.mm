//
//  FrameToFileUtils.m
//
//  Created by Stef on 15/05/2024.
//

#import "FrameToFileUtils.h"

@implementation FrameToFileUtils
RCT_EXPORT_MODULE()

// Define a specific subfolder name for the temporary directory where we will save the images
static NSString *const kSubfolderName = @"frame_files";

+ (NSString *)toFile:(UIImage *)image {
    NSString *uuidString = [[NSUUID UUID] UUIDString];
    NSString *fileName = [uuidString stringByAppendingPathExtension:@"png"];
    
    NSURL *subfolderURL = [[NSFileManager defaultManager].temporaryDirectory URLByAppendingPathComponent:kSubfolderName];
    
    // Create subfolder if it doesn't exist
    if (![[NSFileManager defaultManager] fileExistsAtPath:subfolderURL.path]) {
        NSError *error = nil;
        [[NSFileManager defaultManager] createDirectoryAtURL:subfolderURL withIntermediateDirectories:YES attributes:nil error:&error];
        if (error) {
            @throw [NSException exceptionWithName:@"DirectoryCreationException"
                                           reason:[NSString stringWithFormat:@"Error creating directory: %@", error.localizedDescription]
                                         userInfo:@{NSUnderlyingErrorKey: error}];
        }
    }
    
    NSURL *fileURL = [subfolderURL URLByAppendingPathComponent:fileName];
    NSData *imageData = UIImagePNGRepresentation(image);
    NSError *error = nil;
    [imageData writeToURL:fileURL options:NSDataWritingAtomic error:&error];
    if (error) {
        @throw [NSException exceptionWithName:@"ImageSaveException"
                                       reason:[NSString stringWithFormat:@"Error saving image: %@", error.localizedDescription]
                                     userInfo:@{NSUnderlyingErrorKey: error}];
    }
    return fileURL.path;
}

RCT_EXPORT_METHOD(clearTemporaryDirectory:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSURL *subfolderURL = [[NSFileManager defaultManager].temporaryDirectory URLByAppendingPathComponent:kSubfolderName];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;
    NSArray<NSURL *> *subfolderContents = [fileManager contentsOfDirectoryAtURL:subfolderURL
                                                    includingPropertiesForKeys:nil
                                                                       options:NSDirectoryEnumerationSkipsHiddenFiles
                                                                         error:&error];
    if (error) {
        NSLog(@"Failed to list contents of subfolder: %@", error.localizedDescription);
        reject(@"list_failure", @"Failed to list contents of subfolder", error);
        return;
    }
    
    NSLog(@"Found %lu files in subfolder before cleaning.", (unsigned long)subfolderContents.count);

    for (NSURL *fileURL in subfolderContents) {
        BOOL success = [fileManager removeItemAtURL:fileURL error:&error];
        if (!success) {
            NSLog(@"Failed to delete file at URL %@: %@", fileURL, error.localizedDescription);
            reject(@"delete_failure", [NSString stringWithFormat:@"Failed to delete file at URL %@", fileURL], error);
            return;
        } else {
            NSLog(@"Deleted file at URL %@", fileURL);
        }
    }
    NSLog(@"Subfolder cleared.");
    resolve(@(subfolderContents.count));
}

@end
