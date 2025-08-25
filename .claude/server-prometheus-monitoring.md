## Python FastAPI 서버에 Prometheus 모니터링 추가 및 docker-compose 연동

OpenGraph의 Python FastAPI 서버에 Prometheus 모니터링을 추가하는 Task의 요구사항에 대해 설명합니다.

### 요구사항
- [ ] FastAPI 서버에 Prometheus 클라이언트 라이브러리를 설치합니다.
  - 서버 폴더: `server/`
- [ ] FastAPI 서버 애플리케이션에 대한 Prometheus Best Practice 에 맞게 가장 효율적이고 유지보수하기 좋은 방법으로 Prometheus 메트릭을 노출합니다.
- [ ] 서버의 주요 엔드포인트에 대한 요청 수, 응답 시간, 오류율 등 기본적인 HTTP 서버의 메트릭을 수집합니다.
- [ ] Python FastAPI Server, Prometheus, Grafana 간의 연동이 원활하게 이루어지도록 `docker-compose.yml` 파일을 수정합니다.
  - `docker-compose.yml` 파일은 프로덕션 운영 환경을 위한 파일이며, `docker-compose.dev.yml` 파일은 로컬 개발 환경을 위한 파일입니다.
- [ ] docker compose 파일이 과거에 사용하던 Rust 서버 관련 설정을 모두 제거하고, Python FastAPI 서버와 Prometheus, Grafana 설정만 포함하도록 수정합니다.
- [ ] 로컬환경, 프로덕션 환경 모두에서 React, Python Fast API, PostgreSQL, Prometheus, Grafana가 정상적으로 동작하도록 합니다.