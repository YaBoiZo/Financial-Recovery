import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart
} from 'recharts';
import {
    Upload, Plus, Trash2, DollarSign, TrendingUp, TrendingDown, PiggyBank,
    CreditCard, MessageCircle, BarChart3, ArrowUpRight, ArrowDownRight,
    FileText, Target, Sparkles, Send, ChevronRight, AlertTriangle, CheckCircle,
    Wallet, Home, Car, Zap, ShoppingBag, Utensils, Heart, Tv, Bus, Repeat,
    HelpCircle, X, GripVertical, Calendar, Loader2, Bot, User, Info,
    Shield, GraduationCap, Plane, HandHeart, Receipt, Search, ChevronLeft,
    Filter, Hash, Stethoscope, Building2, Wrench
} from 'lucide-react';

/* ═══════════════════════════════════════════
   CONSTANTS & HELPERS
   ═══════════════════════════════════════════ */

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'recovery', label: 'Recovery Plan', icon: Target },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'debts', label: 'Debts', icon: CreditCard },
    { id: 'savings', label: 'Savings Plan', icon: PiggyBank },
    { id: 'networth', label: 'Net Worth', icon: TrendingUp },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles },
    { id: 'doctor', label: 'Spend Check', icon: Stethoscope },
];

const CATEGORIES = [
    { name: 'Food & Dining', icon: Utensils, color: '#f59e0b' },
    { name: 'Transport', icon: Car, color: '#3b82f6' },
    { name: 'Mortgage', icon: Building2, color: '#14b8a6' },
    { name: 'Maintenance', icon: Wrench, color: '#0ea5e9' },
    { name: 'Housing', icon: Home, color: '#2dd4bf' },
    { name: 'Shopping', icon: ShoppingBag, color: '#06b6d4' },
    { name: 'Insurance', icon: Shield, color: '#a855f7' },
    { name: 'Subscriptions', icon: Repeat, color: '#8b5cf6' },
    { name: 'Healthcare', icon: Heart, color: '#ef4444' },
    { name: 'Utilities', icon: Zap, color: '#f97316' },
    { name: 'Entertainment', icon: Tv, color: '#ec4899' },
    { name: 'Education', icon: GraduationCap, color: '#0ea5e9' },
    { name: 'Travel', icon: Plane, color: '#6366f1' },
    { name: 'Donations', icon: HandHeart, color: '#d946ef' },
    { name: 'Taxes & Fees', icon: Receipt, color: '#f43f5e' },
    { name: 'Income', icon: DollarSign, color: '#0ecb81' },
    { name: 'Transfers', icon: ArrowUpRight, color: '#64748b' },
    { name: 'Debt Payments', icon: CreditCard, color: '#e11d48' },
    { name: 'Other', icon: HelpCircle, color: '#94a3b8' },
];

// ORDER MATTERS: more-specific categories first to avoid false matches
const CATEGORY_KEYWORDS = {
    'Transfers': ['tfr-to', 'tfr-fr', 'send e-tfr', 'pts to:', 'ssv to:', 'cash app', 'wire', 'ach', 'atm w/d', 'fx atm w/d', 'atm dep', 'cash withdra', 'moved funds', 'to:td c/c'],
    'Income': ['redpath sugar', 'gc 3384-deposit', 'e-transfer', 'mobile deposit', 'cancel e-tfr', 'deposit', 'payroll', 'salary', 'income', 'direct dep', 'employer', 'refund', 'reimbursement', 'cashback', 'dividend', 'interest earned'],
    'Mortgage': ['td mortgage', 'mortgage', 'mtg pmt', 'home loan', 'first national', 'mcap', 'rbc mortgage', 'bmo mortgage', 'cibc mortgage', 'scotiabank mtg'],
    'Maintenance': ['tscc', 'hoa', 'condo fee', 'condo corp', 'strata fee', 'maintenance fee', 'property management', 'building fee', 'common element'],
    'Housing': ['rent', 'lease', 'property', 'landlord', 'apartment', 'realty', 'century21'],
    'Insurance': ['pafco ins', 'insurance', 'insur'],
    'Education': ['centennial coll', 'osap', 'nslsc', 'ocas applicatio', 'tuition', 'college', 'university', 'school', 'mcmaster childr'],
    'Travel': ['air can', 'united air', 'flair indirect', 'expedia', 'hotel', 'airbnb', 'booking.com', 'flight', 'airline', 'smf*porter', 'ag travel', 'porter', 'pinehurst lake', 'ca wonderland', 'clifton hill'],
    'Donations': ['muslim associat', 'jamia masji', 'launchgood', 'sq *jamia', 'charity', 'donation', 'mosque', 'church fund', 'brantcommunityh', 'thecorporationo', 'sq *gifty'],
    'Taxes & Fees': ['gov*tor-tax', 'toronto tax', 'anytim  fee', 'monthly account fee', 'fx atm w/d fee', 'cancel e-tfr fee', 'abc*4189', 'afterpay'],
    'Food & Dining': ['starbucks', 'mcdonald', 'burger', 'pizza', 'restaurant', 'cafe', 'coffee', 'grubhub', 'doordash', 'uber eats', 'chipotle', 'subway', 'taco', 'wendy', 'dunkin', 'panera', 'chick-fil', 'domino', 'bakery', 'sushi', 'tim horton', 'mary brown', 'kfc', 'popeyes', 'church\'s chicke', 'halibut house', 'shawarma', 'karahi', 'karachi', 'dal moro', 'osmow', 'waffle', 'gladiator burge', 'stacked paris', 'laari adda', 'nawab', 'dspot', 'freshly squeeze', 'mutabak karak', '3 food street', 'farah food', 'emaan grocer', 'sobeys', 'zehrs', 'kitchen market', 'buffalo and for', 'ct shawarma', 'blackstone stea', 'bob   amigoz', 'twistee dairy', 'zalabya', 'pizza karachi', 'chicago pub', 'snackamarack', 'skipthedishes', 'dave', 'hot chick', 'jay\'s nf', 'popeye', '3 drinks', 'erin mills', 'pizza hut', 'acs breaktime', 'sh vending', 'sp snackamarack', 'gateway newstan', 'booster juice', 'umi teriyaki', 'nora\'s fresh', 'food basics', 'sq *la patisser', 'sq *hui jing', 'tst-hakkaliciou', 'tst*', 'charleys', 'nuts facto', 'sq *clover', 'silver spoon', 'la pita', 'lakeshore ice', 'potato bar', 'huntsville pizz', 'mumbai xpress', 'paan casa', 'am 2 pm', 'krispykreme', 'hakka hut', '7 eleven', 'shelbys white', 'dana-redpath', 'yaari adda', 'usat_wt'],
    'Transport': ['uber canada', 'uber* pending', 'uber can rev', 'uberdirectca', 'lyft', 'shell', 'chevron', 'bp', 'fuel', 'parking', 'toll', 'transit', 'metro', 'train', 'automotive', 'car wash', 'tesla', 'flo service', 'pioneer stn', 'husky', 'esso', '407-etr', 'presto', 'uber holdings', 'air-serv', 'coke_'],
    'Subscriptions': ['netflix', 'spotify', 'hulu', 'disney', 'apple.com/bill', 'youtube', 'hbo', 'amazon prime', 'subscription', 'membership', 'patreon', 'adobe', 'rogers'],
    'Entertainment': ['cinema', 'cineplex', 'movie', 'theater', 'concert', 'ticket', 'gaming', 'steam', 'playstation', 'xbox', 'nintendo', 'amc', 'regal', 'gamestop', 'gametime social', 'gametime eatery', 'claire\'s', 'sport chek', 'forever 21', 'dark crystal'],
    'Healthcare': ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'medical', 'dental', 'health', 'clinic', 'optom', 'vision', 'rexall', 'shoppers drug', 'trillium health', 'vogue optic', 'juravinski'],
    'Shopping': ['amazon', 'amzn', 'walmart', 'wal-mart', 'target', 'costco', 'best buy', 'home depot', 'ikea', 'macys', 'nordstrom', 'ebay', 'etsy', 'dollarama', 'dollar tree', 'winners', 'coach', 'michael kors', 'zara', 'urban behavior', 'hm square', 'hm ca', 'sephora', 'daisy mart', 'staples', 'petsmart', 'pet valu', 'canadian tire', 'cell zone', 'future tech', 'ls khairi', 'cobblestone', 'maruti', 'puma canada', 'skechers', 'automania', 'vip vape', 'select vape', 'cpc / scp', 'goodness me', 'claire\'s #', '#391 sport', 'kate spade', 'columbia 5', 'sp knix', 'ls ag perfume', 'the village', 'store '],
    'Utilities': ['electric', 'water', 'gas bill', 'internet', 'comcast', 'att', 'verizon', 't-mobile', 'utility', 'power', 'sewage', 'trash', 'waste', 'xfinity', 'spectrum', 'phone bill', 'metergy', 'ez-pay'],
    'Debt Payments': ['loan', 'credit card', 'chase', 'capital one', 'amex', 'discover', 'minimum payment', 'student loan', 'car payment', 'michael hill', 'jordan barber'],
};

const CHART_COLORS = ['#0ecb81', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#f97316', '#14b8a6', '#e11d48', '#64748b', '#94a3b8'];

const ACCOUNT_TYPES = {
    chequing:   { label: 'Chequing',        badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',       color: '#3b82f6' },
    savings:    { label: 'Savings',         badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', color: '#0ecb81' },
    credit:     { label: 'Credit Card',     badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',       color: '#e11d48' },
    investment: { label: 'Investment',      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',     color: '#f59e0b' },
    loc:        { label: 'Line of Credit',  badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',  color: '#f97316' },
    mortgage:   { label: 'Mortgage',        badge: 'bg-teal-500/20 text-teal-400 border-teal-500/30',        color: '#14b8a6' },
    vehicle:    { label: 'Vehicle Loan',    badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30',           color: '#0ea5e9' },
    rental:     { label: 'Rental Income',   badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30',  color: '#8b5cf6' },
};

// Financial advisor checklist — what a complete financial picture needs
const ADVISOR_CHECKLIST = [
    { id: 'chequing',   label: 'Chequing Account',      icon: '🏦', description: 'Day-to-day banking & direct deposits',     accountType: 'chequing',   required: true },
    { id: 'savings',    label: 'Savings / TFSA',         icon: '💰', description: 'Emergency fund, TFSA, FHSA, HISA',          accountType: 'savings',    required: false },
    { id: 'credit',     label: 'Credit Card(s)',         icon: '💳', description: 'All active credit card statements',          accountType: 'credit',     required: true },
    { id: 'loc',        label: 'Line of Credit',         icon: '📋', description: 'Personal LOC or home equity (HELOC)',        accountType: 'loc',        required: false },
    { id: 'mortgage',   label: 'Mortgage',               icon: '🏠', description: 'Mortgage statement or amortization schedule',accountType: 'mortgage',   required: false },
    { id: 'vehicle',    label: 'Vehicle Loan / Lease',   icon: '🚗', description: 'Car loan, truck payment, or lease',          accountType: 'vehicle',    required: false },
    { id: 'investment', label: 'Investments / RRSP',     icon: '📈', description: 'RRSP, brokerage, pension statements',        accountType: 'investment', required: false },
    { id: 'rental',     label: 'Rental Income',          icon: '🏘️', description: 'Income & expenses from rental properties',   accountType: 'rental',     required: false },
];

function detectAccountType(fileName) {
    const f = fileName.toLowerCase();
    if (/credit|visa|mastercard|\bmc\b|amex|card/.test(f)) return 'credit';
    if (/sav|tfsa|hisa|hfsa|fhsa/.test(f)) return 'savings';
    if (/invest|rrsp|rrif|brokerage|portfolio/.test(f)) return 'investment';
    if (/loc|line.of.credit|heloc|credit.line/.test(f)) return 'loc';
    if (/mortgage|mtg/.test(f)) return 'mortgage';
    if (/vehicle|car.loan|auto.loan|lease/.test(f)) return 'vehicle';
    if (/rental|rent.income/.test(f)) return 'rental';
    return 'chequing';
}

function guessAccountName(fileName) {
    return fileName.replace(/\.csv$/i, '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function categorize(description) {
    const d = (description || '').toLowerCase();
    for (const [cat, keys] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keys.some(k => d.includes(k))) return cat;
    }
    return 'Other';
}

// Stable key for merchant override lookup — consistent between save and future imports
const normalizeForOverride = (desc) =>
    (desc || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 28);

const fmt = (n) => {
    const num = Number(n) || 0;
    return num.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
};

// ── localStorage helpers ──
const LS_KEY = 'finrecovery_v3';
function saveToLS(data) { try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) { } }
function loadFromLS() { try { const d = localStorage.getItem(LS_KEY); return d ? JSON.parse(d) : null; } catch (e) { return null; } }
function clearLS() { try { localStorage.removeItem(LS_KEY); } catch (e) { } }

const PROFILES_KEY = 'finrecovery_profiles';
function loadProfiles() { try { const d = localStorage.getItem(PROFILES_KEY); return d ? JSON.parse(d) : {}; } catch(e) { return {}; } }
function saveProfile(name, data) { try { const profiles = loadProfiles(); profiles[name] = { ...data, savedAt: new Date().toISOString() }; localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch(e) {} }
function deleteProfile(name) { try { const profiles = loadProfiles(); delete profiles[name]; localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch(e) {} }

const fmtShort = (n) => {
    const num = Math.abs(Number(n) || 0);
    if (num >= 1000) return 'C$' + (num / 1000).toFixed(1) + 'k';
    return 'C$' + num.toFixed(0);
};

const pct = (n) => (Number(n) || 0).toFixed(1) + '%';

/* ═══════════════════════════════════════════
   ANIMATED NUMBER
   ═══════════════════════════════════════════ */
function AnimatedNumber({ value, prefix = '$', decimals = 2, className = '' }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const target = Number(value) || 0;
        const start = display;
        const duration = 800;
        const startTime = performance.now();
        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(start + (target - start) * eased);
            if (progress < 1) ref.current = requestAnimationFrame(animate);
        };
        ref.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(ref.current);
    }, [value]);
    const num = display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return <span className={`font-mono ${className}`}>{prefix}{num}</span>;
}

/* ═══════════════════════════════════════════
   GALAXY BACKGROUND
   ═══════════════════════════════════════════ */
function GalaxyBackground() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        let raf, t = 0;

        // ── Star factory ──────────────────────────────────────
        const mkStars = (n, rMin, rMax, sMin, sMax) =>
            Array.from({ length: n }, () => {
                const roll = Math.random();
                // Realistic color temperatures: blue-white dominant, some warm, some pure white
                const hue = roll < 0.5 ? 210 + Math.random() * 25
                          : roll < 0.72 ? 195 + Math.random() * 15
                          : roll < 0.86 ? 38  + Math.random() * 18
                          : 0;
                const sat = hue > 100 ? 35 + Math.random() * 35 : 8;
                return {
                    x: Math.random() * w, y: Math.random() * h,
                    r: rMin + Math.random() * (rMax - rMin),
                    base: 0.12 + Math.random() * 0.78,
                    speed: sMin + Math.random() * (sMax - sMin),
                    tp: Math.random() * Math.PI * 2,        // twinkle phase
                    tr: 0.25 + Math.random() * 1.8,         // twinkle rate
                    hue, sat,
                };
            });

        const stars = [
            ...mkStars(480, 0.18, 0.65, 0.018, 0.055),   // distant field
            ...mkStars(120, 0.65, 1.35, 0.009, 0.032),   // mid-field
            ...mkStars(35,  1.5,  3.4,  0.004, 0.014),   // foreground gems
        ];

        // Milky-way density band — diagonal smear of faint stars
        const mwStars = Array.from({ length: 260 }, () => {
            const t0 = Math.random();
            return {
                x: t0 * w * 1.4 - w * 0.2,
                y: t0 * h * 0.6 + (Math.random() - 0.5) * h * 0.55 + h * 0.15,
                r: 0.15 + Math.random() * 0.45,
                base: 0.04 + Math.random() * 0.14,
                speed: 0.006 + Math.random() * 0.015,
                tp: Math.random() * Math.PI * 2, tr: 0.15 + Math.random() * 0.5,
                hue: 200 + Math.random() * 30, sat: 20,
            };
        });

        // ── GALAXIES ────────────────────────────────────────
        // buildGalaxy pre-generates all stable geometry so there's zero flicker
        const buildGalaxy = (cfg) => {
            const { arms, size, coreRGB, innerRGB, outerRGB } = cfg;
            const armStars = [];

            // ── Spiral arm stars ──────────────────────────────
            const sPerArm = 280;
            for (let arm = 0; arm < arms; arm++) {
                const armOff = (arm / arms) * Math.PI * 2;
                for (let i = 0; i < sPerArm; i++) {
                    const frac    = i / sPerArm;
                    const angle   = armOff + frac * Math.PI * 4.5;          // 2.25 full rotations
                    const radius  = Math.pow(frac, 0.6) * size;             // logarithmic
                    const scatter = radius * 0.22 * (0.5 + frac);           // flares outward
                    const px      = Math.cos(angle) * radius + (Math.random() - 0.5) * scatter * 2;
                    const py      = Math.sin(angle) * radius + (Math.random() - 0.5) * scatter * 2;
                    // Colour: warm core → vivid arm colour → blue-white tips
                    const blend   = Math.min(frac * 1.4, 1);
                    const [ir,ig,ib] = innerRGB, [or,og,ob] = outerRGB;
                    const sr = Math.round(ir + (or-ir) * blend);
                    const sg = Math.round(ig + (og-ig) * blend);
                    const sb = Math.round(ib + (ob-ib) * blend);
                    const alpha   = (1 - frac * 0.55) * (0.55 + Math.random() * 0.45);
                    // Star-forming region (bright pink/teal knots on outer arms)
                    const isSFR   = frac > 0.45 && Math.random() < 0.055;
                    armStars.push({
                        px, py,
                        r:     isSFR ? 1.8 + Math.random() * 2.0 : 0.4 + Math.random() * 1.2,
                        color: isSFR
                            ? `rgba(255,160,220,${0.75 + Math.random() * 0.25})`
                            : `rgba(${sr},${sg},${sb},${alpha})`,
                        glow:  isSFR,
                    });
                }
            }

            // ── Bulge / bar ───────────────────────────────────
            for (let i = 0; i < 120; i++) {
                const a   = Math.random() * Math.PI * 2;
                const r   = Math.pow(Math.random(), 0.45) * size * 0.22;
                const [cr,cg,cb] = coreRGB;
                armStars.push({
                    px: Math.cos(a)*r, py: Math.sin(a)*r,
                    r:  0.4 + Math.random() * 1.0,
                    color: `rgba(${cr},${cg},${cb},${0.55 + Math.random() * 0.45})`,
                    glow: false,
                });
            }

            // ── Arm nebula gas blobs (pre-computed positions) ─
            const gasBlobs = [];
            for (let arm = 0; arm < arms; arm++) {
                const armOff = (arm / arms) * Math.PI * 2;
                for (let i = 8; i < 70; i += 3) {
                    const frac   = i / 70;
                    const angle  = armOff + frac * Math.PI * 4.5;
                    const radius = Math.pow(frac, 0.6) * size;
                    gasBlobs.push({
                        px: Math.cos(angle) * radius,
                        py: Math.sin(angle) * radius,
                        size: size * 0.14 * (1 - frac * 0.4),
                        frac,
                    });
                }
            }

            return { ...cfg, armStars, gasBlobs };
        };

        const galaxyDefs = [
            // Giant blue-purple spiral — left side
            buildGalaxy({
                cx: 0.18, cy: 0.52, size: 320, tilt: 0.42, angle: 0.7, arms: 2,
                coreRGB:  [255, 240, 200],
                innerRGB: [200, 160, 255],
                outerRGB: [80,  140, 255],
                gasRGB:   [120, 80,  255],
                rotRate:  4.2e-4, drift: 0.006,
            }),
            // Vivid teal-gold barred spiral — right-center
            buildGalaxy({
                cx: 0.82, cy: 0.38, size: 260, tilt: 0.32, angle: -0.9, arms: 3,
                coreRGB:  [255, 230, 160],
                innerRGB: [255, 180, 80 ],
                outerRGB: [0,   220, 200],
                gasRGB:   [0,   200, 180],
                rotRate:  5.0e-4, drift: 0.005,
            }),
            // Small magenta-rose — bottom area
            buildGalaxy({
                cx: 0.55, cy: 0.80, size: 180, tilt: 0.50, angle: 2.2, arms: 2,
                coreRGB:  [255, 220, 240],
                innerRGB: [255, 100, 180],
                outerRGB: [180, 60,  255],
                gasRGB:   [200, 60,  220],
                rotRate:  6.0e-4, drift: 0.004,
            }),
        ];
        const galaxyY = galaxyDefs.map(g => g.cy * h);

        function drawGalaxy(g, idx) {
            const gx  = g.cx * w;
            const gy  = galaxyY[idx];
            const rot = g.angle + t * g.rotRate;
            const [gr, gg, gb] = g.gasRGB;
            const [cr, cg, cb] = g.coreRGB;

            ctx.save();
            ctx.translate(gx, gy);
            ctx.rotate(rot);
            ctx.scale(1, g.tilt);

            // ── Pass 1: Outer stellar halo (screen blend — additive luminosity)
            ctx.globalCompositeOperation = 'screen';
            const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size * 1.35);
            halo.addColorStop(0,    `rgba(${cr},${cg},${cb},0.18)`);
            halo.addColorStop(0.35, `rgba(${gr},${gg},${gb},0.09)`);
            halo.addColorStop(0.75, `rgba(${gr},${gg},${gb},0.03)`);
            halo.addColorStop(1,    'transparent');
            ctx.fillStyle = halo;
            ctx.beginPath(); ctx.arc(0, 0, g.size * 1.35, 0, Math.PI * 2); ctx.fill();

            // ── Pass 2: Arm nebula gas (screen — coloured ionised gas clouds)
            g.gasBlobs.forEach(blob => {
                const alpha = blob.frac < 0.25
                    ? blob.frac / 0.25 * 0.38
                    : (1 - blob.frac) * 0.38;
                const grd = ctx.createRadialGradient(blob.px, blob.py, 0, blob.px, blob.py, blob.size);
                grd.addColorStop(0, `rgba(${gr},${gg},${gb},${alpha})`);
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.arc(blob.px, blob.py, blob.size, 0, Math.PI * 2); ctx.fill();
            });

            // ── Pass 3: Arm + bulge stars (normal blend)
            ctx.globalCompositeOperation = 'source-over';
            g.armStars.forEach(s => {
                if (s.glow) {
                    // star-forming knot — small bright aura
                    const sg = ctx.createRadialGradient(s.px, s.py, 0, s.px, s.py, s.r * 3);
                    sg.addColorStop(0, 'rgba(255,160,220,0.5)');
                    sg.addColorStop(1, 'transparent');
                    ctx.fillStyle = sg;
                    ctx.beginPath(); ctx.arc(s.px, s.py, s.r * 3, 0, Math.PI * 2); ctx.fill();
                }
                ctx.beginPath();
                ctx.arc(s.px, s.py, s.r, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.fill();
            });

            // ── Pass 4: Core bulge glow (screen)
            ctx.globalCompositeOperation = 'screen';
            const core = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size * 0.28);
            core.addColorStop(0,    `rgba(${cr},${cg},${cb},0.95)`);
            core.addColorStop(0.3,  `rgba(${cr},${cg},${cb},0.55)`);
            core.addColorStop(0.65, `rgba(${Math.round(cr*0.6)},${Math.round(cg*0.5)},${Math.round(cb*0.4)},0.18)`);
            core.addColorStop(1,    'transparent');
            ctx.fillStyle = core;
            ctx.beginPath(); ctx.arc(0, 0, g.size * 0.28, 0, Math.PI * 2); ctx.fill();

            // ── Pass 5: White-hot nucleus point
            const nuc = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size * 0.045);
            nuc.addColorStop(0,   'rgba(255,255,255,1)');
            nuc.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.8)`);
            nuc.addColorStop(1,   'transparent');
            ctx.fillStyle = nuc;
            ctx.beginPath(); ctx.arc(0, 0, g.size * 0.045, 0, Math.PI * 2); ctx.fill();

            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();

            // Imperceptibly slow upward drift
            galaxyY[idx] -= g.drift;
            if (galaxyY[idx] < -g.size * 2.5) galaxyY[idx] = h + g.size * 2.5;
        }

        // ── Nebulae ─────────────────────────────────────────
        // Each nebula: center (cx,cy), ellipse radii (erx,ery), RGBA core,
        // RGBA mid, oscillation (dxA/dxF for x, dyA/dyF for y)
        const nebulae = [
            // Deep violet — top-left quadrant
            { cx:0.12, cy:0.18, erx:0.62, ery:0.50,
              c0:'rgba(110,30,220,0.22)', c1:'rgba(80,15,170,0.10)', c2:'rgba(50,5,120,0.04)',
              dxA:0.055,dxF:8.8e-5, dyA:0.04,dyF:1.3e-4 },
            // Electric teal — top-right
            { cx:0.85, cy:0.10, erx:0.50, ery:0.44,
              c0:'rgba(0,140,230,0.20)', c1:'rgba(0,100,190,0.09)', c2:'rgba(0,60,140,0.03)',
              dxA:0.04, dxF:7.2e-5, dyA:0.055,dyF:1.0e-4 },
            // Hot magenta — bottom-center
            { cx:0.52, cy:0.82, erx:0.48, ery:0.42,
              c0:'rgba(190,20,140,0.18)', c1:'rgba(150,10,100,0.08)', c2:'rgba(100,5,70,0.03)',
              dxA:0.06, dxF:1.1e-4, dyA:0.035,dyF:9.0e-5 },
            // Soft cyan — center
            { cx:0.40, cy:0.48, erx:0.35, ery:0.32,
              c0:'rgba(0,190,220,0.10)', c1:'rgba(0,150,180,0.05)', c2:'transparent',
              dxA:0.03, dxF:6.5e-5, dyA:0.03,dyF:1.2e-4 },
            // Amber nebula — right-center (rare warm tone)
            { cx:0.88, cy:0.62, erx:0.34, ery:0.38,
              c0:'rgba(200,80,20,0.12)', c1:'rgba(160,50,10,0.05)', c2:'transparent',
              dxA:0.045,dxF:9.5e-5, dyA:0.04,dyF:7.5e-5 },
        ];

        function drawNebula(n) {
            const x = (n.cx + Math.sin(t * n.dxF * Math.PI * 2) * n.dxA) * w;
            const y = (n.cy + Math.cos(t * n.dyF * Math.PI * 2) * n.dyA) * h;
            const rx = n.erx * Math.min(w, h);
            const ry = n.ery * Math.min(w, h);
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(1, ry / rx);
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
            g.addColorStop(0,    n.c0);
            g.addColorStop(0.42, n.c1);
            g.addColorStop(0.78, n.c2 === 'transparent' ? 'rgba(0,0,0,0)' : n.c2);
            g.addColorStop(1,    'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, rx, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ── Shooting stars ───────────────────────────────────
        const shooters = [];
        let nextShoot = 300 + Math.random() * 400;

        function spawnShooter() {
            const angle = (Math.PI / 6) + Math.random() * (Math.PI / 5);
            const speed = 9 + Math.random() * 14;
            const len   = 120 + Math.random() * 200;
            shooters.push({
                x: Math.random() * w * 0.75,
                y: Math.random() * h * 0.45,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                len, life: 0,
                maxLife: Math.round(len / speed) + 18,
                hue: Math.random() < 0.65 ? 200 : 45,
            });
        }

        function drawShooters() {
            for (let i = shooters.length - 1; i >= 0; i--) {
                const s = shooters[i];
                const progress = s.life / s.maxLife;
                const alpha = progress < 0.15 ? progress / 0.15
                            : progress > 0.75 ? (1 - progress) / 0.25 : 1;
                const tail = { x: s.x - s.vx * (s.len / 14), y: s.y - s.vy * (s.len / 14) };
                const g = ctx.createLinearGradient(tail.x, tail.y, s.x, s.y);
                g.addColorStop(0, 'transparent');
                g.addColorStop(0.6, `hsla(${s.hue},70%,90%,${alpha * 0.35})`);
                g.addColorStop(1,   `hsla(${s.hue},60%,98%,${alpha})`);
                ctx.beginPath();
                ctx.moveTo(tail.x, tail.y);
                ctx.lineTo(s.x, s.y);
                ctx.strokeStyle = g;
                ctx.lineWidth = 1.2;
                ctx.stroke();
                // Bright head glow
                const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
                hg.addColorStop(0, `hsla(${s.hue},60%,98%,${alpha * 0.9})`);
                hg.addColorStop(1, 'transparent');
                ctx.fillStyle = hg;
                ctx.beginPath(); ctx.arc(s.x, s.y, 6, 0, Math.PI * 2); ctx.fill();

                s.x += s.vx; s.y += s.vy; s.life++;
                if (s.life >= s.maxLife) shooters.splice(i, 1);
            }
        }

        // ── Draw one star ─────────────────────────────────────
        function drawStar(s, glow) {
            const tw    = Math.sin(t * s.tr + s.tp);
            const alpha = Math.max(0.04, s.base * (0.72 + 0.28 * tw));
            s.y -= s.speed;
            if (s.y < -5) { s.y = h + 5; s.x = Math.random() * w; }

            if (glow && s.r > 1.3) {
                // Soft outer aura
                const ar = s.r * (s.r > 2.4 ? 8 : 5.5);
                const ag = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, ar);
                ag.addColorStop(0,   `hsla(${s.hue},${s.sat + 10}%,96%,${alpha * 0.55})`);
                ag.addColorStop(0.4, `hsla(${s.hue},${s.sat}%,92%,${alpha * 0.18})`);
                ag.addColorStop(1,   'transparent');
                ctx.fillStyle = ag;
                ctx.beginPath(); ctx.arc(s.x, s.y, ar, 0, Math.PI * 2); ctx.fill();

                // 4-point diffraction cross on largest stars
                if (s.r > 2.5) {
                    const crossLen = s.r * 9;
                    const crossAlpha = alpha * 0.22;
                    [[1,0],[0,1],[ 0.7, 0.7],[-0.7, 0.7]].forEach(([dx, dy]) => {
                        const cg = ctx.createLinearGradient(
                            s.x - dx * crossLen, s.y - dy * crossLen,
                            s.x + dx * crossLen, s.y + dy * crossLen);
                        cg.addColorStop(0, 'transparent');
                        cg.addColorStop(0.5, `hsla(${s.hue},50%,98%,${crossAlpha})`);
                        cg.addColorStop(1, 'transparent');
                        ctx.strokeStyle = cg;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(s.x - dx * crossLen, s.y - dy * crossLen);
                        ctx.lineTo(s.x + dx * crossLen, s.y + dy * crossLen);
                        ctx.stroke();
                    });
                }
            }

            // Star core
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${s.hue},${s.sat}%,97%,${alpha})`;
            ctx.fill();
        }

        // ── Vignette ─────────────────────────────────────────
        function drawVignette() {
            const g = ctx.createRadialGradient(w/2, h/2, h*0.25, w/2, h/2, h*0.9);
            g.addColorStop(0, 'transparent');
            g.addColorStop(1, 'rgba(1,4,12,0.72)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        }

        // ── Main loop ─────────────────────────────────────────
        function frame() {
            t++;

            // Void base
            ctx.fillStyle = '#020710';
            ctx.fillRect(0, 0, w, h);

            // Nebulae (screen blend for authentic luminosity)
            ctx.globalCompositeOperation = 'screen';
            nebulae.forEach(drawNebula);
            ctx.globalCompositeOperation = 'source-over';

            // Distant galaxies — drawn before stars so stars appear in front
            galaxyDefs.forEach((g, i) => drawGalaxy(g, i));

            // Milky-way haze
            mwStars.forEach(s => drawStar(s, false));

            // Star layers — back to front
            stars.slice(0, 480).forEach(s => drawStar(s, false));
            stars.slice(480, 600).forEach(s => drawStar(s, false));
            stars.slice(600).forEach(s => drawStar(s, true));

            // Shooting stars
            if (--nextShoot <= 0) {
                spawnShooter();
                nextShoot = 280 + Math.random() * 480;
            }
            drawShooters();

            // Vignette to focus attention on center content
            drawVignette();

            raf = requestAnimationFrame(frame);
        }

        frame();
        const onResize = () => {
            w = canvas.width  = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
function StatCard({ label, value, icon: Icon, trend, color = 'emerald' }) {
    const palette = {
        emerald: { fg: '#23d48b', bg: 'rgba(14,203,129,0.08)' },
        rose:    { fg: '#fb7185', bg: 'rgba(244,63,94,0.08)' },
        blue:    { fg: '#60a5fa', bg: 'rgba(59,130,246,0.08)' },
        amber:   { fg: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
    };
    const p = palette[color] || palette.emerald;
    const positive = Number(value) >= 0;
    return (
        <div className="glass-card stat-card p-5 animate-fade-in">
            <div className="flex items-start justify-between mb-5">
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-3)' }}>{label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} style={{ color: p.fg }} strokeWidth={2} />
                </div>
            </div>
            <AnimatedNumber
                value={value}
                className={`stat-value text-[1.9rem] font-semibold ${positive ? 'num-income' : 'num-expense'}`}
            />
            {trend !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, fontWeight: 500, color: trend >= 0 ? '#23d48b' : '#fb7185' }}>
                    {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{Math.abs(trend).toFixed(1)}% vs last month</span>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════
   DEMO DATA GENERATOR
   ═══════════════════════════════════════════ */
function generateDemoData() {
    const CH = 'acc-demo-chq';
    const VI = 'acc-demo-visa';
    const accts = [
        { id: CH, fileName: 'td-chequing.csv', accountName: 'TD Chequing', accountType: 'chequing' },
        { id: VI, fileName: 'td-visa.csv',     accountName: 'TD Visa',     accountType: 'credit'   },
    ];
    let idx = 0;
    const txs = [];
    const add = (accountId, date, description, amount) =>
        txs.push({ id: `demo-${idx++}`, date, description, amount: Math.round(Number(amount) * 100) / 100, category: categorize(description), accountId });

    for (let mo = 1; mo <= 12; mo++) {
        const m = String(mo).padStart(2, '0');
        const y = '2025';
        const d = (day) => `${y}-${m}-${String(Math.min(day, 28)).padStart(2, '0')}`;
        // Pseudorandom variation per month (deterministic)
        const wobble = (base, lo, hi) => base + lo + ((mo * 7 + 3) % (hi - lo + 1));

        // ── CHEQUING INCOME ──
        add(CH, d(1),  'REDPATH SUGAR PAYROLL DEPOSIT', 2100);
        add(CH, d(15), 'REDPATH SUGAR PAYROLL DEPOSIT', 2100);

        // ── HOUSING ──
        add(CH, d(1), 'TSCC RENT PAYMENT', -1650);

        // ── FIXED BILLS ──
        add(CH, d(5),  'PAFCO INS MONTHLY',      -185);
        add(CH, d(10), 'ROGERS WIRELESS BILL',    -65);
        add(CH, d(14), 'METERGY SOLUTIONS EZ-PAY',-90);

        // ── SUBSCRIPTIONS ──
        add(CH, d(8),  'NETFLIX.COM',      -20.99);
        add(CH, d(8),  'SPOTIFY',          -10.99);
        add(CH, d(12), 'AMAZON PRIME',     -9.99);
        add(CH, d(20), 'ADOBE',            -29.99);
        if (mo >= 3) add(CH, d(22), 'YOUTUBE PREMIUM', -13.99);
        if (mo >= 6) add(CH, d(3),  'DISNEY+',         -14.99);

        // ── GROCERIES ──
        add(CH, d(4),  'SOBEYS STORE #1234', -wobble(280, 0, 70));
        add(CH, d(19), 'FOOD BASICS #567',   -wobble(140, 0, 50));

        // ── COFFEE / QUICK SERVICE ──
        add(CH, d(2),  'TIM HORTON S #8920', -6.75);
        add(CH, d(9),  'TIM HORTON S #8920', -8.25);
        add(CH, d(16), 'TIM HORTON S #8920', -7.50);
        add(CH, d(23), 'TIM HORTON S #8920', -9.00);
        if (mo % 2 === 0) add(CH, d(11), 'STARBUCKS #9087', -12.50);

        // ── TRANSPORT ──
        add(CH, d(1),  'PRESTO TRANSIT',  -150);
        add(CH, d(7),  'ESSO #00234',     -wobble(72, 0, 30));
        add(CH, d(21), 'ESSO #00234',     -wobble(68, 0, 28));
        if (mo % 3 === 0) add(CH, d(15), '407-ETR TOLL', -wobble(24, 0, 18));

        // ── RESTAURANTS (chequing) ──
        add(CH, d(6),  'SHAWARMA KING',          -22.50);
        add(CH, d(13), "OSMOW'S SHAWARMA",        -18.75);
        add(CH, d(20), 'PIZZA HUT CANADA',        -35.00);
        add(CH, d(25), 'SKIPTHEDISHES',           -wobble(38, 0, 22));
        if (mo % 2 === 1) add(CH, d(27), "MARY BROWN'S CHICKEN", -17.50);

        // ── TRANSFER TO VISA ──
        add(CH, d(28), 'TO:TD C/C',  -wobble(850, 0, 200));

        // ── VISA SHOPPING ──
        add(VI, d(3),  'AMAZON.CA MARKETPLACE', -wobble(68, 0, 60));
        add(VI, d(11), 'WAL-MART CANADA',        -wobble(90, 0, 55));
        if (mo % 2 === 0) add(VI, d(17), 'DOLLARAMA #456', -wobble(18, 0, 14));

        // ── VISA ENTERTAINMENT ──
        add(VI, d(14), 'CINEPLEX ODEON', -32.50);
        if (mo % 3 === 0) add(VI, d(16), 'STEAM PURCHASE', -wobble(28, 0, 30));

        // ── VISA FOOD ──
        add(VI, d(17), "MCDONALD'S #3241", -wobble(13, 0, 8));
        add(VI, d(22), 'UBER EATS',         -wobble(38, 0, 22));
        if (mo % 2 === 1) add(VI, d(26), 'DOORDASH', -wobble(32, 0, 18));

        // ── VISA HEALTHCARE ──
        add(VI, d(19), 'SHOPPERS DRUG MART', -wobble(42, 0, 30));

        // ── VISA PAYMENT (Transfer) ──
        add(VI, d(28), 'TFR-FR TD CHEQUING', wobble(850, 0, 200));
    }

    // ─── One-off / Seasonal ───
    // Summer travel
    add(CH, '2025-07-10', 'AIR CAN BOOKING',          -680);
    add(CH, '2025-07-11', 'AIRBNB RESERVATION',       -520);
    add(VI, '2025-07-13', 'CA WONDERLAND',             -138);
    add(VI, '2025-07-15', 'CLIFTON HILL ATTRACTION',  -92);

    // Back to school
    add(CH, '2025-09-05', 'CENTENNIAL COLL TUITION',  -1200);
    add(CH, '2025-09-10', 'OSAP REPAYMENT',            -200);
    add(VI, '2025-09-03', 'STAPLES CANADA',            -185);

    // Black Friday / Holiday
    add(VI, '2025-11-28', 'AMAZON.CA MARKETPLACE',    -420);
    add(VI, '2025-12-10', 'BEST BUY CANADA',           -299);
    add(VI, '2025-12-19', 'WAL-MART CANADA',           -195);
    add(CH, '2025-12-20', 'SOBEYS STORE #1234',        -380);

    // Healthcare
    add(VI, '2025-02-14', 'TRILLIUM HEALTH DENTAL',   -280);
    add(VI, '2025-08-20', 'VOGUE OPTIC GLASSES',       -340);

    // Charity / Donations
    add(CH, '2025-03-15', 'LAUNCHGOOD CAMPAIGN',       -50);
    add(CH, '2025-06-20', 'MUSLIM ASSOCIAT DONATION',  -100);
    add(CH, '2025-11-25', 'LAUNCHGOOD CAMPAIGN',       -75);

    // Refunds / Extra income
    add(CH, '2025-04-15', 'PAFCO INS REFUND',          215);
    add(VI, '2025-06-10', 'AMAZON.CA REFUND',           45);
    add(CH, '2025-05-01', 'E-TRANSFER DEPOSIT FREELANCE', 800);
    add(CH, '2025-10-01', 'E-TRANSFER DEPOSIT FREELANCE', 650);

    // ATM
    add(CH, '2025-03-08', 'ATM W/D TD BANK', -200);
    add(CH, '2025-07-05', 'ATM W/D TD BANK', -200);

    return { accounts: accts, transactions: txs };
}

/* ═══════════════════════════════════════════
   TIP — inline jargon tooltip
   ═══════════════════════════════════════════ */
function Tip({ term, children }) {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-flex items-center gap-0.5">
            <span className="border-b border-dashed border-slate-500 cursor-help" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
                {term}
            </span>
            {open && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 rounded-xl text-xs text-slate-200 bg-[#0c0e18] border border-white/10 shadow-xl pointer-events-none leading-relaxed text-center">
                    {children}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1f2e]" />
                </span>
            )}
        </span>
    );
}

/* ═══════════════════════════════════════════
   LOCAL ADVISOR — rule-based AI fallback
   Works 100% offline, no Ollama needed
   ═══════════════════════════════════════════ */
function localAdvisor(question, data) {
    const q = question.toLowerCase();
    const { summary, categoryData, debts, totalDebtBalance, totalDebtPayments, healthScore, savingsData, priorityStack, wins, runway } = data;
    const fmt = (n) => (Number(n) || 0).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

    // Helper: top spending categories
    const topCats = [...(categoryData || [])].sort((a, b) => b.monthly - a.monthly).slice(0, 3);
    const highRateDebts = (debts || []).filter(d => Number(d.interestRate) >= 8 && Number(d.amount) > 0).sort((a, b) => Number(b.interestRate) - Number(a.interestRate));
    const savingsRate = summary.monthlyIncome > 0 ? ((summary.monthlyNet / summary.monthlyIncome) * 100) : 0;
    const dti = healthScore?.dti || 0;

    // ── REPORT: Comprehensive health report
    if (q.includes('report') || q.includes('health report') || q.includes('financial health') || q.includes('overview') || q.includes('comprehensive')) {
        const score = healthScore?.score || 0;
        const label = healthScore?.label || 'Unknown';
        const netPositive = summary.monthlyNet >= 0;
        const sections = [];

        sections.push(`## Your Financial Health Score: ${score}/100 — ${label}`);
        sections.push(netPositive
            ? `You're earning ${fmt(summary.monthlyIncome)}/mo and spending ${fmt(summary.monthlySpending)}/mo — that leaves **${fmt(summary.monthlyNet)} surplus every month**. That's a real foundation to build on.`
            : `You're earning ${fmt(summary.monthlyIncome)}/mo but spending ${fmt(summary.monthlySpending)}/mo — a **${fmt(Math.abs(summary.monthlyNet))}/mo shortfall**. Let's fix that.`);

        sections.push(`\n## Top 3 Things To Work On`);
        if (!netPositive) sections.push(`- **Close the gap first** — you need to find ${fmt(Math.abs(summary.monthlyNet))}/mo in cuts or extra income before anything else compounds.`);
        if (highRateDebts.length > 0) sections.push(`- **High-interest debt** — ${highRateDebts[0].name} at ${highRateDebts[0].interestRate}% is costing you money every single day. This should be your primary debt target.`);
        if (topCats.length > 0) sections.push(`- **${topCats[0].name}** is your biggest expense at ${fmt(topCats[0].monthly)}/mo (${topCats[0].pct?.toFixed(0)}% of spending). Even a 20% cut saves ${fmt(topCats[0].monthly * 0.2)}/mo.`);
        if (savingsRate < 10 && netPositive) sections.push(`- **Savings rate is ${savingsRate.toFixed(0)}%** — the goal is 15–20%. Automate a transfer on payday to make savings happen before you can spend.`);

        if (totalDebtBalance > 0) {
            sections.push(`\n## Debt Strategy`);
            if (highRateDebts.length > 0) {
                sections.push(`Use the **avalanche method** — pay minimums on everything, throw every extra dollar at ${highRateDebts[0].name} (${highRateDebts[0].interestRate}% APR). This saves the most interest.`);
            } else {
                sections.push(`Your debts appear to be lower-interest — consider the **snowball method** (smallest balance first) for motivation, or avalanche (highest rate first) to minimize total interest.`);
            }
        }

        sections.push(`\n## Savings Capacity`);
        if (savingsData.canSave > 0) {
            sections.push(`You can save approx **${fmt(savingsData.canSave)}/mo**. 3-month emergency fund target: ${fmt(savingsData.emergencyTarget3)} (${savingsData.monthsTo3 === Infinity ? 'n/a' : savingsData.monthsTo3 + ' months away'}). Start here — it stops small emergencies from becoming new debt.`);
        } else {
            sections.push(`Right now savings capacity is limited. Closing the monthly gap is step one. Even ${fmt(50)}/mo adds up — ${fmt(600)} in a year.`);
        }

        sections.push(`\n## Your Next 3 Actions`);
        sections.push(`1. **This week** — log in here daily for 5 minutes. Awareness alone reduces spending.`);
        sections.push(`2. **This month** — set up an automatic transfer of ${fmt(Math.max(50, savingsData.canSave * 0.5))}/mo to a separate savings account on payday.`);
        sections.push(highRateDebts.length > 0
            ? `3. **Ongoing** — put every extra dollar toward ${highRateDebts[0].name}. At ${highRateDebts[0].interestRate}%, it's the highest guaranteed return available to you.`
            : `3. **Ongoing** — review your top spending category (${topCats[0]?.name || 'Food & Dining'}) and set a monthly budget cap.`);

        return sections.join('\n');
    }

    // ── SPENDING / REDUCE
    if (q.includes('spending') || q.includes('reduce') || q.includes('cut') || q.includes('save more') || q.includes('budget')) {
        const lines = [`## Where Your Money Is Going\n`];
        topCats.forEach(c => {
            lines.push(`- **${c.name}**: ${fmt(c.monthly)}/mo — cutting 25% saves ${fmt(c.monthly * 0.25)}/mo`);
        });
        lines.push(`\n## Quick Wins`);
        lines.push(`- Review all subscriptions (Subscriptions tab) — cancel anything you haven't used in 30 days`);
        lines.push(`- Set a weekly cash limit for food & entertainment so spending becomes visible before it happens`);
        lines.push(`- Delay non-essential purchases by 48 hours — impulse spending drops dramatically`);
        if (summary.monthlyNet < 0) lines.push(`\n⚠️ Your spending exceeds income by ${fmt(Math.abs(summary.monthlyNet))}/mo — this is the priority to fix.`);
        return lines.join('\n');
    }

    // ── DEBT
    if (q.includes('debt') || q.includes('payoff') || q.includes('loan') || q.includes('credit card') || q.includes('interest')) {
        if (debts.length === 0 && totalDebtBalance === 0) return `You haven't added any debts yet. Head to the **Debts** tab to enter your balances, rates, and payments — then I can give you a personalized payoff plan.`;
        const lines = [`## Your Debt Payoff Plan\n`];
        lines.push(`**Total debt: ${fmt(totalDebtBalance)}** · Monthly payments: ${fmt(totalDebtPayments)}`);
        if (highRateDebts.length > 0) {
            lines.push(`\n### Avalanche Method (Saves Most Money)`);
            lines.push(`Target ${highRateDebts[0].name} first — at ${highRateDebts[0].interestRate}% APR it's costing you the most. Pay minimums on the rest.`);
            lines.push(`\nOrder of attack:`);
            highRateDebts.forEach((d, i) => lines.push(`${i + 1}. ${d.name} — ${fmt(d.amount)} at ${d.interestRate}%`));
        } else {
            lines.push(`\nYour debts look manageable in terms of interest rate. Consider the **snowball method** — pay off smallest balance first for the psychological momentum.`);
        }
        lines.push(`\n**Every extra ${fmt(100)}/mo** applied to your highest-rate debt accelerates payoff significantly.`);
        return lines.join('\n');
    }

    // ── SAVINGS
    if (q.includes('sav') || q.includes('emergency') || q.includes('tfsa') || q.includes('rrsp') || q.includes('invest')) {
        const lines = [`## Building Your Safety Net\n`];
        lines.push(`**Emergency fund targets:**`);
        lines.push(`- 1-month: ${fmt(summary.monthlySpending)} — starter buffer`);
        lines.push(`- 3-month: ${fmt(savingsData.emergencyTarget3)} — covers most emergencies`);
        lines.push(`- 6-month: ${fmt(savingsData.emergencyTarget6)} — full safety net`);
        if (savingsData.canSave > 0) {
            lines.push(`\nAt your current savings capacity of ${fmt(savingsData.canSave)}/mo:`);
            lines.push(`- 3-month fund: ${savingsData.monthsTo3 === Infinity ? 'increase savings rate first' : savingsData.monthsTo3 + ' months'}`);
            lines.push(`- 6-month fund: ${savingsData.monthsTo6 === Infinity ? 'increase savings rate first' : savingsData.monthsTo6 + ' months'}`);
        }
        lines.push(`\n**Where to keep it:** HISA (High Interest Savings Account) or TFSA. Keeps it accessible but earns interest. Don't invest emergency funds — you need them liquid.`);
        if (totalDebtBalance > 0 && highRateDebts.length > 0) {
            lines.push(`\n**Note:** With ${highRateDebts[0].interestRate}% debt active, build a $1,000 buffer first, then focus on debt before growing savings — the math favours debt payoff.`);
        }
        return lines.join('\n');
    }

    // ── HEALTH SCORE
    if (q.includes('score') || q.includes('health') || q.includes('rating') || q.includes('how am i doing')) {
        return `## Financial Health Score: ${healthScore?.score || 0}/100 — ${healthScore?.label || 'Calculating...'}

**What goes into it:**
- **Cash flow** (35%) — are you earning more than you spend? You're at ${summary.monthlyNet >= 0 ? `+${fmt(summary.monthlyNet)}/mo` : `${fmt(summary.monthlyNet)}/mo`}
- **Savings rate** (25%) — target is 15%+. Yours: ${savingsRate.toFixed(0)}%
- **Debt load** (25%) — debt-to-income ratio. Yours: ${dti.toFixed(0)}% (under 15% is healthy)
- **Diversity** (15%) — having multiple accounts and data sources

**To improve your score:**
${savingsRate < 15 ? `- Increase savings rate to 15% — add ${fmt(summary.monthlyIncome * 0.15 - Math.max(0, summary.monthlyNet))}/mo to savings\n` : '- Savings rate is solid ✓\n'}${dti > 20 ? `- Reduce debt payments (DTI too high at ${dti.toFixed(0)}%) — paying off debt will drop this\n` : '- Debt load is manageable ✓\n'}${summary.monthlyNet < 0 ? `- Close the spending gap — you need to earn more or spend less by ${fmt(Math.abs(summary.monthlyNet))}/mo\n` : '- Positive cash flow ✓\n'}`;
    }

    // ── DEFAULT / GENERAL
    const netLine = summary.monthlyNet >= 0
        ? `You have a ${fmt(summary.monthlyNet)}/mo surplus — that's real money to work with.`
        : `There's a ${fmt(Math.abs(summary.monthlyNet))}/mo shortfall to close — but it's fixable.`;

    return `## Here's Where Things Stand\n\n${netLine}

**Income:** ${fmt(summary.monthlyIncome)}/mo · **Spending:** ${fmt(summary.monthlySpending)}/mo · **Net:** ${fmt(summary.monthlyNet)}/mo
**Total debt:** ${fmt(totalDebtBalance)} · **Savings capacity:** ${fmt(savingsData.canSave)}/mo

${wins.length > 0 ? `**What's going well:** ${wins.map(w => w.text).join('; ')}\n\n` : ''}Try asking me:
- "How can I reduce my spending?"
- "What's the best debt payoff strategy?"
- "Am I saving enough?"
- "Generate my financial health report"`;
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {
    // ── Load persisted state ──
    const saved = useRef(loadFromLS());
    const [activeTab, setActiveTab] = useState('dashboard');
    const [transactions, setTransactions] = useState(() => saved.current?.transactions || []);
    const [accounts, setAccounts] = useState(() => saved.current?.accounts || []);
    const [debts, setDebts] = useState(() => saved.current?.debts || []);
    const [startingBalance, setStartingBalance] = useState(() => saved.current?.startingBalance || 0);
    const [dragActive, setDragActive] = useState(false);
    const [csvLoading, setCsvLoading] = useState(false);
    const [txAccountFilter, setTxAccountFilter] = useState('All');
    const [isDemoMode, setIsDemoMode] = useState(() => saved.current?.isDemoMode || false);
    const [accountBalances, setAccountBalances] = useState(() => saved.current?.accountBalances || {});
    const [categoryBudgets, setCategoryBudgets] = useState(() => saved.current?.categoryBudgets || {});
    const [showBudgetEditor, setShowBudgetEditor] = useState(false);
    const [chatMessages, setChatMessages] = useState(() => saved.current?.chatMessages || []);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [advisorReportGenerated, setAdvisorReportGenerated] = useState(() => saved.current?.advisorReportGenerated || false);
    const fileInputRef = useRef(null);
    const ghostFileInputRef = useRef(null);
    const [ghostUploadType, setGhostUploadType] = useState(null);
    const [ghostManualModal, setGhostManualModal] = useState(null); // { item: ADVISOR_CHECKLIST item }
    const [ghostManualForm, setGhostManualForm] = useState({ name: '', balance: '', interestRate: '', monthlyPayment: '', notes: '' });
    const [showCsvGuide, setShowCsvGuide] = useState(false);
    const [showProfilesModal, setShowProfilesModal] = useState(false);
    const [profiles, setProfiles] = useState(() => loadProfiles());
    const [profileName, setProfileName] = useState('');
    const chatEndRef = useRef(null);
    // v2: search, filter, pagination
    const [txSearch, setTxSearch] = useState('');
    const [txCatFilter, setTxCatFilter] = useState('All');
    const [txPage, setTxPage] = useState(0);
    const TX_PER_PAGE = 50;
    // v3: sort, date range filter, debt editing
    const [txSort, setTxSort] = useState({ key: 'date', dir: 'desc' });
    const [txDateFrom, setTxDateFrom] = useState('');
    const [txDateTo, setTxDateTo] = useState('');
    const [editingDebtId, setEditingDebtId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(null); // { action, message, onConfirm }
    const [dupWarning, setDupWarning] = useState(null);
    // Merchant category learning (persists user corrections across imports)
    const [merchantOverrides, setMerchantOverrides] = useState(() => saved.current?.merchantOverrides || {});
    // Dashboard period filter: 'all' | 'last3' | 'last6' | 'YYYY-MM'
    const [dashboardPeriod, setDashboardPeriod] = useState('all');
    // Cash flow calendar display month
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
    });
    // Net Worth assets
    const [nwAssets, setNwAssets] = useState(() => saved.current?.nwAssets || []);
    const [nwAssetForm, setNwAssetForm] = useState({ name: '', value: '', type: 'cash' });
    // Transaction notes
    const [txNotes, setTxNotes] = useState(() => saved.current?.txNotes || {});
    const [expandedNoteTxId, setExpandedNoteTxId] = useState(null);
    // Onboarding
    const [onboardingDone, setOnboardingDone] = useState(() => saved.current?.onboardingDone || false);
    // Savings Goals
    const [savingsGoals, setSavingsGoals] = useState(() => saved.current?.savingsGoals || []);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [goalForm, setGoalForm] = useState({ name: '', target: '', current: '', deadline: '', icon: '🎯' });
    // Calendar day click popover
    const [calendarDayPopover, setCalendarDayPopover] = useState(null); // { day, txns, income, expenses }
    // Dashboard pie chart — click to filter
    const [selectedCategory, setSelectedCategory] = useState(null);
    // Transactions — manual entry form
    const [showManualTxForm, setShowManualTxForm] = useState(false);
    const [manualTxForm, setManualTxForm] = useState({ date: '', description: '', amount: '', category: 'Other', accountId: '', type: 'expense' });
    // Transactions — expanded account folder
    const [expandedAccountId, setExpandedAccountId] = useState(null);
    // CSV trust modal — staged files waiting for user to confirm source
    const [pendingUpload, setPendingUpload] = useState(null); // { files: File[], forcedType?: string } | null
    // Debt tab ghost prompts — dismissed items
    const [dismissedDebtPrompts, setDismissedDebtPrompts] = useState(() => new Set());
    // Advisor checklist — items user has explicitly marked as "I don't have this"
    const [dismissedAdvisorItems, setDismissedAdvisorItems] = useState(() => new Set(saved.current?.dismissedAdvisorItems || []));

    // ── Persist to localStorage on change ──
    useEffect(() => {
        saveToLS({ transactions, accounts, debts, startingBalance, chatMessages, advisorReportGenerated, isDemoMode, accountBalances, categoryBudgets, merchantOverrides, savingsGoals, nwAssets, txNotes, onboardingDone, dismissedAdvisorItems: [...dismissedAdvisorItems] });
    }, [transactions, debts, startingBalance, chatMessages, advisorReportGenerated, merchantOverrides, savingsGoals, nwAssets, txNotes, onboardingDone, dismissedAdvisorItems]);

    // ── Re-categorize stored transactions when keyword rules change ──
    // Runs once on mount. Respects manual merchantOverrides.
    useEffect(() => {
        setTransactions(prev => {
            if (!prev.length) return prev;
            let changed = false;
            const migrated = prev.map(t => {
                const override = merchantOverrides[normalizeForOverride(t.description)];
                if (override) return t; // keep manual overrides untouched
                const fresh = categorize(t.description);
                if (fresh !== t.category) { changed = true; return { ...t, category: fresh }; }
                return t;
            });
            return changed ? migrated : prev;
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Debt form state ──
    const [debtForm, setDebtForm] = useState({
        name: '', amount: '', monthlyPayment: '', minimumPayment: '', interestRate: '',
        type: 'debt', debtCategory: 'credit_card', monthsRemaining: '', priority: 'medium', lender: '', notes: '',
    });

    // ── CSV PARSING ──
    // Handles both:
    //   1. Header-based CSVs (Date, Description, Amount, Type)
    //   2. Headerless TD-style CSVs (Date, Description, Debit, Credit, Balance)
    // Supports multiple files at once; each file becomes a named Account.
    const parseOneFile = useCallback((file, accountId) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const text = evt.target.result;
                const firstLine = text.split('\n')[0];
                const isHeaderless = /^"\d{4}-\d{2}-\d{2}"/.test(firstLine.trim()) || /^\d{4}-\d{2}-\d{2}/.test(firstLine.trim());
                Papa.parse(text, {
                    header: !isHeaderless,
                    skipEmptyLines: true,
                    dynamicTyping: false,
                    complete: (results) => {
                        let rows;
                        if (isHeaderless) {
                            const firstRow = results.data[0];
                            if (firstRow) {
                                const firstFields = Array.isArray(firstRow) ? firstRow : Object.values(firstRow);
                                const firstDebit = parseFloat((firstFields[2] || '').toString().replace(/[$,"]/g, '')) || 0;
                                const firstCredit = parseFloat((firstFields[3] || '').toString().replace(/[$,"]/g, '')) || 0;
                                const firstBal = parseFloat((firstFields[4] || '').toString().replace(/[$,"]/g, '')) || 0;
                                const firstAmt = firstCredit > 0 ? firstCredit : -firstDebit;
                                setStartingBalance(firstBal - firstAmt);
                            }
                            rows = results.data.map((arr, i) => {
                                const fields = Array.isArray(arr) ? arr : Object.values(arr);
                                const dateVal = (fields[0] || '').toString().replace(/"/g, '').trim();
                                const descVal = (fields[1] || '').toString().replace(/"/g, '').trim();
                                const debitStr = (fields[2] || '').toString().replace(/[$,"]/g, '').trim();
                                const creditStr = (fields[3] || '').toString().replace(/[$,"]/g, '').trim();
                                const debit = parseFloat(debitStr) || 0;
                                const credit = parseFloat(creditStr) || 0;
                                const amount = credit > 0 ? credit : -debit;
                                if (!dateVal || amount === 0) return null;
                                return { id: `csv-${accountId}-${i}`, date: dateVal, description: descVal, amount, category: merchantOverrides[normalizeForOverride(descVal)] || categorize(descVal), accountId };
                            }).filter(Boolean);
                        } else {
                            rows = results.data.map((row, i) => {
                                const keys = Object.keys(row);
                                const dateCols = keys.filter(k => /date|time/i.test(k));
                                const descCols = keys.filter(k => /desc|narr|memo|detail|merchant|name/i.test(k));
                                const amtCols = keys.filter(k => /amount|sum|value|debit|credit|total/i.test(k));
                                const dateVal = row[dateCols[0]] || row[keys[0]] || '';
                                const descVal = row[descCols[0]] || row[keys[1]] || '';
                                let amtVal = row[amtCols[0]] || row[keys[2]] || 0;
                                if (typeof amtVal === 'string') amtVal = parseFloat(amtVal.replace(/[$,]/g, '')) || 0;
                                const typeCols = keys.filter(k => /type|kind/i.test(k));
                                const typeVal = (row[typeCols[0]] || '').toString().toLowerCase();
                                if (typeVal === 'credit' && amtVal < 0) amtVal = Math.abs(amtVal);
                                if (typeVal === 'debit' && amtVal > 0) amtVal = -amtVal;
                                return { id: `csv-${accountId}-${i}`, date: String(dateVal), description: String(descVal), amount: amtVal, category: merchantOverrides[normalizeForOverride(String(descVal))] || categorize(String(descVal)), accountId };
                            });
                        }
                        resolve(rows.filter(r => r.date && r.amount !== 0));
                    },
                    error: () => resolve([]),
                });
            };
            reader.onerror = () => resolve([]);
            reader.readAsText(file);
        });
    }, [merchantOverrides]);

    const handleFiles = useCallback(async (fileList, trustedBank = false, forcedAccountType = null) => {
        const files = Array.from(fileList || []).filter(f => f.name.toLowerCase().endsWith('.csv'));
        if (!files.length) return;
        setCsvLoading(true);
        const newAccounts = files.map(f => ({
            id: `acc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            fileName: f.name,
            accountName: guessAccountName(f.name),
            accountType: forcedAccountType || detectAccountType(f.name),
        }));
        const parsedBatches = await Promise.all(files.map((f, i) => parseOneFile(f, newAccounts[i].id)));
        const allNewRows = parsedBatches.flat();
        setTransactions(prev => {
            if (trustedBank) {
                // Bank exports are authoritative — import every single row, no dedup.
                setDupWarning(null);
                return [...prev, ...allNewRows];
            }
            // Non-trusted: only skip rows that ALREADY EXIST in the database (cross-upload dedup).
            // Never drop rows within the same batch — same-merchant same-amount is NOT a duplicate.
            const existingKeys = new Set(prev.map(t => `${t.date}|${t.description}|${t.amount}|${t.accountId}`));
            const toAdd = [];
            let dupCount = 0;
            allNewRows.forEach(r => {
                const key = `${r.date}|${r.description}|${r.amount}|${r.accountId}`;
                if (existingKeys.has(key)) { dupCount++; }
                else { toAdd.push(r); }
            });
            if (dupCount > 0) setDupWarning(`${dupCount} row${dupCount > 1 ? 's' : ''} skipped — exact matches already exist in this account.`);
            else setDupWarning(null);
            return [...prev, ...toAdd];
        });
        setAccounts(prev => [...prev, ...newAccounts]);
        setCsvLoading(false);
    }, [parseOneFile]);

    const removeAccount = useCallback((accountId) => {
        setShowConfirm({
            message: 'Remove this account and all its transactions?',
            onConfirm: () => {
                setAccounts(prev => prev.filter(a => a.id !== accountId));
                setTransactions(prev => prev.filter(t => t.accountId !== accountId));
                setShowConfirm(null);
            }
        });
    }, []);

    const updateAccount = useCallback((accountId, changes) => {
        setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, ...changes } : a));
    }, []);

    const loadDemoData = useCallback(() => {
        const { accounts: demoAccounts, transactions: demoTxs } = generateDemoData();
        setTransactions(demoTxs);
        setAccounts(demoAccounts);
        setDebts([
            { id: 'demo-debt-1', name: 'TD Visa Balance', amount: '3200', monthlyPayment: '150', interestRate: '19.99', type: 'credit', monthsRemaining: '24', priority: 'high' },
            { id: 'demo-debt-2', name: 'Car Loan',         amount: '8500', monthlyPayment: '280', interestRate: '6.9',   type: 'loan',   monthsRemaining: '32', priority: 'medium' },
        ]);
        setIsDemoMode(true);
        setActiveTab('dashboard');
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault(); setDragActive(false);
        const files = Array.from(e.dataTransfer?.files || []).filter(f => f.name.toLowerCase().endsWith('.csv'));
        if (files.length) setPendingUpload({ files });
    }, []);

    const onDragOver = useCallback((e) => { e.preventDefault(); setDragActive(true); }, []);
    const onDragLeave = useCallback(() => setDragActive(false), []);

    // ── COMPUTED DATA (v2: monthly normalized, transfers separated) ──
    const dataRange = useMemo(() => {
        const dates = transactions.map(t => new Date(t.date)).filter(d => !isNaN(d)).sort((a, b) => a - b);
        if (dates.length === 0) return { months: 1, first: null, last: null, label: '' };
        const first = dates[0];
        const last = dates[dates.length - 1];
        const ms = last - first;
        const months = Math.max(1, ms / (1000 * 60 * 60 * 24 * 30.44));
        const opts = { month: 'short', day: 'numeric', year: 'numeric' };
        return { months, first, last, label: `${first.toLocaleDateString('en-US', opts)} – ${last.toLocaleDateString('en-US', opts)}` };
    }, [transactions]);

    // Available months for the period filter picker
    const availableMonths = useMemo(() =>
        [...new Set(transactions.map(t => t.date.slice(0, 7)).filter(m => /^\d{4}-\d{2}$/.test(m)))].sort()
    , [transactions]);

    // Period-filtered transactions for dashboard (pattern detection always uses full history)
    const dashboardTx = useMemo(() => {
        if (dashboardPeriod === 'all') return transactions;
        if (dashboardPeriod === 'last3') {
            const cutoff = availableMonths.slice(-3)[0] || '';
            return transactions.filter(t => t.date.slice(0, 7) >= cutoff);
        }
        if (dashboardPeriod === 'last6') {
            const cutoff = availableMonths.slice(-6)[0] || '';
            return transactions.filter(t => t.date.slice(0, 7) >= cutoff);
        }
        return transactions.filter(t => t.date.startsWith(dashboardPeriod));
    }, [transactions, dashboardPeriod, availableMonths]);

    // Date range computed from the dashboard period
    const dashboardRange = useMemo(() => {
        const dates = dashboardTx.map(t => new Date(t.date)).filter(d => !isNaN(d)).sort((a, b) => a - b);
        if (dates.length === 0) return { months: 1, first: null, last: null, label: 'No data' };
        const first = dates[0], last = dates[dates.length - 1];
        const months = Math.max(1, (last - first) / (1000 * 60 * 60 * 24 * 30.44));
        const opts = { month: 'short', year: 'numeric' };
        return { months, first, last, label: `${first.toLocaleDateString('en-US', opts)} – ${last.toLocaleDateString('en-US', opts)}` };
    }, [dashboardTx]);

    // Auto-detect cross-account transfers (same amount ±$0.02, within 3 days, different accounts)
    const transferTxIds = useMemo(() => {
        if (accounts.length < 2) return new Set();
        const TRANSFER_RE = /transfer|trsf|xfer|\btfr\b|\btrf\b|e-transfer|etransfer|interac|from chq|to chq|from sav|to sav|payment from|sent to|received from/i;
        const result = new Set();
        const debitsAll = transactions.filter(t => t.amount < 0);
        const creditsAll = transactions.filter(t => t.amount > 0);
        const usedCredits = new Set();
        debitsAll.forEach(d => {
            if (result.has(d.id)) return;
            const dAmt = Math.abs(d.amount);
            const dTime = new Date(d.date).getTime();
            const dIsTransfer = TRANSFER_RE.test(d.description);
            for (const c of creditsAll) {
                if (usedCredits.has(c.id)) continue;
                if (c.accountId === d.accountId) continue;
                if (Math.abs(c.amount - dAmt) > 0.02) continue;
                if (Math.abs(new Date(c.date).getTime() - dTime) > 3 * 86400000) continue;
                // Require at least one side to look like a transfer
                if (!dIsTransfer && !TRANSFER_RE.test(c.description)) continue;
                result.add(d.id);
                result.add(c.id);
                usedCredits.add(c.id);
                break;
            }
        });
        return result;
    }, [transactions, accounts]);

    const summary = useMemo(() => {
        const nonTransfer = dashboardTx.filter(t => t.category !== 'Transfers' && !transferTxIds.has(t.id));
        const income = nonTransfer.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const spending = nonTransfer.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        const transferVol = dashboardTx.filter(t => t.category === 'Transfers' || transferTxIds.has(t.id)).reduce((s, t) => s + Math.abs(t.amount), 0);
        const m = dashboardRange.months;
        return {
            income, spending, net: income - spending, transferVol,
            monthlyIncome: income / m, monthlySpending: spending / m, monthlyNet: (income - spending) / m,
            months: m, monthsOfData: m,
        };
    }, [dashboardTx, dashboardRange, transferTxIds]);

    const totalDebtBalance = useMemo(() => debts.reduce((s, d) => s + (Number(d.amount) || 0), 0), [debts]);
    const totalDebtPayments = useMemo(() => debts.reduce((s, d) => s + (Number(d.monthlyPayment) || 0), 0), [debts]);

    // ── Net Worth (enhanced with manual assets) ──
    const netWorth = useMemo(() => {
        const assetTotal = nwAssets.reduce((s, a) => s + (Number(a.value) || 0), 0);
        let balAssets = 0, balLiabilities = 0;
        accounts.forEach(acc => {
            const bal = Number(accountBalances[acc.id]) || 0;
            if (acc.accountType === 'credit') balLiabilities += Math.abs(bal);
            else balAssets += bal;
        });
        const debtTotal = totalDebtBalance;
        const total = assetTotal + balAssets - balLiabilities - debtTotal;
        const balTotal = balAssets;
        const byType = {};
        nwAssets.forEach(a => { byType[a.type] = (byType[a.type] || 0) + (Number(a.value) || 0); });
        return { total, assetTotal, balTotal, balLiabilities, debtTotal, byType, assets: assetTotal + balAssets, liabilities: balLiabilities + debtTotal, net: total };
    }, [nwAssets, accounts, accountBalances, totalDebtBalance]);

    // ── Income Source Breakdown ──
    const incomeBreakdown = useMemo(() => {
        const incomeTx = dashboardTx.filter(t => t.amount > 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id));
        const groups = {};
        incomeTx.forEach(t => {
            const desc = t.description.toLowerCase();
            let source;
            if (/payroll|salary|employer|direct dep|redpath|gc 3384/.test(desc)) source = 'Salary / Payroll';
            else if (/e-transfer|etransfer|mobile deposit|freelance/.test(desc)) source = 'E-Transfers';
            else if (/refund|cashback|reimburs/.test(desc)) source = 'Refunds';
            else if (/dividend|interest earned/.test(desc)) source = 'Investment Income';
            else source = 'Other Income';
            groups[source] = (groups[source] || 0) + t.amount;
        });
        const total = Object.values(groups).reduce((s, v) => s + v, 0);
        return Object.entries(groups)
            .map(([name, amt]) => ({ name, total: amt, monthly: amt / dashboardRange.months, pct: total > 0 ? (amt / total) * 100 : 0 }))
            .sort((a, b) => b.total - a.total);
    }, [dashboardTx, dashboardRange, transferTxIds]);

    // ── Budget Progress ──
    const budgetProgress = useMemo(() => {
        return Object.entries(categoryBudgets)
            .filter(([, b]) => Number(b) > 0)
            .map(([cat, budget]) => {
                const spent = dashboardTx.filter(t => t.amount < 0 && t.category === cat && !transferTxIds.has(t.id))
                    .reduce((s, t) => s + Math.abs(t.amount), 0) / dashboardRange.months;
                return { cat, budget: Number(budget), spent, pct: Math.round((spent / Number(budget)) * 100) };
            })
            .sort((a, b) => b.pct - a.pct);
    }, [categoryBudgets, dashboardTx, dashboardRange, transferTxIds]);

    const categoryData = useMemo(() => {
        const map = {};
        const countMap = {};
        dashboardTx.filter(t => t.amount < 0 && !transferTxIds.has(t.id)).forEach(t => {
            const cat = merchantOverrides[normalizeForOverride(t.description)] || categorize(t.description) || t.category || 'Other';
            if (cat === 'Transfers') return;
            map[cat] = (map[cat] || 0) + Math.abs(t.amount);
            countMap[cat] = (countMap[cat] || 0) + 1;
        });
        const total = Object.values(map).reduce((s, v) => s + v, 0);
        return Object.entries(map)
            .map(([name, value]) => ({
                name, value: Math.round(value * 100) / 100,
                count: countMap[name] || 0,
                pct: total > 0 ? (value / total * 100) : 0,
                monthly: value / dashboardRange.months,
                color: CATEGORIES.find(c => c.name === name)?.color || '#94a3b8',
            }))
            .sort((a, b) => b.value - a.value);
    }, [dashboardTx, dashboardRange, transferTxIds, merchantOverrides]);

    const monthlyData = useMemo(() => {
        const map = {};
        transactions.filter(t => t.category !== 'Transfers').forEach(t => {
            const d = new Date(t.date);
            if (isNaN(d)) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };
            if (t.amount > 0) map[key].income += t.amount;
            else map[key].expenses += Math.abs(t.amount);
        });
        return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
    }, [transactions]);

    const balanceTrend = useMemo(() => {
        let running = startingBalance;
        const sorted = [...transactions]
            .filter(t => !isNaN(new Date(t.date)))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        return sorted.map(t => {
            running += t.amount;
            return { date: t.date, balance: Math.round(running * 100) / 100 };
        });
    }, [transactions, startingBalance]);

    // v2: spending insights
    const insights = useMemo(() => {
        const spending = dashboardTx.filter(t => t.amount < 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id));
        if (spending.length === 0) return null;
        const largest = spending.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, spending[0]);
        const merchantMap = {};
        spending.forEach(t => { const k = t.description.substring(0, 20).trim(); merchantMap[k] = (merchantMap[k] || 0) + 1; });
        const topMerchant = Object.entries(merchantMap).sort((a, b) => b[1] - a[1])[0];
        const days = dashboardRange.months * 30.44;
        const dailyAvg = summary.spending / days;
        return { largest, topMerchant: topMerchant?.[0], topMerchantCount: topMerchant?.[1], dailyAvg };
    }, [dashboardTx, dashboardRange, transferTxIds, summary]);

    // ═══ V4: PATTERN DETECTION ENGINE ═══

    // Recurring payment detection
    const recurringPayments = useMemo(() => {
        if (transactions.length < 3) return [];

        // ── Step 1: Merchant normalization ──
        // Strip location numbers (#1234), chain suffixes, special chars
        // Keep enough chars to distinguish merchants but ignore store-level noise
        const normalizeMerchant = (desc) =>
            desc.toLowerCase()
                .replace(/#\S+/g, '')           // strip #1234 store numbers
                .replace(/\*\S+/g, '')           // strip *suffix (NETFLIX*ANNUAL)
                .replace(/\b\d{4,}\b/g, '')      // strip long standalone numbers
                .replace(/[^a-z0-9 ]/g, ' ')     // special chars → space
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 22)
                .trim();

        // ── Step 2: Known fixed-interval patterns (boost confidence automatically) ──
        const KNOWN_SUBS = ['netflix', 'spotify', 'apple', 'disney', 'youtube', 'hbo', 'amazon prime',
            'adobe', 'patreon', 'rogers', 'bell ', 'telus', 'dropbox', 'google one', 'microsoft'];

        // ── Step 3: Group by normalized merchant ──
        const groups = {};
        transactions.filter(t => t.amount < 0).forEach(t => {
            const key = normalizeMerchant(t.description);
            if (!key || key.length < 3) return;
            if (!groups[key]) groups[key] = [];
            groups[key].push({
                id: t.id,
                date: new Date(t.date),
                amount: Math.abs(t.amount),
                desc: t.description,
                category: t.category,
                origDate: t.date,
            });
        });

        const FREQ_BANDS = [
            { label: 'Weekly',      days: 7,   min: 5,   max: 9   },
            { label: 'Bi-weekly',   days: 14,  min: 12,  max: 16  },
            { label: 'Monthly',     days: 30,  min: 27,  max: 35  },
            { label: 'Bi-monthly',  days: 61,  min: 55,  max: 67  },
            { label: 'Quarterly',   days: 91,  min: 85,  max: 97  },
            { label: 'Semi-annual', days: 183, min: 170, max: 197 },
            { label: 'Annual',      days: 365, min: 350, max: 380 },
        ];

        const recurring = [];

        Object.entries(groups).forEach(([key, txns]) => {
            if (txns.length < 2) return;
            txns.sort((a, b) => a.date - b.date);

            // ── Step 4: Amount analysis ──
            const amounts = txns.map(t => t.amount).sort((a, b) => a - b);
            const median = amounts[Math.floor(amounts.length / 2)];
            if (median < 1) return; // ignore micro-amounts

            // Coefficient of variation for amount — measures how fixed the price is
            const amtMean = amounts.reduce((s, v) => s + v, 0) / amounts.length;
            const amtStd = Math.sqrt(amounts.reduce((s, v) => s + (v - amtMean) ** 2, 0) / amounts.length);
            const amtCoV = amtMean > 0 ? amtStd / amtMean : 1;

            // Adaptive threshold: tight for fixed subs, loose for variable bills
            const amtThreshold = amtCoV < 0.03 ? 0.05 : amtCoV < 0.15 ? 0.25 : 0.40;
            const consistent = txns.filter(t => Math.abs(t.amount - median) / median <= amtThreshold);
            if (consistent.length < 2) return;

            // ── Step 5: Interval analysis — no hard cap, evaluate all bands ──
            const intervals = [];
            for (let i = 1; i < consistent.length; i++) {
                const diff = (consistent[i].date - consistent[i - 1].date) / 86400000;
                if (diff >= 4) intervals.push(diff); // only filter out same-day duplicates
            }
            if (intervals.length === 0) return;

            const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
            const intStd = Math.sqrt(intervals.reduce((s, v) => s + (v - avgInterval) ** 2, 0) / intervals.length);
            const intCoV = avgInterval > 0 ? intStd / avgInterval : 1;

            // Match to a frequency band
            const band = FREQ_BANDS.find(b => avgInterval >= b.min && avgInterval <= b.max);
            if (!band) return;

            // ── Step 6: Confidence scoring (0–100) ──
            let confidence = 0;

            // Occurrences: 2=15, 3=25, 4=35, 5+=45 pts
            confidence += Math.min(45, consistent.length * 10 + 5);

            // Interval regularity: lower CoV = more regular = more pts (up to 35)
            confidence += Math.max(0, Math.round((1 - Math.min(intCoV * 2.5, 1)) * 35));

            // Amount fixedness: lower CoV = higher pts (up to 15)
            confidence += Math.max(0, Math.round((1 - Math.min(amtCoV * 4, 1)) * 15));

            // Recency bonus: last payment within 1.5x the interval = +5
            const daysSinceLast = (Date.now() - consistent[consistent.length - 1].date) / 86400000;
            if (daysSinceLast < band.days * 1.5) confidence += 5;

            // Known subscription brand = always high confidence floor
            const isKnownSub = KNOWN_SUBS.some(k => key.includes(k));
            if (isKnownSub) confidence = Math.max(confidence, 75);

            confidence = Math.min(100, Math.max(0, Math.round(confidence)));
            if (confidence < 30) return; // not convincing enough

            // ── Step 7: Transaction type classification ──
            let type;
            if (isKnownSub || amtCoV < 0.02) type = 'Subscription';
            else if (amtCoV < 0.12) type = 'Fixed Bill';
            else type = 'Variable Bill';

            // ── Step 8: Next due date + day-of-month estimate ──
            const lastPayment = consistent[consistent.length - 1];
            const nextDue = new Date(lastPayment.date.getTime() + band.days * 86400000);
            const dayOfMonth = band.label === 'Monthly'
                ? Math.round(consistent.reduce((s, t) => s + t.date.getDate(), 0) / consistent.length)
                : null;

            recurring.push({
                merchant: consistent[0].desc.substring(0, 28).trim(),
                category: consistent[0].category,
                type,
                confidence,
                avgAmount: Math.round(median * 100) / 100,
                amountVariability: Math.round(amtCoV * 100), // % how much amount varies
                frequency: band.label,
                intervalDays: band.days,
                occurrences: consistent.length,
                lastDate: lastPayment.origDate,
                nextDue: nextDue.toISOString().slice(0, 10),
                dayOfMonth,
                totalSpent: Math.round(consistent.reduce((s, t) => s + t.amount, 0) * 100) / 100,
                isActive: daysSinceLast < band.days * 2.5,
                txIds: new Set(consistent.map(t => t.id)),
            });
        });

        return recurring
            .filter(r => r.isActive)
            .sort((a, b) => b.confidence - a.confidence || b.avgAmount - a.avgAmount);
    }, [transactions]);

    // Top merchants by spend
    const topMerchants = useMemo(() => {
        const cleanMerchant = (desc) => desc
            .replace(/#\S+/g, '').replace(/\*\S+/g, '').replace(/\b\d{4,}\b/g, '')
            .replace(/[^a-zA-Z0-9 '&]/g, ' ').replace(/\s+/g, ' ').trim()
            .replace(/\b\w/g, c => c.toUpperCase()).substring(0, 28).trim();
        const map = {};
        dashboardTx.filter(t => t.amount < 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const key = cleanMerchant(t.description);
            if (!key || key.length < 2) return;
            if (!map[key]) map[key] = { name: key, total: 0, count: 0, category: t.category };
            map[key].total += Math.abs(t.amount);
            map[key].count++;
        });
        return Object.values(map)
            .map(m => ({ ...m, monthly: m.total / dashboardRange.months }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }, [dashboardTx, dashboardRange, transferTxIds]);

    // Month-over-month category trends
    const categoryTrends = useMemo(() => {
        if (dashboardTx.length === 0) return {};
        const catMonthMap = {};
        dashboardTx.filter(t => t.amount < 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const d = new Date(t.date);
            if (isNaN(d)) return;
            const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const cat = t.category || 'Other';
            if (!catMonthMap[cat]) catMonthMap[cat] = {};
            catMonthMap[cat][month] = (catMonthMap[cat][month] || 0) + Math.abs(t.amount);
        });
        const trends = {};
        Object.entries(catMonthMap).forEach(([cat, monthData]) => {
            const months = Object.keys(monthData).sort();
            if (months.length < 2) { trends[cat] = 'stable'; return; }
            // Compare last 3 months average vs first 3 months average
            const firstHalf = months.slice(0, Math.ceil(months.length / 2));
            const secondHalf = months.slice(Math.ceil(months.length / 2));
            const avgFirst = firstHalf.reduce((s, m) => s + monthData[m], 0) / firstHalf.length;
            const avgSecond = secondHalf.reduce((s, m) => s + monthData[m], 0) / secondHalf.length;
            const change = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;
            if (change > 15) trends[cat] = 'rising';
            else if (change < -15) trends[cat] = 'falling';
            else trends[cat] = 'stable';
        });
        return trends;
    }, [dashboardTx, transferTxIds]);

    // Day-of-week spending heatmap
    const weekdaySpending = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const map = days.map(d => ({ day: d, total: 0, count: 0 }));
        dashboardTx.filter(t => t.amount < 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const d = new Date(t.date);
            if (isNaN(d)) return;
            map[d.getDay()].total += Math.abs(t.amount);
            map[d.getDay()].count++;
        });
        const maxTotal = Math.max(...map.map(d => d.total), 1);
        return map.map(d => ({ ...d, avg: d.count > 0 ? d.total / (dashboardRange.months || 1) : 0, pct: d.total / maxTotal }));
    }, [dashboardTx, dashboardRange, transferTxIds]);

    // Set of recurring transaction IDs (for marking in table)
    const recurringTxKeys = useMemo(() => {
        const keys = new Set();
        recurringPayments.forEach(rp => rp.txIds?.forEach(id => keys.add(id)));
        return keys;
    }, [recurringPayments]);

    // ── Cash Flow Calendar ──
    const calendarData = useMemo(() => {
        const [year, month] = calendarMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDay = new Date(year, month - 1, 1).getDay();
        const days = {};
        transactions
            .filter(t => t.date.startsWith(calendarMonth) && t.category !== 'Transfers' && !transferTxIds.has(t.id))
            .forEach(t => {
                const day = parseInt(t.date.slice(8, 10));
                if (!days[day]) days[day] = { income: 0, expenses: 0, txns: [] };
                if (t.amount > 0) days[day].income += t.amount;
                else days[day].expenses += Math.abs(t.amount);
                days[day].txns.push(t);
            });
        const billDays = {};
        recurringPayments.forEach(rp => {
            if (rp.frequency === 'Monthly' && rp.dayOfMonth) {
                const d = rp.dayOfMonth;
                if (!billDays[d]) billDays[d] = [];
                if (!billDays[d].find(b => b.merchant === rp.merchant)) billDays[d].push(rp);
            }
            if (rp.nextDue && rp.nextDue.startsWith(calendarMonth)) {
                const d = parseInt(rp.nextDue.slice(8, 10));
                if (!billDays[d]) billDays[d] = [];
                if (!billDays[d].find(b => b.merchant === rp.merchant)) billDays[d].push(rp);
            }
        });
        return { year, month, daysInMonth, firstDay, days, billDays };
    }, [calendarMonth, transactions, recurringPayments, transferTxIds]);

    // ═══ V5: DASHBOARD INTELLIGENCE ═══

    // Financial Health Score (0-100) with factor breakdown
    const healthScore = useMemo(() => {
        if (transactions.length === 0) return null;
        let score = 50;
        const factors = [];

        // Factor 1: Savings Rate
        const savingsRate = summary.monthlyIncome > 0 ? (summary.monthlyNet / summary.monthlyIncome) * 100 : 0;
        let srPoints = savingsRate >= 20 ? 20 : savingsRate >= 10 ? 10 : savingsRate >= 0 ? 0 : -15;
        score += srPoints;
        factors.push({ name: 'Savings Rate', value: savingsRate.toFixed(1) + '%', status: savingsRate >= 20 ? 'great' : savingsRate >= 10 ? 'good' : savingsRate >= 0 ? 'fair' : 'poor', desc: savingsRate >= 20 ? 'Saving 20%+ of income' : savingsRate >= 10 ? 'Saving 10–20% — on track' : savingsRate >= 0 ? 'Saving less than 10%' : 'Spending more than earning' });

        // Factor 2: Debt Burden (DTI)
        const dti = summary.monthlyIncome > 0 ? (totalDebtPayments / summary.monthlyIncome) * 100 : 0;
        let dtiPoints = dti === 0 ? 10 : dti < 20 ? 5 : dti > 40 ? -15 : dti > 30 ? -10 : 0;
        score += dtiPoints;
        factors.push({ name: 'Debt Burden', value: dti.toFixed(1) + '%', status: dti === 0 ? 'great' : dti < 20 ? 'good' : dti < 35 ? 'fair' : 'poor', desc: dti === 0 ? 'No debt payments' : dti < 20 ? 'Healthy debt level' : dti < 35 ? 'Moderate debt load' : 'High debt burden' });

        // Factor 3: Spending Trend
        const fallingCount = Object.values(categoryTrends).filter(t => t === 'falling').length;
        const risingCount = Object.values(categoryTrends).filter(t => t === 'rising').length;
        score += fallingCount * 3 - risingCount * 3;
        factors.push({ name: 'Spending Trend', value: risingCount > 0 ? `${risingCount} rising` : fallingCount > 0 ? `${fallingCount} falling` : 'Stable', status: risingCount > fallingCount ? 'poor' : fallingCount > risingCount ? 'good' : 'fair', desc: risingCount > fallingCount ? `${risingCount} categories trending up` : fallingCount > 0 ? `${fallingCount} categories trending down — good` : 'Spending patterns stable' });

        // Factor 4: Bills Awareness
        if (recurringPayments.length > 0) score += 5;
        factors.push({ name: 'Bills Tracked', value: recurringPayments.length + ' detected', status: recurringPayments.length >= 4 ? 'good' : recurringPayments.length > 0 ? 'fair' : 'poor', desc: recurringPayments.length >= 4 ? 'Recurring bills identified' : recurringPayments.length > 0 ? 'Some recurring payments found' : 'No recurring patterns found' });

        // Factor 5: Income Consistency (CoV)
        const incomeByMonth = {};
        transactions.filter(t => t.amount > 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const m = t.date.slice(0, 7);
            incomeByMonth[m] = (incomeByMonth[m] || 0) + t.amount;
        });
        const incomeVals = Object.values(incomeByMonth);
        let incomeConsistency = 'Variable';
        if (incomeVals.length >= 3) {
            const mean = incomeVals.reduce((s, v) => s + v, 0) / incomeVals.length;
            const variance = incomeVals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / incomeVals.length;
            const cov = mean > 0 ? Math.sqrt(variance) / mean : 1;
            incomeConsistency = cov < 0.1 ? 'Consistent' : cov < 0.25 ? 'Mostly Steady' : cov < 0.5 ? 'Variable' : 'Irregular';
            if (cov < 0.1) score += 5;
            else if (cov < 0.25) score += 2;
            else if (cov >= 0.5) score -= 5;
            factors.push({ name: 'Income Stability', value: incomeConsistency, status: cov < 0.1 ? 'great' : cov < 0.25 ? 'good' : cov < 0.5 ? 'fair' : 'poor', desc: cov < 0.1 ? 'Income is very steady' : cov < 0.25 ? 'Income is mostly predictable' : cov < 0.5 ? 'Income varies month to month' : 'Highly irregular income' });
        }

        const grade = Math.max(0, Math.min(100, Math.round(score)));
        const label = grade >= 80 ? 'Excellent' : grade >= 65 ? 'Good' : grade >= 50 ? 'Fair' : grade >= 35 ? 'Needs Work' : 'Critical';
        const color = grade >= 80 ? '#0ecb81' : grade >= 65 ? '#3b82f6' : grade >= 50 ? '#f59e0b' : grade >= 35 ? '#f97316' : '#ef4444';
        return { score: grade, label, color, savingsRate, dti, factors };
    }, [transactions, summary, totalDebtPayments, categoryTrends, recurringPayments, transferTxIds]);

    // Month-over-Month category comparison
    const momComparison = useMemo(() => {
        if (dashboardTx.length === 0) return [];
        const catMonth = {};
        dashboardTx.filter(t => t.amount < 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const d = new Date(t.date);
            if (isNaN(d)) return;
            const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const cat = t.category || 'Other';
            if (!catMonth[cat]) catMonth[cat] = {};
            catMonth[cat][m] = (catMonth[cat][m] || 0) + Math.abs(t.amount);
        });
        const allMonths = [...new Set(dashboardTx.map(t => { const d = new Date(t.date); return isNaN(d) ? null : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }).filter(Boolean))].sort();
        if (allMonths.length < 2) return [];
        const latest = allMonths[allMonths.length - 1];
        const prev = allMonths[allMonths.length - 2];
        return Object.entries(catMonth)
            .map(([cat, months]) => {
                const cur = months[latest] || 0;
                const prv = months[prev] || 0;
                const change = prv > 0 ? ((cur - prv) / prv) * 100 : cur > 0 ? 100 : 0;
                return { category: cat, current: cur, previous: prv, change, currentMonth: latest, prevMonth: prev };
            })
            .filter(c => c.current > 0 || c.previous > 0)
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    }, [dashboardTx, transferTxIds]);

    // Cash Flow Waterfall
    const cashFlowWaterfall = useMemo(() => {
        if (dashboardTx.length === 0) return [];
        const fixedTotal = recurringPayments.filter(r => r.frequency === 'Monthly').reduce((s, r) => s + r.avgAmount, 0);
        const variableSpending = summary.monthlySpending - fixedTotal;
        return [
            { name: 'Income', value: summary.monthlyIncome, fill: '#0ecb81', type: 'income' },
            { name: 'Fixed Bills', value: -fixedTotal, fill: '#f43f5e', type: 'expense' },
            { name: 'Variable', value: -Math.max(0, variableSpending), fill: '#f59e0b', type: 'expense' },
            { name: 'Debt Payments', value: -totalDebtPayments, fill: '#e11d48', type: 'expense' },
            { name: 'Left Over', value: Math.max(0, summary.monthlyIncome - summary.monthlySpending - totalDebtPayments), fill: '#06b6d4', type: 'savings' },
        ];
    }, [summary, recurringPayments, totalDebtPayments, dashboardTx]);

    // Upcoming Bills (next 14 days)
    const upcomingBills = useMemo(() => {
        const today = new Date();
        const in14 = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        return recurringPayments
            .filter(rp => {
                const due = new Date(rp.nextDue);
                return due >= today && due <= in14;
            })
            .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
    }, [recurringPayments]);

    // Auto-suggested budgets (based on last 3 month average per category)
    const autoBudgets = useMemo(() => {
        if (dashboardTx.length === 0) return [];
        const catMonth = {};
        dashboardTx.filter(t => t.amount < 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const d = new Date(t.date);
            if (isNaN(d)) return;
            const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const cat = t.category || 'Other';
            if (!catMonth[cat]) catMonth[cat] = {};
            catMonth[cat][m] = (catMonth[cat][m] || 0) + Math.abs(t.amount);
        });
        const allMonths = [...new Set(Object.values(catMonth).flatMap(m => Object.keys(m)))].sort();
        const lastMonth = allMonths[allMonths.length - 1];
        if (!lastMonth) return [];
        return Object.entries(catMonth)
            .map(([cat, months]) => {
                const vals = Object.values(months);
                const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
                const budget = Math.ceil(avg / 10) * 10; // round up to nearest 10
                const actual = months[lastMonth] || 0;
                const pct = budget > 0 ? (actual / budget) * 100 : 0;
                return { category: cat, budget, actual, pct, over: actual > budget };
            })
            .sort((a, b) => b.actual - a.actual)
            .slice(0, 8);
    }, [dashboardTx, transferTxIds]);

    // Anomaly detection
    const anomalies = useMemo(() => {
        if (dashboardTx.length === 0) return [];
        const catMonth = {};
        dashboardTx.filter(t => t.amount < 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const d = new Date(t.date);
            if (isNaN(d)) return;
            const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const cat = t.category || 'Other';
            if (!catMonth[cat]) catMonth[cat] = {};
            catMonth[cat][m] = (catMonth[cat][m] || 0) + Math.abs(t.amount);
        });
        const flags = [];
        Object.entries(catMonth).forEach(([cat, months]) => {
            const vals = Object.values(months);
            if (vals.length < 3) return;
            const avg = vals.slice(0, -1).reduce((s, v) => s + v, 0) / (vals.length - 1);
            const latest = vals[vals.length - 1];
            const ratio = avg > 0 ? latest / avg : 0;
            if (ratio > 1.25 && latest - avg > 50) flags.push({ category: cat, latest, avg, ratio, type: 'high' });
            else if (ratio < 0.75 && avg - latest > 50 && latest > 0) flags.push({ category: cat, latest, avg, ratio, type: 'low' });
        });
        return flags.sort((a, b) => b.ratio - a.ratio);
    }, [dashboardTx, transferTxIds]);

    // Income source breakdown
    const incomeSources = useMemo(() => {
        const map = {};
        dashboardTx.filter(t => t.amount > 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const key = t.description.substring(0, 22).trim();
            if (!map[key]) map[key] = { name: key, total: 0, count: 0 };
            map[key].total += t.amount;
            map[key].count++;
        });
        return Object.values(map)
            .map(s => ({ ...s, monthly: s.total / (dashboardRange.months || 1) }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);
    }, [dashboardTx, dashboardRange, transferTxIds]);

    // Subscription audit
    const subscriptionAudit = useMemo(() => {
        return recurringPayments.filter(rp =>
            rp.category === 'Subscriptions' ||
            rp.category === 'Entertainment' ||
            ['netflix', 'spotify', 'disney', 'apple', 'youtube', 'hbo', 'adobe', 'amazon prime', 'rogers', 'patreon'].some(k => rp.merchant.toLowerCase().includes(k))
        );
    }, [recurringPayments]);
    const filteredTx = useMemo(() => {
        let list = transactions;
        if (txAccountFilter !== 'All') list = list.filter(t => t.accountId === txAccountFilter);
        if (txSearch) {
            const q = txSearch.toLowerCase();
            list = list.filter(t =>
                t.description.toLowerCase().includes(q) ||
                t.date.includes(q) ||
                Math.abs(t.amount).toFixed(2).includes(q) ||
                fmt(t.amount).toLowerCase().includes(q)
            );
        }
        if (txCatFilter !== 'All') list = list.filter(t => t.category === txCatFilter);
        if (txDateFrom) list = list.filter(t => t.date >= txDateFrom);
        if (txDateTo) list = list.filter(t => t.date <= txDateTo);
        // Sort
        list = [...list].sort((a, b) => {
            let cmp = 0;
            if (txSort.key === 'date') cmp = a.date.localeCompare(b.date);
            else if (txSort.key === 'amount') cmp = a.amount - b.amount;
            else if (txSort.key === 'category') cmp = (a.category || '').localeCompare(b.category || '');
            else if (txSort.key === 'description') cmp = a.description.localeCompare(b.description);
            return txSort.dir === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [transactions, txAccountFilter, txSearch, txCatFilter, txDateFrom, txDateTo, txSort]);
    const filteredSum = useMemo(() => filteredTx.reduce((s, t) => s + t.amount, 0), [filteredTx]);
    const txPageCount = Math.ceil(filteredTx.length / TX_PER_PAGE);
    const pagedTx = filteredTx.slice(txPage * TX_PER_PAGE, (txPage + 1) * TX_PER_PAGE);
    const toggleSort = (key) => {
        setTxSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
        setTxPage(0);
    };


    // ── SAVINGS CALCULATIONS (v2: uses monthly averages) ──
    const savingsData = useMemo(() => {
        const monthlyIncome = summary.monthlyIncome || 0;
        const monthlyExpenses = summary.monthlySpending + totalDebtPayments;
        const canSave = Math.max(0, monthlyIncome - monthlyExpenses);
        const emergencyTarget3 = summary.monthlySpending * 3;
        const emergencyTarget6 = summary.monthlySpending * 6;
        const monthsTo3 = canSave > 0 ? Math.ceil(emergencyTarget3 / canSave) : Infinity;
        const monthsTo6 = canSave > 0 ? Math.ceil(emergencyTarget6 / canSave) : Infinity;
        const debtProjections = debts.map(d => {
            const bal = Number(d.amount) || 0;
            const pmt = Number(d.monthlyPayment) || 0;
            const rate = (Number(d.interestRate) || 0) / 100 / 12;
            if (pmt <= 0) return { ...d, monthsToPayoff: Infinity, totalInterest: 0 };
            let remaining = bal, months = 0, totalInterest = 0;
            while (remaining > 0 && months < 600) {
                const interest = remaining * rate;
                totalInterest += interest;
                remaining = remaining + interest - pmt;
                months++;
            }
            return { ...d, monthsToPayoff: months, totalInterest: Math.round(totalInterest * 100) / 100 };
        });
        return { canSave, emergencyTarget3, emergencyTarget6, monthsTo3, monthsTo6, debtProjections, monthlyIncome, monthlyExpenses };
    }, [summary, debts, totalDebtPayments]);

    // ── SCENARIO MODELING ──
    const [extraSavings, setExtraSavings] = useState(100);
    const scenarioData = useMemo(() => {
        const amounts = [0, 50, 100, 200, 500];
        if (!amounts.includes(extraSavings)) amounts.push(extraSavings);
        return amounts.sort((a, b) => a - b).map(extra => {
            const totalMonthly = savingsData.canSave + extra;
            const m3 = totalMonthly > 0 ? Math.ceil(savingsData.emergencyTarget3 / totalMonthly) : null;
            const m6 = totalMonthly > 0 ? Math.ceil(savingsData.emergencyTarget6 / totalMonthly) : null;
            return { extra, totalMonthly: Math.round(totalMonthly), months3: m3, months6: m6 };
        });
    }, [savingsData, extraSavings]);

    // ── DEBT PAYOFF STRATEGIES (Avalanche vs Snowball) ──
    const debtStrategies = useMemo(() => {
        const eligible = debts.filter(d => Number(d.amount) > 0 && Number(d.monthlyPayment) > 0);
        if (eligible.length === 0) return null;
        const simulate = (sortFn) => {
            let pool = eligible.map(d => ({
                id: d.id, name: d.name,
                balance: Number(d.amount),
                rate: (Number(d.interestRate) || 0) / 100 / 12,
                min: Number(d.monthlyPayment),
            }));
            const budget = pool.reduce((s, d) => s + d.min, 0);
            let months = 0, totalInterest = 0;
            const payoffOrder = [];
            while (pool.length > 0 && months < 600) {
                months++;
                pool.forEach(d => { const i = d.balance * d.rate; totalInterest += i; d.balance += i; });
                pool.sort(sortFn);
                let remaining = budget;
                // Pay minimum on non-target debts
                for (let i = 1; i < pool.length; i++) {
                    const pay = Math.min(pool[i].min, pool[i].balance, remaining);
                    pool[i].balance -= pay; remaining -= pay;
                }
                // Throw everything remaining at target debt
                pool[0].balance = Math.max(0, pool[0].balance - remaining);
                const paid = pool.filter(d => d.balance < 0.01);
                paid.forEach(d => payoffOrder.push({ name: d.name, month: months }));
                pool = pool.filter(d => d.balance >= 0.01);
            }
            return { months, totalInterest: Math.round(totalInterest * 100) / 100, payoffOrder };
        };
        const avalanche = simulate((a, b) => b.rate - a.rate);   // highest rate first
        const snowball  = simulate((a, b) => a.balance - b.balance); // smallest balance first

        // Strategy 3: Minimum Only — pay only minimums, no rollover freed funds
        const simulateMinOnly = () => {
            let pool = eligible.map(d => ({ id: d.id, name: d.name, balance: Number(d.amount), rate: (Number(d.interestRate) || 0) / 100 / 12, min: Number(d.minimumPayment || d.monthlyPayment) }));
            let months = 0, totalInterest = 0;
            const payoffOrder = [];
            while (pool.length > 0 && months < 600) {
                months++;
                pool.forEach(d => { const i = d.balance * d.rate; totalInterest += i; d.balance += i; });
                pool.forEach(d => { d.balance = Math.max(0, d.balance - d.min); });
                const paid = pool.filter(d => d.balance < 0.01);
                paid.forEach(d => payoffOrder.push({ name: d.name, month: months }));
                pool = pool.filter(d => d.balance >= 0.01);
            }
            return { months, totalInterest: Math.round(totalInterest * 100) / 100, payoffOrder };
        };

        // Strategy 4: Hybrid — snowball to clear first debt quickly, then avalanche
        const simulateHybrid = () => {
            let pool = eligible.map(d => ({ id: d.id, name: d.name, balance: Number(d.amount), rate: (Number(d.interestRate) || 0) / 100 / 12, min: Number(d.monthlyPayment) }));
            const budget = pool.reduce((s, d) => s + d.min, 0);
            let months = 0, totalInterest = 0;
            const payoffOrder = [];
            let useSnowball = true;
            while (pool.length > 0 && months < 600) {
                months++;
                pool.forEach(d => { const i = d.balance * d.rate; totalInterest += i; d.balance += i; });
                // Switch to avalanche after first debt is cleared
                if (useSnowball) pool.sort((a, b) => a.balance - b.balance);
                else pool.sort((a, b) => b.rate - a.rate);
                let remaining = budget;
                for (let i = 1; i < pool.length; i++) { const pay = Math.min(pool[i].min, pool[i].balance, remaining); pool[i].balance -= pay; remaining -= pay; }
                pool[0].balance = Math.max(0, pool[0].balance - remaining);
                const paid = pool.filter(d => d.balance < 0.01);
                if (paid.length > 0) { useSnowball = false; paid.forEach(d => payoffOrder.push({ name: d.name, month: months })); }
                pool = pool.filter(d => d.balance >= 0.01);
            }
            return { months, totalInterest: Math.round(totalInterest * 100) / 100, payoffOrder };
        };

        const minimumOnly = simulateMinOnly();
        const hybrid = simulateHybrid();

        return { avalanche, snowball, hybrid, minimumOnly, interestSaved: Math.round((snowball.totalInterest - avalanche.totalInterest) * 100) / 100, totalBudget: eligible.reduce((s, d) => s + Number(d.monthlyPayment), 0) };
    }, [debts]);

    // ── MONTHLY SAVINGS HISTORY ──
    const monthlySavingsHistory = useMemo(() => {
        const byMonth = {};
        transactions.filter(t => t.category !== 'Transfers' && !transferTxIds.has(t.id)).forEach(t => {
            const m = t.date.slice(0, 7);
            if (!byMonth[m]) byMonth[m] = 0;
            byMonth[m] += t.amount;
        });
        const months = Object.keys(byMonth).sort();
        if (months.length === 0) return { data: [], best: 0, worst: 0, avg: 0 };
        const data = months.map(m => {
            const net = byMonth[m];
            return { month: m.slice(5) + '/' + m.slice(2, 4), fullMonth: m, net: Math.round(net * 100) / 100 };
        });
        const nets = data.map(d => d.net);
        return { data, best: Math.max(...nets), worst: Math.min(...nets), avg: Math.round(nets.reduce((s, v) => s + v, 0) / nets.length) };
    }, [transactions, transferTxIds]);

    // ── INCOME VS EXPENSE TREND (monthly side-by-side) ──
    const incomeExpenseTrend = useMemo(() => {
        return monthlyData.map(m => ({
            ...m,
            label: m.month.slice(5) + '/' + m.month.slice(2, 4),
            net: Math.round((m.income - m.expenses) * 100) / 100,
        }));
    }, [monthlyData]);

    // ── FINANCIAL PRIORITY STACK ──
    const priorityStack = useMemo(() => {
        const monthlyExpenses = summary.monthlySpending;
        const buffer1k = 1000;
        const fund3mo = monthlyExpenses * 3;
        const fund6mo = monthlyExpenses * 6;
        const highRateDebts = debts.filter(d => Number(d.interestRate) >= 8 && Number(d.amount) > 0);
        const savingsAccGoal = savingsGoals.find(g => g.name.toLowerCase().includes('emergency') || g.name.toLowerCase().includes('fund'));
        const efCurrent = savingsAccGoal ? Number(savingsAccGoal.current) || 0 : 0;
        const steps = [
            { id: 1, label: 'Cover Essential Expenses', desc: 'Housing, food, utilities, and transport come first', done: summary.monthlyIncome >= monthlyExpenses, icon: '🏠' },
            { id: 2, label: 'Build a $1,000 Buffer', desc: 'Small emergency buffer stops you going into debt for surprises', done: efCurrent >= buffer1k, target: buffer1k, current: Math.min(efCurrent, buffer1k), icon: '🛡️' },
            { id: 3, label: 'Make All Minimum Payments', desc: 'Never miss a minimum — late fees and credit damage cost more', done: totalDebtPayments > 0 || debts.length === 0, icon: '💳' },
            { id: 4, label: '3-Month Emergency Fund', desc: `Target ${fmt(fund3mo)} — covers job loss or major repair`, done: efCurrent >= fund3mo, target: fund3mo, current: Math.min(efCurrent, fund3mo), icon: '⛑️' },
            { id: 5, label: 'Attack High-Interest Debt', desc: highRateDebts.length > 0 ? `You have ${highRateDebts.length} debt${highRateDebts.length > 1 ? 's' : ''} above 8% APR — avalanche or snowball` : 'No high-interest debt — great!', done: highRateDebts.length === 0, icon: '🔥' },
            { id: 6, label: '6-Month Emergency Fund', desc: `Target ${fmt(fund6mo)} — full safety net`, done: efCurrent >= fund6mo, target: fund6mo, current: Math.min(efCurrent, fund6mo), icon: '🏦' },
            { id: 7, label: 'Invest (RRSP / TFSA)', desc: 'Once debts are under control, put surplus into registered accounts', done: false, icon: '📈' },
        ];
        const activeStep = steps.findIndex(s => !s.done);
        return { steps, activeStep };
    }, [summary, debts, totalDebtPayments, savingsGoals]);

    // ── ACTION PLAN (3 clear priority actions for dashboard) ──
    const actionPlan = useMemo(() => {
        if (transactions.length === 0) return [];
        const actions = [];
        const highRateDebts = debts.filter(d => Number(d.interestRate) >= 8 && Number(d.amount) > 0).sort((a, b) => Number(b.interestRate) - Number(a.interestRate));
        const topSpend = [...categoryData].sort((a, b) => b.monthly - a.monthly).find(c => ['Food & Dining', 'Shopping', 'Entertainment', 'Subscriptions', 'Transport'].includes(c.name));
        const savingsRate = summary.monthlyIncome > 0 ? (summary.monthlyNet / summary.monthlyIncome) * 100 : 0;

        // Priority 1: Close monthly gap if in deficit
        if (summary.monthlyNet < 0) {
            actions.push({
                icon: '🚨',
                priority: 'critical',
                title: 'Close your monthly gap',
                desc: `You're spending ${fmt(Math.abs(summary.monthlyNet))}/mo more than you earn. Find cuts in your top spending category first.`,
                action: 'View Spend Check',
                tab: 'doctor',
            });
        }
        // Priority 1 (or 2): Attack highest-rate debt
        if (highRateDebts.length > 0) {
            actions.push({
                icon: '🔥',
                priority: summary.monthlyNet < 0 ? 'high' : 'critical',
                title: `Attack ${highRateDebts[0].name}`,
                desc: `At ${highRateDebts[0].interestRate}% APR, this debt costs you roughly ${fmt((Number(highRateDebts[0].amount) * Number(highRateDebts[0].interestRate) / 100) / 12)}/mo in interest. Every extra dollar here is a guaranteed return.`,
                action: 'View Debts',
                tab: 'debts',
            });
        }
        // Savings rate action
        if (savingsRate < 10 && summary.monthlyNet >= 0) {
            actions.push({
                icon: '💰',
                priority: 'medium',
                title: 'Automate your savings',
                desc: `You can save ${fmt(savingsData.canSave)}/mo. Set up an automatic transfer on payday — even ${fmt(Math.max(50, savingsData.canSave * 0.5))}/mo builds to ${fmt(Math.max(50, savingsData.canSave * 0.5) * 12)} in a year.`,
                action: 'View Savings Plan',
                tab: 'savings',
            });
        }
        // Top spend cut
        if (topSpend && actions.length < 3) {
            actions.push({
                icon: '✂️',
                priority: 'medium',
                title: `Trim ${topSpend.name}`,
                desc: `Your biggest cuttable expense is ${fmt(topSpend.monthly)}/mo. A 20% reduction frees ${fmt(topSpend.monthly * 0.2)}/mo — that's ${fmt(topSpend.monthly * 0.2 * 12)}/yr.`,
                action: 'See Breakdown',
                tab: 'dashboard',
            });
        }
        // Default positive action if all is well
        if (actions.length === 0) {
            actions.push({
                icon: '📈',
                priority: 'low',
                title: 'Start investing',
                desc: `Great position — positive cash flow and manageable debt. Your next step is maximizing your TFSA (${fmt(7000)} room/year) then RRSP contributions.`,
                action: 'View Net Worth',
                tab: 'networth',
            });
        }
        return actions.slice(0, 3);
    }, [transactions, debts, summary, categoryData, savingsData]);

    // ── SPENDING CUTS CALCULATOR ──
    const spendingCuts = useMemo(() => {
        const cuttable = ['Food & Dining', 'Shopping', 'Entertainment', 'Subscriptions', 'Transport'];
        return categoryData
            .filter(c => cuttable.includes(c.name) && c.monthly > 0)
            .sort((a, b) => b.monthly - a.monthly)
            .slice(0, 4)
            .map(c => {
                const freed = c.monthly * 0.25;
                const monthsFaster = savingsGoals.length > 0
                    ? savingsGoals.map(g => {
                        const remaining = Math.max(0, (Number(g.target) || 0) - (Number(g.current) || 0));
                        const baseRate = savingsData.canSave > 0 ? savingsData.canSave : 0;
                        const newRate = baseRate + freed;
                        if (baseRate <= 0 || remaining <= 0) return null;
                        const baseMo = Math.ceil(remaining / baseRate);
                        const newMo = Math.ceil(remaining / newRate);
                        return { name: g.name, fasterBy: baseMo - newMo };
                    }).filter(Boolean)
                    : [];
                return { category: c.name, monthly: c.monthly, freed: Math.round(freed * 100) / 100, monthsFaster };
            });
    }, [categoryData, savingsGoals, savingsData]);

    // ── STAT CARD DELTAS (last month vs prior month) ──
    const statDeltas = useMemo(() => {
        if (monthlyData.length < 2) return null;
        const sorted = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));
        const last = sorted[sorted.length - 1];
        const prev = sorted[sorted.length - 2];
        const pIncome = prev.income, lIncome = last.income;
        const pExp = prev.expenses, lExp = last.expenses;
        const pNet = pIncome - pExp, lNet = lIncome - lExp;
        const pct = (a, b) => b > 0 ? ((a - b) / b) * 100 : a > b ? 100 : 0;
        return {
            income: { delta: lIncome - pIncome, pct: pct(lIncome, pIncome) },
            spending: { delta: lExp - pExp, pct: pct(lExp, pExp) },
            net: { delta: lNet - pNet, pct: pct(lNet, pNet) },
        };
    }, [monthlyData]);

    // ── THIS MONTH SO FAR ──
    const thisMonth = useMemo(() => {
        const now = new Date();
        const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const txThisMonth = transactions.filter(t =>
            t.date.startsWith(key) && t.category !== 'Transfers' && !transferTxIds.has(t.id)
        );
        const spentSoFar = txThisMonth.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        const earnedSoFar = txThisMonth.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const pace = dayOfMonth > 0 ? (spentSoFar / dayOfMonth) * daysInMonth : 0;
        return {
            key, dayOfMonth, daysInMonth,
            spentSoFar, earnedSoFar,
            pace: Math.round(pace),
            vsAvg: summary.monthlySpending > 0 ? pace - summary.monthlySpending : null,
            pctOfMonth: Math.round((dayOfMonth / daysInMonth) * 100),
        };
    }, [transactions, transferTxIds, summary]);

    // ── RUNWAY (months of savings runway if currently in deficit) ──
    const runway = useMemo(() => {
        if (summary.monthlyNet >= 0) return null;
        const deficit = Math.abs(summary.monthlyNet);
        const totalSavings = netWorth.balTotal + netWorth.assetTotal;
        if (totalSavings <= 0) return { months: 0, critical: true };
        const months = totalSavings / deficit;
        return { months: Math.floor(months), critical: months < 3 };
    }, [summary, netWorth]);

    // ── SAVINGS RATE SPARKLINE (last 6 months) ──
    const savingsRateTrend = useMemo(() => {
        if (monthlyData.length < 2) return [];
        return [...monthlyData]
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6)
            .map(m => ({
                month: m.month.slice(5) + '/' + m.month.slice(2, 4),
                rate: m.income > 0 ? Math.round(((m.income - m.expenses) / m.income) * 100) : 0,
            }));
    }, [monthlyData]);

    // ── WINS (positive reinforcement) ──
    const wins = useMemo(() => {
        if (transactions.length === 0) return [];
        const w = [];
        if (summary.monthlyNet > 0) w.push({ icon: '✅', text: `Positive cash flow — saving ${fmt(summary.monthlyNet)}/mo` });
        if (healthScore && healthScore.score >= 65) w.push({ icon: '🏆', text: `Health score ${healthScore.score} — ${healthScore.label}` });
        const fallingCats = Object.entries(categoryTrends).filter(([, t]) => t === 'falling').map(([c]) => c);
        if (fallingCats.length > 0) w.push({ icon: '📉', text: `${fallingCats.slice(0, 2).join(', ')} spending is trending down` });
        if (totalDebtBalance === 0 && debts.length === 0) w.push({ icon: '🎉', text: 'No debt tracked — keep it up!' });
        if (savingsGoals.some(g => Number(g.current) >= Number(g.target))) w.push({ icon: '🎯', text: 'A savings goal is fully funded!' });
        if (healthScore && healthScore.dti < 15 && totalDebtPayments > 0) w.push({ icon: '💪', text: `Debt-to-income at ${healthScore.dti.toFixed(0)}% — well managed` });
        return w.slice(0, 4);
    }, [transactions, summary, healthScore, categoryTrends, totalDebtBalance, debts, savingsGoals, totalDebtPayments]);

    // ── FINANCIAL SUMMARY FOR AI (v2: monthly figures) ──
    const financialContext = useMemo(() => {
        return `FINANCIAL DATA SUMMARY (${dataRange.label}, ${dataRange.months.toFixed(1)} months of data):
Monthly Income (avg): ${fmt(summary.monthlyIncome)}
Monthly Spending (avg): ${fmt(summary.monthlySpending)}
Monthly Net Cashflow: ${fmt(summary.monthlyNet)}
Period Total Income: ${fmt(summary.income)}
Period Total Spending: ${fmt(summary.spending)}
Internal Transfer Volume: ${fmt(summary.transferVol)} (excluded from income/spending)
Total Transactions: ${transactions.length}

SPENDING BY CATEGORY (monthly averages):
${categoryData.map(c => `- ${c.name}: ${fmt(c.monthly)}/mo (${c.pct.toFixed(1)}%, ${c.count} txns)`).join('\n')}

DEBTS & FIXED EXPENSES:
${debts.length ? debts.map(d => `- ${d.name}: Balance ${fmt(d.amount)}, Payment ${fmt(d.monthlyPayment)}/mo, Rate ${d.interestRate}%, Priority: ${d.priority}`).join('\n') : 'No debts entered.'}
Total Debt Balance: ${fmt(totalDebtBalance)}
Total Monthly Debt Payments: ${fmt(totalDebtPayments)}

SAVINGS CAPACITY:
Can save per month: ${fmt(savingsData.canSave)}
Emergency fund target (3mo): ${fmt(savingsData.emergencyTarget3)}
Emergency fund target (6mo): ${fmt(savingsData.emergencyTarget6)}
Months to 3-month fund: ${savingsData.monthsTo3 === Infinity ? 'N/A' : savingsData.monthsTo3}
Months to 6-month fund: ${savingsData.monthsTo6 === Infinity ? 'N/A' : savingsData.monthsTo6}`;
    }, [summary, categoryData, debts, totalDebtBalance, totalDebtPayments, savingsData, dataRange]);

    // ── AI CHAT (Ollama qwen3:8b) ──
    const sendChat = useCallback(async (message, isAuto = false) => {
        if (!message.trim() && !isAuto) return;
        const userMsg = isAuto
            ? { role: 'user', content: message, isSystem: true }
            : { role: 'user', content: message };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);
        try {
            const systemPrompt = `You are a senior financial advisor inside a Personal Financial Recovery App. Your single mission is to help the user achieve complete financial freedom — meaning: zero high-interest debt, a fully-funded 6-month emergency fund, consistent monthly savings, and a clear path to building wealth.

You have FULL access to the user's real financial data below. Always reference specific numbers. Be direct, warm, non-judgmental, and action-oriented. When things are bad, name them clearly but constructively. When things are good, celebrate. Format with clear headers and bullet points.

CORE PRINCIPLES you always apply:
1. Emergency fund before investing
2. High-interest debt is a financial emergency — attack it aggressively
3. Automate savings — pay yourself first
4. Cut lifestyle inflation before cutting necessities
5. Every dollar should have a job (zero-based thinking)
6. Small consistent wins compound into massive results

${financialContext}`;
            const msgs = [...chatMessages, userMsg]
                .filter(m => !m.isSystem || m.role === 'user')
                .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
            const res = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen3:8b',
                    messages: [{ role: 'system', content: systemPrompt }, ...msgs],
                    stream: false,
                    options: { temperature: 0.7 },
                }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Ollama error ${res.status}: ${errText.slice(0, 200)}`);
            }
            const data = await res.json();
            const reply = data.message?.content || 'Unable to generate a response. Make sure Ollama is running with qwen3:8b loaded.';
            setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            const isOllamaDown = err.message.includes('Failed to fetch') || err.message.includes('ECONNREFUSED') || err.message.includes('NetworkError') || err.message.includes('net::ERR');
            if (isOllamaDown) {
                // Seamless local fallback — user never sees an error
                const localData = { summary, categoryData, debts, totalDebtBalance, totalDebtPayments, healthScore, savingsData, priorityStack, wins, runway };
                const localReply = localAdvisor(message, localData);
                setChatMessages(prev => [...prev, { role: 'assistant', content: localReply, isLocal: true }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.message}` }]);
            }
        }
        setChatLoading(false);
    }, [chatMessages, financialContext, summary, categoryData, debts, totalDebtBalance, totalDebtPayments, healthScore, savingsData, priorityStack, wins, runway]);

    // Auto-generate report when advisor tab is first opened with data
    useEffect(() => {
        if (activeTab === 'advisor' && !advisorReportGenerated && transactions.length > 0) {
            setAdvisorReportGenerated(true);
            sendChat('Generate my comprehensive financial health report', true);
        }
    }, [activeTab, advisorReportGenerated, transactions.length]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    // ── ADD/EDIT DEBT (v4: expanded fields) ──
    const addDebt = useCallback(() => {
        if (!debtForm.name || !debtForm.amount) return;
        const entry = {
            ...debtForm,
            id: editingDebtId || `debt-${Date.now()}`,
            amount: Number(debtForm.amount),
            monthlyPayment: Number(debtForm.monthlyPayment) || 0,
            minimumPayment: Number(debtForm.minimumPayment) || Number(debtForm.monthlyPayment) || 0,
            interestRate: Number(debtForm.interestRate) || 0,
            monthsRemaining: Number(debtForm.monthsRemaining) || 0,
        };
        if (editingDebtId) {
            setDebts(prev => prev.map(d => d.id === editingDebtId ? entry : d));
            setEditingDebtId(null);
        } else {
            setDebts(prev => [...prev, entry]);
        }
        setDebtForm({ name: '', amount: '', monthlyPayment: '', minimumPayment: '', interestRate: '', type: 'debt', debtCategory: 'credit_card', monthsRemaining: '', priority: 'medium', lender: '', notes: '' });
    }, [debtForm, editingDebtId]);

    // ── ADD MANUAL TRANSACTION ──
    const addManualTransaction = useCallback(() => {
        if (!manualTxForm.date || !manualTxForm.description || !manualTxForm.amount) return;
        const rawAmt = Number(manualTxForm.amount);
        const amount = manualTxForm.type === 'expense' ? -Math.abs(rawAmt) : Math.abs(rawAmt);
        const accountId = manualTxForm.accountId || (accounts[0]?.id || 'manual');
        const tx = {
            id: `manual-${Date.now()}`,
            date: manualTxForm.date,
            description: manualTxForm.description,
            amount,
            category: manualTxForm.category || categorize(manualTxForm.description),
            accountId,
            manual: true,
        };
        setTransactions(prev => [...prev, tx]);
        setManualTxForm({ date: '', description: '', amount: '', category: 'Other', accountId: '', type: 'expense' });
        setShowManualTxForm(false);
    }, [manualTxForm, accounts]);

    const submitGhostManual = useCallback(() => {
        if (!ghostManualModal) return;
        const { item } = ghostManualModal;
        const accId = `acc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const acc = {
            id: accId,
            fileName: null,
            accountName: ghostManualForm.name || item.label,
            accountType: item.accountType,
            manualEntry: true,
        };
        setAccounts(prev => [...prev, acc]);
        // Store balance
        const bal = Number(ghostManualForm.balance) || 0;
        if (bal !== 0) setAccountBalances(prev => ({ ...prev, [accId]: ghostManualForm.balance }));
        // For debt-type accounts, also create a debt entry
        const debtTypes = ['credit', 'loc', 'mortgage', 'vehicle'];
        if (debtTypes.includes(item.accountType) && bal > 0) {
            const categoryMap = { credit: 'credit_card', loc: 'line_of_credit', mortgage: 'mortgage', vehicle: 'car_loan' };
            setDebts(prev => [...prev, {
                id: `debt-${Date.now()}`,
                name: ghostManualForm.name || item.label,
                amount: String(Math.abs(bal)),
                monthlyPayment: ghostManualForm.monthlyPayment || '',
                minimumPayment: ghostManualForm.monthlyPayment || '',
                interestRate: ghostManualForm.interestRate || '',
                type: 'debt',
                debtCategory: categoryMap[item.accountType] || 'other',
                priority: 'medium',
                lender: '',
                notes: ghostManualForm.notes || '',
            }]);
        }
        setGhostManualModal(null);
        setGhostManualForm({ name: '', balance: '', interestRate: '', monthlyPayment: '', notes: '' });
    }, [ghostManualModal, ghostManualForm]);

    const editDebt = useCallback((debt) => {
        setDebtForm({ name: debt.name, amount: String(debt.amount), monthlyPayment: String(debt.monthlyPayment || ''), minimumPayment: String(debt.minimumPayment || ''), interestRate: String(debt.interestRate || ''), type: debt.type || 'debt', debtCategory: debt.debtCategory || 'credit_card', monthsRemaining: String(debt.monthsRemaining || ''), priority: debt.priority || 'medium', lender: debt.lender || '', notes: debt.notes || '' });
        setEditingDebtId(debt.id);
    }, []);

    const removeDebt = useCallback((id) => {
        setShowConfirm({ message: 'Delete this debt?', onConfirm: () => { setDebts(prev => prev.filter(d => d.id !== id)); setShowConfirm(null); } });
    }, []);

    // ── REASSIGN CATEGORY (with merchant learning) ──
    const reassignCategory = useCallback((txId, newCat) => {
        setTransactions(prev => prev.map(t => {
            if (t.id !== txId) return t;
            const key = normalizeForOverride(t.description);
            if (key) setMerchantOverrides(ov => ({ ...ov, [key]: newCat }));
            return { ...t, category: newCat };
        }));
    }, []);

    const removeTransaction = useCallback((txId) => {
        setShowConfirm({ message: 'Delete this transaction?', onConfirm: () => { setTransactions(prev => prev.filter(t => t.id !== txId)); setShowConfirm(null); } });
    }, []);

    // ── SAVINGS GOALS ──
    const addGoal = useCallback(() => {
        if (!goalForm.name || !goalForm.target) return;
        const entry = { ...goalForm, id: editingGoalId || `goal-${Date.now()}`, target: Number(goalForm.target), current: Number(goalForm.current) || 0 };
        if (editingGoalId) {
            setSavingsGoals(prev => prev.map(g => g.id === editingGoalId ? entry : g));
            setEditingGoalId(null);
        } else {
            setSavingsGoals(prev => [...prev, entry]);
        }
        setGoalForm({ name: '', target: '', current: '', deadline: '', icon: '🎯' });
        setShowGoalForm(false);
    }, [goalForm, editingGoalId]);

    const removeGoal = useCallback((id) => {
        setShowConfirm({ message: 'Delete this savings goal?', onConfirm: () => { setSavingsGoals(prev => prev.filter(g => g.id !== id)); setShowConfirm(null); } });
    }, []);

    const editGoal = useCallback((goal) => {
        setGoalForm({ name: goal.name, target: String(goal.target), current: String(goal.current || ''), deadline: goal.deadline || '', icon: goal.icon || '🎯' });
        setEditingGoalId(goal.id);
        setShowGoalForm(true);
    }, []);

    const updateGoalProgress = useCallback((goalId, newCurrent) => {
        setSavingsGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: Math.max(0, Number(newCurrent) || 0) } : g));
    }, []);

    const addNwAsset = useCallback(() => {
        if (!nwAssetForm.name || !nwAssetForm.value) return;
        setNwAssets(prev => [...prev, { id: `asset-${Date.now()}`, ...nwAssetForm, value: Number(nwAssetForm.value) }]);
        setNwAssetForm({ name: '', value: '', type: 'cash' });
    }, [nwAssetForm]);

    const removeNwAsset = useCallback((id) => {
        setNwAssets(prev => prev.filter(a => a.id !== id));
    }, []);

    const saveNote = useCallback((txId, note) => {
        setTxNotes(prev => {
            if (!note.trim()) { const n = { ...prev }; delete n[txId]; return n; }
            return { ...prev, [txId]: note.trim() };
        });
    }, []);

    const clearAllData = useCallback(() => {
        setShowConfirm({
            message: 'Clear ALL data? This cannot be undone.', onConfirm: () => {
                setTransactions([]); setAccounts([]); setDebts([]); setStartingBalance(0); setChatMessages([]);
                setAdvisorReportGenerated(false); setIsDemoMode(false); clearLS(); setShowConfirm(null);
            }
        });
    }, []);

    const customTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="border rounded-lg p-3 shadow-2xl" style={{ background: '#0d0e17', borderColor: 'rgba(255,255,255,0.065)' }}>
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-sm font-mono" style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
                ))}
            </div>
        );
    };

    /* ═══════════════════════════════════════
       RENDER — DASHBOARD TAB
       ═══════════════════════════════════════ */
    const renderDashboard = () => (
        <div className="space-y-5 animate-fade-in">
            {transactions.length === 0 ? (
                <div className="space-y-4 animate-fade-in">
                    {/* Hero welcome */}
                    <div className="glass-card p-10 text-center relative overflow-hidden">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: '#0ecb81' }}>
                                <TrendingUp size={24} className="text-black" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">You're taking the first step.</h2>
                            <p className="text-slate-400 mb-2 max-w-lg mx-auto leading-relaxed">Financial clarity is the foundation of recovery. This app turns your bank statements into a clear picture — and a clear plan.</p>
                            <p className="text-slate-600 text-sm mb-7 max-w-md mx-auto">No judgment. No jargon. Just your numbers, analyzed honestly.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button onClick={() => setActiveTab('transactions')} className="btn-primary px-7 py-3">
                                    Import My Bank Statements <ChevronRight size={16} className="inline ml-1" />
                                </button>
                                <button onClick={loadDemoData} className="px-7 py-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 hover:text-white rounded-xl font-medium transition-all hover:scale-105">
                                    🧪 Try with Demo Data
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* 3-step guide */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { step: '1', icon: '📥', title: 'Import your statements', desc: 'Export a CSV from your bank website and drop it in. Works with TD, RBC, Scotiabank, BMO, CIBC, and most others.', action: 'Import Now', tab: 'transactions', color: 'emerald' },
                            { step: '2', icon: '💳', title: 'Add your debts', desc: 'Enter credit cards, loans, and mortgage balances. The app will build a personalized payoff strategy with exact timelines.', action: 'Add Debts', tab: 'debts', color: 'amber' },
                            { step: '3', icon: '🤖', title: 'Get your action plan', desc: 'Your AI advisor analyzes everything and tells you exactly what to do first — with specific dollar amounts and timelines.', action: 'View Advisor', tab: 'advisor', color: 'violet' },
                        ].map(s => (
                            <div key={s.step} className="glass-card p-5 flex flex-col">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-7 h-7 rounded-full bg-${s.color}-500/20 border border-${s.color}-500/30 flex items-center justify-center shrink-0`}>
                                        <span className={`text-xs font-bold text-${s.color}-400`}>{s.step}</span>
                                    </div>
                                    <span className="text-xl">{s.icon}</span>
                                    <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed flex-1">{s.desc}</p>
                                <button onClick={() => setActiveTab(s.tab)} className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                                    {s.action} <ChevronRight size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* ── 1. PERIOD FILTER ── */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar size={12} className="text-emerald-400" />
                            <span className="text-slate-400 font-medium">{dashboardPeriod === 'all' ? dataRange.label : dashboardRange.label}</span>
                            <span className="text-slate-700">·</span>
                            <span className="text-slate-500">{dashboardTx.length} transactions</span>
                            {transferTxIds.size > 0 && <span className="text-sky-600">· {Math.floor(transferTxIds.size / 2)} transfers excluded</span>}
                        </div>
                        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(56,191,255,0.04)', border: '1px solid rgba(56,191,255,0.1)' }}>
                            {[
                                { key: 'all', label: 'All Time' },
                                { key: 'last6', label: '6 Mo' },
                                { key: 'last3', label: '3 Mo' },
                                ...availableMonths.slice(-6).reverse().map(m => ({
                                    key: m,
                                    label: new Date(m + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                                }))
                            ].map(p => (
                                <button key={p.key} onClick={() => setDashboardPeriod(p.key)}
                                    className="text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all"
                                    style={dashboardPeriod === p.key
                                        ? { background: 'rgba(56,191,255,0.15)', color: '#38BFFF', boxShadow: '0 0 12px rgba(56,191,255,0.2)' }
                                        : { color: 'var(--text-faint)' }}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── 2. STAT CARDS ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        {[
                            { label: 'Net Worth',        value: netWorth.net,            icon: PiggyBank,    sub: netWorth.assets > 0 ? `${fmt(netWorth.assets)} assets` : 'Set account balances', themeColor: '#A78BFA', glowColor: 'rgba(167,139,250,0.35)', numClass: 'num-neutral', span2: true },
                            { label: 'Net Cash Flow',    value: summary.monthlyNet,      icon: Wallet,       sub: summary.monthlyNet >= 0 ? 'monthly surplus' : 'monthly deficit', themeColor: '#38BFFF', glowColor: 'rgba(56,191,255,0.35)', numClass: 'num-neutral', deltaKey: 'net', deltaGoodDir: 1 },
                            { label: 'Monthly Income',   value: summary.monthlyIncome,   icon: TrendingUp,   sub: `${fmt(summary.income)} total`, themeColor: '#10F0A0', glowColor: 'rgba(16,240,160,0.4)', numClass: 'num-income', deltaKey: 'income', deltaGoodDir: 1 },
                            { label: 'Monthly Spending', value: summary.monthlySpending, icon: TrendingDown, sub: `${fmt(summary.spending)} total`, themeColor: '#FF5C7A', glowColor: 'rgba(255,92,122,0.4)', numClass: 'num-expense', negative: true, deltaKey: 'spending', deltaGoodDir: -1 },
                            { label: 'Total Debt',       value: totalDebtBalance,        icon: CreditCard,   sub: `${debts.length} active debt${debts.length !== 1 ? 's' : ''}`, themeColor: '#FBBF24', glowColor: 'rgba(251,191,36,0.35)', numClass: '', negative: true },
                        ].map((card, i) => {
                            const d = card.deltaKey && statDeltas ? statDeltas[card.deltaKey] : null;
                            const isGood = d ? (d.delta * (card.deltaGoodDir || 1)) > 0 : null;
                            return (
                            <div key={i} className={`glass-card stat-card p-5 card-lift animate-slide-up stagger-${i+1} ${card.span2 ? 'col-span-2 lg:col-span-1' : ''}`}
                                style={{ borderTop: `1px solid ${card.themeColor}45`, boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 40px ${card.glowColor.replace('0.', '0.0')}, 0 1px 0 rgba(255,255,255,0.04) inset` }}>
                                <div className="flex items-start justify-between mb-5">
                                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${card.themeColor}80` }}>{card.label}</span>
                                    <div className="flex items-center gap-1.5">
                                        {d && Math.abs(d.pct) > 0.5 && (
                                            <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', padding: '2px 6px', borderRadius: 4, fontWeight: 700, color: isGood ? '#10F0A0' : '#FF5C7A', background: isGood ? 'rgba(16,240,160,0.1)' : 'rgba(255,92,122,0.1)', border: `1px solid ${isGood ? 'rgba(16,240,160,0.25)' : 'rgba(255,92,122,0.25)'}` }}>
                                                {d.delta > 0 ? '▲' : '▼'} {Math.abs(d.pct).toFixed(0)}%
                                            </span>
                                        )}
                                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${card.themeColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${card.themeColor}25`, boxShadow: `0 0 14px ${card.glowColor}` }}>
                                            <card.icon size={13} style={{ color: card.themeColor }} strokeWidth={2.2} />
                                        </div>
                                    </div>
                                </div>
                                <p className={`stat-value text-[2rem] ${card.numClass}`} style={{ color: card.numClass ? undefined : card.themeColor, textShadow: `0 0 30px ${card.glowColor}` }}>
                                    {card.negative ? '-' : ''}{fmt(Math.abs(card.value))}
                                </p>
                                <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 10, fontWeight: 500, letterSpacing: '0.02em' }}>{card.sub}</p>
                            </div>
                            );
                        })}
                    </div>

                    {/* ── 3. ALERTS ── compact pill chips */}
                    {(anomalies.length > 0 || upcomingBills.length > 0 || runway) && (
                        <div className="flex flex-wrap gap-2">
                            {runway && (
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium ${runway.critical ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                                    <AlertTriangle size={11} className="shrink-0" />
                                    {runway.months === 0
                                        ? 'Cash runway critical — savings depleted'
                                        : `Deficit mode · savings last ~${runway.months}mo`}
                                </div>
                            )}
                            {anomalies.slice(0, 2).map((a, i) => (
                                <div key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium ${a.type === 'high' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                                    <AlertTriangle size={11} className="shrink-0" />
                                    {a.type === 'high' ? '⚠' : '✓'} {a.category} {a.type === 'high' ? `${((a.ratio - 1) * 100).toFixed(0)}% above` : `${((1 - a.ratio) * 100).toFixed(0)}% below`} normal
                                </div>
                            ))}
                            {upcomingBills.slice(0, 3).map((bill, i) => (
                                <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-amber-500/8 border-amber-500/25 text-[11px] font-medium text-amber-300">
                                    <Calendar size={11} className="shrink-0" />
                                    {bill.merchant} <span className="font-mono text-amber-400">{bill.nextDue.slice(5)}</span> · <span className="font-mono text-rose-400">{fmt(bill.avgAmount)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── 3b. WINS STRIP ── */}
                    {wins.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {wins.map((w, i) => (
                                <div key={i} className={`win-card flex items-center gap-2 px-3 py-2 text-xs text-emerald-300 animate-slide-up stagger-${Math.min(i+1,6)}`}>
                                    <span className="text-base leading-none">{w.icon}</span>
                                    <span className="font-medium">{w.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── 3c. ACTION PLAN ── dominant recommendation engine */}
                    {actionPlan.length > 0 && (
                        <div className="action-plan-card animate-slide-up">
                            <div className="action-plan-glow" />
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.25), rgba(96,165,250,0.15))', border: '1px solid rgba(52,211,153,0.35)' }}>
                                    <Target size={15} style={{ color: '#34D399' }} strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-none">Your Action Plan</h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Top priorities right now</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399' }}>
                                    {actionPlan.length} item{actionPlan.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                {actionPlan.map((a, i) => {
                                    const priorityMeta = {
                                        critical: { border: '#FB7185', bg: 'rgba(251,113,133,0.06)', badge: 'rgba(251,113,133,0.15)', badgeText: '#FB7185', label: 'Critical' },
                                        high:     { border: '#F59E0B', bg: 'rgba(245,158,11,0.06)',  badge: 'rgba(245,158,11,0.15)',  badgeText: '#F59E0B', label: 'High' },
                                        medium:   { border: '#60A5FA', bg: 'rgba(96,165,250,0.06)',  badge: 'rgba(96,165,250,0.15)',  badgeText: '#60A5FA', label: 'Medium' },
                                        low:      { border: '#34D399', bg: 'rgba(52,211,153,0.06)',  badge: 'rgba(52,211,153,0.15)',  badgeText: '#34D399', label: 'Low' },
                                    };
                                    const m = priorityMeta[a.priority] || priorityMeta.medium;
                                    return (
                                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl animate-slide-up stagger-${i+1}`}
                                            style={{ background: m.bg, borderLeft: `3px solid ${m.border}`, border: `1px solid ${m.border}25`, borderLeftWidth: 3 }}>
                                            <span className="text-xl leading-none shrink-0">{a.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-semibold text-white leading-none">{a.title}</p>
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0" style={{ background: m.badge, color: m.badgeText }}>{m.label}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
                                            </div>
                                            <button onClick={() => setActiveTab(a.tab)}
                                                className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                                                style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.22)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(52,211,153,0.3)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                {a.action} →
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── 3d. THIS MONTH SO FAR ── */}
                    {thisMonth.spentSoFar > 0 && (
                        <div className="glass-card p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Calendar size={13} className="text-cyan-400" />
                                    This Month So Far
                                    <span className="text-[10px] text-slate-500 font-normal">Day {thisMonth.dayOfMonth} of {thisMonth.daysInMonth} · {thisMonth.pctOfMonth}% through</span>
                                </h3>
                                {thisMonth.vsAvg !== null && (
                                    <span className={`text-xs font-mono ${thisMonth.vsAvg > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        pace: {fmt(thisMonth.pace)}/mo {thisMonth.vsAvg > 0 ? `(${fmt(thisMonth.vsAvg)} above avg)` : `(${fmt(Math.abs(thisMonth.vsAvg))} below avg)`}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-0.5">Earned</p>
                                    <p className="text-base font-bold font-mono text-emerald-400">{fmt(thisMonth.earnedSoFar)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-0.5">Spent</p>
                                    <p className="text-base font-bold font-mono text-rose-400">{fmt(thisMonth.spentSoFar)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 mb-0.5">Net</p>
                                    <p className={`text-base font-bold font-mono ${thisMonth.earnedSoFar - thisMonth.spentSoFar >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>{fmt(thisMonth.earnedSoFar - thisMonth.spentSoFar)}</p>
                                </div>
                            </div>
                            {summary.monthlySpending > 0 && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                        <span>Spending pace</span>
                                        <span>{Math.round((thisMonth.pace / summary.monthlySpending) * 100)}% of avg monthly</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${thisMonth.pace > summary.monthlySpending * 1.1 ? 'bg-rose-500' : thisMonth.pace > summary.monthlySpending * 0.9 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(100, (thisMonth.pace / (summary.monthlySpending * 1.5)) * 100)}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 3e. AI INSIGHTS PANEL ── */}
                    {actionPlan.length > 0 && (
                        <div className="ai-insight-panel px-5 py-4 animate-slide-up">
                            <div className="ai-insight-orb" />
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(96,165,250,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
                                    <Sparkles size={16} style={{ color: '#a78bfa' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa' }}>AI Insight</span>
                                        <span style={{ fontSize: 9, color: 'var(--text-faint)', fontWeight: 500, padding: '1px 6px', background: 'rgba(139,92,246,0.1)', borderRadius: 4, border: '1px solid rgba(139,92,246,0.15)' }}>TOP PRIORITY</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
                                        {actionPlan[0]?.action}
                                    </p>
                                    {actionPlan[0]?.detail && (
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{actionPlan[0].detail}</p>
                                    )}
                                </div>
                                {actionPlan.length > 1 && (
                                    <div className="hidden lg:flex flex-col gap-2 shrink-0" style={{ minWidth: 200 }}>
                                        {actionPlan.slice(1).map((a, i) => (
                                            <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                <span style={{ color: 'rgba(139,92,246,0.6)', fontWeight: 700, flexShrink: 0 }}>#{i+2}</span>
                                                <span style={{ lineHeight: 1.4 }}>{a.action}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── 4. INCOME vs EXPENSES — Gradient Area Chart ── */}
                    {incomeExpenseTrend.length > 1 && (
                        <div className="chart-container p-6">
                            {/* Floating particles */}
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="chart-particle" style={{
                                    left: `${10 + i * 15}%`,
                                    bottom: `${15 + (i % 3) * 12}%`,
                                    animationDuration: `${4 + i * 0.8}s`,
                                    animationDelay: `${i * 0.6}s`,
                                    background: i % 3 === 0 ? 'var(--income)' : i % 3 === 1 ? 'var(--expense)' : 'var(--net)',
                                    width: i % 2 === 0 ? 3 : 2,
                                    height: i % 2 === 0 ? 3 : 2,
                                }} />
                            ))}
                            <div className="flex items-start justify-between mb-5 relative">
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                        Income vs Expenses
                                    </h3>
                                    <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>Monthly trend · blue line = net cash flow</p>
                                </div>
                                <div className="flex items-center gap-4" style={{ fontSize: 11 }}>
                                    <span className="flex items-center gap-1.5">
                                        <span style={{ width: 20, height: 2, background: 'linear-gradient(90deg,#34D399,#60A5FA)', display: 'inline-block', borderRadius: 2, boxShadow: '0 0 6px rgba(52,211,153,0.5)' }} />
                                        <span style={{ color: 'var(--text-muted)' }}>Income</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span style={{ width: 20, height: 2, background: 'linear-gradient(90deg,#FB7185,#F59E0B)', display: 'inline-block', borderRadius: 2, boxShadow: '0 0 6px rgba(251,113,133,0.5)' }} />
                                        <span style={{ color: 'var(--text-muted)' }}>Expenses</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span style={{ width: 20, height: 2, background: 'linear-gradient(90deg,#8B5CF6,#60A5FA)', display: 'inline-block', borderRadius: 2, boxShadow: '0 0 6px rgba(139,92,246,0.5)' }} />
                                        <span style={{ color: 'var(--text-muted)' }}>Net</span>
                                    </span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={incomeExpenseTrend} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#10F0A0" />
                                            <stop offset="100%" stopColor="#38BFFF" />
                                        </linearGradient>
                                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#FF5C7A" />
                                            <stop offset="100%" stopColor="#FBBF24" />
                                        </linearGradient>
                                        <linearGradient id="netGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#A78BFA" />
                                            <stop offset="100%" stopColor="#38BFFF" />
                                        </linearGradient>
                                        <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10F0A0" stopOpacity={0.28} />
                                            <stop offset="100%" stopColor="#10F0A0" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FF5C7A" stopOpacity={0.22} />
                                            <stop offset="100%" stopColor="#FF5C7A" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.18} />
                                            <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                                        </linearGradient>
                                        <filter id="glowIncome"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                                        <filter id="glowExpense"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="label" stroke="transparent" tick={{ fill: '#4B5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="transparent" tick={{ fill: '#4B5563', fontSize: 10 }} tickFormatter={v => fmtShort(v)} width={48} axisLine={false} tickLine={false} />
                                    <Tooltip content={customTooltip} />
                                    <Area
                                        type="monotone" dataKey="income" name="Income"
                                        stroke="url(#incomeGrad)" strokeWidth={2.5}
                                        fill="url(#incomeFill)"
                                        dot={false}
                                        activeDot={{ r: 5, fill: '#10F0A0', stroke: '#030810', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(16,240,160,0.9))' }}
                                        isAnimationActive={true} animationDuration={1200} animationEasing="ease-out"
                                        style={{ filter: 'drop-shadow(0 0 5px rgba(16,240,160,0.5))' }}
                                    />
                                    <Area
                                        type="monotone" dataKey="expenses" name="Expenses"
                                        stroke="url(#expenseGrad)" strokeWidth={2.5}
                                        fill="url(#expenseFill)"
                                        dot={false}
                                        activeDot={{ r: 5, fill: '#FF5C7A', stroke: '#030810', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(255,92,122,0.9))' }}
                                        isAnimationActive={true} animationDuration={1400} animationEasing="ease-out"
                                        style={{ filter: 'drop-shadow(0 0 5px rgba(255,92,122,0.45))' }}
                                    />
                                    <Area
                                        type="monotone" dataKey="net" name="Net"
                                        stroke="url(#netGrad)" strokeWidth={2}
                                        fill="url(#netFill)"
                                        dot={false}
                                        activeDot={{ r: 4, fill: '#A78BFA', stroke: '#030810', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.9))' }}
                                        isAnimationActive={true} animationDuration={1600} animationEasing="ease-out"
                                        style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.4))' }}
                                        strokeDasharray="0"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* ── 5. SPENDING BREAKDOWN + HEALTH ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* Spending pie + category list */}
                        <div className="glass-card p-6 lg:col-span-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-white">Spending by Category</h3>
                                {selectedCategory && (
                                    <button onClick={() => setSelectedCategory(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-white/10 px-2 py-1 rounded-lg transition-all">
                                        <X size={11} /> {selectedCategory}
                                    </button>
                                )}
                            </div>
                            {categoryData.length > 0 ? (
                                <>
                                <div className="flex gap-4">
                                    <div className="shrink-0">
                                        <ResponsiveContainer width={160} height={160}>
                                            <PieChart>
                                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={76} paddingAngle={2} dataKey="value"
                                                    onClick={(data) => setSelectedCategory(prev => prev === data.name ? null : data.name)}
                                                    style={{ cursor: 'pointer' }}>
                                                    {categoryData.map((c, i) => <Cell key={i} fill={c.color} opacity={!selectedCategory || selectedCategory === c.name ? 1 : 0.3} />)}
                                                </Pie>
                                                <Tooltip formatter={(v) => fmt(v)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <p className="text-[9px] text-slate-600 text-center mt-1">Click a slice to drill in</p>
                                    </div>
                                    <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[170px] pr-1">
                                        {categoryData.map((c, i) => (
                                            <div key={i} onClick={() => setSelectedCategory(prev => prev === c.name ? null : c.name)}
                                                className={`flex items-center gap-2 text-xs cursor-pointer rounded-lg px-1 py-0.5 transition-all ${selectedCategory === c.name ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]'}`}>
                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                                                <span className="text-slate-300 truncate flex-1">{c.name}</span>
                                                {categoryTrends[c.name] === 'rising'  && <span className="text-rose-400 text-[10px]">▲</span>}
                                                {categoryTrends[c.name] === 'falling' && <span className="text-emerald-400 text-[10px]">▼</span>}
                                                <span className="font-mono text-slate-400 w-8 text-right">{c.pct.toFixed(0)}%</span>
                                                <span className="font-mono text-white w-16 text-right">{fmt(c.monthly)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Category drilldown transactions */}
                                {selectedCategory && (() => {
                                    const catTxs = dashboardTx
                                        .filter(t => t.category === selectedCategory && t.amount < 0 && !transferTxIds.has(t.id))
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .slice(0, 20);
                                    const catColor = CATEGORIES.find(c => c.name === selectedCategory)?.color || '#94a3b8';
                                    return (
                                        <div className="mt-4 pt-4 border-t border-white/[0.06] animate-fade-in">
                                            <p className="text-xs font-medium mb-2" style={{ color: catColor }}>
                                                {selectedCategory} — {catTxs.length} transactions · {fmt(catTxs.reduce((s,t) => s + Math.abs(t.amount), 0))} total
                                            </p>
                                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                                {catTxs.map((t, i) => (
                                                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                                                        <span className="text-slate-500 w-20 shrink-0">{t.date}</span>
                                                        <span className="text-slate-300 truncate flex-1 mx-2">{t.description.substring(0, 36)}</span>
                                                        <span className="font-mono text-rose-400 shrink-0">{fmt(Math.abs(t.amount))}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                                </>
                            ) : <p className="text-slate-500 text-sm">No spending data for this period</p>}
                        </div>

                        {/* Health score + quick insights */}
                        <div className="lg:col-span-2 space-y-3">
                            {healthScore && (
                                <div className="glass-card p-6 health-score-card">
                                    <div className="flex flex-col items-center mb-5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Financial Health</p>
                                        {/* Full-circle SVG ring */}
                                        <div className="relative" style={{ width: 130, height: 130 }}>
                                            <svg viewBox="0 0 130 130" width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                                                <defs>
                                                    <linearGradient id="healthRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor={healthScore.color} stopOpacity="0.7" />
                                                        <stop offset="100%" stopColor={healthScore.color} />
                                                    </linearGradient>
                                                    <filter id="healthGlow">
                                                        <feGaussianBlur stdDeviation="4" result="blur"/>
                                                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                                    </filter>
                                                </defs>
                                                {/* Track */}
                                                <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                                {/* Progress */}
                                                <circle cx="65" cy="65" r="52" fill="none"
                                                    stroke={`url(#healthRingGrad)`} strokeWidth="10"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${(healthScore.score / 100) * 326.7} 326.7`}
                                                    filter="url(#healthGlow)"
                                                    style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-bold leading-none" style={{ color: healthScore.color, textShadow: `0 0 24px ${healthScore.color}80` }}>{healthScore.score}</span>
                                                <span className="text-[10px] text-slate-500 mt-1 font-medium">/ 100</span>
                                            </div>
                                        </div>
                                        <span className="text-base font-bold mt-3" style={{ color: healthScore.color }}>{healthScore.label}</span>
                                    </div>
                                    {healthScore.factors && healthScore.factors.length > 0 && (
                                        <div className="space-y-2.5 border-t border-white/[0.05] pt-4">
                                            {healthScore.factors.map((f, i) => {
                                                const statusColor = f.status === 'great' ? '#0ecb81' : f.status === 'good' ? '#3b82f6' : f.status === 'fair' ? '#f59e0b' : '#ef4444';
                                                const barPct = f.status === 'great' ? 100 : f.status === 'good' ? 72 : f.status === 'fair' ? 46 : 22;
                                                return (
                                                    <div key={i} className="flex items-center gap-2.5">
                                                        <span className="text-[10px] text-slate-400 w-20 shrink-0 truncate font-medium">{f.name}</span>
                                                        <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, background: `linear-gradient(90deg, ${statusColor}99, ${statusColor})`, boxShadow: `0 0 6px ${statusColor}60` }} />
                                                        </div>
                                                        <span className="text-[10px] font-mono w-16 text-right shrink-0" style={{ color: statusColor }}>{f.value}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                            {insights && (
                                <div className="glass-card p-5 space-y-3">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Insights</h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Daily avg spend</span>
                                            <span className="font-mono text-white">{fmt(insights.dailyAvg)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Largest expense</span>
                                            <span className="font-mono text-rose-400">{fmt(Math.abs(insights.largest.amount))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Top merchant</span>
                                            <span className="text-slate-200 truncate max-w-[100px] text-right">{insights.topMerchant}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── 6. TOP MERCHANTS + DAY-OF-WEEK ── */}
                    {(topMerchants.length > 0 || weekdaySpending.length > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {topMerchants.length > 0 && (
                                <div className="glass-card p-6 lg:col-span-2">
                                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><ShoppingBag size={15} className="text-cyan-400" /> Top Merchants</h3>
                                    <div className="space-y-2.5">
                                        {topMerchants.slice(0, 8).map((m, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-[10px] text-slate-600 w-4 text-right shrink-0">{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-slate-200 truncate">{m.name}</span>
                                                        <span className="text-[10px] text-slate-500 ml-2 shrink-0">{m.count}×</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${(m.total / topMerchants[0].total) * 100}%` }} />
                                                        </div>
                                                        <span className="font-mono text-[10px] text-slate-400 w-14 text-right">{fmt(m.monthly)}/mo</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="glass-card p-6">
                                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><Calendar size={15} className="text-amber-400" /> Spending by Day</h3>
                                <div className="space-y-2">
                                    {weekdaySpending.map((d, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 w-7 font-medium shrink-0">{d.day}</span>
                                            <div className="flex-1 h-3 bg-slate-700/40 rounded overflow-hidden">
                                                <div className={`h-full rounded transition-all ${d.pct > 0.8 ? 'bg-rose-500' : d.pct > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${d.pct * 100}%` }} />
                                            </div>
                                            <span className="font-mono text-[10px] text-slate-400 w-14 text-right">{fmt(d.avg)}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-600 mt-3">Avg spend per day of week</p>
                            </div>
                        </div>
                    )}

                    {/* ── 7. RECURRING BILLS + SUBSCRIPTIONS ── */}
                    {(recurringPayments.length > 0 || subscriptionAudit.length > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {recurringPayments.length > 0 && (
                                <div className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2"><Repeat size={15} className="text-violet-400" /> Recurring Bills</h3>
                                        <span className="text-xs text-slate-500 font-mono">{fmt(recurringPayments.filter(r => r.frequency === 'Monthly').reduce((s, r) => s + r.avgAmount, 0))}/mo</span>
                                    </div>
                                    <div className="space-y-2">
                                        {recurringPayments.slice(0, 8).map((rp, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${rp.type === 'Subscription' ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300'}`}>{rp.type === 'Subscription' ? 'Sub' : 'Bill'}</span>
                                                    <span className="text-sm text-slate-200 truncate">{rp.merchant}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                                    <span className="text-[10px] text-cyan-400 font-mono">{rp.nextDue}</span>
                                                    <span className="font-mono text-sm text-rose-400">{fmt(rp.avgAmount)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {subscriptionAudit.length > 0 && (
                                <div className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2"><Tv size={15} className="text-violet-400" /> Subscription Audit</h3>
                                        <div className="text-right">
                                            <p className="text-xs font-mono text-rose-400">{fmt(subscriptionAudit.reduce((s, sub) => s + sub.avgAmount, 0))}/mo</p>
                                            <p className="text-[10px] text-slate-500">{fmt(subscriptionAudit.reduce((s, sub) => s + sub.avgAmount * 12, 0))}/yr</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {subscriptionAudit.map((sub, i) => (
                                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                                                <div>
                                                    <p className="text-sm text-slate-200">{sub.merchant}</p>
                                                    <p className="text-[10px] text-slate-500">{sub.frequency} · {sub.occurrences} payments</p>
                                                </div>
                                                <span className="font-mono text-sm text-rose-400 ml-3">{fmt(sub.avgAmount)}/mo</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 8. BUDGET TRACKER ── */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-white flex items-center gap-2"><Target size={15} className="text-amber-400" /> Budget Tracker</h3>
                                <p className="text-xs text-slate-500">Current month spending vs your targets</p>
                            </div>
                            <button onClick={() => setShowBudgetEditor(e => !e)}
                                className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                                {showBudgetEditor ? 'Done' : 'Edit Budgets'}
                            </button>
                        </div>
                        {showBudgetEditor && (
                            <div className="mb-5 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                <p className="text-xs text-slate-500 mb-3">Set monthly targets — leave blank to use auto-suggested amounts from your history.</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {CATEGORIES.filter(c => !['Income', 'Transfers'].includes(c.name)).map(cat => (
                                        <div key={cat.name} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                                            <cat.icon size={11} style={{ color: cat.color }} className="shrink-0" />
                                            <span className="text-[10px] text-slate-400 truncate flex-1">{cat.name}</span>
                                            <input type="number" placeholder="auto"
                                                value={categoryBudgets[cat.name] ?? ''}
                                                onChange={e => setCategoryBudgets(prev => ({ ...prev, [cat.name]: e.target.value }))}
                                                className="w-14 bg-transparent text-[10px] text-right text-white border-b border-white/10 focus:border-emerald-500 outline-none font-mono" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {(budgetProgress.length > 0 || autoBudgets.length > 0) ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {(budgetProgress.length > 0 ? budgetProgress.map(b => ({ cat: b.cat, spent: b.spent, budget: b.budget, pct: b.pct })) : autoBudgets.map(b => ({ cat: b.category, spent: b.actual, budget: b.budget, pct: b.pct }))).map((b, i) => {
                                    const over = b.pct > 100, warn = b.pct > 80;
                                    return (
                                        <div key={i} className={`p-3 rounded-xl border ${over ? 'bg-rose-500/5 border-rose-500/20' : warn ? 'bg-amber-500/5 border-amber-500/15' : 'bg-white/[0.015] border-white/5'}`}>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-slate-300 font-medium truncate">{b.cat}</span>
                                                <span className={`font-mono ml-2 shrink-0 ${over ? 'text-rose-400' : warn ? 'text-amber-400' : 'text-slate-500'}`}>{fmt(b.spent)}<span className="text-slate-600">/{fmt(b.budget)}</span></span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, b.pct)}%` }} />
                                            </div>
                                            <p className={`text-[10px] mt-1 ${over ? 'text-rose-400' : warn ? 'text-amber-400' : 'text-slate-600'}`}>
                                                {over ? `${fmt(b.spent - b.budget)} over` : `${fmt(b.budget - b.spent)} left`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-6">Click "Edit Budgets" to set monthly targets per category.</p>
                        )}
                    </div>

                    {/* ── 9. CASH FLOW CALENDAR — hidden for now ── */}
                    {false && (
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-white flex items-center gap-2"><Calendar size={15} className="text-violet-400" /> Cash Flow Calendar</h3>
                            <div className="flex items-center gap-1">
                                <button onClick={() => { const [y,m] = calendarMonth.split('-').map(Number); const d = new Date(y,m-2,1); setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); setCalendarDayPopover(null); }}
                                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><ChevronLeft size={14} /></button>
                                <span className="text-sm text-slate-300 w-32 text-center">{new Date(calendarMonth + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                <button onClick={() => { const [y,m] = calendarMonth.split('-').map(Number); const d = new Date(y,m,1); setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); setCalendarDayPopover(null); }}
                                    className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><ChevronRight size={14} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-[10px] text-slate-600 text-center font-medium py-1">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: calendarData.firstDay }).map((_, i) => <div key={`e${i}`} />)}
                            {Array.from({ length: calendarData.daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const data = calendarData.days[day];
                                const bills = calendarData.billDays[day] || [];
                                const net = data ? data.income - data.expenses : 0;
                                const today = new Date();
                                const isToday = today.getFullYear() === calendarData.year && today.getMonth() + 1 === calendarData.month && today.getDate() === day;
                                const isSelected = calendarDayPopover?.day === day;
                                const hasActivity = data || bills.length > 0;
                                return (
                                    <div key={day}
                                        onClick={() => {
                                            if (!hasActivity) return;
                                            setCalendarDayPopover(prev => prev?.day === day ? null : { day, txns: data?.txns || [], income: data?.income || 0, expenses: data?.expenses || 0, bills });
                                        }}
                                        className={`relative min-h-[50px] rounded-lg p-1.5 border text-center transition-all
                                            ${hasActivity ? 'cursor-pointer hover:border-white/20 hover:brightness-125' : ''}
                                            ${isSelected ? 'ring-1 ring-cyan-500/50 border-cyan-500/30' : isToday ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-white/[0.04]'}
                                            ${data ? (net >= 0 ? 'bg-emerald-500/[0.06]' : 'bg-rose-500/[0.06]') : 'bg-white/[0.01]'}`}>
                                        <span className={`text-[11px] font-semibold ${isToday ? 'text-emerald-400' : 'text-slate-500'}`}>{day}</span>
                                        {data && <p className={`text-[9px] font-mono mt-0.5 ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{net >= 0 ? '+' : ''}{fmtShort(Math.abs(net))}</p>}
                                        {bills.length > 0 && (
                                            <div className="flex justify-center gap-0.5 mt-1">
                                                {bills.slice(0,3).map((b, bi) => <div key={bi} className="w-1.5 h-1.5 rounded-full bg-amber-400" />)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Day popover */}
                        {calendarDayPopover && (
                            <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl animate-fade-in">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-white">{new Date(calendarMonth + '-02').toLocaleDateString('en-US', { month: 'long' })} {calendarDayPopover.day}</p>
                                    <div className="flex items-center gap-3 text-xs">
                                        {calendarDayPopover.income > 0 && <span className="text-emerald-400 font-mono">+{fmt(calendarDayPopover.income)}</span>}
                                        {calendarDayPopover.expenses > 0 && <span className="text-rose-400 font-mono">-{fmt(calendarDayPopover.expenses)}</span>}
                                        <button onClick={() => setCalendarDayPopover(null)} className="text-slate-500 hover:text-white ml-1"><X size={13} /></button>
                                    </div>
                                </div>
                                {calendarDayPopover.bills.length > 0 && (
                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                        {calendarDayPopover.bills.map((b, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full">{b.merchant} {fmt(b.avgAmount)} due</span>
                                        ))}
                                    </div>
                                )}
                                {calendarDayPopover.txns.length > 0 ? (
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                        {calendarDayPopover.txns.map((t, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                                                <span className="text-slate-300 truncate flex-1">{t.description.substring(0, 32)}</span>
                                                <span className={`font-mono ml-3 shrink-0 ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(t.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic">Bill due — no transactions recorded yet</p>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-5 mt-3 text-[10px] text-slate-600">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/20" /> Positive day</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500/20" /> Negative day</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Bill due</span>
                        </div>
                    </div>
                    )}

                    {/* ── 10. BALANCE TREND ── */}
                    {balanceTrend.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-base font-semibold text-white mb-1">Running Balance</h3>
                            <p className="text-xs text-slate-500 mb-4">Cumulative balance across all transactions over time</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={balanceTrend}>
                                    <defs>
                                        <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#0ecb81" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
                                    <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={fmtShort} width={48} />
                                    <Tooltip content={customTooltip} />
                                    <Area type="monotone" dataKey="balance" stroke="#0ecb81" fill="url(#balGrad)" strokeWidth={2} name="Balance" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                </>
            )}
        </div>
    );

    /* ═══════════════════════════════════════
       RENDER — TRANSACTIONS TAB
       ═══════════════════════════════════════ */

    // Navigate into an account detail view; 'all' for combined view
    const openAccountDetail = useCallback((accountId) => {
        setExpandedAccountId(accountId);
        setTxAccountFilter(accountId === 'all' ? 'All' : accountId);
        setTxSearch(''); setTxCatFilter('All'); setTxDateFrom(''); setTxDateTo(''); setTxPage(0);
    }, []);

    const closeAccountDetail = useCallback(() => {
        setExpandedAccountId(null);
        setTxAccountFilter('All');
        setTxSearch(''); setTxCatFilter('All'); setTxDateFrom(''); setTxDateTo(''); setTxPage(0);
    }, []);

    const renderTransactions = () => {

        /* ── DETAIL VIEW ── */
        if (expandedAccountId) {
            const isAll = expandedAccountId === 'all';
            const acc = isAll ? null : accounts.find(a => a.id === expandedAccountId);
            const cfg = acc ? (ACCOUNT_TYPES[acc.accountType] || ACCOUNT_TYPES.chequing) : null;
            const scopeTxs = isAll ? transactions : transactions.filter(t => t.accountId === expandedAccountId);
            const ytdIncome = scopeTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
            const ytdExpenses = scopeTxs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
            const ytdNet = ytdIncome - ytdExpenses;
            const datesSorted = [...scopeTxs].sort((a, b) => a.date.localeCompare(b.date));
            const dateRangeStr = scopeTxs.length > 0 ? `${datesSorted[0].date} → ${datesSorted[datesSorted.length - 1].date}` : 'No data';
            // Category breakdown for this account
            const catMap = {};
            scopeTxs.filter(t => t.amount < 0).forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount); });
            const catBreakdown = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, total]) => {
                const catDef = CATEGORIES.find(c => c.name === name);
                return { name, total, color: catDef?.color || '#94a3b8', pct: ytdExpenses > 0 ? (total / ytdExpenses * 100) : 0 };
            });
            const typeIcons = { chequing: '🏦', savings: '💰', credit: '💳', investment: '📈' };

            return (
                <div className="space-y-5 animate-fade-in">
                    {/* Back + Header */}
                    <div className="flex items-center gap-3">
                        <button onClick={closeAccountDetail}
                            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl">{isAll ? '📂' : (typeIcons[acc?.accountType] || '🏦')}</span>
                            <div className="min-w-0">
                                {acc ? (
                                    <input value={acc.accountName}
                                        onChange={e => updateAccount(acc.id, { accountName: e.target.value })}
                                        className="bg-transparent text-base font-semibold text-white border-b border-transparent hover:border-white/20 focus:border-emerald-500 outline-none transition-colors"
                                    />
                                ) : (
                                    <h2 className="text-base font-semibold text-white">All Accounts</h2>
                                )}
                                <p className="text-xs text-slate-500 mt-0.5">{dateRangeStr} · {scopeTxs.length} transactions</p>
                            </div>
                            {cfg && (
                                <select value={acc.accountType}
                                    onChange={e => updateAccount(acc.id, { accountType: e.target.value })}
                                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium cursor-pointer bg-transparent ${cfg.badge}`}>
                                    {Object.entries(ACCOUNT_TYPES).map(([k, v]) => <option key={k} value={k} className="bg-[#0c0e18] text-white">{v.label}</option>)}
                                </select>
                            )}
                        </div>
                        {acc && (
                            <button onClick={() => { closeAccountDetail(); removeAccount(acc.id); }}
                                className="text-slate-600 hover:text-rose-400 transition-colors ml-auto"><Trash2 size={14} /></button>
                        )}
                    </div>

                    {/* YTD Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'YTD Income', value: fmt(ytdIncome), color: 'text-emerald-400', sub: `${scopeTxs.filter(t => t.amount > 0).length} deposits` },
                            { label: 'YTD Expenses', value: fmt(ytdExpenses), color: 'text-rose-400', sub: `${scopeTxs.filter(t => t.amount < 0).length} transactions` },
                            { label: 'YTD Net', value: fmt(ytdNet), color: ytdNet >= 0 ? 'text-emerald-400' : 'text-rose-400', sub: ytdNet >= 0 ? 'In the black' : 'In the red' },
                            { label: 'Transactions', value: scopeTxs.length, color: 'text-sky-400', sub: dateRangeStr },
                        ].map(s => (
                            <div key={s.label} className="glass-card p-4">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                                <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-slate-600 mt-0.5 truncate">{s.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Category Breakdown */}
                    {catBreakdown.length > 0 && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-white mb-4">Spending Breakdown</h3>
                            <div className="space-y-2.5">
                                {catBreakdown.map(c => (
                                    <div key={c.name} className="flex items-center gap-3">
                                        <span className="text-xs text-slate-300 w-28 shrink-0 truncate">{c.name}</span>
                                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
                                        </div>
                                        <span className="text-xs font-mono text-slate-400 w-20 text-right shrink-0">{fmt(c.total)}</span>
                                        <span className="text-[10px] text-slate-600 w-8 text-right shrink-0">{c.pct.toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Balance input for specific account */}
                    {acc && (
                        <div className="flex items-center gap-3 px-4 py-3 glass-card">
                            <span className="text-xs text-slate-500">Current Balance:</span>
                            <input type="number" placeholder="Enter current balance"
                                value={accountBalances[acc.id] ?? ''}
                                onChange={e => setAccountBalances(prev => ({ ...prev, [acc.id]: e.target.value }))}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-right text-emerald-400 focus:border-emerald-500 outline-none font-mono max-w-xs" />
                        </div>
                    )}

                    {/* Duplicate warning */}
                    {dupWarning && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-300">
                            <AlertTriangle size={14} /> {dupWarning}
                            <button onClick={() => setDupWarning(null)} className="ml-auto text-amber-400 hover:text-white"><X size={14} /></button>
                        </div>
                    )}

                    {/* Search + Filter */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input type="text" placeholder="Search description, date, or amount…" value={txSearch}
                                    onChange={e => { setTxSearch(e.target.value); setTxPage(0); }}
                                    className="w-full bg-surface border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500" />
                            </div>
                            {isAll && accounts.length > 1 && (
                                <select value={txAccountFilter} onChange={e => { setTxAccountFilter(e.target.value); setTxPage(0); }}
                                    className="bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 cursor-pointer">
                                    <option value="All">All Accounts</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}
                                </select>
                            )}
                            <select value={txCatFilter} onChange={e => { setTxCatFilter(e.target.value); setTxPage(0); }}
                                className="bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 cursor-pointer">
                                <option value="All">All Categories</option>
                                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <input type="date" value={txDateFrom} onChange={e => { setTxDateFrom(e.target.value); setTxPage(0); }}
                                className="bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300" />
                            <span className="text-slate-500 text-xs">to</span>
                            <input type="date" value={txDateTo} onChange={e => { setTxDateTo(e.target.value); setTxPage(0); }}
                                className="bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{filteredTx.length} results</span>
                            <span>Sum: <span className={`font-mono ${filteredSum >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(filteredSum)}</span></span>
                            {Object.keys(merchantOverrides).length > 0 && (
                                <span className="text-emerald-600">{Object.keys(merchantOverrides).length} category rules learned</span>
                            )}
                            {(txSearch || txCatFilter !== 'All' || txDateFrom || txDateTo || (isAll && txAccountFilter !== 'All')) && (
                                <button onClick={() => { setTxSearch(''); setTxCatFilter('All'); setTxDateFrom(''); setTxDateTo(''); if (isAll) setTxAccountFilter('All'); setTxPage(0); }}
                                    className="text-slate-400 hover:text-white transition-colors">Clear filters</button>
                            )}
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {[{ key: 'date', label: 'Date', align: 'left' }, { key: 'description', label: 'Description', align: 'left' }, { key: 'amount', label: 'Amount', align: 'right' }, { key: 'category', label: 'Category', align: 'left' }].map(col => (
                                            <th key={col.key} className={`text-${col.align} p-4 text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none`}
                                                onClick={() => toggleSort(col.key)}>
                                                {col.label} {txSort.key === col.key && (txSort.dir === 'asc' ? '↑' : '↓')}
                                            </th>
                                        ))}
                                        <th className="p-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedTx.map(t => (
                                        <React.Fragment key={t.id}>
                                        <tr className="table-row border-b border-white/[0.03]">
                                            <td className="p-4 font-mono text-xs text-slate-400">{t.date}</td>
                                            <td className="p-4 text-slate-200 max-w-[280px]">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="truncate">{t.description}</span>
                                                    {transferTxIds.has(t.id) && <span className="text-[10px] px-1.5 py-0.5 bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/20 shrink-0">↔ Transfer</span>}
                                                    {recurringTxKeys.has(t.id) && <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded-full shrink-0">🔁 Recurring</span>}
                                                    {isAll && t.accountId && (() => {
                                                        const txAcc = accounts.find(a => a.id === t.accountId);
                                                        const txCfg = txAcc ? ACCOUNT_TYPES[txAcc.accountType] : null;
                                                        return txAcc ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${txCfg?.badge || ''}`}>{txAcc.accountName}</span> : null;
                                                    })()}
                                                    {txNotes[t.id] && <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full shrink-0 max-w-[120px] truncate" title={txNotes[t.id]}>📝 {txNotes[t.id]}</span>}
                                                </div>
                                            </td>
                                            <td className={`p-4 text-right font-mono font-medium ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(t.amount)}</td>
                                            <td className="p-4">
                                                <select value={t.category} onChange={(e) => reassignCategory(t.id, e.target.value)}
                                                    className="bg-surface border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 cursor-pointer">
                                                    {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setExpandedNoteTxId(v => v === t.id ? null : t.id)}
                                                        className={`transition-colors ${txNotes[t.id] ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                                                        title={txNotes[t.id] ? 'Edit note' : 'Add note'}>
                                                        <MessageCircle size={13} />
                                                    </button>
                                                    <button onClick={() => removeTransaction(t.id)} className="text-slate-500 hover:text-rose-400 transition-colors"><X size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedNoteTxId === t.id && (
                                            <tr className="border-b border-white/[0.03] bg-amber-500/5">
                                                <td colSpan={5} className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-amber-400 shrink-0">📝 Note:</span>
                                                        <input
                                                            autoFocus
                                                            defaultValue={txNotes[t.id] || ''}
                                                            onBlur={e => { saveNote(t.id, e.target.value); setExpandedNoteTxId(null); }}
                                                            onKeyDown={e => { if (e.key === 'Enter') { saveNote(t.id, e.target.value); setExpandedNoteTxId(null); } if (e.key === 'Escape') setExpandedNoteTxId(null); }}
                                                            placeholder="Add a note… (Enter to save, Esc to cancel)"
                                                            className="flex-1 bg-transparent text-xs text-white border-b border-amber-500/30 focus:border-amber-400 outline-none py-1 placeholder-slate-600"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </React.Fragment>
                                    ))}
                                    {pagedTx.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500 text-sm">No transactions match your filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {txPageCount > 1 && (
                            <div className="p-3 flex items-center justify-between border-t border-white/5">
                                <button onClick={() => setTxPage(p => Math.max(0, p - 1))} disabled={txPage === 0}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <span className="text-xs text-slate-500">Page {txPage + 1} of {txPageCount}</span>
                                <button onClick={() => setTxPage(p => Math.min(txPageCount - 1, p + 1))} disabled={txPage >= txPageCount - 1}
                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        /* ── OVERVIEW / CARDS VIEW ── */
        return (
        <div className="space-y-6 animate-fade-in">
            {/* Demo mode banner */}
            {isDemoMode && (
                <div className="flex items-center gap-3 px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-sm">
                    <span className="text-lg">🧪</span>
                    <div className="flex-1">
                        <span className="text-violet-300 font-medium">Demo mode active</span>
                        <span className="text-slate-400 ml-2">— 12 months of synthetic data (Jan–Dec 2025)</span>
                    </div>
                    <button onClick={clearAllData} className="text-xs text-violet-400 hover:text-white border border-violet-500/30 px-3 py-1 rounded-lg transition-colors">Exit Demo</button>
                </div>
            )}

            {/* ── Upload + Quick Actions ── */}
            {/* Hidden input for ghost card targeted uploads */}
            <input ref={ghostFileInputRef} type="file" accept=".csv" multiple className="hidden"
                onChange={(e) => {
                    const files = Array.from(e.target.files || []).filter(f => f.name.toLowerCase().endsWith('.csv'));
                    if (files.length) setPendingUpload({ files, forcedType: ghostUploadType });
                    e.target.value = '';
                }} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`sm:col-span-2 drop-zone p-6 text-center cursor-pointer ${dragActive ? 'active' : ''}`}
                    onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                    onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept=".csv" multiple className="hidden"
                        onChange={(e) => { const files = Array.from(e.target.files || []).filter(f => f.name.toLowerCase().endsWith('.csv')); if (files.length) setPendingUpload({ files }); e.target.value = ''; }} />
                    {csvLoading ? (
                        <Loader2 size={28} className="text-emerald-400 animate-spin mx-auto mb-2" />
                    ) : (
                        <Upload size={28} className="text-slate-400 mx-auto mb-2" />
                    )}
                    <p className="text-white font-medium text-sm">{csvLoading ? 'Parsing...' : 'Drop CSV files or click to upload'}</p>
                    <p className="text-xs text-slate-500 mt-1">TD Bank · Standard CSV · Multiple files at once</p>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={() => setShowManualTxForm(v => !v)}
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 rounded-2xl transition-all cursor-pointer">
                        <Plus size={22} className="text-emerald-400" />
                        <span className="text-sm text-slate-300 font-medium">Manual Entry</span>
                        <span className="text-[10px] text-slate-500">Add a single transaction</span>
                    </button>
                    {transactions.length === 0 && (
                        <button onClick={loadDemoData}
                            className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-violet-500/5 border border-violet-500/20 hover:bg-violet-500/10 rounded-2xl transition-all cursor-pointer">
                            <span className="text-2xl">🧪</span>
                            <span className="text-sm text-violet-300 font-medium">Try Demo Data</span>
                            <span className="text-[10px] text-slate-500">1 year of sample data</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Manual Transaction Form ── */}
            {showManualTxForm && (
                <div className="glass-card p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Plus size={14} className="text-emerald-400" /> Add Manual Transaction</h3>
                        <button onClick={() => setShowManualTxForm(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Date</label>
                            <input type="date" value={manualTxForm.date} onChange={e => setManualTxForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                            <input value={manualTxForm.description} onChange={e => setManualTxForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Coffee shop"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Amount ($)</label>
                            <input type="number" value={manualTxForm.amount} onChange={e => setManualTxForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Type</label>
                            <select value={manualTxForm.type} onChange={e => setManualTxForm(f => ({ ...f, type: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                                <option value="expense" className="bg-[#0c0e18]">Expense (-)</option>
                                <option value="income" className="bg-[#0c0e18]">Income (+)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Category</label>
                            <select value={manualTxForm.category} onChange={e => setManualTxForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                                {CATEGORIES.map(c => <option key={c.name} value={c.name} className="bg-[#0c0e18]">{c.name}</option>)}
                            </select>
                        </div>
                        {accounts.length > 0 && (
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Account</label>
                                <select value={manualTxForm.accountId} onChange={e => setManualTxForm(f => ({ ...f, accountId: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                                    <option value="" className="bg-[#0c0e18]">Auto</option>
                                    {accounts.map(a => <option key={a.id} value={a.id} className="bg-[#0c0e18]">{a.accountName}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={addManualTransaction} className="btn-primary px-5 py-2 text-white text-sm">Add Transaction</button>
                        <button onClick={() => setShowManualTxForm(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-sm transition-all">Cancel</button>
                    </div>
                </div>
            )}

            {/* ── Account Cards (folder-style) ── */}
            {accounts.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Wallet size={13} className="text-emerald-400" /> Accounts ({accounts.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {accounts.map(acc => {
                            const cfg = ACCOUNT_TYPES[acc.accountType] || ACCOUNT_TYPES.chequing;
                            const accTxs = transactions.filter(t => t.accountId === acc.id);
                            const income = accTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
                            const expenses = accTxs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
                            const typeIcons = { chequing: '🏦', savings: '💰', credit: '💳', investment: '📈' };
                            const dates = [...accTxs].sort((a, b) => a.date.localeCompare(b.date));
                            const dateRange = accTxs.length > 0 ? `${dates[0].date.slice(0, 7)} – ${dates[dates.length-1].date.slice(0, 7)}` : 'No data';
                            return (
                                <div key={acc.id}
                                    className="glass-card border border-white/[0.04] hover:border-emerald-500/30 cursor-pointer transition-all group"
                                    onClick={() => openAccountDetail(acc.id)}>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:border-emerald-500/20 transition-colors">
                                                    {typeIcons[acc.accountType] || '🏦'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">{acc.accountName}</p>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cfg.badge}`}>{cfg.label}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-400 transition-colors mt-1 shrink-0" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <p className="text-[10px] text-slate-500 mb-0.5">Transactions</p>
                                                <p className="text-sm font-semibold text-white">{accTxs.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 mb-0.5">Income</p>
                                                <p className="text-sm font-semibold text-emerald-400 font-mono">{fmt(income)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 mb-0.5">Spent</p>
                                                <p className="text-sm font-semibold text-rose-400 font-mono">{fmt(expenses)}</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-600 mt-3 text-center">{dateRange}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* All Accounts card */}
                        {transactions.length > 0 && (
                            <div className="glass-card border border-dashed border-white/10 hover:border-sky-500/30 cursor-pointer transition-all group"
                                onClick={() => openAccountDetail('all')}>
                                <div className="p-5 flex flex-col items-center justify-center h-full min-h-[140px] gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl group-hover:border-sky-500/40 transition-colors">
                                        📂
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-white">All Transactions</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{transactions.length} total · {dataRange.label}</p>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── CSV Export Guide ── */}
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <button onClick={() => setShowCsvGuide(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/[0.02] transition-all">
                    <span className="flex items-center gap-2">
                        <FileText size={13} className="text-sky-400" />
                        <span className="font-medium">How to export your bank CSV</span>
                        <span className="text-[10px] text-slate-600 font-normal hidden sm:inline">— step-by-step guide for major Canadian banks</span>
                    </span>
                    <span className="text-slate-600 text-xs">{showCsvGuide ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showCsvGuide && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/[0.05]">
                        <p className="text-xs text-slate-500 mb-4">Log into your bank's website (not app) on a computer, then follow the steps below. Download the CSV and drag it into the upload zone above.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { bank: 'TD Bank', color: '#2a7d4f', steps: ['Log in at td.com', 'Select your account', 'Click "Download" or "Statement"', 'Choose "CSV" format & date range', 'Save and upload here'] },
                                { bank: 'RBC', color: '#005daa', steps: ['Log in at rbcroyalbank.com', 'Go to your account', 'Click "Download Transactions"', 'Select CSV and date range', 'Download and upload here'] },
                                { bank: 'Scotiabank', color: '#cc0000', steps: ['Log in at scotiabank.com', 'Click account name', '"Download Transactions" button', 'Pick CSV format & range', 'Save and upload here'] },
                                { bank: 'BMO', color: '#0075be', steps: ['Log in at bmo.com', 'Select account', 'Click "Download" icon', 'Choose CSV, set date range', 'Download and upload here'] },
                                { bank: 'CIBC', color: '#c41b1b', steps: ['Log in at cibc.com', 'Go to your account', '"Download transactions" link', 'Select CSV & date range', 'Save and upload here'] },
                                { bank: 'Other Banks', color: '#64748b', steps: ['Log into online banking', 'Find transaction history', 'Look for Download / Export', 'Choose CSV or Spreadsheet', 'Upload the .csv file here'] },
                            ].map(b => (
                                <div key={b.bank} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color }} />
                                        <span className="text-xs font-semibold text-white">{b.bank}</span>
                                    </div>
                                    <ol className="space-y-1">
                                        {b.steps.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                                                <span className="text-[9px] font-bold text-slate-600 mt-0.5 shrink-0 w-3">{i + 1}.</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-3">💡 Tip: Export 12 months of history for the most accurate insights. Your data never leaves your device.</p>
                    </div>
                )}
            </div>

            {/* ── Transfer Detection Banner ── */}
            {transferTxIds.size > 0 && (
                <div className="px-4 py-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-start gap-3">
                    <span className="text-lg mt-0.5">↔️</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sky-300">{Math.floor(transferTxIds.size / 2)} inter-account transfer{Math.floor(transferTxIds.size / 2) !== 1 ? 's' : ''} detected and excluded from totals</p>
                        <p className="text-xs text-slate-400 mt-0.5">Transactions tagged as transfers between your accounts are hidden from income/expense calculations so they don't inflate your numbers. Open any account to see them tagged <span className="text-sky-400">↔ Transfer</span>.</p>
                    </div>
                </div>
            )}

            {/* ── Financial Advisor Checklist (Ghost Cards) ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={13} className="text-violet-400" /> Financial Picture Checklist
                        </h3>
                        <p className="text-[10px] text-slate-600 mt-0.5">What a financial advisor would request for a complete view</p>
                    </div>
                    {[...dismissedAdvisorItems].length > 0 && (
                        <button onClick={() => setDismissedAdvisorItems(new Set())} className="text-[10px] text-slate-500 hover:text-white transition-colors">
                            Restore skipped items
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ADVISOR_CHECKLIST.filter(item => !dismissedAdvisorItems.has(item.id)).map(item => {
                        const covered = accounts.some(a => a.accountType === item.accountType);
                        return (
                            <div key={item.id} className={`relative rounded-xl border transition-all ${
                                covered
                                    ? 'border-emerald-500/20 bg-emerald-500/5'
                                    : 'border-dashed border-white/10 bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-500/5'
                            }`}>
                                <div className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-xl">{item.icon}</span>
                                        {covered ? (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">✓ Loaded</span>
                                        ) : (
                                            <button
                                                onClick={() => setDismissedAdvisorItems(prev => new Set([...prev, item.id]))}
                                                className="text-slate-600 hover:text-slate-400 transition-colors" title="I don't have this">
                                                <X size={11} />
                                            </button>
                                        )}
                                    </div>
                                    <p className={`text-xs font-medium mb-0.5 ${covered ? 'text-emerald-300' : 'text-slate-300'}`}>{item.label}</p>
                                    <p className="text-[9px] text-slate-600 leading-tight">{item.description}</p>
                                    {!covered && (
                                        <div className="flex flex-col gap-1 mt-2.5">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => { setGhostUploadType(item.accountType); setTimeout(() => ghostFileInputRef.current?.click(), 50); }}
                                                    className="flex-1 text-[10px] py-1 px-1.5 rounded-lg bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 border border-violet-500/20 transition-all font-medium">
                                                    Upload CSV
                                                </button>
                                                <button
                                                    onClick={() => { setGhostManualForm({ name: item.label, balance: '', interestRate: '', monthlyPayment: '', notes: '' }); setGhostManualModal({ item }); }}
                                                    className="flex-1 text-[10px] py-1 px-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-all font-medium">
                                                    Enter Manually
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setDismissedAdvisorItems(prev => new Set([...prev, item.id]))}
                                                className="text-[10px] py-1 px-2 rounded-lg bg-white/5 text-slate-400 hover:text-slate-300 border border-white/10 transition-all">
                                                I don't have this
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {item.required && !covered && (
                                    <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-amber-400" title="Recommended" />
                                )}
                            </div>
                        );
                    })}
                    {/* All dismissed */}
                    {ADVISOR_CHECKLIST.every(item => dismissedAdvisorItems.has(item.id) || accounts.some(a => a.accountType === item.accountType)) && (
                        <div className="col-span-full text-center py-3 text-xs text-emerald-400 flex items-center justify-center gap-2">
                            <CheckCircle size={14} /> Financial picture is complete — all accounts loaded or marked N/A
                        </div>
                    )}
                </div>
            </div>

            {/* Empty state when no transactions */}
            {transactions.length === 0 && !isDemoMode && (
                <div className="text-center py-16 text-slate-500">
                    <FileText size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No accounts yet. Upload a CSV file or add a manual transaction to get started.</p>
                </div>
            )}
        </div>
        ); // end overview return
    }; // end renderTransactions

    /* ═══════════════════════════════════════
       RENDER — DEBTS TAB
       ═══════════════════════════════════════ */
    const DEBT_CATEGORIES = ['credit_card','personal_loan','student_loan','car_loan','mortgage','line_of_credit','medical','payday_loan','buy_now_pay_later','other'];
    const renderDebts = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-emerald-400" /> {editingDebtId ? 'Edit Debt' : 'Add Debt'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Debt Name *</label>
                        <input placeholder="e.g. TD Visa Card" value={debtForm.name} onChange={e => setDebtForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500" />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Lender / Bank</label>
                        <input placeholder="e.g. TD Bank" value={debtForm.lender} onChange={e => setDebtForm(p => ({ ...p, lender: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500" />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Debt Type</label>
                        <select value={debtForm.debtCategory} onChange={e => setDebtForm(p => ({ ...p, debtCategory: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 cursor-pointer">
                            {DEBT_CATEGORIES.map(k => <option key={k} value={k} className="bg-[#0c0e18]">{k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Current Balance ($) *</label>
                        <input type="number" placeholder="5000" value={debtForm.amount} onChange={e => setDebtForm(p => ({ ...p, amount: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 font-mono" />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Interest Rate (APR %)</label>
                        <input type="number" placeholder="19.99" value={debtForm.interestRate} onChange={e => setDebtForm(p => ({ ...p, interestRate: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 font-mono" />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Minimum Payment ($)</label>
                        <input type="number" placeholder="25" value={debtForm.minimumPayment} onChange={e => setDebtForm(p => ({ ...p, minimumPayment: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 font-mono" />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Current Payment ($)</label>
                        <input type="number" placeholder="200" value={debtForm.monthlyPayment} onChange={e => setDebtForm(p => ({ ...p, monthlyPayment: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 font-mono" />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Months Remaining</label>
                        <input type="number" placeholder="36" value={debtForm.monthsRemaining} onChange={e => setDebtForm(p => ({ ...p, monthsRemaining: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 font-mono" />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Priority</label>
                        <select value={debtForm.priority} onChange={e => setDebtForm(p => ({ ...p, priority: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 cursor-pointer">
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Notes (optional)</label>
                        <input placeholder="e.g. 0% promo ends June 2026" value={debtForm.notes} onChange={e => setDebtForm(p => ({ ...p, notes: e.target.value }))}
                            className="w-full bg-surface-light border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500" />
                    </div>
                    <div className="flex items-end gap-2">
                        <button onClick={addDebt} className="btn-primary flex-1 text-white px-4 py-2.5 text-sm flex items-center justify-center gap-2">
                            <Plus size={16} /> {editingDebtId ? 'Update Debt' : 'Add Debt'}
                        </button>
                        {editingDebtId && (
                            <button onClick={() => { setEditingDebtId(null); setDebtForm({ name: '', amount: '', monthlyPayment: '', minimumPayment: '', interestRate: '', type: 'debt', debtCategory: 'credit_card', monthsRemaining: '', priority: 'medium', lender: '', notes: '' }); }}
                                className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-sm transition-all">Cancel</button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Debt Checklist (Ghost Prompts) ── */}
            {(() => {
                const DEBT_CHECKLIST = [
                    { id: 'dc_credit',   label: 'Credit Card(s)',      icon: '💳', cat: 'credit_card',     hint: 'Any Visa, Mastercard, Amex balance' },
                    { id: 'dc_loc',      label: 'Line of Credit',      icon: '📋', cat: 'line_of_credit',  hint: 'Personal LOC or HELOC' },
                    { id: 'dc_mortgage', label: 'Mortgage',            icon: '🏠', cat: 'mortgage',         hint: 'Remaining mortgage balance' },
                    { id: 'dc_vehicle',  label: 'Vehicle Loan/Lease',  icon: '🚗', cat: 'car_loan',         hint: 'Car, truck, or lease balance' },
                    { id: 'dc_student',  label: 'Student Loan',        icon: '🎓', cat: 'student_loan',     hint: 'OSAP, bank student loan, etc.' },
                    { id: 'dc_medical',  label: 'Medical Debt',        icon: '🏥', cat: 'medical',          hint: 'Hospital bills, dental plans' },
                    { id: 'dc_bnpl',     label: 'Buy Now Pay Later',   icon: '🛍️', cat: 'buy_now_pay_later', hint: 'Klarna, Afterpay, PayBright' },
                    { id: 'dc_other',    label: 'Other Debt',          icon: '📑', cat: 'other',            hint: 'Personal loans, family debt, etc.' },
                ];
                const coveredCats = new Set(debts.map(d => d.debtCategory));
                const visible = DEBT_CHECKLIST.filter(i => !dismissedDebtPrompts.has(i.id) && !coveredCats.has(i.cat));
                if (visible.length === 0) return null;
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <CreditCard size={12} className="text-rose-400" /> Common debt types — are any of these missing?
                            </p>
                            {dismissedDebtPrompts.size > 0 && <button onClick={() => setDismissedDebtPrompts(new Set())} className="text-[10px] text-slate-600 hover:text-slate-400">Restore hidden</button>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {visible.map(item => (
                                <div key={item.id} className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] hover:border-rose-500/20 hover:bg-rose-500/5 transition-all p-3 group">
                                    <div className="flex items-start justify-between mb-1.5">
                                        <span className="text-lg">{item.icon}</span>
                                        <button onClick={() => setDismissedDebtPrompts(prev => new Set([...prev, item.id]))}
                                            className="text-slate-700 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100"><X size={11} /></button>
                                    </div>
                                    <p className="text-xs font-medium text-slate-300 mb-0.5">{item.label}</p>
                                    <p className="text-[9px] text-slate-600 leading-tight mb-2">{item.hint}</p>
                                    <button
                                        onClick={() => setDebtForm(f => ({ ...f, name: item.label, debtCategory: item.cat }))}
                                        className="w-full text-[10px] py-1 px-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all font-medium">
                                        + Add this debt
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {/* Debt Cards */}
            {debts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {debts.map(d => {
                        const priorityColors = { high: 'border-rose-500/30 bg-rose-500/5', medium: 'border-amber-500/30 bg-amber-500/5', low: 'border-emerald-500/30 bg-emerald-500/5' };
                        const proj = savingsData.debtProjections?.find(p => p.id === d.id);
                        const payoffProgress = proj && !isNaN(proj.monthsToPayoff) && proj.monthsToPayoff < 600 ? ((d.monthsRemaining > 0 ? (d.monthsRemaining - proj.monthsToPayoff) / d.monthsRemaining : 0) * 100) : null;
                        return (
                            <div key={d.id} className={`glass-card p-5 border-l-2 ${priorityColors[d.priority] || ''}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="min-w-0">
                                        <h4 className="text-white font-semibold truncate">{d.name}</h4>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                            {d.lender && <span className="text-xs text-slate-500">{d.lender}</span>}
                                            {d.debtCategory && <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-slate-400 rounded-full">{d.debtCategory.replace(/_/g, ' ')}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => editDebt(d)} className="text-slate-500 hover:text-emerald-400 transition-colors" title="Edit"><FileText size={15} /></button>
                                        <button onClick={() => removeDebt(d.id)} className="text-slate-500 hover:text-rose-400 transition-colors" title="Delete"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-sm mb-3">
                                    <div className="flex justify-between"><span className="text-slate-400">Balance</span><span className="font-mono text-rose-400 font-bold">{fmt(d.amount)}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Current payment</span><span className="font-mono text-white">{fmt(d.monthlyPayment)}/mo</span></div>
                                    {d.minimumPayment > 0 && Number(d.minimumPayment) !== Number(d.monthlyPayment) && (
                                        <div className="flex justify-between"><span className="text-slate-400">Minimum</span><span className="font-mono text-slate-400">{fmt(d.minimumPayment)}/mo</span></div>
                                    )}
                                    {d.interestRate > 0 && <div className="flex justify-between"><span className="text-slate-400">Rate</span><span className="font-mono text-amber-400">{d.interestRate}% APR</span></div>}
                                    {proj && proj.monthsToPayoff < 600 && (
                                        <>
                                            <div className="flex justify-between"><span className="text-slate-400">Debt-free</span><span className="font-mono text-emerald-400 text-xs">{new Date(Date.now() + proj.monthsToPayoff * 30.44 * 86400000).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}</span></div>
                                            {proj.totalInterest > 0 && <div className="flex justify-between"><span className="text-slate-400">Total interest</span><span className="font-mono text-rose-300 text-xs">{fmt(proj.totalInterest)}</span></div>}
                                        </>
                                    )}
                                </div>
                                {/* Interest rate bar */}
                                {d.interestRate > 0 && (
                                    <div>
                                        <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${d.interestRate >= 20 ? 'bg-rose-500' : d.interestRate >= 12 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(100, (d.interestRate / 30) * 100)}%` }} />
                                        </div>
                                        <p className="text-[9px] text-slate-600 mt-0.5">{d.interestRate >= 20 ? 'High-rate — attack first' : d.interestRate >= 12 ? 'Moderate rate' : 'Low rate'}</p>
                                    </div>
                                )}
                                {d.notes && <p className="text-xs text-slate-500 mt-2 italic">{d.notes}</p>}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card p-10 text-center">
                    <CreditCard size={36} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No debts added yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Add your credit cards, loans, and outstanding balances above.</p>
                </div>
            )}

            {/* Summary */}
            {debts.length > 0 && (
                <div className="glass-card p-5 flex flex-wrap gap-6 items-center justify-center">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Total Debt</p>
                        <p className="font-mono text-xl text-rose-400 font-bold">{fmt(totalDebtBalance)}</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Monthly Payments</p>
                        <p className="font-mono text-xl text-amber-400 font-bold">{fmt(totalDebtPayments)}</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Items</p>
                        <p className="font-mono text-xl text-white font-bold">{debts.length}</p>
                    </div>
                </div>
            )}

            {/* Debt Strategy Comparison */}
            {debtStrategies && (
                <div className="glass-card p-6 space-y-5">
                    <div>
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <Target size={16} className="text-emerald-400" /> Payoff Strategy Comparison
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Compare 4 strategies using your current payment of {fmt(debtStrategies.totalBudget)}/mo. Freed-up minimums roll into the next target.</p>
                    </div>
                    {debtStrategies.interestSaved > 0 && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-center">
                            <span className="text-emerald-400 font-semibold">💡 Avalanche vs Snowball: save {fmt(debtStrategies.interestSaved)} in interest</span>
                            <span className="text-slate-400"> by targeting high-rate debt first</span>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            { key: 'avalanche', label: 'Avalanche', icon: '❄️', sub: 'Highest interest rate first — saves the most money over time', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', data: debtStrategies.avalanche, recommended: true },
                            { key: 'snowball',  label: 'Snowball',  icon: '⛄', sub: 'Smallest balance first — fastest psychological wins', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5',  data: debtStrategies.snowball },
                            { key: 'hybrid',    label: 'Hybrid',    icon: '⚡', sub: 'Snowball first win, then avalanche', color: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-500/5', data: debtStrategies.hybrid },
                            { key: 'minimumOnly', label: 'Status Quo', icon: '😴', sub: 'Minimums only · no extra payments', color: 'text-slate-400', border: 'border-slate-500/20', bg: 'bg-slate-500/5', data: debtStrategies.minimumOnly, warning: true },
                        ].map(s => (
                            <div key={s.key} className={`p-4 rounded-xl border ${s.border} ${s.bg} relative`}>
                                {s.recommended && <span className="absolute -top-2 left-3 text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded-full font-medium">Recommended</span>}
                                {s.warning && <span className="absolute -top-2 left-3 text-[10px] px-2 py-0.5 bg-slate-600 text-slate-200 rounded-full font-medium">Avoid this</span>}
                                <div className="flex items-center gap-2 mb-3 mt-1">
                                    <span className="text-xl">{s.icon}</span>
                                    <div>
                                        <h4 className={`font-semibold ${s.color}`}>{s.label}</h4>
                                        <p className="text-[10px] text-slate-500 leading-tight">{s.sub}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Debt-free in</span>
                                        <span className={`font-mono font-bold ${s.color}`}>{s.data.months >= 600 ? 'Never' : `${s.data.months} mo`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Total interest</span>
                                        <span className="font-mono text-rose-400">{fmt(s.data.totalInterest)}</span>
                                    </div>
                                    {s.data.months < 600 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Free date</span>
                                            <span className="font-mono text-slate-300 text-xs">{new Date(Date.now() + s.data.months * 30.44 * 86400000).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>
                                {s.data.payoffOrder.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-white/5">
                                        <p className="text-[9px] text-slate-600 mb-1 uppercase tracking-wider">Payoff order</p>
                                        {s.data.payoffOrder.map((p, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-[10px] py-0.5">
                                                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${s.color} bg-white/5`}>{i + 1}</span>
                                                <span className="text-slate-400 truncate">{p.name}</span>
                                                <span className="text-slate-600 ml-auto shrink-0">mo {p.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    /* ═══════════════════════════════════════
       RENDER — SAVINGS PLAN TAB
       ═══════════════════════════════════════ */
    const GOAL_ICONS = ['🎯','🏠','🚗','✈️','💍','🎓','💻','📱','🏋️','🐾','🏦','🛡️','🎉','🌍','👶'];
    const renderSavings = () => (
        <div className="space-y-6 animate-fade-in">
            {(transactions.length === 0 && debts.length === 0 && savingsGoals.length === 0) ? (
                <div className="glass-card p-10 text-center">
                    <PiggyBank size={36} className="text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 mb-4">Import transactions and add debts to see your savings plan.</p>
                    <button onClick={() => setShowGoalForm(true)} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm transition-all">
                        + Add a Savings Goal
                    </button>
                </div>
            ) : (
                <>
                    {/* ── Section 1: Cash Flow Snapshot ── */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">📊 Monthly Cash Flow</h3>
                        <p className="text-xs text-slate-500 mb-5">Based on your full transaction history</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                <p className="text-[10px] text-emerald-300 mb-1 uppercase tracking-wider">Income</p>
                                <p className="text-xl font-bold font-mono text-emerald-400">{fmt(savingsData.monthlyIncome)}</p>
                                <p className="text-[10px] text-slate-500 mt-1">per month avg</p>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
                                <p className="text-[10px] text-rose-300 mb-1 uppercase tracking-wider">Spending</p>
                                <p className="text-xl font-bold font-mono text-rose-400">{fmt(summary.monthlySpending)}</p>
                                <p className="text-[10px] text-slate-500 mt-1">bills + variable</p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                                <p className="text-[10px] text-amber-300 mb-1 uppercase tracking-wider">Debt Payments</p>
                                <p className="text-xl font-bold font-mono text-amber-400">{fmt(totalDebtPayments)}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{debts.length} debt{debts.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className={`${savingsData.canSave > 0 ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-red-500/10 border-red-500/20'} border rounded-xl p-4 text-center`}>
                                <p className={`text-[10px] ${savingsData.canSave > 0 ? 'text-cyan-300' : 'text-red-300'} mb-1 uppercase tracking-wider`}>{savingsData.canSave > 0 ? 'Can Save' : 'Shortfall'}</p>
                                <p className={`text-xl font-bold font-mono ${savingsData.canSave > 0 ? 'text-cyan-400' : 'text-red-400'}`}>{fmt(Math.abs(savingsData.monthlyIncome - savingsData.monthlyExpenses))}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{savingsData.canSave > 0 ? 'per month' : 'spending > income'}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Savings Goals ── */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">🎯 Savings Goals</h3>
                                <p className="text-xs text-slate-500">Track named goals with real progress</p>
                            </div>
                            <button onClick={() => { setEditingGoalId(null); setGoalForm({ name: '', target: '', current: '', deadline: '', icon: '🎯' }); setShowGoalForm(v => !v); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm transition-all">
                                <Plus size={14} /> Add Goal
                            </button>
                        </div>

                        {/* Goal form */}
                        {showGoalForm && (
                            <div className="mb-5 p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                                <p className="text-sm font-medium text-white mb-3">{editingGoalId ? 'Edit Goal' : 'New Savings Goal'}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Icon</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {GOAL_ICONS.map(icon => (
                                                <button key={icon} onClick={() => setGoalForm(f => ({ ...f, icon }))}
                                                    className={`w-8 h-8 rounded-lg text-base transition-all ${goalForm.icon === icon ? 'bg-emerald-500/30 ring-1 ring-emerald-500' : 'bg-white/5 hover:bg-white/10'}`}>
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Goal Name</label>
                                        <input value={goalForm.name} onChange={e => setGoalForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Emergency Fund"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Target ($)</label>
                                        <input type="number" value={goalForm.target} onChange={e => setGoalForm(f => ({ ...f, target: e.target.value }))} placeholder="5000"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Saved So Far ($)</label>
                                        <input type="number" value={goalForm.current} onChange={e => setGoalForm(f => ({ ...f, current: e.target.value }))} placeholder="0"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Deadline (optional)</label>
                                        <input type="month" value={goalForm.deadline} onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={addGoal} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white text-sm font-medium transition-all">
                                        {editingGoalId ? 'Save Changes' : 'Add Goal'}
                                    </button>
                                    <button onClick={() => { setShowGoalForm(false); setEditingGoalId(null); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-sm transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {savingsGoals.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-6">No goals yet — add one to start tracking your progress.</p>
                        ) : (
                            <div className="space-y-4">
                                {savingsGoals.map(goal => {
                                    const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
                                    const remaining = Math.max(0, goal.target - goal.current);
                                    const monthsNeeded = savingsData.canSave > 0 && remaining > 0 ? Math.ceil(remaining / savingsData.canSave) : null;
                                    const projDate = monthsNeeded ? new Date(Date.now() + monthsNeeded * 30.44 * 86400000) : null;
                                    const isOnTrack = goal.deadline && projDate
                                        ? projDate <= new Date(goal.deadline + '-01')
                                        : null;
                                    return (
                                        <div key={goal.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{goal.icon}</span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{goal.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {fmt(goal.current)} saved of {fmt(goal.target)}
                                                            {goal.deadline && <span> · Target: {new Date(goal.deadline + '-01').toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isOnTrack !== null && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isOnTrack ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {isOnTrack ? '✓ On Track' : '⚠ Behind'}
                                                        </span>
                                                    )}
                                                    <button onClick={() => editGoal(goal)} className="text-slate-500 hover:text-slate-300 transition-colors"><Target size={14} /></button>
                                                    <button onClick={() => removeGoal(goal.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-emerald-400 font-mono font-semibold">{pct.toFixed(0)}%</span>
                                                <span className="text-slate-500">{fmt(remaining)} to go</span>
                                                {monthsNeeded && <span className="text-cyan-400">~{monthsNeeded} mo{projDate ? ` (${projDate.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })})` : ''}</span>}
                                            </div>
                                            {/* Quick update current balance */}
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="text-[10px] text-slate-500">Update saved:</span>
                                                <input type="number" defaultValue={goal.current} key={goal.current}
                                                    onBlur={e => updateGoalProgress(goal.id, e.target.value)}
                                                    className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Section 3: Financial Priority Stack ── */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">📋 Financial Priority Order</h3>
                        <p className="text-xs text-slate-500 mb-5">The proven order of operations for getting financially healthy. Work through these one at a time.</p>
                        <div className="space-y-2">
                            {priorityStack.steps.map((step, i) => {
                                const isActive = i === priorityStack.activeStep;
                                const isPast = step.done;
                                const isFuture = !step.done && i > priorityStack.activeStep;
                                return (
                                    <div key={step.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                        isActive ? 'bg-emerald-500/10 border-emerald-500/30' :
                                        isPast ? 'bg-white/[0.02] border-white/5 opacity-60' :
                                        'bg-white/[0.01] border-white/5 opacity-40'
                                    }`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
                                            isPast ? 'bg-emerald-500/30 text-emerald-400' :
                                            isActive ? 'bg-emerald-500 text-white' :
                                            'bg-white/5 text-slate-500'
                                        }`}>
                                            {isPast ? '✓' : step.id}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{step.icon}</span>
                                                <p className={`text-sm font-medium ${isActive ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>{step.label}</p>
                                                {isActive && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">Your Focus</span>}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 ml-6">{step.desc}</p>
                                            {step.target && isActive && (
                                                <div className="ml-6 mt-2">
                                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (step.current / step.target) * 100)}%` }} />
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 mt-1">{fmt(step.current)} / {fmt(step.target)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Section 4: Spending Cuts Calculator ── */}
                    {spendingCuts.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-1">✂️ Spending Cuts Calculator</h3>
                            <p className="text-xs text-slate-500 mb-5">What if you cut these top categories by 25%? Here's how much you'd free up each month.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {spendingCuts.map((cut, i) => (
                                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-white">{cut.category}</p>
                                            <span className="text-xs text-slate-400 font-mono">{fmt(cut.monthly)}/mo now</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-emerald-400 font-mono text-lg font-bold">+{fmt(cut.freed)}/mo</span>
                                            <span className="text-xs text-slate-500">freed at 25% cut</span>
                                        </div>
                                        {cut.monthsFaster.length > 0 && (
                                            <div className="space-y-1">
                                                {cut.monthsFaster.filter(m => m.fasterBy > 0).map((m, j) => (
                                                    <p key={j} className="text-[10px] text-cyan-400">→ {m.name}: {m.fasterBy} mo faster</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Section 5: Monthly Savings History Chart ── */}
                    {monthlySavingsHistory.data.length > 1 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-1">📅 Monthly Savings History</h3>
                            <p className="text-xs text-slate-500 mb-4">Your actual net savings each month — green is money saved, red is money lost.</p>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                                    <p className="text-[10px] text-emerald-300 mb-1">Best Month</p>
                                    <p className="font-mono text-sm font-bold text-emerald-400">{fmt(monthlySavingsHistory.best)}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                                    <p className="text-[10px] text-slate-400 mb-1">Monthly Avg</p>
                                    <p className={`font-mono text-sm font-bold ${monthlySavingsHistory.avg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(monthlySavingsHistory.avg)}</p>
                                </div>
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
                                    <p className="text-[10px] text-rose-300 mb-1">Worst Month</p>
                                    <p className="font-mono text-sm font-bold text-rose-400">{fmt(monthlySavingsHistory.worst)}</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthlySavingsHistory.data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => fmtShort(v)} width={52} />
                                    <Tooltip content={({ active, payload }) => active && payload?.length ? (
                                        <div className="bg-slate-800 border border-white/10 rounded-xl p-3 text-xs">
                                            <p className="text-slate-400 mb-1">{payload[0].payload.fullMonth}</p>
                                            <p className={`font-mono font-bold ${payload[0].value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(payload[0].value)}</p>
                                        </div>
                                    ) : null} />
                                    <Bar dataKey="net" radius={[3, 3, 0, 0]}>
                                        {monthlySavingsHistory.data.map((d, i) => (
                                            <Cell key={i} fill={d.net >= 0 ? '#0ecb81' : '#ef4444'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* ── Section 6: Projection Chart ── */}
                    {savingsData.canSave > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-1">📈 Savings Projection</h3>
                            <p className="text-xs text-slate-500 mb-4">How your savings grow over 24 months alongside your goals.</p>
                            <div className="mb-4 flex items-center gap-4">
                                <span className="text-xs text-slate-400 whitespace-nowrap">Extra/mo:</span>
                                <input type="range" min={0} max={1000} step={25} value={extraSavings}
                                    onChange={e => setExtraSavings(Number(e.target.value))} className="flex-1 accent-emerald-500" />
                                <span className="font-mono text-emerald-400 text-sm font-bold w-16 text-right">+{fmt(extraSavings)}</span>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={Array.from({ length: 25 }, (_, i) => {
                                    const obj = { month: `Mo ${i}`, saved: savingsData.canSave * i, withExtra: (savingsData.canSave + extraSavings) * i, emergencyLine: savingsData.emergencyTarget3 };
                                    savingsGoals.forEach(g => { obj[`goal_${g.id}`] = Number(g.target); });
                                    return obj;
                                })}>
                                    <defs>
                                        <linearGradient id="savGrad2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0ecb81" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} interval={4} />
                                    <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => fmtShort(v)} width={52} />
                                    <Tooltip content={customTooltip} />
                                    {savingsGoals.map((g, i) => (
                                        <Line key={g.id} type="monotone" dataKey={`goal_${g.id}`} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeDasharray="5 5" dot={false} name={g.name} />
                                    ))}
                                    {savingsGoals.length === 0 && (
                                        <Line type="monotone" dataKey="emergencyLine" stroke="#3b82f6" strokeDasharray="5 5" dot={false} name="3-mo Emergency" />
                                    )}
                                    <Area type="monotone" dataKey="saved" stroke="#0ecb81" fill="url(#savGrad2)" name="Your savings" />
                                    {extraSavings > 0 && <Line type="monotone" dataKey="withExtra" stroke="#f59e0b" dot={false} name={`+${fmt(extraSavings)}/mo`} />}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* ── Section 7: Fixed Monthly Bills ── */}
                    {recurringPayments.filter(r => r.frequency === 'Monthly').length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-1">🔄 Fixed Monthly Bills</h3>
                            <p className="text-xs text-slate-500 mb-4">Recurring payments — look for ones you could reduce or cancel.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {recurringPayments.filter(r => r.frequency === 'Monthly').map((rp, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-white/[0.02] rounded-lg border border-white/5">
                                        <div>
                                            <p className="text-sm text-slate-200 truncate max-w-[180px]">{rp.merchant}</p>
                                            <p className="text-[10px] text-slate-500">{rp.category}</p>
                                        </div>
                                        <span className="font-mono text-sm text-rose-400">{fmt(rp.avgAmount)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-sm">
                                <span className="text-slate-400">Total fixed bills</span>
                                <span className="font-mono text-rose-400 font-medium">{fmt(recurringPayments.filter(r => r.frequency === 'Monthly').reduce((s, r) => s + r.avgAmount, 0))}/mo</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    /* ═══════════════════════════════════════
       RENDER — AI ADVISOR TAB
       ═══════════════════════════════════════ */
    const renderAdvisor = () => (
        <div className="flex flex-col h-[calc(100vh-180px)] animate-fade-in">
            <div className="glass-card flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white">Financial Advisor AI</h3>
                        <p className="text-xs text-slate-400">Powered by smart analysis · Your data never leaves your device</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                        <span className="text-[10px] text-emerald-400 font-medium">Always online</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 && !chatLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center mb-5">
                                <Sparkles size={28} className="text-emerald-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">
                                {transactions.length > 0 ? 'Ready to analyze your finances' : 'Your personal finance advisor'}
                            </h3>
                            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                                {transactions.length > 0
                                    ? 'I have your financial data loaded. Ask me anything, or generate a full report to see where you stand and exactly what to do next.'
                                    : 'Import your bank transactions first — then I\'ll generate a personalized report with specific actions based on your real numbers.'}
                            </p>
                            {transactions.length > 0 && !advisorReportGenerated && (
                                <button onClick={() => { setAdvisorReportGenerated(true); sendChat('Generate my comprehensive financial health report', true); }}
                                    className="mt-5 btn-primary px-5 py-2.5 text-white text-sm">
                                    Generate My Financial Report
                                </button>
                            )}
                            {transactions.length === 0 && (
                                <button onClick={() => setActiveTab('transactions')}
                                    className="mt-5 btn-primary px-5 py-2.5 text-white text-sm">
                                    Import Transactions <ChevronRight size={14} className="inline ml-1" />
                                </button>
                            )}
                        </div>
                    )}
                    {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' && !m.isSystem ? 'justify-end' : 'justify-start'}`}>
                            {m.isSystem ? null : (
                                <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-slate-200'}`}>
                                    {m.role === 'assistant' ? (
                                        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                                            __html: m.content
                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                                .replace(/#{1,3}\s(.+)/g, '<h4 class="text-emerald-400 font-semibold mt-3 mb-1">$1</h4>')
                                                .replace(/^- (.+)/gm, '<span class="block ml-2">• $1</span>')
                                                .replace(/(\d+)\.\s/g, '<span class="text-emerald-400 font-mono font-bold">$1. </span>')
                                        }} />
                                    ) : m.content}
                                </div>
                            )}
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex justify-start">
                            <div className="chat-bubble-ai px-4 py-3 flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-emerald-400" />
                                <span className="text-sm text-slate-400">Analyzing your finances...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex gap-2">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat(chatInput)}
                            placeholder="Ask about your finances..."
                            className="flex-1 bg-surface-light border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500" />
                        <button onClick={() => sendChat(chatInput)} disabled={chatLoading || !chatInput.trim()}
                            className="btn-primary disabled:opacity-40 disabled:shadow-none text-white px-4">
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {['How can I reduce spending?', 'Best debt payoff strategy?', 'Am I saving enough?', 'Generate my financial report'].map(q => (
                            <button key={q} onClick={() => sendChat(q)}
                                className="text-xs bg-surface-light border border-white/5 text-slate-400 hover:text-white hover:border-emerald-500/30 rounded-lg px-3 py-1.5 transition-all">
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    /* ═══════════════════════════════════════
       RENDER — RECOVERY PLAN TAB
       ═══════════════════════════════════════ */
    const renderRecovery = () => {
    if (transactions.length === 0 && debts.length === 0) {
        return (
            <div className="glass-card p-12 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                    <Target size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Your Road to Recovery</h2>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">Import your bank transactions and add your debts to generate a personalized recovery plan with real timelines and specific actions.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setActiveTab('transactions')} className="btn-primary px-6 py-2.5 text-white text-sm">Import Transactions</button>
                    <button onClick={() => setActiveTab('debts')} className="px-6 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-white rounded-xl text-sm font-medium transition-all">Add Debts</button>
                </div>
            </div>
        );
    }

    // ── RECOVERY CALCULATIONS ──
    const stepsWeights = [15, 10, 10, 15, 25, 15, 10];
    const completedWeight = priorityStack.steps.reduce((sum, s, i) => sum + (s.done ? stepsWeights[i] : 0), 0);
    const recoveryPct = Math.round(completedWeight);
    const currentStepIdx = priorityStack.activeStep >= 0 ? priorityStack.activeStep : priorityStack.steps.length - 1;
    const currentStep = priorityStack.steps[currentStepIdx];

    // Debt payoff projection (avalanche)
    const canPayExtra = Math.max(0, savingsData.canSave);
    let debtsCopy = debts.filter(d => Number(d.amount) > 0).map(d => ({ ...d, remaining: Number(d.amount), rate: Number(d.interestRate) / 100 / 12, minPay: Math.max(Number(d.minimumPayment) || 0, Number(d.monthlyPayment) || 0) })).sort((a, b) => b.rate - a.rate);

    const debtTimeline = [];
    let monthsToDebtFree = 0;
    if (debtsCopy.length > 0) {
        let extra = canPayExtra;
        let month = 0;
        const maxMonths = 360;
        while (debtsCopy.some(d => d.remaining > 0.01) && month < maxMonths) {
            month++;
            // Apply interest and payments
            let freedExtra = 0;
            debtsCopy = debtsCopy.map(d => {
                if (d.remaining <= 0) return d;
                const interest = d.remaining * d.rate;
                d.remaining = d.remaining + interest;
                return d;
            });
            // Avalanche: pay minimums, then extra to highest rate
            let extraLeft = extra;
            debtsCopy = debtsCopy.map((d, idx) => {
                if (d.remaining <= 0) return d;
                const pay = Math.min(d.remaining, d.minPay);
                d.remaining = Math.max(0, d.remaining - pay);
                return d;
            });
            // Extra to first non-zero (highest rate)
            for (let i = 0; i < debtsCopy.length; i++) {
                if (debtsCopy[i].remaining > 0 && extraLeft > 0) {
                    const pay = Math.min(debtsCopy[i].remaining, extraLeft);
                    debtsCopy[i].remaining = Math.max(0, debtsCopy[i].remaining - pay);
                    extraLeft -= pay;
                }
                // Free up paid-off minimums
                if (debtsCopy[i].remaining <= 0 && debtsCopy[i].minPay > 0) {
                    extra += debtsCopy[i].minPay;
                    debtsCopy[i].minPay = 0;
                }
            }
            if (debtTimeline.length < maxMonths) debtTimeline.push({ month, totalDebt: debtsCopy.reduce((s, d) => s + Math.max(0, d.remaining), 0) });
        }
        monthsToDebtFree = month >= maxMonths ? 999 : month;
    }

    // Emergency fund projections
    const ef3 = savingsData.emergencyTarget3;
    const ef6 = savingsData.emergencyTarget6;
    const monthsTo3Mo = savingsData.canSave > 0 ? Math.ceil(ef3 / savingsData.canSave) : 999;
    const monthsTo6Mo = savingsData.canSave > 0 ? Math.ceil(ef6 / savingsData.canSave) : 999;

    // Financial Freedom Date = max(debtFree, 6moFund)
    const monthsToFreedom = Math.max(monthsToDebtFree, monthsTo6Mo);
    const freedomDate = new Date();
    freedomDate.setMonth(freedomDate.getMonth() + monthsToFreedom);

    // Step dates
    const getStepDate = (months) => {
        if (months >= 999) return null;
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });
    };

    // 30-day sprint (specific weekly actions based on current step)
    const sprintActions = (() => {
        const weeks = [];
        const highRateDebt = debts.filter(d => Number(d.interestRate) >= 8).sort((a, b) => Number(b.interestRate) - Number(a.interestRate))[0];
        const topSpend = [...categoryData].sort((a, b) => b.monthly - a.monthly).find(c => ['Food & Dining','Shopping','Entertainment','Subscriptions'].includes(c.name));

        if (summary.monthlyNet < 0) {
            weeks.push({ week: 'This Week', icon: '🔥', action: 'Audit every subscription', detail: `Open your bank app and cancel anything you haven't used in 30 days. Most people find ${fmt(50)}–${fmt(150)}/mo here.` });
            weeks.push({ week: 'Week 2', icon: '📊', action: `Cut ${topSpend?.name || 'top spending'} by 20%`, detail: `Your #1 cuttable expense is ${fmt(topSpend?.monthly || 0)}/mo. Set a weekly cash limit. Cook one more meal at home. Small habits compound.` });
            weeks.push({ week: 'Week 3', icon: '💼', action: 'Explore extra income', detail: 'One shift of overtime, one freelance gig, or selling unused items can close your monthly gap. Even $200/mo changes the math dramatically.' });
            weeks.push({ week: 'Week 4', icon: '📞', action: 'Call your creditors', detail: 'If you have high-interest debt, call and ask for a rate reduction. This works more often than people think — especially if your payment history is clean.' });
        } else if (highRateDebt) {
            weeks.push({ week: 'This Week', icon: '🎯', action: `Set up extra payment to ${highRateDebt.name}`, detail: `Transfer ${fmt(Math.max(50, savingsData.canSave * 0.7))} extra this week. At ${highRateDebt.interestRate}% APR, every dollar saves you more than the stock market can reliably return.` });
            weeks.push({ week: 'Week 2', icon: '🤖', action: 'Automate your debt attack', detail: `Set up an automatic payment of ${fmt(Math.max(50, savingsData.canSave * 0.7))} to ${highRateDebt.name} on the day after payday. Automate it so you don't have to think about it.` });
            weeks.push({ week: 'Week 3', icon: '📱', action: 'Sign up for balance alerts', detail: 'Set up low-balance alerts on your chequing account so you never accidentally miss a payment. One missed payment can cost more than months of interest savings.' });
            weeks.push({ week: 'Week 4', icon: '📋', action: 'Review & celebrate progress', detail: `Check your ${highRateDebt.name} balance. It's lower. That's real money saved. Update your numbers here and watch your Recovery Score move.` });
        } else {
            weeks.push({ week: 'This Week', icon: '💰', action: 'Open a dedicated HISA', detail: 'Open a separate High Interest Savings Account for your emergency fund. Keeping it separate makes it harder to spend and easier to track.' });
            weeks.push({ week: 'Week 2', icon: '🤖', action: `Automate ${fmt(Math.max(100, savingsData.canSave * 0.5))}/mo to savings`, detail: 'Set up an automatic transfer on payday. Paying yourself first — before you see the money — is the single most effective savings habit.' });
            weeks.push({ week: 'Week 3', icon: '📈', action: 'Open a TFSA if you haven\'t', detail: 'A Tax-Free Savings Account lets your money grow without paying tax on gains. The room accumulates every year you\'re a Canadian resident.' });
            weeks.push({ week: 'Week 4', icon: '🎯', action: 'Set your first savings goal here', detail: 'Open the Savings Plan tab and add your emergency fund goal. Seeing the progress bar move is more motivating than you\'d expect.' });
        }
        return weeks;
    })();

    // Net worth projection (36 months)
    const nwProjection = (() => {
        const data = [];
        let currentNW = netWorth.net;
        const monthlySave = savingsData.canSave;
        let debtRem = totalDebtBalance;
        const avgRate = debts.length > 0 ? debts.reduce((s, d) => s + Number(d.interestRate), 0) / debts.length / 100 / 12 : 0;
        for (let m = 0; m <= 36; m++) {
            const interest = debtRem * avgRate;
            const payments = Math.min(debtRem + interest, totalDebtPayments + Math.max(0, monthlySave * 0.5));
            debtRem = Math.max(0, debtRem + interest - payments);
            const assets = currentNW + (debtRem < totalDebtBalance ? (totalDebtBalance - debtRem) : 0) + monthlySave * m;
            data.push({ month: m === 0 ? 'Now' : `Mo ${m}`, nw: Math.round(currentNW + monthlySave * m * 0.6 + (totalDebtBalance - debtRem) * 0.4), debt: Math.round(debtRem) });
        }
        return data;
    })();

    const freedomDateStr = monthsToFreedom >= 999 ? 'Not yet calculable — add income & debt data' : freedomDate.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
    const dti = healthScore?.dti || 0;

    return (
        <div className="space-y-6 animate-fade-in">

            {/* ── HERO: Recovery Status ── */}
            <div className="glass-card glass-card-premium p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recovery % circle */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative w-36 h-36">
                            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                                <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                                <circle cx="72" cy="72" r="60" fill="none" stroke="url(#recovGrad)" strokeWidth="12"
                                    strokeDasharray={`${2 * Math.PI * 60}`}
                                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - recoveryPct / 100)}`}
                                    strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="recovGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0ecb81" />
                                        <stop offset="100%" stopColor="#00b8d9" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold gradient-text">{recoveryPct}%</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">recovered</span>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-white mt-3">Step {currentStepIdx + 1} of 7</p>
                        <p className="text-xs text-slate-400 mt-0.5">{currentStep?.label || 'Complete'}</p>
                    </div>

                    {/* Key stats */}
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Financial Freedom Date</p>
                            <p className="text-xl font-bold text-white">{freedomDateStr}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{monthsToFreedom < 999 ? `${monthsToFreedom} months from today` : 'Complete your profile to calculate'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                <p className="text-[10px] text-slate-500 mb-0.5">Debt Remaining</p>
                                <p className="text-base font-bold font-mono text-rose-400">{fmt(totalDebtBalance)}</p>
                                <p className="text-[10px] text-slate-600">{monthsToDebtFree < 999 ? `free in ${monthsToDebtFree} mo` : 'add payments'}</p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                <p className="text-[10px] text-slate-500 mb-0.5">Monthly Surplus</p>
                                <p className={`text-base font-bold font-mono ${summary.monthlyNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(summary.monthlyNet)}</p>
                                <p className="text-[10px] text-slate-600">{summary.monthlyNet >= 0 ? 'to deploy' : 'gap to close'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Motivational message */}
                    <div className="flex flex-col justify-center space-y-3">
                        <div className={`px-4 py-3 rounded-xl border text-sm leading-relaxed ${recoveryPct >= 50 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : recoveryPct >= 25 ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'}`}>
                            {recoveryPct >= 75
                                ? '🏆 You\'re in the final stretch. The hard work is done — now it\'s about finishing strong.'
                                : recoveryPct >= 50
                                ? '💪 You\'re past the halfway point. The foundation is solid. Keep pushing.'
                                : recoveryPct >= 25
                                ? '🌱 You\'re building momentum. Every payment and every dollar saved is compounding.'
                                : '🚀 Every journey starts here. The fact you\'re tracking this already puts you ahead of most people.'}
                        </div>
                        {wins.length > 0 && (
                            <div className="space-y-1.5">
                                {wins.slice(0, 2).map((w, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                        <span>{w.icon}</span><span>{w.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── THE RECOVERY LADDER ── */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Target size={15} className="text-emerald-400" />
                    <h3 className="text-base font-semibold text-white">The 7-Step Recovery Ladder</h3>
                    <span className="text-xs text-slate-500 ml-1">— your path to financial freedom, in order</span>
                </div>
                <div className="relative">
                    {/* Vertical connector line */}
                    <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500/40 via-slate-700/40 to-slate-700/10" />
                    <div className="space-y-3">
                        {priorityStack.steps.map((step, i) => {
                            const isActive = i === currentStepIdx;
                            const isDone = step.done;
                            const isFuture = !isDone && i > currentStepIdx;
                            return (
                                <div key={step.id} className={`relative flex items-start gap-4 pl-1 pr-4 py-3.5 rounded-xl transition-all ${
                                    isActive ? 'bg-emerald-500/10 border border-emerald-500/20' : isDone ? 'bg-white/[0.02]' : 'opacity-60'
                                }`}>
                                    {/* Step circle */}
                                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base font-bold transition-all ${
                                        isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : isActive ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400' : 'bg-slate-700/50 border border-slate-600 text-slate-500'
                                    }`}>
                                        {isDone ? '✓' : step.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className={`text-sm font-semibold ${isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-500'}`}>{step.label}</h4>
                                            {isActive && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">← You are here</span>}
                                            {isDone && <span className="text-[10px] text-emerald-600 font-medium">Complete</span>}
                                        </div>
                                        <p className={`text-xs mt-0.5 leading-relaxed ${isDone ? 'text-slate-500' : isActive ? 'text-slate-300' : 'text-slate-600'}`}>{step.desc}</p>
                                        {step.target && step.current !== undefined && !isDone && (
                                            <div className="mt-2">
                                                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                                    <span>{fmt(step.current)} saved</span>
                                                    <span>target: {fmt(step.target)}</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                                                        style={{ width: `${Math.min(100, (step.current / step.target) * 100)}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {isFuture && i <= currentStepIdx + 2 && savingsData.canSave > 0 && (
                                        <div className="shrink-0 text-right">
                                            <p className="text-[10px] text-slate-600">approx.</p>
                                            <p className="text-xs text-slate-500 font-mono">{getStepDate(i * 3) || '—'}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── 30-DAY SPRINT ── */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Zap size={15} className="text-amber-400" />
                    <h3 className="text-base font-semibold text-white">Your 30-Day Action Sprint</h3>
                    <span className="text-xs text-slate-500 ml-1">— specific actions based on where you are right now</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sprintActions.map((a, i) => (
                        <div key={i} className={`p-4 rounded-xl border animate-slide-up stagger-${i+1} ${
                            i === 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/[0.06] bg-white/[0.02]'
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{a.icon}</span>
                                <div>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'text-amber-400' : 'text-slate-500'}`}>{a.week}</p>
                                    <p className="text-sm font-semibold text-white leading-snug">{a.action}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{a.detail}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── DEBT PAYOFF TIMELINE ── */}
            {debts.length > 0 && debtTimeline.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={15} className="text-rose-400" />
                        <h3 className="text-base font-semibold text-white">Debt Payoff Projection</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-5">Avalanche method (highest rate first) with your current surplus of {fmt(canPayExtra)}/mo applied as extra payments.</p>

                    {/* Debt summary table */}
                    <div className="space-y-2 mb-5">
                        {debts.filter(d => Number(d.amount) > 0).sort((a, b) => Number(b.interestRate) - Number(a.interestRate)).map((d, i) => {
                            const bal = Number(d.amount);
                            const rate = Number(d.interestRate);
                            const pay = Number(d.monthlyPayment) || Number(d.minimumPayment) || 0;
                            const extra = i === 0 ? canPayExtra : 0;
                            const moPayoff = pay + extra > 0 ? Math.ceil(bal / (pay + extra)) : 999;
                            const pd = getStepDate(moPayoff);
                            return (
                                <div key={d.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                                    {i === 0 && <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full shrink-0">Target</span>}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white truncate">{d.name}</span>
                                            {rate > 0 && <span className="text-[10px] text-rose-400 font-mono">{rate}% APR</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                                                    style={{ width: `${Math.min(100, (debtTimeline[Math.min(moPayoff, debtTimeline.length-1)]?.totalDebt || 0) > 0 ? 100 : (1 - (debtTimeline[Math.min(moPayoff, debtTimeline.length-1)]?.totalDebt || 0) / totalDebtBalance) * 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-mono font-bold text-rose-400">{fmt(bal)}</p>
                                        <p className="text-[10px] text-slate-500">{moPayoff < 999 ? `~${pd}` : 'add payment'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Debt trajectory chart */}
                    {debtTimeline.length > 1 && (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={debtTimeline.filter((_, i) => i % 3 === 0 || i === debtTimeline.length - 1)} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                                <defs>
                                    <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="month" stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `Mo ${v}`} />
                                <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => fmtShort(v)} width={52} />
                                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                                    <div className="bg-slate-800 border border-white/10 rounded-xl p-3 text-xs">
                                        <p className="text-slate-400 mb-1">Month {payload[0]?.payload?.month}</p>
                                        <p className="font-mono font-bold text-rose-400">{fmt(payload[0]?.value)} remaining</p>
                                    </div>
                                ) : null} />
                                <Area type="monotone" dataKey="totalDebt" name="Debt Remaining" stroke="#e11d48" fill="url(#debtGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}

            {/* ── NET WORTH TRAJECTORY ── */}
            {nwProjection.length > 1 && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={15} className="text-emerald-400" />
                        <h3 className="text-base font-semibold text-white">Net Worth Trajectory</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Projected over 36 months assuming current savings rate and debt payoff continue.</p>
                    {/* Breakeven callout */}
                    {netWorth.net < 0 && (
                        (() => {
                            const breakevenIdx = nwProjection.findIndex(p => p.nw >= 0);
                            return breakevenIdx >= 0 ? (
                                <div className="mb-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm">
                                    <span className="text-emerald-400 font-semibold">📈 Positive net worth projected in month {nwProjection[breakevenIdx].month}</span>
                                    <span className="text-slate-400"> — {getStepDate(nwProjection[breakevenIdx].month) || ''}</span>
                                </div>
                            ) : null;
                        })()
                    )}
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={nwProjection} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                            <defs>
                                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#0ecb81" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="month" stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }} interval={5} />
                            <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => fmtShort(v)} width={56} />
                            <Tooltip content={customTooltip} />
                            <Area type="monotone" dataKey="nw" name="Net Worth" stroke="#0ecb81" fill="url(#nwGrad)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ── SAVINGS MILESTONES ── */}
            {savingsData.canSave > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <PiggyBank size={15} className="text-cyan-400" />
                        <h3 className="text-base font-semibold text-white">Savings Milestones</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { label: '$1,000 Emergency Buffer', target: 1000, months: savingsData.canSave > 0 ? Math.ceil(1000 / savingsData.canSave) : 999, icon: '🛡️', color: 'border-emerald-500/30 bg-emerald-500/5', textColor: 'text-emerald-400' },
                            { label: '3-Month Emergency Fund', target: ef3, months: monthsTo3Mo, icon: '⛑️', color: 'border-cyan-500/30 bg-cyan-500/5', textColor: 'text-cyan-400' },
                            { label: '6-Month Safety Net', target: ef6, months: monthsTo6Mo, icon: '🏦', color: 'border-violet-500/30 bg-violet-500/5', textColor: 'text-violet-400' },
                        ].map((m, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${m.color}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{m.icon}</span>
                                    <p className="text-xs font-medium text-white leading-snug">{m.label}</p>
                                </div>
                                <p className={`text-xl font-bold font-mono ${m.textColor}`}>{fmt(m.target)}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {m.months < 999 ? (
                                        <>{m.months} months · <span className="text-slate-400">{getStepDate(m.months)}</span></>
                                    ) : 'Build monthly surplus first'}
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-3">Based on saving {fmt(savingsData.canSave)}/mo. These timelines improve as you pay off debt and free up cashflow.</p>
                </div>
            )}

            {/* ── BOTTOM COMMITMENT ── */}
            <div className="glass-card p-6 text-center border border-emerald-500/10">
                <p className="text-2xl mb-3">🌱</p>
                <h3 className="text-base font-semibold text-white mb-2">The most important step is the one you're on.</h3>
                <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Financial recovery isn't about perfection — it's about consistency. Missing one week doesn't undo progress.
                    Every transaction you track, every debt payment you make, every dollar you save is compounding in your favour.
                </p>
                <div className="flex items-center justify-center gap-6 mt-5 text-xs text-slate-600">
                    <span>📅 Keep tracking your spending</span>
                    <span>💳 Never miss a minimum payment</span>
                    <span>🤖 Ask the advisor when stuck</span>
                </div>
            </div>

        </div>
    );
};

    /* ═══════════════════════════════════════
       RENDER — SPEND CHECK TAB
       ═══════════════════════════════════════ */
    const renderDoctor = () => {
        if (transactions.length === 0) {
            return (
                <div className="glass-card p-12 text-center">
                    <Stethoscope size={40} className="text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Spending Diagnostics</h2>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Upload your bank transactions and I'll give you a full spending analysis with specific ways to improve.</p>
                    <button onClick={() => setActiveTab('transactions')} className="mt-4 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all">
                        Upload Transactions
                    </button>
                </div>
            );
        }

        // ─── Comprehensive Diagnosis Engine ───
        const savingsRate = summary.monthlyIncome > 0 ? (summary.monthlyNet / summary.monthlyIncome) * 100 : 0;
        const dti = summary.monthlyIncome > 0 ? (totalDebtPayments / summary.monthlyIncome) * 100 : 0;
        const months = summary.monthsOfData || 1;

        // Category spending analysis
        const catMonthly = {};
        transactions.filter(t => t.amount < 0 && t.category !== 'Transfers' && !transferTxIds.has(t.id))
            .forEach(t => { catMonthly[t.category] = (catMonthly[t.category] || 0) + Math.abs(t.amount); });
        Object.keys(catMonthly).forEach(k => { catMonthly[k] /= months; });

        const foodMonthly = catMonthly['Food & Dining'] || 0;
        const foodPct = summary.monthlySpending > 0 ? (foodMonthly / summary.monthlySpending) * 100 : 0;
        const subMonthly = (catMonthly['Subscriptions'] || 0) + (catMonthly['Entertainment'] || 0);
        const shoppingMonthly = catMonthly['Shopping'] || 0;
        const transportMonthly = catMonthly['Transport'] || 0;

        // Weekend vs weekday spending
        let weekendSpend = 0, weekdaySpend = 0;
        transactions.filter(t => t.amount < 0 && t.category !== 'Transfers').forEach(t => {
            const d = new Date(t.date).getDay();
            if (d === 0 || d === 6) weekendSpend += Math.abs(t.amount);
            else weekdaySpend += Math.abs(t.amount);
        });
        const weekendMonthly = weekendSpend / months;
        const weekdayMonthly = weekdaySpend / months;
        const weekendPct = (weekendSpend + weekdaySpend) > 0 ? (weekendSpend / (weekendSpend + weekdaySpend)) * 100 : 0;

        // Dining-out vs grocery split
        const groceryWords = ['sobeys', 'food basics', 'walmart', 'costco', 'no frills', 'metro', 'loblaws', 'freshco', 'farm boy', 'superstore', 'grocery'];
        const grocerySpend = transactions.filter(t => t.amount < 0 && t.category === 'Food & Dining' && groceryWords.some(w => t.description.toLowerCase().includes(w))).reduce((s, t) => s + Math.abs(t.amount), 0) / months;
        const diningOutSpend = Math.max(0, foodMonthly - grocerySpend);
        const diningOutPct = foodMonthly > 0 ? (diningOutSpend / foodMonthly) * 100 : 0;

        // Income concentration risk
        const incomeBySource = {};
        transactions.filter(t => t.amount > 0 && t.category !== 'Transfers').forEach(t => {
            const key = t.description.substring(0, 16).trim();
            incomeBySource[key] = (incomeBySource[key] || 0) + t.amount;
        });
        const incomeTotal = Object.values(incomeBySource).reduce((s, v) => s + v, 0);
        const topSourcePct = incomeTotal > 0 ? Math.max(...Object.values(incomeBySource)) / incomeTotal * 100 : 0;

        // Category benchmarks (% of after-tax income): housing 30%, food 15%, transport 15%, savings 20%, discretionary 20%
        const benchmarks = {
            'Food & Dining': { target: 15, warn: 25, label: 'Food & Dining' },
            'Transport': { target: 15, warn: 22, label: 'Transport' },
            'Shopping': { target: 10, warn: 18, label: 'Shopping' },
            'Entertainment': { target: 5, warn: 10, label: 'Entertainment' },
            'Subscriptions': { target: 3, warn: 6, label: 'Subscriptions' },
        };

        // Build diagnosis items
        const diagnoses = [];

        if (savingsRate < 0) {
            diagnoses.push({ severity: 'critical', title: 'Spending Exceeds Income', icon: '🚨',
                detail: `You're spending ${fmt(Math.abs(summary.monthlyNet))}/mo more than you earn. Every month without action increases your deficit. This is the #1 issue to fix.`,
                action: `Cut at least ${fmt(Math.abs(summary.monthlyNet) * 1.1)}/mo immediately. Start with the top 3 discretionary categories — ${Object.entries(catMonthly).filter(([k]) => !['Income','Transfers','Housing','Utilities','Insurance'].includes(k)).sort((a,b) => b[1]-a[1]).slice(0,3).map(([k,v]) => `${k} (${fmt(v)}/mo)`).join(', ')}.`,
                impact: `+${fmt(Math.abs(summary.monthlyNet))}/mo freed`,
            });
        } else if (savingsRate < 5) {
            diagnoses.push({ severity: 'critical', title: 'Near-Zero Savings Rate', icon: '⚠️',
                detail: `${savingsRate.toFixed(1)}% savings rate — you're technically positive but one unexpected expense could put you in deficit.`,
                action: `Automate a transfer of ${fmt(summary.monthlyIncome * 0.05)} on payday before you can spend it. Even 5% builds an emergency fund.`,
                impact: `Goal: reach 10% (${fmt(summary.monthlyIncome * 0.1)}/mo)`,
            });
        } else if (savingsRate < 15) {
            diagnoses.push({ severity: 'warning', title: 'Below-Target Savings Rate', icon: '📉',
                detail: `${savingsRate.toFixed(1)}% savings rate. The 50/30/20 rule targets 20% — you have room to improve.`,
                action: `Find ${fmt(summary.monthlyIncome * 0.05)}/mo in cuts to push toward 20%. Your top cuttable category: ${Object.entries(catMonthly).filter(([k]) => ['Food & Dining','Shopping','Entertainment','Subscriptions'].includes(k)).sort((a,b) => b[1]-a[1])[0]?.[0] || 'discretionary spending'}.`,
                impact: `${fmt(summary.monthlyIncome * 0.05)}/mo extra saved`,
            });
        }

        if (dti > 40) {
            diagnoses.push({ severity: 'critical', title: 'Dangerous Debt-to-Income Ratio', icon: '🚨',
                detail: `${dti.toFixed(1)}% of income goes to debt payments. Above 43% makes you ineligible for most mortgages. This is a financial emergency.`,
                action: `Use the Avalanche strategy (Debts tab) and make one extra payment on your highest-rate debt. Do not take on new debt until below 30%.`,
                impact: `Target: <30% DTI (${fmt(summary.monthlyIncome * 0.3)}/mo max)`,
            });
        } else if (dti > 28) {
            diagnoses.push({ severity: 'warning', title: 'High Debt Burden', icon: '💳',
                detail: `${dti.toFixed(1)}% DTI is above the healthy ceiling of 28%. It limits your ability to save and handle emergencies.`,
                action: `Add just ${fmt(Math.min(100, totalDebtBalance * 0.01))}/mo extra to your highest-rate debt — small amounts compound dramatically.`,
                impact: `Every $100/mo extra cuts payoff time significantly`,
            });
        }

        if (diningOutSpend > 300 && diningOutPct > 60) {
            diagnoses.push({ severity: 'warning', title: 'Dining Out Dominates Food Budget', icon: '🍔',
                detail: `${diningOutPct.toFixed(0)}% of your food budget (${fmt(diningOutSpend)}/mo) goes to restaurants, delivery, and fast food. Groceries: ${fmt(grocerySpend)}/mo.`,
                action: `Meal prep 2-3x per week. Cut dining out to max ${fmt(Math.min(diningOutSpend, 200))}/mo. Saving ${fmt(Math.max(0, diningOutSpend - 200))}/mo.`,
                impact: `Potential savings: ${fmt(Math.max(0, diningOutSpend - 200))}/mo`,
            });
        } else if (foodPct > 25) {
            diagnoses.push({ severity: 'warning', title: 'Elevated Food Spending', icon: '🥡',
                detail: `Food is ${foodPct.toFixed(0)}% of your spending (${fmt(foodMonthly)}/mo). Benchmark is 10–15% of income.`,
                action: `Plan weekly meals, use a grocery list, and limit delivery apps to once per week.`,
                impact: `10% cut = ${fmt(foodMonthly * 0.1)}/mo saved`,
            });
        }

        if (subMonthly > 150) {
            diagnoses.push({ severity: 'warning', title: 'Subscription Overload', icon: '📺',
                detail: `${fmt(subMonthly)}/mo (${fmt(subMonthly * 12)}/yr) on subscriptions and entertainment. Most people use less than half their subscriptions.`,
                action: `List every subscription this week. Cancel any you haven't used in 30 days. Rotate streaming services instead of running them simultaneously.`,
                impact: `Cancelling 2-3 subs = ${fmt(subMonthly * 0.35)}/mo`,
            });
        } else if (subMonthly > 80) {
            diagnoses.push({ severity: 'info', title: 'Subscription Creep Detected', icon: '📡',
                detail: `${fmt(subMonthly)}/mo on subscriptions. Small charges are easy to forget but add up.`,
                action: 'Review your recurring charges list. Even cutting $25/mo = $300/yr.',
                impact: `$300+/yr potential`,
            });
        }

        if (shoppingMonthly > summary.monthlyIncome * 0.15) {
            diagnoses.push({ severity: 'warning', title: 'Shopping Spending High', icon: '🛍️',
                detail: `${fmt(shoppingMonthly)}/mo on shopping — ${((shoppingMonthly / summary.monthlyIncome) * 100).toFixed(0)}% of income. This often signals impulse buying patterns.`,
                action: `Implement a 48-hour rule: wait 2 days before any purchase over $50. Use a wishlist instead of buying immediately.`,
                impact: `20% cut = ${fmt(shoppingMonthly * 0.2)}/mo`,
            });
        }

        if (weekendPct > 50 && weekendMonthly > 500) {
            diagnoses.push({ severity: 'info', title: 'Weekend Spending Pattern', icon: '📅',
                detail: `${weekendPct.toFixed(0)}% of spending happens on weekends (${fmt(weekendMonthly)}/mo Sat-Sun). Social pressure and boredom spending are likely drivers.`,
                action: `Plan low-cost weekend activities in advance. Set a weekly cash "fun budget" and stop when it\'s gone.`,
                impact: `20% cut = ${fmt(weekendMonthly * 0.2)}/mo`,
            });
        }

        if (topSourcePct > 90 && transactions.filter(t => t.amount > 0).length > 10) {
            diagnoses.push({ severity: 'info', title: 'Single Income Source Risk', icon: '⚡',
                detail: `${topSourcePct.toFixed(0)}% of your income comes from one source. Single income dependency is a financial risk.`,
                action: `Consider building a side income stream — even $200-300/mo from freelancing, selling, or passive income provides a buffer.`,
                impact: `+$200/mo side income = major safety net`,
            });
        }

        if (recurringPayments.length > 10) {
            diagnoses.push({ severity: 'info', title: 'High Fixed Commitment Count', icon: '🔒',
                detail: `${recurringPayments.length} recurring charges detected. High fixed costs reduce your financial flexibility and make cutting spending harder.`,
                action: `Identify your bottom 3 recurring charges by value-to-life impact. Cancel at least one this week.`,
                impact: `Each cut improves flexibility`,
            });
        }

        if (diagnoses.length === 0) {
            diagnoses.push({ severity: 'healthy', title: 'Strong Financial Habits', icon: '✅',
                detail: `No major spending problems detected. Your savings rate of ${savingsRate.toFixed(1)}% and DTI of ${dti.toFixed(1)}% are both healthy.`,
                action: `Focus on growing your savings rate toward 25%+ and building 6 months of emergency reserves.`,
                impact: `Next goal: reach 25% savings rate`,
            });
        }

        const severityStyle = {
            critical: { border: 'border-rose-500/30', bg: 'bg-rose-500/[0.07]', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
            warning:  { border: 'border-amber-500/30', bg: 'bg-amber-500/[0.07]', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
            info:     { border: 'border-blue-500/20',  bg: 'bg-blue-500/[0.05]',  badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            healthy:  { border: 'border-emerald-500/30', bg: 'bg-emerald-500/[0.07]', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        };

        const overallHealth = healthScore ? healthScore.score : 0;
        const scoreColor = healthScore ? healthScore.color : '#94a3b8';
        const criticals = diagnoses.filter(d => d.severity === 'critical').length;
        const warnings = diagnoses.filter(d => d.severity === 'warning').length;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="glass-card p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <Stethoscope size={28} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-medium mb-1">Spending Diagnostics</p>
                            <h2 className="text-2xl font-bold text-white">Spend Check</h2>
                            <p className="text-slate-400 text-sm mt-0.5">Deep analysis of your spending habits with specific actions to improve each one.</p>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="relative w-20 h-20">
                                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle cx="40" cy="40" r="32" fill="none" stroke={scoreColor} strokeWidth="8"
                                        strokeDasharray={`${(overallHealth / 100) * 201} 201`} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold text-white">{overallHealth}</span>
                                </div>
                            </div>
                            <span className="text-xs font-semibold" style={{ color: scoreColor }}>{healthScore ? healthScore.label : 'No Data'}</span>
                        </div>
                    </div>
                    {/* Issue summary */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                        {criticals > 0 && <span className="text-xs px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">{criticals} critical issue{criticals > 1 ? 's' : ''}</span>}
                        {warnings > 0 && <span className="text-xs px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full">{warnings} warning{warnings > 1 ? 's' : ''}</span>}
                        {criticals === 0 && warnings === 0 && <span className="text-xs px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">All clear</span>}
                        <span className="text-xs text-slate-500 ml-auto">{summary.months.toFixed(1)} months of data analyzed</span>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="glass-card p-4 text-center">
                        <div className={`text-2xl font-bold font-mono ${savingsRate >= 15 ? 'text-emerald-400' : savingsRate >= 5 ? 'text-amber-400' : 'text-rose-400'}`}>{savingsRate.toFixed(1)}%</div>
                        <div className="text-xs text-slate-400 mt-0.5"><Tip term="Savings Rate">The percentage of your income you keep. Target 15–20%+. This is the single most important number for building wealth.</Tip></div>
                        <div className={`text-[10px] mt-0.5 ${savingsRate >= 15 ? 'text-emerald-600' : 'text-slate-600'}`}>target 20%</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className={`text-2xl font-bold font-mono ${dti < 28 ? 'text-emerald-400' : dti < 40 ? 'text-amber-400' : 'text-rose-400'}`}>{dti.toFixed(1)}%</div>
                        <div className="text-xs text-slate-400 mt-0.5"><Tip term="Debt-to-Income">Monthly debt payments ÷ monthly income. Under 28% is healthy. Above 43% makes it hard to qualify for loans or mortgage.</Tip></div>
                        <div className={`text-[10px] mt-0.5 ${dti < 28 ? 'text-emerald-600' : 'text-slate-600'}`}>target &lt;28%</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className={`text-2xl font-bold font-mono ${foodPct < 20 ? 'text-emerald-400' : foodPct < 30 ? 'text-amber-400' : 'text-rose-400'}`}>{foodPct.toFixed(0)}%</div>
                        <div className="text-xs text-slate-400 mt-0.5">Food % of Spend</div>
                        <div className={`text-[10px] mt-0.5 ${foodPct < 20 ? 'text-emerald-600' : 'text-slate-600'}`}>target &lt;15%</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className={`text-2xl font-bold font-mono ${recurringPayments.length <= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>{recurringPayments.length}</div>
                        <div className="text-xs text-slate-400 mt-0.5"><Tip term="Recurring Charges">Subscriptions and bills that charge monthly. Subscription creep is common — most people have more than they realize.</Tip></div>
                        <div className={`text-[10px] mt-0.5 ${recurringPayments.length <= 10 ? 'text-emerald-600' : 'text-slate-600'}`}>&lt;10 ideal</div>
                    </div>
                </div>

                {/* Category Breakdown Table */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-cyan-400" /> Category Spending vs Benchmarks</h3>
                    <div className="space-y-3">
                        {Object.entries(catMonthly).filter(([k]) => !['Income','Transfers','Debt Payments'].includes(k) && catMonthly[k] > 10)
                            .sort((a, b) => b[1] - a[1]).slice(0, 10).map(([cat, monthly], i) => {
                            const pctOfIncome = summary.monthlyIncome > 0 ? (monthly / summary.monthlyIncome) * 100 : 0;
                            const bench = benchmarks[cat];
                            const isHigh = bench && pctOfIncome > bench.warn;
                            const isWarn = bench && pctOfIncome > bench.target;
                            const barColor = isHigh ? '#ef4444' : isWarn ? '#f59e0b' : '#0ecb81';
                            const catColor = CATEGORIES.find(c => c.name === cat)?.color || '#94a3b8';
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-300 w-28 shrink-0 truncate">{cat}</span>
                                    <div className="flex-1 h-2 bg-slate-700/40 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pctOfIncome * 3)}%`, background: barColor }} />
                                    </div>
                                    <span className="text-xs font-mono text-white w-16 text-right shrink-0">{fmt(monthly)}/mo</span>
                                    <span className={`text-[10px] w-10 text-right shrink-0 ${isHigh ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-slate-500'}`}>{pctOfIncome.toFixed(0)}%</span>
                                    {isHigh && <span className="text-[10px] text-rose-400 shrink-0">↑ high</span>}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-3">% of monthly income · benchmarks based on 50/30/20 rule — needs / wants / savings · <span className="text-rose-400">red = above guideline</span>, <span className="text-amber-400">amber = approaching</span>, <span className="text-emerald-500">green = healthy</span></p>
                </div>

                {/* Diagnosis Cards */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Stethoscope size={14} className="text-emerald-400" /> Diagnosis & Prescription
                    </h3>
                    {diagnoses.map((d, i) => {
                        const s = severityStyle[d.severity];
                        return (
                            <div key={i} className={`glass-card border ${s.border} ${s.bg} p-5`}>
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-xl leading-none mt-0.5 shrink-0">{d.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h4 className="font-semibold text-white text-sm">{d.title}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border ${s.badge}`}>{d.severity}</span>
                                        </div>
                                        <p className="text-slate-400 text-xs leading-relaxed">{d.detail}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.05]">
                                    <div>
                                        <p className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1 font-medium">Action</p>
                                        <p className="text-xs text-slate-300 leading-relaxed">{d.action}</p>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="text-[10px] text-cyan-400 uppercase tracking-wider mb-1 font-medium">Potential Impact</p>
                                        <p className="text-sm font-semibold text-white">{d.impact}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recurring charges audit */}
                {recurringPayments.length > 0 && (
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Repeat size={14} className="text-violet-400" /> Recurring Charges — Full Audit</h3>
                            <span className="text-xs font-mono text-rose-400">{fmt(recurringPayments.reduce((s, r) => s + r.avgAmount, 0))}/mo · {fmt(recurringPayments.reduce((s, r) => s + r.avgAmount * 12, 0))}/yr</span>
                        </div>
                        <div className="space-y-2">
                            {recurringPayments.map((rp, i) => {
                                const typeStyle = rp.type === 'Subscription' ? 'bg-violet-500/20 text-violet-300 border-violet-500/20' : rp.type === 'Fixed Bill' ? 'bg-blue-500/20 text-blue-300 border-blue-500/20' : 'bg-amber-500/20 text-amber-300 border-amber-500/20';
                                return (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${typeStyle}`}>{rp.type}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm text-slate-200 truncate">{rp.merchant}</p>
                                                <p className="text-[10px] text-slate-500">{rp.frequency} · {rp.occurrences} payments detected</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="font-mono text-sm text-rose-400">{fmt(rp.avgAmount)}/mo</p>
                                            <p className="text-[10px] text-slate-500">{fmt(rp.avgAmount * 12)}/yr</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Weekend vs Weekday spending */}
                {(weekendMonthly > 0 || weekdayMonthly > 0) && (
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Calendar size={14} className="text-amber-400" /> Spending Patterns — When You Spend</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                                <p className="text-2xl font-bold font-mono text-amber-400">{fmt(weekdayMonthly)}</p>
                                <p className="text-xs text-slate-400 mt-0.5">Weekdays (Mon–Fri)</p>
                                <p className="text-[10px] text-slate-500">{(100 - weekendPct).toFixed(0)}% of total</p>
                            </div>
                            <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                                <p className="text-2xl font-bold font-mono text-violet-400">{fmt(weekendMonthly)}</p>
                                <p className="text-xs text-slate-400 mt-0.5">Weekends (Sat–Sun)</p>
                                <p className="text-[10px] text-slate-500">{weekendPct.toFixed(0)}% of total</p>
                            </div>
                        </div>
                        {weekendPct > 45 && <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">Weekend spending is elevated. Social outings, impulse purchases, and entertainment tend to cluster here. Consider setting a weekend cash limit.</p>}
                    </div>
                )}
            </div>
        );
    };

    /* ═══════════════════════════════════════
       RENDER — NET WORTH TAB
       ═══════════════════════════════════════ */
    const NW_TYPES = { cash: { label: 'Cash / Savings', color: '#0ecb81' }, investment: { label: 'Investments', color: '#3b82f6' }, property: { label: 'Real Estate', color: '#f59e0b' }, vehicle: { label: 'Vehicle', color: '#8b5cf6' }, other: { label: 'Other Asset', color: '#64748b' } };

    const renderNetWorth = () => {
        const isPositive = netWorth.total >= 0;
        const allAssets = [
            ...nwAssets.map(a => ({ name: a.name, value: Number(a.value), typeLabel: NW_TYPES[a.type]?.label || a.type, color: NW_TYPES[a.type]?.color || '#64748b', isLiability: false })),
            ...Object.entries(accountBalances).filter(([, v]) => Number(v) !== 0).map(([id, v]) => {
                const acc = accounts.find(a => a.id === id);
                const isCred = acc?.accountType === 'credit';
                return { name: acc?.accountName || 'Account', value: Number(v), typeLabel: isCred ? 'Credit Card' : 'Bank Account', color: isCred ? '#ef4444' : '#0ecb81', isLiability: isCred && Number(v) > 0 };
            }),
            ...debts.map(d => ({ name: d.name, value: -(Number(d.amount) || 0), typeLabel: 'Debt', color: '#ef4444', isLiability: true })),
        ];
        const pieData = Object.entries(NW_TYPES).map(([k, v]) => {
            const total = nwAssets.filter(a => a.type === k).reduce((s, a) => s + (Number(a.value) || 0), 0);
            return total > 0 ? { name: v.label, value: total, color: v.color } : null;
        }).filter(Boolean);

        return (
            <div className="space-y-6 animate-fade-in">
                {/* Hero */}
                <div className="glass-card p-8 text-center">
                    <p className="text-sm text-slate-400 mb-2">Total Net Worth</p>
                    <p className={`text-5xl font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{fmt(netWorth.total)}</p>
                    <p className="text-xs text-slate-500 mt-2">Assets − Liabilities = Net Worth</p>
                    <div className="flex justify-center gap-8 mt-6">
                        <div>
                            <p className="text-xs text-slate-400">Assets</p>
                            <p className="font-mono text-emerald-400 font-semibold">{fmt(netWorth.assetTotal + netWorth.balTotal)}</p>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div>
                            <p className="text-xs text-slate-400">Liabilities</p>
                            <p className="font-mono text-rose-400 font-semibold">{fmt(netWorth.debtTotal)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Asset breakdown */}
                    <div className="glass-card p-6">
                        <h3 className="text-base font-semibold text-white mb-4">Assets & Liabilities</h3>
                        <div className="space-y-2 mb-4">
                            {allAssets.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No assets added yet. Add accounts on the Transactions tab, debts on the Debts tab, and manual assets below.</p>
                            ) : allAssets.map((a, i) => (
                                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm text-slate-200">{a.name}</p>
                                        <p className="text-[10px]" style={{ color: a.color }}>{a.typeLabel}</p>
                                    </div>
                                    <span className={`font-mono text-sm font-medium ${a.isLiability || a.value < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{fmt(a.value)}</span>
                                </div>
                            ))}
                        </div>
                        {pieData.length > 0 && (
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={70} paddingAngle={2}>
                                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => fmt(v)} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Add manual asset */}
                    <div className="glass-card p-6">
                        <h3 className="text-base font-semibold text-white mb-4">Add Manual Asset</h3>
                        <p className="text-xs text-slate-500 mb-4">Add assets not tracked via bank accounts — property, investments, vehicles, etc.</p>
                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Asset Name</label>
                                <input value={nwAssetForm.name} onChange={e => setNwAssetForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Condo, RRSP Account, 2019 Honda Civic"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Current Value ($)</label>
                                    <input type="number" value={nwAssetForm.value} onChange={e => setNwAssetForm(f => ({ ...f, value: e.target.value }))} placeholder="250000"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Type</label>
                                    <select value={nwAssetForm.type} onChange={e => setNwAssetForm(f => ({ ...f, type: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50">
                                        {Object.entries(NW_TYPES).map(([k, v]) => <option key={k} value={k} className="bg-[#0c0e18]">{v.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={addNwAsset}
                                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white text-sm font-medium transition-all">
                                Add Asset
                            </button>
                        </div>

                        {nwAssets.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-slate-400 font-medium">Manual Assets</p>
                                {nwAssets.map(a => (
                                    <div key={a.id} className="flex items-center justify-between py-1.5 px-2 bg-white/[0.02] rounded-lg border border-white/5">
                                        <div>
                                            <p className="text-sm text-slate-200">{a.name}</p>
                                            <p className="text-[10px] text-slate-500">{NW_TYPES[a.type]?.label}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm text-emerald-400">{fmt(a.value)}</span>
                                            <button onClick={() => removeNwAsset(a.id)} className="text-slate-600 hover:text-rose-400 transition-colors"><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /* ═══════════════════════════════════════
       MAIN LAYOUT
       ═══════════════════════════════════════ */
    return (
        <div className="app-shell">
            <GalaxyBackground />
            {/* ── SIDEBAR ── */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-mark">
                        <DollarSign size={14} className="text-black" strokeWidth={2.8} />
                    </div>
                    <div>
                        <div className="wordmark">Recovery</div>
                        <div className="wordmark-sub">Finance OS</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}>
                            <tab.icon size={14} strokeWidth={activeTab === tab.id ? 2.2 : 1.7} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {transactions.length > 0 && (
                        <div className="sidebar-stats">
                            <div className="sidebar-stat-row">
                                <span className="sidebar-stat-label">Income</span>
                                <span className="sidebar-stat-val income">{fmtShort(summary.monthlyIncome)}</span>
                            </div>
                            <div className="sidebar-stat-row">
                                <span className="sidebar-stat-label">Spent</span>
                                <span className="sidebar-stat-val expense">{fmtShort(summary.monthlySpending)}</span>
                            </div>
                            <div className="sidebar-stat-divider" />
                            <div className="sidebar-stat-row">
                                <span className="sidebar-stat-label">Net</span>
                                <span className={`sidebar-stat-val ${summary.monthlyNet >= 0 ? 'income' : 'expense'}`}>
                                    {summary.monthlyNet >= 0 ? '+' : ''}{fmtShort(summary.monthlyNet)}
                                </span>
                            </div>
                        </div>
                    )}
                    <button onClick={() => setShowProfilesModal(true)} className="sidebar-action">
                        <User size={13} /><span>Sessions</span>
                    </button>
                    {transactions.length > 0 && (
                        <button onClick={clearAllData} className="sidebar-action danger">
                            <X size={13} /><span>Clear All</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* ── MAIN COLUMN ── */}
            <div className="main-col">
                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-page-title">
                        {TABS.find(t => t.id === activeTab)?.label}
                    </div>
                    {transactions.length > 0 && (
                        <div className="topbar-right">
                            <span className="status-pill status-pill-income">
                                <span className="pulse-dot" />
                                {fmt(summary.monthlyIncome)}<span className="pill-sub">/mo</span>
                            </span>
                            <span className="status-pill status-pill-expense">
                                {fmt(summary.monthlySpending)}<span className="pill-sub">/mo</span>
                            </span>
                            {summary.monthlyNet !== 0 && (
                                <span className={`status-pill ${summary.monthlyNet >= 0 ? 'status-pill-income' : 'status-pill-expense'}`}>
                                    {summary.monthlyNet >= 0 ? '+' : ''}{fmt(summary.monthlyNet)}<span className="pill-sub">/mo net</span>
                                </span>
                            )}
                        </div>
                    )}
                </header>

                {/* Page content */}
                <main className="page-content" key={activeTab}>
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'transactions' && renderTransactions()}
                    {activeTab === 'debts' && renderDebts()}
                    {activeTab === 'savings' && renderSavings()}
                    {activeTab === 'networth' && renderNetWorth()}
                    {activeTab === 'advisor' && renderAdvisor()}
                    {activeTab === 'doctor' && renderDoctor()}
                    {activeTab === 'recovery' && renderRecovery()}
                </main>
            </div>

            {/* Onboarding */}
            {!onboardingDone && transactions.length === 0 && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-lg animate-fade-in">
                    <div className="glass-card glass-card-premium max-w-lg w-full mx-4 p-8 space-y-6 animate-scale-spring">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: '#0ecb81' }}>
                                <DollarSign size={26} className="text-black" strokeWidth={2.8} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Financial Recovery</h2>
                            <p className="text-slate-400 text-sm">Your private, local-first financial dashboard. No accounts. No cloud. Your data stays on your device.</p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { icon: '📂', title: 'Upload your bank CSV', desc: 'Export from your bank website and drag-drop into the Transactions tab. Supports TD Bank and standard CSV formats.' },
                                { icon: '🧪', title: 'Or try demo data first', desc: '12 months of realistic synthetic transactions load instantly so you can explore every feature without real data.' },
                                { icon: '💳', title: 'Add your debts', desc: 'Enter balances and interest rates on the Debts tab to get Avalanche vs Snowball payoff strategies.' },
                                { icon: '🎯', title: 'Set savings goals', desc: 'Track Emergency Fund, vacation savings, and more on the Savings Plan tab with progress bars.' },
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                    <span className="text-2xl shrink-0">{step.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-white">{step.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setOnboardingDone(true); loadDemoData(); }}
                                className="flex-1 py-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-xl text-violet-300 text-sm font-medium transition-all">
                                🧪 Try Demo Data
                            </button>
                            <button onClick={() => { setOnboardingDone(true); setActiveTab('transactions'); }}
                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white text-sm font-medium transition-all">
                                Upload My CSV →
                            </button>
                        </div>
                        <button onClick={() => setOnboardingDone(true)} className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors">Skip — I'll figure it out</button>
                    </div>
                </div>
            )}

            {/* v3: Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
                    <div className="glass-card glass-card-premium p-6 max-w-sm w-full mx-4 space-y-4 animate-scale-spring">
                        <p className="text-white text-sm">{showConfirm.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowConfirm(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                            <button onClick={showConfirm.onConfirm} className="px-4 py-2 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Ghost Manual Entry Modal ── */}
            {ghostManualModal && (() => {
                const { item } = ghostManualModal;
                const isDebtType = ['credit', 'loc', 'mortgage', 'vehicle'].includes(item.accountType);
                const isIncomeType = item.accountType === 'rental';
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
                        <div className="glass-card p-6 max-w-sm w-full mx-4 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <h2 className="text-sm font-semibold text-white">{item.label}</h2>
                                        <p className="text-[10px] text-slate-500">{item.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => setGhostManualModal(null)} className="text-slate-500 hover:text-white"><X size={15} /></button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Account Name</label>
                                    <input value={ghostManualForm.name} onChange={e => setGhostManualForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder={item.label}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">
                                        {isDebtType ? 'Outstanding Balance ($)' : isIncomeType ? 'Monthly Income ($)' : 'Current Balance ($)'}
                                    </label>
                                    <input type="number" value={ghostManualForm.balance} onChange={e => setGhostManualForm(f => ({ ...f, balance: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono" />
                                </div>
                                {isDebtType && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Interest Rate (%)</label>
                                            <input type="number" value={ghostManualForm.interestRate} onChange={e => setGhostManualForm(f => ({ ...f, interestRate: e.target.value }))}
                                                placeholder="e.g. 19.99"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Monthly Payment ($)</label>
                                            <input type="number" value={ghostManualForm.monthlyPayment} onChange={e => setGhostManualForm(f => ({ ...f, monthlyPayment: e.target.value }))}
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono" />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Notes <span className="normal-case text-slate-600">(optional)</span></label>
                                    <input value={ghostManualForm.notes} onChange={e => setGhostManualForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="e.g. TD Bank, account ending in 1234"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                </div>
                            </div>

                            {isDebtType && ghostManualForm.balance && (
                                <p className="text-[10px] text-sky-400">This will also be added to your Debts tab automatically.</p>
                            )}

                            <div className="flex gap-2">
                                <button onClick={submitGhostManual}
                                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white text-sm font-medium transition-all">
                                    Save Account
                                </button>
                                <button onClick={() => setGhostManualModal(null)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-sm transition-all">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── CSV Trust Modal ── */}
            {pendingUpload && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card p-7 max-w-md w-full mx-4 space-y-5">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-white">Where is this file from?</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    {pendingUpload.files.length === 1
                                        ? `1 file: ${pendingUpload.files[0].name}`
                                        : `${pendingUpload.files.length} files selected`}
                                    {pendingUpload.forcedType && (
                                        <span className="ml-2 text-violet-400">→ will be tagged as <strong>{ACCOUNT_TYPES[pendingUpload.forcedType]?.label}</strong></span>
                                    )}
                                </p>
                            </div>
                            <button onClick={() => setPendingUpload(null)} className="text-slate-500 hover:text-white mt-0.5"><X size={16} /></button>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {/* Trusted bank option */}
                            <button
                                className="w-full text-left p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group"
                                onClick={() => { handleFiles(pendingUpload.files, true, pendingUpload.forcedType); setPendingUpload(null); }}>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl mt-0.5">🏦</span>
                                    <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">Exported directly from my bank</p>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">TD, RBC, Scotiabank, BMO, CIBC, or any official bank export. Every row imported with 100% accuracy — no rows skipped, no guessing.</p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {['TD', 'RBC', 'Scotiabank', 'BMO', 'CIBC', 'Tangerine', 'EQ Bank', 'Other bank'].map(b => (
                                                <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Untrusted option */}
                            <button
                                className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
                                onClick={() => { handleFiles(pendingUpload.files, false, pendingUpload.forcedType); setPendingUpload(null); }}>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl mt-0.5">📄</span>
                                    <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-slate-200 transition-colors">Not sure / exported from another tool</p>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Mint, spreadsheet, third-party app, or manual export. Duplicate checking applied — only exact matches already in the same account will be skipped.</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <p className="text-[10px] text-slate-600 text-center">Bank exports are authoritative — same merchant same day = real separate transactions, not duplicates.</p>
                    </div>
                </div>
            )}

            {/* ── SESSION PROFILES MODAL ── */}
            {showProfilesModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={() => setShowProfilesModal(false)}>
                    <div className="glass-card glass-card-premium w-full max-w-md mx-4 p-6 space-y-5 animate-scale-spring" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">Saved Sessions</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Save your data locally by name — switch between profiles anytime</p>
                            </div>
                            <button onClick={() => setShowProfilesModal(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                        </div>

                        {/* Save current */}
                        <div>
                            <p className="text-xs text-slate-400 mb-2 font-medium">Save current session</p>
                            <div className="flex gap-2">
                                <input value={profileName} onChange={e => setProfileName(e.target.value)}
                                    placeholder="e.g. My Finances 2026"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
                                <button onClick={() => {
                                    if (!profileName.trim()) return;
                                    const data = { transactions, accounts, debts, startingBalance, accountBalances, categoryBudgets, merchantOverrides, savingsGoals, nwAssets, txNotes };
                                    saveProfile(profileName.trim(), data);
                                    setProfiles(loadProfiles());
                                    setProfileName('');
                                }} className="btn-primary text-white px-4 text-sm">Save</button>
                            </div>
                        </div>

                        {/* Saved profiles list */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {Object.keys(profiles).length === 0 ? (
                                <p className="text-center text-slate-600 text-sm py-6">No saved sessions yet</p>
                            ) : Object.entries(profiles).map(([name, prof]) => (
                                <div key={name} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{name}</p>
                                        <p className="text-[10px] text-slate-500">{new Date(prof.savedAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {(prof.transactions || []).length} transactions</p>
                                    </div>
                                    <button onClick={() => {
                                        if (prof.transactions) setTransactions(prof.transactions);
                                        if (prof.accounts) setAccounts(prof.accounts);
                                        if (prof.debts) setDebts(prof.debts);
                                        if (prof.startingBalance !== undefined) setStartingBalance(prof.startingBalance);
                                        if (prof.accountBalances) setAccountBalances(prof.accountBalances);
                                        if (prof.categoryBudgets) setCategoryBudgets(prof.categoryBudgets);
                                        if (prof.merchantOverrides) setMerchantOverrides(prof.merchantOverrides);
                                        if (prof.savingsGoals) setSavingsGoals(prof.savingsGoals);
                                        if (prof.nwAssets) setNwAssets(prof.nwAssets);
                                        setShowProfilesModal(false);
                                    }} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all">Load</button>
                                    <button onClick={() => { deleteProfile(name); setProfiles(loadProfiles()); }}
                                        className="text-slate-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>

                        {/* Export / Import */}
                        <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                            <button onClick={() => {
                                const data = { transactions, accounts, debts, startingBalance, accountBalances, categoryBudgets, merchantOverrides, savingsGoals, nwAssets, txNotes, exportedAt: new Date().toISOString() };
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = `financial-recovery-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
                            }} className="text-xs py-2 px-3 bg-white/[0.03] border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5">
                                <FileText size={12} /> Export JSON backup
                            </button>
                            <label className="text-xs py-2 px-3 bg-white/[0.03] border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                                <Upload size={12} /> Import JSON backup
                                <input type="file" accept=".json" className="hidden" onChange={(e) => {
                                    const file = e.target.files?.[0]; if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        try {
                                            const data = JSON.parse(ev.target.result);
                                            if (data.transactions) setTransactions(data.transactions);
                                            if (data.accounts) setAccounts(data.accounts);
                                            if (data.debts) setDebts(data.debts);
                                            if (data.startingBalance !== undefined) setStartingBalance(data.startingBalance);
                                            if (data.accountBalances) setAccountBalances(data.accountBalances);
                                            if (data.merchantOverrides) setMerchantOverrides(data.merchantOverrides);
                                            if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
                                            if (data.nwAssets) setNwAssets(data.nwAssets);
                                            setShowProfilesModal(false);
                                        } catch(err) { alert('Invalid JSON file'); }
                                    };
                                    reader.readAsText(file);
                                    e.target.value = '';
                                }} />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
