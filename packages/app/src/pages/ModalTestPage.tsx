import Layout from "../components/Layout";
import DonateComponent from "../components/DonateComponent";
import SwitchModal from "../components/SwitchModal";
import CompleteDonationModal from "../components/CompleteDonationModal";
import ThankYouModal from "../components/ThankYouModal";
import ErrorModal from "../components/ErrorModal";
import AproveSwapModal from "../components/AproveSwapModal";
import StopDonationModal from "../components/StopDonationModal";

function ModalTestPage() {
  return (
    <Layout>
      <SwitchModal />
      <CompleteDonationModal />
      <ThankYouModal />
      <ErrorModal />
      <AproveSwapModal />
      <StopDonationModal />
    </Layout>
  );
}

export default ModalTestPage;
