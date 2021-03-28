import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import { useContext, useDispatch } from '../../../context';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { loggedIn, dapp, address } = useContext();
  const dispatch = useDispatch();
  const languages = [ 'en', 'de' ];

  const logOut = () => {
    dispatch({ type: 'logout', provider: dapp.provider });
  };

  const onChangeLanguageClicked = (language: string) => {
    i18n.changeLanguage(language);

    localStorage.setItem('language', language);
  };

  return (
    <div className="navbar px-4 py-3 flex-nowrap">
      <div className="container-fluid flex-nowrap">
        <div className="d-flex align-items-center mr-3">
          <Logo className="logo mr-2 flex-shrink-0" />
          <span style={{width: 250}} className="h5 text-nowrap mb-0 p-0">{t('Multisig Manager')}</span>
          <div className="btn-group ml-5">
            {
             languages.map(lang => (<button key={lang} className={`btn btn-sm ${i18n.language === lang ? 'btn-secondary' : 'btn-primary'}`} onClick={() => onChangeLanguageClicked(lang)}>{lang.toUpperCase()}</button>))
            }
          </div>

        </div>
        {loggedIn && (
          <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
            <small className="d-none d-lg-inline text-muted mr-2">{t('Wallet address')}:</small>
            <small className="text-truncate">{address}</small>
            <a href="/#" onClick={logOut} className="btn btn-primary btn-sm ml-3">
              {t('Close')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
