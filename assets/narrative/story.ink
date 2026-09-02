// Far From Home - Master Narrative Script in Ink Format
// Concise, Punchy, Human-Tone Version

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
Cold Baltic wind cuts through your light jacket. You have {wallet}€ cash left and a {days_left}-day visa.

Follow the street south to your student WG dorm.

*   [Walk South to the Student WG] -> wg_kitchen

=== wg_kitchen ===
You step into the warm hallway of the Student WG.
Nico is stirring instant coffee by the counter.

Nico: Hey! Welcome to Room 4. Put that heavy suitcase down! Here, take some warm coffee.

*   [Thanks Nico! Where can I drop my bags?] -> nico_drop_luggage
*   [What is the most important house rule here?] -> nico_house_rules

=== nico_drop_luggage ===
Nico: Room 4 is right down the hall. Just remember: Lokker is strict about Mülltrennung (Waste Sorting). Blue for paper, yellow for plastic, black for rest.
~ knows_muelltrennung = true

*   [Got it: Blue, yellow, and black.] -> explore_city_prompt
*   [Thanks Nico! You saved me from a landlord disaster.] -> explore_city_prompt

=== nico_house_rules ===
Nico: Mülltrennung (Waste Sorting). Blue for paper, yellow for plastic, black for rest. Follow that and you will be fine!
~ knows_muelltrennung = true

*   [I will explore the town and then visit the university.] -> explore_city_prompt

=== explore_city_prompt ===
Nico: Nice! Go take a stroll and explore Lübeck. Later, head across the bridge to University Admissions before it closes!

*   [Head out to explore the town] -> university_evening_arrival

=== university_evening_arrival ===
You cross the river bridge toward the University Admissions Office.
Dusk settles over the brick spires as street lanterns flicker to life.

Rita Schneider is packing her briefcase.

Rita Schneider: Guten Abend! Admissions closed at 17:00. Please come back tomorrow morning at 09:00 for your 250€ tuition matriculation.

*   [I will be here tomorrow at 09:00, Frau Schneider.] -> night_city_walk
*   [What should I bring tomorrow morning?] -> night_city_walk

=== night_city_walk ===
Rita Schneider: Get some rest in your room tonight. Tomorrow our work begins!

The night air is crisp. Amber lanterns reflect off the canal waters.

*   [Return to Room 4 to sleep until morning] -> wg_morning_tag2

=== wg_morning_tag2 ===
~ current_day = 2
You wake up in Room 4 as morning sunlight streams through the window.
Freshness restored to 100%. Tag {current_day} begins.

*   [Visit Rita Schneider at University Admissions] -> rita_day2_enrollment
*   [Visit Kruma Express to start Courier Shifts] -> kruma_shifts
*   [Visit Pizzeria Vesuvio to meet Mathias Becker] -> pizzeria_mathias
*   [Visit Bakery Hansa to meet Oma Martha] -> bakery_martha

=== rita_day2_enrollment ===
Rita Schneider: Guten Tag! Ready to pay your 250€ tuition and get enrolled?

*   [I only have 20€ left, heading to courier work.] -> kruma_shifts
*   [What documents do I need to prepare?] -> rita_checklist

=== rita_checklist ===
Rita Schneider: Four documents: University Matriculation (250€), Housing Lease (Lokker), City Registration (Vogel), and Bank Account (Weber).

*   [Understood! Back to work.] -> wg_morning_tag2

=== kruma_shifts ===
Nina Lindemann: Moin! Fast deliveries, cold wind, instant pay. Ready for a shift?

*   [Start Standard Shift] -> shift_done
*   [Take VIP Express Rush (High Tips)] -> shift_done

=== shift_done ===
~ wallet = wallet + 45.0
Shift complete! You earned cash. Current wallet: {wallet}€.

*   [Return to City Streets] -> wg_morning_tag2

=== pizzeria_mathias ===
Herr Mathias Becker: Moin! I came from Naples thirty years ago with empty pockets. Never let the cold weather beat you, kid.

*   [How did you survive those first years in Germany?] -> mathias_story
*   [Can I buy a hot pizza slice? (8€)]
    ~ wallet = wallet - 8.0
    -> wg_morning_tag2

=== mathias_story ===
Mathias: I washed dishes at night and fixed bike chains by day! Keep your head up.

*   [Back to the streets] -> wg_morning_tag2

=== bakery_martha ===
Oma Martha Webber: Hello dear! Come warm up by the oven. You look freezing.

*   [Frau Schneider told me to visit you.] -> martha_advice
*   [Can I buy a warm butter croissant for Herr Lokker? (2€)]
    ~ wallet = wallet - 2.0
    ~ has_croissant = true
    -> martha_croissant

=== martha_advice ===
Martha: As long as my oven burns, you will never go hungry in this town.

*   [Back to the streets] -> wg_morning_tag2

=== martha_croissant ===
Martha: How sweet! Hans Lokker is strict, but warm butter softens him right up.

*   [Deliver croissant to Herr Lokker at WG Dorm] -> lokker_lease

=== lokker_lease ===
Herr Hans Lokker sniffs the warm croissant with a grin.
~ has_room = true

Lokker: A warm croissant and the 30€ deposit! Here is your signed lease confirmation for the Bürgeramt.

*   [Take signed lease to Herr Vogel at City Hall] -> rathaus_vogel

=== rathaus_vogel ===
Herr Vogel inspects your passport and lease. *STAMP!*
~ has_anmeldung = true

Vogel: You are officially registered in Lübeck! Take this to Sparkasse Bank.

*   [Visit Frau Weber at Sparkasse Bank] -> sparkasse_weber

=== sparkasse_weber ===
Frau Weber activates your checking account.
~ has_sperrkonto = true
~ wallet = wallet + 50.0

Weber: Your account is active and 50.00€ is disbursed! All four documents are ready for Dr. Lindemann.

*   [Visit Immigration Authority] -> immigration_climax

=== immigration_climax ===
Dr. Lindemann reviews your completed dossier:
Matriculation (250€), Lease (Lokker), Registration (Vogel), and Bank (Weber).

Dr. Lindemann: Your file is flawless. Ready for your official Residence Permit (§16b)?

*   [Yes! Submit my completed dossier.] -> victory

=== victory ===
*STAMP!*
Aufenthaltstitel (§16b) Approved!
You survived the first month in Germany, earned your tuition, and secured your future in Lübeck.
-> END
