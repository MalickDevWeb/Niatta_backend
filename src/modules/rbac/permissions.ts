export const permissions = {
  reportsCreate: 'reports.create',
  reportsView: 'reports.view',
  reportsReview: 'reports.review',
  reportsConfirm: 'reports.confirm',
  reportsReject: 'reports.reject',
  productsView: 'products.view',
  productsCreate: 'products.create',
  productsUpdate: 'products.update',
  productsDelete: 'products.delete',
  storesView: 'stores.view',
  storesUpdate: 'stores.update',
  storesMerge: 'stores.merge',
  usersView: 'users.view',
  usersSuspend: 'users.suspend',
  analyticsView: 'analytics.view',
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];
