/**
 * PublicFormLayout
 * 
 * Standalone layout for public form pages (Google Forms style)
 * - No sidebar
 * - No navigation menu
 * - Mobile-friendly
 * - Clean, simple design
 */

import React from 'react';
import '../styles/PublicFormLayout.css';

interface PublicFormLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const PublicFormLayout: React.FC<PublicFormLayoutProps> = ({ children, title }) => {
  return (
    <div className="public-form-container">
      {/* Simple header */}
      <header className="public-form-header">
        <div className="public-form-header-content">
          <h1 className="public-form-logo">EventsForge</h1>
          {title && <p className="public-form-subtitle">{title}</p>}
        </div>
      </header>

      {/* Main content area - centered, full width on mobile */}
      <main className="public-form-main">
        <div className="public-form-wrapper">{children}</div>
      </main>

      {/* Simple footer */}
      <footer className="public-form-footer">
        <p>
          Powered by{' '}
          <a href="https://eventsforge.com" target="_blank" rel="noopener noreferrer">
            EventsForge
          </a>
        </p>
      </footer>
    </div>
  );
};

export default PublicFormLayout;
