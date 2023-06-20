module.exports = {
    configureYulOptimizer: true,
    skipFiles: ['testing/'],
    istanbulFolder: './coverage',
    istanbulReporter: ['lcov', 'text'],
};
