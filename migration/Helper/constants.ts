export enum MODELS {
  ACTION = 'dami_rbac_actions',
  ROLE = 'dami_rbac_role',
  USER_ROLE = 'dami_rbac_user_role',
  ROLE_ACTION = 'dami_rbac_role_action',
}

export const TableList = [
  {
    model_name: 'Actions',
    table_name: MODELS.ACTION,
  },
  {
    model_name: 'Actions',
    table_name: MODELS.ROLE,
  },
  {
    model_name: 'Actions',
    table_name: MODELS.ROLE_ACTION,
  },
  {
    model_name: 'Actions',
    table_name: MODELS.USER_ROLE,
  },
];
