const Schema = Object.assign(
  jest.fn().mockImplementation(() => ({})),
  {
    Types: {
      ObjectId: "ObjectId"
    }
  }
);

const mockMongoose = {
  connect: jest.fn(),
  connection: {},
  models: {},
  model: jest.fn((name) => ({
    modelName: name,
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  })),
  Schema
};

export default mockMongoose;
export { Schema };
export const model = mockMongoose.model;
export const models = mockMongoose.models;
export const connect = mockMongoose.connect;
