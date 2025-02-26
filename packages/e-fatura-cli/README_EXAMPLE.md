# 🧾 e-Fatura CLI 🖥️

[![NPM](https://img.shields.io/npm/v/e-fatura-cli.svg)](https://www.npmjs.com/package/e-fatura-cli)
[![Docker Pulls](https://img.shields.io/docker/pulls/bilaleren/e-fatura)](https://hub.docker.com/r/bilaleren/e-fatura)
[![License MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](https://github.com/bilaleren/e-fatura/blob/master/LICENCE)
![npm downloads](https://img.shields.io/npm/dt/e-fatura-cli.svg)

Bu paket komut satırı arayüzü (CLI) üzerinden e-Arşiv faturalarını listeler, imzalar, indirir ve daha fazlasını yapar.

# Kurulum

```shell
yarn global add e-fatura-cli
```

veya

```shell
npm install -g e-fatura-cli
```

veya

> [Docker görüntüsü dökümanını inceleyin.](./DOCKER_README.md)

# Yapılandırma

e-Arşiv kullanıcı adı ve şifre bilgileri, ortam değişkenleri aracılığıyla sağlanır. Kullanıcı adı ve şifre bilgileri, sistem düzeyinde bulunan ortam değişkenlerinden veya çalışma dizininde yer alan bir `.env` dosyasından temin edilir.

> Eğer çalışma dizininizde bir `.env` dosyası varsa otomatik olarak yüklenir.

**Örnek `.env ` dosyası**

```dotenv
E_ARCHIVE_USERNAME=kullanıcı-adı
E_ARCHIVE_PASSWORD=şifre
```

<details open>
<summary>
<strong><code>--env-file</code> seçeneği ile;</strong>
</summary>

```shell
e-fatura list --env-file ./.env.example
```

</details>

<details>
<summary>
<strong>Linux ve MacOS'da komut satırı ortam değişkenleri ile;</strong>
</summary>

```shell
E_ARCHIVE_USERNAME=kullanıcı-adı E_ARCHIVE_PASSWORD=şifre e-fatura list
```

</details>

<details>
<summary>
<strong><code>cross-env</code> ortam değişkenleri ile;</strong>
</summary>

`cross-env` kurulumu;

```shell
yarn add cross-env -D
```

`cross-env` kullanımı;

```shell
cross-env E_ARCHIVE_USERNAME=kullanıcı-adı E_ARCHIVE_PASSWORD=şifre e-fatura list
```

</details>
