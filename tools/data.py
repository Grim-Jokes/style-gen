import functools
import operator
import re
import string
import sys
import macro

TOKENS = r'''
    S	[ \t\r\n\f]+
    URI	url\({w}({string}|([!#$%&*-\[\]-~]|{nonascii}|{escape})*){w}\)
    BAD_URI	{baduri}
    FUNCTION	{ident}\(
    UNICODE-RANGE	u\+[0-9a-f?]{{1,6}}(-[0-9a-f]{{1,6}})?
    IDENT	{ident}
    ATKEYWORD	@{ident}
    HASH	#{name}
    DIMENSION	({num})({ident})
    PERCENTAGE	{num}%
    NUMBER	{num}
    STRING	{string}
    BAD_STRING	{badstring}
    COMMENT	\/\*[^*]*\*+([^/*][^*]*\*+)*\/
    BAD_COMMENT	{badcomment}
    :	:
    ;	;
    {	\{{
    }	\}}
    (	\(
    )	\)
    [	\[
    ]	\]
    CDO	<!--
    CDC	-->
'''

COMPILED_TOKEN_REGEXPS = []  # [(name, regexp.match)]  ordered
COMPILED_TOKEN_INDEXES = {}  # {name: i}  helper for the C speedups

TOKEN_DISPATCH = []

class Types:
  DELIM = ''
  COMMA = ','

  def __new__(cls):
    for line in TOKENS.splitlines():
      if line.strip():
        for name, value in [line.split('\t')]:
          setattr(cls, name.strip(), name.strip())
    return cls

TYPES = Types()

def _init_token_regexp():
  for line in TOKENS.splitlines():
      if line.strip():
        for name, value in [line.split('\t')]:
          compiled_re = re.compile(
            value.format(**macro.COMPILED_MACROS),
            re.I
          )

          COMPILED_TOKEN_REGEXPS.append(
            (
              name.strip(),
              compiled_re.match
            )
          )

  COMPILED_TOKEN_INDEXES.clear()
  for i, (name, regexp) in enumerate(COMPILED_TOKEN_REGEXPS):
    COMPILED_TOKEN_INDEXES[name] = i


DISPATCH_STRS = [
        (' \t\r\n\f', ['S']),
        ('uU', ['URI', 'BAD_URI', 'UNICODE-RANGE']),
        # \ is an escape outside of another token
        (string.ascii_letters + '\\_-' + chr(160), ['FUNCTION', 'IDENT']),
        (string.digits + '.+-', ['DIMENSION', 'PERCENTAGE', 'NUMBER']),
        ('@', ['ATKEYWORD']),
        ('#', ['HASH']),
        ('\'"', ['STRING', 'BAD_STRING']),
        ('/', ['COMMENT', 'BAD_COMMENT']),
        ('<', ['CDO']),
        ('-', ['CDC']),
    ]

def _init_dispatches():
    dispatch = [[] for i in range(161)]
    for chars, names in DISPATCH_STRS:
        for char in chars:
            dispatch[ord(char)].extend(names)
    for char in ':;{}()[]':
        dispatch[ord(char)] = [char]

    TOKEN_DISPATCH[:] = (
        [
            (index,) + COMPILED_TOKEN_REGEXPS[index]
            for name in names
            for index in [COMPILED_TOKEN_INDEXES[name]]
        ]
        for names in dispatch
    )

_init_token_regexp()
_init_dispatches()

def _unicode_replace(match, int=int, unichr=chr, maxunicode=sys.maxunicode):
    codepoint = int(match.group(1), 16)
    if codepoint <= maxunicode:
        return unichr(codepoint)
    else:
        return '\N{REPLACEMENT CHARACTER}'  # U+FFFD

UNICODE_UNESCAPE = functools.partial(
    re.compile(macro.COMPILED_MACROS['unicode'], re.I).sub,
    _unicode_replace)

NEWLINE_UNESCAPE = functools.partial(
    re.compile(r'()\\' + macro.COMPILED_MACROS['nl']).sub,
    '')

SIMPLE_UNESCAPE = functools.partial(
    re.compile(r'\\(%s)' % macro.COMPILED_MACROS['simple_escape'], re.I).sub,
    # Same as r'\1', but faster on CPython
    operator.methodcaller('group', 1))

FIND_NEWLINES = re.compile(macro.COMPILED_MACROS['nl']).finditer
