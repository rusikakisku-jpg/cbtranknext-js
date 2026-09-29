'use client';

import { useState } from 'react';
import { submitContactMessageAction } from '../actions/calculate';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [alertMsg, setAlertMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      setStatus('error');
      setAlertMsg('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setStatus('error');
      setAlertMsg('Please enter a valid email address.');
      return;
    }

    setStatus('sending');

    try {
      const res = await submitContactMessageAction({
        name: formState.name,
        email: formState.email,
        subject: 'Contact Form Submission',
        message: formState.message
      });

      if (res && res.success) {
        setStatus('success');
        setAlertMsg('✅ Message sent successfully! We will contact you within 24 hours.');
        setFormState({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setAlertMsg('❌ Failed to send message. Please try again or email us directly at contact.cbtrank@gmail.com.');
      }
    } catch (err) {
      // Fallback: open mailto
      const mailtoLink = `mailto:contact.cbtrank@gmail.com?subject=Contact from ${encodeURIComponent(formState.name)}&body=${encodeURIComponent(formState.message)}`;
      window.open(mailtoLink, '_blank');
      setStatus('success');
      setAlertMsg('✅ Your email client has been opened. Please send the email to contact.cbtrank@gmail.com');
    }
  }

  return (
    <main>
      <div className="static-main">
        <div className="content-card">
          <div>
            <h1 className="page-title">Contact Us</h1>
            <p className="lead-text" style={{ margin: '8px 0 16px 0' }}>
              Have questions, feedback, or found a discrepancy in an exam answer key? Our support team is here to assist competitive exam aspirants and educators.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0044cc', textTransform: 'uppercase' }}>Direct Support Email</span>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
                <a href="mailto:contact.cbtrank@gmail.com" style={{ color: '#0044cc', textDecoration: 'none' }}>
                  contact.cbtrank@gmail.com
                </a>
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>Working Hours</span>
              <p style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
                Mon – Sat: 9:30 AM – 6:30 PM IST
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>Community &amp; Alerts</span>
              <p style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
                <a href="https://t.me/cbtrank" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', textDecoration: 'none' }}>
                  Telegram: @cbtrank
                </a>
              </p>
            </div>
          </div>

          {(status === 'success' || status === 'error') && (
            <div className={status === 'success' ? 'alert-success' : 'alert-error'} id="alert-box">
              {alertMsg}
            </div>
          )}

          <form id="contact-form" autoComplete="off" noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                className="form-input-static"
                required
                placeholder="Enter your full name"
                value={formState.name}
                onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                className="form-input-static"
                required
                placeholder="Enter your email address"
                value={formState.email}
                onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                className="form-textarea-static"
                required
                placeholder="Type your message, query, or exam feedback here..."
                value={formState.message}
                onChange={e => setFormState(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              id="send-btn"
              className="btn-send"
              disabled={status === 'sending'}
            >
              <span id="btn-label">
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </span>
            </button>

            <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
              Typical response turnaround time is within 24 business hours.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
