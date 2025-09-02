export const UNPLUGIN_REACT_ROUTER_TYPES_MODULE_NAME = '@unplugin-react-router/types';

export const ROOT_ROUTE_NAME = 'Root';

export const NOT_FOUND_ROUTE_NAME = 'NotFound';

export const NO_FILE_INODE = -99;

export const BUILT_IN_ROUTE = {
  [NOT_FOUND_ROUTE_NAME]: '/:pathMatch(.*)*',
  [ROOT_ROUTE_NAME]: '/',
} as const;
