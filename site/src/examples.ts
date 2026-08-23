/* Example programs for the playground.
 *
 * `en` and `ko` hold the two sets. They are deliberately the SAME programs in
 * two languages — same ids, same order, same lesson — so a visitor on either
 * page sees the same tour of the language.
 *
 * Every entry is compiled by the real compiler and run in the browser engine by
 * `scripts/check-examples.mjs` before a deploy, and its output is compared with
 * `expect`. An example that stops working stops the deploy.
 *
 *   id        stable name, used by the checker and by the #example= link
 *   label     the chip text
 *   answers   lines fed to input() while checking; [] means it never asks
 *   expect    text that must appear in the output
 *   fails     true when the program is *meant* not to compile (the error demo)
 *
 * Because `expect` is checked, no example may print only random text: give
 * every program at least one line that always says the same thing.
 */

/* Thirty-seven examples in one strip is a wall, and the owner said so: "there
 * are so many examples on the site that I cannot tell what is what." So every
 * entry belongs to one of seven groups, and the page shows one group at a time
 * — plus an "everything" chip in front of them, for the reader who would
 * rather scan the whole shelf than guess which drawer a program is in.
 * The order here is the order they are offered in.
 *
 * The role-playing games are their own group rather than three entries buried
 * among the small ones. They are the longest programs on the site — `peace` is
 * 4,337 lines — and someone who came to see how far the sentence syntax goes
 * is looking for exactly these. */
export type ExampleGroup = 'start' | 'choose' | 'data' | 'game' | 'rpg' | 'big' | 'ways';

export const GROUPS: readonly ExampleGroup[] = ['start', 'choose', 'data', 'game', 'rpg', 'big', 'ways'];

/* The shape every entry has.
 *
 *   fails   the program is meant NOT to compile — the error demonstration
 *   fixed   the way this one is written IS the lesson (six spellings in one
 *           file, three levels side by side, the two languages mixed), so the
 *           spelling chooser leaves it alone rather than flattening it
 */
export interface Example {
  readonly id: string;
  readonly label: string;
  readonly group: ExampleGroup;
  readonly answers: readonly string[];
  readonly expect: string;
  readonly source: string;
  readonly fails?: true;
  readonly fixed?: true;
}

export type ExampleLanguage = 'en' | 'ko';

/* What each group is called, in the language of the page. Kept beside the data
 * rather than in the page script because it is part of what an example is. */
export const GROUP_LABELS: Readonly<Record<ExampleLanguage, Readonly<Record<ExampleGroup, string>>>> = {
  en: {
    start: 'Start here',
    choose: 'Choosing and repeating',
    data: 'Lists and text',
    game: 'Games',
    rpg: 'RPG',
    big: 'Bigger programs',
    ways: 'Ways of writing it',
  },
  ko: {
    start: '처음 해 보기',
    choose: '고르기와 되풀이',
    data: '목록과 글',
    game: '게임',
    rpg: 'RPG',
    big: '큰 프로그램',
    ways: '쓰는 방법 견주기',
  },
};

/* The chip in front of the group names, which turns the filter off. Someone
 * who does not know which drawer a program is in should not have to guess:
 * this shows the whole shelf, in the order the file is written. */
export const ALL_LABEL: Readonly<Record<ExampleLanguage, string>> = {
  en: 'Everything',
  ko: '전부',
};

export const EXAMPLES: Readonly<Record<ExampleLanguage, readonly Example[]>> = {
  en: [
    {
      id: 'hello',
      label: 'Hello',
      group: 'start',
      answers: [],
      expect: 'Hello, world!',
      source: `# This line does nothing at all. A # at the front makes it a note for people.
show Hello, world!
repeat 3 times and show NME is easy`,
    },
    {
      id: 'storyblock',
      label: 'A story in one block',
      group: 'start',
      answers: [],
      expect: 'no title',
      source: `# Inside a story block every line is text. No 'show' needed.
story:
    It was a very old library.
    The books stood at every thickness.
    On the bottom shelf one lay flat.
end
slow story:
    That book had no title.
end`,
    },
    {
      id: 'slow',
      label: 'A story, letter by letter',
      group: 'start',
      answers: [],
      expect: 'That is the end',
      source: `# Letters arrive one at a time, the way a story does.
say slowly The door opened slowly.
wait 1 second
say very slowly Nobody was there.
show That is the end`,
    },
    {
      id: 'ask',
      label: 'Ask a name',
      group: 'start',
      answers: ['Mina'],
      expect: 'Hello Mina!',
      source: `# A question is just a question. The answer becomes a name.
What is your name?
show Hello name!
3 times Welcome to NME`,
    },
    {
      id: 'maths',
      label: 'Change a value',
      group: 'start',
      answers: [],
      expect: '20',
      source: `# Add, subtract, multiply and divide without + - * / or =.
set score to 3
add 7 to score
multiply score by 4
divide score by 2
show score`,
    },
    {
      id: 'list',
      label: 'Going through a list',
      group: 'data',
      answers: [],
      expect: 'Hello Grace!',
      source: `# Make a list, then walk through it.
set friends to list of Mina, Ada and Grace
for each friend in friends
show Hello friend!
end`,
    },
    {
      id: 'collect',
      label: 'Adding to a list',
      group: 'data',
      answers: ['apple', 'pear', 'plum'],
      expect: 'plum',
      source: `# Start with an empty list, ask three times, keep every answer.
set fruits to list of
repeat 3 times
ask fruit Name a fruit
append fruit to fruits
end
show fruits`,
    },
    {
      id: 'listwork',
      label: 'Making a list and using it',
      group: 'data',
      answers: [],
      expect: 'the milk is still there',
      source: `# A whole list program with no brackets and no punctuation.
set items to an empty list
append apples to items
append bread to items
append milk to items
show how many items
sort items
show items joined by comma
show the first of items
remove bread from items
if items contains milk
    show the milk is still there
end`,
    },
    {
      id: 'textwork',
      label: 'Cutting text apart',
      group: 'data',
      answers: [],
      expect: 'apples, berries, grapes',
      source: `# One line of text becomes a list, and a list becomes one line.
set row to apples,grapes,berries
set fruits to row split by comma
show how many fruits
sort fruits
show fruits joined by comma
set star to *
for each fruit in fruits with place
    set bar to star repeated place times
    show fruit
    show bar
end`,
    },
    {
      id: 'record',
      label: 'A value under each name',
      group: 'data',
      answers: [],
      expect: 'Seoul',
      source: `# A record: found by name rather than by place.
set book to an empty record
put Mina at Seoul in book
put Sana at Busan in book
show how many book
show Mina in book
for each name in book
    show name
    show name in book
end
if book contains Sana
    show Sana is in the book
end`,
    },
    {
      id: 'dates',
      label: 'Today, in the program',
      group: 'start',
      answers: [],
      expect: 'a week from today',
      source: `# The computer already knows the date. The clock is UTC.
use date latest
show todays date is
say today()
show and the day is
say weekday()
show a week from today
say days_after(7)`,
    },
    {
      id: 'job',
      label: 'A job with a name',
      group: 'choose',
      answers: [],
      expect: 'Nice to meet you',
      source: `# Give several lines a name, then run them by that name.
to greet:
    show Hello
    show Nice to meet you
end
do greet
to praise someone:
    show well done
    show someone
end
do praise with Mina`,
    },
    {
      id: 'conditions',
      label: 'Combining conditions',
      group: 'choose',
      answers: [],
      expect: 'Good evening',
      source: `# and, or, exists, and the comparison words.
set name to Mina
set hour to 21
set tired to False

if name exists and hour is greater than 18 then show Good evening name!
if tired or hour is greater than or equal to 23 then show Time for bed
if hour is not equal to 12 then show It is not noon`,
    },
    {
      id: 'while',
      label: 'Repeat while it is true',
      group: 'choose',
      answers: [],
      expect: 'finished',
      source: `# The block closes with end, so indentation is optional.
set count to 0
while count is less than 5
show count
add 1 to count
end
show finished`,
    },
    {
      id: 'skip',
      label: 'Skip one turn',
      group: 'choose',
      answers: [],
      expect: '7',
      source: `# skip jumps to the next round; break leaves the loop.
set score to 0
repeat 8 times
add 1 to score
if score equals 3 then skip
show score
end`,
    },
    {
      id: 'countdown',
      label: 'Leave a loop early',
      group: 'choose',
      answers: [],
      expect: 'Stopped early',
      source: `# Count down, and leave the loop before it finishes.
set left to 5
while left is greater than 0
show left
subtract 1 from left
if left equals 2 then break
end
show Stopped early`,
    },
    {
      id: 'wait',
      label: 'Wait a moment',
      group: 'start',
      answers: [],
      expect: 'Done',
      source: `# Waiting is a sentence too.
show Ready
repeat 3 times
wait 1 second
show tick
end
show Done`,
    },
    {
      id: 'guess',
      label: 'Guessing game',
      group: 'game',
      answers: ['5'],
      expect: 'Thanks for playing',
      source: `# No quotes, commas, equals signs or colons anywhere.
set answer to random number from 1 to 10
ask number guess Pick a number from 1 to 10

if guess equals answer
show Correct!
else if guess is less than answer
show Go higher
else
show Go lower
end
show Thanks for playing`,
    },
    {
      id: 'chance',
      label: 'Deciding by chance',
      group: 'game',
      answers: [],
      expect: 'always shows',
      source: `# A percentage decides how often something happens.
set die to random number from 1 to 6
show Rolling now
show die
100% chance show This line always shows
0% chance show This line never shows
30% chance show About three times in ten
rain is a 40% chance
if rain
    show Take an umbrella
else
    show It is clear today
end`,
    },
    {
      id: 'screen',
      label: 'Arrange the screen',
      group: 'start',
      answers: [],
      expect: 'Coffee, tea, water',
      source: `# Four sentences that tidy the screen.
clear the screen
draw a line
say in the middle Todays menu
draw a line
say in a box Coffee, tea, water`,
    },
    {
      id: 'clock',
      label: 'Stopwatch and cooldown',
      group: 'game',
      answers: [],
      expect: 'The door opened',
      source: `# A stopwatch and a named cooldown, both as sentences.
start the timer
put door on cooldown for 2 seconds

when door is on cooldown
show The door is still locked
end

wait for door
show The door opened
show elapsed`,
    },
    {
      id: 'rps',
      label: 'Rock, paper, scissors',
      group: 'game',
      answers: ['rock'],
      expect: 'Thanks for playing',
      source: `# A whole game: a random choice, a question and three answers.
set mine to rock or paper or scissors chosen at random
ask yours rock, paper or scissors?

show I chose mine

if yours equals mine
show A draw
else
show One of us won
end
show Thanks for playing`,
    },
    {
      id: 'reaction',
      label: 'How fast are you?',
      group: 'game',
      answers: [''],
      expect: 'Your time',
      source: `# The stopwatch, used for the thing stopwatches are for.
show Get ready
wait 2 seconds
show NOW, press enter
start the timer
ask pressed press enter
show Your time in seconds
show elapsed`,
    },
    {
      id: 'story',
      label: 'A short story',
      group: 'game',
      answers: ['left'],
      expect: 'That is the end.',
      source: `# A story that asks which way you go.
show The path splits in two.
ask way Left or right?

if way equals left
show A river. You follow it home.
else
show A cave. Something inside is asleep.
end
show That is the end.`,
    },
    {
      id: 'menu',
      label: 'A tiny menu',
      group: 'choose',
      answers: ['2'],
      expect: 'One tea',
      source: `# A menu is a question and three answers.
show Today we have coffee and tea.
ask number pick Type 1 for coffee or 2 for tea

if pick equals 1
show One coffee, coming up.
else if pick equals 2
show One tea, coming up.
else
show We only have those two.
end`,
    },
    {
      id: 'table',
      label: 'Five times table',
      group: 'choose',
      answers: [],
      expect: '25',
      source: `# The five times table, built by adding.
set total to 0
repeat 5 times
add 5 to total
show total
end`,
    },
    {
      id: 'sum',
      label: 'Add three numbers',
      group: 'start',
      answers: ['2', '3', '4'],
      expect: 'Altogether that is 9',
      source: `# Three answers, one total.
ask number first First number
ask number second Second number
ask number third Third number

set total to first
add second to total
add third to total
show Altogether that is total`,
    },
    {
      id: 'password',
      label: 'Until it is right',
      group: 'choose',
      answers: ['please', 'open'],
      expect: 'The door swings open.',
      source: `# Keep asking until the answer is the right one.
set word to nothing
while word is not equal to open
ask word Say the magic word
end
show The door swings open.`,
    },
    {
      id: 'six',
      label: 'Three syntaxes × two languages',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: 'advanced English',
      source: `# Sentence, beginner and Python, each in English and in Korean.
# Six ways of writing, one file, no declarations anywhere.
show hello                    # sentence, English
안녕하세요 말해줘              # sentence, Korean
say "beginner English"        # beginner, English
말해 "초급 한국어"             # beginner, Korean
greeting = "advanced English" # Python, English names
print(greeting)
인사 = "고급 한국어"            # Python, Korean names
print(인사)`,
    },
    {
      id: 'levels',
      label: 'The same program, three syntaxes',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: 'sentence syntax',
      source: `# Advanced Python, beginner NME and sentence NME in one file.
people = ["Ada", "Grace"]                 # advanced Python

2 times:                                  # beginner
    say "beginner syntax"

repeat 2 times                            # sentence
show sentence syntax
end

for person in people:                     # advanced again
    show Hello person!`,
    },
    {
      id: 'mix',
      label: 'English + Korean',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: 'friend',
      source: `# Both languages, on the same line if you like.
use random latest
set animal to pick from cat or dog
3번 반복해서 a animal for friend! 말해줘`,
    },
    {
      id: 'typo',
      label: 'Reading past a typo',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: 'and once more',
      source: `# Every line below is misspelt, mis-ordered or over-polite.
# Only one action fits each one, so NME reads it and says so
# instead of guessing — or of quietly printing your mistake.
repaet 2 times and show Again
waite 1 second
please say and again
set score to 0
to score add 1
show score
2 timse: say "and once more"`,
    },
    {
      id: 'error',
      label: 'What an error looks like',
      group: 'ways',
      fixed: true,
      answers: [],
      fails: true,
      expect: 'E0101',
      source: `# This one is meant to fail — the commonest beginner slip.
# One loop takes one end; the second one closes nothing, and the
# compiler points at it and gives the error a stable number.
repeat 3 times
show hello
end
end`,
    },
    {
      id: 'coin',
      label: 'A tiny blockchain',
      group: 'big',
      answers: [],
      expect: 'Block mined',
      source: `# Real hashing, real proof of work, no punctuation to learn.
import hashlib

set difficulty to 3
set previous to genesis
set nonce to 0

while True
    candidate = previous + str(nonce)
    digest = hashlib.sha256(candidate.encode()).hexdigest()
    if digest.startswith("0" * difficulty):
        break
    add 1 to nonce

show Block mined
show digest`,
    },
    {
      id: 'zk',
      label: 'Proof without the secret',
      group: 'big',
      answers: [],
      expect: 'The proof was accepted',
      source: `# Prove you know a secret without ever showing it.
use zero_knowledge latest

set context to login
set secret to zero knowledge secret make
set shown to secret zero knowledge public make
set evidence to secret context zero knowledge proof make
set valid to shown evidence context zero knowledge verify

if valid
show The proof was accepted
else
show The proof was refused
end`,
    },
    {
      id: 'grow',
      label: 'Growing into Python',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: 'three',
      source: `# The same idea written three ways, in one file.
set word to three
show word

say word

print(word)`,
    },
    {
      id: 'rpg',
      label: 'Turn-based RPG',
      group: 'rpg',
      answers: ['Wanderer', 'knight', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee', 'flee'],
      expect: 'The Forgotten Tower',
      source: `# ────────────────────────────────────────────────────────────────
# The Forgotten Tower — a turn-based role-playing game
#
# Written in NME sentence syntax only. Not one line of Python.
# One sentence is one line, and that line becomes one line of Python.
#
# Apache-2.0
# ────────────────────────────────────────────────────────────────

clear the screen
draw a line
say in the middle The Forgotten Tower
say in the middle a turn-based role-playing game
draw a line

story:

  For a hundred years the door of the tower stayed shut.
  Many climbers went up. Nobody ever came back down.
  This morning the door swung open by itself, and here you are.

end

ask heroName What shall we call you?
if heroName is missing
  set heroName to Wanderer
end

draw a line
show A knight is sturdy, a mage hits hard, a thief is quick.
ask heroClass Knight, mage or thief — which will you be?

if heroClass equals mage
  set heroKind to mage
  set heroMax to 26
  set heroHit to 4
  set heroGuard to 1
  set heroSpark to 12
else if heroClass equals thief
  set heroKind to thief
  set heroMax to 30
  set heroHit to 6
  set heroGuard to 2
  set heroSpark to 6
else
  set heroKind to knight
  set heroMax to 36
  set heroHit to 6
  set heroGuard to 4
  set heroSpark to 3
end

set heroLife to heroMax
set heroFlask to 3
set purse to 10
set wisdom to 0
set rank to 1
set nextRank to 12
set floorNumber to 1
set ending to climbing

to sheet:
  draw a line
  show heroName · heroKind · step rank
  show arm heroHit · shield heroGuard · spark heroSpark
  show life heroLife / heroMax · flasks heroFlask · coins purse
  draw a line
end

do sheet
wait 1 second

repeat forever

  clear the screen
  draw a line
  say in the middle floor floorNumber
  draw a line

  if floorNumber is greater than 3
    set foeName to the keeper of the tower
    set foeMax to 46
    set foeHit to 11
    set prizeGold to 40
    set prizeWisdom to 30
  else if floorNumber equals 3
    set foeName to pick from stone golem or black knight
    set foeMax to 30
    set foeHit to 8
    set prizeGold to 16
    set prizeWisdom to 14
  else if floorNumber equals 2
    set foeName to pick from wolf or wisp or spider
    set foeMax to 22
    set foeHit to 6
    set prizeGold to 10
    set prizeWisdom to 9
  else
    set foeName to pick from slime or bat or rat
    set foeMax to 14
    set foeHit to 4
    set prizeGold to 6
    set prizeWisdom to 6
  end

  set foeLife to foeMax
  show foeName steps into the way.
  wait 1 second

  repeat forever

    draw a line
    show against foeName · left foeLife / foeMax
    show yours heroLife / heroMax · spark heroSpark · flasks heroFlask
    ask choice strike · spell · flask · flee — what will you do?

    if choice equals spell

      if heroSpark is less than 3
        show The spark is too thin and the words scatter.
      else
        subtract 3 from heroSpark
        set dealt to random number from 6 to 13
        add rank to dealt
        subtract dealt from foeLife
        show Blue fire bites for dealt.
      end

    else if choice equals flask

      if heroFlask is greater than 0
        subtract 1 from heroFlask
        add 12 to heroLife
        if heroLife is greater than heroMax
          set heroLife to heroMax
        end
        show You drain the bottle and warmth spreads.
      else
        show Not one bottle is left.
      end

    else if choice equals flee

      if floorNumber is greater than 3
        show The door is gone. There is no back from here.
      else
        set gotAway to false
        45% chance
          set gotAway to true
        end
        if gotAway exists
          show You tumble two steps down and land outside.
          set ending to away
          break
        else
          show You turn your back and are caught at once.
        end
      end

    else

      set dealt to random number from 3 to 9
      add heroHit to dealt
      20% chance
        multiply dealt by 2
        show Straight through the opening.
      end
      subtract dealt from foeLife
      show Your blow lands for dealt.

    end

    if foeLife is less than 1
      draw a line
      show foeName goes down.
      break
    end

    set taken to random number from 2 to 7
    add foeHit to taken
    subtract heroGuard from taken
    if taken is less than 1
      set taken to 1
    end
    subtract taken from heroLife
    show The answer from foeName costs you taken.

    if heroLife is less than 1
      draw a line
      set ending to fallen
      break
    end

    wait 1 second

  end

  if ending is not equal to climbing
    break
  end

  add prizeGold to purse
  add prizeWisdom to wisdom
  show won prizeGold coins · lesson prizeWisdom

  if wisdom is greater than nextRank
    subtract nextRank from wisdom
    add 1 to rank
    add 6 to heroMax
    add 2 to heroHit
    add 1 to heroGuard
    add 3 to heroSpark
    set heroLife to heroMax
    add 8 to nextRank
    draw a line
    say in a box you are step rank now
    draw a line
  end

  if floorNumber is greater than 3
    set ending to crowned
    break
  end

  draw a line
  show A quiet landing. A trader leans against the wall.
  show One bottle costs 8 coins.
  show purse coins in hand.
  ask shopChoice Buy a bottle? yes · no

  if shopChoice equals yes
    if purse is greater than 7
      subtract 8 from purse
      add 1 to heroFlask
      show One bottle goes into your pack.
    else
      show Not enough for that.
    end
  else
    show The trader nods and looks away.
  end

  add 4 to heroLife
  if heroLife is greater than heroMax
    set heroLife to heroMax
  end

  add 1 to floorNumber
  wait 1 second

end

clear the screen
draw a line

if ending equals crowned
  say in the middle the top of the tower
  draw a line
  story:

    Wind touches your face.
    In a hundred years nobody has stood here.
    Looking down, the way up seems very short.

  end
else if ending equals away
  say in the middle outside the door
  draw a line
  story:

    The door closes behind you.
    Being alive is enough for today.
    The tower will still be there tomorrow.

  end
else
  say in the middle this far
  draw a line
  story:

    The light goes out of the room.
    The tower has swallowed one more story.
    Someone after you may get further.

  end
end

draw a line
show heroName · heroKind · step rank · up to floor floorNumber
draw a line`,
    },
    {
      id: 'rpg-deep',
      label: 'The ultimate turn-based RPG',
      group: 'rpg',
      answers: ['Ada', 'knight', 'normal', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run', 'run'],
      expect: 'The Sunken Keep',
      source: `# ════════════════════════════════════════════════════════════════════
# The Sunken Keep — a turn-based role-playing game
#
# ── READ THIS FIRST ─────────────────────────────────────────────────
# Every line that starts with a # does NOTHING AT ALL. The computer
# skips it. These lines are notes left for a person to read. Delete
# every one of them and the game runs exactly the same.
#
# The whole game is sentence syntax. Not one line of Python. One
# sentence is one line, and each line becomes one line of Python —
# open the Python tab and you can read the two side by side.
#
# ── HOW TO MAKE IT YOURS ────────────────────────────────────────────
# Everything worth changing first is under THE DIALS, just below.
# Change a number, press Run, see what happened. Nothing here can
# break anything.
#
# After that: rename the rooms, write your own story, add a fifth kind
# of hero, put a sixth floor in. This is a starting point, not a
# finished thing.
#
# Apache-2.0
# ════════════════════════════════════════════════════════════════════


# ── THE DIALS ───────────────────────────────────────────────────────
# Every one of these is safe to change. Try it.

set floorsToClear to 4          # floors before the Keeper is waiting
set flaskHeal to 14             # life one flask gives back
set etherGain to 8              # spark one ether gives back
set bombHit to 16               # how hard a bomb hits
set flaskPrice to 9             # what the merchant charges for one
set etherPrice to 11
set bombPrice to 13
set forgePrice to 18            # what sharpening a blade costs
set critChance to 12            # in a hundred, how often a blow doubles
set fleeChance to 60            # in a hundred, how often running works
set venomBite to 2              # life the venom takes each turn
set markFull to █               # the character a life bar is drawn with
set markEmpty to ░              # and the character for what is gone
set lifePerMark to 4            # life one mark on the bar is worth
set barMax to 20                # how long a full bar is. The job below
                                # reads this, and a job can only read a
                                # name that already exists above it.


# ── THE THREE JOBS ──────────────────────────────────────────────────
# A named job is a piece of program you can run again by name. A job
# can READ the names outside it, but it cannot change them — so all
# three of these only draw. That is why the bar width is put in
# barMax on the line before the job is run.

to header someone:
  clear the screen
  draw a line
  say in the middle someone
  draw a line
end

to sign someone:
  draw a line
  say in the middle someone
  draw a line
end

to lifebar amount:
  set barLeft to amount
  set barText to markFull repeated 0 times
  while barLeft is greater than 0
    add markFull to barText
    subtract lifePerMark from barLeft
  end
  set barLeft to barMax
  subtract amount from barLeft
  while barLeft is greater than 0
    add markEmpty to barText
    subtract lifePerMark from barLeft
  end
  show barText
end


# ── THE OPENING ─────────────────────────────────────────────────────

clear the screen
draw a line
say in the middle The Sunken Keep
say in the middle a turn-based role-playing game
draw a line

story:

  The sea took the keep in one night and never gave it back.
  Everything below the first floor belongs to the water now.
  You have a lamp, a bag, and no very good reason to be here.

end

ask heroName What shall we call you?
if heroName is missing
  set heroName to Wanderer
end

draw a line
show A knight takes a hit and keeps standing.
show A mage hits hardest and has the least life to spare.
show A thief is hard to catch and strikes twice.
show A ranger leaves a wound that keeps working.
ask heroClass knight, mage, thief or ranger — which will you be?

# Four kinds of hero, and one block that sets all of them up. Copy any
# one of these branches to invent a fifth.
if heroClass equals mage
  set heroKind to mage
  set heroMax to 32
  set heroHit to 5
  set heroGuard to 2
  set heroSparkMax to 18
  set heroSpeed to 14
  set skillName to blue fire
  set skillCost to 3
else if heroClass equals thief
  set heroKind to thief
  set heroMax to 30
  set heroHit to 5
  set heroGuard to 2
  set heroSparkMax to 8
  set heroSpeed to 30
  set skillName to twin blades
  set skillCost to 3
else if heroClass equals ranger
  set heroKind to ranger
  set heroMax to 32
  set heroHit to 5
  set heroGuard to 2
  set heroSparkMax to 10
  set heroSpeed to 20
  set skillName to the long shot
  set skillCost to 3
else
  set heroKind to knight
  set heroMax to 34
  set heroHit to 6
  set heroGuard to 4
  set heroSparkMax to 6
  set heroSpeed to 8
  set skillName to the shield wall
  set skillCost to 2
end

draw a line
show On easy every enemy has less life. On hard they have more.
ask hardness easy, normal or hard?

if hardness equals easy
  set foeExtra to 0
  set foeBite to 0
else if hardness equals hard
  set foeExtra to 6
  set foeBite to 2
else
  set foeExtra to 3
  set foeBite to 0
end

set heroLife to heroMax
set heroSpark to heroSparkMax
set heroLevel to 1
set heroXp to 0
set heroNext to 14
set heroFlask to 3
set heroEther to 2
set heroBomb to 1
set heroPurse to 12
set heroWeapon to a plain blade
set heroArmour to a leather coat
set heroVenom to 0
set floorNumber to 1
set deepestFloor to 1
set roundCount to 0
set endingKind to walking
set logBook to an empty record

draw a line
show heroName · heroKind · going down.
show Your skill is skillName · it costs skillCost spark.
wait 1 second


# ── THE KEEP ────────────────────────────────────────────────────────
# One turn round this loop is one floor. It ends when endingKind stops
# being walking.

repeat forever

  set banner to the sunken keep
  do header with banner

  # What is on this floor. Every branch sets the same eight names, so
  # a new floor is a copy of one of these with different numbers.
  if floorNumber is greater than floorsToClear
    set foeName to the Keeper of the Keep
    set foeMax to 48
    set foeHit to 11
    set foeSpeed to 16
    set foeGold to 60
    set foeXp to 40
    set foeStings to true
  else if floorNumber equals 4
    set roomFoes to list of a drowned knight, a black eel, a stone warden
    set pickOne to random number from 1 to 3
    set foeName to item pickOne of roomFoes
    set foeMax to 30
    set foeHit to 8
    set foeSpeed to 14
    set foeGold to 20
    set foeXp to 18
    set foeStings to false
  else if floorNumber equals 3
    set roomFoes to list of a pale crab, a reef spider, a lantern wisp
    set pickOne to random number from 1 to 3
    set foeName to item pickOne of roomFoes
    set foeMax to 25
    set foeHit to 7
    set foeSpeed to 18
    set foeGold to 15
    set foeXp to 13
    set foeStings to true
  else if floorNumber equals 2
    set roomFoes to list of a salt hound, a torn sail, a drowned rat
    set pickOne to random number from 1 to 3
    set foeName to item pickOne of roomFoes
    set foeMax to 20
    set foeHit to 6
    set foeSpeed to 12
    set foeGold to 11
    set foeXp to 9
    set foeStings to false
  else
    set roomFoes to list of a green slime, a cave bat, a small crab
    set pickOne to random number from 1 to 3
    set foeName to item pickOne of roomFoes
    set foeMax to 15
    set foeHit to 4
    set foeSpeed to 9
    set foeGold to 7
    set foeXp to 6
    set foeStings to false
  end

  add foeExtra to foeMax
  add foeBite to foeHit
  set foeLife to foeMax
  set foeVenom to 0

  show Floor floorNumber
  show foeName is in the way.

  # Twenty times in a hundred, what is in front of you is worse than it
  # should be. Change the 20 and the whole keep changes with it.
  set foeIsElder to false
  20% chance
    set foeIsElder to true
  end
  if foeIsElder exists
    add 8 to foeMax
    add 2 to foeHit
    add 9 to foeGold
    add 6 to foeXp
    set foeLife to foeMax
    show It is bigger than the others were.
  end

  wait 1 second


  # ── ONE FIGHT ─────────────────────────────────────────────────────
  # One turn round this loop is one exchange of blows.

  repeat forever

    add 1 to roundCount

    draw a line
    show foeName foeLife / foeMax
    set barMax to foeMax
    do lifebar with foeLife
    show heroName heroLife / heroMax · spark heroSpark / heroSparkMax
    set barMax to heroMax
    do lifebar with heroLife
    show flasks heroFlask · ethers heroEther · bombs heroBomb · coins heroPurse
    show Your skill is skillName.
    ask move strike · skill · flask · ether · bomb · guard · run

    set guarding to false

    if move equals skill

      if heroSpark is less than skillCost
        show There is not enough spark left for that.
      else
        subtract skillCost from heroSpark
        if heroKind equals mage
          set dealt to random number from 10 to 16
          add heroLevel to dealt
          add heroHit to dealt
          subtract dealt from foeLife
          show Blue fire takes dealt off it.
        else if heroKind equals thief
          set dealt to random number from 3 to 6
          add heroHit to dealt
          subtract dealt from foeLife
          show The first blade lands for dealt.
          set dealt to random number from 3 to 6
          add heroHit to dealt
          subtract dealt from foeLife
          show The second one lands for dealt.
        else if heroKind equals ranger
          set dealt to random number from 5 to 9
          add heroHit to dealt
          subtract dealt from foeLife
          set foeVenom to 3
          show The arrow goes deep for dealt and stays in.
        else
          set dealt to random number from 3 to 7
          add heroGuard to dealt
          subtract dealt from foeLife
          add 6 to heroLife
          if heroLife is greater than heroMax
            set heroLife to heroMax
          end
          show The shield takes dealt and you steady yourself.
        end
      end

    else if move equals flask

      if heroFlask is greater than 0
        subtract 1 from heroFlask
        add flaskHeal to heroLife
        if heroLife is greater than heroMax
          set heroLife to heroMax
        end
        set heroVenom to 0
        show You drink one down and the cold goes out of you.
      else
        show There is not one bottle left.
      end

    else if move equals ether

      if heroEther is greater than 0
        subtract 1 from heroEther
        add etherGain to heroSpark
        if heroSpark is greater than heroSparkMax
          set heroSpark to heroSparkMax
        end
        show The spark comes back.
      else
        show No ether left.
      end

    else if move equals bomb

      if heroBomb is greater than 0
        subtract 1 from heroBomb
        set dealt to bombHit
        subtract dealt from foeLife
        show The bomb goes off for dealt.
      else
        show No bombs left.
      end

    else if move equals guard

      set guarding to true
      add 2 to heroSpark
      if heroSpark is greater than heroSparkMax
        set heroSpark to heroSparkMax
      end
      show You set your feet and wait for it.

    else if move equals run

      if floorNumber is greater than floorsToClear
        show The way behind you is water now. There is no running.
      else
        set roll to random number from 1 to 100
        set gotAway to false
        if roll is less than fleeChance
          set gotAway to true
        end
        if gotAway exists
          show You go back up the stairs two at a time.
          set endingKind to away
          break
        else
          show It is between you and the stairs before you have moved.
        end
      end

    else

      # Anything that is not one of the words above is a plain strike.
      set dealt to random number from 3 to 8
      add heroHit to dealt
      set roll to random number from 1 to 100
      if roll is less than critChance
        multiply dealt by 2
        show Straight through the gap.
      end
      subtract dealt from foeLife
      show Your blow lands for dealt.

    end

    # A wound the ranger left keeps working on its own.
    if foeVenom is greater than 0
      subtract 1 from foeVenom
      subtract 3 from foeLife
      show It is still bleeding — 3 more.
    end

    if foeLife is less than 1
      draw a line
      show foeName is finished.
      break
    end


    # ── the enemy answers ───────────────────────────────────────────

    set taken to random number from 2 to 6
    add foeHit to taken
    subtract heroGuard from taken
    if guarding exists
      subtract heroGuard from taken
      subtract 2 from taken
    end

    # Being quick is being somewhere else when it arrives.
    set roll to random number from 1 to 100
    set dodged to false
    if roll is less than heroSpeed
      set dodged to true
    end

    if dodged exists
      show It comes for you and finds nobody there.
    else
      if taken is less than 1
        set taken to 1
      end
      subtract taken from heroLife
      show foeName answers for taken.
      if foeStings exists
        35% chance
          set heroVenom to 3
          show Something in that is going to keep hurting.
        end
      end
    end

    if heroVenom is greater than 0
      subtract 1 from heroVenom
      subtract venomBite from heroLife
      show The venom takes venomBite more.
    end

    if heroLife is less than 1
      draw a line
      set endingKind to fallen
      break
    end

  end

  if endingKind is not equal to walking
    break
  end


  # ── AFTER THE FIGHT ───────────────────────────────────────────────

  add foeGold to heroPurse
  add foeXp to heroXp
  show You take foeGold coins and learn foeXp from it.

  # A record keeps one value under each name. This one counts what you
  # have put down, and the ending reads it back out.
  if logBook contains foeName
    set seenBefore to foeName in logBook
    add 1 to seenBefore
    put foeName at seenBefore in logBook
  else
    put foeName at 1 in logBook
  end

  while heroXp is greater than heroNext
    subtract heroNext from heroXp
    add 1 to heroLevel
    add 4 to heroNext
    add 1 to heroGuard
    draw a line
    show heroName is level heroLevel now.
    ask raised Raise which — life, attack or spark?
    if raised equals attack
      add 3 to heroHit
      show Your arm is heavier than it was.
    else if raised equals spark
      add 4 to heroSparkMax
      set heroSpark to heroSparkMax
      show The spark runs deeper.
    else
      add 8 to heroMax
      show You can take more than you could.
    end
    set heroLife to heroMax
    draw a line
  end

  if floorNumber is greater than floorsToClear
    set endingKind to crowned
    break
  end

  # A floor cleared is worth a little of your life back.
  add 5 to heroLife
  add 2 to heroSpark
  if heroLife is greater than heroMax
    set heroLife to heroMax
  end
  if heroSpark is greater than heroSparkMax
    set heroSpark to heroSparkMax
  end

  add 1 to floorNumber
  set deepestFloor to floorNumber


  # ── BETWEEN FLOORS ────────────────────────────────────────────────
  # One of four things is waiting on the stairs. Add a fifth by making
  # this a number from 1 to 5 and writing one more branch.

  set banner to the stairs down
  do sign with banner

  set roll to random number from 1 to 4

  if roll equals 1

    show A merchant has set up on the landing. Nobody asks why.
    show flask flaskPrice · ether etherPrice · bomb bombPrice · sharpen forgePrice
    show You have heroPurse coins.
    ask bought flask, ether, bomb, sharpen or nothing?

    if bought equals flask
      if heroPurse is greater than flaskPrice
        subtract flaskPrice from heroPurse
        add 1 to heroFlask
        show One bottle into the bag.
      else
        show Not enough for that.
      end
    else if bought equals ether
      if heroPurse is greater than etherPrice
        subtract etherPrice from heroPurse
        add 1 to heroEther
        show One ether into the bag.
      else
        show Not enough for that.
      end
    else if bought equals bomb
      if heroPurse is greater than bombPrice
        subtract bombPrice from heroPurse
        add 1 to heroBomb
        show One bomb into the bag. Carefully.
      else
        show Not enough for that.
      end
    else if bought equals sharpen
      if heroPurse is greater than forgePrice
        subtract forgePrice from heroPurse
        add 2 to heroHit
        set heroWeapon to a sharpened blade
        show The merchant works on it a while and hands it back.
      else
        show Not enough for that.
      end
    else
      show The merchant goes back to counting something.
    end

  else if roll equals 2

    show There is a dry shrine down here, and there should not be.
    ask prayed Rest a while — yes or no?
    if prayed equals yes
      add 12 to heroLife
      add 4 to heroSpark
      if heroLife is greater than heroMax
        set heroLife to heroMax
      end
      if heroSpark is greater than heroSparkMax
        set heroSpark to heroSparkMax
      end
      set heroVenom to 0
      show You sit down for a while. It helps more than it should.
    else
      show You leave it alone.
    end

  else if roll equals 3

    set found to random number from 8 to 22
    add found to heroPurse
    show Something is caught under the step — found coins.
    30% chance
      add 1 to heroFlask
      show And one bottle, still sealed.
    end

  else

    show The step gives way under you.
    set taken to random number from 3 to 8
    subtract heroGuard from taken
    if taken is less than 1
      set taken to 1
    end
    subtract taken from heroLife
    show That costs taken.
    if heroLife is less than 1
      set endingKind to fallen
      break
    end

  end

  wait 1 second

end


# ── THE ENDING ──────────────────────────────────────────────────────

clear the screen
draw a line

if endingKind equals crowned
  say in the middle the floor of the keep
  draw a line
  story:

    The water stops at your knees and goes no deeper.
    Whatever the Keeper was keeping is yours now.
    Nobody above is going to believe a word of it.

  end
else if endingKind equals away
  say in the middle the way out
  draw a line
  story:

    The stairs come out into ordinary evening air.
    You are wet through and still counting your fingers.
    The keep will be down there tomorrow as well.

  end
else
  say in the middle this far and no further
  draw a line
  story:

    The lamp goes out first, and then everything else does.
    The keep keeps what it takes.
    Somebody after you may get one floor further.

  end
end

draw a line
show heroName · heroKind · level heroLevel
show weapon heroWeapon · armour heroArmour
show deepest floor deepestFloor · rounds fought roundCount · coins heroPurse
draw a line
show Put down on the way
for each beast in logBook
  set howOften to beast in logBook
  show beast howOften
end
draw a line`,
    },
    {
      id: 'baseball',
      label: 'Number baseball',
      group: 'game',
      answers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '1', '2', '3', '4', '5', '6', '7', '8', '9', '1', '2', '3', '4', '5', '6'],
      expect: 'Number baseball',
      source: `# Number baseball. The computer thinks of three digits and you have to
# find them. A strike is a right digit in the right place; a ball is a
# right digit in the wrong place.
#
# Lines that start with # do nothing at all — they are notes for you.

set secretA to random number from 1 to 9
set secretB to random number from 1 to 9
set secretC to random number from 1 to 9
set turnsLeft to 8

clear the screen
draw a line
say in the middle Number baseball
draw a line
show Three digits, each from 1 to 9. They may repeat.
show A strike is right and in place. A ball is right, out of place.

repeat forever

  draw a line
  show Turns to go — turnsLeft
  ask number guessA First digit
  ask number guessB Second digit
  ask number guessC Third digit

  set strikes to 0
  set balls to 0

  # Each digit is checked in its own place first, then in the other two.
  if guessA equals secretA
    add 1 to strikes
  else if guessA equals secretB
    add 1 to balls
  else if guessA equals secretC
    add 1 to balls
  end

  if guessB equals secretB
    add 1 to strikes
  else if guessB equals secretA
    add 1 to balls
  else if guessB equals secretC
    add 1 to balls
  end

  if guessC equals secretC
    add 1 to strikes
  else if guessC equals secretA
    add 1 to balls
  else if guessC equals secretB
    add 1 to balls
  end

  show strikes strikes · balls balls

  if strikes equals 3
    draw a line
    show You have all three.
    break
  end

  subtract 1 from turnsLeft
  if turnsLeft is less than 1
    draw a line
    show No turns left. It was secretA secretB secretC
    break
  end

end`,
    },
    {
      id: 'wordguess',
      label: 'Guess the word',
      group: 'game',
      answers: ['piano', 'piano', 'piano'],
      expect: 'Guess the word',
      source: `# Guess the word. The computer picks one and gives you the hint that
# goes with it. Three tries.
#
# The two lists line up: word 1 goes with hint 1, and so on. Add a
# fifth word and a fifth hint and the game gets bigger.

set words to list of piano, harbour, penguin, umbrella
set clues to list of it has black keys, boats sleep here, a bird that swims, it opens when it rains

set pickOne to random number from 1 to 4
set secret to item pickOne of words
set clue to item pickOne of clues
set triesLeft to 3

clear the screen
draw a line
say in the middle Guess the word
draw a line
show Here is the hint.
show clue
draw a line

repeat forever

  ask guess What is the word?

  if guess equals secret
    draw a line
    show That is the one.
    break
  end

  subtract 1 from triesLeft

  if triesLeft is less than 1
    draw a line
    show It was secret
    break
  end

  show Not that one. Tries to go — triesLeft

end`,
    },
    {
      id: 'memory',
      label: 'How long a row can you hold?',
      group: 'game',
      answers: ['red', 'green', 'blue', 'gold'],
      expect: 'How long a row can you hold?',
      source: `# A memory game. The row of colours gets one longer every round. Look
# at it, and when the screen clears, type it back with spaces between.
#
# It ends the moment you get one wrong, and tells you how far you got.

set colours to list of red, green, blue, gold
set shown to list of
set turn to 0

clear the screen
draw a line
say in the middle How long a row can you hold?
draw a line
show The four are red, green, blue and gold.
wait 2 seconds

repeat forever

  add 1 to turn
  set pickOne to random number from 1 to 4
  set nextOne to item pickOne of colours
  append nextOne to shown

  clear the screen
  draw a line
  show Round turn
  show shown joined by space
  draw a line
  wait 3 seconds

  clear the screen
  ask reply Type the row back, with spaces
  set said to reply split by space

  if said equals shown
    show Right.
    wait 1 second
  else
    draw a line
    show Not quite. The row was:
    show shown joined by space
    show You held turn of them.
    break
  end

end`,
    },
    {
      id: 'shop',
      label: 'The corner shop',
      group: 'big',
      answers: ['bread', 'cheese', 'done'],
      expect: 'The corner shop',
      source: `# A small shop. The prices live in a record — one number under each
# name — and the basket is a list. Buy things until you say done.
#
# Add a line to the record and a name to the list and the shop sells
# one more thing. Nothing else has to change.

set prices to an empty record
put bread at 3 in prices
put cheese at 7 in prices
put apples at 2 in prices
put coffee at 5 in prices

set goods to list of bread, cheese, apples, coffee
set basket to list of
set spent to 0
set purse to 20

clear the screen
draw a line
say in the middle The corner shop
draw a line

repeat forever

  show You have purse left.
  show On the shelf:
  for each thing in goods with place
    set cost to thing in prices
    show place · thing · cost
  end

  ask wanted What are you buying? Say done to stop.

  if wanted equals done
    break
  end

  if goods contains wanted
    set cost to wanted in prices
    if cost is greater than purse
      show Not enough for that.
    else
      subtract cost from purse
      add cost to spent
      append wanted to basket
      show Into the basket — wanted · cost off the purse.
    end
  else
    show We do not have that.
  end

  draw a line

end

draw a line
show In the basket:
for each thing in basket
  show thing
end
draw a line
show how many basket things · spent spent · purse left`,
    },
    {
      id: 'gradebook',
      label: 'The score sheet',
      group: 'big',
      answers: [],
      expect: 'The score sheet',
      source: `# A score sheet. Two lists that line up: name 1 goes with score 1.
#
# The average is worked out by taking the number of people off the
# total again and again and counting how many times that fits. That is
# what dividing is, underneath.

set names to list of Mina, Ada, Bo, Ravi, Sunny
set scores to list of 88, 95, 61, 74, 95

clear the screen
draw a line
say in the middle The score sheet
draw a line

for each person in names with place
  set mark to item place of scores
  show place · person · mark
end

draw a line
set howMany to how many names
set pot to the total of scores
set topMark to the biggest of scores
set lowMark to the smallest of scores
show howMany people · pot marks altogether
show highest topMark · lowest lowMark

# The average, worked out by taking the number of people off the total
# again and again and counting how many times that fits. That is what
# dividing is, underneath.
set average to 0
set left to pot
while left is greater than howMany
  subtract howMany from left
  add 1 to average
end
show the average is average

draw a line
set ranked to list of
for each mark in scores
  append mark to ranked
end
sort ranked
reverse ranked
show highest first
show ranked joined by space`,
    },
    {
      id: 'peace',
      label: 'Peace — the big one',
      group: 'rpg',
      answers: ['load', 'x'],
      expect: 'Thirteen classes · six difficulties · a one-line save code',
      fixed: true,
      source: `# ════════════════════════════════════════════════════════════════════
# Peace
# A large turn-based role-playing game about felling the Demon Lord and winning the world back
#
# This file is written with nothing but the newest English sentence syntax of NeedMoreEasy 0.7.1.
# Not one line of Python syntax, and not one Korean command.
#
# ── If this is your first time changing a game ─────────────────────
# A line that starts with # is a note the computer never reads.
# Delete every one of them and the game still runs exactly the same.
#
# Start with the numbers under "Dials you can turn" below.
# Enemy life, how much a potion heals, shop prices — the values worth changing often.
# After that, change the names and numbers under "Regions and enemies".
# One enemy is a name, life, hit, guard, speed, reward and trait.
# Copy one branch of the same shape and you have a new region.
#
# ── What is in the game ────────────────────────────────────────────
# Thirteen classes, each with its own skill and its own ultimate
# Twelve regions, a hidden thirteenth, and thirteen enemies that each fight differently
# Eleven characters with a history and a choice of their own, and standing with four powers
# Life and spirit, critical hits, dodging, guarding, burn, bleed and poison
# Nine consumables, weapons, armour and charms, wear and repair, experience and levelling
# A Demon Lord fight in three phases, and an ending that follows what you chose
# Kingdom money where 100 bronze is 10 silver and 10 silver is 1 gold
# Enemy intent shown a turn ahead, and the tactics that answer it
# Elemental weakness, poise breaks, stuns, an ultimate for every class
# Help from the allies you recruit, seven materials and ten camp recipes
# A regional economy moved by demand, stock, the war and your standing, with buying and selling
# A quest log, an achievement list, a bestiary, and a hidden boss you have to earn
# Saving and loading through a save code one line long
#
# ── How to run it ──────────────────────────────────────────────────
# Paste the whole file into the English page at needmoreeasy.com and run it.
# If you installed it on your computer, type nme r peace.nme
# ════════════════════════════════════════════════════════════════════


# ── Dials you can turn ─────────────────────────────────────────────
# Change only the values here and the whole game feels different.

set lastRegion to 13             # the thirteenth is hidden until you earn it
set potionHeal to 30             # life one potion gives back
set strongPotionHeal to 65
set tonicRestore to 12             # spirit one tonic gives back
set bombPower to 24               # a bomb ignores the enemy's guard
set potionBasePrice to 25           # the real price adds the war and the stock to the base
set strongPotionBasePrice to 58
set tonicBasePrice to 40
set antidoteBasePrice to 22
set bombBasePrice to 70
set holyWaterBasePrice to 55
set smokeBasePrice to 38
set whetstoneBasePrice to 32
set rationBasePrice to 18
# The three names below are the first region's prices; the shop works them out again from the economy.
set potionPrice to potionBasePrice
set tonicPrice to tonicBasePrice
set bombPrice to bombBasePrice
set weaponBoostPrice to 120
set armourBoostPrice to 120
set repairBasePrice to 20
set critChance to 14               # critical hits out of a hundred swings
set baseFleeChance to 65
set poisonDamage to 3
set burnDamage to 4
set bleedDamage to 3
set fullCell to ■
set emptyCell to ·
set lifePerCell to 5
set barWidth to 20
set shortWait to 1
set ultimateFull to 100
set allyHelpChance to 35
set maxDodgeChance to 45
set weakMultiplier to 2
set potionHerbCost to 2
set bombOreCost to 2
set bombDustCost to 1
set runeOreCost to 2
set runeDustCost to 2
set marketMaxStock to 7

# Set quickTest to true and you start far stronger than usual.
# It is the dial for reaching the end quickly after adding an enemy or a scene.
set quickTest to false


# ── Jobs that draw the screen ──────────────────────────────────────
# A "job" is several sentences gathered under one name.
# The jobs below only take values and draw, so they are safe to call anywhere.

# A largest value read inside a job has to exist beforehand to count as a number.
set barMaxAmount to 1

to drawBigTitle titleWords:
  clear the screen
  draw a line
  say in the middle titleWords
  draw a line
end

to drawSmallTitle titleWords:
  draw a line
  say in the middle titleWords
  draw a line
end

to drawLifeBar fillAmount:
  # However far life climbs, the bar is always twenty cells.
  # Instead of dividing, both sides are multiplied so whole numbers alone compare the ratio.
  set barText to fullCell repeated 0 times
  set barStep to 0
  repeat 20 times
    add 1 to barStep
    set nowValue to fillAmount
    multiply nowValue by 20
    set topValue to barMaxAmount
    multiply topValue by barStep
    if nowValue is greater than or equal to topValue
      add fullCell to barText
    else
      add emptyCell to barText
    end
  end
  show barText
end

# In the kingdom 100 bronze is 10 silver, and 10 silver is 1 gold.
# The game keeps bronze, which is easy to add up, and splits it three ways to show it.
# To change the rates, change the 100 and the 10 in the two loops below together.
to showMoney coinHeld:
  set shownGold to 0
  set shownSilver to 0
  set shownBronze to coinHeld
  while shownBronze is greater than 99
    subtract 100 from shownBronze
    add 1 to shownGold
  end
  while shownBronze is greater than 9
    subtract 10 from shownBronze
    add 1 to shownSilver
  end
  show gold shownGold · silver shownSilver · bronze shownBronze
end


# ── Writing a save code and reading it back ────────────────────────
# The digits 0 to 9 become the ten letters A to J.
# No file is written at all, so it works the same in the browser and installed.
# A saved value is only letters, and loading turns those letters back into a number.

set saveCells to an empty list
set restoredNumbers to an empty list
set blankRow to A

to putCodeCell saveValue:
  set codeSigns to an empty list
  set codeLeft to saveValue
  if codeLeft equals 0
    append A to codeSigns
  end
  while codeLeft is greater than 0
    set codeQuotient to 0
    set codeRest to codeLeft
    while codeRest is greater than 9
      subtract 10 from codeRest
      add 1 to codeQuotient
    end
    if codeRest equals 0
      append A to codeSigns
    else if codeRest equals 1
      append B to codeSigns
    else if codeRest equals 2
      append C to codeSigns
    else if codeRest equals 3
      append D to codeSigns
    else if codeRest equals 4
      append E to codeSigns
    else if codeRest equals 5
      append F to codeSigns
    else if codeRest equals 6
      append G to codeSigns
    else if codeRest equals 7
      append H to codeSigns
    else if codeRest equals 8
      append I to codeSigns
    else
      append J to codeSigns
    end
    set codeLeft to codeQuotient
  end
  reverse codeSigns
  set finishedCode to blankRow repeated 0 times
  for each codeSign in codeSigns
    add codeSign to finishedCode
  end
  append finishedCode to saveCells
end

to readCodeNumber codeText:
  set readCodeValue to 0
  for each codeLetter in codeText
    set codeDigits to 0
    subtract 1 from codeDigits
    if codeLetter equals A
      set codeDigits to 0
    else if codeLetter equals B
      set codeDigits to 1
    else if codeLetter equals C
      set codeDigits to 2
    else if codeLetter equals D
      set codeDigits to 3
    else if codeLetter equals E
      set codeDigits to 4
    else if codeLetter equals F
      set codeDigits to 5
    else if codeLetter equals G
      set codeDigits to 6
    else if codeLetter equals H
      set codeDigits to 7
    else if codeLetter equals I
      set codeDigits to 8
    else if codeLetter equals J
      set codeDigits to 9
    end
    if codeDigits is greater than or equal to 0
      multiply readCodeValue by 10
      add codeDigits to readCodeValue
    end
  end
  append readCodeValue to restoredNumbers
end


# ── The opening screen: a new adventure or a saved one ─────────────

start the timer
set titleBoard to Peace
do drawBigTitle with titleBoard
say in the middle Fell the Demon Lord and save the kingdom of Arteria
say in the middle Thirteen classes · six difficulties · a one-line save code
draw a line

set openingOptions to list of new, load
set openingSettled to 0
while openingSettled is less than 1
  ask firstChoice Would you like a new game or to load one? Type new or load
  if openingOptions contains firstChoice
    set openingSettled to 1
  else
    show 🟦 Please type new or load exactly.
  end
end
set newAdventure to true
if firstChoice equals load
  set newAdventure to false
end

set heroName to the hero who remembers
set classChoice to knight
set difficultyChoice to normal
set pacingNumber to 1
set screenNumber to 1

if newAdventure exists
  set pacingOptions to list of at once, slowly, very slowly
  set pacingSettled to 0
  while pacingSettled is less than 1
    ask pacingChoice How fast should the words appear? at once, slowly, very slowly
    if pacingOptions contains pacingChoice
      set pacingSettled to 1
    else
      show 🟦 Please type one of the three speeds again.
    end
  end
  if pacingChoice equals slowly
    set pacingNumber to 2
  else if pacingChoice equals very slowly
    set pacingNumber to 3
  end
  set screenOptions to list of full, plain
  set screenSettled to 0
  while screenSettled is less than 1
    ask screenChoice How should the screen look? full, plain
    if screenOptions contains screenChoice
      set screenSettled to 1
    else
      show 🟦 Please type full or plain.
    end
  end
  if screenChoice equals plain
    set screenNumber to 2
  end

  if pacingNumber equals 2
    say slowly The kingdom of Arteria was built on an old promise between humans, elves and dwarves.
    say slowly Then the Demon Lord Morgar woke in the black mountains of the north and took the twelve domains one by one.
    say slowly As the war dragged on the mines stopped, the grain carts stopped, and the same loaf cost a different price in every castle.
    say slowly The king fell defending the capital, and Princess Elenoa, who lived, keeps the last holy flame.
    say slowly This war will not end with one sword. Real peace comes only when people, goods and promises are joined again.
  else if pacingNumber equals 3
    say very slowly The kingdom of Arteria was built on an old promise between humans, elves and dwarves.
    say very slowly Then the Demon Lord Morgar woke in the black mountains of the north and took the twelve domains one by one.
    say very slowly As the war dragged on the mines stopped, the grain carts stopped, and the same loaf cost a different price in every castle.
    say very slowly The king fell defending the capital, and Princess Elenoa, who lived, keeps the last holy flame.
    say very slowly This war will not end with one sword. Real peace comes only when people, goods and promises are joined again.
  else
    story:

      The kingdom of Arteria was built on an old promise between humans, elves and dwarves.
      Then the Demon Lord Morgar woke in the black mountains of the north and took the twelve domains one by one.
      As the war dragged on the mines stopped, the grain carts stopped, and the same loaf cost a different price in every castle.
      The king fell defending the capital, and Princess Elenoa, who lived, keeps the last holy flame.
      This war will not end with one sword. Real peace comes only when people, goods and promises are joined again.

    end
  end
  set nameSettled to 0
  while nameSettled is less than 1
    ask heroName What shall we call the adventurer who marches on the Demon Lord?
    if heroName missing
      set heroName to the nameless hero
      set nameSettled to 1
    else
      set nameCheckPieces to heroName split by comma
      if how many nameCheckPieces equals 1
        set nameSettled to 1
      else
        show 🟦 A comma would clash with the save code, so a name cannot hold one. Please type it again.
      end
    end
  end

  # A class changes not only the numbers but the skill, the ultimate and how the fight goes.
  set titleBoard to Thirteen classes
  do drawSmallTitle with titleBoard
  show knight · guards, and shields an ally · impact
  show mage · burns and wide damage · flame
  show archer · repeat shots and bleeding · pierce
  show cleric · healing and cleansing · holy
  show rogue · high dodge and poisoning · poison
  show berserker · hits harder the more life is lost · impact
  show runesmith · repairs gear and breaks armour · impact
  show bard · songs that lift the heart and shake enemy poise · sound
  show druid · regrowth and binding vines · nature
  show warlock · drains life on a dangerous bargain · dark
  show dragoon · a dragonfire lance that pierces guard · dragonfire
  show chronomancer · quick moves and delayed turns · time
  show gambler · open odds and cover against failure · fate
  set classOptions to list of knight, mage, archer, cleric, rogue, berserker, runesmith, bard, druid, warlock, dragoon, chronomancer, gambler
  set classSettled to 0
  while classSettled is less than 1
    ask classChoice Please type the name of the class you want, exactly
    if classOptions contains classChoice
      set classSettled to 1
    else
      show 🟦 That class is not on the list. Please type it again in lowercase.
    end
  end

  set titleBoard to Six difficulties
  do drawSmallTitle with titleBoard
  show very easy is the one for reading the story in comfort.
  show easy is the one for anybody new to fighting.
  show normal is the balance the economy and the fights were built around.
  show hard asks you to stock up and to answer enemy intent.
  show very hard is won by planning your gear and your crafting.
  show impossible is the far end, for somebody who knows every system.
  set difficultyOptions to list of very easy, easy, normal, hard, very hard, impossible
  set difficultySettled to 0
  while difficultySettled is less than 1
    ask difficultyChoice Choose one of very easy, easy, normal, hard, very hard, impossible
    if difficultyOptions contains difficultyChoice
      set difficultySettled to 1
    else
      show 🟦 That difficulty is not on the list. Please type the name as it appears.
    end
  end
end


# ── The starting numbers for the thirteen classes ──────────────────

if classChoice equals mage
  set classNumber to 2
  set className to mage
  set maxLife to 48
  set heroHit to 9
  set heroGuard to 3
  set maxSpirit to 28
  set heroSpeed to 13
  set skillName to fireball
  set skillCost to 6
  set skillElement to flame
  set ultimateName to greater firestorm
  set classTrait to magic and burning
else if classChoice equals archer
  set classNumber to 3
  set className to archer
  set maxLife to 54
  set heroHit to 8
  set heroGuard to 4
  set maxSpirit to 20
  set heroSpeed to 27
  set skillName to rapid shot
  set skillCost to 4
  set skillElement to pierce
  set ultimateName to a thousand arrows
  set classTrait to repeat shots and bleeding
else if classChoice equals cleric
  set classNumber to 4
  set className to cleric
  set maxLife to 60
  set heroHit to 7
  set heroGuard to 6
  set maxSpirit to 24
  set heroSpeed to 15
  set skillName to holy light
  set skillCost to 5
  set skillElement to holy
  set ultimateName to the judgement of the goddess
  set classTrait to healing and cleansing
else if classChoice equals rogue
  set classNumber to 5
  set className to rogue
  set maxLife to 50
  set heroHit to 8
  set heroGuard to 4
  set maxSpirit to 22
  set heroSpeed to 32
  set skillName to venom dagger
  set skillCost to 4
  set skillElement to poison
  set ultimateName to shadow execution
  set classTrait to dodging and poisoning
else if classChoice equals berserker
  set classNumber to 6
  set className to berserker
  set maxLife to 78
  set heroHit to 10
  set heroGuard to 3
  set maxSpirit to 16
  set heroSpeed to 12
  set skillName to frenzy axe
  set skillCost to 4
  set skillElement to impact
  set ultimateName to the fury of Ragna
  set classTrait to lost life and fury
else if classChoice equals runesmith
  set classNumber to 7
  set className to runesmith
  set maxLife to 70
  set heroHit to 7
  set heroGuard to 8
  set maxSpirit to 20
  set heroSpeed to 8
  set skillName to rune hammer
  set skillCost to 5
  set skillElement to impact
  set ultimateName to the anvil of the earth
  set classTrait to repair and armour breaking
else if classChoice equals bard
  set classNumber to 8
  set className to bard
  set maxLife to 56
  set heroHit to 6
  set heroGuard to 5
  set maxSpirit to 28
  set heroSpeed to 20
  set skillName to shatter note
  set skillCost to 4
  set skillElement to sound
  set ultimateName to the epic of heroes
  set classTrait to heart and poise breaking
else if classChoice equals druid
  set classNumber to 9
  set className to druid
  set maxLife to 62
  set heroHit to 7
  set heroGuard to 5
  set maxSpirit to 30
  set heroSpeed to 17
  set skillName to binding vines
  set skillCost to 5
  set skillElement to nature
  set ultimateName to the wrath of the old forest
  set classTrait to regrowth and binding
else if classChoice equals warlock
  set classNumber to 10
  set className to warlock
  set maxLife to 52
  set heroHit to 9
  set heroGuard to 3
  set maxSpirit to 28
  set heroSpeed to 14
  set skillName to life drain
  set skillCost to 6
  set skillElement to dark
  set ultimateName to the bargain of the abyss
  set classTrait to draining life and bargains
else if classChoice equals dragoon
  set classNumber to 11
  set className to dragoon
  set maxLife to 66
  set heroHit to 9
  set heroGuard to 7
  set maxSpirit to 18
  set heroSpeed to 16
  set skillName to dragonfire lance
  set skillCost to 5
  set skillElement to dragonfire
  set ultimateName to the descent of the red dragon
  set classTrait to piercing and dragonfire
else if classChoice equals chronomancer
  set classNumber to 12
  set className to chronomancer
  set maxLife to 46
  set heroHit to 8
  set heroGuard to 4
  set maxSpirit to 32
  set heroSpeed to 24
  set skillName to time rift
  set skillCost to 6
  set skillElement to time
  set ultimateName to the world held still
  set classTrait to delayed turns and haste
else if classChoice equals gambler
  set classNumber to 13
  set className to gambler
  set maxLife to 54
  set heroHit to 8
  set heroGuard to 5
  set maxSpirit to 24
  set heroSpeed to 18
  set skillName to the dice of fate
  set skillCost to 4
  set skillElement to fate
  set ultimateName to the one who turns the house over
  set classTrait to open odds and cover against failure
else
  set classNumber to 1
  set className to knight
  set maxLife to 68
  set heroHit to 7
  set heroGuard to 9
  set maxSpirit to 18
  set heroSpeed to 9
  set skillName to shield bash
  set skillCost to 4
  set skillElement to impact
  set ultimateName to the guard of the king
  set classTrait to guarding and shielding
end


# ── How the six difficulties bend the fights and the economy ───────

if difficultyChoice equals very easy
  set difficultyNumber to 1
  set difficultyName to very easy
  set enemyLifeBonus to 0
  set enemyHitBonus to 0
  set enemyGuardBonus to 0
  set poiseBonus to 0
  set rewardBonus to 25
  set marketRiskBonus to 0
else if difficultyChoice equals easy
  set difficultyNumber to 2
  set difficultyName to easy
  set enemyLifeBonus to 6
  set enemyHitBonus to 1
  set enemyGuardBonus to 0
  set poiseBonus to 0
  set rewardBonus to 15
  set marketRiskBonus to 1
else if difficultyChoice equals hard
  set difficultyNumber to 4
  set difficultyName to hard
  set enemyLifeBonus to 28
  set enemyHitBonus to 5
  set enemyGuardBonus to 1
  set poiseBonus to 1
  set rewardBonus to 20
  set marketRiskBonus to 4
else if difficultyChoice equals very hard
  set difficultyNumber to 5
  set difficultyName to very hard
  set enemyLifeBonus to 48
  set enemyHitBonus to 8
  set enemyGuardBonus to 2
  set poiseBonus to 2
  set rewardBonus to 45
  set marketRiskBonus to 7
else if difficultyChoice equals impossible
  set difficultyNumber to 6
  set difficultyName to impossible
  set enemyLifeBonus to 78
  set enemyHitBonus to 11
  set enemyGuardBonus to 4
  set poiseBonus to 4
  set rewardBonus to 85
  set marketRiskBonus to 11
else
  set difficultyNumber to 3
  set difficultyName to normal
  set enemyLifeBonus to 12
  set enemyHitBonus to 3
  set enemyGuardBonus to 0
  set poiseBonus to 0
  set rewardBonus to 0
  set marketRiskBonus to 2
end


# ── Every starting value of a new adventure ────────────────────────
# A value the save code restores has to be given its name here first.

set heroLife to maxLife
set heroSpirit to maxSpirit
set heroLevel to 1
set heroExp to 0
set nextExp to 18
set potionCount to 3
set strongPotionCount to 0
set tonicCount to 2
set antidoteCount to 2
set bombCount to 1
set holyWaterCount to 0
set smokeCount to 1
set whetstoneCount to 1
set rationCount to 3
set luckCoinCount to 0
set chaosRolls to 0
set fateSealCount to 0
set fateDrawCount to 0
set fatePityCount to 0
set fateShardCount to 0
set firstDrawDone to false
set gambleWins to 0
set gambleLosses to 0
set bronzeHeld to 110
set weaponNumber to 1
set weaponName to iron longsword
set weaponWear to 40
set weaponMaxWear to 40
set armourNumber to 1
set armourName to chain armour
set armourWear to 50
set armourMaxWear to 50
set charmNumber to 0
set charmName to a worn peace charm
set heroPoison to 0
set peaceSpark to 1
set hopeScore to 0
set regionNumber to 1
set deepestRegion to 1
set totalTurns to 0
set endingKind to underway
set ultimateCharge to 0
set herbCount to 1
set ironCount to 0
set dustCount to 0
set scaleCount to 0
set clothCount to 0
set crystalCount to 0
set hideCount to 0
set craftCount to 0
set poiseBreaks to 0
set weakHits to 0
set runeCount to 0
set tradeCount to 0
set repairCount to 0
set saveCount to 0
set fameLevel to 0
set demonLordSlain to false
set hiddenBossWin to false
set wardRuneHeld to false
set wardRuneUsed to false
set serinHelped to false
set demonLordWeakened to false
set bannerGuard to false
set warRisk to 12
add marketRiskBonus to warRisk
set traderStanding to 0
set crownStanding to 0
set elfStanding to 0
set dwarfStanding to 0
set templeStanding to 0
set guildStanding to 0
set adventureDay to 1
set fullnessLevel to 100
set fatigueLevel to 0
set moralePoints to 50
set marketPotionStock to 5
set marketTonicStock to 4
set marketBombStock to 2
set marketRationStock to 6
set rianelJoined to false
set brumJoined to false
set serinJoined to false
set adelaJoined to false
set kyleJoined to false
set aurelJoined to false
set isabelJoined to false
set darionJoined to false
set neriaJoined to false
set lucianJoined to false
set forestQuest to 0
set wardQuest to 0
set bannerQuest to 0
set marketQuest to 0
set refugeeQuest to 0
set sealQuest to 0
set enemiesFelled to an empty record
set allyList to an empty list
set achievementList to an empty list
set regionsFound to an empty list
set questBoard to an empty record
set firstUltimateAchievement to false
set firstPoiseAchievement to false
set firstWeakAchievement to false
set firstCraftAchievement to false
set richAchievement to false
set firstTradeAchievement to false
set firstRepairAchievement to false

# The gambler starts with the tools of chance that belong to the class.
# Any other class can buy or draw the same tools later.
if classNumber equals 13
  set luckCoinCount to 2
  set chaosRolls to 1
end


# ── Loading ────────────────────────────────────────────────────────
# The order is the format tag, the name, ninety-five numbers, then a position-weighted checksum.
# The space after each comma is dropped by the job that reads a number.

set loadWorked to false
if newAdventure missing
  ask saveText Paste the Peace save code you were given, all on one line
  set savePieces to saveText split by comma
  set savePieceCount to how many savePieces
  if savePieceCount equals 98
    set versionCell to the first of savePieces
    if versionCell equals peaceG
      set nameCell to item 2 of savePieces
      # Joining with commas puts one space in front of every cell.
      # Only that first space is dropped; spaces the player typed inside the name stay.
      set tidyName to nameCell repeated 0 times
      set nameLetterIndex to 0
      for each nameLetter in nameCell
        add 1 to nameLetterIndex
        if nameLetterIndex is greater than 1
          add nameLetter to tidyName
        end
      end
      set heroName to tidyName
      set restoredNumbers to an empty list
      set saveOrder to 0
      for each savePiece in savePieces
        add 1 to saveOrder
        if saveOrder is greater than 2
          do readCodeNumber with savePiece
        end
      end
      if how many restoredNumbers equals 96
        set loadWorked to true
      end
    end
  end

  if loadWorked exists
    set classNumber to the first of restoredNumbers
    set difficultyNumber to item 2 of restoredNumbers
    set regionNumber to item 3 of restoredNumbers
    set deepestRegion to item 4 of restoredNumbers
    set maxLife to item 5 of restoredNumbers
    set heroLife to item 6 of restoredNumbers
    set heroHit to item 7 of restoredNumbers
    set heroGuard to item 8 of restoredNumbers
    set maxSpirit to item 9 of restoredNumbers
    set heroSpirit to item 10 of restoredNumbers
    set heroSpeed to item 11 of restoredNumbers
    set heroLevel to item 12 of restoredNumbers
    set heroExp to item 13 of restoredNumbers
    set nextExp to item 14 of restoredNumbers
    set bronzeHeld to item 15 of restoredNumbers
    set potionCount to item 16 of restoredNumbers
    set strongPotionCount to item 17 of restoredNumbers
    set tonicCount to item 18 of restoredNumbers
    set antidoteCount to item 19 of restoredNumbers
    set bombCount to item 20 of restoredNumbers
    set holyWaterCount to item 21 of restoredNumbers
    set smokeCount to item 22 of restoredNumbers
    set whetstoneCount to item 23 of restoredNumbers
    set rationCount to item 24 of restoredNumbers
    set herbCount to item 25 of restoredNumbers
    set ironCount to item 26 of restoredNumbers
    set dustCount to item 27 of restoredNumbers
    set scaleCount to item 28 of restoredNumbers
    set clothCount to item 29 of restoredNumbers
    set crystalCount to item 30 of restoredNumbers
    set hideCount to item 31 of restoredNumbers
    set peaceSpark to item 32 of restoredNumbers
    set hopeScore to item 33 of restoredNumbers
    set ultimateCharge to item 34 of restoredNumbers
    set craftCount to item 35 of restoredNumbers
    set poiseBreaks to item 36 of restoredNumbers
    set weakHits to item 37 of restoredNumbers
    set totalTurns to item 38 of restoredNumbers
    set weaponNumber to item 39 of restoredNumbers
    set weaponWear to item 40 of restoredNumbers
    set weaponMaxWear to item 41 of restoredNumbers
    set armourNumber to item 42 of restoredNumbers
    set armourWear to item 43 of restoredNumbers
    set armourMaxWear to item 44 of restoredNumbers
    set charmNumber to item 45 of restoredNumbers
    set warRisk to item 46 of restoredNumbers
    set traderStanding to item 47 of restoredNumbers
    set crownStanding to item 48 of restoredNumbers
    set elfStanding to item 49 of restoredNumbers
    set dwarfStanding to item 50 of restoredNumbers
    set templeStanding to item 51 of restoredNumbers
    set guildStanding to item 52 of restoredNumbers
    set adventureDay to item 53 of restoredNumbers
    set fullnessLevel to item 54 of restoredNumbers
    set fatigueLevel to item 55 of restoredNumbers
    set moralePoints to item 56 of restoredNumbers
    set wardRuneHeld to item 57 of restoredNumbers
    set wardRuneUsed to item 58 of restoredNumbers
    set serinHelped to item 59 of restoredNumbers
    set demonLordWeakened to item 60 of restoredNumbers
    set bannerGuard to item 61 of restoredNumbers
    set rianelJoined to item 62 of restoredNumbers
    set brumJoined to item 63 of restoredNumbers
    set serinJoined to item 64 of restoredNumbers
    set adelaJoined to item 65 of restoredNumbers
    set kyleJoined to item 66 of restoredNumbers
    set aurelJoined to item 67 of restoredNumbers
    set isabelJoined to item 68 of restoredNumbers
    set darionJoined to item 69 of restoredNumbers
    set neriaJoined to item 70 of restoredNumbers
    set lucianJoined to item 71 of restoredNumbers
    set forestQuest to item 72 of restoredNumbers
    set wardQuest to item 73 of restoredNumbers
    set bannerQuest to item 74 of restoredNumbers
    set marketQuest to item 75 of restoredNumbers
    set refugeeQuest to item 76 of restoredNumbers
    set sealQuest to item 77 of restoredNumbers
    set runeCount to item 78 of restoredNumbers
    set tradeCount to item 79 of restoredNumbers
    set repairCount to item 80 of restoredNumbers
    set fameLevel to item 81 of restoredNumbers
    set saveCount to item 82 of restoredNumbers
    set demonLordSlain to item 83 of restoredNumbers
    set hiddenBossWin to item 84 of restoredNumbers
    set pacingNumber to item 85 of restoredNumbers
    set screenNumber to item 86 of restoredNumbers
    set luckCoinCount to item 87 of restoredNumbers
    set chaosRolls to item 88 of restoredNumbers
    set fateSealCount to item 89 of restoredNumbers
    set fateDrawCount to item 90 of restoredNumbers
    set fatePityCount to item 91 of restoredNumbers
    set fateShardCount to item 92 of restoredNumbers
    set firstDrawDone to item 93 of restoredNumbers
    set gambleWins to item 94 of restoredNumbers
    set gambleLosses to item 95 of restoredNumbers
    set gotCheckValue to item 96 of restoredNumbers

    set checkNumbers to list of classNumber, difficultyNumber, regionNumber, deepestRegion, maxLife, heroLife, heroHit, heroGuard, maxSpirit, heroSpirit, heroSpeed, heroLevel, heroExp, nextExp, bronzeHeld, potionCount, strongPotionCount, tonicCount, antidoteCount, bombCount, holyWaterCount, smokeCount, whetstoneCount, rationCount, herbCount, ironCount, dustCount, scaleCount, clothCount, crystalCount, hideCount, peaceSpark, hopeScore, ultimateCharge, craftCount, poiseBreaks, weakHits, totalTurns, weaponNumber, weaponWear, weaponMaxWear, armourNumber, armourWear, armourMaxWear, charmNumber, warRisk, traderStanding, crownStanding, elfStanding, dwarfStanding, templeStanding, guildStanding, adventureDay, fullnessLevel, fatigueLevel, moralePoints, wardRuneHeld, wardRuneUsed, serinHelped, demonLordWeakened, bannerGuard, rianelJoined, brumJoined, serinJoined, adelaJoined, kyleJoined, aurelJoined, isabelJoined, darionJoined, neriaJoined, lucianJoined, forestQuest, wardQuest, bannerQuest, marketQuest, refugeeQuest, sealQuest, runeCount, tradeCount, repairCount, fameLevel, saveCount, demonLordSlain, hiddenBossWin, pacingNumber, screenNumber, luckCoinCount, chaosRolls, fateSealCount, fateDrawCount, fatePityCount, fateShardCount, firstDrawDone, gambleWins, gambleLosses
    # It weighs each position rather than only summing, so swapping two fields is caught too.
    set checkSum to 0
    set checkIndex to 0
    for each checkNumber in checkNumbers
      add 1 to checkIndex
      set checkTerm to checkNumber
      multiply checkTerm by checkIndex
      add checkTerm to checkSum
    end
    set madeCheckValue to the remainder of checkSum divided by 997
    if madeCheckValue is not equal to gotCheckValue
      set loadWorked to false
    end
    # Even with a matching checksum, values outside the rules of the game are refused.
    if classNumber is less than 1 then set loadWorked to false
    if classNumber is greater than 13 then set loadWorked to false
    if difficultyNumber is less than 1 then set loadWorked to false
    if difficultyNumber is greater than 6 then set loadWorked to false
    if regionNumber is less than 1 then set loadWorked to false
    if regionNumber is greater than 13 then set loadWorked to false
    if deepestRegion is less than regionNumber then set loadWorked to false
    if heroLife is greater than maxLife then set loadWorked to false
    if heroSpirit is greater than maxSpirit then set loadWorked to false
    if weaponWear is greater than weaponMaxWear then set loadWorked to false
    if armourWear is greater than armourMaxWear then set loadWorked to false
    if pacingNumber is less than 1 then set loadWorked to false
    if pacingNumber is greater than 3 then set loadWorked to false
    if screenNumber is less than 1 then set loadWorked to false
    if screenNumber is greater than 2 then set loadWorked to false
  end

  if loadWorked missing
    set endingKind to brokensave
    draw a line
    show The save code was cut short, or it belongs to another build. Please run the game again.
    draw a line
  else
    show Loading is done. heroName picks the adventure up again on road regionNumber.
  end
end


# ── Rebuilding names and lists from the loaded numbers ─────────────

if newAdventure missing
  if classNumber equals 2
    set className to mage
    set skillName to fireball
    set skillCost to 6
    set skillElement to flame
    set ultimateName to greater firestorm
    set classTrait to magic and burning
  else if classNumber equals 3
    set className to archer
    set skillName to rapid shot
    set skillCost to 4
    set skillElement to pierce
    set ultimateName to a thousand arrows
    set classTrait to repeat shots and bleeding
  else if classNumber equals 4
    set className to cleric
    set skillName to holy light
    set skillCost to 5
    set skillElement to holy
    set ultimateName to the judgement of the goddess
    set classTrait to healing and cleansing
  else if classNumber equals 5
    set className to rogue
    set skillName to venom dagger
    set skillCost to 4
    set skillElement to poison
    set ultimateName to shadow execution
    set classTrait to dodging and poisoning
  else if classNumber equals 6
    set className to berserker
    set skillName to frenzy axe
    set skillCost to 4
    set skillElement to impact
    set ultimateName to the fury of Ragna
    set classTrait to lost life and fury
  else if classNumber equals 7
    set className to runesmith
    set skillName to rune hammer
    set skillCost to 5
    set skillElement to impact
    set ultimateName to the anvil of the earth
    set classTrait to repair and armour breaking
  else if classNumber equals 8
    set className to bard
    set skillName to shatter note
    set skillCost to 4
    set skillElement to sound
    set ultimateName to the epic of heroes
    set classTrait to heart and poise breaking
  else if classNumber equals 9
    set className to druid
    set skillName to binding vines
    set skillCost to 5
    set skillElement to nature
    set ultimateName to the wrath of the old forest
    set classTrait to regrowth and binding
  else if classNumber equals 10
    set className to warlock
    set skillName to life drain
    set skillCost to 6
    set skillElement to dark
    set ultimateName to the bargain of the abyss
    set classTrait to draining life and bargains
  else if classNumber equals 11
    set className to dragoon
    set skillName to dragonfire lance
    set skillCost to 5
    set skillElement to dragonfire
    set ultimateName to the descent of the red dragon
    set classTrait to piercing and dragonfire
  else if classNumber equals 12
    set className to chronomancer
    set skillName to time rift
    set skillCost to 6
    set skillElement to time
    set ultimateName to the world held still
    set classTrait to delayed turns and haste
  else if classNumber equals 13
    set className to gambler
    set skillName to the dice of fate
    set skillCost to 4
    set skillElement to fate
    set ultimateName to the one who turns the house over
    set classTrait to open odds and cover against failure
  else
    set className to knight
    set skillName to shield bash
    set skillCost to 4
    set skillElement to impact
    set ultimateName to the guard of the king
    set classTrait to guarding and shielding
  end

  if difficultyNumber equals 1
    set difficultyName to very easy
    set enemyLifeBonus to 0
    set enemyHitBonus to 0
    set enemyGuardBonus to 0
    set poiseBonus to 0
    set rewardBonus to 25
    set marketRiskBonus to 0
  else if difficultyNumber equals 2
    set difficultyName to easy
    set enemyLifeBonus to 6
    set enemyHitBonus to 1
    set enemyGuardBonus to 0
    set poiseBonus to 0
    set rewardBonus to 15
    set marketRiskBonus to 1
  else if difficultyNumber equals 4
    set difficultyName to hard
    set enemyLifeBonus to 28
    set enemyHitBonus to 5
    set enemyGuardBonus to 1
    set poiseBonus to 1
    set rewardBonus to 20
    set marketRiskBonus to 4
  else if difficultyNumber equals 5
    set difficultyName to very hard
    set enemyLifeBonus to 48
    set enemyHitBonus to 8
    set enemyGuardBonus to 2
    set poiseBonus to 2
    set rewardBonus to 45
    set marketRiskBonus to 7
  else if difficultyNumber equals 6
    set difficultyName to impossible
    set enemyLifeBonus to 78
    set enemyHitBonus to 11
    set enemyGuardBonus to 4
    set poiseBonus to 4
    set rewardBonus to 85
    set marketRiskBonus to 11
  else
    set difficultyName to normal
    set enemyLifeBonus to 12
    set enemyHitBonus to 3
    set enemyGuardBonus to 0
    set poiseBonus to 0
    set rewardBonus to 0
    set marketRiskBonus to 2
  end

  # Gear names are saved as short numbers and put back together here.
  if weaponNumber equals 2
    set weaponName to the ranger's longbow
  else if weaponNumber equals 3
    set weaponName to dwarven rune hammer
  else if weaponNumber equals 4
    set weaponName to silver staff
  else if weaponNumber equals 5
    set weaponName to shadow dagger
  else if weaponNumber equals 6
    set weaponName to dragonbone lance
  else if weaponNumber equals 7
    set weaponName to the second hand of time
  else if weaponNumber equals 8
    set weaponName to the holy sword of peace
  else
    set weaponName to iron longsword
  end
  if armourNumber equals 2
    set armourName to elven ranger's coat
  else if armourNumber equals 3
    set armourName to dwarven plate armour
  else if armourNumber equals 4
    set armourName to holy light vestment
  else if armourNumber equals 5
    set armourName to dragonscale armour
  else if armourNumber equals 6
    set armourName to the royal guardian armour
  else
    set armourName to chain armour
  end
  if charmNumber equals 1
    set charmName to the hawk's eye
  else if charmNumber equals 2
    set charmName to the trader's silver scales
  else if charmNumber equals 3
    set charmName to the saint's rosary
  else if charmNumber equals 4
    set charmName to a shard of Nox
  else
    set charmName to a worn peace charm
  end

  # The ally list and the quest board are rebuilt from the saved flags.
  if rianelJoined exists then append Rianel to allyList
  if brumJoined exists then append Brum to allyList
  if serinJoined exists then append Serin to allyList
  if adelaJoined exists then append Adela to allyList
  if kyleJoined exists then append Kyle to allyList
  if aurelJoined exists then append Aurel to allyList
  if isabelJoined exists then append Isabel to allyList
  if darionJoined exists then append Darion to allyList
  if neriaJoined exists then append Neria to allyList
  if lucianJoined exists then append Lucian to allyList
end

put demonlord at underway in questBoard
put forestpact at unknown in questBoard
put magicward at unknown in questBoard
put banner at unknown in questBoard
put freemarket at unknown in questBoard
put refugees at unknown in questBoard
put sunseal at unknown in questBoard

if newAdventure missing
  if forestQuest equals 1 then put forestpact at done in questBoard
  if forestQuest equals 2 then put forestpact at missed in questBoard
  if wardQuest equals 1 then put magicward at done in questBoard
  if wardQuest equals 2 then put magicward at missed in questBoard
  if bannerQuest equals 1 then put banner at done in questBoard
  if bannerQuest equals 2 then put banner at missed in questBoard
  if marketQuest equals 1 then put freemarket at done in questBoard
  if marketQuest equals 2 then put freemarket at profitdeal in questBoard
  if refugeeQuest equals 1 then put refugees at done in questBoard
  if refugeeQuest equals 2 then put refugees at armyfirst in questBoard
  if sealQuest equals 1 then put sunseal at done in questBoard
  if sealQuest equals 2 then put sunseal at relicspent in questBoard

  if poiseBreaks is greater than 0
    set firstPoiseAchievement to true
    append poise breaker to achievementList
  end
  if weakHits is greater than 0
    set firstWeakAchievement to true
    append weakness hunter to achievementList
  end
  if craftCount is greater than 0
    set firstCraftAchievement to true
    append first craft to achievementList
  end
  if tradeCount is greater than 0
    set firstTradeAchievement to true
    append first trade to achievementList
  end
  if repairCount is greater than 0
    set firstRepairAchievement to true
    append first repair to achievementList
  end
  if bronzeHeld is greater than 99
    set richAchievement to true
    append first gold to achievementList
  end

  if regionNumber is greater than 1
    append the north gate of the capital to regionsFound
    set recordEnemyName to Skrak the red-ear goblin chief
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 2
    append the whispering forest to regionsFound
    set recordEnemyName to Gardum the orc warchief
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 3
    append the silver mine to regionsFound
    set recordEnemyName to Edric the wraith knight
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 4
    append the old wizard's tower to regionsFound
    set recordEnemyName to Borga the troll king
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 5
    append the catacombs of the holy light abbey to regionsFound
    set recordEnemyName to Granite the stone golem
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 6
    append the ashen fortress to regionsFound
    set recordEnemyName to Morvel the dark wizard
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 7
    append the dragon's canyon to regionsFound
    set recordEnemyName to Barkas the fallen black dragon
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 8
    append the golden market of the free city to regionsFound
    set recordEnemyName to Lemar the golden-mask bandit king
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 9
    append the frost gate to regionsFound
    set recordEnemyName to Hargon the frost giant
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 10
    append the starlight marsh to regionsFound
    set recordEnemyName to Selka the plague hydra
    put recordEnemyName at 1 in enemiesFelled
  end
  if regionNumber is greater than 11
    append the fallen sun temple to regionsFound
    set recordEnemyName to Solkana the fallen angel
    put recordEnemyName at 1 in enemiesFelled
  end
  if demonLordSlain exists
    append the black throne of the demon castle to regionsFound
    set recordEnemyName to Morgar the Demon Lord
    put recordEnemyName at 1 in enemiesFelled
    put demonlord at done in questBoard
    append demon lord hunter to achievementList
  end
end


# ── Princess Elenoa and the first vow ──────────────────────────────

if newAdventure exists
  set titleBoard to Elenoa, princess of Arteria
  do drawSmallTitle with titleBoard
  story:

    Princess Elenoa wears rusted armour instead of a crown and sorts the ration tickets of the refugees herself.
    Grain is still stacked in the noble warehouses, but the roads are cut and bread costs three times more at the border than in the capital.
    She moves the goddess's holy flame into a lantern and says that ending a war and bringing life back are not the same thing.

  end
  set firstVowOptions to list of honour, kingdom, people
  set firstVowSettled to 0
  while firstVowSettled is less than 1
    ask firstVow What will you keep first? honour, kingdom, people
    if firstVowOptions contains firstVow
      set firstVowSettled to 1
    else
      show 🟦 Please type one of the three again.
    end
  end
  if firstVow equals honour
    add 3 to maxSpirit
    set heroSpirit to maxSpirit
    add 1 to hopeScore
    add 1 to crownStanding
    show Elenoa answers with the salute of the royal knights. Your greatest spirit went up.
  else if firstVow equals kingdom
    add 1 to peaceSpark
    add 2 to hopeScore
    add 2 to crownStanding
    show A hidden supply road lights up on the royal map. The holy flame burns stronger.
  else
    add 6 to maxLife
    set heroLife to maxLife
    add 1 to hopeScore
    add 2 to guildStanding
    show The refugees remember the adventurer's name. Your greatest life went up.
  end
end

if quickTest exists
  set maxLife to 999
  set heroLife to maxLife
  set maxSpirit to 99
  set heroSpirit to maxSpirit
  set heroHit to 99
  set heroGuard to 40
  set bronzeHeld to 9999
  set potionCount to 30
  set strongPotionCount to 30
  set tonicCount to 30
  set antidoteCount to 30
  set bombCount to 30
  set holyWaterCount to 30
  set smokeCount to 30
  set rationCount to 30
  set herbCount to 30
  set ironCount to 30
  set dustCount to 30
  set scaleCount to 30
  set clothCount to 30
  set crystalCount to 30
  set hideCount to 30
  set shortWait to 0
  set ultimateCharge to ultimateFull
end

draw a line
show heroName · className · difficultyName difficulty
show class trait · classTrait
show weapon weaponName · armour armourName · charm charmName
show skill skillName · spirit needed skillCost · element skillElement
show ultimate ultimateName · charges as you attack and guard
wait shortWait


# ════════════════════════════════════════════════════════════════════
# The great loop of the adventure
# One turn around this loop is one region.
# Pull back from a fight and the same region starts over.
# ════════════════════════════════════════════════════════════════════

repeat forever

  if endingKind is not equal to underway
    break
  end


  # ── The character you meet on entering a region ─────────────────
  # A choice stays not only in the numbers but in the last scene of all.

  if regionNumber equals 2
    set titleBoard to Rianel, captain of the elven scouts
    do drawSmallTitle with titleBoard
    story:

      The whispering forest is the oldest elven land in the kingdom, and a goblin legion holds it now.
      Rianel, the silver-haired scout captain, drops three goblins at the pass with three arrows at once.
      She says that the eye which reads an enemy's footprints, not fast feet, is what makes a fine adventurer.

    end
    set rianelOptions to list of scout, hurry
    set rianelSettled to 0
    while rianelSettled is less than 1
      ask rianelChoice Will you scout the woods with Rianel? scout, hurry
      if rianelOptions contains rianelChoice
        set rianelSettled to 1
      else
        show 🟦 Please type scout or hurry.
      end
    end
    if rianelChoice equals scout
      add 1 to heroHit
      add 2 to maxSpirit
      set heroSpirit to maxSpirit
      add 1 to hopeScore
      append Rianel to allyList
      set rianelJoined to true
      add 2 to elfStanding
      set forestQuest to 1
      put forestpact at done in questBoard
      show You learn every goblin ambush on the road. Your hit and your spirit went up.
    else
      add 3 to heroSpeed
      set forestQuest to 2
      put forestpact at missed in questBoard
      show You pass the elven forest road quickly. Your speed went up.
    end
    wait shortWait
  end

  if regionNumber equals 3
    set titleBoard to Brum, the dwarven smith
    do drawSmallTitle with titleBoard
    story:

      Before the last furnace of the silver mine, Brum the dwarven smith is holding back an orc legion alone.
      Sparks have caught in Brum's beard, yet he never stops hammering and finishes a rune out of legend.
      A ward rune cut into armour can hold death off once, at the most dangerous moment of all.

    end
    set brumOptions to list of wardrune, powder
    set brumSettled to 0
    while brumSettled is less than 1
      ask brumChoice What will you ask Brum for? wardrune, powder
      if brumOptions contains brumChoice
        set brumSettled to 1
      else
        show 🟦 Please type wardrune or powder.
      end
    end
    if brumChoice equals wardrune
      set wardRuneHeld to true
      add 1 to hopeScore
      show A ward rune shines on your armour. It gives your life back once when you fall.
    else
      add 1 to bombCount
      show Brum reshapes his mining powder into a battle bomb and hands it over.
    end
    append Brum to allyList
    set brumJoined to true
    add 2 to dwarfStanding
    wait shortWait
  end

  if regionNumber equals 4
    set titleBoard to Serin, the apprentice wizard
    do drawSmallTitle with titleBoard
    story:

      At the top of the old wizard's tower, the apprentice Serin is holding a rift open on her own.
      Every one of her teachers fell against the demon army, but Serin never let go of the worn spellbook.
      Closing the rift would weaken the Demon Lord's ward, and Serin does not have the strength for it alone.

    end
    set serinOptions to list of seal, orb
    set serinSettled to 0
    while serinSettled is less than 1
      ask serinChoice How will you help Serin? seal, orb
      if serinOptions contains serinChoice
        set serinSettled to 1
      else
        show 🟦 Please type one of the two again.
      end
    end
    if serinChoice equals seal
      set serinHelped to true
      set demonLordWeakened to true
      add 2 to hopeScore
      append Serin to allyList
      set serinJoined to true
      set wardQuest to 1
      put magicward at done in questBoard
      show Together you finish the spell and cut the Demon Lord's ward. The last fight will be weaker.
    else
      add 2 to heroHit
      set wardQuest to 2
      put magicward at missed in questBoard
      show Serin hands over an orb holding an attack spell. Your hit went up a great deal.
    end
    wait shortWait
  end

  if regionNumber equals 5
    set titleBoard to Adela, the saint
    do drawSmallTitle with titleBoard
    story:

      The chapel of the holy light abbey is surrounded by the undead, and the altar candle is not out yet.
      Adela tends the wounded and keeps up the prayer that holds the demon army's curse back.
      She asks you where to spend her last blessing: on life, on strength, or on the road ahead.

    end
    set adelaOptions to list of life, strength, coin
    set adelaSettled to 0
    while adelaSettled is less than 1
      ask adelaChoice Which blessing will you take? life, strength, coin
      if adelaOptions contains adelaChoice
        set adelaSettled to 1
      else
        show 🟦 Please type one of life, strength or coin again.
      end
    end
    if adelaChoice equals life
      add 8 to maxLife
      set heroLife to maxLife
      add 1 to hopeScore
      show A holy prayer closes around your wounds. Your greatest life went up.
    else if adelaChoice equals strength
      add 3 to heroHit
      add 1 to heroGuard
      show Bright light runs along your blessed weapon. Your hit and your guard went up.
    else
      add 80 to bronzeHeld
      show The abbey hands you the 8 silver it gathered in relief money.
    end
    append Adela to allyList
    set adelaJoined to true
    add 2 to templeStanding
    wait shortWait
  end

  if regionNumber equals 6
    set titleBoard to Kyle, the mercenary captain
    do drawSmallTitle with titleBoard
    story:

      On the wall of the ashen fortress waits Kyle, a mercenary captain who lived through hundreds of fights.
      Kyle is the rare mercenary who keeps a promise before he keeps his pay; he sent his last men away and stayed alone.
      He lays out the kingdom's lion banner and a pair of spare potions, and tells you to pick one.

    end
    set kyleOptions to list of banner, potion
    set kyleSettled to 0
    while kyleSettled is less than 1
      ask kyleChoice Which will you take? banner, potion
      if kyleOptions contains kyleChoice
        set kyleSettled to 1
      else
        show 🟦 Please type banner or potion.
      end
    end
    if kyleChoice equals banner
      add 2 to heroGuard
      set bannerGuard to true
      add 1 to hopeScore
      set bannerQuest to 1
      put banner at done in questBoard
      show The kingdom's lion banner snaps above your shield. Your guard went up.
    else
      add 2 to potionCount
      set bannerQuest to 2
      put banner at missed in questBoard
      show Kyle hands over the last two potions his company had.
    end
    append Kyle to allyList
    set kyleJoined to true
    add 2 to guildStanding
    wait shortWait
  end

  if regionNumber equals 7
    set titleBoard to Aurel, the old gold dragon
    do drawSmallTitle with titleBoard
    story:

      At the head of the dragon's canyon lies Aurel, an old gold dragon who lost a wing to the Demon Lord.
      Aurel sealed the first Demon Lord alongside the first king, and has watched the kingdom longer than anyone alive.
      He says Morgar worships strength and nothing else, so you must prove either courage or wisdom.

    end
    set aurelOptions to list of wisdom, courage
    set aurelSettled to 0
    while aurelSettled is less than 1
      ask aurelChoice Which will you prove? wisdom, courage
      if aurelOptions contains aurelChoice
        set aurelSettled to 1
      else
        show 🟦 Please type wisdom or courage.
      end
    end
    if aurelChoice equals wisdom
      add 1 to peaceSpark
      add 2 to hopeScore
      show Aurel tells you the three shapes the Demon Lord takes. The holy flame burns stronger.
    else
      add 2 to heroHit
      show Your hit rises with the roar of Aurel. The gate of the demon castle opens.
    end
    append Aurel to allyList
    set aurelJoined to true
    wait shortWait
  end

  if regionNumber equals 8
    set titleBoard to Isabel, head of the free market
    do drawSmallTitle with titleBoard
    story:

      In the square of the free city of Beloa, citizens waiting for bread stand facing a company sitting on stacked grain.
      Isabel, who heads the company, says that forcing the grain price down stops the next cart, and leaving it alone leaves people hungry today.
      She holds out two contracts: release the grain against a royal guarantee, or escort the dangerous northern cart yourself.

    end
    set isabelOptions to list of grain, escort
    set isabelSettled to 0
    while isabelSettled is less than 1
      ask isabelChoice Which contract will you take? grain, escort
      if isabelOptions contains isabelChoice
        set isabelSettled to 1
      else
        show 🟦 Please type grain or escort.
      end
    end
    if isabelChoice equals grain
      set payAmount to 100
      if bronzeHeld is less than payAmount
        set payAmount to bronzeHeld
      end
      subtract payAmount from bronzeHeld
      add 2 to hopeScore
      add 3 to traderStanding
      add 1 to guildStanding
      subtract 2 from warRisk
      set marketQuest to 1
      put freemarket at done in questBoard
      show Grain reaches the citizens and the company is left holding royal paper. Prices settle.
    else
      add 140 to bronzeHeld
      add 1 to heroHit
      add 1 to traderStanding
      set marketQuest to 2
      put freemarket at profitdeal in questBoard
      show For guarding the cart you earned 1 gold 4 silver and learned how a trader fights.
    end
    set isabelJoined to true
    append Isabel to allyList
    wait shortWait

    # Mira the odds trader hides nothing: she posts the success rate and the worst loss first.
    set titleBoard to 🎲 Mira, the odds trader
    do drawSmallTitle with titleBoard
    if pacingNumber equals 2
      say slowly Mira sets a small bronze die and a tightly written book of odds on the table.
    else if pacingNumber equals 3
      say very slowly Mira whispers. Fate is only a trick while it is hidden.
    else
      show Mira sets a small bronze die and a tightly written book of odds on the table.
    end
    show 🟨 Open wager · 45 percent to win · 55 percent to lose · stake and worst loss 20 bronze
    show Winning returns the stake and 20 bronze on top. You may try once.
    set miraOptions to list of bet, pass
    set miraSettled to 0
    while miraSettled is less than 1
      ask miraChoice Please type bet or pass
      if miraOptions contains miraChoice
        set miraSettled to 1
      else
        show 🟦 Please type bet or pass again.
      end
    end
    if miraChoice equals bet
      if bronzeHeld is greater than 19
        subtract 20 from bronzeHeld
        set miraRoll to random number from 1 to 100
        if miraRoll is less than or equal to 45
          add 40 to bronzeHeld
          add 1 to luckCoinCount
          add 1 to gambleWins
          say in a box 🟨 Won · 20 bronze clear · one luck coin
        else
          add 1 to gambleLosses
          show 🟥 Lost · 20 bronze gone, exactly the worst loss she posted.
        end
      else
        show Your stake is short. Mira says she does not gamble on borrowed money.
      end
    else
      show 🟦 Mira calls turning it down a good call too, and gives you a luck coin.
      add 1 to luckCoinCount
    end
  end

  if regionNumber equals 9
    set titleBoard to Darion, prince of the north
    do drawSmallTitle with titleBoard
    story:

      Below the frost gate the people of the north, who have lost their homes, stand in a long line.
      Prince Darion never claims the throne; he holds the key to the last grain store and sends the wounded in first.
      Holding the gate takes weapons, and keeping people alive takes emptying the store.

    end
    set darionOptions to list of refugees, armoury
    set darionSettled to 0
    while darionSettled is less than 1
      ask darionChoice Which will you keep first? refugees, armoury
      if darionOptions contains darionChoice
        set darionSettled to 1
      else
        show 🟦 Please type refugees or armoury.
      end
    end
    if darionChoice equals refugees
      add 2 to rationCount
      add 2 to hopeScore
      add 2 to crownStanding
      set refugeeQuest to 1
      put refugees at done in questBoard
      show The food is shared out, and the smiths who lived agree to raise the wall again one day.
    else
      add 2 to heroHit
      add 1 to heroGuard
      set refugeeQuest to 2
      put refugees at armyfirst in questBoard
      show The armoury's gear holds the gate, but the column of refugees takes a far longer road.
    end
    set darionJoined to true
    append Darion to allyList
    wait shortWait
  end

  if regionNumber equals 10
    set titleBoard to Neria, the marsh herbalist
    do drawSmallTitle with titleBoard
    story:

      The herbs of the starlight marsh were the base of nearly every antidote in the kingdom, and reckless picking in the war stripped them out.
      Neria says that returning the last seeds to the marsh means less medicine now and a living marsh for the next generation.
      Boiling those same seeds instead would make an elixir strong enough to stand the Demon Lord's poison.

    end
    set neriaOptions to list of marsh, elixir
    set neriaSettled to 0
    while neriaSettled is less than 1
      ask neriaChoice What will you do with the last seeds? marsh, elixir
      if neriaOptions contains neriaChoice
        set neriaSettled to 1
      else
        show 🟦 Please type marsh or elixir.
      end
    end
    if neriaChoice equals marsh
      add 2 to hopeScore
      add 1 to elfStanding
      add 1 to templeStanding
      add 4 to herbCount
      subtract 1 from warRisk
      show You open the water channels, and buried seeds rise under the moonlight.
    else
      add 2 to strongPotionCount
      add 3 to antidoteCount
      add 5 to maxLife
      add 5 to heroLife
      show Neria boils the last seeds down into a final elixir.
    end
    set neriaJoined to true
    append Neria to allyList
    wait shortWait
  end

  if regionNumber equals 11
    set titleBoard to Lucian, the sun knight
    do drawSmallTitle with titleBoard
    story:

      Under the fallen sun temple a black vein runs, beating, all the way to the demon castle.
      Lucian, the last sun knight, explains that the relic makes a weapon stronger, and spent on the seal it makes the Demon Lord weaker.
      He swears that whichever you choose, he will carry the outcome with you.

    end
    set lucianOptions to list of seal, weapon
    set lucianSettled to 0
    while lucianSettled is less than 1
      ask lucianChoice Where will you spend the sun relic? seal, weapon
      if lucianOptions contains lucianChoice
        set lucianSettled to 1
      else
        show 🟦 Please type seal or weapon.
      end
    end
    if lucianChoice equals seal
      set demonLordWeakened to true
      add 3 to hopeScore
      add 3 to templeStanding
      set sealQuest to 1
      put sunseal at done in questBoard
      show The black vein hardens to gold, and the sky over the demon castle brightens for the first time.
    else
      add 4 to heroHit
      add 2 to holyWaterCount
      set sealQuest to 2
      put sunseal at relicspent in questBoard
      show The relic's light settles into your weapon and your hit rises sharply.
    end
    set lucianJoined to true
    append Lucian to allyList
    wait shortWait
  end


  # ── Regions and enemies ─────────────────────────────────────────
  # To add an enemy, copy one of the branches below exactly as it is.
  # A trait is one of momentum, plunder, thorns, regrowth, armour, poison, drain, demon lord, abyss.
  # What a trait actually does is gathered further down, under "The enemy strikes back".

  if regionNumber equals 13
    set regionName to the rift in the world
    set enemyName to Nox the abyss dragon
    set enemyMaxLife to 270
    set enemyHit to 23
    set enemyGuard to 11
    set enemySpeed to 28
    set enemyRewardBronze to 900
    set enemyExp to 150
    set enemyTrait to abyss
    set enemyWeak to time
    set enemyMaxPoise to 18
    set enemyBlurb to an old abyss dragon born from the rift the Demon Lord's death tore open
  else if regionNumber equals 12
    set regionName to the black throne of the demon castle
    set enemyName to Morgar the Demon Lord
    set enemyMaxLife to 220
    set enemyHit to 19
    set enemyGuard to 9
    set enemySpeed to 22
    set enemyRewardBronze to 0
    set enemyExp to 100
    set enemyTrait to demon lord
    set enemyWeak to holy
    set enemyMaxPoise to 16
    set enemyBlurb to the enemy of Arteria, commanding demon fire and a legion of the dead
  else if regionNumber equals 11
    set regionName to the fallen sun temple
    set enemyName to Solkana the fallen angel
    set enemyMaxLife to 170
    set enemyHit to 17
    set enemyGuard to 8
    set enemySpeed to 24
    set enemyRewardBronze to 380
    set enemyExp to 58
    set enemyTrait to thorns
    set enemyWeak to dark
    set enemyMaxPoise to 14
    set enemyBlurb to a fallen guardian angel who left the teaching of the sun and turns light back like a mirror
  else if regionNumber equals 10
    set regionName to the starlight marsh
    set enemyName to Selka the plague hydra
    set enemyMaxLife to 150
    set enemyHit to 16
    set enemyGuard to 6
    set enemySpeed to 18
    set enemyRewardBronze to 330
    set enemyExp to 50
    set enemyTrait to poison
    set enemyWeak to nature
    set enemyMaxPoise to 13
    set enemyBlurb to the ruler of the marsh, fed on fouled herbs, each head breathing a different venom
  else if regionNumber equals 9
    set regionName to the frost gate
    set enemyName to Hargon the frost giant
    set enemyMaxLife to 138
    set enemyHit to 15
    set enemyGuard to 10
    set enemySpeed to 9
    set enemyRewardBronze to 290
    set enemyExp to 44
    set enemyTrait to armour
    set enemyWeak to flame
    set enemyMaxPoise to 16
    set enemyBlurb to the last frost giant, wrapped in ice armour torn from the northern wall
  else if regionNumber equals 8
    set regionName to the golden market of the free city
    set enemyName to Lemar the golden-mask bandit king
    set enemyMaxLife to 118
    set enemyHit to 14
    set enemyGuard to 6
    set enemySpeed to 30
    set enemyRewardBronze to 260
    set enemyExp to 39
    set enemyTrait to gamble
    set enemyWeak to sound
    set enemyMaxPoise to 11
    set enemyBlurb to the bandit king of the free market, whose loaded golden dice took war supplies and the debts of its citizens alike
  else if regionNumber equals 7
    set regionName to the dragon's canyon
    set enemyName to Barkas the fallen black dragon
    set enemyMaxLife to 92
    set enemyHit to 13
    set enemyGuard to 5
    set enemySpeed to 20
    set enemyRewardBronze to 220
    set enemyExp to 34
    set enemyTrait to drain
    set enemyWeak to dragonfire
    set enemyMaxPoise to 10
    set enemyBlurb to a black dragon bent to Morgar's curse, who turns the wounds you deal into life of his own
  else if regionNumber equals 6
    set regionName to the ashen fortress
    set enemyName to Morvel the dark wizard
    set enemyMaxLife to 78
    set enemyHit to 12
    set enemyGuard to 4
    set enemySpeed to 15
    set enemyRewardBronze to 180
    set enemyExp to 29
    set enemyTrait to poison
    set enemyWeak to holy
    set enemyMaxPoise to 8
    set enemyBlurb to once a knight of the kingdom, now a dark wizard spreading the poison of his curse
  else if regionNumber equals 5
    set regionName to the catacombs of the holy light abbey
    set enemyName to Granite the stone golem
    set enemyMaxLife to 86
    set enemyHit to 11
    set enemyGuard to 8
    set enemySpeed to 7
    set enemyRewardBronze to 150
    set enemyExp to 25
    set enemyTrait to armour
    set enemyWeak to impact
    set enemyMaxPoise to 12
    set enemyBlurb to a golem cut from old dwarven sealing stone, which builds its broken armour back
  else if regionNumber equals 4
    set regionName to the old wizard's tower
    set enemyName to Borga the troll king
    set enemyMaxLife to 66
    set enemyHit to 10
    set enemyGuard to 3
    set enemySpeed to 23
    set enemyRewardBronze to 125
    set enemyExp to 21
    set enemyTrait to regrowth
    set enemyWeak to flame
    set enemyMaxPoise to 8
    set enemyBlurb to a troll who drank the tower's spring of regrowth, so every cut closes again
  else if regionNumber equals 3
    set regionName to the silver mine
    set enemyName to Edric the wraith knight
    set enemyMaxLife to 58
    set enemyHit to 9
    set enemyGuard to 5
    set enemySpeed to 17
    set enemyRewardBronze to 105
    set enemyExp to 18
    set enemyTrait to thorns
    set enemyWeak to holy
    set enemyMaxPoise to 9
    set enemyBlurb to a knight who betrayed the kingdom and whose soul, caught in a mirror shield, sends skills back
  else if regionNumber equals 2
    set regionName to the whispering forest
    set enemyName to Gardum the orc warchief
    set enemyMaxLife to 49
    set enemyHit to 8
    set enemyGuard to 3
    set enemySpeed to 21
    set enemyRewardBronze to 85
    set enemyExp to 15
    set enemyTrait to plunder
    set enemyWeak to pierce
    set enemyMaxPoise to 7
    set enemyBlurb to an orc warchief wearing the coin he took from the kingdom's caravans like armour
  else
    set regionName to the north gate of the capital
    set enemyName to Skrak the red-ear goblin chief
    set enemyMaxLife to 40
    set enemyHit to 7
    set enemyGuard to 2
    set enemySpeed to 12
    set enemyRewardBronze to 65
    set enemyExp to 12
    set enemyTrait to momentum
    set enemyWeak to flame
    set enemyMaxPoise to 6
    set enemyBlurb to the chief of a goblin legion, who swings harder the more of his own fall
  end

  # The difficulty bonus is added to every enemy the same way.
  add enemyLifeBonus to enemyMaxLife
  add enemyHitBonus to enemyHit
  add enemyGuardBonus to enemyGuard
  add poiseBonus to enemyMaxPoise
  add rewardBonus to enemyRewardBronze
  append regionName to regionsFound

  # Serin's closed rift and Aurel's advice count against the Demon Lord alone.
  if enemyTrait equals demon lord
    if demonLordWeakened exists
      subtract 20 from enemyMaxLife
      subtract 2 from enemyHit
    end
  end

  set enemyLife to enemyMaxLife
  set enemyBurn to 0
  set enemyBleed to 0
  set enemyPoison to 0
  set enemyPoise to enemyMaxPoise
  set enemyStun to false
  set weakFound to false
  set regionTurns to 0
  set demonLordPhase to 1
  set battleResult to fighting
  set fateMissStreak to 0
  set nextGreatSure to false
  set luckCoinReady to false
  set nextCritSure to false

  # The field takes one of four states every time.
  # Fog makes dodging harder; a mana storm helps spirit, the goddess's wind helps life.
  set battleSpeed to heroSpeed
  # The hawk's eye reads an enemy's movement even inside fog.
  if charmNumber equals 1
    add 6 to battleSpeed
  end
  if fatigueLevel is greater than 59
    subtract 5 from battleSpeed
  end
  if fullnessLevel is less than 25
    subtract 4 from battleSpeed
  end
  if moralePoints is greater than 74
    add 3 to battleSpeed
  end
  # Dodging is capped so that speed alone can never make you untouchable.
  if battleSpeed is greater than maxDodgeChance then set battleSpeed to maxDodgeChance
  set fieldRoll to random number from 1 to 4
  if fieldRoll equals 1
    set fieldEffect to clear sky
  else if fieldRoll equals 2
    set fieldEffect to thick fog
    subtract 8 from battleSpeed
    if battleSpeed is less than 0
      set battleSpeed to 0
    end
  else if fieldRoll equals 3
    set fieldEffect to mana storm
  else
    set fieldEffect to the wind of the goddess
  end

  do drawBigTitle with regionName
  show road regionNumber
  show enemyName blocks the way
  show enemyBlurb
  show field effect · fieldEffect
  wait shortWait


  # ══════════════════════════════════════════════════════════════════
  # One fight
  # One turn around this loop is one move by the hero and one strike back.
  # ══════════════════════════════════════════════════════════════════

  repeat forever

    add 1 to totalTurns
    add 1 to regionTurns
    set isGuarding to false
    set skillUsed to false
    set weaponUsed to false
    set inSmoke to false
    set actionSpends to true

    # A field effect works at the start of every turn.
    if fieldEffect equals mana storm
      add 2 to heroSpirit
      if heroSpirit is greater than maxSpirit
        set heroSpirit to maxSpirit
      end
    else if fieldEffect equals the wind of the goddess
      add 2 to heroLife
      if heroLife is greater than maxLife
        set heroLife to maxLife
      end
    end

    # Enemy intent runs on a cycle of three turns.
    # A bomb answers a guard stance, guarding answers a heavy blow, a quick hit answers its own skill.
    set intentStep to the remainder of regionTurns divided by 3
    set thisEnemyGuard to enemyGuard
    if intentStep equals 1
      set enemyIntent to guard stance
      add 4 to thisEnemyGuard
    else if intentStep equals 2
      set enemyIntent to heavy blow
    else
      set enemyIntent to its own skill
    end

    if screenNumber equals 1 then clear the screen
    set enemyLifeBefore to enemyLife
    draw a line
    show ⚔ regionName · road regionNumber
    show 🟥 enemy · enemyName · life enemyLife / enemyMaxLife
    set barMaxAmount to enemyMaxLife
    do drawLifeBar with enemyLife
    show 🟩 hero · heroName · life heroLife / maxLife · spirit heroSpirit / maxSpirit
    set barMaxAmount to maxLife
    do drawLifeBar with heroLife
    show level heroLevel · hit heroHit · guard heroGuard · speed heroSpeed
    show 🟥 enemy poise enemyPoise / enemyMaxPoise · coming enemyIntent
    if enemyTrait equals gamble
      show 🟨 Lemar's golden dice · backfire 33.3 / even 33.3 / loaded 33.3 percent
    end
    show 🟦 dodge battleSpeed percent · critical critChance percent · ally help allyHelpChance percent
    show 🟨 ultimate ultimateName · charge ultimateCharge / ultimateFull
    show weapon wear weaponWear / weaponMaxWear · armour wear armourWear / armourMaxWear
    show potion potionCount · strongpotion strongPotionCount · tonic tonicCount · antidote antidoteCount
    show bomb bombCount · holywater holyWaterCount · smoke smokeCount · whetstone whetstoneCount
    show luckcoin luckCoinCount · chaosdie chaosRolls
    if allyList missing
      show allies · none yet
    else
      show allyList joined by comma
    end
    do showMoney with bronzeHeld
    draw a line
    show ⚔ fight · attack / skill / ultimate / guard
    show 🧪 items · potion / strongpotion / tonic / antidote / bomb / holywater
    show 🎲 chance · luckcoin / chaosdie
    show 📜 tactics · smoke / whetstone / look / retreat
    ask actionPick Type exactly one of the moves above

    # Every answer is checked first, so a typo never turns into a plain attack.
    set actionValid to false
    if actionPick equals attack then set actionValid to true
    if actionPick equals skill then set actionValid to true
    if actionPick equals ultimate then set actionValid to true
    if actionPick equals guard then set actionValid to true
    if actionPick equals potion then set actionValid to true
    if actionPick equals strongpotion then set actionValid to true
    if actionPick equals tonic then set actionValid to true
    if actionPick equals antidote then set actionValid to true
    if actionPick equals bomb then set actionValid to true
    if actionPick equals holywater then set actionValid to true
    if actionPick equals smoke then set actionValid to true
    if actionPick equals whetstone then set actionValid to true
    if actionPick equals luckcoin then set actionValid to true
    if actionPick equals chaosdie then set actionValid to true
    if actionPick equals look then set actionValid to true
    if actionPick equals retreat then set actionValid to true
    if actionValid missing
      show 🟦 That answer was not understood. Asking again without spending the turn.
      subtract 1 from totalTurns
      subtract 1 from regionTurns
      skip
    end


    # ── What the hero does ─────────────────────────────────────────

    if actionPick equals ultimate

      if ultimateCharge is less than ultimateFull
        show 🟦 There is not enough power yet. The turn is not spent so you can choose again.
        subtract 1 from totalTurns
        subtract 1 from regionTurns
        skip
      else
        set ultimateCharge to 0
        set weaponUsed to true
        subtract 5 from enemyPoise

        if className equals mage
          set dealtDamage to 40
          add heroHit to dealtDamage
          add heroLevel to dealtDamage
          set enemyBurn to 5
          show A greater firestorm covers the field.
        else if className equals archer
          set dealtDamage to 35
          add heroHit to dealtDamage
          add heroSpeed to dealtDamage
          set enemyBleed to 5
          show A thousand arrows hide the sky and fall at once.
        else if className equals cleric
          set dealtDamage to 30
          add heroHit to dealtDamage
          add peaceSpark to dealtDamage
          add peaceSpark to dealtDamage
          set heroLife to maxLife
          set heroPoison to 0
          show The judgement of the goddess cuts the dark and closes every wound.
        else if className equals rogue
          set dealtDamage to 34
          add heroHit to dealtDamage
          add heroSpeed to dealtDamage
          set enemyPoison to 6
          show Shadow execution cuts the enemy's shadow and leaves venom behind.
        else if className equals berserker
          set dealtDamage to 48
          add heroHit to dealtDamage
          add heroHit to dealtDamage
          add 15 to heroLife
          if heroLife is greater than maxLife
            set heroLife to maxLife
          end
          show The fury of the north turns wounds into strength and splits the enemy open.
        else if className equals runesmith
          set dealtDamage to 28
          add heroHit to dealtDamage
          add heroGuard to dealtDamage
          add heroGuard to dealtDamage
          subtract 5 from enemyGuard
          if enemyGuard is less than 0 then set enemyGuard to 0
          add 12 to weaponWear
          add 12 to armourWear
          if weaponWear is greater than weaponMaxWear then set weaponWear to weaponMaxWear
          if armourWear is greater than armourMaxWear then set armourWear to armourMaxWear
          show The anvil of the earth breaks the enemy's armour and reforges your own gear.
        else if className equals bard
          set dealtDamage to 25
          add heroHit to dealtDamage
          add moralePoints to dealtDamage
          subtract 5 from enemyPoise
          set moralePoints to 100
          show The epic of heroes rings across the field and breaks the enemy's will to fight.
        else if className equals druid
          set dealtDamage to 38
          add heroHit to dealtDamage
          add heroLevel to dealtDamage
          set heroLife to maxLife
          set heroPoison to 0
          show The roots of the old forest swallow the enemy and take your wounds back.
        else if className equals warlock
          set dealtDamage to 45
          add heroHit to dealtDamage
          add heroHit to dealtDamage
          add 25 to heroLife
          if heroLife is greater than maxLife then set heroLife to maxLife
          show The bargain of the abyss heals the hero at the cost of the enemy's life.
        else if className equals dragoon
          set dealtDamage to 52
          add heroHit to dealtDamage
          add heroHit to dealtDamage
          set enemyBurn to 4
          show The descent of the red dragon drives down a lance of fire that ignores armour.
        else if className equals chronomancer
          set dealtDamage to 38
          add heroHit to dealtDamage
          add heroSpeed to dealtDamage
          set enemyStun to true
          show In the world held still only the hero moves, and the next turn of the enemy is erased.
        else if className equals gambler
          set firstFateCard to random number from 1 to 6
          set secondFateCard to random number from 1 to 6
          set thirdFateCard to random number from 1 to 6
          say in a box 🎲 The open hand of fate · firstFateCard / secondFateCard / thirdFateCard
          set fateFace to 0
          set fateSettled to 0
          while fateSettled is less than 1
            ask fateCardChoice Which card will you take? first, second, third
            if fateCardChoice equals first
              set fateFace to firstFateCard
              set fateSettled to 1
            else if fateCardChoice equals second
              set fateFace to secondFateCard
              set fateSettled to 1
            else if fateCardChoice equals third
              set fateFace to thirdFateCard
              set fateSettled to 1
            else
              show 🟦 Please type one of the three words exactly.
            end
          end
          set dealtDamage to 20
          set fateExtraDamage to fateFace
          multiply fateExtraDamage by 5
          add fateExtraDamage to dealtDamage
          add heroHit to dealtDamage
          subtract fateFace from enemyPoise
          if fateFace equals 6
            set enemyStun to true
            add 12 to bronzeHeld
            add 1 to gambleWins
            say in a box 🟨 A great success · the six turned fate over
          end
        else
          set dealtDamage to 25
          add heroHit to dealtDamage
          add heroGuard to dealtDamage
          add heroGuard to dealtDamage
          set isGuarding to true
          add 20 to heroLife
          if heroLife is greater than maxLife
            set heroLife to maxLife
          end
          show The guard of the king becomes a huge golden shield and bears the enemy down.
        end

        if skillElement equals enemyWeak
          multiply dealtDamage by weakMultiplier
          set weakFound to true
          add 1 to weakHits
          show The ultimate drives through the enemy's elemental weakness and the damage climbs.
        end
        subtract dealtDamage from enemyLife
        show ultimateName · damage dealtDamage

        if firstUltimateAchievement missing
          set firstUltimateAchievement to true
          append past the limit to achievementList
          show achievement earned · past the limit
        end
      end

    else if actionPick equals skill

      if heroSpirit is less than skillCost
        show 🟦 There is not enough spirit. The turn is not spent so you can choose again.
        subtract 1 from totalTurns
        subtract 1 from regionTurns
        skip
      else
        set skillUsed to true
        set weaponUsed to true
        subtract skillCost from heroSpirit
        add 18 to ultimateCharge
        subtract 2 from enemyPoise

        if className equals mage
          set dealtDamage to random number from 12 to 18
          add heroHit to dealtDamage
          add heroLevel to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1
            set dealtDamage to 1
          end
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 2 from enemyPoise
            set weakFound to true
            add 1 to weakHits
            show The flame weakness is struck, and both the damage and the poise damage climb.
          end
          subtract dealtDamage from enemyLife
          set enemyBurn to 3
          show A fireball bursts for dealtDamage and leaves fire on the enemy.

        else if className equals archer
          set dealtDamage to random number from 4 to 8
          add heroHit to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1
            set dealtDamage to 1
          end
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 2 from enemyPoise
            set weakFound to true
            add 1 to weakHits
            show The pierce weakness is struck, and the first arrow sinks deep past the armour.
          end
          subtract dealtDamage from enemyLife
          show The first arrow drives in for dealtDamage.
          set dealtDamage to random number from 4 to 8
          add heroHit to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1
            set dealtDamage to 1
          end
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
          end
          subtract dealtDamage from enemyLife
          set enemyBleed to 3
          show The second arrow of the rapid shot cuts for dealtDamage and leaves the wound open.

        else if className equals cleric
          set dealtDamage to random number from 8 to 13
          add heroHit to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if enemyTrait equals demon lord
            add peaceSpark to dealtDamage
            add peaceSpark to dealtDamage
          end
          if dealtDamage is less than 1
            set dealtDamage to 1
          end
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 2 from enemyPoise
            set weakFound to true
            add 1 to weakHits
            show The holy weakness gives way to the light, and both the damage and the poise damage climb.
          end
          subtract dealtDamage from enemyLife
          add 10 to heroLife
          if heroLife is greater than maxLife
            set heroLife to maxLife
          end
          set heroPoison to 0
          show Holy light · damage dealtDamage · the poison is washed out of you

        else if className equals rogue
          set dealtDamage to random number from 9 to 15
          add heroHit to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1 then set dealtDamage to 1
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 2 from enemyPoise
            set weakFound to true
            add 1 to weakHits
          end
          subtract dealtDamage from enemyLife
          set enemyPoison to 4
          show The venom dagger sinks in for dealtDamage and leaves poison behind.

        else if className equals berserker
          set dealtDamage to random number from 10 to 16
          add heroHit to dealtDamage
          set halfLife to maxLife
          divide halfLife by 2
          if heroLife is less than halfLife
            add heroHit to dealtDamage
            show Your wounds turn into fury and the damage grows.
          end
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1 then set dealtDamage to 1
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 2 from enemyPoise
            set weakFound to true
            add 1 to weakHits
          end
          subtract dealtDamage from enemyLife
          show The frenzy axe splits armour and flesh together for dealtDamage.

        else if className equals runesmith
          set dealtDamage to random number from 8 to 13
          add heroHit to dealtDamage
          add heroGuard to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1 then set dealtDamage to 1
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 3 from enemyPoise
            set weakFound to true
            add 1 to weakHits
          end
          subtract dealtDamage from enemyLife
          subtract 1 from enemyGuard
          if enemyGuard is less than 0 then set enemyGuard to 0
          add 2 to weaponWear
          if weaponWear is greater than weaponMaxWear then set weaponWear to weaponMaxWear
          show The rune hammer strikes for dealtDamage and mends your weapon while it breaks the armour of the enemy.

        else if className equals bard
          set dealtDamage to random number from 7 to 12
          add heroHit to dealtDamage
          add heroLevel to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1 then set dealtDamage to 1
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 3 from enemyPoise
            set weakFound to true
            add 1 to weakHits
          end
          subtract dealtDamage from enemyLife
          subtract 2 from enemyPoise
          add 4 to moralePoints
          if moralePoints is greater than 100 then set moralePoints to 100
          show The shatter note rings for dealtDamage and shakes the poise of the enemy.

        else if className equals druid
          set dealtDamage to random number from 9 to 14
          add heroHit to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1 then set dealtDamage to 1
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 2 from enemyPoise
            set weakFound to true
            add 1 to weakHits
          end
          subtract dealtDamage from enemyLife
          add 8 to heroLife
          if heroLife is greater than maxLife then set heroLife to maxLife
          set enemyPoison to 2
          show Binding vines squeeze for dealtDamage, and the strength of the herbs gives life back.

        else if className equals warlock
          set dealtDamage to random number from 11 to 17
          add heroHit to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1 then set dealtDamage to 1
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 2 from enemyPoise
            set weakFound to true
            add 1 to weakHits
          end
          subtract dealtDamage from enemyLife
          add 9 to heroLife
          if heroLife is greater than maxLife then set heroLife to maxLife
          show Life drain takes dealtDamage away and returns 9 life.

        else if className equals dragoon
          set dealtDamage to random number from 12 to 18
          add heroHit to dealtDamage
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 3 from enemyPoise
            set weakFound to true
            add 1 to weakHits
          end
          subtract dealtDamage from enemyLife
          set enemyBurn to 2
          show The dragonfire lance ignores guard and runs through for dealtDamage.

        else if className equals chronomancer
          set dealtDamage to random number from 9 to 15
          add heroHit to dealtDamage
          add heroLevel to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1 then set dealtDamage to 1
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 4 from enemyPoise
            set weakFound to true
            add 1 to weakHits
          end
          subtract dealtDamage from enemyLife
          subtract 2 from enemyPoise
          35% chance
            set enemyStun to true
            show The enemy's time freezes and the next strike back is gone.
          end
          show A time rift cuts past and present together for dealtDamage.

        else if className equals gambler
          if nextGreatSure exists
            set fateFace to 6
            set nextGreatSure to false
            set fateMissStreak to 0
            show 🟨 Cover against failure · this die is certain to be a six.
          else
            set fateFace to random number from 1 to 6
            if luckCoinReady exists
              set extraFateFace to random number from 1 to 6
              set luckCoinReady to false
              show 🎲 A weighted coin · the higher of fateFace and extraFateFace is used
              if extraFateFace is greater than fateFace then set fateFace to extraFateFace
            end
          end
          show 🎲 The dice of fate · rolled fateFace / 6 · each face 16.7 percent
          if fateFace equals 1
            set dealtDamage to 1
            subtract 4 from heroLife
            add 1 to fateMissStreak
            add 1 to gambleLosses
            show 🟥 Backfire · damage 1 · 4 life lost
          else if fateFace equals 2
            set dealtDamage to 6
            add heroHit to dealtDamage
            subtract thisEnemyGuard from dealtDamage
            if dealtDamage is less than 1 then set dealtDamage to 1
            add 1 to fateMissStreak
            add 1 to gambleLosses
            show 🟥 A low roll · weak damage dealtDamage
          else if fateFace equals 3
            set dealtDamage to 10
            add heroHit to dealtDamage
            subtract thisEnemyGuard from dealtDamage
            set fateMissStreak to 0
            show 🟦 An even roll · damage dealtDamage
          else if fateFace equals 4
            set dealtDamage to 16
            add heroHit to dealtDamage
            subtract thisEnemyGuard from dealtDamage
            subtract 1 from enemyPoise
            set fateMissStreak to 0
            show 🟩 A high roll · damage dealtDamage · extra poise damage
          else if fateFace equals 5
            set dealtDamage to 21
            add heroHit to dealtDamage
            subtract thisEnemyGuard from dealtDamage
            add 7 to heroLife
            if heroLife is greater than maxLife then set heroLife to maxLife
            set fateMissStreak to 0
            add 1 to gambleWins
            show 🟨 A big success · damage dealtDamage · 7 life back
          else
            set dealtDamage to 30
            add heroHit to dealtDamage
            subtract thisEnemyGuard from dealtDamage
            subtract 4 from enemyPoise
            add 6 to bronzeHeld
            set fateMissStreak to 0
            add 1 to gambleWins
            say in a box 🟨 A great success · damage dealtDamage · poise 4 · 6 bronze
          end
          if fateMissStreak is greater than 1
            set nextGreatSure to true
            show 🟨 Two low rolls in a row. The next skill is certain to be a six.
          end
          subtract dealtDamage from enemyLife

        else
          set dealtDamage to random number from 7 to 11
          add heroGuard to dealtDamage
          subtract thisEnemyGuard from dealtDamage
          if dealtDamage is less than 1
            set dealtDamage to 1
          end
          if skillElement equals enemyWeak
            multiply dealtDamage by weakMultiplier
            subtract 2 from enemyPoise
            set weakFound to true
            add 1 to weakHits
            show Your shield breaks the impact weakness open, and both the damage and the poise damage climb.
          end
          subtract dealtDamage from enemyLife
          add 7 to heroLife
          if heroLife is greater than maxLife
            set heroLife to maxLife
          end
          set isGuarding to true
          show The shield bash pushes back for dealtDamage and closes the front again.
        end
      end


    # ── Items ───────────────────────────────────────────────────────

    else if actionPick equals potion
      if potionCount is greater than 0
        subtract 1 from potionCount
        add potionHeal to heroLife
        if heroLife is greater than maxLife
          set heroLife to maxLife
        end
        set heroPoison to 0
        show A warm potion gives life back and washes the poison out.
      else
        show Only empty bottles roll about.
        set actionSpends to false
      end

    else if actionPick equals strongpotion
      if strongPotionCount is greater than 0
        subtract 1 from strongPotionCount
        add strongPotionHeal to heroLife
        if heroLife is greater than maxLife then set heroLife to maxLife
        set heroPoison to 0
        show A strong potion of red crystal closes deep wounds and clears poison at once.
      else
        show There is no strong potion left.
        set actionSpends to false
      end

    else if actionPick equals tonic
      if tonicCount is greater than 0
        subtract 1 from tonicCount
        add tonicRestore to heroSpirit
        if heroSpirit is greater than maxSpirit
          set heroSpirit to maxSpirit
        end
        show Strength runs back out to your fingertips.
      else
        show There is no tonic left.
        set actionSpends to false
      end

    else if actionPick equals antidote
      if antidoteCount is greater than 0
        subtract 1 from antidoteCount
        set heroPoison to 0
        add 5 to heroLife
        if heroLife is greater than maxLife then set heroLife to maxLife
        show The bitter antidote washes out the poison and gives back 5 life.
      else
        show There is no antidote left.
        set actionSpends to false
      end

    else if actionPick equals bomb
      if bombCount is greater than 0
        subtract 1 from bombCount
        set dealtDamage to bombPower
        subtract 4 from enemyPoise
        if enemyWeak equals impact
          multiply dealtDamage by weakMultiplier
          set weakFound to true
          add 1 to weakHits
          show The blast breaks the impact weakness exactly open.
        end
        subtract dealtDamage from enemyLife
        show The bomb goes through the enemy's guard and bursts for dealtDamage.
        if enemyTrait equals armour
          subtract 2 from enemyGuard
          if enemyGuard is less than 0
            set enemyGuard to 0
          end
          show The golem's stone armour broke along with it.
        end
      else
        show There is no bomb left to throw.
        set actionSpends to false
      end

    else if actionPick equals holywater
      if holyWaterCount is greater than 0
        subtract 1 from holyWaterCount
        set dealtDamage to 38
        if enemyWeak equals holy
          multiply dealtDamage by weakMultiplier
          subtract 3 from enemyPoise
          set weakFound to true
          add 1 to weakHits
        end
        subtract dealtDamage from enemyLife
        set enemyBurn to 2
        show Blessed holy water ignores guard and burns for dealtDamage.
      else
        show There is no holy water left.
        set actionSpends to false
      end

    else if actionPick equals smoke
      if smokeCount is greater than 0
        subtract 1 from smokeCount
        set inSmoke to true
        subtract 1 from enemyPoise
        show Grey smoke covers the field and the next strike back loses its target.
      else
        show There is no smoke bomb left.
        set actionSpends to false
      end

    else if actionPick equals whetstone
      if whetstoneCount is greater than 0
        subtract 1 from whetstoneCount
        add 18 to weaponWear
        if weaponWear is greater than weaponMaxWear then set weaponWear to weaponMaxWear
        add 8 to ultimateCharge
        show A battle whetstone puts the edge back and returns both wear and focus.
      else
        show There is no whetstone left.
        set actionSpends to false
      end

    # A weighted coin bends the next roll of chance your way.
    # The gambler rolls twice and keeps the higher face; every other class lands a certain critical hit.
    else if actionPick equals luckcoin
      if luckCoinCount is greater than 0
        subtract 1 from luckCoinCount
        if className equals gambler
          set luckCoinReady to true
          show 🟨 The next dice of fate is rolled twice and the higher face is used.
        else
          set nextCritSure to true
          show 🟨 The next plain attack is certain to be a critical hit.
        end
        # A tool you ready costs you no strike back.
        set actionSpends to false
      else
        show There is no luck coin left.
        set actionSpends to false
      end

    # All six results of the chaos die are equally likely, and you may look at them before spending one.
    else if actionPick equals chaosdie
      if chaosRolls is greater than 0
        subtract 1 from chaosRolls
        set chaosFace to random number from 1 to 6
        show 🎲 The chaos die · each result 16.7 percent · rolled chaosFace
        if chaosFace equals 1
          subtract 8 from heroLife
          if heroLife is less than 1 then set heroLife to 1
          add 1 to gambleLosses
          show 🟥 The rift bites your hand and 8 life is gone.
        else if chaosFace equals 2
          set spiritLost to 4
          if heroSpirit is less than spiritLost then set spiritLost to heroSpirit
          subtract spiritLost from heroSpirit
          add 1 to gambleLosses
          show 🟥 The die swallowed spiritLost of your spirit.
        else if chaosFace equals 3
          add 14 to heroLife
          if heroLife is greater than maxLife then set heroLife to maxLife
          show 🟩 You got 14 life back.
        else if chaosFace equals 4
          add 10 to heroSpirit
          if heroSpirit is greater than maxSpirit then set heroSpirit to maxSpirit
          show 🟦 You got 10 spirit back.
        else if chaosFace equals 5
          subtract 24 from enemyLife
          add 1 to gambleWins
          show 🟨 You dealt 24 fate damage, straight past any guard.
        else
          subtract 42 from enemyLife
          subtract 4 from enemyPoise
          add 1 to gambleWins
          say in a box 🟨 A great chaos success · damage 42 · poise 4
        end
      else
        show There is no chaos die left.
        set actionSpends to false
      end


    # ── Guarding, reading the enemy, pulling back ──────────────────

    else if actionPick equals guard
      set isGuarding to true
      add 3 to heroSpirit
      add 20 to ultimateCharge
      if heroSpirit is greater than maxSpirit
        set heroSpirit to maxSpirit
      end
      show You set your feet and gather your strength.

    else if actionPick equals look
      set weakFound to true
      show the trait of enemyName is enemyTrait
      show the enemy's weakness is enemyWeak · poise is enemyPoise
      show enemyBlurb
      if enemyTrait equals thorns
        show A strong skill comes partly back off the mirror shield. Plain attacks and bombs are safe.
      else if enemyTrait equals armour
        show Its guard is very high. A bomb ignores guard and breaks stone armour too.
      else if enemyTrait equals regrowth
        show It heals every turn. Keep up with burn and bleeding.
      else if enemyTrait equals gamble
        show Lemar's own skill is 1 and 2 backfire, 3 and 4 even, 5 and 6 loaded. Each pair is 33.3 percent.
      else if enemyTrait equals demon lord
        show As its life falls, its shape and the way it attacks change twice.
      else if enemyTrait equals abyss
        show It breathes in a way that swallows ultimate charge. Poise breaks and the time element are the keys.
      end
      show 🎲 Open odds · critical 14 percent · dodge battleSpeed percent · ally help allyHelpChance percent
      show The chaos die · 1 and 2 against you / 3 and 4 healing / 5 and 6 attack · 16.7 percent each
      if className equals gambler
        show The dice of fate · 1 to 6 at 16.7 percent each · after two low rolls the next six is certain
      end
      set actionSpends to false

    else if actionPick equals retreat
      if regionNumber is greater than 11
        show Behind the throne there is only wall. The fight has to end here.
      else
        set fleeRoll to random number from 1 to 100
        if fleeRoll is less than or equal to baseFleeChance
          if bronzeHeld is greater than or equal to 10
            subtract 10 from bronzeHeld
            add 12 to heroLife
            add 5 to heroSpirit
            if heroLife is greater than maxLife
              set heroLife to maxLife
            end
            if heroSpirit is greater than maxSpirit
              set heroSpirit to maxSpirit
            end
            set enemyLife to enemyMaxLife
            set enemyBurn to 0
            set enemyBleed to 0
            set enemyPoise to enemyMaxPoise
            show You paid 1 silver and fell back to the guild camp. The enemy healed fully as well.
            skip
          else
            show You do not have the 1 silver the camp costs, so you cannot fall back.
          end
        else
          show The enemy cut you off first.
        end
      end


    # ── The plain attack ────────────────────────────────────────────
    # Only \`attack\`, having passed the check above, reaches this branch.

    else
      set weaponUsed to true
      set dealtDamage to random number from 5 to 10
      add heroHit to dealtDamage
      subtract thisEnemyGuard from dealtDamage
      subtract 1 from enemyPoise
      add 12 to ultimateCharge
      if nextCritSure exists
        set critRoll to 0
        set nextCritSure to false
      else
        set critRoll to random number from 1 to 100
      end
      if critRoll is less than or equal to critChance
        multiply dealtDamage by 2
        show The royal seal shines and you strike the opening exactly.
      end
      if dealtDamage is less than 1
        set dealtDamage to 1
      end
      subtract dealtDamage from enemyLife
      show weaponName cuts for dealtDamage.
    end

    # Using an item you do not have, or looking, returns to the same screen without spending a turn.
    if actionSpends missing
      subtract 1 from totalTurns
      subtract 1 from regionTurns
      skip
    end


    # Attacks and skills wear a weapon down. At 0 wear a plain attack is weaker until it is repaired.
    if weaponUsed exists
      subtract 1 from weaponWear
      if weaponWear is less than 0 then set weaponWear to 0
      if weaponWear equals 0
        add 3 to enemyLife
        if enemyLife is greater than enemyLifeBefore then set enemyLife to enemyLifeBefore
        show Your blade has gone blunt, and 3 of this damage never landed.
      end
    end


    # ── Ultimate charge and achievements ───────────────────────────

    if ultimateCharge is greater than ultimateFull
      set ultimateCharge to ultimateFull
    end

    if weakFound exists
      if firstWeakAchievement missing
        set firstWeakAchievement to true
        append weakness hunter to achievementList
        show achievement earned · weakness hunter
      end
    end


    # ── An ally lends a hand ────────────────────────────────────────
    # One of the allies you recruited helps, by chance, in the way that suits them.

    set allyCount to how many allyList
    set helpRoll to random number from 1 to 100
    if allyCount is greater than 0
      if helpRoll is less than or equal to allyHelpChance
        # It picks again until it lands on somebody actually recruited, so the posted odds hold.
        set helperSeek to 0
        while helperSeek is less than 1
          set helperName to pick from Rianel or Brum or Serin or Adela or Kyle or Aurel or Isabel or Darion or Neria or Lucian
          if allyList contains helperName then set helperSeek to 1
        end

        if helperName equals Rianel
          set helpDamage to 6
          add heroLevel to helpDamage
          subtract helpDamage from enemyLife
          show Rianel's covering fire · damage helpDamage
        else if helperName equals Brum
          subtract 2 from enemyPoise
          show Brum's rune hammer shakes the enemy's poise by 2.
        else if helperName equals Serin
          add 4 to heroSpirit
          if heroSpirit is greater than maxSpirit then set heroSpirit to maxSpirit
          show Serin sends power across and fills 4 spirit.
        else if helperName equals Adela
          add 8 to heroLife
          if heroLife is greater than maxLife then set heroLife to maxLife
          set heroPoison to 0
          show Adela's healing prayer returns 8 life and clears the poison.
        else if helperName equals Kyle
          set isGuarding to true
          show Kyle raises his shield and blocks this strike with you.
        else if helperName equals Aurel
          set helpDamage to 12
          subtract helpDamage from enemyLife
          show Aurel's golden fire · damage helpDamage
        else if helperName equals Isabel
          add 8 to bronzeHeld
          add 3 to moralePoints
          if moralePoints is greater than 100 then set moralePoints to 100
          show Isabel resells the enemy's supplies for 8 bronze and lifts your spirits.
        else if helperName equals Darion
          set isGuarding to true
          add 6 to ultimateCharge
          show Darion's northern shield wall stops the strike and sharpens your focus.
        else if helperName equals Neria
          set heroPoison to 0
          add 6 to heroLife
          if heroLife is greater than maxLife then set heroLife to maxLife
          show Neria's herb smoke clears the poison and returns 6 life.
        else
          set helpDamage to 10
          subtract helpDamage from enemyLife
          subtract 1 from enemyPoise
          show Lucian's sun blade deals 10 damage and breaks poise.
        end
      end
    end


    # With its poise gone, the enemy cannot act this turn.
    if enemyPoise is less than 1
      set enemyStun to true
      set enemyIntent to stunned
      add 1 to poiseBreaks
      draw a line
      show The poise of enemyName has broken. It skips this strike back.
      draw a line
      if firstPoiseAchievement missing
        set firstPoiseAchievement to true
        append poise breaker to achievementList
        show achievement earned · poise breaker
      end
    end


    # ── What is still working on the enemy ─────────────────────────

    if enemyBurn is greater than 0
      subtract 1 from enemyBurn
      subtract burnDamage from enemyLife
      show The fire still on it burns for burnDamage more.
    end

    if enemyBleed is greater than 0
      subtract 1 from enemyBleed
      subtract bleedDamage from enemyLife
      show The deep wound opens bleedDamage further.
    end

    if enemyPoison is greater than 0
      subtract 1 from enemyPoison
      subtract poisonDamage from enemyLife
      show The venom eats poisonDamage of the enemy's life from the inside.
    end


    # ── What a thorns enemy does ───────────────────────────────────

    if enemyTrait equals thorns
      if skillUsed exists
        set thornDamage to 5
        subtract thornDamage from heroLife
        show Edric's mirror shield throws the skill back for thornDamage.
      end
    end

    # Thorn damage can fell both at once, so this is judged first — no winning while dead.
    if heroLife is less than 1
      if wardRuneHeld exists
        if wardRuneUsed missing
          set wardRuneUsed to true
          set heroLife to 24
          set heroSpirit to 8
          set heroPoison to 0
          show Brum's ward rune saved the hero from the damage thrown back.
        else
          set battleResult to fallen
          set endingKind to fallen
          break
        end
      else
        set battleResult to fallen
        set endingKind to fallen
        break
      end
    end


    # If the enemy has fallen, it never gets its turn to strike back.
    if enemyLife is less than 1
      draw a line
      show enemyName has fallen
      set battleResult to won
      break
    end


    # ── The Demon Lord changes shape ────────────────────────────────

    if enemyTrait equals demon lord
      if demonLordPhase equals 1
        if enemyLife is less than 150
          set demonLordPhase to 2
          add 3 to enemyHit
          draw a line
          show Morgar's black armour splits and huge demon wings open out.
          show This is the second shape, whose demon fire burns spirit as well.
          draw a line
        end
      else if demonLordPhase equals 2
        if enemyLife is less than 70
          set demonLordPhase to 3
          add 4 to enemyHit
          set heroPoison to 3
          draw a line
          show Morgar shatters the throne and shows the horned archdemon underneath.
          show The goddess's holy flame flares one last time.
          draw a line
        end
      end
    end


    # ════════════════════════════════════════════════════════════════
    # The enemy strikes back
    # The shared damage is worked out first, then each enemy's trait adds its own move.
    # ════════════════════════════════════════════════════════════════

    set takenDamage to random number from 3 to 8
    add enemyHit to takenDamage
    subtract heroGuard from takenDamage
    if enemyIntent equals heavy blow
      add 5 to takenDamage
    end

    if isGuarding exists
      subtract heroGuard from takenDamage
      subtract 3 from takenDamage
    end

    # Speed is the dodge chance itself. With its poise broken the enemy cannot attack at all.
    set dodgeRoll to random number from 1 to 100
    set wasDodged to false
    if dodgeRoll is less than or equal to battleSpeed
      set wasDodged to true
    end
    if enemyStun exists
      set wasDodged to true
    end
    if inSmoke exists
      set wasDodged to true
    end

    if wasDodged exists
      if enemyStun exists
        show enemyName lost its poise and cannot act at all
      else
        show Where the enemy lunged there is nothing but scattered dust.
      end
    else
      if armourWear equals 0
        add 3 to takenDamage
      end
      if takenDamage is less than 1
        set takenDamage to 1
      end
      subtract takenDamage from heroLife
      subtract 1 from armourWear
      if armourWear is less than 0 then set armourWear to 0
      add 10 to ultimateCharge
      show enemyName · strikes back and takes takenDamage of your life

      # Gardum the orc warchief plunders whenever a blow lands.
      if enemyTrait equals plunder
        if enemyIntent equals its own skill
          set stolenCoin to 4
          if bronzeHeld is less than stolenCoin
            set stolenCoin to bronzeHeld
          end
          subtract stolenCoin from bronzeHeld
          add stolenCoin to enemyRewardBronze
          show The enemy took stolenCoin bronze. You get it back when you win.
        end
      end

      # The curse of Morvel the dark wizard stays as poison.
      if enemyTrait equals poison
        if enemyIntent equals its own skill
          40% chance
            set heroPoison to 3
            show Black letters spread under your skin. The poison stays for three turns.
          end
        end
      end

      # Barkas the black dragon turns the wounds he takes into life.
      if enemyTrait equals drain
        if enemyIntent equals its own skill
          add 5 to enemyLife
          if enemyLife is greater than enemyMaxLife
            set enemyLife to enemyMaxLife
          end
          show Barkas takes 5 life back with blood magic.
        end
      end

      # The Demon Lord's second shape takes spirit; the third takes life as well.
      if enemyTrait equals demon lord
        if enemyIntent equals its own skill
          if demonLordPhase equals 2
            set spiritStolen to 3
            if heroSpirit is less than spiritStolen
              set spiritStolen to heroSpirit
            end
            subtract spiritStolen from heroSpirit
            show Demon fire burns spiritStolen of your spirit.
          else if demonLordPhase equals 3
            set extraDamage to 4
            subtract extraDamage from heroLife
            show The archdemon's tail runs through your armour for extraDamage more.
          end
        end
      end

      # On its own skill the hidden boss eats the ultimate power you saved.
      if enemyTrait equals abyss
        if enemyIntent equals its own skill
          set chargeStolen to 20
          if ultimateCharge is less than chargeStolen
            set chargeStolen to ultimateCharge
          end
          subtract chargeStolen from ultimateCharge
          show Nox's abyssal breath swallows chargeStolen of your ultimate charge.
        end
      end
    end


    # ── The move each enemy makes once more ───────────────────────

    if enemyTrait equals momentum
      if enemyIntent equals its own skill
        add 1 to enemyHit
        show Skrak calls his goblins up and the pace rises. The next attack will be fiercer.
      end
    else if enemyTrait equals regrowth
      if enemyIntent equals its own skill
        add 6 to enemyLife
        if enemyLife is greater than enemyMaxLife
          set enemyLife to enemyMaxLife
        end
        show Borga's troll blood closes the wounds and takes 6 life back.
      end
    else if enemyTrait equals armour
      if enemyIntent equals its own skill
        30% chance
          add 1 to enemyGuard
          show A new layer grows over the broken armour of enemyName and its guard rises again.
        end
      end
    else if enemyTrait equals gamble
      if enemyIntent equals its own skill
        set lemarFace to random number from 1 to 6
        show 🎲 Lemar's golden dice · rolled lemarFace / 6
        if lemarFace is less than or equal to 2
          subtract 10 from enemyLife
          subtract 2 from enemyPoise
          show 🟩 The rigged mechanism backfires: Lemar takes 10 damage and 2 poise damage.
        else if lemarFace is less than or equal to 4
          show 🟦 An even face, with no effect at all.
        else
          set boostDamage to 5
          subtract boostDamage from heroLife
          show 🟥 A high face · you took 5 extra damage, straight past your guard.
        end
      end
    end

    # A stun lasts one turn only, and poise fills back up.
    if enemyStun exists
      set enemyStun to false
      set enemyPoise to enemyMaxPoise
    end

    if ultimateCharge is greater than ultimateFull
      set ultimateCharge to ultimateFull
    end


    # ── The poison still in the hero ───────────────────────────────

    if heroPoison is greater than 0
      subtract 1 from heroPoison
      subtract poisonDamage from heroLife
      show The poison left in you eats poisonDamage of your life.
    end


    # ── Falling, and the one rescue Brum's ward rune gives ─────────

    if heroLife is less than 1
      if wardRuneHeld exists
        if wardRuneUsed missing
          set wardRuneUsed to true
          set heroLife to 24
          set heroSpirit to 8
          set heroPoison to 0
          draw a line
          show The ward rune Brum cut breaks apart and gives your life back once.
          draw a line
        else
          set battleResult to fallen
          if demonLordSlain exists
            set endingKind to sacrifice
          else
            set endingKind to fallen
          end
          break
        end
      else
        set battleResult to fallen
        if demonLordSlain exists
          set endingKind to sacrifice
        else
          set endingKind to fallen
        end
        break
      end
    end

  end


  # ── After leaving the fight loop ─────────────────────────────────

  if battleResult equals fallen
    break
  end


  # ── The moment the Demon Lord and the hidden boss fall ───────────

  if enemyTrait equals demon lord
    put enemyName at 1 in enemiesFelled
    add enemyRewardBronze to bronzeHeld
    set demonLordSlain to true
    put demonlord at done in questBoard
    append demon lord hunter to achievementList
    draw a line
    show Morgar the Demon Lord has fallen. The war of the kingdom is over.
    draw a line

    # With high hope and five allies or more, the rift in the world opens.
    set allyCount to how many allyList
    set hiddenPathOpen to false
    if hopeScore is greater than 7
      if allyCount is greater than 4
        set hiddenPathOpen to true
      end
    end

    if hiddenPathOpen exists
      story:

        A black rift opens under the Demon Lord's throne.
        Your allies say it has to be sealed now, before something older than Morgar wakes.
        The kingdom's peace is already won. Past this door is a last trial, for the prepared alone.

      end
      set hiddenPathOptions to list of enter, back
      set hiddenPathSettled to 0
      while hiddenPathSettled is less than 1
        ask hiddenPathChoice Will you step into the rift in the world? enter, back
        if hiddenPathOptions contains hiddenPathChoice
          set hiddenPathSettled to 1
        else
          show 🟦 Please type enter or back.
        end
      end
      if hiddenPathChoice equals enter
        set regionNumber to 13
        set deepestRegion to 13
        skip
      end
    end

    set endingKind to peace
    break
  end

  if enemyTrait equals abyss
    put enemyName at 1 in enemiesFelled
    add enemyRewardBronze to bronzeHeld
    set charmNumber to 4
    set charmName to the abyss shard of Nox
    set hiddenBossWin to true
    append conqueror of the abyss to achievementList
    set endingKind to wholepeace
    break
  end


  # ── The reward for winning, and the record of what you felled ────

  add enemyRewardBronze to bronzeHeld
  add enemyExp to heroExp
  add 1 to peaceSpark
  add 1 to fateSealCount
  add 2 to fameLevel
  show You took spoils worth enemyRewardBronze bronze and enemyExp experience
  show The spark of peace has brightened to peaceSpark
  show 🟨 You gained one fate seal from the region's master. You now have fateSealCount

  if enemiesFelled contains enemyName
    set felledBefore to enemyName in enemiesFelled
    add 1 to felledBefore
    put enemyName at felledBefore in enemiesFelled
  else
    put enemyName at 1 in enemiesFelled
  end


  # ── Material spoils ──────────────────────────────────────────────
  # Which materials drop depends on the region. They are spent in the camp's crafting menu.

  set materialCount to random number from 1 to 2
  if regionNumber is less than or equal to 2
    add materialCount to herbCount
    add 1 to clothCount
    show You found materialCount herbs and 1 tough cloth
  else if regionNumber is less than or equal to 4
    add materialCount to ironCount
    add 1 to dustCount
    show You gained materialCount iron ore and 1 magic dust
  else if regionNumber is less than or equal to 6
    add materialCount to dustCount
    add 1 to crystalCount
    show You gathered materialCount magic dust and 1 magic crystal
  else if regionNumber is less than or equal to 8
    add materialCount to hideCount
    add 1 to clothCount
    show You gained materialCount hides and 1 tough cloth
  else if regionNumber is less than or equal to 10
    add materialCount to herbCount
    add 1 to hideCount
    show You gained materialCount herbs and 1 hide
  else
    add 1 to scaleCount
    add 1 to crystalCount
    show You gained 1 dragon scale and 1 magic crystal
  end

  if bronzeHeld is greater than 99
    if richAchievement missing
      set richAchievement to true
      append first gold to achievementList
      show achievement earned · first gold
    end
  end


  # ── Levelling up ─────────────────────────────────────────────────
  # Every time you pass the experience needed, you pick one ability yourself.

  while heroExp is greater than or equal to nextExp
    subtract nextExp from heroExp
    add 1 to heroLevel
    add 8 to nextExp
    draw a line
    show heroName is now level heroLevel
    set growthOptions to list of life, hit, guard, spirit, speed
    set growthSettled to 0
    while growthSettled is less than 1
      ask growthChoice What will you train? life, hit, guard, spirit, speed
      if growthOptions contains growthChoice
        set growthSettled to 1
      else
        show 🟦 Please type one of the five abilities again.
      end
    end
    if growthChoice equals hit
      add 3 to heroHit
      show The hand holding your weapon never shakes. Your hit went up.
    else if growthChoice equals guard
      add 2 to heroGuard
      show Your stance has grown solid. Your guard went up.
    else if growthChoice equals spirit
      add 5 to maxSpirit
      set heroSpirit to maxSpirit
      show You can hold the spark of peace longer. Your spirit went up.
    else if growthChoice equals speed
      add 4 to heroSpeed
      show You see first and move first now. Your speed went up.
    else
      add 10 to maxLife
      set heroLife to maxLife
      show You can stand longer. Your greatest life went up.
    end
    set heroLife to maxLife
    draw a line
  end


  # ── A regional economy that moves ───────────────────────────────
  # A real price is the base plus war risk plus freight, less the trader's regard for you.
  # Goods are cheap where they are made, and every purchase thins the stock and lifts the price a little.

  set freightCost to regionNumber
  add warRisk to freightCost
  set traderDiscount to traderStanding
  if traderDiscount is greater than 15 then set traderDiscount to 15
  if charmNumber equals 2 then add 8 to traderDiscount

  set potionPrice to potionBasePrice
  add freightCost to potionPrice
  subtract traderDiscount from potionPrice
  set strongPotionPrice to strongPotionBasePrice
  add freightCost to strongPotionPrice
  subtract traderDiscount from strongPotionPrice
  set tonicPrice to tonicBasePrice
  add freightCost to tonicPrice
  subtract traderDiscount from tonicPrice
  set antidotePrice to antidoteBasePrice
  add freightCost to antidotePrice
  subtract traderDiscount from antidotePrice
  set bombPrice to bombBasePrice
  add freightCost to bombPrice
  subtract traderDiscount from bombPrice
  set holyWaterPrice to holyWaterBasePrice
  add freightCost to holyWaterPrice
  subtract traderDiscount from holyWaterPrice
  set smokePrice to smokeBasePrice
  add freightCost to smokePrice
  subtract traderDiscount from smokePrice
  set whetstonePrice to whetstoneBasePrice
  add freightCost to whetstonePrice
  subtract traderDiscount from whetstonePrice
  set rationPrice to rationBasePrice
  add freightCost to rationPrice
  subtract traderDiscount from rationPrice

  # Herbs come from the forest, ore from the mine, and the free city moves everything, so those goods are cheaper there.
  if regionNumber equals 2
    subtract 8 from potionPrice
    subtract 6 from antidotePrice
  else if regionNumber equals 3
    subtract 12 from bombPrice
    subtract 8 from whetstonePrice
  else if regionNumber equals 8
    subtract 6 from potionPrice
    subtract 6 from tonicPrice
    subtract 6 from rationPrice
  else if regionNumber equals 9
    add 10 to rationPrice
  end

  if potionPrice is less than 8 then set potionPrice to 8
  if strongPotionPrice is less than 20 then set strongPotionPrice to 20
  if tonicPrice is less than 12 then set tonicPrice to 12
  if antidotePrice is less than 8 then set antidotePrice to 8
  if bombPrice is less than 25 then set bombPrice to 25
  if holyWaterPrice is less than 20 then set holyWaterPrice to 20
  if smokePrice is less than 12 then set smokePrice to 12
  if whetstonePrice is less than 10 then set whetstonePrice to 10
  if rationPrice is less than 6 then set rationPrice to 6

  set marketPotionStock to random number from 3 to 6
  set marketStrongStock to random number from 1 to 3
  set marketTonicStock to random number from 2 to 5
  set marketToolStock to random number from 2 to 5
  set marketRationStock to random number from 3 to 7

  if screenNumber equals 1 then clear the screen
  set titleBoard to Lowen's travelling company
  do drawSmallTitle with titleBoard
  show war risk warRisk · freight freightCost · trader standing traderStanding · discount traderDiscount
  show potion potionPrice · strongpotion strongPotionPrice · tonic tonicPrice · antidote antidotePrice
  show bomb bombPrice · holywater holyWaterPrice · smoke smokePrice · whetstone whetstonePrice · rations rationPrice
  show what you carry
  do showMoney with bronzeHeld

  set shopOpen to 1
  while shopOpen is greater than 0
    draw a line
    show 🧪 medicine · potion / strongpotion / tonic / antidote
    show ⚒ tools · bomb / holywater / smoke / whetstone / rations
    show 🛡 gear · repair / forgeweapon / forgearmour / charm
    show 🎲 fate · fatedraw / fatetrade · seals fateSealCount · shards fateShardCount
    show 📦 other · sell / leave
    ask buyChoice Type exactly the name of what you want
    set tradeWins to false

    if buyChoice equals potion
      if marketPotionStock is greater than 0
        if bronzeHeld is greater than or equal to potionPrice
          subtract potionPrice from bronzeHeld
          add 1 to potionCount
          subtract 1 from marketPotionStock
          add 2 to potionPrice
          set tradeWins to true
          show You bought a potion. Stock left marketPotionStock
        else
          show You do not have enough money.
        end
      else
        show There are no potions in stock.
      end
    else if buyChoice equals strongpotion
      if marketStrongStock is greater than 0
        if bronzeHeld is greater than or equal to strongPotionPrice
          subtract strongPotionPrice from bronzeHeld
          add 1 to strongPotionCount
          subtract 1 from marketStrongStock
          add 4 to strongPotionPrice
          set tradeWins to true
          show You bought a strong potion. Stock left marketStrongStock
        else
          show You do not have enough money.
        end
      else
        show There are no strong potions in stock.
      end
    else if buyChoice equals tonic
      if marketTonicStock is greater than 0
        if bronzeHeld is greater than or equal to tonicPrice
          subtract tonicPrice from bronzeHeld
          add 1 to tonicCount
          subtract 1 from marketTonicStock
          add 3 to tonicPrice
          set tradeWins to true
          show You bought a tonic. Stock left marketTonicStock
        else
          show You do not have enough money.
        end
      else
        show There are no tonics in stock.
      end
    else if buyChoice equals antidote
      if marketToolStock is greater than 0
        if bronzeHeld is greater than or equal to antidotePrice
          subtract antidotePrice from bronzeHeld
          add 1 to antidoteCount
          subtract 1 from marketToolStock
          set tradeWins to true
          show You bought an antidote.
        else
          show You do not have enough money.
        end
      else
        show There are no tools in stock.
      end
    else if buyChoice equals bomb
      if marketToolStock is greater than 0
        if bronzeHeld is greater than or equal to bombPrice
          subtract bombPrice from bronzeHeld
          add 1 to bombCount
          subtract 1 from marketToolStock
          add 5 to bombPrice
          set tradeWins to true
          show You bought a bomb.
        else
          show You do not have enough money.
        end
      else
        show There are no tools in stock.
      end
    else if buyChoice equals holywater
      if marketToolStock is greater than 0
        if bronzeHeld is greater than or equal to holyWaterPrice
          subtract holyWaterPrice from bronzeHeld
          add 1 to holyWaterCount
          subtract 1 from marketToolStock
          set tradeWins to true
          show You bought holy water.
        else
          show You do not have enough money.
        end
      else
        show There are no tools in stock.
      end
    else if buyChoice equals smoke
      if marketToolStock is greater than 0
        if bronzeHeld is greater than or equal to smokePrice
          subtract smokePrice from bronzeHeld
          add 1 to smokeCount
          subtract 1 from marketToolStock
          set tradeWins to true
          show You bought a smoke bomb.
        else
          show You do not have enough money.
        end
      else
        show There are no tools in stock.
      end
    else if buyChoice equals whetstone
      if marketToolStock is greater than 0
        if bronzeHeld is greater than or equal to whetstonePrice
          subtract whetstonePrice from bronzeHeld
          add 1 to whetstoneCount
          subtract 1 from marketToolStock
          set tradeWins to true
          show You bought a whetstone.
        else
          show You do not have enough money.
        end
      else
        show There are no tools in stock.
      end
    else if buyChoice equals rations
      if marketRationStock is greater than 0
        if bronzeHeld is greater than or equal to rationPrice
          subtract rationPrice from bronzeHeld
          add 1 to rationCount
          subtract 1 from marketRationStock
          add 2 to rationPrice
          set tradeWins to true
          show You bought a bundle of dried meat and dark bread.
        else
          show You do not have enough money.
        end
      else
        show There are no rations in stock.
      end

    else if buyChoice equals sell
      ask sellChoice herb, iron, dust, scale, cloth, crystal, hide, cancel
      set saleValue to 0
      if sellChoice equals herb
        if herbCount is greater than 0
          subtract 1 from herbCount
          set saleValue to 8
        end
      else if sellChoice equals iron
        if ironCount is greater than 0
          subtract 1 from ironCount
          set saleValue to 12
        end
      else if sellChoice equals dust
        if dustCount is greater than 0
          subtract 1 from dustCount
          set saleValue to 17
        end
      else if sellChoice equals scale
        if scaleCount is greater than 0
          subtract 1 from scaleCount
          set saleValue to 45
        end
      else if sellChoice equals cloth
        if clothCount is greater than 0
          subtract 1 from clothCount
          set saleValue to 10
        end
      else if sellChoice equals crystal
        if crystalCount is greater than 0
          subtract 1 from crystalCount
          set saleValue to 30
        end
      else if sellChoice equals hide
        if hideCount is greater than 0
          subtract 1 from hideCount
          set saleValue to 14
        end
      end
      if saleValue is greater than 0
        # Ordinary division in sentence syntax can produce a fraction.
        # The save code only holds whole numbers, so the whole part is taken by repeated subtraction.
        set riskLeft to warRisk
        set dangerPay to 0
        while riskLeft is greater than 2
          subtract 3 from riskLeft
          add 1 to dangerPay
        end
        add dangerPay to saleValue
        add saleValue to bronzeHeld
        set tradeWins to true
        show The war makes the material wanted, so you were paid saleValue bronze.
      else
        show You have nothing to sell, or you called the trade off.
      end

    else if buyChoice equals repair
      set weaponHurt to weaponMaxWear
      subtract weaponWear from weaponHurt
      set armourHurt to armourMaxWear
      subtract armourWear from armourHurt
      set repairPrice to weaponHurt
      add armourHurt to repairPrice
      add repairBasePrice to repairPrice
      subtract traderDiscount from repairPrice
      if className equals runesmith then subtract 15 from repairPrice
      if repairPrice is less than 5 then set repairPrice to 5
      show repairPrice bronze repairs both pieces of gear completely
      if bronzeHeld is greater than or equal to repairPrice
        subtract repairPrice from bronzeHeld
        set weaponWear to weaponMaxWear
        set armourWear to armourMaxWear
        add 1 to repairCount
        set tradeWins to true
        show Lowen's repairer worked over every crack.
        if firstRepairAchievement missing
          set firstRepairAchievement to true
          append the sword reforged to achievementList
          show achievement earned · the sword reforged
        end
      else
        show You do not have enough money.
      end

    else if buyChoice equals forgeweapon
      set weaponBoostPrice to 120
      set weaponStepValue to weaponNumber
      multiply weaponStepValue by 45
      add weaponStepValue to weaponBoostPrice
      subtract traderDiscount from weaponBoostPrice
      show The next weapon costs weaponBoostPrice bronze
      if weaponNumber is greater than 7
        show You already carry the finest weapon there is.
      else if bronzeHeld is greater than or equal to weaponBoostPrice
        subtract weaponBoostPrice from bronzeHeld
        add 1 to weaponNumber
        add 2 to heroHit
        add 10 to weaponMaxWear
        set weaponWear to weaponMaxWear
        set tradeWins to true
        if weaponNumber equals 2
          set weaponName to the ranger's longbow
        else if weaponNumber equals 3
          set weaponName to dwarven rune hammer
        else if weaponNumber equals 4
          set weaponName to silver staff
        else if weaponNumber equals 5
          set weaponName to shadow dagger
        else if weaponNumber equals 6
          set weaponName to dragonbone lance
        else if weaponNumber equals 7
          set weaponName to the second hand of time
        else
          set weaponName to the holy sword of peace
        end
        show Your new weapon weaponName is finished. Your hit and its greatest wear went up.
      else
        show You do not have enough money.
      end

    else if buyChoice equals forgearmour
      set armourBoostPrice to 130
      set armourStepValue to armourNumber
      multiply armourStepValue by 55
      add armourStepValue to armourBoostPrice
      subtract traderDiscount from armourBoostPrice
      show The next armour costs armourBoostPrice bronze
      if armourNumber is greater than 5
        show You already wear the finest armour there is.
      else if bronzeHeld is greater than or equal to armourBoostPrice
        subtract armourBoostPrice from bronzeHeld
        add 1 to armourNumber
        add 2 to heroGuard
        add 12 to armourMaxWear
        set armourWear to armourMaxWear
        set tradeWins to true
        if armourNumber equals 2
          set armourName to elven ranger's coat
        else if armourNumber equals 3
          set armourName to dwarven plate armour
        else if armourNumber equals 4
          set armourName to holy light vestment
        else if armourNumber equals 5
          set armourName to dragonscale armour
        else
          set armourName to the royal guardian armour
        end
        show Your new armour armourName is finished. Your guard and its greatest wear went up.
      else
        show You do not have enough money.
      end

    else if buyChoice equals charm
      show hawkeye 180 bronze · scales 220 bronze · rosary 260 bronze
      ask charmChoice hawkeye, scales, rosary, cancel
      if charmChoice equals hawkeye
        if bronzeHeld is greater than or equal to 180
          subtract 180 from bronzeHeld
          set charmNumber to 1
          set charmName to the hawk's eye
          set tradeWins to true
        else
          show You do not have enough money.
        end
      else if charmChoice equals scales
        if bronzeHeld is greater than or equal to 220
          subtract 220 from bronzeHeld
          set charmNumber to 2
          set charmName to the trader's silver scales
          set tradeWins to true
        else
          show You do not have enough money.
        end
      else if charmChoice equals rosary
        if bronzeHeld is greater than or equal to 260
          subtract 260 from bronzeHeld
          set charmNumber to 3
          set charmName to the saint's rosary
          set tradeWins to true
        else
          show You do not have enough money.
        end
      end
      if tradeWins exists then show You put charmName on

    else if buyChoice equals fatedraw
      draw a line
      show 🎲 A draw for fate seals alone · no bronze and no money is taken
      show common 50 percent · fine 32 percent · rare 15 percent · legend 3 percent
      show If five draws pass with nothing rare or better, the sixth is certain to be rare or better.
      show Seals now fateSealCount · rare counter fatePityCount / 5
      if fateSealCount is greater than 0
        subtract 1 from fateSealCount
        add 1 to fateDrawCount
        if firstDrawDone missing
          set firstDrawDone to true
          add 1 to luckCoinCount
          add 2 to fateShardCount
          say in a box 🟨 Fixed reward for a first draw · 1 luck coin · 2 fate shards
        else
          if fatePityCount is greater than 4
            set fateDrawFace to random number from 83 to 100
            show 🟨 The counter fires · this result is rare or better.
          else
            set fateDrawFace to random number from 1 to 100
          end
          if fateDrawFace is less than or equal to 50
            add 1 to rationCount
            add 1 to fateShardCount
            add 1 to fatePityCount
            show 🟦 Common · 1 kingdom travel ration · 1 shard
          else if fateDrawFace is less than or equal to 82
            set fineRewardFace to random number from 1 to 2
            if fineRewardFace equals 1
              add 1 to potionCount
              show 🟩 Fine · 1 potion · 2 shards
            else
              add 1 to tonicCount
              show 🟩 Fine · 1 tonic · 2 shards
            end
            add 2 to fateShardCount
            add 1 to fatePityCount
          else if fateDrawFace is less than or equal to 97
            add 1 to luckCoinCount
            add 1 to chaosRolls
            add 4 to fateShardCount
            set fatePityCount to 0
            say in a box 🟨 Rare · 1 luck coin · 1 chaos die · 4 shards
          else
            add 2 to luckCoinCount
            add 2 to chaosRolls
            add 1 to strongPotionCount
            add 8 to fateShardCount
            set fatePityCount to 0
            say in a box 🟨 Legend · a bundle of chance tools · a strong potion · 8 shards
          end
        end
      else
        show You have no fate seals. Felling the master of a region always gives one.
      end

    else if buyChoice equals fatetrade
      ask fateSwapChoice What will 6 shards buy? luckcoin, chaosdie, cancel
      if fateSwapChoice equals cancel
        show The trade is off.
      else if fateShardCount is greater than 5
        if fateSwapChoice equals luckcoin
          subtract 6 from fateShardCount
          add 1 to luckCoinCount
          show 🟨 You traded 6 fate shards for a luck coin.
        else if fateSwapChoice equals chaosdie
          subtract 6 from fateShardCount
          add 1 to chaosRolls
          show 🟨 You traded 6 fate shards for a chaos die.
        else
          show 🟦 Please check the name of what you want to trade for.
        end
      else
        show You have fewer than 6 fate shards.
      end

    else if buyChoice equals leave
      set shopOpen to 0
      show Lowen closes the ledger and moves on to the next crossroad.
    else
      show 🟦 The shop has nothing by that name. Here is the menu again.
    end

    if tradeWins exists
      add 1 to tradeCount
      add 1 to traderStanding
      if firstTradeAchievement missing
        set firstTradeAchievement to true
        append first trade to achievementList
        show achievement earned · first trade
      end
      show what you have left
      do showMoney with bronzeHeld
    end
  end


  # ── Time passing as you move to the next road ───────────────────

  add 1 to regionNumber
  set deepestRegion to regionNumber
  add 1 to adventureDay
  add 12 to fatigueLevel
  subtract 15 from fullnessLevel
  subtract 1 from warRisk
  if warRisk is less than 0 then set warRisk to 0
  if fullnessLevel is less than 0 then set fullnessLevel to 0
  if fullnessLevel equals 0
    subtract 5 from heroLife
    subtract 5 from moralePoints
    show Hunger has taken your life and your spirits down.
    if moralePoints is less than 0 then set moralePoints to 0
  end


  # ── Camp between roads, and ten recipes ─────────────────────────

  if screenNumber equals 1 then clear the screen
  set titleBoard to A campfire
  do drawSmallTitle with titleBoard
  show day adventureDay · next region regionNumber · fullness fullnessLevel · fatigue fatigueLevel · morale moralePoints
  show 🟩 recovery · rest / eat
  show ⚒ growth · train / craft / gear
  show 📜 safety · records / save
  set campOptions to list of rest, eat, train, craft, gear, records, save
  set campSettled to 0
  while campSettled is less than 1
    ask campChoice Type exactly the name of the camp move you want
    if campOptions contains campChoice
      set campSettled to 1
    else
      show 🟦 That is not on the list. Asking again without spending the turn.
    end
  end

  if campChoice equals craft
    show herb herbCount · iron ironCount · dust dustCount · scale scaleCount
    show cloth clothCount · crystal crystalCount · hide hideCount
    ask craftChoice potion, strongpotion, tonic, antidote, bomb, holywater, smoke, whetstone, rune, rations, cancel
    set craftWins to false

    if craftChoice equals potion
      if herbCount is greater than 1
        subtract 2 from herbCount
        add 1 to potionCount
        set craftWins to true
      end
    else if craftChoice equals strongpotion
      if herbCount is greater than 2
        if crystalCount is greater than 0
          subtract 3 from herbCount
          subtract 1 from crystalCount
          add 1 to strongPotionCount
          set craftWins to true
        end
      end
    else if craftChoice equals tonic
      if herbCount is greater than 0
        if dustCount is greater than 0
          subtract 1 from herbCount
          subtract 1 from dustCount
          add 1 to tonicCount
          set craftWins to true
        end
      end
    else if craftChoice equals antidote
      if herbCount is greater than 1
        subtract 2 from herbCount
        add 2 to antidoteCount
        set craftWins to true
      end
    else if craftChoice equals bomb
      if ironCount is greater than 1
        if dustCount is greater than 0
          subtract 2 from ironCount
          subtract 1 from dustCount
          add 1 to bombCount
          set craftWins to true
        end
      end
    else if craftChoice equals holywater
      if herbCount is greater than 0
        if crystalCount is greater than 0
          subtract 1 from herbCount
          subtract 1 from crystalCount
          add 1 to holyWaterCount
          set craftWins to true
        end
      end
    else if craftChoice equals smoke
      if dustCount is greater than 0
        if clothCount is greater than 0
          subtract 1 from dustCount
          subtract 1 from clothCount
          add 2 to smokeCount
          set craftWins to true
        end
      end
    else if craftChoice equals whetstone
      if ironCount is greater than 0
        subtract 1 from ironCount
        add 2 to whetstoneCount
        set craftWins to true
      end
    else if craftChoice equals rune
      if ironCount is greater than 1
        if dustCount is greater than 1
          subtract 2 from ironCount
          subtract 2 from dustCount
          add 1 to heroHit
          add 1 to heroGuard
          add 4 to maxLife
          add 4 to heroLife
          add 1 to runeCount
          set craftWins to true
        end
      end
    else if craftChoice equals rations
      if hideCount is greater than 0
        if herbCount is greater than 0
          subtract 1 from hideCount
          subtract 1 from herbCount
          add 2 to rationCount
          set craftWins to true
        end
      end
    end

    if craftWins exists
      add 1 to craftCount
      show You made craftChoice
      if firstCraftAchievement missing
        set firstCraftAchievement to true
        append first craft to achievementList
        show achievement earned · first craft
      end
    else
      show You are short of materials, or you called the crafting off.
    end

  else if campChoice equals eat
    if rationCount is greater than 0
      subtract 1 from rationCount
      add 40 to fullnessLevel
      subtract 8 from fatigueLevel
      add 6 to moralePoints
      if fullnessLevel is greater than 100 then set fullnessLevel to 100
      if fatigueLevel is less than 0 then set fatigueLevel to 0
      if moralePoints is greater than 100 then set moralePoints to 100
      show You share a warm meal with your allies; fullness and morale went up.
    else
      show There is nothing left to eat.
    end
  else if campChoice equals train
    set trainingOptions to list of hit, guard, life, spirit, speed
    set trainingSettled to 0
    while trainingSettled is less than 1
      ask trainingChoice Choose one of hit, guard, life, spirit, speed
      if trainingOptions contains trainingChoice
        set trainingSettled to 1
      else
        show 🟦 Please type one of the five abilities again.
      end
    end
    add 8 to fatigueLevel
    if trainingChoice equals hit
      add 1 to heroHit
    else if trainingChoice equals guard
      add 1 to heroGuard
    else if trainingChoice equals spirit
      add 2 to maxSpirit
    else if trainingChoice equals speed
      add 2 to heroSpeed
    else
      add 4 to maxLife
    end
    show Hard training raised an ability, and it left you tired.
  else if campChoice equals gear
    if ironCount is greater than 0
      subtract 1 from ironCount
      set weaponWear to weaponMaxWear
      set armourWear to armourMaxWear
      add 1 to repairCount
      show One piece of iron ore field-repaired your weapon and your armour.
    else
      show There is no iron ore to repair with.
    end
  else if campChoice equals records
    show hope hopeScore · spark peaceSpark · fame fameLevel
    show crown crownStanding · elves elfStanding · dwarves dwarfStanding · temple templeStanding · guild guildStanding · traders traderStanding
    show war risk warRisk · trades tradeCount · crafts craftCount · repairs repairCount
    show allyList joined by comma
    show 🎲 fate seals fateSealCount · shards fateShardCount · draws fateDrawCount · gambles won gambleWins / lost gambleLosses
  else if campChoice equals save
    add 1 to saveCount
    set saveCells to an empty list
    append peaceG to saveCells
    append heroName to saveCells
    set saveNumbers to list of classNumber, difficultyNumber, regionNumber, deepestRegion, maxLife, heroLife, heroHit, heroGuard, maxSpirit, heroSpirit, heroSpeed, heroLevel, heroExp, nextExp, bronzeHeld, potionCount, strongPotionCount, tonicCount, antidoteCount, bombCount, holyWaterCount, smokeCount, whetstoneCount, rationCount, herbCount, ironCount, dustCount, scaleCount, clothCount, crystalCount, hideCount, peaceSpark, hopeScore, ultimateCharge, craftCount, poiseBreaks, weakHits, totalTurns, weaponNumber, weaponWear, weaponMaxWear, armourNumber, armourWear, armourMaxWear, charmNumber, warRisk, traderStanding, crownStanding, elfStanding, dwarfStanding, templeStanding, guildStanding, adventureDay, fullnessLevel, fatigueLevel, moralePoints, wardRuneHeld, wardRuneUsed, serinHelped, demonLordWeakened, bannerGuard, rianelJoined, brumJoined, serinJoined, adelaJoined, kyleJoined, aurelJoined, isabelJoined, darionJoined, neriaJoined, lucianJoined, forestQuest, wardQuest, bannerQuest, marketQuest, refugeeQuest, sealQuest, runeCount, tradeCount, repairCount, fameLevel, saveCount, demonLordSlain, hiddenBossWin, pacingNumber, screenNumber, luckCoinCount, chaosRolls, fateSealCount, fateDrawCount, fatePityCount, fateShardCount, firstDrawDone, gambleWins, gambleLosses
    for each saveNumber in saveNumbers
      do putCodeCell with saveNumber
    end
    set saveSum to 0
    set saveIndexValue to 0
    for each numberToCheck in saveNumbers
      add 1 to saveIndexValue
      set saveTerm to numberToCheck
      multiply saveTerm by saveIndexValue
      add saveTerm to saveSum
    end
    set saveCheckValue to the remainder of saveSum divided by 997
    do putCodeCell with saveCheckValue
    draw a line
    show The whole line below is your save code. Copy it somewhere safe.
    show saveCells joined by comma
    show At the opening screen next time, choose load and paste this one line.
    draw a line
    # Saving is a safety feature, so it never costs you a camp move; a plain rest comes with it.
    add 24 to heroLife
    set heroSpirit to maxSpirit
    set heroPoison to 0
    subtract 25 from fatigueLevel
    if heroLife is greater than maxLife then set heroLife to maxLife
    if fatigueLevel is less than 0 then set fatigueLevel to 0
    show 🟩 Your allies kept watch while you saved, so a plain rest came with it.
  else
    add 24 to heroLife
    set heroSpirit to maxSpirit
    set heroPoison to 0
    subtract 25 from fatigueLevel
    add 3 to moralePoints
    if heroLife is greater than maxLife then set heroLife to maxLife
    if fatigueLevel is less than 0 then set fatigueLevel to 0
    if moralePoints is greater than 100 then set moralePoints to 100
    if charmNumber equals 3
      add 8 to heroLife
      if heroLife is greater than maxLife
        set heroLife to maxLife
      end
    end
    show You shared the watch and slept deeply.
  end

  wait shortWait

end


# ════════════════════════════════════════════════════════════════════
# The last scene
# ════════════════════════════════════════════════════════════════════

clear the screen
draw a line

set peaceReached to false
if endingKind equals peace
  set peaceReached to true
end
if endingKind equals wholepeace
  set peaceReached to true
end
if endingKind equals sacrifice
  set peaceReached to true
end

if peaceReached exists
  say in a box 🟩 Peace
  draw a line
  if pacingNumber equals 2
    say slowly The Demon Lord has fallen. Morning comes back to Arteria.
  else if pacingNumber equals 3
    say very slowly At last, peace has come back.
  else
    show The Demon Lord has fallen. Morning comes back to Arteria.
  end
  story:

    heroName raised weaponName and ran it through Morgar's heart.
    The Demon Lord was dead, and the gate of the demon world fell in with red fire.
    In the capital Elenoa rang the victory bell and raised the kingdom's flag on every wall.
    The monster legions fled to the northern mountains, and a peaceful morning came to Arteria again.

  end

  if hopeScore is greater than or equal to 7
    story:

      A statue of the winning hero rose in the middle of the capital, and the festival ran a week.
      Rianel the elf took her forest back, and Brum the dwarf opened the fallen mine again.
      Serin became the kingdom's high wizard, and Adela and Kyle founded a guild for the children the war orphaned.
      Aurel the gold dragon flew above the new king's crowning, and the alliance of the three peoples held firmer than ever.

    end
    say in the middle The warmest peace
  else if hopeScore is greater than or equal to 4
    story:

      The wounds did not close in a day, but the roads were given their names again.
      People told each other what heroName chose along the way, and kept the small promises first.
      A world you can pick a tomorrow in, whole or not — that much peace had begun.

    end
    say in the middle Peace begun again
  else
    story:

      The war was over and people opened their doors.
      Trusting one another, though, is still something to learn slowly.
      heroName set the weapon down and began the work that is harder than fighting.

    end
    say in the middle Peace still being learned
  end

  if endingKind equals wholepeace
    draw a line
    story:

      With Nox the abyss dragon fallen, the rift in the world closed for good inside the holy flame of the goddess.
      Your allies came home to the kingdom and kept the last battle, written down nowhere, in the memory of one another.
      The peace of Arteria became a whole new age, with not even a trace of the Demon Lord left.

    end
    say in a box 🟨 A hidden ending · a whole peace
  else if endingKind equals sacrifice
    draw a line
    story:

      The rift in the world closed, and heroName never came back with the others.
      Every guild in the kingdom set out one empty chair, and each year the princess lit the first flame before it.
      Because of that, the next generation lived ordinary lives, knowing neither Demon Lord nor abyss.

    end
    say in a box 🟨 A hidden ending · the last guardian
  end

else
  say in a box 🟥 A road not finished yet
  draw a line
  story:

    The spark of peace fell to the ground, and it did not go out.
    Princess Elenoa lights the castle torch and waits for the next adventurer.
    If somebody walks this road again, the failure of today will be a story that keeps them safe.

  end
end


# ── The last record ────────────────────────────────────────────────

draw a line
show heroName · className · level heroLevel
show weapon weaponName · armour armourName · charm charmName
show furthest road deepestRegion · turns traded totalTurns
show what you have left
do showMoney with bronzeHeld
show the spark of peace peaceSpark · hope hopeScore · fame fameLevel
set elapsedTime to elapsed
show play time elapsedTime seconds · poise breaks poiseBreaks · weakness hits weakHits · crafts craftCount · saves saveCount
show survival · day adventureDay · fullness fullnessLevel · fatigue fatigueLevel · morale moralePoints
show economy · war risk warRisk · trades tradeCount · repairs repairCount · trader standing traderStanding
show fate · seals fateSealCount · shards fateShardCount · draws fateDrawCount · gambles won gambleWins / lost gambleLosses
show wear · weapon weaponWear / weaponMaxWear · armour armourWear / armourMaxWear
show materials left · herb herbCount · iron ironCount · dust dustCount · scale scaleCount · cloth clothCount · crystal crystalCount · hide hideCount
draw a line
show who came with you
if allyList missing
  show You recruited nobody.
else
  show allyList joined by comma
end
draw a line
show the regions you found
show regionsFound joined by comma
draw a line
show the enemies you felled
for each recordName in enemiesFelled
  set recordCount to recordName in enemiesFelled
  show recordName · recordCount times
end
draw a line
show the quest log
for each questName in questBoard
  set questState to questName in questBoard
  show questName · questState
end
draw a line
show the achievements you earned
if achievementList missing
  show You have earned no achievements yet.
else
  for each achievementName in achievementList
    show achievementName
  end
end
draw a line
say in the middle Thank you for walking it to the end
draw a line`,
    },
  ],

  ko: [
    {
      id: 'hello',
      label: '인사',
      group: 'start',
      answers: [],
      expect: '안녕하세요!',
      source: `# 이 줄은 아무 일도 하지 않습니다. 앞에 #을 붙이면 사람이 읽는 쪽지가 됩니다.
안녕하세요! 말해줘
3번 반복해서 NME는 쉽습니다 말해줘`,
    },
    {
      id: 'storyblock',
      label: '이야기 묶음',
      group: 'start',
      answers: [],
      expect: '제목이 없었습니다',
      source: `# 이야기 묶음 안은 전부 글입니다. 줄마다 말해줘를 쓰지 않아도 됩니다.
이야기:
    아주 오래된 도서관이었습니다.
    책들은 저마다 다른 두께로 서 있었습니다.
    맨 아래 칸에 한 권만 눕혀져 있었습니다.
끝
천천히 이야기:
    그 책에는 제목이 없었습니다.
끝`,
    },
    {
      id: 'slow',
      label: '글자 하나씩 나오는 이야기',
      group: 'start',
      answers: [],
      expect: '여기까지입니다',
      source: `# 소설처럼 글자가 하나씩 나옵니다.
천천히 말해줘 문이 천천히 열렸습니다.
1초 기다려
아주 천천히 말해줘 아무도 없었습니다.
여기까지입니다 말해줘`,
    },
    {
      id: 'ask',
      label: '이름 묻기',
      group: 'start',
      answers: ['민수'],
      expect: '안녕하세요 민수!',
      source: `# 질문은 그냥 질문입니다. 대답이 이름이 됩니다.
이름이 뭐예요?
안녕하세요 이름! 말해줘
3번 반갑습니다`,
    },
    {
      id: 'maths',
      label: '값 바꾸기',
      group: 'start',
      answers: [],
      expect: '20',
      source: `# + - * / 와 = 없이 더하고 빼고 곱하고 나눕니다.
점수는 3
점수에 7 더해
점수에 4 곱해
점수를 2로 나눠
점수 말해줘`,
    },
    {
      id: 'list',
      label: '목록 하나씩 꺼내기',
      group: 'data',
      answers: [],
      expect: '안녕하세요 서준!',
      source: `# 목록을 만들고 하나씩 지나갑니다.
친구들은 목록 민수, 지안, 서준
친구들의 친구마다 반복해
안녕하세요 친구! 말해줘
끝`,
    },
    {
      id: 'collect',
      label: '목록에 담기',
      group: 'data',
      answers: ['사과', '배', '자두'],
      expect: '자두',
      source: `# 빈 목록으로 시작해, 세 번 물어보고 대답을 모두 담습니다.
과일들은 목록
3번 반복해
과일을 물어봐 과일 하나를 알려 주세요
과일들에 과일 넣어
끝
과일들 말해줘`,
    },
    {
      id: 'listwork',
      label: '목록 만들고 쓰기',
      group: 'data',
      answers: [],
      expect: '우유는 아직 있어요',
      source: `# 괄호도 기호도 없이 목록 프로그램 하나를 통째로.
장바구니는 빈 목록
장바구니에 사과 넣어
장바구니에 빵 넣어
장바구니에 우유 넣어
장바구니 개수 말해줘
장바구니 정렬해
장바구니를 쉼표로 이어 말해줘
장바구니 첫 번째 말해줘
장바구니에서 빵 빼
만약에 장바구니에 우유가 있으면
    우유는 아직 있어요 말해줘
끝`,
    },
    {
      id: 'textwork',
      label: '글 나누고 잇기',
      group: 'data',
      answers: [],
      expect: '딸기, 사과, 포도',
      source: `# 한 줄이 목록이 되고, 목록이 다시 한 줄이 됩니다.
줄은 사과,포도,딸기
과일들은 줄을 쉼표로 나눈 것
과일들 개수 말해줘
과일들 정렬해
과일들을 쉼표로 이어 말해줘
별표는 ★
과일들의 과일마다 순서와 함께 반복해
    막대는 별표를 순서 개 붙인 것
    과일 말해줘
    막대 말해줘
끝`,
    },
    {
      id: 'record',
      label: '이름마다 값 하나',
      group: 'data',
      answers: [],
      expect: '서울',
      source: `# 표: 순서가 아니라 이름으로 찾습니다.
주소록은 빈 표
주소록에 민수를 서울로 넣어
주소록에 지안을 부산으로 넣어
주소록 개수 말해줘
주소록의 민수 말해줘
주소록의 이름마다 반복해
    이름 말해줘
    주소록의 이름 말해줘
끝
만약에 주소록에 지안이 있으면
    지안도 있습니다 말해줘
끝`,
    },
    {
      id: 'dates',
      label: '오늘 날짜 쓰기',
      group: 'start',
      answers: [],
      expect: '일주일 뒤',
      source: `# 날짜는 컴퓨터가 이미 압니다. 시계는 세계 표준시입니다.
날짜 사용 최신
오늘 날짜는 말해줘
말해 오늘()
요일은 말해줘
말해 요일()
일주일 뒤 말해줘
말해 며칠뒤(7)`,
    },
    {
      id: 'job',
      label: '이름 붙인 일',
      group: 'choose',
      answers: [],
      expect: '반가워요',
      source: `# 여러 줄에 이름을 붙여 두고 그 이름으로 실행합니다.
인사하기라는 일:
    안녕하세요 말해줘
    반가워요 말해줘
끝
인사하기 해줘
이름에게 칭찬하기라는 일:
    잘했어요 말해줘
    이름 말해줘
끝
민수에게 칭찬하기 해줘`,
    },
    {
      id: 'conditions',
      label: '조건 겹쳐 쓰기',
      group: 'choose',
      answers: [],
      expect: '안녕히 주무세요',
      source: `# 그리고, 또는, 있으면, 그리고 비교하는 말들.
이름은 민수
시각은 23
피곤은 참

만약 이름이 있으면 그리고 시각이 18보다 크면 좋은 저녁이에요 이름! 말해줘
만약 피곤 또는 시각이 23보다 크거나 같으면 안녕히 주무세요 말해줘
만약에 시각이 12와 같지 않으면 정오가 아니에요 말해줘`,
    },
    {
      id: 'while',
      label: '조건이 맞는 동안 되풀이',
      group: 'choose',
      answers: [],
      expect: '끝났어요',
      source: `# 블록은 끝으로 닫으므로 들여쓰기는 선택입니다.
횟수는 0
횟수가 5보다 작을 동안
횟수 말해줘
횟수에 1 더해
끝
끝났어요 말해줘`,
    },
    {
      id: 'skip',
      label: '한 번 건너뛰기',
      group: 'choose',
      answers: [],
      expect: '7',
      source: `# 건너뛰어는 다음 바퀴로, 멈춰는 반복 밖으로 나갑니다.
점수는 0
8번 반복해
점수에 1 더해
만약에 점수가 3과 같으면 건너뛰어
점수 말해줘
끝`,
    },
    {
      id: 'countdown',
      label: '반복 중간에 빠져나오기',
      group: 'choose',
      answers: [],
      expect: '여기서 멈췄습니다',
      source: `# 거꾸로 세다가 끝나기 전에 빠져나옵니다.
남은수는 5
남은수가 0보다 클 동안
남은수 말해줘
남은수에서 1 빼
만약에 남은수가 2와 같으면 멈춰
끝
여기서 멈췄습니다 말해줘`,
    },
    {
      id: 'wait',
      label: '기다리기',
      group: 'start',
      answers: [],
      expect: '끝났습니다',
      source: `# 기다리는 것도 문장입니다.
준비됐습니다 말해줘
3번 반복해
1초 기다려
하나 지났어요 말해줘
끝
끝났습니다 말해줘`,
    },
    {
      id: 'guess',
      label: '숫자 맞히기',
      group: 'game',
      answers: ['5'],
      expect: '놀아 주셔서 고맙습니다',
      source: `# 따옴표도 쉼표도 등호도 콜론도 없습니다.
정답은 1부터 10까지 랜덤정수
추측을 숫자로 물어봐 1부터 10까지 골라 보세요

만약에 추측이 정답과 같으면
맞았어요 말해줘
아니면 만약에 추측이 정답보다 작으면
더 큰 수예요 말해줘
아니면
더 작은 수예요 말해줘
끝
놀아 주셔서 고맙습니다 말해줘`,
    },
    {
      id: 'chance',
      label: '확률로 정하기',
      group: 'game',
      answers: [],
      expect: '언제나 나옵니다',
      source: `# 백 번에 몇 번 일어날지를 직접 정합니다.
주사위는 1부터 6까지 무작위 숫자
굴립니다 말해줘
주사위 말해줘
100% 확률로 말해줘 이 줄은 언제나 나옵니다
0% 확률로 말해줘 이 줄은 절대 나오지 않습니다
30% 확률로 말해줘 열에 셋쯤 나옵니다
비는 40% 확률
만약에 비가 있으면
    우산을 챙기세요 말해줘
아니면
    오늘은 맑습니다 말해줘
끝`,
    },
    {
      id: 'screen',
      label: '화면 꾸미기',
      group: 'start',
      answers: [],
      expect: '커피, 차, 물',
      source: `# 화면을 정리하는 문장 넷.
화면 지워
줄 그어
가운데 말해줘 오늘의 차림표
줄 그어
상자로 말해줘 커피, 차, 물`,
    },
    {
      id: 'clock',
      label: '시간 재기와 쿨타임',
      group: 'game',
      answers: [],
      expect: '문이 열렸습니다',
      source: `# 시간 재기와 쿨타임, 둘 다 문장입니다.
시간 재기 시작해
문 쿨타임 2초 걸어

만약 문 쿨타임이 남았으면
문이 아직 잠겨 있습니다 말해줘
끝

문 쿨타임 끝날때까지 기다려
문이 열렸습니다 말해줘
잰시간 말해줘`,
    },
    {
      id: 'rps',
      label: '가위바위보',
      group: 'game',
      answers: ['바위'],
      expect: '재미있었습니다',
      source: `# 게임 하나가 통째로: 무작위 하나, 질문 하나, 대답 셋.
내것은 바위 또는 보 또는 가위 중에서 랜덤선택
네것을 물어봐 바위, 보, 가위 중 하나를 골라 주세요

나는 내것 냈습니다 말해줘

만약에 네것이 내것과 같으면
비겼습니다 말해줘
아니면
둘 중 하나가 이겼습니다 말해줘
끝
재미있었습니다 말해줘`,
    },
    {
      id: 'reaction',
      label: '반응 속도 재기',
      group: 'game',
      answers: [''],
      expect: '걸린 시간',
      source: `# 시간 재기를 원래 쓰라고 만든 곳에 씁니다.
준비하세요 말해줘
2초 기다려
지금! 엔터를 누르세요 말해줘
시간 재기 시작해
입력을 물어봐 엔터
걸린 시간(초) 말해줘
잰시간 말해줘`,
    },
    {
      id: 'story',
      label: '짧은 이야기',
      group: 'game',
      answers: ['왼쪽'],
      expect: '여기까지입니다',
      source: `# 어느 쪽으로 갈지 물어보는 이야기.
두 갈래 길 앞에 서 있습니다 말해줘
길을 물어봐 왼쪽인가요 오른쪽인가요?

만약에 길이 왼쪽과 같으면
강이 나옵니다. 물길을 보며 집으로 돌아갑니다 말해줘
아니면
동굴이 나옵니다. 안에서 무언가 자고 있습니다 말해줘
끝
여기까지입니다 말해줘`,
    },
    {
      id: 'menu',
      label: '작은 차림표',
      group: 'choose',
      answers: ['2'],
      expect: '차 한 잔',
      source: `# 차림표는 질문 하나와 대답 셋입니다.
오늘은 커피와 차가 있습니다 말해줘
고른것을 숫자로 물어봐 커피는 1, 차는 2를 눌러 주세요

만약에 고른것이 1과 같으면
커피 한 잔 드릴게요 말해줘
아니면 만약에 고른것이 2와 같으면
차 한 잔 드릴게요 말해줘
아니면
그 둘만 있습니다 말해줘
끝`,
    },
    {
      id: 'table',
      label: '5단 만들기',
      group: 'choose',
      answers: [],
      expect: '25',
      source: `# 5단을 더하기만으로 만듭니다.
합계는 0
5번 반복해
합계에 5 더해
합계 말해줘
끝`,
    },
    {
      id: 'sum',
      label: '숫자 세 개 더하기',
      group: 'start',
      answers: ['2', '3', '4'],
      expect: '9',
      source: `# 대답 셋을 받아 하나로 더합니다.
첫째를 숫자로 물어봐 첫 번째 숫자
둘째를 숫자로 물어봐 두 번째 숫자
셋째를 숫자로 물어봐 세 번째 숫자

합계는 첫째
합계에 둘째 더해
합계에 셋째 더해
합계 말해줘`,
    },
    {
      id: 'password',
      label: '맞을 때까지',
      group: 'choose',
      answers: ['수리수리', '열려라'],
      expect: '문이 열렸습니다',
      source: `# 맞는 대답이 나올 때까지 계속 물어봅니다.
주문은 아직
주문이 열려라와 같지 않을 동안
주문을 물어봐 마법의 주문을 말해 보세요
끝
문이 열렸습니다 말해줘`,
    },
    {
      id: 'six',
      label: '문법 셋 × 말 둘',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: '고급 한국어',
      source: `# 문장형·초급·고급을 각각 한국어와 영어로.
# 여섯 가지 쓰는 법이 한 파일에 있고, 선언은 어디에도 없습니다.
안녕하세요 말해줘              # 문장형 한국어
show hello                    # 문장형 영어
말해 "초급 한국어"             # 초급 한국어
say "beginner English"        # 초급 영어
인사 = "고급 한국어"            # 고급(Python), 한국어 이름
print(인사)
greeting = "advanced English" # 고급(Python), 영어 이름
print(greeting)`,
    },
    {
      id: 'levels',
      label: '같은 프로그램을 문법 셋으로',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: '문장형 문법',
      source: `# 고급 Python, 초급 NME, 문장형 NME가 한 파일에 있습니다.
사람들 = ["지안", "서준"]                  # 고급 Python

2번:                                      # 초급
    말해 "초급 문법"

2번 반복해                                 # 문장형
문장형 문법 말해줘
끝

for 사람 in 사람들:                        # 다시 고급
    안녕하세요 사람! 말해줘`,
    },
    {
      id: 'mix',
      label: '한국어 + 영어',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: '친구',
      source: `# 두 언어를 한 줄에 섞어도 됩니다.
랜덤 사용 최신
동물은 고양이 또는 강아지 중에서 랜덤선택
3 times 동물 친구가 생겼어요! 말해줘`,
    },
    {
      id: 'typo',
      label: '오타가 있어도 읽기',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: '또',
      source: `# 아래는 전부 오타이거나, 순서가 다르거나, 말이 길어진 줄입니다.
# 각 줄에 들어갈 동작이 하나뿐이라 NME가 짐작하지 않고 읽습니다.
2번 반목해서 다시 말해줘
1초 기다러
안녕 좀 말해줘
세 번 반복해서 또 말해줘
점수는 0
1을 점수에 더해
점수 말해줘`,
    },
    {
      id: 'error',
      label: '오류가 났을 때',
      group: 'ways',
      fixed: true,
      answers: [],
      fails: true,
      expect: 'E0101',
      source: `# 이 프로그램은 일부러 틀렸습니다. 처음 배울 때 가장 자주 하는
# 실수로, 반복 하나에는 끝이 하나입니다. 두 번째 끝은 닫을 것이
# 없어서, 컴파일러가 그 자리를 짚고 고정된 번호를 알려 줍니다.
3번 반복해
안녕하세요 말해줘
끝
끝`,
    },
    {
      id: 'coin',
      label: '아주 작은 블록체인',
      group: 'big',
      answers: [],
      expect: '블록을 캤습니다',
      source: `# 진짜 해시와 진짜 작업 증명인데, 배울 문장부호가 없습니다.
import hashlib

난이도는 3
이전값은 처음
논스는 0

while True
    후보 = 이전값 + str(논스)
    해시값 = hashlib.sha256(후보.encode()).hexdigest()
    if 해시값.startswith("0" * 난이도):
        break
    논스에 1 더해

블록을 캤습니다 말해줘
해시값 말해줘`,
    },
    {
      id: 'zk',
      label: '비밀 없이 증명하기',
      group: 'big',
      answers: [],
      expect: '증명을 받아들였습니다',
      source: `# 비밀을 밝히지 않고, 비밀을 안다는 것만 증명합니다.
영지식 사용 최신

문맥은 로그인
비밀값은 영지식 비밀 만들기
공개값은 비밀값으로 영지식 공개값 만들기
증명값은 비밀값과 문맥으로 영지식 비대화 증명 만들기
검증값은 공개값과 증명값과 문맥으로 영지식 비대화 검증

만약에 검증값이 참이면
증명을 받아들였습니다 말해줘
아니면
증명을 거절했습니다 말해줘
끝`,
    },
    {
      id: 'grow',
      label: '한 줄씩 Python으로',
      group: 'ways',
      fixed: true,
      answers: [],
      expect: '셋',
      source: `# 같은 뜻을 세 가지로 적어, 한 파일에 나란히 둡니다.
낱말은 셋
낱말 말해줘

말해 낱말

print(낱말)`,
    },
    {
      id: 'rpg',
      label: '턴제 RPG',
      group: 'rpg',
      answers: ['나그네', '전사', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망'],
      expect: '잊혀진 탑',
      source: `# ────────────────────────────────────────────────────────────────
# 잊혀진 탑 — 턴제 롤플레잉 게임
#
# NME 문장문법만으로 썼습니다. 파이썬 문법은 한 줄도 없습니다.
# 한 줄이 한 문장이고, 그 한 줄이 파이썬 한 줄이 됩니다.
#
# Apache-2.0
# ────────────────────────────────────────────────────────────────

화면 지워
줄 그어
가운데 말해줘 잊혀진 탑
가운데 말해줘 턴제 롤플레잉 게임
줄 그어

이야기:

  탑은 백 년째 문이 닫혀 있었습니다.
  올라간 사람은 여럿 있었지만, 내려온 사람은 없었습니다.
  오늘 아침 문이 저절로 열렸고, 지금 당신이 그 앞에 서 있습니다.

끝

용사이름을 물어봐 당신의 이름은 무엇입니까?
만약에 용사이름이 없으면
  용사이름은 나그네
끝

줄 그어
전사는 튼튼하고, 마법사는 강하고, 도적은 빠릅니다. 말해줘
직업선택을 물어봐 전사, 마법사, 도적 중에 무엇이 되시겠습니까?

만약에 직업선택이 마법사와 같으면
  직업이름은 마법사
  용사최대체력은 26
  용사공격은 4
  용사방어는 1
  용사마나는 12
아니면 만약에 직업선택이 도적과 같으면
  직업이름은 도적
  용사최대체력은 30
  용사공격은 6
  용사방어는 2
  용사마나는 6
아니면
  직업이름은 전사
  용사최대체력은 36
  용사공격은 6
  용사방어는 4
  용사마나는 3
끝

용사체력은 용사최대체력
용사약병은 3
금화는 10
경험치는 0
레벨은 1
다음레벨은 12
층수는 1
결말은 진행중

상태보기라는 일:
  줄 그어
  용사이름 · 직업이름 · 레벨 단계 말해줘
  힘 용사공격 · 방패 용사방어 · 기운 용사마나 말해줘
  생명 용사체력 / 용사최대체력 · 약병 용사약병 개 · 주머니 금화 냥 말해줘
  줄 그어
끝

상태보기 해줘
1초 기다려

계속 반복해

  화면 지워
  줄 그어
  가운데 말해줘 층수 층
  줄 그어

  만약에 층수가 4보다 크거나 같으면
    적이름은 탑의 주인
    적최대체력은 46
    적공격은 11
    보상금화는 40
    보상경험치는 30
  아니면 만약에 층수가 3과 같으면
    적이름은 돌골렘 또는 검은기사 중에서 랜덤선택
    적최대체력은 30
    적공격은 8
    보상금화는 16
    보상경험치는 14
  아니면 만약에 층수가 2와 같으면
    적이름은 늑대 또는 도깨비불 또는 거미 중에서 랜덤선택
    적최대체력은 22
    적공격은 6
    보상금화는 10
    보상경험치는 9
  아니면
    적이름은 슬라임 또는 박쥐 또는 들쥐 중에서 랜덤선택
    적최대체력은 14
    적공격은 4
    보상금화는 6
    보상경험치는 6
  끝

  적체력은 적최대체력
  앞을 막아선 것 — 적이름 말해줘
  1초 기다려

  계속 반복해

    줄 그어
    상대 적이름 · 남은 힘 적체력 / 적최대체력 말해줘
    아군 용사체력 / 용사최대체력 · 기운 용사마나 · 약병 용사약병 개 말해줘
    선택을 물어봐 공격 · 마법 · 물약 · 도망 중에 무엇을 하시겠습니까?

    만약에 선택이 마법과 같으면

      만약에 용사마나가 3보다 작으면
        기운이 모자라 주문이 흩어졌습니다. 말해줘
      아니면
        용사마나에서 3 빼줘
        준피해는 6부터 13까지 랜덤정수
        준피해에 레벨 더해
        적체력에서 준피해 빼줘
        푸른 불꽃이 준피해 만큼 파고들었습니다. 말해줘
      끝

    아니면 만약에 선택이 물약과 같으면

      만약에 용사약병이 0보다 크면
        용사약병에서 1 빼줘
        용사체력에 12 더해
        만약에 용사체력이 용사최대체력보다 크면
          용사체력은 용사최대체력
        끝
        약병을 비웠습니다. 몸이 따뜻해집니다. 말해줘
      아니면
        약병이 하나도 남지 않았습니다. 말해줘
      끝

    아니면 만약에 선택이 도망과 같으면

      만약에 층수가 4보다 크거나 같으면
        문이 사라졌습니다. 여기서는 물러설 수 없습니다. 말해줘
      아니면
        도망성공은 거짓
        45% 확률로
          도망성공은 참
        끝
        만약에 도망성공이 있으면
          계단을 두 칸 굴러 내려왔습니다. 말해줘
          결말은 도망
          멈춰
        아니면
          등을 보이자마자 붙잡혔습니다. 말해줘
        끝
      끝

    아니면

      준피해는 3부터 9까지 랜덤정수
      준피해에 용사공격 더해
      20% 확률로
        준피해에 2 곱해
        빈틈을 정확히 찔렀습니다. 말해줘
      끝
      적체력에서 준피해 빼줘
      준피해 만큼 베었습니다. 말해줘

    끝

    만약에 적체력이 0보다 작거나 같으면
      줄 그어
      쓰러진 것 — 적이름 말해줘
      멈춰
    끝

    받은피해는 2부터 7까지 랜덤정수
    받은피해에 적공격 더해
    받은피해에서 용사방어 빼줘
    만약에 받은피해가 1보다 작으면
      받은피해는 1
    끝
    용사체력에서 받은피해 빼줘
    적이름의 반격이 받은피해 만큼 들어왔습니다. 말해줘

    만약에 용사체력이 0보다 작거나 같으면
      줄 그어
      결말은 패배
      멈춰
    끝

    1초 기다려

  끝

  만약에 결말이 진행중과 같지 않으면
    멈춰
  끝

  금화에 보상금화 더해
  경험치에 보상경험치 더해
  노획 보상금화 냥 · 경험 보상경험치 말해줘

  만약에 경험치가 다음레벨보다 크거나 같으면
    경험치에서 다음레벨 빼줘
    레벨에 1 더해
    용사최대체력에 6 더해
    용사공격에 2 더해
    용사방어에 1 더해
    용사마나에 3 더해
    용사체력은 용사최대체력
    다음레벨에 8 더해
    줄 그어
    상자로 말해줘 이제 레벨 단계입니다
    줄 그어
  끝

  만약에 층수가 4보다 크거나 같으면
    결말은 승리
    멈춰
  끝

  줄 그어
  쉬어 가는 층입니다. 벽에 상인이 기대어 있습니다. 말해줘
  약병 하나에 8냥입니다. 말해줘
  주머니에 금화 냥 있습니다. 말해줘
  상점선택을 물어봐 약병을 살까요? 예 · 아니오

  만약에 상점선택이 예와 같으면
    만약에 금화가 8보다 크거나 같으면
      금화에서 8 빼줘
      용사약병에 1 더해
      약병을 하나 챙겼습니다. 말해줘
    아니면
      돈이 모자랍니다. 말해줘
    끝
  아니면
    상인이 고개를 끄덕였습니다. 말해줘
  끝

  용사체력에 4 더해
  만약에 용사체력이 용사최대체력보다 크면
    용사체력은 용사최대체력
  끝

  층수에 1 더해
  1초 기다려

끝

화면 지워
줄 그어

만약에 결말이 승리와 같으면
  가운데 말해줘 탑의 꼭대기
  줄 그어
  이야기:

    바람이 얼굴에 닿습니다.
    백 년 만에 이 자리에 사람이 섰습니다.
    아래를 내려다보니, 올라온 길이 아주 짧아 보입니다.

  끝
아니면 만약에 결말이 도망과 같으면
  가운데 말해줘 문 밖
  줄 그어
  이야기:

    문이 등 뒤에서 닫혔습니다.
    살아 있다는 것만으로도 오늘은 충분합니다.
    탑은 내일도 그 자리에 있을 것입니다.

  끝
아니면
  가운데 말해줘 여기까지
  줄 그어
  이야기:

    눈앞이 어두워집니다.
    탑은 또 한 사람의 이야기를 삼켰습니다.
    다음 사람은 조금 더 멀리 갈지도 모릅니다.

  끝
끝

줄 그어
용사이름 · 직업이름 · 레벨 단계 · 층수 층까지 말해줘
줄 그어`,
    },
    {
      id: 'rpg-deep',
      label: '궁극의 턴제 RPG',
      group: 'rpg',
      answers: ['아다', '전사', '보통', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망', '도망'],
      expect: '가라앉은 성',
      source: `# ════════════════════════════════════════════════════════════════════
# 가라앉은 성 — 턴제 롤플레잉 게임
#
# ── 먼저 읽어 주세요 ────────────────────────────────────────────────
# 앞에 #이 붙은 줄은 아무 일도 하지 않습니다. 컴퓨터가 그냥 지나갑니다.
# 사람이 읽으라고 적어 둔 쪽지입니다. 이런 줄을 전부 지워도 게임은
# 똑같이 돌아갑니다.
#
# 이 게임은 전부 문장문법입니다. 파이썬 문법은 한 줄도 없습니다.
# 한 문장이 한 줄이고, 그 한 줄이 파이썬 한 줄이 됩니다 — 파이썬 칸을
# 열면 왼쪽과 오른쪽을 나란히 놓고 읽을 수 있습니다.
#
# ── 내 것으로 바꾸는 법 ─────────────────────────────────────────────
# 먼저 바꿔 볼 것은 바로 아래 「손잡이」에 다 모아 두었습니다.
# 숫자 하나를 바꾸고 실행을 눌러 보세요. 여기서 무엇을 해도 망가지는
# 것은 없습니다.
#
# 그다음에는 방 이름을 바꾸고, 이야기를 새로 쓰고, 다섯 번째 직업을
# 만들고, 여섯 번째 층을 넣어 보세요. 이 파일은 완성품이 아니라
# 출발점입니다.
#
# Apache-2.0
# ════════════════════════════════════════════════════════════════════


# ── 손잡이 ──────────────────────────────────────────────────────────
# 전부 마음대로 바꿔도 됩니다. 바꿔 보세요.

마지막층은 4              # 성주를 만나기 전까지 내려가는 층수
약병회복은 14             # 약병 하나가 되돌려 주는 생명
기운회복은 8              # 기운병 하나가 되돌려 주는 기운
폭탄위력은 16             # 폭탄이 주는 피해
약병값은 9                # 상인이 부르는 값
기운병값은 11
폭탄값은 13
벼림값은 18               # 무기를 벼리는 값
치명확률은 12             # 백 번에 몇 번, 한 대가 두 배가 되는지
도망확률은 60             # 백 번에 몇 번, 도망이 되는지
독피해는 2                # 독이 한 판마다 깎는 생명
찬칸은 █                  # 생명 막대를 그리는 글자
빈칸은 ░                  # 깎여 나간 자리를 그리는 글자
칸당생명은 4              # 막대 한 칸이 나타내는 생명
막대폭은 20               # 막대 하나의 길이. 아래 일이 이 이름을 읽는데,
                          # 일은 자기보다 위에 이미 있는 이름만 읽을 수
                          # 있습니다.


# ── 세 가지 일 ──────────────────────────────────────────────────────
# 「일」은 이름을 붙여 두고 다시 부를 수 있는 프로그램 조각입니다.
# 일은 바깥의 이름을 읽을 수는 있어도 바꿀 수는 없습니다 — 그래서 이
# 셋은 그리기만 합니다. 막대 길이를 부르기 바로 앞줄에서 막대폭에
# 넣어 두는 것도 그 때문입니다.

글귀에게 머리그리기라는 일:
  화면 지워
  줄 그어
  가운데 말해줘 글귀
  줄 그어
끝

글귀에게 표지그리기라는 일:
  줄 그어
  가운데 말해줘 글귀
  줄 그어
끝

채울양에게 생명막대라는 일:
  남은칸은 채울양
  막대글은 찬칸 0개 붙인 것
  남은칸이 0보다 큰 동안
    막대글에 찬칸 더해
    남은칸에서 칸당생명 빼줘
  끝
  남은칸은 막대폭
  남은칸에서 채울양 빼줘
  남은칸이 0보다 큰 동안
    막대글에 빈칸 더해
    남은칸에서 칸당생명 빼줘
  끝
  막대글 말해줘
끝


# ── 시작 ────────────────────────────────────────────────────────────

화면 지워
줄 그어
가운데 말해줘 가라앉은 성
가운데 말해줘 턴제 롤플레잉 게임
줄 그어

이야기:

  바다가 하룻밤 사이에 성을 삼켰고, 물은 그 뒤로 빠지지 않았습니다.
  일 층 아래는 이제 사람의 자리가 아닙니다.
  당신에게는 등불 하나와 가방 하나, 그리고 딱히 좋다고 할 수 없는 이유가 있습니다.

끝

용사이름을 물어봐 당신을 무엇이라 부를까요?
만약에 용사이름이 없으면
  용사이름은 나그네
끝

줄 그어
전사는 한 대 맞고도 서 있습니다. 말해줘
마법사는 가장 세게 치고, 버틸 생명은 가장 적습니다. 말해줘
도적은 잡히지 않고, 한 판에 두 번 칩니다. 말해줘
궁수는 아물지 않는 상처를 남깁니다. 말해줘
직업선택을 물어봐 전사, 마법사, 도적, 궁수 — 무엇이 되시겠습니까?

# 네 가지 직업을 한 덩어리에서 다 정합니다. 다섯 번째를 만들고 싶으면
# 이 가지 중 하나를 그대로 복사해서 숫자만 바꾸면 됩니다.
만약에 직업선택이 마법사와 같으면
  직업이름은 마법사
  최대생명은 32
  용사공격은 5
  용사방어는 2
  최대기운은 18
  용사속도는 14
  기술이름은 푸른 불
  기술비용은 3
아니면 만약에 직업선택이 도적과 같으면
  직업이름은 도적
  최대생명은 30
  용사공격은 5
  용사방어는 2
  최대기운은 8
  용사속도는 30
  기술이름은 쌍칼
  기술비용은 3
아니면 만약에 직업선택이 궁수와 같으면
  직업이름은 궁수
  최대생명은 32
  용사공격은 5
  용사방어는 2
  최대기운은 10
  용사속도는 20
  기술이름은 먼 화살
  기술비용은 3
아니면
  직업이름은 전사
  최대생명은 34
  용사공격은 6
  용사방어는 4
  최대기운은 6
  용사속도는 8
  기술이름은 방패벽
  기술비용은 2
끝

줄 그어
쉬움에서는 적의 생명이 적고, 어려움에서는 많습니다. 말해줘
난도를 물어봐 쉬움, 보통, 어려움 중에 무엇으로 할까요?

만약에 난도가 쉬움과 같으면
  적생명보정은 0
  적공격보정은 0
아니면 만약에 난도가 어려움과 같으면
  적생명보정은 6
  적공격보정은 2
아니면
  적생명보정은 3
  적공격보정은 0
끝

용사생명은 최대생명
용사기운은 최대기운
용사레벨은 1
용사경험은 0
다음레벨은 14
약병수는 3
기운병수는 2
폭탄수는 1
주머니는 12
무기이름은 무딘 칼
갑옷이름은 가죽 옷
용사독은 0
층수는 1
최고층은 1
판수는 0
결말은 진행중
잡은것은 빈 표

줄 그어
용사이름 · 직업이름 · 내려갑니다 말해줘
당신의 기술은 기술이름 · 드는 기운은 기술비용 말해줘
1초 기다려


# ── 성 ──────────────────────────────────────────────────────────────
# 이 반복을 한 바퀴 도는 것이 한 층입니다. 결말이 진행중이 아니게 되면
# 반복이 끝납니다.

계속 반복해

  글귀판은 가라앉은 성
  글귀판에게 머리그리기 해줘

  # 이 층에 있는 것. 어느 가지든 같은 여덟 개의 이름을 정하므로,
  # 새 층을 만드는 일은 이 중 하나를 복사해 숫자를 바꾸는 것입니다.
  만약에 층수가 마지막층보다 크면
    적이름은 성을 지키는 자
    적최대생명은 48
    적공격은 11
    적속도는 16
    적금화는 60
    적경험은 40
    적독성은 참
  아니면 만약에 층수가 4와 같으면
    층의적은 목록 물에 잠긴 기사, 검은 뱀장어, 돌 문지기
    뽑은수는 1부터 3까지 무작위 숫자
    적이름은 층의적 뽑은수 번째
    적최대생명은 30
    적공격은 8
    적속도는 14
    적금화는 20
    적경험은 18
    적독성은 거짓
  아니면 만약에 층수가 3과 같으면
    층의적은 목록 흰 게, 여울 거미, 등불 도깨비
    뽑은수는 1부터 3까지 무작위 숫자
    적이름은 층의적 뽑은수 번째
    적최대생명은 25
    적공격은 7
    적속도는 18
    적금화는 15
    적경험은 13
    적독성은 참
  아니면 만약에 층수가 2와 같으면
    층의적은 목록 소금 사냥개, 찢어진 돛, 물에 젖은 쥐
    뽑은수는 1부터 3까지 무작위 숫자
    적이름은 층의적 뽑은수 번째
    적최대생명은 20
    적공격은 6
    적속도는 12
    적금화는 11
    적경험은 9
    적독성은 거짓
  아니면
    층의적은 목록 초록 덩어리, 굴 박쥐, 작은 게
    뽑은수는 1부터 3까지 무작위 숫자
    적이름은 층의적 뽑은수 번째
    적최대생명은 15
    적공격은 4
    적속도는 9
    적금화는 7
    적경험은 6
    적독성은 거짓
  끝

  적최대생명에 적생명보정 더해
  적공격에 적공격보정 더해
  적생명은 적최대생명
  적출혈은 0

  층수 층 말해줘
  적이름 앞을 막고 섭니다 말해줘

  # 백 번에 스무 번, 앞에 있는 것이 원래보다 큽니다. 20을 바꾸면
  # 성 전체가 같이 바뀝니다.
  큰녀석은 거짓
  20% 확률로
    큰녀석은 참
  끝
  만약에 큰녀석이 있으면
    적최대생명에 8 더해
    적공격에 2 더해
    적금화에 9 더해
    적경험에 6 더해
    적생명은 적최대생명
    다른 것들보다 덩치가 큽니다. 말해줘
  끝

  1초 기다려


  # ── 한 판의 싸움 ──────────────────────────────────────────────────
  # 이 반복을 한 바퀴 도는 것이 한 번 주고받는 것입니다.

  계속 반복해

    판수에 1 더해

    줄 그어
    적이름 적생명 / 적최대생명 말해줘
    막대폭은 적최대생명
    적생명에게 생명막대 해줘
    용사이름 용사생명 / 최대생명 · 기운 용사기운 / 최대기운 말해줘
    막대폭은 최대생명
    용사생명에게 생명막대 해줘
    약병 약병수 · 기운병 기운병수 · 폭탄 폭탄수 · 돈 주머니 말해줘
    당신의 기술은 기술이름 말해줘
    고른것을 물어봐 공격 · 기술 · 약병 · 기운병 · 폭탄 · 방어 · 도망

    막는중은 거짓

    만약에 고른것이 기술과 같으면

      만약에 용사기운이 기술비용보다 작으면
        기운이 모자라 아무 일도 일어나지 않습니다. 말해줘
      아니면
        용사기운에서 기술비용 빼줘
        만약에 직업이름이 마법사와 같으면
          준피해는 10부터 16까지 무작위 숫자
          준피해에 용사레벨 더해
          준피해에 용사공격 더해
          적생명에서 준피해 빼줘
          푸른 불이 준피해 만큼 태웁니다. 말해줘
        아니면 만약에 직업이름이 도적과 같으면
          준피해는 3부터 6까지 무작위 숫자
          준피해에 용사공격 더해
          적생명에서 준피해 빼줘
          첫 칼이 준피해 만큼 듭니다. 말해줘
          준피해는 3부터 6까지 무작위 숫자
          준피해에 용사공격 더해
          적생명에서 준피해 빼줘
          두 번째 칼이 준피해 만큼 듭니다. 말해줘
        아니면 만약에 직업이름이 궁수와 같으면
          준피해는 5부터 9까지 무작위 숫자
          준피해에 용사공격 더해
          적생명에서 준피해 빼줘
          적출혈은 3
          화살이 준피해 만큼 깊이 박혀 그대로 남습니다. 말해줘
        아니면
          준피해는 3부터 7까지 무작위 숫자
          준피해에 용사방어 더해
          적생명에서 준피해 빼줘
          용사생명에 6 더해
          만약에 용사생명이 최대생명보다 크면
            용사생명은 최대생명
          끝
          방패가 준피해 만큼 밀어내고 자세를 다잡습니다. 말해줘
        끝
      끝

    아니면 만약에 고른것이 약병과 같으면

      만약에 약병수가 0보다 크면
        약병수에서 1 빼줘
        용사생명에 약병회복 더해
        만약에 용사생명이 최대생명보다 크면
          용사생명은 최대생명
        끝
        용사독은 0
        한 병을 비우자 몸에서 찬 기운이 빠집니다. 말해줘
      아니면
        남은 병이 하나도 없습니다. 말해줘
      끝

    아니면 만약에 고른것이 기운병과 같으면

      만약에 기운병수가 0보다 크면
        기운병수에서 1 빼줘
        용사기운에 기운회복 더해
        만약에 용사기운이 최대기운보다 크면
          용사기운은 최대기운
        끝
        기운이 돌아옵니다. 말해줘
      아니면
        기운병이 없습니다. 말해줘
      끝

    아니면 만약에 고른것이 폭탄과 같으면

      만약에 폭탄수가 0보다 크면
        폭탄수에서 1 빼줘
        준피해는 폭탄위력
        적생명에서 준피해 빼줘
        폭탄이 준피해 만큼 터집니다. 말해줘
      아니면
        폭탄이 없습니다. 말해줘
      끝

    아니면 만약에 고른것이 방어와 같으면

      막는중은 참
      용사기운에 2 더해
      만약에 용사기운이 최대기운보다 크면
        용사기운은 최대기운
      끝
      발을 붙이고 오는 것을 기다립니다. 말해줘

    아니면 만약에 고른것이 도망과 같으면

      만약에 층수가 마지막층보다 크면
        등 뒤는 이미 물입니다. 이제 갈 곳이 없습니다. 말해줘
      아니면
        주사위는 1부터 100까지 무작위 숫자
        빠져나감은 거짓
        만약에 주사위가 도망확률보다 작으면
          빠져나감은 참
        끝
        만약에 빠져나감이 있으면
          계단을 두 칸씩 밟고 올라갑니다. 말해줘
          결말은 탈출
          멈춰
        아니면
          움직이기도 전에 계단 앞을 막아섭니다. 말해줘
        끝
      끝

    아니면

      # 위의 낱말이 아닌 것을 적으면 전부 그냥 한 대 치는 것이 됩니다.
      준피해는 3부터 8까지 무작위 숫자
      준피해에 용사공격 더해
      주사위는 1부터 100까지 무작위 숫자
      만약에 주사위가 치명확률보다 작으면
        준피해에 2 곱해
        빈틈으로 그대로 들어갑니다. 말해줘
      끝
      적생명에서 준피해 빼줘
      친 것이 준피해 만큼 듭니다. 말해줘

    끝

    # 궁수가 남긴 상처는 혼자서도 계속 벌어집니다.
    만약에 적출혈이 0보다 크면
      적출혈에서 1 빼줘
      적생명에서 3 빼줘
      상처가 아직 벌어져 3 더 깎입니다. 말해줘
    끝

    만약에 적생명이 1보다 작으면
      줄 그어
      적이름 쓰러졌습니다 말해줘
      멈춰
    끝


    # ── 적이 되받습니다 ─────────────────────────────────────────────

    받은피해는 2부터 6까지 무작위 숫자
    받은피해에 적공격 더해
    받은피해에서 용사방어 빼줘
    만약에 막는중이 있으면
      받은피해에서 용사방어 빼줘
      받은피해에서 2 빼줘
    끝

    # 빠르다는 것은 그것이 닿는 자리에 없다는 뜻입니다.
    주사위는 1부터 100까지 무작위 숫자
    피함은 거짓
    만약에 주사위가 용사속도보다 작으면
      피함은 참
    끝

    만약에 피함이 있으면
      덤벼들었지만 그 자리에 아무도 없습니다. 말해줘
    아니면
      만약에 받은피해가 1보다 작으면
        받은피해는 1
      끝
      용사생명에서 받은피해 빼줘
      적이름 되받아 받은피해 만큼 깎습니다 말해줘
      만약에 적독성이 있으면
        35% 확률로
          용사독은 3
          몸 안에 남은 것이 계속 아플 것 같습니다. 말해줘
        끝
      끝
    끝

    만약에 용사독이 0보다 크면
      용사독에서 1 빼줘
      용사생명에서 독피해 빼줘
      독이 독피해 만큼 더 깎습니다. 말해줘
    끝

    만약에 용사생명이 1보다 작으면
      줄 그어
      결말은 쓰러짐
      멈춰
    끝

  끝

  만약에 결말이 진행중과 같지 않으면
    멈춰
  끝


  # ── 싸움이 끝나고 ─────────────────────────────────────────────────

  주머니에 적금화 더해
  용사경험에 적경험 더해
  적금화 냥과 적경험 만큼의 배움을 얻었습니다 말해줘

  # 「표」는 이름 하나마다 값 하나를 두는 것입니다. 여기서는 무엇을 몇
  # 번 눕혔는지 세고, 마지막에 다시 꺼내 읽습니다.
  만약에 잡은것에 적이름이 있으면
    전에본수는 잡은것의 적이름
    전에본수에 1 더해
    잡은것에 적이름을 전에본수로 넣어
  아니면
    잡은것에 적이름을 1로 넣어
  끝

  용사경험이 다음레벨보다 큰 동안
    용사경험에서 다음레벨 빼줘
    용사레벨에 1 더해
    다음레벨에 4 더해
    용사방어에 1 더해
    줄 그어
    용사이름 이제 용사레벨 단계입니다 말해줘
    올릴것을 물어봐 무엇을 올릴까요 — 생명, 공격, 기운?
    만약에 올릴것이 공격과 같으면
      용사공격에 3 더해
      팔이 전보다 무거워집니다. 말해줘
    아니면 만약에 올릴것이 기운과 같으면
      최대기운에 4 더해
      용사기운은 최대기운
      기운이 더 깊어집니다. 말해줘
    아니면
      최대생명에 8 더해
      전보다 더 버틸 수 있게 됩니다. 말해줘
    끝
    용사생명은 최대생명
    줄 그어
  끝

  만약에 층수가 마지막층보다 크면
    결말은 도달
    멈춰
  끝

  # 한 층을 끝냈으면 생명을 조금 돌려받습니다.
  용사생명에 5 더해
  용사기운에 2 더해
  만약에 용사생명이 최대생명보다 크면
    용사생명은 최대생명
  끝
  만약에 용사기운이 최대기운보다 크면
    용사기운은 최대기운
  끝

  층수에 1 더해
  최고층은 층수


  # ── 층과 층 사이 ──────────────────────────────────────────────────
  # 계단에서 넷 중 하나가 기다립니다. 1부터 5까지로 바꾸고 가지를 하나
  # 더 쓰면 다섯 번째가 생깁니다.

  글귀판은 내려가는 계단
  글귀판에게 표지그리기 해줘

  주사위는 1부터 4까지 무작위 숫자

  만약에 주사위가 1과 같으면

    계단참에 상인이 자리를 폈습니다. 아무도 이유를 묻지 않습니다. 말해줘
    약병 약병값 · 기운병 기운병값 · 폭탄 폭탄값 · 벼림 벼림값 말해줘
    지금 주머니 냥 있습니다 말해줘
    산것을 물어봐 약병, 기운병, 폭탄, 벼림, 없음 중에 무엇을 살까요?

    만약에 산것이 약병과 같으면
      만약에 주머니가 약병값보다 크면
        주머니에서 약병값 빼줘
        약병수에 1 더해
        병 하나를 가방에 넣습니다. 말해줘
      아니면
        그것을 살 만큼은 없습니다. 말해줘
      끝
    아니면 만약에 산것이 기운병과 같으면
      만약에 주머니가 기운병값보다 크면
        주머니에서 기운병값 빼줘
        기운병수에 1 더해
        기운병 하나를 가방에 넣습니다. 말해줘
      아니면
        그것을 살 만큼은 없습니다. 말해줘
      끝
    아니면 만약에 산것이 폭탄과 같으면
      만약에 주머니가 폭탄값보다 크면
        주머니에서 폭탄값 빼줘
        폭탄수에 1 더해
        폭탄 하나를 조심해서 가방에 넣습니다. 말해줘
      아니면
        그것을 살 만큼은 없습니다. 말해줘
      끝
    아니면 만약에 산것이 벼림과 같으면
      만약에 주머니가 벼림값보다 크면
        주머니에서 벼림값 빼줘
        용사공격에 2 더해
        무기이름은 잘 벼린 칼
        상인이 한참 손을 보고 돌려줍니다. 말해줘
      아니면
        그것을 살 만큼은 없습니다. 말해줘
      끝
    아니면
      상인은 다시 무언가를 세기 시작합니다. 말해줘
    끝

  아니면 만약에 주사위가 2와 같으면

    이 아래에 물이 닿지 않은 사당이 있습니다. 있을 리가 없는 것입니다. 말해줘
    쉴것을 물어봐 여기서 쉴까요 — 네, 아니오?
    만약에 쉴것이 네와 같으면
      용사생명에 12 더해
      용사기운에 4 더해
      만약에 용사생명이 최대생명보다 크면
        용사생명은 최대생명
      끝
      만약에 용사기운이 최대기운보다 크면
        용사기운은 최대기운
      끝
      용사독은 0
      한참 앉아 있었습니다. 생각보다 많이 나아집니다. 말해줘
    아니면
      그대로 두고 지나갑니다. 말해줘
    끝

  아니면 만약에 주사위가 3과 같으면

    주운돈은 8부터 22까지 무작위 숫자
    주머니에 주운돈 더해
    계단 밑에 무언가 걸려 있습니다 — 주운돈 냥 말해줘
    30% 확률로
      약병수에 1 더해
      뚜껑도 열리지 않은 병 하나가 같이 나옵니다. 말해줘
    끝

  아니면

    발밑의 계단이 내려앉습니다. 말해줘
    받은피해는 3부터 8까지 무작위 숫자
    받은피해에서 용사방어 빼줘
    만약에 받은피해가 1보다 작으면
      받은피해는 1
    끝
    용사생명에서 받은피해 빼줘
    받은피해 만큼 깎였습니다 말해줘
    만약에 용사생명이 1보다 작으면
      결말은 쓰러짐
      멈춰
    끝

  끝

  1초 기다려

끝


# ── 마지막 ──────────────────────────────────────────────────────────

화면 지워
줄 그어

만약에 결말이 도달과 같으면
  가운데 말해줘 성의 맨 아래
  줄 그어
  이야기:

    물이 무릎에서 멈추고 더 깊어지지 않습니다.
    성을 지키던 자가 지키던 것은 이제 당신의 것입니다.
    위에 있는 사람들은 한 마디도 믿지 않을 것입니다.

  끝
아니면 만약에 결말이 탈출과 같으면
  가운데 말해줘 나가는 길
  줄 그어
  이야기:

    계단은 아무 일도 없던 저녁 공기 속으로 이어집니다.
    옷은 다 젖었고, 아직 손가락을 세어 보고 있습니다.
    성은 내일도 저 아래 그대로 있을 것입니다.

  끝
아니면
  가운데 말해줘 여기까지
  줄 그어
  이야기:

    등불이 먼저 꺼지고, 그다음에 나머지가 꺼집니다.
    성은 가져간 것을 돌려주지 않습니다.
    다음 사람은 한 층쯤 더 내려갈지도 모릅니다.

  끝
끝

줄 그어
용사이름 · 직업이름 · 용사레벨 단계 말해줘
무기 무기이름 · 갑옷 갑옷이름 말해줘
가장 깊이 최고층 층 · 주고받은 판수 판 · 돈 주머니 냥 말해줘
줄 그어
오는 길에 눕힌 것 말해줘
잡은것의 짐승마다 반복해
  몇번은 잡은것의 짐승
  짐승 몇번 말해줘
끝
줄 그어`,
    },
    {
      id: 'baseball',
      label: '숫자 야구',
      group: 'game',
      answers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '1', '2', '3', '4', '5', '6', '7', '8', '9', '1', '2', '3', '4', '5', '6'],
      expect: '숫자 야구',
      source: `# 숫자 야구. 컴퓨터가 숫자 세 개를 정해 두고, 그것을 맞히는 놀이입니다.
# 자리까지 맞으면 스트라이크, 숫자만 맞고 자리가 다르면 볼입니다.
#
# 앞에 #이 붙은 줄은 아무 일도 하지 않습니다. 사람이 읽는 쪽지입니다.

숨은첫째는 1부터 9까지 무작위 숫자
숨은둘째는 1부터 9까지 무작위 숫자
숨은셋째는 1부터 9까지 무작위 숫자
남은판은 8

화면 지워
줄 그어
가운데 말해줘 숫자 야구
줄 그어
1부터 9까지의 숫자 셋입니다. 같은 숫자가 겹칠 수도 있습니다. 말해줘
자리까지 맞으면 스트라이크, 숫자만 맞으면 볼입니다. 말해줘

계속 반복해

  줄 그어
  남은 판 — 남은판 말해줘
  고른첫째를 숫자로 물어봐 첫 번째 숫자
  고른둘째를 숫자로 물어봐 두 번째 숫자
  고른셋째를 숫자로 물어봐 세 번째 숫자

  스트라이크수는 0
  볼수는 0

  # 숫자 하나마다 제자리를 먼저 보고, 아니면 나머지 두 자리를 봅니다.
  만약에 고른첫째가 숨은첫째와 같으면
    스트라이크수에 1 더해
  아니면 만약에 고른첫째가 숨은둘째와 같으면
    볼수에 1 더해
  아니면 만약에 고른첫째가 숨은셋째와 같으면
    볼수에 1 더해
  끝

  만약에 고른둘째가 숨은둘째와 같으면
    스트라이크수에 1 더해
  아니면 만약에 고른둘째가 숨은첫째와 같으면
    볼수에 1 더해
  아니면 만약에 고른둘째가 숨은셋째와 같으면
    볼수에 1 더해
  끝

  만약에 고른셋째가 숨은셋째와 같으면
    스트라이크수에 1 더해
  아니면 만약에 고른셋째가 숨은첫째와 같으면
    볼수에 1 더해
  아니면 만약에 고른셋째가 숨은둘째와 같으면
    볼수에 1 더해
  끝

  스트라이크 스트라이크수 · 볼 볼수 말해줘

  만약에 스트라이크수가 3과 같으면
    줄 그어
    세 개 다 맞혔습니다. 말해줘
    멈춰
  끝

  남은판에서 1 빼줘
  만약에 남은판이 1보다 작으면
    줄 그어
    판이 다 끝났습니다. 답은 숨은첫째 숨은둘째 숨은셋째 말해줘
    멈춰
  끝

끝`,
    },
    {
      id: 'wordguess',
      label: '낱말 맞히기',
      group: 'game',
      answers: ['피아노', '피아노', '피아노'],
      expect: '낱말 맞히기',
      source: `# 낱말 맞히기. 컴퓨터가 낱말 하나를 고르고 짝이 되는 힌트를 줍니다.
# 기회는 세 번입니다.
#
# 두 목록은 나란히 놓여 있습니다 — 첫 번째 낱말과 첫 번째 힌트가 짝입니다.
# 다섯 번째 낱말과 다섯 번째 힌트를 넣으면 놀이가 그만큼 커집니다.

낱말들은 목록 피아노, 항구, 펭귄, 우산
힌트들은 목록 검은 건반이 있는 것, 배가 쉬어 가는 곳, 헤엄치는 새, 비가 오면 펴는 것

뽑은수는 1부터 4까지 무작위 숫자
답낱말은 낱말들 뽑은수 번째
그힌트는 힌트들 뽑은수 번째
남은기회는 3

화면 지워
줄 그어
가운데 말해줘 낱말 맞히기
줄 그어
힌트입니다. 말해줘
그힌트 말해줘
줄 그어

계속 반복해

  고른낱말을 물어봐 무슨 낱말일까요?

  만약에 고른낱말이 답낱말과 같으면
    줄 그어
    바로 그것입니다. 말해줘
    멈춰
  끝

  남은기회에서 1 빼줘

  만약에 남은기회가 1보다 작으면
    줄 그어
    답은 답낱말 이었습니다 말해줘
    멈춰
  끝

  그것은 아닙니다. 남은 기회 — 남은기회 말해줘

끝`,
    },
    {
      id: 'memory',
      label: '어디까지 외울 수 있나',
      group: 'game',
      answers: ['빨강', '초록', '파랑', '노랑'],
      expect: '어디까지 외울 수 있습니까',
      source: `# 기억 놀이. 색이 한 판마다 하나씩 길어집니다. 잘 보아 두었다가, 화면이
# 지워지면 빈칸을 사이에 두고 그대로 적으면 됩니다.
#
# 하나라도 틀리면 그 자리에서 끝나고, 어디까지 갔는지 알려 줍니다.

색들은 목록 빨강, 초록, 파랑, 노랑
나온줄은 빈 목록
판수는 0

화면 지워
줄 그어
가운데 말해줘 어디까지 외울 수 있습니까
줄 그어
빨강, 초록, 파랑, 노랑 네 가지입니다. 말해줘
2초 기다려

계속 반복해

  판수에 1 더해
  뽑은수는 1부터 4까지 무작위 숫자
  새색은 색들 뽑은수 번째
  나온줄에 새색 넣어

  화면 지워
  줄 그어
  판수 판째 말해줘
  나온줄을 빈칸으로 이어 말해줘
  줄 그어
  3초 기다려

  화면 지워
  답한것을 물어봐 방금 줄을 빈칸을 두고 적어 주세요
  나눈것은 답한것을 빈칸으로 나눈 것

  만약에 나눈것이 나온줄과 같으면
    맞았습니다. 말해줘
    1초 기다려
  아니면
    줄 그어
    아쉽습니다 — 줄은 이랬습니다 말해줘
    나온줄을 빈칸으로 이어 말해줘
    여기까지 외웠습니다 — 판수 말해줘
    멈춰
  끝

끝`,
    },
    {
      id: 'shop',
      label: '골목 가게',
      group: 'big',
      answers: ['빵', '치즈', '그만'],
      expect: '골목 가게',
      source: `# 작은 가게. 값은 「표」에 있습니다 — 이름 하나마다 숫자 하나입니다.
# 장바구니는 「목록」입니다. 그만이라고 적을 때까지 살 수 있습니다.
#
# 표에 한 줄, 목록에 이름 하나를 더하면 파는 것이 하나 늘어납니다.
# 나머지는 하나도 고치지 않아도 됩니다.

값표는 빈 표
값표에 빵을 3으로 넣어
값표에 치즈를 7으로 넣어
값표에 사과를 2로 넣어
값표에 커피를 5로 넣어

살것들은 목록 빵, 치즈, 사과, 커피
장바구니는 빈 목록
쓴돈은 0
주머니는 20

화면 지워
줄 그어
가운데 말해줘 골목 가게
줄 그어

계속 반복해

  지금 주머니 남았습니다 말해줘
  선반에 있는 것 말해줘
  살것들의 물건마다 자리와 함께 반복해
    물건값은 값표의 물건
    자리 · 물건 · 물건값 말해줘
  끝

  살것을 물어봐 무엇을 사시겠습니까? 그만이라고 적으면 끝냅니다.

  만약에 살것이 그만과 같으면
    멈춰
  끝

  만약에 살것들에 살것이 있으면
    물건값은 값표의 살것
    만약에 물건값이 주머니보다 크면
      그것을 살 만큼은 없습니다. 말해줘
    아니면
      주머니에서 물건값 빼줘
      쓴돈에 물건값 더해
      장바구니에 살것 넣어
      바구니에 넣었습니다 — 살것 · 물건값 냈습니다 말해줘
    끝
  아니면
    그것은 팔지 않습니다. 말해줘
  끝

  줄 그어

끝

줄 그어
바구니 안에 든 것 말해줘
장바구니의 물건마다 반복해
  물건 말해줘
끝
줄 그어
장바구니 개수 가지 · 쓴돈 냄 · 주머니 남음 말해줘`,
    },
    {
      id: 'gradebook',
      label: '점수표',
      group: 'big',
      answers: [],
      expect: '점수표',
      source: `# 점수표. 나란히 놓인 두 목록입니다 — 첫 번째 이름과 첫 번째 점수가 짝입니다.
#
# 평균은 합계에서 사람 수를 계속 빼면서 몇 번 빠지는지 세어 구합니다.
# 나눗셈이란 원래 그런 것입니다.

이름들은 목록 미나, 아다, 보, 라비, 서니
점수들은 목록 88, 95, 61, 74, 95

화면 지워
줄 그어
가운데 말해줘 점수표
줄 그어

이름들의 사람마다 자리와 함께 반복해
  그점수는 점수들 자리 번째
  자리 · 사람 · 그점수 말해줘
끝

줄 그어
사람수는 이름들 개수
합계는 점수들 합
최고점은 점수들 중 가장 큰 것
최저점은 점수들 중 가장 작은 것
사람수 명 · 모두 합쳐 합계 말해줘
가장 높은 점수 최고점 · 가장 낮은 점수 최저점 말해줘

# 평균은 합계에서 사람 수를 계속 빼면서 몇 번 빠지는지 세면 나옵니다.
# 나눗셈이 속으로 하는 일이 이것입니다.
평균은 0
남은수는 합계
남은수가 사람수보다 큰 동안
  남은수에서 사람수 빼줘
  평균에 1 더해
끝
평균은 평균 말해줘

줄 그어
줄세운것은 빈 목록
점수들의 그점수마다 반복해
  줄세운것에 그점수 넣어
끝
줄세운것 정렬해
줄세운것 거꾸로 해
높은 점수부터 말해줘
줄세운것을 빈칸으로 이어 말해줘`,
    },
    {
      id: 'peace',
      label: '평화 — 가장 큰 것',
      group: 'rpg',
      answers: ['불러오기', 'x'],
      expect: '열세 직업 · 여섯 난이도 · 한 줄 세이브 코드',
      fixed: true,
      source: `# ════════════════════════════════════════════════════════════════════
# 평화
# 마왕을 쓰러뜨리고 세계의 평화를 되찾는 대형 턴제 롤플레잉 게임
#
# 이 파일은 NeedMoreEasy 0.7.1의 최신 한국어 문장문법만으로 썼습니다.
# 파이썬 문법과 영어 명령은 한 줄도 사용하지 않았습니다.
#
# ── 처음 고쳐 보는 분께 ─────────────────────────────────────────────
# 앞에 #이 붙은 줄은 컴퓨터가 읽지 않는 설명입니다.
# 이런 설명을 전부 지워도 게임은 똑같이 돌아갑니다.
#
# 가장 먼저 아래 「수정 손잡이」의 숫자를 바꿔 보세요.
# 적의 생명, 물약의 회복량, 상점 가격처럼 자주 바꿀 값이 모여 있습니다.
# 그다음에는 「지역과 적」에서 이름과 수치를 바꾸면 됩니다.
# 적 하나는 이름, 생명, 공격, 방어, 속도, 보상, 특징으로 이루어집니다.
# 같은 모양의 갈래 하나를 복사하면 새 지역도 쉽게 만들 수 있습니다.
#
# ── 게임에 들어 있는 것 ─────────────────────────────────────────────
# 열세 가지 직업과 서로 다른 전용 기술과 궁극기
# 기본 지역 열두 곳과 조건부 숨은 지역, 각자 싸우는 법이 다른 열세 적
# 사연과 선택을 가진 열한 명의 고유 등장인물과 세력 평판
# 생명과 기운, 치명타, 회피, 방어, 화상, 출혈, 독
# 아홉 가지 소비 물품, 무기·갑옷·장신구, 내구도와 수리, 경험치와 단계 상승
# 세 단계로 변하는 마왕전과 선택에 따라 달라지는 후일담
# 100 브론즈와 10 실버와 1 골드가 같은 가치를 가지는 왕국 화폐
# 적의 다음 행동을 먼저 보여 주는 의도와 대응 전술
# 속성 약점, 균형 파괴, 기절, 직업별 궁극기
# 모집한 동료의 지원, 일곱 재료와 열 가지 야영 제작법
# 수요·재고·전황·평판으로 움직이는 지역 경제와 매입·판매
# 퀘스트 일지, 업적 목록, 괴물 도감, 조건부 숨은 보스
# 한 줄짜리 한국어 세이브 코드를 이용한 저장과 불러오기
#
# ── 실행하는 법 ─────────────────────────────────────────────────────
# needmoreeasy.com의 한국어 화면에서 이 파일 전체를 붙여넣고 실행합니다.
# 컴퓨터에 설치했다면 nme r peace.ko.nme 이라고 입력합니다.
# ════════════════════════════════════════════════════════════════════


# ── 수정 손잡이 ─────────────────────────────────────────────────────
# 이곳의 값만 바꿔도 게임 전체의 느낌이 달라집니다.

마지막지역은 13             # 열세 번째는 조건을 만족해야 열리는 숨은 지역
회복약회복은 30             # 회복약 하나가 되돌리는 생명
고급회복약회복은 65
기운약회복은 12             # 기운약 하나가 되돌리는 기운
폭탄위력은 24               # 폭탄은 적의 방어를 무시합니다
회복약기준값은 25           # 실제 가격은 기준값에 전황과 재고를 더해 정합니다
고급회복약기준값은 58
기운약기준값은 40
해독제기준값은 22
폭탄기준값은 70
성수기준값은 55
연막탄기준값은 38
숫돌기준값은 32
야영식량기준값은 18
# 아래 세 이름은 첫 지역의 기본값이며, 상점에 들어갈 때 경제 상황으로 다시 계산합니다.
회복약값은 회복약기준값
기운약값은 기운약기준값
폭탄값은 폭탄기준값
무기강화값은 120
갑옷강화값은 120
수리기준값은 20
치명확률은 14               # 백 번 가운데 치명타가 나오는 횟수
기본도망확률은 65
독피해는 3
화상피해는 4
출혈피해는 3
찬칸은 ■
빈칸은 ·
칸당생명은 5
막대폭은 20
짧은기다림은 1
궁극기최대는 100
동료지원확률은 35
최대회피확률은 45
약점배율은 2
회복약약초비용은 2
폭탄광석비용은 2
폭탄가루비용은 1
룬광석비용은 2
룬가루비용은 2
시장최대재고는 7

# 빠른시험을 참으로 바꾸면 시작 능력이 크게 올라갑니다.
# 새 적이나 장면을 만든 뒤 끝까지 빨리 확인할 때 쓰는 손잡이입니다.
빠른시험은 거짓


# ── 화면을 그리는 일 ────────────────────────────────────────────────
# 「일」은 여러 문장을 이름 하나로 묶은 것입니다.
# 아래 일들은 값만 받아 화면을 그리므로 다른 곳에서도 안전하게 씁니다.

# 일 안에서 읽을 최대값은 먼저 이름을 만들어 두어야 숫자로 인식됩니다.
막대최대양은 1

글귀에게 큰제목그리기라는 일:
  화면 지워
  줄 그어
  가운데 말해줘 글귀
  줄 그어
끝

글귀에게 작은제목그리기라는 일:
  줄 그어
  가운데 말해줘 글귀
  줄 그어
끝

채울양에게 생명막대그리기라는 일:
  # 생명이 수백으로 커져도 막대는 언제나 스무 칸입니다.
  # 나눗셈 대신 양쪽에 같은 수를 곱해 정수만으로 비율을 비교합니다.
  막대글은 찬칸 0개 붙인 것
  막대차례는 0
  20번 반복해
    막대차례에 1 더해
    현재비교값은 채울양
    현재비교값에 20 곱해
    최대비교값은 막대최대양
    최대비교값에 막대차례 곱해
    만약에 현재비교값이 최대비교값보다 크거나 같으면
      막대글에 찬칸 더해
    아니면
      막대글에 빈칸 더해
    끝
  끝
  막대글 말해줘
끝

# 왕국의 화폐는 100 브론즈가 10 실버이고, 10 실버가 1 골드입니다.
# 게임 안에서는 계산이 쉬운 브론즈로 저장하고 보여 줄 때 세 화폐로 나눕니다.
# 화폐 비율을 바꾸고 싶다면 아래 두 반복의 100과 10을 함께 바꾸면 됩니다.
보유동전에게 화폐보이기라는 일:
  표시골드는 0
  표시실버는 0
  표시브론즈는 보유동전
  표시브론즈가 99보다 큰 동안
    표시브론즈에서 100 빼줘
    표시골드에 1 더해
  끝
  표시브론즈가 9보다 큰 동안
    표시브론즈에서 10 빼줘
    표시실버에 1 더해
  끝
  골드 표시골드 · 실버 표시실버 · 브론즈 표시브론즈 말해줘
끝


# ── 세이브 코드 부호화와 복원 ──────────────────────────────────────
# 숫자 0부터 9를 가부터 차까지의 열 글자로 바꿉니다.
# 파일을 전혀 쓰지 않으므로 웹 실행기와 설치판에서 똑같이 작동합니다.
# 저장값은 열 글자만 쓰고, 불러올 때 그 글자를 다시 숫자로 계산합니다.

저장칸들은 빈 목록
복원숫자들은 빈 목록
빈바탕은 가

저장값에게 코드칸넣기라는 일:
  코드기호들은 빈 목록
  남은코드값은 저장값
  만약에 남은코드값이 0과 같으면
    코드기호들에 가 넣어
  끝
  남은코드값이 0보다 큰 동안
    코드몫은 0
    코드나머지는 남은코드값
    코드나머지가 9보다 큰 동안
      코드나머지에서 10 빼줘
      코드몫에 1 더해
    끝
    만약에 코드나머지가 0과 같으면
      코드기호들에 가 넣어
    아니면 만약에 코드나머지가 1과 같으면
      코드기호들에 나 넣어
    아니면 만약에 코드나머지가 2와 같으면
      코드기호들에 다 넣어
    아니면 만약에 코드나머지가 3과 같으면
      코드기호들에 라 넣어
    아니면 만약에 코드나머지가 4와 같으면
      코드기호들에 마 넣어
    아니면 만약에 코드나머지가 5와 같으면
      코드기호들에 바 넣어
    아니면 만약에 코드나머지가 6과 같으면
      코드기호들에 사 넣어
    아니면 만약에 코드나머지가 7과 같으면
      코드기호들에 아 넣어
    아니면 만약에 코드나머지가 8과 같으면
      코드기호들에 자 넣어
    아니면
      코드기호들에 차 넣어
    끝
    남은코드값은 코드몫
  끝
  코드기호들 거꾸로 해
  완성코드칸은 빈바탕을 0개 붙인 것
  코드기호들의 코드기호마다 반복해
    완성코드칸에 코드기호 더해
  끝
  저장칸들에 완성코드칸 넣어
끝

코드문에게 코드숫자읽기라는 일:
  읽은코드값은 0
  코드문의 코드글자마다 반복해
    코드자릿수는 0
    코드자릿수에서 1 빼줘
    만약에 코드글자가 가와 같으면
      코드자릿수는 0
    아니면 만약에 코드글자가 나와 같으면
      코드자릿수는 1
    아니면 만약에 코드글자가 다와 같으면
      코드자릿수는 2
    아니면 만약에 코드글자가 라와 같으면
      코드자릿수는 3
    아니면 만약에 코드글자가 마와 같으면
      코드자릿수는 4
    아니면 만약에 코드글자가 바와 같으면
      코드자릿수는 5
    아니면 만약에 코드글자가 사와 같으면
      코드자릿수는 6
    아니면 만약에 코드글자가 아와 같으면
      코드자릿수는 7
    아니면 만약에 코드글자가 자와 같으면
      코드자릿수는 8
    아니면 만약에 코드글자가 차와 같으면
      코드자릿수는 9
    끝
    만약에 코드자릿수가 0보다 크거나 같으면
      읽은코드값에 10 곱해
      읽은코드값에 코드자릿수 더해
    끝
  끝
  복원숫자들에 읽은코드값 넣어
끝


# ── 첫 화면과 새 모험 또는 불러오기 ────────────────────────────────

시간 재기 시작해
글귀판은 평화
글귀판에게 큰제목그리기 해줘
가운데 말해줘 마왕을 쓰러뜨리고 아르테리아 왕국을 구하라
가운데 말해줘 열세 직업 · 여섯 난이도 · 한 줄 세이브 코드
줄 그어

첫화면후보들은 목록 새게임, 불러오기
첫화면입력끝값은 0
첫화면입력끝값이 1보다 작은 동안
  첫선택을 물어봐 새게임 또는 불러오기 가운데 하나를 골라 주세요
  만약에 첫화면후보들에 첫선택이 있으면
    첫화면입력끝값은 1
  아니면
    🟦 새게임 또는 불러오기를 정확히 적어 주세요. 말해줘
  끝
끝
새로운모험은 참
만약에 첫선택이 불러오기와 같으면
  새로운모험은 거짓
끝

용사이름은 기억을 잇는 용사
직업선택은 왕국기사
난도선택은 보통
연출번호는 1
화면번호는 1

만약에 새로운모험이 있으면
  연출후보들은 목록 즉시, 천천히, 아주천천히
  연출입력끝값은 0
  연출입력끝값이 1보다 작은 동안
    연출선택을 물어봐 글이 나타나는 속도를 골라 주세요. 즉시, 천천히, 아주천천히
    만약에 연출후보들에 연출선택이 있으면
      연출입력끝값은 1
    아니면
      🟦 세 속도 가운데 하나를 다시 적어 주세요. 말해줘
    끝
  끝
  만약에 연출선택이 천천히와 같으면
    연출번호는 2
  아니면 만약에 연출선택이 아주천천히와 같으면
    연출번호는 3
  끝
  화면후보들은 목록 화려하게, 단순하게
  화면입력끝값은 0
  화면입력끝값이 1보다 작은 동안
    화면선택을 물어봐 화면 표시를 골라 주세요. 화려하게, 단순하게
    만약에 화면후보들에 화면선택이 있으면
      화면입력끝값은 1
    아니면
      🟦 화려하게 또는 단순하게를 적어 주세요. 말해줘
    끝
  끝
  만약에 화면선택이 단순하게와 같으면
    화면번호는 2
  끝

  만약에 연출번호가 2와 같으면
    천천히 말해줘 아르테리아 왕국은 인간과 엘프와 드워프가 맺은 오래된 약속 위에 세워졌습니다.
    천천히 말해줘 그러나 북쪽 검은 산맥에서 마왕 모르가르가 깨어나 열두 영지를 차례로 점령했습니다.
    천천히 말해줘 전쟁이 길어지자 광산은 멎고 곡물 수레는 끊겼으며 같은 빵도 성마다 값이 달라졌습니다.
    천천히 말해줘 국왕은 수도를 지키다 쓰러졌고 살아남은 왕녀 엘레노아가 마지막 성화를 지키고 있습니다.
    천천히 말해줘 이 전쟁은 검 한 자루로 끝나지 않습니다. 사람과 물자와 약속을 다시 이어야 진짜 평화가 옵니다.
  아니면 만약에 연출번호가 3과 같으면
    아주 천천히 말해줘 아르테리아 왕국은 인간과 엘프와 드워프가 맺은 오래된 약속 위에 세워졌습니다.
    아주 천천히 말해줘 그러나 북쪽 검은 산맥에서 마왕 모르가르가 깨어나 열두 영지를 차례로 점령했습니다.
    아주 천천히 말해줘 전쟁이 길어지자 광산은 멎고 곡물 수레는 끊겼으며 같은 빵도 성마다 값이 달라졌습니다.
    아주 천천히 말해줘 국왕은 수도를 지키다 쓰러졌고 살아남은 왕녀 엘레노아가 마지막 성화를 지키고 있습니다.
    아주 천천히 말해줘 이 전쟁은 검 한 자루로 끝나지 않습니다. 사람과 물자와 약속을 다시 이어야 진짜 평화가 옵니다.
  아니면
    이야기:

      아르테리아 왕국은 인간과 엘프와 드워프가 맺은 오래된 약속 위에 세워졌습니다.
      그러나 북쪽 검은 산맥에서 마왕 모르가르가 깨어나 열두 영지를 차례로 점령했습니다.
      전쟁이 길어지자 광산은 멎고 곡물 수레는 끊겼으며 같은 빵도 성마다 값이 달라졌습니다.
      국왕은 수도를 지키다 쓰러졌고 살아남은 왕녀 엘레노아가 마지막 성화를 지키고 있습니다.
      이 전쟁은 검 한 자루로 끝나지 않습니다. 사람과 물자와 약속을 다시 이어야 진짜 평화가 옵니다.

    끝
  끝
  이름입력끝값은 0
  이름입력끝값이 1보다 작은 동안
    용사이름을 물어봐 마왕 토벌에 나설 모험가의 이름은 무엇입니까?
    만약에 용사이름이 없으면
      용사이름은 이름 없는 용사
      이름입력끝값은 1
    아니면
      이름검사조각들은 용사이름을 쉼표로 나눈 것
      만약에 이름검사조각들 개수가 1과 같으면
        이름입력끝값은 1
      아니면
        🟦 세이브 코드와 겹치므로 이름에는 쉼표를 쓸 수 없습니다. 다시 적어 주세요. 말해줘
      끝
    끝
  끝

  # 직업은 능력치뿐 아니라 기술, 궁극기, 전투 특성이 모두 다릅니다.
  글귀판은 열세 직업
  글귀판에게 작은제목그리기 해줘
  왕국기사 · 방어와 아군 보호 · 충격 말해줘
  원소마법사 · 화상과 넓은 피해 · 화염 말해줘
  엘프궁수 · 연속 공격과 출혈 · 관통 말해줘
  성직자 · 회복과 정화 · 신성 말해줘
  그림자도적 · 높은 회피와 중독 · 독 말해줘
  북방광전사 · 잃은 생명으로 강해지는 공격 · 충격 말해줘
  룬대장장이 · 장비 수리와 갑옷 파괴 · 충격 말해줘
  음유시인 · 전의와 적 균형을 흔드는 노래 · 공명 말해줘
  숲의드루이드 · 재생과 덩굴 속박 · 자연 말해줘
  황혼흑마법사 · 생명 흡수와 위험한 계약 · 암흑 말해줘
  용혈기병 · 방어를 꿰뚫는 용염의 창 · 용염 말해줘
  시간술사 · 빠른 행동과 차례 지연 · 시간 말해줘
  운명도박꾼 · 공개된 확률과 실패 보호 · 운명 말해줘
  직업후보들은 목록 왕국기사, 원소마법사, 엘프궁수, 성직자, 그림자도적, 북방광전사, 룬대장장이, 음유시인, 숲의드루이드, 황혼흑마법사, 용혈기병, 시간술사, 운명도박꾼
  직업입력끝값은 0
  직업입력끝값이 1보다 작은 동안
    직업선택을 물어봐 원하는 직업 이름을 정확히 적어 주세요
    만약에 직업후보들에 직업선택이 있으면
      직업입력끝값은 1
    아니면
      🟦 목록에 없는 직업입니다. 띄어쓰기 없이 다시 적어 주세요. 말해줘
    끝
  끝

  글귀판은 여섯 난이도
  글귀판에게 작은제목그리기 해줘
  매우 쉬움은 이야기를 편하게 보는 난이도입니다. 말해줘
  쉬움은 전투에 익숙하지 않은 사람을 위한 난이도입니다. 말해줘
  보통은 경제와 전투의 기준 균형입니다. 말해줘
  어려움은 물자 준비와 적 의도 대응이 필요합니다. 말해줘
  매우 어려움은 장비와 제작을 계획해야 이길 수 있습니다. 말해줘
  불가능은 모든 시스템을 이해한 사람을 위한 극한 도전입니다. 말해줘
  난도후보들은 목록 매우 쉬움, 쉬움, 보통, 어려움, 매우 어려움, 불가능
  난도입력끝값은 0
  난도입력끝값이 1보다 작은 동안
    난도선택을 물어봐 매우 쉬움, 쉬움, 보통, 어려움, 매우 어려움, 불가능 가운데 골라 주세요
    만약에 난도후보들에 난도선택이 있으면
      난도입력끝값은 1
    아니면
      🟦 목록에 없는 난이도입니다. 화면의 이름을 그대로 적어 주세요. 말해줘
    끝
  끝
끝


# ── 열세 직업의 시작 능력 ──────────────────────────────────────────

만약에 직업선택이 원소마법사와 같으면
  직업번호는 2
  직업이름은 원소마법사
  최대생명은 48
  용사공격은 9
  용사방어는 3
  최대기운은 28
  용사속도는 13
  기술이름은 화염구
  기술비용은 6
  기술속성은 화염
  궁극기이름은 대화염폭풍
  직업특성은 마력과 화상
아니면 만약에 직업선택이 엘프궁수와 같으면
  직업번호는 3
  직업이름은 엘프궁수
  최대생명은 54
  용사공격은 8
  용사방어는 4
  최대기운은 20
  용사속도는 27
  기술이름은 연속사격
  기술비용은 4
  기술속성은 관통
  궁극기이름은 천개의화살
  직업특성은 연속 사격과 출혈
아니면 만약에 직업선택이 성직자와 같으면
  직업번호는 4
  직업이름은 성직자
  최대생명은 60
  용사공격은 7
  용사방어는 6
  최대기운은 24
  용사속도는 15
  기술이름은 성광
  기술비용은 5
  기술속성은 신성
  궁극기이름은 여신의심판
  직업특성은 회복과 정화
아니면 만약에 직업선택이 그림자도적과 같으면
  직업번호는 5
  직업이름은 그림자도적
  최대생명은 50
  용사공격은 8
  용사방어는 4
  최대기운은 22
  용사속도는 32
  기술이름은 맹독비수
  기술비용은 4
  기술속성은 독
  궁극기이름은 그림자처형
  직업특성은 회피와 중독
아니면 만약에 직업선택이 북방광전사와 같으면
  직업번호는 6
  직업이름은 북방광전사
  최대생명은 78
  용사공격은 10
  용사방어는 3
  최대기운은 16
  용사속도는 12
  기술이름은 광전도끼
  기술비용은 4
  기술속성은 충격
  궁극기이름은 라그나의분노
  직업특성은 잃은 생명과 분노
아니면 만약에 직업선택이 룬대장장이와 같으면
  직업번호는 7
  직업이름은 룬대장장이
  최대생명은 70
  용사공격은 7
  용사방어는 8
  최대기운은 20
  용사속도는 8
  기술이름은 룬망치
  기술비용은 5
  기술속성은 충격
  궁극기이름은 대지의모루
  직업특성은 수리와 갑옷 파괴
아니면 만약에 직업선택이 음유시인과 같으면
  직업번호는 8
  직업이름은 음유시인
  최대생명은 56
  용사공격은 6
  용사방어는 5
  최대기운은 28
  용사속도는 20
  기술이름은 파열음
  기술비용은 4
  기술속성은 공명
  궁극기이름은 영웅서사시
  직업특성은 전의와 균형 파괴
아니면 만약에 직업선택이 숲의드루이드와 같으면
  직업번호는 9
  직업이름은 숲의드루이드
  최대생명은 62
  용사공격은 7
  용사방어는 5
  최대기운은 30
  용사속도는 17
  기술이름은 덩굴속박
  기술비용은 5
  기술속성은 자연
  궁극기이름은 고대숲의분노
  직업특성은 재생과 속박
아니면 만약에 직업선택이 황혼흑마법사와 같으면
  직업번호는 10
  직업이름은 황혼흑마법사
  최대생명은 52
  용사공격은 9
  용사방어는 3
  최대기운은 28
  용사속도는 14
  기술이름은 생명착취
  기술비용은 6
  기술속성은 암흑
  궁극기이름은 심연의계약
  직업특성은 생명 흡수와 계약
아니면 만약에 직업선택이 용혈기병과 같으면
  직업번호는 11
  직업이름은 용혈기병
  최대생명은 66
  용사공격은 9
  용사방어는 7
  최대기운은 18
  용사속도는 16
  기술이름은 용염창
  기술비용은 5
  기술속성은 용염
  궁극기이름은 붉은용의강림
  직업특성은 관통과 용염
아니면 만약에 직업선택이 시간술사와 같으면
  직업번호는 12
  직업이름은 시간술사
  최대생명은 46
  용사공격은 8
  용사방어는 4
  최대기운은 32
  용사속도는 24
  기술이름은 시간균열
  기술비용은 6
  기술속성은 시간
  궁극기이름은 멈춘세계
  직업특성은 차례 지연과 가속
아니면 만약에 직업선택이 운명도박꾼과 같으면
  직업번호는 13
  직업이름은 운명도박꾼
  최대생명은 54
  용사공격은 8
  용사방어는 5
  최대기운은 24
  용사속도는 18
  기술이름은 운명의주사위
  기술비용은 4
  기술속성은 운명
  궁극기이름은 하우스를뒤엎는자
  직업특성은 공개 확률과 실패 보호
아니면
  직업번호는 1
  직업이름은 왕국기사
  최대생명은 68
  용사공격은 7
  용사방어는 9
  최대기운은 18
  용사속도는 9
  기술이름은 방패강타
  기술비용은 4
  기술속성은 충격
  궁극기이름은 왕의수호
  직업특성은 방어와 보호
끝


# ── 여섯 난이도의 전투와 경제 보정 ────────────────────────────────

만약에 난도선택이 매우 쉬움과 같으면
  난도번호는 1
  난도이름은 매우 쉬움
  적생명보정은 0
  적공격보정은 0
  적방어보정은 0
  균형보정은 0
  보상보정은 25
  시장위험보정은 0
아니면 만약에 난도선택이 쉬움과 같으면
  난도번호는 2
  난도이름은 쉬움
  적생명보정은 6
  적공격보정은 1
  적방어보정은 0
  균형보정은 0
  보상보정은 15
  시장위험보정은 1
아니면 만약에 난도선택이 어려움과 같으면
  난도번호는 4
  난도이름은 어려움
  적생명보정은 28
  적공격보정은 5
  적방어보정은 1
  균형보정은 1
  보상보정은 20
  시장위험보정은 4
아니면 만약에 난도선택이 매우 어려움과 같으면
  난도번호는 5
  난도이름은 매우 어려움
  적생명보정은 48
  적공격보정은 8
  적방어보정은 2
  균형보정은 2
  보상보정은 45
  시장위험보정은 7
아니면 만약에 난도선택이 불가능과 같으면
  난도번호는 6
  난도이름은 불가능
  적생명보정은 78
  적공격보정은 11
  적방어보정은 4
  균형보정은 4
  보상보정은 85
  시장위험보정은 11
아니면
  난도번호는 3
  난도이름은 보통
  적생명보정은 12
  적공격보정은 3
  적방어보정은 0
  균형보정은 0
  보상보정은 0
  시장위험보정은 2
끝


# ── 새 모험의 모든 처음 값 ─────────────────────────────────────────
# 세이브 코드가 복원할 값도 반드시 이곳에 먼저 이름을 만들어 둡니다.

용사생명은 최대생명
용사기운은 최대기운
용사단계는 1
용사경험은 0
다음경험은 18
회복약수는 3
고급회복약수는 0
기운약수는 2
해독제수는 2
폭탄수는 1
성수수는 0
연막탄수는 1
숫돌수는 1
야영식량수는 3
행운동전수는 0
혼돈주사위수는 0
운명인장수는 0
운명뽑기횟수는 0
운명천장누적은 0
운명조각수는 0
첫뽑기완료는 거짓
도박승리수는 0
도박패배수는 0
소지브론즈는 110
무기번호는 1
무기이름은 철제 장검
무기내구는 40
무기최대내구는 40
갑옷번호는 1
갑옷이름은 사슬 갑옷
갑옷내구는 50
갑옷최대내구는 50
장신구번호는 0
장신구이름은 낡은 평화 부적
용사독은 0
평화불씨는 1
희망점수는 0
지역번호는 1
최고지역은 1
전체턴수는 0
끝맺음은 진행중
궁극기충전은 0
약초수는 1
철광석수는 0
마력가루수는 0
용비늘수는 0
질긴천수는 0
마력수정수는 0
가죽수는 0
제작횟수는 0
균형파괴수는 0
약점공격수는 0
룬각인수는 0
거래횟수는 0
수리횟수는 0
저장횟수는 0
명성은 0
마왕처치는 거짓
숨은보스승리는 거짓
수호룬보유여부는 거짓
수호룬사용여부는 거짓
세린을도움은 거짓
마왕약화는 거짓
깃발보호는 거짓
전쟁위험은 12
전쟁위험에 시장위험보정 더해
상인평판은 0
왕실평판은 0
엘프평판은 0
드워프평판은 0
교단평판은 0
길드평판은 0
모험일은 1
포만은 100
피로는 0
사기는 50
시장회복재고는 5
시장기운재고는 4
시장폭탄재고는 2
시장식량재고는 6
리아넬동료는 거짓
브룸동료는 거짓
세린동료는 거짓
아델라동료는 거짓
카일동료는 거짓
아우렐동료는 거짓
이사벨동료는 거짓
다리온동료는 거짓
네리아동료는 거짓
루시안동료는 거짓
숲퀘상태는 0
결계퀘상태는 0
깃발퀘상태는 0
시장퀘상태는 0
난민퀘상태는 0
봉인퀘상태는 0
쓰러뜨린적은 빈 표
동료목록은 빈 목록
업적목록은 빈 목록
발견지역은 빈 목록
퀘스트표는 빈 표
첫궁극기업적은 거짓
첫균형업적은 거짓
첫약점업적은 거짓
첫제작업적은 거짓
부자업적은 거짓
첫거래업적은 거짓
첫수리업적은 거짓

# 운명도박꾼은 전용 확률 도구를 가지고 출발합니다.
# 다른 직업도 시장과 뽑기에서 같은 도구를 얻어 쓸 수 있습니다.
만약에 직업번호가 13과 같으면
  행운동전수는 2
  혼돈주사위수는 1
끝


# ── 불러오기 ───────────────────────────────────────────────────────
# 판번호, 이름, 아흔다섯 숫자, 위치 가중 검사합의 순서입니다.
# 코드의 쉼표 뒤 공백은 숫자 읽는 일이 자동으로 무시합니다.

불러오기성공은 거짓
만약에 새로운모험이 없으면
  저장문을 물어봐 이전에 받은 평화 세이브 코드를 한 줄로 붙여넣어 주세요
  저장조각들은 저장문을 쉼표로 나눈 것
  저장조각수는 저장조각들 개수
  만약에 저장조각수가 98과 같으면
    버전칸은 저장조각들 첫 번째
    만약에 버전칸이 평화사와 같으면
      이름칸은 저장조각들 2번째
      # 쉼표로 이어 출력하면 각 칸 앞에 공백 하나가 붙습니다.
      # 첫 공백만 버리고 이름 안에 사용자가 넣은 나머지 공백은 그대로 보존합니다.
      정리한이름은 이름칸을 0개 붙인 것
      이름글자순서는 0
      이름칸의 이름글자마다 반복해
        이름글자순서에 1 더해
        만약에 이름글자순서가 1보다 크면
          정리한이름에 이름글자 더해
        끝
      끝
      용사이름은 정리한이름
      복원숫자들은 빈 목록
      저장순서는 0
      저장조각들의 저장조각마다 반복해
        저장순서에 1 더해
        만약에 저장순서가 2보다 크면
          저장조각에게 코드숫자읽기 해줘
        끝
      끝
      만약에 복원숫자들 개수가 96과 같으면
        불러오기성공은 참
      끝
    끝
  끝

  만약에 불러오기성공이 있으면
    직업번호는 복원숫자들 첫 번째
    난도번호는 복원숫자들 2번째
    지역번호는 복원숫자들 3번째
    최고지역은 복원숫자들 4번째
    최대생명은 복원숫자들 5번째
    용사생명은 복원숫자들 6번째
    용사공격은 복원숫자들 7번째
    용사방어는 복원숫자들 8번째
    최대기운은 복원숫자들 9번째
    용사기운은 복원숫자들 10번째
    용사속도는 복원숫자들 11번째
    용사단계는 복원숫자들 12번째
    용사경험은 복원숫자들 13번째
    다음경험은 복원숫자들 14번째
    소지브론즈는 복원숫자들 15번째
    회복약수는 복원숫자들 16번째
    고급회복약수는 복원숫자들 17번째
    기운약수는 복원숫자들 18번째
    해독제수는 복원숫자들 19번째
    폭탄수는 복원숫자들 20번째
    성수수는 복원숫자들 21번째
    연막탄수는 복원숫자들 22번째
    숫돌수는 복원숫자들 23번째
    야영식량수는 복원숫자들 24번째
    약초수는 복원숫자들 25번째
    철광석수는 복원숫자들 26번째
    마력가루수는 복원숫자들 27번째
    용비늘수는 복원숫자들 28번째
    질긴천수는 복원숫자들 29번째
    마력수정수는 복원숫자들 30번째
    가죽수는 복원숫자들 31번째
    평화불씨는 복원숫자들 32번째
    희망점수는 복원숫자들 33번째
    궁극기충전은 복원숫자들 34번째
    제작횟수는 복원숫자들 35번째
    균형파괴수는 복원숫자들 36번째
    약점공격수는 복원숫자들 37번째
    전체턴수는 복원숫자들 38번째
    무기번호는 복원숫자들 39번째
    무기내구는 복원숫자들 40번째
    무기최대내구는 복원숫자들 41번째
    갑옷번호는 복원숫자들 42번째
    갑옷내구는 복원숫자들 43번째
    갑옷최대내구는 복원숫자들 44번째
    장신구번호는 복원숫자들 45번째
    전쟁위험은 복원숫자들 46번째
    상인평판은 복원숫자들 47번째
    왕실평판은 복원숫자들 48번째
    엘프평판은 복원숫자들 49번째
    드워프평판은 복원숫자들 50번째
    교단평판은 복원숫자들 51번째
    길드평판은 복원숫자들 52번째
    모험일은 복원숫자들 53번째
    포만은 복원숫자들 54번째
    피로는 복원숫자들 55번째
    사기는 복원숫자들 56번째
    수호룬보유여부는 복원숫자들 57번째
    수호룬사용여부는 복원숫자들 58번째
    세린을도움은 복원숫자들 59번째
    마왕약화는 복원숫자들 60번째
    깃발보호는 복원숫자들 61번째
    리아넬동료는 복원숫자들 62번째
    브룸동료는 복원숫자들 63번째
    세린동료는 복원숫자들 64번째
    아델라동료는 복원숫자들 65번째
    카일동료는 복원숫자들 66번째
    아우렐동료는 복원숫자들 67번째
    이사벨동료는 복원숫자들 68번째
    다리온동료는 복원숫자들 69번째
    네리아동료는 복원숫자들 70번째
    루시안동료는 복원숫자들 71번째
    숲퀘상태는 복원숫자들 72번째
    결계퀘상태는 복원숫자들 73번째
    깃발퀘상태는 복원숫자들 74번째
    시장퀘상태는 복원숫자들 75번째
    난민퀘상태는 복원숫자들 76번째
    봉인퀘상태는 복원숫자들 77번째
    룬각인수는 복원숫자들 78번째
    거래횟수는 복원숫자들 79번째
    수리횟수는 복원숫자들 80번째
    명성은 복원숫자들 81번째
    저장횟수는 복원숫자들 82번째
    마왕처치는 복원숫자들 83번째
    숨은보스승리는 복원숫자들 84번째
    연출번호는 복원숫자들 85번째
    화면번호는 복원숫자들 86번째
    행운동전수는 복원숫자들 87번째
    혼돈주사위수는 복원숫자들 88번째
    운명인장수는 복원숫자들 89번째
    운명뽑기횟수는 복원숫자들 90번째
    운명천장누적은 복원숫자들 91번째
    운명조각수는 복원숫자들 92번째
    첫뽑기완료는 복원숫자들 93번째
    도박승리수는 복원숫자들 94번째
    도박패배수는 복원숫자들 95번째
    받은검사값은 복원숫자들 96번째

    확인숫자들은 목록 직업번호, 난도번호, 지역번호, 최고지역, 최대생명, 용사생명, 용사공격, 용사방어, 최대기운, 용사기운, 용사속도, 용사단계, 용사경험, 다음경험, 소지브론즈, 회복약수, 고급회복약수, 기운약수, 해독제수, 폭탄수, 성수수, 연막탄수, 숫돌수, 야영식량수, 약초수, 철광석수, 마력가루수, 용비늘수, 질긴천수, 마력수정수, 가죽수, 평화불씨, 희망점수, 궁극기충전, 제작횟수, 균형파괴수, 약점공격수, 전체턴수, 무기번호, 무기내구, 무기최대내구, 갑옷번호, 갑옷내구, 갑옷최대내구, 장신구번호, 전쟁위험, 상인평판, 왕실평판, 엘프평판, 드워프평판, 교단평판, 길드평판, 모험일, 포만, 피로, 사기, 수호룬보유여부, 수호룬사용여부, 세린을도움, 마왕약화, 깃발보호, 리아넬동료, 브룸동료, 세린동료, 아델라동료, 카일동료, 아우렐동료, 이사벨동료, 다리온동료, 네리아동료, 루시안동료, 숲퀘상태, 결계퀘상태, 깃발퀘상태, 시장퀘상태, 난민퀘상태, 봉인퀘상태, 룬각인수, 거래횟수, 수리횟수, 명성, 저장횟수, 마왕처치, 숨은보스승리, 연출번호, 화면번호, 행운동전수, 혼돈주사위수, 운명인장수, 운명뽑기횟수, 운명천장누적, 운명조각수, 첫뽑기완료, 도박승리수, 도박패배수
    # 값의 합만 보지 않고 각 위치를 곱해, 두 필드의 보상 변조도 쉽게 잡습니다.
    확인합계는 0
    확인순번은 0
    확인숫자들의 확인숫자마다 반복해
      확인순번에 1 더해
      확인항은 확인숫자
      확인항에 확인순번 곱해
      확인합계에 확인항 더해
    끝
    계산검사값은 확인합계를 997로 나눈 나머지
    만약에 계산검사값이 받은검사값과 같지 않으면
      불러오기성공은 거짓
    끝
    # 검사합이 맞아도 게임 규칙을 벗어난 핵심 범위는 받지 않습니다.
    만약에 직업번호가 1보다 작으면 불러오기성공은 거짓
    만약에 직업번호가 13보다 크면 불러오기성공은 거짓
    만약에 난도번호가 1보다 작으면 불러오기성공은 거짓
    만약에 난도번호가 6보다 크면 불러오기성공은 거짓
    만약에 지역번호가 1보다 작으면 불러오기성공은 거짓
    만약에 지역번호가 13보다 크면 불러오기성공은 거짓
    만약에 최고지역이 지역번호보다 작으면 불러오기성공은 거짓
    만약에 용사생명이 최대생명보다 크면 불러오기성공은 거짓
    만약에 용사기운이 최대기운보다 크면 불러오기성공은 거짓
    만약에 무기내구가 무기최대내구보다 크면 불러오기성공은 거짓
    만약에 갑옷내구가 갑옷최대내구보다 크면 불러오기성공은 거짓
    만약에 연출번호가 1보다 작으면 불러오기성공은 거짓
    만약에 연출번호가 3보다 크면 불러오기성공은 거짓
    만약에 화면번호가 1보다 작으면 불러오기성공은 거짓
    만약에 화면번호가 2보다 크면 불러오기성공은 거짓
  끝

  만약에 불러오기성공이 없으면
    끝맺음은 잘못된저장
    줄 그어
    세이브 코드가 잘렸거나 다른 판의 코드입니다. 게임을 다시 실행해 주세요. 말해줘
    줄 그어
  아니면
    불러오기가 끝났습니다. 용사이름의 모험을 지역번호 번째 길에서 이어 갑니다. 말해줘
  끝
끝


# ── 불러온 번호에서 이름과 목록을 되살리기 ────────────────────────

만약에 새로운모험이 없으면
  만약에 직업번호가 2와 같으면
    직업이름은 원소마법사
    기술이름은 화염구
    기술비용은 6
    기술속성은 화염
    궁극기이름은 대화염폭풍
    직업특성은 마력과 화상
  아니면 만약에 직업번호가 3과 같으면
    직업이름은 엘프궁수
    기술이름은 연속사격
    기술비용은 4
    기술속성은 관통
    궁극기이름은 천개의화살
    직업특성은 연속 사격과 출혈
  아니면 만약에 직업번호가 4와 같으면
    직업이름은 성직자
    기술이름은 성광
    기술비용은 5
    기술속성은 신성
    궁극기이름은 여신의심판
    직업특성은 회복과 정화
  아니면 만약에 직업번호가 5와 같으면
    직업이름은 그림자도적
    기술이름은 맹독비수
    기술비용은 4
    기술속성은 독
    궁극기이름은 그림자처형
    직업특성은 회피와 중독
  아니면 만약에 직업번호가 6과 같으면
    직업이름은 북방광전사
    기술이름은 광전도끼
    기술비용은 4
    기술속성은 충격
    궁극기이름은 라그나의분노
    직업특성은 잃은 생명과 분노
  아니면 만약에 직업번호가 7과 같으면
    직업이름은 룬대장장이
    기술이름은 룬망치
    기술비용은 5
    기술속성은 충격
    궁극기이름은 대지의모루
    직업특성은 수리와 갑옷 파괴
  아니면 만약에 직업번호가 8과 같으면
    직업이름은 음유시인
    기술이름은 파열음
    기술비용은 4
    기술속성은 공명
    궁극기이름은 영웅서사시
    직업특성은 전의와 균형 파괴
  아니면 만약에 직업번호가 9와 같으면
    직업이름은 숲의드루이드
    기술이름은 덩굴속박
    기술비용은 5
    기술속성은 자연
    궁극기이름은 고대숲의분노
    직업특성은 재생과 속박
  아니면 만약에 직업번호가 10과 같으면
    직업이름은 황혼흑마법사
    기술이름은 생명착취
    기술비용은 6
    기술속성은 암흑
    궁극기이름은 심연의계약
    직업특성은 생명 흡수와 계약
  아니면 만약에 직업번호가 11과 같으면
    직업이름은 용혈기병
    기술이름은 용염창
    기술비용은 5
    기술속성은 용염
    궁극기이름은 붉은용의강림
    직업특성은 관통과 용염
  아니면 만약에 직업번호가 12와 같으면
    직업이름은 시간술사
    기술이름은 시간균열
    기술비용은 6
    기술속성은 시간
    궁극기이름은 멈춘세계
    직업특성은 차례 지연과 가속
  아니면 만약에 직업번호가 13과 같으면
    직업이름은 운명도박꾼
    기술이름은 운명의주사위
    기술비용은 4
    기술속성은 운명
    궁극기이름은 하우스를뒤엎는자
    직업특성은 공개 확률과 실패 보호
  아니면
    직업이름은 왕국기사
    기술이름은 방패강타
    기술비용은 4
    기술속성은 충격
    궁극기이름은 왕의수호
    직업특성은 방어와 보호
  끝

  만약에 난도번호가 1과 같으면
    난도이름은 매우 쉬움
    적생명보정은 0
    적공격보정은 0
    적방어보정은 0
    균형보정은 0
    보상보정은 25
    시장위험보정은 0
  아니면 만약에 난도번호가 2와 같으면
    난도이름은 쉬움
    적생명보정은 6
    적공격보정은 1
    적방어보정은 0
    균형보정은 0
    보상보정은 15
    시장위험보정은 1
  아니면 만약에 난도번호가 4와 같으면
    난도이름은 어려움
    적생명보정은 28
    적공격보정은 5
    적방어보정은 1
    균형보정은 1
    보상보정은 20
    시장위험보정은 4
  아니면 만약에 난도번호가 5와 같으면
    난도이름은 매우 어려움
    적생명보정은 48
    적공격보정은 8
    적방어보정은 2
    균형보정은 2
    보상보정은 45
    시장위험보정은 7
  아니면 만약에 난도번호가 6과 같으면
    난도이름은 불가능
    적생명보정은 78
    적공격보정은 11
    적방어보정은 4
    균형보정은 4
    보상보정은 85
    시장위험보정은 11
  아니면
    난도이름은 보통
    적생명보정은 12
    적공격보정은 3
    적방어보정은 0
    균형보정은 0
    보상보정은 0
    시장위험보정은 2
  끝

  # 장비 이름은 짧은 번호로 저장하고 여기서 다시 붙입니다.
  만약에 무기번호가 2와 같으면
    무기이름은 순찰자의 장궁
  아니면 만약에 무기번호가 3과 같으면
    무기이름은 드워프 룬망치
  아니면 만약에 무기번호가 4와 같으면
    무기이름은 백은 지팡이
  아니면 만약에 무기번호가 5와 같으면
    무기이름은 그림자 단검
  아니면 만약에 무기번호가 6와 같으면
    무기이름은 용뼈 장창
  아니면 만약에 무기번호가 7과 같으면
    무기이름은 시간의 초침
  아니면 만약에 무기번호가 8과 같으면
    무기이름은 평화의 성검
  아니면
    무기이름은 철제 장검
  끝
  만약에 갑옷번호가 2와 같으면
    갑옷이름은 엘프 순찰복
  아니면 만약에 갑옷번호가 3과 같으면
    갑옷이름은 드워프 판금갑옷
  아니면 만약에 갑옷번호가 4와 같으면
    갑옷이름은 성광 예복
  아니면 만약에 갑옷번호가 5와 같으면
    갑옷이름은 용비늘 갑옷
  아니면 만약에 갑옷번호가 6과 같으면
    갑옷이름은 왕가의 수호갑옷
  아니면
    갑옷이름은 사슬 갑옷
  끝
  만약에 장신구번호가 1과 같으면
    장신구이름은 매의 눈
  아니면 만약에 장신구번호가 2와 같으면
    장신구이름은 상인의 은저울
  아니면 만약에 장신구번호가 3과 같으면
    장신구이름은 성녀의 묵주
  아니면 만약에 장신구번호가 4와 같으면
    장신구이름은 녹스의 파편
  아니면
    장신구이름은 낡은 평화 부적
  끝

  # 동료 목록과 퀘스트 표는 저장된 깃발로 다시 만듭니다.
  만약에 리아넬동료가 있으면 동료목록에 리아넬 넣어
  만약에 브룸동료가 있으면 동료목록에 브룸 넣어
  만약에 세린동료가 있으면 동료목록에 세린 넣어
  만약에 아델라동료가 있으면 동료목록에 아델라 넣어
  만약에 카일동료가 있으면 동료목록에 카일 넣어
  만약에 아우렐동료가 있으면 동료목록에 아우렐 넣어
  만약에 이사벨동료가 있으면 동료목록에 이사벨 넣어
  만약에 다리온동료가 있으면 동료목록에 다리온 넣어
  만약에 네리아동료가 있으면 동료목록에 네리아 넣어
  만약에 루시안동료가 있으면 동료목록에 루시안 넣어
끝

퀘스트표에 마왕토벌을 진행중으로 넣어
퀘스트표에 숲의동맹을 미발견으로 넣어
퀘스트표에 마법결계를 미발견으로 넣어
퀘스트표에 왕국깃발을 미발견으로 넣어
퀘스트표에 자유시장을 미발견으로 넣어
퀘스트표에 북부난민을 미발견으로 넣어
퀘스트표에 태양봉인을 미발견으로 넣어

만약에 새로운모험이 없으면
  만약에 숲퀘상태가 1과 같으면 퀘스트표에 숲의동맹을 완료로 넣어
  만약에 숲퀘상태가 2와 같으면 퀘스트표에 숲의동맹을 놓침으로 넣어
  만약에 결계퀘상태가 1과 같으면 퀘스트표에 마법결계를 완료로 넣어
  만약에 결계퀘상태가 2와 같으면 퀘스트표에 마법결계를 놓침으로 넣어
  만약에 깃발퀘상태가 1과 같으면 퀘스트표에 왕국깃발을 완료로 넣어
  만약에 깃발퀘상태가 2와 같으면 퀘스트표에 왕국깃발을 놓침으로 넣어
  만약에 시장퀘상태가 1과 같으면 퀘스트표에 자유시장을 완료로 넣어
  만약에 시장퀘상태가 2와 같으면 퀘스트표에 자유시장을 이익계약으로 넣어
  만약에 난민퀘상태가 1과 같으면 퀘스트표에 북부난민을 완료로 넣어
  만약에 난민퀘상태가 2와 같으면 퀘스트표에 북부난민을 군사우선으로 넣어
  만약에 봉인퀘상태가 1과 같으면 퀘스트표에 태양봉인을 완료로 넣어
  만약에 봉인퀘상태가 2와 같으면 퀘스트표에 태양봉인을 성물사용으로 넣어

  만약에 균형파괴수가 0보다 크면
    첫균형업적은 참
    업적목록에 균형파괴자 넣어
  끝
  만약에 약점공격수가 0보다 크면
    첫약점업적은 참
    업적목록에 약점사냥꾼 넣어
  끝
  만약에 제작횟수가 0보다 크면
    첫제작업적은 참
    업적목록에 첫제작 넣어
  끝
  만약에 거래횟수가 0보다 크면
    첫거래업적은 참
    업적목록에 첫거래 넣어
  끝
  만약에 수리횟수가 0보다 크면
    첫수리업적은 참
    업적목록에 첫수리 넣어
  끝
  만약에 소지브론즈가 99보다 크면
    부자업적은 참
    업적목록에 첫골드 넣어
  끝

  만약에 지역번호가 1보다 크면
    발견지역에 왕도 북문 넣어
    기록적이름은 붉은귀 고블린 족장 스크락
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 2보다 크면
    발견지역에 속삭임숲 넣어
    기록적이름은 오크 전쟁대장 가르둠
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 3보다 크면
    발견지역에 은빛광산 넣어
    기록적이름은 망령기사 에드릭
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 4보다 크면
    발견지역에 고대 마법탑 넣어
    기록적이름은 트롤왕 보르가
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 5보다 크면
    발견지역에 성광수도원 지하묘지 넣어
    기록적이름은 바위골렘 그라니트
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 6보다 크면
    발견지역에 잿빛요새 넣어
    기록적이름은 흑마법사 모르벨
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 7보다 크면
    발견지역에 용의협곡 넣어
    기록적이름은 타락한 흑룡 바르카스
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 8보다 크면
    발견지역에 자유도시 황금시장 넣어
    기록적이름은 황금탈 도적왕 레마르
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 9보다 크면
    발견지역에 서리관문 넣어
    기록적이름은 서리거인 하르곤
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 10보다 크면
    발견지역에 별빛늪 넣어
    기록적이름은 역병히드라 셀카
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 지역번호가 11보다 크면
    발견지역에 무너진 태양신전 넣어
    기록적이름은 타락천사 솔카나
    쓰러뜨린적에 기록적이름을 1로 넣어
  끝
  만약에 마왕처치가 있으면
    발견지역에 마왕성 검은 왕좌 넣어
    기록적이름은 마왕 모르가르
    쓰러뜨린적에 기록적이름을 1로 넣어
    퀘스트표에 마왕토벌을 완료로 넣어
    업적목록에 마왕사냥꾼 넣어
  끝
끝


# ── 왕녀 엘레노아와 첫 번째 선택 ───────────────────────────────────

만약에 새로운모험이 있으면
  글귀판은 아르테리아 왕녀 엘레노아
  글귀판에게 작은제목그리기 해줘
  이야기:

    왕녀 엘레노아는 왕관 대신 녹슨 갑옷을 입고 피난민의 배급표를 직접 정리합니다.
    귀족 창고에는 곡식이 남았지만 길이 끊겨 변방의 빵값은 수도의 세 배가 되었습니다.
    그녀는 여신의 성화를 랜턴에 옮겨 담고 전쟁을 끝내는 것과 삶을 되살리는 것은 다르다고 말합니다.

  끝
  첫약속후보들은 목록 명예, 왕국, 백성
  첫약속입력끝값은 0
  첫약속입력끝값이 1보다 작은 동안
    첫약속을 물어봐 무엇을 먼저 지키겠습니까? 명예, 왕국, 백성
    만약에 첫약속후보들에 첫약속이 있으면
      첫약속입력끝값은 1
    아니면
      🟦 세 선택 가운데 하나를 다시 적어 주세요. 말해줘
    끝
  끝
  만약에 첫약속이 명예와 같으면
    최대기운에 3 더해
    용사기운은 최대기운
    희망점수에 1 더해
    왕실평판에 1 더해
    엘레노아가 왕실 기사단의 경례로 답합니다. 최대 기운이 올랐습니다. 말해줘
  아니면 만약에 첫약속이 왕국과 같으면
    평화불씨에 1 더해
    희망점수에 2 더해
    왕실평판에 2 더해
    왕가의 지도에 숨겨진 보급로가 빛납니다. 성화가 더 강해졌습니다. 말해줘
  아니면
    최대생명에 6 더해
    용사생명은 최대생명
    희망점수에 1 더해
    길드평판에 2 더해
    피난민들이 모험가의 이름을 기억합니다. 최대 생명이 올랐습니다. 말해줘
  끝
끝

만약에 빠른시험이 있으면
  최대생명은 999
  용사생명은 최대생명
  최대기운은 99
  용사기운은 최대기운
  용사공격은 99
  용사방어는 40
  소지브론즈는 9999
  회복약수는 30
  고급회복약수는 30
  기운약수는 30
  해독제수는 30
  폭탄수는 30
  성수수는 30
  연막탄수는 30
  야영식량수는 30
  약초수는 30
  철광석수는 30
  마력가루수는 30
  용비늘수는 30
  질긴천수는 30
  마력수정수는 30
  가죽수는 30
  짧은기다림은 0
  궁극기충전은 궁극기최대
끝

줄 그어
용사이름 · 직업이름 · 난도이름 난이도 말해줘
직업 특성 · 직업특성 말해줘
무기 무기이름 · 갑옷 갑옷이름 · 장신구 장신구이름 말해줘
기술 기술이름 · 필요한 기운 기술비용 · 속성 기술속성 말해줘
궁극기 궁극기이름 · 공격과 방어로 충전됩니다 말해줘
짧은기다림 기다려


# ════════════════════════════════════════════════════════════════════
# 모험의 큰 반복
# 이 반복을 한 바퀴 돌면 한 지역을 지납니다.
# 싸움에서 물러나면 같은 지역을 다시 시작합니다.
# ════════════════════════════════════════════════════════════════════

계속 반복해

  만약에 끝맺음이 진행중과 같지 않으면
    멈춰
  끝


  # ── 지역에 들어갈 때 만나는 고유 인물 ───────────────────────────
  # 선택은 능력치뿐 아니라 마지막 후일담에도 남습니다.

  만약에 지역번호가 2와 같으면
    글귀판은 엘프 정찰대장 리아넬
    글귀판에게 작은제목그리기 해줘
    이야기:

      속삭임숲은 왕국에서 가장 오래된 엘프의 영지지만 지금은 고블린 군단이 점령했습니다.
      은빛 머리의 정찰대장 리아넬은 화살 세 발로 길목의 고블린 셋을 동시에 쓰러뜨립니다.
      그녀는 빠른 발보다 적의 발자국을 읽는 눈이 훌륭한 모험가를 만든다고 말합니다.

    끝
    리아넬후보들은 목록 정찰, 서두르기
    리아넬입력끝값은 0
    리아넬입력끝값이 1보다 작은 동안
      리아넬선택을 물어봐 리아넬과 주변을 정찰할까요? 정찰, 서두르기
      만약에 리아넬후보들에 리아넬선택이 있으면
        리아넬입력끝값은 1
      아니면
        🟦 정찰 또는 서두르기를 적어 주세요. 말해줘
      끝
    끝
    만약에 리아넬선택이 정찰과 같으면
      용사공격에 1 더해
      최대기운에 2 더해
      용사기운은 최대기운
      희망점수에 1 더해
      동료목록에 리아넬 넣어
      리아넬동료는 참
      엘프평판에 2 더해
      숲퀘상태는 1
      퀘스트표에 숲의동맹을 완료로 넣어
      고블린의 매복 위치를 모두 익혔습니다. 공격과 기운이 올랐습니다. 말해줘
    아니면
      용사속도에 3 더해
      숲퀘상태는 2
      퀘스트표에 숲의동맹을 놓침으로 넣어
      엘프의 숲길을 빠르게 통과했습니다. 속도가 올랐습니다. 말해줘
    끝
    짧은기다림 기다려
  끝

  만약에 지역번호가 3과 같으면
    글귀판은 드워프 대장장이 브룸
    글귀판에게 작은제목그리기 해줘
    이야기:

      은빛광산의 마지막 용광로 앞에서 드워프 대장장이 브룸이 홀로 오크 군단을 막고 있습니다.
      브룸의 수염에는 불꽃이 붙어 있지만 그는 망치질을 멈추지 않고 전설의 룬을 완성합니다.
      갑옷에 수호 룬을 새기면 가장 위험한 순간 단 한 번 죽음을 막을 수 있습니다.

    끝
    브룸후보들은 목록 수호룬, 폭약
    브룸입력끝값은 0
    브룸입력끝값이 1보다 작은 동안
      브룸선택을 물어봐 브룸에게 무엇을 부탁할까요? 수호룬, 폭약
      만약에 브룸후보들에 브룸선택이 있으면
        브룸입력끝값은 1
      아니면
        🟦 수호룬 또는 폭약을 적어 주세요. 말해줘
      끝
    끝
    만약에 브룸선택이 수호룬과 같으면
      수호룬보유여부는 참
      희망점수에 1 더해
      갑옷에 수호 룬이 빛납니다. 쓰러질 때 한 번 생명을 되돌립니다. 말해줘
    아니면
      폭탄수에 1 더해
      브룸이 광산용 폭약을 전투 폭탄으로 고쳐 건넵니다. 말해줘
    끝
    동료목록에 브룸 넣어
    브룸동료는 참
    드워프평판에 2 더해
    짧은기다림 기다려
  끝

  만약에 지역번호가 4와 같으면
    글귀판은 견습 마법사 세린
    글귀판에게 작은제목그리기 해줘
    이야기:

      고대 마법탑의 꼭대기에서 견습 마법사 세린이 차원문을 홀로 붙들고 있습니다.
      스승들은 모두 마왕군에 맞서 쓰러졌지만 세린은 낡은 주문서를 끝까지 놓지 않았습니다.
      차원문을 닫으면 마왕의 보호 결계를 약하게 만들 수 있지만 세린 혼자서는 힘이 모자랍니다.

    끝
    세린후보들은 목록 차원문봉인, 마법도구받기
    세린입력끝값은 0
    세린입력끝값이 1보다 작은 동안
      세린선택을 물어봐 세린을 어떻게 돕겠습니까? 차원문봉인, 마법도구받기
      만약에 세린후보들에 세린선택이 있으면
        세린입력끝값은 1
      아니면
        🟦 두 선택 가운데 하나를 다시 적어 주세요. 말해줘
      끝
    끝
    만약에 세린선택이 차원문봉인과 같으면
      세린을도움은 참
      마왕약화는 참
      희망점수에 2 더해
      동료목록에 세린 넣어
      세린동료는 참
      결계퀘상태는 1
      퀘스트표에 마법결계를 완료로 넣어
      함께 주문을 완성해 마왕의 보호 결계를 끊었습니다. 마지막 싸움이 약해집니다. 말해줘
    아니면
      용사공격에 2 더해
      결계퀘상태는 2
      퀘스트표에 마법결계를 놓침으로 넣어
      세린이 공격 마법이 든 수정구를 건넵니다. 공격이 크게 올랐습니다. 말해줘
    끝
    짧은기다림 기다려
  끝

  만약에 지역번호가 5와 같으면
    글귀판은 성녀 아델라
    글귀판에게 작은제목그리기 해줘
    이야기:

      성광수도원의 예배당은 언데드에게 포위되었지만 제단의 촛불은 아직 꺼지지 않았습니다.
      성녀 아델라는 부상자를 치료하면서도 마왕군의 저주를 막는 기도를 이어 가고 있습니다.
      아델라는 마지막 축복 하나를 생명과 힘과 여비 가운데 어디에 쓸지 선택하라고 합니다.

    끝
    아델라후보들은 목록 생명, 힘, 여비
    아델라입력끝값은 0
    아델라입력끝값이 1보다 작은 동안
      아델라선택을 물어봐 어떤 축복을 받겠습니까? 생명, 힘, 여비
      만약에 아델라후보들에 아델라선택이 있으면
        아델라입력끝값은 1
      아니면
        🟦 생명, 힘, 여비 가운데 하나를 다시 적어 주세요. 말해줘
      끝
    끝
    만약에 아델라선택이 생명과 같으면
      최대생명에 8 더해
      용사생명은 최대생명
      희망점수에 1 더해
      성스러운 기도가 상처를 감쌉니다. 최대 생명이 올랐습니다. 말해줘
    아니면 만약에 아델라선택이 힘과 같으면
      용사공격에 3 더해
      용사방어에 1 더해
      축복받은 무기에 밝은 빛이 흐릅니다. 공격과 방어가 올랐습니다. 말해줘
    아니면
      소지브론즈에 80 더해
      수도원이 모은 구호금 8 실버를 여비로 받았습니다. 말해줘
    끝
    동료목록에 아델라 넣어
    아델라동료는 참
    교단평판에 2 더해
    짧은기다림 기다려
  끝

  만약에 지역번호가 6과 같으면
    글귀판은 용병대장 카일
    글귀판에게 작은제목그리기 해줘
    이야기:

      잿빛요새 성벽에는 수백 번의 전투에서 살아남은 용병대장 카일이 기다립니다.
      카일은 돈보다 약속을 먼저 지키는 드문 용병이며 마지막 부하들을 피난시키고 홀로 남았습니다.
      그는 왕국의 사자 깃발과 여분의 회복약을 내놓으며 하나를 고르라고 합니다.

    끝
    카일후보들은 목록 사자깃발, 회복약
    카일입력끝값은 0
    카일입력끝값이 1보다 작은 동안
      카일선택을 물어봐 무엇을 받겠습니까? 사자깃발, 회복약
      만약에 카일후보들에 카일선택이 있으면
        카일입력끝값은 1
      아니면
        🟦 사자깃발 또는 회복약을 적어 주세요. 말해줘
      끝
    끝
    만약에 카일선택이 사자깃발과 같으면
      용사방어에 2 더해
      깃발보호는 참
      희망점수에 1 더해
      깃발퀘상태는 1
      퀘스트표에 왕국깃발을 완료로 넣어
      왕국의 사자 깃발이 방패 위에서 펄럭입니다. 방어가 올랐습니다. 말해줘
    아니면
      회복약수에 2 더해
      깃발퀘상태는 2
      퀘스트표에 왕국깃발을 놓침으로 넣어
      카일이 용병단의 마지막 회복약 두 병을 건넵니다. 말해줘
    끝
    동료목록에 카일 넣어
    카일동료는 참
    길드평판에 2 더해
    짧은기다림 기다려
  끝

  만약에 지역번호가 7과 같으면
    글귀판은 늙은 금룡 아우렐
    글귀판에게 작은제목그리기 해줘
    이야기:

      용의협곡 정상에는 마왕에게 한쪽 날개를 잃은 늙은 금룡 아우렐이 누워 있습니다.
      아우렐은 초대 국왕과 함께 첫 번째 마왕을 봉인했고 왕국의 역사를 누구보다 오래 보았습니다.
      그는 모르가르가 힘만 숭배하므로 용기와 지혜 가운데 하나를 증명하라고 말합니다.

    끝
    아우렐후보들은 목록 지혜, 용기
    아우렐입력끝값은 0
    아우렐입력끝값이 1보다 작은 동안
      아우렐선택을 물어봐 무엇을 증명하겠습니까? 지혜, 용기
      만약에 아우렐후보들에 아우렐선택이 있으면
        아우렐입력끝값은 1
      아니면
        🟦 지혜 또는 용기를 적어 주세요. 말해줘
      끝
    끝
    만약에 아우렐선택이 지혜와 같으면
      평화불씨에 1 더해
      희망점수에 2 더해
      아우렐이 마왕의 세 단계 변신을 알려 줍니다. 성화가 강해졌습니다. 말해줘
    아니면
      용사공격에 2 더해
      아우렐의 포효와 함께 공격이 오릅니다. 마왕성의 문이 열립니다. 말해줘
    끝
    동료목록에 아우렐 넣어
    아우렐동료는 참
    짧은기다림 기다려
  끝

  만약에 지역번호가 8과 같으면
    글귀판은 자유시장 대표 이사벨
    글귀판에게 작은제목그리기 해줘
    이야기:

      자유도시 벨로아의 광장에는 빵을 기다리는 시민과 곡물을 쌓아 둔 상단이 서로 마주 서 있습니다.
      상단 대표 이사벨은 곡물값을 억지로 낮추면 다음 수레가 오지 않고 그대로 두면 오늘 굶는 사람이 생긴다고 말합니다.
      그녀는 왕실 보증으로 곡물을 풀거나 위험한 북부 수레를 직접 호위하는 두 장의 계약서를 내밉니다.

    끝
    이사벨후보들은 목록 곡물개방, 수레호위
    이사벨입력끝값은 0
    이사벨입력끝값이 1보다 작은 동안
      이사벨선택을 물어봐 어느 계약을 택하겠습니까? 곡물개방, 수레호위
      만약에 이사벨후보들에 이사벨선택이 있으면
        이사벨입력끝값은 1
      아니면
        🟦 곡물개방 또는 수레호위를 적어 주세요. 말해줘
      끝
    끝
    만약에 이사벨선택이 곡물개방과 같으면
      지불액은 100
      만약에 소지브론즈가 지불액보다 작으면
        지불액은 소지브론즈
      끝
      소지브론즈에서 지불액 빼줘
      희망점수에 2 더해
      상인평판에 3 더해
      길드평판에 1 더해
      전쟁위험에서 2 빼줘
      시장퀘상태는 1
      퀘스트표에 자유시장을 완료로 넣어
      시민에게 곡물이 풀리고 상단에는 왕실 채권이 남았습니다. 물가가 안정됩니다. 말해줘
    아니면
      소지브론즈에 140 더해
      용사공격에 1 더해
      상인평판에 1 더해
      시장퀘상태는 2
      퀘스트표에 자유시장을 이익계약으로 넣어
      수레를 지킨 대가로 1 골드 4 실버와 상인의 전투술을 배웠습니다. 말해줘
    끝
    이사벨동료는 참
    동료목록에 이사벨 넣어
    짧은기다림 기다려

    # 확률상인 미라는 도박을 숨기지 않고 성공률과 최대 손실을 먼저 공개합니다.
    글귀판은 🎲 확률상인 미라
    글귀판에게 작은제목그리기 해줘
    만약에 연출번호가 2와 같으면
      천천히 말해줘 미라는 조그만 청동 주사위와 빽빽한 확률 장부를 탁자에 올려놓습니다.
    아니면 만약에 연출번호가 3과 같으면
      아주 천천히 말해줘 미라는 속삭입니다. 운명은 숨길 때만 속임수가 되지요.
    아니면
      미라는 조그만 청동 주사위와 빽빽한 확률 장부를 탁자에 올려놓습니다. 말해줘
    끝
    🟨 공개 승부 · 성공 45 퍼센트 · 실패 55 퍼센트 · 판돈과 최대 손실 20 브론즈 말해줘
    승리 보상은 판돈 반환과 추가 20 브론즈입니다. 한 번만 도전할 수 있습니다. 말해줘
    미라후보들은 목록 도전, 사양
    미라입력끝값은 0
    미라입력끝값이 1보다 작은 동안
      미라선택을 물어봐 도전 또는 사양을 적어 주세요
      만약에 미라후보들에 미라선택이 있으면
        미라입력끝값은 1
      아니면
        🟦 도전 또는 사양을 다시 적어 주세요. 말해줘
      끝
    끝
    만약에 미라선택이 도전과 같으면
      만약에 소지브론즈가 19보다 크면
        소지브론즈에서 20 빼줘
        미라주사위는 1부터 100까지 무작위 숫자
        만약에 미라주사위가 45보다 작거나 같으면
          소지브론즈에 40 더해
          행운동전수에 1 더해
          도박승리수에 1 더해
          상자로 말해줘 🟨 승리 · 순이익 20 브론즈 · 행운 동전 1개
        아니면
          도박패배수에 1 더해
          🟥 패배 · 공개한 최대 손실대로 20 브론즈를 잃었습니다. 말해줘
        끝
      아니면
        판돈이 모자랍니다. 미라는 빚을 내어 도박하지 않는다고 말합니다. 말해줘
      끝
    아니면
      🟦 미라는 거절도 좋은 판단이라며 행운 동전 하나를 선물합니다. 말해줘
      행운동전수에 1 더해
    끝
  끝

  만약에 지역번호가 9와 같으면
    글귀판은 북부 왕자 다리온
    글귀판에게 작은제목그리기 해줘
    이야기:

      서리관문 아래에는 고향을 잃은 북부 사람들이 긴 줄을 이루고 있습니다.
      왕자 다리온은 왕위를 요구하지 않고 마지막 식량 창고의 열쇠를 쥔 채 부상자부터 들여보냅니다.
      성문을 지키려면 무기가 필요하고 사람을 살리려면 창고를 비워야 합니다.

    끝
    다리온후보들은 목록 난민, 무기고
    다리온입력끝값은 0
    다리온입력끝값이 1보다 작은 동안
      다리온선택을 물어봐 무엇을 먼저 지키겠습니까? 난민, 무기고
      만약에 다리온후보들에 다리온선택이 있으면
        다리온입력끝값은 1
      아니면
        🟦 난민 또는 무기고를 적어 주세요. 말해줘
      끝
    끝
    만약에 다리온선택이 난민과 같으면
      야영식량수에 2 더해
      희망점수에 2 더해
      왕실평판에 2 더해
      난민퀘상태는 1
      퀘스트표에 북부난민을 완료로 넣어
      사람들은 식량을 나누고 살아남은 대장장이들은 훗날 성벽을 다시 세우기로 합니다. 말해줘
    아니면
      용사공격에 2 더해
      용사방어에 1 더해
      난민퀘상태는 2
      퀘스트표에 북부난민을 군사우선으로 넣어
      무기고의 장비로 관문을 지켰지만 피난 행렬은 더 먼 길을 돌아갑니다. 말해줘
    끝
    다리온동료는 참
    동료목록에 다리온 넣어
    짧은기다림 기다려
  끝

  만약에 지역번호가 10과 같으면
    글귀판은 늪의 약초사 네리아
    글귀판에게 작은제목그리기 해줘
    이야기:

      별빛늪의 약초는 왕국 해독제 대부분의 원료였지만 전쟁 중 무분별한 채취로 씨가 말랐습니다.
      약초사 네리아는 남은 씨앗을 늪에 돌려보내면 지금 얻을 약은 줄어도 다음 세대가 살아난다고 말합니다.
      반대로 씨앗을 달이면 마왕의 독을 견딜 강력한 영약을 만들 수 있습니다.

    끝
    네리아후보들은 목록 늪복원, 영약제작
    네리아입력끝값은 0
    네리아입력끝값이 1보다 작은 동안
      네리아선택을 물어봐 남은 씨앗을 어떻게 하겠습니까? 늪복원, 영약제작
      만약에 네리아후보들에 네리아선택이 있으면
        네리아입력끝값은 1
      아니면
        🟦 늪복원 또는 영약제작을 적어 주세요. 말해줘
      끝
    끝
    만약에 네리아선택이 늪복원과 같으면
      희망점수에 2 더해
      엘프평판에 1 더해
      교단평판에 1 더해
      약초수에 4 더해
      전쟁위험에서 1 빼줘
      늪의 물길을 열자 묻혀 있던 씨앗이 달빛 아래 떠오릅니다. 말해줘
    아니면
      고급회복약수에 2 더해
      해독제수에 3 더해
      최대생명에 5 더해
      용사생명에 5 더해
      네리아가 남은 씨앗으로 마지막 영약을 달였습니다. 말해줘
    끝
    네리아동료는 참
    동료목록에 네리아 넣어
    짧은기다림 기다려
  끝

  만약에 지역번호가 11과 같으면
    글귀판은 태양기사 루시안
    글귀판에게 작은제목그리기 해줘
    이야기:

      무너진 태양신전의 지하에는 마왕성으로 이어지는 검은 혈관이 뛰고 있습니다.
      마지막 태양기사 루시안은 성물을 무기로 쓰면 강해지지만 봉인에 쓰면 마왕의 힘을 약하게 할 수 있다고 설명합니다.
      그는 어느 쪽을 택하든 결과를 함께 짊어지겠다고 맹세합니다.

    끝
    루시안후보들은 목록 봉인, 무기
    루시안입력끝값은 0
    루시안입력끝값이 1보다 작은 동안
      루시안선택을 물어봐 태양 성물을 어디에 쓰겠습니까? 봉인, 무기
      만약에 루시안후보들에 루시안선택이 있으면
        루시안입력끝값은 1
      아니면
        🟦 봉인 또는 무기를 적어 주세요. 말해줘
      끝
    끝
    만약에 루시안선택이 봉인과 같으면
      마왕약화는 참
      희망점수에 3 더해
      교단평판에 3 더해
      봉인퀘상태는 1
      퀘스트표에 태양봉인을 완료로 넣어
      검은 혈관이 황금빛으로 굳어 마왕성의 하늘이 처음으로 밝아집니다. 말해줘
    아니면
      용사공격에 4 더해
      성수수에 2 더해
      봉인퀘상태는 2
      퀘스트표에 태양봉인을 성물사용으로 넣어
      성물의 빛이 무기에 깃들어 공격이 크게 오릅니다. 말해줘
    끝
    루시안동료는 참
    동료목록에 루시안 넣어
    짧은기다림 기다려
  끝


  # ── 지역과 적 ────────────────────────────────────────────────────
  # 새 적을 만들 때 아래 갈래 하나를 그대로 복사하세요.
  # 특징은 기세, 약탈, 반사, 재생, 갑옷, 독, 흡수, 마왕, 심연 가운데 하나입니다.
  # 특징에 따른 실제 행동은 더 아래 「적의 반격」에 모여 있습니다.

  만약에 지역번호가 13과 같으면
    지역이름은 세계의 균열
    적이름은 심연룡 녹스
    적최대생명은 270
    적공격은 23
    적방어는 11
    적속도는 28
    적보상브론즈는 900
    적경험은 150
    적특징은 심연
    적약점은 시간
    적최대균형은 18
    적해설은 마왕의 죽음으로 열린 세계의 균열에서 태어난 고대 심연룡
  아니면 만약에 지역번호가 12와 같으면
    지역이름은 마왕성 검은 왕좌
    적이름은 마왕 모르가르
    적최대생명은 220
    적공격은 19
    적방어는 9
    적속도는 22
    적보상브론즈는 0
    적경험은 100
    적특징은 마왕
    적약점은 신성
    적최대균형은 16
    적해설은 마계의 불꽃과 죽은 자의 군단을 거느린 아르테리아의 원수
  아니면 만약에 지역번호가 11과 같으면
    지역이름은 무너진 태양신전
    적이름은 타락천사 솔카나
    적최대생명은 170
    적공격은 17
    적방어는 8
    적속도는 24
    적보상브론즈는 380
    적경험은 58
    적특징은 반사
    적약점은 암흑
    적최대균형은 14
    적해설은 태양의 가르침을 버리고 빛을 거울처럼 되돌리는 타락한 수호천사
  아니면 만약에 지역번호가 10과 같으면
    지역이름은 별빛늪
    적이름은 역병히드라 셀카
    적최대생명은 150
    적공격은 16
    적방어는 6
    적속도는 18
    적보상브론즈는 330
    적경험은 50
    적특징은 독
    적약점은 자연
    적최대균형은 13
    적해설은 오염된 약초를 먹고 머리마다 서로 다른 맹독을 뿜는 늪의 지배자
  아니면 만약에 지역번호가 9와 같으면
    지역이름은 서리관문
    적이름은 서리거인 하르곤
    적최대생명은 138
    적공격은 15
    적방어는 10
    적속도는 9
    적보상브론즈는 290
    적경험은 44
    적특징은 갑옷
    적약점은 화염
    적최대균형은 16
    적해설은 북부의 성벽을 뜯어 얼음 갑옷으로 두른 마지막 서리거인
  아니면 만약에 지역번호가 8과 같으면
    지역이름은 자유도시 황금시장
    적이름은 황금탈 도적왕 레마르
    적최대생명은 118
    적공격은 14
    적방어는 6
    적속도는 30
    적보상브론즈는 260
    적경험은 39
    적특징은 도박
    적약점은 공명
    적최대균형은 11
    적해설은 조작한 황금 주사위로 전쟁 물자와 시민의 빚을 함께 빼앗은 자유시장의 도적왕
  아니면 만약에 지역번호가 7과 같으면
    지역이름은 용의협곡
    적이름은 타락한 흑룡 바르카스
    적최대생명은 92
    적공격은 13
    적방어는 5
    적속도는 20
    적보상브론즈는 220
    적경험은 34
    적특징은 흡수
    적약점은 용염
    적최대균형은 10
    적해설은 모르가르의 저주에 굴복해 준 상처를 자기 생명으로 바꾸는 흑룡
  아니면 만약에 지역번호가 6과 같으면
    지역이름은 잿빛요새
    적이름은 흑마법사 모르벨
    적최대생명은 78
    적공격은 12
    적방어는 4
    적속도는 15
    적보상브론즈는 180
    적경험은 29
    적특징은 독
    적약점은 신성
    적최대균형은 8
    적해설은 왕국의 기사였으나 금지된 마법을 익혀 저주의 독을 퍼뜨리는 흑마법사
  아니면 만약에 지역번호가 5와 같으면
    지역이름은 성광수도원 지하묘지
    적이름은 바위골렘 그라니트
    적최대생명은 86
    적공격은 11
    적방어는 8
    적속도는 7
    적보상브론즈는 150
    적경험은 25
    적특징은 갑옷
    적약점은 충격
    적최대균형은 12
    적해설은 고대 드워프의 봉인석으로 만들어져 부서진 갑옷을 다시 만드는 골렘
  아니면 만약에 지역번호가 4와 같으면
    지역이름은 고대 마법탑
    적이름은 트롤왕 보르가
    적최대생명은 66
    적공격은 10
    적방어는 3
    적속도는 23
    적보상브론즈는 125
    적경험은 21
    적특징은 재생
    적약점은 화염
    적최대균형은 8
    적해설은 마법탑의 재생 샘물을 마셔 아무리 베어도 상처가 아물어 버리는 트롤
  아니면 만약에 지역번호가 3과 같으면
    지역이름은 은빛광산
    적이름은 망령기사 에드릭
    적최대생명은 58
    적공격은 9
    적방어는 5
    적속도는 17
    적보상브론즈는 105
    적경험은 18
    적특징은 반사
    적약점은 신성
    적최대균형은 9
    적해설은 왕국을 배신한 뒤 거울 방패에 영혼이 갇혀 기술을 되돌려 보내는 기사
  아니면 만약에 지역번호가 2와 같으면
    지역이름은 속삭임숲
    적이름은 오크 전쟁대장 가르둠
    적최대생명은 49
    적공격은 8
    적방어는 3
    적속도는 21
    적보상브론즈는 85
    적경험은 15
    적특징은 약탈
    적약점은 관통
    적최대균형은 7
    적해설은 왕국의 상단을 습격해 모은 동전을 갑옷처럼 두른 오크 전쟁대장
  아니면
    지역이름은 왕도 북문
    적이름은 붉은귀 고블린 족장 스크락
    적최대생명은 40
    적공격은 7
    적방어는 2
    적속도는 12
    적보상브론즈는 65
    적경험은 12
    적특징은 기세
    적약점은 화염
    적최대균형은 6
    적해설은 부하가 쓰러질수록 더 사납게 칼을 휘두르는 고블린 군단의 족장
  끝

  # 난이도 보정을 모든 적에게 똑같이 더합니다.
  적최대생명에 적생명보정 더해
  적공격에 적공격보정 더해
  적방어에 적방어보정 더해
  적최대균형에 균형보정 더해
  적보상브론즈에 보상보정 더해
  발견지역에 지역이름 넣어

  # 세린이 닫은 차원문과 아우렐의 조언은 마왕에게만 적용됩니다.
  만약에 적특징이 마왕과 같으면
    만약에 마왕약화가 있으면
      적최대생명에서 20 빼줘
      적공격에서 2 빼줘
    끝
  끝

  적생명은 적최대생명
  적화상은 0
  적출혈은 0
  적중독은 0
  적균형은 적최대균형
  적기절은 거짓
  약점발견은 거짓
  지역턴수는 0
  마왕단계는 1
  싸움결과는 싸우는중
  운명연속실패는 0
  다음대성공보장여부는 거짓
  행운동전준비여부는 거짓
  다음치명보장여부는 거짓

  # 전장은 매번 네 가지 상태 가운데 하나가 됩니다.
  # 안개는 회피를 어렵게 하고, 마력폭풍은 기운을, 여신의바람은 생명을 돕습니다.
  전투속도는 용사속도
  # 매의 눈은 안개 속에서도 적의 움직임을 읽게 해 줍니다.
  만약에 장신구번호가 1과 같으면
    전투속도에 6 더해
  끝
  만약에 피로가 59보다 크면
    전투속도에서 5 빼줘
  끝
  만약에 포만이 25보다 작으면
    전투속도에서 4 빼줘
  끝
  만약에 사기가 74보다 크면
    전투속도에 3 더해
  끝
  # 속도가 높아도 완전 회피가 되지 않도록 전투 회피율을 제한합니다.
  만약에 전투속도가 최대회피확률보다 크면 전투속도는 최대회피확률
  전장주사위는 1부터 4까지 무작위 숫자
  만약에 전장주사위가 1과 같으면
    전장효과는 맑은하늘
  아니면 만약에 전장주사위가 2와 같으면
    전장효과는 짙은안개
    전투속도에서 8 빼줘
    만약에 전투속도가 0보다 작으면
      전투속도는 0
    끝
  아니면 만약에 전장주사위가 3과 같으면
    전장효과는 마력폭풍
  아니면
    전장효과는 여신의바람
  끝

  지역이름에게 큰제목그리기 해줘
  지역번호 번째 길 말해줘
  적이름 앞을 가로막습니다 말해줘
  적해설 말해줘
  전장 효과 · 전장효과 말해줘
  짧은기다림 기다려


  # ══════════════════════════════════════════════════════════════════
  # 한 번의 전투
  # 이 반복 한 바퀴가 용사의 행동과 적의 반격 한 번입니다.
  # ══════════════════════════════════════════════════════════════════

  계속 반복해

    전체턴수에 1 더해
    지역턴수에 1 더해
    막는중은 거짓
    기술사용은 거짓
    무기사용은 거짓
    연막중은 거짓
    행동소비여부는 참

    # 전장 효과는 매 차례 시작할 때 작동합니다.
    만약에 전장효과가 마력폭풍과 같으면
      용사기운에 2 더해
      만약에 용사기운이 최대기운보다 크면
        용사기운은 최대기운
      끝
    아니면 만약에 전장효과가 여신의바람과 같으면
      용사생명에 2 더해
      만약에 용사생명이 최대생명보다 크면
        용사생명은 최대생명
      끝
    끝

    # 적의 의도는 세 차례를 한 주기로 반복됩니다.
    # 방어태세에는 폭탄, 강공격에는 방어, 고유기술에는 빠른 공격이 유리합니다.
    의도차례는 지역턴수를 3으로 나눈 나머지
    이번적방어는 적방어
    만약에 의도차례가 1과 같으면
      적의도는 방어태세
      이번적방어에 4 더해
    아니면 만약에 의도차례가 2와 같으면
      적의도는 강공격
    아니면
      적의도는 고유기술
    끝

    만약에 화면번호가 1과 같으면 화면 지워
    행동전적생명은 적생명
    줄 그어
    ⚔ 지역이름 · 지역번호 번째 길 말해줘
    🟥 적 · 적이름 · 생명 적생명 / 적최대생명 말해줘
    막대최대양은 적최대생명
    적생명에게 생명막대그리기 해줘
    🟩 용사 · 용사이름 · 생명 용사생명 / 최대생명 · 기운 용사기운 / 최대기운 말해줘
    막대최대양은 최대생명
    용사생명에게 생명막대그리기 해줘
    단계 용사단계 · 공격 용사공격 · 방어 용사방어 · 속도 용사속도 말해줘
    🟥 적 균형 적균형 / 적최대균형 · 예고 적의도 말해줘
    만약에 적특징이 도박과 같으면
      🟨 레마르의 황금 주사위 · 역풍 33.3 / 보통 33.3 / 강화 33.3 퍼센트 말해줘
    끝
    🟦 회피 전투속도 퍼센트 · 치명 치명확률 퍼센트 · 동료 지원 동료지원확률 퍼센트 말해줘
    🟨 궁극기 궁극기이름 · 충전 궁극기충전 / 궁극기최대 말해줘
    무기 내구 무기내구 / 무기최대내구 · 갑옷 내구 갑옷내구 / 갑옷최대내구 말해줘
    회복약 회복약수 · 고급회복약 고급회복약수 · 기운약 기운약수 · 해독제 해독제수 말해줘
    폭탄 폭탄수 · 성수 성수수 · 연막탄 연막탄수 · 숫돌 숫돌수 말해줘
    행운동전 행운동전수 · 혼돈주사위 혼돈주사위수 말해줘
    만약에 동료목록이 비었으면
      동료 · 아직 없음 말해줘
    아니면
      동료목록을 쉼표로 이어 말해줘
    끝
    소지브론즈에게 화폐보이기 해줘
    줄 그어
    ⚔ 전투 · 공격 / 기술 / 궁극기 / 방어 말해줘
    🧪 물품 · 회복약 / 고급회복약 / 기운약 / 해독제 / 폭탄 / 성수 말해줘
    🎲 확률 · 행운동전 / 혼돈주사위 말해줘
    📜 전술 · 연막탄 / 숫돌 / 살펴보기 / 후퇴 말해줘
    행동을 물어봐 위 행동 가운데 하나를 정확히 적어 주세요

    # 오타가 기본 공격으로 바뀌지 않도록 먼저 모든 입력을 검사합니다.
    행동유효여부는 거짓
    만약에 행동이 공격과 같으면 행동유효여부는 참
    만약에 행동이 기술과 같으면 행동유효여부는 참
    만약에 행동이 궁극기와 같으면 행동유효여부는 참
    만약에 행동이 방어와 같으면 행동유효여부는 참
    만약에 행동이 회복약과 같으면 행동유효여부는 참
    만약에 행동이 고급회복약과 같으면 행동유효여부는 참
    만약에 행동이 기운약과 같으면 행동유효여부는 참
    만약에 행동이 해독제와 같으면 행동유효여부는 참
    만약에 행동이 폭탄과 같으면 행동유효여부는 참
    만약에 행동이 성수와 같으면 행동유효여부는 참
    만약에 행동이 연막탄과 같으면 행동유효여부는 참
    만약에 행동이 숫돌과 같으면 행동유효여부는 참
    만약에 행동이 행운동전과 같으면 행동유효여부는 참
    만약에 행동이 혼돈주사위와 같으면 행동유효여부는 참
    만약에 행동이 살펴보기와 같으면 행동유효여부는 참
    만약에 행동이 후퇴와 같으면 행동유효여부는 참
    만약에 행동유효여부가 없으면
      🟦 입력을 알아듣지 못했습니다. 턴을 쓰지 않고 다시 묻습니다. 말해줘
      전체턴수에서 1 빼줘
      지역턴수에서 1 빼줘
      계속해
    끝


    # ── 용사의 기술 ────────────────────────────────────────────────

    만약에 행동이 궁극기와 같으면

      만약에 궁극기충전이 궁극기최대보다 작으면
        🟦 아직 힘이 모자랍니다. 턴을 쓰지 않고 다시 고를 수 있습니다. 말해줘
        전체턴수에서 1 빼줘
        지역턴수에서 1 빼줘
        계속해
      아니면
        궁극기충전은 0
        무기사용은 참
        적균형에서 5 빼줘

        만약에 직업이름이 원소마법사와 같으면
          준피해는 40
          준피해에 용사공격 더해
          준피해에 용사단계 더해
          적화상은 5
          대화염폭풍이 전장을 뒤덮습니다. 말해줘
        아니면 만약에 직업이름이 엘프궁수와 같으면
          준피해는 35
          준피해에 용사공격 더해
          준피해에 용사속도 더해
          적출혈은 5
          천개의화살이 하늘을 가리고 한꺼번에 떨어집니다. 말해줘
        아니면 만약에 직업이름이 성직자와 같으면
          준피해는 30
          준피해에 용사공격 더해
          준피해에 평화불씨 더해
          준피해에 평화불씨 더해
          용사생명은 최대생명
          용사독은 0
          여신의심판이 어둠을 가르고 모든 상처를 치유합니다. 말해줘
        아니면 만약에 직업이름이 그림자도적과 같으면
          준피해는 34
          준피해에 용사공격 더해
          준피해에 용사속도 더해
          적중독은 6
          그림자처형이 적의 그림자를 베어 맹독을 남깁니다. 말해줘
        아니면 만약에 직업이름이 북방광전사와 같으면
          준피해는 48
          준피해에 용사공격 더해
          준피해에 용사공격 더해
          용사생명에 15 더해
          만약에 용사생명이 최대생명보다 크면
            용사생명은 최대생명
          끝
          보여줘 북방의 분노가 상처를 힘으로 바꾸어 적을 가릅니다.
        아니면 만약에 직업이름이 룬대장장이와 같으면
          준피해는 28
          준피해에 용사공격 더해
          준피해에 용사방어 더해
          준피해에 용사방어 더해
          적방어에서 5 빼줘
          만약에 적방어가 0보다 작으면 적방어는 0
          무기내구에 12 더해
          갑옷내구에 12 더해
          만약에 무기내구가 무기최대내구보다 크면 무기내구는 무기최대내구
          만약에 갑옷내구가 갑옷최대내구보다 크면 갑옷내구는 갑옷최대내구
          대지의모루가 적의 갑옷을 깨고 아군 장비를 다시 벼립니다. 말해줘
        아니면 만약에 직업이름이 음유시인과 같으면
          준피해는 25
          준피해에 용사공격 더해
          준피해에 사기 더해
          적균형에서 5 빼줘
          사기는 100
          영웅서사시가 전장을 울려 적의 싸울 뜻을 무너뜨립니다. 말해줘
        아니면 만약에 직업이름이 숲의드루이드와 같으면
          준피해는 38
          준피해에 용사공격 더해
          준피해에 용사단계 더해
          용사생명은 최대생명
          용사독은 0
          보여줘 고대 숲의 뿌리가 적을 삼키고 상처를 되돌립니다.
        아니면 만약에 직업이름이 황혼흑마법사와 같으면
          준피해는 45
          준피해에 용사공격 더해
          준피해에 용사공격 더해
          용사생명에 25 더해
          만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
          심연의계약이 적의 생명을 대가로 용사를 회복합니다. 말해줘
        아니면 만약에 직업이름이 용혈기병과 같으면
          준피해는 52
          준피해에 용사공격 더해
          준피해에 용사공격 더해
          적화상은 4
          붉은용의강림이 갑옷을 무시하는 불꽃의 창을 내립니다. 말해줘
        아니면 만약에 직업이름이 시간술사와 같으면
          준피해는 38
          준피해에 용사공격 더해
          준피해에 용사속도 더해
          적기절은 참
          멈춘세계에서 오직 용사만 움직여 적의 다음 차례를 지웁니다. 말해줘
        아니면 만약에 직업이름이 운명도박꾼과 같으면
          첫운명패는 1부터 6까지 무작위 숫자
          둘째운명패는 1부터 6까지 무작위 숫자
          셋째운명패는 1부터 6까지 무작위 숫자
          상자로 말해줘 🎲 공개한 운명패 · 첫운명패 / 둘째운명패 / 셋째운명패
          운명눈은 0
          운명선택끝값은 0
          운명선택끝값이 1보다 작은 동안
            운명패선택을 물어봐 첫째, 둘째, 셋째 가운데 가져갈 패를 고르세요
            만약에 운명패선택이 첫째와 같으면
              운명눈은 첫운명패
              운명선택끝값은 1
            아니면 만약에 운명패선택이 둘째와 같으면
              운명눈은 둘째운명패
              운명선택끝값은 1
            아니면 만약에 운명패선택이 셋째와 같으면
              운명눈은 셋째운명패
              운명선택끝값은 1
            아니면
              🟦 세 단어 가운데 하나를 정확히 적어 주세요. 말해줘
            끝
          끝
          준피해는 20
          운명추가피해는 운명눈
          운명추가피해에 5 곱해
          준피해에 운명추가피해 더해
          준피해에 용사공격 더해
          적균형에서 운명눈 빼줘
          만약에 운명눈이 6과 같으면
            적기절은 참
            소지브론즈에 12 더해
            도박승리수에 1 더해
            상자로 말해줘 🟨 대성공 · 여섯이 운명을 뒤엎었습니다
          끝
        아니면
          준피해는 25
          준피해에 용사공격 더해
          준피해에 용사방어 더해
          준피해에 용사방어 더해
          막는중은 참
          용사생명에 20 더해
          만약에 용사생명이 최대생명보다 크면
            용사생명은 최대생명
          끝
          보여줘 왕의수호가 거대한 황금 방패가 되어 적을 짓누릅니다.
        끝

        만약에 기술속성이 적약점과 같으면
          준피해에 약점배율 곱해
          약점발견은 참
          약점공격수에 1 더해
          궁극기가 적의 속성 약점을 꿰뚫어 피해가 크게 늘어납니다. 말해줘
        끝
        적생명에서 준피해 빼줘
        궁극기이름 · 피해 준피해 말해줘

        만약에 첫궁극기업적이 없으면
          첫궁극기업적은 참
          업적목록에 한계를넘은자 넣어
          업적 달성 · 한계를넘은자 말해줘
        끝
      끝

    아니면 만약에 행동이 기술과 같으면

      만약에 용사기운이 기술비용보다 작으면
        🟦 기운이 모자랍니다. 턴을 쓰지 않고 다시 고를 수 있습니다. 말해줘
        전체턴수에서 1 빼줘
        지역턴수에서 1 빼줘
        계속해
      아니면
        기술사용은 참
        무기사용은 참
        용사기운에서 기술비용 빼줘
        궁극기충전에 18 더해
        적균형에서 2 빼줘

        만약에 직업이름이 원소마법사와 같으면
          준피해는 12부터 18까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에 용사단계 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면
            준피해는 1
          끝
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 2 빼줘
            약점발견은 참
            약점공격수에 1 더해
            화염 약점을 맞혀 피해와 균형 피해가 커집니다. 말해줘
          끝
          적생명에서 준피해 빼줘
          적화상은 3
          화염구가 준피해 만큼 폭발하고 적에게 불길이 남습니다. 말해줘

        아니면 만약에 직업이름이 엘프궁수와 같으면
          준피해는 4부터 8까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면
            준피해는 1
          끝
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 2 빼줘
            약점발견은 참
            약점공격수에 1 더해
            관통 약점을 맞혀 첫 화살이 갑옷 깊이 들어갑니다. 말해줘
          끝
          적생명에서 준피해 빼줘
          첫 화살이 준피해 만큼 파고듭니다. 말해줘
          준피해는 4부터 8까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면
            준피해는 1
          끝
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
          끝
          적생명에서 준피해 빼줘
          적출혈은 3
          연속사격의 두 번째 화살이 준피해 만큼 베고 상처를 남깁니다. 말해줘

        아니면 만약에 직업이름이 성직자와 같으면
          준피해는 8부터 13까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에서 이번적방어 빼줘
          만약에 적특징이 마왕과 같으면
            준피해에 평화불씨 더해
            준피해에 평화불씨 더해
          끝
          만약에 준피해가 1보다 작으면
            준피해는 1
          끝
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 2 빼줘
            약점발견은 참
            약점공격수에 1 더해
            신성 약점이 빛에 무너져 피해와 균형 피해가 커집니다. 말해줘
          끝
          적생명에서 준피해 빼줘
          용사생명에 10 더해
          만약에 용사생명이 최대생명보다 크면
            용사생명은 최대생명
          끝
          용사독은 0
          성광 · 피해 준피해 · 몸의 독을 씻었습니다 말해줘

        아니면 만약에 직업이름이 그림자도적과 같으면
          준피해는 9부터 15까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면 준피해는 1
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 2 빼줘
            약점발견은 참
            약점공격수에 1 더해
          끝
          적생명에서 준피해 빼줘
          적중독은 4
          맹독비수가 준피해 만큼 파고들고 독을 남깁니다. 말해줘

        아니면 만약에 직업이름이 북방광전사와 같으면
          준피해는 10부터 16까지 무작위 숫자
          준피해에 용사공격 더해
          절반생명은 최대생명
          절반생명을 2로 나눠
          만약에 용사생명이 절반생명보다 작으면
            준피해에 용사공격 더해
            상처가 분노로 바뀌어 피해가 더 커집니다. 말해줘
          끝
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면 준피해는 1
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 2 빼줘
            약점발견은 참
            약점공격수에 1 더해
          끝
          적생명에서 준피해 빼줘
          광전도끼가 준피해 만큼 갑옷과 살을 함께 가릅니다. 말해줘

        아니면 만약에 직업이름이 룬대장장이와 같으면
          준피해는 8부터 13까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에 용사방어 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면 준피해는 1
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 3 빼줘
            약점발견은 참
            약점공격수에 1 더해
          끝
          적생명에서 준피해 빼줘
          적방어에서 1 빼줘
          만약에 적방어가 0보다 작으면 적방어는 0
          무기내구에 2 더해
          만약에 무기내구가 무기최대내구보다 크면 무기내구는 무기최대내구
          룬망치가 준피해 만큼 때리고 무기와 적 갑옷을 동시에 손봅니다. 말해줘

        아니면 만약에 직업이름이 음유시인과 같으면
          준피해는 7부터 12까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에 용사단계 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면 준피해는 1
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 3 빼줘
            약점발견은 참
            약점공격수에 1 더해
          끝
          적생명에서 준피해 빼줘
          적균형에서 2 빼줘
          사기에 4 더해
          만약에 사기가 100보다 크면 사기는 100
          파열음이 준피해 만큼 울리고 적의 균형을 흔듭니다. 말해줘

        아니면 만약에 직업이름이 숲의드루이드와 같으면
          준피해는 9부터 14까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면 준피해는 1
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 2 빼줘
            약점발견은 참
            약점공격수에 1 더해
          끝
          적생명에서 준피해 빼줘
          용사생명에 8 더해
          만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
          적중독은 2
          덩굴속박이 준피해 만큼 조이고 약초의 기운으로 생명을 회복합니다. 말해줘

        아니면 만약에 직업이름이 황혼흑마법사와 같으면
          준피해는 11부터 17까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면 준피해는 1
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 2 빼줘
            약점발견은 참
            약점공격수에 1 더해
          끝
          적생명에서 준피해 빼줘
          용사생명에 9 더해
          만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
          생명착취가 준피해 만큼 빼앗고 생명 9를 되돌립니다. 말해줘

        아니면 만약에 직업이름이 용혈기병과 같으면
          준피해는 12부터 18까지 무작위 숫자
          준피해에 용사공격 더해
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 3 빼줘
            약점발견은 참
            약점공격수에 1 더해
          끝
          적생명에서 준피해 빼줘
          적화상은 2
          용염창이 방어를 무시하고 준피해 만큼 꿰뚫습니다. 말해줘

        아니면 만약에 직업이름이 시간술사와 같으면
          준피해는 9부터 15까지 무작위 숫자
          준피해에 용사공격 더해
          준피해에 용사단계 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면 준피해는 1
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 4 빼줘
            약점발견은 참
            약점공격수에 1 더해
          끝
          적생명에서 준피해 빼줘
          적균형에서 2 빼줘
          35% 확률로
            적기절은 참
            적의 시간이 얼어붙어 다음 반격이 사라집니다. 말해줘
          끝
          시간균열이 준피해 만큼 과거와 현재를 함께 벱니다. 말해줘

        아니면 만약에 직업이름이 운명도박꾼과 같으면
          만약에 다음대성공보장여부가 있으면
            운명눈은 6
            다음대성공보장여부는 거짓
            운명연속실패는 0
            🟨 실패 보호 발동 · 이번 주사위는 반드시 6입니다. 말해줘
          아니면
            운명눈은 1부터 6까지 무작위 숫자
            만약에 행운동전준비여부가 있으면
              추가운명눈은 1부터 6까지 무작위 숫자
              행운동전준비여부는 거짓
              🎲 기울어진 동전 · 운명눈과 추가운명눈 가운데 높은 눈을 씁니다 말해줘
              만약에 추가운명눈이 운명눈보다 크면 운명눈은 추가운명눈
            끝
          끝
          🎲 운명의 주사위 · 나온 눈 운명눈 / 6 · 각 눈 확률 16.7 퍼센트 말해줘
          만약에 운명눈이 1과 같으면
            준피해는 1
            용사생명에서 4 빼줘
            운명연속실패에 1 더해
            도박패배수에 1 더해
            🟥 역풍 · 피해 1 · 생명 4 손실 말해줘
          아니면 만약에 운명눈이 2와 같으면
            준피해는 6
            준피해에 용사공격 더해
            준피해에서 이번적방어 빼줘
            만약에 준피해가 1보다 작으면 준피해는 1
            운명연속실패에 1 더해
            도박패배수에 1 더해
            🟥 낮은 수 · 약한 피해 준피해 말해줘
          아니면 만약에 운명눈이 3과 같으면
            준피해는 10
            준피해에 용사공격 더해
            준피해에서 이번적방어 빼줘
            운명연속실패는 0
            🟦 평범한 수 · 피해 준피해 말해줘
          아니면 만약에 운명눈이 4와 같으면
            준피해는 16
            준피해에 용사공격 더해
            준피해에서 이번적방어 빼줘
            적균형에서 1 빼줘
            운명연속실패는 0
            🟩 높은 수 · 피해 준피해 · 균형 추가 피해 말해줘
          아니면 만약에 운명눈이 5와 같으면
            준피해는 21
            준피해에 용사공격 더해
            준피해에서 이번적방어 빼줘
            용사생명에 7 더해
            만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
            운명연속실패는 0
            도박승리수에 1 더해
            🟨 큰 성공 · 피해 준피해 · 생명 7 회복 말해줘
          아니면
            준피해는 30
            준피해에 용사공격 더해
            준피해에서 이번적방어 빼줘
            적균형에서 4 빼줘
            소지브론즈에 6 더해
            운명연속실패는 0
            도박승리수에 1 더해
            상자로 말해줘 🟨 대성공 · 피해 준피해 · 균형 4 · 6 브론즈
          끝
          만약에 운명연속실패가 1보다 크면
            다음대성공보장여부는 참
            🟨 두 번 연속 낮은 눈이 나왔습니다. 다음 기술은 6이 보장됩니다. 말해줘
          끝
          적생명에서 준피해 빼줘

        아니면
          준피해는 7부터 11까지 무작위 숫자
          준피해에 용사방어 더해
          준피해에서 이번적방어 빼줘
          만약에 준피해가 1보다 작으면
            준피해는 1
          끝
          만약에 기술속성이 적약점과 같으면
            준피해에 약점배율 곱해
            적균형에서 2 빼줘
            약점발견은 참
            약점공격수에 1 더해
            충격 약점을 방패로 깨뜨려 피해와 균형 피해가 커집니다. 말해줘
          끝
          적생명에서 준피해 빼줘
          용사생명에 7 더해
          만약에 용사생명이 최대생명보다 크면
            용사생명은 최대생명
          끝
          막는중은 참
          방패강타가 준피해 만큼 밀어내고 다시 앞을 지킵니다. 말해줘
        끝
      끝


    # ── 물건 ────────────────────────────────────────────────────────

    아니면 만약에 행동이 회복약과 같으면
      만약에 회복약수가 0보다 크면
        회복약수에서 1 빼줘
        용사생명에 회복약회복 더해
        만약에 용사생명이 최대생명보다 크면
          용사생명은 최대생명
        끝
        용사독은 0
        따뜻한 회복약이 생명을 되돌리고 독을 씻어 냅니다. 말해줘
      아니면
        빈 병만 굴러다닙니다. 말해줘
        행동소비여부는 거짓
      끝

    아니면 만약에 행동이 고급회복약과 같으면
      만약에 고급회복약수가 0보다 크면
        고급회복약수에서 1 빼줘
        용사생명에 고급회복약회복 더해
        만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
        용사독은 0
        붉은 결정이 든 고급 회복약이 큰 상처와 독을 함께 없앱니다. 말해줘
      아니면
        고급 회복약이 없습니다. 말해줘
        행동소비여부는 거짓
      끝

    아니면 만약에 행동이 기운약과 같으면
      만약에 기운약수가 0보다 크면
        기운약수에서 1 빼줘
        용사기운에 기운약회복 더해
        만약에 용사기운이 최대기운보다 크면
          용사기운은 최대기운
        끝
        손끝까지 기운이 돌아옵니다. 말해줘
      아니면
        기운약이 없습니다. 말해줘
        행동소비여부는 거짓
      끝

    아니면 만약에 행동이 해독제와 같으면
      만약에 해독제수가 0보다 크면
        해독제수에서 1 빼줘
        용사독은 0
        용사생명에 5 더해
        만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
        쓴 해독제가 몸에 남은 독을 씻고 생명 5를 되돌립니다. 말해줘
      아니면
        해독제가 없습니다. 말해줘
        행동소비여부는 거짓
      끝

    아니면 만약에 행동이 폭탄과 같으면
      만약에 폭탄수가 0보다 크면
        폭탄수에서 1 빼줘
        준피해는 폭탄위력
        적균형에서 4 빼줘
        만약에 적약점이 충격과 같으면
          준피해에 약점배율 곱해
          약점발견은 참
          약점공격수에 1 더해
          폭발이 충격 약점을 정확히 깨뜨립니다. 말해줘
        끝
        적생명에서 준피해 빼줘
        폭탄이 적의 방어를 뚫고 준피해 만큼 터집니다. 말해줘
        만약에 적특징이 갑옷과 같으면
          적방어에서 2 빼줘
          만약에 적방어가 0보다 작으면
            적방어는 0
          끝
          골렘의 돌 갑옷도 함께 부서졌습니다. 말해줘
        끝
      아니면
        던질 폭탄이 없습니다. 말해줘
        행동소비여부는 거짓
      끝

    아니면 만약에 행동이 성수와 같으면
      만약에 성수수가 0보다 크면
        성수수에서 1 빼줘
        준피해는 38
        만약에 적약점이 신성과 같으면
          준피해에 약점배율 곱해
          적균형에서 3 빼줘
          약점발견은 참
          약점공격수에 1 더해
        끝
        적생명에서 준피해 빼줘
        적화상은 2
        축복받은 성수가 방어를 무시하고 준피해 만큼 태웁니다. 말해줘
      아니면
        성수가 없습니다. 말해줘
        행동소비여부는 거짓
      끝

    아니면 만약에 행동이 연막탄과 같으면
      만약에 연막탄수가 0보다 크면
        연막탄수에서 1 빼줘
        연막중은 참
        적균형에서 1 빼줘
        회색 연기가 전장을 덮어 이번 반격의 목표를 잃게 합니다. 말해줘
      아니면
        연막탄이 없습니다. 말해줘
        행동소비여부는 거짓
      끝

    아니면 만약에 행동이 숫돌과 같으면
      만약에 숫돌수가 0보다 크면
        숫돌수에서 1 빼줘
        무기내구에 18 더해
        만약에 무기내구가 무기최대내구보다 크면 무기내구는 무기최대내구
        궁극기충전에 8 더해
        전투용 숫돌로 날을 세워 무기 내구와 집중을 되찾았습니다. 말해줘
      아니면
        숫돌이 없습니다. 말해줘
        행동소비여부는 거짓
      끝

    # 기울어진 동전은 다음 확률 판정을 유리하게 만듭니다.
    # 도박꾼은 주사위를 두 번 굴려 높은 눈을 쓰고, 다른 직업은 다음 기본 공격이 치명타가 됩니다.
    아니면 만약에 행동이 행운동전과 같으면
      만약에 행운동전수가 0보다 크면
        행운동전수에서 1 빼줘
        만약에 직업이름이 운명도박꾼과 같으면
          행운동전준비여부는 참
          🟨 다음 운명의 주사위는 두 번 굴려 높은 눈을 사용합니다. 말해줘
        아니면
          다음치명보장여부는 참
          🟨 다음 기본 공격은 반드시 치명타가 됩니다. 말해줘
        끝
        # 준비 도구는 적의 반격 없이 사용합니다.
        행동소비여부는 거짓
      아니면
        행운 동전이 없습니다. 말해줘
        행동소비여부는 거짓
      끝

    # 혼돈 주사위의 여섯 결과는 모두 같은 확률이며 사용 전에 언제든 살펴볼 수 있습니다.
    아니면 만약에 행동이 혼돈주사위와 같으면
      만약에 혼돈주사위수가 0보다 크면
        혼돈주사위수에서 1 빼줘
        혼돈눈은 1부터 6까지 무작위 숫자
        🎲 혼돈 주사위 · 각 결과 확률 16.7 퍼센트 · 나온 눈 혼돈눈 말해줘
        만약에 혼돈눈이 1과 같으면
          용사생명에서 8 빼줘
          만약에 용사생명이 1보다 작으면 용사생명은 1
          도박패배수에 1 더해
          🟥 균열이 손을 물어 생명 8을 잃었습니다. 말해줘
        아니면 만약에 혼돈눈이 2와 같으면
          잃은기운은 4
          만약에 용사기운이 잃은기운보다 작으면 잃은기운은 용사기운
          용사기운에서 잃은기운 빼줘
          도박패배수에 1 더해
          🟥 주사위가 기운 잃은기운 만큼 삼켰습니다. 말해줘
        아니면 만약에 혼돈눈이 3과 같으면
          용사생명에 14 더해
          만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
          🟩 생명 14를 회복했습니다. 말해줘
        아니면 만약에 혼돈눈이 4와 같으면
          용사기운에 10 더해
          만약에 용사기운이 최대기운보다 크면 용사기운은 최대기운
          🟦 기운 10을 회복했습니다. 말해줘
        아니면 만약에 혼돈눈이 5와 같으면
          적생명에서 24 빼줘
          도박승리수에 1 더해
          🟨 방어를 무시하는 운명 피해 24를 주었습니다. 말해줘
        아니면
          적생명에서 42 빼줘
          적균형에서 4 빼줘
          도박승리수에 1 더해
          상자로 말해줘 🟨 혼돈 대성공 · 피해 42 · 균형 4
        끝
      아니면
        혼돈 주사위가 없습니다. 말해줘
        행동소비여부는 거짓
      끝


    # ── 방어와 정보, 후퇴 ──────────────────────────────────────────

    아니면 만약에 행동이 방어와 같으면
      막는중은 참
      용사기운에 3 더해
      궁극기충전에 20 더해
      만약에 용사기운이 최대기운보다 크면
        용사기운은 최대기운
      끝
      발을 굳게 붙이고 기운을 모읍니다. 말해줘

    아니면 만약에 행동이 살펴보기와 같으면
      약점발견은 참
      적이름의 특징은 적특징 입니다 말해줘
      적의 약점은 적약점 · 균형은 적균형 입니다 말해줘
      적해설 말해줘
      만약에 적특징이 반사와 같으면
        강한 기술은 거울 방패에 일부 되돌아옵니다. 평범한 공격과 폭탄이 안전합니다. 말해줘
      아니면 만약에 적특징이 갑옷과 같으면
        방어가 매우 높습니다. 폭탄은 방어를 무시하고 돌 갑옷도 부숩니다. 말해줘
      아니면 만약에 적특징이 재생과 같으면
        매 차례 상처를 회복합니다. 화상과 출혈로 회복을 따라잡으세요. 말해줘
      아니면 만약에 적특징이 도박과 같으면
        레마르의 고유기술은 1과 2 역풍, 3과 4 보통, 5와 6 강화입니다. 각 묶음은 33.3 퍼센트입니다. 말해줘
      아니면 만약에 적특징이 마왕과 같으면
        생명이 줄면 모습과 공격 방식이 두 번 변합니다. 말해줘
      아니면 만약에 적특징이 심연과 같으면
        궁극기 충전을 삼키는 숨결을 씁니다. 균형 파괴와 시간 속성이 열쇠입니다. 말해줘
      끝
      🎲 공개 확률 · 치명 14 퍼센트 · 회피 전투속도 퍼센트 · 동료 지원 동료지원확률 퍼센트 말해줘
      혼돈 주사위 · 1과 2 불리 / 3과 4 회복 / 5와 6 공격 · 각 16.7 퍼센트 말해줘
      만약에 직업이름이 운명도박꾼과 같으면
        운명의 주사위 · 1부터 6까지 각각 16.7 퍼센트 · 낮은 눈 2연속 뒤 다음 6 보장 말해줘
      끝
      행동소비여부는 거짓

    아니면 만약에 행동이 후퇴와 같으면
      만약에 지역번호가 11보다 크면
        왕좌 뒤에는 벽뿐입니다. 이제 싸움을 끝내야 합니다. 말해줘
      아니면
        도망주사위는 1부터 100까지 무작위 숫자
        만약에 도망주사위가 기본도망확률보다 작거나 같으면
          만약에 소지브론즈가 10보다 크거나 같으면
            소지브론즈에서 10 빼줘
            용사생명에 12 더해
            용사기운에 5 더해
            만약에 용사생명이 최대생명보다 크면
              용사생명은 최대생명
            끝
            만약에 용사기운이 최대기운보다 크면
              용사기운은 최대기운
            끝
            적생명은 적최대생명
            적화상은 0
            적출혈은 0
            적균형은 적최대균형
            1 실버를 내고 길드 야영지로 물러났습니다. 적도 생명을 모두 회복했습니다. 말해줘
            계속해
          아니면
            야영지 사용료 1 실버가 없어 물러날 수 없습니다. 말해줘
          끝
        아니면
          적이 먼저 길을 막았습니다. 말해줘
        끝
      끝


    # ── 기본 공격 ───────────────────────────────────────────────────
    # 입력 검사를 통과한 \`공격\`만 이 갈래에 도착합니다.

    아니면
      무기사용은 참
      준피해는 5부터 10까지 무작위 숫자
      준피해에 용사공격 더해
      준피해에서 이번적방어 빼줘
      적균형에서 1 빼줘
      궁극기충전에 12 더해
      만약에 다음치명보장여부가 있으면
        치명주사위는 0
        다음치명보장여부는 거짓
      아니면
        치명주사위는 1부터 100까지 무작위 숫자
      끝
      만약에 치명주사위가 치명확률보다 작거나 같으면
        준피해에 2 곱해
        왕가의 인장이 빛나고 빈틈을 정확히 찌릅니다. 말해줘
      끝
      만약에 준피해가 1보다 작으면
        준피해는 1
      끝
      적생명에서 준피해 빼줘
      무기이름이 준피해 만큼 상처를 냅니다. 말해줘
    끝

    # 없는 물건 사용과 살펴보기는 턴을 쓰지 않고 같은 화면으로 돌아갑니다.
    만약에 행동소비여부가 없으면
      전체턴수에서 1 빼줘
      지역턴수에서 1 빼줘
      계속해
    끝


    # 공격과 기술은 무기를 닳게 합니다. 내구가 0이면 수리 전까지 기본 공격력이 약해집니다.
    만약에 무기사용이 있으면
      무기내구에서 1 빼줘
      만약에 무기내구가 0보다 작으면 무기내구는 0
      만약에 무기내구가 0과 같으면
        적생명에 3 더해
        만약에 적생명이 행동전적생명보다 크면 적생명은 행동전적생명
        무기의 날이 무뎌져 이번 피해 가운데 3을 제대로 주지 못했습니다. 말해줘
      끝
    끝


    # ── 궁극기 충전과 업적 ─────────────────────────────────────────

    만약에 궁극기충전이 궁극기최대보다 크면
      궁극기충전은 궁극기최대
    끝

    만약에 약점발견이 있으면
      만약에 첫약점업적이 없으면
        첫약점업적은 참
        업적목록에 약점사냥꾼 넣어
        업적 달성 · 약점사냥꾼 말해줘
      끝
    끝


    # ── 동료 지원 ───────────────────────────────────────────────────
    # 모집한 동료 가운데 한 명이 확률적으로 자기 방식으로 전투를 돕습니다.

    동료수는 동료목록 개수
    지원주사위는 1부터 100까지 무작위 숫자
    만약에 동료수가 0보다 크면
      만약에 지원주사위가 동료지원확률보다 작거나 같으면
        # 실제 모집 목록에 있는 사람이 나올 때까지 다시 골라 표시 확률을 지킵니다.
        지원찾기값은 0
        지원찾기값이 1보다 작은 동안
          지원대상은 리아넬 또는 브룸 또는 세린 또는 아델라 또는 카일 또는 아우렐 또는 이사벨 또는 다리온 또는 네리아 또는 루시안 중에서 랜덤선택
          만약에 동료목록에 지원대상이 있으면 지원찾기값은 1
        끝

        만약에 지원대상이 리아넬과 같으면
          지원피해는 6
          지원피해에 용사단계 더해
          적생명에서 지원피해 빼줘
          리아넬의 엄호 사격 · 피해 지원피해 말해줘
        아니면 만약에 지원대상이 브룸과 같으면
          적균형에서 2 빼줘
          브룸의 룬 망치가 적의 균형을 2만큼 흔듭니다. 말해줘
        아니면 만약에 지원대상이 세린과 같으면
          용사기운에 4 더해
          만약에 용사기운이 최대기운보다 크면 용사기운은 최대기운
          세린이 마력 전달로 기운 4를 채웁니다. 말해줘
        아니면 만약에 지원대상이 아델라와 같으면
          용사생명에 8 더해
          만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
          용사독은 0
          아델라의 치유 기도가 생명 8과 독을 회복합니다. 말해줘
        아니면 만약에 지원대상이 카일과 같으면
          막는중은 참
          카일이 방패를 들고 이번 반격을 함께 막습니다. 말해줘
        아니면 만약에 지원대상이 아우렐과 같으면
          지원피해는 12
          적생명에서 지원피해 빼줘
          아우렐의 황금 불꽃 · 피해 지원피해 말해줘
        아니면 만약에 지원대상이 이사벨과 같으면
          소지브론즈에 8 더해
          사기에 3 더해
          만약에 사기가 100보다 크면 사기는 100
          이사벨이 적의 보급품을 되팔아 8 브론즈와 전의를 보탭니다. 말해줘
        아니면 만약에 지원대상이 다리온과 같으면
          막는중은 참
          궁극기충전에 6 더해
          다리온이 북부 방패진으로 반격을 막고 집중을 높입니다. 말해줘
        아니면 만약에 지원대상이 네리아와 같으면
          용사독은 0
          용사생명에 6 더해
          만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
          네리아의 약초 연기가 독을 없애고 생명 6을 회복합니다. 말해줘
        아니면
          지원피해는 10
          적생명에서 지원피해 빼줘
          적균형에서 1 빼줘
          루시안의 태양검이 피해 10과 균형 피해를 줍니다. 말해줘
        끝
      끝
    끝


    # 균형이 모두 깎이면 적은 이번 차례에 행동하지 못합니다.
    만약에 적균형이 1보다 작으면
      적기절은 참
      적의도는 기절
      균형파괴수에 1 더해
      줄 그어
      적이름의 균형이 무너졌습니다. 이번 반격을 건너뜁니다. 말해줘
      줄 그어
      만약에 첫균형업적이 없으면
        첫균형업적은 참
        업적목록에 균형파괴자 넣어
        업적 달성 · 균형파괴자 말해줘
      끝
    끝


    # ── 적에게 남은 상태이상 ───────────────────────────────────────

    만약에 적화상이 0보다 크면
      적화상에서 1 빼줘
      적생명에서 화상피해 빼줘
      남은 불씨가 화상피해 만큼 더 태웁니다. 말해줘
    끝

    만약에 적출혈이 0보다 크면
      적출혈에서 1 빼줘
      적생명에서 출혈피해 빼줘
      깊은 상처가 출혈피해 만큼 더 벌어집니다. 말해줘
    끝

    만약에 적중독이 0보다 크면
      적중독에서 1 빼줘
      적생명에서 독피해 빼줘
      맹독이 적의 생명을 독피해 만큼 안에서부터 깎습니다. 말해줘
    끝


    # ── 반사 갑옷의 고유 행동 ──────────────────────────────────────

    만약에 적특징이 반사와 같으면
      만약에 기술사용이 있으면
        반사피해는 5
        용사생명에서 반사피해 빼줘
        에드릭의 거울 방패가 기술을 비추어 반사피해 만큼 돌려줍니다. 말해줘
      끝
    끝

    # 반사 피해로 양쪽이 동시에 쓰러졌을 때 죽은 상태로 승리하지 않게 먼저 판정합니다.
    만약에 용사생명이 1보다 작으면
      만약에 수호룬보유여부가 있으면
        만약에 수호룬사용여부가 없으면
          수호룬사용여부는 참
          용사생명은 24
          용사기운은 8
          용사독은 0
          브룸의 수호 룬이 반사 피해에서 용사를 구했습니다. 말해줘
        아니면
          싸움결과는 쓰러짐
          끝맺음은 쓰러짐
          멈춰
        끝
      아니면
        싸움결과는 쓰러짐
        끝맺음은 쓰러짐
        멈춰
      끝
    끝


    # 적이 쓰러졌다면 반격 차례를 주지 않습니다.
    만약에 적생명이 1보다 작으면
      줄 그어
      적이름 쓰러졌습니다 말해줘
      싸움결과는 승리
      멈춰
    끝


    # ── 마왕의 모습 변화 ────────────────────────────────────────────

    만약에 적특징이 마왕과 같으면
      만약에 마왕단계가 1과 같으면
        만약에 적생명이 150보다 작으면
          마왕단계는 2
          적공격에 3 더해
          줄 그어
          모르가르의 검은 갑옷이 갈라지고 거대한 악마 날개가 펼쳐집니다. 말해줘
          이제 마왕은 마계의 불꽃으로 기운까지 태우는 두 번째 모습입니다. 말해줘
          줄 그어
        끝
      아니면 만약에 마왕단계가 2와 같으면
        만약에 적생명이 70보다 작으면
          마왕단계는 3
          적공격에 4 더해
          용사독은 3
          줄 그어
          모르가르가 왕좌를 부수고 뿔 달린 대악마의 본모습을 드러냅니다. 말해줘
          여신의 성화가 마지막으로 크게 타오릅니다. 말해줘
          줄 그어
        끝
      끝
    끝


    # ════════════════════════════════════════════════════════════════
    # 적의 반격
    # 먼저 공통 피해를 만든 뒤, 각 적의 특징이 자기 행동을 더합니다.
    # ════════════════════════════════════════════════════════════════

    받은피해는 3부터 8까지 무작위 숫자
    받은피해에 적공격 더해
    받은피해에서 용사방어 빼줘
    만약에 적의도가 강공격과 같으면
      받은피해에 5 더해
    끝

    만약에 막는중이 있으면
      받은피해에서 용사방어 빼줘
      받은피해에서 3 빼줘
    끝

    # 속도는 그대로 회피 확률이 됩니다. 균형이 무너지면 공격 자체를 못 합니다.
    회피주사위는 1부터 100까지 무작위 숫자
    피함은 거짓
    만약에 회피주사위가 전투속도보다 작거나 같으면
      피함은 참
    끝
    만약에 적기절이 있으면
      피함은 참
    끝
    만약에 연막중이 있으면
      피함은 참
    끝

    만약에 피함이 있으면
      만약에 적기절이 있으면
        적이름 균형을 잃어 아무 행동도 하지 못합니다 말해줘
      아니면
        적이 덤벼든 자리에는 흩어진 먼지만 남습니다. 말해줘
      끝
    아니면
      만약에 갑옷내구가 0과 같으면
        받은피해에 3 더해
      끝
      만약에 받은피해가 1보다 작으면
        받은피해는 1
      끝
      용사생명에서 받은피해 빼줘
      갑옷내구에서 1 빼줘
      만약에 갑옷내구가 0보다 작으면 갑옷내구는 0
      궁극기충전에 10 더해
      적이름 · 반격으로 받은피해 만큼 생명을 깎습니다 말해줘

      # 오크 전쟁대장 가르둠은 공격이 닿을 때 전리품을 약탈합니다.
      만약에 적특징이 약탈과 같으면
        만약에 적의도가 고유기술과 같으면
          훔친돈은 4
          만약에 소지브론즈가 훔친돈보다 작으면
            훔친돈은 소지브론즈
          끝
          소지브론즈에서 훔친돈 빼줘
          적보상브론즈에 훔친돈 더해
          적이 훔친돈 브론즈를 빼앗았습니다. 승리한 뒤 되찾습니다. 말해줘
        끝
      끝

      # 흑마법사 모르벨의 저주는 독으로 남습니다.
      만약에 적특징이 독과 같으면
        만약에 적의도가 고유기술과 같으면
          40% 확률로
            용사독은 3
            검은 글자가 피부 밑으로 번집니다. 세 차례 동안 독이 남습니다. 말해줘
          끝
        끝
      끝

      # 흑룡 바르카스는 준 상처를 자기 생명으로 바꿉니다.
      만약에 적특징이 흡수와 같으면
        만약에 적의도가 고유기술과 같으면
          적생명에 5 더해
          만약에 적생명이 적최대생명보다 크면
            적생명은 적최대생명
          끝
          바르카스가 피의 마법으로 생명 5를 되찾습니다. 말해줘
        끝
      끝

      # 마왕의 두 번째 모습은 기운을, 세 번째 모습은 생명도 더 가져갑니다.
      만약에 적특징이 마왕과 같으면
        만약에 적의도가 고유기술과 같으면
          만약에 마왕단계가 2와 같으면
            빼앗은기운은 3
            만약에 용사기운이 빼앗은기운보다 작으면
              빼앗은기운은 용사기운
            끝
            용사기운에서 빼앗은기운 빼줘
            마계의 불꽃이 기운 빼앗은기운 만큼 태웁니다. 말해줘
          아니면 만약에 마왕단계가 3과 같으면
            추가피해는 4
            용사생명에서 추가피해 빼줘
            대악마의 꼬리가 갑옷을 꿰뚫어 추가피해 만큼 더 깎습니다. 말해줘
          끝
        끝
      끝

      # 숨은 보스는 고유기술 차례에 모아 둔 궁극기 힘을 먹습니다.
      만약에 적특징이 심연과 같으면
        만약에 적의도가 고유기술과 같으면
          빼앗은충전은 20
          만약에 궁극기충전이 빼앗은충전보다 작으면
            빼앗은충전은 궁극기충전
          끝
          궁극기충전에서 빼앗은충전 빼줘
          녹스의 심연 숨결이 궁극기 충전 빼앗은충전 만큼 삼킵니다. 말해줘
        끝
      끝
    끝


    # ── 적마다 한 번 더 일어나는 고유 행동 ────────────────────────

    만약에 적특징이 기세와 같으면
      만약에 적의도가 고유기술과 같으면
        적공격에 1 더해
        스크락이 고블린 부하를 불러 기세를 올립니다. 다음 공격이 더 거세집니다. 말해줘
      끝
    아니면 만약에 적특징이 재생과 같으면
      만약에 적의도가 고유기술과 같으면
        적생명에 6 더해
        만약에 적생명이 적최대생명보다 크면
          적생명은 적최대생명
        끝
        보르가의 트롤 혈통이 상처를 메워 생명 6을 되찾습니다. 말해줘
      끝
    아니면 만약에 적특징이 갑옷과 같으면
      만약에 적의도가 고유기술과 같으면
        30% 확률로
          적방어에 1 더해
          적이름의 깨진 갑옷 위로 새 보호층이 자라 방어가 다시 오릅니다. 말해줘
        끝
      끝
    아니면 만약에 적특징이 도박과 같으면
      만약에 적의도가 고유기술과 같으면
        레마르눈은 1부터 6까지 무작위 숫자
        🎲 레마르의 황금 주사위 · 나온 눈 레마르눈 / 6 말해줘
        만약에 레마르눈이 2보다 작거나 같으면
          적생명에서 10 빼줘
          적균형에서 2 빼줘
          🟩 조작 장치가 거꾸로 터져 레마르가 피해 10과 균형 피해 2를 받습니다. 말해줘
        아니면 만약에 레마르눈이 4보다 작거나 같으면
          🟦 아무 효과도 없는 평범한 눈입니다. 말해줘
        아니면
          강화피해는 5
          용사생명에서 강화피해 빼줘
          🟥 높은 눈 · 방어를 무시하는 추가 피해 5를 받았습니다. 말해줘
        끝
      끝
    끝

    # 기절은 한 차례만 유지되고 균형은 다시 가득 찹니다.
    만약에 적기절이 있으면
      적기절은 거짓
      적균형은 적최대균형
    끝

    만약에 궁극기충전이 궁극기최대보다 크면
      궁극기충전은 궁극기최대
    끝


    # ── 용사에게 남은 독 ───────────────────────────────────────────

    만약에 용사독이 0보다 크면
      용사독에서 1 빼줘
      용사생명에서 독피해 빼줘
      몸에 남은 독이 독피해 만큼 생명을 깎습니다. 말해줘
    끝


    # ── 쓰러짐과 브룸의 수호 룬이 주는 단 한 번의 구출 ────────────

    만약에 용사생명이 1보다 작으면
      만약에 수호룬보유여부가 있으면
        만약에 수호룬사용여부가 없으면
          수호룬사용여부는 참
          용사생명은 24
          용사기운은 8
          용사독은 0
          줄 그어
          브룸이 새긴 수호 룬이 부서지며 생명을 한 번 되돌렸습니다. 말해줘
          줄 그어
        아니면
          싸움결과는 쓰러짐
          만약에 마왕처치가 있으면
            끝맺음은 희생
          아니면
            끝맺음은 쓰러짐
          끝
          멈춰
        끝
      아니면
        싸움결과는 쓰러짐
        만약에 마왕처치가 있으면
          끝맺음은 희생
        아니면
          끝맺음은 쓰러짐
        끝
        멈춰
      끝
    끝

  끝


  # ── 전투 반복에서 나온 뒤 ────────────────────────────────────────

  만약에 싸움결과가 쓰러짐과 같으면
    멈춰
  끝


  # ── 마왕과 숨은 보스를 쓰러뜨린 순간 ─────────────────────────────

  만약에 적특징이 마왕과 같으면
    쓰러뜨린적에 적이름을 1로 넣어
    소지브론즈에 적보상브론즈 더해
    마왕처치는 참
    퀘스트표에 마왕토벌을 완료로 넣어
    업적목록에 마왕사냥꾼 넣어
    줄 그어
    마왕 모르가르를 쓰러뜨렸습니다. 왕국의 전쟁은 끝났습니다. 말해줘
    줄 그어

    # 높은 희망과 다섯 명 이상의 동료가 있으면 세계의 균열이 열립니다.
    동료수는 동료목록 개수
    숨은길열림은 거짓
    만약에 희망점수가 7보다 크면
      만약에 동료수가 4보다 크면
        숨은길열림은 참
      끝
    끝

    만약에 숨은길열림이 있으면
      이야기:

        마왕의 왕좌 아래에서 검은 균열이 열립니다.
        동료들은 모르가르보다 오래된 존재가 깨어나기 전에 지금 봉인해야 한다고 말합니다.
        왕국의 평화는 이미 되찾았습니다. 이 문 너머는 오직 준비된 사람을 위한 마지막 도전입니다.

      끝
      숨은길후보들은 목록 도전, 돌아가기
      숨은길입력끝값은 0
      숨은길입력끝값이 1보다 작은 동안
        숨은길선택을 물어봐 세계의 균열로 들어가겠습니까? 도전, 돌아가기
        만약에 숨은길후보들에 숨은길선택이 있으면
          숨은길입력끝값은 1
        아니면
          🟦 도전 또는 돌아가기를 적어 주세요. 말해줘
        끝
      끝
      만약에 숨은길선택이 도전과 같으면
        지역번호는 13
        최고지역은 13
        계속해
      끝
    끝

    끝맺음은 평화
    멈춰
  끝

  만약에 적특징이 심연과 같으면
    쓰러뜨린적에 적이름을 1로 넣어
    소지브론즈에 적보상브론즈 더해
    장신구번호는 4
    장신구이름은 녹스의 심연파편
    숨은보스승리는 참
    업적목록에 심연정복자 넣어
    끝맺음은 완전한평화
    멈춰
  끝


  # ── 승리 보상과 쓰러뜨린 적 기록 ─────────────────────────────────

  소지브론즈에 적보상브론즈 더해
  용사경험에 적경험 더해
  평화불씨에 1 더해
  운명인장수에 1 더해
  명성에 2 더해
  적보상브론즈 브론즈 가치의 전리품과 경험치 적경험 점을 얻었습니다 말해줘
  평화의 불씨가 평화불씨 만큼 밝아졌습니다 말해줘
  🟨 지역 우두머리의 운명 인장 1개를 얻었습니다. 현재 운명인장수 개 말해줘

  만약에 쓰러뜨린적에 적이름이 있으면
    전에쓰러뜨린수는 쓰러뜨린적의 적이름
    전에쓰러뜨린수에 1 더해
    쓰러뜨린적에 적이름을 전에쓰러뜨린수로 넣어
  아니면
    쓰러뜨린적에 적이름을 1로 넣어
  끝


  # ── 재료 전리품 ──────────────────────────────────────────────────
  # 지역에 따라 재료가 달라집니다. 야영의 제작 메뉴에서 소비합니다.

  재료수는 1부터 2까지 무작위 숫자
  만약에 지역번호가 2보다 작거나 같으면
    약초수에 재료수 더해
    질긴천수에 1 더해
    약초 재료수 개와 질긴천 1개를 찾았습니다 말해줘
  아니면 만약에 지역번호가 4보다 작거나 같으면
    철광석수에 재료수 더해
    마력가루수에 1 더해
    철광석 재료수 개와 마력가루 1개를 얻었습니다 말해줘
  아니면 만약에 지역번호가 6보다 작거나 같으면
    마력가루수에 재료수 더해
    마력수정수에 1 더해
    마력가루 재료수 개와 마력수정 1개를 모았습니다 말해줘
  아니면 만약에 지역번호가 8보다 작거나 같으면
    가죽수에 재료수 더해
    질긴천수에 1 더해
    가죽 재료수 개와 질긴천 1개를 얻었습니다 말해줘
  아니면 만약에 지역번호가 10보다 작거나 같으면
    약초수에 재료수 더해
    가죽수에 1 더해
    약초 재료수 개와 가죽 1개를 얻었습니다 말해줘
  아니면
    용비늘수에 1 더해
    마력수정수에 1 더해
    용비늘 1개와 마력수정 1개를 얻었습니다 말해줘
  끝

  만약에 소지브론즈가 99보다 크면
    만약에 부자업적이 없으면
      부자업적은 참
      업적목록에 첫골드 넣어
      업적 달성 · 첫골드 말해줘
    끝
  끝


  # ── 단계 상승 ────────────────────────────────────────────────────
  # 필요한 경험을 넘을 때마다 능력 하나를 직접 고릅니다.

  용사경험이 다음경험보다 크거나 같은 동안
    용사경험에서 다음경험 빼줘
    용사단계에 1 더해
    다음경험에 8 더해
    줄 그어
    용사이름 이제 용사단계 단계입니다 말해줘
    성장후보들은 목록 생명, 공격, 방어, 기운, 속도
    성장입력끝값은 0
    성장입력끝값이 1보다 작은 동안
      성장선택을 물어봐 무엇을 단련할까요? 생명, 공격, 방어, 기운, 속도
      만약에 성장후보들에 성장선택이 있으면
        성장입력끝값은 1
      아니면
        🟦 다섯 능력 가운데 하나를 다시 적어 주세요. 말해줘
      끝
    끝
    만약에 성장선택이 공격과 같으면
      용사공격에 3 더해
      무기를 쥔 손이 흔들리지 않습니다. 공격이 올랐습니다. 말해줘
    아니면 만약에 성장선택이 방어와 같으면
      용사방어에 2 더해
      발을 딛는 자세가 단단해졌습니다. 방어가 올랐습니다. 말해줘
    아니면 만약에 성장선택이 기운과 같으면
      최대기운에 5 더해
      용사기운은 최대기운
      평화의 불씨를 더 오래 다룰 수 있습니다. 기운이 올랐습니다. 말해줘
    아니면 만약에 성장선택이 속도와 같으면
      용사속도에 4 더해
      먼저 보고 먼저 움직이게 되었습니다. 속도가 올랐습니다. 말해줘
    아니면
      최대생명에 10 더해
      용사생명은 최대생명
      더 오래 버틸 수 있습니다. 최대 생명이 올랐습니다. 말해줘
    끝
    용사생명은 최대생명
    줄 그어
  끝


  # ── 살아 움직이는 지역 경제 ─────────────────────────────────────
  # 실제 가격은 기준값 + 전쟁 위험 + 운송 거리 - 상인 평판으로 계산합니다.
  # 현지 생산지에서는 관련 물건이 싸고, 살수록 재고가 줄며 가격이 조금 오릅니다.

  운송비는 지역번호
  운송비에 전쟁위험 더해
  상인할인은 상인평판
  만약에 상인할인이 15보다 크면 상인할인은 15
  만약에 장신구번호가 2와 같으면 상인할인에 8 더해

  회복약값은 회복약기준값
  회복약값에 운송비 더해
  회복약값에서 상인할인 빼줘
  고급회복약값은 고급회복약기준값
  고급회복약값에 운송비 더해
  고급회복약값에서 상인할인 빼줘
  기운약값은 기운약기준값
  기운약값에 운송비 더해
  기운약값에서 상인할인 빼줘
  해독제값은 해독제기준값
  해독제값에 운송비 더해
  해독제값에서 상인할인 빼줘
  폭탄값은 폭탄기준값
  폭탄값에 운송비 더해
  폭탄값에서 상인할인 빼줘
  성수값은 성수기준값
  성수값에 운송비 더해
  성수값에서 상인할인 빼줘
  연막탄값은 연막탄기준값
  연막탄값에 운송비 더해
  연막탄값에서 상인할인 빼줘
  숫돌값은 숫돌기준값
  숫돌값에 운송비 더해
  숫돌값에서 상인할인 빼줘
  야영식량값은 야영식량기준값
  야영식량값에 운송비 더해
  야영식량값에서 상인할인 빼줘

  # 숲은 약초, 광산은 광물, 자유도시는 유통이 발달해 그 물건이 더 쌉니다.
  만약에 지역번호가 2와 같으면
    회복약값에서 8 빼줘
    해독제값에서 6 빼줘
  아니면 만약에 지역번호가 3과 같으면
    폭탄값에서 12 빼줘
    숫돌값에서 8 빼줘
  아니면 만약에 지역번호가 8과 같으면
    회복약값에서 6 빼줘
    기운약값에서 6 빼줘
    야영식량값에서 6 빼줘
  아니면 만약에 지역번호가 9와 같으면
    야영식량값에 10 더해
  끝

  만약에 회복약값이 8보다 작으면 회복약값은 8
  만약에 고급회복약값이 20보다 작으면 고급회복약값은 20
  만약에 기운약값이 12보다 작으면 기운약값은 12
  만약에 해독제값이 8보다 작으면 해독제값은 8
  만약에 폭탄값이 25보다 작으면 폭탄값은 25
  만약에 성수값이 20보다 작으면 성수값은 20
  만약에 연막탄값이 12보다 작으면 연막탄값은 12
  만약에 숫돌값이 10보다 작으면 숫돌값은 10
  만약에 야영식량값이 6보다 작으면 야영식량값은 6

  시장회복재고는 3부터 6까지 무작위 숫자
  시장고급재고는 1부터 3까지 무작위 숫자
  시장기운재고는 2부터 5까지 무작위 숫자
  시장도구재고는 2부터 5까지 무작위 숫자
  시장식량재고는 3부터 7까지 무작위 숫자

  만약에 화면번호가 1과 같으면 화면 지워
  글귀판은 로웬 이동상단
  글귀판에게 작은제목그리기 해줘
  전쟁 위험 전쟁위험 · 운송비 운송비 · 상인 평판 상인평판 · 할인 상인할인 말해줘
  회복약 회복약값 · 고급회복약 고급회복약값 · 기운약 기운약값 · 해독제 해독제값 말해줘
  폭탄 폭탄값 · 성수 성수값 · 연막탄 연막탄값 · 숫돌 숫돌값 · 식량 야영식량값 말해줘
  가진 화폐 말해줘
  소지브론즈에게 화폐보이기 해줘

  상점열림은 1
  상점열림이 0보다 큰 동안
    줄 그어
    🧪 약품 · 회복약 / 고급회복약 / 기운약 / 해독제 말해줘
    ⚒ 도구 · 폭탄 / 성수 / 연막탄 / 숫돌 / 식량 말해줘
    🛡 장비 · 수리 / 무기제작 / 갑옷제작 / 장신구 말해줘
    🎲 운명 · 운명뽑기 / 운명교환 · 인장 운명인장수 · 조각 운명조각수 말해줘
    📦 기타 · 재료판매 / 떠나기 말해줘
    구매선택을 물어봐 원하는 행동 이름을 정확히 적어 주세요
    거래성공은 거짓

    만약에 구매선택이 회복약과 같으면
      만약에 시장회복재고가 0보다 크면
        만약에 소지브론즈가 회복약값보다 크거나 같으면
          소지브론즈에서 회복약값 빼줘
          회복약수에 1 더해
          시장회복재고에서 1 빼줘
          회복약값에 2 더해
          거래성공은 참
          회복약을 샀습니다. 남은 재고 시장회복재고 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        회복약 재고가 없습니다. 말해줘
      끝
    아니면 만약에 구매선택이 고급회복약과 같으면
      만약에 시장고급재고가 0보다 크면
        만약에 소지브론즈가 고급회복약값보다 크거나 같으면
          소지브론즈에서 고급회복약값 빼줘
          고급회복약수에 1 더해
          시장고급재고에서 1 빼줘
          고급회복약값에 4 더해
          거래성공은 참
          고급 회복약을 샀습니다. 남은 재고 시장고급재고 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        고급 회복약 재고가 없습니다. 말해줘
      끝
    아니면 만약에 구매선택이 기운약과 같으면
      만약에 시장기운재고가 0보다 크면
        만약에 소지브론즈가 기운약값보다 크거나 같으면
          소지브론즈에서 기운약값 빼줘
          기운약수에 1 더해
          시장기운재고에서 1 빼줘
          기운약값에 3 더해
          거래성공은 참
          기운약을 샀습니다. 남은 재고 시장기운재고 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        기운약 재고가 없습니다. 말해줘
      끝
    아니면 만약에 구매선택이 해독제와 같으면
      만약에 시장도구재고가 0보다 크면
        만약에 소지브론즈가 해독제값보다 크거나 같으면
          소지브론즈에서 해독제값 빼줘
          해독제수에 1 더해
          시장도구재고에서 1 빼줘
          거래성공은 참
          해독제를 샀습니다. 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        도구 재고가 없습니다. 말해줘
      끝
    아니면 만약에 구매선택이 폭탄과 같으면
      만약에 시장도구재고가 0보다 크면
        만약에 소지브론즈가 폭탄값보다 크거나 같으면
          소지브론즈에서 폭탄값 빼줘
          폭탄수에 1 더해
          시장도구재고에서 1 빼줘
          폭탄값에 5 더해
          거래성공은 참
          폭탄을 샀습니다. 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        도구 재고가 없습니다. 말해줘
      끝
    아니면 만약에 구매선택이 성수와 같으면
      만약에 시장도구재고가 0보다 크면
        만약에 소지브론즈가 성수값보다 크거나 같으면
          소지브론즈에서 성수값 빼줘
          성수수에 1 더해
          시장도구재고에서 1 빼줘
          거래성공은 참
          성수를 샀습니다. 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        도구 재고가 없습니다. 말해줘
      끝
    아니면 만약에 구매선택이 연막탄과 같으면
      만약에 시장도구재고가 0보다 크면
        만약에 소지브론즈가 연막탄값보다 크거나 같으면
          소지브론즈에서 연막탄값 빼줘
          연막탄수에 1 더해
          시장도구재고에서 1 빼줘
          거래성공은 참
          연막탄을 샀습니다. 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        도구 재고가 없습니다. 말해줘
      끝
    아니면 만약에 구매선택이 숫돌과 같으면
      만약에 시장도구재고가 0보다 크면
        만약에 소지브론즈가 숫돌값보다 크거나 같으면
          소지브론즈에서 숫돌값 빼줘
          숫돌수에 1 더해
          시장도구재고에서 1 빼줘
          거래성공은 참
          숫돌을 샀습니다. 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        도구 재고가 없습니다. 말해줘
      끝
    아니면 만약에 구매선택이 식량과 같으면
      만약에 시장식량재고가 0보다 크면
        만약에 소지브론즈가 야영식량값보다 크거나 같으면
          소지브론즈에서 야영식량값 빼줘
          야영식량수에 1 더해
          시장식량재고에서 1 빼줘
          야영식량값에 2 더해
          거래성공은 참
          말린 고기와 검은빵 한 묶음을 샀습니다. 말해줘
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면
        식량 재고가 없습니다. 말해줘
      끝

    아니면 만약에 구매선택이 재료판매와 같으면
      판매선택을 물어봐 약초, 철광석, 마력가루, 용비늘, 질긴천, 마력수정, 가죽, 취소
      판매값은 0
      만약에 판매선택이 약초와 같으면
        만약에 약초수가 0보다 크면
          약초수에서 1 빼줘
          판매값은 8
        끝
      아니면 만약에 판매선택이 철광석과 같으면
        만약에 철광석수가 0보다 크면
          철광석수에서 1 빼줘
          판매값은 12
        끝
      아니면 만약에 판매선택이 마력가루와 같으면
        만약에 마력가루수가 0보다 크면
          마력가루수에서 1 빼줘
          판매값은 17
        끝
      아니면 만약에 판매선택이 용비늘과 같으면
        만약에 용비늘수가 0보다 크면
          용비늘수에서 1 빼줘
          판매값은 45
        끝
      아니면 만약에 판매선택이 질긴천과 같으면
        만약에 질긴천수가 0보다 크면
          질긴천수에서 1 빼줘
          판매값은 10
        끝
      아니면 만약에 판매선택이 마력수정과 같으면
        만약에 마력수정수가 0보다 크면
          마력수정수에서 1 빼줘
          판매값은 30
        끝
      아니면 만약에 판매선택이 가죽과 같으면
        만약에 가죽수가 0보다 크면
          가죽수에서 1 빼줘
          판매값은 14
        끝
      끝
      만약에 판매값이 0보다 크면
        # 문장문법의 일반 나눗셈은 소수를 만들 수 있습니다.
        # 세이브 코드가 정수만 다루므로 반복 뺄셈으로 정수 몫을 구합니다.
        남은위험값은 전쟁위험
        위험수당은 0
        남은위험값이 2보다 큰 동안
          남은위험값에서 3 빼줘
          위험수당에 1 더해
        끝
        판매값에 위험수당 더해
        소지브론즈에 판매값 더해
        거래성공은 참
        전쟁 중 필요한 재료라 판매값 브론즈를 받았습니다. 말해줘
      아니면
        팔 재료가 없거나 거래를 취소했습니다. 말해줘
      끝

    아니면 만약에 구매선택이 수리와 같으면
      무기손상은 무기최대내구
      무기손상에서 무기내구 빼줘
      갑옷손상은 갑옷최대내구
      갑옷손상에서 갑옷내구 빼줘
      수리값은 무기손상
      수리값에 갑옷손상 더해
      수리값에 수리기준값 더해
      수리값에서 상인할인 빼줘
      만약에 직업이름이 룬대장장이와 같으면 수리값에서 15 빼줘
      만약에 수리값이 5보다 작으면 수리값은 5
      수리값 브론즈를 내면 두 장비를 완전히 수리합니다 말해줘
      만약에 소지브론즈가 수리값보다 크거나 같으면
        소지브론즈에서 수리값 빼줘
        무기내구는 무기최대내구
        갑옷내구는 갑옷최대내구
        수리횟수에 1 더해
        거래성공은 참
        로웬의 수리공이 금이 간 부분을 모두 손봤습니다. 말해줘
        만약에 첫수리업적이 없으면
          첫수리업적은 참
          업적목록에 다시벼린검 넣어
          업적 달성 · 다시벼린검 말해줘
        끝
      아니면
        돈이 모자랍니다. 말해줘
      끝

    아니면 만약에 구매선택이 무기제작과 같으면
      무기강화값은 120
      무기단계값은 무기번호
      무기단계값에 45 곱해
      무기강화값에 무기단계값 더해
      무기강화값에서 상인할인 빼줘
      다음 무기 제작비 무기강화값 브론즈 말해줘
      만약에 무기번호가 7보다 크면
        이미 최고의 무기를 가지고 있습니다. 말해줘
      아니면 만약에 소지브론즈가 무기강화값보다 크거나 같으면
        소지브론즈에서 무기강화값 빼줘
        무기번호에 1 더해
        용사공격에 2 더해
        무기최대내구에 10 더해
        무기내구는 무기최대내구
        거래성공은 참
        만약에 무기번호가 2와 같으면
          무기이름은 순찰자의 장궁
        아니면 만약에 무기번호가 3과 같으면
          무기이름은 드워프 룬망치
        아니면 만약에 무기번호가 4와 같으면
          무기이름은 백은 지팡이
        아니면 만약에 무기번호가 5와 같으면
          무기이름은 그림자 단검
        아니면 만약에 무기번호가 6과 같으면
          무기이름은 용뼈 장창
        아니면 만약에 무기번호가 7과 같으면
          무기이름은 시간의 초침
        아니면
          무기이름은 평화의 성검
        끝
        새 무기 무기이름을 완성했습니다. 공격과 최대 내구가 올랐습니다. 말해줘
      아니면
        돈이 모자랍니다. 말해줘
      끝

    아니면 만약에 구매선택이 갑옷제작과 같으면
      갑옷강화값은 130
      갑옷단계값은 갑옷번호
      갑옷단계값에 55 곱해
      갑옷강화값에 갑옷단계값 더해
      갑옷강화값에서 상인할인 빼줘
      다음 갑옷 제작비 갑옷강화값 브론즈 말해줘
      만약에 갑옷번호가 5보다 크면
        이미 최고의 갑옷을 가지고 있습니다. 말해줘
      아니면 만약에 소지브론즈가 갑옷강화값보다 크거나 같으면
        소지브론즈에서 갑옷강화값 빼줘
        갑옷번호에 1 더해
        용사방어에 2 더해
        갑옷최대내구에 12 더해
        갑옷내구는 갑옷최대내구
        거래성공은 참
        만약에 갑옷번호가 2와 같으면
          갑옷이름은 엘프 순찰복
        아니면 만약에 갑옷번호가 3과 같으면
          갑옷이름은 드워프 판금갑옷
        아니면 만약에 갑옷번호가 4와 같으면
          갑옷이름은 성광 예복
        아니면 만약에 갑옷번호가 5와 같으면
          갑옷이름은 용비늘 갑옷
        아니면
          갑옷이름은 왕가의 수호갑옷
        끝
        새 갑옷 갑옷이름을 완성했습니다. 방어와 최대 내구가 올랐습니다. 말해줘
      아니면
        돈이 모자랍니다. 말해줘
      끝

    아니면 만약에 구매선택이 장신구와 같으면
      매의눈 180 브론즈 · 은저울 220 브론즈 · 성녀묵주 260 브론즈 말해줘
      장신구선택을 물어봐 매의눈, 은저울, 성녀묵주, 취소
      만약에 장신구선택이 매의눈과 같으면
        만약에 소지브론즈가 180보다 크거나 같으면
          소지브론즈에서 180 빼줘
          장신구번호는 1
          장신구이름은 매의 눈
          거래성공은 참
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면 만약에 장신구선택이 은저울과 같으면
        만약에 소지브론즈가 220보다 크거나 같으면
          소지브론즈에서 220 빼줘
          장신구번호는 2
          장신구이름은 상인의 은저울
          거래성공은 참
        아니면
          돈이 모자랍니다. 말해줘
        끝
      아니면 만약에 장신구선택이 성녀묵주와 같으면
        만약에 소지브론즈가 260보다 크거나 같으면
          소지브론즈에서 260 빼줘
          장신구번호는 3
          장신구이름은 성녀의 묵주
          거래성공은 참
        아니면
          돈이 모자랍니다. 말해줘
        끝
      끝
      만약에 거래성공이 있으면 장신구이름을 착용했습니다 말해줘

    아니면 만약에 구매선택이 운명뽑기와 같으면
      줄 그어
      🎲 운명 인장 전용 뽑기 · 브론즈와 현금은 받지 않습니다 말해줘
      일반 50 퍼센트 · 고급 32 퍼센트 · 희귀 15 퍼센트 · 전설 3 퍼센트 말해줘
      희귀 이상이 다섯 번 나오지 않으면 여섯 번째에 희귀 이상이 보장됩니다. 말해줘
      현재 인장 운명인장수 · 희귀 천장 누적 운명천장누적 / 5 말해줘
      만약에 운명인장수가 0보다 크면
        운명인장수에서 1 빼줘
        운명뽑기횟수에 1 더해
        만약에 첫뽑기완료가 없으면
          첫뽑기완료는 참
          행운동전수에 1 더해
          운명조각수에 2 더해
          상자로 말해줘 🟨 첫 뽑기 고정 보상 · 행운 동전 1개 · 운명 조각 2개
        아니면
          만약에 운명천장누적이 4보다 크면
            운명뽑기눈은 83부터 100까지 무작위 숫자
            🟨 천장 발동 · 이번 결과는 희귀 이상입니다. 말해줘
          아니면
            운명뽑기눈은 1부터 100까지 무작위 숫자
          끝
          만약에 운명뽑기눈이 50보다 작거나 같으면
            야영식량수에 1 더해
            운명조각수에 1 더해
            운명천장누적에 1 더해
            🟦 일반 · 왕국 여행 식량 1개 · 조각 1개 말해줘
          아니면 만약에 운명뽑기눈이 82보다 작거나 같으면
            고급보상눈은 1부터 2까지 무작위 숫자
            만약에 고급보상눈이 1과 같으면
              회복약수에 1 더해
              🟩 고급 · 회복약 1개 · 조각 2개 말해줘
            아니면
              기운약수에 1 더해
              🟩 고급 · 기운약 1개 · 조각 2개 말해줘
            끝
            운명조각수에 2 더해
            운명천장누적에 1 더해
          아니면 만약에 운명뽑기눈이 97보다 작거나 같으면
            행운동전수에 1 더해
            혼돈주사위수에 1 더해
            운명조각수에 4 더해
            운명천장누적은 0
            상자로 말해줘 🟨 희귀 · 행운 동전 1개 · 혼돈 주사위 1개 · 조각 4개
          아니면
            행운동전수에 2 더해
            혼돈주사위수에 2 더해
            고급회복약수에 1 더해
            운명조각수에 8 더해
            운명천장누적은 0
            상자로 말해줘 🟨 전설 · 확률 도구 묶음 · 고급 회복약 · 조각 8개
          끝
        끝
      아니면
        운명 인장이 없습니다. 각 지역 우두머리를 쓰러뜨린 뒤 한 개를 확정으로 얻습니다. 말해줘
      끝

    아니면 만약에 구매선택이 운명교환과 같으면
      운명교환선택을 물어봐 조각 6개로 무엇을 받을까요? 행운동전, 혼돈주사위, 취소
      만약에 운명교환선택이 취소와 같으면
        교환을 취소했습니다. 말해줘
      아니면 만약에 운명조각수가 5보다 크면
        만약에 운명교환선택이 행운동전과 같으면
          운명조각수에서 6 빼줘
          행운동전수에 1 더해
          🟨 운명 조각 6개를 행운 동전으로 바꿨습니다. 말해줘
        아니면 만약에 운명교환선택이 혼돈주사위와 같으면
          운명조각수에서 6 빼줘
          혼돈주사위수에 1 더해
          🟨 운명 조각 6개를 혼돈 주사위로 바꿨습니다. 말해줘
        아니면
          🟦 교환할 물건 이름을 다시 확인해 주세요. 말해줘
        끝
      아니면
        운명 조각이 6개보다 적습니다. 말해줘
      끝

    아니면 만약에 구매선택이 떠나기와 같으면
      상점열림은 0
      로웬이 장부를 덮고 다음 길목으로 떠납니다. 말해줘
    아니면
      🟦 그런 상점 행동은 없습니다. 메뉴를 다시 보여 드립니다. 말해줘
    끝

    만약에 거래성공이 있으면
      거래횟수에 1 더해
      상인평판에 1 더해
      만약에 첫거래업적이 없으면
        첫거래업적은 참
        업적목록에 첫거래 넣어
        업적 달성 · 첫거래 말해줘
      끝
      남은 화폐 말해줘
      소지브론즈에게 화폐보이기 해줘
    끝
  끝


  # ── 다음 길로 이동하며 흐르는 시간 ──────────────────────────────

  지역번호에 1 더해
  최고지역은 지역번호
  모험일에 1 더해
  피로에 12 더해
  포만에서 15 빼줘
  전쟁위험에서 1 빼줘
  만약에 전쟁위험이 0보다 작으면 전쟁위험은 0
  만약에 포만이 0보다 작으면 포만은 0
  만약에 포만이 0과 같으면
    용사생명에서 5 빼줘
    사기에서 5 빼줘
    굶주림으로 생명과 전의가 떨어졌습니다. 말해줘
    만약에 사기가 0보다 작으면 사기는 0
  끝


  # ── 길 사이의 야영과 열 가지 제작법 ─────────────────────────────

  만약에 화면번호가 1과 같으면 화면 지워
  글귀판은 모닥불 야영
  글귀판에게 작은제목그리기 해줘
  모험일 일째 · 다음 지역 지역번호 · 포만 포만 · 피로 피로 · 사기 사기 말해줘
  🟩 회복 · 쉬기 / 식사 말해줘
  ⚒ 성장 · 수련 / 제작 / 장비관리 말해줘
  📜 안전 · 기록보기 / 저장 말해줘
  야영후보들은 목록 쉬기, 식사, 수련, 제작, 장비관리, 기록보기, 저장
  야영입력끝값은 0
  야영입력끝값이 1보다 작은 동안
    야영선택을 물어봐 원하는 야영 행동 이름을 정확히 적어 주세요
    만약에 야영후보들에 야영선택이 있으면
      야영입력끝값은 1
    아니면
      🟦 목록에 없는 행동입니다. 턴을 쓰지 않고 다시 묻습니다. 말해줘
    끝
  끝

  만약에 야영선택이 제작과 같으면
    약초 약초수 · 철광석 철광석수 · 마력가루 마력가루수 · 용비늘 용비늘수 말해줘
    질긴천 질긴천수 · 마력수정 마력수정수 · 가죽 가죽수 말해줘
    제작선택을 물어봐 회복약, 고급회복약, 기운약, 해독제, 폭탄, 성수, 연막탄, 숫돌, 룬각인, 야영식량, 취소
    제작성공은 거짓

    만약에 제작선택이 회복약과 같으면
      만약에 약초수가 1보다 크면
        약초수에서 2 빼줘
        회복약수에 1 더해
        제작성공은 참
      끝
    아니면 만약에 제작선택이 고급회복약과 같으면
      만약에 약초수가 2보다 크면
        만약에 마력수정수가 0보다 크면
          약초수에서 3 빼줘
          마력수정수에서 1 빼줘
          고급회복약수에 1 더해
          제작성공은 참
        끝
      끝
    아니면 만약에 제작선택이 기운약과 같으면
      만약에 약초수가 0보다 크면
        만약에 마력가루수가 0보다 크면
          약초수에서 1 빼줘
          마력가루수에서 1 빼줘
          기운약수에 1 더해
          제작성공은 참
        끝
      끝
    아니면 만약에 제작선택이 해독제와 같으면
      만약에 약초수가 1보다 크면
        약초수에서 2 빼줘
        해독제수에 2 더해
        제작성공은 참
      끝
    아니면 만약에 제작선택이 폭탄과 같으면
      만약에 철광석수가 1보다 크면
        만약에 마력가루수가 0보다 크면
          철광석수에서 2 빼줘
          마력가루수에서 1 빼줘
          폭탄수에 1 더해
          제작성공은 참
        끝
      끝
    아니면 만약에 제작선택이 성수와 같으면
      만약에 약초수가 0보다 크면
        만약에 마력수정수가 0보다 크면
          약초수에서 1 빼줘
          마력수정수에서 1 빼줘
          성수수에 1 더해
          제작성공은 참
        끝
      끝
    아니면 만약에 제작선택이 연막탄과 같으면
      만약에 마력가루수가 0보다 크면
        만약에 질긴천수가 0보다 크면
          마력가루수에서 1 빼줘
          질긴천수에서 1 빼줘
          연막탄수에 2 더해
          제작성공은 참
        끝
      끝
    아니면 만약에 제작선택이 숫돌과 같으면
      만약에 철광석수가 0보다 크면
        철광석수에서 1 빼줘
        숫돌수에 2 더해
        제작성공은 참
      끝
    아니면 만약에 제작선택이 룬각인과 같으면
      만약에 철광석수가 1보다 크면
        만약에 마력가루수가 1보다 크면
          철광석수에서 2 빼줘
          마력가루수에서 2 빼줘
          용사공격에 1 더해
          용사방어에 1 더해
          최대생명에 4 더해
          용사생명에 4 더해
          룬각인수에 1 더해
          제작성공은 참
        끝
      끝
    아니면 만약에 제작선택이 야영식량과 같으면
      만약에 가죽수가 0보다 크면
        만약에 약초수가 0보다 크면
          가죽수에서 1 빼줘
          약초수에서 1 빼줘
          야영식량수에 2 더해
          제작성공은 참
        끝
      끝
    끝

    만약에 제작성공이 있으면
      제작횟수에 1 더해
      제작선택 제작에 성공했습니다 말해줘
      만약에 첫제작업적이 없으면
        첫제작업적은 참
        업적목록에 첫제작 넣어
        업적 달성 · 첫제작 말해줘
      끝
    아니면
      재료가 모자라거나 제작을 취소했습니다. 말해줘
    끝

  아니면 만약에 야영선택이 식사와 같으면
    만약에 야영식량수가 0보다 크면
      야영식량수에서 1 빼줘
      포만에 40 더해
      피로에서 8 빼줘
      사기에 6 더해
      만약에 포만이 100보다 크면 포만은 100
      만약에 피로가 0보다 작으면 피로는 0
      만약에 사기가 100보다 크면 사기는 100
      동료들과 따뜻한 식사를 나누어 배부름과 전의가 올랐습니다. 말해줘
    아니면
      먹을 식량이 없습니다. 말해줘
    끝
  아니면 만약에 야영선택이 수련과 같으면
    수련후보들은 목록 공격, 방어, 생명, 기운, 속도
    수련입력끝값은 0
    수련입력끝값이 1보다 작은 동안
      수련선택을 물어봐 공격, 방어, 생명, 기운, 속도 가운데 하나를 골라 주세요
      만약에 수련후보들에 수련선택이 있으면
        수련입력끝값은 1
      아니면
        🟦 다섯 능력 가운데 하나를 다시 적어 주세요. 말해줘
      끝
    끝
    피로에 8 더해
    만약에 수련선택이 공격과 같으면
      용사공격에 1 더해
    아니면 만약에 수련선택이 방어와 같으면
      용사방어에 1 더해
    아니면 만약에 수련선택이 기운과 같으면
      최대기운에 2 더해
    아니면 만약에 수련선택이 속도와 같으면
      용사속도에 2 더해
    아니면
      최대생명에 4 더해
    끝
    힘든 수련을 마쳐 능력이 올랐지만 지침도 쌓였습니다. 말해줘
  아니면 만약에 야영선택이 장비관리와 같으면
    만약에 철광석수가 0보다 크면
      철광석수에서 1 빼줘
      무기내구는 무기최대내구
      갑옷내구는 갑옷최대내구
      수리횟수에 1 더해
      철광석 하나로 무기와 갑옷을 야전 수리했습니다. 말해줘
    아니면
      수리에 쓸 철광석이 없습니다. 말해줘
    끝
  아니면 만약에 야영선택이 기록보기와 같으면
    희망 희망점수 · 불씨 평화불씨 · 명성 명성 말해줘
    왕실 왕실평판 · 엘프 엘프평판 · 드워프 드워프평판 · 교단 교단평판 · 길드 길드평판 · 상인 상인평판 말해줘
    전쟁 위험 전쟁위험 · 거래 거래횟수 · 제작 제작횟수 · 수리 수리횟수 말해줘
    동료목록을 쉼표로 이어 말해줘
    🎲 운명 인장 운명인장수 · 조각 운명조각수 · 뽑기 운명뽑기횟수 · 도박 승 도박승리수 / 패 도박패배수 말해줘
  아니면 만약에 야영선택이 저장과 같으면
    저장횟수에 1 더해
    저장칸들은 빈 목록
    저장칸들에 평화사 넣어
    저장칸들에 용사이름 넣어
    저장숫자들은 목록 직업번호, 난도번호, 지역번호, 최고지역, 최대생명, 용사생명, 용사공격, 용사방어, 최대기운, 용사기운, 용사속도, 용사단계, 용사경험, 다음경험, 소지브론즈, 회복약수, 고급회복약수, 기운약수, 해독제수, 폭탄수, 성수수, 연막탄수, 숫돌수, 야영식량수, 약초수, 철광석수, 마력가루수, 용비늘수, 질긴천수, 마력수정수, 가죽수, 평화불씨, 희망점수, 궁극기충전, 제작횟수, 균형파괴수, 약점공격수, 전체턴수, 무기번호, 무기내구, 무기최대내구, 갑옷번호, 갑옷내구, 갑옷최대내구, 장신구번호, 전쟁위험, 상인평판, 왕실평판, 엘프평판, 드워프평판, 교단평판, 길드평판, 모험일, 포만, 피로, 사기, 수호룬보유여부, 수호룬사용여부, 세린을도움, 마왕약화, 깃발보호, 리아넬동료, 브룸동료, 세린동료, 아델라동료, 카일동료, 아우렐동료, 이사벨동료, 다리온동료, 네리아동료, 루시안동료, 숲퀘상태, 결계퀘상태, 깃발퀘상태, 시장퀘상태, 난민퀘상태, 봉인퀘상태, 룬각인수, 거래횟수, 수리횟수, 명성, 저장횟수, 마왕처치, 숨은보스승리, 연출번호, 화면번호, 행운동전수, 혼돈주사위수, 운명인장수, 운명뽑기횟수, 운명천장누적, 운명조각수, 첫뽑기완료, 도박승리수, 도박패배수
    저장숫자들의 저장숫자마다 반복해
      저장숫자에게 코드칸넣기 해줘
    끝
    저장합계는 0
    저장순번값은 0
    저장숫자들의 검사할숫자마다 반복해
      저장순번값에 1 더해
      저장항은 검사할숫자
      저장항에 저장순번값 곱해
      저장합계에 저장항 더해
    끝
    저장검사값은 저장합계를 997로 나눈 나머지
    저장검사값에게 코드칸넣기 해줘
    줄 그어
    아래 한 줄 전체가 세이브 코드입니다. 다른 곳에 복사해 두세요. 말해줘
    저장칸들을 쉼표로 이어 말해줘
    다음 실행의 첫 화면에서 불러오기를 고르고 이 한 줄을 붙여넣으세요. 말해줘
    줄 그어
    # 저장은 안전 기능이므로 야영 행동을 벌주지 않습니다. 저장 뒤 기본 휴식도 함께 적용합니다.
    용사생명에 24 더해
    용사기운은 최대기운
    용사독은 0
    피로에서 25 빼줘
    만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
    만약에 피로가 0보다 작으면 피로는 0
    🟩 저장하는 동안 동료들이 경계를 맡아 기본 휴식도 마쳤습니다. 말해줘
  아니면
    용사생명에 24 더해
    용사기운은 최대기운
    용사독은 0
    피로에서 25 빼줘
    사기에 3 더해
    만약에 용사생명이 최대생명보다 크면 용사생명은 최대생명
    만약에 피로가 0보다 작으면 피로는 0
    만약에 사기가 100보다 크면 사기는 100
    만약에 장신구번호가 3과 같으면
      용사생명에 8 더해
      만약에 용사생명이 최대생명보다 크면
        용사생명은 최대생명
      끝
    끝
    경계를 나누어 맡고 깊이 쉬었습니다. 말해줘
  끝

  짧은기다림 기다려

끝


# ════════════════════════════════════════════════════════════════════
# 마지막 장면
# ════════════════════════════════════════════════════════════════════

화면 지워
줄 그어

평화도달은 거짓
만약에 끝맺음이 평화와 같으면
  평화도달은 참
끝
만약에 끝맺음이 완전한평화와 같으면
  평화도달은 참
끝
만약에 끝맺음이 희생과 같으면
  평화도달은 참
끝

만약에 평화도달이 있으면
  상자로 말해줘 🟩 평화
  줄 그어
  만약에 연출번호가 2와 같으면
    천천히 말해줘 마왕은 쓰러졌습니다. 아르테리아에 아침이 돌아옵니다.
  아니면 만약에 연출번호가 3과 같으면
    아주 천천히 말해줘 마침내, 평화가 돌아왔습니다.
  아니면
    마왕은 쓰러졌습니다. 아르테리아에 아침이 돌아옵니다. 말해줘
  끝
  이야기:

    용사이름이 무기이름을 들어 모르가르의 심장을 꿰뚫었습니다.
    마왕은 죽었고 마계의 문은 붉은 불꽃과 함께 무너졌습니다.
    왕도에서는 엘레노아가 승리의 종을 울리고 모든 성벽에 왕국의 깃발을 올렸습니다.
    몬스터 군단은 북쪽 산맥으로 달아났고 아르테리아에는 다시 평화로운 아침이 찾아왔습니다.

  끝

  만약에 희망점수가 7보다 크거나 같으면
    이야기:

      수도 중앙에는 승리한 용사의 동상이 세워지고 일주일 동안 축제가 열렸습니다.
      엘프 리아넬은 숲을 되찾고, 드워프 브룸은 무너진 광산을 다시 열었습니다.
      세린은 왕국의 대마법사가 되었고, 아델라와 카일은 전쟁 고아들을 위한 길드를 세웠습니다.
      금룡 아우렐은 새 국왕의 대관식 위를 날았고 세 종족의 동맹은 어느 때보다 굳건해졌습니다.

    끝
    가운데 말해줘 가장 따뜻한 평화
  아니면 만약에 희망점수가 4보다 크거나 같으면
    이야기:

      상처는 하루 만에 낫지 않았지만 길마다 다시 이름이 붙었습니다.
      사람들은 용사이름이 지나간 선택을 이야기하며 작은 약속부터 지켰습니다.
      완전하지 않아도 내일을 고를 수 있는 세상, 그것으로 충분한 평화가 시작되었습니다.

    끝
    가운데 말해줘 다시 시작된 평화
  아니면
    이야기:

      전쟁은 끝났고 사람들은 문을 열었습니다.
      다만 아직 서로를 믿는 법은 천천히 배워야 합니다.
      용사이름은 무기를 내려놓고 이제 싸움보다 어려운 일을 시작했습니다.

    끝
    가운데 말해줘 배워 가는 평화
  끝

  만약에 끝맺음이 완전한평화와 같으면
    줄 그어
    이야기:

      심연룡 녹스가 쓰러지자 세계의 균열은 여신의 성화 속에서 완전히 닫혔습니다.
      동료들은 왕국으로 돌아와 누구에게도 기록되지 않았던 마지막 전투를 서로의 기억에 남겼습니다.
      이제 아르테리아의 평화는 마왕의 잔재조차 없는 완전한 새 시대가 되었습니다.

    끝
    상자로 말해줘 🟨 숨겨진 결말 · 완전한 평화
  아니면 만약에 끝맺음이 희생과 같으면
    줄 그어
    이야기:

      세계의 균열은 닫혔지만 용사이름은 동료들과 함께 돌아오지 못했습니다.
      왕국의 모든 길드에는 빈 의자 하나가 놓였고 왕녀는 해마다 그 앞에 첫 번째 성화를 밝혔습니다.
      그 희생 덕분에 다음 세대는 마왕도 심연도 모르는 평범한 삶을 살았습니다.

    끝
    상자로 말해줘 🟨 숨겨진 결말 · 마지막 수호자
  끝

아니면
  상자로 말해줘 🟥 아직 끝나지 않은 길
  줄 그어
  이야기:

    평화의 불씨가 땅에 떨어졌지만 꺼지지는 않았습니다.
    왕녀 엘레노아는 왕성의 횃불을 밝히고 다음 모험가를 기다립니다.
    누군가 이 길을 다시 걸으면 오늘의 실패도 그 사람을 지키는 이야기가 될 것입니다.

  끝
끝


# ── 마지막 기록 ────────────────────────────────────────────────────

줄 그어
용사이름 · 직업이름 · 용사단계 단계 말해줘
무기 무기이름 · 갑옷 갑옷이름 · 장신구 장신구이름 말해줘
가장 멀리 최고지역 번째 길 · 주고받은 전체턴수 차례 말해줘
남은 화폐 말해줘
소지브론즈에게 화폐보이기 해줘
평화의 불씨 평화불씨 · 희망 희망점수 · 명성 명성 말해줘
걸린시간은 잰시간
플레이 시간 걸린시간 초 · 균형 파괴 균형파괴수 · 약점 공격 약점공격수 · 제작 제작횟수 · 저장 저장횟수 말해줘
생존 기록 · 모험일 모험일 · 포만 포만 · 피로 피로 · 사기 사기 말해줘
경제 기록 · 전쟁 위험 전쟁위험 · 거래 거래횟수 · 수리 수리횟수 · 상인 평판 상인평판 말해줘
운명 기록 · 인장 운명인장수 · 조각 운명조각수 · 뽑기 운명뽑기횟수 · 도박 승 도박승리수 / 패 도박패배수 말해줘
내구도 · 무기 무기내구 / 무기최대내구 · 갑옷 갑옷내구 / 갑옷최대내구 말해줘
남은 재료 · 약초 약초수 · 철광석 철광석수 · 마력가루 마력가루수 · 용비늘 용비늘수 · 질긴천 질긴천수 · 마력수정 마력수정수 · 가죽 가죽수 말해줘
줄 그어
함께한 동료 말해줘
만약에 동료목록이 비었으면
  아무도 모집하지 못했습니다. 말해줘
아니면
  동료목록을 쉼표로 이어 말해줘
끝
줄 그어
발견한 지역 말해줘
발견지역을 쉼표로 이어 말해줘
줄 그어
쓰러뜨린 적의 기록 말해줘
쓰러뜨린적의 기록이름마다 반복해
  기록수는 쓰러뜨린적의 기록이름
  기록이름 · 기록수 번 말해줘
끝
줄 그어
퀘스트 일지 말해줘
퀘스트표의 퀘스트이름마다 반복해
  퀘스트상태는 퀘스트표의 퀘스트이름
  퀘스트이름 · 퀘스트상태 말해줘
끝
줄 그어
달성한 업적 말해줘
만약에 업적목록이 비었으면
  아직 달성한 업적이 없습니다. 말해줘
아니면
  업적목록의 업적이름마다 반복해
    업적이름 말해줘
  끝
끝
줄 그어
가운데 말해줘 끝까지 걸어 주셔서 고맙습니다
줄 그어`,
    },
  ],
};
