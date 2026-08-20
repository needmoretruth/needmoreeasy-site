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
 * entry belongs to one of six groups, and the page shows one group at a time.
 * The order here is the order they are offered in. */
export type ExampleGroup = 'start' | 'choose' | 'data' | 'game' | 'levels' | 'big';

export const GROUPS: readonly ExampleGroup[] = ['start', 'choose', 'data', 'game', 'levels', 'big'];

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
    data: 'Lists and tables',
    game: 'Games',
    levels: 'Three levels, two languages',
    big: 'Bigger programs',
  },
  ko: {
    start: '처음 해 보기',
    choose: '골라 하고 되풀이하기',
    data: '목록과 표',
    game: '게임',
    levels: '세 가지 문법, 두 나라 말',
    big: '큰 프로그램',
  },
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
      label: 'A list, one by one',
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
      label: 'Build a list',
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
      label: 'A list, made and used',
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
      group: 'data',
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
      group: 'data',
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
      label: 'Two conditions',
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
      label: 'Repeat while',
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
      label: 'Skip a round',
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
      group: 'choose',
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
      label: 'Chance',
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
      group: 'data',
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
      label: 'All six at once',
      group: 'levels',
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
      label: 'Three levels at once',
      group: 'levels',
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
      group: 'levels',
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
      label: 'It reads your mistakes',
      group: 'start',
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
      group: 'start',
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
      group: 'levels',
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
      group: 'game',
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
      group: 'game',
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
      label: '목록 하나씩',
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
      label: '목록 만들기',
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
      label: '목록 다루기',
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
      group: 'data',
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
      group: 'data',
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
      label: '두 조건',
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
      label: '조건 반복',
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
      label: '건너뛰기',
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
      group: 'choose',
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
      label: '확률',
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
      group: 'data',
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
      label: '여섯 가지 한 파일에',
      group: 'levels',
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
      label: '세 문법 한 번에',
      group: 'levels',
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
      group: 'levels',
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
      label: '실수를 알아서 읽습니다',
      group: 'start',
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
      label: '오류는 이렇게 보입니다',
      group: 'start',
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
      group: 'levels',
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
      group: 'game',
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
      group: 'game',
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
  ],
};
