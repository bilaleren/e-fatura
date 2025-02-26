# PDF Seçenekleri

PDF çıktısı alırken kullanılabilecek seçeneklerin listesi.

```shell
e-fatura list --pdf-options "margin.top=10" "margin.bottom=10" --pdf-options "margin.horizontal=10"
```

### Seçenekler

| Ad                | Tür                  | Açıklama                                                                                                                                                 | Varsayılan                                                     |
| ----------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| scale             | `number`             | Web sayfasının oluşturulmasını ölçeklendirir. Değer `0.1` ile `2` arasında olmalıdır.                                                                    | 1                                                              |
| format            | `string`             | PDF/Kağıt boyutu.                                                                                                                                        | A4                                                             |
| width             | `string` \| `number` | Kağıt genişliğini ayarlar. Bir sayı veya birim içeren bir dize girebilirsiniz.                                                                           | -                                                              |
| height            | `string` \| `number` | Kağıdın yüksekliğini ayarlar. Bir sayı veya birim içeren bir dize girebilirsiniz.                                                                        | -                                                              |
| landscape         | `boolean`            | Yatay yönde yazdırılıp yazdırılmayacağı.                                                                                                                 | false                                                          |
| pageRanges        | `string`             | Yazdırılacak kağıt aralıkları, örneğin `1-5, 8, 11-13`.                                                                                                  | `''` Boş dize, tüm sayfaların yazdırılacağı anlamına gelir.    |
| preferCSSPageSize | `boolean`            | Sayfada bildirilen herhangi bir CSS `@page` boyutuna, sayfa boyutuna göre öncelik verin. `width`, `height` veya `format` seçeneğinde bildirilir.         | `false`, içeriği kağıt boyutuna sığacak şekilde ölçeklendirir. |
| margin            | `string` \| `number` | Kenar boşluğunun ayarlanması, `margin.top`, `margin.left`, `margin.bottom` ve `margin.right` öğelerinin her birinin ayarlanmasıyla aynı etkiye sahiptir. | -                                                              |
| margin.top        | `string` \| `number` | Sayfanın üst tarafındaki kenar boşluğunu ayarlar.                                                                                                        | -                                                              |
| margin.bottom     | `string` \| `number` | Sayfanın alt tarafındaki kenar boşluğunu ayarlar.                                                                                                        | -                                                              |
| margin.left       | `string` \| `number` | Sayfanın sol tarafındaki kenar boşluğunu ayarlar.                                                                                                        | -                                                              |
| margin.right      | `string` \| `number` | Sayfanın sağ tarafındaki kenar boşluğunu ayarlar.                                                                                                        | -                                                              |
| margin.vertical   | `string` \| `number` | Sayfanın üst ve alt tarafındaki kenar boşluğunu ayarlar.                                                                                                 | -                                                              |
| margin.horizontal | `string` \| `number` | Sayfanın sol ve sağ tarafındaki kenar boşluğunu ayarlar.                                                                                                 | -                                                              |
