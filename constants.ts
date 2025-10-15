
import type { InstrumentPreset, InstrumentTheory, NotationSystem } from "./types";

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const NOTATION_MAPS: Record<NotationSystem, readonly string[]> = {
    'English': NOTE_NAMES_SHARP,
    'Solfege (Fixed Do)': ['Do', 'Di/Ra', 'Re', 'Ri/Me', 'Mi', 'Fa', 'Fi/Se', 'So', 'Si/Le', 'La', 'Li/Te', 'Ti'],
    'Northern European': ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'Ais', 'H'],
};


export const PRESET_CONFIGS: Record<InstrumentPreset, { minFreq: number; maxFreq: number }> = {
    // Plucked Strings
    'Guitar': { minFreq: 70, maxFreq: 1400 },
    'Bass (4-String)': { minFreq: 35, maxFreq: 450 },
    'Ukulele': { minFreq: 250, maxFreq: 500 },
    // Bowed Strings
    'Violin': { minFreq: 180, maxFreq: 4000 },
    'Viola': { minFreq: 125, maxFreq: 1500 },
    'Cello': { minFreq: 60, maxFreq: 950 },
    'Double Bass': { minFreq: 35, maxFreq: 250 },
    // Keyboards
    'Piano': { minFreq: 25, maxFreq: 4200 },
    // Woodwinds
    'Flute': { minFreq: 250, maxFreq: 2200 },
    'Clarinet (Bb)': { minFreq: 140, maxFreq: 1700 },
    'Saxophone (Alto)': { minFreq: 130, maxFreq: 900 },
    // Brass
    'Trumpet (Bb)': { minFreq: 160, maxFreq: 1000 },
    'Trombone': { minFreq: 75, maxFreq: 750 },
    'Tuba': { minFreq: 35, maxFreq: 400 },
    // Voice
    'Voice (General)': { minFreq: 80, maxFreq: 1100 },
    // General
    'Chromatic': { minFreq: 16, maxFreq: 4200 }, // C0 to C8
    'Hz (Manual)': { minFreq: 20, maxFreq: 5000 },
};

export const PRESET_CATEGORIES: { category: string; instruments: InstrumentPreset[] }[] = [
    {
        category: 'General',
        instruments: ['Chromatic', 'Hz (Manual)']
    },
    {
        category: 'Plucked Strings',
        instruments: ['Guitar', 'Bass (4-String)', 'Ukulele']
    },
    {
        category: 'Bowed Strings',
        instruments: ['Violin', 'Viola', 'Cello', 'Double Bass']
    },
    {
        category: 'Keyboards',
        instruments: ['Piano']
    },
    {
        category: 'Woodwinds',
        instruments: ['Flute', 'Clarinet (Bb)', 'Saxophone (Alto)']
    },
    {
        category: 'Brass',
        instruments: ['Trumpet (Bb)', 'Trombone', 'Tuba']
    },
    {
        category: 'Voice',
        instruments: ['Voice (General)']
    }
];


export const GUITAR_STANDARD_TUNING = [64, 59, 55, 50, 45, 40]; // E4, B3, G3, D3, A2, E2 (high to low)

export const THEORY_CONTENT: Record<InstrumentPreset, InstrumentTheory> = {
    'Hz (Manual)': {
        scales: [],
        commonChords: [],
        uniqueConcepts: [{ title: 'Manual Frequency (Hz) Mode', content: 'This advanced mode allows you to tune to a specific frequency instead of a standard musical note.\n\nSet a target frequency in the Settings panel, and the tuner gauge will show how close your instrument\'s pitch is to that exact frequency.\n\nThis is useful for:\n- Tuning to non-standard pitches.\n- Scientific analysis of sound sources.\n- Matching the pitch of an acoustic instrument that cannot be easily retuned.' }]
    },
    'Chromatic': {
        scales: [],
        commonChords: [],
        uniqueConcepts: [{ title: 'Chromatic Tuner Mode', content: 'Use this mode for any instrument. It detects all 12 notes of the chromatic scale over a wide range from C0 to C8.' }]
    },
    'Guitar': {
        scales: [
            { name: 'A Minor Pentatonic', description: 'The most common scale for rock and blues solos. Position 1 at the 5th fret.', notes: ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4'] },
            { name: 'C Major Scale (Open)', description: 'A foundational scale. The open position is great for folk and pop.', notes: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
            { name: 'E Blues Scale', description: 'The E minor pentatonic with an added "blue note" (B♭). Essential for blues lead playing.', notes: ['E2', 'G2', 'A2', 'A#2', 'B2', 'D3', 'E3'] },
        ],
        commonChords: [
            { name: 'G Major (Open)', notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'], positions: [{string: 6, fret: 3}, {string: 5, fret: 2}, {string: 4, fret: 'o'}, {string: 3, fret: 'o'}, {string: 2, fret: 'o'}, {string: 1, fret: 3}] },
            { name: 'C Major (Open)', notes: ['C3', 'E3', 'G3', 'C4', 'E4'], positions: [{string: 6, fret: 'x'}, {string: 5, fret: 3}, {string: 4, fret: 2}, {string: 3, fret: 'o'}, {string: 2, fret: 1}, {string: 1, fret: 'o'}] },
            { name: 'E Minor (Open)', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'], positions: [{string: 6, fret: 'o'}, {string: 5, fret: 2}, {string: 4, fret: 2}, {string: 3, fret: 'o'}, {string: 2, fret: 'o'}, {string: 1, fret: 'o'}] },
            { name: 'F Major (Barre)', notes: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'], positions: [{string: 6, fret: 1}, {string: 5, fret: 3}, {string: 4, fret: 3}, {string: 3, fret: 2}, {string: 2, fret: 1}, {string: 1, fret: 1}] },
        ],
        uniqueConcepts: [
             { 
                title: '🎸 Beginner: Your First Steps', 
                content: `**Welcome to the Guitar!** A versatile instrument central to countless genres.
                
**Parts of the Guitar:**
- **Headstock:** Holds the tuners.
- **Tuners:** Adjust the pitch of the strings.
- **Nut:** Guides the strings onto the fretboard.
- **Fretboard/Neck:** Where you press down on strings. Frets are the metal strips.
- **Body:** Resonates and projects the sound.
- **Bridge:** Holds the strings at the body end.
- **Pickups (Electric) / Soundhole (Acoustic):** Where sound is captured or projected.

**How to Read Tablature (TAB):**
TAB is a simple map of the fretboard. The 6 lines represent your strings.
e|---------------------------------| (Thinnest string, 1st)
B|---------------------------------|
G|---------------------------------|
D|---------------------------------|
A|---------------------------------|
E|---------------------------------| (Thickest string, 6th)

Numbers on the lines are frets. '0' is an open string, 'x' is a muted string.`
            },
            {
                title: 'Intermediate: Beyond the Basics',
                content: `**Barre Chords:** Essential for playing in any key. Use your index finger to press multiple strings at one fret, like a movable capo. The two main shapes are based on open E and A chords. An "F Major" chord is an E shape barred at the 1st fret.

**Power Chords:** A simple two or three-note chord (root and fifth) used heavily in rock music. They are movable and easy to play fast.

**Strumming Patterns:** Go beyond simple down-strums. A common pattern is:
*Down, Down-Up, -, Up-Down-Up*`
            },
            { 
                title: 'Advanced: Lead Techniques & Theory', 
                content: `**Lead Techniques:**
- **Hammer-on:** Pick a note, then "hammer" another finger onto a higher fret on the same string.
- **Pull-off:** The opposite. Pick a fretted note, then pull the finger off to sound a lower note.
- **Bend:** Push or pull a string to raise its pitch.
- **Vibrato:** Rapidly bending and releasing a note for a singing quality.

**Music Theory:**
- **Modes:** Playing the major scale starting from different notes creates different moods (e.g., Dorian for funk/jazz, Mixolydian for blues/rock).
- **Circle of Fifths:** A visual tool to understand key signatures and how chords relate to each other.`
            },
        ]
    },
    'Piano': {
        scales: [
            { name: 'C Major', description: 'The simplest scale, using only white keys, starting on C.', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
            { name: 'G Major', description: 'This scale has one sharp (F#).', notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'] },
            { name: 'A Harmonic Minor', description: 'A minor scale with a raised 7th degree, giving it a distinctive, dramatic sound.', notes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4']},
        ],
        commonChords: [
            { name: 'C Major Triad', notes: ['C4', 'E4', 'G4'] },
            { name: 'G Major Triad', notes: ['G4', 'B4', 'D5'] },
            { name: 'A Minor Triad', notes: ['A3', 'C4', 'E4']},
            { name: 'C Major 7th', notes: ['C4', 'E4', 'G4', 'B4']},
        ],
        uniqueConcepts: [
            {
                title: '🎹 Beginner: Getting Started',
                content: `The piano's visual layout makes it one of the best instruments for learning music theory.
                
**The Keyboard:**
- **White Keys:** Named A, B, C, D, E, F, G.
- **Black Keys:** Sharps (♯) or flats (♭). C♯ is the same key as D♭.
- **Middle C (C4):** The central reference point on the keyboard.

**The Grand Staff:**
Piano music uses the grand staff, which joins the **treble clef** (usually right hand) and **bass clef** (usually left hand).

**Proper Posture:**
Sit centered, with a straight but relaxed back. Your forearms should be parallel to the floor, and your fingers curved naturally on the keys.`
            },
             {
                title: 'Intermediate: Harmony and Technique',
                content: `**Chord Inversions:** Rearranging the notes of a chord so the root isn't the lowest note. This creates smoother transitions between chords (voice leading).
- **Root Position:** C-E-G
- **First Inversion:** E-G-C
- **Second Inversion:** G-C-E

**Key Signatures:** The sharps or flats at the beginning of the music tell you which black keys to play consistently. Learning the **Circle of Fifths** helps memorize these.

**Seventh Chords:** Adding a fourth note to a triad creates a richer sound. Major 7th (C-E-G-B) and Dominant 7th (C-E-G-B♭) chords are fundamental in pop and jazz.`
            },
            { 
                title: 'Advanced: Expressive Playing', 
                content: `**Pedal Technique:**
- **Damper/Sustain Pedal (Right):** Lifts dampers, letting notes ring out. Used to connect notes and create a rich, resonant sound. Mastering its use (clearing the pedal at the right time) is crucial.
- **Soft Pedal / Una Corda (Left):** Creates a softer, more muted tone.
- **Sostenuto Pedal (Middle):** Sustains only the notes held down *before* the pedal is pressed.

**Dynamics and Articulation:**
Go beyond just playing the right notes. Pay attention to dynamics (how loud or soft, e.g., *piano*, *forte*) and articulation (how notes are connected, e.g., *legato* for smooth, *staccato* for detached).`
            },
        ]
    },
    'Bass (4-String)': { 
        scales: [
            { name: 'C Major Scale', description: 'A foundational scale. Practice starting on the 3rd fret of the A string.', notes: ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3'] },
            { name: 'A Minor Pentatonic', description: 'A versatile scale for rock, blues, and funk basslines. The root is on the 5th fret of the E string.', notes: ['A1', 'C2', 'D2', 'E2', 'G2', 'A2'] },
        ], 
        commonChords: [
            { name: 'C Major Arpeggio', notes: ['C2', 'E2', 'G2'] },
            { name: 'G Major Arpeggio', notes: ['G1', 'B1', 'D2'] },
            { name: 'A Minor Arpeggio', notes: ['A1', 'C2', 'E2'] },
        ], 
        uniqueConcepts: [
            { 
                title: '🎸 Beginner: The Foundation', 
                content: `The bass provides the rhythmic and harmonic foundation of the band. Your job is to connect the drums and the guitars/keyboards.

**Standard Tuning:** E-A-D-G (thickest to thinnest string), an octave lower than the first four strings of a guitar.

**Basic Technique:**
- **Fingerstyle:** Use your index and middle fingers to alternate plucking the strings for a round tone. Rest your thumb on a pickup or the E string.
- **Role:** Start by playing the **root note** of each chord on the first beat of the measure. Lock in with the drummer's kick drum.`
            },
            {
                title: 'Intermediate: Creating Basslines',
                content: `**Walking Basslines:** A continuous sequence of notes, usually one per beat, that outlines the chord progression and creates forward motion. A simple formula for a 4/4 measure is:
1. **Root** on beat 1.
2. A chord tone (**3rd or 5th**) on beat 2.
3. Another chord tone or scale note on beat 3.
4. A **passing tone** on beat 4 that leads smoothly to the next chord's root.

**Arpeggios:** Playing the notes of a chord one by one. This is a core bass technique for outlining the harmony.`
            },
            {
                title: 'Advanced: Rhythmic Techniques',
                content: `**Slap Bass:** A percussive style popular in funk.
- **Slap:** Use the bony side of your thumb to strike a low string (E or A) against the frets.
- **Pop:** Use your index or middle finger to pluck and release a high string (D or G) so it snaps back against the fretboard.

**Ghost Notes:** Mute the strings with your fretting hand and pluck to create a percussive, rhythmic "thud" with no specific pitch. This adds groove and feel to your basslines.`
            }
        ] 
    },
    'Ukulele': { 
        scales: [
            { name: 'C Major Scale', description: 'A very common and easy first scale on the ukulele.', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
            { name: 'A Minor Pentatonic', description: 'Great for simple solos and riffs.', notes: ['A4', 'C5', 'D5', 'E5', 'G5'] },
        ], 
        commonChords: [
            { name: 'C Major', notes: ['G4', 'C4', 'E4', 'C5'] },
            { name: 'G Major', notes: ['G4', 'B3', 'D4', 'G4'] },
            { name: 'Am', notes: ['G4', 'C4', 'E4', 'A4'] },
            { name: 'F Major', notes: ['G4', 'C4', 'F4', 'A4'] },
        ], 
        uniqueConcepts: [
            {
                title: '🎵 Beginner: The Basics',
                content: `The ukulele has a bright, cheerful sound and is very beginner-friendly.

**Standard Tuning:** G-C-E-A. The G string is tuned *higher* than the C string ("re-entrant" tuning), giving the uke its classic sound.

**First Chords:** Many songs use just four chords: C, G, Am, and F. Mastering the smooth transition between these is your first big goal.

**Basic Strumming:** Use your index finger or a pick. Start with simple down strums on each beat. Then, try a "Down, Down-Up, Down, Down-Up" pattern.`
            },
            {
                title: 'Intermediate: Improving Your Groove',
                content: `**Strumming Patterns:** A very common and versatile pattern is **"Down - Down-Up - Up - Down-Up"**. Practice this slowly, keeping your wrist relaxed.

**Chucking/Chunking:** A percussive technique where you mute the strings with the palm of your hand as you strum, creating a "chuck" sound. This adds rhythm and is great for percussive styles.

**Fingerpicking:** Use your thumb, index, and middle fingers to play individual strings, creating arpeggiated patterns.`
            },
            {
                title: 'Advanced: Expressive Techniques',
                content: `**Movable Chords:** Learn chord shapes (like barre chords on guitar) that you can move up and down the neck to play in any key.
                
**Low-G Tuning:** Some players replace the high G string with a low G string (tuned an octave lower). This gives the ukulele a fuller sound and extends its range, making it better for soloing and complex arrangements.

**Harmonics:** Lightly touch a string directly above the 12th, 7th, or 5th fret wire and pluck it to produce a bell-like chime.`
            }
        ] 
    },
    'Violin': { 
        scales: [
             { name: 'D Major Scale (One Octave)', description: 'A common beginner scale starting on the open D string.', notes: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'] },
             { name: 'G Major Scale (Two Octaves)', description: 'A fundamental scale for intermediate players, requiring shifting.', notes: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'] },
        ], 
        commonChords: [], 
        uniqueConcepts: [
            {
                title: '🎻 Beginner: First Position & Bowing',
                content: `The violin is known for its brilliant and expressive tone. Since it has no frets, developing good intonation (playing in tune) is key.

**Standard Tuning:** G-D-A-E, in perfect fifths, from lowest to highest string.

**Posture and Bow Hold:**
- Hold the violin between your shoulder (with a shoulder rest) and your chin.
- The bow hold ("bow grip") should be relaxed and flexible.
- Produce sound by drawing the bow straight across the strings, parallel to the bridge.

**First Position:** Learning where to place your fingers on each string without moving your hand up or down the neck.`
            },
            {
                title: 'Intermediate: Shifting and Vibrato',
                content: `**Vibrato:** A slight and rapid fluctuation in pitch that adds warmth and expression. It's produced by a rocking motion of the fretting finger, originating from the wrist or arm.

**Shifting:** Moving your entire hand to a new location on the fingerboard to play higher notes. Shifting from 1st to 3rd position is a common first step.

**Bowing Techniques:**
- **Legato:** Smooth and connected bowing.
- **Staccato:** Short, detached notes.
- **Détaché:** Broad but separate bow strokes.`
            },
            {
                title: 'Advanced: Articulation and Harmony',
                content: `**Advanced Bowing:**
- **Spiccato:** A light, bouncing bow stroke for fast, crisp notes.
- **Sautillé:** A very fast, uncontrolled bouncing stroke that comes from the wrist's flexibility.
- **Ricochet:** Throwing the bow at the string and letting it bounce several times.

**Double Stops:** Playing notes on two adjacent strings at the same time to create harmony. This requires precise finger placement and bow control.`
            }
        ] 
    },
    'Viola': { 
        scales: [
            { name: 'C Major Scale (One Octave)', description: 'A common beginner scale starting on the open C string.', notes: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
        ], 
        commonChords: [], 
        uniqueConcepts: [
            {
                title: '🎼 Beginner: The Alto Voice',
                content: `The viola is slightly larger than the violin with a deeper, mellower tone.

**Standard Tuning:** C-G-D-A, a perfect fifth below the violin.

**Reading Alto Clef:** The viola's most unique feature! The center line of the alto clef staff is Middle C (C4). Learning to read this clef is the first major step for violists.

**Technique:** Bowing and holding are very similar to the violin, but everything is slightly larger and requires more space, especially between fingers.`
            },
            {
                title: 'Intermediate: Tone Production',
                content: `**Tone:** The viola's larger size and thicker strings require a slightly different approach to tone. You often need a bit more bow weight and a slower bow speed, especially on the low C string, to produce a full, resonant sound.
                
**Vibrato:** Like the violin, vibrato is essential for expressive playing. The slightly larger spacing on the viola may require a wider and slower vibrato motion.

**Shifting:** Shifting to higher positions (like 3rd position) is key to expanding your range beyond the basics.`
            },
            {
                title: 'Advanced: Orchestral Role',
                content: `**Tenor Clef:** For very high passages, viola music sometimes switches to the treble clef, but more commonly to the **tenor clef** (where the fourth line from the bottom is Middle C). This avoids using too many ledger lines.
                
**Harmonic Role:** In an orchestra, the viola often plays the inner harmonies, filling the gap between the violins and cellos. Understanding your harmonic function within the ensemble is a key advanced skill.`
            }
        ] 
    },
    'Cello': { 
        scales: [
            { name: 'G Major Scale (One Octave)', description: 'A common beginner scale starting on the open G string.', notes: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F#3', 'G3'] },
        ], 
        commonChords: [], 
        uniqueConcepts: [
            {
                title: '🎶 Beginner: Getting Seated',
                content: `The cello is known for its rich, warm tone, often compared to the human voice.

**Standard Tuning:** C-G-D-A, an octave below the viola.

**Posture:** You play the cello while seated. The instrument rests between your knees, supported by an adjustable endpin. Sit tall with a relaxed back.

**Fingering:** The spacing between notes is much wider than on a violin. In first position, the fingers are typically spread out to cover a whole step between the 1st and 2nd fingers, and another between the 3rd and 4th.`
            },
            {
                title: 'Intermediate: Expanding Your Range',
                content: `**Shifting:** Moving your hand up the fingerboard to play higher notes. A key intermediate skill is learning to shift smoothly and in tune.
                
**Extensions:** Briefly stretching your fingers (especially the first finger back) to reach notes outside the normal hand position without shifting.
                
**Tenor Clef:** As you begin playing higher, music for the cello often switches from bass clef to tenor clef to avoid excessive ledger lines. The fourth line from the bottom is Middle C.`
            },
            {
                title: 'Advanced: Thumb Position',
                content: `**Thumb Position:** This is the key to unlocking the upper register of the cello. The thumb is brought out from behind the neck and placed directly onto a string, acting like a movable nut or "zero fret." The other three fingers can then be used to play notes relative to the thumb. This technique is essential for solo and advanced orchestral playing.`
            }
        ] 
    },
    'Double Bass': { 
        scales: [
             { name: 'G Major Arpeggio', description: 'Outlining a G chord is a fundamental skill.', notes: ['G1', 'B1', 'D2'] },
        ], 
        commonChords: [], 
        uniqueConcepts: [
             {
                title: '🎵 Beginner: The Foundation',
                content: `The double bass provides the fundamental low notes for an orchestra and is the cornerstone of jazz, bluegrass, and rockabilly.

**Standard Tuning:** E-A-D-G, in fourths, like a bass guitar.

**Bowing (Arco):** There are two bow holds: **French** (overhand, like cello) and **German** (underhand). Bowing is common in orchestral music.

**Plucking (Pizzicato):** Plucking the strings is the primary technique in jazz. It creates a percussive, resonant tone.`
            },
            {
                title: 'Intermediate: Technique and Role',
                content: `**Positions:** Because the instrument is so large, the hand moves between positions to play different notes. The **Simandl method** is a common pedagogical approach that uses the 1st, 2nd, and 4th fingers in lower positions.
                
**Intonation:** Like other fretless strings, playing in tune is a constant challenge that requires careful listening and practice.
                
**Jazz Walking Basslines:** In jazz, the bass often plays a note on every beat (walking), outlining the chords and providing a rhythmic pulse. This is almost always played pizzicato.`
            },
            {
                title: 'Advanced: Upper Register and Soloing',
                content: `**Thumb Position:** Similar to the cello, the thumb comes over the fingerboard to act as a movable fret, allowing access to the high register for soloing and advanced passages.
                
**Soloing:** In jazz, bass solos often use a combination of arpeggios, scales, and rhythmic patterns. Developing a good "feel" and sense of time is just as important as playing the right notes.`
            }
        ] 
    },
    'Flute': { 
        scales: [
            { name: 'F Major Scale (One Octave)', description: 'A common beginner scale that establishes good fundamentals.', notes: ['F4','G4','A4','Bb4','C5','D5','E5','F5'] }
        ], 
        commonChords: [], 
        uniqueConcepts: [
            {
                title: '🌬️ Beginner: Making a Sound',
                content: `The flute produces sound from air flowing across an opening, much like blowing over a bottle. It has no reed.
                
**Embouchure:** This is how you shape your lips to direct a focused stream of air across the lip plate's hole. It's the most important fundamental skill.
- **Goal:** A clear, steady tone.
- **Practice:** Start with just the headjoint. Try to produce a clear pitch by rolling it towards and away from your lips.

**First Notes:** Beginners often start with B, A, and G in the first octave, as they require simple fingerings and stable airflow.`
            },
            {
                title: 'Intermediate: Articulation and Dynamics',
                content: `**Articulation:** How notes are started and separated.
- **Legato:** Smooth and connected.
- **Staccato:** Short and detached. This is achieved by using the tip of your tongue to briefly interrupt the airflow, as if saying the syllable "too" for each note.

**Dynamics:** Controlling the volume of your sound.
- Louder (*forte*): Use faster, more supported air.
- Softer (*piano*): Use slower, but still well-supported, air. Maintaining good tone at soft volumes is a key skill.`
            },
            {
                title: 'Advanced: Tone Color and Extended Techniques',
                content: `**Vibrato:** A gentle, regular pulse in the sound, used to add warmth and expression. Flute vibrato comes from the diaphragm and abdominal muscles, creating pulses in the air stream.
                
**Tone Color:** By changing the shape of your oral cavity (as if saying different vowels like "ee" or "oo") and adjusting your embouchure, you can change the timbre of the flute from bright and brilliant to dark and mellow.

**Extended Techniques:**
- **Flutter Tonguing:** Rolling an "R" sound with your tongue while playing.
- **Multiphonics:** Special fingerings that produce multiple notes at once.`
            }
        ] 
    },
    'Clarinet (Bb)': { 
        scales: [
            { name: 'C Major (Concert F)', description: 'One of the first scales learned, starting in the low register.', notes: ['C4','D4','E4','F4','G4','A4','B4'] }
        ], 
        commonChords: [], 
        uniqueConcepts: [
            {
                title: '🎼 Beginner: The Reed and The Break',
                content: `The clarinet is a single-reed woodwind with a rich, dark tone.
                
**Transposing Instrument:** The clarinet is typically in B♭. This means when you play a written C, the actual pitch that sounds is a B♭. Music is written in a different key to compensate.
                
**Embouchure:** The top teeth rest on the mouthpiece, while the bottom lip is curled over the teeth to provide a cushion for the vibrating reed.

**Crossing the Break:** The most challenging early technique is moving smoothly from the lower register (Chalumeau) to the upper register (Clarion). This involves pressing the register key with your left thumb.`
            },
            {
                title: 'Intermediate: Tone and Intonation',
                content: `**Tone Quality:** A good clarinet tone is focused, round, and consistent across all registers. This comes from a stable embouchure and steady, supported air.
                
**Intonation:** Learning the tuning tendencies of your instrument is crucial. For example, some notes in the Clarion register tend to be sharp, while some in the Chalumeau register can be flat. You adjust the pitch with your embouchure and air.`
            },
            {
                title: 'Advanced: Articulation and Altissimo',
                content: `**Articulation:** Advanced players develop a variety of tonguing styles, from very sharp *staccatissimo* to smooth *legato* tonguing.
                
**Altissimo Register:** These are the very highest notes on the clarinet, played with special fingerings and a very firm embouchure. They are notoriously difficult to control but are required for advanced solo and orchestral music.`
            }
        ] 
    },
    'Saxophone (Alto)': { 
        scales: [
            { name: 'G Major (Concert B♭)', description: 'A common starting scale for alto sax.', notes: ['G4','A4','B4','C5','D5','E5','F#5'] }
        ], 
        commonChords: [], 
        uniqueConcepts: [
            {
                title: '🎷 Beginner: Embouchure and Air',
                content: `The saxophone is a single-reed instrument, usually made of brass, but considered a woodwind. It has a powerful, expressive tone strongly associated with jazz.
                
**Transposing Instrument:** The Alto Sax is in E♭. When you play a written C, the pitch that sounds is an E♭.
                
**Embouchure:** Similar to the clarinet. The top teeth rest on the mouthpiece, bottom lip curled over bottom teeth. Form a circle around the mouthpiece like a drawstring bag to prevent air leaks.
                
**Air Support:** A steady, strong stream of air from your diaphragm is crucial for a full, stable tone.`
            },
            {
                title: 'Intermediate: Jazz and Expression',
                content: `**Vibrato:** Saxophone vibrato is typically created with the jaw. By making a slight up-and-down motion with the jaw (as if saying "yah-yah-yah"), you create a gentle pulse in the pitch.
                
**Articulation:** In jazz, articulation is key to style. Notes are often played with a "doo" or "dah" tongue, and many notes may be played *legato* (slurred).
                
**Improvisation:** Start with the blues scale. It has a "blue" note that gives it its characteristic sound and works well over many simple chord progressions.`
            },
            {
                title: 'Advanced: Extended Range and Tones',
                content: `**Altissimo:** The highest register of the saxophone, played with special fingerings and voicing techniques (adjusting the shape of your throat and oral cavity).
                
**Subtone:** A very soft, breathy tone used for quiet, intimate passages. This is achieved with a very relaxed embouchure.
                
**Growling:** A raspy, aggressive sound created by humming or gargling in the back of your throat while playing a note.`
            }
        ] 
    },
    'Trumpet (Bb)': { 
        scales: [
            { name: 'C Major (Concert B♭)', description: 'The first scale for most trumpet players, using simple valve combinations.', notes: ['C4','D4','E4','F4','G4','A4','B4'] }
        ], 
        commonChords: [], 
        uniqueConcepts: [
             {
                title: '🎺 Beginner: The Buzz',
                content: `The trumpet is the highest-pitched brass instrument, known for its brilliant tone.
                
**Transposing Instrument:** The trumpet is in B♭. A written C sounds as a B♭.

**The Buzz (Embouchure):** Sound on brass instruments comes from the player buzzing their lips into the mouthpiece. Learning to create a steady, consistent buzz is the first and most important step. Practice buzzing on just the mouthpiece.

**Valves:** The trumpet has three valves. Different combinations change the length of the tubing, allowing you to play all 12 notes. The C major scale only requires a few simple combinations.`
            },
            {
                title: 'Intermediate: Range and Flexibility',
                content: `**Lip Slurs:** Exercises for changing notes *without* changing the valve combination, using only your embouchure. This builds strength and flexibility in the lip muscles, which is essential for playing in the high register and improving accuracy.
                
**Extending Your Range:** Playing higher requires faster air and a firmer embouchure. Practice long tones and lip slurs consistently to gradually build your range without straining.

**Articulation:** Use the tip of your tongue to start each note cleanly, as if saying "too" or "doo".`
            },
            {
                title: 'Advanced: Power and Agility',
                content: `**Double and Triple Tonguing:** To play very fast passages, players use techniques to tongue faster than is possible with a single "too" syllable. Double tonguing uses a "too-koo" motion, and triple tonguing uses "too-too-koo".
                
**Pedal Tones:** These are very low notes played below the normal range of the instrument. Practicing them helps develop a relaxed embouchure and improves tone in all registers.
                
**Flexibility:** The ability to jump between wide intervals accurately and cleanly. Advanced lip slur exercises are key to developing this skill.`
            }
        ] 
    },
    'Trombone': { 
        scales: [
            { name: 'B♭ Major', description: 'The most fundamental scale for trombone, starting in 1st position.', notes: ['Bb2','C3','D3','Eb3','F3','G3','A3','Bb3'] }
        ], 
        commonChords: [], 
        uniqueConcepts: [
            {
                title: '🎶 Beginner: The Slide',
                content: `The trombone is a non-transposing brass instrument known for its telescoping slide, which changes the pitch.
                
**The Buzz:** Like all brass, sound starts with buzzing your lips into the mouthpiece.
                
**Slide Positions:** There are seven slide positions. 1st is all the way in, 7th is all the way out. Each position lowers the pitch by a semitone. Learning the precise location of each position by ear is fundamental to playing in tune.
                
**Reading Music:** The trombone primarily reads music in the bass clef.`
            },
            {
                title: 'Intermediate: Legato and Range',
                content: `**Legato Tonguing:** To play smooth, connected notes without a "smear" between slide positions, trombonists use a very light tonguing called legato tonguing (a "doo" syllable). This cleanly separates the notes while maintaining a smooth musical line.
                
**Alternate Positions:** Some notes can be played in more than one slide position. Learning these alternate positions is crucial for playing fast passages where the primary positions are awkward.
                
**Extending Range:** Playing higher requires faster air and a firmer embouchure. Long tones and lip slurs are essential practice.`
            },
            {
                title: 'Advanced: Clefs and F-Attachment',
                content: `**F-Attachment:** Many modern trombones have an extra loop of tubing activated by a trigger. This puts the instrument in the key of F, opening up new alternate positions and extending the low range.
                
**Tenor and Alto Clefs:** For high-register playing, trombone music often switches to tenor clef, and sometimes even alto clef, to avoid too many ledger lines.`
            }
        ] 
    },
    'Tuba': { 
        scales: [
            { name: 'B♭ Major', description: 'A foundational scale for tuba, often the first one learned.', notes: ['Bb1','C2','D2','Eb2','F2','G2','A2','Bb2'] }
        ], 
        commonChords: [], 
        uniqueConcepts: [
            {
                title: '🎵 Beginner: Air Support',
                content: `The tuba is the largest and lowest-pitched brass instrument, providing the harmonic foundation for bands and orchestras.
                
**Breathing:** Because of its size, the tuba requires a huge amount of air. The most important fundamental is learning to take deep, relaxed breaths from your diaphragm to support a large, steady column of air. Think of filling your belly with air.
                
**Embouchure:** The tuba requires a very relaxed and loose embouchure compared to higher brass instruments. The goal is a clear, centered tone, not a pinched or thin one.`
            },
            {
                title: 'Intermediate: Articulation and Intonation',
                content: `**Articulation:** Due to the large size of the instrument, articulating clearly can be a challenge. Practice using a "toh" or "doh" syllable with your tongue to start each note with a clear beginning, avoiding a "haaa" sound.
                
**Intonation:** Tubas have inherent tuning quirks. Players learn to adjust the pitch of certain notes by "lipping" them up or down with their embouchure, or by using alternate fingerings.`
            },
            {
                title: 'Advanced: Technique and Musicality',
                content: `**Multiple Tonguing:** To play fast passages, tuba players use double ("toh-koh") and triple ("toh-toh-koh") tonguing.
                
**Range:** Advanced players work to extend their range both high and low (pedal tones). This requires great control over both embouchure and air support.
                
**Musical Role:** The tuba's role is not just to play low notes, but to provide a solid, resonant, and in-tune foundation that the entire ensemble can build upon. Listening and blending are key advanced skills.`
            }
        ] 
    },
    'Voice (General)': { 
        scales: [
            { name: 'Major Scale Warm-up', description: 'Singing a major scale on a vowel like "Ah" or "Ee" is a fundamental warm-up for improving pitch accuracy.', notes: ['C4','D4','E4','F4','G4','A4','B4','C5'] }
        ], 
        commonChords: [], 
        uniqueConcepts: [
        {
            title: '🎵 How Music Theory Starts',
            content: `If you're just starting out in music, you might be wondering:
What is music theory, and how does it relate to the instrument I want to play?
Let’s break it down step by step.

🎼 1. The Basics of Music Theory

Music theory is the language of music — it helps you understand what you're playing and why it sounds the way it does. Here’s how it begins:

🅰️ The Musical Alphabet

Music uses 7 letters:
A – B – C – D – E – F – G
Then it repeats again.

🎶 Notes and the Staff

Music is written on a set of 5 lines called the staff. Each line or space represents a note.
There are two main clefs:
- Treble Clef (for higher instruments: violin, flute, piano right hand)
- Bass Clef (for lower instruments: bass, cello, piano left hand)

🔑 Scales and Key Signatures

A scale is a set of notes in order.
Example: C Major Scale: C – D – E – F – G – A – B – C
Music theory teaches:
- Major and minor scales
- Key signatures (sharps ♯ and flats ♭)
- How to build scales using whole and half steps

🎵 Chords and Harmony

Chords are groups of notes played together.
- Major chords = happy sound
- Minor chords = sad sound
You’ll learn how chords connect in patterns called chord progressions, like: C – G – Am – F

🕒 Rhythm and Timing

Theory also teaches you when to play notes:
- Note values: whole, half, quarter, eighth notes
- Time signatures: like 4/4 or 3/4
- Tempo: speed of the music

🎻 2. Types of Instruments — and How Theory Connects to Them

Music theory becomes much more fun when you apply it to an instrument. Here's a quick guide:

🎹 Piano (Keyboard Family)
- Perfect for learning theory
- All notes are laid out visually (white & black keys)
- Easy to understand scales, chords, and intervals

🎸 Guitar (String Family)
- Notes played on strings and frets
- Great for learning chords and chord progressions
- Theory helps with scales, barre chords, and transposing

🎻 Violin, Cello, Bass (Bowed Strings)
- No frets: requires good ear training
- Theory helps you play in positions, understand key signatures and melodies

🎷 Woodwinds (Flute, Clarinet, Saxophone, etc.)
- Notes created with fingerings and breath
- Theory helps with reading music and playing in the right key

🎺 Brass (Trumpet, Trombone, etc.)
- Uses lip tension and fingerings
- Theory helps with tuning, transposing, and playing scales

🥁 Percussion (Drums, Xylophone, etc.)
- Focuses mostly on rhythm, tempo, and dynamics
- Theory here is all about timing and note values

🧠 Putting It All Together

Music theory teaches you:
- What notes to play
- How they work together (scales, chords)
- When to play them (rhythm)
- How to write or read them (notation)
Your instrument is how you bring that theory to life.

🎯 Choosing an Instrument for Learning Theory

Goal\tInstrument\tWhy?
Learn full theory\t🎹 Piano\tNotes are visible, easy to apply scales/chords
Play & sing songs\t🎸 Guitar\tEasy chords, portable, popular
Focus on rhythm\t🥁 Drums\tGreat for timing, beat, coordination
Join a band/orchestra\t🎻🎷🎺 Violin, Sax, Trumpet, etc.\tLearn music reading, ear skills, team playing`
        },
        {
            title: '🗣️ Beginner: Breath and Posture',
            content: `The human voice is the most personal musical instrument. Good technique is essential for health and expressive control.

**Posture:** Stand with feet shoulder-width apart, knees slightly bent, and spine aligned. Your chest should be open and shoulders relaxed. This allows your lungs to expand fully.

**Breath Support:** The foundation of singing is **diaphragmatic breathing**. When you inhale, your belly should expand outward as your diaphragm muscle contracts, drawing air deep into your lungs. When you sing, you control the release of this air to create a steady, supported tone.`
        },
        {
            title: 'Intermediate: Vocal Registers',
            content: `**Vocal Registers** are areas of the voice produced by a specific type of vocal fold vibration.
- **Chest Voice:** The lower, heavier register that feels like it resonates in your chest. It's your normal speaking voice range.
- **Head Voice:** The higher, lighter register that feels like it resonates in your head. It's often associated with a "classical" or "legit" sound.
- **Falsettto:** A breathy, high-register sound primarily used by male voices.
- **Mix Voice:** A blend of chest and head voice that allows for a smooth transition (called the **passaggio** or "break") between the registers. Developing a strong mix is a primary goal for most contemporary singers.`
        },
        {
            title: 'Advanced: Resonance and Diction',
            content: `**Resonance:** This is the amplification and shaping of the sound created by your vocal folds. Advanced singers learn to control resonance by adjusting the shape of their vocal tract (throat, mouth, nasal passages) to create different tone colors (timbres).
            
**Diction:** Clear and precise pronunciation of consonants and vowels. Good diction ensures the lyrics are understood without creating tension in the jaw or tongue.
            
**Vocal Agility:** The ability to sing fast passages, runs, and riffs accurately and cleanly. This is developed through practicing scales and specific vocal exercises (vocalises).`
        }
    ] 
  },
};