NEW_FILE_CODE
/**
 * 公共脚本 - 主题切换和回到顶部功能
 */

(function() {
    'use strict';

    // 主题切换功能
    function initThemeToggle() {
        const modeToggle = document.getElementById('modeToggle');
        if (!modeToggle) return;

        const modeText = modeToggle.querySelector('.mode-text');
        const modeIcon = modeToggle.querySelector('i');
        const body = document.body;
        const savedMode = localStorage.getItem('themeMode');

        // 初始化主题
        if (savedMode === 'light') {
            body.classList.add('light-mode');
            updateModeUI(modeText, modeIcon, 'light');
        }

        // 切换事件
        modeToggle.addEventListener('click', () => {
            const isLight = body.classList.contains('light-mode');
            
            if (isLight) {
                body.classList.remove('light-mode');
                updateModeUI(modeText, modeIcon, 'dark');
                localStorage.setItem('themeMode', 'dark');
            } else {
                body.classList.add('light-mode');
                updateModeUI(modeText, modeIcon, 'light');
                localStorage.setItem('themeMode', 'light');
            }
        });
    }

    // 更新主题UI
    function updateModeUI(modeText, modeIcon, mode) {
        if (mode === 'light') {
            modeText.textContent = '深色模式';
            modeIcon.classList.replace('fa-sun', 'fa-moon');
        } else {
            modeText.textContent = '浅色模式';
            modeIcon.classList.replace('fa-moon', 'fa-sun');
        }
    }

    // 回到顶部功能
    function initBackToTop() {
        const backToTop = document.getElementById('backToTop');
        if (!backToTop) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 300) {
                        backToTop.classList.add('active');
                    } else {
                        backToTop.classList.remove('active');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initBackToTop();
    });
})();