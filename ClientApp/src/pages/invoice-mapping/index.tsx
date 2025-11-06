import { submitInvoice } from '@/services/ant-design-pro/invoiceService';
import type { ActionType } from '@ant-design/pro-components';
import { FooterToolbar, PageContainer, ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Drawer, List, message, Modal, Select, Space } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import { buildInvoicePayload } from './utils/buildInvoicePayload';
import { getInvoiceColumns } from './utils/columns';
import { InvoiceData } from './utils/invoiceData';
import { calculateDueDate, calculateTotalInvoiceValue } from './utils/invoiceHelperFunctions';
import { renderProDescriptions } from './utils/proDescriptions';
import { fetchDataBasedOnInvoiceType, fetchUserProfile } from './utils/useInvoiceData';
import PreviewForm from './components/PreviewForm';

dayjs.extend(customParseFormat);

interface TableData {
  data: InvoiceData[];
  success: boolean;
  total: number;
}

const InvoiceSubmission: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<InvoiceData | undefined>();
  const [selectedRowsState, setSelectedRows] = useState<InvoiceData[]>([]);
  const [tableData, setTableData] = useState<TableData>({ data: [], success: false, total: 0 });

  const [selectedInvoiceType, setSelectedInvoiceType] = useState<string>('01');
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewPayload, setPreviewPayload] = useState<API.SubmitInvoiceRequest[]>([]);
  const [manualSubmission, setManualSubmission] = useState<boolean>(false);

  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const email = currentUser?.email ?? '';
  const [profileData, setProfileData] = useState<API.ProfileItem>();
  const { invoiceTypeOptions, fetchInvoiceTypeOptions } = useModel('options');

  useEffect(() => {
    if (!profileData && email) {
      fetchUserProfile(email, setProfileData, setLoading);
    }
  }, [email]);

  useEffect(() => {
    fetchInvoiceTypeOptions();
  }, []);

  const handleInvoiceSubmission = async (records: InvoiceData | InvoiceData[]) => {
    if (!profileData?.tin) {
      Modal.error({
        title: 'Incomplete Profile',
        content: 'Please configure your profile before submission.',
        onOk: () => {
          history.push('/account');
        },
      });
      return;
    }
    const recordsArray = Array.isArray(records) ? records : [records];
    const requests = recordsArray
      .map((record) => {
        const dueDate = calculateDueDate(record.terms, `${record.invdate}`);
        const payload = {
          ...record,
          dueDate: dueDate !== null ? dueDate.format('YYYY-MM-DD') : null,
        };
        return buildInvoicePayload(selectedInvoiceType, payload, profileData);
      })
      .filter(Boolean);

    setPreviewPayload(requests as API.SubmitInvoiceRequest[]);
    setShowPreview(true);
  };

  const confirmSubmission = async (request: API.SubmitInvoiceRequest[]) => {
    Modal.confirm({
      title: 'Confirm Submission',
      onOk: async () => {
        try {
          const response = await submitInvoice({
            invoices: request
          });
          if (response.status) {
            if (response.data.succeeded) {
              message.success(response.data.message || 'Invoice submitted successfully.');
            } else {
              const errorList = response.data.errors;

              if (Array.isArray(errorList) && errorList.length > 0) {
                Modal.error({
                  title: response.data.message || 'Failed to submit invoice',
                  content: (
                    <List
                      size="small"
                      dataSource={errorList}
                      renderItem={(item) => (
                        <List.Item style={{ paddingLeft: 0 }}>• {item}</List.Item>
                      )}
                    />
                  ),
                });
              } else {
                message.error(response.data.message || 'Failed to submit invoice');
              }
            }
            setShowPreview(false);
            setSelectedRows([]);
            setManualSubmission(false);
            actionRef.current?.reload();
          } else {
            throw new Error('Submission failed');
          }
        } catch (err: any) {
          message.error(err?.response?.data.message ?? 'Failed to submit the invoice.');
        }
      },
    });
  }

  const columns = getInvoiceColumns(
    selectedInvoiceType,
    setCurrentRow,
    setShowDetail,
    handleInvoiceSubmission,
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setTableData({ data: [], success: true, total: 0 });
        await fetchDataBasedOnInvoiceType({
          type: selectedInvoiceType,
          setLoading,
          setTableData,
        });
      } catch {
        message.error('Failed to load initial data.');
      }
    };
    actionRef.current?.reload();
    loadInitialData();
  }, [selectedInvoiceType]);

  return (
    <PageContainer
      header={{
        extra: [
          <Button key="1"
            type="primary"
            onClick={() => {
              setShowPreview(true);
              setManualSubmission(true);
            }}>
            Manual Submission
          </Button>]
      }}>
      <ProTable<InvoiceData>
        actionRef={actionRef}
        rowKey={(record) => {
          switch (selectedInvoiceType) {
            case '01':
              return record.invuniq ?? `fallback_${record.invnumber}`;
            case '02':
            case '03':
              return record.crduniq ?? `fallback_${record.invnumber}`;
            case '11':
              return record.invhseq ?? `fallback_${record.invnumber}`;
            case '12':
            case '13':
              return record.crnhseq ?? `fallback_${record.invnumber}`;
            default:
              return `${record.invnumber}_${Math.random()}`;
          }
        }}
        search={{ labelWidth: 'auto' }}
        dataSource={tableData.data}
        request={async (params, sorter, filter) => {
          return await fetchDataBasedOnInvoiceType({
            type: selectedInvoiceType,
            page: params.current,
            pageSize: params.pageSize,
            searchParams: {
              invoiceNumber: params.invnumber,
              buyerName: params.bilname,
              supplierName: params.vdname,
              invoiceDateFrom: params.invoiceDateFrom,
              invoiceDateTo: params.invoiceDateTo,
            },
            setLoading,
            setTableData,
          });
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
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
              options={invoiceTypeOptions
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
              {calculateTotalInvoiceValue(selectedRowsState, selectedInvoiceType)}
            </span>
          </div>
          <Button
            onClick={() => handleInvoiceSubmission(selectedRowsState)}
          >
            Batch submission
          </Button>
        </FooterToolbar>
      )}
      <Drawer width={800} open={showDetail} onClose={() => setShowDetail(false)} closable={false}>
        {currentRow && renderProDescriptions(selectedInvoiceType, currentRow)}
      </Drawer>
      <PreviewForm
        isOpen={showPreview}
        submitInvoiceRequests={previewPayload}
        onCancel={() => {
          setShowPreview(false)
          setTimeout(() => setPreviewPayload([]), 300);
          setTimeout(() => setManualSubmission(false), 300);
        }}
        onFinish={confirmSubmission}
        manual={manualSubmission}
      />
    </PageContainer>
  );
};

export default InvoiceSubmission;
