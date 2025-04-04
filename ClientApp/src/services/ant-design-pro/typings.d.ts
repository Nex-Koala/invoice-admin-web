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
    jwtToken: string;
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
    submissionCount: number;
    maxSubmissions: number;
    createdAt?: string;
    updatedAt?: string;
  };

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
    schemeID: string;
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
}
