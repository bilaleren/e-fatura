# PDF Seçenekleri

PDF çıktısı alırken kullanılabilecek seçeneklerin listesi.

```shell
e-fatura list --pdf-options "marginTop=10" "marginBottom=10" --pdf-options "marginHorizontal=10"
```

### Seçenekler

| Ad                | Tür                  | Açıklama                                                                                                                                             | Varsayılan                                                     |
|-------------------| -------------------- |------------------------------------------------------------------------------------------------------------------------------------------------------| -------------------------------------------------------------- |
| scale             | `number`             | Web sayfasının oluşturulmasını ölçeklendirir. Değer `0.1` ile `2` arasında olmalıdır.                                                                | 1                                                              |
| format            | `string`             | PDF/Kağıt boyutu.                                                                                                                                    | A4                                                             |
| width             | `string` \| `number` | Kağıt genişliğini ayarlar. Bir sayı veya birim içeren bir dize girebilirsiniz.                                                                       | -                                                              |
| height            | `string` \| `number` | Kağıdın yüksekliğini ayarlar. Bir sayı veya birim içeren bir dize girebilirsiniz.                                                                    | -                                                              |
| landscape         | `boolean`            | Yatay yönde yazdırılıp yazdırılmayacağı.                                                                                                             | false                                                          |
| pageRanges        | `string`             | Yazdırılacak kağıt aralıkları, örneğin `1-5, 8, 11-13`.                                                                                              | `''` Boş dize, tüm sayfaların yazdırılacağı anlamına gelir.    |
| preferCSSPageSize | `boolean`            | Sayfada bildirilen herhangi bir CSS `@page` boyutuna, sayfa boyutuna göre öncelik verin. `width`, `height` veya `format` seçeneğinde bildirilir.     | `false`, içeriği kağıt boyutuna sığacak şekilde ölçeklendirir. |
| margin            | `string` \| `number` | Kenar boşluğunun ayarlanması, `marginTop`, `marginLeft`, `marginBottom` ve `marginRight` öğelerinin her birinin ayarlanmasıyla aynı etkiye sahiptir. | -                                                              |
| marginTop         | `string` \| `number` | Sayfanın üst tarafındaki kenar boşluğunu ayarlar.                                                                                                    | -                                                              |
| marginBottom      | `string` \| `number` | Sayfanın alt tarafındaki kenar boşluğunu ayarlar.                                                                                                    | -                                                              |
| marginLeft        | `string` \| `number` | Sayfanın sol tarafındaki kenar boşluğunu ayarlar.                                                                                                    | -                                                              |
| marginRight       | `string` \| `number` | Sayfanın sağ tarafındaki kenar boşluğunu ayarlar.                                                                                                    | -                                                              |
| marginVertical    | `string` \| `number` | Sayfanın üst (`marginTop`) ve alt (`marginBottom`) tarafındaki kenar boşluğunu ayarlar.                                                              | -                                                              |
| marginHorizontal  | `string` \| `number` | Sayfanın sol (`marginLeft`) ve sağ (`marginRight`) tarafındaki kenar boşluğunu ayarlar.                                                              | -                                                              |
