import functools
import operator
import re
import string
import sys

MACROS = r'''
    nl	\n|\r\n|\r|\f
    w	[ \t\r\n\f]*
    nonascii	[^\0-\237]
    unicode	\\([0-9a-f]{{1,6}})(\r\n|[ \n\r\t\f])?
    simple_escape	[^\n\r\f0-9a-f]
    escape	{unicode}|\\{simple_escape}
    nmstart	[_a-z]|{nonascii}|{escape}re.
    nmchar	[_a-z0-9-]|{nonascii}|{escape}
    name	{nmchar}+
    ident	[-]?{nmstart}{nmchar}*
    num	[-+]?(?:[0-9]*\.[0-9]+|[0-9]+)
    string1	\"([^\n\r\f\\"]|\\{nl}|{escape})*\"
    string2	\'([^\n\r\f\\']|\\{nl}|{escape})*\'
    string	{string1}|{string2}
    badstring1	\"([^\n\r\f\\"]|\\{nl}|{escape})*\\?
    badstring2	\'([^\n\r\f\\']|\\{nl}|{escape})*\\?
    badstring	{badstring1}|{badstring2}
    badcomment1	\/\*[^*]*\*+([^/*][^*]*\*+)*
    badcomment2	\/\*[^*]*(\*+[^/*][^*]*)*
    badcomment	{badcomment1}|{badcomment2}
    baduri1	url\({w}([!#$%&*-~]|{nonascii}|{escape})*{w}
    baduri2	url\({w}{string}{w}
    baduri3	url\({w}{badstring}
    baduri	{baduri1}|{baduri2}|{baduri3}
'''.replace(r'\0', '\0').replace(r'\237', '\237');

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

COMPILED_MACROS = {}

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

def _init_macros():
  COMPILED_MACROS.clear()
  for line in MACROS.splitlines():
      line = line.strip()
      if line:
        name, value = line.split('\t')
        COMPILED_MACROS[name.strip()] = '(?:%s)' \
            % value.format(**COMPILED_MACROS)


def _init_token_regexp():
  for line in TOKENS.splitlines():
      if line.strip():
        for name, value in [line.split('\t')]:
          compiled_re = re.compile(
            value.format(**COMPILED_MACROS),
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

def _init_dispatches():
    dispatch = [[] for i in range(161)]
    for chars, names in [
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
    ]:
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

_init_macros()
_init_token_regexp()
_init_dispatches()

def _unicode_replace(match, int=int, unichr=chr, maxunicode=sys.maxunicode):
    codepoint = int(match.group(1), 16)
    if codepoint <= maxunicode:
        return unichr(codepoint)
    else:
        return '\N{REPLACEMENT CHARACTER}'  # U+FFFD

UNICODE_UNESCAPE = functools.partial(
    re.compile(COMPILED_MACROS['unicode'], re.I).sub,
    _unicode_replace)

NEWLINE_UNESCAPE = functools.partial(
    re.compile(r'()\\' + COMPILED_MACROS['nl']).sub,
    '')

SIMPLE_UNESCAPE = functools.partial(
    re.compile(r'\\(%s)' % COMPILED_MACROS['simple_escape'], re.I).sub,
    # Same as r'\1', but faster on CPython
    operator.methodcaller('group', 1))

FIND_NEWLINES = re.compile(COMPILED_MACROS['nl']).finditer
