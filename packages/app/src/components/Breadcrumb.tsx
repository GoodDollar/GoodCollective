import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../utils/colors';
import { useNavigate } from 'react-router-dom';
import { chevronRight } from '../assets';

interface BreadcrumbProps {
  previousPage?: string;
  currentPage: string;
}

function Breadcrumb({ currentPage, previousPage }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <TouchableOpacity style={styles.container}>
      <TouchableOpacity onPress={() => navigate(-1)}>
        <Image source={chevronRight} style={styles.backIcon} />
      </TouchableOpacity>
      <Text style={styles.previousPage}>{previousPage ? previousPage : 'GoodCollective Home'}</Text>
      <Text style={styles.activePage}> / {currentPage}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  previousPage: { color: Colors.purple[200] },
  activePage: { color: Colors.gray[200] },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    transform: [{ rotate: '180deg' }],
    tintColor: Colors.purple[400],
  },
});

export default Breadcrumb;
