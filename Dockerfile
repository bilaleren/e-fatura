# syntax=docker/dockerfile:1

FROM node:20.11.1-alpine3.19

ARG CLI_PACKAGE_VERSION="1.0.0"

LABEL maintainer="Bilal Eren <bilal@webnoi.com>"
LABEL org.opencontainers.image.version="${CLI_PACKAGE_VERSION}"
LABEL org.opencontainers.image.title="e-fatura"
LABEL org.opencontainers.image.description="e-Arşiv komut satırı arayüzü (CLI) uygulaması."
LABEL org.opencontainers.image.authors="Bilal Eren <bilal@webnoi.com>"
LABEL org.opencontainers.image.url="https://github.com/bilaleren/e-fatura"
LABEL org.opencontainers.image.licenses="MIT"

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

RUN yarn global add e-fatura-cli@${CLI_PACKAGE_VERSION}

ENTRYPOINT ["/usr/local/bin/e-fatura"]
