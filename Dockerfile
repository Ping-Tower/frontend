FROM node:22-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# VITE_API_URL: leave empty to use nginx proxy (recommended for production).
# Set to an absolute URL only if the frontend is served from a different host than the API.
ARG VITE_API_URL=""
ARG VITE_TELEGRAM_BOT_USERNAME=""
ARG VITE_SOCIAL_TELEGRAM_URL=""
ARG VITE_SOCIAL_GITHUB_URL=""
ARG VITE_SOCIAL_GITLAB_URL=""
ARG VITE_SOCIAL_LINKEDIN_URL=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TELEGRAM_BOT_USERNAME=$VITE_TELEGRAM_BOT_USERNAME
ENV VITE_SOCIAL_TELEGRAM_URL=$VITE_SOCIAL_TELEGRAM_URL
ENV VITE_SOCIAL_GITHUB_URL=$VITE_SOCIAL_GITHUB_URL
ENV VITE_SOCIAL_GITLAB_URL=$VITE_SOCIAL_GITLAB_URL
ENV VITE_SOCIAL_LINKEDIN_URL=$VITE_SOCIAL_LINKEDIN_URL

COPY . .
RUN pnpm build

# ── Production image ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS final

COPY --from=build /app/dist /usr/share/nginx/html

# Template is processed at container start by the official nginx image:
# environment variables are substituted via envsubst.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
