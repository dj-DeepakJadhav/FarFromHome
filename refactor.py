import re, os

code = open('src/ui/hud.js', 'r', encoding='utf-8').read()

bottom_sheet_style = '''      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      background: #FFFFFF;
      border-top: 4px solid #2EC4B6;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 16px 14px 24px 14px;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
      z-index: 9500;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);'''

target_modals = [
    'showWGBuzzerModal',
    'showMuelltrennungModal',
    'showTuitionLetterModal',
    'showLockedUniModal',
    'showPizzeriaJobModal',
    'showBakeryJobModal'
]

for name in target_modals:
    pattern = r'(' + name + r'\(.*?\)\s*\{[\s\S]*?modal\.style\.cssText\s*=\s*`)([\s\S]*?)(`;[\s\S]*?modal\.innerHTML\s*=\s*`)([\s\S]*?)(`;\s*parent\.appendChild\(modal\);)'
    match = re.search(pattern, code)
    if match:
        prefix, old_css, midfix, innerHTML, suffix = match.groups()
        
        # Replace wrapper boxes with a simple flex column
        innerHTML = re.sub(r'<div style="[^>]*?box-shadow[^>]*?">', '<div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">', innerHTML, count=1)
        
        # Strip colored headers
        innerHTML = re.sub(r'<div style="background: #[A-Fa-f0-9]+; padding: [^>]+; color: #FFF;[^>]*">', '<div style="display: flex; flex-direction: column; padding-bottom: 8px; border-bottom: 2px solid #F0F4F8; margin-bottom: 8px;">', innerHTML, count=1)
        
        # Adjust yellow text to orange so it reads on white
        innerHTML = innerHTML.replace('color: #FFD166;', 'color: #E76F51;')
        
        # specific Mülltrennung text color adjust
        innerHTML = innerHTML.replace('color: #FFF;', 'color: #1D3557;')
        
        new_str = prefix + '\n' + bottom_sheet_style + '\n' + midfix + innerHTML + suffix
        code = code[:match.start()] + new_str + code[match.end():]
        print('Refactored', name)
    else:
        print('Could not find', name)

with open('src/ui/hud.js', 'w', encoding='utf-8') as f:
    f.write(code)
