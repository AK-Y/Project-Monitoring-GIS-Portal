import { useEffect } from "react";
import { useSelector } from "react-redux";

const ThemeManager = () => {
    const { mode } = useSelector((state) => state.theme);

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (theme) => {
            root.classList.remove("light", "dark");

            if (theme === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                root.classList.add(systemTheme);
            } else {
                root.classList.add(theme);
            }
        };

        applyTheme(mode);

        // Listen for system theme changes if in system mode
        if (mode === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme("system");
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [mode]);

    return null;
};

export default ThemeManager;
