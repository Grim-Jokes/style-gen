import glob
from os import path

from data import TOKEN_DISPATCH, TYPES

DELIM_CHARS = ":;{}()[]'"

def handle_ident(match, css_value):
  pass

def handle_dimension(match, css_value):
  value = match.group(1)
  value = float(value) if '.' in value else int(value)
  unit = match.group(2)
  
  return {
  'value': value,
  'unit': unit
  }

def noop(*args):
  return {}

def handle_space(match, css_value):
  pass

def handle_function(match, css_value):
  pass

def handle_percentage(match, css_value):
  return {
    'value': css_value[:-1], 
    'unit': '%'
  }

handle_type = {
  TYPES.IDENT:  handle_ident,
  TYPES.DIMENSION: handle_dimension,
  TYPES.DELIM: noop,
  TYPES.S: handle_space,
  TYPES.FUNCTION: handle_function,
  TYPES.NUMBER: handle_function,
  TYPES.HASH: handle_function,
  TYPES.COMMENT: handle_function,
  TYPES.COMMA: noop,
  TYPES.STRING: noop,
  TYPES.BAD_STRING: noop,
  TYPES.PERCENTAGE: handle_percentage,
  ']': noop
}

def scan_file(content):
    pos = 0
    col = 0
    line = 1

    word = ''
    source_len = len(content)

    while pos < source_len:
      char = content[pos]
      if char in DELIM_CHARS:
        type_ = char
        css_value = char
        pos += 1
        continue
      else:
        codepoint = min(ord(char), 160)
        for _index, type_, regexp in TOKEN_DISPATCH[codepoint]:
          match = regexp(content, pos)
          if match:
            css_value = match.group()
            break
          else:
            type_ = TYPES.DELIM
            css_value = char
      
      length = len(css_value)
      next_pos = pos + length

      handle_type[type_](match, css_value)

      pos = next_pos

    return []


colors = []
for file in glob.glob('/home/vagrant/plum/public/stylesheets/**/*.css'):

    if path.basename(file).startswith('_'):
        continue

    with open(file) as f:
        colors.extend(scan_file(f.read()))

[print(x.value) for x in colors]
