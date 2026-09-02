# Verifies story.ink and story.twee are the same story:
#   1. identical scene TAG blocks for every shared scene name
#   2. identical PROSE, after normalising each format's syntax
import re, sys

BS = chr(92)
INK, TWEE = 'assets/narrative/story.ink', 'assets/narrative/story.twee'

TAG_RE = re.compile(r'^#\s*(\w+)\s*:\s*(.*)$')

# ---------------------------------------------------------------- ink
def parse_ink(path):
    scenes, prose, cur = {}, [], None
    for raw in open(path, encoding='utf-8'):
        s = raw.strip()
        if not s or s.startswith('//') or s.startswith('VAR '):
            continue
        m = re.match(r'^===\s*(\w+)\s*(?:===)?$', s) or re.match(r'^=\s*(\w+)$', s)
        if m:
            cur = m.group(1); scenes[cur] = {}
            continue
        t = TAG_RE.match(s)
        if t:
            if cur is None:
                sys.exit('ink: tag outside a knot: ' + s)
            scenes[cur][t.group(1)] = t.group(2).strip()
            continue
        if (s.startswith('~') or s.startswith('->') or s == '->->'
                or s.startswith('}') or s == '- else:'):
            continue
        s = re.sub(r'^[*+]\s*', '', s)
        # Choice gate {cond} -- must NOT contain ':', or this would swallow a
        # whole-line inline conditional {cond: text} before it can be unwrapped.
        s = re.sub(r'^\{[^}:]*\}\s*', '', s)
        if re.match(r'^\{[^}]*:$', s):                # multiline conditional head
            continue
        s = s.replace('[', '').replace(']', '')
        # Inline conditional {cond: A|B} -> "A B". Handled as a MATCHED PAIR so the
        # closing brace goes with it; blanket-stripping '}' would leave a dangling
        # '{wallet' that key() can no longer recognise as an interpolation.
        s = re.sub(r'\{\s*[A-Za-z_][^{}]*?:\s*([^{}]*)\}',
                   lambda m: m.group(1).replace('|', ' '), s)
        # Unwrapping a conditional can expose the logic line it wrapped
        # ({cond: ~ pay = pay + 8.0}), so re-check for it here.
        if s.strip() and not s.strip().startswith('~'):
            prose.append(re.sub(r'\s+', ' ', s.strip()))
    return scenes, prose

# ---------------------------------------------------------------- twee
def parse_twee(path):
    src = open(path, encoding='utf-8').read()
    src = re.sub(r'^::\s*(StoryTitle|StoryData|StoryInit|StoryNotes)\b.*?(?=^::|\Z)',
                 '', src, flags=re.M | re.S)
    scenes, prose, cur = {}, [], None
    in_tags = in_block = False
    for raw in src.split('\n'):
        s = raw.strip()
        if not s:
            continue
        if s.startswith('/*'):
            in_block = not s.endswith('*/'); continue
        if in_block:
            if s.endswith('*/'): in_block = False
            continue
        m = re.match(r'^::\s*(\w+)', s)
        if m:
            cur = m.group(1); scenes.setdefault(cur, {}); continue
        if s == '<!--':
            in_tags = True; continue
        if in_tags:
            if s == '-->':
                in_tags = False; continue
            t = TAG_RE.match(s)
            if t: scenes[cur][t.group(1)] = t.group(2).strip()
            continue
        s = re.sub(r'<<[^>]*>>', '', s)
        s = s.replace(BS, '').replace("''", '')
        for part in re.split(r'(?<=\]\])\s*[*+]?\s*', s):
            q = re.sub(r'^[*+]\s*', '', part).strip()
            q = re.sub(r'\[\[([^\]]*?)->[^\]]+\]\]', r'\1', q)
            if q.strip():
                prose.append(re.sub(r'\s+', ' ', q.strip()))
    return scenes, prose

def key(s):
    s = re.sub(r'->\s*\w+(\s*->\s*\w+)?$', '', s)   # ink divert suffix on a choice
    s = re.sub(r'\{[^}]*\}', '', s)                 # ink interpolation
    s = re.sub(r'\$[a-z_]+', '', s)                 # twee bare var
    s = s.replace('|', ' ')
    return re.sub(r'[^a-z0-9]', '', s.lower())

ink_scenes, ink_prose = parse_ink(INK)
tw_scenes, tw_prose = parse_twee(TWEE)

# assert the strippers actually removed the tag lines from prose
for name, arr in (('ink', ink_prose), ('twee', tw_prose)):
    leaked = [p for p in arr if TAG_RE.match(p)]
    if leaked:
        sys.exit('%s: %d tag line(s) leaked into prose, e.g. %r'
                 % (name, len(leaked), leaked[0]))
print('tag lines excluded from prose on both sides: OK')

# ---- 1. tag parity ----
shared = sorted(set(ink_scenes) & set(tw_scenes))
tagged_ink = {k for k, v in ink_scenes.items() if v}
tagged_tw = {k for k, v in tw_scenes.items() if v}
print('ink knots %d (tagged %d) | twee passages %d (tagged %d) | shared names %d'
      % (len(ink_scenes), len(tagged_ink), len(tw_scenes), len(tagged_tw), len(shared)))

tag_diff = []
for n in shared:
    if ink_scenes[n] != tw_scenes[n]:
        a, b = ink_scenes[n], tw_scenes[n]
        for k in sorted(set(a) | set(b)):
            if a.get(k) != b.get(k):
                tag_diff.append('%s.%s  ink=%r  twee=%r' % (n, k, a.get(k), b.get(k)))
print('TAG BLOCK DIFFS: %s' % (len(tag_diff) or 'none'))
for d in tag_diff[:20]:
    print('   ', d)

untagged = sorted(tagged_ink - tagged_tw) + sorted(tagged_tw - tagged_ink)
print('scenes tagged on one side only: %s' % (untagged or 'none'))

# ---- 2. prose parity ----
SCAFFOLD = {'continue', 'room4', 'theyard'}
si = {key(x) for x in ink_prose if key(x)}
st = {key(x) for x in tw_prose if key(x)} - SCAFFOLD
oi, ot = sorted(si - st), sorted(st - si)
print()
print('PROSE ink-only %d | twee-only %d' % (len(oi), len(ot)))
for k in oi[:40]:
    print('  INK  ', next(x for x in ink_prose if key(x) == k)[:150])
for k in ot[:40]:
    print('  TWEE ', next(x for x in tw_prose if key(x) == k)[:150])
