import { Link } from 'react-router-dom';
import { PageSEO } from '../../components';

const PrivacyPage = () => (
  <>
    <PageSEO.Privacy />
    <h1 className="text-2xl font-bold text-fg">Privacy Policy</h1>
    <p className="mt-4 text-sm leading-relaxed text-fg-secondary">
      SoftGate Comic Admin uses the same Privacy Policy as the SoftGate Comic website. The full text
      lives on the public site. This page is a staff-console stub so signup clickwrap can
      acknowledge privacy before the public policy is mirrored here.
    </p>
    <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary-600">
      Back to Login
    </Link>
  </>
);

export default PrivacyPage;
