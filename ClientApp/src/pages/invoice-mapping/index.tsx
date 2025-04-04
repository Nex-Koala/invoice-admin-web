import {
  getCreditDebitNotes,
  getInvoiceTypes,
  getPurchaseCreditDebitNotes,
  getPurchaseInvoices,
  getSalesInvoices,
  submitInvoice,
} from '@/services/ant-design-pro/invoiceService';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Modal, Select, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useRef, useState } from 'react';

dayjs.extend(customParseFormat);

interface InvoiceData {
  invnumber: string;
  invdate: number;
  insourcurr: string;
  invnetwtx: number;
  invitaxtot: number;
  bilname?: string; // Buyer/Supplier Name
  biladdR1?: string; // Buyer/Supplier Address
  biladdR2?: string; // Buyer/Supplier Address
  biladdR3?: string; // Buyer/Supplier Address
  biladdR4?: string; // Buyer/Supplier Address
  bilstate?: string;
  bilzip?: string;
  bilcountry?: string;
  vdname?: string; // Vendor/Supplier Name
  vdaddresS1?: string; // Vendor Address
  vdaddresS2?: string; // Vendor Address
  vdaddresS3?: string; // Vendor Address
  vdaddresS4?: string; // Vendor Address
  scamount?: number; // Total Payable (for purchase)
  orderEntryDetails?: OrderEntryDetail[];
  purchaseInvoiceDetails?: PurchaseInvoiceDetail[];
}

interface OrderEntryDetail {
  desc: string;
  unitprice: number;
  qtyshipped: number;
  invunit: string;
  extinvmisc: number;
}

interface PurchaseInvoiceDetail {
  itemdesc: string;
  unitcost: number;
  rqreceived: number;
  rcpunit: string;
  extended: number;
}

interface TableData {
  data: InvoiceData[];
  success: boolean;
  total: number;
}

interface InvoiceType {
  code: string;
  description: string;
}

const InvoiceSubmission: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<InvoiceData | undefined>();
  const [selectedRowsState, setSelectedRows] = useState<InvoiceData[]>([]);
  const [tableData, setTableData] = useState<TableData>({ data: [], success: false, total: 0 });
  const [invoiceType, setInvoiceType] = useState<InvoiceType[]>([]);
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<string>('01');
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState<boolean>(false);

  const columns: ProColumns<InvoiceData>[] = [
    {
      title: 'Invoice Number',
      dataIndex: 'invnumber',
      render: (dom, entity) => (
        <a
          onClick={() => {
            setCurrentRow(entity);
            setShowDetail(true);
          }}
        >
          {dom}
        </a>
      ),
    },
    { title: 'e-Invoice Code', dataIndex: 'uuid' },
    {
      title: selectedInvoiceType === '11' ? 'Supplier Name' : 'Buyer Name',
      dataIndex: selectedInvoiceType === '11' ? 'vdname' : 'bilname',
    },
    {
      title: 'Invoice Date',
      dataIndex: selectedInvoiceType === '01' ? 'invdate' : 'date',
      render: (date) => dayjs(date?.toString(), 'YYYYMMDD').format('YYYY-MM-DD'),
    },
    {
      title: 'Currency',
      dataIndex: selectedInvoiceType === '11' ? 'currency' : 'insourcurr',
    },
    {
      title: 'Total Payable Amount',
      dataIndex: selectedInvoiceType === '11' ? 'scamount' : 'invnetwtx',
      render: (_, record) => {
        const amount = record[selectedInvoiceType === '11' ? 'scamount' : 'invnetwtx'];
        return `${amount?.toFixed(2)}`.replace(/,/g, '');
      },
    },
    {
      title: 'Actions',
      valueType: 'option',
      render: (_, record) => [
        <a key="submit" onClick={() => handleInvoiceSubmission(record)}>
          Submit
        </a>,
      ],
    },
  ];

  const fetchDataBasedOnInvoiceType = async (
    type: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<void> => {
    setLoading(true);
    const fetchMap: { [key: string]: Function } = {
      '01': getSalesInvoices,
      '02': getCreditDebitNotes,
      '03': getCreditDebitNotes,
      '11': getPurchaseInvoices,
      '12': getPurchaseCreditDebitNotes,
      '13': getPurchaseCreditDebitNotes,
    };

    const fetchFunction = fetchMap[type];
    if (!fetchFunction) {
      message.warning('Invalid invoice type selected.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetchFunction({ page, pageSize });
      console.log('API Response:', response.data); // Debugging log
      setTableData({
        data: response.data?.data || [],
        success: true,
        total: response.data?.totalItems || 0,
      });
    } catch (error) {
      console.error('Fetch Error:', error);
      message.error('Failed to fetch data for the selected invoice type.');
      setTableData({ data: [], success: false, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const invoiceTypeOptions = await getInvoiceTypes();
        setInvoiceType(
          invoiceTypeOptions.data.data.filter(
            (type) => !type.description.toLowerCase().includes('refund'), // Exclude refund
          ),
        );
        await fetchDataBasedOnInvoiceType(selectedInvoiceType);
      } catch {
        message.error('Failed to load initial data.');
      }
    };
    loadInitialData();
  }, [selectedInvoiceType]);

  const calculateDueDate = (record: InvoiceData): Dayjs => {
    if (record.terms.endsWith('D')) {
      return dayjs(record.invdate, 'YYYYMMDD').add(
        parseInt(record.terms.replace('D', ''), 10),
        'day',
      );
    }
    if (record.terms.endsWith('M')) {
      return dayjs(record.invdate, 'YYYYMMDD').add(
        parseInt(record.terms.replace('M', ''), 10),
        'month',
      );
    }
    throw new Error('Invalid payment terms format. Must end with "D" or "M".');
  };

  const renderProDescriptions = (record: InvoiceData) => {
    const isSalesInvoice = selectedInvoiceType === '01';
    const isPurchaseInvoice = selectedInvoiceType === '11';
    const isSelfBilledInvoice = selectedInvoiceType === '02';

    // Common columns for all invoice types
    const commonColumns: ProColumns<InvoiceData>[] = [
      { title: 'Invoice Number', dataIndex: 'invnumber' },
      {
        title: isPurchaseInvoice ? 'Supplier Name' : 'Buyer Name',
        dataIndex: isPurchaseInvoice ? 'vdname' : 'bilname',
      },
      {
        title: 'Total Amount',
        dataIndex: selectedInvoiceType === '01' ? 'invnetwtx' : 'scamount',
        render: (_, record) => {
          const amount = record[selectedInvoiceType === '01' ? 'invnetwtx' : 'scamount'];
          return `${amount?.toFixed(2)}`.replace(/,/g, '');
        },
      },
      { title: 'Currency', dataIndex: selectedInvoiceType === '01' ? 'insourcurr' : 'currency' },
      {
        title: 'Invoice Date',
        dataIndex: selectedInvoiceType === '01' ? 'invdate' : 'date',
        render: (date) => dayjs(date?.toString(), 'YYYYMMDD').format('YYYY-MM-DD'),
      },
      { title: 'Terms', dataIndex: 'terms' },
      { title: 'Customer TIN', dataIndex: 'customerTIN' },
      {
        title: 'Address',
        render: (_, data) =>
          selectedInvoiceType === '01'
            ? `${data.biladdR1 || ''} ${data.biladdR2 || ''} ${data.biladdR3 || ''} ${data.biladdR4 || ''}  ${data.bilstate || ''} ${data.bilzip || ''}, ${
                data.bilcountry || ''
              }`
            : `${data.vdaddresS1 || ''} ${data.vdaddresS2 || ''} ${data.vdaddresS3 || ''} ${data.vdaddresS4 || ''}`,
      },
    ];

    // Additional columns for Sales and Self-Billed Invoices
    const salesColumns: ProColumns<InvoiceData>[] = [
      {
        title: 'Order Entry Details',
        dataIndex: 'orderEntryDetails',
        render: (_, record) =>
          record.orderEntryDetails?.map((item, index) => (
            <div key={index}>
              <strong>Item {index + 1}:</strong>
              <div>Description: {item.desc}</div>
              <div>Quantity: {item.qtyshipped}</div>
              <div>Unit: {item.invunit}</div>
              <div>Unit Price: {item.unitprice?.toFixed(2)}</div>
              <div>Total: {item.extinvmisc?.toFixed(2)}</div>
            </div>
          )),
      },
    ];

    // Additional columns for Purchase Invoices
    const purchaseColumns: ProColumns<InvoiceData>[] = [
      {
        title: 'Purchase Invoice Details',
        dataIndex: 'purchaseInvoiceDetails',
        render: (_, record) =>
          record.purchaseInvoiceDetails?.map((item, index) => (
            <div key={index}>
              <strong>Item {index + 1}:</strong>
              <div>Description: {item.itemdesc}</div>
              <div>Unit Cost: {item.unitcost?.toFixed(2)}</div>
              <div>Extended: {item.extended?.toFixed(2)}</div>
              <div>Received Quantity: {item.rqreceived}</div>
              <div>Tax Rate: {item.taxratE1?.toFixed(2)}</div>
              <div>Discount: {item.discpct?.toFixed(2)}</div>
            </div>
          )),
      },
    ];

    const selectedColumns = [
      ...commonColumns,
      ...(isSalesInvoice || isSelfBilledInvoice ? salesColumns : []),
      ...(isPurchaseInvoice ? purchaseColumns : []),
    ];
    return (
      <ProDescriptions<InvoiceData>
        column={2}
        title={`Invoice Details: ${record.invnumber}`}
        dataSource={record}
        columns={selectedColumns}
      />
    );
  };

  const handleInvoiceSubmission = async (record: InvoiceData) => {
    const dueDate = calculateDueDate(record);
    const payload = {
      ...record,
      dueDate: dueDate.format('YYYY-MM-DD'),
    };

    Modal.confirm({
      title: 'Confirm Submission',
      onOk: async () => {
        try {
          const response = await submitInvoice(payload);
          if (response.status) {
            message.success('Invoice submitted successfully.');
          } else {
            throw new Error('Submission failed');
          }
        } catch {
          message.error('Failed to submit the invoice.');
        }
      },
    });
  };

  return (
    <PageContainer>
      <ProTable<InvoiceData>
        actionRef={actionRef}
        rowKey="invnumber"
        search={{ labelWidth: 'auto' }}
        dataSource={tableData.data}
        pagination={{
          total: tableData.total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (page, pageSize) =>
            fetchDataBasedOnInvoiceType(selectedInvoiceType, page, pageSize),
        }}
        loading={loading}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        headerTitle={
          <Space>
            <span>Document Mapping Table</span>
            <Select<string>
              value={selectedInvoiceType}
              onChange={(value) => setSelectedInvoiceType(value)}
              style={{ width: 180 }}
              options={invoiceType
                .filter((data) => !data.description.toLowerCase().includes('refund')) // Exclude refund types
                .map((data) => ({
                  value: data.code,
                  label: data.description,
                }))}
            />
          </Space>
        }
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar>
          <div>
            Selected <strong>{selectedRowsState.length}</strong> items &nbsp;&nbsp;
            <span>
              Total Invoice Value:{' '}
              {selectedRowsState.reduce((sum, item) => sum + item.invnetwtx, 0)}
            </span>
          </div>
          <Button onClick={() => setSelectedRows([])}>Batch submission</Button>
        </FooterToolbar>
      )}
      <Drawer width={800} open={showDetail} onClose={() => setShowDetail(false)} closable={false}>
        {currentRow && renderProDescriptions(currentRow)}
      </Drawer>
    </PageContainer>
  );
};

export default InvoiceSubmission;
