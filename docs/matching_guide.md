<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# 톤암과 카트리지, STU, 포노앰프 사이의 매칭 공식

톤암–카트리지, SUT–포노앰프 매칭에는 “기계적 공진”과 “임피던스/전압 변환”이라는 두 가지 다른 이론이 들어갑니다.[^1][^2][^3][^4]

## 1. 톤암–카트리지 공진 주파수 공식

톤암(유효질량)과 카트리지(컴플라이언스)는 스프링-질량계로 모델링되고, 이 시스템의 공진 주파수가 음질과 트래킹을 결정합니다.[^2][^5][^1]

- 기본 목표: 공진 주파수 $f_r$ 를 대략 8–12 Hz 범위에 오게 하는 것.[^6][^7][^8][^2]
- 주로 쓰는 근사 공식:

$$
f_r \approx \frac{159}{\sqrt{M \cdot C}}
$$

여기서 $M$ 은 톤암 유효질량 + 헤드셸 + 나사 + 카트리지 무게(gram), $C$ 는 카트리지 컴플라이언스($\mu m/mN$)입니다.[^7][^8][^6][^2]

- 다른 표기:

$$
f_r \approx \frac{1000}{6.28 \cdot \sqrt{M \cdot C}}
$$

인데, 수학적으로 위 식과 같은 내용입니다.[^9][^6]

### 기계적/음향학적 의미

- 톤암 질량이 클수록(무거운 암) 공진은 내려가고, 컴플라이언스가 클수록(부드러운 서스펜션) 공진은 내려갑니다.[^5][^10][^1]
- 공진이 8 Hz 아래로 내려가면 워프·발판 진동과 겹쳐 저역이 흐물흐물하고 우퍼가 크게 흔들리며 왜곡이 생깁니다.[^8][^2][^5]
- 12 Hz 이상으로 올라가면 음악 대역(특히 저역 상부)과 겹쳐 톤 밸런스가 가벼워지고 트래킹 여유가 줄어듭니다.[^2][^8][^9]


## 2. 컴플라이언스/질량 매칭 실무 공식

위 공식을 이용해 실무적으로는 다음과 같이 씁니다.[^11][^12][^13][^6]

- 총 질량:

$$
M = m_{\text{arm, eff}} + m_{\text{headshell}} + m_{\text{cartridge}} + m_{\text{screws}}
$$

- 원하는 공진 $f_r$ (예: 10 Hz)에 맞춰 역산:

$$
M \approx \frac{(159)^2}{f_r^2 \cdot C}
$$

이 식으로 “이 컴플라이언스라면 톤암 총 질량은 어느 정도가 이상적인가”를 대략 잡을 수 있습니다.[^6][^8][^9]

- 일본식 100 Hz 컴플라이언스는 10 Hz 기준으로 보통 1.5–2.0배 정도로 환산해서 쓰는 경험칙이 많습니다.[^11][^2]


## 3. SUT–카트리지–포노앰프 임피던스 공식

SUT는 이상적인 트랜스포머로 근사할 수 있고, 턴비의 제곱이 임피던스를 스케일링합니다.[^3][^4][^14][^15]

- 턴비(전압비) $N$ 을 “2차:1차”로 두면,
    - 전압: $V_{\text{out}} = N \cdot V_{\text{in}}$[^4][^14][^16]
    - 임피던스 반사:

$$
R_{\text{primary}} = \frac{R_{\text{secondary}}}{N^2}
$$

여기서 $R_{\text{secondary}}$ 는 포노앰프 MM 입력 임피던스(보통 47 kΩ)입니다.[^15][^3][^4]

- 카트리지가 실제로 보는 부하:

$$
R_{\text{load, cart}} \approx \frac{R_{\text{phono}} \parallel R_{\text{extra}}}{N^2}
$$

여기서 $R_{\text{extra}}$ 는 2차측에 병렬로 다는 추가 로딩 저항입니다.[^14][^3][^15]

### 회로적/음향학적 의미

- 턴비를 올리면 전압 이득은 커지지만, 카트리지가 보는 부하 임피던스는 $1/N^2$ 만큼 줄어들어 더 무겁게(저임피던스) 로딩됩니다.[^3][^14][^15]
- 너무 낮은 부하(카트리지 내부 임피던스의 3배 이하 등)는 고역을 죽이고 다이내믹스를 줄이는 경향, 너무 높은 부하는 노이즈와 딱딱한 질감이 늘어날 수 있습니다.[^17][^4][^14]


## 4. SUT 게인과 포노단 입력 전압

SUT 선택 시 “출력 전압이 MM 포노입(대략 2.5–10 mV 정도가 이상)” 범위에 들어가는지가 중요합니다.[^16][^4][^17]

- 카트리지 출력 $V_{\text{cart}}$, 턴비 $N$:

$$
V_{\text{phono\,in}} = N \cdot V_{\text{cart}}
$$

- 예: 0.3 mV 카트리지에 1:10 SUT → 약 3 mV, 1:20 SUT → 약 6 mV로 대부분 MM 포노에 적절합니다.[^4][^16]


## 5. 한국집 시스템(레가 6 + Phasemation T‑320 + NS‑10)에 적용 방향

질문이 “공식” 위주라 수식만 정리했지만, 실제 세팅에 바로 연결하면 더 도움이 됩니다. 레가 Planar 6(Ania Pro) + Phasemation T‑320 + Threshold NS‑10 조합에 대해:

- Ania Pro(로우 출력 MC)는 보통 내부 임피던스가 10 Ω대, 출력 0.3 mV 수준으로 알려져 있고, 이런 카트리지는 내부 임피던스의 약 10배 이상(100 Ω 이상)의 부하가 기본 추천 범위입니다.[^2][^4]
- T‑320은 여러 탭(예: 1:10, 1:20 등)을 제공하며, 앞의 공식으로 각 탭에서의 로딩과 출력 전압을 계산하여
    - $R_{\text{load, cart}}$ ≥ 100 Ω 정도,
    - $V_{\text{phono\,in}}$ 을 2.5–10 mV 사이로 맞추는 탭을 선택하면 이론적으로 가장 무난한 매칭이 됩니다.[^14][^16][^15][^4]

원하시면 다음 질문에서 레가 P6 톤암의 유효질량과 Ania Pro 컴플라이언스를 넣어 실제 공진 주파수 값을 계산해 드리고, T‑320의 각 탭에 대해 카트리지가 보게 되는 부하와 포노 입력 전압을 숫자로 정리해 드리겠습니다.
<span style="display:none">[^18][^19][^20]</span>

<div align="center">⁂</div>

[^1]: https://www.audio-origami.co.uk/effective-tonearm-mass-explained

[^2]: https://www.dynavector.com/lecture/compliance.php

[^3]: https://forum.intactaudio.com/viewtopic.php?t=752

[^4]: https://www.leson.org/mc-step-up-transformer-fundamentals/

[^5]: https://www.kuzma.si/media/uploads/files/KAA 2016-TONEARM RESONANCE.pdf

[^6]: https://www.gcaudio.com/tips-tricks/tonearm-cartridge-compatability

[^7]: https://www.reed.lt/tonearm-concept/

[^8]: https://nirvanasound.com/wp-content/uploads/tech-tips/The Compliance of a Cartridge and the Resonant Frequency of the Tonearm Mark.pdf

[^9]: https://www.klangheimat.de/news/lng/en/the-right-combination-find-tonearm-pickup-headshell.html

[^10]: https://korfaudio.com/blog67

[^11]: https://korfaudio.com/calculator

[^12]: https://alignmentprotractor.com/tonearm-resonance-calculator

[^13]: https://engrove.pages.dev/tonearm-calculator

[^14]: https://myemia.com/Loading.html

[^15]: https://www.whatsbestforum.com/threads/help-needed-question-about-the-impedance-on-an-sut.32190/

[^16]: https://www.diyaudio.com/community/threads/moving-coil-step-up-maths-and-optimal-matching.251487/

[^17]: https://www.hifivision.com/threads/sut-cartridge-and-phono-preamp.83434/

[^18]: https://www.vinylengine.com/cartridge_resonance_evaluator.php

[^19]: https://auditur.dk/tonearm-resonance-theory/

[^20]: https://www.vinylengine.com/turntable_forum/viewtopic.php?t=94624

