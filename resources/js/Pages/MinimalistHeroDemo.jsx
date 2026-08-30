import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { AtSign, Camera, Globe2, Send } from 'lucide-react';
import { MinimalistHero } from '@/components/ui/minimalist-hero';
import KineticGrid from '@/components/ui/kinetic-grid';

export default function MinimalistHeroDemo() {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') return true;
        const savedTheme = window.localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    return (
        <>
            <Head title="Minimalist" />
            <KineticGrid colorMode={darkMode ? 'dark' : 'light'}>
                <MinimalistHero
                    className={darkMode ? 'bg-transparent [--foreground:0_0%_100%]' : 'bg-transparent [--foreground:222.2_47.4%_11.2%]'}
                    darkMode={darkMode}
                    onThemeChange={setDarkMode}
                    logoText="mnmlst."
                    navLinks={[
                        { label: 'HOME', href: '#' },
                        { label: 'PRODUCT', href: '#product' },
                        { label: 'STORE', href: '#store' },
                        { label: 'ABOUT US', href: '#about' },
                    ]}
                    mainText="Designed around restraint, form, and the quiet confidence of essentials that last."
                    readMoreLink="#about"
                    imageSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85"
                    imageAlt="Portrait of a person in a dark turtleneck"
                    overlayText={{ part1: 'less is', part2: 'more.' }}
                    socialLinks={[
                        { icon: Globe2, href: 'https://example.com/#web' },
                        { icon: Camera, href: 'https://example.com/#photos' },
                        { icon: Send, href: 'https://example.com/#messages' },
                        { icon: AtSign, href: 'https://example.com/#contact' },
                    ]}
                    locationText="Arlington Heights, IL"
                />
            </KineticGrid>
        </>
    );
}
