const TermsAndConditions = () => {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Terms & Conditions</h1>

      <div className="prose prose-sm text-muted-foreground space-y-6">
        <p>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing and using this website, you accept and agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Products & Pricing</h2>
          <p>All product prices are listed in Indian Rupees (₹). We reserve the right to modify prices at any time without prior notice. Products are subject to availability.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Orders & Payment</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Orders are confirmed only after successful payment or acceptance of Cash on Delivery</li>
            <li>We reserve the right to cancel orders due to stock unavailability or pricing errors</li>
            <li>Payment information is processed securely through our payment partners</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Shipping & Delivery</h2>
          <p>We aim to deliver orders within the estimated delivery time. Delivery times may vary based on location and availability. Shipping charges, if applicable, will be displayed at checkout.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Returns & Refunds</h2>
          <p>Due to the perishable nature of our products, returns are accepted only if the product is damaged or defective upon delivery. Please contact us within 24 hours of delivery with photographic evidence.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Account Responsibility</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Intellectual Property</h2>
          <p>All content on this website, including logos, images, and text, is the property of NanheRam and is protected by intellectual property laws.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
          <p>We shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use of our website after changes constitutes acceptance of the revised terms.</p>
        </section>
      </div>
    </main>
  );
};

export default TermsAndConditions;
