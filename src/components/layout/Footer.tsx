import { Landmark } from 'lucide-react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <Landmark size={24} />
              <span>Open CoreBank</span>
            </div>
            <p className="footer-tagline">
              A personal portfolio project simulating a modern homebanking experience.
              Not a real financial institution — no real funds or data are involved.
            </p>
            <div className="footer-social">
              <a
                href="https://www.linkedin.com/in/mateoalonso20/"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div className="footer-links-section">
            <h4>Features</h4>
            <ul>
              <li><a href="#">Checking Accounts</a></li>
              <li><a href="#">Savings Accounts</a></li>
              <li><a href="#">Investment Accounts</a></li>
              <li><a href="#">Transfers</a></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Security</h4>
            <ul>
              <li><a href="#">Two-Factor Auth</a></li>
              <li><a href="#">Password Management</a></li>
              <li><a href="#">Session Control</a></li>
              <li><a href="#">Account Protection</a></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Creator</h4>
            <ul>
              <li>
                <a
                  href="https://www.linkedin.com/in/mateoalonso20/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mateo Alonso
                </a>
              </li>
              <li><a href="https://www.linkedin.com/in/mateoalonso20/" target="_blank" rel="noopener noreferrer">LinkedIn Profile</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Open CoreBank — Personal demo project by Mateo Alonso.</p>
          <span className="demo-badge">Demo Project</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
