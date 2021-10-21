import 'jest-extended';
import 'jest-chain';

const getRootElementNameFromComponentId = (componentId) => {
    const hierarchy = componentId.split('__');
    const elementNameWithClassSuffix = hierarchy[hierarchy.length - 1];

    return elementNameWithClassSuffix.split('-')[0];
};

const toBeStyledFrom = (received, argument) => {
    const baseName = getRootElementNameFromComponentId(argument.componentStyle.componentId);
    const foldedComponents = received.type.foldedComponentIds;

    if (!foldedComponents.length) {
        return {
            message: () => `No other styled components were folded into ${received.type.displayName}`,
            pass: false
        };
    }

    const actualName = getRootElementNameFromComponentId(foldedComponents[foldedComponents.length - 1]);

    const pass = actualName === baseName;

    const message = pass ? `${received.type.displayName} was extended from ${baseName}`
        : `Expected ${received.type.displayName} to have been extended from ${baseName} with styled(${baseName}). Instead, it was extended from ${actualName}`;

    return {
        message: () => message,
        pass
    };
};

expect.extend({toBeStyledFrom});
