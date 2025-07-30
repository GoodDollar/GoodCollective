import { Image, Pressable, Text } from 'native-base';
import { useNavigate } from 'react-router-dom';
import { chevronRight } from '../../assets';

export interface BreadcrumbPathEntry {
  text: string;
  route: string;
}

interface BreadcrumbProps {
  path: BreadcrumbPathEntry[];
}

function Breadcrumb({ path }: BreadcrumbProps) {
  const navigate = useNavigate();
  const onClickBack = () => navigate(-1);
  const onClickHome = () => navigate('/');

  return (
    <Pressable {...styles.container}>
      <Pressable onPress={onClickBack}>
        <Image source={chevronRight} alt="back" {...styles.backIcon} />
      </Pressable>
      <Text {...(path.length === 0 ? styles.activePage : styles.previousPage)} onPress={onClickHome}>
        GoodCollective Home
      </Text>
      {path.map((entry, index) => (
        <Text
          key={index}
          {...(index === path.length - 1 ? styles.activePage : styles.previousPage)}
          onPress={() => navigate(entry.route)}>
          {` / ${entry.text}`}
        </Text>
      ))}
    </Pressable>
  );
}

const styles = {
  container: {
    height: 24,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  previousPage: { color: 'goodPurple.400' },
  activePage: { color: 'goodGrey.25' },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    transform: [{ rotate: '180deg' }],
    tintColor: 'goodPurple.500',
  },
};

export default Breadcrumb;
