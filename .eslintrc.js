module.exports = {
    extends: [
        'get-off-my-lawn'
    ],
    rules: {
        'import/extensions': ['error', 'always', {ignorePackages: true}],
        'import/no-useless-path-segments': 0,
        'linebreak-style': 0,
        'no-process-exit': 0,
        'react/forbid-elements': [
            'error', {
                forbid: [
                    'acronyms',
                    'applet',
                    'b',
                    'basefont',
                    'bgsound',
                    'big',
                    'blink',
                    'center',
                    'command',
                    'content',
                    'dir',
                    'element',
                    'font',
                    'frame',
                    'frameset',
                    'i',
                    'image',
                    'isindex',
                    'keygen',
                    'listing',
                    'marquee',
                    'multicol',
                    'nextid',
                    'nobr',
                    'noembed',
                    'plaintext',
                    'shadow',
                    'spacer',
                    'strike',
                    'tt',
                    'xmp'
                ]
            }
        ],
        'react/prop-types': 0,
        'security/detect-unsafe-regex': 0
    }
};
