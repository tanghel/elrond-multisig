import React from 'react';
import { useContext, useDispatch } from 'context';
import { Link, Redirect, useParams } from 'react-router-dom';
import StatCard from 'components/StatCard';
import State from 'components/State';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import ProposeAction from './Propose/ProposeAction';
import MultisigProposalCard from 'pages/MultisigDetails/MultisigProposalCard';
import { Address } from '@elrondnetwork/erdjs/out';
import { MultisigActionDetailed } from 'types/MultisigActionDetailed';
import { useMultisigContract } from 'contracts/MultisigContract';
import { useLoading } from 'helpers/loading';
import { tryParseTransactionParameter } from 'helpers/urlparameters';
import { hexToNumber, hexToString } from 'helpers/converters';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { useConfirmModal } from 'components/ConfirmModal/ConfirmModalPayload';
import { useTranslation } from 'react-i18next';

interface MultisigDetailsPageParams {
  multisigAddressParam: string
}

const MultisigDetailsPage = () => {
  const { address, totalBoardMembers, totalProposers, quorumSize, userRole, loading, allActions, currentMultisigAddress, dapp } = useContext();
  const { multisigContract } = useMultisigContract();
  const dispatch = useDispatch();
  const loadingIndicator = useLoading();
  let { multisigAddressParam } = useParams<MultisigDetailsPageParams>();
  const confirmModal = useConfirmModal();
  const { t } = useTranslation();

  const parseMultisigAddress = (): Address | undefined => {
    try {
      return new Address(multisigAddressParam);
    } catch {
      return undefined;
    }
  };

  if (address === null) {
    return <Redirect to="/" />;
  }

  if (!parseMultisigAddress()) {
    return <Redirect to="/multisig" />;
  }

  const getDashboardInfo = async () => {
    loadingIndicator.show();
    try {
      const [
        totalBoardMembers,
        totalProposers,
        quorumSize,
        userRole,
        allActions,
      ] = await Promise.all([
        multisigContract.queryBoardMembersCount(),
        multisigContract.queryProposersCount(),
        multisigContract.queryQuorumCount(),
        multisigContract.queryUserRole(new Address(address).hex()),
        multisigContract.queryAllActions(),
      ]);

      dispatch({
        type: 'setTotalBoardMembers',
        totalBoardMembers: totalBoardMembers
      });
  
      dispatch({
        type: 'setTotalProposers',
        totalProposers: totalProposers
      });
  
      dispatch({
        type: 'setQuorumSize',
        quorumSize: quorumSize
      }); 
  
      dispatch({
        type: 'setUserRole',
        userRole: userRole
      });
  
      dispatch({
        type: 'setAllActions',
        allActions: allActions
      });
    } finally {
      loadingIndicator.hide();
    }
  };

  const userRoleAsString = () => {
    switch (userRole) {
      case 0:
        return 'No rights';
      case 1:
        return 'Proposer';
      case 2:
        return 'Proposer / Signer';
      default:
        return 'Unknown';
    }
  };

  const alreadySigned = (action: MultisigActionDetailed) => {
    let typedAddress = new Address(address);
    for (let signerAddress of action.signers) {
      if (signerAddress.hex() === typedAddress.hex()) {
        return true;
      }
    }

    return false;
  };

  const isProposer = () => {
    return userRole !== 0;
  };

  const isBoardMember = () => {
    return userRole === 2;
  };

  const canSign = (action: MultisigActionDetailed) => {
    return isBoardMember() && !alreadySigned(action);
  };

  const canUnsign = (action: MultisigActionDetailed) => {
    return isBoardMember() && alreadySigned(action);
  };

  const canPerformAction = (action: MultisigActionDetailed) => {
    return isBoardMember() && alreadySigned(action) && action.signers.length >= quorumSize;
  };

  const canDiscardAction = (action: MultisigActionDetailed) => {
    return isBoardMember() && action.signers.length === 0;
  };

  const tryParseUrlParams = async () => {
    let parameters = await tryParseTransactionParameter(dapp);
    if (parameters === null) {
      return;
    }

    if (parameters.receiver.bech32() === currentMultisigAddress?.bech32()) {
      if (parameters.functionName.startsWith('propose')) {
        if (parameters.outputParameters.length === 2 && hexToString(parameters.outputParameters[0]) === 'ok') {
          let actionId = hexToNumber(parameters.outputParameters[1]);
          if (actionId !== null) {
            onSignOrPropose(actionId);
          }
        }
      } else if (parameters.functionName === 'sign') {
        if (parameters.outputParameters.length === 1 && hexToString(parameters.outputParameters[0]) === 'ok') {
          let actionId = hexToNumber(parameters.inputParameters[0]);
          if (actionId !== null) {
            onSignOrPropose(actionId);
          }
        }
      } else if (parameters.functionName === 'unsign') {
        if (parameters.outputParameters.length === 1 && hexToString(parameters.outputParameters[0]) === 'ok') {
          let actionId = hexToNumber(parameters.inputParameters[0]);
          if (actionId !== null) {
            onUnsign(actionId);
          }
        }
      }
    }
  };

  const onSignOrPropose = async (actionId: number) => {
    let validSignerCount = await multisigContract.queryActionValidSignerCount(actionId);
    let realQuorumSize = await multisigContract.queryQuorumCount();
    let realUserRole = await multisigContract.queryUserRole(new Address(address).hex());

    if (validSignerCount >= realQuorumSize && realUserRole === 2) {
      let success = await confirmModal.show(t('Confirm Perform Action'), t('Perform Action'));
      if (success) {
        await multisigContract.mutatePerformAction(actionId);
      }
    }
  };

  const onUnsign = async (actionId: number) => {
    let validSignerCount = await multisigContract.queryActionValidSignerCount(actionId);
    let realUserRole = await multisigContract.queryUserRole(new Address(address).hex());

    if (validSignerCount === 0 && realUserRole === 2) {
      let success = await confirmModal.show(t('Confirm Discard Action'), t('Discard Action'));
      if (success) {
        await multisigContract.mutateDiscardAction(actionId);
      }
    }
  };

  React.useEffect(() => {
    tryParseUrlParams();

    let multisigAddressParam = parseMultisigAddress();

    let isCurrentMultisigAddressNotSet = !currentMultisigAddress;
    let isCurrentMultisigAddressDiferentThanParam = currentMultisigAddress && multisigAddressParam && 
      currentMultisigAddress.hex() !== multisigAddressParam.hex();

    if (isCurrentMultisigAddressNotSet || isCurrentMultisigAddressDiferentThanParam) {
      dispatch({ type: 'setCurrentMultisigAddress', currentMultisigAddress: multisigAddressParam });
    } else if (address !== null) {
      getDashboardInfo();
    }
  }, [ currentMultisigAddress ]);

  return (
    <div className="dashboard w-100">
      <div className="card border-0">
        <div className="header card-header d-flex align-items-center border-0 justify-content-between px-spacer">
          <div className="py-spacer text-truncate">
            <p className="opacity-6 mb-0">{t('Multisig Address')}</p>
            <span className="text-truncate">{currentMultisigAddress?.bech32()}</span>
          </div>
          <div className="d-flex justify-content-center align-items-center justify-content-between">
            <Link to="/multisig" className="btn btn-primary btn-sm">
              {t('Manage Multisigs')}
            </Link>
          </div>
        </div>
        

        <div className="cards d-flex flex-wrap mr-spacer">
          <StatCard
            title={t('Board Members')}
            value={totalBoardMembers.toString()}
            color="orange"
            svg="clipboard-check.svg"
          />
          <StatCard
            title={t('Proposers')}
            value={totalProposers.toString()}
            valueUnit=""
            color="orange"
            svg="clipboard-list.svg"
          />
          <StatCard
            title={t('Quorum Size')}
            value={quorumSize.toString()}
            valueUnit=""
            color="orange"
            svg="quorum.svg"
          />
          <StatCard
            title={t('User Role')}
            value={t(userRoleAsString())}
            valueUnit=""
            color="orange"
            svg="user.svg"
          />
        </div>

        <div className="card-body pt-0 px-spacer pb-spacer">
          
          {loading ? (
            <State icon={faCircleNotch} iconClass="fa-spin text-primary" />
          ) : (
            <div className="card mt-spacer">
              <div className="card-body p-spacer">
                <div className="d-flex flex-wrap align-items-center justify-content-between">
                  <p className="h6 mb-3">{t('Proposals')}</p>
                  <div className="d-flex flex-wrap">
                    { isProposer() ? 
                      <ProposeAction /> : null
                  }
                  </div>
                </div>

                {
                  allActions.map(action => 
                    <MultisigProposalCard 
                      key={action.actionId} 
                      type={action.typeNumber()}
                      actionId={action.actionId}
                      title={action.title()} 
                      tooltip={action.tooltip()}
                      value={action.description()} 
                      canSign={canSign(action)} 
                      canUnsign={canUnsign(action)}
                      canPerformAction={canPerformAction(action)}
                      canDiscardAction={canDiscardAction(action)}
                      signers={action.signers}
                    />
                  )
                }
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultisigDetailsPage;
