// Far From Home - Master Narrative Script in Ink Format
// Compatible with Inky editor and Inklewriter

VAR wallet = 20.0
VAR days_left = 28
VAR current_day = 1
VAR has_room = false
VAR has_anmeldung = false
VAR has_matriculation = false
VAR has_sperrkonto = false
VAR knows_muelltrennung = false
VAR has_croissant = false

-> zob_arrival

=== zob_arrival ===
Lübeck Central Station (ZOB).
Cold Baltic wind cuts through your light jacket. You have {wallet}€ cash left, a heavy suitcase in hand, and a {days_left}-day temporary entry visa.

Your immediate objective: Follow the street south to your student WG sublet to drop your luggage.

*   [Walk South toward the Student WG Dorm] -> wg_kitchen

=== wg_kitchen ===
You step into the warm hallway of the Student WG.
A friendly young man in an oversized hoodie is stirring instant coffee on the kitchen counter.

Nico: Hey! You must be the new roommate moving into Room 4. Put that heavy suitcase down on the rug! I am Nico from Brazil, 3rd semester computer science. You look completely frozen from that Baltic wind. Here, take half a mug of warm instant coffee.

*   [Thanks Nico! I just walked from the station. Where can I drop my luggage?] -> nico_drop_luggage
*   [Pleased to meet you, Nico! What is the most important house rule here?] -> nico_house_rules

=== nico_drop_luggage ===
Nico: Room 4 is right down the hall! Drop your coat on the bed. In this house, Caretaker Lokker is obsessed with one big rule: Mülltrennung (Waste Sorting). Blue bin for paper, yellow bag for plastic packaging, black bin for household rest. Never mix them up!
~ knows_muelltrennung = true

*   [Got it: Blue for paper, yellow for plastic, black for rest.] -> explore_city_prompt
*   [Thanks Nico! You just saved me from a landlord disaster.] -> explore_city_prompt

=== nico_house_rules ===
Nico: Set your bags down in Room 4! The number one rule is Mülltrennung (Trash Sorting). Blue bin for paper, yellow bag for plastic packaging, black bin for household rest. Follow that and Lokker will leave you alone!
~ knows_muelltrennung = true

*   [Understood! I will explore the city first and then find Rita at the university.] -> explore_city_prompt

=== explore_city_prompt ===
Nico: Awesome! Go take a stroll, explore the historic cobblestone streets of Lübeck and cross the bridges. Later on, head across the bridge to the University Campus to register with Rita Schneider before the office closes!

*   [Head out to explore the historic streets of Lübeck] -> university_evening_arrival

=== university_evening_arrival ===
You cross the river bridge toward the University Admissions Office.
As you reach the building, dusk settles over the brick spires and the street lanterns flicker to life.

Inside the admissions office, Rita Schneider is packing her briefcase and wrapping a warm wool scarf around her neck.

Rita Schneider: Guten Abend! You must be the new international applicant. Unfortunately, official admissions office hours ended at 17:00. The registry is closed for the night, so you must return tomorrow morning at 09:00 for your 250€ tuition matriculation.

*   [Ah, I explored the town too long! I will return first thing tomorrow morning.] -> night_city_walk
*   [Good evening Frau Schneider. What documents should I prepare for tomorrow?] -> night_city_walk

=== night_city_walk ===
Rita Schneider: Don't worry, that is normal on your first day. Take a quiet evening walk, enjoy the glowing street lanterns and canal reflections, and rest in your WG room. Tomorrow our work begins!

The night air is crisp. Warm amber light reflects off the wet cobblestones and canal waters.

*   [Return to WG Dorm Room 4 to sleep until morning] -> wg_morning_tag2

=== wg_morning_tag2 ===
~ current_day = 2
You wake up in Room 4 as golden morning sunlight streams through the window.
Freshness restored to 100%. Tag {current_day} begins.

Now you can visit Rita Schneider at the University to begin your tuition journey and find work at Kruma Express or Pizzeria Vesuvio.

*   [Visit Rita Schneider at University Admissions] -> rita_day2_enrollment
*   [Visit Kruma Express to start Courier Shifts] -> kruma_shifts
*   [Visit Pizzeria Vesuvio to meet Mathias Becker] -> pizzeria_mathias
*   [Visit Bakery Hansa to meet Oma Martha] -> bakery_martha

=== rita_day2_enrollment ===
Rita Schneider: Guten Tag! Welcome back. To officially stamp your Immatrikulationsbescheinigung, we need to clear your 250€ tuition fee. How are you situated financially?

*   [I only have 20€ left, so I must start courier shifts immediately.] -> kruma_shifts
*   [What documents do I need to prepare alongside tuition?] -> rita_checklist

=== rita_checklist ===
Rita Schneider: You need 4 core documents: 1) University Matriculation (250€), 2) Housing Lease from Herr Lokker, 3) City Registration (Anmeldung) from Herr Vogel at City Hall, and 4) Blocked Bank Account unblocked by Frau Weber at Sparkasse.

*   [Understood! I will start earning and gathering the papers.] -> wg_morning_tag2

=== kruma_shifts ===
Nina Lindemann at Kruma Express: Moin! Fasten your thermal bag tight. Sort items by German gender (der/die/das) on the shelves to pack orders quickly!

*   [Start Standard Shift] -> shift_done
*   [Take VIP Express Rush for higher tips] -> shift_done

=== shift_done ===
~ wallet = wallet + 45.0
You completed your delivery run and earned cash! Current wallet: {wallet}€.

*   [Return to City Streets] -> wg_morning_tag2

=== pizzeria_mathias ===
Herr Mathias Becker: Moin! Thirty years ago I arrived from Naples with empty pockets. Never let this cold weather freeze your spirit, kid!

*   [How did you survive those first years in Germany?] -> mathias_story
*   [Can I buy a fresh hot Margherita slice? (8€)]
    ~ wallet = wallet - 8.0
    -> wg_morning_tag2

=== mathias_story ===
Mathias: I washed dishes at night and fixed bike chains during the day! Keep your head high and ride hard.

*   [Back to the streets] -> wg_morning_tag2

=== bakery_martha ===
Oma Martha Webber: Welcome, child! Come close to the warm oven. My family has baked sourdough here since 1952.

*   [Frau Schneider told me to visit you.] -> martha_advice
*   [Can I buy a warm butter croissant for Herr Lokker? (2€)]
    ~ wallet = wallet - 2.0
    ~ has_croissant = true
    -> martha_croissant

=== martha_advice ===
Martha: As long as my oven burns, you will never be alone in this town!

*   [Back to the streets] -> wg_morning_tag2

=== martha_croissant ===
Martha packs a warm butter croissant in brown wax paper.
Hans Lokker acts stern, but butter pastry melts his defenses in seconds!

*   [Deliver croissant to Herr Lokker at WG Dorm] -> lokker_lease

=== lokker_lease ===
Herr Hans Lokker sniffs the warm butter aroma with genuine delight.
~ has_room = true

Lokker: A warm croissant from Martha AND the 30€ deposit?! You have manners and discipline. Here is your signed Wohnungsgeberbestätigung for the Bürgeramt!

*   [Take signed lease to Herr Vogel at City Hall] -> rathaus_vogel

=== rathaus_vogel ===
Herr Vogel at the Bürgeramt inspects your passport and signed lease from Herr Lokker.
*THUD* He applies the double circular city seal!
~ has_anmeldung = true

Vogel: Impeccable. You are officially registered in Lübeck! Take this Meldebescheinigung to Sparkasse Bank.

*   [Visit Frau Weber at Sparkasse Bank] -> sparkasse_weber

=== sparkasse_weber ===
Frau Weber inspects your University Matriculation and City Registration.
~ has_sperrkonto = true
~ wallet = wallet + 50.0

Weber: Your Sperrkonto blocked account is officially activated! First 50.00€ monthly allowance disbursed.

*   [Prepare final dossier for Immigration Authority] -> immigration_climax

=== immigration_climax ===
Dr. Lindemann at the Ausländerbehörde inspects your completed 4-document dossier:
Matriculation (250€), Lease (Lokker), City Registration (Vogel), and Bank Account (Weber).

Dr. Lindemann: You navigated the German administrative maze with flawless integrity. Are you ready to receive your permanent Residence Permit?

*   [Yes! I submit my completed dossier for the official Aufenthaltstitel!] -> victory

=== victory ===
*STAMP!*
Aufenthaltstitel (§16b) Granted!
You survived the first month in Germany, earned your tuition, made lifelong friends, and secured your future in Lübeck.
-> END
