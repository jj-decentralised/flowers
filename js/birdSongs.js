const BirdSongs = (function() {
    'use strict';

    // 365 birds — one for each day of the year.
    // A quiet gift: every morning, a different bird sings for you.
    // Days 1-50: Singapore & Southeast Asia
    // Days 51-90: Australasia
    // Days 91-140: Asia (East, South, Central)
    // Days 141-200: Europe
    // Days 201-250: Americas
    // Days 251-300: Africa
    // Days 301-340: More worldwide songbirds
    // Days 341-365: Arctic, oceanic, and rare wanderers

    var BIRDS = [
        // ──────────────────────────────────────────────
        // Days 1-50: Singapore & Southeast Asia
        // ──────────────────────────────────────────────

        // Day 1 (Jan 1)
        { name: 'Oriental Magpie-Robin', scientific: 'Copsychus saularis', description: 'A dawn singer, heralding new beginnings', region: 'Southeast Asia' },
        // Day 2 (Jan 2)
        { name: 'White-bellied Sea Eagle', scientific: 'Haliaeetus leucogaster', description: 'Soaring above the straits at daybreak', region: 'Singapore' },
        // Day 3 (Jan 3)
        { name: 'Olive-backed Sunbird', scientific: 'Cinnyris jugularis', description: 'Sips nectar while the morning is still cool', region: 'Singapore' },
        // Day 4 (Jan 4)
        { name: 'Javan Myna', scientific: 'Acridotheres javanicus', description: 'Chatters on the railing like an old friend', region: 'Singapore' },
        // Day 5 (Jan 5)
        { name: 'Asian Koel', scientific: 'Eudynamys scolopaceus', description: 'Its rising call fills the humid afternoon', region: 'Southeast Asia' },
        // Day 6 (Jan 6)
        { name: 'Yellow-vented Bulbul', scientific: 'Pycnonotus goiavier', description: 'Sings at your window as the coffee brews', region: 'Singapore' },
        // Day 7 (Jan 7)
        { name: 'Collared Kingfisher', scientific: 'Todiramphus chloris', description: 'A flash of turquoise along the canal', region: 'Singapore' },
        // Day 8 (Jan 8)
        { name: 'Pink-necked Green Pigeon', scientific: 'Treron vernans', description: 'Soft cooing drifts down from the rain tree', region: 'Singapore' },
        // Day 9 (Jan 9)
        { name: 'Common Tailorbird', scientific: 'Orthotomus sutorius', description: 'Stitches its song through the garden hedge', region: 'Southeast Asia' },
        // Day 10 (Jan 10)
        { name: 'White-throated Kingfisher', scientific: 'Halcyon smyrnensis', description: 'Perches quietly, watching the world wake', region: 'Singapore' },
        // Day 11 (Jan 11)
        { name: 'Spotted Dove', scientific: 'Spilopelia chinensis', description: 'A gentle rhythm beneath the frangipani', region: 'Singapore' },
        // Day 12 (Jan 12)
        { name: 'Black-naped Oriole', scientific: 'Oriolus chinensis', description: 'Golden visitor whistling through the palms', region: 'Singapore' },
        // Day 13 (Jan 13)
        { name: 'Common Flameback', scientific: 'Dinopium javanense', description: 'Taps a love note into the bark', region: 'Singapore' },
        // Day 14 (Jan 14)
        { name: 'Crimson Sunbird', scientific: 'Aethopyga siparaja', description: 'A jewel hovering at the hibiscus', region: 'Singapore' },
        // Day 15 (Jan 15)
        { name: 'House Crow', scientific: 'Corvus splendens', description: 'Knows your morning routine by heart', region: 'Singapore' },
        // Day 16 (Jan 16)
        { name: 'Zebra Dove', scientific: 'Geopelia striata', description: 'Its soft trill is the sound of home', region: 'Singapore' },
        // Day 17 (Jan 17)
        { name: 'Long-tailed Parakeet', scientific: 'Psittacula longicauda', description: 'Streaks of green against the evening sky', region: 'Singapore' },
        // Day 18 (Jan 18)
        { name: 'Brown-throated Sunbird', scientific: 'Anthreptes malacensis', description: 'Threads iridescence through the morning air', region: 'Singapore' },
        // Day 19 (Jan 19)
        { name: 'Scarlet-backed Flowerpecker', scientific: 'Dicaeum cruentatum', description: 'A tiny flame darting through the canopy', region: 'Singapore' },
        // Day 20 (Jan 20)
        { name: 'Large-billed Crow', scientific: 'Corvus macrorhynchos', description: 'Watches over the rooftops with knowing eyes', region: 'Singapore' },
        // Day 21 (Jan 21)
        { name: 'Blue-tailed Bee-eater', scientific: 'Merops philippinus', description: 'Catches light and insects in equal measure', region: 'Singapore' },
        // Day 22 (Jan 22)
        { name: 'Grey Heron', scientific: 'Ardea cinerea', description: 'Stands still as the pond reflects the clouds', region: 'Singapore' },
        // Day 23 (Jan 23)
        { name: 'Laced Woodpecker', scientific: 'Picus vittatus', description: 'Drums a quiet morning rhythm on the trunk', region: 'Singapore' },
        // Day 24 (Jan 24)
        { name: 'Straw-headed Bulbul', scientific: 'Pycnonotus zeylanicus', description: 'Its melody is rarer now, and dearer', region: 'Singapore' },
        // Day 25 (Jan 25)
        { name: 'Pacific Swallow', scientific: 'Hirundo tahitica', description: 'Sketches arcs above the evening field', region: 'Singapore' },
        // Day 26 (Jan 26)
        { name: 'Common Iora', scientific: 'Aegithina tiphia', description: 'Whistles a question only the leaves answer', region: 'Southeast Asia' },
        // Day 27 (Jan 27)
        { name: 'Changeable Hawk-Eagle', scientific: 'Nisaetus cirrhatus', description: 'A shadow crossing the canopy like a thought', region: 'Singapore' },
        // Day 28 (Jan 28)
        { name: 'Greater Racket-tailed Drongo', scientific: 'Dicrurus paradiseus', description: 'Mimics the forest and makes it its own', region: 'Southeast Asia' },
        // Day 29 (Jan 29)
        { name: 'Little Heron', scientific: 'Butorides striata', description: 'Patient as a letter waiting to be read', region: 'Singapore' },
        // Day 30 (Jan 30)
        { name: 'Asian Glossy Starling', scientific: 'Aplonis panayensis', description: 'Arrives in a murmuring cloud at dusk', region: 'Singapore' },
        // Day 31 (Jan 31)
        { name: 'Red-legged Crake', scientific: 'Rallina fasciata', description: 'Steps softly through the marsh at twilight', region: 'Singapore' },
        // Day 32 (Feb 1)
        { name: 'Coppersmith Barbet', scientific: 'Psilopogon haemacephalus', description: 'Hammers a bright note into the stillness', region: 'Southeast Asia' },
        // Day 33 (Feb 2)
        { name: 'Abbott\'s Babbler', scientific: 'Malacocincla abbotti', description: 'Murmurs secrets in the undergrowth', region: 'Southeast Asia' },
        // Day 34 (Feb 3)
        { name: 'Lineated Barbet', scientific: 'Psilopogon lineatus', description: 'Calls from the fig tree like a steady heartbeat', region: 'Southeast Asia' },
        // Day 35 (Feb 4)
        { name: 'Greater Coucal', scientific: 'Centropus sinensis', description: 'A deep booming note that shakes the ferns', region: 'Singapore' },
        // Day 36 (Feb 5)
        { name: 'Pied Triller', scientific: 'Lalage nigra', description: 'A crisp trill rinsing the morning clean', region: 'Southeast Asia' },
        // Day 37 (Feb 6)
        { name: 'Blue-crowned Hanging Parrot', scientific: 'Loriculus galgulus', description: 'Hangs upside down like a green lantern', region: 'Singapore' },
        // Day 38 (Feb 7)
        { name: 'Sunda Pygmy Woodpecker', scientific: 'Yungipicus moluccensis', description: 'So small, so determined, tapping away', region: 'Southeast Asia' },
        // Day 39 (Feb 8)
        { name: 'White-breasted Waterhen', scientific: 'Amaurornis phoenicurus', description: 'Crosses the path with quiet purpose', region: 'Singapore' },
        // Day 40 (Feb 9)
        { name: 'Brahminy Kite', scientific: 'Haliastur indus', description: 'Circles above the harbour like a prayer', region: 'Singapore' },
        // Day 41 (Feb 10)
        { name: 'Plaintive Cuckoo', scientific: 'Cacomantis merulinus', description: 'Its call aches like longing given voice', region: 'Southeast Asia' },
        // Day 42 (Feb 11)
        { name: 'Stork-billed Kingfisher', scientific: 'Pelargopsis capensis', description: 'A giant jewel crashing through the green', region: 'Southeast Asia' },
        // Day 43 (Feb 12)
        { name: 'Emerald Dove', scientific: 'Chalcophaps indica', description: 'Walks the forest floor like a living gem', region: 'Southeast Asia' },
        // Day 44 (Feb 13)
        { name: 'Tiger Shrike', scientific: 'Lanius tigrinus', description: 'Fierce and small, guarding its thorny throne', region: 'Southeast Asia' },
        // Day 45 (Feb 14)
        { name: 'Hill Myna', scientific: 'Gracula religiosa', description: 'Speaks in a voice almost human, almost yours', region: 'Southeast Asia' },
        // Day 46 (Feb 15)
        { name: 'Banded Woodpecker', scientific: 'Chrysophlegma miniaceum', description: 'Paints the morning in red and gold taps', region: 'Southeast Asia' },
        // Day 47 (Feb 16)
        { name: 'Black-crowned Night Heron', scientific: 'Nycticorax nycticorax', description: 'Waits by the water while the stars appear', region: 'Singapore' },
        // Day 48 (Feb 17)
        { name: 'Thick-billed Green Pigeon', scientific: 'Treron curvirostra', description: 'Hidden in the canopy, singing to the fruit', region: 'Southeast Asia' },
        // Day 49 (Feb 18)
        { name: 'Orange-bellied Flowerpecker', scientific: 'Dicaeum trigonostigma', description: 'A spark of orange among the mistletoe', region: 'Southeast Asia' },
        // Day 50 (Feb 19)
        { name: 'Mangrove Blue Flycatcher', scientific: 'Cyornis rufigastra', description: 'Flits between the stilted roots at low tide', region: 'Southeast Asia' },

        // ──────────────────────────────────────────────
        // Days 51-90: Australasia
        // ──────────────────────────────────────────────

        // Day 51 (Feb 20)
        { name: 'Superb Fairywren', scientific: 'Malurus cyaneus', description: 'A drop of sky hopping through the scrub', region: 'Australia' },
        // Day 52 (Feb 21)
        { name: 'Laughing Kookaburra', scientific: 'Dacelo novaeguineae', description: 'Cracks the silence open every dawn', region: 'Australia' },
        // Day 53 (Feb 22)
        { name: 'Rainbow Lorikeet', scientific: 'Trichoglossus moluccanus', description: 'Shrieks with the joy of being alive', region: 'Australia' },
        // Day 54 (Feb 23)
        { name: 'Sulphur-crested Cockatoo', scientific: 'Cacatua galerita', description: 'Announces itself like a brass band at dawn', region: 'Australia' },
        // Day 55 (Feb 24)
        { name: 'Australian Magpie', scientific: 'Gymnorhina tibicen', description: 'Its carol turns the backyard into a cathedral', region: 'Australia' },
        // Day 56 (Feb 25)
        { name: 'Kea', scientific: 'Nestor notabilis', description: 'Clever mountain parrot, undoing every latch', region: 'New Zealand' },
        // Day 57 (Feb 26)
        { name: 'Tui', scientific: 'Prosthemadera novaeseelandiae', description: 'Sings two notes at once like a broken heart mending', region: 'New Zealand' },
        // Day 58 (Feb 27)
        { name: 'Galah', scientific: 'Eolophus roseicapilla', description: 'Pink and grey, clowning through the eucalyptus', region: 'Australia' },
        // Day 59 (Feb 28)
        { name: 'Satin Bowerbird', scientific: 'Ptilonorhynchus violaceus', description: 'Collects blue things to say I love you', region: 'Australia' },
        // Day 60 (Mar 1)
        { name: 'New Zealand Bellbird', scientific: 'Anthornis melanura', description: 'Its chime rings through the silver beech', region: 'New Zealand' },
        // Day 61 (Mar 2)
        { name: 'Willy Wagtail', scientific: 'Rhipidura leucophrys', description: 'Dances on the fence like a tiny conductor', region: 'Australia' },
        // Day 62 (Mar 3)
        { name: 'Eastern Rosella', scientific: 'Platycercus eximius', description: 'A palette of red and gold settling on the wire', region: 'Australia' },
        // Day 63 (Mar 4)
        { name: 'Noisy Miner', scientific: 'Manorina melanocephala', description: 'Guards its patch with tiny fierce devotion', region: 'Australia' },
        // Day 64 (Mar 5)
        { name: 'Pied Currawong', scientific: 'Strepera graculina', description: 'Its call rings like a bell through the blue gums', region: 'Australia' },
        // Day 65 (Mar 6)
        { name: 'Riflebird', scientific: 'Ptiloris paradiseus', description: 'Spreads velvet wings in the green cathedral', region: 'Australia' },
        // Day 66 (Mar 7)
        { name: 'Australian King Parrot', scientific: 'Alisterus scapularis', description: 'Royal red, landing softly on the balcony rail', region: 'Australia' },
        // Day 67 (Mar 8)
        { name: 'Fantail', scientific: 'Rhipidura fuliginosa', description: 'Fans and pivots, catching the last light', region: 'New Zealand' },
        // Day 68 (Mar 9)
        { name: 'Sacred Kingfisher', scientific: 'Todiramphus sanctus', description: 'Arrives with the warmth, departs with the cold', region: 'Australasia' },
        // Day 69 (Mar 10)
        { name: 'Grey Warbler', scientific: 'Gerygone igata', description: 'So small you hear it long before you see it', region: 'New Zealand' },
        // Day 70 (Mar 11)
        { name: 'Splendid Fairywren', scientific: 'Malurus splendens', description: 'Electric blue flitting low through the heath', region: 'Australia' },
        // Day 71 (Mar 12)
        { name: 'Budgerigar', scientific: 'Melopsittacus undulatus', description: 'A green and gold murmur across the outback', region: 'Australia' },
        // Day 72 (Mar 13)
        { name: 'Masked Lapwing', scientific: 'Vanellus miles', description: 'Cries out to protect what it loves most', region: 'Australia' },
        // Day 73 (Mar 14)
        { name: 'Eastern Whipbird', scientific: 'Psophodes olivaceus', description: 'Cracks a whip of sound through the rain', region: 'Australia' },
        // Day 74 (Mar 15)
        { name: 'Silvereye', scientific: 'Zosterops lateralis', description: 'Peers at the world through tiny spectacles', region: 'Australasia' },
        // Day 75 (Mar 16)
        { name: 'Crimson Rosella', scientific: 'Platycercus elegans', description: 'Lands in the garden like a dropped love letter', region: 'Australia' },
        // Day 76 (Mar 17)
        { name: 'Raggiana Bird-of-Paradise', scientific: 'Paradisaea raggiana', description: 'Dances with plumes like red smoke unfurling', region: 'Papua New Guinea' },
        // Day 77 (Mar 18)
        { name: 'Black Swan', scientific: 'Cygnus atratus', description: 'Glides through the dark water trailing silence', region: 'Australia' },
        // Day 78 (Mar 19)
        { name: 'Yellow-tailed Black Cockatoo', scientific: 'Zanda funerea', description: 'Calls across the valley like distant thunder', region: 'Australia' },
        // Day 79 (Mar 20)
        { name: 'Spotted Pardalote', scientific: 'Pardalotus punctatus', description: 'A jewelled whisper in the eucalyptus canopy', region: 'Australia' },
        // Day 80 (Mar 21)
        { name: 'Superb Lyrebird', scientific: 'Menura novaehollandiae', description: 'Sings the entire forest back to itself', region: 'Australia' },
        // Day 81 (Mar 22)
        { name: 'Morepork', scientific: 'Ninox novaeseelandiae', description: 'Asks a question only the night can answer', region: 'New Zealand' },
        // Day 82 (Mar 23)
        { name: 'Blue-faced Honeyeater', scientific: 'Entomyzon cyanotis', description: 'Wears a mask of sky around its eyes', region: 'Australia' },
        // Day 83 (Mar 24)
        { name: 'Cockatiel', scientific: 'Nymphicus hollandicus', description: 'Whistles a tune it learned from listening to you', region: 'Australia' },
        // Day 84 (Mar 25)
        { name: 'New Holland Honeyeater', scientific: 'Phylidonyris novaehollandiae', description: 'Darts between the banksias before you blink', region: 'Australia' },
        // Day 85 (Mar 26)
        { name: 'Eclectus Parrot', scientific: 'Eclectus roratus', description: 'She is red, he is green, both are stunning', region: 'Australasia' },
        // Day 86 (Mar 27)
        { name: 'Flame Robin', scientific: 'Petroica phoenicea', description: 'A hearth fire perched on a winter branch', region: 'Australia' },
        // Day 87 (Mar 28)
        { name: 'Channel-billed Cuckoo', scientific: 'Scythrops novaehollandiae', description: 'Arrives with the summer storms, enormous and loud', region: 'Australia' },
        // Day 88 (Mar 29)
        { name: 'White-faced Heron', scientific: 'Egretta novaehollandiae', description: 'Stands in the shallows, perfectly composed', region: 'Australasia' },
        // Day 89 (Mar 30)
        { name: 'Red Wattlebird', scientific: 'Anthochaera carunculata', description: 'Rowdy and restless among the grevilleas', region: 'Australia' },
        // Day 90 (Mar 31)
        { name: 'Kakapo', scientific: 'Strigops habroptilus', description: 'Booms through the night, the rarest love song on earth', region: 'New Zealand' },

        // ──────────────────────────────────────────────
        // Days 91-140: Asia (East, South, Central)
        // ──────────────────────────────────────────────

        // Day 91 (Apr 1)
        { name: 'Japanese White-eye', scientific: 'Zosterops japonicus', description: 'Circles the plum blossom like a thought returning', region: 'East Asia' },
        // Day 92 (Apr 2)
        { name: 'Red-billed Blue Magpie', scientific: 'Urocissa erythroryncha', description: 'Trails its impossible tail through the mist', region: 'East Asia' },
        // Day 93 (Apr 3)
        { name: 'Indian Peafowl', scientific: 'Pavo cristatus', description: 'Opens a hundred eyes to the monsoon sky', region: 'South Asia' },
        // Day 94 (Apr 4)
        { name: 'Crested Serpent Eagle', scientific: 'Spilornis cheela', description: 'Cries above the canopy in long spirals', region: 'Asia' },
        // Day 95 (Apr 5)
        { name: 'Oriental Pied Hornbill', scientific: 'Anthracoceros albirostris', description: 'Heavy wingbeats carrying ancient stories', region: 'Southeast Asia' },
        // Day 96 (Apr 6)
        { name: 'Siberian Rubythroat', scientific: 'Calliope calliope', description: 'A throat like a drop of blood in the snow', region: 'North Asia' },
        // Day 97 (Apr 7)
        { name: 'Indian Robin', scientific: 'Copsychus fulicatus', description: 'Cocks its tail and sings to the dust', region: 'South Asia' },
        // Day 98 (Apr 8)
        { name: 'Mandarin Duck', scientific: 'Aix galericulata', description: 'Painted by someone who had never seen enough colour', region: 'East Asia' },
        // Day 99 (Apr 9)
        { name: 'White-rumped Shama', scientific: 'Copsychus malabaricus', description: 'Its song pours like water down stone steps', region: 'Southeast Asia' },
        // Day 100 (Apr 10)
        { name: 'Plum-headed Parakeet', scientific: 'Psittacula cyanocephala', description: 'A plum-coloured thought streaking past the window', region: 'South Asia' },
        // Day 101 (Apr 11)
        { name: 'Japanese Bush Warbler', scientific: 'Horornis diphone', description: 'Sings the syllable that means spring has come', region: 'Japan' },
        // Day 102 (Apr 12)
        { name: 'Red-whiskered Bulbul', scientific: 'Pycnonotus jocosus', description: 'Cheerful and crested, singing from the wire', region: 'South Asia' },
        // Day 103 (Apr 13)
        { name: 'Blue-throated Barbet', scientific: 'Psilopogon asiaticus', description: 'Hammers a monotone hymn to the morning', region: 'South Asia' },
        // Day 104 (Apr 14)
        { name: 'Black Drongo', scientific: 'Dicrurus macrocercus', description: 'Fearless on the wire, chasing hawks away', region: 'Asia' },
        // Day 105 (Apr 15)
        { name: 'Oriental Dwarf Kingfisher', scientific: 'Ceyx erithaca', description: 'So small, so bright, like a wish made visible', region: 'Southeast Asia' },
        // Day 106 (Apr 16)
        { name: 'Asian Paradise Flycatcher', scientific: 'Terpsiphone paradisi', description: 'White ribbons trailing through the green dark', region: 'Asia' },
        // Day 107 (Apr 17)
        { name: 'Himalayan Monal', scientific: 'Lophophorus impejanus', description: 'Every colour of the spectrum, walking on a mountain', region: 'Himalayas' },
        // Day 108 (Apr 18)
        { name: 'Red Junglefowl', scientific: 'Gallus gallus', description: 'The ancestor of every dawn chorus on every farm', region: 'Southeast Asia' },
        // Day 109 (Apr 19)
        { name: 'White-throated Laughingthrush', scientific: 'Pterorhinus albogularis', description: 'Laughs with friends in the rhododendron thicket', region: 'Himalayas' },
        // Day 110 (Apr 20)
        { name: 'Dollarbird', scientific: 'Eurystomus orientalis', description: 'Flashes silver coins in flight against the blue', region: 'Australasia' },
        // Day 111 (Apr 21)
        { name: 'Spotted Owlet', scientific: 'Athene brama', description: 'Bobs and glares from the old temple wall', region: 'South Asia' },
        // Day 112 (Apr 22)
        { name: 'Chestnut-tailed Starling', scientific: 'Sturnia malabarica', description: 'Catches the light like a polished stone', region: 'South Asia' },
        // Day 113 (Apr 23)
        { name: 'Fork-tailed Sunbird', scientific: 'Aethopyga christinae', description: 'A needle of colour stitching through the flowers', region: 'East Asia' },
        // Day 114 (Apr 24)
        { name: 'White-crested Laughingthrush', scientific: 'Garrulax leucolophus', description: 'A raucous choir hidden in the bamboo', region: 'Southeast Asia' },
        // Day 115 (Apr 25)
        { name: 'Asian Fairy-bluebird', scientific: 'Irena puella', description: 'Blue so deep it seems to hold the sky inside', region: 'Southeast Asia' },
        // Day 116 (Apr 26)
        { name: 'Great Hornbill', scientific: 'Buceros bicornis', description: 'Its wingbeats sound like a train approaching', region: 'Southeast Asia' },
        // Day 117 (Apr 27)
        { name: 'Crested Bunting', scientific: 'Emberiza lathami', description: 'Wears a crest like a tiny declaration', region: 'East Asia' },
        // Day 118 (Apr 28)
        { name: 'Long-tailed Shrike', scientific: 'Lanius schach', description: 'Watches from the treetop with sharp intent', region: 'Asia' },
        // Day 119 (Apr 29)
        { name: 'Grey-headed Fish Eagle', scientific: 'Icthyophaga ichthyaetus', description: 'Pulls silver from the river with enormous grace', region: 'Southeast Asia' },
        // Day 120 (Apr 30)
        { name: 'Verditer Flycatcher', scientific: 'Eumyias thalassinus', description: 'A piece of the sky that decided to sit still', region: 'South Asia' },
        // Day 121 (May 1)
        { name: 'Rufous Treepie', scientific: 'Dendrocitta vagabunda', description: 'Clambers through the branches like a rusty acrobat', region: 'South Asia' },
        // Day 122 (May 2)
        { name: 'Red-breasted Parakeet', scientific: 'Psittacula alexandri', description: 'Rose-chested and chattering in the evening palms', region: 'Southeast Asia' },
        // Day 123 (May 3)
        { name: 'Silver-eared Mesia', scientific: 'Leiothrix argentauris', description: 'Carries a sunset on its breast through the cloud forest', region: 'Southeast Asia' },
        // Day 124 (May 4)
        { name: 'Red-billed Leiothrix', scientific: 'Leiothrix lutea', description: 'Called the Pekin robin, singing far from home', region: 'East Asia' },
        // Day 125 (May 5)
        { name: 'Chestnut Munia', scientific: 'Lonchura atricapilla', description: 'Gathers in the rice like a handful of seeds', region: 'Southeast Asia' },
        // Day 126 (May 6)
        { name: 'Barn Owl', scientific: 'Tyto alba', description: 'Drifts over the paddy fields like a ghost of kindness', region: 'Worldwide' },
        // Day 127 (May 7)
        { name: 'Asian Brown Flycatcher', scientific: 'Muscicapa dauurica', description: 'Quiet and plain, waiting on a low branch with patience', region: 'Asia' },
        // Day 128 (May 8)
        { name: 'Pied Kingfisher', scientific: 'Ceryle rudis', description: 'Hovers above the water like a held breath', region: 'Asia' },
        // Day 129 (May 9)
        { name: 'Sultan Tit', scientific: 'Melanochlora sultanea', description: 'Black and gold, a tiny monarch of the canopy', region: 'Southeast Asia' },
        // Day 130 (May 10)
        { name: 'Indian Roller', scientific: 'Coracias benghalensis', description: 'Tumbles through the air in a blaze of blue', region: 'South Asia' },
        // Day 131 (May 11)
        { name: 'Black-headed Bulbul', scientific: 'Brachypodius melanocephalos', description: 'Yellow-bodied, calling softly from the fruiting tree', region: 'Southeast Asia' },
        // Day 132 (May 12)
        { name: 'Chinese Hwamei', scientific: 'Garrulax canorus', description: 'Sings with such beauty people once caged it for that alone', region: 'East Asia' },
        // Day 133 (May 13)
        { name: 'Purple Heron', scientific: 'Ardea purpurea', description: 'Unfolds from the reeds like a dark origami', region: 'Asia' },
        // Day 134 (May 14)
        { name: 'Alexandrine Parakeet', scientific: 'Psittacula eupatria', description: 'Named for a conqueror, free in every tree', region: 'South Asia' },
        // Day 135 (May 15)
        { name: 'Oriental Honey Buzzard', scientific: 'Pernis ptilorhynchus', description: 'Soars on thermals with quiet, strange elegance', region: 'Asia' },
        // Day 136 (May 16)
        { name: 'Black-winged Stilt', scientific: 'Himantopus himantopus', description: 'Walks on water like a miracle on stilts', region: 'Asia' },
        // Day 137 (May 17)
        { name: 'Blue Rock Thrush', scientific: 'Monticola solitarius', description: 'Sings from the cliff as the sun goes down', region: 'Asia' },
        // Day 138 (May 18)
        { name: 'Asian Barred Owlet', scientific: 'Glaucidium cuculoides', description: 'Small and fierce, calling in the afternoon shade', region: 'Southeast Asia' },
        // Day 139 (May 19)
        { name: 'Chestnut-winged Cuckoo', scientific: 'Clamator coromandus', description: 'Arrives with the monsoon and disappears with it', region: 'South Asia' },
        // Day 140 (May 20)
        { name: 'Green-billed Malkoha', scientific: 'Phaenicophaeus tristis', description: 'Creeps through branches like a green secret', region: 'Southeast Asia' },

        // ──────────────────────────────────────────────
        // Days 141-200: Europe
        // ──────────────────────────────────────────────

        // Day 141 (May 21)
        { name: 'European Robin', scientific: 'Erithacus rubecula', description: 'Follows you through the garden like a small companion', region: 'Europe' },
        // Day 142 (May 22)
        { name: 'Eurasian Blackbird', scientific: 'Turdus merula', description: 'Its evening song makes the whole street pause', region: 'Europe' },
        // Day 143 (May 23)
        { name: 'Nightingale', scientific: 'Luscinia megarhynchos', description: 'Sings through the dark as if silence were unbearable', region: 'Europe' },
        // Day 144 (May 24)
        { name: 'Eurasian Wren', scientific: 'Troglodytes troglodytes', description: 'Tiny body, enormous voice, shaking with song', region: 'Europe' },
        // Day 145 (May 25)
        { name: 'Eurasian Blue Tit', scientific: 'Cyanistes caeruleus', description: 'Hangs upside down and makes it look easy', region: 'Europe' },
        // Day 146 (May 26)
        { name: 'Great Tit', scientific: 'Parus major', description: 'Teacher teacher teacher, it says each spring', region: 'Europe' },
        // Day 147 (May 27)
        { name: 'European Goldfinch', scientific: 'Carduelis carduelis', description: 'A flutter of scarlet and gold on the thistle', region: 'Europe' },
        // Day 148 (May 28)
        { name: 'Barn Swallow', scientific: 'Hirundo rustica', description: 'Returns each spring as if it made a promise', region: 'Europe' },
        // Day 149 (May 29)
        { name: 'Song Thrush', scientific: 'Turdus philomelos', description: 'Repeats each phrase twice, so you will remember', region: 'Europe' },
        // Day 150 (May 30)
        { name: 'Eurasian Skylark', scientific: 'Alauda arvensis', description: 'Rises singing until it vanishes into the blue', region: 'Europe' },
        // Day 151 (May 31)
        { name: 'Common Swift', scientific: 'Apus apus', description: 'Screams through summer evenings, never landing', region: 'Europe' },
        // Day 152 (Jun 1)
        { name: 'Eurasian Blackcap', scientific: 'Sylvia atricapilla', description: 'A hidden virtuoso in the ivy thicket', region: 'Europe' },
        // Day 153 (Jun 2)
        { name: 'European Bee-eater', scientific: 'Merops apiaster', description: 'Catches colour from the Mediterranean light', region: 'Europe' },
        // Day 154 (Jun 3)
        { name: 'Goldcrest', scientific: 'Regulus regulus', description: 'The smallest bird in Europe, crowned with fire', region: 'Europe' },
        // Day 155 (Jun 4)
        { name: 'Common Chaffinch', scientific: 'Fringilla coelebs', description: 'Counts down its song like a cheerful alarm', region: 'Europe' },
        // Day 156 (Jun 5)
        { name: 'Hoopoe', scientific: 'Upupa epops', description: 'Raises its crown in a gesture of surprise', region: 'Europe' },
        // Day 157 (Jun 6)
        { name: 'Eurasian Magpie', scientific: 'Pica pica', description: 'One for sorrow, two for joy, always watching', region: 'Europe' },
        // Day 158 (Jun 7)
        { name: 'European Stonechat', scientific: 'Saxicola rubicola', description: 'Clicks like two stones from the gorse bush', region: 'Europe' },
        // Day 159 (Jun 8)
        { name: 'Firecrest', scientific: 'Regulus ignicapilla', description: 'Even smaller than the goldcrest, burning brighter', region: 'Europe' },
        // Day 160 (Jun 9)
        { name: 'White Stork', scientific: 'Ciconia ciconia', description: 'Nests on the chimney, bringing luck and summer', region: 'Europe' },
        // Day 161 (Jun 10)
        { name: 'Eurasian Jay', scientific: 'Garrulus glandarius', description: 'Buries acorns and forgets, planting forests', region: 'Europe' },
        // Day 162 (Jun 11)
        { name: 'Pied Wagtail', scientific: 'Motacilla alba', description: 'Wags its tail on the pavement like a tiny metronome', region: 'Europe' },
        // Day 163 (Jun 12)
        { name: 'Common Cuckoo', scientific: 'Cuculus canorus', description: 'Two notes that mean the year has truly turned', region: 'Europe' },
        // Day 164 (Jun 13)
        { name: 'European Green Woodpecker', scientific: 'Picus viridis', description: 'Laughs from the lawn like a surprised visitor', region: 'Europe' },
        // Day 165 (Jun 14)
        { name: 'Eurasian Nuthatch', scientific: 'Sitta europaea', description: 'Walks headfirst down the bark, defying everything', region: 'Europe' },
        // Day 166 (Jun 15)
        { name: 'European Turtle Dove', scientific: 'Streptopelia turtur', description: 'Purrs a fading song, rarer each summer', region: 'Europe' },
        // Day 167 (Jun 16)
        { name: 'Willow Warbler', scientific: 'Phylloscopus trochilus', description: 'A descending cadence like water over pebbles', region: 'Europe' },
        // Day 168 (Jun 17)
        { name: 'Redstart', scientific: 'Phoenicurus phoenicurus', description: 'Flickers its orange tail like a small flame', region: 'Europe' },
        // Day 169 (Jun 18)
        { name: 'Eurasian Treecreeper', scientific: 'Certhia familiaris', description: 'Spirals up the trunk like a living vine', region: 'Europe' },
        // Day 170 (Jun 19)
        { name: 'Eurasian Bullfinch', scientific: 'Pyrrhula pyrrhula', description: 'Pink-breasted and shy, hiding in the hawthorn', region: 'Europe' },
        // Day 171 (Jun 20)
        { name: 'Corn Bunting', scientific: 'Emberiza calandra', description: 'Jangles its keys from the top of a wheat stalk', region: 'Europe' },
        // Day 172 (Jun 21)
        { name: 'European Roller', scientific: 'Coracias garrulus', description: 'Tumbles through the longest day in turquoise', region: 'Europe' },
        // Day 173 (Jun 22)
        { name: 'Red-backed Shrike', scientific: 'Lanius collurio', description: 'A masked hunter in the bramble patch', region: 'Europe' },
        // Day 174 (Jun 23)
        { name: 'Garden Warbler', scientific: 'Sylvia borin', description: 'Plain to see, extraordinary to hear', region: 'Europe' },
        // Day 175 (Jun 24)
        { name: 'Wheatear', scientific: 'Oenanthe oenanthe', description: 'Bobs on the stone wall, tail flashing white', region: 'Europe' },
        // Day 176 (Jun 25)
        { name: 'Long-tailed Tit', scientific: 'Aegithalos caudatus', description: 'A pom-pom on a stick, tumbling through the hedge', region: 'Europe' },
        // Day 177 (Jun 26)
        { name: 'European Greenfinch', scientific: 'Chloris chloris', description: 'Wheezes its song from the garden cedar', region: 'Europe' },
        // Day 178 (Jun 27)
        { name: 'Spotted Flycatcher', scientific: 'Muscicapa striata', description: 'Sallies from the post and returns, over and over', region: 'Europe' },
        // Day 179 (Jun 28)
        { name: 'Dunnock', scientific: 'Prunella modularis', description: 'Shuffles under the hedge with quiet dramas', region: 'Europe' },
        // Day 180 (Jun 29)
        { name: 'Yellowhammer', scientific: 'Emberiza citrinella', description: 'A little bit of bread and no cheese, endlessly', region: 'Europe' },
        // Day 181 (Jun 30)
        { name: 'Woodlark', scientific: 'Lullula arborea', description: 'Spirals upward singing a lullaby to the heath', region: 'Europe' },
        // Day 182 (Jul 1)
        { name: 'Mistle Thrush', scientific: 'Turdus viscivorus', description: 'Sings into the storm when others fall silent', region: 'Europe' },
        // Day 183 (Jul 2)
        { name: 'Coal Tit', scientific: 'Periparus ater', description: 'Tiny and quick, with a voice like a squeaky wheel', region: 'Europe' },
        // Day 184 (Jul 3)
        { name: 'Dipper', scientific: 'Cinclus cinclus', description: 'Walks underwater, singing to the river stones', region: 'Europe' },
        // Day 185 (Jul 4)
        { name: 'Reed Warbler', scientific: 'Acrocephalus scirpaceus', description: 'Chatters from the reeds as if reciting poetry fast', region: 'Europe' },
        // Day 186 (Jul 5)
        { name: 'Sedge Warbler', scientific: 'Acrocephalus schoenobaenus', description: 'Never sings the same song twice, always improvising', region: 'Europe' },
        // Day 187 (Jul 6)
        { name: 'Linnet', scientific: 'Linaria cannabina', description: 'Pink-breasted on the gorse, singing to the wind', region: 'Europe' },
        // Day 188 (Jul 7)
        { name: 'Lesser Whitethroat', scientific: 'Curruca curruca', description: 'A rattling trill from deep in the blackthorn', region: 'Europe' },
        // Day 189 (Jul 8)
        { name: 'Crested Tit', scientific: 'Lophophanes cristatus', description: 'Wears a tiny mohawk in the Scots pine', region: 'Europe' },
        // Day 190 (Jul 9)
        { name: 'Marsh Tit', scientific: 'Poecile palustris', description: 'Calls pitchou from the alder carr', region: 'Europe' },
        // Day 191 (Jul 10)
        { name: 'Bearded Reedling', scientific: 'Panurus biarmicus', description: 'Pings across the reed bed like a tiny bell', region: 'Europe' },
        // Day 192 (Jul 11)
        { name: 'Common Whitethroat', scientific: 'Curruca communis', description: 'Scratchy song rising from the nettles', region: 'Europe' },
        // Day 193 (Jul 12)
        { name: 'Hawfinch', scientific: 'Coccothraustes coccothraustes', description: 'Cracks cherry stones with its enormous beak', region: 'Europe' },
        // Day 194 (Jul 13)
        { name: 'Tree Pipit', scientific: 'Anthus trivialis', description: 'Parachutes down from the treetop trailing notes', region: 'Europe' },
        // Day 195 (Jul 14)
        { name: 'Melodious Warbler', scientific: 'Hippolais polyglotta', description: 'Lives up to its name in the Mediterranean scrub', region: 'Europe' },
        // Day 196 (Jul 15)
        { name: 'Sardinian Warbler', scientific: 'Curruca melanocephala', description: 'Red-eyed and restless in the olive groves', region: 'Mediterranean' },
        // Day 197 (Jul 16)
        { name: 'Orphean Warbler', scientific: 'Curruca hortensis', description: 'Named for Orpheus, it nearly earns the title', region: 'Mediterranean' },
        // Day 198 (Jul 17)
        { name: 'Golden Oriole', scientific: 'Oriolus oriolus', description: 'A flash of gold heard more than seen', region: 'Europe' },
        // Day 199 (Jul 18)
        { name: 'Wallcreeper', scientific: 'Tichodroma muraria', description: 'Flutters crimson wings against grey cliffs', region: 'Europe' },
        // Day 200 (Jul 19)
        { name: 'Common Kingfisher', scientific: 'Alcedo atthis', description: 'A blue arrow shot along the stream and into memory', region: 'Europe' },

        // ──────────────────────────────────────────────
        // Days 201-250: Americas
        // ──────────────────────────────────────────────

        // Day 201 (Jul 20)
        { name: 'Northern Cardinal', scientific: 'Cardinalis cardinalis', description: 'A red flame against the snow that never goes out', region: 'North America' },
        // Day 202 (Jul 21)
        { name: 'American Robin', scientific: 'Turdus migratorius', description: 'Cheerily cheerio, the first voice of morning', region: 'North America' },
        // Day 203 (Jul 22)
        { name: 'Blue Jay', scientific: 'Cyanocitta cristata', description: 'Bold and brilliant, shouting through the oaks', region: 'North America' },
        // Day 204 (Jul 23)
        { name: 'Ruby-throated Hummingbird', scientific: 'Archilochus colubris', description: 'Suspends itself before the flower like a question mark', region: 'North America' },
        // Day 205 (Jul 24)
        { name: 'Wood Thrush', scientific: 'Hylocichla mustelina', description: 'Sings at dusk in harmonics that ache', region: 'North America' },
        // Day 206 (Jul 25)
        { name: 'Baltimore Oriole', scientific: 'Icterus galbula', description: 'Weaves a hanging nest like a knitted stocking', region: 'North America' },
        // Day 207 (Jul 26)
        { name: 'American Goldfinch', scientific: 'Spinus tristis', description: 'Dips through the air in waves of yellow', region: 'North America' },
        // Day 208 (Jul 27)
        { name: 'Eastern Bluebird', scientific: 'Sialia sialis', description: 'Carries the sky on its back, the earth on its breast', region: 'North America' },
        // Day 209 (Jul 28)
        { name: 'Resplendent Quetzal', scientific: 'Pharomachrus mocinno', description: 'So beautiful it was once a god', region: 'Central America' },
        // Day 210 (Jul 29)
        { name: 'Black-capped Chickadee', scientific: 'Poecile atricapillus', description: 'Chick-a-dee-dee-dee, friendly in every weather', region: 'North America' },
        // Day 211 (Jul 30)
        { name: 'Carolina Wren', scientific: 'Thryothorus ludovicianus', description: 'Teakettle teakettle, loud enough for ten wrens', region: 'North America' },
        // Day 212 (Jul 31)
        { name: 'Scarlet Tanager', scientific: 'Piranga olivacea', description: 'A coal dipped in red paint, perched in the canopy', region: 'North America' },
        // Day 213 (Aug 1)
        { name: 'Painted Bunting', scientific: 'Passerina ciris', description: 'Every colour a bird could wish for, all at once', region: 'North America' },
        // Day 214 (Aug 2)
        { name: 'Toco Toucan', scientific: 'Ramphastos toco', description: 'That enormous beak holding the whole jungle in balance', region: 'South America' },
        // Day 215 (Aug 3)
        { name: 'Andean Cock-of-the-rock', scientific: 'Rupicola peruvianus', description: 'Blazing orange on the cliff, demanding attention', region: 'South America' },
        // Day 216 (Aug 4)
        { name: 'Hermit Thrush', scientific: 'Catharus guttatus', description: 'The purest voice in the North American woods', region: 'North America' },
        // Day 217 (Aug 5)
        { name: 'Rufous Hummingbird', scientific: 'Selasphorus rufus', description: 'Fierce and copper, defending its patch of flowers', region: 'North America' },
        // Day 218 (Aug 6)
        { name: 'Cedar Waxwing', scientific: 'Bombycilla cedrorum', description: 'Passes berries beak to beak along the branch', region: 'North America' },
        // Day 219 (Aug 7)
        { name: 'Harpy Eagle', scientific: 'Harpia harpyja', description: 'The forest crown, heavy-winged and silent', region: 'South America' },
        // Day 220 (Aug 8)
        { name: 'Scissor-tailed Flycatcher', scientific: 'Tyrannus forficatus', description: 'Opens and closes its tail like elegant scissors', region: 'North America' },
        // Day 221 (Aug 9)
        { name: 'Anna\'s Hummingbird', scientific: 'Calypte anna', description: 'Its gorget blazes magenta in the California sun', region: 'North America' },
        // Day 222 (Aug 10)
        { name: 'Hoatzin', scientific: 'Opisthocomus hoazin', description: 'Ancient and peculiar, smelling of fresh leaves', region: 'South America' },
        // Day 223 (Aug 11)
        { name: 'Western Meadowlark', scientific: 'Sturnella neglecta', description: 'Pours a fluting song over the prairie', region: 'North America' },
        // Day 224 (Aug 12)
        { name: 'Magnificent Frigatebird', scientific: 'Fregata magnificens', description: 'Inflates a red balloon of love above the sea', region: 'Americas' },
        // Day 225 (Aug 13)
        { name: 'Vermilion Flycatcher', scientific: 'Pyrocephalus rubinus', description: 'A spark that escaped the campfire and learned to fly', region: 'Americas' },
        // Day 226 (Aug 14)
        { name: 'Ovenbird', scientific: 'Seiurus aurocapilla', description: 'Teacher TEACHER, louder with each step', region: 'North America' },
        // Day 227 (Aug 15)
        { name: 'Hyacinth Macaw', scientific: 'Anodorhynchus hyacinthinus', description: 'Blue deeper than any sky, calling across the wetland', region: 'South America' },
        // Day 228 (Aug 16)
        { name: 'Bobolink', scientific: 'Dolichonyx oryzivorus', description: 'Bubbles over the hay field like electronic joy', region: 'North America' },
        // Day 229 (Aug 17)
        { name: 'Violet-crowned Woodnymph', scientific: 'Thalurania colombica', description: 'A violet crown in the understorey shadows', region: 'Central America' },
        // Day 230 (Aug 18)
        { name: 'Roseate Spoonbill', scientific: 'Platalea ajaja', description: 'Sweeps its bill through the shallows, impossibly pink', region: 'Americas' },
        // Day 231 (Aug 19)
        { name: 'Brown Thrasher', scientific: 'Toxostoma rufum', description: 'Sings a thousand songs from the hedge', region: 'North America' },
        // Day 232 (Aug 20)
        { name: 'Keel-billed Toucan', scientific: 'Ramphastos sulfuratus', description: 'Rainbow-billed and croaking from the cecropia', region: 'Central America' },
        // Day 233 (Aug 21)
        { name: 'White-throated Sparrow', scientific: 'Zonotrichia albicollis', description: 'Oh sweet Canada Canada Canada, a homesick hymn', region: 'North America' },
        // Day 234 (Aug 22)
        { name: 'Burrowing Owl', scientific: 'Athene cunicularia', description: 'Stands at its front door, watching the prairie sunset', region: 'Americas' },
        // Day 235 (Aug 23)
        { name: 'Great Kiskadee', scientific: 'Pitangus sulphuratus', description: 'Shouts its own name from the riverbank', region: 'Americas' },
        // Day 236 (Aug 24)
        { name: 'Yellow Warbler', scientific: 'Setophaga petechia', description: 'Sweet sweet sweet, a little more sweet', region: 'North America' },
        // Day 237 (Aug 25)
        { name: 'Long-tailed Manakin', scientific: 'Chiroxiphia linearis', description: 'Two males dance together to win a single heart', region: 'Central America' },
        // Day 238 (Aug 26)
        { name: 'Red-winged Blackbird', scientific: 'Agelaius phoeniceus', description: 'Flashes its epaulettes from the cattails', region: 'North America' },
        // Day 239 (Aug 27)
        { name: 'Roadrunner', scientific: 'Geococcyx californianus', description: 'Sprints across the desert with comic determination', region: 'North America' },
        // Day 240 (Aug 28)
        { name: 'Andean Condor', scientific: 'Vultur gryphus', description: 'Ten-foot wings riding the Andes thermals in silence', region: 'South America' },
        // Day 241 (Aug 29)
        { name: 'Prothonotary Warbler', scientific: 'Protonotaria citrea', description: 'A golden lantern in the swamp cypress', region: 'North America' },
        // Day 242 (Aug 30)
        { name: 'Jabiru', scientific: 'Jabiru mycteria', description: 'Tall as a child, standing in the Pantanal shallows', region: 'South America' },
        // Day 243 (Aug 31)
        { name: 'Mountain Bluebird', scientific: 'Sialia currucoides', description: 'The colour of high altitude hope', region: 'North America' },
        // Day 244 (Sep 1)
        { name: 'Spangled Cotinga', scientific: 'Cotinga cayana', description: 'Turquoise and silent in the canopy, like a held secret', region: 'South America' },
        // Day 245 (Sep 2)
        { name: 'Northern Mockingbird', scientific: 'Mimus polyglottos', description: 'Sings all night, borrowing everyone else\'s songs', region: 'North America' },
        // Day 246 (Sep 3)
        { name: 'Boat-billed Heron', scientific: 'Cochlearius cochlearius', description: 'Wide-eyed in the mangrove darkness, patient as stone', region: 'Central America' },
        // Day 247 (Sep 4)
        { name: 'Indigo Bunting', scientific: 'Passerina cyanea', description: 'Navigates by the stars, sings the colour of deep water', region: 'North America' },
        // Day 248 (Sep 5)
        { name: 'Sword-billed Hummingbird', scientific: 'Ensifera ensifera', description: 'The only bird whose bill is longer than its body', region: 'South America' },
        // Day 249 (Sep 6)
        { name: 'Varied Thrush', scientific: 'Ixoreus naevius', description: 'One long note ringing through the wet forest', region: 'North America' },
        // Day 250 (Sep 7)
        { name: 'Turquoise-browed Motmot', scientific: 'Eumomota superciliosa', description: 'Swings its racket tail like a slow pendulum', region: 'Central America' },

        // ──────────────────────────────────────────────
        // Days 251-300: Africa
        // ──────────────────────────────────────────────

        // Day 251 (Sep 8)
        { name: 'Lilac-breasted Roller', scientific: 'Coracias caudatus', description: 'Every colour of the African sky in one bird', region: 'Africa' },
        // Day 252 (Sep 9)
        { name: 'African Fish Eagle', scientific: 'Haliaeetus vocifer', description: 'Its cry is the sound of wild water and open sky', region: 'Africa' },
        // Day 253 (Sep 10)
        { name: 'Superb Starling', scientific: 'Lamprotornis superbus', description: 'Iridescent blue over rust, superb by name and nature', region: 'East Africa' },
        // Day 254 (Sep 11)
        { name: 'Grey Crowned Crane', scientific: 'Balearica regulorum', description: 'Dances with a golden crown in the savanna grass', region: 'Africa' },
        // Day 255 (Sep 12)
        { name: 'African Grey Parrot', scientific: 'Psittacus erithacus', description: 'Thinks before it speaks, and then surprises you', region: 'West Africa' },
        // Day 256 (Sep 13)
        { name: 'Southern Yellow-billed Hornbill', scientific: 'Tockus leucomelas', description: 'Casually enormous beak, clicking along the branch', region: 'Southern Africa' },
        // Day 257 (Sep 14)
        { name: 'Malachite Sunbird', scientific: 'Nectarinia famosa', description: 'Green metallic fire hovering at the protea', region: 'Southern Africa' },
        // Day 258 (Sep 15)
        { name: 'Secretary Bird', scientific: 'Sagittarius serpentarius', description: 'Strides across the plain like a clerk with urgent mail', region: 'Africa' },
        // Day 259 (Sep 16)
        { name: 'Pin-tailed Whydah', scientific: 'Vidua macroura', description: 'Trails ribbons of tail in a bouncing display', region: 'Africa' },
        // Day 260 (Sep 17)
        { name: 'African Penguin', scientific: 'Spheniscus demersus', description: 'Brays on the beach like a small donkey in a tuxedo', region: 'Southern Africa' },
        // Day 261 (Sep 18)
        { name: 'Red-billed Firefinch', scientific: 'Lagonosticta senegala', description: 'A hot coal sitting in the dust, glowing quietly', region: 'Africa' },
        // Day 262 (Sep 19)
        { name: 'Village Weaver', scientific: 'Ploceus cucullatus', description: 'Weaves a nest so intricate it could be a love letter', region: 'Africa' },
        // Day 263 (Sep 20)
        { name: 'Crowned Eagle', scientific: 'Stephanoaetus coronatus', description: 'Silent power threading through the forest canopy', region: 'Africa' },
        // Day 264 (Sep 21)
        { name: 'Helmeted Guineafowl', scientific: 'Numida meleagris', description: 'Spotted and noisy, running in a panic over nothing', region: 'Africa' },
        // Day 265 (Sep 22)
        { name: 'Cape Sugarbird', scientific: 'Promerops cafer', description: 'Long-tailed and sweet-toothed among the fynbos', region: 'Southern Africa' },
        // Day 266 (Sep 23)
        { name: 'Red-billed Oxpecker', scientific: 'Buphagus erythrorynchus', description: 'Rides the buffalo like a tiny cowboy', region: 'Africa' },
        // Day 267 (Sep 24)
        { name: 'African Pitta', scientific: 'Pitta angolensis', description: 'A rainbow hiding on the forest floor', region: 'Africa' },
        // Day 268 (Sep 25)
        { name: 'Shoebill', scientific: 'Balaeniceps rex', description: 'Stands absolutely still, looking prehistoric and patient', region: 'Central Africa' },
        // Day 269 (Sep 26)
        { name: 'Southern Red Bishop', scientific: 'Euplectes orix', description: 'Puffs up scarlet and black, a small burning bush', region: 'Southern Africa' },
        // Day 270 (Sep 27)
        { name: 'Hamerkop', scientific: 'Scopus umbretta', description: 'Builds the largest nest of any bird, a cathedral of sticks', region: 'Africa' },
        // Day 271 (Sep 28)
        { name: 'White-fronted Bee-eater', scientific: 'Merops bullockoides', description: 'Launches from the riverbank in a blaze of colour', region: 'Africa' },
        // Day 272 (Sep 29)
        { name: 'Marabou Stork', scientific: 'Leptoptilos crumenifer', description: 'Ugly and magnificent, the undertaker of the savanna', region: 'Africa' },
        // Day 273 (Sep 30)
        { name: 'African Paradise Flycatcher', scientific: 'Terpsiphone viridis', description: 'Long russet streamers flowing through the woodland', region: 'Africa' },
        // Day 274 (Oct 1)
        { name: 'Violet-backed Starling', scientific: 'Cinnyricinclus leucogaster', description: 'Plum-purple above and white below, a living amethyst', region: 'Africa' },
        // Day 275 (Oct 2)
        { name: 'Kori Bustard', scientific: 'Ardeotis kori', description: 'The heaviest flying bird, walking with regal patience', region: 'Africa' },
        // Day 276 (Oct 3)
        { name: 'Yellow-billed Stork', scientific: 'Mycteria ibis', description: 'Wades through the shallows with its bill slightly open', region: 'Africa' },
        // Day 277 (Oct 4)
        { name: 'Black-headed Weaver', scientific: 'Ploceus melanocephalus', description: 'Hangs upside down from its woven masterpiece', region: 'Africa' },
        // Day 278 (Oct 5)
        { name: 'Abyssinian Roller', scientific: 'Coracias abyssinicus', description: 'Long-tailed and blue, tumbling through the hot air', region: 'Africa' },
        // Day 279 (Oct 6)
        { name: 'Red-chested Cuckoo', scientific: 'Cuculus solitarius', description: 'Calls piet-my-vrou across the misty garden', region: 'Africa' },
        // Day 280 (Oct 7)
        { name: 'African Emerald Cuckoo', scientific: 'Chrysococcyx cupreus', description: 'Green fire calling from the canopy in four clear notes', region: 'Africa' },
        // Day 281 (Oct 8)
        { name: 'Bateleur Eagle', scientific: 'Terathopius ecaudatus', description: 'Rocks its wings like a tightrope walker over the bush', region: 'Africa' },
        // Day 282 (Oct 9)
        { name: 'Green Wood Hoopoe', scientific: 'Phoeniculus purpureus', description: 'Cackles along the branch in a glossy green gang', region: 'Africa' },
        // Day 283 (Oct 10)
        { name: 'Cape Glossy Starling', scientific: 'Lamprotornis nitens', description: 'Shifts between blue and green like an oil slick on water', region: 'Southern Africa' },
        // Day 284 (Oct 11)
        { name: 'Orange-breasted Sunbird', scientific: 'Anthobaphes violacea', description: 'Sips from the ericas with a curved bill and bright belly', region: 'Southern Africa' },
        // Day 285 (Oct 12)
        { name: 'Martial Eagle', scientific: 'Polemaetus bellicosus', description: 'Surveys its domain from impossible heights', region: 'Africa' },
        // Day 286 (Oct 13)
        { name: 'Long-crested Eagle', scientific: 'Lophaetus occipitalis', description: 'A punk-rock silhouette on the telephone pole', region: 'Africa' },
        // Day 287 (Oct 14)
        { name: 'Speckled Mousebird', scientific: 'Colius striatus', description: 'Hangs in a cluster like feathered fruit', region: 'Africa' },
        // Day 288 (Oct 15)
        { name: 'Pygmy Kingfisher', scientific: 'Ispidina picta', description: 'Impossibly small and jewel-bright in the woodland', region: 'Africa' },
        // Day 289 (Oct 16)
        { name: 'Southern Ground Hornbill', scientific: 'Bucorvus leadbeateri', description: 'Booms across the savanna at dawn like a bassoon', region: 'Africa' },
        // Day 290 (Oct 17)
        { name: 'Black-collared Barbet', scientific: 'Lybius torquatus', description: 'Duets with its mate in perfect synchronized rhythm', region: 'Southern Africa' },
        // Day 291 (Oct 18)
        { name: 'Saddle-billed Stork', scientific: 'Ephippiorhynchus senegalensis', description: 'Red, black, and yellow beak like a painted masterwork', region: 'Africa' },
        // Day 292 (Oct 19)
        { name: 'Greater Flamingo', scientific: 'Phoenicopterus roseus', description: 'Stands on one leg in pink contemplation', region: 'Africa' },
        // Day 293 (Oct 20)
        { name: 'Woodland Kingfisher', scientific: 'Halcyon senegalensis', description: 'Announces the rain with a trilling descending call', region: 'Africa' },
        // Day 294 (Oct 21)
        { name: 'Wattled Crane', scientific: 'Grus carunculata', description: 'Tall and rare, stepping through the floodplain', region: 'Africa' },
        // Day 295 (Oct 22)
        { name: 'Double-toothed Barbet', scientific: 'Pogonornis dubius', description: 'Red and black, calling heavily from the fig tree', region: 'West Africa' },
        // Day 296 (Oct 23)
        { name: 'African Hoopoe', scientific: 'Upupa africana', description: 'Raises its crest like a feathered crown of surprise', region: 'Africa' },
        // Day 297 (Oct 24)
        { name: 'Eastern Bronze-naped Pigeon', scientific: 'Columba delegorguei', description: 'A soft presence in the montane forest canopy', region: 'East Africa' },
        // Day 298 (Oct 25)
        { name: 'White-bellied Go-away-bird', scientific: 'Corythaixoides leucogaster', description: 'Literally screams go away at passing predators', region: 'East Africa' },
        // Day 299 (Oct 26)
        { name: 'Fischer\'s Lovebird', scientific: 'Agapornis fischeri', description: 'Never far from its mate, pressed together on the branch', region: 'East Africa' },
        // Day 300 (Oct 27)
        { name: 'Ostrich', scientific: 'Struthio camelus', description: 'Runs across the plain with absurd magnificent speed', region: 'Africa' },

        // ──────────────────────────────────────────────
        // Days 301-340: More worldwide songbirds
        // ──────────────────────────────────────────────

        // Day 301 (Oct 28)
        { name: 'Japanese Waxwing', scientific: 'Bombycilla japonica', description: 'Passes fruit to its neighbour with gentle courtesy', region: 'East Asia' },
        // Day 302 (Oct 29)
        { name: 'Azure-winged Magpie', scientific: 'Cyanopica cyanus', description: 'Pale blue wings flashing through the cork oaks', region: 'East Asia' },
        // Day 303 (Oct 30)
        { name: 'Varied Tit', scientific: 'Sittiparus varius', description: 'Bright and busy in the Japanese maples', region: 'East Asia' },
        // Day 304 (Oct 31)
        { name: 'Taiwan Blue Magpie', scientific: 'Urocissa caerulea', description: 'Long-tailed and fearless in the mountain forest', region: 'Taiwan' },
        // Day 305 (Nov 1)
        { name: 'Siberian Jay', scientific: 'Perisoreus infaustus', description: 'Follows you through the boreal forest like a guide', region: 'Northern Europe' },
        // Day 306 (Nov 2)
        { name: 'Red Crossbill', scientific: 'Loxia curvirostra', description: 'Its crossed bill opens pine cones like no other', region: 'Northern Hemisphere' },
        // Day 307 (Nov 3)
        { name: 'Bohemian Waxwing', scientific: 'Bombycilla garrulus', description: 'Arrives in winter flocks like silk-masked wanderers', region: 'Northern Hemisphere' },
        // Day 308 (Nov 4)
        { name: 'Daurian Redstart', scientific: 'Phoenicurus auroreus', description: 'Flickers its orange tail by the temple steps', region: 'East Asia' },
        // Day 309 (Nov 5)
        { name: 'Siberian Thrush', scientific: 'Geokichla sibirica', description: 'Dark and mysterious, a shadow with a song', region: 'East Asia' },
        // Day 310 (Nov 6)
        { name: 'Chestnut-flanked White-eye', scientific: 'Zosterops erythropleurus', description: 'Tiny spectacles peering through the bamboo', region: 'East Asia' },
        // Day 311 (Nov 7)
        { name: 'Brown Dipper', scientific: 'Cinclus pallasii', description: 'Dives into the mountain stream without hesitation', region: 'Asia' },
        // Day 312 (Nov 8)
        { name: 'Crested Lark', scientific: 'Galerida cristata', description: 'Sings from the dusty roadside with a pointed crown', region: 'Eurasia' },
        // Day 313 (Nov 9)
        { name: 'Bluethroat', scientific: 'Luscinia svecica', description: 'A patch of sky sewn onto its throat', region: 'Eurasia' },
        // Day 314 (Nov 10)
        { name: 'Rufous-bellied Niltava', scientific: 'Niltava sundara', description: 'Blue and orange like a sunset made small', region: 'Himalayas' },
        // Day 315 (Nov 11)
        { name: 'White-capped Redstart', scientific: 'Phoenicurus leucocephalus', description: 'Bobs on the Himalayan stream rocks, tail fanning', region: 'Central Asia' },
        // Day 316 (Nov 12)
        { name: 'Grandala', scientific: 'Grandala coelicolor', description: 'Pure blue at high altitude, a piece of sky with wings', region: 'Himalayas' },
        // Day 317 (Nov 13)
        { name: 'Red Avadavat', scientific: 'Amandava amandava', description: 'Spotted with white stars on a crimson field', region: 'South Asia' },
        // Day 318 (Nov 14)
        { name: 'Long-tailed Minivet', scientific: 'Pericrocotus ethologus', description: 'Scarlet and black, painting the treetops', region: 'Asia' },
        // Day 319 (Nov 15)
        { name: 'Green Magpie', scientific: 'Cissa chinensis', description: 'Startling green and red, a bird from a painting', region: 'Southeast Asia' },
        // Day 320 (Nov 16)
        { name: 'Chestnut-bellied Nuthatch', scientific: 'Sitta cinnamoventris', description: 'Walks down the oak trunk like gravity is optional', region: 'South Asia' },
        // Day 321 (Nov 17)
        { name: 'Crimson-backed Tanager', scientific: 'Ramphocelus dimidiatus', description: 'Velvet crimson glowing from the dark understorey', region: 'South America' },
        // Day 322 (Nov 18)
        { name: 'Paradise Tanager', scientific: 'Tangara chilensis', description: 'Green head, blue belly, red back, nature showing off', region: 'South America' },
        // Day 323 (Nov 19)
        { name: 'Bali Myna', scientific: 'Leucopsar rothschildi', description: 'White and rare, a prayer for its own survival', region: 'Indonesia' },
        // Day 324 (Nov 20)
        { name: 'Philippine Eagle', scientific: 'Pithecophaga jefferyi', description: 'Enormous and noble, the monkey-eating eagle of legend', region: 'Philippines' },
        // Day 325 (Nov 21)
        { name: 'Rufous-tailed Jacamar', scientific: 'Galbula ruficauda', description: 'Glitters like a hummingbird but catches butterflies', region: 'South America' },
        // Day 326 (Nov 22)
        { name: 'Eurasian Penduline Tit', scientific: 'Remiz pendulinus', description: 'Builds a felted pouch that sways in the breeze', region: 'Eurasia' },
        // Day 327 (Nov 23)
        { name: 'White-browed Tit-warbler', scientific: 'Leptopoecile sophiae', description: 'Violet and lavender, a tiny jewel of the high plateau', region: 'Central Asia' },
        // Day 328 (Nov 24)
        { name: 'Sri Lanka Blue Magpie', scientific: 'Urocissa ornata', description: 'Endemic and exquisite in the cloud forest', region: 'Sri Lanka' },
        // Day 329 (Nov 25)
        { name: 'Green-headed Tanager', scientific: 'Tangara seledon', description: 'Blue, green, orange, all at once in the Atlantic forest', region: 'South America' },
        // Day 330 (Nov 26)
        { name: 'Scarlet Minivet', scientific: 'Pericrocotus speciosus', description: 'He is scarlet, she is yellow, both are radiant', region: 'Asia' },
        // Day 331 (Nov 27)
        { name: 'Indian Pitta', scientific: 'Pitta brachyura', description: 'Nine colours on one bird, walking the monsoon forest floor', region: 'South Asia' },
        // Day 332 (Nov 28)
        { name: 'Pale-billed Flowerpecker', scientific: 'Dicaeum erythrorhynchos', description: 'So small it barely bends the branch it lands on', region: 'South Asia' },
        // Day 333 (Nov 29)
        { name: 'Black-throated Bushtit', scientific: 'Aegithalos concinnus', description: 'Acrobatic and tiny, swinging through the oaks', region: 'Asia' },
        // Day 334 (Nov 30)
        { name: 'Fire-tailed Sunbird', scientific: 'Aethopyga ignicauda', description: 'A tail like a lit match at high altitude', region: 'Himalayas' },
        // Day 335 (Dec 1)
        { name: 'Temminck\'s Tragopan', scientific: 'Tragopan temminckii', description: 'Inflates a blue bib like a living work of art', region: 'East Asia' },
        // Day 336 (Dec 2)
        { name: 'Golden Pheasant', scientific: 'Chrysolophus pictus', description: 'Wears a cape of gold that would shame a king', region: 'China' },
        // Day 337 (Dec 3)
        { name: 'Lady Amherst\'s Pheasant', scientific: 'Chrysolophus amherstiae', description: 'A cape of black and white scales, deeply theatrical', region: 'China' },
        // Day 338 (Dec 4)
        { name: 'Nicobar Pigeon', scientific: 'Caloenas nicobarica', description: 'Iridescent green mane flowing over island soil', region: 'Southeast Asia' },
        // Day 339 (Dec 5)
        { name: 'Rainbow Pitta', scientific: 'Pitta iris', description: 'Hops through the monsoon vine thicket like a painted toy', region: 'Australia' },
        // Day 340 (Dec 6)
        { name: 'Wilson\'s Bird-of-Paradise', scientific: 'Cicinnurus respublica', description: 'Bare blue head and curled tail, dancing on a cleared stage', region: 'Indonesia' },

        // ──────────────────────────────────────────────
        // Days 341-365: Arctic, oceanic, and rare wanderers
        // ──────────────────────────────────────────────

        // Day 341 (Dec 7)
        { name: 'Snowy Owl', scientific: 'Bubo scandiacus', description: 'White wings over the tundra, silent as snowfall', region: 'Arctic' },
        // Day 342 (Dec 8)
        { name: 'Arctic Tern', scientific: 'Sterna paradisaea', description: 'Chases the sun from pole to pole, never resting', region: 'Arctic' },
        // Day 343 (Dec 9)
        { name: 'Puffin', scientific: 'Fratercula arctica', description: 'Stands on the cliff edge with a beak full of fish and dignity', region: 'North Atlantic' },
        // Day 344 (Dec 10)
        { name: 'Emperor Penguin', scientific: 'Aptenodytes forsteri', description: 'Holds an egg on its feet through the Antarctic winter', region: 'Antarctica' },
        // Day 345 (Dec 11)
        { name: 'Wandering Albatross', scientific: 'Diomedea exulans', description: 'The widest wings on earth, tracing the Southern Ocean', region: 'Southern Ocean' },
        // Day 346 (Dec 12)
        { name: 'Blue-footed Booby', scientific: 'Sula nebouxii', description: 'Lifts its blue feet in a courtship dance of pure devotion', region: 'Pacific' },
        // Day 347 (Dec 13)
        { name: 'Laysan Albatross', scientific: 'Phoebastria immutabilis', description: 'Returns to the same mate, the same nest, year after year', region: 'Pacific' },
        // Day 348 (Dec 14)
        { name: 'Snow Bunting', scientific: 'Plectrophenax nivalis', description: 'A snowflake that learned to sing on the winter wind', region: 'Arctic' },
        // Day 349 (Dec 15)
        { name: 'Northern Gannet', scientific: 'Morus bassanus', description: 'Dives from great height into the sea like a white arrow', region: 'North Atlantic' },
        // Day 350 (Dec 16)
        { name: 'Ivory Gull', scientific: 'Pagophila eburnea', description: 'Pure white on the ice edge, a ghost of the frozen sea', region: 'Arctic' },
        // Day 351 (Dec 17)
        { name: 'Gyrfalcon', scientific: 'Falco rusticolus', description: 'The largest falcon, white as the Arctic sky', region: 'Arctic' },
        // Day 352 (Dec 18)
        { name: 'King Penguin', scientific: 'Aptenodytes patagonicus', description: 'Orange-eared and stately on the sub-Antarctic shore', region: 'Sub-Antarctic' },
        // Day 353 (Dec 19)
        { name: 'Steller\'s Sea Eagle', scientific: 'Haliaeetus pelagicus', description: 'Enormous and painted in black and white and gold', region: 'Northeast Asia' },
        // Day 354 (Dec 20)
        { name: 'Red Phalarope', scientific: 'Phalaropus fulicarius', description: 'Spins on the water in tiny circles, stirring up life', region: 'Arctic' },
        // Day 355 (Dec 21)
        { name: 'Long-tailed Jaeger', scientific: 'Stercorarius longicaudus', description: 'Trails streamers across the tundra sky on the shortest day', region: 'Arctic' },
        // Day 356 (Dec 22)
        { name: 'Razorbill', scientific: 'Alca torda', description: 'Black and white on the cliff ledge, steady and sure', region: 'North Atlantic' },
        // Day 357 (Dec 23)
        { name: 'Waved Albatross', scientific: 'Phoebastria irrorata', description: 'Fences bills with its lifelong partner on the equator', region: 'Galapagos' },
        // Day 358 (Dec 24)
        { name: 'Christmas Frigatebird', scientific: 'Fregata andrewsi', description: 'Named for the island, soaring on Christmas Eve thermals', region: 'Indian Ocean' },
        // Day 359 (Dec 25)
        { name: 'Red-crested Turaco', scientific: 'Tauraco erythrolophus', description: 'A crimson crest bright enough to be a gift', region: 'Africa' },
        // Day 360 (Dec 26)
        { name: 'Rockhopper Penguin', scientific: 'Eudyptes chrysocome', description: 'Bounces up the cliff face with absurd yellow eyebrows', region: 'Sub-Antarctic' },
        // Day 361 (Dec 27)
        { name: 'Crested Auklet', scientific: 'Aethia cristatella', description: 'Smells of tangerines and bobs its forehead plume', region: 'North Pacific' },
        // Day 362 (Dec 28)
        { name: 'South Polar Skua', scientific: 'Stercorarius maccormicki', description: 'Bold and dark, patrolling the ice edge', region: 'Antarctica' },
        // Day 363 (Dec 29)
        { name: 'Black-browed Albatross', scientific: 'Thalassarche melanophris', description: 'Glides low over the wave crests with dark brows furrowed', region: 'Southern Ocean' },
        // Day 364 (Dec 30)
        { name: 'Kiwi', scientific: 'Apteryx mantelli', description: 'Whiskers in the dark, a bird that chose the earth over the sky', region: 'New Zealand' },
        // Day 365 (Dec 31)
        { name: 'Common Nightingale', scientific: 'Luscinia megarhynchos', description: 'The last song of the year, singing you into what comes next', region: 'Europe' }
    ];

    // ──────────────────────────────────────────────
    // Utility: get the day of the year (1-365/366)
    // ──────────────────────────────────────────────
    function getDayOfYear(date) {
        var d = date || new Date();
        var start = new Date(d.getFullYear(), 0, 0);
        var diff = d - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    // ──────────────────────────────────────────────
    // Get today's bird based on day-of-year
    // ──────────────────────────────────────────────
    function getTodaysBird() {
        var dayOfYear = getDayOfYear();
        var index = ((dayOfYear - 1) % BIRDS.length + BIRDS.length) % BIRDS.length;
        return {
            name: BIRDS[index].name,
            scientific: BIRDS[index].scientific,
            description: BIRDS[index].description,
            region: BIRDS[index].region,
            dayOfYear: dayOfYear,
            dayIndex: index
        };
    }

    // ──────────────────────────────────────────────
    // Synthesize a bird chirp using Web Audio API
    // Pleasant sine/triangle oscillators with
    // frequency sweeps, gentle volume envelopes,
    // and slight randomization.
    // Deterministic per bird (same index = same chirp).
    // ──────────────────────────────────────────────
    function playChirp(birdData) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            return;
        }

        var ctx = new AudioContext();
        var index = birdData.dayIndex !== undefined ? birdData.dayIndex : 0;

        // Seeded pseudo-random number generator (mulberry32)
        // This makes the chirp deterministic per bird index
        function mulberry32(seed) {
            return function() {
                seed |= 0;
                seed = seed + 0x6D2B79F5 | 0;
                var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }

        var rand = mulberry32(index * 2654435761);

        // Bird chirp characteristics derived from the index
        var baseFreq = 1800 + rand() * 3200;       // 1800-5000 Hz base
        var noteCount = Math.floor(1 + rand() * 4); // 1-4 notes per chirp
        var noteDuration = 0.06 + rand() * 0.14;    // 0.06-0.20s per note
        var noteGap = 0.04 + rand() * 0.08;         // gap between notes
        var freqSweep = (rand() - 0.5) * 1600;      // frequency sweep per note
        var vibratoRate = 15 + rand() * 35;          // vibrato speed
        var vibratoDepth = 10 + rand() * 60;         // vibrato depth in Hz
        var chirpRepeat = Math.floor(1 + rand() * 2); // 1-2 chirp repeats
        var repeatGap = 0.15 + rand() * 0.2;        // gap between repeats
        var waveType = rand() > 0.5 ? 'sine' : 'triangle';
        var overallVolume = 0.08 + rand() * 0.07;   // keep it gentle: 0.08-0.15

        var masterGain = ctx.createGain();
        masterGain.gain.value = overallVolume;
        masterGain.connect(ctx.destination);

        var currentTime = ctx.currentTime + 0.05; // tiny initial delay

        for (var r = 0; r < chirpRepeat; r++) {
            for (var n = 0; n < noteCount; n++) {
                var startTime = currentTime + n * (noteDuration + noteGap);
                var noteFreq = baseFreq + (rand() - 0.5) * 400;

                // Main oscillator
                var osc = ctx.createOscillator();
                osc.type = waveType;
                osc.frequency.setValueAtTime(noteFreq, startTime);
                osc.frequency.linearRampToValueAtTime(
                    noteFreq + freqSweep,
                    startTime + noteDuration
                );

                // Vibrato LFO
                var vibrato = ctx.createOscillator();
                var vibratoGain = ctx.createGain();
                vibrato.type = 'sine';
                vibrato.frequency.value = vibratoRate;
                vibratoGain.gain.value = vibratoDepth;
                vibrato.connect(vibratoGain);
                vibratoGain.connect(osc.frequency);

                // Amplitude envelope (gentle attack, gentle release)
                var envelope = ctx.createGain();
                envelope.gain.setValueAtTime(0, startTime);
                envelope.gain.linearRampToValueAtTime(1, startTime + noteDuration * 0.15);
                envelope.gain.setValueAtTime(1, startTime + noteDuration * 0.6);
                envelope.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

                // Optional harmonics for richness (some birds)
                if (rand() > 0.4) {
                    var harmonic = ctx.createOscillator();
                    var harmGain = ctx.createGain();
                    harmonic.type = 'sine';
                    harmonic.frequency.setValueAtTime(noteFreq * 2, startTime);
                    harmonic.frequency.linearRampToValueAtTime(
                        (noteFreq + freqSweep) * 2,
                        startTime + noteDuration
                    );
                    harmGain.gain.setValueAtTime(0, startTime);
                    harmGain.gain.linearRampToValueAtTime(0.3, startTime + noteDuration * 0.15);
                    harmGain.gain.setValueAtTime(0.3, startTime + noteDuration * 0.6);
                    harmGain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

                    harmonic.connect(harmGain);
                    harmGain.connect(masterGain);
                    harmonic.start(startTime);
                    harmonic.stop(startTime + noteDuration + 0.01);
                }

                osc.connect(envelope);
                envelope.connect(masterGain);

                osc.start(startTime);
                vibrato.start(startTime);
                osc.stop(startTime + noteDuration + 0.01);
                vibrato.stop(startTime + noteDuration + 0.01);
            }

            currentTime += noteCount * (noteDuration + noteGap) + repeatGap;
        }

        // Close the audio context after playback completes
        var totalDuration = currentTime - ctx.currentTime + 0.5;
        setTimeout(function() {
            ctx.close();
        }, totalDuration * 1000);

        return ctx;
    }

    // ──────────────────────────────────────────────
    // Try to load from Xeno-canto API,
    // fall back to synthesized chirp.
    // Xeno-canto often has CORS issues from
    // browser clients, so the synth is the
    // reliable primary path.
    // ──────────────────────────────────────────────
    async function playBirdSound(birdData) {
        try {
            var url = 'https://xeno-canto.org/api/2/recordings?query='
                + encodeURIComponent(birdData.scientific)
                + '&cnt=1';

            var response = await fetch(url);
            if (!response.ok) {
                throw new Error('Xeno-canto request failed');
            }

            var data = await response.json();
            if (data.recordings && data.recordings.length > 0) {
                var recordingUrl = data.recordings[0].file;
                if (recordingUrl) {
                    // Xeno-canto URLs may be protocol-relative
                    if (recordingUrl.indexOf('//') === 0) {
                        recordingUrl = 'https:' + recordingUrl;
                    }
                    var audio = new Audio(recordingUrl);
                    audio.volume = 0.3; // keep it gentle
                    await audio.play();
                    return audio;
                }
            }

            // No recordings found — fall back to synth
            playChirp(birdData);
        } catch (e) {
            // CORS error, network error, or anything else — fall back to synth
            playChirp(birdData);
        }
    }

    // ──────────────────────────────────────────────
    // Display today's bird on the page (optional
    // convenience — call this to add a bird info
    // element to the DOM).
    // ──────────────────────────────────────────────
    function showTodaysBird(containerId) {
        var bird = getTodaysBird();
        var container = document.getElementById(containerId);
        if (!container) {
            return bird;
        }

        var el = document.createElement('div');
        el.className = 'todays-bird';
        el.innerHTML =
            '<p class="bird-name">' + bird.name + '</p>' +
            '<p class="bird-scientific"><em>' + bird.scientific + '</em></p>' +
            '<p class="bird-description">' + bird.description + '</p>' +
            '<p class="bird-region">' + bird.region + ' &middot; Day ' + bird.dayOfYear + '</p>';

        container.appendChild(el);
        return bird;
    }

    // ──────────────────────────────────────────────
    // Public API
    // ──────────────────────────────────────────────
    return {
        BIRDS: BIRDS,
        getDayOfYear: getDayOfYear,
        getTodaysBird: getTodaysBird,
        playChirp: playChirp,
        playBirdSound: playBirdSound,
        showTodaysBird: showTodaysBird
    };
})();
