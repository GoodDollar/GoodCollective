import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, Image, TouchableOpacity } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { CloseIcon } from '../@constants/ChevronIcons';
import { PhoneImg } from '../@constants/PhoneImg';
import { ThankYouImg } from '../@constants/ThankYouImg';
import { QuestionImg } from '../@constants/QuestionImg';
import useCrossNavigate from '../routes/useCrossNavigate';
import { Colors } from '../utils/colors';

interface StopDonationModalProps {
  openModal: boolean;
  setOpenModal: any;
}

const StopDonationModal = ({ openModal, setOpenModal }: StopDonationModalProps) => {
  const { navigate } = useCrossNavigate();
  return (
    <View style={styles.centeredView}>
      <Modal animationType="slide" transparent={true} visible={openModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.title}>ARE YOU SURE YOU WANT TO STOP YOUR DONATION?</Text>
            <Text style={styles.paragraph}>
              If so, please sign with your wallet. If not, please click below to return to the GoodCollective you
              support.
            </Text>

            <Image source={{ uri: QuestionImg }} alt="woman" style={styles.image} />
            <TouchableOpacity style={styles.button} onPress={() => setOpenModal(false)}>
              <Text style={styles.buttonText}>GO BACK</Text>
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
    width: 190,
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

export default StopDonationModal;
