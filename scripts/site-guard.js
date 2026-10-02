(function () {
    const modalId = 'site-nav-guard-modal';
    let active = true;

    function ensureModal() {
        let modal = document.getElementById(modalId);
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = modalId;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-live', 'assertive');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.background = 'rgba(0, 0, 0, 0.72)';
        modal.style.display = 'none';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '2147483647';

        modal.innerHTML = `
            <div style="
                max-width: 420px;
                background: #fff;
                border-radius: 18px;
                box-shadow: 0 18px 45px rgba(0,0,0,0.25);
                padding: 28px 22px;
                text-align: center;
                font-family: Arial, sans-serif;
                color: #1f2937;
            ">
                <div style="font-size: 30px; margin-bottom: 12px;">⚠️</div>
                <h2 style="margin: 0 0 12px; font-size: 28px; color: #d33b3b;">עצור!</h2>
                <p style="margin: 0 0 18px; font-size: 18px; line-height: 1.5;">המשחק עדיין בעיצומו.</p>
                <p style="margin: 0 0 20px; font-size: 18px; line-height: 1.5;">אם תעזוב כעת, ההתקדמות עלולה להימחק.</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button type="button" data-action="stay" style="flex: 1; border: none; border-radius: 10px; background: #2563eb; color: white; padding: 12px 16px; font-size: 16px; font-weight: 700; cursor: pointer;">המשך משחק</button>
                    <button type="button" data-action="leave" style="flex: 1; border: none; border-radius: 10px; background: #dc2626; color: white; padding: 12px 16px; font-size: 16px; font-weight: 700; cursor: pointer;">עזוב</button>
                </div>
            </div>
        `;

        modal.querySelector('[data-action="stay"]').addEventListener('click', function () {
            modal.style.display = 'none';
        });

        modal.querySelector('[data-action="leave"]').addEventListener('click', function () {
            active = false;
            modal.style.display = 'none';
            if (window.history.length > 1) {
                window.history.back();
            } else {
                try { window.close(); } catch (e) {}
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    function showModal() {
        const modal = ensureModal();
        modal.style.display = 'flex';
    }

    function hideModal() {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }

    function enableGuard() {
        active = true;
    }

    function disableGuard() {
        active = false;
        hideModal();
    }

    window.siteGuardEnable = enableGuard;
    window.siteGuardDisable = disableGuard;

    window.addEventListener('beforeunload', function (event) {
        if (active) {
            event.preventDefault();
            event.returnValue = 'המשחק עדיין בעיצומו. האם ברצונך לעזוב?';
            return 'המשחק עדיין בעיצומו. האם ברצונך לעזוב?';
        }
    });

    window.addEventListener('popstate', function (event) {
        if (active) {
            event.preventDefault();
            showModal();
            window.history.pushState(null, '', window.location.href);
        }
    });

    window.addEventListener('pageshow', function () {
        window.history.pushState(null, '', window.location.href);
    });

    document.addEventListener('touchmove', function (event) {
        if (active && (window.scrollY === 0 || document.documentElement.scrollTop === 0)) {
            event.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('visibilitychange', function () {
        if (document.hidden && active) {
            // Keep the game active and protected while the tab is in the background on mobile devices.
        }
    });

    ensureModal();
})();
