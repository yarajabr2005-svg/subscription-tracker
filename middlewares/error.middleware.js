const errorMiddleware=(err, req, res, next)=>{
    try{
        let error={...err}; //deconstruct the error
        error.message=err.message;
        console.error(err);

        //Mpngoose bad objectId, this happens when a user tries to access a resource with an invalid id, like /api/v1/subscriptions/1234
        if(err.name==='CastError'){
            const message=`Resource not found with id of ${err.value}`;
            error=new Error(message);
            error.statusCode=404;
        }

        //Mongoose duplicate key, this happens when a user tries to create a subscription with a name that already exists, like /api/v1/subscriptions with body {name: "Netflix"}
        if(err.code===11000){ //violates a unique index constraint
            const message=`Duplicate field value entered`;
            error=new Error(message);
            error.statusCode=400;
        }

        //Mongoose validation error, this happens when a user tries to create a subscription with invalid data, like /api/v1/subscriptions with body {name: ""}
        if(err.name==='ValidationError'){
            const message=Object.values(err.errors).map(val=>val.message).join(', ');
            error=new Error(message);
            error.statusCode=400;
        }

        res.status(error.statusCode || 500).json({
            success:false,
            error: error.message || 'Server Error',
        });

    }catch(error){
        next(error);
    }
};

export default errorMiddleware;