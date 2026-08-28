import { Link } from 'react-router-dom';
import { PageSEO } from '../../components';

const TermsPage = () => (
  <>
    <PageSEO.Terms />
    <h1 className="text-2xl font-bold text-fg">Terms of Service</h1>
    <p className="mt-4 text-sm leading-relaxed text-fg-secondary">
      SoftGate Comic Admin uses the same Terms of Service as the SoftGate Comic website. The full
      text lives on the public site. This page is a staff-console stub so signup clickwrap has a
      reachable link before those documents are hosted here.
    </p>
    <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary-600">
      Back to Login
    </Link>
  </>
);

export default TermsPage;
