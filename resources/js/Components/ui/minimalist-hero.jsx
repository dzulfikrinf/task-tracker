import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NavLink = ({ href, children }) => (
    <a
        href={href}
        className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground"
    >
        {children}
    </a>
);

const SocialIcon = ({ href, icon: Icon }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground/60 transition-colors hover:text-foreground"
    >
        <Icon className="h-5 w-5" />
    </a>
);

const getInitialTheme = () => {
    if (typeof window === 'undefined') return false;

    const savedTheme = window.localStorage.getItem('theme');
    return savedTheme
        ? savedTheme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * A reusable, animated full-screen hero.
 * Pass Lucide icon components in socialLinks (for example, Instagram).
 */
export const MinimalistHero = ({
    logoText,
    navLinks,
    mainText,
    readMoreLink,
    imageSrc,
    imageAlt,
    overlayText,
    socialLinks,
    locationText,
    className,
    darkMode,
    onThemeChange,
}) => {
    const [localDarkMode, setLocalDarkMode] = useState(getInitialTheme);
    const isDark = darkMode ?? localDarkMode;

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => {
        const nextTheme = !isDark;
        if (onThemeChange) {
            onThemeChange(nextTheme);
            return;
        }
        setLocalDarkMode(nextTheme);
    };

    return (
        <div
        className={cn(
            'relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-background p-8 font-sans text-foreground transition-colors duration-300 md:p-12',
            className,
        )}
    >
        <header className="z-30 flex w-full max-w-7xl items-center justify-between">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl font-bold tracking-wider"
            >
                {logoText}
            </motion.div>
            <div className="flex items-center gap-5">
                <nav className="hidden items-center space-x-8 md:flex" aria-label="Main navigation">
                    {navLinks.map((link) => (
                        <NavLink key={link.label} href={link.href}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="rounded-full p-2 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <motion.button
                    type="button"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col space-y-1.5 md:hidden"
                    aria-label="Open menu"
                >
                    <span className="block h-0.5 w-6 bg-foreground" />
                    <span className="block h-0.5 w-6 bg-foreground" />
                    <span className="block h-0.5 w-5 bg-foreground" />
                </motion.button>
            </div>
        </header>

        <main className="relative grid w-full max-w-7xl flex-grow grid-cols-1 items-center gap-10 py-10 md:grid-cols-3 md:gap-0 md:py-0">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="z-20 order-2 text-center md:order-1 md:text-left"
            >
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-foreground/80 md:mx-0">{mainText}</p>
                <a href={readMoreLink} className="mt-4 inline-block text-sm font-medium underline decoration-from-font">
                    Read More
                </a>
            </motion.div>

            <div className="relative order-1 flex h-full min-h-64 items-center justify-center md:order-2">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="absolute z-0 h-[300px] w-[300px] rounded-full bg-yellow-400/90 md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]"
                />
                <motion.img
                    src={imageSrc}
                    alt={imageAlt}
                    className="relative z-10 h-auto w-48 scale-125 object-cover sm:w-56 md:w-64 md:scale-150 lg:w-72"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = 'https://placehold.co/400x600/eab308/ffffff?text=Image+Not+Found';
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="z-20 order-3 flex items-center justify-center text-center md:justify-start"
            >
                <h1 className="text-6xl font-extrabold leading-none md:text-8xl lg:text-9xl">
                    {overlayText.part1}
                    <br />
                    {overlayText.part2}
                </h1>
            </motion.div>
        </main>

        <footer className="z-30 flex w-full max-w-7xl items-center justify-between gap-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="flex items-center space-x-4"
            >
                {socialLinks.map((link) => (
                    <SocialIcon key={link.href} href={link.href} icon={link.icon} />
                ))}
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="text-right text-sm font-medium text-foreground/80"
            >
                {locationText}
            </motion.p>
        </footer>
        </div>
    );
};
