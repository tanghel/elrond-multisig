import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmModal from './ConfirmModal';
import { useConfirmModal } from './ConfirmModalPayload';

const ConfirmModalContainer = () => {
  const useModal = useConfirmModal();

  const [ title, setTitle ] = React.useState('');
  const [ confirmButtonTitle, setConfirmButtonTitle ] = React.useState('');
  const [ show, setShow ] = React.useState(false);

  const onConfirmClicked = () => {
    useModal.handleModalConfirm();
    setShow(false);
  };

  const onCloseClicked = () => {
    useModal.handleModalClose();
    setShow(false);
  };

  React.useEffect(() => {
    useModal.handleModalShow = (title, confirmButtonTitle) => {
      setTitle(title);
      setConfirmButtonTitle(confirmButtonTitle);
      setShow(true);
    };
  }, []);

  return (
    <ConfirmModal show={show} title={title} confirmButtonTitle={confirmButtonTitle} handleClose={onCloseClicked} handleConfirm={onConfirmClicked} />
  );
};

export default ConfirmModalContainer;
