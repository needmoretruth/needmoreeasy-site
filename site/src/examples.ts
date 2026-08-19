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

/* The shape every entry has. `fails` is present only on the two examples that
 * are meant not to compile, which is why it is optional. */
export interface Example {
  readonly id: string;
  readonly label: string;
  readonly answers: readonly string[];
  readonly expect: string;
  readonly source: string;
  readonly fails?: true;
}

export type ExampleLanguage = 'en' | 'ko';

export const EXAMPLES: Readonly<Record<ExampleLanguage, readonly Example[]>> = {
  en: [
    {
      id: 'hello',
      label: 'Hello',
      answers: [],
      expect: 'Hello, world!',
      source: `# Sentence syntax: write what you mean.
show Hello, world!
repeat 3 times and show NME is easy`,
    },
    {
      id: 'storyblock',
      label: 'A story in one block',
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
      id: 'job',
      label: 'A job with a name',
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
      answers: [],
      expect: 'three',
      source: `# The same idea written three ways, in one file.
set word to three
show word

say word

print(word)`,
    },
  ],

  ko: [
    {
      id: 'hello',
      label: '인사',
      answers: [],
      expect: '안녕하세요!',
      source: `# 문장형: 하고 싶은 말을 그대로 씁니다.
안녕하세요! 말해줘
3번 반복해서 NME는 쉽습니다 말해줘`,
    },
    {
      id: 'storyblock',
      label: '이야기 묶음',
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
      id: 'job',
      label: '이름 붙인 일',
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
      answers: [],
      expect: '셋',
      source: `# 같은 뜻을 세 가지로 적어, 한 파일에 나란히 둡니다.
낱말은 셋
낱말 말해줘

말해 낱말

print(낱말)`,
    },
  ],
};
