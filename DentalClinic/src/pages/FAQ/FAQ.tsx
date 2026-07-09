import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card, CardBody } from '../../components/Card';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: "Are you accepting new patients?",
    answer: "Yes, we are always welcoming new patients! You can book an appointment online through our portal or by calling our office directly."
  },
  {
    question: "Do you accept my dental insurance?",
    answer: "We accept most major dental insurance plans. Please contact our office with your insurance information before your visit so we can verify your coverage and benefits."
  },
  {
    question: "What should I bring to my first appointment?",
    answer: "Please bring a valid photo ID, your dental insurance card (if applicable), and a list of any current medications you are taking. You can also fill out your new patient paperwork online beforehand."
  },
  {
    question: "How often should I have a dental check-up?",
    answer: "The American Dental Association recommends a professional check-up and cleaning at least every six months. However, depending on your oral health needs, we may recommend more frequent visits."
  },
  {
    question: "Do you offer emergency dental care?",
    answer: "Yes, we provide emergency dental services. If you are experiencing severe pain, swelling, or have a knocked-out tooth, please call our emergency line immediately."
  },
  {
    question: "Do you treat children?",
    answer: "Absolutely! We provide comprehensive family dentistry and love treating patients of all ages, including young children for their first dental visits."
  },
  {
    question: "What financing options are available?",
    answer: "We believe everyone deserves a healthy smile. We offer flexible payment plans and partner with third-party financing companies like CareCredit. We accept cash, major credit cards, and HSA/FSA payments."
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`container animate-fade-in ${styles.faqPage}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Frequently Asked Questions</h1>
        <p className={styles.pageSubtitle}>
          Find answers to common questions about our services, insurance, and what to expect during your visit.
        </p>
      </div>

      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <button 
              className={styles.faqQuestion} 
              onClick={() => toggleAccordion(index)}
              aria-expanded={openIndex === index}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <HelpCircle size={20} color="var(--color-primary)" />
                <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-lg)', textAlign: 'left' }}>
                  {faq.question}
                </span>
              </div>
              {openIndex === index ? (
                <ChevronUp size={20} color="var(--color-text-secondary)" />
              ) : (
                <ChevronDown size={20} color="var(--color-text-secondary)" />
              )}
            </button>
            
            <div 
              className={`${styles.faqAnswer} ${openIndex === index ? styles.open : ''}`}
            >
              <div className={styles.faqAnswerContent}>
                <p className="text-muted">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
