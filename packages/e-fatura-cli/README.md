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

# Komutlar

- [e-fatura list](#e-fatura-list)
- [e-fatura sign](#e-fatura-sign)
- [e-fatura export](#e-fatura-export)
- [e-fatura download](#e-fatura-download)
- [e-fatura xslt-renderer](#e-fatura-xslt-renderer)

## e-fatura list

e-Arşiv üzerinde bulunan faturaları listele

```shell
e-fatura list [options]
```

#### Seçenekler

| Ad                                 | Açıklama                                                                         | Zorunlu | Varsayılan | Seçenekler                                                                          |
| :--------------------------------- | :------------------------------------------------------------------------------- | :------ | :--------- | :---------------------------------------------------------------------------------- |
| `--period [period]`                | Faturaların düzenlenlenme dönemi/periyodu                                        | Hayır   | \-         | yesterday, this\-week, prev\-week, this\-month, prev\-month, this\-year, prev\-year |
| `--start-date [date]`              | Faturaların düzenlenme dönemi aralığı başlangıç tarihi (YYYY\-MM\-DD formatında) | Hayır   | \-         | \-                                                                                  |
| `--end-date [date]`                | Faturaların düzenlenme dönemi aralığı bitiş tarihi (YYYY\-MM\-DD formatında)     | Hayır   | \-         | \-                                                                                  |
| `--status [status]`                | Faturaların onay durumu                                                          | Hayır   | \-         | approved, unapproved, deleted                                                       |
| `--env-file [file]`                | e\-Arşiv giriş bilgilerinin bulunduğu ortam değişkenleri dosyasının yolu         | Hayır   | $PWD/.env  | \-                                                                                  |
| `--issued-to-me`                   | Adınıza düzenlenen faturaları listele                                            | Hayır   | \-         | \-                                                                                  |
| `--hourly-search-interval [value]` | Adınıza düzenlenen faturaların günün hangi aralığında düzenlendiği               | Hayır   | \-         | none, first\-half, last\-half                                                       |

## e-fatura sign

e-Arşiv üzerinde bulunan faturaları imzala

```shell
e-fatura sign [options]
```

#### Seçenekler

| Ad                    | Açıklama                                                                         | Zorunlu | Varsayılan | Seçenekler                                                                          |
| :-------------------- | :------------------------------------------------------------------------------- | :------ | :--------- | :---------------------------------------------------------------------------------- |
| `--period [period]`   | Faturaların düzenlenlenme dönemi/periyodu                                        | Hayır   | \-         | yesterday, this\-week, prev\-week, this\-month, prev\-month, this\-year, prev\-year |
| `--start-date [date]` | Faturaların düzenlenme dönemi aralığı başlangıç tarihi (YYYY\-MM\-DD formatında) | Hayır   | \-         | \-                                                                                  |
| `--end-date [date]`   | Faturaların düzenlenme dönemi aralığı bitiş tarihi (YYYY\-MM\-DD formatında)     | Hayır   | \-         | \-                                                                                  |
| `--env-file [file]`   | e\-Arşiv giriş bilgilerinin bulunduğu ortam değişkenleri dosyasının yolu         | Hayır   | $PWD/.env  | \-                                                                                  |

## e-fatura export

e-Arşiv üzerinde bulunan temel fatura bilgilerini dışa aktar

```shell
e-fatura export [options]
```

#### Seçenekler

| Ad                                 | Açıklama                                                                                                                                            | Zorunlu | Varsayılan                             | Seçenekler                                                                          |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------------------------------------- | :---------------------------------------------------------------------------------- |
| `--type [type]`                    | Faturaların hangi formatta dışarı aktarılacağı                                                                                                      | Hayır   | json                                   | csv, json, excel                                                                    |
| `--period [period]`                | Faturaların düzenlenlenme dönemi/periyodu                                                                                                           | Hayır   | \-                                     | yesterday, this\-week, prev\-week, this\-month, prev\-month, this\-year, prev\-year |
| `--start-date [date]`              | Faturaların düzenlenme dönemi aralığı başlangıç tarihi (YYYY\-MM\-DD formatında)                                                                    | Hayır   | \-                                     | \-                                                                                  |
| `--end-date [date]`                | Faturaların düzenlenme dönemi aralığı bitiş tarihi (YYYY\-MM\-DD formatında)                                                                        | Hayır   | \-                                     | \-                                                                                  |
| `--status [status]`                | Faturaların onay durumu                                                                                                                             | Hayır   | \-                                     | approved, unapproved, deleted                                                       |
| `--env-file [file]`                | e\-Arşiv giriş bilgilerinin bulunduğu ortam değişkenleri dosyasının yolu                                                                            | Hayır   | $PWD/.env                              | \-                                                                                  |
| `--issued-to-me`                   | Adınıza düzenlenen faturaları listele                                                                                                               | Hayır   | \-                                     | \-                                                                                  |
| `--hourly-search-interval [value]` | Adınıza düzenlenen faturaların günün hangi aralığında düzenlendiği                                                                                  | Hayır   | \-                                     | none, first\-half, last\-half                                                       |
| `--output-path [path]`             | Çıktıların kaydedileceği dizin yolu                                                                                                                 | Hayır   | $HOME/e-fatura/outputs                 | \-                                                                                  |
| `--filename-format [format]`       | Çıktının dosya adı formatı                                                                                                                          | Hayır   | {this.startDate}\-{this.endDate}.{ext} | \-                                                                                  |
| `-i, --interactive`                | Belirli faturaları dışa aktarmak istiyorsanız bu seçeneği kullanın. Eğer seçenek aktifse faturaları seçmeniz için bir tablo arayüzü gösterilecektir | Hayır   | \-                                     | \-                                                                                  |

## e-fatura download

e-Arşiv üzerinde bulunan faturaları indir

```shell
e-fatura download [options]
```

#### Seçenekler

| Ad                                                | Açıklama                                                                                                                                       | Zorunlu | Varsayılan               | Seçenekler                                                                          |
| :------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :----------------------- | :---------------------------------------------------------------------------------- |
| `--type [type]`                                   | Faturaların hangi formatta indirileceği                                                                                                        | Hayır   | zip                      | xml, pdf, html, zip, zip+pdf                                                        |
| [--pdf-options [options...]](docs/PDF_OPTIONS.md) | PDF oluşturma seçenekleri                                                                                                                      | Hayır   | \-                       | \-                                                                                  |
| `--browser-executable-path [path]`                | PDF oluşturmak için kullanılacak tarayıcının çalıştırılabilir dosya yolu                                                                       | Hayır   | \-                       | \-                                                                                  |
| `--period [period]`                               | Faturaların düzenlenlenme dönemi/periyodu                                                                                                      | Hayır   | \-                       | yesterday, this\-week, prev\-week, this\-month, prev\-month, this\-year, prev\-year |
| `--start-date [date]`                             | Faturaların düzenlenme dönemi aralığı başlangıç tarihi (YYYY\-MM\-DD formatında)                                                               | Hayır   | \-                       | \-                                                                                  |
| `--end-date [date]`                               | Faturaların düzenlenme dönemi aralığı bitiş tarihi (YYYY\-MM\-DD formatında)                                                                   | Hayır   | \-                       | \-                                                                                  |
| `--status [status]`                               | Faturaların onay durumu                                                                                                                        | Hayır   | \-                       | approved, unapproved, deleted                                                       |
| `--env-file [file]`                               | e\-Arşiv giriş bilgilerinin bulunduğu ortam değişkenleri dosyasının yolu                                                                       | Hayır   | $PWD/.env                | \-                                                                                  |
| `--download-path [path]`                          | Faturaların indirileceği dizin yolu                                                                                                            | Hayır   | $HOME/e-fatura/downloads | \-                                                                                  |
| `--filename-format [format]`                      | İndirilecek faturanın dosya adı formatı                                                                                                        | Hayır   | {invoice.uuid}.{ext}     | \-                                                                                  |
| `-i, --interactive`                               | Belirli faturaları indirmek istiyorsanız bu seçeneği kullanın. Eğer seçenek aktifse faturaları seçmeniz için bir tablo arayüzü gösterilecektir | Hayır   | \-                       | \-                                                                                  |

## e-fatura xslt-renderer

e-Arşiv üzerinde bulunan faturaları xslt ile işle

```shell
e-fatura xslt-renderer [options] <xslt-path>
```

#### Seçenekler

| Ad                                                | Açıklama                                                                         | Zorunlu | Varsayılan                  | Seçenekler                                                                          |
| :------------------------------------------------ | :------------------------------------------------------------------------------- | :------ | :-------------------------- | :---------------------------------------------------------------------------------- |
| [--pdf-options [options...]](docs/PDF_OPTIONS.md) | PDF oluşturma seçenekleri                                                        | Hayır   | \-                          | \-                                                                                  |
| `--browser-executable-path [path]`                | PDF oluşturmak için kullanılacak tarayıcının çalıştırılabilir dosya yolu         | Hayır   | \-                          | \-                                                                                  |
| `--period [period]`                               | Faturaların düzenlenlenme dönemi/periyodu                                        | Hayır   | \-                          | yesterday, this\-week, prev\-week, this\-month, prev\-month, this\-year, prev\-year |
| `--start-date [date]`                             | Faturaların düzenlenme dönemi aralığı başlangıç tarihi (YYYY\-MM\-DD formatında) | Hayır   | \-                          | \-                                                                                  |
| `--end-date [date]`                               | Faturaların düzenlenme dönemi aralığı bitiş tarihi (YYYY\-MM\-DD formatında)     | Hayır   | \-                          | \-                                                                                  |
| `--status [status]`                               | Faturaların onay durumu                                                          | Hayır   | \-                          | approved, unapproved, deleted                                                       |
| `--env-file [file]`                               | e\-Arşiv giriş bilgilerinin bulunduğu ortam değişkenleri dosyasının yolu         | Hayır   | $PWD/.env                   | \-                                                                                  |
| `--output-path [path]`                            | İşlenen faturaların kaydedileceği dizin yolu                                     | Hayır   | $HOME/e-fatura/outputs/xslt | \-                                                                                  |
| `--filename-format [format]`                      | Fatura çıktısının dosya adı formatı                                              | Hayır   | {invoice.uuid}.zip          | \-                                                                                  |
| `--include-pdf`                                   | Aktifse fatura çıktısına PDF dosyası da dahil edilir                             | Hayır   | \-                          | \-                                                                                  |
| `--xsltproc-executable-path [path]`               | xsltproc komut satırı uygulamasının çalıştırılabilir dosya yolu                  | Hayır   | /usr/bin/xsltproc           | \-                                                                                  |
