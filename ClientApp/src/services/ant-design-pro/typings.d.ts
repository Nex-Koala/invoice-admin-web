// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    // name?: string;
    // avatar?: string;
    // userid?: string;
    // email?: string;
    // signature?: string;
    // title?: string;
    // group?: string;
    // tags?: { key?: string; label?: string }[];
    // notifyCount?: number;
    // unreadCount?: number;
    // country?: string;
    // access?: string;
    // geographic?: {
    //   province?: { label?: string; key?: string };
    //   city?: { label?: string; key?: string };
    // };
    // address?: string;
    // phone?: string;
    id: string;
    userName: string;
    email: string;
    roles: string[];
    isVerified: boolean;
    token: string;
    refreshToken: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    email?: string;
    password?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  type PartnerListItem = {
    id: string;
    name: string;
    email: string;
    companyName: string;
    address1: string;
    address2?: string;
    address3?: string;
    status: boolean; //'active' | 'inactive';
    licenseKey: licenseKey;
    createdAt?: string;
    updatedAt?: string;
  };

  type licenseKey = {
    id: string;
    expiryDate: string;
    expiryType: 'Yearly' | 'Monthly';
    submissionCount: number;
    maxSubmissions: number;
    status: number;
  }

  type PartnerList = {
    data: PartnerListItem[];
    total: number;
    success: boolean;
  };

  type AuditLogListItem = {
    key: number;
    actionType: string;
    description: string;
    createdBy: string;
    createdAt: string;
  };

  type ProfileItem = {
    id: string;
    name: string;
    tin: string;
    schemeId: string;
    registrationNumber: string;
    sstRegistrationNumber: string;
    tourismTaxRegistrationNumber: string;
    email: string;
    phone: string;
    msicCode: string;
    businessActivityDescription: string;
    address1: string;
    address2?: string;
    address3?: string;
    postalCode: string;
    city: string;
    state: string;
    countryCode: string;
  };

  type RefreshTokenRequest = {
    token: string;
    refreshToken: string;
  };

  type InvoiceItemRequest = {
    id: string;
    qty: number;
    unit: string;
    classificationCode: string;
    subtotal: number;
    description: string;
    unitPrice: number;
    taxAmount: number;
    taxableAmount: number;
    taxPercent: number;
  };

  type SubmitInvoiceRequest = {
    irn: string;
    issueDate: string;
    issueTime: string;
    invoiceTypeCode: string;
    currencyCode: string;

    // New fields
    startDate?: string;
    endDate?: string;
    invoicePeriodDescription: string;
    billingReferenceID: string;
    additionalDocumentReferenceID: string;

    // Supplier
    supplierAdditionalAccountID: string;
    supplierIndustryCode: string;
    supplierTIN: string;
    supplierIdType: string;
    supplierBRN: string;
    supplierSST: string;
    supplierTTX: string;
    supplierBusinessActivityDescription: string;
    supplierCity: string;
    supplierPostalCode: string;
    supplierCountrySubentityCode: string;
    supplierAddressLine1: string;
    supplierAddressLine2: string;
    supplierAddressLine3: string;
    supplierCountryCode: string;
    supplierName: string;
    supplierTelephone: string;
    supplierEmail: string;

    // Customer
    customerTIN: string;
    customerIdType: string;
    customerBRN: string;
    customerSST: string;
    customerCity: string;
    customerPostalCode: string;
    customerCountrySubentityCode: string;
    customerAddressLine1: string;
    customerAddressLine2: string;
    customerAddressLine3: string;
    customerCountryCode: string;
    customerName: string;
    customerTelephone: string;
    customerEmail: string;

    // Invoice
    totalPayableAmount: number;
    itemList: InvoiceItemRequest[];
    taxableAmount: number;
    taxAmount: number;
    totalExcludingTax: number;
    totalIncludingTax: number;
  };

  type SubmissionRateItem = {
    label: string;
    value: number;
  };

  // invoice document
  type InvoiceDocument = {
    id: string;
    uuid: string;
    invoiceNumber: string;
    issueDate: string;
    documentCurrencyCode: string;
    taxCurrencyCode: string;
    totalAmount: number;
    taxAmount: number;
    totalExcludingTax: number;
    totalIncludingTax: number;
    supplierId: string;
    supplier: DocumentSupplier;
    customerId: string;
    customer: DocumentBuyer;
    invoiceLines: InvoiceLine[];
    submissionStatus: boolean;
    documentStatus: 'Valid' | 'Invalid' | 'Submitted' | 'Cancelled';
  };

  type DocumentSupplier = {
    id: string;
    name: string;
    tin: string;
    idType: string;
    brn: string;
    sstRegistrationNumber: string;
    taxTourismRegistrationNumber: string;
    msicCode: string;
    businessActivityDescription: string;
    address1: string;
    address2: string;
    address3: string;
    email: string;
    contactNumber: string;
    city: string;
    postalCode: string;
    state: string;
    countryCode: string;
  };

  type DocumentBuyer = {
    id: string;
    name: string;
    tin: string;
    idType: string;
    brn: string;
    sstRegistrationNumber: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    postalCode: string;
    state: string;
    countryCode: string;
    email: string;
    contactNumber: string;
  };

  type InvoiceLine = {
    id: string;
    lineNumber: string;
    quantity: number;
    unitPrice: number;
    lineAmount: number; // subtotal
    description: string;
    unitCode: string;
    currencyCode: string;
    invoiceDocumentId: string;
  };

  interface ValidationError {
    code: string;
    details: string;
    error: string;
    message: string;
    propertyName: string;
    propertyPath: string;
    target: string;
  }

  interface ValidationStep {
    status: string;
    name: string;
    error?: ValidationError;
  }

  interface InvoiceDetails {
    uuid: string;
    submissionUid: string;
    longId: string;
    internalId: string;
    typeName: string;
    typeVersionName: string;
    issuerTin: string;
    issuerName: string;
    receiverId: string;
    receiverName: string;
    dateTimeReceived: string;
    dateTimeValidated: string;
    totalExcludingTax: number;
    totalDiscount: number;
    totalNetAmount: number;
    totalPayableAmount: number;
    status: string;
    validationResults: {
      status: string;
      validationSteps: ValidationStep[];
    };
  }

  type AuditTrails = {
    id: string;
    userId: string;
    userName: string;
    operation: string;
    entity: string;
    dateTime: string | null;
    previousValues: string | null;
    newValues: string | null;
    modifiedProperties: string | null;
    primaryKey: string | null;
  };

  type InvoiceType = {
    code: string;
    description: string;
  };

  type SellerUOM = {
    id: number;
    code: string;
    description: string;
  }
  type LhdnUOM = {
    code: string;
    name: string;
  }

  type UomMapping = {
    id: string;
    lhdnUomCode?: string;
    uomId: number;
  }

  type LhdnClassification = {
    code: string;
    description: string;
  }

  type LocalClassification = {
    id: number;
    code: string;
    description: string;
  }

  type ClassificationMapping = {
    id: string;
    lhdnClassificationCode?: string;
    classificationId: number;
  }

  type MSICOption = {
    code: string;
    description: string;
  }

  type StateOption = {
    code: string;
    state: string;
  }

  type CurrencyOption = {
    code: string;
    currency: string;
  }
}
