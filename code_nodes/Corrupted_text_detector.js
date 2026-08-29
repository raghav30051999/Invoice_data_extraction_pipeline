const items = $input.all();

function corruptionScore(t) {
    if (!t) return 999;

    const badPatterns = [
        "à°",
        "à±",
        "Ē",
        "÷",
        "Á",
        "Ƿ",
        "�"
    ];

    let score = 0;

    for (const p of badPatterns) {
        if (t.includes(p)) {
            score += 2;
        }
    }

    let suspicious = 0;

    for (const ch of t) {
        const code = ch.charCodeAt(0);

        if (
            code > 127 &&
            !/[\u0C00-\u0C7F]/.test(ch)
        ) {
            suspicious++;
        }
    }

    const ratio = suspicious / Math.max(t.length, 1);

    if (ratio > 0.15) {
        score += 3;
    }

    return score;
}

return items.map(item => {

    const text =
        item.json.text ??
        item.json.content ??
        item.json.extracted_text ??
        "";

    const score = corruptionScore(text);

    const needsOCR =
        text.trim().length === 0 ||
        text.length < 50 ||
        score >= 3;

    return {
        json: {
            ...item.json,
            text,
            corruption_score: score,
            needs_ocr: needsOCR
        },
        binary: item.binary
    };
});