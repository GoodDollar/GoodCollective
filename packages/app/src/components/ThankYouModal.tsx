import React from 'react';
import { Modal, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import useCrossNavigate from '../routes/useCrossNavigate';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
// import { CloseIcon } from '../@constants/ChevronIcons';
// import { PhoneImg } from '../@constants/PhoneImg';
import { ThankYouImg } from '../@constants/ThankYouImg';
import { Colors } from '../utils/colors';

interface ThankYouModalProps {
  openModal: boolean;
  setOpenModal: any;
}

const ThankYouModal = ({ openModal }: ThankYouModalProps) => {
  // const [modalVisible, setModalVisible] = useState(openModal);
  const { navigate } = useCrossNavigate();
  return (
    <View style={styles.centeredView}>
      <Modal animationType="slide" transparent={true} visible={openModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.title}>THANK YOU!</Text>
            <Text style={styles.paragraph}>You have just donated to Restoring the Kakamega Forest GoodCollective!</Text>
            <Text style={styles.paragraph}>
              To stop your donation, visit the Restoring the Kakamega Forest GoodCollective page.
            </Text>
            <Image source={{ uri: ThankYouImg }} alt="woman" style={styles.image} />
            <TouchableOpacity style={styles.button} onPress={() => navigate('/walletProfile')}>
              <Text style={styles.buttonText}>GO TO PROFILE</Text>
            </TouchableOpacity>
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
    width: 286,
    height: 214,
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
    paddingBottom: 12,
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

export default ThankYouModal;
