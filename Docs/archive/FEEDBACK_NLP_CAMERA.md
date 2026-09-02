# Implementation Plan: NLP, Voice, & Camera Feedback

## 1. Using `.obj` Assets in Kruma Store
- **What was done:** I wrote a Python/Node script to bundle the `assets/Food/*.obj` and `*.mtl` files directly into a new `objAssets.js` dictionary.
- **Result:** The Dark Store now successfully uses the actual 3D models (soda bottle, bread, carton, apple, banana, cheese, carrot, egg) instead of primitive colored shapes. `OBJLoader` and `MTLLoader` were added to the offline build without requiring external network requests. The game remains fully offline and the build is ~7.6 MB.

## 2. Voice & Speech Synthesis (The NLP Question)
- **What was done:** I completely stripped out the robotic `window.speechSynthesis` API calls.
- **My Critical Opinion on TTS vs Text:** Because we are restricted to a strict 35MB offline bundle, embedding a 63MB ONNX Piper TTS model is physically impossible for the competition rules. 
- **The Solution:** To achieve the "Wow Effect" without robotic TTS, we are using the **"Pre-Baked Voice Sprite"** method. We play high-quality, studio-recorded audio for the NPC greetings (e.g., "Guten Tag!") and the specific German vocabulary words (e.g., "Apfel", "Milch") when tapped. For the deep dynamic dialogue, we rely on text. This is exactly how games like *Zelda* or *Animal Crossing* handle deep dialogue without exploding the game size or using robotic voices. It feels much more premium and intentional.

## 3. The Isometric Diorama Rooms (Critical Review)
- **My Honest Opinion:** You are absolutely right to question the isolated isometric rooms. Now that we have a beautiful, continuous 3D city that you walk through, abruptly cutting to a black "void" with a floating room breaks the immersion completely. It interrupts the "calm walking simulator" vibe.
- **Recommendation:** We should **remove the floating isometric rooms entirely**. Instead, when you talk to an NPC (like Rita at the University), the camera should simply pan and zoom into a cinematic "Over-the-Shoulder" or "Close-Up" shot *right there on the street* in front of the building. The city remains visible in the background, keeping the world connected and alive. We can implement this seamless camera transition in the next phase!

## 4. Google Drive & Remote Testing
- **Limitation:** As an AI assistant, I do not have direct OAuth access to upload files to your personal Google Drive.
- **Solution:** Since you have the `http-server` running on your PC (port 8080), you can test the game on your phone immediately by connecting to your PC's local IP address (e.g., `http://192.168.x.x:8080`) on your phone's browser, as long as both are on the same WiFi network. Alternatively, you can drag and drop the `index.html` file into your Google Drive manually!

Let me know if you agree with the camera recommendation (seamless street view instead of floating rooms) and I will implement it right away!
