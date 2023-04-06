FROM node:16.14.2-alpine

ENV CHROME_BIN="/usr/bin/chromium-browser"
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/apps/e-fatura

COPY ./dist ./dist
COPY ./yarn.lock ./yarn.lock
COPY ./package.json ./package.json
COPY ./examples/pdf-example.js ./index.js

RUN yarn install
RUN mkdir invoice-data

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    dumb-init \
    udev \
    ttf-freefont \
    chromium \
      # Cleanup
      && apk del --no-cache make gcc g++ python3 binutils-gold gnupg libstdc++ \
      && rm -rf /usr/include \
      && rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/* \
      && echo

ENTRYPOINT ["node"]
CMD ["./index.js"]
