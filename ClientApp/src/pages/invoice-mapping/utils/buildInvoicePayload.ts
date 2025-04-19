import { getIsoCountryCode } from '@/helpers/countryCodeConverter';
import { InvoiceData } from './invoiceData';

const mapSalesInvoice = (
  selectedInvoiceType: string,
  erpData: InvoiceData,
  profileData: API.ProfileItem,
) => {
  const itemList = erpData.orderEntryDetails.map((item, index) => ({
    id: item.invuniq.toString(),
    qty: item.qtyshipped,
    unit: item.invunit,
    totItemVal: item.extinvmisc,
    description: item.desc,
    unitPrice: item.unitprice,
    taxAmount: item.tamounT1,
    taxableAmount: item.extinvmisc,
    taxPercent: item.tratE1,
  }));

  let requestBody: API.SubmitInvoiceRequest = {
    irn: erpData.invnumber,
    issueDate: '', // current date
    issueTime: '', // current time
    invoiceTypeCode: selectedInvoiceType,
    currencyCode: erpData.insourcurr,
    startDate: '', // optional
    endDate: '', // optional
    invoicePeriodDescription: '',

    billingReferenceID: erpData.invnumber,
    additionalDocumentReferenceID: '',

    supplierAdditionalAccountID: '',
    supplierIndustryCode: profileData.msicCode,
    supplierTIN: profileData.tin,
    supplierBRN: profileData.registrationNumber,
    supplierSST: profileData.sstRegistrationNumber,
    supplierTTX: profileData.tourismTaxRegistrationNumber,
    supplierCity: profileData.city,
    supplierPostalCode: profileData.postalCode,
    supplierCountrySubentityCode: profileData.state,
    supplierAddressLine1: profileData.address1,
    supplierAddressLine2: profileData.address2 ?? '',
    supplierAddressLine3: profileData.address3 ?? '',
    supplierCountryCode: profileData.countryCode,
    supplierName: profileData.name,
    supplierTelephone: profileData.phone,
    supplierEmail: profileData.email,

    customerTIN: erpData.customerTIN,
    customerBRN: erpData.customerBRN,
    customerCity: erpData.bilcity || '',
    customerPostalCode: erpData.bilzip ?? '',
    customerCountrySubentityCode: erpData.bilstate || 'NA',
    customerAddressLine1: erpData.biladdR1!,
    customerAddressLine2: erpData.biladdR2 ?? '',
    customerAddressLine3: erpData.biladdR3 ?? '',
    customerCountryCode: getIsoCountryCode(erpData.bilcountry),
    customerName: erpData.bilname!,
    customerTelephone: erpData.bilphone,
    customerEmail: erpData.bilemail || '',

    totalAmount: erpData.invnetwtx,

    itemList,

    taxableAmount: erpData.invnetnotx,
    taxAmount: erpData.invitaxtot ?? 0,
  };

  return requestBody;
};

const mapCreditNoteInvoice = (
  selectedInvoiceType: string,
  erpData: InvoiceData,
  profileData: API.ProfileItem,
) => {
  const itemList = erpData.orderCreditDebitDetails.map((item, index) => ({
    id: item.crduniq.toString(),
    qty: item.qtyreturn,
    unit: item.crdunit,
    totItemVal: item.extcrdmisc,
    description: item.desc,
    unitPrice: item.unitprice,
    taxAmount: item.tamounT1,
    taxableAmount: item.extcrdmisc,
    taxPercent: item.tratE1,
  }));

  let requestBody: API.SubmitInvoiceRequest = {
    irn: erpData.invnumber,
    issueDate: '', // current date
    issueTime: '', // current time
    invoiceTypeCode: selectedInvoiceType,
    currencyCode: erpData.crsourcurr,
    startDate: '', // optional
    endDate: '', // optional
    invoicePeriodDescription: '',

    billingReferenceID: erpData.invnumber,
    additionalDocumentReferenceID: '',

    supplierAdditionalAccountID: '',
    supplierIndustryCode: profileData.msicCode,
    supplierTIN: profileData.tin,
    supplierBRN: profileData.registrationNumber,
    supplierSST: profileData.sstRegistrationNumber,
    supplierTTX: profileData.tourismTaxRegistrationNumber,
    supplierCity: profileData.city,
    supplierPostalCode: profileData.postalCode,
    supplierCountrySubentityCode: profileData.state,
    supplierAddressLine1: profileData.address1,
    supplierAddressLine2: profileData.address2 ?? '',
    supplierAddressLine3: profileData.address3 ?? '',
    supplierCountryCode: profileData.countryCode,
    supplierName: profileData.name,
    supplierTelephone: profileData.phone,
    supplierEmail: profileData.email,

    customerTIN: erpData.customerTIN,
    customerBRN: erpData.customerBRN,
    customerCity: erpData.bilcity || '',
    customerPostalCode: erpData.bilzip ?? '',
    customerCountrySubentityCode: erpData.bilstate || 'NA',
    customerAddressLine1: erpData.biladdR1!,
    customerAddressLine2: erpData.biladdR2 ?? '',
    customerAddressLine3: erpData.biladdR3 ?? '',
    customerCountryCode: getIsoCountryCode(erpData.bilcountry),
    customerName: erpData.bilname!,
    customerTelephone: erpData.bilphone,
    customerEmail: erpData.bilemail || '',

    totalAmount: erpData.crdnetwtx!,

    itemList,

    taxableAmount: erpData.crdnetnotx!,
    taxAmount: erpData.crditaxtot ?? 0,
  };

  return requestBody;
};

const mapPurchaseInvoice = (
  selectedInvoiceType: string,
  erpData: InvoiceData,
  profileData: API.ProfileItem,
) => {
  const itemList = erpData.purchaseInvoiceDetails.map((item, index) => ({
    id: item.invhseq.toString(),
    qty: item.rqreceived,
    unit: item.rcpunit,
    totItemVal: item.extended,
    description: item.itemdesc,
    unitPrice: item.unitcost,
    taxAmount: item.taxamounT1,
    taxableAmount: item.extended,
    taxPercent: item.taxratE1,
  }));

  let requestBody: API.SubmitInvoiceRequest = {
    irn: erpData.invnumber!,
    issueDate: '', // current date
    issueTime: '', // current time
    invoiceTypeCode: selectedInvoiceType,
    currencyCode: erpData.currency!,
    startDate: '', // optional
    endDate: '', // optional
    invoicePeriodDescription: '',

    billingReferenceID: erpData.invnumber!,
    additionalDocumentReferenceID: '',

    supplierAdditionalAccountID: '',
    supplierIndustryCode: profileData.msicCode, // temp
    supplierTIN: erpData.supplierTIN!,
    supplierBRN: erpData.supplierBRN!,
    supplierSST: 'NA',
    supplierTTX: 'NA',
    supplierCity: erpData.vdcity!,
    supplierPostalCode: erpData.vdzip!,
    supplierCountrySubentityCode: erpData.vdstate!,
    supplierAddressLine1: erpData.vdaddresS1!,
    supplierAddressLine2: erpData.vdaddresS2 ?? '',
    supplierAddressLine3: erpData.vdaddresS3 ?? '',
    supplierCountryCode: getIsoCountryCode(erpData.bilcountry),
    supplierName: erpData.vdname!,
    supplierTelephone: erpData.vdphone!,
    supplierEmail: erpData.vdemail!,

    customerTIN: profileData.tin,
    customerBRN: profileData.registrationNumber,
    customerCity: profileData.city || '',
    customerPostalCode: profileData.postalCode ?? '',
    customerCountrySubentityCode: erpData.bilstate || 'NA',
    customerAddressLine1: profileData.address1!,
    customerAddressLine2: profileData.address2 ?? '',
    customerAddressLine3: profileData.address3 ?? '',
    customerCountryCode: profileData.countryCode,
    customerName: profileData.name!,
    customerTelephone: profileData.phone,
    customerEmail: profileData.email || '',

    totalAmount: erpData.scamount!,

    itemList,

    taxableAmount: erpData.extended!,
    taxAmount: Math.max(erpData.doctotal - erpData.extended, 0),
  };

  return requestBody;
};

const mapPurchaseCreditNoteInvoice = (
  selectedInvoiceType: string,
  erpData: InvoiceData,
  profileData: API.ProfileItem,
) => {
  const itemList = erpData.purchaseCreditDebitNoteDetails.map((item, index) => ({
    id: item.crnhseq.toString(),
    qty: item.rqreturned,
    unit: item.retunit,
    totItemVal: item.extended,
    description: item.itemdesc,
    unitPrice: item.unitcost,
    taxAmount: item.taxamounT1,
    taxableAmount: item.extended,
    taxPercent: item.taxratE1,
  }));

  let requestBody: API.SubmitInvoiceRequest = {
    irn: erpData.invnumber!,
    issueDate: '', // current date
    issueTime: '', // current time
    invoiceTypeCode: selectedInvoiceType,
    currencyCode: erpData.currency!,
    startDate: '', // optional
    endDate: '', // optional
    invoicePeriodDescription: '',

    billingReferenceID: erpData.invnumber!,
    additionalDocumentReferenceID: '',

    supplierAdditionalAccountID: '',
    supplierIndustryCode: profileData.msicCode, // temp
    supplierTIN: erpData.supplierTIN!,
    supplierBRN: erpData.supplierBRN!,
    supplierSST: 'NA',
    supplierTTX: 'NA',
    supplierCity: erpData.vdcity!,
    supplierPostalCode: erpData.vdzip!,
    supplierCountrySubentityCode: erpData.vdstate!,
    supplierAddressLine1: erpData.vdaddresS1!,
    supplierAddressLine2: erpData.vdaddresS2 ?? '',
    supplierAddressLine3: erpData.vdaddresS3 ?? '',
    supplierCountryCode: getIsoCountryCode(erpData.bilcountry),
    supplierName: erpData.vdname!,
    supplierTelephone: erpData.vdphone!,
    supplierEmail: erpData.vdemail!,

    customerTIN: profileData.tin,
    customerBRN: profileData.registrationNumber,
    customerCity: profileData.city || '',
    customerPostalCode: profileData.postalCode ?? '',
    customerCountrySubentityCode: erpData.bilstate || 'NA',
    customerAddressLine1: profileData.address1!,
    customerAddressLine2: profileData.address2 ?? '',
    customerAddressLine3: profileData.address3 ?? '',
    customerCountryCode: profileData.countryCode,
    customerName: profileData.name!,
    customerTelephone: profileData.phone,
    customerEmail: profileData.email || '',

    totalAmount: erpData.scamount!,

    itemList,

    taxableAmount: erpData.extended!,
    taxAmount: Math.max(erpData.doctotal - erpData.extended, 0),
  };

  return requestBody;
};

export const buildInvoicePayload = (
  selectedInvoiceType: string,
  erpData: InvoiceData,
  profileData?: API.ProfileItem,
) => {
  if (!profileData) {
    return;
  }

  switch (selectedInvoiceType) {
    case '01': // Sales Invoice
      return mapSalesInvoice(selectedInvoiceType, erpData, profileData);
    case '02':
    case '03': // Credit/Debit Note
      return mapCreditNoteInvoice(selectedInvoiceType, erpData, profileData);
    case '11': // Purchase Invoice
      return mapPurchaseInvoice(selectedInvoiceType, erpData, profileData);
    case '12':
    case '13': // Purchase Credit/Debit Note
      return mapPurchaseCreditNoteInvoice(selectedInvoiceType, erpData, profileData);
    default:
      console.warn('Unsupported invoice type:', selectedInvoiceType);
      return;
  }
};
