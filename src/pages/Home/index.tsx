import React from 'react';
import { Redirect } from 'react-router-dom';
import { faBan, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as Logo } from '../../assets/images/logo.svg';
import State from 'components/State';
import { useContext } from 'context';
import WalletLogin from './Login/Wallet';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const { loading, error, loggedIn, egldLabel } = useContext();

  const ref = React.useRef(null);

  return (
    <div ref={ref} className="home d-flex flex-fill align-items-center">
      {error ? (
        <State
          icon={faBan}
          iconClass="text-primary"
          title="Something went wrong"
          description="If the problem persists please contact support."
        />
      ) : loggedIn ? (
        <Redirect to="/multisig" />
      ) : loading ? (
        <State icon={faCircleNotch} iconClass="fa-spin text-primary" />
      ) : (
        <div className="m-auto login-container">
          <div className="card my-spacer text-center">
            <div className="card-body p-spacer mx-lg-spacer">
              <Logo className="logo mb-spacer" />
              <h4 className="mb-spacer">{t('Multisig Manager')}</h4>
              <div>
                <WalletLogin />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
