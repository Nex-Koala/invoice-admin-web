import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getClassifications } from '@/services/ant-design-pro/classificationService';
import { getMsicCodes, getStateCodes } from '@/services/ant-design-pro/invoiceService';
import { getSuppliers } from '@/services/ant-design-pro/supplierService';
import { getUoms } from '@/services/ant-design-pro/uomService';

export interface OptionsState {
  classificationOptions: [];
  uomOptions: [];
  msicOptions: API.MSICOption[];
  stateOptions: API.StateOption[];
  supplierOptions: API.DocumentSupplier[];
}

export function useOptionsModel() {
  const [classificationOptions, setClassificationOptions] = useState<[]>([]);
  const [uomOptions, setUomOptions] = useState<[]>([]);
  const [msicOptions, setMsicOptions] = useState<API.MSICOption[]>([]);
  const [stateOptions, setStateOptions] = useState<API.StateOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<API.DocumentSupplier[]>([]);

  const fetchClassifications = async () => {
    if (classificationOptions.length) return; // already fetched
    try {
      const res = await getClassifications({});
      setClassificationOptions(
        res?.data?.data?.map(({ code, description }: API.LocalClassification) => ({
          value: code,
          label: `${code} - ${description}`,
        })) ?? []
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
        })) ?? []
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
    console.log(stateOptions.length)
    console.log(stateOptions)
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

  return {
    classificationOptions,
    uomOptions,
    msicOptions,
    stateOptions,
    supplierOptions,
    fetchClassifications,
    fetchUoms,
    fetchMsic,
    fetchStates,
    fetchSuppliers,
  };
}
