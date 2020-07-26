module.exports = {
    extends: [
        "get-off-my-lawn"
    ],
    rules: {
        'import/extensions': ['error', 'always', {ignorePackages: true}],
        'react/prop-types': 0,
        'linebreak-style': 0,
        'import/no-useless-path-segments': 0,
        'security/detect-unsafe-regex': 0,
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
        ]
    }
}
