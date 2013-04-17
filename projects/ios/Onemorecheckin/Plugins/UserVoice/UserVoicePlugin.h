#import <Foundation/Foundation.h>
#import "UserVoice.h"
#import <Cordova/CDV.h>
@interface UserVoicePlugin : CDVPlugin

- (void) open:(CDVInvokedUrlCommand*)command;

@end