# 몰래시트

스프레드시트처럼 보이는 격자형 미니게임 플랫폼입니다.

## 현재 포함된 게임

- 재고 정리 자동화
- 오류 셀 검토
- 자동 합산 테스트
- 픽셀 감사 보고서
- 결재선 배치

## 조작법

- `ESC`: 업무표로 숨기기
- `Shift + Enter`: 복귀
- 방향키: 게임 조작
- 수식창 명령어 사용 가능

## GitHub Pages 배포

이 프로젝트는 GitHub Pages 배포를 위해 `Vite`의 `base`를 `/mollaesheet-arcade/`로 설정했습니다.

### 개발

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 배포

`gh-pages` 패키지를 사용하는 기준입니다.

```bash
npm run deploy
```

## 주의

실제 Google Sheets가 아니며, 유사한 업무용 스프레드시트 UI를 패러디한 팬메이드/개인 프로젝트입니다.
