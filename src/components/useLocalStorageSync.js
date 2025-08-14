import { useState, useEffect, useCallback } from 'react';

export const useLocalStorageSync = (key, defaultValue) => {
    const [value, setValue] = useState(() => {
        return window.localStorage.getItem(key) || defaultValue;
    });

    const setStorageValue = useCallback((newValue) => {
        setValue(newValue);
        window.localStorage.setItem(key, newValue);

        // Dispatch custom event for same-tab sync
        window.dispatchEvent(new CustomEvent('localStorageChange', {
            detail: { key, newValue }
        }));
    }, [key]);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== value) {
                setValue(e.newValue || defaultValue);
            }
        };

        const handleCustomStorageChange = (e) => {
            if (e.detail.key === key && e.detail.newValue !== value) {
                setValue(e.detail.newValue || defaultValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('localStorageChange', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('localStorageChange', handleCustomStorageChange);
        };
    }, [key, value, defaultValue]);

    return [value, setStorageValue];
};
