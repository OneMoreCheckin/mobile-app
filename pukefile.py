#!/usr/bin/env puke
# -*- coding: utf8 -*-

global help
from helpers import Helpers as help
import re
import json

@task("Default task")
def default():
  executeTask("build")
  executeTask("deploy")

@task("All")
def all():
  # Cache.clean()
  executeTask("lint")
  executeTask("hint")
  executeTask("build")
  executeTask("mint")
  executeTask("deploy")
  executeTask("stats")


@task("Wash the taupe!")
def clean():
  Cache.clean()
  help.cleaner()

@task("Lint")
def lint():
  help.linter("src", excluding = "*/lib/*")

@task("Hint")
def hint():
  help.hinter("src", excluding = "*/lib/*")

@task("Flint")
def flint():
  help.flinter("src", excluding = "*/lib/*")

@task("Minting")
def mint():
  help.minter(Yak.paths['build'], strict = True)
  # Some dirty code might not pass strict
  # help.minter(Yak.paths['build'], strict = False)

@task("Stats report deploy")
def stats():
  help.stater(Yak.paths['build'])

@task("Build package")
def build():

  sed = Sed()
  help.replacer(sed)

  sh('compass compile src')

  app = FileList('src/app', filter="*root.js")
  app.merge(FileList('src/app', filter="*.js", exclude="*root.js"))
  combine(app, FileSystem.join(Yak.paths['build'], 'js/app.js'))

  knownHelpers = [
    'action',
    'bind',
    'bindAttr',
    'collection',
    'each',
    'if',
    'log',
    'outlet',
    'unless',
    'view',
    'with'
  ]

  helperCmd = ''
  for helper in knownHelpers:
    helperCmd += '-k %s ' % helper

  stf = Std()
  sh('handlebars src/app/templates -r src/app/templates -f .build/js/templates.js %s' % helperCmd, header="build templates", std = stf)
  if stf.err:
    console.fail("PROUT")

  deepcopy('src/index.html', Yak.paths['build'])

  deepcopy('src/assets/images', FileSystem.join(Yak.paths['build'], 'images'))

  # fontcss = FileList('src/assets/fonts/generated', filter="*.css")
  # combine(fontcss, FileSystem.join(Yak.paths['build'], 'fonts/pictos.css'))

  # pictos = FileList('src/assets/fonts/generated', exclude="*.css")
  # deepcopy(pictos, FileSystem.join(Yak.paths['build'], 'fonts'))

  fonts = FileList('src/assets/fonts/signika')
  deepcopy(fonts, FileSystem.join(Yak.paths['build'], 'fonts'))

  # Phonegap is still needed on desktop
  libs = FileList('src/lib/phonegap/ios', filter="*.js")
  libs.merge(FileList('src/lib/phonegap/plugins', filter="*.js"))
  combine(libs, FileSystem.join(Yak.paths['build'], 'js', 'phonegap.js'))


@task("Deploy package")
def deploy():
  # Prep-up the default browser build
  help.deployer(Yak.paths['build'], False)
  help.deployer('dependencies', False, 'js')

  # Copy that over to ios folder
  deepcopy(FileList(Yak.paths['dist']), Yak.paths['dist-ios'])

  # Copy that over to android folder, along with specialized phonegap
  deepcopy(FileList(Yak.paths['dist']), Yak.paths['dist-android'])

  # Phonegap for Android
  libs = FileList('src/lib/phonegap/android', filter="*.js")
  libs.merge(FileList('src/lib/phonegap/plugins', filter="*.js"))
  combine(libs, FileSystem.join(Yak.paths['dist-android'], 'js', 'phonegap.js'))

  # Phonegap for ios
  libs = FileList('src/lib/phonegap/ios', filter="*.js")
  libs.merge(FileList('src/lib/phonegap/plugins', filter="*.js"))
  combine(libs, FileSystem.join(Yak.paths['dist-ios'], 'js', 'phonegap.js'))
