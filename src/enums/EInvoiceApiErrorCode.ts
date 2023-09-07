enum EInvoiceApiErrorCode {
  /**
   * Bilinmeyen bir hata oluştu.
   */
  UNKNOWN_ERROR = 1,

  /**
   * Geçersiz API cevabı.
   */
  INVALID_RESPONSE = 2,

  /**
   * Geçersiz erişim jetonu.
   */
  INVALID_ACCESS_TOKEN = 3,

  /**
   * Basit fatura oluşturulamadı.
   */
  BASIC_INVOICE_NOT_CREATED = 4,

  /**
   * Detaylı fatura bulunamadı.
   */
  INVOICE_NOT_FOUND = 5,

  /**
   * Basit fatura bulunamadı.
   */
  BASIC_INVOICE_NOT_FOUND = 6,

  /**
   * Geçersiz fatura HTML cevabı.
   */
  INVALID_INVOICE_HTML = 7,

  /**
   * Kullanıcı (şirket) bilgisi bulunamadı.
   */
  USER_INFORMATION_NOT_FOUND = 8,

  /**
   * Kullanıcı (şirket) bilgileri güncellenemedı.
   */
  USER_INFORMATION_NOT_UPDATED = 9,

  /**
   * Kayıtlı telefon numarası bulunamadı.
   */
  SAVED_PHONE_NUMBER_NOT_FOUND = 10,

  /**
   * Geçersiz SMS işlem kimliği.
   */
  INVALID_SMS_OPERATION_ID = 11,

  /**
   * SMS doğrulama kodu onaylanamadı.
   */
  NOT_VERIFIED_SMS_CODE = 12,

  /**
   * Fatura iptal talebi oluşturulamadı.
   */
  INVOICE_CANCEL_REQUEST_NOT_CREATED = 13,

  /**
   * Basit fatura silinemedi.
   */
  BASIC_INVOICE_NOT_DELETED = 14,

  /**
   * Geçersiz anonim kullanıcı kimliği.
   */
  INVALID_ANONYMOUS_USER_ID = 15,

  /**
   * Şirket bilgileri bulunamadı.
   */
  COMPANY_INFORMATION_NOT_FOUND = 16,

  /**
   * Faturaya ait xml dosyası bulunamadı.
   */
  INVOICE_XML_FILE_NOT_FOUND = 17,

  /**
   * Geçersiz fatura zip dosyası yanıtı.
   */
  INVALID_INVOICE_ZIP_FILE_RESPONSE = 18
}

export default EInvoiceApiErrorCode
