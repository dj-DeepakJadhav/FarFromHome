import re

code = open('src/ui/hud.js', 'r', encoding='utf-8').read()

dialogue_btn_style = '''          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid ${item.borderLeft};
          border-radius: 12px;
          padding: 9px 12px;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          box-shadow: 0 3px 8px rgba(0,0,0,0.08);
          transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
          line-height: 1.35;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;'''

# WG Buzzer
pattern1 = r'(btn\.style\.cssText = `)([\s\S]*?)(`;\s*btn\.innerHTML = `)([\s\S]*?)(`;\s*btn\.onclick)'
def repl1(m):
    return m.group(1) + dialogue_btn_style + m.group(3) + '''
        <div style="flex: 1;">
          <div style="font-size: 13px; font-weight: 900; color: #1D3557;">${item.label}</div>
          <div style="font-size: 10.5px; color: #718096; font-weight: normal; margin-top: 2px;">${item.subtext}</div>
        </div>
        <span style="font-size: 13px; opacity: 0.7;">➔</span>
      ''' + m.group(5)
code = re.sub(pattern1, repl1, code)

# Mülltrennung Test - replace three buttons
for color, left_color in [('#3A86FF', '#3A86FF'), ('#ECC238', '#E76F51'), ('#2D3748', '#264653')]:
    # We find `<button id="bin-X" style="..."><div...>Title</div><div...>Sub</div></button>`
    btn_regex = r'<button id="bin-[^"]+" style="[^"]+">(?:\s*<div[^>]*>.*?</div>\s*){2}</button>'
    
def repl_muelltrennung():
    global code
    def replace_bin(match):
        text = match.group(0)
        # extract id
        bin_id = re.search(r'id="(bin-[^"]+)"', text).group(1)
        # extract title and subtitle
        divs = re.findall(r'<div[^>]*>(.*?)</div>', text)
        title = divs[0]
        sub = divs[1]
        
        # Color based on bin type
        border_left = '#2EC4B6'
        if 'yellow' in bin_id:
            border_left = '#E76F51'
        elif 'black' in bin_id:
            border_left = '#264653'
            
        style = f'''
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid {border_left};
          border-radius: 12px;
          padding: 9px 12px;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          box-shadow: 0 3px 8px rgba(0,0,0,0.08);
          transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
          line-height: 1.35;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;'''
          
        return f'''<button id="{bin_id}" class="dialogue-opt-btn" style="{style}">
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 900; color: #1D3557;">{title}</div>
                <div style="font-size: 10.5px; color: #718096; font-weight: normal; margin-top: 2px;">{sub}</div>
              </div>
              <span style="font-size: 13px; opacity: 0.7;">➔</span>
            </button>'''
    
    code = re.sub(r'<button id="bin-[^"]+" style="[^"]+">(?:\s*<div[^>]*>.*?</div>){2}\s*</button>', replace_bin, code)
    
repl_muelltrennung()

# Tuition letter button
def repl_tuition():
    global code
    def replace_btn(match):
        text = match.group(0)
        btn_id = re.search(r'id="(btn-[^"]+)"', text).group(1)
        # find the inner text
        btn_text = re.search(r'>([^<]+)</button>', text).group(1).strip()
        style = f'''
          background: #FFFFFF;
          color: #1D3557;
          border: 2px solid #264653;
          border-left: 5px solid #2EC4B6;
          border-radius: 12px;
          padding: 9px 12px;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          box-shadow: 0 3px 8px rgba(0,0,0,0.08);
          transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
          line-height: 1.35;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;'''
        return f'''<button id="{btn_id}" class="dialogue-opt-btn" style="{style}">
            <span style="flex: 1; font-size: 13px;">{btn_text}</span>
            <span style="font-size: 13px; opacity: 0.7;">➔</span>
          </button>'''
    
    code = re.sub(r'<button id="btn-ack-letter"[^>]*>[\s\S]*?</button>', replace_btn, code)
    code = re.sub(r'<button id="btn-leave-uni"[^>]*>[\s\S]*?</button>', replace_btn, code)
    code = re.sub(r'<button id="btn-leave-pizzeria"[^>]*>[\s\S]*?</button>', replace_btn, code)
    code = re.sub(r'<button id="btn-leave-bakery"[^>]*>[\s\S]*?</button>', replace_btn, code)

repl_tuition()

with open('src/ui/hud.js', 'w', encoding='utf-8') as f:
    f.write(code)
