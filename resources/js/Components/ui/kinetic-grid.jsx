import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 28;
const LERP_SPEED = 0.08;
const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.13 };
const NODE_BASE_RADIUS = 1.8;
const NODE_ACTIVE_RADIUS = 3.2;

const lerpN = (a, b, t) => a + (b - a) * t;

function lerpColor(base, active, t) {
    const r = Math.round(lerpN(base.r, active.r, t));
    const g = Math.round(lerpN(base.g, active.g, t));
    const b = Math.round(lerpN(base.b, active.b, t));
    const a = lerpN(base.a, active.a, t);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

export default function KineticGrid({ children, className, globalColor = 'default', colorMode = 'dark' }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const targetMouseRef = useRef({ x: -9999, y: -9999 });
    const ripplesRef = useRef([]);
    const rafRef = useRef(0);
    const sizeRef = useRef({ w: 0, h: 0 });

    const getWarpedPoint = useCallback((gx, gy, col, row, mouse, ripples, cols, rows) => {
        const edgeMargin = 1.5;
        const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
        const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
        const pinFactor = colPin * colPin * rowPin * rowPin;
        const dx = gx - mouse.x;
        const dy = gy - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - distance / INFLUENCE_RADIUS) * pinFactor;

        let rippleX = 0;
        let rippleY = 0;
        for (const ripple of ripples) {
            const rdx = gx - ripple.x;
            const rdy = gy - ripple.y;
            const rippleDistance = Math.sqrt(rdx * rdx + rdy * rdy);
            const difference = rippleDistance - ripple.radius;
            const waveWidth = 55;
            if (Math.abs(difference) < waveWidth) {
                const strength = (1 - Math.abs(difference) / waveWidth) * ripple.opacity * 18 * pinFactor;
                const angle = Math.atan2(rdy, rdx);
                const direction = difference < 0 ? -1 : 1;
                rippleX += Math.cos(angle) * strength * direction * -1;
                rippleY += Math.sin(angle) * strength * direction * -1;
            }
        }

        if (distance < INFLUENCE_RADIUS && distance > 0 && pinFactor > 0) {
            const t = distance / INFLUENCE_RADIUS;
            const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, distance / 60);
            const angle = Math.atan2(dy, dx);
            const warpAmount = eased * MAX_WARP * pinFactor;
            return {
                pt: { x: gx - Math.cos(angle) * warpAmount + rippleX, y: gy - Math.sin(angle) * warpAmount + rippleY },
                proximity,
            };
        }

        return { pt: { x: gx + rippleX, y: gy + rippleY }, proximity };
    }, []);

    const draw = useCallback((now) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        const { w: width, h: height } = sizeRef.current;
        const theme = {
            dark: {
                bg: '#161618',
                lineActive: { r: 74, g: 158, b: 255, a: 0.9 },
                nodeActive: { r: 74, g: 158, b: 255, a: 1 },
                glow: '74,158,255',
                ripple: '100,180,255',
                lineBase: LINE_BASE,
                nodeBase: { r: 255, g: 255, b: 255, a: 0.2 },
                dot: 'rgba(255,255,255,0.05)',
            },
            light: {
                bg: '#f8fafc',
                lineActive: { r: 37, g: 99, b: 235, a: 0.8 },
                nodeActive: { r: 37, g: 99, b: 235, a: 1 },
                glow: '37,99,235',
                ripple: '37,99,235',
                lineBase: { r: 15, g: 23, b: 42, a: 0.14 },
                nodeBase: { r: 15, g: 23, b: 42, a: 0.25 },
                dot: 'rgba(15,23,42,0.06)',
            },
            monochrome: {
                bg: '#000000',
                lineActive: { r: 255, g: 255, b: 255, a: 0.9 },
                nodeActive: { r: 255, g: 255, b: 255, a: 1 },
                glow: '255,255,255',
                ripple: '255,255,255',
                lineBase: LINE_BASE,
                nodeBase: { r: 255, g: 255, b: 255, a: 0.2 },
                dot: 'rgba(255,255,255,0.05)',
            },
        }[globalColor === 'monochrome' ? 'monochrome' : colorMode];

        context.clearRect(0, 0, width, height);
        context.fillStyle = theme.bg;
        context.fillRect(0, 0, width, height);
        context.fillStyle = theme.dot;
        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
            for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
                context.beginPath();
                context.arc(x, y, 0.7, 0, Math.PI * 2);
                context.fill();
            }
        }

        const ripples = ripplesRef.current;
        for (let index = ripples.length - 1; index >= 0; index -= 1) {
            const ripple = ripples[index];
            const age = (now - ripple.born) / 1000;
            ripple.radius = Math.max(0, age * 400);
            ripple.opacity = Math.max(0, 1 - age * 1.2);
            if (ripple.opacity <= 0) ripples.splice(index, 1);
        }

        const columns = Math.max(2, Math.ceil(width / CELL_SIZE)) + 1;
        const rows = Math.max(2, Math.ceil(height / CELL_SIZE)) + 1;
        const cellWidth = width / (columns - 1);
        const cellHeight = height / (rows - 1);
        const points = [];
        const proximity = [];

        for (let row = 0; row < rows; row += 1) {
            points[row] = [];
            proximity[row] = [];
            for (let column = 0; column < columns; column += 1) {
                const warped = getWarpedPoint(column * cellWidth, row * cellHeight, column, row, mouseRef.current, ripples, columns, rows);
                points[row][column] = warped.pt;
                proximity[row][column] = warped.proximity;
            }
        }

        const drawSegment = (first, second, firstProximity, secondProximity) => {
            const average = (firstProximity + secondProximity) / 2;
            const t = average * average * (3 - 2 * average);
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.strokeStyle = lerpColor(theme.lineBase, theme.lineActive, t);
            context.lineWidth = lerpN(0.8, 1.5, t);
            context.stroke();
        };

        context.lineCap = 'butt';
        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns - 1; column += 1) {
                drawSegment(points[row][column], points[row][column + 1], proximity[row][column], proximity[row][column + 1]);
            }
        }
        for (let column = 0; column < columns; column += 1) {
            for (let row = 0; row < rows - 1; row += 1) {
                drawSegment(points[row][column], points[row + 1][column], proximity[row][column], proximity[row + 1][column]);
            }
        }

        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
                const point = points[row][column];
                const t = proximity[row][column] ** 2 * (3 - 2 * proximity[row][column]);
                const radius = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);
                if (t > 0.3) {
                    const glowRadius = radius + lerpN(0, 6, (t - 0.3) / 0.7);
                    const gradient = context.createRadialGradient(point.x, point.y, radius * 0.5, point.x, point.y, glowRadius);
                    gradient.addColorStop(0, `rgba(${theme.glow},${(t * 0.3).toFixed(3)})`);
                    gradient.addColorStop(1, `rgba(${theme.glow},0)`);
                    context.beginPath();
                    context.arc(point.x, point.y, glowRadius, 0, Math.PI * 2);
                    context.fillStyle = gradient;
                    context.fill();
                }
                context.beginPath();
                context.arc(point.x, point.y, radius, 0, Math.PI * 2);
                context.fillStyle = lerpColor(theme.nodeBase, theme.nodeActive, t);
                context.fill();
            }
        }

        for (const ripple of ripples) {
            context.beginPath();
            context.arc(ripple.x, ripple.y, Math.max(0, ripple.radius), 0, Math.PI * 2);
            context.strokeStyle = `rgba(${theme.ripple},${(ripple.opacity * 0.28).toFixed(3)})`;
            context.lineWidth = 1.5;
            context.stroke();
        }
    }, [colorMode, getWarpedPoint, globalColor]);

    const animate = useCallback((now) => {
        mouseRef.current.x = lerpN(mouseRef.current.x, targetMouseRef.current.x, LERP_SPEED);
        mouseRef.current.y = lerpN(mouseRef.current.y, targetMouseRef.current.y, LERP_SPEED);
        draw(now);
        rafRef.current = requestAnimationFrame(animate);
    }, [draw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            sizeRef.current = { w: canvas.width, h: canvas.height };
        };
        const onMouseMove = (event) => {
            targetMouseRef.current = { x: event.clientX, y: event.clientY };
        };
        const onClick = (event) => {
            ripplesRef.current.push({ x: event.clientX, y: event.clientY, radius: 0, opacity: 1, born: performance.now() });
        };

        setSize();
        window.addEventListener('resize', setSize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);
        rafRef.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('resize', setSize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            cancelAnimationFrame(rafRef.current);
        };
    }, [animate]);

    return (
        <div className={cn('relative min-h-screen w-full overflow-hidden', globalColor === 'monochrome' ? 'bg-black' : colorMode === 'light' ? 'bg-slate-50' : 'bg-[#161618]', className)}>
            <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
            <div className="relative z-10 h-full w-full">{children}</div>
        </div>
    );
}
