import { createHashRouter, RouterProvider } from 'react-router';
import type { RouteObject } from 'react-router';

/**
 * Router
 * @descCN 创建一个可以被 React 应用程序使用的路由实例
 */
const Router = () => {
  const routes = [] as RouteObject[];

  const router = createHashRouter(routes);

  return <RouterProvider router={router} />;
};

export default Router;
