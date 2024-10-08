---
title: 『시작하세요! 텐서플로 2.0 프로그래밍』 집필 후기
date: 2020-01-18
lang: kr
ref: tf2-book-writing
tags:
- writing
---

![](<../images/tf2_book_writing.jpg>)


&nbsp;
## 도입

며칠 전인 2020년 1월 15일, 저는 인생 첫 기술서적인 [『시작하세요! 텐서플로 2.0 프로그래밍』](<https://wikibook.co.kr/tf2/>)을 집필했고 무사히 출간되었습니다. 저는 어떤 작업을 할 때 언제나 작업 일지 같은 것을 정리하는데, 날짜별로 그 날 있었던 문제, 해결책, 느낌 같은 것을 텍스트 파일로 형식에 구애받지 않고 느슨하게 써내려갑니다. 이 문서를 참고하여 집필 과정을 회고해보려고 합니다. 원래는 2019년 회고를 하려 했지만 기존에 블로그에 올렸던 내용과 중복되는 내용을 다룰 것 같기도 하고, 2019년에 개인적으로 가장 큰 사건이 이 책의 출간이었기 때문에 이 집필 후기로 대신하려고 합니다.

![](<../images/tf2_book.png>)

혹시라도 기술서적의 집필 과정이 궁금하신 분들에게 이 글이 참고가 된다면 좋겠습니다.


&nbsp;
## 출판사와의 연락

시작은 2019년 3월 [한국게임학회](<http://www.kcgs.or.kr/modules/doc/index.php?doc=intro>)의 게임인공지능분과 첫 모임에서 발표한 내용이었습니다. 발표의 제목은 [『구글 텐서플로우 첫걸음』](<https://www.slideshare.net/HwanheeKim2/ss-137921987>)이었고, 그해 3월 6일, 7일에 걸쳐 개최된 ['Tensorflow Dev Summit 2019'](<https://www.youtube.com/playlist?list=PLQY2H8rRoyvzoUYI26kHmKSJBedn3SQuB>)의 내용을 참고하여 텐서플로우에 대한 소개와 2.0 버전으로 변하면서 바뀌는 사항을 정리한 것이었습니다.

이 발표 이후 [CNN](<https://www.slideshare.net/HwanheeKim2/tensorflow-2-cnn>), [RNN](<https://www.slideshare.net/HwanheeKim2/20-rnn>)에 대한 발표를 해야했기 때문에 해당 내용을 준비하던 도중에 페이스북 메신저로 [위키북스](<https://wikibook.co.kr/>)의 팀장님께 연락이 왔습니다. 그런데 iOS의 페이스북 메신저 앱은 모르는 사람에게 연락이 왔을 경우에 알림을 보여주지 않는 문제가 있었습니다. 이 발표에 관계된 다른 연락을 받기 위해 메신저 앱에 들어갔다가 3일 전에 연락이 왔었던 것을 보고 즉시 연락하여 겨우 미팅을 할 수 있었습니다.

미팅에서 텐서플로 2.0 책을 내고 싶다는 제안을 듣고 참고할 만한 책들의 목차를 받아서 검토해 보았습니다. 그리고 제가 생각하는 책의 목차를 보낸 다음에, 위키북스의 저술 템플릿과 글쓰기 지침 문서를 받고 이를 참고하여 샘플로 3장의 일부(15페이지 정도)를 제출하였고, 출판사에서 이를 검토 후 승인하여 계약을 하기로 결정되었습니다. 출간 일정은 개인적으로는 9월, 출판사에서는 12월 정도를 생각했는데, 결과적으로는 생각보다 책의 분량이 길어져서 다음해 1월에 출간되었습니다.


&nbsp;
## 계약과 집필 과정

계약 내용에 대해 간략하게 설명을 드리면 남들과 비슷한 조건으로 계약이 되었고, 1쇄 당 2,000부를 인쇄하는데 그 중 1,000부에 대한 인세는 출간일에 지급하고 나머지 1,000부에 대한 인세는 팔리는대로 지급, 그리고 다 팔리면 추가로 2쇄, 3쇄에 들어갈 수 있는 구조였습니다. 참고로 번역을 많이 한 다른 분에게 들으니 번역은 장당 번역료를 받고 러닝 개런티는 받지 않는다고 합니다. 경제적인 면에서는 번역보다 집필이 좀 더 나은 셈입니다.

책을 쓰기 전이기 때문에 인세는 가상으로 잡을 수 밖에 없었는데, 출판사에서 생각한 분량은 250페이지 정도였습니다. 그런데 현재는 484페이지, 920g의 두꺼운 책이 탄생하게 되었습니다. 아무래도 텐서플로 2.0으로 경험할 수 있는 다양한 분야를 다루고 싶은 제 욕심에 책이 두꺼워졌습니다만, 출판사에서는 이 부분을 제한하지 않고 제가 원하는대로 할 수 있게 해주셔서 감사했습니다.

샘플 페이지 제작 외에 집필에 본격적으로 들어간 시기는 5월부터였습니다. 집필 순서는 3-4-5-6-7-8-9-10-2-1장 순서였습니다. 도입부인 1, 2장을 제외한 이 책의 주요 내용인 3~10 장을 쓰는 데에는 각 장에 짧게는 2주, 길게는 2달 이상이 소요되었습니다. 영국 런던에서 열린 [CoG에 논문을 발표하러 갔을 때](<https://greentec.github.io/cog2019/>)가 가장 공백이 컸던 부분이었습니다. 2019년에는 논문도 기술서적도, 인생 처음으로 해보는 것들을 많이 경험했습니다.


&nbsp;
## 교정과 베타리딩, 최종 확인

집필이 마무리된 시기는 대략 11월 초였습니다. 그 사이에 출판사와 교정본을 주고받았고, 엄청나게 많은 교정 내용을 확인하며 책이 완성되고 있는 느낌을 받았습니다. 교정과 수정은 워드 파일을 수정하는 식으로 진행되었습니다.

제가 선정한 베타리더 여섯 분과 출판사에서 부탁해주신 민규식 박사님도 베타리더를 진행해주셨습니다. 민규식 박사님은 박사과정 중에도 [『텐서플로와 유니티 ML-Agents로 배우는 강화학습』](<https://wikibook.co.kr/tensorflow-mlagents/>)을 출간할 정도로 열정이 있는 분인데 이번 베타리더도 흔쾌히 응낙해주셔서 감사했습니다. 제가 선정한 분들은 너무 많아서 여기서 소개는 따로 하지 않겠습니다만 프로그래밍이 가능한 분들이라는 공통점이 있었습니다. 아무래도 이 책의 대상 독자층은 프로그래밍에 관심이 있는 분들이기 때문이었습니다.

각 베타리더 분들이 진행한 베타리딩 내용은 매우 다양한 점을 지적하고 있었습니다. 사람마다 다 다른 부분을 지적하고 있어서 베타리더가 많아질수록 책의 품질이 좋아질 것이라는 생각이 들었습니다. 베타리더 중 한 분인 신승백 님이 제안하셨던 내용이 인상적이었는데, "대학 교재로서의 가능성도 생각하고 있다면, 이 책의 대상 독자인 대학생들에게 베타리딩을 부탁해보는 방안"이었습니다. 이 부분도 정말 하고 싶었지만 책의 출간 일정이 약간 밀린 상황이라 실행할 수 없었던 점이 아쉬웠습니다. 다음에 다른 책의 베타리딩을 진행한다면 다양한 대상 독자층에게 베타리딩을 부탁해보고 싶습니다.

베타리딩이 끝난 후 최종적으로 편집 과정에 들어가고, 베타리더 분들에게 드렸던 워드 파일을 바로 변환한 PDF 파일과는 다르게, 실제 책의 모습을 하고 있는 PDF 파일을 받아서 잘못된 부분이 있는지 확인했습니다. 마지막이다보니 더욱 꼼꼼해지게 되어 그때까지도 보이지 않던 부분들을 많이 잡아내어 수정했습니다. 그 이후 최종적으로 완료처리하고, 선인세를 지급받은 뒤에 책의 출간만 기다리게 되었습니다.


&nbsp;
## 출간 이후

1월 2일에 Yes24, 교보, 인터파크, 알라딘 등의 인터넷 서점에 예약판매가 등록된 이후에 1월 15일까지 책의 출간을 기다렸습니다. 출간된 책을 받은 후에는 베타리더와 책을 드리기로 약속했던 분들께 직접 만나서 전달하고 있습니다. 오랫동안 소식이 끊겼던 분들과도 이 출간을 계기로 연락하여 만날 수 있어서 좋은 것 같습니다. 요즘은 하루에 한번씩은 꼭 인터넷 서점의 순위를 확인해보고 있습니다. 주제가 약간 범용적이어서 처음에 생각했던 것보다는 순위가 높은 것 같습니다. 아마 몇 달은 더 지켜보아야겠지만 말입니다.

[링크드인](<https://www.linkedin.com/>)에도 책의 출간 사실을 등록했습니다. 출간일인 1월 15일 전에는 등록이 되지 않아서 출간일까지 기다렸다가 등록했습니다. 프로필에 저서가 있는 사람들이 부러웠는데, 이제는 저도 부러워하는 대신 제 프로필을 보면서 뿌듯해할 수 있겠네요.

출간이 되고 바로 [깃허브 저장소](<https://github.com/wikibook/tf2>)에 예제 코드 오류에 대해서 알려주신 분들이 계셨습니다. 마지막에 고친 부분이 문제를 일으키는 부분이었는데, 다행히 마이너한 부분들이어서 금방 수정하고 코드에도 업데이트했습니다. 앞으로도 깃허브의 이슈 페이지에서 책의 피드백에 대해서는 빠르게 대응할 예정입니다.

그리고 여유가 된다면 다음 글에서 소개할 수도 있을 것 같은데요, 책을 사람들이 얼마나 많이 읽는지, 그리고 출판사와 논의하여 책의 판매량에 비해 독자들이 실제로 얼마나 책을 적극적으로 읽는지에 대해서 간단한 통계적 예측을 해볼 수 있을 것 같습니다.

![](<../images/tf2_book_2.png>)

위 그림은 bit.ly로 줄인 책 내부의 짧은 링크에 독자들이 접속한 횟수를 막대그래프로 나타낸 것인데, 책의 출간 이후 크게 늘어난 것을 확인할 수 있습니다. 이 기록과 책의 판매량을 종합하면 의미있는 통계가 나오지 않을까 생각해봅니다.

지금까지 기술서적 집필에 대한 후기를 적어보았습니다. 긴 글을 읽어주셔서 감사합니다.
