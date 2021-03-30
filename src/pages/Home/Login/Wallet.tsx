import React, { useEffect } from 'react';
import { useContext, useDispatch } from 'context';
import { getItem, removeItem, setItem } from 'storage/session';
import { useLoading } from 'helpers/loading';
import { useTranslation } from 'react-i18next';

const WalletLogin = () => {
  const dispatch = useDispatch();
  const loadingIndicator = useLoading();
  const { dapp } = useContext();
  const { t } = useTranslation();

  const handleOnClick = () => {
    loadingIndicator.show();
    dapp.provider
      .init()
      .then(initialised => {
        if (initialised) {
          // Wallet provider will redirect, we can set a session information so we know when we are getting back
          //  that we initiated a wallet provider login
          setItem('wallet_login', {}, 60); // Set a 60s session only
          dapp.provider.login();
        } else {
          loadingIndicator.show();
          console.warn('Something went wrong trying to redirect to wallet login..');
        }
      })
      .catch(err => {
        loadingIndicator.hide();
        console.warn(err);
      });
  };

  // The wallet login component can check for the session and the address get param
  useEffect(() => {
    if (getItem('wallet_login')) {
      loadingIndicator.show();
      dapp.provider.init().then(initialised => {
        loadingIndicator.hide();

        if (!initialised) {
          return;
        }

        dapp.provider
          .getAddress()
          .then(address => {
            removeItem('wallet_login');
            dispatch({ type: 'login', address });
          })
          .catch(err => {
            loadingIndicator.hide();
          });
      });
    }
  }, [dapp.provider, dapp.proxy, dispatch, loadingIndicator]);

  return (
    <button onClick={handleOnClick} className="btn btn-primary px-sm-spacer mx-1 mx-sm-3">
      {t('Access wallet')}
    </button>
  );
};

export default WalletLogin;
