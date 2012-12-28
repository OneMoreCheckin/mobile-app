from puke import *
import re
import json


# Mint every file in the provided path avoiding xxx files, tests, and already mint files themselves (usually the build root)
excludecrap = '*xxx*'

# XXX still crap
def minter(path, filter = '', excluding = '', strict = True):
  if excluding:
    excluding = ',%s' % excluding

  if not filter:
    filtre = '*.js'
    list = FileList(path, filter = filtre, exclude = "*-min.js,%s%s" % (excludecrap, excluding))
    for burne in list.get():
      print burne
      print re.sub(r"(.*).js$", r"\1-min.js", burne)
      minify(burne, re.sub(r"(.*).js$", r"\1-min.js", burne), strict = strict)
    filtre = '*.css'
    list = FileList(path, filter = filtre, exclude = "*-min.css,%s%s" % (excludecrap, excluding))
    for burne in list.get():
      minify(burne, re.sub(r"(.*).css$", r"\1-min.css", burne))
  else:
    filtre = filter
    list = FileList(path, filter = filtre, exclude = "*-min.js,%s%s" % (excludecrap, excluding))
    for burne in list.get():
      minify(burne, re.sub(r"(.*).js$", r"\1-min.js", burne), strict = strict)

# Lint every file (usually src)
def linter(path, excluding = '', relax=False):
  if excluding:
    excluding = ',%s' % excluding
  list = FileList(path, filter = "*.js", exclude = "*-min.js,%s%s" % (excludecrap, excluding))
  jslint(list, relax=relax)

def hinter(path, excluding = '', relax=False):
  System.check_package('node')
  System.check_package('npm')
  System.check_package('jshint')
  if excluding:
    excluding = ',%s' % excluding
  list = FileList(path, filter = "*.js", exclude = "*-min.js,%s%s" % (excludecrap, excluding))
  res = '"' + '" "'.join(list.get()) + '"'
  ret = sh('jshint %s' % res, output = False)
  if ret:
    console.fail(ret)
  else:
    console.info("You passed the dreaded hinter!")

#  npm install -g jshint


# Flint every file (usually src)
def flinter(path, excluding = '', relax=False):
  if excluding:
    excluding = ',%s' % excluding
  list = FileList(path, filter = "*.js", exclude = "*-min.js,%s%s" % (excludecrap, excluding))
  jslint(list, relax=relax, fix=True)

# Stat every file (usually build)
def stater(path, excluding = ''):
  if excluding:
    excluding = ',%s' % excluding
  list = FileList(path, filter = "*.js", exclude = "*-min.js,%s%s" % (excludecrap, excluding))
  stats(list, title = "Javascript")
  list = FileList(path, filter = "*-min.js", exclude = "%s%s" % (excludecrap, excluding))
  stats(list, title = "Minified javascript")
  list = FileList(path, filter = "*.css", exclude = "*-min.css,%s%s" % (excludecrap, excluding))
  stats(list, title = "Css")
  list = FileList(path, filter = "*-min.css", exclude = "%s%s" % (excludecrap, excluding))
  stats(list, title = "Minified css")
  list = FileList(path, filter = "*.html,*.xml,*.txt", exclude = "%s%s" % (excludecrap, excluding))
  stats(list, title = "(ht|x)ml + txt")
  list = FileList(path, exclude = "*.html,*.xml,*.txt,*.js,*.css,%s%s" % (excludecrap, excluding))
  stats(list, title = "Other")
