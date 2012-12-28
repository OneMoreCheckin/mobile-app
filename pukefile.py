#!/usr/bin/env puke
# -*- coding: utf8 -*-

global PH
import helpers as PH


@task("default")
def default():
    sh('compass compile src')

    # libs = FileList('src/lib/foundation', filter="*.js")
    # combine(libs, 'build/js/foundation.js')

    libs = FileList('src/lib/phonegap', filter="*.js")
    combine(libs, 'build/js/phonegap.js')

    libs = FileList('src/lib/jqmobi', filter="*.js")
    combine(libs, 'build/js/jqmobi.js')

    libs = FileList('src/lib/phoneapp/', filter="*namespace.js")
    libs.merge(FileList('src/lib/phoneapp/', filter="*.js", exclude="*namespace.js"))
    combine(libs, 'build/js/phoneapp.js')

    app = FileList('src/app', filter="*root.js")
    app.merge(FileList('src/app', filter="*.js",exclude="*root.js"));
    combine(app, 'build/js/app.js')

    sh('handlebars src/app/templates -r src/app/templates -f build/js/templates.js', header="build templates")

    deepcopy('src/index.html', 'build/')

    deepcopy('src/assets/images', 'build/images')

    deepcopy('src/assets/css', 'build/css')

    fontcss = FileList('src/assets/fonts/generated', filter="*.css")
    combine(fontcss, 'build/fonts/pictos.css')

    pictos = FileList('src/assets/fonts/generated', exclude="*.css")
    deepcopy(pictos, 'build/fonts/')

    deepcopy('src/lib/handlebars', 'build/js')



@task("Lint")
def lint():
  PH.linter("src/app")
  PH.linter("src/lib/phoneapp")

@task("Hint")
def hint():
  PH.hinter("src/app")
  PH.hinter("src/lib/phoneapp")
  PH.hinter("src/lib/zepto")

@task("Flint")
def flint():
  PH.flinter("src/app")
  PH.flinter("src/lib/phoneapp")


@task("Minting")
def mint():
  # Yahoo and yep don't support strict
  # PH.minter('build', filter = "*yahoo.js,*yepnope.js", strict = False)
  # PH.minter('build', excluding = "*yahoo*,*yepnope*")
  PH.minter('build')

@task("Stats report deploy")
def stats():
  PH.stater('build')



@task("build")
def build(platform="ios"):
    executeTask('execute', platform, 'debug')


@task("clean")
def clean(platform="ios"):
    executeTask('execute', platform, 'clean')


@task("emulate")
def emulate(platform):
    if platform == 'ios':
        sh("./projects/ios/cordova/emulate", header="Build & launch ios simulator")
    elif platform == 'android':
        sh('./projects/android/cordova/emulate', header="Launch Android Simulator")
        sh('adb wait-for-device', header="Waiting for simulator")
        sh('adb shell \'while [ ""`getprop service.bootanim.exit` != "1" ] ; do sleep 1; done\'', header=False)
        sh('adb shell "input keyevent 82"', header="Unlock screen")
        sh('./projects/android/cordova/BOOM', header="Compile & open")


@task('execute')
def execute(platform, command):
    whitelist = ['ios', 'android']
    title = ''

    if command == 'debug':
        title = 'Building (target debug)'
    elif command == 'clean':
        title = 'Cleaning'
    else:
        title = command

    title = '%s %s' % (title, platform)

    if platform == 'all':
        for p in whitelist:
            sh("./projects/%s/cordova/%s" % (p, command), header=title)

        return

    if not platform in whitelist:
        console.error('unknown platform', platform)
        return

    sh("./projects/%s/cordova/%s" % (platform, command), header=title)
