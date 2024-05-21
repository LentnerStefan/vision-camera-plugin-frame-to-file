//
//  FrameToFileUtils.h
//  Pods
//
//  Created by Stef on 15/05/2024.
//

#ifndef ToFileHelper_h
#define ToFileHelper_h

#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>

@interface FrameToFileUtils : NSObject <RCTBridgeModule>

+ (NSString *)toFile:(UIImage *)image;

@end

#endif /* ToFileHelper_h */
