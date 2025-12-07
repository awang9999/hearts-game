import './Footer.css';

/**
 * Footer component
 * Displays creator information and link to personal website
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-text">Created by </span>
        <a
          href="https://alexander-wang.net"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Alexander Wang
        </a>
      </div>
    </footer>
  );
}

export default Footer;
