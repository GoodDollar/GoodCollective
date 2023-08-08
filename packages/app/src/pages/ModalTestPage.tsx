import React from 'react';
import { useState } from 'react';
import AproveSwapModal from '../components/AproveSwapModal';
import CompleteDonationModal from '../components/CompleteDonationModal';
import ErrorModal from '../components/ErrorModal';
import Layout from '../components/Layout';
import StopDonationModal from '../components/StopDonationModal';
import SwitchModal from '../components/SwitchModal';
import ThankYouModal from '../components/ThankYouModal';

function ModalTestPage() {
  const [openModal, setOpenModal] = useState(false);
  return (
    <Layout>
      <SwitchModal openModal={openModal} setOpenModal={setOpenModal} />
      <CompleteDonationModal openModal={openModal} setOpenModal={setOpenModal} />
      <ThankYouModal openModal={openModal} setOpenModal={setOpenModal} />
      <ErrorModal openModal={openModal} setOpenModal={setOpenModal} />
      <AproveSwapModal openModal={openModal} setOpenModal={setOpenModal} />
      <StopDonationModal openModal={openModal} setOpenModal={setOpenModal} />
    </Layout>
  );
}

export default ModalTestPage;
