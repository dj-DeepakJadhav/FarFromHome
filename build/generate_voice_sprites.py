import os
import json
import wave
import base64
from piper.voice import PiperVoice

model_path = r"c:\DeepakJadhav\Personal\Tools\de_DE-thorsten-medium.onnx"
config_path = r"c:\DeepakJadhav\Personal\Tools\de_DE-thorsten-medium.onnx.json"
output_js_path = r"c:\DeepakJadhav\Personal\FarFromHome\src\data\voiceSprites.js"

print("Loading Piper Thorsten German Voice Model...")
voice = PiperVoice.load(model_path, config_path)

triggers = {
    # Level 1: Dark Store Mini-Market
    "milch": "die Milch",
    "apfel": "der Apfel",
    "brot": "das Brot",
    "wasser": "das Wasser",
    "banane": "die Banane",
    "kaese": "der Käse",
    "ei": "das Ei",
    "karotte": "die Karotte",
    
    # Level 2: Pizzeria Restaurant Pickup
    "pizza": "zwei Pizza Margherita bitte",
    "cola": "zwei Cola",
    "wein": "zwei Glas Wein",
    "guten_tag": "Guten Tag!",
    "danke_schoen": "Vielen Dank!",
    
    # Level 3: Doorstep Intercom & Delivery
    "doorbell_correct": "Tür ist auf! Bitte kommen Sie hoch.",
    "doorbell_wrong": "Falscher Knopf! Wer ist da?",
    "trinkgeld": "Hier ist Ihr Trinkgeld, danke schön!",
    "auf_wiedersehen": "Auf Wiedersehen!",
    
    # Level 4: Furniture Store Window Shopping
    "moebel_sofa": "Das Sofa ist sehr schön, aber zu teuer.",
    "moebel_tisch": "Ein schöner Holztisch für mein Zimmer.",
    
    # Level 5: Pet & Toy Store
    "pet_katze": "Eine kleine süße Plüschkatze!",
    "pet_hund": "Ein weicher Plüschhund für mein Bett.",
    
    # Level 6: Christmas Celebration with Friends
    "weihnachten": "Frohe Weihnachten meine Freunde!"
}

audio_sprites = {}
tmp_wav_dir = r"c:\DeepakJadhav\Personal\FarFromHome\build\tmp_audio"
os.makedirs(tmp_wav_dir, exist_ok=True)

for key, text in triggers.items():
    wav_path = os.path.join(tmp_wav_dir, f"{key}.wav")
    print(f"Synthesizing '{text}' -> {key}.wav")
    
    with wave.open(wav_path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2) # 16-bit PCM
        wav_file.setframerate(voice.config.sample_rate)
        for chunk in voice.synthesize(text):
            wav_file.writeframes(chunk.audio_int16_bytes)
    
    with open(wav_path, "rb") as f:
        wav_bytes = f.read()
        b64_str = base64.b64encode(wav_bytes).decode("ascii")
        audio_sprites[key] = f"data:audio/wav;base64,{b64_str}"

js_content = f"""// Pre-rendered German Voice Audio Sprites generated with Piper TTS (Thorsten CC0)
window.FFH = window.FFH || {{}};
window.FFH.voiceSprites = {json.dumps(audio_sprites, indent=2)};
"""

with open(output_js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"SUCCESS: Generated {len(audio_sprites)} German voice sprites across all 6 story levels in {output_js_path}")
