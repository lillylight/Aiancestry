import React from "react";

const termsContent = [
  {
    title: "1. Welcome & Acceptance",
    body: `Welcome to AI Ancestry! By accessing or using our service, you agree to these Terms & Conditions. This service is for entertainment and educational purposes only and should not be used for legal, medical, or governmental decisions.`
  },
  {
    title: "2. Data & Privacy",
    body: `No user images or personal data are stored or shared. All analysis is performed in-memory and is not retained after your session. By using this app, you consent to temporary processing of your uploaded images for the sole purpose of generating your ancestry report.`
  },
  {
    title: "3. Limitations & Disclaimers",
    body: `AI Ancestry is experimental and creative. The ancestry results are not scientifically validated and should not be interpreted as factual or used for health, legal, or official purposes. We are not responsible for decisions made based on these results.`
  },
  {
    title: "4. Contact & Feedback",
    body: `For questions, feedback, or concerns, please contact us at basezambia@gmail.com. We welcome your suggestions to improve the app.`
  }
];

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 18, boxShadow: "0 4px 32px #dde3ef33" }}>
      <h1 style={{ fontSize: 38, fontWeight: 800, color: "#23252b", marginBottom: 24, letterSpacing: "-1px" }}>Terms & Conditions</h1>
      {termsContent.map((section, idx) => (
        <section key={idx} style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: 23, fontWeight: 700, color: "#2f80ed", marginBottom: 10 }}>{section.title}</h2>
          <p style={{ fontSize: 17, color: "#23252b", margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>{section.body}</p>
        </section>
      ))}
      <footer style={{ fontSize: 14, color: "#888", marginTop: 40, textAlign: "center" }}>
        &copy; {new Date().getFullYear()} AI Ancestry. All rights reserved.
      </footer>
    </main>
  );
}
