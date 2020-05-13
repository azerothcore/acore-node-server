FROM node:12-alpine

WORKDIR /app
ENV TERM ansi

RUN apk update && apk add \
      bash \
      curl \
      git \
      ncurses \
      openssh-client

COPY . /app
COPY id_ed25519     /root/.ssh/id_ed25519
COPY id_ed25519.pub /root/.ssh/id_ed25519.pub

RUN ssh-keyscan -H gitlab.89109.nl > /root/.ssh/known_hosts
RUN npm install

RUN rm /root/.ssh/id_ed25519
RUN rm /root/.ssh/id_ed25519.pub

ENV NODE_ENV=production
