import { Modal, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { CloseIcon } from '../@constants/ChevronIcons';
import { AproveTokenImg } from '../@constants/AproveToken';
import { Colors } from '../utils/colors';
import { modalStyles } from './shared';

interface AproveSwapModalProps {
  openModal: boolean;
  setOpenModal: any;
}

const AproveSwapModal = ({ openModal, setOpenModal }: AproveSwapModalProps) => {
  return (
    <View style={styles.centeredView}>
      <Modal animationType="slide" transparent={true} visible={openModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={modalStyles.modalCloseIconWrapper}>
              <TouchableOpacity style={modalStyles.modalCloseIcon}>
                <Image source={{ uri: CloseIcon }} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>APROVE TOKEN SWAP</Text>
            <Text style={styles.paragraph}>
              To approve the exchange from your donation currency to this GoodCollective's currency, sign with your
              wallet.
            </Text>
            <Image source={{ uri: AproveTokenImg }} alt="woman" style={styles.image} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.blue[100],
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginHorizontal: 0,
    ...InterSemiBold,
  },
  paragraph: {
    ...InterRegular,
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
    lineHeight: 27,
  },
  image: {
    alignSelf: 'center',
    width: 295,
    height: 224,
  },
  closeIcon: {
    width: 24,
    height: 24,
    alignSelf: 'flex-end',
  },

  button: {
    backgroundColor: Colors.orange[100],
    width: '100%',
    borderRadius: 30,
    paddingTop: 12,
    paddingRight: 22,
    paddingBottom: 12,
    paddingLeft: 20,
    gap: 8,
    alignContent: 'center',
  },
  buttonText: {
    ...InterSemiBold,
    fontSize: 18,
    textAlign: 'center',
    alignSelf: 'center',
    color: Colors.orange[300],
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AproveSwapModal;
