let shuttingDown = false;

const waitFourSecondsForKubernetesReadinessProbeToFail = () => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, 4000);
});

const appIsNotRunningLocally = () => !process.env.DEV_SERVER;

export const serverIsGracefullyShuttingDown = () => shuttingDown;

export const shutdown = async (server) => {
    let failed = false;

    if (serverIsGracefullyShuttingDown()) {
        return undefined;
    }

    shuttingDown = true;

    if (appIsNotRunningLocally()) {
        await waitFourSecondsForKubernetesReadinessProbeToFail();
    }

    try {
        await server.stop();
    } catch (error) {
        failed = true;
    }

    if (failed) {
        return process.exit(1);
    }

    return process.exit(0);
};
