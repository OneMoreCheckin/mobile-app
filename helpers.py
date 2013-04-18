# -*- coding: utf8 -*-

from puke import *
import re
import json
import os

# ==================================================================
# Global helpers for puke
# ==================================================================

# ------------------------------------------------------------------
# Common yak soup
# ------------------------------------------------------------------

# Mint every file in the provided path avoiding xxx files, tests, and already mint files themselves (usually the build root)

class Helpers:
  @staticmethod
  def enforceunix():
    # Puke at large is just untested on windows - and specifically these helpers
    if System.OS != System.MACOS and System.OS != System.LINUX:
      console.fail('Your platform is not supported')

  @staticmethod
  def loadyanks():
    # Yank the base config file
    working_dir = os.path.dirname(os.path.realpath(__file__))

    r = Require("package.json")
    try:
      r.merge(os.path.join(working_dir, 'config.yaml'))
    except:
      pass

    # Try to get separate user specific file, either as json or yaml
    usercpath = 'package-%s-%s' % (Env.get("PUKE_LOGIN", System.LOGIN), Env.get("PUKE_OS", System.OS).lower())
    try:
      r.merge(usercpath + ".json")
    except:
      try:
        r.merge(usercpath + ".yaml")
      except:
        if System.LOGIN == 'root':
          console.fail('You are trying to puke as root without any PUKE_LOGIN specified that matches a known configuration. This is verbotten!')
        pass

    # Map to older format for lazyness reasons :)
    clean = re.sub('[.]git$', '', r['repositories'][0]["url"])

    r['yak'] = {
      "package": {
        "name": r["name"],
        "version": r["version"],
        "homepage": r["homepage"]
      },
      "rights": {
        "license": '<a href="%s">%s</a>' % (r["licenses"][0]["url"], r["licenses"][0]["type"]),
        "copyright": 'All rights reserved <a href="http://www.webitup.fr">copyright %s</a>' % r["author"],
        "author": r["author"]
      },
      "git": {
        "root": '%s/blob/master/src' % clean
      },
      "paths": r["directories"],
      "config": r["config"]
    }

    r.yak('yak')
    # Git in the yanks
    try:
      branch = sh("cd .; git branch | grep '*'", output=False).strip('*').strip()
      if branch == '(no branch)':
        branch = sh("cd .; git describe --tags", output=False).strip()
      commitnb = sh("cd .; git log --pretty=format:%s | wc -l" % '%h', output=False).strip()
      commithash = sh("cd .; git log | head -n 1 | cut -f2 -d' '", output=False).strip()
      Yak.git['root'] = Yak.git['root'].replace('/master/', '/' + branch + '/')
      Yak.git['revision'] = '#' + commitnb + '-' + commithash
    except:
      Yak.git['revision'] = '#no-git-information'
      console.error("FAILED fetching git information - locations won't be accurate")

    for (key, path) in Yak.paths.items():
      FileSystem.makedir(path)



# def __preparepaths():
#   # Aggregate package name and version to the "root" path, if not the default
#   if Yak.root != './':
#     Yak.root = FileSystem.join(Yak.root, Yak.package['name'], Yak.package['version'])

#   # Aggregate all inner paths against the declared ROOT, and build-up all the corresponding top level Yak variables
#   for (key, path) in Yak.paths.items():
#     # Build-up global key only if not overriden
#     if not (key + '_root') in Yak:
#       Yak.set(key + '_root', FileSystem.join(Yak.root, path))
#     FileSystem.makedir(Yak.get(key + '_root'))


# def __prepareconfig():
#   Yak.istrunk = Yak.settings['variant'] == 'bleed'

  # XXX still crap
  @staticmethod
  def minter(path, filter = '', excluding = '', strict = True):
    if excluding:
      excluding = ',%s' % excluding

    if not filter:
      filtre = '*.js'
      list = FileList(path, filter = filtre, exclude = "*-min.js,%s" % excluding)
      for burne in list.get():
        print burne
        print re.sub(r"(.*).js$", r"\1-min.js", burne)
        minify(str(burne), re.sub(r"(.*).js$", r"\1-min.js", burne), strict = strict)
      # filtre = '*.css'
      # list = FileList(path, filter = filtre, exclude = "*-min.css,%s" % excluding)
      # for burne in list.get():
      #   print burne
      #   print re.sub(r"(.*).js$", r"\1-min.js", burne)
      #   minify(str(burne), re.sub(r"(.*).css$", r"\1-min.css", burne))
    else:
      filtre = filter
      list = FileList(path, filter = filtre, exclude = "*-min.js,%s" % excluding)
      for burne in list.get():
        print burne
        print re.sub(r"(.*).js$", r"\1-min.js", burne)
        minify(str(burne), re.sub(r"(.*).js$", r"\1-min.js", burne), strict = strict)

  # Lint every file (usually src)
  @staticmethod
  def linter(path, excluding = '', relax=False):
    if excluding:
      excluding = ',%s' % excluding
    list = FileList(path, filter = "*.js", exclude = "*-min.js,%s" % excluding)
    jslint(list, relax=relax)

  @staticmethod
  def hinter(path, excluding = '', relax=False):
    System.check_package('node')
    System.check_package('npm')
    System.check_package('jshint')
    if excluding:
      excluding = ',%s' % excluding
    list = FileList(path, filter = "*.js", exclude = "*-min.js,%s" % excluding)
    res = '"' + '" "'.join(list.get()) + '"'
    ret = sh('jshint %s' % res, output = False)
    if ret:
      console.fail(ret)
    else:
      console.info("You passed the dreaded hinter!")

  #  npm install -g jshint


  # Flint every file (usually src)
  @staticmethod
  def flinter(path, excluding = '', relax=False):
    if excluding:
      excluding = ',%s' % excluding
    list = FileList(path, filter = "*.js", exclude = "*-min.js,%s" % excluding)
    jslint(list, relax=relax, fix=True)

  # Stat every file (usually build)
  @staticmethod
  def stater(path, excluding = ''):
    if excluding:
      excluding = ',%s' % excluding
    list = FileList(path, filter = "*.js", exclude = "*-min.js,%s" % excluding)
    stats(list, title = "Javascript")
    list = FileList(path, filter = "*-min.js", exclude = "%s" % excluding)
    stats(list, title = "Minified javascript")
    list = FileList(path, filter = "*.css", exclude = "*-min.css,%s" % excluding)
    stats(list, title = "Css")
    list = FileList(path, filter = "*-min.css", exclude = "%s" % excluding)
    stats(list, title = "Minified css")
    list = FileList(path, filter = "*.html,*.xml,*.txt", exclude = "%s" % excluding)
    stats(list, title = "(ht|x)ml + txt")
    list = FileList(path, exclude = "*.html,*.xml,*.txt,*.js,*.css,%s" % excluding)
    stats(list, title = "Other")


  # # Cleans every "ROOT" folder cautiously
  @staticmethod
  def cleaner():
    for (key, path) in Yak.paths.items():
      if not key == "src" and not key == "tests":
        resp = prompt('Delete %s? y/[N]' % path, 'N')
        if resp == 'y':
          try:
            FileSystem.remove(path)
            console.info('Deleted %s' % path)
          except:
            console.error('Failed removing %s' % path)

  @staticmethod
  def replacer(s):
    for (key, value) in Yak.package.items():
      s.add('{PUKE-PACKAGE-%s}' % key.replace('_', '-').upper(), str(value))
    for (key, value) in Yak.rights.items():
      s.add('{PUKE-RIGHTS-%s}' % key.replace('_', '-').upper(), str(value))
    for (key, value) in Yak.git.items():
      s.add('{PUKE-GIT-%s}' % key.replace('_', '-').upper(), str(value))
    for (key, value) in Yak.paths.items():
      s.add('{PUKE-%s-ROOT}' % key.replace('_', '-').upper(), str(value))
    for (key, value) in Yak.config.items():
      s.add('{PUKE-CONFIG-%s}' % key.replace('_', '-').upper(), str(value))
    return s


  @staticmethod
  def deployer(src, withversion = False, destination = False):
    list = FileList(src)
    if withversion and Yak.paths['dist'] != 'dist':
      v = Yak.package['version'].split('-').pop(0).split('.')
      d = FileSystem.join(Yak.paths['dist'], Yak.package['name'], v[0] + "." + v[1])
      if destination:
        d = FileSystem.join(d, destination)
      deepcopy(list, d)
    else:
      d = Yak.paths['dist']
      if destination:
        d = FileSystem.join(d, destination)
      deepcopy(list, d)


# def __preparepaths():
#   # Aggregate package name and version to the "root" path, if not the default
#   if Yak.root != './':
#     Yak.root = FileSystem.join(Yak.root, Yak.package['name'], Yak.package['version'])

#   # Aggregate all inner paths against the declared ROOT, and build-up all the corresponding top level Yak variables
#   for (key, path) in Yak.paths.items():
#     # Build-up global key only if not overriden
#     if not (key + '_root') in Yak:
#       Yak.set(key + '_root', FileSystem.join(Yak.root, path))
#     FileSystem.makedir(Yak.get(key + '_root'))


# def __prepareconfig():
#   Yak.istrunk = Yak.settings['variant'] == 'bleed'


Helpers.enforceunix()
Helpers.loadyanks()

# ------------------------------------------------------------------
# Top-level helpers
# ------------------------------------------------------------------




# # Adds a {PUKE-*-*} pattern for every package, link, or path entry in the Yak






# def describe(shortversion, name, description):
#   yamu = FileSystem.join(Yak.deploy_root, "%s.json" % name)
#   if FileSystem.exists(yamu):
#     mama = json.loads(FileSystem.readfile(yamu))
#     mama[shortversion] = description
#   else:
#     mama = {shortversion: description}

#   # Straight to service root instead - kind of hackish...
#   FileSystem.writefile(yamu, json.dumps(mama, indent=4))

# # ------------------------------------------------------------------
# # Dedicated airstrip helpers
# # ------------------------------------------------------------------

# def getyanks():
#   # Airstrip yank in additional description files
#   l = FileList('yanks', filter = '*.yaml', exclude = '*xxx*');
#   yanks = {}
#   for i in l.get():
#     a = Load(i)
#     yanks = Utils.deepmerge(yanks, a.content['yanks'])

#   Yak.collection = yanks
#   return yanks


# # Bulding / fetching helpers
# def donode(path, extra):
#   System.check_package('node')
#   sh('cd "%s"; node %s' % (path, extra))

# def dorake(path, extra = ''):
#   System.check_package('rvm')
#   System.check_package('npm')
#   System.check_package('bundle')
#   System.check_package('rake')
#   # XXX handlebars requires node as well :/
#   System.check_package('node')
#   sh('cd "%s"; bundle; rake %s' % (path, extra))

# def dothor(path, extra = ''):
#   System.check_package('rvm')
#   System.check_package('bundle')
#   # System.check_package('tilt')
#   # System.check_package('compass')
#   sh('cd "%s"; bundle; thor %s' % (path, extra))

# def domake(path, extra = ''):
#   sh('cd "%s"; make %s' % (path, extra))






# def make(path, type, extra = ''):
#   if type == 'rake':
#     dorake(path, extra)
#   elif type == 'thor':
#     dothor(path, extra)
#   elif type == 'make':
#     domake(path, extra)
#   elif type == 'sh':
#     sh('cd "%s"; %s' % (path, extra))

  # for (k, ipath) in production.items():
  #   FileSystem.copyfile(FileSystem.join(path, ipath), FileSystem.join(destination, k))

  # else:
  #   sh('cd "%s"; cp -R %s %s' % (path, latest, destination), output = True)
    #   sh("cd " + Yak.TMP_ROOT + "/lib/" + burne["Destination"] + "; cp -R " + burne["Latest"] + " " +  k + "; rm " + burne["Latest"])


      # localtmp = puke.FileSystem.join(tmp, url.split('/').pop())
      # if puke.FileSystem.checksum(localtmp) != self.__checksum:
      #   console.fail("PANIC! Archive doesn't pan out. You may puke -c if in doubt, and anyhow double check integrity. %s vs. %s" % (puke.FileSystem.checksum(localtmp), self.__checksum))

      # if type == 'dmg':
      #   console.info('Processing dmg')
      #   self.__dodmg(localtmp, self.local, pwd)
      # elif type == 'pkg':
      #   console.info('Processing pkg')
      #   self.__dopkg(localtmp)
      # else:
      #   console.info('Processing archive file')
      #   self.__dounpack(localtmp, puke.FileSystem.dirname(pwd))





