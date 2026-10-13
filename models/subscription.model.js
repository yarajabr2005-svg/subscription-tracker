import mongoose from 'mongoose';

const subscriptionSchema=new mongoose.Schema({

    name: {
        type:String,
        required: [true, 'Subscription Name is required'],
        trim :true,
        minlength:2,
        maxlength:100,
    },
    price: {
        type:Number,
        required: [true, 'Subscription Price is required'],
        min: [0, 'Price must be a positive number'],
    },

    currency:{
        type:String,
        enum: ['USD', 'EUR', 'GBP'],
        default: 'USD',
    },

    frequency: { // how often u are getting charged for the subscription
        type:String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly',
    },

    category: {
        type:String,
        enum: ['sports', ' news', 'entertainment', 'lifestyle', 'technology', 'finance','politics', 'other'],
        required: [true, 'Subscription Category is required'],
    },

    paymentMethod:{
        type:String,
        required:true,
        trim:true,
    },

    status:{
        type:String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active',
    },

    startDate: {
        type: Date,
        required: [true, 'Subscription Start Date is required'],
        validate: {
            validator: (value) => {value <= new Date()},
            message: 'Start date must be in the past',
        }

    },

    renewalDate: {
        type: Date,
        required: [true, 'Subscription Renewal Date is required'],
        validate: {
            validator: function (value) { //not sure if arrow function here works with this.
                value > this.startDate;
            },
            message: 'Renewal date must be after the start date',
        },

    },

    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true,
    }
}, {timestamps:true});

// this function runs before saving a subscription document to the database. 
subscriptionSchema.pre('save', function (next) { //AutoCalculate renewalDate if missing
    if(!this.renewalDate){
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };

    this.renewalDate = new Date(this.startDate)
    this.renewalDate.setDate(this.startDate.getDate() + renewalPeriods[this.frequency]);

    }

    //Auto-update status if renewal date has passed.
    if(this.renewalDate< new Date()){
    this.status='expired';
    }

    next();

});

const subscription=mongoose.model('Subscription', subscriptionSchema);
export default subscription;

