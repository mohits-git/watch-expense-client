export const REQUEST_QUERY_PARAMS = {
  STATUS: 'status',
  PAGE: 'page',
  LIMIT: 'limit',
} as const;

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVIEWED: 'REVIEWED',
} as const;

export const REQUEST_STATUS_FILTER = {
  ...REQUEST_STATUS,
  ALL: 'ALL',
} as const;

export const REQUEST_STATUS_LABEL = {
  ALL: 'All',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVIEWED: 'Reviewed',
} as const;

export const REQUEST_STATUS_FILTER_OPTIONS = [
  {
    label: REQUEST_STATUS_LABEL.ALL,
    value: REQUEST_STATUS_FILTER.ALL,
  },
  {
    label: REQUEST_STATUS_LABEL.PENDING,
    value: REQUEST_STATUS_FILTER.PENDING,
  },
  {
    label: REQUEST_STATUS_LABEL.APPROVED,
    value: REQUEST_STATUS_FILTER.APPROVED,
  },
  {
    label: REQUEST_STATUS_LABEL.REJECTED,
    value: REQUEST_STATUS_FILTER.REJECTED,
  },
  {
    label: REQUEST_STATUS_LABEL.REVIEWED,
    value: REQUEST_STATUS_FILTER.REVIEWED,
  },
];

