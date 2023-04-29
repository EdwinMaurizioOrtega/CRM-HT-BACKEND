import mongoose from 'mongoose';

const imageSchema = mongoose.Schema({
    codeProduct: {type: String, default: ''},
    nameImage: {type: String, default: ''},
    fileImage: {type: String, default: ''},
    createdAt: {
        type: Date, default: new Date(),
    },
})

const Image = mongoose.model('ImageProductHanaDB', imageSchema);

export default Image;