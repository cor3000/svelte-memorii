import { cubicOut, cubicInOut } from 'svelte/easing';

const dirs: Object = {
     top: 'translateY(-',
     bottom: 'translateY(',
     left: 'translateX(-',
     right: 'translateX(',
};
export const fly = function (node: HTMLElement, params) {
    const from  = params.from || 'top';
    return {
        delay: params.delay || 0,
        duration: params.duration || 400,
        easing: params.easing || cubicInOut,
        tick: (t: number, u: number) => {
            node.style.setProperty('transform', `${dirs[from]}${u * 100.0}%)`);
            node.style.setProperty('opacity', `${t}`);
        }
    }
};
export const fade = function (node: HTMLElement, params) {
    return {
        delay: params.delay || 0,
        duration: params.duration || 400,
        easing: params.easing || cubicInOut,
        tick: (t: number, u: number) => {
            node.style.setProperty('opacity', `${t}`);
        }
    }
};
export const scale = function (node: HTMLElement, params) {
    const start  = params.start || 0;
    return {
        delay: params.delay || 0,
        duration: params.duration || 400,
        easing: params.easing || cubicInOut,
        tick: (t: number, u: number) => {
            node.style.setProperty('transform', `scale(${u * start + t})`);
        }
    }
};
