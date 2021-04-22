export const getConfig = () => ({...process.env.CONFIG});

export const findSelectOptionByValue = (value, options) =>
    value && options.find((option) => option.value && option.value.toString() === value.toString());

export const isSuccessHttpStatus = (statusCode) => statusCode >= 200 && statusCode <= 299;

export const caseInsensitiveEquals = (a, b) => Boolean(a && b && a.toLowerCase() === b.toLowerCase());
