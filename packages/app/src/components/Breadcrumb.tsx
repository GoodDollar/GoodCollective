import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ChevronLeftIcon } from '../@constants/ChevronIcons';
import { Colors } from '../utils/colors';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbProps {
  previousPage?: string;
  currentPage: string;
}

function Breadcrumb({ currentPage, previousPage }: BreadcrumbProps) {
  const navigate = useNavigate();
  return (
    <TouchableOpacity style={styles.container} onPress={() => navigate(-1)}>
      <Image source={{ uri: ChevronLeftIcon }} style={styles.backIcon} />
      <Text style={styles.activePage}>{previousPage ?? 'GoodCollective Home'}</Text>
      <Text style={styles.nextPage}> / {currentPage}</Text>
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
  activePage: { color: Colors.purple[200] },
  nextPage: { color: Colors.gray[200] },
  backIcon: { width: 20, height: 20, marginRight: 10 },
});

export default Breadcrumb;
