import Layout from '../components/Layout';
import SwitchModal from '../components/SwitchModal';
import CompleteDonationModal from '../components/CompleteDonationModal';
import ThankYouModal from '../components/ThankYouModal';
import ErrorModal from '../components/ErrorModal';
import AproveSwapModal from '../components/AproveSwapModal';
import StopDonationModal from '../components/StopDonationModal';
import { useState } from 'react';

function ModalTestPage() {
  const [openModal, setOpenModal] = useState(false);
  return (
    <Layout>
      <SwitchModal openModal={openModal} setOpenModal={setOpenModal} />
      <CompleteDonationModal openModal={openModal} setOpenModal={setOpenModal} />
      <ThankYouModal openModal={openModal} setOpenModal={setOpenModal} />
      <ErrorModal openModal={openModal} setOpenModal={setOpenModal} message={'Something went wrong'} />
      <AproveSwapModal openModal={openModal} setOpenModal={setOpenModal} />
      <StopDonationModal openModal={openModal} setOpenModal={setOpenModal} />
    </Layout>
  );
}

export default ModalTestPage;
