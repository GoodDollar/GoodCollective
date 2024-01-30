import AboutCard from '../components/AboutCard';
import Layout from '../components/Layout/Layout';

function AboutPage() {
  return (
    <Layout breadcrumbPath={[{ text: 'About', route: '/about' }]}>
      <AboutCard />
    </Layout>
  );
}

export default AboutPage;
