import { FractalTree } from './fractal-tree.js';
import { PocketWatch, ReversePocketWatch, StoppedPocketWatch } from './pocket-watches.js';

let fractalTree;

const setupScrollEffects = () => {
    const heroSection = document.getElementById('heroSection');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const viewportHeight = window.innerHeight;

                if (fractalTree) {
                    let newDepth;
                    if (scrollY <= viewportHeight * 0.11) {
                        newDepth = 1;
                    } else if (scrollY <= viewportHeight * 0.22) {
                        newDepth = 2;
                    } else {
                        newDepth = 3;
                    }
                    fractalTree.heroDepth = newDepth;
                }

                heroSection.classList.remove('blur-light', 'blur-medium');

                if (scrollY <= viewportHeight * 0.11) {
                } else if (scrollY <= viewportHeight * 0.22) {
                    heroSection.classList.add('blur-light');
                } else {
                    heroSection.classList.add('blur-medium');
                }

                ticking = false;
            });
            ticking = true;
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    fractalTree = new FractalTree('treeCanvas');
    new PocketWatch();
    new StoppedPocketWatch();
    new ReversePocketWatch();
});

window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.classList.add('hidden');
    setupScrollEffects();
});
