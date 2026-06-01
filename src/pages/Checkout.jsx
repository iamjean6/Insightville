import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const Checkout = () => {
    const [selectedPackage, setSelectedPackage] = useState('basic');
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const packages = [
        { id: 'basic', name: 'Basic Tier', credits: 5, price: '$1.00', value: '1.00' },
        { id: 'pro', name: 'Pro Tier', credits: 25, price: '$5.00', value: '5.00' }
    ];

    const handleCreateOrder = async () => {
        try {
            // Call our backend to create the order securely
            const res = await api.post('/paypal/create-order', { packageId: selectedPackage });
            return res.data.id; // Return the order ID to PayPal
        } catch (err) {
            enqueueSnackbar("Failed to create order. Are you logged in?", { variant: "error" });
            throw err;
        }
    };

    const handleApprove = async (data, actions) => {
        // We don't need to call a capture endpoint because our webhook handles it!
        // We just let PayPal capture it on the client side, or wait for the webhook.
        // Actually, for Webhooks to fire on capture, the order must be captured.
        // If the backend creates the order with intent: "CAPTURE", 
        // calling actions.order.capture() will capture the funds, which triggers the PAYMENT.CAPTURE.COMPLETED webhook.
        try {
            await actions.order.capture();
            enqueueSnackbar("Payment successful! Your credits will appear in a moment.", { variant: "success" });
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            enqueueSnackbar("Payment capture failed.", { variant: "error" });
        }
    };

    return (
        <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
            <div className="min-h-screen bg-background flex flex-col items-center py-20 px-4">
                <h1 className="text-4xl font-bold text-foreground mb-4">Buy Audio Credits</h1>
                <p className="text-muted-foreground mb-12 text-center max-w-md">
                    To use our high-quality AI text-to-speech feature, please purchase credits. 1 Credit = 1 Article Listen.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl">
                    {packages.map((pkg) => (
                        <div 
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                selectedPackage === pkg.id 
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                                : 'border-border bg-card hover:border-primary/50'
                            }`}
                        >
                            <h3 className="text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
                            <div className="text-4xl font-black text-primary mb-4">{pkg.price}</div>
                            <ul className="space-y-2 text-muted-foreground font-medium">
                                <li>✨ {pkg.credits} Audio Credits</li>
                                <li>✨ Never expires</li>
                                <li>✨ Instant delivery</li>
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-md bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h4 className="text-lg font-bold text-foreground mb-6 text-center">Complete your purchase securely</h4>
                    <PayPalButtons 
                        style={{ layout: "vertical", shape: "pill" }}
                        createOrder={handleCreateOrder}
                        onApprove={handleApprove}
                        onError={(err) => {
                            console.error("PayPal Error:", err);
                            enqueueSnackbar("Something went wrong with PayPal.", { variant: "error" });
                        }}
                    />
                </div>
            </div>
        </PayPalScriptProvider>
    );
};

export default Checkout;
