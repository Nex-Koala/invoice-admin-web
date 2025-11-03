import React, { useEffect, useState } from 'react';
import ProForm, {
    ProFormText,
    ProFormGroup,
    ProFormDigit,
    ProFormSelect,
    ProFormDatePicker,
    DrawerForm,
} from '@ant-design/pro-form';
import { Form, Select, Table, Input, Col, Row, Divider, message } from 'antd';
import { getCountryCodeOptions } from '@/helpers/countryCodeConverter';
import { getInvoiceTypeOptions, normalizeDate } from '../utils/invoiceHelperFunctions';
import { ProCard } from '@ant-design/pro-components';
import { useOptionsModel } from '@/models/useOptionsModel';

type PreviewFormProps = {
    isOpen: boolean;
    submitInvoiceRequests: API.SubmitInvoiceRequest[];
    onCancel: () => void;
    onFinish: (data: API.SubmitInvoiceRequest[]) => Promise<void>;
};

const PreviewForm: React.FC<PreviewFormProps> = ({
    isOpen,
    submitInvoiceRequests,
    onCancel,
    onFinish,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [errorCards, setErrorCards] = useState<number[]>([]);
    const {
        classificationOptions,
        uomOptions,
        msicOptions,
        stateOptions,
        supplierOptions,
        fetchClassifications,
        fetchUoms,
        fetchMsic,
        fetchStates,
        fetchSuppliers
    } = useOptionsModel();

    const getMsicSelectOptions = () =>
        msicOptions.map((option) => ({
            label: `${option.code} - ${option.description}`,
            value: option.code,
        }));

    const getStateSelectOptions = () =>
        stateOptions.map((option) => ({
            label: option.state,
            value: option.code,
        }));

    useEffect(() => {
        fetchClassifications();
        fetchUoms();
        fetchMsic();
        fetchStates();
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (isOpen && submitInvoiceRequests.length > 0) {
            form.setFieldsValue({ invoices: submitInvoiceRequests });
        }
    }, [isOpen, submitInvoiceRequests]);

    const handleSupplierChange = (supplierId: string, invoiceIndex: number) => {
        const supplier = supplierOptions.find(s => s.id === supplierId);
        if (!supplier) return;
        form.setFields([
            { name: ['invoices', invoiceIndex, 'supplierName'], value: supplier.name },
            { name: ['invoices', invoiceIndex, 'supplierTIN'], value: supplier.tin },
            { name: ['invoices', invoiceIndex, 'supplierIdType'], value: supplier.idType },
            { name: ['invoices', invoiceIndex, 'supplierBRN'], value: supplier.brn },
            { name: ['invoices', invoiceIndex, 'supplierSST'], value: supplier.sstRegistrationNumber },
            { name: ['invoices', invoiceIndex, 'supplierTTX'], value: supplier.taxTourismRegistrationNumber },
            { name: ['invoices', invoiceIndex, 'supplierIndustryCode'], value: supplier.msicCode },
            { name: ['invoices', invoiceIndex, 'supplierBusinessActivityDescription'], value: supplier.businessActivityDescription },
            { name: ['invoices', invoiceIndex, 'supplierTelephone'], value: supplier.contactNumber },
            { name: ['invoices', invoiceIndex, 'supplierEmail'], value: supplier.email },
            { name: ['invoices', invoiceIndex, 'supplierAddressLine1'], value: supplier.address1 },
            { name: ['invoices', invoiceIndex, 'supplierAddressLine2'], value: supplier.address2 },
            { name: ['invoices', invoiceIndex, 'supplierAddressLine3'], value: supplier.address3 },
            { name: ['invoices', invoiceIndex, 'supplierCity'], value: supplier.city },
            { name: ['invoices', invoiceIndex, 'supplierPostalCode'], value: supplier.postalCode },
            { name: ['invoices', invoiceIndex, 'supplierCountrySubentityCode'], value: supplier.state },
            { name: ['invoices', invoiceIndex, 'supplierCountryCode'], value: supplier.countryCode },
        ]);
    };

    return (
        <DrawerForm
            title={`Submission Preview (${submitInvoiceRequests.length} Invoice${submitInvoiceRequests.length > 1 ? 's' : ''})`}
            open={isOpen}
            initialValues={{
                invoices: submitInvoiceRequests
            }}
            drawerProps={{
                destroyOnClose: true,
                onClose: onCancel,
            }}
            form={form}
            width="90%"
            layout="vertical"
            loading={loading}
            onFinish={async (values) => {
                const transformed = (values.invoices as API.SubmitInvoiceRequest[]).map(inv => ({
                    ...inv,
                    startDate: inv.startDate ?? '',
                    endDate: inv.endDate ?? '',
                }));
                await onFinish(transformed);
                return true;
            }}
            onFinishFailed={({ errorFields }) => {
                if (errorFields && errorFields.length > 0) {
                    // Find all invoice indices with errors
                    const errorIndexes = errorFields
                        .map(f => Array.isArray(f.name) && f.name[1])
                        .filter(idx => typeof idx === 'number');
                    setErrorCards(Array.from(new Set(errorIndexes)));
                    form.scrollToField(errorFields[0].name, { behavior: 'smooth', block: 'center' });
                } else {
                    setErrorCards([]);
                }
            }}
        >
            <div
                style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                }}
            >
                <div
                    id="drawer-content"
                    style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'auto',
                        maxHeight: '80vh',
                    }}
                >
                    <Form.List name="invoices">
                        {(invoiceFields) => (
                            <>
                                {invoiceFields.map(({ name, key }, index) => (
                                    <div id={`invoice-${index}`} key={key} style={{ scrollMarginTop: 24 }}>
                                        <ProCard
                                            key={key}
                                            title={`Invoice #${submitInvoiceRequests[index]?.irn ?? index + 1}`}
                                            collapsible
                                            defaultCollapsed={index !== 0}
                                            style={{
                                                marginBottom: 16,
                                                borderColor: errorCards.includes(index) ? 'red' : undefined,
                                                borderStyle: errorCards.includes(index) ? 'solid' : undefined,
                                            }}
                                            bordered
                                        >
                                            <Divider orientation="left" orientationMargin="0">Invoice Info</Divider>
                                            <ProFormGroup>
                                                <Row gutter={16}>
                                                    <Col xs={24} sm={12} md={8}><ProFormText name={[name, 'irn']} label="Invoice Number" disabled /></Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormSelect
                                                            name={[name, 'invoiceTypeCode']}
                                                            label="Type Code"
                                                            options={getInvoiceTypeOptions()}
                                                            placeholder="Select Type Code"
                                                            disabled
                                                        />
                                                    </Col>

                                                    <Col xs={24} sm={12} md={8}><ProFormText name={[name, 'currencyCode']} label="Currency" disabled /></Col>
                                                </Row>
                                            </ProFormGroup>

                                            <Divider orientation="left" orientationMargin="0">Supplier Info</Divider>
                                            <ProForm.Item
                                                shouldUpdate={(prev, curr) =>
                                                    prev.invoices?.[name]?.invoiceTypeCode !== curr.invoices?.[name]?.invoiceTypeCode
                                                }
                                                noStyle
                                            >
                                                {({ getFieldValue }) => {
                                                    const type = getFieldValue(['invoices', name, 'invoiceTypeCode']);
                                                    if (['11', '12', '13', '14'].includes(type)) {
                                                        return (
                                                            <ProFormSelect
                                                                name={[name, 'supplierId']}
                                                                label="Select supplier from previous submission"
                                                                showSearch
                                                                options={supplierOptions.map(s => ({
                                                                    label: s.name,
                                                                    value: s.id,
                                                                }))}
                                                                fieldProps={{
                                                                    onChange: (value: any) => handleSupplierChange(value, name),
                                                                }}
                                                                placeholder="Select a supplier"
                                                            />
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            </ProForm.Item>
                                            <ProFormGroup>
                                                <Row gutter={16}>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierName']}
                                                            label="Name"
                                                            rules={[{ required: true, message: 'Supplier Name is required' }]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierTIN']}
                                                            label="TIN"
                                                            rules={[{ required: true, message: 'TIN is required' }]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormSelect
                                                            name={[name, 'supplierIdType']}
                                                            label="ID Type"
                                                            options={[
                                                                { label: 'BRN', value: 'BRN' },
                                                                { label: 'NRIC', value: 'NRIC' },
                                                                { label: 'PASSPORT', value: 'PASSPORT' },
                                                                { label: 'ARMY', value: 'ARMY' },
                                                            ]}
                                                            rules={[{ required: true, message: 'Please select an ID type!' }]}
                                                            fieldProps={{
                                                                onChange: () => {
                                                                    form.validateFields([[name, 'supplierBRN']]);
                                                                },
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierBRN']}
                                                            label="Registration / Identification / Passport Number"
                                                            rules={[
                                                                { required: true, message: 'Please enter the registration number!' },
                                                                () => ({
                                                                    validator(_, value) {
                                                                        const formValues = form.getFieldsValue();
                                                                        const schemeID = formValues.invoices?.[name]?.customerIdType;

                                                                        if (!schemeID) return Promise.resolve();

                                                                        if (schemeID === 'BRN' && value && value.length <= 20) return Promise.resolve();
                                                                        if (['NRIC', 'PASSPORT', 'ARMY'].includes(schemeID) && value && value.length == 12)
                                                                            return Promise.resolve();
                                                                        return Promise.reject(
                                                                            new Error(
                                                                                schemeID === 'BRN' ? 'BRN max 20 chars!' : 'ID max 12 chars!',
                                                                            ),
                                                                        );
                                                                    },
                                                                }),
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierSST']}
                                                            label="SST Reg. Number"
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierTTX']}
                                                            label="Tourism Tax Reg. No"
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormSelect
                                                            name={[name, 'supplierIndustryCode']}
                                                            label="MSIC Code"
                                                            options={getMsicSelectOptions()}
                                                            showSearch
                                                            rules={[
                                                                { required: true, message: 'Industry Code is required' },
                                                                { pattern: /^\d{5}$/, message: 'Must be a 5-digit MSIC code' },
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierBusinessActivityDescription']}
                                                            label="Activity"
                                                            rules={[{ required: true, message: 'Business Activity is required' }]}
                                                        />
                                                    </Col>

                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierTelephone']}
                                                            label="Contact"
                                                            rules={[
                                                                { required: true, message: 'Phone number is required' },
                                                                { pattern: /^\+?\d+$/, message: 'Invalid phone number format' },
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierEmail']}
                                                            label="Email"
                                                            rules={[
                                                                { type: 'email', message: 'Invalid email address' },
                                                            ]}
                                                            normalize={(value) => value ?? ''}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierAddressLine1']}
                                                            label="Address Line 1"
                                                            rules={[{ required: true, message: 'Address Line 1 is required' }]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierAddressLine2']}
                                                            label="Address Line 2"
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierAddressLine3']}
                                                            label="Address Line 3"
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierCity']}
                                                            label="City"
                                                            rules={[{ required: true, message: 'City is required' }]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'supplierPostalCode']}
                                                            label="Postal Code"
                                                            rules={[
                                                                { required: true, message: 'Postal Code is required' },
                                                                { pattern: /^\d{5}$/, message: 'Postal Code must be 5 digits' },
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProForm.Item shouldUpdate>
                                                            {({ getFieldValue }) => {
                                                                const countryCode = getFieldValue(['invoices', name, 'supplierCountryCode']);
                                                                const isMalaysia = countryCode === 'MYS';

                                                                return isMalaysia ? (
                                                                    <ProFormSelect
                                                                        name={[name, 'supplierCountrySubentityCode']}
                                                                        label="State"
                                                                        options={getStateSelectOptions()}
                                                                        showSearch
                                                                        rules={[{ required: true, message: 'State is required' }]}
                                                                    />
                                                                ) : (
                                                                    <ProFormText
                                                                        name={[name, 'supplierCountrySubentityCode']}
                                                                        label="State"
                                                                        placeholder="Enter state"
                                                                        rules={[{ required: true, message: 'State is required' }]}
                                                                    />
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    </Col>

                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormSelect
                                                            name={[name, 'supplierCountryCode']}
                                                            label="Country"
                                                            showSearch
                                                            options={getCountryCodeOptions()}
                                                            rules={[{ required: true, message: 'Country is required' }]}
                                                        />
                                                    </Col>
                                                </Row>

                                            </ProFormGroup>

                                            <Divider orientation="left" orientationMargin="0">Customer Info</Divider>
                                            <ProFormGroup>
                                                <Row gutter={16}>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerName']}
                                                            label="Name"
                                                            rules={[{ required: true, message: 'Customer name is required' }]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerTIN']}
                                                            label="TIN"
                                                            rules={[
                                                                { required: true, message: 'TIN is required' },
                                                                { pattern: /^[A-Z0-9]{6,20}$/, message: 'TIN must be alphanumeric and 6-20 characters long' },
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormSelect
                                                            name={[name, 'customerIdType']}
                                                            label="ID Type"
                                                            options={[
                                                                { label: 'BRN', value: 'BRN' },
                                                                { label: 'NRIC', value: 'NRIC' },
                                                                { label: 'PASSPORT', value: 'PASSPORT' },
                                                                { label: 'ARMY', value: 'ARMY' },
                                                            ]}
                                                            rules={[{ required: true, message: 'Please select an ID type!' }]}
                                                            fieldProps={{
                                                                onChange: () => {
                                                                    form.validateFields([[name, 'customerBRN']]);
                                                                },
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerBRN']}
                                                            label="Registration / Identification / Passport Number"
                                                            rules={[
                                                                { required: true, message: 'Please enter the registration number!' },
                                                                () => ({
                                                                    validator(_, value) {
                                                                        const formValues = form.getFieldsValue();
                                                                        const schemeID = formValues.invoices?.[name]?.customerIdType;

                                                                        if (!schemeID) return Promise.resolve();

                                                                        if (schemeID === 'BRN' && value && value.length <= 20) return Promise.resolve();
                                                                        if (['NRIC', 'PASSPORT', 'ARMY'].includes(schemeID) && value && value.length == 12)
                                                                            return Promise.resolve();
                                                                        return Promise.reject(
                                                                            new Error(
                                                                                schemeID === 'BRN' ? 'BRN max 20 chars!' : 'ID max 12 chars!',
                                                                            ),
                                                                        );
                                                                    },
                                                                }),
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerSST']}
                                                            label="SST Reg. Number"
                                                        />
                                                    </Col>

                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerTelephone']}
                                                            label="Contact"
                                                            rules={[
                                                                { required: true, message: 'Phone is required' },
                                                                { pattern: /^[0-9+() -]{7,20}$/, message: 'Enter a valid phone number' },
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerEmail']}
                                                            label="Email"
                                                            rules={[
                                                                { type: 'email', message: 'Enter a valid email address' },
                                                            ]}
                                                            normalize={(value) => value ?? ''}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerAddressLine1']}
                                                            label="Address Line 1"
                                                            rules={[{ required: true, message: 'Address Line 1 is required' }]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerAddressLine2']}
                                                            label="Address Line 2"
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerAddressLine3']}
                                                            label="Address Line 3"
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerCity']}
                                                            label="City"
                                                            rules={[{ required: true, message: 'City is required' }]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormText
                                                            name={[name, 'customerPostalCode']}
                                                            label="Postal Code"
                                                            rules={[
                                                                { required: true, message: 'Postal code is required' },
                                                                { pattern: /^[0-9]{5}$/, message: 'Must be a 5-digit code' },
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProForm.Item shouldUpdate>
                                                            {({ getFieldValue }) => {
                                                                const countryCode = getFieldValue(['invoices', name, 'customerCountrySubentityCode']);
                                                                const isMalaysia = countryCode === 'MYS';

                                                                return isMalaysia ? (
                                                                    <ProFormSelect
                                                                        name={[name, 'customerCountrySubentityCode']}
                                                                        label="State"
                                                                        options={getStateSelectOptions()}
                                                                        showSearch
                                                                        rules={[{ required: true, message: 'State is required' }]}
                                                                    />
                                                                ) : (
                                                                    <ProFormText
                                                                        name={[name, 'customerCountrySubentityCode']}
                                                                        label="State"
                                                                        placeholder="Enter state"
                                                                        rules={[{ required: true, message: 'State is required' }]}
                                                                    />
                                                                );
                                                            }}
                                                        </ProForm.Item>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormSelect
                                                            name={[name, 'customerCountryCode']}
                                                            label="Country"
                                                            showSearch
                                                            options={getCountryCodeOptions()}
                                                            rules={[{ required: true, message: 'Country is required' }]}
                                                        />
                                                    </Col>
                                                </Row>
                                            </ProFormGroup>

                                            <Divider orientation="left" orientationMargin="0">Line Items</Divider>
                                            <Form.List name={[name, 'itemList']}>
                                                {(itemFields) => {
                                                    const columns = [
                                                        {
                                                            title: 'Classification',
                                                            dataIndex: 'classificationCode',
                                                            render: (_: any, __: any, index: number) => (
                                                                <ProFormSelect
                                                                    name={[index, 'classificationCode']}
                                                                    placeholder="Select"
                                                                    options={classificationOptions}
                                                                    showSearch
                                                                    rules={[
                                                                        { required: true, message: 'Classification Code is required' },
                                                                    ]}
                                                                    fieldProps={{
                                                                        style: { width: '100%' },
                                                                        getPopupContainer: () => document.body,
                                                                    }}
                                                                    noStyle
                                                                />
                                                            ),
                                                        },
                                                        {
                                                            title: 'Description',
                                                            dataIndex: 'description',
                                                            render: (_: any, __: any, index: number) => (
                                                                <ProFormText
                                                                    name={[index, 'description']}
                                                                    placeholder="Description"
                                                                    rules={[
                                                                        { required: true, message: 'Description is required' },
                                                                    ]}
                                                                    noStyle
                                                                />
                                                            ),
                                                        },
                                                        {
                                                            title: 'Qty',
                                                            dataIndex: 'qty',
                                                            render: (_: any, __: any, index: number) => (
                                                                <ProFormDigit
                                                                    name={[index, 'qty']}
                                                                    placeholder="Qty"
                                                                    min={0}
                                                                    rules={[
                                                                        { required: true, message: 'Quantity is required' },
                                                                    ]}
                                                                    noStyle
                                                                />
                                                            ),
                                                        },
                                                        {
                                                            title: 'Unit',
                                                            dataIndex: 'unit',
                                                            render: (_: any, __: any, index: number) => (
                                                                <ProFormSelect
                                                                    name={[index, 'unit']}
                                                                    placeholder="Select"
                                                                    options={uomOptions}
                                                                    showSearch
                                                                    rules={[
                                                                        { required: true, message: 'Unit is required' },
                                                                    ]}
                                                                    fieldProps={{
                                                                        style: { width: '100%' },
                                                                        getPopupContainer: () => document.body,
                                                                    }}
                                                                    noStyle
                                                                />
                                                            ),
                                                        },
                                                        {
                                                            title: 'Unit Price',
                                                            dataIndex: 'unitPrice',
                                                            render: (_: any, __: any, index: number) => (
                                                                <ProFormDigit
                                                                    name={[index, 'unitPrice']}
                                                                    placeholder="Unit Price"
                                                                    min={0}
                                                                    rules={[
                                                                        { required: true, message: 'Unit Price is required' },
                                                                    ]}
                                                                    noStyle
                                                                />
                                                            ),
                                                        },
                                                        {
                                                            title: 'Subtotal',
                                                            dataIndex: 'subtotal',
                                                            render: (_: any, __: any, index: number) => (
                                                                <ProFormDigit
                                                                    name={[index, 'subtotal']}
                                                                    placeholder="Subtotal"
                                                                    min={0}
                                                                    rules={[
                                                                        { required: true, message: 'Subtotal is required' },
                                                                    ]}
                                                                    noStyle
                                                                />
                                                            ),
                                                        },
                                                        {
                                                            title: 'Tax Amount',
                                                            dataIndex: 'taxAmount',
                                                            render: (_: any, __: any, index: number) => (
                                                                <ProFormDigit
                                                                    name={[index, 'taxAmount']}
                                                                    placeholder="Tax Amount"
                                                                    min={0}
                                                                    rules={[
                                                                        { required: true, message: 'Tax Amount is required' },
                                                                    ]}
                                                                    noStyle
                                                                />
                                                            ),
                                                        },
                                                        {
                                                            title: 'Taxable Amount',
                                                            dataIndex: 'taxableAmount',
                                                            render: (_: any, __: any, index: number) => (
                                                                <ProFormDigit
                                                                    name={[index, 'taxableAmount']}
                                                                    placeholder="Taxable Amount"
                                                                    min={0}
                                                                    rules={[
                                                                        { required: true, message: 'Taxable Amount is required' },
                                                                    ]}
                                                                    noStyle
                                                                />
                                                            ),
                                                        },
                                                    ];

                                                    return (
                                                        <Table
                                                            size="middle"
                                                            rowKey="key"
                                                            columns={columns}
                                                            dataSource={itemFields.map((_, index) => ({ key: index }))}
                                                            pagination={false}
                                                            bordered
                                                            scroll={{ x: 'max-content' }}
                                                        />
                                                    );
                                                }}
                                            </Form.List>

                                            <Row gutter={16} style={{ marginTop: '16px' }}>
                                                <Col xs={24} sm={12} md={4}>
                                                    <ProFormDigit
                                                        name={[name, 'taxableAmount']}
                                                        label="Total Taxable Amount"
                                                        rules={[{ required: true, message: 'Taxable Amount is required' }]}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12} md={4}>
                                                    <ProFormDigit
                                                        name={[name, 'taxAmount']}
                                                        label="Total Tax Amount"
                                                        rules={[{ required: true, message: 'Tax Amount is required' }]}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12} md={4}>
                                                    <ProFormDigit
                                                        name={[name, 'totalExcludingTax']}
                                                        label="Total Excluding Tax"
                                                        rules={[{ required: true, message: 'Total Excluding Tax is required' }]}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12} md={4}>
                                                    <ProFormDigit
                                                        name={[name, 'totalIncludingTax']}
                                                        label="Total Including Tax"
                                                        rules={[{ required: true, message: 'Total Including Tax is required' }]}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={12} md={4}>
                                                    <ProFormDigit
                                                        name={[name, 'totalPayableAmount']}
                                                        label="Total Payable Amount"
                                                        rules={[{ required: true, message: 'Total Payable is required' }]}
                                                    />
                                                </Col>
                                            </Row>
                                            <Divider orientation="left" orientationMargin="0">Additional Info</Divider>
                                            <ProFormGroup>
                                                <Row gutter={16}>
                                                    <Col xs={24} sm={12} md={8}><ProFormText name={[name, 'additionalDocumentReferenceID']} label="Reference Number of Customs Form No.1, 9, etc" /></Col>
                                                    <Col xs={24} sm={12} md={8}><ProFormText name={[name, 'billingReferenceID']} label="Billing Reference Number" /></Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormSelect
                                                            name={[name, 'invoicePeriodDescription']}
                                                            label="Frequency of Billing"
                                                            placeholder="Select Frequency"
                                                            showSearch
                                                            options={[
                                                                { label: 'Daily', value: 'Daily' },
                                                                { label: 'Weekly', value: 'Weekly' },
                                                                { label: 'Biweekly', value: 'Biweekly' },
                                                                { label: 'Monthly', value: 'Monthly' },
                                                                { label: 'Bimonthly', value: 'Bimonthly' },
                                                                { label: 'Quarterly', value: 'Quarterly' },
                                                                { label: 'Half-yearly', value: 'Half-yearly' },
                                                                { label: 'Yearly', value: 'Yearly' },
                                                                { label: 'Others / Not Applicable', value: '' },
                                                            ]}
                                                        />
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormDatePicker
                                                            name={[name, 'startDate']}
                                                            label="Billing Period Start Date"
                                                            transform={(value) => (value ? value.format('YYYY-MM-DD') : '')}
                                                            fieldProps={{
                                                                style: { width: '100%' },
                                                            }}
                                                            normalize={(value) => value ?? ''}
                                                        />
                                                    </Col>

                                                    <Col xs={24} sm={12} md={8}>
                                                        <ProFormDatePicker
                                                            name={[name, 'endDate']}
                                                            label="Billing Period End Date"
                                                            transform={(value) => (value ? value.format('YYYY-MM-DD') : '')}
                                                            fieldProps={{
                                                                style: { width: '100%' },
                                                            }}
                                                            normalize={(value) => value ?? ''}
                                                        />
                                                    </Col>
                                                </Row>
                                            </ProFormGroup>
                                        </ProCard>
                                    </div>
                                ))}
                            </>
                        )}
                    </Form.List>
                </div>
            </div>
        </DrawerForm>
    );
};

export default PreviewForm;
