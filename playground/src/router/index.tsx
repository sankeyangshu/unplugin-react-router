import { createBrowserRouter, RouterProvider } from 'react-router';
import { layouts, pages } from './_generated/imports';
import { routes } from './_generated/routes';
import { transformToReactRoutes } from './_generated/transformer';

/**
 * Router
 * @descCN 创建一个可以被 React 应用程序使用的路由实例
 */
const Router = () => {
  const reactRoutes = transformToReactRoutes(routes, layouts, pages);

  const router = createBrowserRouter(reactRoutes);

  return <RouterProvider router={router} />;
};

export default Router;
