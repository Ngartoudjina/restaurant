import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import '@/styles/braise-bronze.css';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 — route inexistante :', location.pathname);
  }, [location.pathname]);

  return (
    <div className="nf">
      <div>
        <p className="nf__code">404</p>
        <h1 className="nf__msg">Cette table n'existe pas.</h1>
        <p className="nf__sub">
          La page que vous cherchez a peut-être changé d'adresse — ou n'a jamais été à la carte.
        </p>
        <Link to="/" className="bb-btn bb-btn--bronze">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
