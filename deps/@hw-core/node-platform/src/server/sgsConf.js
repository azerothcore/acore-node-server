import {
    GraphQLString,
    GraphQLInputObjectType
} from 'graphql';
import {
    GraphQLUpload
} from 'apollo-server-express';

export default {
    customTypes: {
        "Upload": GraphQLUpload,
        "pictureType": GraphQLString,
        "pictureTypeInput": new GraphQLInputObjectType({
            name: "pictureTypeInput",
            fields: {
                file: {
                    type: GraphQLUpload,
                    description: "Upload Apollo Scalar type, needs apollo-client-upload"
                },
                encoded: {
                    type: GraphQLString,
                    description: "Alternative to Apollo Upload, if set will be used instead of file field"
                }
            }
        })
    }
}
