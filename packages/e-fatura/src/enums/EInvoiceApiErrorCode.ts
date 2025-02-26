enum EInvoiceApiErrorCode {
  /**
   * Bilinmeyen bir hata oluştu.
   */
  UNKNOWN_ERROR = 1,

  /**
   * Oturum zaman aşımına uğradı.
   */
  SESSION_TIMEOUT = 2,

  /**
   * Geçersiz API cevabı.
   */
  INVALID_RESPONSE = 3,

  /**
   * Geçersiz erişim jetonu.
   */
  INVALID_ACCESS_TOKEN = 4,

  /**
   * Basit fatura oluşturulamadı.
   */
  BASIC_INVOICE_NOT_CREATED = 5,

  /**
   * Detaylı fatura bulunamadı.
   */
  INVOICE_NOT_FOUND = 6,

  /**
   * Basit fatura bulunamadı.
   */
  BASIC_INVOICE_NOT_FOUND = 7,

  /**
   * Geçersiz fatura HTML cevabı.
   */
  INVALID_INVOICE_HTML = 8,

  /**
   * Kullanıcı (şirket) bilgisi bulunamadı.
   */
  USER_INFORMATION_NOT_FOUND = 9,

  /**
   * Kullanıcı (şirket) bilgileri güncellenemedı.
   */
  USER_INFORMATION_NOT_UPDATED = 10,

  /**
   * Kayıtlı telefon numarası bulunamadı.
   */
  SAVED_PHONE_NUMBER_NOT_FOUND = 11,

  /**
   * Geçersiz SMS işlem kimliği.
   */
  INVALID_SMS_OPERATION_ID = 12,

  /**
   * Temel faturalar imzalanamadı.
   */
  BASIC_INVOICES_COULD_NOT_SIGNED = 13,

  /**
   * Fatura iptal talebi oluşturulamadı.
   */
  INVOICE_CANCEL_REQUEST_NOT_CREATED = 14,

  /**
   * Basit fatura silinemedi.
   */
  BASIC_INVOICE_NOT_DELETED = 15,

  /**
   * Geçersiz anonim kullanıcı kimliği.
   */
  INVALID_ANONYMOUS_USER_ID = 16,

  /**
   * Şirket bilgileri bulunamadı.
   */
  COMPANY_INFORMATION_NOT_FOUND = 17,

  /**
   * Faturaya ait xml dosyası bulunamadı.
   */
  INVOICE_XML_FILE_NOT_FOUND = 18,

  /**
   * Geçersiz fatura zip dosyası yanıtı.
   */
  INVALID_INVOICE_ZIP_FILE_RESPONSE = 19
}

export default EInvoiceApiErrorCode;
