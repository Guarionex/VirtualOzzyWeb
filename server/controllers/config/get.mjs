import config from 'config';

export const handler = () => ({
    baseUrl: config.get('baseUrl')
});
