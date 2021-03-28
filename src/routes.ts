import React from 'react';
import MultisigDetailsPage from './pages/MultisigDetails/MultisigDetailsPage';
import Home from './pages/Home';
import withPageTitle from './components/PageTitle';
import MultisigListPage from 'pages/MultisigList/MultisigListPage';
import i18next from 'i18next';

interface RouteType {
  path: string;
  page: string;
  title: string;
  component: any;
}

const routes: RouteType[] = [
  {
    path: '/',
    page: 'home',
    title: '',
    component: Home,
  },
  {
    path: '/multisig/:multisigAddressParam',
    page: 'multisig',
    title: 'Multisig',
    component: MultisigDetailsPage,
  },
  {
    path: '/multisig',
    page: 'multisig',
    title: 'Multisig Details',
    component: MultisigListPage,
  },
];

const wrappedRoutes = () => {
  return routes.map(route => {
    const title = route.title ? `${route.title} • Multisig Manager` : 'Multisig Manager';
    return {
      path: route.path,
      page: route.page,
      component: (withPageTitle(title, route.component) as any) as React.ComponentClass<{}, any>,
    };
  });
};

export default wrappedRoutes();
