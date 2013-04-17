#import "UserVoicePlugin.h"
// Dispatch period in seconds
@implementation UserVoicePlugin


- (void) open:(CDVInvokedUrlCommand*)command
{
    NSLog(@"in the stuff");
    UVConfig *config = [UVConfig configWithSite:@"onemorecheckin.uservoice.com"
                                         andKey:@"xZkxs1xspM6sNJE0LJUuLQ"
                                      andSecret:@"gaFepfe9e7zCiyRjyoMz0ef82XuRjcHv6284QkaVZE"];
    
    [UserVoice presentUserVoiceInterfaceForParentViewController:self.viewController andConfig:config];
}


@end