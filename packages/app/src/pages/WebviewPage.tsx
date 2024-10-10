import { WebView } from 'react-native-webview';
import Layout from '../components/Layout/Layout';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

export const WebviewPage = ({ uri }: { uri: string }) => {
  const { height: safeAreaHeight } = useSafeAreaFrame();

  return (
    <Layout breadcrumbPath={[{ text: 'About', route: '/about' }]}>
      <WebView
        source={{ uri }}
        style={{ height: safeAreaHeight - 120 }}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </Layout>
  );
};
