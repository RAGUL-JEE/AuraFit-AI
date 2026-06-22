module.exports = {
    reporter: 'mochawesome',
    'reporter-option': [
        'reportDir=reports',
        'reportFilename=mochawesome',
        'html=true',
        'json=false',
        'overwrite=true'
    ],
    timeout: 60000,
    retries: process.env.RETRY_COUNT || 0,
    parallel: false // Set to true if scaling with Selenium Grid or isolated instances
};
