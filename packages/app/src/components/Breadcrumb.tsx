import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../utils/colors';
import { useNavigate } from 'react-router-dom';
import { chevronRight } from '../assets';

export interface BreadcrumbPathEntry {
  text: string;
  route: string;
}

interface BreadcrumbProps {
  path: BreadcrumbPathEntry[];
}

function Breadcrumb({ path }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <TouchableOpacity style={styles.container}>
      <TouchableOpacity onPress={() => navigate(-1)}>
        <Image source={chevronRight} style={styles.backIcon} />
      </TouchableOpacity>
      <Text style={path.length === 0 ? styles.activePage : styles.previousPage} onPress={() => navigate('/')}>
        GoodCollective Home
      </Text>
      {path.map((entry, index) => (
        <Text
          key={index}
          style={index === path.length - 1 ? styles.activePage : styles.previousPage}
          onPress={() => navigate(entry.route)}>
          {` / ${entry.text}`}
        </Text>
      ))}
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
