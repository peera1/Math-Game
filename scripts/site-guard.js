(function () {
    const EXIT_MESSAGE = 'המשחק עדיין בעיצומו. האם ברצונך לעזוב?';
    const state = { startedAt: new Date(), endedAt: null, enabled: true };

    function formatDateTime(value) {
        const date = value instanceof Date ? value : new Date(value || Date.now());
        if (Number.isNaN(date.getTime())) return 'לא זמין';
        return date.toLocaleString('he-IL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }

    function getSummaryElement() {
        return document.querySelector('#summary, .summary, [id*="summary"]');
    }

    function summaryVisible() {
        const summary = getSummaryElement();
        if (!summary) return false;
        const hidden = summary.classList.contains('hidden');
        const displayNone = window.getComputedStyle(summary).display === 'none';
        return !hidden && !displayNone;
    }

    function getQuestionRows() {
        const sources = [
            window.questionDetails,
            window.results,
            window.times,
            window.__mathGameQuestionDetails,
            window.__mathGameTimes,
            window.summaryRows
        ];

        const rows = [];
        for (const source of sources) {
            if (!Array.isArray(source)) continue;
            for (const item of source) {
                if (!item || typeof item !== 'object') continue;
                const question = item.question || item.problem || item.expression || item.exercise || item.text || item.challenge || `שאלה ${rows.length + 1}`;
                const answer = item.answer ?? item.userAnswer ?? item.correctAnswer ?? item.response ?? item.result ?? '';
                const time = Number(item.time ?? item.duration ?? item.seconds ?? item.elapsed ?? item.timeSpent ?? 0);
                rows.push({
                    question: String(question),
                    answer: answer === null || answer === undefined ? '' : String(answer),
                    time: Number.isFinite(time) ? time : 0
                });
            }
        }

        if (!rows.length) {
            const summaryBody = document.getElementById('summary-body');
            if (summaryBody) {
                const rowNodes = summaryBody.querySelectorAll('tr');
                rowNodes.forEach((row, index) => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 4) {
                        rows.push({
                            question: cells[1] ? cells[1].textContent.trim() : `שאלה ${index + 1}`,
                            answer: cells[2] ? cells[2].textContent.trim() : '',
                            time: Number(cells[3] ? cells[3].textContent.trim().replace(/[^0-9.]/g, '') : 0) || 0
                        });
                    }
                });
            }
        }

        return rows;
    }

    function injectSummaryMetrics() {
        const summary = getSummaryElement();
        if (!summary) return;
        if (summary.classList.contains('hidden') || window.getComputedStyle(summary).display === 'none') return;

        let metricsNode = summary.querySelector('#game-time-metrics');
        if (!metricsNode) {
            metricsNode = document.createElement('div');
            metricsNode.id = 'game-time-metrics';
            metricsNode.style.margin = '22px 0';
            metricsNode.style.padding = '18px';
            metricsNode.style.border = '2px solid #cfe2ff';
            metricsNode.style.borderRadius = '12px';
            metricsNode.style.background = '#f3f8ff';
            metricsNode.style.color = '#1f2937';
            metricsNode.style.fontSize = '18px';
            metricsNode.style.lineHeight = '1.8';
            metricsNode.style.textAlign = 'right';
            summary.insertBefore(metricsNode, summary.firstChild);
        }

        const startTime = window.__mathGameStartTime || state.startedAt;
        const endTime = window.__mathGameEndTime || new Date();
        const rows = getQuestionRows();

        const questionRows = rows.length ? rows.map((row, index) => `
            <tr>
                <td style="border:1px solid #cbd5e1; padding:8px 10px; text-align:center;">${index + 1}</td>
                <td style="border:1px solid #cbd5e1; padding:8px 10px; text-align:center;">${row.question}</td>
                <td style="border:1px solid #cbd5e1; padding:8px 10px; text-align:center;">${Number(row.time || 0)} שניות</td>
            </tr>
        `).join('') : '<tr><td colspan="3" style="padding:10px; text-align:center;">אין נתוני זמן לשאלות</td></tr>';

        metricsNode.innerHTML = `
            <div style="font-weight:700; color:#1d4ed8; margin-bottom:10px;">⏱️ תיעוד זמן המשחק</div>
            <div><strong>שעת התחלה:</strong> ${formatDateTime(startTime)}</div>
            <div><strong>שעת סיום:</strong> ${formatDateTime(endTime)}</div>
            <div style="margin-top:12px;">
                <table style="width:100%; border-collapse:collapse; background:#fff; margin-top:8px;">
                    <thead>
                        <tr>
                            <th style="border:1px solid #cbd5e1; background:#dbeafe; padding:10px; text-align:center;">שאלה</th>
                            <th style="border:1px solid #cbd5e1; background:#dbeafe; padding:10px; text-align:center;">התרגיל</th>
                            <th style="border:1px solid #cbd5e1; background:#dbeafe; padding:10px; text-align:center;">זמן</th>
                        </tr>
                    </thead>
                    <tbody>${questionRows}</tbody>
                </table>
            </div>
        `;
    }

    function updateState() {
        const shown = summaryVisible();
        state.enabled = !shown;
        if (shown) {
            state.endedAt = new Date();
            window.__mathGameEndTime = state.endedAt;
        }
        if (!window.__mathGameStartTime) {
            window.__mathGameStartTime = state.startedAt;
        }
    }

    function attachGuard() {
        window.addEventListener('beforeunload', function (event) {
            if (!state.enabled) return;
            event.preventDefault();
            event.returnValue = EXIT_MESSAGE;
            return EXIT_MESSAGE;
        });

        const observer = new MutationObserver(function () {
            updateState();
            injectSummaryMetrics();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'hidden']
        });
    }

    window.__mathGameStartTime = state.startedAt;
    window.__mathGameEndTime = state.endedAt;
    attachGuard();
    document.addEventListener('DOMContentLoaded', function () {
        updateState();
        injectSummaryMetrics();
    });
})();
