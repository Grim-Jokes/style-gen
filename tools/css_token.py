class Token:
  def __init__(self, type_, css_value, value, line, column,  unit=''):
    self.type = type_
    self._as_css = css_value
    self.value = value
    self.unit = unit
    self.line = line
    self.column = column