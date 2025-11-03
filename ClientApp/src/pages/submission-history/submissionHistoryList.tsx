import { formatUtcToLocalDateTimeWithAmPm } from '@/helpers/dateFormatter';
import { exportInvoiceSubmissionHistory, generateInvoice, getInvoiceDocumentList } from '@/services/ant-design-pro/invoiceService';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useNavigate } from '@umijs/max';
import { Button, message, Modal, Form, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

const SubmissionHistoryList: React.FC = () => {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportForm] = Form.useForm();
  const navigate = useNavigate();

  const fetchInvoiceDocuments = async (params: {
    current?: number;
    pageSize?: number;
    issueDateFrom?: string;
    issueDateTo?: string;
    uuid?: string;
    documentStatus?: string;
  }) => {
    const { current, pageSize, issueDateFrom, issueDateTo, uuid, documentStatus } = params;

    try {
      const response = await getInvoiceDocumentList({
        pageNumber: current,
        pageSize: pageSize,
        status: true,
        documentStatus: documentStatus,
        uuid,
        issueDateFrom,
        issueDateTo,
      });

      if (response.data.succeeded) {
        return {
          data: response?.data.data || [],
          success: true,
          total: response?.data.totalCount || 0,
        };
      } else {
        message.error('Failed to fetch invoice document list.');
        return { data: [], total: 0, success: false };
      }
    } catch (error) {
      message.error('Error fetching invoice document list.');
      return { data: [], total: 0, success: false };
    }
  };

  const generatePdfInvoice = async (uuid: string) => {
    try {
      const response = await generateInvoice(uuid, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${uuid}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      message.success('Invoice generated successfully.');
    } catch (error) {
      message.error('Failed to generate invoice.');
    }
  };

  const handleDownload = async (id: string) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      await generatePdfInvoice(id);
    } finally {
      setLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleExportExcel = async (filters?: any) => {
    setExportLoading(true);
    try {
      const params: any = {};
      if (filters) {
        if (filters.issueDateRange) {
          params.issueDateFrom = dayjs(filters.issueDateRange[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
          params.issueDateTo = dayjs(filters.issueDateRange[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
        }
        if (filters.documentStatus) {
          params.documentStatus = filters.documentStatus;
        }
      }
      const response = await exportInvoiceSubmissionHistory(params, {
        responseType: 'blob',
      });

      const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_submission_history_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      message.success('Submission history exported successfully.');
    } catch (error) {
      message.error('Failed to export submission history.');
    } finally {
      setExportLoading(false);
    }
  };

  const columns: ProColumns<API.InvoiceDocument>[] = [
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      render: (dom: any) => (
        <a
          onClick={async () => {
            navigate(`/submission-history/${dom}`);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: 'Issue Date Range',
      dataIndex: 'issueDateRange',
      valueType: 'dateRange',
      hideInTable: true,
      formItemProps: {
        rules: [
          {
            validator: (_, value) => {
              if (!value || value.length !== 2) {
                return Promise.reject('Please select both start and end dates');
              }
              return Promise.resolve();
            },
          },
        ],
      },
      fieldProps: {
        format: 'YYYY-MM-DD',
      },
      transform: (value: any) => {
        if (value && value.length === 2) {
          return {
            issueDateFrom: dayjs(value[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ'),
            issueDateTo: dayjs(value[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ'),
          };
        }
        return {};
      },
    },
    {
      title: 'Invoice Number',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      search: false,
    },
    {
      title: 'Supplier TIN',
      dataIndex: ['supplier', 'tin'],
      key: 'supplierTin',
      search: false,
      hideInTable: true,
    },
    {
      title: 'Supplier Name',
      dataIndex: ['supplier', 'name'],
      key: 'supplierName',
      ellipsis: true,
      search: false,
    },
    {
      title: 'Buyer TIN',
      dataIndex: ['customer', 'tin'],
      key: 'buyerTin',
      search: false,
      hideInTable: true,
    },
    {
      title: 'Buyer Name',
      dataIndex: ['customer', 'name'],
      key: 'buyerName',
      ellipsis: true,
      search: false,
    },
    {
      title: 'Currency',
      dataIndex: 'documentCurrencyCode',
      key: 'documentCurrencyCode',
      search: false,
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      valueType: 'money',
      align: 'right',
      search: false,
      render: (_, record) => {
        const amount = record.totalAmount ?? 0;
        const currencyCode = record.documentCurrencyCode ?? 'USD';

        if (currencyCode === 'MYR') {
          return `RM${amount.toLocaleString('en-MY', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        }

        return amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          style: 'currency',
          currency: currencyCode,
        });
      },
    },
    {
      title: 'Status',
      dataIndex: 'documentStatus',
      key: 'documentStatus',
      valueEnum: {
        Valid: { text: 'Valid', status: 'Success' },
        Invalid: { text: 'Invalid', status: 'Error' },
        Cancelled: { text: 'Cancelled', status: 'Error' },
        Submitted: { text: 'Submitted', status: 'Processing' },
      },
    },
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      valueType: 'date',
      search: false,
      render: (_: any, record: any) => {
        return record.issueDate ? formatUtcToLocalDateTimeWithAmPm(record.issueDate) : '';
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: 150,
      fixed: 'right',
      search: false,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            key="view"
            type="primary"
            onClick={() => navigate(`/submission-history/${record.uuid}`)}
          >
            View Details
          </Button>
          {record.documentStatus === 'Valid' && (
            <Button
              key="pdf"
              loading={loadingIds.includes(record.uuid)}
              onClick={() => handleDownload(record.uuid)}
            >
              PDF
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ProTable<API.InvoiceDocument, API.InvoiceDocument>
        columns={columns}
        request={async (params) => {
          const response = await fetchInvoiceDocuments(params);
          return {
            data: response.data,
            success: response.success,
            total: response.total,
          };
        }}
        scroll={{ x: 'max-content' }}
        rowKey="uuid"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="E-Invoice Transactions"
        toolBarRender={() => [
          <Button key="primary" onClick={() => setExportModalVisible(true)}>
            <FormattedMessage id="pages.invoice.export" />
          </Button>,
        ]}
      />
      <Modal
        title="Export Submission History"
        open={exportModalVisible}
        onCancel={() => {
          setExportModalVisible(false);
          exportForm.resetFields();
        }}
        onOk={async () => {
          try {
            const values = await exportForm.validateFields();
            setExportModalVisible(false);
            handleExportExcel(values);
            exportForm.resetFields();
          } catch {
            // validation error
          }
        }}
        confirmLoading={exportLoading}
        okText="Export"
        destroyOnClose
      >
        <Form form={exportForm} layout="vertical">
          <Form.Item label="Issue Date Range" name="issueDateRange">
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Status" name="documentStatus">
            <Select allowClear placeholder="Select Status" mode="multiple">
              <Select.Option value="Valid">Valid</Select.Option>
              <Select.Option value="Invalid">Invalid</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
              <Select.Option value="Submitted">Submitted</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SubmissionHistoryList;
