import cssutils
import glob
from os import path

def scan_file(content):
  
  colors = []
  sheet = cssutils.parseString(content)

  for rule in sheet:
    if (rule.type == rule.STYLE_RULE):
      colors.extend([ x for x in rule.style if x.name == "color" ])

  return colors


colors = []
for file in glob.glob('/home/vagrant/plum/public/stylesheets/**/*.css'):
  
  if path.basename(file).startswith('_'):
    continue

  with open(file) as f:
    colors.extend(scan_file(f.read()))
    
[ print(x.value) for x in colors ]