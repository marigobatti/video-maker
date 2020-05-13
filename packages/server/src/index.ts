import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import config from './config';

// Start the server
app.listen(config.port, () => {
    logger.info('Express server started on port: ' + config.port);
});
