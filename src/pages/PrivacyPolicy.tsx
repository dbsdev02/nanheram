const PrivacyPolicy = () => {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>

      <div className="prose prose-sm text-muted-foreground space-y-6">
        <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly, such as your name, email address, phone number, and shipping address when you create an account or place an order.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To process and fulfill your orders</li>
            <li>To communicate with you about your orders and account</li>
            <li>To improve our products and services</li>
            <li>To send promotional communications (with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information with delivery partners to fulfill orders and with payment processors to handle transactions securely.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Cookies</h2>
          <p>We use cookies to enhance your browsing experience and analyze website traffic. You can control cookie settings through your browser preferences.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information at any time through your account settings or by contacting us.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through our Contact page or WhatsApp.</p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
