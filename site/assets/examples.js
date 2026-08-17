/* Example programs for the playground.
 *
 * Every one of these is compiled by the real NME compiler on this page and was
 * checked to actually run in the browser engine before being listed here. They
 * are adapted from the `examples/` folder of the language repository.
 *
 * `en` and `ko` hold the two example sets; the page picks one by its language.
 * `interactive: true` means the program calls input(), so the terminal will
 * stop and ask — that is expected, not a hang.
 */

export const EXAMPLES = {
  en: [
    {
      id: 'hello',
      label: 'Hello',
      interactive: false,
      source: `# Sentence syntax: write what you mean.
show Hello, world!
repeat 3 times and show NME is easy`,
    },
    {
      id: 'ask',
      label: 'Ask a name',
      interactive: true,
      source: `# A question is just a question. The answer becomes a variable.
What is your name?
Hello name!
3 times Welcome to NME`,
    },
    {
      id: 'guess',
      label: 'Guessing game',
      interactive: true,
      source: `# No quotes, commas, equals signs or colons anywhere.
set answer to random number from 1 to 10
ask number guess Pick a number from 1 to 10

if guess equals answer
    show Correct!

if guess is less than answer
    show Go higher

if guess is greater than answer
    show Go lower`,
    },
    {
      id: 'levels',
      label: 'Three levels at once',
      interactive: false,
      source: `# Advanced Python, beginner NME and sentence NME in one file.
people = ["Ada", "Grace"]                 # advanced Python

2 times:                                  # beginner
    say "beginner syntax"

repeat 2 times                            # sentence
    show sentence syntax

for person in people:                     # advanced Python
    show Hello person!                    # sentence`,
    },
    {
      id: 'mix',
      label: 'English + Korean',
      interactive: false,
      source: `# The two languages may share a line. No mode switch exists.
랜덤 사용

name = "friend"
pick = 랜덤선택(["a cat", "a dog"])

if name:
    2번: say f"{pick} for {name}!"`,
    },
    {
      id: 'coin',
      label: 'A tiny blockchain',
      interactive: false,
      source: `# Real SHA-256 proof of work, written as sentences.
import hashlib

set difficulty to 2
set previous to genesis
set nonce to 0

while True
    set text to previous + str(nonce)
    set digest to hashlib.sha256(text.encode()).hexdigest()
    if digest.startswith("0" * difficulty)
        show Block mined
        show digest
        break
    add 1 to nonce

show Attempts:
show nonce`,
    },
  ],

  ko: [
    {
      id: 'hello',
      label: '첫 프로그램',
      interactive: false,
      source: `# 문장형 문법: 하고 싶은 말을 그대로 적으세요.
안녕하세요! 말해줘
3번 반복해서 NME는 쉬워요 말해줘`,
    },
    {
      id: 'ask',
      label: '이름 묻기',
      interactive: true,
      source: `# 질문은 그냥 질문입니다. 답이 그대로 변수가 됩니다.
이름이 뭐예요?
안녕하세요 이름!
3번 환영합니다`,
    },
    {
      id: 'guess',
      label: '숫자 맞히기',
      interactive: true,
      source: `# 따옴표, 괄호, 쉼표, 등호, 콜론이 하나도 없습니다.
정답은 1부터 10까지 랜덤정수
추측을 숫자로 물어봐 1부터 10까지 숫자를 맞혀 보세요

만약에 추측이 정답과 같으면
    정답입니다! 말해줘

만약에 추측이 정답보다 작으면
    더 큰 수예요 말해줘

만약에 추측이 정답보다 크면
    더 작은 수예요 말해줘`,
    },
    {
      id: 'levels',
      label: '세 문법 한 파일',
      interactive: false,
      source: `# 고급 Python, 초급 NME, 문장형 NME가 한 파일에 있습니다.
people = ["에이다", "그레이스"]        # 고급 Python

2번:                                   # 초급
    말해 "초급 문법"

반복 2번                               # 문장형
    문장형 문법 말해줘

for person in people:                  # 고급 Python
    안녕하세요 person! 말해줘          # 문장형`,
    },
    {
      id: 'mix',
      label: '한국어 + 영어',
      interactive: false,
      source: `# 두 언어가 한 줄에 같이 있어도 됩니다. 전환 선언이 없습니다.
랜덤 사용

이름 = "친구"
추천 = 랜덤선택(["고양이", "강아지"])

만약 이름:
    2번: say f"{이름}에게 {추천} 추천!"`,
    },
    {
      id: 'zk',
      label: '영지식 증명',
      interactive: false,
      source: `# 3072비트 유한체 슈노어 영지식 증명. 전부 한국어 문장형입니다.
영지식 사용 최신

비밀값은 영지식 비밀 만들기
공개값은 비밀값으로 영지식 공개값 만들기
일회값은 영지식 일회값 만들기
약속값은 일회값으로 영지식 약속 만들기
도전값은 영지식 도전 만들기
응답값은 일회값과 비밀값과 도전값으로 영지식 응답 만들기
검증값은 공개값과 약속값과 도전값과 응답값으로 영지식 검증

만약에 검증값이 참이면
증명을 받아들였습니다 말해줘
아니면
증명을 거절했습니다 말해줘
끝`,
    },
  ],
};
