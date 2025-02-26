# 🧾 e-Fatura CLI 🖥️

[![Docker Pulls](https://img.shields.io/docker/pulls/bilaleren/e-fatura)](https://hub.docker.com/r/bilaleren/e-fatura)
[![NPM](https://img.shields.io/npm/v/e-fatura-cli.svg)](https://www.npmjs.com/package/e-fatura-cli)
[![License MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](https://github.com/bilaleren/e-fatura/blob/master/LICENCE)

Bu paket komut satırı arayüzü (CLI) üzerinden e-Arşiv faturalarını listeler, imzalar, indirir ve daha fazlasını yapar.

# Komutlar

- [e-fatura list](#e-fatura-list)
- [e-fatura sign](#e-fatura-sign)
- [e-fatura export](#e-fatura-export)
- [e-fatura download](#e-fatura-download)
- [e-fatura xslt-renderer](#e-fatura-xslt-renderer)

## e-fatura list

e-Arşiv üzerinde bulunan faturaları listele

```shell
docker run \
    -it --rm --env-file .env \
    -v "$(pwd)/e-fatura-volume:/root/e-fatura" \
    bilaleren/e-fatura list [options]
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
docker run \
    -it --rm --env-file .env \
    -v "$(pwd)/e-fatura-volume:/root/e-fatura" \
    bilaleren/e-fatura sign [options]
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
docker run \
    -it --rm --env-file .env \
    -v "$(pwd)/e-fatura-volume:/root/e-fatura" \
    bilaleren/e-fatura export [options]
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
docker run \
    -it --rm --env-file .env \
    -v "$(pwd)/e-fatura-volume:/root/e-fatura" \
    bilaleren/e-fatura download [options]
```

#### Seçenekler

| Ad                                                    | Açıklama                                                                                                                                       | Zorunlu | Varsayılan               | Seçenekler                                                                          |
| :---------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :----------------------- | :---------------------------------------------------------------------------------- |
| `--type [type]`                                       | Faturaların hangi formatta indirileceği                                                                                                        | Hayır   | zip                      | xml, pdf, html, zip, zip+pdf                                                        |
| [**--pdf-options [options...]**](docs/PDF_OPTIONS.md) | PDF oluşturma seçenekleri                                                                                                                      | Hayır   | \-                       | \-                                                                                  |
| `--browser-executable-path [path]`                    | PDF oluşturmak için kullanılacak tarayıcının çalıştırılabilir dosya yolu                                                                       | Hayır   | \-                       | \-                                                                                  |
| `--period [period]`                                   | Faturaların düzenlenlenme dönemi/periyodu                                                                                                      | Hayır   | \-                       | yesterday, this\-week, prev\-week, this\-month, prev\-month, this\-year, prev\-year |
| `--start-date [date]`                                 | Faturaların düzenlenme dönemi aralığı başlangıç tarihi (YYYY\-MM\-DD formatında)                                                               | Hayır   | \-                       | \-                                                                                  |
| `--end-date [date]`                                   | Faturaların düzenlenme dönemi aralığı bitiş tarihi (YYYY\-MM\-DD formatında)                                                                   | Hayır   | \-                       | \-                                                                                  |
| `--status [status]`                                   | Faturaların onay durumu                                                                                                                        | Hayır   | \-                       | approved, unapproved, deleted                                                       |
| `--env-file [file]`                                   | e\-Arşiv giriş bilgilerinin bulunduğu ortam değişkenleri dosyasının yolu                                                                       | Hayır   | $PWD/.env                | \-                                                                                  |
| `--download-path [path]`                              | Faturaların indirileceği dizin yolu                                                                                                            | Hayır   | $HOME/e-fatura/downloads | \-                                                                                  |
| `--filename-format [format]`                          | İndirilecek faturanın dosya adı formatı                                                                                                        | Hayır   | {invoice.uuid}.{ext}     | \-                                                                                  |
| `-i, --interactive`                                   | Belirli faturaları indirmek istiyorsanız bu seçeneği kullanın. Eğer seçenek aktifse faturaları seçmeniz için bir tablo arayüzü gösterilecektir | Hayır   | \-                       | \-                                                                                  |

## e-fatura xslt-renderer

e-Arşiv üzerinde bulunan faturaları xslt ile işle

```shell
docker run \
    -it --rm --env-file .env \
    -v "$(pwd)/e-fatura-volume:/root/e-fatura" \
    -v "$(pwd)/gib-e-archive.xslt:/usr/app/gib-e-archive.xslt:ro" \
    bilaleren/e-fatura xslt-renderer [options] <xslt-path>
```

#### Seçenekler

| Ad                                                    | Açıklama                                                                         | Zorunlu | Varsayılan                  | Seçenekler                                                                          |
| :---------------------------------------------------- | :------------------------------------------------------------------------------- | :------ | :-------------------------- | :---------------------------------------------------------------------------------- |
| [**--pdf-options [options...]**](docs/PDF_OPTIONS.md) | PDF oluşturma seçenekleri                                                        | Hayır   | \-                          | \-                                                                                  |
| `--browser-executable-path [path]`                    | PDF oluşturmak için kullanılacak tarayıcının çalıştırılabilir dosya yolu         | Hayır   | \-                          | \-                                                                                  |
| `--period [period]`                                   | Faturaların düzenlenlenme dönemi/periyodu                                        | Hayır   | \-                          | yesterday, this\-week, prev\-week, this\-month, prev\-month, this\-year, prev\-year |
| `--start-date [date]`                                 | Faturaların düzenlenme dönemi aralığı başlangıç tarihi (YYYY\-MM\-DD formatında) | Hayır   | \-                          | \-                                                                                  |
| `--end-date [date]`                                   | Faturaların düzenlenme dönemi aralığı bitiş tarihi (YYYY\-MM\-DD formatında)     | Hayır   | \-                          | \-                                                                                  |
| `--status [status]`                                   | Faturaların onay durumu                                                          | Hayır   | \-                          | approved, unapproved, deleted                                                       |
| `--env-file [file]`                                   | e\-Arşiv giriş bilgilerinin bulunduğu ortam değişkenleri dosyasının yolu         | Hayır   | $PWD/.env                   | \-                                                                                  |
| `--output-path [path]`                                | İşlenen faturaların kaydedileceği dizin yolu                                     | Hayır   | $HOME/e-fatura/outputs/xslt | \-                                                                                  |
| `--filename-format [format]`                          | Fatura çıktısının dosya adı formatı                                              | Hayır   | {invoice.uuid}.zip          | \-                                                                                  |
| `--include-pdf`                                       | Aktifse fatura çıktısına PDF dosyası da dahil edilir                             | Hayır   | \-                          | \-                                                                                  |
| `--xsltproc-executable-path [path]`                   | xsltproc komut satırı uygulamasının çalıştırılabilir dosya yolu                  | Hayır   | /usr/bin/xsltproc           | \-                                                                                  |
