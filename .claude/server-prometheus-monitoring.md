## Python FastAPI 서버에 Prometheus 모니터링 추가

OpenGraph의 Python FastAPI 서버에 Prometheus 모니터링을 추가하는 Task의 요구사항에 대해 설명합니다.

### 요구사항
- [ ] FastAPI 서버에 Prometheus 클라이언트 라이브러리를 설치합니다.
- [ ] FastAPI 서버 애플리케이션에 대한 Prometheus Best Practice 에 맞게 가장 효율적이고 유지보수하기 좋은 방법으로 Prometheus 메트릭을 노출합니다.
- [ ] 서버의 주요 엔드포인트에 대한 요청 수, 응답 시간, 오류율 등 기본적인 HTTP 서버의 메트릭을 수집합니다.
- [ ] Prometheus가 수집한 메트릭을 시각화하기 위해 Grafana 대시보드를 설정합니다.