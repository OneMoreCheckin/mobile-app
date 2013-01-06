//
//  TapToTop.m
//  OneMoreCheckIn
//
//  Created by Manu on 05/01/13.
//
//

#import "TapToTop.h"

@implementation TapToTop


-(void)install:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    UIView* statusBarInterceptView = [[[UIView alloc] initWithFrame:[UIApplication sharedApplication].statusBarFrame] autorelease];
    statusBarInterceptView.backgroundColor = [UIColor clearColor];
    UITapGestureRecognizer* tapRecognizer = [[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(statusBarClicked)] autorelease];
    [statusBarInterceptView addGestureRecognizer:tapRecognizer];
    [[[UIApplication sharedApplication].delegate window] addSubview:statusBarInterceptView];}


- (void)statusBarClicked
{
    [self.commandDelegate evalJs:@"cordova.fireDocumentEvent('taptotop');"];
}

@end
