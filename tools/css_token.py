class Token:
  def __init__(self, type_, css_value, value, line, column,  unit=''):
    self.type = type_
    self._as_css = css_value
    self.value = value
    self.unit = unit
    self.line = line
    self.column = column

  def __str__(self):
    return f"{self.value}{',' +  self.unit if self.unit else self.unit}, {self.type}, {self.line}:{self.column}"