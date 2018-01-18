import glob
from os import path

from data import TOKEN_DISPATCH, TYPES, UNICODE_UNESCAPE, SIMPLE_UNESCAPE, NEWLINE_UNESCAPE, FIND_NEWLINES
import css_token

DELIM_CHARS = ":;{}()[]'"

def handle_ident(match, css_value):
  value = SIMPLE_UNESCAPE(css_value)
  value = UNICODE_UNESCAPE(value)

  return {
    'value': value
}

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
  return {
    'value': match.group(0)
  }

def handle_percentage(match, css_value):
  return {
    'value': css_value[:-1], 
    'unit': '%'
  }

def handle_string(match, css_value): 
  value = css_value[1:-1]
  value = NEWLINE_UNESCAPE(value)
  value = SIMPLE_UNESCAPE(value)
  value = UNICODE_UNESCAPE(value)

  return {
  'value': value
}

handle_type = {
  TYPES.IDENT:  handle_ident,
  TYPES.DIMENSION: handle_dimension,
  TYPES.DELIM: noop,
  TYPES.S: handle_space,
  TYPES.FUNCTION: handle_ident,
  TYPES.NUMBER: handle_function,
  TYPES.HASH: handle_function,
  TYPES.COMMENT: handle_function,
  TYPES.COMMA: noop,
  TYPES.STRING: handle_string,
  TYPES.BAD_STRING: noop,
  TYPES.PERCENTAGE: handle_percentage,
  ']': noop
}

def scan_file(content):
    pos = 0
    column = 0
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

      params = handle_type[type_](match, css_value)

      if params:
        if 'type_' not in params:
          params['type_'] = type_
        
        params['css_value'] = css_value
        params['line'] = line
        params['column'] = column

        css_token.Token(**params)

      pos = next_pos
      newlines = list(FIND_NEWLINES(css_value))
      if newlines:
        line += len(newlines)
        column = length - newlines[-1].end() + 1
      else:
        column += length

    return []

colors = []
for file in glob.glob('/home/vagrant/plum/public/stylesheets/**/*.css'):

    if path.basename(file).startswith('_'):
        continue

    with open(file) as f:
        colors.extend(scan_file(f.read()))

[print(x.value) for x in colors]
