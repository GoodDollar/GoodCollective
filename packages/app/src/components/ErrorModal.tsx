import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, Image, TouchableOpacity } from 'react-native';
import { InterRegular, InterSemiBold } from '../utils/webFonts';
import { CloseIcon } from '../@constants/ChevronIcons';
import { PhoneImg } from '../@constants/PhoneImg';
import { ThankYouImg } from '../@constants/ThankYouImg';
import useCrossNavigate from '../routes/useCrossNavigate';
import { Colors } from '../utils/colors';

interface ErrorModalProps {
  openModal: boolean;
  setOpenModal: any;
}

const ErrorModal = ({ openModal, setOpenModal }: ErrorModalProps) => {
  const { navigate } = useCrossNavigate();
  return (
    <View style={styles.centeredView}>
      <Modal animationType="slide" transparent={true} visible={openModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ width: '100%', alignContent: 'flex-end' }}>
              <TouchableOpacity style={{ width: 24, height: 24, alignSelf: 'flex-end' }}>
                <Image source={{ uri: CloseIcon }} style={styles.closeIcon}></Image>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>SOMETHING WENT WRONG</Text>
            <Text style={styles.paragraph}>Please try againd later.</Text>
            <Text style={styles.paragraph}>Reason: {'Error Code'}</Text>
            <Image source={{ uri: ThankYouImg }} alt="woman" style={styles.image} />
            <TouchableOpacity style={styles.button} onPress={() => setOpenModal(false)}>
              <Text style={styles.buttonText}>OK</Text>
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
    width: '80%',
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

export default ErrorModal;
