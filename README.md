# 재료 탐정 (Material Detective)

성효경TV 연재용 교육 게임. 역사 속 피로·파괴·응력 부식 균열 사고 현장에 조사관으로 들어가 원인을 밝혀내는 3D 웹 게임입니다.

- 시즌 1: 15개 사건 중 1~3화 공개 (베르사유의 차축, 두 동강 난 리버티선, 타이타닉의 이음매)
- 빌드 과정 없음: 저장소 루트를 그대로 정적 사이트로 배포하면 됩니다 (`index.html`이 사건 목록 첫 화면).

## 구성
- `index.html` 사건 목록과 진행 기록
- `ch1.html` ~ `ch3.html` 각 사건
- `js/` three.js 예제 모듈 (GLTFLoader, 후처리)
- `models/` 인물·소품 3D 모델 (glTF를 JSON으로 감싼 형태)
- `fonts/`, `img/` 글꼴과 썸네일

## 출처와 라이선스
- 엔진: three.js r128 (MIT)
- 3D 모델: Quaternius (CC0)
- 글꼴: Noto Serif KR, Pretendard (SIL Open Font License 1.1)
- 사건 해설의 출처와 재구성 범위는 각 사건의 판정 화면에 적혀 있습니다.

## Firebase Hosting 배포 (crackcase.web.app)
```
git clone https://github.com/grainsize/crackcase
cd crackcase
firebase login                                   # 처음 한 번만
firebase deploy --only hosting --project crackcase
```
