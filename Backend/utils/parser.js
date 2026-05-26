const TOKEN_REGEX =
   /!(video|embed)?\[([^\]]*?)\]\((.*?)\)/g

function createTextBlock(text) {
    return {
        type: 'text',
        value: text
    };
}

function createMediaBlock(type, label, url) {

    const block = {
        type,
        url: url.trim()
    };

    if (type === 'image') {
        block.alt = label.trim();
    } else {
        block.caption = label.trim();
    }

    return block;
}

export function parseContent(rawContent) {

    if (!rawContent || typeof rawContent !== 'string') {
        return [];
    }

    const blocks = [];

    let currentIndex = 0;
    let match;

    while ((match = TOKEN_REGEX.exec(rawContent)) !== null) {

        const fullMatch = match[0];
        const mediaType = match[1];
        const label = match[2];
        const url = match[3].trim()

        // text before token
        const textBefore = rawContent
            .slice(currentIndex, match.index)
            .trim();

        if (textBefore) {
            blocks.push(createTextBlock(textBefore));
        }

        // skip malformed URLs
        if (!url || !url.trim()) {
            currentIndex = TOKEN_REGEX.lastIndex;
            continue;
        }

        const type = mediaType || 'image';

        blocks.push(
            createMediaBlock(type, label, url)
        );

        currentIndex = TOKEN_REGEX.lastIndex;
    }

    // trailing text
    const remainingText = rawContent
        .slice(currentIndex)
        .trim();

    if (remainingText) {
        blocks.push(createTextBlock(remainingText));
    }

    return blocks;
}