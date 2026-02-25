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
              Managing your wealth with precision and care. Trusted by over 2 million customers worldwide.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Facebook</a>
            </div>
          </div>

          <div className="footer-links-section">
            <h4>Products</h4>
            <ul>
              <li><a href="#">Checking Accounts</a></li>
              <li><a href="#">Savings Accounts</a></li>
              <li><a href="#">Credit Cards</a></li>
              <li><a href="#">Loans</a></li>
              <li><a href="#">Investments</a></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Mobile App</a></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Partners</a></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Licenses</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Open CoreBank. All rights reserved.</p>
          <div className="footer-badges">
            <span className="badge">FDIC Insured</span>
            <span className="badge">PCI DSS Compliant</span>
            <span className="badge">256-bit Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
