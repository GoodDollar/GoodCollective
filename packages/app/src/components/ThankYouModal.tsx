import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { InterRegular, InterSemiBold } from "../utils/webFonts";
import { CloseIcon } from "../@constants/ChevronIcons";
import { PhoneImg } from "../@constants/PhoneImg";
import { ThankYouImg } from "../@constants/ThankYouImg";

const ThankYouModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.title}>THANK YOU!</Text>
            <Text style={styles.paragraph}>
              You have just donated to Restoring the Kakamega Forest
              GoodCollective!
            </Text>
            <Text style={styles.paragraph}>
              To stop your donation, visit the Restoring the Kakamega Forest
              GoodCollective page.
            </Text>
            <Image
              source={{ uri: ThankYouImg }}
              alt="woman"
              style={styles.image}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>GO TO PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.textStyle}>Show Modal</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#CBDAFF",
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
    alignItems: "center",
    shadowColor: "#000",
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
    textAlign: "center",
    marginHorizontal: 0,
    ...InterSemiBold,
  },
  paragraph: {
    ...InterRegular,
    fontSize: 18,
    textAlign: "center",
    width: "100%",
    lineHeight: 27,
  },
  image: {
    alignSelf: "center",
    width: 190,
    height: 224,
  },
  closeIcon: {
    width: 24,
    height: 24,
    alignSelf: "flex-end",
  },

  button: {
    backgroundColor: "#FFC48E",
    width: "80%",
    borderRadius: 30,
    paddingTop: 12,
    paddingRight: 22,
    paddingBottom: 12,
    paddingLeft: 20,
    gap: 8,
    alignContent: "center",
  },
  buttonText: {
    ...InterSemiBold,
    fontSize: 18,
    textAlign: "center",
    alignSelf: "center",
    marginHorizontal: "35%",
  },

  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default ThankYouModal;
