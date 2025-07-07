import mongoose from 'mongoose';

const RepoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // reference to the User collection
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    language: {
        type: String,
    },
    stars: {
        type: Number,
    },
    isPrivate: {
        type: Boolean,
    },
    lastUpdated: {
        type: String,
    },
    tags: {
        type: [String],
    },
    graph: {
        type: Object,
        required: true,
    },
    commitHash: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const Repo = mongoose.model('Repo', RepoSchema);

export { Repo }