const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

const orderSchema = new mongoose.Schema({
    _id:{
        type:true,
        default:uuidv4
    },

    userId:{
        type:String,
        ref: 'User',
        required: true,
        index:true
    },
    status:{
        type:String,
        enum:['pending', 'paid', 'delivered', 'cancelled'],
        default: pending,
        index:true
    },
    totalAmont:{
        type:String,
        required:true
    },
    items:[{
        produtcId:{
            type:String,
            ref: 'Product',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:String,
            required:true
        }
    }],
},{
    timestamps:true
});

orderSchema.index({'items.productId': 1});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;