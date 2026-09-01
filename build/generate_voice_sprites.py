import os
import json
import wave
import base64
from piper.voice import PiperVoice
from piper.config import SynthesisConfig

model_path = r"c:\DeepakJadhav\Personal\Tools\de_DE-thorsten-medium.onnx"
config_path = r"c:\DeepakJadhav\Personal\Tools\de_DE-thorsten-medium.onnx.json"
output_js_path = r"c:\DeepakJadhav\Personal\FarFromHome\src\data\voiceSprites.js"

print("Loading Piper Thorsten German Voice Model...")
voice = PiperVoice.load(model_path, config_path)

# Deliberate, clear, natural German pace (length_scale > 1 slows down speech pleasantly)
calm_config = SynthesisConfig(length_scale=1.28)

triggers = {
    # 1. Dark Store & Flashcard Vocabulary Words (Spoken with full German Article)
    "milch": "die Milch",
    "apfel": "der Apfel",
    "brot": "das Brot",
    "wasser": "das Wasser",
    "banane": "die Banane",
    "kaese": "der Käse",
    "ei": "das Ei",
    "karotte": "die Karotte",
    "kaffee": "der Kaffee",
    "pizza": "die Pizza",
    "fahrrad": "das Fahrrad",
    "tasche": "die Tasche",
    "strasse": "die Straße",
    "schluessel": "der Schlüssel",
    "stempel": "der Stempel",
    "bescheinigung": "die Bescheinigung",
    "visum": "das Visum",
    "mietvertrag": "der Mietvertrag",
    "konto": "das Konto",
    "ruhezeit": "die Ruhezeit",
    
    # 2. Doorstep & Restaurant Interactions
    "guten_tag": "Guten Tag!",
    "danke_schoen": "Vielen Dank!",
    "auf_wiedersehen": "Auf Wiedersehen!",
    "doorbell_correct": "Guten Tag! Ihre Kruma Lieferung ist da.",
    "doorbell_wrong": "Falscher Name an der Klingel.",
    "trinkgeld": "Hier ist Ihr Trinkgeld, vielen Dank!",

    # 3. NPC Rita Schneider (University Registrar)
    "npc_rita_intro": "Guten Tag. Bitte halten Sie Ihren Zulassungsbescheid und die Semestergebühr bereit.",
    "npc_rita_status": "Guten Tag. Für die Immatrikulation fehlt noch ein Teil der Semestergebühr.",
    "npc_rita_success": "Ausgezeichnet! Ihr Semesterbeitrag ist bezahlt. Willkommen an der Universität zu Lübeck!",
    "npc_rita_about_uni": "Wir sind weltweit führend in Medizin, Robotik und Informatik! Wenn Sie fleißig lernen, werden Sie großen Erfolg haben.",
    "npc_rita_gossip": "Herr Becker in der Pizzeria arbeitet hart, ist aber oft gestresst. Oma Martha in der Bäckerei ist ein Engel, sie bringt mir immer frische Croissants!",

    # 4. NPC Mathias Becker (Pizzeria Boss)
    "npc_mathias_intro": "Wir stellen im Moment niemanden ein! Frag doch mal bei Frau Webber in der Bäckerei Hansa nach.",
    "npc_mathias_status": "Eine frische, heiße Pizza Margherita kostet bei mir acht Euro.",
    "npc_mathias_crust": "Achtundvierzig Stunden kalte Teigführung! Und ein echter Steinofen bei vierhundertzwanzig Grad. Das ist echtes Handwerk!",
    "npc_mathias_gossip": "Nina ist schnell, aber dieser Lieferwahn schadet der Gemütlichkeit! Frische Pizza gehört auf einen Teller im Restaurant!",

    # 5. NPC Oma Martha (Bakery Shopkeeper)
    "npc_martha_intro": "In der Backstube sind wir voll. Aber Kruma Express an der Nordstraße sucht dringend fleißige Fahrradkuriere! Schau doch mal dort vorbei.",
    "npc_martha_status": "Frisches Brot wärmt das Herz. Ein Laib Sauerteigbrot kostet drei Euro.",
    "npc_martha_life": "Schon über vierzig Jahre! Mein verstorbener Mann und ich haben diese Bäckerei mit Liebe aufgebaut. Eine wunderschöne Stadt!",
    "npc_martha_gossip": "Hans Lokker? Der Hausverwalter wirkt streng, hat aber ein gutes Herz. Halte dich an die Nachtruhe ab zweiundzwanzig Uhr, dann gibt es keinen Ärger!",

    # 6. NPC Nina Lindemann (Kruma Dispatch)
    "npc_nina_intro": "Wenn du die deutschen Artikel der, die, das schnell im Regal findest und sicher fährst, verdienst du gutes Geld für deine Miete. Bereit für die erste Schicht?",
    "npc_nina_status": "Die Regale sind gefüllt. Bist du bereit zum Packen und Ausliefern?",
    "npc_nina_tips": "Kauf dir das E-Bike Upgrade im Zimmer! Damit fliegst du über das Kopfsteinpflaster. Und achte auf die Frische der Bestellungen!",
    "npc_nina_gossip": "Mathias denkt, unsere Räder blockieren seine Außentische. Park einfach auf dem Gehweg gegenüber, dann regt er sich nicht auf!",

    # 7. NPC Hans Lokker (WG Caretaker)
    "npc_lokker_status": "Nachtruhe gilt ab Punkt zweiundzwanzig Uhr. Halten Sie Ordnung im Hausflur!",
    "npc_lokker_rules": "Flur freihalten, Ruhezeit ab zweiundzwanzig Uhr strikt beachten und Mülltrennung lernen: Papier blau, Plastik gelb, Restmüll schwarz!",
    "npc_lokker_gossip": "Mathias Becker in der Pizzeria! Der schreit den ganzen Tag durch die offene Küchentür. Völlig undiszipliniert!",

    # 8. NPC Nico (Hostel Buddy)
    "npc_nico_intro": "Geh zu Kruma Express! Nina sucht immer schnelle Fahrradkuriere. Du verdienst gutes Geld für die Miete und den Semesterbeitrag!",
    "npc_nico_status": "Du hast nur achtundzwanzig Tage für dein Visum. Wir schaffen das zusammen!",
    "npc_nico_tips": "Merke dir drei Dinge: Erstens, sei immer pünktlich. Zweitens, trenne den Müll genau. Drittens, Hans Lokker hört jeden Schritt ab zweiundzwanzig Uhr!",

    # 9. NPC Herr Vogel (Bürgeramt)
    "npc_vogel_intro": "Sie möchten Ihren Wohnsitz anmelden? Zeigen Sie mir Ihren Pass und die Wohnungsgeberbestätigung des Vermieters.",
    "npc_vogel_status": "Bürgeramt Lübeck. Bitte halten Sie Ihre Unterlagen bereit.",
    "npc_vogel_success": "Ordnungsgemäß registriert! Hier ist Ihre Meldebescheinigung. Gehen Sie nun zur Sparkasse, um Ihr Sperrkonto freizuschalten!",
    "npc_vogel_trivia": "Ein herrlich präzises deutsches Substantiv! Es ist das offizielle Dokument, mit dem Ihr Vermieter bestätigt, dass Sie tatsächlich eingezogen sind. Ohne dieses Formular existieren Sie für das Bürgeramt quasi nicht!",

    # 10. NPC Frau Weber (Sparkasse Bank)
    "npc_weber_intro": "Sie haben sowohl die Immatrikulationsbescheinigung als auch die Meldebescheinigung dabei! Sollen wir Ihr Girokonto eröffnen und das Sperrkonto freischalten?",
    "npc_weber_status": "Willkommen bei der Sparkasse Lübeck. Ihr Girokonto ist aktiv.",
    "npc_weber_success": "Ihr deutsches Girokonto ist nun freigeschaltet! Die erste Monatsrate von fünfzig Euro wurde überwiesen. Nun können Sie Ihren Visumsantrag bei Frau Dr. Lindemann stellen!",

    # 11. NPC Frau Dr. Lindemann (Ausländerbehörde)
    "npc_lindemann_intro": "Guten Tag. Ihr achtundzwanzig Tage Visum läuft ab. Beeilen Sie sich!",
    "npc_lindemann_success": "Alle Unterlagen sind vollständig! Ihr dauerhafter Aufenthaltstitel für das Studium ist bewilligt!",

    # 12. Player Option Choices (Spoken in clear learner pace)
    "opt_verstanden": "Verstanden! Ich suche mir sofort Arbeit.",
    "opt_uni_bekannt": "Wofür ist diese Universität bekannt?",
    "opt_bewohner": "Was halten Sie von den anderen Bewohnern?",
    "opt_auf_wiedersehen": "Auf Wiedersehen!",
    "opt_pizza_kauf": "Eine Pizza Margherita, bitte!",
    "opt_pizza_crust": "Was macht Ihren Pizzateig so knusprig?",
    "opt_brot_kauf": "Ein frisches Sauerteigbrot, bitte!",
    "opt_brot_life": "Wie lange leben Sie schon in Lübeck?",
    "opt_schicht_start": "Ja! Ich bin startklar für die Schicht!",
    "opt_tips_nina": "Hast du Tipps für schnellere Lieferungen?",
    "opt_wg_zimmer": "Ich gehe in mein WG-Zimmer.",
    "opt_anmeldung": "Hier sind meine Unterlagen!",
    "opt_sperrkonto": "Ja, bitte eröffnen Sie mein Bankkonto!",

    # 13. Delivery Scenarios
    "delivery_1": "Guten Tag, Herr Müller. Ihre Lieferung von Kruma.",
    "delivery_2": "Entschuldigen Sie bitte die Verspätung. Guten Appetit!",
    "delivery_3": "Guten Abend. Ich bringe die bestellte Lieferung für Station drei."
}

audio_sprites = {}
tmp_wav_dir = r"c:\DeepakJadhav\Personal\FarFromHome\build\tmp_audio"
os.makedirs(tmp_wav_dir, exist_ok=True)

print(f"Synthesizing {len(triggers)} German speech lines with Piper (calm natural pace length_scale=1.28)...")

for key, text in triggers.items():
    wav_path = os.path.join(tmp_wav_dir, f"{key}.wav")
    print(f"Generating -> {key}: '{text}'")
    
    with wave.open(wav_path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2) # 16-bit PCM
        wav_file.setframerate(voice.config.sample_rate)
        for chunk in voice.synthesize(text, syn_config=calm_config):
            wav_file.writeframes(chunk.audio_int16_bytes)
    
    with open(wav_path, "rb") as f:
        wav_bytes = f.read()
        b64_str = base64.b64encode(wav_bytes).decode("ascii")
        audio_sprites[key] = f"data:audio/wav;base64,{b64_str}"

js_content = f"""// Pre-rendered Authentic German Neural Voice Sprites generated with Piper (Thorsten German Voice)
window.FFH = window.FFH || {{}};
window.FFH.voiceSprites = {json.dumps(audio_sprites, indent=2)};
"""

with open(output_js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"\nSUCCESS: Generated {len(audio_sprites)} calm neural German voice sprites in {output_js_path}")

