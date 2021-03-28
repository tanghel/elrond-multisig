import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import routes from './routes';
import { ContextProvider } from './context';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { englishTranslations } from 'i18n/en';
import { germanTranslations } from 'i18n/de';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: englishTranslations
      },
      de: {
        translation: germanTranslations
      }
    },
    lng: 'en',
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false
    }
  });


function App() {
  React.useEffect(() => {
    let language = localStorage.getItem('language');
    if (language) {
      i18n.changeLanguage(language);
    }
  }, []);
  
  return (
    <Router>
      <ContextProvider>
        <Switch>
          {routes.map((route, i) => (
            <Route path={route.path} key={route.path + i} component={route.component} exact={true}>
              <Layout page={route.page}>
                <Route
                  path={route.path}
                  key={route.path + i}
                  component={route.component}
                  exact={true}
                ></Route>
              </Layout>
            </Route>
          ))}
        </Switch>
      </ContextProvider>
    </Router>
  );
}

export default App;
