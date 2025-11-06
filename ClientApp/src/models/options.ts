import { useState } from 'react';
import { message } from 'antd';
import { getClassifications } from '@/services/ant-design-pro/classificationService';
import {
  getCurrencyCodes,
  getInvoiceTypes,
  getMsicCodes,
  getStateCodes,
} from '@/services/ant-design-pro/invoiceService';
import { getSuppliers } from '@/services/ant-design-pro/supplierService';
import { getUoms } from '@/services/ant-design-pro/uomService';

export default function useOptionsModel() {
  const [classificationOptions, setClassificationOptions] = useState<any[]>([]);
  const [uomOptions, setUomOptions] = useState<any[]>([]);
  const [msicOptions, setMsicOptions] = useState<API.MSICOption[]>([]);
  const [stateOptions, setStateOptions] = useState<API.StateOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<API.DocumentSupplier[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<API.CurrencyOption[]>([]);
  const [invoiceTypeOptions, setInvoiceTypeOptions] = useState<API.InvoiceType[]>([]);

  const fetchClassifications = async () => {
    if (classificationOptions.length) return;
    try {
      const res = await getClassifications({});
      setClassificationOptions(
        res?.data?.data?.map(({ code, description }: API.LocalClassification) => ({
          value: code,
          label: `${code} - ${description}`,
        })) ?? [],
      );
    } catch {
      message.error('Failed to load classification options');
    }
  };

  const fetchUoms = async () => {
    if (uomOptions.length) return;
    try {
      const res = await getUoms({});
      setUomOptions(
        res?.data?.data?.map(({ code, description }: API.SellerUOM) => ({
          value: code,
          label: `${code} - ${description}`,
        })) ?? [],
      );
    } catch {
      message.error('Failed to load UOM options');
    }
  };

  const fetchMsic = async () => {
    if (msicOptions.length) return;
    try {
      const res = await getMsicCodes();
      setMsicOptions(res?.data?.data ?? []);
    } catch {
      message.error('Failed to load MSIC options');
    }
  };

  const fetchStates = async () => {
    if (stateOptions.length) return;
    try {
      const res = await getStateCodes();
      setStateOptions(res?.data?.data ?? []);
    } catch {
      message.error('Failed to load state options');
    }
  };

  const fetchSuppliers = async () => {
    if (supplierOptions.length) return;
    try {
      const res = await getSuppliers();
      setSupplierOptions(res?.data?.data ?? []);
    } catch {
      message.error('Failed to load supplier options');
    }
  };

  const fetchCurrency = async () => {
    if (currencyOptions.length) return;
    try {
      const res = await getCurrencyCodes();
      setCurrencyOptions(res?.data?.data ?? []);
    } catch {
      message.error('Failed to load currency options');
    }
  };

  const fetchInvoiceTypeOptions = async () => {
    if (invoiceTypeOptions.length) return;
    try {
      const res = await getInvoiceTypes();
      setInvoiceTypeOptions(
        res.data.data.filter(
          (type: { description: string }) =>
            !type.description.toLowerCase().includes('refund'),
        ) ?? [],
      );
    } catch {
      message.error('Failed to load invoice types');
    }
  };

  return {
    classificationOptions,
    uomOptions,
    msicOptions,
    stateOptions,
    supplierOptions,
    currencyOptions,
    invoiceTypeOptions,
    fetchClassifications,
    fetchUoms,
    fetchMsic,
    fetchStates,
    fetchSuppliers,
    fetchCurrency,
    fetchInvoiceTypeOptions,
  };
}
