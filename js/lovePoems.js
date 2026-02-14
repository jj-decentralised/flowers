const LovePoems = (function() {
    'use strict';

    // Collection of love poem excerpts from diverse poets and traditions
    // Each entry: poet name, poem title (or "untitled"), the excerpt (2-4 lines), and the era/origin
    var POEMS = [
        // ── Pablo Neruda ──────────────────────────────────────────────
        {
            poet: 'Pablo Neruda',
            title: 'Sonnet XVII',
            lines: 'I love you without knowing how, or when, or from where.\nI love you simply, without problems or pride.',
            origin: 'Chilean, 20th century'
        },
        {
            poet: 'Pablo Neruda',
            title: 'Every Day You Play',
            lines: 'Every day you play with the light of the universe.\nSubtle visitor, you arrive in the flower and the water.',
            origin: 'Chilean, 20th century'
        },
        {
            poet: 'Pablo Neruda',
            title: 'Sonnet LXXX',
            lines: 'And from your hips to your feet I want to map\nthe long path to your small, transparent toes.',
            origin: 'Chilean, 20th century'
        },
        {
            poet: 'Pablo Neruda',
            title: 'If You Forget Me',
            lines: 'Well, now,\nif little by little you stop loving me\nI shall stop loving you little by little.',
            origin: 'Chilean, 20th century'
        },

        // ── Rumi ──────────────────────────────────────────────────────
        {
            poet: 'Rumi',
            title: 'untitled',
            lines: 'The minute I heard my first love story,\nI started looking for you, not knowing\nhow blind that was.',
            origin: 'Persian, 13th century'
        },
        {
            poet: 'Rumi',
            title: 'untitled',
            lines: 'Lovers don\'t finally meet somewhere.\nThey\'re in each other all along.',
            origin: 'Persian, 13th century'
        },
        {
            poet: 'Rumi',
            title: 'untitled',
            lines: 'I closed my eyes and spoke to you\nin a hundred silent ways.',
            origin: 'Persian, 13th century'
        },
        {
            poet: 'Rumi',
            title: 'untitled',
            lines: 'You are not a drop in the ocean.\nYou are the entire ocean in a drop.',
            origin: 'Persian, 13th century'
        },
        {
            poet: 'Rumi',
            title: 'The Tent',
            lines: 'Out beyond ideas of wrongdoing and rightdoing,\nthere is a field. I\'ll meet you there.',
            origin: 'Persian, 13th century'
        },

        // ── Hafiz ─────────────────────────────────────────────────────
        {
            poet: 'Hafiz',
            title: 'untitled',
            lines: 'I wish I could show you,\nwhen you are lonely or in darkness,\nthe astonishing light of your own being.',
            origin: 'Persian, 14th century'
        },
        {
            poet: 'Hafiz',
            title: 'untitled',
            lines: 'Even after all this time\nthe sun never says to the earth, "You owe me."\nLook what happens with a love like that. It lights the whole sky.',
            origin: 'Persian, 14th century'
        },
        {
            poet: 'Hafiz',
            title: 'untitled',
            lines: 'Stay close to any sounds\nthat make you glad you are alive.',
            origin: 'Persian, 14th century'
        },

        // ── Ibn Arabi ─────────────────────────────────────────────────
        {
            poet: 'Ibn Arabi',
            title: 'untitled',
            lines: 'My heart has become capable of every form:\na meadow for gazelles, a cloister for monks.',
            origin: 'Andalusian-Arabic, 12th century'
        },
        {
            poet: 'Ibn Arabi',
            title: 'Tarjuman al-Ashwaq',
            lines: 'O marvel! a garden amidst the flames.\nMy heart has become capable of every form.',
            origin: 'Andalusian-Arabic, 12th century'
        },

        // ── Sappho ───────────────────────────────────────────────────
        {
            poet: 'Sappho',
            title: 'Fragment 16',
            lines: 'Some say an army of horsemen, some of foot soldiers,\nsome of ships, is the fairest thing on the black earth,\nbut I say it is what you love.',
            origin: 'Greek, 6th century BCE'
        },
        {
            poet: 'Sappho',
            title: 'Fragment 31',
            lines: 'He seems to me equal to the gods, that man\nwho sits facing you and hears you nearby\nsweetly speaking.',
            origin: 'Greek, 6th century BCE'
        },
        {
            poet: 'Sappho',
            title: 'Fragment 130',
            lines: 'Eros once again limb-loosener whirls me —\nsweetbitter, impossible to fight off, creature stealing in.',
            origin: 'Greek, 6th century BCE'
        },
        {
            poet: 'Sappho',
            title: 'Fragment 147',
            lines: 'Someone will remember us,\nI say, even in another time.',
            origin: 'Greek, 6th century BCE'
        },

        // ── Ovid ──────────────────────────────────────────────────────
        {
            poet: 'Ovid',
            title: 'Amores',
            lines: 'If anyone asks why I write so many love poems,\nthe answer is simple: I am in love.',
            origin: 'Roman, 1st century BCE'
        },
        {
            poet: 'Ovid',
            title: 'Metamorphoses',
            lines: 'I am dragged along by a strange new force.\nDesire and reason are pulling in different directions.',
            origin: 'Roman, 1st century BCE'
        },

        // ── Kalidasa ──────────────────────────────────────────────────
        {
            poet: 'Kalidasa',
            title: 'Meghaduta',
            lines: 'Even the wind, I think, is sweet\nwhen it has touched you.',
            origin: 'Indian, 4th century'
        },
        {
            poet: 'Kalidasa',
            title: 'Shakuntala',
            lines: 'This is the way of love:\nthat the heart at once burns and blossoms.',
            origin: 'Indian, 4th century'
        },

        // ── Li Bai ────────────────────────────────────────────────────
        {
            poet: 'Li Bai',
            title: 'Quiet Night Thought',
            lines: 'Lifting my head I watch the bright moon,\nlowering my head I dream that I am home.',
            origin: 'Chinese, 8th century'
        },
        {
            poet: 'Li Bai',
            title: 'A Song of Changgan',
            lines: 'At fifteen I stopped scowling.\nI wanted to be with you as dust with its ashes.',
            origin: 'Chinese, 8th century'
        },
        {
            poet: 'Li Bai',
            title: 'The River Merchant\'s Wife: A Letter',
            lines: 'If you are coming down through the narrows of the river,\nplease let me know beforehand,\nand I will come out to meet you.',
            origin: 'Chinese, 8th century'
        },

        // ── John Keats ───────────────────────────────────────────────
        {
            poet: 'John Keats',
            title: 'Bright Star',
            lines: 'Bright star, would I were stedfast as thou art —\nNot in lone splendour hung aloft the night.',
            origin: 'English, 19th century'
        },
        {
            poet: 'John Keats',
            title: 'Letter to Fanny Brawne',
            lines: 'I cannot exist without you. I am forgetful\nof every thing but seeing you again.',
            origin: 'English, 19th century'
        },
        {
            poet: 'John Keats',
            title: 'Endymion',
            lines: 'A thing of beauty is a joy forever:\nIts loveliness increases; it will never\npass into nothingness.',
            origin: 'English, 19th century'
        },

        // ── Percy Bysshe Shelley ──────────────────────────────────────
        {
            poet: 'Percy Bysshe Shelley',
            title: 'Love\'s Philosophy',
            lines: 'Nothing in the world is single;\nAll things by a law divine\nIn one spirit meet and mingle.\nWhy not I with thine?',
            origin: 'English, 19th century'
        },
        {
            poet: 'Percy Bysshe Shelley',
            title: 'One Word Is Too Often Profaned',
            lines: 'One word is too often profaned\nfor me to profane it.\nOne feeling too falsely disdained\nfor thee to disdain it.',
            origin: 'English, 19th century'
        },

        // ── Lord Byron ────────────────────────────────────────────────
        {
            poet: 'Lord Byron',
            title: 'She Walks in Beauty',
            lines: 'She walks in beauty, like the night\nOf cloudless climes and starry skies.',
            origin: 'English, 19th century'
        },
        {
            poet: 'Lord Byron',
            title: 'So, We\'ll Go No More a Roving',
            lines: 'Though the night was made for loving,\nAnd the day returns too soon.',
            origin: 'English, 19th century'
        },

        // ── Elizabeth Barrett Browning ────────────────────────────────
        {
            poet: 'Elizabeth Barrett Browning',
            title: 'Sonnet 43',
            lines: 'How do I love thee? Let me count the ways.\nI love thee to the depth and breadth and height\nMy soul can reach.',
            origin: 'English, 19th century'
        },
        {
            poet: 'Elizabeth Barrett Browning',
            title: 'Sonnet 14',
            lines: 'If thou must love me, let it be for nought\nExcept for love\'s sake only.',
            origin: 'English, 19th century'
        },

        // ── Emily Dickinson ──────────────────────────────────────────
        {
            poet: 'Emily Dickinson',
            title: 'Wild Nights — Wild Nights!',
            lines: 'Rowing in Eden —\nAh, the Sea!\nMight I moor — Tonight —\nIn Thee!',
            origin: 'American, 19th century'
        },
        {
            poet: 'Emily Dickinson',
            title: 'That I did always love',
            lines: 'That I did always love,\nI bring thee proof:\nThat till I loved\nI did not love enough.',
            origin: 'American, 19th century'
        },
        {
            poet: 'Emily Dickinson',
            title: 'I cannot live with You',
            lines: 'Nor could I rise — with You —\nBecause Your Face\nWould put out Jesus\'.',
            origin: 'American, 19th century'
        },
        {
            poet: 'Emily Dickinson',
            title: 'If you were coming in the Fall',
            lines: 'If you were coming in the Fall,\nI\'d brush the Summer by\nWith half a smile, and half a spurn,\nAs Housewives do, a Fly.',
            origin: 'American, 19th century'
        },

        // ── Rainer Maria Rilke ───────────────────────────────────────
        {
            poet: 'Rainer Maria Rilke',
            title: 'Letters to a Young Poet',
            lines: 'For one human being to love another:\nthat is perhaps the most difficult of all our tasks,\nthe ultimate, the last test and proof.',
            origin: 'Bohemian-Austrian, 20th century'
        },
        {
            poet: 'Rainer Maria Rilke',
            title: 'Letters to a Young Poet',
            lines: 'The point of marriage is not to create a quick commonality\nby tearing down all boundaries;\nbut rather a good marriage is one in which\neach partner appoints the other to be the guardian of their solitude.',
            origin: 'Bohemian-Austrian, 20th century'
        },
        {
            poet: 'Rainer Maria Rilke',
            title: 'The Second Elegy',
            lines: 'Lovers, if they knew how, might utter\nstrange, marvelous words in the night air.',
            origin: 'Bohemian-Austrian, 20th century'
        },
        {
            poet: 'Rainer Maria Rilke',
            title: 'You Who Never Arrived',
            lines: 'You who never arrived in my arms,\nBeloved, who were lost from the start.',
            origin: 'Bohemian-Austrian, 20th century'
        },

        // ── Constantine P. Cavafy ────────────────────────────────────
        {
            poet: 'Constantine P. Cavafy',
            title: 'One Night',
            lines: 'The room was cheap and sordid,\nhidden above the suspect tavern.\nBut from the window, the alley could be seen alive,\nand by that love, the body was made beautiful.',
            origin: 'Greek-Egyptian, 20th century'
        },
        {
            poet: 'Constantine P. Cavafy',
            title: 'Body, Remember',
            lines: 'Body, remember not only how much you were loved,\nnot only the beds on which you lay,\nbut also those desires that for you\nglowed openly in eyes.',
            origin: 'Greek-Egyptian, 20th century'
        },
        {
            poet: 'Constantine P. Cavafy',
            title: 'Ithaka',
            lines: 'Ithaka gave you the marvelous journey.\nWithout her you would not have set out.',
            origin: 'Greek-Egyptian, 20th century'
        },

        // ── Mary Oliver ──────────────────────────────────────────────
        {
            poet: 'Mary Oliver',
            title: 'In Blackwater Woods',
            lines: 'To live in this world\nyou must be able to do three things:\nto love what is mortal;\nto hold it against your bones knowing your own life depends on it.',
            origin: 'American, 20th century'
        },
        {
            poet: 'Mary Oliver',
            title: 'When Death Comes',
            lines: 'When it\'s over, I want to say: all my life\nI was a bride married to amazement.',
            origin: 'American, 20th century'
        },
        {
            poet: 'Mary Oliver',
            title: 'West Wind',
            lines: 'You do not have to be good.\nYou do not have to walk on your knees\nfor a hundred miles through the desert, repenting.',
            origin: 'American, 20th century'
        },

        // ── Wislawa Szymborska ───────────────────────────────────────
        {
            poet: 'Wislawa Szymborska',
            title: 'Love at First Sight',
            lines: 'They\'re both convinced\nthat a sudden passion joined them.\nSuch certainty is beautiful,\nbut uncertainty is more beautiful still.',
            origin: 'Polish, 20th century'
        },
        {
            poet: 'Wislawa Szymborska',
            title: 'A Few Words on the Soul',
            lines: 'We have a soul at times.\nNo one\'s got it non-stop, for keeps.',
            origin: 'Polish, 20th century'
        },
        {
            poet: 'Wislawa Szymborska',
            title: 'Nothing Twice',
            lines: 'Nothing can ever happen twice.\nIn consequence, the sorry fact is\nthat we arrive here improvised\nand leave without the chance to practice.',
            origin: 'Polish, 20th century'
        },

        // ── e.e. cummings ────────────────────────────────────────────
        {
            poet: 'e.e. cummings',
            title: 'i carry your heart with me',
            lines: 'i carry your heart with me(i carry it in\nmy heart)i am never without it(anywhere\ni go you go,my dear.',
            origin: 'American, 20th century'
        },
        {
            poet: 'e.e. cummings',
            title: 'somewhere i have never travelled',
            lines: 'somewhere i have never travelled,gladly beyond\nany experience,your eyes have their silence.',
            origin: 'American, 20th century'
        },
        {
            poet: 'e.e. cummings',
            title: 'since feeling is first',
            lines: 'since feeling is first\nwho pays any attention\nto the syntax of things\nwill never wholly kiss you.',
            origin: 'American, 20th century'
        },

        // ── Basho ─────────────────────────────────────────────────────
        {
            poet: 'Matsuo Basho',
            title: 'untitled',
            lines: 'Even in Kyoto —\nhearing the cuckoo\'s cry —\nI long for Kyoto.',
            origin: 'Japanese, 17th century'
        },
        {
            poet: 'Matsuo Basho',
            title: 'untitled',
            lines: 'Come, let us go out\ninto the fields and enjoy\nthe cherry blossoms together.',
            origin: 'Japanese, 17th century'
        },
        {
            poet: 'Matsuo Basho',
            title: 'untitled',
            lines: 'Do not seek to follow\nin the footsteps of the wise.\nSeek what they sought.',
            origin: 'Japanese, 17th century'
        },

        // ── Kobayashi Issa ───────────────────────────────────────────
        {
            poet: 'Kobayashi Issa',
            title: 'untitled',
            lines: 'O snail,\nclimb Mount Fuji,\nbut slowly, slowly!',
            origin: 'Japanese, 18th century'
        },
        {
            poet: 'Kobayashi Issa',
            title: 'untitled',
            lines: 'In this world\nwe walk on the roof of hell,\ngathering flowers.',
            origin: 'Japanese, 18th century'
        },
        {
            poet: 'Kobayashi Issa',
            title: 'untitled',
            lines: 'What a strange thing!\nto be alive\nbeneath cherry blossoms.',
            origin: 'Japanese, 18th century'
        },

        // ── Chiyo-ni ──────────────────────────────────────────────────
        {
            poet: 'Chiyo-ni',
            title: 'untitled',
            lines: 'Morning glory!\nThe well-bucket entangled,\nI ask for water.',
            origin: 'Japanese, 18th century'
        },
        {
            poet: 'Chiyo-ni',
            title: 'untitled',
            lines: 'Putting up the moon —\nmy hands, suddenly,\nfeel the cool wind.',
            origin: 'Japanese, 18th century'
        },

        // ── Izumi Shikibu ─────────────────────────────────────────────
        {
            poet: 'Izumi Shikibu',
            title: 'untitled',
            lines: 'Lying alone,\nmy black hair tangled,\nuncombed,\nI long for the one\nwho touched it first.',
            origin: 'Japanese, 11th century'
        },
        {
            poet: 'Izumi Shikibu',
            title: 'untitled',
            lines: 'Although the wind\nblows terribly here,\nthe moonlight also leaks\nbetween the roof planks\nof this ruined house.',
            origin: 'Japanese, 11th century'
        },

        // ── Yosano Akiko ─────────────────────────────────────────────
        {
            poet: 'Yosano Akiko',
            title: 'Tangled Hair',
            lines: 'Not speaking of the way,\nnot thinking of what comes after,\nnot questioning name or fame,\nhere, loving love.',
            origin: 'Japanese, 20th century'
        },
        {
            poet: 'Yosano Akiko',
            title: 'Tangled Hair',
            lines: 'You have not come to see me\nfor a long time.\nI did not wait.\nBut the soft black night grows softer and sadder.',
            origin: 'Japanese, 20th century'
        },

        // ── Anna Akhmatova ───────────────────────────────────────────
        {
            poet: 'Anna Akhmatova',
            title: 'untitled',
            lines: 'I wrung my hands under my dark veil.\n"Why are you pale, what makes you reckless?"\nBecause I have made my loved one drunk\nwith an astringent sadness.',
            origin: 'Russian, 20th century'
        },
        {
            poet: 'Anna Akhmatova',
            title: 'The Guest',
            lines: 'Everything is as it was. Fine hard snow\nbeats against the dining room windows.\nI myself have not changed.\nEven so, a man came to call.',
            origin: 'Russian, 20th century'
        },

        // ── Marina Tsvetaeva ─────────────────────────────────────────
        {
            poet: 'Marina Tsvetaeva',
            title: 'untitled',
            lines: 'I bless the daily labor,\nI bless the nightly rest.\nThe Lord God\'s mercy and the Lord God\'s wrath.\nI bless you, darling — bless.',
            origin: 'Russian, 20th century'
        },
        {
            poet: 'Marina Tsvetaeva',
            title: 'Poem of the End',
            lines: 'A kiss on the head — wipes away misery.\nI kiss your head.',
            origin: 'Russian, 20th century'
        },

        // ── Federico Garcia Lorca ────────────────────────────────────
        {
            poet: 'Federico Garcia Lorca',
            title: 'Gacela of the Dark Death',
            lines: 'I want to sleep the dream of the apples,\nto withdraw from the tumult of cemeteries.\nI want to sleep the dream of that child\nwho wanted to cut his heart on the high seas.',
            origin: 'Spanish, 20th century'
        },
        {
            poet: 'Federico Garcia Lorca',
            title: 'Sonnet of the Sweet Complaint',
            lines: 'Never let me lose the marvel\nof your statue-like eyes, or the accent\nthe solitary rose of your breath\nplaces on my cheek at night.',
            origin: 'Spanish, 20th century'
        },

        // ── Walt Whitman ──────────────────────────────────────────────
        {
            poet: 'Walt Whitman',
            title: 'Song of Myself',
            lines: 'I am large, I contain multitudes.\nDo I contradict myself?\nVery well then I contradict myself.',
            origin: 'American, 19th century'
        },
        {
            poet: 'Walt Whitman',
            title: 'We Two Boys Together Clinging',
            lines: 'We two boys together clinging,\nOne the other never leaving,\nUp and down the roads going, North and South excursions making.',
            origin: 'American, 19th century'
        },

        // ── W.B. Yeats ───────────────────────────────────────────────
        {
            poet: 'W.B. Yeats',
            title: 'Aedh Wishes for the Cloths of Heaven',
            lines: 'I have spread my dreams under your feet;\nTread softly because you tread on my dreams.',
            origin: 'Irish, 20th century'
        },
        {
            poet: 'W.B. Yeats',
            title: 'When You Are Old',
            lines: 'But one man loved the pilgrim soul in you,\nAnd loved the sorrows of your changing face.',
            origin: 'Irish, 20th century'
        },
        {
            poet: 'W.B. Yeats',
            title: 'Brown Penny',
            lines: 'O love is the crooked thing,\nThere is nobody wise enough\nTo find out all that is in it.',
            origin: 'Irish, 20th century'
        },

        // ── William Shakespeare ──────────────────────────────────────
        {
            poet: 'William Shakespeare',
            title: 'Sonnet 116',
            lines: 'Love is not love\nWhich alters when it alteration finds,\nOr bends with the remover to remove.',
            origin: 'English, 16th century'
        },
        {
            poet: 'William Shakespeare',
            title: 'Sonnet 18',
            lines: 'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate.',
            origin: 'English, 16th century'
        },
        {
            poet: 'William Shakespeare',
            title: 'Sonnet 130',
            lines: 'My mistress\' eyes are nothing like the sun;\nCoral is far more red than her lips\' red.',
            origin: 'English, 16th century'
        },

        // ── John Donne ───────────────────────────────────────────────
        {
            poet: 'John Donne',
            title: 'The Good-Morrow',
            lines: 'I wonder, by my troth, what thou and I\nDid, till we loved? Were we not weaned till then?',
            origin: 'English, 17th century'
        },
        {
            poet: 'John Donne',
            title: 'A Valediction: Forbidding Mourning',
            lines: 'Our two souls therefore, which are one,\nThough I must go, endure not yet\nA breach, but an expansion,\nLike gold to airy thinness beat.',
            origin: 'English, 17th century'
        },

        // ── Christina Rossetti ───────────────────────────────────────
        {
            poet: 'Christina Rossetti',
            title: 'Remember',
            lines: 'Remember me when I am gone away,\nGone far away into the silent land.',
            origin: 'English, 19th century'
        },
        {
            poet: 'Christina Rossetti',
            title: 'A Birthday',
            lines: 'My heart is like a singing bird\nWhose nest is in a watered shoot.',
            origin: 'English, 19th century'
        },

        // ── Robert Burns ──────────────────────────────────────────────
        {
            poet: 'Robert Burns',
            title: 'A Red, Red Rose',
            lines: 'O my Luve is like a red, red rose,\nThat\'s newly sprung in June.',
            origin: 'Scottish, 18th century'
        },

        // ── Edna St. Vincent Millay ──────────────────────────────────
        {
            poet: 'Edna St. Vincent Millay',
            title: 'Love Is Not All',
            lines: 'Love is not all: it is not meat nor drink\nNor slumber nor a roof against the rain.',
            origin: 'American, 20th century'
        },
        {
            poet: 'Edna St. Vincent Millay',
            title: 'What Lips My Lips Have Kissed',
            lines: 'What lips my lips have kissed, and where, and why,\nI have forgotten, and what arms have lain\nUnder my head till morning.',
            origin: 'American, 20th century'
        },

        // ── Paul Eluard ──────────────────────────────────────────────
        {
            poet: 'Paul Eluard',
            title: 'I Do Not Understand',
            lines: 'There is no world without you.\nI do not understand this at all,\nand yet it is so.',
            origin: 'French, 20th century'
        },
        {
            poet: 'Paul Eluard',
            title: 'Liberty',
            lines: 'On all the pages read,\non all the pages blank,\nstone blood paper or ash,\nI write your name.',
            origin: 'French, 20th century'
        },

        // ── Jacques Prevert ──────────────────────────────────────────
        {
            poet: 'Jacques Prevert',
            title: 'Garden Party',
            lines: 'Millions and millions of years\nWould still not give me half enough time\nTo describe that tiny instant of all eternity\nWhen you put your arms around me.',
            origin: 'French, 20th century'
        },

        // ── Derek Walcott ────────────────────────────────────────────
        {
            poet: 'Derek Walcott',
            title: 'Love After Love',
            lines: 'The time will come\nwhen, with elation,\nyou will greet yourself arriving\nat your own door, in your own mirror.',
            origin: 'Caribbean, 20th century'
        },

        // ── Rabindranath Tagore ──────────────────────────────────────
        {
            poet: 'Rabindranath Tagore',
            title: 'Stray Birds',
            lines: 'The world puts off its mask of vastness to its lover.\nIt becomes small as one song, as one kiss of the eternal.',
            origin: 'Indian, 20th century'
        },
        {
            poet: 'Rabindranath Tagore',
            title: 'Gitanjali',
            lines: 'I seem to have loved you in numberless forms,\nnumberless times, in life after life, in age after age, forever.',
            origin: 'Indian, 20th century'
        },
        {
            poet: 'Rabindranath Tagore',
            title: 'The Gardener',
            lines: 'I hold her hands and press her to my breast.\nI try to fill my arms with her loveliness,\nto plunder her sweet smile with kisses,\nto drink her dark glances with my eyes.',
            origin: 'Indian, 20th century'
        },

        // ── Mirabai ──────────────────────────────────────────────────
        {
            poet: 'Mirabai',
            title: 'untitled',
            lines: 'I have felt the swaying of the elephant\'s shoulders;\nand now you want me to climb on a jackass?\nTry to be serious.',
            origin: 'Indian, 16th century'
        },

        // ── Amaru ─────────────────────────────────────────────────────
        {
            poet: 'Amaru',
            title: 'Amarushataka',
            lines: 'She let him in, at first reluctantly,\nthen the quarrel ended in a deeper silence\nthan either had known before.',
            origin: 'Indian, 7th century'
        },

        // ── Vidyapati ─────────────────────────────────────────────────
        {
            poet: 'Vidyapati',
            title: 'untitled',
            lines: 'As the mirror to my hand,\nthe flowers to my hair,\nkohl to my eyes — so you, beloved,\nto my body.',
            origin: 'Indian, 14th century'
        },

        // ── Forugh Farrokhzad ────────────────────────────────────────
        {
            poet: 'Forugh Farrokhzad',
            title: 'Another Birth',
            lines: 'I will plant my hands in the garden soil —\nI will sprout, I know, I know, I know.\nAnd the swallows will lay eggs\nin the hollows of my ink-stained fingers.',
            origin: 'Iranian, 20th century'
        },
        {
            poet: 'Forugh Farrokhzad',
            title: 'Let Us Believe in the Beginning of the Cold Season',
            lines: 'When my trust was suspended from the fragile rope of justice,\nand in the whole city they were chopping up my heart\'s lanterns,\nwhen love\'s young hands were tied\nbehind the dark blindfold of law.',
            origin: 'Iranian, 20th century'
        },

        // ── Mahmoud Darwish ──────────────────────────────────────────
        {
            poet: 'Mahmoud Darwish',
            title: 'On This Earth',
            lines: 'On this earth there is what makes life worth living:\non this earth, the Lady of Earth,\nmother of all beginnings, mother of all endings.',
            origin: 'Palestinian, 20th century'
        },

        // ── Nizar Qabbani ────────────────────────────────────────────
        {
            poet: 'Nizar Qabbani',
            title: 'untitled',
            lines: 'I want a love that hides me within\nlike a secret, pressed between two lines of poetry\nthat only I can read.',
            origin: 'Syrian, 20th century'
        },
        {
            poet: 'Nizar Qabbani',
            title: 'Language',
            lines: 'When I love,\nI feel that I am the king of time.\nI possess the earth and everything on it.',
            origin: 'Syrian, 20th century'
        },

        // ── Naomi Shihab Nye ─────────────────────────────────────────
        {
            poet: 'Naomi Shihab Nye',
            title: 'Kindness',
            lines: 'Before you know kindness as the deepest thing inside,\nyou must know sorrow as the other deepest thing.',
            origin: 'American-Palestinian, 20th century'
        },

        // ── Octavio Paz ──────────────────────────────────────────────
        {
            poet: 'Octavio Paz',
            title: 'Sunstone',
            lines: 'I search without finding, I write alone,\nthere is no one here, and the day falls,\nthe year falls, I fall with the instant.',
            origin: 'Mexican, 20th century'
        },
        {
            poet: 'Octavio Paz',
            title: 'The Double Flame',
            lines: 'Love is one of the answers\nhumankind invented to stare death in the face.\nTime dissolves; at the same time, we are time.',
            origin: 'Mexican, 20th century'
        },

        // ── Wisława Szymborska (additional) ──────────────────────────
        {
            poet: 'Wislawa Szymborska',
            title: 'The Three Oddest Words',
            lines: 'When I pronounce the word Future,\nthe first syllable already belongs to the past.\nWhen I pronounce the word Silence,\nI destroy it.',
            origin: 'Polish, 20th century'
        },

        // ── Ono no Komachi ───────────────────────────────────────────
        {
            poet: 'Ono no Komachi',
            title: 'untitled',
            lines: 'When my desire grows too fierce\nI wear my bedclothes inside out,\ndark as the night\'s rough husk.',
            origin: 'Japanese, 9th century'
        },
        {
            poet: 'Ono no Komachi',
            title: 'untitled',
            lines: 'In my troubled sleep\nI dreamed I saw your face, then woke —\nhad I known it was a dream,\nI never would have wakened.',
            origin: 'Japanese, 9th century'
        },

        // ── Tu Fu (Du Fu) ────────────────────────────────────────────
        {
            poet: 'Du Fu',
            title: 'Moonlit Night',
            lines: 'Tonight the moon over Fu-chou:\nin her chamber she watches it alone.\nI pity my far-away little children\nwho don\'t yet understand about Chang\'an.',
            origin: 'Chinese, 8th century'
        },

        // ── Clarice Lispector ────────────────────────────────────────
        {
            poet: 'Clarice Lispector',
            title: 'The Hour of the Star',
            lines: 'I have in me the winds,\nthe deserts, the nights.\nI am not possessing: I am.',
            origin: 'Brazilian, 20th century'
        },

        // ── Warsan Shire ─────────────────────────────────────────────
        {
            poet: 'Warsan Shire',
            title: 'untitled',
            lines: 'I held an atlas in my lap,\nran my fingers across the whole world\nand whispered\nwhere does it hurt?',
            origin: 'Somali-British, 21st century'
        },

        // ── Kahlil Gibran ────────────────────────────────────────────
        {
            poet: 'Kahlil Gibran',
            title: 'The Prophet',
            lines: 'Let there be spaces in your togetherness,\nAnd let the winds of the heavens dance between you.',
            origin: 'Lebanese-American, 20th century'
        },
        {
            poet: 'Kahlil Gibran',
            title: 'The Prophet',
            lines: 'Love one another, but make not a bond of love:\nLet it rather be a moving sea between the shores of your souls.',
            origin: 'Lebanese-American, 20th century'
        },

        // ── Fernando Pessoa ──────────────────────────────────────────
        {
            poet: 'Fernando Pessoa',
            title: 'untitled',
            lines: 'We never love anyone.\nWhat we love is the idea we have of someone.\nIt\'s our own concept — our own selves — that we love.',
            origin: 'Portuguese, 20th century'
        },

        // ── Yehuda Amichai ───────────────────────────────────────────
        {
            poet: 'Yehuda Amichai',
            title: 'A Man in His Life',
            lines: 'A man doesn\'t have time in his life\nto have time for everything.\nHe doesn\'t have seasons enough to have\na season for every purpose.',
            origin: 'Israeli, 20th century'
        },
        {
            poet: 'Yehuda Amichai',
            title: 'An Arab Shepherd Is Searching for His Goat on Mount Zion',
            lines: 'Searching for a goat or a son has always been\nthe beginning of a new religion in these mountains.',
            origin: 'Israeli, 20th century'
        },

        // ── Wislawa Szymborska (additional) ──────────────────────────
        {
            poet: 'Wislawa Szymborska',
            title: 'Could Have',
            lines: 'It could have happened.\nIt had to happen.\nIt happened earlier. Later.\nNearer. Farther off. It happened, but not to you.',
            origin: 'Polish, 20th century'
        },

        // ── Anne Sexton ──────────────────────────────────────────────
        {
            poet: 'Anne Sexton',
            title: 'The Kiss',
            lines: 'My mouth blooms like a cut.\nI\'ve been wrong, dying inside, all along.',
            origin: 'American, 20th century'
        },

        // ── Sylvia Plath ─────────────────────────────────────────────
        {
            poet: 'Sylvia Plath',
            title: 'Mad Girl\'s Love Song',
            lines: 'I shut my eyes and all the world drops dead;\nI lift my lids and all is born again.\n(I think I made you up inside my head.)',
            origin: 'American, 20th century'
        },

        // ── Leonard Cohen ────────────────────────────────────────────
        {
            poet: 'Leonard Cohen',
            title: 'Dance Me to the End of Love',
            lines: 'Dance me to your beauty with a burning violin,\ndance me through the panic till I\'m gathered safely in.',
            origin: 'Canadian, 20th century'
        },

        // ── Robert Frost ─────────────────────────────────────────────
        {
            poet: 'Robert Frost',
            title: 'The Silken Tent',
            lines: 'She is as in a field a silken tent\nAt midday when a sunny summer breeze\nHas dried the dew.',
            origin: 'American, 20th century'
        },

        // ── Edwin Morgan ─────────────────────────────────────────────
        {
            poet: 'Edwin Morgan',
            title: 'Strawberries',
            lines: 'There were strawberries once in the Botanic Gardens —\nwe sat together on a seat — and I swore\nI tasted the sweet juice of your lips.',
            origin: 'Scottish, 20th century'
        },

        // ── Catullus ─────────────────────────────────────────────────
        {
            poet: 'Catullus',
            title: 'Carmen 5',
            lines: 'Give me a thousand kisses, then a hundred,\nthen another thousand, then a second hundred,\nthen yet another thousand, then a hundred.',
            origin: 'Roman, 1st century BCE'
        },
        {
            poet: 'Catullus',
            title: 'Carmen 85',
            lines: 'I hate and I love. Why? you might ask.\nI don\'t know. But I feel it happening,\nand it crucifies me.',
            origin: 'Roman, 1st century BCE'
        },

        // ── Tomas Transtromer ────────────────────────────────────────
        {
            poet: 'Tomas Transtromer',
            title: 'Romanesque Arches',
            lines: 'Inside the huge Romanesque church the tourists jostled in the half darkness.\nVault gaped behind vault, no complete view.\nA few candle flames flickered.\nAn angel with no face embraced me.',
            origin: 'Swedish, 20th century'
        },

        // ── Cesar Vallejo ────────────────────────────────────────────
        {
            poet: 'Cesar Vallejo',
            title: 'Black Stone on a White Stone',
            lines: 'I will die in Paris, in a rainstorm,\non a day I already remember.\nI will die in Paris — and I don\'t back down.',
            origin: 'Peruvian, 20th century'
        },

        // ── Alejandra Pizarnik ───────────────────────────────────────
        {
            poet: 'Alejandra Pizarnik',
            title: 'untitled',
            lines: 'I explain with words of this world\nthat a ship left me and took me.',
            origin: 'Argentine, 20th century'
        },

        // ── Southeast Asian / Singapore poets ────────────────────────
        {
            poet: 'Edwin Thumboo',
            title: 'Gods Can Die',
            lines: 'Gods can die.\nWe, being mortal, outlive them sometimes\nwith a single stubborn act of love.',
            origin: 'Singaporean, 20th century'
        },
        {
            poet: 'Arthur Yap',
            title: '2 Mothers in a HDB Playground',
            lines: 'My boy bright, yours is also bright.\nWe have brought up our children\nwell, without knowing why or when\nthey turned out almost like us.',
            origin: 'Singaporean, 20th century'
        },
        {
            poet: 'Boey Kim Cheng',
            title: 'The Planners',
            lines: 'They plan. They build. All spaces are gridded,\nblocked and orderly. The country wears\nperfection like a fourth wall.',
            origin: 'Singaporean-Australian, 20th century'
        },
        {
            poet: 'Alfian Sa\'at',
            title: 'Singapore You Are Not My Country',
            lines: 'Singapore you are not my country.\nSingapore you are not a country at all.\nYou are the practice of being a country.',
            origin: 'Singaporean, 21st century'
        },
        {
            poet: 'Cyril Wong',
            title: 'untitled',
            lines: 'If someone were to ask, I would answer:\nlove is the ease of letting another\nsleep beside you in the dark.',
            origin: 'Singaporean, 21st century'
        },
        {
            poet: 'Grace Chia',
            title: 'untitled',
            lines: 'The rain in this city\ndoes not fall gently. It arrives\nwith the whole weight of wanting.',
            origin: 'Singaporean, 21st century'
        },

        // ── More classical / medieval ────────────────────────────────
        {
            poet: 'Empress Eifuku',
            title: 'untitled',
            lines: 'When he comes to me,\nnot even time exists.\nHow could something like dawn\nbreak in upon such darkness?',
            origin: 'Japanese, 13th century'
        },

        {
            poet: 'Petrarch',
            title: 'Canzoniere',
            lines: 'It was the day the sun\'s ray had turned pale\nwith pity for the suffering of his Maker,\nwhen I was caught, and I put up no fight.',
            origin: 'Italian, 14th century'
        },

        {
            poet: 'Ghalib',
            title: 'untitled',
            lines: 'For the raindrop, joy is in entering the river.\nAn unbearable pain becomes its own cure.',
            origin: 'Mughal Indian, 19th century'
        },
        {
            poet: 'Ghalib',
            title: 'untitled',
            lines: 'Thousands of desires, each worth dying for.\nMany of them I have realized,\nyet I yearn for more.',
            origin: 'Mughal Indian, 19th century'
        },

        // ── More modern / contemporary ───────────────────────────────
        {
            poet: 'Jack Gilbert',
            title: 'A Brief for the Defense',
            lines: 'We must risk delight. We can do without pleasure,\nbut not delight. Not enjoyment.\nWe must have the stubbornness to accept our gladness.',
            origin: 'American, 20th century'
        },
        {
            poet: 'Jack Gilbert',
            title: 'Failing and Flying',
            lines: 'Everyone forgets that Icarus also flew.\nIt\'s the same when love comes to an end.\nWe think of the falling, never the flying.',
            origin: 'American, 20th century'
        },

        {
            poet: 'Ross Gay',
            title: 'Catalog of Unabashed Gratitude',
            lines: 'Thank you\nthe oriole nesting near the house, and the house\nand the willing yard and the garden.',
            origin: 'American, 21st century'
        },

        {
            poet: 'Ada Limon',
            title: 'The Carrying',
            lines: 'I didn\'t want to want\nanything, but I wanted everything.\nI wanted the world to be made of glass\nso I could see through it.',
            origin: 'American, 21st century'
        },

        {
            poet: 'Ocean Vuong',
            title: 'Someday I\'ll Love Ocean Vuong',
            lines: 'The most beautiful part of your body\nis wherever your mother\'s shadow falls.',
            origin: 'Vietnamese-American, 21st century'
        },
        {
            poet: 'Ocean Vuong',
            title: 'Night Sky with Exit Wounds',
            lines: 'Don\'t worry. You are already\nthe beautiful afterimage of a series\nof bright mistakes.',
            origin: 'Vietnamese-American, 21st century'
        },

        {
            poet: 'Rupi Kaur',
            title: 'untitled',
            lines: 'How is it so easy for you\nto be kind to people, he asked.\nMilk and honey dripped\nfrom my lips as I answered —\ncause people have not been kind to me.',
            origin: 'Indian-Canadian, 21st century'
        },

        {
            poet: 'Galway Kinnell',
            title: 'Wait',
            lines: 'Wait, for now.\nDistrust everything if you have to.\nBut trust the hours. Haven\'t they\ncarried you everywhere, up to now?',
            origin: 'American, 20th century'
        },

        {
            poet: 'Raymond Carver',
            title: 'Late Fragment',
            lines: 'And did you get what\nyou wanted from this life, even so?\nI did.\nAnd what did you want?\nTo call myself beloved, to feel myself\nbeloved on the earth.',
            origin: 'American, 20th century'
        },

        {
            poet: 'Denise Levertov',
            title: 'The Ache of Marriage',
            lines: 'Two by two in the ark of\nthe ache of it.',
            origin: 'British-American, 20th century'
        },

        {
            poet: 'W.S. Merwin',
            title: 'Separation',
            lines: 'Your absence has gone through me\nlike thread through a needle.\nEverything I do is stitched with its color.',
            origin: 'American, 20th century'
        },

        {
            poet: 'Mark Strand',
            title: 'The Coming of Light',
            lines: 'Even this late it happens:\nthe coming of love, the coming of light.\nYou wake and the candles are lit as if by themselves.',
            origin: 'Canadian-American, 20th century'
        },

        // ── Anonymous / traditional ──────────────────────────────────
        {
            poet: 'Anonymous',
            title: 'Egyptian love poem, circa 1300 BCE',
            lines: 'My heart is not yet happy with your love,\nmy wolf cub, so be lascivious unto drunkenness.\nI shall not leave your love.',
            origin: 'Ancient Egyptian'
        },
        {
            poet: 'Anonymous',
            title: 'The Song of Songs',
            lines: 'Set me as a seal upon thine heart,\nas a seal upon thine arm:\nfor love is strong as death.',
            origin: 'Ancient Hebrew'
        },
        {
            poet: 'Anonymous',
            title: 'Irish, 9th century',
            lines: 'He is a heart,\nan acorn from the oak tree.\nHe is young.\nKiss him.',
            origin: 'Medieval Irish'
        },
        {
            poet: 'Anonymous',
            title: 'untitled love letter',
            lines: 'I am writing this in the kitchen.\nThe clock says 3am. I have nothing to say\nexcept that I miss the particular\nweight of your head on my shoulder.',
            origin: 'Contemporary'
        },
        {
            poet: 'Anonymous',
            title: 'untitled observation',
            lines: 'The way you hold a mug with both hands\nas if it might fly away —\nthat is where I live now.',
            origin: 'Contemporary'
        },
        {
            poet: 'Anonymous',
            title: 'untitled note',
            lines: 'I keep your voicemail saved.\nNot for the words.\nFor the small breath you take\nbefore you say my name.',
            origin: 'Contemporary'
        },
        {
            poet: 'Anonymous',
            title: 'untitled letter',
            lines: 'If I had to choose between\nbreathing and loving you,\nI would use my last breath\nto tell you that I do.',
            origin: 'Contemporary'
        },
        {
            poet: 'Anonymous',
            title: 'Malay pantun',
            lines: 'Bunga melur di dalam taman,\nWangi semerbak di seri pagi.\nWajahmu hadir di dalam impian,\nMembuatku rindu sepanjang hari.',
            origin: 'Malay traditional'
        },
        {
            poet: 'Anonymous',
            title: 'Thai folk poem',
            lines: 'The river does not ask the rain\nwhy it falls.\nIt simply opens its mouth\nand sings.',
            origin: 'Southeast Asian traditional'
        }
    ];

    /**
     * Get a completely random poem from the collection.
     * @returns {Object} A poem object with poet, title, lines, and origin.
     */
    function getRandomPoem() {
        return POEMS[Math.floor(Math.random() * POEMS.length)];
    }

    /**
     * Get a poem seeded by the current date so it is consistent for the day.
     * Uses day-of-year modulo the collection length.
     * @returns {Object} A poem object for today.
     */
    function getTodaysPoem() {
        var now = new Date();
        var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        var index = dayOfYear % POEMS.length;
        return POEMS[index];
    }

    /**
     * Get a poem seeded by a specific date string (e.g. "2026-02-14").
     * Uses a simple hash of the string to deterministically pick a poem.
     * @param {string} dateStr - A date string to hash.
     * @returns {Object} A poem object for that date.
     */
    function getPoemForDate(dateStr) {
        var hash = 0;
        for (var i = 0; i < dateStr.length; i++) {
            hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
            hash |= 0;
        }
        var index = Math.abs(hash) % POEMS.length;
        return POEMS[index];
    }

    return {
        POEMS: POEMS,
        getRandomPoem: getRandomPoem,
        getTodaysPoem: getTodaysPoem,
        getPoemForDate: getPoemForDate
    };
})();
