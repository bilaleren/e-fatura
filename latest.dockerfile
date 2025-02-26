# syntax=docker/dockerfile:1

FROM node:20.11.1-alpine3.19

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

# Installing Chromium and dependencies
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    dumb-init \
    udev \
    ttf-freefont \
    libxslt \
    chromium \
      # Cleanup
      && apk del --no-cache make gcc g++ python3 binutils-gold gnupg libstdc++ \
      && rm -rf /usr/include \
      && rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/* \
      && echo

WORKDIR /usr/app

RUN yarn global add e-fatura-cli

ENTRYPOINT ["/usr/local/bin/e-fatura"]
