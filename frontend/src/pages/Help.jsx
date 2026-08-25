import React from 'react';
import { HelpCircle, Landmark, Compass, CreditCard, ShieldCheck } from 'lucide-react';

const Help = () => {
  const faqs = [
    {
      q: 'How does the digital QR ticket work?',
      a: 'After completing payment, a unique QR code is generated. Present this QR code on your mobile device at the automatic fare collection (AFC) entry and exit gates. The scanner will read the code, check its validity, and open the gate.'
    },
    {
      q: 'How long is my ticket valid?',
      a: 'Single Journey tickets are valid for entry within 180 minutes from the time of booking on the selected journey date. Once you enter the system, you must exit within 180 minutes to avoid surcharge penalties.'
    },
    {
      q: 'Can I cancel my ticket and get a refund?',
      a: 'Yes. You can cancel your ticket from the "My Tickets" section prior to the scheduled travel date. Once cancelled, a full refund is automatically initiated through our payment gateway to your original payment method.'
    },
    {
      q: 'Is it possible to share my ticket with someone else?',
      a: 'Tickets are non-transferable. The QR code represents a secure verification payload containing the passenger count. Sharing the QR code is not recommended as it can only be scanned once at the entry turnstile.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex-grow space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
          <HelpCircle className="h-7 w-7 text-teal-650 text-teal-600" />
          <span>Help & Support Center</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1.5">Learn how to ride, buy tickets, and manage transactions.</p>
      </div>

      {/* Guide steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 font-extrabold flex items-center justify-center mx-auto text-sm">1</div>
          <h4 className="font-bold text-gray-800 text-sm">Plan Route</h4>
          <p className="text-xs text-gray-400">Select source/destination and preview map.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 font-extrabold flex items-center justify-center mx-auto text-sm">2</div>
          <h4 className="font-bold text-gray-800 text-sm">Enter Details</h4>
          <p className="text-xs text-gray-400">Set travelers count and contact credentials.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 font-extrabold flex items-center justify-center mx-auto text-sm">3</div>
          <h4 className="font-bold text-gray-800 text-sm">Pay Securely</h4>
          <p className="text-xs text-gray-400">Checkout instantly via Cards, UPI, Netbanking.</p>
        </div>
        <div className="text-center space-y-2">
          <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 font-extrabold flex items-center justify-center mx-auto text-sm">4</div>
          <h4 className="font-bold text-gray-800 text-sm">Scan QR Code</h4>
          <p className="text-xs text-gray-400">Load the digital ticket at AFC turnstiles.</p>
        </div>
      </div>

      {/* Pricing Rule Info */}
      <div className="bg-teal-50 border border-teal-150 p-6 rounded-lg text-teal-900">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-1.5 text-teal-850">
          <Landmark className="h-5 w-5" />
          Configurable Fare Metrics
        </h3>
        <p className="text-xs leading-relaxed opacity-90">
          Fares are calculated based on shortest path distance traversed:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4 text-center text-xs font-semibold">
          <div className="bg-white/70 p-2.5 rounded border border-teal-100"><span className="block text-[10px] text-gray-400">0-2 km</span> ₹10</div>
          <div className="bg-white/70 p-2.5 rounded border border-teal-100"><span className="block text-[10px] text-gray-400">2-5 km</span> ₹20</div>
          <div className="bg-white/70 p-2.5 rounded border border-teal-100"><span className="block text-[10px] text-gray-400">5-12 km</span> ₹30</div>
          <div className="bg-white/70 p-2.5 rounded border border-teal-100"><span className="block text-[10px] text-gray-400">12-21 km</span> ₹40</div>
          <div className="bg-white/70 p-2.5 rounded border border-teal-100"><span className="block text-[10px] text-gray-400">21-32 km</span> ₹50</div>
          <div className="bg-white/70 p-2.5 rounded border border-teal-100"><span className="block text-[10px] text-gray-400">32+ km</span> ₹60</div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-gray-800 border-b border-gray-100 pb-2">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-2">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <span className="h-5 w-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-500 font-extrabold">Q</span>
                {faq.q}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
