import { useState } from 'react';
import axios from 'axios';
import { MessageCircle, Mail, User, Send, MapPin, Phone } from 'lucide-react';

const CONTACT_IMAGE = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=900&auto=format&fit=crop';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  async function submit(e) {
    e.preventDefault();
    setStatus('');
    try {
      await axios.post('/api/contact', { name, email, message });
      setStatus('Thanks! We will get back to you.');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to send');
    }
  }
const isSuccess = status && !status.toLowerCase().includes('fail');
  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-blob auth-blob-3" aria-hidden="true" />

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 animate-auth-fade-in">
        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="auth-card h-full">
            <div className="auth-card-header text-left">
              <div className="auth-icon-wrap">
                <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h2 className="auth-title text-left">Contact Us</h2>
              <p className="auth-subtitle text-left">
                Have a question or want to list your shop? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="contact-hero-image group">
              <img
                src={CONTACT_IMAGE}
                alt="Team collaborating and ready to help"
                loading="lazy"
              />
              <div className="contact-hero-overlay">
                <p className="text-white text-sm sm:text-base font-semibold">
                  Our team is here to help you grow with LocalLoot
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-2">
              <div className="contact-info-card">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">support@localloot.com</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">Pune, Maharashtra, India</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Response Time</p>
                  <p className="text-sm text-gray-600">Within 24–48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="lg:col-span-3">
          <div className="auth-card">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Send us a message</h3>
            <p className="text-sm text-gray-600 mb-6">Fill in the form below and we&apos;ll get back to you soon.</p>

            <form onSubmit={submit} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="contact-name" className="auth-label">Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    id="contact-name"
                    className="auth-input pl-11"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-email" className="auth-label">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    id="contact-email"
                    type="email"
                    className="auth-input pl-11"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="auth-label">Message</label>
                <textarea
                  id="contact-message"
                  className="auth-textarea"
                  placeholder="Tell us how we can help..."
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {status && (
                <p className={isSuccess ? 'auth-status-success' : 'auth-status-error'}>
                  {status}
                </p>
              )}

              <button className="auth-btn flex items-center justify-center gap-2" type="submit">
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
