import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/logging';
import authorRoutes from './routes/Author';



const router = express();

mongoose.connect(config.mongo.url, {retryWrites: true, w: 'majority'}).then(() => {
 Logging.info(`connected`)
 StartServer();  
}).catch((error) => {
   console.log(error) 
}); 


// STart server only if mongoose works

const StartServer = () => {
    router.use( (req, res, next) => {
        Logging.info(`Incoming -> Method: [${req.method} - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] `);

        res.on('finish', () => {
        Logging.info(`Incoming -> Method: [${req.method} - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Statuscode: [${req.statusCode}] `); 
        });

        next();
    });


    router.use(express.urlencoded({ extended:true }));
    router.use(express.json());


    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }

        next();
    });


    /**Routes */
  router.use('/authors', authorRoutes);
  router.use('/books', bookRoutes);
   



//  Health Check

router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong'}));

///** Error handling */
router.use((req, res, next) => {
    const error = new Error('Not found');

    Logging.error(error);  

    res.status(404).json({
        message: error.message
    });
});

router.listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
}




