import { useEffect, useState } from 'react';

const API_KEY = process.env.REACT_APP_EXCHANGE_RATES;
const CURRENCIES = ['COP', 'PYG', 'PEN', 'BRL', 'MXN'];

export function useExchangeRates() {
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchRates = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `https://openexchangerates.org/api/latest.json?app_id=${API_KEY}&symbols=${CURRENCIES.join(',')}`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();

                // Convertir USD->X a 1/X (es decir, cuánto USD vale 1 unidad de esa moneda)
                const invertedRates = {};
                for (const currency of CURRENCIES) {
                    const rate = data.rates[currency];
                    invertedRates[currency] = rate ? 1 / rate : null;
                }

                setRates(invertedRates);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRates();

        return () => controller.abort();
    }, []);

    return { rates, loading, error };
}
