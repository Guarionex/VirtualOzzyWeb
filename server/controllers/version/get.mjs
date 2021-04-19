export const handler = () => {
    const gitSha = process.env.GIT_SHA;

    return {
        sha: gitSha ? gitSha : 'unknown'
    };
};
