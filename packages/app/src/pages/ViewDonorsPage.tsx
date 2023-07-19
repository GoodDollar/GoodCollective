import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import oceanUri from '../@constants/SafariImagePlaceholder';
import Layout from '../components/Layout';
import StewardList from '../components/StewardsList';
import ImpactButton from '../components/ImpactButton';
import DonorsList from '../components/DonorsList';

const RowIconUri = `data:image/svg+xml;utf8,<svg width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="0.5" width="28" height="28" rx="14" fill="#DBFDF4"/> <path d="M17.8333 15.3332C18.2015 15.3332 18.5 15.0347 18.5 14.6666C18.5 14.2984 18.2015 13.9999 17.8333 13.9999C17.4651 13.9999 17.1666 14.2984 17.1666 14.6666C17.1666 15.0347 17.4651 15.3332 17.8333 15.3332Z" fill="#5BBAA3"/> <path d="M17.8333 17.9999C18.2015 17.9999 18.5 17.7014 18.5 17.3332C18.5 16.965 18.2015 16.6666 17.8333 16.6666C17.4651 16.6666 17.1666 16.965 17.1666 17.3332C17.1666 17.7014 17.4651 17.9999 17.8333 17.9999Z" fill="#5BBAA3"/> <path d="M15.1666 14.6666C15.1666 15.0347 14.8682 15.3332 14.5 15.3332C14.1318 15.3332 13.8333 15.0347 13.8333 14.6666C13.8333 14.2984 14.1318 13.9999 14.5 13.9999C14.8682 13.9999 15.1666 14.2984 15.1666 14.6666Z" fill="#5BBAA3"/> <path d="M15.1666 17.3332C15.1666 17.7014 14.8682 17.9999 14.5 17.9999C14.1318 17.9999 13.8333 17.7014 13.8333 17.3332C13.8333 16.965 14.1318 16.6666 14.5 16.6666C14.8682 16.6666 15.1666 16.965 15.1666 17.3332Z" fill="#5BBAA3"/> <path d="M11.1666 15.3332C11.5348 15.3332 11.8333 15.0347 11.8333 14.6666C11.8333 14.2984 11.5348 13.9999 11.1666 13.9999C10.7984 13.9999 10.5 14.2984 10.5 14.6666C10.5 15.0347 10.7984 15.3332 11.1666 15.3332Z" fill="#5BBAA3"/> <path d="M11.1666 17.9999C11.5348 17.9999 11.8333 17.7014 11.8333 17.3332C11.8333 16.965 11.5348 16.6666 11.1666 16.6666C10.7984 16.6666 10.5 16.965 10.5 17.3332C10.5 17.7014 10.7984 17.9999 11.1666 17.9999Z" fill="#5BBAA3"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.1666 7.16655C11.4428 7.16655 11.6666 7.39041 11.6666 7.66655V8.17503C12.108 8.16654 12.5942 8.16655 13.1289 8.16655H15.8709C16.4057 8.16655 16.892 8.16654 17.3333 8.17503V7.66655C17.3333 7.39041 17.5572 7.16655 17.8333 7.16655C18.1094 7.16655 18.3333 7.39041 18.3333 7.66655V8.21794C18.5066 8.23116 18.6707 8.24777 18.826 8.26864C19.6076 8.37373 20.2402 8.59514 20.7391 9.09405C21.2381 9.59296 21.4595 10.2256 21.5645 11.0072C21.6667 11.7667 21.6666 12.7371 21.6666 13.9622V15.3708C21.6666 16.596 21.6667 17.5664 21.5645 18.3259C21.4595 19.1075 21.238 19.7401 20.7391 20.2391C20.2402 20.738 19.6076 20.9594 18.826 21.0645C18.0665 21.1666 17.0961 21.1666 15.8709 21.1666H13.129C11.9039 21.1666 10.9334 21.1666 10.174 21.0645C9.39234 20.9594 8.75971 20.738 8.2608 20.2391C7.76189 19.7401 7.54048 19.1075 7.43539 18.3259C7.33328 17.5664 7.33329 16.596 7.3333 15.3708V13.9623C7.33329 12.7371 7.33328 11.7667 7.43539 11.0072C7.54048 10.2256 7.76189 9.59296 8.2608 9.09405C8.75971 8.59514 9.39234 8.37373 10.174 8.26864C10.3292 8.24777 10.4933 8.23116 10.6666 8.21794V7.66655C10.6666 7.39041 10.8905 7.16655 11.1666 7.16655ZM10.3072 9.25973C9.63647 9.3499 9.25004 9.51902 8.9679 9.80116C8.68576 10.0833 8.51665 10.4697 8.42647 11.1405C8.4112 11.254 8.39843 11.3736 8.38776 11.4999H20.6122C20.6015 11.3736 20.5887 11.254 20.5735 11.1405C20.4833 10.4697 20.3142 10.0833 20.032 9.80116C19.7499 9.51902 19.3635 9.3499 18.6927 9.25973C18.0076 9.16761 17.1045 9.16655 15.8333 9.16655H13.1666C11.8954 9.16655 10.9923 9.16761 10.3072 9.25973ZM8.3333 13.9999C8.3333 13.4305 8.33351 12.935 8.34202 12.4999H20.6579C20.6664 12.935 20.6666 13.4305 20.6666 13.9999V15.3332C20.6666 16.6044 20.6656 17.5075 20.5735 18.1927C20.4833 18.8634 20.3142 19.2498 20.032 19.5319C19.7499 19.8141 19.3635 19.9832 18.6927 20.0734C18.0076 20.1655 17.1045 20.1666 15.8333 20.1666H13.1666C11.8954 20.1666 10.9923 20.1655 10.3072 20.0734C9.63647 19.9832 9.25004 19.8141 8.9679 19.5319C8.68576 19.2498 8.51665 18.8634 8.42647 18.1927C8.33436 17.5075 8.3333 16.6044 8.3333 15.3332V13.9999Z" fill="#5BBAA3"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.1666 6.96655C11.5532 6.96655 11.8666 7.27995 11.8666 7.66655V7.97176C12.2544 7.96655 12.6744 7.96655 13.1276 7.96655H15.8723C16.3254 7.96655 16.7455 7.96655 17.1333 7.97176V7.66655C17.1333 7.27995 17.4467 6.96655 17.8333 6.96655C18.2199 6.96655 18.5333 7.27995 18.5333 7.66655V8.03423C18.6432 8.0446 18.7496 8.05658 18.8526 8.07043C19.6564 8.17848 20.3383 8.41033 20.8806 8.95263C21.4229 9.49492 21.6547 10.1768 21.7628 10.9806C21.8667 11.7533 21.8666 12.7346 21.8666 13.9478V15.3852C21.8666 16.5984 21.8667 17.5798 21.7628 18.3525C21.6547 19.1563 21.4229 19.8382 20.8806 20.3805C20.3383 20.9228 19.6564 21.1546 18.8526 21.2627C18.0799 21.3666 17.0985 21.3666 15.8853 21.3666H13.1146C11.9014 21.3666 10.9201 21.3666 10.1473 21.2627C9.34357 21.1546 8.66167 20.9228 8.11938 20.3805C7.57708 19.8382 7.34523 19.1563 7.23717 18.3525C7.13328 17.5798 7.13329 16.5985 7.1333 15.3852V13.9479C7.13329 12.7347 7.13328 11.7533 7.23717 10.9806C7.34523 10.1768 7.57708 9.49492 8.11938 8.95263C8.66167 8.41033 9.34357 8.17848 10.1473 8.07043C10.2503 8.05658 10.3568 8.0446 10.4666 8.03423V7.66655C10.4666 7.27995 10.78 6.96655 11.1666 6.96655ZM10.6666 8.21794C10.4933 8.23116 10.3292 8.24777 10.174 8.26864C9.39234 8.37373 8.75971 8.59514 8.2608 9.09405C7.76189 9.59296 7.54048 10.2256 7.43539 11.0072C7.33328 11.7667 7.33329 12.7371 7.3333 13.9623V15.3708C7.33329 16.596 7.33328 17.5664 7.43539 18.3259C7.54048 19.1075 7.76189 19.7401 8.2608 20.2391C8.75971 20.738 9.39234 20.9594 10.174 21.0645C10.9334 21.1666 11.9039 21.1666 13.129 21.1666H15.8709C17.0961 21.1666 18.0665 21.1666 18.826 21.0645C19.6076 20.9594 20.2402 20.738 20.7391 20.2391C21.238 19.7401 21.4595 19.1075 21.5645 18.3259C21.6667 17.5664 21.6666 16.596 21.6666 15.3708V13.9622C21.6666 12.7371 21.6667 11.7667 21.5645 11.0072C21.4595 10.2256 21.2381 9.59296 20.7391 9.09405C20.2402 8.59514 19.6076 8.37373 18.826 8.26864C18.6707 8.24777 18.5066 8.23116 18.3333 8.21794V7.66655C18.3333 7.39041 18.1094 7.16655 17.8333 7.16655C17.5572 7.16655 17.3333 7.39041 17.3333 7.66655V8.17503C17.2676 8.17377 17.201 8.17269 17.1333 8.17178C16.7462 8.16655 16.3261 8.16655 15.8709 8.16655H13.1289C12.6738 8.16655 12.2537 8.16655 11.8666 8.17178C11.799 8.17269 11.7323 8.17377 11.6666 8.17503V7.66655C11.6666 7.39041 11.4428 7.16655 11.1666 7.16655C10.8905 7.16655 10.6666 7.39041 10.6666 7.66655V8.21794ZM10.3339 9.45794C9.68539 9.54513 9.34815 9.70375 9.10932 9.94258C8.8705 10.1814 8.71187 10.5186 8.62469 11.1671C8.61888 11.2103 8.61342 11.2546 8.60831 11.2999H20.3916C20.3865 11.2546 20.3811 11.2103 20.3752 11.1671C20.2881 10.5186 20.1294 10.1814 19.8906 9.94258L20.032 9.80116C20.3142 10.0833 20.4833 10.4697 20.5735 11.1405C20.5804 11.1923 20.5869 11.2454 20.5929 11.2999C20.6 11.3647 20.6064 11.4313 20.6122 11.4999H8.38776C8.39356 11.4313 8.39998 11.3647 8.40708 11.2999C8.41305 11.2454 8.4195 11.1923 8.42647 11.1405C8.51665 10.4697 8.68576 10.0833 8.9679 9.80116C9.25004 9.51902 9.63647 9.3499 10.3072 9.25973C10.9923 9.16761 11.8954 9.16655 13.1666 9.16655H15.8333C17.1045 9.16655 18.0076 9.16761 18.6927 9.25973C19.3635 9.3499 19.7499 9.51902 20.032 9.80116L19.8906 9.94258C19.6518 9.70375 19.3145 9.54512 18.6661 9.45794C17.9974 9.36804 17.1103 9.36655 15.8333 9.36655H13.1666C11.8897 9.36655 11.0025 9.36804 10.3339 9.45794ZM8.53875 12.6999C8.53346 13.0843 8.5333 13.5143 8.5333 13.9999V15.3332C8.5333 16.6102 8.53479 17.4973 8.62469 18.166C8.71187 18.8145 8.8705 19.1517 9.10932 19.3905C9.34815 19.6294 9.68539 19.788 10.3338 19.8752C11.0025 19.9651 11.8897 19.9666 13.1666 19.9666H15.8333C17.1103 19.9666 17.9974 19.9651 18.6661 19.8752C19.3145 19.788 19.6518 19.6294 19.8906 19.3905C20.1294 19.1517 20.2881 18.8145 20.3752 18.166C20.4651 17.4973 20.4666 16.6102 20.4666 15.3332V13.9999C20.4666 13.5143 20.4665 13.0843 20.4612 12.6999H8.53875ZM8.34202 12.4999C8.33351 12.935 8.3333 13.4305 8.3333 13.9999V15.3332C8.3333 16.6044 8.33436 17.5075 8.42647 18.1927C8.51665 18.8634 8.68576 19.2498 8.9679 19.5319C9.25004 19.8141 9.63647 19.9832 10.3072 20.0734C10.9923 20.1655 11.8954 20.1666 13.1666 20.1666H15.8333C17.1045 20.1666 18.0076 20.1655 18.6927 20.0734C19.3635 19.9832 19.7499 19.8141 20.032 19.5319C20.3142 19.2498 20.4833 18.8634 20.5735 18.1927C20.6656 17.5075 20.6666 16.6044 20.6666 15.3332V13.9999C20.6666 13.4305 20.6664 12.935 20.6579 12.4999H8.34202ZM18.7 14.6666C18.7 15.1452 18.3119 15.5332 17.8333 15.5332C17.3547 15.5332 16.9666 15.1452 16.9666 14.6666C16.9666 14.1879 17.3547 13.7999 17.8333 13.7999C18.3119 13.7999 18.7 14.1879 18.7 14.6666ZM18.7 17.3332C18.7 17.8119 18.3119 18.1999 17.8333 18.1999C17.3547 18.1999 16.9666 17.8119 16.9666 17.3332C16.9666 16.8546 17.3547 16.4666 17.8333 16.4666C18.3119 16.4666 18.7 16.8546 18.7 17.3332ZM15.3666 14.6666C15.3666 15.1452 14.9786 15.5332 14.5 15.5332C14.0213 15.5332 13.6333 15.1452 13.6333 14.6666C13.6333 14.1879 14.0213 13.7999 14.5 13.7999C14.9786 13.7999 15.3666 14.1879 15.3666 14.6666ZM15.3666 17.3332C15.3666 17.8119 14.9786 18.1999 14.5 18.1999C14.0213 18.1999 13.6333 17.8119 13.6333 17.3332C13.6333 16.8546 14.0213 16.4666 14.5 16.4666C14.9786 16.4666 15.3666 16.8546 15.3666 17.3332ZM12.0333 14.6666C12.0333 15.1452 11.6453 15.5332 11.1666 15.5332C10.688 15.5332 10.3 15.1452 10.3 14.6666C10.3 14.1879 10.688 13.7999 11.1666 13.7999C11.6453 13.7999 12.0333 14.1879 12.0333 14.6666ZM12.0333 17.3332C12.0333 17.8119 11.6453 18.1999 11.1666 18.1999C10.688 18.1999 10.3 17.8119 10.3 17.3332C10.3 16.8546 10.688 16.4666 11.1666 16.4666C11.6453 16.4666 12.0333 16.8546 12.0333 17.3332ZM11.8333 14.6666C11.8333 15.0347 11.5348 15.3332 11.1666 15.3332C10.7984 15.3332 10.5 15.0347 10.5 14.6666C10.5 14.2984 10.7984 13.9999 11.1666 13.9999C11.5348 13.9999 11.8333 14.2984 11.8333 14.6666ZM14.5 15.3332C14.8682 15.3332 15.1666 15.0347 15.1666 14.6666C15.1666 14.2984 14.8682 13.9999 14.5 13.9999C14.1318 13.9999 13.8333 14.2984 13.8333 14.6666C13.8333 15.0347 14.1318 15.3332 14.5 15.3332ZM17.8333 15.3332C18.2015 15.3332 18.5 15.0347 18.5 14.6666C18.5 14.2984 18.2015 13.9999 17.8333 13.9999C17.4651 13.9999 17.1666 14.2984 17.1666 14.6666C17.1666 15.0347 17.4651 15.3332 17.8333 15.3332ZM17.8333 17.9999C18.2015 17.9999 18.5 17.7014 18.5 17.3332C18.5 16.965 18.2015 16.6666 17.8333 16.6666C17.4651 16.6666 17.1666 16.965 17.1666 17.3332C17.1666 17.7014 17.4651 17.9999 17.8333 17.9999ZM15.1666 17.3332C15.1666 17.7014 14.8682 17.9999 14.5 17.9999C14.1318 17.9999 13.8333 17.7014 13.8333 17.3332C13.8333 16.965 14.1318 16.6666 14.5 16.6666C14.8682 16.6666 15.1666 16.965 15.1666 17.3332ZM11.1666 17.9999C11.5348 17.9999 11.8333 17.7014 11.8333 17.3332C11.8333 16.965 11.5348 16.6666 11.1666 16.6666C10.7984 16.6666 10.5 16.965 10.5 17.3332C10.5 17.7014 10.7984 17.9999 11.1666 17.9999Z" fill="#5BBAA3"/> </svg> 
 // const [seeType, setSeeType] = useState<boolean>(false)`;

function ViewDonorsPage() {
  return (
    <Layout>
      <View style={styles.donorsContainer}>
        <Image source={{ uri: oceanUri }} style={styles.image} />
        <View style={[styles.container]}>
          <Text style={styles.title}>Restoring the Kakamega Forest</Text>
        </View>
        <View style={{ ...styles.container, borderRadius: 0, marginBottom: 80 }}>
          <DonorsList listType="donor" username="username123" donated={102700} />
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  donorsContainer: {
    backgroundColor: '#e2e7eb',
  },
  container: {
    width: '100%',
    padding: 24,
    shadowColor: '#000000',
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  image: {
    width: '100%',
    height: 192,
  },
  title: {
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
    marginBottom: 8,
  },
});

export default ViewDonorsPage;
