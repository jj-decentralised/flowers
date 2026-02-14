const LovePoems = (function() {
    'use strict';

    // Collection of love poem excerpts from diverse poets and traditions
    // Each entry: poet name, poem title, the excerpt (8-20 lines), and the era/origin
    var POEMS = [
        // ── Pablo Neruda ──────────────────────────────────────────────
        {
            poet: 'Pablo Neruda',
            title: 'Sonnet XVII',
            lines: 'I do not love you as if you were salt-rose, or topaz,\nor the arrow of carnations the fire shoots off.\nI love you as certain dark things are to be loved,\nin secret, between the shadow and the soul.\nI love you as the plant that never blooms\nbut carries in itself the light of hidden flowers;\nthanks to your love a certain solid fragrance,\nrisen from the earth, lives darkly in my body.\nI love you without knowing how, or when, or from where.\nI love you simply, without problems or pride:\nI love you in this way because I do not know any other way of loving\nbut this, in which there is no I or you,\nso intimate that your hand upon my chest is my hand,\nso intimate that when I fall asleep your eyes close.',
            origin: 'Chilean, 20th century'
        },
        {
            poet: 'Pablo Neruda',
            title: 'If You Forget Me',
            lines: 'I want you to know one thing.\nYou know how this is:\nif I look at the crystal moon, at the red branch\nof the slow autumn at my window,\nif I touch near the fire\nthe impalpable ash or the wrinkled body of the log,\neverything carries me to you,\nas if everything that exists,\naromas, light, metals,\nwere little boats that sail\ntoward those isles of yours that wait for me.',
            origin: 'Chilean, 20th century'
        },
        {
            poet: 'Pablo Neruda',
            title: 'Every Day You Play',
            lines: 'Every day you play with the light of the universe.\nSubtle visitor, you arrive in the flower and the water.\nYou are more than this white head that I hold tightly\nas a cluster of fruit, every day, between my hands.\nYou are like nobody since I love you.\nLet me spread you out among yellow garlands.\nWho writes your name in letters of smoke among the stars of the south?\nOh let me remember you as you were before you existed.',
            origin: 'Chilean, 20th century'
        },
        {
            poet: 'Pablo Neruda',
            title: 'Tonight I Can Write',
            lines: 'Tonight I can write the saddest lines.\nWrite, for example, "The night is starry\nand the stars are blue and shiver in the distance."\nThe night wind revolves in the sky and sings.\nTonight I can write the saddest lines.\nI loved her, and sometimes she loved me too.\nThrough nights like this one I held her in my arms.\nI kissed her again and again under the endless sky.\nShe loved me, sometimes I loved her too.\nHow could one not have loved her great still eyes.',
            origin: 'Chilean, 20th century'
        },

        // ── Rumi ──────────────────────────────────────────────────────
        {
            poet: 'Rumi',
            title: 'The Guest House',
            lines: 'This being human is a guest house.\nEvery morning a new arrival.\nA joy, a depression, a meanness,\nsome momentary awareness comes\nas an unexpected visitor.\nWelcome and entertain them all!\nEven if they are a crowd of sorrows,\nwho violently sweep your house\nempty of its furniture,\nstill, treat each guest honorably.\nHe may be clearing you out\nfor some new delight.',
            origin: 'Persian, 13th century'
        },
        {
            poet: 'Rumi',
            title: 'A Great Wagon',
            lines: 'Out beyond ideas of wrongdoing and rightdoing,\nthere is a field. I\'ll meet you there.\nWhen the soul lies down in that grass,\nthe world is too full to talk about.\nIdeas, language, even the phrase "each other"\ndoesn\'t make any sense.\nThe breeze at dawn has secrets to tell you.\nDon\'t go back to sleep.\nYou must ask for what you really want.\nDon\'t go back to sleep.',
            origin: 'Persian, 13th century'
        },
        {
            poet: 'Rumi',
            title: 'Love Dogs',
            lines: 'One night a man was crying, Allah! Allah!\nHis lips grew sweet with the praising,\nuntil a cynic said, "So! I have heard you\ncalling out, but have you ever\ngotten any response?"\nThe man had no answer to that.\nHe quit praying and fell into a confused sleep.\nHe dreamed he saw Khidr, the guide of souls,\nin a thick, green foliage.\n"Why did you stop praising?"\n"Because I\'ve never heard anything back."\n"This longing you express is the return message."',
            origin: 'Persian, 13th century'
        },

        // ── Hafiz ─────────────────────────────────────────────────────
        {
            poet: 'Hafiz',
            title: 'It Felt Love',
            lines: 'How did the rose ever open its heart\nand give to this world all its beauty?\nIt felt the encouragement of light against its being.\nOtherwise, we all remain too frightened.\nHow did the sun take its great step\nof courage and become such magnificent fire?\nIt gathered its strength to make that leap\nthrough the vast and empty nothing.\nSo too, my dear, shall you one day\nbloom with the fullness of what you are.',
            origin: 'Persian, 14th century'
        },
        {
            poet: 'Hafiz',
            title: 'With That Moon Language',
            lines: 'Admit something:\nEveryone you see, you say to them, "Love me."\nOf course you do not do this out loud, otherwise\nsomeone would call the cops.\nStill, though, think about this, this great pull in us\nto connect. Why not become the one\nwho lives with a full moon in each eye\nthat is always saying,\nwith that sweet moon language,\nwhat every other eye in this world\nis dying to hear?',
            origin: 'Persian, 14th century'
        },

        // ── Sappho ────────────────────────────────────────────────────
        {
            poet: 'Sappho',
            title: 'Fragment 31',
            lines: 'He seems to me equal to the gods, that man\nwho sits facing you and hears you nearby\nsweetly speaking and laughing charmingly,\nwhich sets my heart to fluttering in my breast.\nFor when I look at you even for a moment,\nno speaking is left in me.\nMy tongue breaks, and thin fire races under my skin,\nand my eyes see nothing, and my ears hum,\nand cold sweat pours down me, and trembling\nseizes all of me, and I am greener than grass.',
            origin: 'Greek, 6th century BCE'
        },
        {
            poet: 'Sappho',
            title: 'Fragment 16',
            lines: 'Some say an army of horsemen, some of foot soldiers,\nsome of ships, is the fairest thing\non the black earth, but I say\nit is what you love.\nIt is very easy to make this clear\nto everyone, for she who surpassed all\nin beauty, Helen, leaving behind\nthe best of all husbands,\nwent sailing to Troy\nand thought nothing of her child\nor her dear parents.',
            origin: 'Greek, 6th century BCE'
        },

        // ── William Shakespeare ────────────────────────────────────────
        {
            poet: 'William Shakespeare',
            title: 'Sonnet 18',
            lines: 'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate:\nRough winds do shake the darling buds of May,\nAnd summer\'s lease hath all too short a date.\nSometime too hot the eye of heaven shines,\nAnd often is his gold complexion dimm\'d;\nAnd every fair from fair sometime declines,\nBy chance, or nature\'s changing course, untrimm\'d;\nBut thy eternal summer shall not fade,\nNor lose possession of that fair thou ow\'st;\nNor shall death brag thou wander\'st in his shade,\nWhen in eternal lines to time thou grow\'st:\nSo long as men can breathe or eyes can see,\nSo long lives this, and this gives life to thee.',
            origin: 'English, 16th century'
        },
        {
            poet: 'William Shakespeare',
            title: 'Sonnet 116',
            lines: 'Let me not to the marriage of true minds\nAdmit impediments. Love is not love\nWhich alters when it alteration finds,\nOr bends with the remover to remove:\nO no! it is an ever-fixed mark\nThat looks on tempests and is never shaken;\nIt is the star to every wandering bark,\nWhose worth\'s unknown, although his height be taken.\nLove\'s not Time\'s fool, though rosy lips and cheeks\nWithin his bending sickle\'s compass come:\nLove alters not with his brief hours and weeks,\nBut bears it out even to the edge of doom.',
            origin: 'English, 16th century'
        },
        {
            poet: 'William Shakespeare',
            title: 'Sonnet 130',
            lines: 'My mistress\' eyes are nothing like the sun;\nCoral is far more red than her lips\' red;\nIf snow be white, why then her breasts are dun;\nIf hairs be wires, black wires grow on her head.\nI have seen roses damask\'d, red and white,\nBut no such roses see I in her cheeks;\nAnd in some perfumes is there more delight\nThan in the breath that from my mistress reeks.\nI love to hear her speak, yet well I know\nThat music hath a far more pleasing sound;\nI grant I never saw a goddess go;\nMy mistress, when she walks, treads on the ground:\nAnd yet, by heaven, I think my love as rare\nAs any she belied with false compare.',
            origin: 'English, 16th century'
        },

        // ── Emily Dickinson ───────────────────────────────────────────
        {
            poet: 'Emily Dickinson',
            title: 'Wild Nights — Wild Nights!',
            lines: 'Wild Nights — Wild Nights!\nWere I with thee\nWild Nights should be\nOur luxury!\nFutile — the winds —\nTo a Heart in port —\nDone with the Compass —\nDone with the Chart!\nRowing in Eden —\nAh, the Sea!\nMight I but moor — Tonight —\nIn Thee!',
            origin: 'American, 19th century'
        },
        {
            poet: 'Emily Dickinson',
            title: 'If you were coming in the Fall',
            lines: 'If you were coming in the Fall,\nI\'d brush the Summer by\nWith half a smile, and half a spurn,\nAs Housewives do, a Fly.\nIf I could see you in a year,\nI\'d wind the months in balls —\nAnd put them each in separate Drawers,\nFor fear the numbers fuse —\nIf only Centuries delayed,\nI\'d count them on my Hand,\nSubtracting, till my fingers dropped\nInto Van Diemen\'s Land.',
            origin: 'American, 19th century'
        },

        // ── Rainer Maria Rilke ────────────────────────────────────────
        {
            poet: 'Rainer Maria Rilke',
            title: 'Letters to a Young Poet',
            lines: 'For one human being to love another:\nthat is perhaps the most difficult of all our tasks,\nthe ultimate, the last test and proof,\nthe work for which all other work is but preparation.\nLove is at first not anything that means merging,\ngiving over, and uniting with another;\nit is a high inducement to the individual to ripen,\nto become world, to become world for himself\nfor another\'s sake;\nit is a great exacting claim upon him,\nsomething that chooses him out and calls him\nto vast things.',
            origin: 'Bohemian-Austrian, 20th century'
        },
        {
            poet: 'Rainer Maria Rilke',
            title: 'You Who Never Arrived',
            lines: 'You who never arrived in my arms,\nBeloved, who were lost from the start,\nI don\'t even know what songs would please you.\nI have given up trying to recognize you\nin the surging wave of the next moment.\nAll the immense images in me — the far-off,\ndeeply-felt landscape, cities, towers, and bridges,\nand unsuspected turns in the path,\nand those powerful lands that were once\npulsing with the life of the gods —\nall rise within me to mean you,\nwho forever elude me.',
            origin: 'Bohemian-Austrian, 20th century'
        },

        // ── Matsuo Basho ──────────────────────────────────────────────
        {
            poet: 'Matsuo Basho',
            title: 'The Narrow Road to the Deep North',
            lines: 'The months and days are the travelers of eternity.\nThe years that come and go are also voyagers.\nThose who float their lives away on boats\nor who grow old leading horses\nmake each day a journey,\nand the journey itself is home.\nFrom the earliest times there have always been\nsome who perished along the road.\nStill I have always been drawn by windblown clouds\ninto dreams of a lifetime of wandering.',
            origin: 'Japanese, 17th century'
        },

        // ── Rabindranath Tagore ───────────────────────────────────────
        {
            poet: 'Rabindranath Tagore',
            title: 'Gitanjali, 35',
            lines: 'Where the mind is without fear and the head is held high;\nWhere knowledge is free;\nWhere the world has not been broken up into fragments\nby narrow domestic walls;\nWhere words come out from the depth of truth;\nWhere tireless striving stretches its arms towards perfection;\nWhere the clear stream of reason has not lost its way\ninto the dreary desert sand of dead habit;\nWhere the mind is led forward by thee\ninto ever-widening thought and action —\nInto that heaven of freedom, my Father, let my country awake.',
            origin: 'Indian, 20th century'
        },
        {
            poet: 'Rabindranath Tagore',
            title: 'Unending Love',
            lines: 'I seem to have loved you in numberless forms,\nnumberless times, in life after life, in age after age, forever.\nMy spellbound heart has made and remade the necklace of songs,\nthat you take as a gift, wear round your neck\nin your many forms, in life after life, in age after age, forever.\nWhenever I hear old chronicles of love, its age-old pain,\nits ancient tale of being apart or together,\nas I stare on and on into the past, in the end you emerge,\nclad in the light of a pole-star piercing the darkness of time.',
            origin: 'Indian, 20th century'
        },
        {
            poet: 'Rabindranath Tagore',
            title: 'The Gardener, 28',
            lines: 'Your questioning eyes are sad.\nThey seek to know my meaning\nas the moon would fathom the sea.\nI have bared my life before your eyes from end to end,\nwith nothing hidden or held back.\nThat is why you know me not.\nIf it were only a gem,\nI could break it into a hundred pieces\nand string them into a chain to put on your neck.\nIf it were only a flower, round and small and sweet,\nI could pluck it from its stem to set it in your hair.\nBut it is a heart, my beloved.',
            origin: 'Indian, 20th century'
        },

        // ── Constantine P. Cavafy ─────────────────────────────────────
        {
            poet: 'Constantine P. Cavafy',
            title: 'Ithaka',
            lines: 'As you set out for Ithaka,\nhope the voyage is a long one,\nfull of adventure, full of discovery.\nLaistrygonians and Cyclops,\nangry Poseidon — don\'t be afraid of them:\nyou\'ll never find things like that on your way\nas long as you keep your thoughts raised high,\nas long as a rare excitement stirs your spirit\nand your body.\nIthaka gave you the marvelous journey.\nWithout her you would not have set out.',
            origin: 'Greek-Egyptian, 20th century'
        },
        {
            poet: 'Constantine P. Cavafy',
            title: 'Body, Remember',
            lines: 'Body, remember not only how much you were loved,\nnot only the beds on which you lay,\nbut also those desires that for you\nglowed openly in eyes,\nand trembled in the voice — and some\nchance obstacle made futile.\nNow that all of them belong to the past,\nit almost seems as if you\'d yielded\nto those desires — how they glowed,\nremember, in the eyes gazing at you;\nhow they trembled in the voice, for you,\nremember, body.',
            origin: 'Greek-Egyptian, 20th century'
        },

        // ── e.e. cummings ─────────────────────────────────────────────
        {
            poet: 'e.e. cummings',
            title: 'i carry your heart with me',
            lines: 'i carry your heart with me(i carry it in\nmy heart)i am never without it(anywhere\ni go you go,my dear;and whatever is done\nby only me is your doing,my darling)\ni fear no fate(for you are my fate,my sweet)\ni want no world(for beautiful you are my world,my true)\nand it\'s you are whatever a moon has always meant\nand whatever a sun will always sing is you\nhere is the deepest secret nobody knows\n(here is the root of the root and the bud of the bud\nand the sky of the sky of a tree called life;which grows\nhigher than soul can hope or mind can hide)\nand this is the wonder that\'s keeping the stars apart\ni carry your heart(i carry it in my heart)',
            origin: 'American, 20th century'
        },
        {
            poet: 'e.e. cummings',
            title: 'somewhere i have never travelled',
            lines: 'somewhere i have never travelled,gladly beyond\nany experience,your eyes have their silence:\nin your most frail gesture are things which enclose me,\nor which i cannot touch because they are too near\nyour slightest look easily will unclose me\nthough i have closed myself as fingers,\nyou open always petal by petal myself as Spring opens\n(touching skilfully,mysteriously)her first rose\nor if your wish be to close me,i and\nmy life will shut very beautifully,suddenly,\nas when the heart of this flower imagines\nthe snow carefully everywhere descending',
            origin: 'American, 20th century'
        },

        // ── Elizabeth Bishop ──────────────────────────────────────────
        {
            poet: 'Elizabeth Bishop',
            title: 'One Art',
            lines: 'The art of losing isn\'t hard to master;\nso many things seem filled with the intent\nto be lost that their loss is no disaster.\nLose something every day. Accept the fluster\nof lost door keys, the hour badly spent.\nThe art of losing isn\'t hard to master.\nI lost two cities, lovely ones. And, vaster,\nsome realms I owned, two rivers, a continent.\nI miss them, but it wasn\'t a disaster.\n— Even losing you (the joking voice, a gesture\nI love) I shan\'t have lied. It\'s evident\nthe art of losing\'s not too hard to master\nthough it may look like (Write it!) like disaster.',
            origin: 'American, 20th century'
        },

        // ── Wislawa Szymborska ────────────────────────────────────────
        {
            poet: 'Wislawa Szymborska',
            title: 'Love at First Sight',
            lines: 'They\'re both convinced\nthat a sudden passion joined them.\nSuch certainty is beautiful,\nbut uncertainty is more beautiful still.\nSince they\'d never met before, they\'re sure\nthat there\'d been nothing between them.\nBut what\'s the word from the streets, staircases, hallways —\nperhaps they\'ve passed each other a million times?\nI want to ask them if they don\'t remember —\na moment face to face in some revolving door?\nperhaps a "sorry" muttered in a crowd?\na curt "wrong number" caught in the receiver?\nbut I know the answer. No, they don\'t remember.',
            origin: 'Polish, 20th century'
        },
        {
            poet: 'Wislawa Szymborska',
            title: 'Nothing Twice',
            lines: 'Nothing can ever happen twice.\nIn consequence, the sorry fact is\nthat we arrive here improvised\nand leave without the chance to practice.\nNo day copies yesterday,\nno two nights will teach what bliss is\nin precisely the same way,\nwith precisely the same kisses.\nOne day, perhaps some idle tongue\nmentions your name by accident:\nI feel as if a rose were flung\ninto the room, all fragrance and lament.',
            origin: 'Polish, 20th century'
        },

        // ── Mary Oliver ───────────────────────────────────────────────
        {
            poet: 'Mary Oliver',
            title: 'The Summer Day',
            lines: 'Who made the world?\nWho made the swan, and the black bear?\nWho made the grasshopper?\nThis grasshopper, I mean —\nthe one who has flung herself out of the grass,\nthe one who is eating sugar out of my hand,\nwho is moving her jaws back and forth instead of up and down —\nwho is gazing around with her enormous and complicated eyes.\nNow she lifts her pale forearms and thoroughly washes her face.\nNow she snaps her wings open, and floats away.\nI do know how to pay attention, how to fall down\ninto the grass, how to kneel down in the grass,\nhow to be idle and blessed, how to stroll through the fields.\nTell me, what is it you plan to do\nwith your one wild and precious life?',
            origin: 'American, 20th century'
        },
        {
            poet: 'Mary Oliver',
            title: 'In Blackwater Woods',
            lines: 'To live in this world\nyou must be able to do three things:\nto love what is mortal;\nto hold it against your bones knowing\nyour own life depends on it;\nand, when the time comes to let it go,\nto let it go.\nEvery year everything I have ever learned\nin my lifetime leads back to this:\nthe fires and the black river of loss\nwhose other side is salvation.',
            origin: 'American, 20th century'
        },

        // ── Yehuda Amichai ────────────────────────────────────────────
        {
            poet: 'Yehuda Amichai',
            title: 'A Man in His Life',
            lines: 'A man doesn\'t have time in his life\nto have time for everything.\nHe doesn\'t have seasons enough to have\na season for every purpose. Ecclesiastes\nwas wrong about that.\nA man needs to love and to hate at the same moment,\nto laugh and cry with the same eyes,\nwith the same hands to throw stones and to gather them,\nto make love in war and war in love.\nAnd to hate and forgive and remember and forget,\nto arrange and confuse, to eat and to digest\nwhat history takes years and years to do.',
            origin: 'Israeli, 20th century'
        },
        {
            poet: 'Yehuda Amichai',
            title: 'The Place Where We Are Right',
            lines: 'From the place where we are right\nflowers will never grow in the spring.\nThe place where we are right\nis hard and trampled like a yard.\nBut doubts and loves\ndig up the world like a mole, a plow.\nAnd a whisper will be heard in the place\nwhere the ruined house once stood.',
            origin: 'Israeli, 20th century'
        },

        // ── Kahlil Gibran ─────────────────────────────────────────────
        {
            poet: 'Kahlil Gibran',
            title: 'On Love, from The Prophet',
            lines: 'When love beckons to you, follow him,\nThough his ways are hard and steep.\nAnd when his wings enfold you yield to him,\nThough the sword hidden among his pinions may wound you.\nAnd when he speaks to you believe in him,\nThough his voice may shatter your dreams\nas the north wind lays waste the garden.\nFor even as love crowns you so shall he crucify you.\nEven as he is for your growth so is he for your pruning.\nAll these things shall love do unto you\nthat you may know the secrets of your heart,\nand in that knowledge become a fragment of Life\'s heart.',
            origin: 'Lebanese-American, 20th century'
        },
        {
            poet: 'Kahlil Gibran',
            title: 'On Marriage, from The Prophet',
            lines: 'Love one another, but make not a bond of love:\nLet it rather be a moving sea between the shores of your souls.\nFill each other\'s cup but drink not from one cup.\nGive one another of your bread but eat not from the same loaf.\nSing and dance together and be joyous,\nbut let each one of you be alone,\nEven as the strings of a lute are alone\nthough they quiver with the same music.\nGive your hearts, but not into each other\'s keeping.\nFor only the hand of Life can contain your hearts.\nAnd stand together yet not too near together:\nFor the pillars of the temple stand apart.',
            origin: 'Lebanese-American, 20th century'
        },

        // ── John Keats ────────────────────────────────────────────────
        {
            poet: 'John Keats',
            title: 'Bright Star',
            lines: 'Bright star, would I were stedfast as thou art —\nNot in lone splendour hung aloft the night\nAnd watching, with eternal lids apart,\nLike nature\'s patient, sleepless Eremite,\nThe moving waters at their priestlike task\nOf pure ablution round earth\'s human shores,\nOr gazing on the new soft-fallen mask\nOf snow upon the mountains and the moors —\nNo — yet still stedfast, still unchangeable,\nPillow\'d upon my fair love\'s ripening breast,\nTo feel for ever its soft fall and swell,\nAwake for ever in a sweet unrest,\nStill, still to hear her tender-taken breath,\nAnd so live ever — or else swoon to death.',
            origin: 'English, 19th century'
        },
        {
            poet: 'John Keats',
            title: 'Ode to a Nightingale',
            lines: 'My heart aches, and a drowsy numbness pains\nMy sense, as though of hemlock I had drunk,\nOr emptied some dull opiate to the drains\nOne minute past, and Lethe-wards had sunk:\n\'Tis not through envy of thy happy lot,\nBut being too happy in thine happiness, —\nThat thou, light-winged Dryad of the trees,\nIn some melodious plot\nOf beechen green, and shadows numberless,\nSingest of summer in full-throated ease.',
            origin: 'English, 19th century'
        },

        // ── Lord Byron ────────────────────────────────────────────────
        {
            poet: 'Lord Byron',
            title: 'She Walks in Beauty',
            lines: 'She walks in beauty, like the night\nOf cloudless climes and starry skies;\nAnd all that\'s best of dark and bright\nMeet in her aspect and her eyes;\nThus mellowed to that tender light\nWhich heaven to gaudy day denies.\nOne shade the more, one ray the less,\nHad half impaired the nameless grace\nWhich waves in every raven tress,\nOr softly lightens o\'er her face;\nWhere thoughts serenely sweet express,\nHow pure, how dear their dwelling-place.',
            origin: 'English, 19th century'
        },

        // ── Percy Bysshe Shelley ──────────────────────────────────────
        {
            poet: 'Percy Bysshe Shelley',
            title: 'Love\'s Philosophy',
            lines: 'The fountains mingle with the river\nAnd the rivers with the ocean,\nThe winds of heaven mix for ever\nWith a sweet emotion;\nNothing in the world is single;\nAll things by a law divine\nIn one spirit meet and mingle.\nWhy not I with thine? —\nSee the mountains kiss high heaven\nAnd the waves clasp one another;\nNo sister-flower would be forgiven\nIf it disdained its brother;\nAnd the sunlight clasps the earth\nAnd the moonbeams kiss the sea:\nWhat is all this sweet work worth\nIf thou kiss not me?',
            origin: 'English, 19th century'
        },

        // ── Robert Burns ──────────────────────────────────────────────
        {
            poet: 'Robert Burns',
            title: 'A Red, Red Rose',
            lines: 'O my Luve is like a red, red rose\nThat\'s newly sprung in June;\nO my Luve is like the melody\nThat\'s sweetly played in tune.\nSo fair art thou, my bonnie lass,\nSo deep in luve am I;\nAnd I will luve thee still, my dear,\nTill a\' the seas gang dry.\nTill a\' the seas gang dry, my dear,\nAnd the rocks melt wi\' the sun;\nI will love thee still, my dear,\nWhile the sands o\' life shall run.',
            origin: 'Scottish, 18th century'
        },

        // ── W.B. Yeats ───────────────────────────────────────────────
        {
            poet: 'W.B. Yeats',
            title: 'When You Are Old',
            lines: 'When you are old and grey and full of sleep,\nAnd nodding by the fire, take down this book,\nAnd slowly read, and dream of the soft look\nYour eyes had once, and of their shadows deep;\nHow many loved your moments of glad grace,\nAnd loved your beauty with love false or true,\nBut one man loved the pilgrim soul in you,\nAnd loved the sorrows of your changing face;\nAnd bending down beside the glowing bars,\nMurmur, a little sadly, how Love fled\nAnd paced upon the mountains overhead\nAnd hid his face amid a crowd of stars.',
            origin: 'Irish, 20th century'
        },
        {
            poet: 'W.B. Yeats',
            title: 'Aedh Wishes for the Cloths of Heaven',
            lines: 'Had I the heavens\' embroidered cloths,\nEnwrought with golden and silver light,\nThe blue and the dim and the dark cloths\nOf night and light and the half-light,\nI would spread the cloths under your feet:\nBut I, being poor, have only my dreams;\nI have spread my dreams under your feet;\nTread softly because you tread on my dreams.',
            origin: 'Irish, 20th century'
        },

        // ── Edna St. Vincent Millay ───────────────────────────────────
        {
            poet: 'Edna St. Vincent Millay',
            title: 'Love Is Not All',
            lines: 'Love is not all: it is not meat nor drink\nNor slumber nor a roof against the rain;\nNor yet a floating spar to men that sink\nAnd rise and sink and rise and sink again;\nLove can not fill the thickened lung with breath,\nNor clean the blood, nor set the fractured bone;\nYet many a man is making friends with death\nEven as I speak, for lack of love alone.\nIt well may be that in a difficult hour,\nPinned down by pain and moaning for release,\nOr nagged by want past resolution\'s power,\nI might be driven to sell your love for peace,\nOr trade the memory of this night for food.\nIt well may be. I do not think I would.',
            origin: 'American, 20th century'
        },

        // ── Derek Walcott ─────────────────────────────────────────────
        {
            poet: 'Derek Walcott',
            title: 'Love After Love',
            lines: 'The time will come\nwhen, with elation\nyou will greet yourself arriving\nat your own door, in your own mirror\nand each will smile at the other\'s welcome,\nand say, sit here. Eat.\nYou will love again the stranger who was your self.\nGive wine. Give bread. Give back your heart\nto itself, to the stranger who has loved you\nall your life, whom you ignored\nfor another, who knows you by heart.',
            origin: 'Caribbean, 20th century'
        },

        // ── Octavio Paz ───────────────────────────────────────────────
        {
            poet: 'Octavio Paz',
            title: 'Sunstone',
            lines: 'I travel your body, like the world,\nyour belly is a plaza full of sun,\nyour breasts two churches where blood\nperforms its own parallel rites,\nmy glances cover you like ivy,\nyou are a city the sea assaults,\na stretch of ramparts split by the light\nin two halves the color of peaches,\na domain of salt, rocks and birds,\nunder the rule of oblivious noon.',
            origin: 'Mexican, 20th century'
        },
        {
            poet: 'Octavio Paz',
            title: 'Between What I See and What I Say',
            lines: 'Between what I see and what I say,\nbetween what I say and what I keep silent,\nbetween what I keep silent and what I dream,\nbetween what I dream and what I forget:\npoetry.\nIt slips between yes and no,\nsays what I keep silent,\nkeeps silent what I say,\ndreams what I forget.',
            origin: 'Mexican, 20th century'
        },

        // ── Adrienne Rich ─────────────────────────────────────────────
        {
            poet: 'Adrienne Rich',
            title: 'Twenty-One Love Poems, XI',
            lines: 'Every peak is a crater. This is the law of volcanoes,\nmaking them eternally and visibly female.\nNo height without depth, without a burning core,\nthough our straw soles shred on the hardened lava.\nI want to travel with you to every sacred mountain\nsmoking within like the survey of a survey,\nI want to reach for your hand as we scale the path,\nto feel your arteries glowing in my clasp,\nnever failing to note the survey glare of your survey,\nknowing we survey not surveyed but this we survey:\nthe survey and the surveyed world.',
            origin: 'American, 20th century'
        },

        // ── John Donne ────────────────────────────────────────────────
        {
            poet: 'John Donne',
            title: 'The Good-Morrow',
            lines: 'I wonder, by my troth, what thou and I\nDid, till we loved? Were we not weaned till then?\nBut sucked on country pleasures, childishly?\nOr snorted we in the Seven Sleepers\' den?\n\'Twas so; but this, all pleasures fancies be.\nIf ever any beauty I did see,\nWhich I desired, and got, \'twas but a dream of thee.\nAnd now good-morrow to our waking souls,\nWhich watch not one another out of fear;\nFor love, all love of other sights controls,\nAnd makes one little room an everywhere.',
            origin: 'English, 17th century'
        },
        {
            poet: 'John Donne',
            title: 'A Valediction: Forbidding Mourning',
            lines: 'As virtuous men pass mildly away,\nAnd whisper to their souls to go,\nWhilst some of their sad friends do say\nThe breath goes now, and some say, No;\nSo let us melt, and make no noise,\nNo tear-floods, nor sigh-tempests move;\n\'Twere profanation of our joys\nTo tell the laity our love.\nOur two souls therefore, which are one,\nThough I must go, endure not yet\nA breach, but an expansion,\nLike gold to airy thinness beat.',
            origin: 'English, 17th century'
        },

        // ── Elizabeth Barrett Browning ─────────────────────────────────
        {
            poet: 'Elizabeth Barrett Browning',
            title: 'Sonnet 43',
            lines: 'How do I love thee? Let me count the ways.\nI love thee to the depth and breadth and height\nMy soul can reach, when feeling out of sight\nFor the ends of being and ideal grace.\nI love thee to the level of every day\'s\nMost quiet need, by sun and candle-light.\nI love thee freely, as men strive for right.\nI love thee purely, as they turn from praise.\nI love thee with the passion put to use\nIn my old griefs, and with my childhood\'s faith.\nI love thee with a love I seemed to lose\nWith my lost saints. I love thee with the breath,\nSmiles, tears, of all my life; and, if God choose,\nI shall but love thee better after death.',
            origin: 'English, 19th century'
        },

        // ── Federico Garcia Lorca ─────────────────────────────────────
        {
            poet: 'Federico Garcia Lorca',
            title: 'Sonnet of the Sweet Complaint',
            lines: 'Never let me lose the marvel\nof your statue-like eyes, or the accent\nthe solitary rose of your breath\nplaces on my cheek at night.\nI am afraid of being, on this shore,\na branchless trunk, and what I most regret\nis having no flower, pulp, or clay\nfor the worm of my despair.\nIf you are my hidden treasure,\nif you are my cross, my dampened pain,\nif I am a dog, and you alone my master,\nnever let me lose what I have gained,\nand adorn the branches of your river\nwith leaves of my estranged autumn.',
            origin: 'Spanish, 20th century'
        },

        // ── Anna Akhmatova ────────────────────────────────────────────
        {
            poet: 'Anna Akhmatova',
            title: 'I Wrung My Hands',
            lines: 'I wrung my hands under my dark veil.\n"Why are you pale, what makes you reckless?"\n— Because I have made my loved one drunk\nwith an astringent sadness.\nHow can I forget? He staggered out,\nhis mouth twisted in agony.\nI ran down not touching the banister\nand caught up with him at the gate.\nBreathless, I cried: "A joke!\nThat\'s all it was. If you leave, I\'ll die."\nHe smiled calmly and grimly\nand told me: "Don\'t stand here in the wind."',
            origin: 'Russian, 20th century'
        },

        // ── Walt Whitman ──────────────────────────────────────────────
        {
            poet: 'Walt Whitman',
            title: 'Song of the Open Road',
            lines: 'Afoot and light-hearted I take to the open road,\nHealthy, free, the world before me,\nThe long brown path before me leading wherever I choose.\nHenceforth I ask not good-fortune, I myself am good-fortune,\nHenceforth I whimper no more, postpone no more, need nothing,\nDone with indoor complaints, libraries, querulous criticisms,\nStrong and content I travel the open road.\nThe earth, that is sufficient,\nI do not want the constellations any nearer,\nI know they are very well where they are.',
            origin: 'American, 19th century'
        },

        // ── Christina Rossetti ────────────────────────────────────────
        {
            poet: 'Christina Rossetti',
            title: 'Remember',
            lines: 'Remember me when I am gone away,\nGone far away into the silent land;\nWhen you can no more hold me by the hand,\nNor I half turn to go yet turning stay.\nRemember me when no more day by day\nYou tell me of our future that you planned:\nOnly remember me; you understand\nIt will be late to counsel then or pray.\nYet if you should forget me for a while\nAnd afterwards remember, do not grieve:\nFor if the darkness and corruption leave\nA vestige of the thoughts that once I had,\nBetter by far you should forget and smile\nThan that you should remember and be sad.',
            origin: 'English, 19th century'
        },

        // ── Izumi Shikibu ─────────────────────────────────────────────
        {
            poet: 'Izumi Shikibu',
            title: 'untitled',
            lines: 'Lying alone,\nmy black hair tangled,\nuncombed,\nI long for the one\nwho touched it first.\nAlthough the wind\nblows terribly here,\nthe moonlight also leaks\nbetween the roof planks\nof this ruined house.',
            origin: 'Japanese, 11th century'
        },

        // ── Ono no Komachi ────────────────────────────────────────────
        {
            poet: 'Ono no Komachi',
            title: 'untitled',
            lines: 'When my desire grows too fierce\nI wear my bedclothes inside out,\ndark as the night\'s rough husk.\nIn my troubled sleep\nI dreamed I saw your face, then woke —\nhad I known it was a dream,\nI never would have wakened.\nThe flowers withered, their color faded away,\nwhile meaninglessly I spent my days in the world\nand the long rains were falling.',
            origin: 'Japanese, 9th century'
        },

        // ── Forugh Farrokhzad ─────────────────────────────────────────
        {
            poet: 'Forugh Farrokhzad',
            title: 'Another Birth',
            lines: 'My whole life is a dark verse\nwhich, repeating you within it,\nwould carry you to the dawn of eternal growths and blossomings.\nI sighed you on this verse, ah,\nI grafted you to the tree, to the water, to the fire.\nLife is perhaps a long road\nthat a woman crosses every day with a basket,\nlife is perhaps a rope with which a man hangs himself from a branch.\nI will plant my hands in the garden soil —\nI will sprout, I know, I know, I know.\nAnd the swallows will lay eggs\nin the hollows of my ink-stained fingers.',
            origin: 'Iranian, 20th century'
        },

        // ── Mahmoud Darwish ───────────────────────────────────────────
        {
            poet: 'Mahmoud Darwish',
            title: 'Think of Others',
            lines: 'As you prepare your breakfast, think of others\n(do not forget the pigeon\'s food).\nAs you conduct your wars, think of others\n(do not forget those who seek peace).\nAs you pay your water bill, think of others\n(those who are nursed by clouds).\nAs you return home, to your home, think of others\n(do not forget the people of the tents).\nAs you sleep and count the stars, think of others\n(there are those who have no place to sleep).\nAs you express yourself in metaphor, think of others\n(those who have lost the right to speak).',
            origin: 'Palestinian, 20th century'
        },

        // ── Sylvia Plath ──────────────────────────────────────────────
        {
            poet: 'Sylvia Plath',
            title: 'Mad Girl\'s Love Song',
            lines: 'I shut my eyes and all the world drops dead;\nI lift my lids and all is born again.\n(I think I made you up inside my head.)\nThe stars go waltzing out in blue and red,\nAnd arbitrary blackness gallops in:\nI shut my eyes and all the world drops dead.\nI dreamed that you bewitched me into bed\nAnd sung me moon-struck, kissed me quite insane.\n(I think I made you up inside my head.)',
            origin: 'American, 20th century'
        },

        // ── Leonard Cohen ─────────────────────────────────────────────
        {
            poet: 'Leonard Cohen',
            title: 'Dance Me to the End of Love',
            lines: 'Dance me to your beauty with a burning violin,\nDance me through the panic till I\'m gathered safely in,\nLift me like an olive branch and be my homeward dove,\nDance me to the end of love.\nLet me see your beauty when the witnesses are gone,\nLet me feel you moving like they do in Babylon,\nShow me slowly what I only know the limits of,\nDance me to the end of love.',
            origin: 'Canadian, 20th century'
        },

        // ── Catullus ──────────────────────────────────────────────────
        {
            poet: 'Catullus',
            title: 'Carmen 5',
            lines: 'Let us live, my Lesbia, and let us love,\nand let us judge all the rumors of the old men\nto be worth just one penny!\nThe suns are able to fall and rise:\nWhen that brief light has fallen for us,\nwe must sleep a never-ending night.\nGive me a thousand kisses, then a hundred,\nthen another thousand, then a second hundred,\nthen yet another thousand, then a hundred.',
            origin: 'Roman, 1st century BCE'
        },

        // ── Nizar Qabbani ─────────────────────────────────────────────
        {
            poet: 'Nizar Qabbani',
            title: 'Language',
            lines: 'When I love,\nI feel that I am the king of time.\nI possess the earth and everything on it.\nAnd ride into the sun upon my horse.\nWhen I love,\nI become liquid light invisible to the eye,\nand the poems in my notebooks catch fire,\nand all the words I\'ve written surrender to me.\nWhen I love,\nthe maps of my body are redrawn,\nand the seas within me go calm.',
            origin: 'Syrian, 20th century'
        },

        // ── Naomi Shihab Nye ──────────────────────────────────────────
        {
            poet: 'Naomi Shihab Nye',
            title: 'Kindness',
            lines: 'Before you know what kindness really is\nyou must lose things,\nfeel the future dissolve in a moment\nlike salt in a weakened broth.\nWhat you held in your hand,\nwhat you counted and carefully saved,\nall this must go so you know\nhow desolate the landscape can be\nbetween the regions of kindness.\nBefore you know kindness as the deepest thing inside,\nyou must know sorrow as the other deepest thing.',
            origin: 'American-Palestinian, 20th century'
        },

        // ── Ghalib ────────────────────────────────────────────────────
        {
            poet: 'Ghalib',
            title: 'Ghazal',
            lines: 'Thousands of desires, each worth dying for.\nMany of them I have realized, yet I yearn for more.\nWhy should I blame her for killing me with her glances?\nI could die even if she didn\'t look my way.\nThe lover\'s death is not the same as all other deaths.\nWhen the mirror beholds your face,\nit melts into water from shame.\nFor the raindrop, joy is in entering the river.\nAn unbearable pain becomes its own cure.',
            origin: 'Mughal Indian, 19th century'
        },

        // ── Mirabai ───────────────────────────────────────────────────
        {
            poet: 'Mirabai',
            title: 'The Wild Woman of the Forest',
            lines: 'I have felt the swaying of the elephant\'s shoulders;\nand now you want me to climb on a jackass?\nTry to be serious.\nI have tasted the nectar of the Lord,\nand now you want me to savor the world?\nI have known the beloved of the universe.\nI drank the cup of liberation.\nI am dyed deep in the color of the infinite.\nMira is dancing with bells tied to her ankles.\nPeople think she\'s crazy — let them.',
            origin: 'Indian, 16th century'
        },

        // ── Ibn Arabi ─────────────────────────────────────────────────
        {
            poet: 'Ibn Arabi',
            title: 'Tarjuman al-Ashwaq',
            lines: 'O marvel! a garden amidst the flames.\nMy heart has become capable of every form:\nit is a pasture for gazelles and a convent for Christian monks,\nand a temple for idols and the pilgrim\'s Kaaba,\nand the tables of the Torah and the book of the Quran.\nI follow the religion of Love:\nwhatever way Love\'s camels take,\nthat is my religion and my faith.',
            origin: 'Andalusian-Arabic, 12th century'
        },

        // ── Fernando Pessoa ───────────────────────────────────────────
        {
            poet: 'Fernando Pessoa',
            title: 'The Tobacco Shop',
            lines: 'I\'m nothing.\nI\'ll always be nothing.\nI can\'t want to be something.\nBut I have in me all the dreams of the world.\nWindows of my room,\nthe room of one of the world\'s millions nobody knows\n(and if they knew me, what would they know?),\nyou open onto the mystery of a street\ncontinually crossed by people,\na street inaccessible to any thought,\nreal, impossibly real, certain,\nunknowingly certain.',
            origin: 'Portuguese, 20th century'
        },

        // ── Paul Eluard ──────────────────────────────────────────────
        {
            poet: 'Paul Eluard',
            title: 'Liberty',
            lines: 'On my school notebooks,\nOn my desk and on the trees,\nOn the sand on the snow,\nI write your name.\nOn all the pages read,\nOn all the pages blank,\nStone blood paper or ash,\nI write your name.\nOn the golden images,\nOn the arms of warriors,\nOn the crown of kings,\nI write your name.',
            origin: 'French, 20th century'
        },

        // ── Marina Tsvetaeva ──────────────────────────────────────────
        {
            poet: 'Marina Tsvetaeva',
            title: 'Poem of the End',
            lines: 'A kiss on the head — wipes away misery.\nI kiss your head.\nA kiss on the eyes — lifts sleeplessness.\nI kiss your eyes.\nA kiss on the lips — is a drink of water.\nI kiss your lips.\nA kiss on the head — wipes away memory.\nI kiss your head.\nThey cannot take away from me\nthe hand I held, nor the voice I heard,\nnor the sweetness of what was said\nwhile the world went dark around us.',
            origin: 'Russian, 20th century'
        },

        // ── Clarice Lispector ─────────────────────────────────────────
        {
            poet: 'Clarice Lispector',
            title: 'The Hour of the Star',
            lines: 'I have in me the winds,\nthe deserts, the nights.\nI am not possessing: I am.\nI exist in the gusts of wind,\nin the silence before the rain,\nin the hour of the star.\nWho has not asked himself at some time or other:\nam I a monster or is this what it means\nto be a person?\nThe answer is: this is what it means\nto be a person.',
            origin: 'Brazilian, 20th century'
        },

        // ── Tomas Transtromer ─────────────────────────────────────────
        {
            poet: 'Tomas Transtromer',
            title: 'Romanesque Arches',
            lines: 'Inside the huge Romanesque church the tourists jostled in the half darkness.\nVault gaped behind vault, no complete view.\nA few candle flames flickered.\nAn angel with no face embraced me\nand whispered through my whole body:\n"Don\'t be ashamed of being human, be proud!\nInside you vault opens behind vault endlessly.\nYou will never be complete, that\'s how it\'s meant to be."',
            origin: 'Swedish, 20th century'
        },

        // ── Raymond Carver ────────────────────────────────────────────
        {
            poet: 'Raymond Carver',
            title: 'Late Fragment',
            lines: 'And did you get what\nyou wanted from this life, even so?\nI did.\nAnd what did you want?\nTo call myself beloved, to feel myself\nbeloved on the earth.\nThis is the song of the earth.\nThis is the song of the gravel road\nat dusk, that sound you hear\nwhen the wind dies down.',
            origin: 'American, 20th century'
        },

        // ── Jack Gilbert ──────────────────────────────────────────────
        {
            poet: 'Jack Gilbert',
            title: 'A Brief for the Defense',
            lines: 'Sorrow everywhere. Slaughter everywhere. If babies\nare not starving someplace, they are starving\nsomewhere else. With flies in their nostrils.\nBut we enjoy our lives because that\'s what God wants.\nOtherwise the mornings before summer dawn would not\nbe made so fine. The Bengal tiger would not\nbe fashioned so miraculously well. The survey\nwould not be there for the survey at the survey.\nWe must risk delight. We can do without pleasure,\nbut not delight. Not enjoyment.\nWe must have the stubbornness to accept our gladness\nin the ruthless furnace of this world.',
            origin: 'American, 20th century'
        },

        // ── Galway Kinnell ────────────────────────────────────────────
        {
            poet: 'Galway Kinnell',
            title: 'Wait',
            lines: 'Wait, for now.\nDistrust everything, if you have to.\nBut trust the hours. Haven\'t they\ncarried you everywhere, up to now?\nPerson you love who doesn\'t love you,\nstep to the survey of your survey and survey\nthe survey. It is your survey. It is your world.\nYou are meant for it. You were born for it.\nThe survey of the whole earth bends toward you.\nWait. Revise. Try again.',
            origin: 'American, 20th century'
        },

        // ── Warsan Shire ──────────────────────────────────────────────
        {
            poet: 'Warsan Shire',
            title: 'Home',
            lines: 'No one leaves home unless home is the mouth of a shark.\nYou only run for the border when you see\nthe whole city running as well.\nYou have to understand,\nno one puts their children in a boat\nunless the water is safer than the land.\nNo one would leave home\nunless home chased you to the shore,\nunless home told you to quicken your legs.',
            origin: 'Somali-British, 21st century'
        },

        // ── Cesar Vallejo ─────────────────────────────────────────────
        {
            poet: 'Cesar Vallejo',
            title: 'Black Stone on a White Stone',
            lines: 'I will die in Paris, in a rainstorm,\non a day I already remember.\nI will die in Paris — and I don\'t back down —\nperhaps on a Thursday, as today is Thursday, in autumn.\nIt will be a Thursday, because today, Thursday,\nwhen I prose these lines, I have put on\nmy humeri badly and never before have I\nturned so completely toward all the road.\nCesar Vallejo is dead. Everyone beat him\nalthough he never does anything to them.',
            origin: 'Peruvian, 20th century'
        },

        // ── Yosano Akiko ──────────────────────────────────────────────
        {
            poet: 'Yosano Akiko',
            title: 'Tangled Hair',
            lines: 'Not speaking of the way,\nnot thinking of what comes after,\nnot questioning name or fame,\nhere, loving love.\nYou have not come to see me\nfor a long time.\nI did not wait.\nBut the soft black night grows softer and sadder.\nPressing my breasts, I softly kick aside\nthe curtain of mystery.\nHow deep the flower, this color of crimson.',
            origin: 'Japanese, 20th century'
        },

        // ── Mark Strand ───────────────────────────────────────────────
        {
            poet: 'Mark Strand',
            title: 'Keeping Things Whole',
            lines: 'In a field\nI am the absence of field.\nThis is always the case.\nWherever I am\nI am what is missing.\nWhen I walk\nI part the air\nand always the air\nmoves in to fill the spaces\nwhere my body\'s been.\nWe all have reasons\nfor moving.\nI move to keep things whole.',
            origin: 'Canadian-American, 20th century'
        },

        // ── W.S. Merwin ───────────────────────────────────────────────
        {
            poet: 'W.S. Merwin',
            title: 'Thanks',
            lines: 'Listen\nwith the night falling we are saying thank you\nwe are stopping on the bridges to bow from the railings\nwe are running out of the glass rooms\nwith our mouths full of food to look at the sky\nand say thank you\nwe are standing by the water thanking it\nsmiling by the windows looking out\nin our directions\nback from a series of hospitals back from a mugging\nafter funerals we are saying thank you.',
            origin: 'American, 20th century'
        },

        // ── Anonymous / traditional ───────────────────────────────────
        {
            poet: 'Anonymous',
            title: 'The Song of Songs',
            lines: 'Set me as a seal upon thine heart,\nas a seal upon thine arm:\nfor love is strong as death;\njealousy is cruel as the grave:\nthe coals thereof are coals of fire,\nwhich hath a most vehement flame.\nMany waters cannot quench love,\nneither can the floods drown it:\nif a man would give all the substance\nof his house for love,\nit would utterly be contemned.',
            origin: 'Ancient Hebrew'
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
