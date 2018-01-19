import data

class Parser:

  def __init__(self, tokens):
    self.tokens = tokens

  def find_colours(self):

    length = len(self.tokens)
    count = 0
    colours = []

    while count < length:
      token = self.tokens[count]

      if token.type == data.TYPES.IDENT:
        if 'color' in token.value:
          count += 1
          token = self.tokens[count]
          if token.type == data.TYPES.HASH:
            colours.append(
              f'{token.fileName}: {token.line}: {token.column}: {token.value}'
            )
          elif token.type == data.TYPES.FUNCTION:
            rgb_color = token.value
            codes = []
            if token.value == "rgb(":
              max_ = 3
            elif token.value == "rgba(":
              max_ = 4

            for i in range(max_):
                count += 1
                token = self.tokens[count]
                codes.append(str(token.value))

            rgb_color += ','.join(codes) + ')'

            try:
              if self.tokens[count + 1] == 'important':
                rgb_color += ' !important'
            except IndexError:
              pass

            colours.append(
              f'{token.fileName}: {token.line}: {token.column}: {rgb_color}'
            )

      count += 1
  
    
    print('\n'.join(colours))
