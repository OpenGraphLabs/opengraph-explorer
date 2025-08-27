FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_SERVER_BASE_URL
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL

# 패키지 의존성 복사 및 설치
COPY client/package.json client/yarn.lock ./
RUN yarn install --frozen-lockfile

# 소스 코드 복사
COPY client/ ./

# ENV 설정 및 빌드를 한 번에 처리
RUN yarn build

# 프로덕션 환경을 위한 nginx 설정
FROM nginx:stable-alpine

# 기본 nginx 설정 제거
RUN rm -rf /usr/share/nginx/html/*

# 빌드된 파일 nginx 서버 복사
COPY --from=build /app/dist /usr/share/nginx/html

# nginx 설정 파일 복사
COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf

# HTTP 및 HTTPS 포트 노출
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"] 