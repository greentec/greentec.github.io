---
title: 『시작하세요! 텐서플로 2.0 프로그래밍』 재고 추적 자동화
date: 2020-03-01
lang: kr
ref: tf2-book-stock-tracking
tags:
- automation
- writing
---

![](<../images/tf2_book_stock_tracking_0.jpg>)


&nbsp;
## 도입

자동화(Automation)는 사람이 반복적으로 수행하는 업무를 사람의 관여를 줄이는 방향으로 개선하는 것이라고 할 수 있습니다. 저는 [첫번째 기술 서적](<https://wikibook.co.kr/tf2/>)을 집필한 후 이 책의 재고 상황을 한눈에 볼 수 있는 [교보문고의 책 소개 페이지](<http://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=9791158391812>)[^1]에 자주 접속해서 재고의 현황을 눈여겨보다가, 이를 자동화하면 어떨까라는 생각을 했고 일련의 작업으로 이를 자동화했습니다.

[^1]: 교보문고는 제가 받은 전체 판매량에서 약 30%를 차지할만큼 비중 있는 플랫폼입니다. 하지만 여기서는 오프라인 재고만 다루기 때문에 그정도로 많은 양을 다루지는 않습니다(제가 확인했을 때는 온라인 판매량이 오프라인보다 몇 배 많았습니다).

> ※ 주의: 이 글은 튜토리얼이 아닌 제가 사용한 방법론에 대한 간략한 조망이기 때문에 실행을 위한 세부사항이 많이 생략되어 있습니다(예: 라즈베리파이 설치 등).


&nbsp;
## 재고 현황 페이지 크롤링

[교보문고의 책 소개 페이지](<http://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=9791158391812>)에 접속하면 전국 42개 점포의 재고수량을 확인할 수 있습니다. 제가 원하는 것은 제 책에 대한 재고수량이기 때문에 이 페이지만 크롤링하면 되고, 실시간까지는 아니어도 시간의 변화에 따른 의미있는 수치를 얻고 싶었기 때문에 10분에 한번씩 크롤링하도록 했습니다. 이정도면 사이트에 부담이 가지 않는 수준이라고 생각합니다.

![](<../images/tf2_book_stock_tracking_1.png>)
<small>그림 1. 책 소개 페이지에서 "매장 재고 · 위치" 버튼을 눌렀을 때의 화면</small>

웹 페이지 크롤링을 할 수 있는 여러 방법이 있지만 저는 일단 제 손에 익숙한 `python`의 `selenium` 라이브러리를 사용했습니다. `selenium`은 웹의 사용성 테스트나 자동화에 쓰입니다. `selenium`은 구글 크롬이나 파이어폭스 등의 웹 브라우저를 조작할 수 있는데, 이를 위해서는 크롬 드라이버(chrome driver)나 게코 드라이버(gecko driver)같은 웹 드라이버(WebDriver)의 실행 파일을 내려받아야 합니다. 크롬 드라이버의 설치 파일은 [이곳](<https://sites.google.com/a/chromium.org/chromedriver/>)에서 찾아볼 수 있습니다.

`코드 1`은 교보문고의 책 소개 페이지를 엽니다.

```python
from selenium import webdriver

options = webdriver.ChromeOptions()
# options.add_argument('headless')
options.add_argument('window-size=1920x1080')

driver = webdriver.Chrome('../../../chromedriver/chromedriver.exe', options=options)
driver.implicitly_wait(3)
url = 'http://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=9791158391812'
driver.get(url)
```
<small>코드 1. selenium으로 교보문고의 책 소개 페이지 열기</small>

먼저 `selenium`에서 `webdriver`를 불러옵니다. 그 다음에 `webdriver`의 옵션을 설정합니다.

옵션 중에 첫번째로 주석처리된 것은 headless 옵션에 대한 것입니다. 웹 드라이버는 GUI가 없는(headless) 버전으로 돌릴 수 있습니다. 처음 코드를 작업할 때는 `코드 1`처럼 이 옵션을 주석처리하고 작업하다가, 코드 작성이 완료되면 headless 옵션을 켜서 불필요한 메모리의 소모를 줄입니다. 두번째 옵션은 브라우저 윈도우의 크기를 일반적인 크기인 1920, 1080 픽셀로 고정합니다.

그 다음에는 `webdriver.Chrome()`에 크롬드라이버의 경로와 위에서 설정한 옵션을 입력하여 웹 드라이버를 실제로 구동시킵니다. 다음 줄의 `driver.implicitly_wait(3)`은 웹페이지를 구성하는 HTML DOM Element가 로드될 때까지 Exception을 발생시키지 않고 3초 동안 암묵적으로 기다린다는 뜻으로, 그 전에 로드가 끝나면 3초를 다 채우지 않고 다음 명령이 실행됩니다. `url` 변수에 교보문고의 책 소개 페이지의 링크를 저장한 다음에 `driver.get(url)`로 해당 페이지를 불러옵니다.

이제 이 페이지에서 크롤링할 부분을 표시하기 위해서 먼저 "매장 재고 · 위치" 버튼을 눌러야 합니다. F12를 눌러서 개발자 도구를 연 다음에 좌측 상단의 화살표 아이콘으로 표시된 웹페이지 구성 요소 조사 도구를 클릭한 다음 버튼을 눌러서 정확한 DOM Element의 이름을 찾습니다.

![](<../images/tf2_book_stock_tracking_2.png>)
<small>그림 2. 웹페이지 구성 요소 조사 도구</small>

![](<../images/tf2_book_stock_tracking_3.png>)
<small>그림 3. 웹페이지 구성 요소 조사 도구로 버튼의 정보 확인</small>

웹페이지 구성 요소 조사 도구로 표시되는 태그는 링크를 나타내는 `<a>`이고 `id`는 `btnStockOpen`입니다. 이 두 정보를 이용해서 해당 태그를 정확하게 추출해낼 수 있고, 여기서 한 단계 위로 올라가면 `<div>` 태그인 실제 버튼을 선택할 수 있습니다. `코드 2`는 `<a>`태그와 그 위의 `<div>`를 찾아내고 `<div>`버튼을 클릭합니다.

```python
inner_link = driver.find_element_by_xpath('//a[@id="btnStockOpen"]')
button = inner_link.find_element_by_xpath('./..')
button.click()
driver.implicitly_wait(3)
```
<small>코드 2. "매장 재고 · 위치" 버튼 누르기</small>

`코드 2`의 `xpath`는 XML Path의 준말입니다. 웹페이지는 HTML 형식이지만 XML과는 DOM 구조체를 가진다는 공통점이 있기 때문에 `xpath`로 HTML DOM Element에 접근하는 경로를 나타낼 수 있습니다.[^2] 첫번째 줄에서 `xpath`는 `<a>` 태그 중 `id` 속성이 `btnStockOpen`인 개체를 찾습니다. 해당 개체가 여러 개일 경우에는 `find_element_by_xpath` 대신 `find_elements_by_xpath`를 사용하면 됩니다.

[^2]: [okky.kr의 BK님의 답변글 참고](<https://okky.kr/article/546718>)

두번째 줄에서는 위에서 찾은 링크의 부모(parent)에 해당하는 Element를 선택하여 `button`이라는 변수에 저장합니다. 그리고 세번째 줄에서 버튼을 클릭합니다. 버튼을 클릭하면 그림 1에서 볼 수 있는 것처럼 전국 42개 교보문고 점포의 재고 수량을 확인할 수 있습니다.

이제 각 점포의 이름과 재고의 수량을 저장하겠습니다. 재고의 수량 외에 각 점포의 이름까지 저장하는 이유는 나중에 점포가 추가되거나 삭제되는 일이 있을 경우에도 정보를 놓치지 않기 위해서입니다. `코드 3`은 각 점포의 이름과 재고의 수량을 각각 리스트로 저장합니다.

```python
shop_list = []
stock_list = []

stock_div = driver.find_element_by_xpath('//div[@id="storeStockTable"]')
for th in stock_div.find_elements_by_tag_name('th'):
    if th.text != '':
        print(th.text)
        shop_list.append(th.text)

for td in stock_div.find_elements_by_tag_name('td'):
    if td.text != '':
        print(td.text)
        stock_list.append(td.text)
```
<small>코드 3. 각 점포의 이름과 재고의 수량을 리스트로 저장</small>

`shop_list`와 `stock_list`에 각 점포의 이름과 재고의 수량을 저장합니다. 이 정보는 `id`가 `storeStockTable`인 `div` 하단에 있는 테이블에 저장됩니다. 테이블에서 `th`는 제목 셀로 여기서는 각 점포의 이름이 저장되고, `td`는 제목 외의 내용 셀로 재고의 수량이 저장됩니다. `find_elements_by_tag_name`으로 해당되는 태그를 찾은 다음 리스트를 순회하면서 하나씩 저장합니다.

이렇게 얻은 재고 정보는 `stock_list.txt` 파일에 `현재시간,1,0,1,0,...` 형태로 저장됩니다.

```nil
2020-01-26 14:07,4,0,1,0,0,0,0,0,1,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,2,0,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
2020-01-26 14:17,4,0,1,0,0,0,0,0,1,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,2,0,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
2020-01-26 16:17,4,0,1,0,0,0,0,0,1,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,2,2,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
2020-01-26 16:37,4,0,0,0,0,0,0,0,1,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,2,2,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
2020-01-26 18:27,3,0,0,0,0,0,0,0,1,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,2,2,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
2020-01-26 20:47,2,0,0,0,0,0,0,0,1,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,2,2,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
2020-01-27 11:17,2,0,0,0,0,0,0,0,0,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,2,2,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
2020-01-27 13:57,2,0,0,0,0,0,0,0,0,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,1,2,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
2020-01-27 14:37,2,0,0,0,0,0,0,0,0,0,0,2,1,1,1,0,0,0,1,0,1,0,0,1,1,1,1,0,1,1,0,0,1,0,1,1,0,1,0,0,0,0
```
<small>stock_list.txt 파일의 일부</small>

`코드 4`에서는 현재시간을 저장하고 기존에 저장되어 있던 재고 정보를 불러옵니다. 재고 변동을 비교하고, 변동사항이 있을 경우 알려주기 위해서입니다.

```python
import datetime

now_time = datetime.datetime.now()
now_time_string = datetime.datetime.strftime(now_time, "%Y-%m-%d %H:%M")

last_stock_list = []
with open('stock_list.txt', 'r', encoding='utf-8-sig') as f:
    last_stock_line = f.readlines()[-1]
    last_stock_line = last_stock_line.replace('\n', '')
    last_stock_list = last_stock_line.split(',')[1:]
```
<small>코드 4. 현재시간 저장, 기존 재고 정보 불러오기</small>

`코드 4`에서는 현재 시간을 `datetime` 라이브러리를 사용해서 `now_time_string`이라는 변수에 문자열로 저장했습니다. 그리고 `last_stock_list`라는 리스트에 가장 마지막 시점에 저장되어 있던 재고 정보를 불러왔습니다.


&nbsp;
## 슬랙으로 재고 변동 알려주기

여기서 슬랙(Slack)으로 재고 변동을 알려주는 시스템을 넣어보겠습니다. 슬랙은 협업을 위한 메신저 도구로 세계적으로 널리 쓰이고 있습니다. 이메일만 있으면 누구나 슬랙 아이디와 채팅방을 무료로 사용할 수 있습니다.

슬랙에 자동으로 메시지를 보내기 위해서는 앱(app)을 만드는 방법과 토큰(token)을 사용하는 방법이 있습니다. 토큰은 레거시로 분류되어 곧 사라지거나 미지원될 운명입니다만 일단 빠르게 쓸 수 있기 때문에 저는 이 방법을 사용했습니다. [Legacy tokens](https://api.slack.com/legacy/custom-integrations/legacy-tokens) 페이지로 접속하면 현재 참여하고 있는 채팅방의 목록과 거기에 사용할 수 있는 토큰이 표시됩니다(토큰은 76자로 꽤 길기 때문에 굳이 앞부분을 가리지 않았습니다). "Create token" 버튼을 눌러서 채팅방에 사용할 토큰을 만들 수 있습니다.

![](<../images/tf2_book_stock_tracking_4.png>)
<small>그림 4. Slack 채팅방에 사용할 토큰 확인</small>

토큰을 얻은 뒤에는 재고 변동이 있을 때마다 슬랙에 메시지를 보냅니다.

```python
if ''.join([str(s) for s in stock_list]) != ''.join([str(s) for s in last_stock_list]):
    with open('stock_list.txt', 'a', encoding='utf-8-sig') as f:
        f.write(now_time_string + ',' + ','.join([str(s) for s in stock_list]) + '\n')
        print('saved')

        diff = []
        for i in range(len(stock_list)):
            if stock_list[i] != last_stock_list[i]:
                diff.append(int(stock_list[i]) - int(last_stock_list[i]))
            else:
                diff.append(0)

        message = []
        for idx, shop in enumerate(shop_list):
            if diff[idx] != 0:
                message.append(shop + ': ' + str(diff[idx]))

        slack_token = 'xoxp-932209908500...SLACK_TOKEN...'
        client = slack.WebClient(token=slack_token)
        client.chat_postMessage(channel="#tf2", text=now_time_string + '| ' + ', '.join(message))

driver.quit()
```
<small>코드 5. 재고 변동이 있을 때 슬랙에 메시지 보내기</small>

`코드 5`에서는 먼저 `stock_list`와 `last_stock_list`를 각각 하나의 문자열로 합친 결과를 비교해서 차이가 있을 경우에 `stock_list.txt`의 마지막 줄에 저장합니다. 두번째 줄에서 파일을 `a` 모드로 읽는 것은 파일을 덮어쓰지 않고 마지막에 내용을 추가하겠다는 뜻입니다.

새로운 내용을 저장한 다음에는 `stock_list`와 `last_stock_list`의 숫자를 하나씩 비교해서 `diff` 리스트에 저장하고, `diff` 리스트의 숫자 중 0이 아닐 때 그 결과를 해당 점포의 이름과 함께 `message` 리스트에 저장합니다. 저장한 메시지는 `slack.WebClient()`를 그림 4에서 확인한 slack_token으로 호출한 `client`에서 `chat_postMessage()` 함수를 호출해서 메시지를 보냅니다. 정상적으로 실행될 때 그림 5처럼 메시지가 오게 됩니다.

![](<../images/tf2_book_stock_tracking_5.png>)
<small>그림 5. Slack 채팅방에 전달된 재고 변동 메시지</small>

이제 코드는 완료되었습니다만 아직 자동으로 실행되는 부분은 다루지 않았습니다. 이 부분은 다음 절에서 살펴봅니다.


&nbsp;
## 라즈베리파이에서 자동 실행

앞에서 만든 코드를 가급적 사람이 신경을 쓸 필요가 없도록 자동으로 실행시켜야 자동화의 목적을 달성했다고 할 수 있습니다.

일단 코드를 돌리기 위해서는 컴퓨터가 필요합니다. 회사나 집에서 쓰는 로컬 데스크톱도 컴퓨터이지만, 클라우드 환경의 컴퓨터[^3]에서 코드를 돌릴 수도 있습니다. 그리고 저전력을 사용하는 라즈베리파이도 컴퓨터입니다. 라즈베리파이는 영국의 라즈베리파이 재단이 교육용으로 개발한 신용카드 크기의 싱글 보드 컴퓨터입니다. 최신 버전은 라즈베리파이4 모델B로 1기가, 2기가, 4기가 옵션을 제공하며 가격은 각각 35달러, 35달러[^4], 55달러입니다. 라즈베리파이는 가격이 저렴할 뿐만 아니라 매우 낮은 전력을 소비합니다.[^5]

[^3]: [vultr](<https://www.vultr.com/>)같은 서비스에서는 한 달에 최소 2.5달러 정도 되는 저렴한 비용으로 클라우드를 사용할 수 있습니다. 이 외에도 비슷한 서비스들이 여럿 있습니다.

[^4]: 최근에 8주년 기념으로 2기가 모델의 가격을 45달러에서 35달러로 인하했습니다. [링크](<https://www.raspberrypi.org/blog/new-price-raspberry-pi-4-2gb/>)

[^5]: 라즈베리파이3 B+ 버전의 소비 전력 측정 실험 글. [링크](<https://geeksvoyage.com/raspberry%20pi/power-consumption-for-pi/>)

여기서는 라즈베리파이의 설치에 대해서는 다루지 않습니다. 라즈베리파이에는 미니콘다(miniconda)[^6]를 설치하면 아나콘다와 비슷하게 동작하는 파이썬 배포 관리 시스템을 다룰 수 있습니다. 앞에서 짠 코드에서 파일의 경로에 대한 부분 정도만 고치면 다른 부분은 고칠 필요 없이 동일하게 활용할 수 있습니다.

[^6]: 파이썬 배포 관리 패키지인 아나콘다(Anaconda)의 경량화 버전입니다. 메모리의 용량이 적은 라즈베리파이 등에서 빛을 발합니다.

라즈베리파이에서 자동으로 파이썬 스크립트를 실행하기 위해서는 두 가지가 필요합니다. 첫번째는 파이썬 스크립트를 실행하는 배시 셸 스크립트(bash shell script) 파일을 만드는 것입니다. 이것은 윈도우의 배치 파일(*.bat)과 비슷한 역할을 합니다. 제가 만든 배시 셸 스크립트 파일은 아래와 같습니다.

```bash
#!/bin/bash
SHELL=/bin/sh
PATH=/bin:/sbin:/usr/bin:/usr/sbin

/home/pi/.conda/envs/tweeterbot/bin/python /home/pi/TweeterBot/Kyobobook_stock_tracker/crawler.py
```
<small>코드 6. 파이썬 스크립트 자동 실행을 위한 배시 셸 스크립트 파일</small>

마지막 줄은 코드를 `python crawler.py` 같은 형식으로 실행합니다. 그런데 파이썬의 경로와 파일의 경로를 루트(`/`)부터 시작하는 절대경로로 표시해준 것을 기억해두셔야 합니다. 이렇게 경로를 다 지정해주지 않으면 파일을 찾지 못해서 에러를 일으키거나 시스템에 기본으로 설치된 파이썬을 실행하기 때문에 꼭 경로를 지정해주어야 합니다.

두번째로 필요한 것은 이 파일을 실행하기 위해 스케줄러에 등록하는 것입니다. 리눅스에서는 크론탭(crontab)이라는 프로그램을 사용해서 특정 시간에 특정 명령을 실행하도록 할 수 있습니다. 터미널에서 `crontab -e`을 입력하면 설정을 편집할 수 있고, `코드 7`의 설정을 추가해서 파이썬 스크립트를 자동으로 실행시킵니다.

```nil
7,17,27,37,47,57 * * * * /home/pi/TweeterBot/Kyobobook_stock_tracker/kyobobook.sh > /home/pi/TweeterBot/Kyobobook_stock_tracker/log/cron.log 2>&1
```
<small>코드 7. 자동화를 위한 crontab 설정</small>

크론탭에서 매개 변수는 띄어쓰기로 구분됩니다. 가장 처음에 나오는 다섯 개의 숫자는 각각 분(0-59), 시(0-23), 일(1-31), 월(1-12), 요일(0-7)을 나타냅니다. `7,17,27,37,47,57`로 표시된 것은 매 7분, 17분, 27분, 37분, 47분, 57분마다 실행하라는 것입니다. 그 뒤에 나오는 명령이 `.sh` 확장자를 가진 배시 셸 파일을 실행하라는 것인데, 실행이 제대로 되지 않았을 경우를 대비해서 로그를 남기기 위해 `배시 셸 파일 > 로그 파일 2>&1` 과 같은 형식으로 로그를 남기고 있습니다.

여기까지 세팅하면 교보문고의 재고 추적 정보에 변동이 있을 때 슬랙에 자동으로 받아볼 수 있습니다.


&nbsp;
## 간단한 시각화

1월 23일부터 이 프로그램을 돌렸으니 약 40일의 기간 동안 프로그램을 돌려서 데이터를 얻었습니다. 이 데이터로 간단한 시각화를 해보도록 하겠습니다.

먼저 판매량에 해당하는 마이너스 수치의 합을 각 점포별로 나열해보겠습니다. 현재 재고량에서 지난 재고량을 뺐을 때 음수가 나오면 재고가 없어진 것이므로 팔렸다고 가정합니다(바로드림 등으로 인해 한 점포에서 다른 점포로 책이 옮겨가는 경우도 있을 수 있겠습니다만 여기서는 고려하지 않습니다).

![](<../images/tf2_book_stock_tracking_6.png>)
<small>그림 6. 각 점포별 판매량 합산</small>

계산 결과 광화문점이 32권으로 1위, 강남점이 30권으로 2위를 차지했습니다. 그 뒤로는 판교, 잠실, 부산, 분당, 평촌 등 유동인구가 많은 지역에 위치한 점포가 뒤를 잇는 것을 확인할 수 있습니다. 재고가 있지만 아직 한 권도 안팔린 곳들도 눈에 띄네요(~~악성재고~~).

일별 판매량은 어떻게 나올까요? 각 점포의 판매량을 일별로 합산하면 일별 총 판매량을 얻을 수 있습니다.

![](<../images/tf2_book_stock_tracking_7.png>)
<small>그림 7. 일별 판매량 추이</small>

1월 31일에 10권으로 최대 판매량을 기록했고, 평균적으로 일 별 약 3.27권의 판매량을 기록했습니다. 특별히 눈에 띄는 주기성은 보이지 않는 것 같습니다.

재고가 줄어든(책이 팔린) 시간에 대한 데이터가 있으니 이 책이 몇 시쯤 잘 팔리는지에 대한 통계도 시각화해볼 수 있습니다.

![](<../images/tf2_book_stock_tracking_8.png>)
<small>그림 8. 시간대별 판매량 추이</small>

11시에서 16시까지는 10~12권 정도로 꾸준히 판매량이 나오다가 저녁 시간인 17~18시에는 판매량이 줄어들고, 19시에 15권으로 가장 높은 판매량을 보인 후 심야 시간에는 판매량이 급격히 줄어드는 것을 확인할 수 있습니다.

데이터의 양이 적어서 통계의 의미도 대단하지 않을 수 있어 보입니다만 1년 정도 쌓인다면 좀 더 의미있는 결과를 도출할 수 있지 않을까 싶습니다. 이렇게 재고 추적 자동화와, 자동화로 얻은 결과를 시각화하는 작업까지 진행해보았습니다. 긴 글을 읽어주셔서 감사합니다.
